import type {
  ReviewSummaryCounts,
  ExportOptions,
  PullRequestReview,
  PullRequestReviewState,
} from "../domain";
import { normalizeText, queryText } from "../shared/dom";

const REVIEW_SELECTOR = "[id^='pullrequestreview-'].js-comment";

function reviewState(root: ParentNode): PullRequestReviewState {
  if (root.querySelector(".color-bg-danger-emphasis"))
    return "changes_requested";
  if (root.querySelector(".color-bg-success-emphasis")) return "approved";

  const text = normalizeText(root.textContent).toLowerCase();
  if (text.includes("requested changes")) return "changes_requested";
  if (text.includes("approved these changes")) return "approved";
  return "commented";
}

function reviewBody(root: ParentNode): string {
  const markdown = root
    .querySelector<HTMLElement>(
      "clipboard-copy[aria-label='Copy Markdown'][value]",
    )
    ?.getAttribute("value");
  return markdown?.trim() || queryText(root, ".js-comment-body");
}

export function parseReviewSummaries(
  document: Document,
  baseUrl?: string,
): PullRequestReview[] {
  const reviews = new Map<string, PullRequestReview>();

  for (const element of document.querySelectorAll<HTMLElement>(
    REVIEW_SELECTOR,
  )) {
    const id = element.id.replace(/^pullrequestreview-/, "");
    if (!id || reviews.has(id)) continue;

    const timelineItem = element.closest(".js-timeline-item") ?? element;
    const bodyRoot =
      timelineItem.querySelector<HTMLElement>(
        `.timeline-comment-group[id='pullrequestreview-${id}']`,
      ) ?? element;
    const body = reviewBody(bodyRoot);
    if (!body) continue;

    const submittedAt =
      timelineItem.querySelector("relative-time")?.getAttribute("datetime") ??
      undefined;
    const href =
      timelineItem
        .querySelector<HTMLAnchorElement>(
          `a[id='pullrequestreview-${id}-permalink']`,
        )
        ?.getAttribute("href") ?? undefined;
    const url = href && baseUrl ? new URL(href, baseUrl).toString() : href;

    reviews.set(id, {
      id,
      author: queryText(timelineItem, "a.author") || "Unknown author",
      body,
      state: reviewState(timelineItem),
      ...(submittedAt ? { submittedAt } : {}),
      ...(url ? { url } : {}),
    });
  }

  return [...reviews.values()];
}

function isCopilotReview(review: PullRequestReview): boolean {
  return review.author.toLowerCase().includes("copilot");
}

export function countReviewSummaries(
  reviews: PullRequestReview[],
): ReviewSummaryCounts {
  return reviews.reduce<ReviewSummaryCounts>(
    (counts, review) => {
      counts.total += 1;
      if (isCopilotReview(review)) {
        counts.copilot += 1;
      } else if (review.state === "changes_requested") {
        counts.changesRequested += 1;
      } else {
        counts.otherHuman += 1;
      }
      return counts;
    },
    { total: 0, changesRequested: 0, otherHuman: 0, copilot: 0 },
  );
}

export function filterReviewSummaries(
  reviews: PullRequestReview[],
  options: Pick<ExportOptions, "includeAllReviews" | "includeCopilotReviews">,
): PullRequestReview[] {
  return reviews.filter((review) => {
    if (isCopilotReview(review)) return options.includeCopilotReviews;
    return review.state === "changes_requested" || options.includeAllReviews;
  });
}
