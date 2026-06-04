const TOKEN_KEY = "renntner_hazienda_github_token";

export type GithubProjectConfig = {
  owner: string;
  repo: string;
  branch: string;
  path: string;
};

export type GithubProjectFile = {
  content: string;
  sha: string;
};

type GithubContentResponse = {
  content: string;
  sha: string;
  encoding: string;
};

export class GithubProjectError extends Error {
  constructor(
    readonly status: number,
    message: string
  ) {
    super(message);
    this.name = "GithubProjectError";
  }
}

export function githubProjectConfig(): GithubProjectConfig {
  return {
    owner: import.meta.env.VITE_GITHUB_OWNER ?? "pdoeble",
    repo: import.meta.env.VITE_GITHUB_REPO ?? "RenntnerHazienda",
    branch: import.meta.env.VITE_GITHUB_BRANCH ?? "main",
    path:
      import.meta.env.VITE_GITHUB_PROJECT_PATH ??
      "simTool/public/projects/current.immo-project.json"
  };
}

export function getStoredGithubToken(): string | null {
  return sessionStorage.getItem(TOKEN_KEY) ?? import.meta.env.VITE_GITHUB_TOKEN ?? null;
}

export function setStoredGithubToken(token: string | null): void {
  if (token?.trim()) {
    sessionStorage.setItem(TOKEN_KEY, token.trim());
  } else {
    sessionStorage.removeItem(TOKEN_KEY);
  }
}

export async function loadGithubProject(
  token: string | null = getStoredGithubToken(),
  config = githubProjectConfig()
): Promise<GithubProjectFile | null> {
  const response = await fetch(githubContentUrl(config), {
    headers: githubHeaders(token)
  });

  if (response.status === 404) {
    return null;
  }
  if (!response.ok) {
    throw new GithubProjectError(response.status, await response.text());
  }

  const json = (await response.json()) as GithubContentResponse;
  return {
    content: decodeBase64(json.content),
    sha: json.sha
  };
}

export async function saveGithubProject(
  content: string,
  token: string | null = getStoredGithubToken(),
  config = githubProjectConfig()
): Promise<void> {
  if (!token) {
    throw new GithubProjectError(401, "Kein GitHub-Token gesetzt.");
  }

  const existing = await loadGithubProject(token, config);
  const response = await fetch(githubContentUrl(config, false), {
    method: "PUT",
    headers: {
      ...githubHeaders(token),
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      message: "simTool: update current project",
      branch: config.branch,
      content: encodeBase64(content),
      ...(existing?.sha ? { sha: existing.sha } : {})
    })
  });

  if (!response.ok) {
    throw new GithubProjectError(response.status, await response.text());
  }
}

function githubContentUrl(config: GithubProjectConfig, includeRef = true): string {
  const path = config.path
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/");
  const url = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${path}`;
  return includeRef ? `${url}?ref=${encodeURIComponent(config.branch)}` : url;
}

function githubHeaders(token: string | null): HeadersInit {
  return {
    Accept: "application/vnd.github+json",
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

function decodeBase64(value: string): string {
  return decodeURIComponent(escape(atob(value.replace(/\n/g, ""))));
}

function encodeBase64(value: string): string {
  return btoa(unescape(encodeURIComponent(value)));
}
