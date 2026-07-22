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

export interface PullRequestContext {
  pullRequest: PullRequestMetadata;
  threads: ReviewThread[];
  diff?: string;
  exportedAt: string;
}

export interface ExportOptions {
  includeResolved: boolean;
  includeDiff: boolean;
}
