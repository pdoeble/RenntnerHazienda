import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { extractListingFromText } from "./extractListing";

const dir = dirname(fileURLToPath(import.meta.url));
const raw = readFileSync(
  join(dir, "__fixtures__", "waldchalet-pfunds.raw.txt"),
  "utf-8"
);
const url =
  "https://www.immobilienscout24.at/expose/69f2efdc897bd2a11f553783";

describe("extractListingFromText", () => {
  it("extracts Waldchalet Pfunds core fields", () => {
    const { draft } = extractListingFromText(raw, url);

    expect(draft.title).toMatch(/Waldchalet Pfunds/i);
    expect(draft.sourceUrl).toBe(url);
    expect(draft.sourcePortal).toBe("immobilienscout24");
    expect(draft.purchasePrice).toBe(670000);
    expect(draft.commissionFree).toBe(true);
    expect(draft.pricePerM2Eur).toBeCloseTo(2392.86, 1);
    expect(draft.rentableAreaSqm).toBe(280);
    expect(draft.plotAreaSqm).toBe(1940);
    expect(draft.gardenAreaSqm).toBe(635);
    expect(draft.rooms).toBe(6);
    expect(draft.bathrooms).toBe(2);
    expect(draft.toilets).toBe(2);
    expect(draft.guestWc).toBe(true);
    expect(draft.garage).toBe(true);
    expect(draft.parkingSpaces).toBe(1);
    expect(draft.yearBuilt).toBe(1974);
    expect(draft.addressData?.postalCode).toBe("6542");
    expect(draft.addressData?.place).toBe("Pfunds");
    expect(draft.availableFrom).toBe("sofort");
    expect(draft.constructionType).toBe("Holzbauweise");
    expect(draft.condition).toBe("gepflegt");
    expect(draft.energy?.hwb).toBe(269);
    expect(draft.energy?.fgee).toBeCloseTo(2.69, 2);
    expect(draft.heating).toContain("Oel");
    expect(draft.features).toEqual(
      expect.arrayContaining(["Garten", "Kamin", "Swimmingpool", "Garage"])
    );
  });
});
