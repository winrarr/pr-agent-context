# Releasing

Normal development does not require version changes or packaging. Pull requests and `main` are verified automatically. Changes accumulate on `main`, and Release Please maintains a release pull request containing the next version, changelog, and synchronized versions in `package.json`, `package-lock.json`, and `public/manifest.json`.

Use Conventional Commit prefixes so the release pull request can choose the version:

- `fix: ...` creates a patch release;
- `feat: ...` creates a minor release;
- `feat!: ...` or a `BREAKING CHANGE:` footer creates a major release;
- `docs:`, `test:`, `refactor:`, and `chore:` describe non-user-facing work.

Merge ordinary changes whenever they are ready. Merge the automated release pull request only when the accumulated changes should ship. That merge creates a GitHub release, verifies and packages the tagged source, attaches the ZIP to the release, and submits it to the Chrome Web Store for review.

## One-time Chrome Web Store setup

The automated API flow updates an existing store item. Create the item and complete its Store listing, Privacy, and Distribution tabs in the Chrome Web Store Developer Dashboard before enabling publishing.

1. Enable two-step verification on the publisher Google account.
2. Create a Google Cloud project and enable the Chrome Web Store API.
3. Create a service account without project roles.
4. Add the service account email to the publisher in the Chrome Web Store Developer Dashboard.
5. Configure GitHub-to-Google Workload Identity Federation for this repository and grant the GitHub principal `roles/iam.workloadIdentityUser` on the service account. Restrict the provider to this repository.
6. Create a GitHub environment named `chrome-web-store`. Add a required reviewer so publishing always requires an explicit approval.
7. Add these environment variables:
   - `GCP_WORKLOAD_IDENTITY_PROVIDER`: full provider resource name, such as `projects/123456789/locations/global/workloadIdentityPools/github/providers/pr-agent-context`;
   - `CWS_SERVICE_ACCOUNT_EMAIL`: the linked Google service account email;
   - `CWS_PUBLISHER_ID`: the publisher ID from Publisher → Settings;
   - `CWS_EXTENSION_ID`: the item ID from the Developer Dashboard or store URL.

The workflow uses short-lived identity tokens; it does not store a Google service-account key in GitHub.

The first publication and any visibility change may need to be published manually in the Developer Dashboard. Subsequent releases retain the existing visibility and are submitted automatically when the protected publishing job is approved.

## Local package

To verify the exact release process and produce a ZIP without publishing:

```bash
npm run package
```

This local command requires the `zip` executable. The artifact is written to `artifacts/pr-agent-context-<version>.zip` with `manifest.json` at its root.

## Failure behavior

Verification, packaging, authentication, upload, and submission are separate workflow steps. A failed step stops the release. The package remains attached to the GitHub release if store submission fails, so it can be inspected or uploaded manually. Chrome Web Store validation warnings block automated submission and must be resolved rather than silently accepted.
