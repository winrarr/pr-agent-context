import { buildFilePathMap } from "../src/github/file-path-map";
import {
  countReviewThreads,
  findReviewThreadElements,
  parseReviewThread,
  parseReviewThreads,
} from "../src/github/review-threads";
import { documentFrom, fixture } from "./test-helpers";

describe("review thread parsing", () => {
  const conversation = documentFrom(fixture("conversation-page.html"));
  const paths = buildFilePathMap(documentFrom(fixture("files-page.html")));

  it("parses classic comments with their complete path and raw Markdown", () => {
    const [thread] = parseReviewThreads(conversation, paths);
    expect(thread).toMatchObject({
      id: "9001",
      path: "packages/really/long/source/path/review-target.ts",
      line: "+12 to +14",
      resolved: false,
      comments: [
        {
          id: "101",
          author: "reviewer-one",
          body: "Please keep the complete path.",
          createdAt: "2026-07-20T12:00:00Z",
        },
      ],
    });
  });

  it("parses comments from a deferred React thread response", () => {
    const elements = findReviewThreadElements(conversation);
    const deferred = documentFrom(fixture("deferred-thread.html"));
    const thread = parseReviewThread(elements[1]!, paths, 1, deferred);

    expect(thread).toMatchObject({
      id: "9002",
      path: "src/another/complete-path.ts",
      line: "+8",
      resolved: true,
      outdated: true,
      comments: [
        { id: "202", author: "Copilot", body: "The deferred comment body." },
      ],
    });
  });

  it("counts resolved, unresolved, and outdated threads", () => {
    expect(countReviewThreads(parseReviewThreads(conversation, paths))).toEqual(
      {
        total: 2,
        unresolved: 1,
        resolved: 1,
        outdated: 1,
      },
    );
  });
});
