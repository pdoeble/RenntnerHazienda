export function normalizeListingText(text: string): string {
  return text.replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim();
}

export function parseGermanNumber(raw: string): number | undefined {
  const value = raw.replace(/[^\d.,]/g, "").trim();
  if (!value) {
    return undefined;
  }

  if (value.includes(",")) {
    const normalized = value.replace(/\./g, "").replace(",", ".");
    const parsed = Number.parseFloat(normalized);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  if (/^\d+\.\d{1,2}$/.test(value)) {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  const parsed = Number.parseFloat(value.replace(/\./g, ""));
  return Number.isFinite(parsed) ? parsed : undefined;
}

export function parsePriceEur(text: string): number | undefined {
  const match =
    text.match(/([\d.]+)\s*(?:000\s*)?\u20ac/i) ??
    text.match(/\u20ac\s*([\d.,]+)/i) ??
    text.match(/([\d.,]+)\s*EUR/i);

  if (!match) {
    return undefined;
  }

  let value = match[1] ?? "";
  if (value.includes(".") && !value.includes(",")) {
    const parts = value.split(".");
    if (parts.length > 2 || (parts.length === 2 && parts[1]?.length === 3)) {
      value = value.replace(/\./g, "");
    }
  }

  return parseGermanNumber(value);
}
