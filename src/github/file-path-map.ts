import { isCompletePath, normalizeText } from "../shared/dom";

export type FilePathMap = ReadonlyMap<string, string>;

function anchorFromHref(href: string | null): string | null {
  if (!href) return null;
  const match = href.match(/#(diff-[a-f0-9]+)/i);
  return match?.[1] ?? null;
}

function addPath(
  map: Map<string, string>,
  anchor: string | null,
  path: string | null,
): void {
  if (!anchor || !isCompletePath(path)) return;
  map.set(anchor, path.trim());
}

export function buildFilePathMap(document: Document): FilePathMap {
  const paths = new Map<string, string>();

  for (const header of document.querySelectorAll<HTMLElement>(
    "[data-anchor][data-path]",
  )) {
    addPath(paths, header.dataset.anchor ?? null, header.dataset.path ?? null);
  }

  for (const entry of document.querySelectorAll<HTMLElement>(
    "copilot-diff-entry[data-file-path]",
  )) {
    const file = entry.querySelector<HTMLElement>("[id^='diff-']");
    addPath(paths, file?.id ?? null, entry.dataset.filePath ?? null);
  }

  for (const item of document.querySelectorAll<HTMLElement>(
    "[id^='file-tree-item-diff-']",
  )) {
    const anchor = anchorFromHref(
      item.querySelector("a[href*='#diff-']")?.getAttribute("href") ?? null,
    );
    const path = normalizeText(
      item.querySelector("[data-filterable-item-text]")?.textContent,
    );
    addPath(paths, anchor, path);
  }

  return paths;
}

export function findDiffAnchor(root: ParentNode): string | null {
  const link = root.querySelector("a[href*='#diff-']");
  return anchorFromHref(link?.getAttribute("href") ?? null);
}

export function findPathCandidate(root: ParentNode): string | null {
  const selectors = [
    "[data-path]",
    "[data-file-path]",
    "[data-tagsearch-path]",
    "a[title][href*='#diff-']",
    "a[title][href*='/files/']",
    "a[href*='#diff-']",
    "a[href*='/files/']",
  ];

  for (const selector of selectors) {
    const element = root.querySelector<HTMLElement>(selector);
    if (!element) continue;

    const candidates = [
      element.dataset.path,
      element.dataset.filePath,
      element.dataset.tagsearchPath,
      element.getAttribute("title"),
      element.textContent,
    ];

    const path = candidates.find(isCompletePath);
    if (path) return path.trim();
  }

  return null;
}

export function resolveThreadPath(
  root: ParentNode,
  paths: FilePathMap,
): string {
  const directPath = findPathCandidate(root);
  if (directPath) return directPath;

  const anchor = findDiffAnchor(root);
  return (anchor && paths.get(anchor)) || "Unknown file";
}
