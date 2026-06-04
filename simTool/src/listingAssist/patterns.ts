import { parseGermanNumber, parsePriceEur } from "./normalize";

export function matchFirst(text: string, pattern: RegExp): string | undefined {
  return text.match(pattern)?.[1]?.trim();
}

export function matchNumber(text: string, pattern: RegExp): number | undefined {
  const value = matchFirst(text, pattern);
  return value ? parseGermanNumber(value) : undefined;
}

export function extractAreas(text: string) {
  return {
    livingAreaM2: matchNumber(text, /Wohnflaeche\s*([\d.,]+)\s*(?:m2|m\u00b2)/i) ??
      matchNumber(text, /Wohnfläche\s*([\d.,]+)\s*(?:m2|m\u00b2)/i),
    plotAreaM2:
      matchNumber(text, /Grundstuecksflaeche\s*([\d.,]+)\s*(?:m2|m\u00b2)/i) ??
      matchNumber(text, /Grundstücksfläche\s*([\d.,]+)\s*(?:m2|m\u00b2)/i) ??
      matchNumber(text, /Grundstueck[s]?flaeche\s*([\d.,]+)/i) ??
      matchNumber(text, /Grundstück[s]?fläche\s*([\d.,]+)/i),
    gardenAreaSqm:
      matchNumber(text, /Gartenflaeche\s*([\d.,]+)\s*(?:m2|m\u00b2)/i) ??
      matchNumber(text, /Gartenfläche\s*([\d.,]+)\s*(?:m2|m\u00b2)/i),
    pricePerM2Eur:
      matchNumber(text, /Preis\s*\/\s*(?:m2|m\u00b2)\s*([\d.,]+)/i) ??
      matchNumber(text, /Preis\s*\/\s*m²\s*([\d.,]+)/i)
  };
}

export function extractRooms(text: string) {
  return {
    rooms: matchNumber(text, /(\d+)\s*Zimmer/i),
    bathrooms:
      matchNumber(text, /(\d+)\s*Badezimmer/i) ??
      matchNumber(text, /(\d+)\s*Baeder/i),
    toilets: matchNumber(text, /(\d+)\s*Toiletten/i),
    guestWc: /Gaeste\s*WC|Gäste\s*WC|Gaeste-WC|Gäste-WC/i.test(text)
  };
}

export function extractTitle(text: string, sourceUrl?: string): string | undefined {
  const lines = text
    .split(/\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const candidate = lines.find(
    (line) => line.length > 15 && line.length < 200 && !line.startsWith("http")
  );
  if (candidate) {
    return candidate;
  }
  if (sourceUrl?.includes("immobilienscout24")) {
    return undefined;
  }
  return undefined;
}

export function extractPortal(sourceUrl?: string): string | undefined {
  if (!sourceUrl) {
    return undefined;
  }
  if (sourceUrl.includes("immobilienscout24")) {
    return "immobilienscout24";
  }
  return undefined;
}

export function extractPrice(text: string): number | undefined {
  return (
    parsePriceEur(text) ??
    matchNumber(text, /Kaufpreis\s*([\d.,]+)/i) ??
    matchNumber(text, /obj_purchasePrice["']?\s*:\s*(\d+)/i)
  );
}

export function extractAddress(text: string) {
  const match = text.match(/\b(\d{4})\s+([A-Za-z\u00c4\u00d6\u00dc\u00e4\u00f6\u00fc\u00df-]+)/);
  if (!match) {
    return undefined;
  }

  return {
    postalCode: match[1],
    place: match[2],
    region: /Tirol/i.test(text) ? "Tirol" : undefined,
    country: "AT" as const
  };
}

export function extractFeatures(text: string): string[] {
  const found = new Set<string>();
  const keywords = [
    "Garten",
    "Garage",
    "Kamin",
    "Swimmingpool",
    "Pool",
    "Parkplatz",
    "Provisionsfrei",
    "Holzbauweise",
    "Vollmoebliert",
    "Vollmöbliert",
    "Bergpanorama"
  ];

  for (const keyword of keywords) {
    if (text.includes(keyword)) {
      found.add(keyword.replace("Vollmöbliert", "Vollmoebliert"));
    }
  }

  return [...found];
}

export function extractHeating(text: string): string[] {
  const heating = [];
  if (/(?:Oel|\u00d6l)/i.test(text)) {
    heating.push("Oel");
  }
  if (/Zentralheizung/i.test(text)) {
    heating.push("Zentralheizung");
  }
  if (/Ofenheizung/i.test(text)) {
    heating.push("Ofenheizung");
  }
  return heating;
}

export function extractEnergy(text: string) {
  const hwb = matchNumber(text, /HWB[^0-9]*([\d.,]+)/i);
  let fgee: number | undefined;
  const fgeeIndex = text.search(/fGEE/i);

  if (fgeeIndex >= 0) {
    fgee = matchNumber(text.slice(fgeeIndex, fgeeIndex + 40), /fGEE\)?\s*([\d.,]+)/i);
  }

  if (hwb === undefined && fgee === undefined) {
    return undefined;
  }

  return { hwb, fgee };
}
