# Civication work-object Scene Pipeline integration

This slice connects the persistent work-object foundation to the existing canonical Scene Pipeline without introducing a second scene engine or a second state owner.

## Ownership

- `civication_scene_v1` remains the semantic scene contract.
- `effects.work_object_ops` is the only authored mutation surface for persistent work objects.
- `work_context` is read-only scene context: it points at persistent objects and optional institution/deadline context.
- `CivicationWorkWorld` remains the only state adapter for `CivicationState.work_world`.
- `CivicationChoiceDirector` remains the accepted-answer boundary.
- `dayConsequences` remains the single choice-consequence handler and delegates work-object mutations to `CivicationWorkWorld`.

## Fail-closed rules

Authored work-object operations are compiler-validated. Unknown operation fields, malformed IDs, duplicate identifiers, invalid create seeds, and malformed context fail compilation rather than being silently discarded.

At runtime, all scene-level and selected-choice operations are collected into one batch. The complete batch is first executed against an in-memory shadow of the current work-world state. Only a successful preflight is applied to the real state. This prevents a valid early operation from being persisted when a later operation in the same accepted choice is invalid.

Stable authored `event_id` values provide replay idempotence. Runtime owns `scene_id`, `choice_id`, and the answer timestamp; authored operations cannot spoof those provenance fields.

## Compatibility

Both fields are optional. Existing scenes compile to the same semantic output when they do not use work-object fields, existing saves without `work_world` remain valid through the foundation adapter, and roles do not become Role World complete merely by gaining this runtime capability.

No concrete role is migrated in this PR. The first intended consumer remains `historie/historie_arkiv_og_dokumentasjon` in a separate one-role PR after this integration is merged and green.
