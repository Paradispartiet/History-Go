# Civication By-rådgiver — Role World realism pilot

## Scope

This is the second full Role World realism pilot after the History archive vertical. It deliberately reuses the existing `by/by_radgiver_plan` Lillebekk world instead of inventing a parallel career or engine.

The pilot proves one connected professional life-world:

```text
persistent planning case
→ local evidence and professional judgment
→ institutional authority / limited legal capacity
→ real approval request or escalation
→ History Go learning at Oslo rådhus
→ targeted rework and later manager approval
→ return to the same case with a better learned option
→ formal political handoff only when authority is actually granted
```

## Persistent work case

The shared case is `by_radgiver_lillebekk_plan_case_001`. It is a single `CivicationWorkWorld` object that accumulates:

- school-route and green-corridor evidence;
- handoff to manager and plan-law review;
- visible rework of law / professional judgment / political choice;
- History Go application;
- approval conditions;
- the final decision-basis structure;
- closure only at authorized political submission.

The case references recurring By-rådgiver actors already present in the Role World: Elin (plansjef), Ivar (developer), Hanne (resident), Signe (urban ecologist), Nora (plan-law specialist), and Maja (committee secretary).

## Institution and authority

Static authority is authored on the relevant scenes:

- institution: `oslo_kommune_planavdeling_001`;
- unit: `lillebekk_planteam`;
- reporting line: `elin_plansjef`;
- peer functions: plan law, urban ecology and committee preparation;
- external counterparts: developer and resident;
- approval point: formal submission to political treatment;
- scarce resource: `planjuridisk_kapasitet` with `limited` baseline;
- escalation path: deadline/capacity conflict to the plansjef.

Dynamic state remains in WorkWorld:

- `by_radgiver_lillebekk_approval_001` is created as `pending` and later becomes `granted`;
- `by_radgiver_lillebekk_escalation_001` is created as an `open` escalation if the player chooses that path;
- the main case visibly waits or enters rework instead of pretending every mail is an isolated decision.

The player may recommend within professional influence. Formal political submission is `approval_required`; the authority resolver blocks execution before approval and permits it after the persistent approval object is granted.

## History Go changes professional affordance

The learning scene `by_radgiver_realism_knowledge_radhus_001` sends the player to the canonical `oslo_radhus` place. That place explicitly covers local democracy, municipal administration, city council/city government and the difference between local and national authority.

The task is completed through the existing History Go completion bridge and TaskEngine. Civication does not copy raw History Go progression into a new store.

After completion **and** a positive professional application (`effect >= 1`), the later Lillebekk consequence scene gains a third choice. The learned option explicitly separates:

1. binding legal requirements;
2. documented local evidence;
3. the administration's professional recommendation;
4. the political alternatives that remain for elected decision-makers.

This option is materially better (`effect = 2`) than the ordinary good baseline (`effect = 1`) but does **not** grant new formal authority. The formal send still requires the plansjef's approval.

## Realism represented without a new work-rhythm engine

This pilot intentionally demonstrates concrete rhythm inside the existing Scene Pipeline before Phase 4 is generalized:

- document handoff to manager and plan-law specialist;
- waiting for approval;
- limited specialist capacity;
- escalation instead of hidden quality cuts;
- targeted rework;
- later approval response;
- return to the same work object;
- final handoff to political treatment.

No new scheduler, day engine, reputation engine or institution state store is introduced.

## Regression proof

`tests/civication-by-radgiver-role-world-realism-pilot.test.js` proves:

- one persistent Lillebekk case across all pilot scenes;
- canonical Oslo rådhus evidence and task contract;
- approval request, waiting, escalation and limited capacity contracts;
- formal execution blocked before approval and allowed after grant;
- History Go evidence alone does not unlock the improved option;
- completed + correct + positively applied learning does unlock it;
- learned option creates a different persistent case phase/flags;
- the plan orders all pilot scenes so this is reachable gameplay, not an orphaned data demo;
- compiled registry parity for work context, authority actions, History Go task and affordance.

## Roadmap position

This completes the planned **second full realism pilot**. It does not declare the wider Role World Realism roadmap complete. The next shared implementation layer remains the generalized Phase 4 work-rhythm/backlog/rework contract, followed by situated reputation and a structurally different role pilot before broad rollout resumes.
