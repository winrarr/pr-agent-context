export interface PullRequestReference {
  owner: string;
  repository: string;
  number: number;
  basePath: string;
  url: string;
}

export interface PullRequestMetadata extends PullRequestReference {
  title: string;
  author?: string;
  baseBranch?: string;
  headBranch?: string;
  headSha?: string;
}

export interface ReviewComment {
  id: string;
  author: string;
  body: string;
  createdAt?: string;
  url?: string;
}

export interface ReviewThread {
  id: string;
  path: string;
  line?: string;
  resolved: boolean;
  outdated: boolean;
  comments: ReviewComment[];
}

export type PullRequestReviewState =
  "approved" | "changes_requested" | "commented";

export interface PullRequestReview {
  id: string;
  author: string;
  body: string;
  state: PullRequestReviewState;
  submittedAt?: string;
  url?: string;
}

export interface PullRequestContext {
  pullRequest: PullRequestMetadata;
  reviews?: PullRequestReview[];
  threads?: ReviewThread[];
  diff?: string;
  exportedAt: string;
}

export interface ExportOptions {
  includeReviewSummaries: boolean;
  includeReviewThreads: boolean;
  includeResolved: boolean;
  includeAllReviews: boolean;
  includeCopilotReviews: boolean;
  includeDiff: boolean;
}
