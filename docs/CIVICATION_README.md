# Civication — dokumentasjonsinngang

Status: **operational dokumentasjonsinngang**  
Sist kontrollert: **2026-07-25**

Civication er et eget produkt/subsystem i samme repo. Denne filen er inngangen til Civication-dokumentasjonen; den skal ikke kopiere runtime-regler eller produktsannhet fra dokumentene som faktisk eier dem.

## Start her

- [`../js/Civication/README.md`](../js/Civication/README.md) — motoroversikt, boot-arkitektur og den aktive spillveien gjennom dagen
- [`CIVICATION_DATA_LAYERS.md`](./CIVICATION_DATA_LAYERS.md) — datalag og ansvar
- [`../data/Civication/README-mailsystem-og-rolemodels.md`](../data/Civication/README-mailsystem-og-rolemodels.md) — badge → role model → mail plan → mail family
- [`CIVICATION_WORK_GRAMMAR_STANDARD.md`](./CIVICATION_WORK_GRAMMAR_STANDARD.md) — FWG/work grammar-standard
- [`civication-life-story-system.md`](./civication-life-story-system.md) — Life Story / Min dag-systemet

## Roller og jobbinnhold

- [`CIVICATION_ROLE_PACK.md`](./CIVICATION_ROLE_PACK.md) — inngang og dedup-kontrakt for rollepakken
- [`CIVICATION_ROLE_PACK_STANDARD.md`](./CIVICATION_ROLE_PACK_STANDARD.md) — detaljert role-pack-kontrakt
- [`../reports/civication-role-pack-index.md`](../reports/civication-role-pack-index.md) — generert role-pack-status; regenereres med `npm run audit:civication:role-packs`
- [`CIVICATION_WORK_GRAMMAR_STANDARD.md`](./CIVICATION_WORK_GRAMMAR_STANDARD.md) — arbeidsgrammatikk
- [`CIVICATION_FWG_GOVERNANCE.md`](./CIVICATION_FWG_GOVERNANCE.md) — styring av FWG-innhold

Den genererte role-pack-indeksen ligger bare under `reports/`. Runtime-lesemodellen ligger separat i `data/Civication/rolePackIndex.json`; ingen av dem er normative rollepakke-kontrakter.

De tidligere filene `README/CIVICATION_JOB_MODEL.md` og `README/CIVICATION_job_model.md` var samme tidlige jobbmodell med formateringsforskjeller. De er fjernet. Aktiv modell for mestring, konsekvens, progresjon og komplett jobbinnhold ligger i role-pack-, work-grammar-, roleModel-, mailPlan- og mailFamily-kontraktene over.

## Debatt og konfrontasjon

- [`CIVICATION_DEBATE_SYSTEM.md`](./CIVICATION_DEBATE_SYSTEM.md) — Civications interne rolle-, kapital-, identitets- og psykebaserte konfrontasjonsmotor
- [`CIVICATION_HISTORY_GO_DEBATE_SURFACE.md`](./CIVICATION_HISTORY_GO_DEBATE_SURFACE.md) — History GO-flaten som produserer `HGDebates`-signaler gjennom stedlige debatter og standpunkt

Disse er to ulike systemflater og skal ikke slås sammen uten en eksplisitt runtimebeslutning.

## Mail og dagflyt

- [`CIVICATION_MAIL_PURPOSE.md`](./CIVICATION_MAIL_PURPOSE.md) — formål og avgrensning
- [`CIVICATION_MAIL_SCHEMA.md`](./CIVICATION_MAIL_SCHEMA.md) — schema
- [`CIVICATION_MAIL_STANDARD.md`](./CIVICATION_MAIL_STANDARD.md) — innholdsstandard
- [`CIVICATION_THREAD_STANDARD.md`](./CIVICATION_THREAD_STANDARD.md) — trådstandard
- [`CIVICATION_PATCH_ORDER.md`](./CIVICATION_PATCH_ORDER.md) — patch-/lastrekkefølge

## Audits og statusdokumenter

Filer med `AUDIT`, `REVIEW`, `STATUS` eller datostempel er snapshots med mindre de er registrert som canonical i `documentation_registry.json`. Genererte rapporter under `reports/` er ferskvare og skal regenereres fra kommandoen som står i rapporten; de skal ikke kopieres inn i `docs/`. Ingen av delene skal overstyre dokumentene over.

Eksempler:

- `CIVICATION_RUNTIME_OWNERSHIP_AUDIT.md`
- `CIVICATION_FLOW_AUDIT.md`
- `CIVICATION_FUNCTIONALITY_REVIEW.md`
- `CIVICATION_WORKDAY_PHASE_INTEGRATION_AUDIT.md`
- `civication-status-audit.md`

## Overordnet teknisk prioritet

Ved konflikt gjelder denne rekkefølgen:

1. [`HISTORY_GO_TECHNICAL_ARCHITECTURE.md`](./HISTORY_GO_TECHNICAL_ARCHITECTURE.md) — språk-, backend- og dataeierskap
2. [`../README/SYSTEM_REGISTRY.md`](../README/SYSTEM_REGISTRY.md) — overordnet runtime-eierskap
3. [`../README/SYSTEM_REGISTRY_SUBSYSTEM_CONTRACTS.md`](../README/SYSTEM_REGISTRY_SUBSYSTEM_CONTRACTS.md) — aktive Civication- og subsystemkontrakter
4. [`../README/SYSTEM_MAP.md`](../README/SYSTEM_MAP.md) — dagens runtime-flyt
5. [`../js/Civication/README.md`](../js/Civication/README.md) — Civication-motorene og dagflyten
6. spesifikke data-/mail-/rolle-/FWG-/debattkontrakter
7. audits, genererte rapporter og historiske snapshots

## Regel for nye Civication-dokumenter

Ikke opprett en ny generell `CivicationREADME`, `CivicationGameREADME`, `CIVICATION_JOB_MODEL`, `CIVICATION_STATUS` eller systemoversikt ved siden av denne filen. Oppdater dokumentet som eier det konkrete ansvarsområdet. Tidsbundne undersøkelser og genererte statusindekser skal normalt ligge i `reports/`.

De tidligere generelle Civication-chatutkastene og `README/CivicationGameREADME.md` er fjernet fra aktivt tre. Historikken finnes fortsatt i Git.
