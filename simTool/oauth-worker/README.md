# GitHub OAuth- und Routing-Worker

Dieser Worker tauscht unter `/github-oauth` den GitHub-OAuth-Code gegen ein
Zugriffstoken. Unter `/route` geocodiert er bei Bedarf das aktive Haus und ruft
bis zu sechs Strassenrouten bei OpenRouteService ab. Geheimnisse bleiben damit
aus dem GitHub-Pages-Build und aus dem Browser heraus.

## GitHub OAuth App

1. GitHub OAuth App anlegen.
2. Callback URL auf die GitHub-Pages-URL der App setzen, z. B.:

```text
https://pdoeble.github.io/RenntnerHazienda/
```

3. Fuer ein oeffentliches Repo reicht in der App `VITE_GITHUB_OAUTH_SCOPE=public_repo`. Fuer private Repos ist `repo` noetig.

## Worker-Secrets

`GITHUB_OAUTH_CLIENT_ID` und `ALLOWED_ORIGIN` sind als nicht geheime
Laufzeitvariablen in `wrangler.json` gesetzt.

Im Worker werden folgende Geheimnisse gesetzt:

```text
GITHUB_OAUTH_CLIENT_SECRET=<client secret der GitHub OAuth App>
OPENROUTESERVICE_API_KEY=<API-Key von OpenRouteService>
```

`ALLOWED_ORIGIN` kann mehrere komma-getrennte Urspruenge enthalten. Fuer den
aktuellen Betrieb sind `https://pdoeble.github.io` und
`http://127.0.0.1:5173` vorgesehen. `ALLOWED_ORIGIN=*` waere nur fuer isolierte
lokale Tests sinnvoll.

Der OpenRouteService-Schluessel wird im Cloudflare-Dashboard unter
`Workers & Pages -> renntnerhazienda-oauth -> Settings -> Variables and Secrets`
als verschluesseltes Secret angelegt.

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
VITE_ROUTE_PROXY_URL=https://renntnerhazienda-oauth.philip-doebler1997.workers.dev/route
```

Der `client_secret` darf nie als `VITE_...` Variable gesetzt werden.
Dasselbe gilt fuer `OPENROUTESERVICE_API_KEY`.

## Routing-Vertrag

`POST /route` erwartet ein bis sechs Urspruenge sowie Zielkoordinaten oder eine
Zieladresse. Die Antwort enthaelt das aufgeloeste Ziel, erfolgreiche
GeoJSON-Routen und Fehler je Ursprung. Ein Fehler fuer einen Wohnort bricht die
anderen Routen nicht ab.

```json
{
  "origins": [
    {
      "id": "esslingen",
      "label": "Esslingen am Neckar",
      "latitude": 48.742,
      "longitude": 9.311
    }
  ],
  "destination": {
    "address": "6167 Telfes im Stubai, Tirol, Oesterreich",
    "label": "Aktives Haus"
  }
}
```
