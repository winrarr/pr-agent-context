import type {
  PullRequestContext,
  PullRequestReview,
  ReviewComment,
  ReviewThread,
} from "../domain";

function commentMarkdown(comment: ReviewComment): string {
  const metadata = [
    `@${comment.author}`,
    comment.createdAt ? new Date(comment.createdAt).toISOString() : null,
    comment.url ?? null,
  ].filter(Boolean);
  return [`#### ${metadata.join(" · ")}`, "", comment.body.trim()].join("\n");
}

function threadMarkdown(thread: ReviewThread, index: number): string {
  const states = [
    thread.resolved ? "resolved" : "unresolved",
    thread.outdated ? "outdated" : null,
  ]
    .filter(Boolean)
    .join(", ");
  const location = thread.line ? `${thread.path}:${thread.line}` : thread.path;
  const comments =
    thread.comments.length > 0
      ? thread.comments.map(commentMarkdown).join("\n\n")
      : "_GitHub did not include this thread’s comment body in the page response._";

  return [
    `### ${index + 1}. \`${location}\``,
    "",
    `Status: ${states}`,
    "",
    comments,
  ].join("\n");
}

function reviewMarkdown(review: PullRequestReview): string {
  const states = {
    approved: "approved",
    changes_requested: "changes requested",
    commented: "commented",
  } as const;
  const metadata = [
    `@${review.author}`,
    states[review.state],
    review.submittedAt ? new Date(review.submittedAt).toISOString() : null,
    review.url ?? null,
  ].filter(Boolean);

  return [`### ${metadata.join(" · ")}`, "", review.body.trim()].join("\n");
}

export function renderAgentMarkdown(context: PullRequestContext): string {
  const { pullRequest } = context;
  const branches =
    pullRequest.baseBranch && pullRequest.headBranch
      ? `${pullRequest.headBranch} → ${pullRequest.baseBranch}`
      : null;
  const metadata = [
    `- URL: ${pullRequest.url}`,
    pullRequest.author ? `- Author: @${pullRequest.author}` : null,
    branches ? `- Branches: \`${branches}\`` : null,
    pullRequest.headSha ? `- Head SHA: \`${pullRequest.headSha}\`` : null,
    `- Exported: ${context.exportedAt}`,
  ]
    .filter(Boolean)
    .join("\n");
  const threads =
    context.threads && context.threads.length > 0
      ? context.threads.map(threadMarkdown).join("\n\n---\n\n")
      : "No matching review threads were found.";
  const reviews =
    context.reviews && context.reviews.length > 0
      ? context.reviews.map(reviewMarkdown).join("\n\n---\n\n")
      : "No review summaries with comments were found.";
  const sections = [
    [`# ${pullRequest.title}`, "", metadata].join("\n"),
    context.reviews
      ? [`## Review summaries (${context.reviews.length})`, "", reviews].join(
          "\n",
        )
      : null,
    context.threads
      ? [`## Review threads (${context.threads.length})`, "", threads].join(
          "\n",
        )
      : null,
    context.diff
      ? `## Pull request diff\n\n\`\`\`diff\n${context.diff.trim()}\n\`\`\``
      : null,
  ].filter((section): section is string => section !== null);

  return sections.join("\n\n");
}
