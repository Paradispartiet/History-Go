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

- [`CIVICATION_ROLE_PACK_STANDARD.md`](./CIVICATION_ROLE_PACK_STANDARD.md) — role-pack-kontrakt
- [`CIVICATION_ROLE_PACK_INDEX.md`](./CIVICATION_ROLE_PACK_INDEX.md) — role-pack-oversikt
- [`CIVICATION_WORK_GRAMMAR_STANDARD.md`](./CIVICATION_WORK_GRAMMAR_STANDARD.md) — arbeidsgrammatikk
- [`CIVICATION_FWG_GOVERNANCE.md`](./CIVICATION_FWG_GOVERNANCE.md) — styring av FWG-innhold

## Mail og dagflyt

- [`CIVICATION_MAIL_PURPOSE.md`](./CIVICATION_MAIL_PURPOSE.md) — formål og avgrensning
- [`CIVICATION_MAIL_SCHEMA.md`](./CIVICATION_MAIL_SCHEMA.md) — schema
- [`CIVICATION_MAIL_STANDARD.md`](./CIVICATION_MAIL_STANDARD.md) — innholdsstandard
- [`CIVICATION_THREAD_STANDARD.md`](./CIVICATION_THREAD_STANDARD.md) — trådstandard
- [`CIVICATION_PATCH_ORDER.md`](./CIVICATION_PATCH_ORDER.md) — patch-/lastrekkefølge

## Audits og statusdokumenter

Filer med `AUDIT`, `REVIEW`, `STATUS` eller datostempel er snapshots med mindre de er registrert som canonical i `documentation_registry.json`. De kan dokumentere hva som var sant på en bestemt commit, men skal ikke overstyre dokumentene over.

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
6. spesifikke data-/mail-/rolle-/FWG-kontrakter
7. audits og historiske snapshots

## Regel for nye Civication-dokumenter

Ikke opprett en ny generell `CivicationREADME`, `CIVICATION_STATUS` eller systemoversikt ved siden av denne filen. Oppdater dokumentet som eier det konkrete ansvarsområdet. Tidsbundne undersøkelser skal normalt ligge i `reports/`.

De tidligere filene `README/CIVICATION_README.md.` og `README/CivicationREADME` var uregistrerte chatutkast med overlappende og motstridende produktdefinisjoner. De er fjernet fra aktivt tre; historikken finnes fortsatt i Git.
