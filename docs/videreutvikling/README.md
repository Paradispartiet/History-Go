# Videreutvikling

Status: **fremtids- og implementasjonsplanlegging — ikke canonical runtime-status**  
Sist kontrollert: **2026-08-23**

Denne mappen samler eksplisitt videreutviklingsarbeid som er besluttet eller ønsket, men som ikke skal leses som bevis på at funksjonaliteten allerede finnes i History Go eller Civication.

Canonical dokumenter, runtime, source-data, manifester og tester er fortsatt sannhetskilden for hva som faktisk er implementert. Når et punkt her blir implementert, skal relevant canonical dokumentasjon, schema, runtime og tester oppdateres i samme eller etterfølgende avgrensede PR-er.

## Civication — rikere livsverdener

1. [`CIVICATION_ROLE_WORLD_REALISM_VISION.md`](./CIVICATION_ROLE_WORLD_REALISM_VISION.md) — produkt- og kvalitetsmålet: hvordan roller skal gå fra gode sosiale serier til troverdige yrkes- og samfunnsverdener med vedvarende saker, institusjoner, arbeidsrytme, kompetanse, arbeidsvilkår, profesjonskultur, situert omdømme og sterkere History Go-kobling.
2. [`CIVICATION_ROLE_WORLD_REALISM_IMPLEMENTATION_PLAN.md`](./CIVICATION_ROLE_WORLD_REALISM_IMPLEMENTATION_PLAN.md) — konkret implementasjonsrekkefølge på data-, runtime-, Scene Pipeline-, task-, People-, state- og testnivå.

## Viktige eksisterende grenser

Videreutviklingen skal bygge på, ikke erstatte:

- [`../CIVICATION_ROLE_WORLD_STANDARD.md`](../CIVICATION_ROLE_WORLD_STANDARD.md)
- [`../CIVICATION_ROLE_WORLD_AUTHORING_GUIDE.md`](../CIVICATION_ROLE_WORLD_AUTHORING_GUIDE.md)
- [`../CIVICATION_SCENARIO_PEOPLE.md`](../CIVICATION_SCENARIO_PEOPLE.md)
- [`../CIVICATION_HISTORY_GO_TASK_SCHEMA.md`](../CIVICATION_HISTORY_GO_TASK_SCHEMA.md)
- [`../CIVICATION_HISTORY_GO_COMPLETION_BRIDGE.md`](../CIVICATION_HISTORY_GO_COMPLETION_BRIDGE.md)
- [`../../data/Civication/SCENE_PIPELINE_V1.md`](../../data/Civication/SCENE_PIPELINE_V1.md)

Grunnregelen er fortsatt: **reuse before rewrite**. Ingen ny parallell Scene Pipeline, ingen generisk innholdsfylling og ingen påstand om implementert funksjonalitet før kode, data og permanente tester faktisk beviser den.
