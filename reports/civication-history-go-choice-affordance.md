# Civication History Go knowledge → choice affordance

## Status

Shared Role World realism foundation for making completed History Go learning change the professional action space in Civication.

This slice deliberately does **not** add a second engine, a second learning store or a new role rollout. It reuses the already-authoritative Civication task/completion bridge and projects better choices only when explicit learning evidence exists.

## Contract

A canonical choice may opt in with:

```json
{
  "affordance": {
    "history_go": {
      "task_mail_ids": ["some_knowledge_mail_id"],
      "require_task_completed": true,
      "require_history_go_correct": true,
      "min_effect": 1
    }
  }
}
```

Meaning:

- `task_mail_ids`: stable Civication mail ids whose TaskEngine tasks must exist.
- `require_task_completed`: the knowledge task must have completed its Civication mail loop, not merely produced an HG signal.
- `require_history_go_correct`: `task.history_go.correct` must be true, as written by the existing History Go completion bridge.
- `min_effect`: the completed knowledge mail must have been applied at or above this professional quality/effect threshold.

All listed task mails are required. A malformed or unresolved affordance fails closed.

## Runtime ownership

`CivicationTaskEngine` remains the only owner of task truth. `CivicationHistoryGoTaskBridge` remains the only bridge that reconciles raw History Go state into `task.history_go`.

`CivicationChoiceAffordance` is a pure reader/projector:

1. resolve the referenced tasks through `CivicationTaskEngine.getTaskByMailId`,
2. evaluate completed/correct/effect requirements,
3. hide gated choices until all requirements are satisfied,
4. never mutate the persisted event or task state.

`CivicationEventEngine.getPendingEvent()` applies this projection dynamically. This gives both the UI and the ChoiceDirector the same visible/answerable choice set. If the resolver is missing or fails, gated choices are removed rather than exposed.

## Compiler safety

The Scene Registry compiler normalizes the affordance into canonical `civication_scene_v1` choices and validates that:

- every referenced task mail exists in the compiled runtime registry,
- every referenced mail is a task scene with `completion_rule: history_go_payload_completed`,
- decision scenes retain at least two ungated choices so learning can improve the action space without deadlocking the player.

Legacy choices without `affordance` are byte-semantic unchanged by the runtime projection.

## Arkiv vertical proof

The first proof uses the existing Arkiv day:

1. `historie_arkiv_knowledge_akershus_001` sends the player to Akershus festning in History Go and trains the distinction between historical synthesis, source claims and archival provenance/metadata.
2. The player must complete the History Go evidence and answer the Civication knowledge task with positive professional application.
3. Later, when `historie_arkiv_consequence_migrering_001` returns to the persistent digital preservation case, a new choice `C` becomes available.
4. The new choice explicitly applies the learned source-boundary method: separate verified technical provenance, archival metadata and later historical interpretation while preserving unresolved authenticity uncertainty.
5. The original safe choice remains available before learning. The player is never hard-blocked from the case; learning expands professional competence instead of acting as an arbitrary gate.

This is the intended loop:

**work problem → History Go learning → completed professional application → return to persistent work case → better choice appears → different work-object consequence**.

## Next

With this foundation proved in Arkiv, the next full realism pilot is `by/by_radgiver_plan`, where the same mechanism can combine persistent plan cases, institutional authority, hearings/approvals and History Go place/knowledge work.
