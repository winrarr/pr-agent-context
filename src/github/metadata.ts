import type { PullRequestMetadata, PullRequestReference } from "../domain";
import { normalizeText, queryText } from "../shared/dom";

interface EmbeddedPullRequest {
  title?: string;
  author?: { login?: string };
  baseBranch?: string;
  headBranch?: string;
  headSha?: string;
}

function findPullRequest(value: unknown): EmbeddedPullRequest | null {
  if (!value || typeof value !== "object") return null;

  const record = value as Record<string, unknown>;
  if (typeof record.number === "number" && typeof record.title === "string") {
    return record as EmbeddedPullRequest;
  }

  for (const child of Object.values(record)) {
    const result = findPullRequest(child);
    if (result) return result;
  }

  return null;
}

function readEmbeddedPullRequest(
  document: Document,
): EmbeddedPullRequest | null {
  const scripts = document.querySelectorAll<HTMLScriptElement>(
    "script[type='application/json'][data-target$='embeddedData']",
  );

  for (const script of scripts) {
    try {
      const pullRequest = findPullRequest(
        JSON.parse(script.textContent || "null"),
      );
      if (pullRequest) return pullRequest;
    } catch {
      continue;
    }
  }

  return null;
}

export function parsePullRequestMetadata(
  document: Document,
  reference: PullRequestReference,
): PullRequestMetadata {
  const embedded = readEmbeddedPullRequest(document);
  const heading = queryText(document, "h1").replace(/\s+#\d+$/, "");
  const title = normalizeText(embedded?.title) || heading || document.title;

  return {
    ...reference,
    title,
    ...(embedded?.author?.login ? { author: embedded.author.login } : {}),
    ...(embedded?.baseBranch ? { baseBranch: embedded.baseBranch } : {}),
    ...(embedded?.headBranch ? { headBranch: embedded.headBranch } : {}),
    ...(embedded?.headSha ? { headSha: embedded.headSha } : {}),
  };
}
