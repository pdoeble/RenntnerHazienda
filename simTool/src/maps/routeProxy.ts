export type RouteOrigin = {
  id: string;
  label: string;
  latitude: number;
  longitude: number;
};

export type RouteDestination = {
  latitude: number;
  longitude: number;
  label?: string;
  source?: "provided" | "geocoded";
};

export type StreetRoute = {
  originId: string;
  originLabel: string;
  distanceKm: number;
  durationMinutes: number;
  geometry: {
    type: "LineString";
    coordinates: [number, number][];
  };
};

export type RouteError = {
  originId?: string;
  originLabel?: string;
  message: string;
};

export type RouteProxyResult = {
  destination: RouteDestination;
  routes: StreetRoute[];
  errors: RouteError[];
};

type RouteRequest = {
  origins: RouteOrigin[];
  destination: {
    latitude?: number;
    longitude?: number;
    address?: string;
    label?: string;
  };
};

const sessionCache = new Map<string, Promise<RouteProxyResult>>();

export function hasRouteProxy(): boolean {
  return Boolean(import.meta.env.VITE_ROUTE_PROXY_URL?.trim());
}

export function loadStreetRoutes(
  request: RouteRequest
): Promise<RouteProxyResult> {
  const url = import.meta.env.VITE_ROUTE_PROXY_URL?.trim();
  if (!url) {
    return Promise.reject(
      new Error("VITE_ROUTE_PROXY_URL ist nicht konfiguriert.")
    );
  }

  const cacheKey = JSON.stringify(request);
  const cached = sessionCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const routePromise = fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(request)
  }).then(async (response) => {
    const payload = (await response.json()) as
      | RouteProxyResult
      | { error?: string; error_description?: string };
    if (!response.ok) {
      throw new Error(
        "error_description" in payload
          ? payload.error_description ?? "Routing fehlgeschlagen."
          : "Routing fehlgeschlagen."
      );
    }
    return payload as RouteProxyResult;
  });

  sessionCache.set(cacheKey, routePromise);
  routePromise.catch(() => sessionCache.delete(cacheKey));
  return routePromise;
}

export function clearRouteSessionCache(): void {
  sessionCache.clear();
}
