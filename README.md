# PR Agent Context

PR Agent Context is a Chrome extension that copies GitHub pull request review threads into concise Markdown for a coding agent. It uses the GitHub session already active in the browser, so private pull requests work without giving a local CLI or agent a separate GitHub token.

The first release exports:

- pull request identity, branches, author, and head SHA when GitHub exposes them;
- unresolved review threads by default, with an option to include resolved threads;
- every available reply, author, timestamp, and permalink;
- complete repository-relative file paths, even when GitHub displays an abbreviated path;
- line ranges, resolved and outdated state;
- an optional full pull request diff.

All processing happens locally. The extension sends no pull request content to another service.

## Install locally

Prerequisites: Node.js 22 or newer and npm.

```bash
npm install
npm run build
```

Then:

1. Open `chrome://extensions`.
2. Enable **Developer mode**.
3. Select **Load unpacked**.
4. Choose this project's `dist/` directory.
5. Open a GitHub pull request and select **Copy agent context**.

After changing source code, run `npm run build` and reload the extension. For continuous rebuilding, use `npm run dev`.

## Verify changes

```bash
npm run verify
```

This checks formatting, linting, types, parser fixtures, Markdown output, and the production bundle.

## Privacy and permissions

The manifest requests only clipboard access and activation on GitHub pull request pages. Collection uses same-origin `GET` requests to the pull request conversation, files, deferred thread, and optional diff routes. It does not read GitHub cookies, store credentials, mutate a pull request, or contact a third-party server.

The copied Markdown can contain private source code and discussion. Treat it with the same care as the underlying repository.

## Development notes

GitHub's web markup is not a public API. Parser behavior is isolated under `src/github/` and covered by representative HTML fixtures so markup changes can be diagnosed without mixing extraction with interface code. See [Architecture](docs/architecture.md) for the component boundaries and data flow.

Repository operating guidance is in [AGENTS.md](AGENTS.md).
