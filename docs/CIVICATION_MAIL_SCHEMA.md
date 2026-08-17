# Civication Mail Schema — authored source format

Status: **source-format guide; ikke canonical scene-schema**  
Sist reconcilet: **2026-08-18**

Canonical gameplay-schema er `data/Civication/sceneContractV1.schema.json`. Mailfiler er authored source-of-build og normaliseres/kompileres til `civication_scene_v1` før normal work-runtime.

Vanlige sourcefelt per mail kan være:

- `id`
- `mail_type`
- `mail_family`
- `role_scope`
- `subject`
- `summary` / `situation`
- `purpose`
- `stakes`
- `from` / `person_id`
- `place_id`
- `task_domain`
- `competency`
- `pressure`
- `choice_axis`
- `consequence_axis`
- `narrative_arc`
- `choices`
- `next_bias`
- `triggers_on_choice`
- `practice_story_id`

Vanlige choice-felt:

- `id`
- `label`
- `reply` når maildelivery trenger det
- `effect` / effects
- `tags`
- `feedback`

Det avgjørende er ikke at alle legacy mailfelt finnes, men at adapter/build kan produsere en gyldig `civication_scene_v1` med riktig `interaction_mode`, effects, people/place/thread/provenance og knowledge-contract der relevant.

Nye mail-sourceformater er frosset. Se `data/Civication/scenePipelinePolicyV1.json`.
