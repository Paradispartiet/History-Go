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

Compatibility-filer som bare videresender eldre lenker:

- `README/CURRENT_PRODUCT_STATE.md` — peker til aktiv hovedoversikt og produktkart
- `docs/HISTORY_GO_PLAYABLE_GAP_AUDIT.md` — peker til aktuelle produkt-, standard- og datakilder

Historisk snapshot som ikke skal brukes som nåstatus:

- `docs/IMPLEMENTATION_STATUS.md` — avgrenset snapshot for Social, Civication Home og Spotmeeting

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
- `npm run health:data` regenererer datahelse.
- `reports/data-health-summary.md` er en commit-bundet snapshot; kontroller alltid `Generated`-datoen.
- Andre markdown-rapporter i `reports/` er tidsbundne snapshots med mindre de uttrykkelig er registrert som canonical.

## Statusmodell

| Status | Betydning |
|---|---|
| `canonical` | Normativ kilde for ett avgrenset område |
| `operational` | Aktiv inngang, arbeidsinstruks eller compatibility-pointer som peker til canonical kilder |
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

Workflowen bygger også et inventar som viser:

- totalt antall dokumentlignende filer,
- fordeling mellom rot, `README/`, `docs/`, `reports/` og lokale subsystemer,
- uregistrerte globale dokumentkandidater,
- mistenkelige og extensionløse filnavn,
- grupper med overlappende basenames,
- aktive dokumenter som lenker til registrerte historiske snapshots.

Auditlogg og `inventory.json` lagres samlet i workflow-artifactet `documentation-governance-audit`.

## Konsolideringsstatus

### Gjennomført

- canonical dokumentregister og dokumentasjonsgate
- `DOCS.md` redusert til inngang
- gamle politikk-aggregate-paths fjernet fra dataproduksjonskontrakten
- `IMPLEMENTATION_STATUS` merket som historisk snapshot
- tidligere `CURRENT_PRODUCT_STATE` erstattet med compatibility-pointer
- gammel spillbarhets-gaprapport erstattet med compatibility-tombstone
- maskinlesbart dokumentinventar lagt til i dokumentasjonsgaten
- aktiv `SYSTEM_REGISTRY` skilt fra byte-identisk pre-split-arkiv
- aktive subsystemappendikser samlet i en egen canonical kontrakt

### Neste

- bruk inventaret til å rydde uregistrerte globale dokumentkandidater kontrollert
- konsolider quizdokumentasjonen mot aktiv V5.1-/manifestpipeline
- opprett én Civication-dokumentindeks
- flytt daterte audits og migreringsstatus til `reports/archive/`
- standardiser de mistenkelige README-filnavnene med redirects eller lenkeoppdatering
