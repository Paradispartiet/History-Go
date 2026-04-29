# AHA-modul (frontend + backend for AHA-agent)

AHA kan fortsatt kjøres lokalt med innsiktsmotor/metamotor uten AI-backend.

## Deploy backend på Render

### Alternativ A: med `render.yaml` (anbefalt)
Repoet inneholder `render.yaml` i roten. Opprett en ny **Blueprint** i Render mot dette repoet.

Konfigurasjonen bruker:
- `rootDir`: `AHA`
- `buildCommand`: `npm install`
- `startCommand`: `npm start`
- `runtime`: Node

`OPENAI_API_KEY` er definert som env var med `sync: false`, som betyr at du må sette verdien manuelt i Render-dashboardet (ikke i repoet).

### Alternativ B: manuell Render Web Service
Hvis du ikke bruker Blueprint:
1. Velg repo: `Paradispartiet/History-Go`
2. **Root Directory**: `AHA`
3. **Build Command**: `npm install`
4. **Start Command**: `npm start`
5. Legg til miljøvariabel:
   - `OPENAI_API_KEY` = din OpenAI API-nøkkel (kun i Render)

## Starte backend lokalt

```bash
cd AHA
export OPENAI_API_KEY="din_openai_api_nokkel"
npm install
npm start
```

Backend kjører på `http://localhost:3000` (eller `PORT` hvis satt) og eksponerer:

- `GET /health`
- `POST /api/aha-agent`

## Test backend-endepunkter

### Health-check
```bash
curl https://DIN-BACKEND-URL/health
```
Forventet respons:
```json
{"ok":true}
```

### AHA-agent
```bash
curl -X POST https://DIN-BACKEND-URL/api/aha-agent \
  -H "Content-Type: application/json" \
  -d '{
    "message":"Hva ser du i innsiktene mine?",
    "ai_state":{"topic_id":"th_default","top_insights":[]}
  }'
```
Forventet respons (forkortet):
```json
{
  "reply": "...",
  "raw": { "id": "...", "model": "..." }
}
```

## Frontend endpoint-konfig (`AHA/ahaConfig.js`)

`AHA/ahaConfig.js` er laget for trygg konfig uten hemmeligheter.

Standard:
```js
window.AHA_AGENT_ENDPOINT = window.AHA_AGENT_ENDPOINT || "";
```

For ekstern backend, sett URL slik:
```js
window.AHA_AGENT_ENDPOINT = "https://DIN-BACKEND-URL/api/aha-agent";
```

Hvis filen ikke settes med ekstern URL, bruker `ahaChat.js` fallback:
- `"/api/aha-agent"`

## Test fra GitHub Pages (live)

1. Deploy backend (Render/Railway) og bekreft `GET /health`.
2. Sett backend-URL i `AHA/ahaConfig.js`:
   - `window.AHA_AGENT_ENDPOINT = "https://DIN-BACKEND-URL/api/aha-agent";`
3. Push til GitHub slik at Pages publiserer oppdatert frontend.
4. Åpne AHA-siden i nettleser.
5. Skriv en melding i chat-feltet.
6. Trykk **AHA-AI**.
7. Forvent et strukturert svar fra AHA-agenten i chat-loggen.

## Viktig sikkerhet

- Ikke legg `OPENAI_API_KEY` i frontend.
- Ikke commit API-nøkler i repoet.
- Sett `OPENAI_API_KEY` kun som miljøvariabel i backend-miljø (Render/Railway).
