# Civication Næringsliv — Administrasjonsmedarbeider Role World rollout source-first

## Scope lock

Role: `naeringsliv/administrasjonsmedarbeider`.

This PR may close **only** `situated_reputation`. It must not replace the existing 20-step two-week mail plan, shared work grammar, role model, professional People prerequisite, authority boundary, salary/career semantics, Scenario People pipeline or Scene Pipeline runtime.

Target Role World: `data/Civication/roleWorlds/naeringsliv/administrasjonsmedarbeider.json` with `status: role_world_complete`, 14 days and 56 dramaturgical beats.

## Canonical foundation to preserve

- Role model: `data/Civication/roleModels/naeringsliv/okonomi_og_administrasjonsmedarbeider.json`
- Work grammar: `data/Civication/workGrammars/naeringsliv/naeringsliv_administrasjon_og_okonomistyring.json`
- Mail plan: `data/Civication/mailPlans/naeringsliv/administrasjonsmedarbeider_plan.json`
- People catalog: `data/Civication/mailFamilies/naeringsliv/people/administrasjonsmedarbeider_people.json`
- Existing plan remains exactly 20 steps, alternating role-owned job/private People practice surfaces.
- Existing professional scenario actors remain Nora, Marius, Lea and Eirik on the four role-owned workplace surfaces.
- Existing authority remains controlling/collecting/escalating documentation, never approving without mandate, hiding deviations or presenting assumptions as documented facts.

## Exact provenance set

1. `data/Civication/mailFamilies/naeringsliv/job/administrasjonsmedarbeider_job.json#job_administrasjonsmedarbeider_week1_voucher_without_owner`
2. `data/Civication/mailFamilies/naeringsliv/people/administrasjonsmedarbeider_people.json#administrasjonsmedarbeider_people_nora_handoff_001`
3. `data/Civication/mailFamilies/naeringsliv/people/administrasjonsmedarbeider_people.json#administrasjonsmedarbeider_people_marius_documentation_001`
4. `data/Civication/mailFamilies/naeringsliv/conflict/administrasjonsmedarbeider_conflict.json#conflict_administrasjonsmedarbeider_close_without_owner`
5. `data/Civication/mailFamilies/naeringsliv/story/administrasjonsmedarbeider_story.json#story_administrasjonsmedarbeider_which_version_became_truth`
6. `data/Civication/mailFamilies/naeringsliv/event/administrasjonsmedarbeider_event.json#event_administrasjonsmedarbeider_system_down_before_deadline`
7. `data/Civication/mailFamilies/naeringsliv/people/administrasjonsmedarbeider_people.json#personal_administrasjonsmedarbeider_week1_receipts_at_home`

Every ref must resolve to an existing mail before materialization. Role World coverage may reuse these sources dramaturgically but may not create a parallel runtime.

## Situated reputation contract

There is **no global reputation score**. Standing must be audience-specific and allowed to diverge between:

- administrative coordination / handoff reliability;
- accounting and economy / documentation trust;
- procurement / correction and source integrity;
- operations / use of local context without authority drift;
- office leadership / reliable escalation and visible uncertainty;
- audit/downstream control / reconstructability of what happened;
- private relations / ability to contain administrative language and status outside work.

A choice may strengthen one standing while weakening another. None of these standings may grant approval authority, accounting classification authority, procurement authority, management authority or power to turn assumptions into documented facts.

## Existing work continuity

The Role World must keep the established loops intact:

- `grunnlag -> kontroll -> registrering -> analyse -> rapport -> oppfølging`
- `avvik -> datakilde -> årsak -> konsekvens -> tiltak -> dokumentasjon`

The 14-day world is an authored social layer around that existing work and the 20-step practice sequence, not a new task engine.

## Cross-role boundary

Readiness says `cross_role_need: not_required_for_rollout`. Therefore this rollout must materialize no shared work object, no companion Role World link and no new cross-role runtime. Professional encounters remain role-owned People/mail scenes.

## Completion proof

A valid permanent head must prove all of the following before commit:

- Role World contract passes with 14 days / 56 unique day-phase beats and 5–10 refs per primary thread;
- `situated_reputation` is the only authored dimension closed;
- exact provenance refs resolve;
- no global reputation score exists;
- authority boundaries remain explicit;
- 20-step mail plan and shared work grammar remain unchanged;
- cross-role runtime remains unmaterialized;
- Role World index/checklist/theme profile are synchronized;
- rollout readiness removes Administrasjonsmedarbeider from the remaining rollout queue;
- full `test:civication` passes;
- TEMP materializer/workflow are removed before the permanent commit.
