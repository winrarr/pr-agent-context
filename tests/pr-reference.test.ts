import { parsePullRequestReference } from "../src/github/pr-reference";

describe("parsePullRequestReference", () => {
  it("recognizes every pull request tab", () => {
    expect(
      parsePullRequestReference(
        new URL("https://github.com/acme/widgets/pull/42/files"),
      ),
    ).toEqual({
      owner: "acme",
      repository: "widgets",
      number: 42,
      basePath: "/acme/widgets/pull/42",
      url: "https://github.com/acme/widgets/pull/42",
    });
  });

  it("ignores non-pull-request pages", () => {
    expect(
      parsePullRequestReference(
        new URL("https://github.com/acme/widgets/issues/42"),
      ),
    ).toBeNull();
  });
});
