# Civication Næringsliv — Mellomleder readiness prerequisites source-first

## Scope lock

Role: `naeringsliv/mellomleder`.

This prerequisite PR is **not Role World completion**. It may close only `career:people` and the resulting `people_places_integrity` entry condition. `situated_reputation` remains explicitly deferred to a later dedicated one-role Role World rollout.

No new runtime, Scene Pipeline, mail-plan engine, persistent work object, cross-role object, global reputation score or formal authority is introduced. Readiness remains `candidate_when_shared_work_is_real`; that label is a design observation, not permission to invent shared work.

## Reconciliation of the historical branch

`claude/civication-mellomleder-v2` is historical runtime work, not an active rollout branch. At preflight it is 16,679 commits behind current `main`, zero commits ahead, has no unique diff and has no open PR. This prerequisite therefore starts from current `main` and does not revive or overwrite that stale branch.

## Canonical foundation to preserve

- Role model: `data/Civication/roleModels/naeringsliv/kapitalforvalter.json`
- Shared work grammars:
  - `data/Civication/workGrammars/naeringsliv/naeringsliv_finans_og_kapitalforvaltning.json`
  - `data/Civication/workGrammars/naeringsliv/naeringsliv_virksomhetsledelse.json`
- Mail plan: `data/Civication/mailPlans/naeringsliv/mellomleder_plan.json`
- People catalog: `data/Civication/mailFamilies/naeringsliv/people/mellomleder_people.json`
- Job catalog: `data/Civication/mailFamilies/naeringsliv/job/mellomleder_job.json`
- Existing People base: `data/Civication/people/naeringsliv/mellomleder_people_base.json`
- Steps 1–20 remain the exact two-week `job` / `people` practice rhythm with empty fallbacks.
- Steps 21–25 remain the existing `conflict` / `people` / `job` / `story` / `event` arc.
- Existing work surfaces remain exactly:
  - `analyse_og_rapporteringsflate`
  - `strategi_og_beslutningsrom`
  - `drift_og_kapasitetsgjennomgang`
  - `risiko_og_oppfolgingsbord`

The fallback scope intentionally covers strategic leadership and ownership titles with different mandates. Professional relationships may make that ambiguity visible, but they must not silently grant owner, board, investment, HR or group-management authority.

## Why the prerequisite exists

The role is playable and already has a mature 25-step plan, two complete practice weeks, concrete work surfaces, five mail types, knowledge and explicit authority boundaries. Career Gameplay still classifies People as partial because the linked role model has `related_people: []` while the People catalog exists only on the content side of the boundary.

The correction is narrow: type four professional relationships already carrying the canonical two-week work drama, then bind each to one existing work surface. The existing private People material, historical People families and `mellomleder_people_base.json` remain unchanged.

## Exact professional scenario actors and provenance

Materialize exactly four explicitly fictional workplace actors. They are authored scenario characters, never factual/canonical History Go People:

1. `ingrid_omradesjef_mellomleder` — area manager at `analyse_og_rapporteringsflate`, grounded in `job_mellomleder_week1_first_monday_report`.
2. `mads_sidestilt_leder_mellomleder` — peer manager at `strategi_og_beslutningsrom`, grounded in `job_mellomleder_week2_numbers_become_politics`.
3. `rana_teamkoordinator_mellomleder` — team coordinator at `drift_og_kapasitetsgjennomgang`, grounded in `job_mellomleder_week1_peace_below_speed_above`.
4. `thomas_medarbeider_oppfolging_mellomleder` — employee in a bounded support/expectation follow-up at `risiko_og_oppfolgingsbord`, grounded in `job_mellomleder_week2_thomas_followup_aftershock`.

Every actor carries `fictional: true`, `fictional_scenario_actor: true` and `canonical_person_ref: null`. This prevents workplace drama from being interpreted as factual Scenario People and prevents historical People in the existing catalog from being repurposed as contemporary employees.

## Minimal professional People family

Add one role-owned family, `mellomleder_profesjonelle_arbeidsrelasjoner`, to the existing People catalog with four non-repeatable `work`-channel scenes. Each scene binds `actor_id`, `person_id` and `people_ref` to the same fictional actor, records one exact source-scene ref and stays on one existing work surface.

The family is prerequisite evidence only. It is **not inserted into the canonical mail plan**; all 25 existing plan steps and family order remain authoritative.

## Authority, personnel and privacy boundary

- Ingrid may request reporting, clarify priorities and own decisions within her line. Her request cannot authorize false reporting or transfer owner/board/HR powers to the player.
- Mads may coordinate and explain leader-group politics. Peer advice cannot become approval or authority over the player's team.
- Rana may surface local capacity, training load and team experience. Her observations are evidence, not a diagnosis or a formal personnel decision.
- Thomas may ask what is being observed, expected and documented. The player must distinguish support, ordinary expectations and any formal process; may not diagnose exhaustion, promise confidentiality outside policy, or turn health-adjacent information into team gossip.

No professional relationship, trust signal or future Standing expands the formal mandate in either shared grammar.

## Readiness target

Before materialization:

- `classification: needs_role_authored_work`
- authored debt: `career:people`, `people_places_integrity`, `situated_reputation`
- `cross_role_need: candidate_when_shared_work_is_real`
- no blockers

After verified prerequisite materialization:

- Career Gameplay `people` becomes `complete`.
- Existing `places`, `mail`, `knowledge`, `authority`, `day_one` and `workday_loop` remain `complete`.
- Runtime gate remains true and career status remains `playable`.
- Readiness becomes `rollout_ready` and `people_places_integrity` becomes `foundation_ready`.
- The **only** remaining authored readiness debt is `situated_reputation`.
- Cross-role remains `candidate_when_shared_work_is_real`, without a companion, shared object or new runtime.
- No Mellomleder Role World is materialized by this prerequisite PR.

## Completion proof

A valid permanent prerequisite head must pass the focused prerequisite test, existing Mellomleder playability and two-week tests, Career Gameplay audit, rollout-readiness audit, compiled Scene Registry parity, Scenario People generated-state and invariant checks, and full `test:civication`. The fail-closed runner must regenerate generated artifacts, remove both TEMP files before commit and leave only verified permanent authored/generated state.

## Verified permanent checkpoint

The fail-closed materialization run completed successfully on source-first head `81596244596254a7a07c07d105d9efae5168bae9` and produced permanent content head `2577eb5497ed91e4a31efb366e7ad2361109e39c`. Every focused prerequisite and existing Mellomleder gate passed, full Civication passed, and the workflow removed both temporary surfaces before publishing the permanent commit. This checkpoint records that verified transition without changing any authored gameplay contract.
