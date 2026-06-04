import type { PropertyData } from "../modules/property/types";
import { normalizeListingText } from "./normalize";
import {
  extractAddress,
  extractAreas,
  extractEnergy,
  extractFeatures,
  extractHeating,
  extractPortal,
  extractPrice,
  extractRooms,
  extractTitle,
  matchFirst,
  matchNumber
} from "./patterns";

export type ExtractConfidence = "high" | "medium" | "low" | "missing";

export type ExtractResult = {
  draft: Partial<PropertyData>;
  confidence: Record<string, ExtractConfidence>;
};

function setConfidence(
  confidence: Record<string, ExtractConfidence>,
  key: string,
  value: unknown,
  level: ExtractConfidence = "high"
): void {
  confidence[key] = value !== undefined && value !== null && value !== "" ? level : "missing";
}

export function extractListingFromText(
  rawText: string,
  sourceUrl?: string
): ExtractResult {
  const text = normalizeListingText(rawText);
  const confidence: Record<string, ExtractConfidence> = {};
  const areas = extractAreas(text);
  const rooms = extractRooms(text);
  const purchasePrice = extractPrice(text);
  const title =
    extractTitle(rawText, sourceUrl) ??
    matchFirst(rawText, /obj_title["']?\s*:\s*"([^"]+)"/) ??
    matchFirst(text, /(Waldchalet[^\n.]{5,120})/i) ??
    "Unbenanntes Objekt";

  setConfidence(confidence, "purchasePrice", purchasePrice);
  setConfidence(confidence, "title", title);
  setConfidence(confidence, "rentableAreaSqm", areas.livingAreaM2);
  setConfidence(confidence, "plotAreaSqm", areas.plotAreaM2);
  setConfidence(confidence, "gardenAreaSqm", areas.gardenAreaSqm);
  setConfidence(confidence, "rooms", rooms.rooms);

  const draft: Partial<PropertyData> = {
    title,
    sourceUrl,
    sourcePortal: extractPortal(sourceUrl),
    purchasePrice: purchasePrice ?? 0,
    commissionFree: /provisionsfrei/i.test(text),
    pricePerM2Eur: areas.pricePerM2Eur,
    rentableAreaSqm: areas.livingAreaM2,
    plotAreaSqm: areas.plotAreaM2,
    gardenAreaSqm: areas.gardenAreaSqm,
    rooms: rooms.rooms,
    bathrooms: rooms.bathrooms,
    toilets: rooms.toilets,
    guestWc: rooms.guestWc,
    kitchens: /Kueche|Küche/i.test(text) ? 1 : undefined,
    garage: /Garage/i.test(text),
    parkingSpaces: matchNumber(text, /(\d+)\s*Parkmoeglichkeit/i) ??
      matchNumber(text, /(\d+)\s*Parkmöglichkeit/i),
    yearBuilt: matchNumber(text, /Baujahr\s*(\d{4})/i),
    condition: /gepflegt/i.test(text) ? "gepflegt" : undefined,
    constructionType: /Holzbauweise/i.test(text) ? "Holzbauweise" : undefined,
    availableFrom: /sofort/i.test(text) ? "sofort" : undefined,
    addressData: extractAddress(text),
    heating: extractHeating(text),
    energy: extractEnergy(text),
    features: extractFeatures(text),
    bedrooms:
      matchNumber(text, /(\d+)\s*grosse\s*Zimmer/i) ??
      matchNumber(text, /(\d+)\s*große\s*Zimmer/i)
  };

  if (draft.addressData?.place) {
    draft.municipality = draft.addressData.place;
  }

  return { draft, confidence };
}
