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

Markdown-filer blir ikke automatisk runtime-data. Produksjonsinnhold styres av source-data, manifester, loadere og validering. Dokumentasjonen styrer arkitektur, arbeidsmåte og kontrakter; CI må håndheve reglene som ikke kan overlates til tekst alene.

## Leserekkefølge

### Teknologi, språk, backend og dataeierskap

1. [`HISTORY_GO_TECHNICAL_ARCHITECTURE.md`](./HISTORY_GO_TECHNICAL_ARCHITECTURE.md)
2. [`TYPESCRIPT_FIRST_POLICY.md`](./TYPESCRIPT_FIRST_POLICY.md)
3. [`typescript-migration-plan.md`](./typescript-migration-plan.md)

`TYPESCRIPT_MIGRATION.md` i repo-roten er historisk journal, ikke aktiv policy.

### Dagens runtime og arbeidsflyt

1. [`../README/SYSTEM_REGISTRY.md`](../README/SYSTEM_REGISTRY.md) — overordnet runtime-eierskap og kjernegrenser
2. [`../README/SYSTEM_REGISTRY_SUBSYSTEM_CONTRACTS.md`](../README/SYSTEM_REGISTRY_SUBSYSTEM_CONTRACTS.md) — aktive API-, storage-, privacy- og UI-kontrakter for subsystemene
3. [`../README/SYSTEM_MAP.md`](../README/SYSTEM_MAP.md) — runtime-flyt og modulkjeder
4. [`APP_STRUCTURE_INDEX.md`](./APP_STRUCTURE_INDEX.md) — canonical entry-, boot-, router-, MapView- og sidegrensekontrakt for `index.html`
5. [`../README/README_DEV.md`](../README/README_DEV.md) — kjøring, debugging og validering
6. [`../README/TEAM_WORKFLOW.md`](../README/TEAM_WORKFLOW.md) — arbeidsflyt og dokumentprioritet ved endringer

`SYSTEM_REGISTRY.md` og `SYSTEM_REGISTRY_SUBSYSTEM_CONTRACTS.md` utgjør sammen den aktive runtime-kontrakten. `APP_STRUCTURE_INDEX.md` eier bare index-appens interne struktur. Den tidligere pre-split-filen er bevart i [`../README/archive/SYSTEM_REGISTRY_PRE_SPLIT_2026-07-25.md`](../README/archive/SYSTEM_REGISTRY_PRE_SPLIT_2026-07-25.md) som historisk sporbarhet, ikke som bindende regelverk.

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

Ved konflikt gjelder maskinkontrakten og valideringen. Dokumentasjonen skal korrigeres; det skal ikke opprettes lokale aliaslister eller parallelle kategorier.

Dataproduksjonskontrakten er synkronisert med manifeststyrte, splittede politikk-places. Ved konflikt mellom dokumentasjon og et aktivt manifest er manifestet/runtime-koden sannhetskilden, og dokumentasjonen skal korrigeres.

### Knowledge og personlig minne

1. [`KNOWLEDGE_ARCHITECTURE.md`](./KNOWLEDGE_ARCHITECTURE.md) — canonical menneskelesbar arkitektur og storage-eierskap
2. [`../data/knowledge/knowledge_system_policy_v1.json`](../data/knowledge/knowledge_system_policy_v1.json) — maskinlesbar systempolicy
3. [`../data/knowledge/knowledge_unit_schema_v1.json`](../data/knowledge/knowledge_unit_schema_v1.json) — canonical knowledge-unit-schema
4. [`../data/quiz/quiz_knowledge_delivery_contract_v1.json`](../data/quiz/quiz_knowledge_delivery_contract_v1.json) — quizens kunnskaps-, vurderings- og evidenskontrakt
5. [`../js/knowledgeV2.ts`](../js/knowledgeV2.ts) — varig V2-read-model og legacy-migrering
6. [`../js/knowledgeQuizMemory.ts`](../js/knowledgeQuizMemory.ts) — quiz-bundles og synkronisering til V2
7. [`../README/knowledgeREADME.md`](../README/knowledgeREADME.md) — compatibility-pointer fra eldre README-lenker

De tidligere parallelle minnekammer-, quiz-memory-, ontology-, knagge- og People/Places/Relations-modellene er bevart under `reports/archive/2026-07/knowledge/`. De er historikk, ikke aktive kontrakter.

### Fag, emner og quiz

1. [`../README/README.pensum.md`](../README/README.pensum.md) — fagkart, emner og pensum
2. [`../README/fagstrukturREADME.md`](../README/fagstrukturREADME.md) — fagstruktur
3. [`../data/quiz/regler/QUIZ_PRODUCTION_CANONICAL.md`](../data/quiz/regler/QUIZ_PRODUCTION_CANONICAL.md) — eneste bindende quizproduksjonsprosedyre
4. [`../data/quiz/regler/QUIZ_TEMPLATE_REGISTRY_V2.json`](../data/quiz/regler/QUIZ_TEMPLATE_REGISTRY_V2.json) — maskinlesbar autoritetsrekkefølge, globale invariants og kategori-profiler
5. [`../data/fag/fag_manifest.json`](../data/fag/fag_manifest.json) — filresolver, full fagpakke og aktive `quizProduction.targets`
6. [`../data/quiz/manifest.json`](../data/quiz/manifest.json) — runtime-aktivering av quizfiler og target-bundne sett
7. [`../README/quizREADME.md`](../README/quizREADME.md) — compatibility-pointer til canonical produksjon, schemas, audits og runtime-eierskap

Det gamle extensionløse `README/emnepackREADME` var et biologispesifikt utkast og er fjernet. Den tidligere kombinerte quiz-/lærings-/observations-/popup-README-en ligger i `README/archive/QUIZ_README_PRE_CONSOLIDATION_2026-07-25.md`; den er historisk og eier ingen aktiv regel.

### AHA-lokal kvalitetsstatus

- [`AHA_QUALITY_STATUS_SURFACE_V1.md`](./AHA_QUALITY_STATUS_SURFACE_V1.md) — operativ, dokumentasjonsdefinert målkontrakt for lokal og read-only kvalitetsstatus
- [`QUALITY_GATES.md`](./QUALITY_GATES.md) — compatibility-pointer til AHA-kontrakten

Disse dokumentene gjelder kvaliteten på én aktuell AHA-samtale eller analyse. De er ikke generelle kvalitetsporter for History GO, Civication, quiz, data eller repository-CI.

AHA-statusmodellen er dokumentasjons-only i V1. Den starter ikke runtime, sync, EchoNet, permanent minne eller backendskriving. Generelle kontroller eies av de konkrete data-, runtime-, utviklings- og workflowkontraktene.

### Social Meet / HG Social

Autoritativ leserekkefølge:

1. [`../README/SYSTEM_REGISTRY_SUBSYSTEM_CONTRACTS.md`](../README/SYSTEM_REGISTRY_SUBSYSTEM_CONTRACTS.md) — dagens aktive lokale runtime-, storage- og privacy-grenser
2. [`HG_SOCIAL_README.md`](./HG_SOCIAL_README.md) — operativ produktoversikt, terminologi og samlet inngang
3. [`HG_SOCIAL_PRIVACY_RULES.md`](./HG_SOCIAL_PRIVACY_RULES.md) — canonical privacy-policy og defaults
4. [`HG_SPOTMEETING.md`](./HG_SPOTMEETING.md) — canonical produkt- og lifecycle-kontrakt for Spotmeeting
5. [`HG_SOCIAL_ARCHITECTURE.md`](./HG_SOCIAL_ARCHITECTURE.md) — operativ produkt-/målarkitektur; ikke bevis på implementert backend
6. [`HG_SOCIAL_QA.md`](./HG_SOCIAL_QA.md) — operativ QA- og privacy-guard-guide
7. [`HG_SOCIAL_DEMO_MODE.md`](./HG_SOCIAL_DEMO_MODE.md) — operativ lokal demo-/smoke-test-guide

Framtidige serverkontrakter:

- [`HG_SOCIAL_BACKEND_CONTRACT.md`](./HG_SOCIAL_BACKEND_CONTRACT.md)
- [`HG_SOCIAL_MEET_IDENTITY_CONTRACT.md`](./HG_SOCIAL_MEET_IDENTITY_CONTRACT.md)
- [`HG_SOCIAL_MEET_INVITE_BACKEND_CONTRACT.md`](./HG_SOCIAL_MEET_INVITE_BACKEND_CONTRACT.md)
- [`HG_SOCIAL_MEET_BLOCK_REPORT_MODERATION_CONTRACT.md`](./HG_SOCIAL_MEET_BLOCK_REPORT_MODERATION_CONTRACT.md)

De fire serverdokumentene er `transitional` og contract-only. De implementerer ikke autentisering, database, API, moderation runtime eller produksjonsdiscovery.

Dagens Social-status:

- Social-signaler, public-profile read-model, match graph, demo og Spotmeeting-validering er lokale og privacy-safe.
- Produksjonsdiscovery skal returnere `backend_not_enabled` fram til serverkravene er implementert og verifisert.
- TEST_MODE kan bruke seedede demo-profiler; disse skal aldri skrives til `PEOPLE` eller produksjonsstorage.
- GPS, live location, nearby people, distance-to-person, last seen, followers/feed, offentlig besøkshistorikk, passiv tracking og fri chat er forbudt.
- Formuleringen `backend-ready` i eldre Social-tekst betyr bare kontrakt-/migreringsklar datamodell. Den betyr ikke at backend finnes.

Eierskap:

- subsystemregisteret eier dagens runtime;
- privacy-filen eier Socials privacy-policy;
- Spotmeeting-filen eier den konkrete møteflyten;
- Social README er inngang og terminologi, ikke en parallell runtimefasit;
- serverdokumentene eier bare framtidige målgrenser.

### Civication

- [`CIVICATION_README.md`](./CIVICATION_README.md) — operativ inngang til Civication-runtime, data-, rolle-, mail-, debatt- og FWG-dokumentasjon
- [`CIVICATION_DEBATE_SYSTEM.md`](./CIVICATION_DEBATE_SYSTEM.md) — operativ forklaring av Civications interne konfrontasjonsmotor
- [`../js/Civication/README.md`](../js/Civication/README.md) — motoroversikt og aktiv dagflyt
- [`../README/SYSTEM_REGISTRY_SUBSYSTEM_CONTRACTS.md`](../README/SYSTEM_REGISTRY_SUBSYSTEM_CONTRACTS.md) — bindende subsystemkontrakter

Gamle generelle Civication-utkast, den innlimte `CivicationGameREADME`-chatloggen og de to dupliserte jobbmodellene er fjernet. Genererte role-pack- og FWG-statusfiler har én registrert output-path hver. Nye Civication-dokumenter skal plasseres under riktig kontrakt eller som tidsbundne rapporter, ikke som nye parallelle hoved-READMEs.

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
| `transitional` | Aktiv målkontrakt eller dokument med kjent implementasjons-/konsolideringsgjeld |
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
- domene- og DomainRegistry-dokumentasjonen synkronisert med maskinkontrakten
- parallelle Knowledge-, ontology- og knaggemodeller samlet under én canonical arkitektur og maskinpolicy
- `QUALITY_GATES.md` redusert til AHA-kompatibilitetspeker
- gamle relations-, oppgave- og badge-/merke-READMEs arkivert
- Social-dokumentene klassifisert med én leserekkefølge og tydelig skille mellom lokal runtime og framtidig backend

### Neste

- fortsett å flytte daterte audits og statuspunkter til `reports/archive/YYYY-MM/`
- klassifiser øvrige aktive subsystemguider uten å gjøre målarkitektur til nåstatus
