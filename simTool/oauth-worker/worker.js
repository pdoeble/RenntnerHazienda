/* global Response, fetch, URL */

const GITHUB_TOKEN_URL = "https://github.com/login/oauth/access_token";
const ORS_GEOCODE_URL = "https://api.openrouteservice.org/geocode/search";
const ORS_DIRECTIONS_URL =
  "https://api.openrouteservice.org/v2/directions/driving-car/geojson";
const MAX_ROUTE_ORIGINS = 6;

export default {
  async fetch(request, env) {
    const corsHeaders = buildCorsHeaders(request, env);

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders
      });
    }

    const path = new URL(request.url).pathname.replace(/\/+$/, "");
    if (path === "/github-oauth") {
      return handleGithubOauth(request, env, corsHeaders);
    }
    if (path === "/route") {
      return handleRoute(request, env, corsHeaders);
    }

    return jsonResponse(
      { error: "not_found", error_description: "Endpunkt nicht gefunden." },
      404,
      corsHeaders
    );
  }
};

async function handleGithubOauth(request, env, corsHeaders) {
  if (request.method !== "POST") {
    return methodNotAllowed(corsHeaders);
  }
  if (!env.GITHUB_OAUTH_CLIENT_ID || !env.GITHUB_OAUTH_CLIENT_SECRET) {
    return jsonResponse(
      {
        error: "server_not_configured",
        error_description:
          "GITHUB_OAUTH_CLIENT_ID oder GITHUB_OAUTH_CLIENT_SECRET fehlt."
      },
      500,
      corsHeaders
    );
  }

  const payload = await readJson(request);
  if (!payload) {
    return invalidJson(corsHeaders);
  }

  const code = typeof payload.code === "string" ? payload.code : "";
  const redirectUri =
    typeof payload.redirectUri === "string" ? payload.redirectUri : "";
  if (!code || !redirectUri) {
    return jsonResponse(
      {
        error: "invalid_request",
        error_description: "code und redirectUri sind erforderlich."
      },
      400,
      corsHeaders
    );
  }

  const tokenResponse = await fetch(GITHUB_TOKEN_URL, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "User-Agent": "RenntnerHazienda-simTool"
    },
    body: JSON.stringify({
      client_id: env.GITHUB_OAUTH_CLIENT_ID,
      client_secret: env.GITHUB_OAUTH_CLIENT_SECRET,
      code,
      redirect_uri: redirectUri
    })
  });
  const tokenJson = await tokenResponse.json();

  if (!tokenResponse.ok || tokenJson.error) {
    return jsonResponse(
      {
        error: tokenJson.error ?? "github_exchange_failed",
        error_description:
          tokenJson.error_description ?? "GitHub Token-Austausch fehlgeschlagen."
      },
      tokenResponse.ok ? 400 : tokenResponse.status,
      corsHeaders
    );
  }

  return jsonResponse(
    {
      access_token: tokenJson.access_token,
      token_type: tokenJson.token_type,
      scope: tokenJson.scope
    },
    200,
    corsHeaders
  );
}

async function handleRoute(request, env, corsHeaders) {
  if (request.method !== "POST") {
    return methodNotAllowed(corsHeaders);
  }
  if (!env.OPENROUTESERVICE_API_KEY) {
    return jsonResponse(
      {
        error: "server_not_configured",
        error_description: "OPENROUTESERVICE_API_KEY fehlt."
      },
      500,
      corsHeaders
    );
  }

  const payload = await readJson(request);
  if (!payload) {
    return invalidJson(corsHeaders);
  }

  const origins = Array.isArray(payload.origins)
    ? payload.origins.map(normalizeOrigin).filter(Boolean)
    : [];
  if (
    origins.length === 0 ||
    origins.length > MAX_ROUTE_ORIGINS ||
    origins.length !== payload.origins?.length
  ) {
    return jsonResponse(
      {
        error: "invalid_request",
        error_description:
          "Es sind ein bis sechs gueltige Urspruenge erforderlich."
      },
      400,
      corsHeaders
    );
  }

  let destination;
  try {
    destination = await resolveDestination(
      payload.destination,
      env.OPENROUTESERVICE_API_KEY
    );
  } catch (error) {
    return jsonResponse(
      {
        error: "destination_unavailable",
        error_description: safeMessage(error, "Ziel konnte nicht aufgeloest werden.")
      },
      400,
      corsHeaders
    );
  }

  const results = await Promise.all(
    origins.map(async (origin) => {
      try {
        const route = await fetchRoute(
          origin,
          destination,
          env.OPENROUTESERVICE_API_KEY
        );
        return { route };
      } catch (error) {
        return {
          error: {
            originId: origin.id,
            originLabel: origin.label,
            message: safeMessage(error, "Route nicht verfuegbar.")
          }
        };
      }
    })
  );

  return jsonResponse(
    {
      destination,
      routes: results.flatMap((result) => (result.route ? [result.route] : [])),
      errors: results.flatMap((result) => (result.error ? [result.error] : []))
    },
    200,
    corsHeaders
  );
}

async function resolveDestination(rawDestination, apiKey) {
  const latitude = finiteCoordinate(rawDestination?.latitude, -90, 90);
  const longitude = finiteCoordinate(rawDestination?.longitude, -180, 180);
  if (latitude !== undefined && longitude !== undefined) {
    return {
      latitude,
      longitude,
      label:
        typeof rawDestination?.label === "string"
          ? rawDestination.label
          : undefined,
      source: "provided"
    };
  }

  const address =
    typeof rawDestination?.address === "string"
      ? rawDestination.address.trim()
      : "";
  if (!address) {
    throw new Error("Zielkoordinaten oder Zieladresse fehlen.");
  }

  const url = new URL(ORS_GEOCODE_URL);
  url.searchParams.set("text", address);
  url.searchParams.set("boundary.country", "AT");
  url.searchParams.set("size", "1");
  const response = await fetch(url, {
    headers: {
      Authorization: apiKey,
      Accept: "application/json"
    }
  });
  if (!response.ok) {
    throw new Error(`Geocoding fehlgeschlagen (${response.status}).`);
  }
  const body = await response.json();
  const coordinates = body.features?.[0]?.geometry?.coordinates;
  if (!Array.isArray(coordinates) || coordinates.length < 2) {
    throw new Error("Geocoding lieferte keine Koordinaten.");
  }

  return {
    latitude: Number(coordinates[1]),
    longitude: Number(coordinates[0]),
    label:
      body.features?.[0]?.properties?.label ??
      rawDestination?.label ??
      address,
    source: "geocoded"
  };
}

async function fetchRoute(origin, destination, apiKey) {
  const response = await fetch(ORS_DIRECTIONS_URL, {
    method: "POST",
    headers: {
      Authorization: apiKey,
      Accept: "application/geo+json, application/json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      coordinates: [
        [origin.longitude, origin.latitude],
        [destination.longitude, destination.latitude]
      ]
    })
  });
  if (!response.ok) {
    throw new Error(`OpenRouteService antwortete mit ${response.status}.`);
  }

  const body = await response.json();
  const feature = body.features?.[0];
  const summary = feature?.properties?.summary;
  const coordinates = feature?.geometry?.coordinates;
  if (
    feature?.geometry?.type !== "LineString" ||
    !Array.isArray(coordinates) ||
    !summary
  ) {
    throw new Error("OpenRouteService lieferte keine nutzbare Route.");
  }

  return {
    originId: origin.id,
    originLabel: origin.label,
    distanceKm: Math.round((Number(summary.distance) / 1000) * 10) / 10,
    durationMinutes: Math.round(Number(summary.duration) / 6) / 10,
    geometry: {
      type: "LineString",
      coordinates
    }
  };
}

function normalizeOrigin(origin) {
  const latitude = finiteCoordinate(origin?.latitude, -90, 90);
  const longitude = finiteCoordinate(origin?.longitude, -180, 180);
  const id = typeof origin?.id === "string" ? origin.id.trim() : "";
  const label = typeof origin?.label === "string" ? origin.label.trim() : "";
  if (!id || !label || latitude === undefined || longitude === undefined) {
    return undefined;
  }
  return { id, label, latitude, longitude };
}

function finiteCoordinate(value, minimum, maximum) {
  return typeof value === "number" &&
    Number.isFinite(value) &&
    value >= minimum &&
    value <= maximum
    ? value
    : undefined;
}

async function readJson(request) {
  try {
    return await request.json();
  } catch {
    return undefined;
  }
}

function safeMessage(error, fallback) {
  return error instanceof Error ? error.message : fallback;
}

function methodNotAllowed(corsHeaders) {
  return jsonResponse(
    { error: "method_not_allowed", error_description: "Nur POST ist erlaubt." },
    405,
    corsHeaders
  );
}

function invalidJson(corsHeaders) {
  return jsonResponse(
    { error: "invalid_json", error_description: "JSON Body ist ungueltig." },
    400,
    corsHeaders
  );
}

function buildCorsHeaders(request, env) {
  const requestOrigin = request.headers.get("Origin") ?? "";
  const configuredOrigins = String(env.ALLOWED_ORIGIN ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
  const allowedOrigin =
    configuredOrigins.includes("*") || configuredOrigins.includes(requestOrigin)
      ? requestOrigin || "*"
      : configuredOrigins[0] ?? "";

  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Vary": "Origin"
  };
}

function jsonResponse(body, status, headers) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...headers,
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store"
    }
  });
}
