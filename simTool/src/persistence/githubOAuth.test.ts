import { afterEach, describe, expect, it, vi } from "vitest";
import {
  beginGithubOAuthLogin,
  buildGithubOAuthAuthorizeUrl,
  completeGithubOAuthCallback,
  GithubOAuthError,
  hasGithubOAuthCallback,
  isGithubOAuthConfigured,
  type GithubOAuthConfig
} from "./githubOAuth";

const config: GithubOAuthConfig = {
  clientId: "client-123",
  exchangeUrl: "https://oauth.example.test/exchange",
  scope: "public_repo",
  redirectUri: "https://pages.example.test/RenntnerHazienda/",
  authorizeUrl: "https://github.com/login/oauth/authorize"
};

describe("github OAuth flow", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    sessionStorage.clear();
  });

  it("builds a GitHub authorization URL", () => {
    const url = new URL(buildGithubOAuthAuthorizeUrl(config, "state-123"));

    expect(url.origin + url.pathname).toBe(
      "https://github.com/login/oauth/authorize"
    );
    expect(url.searchParams.get("client_id")).toBe("client-123");
    expect(url.searchParams.get("redirect_uri")).toBe(config.redirectUri);
    expect(url.searchParams.get("scope")).toBe("public_repo");
    expect(url.searchParams.get("state")).toBe("state-123");
  });

  it("reports whether OAuth is configured", () => {
    expect(isGithubOAuthConfigured(config)).toBe(true);
    expect(isGithubOAuthConfigured({ ...config, exchangeUrl: "" })).toBe(false);
  });

  it("starts login by storing state and assigning the authorize URL", () => {
    const assignLocation = vi.fn();

    beginGithubOAuthLogin(config, assignLocation);

    expect(assignLocation).toHaveBeenCalledTimes(1);
    const authorizeUrl = new URL(String(assignLocation.mock.calls[0]?.[0]));
    expect(authorizeUrl.searchParams.get("state")).toMatch(/^[a-f0-9]{32}$/);
  });

  it("exchanges a valid callback code for a token", async () => {
    const assignLocation = vi.fn();
    beginGithubOAuthLogin(config, assignLocation);
    const authorizeUrl = new URL(String(assignLocation.mock.calls[0]?.[0]));
    const state = authorizeUrl.searchParams.get("state") ?? "";
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        access_token: "oauth-token",
        token_type: "bearer",
        scope: "public_repo"
      })
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await completeGithubOAuthCallback(
      `?code=code-123&state=${state}`,
      config
    );

    expect(result).toEqual({
      token: "oauth-token",
      tokenType: "bearer",
      scope: "public_repo"
    });
    expect(fetchMock).toHaveBeenCalledWith(
      config.exchangeUrl,
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          code: "code-123",
          redirectUri: config.redirectUri
        })
      })
    );
  });

  it("rejects callback state mismatches", async () => {
    beginGithubOAuthLogin(config, vi.fn());

    await expect(
      completeGithubOAuthCallback("?code=code-123&state=wrong", config)
    ).rejects.toBeInstanceOf(GithubOAuthError);
  });

  it("detects OAuth callback search parameters", () => {
    expect(hasGithubOAuthCallback("?code=abc&state=state")).toBe(true);
    expect(hasGithubOAuthCallback("?error=access_denied")).toBe(true);
    expect(hasGithubOAuthCallback("?tab=project")).toBe(false);
  });
});
