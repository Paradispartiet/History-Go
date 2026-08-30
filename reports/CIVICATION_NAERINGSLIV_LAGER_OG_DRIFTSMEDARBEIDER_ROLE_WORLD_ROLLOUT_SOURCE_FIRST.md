# Civication Næringsliv — Lager- og driftsmedarbeider Role World rollout source-first

## Scope lock

Role: `naeringsliv/lager_og_driftsmedarbeider`.

This PR may close **only** `situated_reputation`. It must not replace the canonical 20-step mail plan, shared logistics grammar, role model, professional People prerequisite, authority boundary, Scenario People pipeline or Scene Pipeline runtime.

Target Role World: `data/Civication/roleWorlds/naeringsliv/lager_og_driftsmedarbeider.json` with `status: role_world_complete`, 14 days and 56 independently authored day-phase beats.

## Canonical foundation to preserve

- Role model: `data/Civication/roleModels/naeringsliv/lager_og_driftsmedarbeider.json`
- Work grammar: `data/Civication/workGrammars/naeringsliv/naeringsliv_logistikk_og_drift.json`
- Mail plan: `data/Civication/mailPlans/naeringsliv/lager_og_driftsmedarbeider_plan.json`
- People catalog: `data/Civication/mailFamilies/naeringsliv/people/lager_og_driftsmedarbeider_people.json`
- Job catalog: `data/Civication/mailFamilies/naeringsliv/job/lager_og_driftsmedarbeider_job.json`
- Existing plan remains exactly 20 steps, alternating `job` / `people` with empty fallbacks.
- Existing professional actors remain Ragnhild, Pavel, Marius and Helle on the four role-owned work surfaces.
- Existing work loops remain:
  - `mottak -> kontroll -> registrering -> lokasjon -> plukk -> utlevering`
  - `avvik -> isolering -> telling/fakta -> korrigering -> godkjenning -> læring`
- Existing authority permits routine goods handling, deviation registration and isolation of uncertain goods. It forbids falsifying stock, forwarding damaged goods without clarification, bypassing safety and concealing deviations.

## Exact provenance set

1. `data/Civication/mailFamilies/naeringsliv/job/lager_og_driftsmedarbeider_job.json#job_lager_og_driftsmedarbeider_week1_receiving_almost_matched`
2. `data/Civication/mailFamilies/naeringsliv/job/lager_og_driftsmedarbeider_job.json#job_lager_og_driftsmedarbeider_week1_pick_list_pressure`
3. `data/Civication/mailFamilies/naeringsliv/job/lager_og_driftsmedarbeider_job.json#job_lager_og_driftsmedarbeider_week1_wrong_location`
4. `data/Civication/mailFamilies/naeringsliv/job/lager_og_driftsmedarbeider_job.json#job_lager_og_driftsmedarbeider_week1_pallet_in_the_way`
5. `data/Civication/mailFamilies/naeringsliv/job/lager_og_driftsmedarbeider_job.json#job_lager_og_driftsmedarbeider_week2_late_missing_colli`
6. `data/Civication/mailFamilies/naeringsliv/job/lager_og_driftsmedarbeider_job.json#job_lager_og_driftsmedarbeider_week2_store_waits_wrong_item`
7. `data/Civication/mailFamilies/naeringsliv/job/lager_og_driftsmedarbeider_job.json#job_lager_og_driftsmedarbeider_week2_count_mismatch`
8. `data/Civication/mailFamilies/naeringsliv/job/lager_og_driftsmedarbeider_job.json#job_lager_og_driftsmedarbeider_week2_near_miss_everyone_passed`
9. `data/Civication/mailFamilies/naeringsliv/people/lager_og_driftsmedarbeider_people.json#lager_people_ragnhild_mottak_001`
10. `data/Civication/mailFamilies/naeringsliv/people/lager_og_driftsmedarbeider_people.json#lager_people_pavel_sporbarhet_001`
11. `data/Civication/mailFamilies/naeringsliv/people/lager_og_driftsmedarbeider_people.json#lager_people_marius_avstemming_001`
12. `data/Civication/mailFamilies/naeringsliv/people/lager_og_driftsmedarbeider_people.json#lager_people_helle_hms_handoff_001`

Every ref must resolve before materialization. The Role World reuses these scenes dramaturgically but creates no parallel task, plan, scene or work-object runtime.

## Situated reputation contract

There is **no global reputation score**. Standing is audience-specific and may diverge between:

- operations management, which values honest capacity, usable deviations and reliable handoff;
- the warehouse team, which values practical help, fair bodily load and traceability that does not turn peers into scapegoats;
- inventory and finance control, which values explainable stock history rather than cosmetic numerical agreement;
- quality and HMS, which values visible hazards, preserved facts, safe isolation and correct authority for closure;
- downstream store and operations, which values correct variant, credible availability and early notice of uncertainty;
- transport and supplier interfaces, which value predictable receiving without false signatures or hidden damage;
- private relations, which value rest, reciprocity and the ability to leave counting, vigilance and warehouse rank at work.

A choice may strengthen standing with one audience while weakening it with another. No standing grants stock-correction approval, operational leadership, HMS closure, transport acceptance authority or permission to hide risk.

## Editorial uniqueness contract

All 56 summaries and all 56 standing consequences must be independently authored. A shared boilerplate suffix is forbidden. Each beat names a concrete action, audience and tradeoff; the strict test rejects duplicate or shallow summary/consequence text.

## Cross-role boundary

Readiness says `cross_role_need: not_required_for_rollout`. This rollout therefore materializes no companion Role World, shared persistent object or cross-role runtime. Downstream and control audiences are social consequences inside this role world, not player-owned adjacent careers.

## Completion proof

A valid permanent head must prove 14 days / 56 unique beats, six primary threads with 5–10 refs each, all twelve source refs resolved and used, seven bounded audience standings, no global score, unchanged plan/model/People/grammar/job foundations, no cross-role runtime, synchronized Role World index/checklist/theme/readiness, Career Gameplay still playable, full `test:civication` green, and both TEMP files removed before commit.

## Verified materialization checkpoint

- Fail-closed workflow run: `33323018764` — success.
- Source-first head: `0565cd82d2ccc234e4d45c69f3359a053a7deeba`.
- Permanent materialized head: `959f9e6298bff8f7966db99872d630d67c2adbc7`.
- The workflow resolved all 12 sources, produced 14 days / 56 unique beats, passed the strict role and readiness gates, passed full Civication, removed both TEMP surfaces and committed only permanent state.
- This checkpoint is connector-authored after the bot commit so ordinary exact-head PR workflows can evaluate the verified permanent tree.
