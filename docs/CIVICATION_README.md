# Civication — dokumentasjonsinngang

Status: **operational dokumentasjonsinngang**  
Sist kontrollert: **2026-08-17**

Civication er et eget produkt/subsystem i samme repo. Denne filen er inngangen til Civication-dokumentasjonen; den skal ikke kopiere runtime-regler eller produktsannhet fra dokumentene som faktisk eier dem.

## Start her

- [`../js/Civication/README.md`](../js/Civication/README.md) — motoroversikt, boot-arkitektur og den aktive spillveien gjennom dagen
- [`CIVICATION_DATA_LAYERS.md`](./CIVICATION_DATA_LAYERS.md) — datalag og ansvar
- [`../data/Civication/README-mailsystem-og-rolemodels.md`](../data/Civication/README-mailsystem-og-rolemodels.md) — authored jobbinnhold: badge → roleModel/FWG → mailPlan → source data
- [`../data/Civication/SCENE_PIPELINE_V1.md`](../data/Civication/SCENE_PIPELINE_V1.md) — canonical scene-pipeline, SceneCatalog/SceneDirector/ChoiceDirector og compiled-registry-grensen
- [`CIVICATION_CAREER_GAMEPLAY_CONTRACT.md`](./CIVICATION_CAREER_GAMEPLAY_CONTRACT.md) — teknisk spillbarhetskontrakt for arbeidsverdener
- [`CIVICATION_ROLE_WORLD_STANDARD.md`](./CIVICATION_ROLE_WORLD_STANDARD.md) — streng redaksjonell standard for en faktisk fylt rolleverden
- [`CIVICATION_WORK_GRAMMAR_STANDARD.md`](./CIVICATION_WORK_GRAMMAR_STANDARD.md) — normativ FWG/work grammar-standard
- [`civication-life-story-system.md`](./civication-life-story-system.md) — Life Story / Min dag-systemet

## Den aktive Civication-modellen

Civication skal leses som ett livsspill med flere uavhengige akser, ikke som én karrierestige:

1. **Badge-progresjon** — hva spilleren kan og har oppnådd.
2. **Livsposisjon** — selvvalgt måte å leve en interesse/status på.
3. **Formell jobb / arbeidsstatus** — faktisk ansettelse, kvalifikasjon og myndighet.
4. **Levevei** — kildeførte inntekts- og kostnadsstrømmer uten at de automatisk blir jobb.
5. **Øvrig livsstate** — relasjoner, psyke, økonomi/kapital, bolig/livssituasjon og andre domeneeide tilstander.

Levevei er allerede implementert som eget runtime-lag. En livsposisjon gir aldri automatisk penger. En livelihood-opportunity må komme fra en eksplisitt kilde/hendelse og aksepteres før den blir en inntektsstrøm.

Den redaksjonelle målretningen er nå:

```text
spillerens livsstate
→ eligibility/context
→ Role World / authored socialt hverdagsdrama
→ canonical scenes
→ SceneCatalog / SceneDirector
→ delivery / NextAction
→ ChoiceDirector
→ konsekvenser i jobb, relasjoner, psyke, levevei, økonomi og senere scener
```

Dette skal ikke splittes i separate mailmotorer for bolig, levevei, venner, festivaler eller andre livsområder. Ulike produsenter skal bruke den samme scenegrensen eller registrerte source adapters.

## Roller og jobbinnhold

- [`CIVICATION_ROLE_PACK.md`](./CIVICATION_ROLE_PACK.md) — inngang og dedup-kontrakt for rollepakken
- [`CIVICATION_ROLE_PACK_STANDARD.md`](./CIVICATION_ROLE_PACK_STANDARD.md) — detaljert role-pack-kontrakt
- [`CIVICATION_ROLE_PACK_INDEX.md`](./CIVICATION_ROLE_PACK_INDEX.md) — eneste genererte markdown-index for role-pack-status; regenereres sammen med runtime-indeksen
- [`CIVICATION_CAREER_GAMEPLAY_CONTRACT.md`](./CIVICATION_CAREER_GAMEPLAY_CONTRACT.md) — 15-komponents arbeidsverdensgate og betydningen av `architecture_only`, `partial`, `playable` og `reference_complete`
- [`CIVICATION_ROLE_WORLD_STANDARD.md`](./CIVICATION_ROLE_WORLD_STANDARD.md) — høyere redaksjonell standard: sosiologisk rollebibel, faste sosiale typer, 14-dagers dramaturgi, gjentakende tråder og privat etterklang
- [`CIVICATION_WORK_GRAMMAR_STANDARD.md`](./CIVICATION_WORK_GRAMMAR_STANDARD.md) — normativ arbeidsgrammatikk
- [`CIVICATION_FWG_GOVERNANCE.md`](./CIVICATION_FWG_GOVERNANCE.md) — eneste genererte markdown-audit for om FWG faktisk styrer authored work content

`npm run audit:civication:role-packs` skriver `docs/CIVICATION_ROLE_PACK_INDEX.md` og `data/Civication/rolePackIndex.json`. Det skal ikke opprettes en parallell kopi under `reports/`.

`npm run audit:civication:fwg-governance` skriver bare `docs/CIVICATION_FWG_GOVERNANCE.md`. Filen er commit-bundet status, ikke en normativ FWG-kontrakt, og skal ikke kopieres til `reports/civication-fwg-governance.md`.

De tidligere filene `README/CIVICATION_JOB_MODEL.md` og `README/CIVICATION_job_model.md` var samme tidlige jobbmodell med formateringsforskjeller. De er fjernet. Aktiv modell for mestring, konsekvens, progresjon og komplett jobbinnhold ligger i role-pack-, work-grammar-, roleModel-, mailPlan-, scene- og Career Gameplay-kontraktene over.

### Viktig om «fylt»

`reference_complete` i Career Gameplay Matrix er en streng **teknisk/produksjonsmessig** status, men er ikke synonymt med at rolleverdenen er fullskrevet som sosial serie.

En faktisk «fylt rolleverden» følger `CIVICATION_ROLE_WORLD_STANDARD.md` og krever blant annet en 14-dagers sammenhengende bue, faste personer med klasse-/status-/maktfunksjon, gjentakende tråder, arbeid/private beats og langsiktige konsekvenser. Før en egen Role World-audit finnes skal `role_world_complete` ikke settes eller utledes automatisk.

Ekspeditør er første redaksjonelle referanserolle som skal løftes fra sterk to-ukers baseline til denne høyere standarden.

## Scene, mail og dagflyt

Den nåværende arkitekturen bruker **scene som gameplay-enhet**. Mail er én leveringsform.

For work-scenes er kjeden:

```text
authored `mailFamilies` / work source data
→ deterministic build
→ `data/Civication/compiledSceneRegistryV1.json`
→ `CivicationSceneCatalog`
→ `CivicationSceneDirector`
→ delivery / NextAction
→ `CivicationChoiceDirector`
→ domeneeide konsekvenser + `CivicationMailRuntime` plan/progresjon
```

Dette betyr:

- `mailPlan` eier dramaturgisk/progressiv plan;
- `mailFamilies` er authored source-of-build for work, ikke normal runtime-kilde;
- compiled registry + SceneCatalog er normal work-scene-katalog i runtime;
- MailRuntime eier plan/progresjon, ikke rå kataloglasting;
- private/life/narrative/social er registrerte SceneCatalog-source adapters;
- ChoiceDirector er canonical svargrense;
- null canonical kandidat betyr no-op/fail-closed; legacy pack, RoleStoryletBridge og syntetisk generisk karrieremail skal ikke overta.

Relevant dokumentasjon:

- [`../data/Civication/SCENE_PIPELINE_V1.md`](../data/Civication/SCENE_PIPELINE_V1.md) — normativ scene- og migreringskontrakt
- [`CIVICATION_PATCH_ORDER.md`](./CIVICATION_PATCH_ORDER.md) — faktisk kandidat- og svarpipeline
- [`CIVICATION_MAIL_PURPOSE.md`](./CIVICATION_MAIL_PURPOSE.md) — formål og avgrensning for mail som leveringsflate
- [`CIVICATION_MAIL_SCHEMA.md`](./CIVICATION_MAIL_SCHEMA.md) — mail/source-schema
- [`CIVICATION_MAIL_STANDARD.md`](./CIVICATION_MAIL_STANDARD.md) — authored innholdsstandard
- [`CIVICATION_THREAD_STANDARD.md`](./CIVICATION_THREAD_STANDARD.md) — trådstandard

## Role World-retningen

Civication-roller skal ikke bare være jobb-simulatorer. De skal kunne fungere som **sosiologiske hverdagsdramaer** der spilleren lærer samfunn gjennom arbeid, mennesker, klasse, status, kropp, økonomi, relasjoner og konsekvenser.

Film, litteratur og drama kan brukes som intern tematisk inspirasjon, men bare gjennom abstrakte temaer og konfliktformer. Det er ikke tillatt å kopiere plot, karakterer, dialog eller konkrete scener fra identifiserbare verk.

Role World-standarden krever som mål:

- sosiologisk hovedkonflikt og faglig kjerne;
- sosialt miljø og maktkart;
- faste NPC-er/sosiale typer med individuell dybde;
- 14 dagers sesongbue;
- morgen/lunsj/ettermiddag/kveld som dramaturgiske ankerpunkter;
- viktige tråder som utvikler seg over omtrent 5–10 beats;
- valg med senere konsekvenser;
- privat etterklang;
- kobling til eksisterende levevei, psyke, relasjoner og annen livsstate når relevant.

Dette er en **produksjonsstandard over eksisterende scene/runtime-arkitektur**, ikke et nytt subsystem.

## Debatt og konfrontasjon

- [`CIVICATION_DEBATE_SYSTEM.md`](./CIVICATION_DEBATE_SYSTEM.md) — Civications interne rolle-, kapital-, identitets- og psykebaserte konfrontasjonsmotor
- [`CIVICATION_HISTORY_GO_DEBATE_SURFACE.md`](./CIVICATION_HISTORY_GO_DEBATE_SURFACE.md) — History GO-flaten som produserer `HGDebates`-signaler gjennom stedlige debatter og standpunkt

Disse er to ulike systemflater og skal ikke slås sammen uten en eksplisitt runtimebeslutning.

## Audits og statusdokumenter

Filer med `AUDIT`, `REVIEW`, `STATUS` eller datostempel er snapshots med mindre de er registrert som canonical i `documentation_registry.json`. Genererte operational-filer er reproducerbare statusflater og skal ikke overstyre de normative kontraktene de kontrollerer.

For Career Gameplay gjelder spesielt:

- canonical intent/pilot policy: `data/Civication/careerGameplayPolicy.json`;
- normativ kontrakt: `docs/CIVICATION_CAREER_GAMEPLAY_CONTRACT.md`;
- generert maskinstatus: `data/Civication/careerGameplayMatrix.json`;
- generert lesbar status: `reports/civication-career-gameplay-matrix.md`.

Role World-standarden er foreløpig redaksjonell. Den skal ikke late som den er maskinauditert før en dedikert Role World-gate faktisk finnes.

Følgende håndskrevne snapshots er flyttet byte-identisk til [`../reports/archive/2026-07/`](../reports/archive/2026-07/):

- `CIVICATION_BADGE_ROLE_MAPPING_AUDIT.md`
- `CIVICATION_FLOW_AUDIT.md`
- `CIVICATION_FUNCTIONALITY_REVIEW.md`
- `CIVICATION_RUNTIME_OWNERSHIP_AUDIT.md`
- `CIVICATION_WORKDAY_PHASE_INTEGRATION_AUDIT.md`
- `civication-status-audit.md`

Arkivfilene er sporbarhet, ikke runtimefasit. Bruk de aktive kontraktene og faktisk kode-/teststatus for nåsituasjonen.

## Overordnet teknisk prioritet

Ved konflikt gjelder denne rekkefølgen:

1. [`HISTORY_GO_TECHNICAL_ARCHITECTURE.md`](./HISTORY_GO_TECHNICAL_ARCHITECTURE.md) — språk-, backend- og dataeierskap
2. [`../README/SYSTEM_REGISTRY.md`](../README/SYSTEM_REGISTRY.md) — overordnet runtime-eierskap
3. [`../README/SYSTEM_REGISTRY_SUBSYSTEM_CONTRACTS.md`](../README/SYSTEM_REGISTRY_SUBSYSTEM_CONTRACTS.md) — aktive Civication- og subsystemkontrakter
4. [`../README/SYSTEM_MAP.md`](../README/SYSTEM_MAP.md) — dagens runtime-flyt
5. [`../data/Civication/SCENE_PIPELINE_V1.md`](../data/Civication/SCENE_PIPELINE_V1.md) — Civication scene-/kandidatsannhet
6. [`../js/Civication/README.md`](../js/Civication/README.md) — Civication-motorene og dagflyten
7. spesifikke data-/mail-/rolle-/FWG-/Career Gameplay-/Role World-kontrakter
8. genererte audits og historiske snapshots

## Regel for nye Civication-dokumenter

Ikke opprett en ny generell `CivicationREADME`, `CivicationGameREADME`, `CIVICATION_JOB_MODEL`, `CIVICATION_STATUS` eller systemoversikt ved siden av denne filen. Oppdater dokumentet som eier det konkrete ansvarsområdet.

`CIVICATION_ROLE_WORLD_STANDARD.md` er tillatt fordi den eier ett avgrenset, tidligere udekket ansvar: **den redaksjonelle definisjonen av en fylt rolleverden**. Den skal ikke kopiere runtime-eierskap fra Scene Pipeline eller teknisk status fra Career Gameplay Matrix.

Tidsbundne undersøkelser skal normalt ligge i `reports/`; reproducerbare statusindekser skal ha én registrert output-path.

De tidligere generelle Civication-chatutkastene og `README/CivicationGameREADME.md` er fjernet fra aktivt tre. Historikken finnes fortsatt i Git.
