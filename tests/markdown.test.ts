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
    expect(markdown).toContain("`src/a/complete/file.ts:+20`");
    expect(markdown).toContain("Status: unresolved");
    expect(markdown).toContain("Please fix this.");
  });
});
