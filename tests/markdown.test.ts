import { renderAgentMarkdown } from "../src/export/markdown";

describe("renderAgentMarkdown", () => {
  it("renders agent-readable metadata, thread state, and complete location", () => {
    const markdown = renderAgentMarkdown({
      pullRequest: {
        owner: "acme",
        repository: "widgets",
        number: 7,
        basePath: "/acme/widgets/pull/7",
        url: "https://github.com/acme/widgets/pull/7",
        title: "Fix path export",
        author: "octocat",
        baseBranch: "main",
        headBranch: "fix/path",
      },
      exportedAt: "2026-07-22T10:00:00.000Z",
      reviews: [
        {
          id: "3",
          author: "reviewer",
          body: "The edge case still needs coverage.",
          state: "changes_requested",
        },
      ],
      threads: [
        {
          id: "1",
          path: "src/a/complete/file.ts",
          line: "+20",
          resolved: false,
          outdated: false,
          comments: [{ id: "2", author: "reviewer", body: "Please fix this." }],
        },
      ],
    });

    expect(markdown).toContain("# Fix path export");
    expect(markdown).toContain("## Review summaries (1)");
    expect(markdown).toContain("@reviewer · changes requested");
    expect(markdown).toContain("The edge case still needs coverage.");
    expect(markdown).toContain("`src/a/complete/file.ts:+20`");
    expect(markdown).toContain("Status: unresolved");
    expect(markdown).toContain("Please fix this.");
  });

  it("omits unselected review sections from a metadata-only export", () => {
    const markdown = renderAgentMarkdown({
      pullRequest: {
        owner: "acme",
        repository: "widgets",
        number: 7,
        basePath: "/acme/widgets/pull/7",
        url: "https://github.com/acme/widgets/pull/7",
        title: "Metadata only",
      },
      exportedAt: "2026-07-22T10:00:00.000Z",
    });

    expect(markdown).toContain("# Metadata only");
    expect(markdown).not.toContain("## Review summaries");
    expect(markdown).not.toContain("## Review threads");
  });
});
