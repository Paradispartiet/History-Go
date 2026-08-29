# Civication Næringsliv — Administrasjonsmedarbeider readiness prerequisites

## Purpose

This is a prerequisite change for `naeringsliv/administrasjonsmedarbeider`. It is **not** a Role World completion and must not add the role to `data/Civication/roleWorlds/index.json`.

Current readiness debt is:

- `career:people`
- `people_places_integrity`
- `situated_reputation`

The career audit already proves day one, workday loop, Places, mail, knowledge and authority. The People component is only partial because the role has People mails but no named/typed professional work relationships in its role-authored foundation.

## Scope locked for this prerequisite

Close only the career People foundation and the resulting People/Places foundation by:

1. adding four explicitly fictional professional scenario actors to the existing role model;
2. adding one professional People family that actually uses those same actor IDs in ordinary administrative work;
3. preserving the existing 20-step two-week practice plan unchanged;
4. regenerating the compiled scene registry, Career Gameplay Matrix and Role World Rollout Readiness;
5. proving that the role becomes `rollout_ready` while `situated_reputation` remains the only authored rollout debt.

## Professional relationship set

The scenario actors are fictional and role-owned, not canonical historical People:

- `nora_administrasjonskoordinator` — administrative coordinator; can assign/clarify process work but cannot manufacture approval authority.
- `marius_regnskapsmedarbeider_admin` — accounting colleague; owns accounting/documentation questions within his remit, not the player's approvals.
- `lea_innkjopskoordinator_admin` — procurement coordinator; owns purchase-order/source clarification, not unilateral financial approval.
- `eirik_driftskontakt_admin` — operations contact; owns operational facts and handoff context, not accounting classification or approval.

The four work encounters cover handoff, missing documentation, purchase-order/source clarification and operational ownership. They exist to make the already-authored work loop socially concrete, not to create a new runtime system.

## Authority boundary

The existing authority contract remains authoritative. The player may control source material, request documentation, keep a matter open and escalate process/control deviations. The player may not approve without mandate, hide deviations, turn assumptions into documented facts, or take over another profession's responsibility merely because they coordinate the process.

No relationship or reputation value may grant new formal authority.

## Places

No new Places are required. The role model already provides four concrete workplace surfaces and the career audit currently reports Places as complete. The professional actors are attached to those existing administrative surfaces.

## Situated reputation

This prerequisite intentionally does **not** author situated reputation. Once Career People becomes complete, readiness should classify the role as `rollout_ready` with exactly `situated_reputation` remaining. That dimension belongs in the later controlled one-role Role World rollout.

## Cross-role

Readiness currently says `not_required_for_rollout`. This prerequisite must not create a shared work object, cross-role runtime link, or new authority transfer.

## Preservation contract

The change must preserve:

- `data/Civication/roleModels/naeringsliv/okonomi_og_administrasjonsmedarbeider.json` as the canonical role model;
- `data/Civication/workGrammars/naeringsliv/naeringsliv_administrasjon_og_okonomistyring.json` as the existing shared grammar;
- `data/Civication/mailPlans/naeringsliv/administrasjonsmedarbeider_plan.json` with the same 20 steps and existing allowed families;
- the existing private People material and two-week practice stories;
- the existing Scene Pipeline and compiled registry architecture;
- the authority contract and salary/career outcome semantics;
- the Role World index unchanged for this role.

## Fail-closed acceptance

Permanent state may be committed only after:

- the materializer adds exactly the locked professional actor set and professional People family;
- the compiled scene registry is regenerated and contains all four new professional People scenes;
- Career Gameplay Matrix reports `people=complete`, `places=complete` and `runtime_gate=true` for `naeringsliv/administrasjonsmedarbeider`;
- Rollout Readiness reports `classification=rollout_ready`, `people_places_integrity=foundation_ready`, `cross_role.need=not_required_for_rollout`, and `authored_work_required=["situated_reputation"]`;
- the role is still absent from the Role World index;
- focused prerequisite tests, canonical career/readiness gates and the full Civication suite pass;
- TEMP materializer/workflow surfaces are removed before the permanent commit.
