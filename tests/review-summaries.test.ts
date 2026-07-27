import type { PullRequestReview } from "../src/domain";
import {
  filterReviewSummaries,
  parseReviewSummaries,
} from "../src/github/review-summaries";
import { documentFrom, fixture } from "./test-helpers";

describe("review summary parsing", () => {
  it("parses the raw Markdown attached to a change request", () => {
    const reviews = parseReviewSummaries(
      documentFrom(fixture("review-summary.html")),
      "https://github.com/octocat/example/pull/42",
    );

    expect(reviews).toEqual([
      {
        id: "303",
        author: "reviewer-two",
        body: "Please address the failing edge case before merging.",
        state: "changes_requested",
        submittedAt: "2026-07-21T09:30:00Z",
        url: "https://github.com/octocat/example/pull/42#pullrequestreview-303",
      },
    ]);
  });

  it("includes only human change requests by default", () => {
    const reviews: PullRequestReview[] = [
      {
        id: "1",
        author: "reviewer",
        body: "Please fix this.",
        state: "changes_requested",
      },
      {
        id: "2",
        author: "maintainer",
        body: "Looks good.",
        state: "approved",
      },
      {
        id: "3",
        author: "copilot-pull-request-reviewer[bot]",
        body: "A long generated review.",
        state: "commented",
      },
    ];

    expect(
      filterReviewSummaries(reviews, {
        includeAllReviews: false,
        includeCopilotReviews: false,
      }).map((review) => review.id),
    ).toEqual(["1"]);
  });

  it("keeps human and Copilot review options independent", () => {
    const reviews: PullRequestReview[] = [
      {
        id: "1",
        author: "reviewer",
        body: "Looks good.",
        state: "approved",
      },
      {
        id: "2",
        author: "Copilot",
        body: "A long generated review.",
        state: "commented",
      },
    ];

    expect(
      filterReviewSummaries(reviews, {
        includeAllReviews: true,
        includeCopilotReviews: false,
      }).map((review) => review.id),
    ).toEqual(["1"]);
    expect(
      filterReviewSummaries(reviews, {
        includeAllReviews: false,
        includeCopilotReviews: true,
      }).map((review) => review.id),
    ).toEqual(["2"]);
  });
});
