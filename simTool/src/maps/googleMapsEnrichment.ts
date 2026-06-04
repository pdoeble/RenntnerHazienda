import {
  OWNER_HOME_LOCATIONS
} from "../modules/property/houseCandidates";
import type { CandidateHouse, TravelTime } from "../modules/property/types";

type GoogleDistanceMatrixResponse = {
  rows?: {
    elements?: {
      status?: string;
      duration?: { value?: number };
      distance?: { value?: number };
    }[];
  }[];
};

type GooglePlacesResponse = {
  results?: {
    name?: string;
    formatted_address?: string;
  }[];
};

export type GoogleMapsEnrichmentResult = {
  house: CandidateHouse;
  message: string;
};

export function hasGoogleMapsKey(): boolean {
  return Boolean(import.meta.env.VITE_GOOGLE_MAPS_API_KEY?.trim());
}

export async function enrichHouseWithGoogleMaps(
  house: CandidateHouse
): Promise<GoogleMapsEnrichmentResult> {
  const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY?.trim();
  if (!key) {
    return {
      house,
      message: "Kein Google-Maps-Key gesetzt; Excel-Fallback bleibt aktiv."
    };
  }

  const destination = `${house.place}, ${house.postalCode ?? ""}, Oesterreich`;
  const fetchedAt = new Date().toISOString();
  const travelTimes = await fetchTravelTimes(destination, key, fetchedAt);
  const nearestSki = await fetchNearestSki(destination, key, fetchedAt);
  const nextHouse: CandidateHouse = {
    ...house,
    travelTimes: travelTimes.length > 0 ? travelTimes : house.travelTimes,
    ...(nearestSki
      ? {
          nearestSkiArea: nearestSki.name,
          nearestSkiMinutes: nearestSki.driveMinutes,
          skiAreas: [nearestSki]
        }
      : {})
  };

  return {
    house: nextHouse,
    message:
      travelTimes.length > 0 || nearestSki
        ? "Google-Maps-Werte aktualisiert."
        : "Google Maps lieferte keine verwertbaren Werte; Fallback bleibt aktiv."
  };
}

async function fetchTravelTimes(
  destination: string,
  key: string,
  fetchedAt: string
): Promise<TravelTime[]> {
  const url = new URL("https://maps.googleapis.com/maps/api/distancematrix/json");
  url.searchParams.set(
    "origins",
    OWNER_HOME_LOCATIONS.map((location) => location.query).join("|")
  );
  url.searchParams.set("destinations", destination);
  url.searchParams.set("mode", "driving");
  url.searchParams.set("key", key);

  const response = await fetch(url);
  if (!response.ok) {
    return [];
  }

  const data = (await response.json()) as GoogleDistanceMatrixResponse;
  const travelTimes: TravelTime[] = [];

  OWNER_HOME_LOCATIONS.forEach((origin, index) => {
    const element = data.rows?.[index]?.elements?.[0];
    if (element?.status !== "OK") {
      return;
    }

    const minutes =
      element.duration?.value !== undefined
        ? Math.round(element.duration.value / 60)
        : undefined;
    const distanceKm =
      element.distance?.value !== undefined
        ? Math.round((element.distance.value / 1000) * 10) / 10
        : undefined;

    travelTimes.push({
      originId: origin.id,
      originLabel: origin.label,
      ...(minutes !== undefined ? { minutes } : {}),
      ...(distanceKm !== undefined ? { distanceKm } : {}),
      mapsUrl: mapsUrl(origin.query, destination),
      provider: "googleMaps",
      dataQuality: "googleMaps" as const,
      fetchedAt
    });
  });

  return travelTimes;
}

async function fetchNearestSki(
  destination: string,
  key: string,
  fetchedAt: string
): Promise<CandidateHouse["skiAreas"][number] | undefined> {
  const placesUrl = new URL(
    "https://maps.googleapis.com/maps/api/place/textsearch/json"
  );
  placesUrl.searchParams.set("query", `Skigebiet Talstation nahe ${destination}`);
  placesUrl.searchParams.set("key", key);

  const placesResponse = await fetch(placesUrl);
  if (!placesResponse.ok) {
    return undefined;
  }

  const places = (await placesResponse.json()) as GooglePlacesResponse;
  const first = places.results?.[0];
  if (!first?.name) {
    return undefined;
  }

  const routeUrl = new URL("https://maps.googleapis.com/maps/api/distancematrix/json");
  routeUrl.searchParams.set("origins", destination);
  routeUrl.searchParams.set(
    "destinations",
    first.formatted_address ?? first.name
  );
  routeUrl.searchParams.set("mode", "driving");
  routeUrl.searchParams.set("key", key);
  const routeResponse = await fetch(routeUrl);
  const route = routeResponse.ok
    ? ((await routeResponse.json()) as GoogleDistanceMatrixResponse)
    : undefined;
  const element = route?.rows?.[0]?.elements?.[0];
  const driveMinutes =
    element?.duration?.value !== undefined
      ? Math.round(element.duration.value / 60)
      : undefined;
  const distanceKm =
    element?.distance?.value !== undefined
      ? Math.round((element.distance.value / 1000) * 10) / 10
      : undefined;

  return {
    id: slugId(first.name),
    name: first.name,
    stationPlace: first.formatted_address,
    ...(distanceKm !== undefined ? { distanceKm } : {}),
    ...(driveMinutes !== undefined ? { driveMinutes } : {}),
    mapsUrl: mapsUrl(destination, first.formatted_address ?? first.name),
    provider: "googleMaps",
    dataQuality: "googleMaps",
    fetchedAt
  };
}

function mapsUrl(origin: string, destination: string): string {
  const params = new URLSearchParams({
    api: "1",
    origin,
    destination,
    travelmode: "driving"
  });
  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

function slugId(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}
