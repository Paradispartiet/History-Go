# AHA-modul (frontend + backend for AHA-agent)

AHA kan fortsatt kjøres lokalt med innsiktsmotor/metamotor uten AI-backend.

## Starte backend lokalt

1. Gå til mappen:
   ```bash
   cd AHA
   ```
2. Sett miljøvariabel:
   ```bash
   export OPENAI_API_KEY="din_openai_api_nokkel"
   ```
3. Start server:
   ```bash
   npm start
   ```

Backend kjører da på `http://localhost:3000` (eller `PORT` hvis satt) og eksponerer:

- `POST /api/aha-agent`

## API-kontrakt frontend -> backend

Request body til `/api/aha-agent`:

```json
{
  "message": "brukerens tekst",
  "ai_state": { "...": "AHA innsiktsstate" }
}
```

Response:

```json
{
  "reply": "tekstsvar fra AHA-agent",
  "raw": {
    "id": "...",
    "model": "..."
  }
}
```

## Frontend-endepunkt

Frontend i `ahaChat.js` bruker:

- `window.AHA_AGENT_ENDPOINT` hvis definert
- fallback: `/api/aha-agent`

Eksempel (for ekstern backend):

```html
<script>
  window.AHA_AGENT_ENDPOINT = "https://din-backend.example.com/api/aha-agent";
</script>
```

## GitHub Pages

GitHub Pages kan ikke kjøre Node/Express backend direkte. For live AHA-agent må backend deployes separat (f.eks. Render, Fly.io, Railway, serverless funksjon e.l.) og frontend må peke til den via `window.AHA_AGENT_ENDPOINT`.
