import { afterEach, describe, expect, it, vi } from "vitest";
import { extractListingFromUrl } from "./extractListingFromUrl";

const url =
  "https://www.immobilienscout24.at/expose/69f2efdc897bd2a11f553783";

const sample = `
# Waldchalet Pfunds - provisionsfrei
{"obj_zipCode":"6542","obj_title":"Waldchalet Pfunds - provisionsfrei","obj_purchasePrice":670000}
280 m2 6 Zimmer Garten
Baujahr 1974, Gepflegt, Holzbauweise
2 Badezimmer, 2 Toiletten, Gaeste WC
6542 Pfunds
HWB 269 fGEE 2,69
`;

describe("extractListingFromUrl", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("fetches via proxy and extracts fields", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        text: async () => sample
      })
    );

    const { draft } = await extractListingFromUrl(url);
    expect(draft.title).toMatch(/Waldchalet Pfunds/i);
    expect(draft.purchasePrice).toBe(670000);
    expect(draft.rooms).toBe(6);
    expect(draft.sourcePortal).toBe("immobilienscout24");
  });
});
