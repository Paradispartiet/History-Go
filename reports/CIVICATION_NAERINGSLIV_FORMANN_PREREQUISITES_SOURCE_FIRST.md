# Civication Næringsliv — Formann readiness prerequisites source-first

## Scope lock

Role: `naeringsliv/formann`.

This prerequisite PR is **not Role World completion**. It may close only the Career People prerequisite and the resulting People/Places-integrity entry condition. `situated_reputation` remains explicitly deferred to a later dedicated one-role Role World rollout.

No new runtime, Scene Pipeline, mail-plan engine, cross-role object, global reputation score or formal authority is introduced. `candidate_when_shared_work_is_real` remains a readiness observation, not a requirement to materialize shared work in this prerequisite.

## Canonical foundation to preserve

- Role model: `data/Civication/roleModels/naeringsliv/formann_arbeidsleder.json`
- Shared work grammar: `data/Civication/workGrammars/naeringsliv/naeringsliv_operativ_ledelse.json`
- Mail plan: `data/Civication/mailPlans/naeringsliv/formann_plan.json`
- People catalog: `data/Civication/mailFamilies/naeringsliv/people/formann_people.json`
- Job catalog: `data/Civication/mailFamilies/naeringsliv/job/formann_job.json`
- Existing two-week Praksisfortellinger remain steps 1–20, alternating `job` / `people` with empty fallbacks.
- Existing later arc remains steps 21–31; this prerequisite does not add a plan step or replace any existing People family.
- Existing work surfaces remain exactly:
  - `produksjons_og_arbeidsomrade`
  - `arbeidslederpunkt`
  - `hms_og_avvikspunkt`
  - `skift_og_overleveringsrom`
- Existing operational work loops remain exactly:
  - `mål -> kapasitet -> bemanning -> gjennomføring -> kontroll -> oppfølging`
  - `hendelse -> sikre -> fakta -> ansvar -> tiltak -> læring`

## Why the prerequisite exists

The current role is already playable and has concrete operational Places, a mature 31-step plan, mail, knowledge and explicit authority through the shared operative-leadership grammar. The readiness gate is nevertheless correct to keep it out of Role World rollout because the role model still has `related_people: []` and no typed professional People links.

The correction is therefore narrow: connect professional workplace relationships to the four already-canonical work surfaces. The new relationships make assignment, competence, safety, escalation and truthful handoff socially legible without changing the work loops, the player's formal mandate or the canonical progression.

## Professional scenario actors

Materialize exactly four explicitly fictional workplace actors. They are authored scenario characters, never factual/canonical History Go People:

1. `arvid_erfaren_fagarbeider_formann` — experienced fagarbeider; workload, craft judgment and fair allocation on `produksjons_og_arbeidsomrade`.
2. `noor_nyansatt_fagarbeider_formann` — newer team member; clear assignment, competence boundary and speak-up conditions at `arbeidslederpunkt`.
3. `selma_hms_kvalitetskontakt_formann` — HMS/quality contact; stop, documentation and escalation boundary at `hms_og_avvikspunkt`.
4. `maja_neste_skiftleder_formann` — next-shift leader; truthful residual-work, risk and ownership handoff at `skift_og_overleveringsrom`.

Every actor must carry `fictional: true`, `fictional_scenario_actor: true` and `canonical_person_ref: null`. This prevents authored workplace drama from being interpreted as a factual Scenario People assignment.

## Minimal professional People family

Add one role-owned family, `formann_profesjonelle_arbeidsrelasjoner`, to the existing People catalog with four non-repeatable `work`-channel scenes, one per actor. Each scene binds `actor_id`, `person_id` and `people_ref` to the same fictional actor and uses one of the four existing work surfaces.

This family is prerequisite evidence only. It is **not inserted into the canonical mail plan**; all 31 existing plan steps and their families remain authoritative.

## Authority boundary

The shared operative-leadership grammar remains canonical. The Formann may:

- `prioritere drift innen fullmakt`
- `fordele arbeid`
- `eskalere kapasitets- og sikkerhetskonflikter`

The Formann may not:

- `omgå arbeids- eller sikkerhetsrutiner`
- `skjule hendelser`
- `bruke utilbørlig press`
- `ta beslutninger uten fullmakt`

The four professional actors can make these boundaries visible in situated work, but no relationship, trust signal or shared-work possibility may expand the formal mandate.

## Cross-role boundary

Current readiness says `candidate_when_shared_work_is_real`. That status is preserved. The professional relationships genuinely touch adjacent roles, but this prerequisite does not invent a shared persistent work object merely to satisfy a candidate label. Any future cross-role materialization must be justified by an actual shared object and a dedicated contract.

## Readiness target

Before this PR, readiness must be exactly:

- `classification: needs_role_authored_work`
- authored debt: `career:people`, `people_places_integrity`, `situated_reputation`
- `cross_role_need: candidate_when_shared_work_is_real`
- no blockers

After verified prerequisite materialization:

- Career Gameplay `people` must be `complete`.
- Existing `places`, `mail`, `knowledge`, `authority`, `day_one` and `workday_loop` remain `complete`.
- Runtime gate remains true and career status remains `playable`.
- Readiness becomes `rollout_ready`.
- `people_places_integrity` becomes `foundation_ready`.
- The **only** remaining authored readiness debt is `situated_reputation`.
- `naeringsliv/formann` enters the controlled first wave for a later dedicated Role World PR.
- Cross-role remains `candidate_when_shared_work_is_real` without a cross-role object.
- No Formann Role World is materialized by this prerequisite PR.

## Completion proof

A valid permanent prerequisite head must pass the focused Formann gate, Career Gameplay audit, rollout-readiness audit, compiled Scene Registry parity, Scenario People invariants and full `test:civication`; regenerate the compiled Scene Registry and generated Scenario People; remove all TEMP materializer/workflow files before commit; and leave only verified permanent authored/generated state.