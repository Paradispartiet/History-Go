# AHA analysis migration (PR 1): canonical analysis object

Denne PR-en starter migreringsarbeidet ved å dokumentere **dagens analyseflyt** og innføre ett canonical analysis object som senere kan leveres av en Python-backend.

## Avgrensing i denne PR-en

- Ingen Python-backend.
- Ingen visuell UI-endring.
- Ingen flytting av AHA-analyse til backend.
- Ingen databasenivå-endringer.
- Frontend eier fortsatt rendering/UI.
- Lokal JS-basert innsikts-/analyseflyt forblir aktiv.

## Dagens AHA-analyseflyt i History-Go (faktisk flyt)

1. **Brukersignal oppstår i History Go** (quiz/logg/innsikter/knowledge/next-up) og samles i eksportpayloaden `aha_import_payload_v1` via `js/aha.js`.
2. **Importbroen i AHA** (`AHA/ahaHistoryGoImport.js`) leser `aha_import_payload_v1` og konverterer hvert element til signal-tekst + metadata (`collectNextUpSignal`, `collectLearningLogSignals`, `collectInsightEventSignals`, `collectKnowledgeSignals`).
3. Signalene mates inn i eksisterende lokal JS-motor via `InsightsEngine.createSignalFromMessage(...)` og lagres i kammeret (`aha_insight_chamber_v1`).
4. **AHA SER / innsiktsvisning** (read-only) rendrer innholdet fra kammeret i `AHA/ahaInsights.js`.
5. History Go ↔ AHA-koblingene (sync/readback/open) ligger i `js/aha.js`.

Merk: **AHA chat UI** ligger canonical i AHA-EchoNet, ikke i denne lokale History-Go-flaten.

## Canonical AHA analysis object (for backend-migrering)

```json
{
  "contentType": "",
  "domain": "",
  "theme": "",
  "mainTension": "",
  "keyInsight": "",
  "fieldConnections": [],
  "historyGoLinks": [],
  "suggestedActions": [],
  "confidence": {
    "contentType": 0,
    "domain": 0,
    "theme": 0,
    "mainTension": 0,
    "historyGoLinks": 0
  },
  "warnings": []
}
```

## Mapping fra eksisterende/nærliggende feltnavn

- `INNHOLDSTYPE` → `contentType`
- `DOMENE` → `domain`
- `TEMA` → `theme`
- `HOVEDSPENNING` → `mainTension`
- `VIKTIGSTE INNSIKT` → `keyInsight`
- `FAGKOBLINGER` → `fieldConnections`
- `HISTORY_GO_LINKS` → `historyGoLinks`
- `ANBEFALTE TILTAK` → `suggestedActions`
- `ADVARSLER` → `warnings`

## Hva backend senere skal levere

Ved Python-migrering skal backend returnere objektet over som **canonical API-shape** for AHA-analyse.
Frontend kan da fortsette å bruke samme rendering-kontrakt, men bytte kilde fra lokal JS-analyse til backend-respons trinnvis.
