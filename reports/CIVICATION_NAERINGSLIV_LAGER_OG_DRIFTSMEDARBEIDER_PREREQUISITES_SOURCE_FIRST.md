# Civication Næringsliv — Lager- og driftsmedarbeider readiness prerequisites source-first

## Scope lock

Role: `naeringsliv/lager_og_driftsmedarbeider`.

This prerequisite PR is **not Role World completion**. It may close only the Career People prerequisite and the resulting People/Places-integrity entry condition. `situated_reputation` remains explicitly deferred to a later dedicated one-role Role World rollout.

No new runtime, Scene Pipeline, mail-plan engine, cross-role object, global reputation score or formal authority is introduced. Readiness says `not_required_for_rollout` for cross-role work, and this prerequisite preserves that boundary.

## Reconciliation of the historical branch

The repository still contains `codex/create-full-role-package-for-lager_og_driftsmedarbeider`, one commit ahead of its 2026-era base and 13,627 commits behind current `main` at preflight. That branch is the historical package seed, not an active rollout branch. Its role package has already been superseded by the richer canonical package on `main`; this prerequisite therefore starts from current `main` and does not revive or overwrite the stale branch.

## Canonical foundation to preserve

- Role model: `data/Civication/roleModels/naeringsliv/lager_og_driftsmedarbeider.json`
- Shared work grammar: `data/Civication/workGrammars/naeringsliv/naeringsliv_logistikk_og_drift.json`
- Mail plan: `data/Civication/mailPlans/naeringsliv/lager_og_driftsmedarbeider_plan.json`
- People catalog: `data/Civication/mailFamilies/naeringsliv/people/lager_og_driftsmedarbeider_people.json`
- Job catalog: `data/Civication/mailFamilies/naeringsliv/job/lager_og_driftsmedarbeider_job.json`
- Existing two-week Praksisfortellinger remain exactly steps 1–20, alternating `job` / `people` with empty fallbacks.
- Existing work surfaces remain exactly:
  - `varemottak_og_kollikontroll`
  - `plukk_pakk_og_systemflate`
  - `telling_og_avvikspunkt`
  - `hms_og_overleveringsflate`
- Existing work loops remain exactly:
  - `mottak -> kontroll -> registrering -> lokasjon -> plukk -> utlevering`
  - `avvik -> isolering -> telling/fakta -> korrigering -> godkjenning -> læring`

## Why the prerequisite exists

The role is already playable, has a complete 20-step plan, concrete work surfaces, five mail types, knowledge and explicit authority. Career Gameplay nevertheless classifies People as partial because the People catalog exists while the role model still has `related_people: []`.

The correction is narrow: type four professional relationships already present in or directly grounded by the canonical two-week warehouse scenes, and bind each relationship to one existing work surface. The relationship layer makes receiving, traceability, stock reconciliation and HMS handoff socially legible without changing the work loop or the player's mandate.

## Exact professional scenario actors and provenance

Materialize exactly four explicitly fictional workplace actors. They are authored scenario characters, never factual/canonical History Go People:

1. `ragnhild_driftsleder_lager` — fictional operations supervisor at `varemottak_og_kollikontroll`, grounded in `job_lager_og_driftsmedarbeider_week1_receiving_almost_matched`.
2. `pavel_erfaren_lagermedarbeider` — fictional experienced warehouse colleague at `plukk_pakk_og_systemflate`, grounded in `lager_people_snarvei_002` and the established two-week practice voice.
3. `marius_okonomikontakt_lager` — fictional finance/stock-reconciliation contact at `telling_og_avvikspunkt`, grounded in `job_lager_og_driftsmedarbeider_week2_count_mismatch` and the late-colli accounting trace.
4. `helle_hms_og_skiftkontakt_lager` — fictional HMS/handoff contact at `hms_og_overleveringsflate`, grounded in `job_lager_og_driftsmedarbeider_week2_near_miss_everyone_passed`.

Every actor must carry `fictional: true`, `fictional_scenario_actor: true` and `canonical_person_ref: null`. This prevents workplace drama from being interpreted as a factual Scenario People assignment.

## Minimal professional People family

Add one role-owned family, `lager_profesjonelle_arbeidsrelasjoner`, to the existing People catalog with four non-repeatable `work`-channel scenes, one per actor and work surface. Each scene binds `actor_id`, `person_id` and `people_ref` to the same fictional actor and records one exact canonical source-scene ref.

The family is prerequisite evidence only. It is **not inserted into the canonical mail plan**; all 20 existing plan steps and their family order remain authoritative.

## Authority boundary

The role model remains canonical. The player may control and report their own receiving, picking and stock work, stop their own work at relevant safety risk, and request clarification. The player may not falsify stock status, bypass safety, conceal damage or near misses, or self-approve a correction/restart that belongs to an operations, HMS, finance or other formal control line.

No professional relationship, trust signal or future Standing may expand this mandate.

## Readiness target

Before materialization, readiness must be exactly:

- `classification: needs_role_authored_work`
- authored debt: `career:people`, `people_places_integrity`, `situated_reputation`
- `cross_role_need: not_required_for_rollout`
- no blockers

After verified prerequisite materialization:

- Career Gameplay `people` becomes `complete`.
- Existing `places`, `mail`, `knowledge`, `authority`, `day_one` and `workday_loop` remain `complete`.
- Runtime gate remains true and career status remains `playable`.
- Readiness becomes `rollout_ready`.
- `people_places_integrity` becomes `foundation_ready`.
- The **only** remaining authored readiness debt is `situated_reputation`.
- Cross-role remains `not_required_for_rollout`.
- No Lager- og driftsmedarbeider Role World is materialized by this prerequisite PR.

## Completion proof

A valid permanent prerequisite head must pass the focused prerequisite and existing role-package gates, Career Gameplay audit, rollout-readiness audit, compiled Scene Registry parity, Scenario People generated-state and invariant checks, and the full `test:civication` suite. It must regenerate generated artifacts, remove both TEMP files before commit and leave only verified permanent authored/generated state.
