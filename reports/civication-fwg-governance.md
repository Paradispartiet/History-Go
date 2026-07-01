# Civication FWG Governance Audit

Generert av `node scripts/audit-civication-fwg-governance.mjs`. Rapporten er report-only: den endrer ikke runtime eller UI og feiler ikke bygget. Den viser om stillingsgrammatikken (FWG) faktisk styrer mailFamilies.

Dimensjoner: `minimum_counts`, `required_axes`, `place_grammar`, `actor_grammar`, `conflict_grammar`, `solution_patterns`, `failure_patterns`. `n/a` betyr at FWG-fila ikke deklarerer den dimensjonen.

## Sammendrag

- FWG-filer auditert: 3
- Totalt antall avvik: 0

## Statusmatrise

| rolle | category | minimum_counts | required_axes | place_grammar | actor_grammar | conflict_grammar | solution_patterns | failure_patterns |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| by_radgiver_plan | by | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| renholder | naeringsliv | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| barnehageassistent | sosial_laering | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

## Detaljer

### Arealplanlegger (`by/by_radgiver_plan`)

Kilde: `data/Civication/workGrammars/by/by_radgiver_plan.json`

Ingen avvik. FWG styrer mailFamilies på alle deklarerte dimensjoner. ✅

### Renholder (`naeringsliv/renholder`)

Kilde: `data/Civication/workGrammars/naeringsliv/renholder.json`

Ingen avvik. FWG styrer mailFamilies på alle deklarerte dimensjoner. ✅

### Barnehageassistent / pedagogisk medarbeider (`sosial_laering/barnehageassistent`)

Kilde: `data/Civication/workGrammars/sosial_laering/barnehageassistent.json`

Ingen avvik. FWG styrer mailFamilies på alle deklarerte dimensjoner. ✅

