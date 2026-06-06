import { afterEach, describe, expect, it, vi } from "vitest";
import {
  GithubProjectError,
  loadGithubProject,
  saveGithubProject,
  type GithubProjectConfig
} from "./githubProject";

const config: GithubProjectConfig = {
  owner: "pdoeble",
  repo: "RenntnerHazienda",
  branch: "main",
  path: "simTool/public/projects/current.immo-project.json"
};

describe("github project persistence", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    sessionStorage.clear();
  });

  it("loads and decodes an existing project file", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        content: btoa("{\"schema\":\"immo-finance.project\"}"),
        encoding: "base64",
        sha: "abc123"
      })
    });
    vi.stubGlobal("fetch", fetchMock);

    const file = await loadGithubProject("token", config);

    expect(file).toEqual({
      content: "{\"schema\":\"immo-finance.project\"}",
      sha: "abc123"
    });
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.github.com/repos/pdoeble/RenntnerHazienda/contents/simTool/public/projects/current.immo-project.json?ref=main",
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer token"
        })
      })
    );
  });

  it("returns null when the GitHub project file does not exist", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        text: async () => "not found"
      })
    );

    await expect(loadGithubProject("token", config)).resolves.toBeNull();
  });

  it("creates a project file when no sha exists yet", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: false,
        status: 404,
        text: async () => "not found"
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 201,
        text: async () => "{}"
      });
    vi.stubGlobal("fetch", fetchMock);

    await saveGithubProject("{\"ok\":true}", "token", config);

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[1]?.[0]).toBe(
      "https://api.github.com/repos/pdoeble/RenntnerHazienda/contents/simTool/public/projects/current.immo-project.json"
    );
    const body = JSON.parse(String(fetchMock.mock.calls[1]?.[1]?.body)) as {
      branch: string;
      content: string;
      sha?: string;
    };
    expect(body.branch).toBe("main");
    expect(body.sha).toBeUndefined();
    expect(atob(body.content)).toBe("{\"ok\":true}");
  });

  it("updates an existing project file with its sha", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          content: btoa("{}"),
          encoding: "base64",
          sha: "sha-existing"
        })
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: async () => "{}"
      });
    vi.stubGlobal("fetch", fetchMock);

    await saveGithubProject("{\"ok\":true}", "token", config);

    const body = JSON.parse(String(fetchMock.mock.calls[1]?.[1]?.body)) as {
      sha?: string;
    };
    expect(body.sha).toBe("sha-existing");
  });

  it("retries a GitHub conflict with a refreshed sha", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          content: btoa("{}"),
          encoding: "base64",
          sha: "sha-old"
        })
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 409,
        text: async () => "conflict"
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          content: btoa("{}"),
          encoding: "base64",
          sha: "sha-fresh"
        })
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: async () => "{}"
      });
    vi.stubGlobal("fetch", fetchMock);

    await saveGithubProject("{\"ok\":true}", "token", config);

    expect(fetchMock).toHaveBeenCalledTimes(4);
    const retryBody = JSON.parse(String(fetchMock.mock.calls[3]?.[1]?.body)) as {
      sha?: string;
    };
    expect(retryBody.sha).toBe("sha-fresh");
  });

  it("surfaces auth and conflict failures", async () => {
    await expect(saveGithubProject("{}", null, config)).rejects.toMatchObject({
      status: 401
    } satisfies Partial<GithubProjectError>);

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 403,
        text: async () => "forbidden"
      })
    );
    await expect(loadGithubProject("token", config)).rejects.toMatchObject({
      status: 403
    } satisfies Partial<GithubProjectError>);

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: false,
        status: 404,
        text: async () => "not found"
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 409,
        text: async () => "conflict"
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 404,
        text: async () => "not found"
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 409,
        text: async () => "conflict after retry"
      });
    vi.stubGlobal("fetch", fetchMock);

    await expect(saveGithubProject("{}", "token", config)).rejects.toMatchObject({
      status: 409
    } satisfies Partial<GithubProjectError>);
  });
});
