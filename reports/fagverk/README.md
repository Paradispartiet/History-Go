# Fagverket — Phase 0 baseline

Status: **reproduserbar operativ rapport**  
Canonical kontrakt: [`docs/FAGVERK.md`](../../docs/FAGVERK.md)  
Maskinlesbart inventar: [`data/fagverk/subject_inventory.json`](../../data/fagverk/subject_inventory.json)  
Maskinlesbar status: [`data/fagverk/subject_status.json`](../../data/fagverk/subject_status.json)

Denne mappen eier ikke fagarkitekturen eller ferdigstatusenes betydning. Den inneholder den genererte Phase 0-baselinen som kreves av den canonicale fagverkskontrakten.

## Innhold

- `subject-baseline.json` — deterministisk projeksjon av kategorikontrakten, fagmanifestet, inventaret, statusregisteret og portalstatusen.
- Inventaret klassifiserer alle canonicale fag i fire schemafamilier.
- Statusregisteret holder navigasjonsstatus, inventarvurdering og redaksjonell status adskilt.
- Baseline markerer ingen fag som `audited`, `structure_ready`, `chapters_in_progress` eller `complete`.

## Regenerering

```bash
node scripts/audit-fagverk-subject-inventory.mjs --write-report
node scripts/audit-fagverk-subject-inventory.mjs
node --test tests/fagverk-subject-inventory.test.mjs
```

Første kommando regenererer rapporten. Andre kommando verifiserer at committed rapport er identisk med projeksjonen fra source-filene. Testen kontrollerer fagrekkefølge, kjernefiler, schemafamilier, pilotsett og ærlig status.

## Hva auditen blokkerer

Auditen feiler blant annet når:

- kategori-, manifest-, portal-, inventar- eller statusrekkefølgen avviker;
- et canonicalt fag mangler i én av kildene;
- `pensum`, `emner`, `fagkart` eller `methods` mangler eller ikke er gyldig JSON;
- schemafamilien ikke samsvarer med manifestets faktiske signaler;
- portalstatus og statusregister er usynkronisert;
- Phase 0 forhåndsgodkjenner et fag som ferdig;
- den committed baseline-rapporten er utdatert.

## Baseline og neste fase

Baseline dokumenterer fire adapterfamilier:

1. `standard_canonical`
2. `foundation_v1`
3. `by_compatibility`
4. `technology_scientific_v2_4`

Pilotsettet er `by`, `natur`, `religion` og `teknologi`. Politikk er fortsatt den eneste teknisk materialiserte fagsiden, men Phase 0 godkjenner heller ikke politikk som `structure_ready`. Neste produksjonsfase er den generelle subject-resolveren, manifest-first loaderen, adaptergrensen og den normaliserte fagmodellen.
