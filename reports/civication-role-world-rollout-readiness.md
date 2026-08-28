# Civication Role World broad-rollout readiness gate

**Status:** GREEN — controlled role-by-role rollout open
**Canonical career roles audited:** 85
**Classification:** 35 rollout_ready / 48 needs_role_authored_work / 2 blocked
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

- **by/by_arkitekt** — public_administration; rollout_ready; queue #1
- **filosofi/filosofi_forskning_og_formidling** — research_education; rollout_ready; queue #5
- **litteratur/redaktor_bok** — media_editorial; rollout_ready; queue #7
- **sport/sport_trener** — sport_performance; rollout_ready; queue #9

The first wave is a recommendation, not a batch PR: every role still gets its own PR. Cross-role linkage is optional and only used when the work object is genuinely shared.

## Priority queue — top 25

| Rank | Role | Class | Structural family | Cross-role | Main authored debt |
| ---: | --- | --- | --- | --- | --- |
| 1 | `by/by_arkitekt` | rollout_ready | public_administration | not_required_for_rollout | rhythm_waiting_handoff_rework, situated_reputation |
| 2 | `by/by_assistent` | rollout_ready | public_administration | candidate_when_shared_work_is_real | situated_reputation |
| 3 | `by/by_prosjektleder` | rollout_ready | public_administration | candidate_when_shared_work_is_real | situated_reputation |
| 4 | `by/by_saksbehandler` | rollout_ready | public_administration | candidate_when_shared_work_is_real | situated_reputation |
| 5 | `filosofi/filosofi_forskning_og_formidling` | rollout_ready | research_education | not_required_for_rollout | rhythm_waiting_handoff_rework, situated_reputation |
| 6 | `filosofi/filosofi_undervisning_og_akademia` | rollout_ready | research_education | not_required_for_rollout | situated_reputation |
| 7 | `litteratur/redaktor_bok` | rollout_ready | media_editorial | candidate_when_shared_work_is_real | rhythm_waiting_handoff_rework, situated_reputation |
| 8 | `religion/religion_forskning` | rollout_ready | research_education | not_required_for_rollout | situated_reputation |
| 9 | `sport/sport_trener` | rollout_ready | sport_performance | candidate_when_shared_work_is_real | situated_reputation |
| 10 | `naeringsliv/administrasjonsmedarbeider` | needs_role_authored_work | economy_business | not_required_for_rollout | career:people, people_places_integrity, situated_reputation |
| 11 | `naeringsliv/fagarbeider` | needs_role_authored_work | economy_business | not_required_for_rollout | career:people, people_places_integrity, situated_reputation |
| 12 | `naeringsliv/formann` | needs_role_authored_work | economy_business | candidate_when_shared_work_is_real | career:people, people_places_integrity, situated_reputation |
| 13 | `naeringsliv/lager_og_driftsmedarbeider` | needs_role_authored_work | economy_business | not_required_for_rollout | career:people, people_places_integrity, situated_reputation |
| 14 | `naeringsliv/mellomleder` | needs_role_authored_work | economy_business | candidate_when_shared_work_is_real | career:people, people_places_integrity, situated_reputation |
| 15 | `kunst/kunst_kunstnerisk_ledelse` | needs_role_authored_work | creative_production | candidate_when_shared_work_is_real | career:day_one, career:knowledge, career:mail, career:people |
| 16 | `kunst/kunst_utstillingsproduksjon` | needs_role_authored_work | creative_production | candidate_when_shared_work_is_real | career:day_one, career:knowledge, career:mail, career:people |
| 17 | `psykologi/klinikkleder` | needs_role_authored_work | care_professional | candidate_when_shared_work_is_real | career:day_one, career:knowledge, career:mail, career:people |
| 18 | `psykologi/psykologi_arbeids_og_karriereveiledning` | needs_role_authored_work | care_professional | candidate_when_shared_work_is_real | career:day_one, career:knowledge, career:mail, career:people |
| 19 | `psykologi/spesialistpsykolog` | needs_role_authored_work | care_professional | not_required_for_rollout | career:day_one, career:knowledge, career:mail, career:people |
| 20 | `scenekunst/scenekunst_dramaturgi_og_utvikling` | needs_role_authored_work | creative_production | not_required_for_rollout | career:day_one, career:knowledge, career:mail, career:people |
| 21 | `scenekunst/scenekunst_institusjonsledelse` | needs_role_authored_work | creative_production | candidate_when_shared_work_is_real | career:day_one, career:knowledge, career:mail, career:people |
| 22 | `scenekunst/scenekunst_program_og_kuratering` | needs_role_authored_work | creative_production | not_required_for_rollout | career:day_one, career:knowledge, career:mail, career:people |
| 23 | `scenekunst/scenekunst_regi_og_koreografi` | needs_role_authored_work | creative_production | candidate_when_shared_work_is_real | career:day_one, career:knowledge, career:mail, career:people |
| 24 | `scenekunst/scenekunst_scene_og_produksjon` | needs_role_authored_work | creative_production | candidate_when_shared_work_is_real | career:day_one, career:knowledge, career:mail, career:people |
| 25 | `scenekunst/scenekunst_utoving_og_ensemble` | needs_role_authored_work | creative_production | not_required_for_rollout | career:day_one, career:knowledge, career:mail, career:people |

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

