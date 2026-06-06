/* global Request, Response */

import { afterEach, describe, expect, it, vi } from "vitest";
import worker from "./worker.js";

describe("OAuth and routing worker", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("keeps the OAuth endpoint separate from routing", async () => {
    const response = await worker.fetch(
      new Request("https://worker.test/github-oauth", {
        method: "POST",
        body: JSON.stringify({ code: "code", redirectUri: "https://app.test" })
      }),
      { ALLOWED_ORIGIN: "*" }
    );

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual(
      expect.objectContaining({ error: "server_not_configured" })
    );
  });

  it("returns a controlled configuration error when the routing key is absent", async () => {
    const response = await worker.fetch(
      new Request("https://worker.test/route", {
        method: "POST",
        body: JSON.stringify({
          origins: [
            {
              id: "innsbruck",
              label: "Innsbruck",
              latitude: 47.269,
              longitude: 11.404
            }
          ],
          destination: { latitude: 47.166, longitude: 11.358 }
        })
      }),
      { ALLOWED_ORIGIN: "*" }
    );

    expect(response.status).toBe(500);
    expect(JSON.stringify(await response.json())).not.toContain("secret");
  });

  it("rejects more than six routing origins", async () => {
    const origins = Array.from({ length: 7 }, (_value, index) => ({
      id: `origin-${index}`,
      label: `Origin ${index}`,
      latitude: 47 + index / 100,
      longitude: 11 + index / 100
    }));
    const response = await worker.fetch(
      new Request("https://worker.test/route", {
        method: "POST",
        body: JSON.stringify({
          origins,
          destination: { latitude: 47.166, longitude: 11.358 }
        })
      }),
      {
        ALLOWED_ORIGIN: "*",
        OPENROUTESERVICE_API_KEY: "top-secret"
      }
    );

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual(
      expect.objectContaining({ error: "invalid_request" })
    );
  });

  it("returns successful routes and per-origin errors without exposing the key", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            features: [
              {
                geometry: {
                  type: "LineString",
                  coordinates: [
                    [11.404, 47.269],
                    [11.358, 47.166]
                  ]
                },
                properties: {
                  summary: { distance: 20100, duration: 1470 }
                }
              }
            ]
          }),
          { status: 200 }
        )
      )
      .mockResolvedValueOnce(new Response("Fehler", { status: 503 }));
    vi.stubGlobal("fetch", fetchMock);

    const response = await worker.fetch(
      new Request("https://worker.test/route", {
        method: "POST",
        headers: { Origin: "https://app.test" },
        body: JSON.stringify({
          origins: [
            {
              id: "innsbruck",
              label: "Innsbruck",
              latitude: 47.269,
              longitude: 11.404
            },
            {
              id: "muenchen",
              label: "Muenchen",
              latitude: 48.137,
              longitude: 11.576
            }
          ],
          destination: {
            latitude: 47.166,
            longitude: 11.358,
            label: "Telfes"
          }
        })
      }),
      {
        ALLOWED_ORIGIN: "https://app.test",
        OPENROUTESERVICE_API_KEY: "top-secret"
      }
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.routes).toHaveLength(1);
    expect(body.errors).toHaveLength(1);
    expect(body.routes[0]).toEqual(
      expect.objectContaining({
        distanceKm: 20.1,
        durationMinutes: 24.5
      })
    );
    expect(JSON.stringify(body)).not.toContain("top-secret");
  });
});
