# Civication Næringsliv — Fagarbeider Role World rollout source-first

## Scope lock

Role: `naeringsliv/fagarbeider`.

This PR may close **only** `situated_reputation`. It must not replace the existing 20-step two-week practice plan, shared work grammar, role model, professional People prerequisite, authority boundary, Scenario People pipeline or Scene Pipeline runtime.

Target Role World: `data/Civication/roleWorlds/naeringsliv/fagarbeider.json` with `status: role_world_complete`, 14 days and 56 dramaturgical beats.

## Canonical foundation to preserve

- Role model: `data/Civication/roleModels/naeringsliv/fagarbeider.json`
- Work grammar: `data/Civication/workGrammars/naeringsliv/naeringsliv_fag_og_produksjon.json`
- Mail plan: `data/Civication/mailPlans/naeringsliv/fagarbeider_plan.json`
- People catalog: `data/Civication/mailFamilies/naeringsliv/people/fagarbeider_people.json`
- Existing plan remains exactly 20 first-/second-week practice steps, alternating `job` / `people` with empty fallbacks before the later arc.
- Existing professional scenario actors remain Rune, Amir, Selma and Liv on the four role-owned workplace surfaces.
- Existing work loops remain `ordre -> standard -> utførelse -> kontroll -> avvik -> overlevering` and `feil -> sikring -> diagnose -> tiltak -> kontroll -> læring`.
- Existing authority remains work within competence, stop own work at relevant risk, report deviations and teach within scope; standing may never authorize competence bypass, safety bypass, self-approval of serious deviations or concealed faults.

## Exact provenance set

1. `data/Civication/mailFamilies/naeringsliv/job/fagarbeider_intro_v2.json#job_fagarbeider_week1_first_inspection`
2. `data/Civication/mailFamilies/naeringsliv/people/fagarbeider_people.json#fagarbeider_people_rune_oppdrag_001`
3. `data/Civication/mailFamilies/naeringsliv/people/fagarbeider_people.json#fagarbeider_people_amir_standard_001`
4. `data/Civication/mailFamilies/naeringsliv/people/fagarbeider_people.json#fagarbeider_people_selma_avvik_001`
5. `data/Civication/mailFamilies/naeringsliv/people/fagarbeider_people.json#fagarbeider_people_liv_overlevering_001`
6. `data/Civication/mailFamilies/naeringsliv/conflict/fagarbeider_conflict.json#fagarbeider_conflict_integritet_early_001`
7. `data/Civication/mailFamilies/naeringsliv/conflict/fagarbeider_conflict.json#fagarbeider_conflict_ansvar_intro_001`
8. `data/Civication/mailFamilies/naeringsliv/people/fagarbeider_people.json#personal_fagarbeider_week1_body_after_first_day`

Every ref must resolve before materialization. The Role World may reuse these sources dramaturgically but may not create a parallel scene or task runtime.

## Situated reputation contract

There is **no global reputation score**. Standing must be audience-specific and allowed to diverge between:

- work leadership / reliable assignment clarification, risk signalling and escalation;
- craft peers / technical judgement, standard and resistance to normalized shortcuts;
- quality and HMS / visible deviations, evidence and safety boundaries;
- apprentices and learners / safe explanation, teach-back and explicit competence limits;
- downstream handoff / truthful status, rest work and reconstructable transfer;
- production or customer pressure / delivery discipline without sacrificing standard or safety;
- private relations / ability to contain work identity, body strain and status outside work.

A choice may strengthen standing with one audience while weakening it with another. None of these standings may grant formal leadership, approval rights, control-function authority or permission to work outside competence or bypass safety.

## Existing work continuity

The Role World keeps the canonical loops intact:

- `ordre -> standard -> utførelse -> kontroll -> avvik -> overlevering`
- `feil -> sikring -> diagnose -> tiltak -> kontroll -> læring`

The 14-day world is an authored social layer around existing practical work, the two-week practice sequence and later Fagarbeider arc. It is not a new work-object engine.

## Cross-role boundary

Readiness says `cross_role_need: not_required_for_rollout`. Therefore this rollout materializes no shared cross-role work object, companion Role World or new cross-role runtime. Rune, Amir, Selma and Liv remain role-owned fictional scenario actors.

## Completion proof

A valid permanent head must prove all of the following before commit:

- Role World contract passes with 14 days / 56 unique day-phase beats and 5–10 refs per primary thread;
- `situated_reputation` is the only newly authored readiness dimension;
- all eight exact provenance refs resolve;
- no global reputation score exists;
- authority boundaries and the 20-step plan remain unchanged;
- work grammar and existing work rhythm remain unchanged;
- cross-role runtime remains unmaterialized;
- Role World index, checklist and theme profile are synchronized;
- rollout readiness removes Fagarbeider from the remaining rollout queue;
- full `test:civication` passes;
- TEMP materializer/workflow are removed before permanent commit.
