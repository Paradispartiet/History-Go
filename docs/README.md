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

### Dagens runtime og arbeidsflyt

1. [`../README/SYSTEM_REGISTRY.md`](../README/SYSTEM_REGISTRY.md) — overordnet runtime-eierskap og kjernegrenser
2. [`../README/SYSTEM_REGISTRY_SUBSYSTEM_CONTRACTS.md`](../README/SYSTEM_REGISTRY_SUBSYSTEM_CONTRACTS.md) — aktive API-, storage-, privacy- og UI-kontrakter for subsystemene
3. [`../README/SYSTEM_MAP.md`](../README/SYSTEM_MAP.md) — hva skjer i flyten
4. [`../README/README_DEV.md`](../README/README_DEV.md) — kjøring, debugging og validering
5. [`../README/TEAM_WORKFLOW.md`](../README/TEAM_WORKFLOW.md) — arbeidsflyt og dokumentprioritet ved endringer

`SYSTEM_REGISTRY.md` og `SYSTEM_REGISTRY_SUBSYSTEM_CONTRACTS.md` utgjør sammen den aktive runtime-kontrakten. Den tidligere pre-split-filen er bevart byte-identisk i [`../README/archive/SYSTEM_REGISTRY_PRE_SPLIT_2026-07-25.md`](../README/archive/SYSTEM_REGISTRY_PRE_SPLIT_2026-07-25.md) som historisk sporbarhet, ikke som bindende regelverk.

### Produkt og ferdigstillelse

1. [`../README/README.md`](../README/README.md) — hovedoversikt
2. [`HISTORY_GO_PRODUCT_MAP.md`](./HISTORY_GO_PRODUCT_MAP.md) — produktkart og prioritet
3. [`COMPLETION_DEFINITIONS.md`](./COMPLETION_DEFINITIONS.md) — definisjon av fullført
4. [`PROGRESSION_MODEL.md`](./PROGRESSION_MODEL.md) — progresjons-read-model
5. [`PLACE_STANDARD.md`](./PLACE_STANDARD.md) — komplett sted

Følgende filer er snapshots og skal ikke brukes som nåstatus:

- `README/CURRENT_PRODUCT_STATE.md` — historisk status er merket direkte i filen
- `docs/IMPLEMENTATION_STATUS.md` — historisk status er merket direkte i filen
- `reports/archive/HISTORY_GO_PLAYABLE_GAP_AUDIT_2026-04-30.md` — full eldre gaprapport; `docs/HISTORY_GO_PLAYABLE_GAP_AUDIT.md` er bare en peker til aktive erstatningskilder

### Data og innholdsproduksjon

1. [`DATA_PRODUCTION_CONTRACT.md`](./DATA_PRODUCTION_CONTRACT.md)
2. relevante manifests under `data/**/manifest.json`
3. lokale README-filer ved datasettet
4. relevante audits og CI-gates

Dataproduksjonskontrakten er synkronisert med manifeststyrte, splittede politikk-places. Ved konflikt mellom dokumentasjon og et aktivt manifest er manifestet/runtime-koden sannhetskilden, og dokumentasjonen skal korrigeres.

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
- `reports/archive/` inneholder tidsbundne snapshots som er flyttet ut av aktive docs-paths.
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

Kontrollen kjører når sentrale dokumenter, registeret eller kontrollscriptet endres og lagrer en kort auditlogg som workflow-artifact.

## Konsolideringsstatus

### Gjennomført

- canonical dokumentregister og dokumentasjonsgate
- `DOCS.md` redusert til inngang
- gamle politikk-aggregate-paths fjernet fra dataproduksjonskontrakten
- `CURRENT_PRODUCT_STATE` og `IMPLEMENTATION_STATUS` merket som historiske snapshots
- aktiv `SYSTEM_REGISTRY` skilt fra byte-identisk pre-split-arkiv
- aktive subsystemappendikser bevart i egen canonical kontrakt
- spillbarhets-gaprapporten flyttet til `reports/archive/` med kort historisk peker i `docs/`

### Neste

- konsolider quizdokumentasjonen mot aktiv V5.1-/manifestpipeline
- opprett én Civication-dokumentindeks
- flytt flere daterte audits og migreringsstatuser til `reports/archive/`
- standardiser extensionløse, feilstavede og dupliserte README-navn med redirects eller lenkeoppdatering
