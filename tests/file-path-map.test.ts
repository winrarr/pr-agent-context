import {
  buildFilePathMap,
  findPathCandidate,
  resolveThreadPath,
} from "../src/github/file-path-map";
import { documentFrom, fixture } from "./test-helpers";

describe("file path resolution", () => {
  const files = documentFrom(fixture("files-page.html"));
  const paths = buildFilePathMap(files);

  it("indexes authoritative full paths by diff anchor", () => {
    expect(paths.get("diff-abc123")).toBe(
      "packages/really/long/source/path/review-target.ts",
    );
    expect(paths.get("diff-def456")).toBe("src/another/complete-path.ts");
  });

  it("does not accept GitHub's abbreviated display path", () => {
    const thread = documentFrom(
      '<a href="/acme/repo/pull/1/files/sha#diff-abc123">…/review-target.ts</a>',
    );
    expect(findPathCandidate(thread)).toBeNull();
    expect(resolveThreadPath(thread, paths)).toBe(
      "packages/really/long/source/path/review-target.ts",
    );
  });

  it("prefers full metadata over displayed text", () => {
    const thread = documentFrom(
      '<a title="src/full/review-target.ts" href="#diff-abc123">…/review-target.ts</a>',
    );
    expect(resolveThreadPath(thread, new Map())).toBe(
      "src/full/review-target.ts",
    );
  });

  it("accepts complete paths for files at the repository root", () => {
    const thread = documentFrom(
      '<a title="README.md" href="#diff-root">README.md</a>',
    );
    expect(resolveThreadPath(thread, new Map())).toBe("README.md");
  });
});
