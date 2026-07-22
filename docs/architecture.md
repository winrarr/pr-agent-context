# Architecture

## Data flow

```text
GitHub PR tab
    │
    ├── current or fetched conversation HTML
    ├── fetched /files HTML ──> diff-anchor → complete-path map
    ├── deferred thread fragments when required
    └── optional .diff response
                 │
                 ▼
        normalized PullRequestContext
                 │
                 ▼
           Markdown renderer
                 │
                 ▼
              clipboard
```

The content script recognizes a pull request URL and mounts an interface in a Shadow DOM boundary. Collection begins only after the user chooses to export.

The conversation page supplies pull request metadata and review-thread shells. GitHub sometimes abbreviates a path in those shells, so the files page is the authoritative path source. Each file's complete path is indexed by its `diff-…` anchor, which is also present in review-thread links. Resolved or collapsed threads may contain only a deferred fragment URL; those fragments are fetched only when the selected export mode needs them.

Parsers produce the types in `src/domain.ts`. The Markdown renderer has no dependency on GitHub markup or browser APIs, and the interface has no knowledge of GitHub selectors.

## Trust boundary

The extension operates entirely within the browser. It may make credentialed, same-origin `GET` requests to paths belonging to the pull request currently open in the tab. It does not access cookie values, call `api.github.com`, accept arbitrary remote URLs, write to GitHub, or persist collected content.

Clipboard output is an intentional user-triggered disclosure. The interface states that collection is local and makes inclusion of the potentially large source diff opt-in.

## GitHub markup compatibility

GitHub web HTML is an internal interface and can change without notice. The extraction boundary therefore uses:

1. semantic attributes such as `data-path`, `data-anchor`, and embedded JSON before displayed text;
2. complete-path validation that rejects both `...` and `…` abbreviations;
3. an anchor-based files-page fallback;
4. fixtures covering classic DOM comments and newer embedded React comment data.

When GitHub changes markup, reproduce the smallest non-sensitive shape in a fixture and repair the relevant parser rather than adding selectors to the content interface.
