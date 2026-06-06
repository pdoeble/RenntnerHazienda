import { afterEach, describe, expect, it, vi } from "vitest";
import {
  clearRouteSessionCache,
  loadStreetRoutes
} from "./routeProxy";

const request = {
  origins: [
    {
      id: "innsbruck",
      label: "Innsbruck",
      latitude: 47.269,
      longitude: 11.404
    }
  ],
  destination: {
    latitude: 47.166,
    longitude: 11.358,
    label: "Telfes"
  }
};

describe("route proxy client", () => {
  afterEach(() => {
    clearRouteSessionCache();
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("reports missing routing configuration", async () => {
    vi.stubEnv("VITE_ROUTE_PROXY_URL", "");

    await expect(loadStreetRoutes(request)).rejects.toThrow(
      "VITE_ROUTE_PROXY_URL"
    );
  });

  it("normalizes a successful route response and caches it for the session", async () => {
    vi.stubEnv("VITE_ROUTE_PROXY_URL", "https://example.test/route");
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          destination: {
            latitude: 47.166,
            longitude: 11.358,
            source: "provided"
          },
          routes: [
            {
              originId: "innsbruck",
              originLabel: "Innsbruck",
              distanceKm: 20.1,
              durationMinutes: 24.5,
              geometry: {
                type: "LineString",
                coordinates: [
                  [11.404, 47.269],
                  [11.358, 47.166]
                ]
              }
            }
          ],
          errors: []
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      )
    );
    vi.stubGlobal("fetch", fetchMock);

    const first = await loadStreetRoutes(request);
    const second = await loadStreetRoutes(request);

    expect(first.routes[0]?.durationMinutes).toBe(24.5);
    expect(second).toBe(first);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
