# History GO — spillbarhets-gaprapport — historisk snapshot

> **Status: historical.** Den tidligere gaprapporten var basert på en place-audit fra **30. april 2026**, eldre aggregate place-filer og en daværende PR-plan. Den skal ikke brukes som nåstatus eller som aktiv arbeidskø.

Den opprinnelige rapporten er bevart i Git-historikken fram til denne endringen.

## Bruk disse kildene nå

- [`HISTORY_GO_PRODUCT_MAP.md`](./HISTORY_GO_PRODUCT_MAP.md) — canonical produktkart og ferdigstillelsesprioritet
- [`COMPLETION_DEFINITIONS.md`](./COMPLETION_DEFINITIONS.md) — hva «fullført» betyr
- [`PROGRESSION_MODEL.md`](./PROGRESSION_MODEL.md) — progresjons-read-model
- [`PLACE_STANDARD.md`](./PLACE_STANDARD.md) — modenhetsnivå og stedstandard
- [`../reports/README.md`](../reports/README.md) — hvilke rapporter som er aktive eller historiske
- `npm run health:data` — regenererer aktuell datahelse
- `reports/data-health-summary.md` — sist genererte, commit-bundne summary; kontroller alltid `Generated`-datoen før bruk

## Regel

Ikke kopier gamle tall, filnavn eller PR-prioriteringer fra denne historiske rapporten videre. Når en ny samlet spillbarhetsaudit trengs, skal den:

1. genereres fra dagens manifests og source-filer,
2. oppgi dato og commit SHA,
3. ligge under `reports/`,
4. skille faktiske målinger fra produktprioriteringer,
5. registreres i `docs/documentation_registry.json` bare dersom den skal ha en aktiv styringsrolle.
