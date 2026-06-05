# GitHub OAuth Exchange Worker

Dieser Worker tauscht den GitHub-OAuth-Code gegen ein Zugriffstoken. Er ist noetig, weil GitHub Pages keinen geheimen `client_secret` sicher halten kann.

## GitHub OAuth App

1. GitHub OAuth App anlegen.
2. Callback URL auf die GitHub-Pages-URL der App setzen, z. B.:

```text
https://pdoeble.github.io/RenntnerHazienda/
```

3. Fuer ein oeffentliches Repo reicht in der App `VITE_GITHUB_OAUTH_SCOPE=public_repo`. Fuer private Repos ist `repo` noetig.

## Worker-Secrets

Im Worker setzen:

```text
GITHUB_OAUTH_CLIENT_ID=<client id der GitHub OAuth App>
GITHUB_OAUTH_CLIENT_SECRET=<client secret der GitHub OAuth App>
ALLOWED_ORIGIN=https://pdoeble.github.io
```

`ALLOWED_ORIGIN=*` ist nur fuer lokale Tests sinnvoll.

## Cloudflare Deploy

Wenn der Worker ueber Cloudflare Workers Builds aus diesem Repo deployed wird:

```text
Root directory: simTool/oauth-worker
Build command: leer lassen
Deploy command: npx wrangler deploy
```

`wrangler.json` enthaelt den Worker-Namen, den Einstiegspunkt und das
`compatibility_date`.

## simTool-Env

Im Vite/GitHub-Pages-Build setzen:

```text
VITE_GITHUB_OAUTH_CLIENT_ID=<client id der GitHub OAuth App>
VITE_GITHUB_OAUTH_EXCHANGE_URL=https://<worker-domain>/github-oauth
VITE_GITHUB_OAUTH_SCOPE=public_repo
VITE_GITHUB_OAUTH_REDIRECT_URI=https://pdoeble.github.io/RenntnerHazienda/
```

Der `client_secret` darf nie als `VITE_...` Variable gesetzt werden.
