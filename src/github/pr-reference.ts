import type { PullRequestReference } from "../domain";

const PULL_REQUEST_PATH = /^\/([^/]+)\/([^/]+)\/pull\/(\d+)(?:\/|$)/;

export function parsePullRequestReference(
  url: URL,
): PullRequestReference | null {
  const match = PULL_REQUEST_PATH.exec(url.pathname);
  if (!match) return null;

  const [, owner, repository, numberText] = match;
  if (!owner || !repository || !numberText) return null;

  const number = Number(numberText);
  const basePath = `/${owner}/${repository}/pull/${number}`;

  return {
    owner,
    repository,
    number,
    basePath,
    url: `${url.origin}${basePath}`,
  };
}
