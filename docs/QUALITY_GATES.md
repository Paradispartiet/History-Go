# AHA — quality gates

Status: **operational compatibility-pointer**  
Sist kontrollert: **2026-07-25**

Denne filstien beholdes for eldre referanser. Den er ikke en generell kvalitetskontrakt for History GO, Civication, quiz, data eller CI.

AHA-kvalitetsstatusen beskrives i:

- [`AHA_QUALITY_STATUS_SURFACE_V1.md`](./AHA_QUALITY_STATUS_SURFACE_V1.md)

Den flaten er en lokal, read-only og dokumentasjonsdefinert statusmodell for kvaliteten på én aktuell AHA-samtale eller analyse. Den:

- gjenbruker eksisterende resultater for source binding, topic consistency, stale-data guards og analysis isolation;
- kan vise `unknown`, `ok`, `warning` eller `blocked` konservativt;
- starter ikke sync;
- aktiverer ikke EchoNet;
- skriver ikke permanent minne;
- er ikke en generell repository quality gate.

Runtime er ikke etablert av dokumentet alene. Dersom en implementasjon opprettes, må den følge den eksplisitte sikkerhets- og outputkontrakten i AHA-dokumentet og registreres som egen runtimeendring.

Generelle repo- og dataproduksjonskontroller finnes i de konkrete kontraktene og workflowene som eier dem, blant annet:

- [`DATA_PRODUCTION_CONTRACT.md`](./DATA_PRODUCTION_CONTRACT.md)
- [`../README/README_DEV.md`](../README/README_DEV.md)
- [`../README/TEAM_WORKFLOW.md`](../README/TEAM_WORKFLOW.md)
- `.github/workflows/*`
