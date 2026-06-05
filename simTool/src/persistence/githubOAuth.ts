const OAUTH_STATE_KEY = "renntner_hazienda_github_oauth_state";

export type GithubOAuthConfig = {
  clientId: string;
  exchangeUrl: string;
  scope: string;
  redirectUri: string;
  authorizeUrl: string;
};

export type GithubOAuthTokenResult = {
  token: string;
  tokenType?: string;
  scope?: string;
};

type GithubOAuthExchangeResponse = {
  access_token?: string;
  token?: string;
  token_type?: string;
  scope?: string;
  error?: string;
  error_description?: string;
};

export class GithubOAuthError extends Error {
  constructor(
    message: string,
    readonly status = 0
  ) {
    super(message);
    this.name = "GithubOAuthError";
  }
}

export function githubOAuthConfig(): GithubOAuthConfig {
  return {
    clientId: import.meta.env.VITE_GITHUB_OAUTH_CLIENT_ID ?? "",
    exchangeUrl: import.meta.env.VITE_GITHUB_OAUTH_EXCHANGE_URL ?? "",
    scope: import.meta.env.VITE_GITHUB_OAUTH_SCOPE ?? "public_repo",
    redirectUri:
      import.meta.env.VITE_GITHUB_OAUTH_REDIRECT_URI ?? currentCleanUrl(),
    authorizeUrl:
      import.meta.env.VITE_GITHUB_OAUTH_AUTHORIZE_URL ??
      "https://github.com/login/oauth/authorize"
  };
}

export function isGithubOAuthConfigured(config = githubOAuthConfig()): boolean {
  return Boolean(config.clientId.trim() && config.exchangeUrl.trim());
}

export function beginGithubOAuthLogin(
  config = githubOAuthConfig(),
  assignLocation: (url: string) => void = (url) => window.location.assign(url)
): void {
  if (!config.clientId.trim()) {
    throw new GithubOAuthError("GitHub OAuth Client-ID fehlt.");
  }

  const state = createOauthState();
  sessionStorage.setItem(OAUTH_STATE_KEY, state);
  assignLocation(buildGithubOAuthAuthorizeUrl(config, state));
}

export function buildGithubOAuthAuthorizeUrl(
  config: GithubOAuthConfig,
  state: string
): string {
  const url = new URL(config.authorizeUrl);
  url.searchParams.set("client_id", config.clientId);
  url.searchParams.set("redirect_uri", config.redirectUri);
  url.searchParams.set("scope", config.scope);
  url.searchParams.set("state", state);
  return url.toString();
}

export function hasGithubOAuthCallback(
  search = typeof window === "undefined" ? "" : window.location.search
): boolean {
  const params = new URLSearchParams(search);
  return (
    params.has("code") ||
    params.has("error") ||
    params.has("error_description")
  );
}

export async function completeGithubOAuthCallback(
  search = typeof window === "undefined" ? "" : window.location.search,
  config = githubOAuthConfig()
): Promise<GithubOAuthTokenResult | null> {
  const params = new URLSearchParams(search);
  const oauthError = params.get("error");
  if (oauthError) {
    throw new GithubOAuthError(
      params.get("error_description") ?? oauthError,
      400
    );
  }

  const code = params.get("code");
  if (!code) {
    return null;
  }

  const expectedState = sessionStorage.getItem(OAUTH_STATE_KEY);
  const actualState = params.get("state");
  if (!expectedState || !actualState || expectedState !== actualState) {
    throw new GithubOAuthError("GitHub OAuth-State ist ungueltig.", 400);
  }
  if (!config.exchangeUrl.trim()) {
    throw new GithubOAuthError(
      "GitHub OAuth Exchange-Endpunkt fehlt.",
      400
    );
  }

  const response = await fetch(config.exchangeUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      code,
      redirectUri: config.redirectUri
    })
  });
  const json = (await response.json()) as GithubOAuthExchangeResponse;
  if (!response.ok || json.error) {
    throw new GithubOAuthError(
      json.error_description ?? json.error ?? "GitHub OAuth fehlgeschlagen.",
      response.status
    );
  }

  const token = json.access_token ?? json.token;
  if (!token) {
    throw new GithubOAuthError(
      "GitHub OAuth-Antwort enthaelt kein Zugriffstoken.",
      502
    );
  }

  sessionStorage.removeItem(OAUTH_STATE_KEY);
  return {
    token,
    tokenType: json.token_type,
    scope: json.scope
  };
}

export function clearGithubOAuthCallbackParams(): void {
  if (typeof window === "undefined") {
    return;
  }
  const url = new URL(window.location.href);
  for (const key of ["code", "state", "error", "error_description"]) {
    url.searchParams.delete(key);
  }
  window.history.replaceState({}, document.title, url.toString());
}

function createOauthState(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join(
    ""
  );
}

function currentCleanUrl(): string {
  if (typeof window === "undefined") {
    return "";
  }
  const url = new URL(window.location.href);
  for (const key of ["code", "state", "error", "error_description"]) {
    url.searchParams.delete(key);
  }
  return url.toString();
}
