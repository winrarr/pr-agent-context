import type {
  ExportOptions,
  PullRequestContext,
  PullRequestReference,
} from "../domain";
import { parseHtml } from "../shared/dom";
import { buildFilePathMap } from "./file-path-map";
import { parsePullRequestMetadata } from "./metadata";
import {
  filterReviewSummaries,
  parseReviewSummaries,
} from "./review-summaries";
import { findReviewThreadElements, parseReviewThread } from "./review-threads";

export interface CollectionDependencies {
  fetch: typeof fetch;
  currentDocument: Document;
  currentUrl: URL;
}

async function fetchText(fetcher: typeof fetch, url: string): Promise<string> {
  const response = await fetcher(url, {
    credentials: "same-origin",
    redirect: "follow",
    headers: { Accept: "text/html" },
  });
  if (!response.ok)
    throw new Error(`GitHub returned ${response.status} for ${url}`);
  return response.text();
}

async function loadConversation(
  reference: PullRequestReference,
  dependencies: CollectionDependencies,
): Promise<Document> {
  if (dependencies.currentUrl.pathname === reference.basePath)
    return dependencies.currentDocument;
  return parseHtml(await fetchText(dependencies.fetch, reference.basePath));
}

export async function collectPullRequestContext(
  reference: PullRequestReference,
  options: ExportOptions,
  dependencies: CollectionDependencies,
): Promise<PullRequestContext> {
  const [conversation, filesHtml, diff] = await Promise.all([
    loadConversation(reference, dependencies),
    options.includeReviewThreads
      ? fetchText(dependencies.fetch, `${reference.basePath}/files`)
      : Promise.resolve(undefined),
    options.includeDiff
      ? fetchText(dependencies.fetch, `${reference.basePath}.diff`)
      : Promise.resolve(undefined),
  ]);
  const paths = filesHtml
    ? buildFilePathMap(parseHtml(filesHtml))
    : new Map<string, string>();
  const threadElements = options.includeReviewThreads
    ? findReviewThreadElements(conversation).filter(
        (element) =>
          options.includeResolved || element.dataset.resolved !== "true",
      )
    : [];
  const threads = await Promise.all(
    threadElements.map(async (element, index) => {
      const initialThread = parseReviewThread(element, paths, index);
      if (initialThread.comments.length > 0) return initialThread;

      const deferredUrl = element.dataset.deferredContentUrl;
      if (!deferredUrl) return initialThread;

      const deferredDocument = parseHtml(
        await fetchText(dependencies.fetch, deferredUrl),
      );
      return parseReviewThread(element, paths, index, deferredDocument);
    }),
  );

  return {
    pullRequest: parsePullRequestMetadata(conversation, reference),
    ...(options.includeReviewSummaries
      ? {
          reviews: filterReviewSummaries(
            parseReviewSummaries(conversation, reference.url),
            options,
          ),
        }
      : {}),
    ...(options.includeReviewThreads ? { threads } : {}),
    ...(diff ? { diff } : {}),
    exportedAt: new Date().toISOString(),
  };
}
