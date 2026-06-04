import { extractListingFromText, type ExtractResult } from "./extractListing";
import { fetchListingContent } from "./fetchListingContent";

export async function extractListingFromUrl(
  sourceUrl: string
): Promise<ExtractResult & { rawText: string }> {
  const rawText = await fetchListingContent(sourceUrl);
  return {
    ...extractListingFromText(rawText, sourceUrl.trim()),
    rawText
  };
}
