/* global Response, fetch */

const GITHUB_TOKEN_URL = "https://github.com/login/oauth/access_token";

export default {
  async fetch(request, env) {
    const corsHeaders = buildCorsHeaders(request, env);

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders
      });
    }

    if (request.method !== "POST") {
      return jsonResponse(
        { error: "method_not_allowed", error_description: "Nur POST ist erlaubt." },
        405,
        corsHeaders
      );
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

    let payload;
    try {
      payload = await request.json();
    } catch {
      return jsonResponse(
        { error: "invalid_json", error_description: "JSON Body ist ungueltig." },
        400,
        corsHeaders
      );
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
};

function buildCorsHeaders(request, env) {
  const requestOrigin = request.headers.get("Origin") ?? "";
  const configuredOrigin = env.ALLOWED_ORIGIN ?? "";
  const allowedOrigin =
    configuredOrigin === "*" || configuredOrigin === requestOrigin
      ? requestOrigin || "*"
      : configuredOrigin;

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
