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
4. [`APP_STRUCTURE_INDEX.md`](./APP_STRUCTURE_INDEX.md) — canonical entry-, boot-, router-, MapView- og sidegrensekontrakt for `index.html`
5. [`../README/README_DEV.md`](../README/README_DEV.md) — kjøring, debugging og validering
6. [`../README/TEAM_WORKFLOW.md`](../README/TEAM_WORKFLOW.md) — arbeidsflyt og dokumentprioritet ved endringer

`SYSTEM_REGISTRY.md` og `SYSTEM_REGISTRY_SUBSYSTEM_CONTRACTS.md` utgjør sammen den aktive runtime-kontrakten. `APP_STRUCTURE_INDEX.md` eier bare index-appens interne struktur. Den tidligere pre-split-filen er bevart byte-identisk i [`../README/archive/SYSTEM_REGISTRY_PRE_SPLIT_2026-07-25.md`](../README/archive/SYSTEM_REGISTRY_PRE_SPLIT_2026-07-25.md) som historisk sporbarhet, ikke som bindende regelverk.

### Produkt og ferdigstillelse

1. [`../README/README.md`](../README/README.md) — hovedoversikt
2. [`HISTORY_GO_PRODUCT_MAP.md`](./HISTORY_GO_PRODUCT_MAP.md) — canonical produktkart og prioritet
3. [`COMPLETION_DEFINITIONS.md`](./COMPLETION_DEFINITIONS.md) — canonical ferdigmodell; aktiv nivåregel er Bronse → Sølv → Gull
4. [`PROGRESSION_MODEL.md`](./PROGRESSION_MODEL.md) — operativ mål-/adaptermodell for samlet progresjonslesing; erstatter ikke runtime-lagring
5. [`PLACE_STANDARD.md`](./PLACE_STANDARD.md) — canonical produktstandard for et History GO-sted

Compatibility-filer som bare videresender eldre lenker:

- `README/CURRENT_PRODUCT_STATE.md` — peker til aktiv hovedoversikt og produktkart
- `docs/HISTORY_GO_PLAYABLE_GAP_AUDIT.md` — peker til aktuelle produkt-, standard- og datakilder

Historisk snapshot som ikke skal brukes som nåstatus:

- `docs/IMPLEMENTATION_STATUS.md` — avgrenset snapshot for Social, Civication Home og Spotmeeting

### Domener, data og innholdsproduksjon

1. [`DOMAIN_CONTRACT.md`](./DOMAIN_CONTRACT.md) — bindende kategoribeslutninger
2. [`../data/categories/category_contract.json`](../data/categories/category_contract.json) — maskinlesbar sannhetskilde for runtime- og fagkategorier
3. [`DOMAIN_REGISTRY_README.md`](./DOMAIN_REGISTRY_README.md) — operativ bruk av DomainRegistry og eksplisitte legacy-aliasgrenser
4. [`DATA_PRODUCTION_CONTRACT.md`](./DATA_PRODUCTION_CONTRACT.md) — aktiv dataproduksjonskontrakt
5. relevante manifests under `data/**/manifest.json`
6. lokale README-filer ved datasettet
7. relevante audits og CI-gates

`npm run audit:categories` håndhever samsvar mellom maskinkontrakten, fagmanifestet, quizprofilregisteret, badgeindeksen, DomainRegistry, kategori-UI og place-policyen.

Aktive domenebeslutninger:

- `filosofi` er selvstendig fag- og runtimekategori.
- `populaerkultur`/`popkultur` er ikke toppkategori; eventuelle aliaser er bare legacy-kompatibilitet.
- `sosial_laering` er et non-place badge.

Ved konflikt gjelder maskinkontrakten og valideringen. Dokumentasjonen skal da korrigeres; det skal ikke opprettes lokale aliaslister eller parallelle kategorier.

Dataproduksjonskontrakten er synkronisert med manifeststyrte, splittede politikk-places. Ved konflikt mellom dokumentasjon og et aktivt manifest er manifestet/runtime-koden sannhetskilden, og dokumentasjonen skal korrigeres.

### Fag, emner og quiz

1. [`../README/README.pensum.md`](../README/README.pensum.md) — fagkart, emner og pensum
2. [`../README/fagstrukturREADME.md`](../README/fagstrukturREADME.md) — fagstruktur
3. [`../data/quiz/regler/QUIZ_PRODUCTION_CANONICAL.md`](../data/quiz/regler/QUIZ_PRODUCTION_CANONICAL.md) — eneste bindende quizproduksjonsprosedyre
4. [`../data/quiz/regler/QUIZ_TEMPLATE_REGISTRY_V2.json`](../data/quiz/regler/QUIZ_TEMPLATE_REGISTRY_V2.json) — maskinlesbar autoritetsrekkefølge, globale invariants og kategori-profiler
5. [`../data/fag/fag_manifest.json`](../data/fag/fag_manifest.json) — filresolver, full fagpakke og aktive `quizProduction.targets`
6. [`../data/quiz/manifest.json`](../data/quiz/manifest.json) — runtime-aktivering av quizfiler og target-bundne sett
7. [`../README/quizREADME.md`](../README/quizREADME.md) — compatibility-pointer til canonical produksjon, schemas, audits og runtime-eierskap

Det gamle extensionløse `README/emnepackREADME` var et biologispesifikt utkast og er fjernet. Den tidligere 913-linjers quiz-/lærings-/observations-/popup-README-en er bevart byte-identisk i `README/archive/QUIZ_README_PRE_CONSOLIDATION_2026-07-25.md`; den er historisk og eier ingen aktiv regel.

### Civication

- [`CIVICATION_README.md`](./CIVICATION_README.md) — operativ inngang til Civication-runtime, data-, rolle-, mail-, debatt- og FWG-dokumentasjon
- [`CIVICATION_DEBATE_SYSTEM.md`](./CIVICATION_DEBATE_SYSTEM.md) — operativ forklaring av Civications interne konfrontasjonsmotor
- [`../js/Civication/README.md`](../js/Civication/README.md) — motoroversikt og aktiv dagflyt
- [`../README/SYSTEM_REGISTRY_SUBSYSTEM_CONTRACTS.md`](../README/SYSTEM_REGISTRY_SUBSYSTEM_CONTRACTS.md) — bindende subsystemkontrakter

Gamle generelle Civication-utkast, den innlimte `CivicationGameREADME`-chatloggen og de to dupliserte jobbmodellene er fjernet. Genererte role-pack- og FWG-statusfiler har nå én registrert output-path hver. Nye Civication-dokumenter skal plasseres under riktig kontrakt eller som tidsbundne rapporter, ikke som nye parallelle hoved-READMEs.

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
- seks feilformede/extensionløse README-filer fjernet
- Civication-dokumentasjonen samlet under én inngang; chatlogg og jobbmodellduplikater fjernet
- genererte Civication role-pack- og FWG-statusfiler redusert til én output-path hver
- foreldet `badge_refs`-regel og biologispesifikk emnearkitektur fjernet fra aktiv dokumentflate
- gammel quiz-README erstattet med compatibility-pointer; canonical produksjonsprosedyre, template-register og manifests er eksplisitt prioritert
- daterte TypeScript- og AHA-statusfiler flyttet til `reports/archive/2026-07/`
- `Mestergrad` fjernet fra ferdigmodellen; Bronse → Sølv → Gull er canonical nivåregel
- `APP_STRUCTURE_INDEX.md` synkronisert med `#/debate/:id` og registrert som canonical index-appkontrakt
- domene- og DomainRegistry-dokumentasjonen synkronisert med maskinkontrakten: filosofi er selvstendig, og populærkultur er ikke toppkategori

### Neste

- klassifiser kvalitets- og Social-kontraktene uten å gjøre subsystemspesifikke guider til globale fasiter
- fortsett å flytte daterte audits og statuspunkter til `reports/archive/YYYY-MM/`
