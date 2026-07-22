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

  mountExporter(async (options) => {
    const currentReference = parsePullRequestReference(
      new URL(window.location.href),
    );
    if (!currentReference)
      throw new Error("Open a GitHub pull request before exporting.");

    const context = await collectPullRequestContext(currentReference, options, {
      fetch: window.fetch.bind(window),
      currentDocument: document,
      currentUrl: new URL(window.location.href),
    });
    await navigator.clipboard.writeText(renderAgentMarkdown(context));
    return { threadCount: context.threads.length };
  });
}

initialize();
document.addEventListener("turbo:load", initialize);
document.addEventListener("pjax:end", initialize);
