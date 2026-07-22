export function parseHtml(html: string): Document {
  return new DOMParser().parseFromString(html, "text/html");
}

export function normalizeText(value: string | null | undefined): string {
  return (value ?? "").replace(/\s+/g, " ").trim();
}

export function queryText(root: ParentNode, selector: string): string {
  return normalizeText(root.querySelector(selector)?.textContent);
}

export function isCompletePath(
  value: string | null | undefined,
): value is string {
  if (!value) return false;
  const path = value.trim();
  return path.length > 0 && !path.includes("...") && !path.includes("…");
}
