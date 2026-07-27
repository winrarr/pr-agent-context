import { mountExporter, unmountExporter } from "../src/content/ui";

describe("export options", () => {
  afterEach(() => unmountExporter());

  it("enables only review summaries and review threads by default", () => {
    mountExporter(async () => ({ reviewCount: 0, threadCount: 0 }));

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
});
