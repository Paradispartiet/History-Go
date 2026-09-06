# Civication Role World broad-rollout readiness gate

**Status:** GREEN — controlled role-by-role rollout open
**Canonical career roles audited:** 85
**Classification:** 64 rollout_ready / 19 needs_role_authored_work / 2 blocked
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

_No safe first-wave set is available yet._

The first wave is a recommendation, not a batch PR: every role still gets its own PR. Cross-role linkage is optional and only used when the work object is genuinely shared.

## Priority queue — top 25

| Rank | Role | Class | Structural family | Cross-role | Main authored debt |
| ---: | --- | --- | --- | --- | --- |
| 1 | `natur/natur_biologi_og_forskning` | needs_role_authored_work | research_education | not_required_for_rollout | career:day_one, career:knowledge, career:mail, career:people |
| 2 | `natur/natur_felt_og_formidling` | needs_role_authored_work | other | candidate_when_shared_work_is_real | career:day_one, career:knowledge, career:mail, career:people |
| 3 | `natur/natur_forvaltning_og_radgivning` | needs_role_authored_work | public_administration | not_required_for_rollout | career:day_one, career:knowledge, career:mail, career:people |
| 4 | `natur/natur_miljoledelse` | needs_role_authored_work | other | candidate_when_shared_work_is_real | career:day_one, career:knowledge, career:mail, career:people |
| 5 | `natur/natur_politisk_myndighet` | needs_role_authored_work | other | not_required_for_rollout | career:day_one, career:knowledge, career:mail, career:people |
| 6 | `politikk/politikk_kommunal_ledelse` | needs_role_authored_work | public_administration | not_required_for_rollout | career:day_one, career:knowledge, career:mail, career:people |
| 7 | `politikk/politikk_organisasjonsarbeid` | needs_role_authored_work | public_administration | not_required_for_rollout | career:day_one, career:knowledge, career:mail, career:people |
| 8 | `politikk/politikk_parlamentarisk_arbeid` | needs_role_authored_work | public_administration | not_required_for_rollout | career:day_one, career:knowledge, career:mail, career:people |
| 9 | `politikk/politikk_politisk_radgivning` | needs_role_authored_work | public_administration | not_required_for_rollout | career:day_one, career:knowledge, career:mail, career:people |
| 10 | `politikk/politikk_regjeringsledelse` | needs_role_authored_work | public_administration | not_required_for_rollout | career:day_one, career:knowledge, career:mail, career:people |
| 11 | `religion/religion_fagledelse` | needs_role_authored_work | other | not_required_for_rollout | career:day_one, career:knowledge, career:mail, career:people |
| 12 | `religion/religion_formidling_og_kulturarv` | needs_role_authored_work | other | not_required_for_rollout | career:day_one, career:knowledge, career:mail, career:people |
| 13 | `religion/religion_utredning_og_radgivning` | needs_role_authored_work | public_administration | not_required_for_rollout | career:day_one, career:knowledge, career:mail, career:people |
| 14 | `vitenskap/vitenskap_assistent_og_laboratorium` | needs_role_authored_work | research_education | candidate_when_shared_work_is_real | career:day_one, career:knowledge, career:mail, career:people |
| 15 | `vitenskap/vitenskap_doktorlop_og_postdoktor` | needs_role_authored_work | research_education | not_required_for_rollout | career:day_one, career:knowledge, career:mail, career:people |
| 16 | `vitenskap/vitenskap_forskning` | needs_role_authored_work | research_education | not_required_for_rollout | career:day_one, career:knowledge, career:mail, career:people |
| 17 | `vitenskap/vitenskap_forskningsledelse` | needs_role_authored_work | research_education | candidate_when_shared_work_is_real | career:day_one, career:knowledge, career:mail, career:people |
| 18 | `vitenskap/vitenskap_institusjonsledelse` | needs_role_authored_work | research_education | candidate_when_shared_work_is_real | career:day_one, career:knowledge, career:mail, career:people |
| 19 | `vitenskap/vitenskap_undervisning_og_forskning` | needs_role_authored_work | research_education | not_required_for_rollout | career:day_one, career:knowledge, career:mail, career:people |
| 20 | `musikk/musikk_scene_og_produksjon` | blocked | creative_production | not_required_for_rollout | career:authority, career:day_one, career:knowledge, career:mail |
| 21 | `musikk/musikk_utoving_og_ensemble` | blocked | other | not_required_for_rollout | career:authority, career:day_one, career:knowledge, career:mail |

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

