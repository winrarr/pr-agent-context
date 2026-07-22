# Project guidance

PR Agent Context is a Manifest V3 Chrome extension that turns authenticated GitHub pull request pages into local, agent-ready Markdown. The trust boundary is strict: private repository data may be read from same-origin GitHub routes and written to the clipboard, but must not be transmitted elsewhere or persisted.

## Components

- `src/github/` owns GitHub URL recognition, authenticated page collection, markup parsing, and full-path resolution.
- `src/export/` turns normalized domain data into output formats.
- `src/content/` owns the injected Shadow DOM interface and browser integration.
- `src/domain.ts` is the normalized contract between collection and export.
- `tests/fixtures/` represents supported GitHub markup shapes. Keep fixtures minimal and free of credentials or private content.
- `public/manifest.json` is the source manifest; `dist/` is generated and must not be edited.

Keep GitHub-specific selectors out of UI and export code. Prefer pure parsers and early failure over silently returning misleading context. Any GitHub markup bug fix should add or update a focused fixture reproducing the shape.

## Canonical commands

- `npm run dev` continuously rebuilds `dist/` for local browser testing.
- `npm run format` formats the project.
- `npm test` runs parser and output tests.
- `npm run verify` runs every required check and creates the production bundle.

Update existing documentation when commands or boundaries change. Record implementation details in code and tests; add durable architecture information to `docs/architecture.md` only when it affects component boundaries or data flow.
