# Civication Badge Career Matrix — audit snapshot

Audit snapshot 2026-08-13. The canonical, machine-readable 266-tier matrix is `data/Civication/badgeCareerAuditPolicy.json`. `scripts/civication-badge-career-matrix.mjs` expands it with live `role_scope`, roleModel/FWG, Life Story and salary data from the repository.

## Total

- 17 canonical badges / 266 tiers
- 93 keep/direct
- 95 keep with qualification/authorization/appointment gate
- 63 replace
- 15 review
- 214 exact salary gaps in the current canonical badge tiers. Psychology is now the first canonical badge with all 13 current tiers explicitly covered by its salary rule; missing salary elsewhere remains audit debt and is not interpolated.
- FWG-backed tier/runtime bindings now include the four Psychology entry jobs through shared `psykologi_miljoarbeid`, in addition to the existing By and Næringsliv bindings.
- Active Life Story bindings now cover 10 badge-title bindings: four By titles, Renholder, Ekspeditør / butikkmedarbeider, and the four Psychology entry jobs.

## Badge-level worklist

| badge | tiers | replace | review | keep with gate | keep/direct |
| --- | ---: | ---: | ---: | ---: | ---: |
| historie | 20 | 2 | 0 | 10 | 8 |
| religion | 20 | 6 | 1 | 8 | 5 |
| vitenskap | 13 | 0 | 0 | 13 | 0 |
| filosofi | 13 | 5 | 5 | 3 | 0 |
| kunst | 14 | 0 | 0 | 4 | 10 |
| scenekunst | 14 | 1 | 0 | 2 | 11 |
| by | 16 | 0 | 0 | 9 | 7 |
| musikk | 15 | 5 | 1 | 0 | 9 |
| litteratur | 17 | 7 | 1 | 0 | 9 |
| natur | 16 | 3 | 0 | 9 | 4 |
| sport | 14 | 7 | 1 | 5 | 1 |
| politikk | 16 | 1 | 3 | 11 | 1 |
| naeringsliv | 24 | 0 | 1 | 13 | 10 |
| subkultur | 11 | 11 | 0 | 0 | 0 |
| film_tv | 15 | 9 | 0 | 0 | 6 |
| media | 15 | 6 | 2 | 2 | 5 |
| psykologi | 13 | 0 | 0 | 6 | 7 |

## First remediation complete: Psykologi entry ladder

The four obsolete Psychology opening tiers have been replaced with real non-regulated entry jobs in one coherent first-line support family. Utdanning.no lists these titles in the NAV/Aa-register title family for miljøarbeid and states that there is no single official education that grants the `miljøarbeider` title, while employers may still require relevant competence. This makes them suitable for direct History Go progression without pretending that quiz points grant a regulated health profession.

All four use shared `role_scope: psykologi_miljoarbeid`, shared FWG and one Life Story package. The shared work model is explicitly non-clinical: support, activity, motivation, concrete observation, neutral documentation, de-escalation and safe escalation are in scope; diagnosis and independent treatment are out of scope.

| points | title | classification | action | offer policy | role_scope | Life Story | salary |
| ---: | --- | --- | --- | --- | --- | --- | ---: |
| 5 | Miljøassistent | actual_job | keep | direct | `psykologi_miljoarbeid` | shared | 5 / week |
| 10 | Sosialassistent | actual_job | keep | direct | `psykologi_miljoarbeid` | shared | 9 / week |
| 15 | Aktivitetsleder (omsorgsarbeid) | actual_job | keep | direct | `psykologi_miljoarbeid` | shared | 16 / week |
| 25 | Miljøarbeider | actual_job | keep | direct | `psykologi_miljoarbeid` | shared | 18 / week |
| 40 | Veileder | actual_job | keep | direct | not yet split | — | 20 / week |
| 60 | Rådgiver | actual_job | keep | direct | not yet split | — | 23 / week |
| 85 | Seniorrådgiver | actual_job | keep | direct | not yet split | — | 26 / week |
| 115 | Psykolog | regulated_health_profession | keep_with_gate | authorization_required | clinical package pending | — | 30 / week |
| 150 | Spesialistpsykolog | regulated_specialist_profession | keep_with_gate | authorization_required | clinical package pending | — | 34 / week |
| 190 | Fagansvarlig | leadership_or_specialist_position | keep_with_gate | appointment_required | leadership package pending | — | 38 / week |
| 240 | Klinikkleder | clinical_leadership_position | keep_with_gate | appointment_required | leadership package pending | — | 42 / week |
| 300 | Forsker (psykologi) | academic_position | keep_with_gate | qualification_required | academic package pending | — | 46 / week |
| 380 | Professor (psykologi) | academic_position | keep_with_gate | qualification_required | academic package pending | — | 50 / week |

### What remains in Psychology

The entry ladder is no longer career-debt. The next Psychology-specific audit target is the generic middle trio `Veileder → Rådgiver → Seniorrådgiver`: each title must be tied to a documented real job family or deliberately replaced before a new shared scope is built. The regulated clinical, leadership and academic tiers remain blocked by their existing qualification/authorization/appointment gates until their own role packages are developed.

## Permanent sources

- `data/badges/index.json` and `data/badges/*.json`: canonical tier labels and thresholds.
- `data/Civication/badgeCareerAuditPolicy.json`: explicit classification/action/gate for all 266 tiers.
- `data/Civication/badgeRoleMappings.json`: current shared `role_scope` mappings.
- `data/Civication/roleModels/manifest.json` and `data/Civication/workGrammars/`: roleModel/FWG coverage.
- `data/Civication/lifestory/manifest.json`: active Life Story bindings.
- `data/Civication/hg_careers.json`: exact current salary-by-tier rules.
- `scripts/civication-badge-career-matrix.mjs`: generator for the expanded per-tier live matrix.

## External role and qualification sources

- Utdanning.no: Miljøarbeider — role description, education note and NAV/Aa-register title family used for the four Psychology entry jobs.
- Helsedirektoratet: psykolog is a protected health title requiring Norwegian authorization or licence.
- Norsk psykologforening: specialist approval has a separate specialist-education approval path.
- HK-dir: architect is not itself a regulated occupation/title in Norway; the audit therefore uses an education/employment gate, not a fabricated Norwegian architect authorization.
