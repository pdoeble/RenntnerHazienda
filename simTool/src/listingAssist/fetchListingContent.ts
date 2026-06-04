export function isListingUrl(value: string): boolean {
  try {
    const url = new URL(value.trim());
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function listingFetchUrl(sourceUrl: string): string {
  const trimmed = sourceUrl.trim();
  const proxy = (import.meta.env.VITE_LISTING_FETCH_PROXY ?? "https://r.jina.ai/").trim();

  if (proxy.includes("{url}")) {
    return proxy.replace("{url}", encodeURIComponent(trimmed));
  }
  if (proxy.includes("allorigins")) {
    return `${proxy}${encodeURIComponent(trimmed)}`;
  }

  return `${proxy.endsWith("/") ? proxy : `${proxy}/`}${trimmed}`;
}

export async function fetchListingContent(sourceUrl: string): Promise<string> {
  if (!isListingUrl(sourceUrl)) {
    throw new Error("Bitte eine gueltige http(s)-URL eingeben.");
  }

  const response = await fetch(listingFetchUrl(sourceUrl), {
    headers: { Accept: "text/plain, text/html, */*" }
  });

  if (!response.ok) {
    throw new Error(
      `Inserat konnte nicht geladen werden (HTTP ${response.status}). Text manuell einfuegen.`
    );
  }

  const text = await response.text();
  if (!text.trim()) {
    throw new Error("Leere Antwort vom Server. Text bitte manuell einfuegen.");
  }

  return text;
}
