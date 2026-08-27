import { renderAgentMarkdown } from "../export/markdown";
import { collectPullRequestContext } from "../github/collect";
import { parsePullRequestReference } from "../github/pr-reference";
import { mountExporter, unmountExporter } from "./ui";

function initialize(): void {
  const reference = parsePullRequestReference(new URL(window.location.href));
  if (!reference) {
    unmountExporter();
    return;
  }

  mountExporter(
    async (options) => {
      const currentReference = parsePullRequestReference(
        new URL(window.location.href),
      );
      if (!currentReference)
        throw new Error("Open a GitHub pull request before exporting.");

      const { context, availableCounts } = await collectPullRequestContext(
        currentReference,
        options,
        {
          fetch: window.fetch.bind(window),
          currentDocument: document,
          currentUrl: new URL(window.location.href),
        },
      );
      await navigator.clipboard.writeText(renderAgentMarkdown(context));
      return {
        reviewCount: context.reviews?.length ?? 0,
        threadCount: context.threads?.length ?? 0,
        availableCounts,
      };
    },
    async () => {
      const currentReference = parsePullRequestReference(
        new URL(window.location.href),
      );
      if (!currentReference)
        throw new Error("Open a GitHub pull request before exporting.");

      const { availableCounts } = await collectPullRequestContext(
        currentReference,
        {
          includeReviewSummaries: false,
          includeReviewThreads: false,
          includeResolved: false,
          includeAllReviews: false,
          includeCopilotReviews: false,
          includeDiff: false,
        },
        {
          fetch: window.fetch.bind(window),
          currentDocument: document,
          currentUrl: new URL(window.location.href),
        },
      );
      return availableCounts;
    },
  );
}

initialize();
document.addEventListener("turbo:load", initialize);
document.addEventListener("pjax:end", initialize);
