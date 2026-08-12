# Civication Badge Career Matrix — audit snapshot

Audit snapshot 2026-08-13. The canonical, machine-readable 266-tier matrix is `data/Civication/badgeCareerAuditPolicy.json`. `scripts/civication-badge-career-matrix.mjs` expands it with live `role_scope`, roleModel/FWG, Life Story and salary data from the repository.

## Total

- 17 canonical badges / 266 tiers
- 89 keep/direct
- 95 keep with qualification/authorization/appointment gate
- 67 replace
- 15 review
- 224 exact salary gaps in the current canonical badge tiers (14 matching careers × 3 salary entries = 42 defined tier salaries; three canonical badge IDs have no matching career salary rule).
- FWG exists only under canonical `by` and `naeringsliv` today; the shared `by_radgiver_plan` FWG covers four By titles, and `renholder` covers one Næringsliv title.
- Active Life Story bindings cover 6 badge-title bindings: four By titles through Arealplanlegger, plus Renholder and Ekspeditør / butikkmedarbeider.

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
| psykologi | 13 | 4 | 0 | 6 | 3 |

## First remediation: Psykologi

No replacement titles are invented in this pass. The old non-job tiers are blocked from Civication job offers, while real regulated/appointed/academic roles are gated. Badge milestones still unlock.

| points | title | classification | action | offer policy | runtime | qualifications |
| ---: | --- | --- | --- | --- | --- | --- |
| 5 | Titter | game_rank_or_descriptive_role | replace | not_job | activated in `data/badges/psykologi.json` | — |
| 10 | Analytiker | ambiguous_job_title | replace | review_required | activated in `data/badges/psykologi.json` | — |
| 15 | Atferdsobservatør | game_rank_or_descriptive_role | replace | not_job | activated in `data/badges/psykologi.json` | — |
| 25 | Samtalepartner | game_rank_or_descriptive_role | replace | not_job | activated in `data/badges/psykologi.json` | — |
| 40 | Veileder | actual_job | keep | direct | activated in `data/badges/psykologi.json` | — |
| 60 | Rådgiver | actual_job | keep | direct | activated in `data/badges/psykologi.json` | — |
| 85 | Seniorrådgiver | actual_job | keep | direct | activated in `data/badges/psykologi.json` | — |
| 115 | Psykolog | regulated_health_profession | keep_with_gate | authorization_required | activated in `data/badges/psykologi.json` | no_psychologist_authorization_or_license |
| 150 | Spesialistpsykolog | regulated_specialist_profession | keep_with_gate | authorization_required | activated in `data/badges/psykologi.json` | no_psychologist_authorization_or_license, no_psychologist_specialist_approval |
| 190 | Fagansvarlig | leadership_or_specialist_position | keep_with_gate | appointment_required | activated in `data/badges/psykologi.json` | employer_appointment |
| 240 | Klinikkleder | clinical_leadership_position | keep_with_gate | appointment_required | activated in `data/badges/psykologi.json` | employer_appointment |
| 300 | Forsker (psykologi) | academic_position | keep_with_gate | qualification_required | activated in `data/badges/psykologi.json` | academic_qualification_and_employment |
| 380 | Professor (psykologi) | academic_position | keep_with_gate | qualification_required | activated in `data/badges/psykologi.json` | academic_qualification_and_employment |

## Permanent sources

- `data/badges/index.json` and `data/badges/*.json`: canonical tier labels and thresholds.
- `data/Civication/badgeCareerAuditPolicy.json`: explicit classification/action/gate for all 266 tiers.
- `data/Civication/badgeRoleMappings.json`: current shared `role_scope` mappings.
- `data/Civication/roleModels/manifest.json` and `data/Civication/workGrammars/`: roleModel/FWG coverage.
- `data/Civication/lifestory/manifest.json`: active Life Story bindings.
- `data/Civication/hg_careers.json`: exact current salary-by-tier rules.
- `scripts/civication-badge-career-matrix.mjs`: generator for the expanded per-tier live matrix.

## External qualification sources

- Helsedirektoratet: psykolog is a protected health title requiring Norwegian authorization or licence.
- Norsk psykologforening: specialist approval has a separate specialist-education approval path.
- HK-dir: architect is not itself a regulated occupation/title in Norway; the audit therefore uses an education/employment gate, not a fabricated Norwegian architect authorization.
