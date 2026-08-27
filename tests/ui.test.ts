import { mountExporter, unmountExporter } from "../src/content/ui";

describe("export options", () => {
  afterEach(() => unmountExporter());

  it("enables only review summaries and review threads by default", () => {
    mountExporter(async () => ({
      reviewCount: 0,
      threadCount: 0,
      availableCounts: {
        reviewSummaries: {
          total: 0,
          changesRequested: 0,
          otherHuman: 0,
          copilot: 0,
        },
        reviewThreads: {
          total: 0,
          unresolved: 0,
          resolved: 0,
          outdated: 0,
        },
      },
    }));

    const shadow = document.getElementById("pr-agent-context-root")?.shadowRoot;
    const checked = [
      ...(shadow?.querySelectorAll<HTMLInputElement>(
        "input[type='checkbox']:checked",
      ) ?? []),
    ].map((input) => input.name);

    expect(checked).toEqual(["review-summaries", "review-threads"]);
    expect(
      shadow?.querySelector<HTMLInputElement>("input[name='all-reviews']")
        ?.disabled,
    ).toBe(false);
    expect(
      shadow?.querySelector<HTMLInputElement>("input[name='copilot-reviews']")
        ?.disabled,
    ).toBe(false);
    expect(
      shadow?.querySelector<HTMLInputElement>("input[name='resolved']")
        ?.disabled,
    ).toBe(false);
  });

  it("shows the available review breakdown after copying", async () => {
    const availableCounts = {
      reviewSummaries: {
        total: 4,
        changesRequested: 1,
        otherHuman: 2,
        copilot: 1,
      },
      reviewThreads: {
        total: 5,
        unresolved: 3,
        resolved: 2,
        outdated: 1,
      },
    };
    const onCounts = vi.fn(async () => availableCounts);

    mountExporter(
      async () => ({
        reviewCount: 2,
        threadCount: 3,
        availableCounts,
      }),
      onCounts,
    );

    const shadow = document.getElementById("pr-agent-context-root")?.shadowRoot;
    const dialog = shadow?.querySelector<HTMLDialogElement>("dialog");
    const showModal = vi.fn();
    if (dialog)
      Object.defineProperty(dialog, "showModal", { value: showModal });
    const trigger = shadow?.querySelector<HTMLButtonElement>(".trigger");
    const form = shadow?.querySelector<HTMLFormElement>("form");
    const counts = shadow?.querySelector<HTMLElement>(".counts");
    const status = shadow?.querySelector<HTMLElement>(".status");
    expect(form).toBeTruthy();

    trigger?.click();

    await vi.waitFor(() => {
      expect(showModal).toHaveBeenCalledOnce();
      expect(onCounts).toHaveBeenCalledOnce();
      expect(counts?.textContent).toContain("Available context");
      expect(counts?.textContent).toContain("Copilot: 1");
      expect(
        counts?.querySelector<HTMLElement>(
          "[data-count='review-threads-total']",
        )?.textContent,
      ).toBe("5");
    });

    form?.dispatchEvent(new SubmitEvent("submit", { cancelable: true }));

    await vi.waitFor(() => {
      expect(status?.textContent).toContain(
        "Copied PR information and 2 review summaries and 3 review threads.",
      );
      expect(counts?.textContent).toContain("Review summaries");
      expect(
        counts?.querySelector<HTMLElement>(
          "[data-count='review-summaries-total']",
        )?.textContent,
      ).toBe("4");
    });
  });
});
