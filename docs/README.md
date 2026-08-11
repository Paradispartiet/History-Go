# History GO — dokumentasjonskart

Status: **canonical dokumentasjonsinngang**
Register: [`documentation_registry.json`](./documentation_registry.json)
Sist kontrollert: **2026-08-03**

Dette dokumentet svarer på tre spørsmål:

1. Hvilket dokument skal leses for en bestemt type beslutning?
2. Hvilke dokumenter er normative, operative, transitional eller historiske?
3. Hvilken fil må oppdateres når en kontrakt endres?

## Grunnregel

> Én sannhet per ansvarsområde.

[`FACTUALITY_CONTRACT.md`](./FACTUALITY_CONTRACT.md) gjelder alle brukerrettede fakta: ingen opplysning skal diktes, gjettes eller fylles inn for å skape completeness. Manglende eller uavklart informasjon skal utelates.

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
5. [`HG_TEST_MODE.md`](./HG_TEST_MODE.md) — canonical skjult utviklermodus, storage-/aliasgrense og produktsikkerhet
6. [`../README/README_DEV.md`](../README/README_DEV.md) — kjøring, debugging og validering
7. [`../README/cssREADME.md`](../README/cssREADME.md) — lokal CSS-guide for faktisk lastrekkefølge, cascade og praktisk fileierskap i index-appen
8. [`../README/TEAM_WORKFLOW.md`](../README/TEAM_WORKFLOW.md) — arbeidsflyt og dokumentprioritet ved endringer

`SYSTEM_REGISTRY.md` og `SYSTEM_REGISTRY_SUBSYSTEM_CONTRACTS.md` utgjør sammen den aktive runtime-kontrakten. `cssREADME.md` er bare en lokal orientering; `index.html` og de faktiske CSS-filene eier lastrekkefølge og selectoratferd. `APP_STRUCTURE_INDEX.md` eier bare index-appens interne struktur. `HG_TEST_MODE.md` eier bare utviklermodusens query-, storage-, alias- og sikkerhetsgrense; runtimefilen eier tilstanden, og testmodus kan ikke overstyre server-, database- eller production-gates. Den tidligere pre-split-filen er bevart i [`../README/archive/SYSTEM_REGISTRY_PRE_SPLIT_2026-07-25.md`](../README/archive/SYSTEM_REGISTRY_PRE_SPLIT_2026-07-25.md) som historisk sporbarhet, ikke som bindende regelverk.

### Produkt og ferdigstillelse

1. [`../README/README.md`](../README/README.md) — hovedoversikt
2. [`HISTORY_GO_PRODUCT_MAP.md`](./HISTORY_GO_PRODUCT_MAP.md) — canonical produktkart og prioritet
3. [`COMPLETION_DEFINITIONS.md`](./COMPLETION_DEFINITIONS.md) — canonical ferdigmodell; aktiv nivåregel er Bronse → Sølv → Gull
4. [`PROGRESSION_MODEL.md`](./PROGRESSION_MODEL.md) — operativ mål-/adaptermodell for samlet progresjonslesing; erstatter ikke runtime-lagring
5. [`PROFILE_PROGRESS_READER_RUNTIME.md`](./PROFILE_PROGRESS_READER_RUNTIME.md) — implementert read-only helper for eksisterende progresjonskilder
6. [`PLACE_STANDARD.md`](./PLACE_STANDARD.md) — canonical produktstandard for et History GO-sted
7. [`PLACE_PRODUCTION_CHECKLIST.md`](./PLACE_PRODUCTION_CHECKLIST.md) — canonical sted-for-sted produksjonsoppskrift og sluttcheck
8. [`PLACE_POPUP_SYSTEM.md`](./PLACE_POPUP_SYSTEM.md) — canonical presentasjons- og stedstypekontrakt for den rike stedspopupen
9. [`PEOPLE_PROFILE_CANONICAL.md`](./PEOPLE_PROFILE_CANONICAL.md) — canonical claim-first produksjons-, review- og ferdigstatuskontrakt for People
10. [`PEOPLE_POPUP_SYSTEM.md`](./PEOPLE_POPUP_SYSTEM.md) — canonical runtime-, presentasjons- og fallbackkontrakt for den rike people-popupen

Compatibility-filer som bare videresender eldre lenker:

- `README/CURRENT_PRODUCT_STATE.md` — peker til aktiv hovedoversikt og produktkart
- `docs/HISTORY_GO_PLAYABLE_GAP_AUDIT.md` — peker til aktuelle produkt-, standard- og datakilder

Historisk snapshot som ikke skal brukes som nåstatus:

- `docs/IMPLEMENTATION_STATUS.md` — avgrenset snapshot for Social, Civication Home og Spotmeeting

### Områdeoversikt

1. [`README_area_overview.md`](./README_area_overview.md) — operativ runtimeguide for radiusbasert områdevisning
2. [`../js/ui/area-overview.js`](../js/ui/area-overview.js) — basisstate, avstandsindeks, filter og navigasjon
3. [`../js/ui/area-overview-v2.js`](../js/ui/area-overview-v2.js) — read-only geografisk oversikt, progresjon og høydepunkter
4. [`../tests/area-overview-runtime.test.js`](../tests/area-overview-runtime.test.js) og [`../tests/area-overview-v2-runtime.test.js`](../tests/area-overview-v2-runtime.test.js) — regresjonskontroll

Område sentreres på et canonical place-record og bruker `window.PLACES`; flaten oppretter ingen kommune-/regionrecords eller egen progresjonsstate. Basisruntime eier radius og resultatmodell, mens V2 bare dekorerer samme modell.

### Uavhengige læringsspill

1. [`../data/historygo/shared/game_registry.json`](../data/historygo/shared/game_registry.json) — canonical maskinregister for spill, status og deklarerte grensesnitt
2. [`learning-games/standalone-learning-games-architecture.md`](./learning-games/standalone-learning-games-architecture.md) — operativ uavhengighets-, profil- og adapterguide
3. [`../js/historyGoGameRegistry.js`](../js/historyGoGameRegistry.js) — profilens registerloader og renderer
4. [`../tests/history-go-game-registry.test.js`](../tests/history-go-game-registry.test.js) — register- og profilregresjon

History GO eier registeret og delte samlinger. Civication kan lenke til spillene, men skal ikke være motor eller progresjonseier. Registerets `writesBackToProfile` er en deklarert kontrakt; faktisk write-back må bevises av spillspesifikke adaptere og tester.

### Quiz og fysisk besøksstatus

1. [`COMPLETION_DEFINITIONS.md`](./COMPLETION_DEFINITIONS.md) — canonical produktbetydning av besøkt, quizfullført, utforsket, fullført og mestret
2. [`QUIZ_AND_PHYSICAL_VISIT_MODEL.md`](./QUIZ_AND_PHYSICAL_VISIT_MODEL.md) — operational runtimeguide for digital quiztilgang, fysisk besøksgate og smal place-progress read-model
3. [`../js/quiz/quizAccess.ts`](../js/quiz/quizAccess.ts) — quiztilgang uten fysisk besøkswrite
4. [`../js/visits/physicalVisits.ts`](../js/visits/physicalVisits.ts) — fysisk besøksservice og gate
5. [`../js/ui/placeVisitButton.ts`](../js/ui/placeVisitButton.ts) — PlaceCard-knappens besøksatferd
6. [`../tests/quiz-physical-visit-separation.test.js`](../tests/quiz-physical-visit-separation.test.js) — regresjonstest for separasjonen

Quiz er digitalt tilgjengelig uten å skrive fysisk besøksstatus. Fysisk `visited` krever den fysiske besøksveien; badges, poeng, Groundhopper, ruter og andre downstream-belønninger eies ikke av denne adapteren uten egne implementasjoner.

### Historiske ruter

1. [`README_HistoryGo_Historiske_Ruter.md`](./README_HistoryGo_Historiske_Ruter.md) — operational runtimeguide og ærlig implementasjonsgrense
2. [`../data/routes/historical/schema_historical_route.json`](../data/routes/historical/schema_historical_route.json) — canonical route- og chapter-schema
3. [`../data/routes/historical/manifest.json`](../data/routes/historical/manifest.json) — aktiverte route-filer
4. [`../js/historical-routes.js`](../js/historical-routes.js) — online-spiller og progress store
5. [`../tools/audit-historical-routes.mts`](../tools/audit-historical-routes.mts) — manifest-, ID- og place-referanseaudit

Online-reisen, lokal progresjon, events og NextUp-handoff er implementert. Fysisk GPS-samling, faktisk badge-/pointstildeling og interaktive quiz-/valgporter er foreløpig ikke implementert selv om dataene er forberedt for fysisk modus.

### Visual Design Codes

1. [`../data/visualDesignCodes.json`](../data/visualDesignCodes.json) — canonical register for gyldige designCodes og renderer-hint
2. [`visual-design-codes.md`](./visual-design-codes.md) — operativ bruk-, resolver- og batchguide
3. [`../js/visualDesignCodes.js`](../js/visualDesignCodes.js) — aktiv resolver og fallbacklogikk
4. [`../tools/audit-visual-design-codes.mts`](../tools/audit-visual-design-codes.mts) — audit og kandidatbygging

DesignCodes er metadata, ikke geometri eller bilder. Registeret eier gyldige koder, resolveren eier oppslagsrekkefølgen, og hver renderer eier konkret presentasjon. Den tidligere kombinerte arkitektur- og batchjournalen er bevart som historisk snapshot under `reports/archive/2026-07/visual-design-codes/`.

### Domener, data og innholdsproduksjon

1. [`FACTUALITY_CONTRACT.md`](./FACTUALITY_CONTRACT.md) — overordnet canonical regel for sannhet, kildeverifikasjon, usikkerhet og forbud mot gjetting
2. [`DOMAIN_CONTRACT.md`](./DOMAIN_CONTRACT.md) — bindende kategoribeslutninger
3. [`../data/categories/category_contract.json`](../data/categories/category_contract.json) — maskinlesbar sannhetskilde for runtime- og fagkategorier
4. [`DOMAIN_REGISTRY_README.md`](./DOMAIN_REGISTRY_README.md) — operativ bruk av DomainRegistry og eksplisitte legacy-aliasgrenser
5. [`DATA_PRODUCTION_CONTRACT.md`](./DATA_PRODUCTION_CONTRACT.md) — aktiv dataproduksjonskontrakt
6. [`../data/brands/brand_rules_v1_1.json`](../data/brands/brand_rules_v1_1.json) — canonical Brand-definisjon, klassifisering, place-versus-brand-regel og N/A-gate
7. relevante manifests under `data/**/manifest.json`
8. lokale README-filer ved datasettet
9. relevante audits og CI-gates

`npm run audit:categories` håndhever samsvar mellom maskinkontrakten, fagmanifestet, quizprofilregisteret, badgeindeksen, DomainRegistry, kategori-UI og place-policyen.

Aktive domenebeslutninger:

- `filosofi` er selvstendig fag- og runtimekategori.
- `populaerkultur`/`popkultur` er ikke toppkategori; eventuelle aliaser er bare legacy-kompatibilitet.
- `sosial_laering` er et non-place badge.

Ved konflikt gjelder maskinkontrakten og valideringen. Dokumentasjonen skal korrigeres; det skal ikke opprettes lokale aliaslister eller parallelle kategorier.

Dataproduksjonskontrakten er synkronisert med manifeststyrte, splittede politikk-places. Ved konflikt mellom dokumentasjon og et aktivt manifest er manifestet/runtime-koden sannhetskilden, og dokumentasjonen skal korrigeres.

### Stories-data og produksjon

1. [`STORIES_DATA_GOVERNANCE.md`](./STORIES_DATA_GOVERNANCE.md) — operativ produksjons-, rapport- og integritetsguide
2. [`../data/stories/stories_manifest.json`](../data/stories/stories_manifest.json) — canonical runtime-manifest for aktive story-filer
3. manifest-loadede filer under `data/stories/` — aktive story-objekter
4. [`../tools/check_stories_integrity.mts`](../tools/check_stories_integrity.mts) — required fields, unike story-ID-er og place-/people-referanser

En story er aktiv først når filen er manifestregistrert og `npm run check:stories` passerer. Researchnotater og coverage-rapporter er tidsbundne snapshots; de skal ligge under `reports/` eller `reports/archive/`, ikke opptre som nåstatus i `docs/`. De tidligere batch-4-notatene og post-PR-#892-coverage-rapporten er arkivert under `reports/archive/2026-07/stories/`.

### People-produksjon, stedskobling og bilder

1. [`FACTUALITY_CONTRACT.md`](./FACTUALITY_CONTRACT.md) — bindende regel om at ingen personopplysning eller stedskobling kan gjettes eller fylles for completeness
2. [`PEOPLE_PROFILE_CANONICAL.md`](./PEOPLE_PROFILE_CANONICAL.md) — canonical claim-first produksjon, feltsemantikk, review og versjonert ferdigstatus
3. [`../data/people/regler/people_profile_templates_v1.json`](../data/people/regler/people_profile_templates_v1.json) — maskinlesbare People-produksjonsregler
4. [`../data/people/regler/people_claims_schema_v1.json`](../data/people/regler/people_claims_schema_v1.json) — claims-format og statuskontrakt
5. [`../tools/audit-people-profile-canonical.mjs`](../tools/audit-people-profile-canonical.mjs) — blokkerende claim-, felt-, setnings-, styrke- og ferskhetsvalidator
6. [`people-of-places-method.md`](./people-of-places-method.md) — canonical relevans-, kilde-, gjenbruks- og batchmetode for person–sted-koblinger
7. [`PEOPLE_POPUP_SYSTEM.md`](./PEOPLE_POPUP_SYSTEM.md) — canonical runtime-, presentasjons-, handling- og fallbackkontrakt
8. [`../data/people/manifest.json`](../data/people/manifest.json) — aktive canonical people-source-filer
9. [`../tools/audit-people-popup-readiness.mts`](../tools/audit-people-popup-readiness.mts) — presentasjons-readiness uten count-baserte fyldebelønninger
10. [`../reports/people-popup-readiness.md`](../reports/people-popup-readiness.md) — prioritert arbeidsliste med separat produksjonsstatus
11. [`../tools/audit-people-of-places-status.mts`](../tools/audit-people-of-places-status.mts) — status-, schema-, referanse- og struktur-audit
12. [`../tools/check-people-of-places-gate.mts`](../tools/check-people-of-places-gate.mts) — blokkerer duplikater, ugyldige refs, manglende primæranker og tomme `places`
13. [`PEOPLE_IMAGES.md`](./PEOPLE_IMAGES.md) — canonical kilde-, lisens-, godkjennings- og attribusjonskontrakt for people-bilder
14. [`../tools/people-image-pipeline.mts`](../tools/people-image-pipeline.mts) — implementert kandidat-, review-, apply- og audit-pipeline
15. [`../tests/people-images.test.mjs`](../tests/people-images.test.mjs) — lisens-, identitets-, quality-, apply- og attribusjonsregresjoner

Faktisitetskontrakten står over alle lokale people-regler. People Profile Canonical eier claims, felt- og setningsparitet, review og ferdigstatus. Readiness, schema og grønne tester er ikke sannhetsbevis; hver brukerrettet påstand og person–sted-kobling må støttes av kilder som faktisk er lest. People of Places-metoden eier den redaksjonelle relevans- og kildegaten. Dagens CI blokkerer dupliserte people-ID-er, ugyldige place-referanser, manglende gyldige primærankere og tomme `places`, men beregner ikke full place-for-place-dekning og avgjør ikke historisk relevans. Dekningsmål og relevans må derfor dokumenteres i batchen. Runtime leser bare manifest-loadede canonical people-filer. Kandidat-, attribusjons- og statusrapporter er arbeids- og sporbarhetsdata, ikke parallelle people-sannheter.

### Naturmapping

1. [`../README/nature_mapping_workflow.md`](../README/nature_mapping_workflow.md) — operativ kurateringsflyt og autoritetsgrenser
2. [`../js/nature_place_map_bridge.js`](../js/nature_place_map_bridge.js) — aktiv runtime-resolver for place-level naturmapping
3. aktive `data/natur/nature*_place_map.json` — godkjente place–art-koblinger
4. [`../tools/build_nature_place_candidates.mts`](../tools/build_nature_place_candidates.mts) — kandidatbygger; output er research, ikke runtime-data

Place-ID-er, artsdata, place-level mapping og quiz-unlocks har separate eiere. Kandidatfila kan være tom og skal aldri lastes direkte i appen. Dårlige koblinger rettes i source-data, ikke skjules med permanente UI-unntak.

### Koordinater og geografisk evidens

1. [`coordinates/README.md`](./coordinates/README.md) — canonical dokumentasjonskart og leserekkefølge
2. [`coordinates/coordinate-source-contract-v1.md`](./coordinates/coordinate-source-contract-v1.md) — bindende felter, kildekrav, statuser og trust-regler
3. [`coordinate-finder.md`](./coordinate-finder.md) — operativ research-, kontroll- og kart-QA-arbeidsflyt
4. [`coordinates/coordinate-evidence-files-v1.md`](./coordinates/coordinate-evidence-files-v1.md) — bindende evidenskrav før endring og `verified*`
5. [`coordinates/coordinate-control-protocol.md`](./coordinates/coordinate-control-protocol.md) — løpende kontroll-ledger for fullførte batcher
6. [`coordinates/address-first-coordinate-policy.md`](./coordinates/address-first-coordinate-policy.md) — compatibility-peker for address-first-løypen

Coordinate Source Contract v1 eier coordinate-semantikken. `coordinate-finder.md` eier arbeidsmåten, evidenskontrakten eier pre-change-sporbarheten, og kontrollprotokollen dokumenterer hva som faktisk er fullført. `address-first-coordinate-policy.md` kan ikke overstyre disse kildene.

Produksjonens sannhet ligger i canonical place JSON, aktive manifests, generert places-index og validatorene. Relevante porter er `places:coords:evidence:audit`, `places:coords:quality`, `places:coords:intake`, `places:index:check` og `test:coordinate-source-contract`; full kjede inngår i `tools:check`.

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

1. [`SUBJECT_FILE_CONTRACT.md`](./SUBJECT_FILE_CONTRACT.md) — bindende regel om én universell fagmodell per fag og separate geografiske produksjonslag
2. [`FAGVERK.md`](./FAGVERK.md) — canonical arkitektur, produksjonsrekkefølge og heldekningsbaserte ferdigkrav uten redaksjonelle tallkvoter for alle fagsider
3. [`FILM_TV_CURRICULUM_COMPLETENESS_V1.md`](./FILM_TV_CURRICULUM_COMPLETENESS_V1.md) — aktiv Film & TV-refaktorport med migrert variabel canon, gapdekkende læringsrekkefølge, ett registrert nytt fulltekstkapittel og neste problemstyrte kilde-/claimbrief
4. [`FAGVERK_NAVIGATION.md`](./FAGVERK_NAVIGATION.md) — bindende skille mellom Fagverkforsiden, merkesider, fagsider og stedssider
5. [`FAGVERK_PLACE_DESIGN.md`](./FAGVERK_PLACE_DESIGN.md) — kategori-, bilde- og presentasjonskontrakt for stedets egne fagverksider
6. [`POLITIKK_CURRICULUM_ARCHITECTURE_V1.md`](./POLITIKK_CURRICULUM_ARCHITECTURE_V1.md) — operativ Politikk-arkitektur, begrepskvalitet og ferdigport
7. [`../README/README.pensum.md`](../README/README.pensum.md) — fagkart, emner, Knowledge og progresjon
8. [`../README/fagstrukturREADME.md`](../README/fagstrukturREADME.md) — operativ guide til fagpakkens lag og manifest-resolverte filer
9. [`../data/quiz/regler/QUIZ_PRODUCTION_CANONICAL.md`](../data/quiz/regler/QUIZ_PRODUCTION_CANONICAL.md) — eneste bindende quizproduksjonsprosedyre
10. [`../data/quiz/regler/QUIZ_TEMPLATE_REGISTRY_V2.json`](../data/quiz/regler/QUIZ_TEMPLATE_REGISTRY_V2.json) — maskinlesbar autoritetsrekkefølge, globale invariants og kategori-profiler
11. [`../data/fag/fag_manifest.json`](../data/fag/fag_manifest.json) — filresolver, full fagpakke og aktive `quizProduction.targets`
12. [`../data/quiz/manifest.json`](../data/quiz/manifest.json) — runtime-aktivering av quizfiler og target-bundne sett
13. [`../README/quizREADME.md`](../README/quizREADME.md) — compatibility-pointer til canonical produksjon, schemas, audits og runtime-eierskap


Fagfilene er universelle. Land, regioner og byer skal legge til profiler, mappings, cases, claims, kilder, steder, personer og quizinnhold som refererer til de samme canonical fag-ID-ene; de skal ikke opprette komplette fagkopier. Universell fagdekning og geografisk produksjonsdekning er separate mål. Universell ferdigstatus krever alle relevante emner innenfor fagets avgrensning, ikke et fast antall områder, emner eller kapitler. `README/byFagplan.md` er nå bare en compatibility-pointer til disse aktive kildene; den tidligere kombinerte teksten er bevart som historisk snapshot under `README/archive/`.

Det gamle extensionløse `README/emnepackREADME` var et biologispesifikt utkast og er fjernet. Den tidligere kombinerte quiz-/lærings-/observations-/popup-README-en ligger i `README/archive/QUIZ_README_PRE_CONSOLIDATION_2026-07-25.md`; den er historisk og eier ingen aktiv regel.

### Historie V5.8, heldekning og kvalitetsfrys

1. [`../data/fag/historie/historie_v5_contract.json`](../data/fag/historie/historie_v5_contract.json) — aktiv V5.8-fagmodell og versjonsspesifikke kvalitetsmål
2. [`HISTORY_UNIVERSAL_COVERAGE.md`](./HISTORY_UNIVERSAL_COVERAGE.md) — canonical menneskelesbar policy og operativ auditinngang for universell Historie-dekning
3. [`../data/fag/historie/historie_universal_coverage_contract_v1.json`](../data/fag/historie/historie_universal_coverage_contract_v1.json) — maskinlesbar dekningskontrakt
4. [`../reports/historie-universal-coverage/historie-universal-coverage.json`](../reports/historie-universal-coverage/historie-universal-coverage.json) — materialisert dekningsstatus
5. [`../data/fag/historie/historie_v5_8_freeze_manifest.json`](../data/fag/historie/historie_v5_8_freeze_manifest.json) — aktivt V5.8-frysemanifest
6. [`../reports/historie-v5/historie-v5-8-quality-depth.json`](../reports/historie-v5/historie-v5-8-quality-depth.json) — materialisert V5.8-kvalitetsstatus
7. [`HISTORY_V5_5_FREEZE.md`](./HISTORY_V5_5_FREEZE.md) — historisk V5.5-baseline og forklaring av compatibility-navn

V5.8 er aktiv fagmodell. V5.5–V5.7 er historiske, reproduserbare baselines. En grønn kvalitetsfrys beskytter et versjonert inventar, men er ikke det samme som universell `COMPLETE`; den uavhengige heldekningsrapporten er fortsatt autoritativ for hva som gjenstår.

### AHA-lokal kvalitetsstatus

- [`AHA_QUALITY_STATUS_SURFACE_V1.md`](./AHA_QUALITY_STATUS_SURFACE_V1.md) — operativ, dokumentasjonsdefinert målkontrakt for lokal og read-only kvalitetsstatus
- [`QUALITY_GATES.md`](./QUALITY_GATES.md) — compatibility-pointer til AHA-kontrakten

Disse dokumentene gjelder kvaliteten på én aktuell AHA-samtale eller analyse. De er ikke generelle kvalitetsporter for History GO, Civication, quiz, data eller repository-CI.

### Social Meet / HG Social

#### 1. Aktiv status og runtime

1. [`../README/SYSTEM_REGISTRY_SUBSYSTEM_CONTRACTS.md`](../README/SYSTEM_REGISTRY_SUBSYSTEM_CONTRACTS.md) — aktive lokale Social-signaler, read-models og subsystemgrenser
2. [`../backend/README.md`](../backend/README.md) — gjeldende FastAPI/PostgreSQL-implementasjonskart og rolloutstatus
3. [`HG_SOCIAL_MEET_FASTAPI_CLIENT.md`](./HG_SOCIAL_MEET_FASTAPI_CLIENT.md) — typed browsergrense og adaptermigrering
4. [`HG_SOCIAL_BACKEND_CONTRACT.md`](./HG_SOCIAL_BACKEND_CONTRACT.md) — compatibility-inngang til hele backenddokumentasjonen

Sju servereide slices er implementert: identity/public profile, participant safety/export/deletion, moderation/appeals, abuse controls, durable Spotmeeting invites, candidate discovery og retention/observability. Migrerte production-operasjoner går gjennom typed FastAPI-klient når backend er eksplisitt konfigurert.

Implementert kode betyr ikke automatisk bred produksjonsaktivering. Discovery, invite writes og destructive retention er fail-closed bak egne deployment-, database-, cohort- og operations-gates.

#### 2. Produkt og privacy

1. [`HG_SOCIAL_README.md`](./HG_SOCIAL_README.md) — operativ produktoversikt og terminologi
2. [`HG_SOCIAL_PRIVACY_RULES.md`](./HG_SOCIAL_PRIVACY_RULES.md) — canonical privacy-policy
3. [`HG_SPOTMEETING.md`](./HG_SPOTMEETING.md) — canonical Spotmeeting-produkt og lifecycle
4. [`HG_SOCIAL_ARCHITECTURE.md`](./HG_SOCIAL_ARCHITECTURE.md) — operativ produkt-/målarkitektur
5. [`HG_SOCIAL_QA.md`](./HG_SOCIAL_QA.md) — QA og privacy guards
6. [`HG_SOCIAL_DEMO_MODE.md`](./HG_SOCIAL_DEMO_MODE.md) — lokal TEST_MODE/demo

#### 3. Kravkontrakter

- [`HG_SOCIAL_MEET_IDENTITY_CONTRACT.md`](./HG_SOCIAL_MEET_IDENTITY_CONTRACT.md)
- [`HG_SOCIAL_MEET_INVITE_BACKEND_CONTRACT.md`](./HG_SOCIAL_MEET_INVITE_BACKEND_CONTRACT.md)
- [`HG_SOCIAL_MEET_BLOCK_REPORT_MODERATION_CONTRACT.md`](./HG_SOCIAL_MEET_BLOCK_REPORT_MODERATION_CONTRACT.md)

De tre dokumentene er canonical kravkontrakter. De eier identity-, invite- og safety-kravene, mens gjeldende implementasjons- og rolloutstatus ligger i `backend/README.md` og slice-dokumentene. Implementert kode betyr fortsatt ikke automatisk bred produksjonsaktivering; participant-facing rollout er fail-closed.

#### 4. Implementerte slices

- [`HG_SOCIAL_MEET_MODERATION_BACKEND.md`](./HG_SOCIAL_MEET_MODERATION_BACKEND.md)
- [`HG_SOCIAL_MEET_ABUSE_CONTROLS.md`](./HG_SOCIAL_MEET_ABUSE_CONTROLS.md)
- [`HG_SPOTMEETING_INVITE_BACKEND.md`](./HG_SPOTMEETING_INVITE_BACKEND.md)
- [`HG_SOCIAL_MEET_CANDIDATE_DISCOVERY_BACKEND.md`](./HG_SOCIAL_MEET_CANDIDATE_DISCOVERY_BACKEND.md)
- [`HG_SOCIAL_MEET_RETENTION_OBSERVABILITY.md`](./HG_SOCIAL_MEET_RETENTION_OBSERVABILITY.md)

Identity- og participant-safety-slicene dokumenteres samlet i `backend/README.md` og i migrasjonene `002_social_meet_identity_profiles.sql` og `003_social_meet_safety.sql`.

`HG_SOCIAL_MODERATION.md` er bare guide til den eldre lokale/localStorage-kompatibilitetsmodulen. Den eier ikke servermoderasjon.

#### 5. Historiske overgangsdokumenter

- `HG_SOCIAL_MEET_BACKEND_ROADMAP.md` — roadmap-snapshot fra før implementasjonsslicene landet
- `social-meet-backend.md` — tidlig Supabase-foundation og direkte adapterfase før FastAPI-strangleren

De kan brukes som historikk, men skal ikke overstyre dagens backendinngang, runtimekode eller implementasjonsdokumenter.

#### Permanente grenser

Social Meet skal fortsatt ikke bruke GPS, live location, nearby/distance, presence/last-seen, followers/feed, offentlig visit history, passiv tracking eller fri chat. TEST_MODE/demo skal forbli atskilt fra ekte profiler og servereid state.

### Civication

- [`CIVICATION_README.md`](./CIVICATION_README.md) — operativ inngang til Civication-runtime, data-, rolle-, mail-, debatt- og FWG-dokumentasjon
- [`CIVICATION_DEBATE_SYSTEM.md`](./CIVICATION_DEBATE_SYSTEM.md) — operativ forklaring av Civications interne konfrontasjonsmotor
- [`../js/Civication/README.md`](../js/Civication/README.md) — motoroversikt og aktiv dagflyt
- [`../README/SYSTEM_REGISTRY_SUBSYSTEM_CONTRACTS.md`](../README/SYSTEM_REGISTRY_SUBSYSTEM_CONTRACTS.md) — bindende subsystemkontrakter

Gamle generelle Civication-utkast, den innlimte `CivicationGameREADME`-chatloggen og de to dupliserte jobbmodellene er fjernet. Genererte role-pack- og FWG-statusfiler har én registrert output-path hver.

### Rapporter og audits

- [`../reports/README.md`](../reports/README.md) eier rapportreglene.
- `npm run health:data` regenererer datahelse.
- `reports/data-health-summary.md` er en commit-bundet snapshot; kontroller alltid `Generated`-datoen.
- Andre markdown-rapporter i `reports/` er tidsbundne snapshots med mindre de uttrykkelig er registrert som canonical.

## Statusmodell

| Status | Betydning |
|---|---|
| `canonical` | Normativ kilde for ett avgrenset område |
| `operational` | Aktiv inngang, implementasjonsstatus eller arbeidsinstruks uten parallell sannhet |
| `transitional` | Aktiv krav-/måltekst eller runtime med kjent status-, implementasjons- eller migreringsgjeld |
| `historical` | Snapshot, rapport, roadmap eller journal; ikke nåstatus |
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
- faktisitets-, kilde-, usikkerhets- eller verifikasjonskrav,
- produktavgrensning eller ferdigdefinisjon.

Ikke opprett en ny `README`, `STATUS`, `PLAN`, `AUDIT` eller `FINAL`-fil før dokumentregisteret er kontrollert. Nye tidsbundne funn skal normalt til `reports/`, ikke bli en ny global fasit.

## Dokumentasjonskontroll

Workflowen `Documentation governance` validerer:

- at alle registrerte filer finnes,
- at canonical eierskap ikke dupliseres,
- at historiske dokumenter er merket med årsak eller erstatter,
- at inngangsdokumentenes lokale lenker ikke er brutte,
- at denne indeksen omtaler alle canonical og transitional dokumenter.

Workflowen bygger også et inventar som viser totalt antall dokumentlignende filer, uregistrerte globale kandidater, mistenkelige navn, overlappende basenames og aktive lenker til historiske snapshots.

## Konsolideringsstatus

### Gjennomført

- canonical dokumentregister og dokumentasjonsgate
- overordnet canonical faktisitetskontrakt med permanent test- og tools-gate
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
- gammel quiz-README erstattet med compatibility-pointer
- daterte TypeScript- og AHA-statusfiler flyttet til `reports/archive/2026-07/`
- `Mestergrad` fjernet fra ferdigmodellen; Bronse → Sølv → Gull er canonical nivåregel
- `APP_STRUCTURE_INDEX.md` synkronisert og registrert som canonical index-appkontrakt
- domene- og DomainRegistry-dokumentasjonen synkronisert med maskinkontrakten
- parallelle Knowledge-, ontology- og knaggemodeller samlet under én canonical arkitektur og maskinpolicy
- `QUALITY_GATES.md` redusert til AHA-kompatibilitetspeker
- gamle relations-, oppgave- og badge-/merke-READMEs arkivert
- Social-dokumentasjonen delt i canonical produkt/privacy, aktive backend-slices, transitional kravtekster og historiske overgangsdokumenter
- koordinatdokumentasjonen samlet under én source-kontrakt, én evidenskontrakt, én arbeidsflyt og én kontrollprotokoll
- Social Meet-kravkontraktenes statusavsnitt synkronisert med FastAPI-implementasjonen og løftet fra transitional til canonical
- `HG_TEST_MODE.md` synkronisert med runtime og registrert som canonical skjult utviklermoduskontrakt
- `PROFILE_PROGRESS_READER_RUNTIME.md` synkronisert og registrert som operational read-only runtime-guide
- `PEOPLE_IMAGES.md` synkronisert med pipeline og registrert som canonical bilde- og rettighetskontrakt
- `people-of-places-method.md` synkronisert med manifest/audit/gate og registrert som canonical redaksjonell metode
- Historiske ruter-planen skilt fra implementert runtimeguide og byte-identisk pre-consolidation-arkiv
- Historie V5.8 er dokumentert som aktiv autoritet; universell heldekning er canonical policy, og V5.5–V5.7 er historiske baselines
- By-fagplan, fagstruktur, lokal CSS-guide og naturmapping er klassifisert; blandet By-arbeidstekst er flyttet til historisk snapshot

- Områdeoversikt, uavhengige læringsspill og Visual Design Codes er klassifisert; Visual Design Codes-batchjournalen er skilt fra den aktive bruksguiden

### Neste

- fortsett å flytte daterte audits og statuspunkter til `reports/archive/YYYY-MM/`
- klassifiser øvrige aktive subsystemguider uten å gjøre målarkitektur til nåstatus
