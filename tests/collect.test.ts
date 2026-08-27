import { collectPullRequestContext } from "../src/github/collect";
import { parsePullRequestReference } from "../src/github/pr-reference";
import { fixture } from "./test-helpers";

describe("collectPullRequestContext", () => {
  const url = new URL("https://github.com/octocat/example/pull/42/files");
  const reference = parsePullRequestReference(url)!;

  it("collects all threads and hydrates deferred comments using same-origin requests", async () => {
    const responses = new Map([
      [reference.basePath, fixture("conversation-page.html")],
      [`${reference.basePath}/files`, fixture("files-page.html")],
      [`${reference.basePath}/threads/9002`, fixture("deferred-thread.html")],
      [`${reference.basePath}.diff`, "diff --git a/one.ts b/one.ts\n+added"],
    ]);
    const fetcher = vi.fn(async (input: RequestInfo | URL) => {
      const path = new URL(String(input), url.origin).pathname;
      const body = responses.get(path);
      return new Response(body ?? "missing", { status: body ? 200 : 404 });
    });

    const { context, availableCounts } = await collectPullRequestContext(
      reference,
      {
        includeReviewSummaries: true,
        includeReviewThreads: true,
        includeResolved: true,
        includeAllReviews: false,
        includeCopilotReviews: false,
        includeDiff: true,
      },
      {
        fetch: fetcher as typeof fetch,
        currentDocument: document,
        currentUrl: url,
      },
    );

    expect(context.pullRequest).toMatchObject({
      title: "Make the exporter reliable",
      author: "octocat",
      headSha: "abcde12345",
    });
    expect(context.threads).toHaveLength(2);
    expect(availableCounts).toEqual({
      reviewSummaries: {
        total: 1,
        changesRequested: 1,
        otherHuman: 0,
        copilot: 0,
      },
      reviewThreads: {
        total: 2,
        unresolved: 1,
        resolved: 1,
        outdated: 1,
      },
    });
    expect(context.reviews).toEqual([
      expect.objectContaining({
        id: "303",
        state: "changes_requested",
        body: "Please address the failing edge case before merging.",
      }),
    ]);
    expect(context.threads?.[1]?.comments[0]?.body).toBe(
      "The deferred comment body.",
    );
    expect(context.diff).toContain("diff --git");
    expect(fetcher).toHaveBeenCalledWith(
      "/octocat/example/pull/42/threads/9002",
      expect.objectContaining({ credentials: "same-origin" }),
    );
  });

  it("does not request resolved thread bodies when they are excluded", async () => {
    const fetcher = vi.fn(async (input: RequestInfo | URL) => {
      const path = new URL(String(input), url.origin).pathname;
      const body =
        path === reference.basePath
          ? fixture("conversation-page.html")
          : path === `${reference.basePath}/files`
            ? fixture("files-page.html")
            : null;
      return new Response(body ?? "unexpected", { status: body ? 200 : 500 });
    });

    const { context } = await collectPullRequestContext(
      reference,
      {
        includeReviewSummaries: true,
        includeReviewThreads: true,
        includeResolved: false,
        includeAllReviews: false,
        includeCopilotReviews: false,
        includeDiff: false,
      },
      {
        fetch: fetcher as typeof fetch,
        currentDocument: document,
        currentUrl: url,
      },
    );

    expect(context.threads).toHaveLength(1);
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it("collects only PR metadata without requesting files when review sections are disabled", async () => {
    const fetcher = vi.fn(async (input: RequestInfo | URL) => {
      const path = new URL(String(input), url.origin).pathname;
      const body =
        path === reference.basePath ? fixture("conversation-page.html") : null;
      return new Response(body ?? "unexpected", { status: body ? 200 : 500 });
    });

    const { context, availableCounts } = await collectPullRequestContext(
      reference,
      {
        includeReviewSummaries: false,
        includeReviewThreads: false,
        includeResolved: false,
        includeAllReviews: false,
        includeCopilotReviews: false,
        includeDiff: false,
      },
      {
        fetch: fetcher as typeof fetch,
        currentDocument: document,
        currentUrl: url,
      },
    );

    expect(context.pullRequest.title).toBe("Make the exporter reliable");
    expect(context.reviews).toBeUndefined();
    expect(context.threads).toBeUndefined();
    expect(context.diff).toBeUndefined();
    expect(availableCounts.reviewSummaries.total).toBe(1);
    expect(availableCounts.reviewThreads).toMatchObject({
      total: 2,
      unresolved: 1,
      resolved: 1,
    });
    expect(fetcher).toHaveBeenCalledTimes(1);
  });
});
