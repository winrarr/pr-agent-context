import type {
  PullRequestContext,
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
    context.threads.length > 0
      ? context.threads.map(threadMarkdown).join("\n\n---\n\n")
      : "No matching review threads were found.";
  const diff = context.diff
    ? `\n\n## Pull request diff\n\n\`\`\`diff\n${context.diff.trim()}\n\`\`\``
    : "";

  return [
    `# ${pullRequest.title}`,
    "",
    metadata,
    "",
    `## Review threads (${context.threads.length})`,
    "",
    threads,
    diff,
  ].join("\n");
}
