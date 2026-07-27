# Backlog

This file tracks agreed outcomes that are not implemented yet. Completed work belongs in code, tests, release notes, or the relevant durable documentation rather than remaining here.

## Publish PR Agent Context in the Chrome Web Store

**Outcome:** Users can install a policy-compliant, branded extension from the Chrome Web Store, and maintainers can exercise the automated release path end to end.

Remaining work:

- [ ] Create store-ready branding and assets: PNG extension icons at 16, 32, 48, and 128 pixels; manifest icon declarations; at least one current 1280×800 store screenshot; and the required promotional tile. Update the build to copy packaged public assets.
- [ ] Publish a public privacy policy describing GitHub page content, review text, optional diffs, clipboard use, same-origin requests, local processing, retention, and sharing. Make the in-extension disclosure and Developer Dashboard declarations consistent with it.
- [ ] Register the publisher account, enable two-step verification, create the store item, and complete its Listing, Privacy, and Distribution tabs.
- [ ] Configure the Chrome Web Store API, linked service account, repository-restricted Workload Identity Federation, protected `chrome-web-store` GitHub environment, and the variables documented in [Releasing](releasing.md).
- [ ] Perform the required initial manual publication, then run one automated patch release and confirm that the tagged source, GitHub ZIP, submitted store version, and installed extension all agree.
- [ ] Test the store-installed build on representative public and private pull requests, including metadata-only export, human change requests, review threads, Copilot opt-in, resolved-thread opt-in, and optional diff export.

The account registration, payment, legal policy ownership, listing copy, artwork approval, and Google/GitHub credential setup require the publisher’s decisions or access. Repository implementation can prepare and validate their inputs but must not invent or silently perform those account-level choices.
