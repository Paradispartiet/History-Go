# Civication Næringsliv — Formann Role World rollout source-first

## Scope lock

Role: `naeringsliv/formann`.

This PR may close **only** `situated_reputation`. It must not replace the existing 31-step mail plan, shared operative-leadership grammar, role model, professional People prerequisite, authority boundary, Scenario People pipeline or Scene Pipeline runtime.

Target Role World: `data/Civication/roleWorlds/naeringsliv/formann.json` with `status: role_world_complete`, 14 days and 56 uniquely authored day-phase beats.

## Canonical foundation to preserve

- Role model: `data/Civication/roleModels/naeringsliv/formann_arbeidsleder.json`
- Work grammar: `data/Civication/workGrammars/naeringsliv/naeringsliv_operativ_ledelse.json`
- Mail plan: `data/Civication/mailPlans/naeringsliv/formann_plan.json`
- People catalog: `data/Civication/mailFamilies/naeringsliv/people/formann_people.json`
- Existing plan remains exactly 31 steps. Steps 1–20 remain the two-week Praksisfortellinger block, alternating `job` / `people` with empty fallbacks; steps 21–31 remain the later Formann arc.
- Existing professional scenario actors remain Arvid, Noor, Selma and Maja on the four role-owned work surfaces.
- Existing work loops remain `mål -> kapasitet -> bemanning -> gjennomføring -> kontroll -> oppfølging` and `hendelse -> sikre -> fakta -> ansvar -> tiltak -> læring`.
- Existing authority remains prioritizing operations within mandate, assigning work and escalating capacity/safety conflicts. Standing may never authorize bypassing work or safety routines, concealing incidents, coercion or decisions outside mandate.

## Exact provenance set

1. `data/Civication/mailFamilies/naeringsliv/job/formann_job.json#job_formann_week1_first_shift_board`
2. `data/Civication/mailFamilies/naeringsliv/people/formann_people.json#formann_people_arvid_fordeling_001`
3. `data/Civication/mailFamilies/naeringsliv/people/formann_people.json#formann_people_noor_mandat_001`
4. `data/Civication/mailFamilies/naeringsliv/people/formann_people.json#formann_people_selma_avvik_001`
5. `data/Civication/mailFamilies/naeringsliv/people/formann_people.json#formann_people_maja_overlevering_001`
6. `data/Civication/mailFamilies/naeringsliv/conflict/formann_conflict.json#formann_conflict_tempo_early_001`
7. `data/Civication/mailFamilies/naeringsliv/conflict/formann_conflict.json#formann_conflict_lojalitet_early_001`
8. `data/Civication/mailFamilies/naeringsliv/story/formann_story.json#formann_story_ansvar_001`
9. `data/Civication/mailFamilies/naeringsliv/people/formann_people.json#personal_formann_week2_sleep_after_near_miss`

Every ref must resolve before materialization. The Role World may reuse these sources dramaturgically but may not create a parallel scene, task, plan or work-object runtime.

## Situated reputation contract

There is **no global reputation score**. Standing must be audience-specific and allowed to diverge between:

- operations management / capacity honesty, early escalation and delivery control;
- the work crew / fair assignment, competence-respecting direction and protection from hidden overload;
- quality and HMS / visible incidents, evidence, control boundaries and safe restart;
- new workers and learners / understandable instructions, speak-up safety and explicit competence limits;
- peer and downstream shift leadership / truthful status, residual work, risk and reconstructable handoff;
- planning, customer or production pressure / predictable delivery without converting deadlines into informal authority;
- private relations / the ability to put down vigilance, responsibility and workplace rank outside work.

A choice may strengthen standing with one audience while weakening it with another. None of these standings may grant personnel authority, approval rights, control-function authority, expanded mandate or permission to hide incidents or bypass safety.

## Existing work continuity

The Role World keeps the canonical loops intact:

- `mål -> kapasitet -> bemanning -> gjennomføring -> kontroll -> oppfølging`
- `hendelse -> sikre -> fakta -> ansvar -> tiltak -> læring`

The 14-day world is an authored social layer around existing Formann work, the two-week practice sequence and the later 11-step arc. It is not a new work-object engine.

## Cross-role boundary

Readiness says `cross_role_need: candidate_when_shared_work_is_real`. The adjacent leadership roles are plausible companions, but this rollout has no governed shared persistent object with an identified owner, handoff state and authority contract. It therefore materializes no cross-role object, companion Role World or new cross-role runtime. A later dedicated contract may do so only when the shared work is real and testable.

## Completion proof

A valid permanent head must prove all of the following before commit:

- Role World contract passes with 14 days / 56 unique day-phase beats and 5–10 refs per primary thread;
- all 56 beat summaries are individually authored around a concrete day-phase action, not a repeated topic template;
- `situated_reputation` is the only newly authored readiness dimension;
- all nine exact provenance refs resolve;
- no global reputation score exists;
- authority boundaries, professional People foundation and the 31-step plan remain unchanged;
- work grammar and existing work rhythm remain unchanged;
- cross-role runtime remains unmaterialized;
- Role World index, checklist and theme profile are synchronized;
- rollout readiness removes Formann from the remaining rollout queue;
- full `test:civication` passes;
- TEMP materializer/workflow are removed before permanent commit.
