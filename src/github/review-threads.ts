import type { ReviewComment, ReviewThread } from "../domain";
import { normalizeText, queryText } from "../shared/dom";
import type { FilePathMap } from "./file-path-map";
import { resolveThreadPath } from "./file-path-map";

const THREAD_SELECTOR = [
  "review-thread-collapsible.review-thread-component",
  ".review-thread-component",
  "details.js-comment-container[data-resolved]",
].join(",");

interface JsonComment {
  id?: string;
  databaseId?: number;
  body?: string;
  createdAt?: string;
  url?: string;
  author?: { login?: string };
}

function commentFromJson(value: unknown): JsonComment[] {
  if (!value || typeof value !== "object") return [];
  const record = value as Record<string, unknown>;
  const comments: JsonComment[] = [];

  if (
    typeof record.body === "string" &&
    record.author &&
    typeof record.author === "object"
  ) {
    comments.push(record as JsonComment);
  }

  for (const child of Object.values(record))
    comments.push(...commentFromJson(child));
  return comments;
}

function parseJsonComments(root: ParentNode): ReviewComment[] {
  const comments = new Map<string, ReviewComment>();
  const scripts = root.querySelectorAll<HTMLScriptElement>(
    "script[type='application/json'][data-target$='embeddedData']",
  );

  for (const script of scripts) {
    try {
      for (const comment of commentFromJson(
        JSON.parse(script.textContent || "null"),
      )) {
        const id = String(comment.databaseId ?? comment.id ?? comments.size);
        if (!comment.body || comments.has(id)) continue;
        comments.set(id, {
          id,
          author: comment.author?.login ?? "Unknown author",
          body: comment.body.trim(),
          ...(comment.createdAt ? { createdAt: comment.createdAt } : {}),
          ...(comment.url ? { url: comment.url } : {}),
        });
      }
    } catch {
      continue;
    }
  }

  return [...comments.values()];
}

function parseDomComments(root: ParentNode): ReviewComment[] {
  const comments: ReviewComment[] = [];

  for (const element of root.querySelectorAll<HTMLElement>(
    ".review-comment.js-comment",
  )) {
    const id =
      element.id.replace(/^discussion_r/, "") || String(comments.length);
    const markdown = element
      .querySelector<HTMLElement>("clipboard-copy[value]")
      ?.getAttribute("value");
    const body = markdown?.trim() || queryText(element, ".js-comment-body");
    if (!body) continue;

    const createdAt =
      element.querySelector("relative-time")?.getAttribute("datetime") ??
      undefined;
    const href = element.querySelector<HTMLAnchorElement>(
      "a[id$='-permalink']",
    )?.href;
    comments.push({
      id,
      author: queryText(element, "a.author") || "Unknown author",
      body,
      ...(createdAt ? { createdAt } : {}),
      ...(href ? { url: href } : {}),
    });
  }

  return comments;
}

function parseLine(root: ParentNode): string | undefined {
  const text = normalizeText(root.textContent);
  const lines = text.match(
    /Comment on lines?\s+([+-]\d+(?:\s+to\s+[+-]\d+)?)/i,
  );
  if (lines?.[1]) return lines[1];
  return /Comment on file/i.test(text) ? "file" : undefined;
}

function threadId(element: Element, index: number): string {
  const frame = element.closest("turbo-frame[id]")?.id;
  return (
    element.getAttribute("data-thread-id") ||
    frame?.replace(/^review-thread-or-comment-id-/, "") ||
    `thread-${index + 1}`
  );
}

export function findReviewThreadElements(document: Document): HTMLElement[] {
  return [...document.querySelectorAll<HTMLElement>(THREAD_SELECTOR)];
}

export function parseReviewThread(
  element: HTMLElement,
  paths: FilePathMap,
  index: number,
  contentRoot: ParentNode = element,
): ReviewThread {
  const jsonComments = parseJsonComments(contentRoot);
  const comments =
    jsonComments.length > 0 ? jsonComments : parseDomComments(contentRoot);
  const line = parseLine(element);

  return {
    id: threadId(element, index),
    path: resolveThreadPath(element, paths),
    ...(line ? { line } : {}),
    resolved: element.dataset.resolved === "true",
    outdated:
      element.matches("[data-outdated='true']") ||
      normalizeText(
        element.querySelector("[title*='Outdated'], .Label")?.textContent,
      ) === "Outdated",
    comments,
  };
}

export function parseReviewThreads(
  document: Document,
  paths: FilePathMap,
): ReviewThread[] {
  return findReviewThreadElements(document).map((element, index) =>
    parseReviewThread(element, paths, index),
  );
}
