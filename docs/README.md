# History GO — dokumentasjonskart

Status: **canonical dokumentasjonsinngang**  
Register: [`documentation_registry.json`](./documentation_registry.json)  
Sist kontrollert: **2026-07-25**

Dette dokumentet svarer på tre spørsmål:

1. Hvilket dokument skal leses for en bestemt type beslutning?
2. Hvilke dokumenter er normative, operative, transitional eller historiske?
3. Hvilken fil må oppdateres når en kontrakt endres?

## Grunnregel

> Én sannhet per ansvarsområde.

Markdown-filer blir ikke automatisk runtime-data. Produksjonsinnhold styres av source-data, manifester, loadere og validering. Dokumentasjonen styrer arkitektur, arbeidsmåte og kontrakter; CI må håndheve de reglene som ikke kan overlates til tekst alene.

## Leserekkefølge

### Teknologi, språk, backend og dataeierskap

1. [`HISTORY_GO_TECHNICAL_ARCHITECTURE.md`](./HISTORY_GO_TECHNICAL_ARCHITECTURE.md)
2. [`TYPESCRIPT_FIRST_POLICY.md`](./TYPESCRIPT_FIRST_POLICY.md)
3. [`typescript-migration-plan.md`](./typescript-migration-plan.md)

`TYPESCRIPT_MIGRATION.md` i repo-roten er historisk journal, ikke aktiv policy.

### Dagens runtime

1. [`../README/SYSTEM_REGISTRY.md`](../README/SYSTEM_REGISTRY.md) — hvem eier hva
2. [`../README/SYSTEM_MAP.md`](../README/SYSTEM_MAP.md) — hva skjer i flyten
3. [`../README/README_DEV.md`](../README/README_DEV.md) — kjøring, debugging og validering

`SYSTEM_REGISTRY.md` er fortsatt bindende, men er merket `transitional` fordi aktiv kontrakt og gammel innlimt historikk fortsatt ligger i samme fil. Den skal deles i fase 2 uten å endre runtime-kontraktene tilfeldig.

### Produkt og ferdigstillelse

1. [`../README/README.md`](../README/README.md) — hovedoversikt
2. [`HISTORY_GO_PRODUCT_MAP.md`](./HISTORY_GO_PRODUCT_MAP.md) — produktkart og prioritet
3. [`COMPLETION_DEFINITIONS.md`](./COMPLETION_DEFINITIONS.md) — definisjon av fullført
4. [`PROGRESSION_MODEL.md`](./PROGRESSION_MODEL.md) — progresjons-read-model
5. [`PLACE_STANDARD.md`](./PLACE_STANDARD.md) — komplett sted

Følgende filer er snapshots og skal ikke brukes som nåstatus:

- `README/CURRENT_PRODUCT_STATE.md`
- `docs/IMPLEMENTATION_STATUS.md`
- `docs/HISTORY_GO_PLAYABLE_GAP_AUDIT.md`

### Data og innholdsproduksjon

1. [`DATA_PRODUCTION_CONTRACT.md`](./DATA_PRODUCTION_CONTRACT.md)
2. relevante manifests under `data/**/manifest.json`
3. lokale README-filer ved datasettet
4. relevante audits og CI-gates

Ved konflikt mellom en gammel path i dokumentasjon og manifestet er manifestet/runtime-koden sannhetskilden. Dokumentet skal deretter korrigeres.

### Fag, emner og quiz

1. [`../README/README.pensum.md`](../README/README.pensum.md)
2. [`../README/fagstrukturREADME.md`](../README/fagstrukturREADME.md)
3. [`../README/emnepackREADME`](../README/emnepackREADME)
4. [`../README/quizREADME.md`](../README/quizREADME.md)
5. canonical JSON-registre og generatorregler under `data/fag/` og `data/quiz/`

`README/quizREADME.md` er merket `transitional` inntil gamle eksempelpaths og generatorversjoner er synkronisert med dagens manifest- og V5.1-pipeline.

### Rapporter og audits

- [`../reports/README.md`](../reports/README.md) eier rapportreglene.
- `reports/data-health-summary.md` er aktiv planleggingsbaseline når den er regenerert.
- Andre markdown-rapporter i `reports/` er tidsbundne snapshots med mindre de uttrykkelig er registrert som canonical.

## Statusmodell

| Status | Betydning |
|---|---|
| `canonical` | Normativ kilde for ett avgrenset område |
| `operational` | Aktiv inngang eller arbeidsinstruks som peker til canonical kilder |
| `transitional` | Aktiv, men med kjent konsoliderings- eller legacygjeld |
| `historical` | Snapshot, rapport eller journal; ikke nåstatus |
| `local` | Gjelder bare subsystemet eller datamappen den ligger ved |

Maskinlesbar status ligger i [`documentation_registry.json`](./documentation_registry.json).

## Når dokumentasjon må oppdateres

Oppdater riktig canonical dokument når en endring berører:

- entrypoint eller modulansvar,
- runtime-flyt eller event,
- storage-key eller datakontrakt,
- språk-, build- eller CI-policy,
- klient/server/database-eierskap,
- manifest eller canonical datastruktur,
- produktavgrensning eller ferdigdefinisjon.

Ikke opprett en ny `README`, `STATUS`, `PLAN`, `AUDIT` eller `FINAL`-fil før dokumentregisteret er kontrollert. Nye tidsbundne funn skal normalt til `reports/`, ikke bli en ny global fasit.

## Dokumentasjonskontroll

Workflowen `Documentation governance` validerer:

- at alle registrerte filer finnes,
- at canonical eierskap ikke dupliseres,
- at historiske dokumenter er merket med årsak eller erstatter,
- at inngangsdokumentenes lokale lenker ikke er brutte,
- at denne indeksen omtaler alle canonical og transitional dokumenter.

Kontrollen kjøres når sentrale dokumenter, registeret eller kontrollscriptet endres.

## Neste konsolideringsfaser

### Fase 2

- del `README/SYSTEM_REGISTRY.md` i aktiv kontrakt og arkivert legacytekst,
- korriger gamle aggregate paths i `docs/DATA_PRODUCTION_CONTRACT.md`,
- merk snapshot-status direkte øverst i `CURRENT_PRODUCT_STATE`, `IMPLEMENTATION_STATUS` og gap-auditen,
- reduser `DOCS.md` til en ren inngang til denne filen.

### Fase 3

- konsolider quizdokumentasjonen mot aktiv V5.1-/manifestpipeline,
- opprett én Civication-dokumentindeks,
- flytt daterte audits og migreringsstatus til `reports/archive/`,
- standardiser extensionløse, feilstavede og dupliserte README-navn med redirects eller lenkeoppdatering.
