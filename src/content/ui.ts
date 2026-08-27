import type { ContextCounts, ExportOptions } from "../domain";

const HOST_ID = "pr-agent-context-root";

const styles = String.raw`
  :host {
    --pac-accent: #1f883d;
    --pac-accent-hover: #1a7f37;
    --pac-bg: #ffffff;
    --pac-fg: #1f2328;
    --pac-muted: #59636e;
    --pac-border: #d1d9e0;
    --pac-overlay: rgb(31 35 40 / 24%);
    color-scheme: light dark;
    font: 14px/1.5 -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  }

  @media (prefers-color-scheme: dark) {
    :host {
      --pac-bg: #0d1117;
      --pac-fg: #f0f6fc;
      --pac-muted: #9198a1;
      --pac-border: #3d444d;
      --pac-overlay: rgb(1 4 9 / 64%);
    }
  }

  * { box-sizing: border-box; }

  button, input { font: inherit; }

  .trigger {
    align-items: center;
    background: var(--pac-accent);
    border: 1px solid rgb(31 35 40 / 15%);
    border-radius: 8px;
    bottom: 24px;
    box-shadow: 0 8px 24px rgb(31 35 40 / 20%);
    color: #fff;
    cursor: pointer;
    display: flex;
    font-weight: 600;
    gap: 8px;
    min-height: 44px;
    padding: 0 16px;
    position: fixed;
    right: 24px;
    transition: background-color 160ms ease, box-shadow 160ms ease;
    z-index: 1000;
  }

  .trigger:hover { background: var(--pac-accent-hover); }
  .trigger:focus-visible, button:focus-visible, input:focus-visible {
    outline: 3px solid #54aeff;
    outline-offset: 2px;
  }

  .trigger svg { fill: currentColor; flex: none; }

  dialog {
    background: var(--pac-bg);
    border: 1px solid var(--pac-border);
    border-radius: 12px;
    box-shadow: 0 16px 48px rgb(1 4 9 / 35%);
    color: var(--pac-fg);
    margin: auto;
    max-width: calc(100vw - 32px);
    padding: 0;
    width: 400px;
  }

  dialog::backdrop { background: var(--pac-overlay); }

  form { padding: 24px; }

  h2 { font-size: 20px; line-height: 1.25; margin: 0 0 8px; }
  p { color: var(--pac-muted); margin: 0 0 20px; }

  fieldset { border: 0; margin: 0; padding: 0; }
  legend { font-weight: 600; margin-bottom: 8px; }

  label {
    align-items: flex-start;
    cursor: pointer;
    display: flex;
    gap: 10px;
    min-height: 44px;
    padding: 10px 0;
  }

  input { height: 18px; margin: 1px 0 0; width: 18px; }
  label.dependent { padding-left: 28px; }
  label:has(input:disabled) { cursor: default; opacity: .6; }
  .option-copy { display: grid; gap: 2px; }
  .option-copy small { color: var(--pac-muted); }

  .status {
    color: var(--pac-muted);
    min-height: 21px;
    padding-top: 8px;
    white-space: pre-line;
  }

  .counts {
    border-top: 1px solid var(--pac-border);
    color: var(--pac-muted);
    margin-top: 16px;
    padding-top: 12px;
  }

  .counts[data-state="error"] { color: #cf222e; }

  .counts-heading {
    color: var(--pac-fg);
    font-size: 12px;
    font-weight: 600;
    letter-spacing: .02em;
    margin-bottom: 8px;
  }

  .count-group {
    background: rgb(127 127 127 / 8%);
    border: 1px solid var(--pac-border);
    border-radius: 8px;
    padding: 8px 10px;
  }

  .count-group + .count-group { margin-top: 6px; }

  .count-group-header {
    align-items: center;
    display: flex;
    gap: 8px;
    justify-content: space-between;
  }

  .count-group-name { color: var(--pac-fg); font-weight: 600; }

  .count-total {
    background: var(--pac-bg);
    border: 1px solid var(--pac-border);
    border-radius: 999px;
    color: var(--pac-fg);
    font-size: 12px;
    font-weight: 600;
    min-width: 24px;
    padding: 1px 7px;
    text-align: center;
  }

  .count-details {
    display: flex;
    flex-wrap: wrap;
    gap: 2px 14px;
    margin-top: 4px;
  }

  .count-detail { font-size: 12px; }
  .count-detail strong { color: var(--pac-fg); font-weight: 600; }

  .status[data-state="error"] { color: #cf222e; }
  .status[data-state="success"] { color: var(--pac-accent); }

  .actions {
    display: flex;
    gap: 8px;
    justify-content: flex-end;
    margin-top: 16px;
  }

  .actions button {
    border: 1px solid var(--pac-border);
    border-radius: 7px;
    cursor: pointer;
    font-weight: 600;
    min-height: 44px;
    padding: 0 16px;
  }

  .cancel { background: transparent; color: var(--pac-fg); }
  .export { background: var(--pac-accent); color: #fff; }
  .export:hover { background: var(--pac-accent-hover); }
  .export:disabled { cursor: wait; opacity: .65; }

  @media (max-width: 520px) {
    .trigger { bottom: 16px; right: 16px; }
    form { padding: 20px; }
  }

  @media (prefers-reduced-motion: reduce) {
    .trigger { transition: none; }
  }
`;

export interface ExportResult {
  reviewCount: number;
  threadCount: number;
  availableCounts: ContextCounts;
}

export type CountsHandler = () => Promise<ContextCounts>;

export type ExportHandler = (options: ExportOptions) => Promise<ExportResult>;

function appendCountGroup(
  root: HTMLElement,
  title: string,
  total: number,
  totalLabel: string,
  details: Array<[string, number]>,
): void {
  const group = document.createElement("div");
  group.className = "count-group";

  const header = document.createElement("div");
  header.className = "count-group-header";
  const name = document.createElement("span");
  name.className = "count-group-name";
  name.textContent = title;
  const totalElement = document.createElement("span");
  totalElement.className = "count-total";
  totalElement.dataset.count = totalLabel;
  totalElement.textContent = String(total);
  totalElement.setAttribute("aria-label", `${title}: ${total} total`);
  header.append(name, totalElement);

  const detailList = document.createElement("div");
  detailList.className = "count-details";
  for (const [label, count] of details) {
    const detail = document.createElement("span");
    detail.className = "count-detail";
    detail.dataset.count = label;
    detail.append(`${label}: `);
    const value = document.createElement("strong");
    value.textContent = String(count);
    detail.append(value);
    detailList.append(detail);
  }

  group.append(header, detailList);
  root.append(group);
}

function renderAvailableCounts(root: HTMLElement, counts: ContextCounts): void {
  root.removeAttribute("data-state");
  root.replaceChildren();

  const heading = document.createElement("div");
  heading.className = "counts-heading";
  heading.textContent = "Available context";
  root.append(heading);

  appendCountGroup(
    root,
    "Review summaries",
    counts.reviewSummaries.total,
    "review-summaries-total",
    [
      ["Change requests", counts.reviewSummaries.changesRequested],
      ["Other human", counts.reviewSummaries.otherHuman],
      ["Copilot", counts.reviewSummaries.copilot],
    ],
  );
  appendCountGroup(
    root,
    "Review threads",
    counts.reviewThreads.total,
    "review-threads-total",
    [
      ["Unresolved", counts.reviewThreads.unresolved],
      ["Resolved", counts.reviewThreads.resolved],
      ["Outdated", counts.reviewThreads.outdated],
    ],
  );
}

export function mountExporter(
  onExport: ExportHandler,
  onCounts?: CountsHandler,
): void {
  if (document.getElementById(HOST_ID)) return;

  const host = document.createElement("div");
  host.id = HOST_ID;
  const shadow = host.attachShadow({ mode: "open" });
  shadow.innerHTML = `
    <style>${styles}</style>
    <button class="trigger" type="button" aria-haspopup="dialog">
      <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16">
        <path d="M0 3.75C0 2.784.784 2 1.75 2h8.5c.966 0 1.75.784 1.75 1.75v.75h2.25c.966 0 1.75.784 1.75 1.75v6A1.75 1.75 0 0 1 14.25 14h-8.5A1.75 1.75 0 0 1 4 12.25v-.75H1.75A1.75 1.75 0 0 1 0 9.75Zm5.5 7.75v.75c0 .138.112.25.25.25h8.5a.25.25 0 0 0 .25-.25v-6a.25.25 0 0 0-.25-.25H12v3.75a1.75 1.75 0 0 1-1.75 1.75Zm5-1.75v-6a.25.25 0 0 0-.25-.25h-8.5a.25.25 0 0 0-.25.25v6c0 .138.112.25.25.25h8.5a.25.25 0 0 0 .25-.25Z"/>
      </svg>
      Copy agent context
    </button>
    <dialog aria-labelledby="pac-title">
      <form method="dialog">
        <h2 id="pac-title">Copy PR context</h2>
        <p>Collect review summaries and threads from GitHub using this browser session. Nothing is sent elsewhere.</p>
        <fieldset>
          <legend>Include</legend>
          <label>
            <input name="review-summaries" type="checkbox" checked>
            <span class="option-copy">
              <span>Review summaries</span>
              <small>Human change requests are included by default.</small>
            </span>
          </label>
          <label class="dependent">
            <input name="all-reviews" type="checkbox">
            <span class="option-copy">
              <span>All human review summaries</span>
              <small>Also include approvals and general review comments.</small>
            </span>
          </label>
          <label class="dependent">
            <input name="copilot-reviews" type="checkbox">
            <span class="option-copy">
              <span>Copilot review summaries</span>
              <small>These can add a substantial amount of generated text.</small>
            </span>
          </label>
          <label>
            <input name="review-threads" type="checkbox" checked>
            <span class="option-copy">
              <span>Review threads</span>
              <small>Include unresolved file-level discussions.</small>
            </span>
          </label>
          <label class="dependent">
            <input name="resolved" type="checkbox">
            <span class="option-copy">
              <span>Resolved review threads</span>
              <small>Unresolved threads are always included.</small>
            </span>
          </label>
          <label>
            <input name="diff" type="checkbox">
            <span class="option-copy">
              <span>Full pull request diff</span>
              <small>This can make the copied context much larger.</small>
            </span>
          </label>
        </fieldset>
        <div class="counts" aria-live="polite">Counts load when the popup opens.</div>
        <div class="status" role="status" aria-live="polite"></div>
        <div class="actions">
          <button class="cancel" value="cancel" type="button">Cancel</button>
          <button class="export" value="default" type="submit">Copy Markdown</button>
        </div>
      </form>
    </dialog>
  `;

  const trigger = shadow.querySelector<HTMLButtonElement>(".trigger");
  const dialog = shadow.querySelector<HTMLDialogElement>("dialog");
  const form = shadow.querySelector<HTMLFormElement>("form");
  const cancel = shadow.querySelector<HTMLButtonElement>(".cancel");
  const exportButton = shadow.querySelector<HTMLButtonElement>(".export");
  const counts = shadow.querySelector<HTMLElement>(".counts");
  const status = shadow.querySelector<HTMLElement>(".status");
  const reviewSummaries = shadow.querySelector<HTMLInputElement>(
    "input[name='review-summaries']",
  );
  const allReviews = shadow.querySelector<HTMLInputElement>(
    "input[name='all-reviews']",
  );
  const copilotReviews = shadow.querySelector<HTMLInputElement>(
    "input[name='copilot-reviews']",
  );
  const reviewThreads = shadow.querySelector<HTMLInputElement>(
    "input[name='review-threads']",
  );
  const resolved = shadow.querySelector<HTMLInputElement>(
    "input[name='resolved']",
  );
  const diff = shadow.querySelector<HTMLInputElement>("input[name='diff']");
  if (
    !trigger ||
    !dialog ||
    !form ||
    !cancel ||
    !exportButton ||
    !counts ||
    !status ||
    !reviewSummaries ||
    !allReviews ||
    !copilotReviews ||
    !reviewThreads ||
    !resolved ||
    !diff
  ) {
    throw new Error("Could not initialize the export interface");
  }

  const syncDependencies = () => {
    allReviews.disabled = !reviewSummaries.checked;
    copilotReviews.disabled = !reviewSummaries.checked;
    resolved.disabled = !reviewThreads.checked;
  };
  reviewSummaries.addEventListener("change", syncDependencies);
  reviewThreads.addEventListener("change", syncDependencies);
  syncDependencies();

  let countsRequest = 0;
  trigger.addEventListener("click", () => {
    const request = ++countsRequest;
    status.textContent = "";
    status.removeAttribute("data-state");
    counts.textContent = onCounts
      ? "Reading available reviews and threads…"
      : "Counts will appear after copying.";
    counts.removeAttribute("data-state");
    exportButton.disabled = false;
    exportButton.textContent = "Copy Markdown";
    dialog.showModal();

    if (!onCounts) return;
    void onCounts()
      .then((availableCounts) => {
        if (request !== countsRequest) return;
        renderAvailableCounts(counts, availableCounts);
      })
      .catch((error: unknown) => {
        if (request !== countsRequest) return;
        counts.dataset.state = "error";
        counts.textContent =
          error instanceof Error
            ? error.message
            : "Could not load review counts. They will be shown after copying.";
      });
  });
  cancel.addEventListener("click", () => dialog.close());
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    countsRequest += 1;
    exportButton.disabled = true;
    exportButton.textContent = "Collecting…";
    status.textContent = "Reading reviews and resolving file paths…";
    status.removeAttribute("data-state");

    try {
      const result = await onExport({
        includeReviewSummaries: reviewSummaries.checked,
        includeReviewThreads: reviewThreads.checked,
        includeAllReviews: allReviews.checked,
        includeCopilotReviews: copilotReviews.checked,
        includeResolved: resolved.checked,
        includeDiff: diff.checked,
      });
      status.dataset.state = "success";
      const sections = [];
      if (reviewSummaries.checked)
        sections.push(
          `${result.reviewCount} review ${result.reviewCount === 1 ? "summary" : "summaries"}`,
        );
      if (reviewThreads.checked)
        sections.push(
          `${result.threadCount} review ${result.threadCount === 1 ? "thread" : "threads"}`,
        );
      status.textContent =
        sections.length > 0
          ? `Copied PR information and ${sections.join(" and ")}.`
          : "Copied PR information.";
      renderAvailableCounts(counts, result.availableCounts);
      exportButton.textContent = "Copied";
    } catch (error) {
      status.dataset.state = "error";
      status.textContent =
        error instanceof Error
          ? error.message
          : "Export failed. Please reload and try again.";
      exportButton.textContent = "Try again";
    } finally {
      exportButton.disabled = false;
    }
  });

  document.body.append(host);
}

export function unmountExporter(): void {
  document.getElementById(HOST_ID)?.remove();
}
