# Civication Role World broad-rollout readiness gate

**Status:** GREEN — controlled role-by-role rollout open
**Canonical career roles audited:** 85
**Classification:** 36 rollout_ready / 47 needs_role_authored_work / 2 blocked
**Current broad_rollout_allowed:** true (controlled rollout open)

## Gate decision

- Locked Realism Matrix dimensions reference-proven: **true**
- Cross-role shared-world program proof runtime-proven: **true**
- Every canonical career role classified: **true**
- Every blocked role has explicit blockers: **true**
- Matrix/policy rollout state consistent: **true**
- Existing policy remains closed: **false**
- Controlled broad rollout allowed now: **true**
- Readiness gate: **PASS**
- Recommendation: **controlled_rollout_open_with_role_level_gates**

A PASS with policy open means controlled role-by-role rollout may proceed. It does **not** certify every role as realism-complete, does not create runtime, and does not waive role-level blockers.

## Classification contract

- **rollout_ready:** Core career runtime gate, People, Places, knowledge, workday loop, mail and authority are complete enough to enter a dedicated one-role realism rollout PR; any remaining realism dimensions are authored inside that PR.
- **needs_role_authored_work:** The role is canonical but its current career foundation is incomplete for immediate realism rollout; the listed authored work must be completed before or as a prerequisite to entering the rollout queue.
- **blocked:** A safety-critical boundary such as authority or provenance is not sufficiently proved. The role is quarantined until the blocker is repaired; broad rollout policy must not waive it.

## First structurally varied wave candidates

- **naeringsliv/administrasjonsmedarbeider** — economy_business; rollout_ready; queue #1

The first wave is a recommendation, not a batch PR: every role still gets its own PR. Cross-role linkage is optional and only used when the work object is genuinely shared.

## Priority queue — top 25

| Rank | Role | Class | Structural family | Cross-role | Main authored debt |
| ---: | --- | --- | --- | --- | --- |
| 1 | `naeringsliv/administrasjonsmedarbeider` | rollout_ready | economy_business | not_required_for_rollout | situated_reputation |
| 2 | `naeringsliv/fagarbeider` | needs_role_authored_work | economy_business | not_required_for_rollout | career:people, people_places_integrity, situated_reputation |
| 3 | `naeringsliv/formann` | needs_role_authored_work | economy_business | candidate_when_shared_work_is_real | career:people, people_places_integrity, situated_reputation |
| 4 | `naeringsliv/lager_og_driftsmedarbeider` | needs_role_authored_work | economy_business | not_required_for_rollout | career:people, people_places_integrity, situated_reputation |
| 5 | `naeringsliv/mellomleder` | needs_role_authored_work | economy_business | candidate_when_shared_work_is_real | career:people, people_places_integrity, situated_reputation |
| 6 | `kunst/kunst_kunstnerisk_ledelse` | needs_role_authored_work | creative_production | candidate_when_shared_work_is_real | career:day_one, career:knowledge, career:mail, career:people |
| 7 | `kunst/kunst_utstillingsproduksjon` | needs_role_authored_work | creative_production | candidate_when_shared_work_is_real | career:day_one, career:knowledge, career:mail, career:people |
| 8 | `psykologi/klinikkleder` | needs_role_authored_work | care_professional | candidate_when_shared_work_is_real | career:day_one, career:knowledge, career:mail, career:people |
| 9 | `psykologi/psykologi_arbeids_og_karriereveiledning` | needs_role_authored_work | care_professional | candidate_when_shared_work_is_real | career:day_one, career:knowledge, career:mail, career:people |
| 10 | `psykologi/spesialistpsykolog` | needs_role_authored_work | care_professional | not_required_for_rollout | career:day_one, career:knowledge, career:mail, career:people |
| 11 | `scenekunst/scenekunst_dramaturgi_og_utvikling` | needs_role_authored_work | creative_production | not_required_for_rollout | career:day_one, career:knowledge, career:mail, career:people |
| 12 | `scenekunst/scenekunst_institusjonsledelse` | needs_role_authored_work | creative_production | candidate_when_shared_work_is_real | career:day_one, career:knowledge, career:mail, career:people |
| 13 | `scenekunst/scenekunst_program_og_kuratering` | needs_role_authored_work | creative_production | not_required_for_rollout | career:day_one, career:knowledge, career:mail, career:people |
| 14 | `scenekunst/scenekunst_regi_og_koreografi` | needs_role_authored_work | creative_production | candidate_when_shared_work_is_real | career:day_one, career:knowledge, career:mail, career:people |
| 15 | `scenekunst/scenekunst_scene_og_produksjon` | needs_role_authored_work | creative_production | candidate_when_shared_work_is_real | career:day_one, career:knowledge, career:mail, career:people |
| 16 | `scenekunst/scenekunst_utoving_og_ensemble` | needs_role_authored_work | creative_production | not_required_for_rollout | career:day_one, career:knowledge, career:mail, career:people |
| 17 | `subkultur/subkultur_kulturarena_ledelse` | needs_role_authored_work | event_operational | candidate_when_shared_work_is_real | career:day_one, career:knowledge, career:mail, career:people |
| 18 | `subkultur/subkultur_produksjon_og_prosjekt` | needs_role_authored_work | creative_production | candidate_when_shared_work_is_real | career:day_one, career:knowledge, career:mail, career:people |
| 19 | `subkultur/subkultur_produksjonsledelse` | needs_role_authored_work | creative_production | candidate_when_shared_work_is_real | career:day_one, career:knowledge, career:mail, career:people |
| 20 | `subkultur/subkultur_program_og_koordinering` | needs_role_authored_work | event_operational | candidate_when_shared_work_is_real | career:day_one, career:knowledge, career:mail, career:people |
| 21 | `historie/historie_fagledelse` | needs_role_authored_work | other | candidate_when_shared_work_is_real | career:day_one, career:knowledge, career:mail, career:people |
| 22 | `historie/historie_forskning_og_akademia` | needs_role_authored_work | research_education | not_required_for_rollout | career:day_one, career:knowledge, career:mail, career:people |
| 23 | `historie/historie_forvaltning_og_radgivning` | needs_role_authored_work | public_administration | candidate_when_shared_work_is_real | career:day_one, career:knowledge, career:mail, career:people |
| 24 | `historie/historie_institusjonsledelse` | needs_role_authored_work | other | not_required_for_rollout | career:day_one, career:knowledge, career:mail, career:people |
| 25 | `historie/historie_museum_og_samling` | needs_role_authored_work | other | not_required_for_rollout | career:day_one, career:knowledge, career:mail, career:people |

## Blocked roles

### musikk/musikk_scene_og_produksjon

- **institution_authority:** Career authority component is partial; broad rollout must not weaken or infer formal authority.

### musikk/musikk_utoving_og_ensemble

- **institution_authority:** Career authority component is partial; broad rollout must not weaken or infer formal authority.

## Locked rollout boundaries

- Existing Civication Scene Pipeline remains canonical; no parallel engine or scene format is introduced.
- Authority remains a hard contract. Knowledge, reputation, seniority or cross-role sharing cannot manufacture decision rights.
- New realism work is one canonical role per PR, with full Civication suite, compiled-registry parity, Realism Matrix gate and provenance.
- `employment_conditions` and `professional_culture` remain role-owned editorial content, not new global runtime fields.
- Cross-role shared objects are used only where the work is materially shared; the newsroom proof remains the authority/integrity reference pattern.

## Machine-readable source

See `data/Civication/roleWorldRolloutReadiness.json`. Regenerate with `node scripts/audit-civication-role-world-rollout-readiness.mjs --write`; verify drift with `--check`.

