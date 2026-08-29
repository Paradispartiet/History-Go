# Civication Næringsliv — Fagarbeider readiness prerequisites source-first

## Scope lock

Role: `naeringsliv/fagarbeider`.

This prerequisite PR is **not Role World completion**. It may close only the career People prerequisite and the resulting People/Places-integrity entry condition. `situated_reputation` remains explicitly deferred to a later dedicated one-role Role World rollout.

No new runtime, Scene Pipeline, mail-plan engine, cross-role object, global reputation score or formal authority is introduced.

## Canonical foundation to preserve

- Role model: `data/Civication/roleModels/naeringsliv/fagarbeider.json`
- Shared work grammar: `data/Civication/workGrammars/naeringsliv/naeringsliv_fag_og_produksjon.json`
- Mail plan: `data/Civication/mailPlans/naeringsliv/fagarbeider_plan.json`
- People catalog: `data/Civication/mailFamilies/naeringsliv/people/fagarbeider_people.json`
- Job/practice source: `data/Civication/mailFamilies/naeringsliv/job/fagarbeider_intro_v2.json`
- Existing two-week Praksisfortellinger remain steps 1–20, alternating `job` / `people` with empty fallbacks.
- Existing later arc and the People families `uformell_mentor`, `kollega_med_snarveier`, `taus_fagrespekt` and `ansvar_som_glir` remain unchanged.
- Existing work surfaces remain exactly:
  - `oppdrags_og_befaringsflate`
  - `fag_og_utstyrsplass`
  - `kvalitets_og_avvikspunkt`
  - `overleverings_og_opplaeringsflate`

## Why the prerequisite exists

The current Career Gameplay audit already sees a mature People mail catalog but the canonical role model has `related_people: []`. Under the readiness contract this leaves `career:people` partial and therefore keeps `people_places_integrity` below entry readiness even though Places, mail, knowledge, authority and runtime are already mature.

The correction must therefore connect **typed work relationships** to the existing role world instead of inventing a new game system or rewriting the two-week plan.

## Professional scenario actors

Materialize exactly four explicitly fictional workplace actors. They are scenario characters, never historical/canonical History Go People:

1. `rune_arbeidsleder_fagarbeider` — arbeidsleder; assignment, priority and escalation boundary around the `oppdrags_og_befaringsflate`.
2. `amir_erfaren_fagarbeider` — experienced peer; practical standard, shortcuts and craft knowledge around the `fag_og_utstyrsplass`.
3. `selma_kvalitetskontakt_fagarbeider` — quality/HMS contact; deviation evidence and control boundary around the `kvalitets_og_avvikspunkt`.
4. `liv_laerling_fagarbeider` — apprentice; safe explanation, handoff and teach-back around the `overleverings_og_opplaeringsflate`.

Every actor must carry both `fictional: true` and `fictional_scenario_actor: true`, plus `canonical_person_ref: null`, so the Scenario People generator cannot mistake authored workplace drama for a factual person reference.

## Minimal professional People family

Add one role-owned family, `fagarbeider_profesjonelle_arbeidsrelasjoner`, to the existing People catalog with four non-repeatable `work`-channel mails, one per actor. Each scene must bind `actor_id`, `person_id` and `people_ref` to the same fictional actor and use one of the four existing work surfaces.

This family is prerequisite evidence only. It must **not** be inserted into the canonical mail plan; the existing 20-step practice package and later People-family rhythm stay authoritative.

## Authority boundary

The four actors may make responsibility, expertise and escalation socially legible, but none may manufacture new authority for the player.

The existing role boundary remains canonical: the Fagarbeider may work within competence, stop own work at relevant risk, report deviations and teach within scope; the player may not work outside necessary competence, bypass safety controls, self-approve serious deviations without the correct control function or hide faults to protect tempo, colleagues or status.

## Readiness target

Before this PR, readiness must be exactly:

- `classification: needs_role_authored_work`
- authored debt: `career:people`, `people_places_integrity`, `situated_reputation`
- `cross_role_need: not_required_for_rollout`

After verified prerequisite materialization:

- Career Gameplay `people` must be `complete`.
- Existing `places`, `mail`, `knowledge`, `authority`, `day_one` and `workday_loop` must remain `complete`.
- Runtime gate must remain true and career status remain `playable`.
- Readiness must become `rollout_ready`.
- `people_places_integrity` must become `foundation_ready`.
- The **only** remaining authored readiness debt must be `situated_reputation`.
- `naeringsliv/fagarbeider` must enter the controlled rollout queue/first wave for a later dedicated Role World PR.
- No Fagarbeider Role World may be materialized by this prerequisite PR.

## Completion proof

A valid permanent prerequisite head must pass the focused Fagarbeider gate, Career Gameplay audit, rollout-readiness audit, Scenario People invariants and full `test:civication`; regenerate the compiled scene registry; remove all TEMP materializer/workflow files before commit; and leave only verified permanent authored/generated state.