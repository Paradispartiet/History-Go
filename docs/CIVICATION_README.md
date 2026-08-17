# Civication — dokumentasjonsinngang

Status: **operational dokumentasjonsinngang**  
Sist kontrollert: **2026-08-18**

Civication er ett subsystem for arbeid, hverdagsliv, sosial posisjon, levevei og konsekvenser. Denne filen peker til dokumentene som faktisk eier hvert ansvarsområde; den skal ikke opprette parallelle sannheter.

## Start her

1. [`CIVICATION_ROLE_WORLD_STANDARD.md`](./CIVICATION_ROLE_WORLD_STANDARD.md) — canonical redaksjonell standard for «rollen som liten sosial serie» og `role_world_complete`.
2. [`../data/Civication/SCENE_PIPELINE_V1.md`](../data/Civication/SCENE_PIPELINE_V1.md) — canonical runtimekjede etter fullført 4H-D.
3. [`../js/Civication/README.md`](../js/Civication/README.md) — motoroversikt, shell/dagflyt og dagens eiergrenser.
4. [`CIVICATION_CAREER_GAMEPLAY_CONTRACT.md`](./CIVICATION_CAREER_GAMEPLAY_CONTRACT.md) — de 15 career-komponentene og teknisk `reference_complete`.
5. [`CIVICATION_WORK_GRAMMAR_STANDARD.md`](./CIVICATION_WORK_GRAMMAR_STANDARD.md) — normativ FWG/work grammar-standard.
6. [`civication-life-story-system.md`](./civication-life-story-system.md) — Life Story / Min dag.

## To completion-begreper som ikke må blandes

`reference_complete` og `role_world_complete` betyr forskjellige ting.

- `reference_complete` kommer fra Career Gameplay Matrix og beviser den eksisterende jobbløkken: 15 komponenter, Life Story, praksisdybde og to uker.
- `role_world_complete` er den strengere sosiale serie-statusen: 14 dager × fire faser, sosial/NPC-bibel, utviklede relasjonelle tråder, privat etterklang, forsinkede konsekvenser og materialisering gjennom Scene Pipeline.

En rolle kan derfor være teknisk `reference_complete` uten å være en fylt rolleverden.

## Role World og redaksjonelt råmateriale

- [`CIVICATION_ROLE_WORLD_STANDARD.md`](./CIVICATION_ROLE_WORLD_STANDARD.md) — normativ kvalitets- og completionkontrakt.
- [`../data/Civication/roleWorldPolicy.json`](../data/Civication/roleWorldPolicy.json) — maskinlesbar policy.
- [`../data/Civication/roleWorldV1.schema.json`](../data/Civication/roleWorldV1.schema.json) — schema for Role World-filer.
- [`../data/Civication/roleWorldThemeBank.json`](../data/Civication/roleWorldThemeBank.json) — abstrakt Film/Story Theme Bank, kun redaksjonell.
- [`../data/Civication/roleWorlds/index.json`](../data/Civication/roleWorlds/index.json) — canonical Role World-status. Ingen rolle er forhåndsmerket komplett.

Theme Bank kan inspirere sosiologiske konflikter, men skal aldri kopiere filmplot, karakterer, dialog eller konkrete scener. Tema-ID-er er ikke gameplay-state.

## Scene Pipeline

4H-D er fullført. Aktiv kjede:

```text
authored sources
→ civication_scene_v1
→ compiledSceneRegistryV1
→ SceneCatalog
→ SceneDirector
→ NextAction/delivery
→ ChoiceDirector
→ EventEngine/consequences
```

Mail er én delivery og et authored kildeformat. Rå `mailFamilies`, `jobbmails`, RoleStoryletBridge og generiske career-mails er ikke parallelle runtimefallbacks.

## Roller og jobbinnhold

- [`CIVICATION_ROLE_PACK.md`](./CIVICATION_ROLE_PACK.md) — rollepakkeinngang og dedup-grense.
- [`CIVICATION_ROLE_PACK_STANDARD.md`](./CIVICATION_ROLE_PACK_STANDARD.md) — detaljert role-pack-kontrakt.
- [`CIVICATION_ROLE_PACK_INDEX.md`](./CIVICATION_ROLE_PACK_INDEX.md) — generert role-pack-status.
- [`CIVICATION_WORK_GRAMMAR_STANDARD.md`](./CIVICATION_WORK_GRAMMAR_STANDARD.md) — arbeidsgrammatikk.
- [`CIVICATION_FWG_GOVERNANCE.md`](./CIVICATION_FWG_GOVERNANCE.md) — generert FWG-governance-audit.
- [`../data/Civication/README-mailsystem-og-rolemodels.md`](../data/Civication/README-mailsystem-og-rolemodels.md) — authoring-guide for roleModel/FWG/mailPlan/mailFamilies etter Scene Pipeline-cutover.

## Mail og tråder

Maildokumentene beskriver **delivery/source-format**, ikke en egen gameplaymotor:

- [`CIVICATION_MAIL_PURPOSE.md`](./CIVICATION_MAIL_PURPOSE.md)
- [`CIVICATION_MAIL_SCHEMA.md`](./CIVICATION_MAIL_SCHEMA.md)
- [`CIVICATION_MAIL_STANDARD.md`](./CIVICATION_MAIL_STANDARD.md)
- [`CIVICATION_THREAD_STANDARD.md`](./CIVICATION_THREAD_STANDARD.md)

En lokal `Re:`-thread i mailformatet er ikke det samme som en Role World-primary thread. Den siste kan utvikle seg over 5–10 beats/scener på tvers av flere dager og deliveries.

## Debatt og History Go

- [`CIVICATION_DEBATE_SYSTEM.md`](./CIVICATION_DEBATE_SYSTEM.md) — Civications konfrontasjonsmotor.
- [`CIVICATION_HISTORY_GO_DEBATE_SURFACE.md`](./CIVICATION_HISTORY_GO_DEBATE_SURFACE.md) — History GO-signaler og stedlige debatter.

## Levevei

Levevei er allerede et eget implementert lag gjennom `CivicationLivelihoods` og opportunity-kjeden. Role World skal koble authored scener og konsekvenser til dette laget når relevant; det skal ikke bygges en ny livelihood-/økonomimotor.

## Audits og statusdokumenter

Filer med `AUDIT`, `REVIEW`, `STATUS` eller datostempel er snapshots med mindre de uttrykkelig er normative kontrakter. Genererte statusflater skal ikke overstyre policy/schema/runtime.

Historiske migreringsbeskrivelser for Scene Pipeline 4A–4H-D hører nå hjemme i PR-/Git-historikken. Aktive fasitfiler beskriver dagens eiergrenser.

## Overordnet prioritet

Ved konflikt gjelder:

1. [`HISTORY_GO_TECHNICAL_ARCHITECTURE.md`](./HISTORY_GO_TECHNICAL_ARCHITECTURE.md)
2. [`../README/SYSTEM_REGISTRY.md`](../README/SYSTEM_REGISTRY.md)
3. [`../README/SYSTEM_REGISTRY_SUBSYSTEM_CONTRACTS.md`](../README/SYSTEM_REGISTRY_SUBSYSTEM_CONTRACTS.md)
4. [`../data/Civication/scenePipelinePolicyV1.json`](../data/Civication/scenePipelinePolicyV1.json)
5. [`../data/Civication/SCENE_PIPELINE_V1.md`](../data/Civication/SCENE_PIPELINE_V1.md)
6. [`CIVICATION_ROLE_WORLD_STANDARD.md`](./CIVICATION_ROLE_WORLD_STANDARD.md) for redaksjonell Role World-completion
7. spesifikke role/FWG/mail/life-kontrakter
8. genererte audits og historiske snapshots

## Neste reelle produksjonssteg

Første fullstendige Role World skal være `naeringsliv/ekspeditor`. Den skal gjenbruke eksisterende Ekspeditør-innhold og materialisere 14-dagers sosial dramaturgi gjennom den eksisterende Scene Pipeline. Ingen ny runtime skal bygges.
