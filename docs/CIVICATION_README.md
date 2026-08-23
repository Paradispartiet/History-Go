# Civication — dokumentasjonsinngang

Status: **operational dokumentasjonsinngang og canonical produksjonsretning**  
Sist kontrollert: **2026-08-22**

Civication er ett subsystem for arbeid, hverdagsliv, sosial posisjon, levevei og konsekvenser. Denne filen peker til dokumentene som faktisk eier hvert ansvarsområde; den skal ikke opprette parallelle sannheter.

Denne filen eier i tillegg **gjeldende produksjonsretning og rekkefølge** for Civication. Den erstatter ikke de normative kontraktene nedenfor: detaljregler eies fortsatt av riktig schema, policy, runtime- eller standardfil.

## Start her

1. [`CIVICATION_ROLE_WORLD_STANDARD.md`](./CIVICATION_ROLE_WORLD_STANDARD.md) — canonical redaksjonell standard for «rollen som liten sosial serie» og `role_world_complete`.
2. [`../data/Civication/SCENE_PIPELINE_V1.md`](../data/Civication/SCENE_PIPELINE_V1.md) — canonical runtimekjede etter fullført 4H-D.
3. [`../js/Civication/README.md`](../js/Civication/README.md) — motoroversikt, shell/dagflyt og dagens eiergrenser.
4. [`CIVICATION_CAREER_GAMEPLAY_CONTRACT.md`](./CIVICATION_CAREER_GAMEPLAY_CONTRACT.md) — de 15 career-komponentene og teknisk `reference_complete`.
5. [`CIVICATION_WORK_GRAMMAR_STANDARD.md`](./CIVICATION_WORK_GRAMMAR_STANDARD.md) — normativ FWG/work grammar-standard.
6. [`civication-life-story-system.md`](./civication-life-story-system.md) — Life Story / Min dag.
7. [`CIVICATION_HISTORY_GO_TASK_SCHEMA.md`](./CIVICATION_HISTORY_GO_TASK_SCHEMA.md) — canonical payloadgrense fra Civication til History Go.
8. [`CIVICATION_HISTORY_GO_COMPLETION_BRIDGE.md`](./CIVICATION_HISTORY_GO_COMPLETION_BRIDGE.md) — evidensbasert retur fra History Go til Civication.
9. [`CIVICATION_SCENARIO_PEOPLE.md`](./CIVICATION_SCENARIO_PEOPLE.md) — canonical People↔scenario-katalog, fit-semantikk og factuality/NPC-grense.

## Gjeldende produktretning

Civication skal være en **sammenhengende life/career-loop**, ikke en separat fri NPC-simulator.

Den overordnede flyten er:

```text
rolle / livssituasjon
→ scene, mail, konflikt eller arbeidsbehov
→ valg eller History Go-oppgave
→ sted / person / kunnskap / quiz / debatt i History Go
→ faktisk evidens registreres
→ tilbake til Civication
→ konsekvens for rolle, relasjon, kapital, levevei eller neste scene
→ neste dag / situasjon
```

Ansvarsgrensen er fast:

- **Civication skaper behovet, rollen, situasjonen, valget og konsekvensen.**
- **History Go er handlings- og kunnskapsrommet.** Besøk, quiz, People, lesing, debatt og annen faktisk læringsstate skal skje i History Go.
- **Completion må bevises av persistert History Go-state.** UI, toast eller deep-link kan aldri finne på at en oppgave er fullført.
- **Eksisterende motorer gjenbrukes.** Role World, Scene Pipeline, FWG, mail, Life Story, livelihood, People, Places og Fagverk skal kobles sammen; de skal ikke erstattes av en parallell motor.

## History Go som Civication-modus

Når Civication sender spilleren til History Go, skal History Go opptre som et lett companion-modus for den aktive oppgaven, ikke som en egen Civication-runtime.

Aktiv kontrakt:

- sesjonen bæres som Civication-kontekst inn i History Go,
- en liten guide/toast kan vise oppgaven og foreslå relevante steder eller kunnskapsmål,
- forslag skal komme fra faktisk task-, kategori-, emne-, place- og People-kontekst,
- spilleren skal alltid kunne gå tilbake til Civication,
- completion avgjøres av faktiske signaler som quiz/unlock, besøksstate, leselogger eller debattstate,
- retur til Civication reconciler åpne tasks mot persistert History Go-state.

Normative detaljer ligger i [`CIVICATION_HISTORY_GO_TASK_SCHEMA.md`](./CIVICATION_HISTORY_GO_TASK_SCHEMA.md) og [`CIVICATION_HISTORY_GO_COMPLETION_BRIDGE.md`](./CIVICATION_HISTORY_GO_COMPLETION_BRIDGE.md). Runtime-regresjon for companion-moduset ligger blant annet i `tests/civication-history-go-mode.test.js`.

## People i scenarioer

History Go People skal være førsteklasses, faktabaserte mål i Civication-scenarioer uten at virkelige personer gjøres til frie oppdiktede NPC-er.

[`CIVICATION_SCENARIO_PEOPLE.md`](./CIVICATION_SCENARIO_PEOPLE.md) eier denne koblingen. Hovedreglene er:

- alle canonicale roller kan resolve relevante eksisterende People,
- `direct`, `strong` og `contextual` skal skilles eksplisitt,
- automatikk kan aldri produsere `direct`,
- `strong` betyr scenariorelevans, ikke dokumentasjon av identisk historisk stilling,
- person→sted kopieres read-only fra People-canon og skal aldri oppfinnes,
- manglende canonicale teoretikere/forskere blir en eksplisitt verifiseringsarbeidsliste,
- virkelige historiske/offentlige personer kan være kunnskaps-, quiz-, place- og task-mål, men får ikke oppdiktet privat dialog, tanker, motiver eller fiktive relasjoner,
- fritt sosialt drama og løpende NPC-tråder skal bruke fiktive eller klart fiksjonaliserte karakterer.

`FACTUALITY_CONTRACT.md` gjelder alltid over scenario-completeness.

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
- [`../data/Civication/roleWorlds/index.json`](../data/Civication/roleWorlds/index.json) — canonical Role World-status.

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
- [`CIVICATION_HISTORY_GO_DEBATE_SURFACE.md`](./CIVICATION_HISTORY_GO_DEBATE_SURFACE.md) — History Go-signaler og stedlige debatter.
- [`CIVICATION_HISTORY_GO_TASK_SCHEMA.md`](./CIVICATION_HISTORY_GO_TASK_SCHEMA.md) — oppgavepayload fra Civication til History Go.
- [`CIVICATION_HISTORY_GO_COMPLETION_BRIDGE.md`](./CIVICATION_HISTORY_GO_COMPLETION_BRIDGE.md) — faktisk History Go-evidens tilbake til åpne Civication-tasks.

## Levevei

Levevei er allerede et eget implementert lag gjennom `CivicationLivelihoods` og opportunity-kjeden. Role World skal koble authored scener og konsekvenser til dette laget når relevant; det skal ikke bygges en ny livelihood-/økonomimotor.

## Aktiv produksjonsrekkefølge

Arbeid på Civication skal følge denne rekkefølgen med GitHub `main` som autoritativ baseline:

1. **Bevar én runtime.** Ikke bygg parallelle Scene-, mail-, task-, People-, livelihood- eller progression-motorer.
2. **Lukk datagrunnlaget.** Hold roleModels/FWG/role packs, People↔scenario-katalog, manifests, registre og genererte projections deterministiske og synkroniserte.
3. **Gjør career/life-loopene spillbare rolle for rolle.** Velg reelle canonicale hull fra ferske matriser; materialiser bare det som mangler. Ikke oppfinn arbeid, lønn, personer eller completion for å få grønne tall.
4. **Bruk History Go når oppgaven faktisk er kunnskap eller sted.** Task schema + companion-modus + completion bridge skal være standardveien; ikke lag lokale Civication-kopier av quiz, People eller Fagverk.
5. **Bygg sosial dybde gjennom Role World.** Når den tekniske rollepakken er spillbar, kan `role_world_complete` utvikles gjennom 14 dager × fire faser, primære tråder, relasjoner, privat etterklang og forsinkede konsekvenser.
6. **Verifiser før merge.** Permanent determinisme/invariant-test for genererte data, relevante runtime-/browser-/boot-tester og canonical TypeScript-port må være grønne på eksakt PR-head.
7. **Merge ferdige arbeidsenheter til `main`.** Neste arbeidsenhet velges først fra fersk post-merge-status; gamle samtaletall eller snapshots er ikke autoritative.

Denne rekkefølgen erstatter den gamle statiske formuleringen om at `naeringsliv/ekspeditor` var «neste reelle produksjonssteg».

## TypeScript og guard-strategi

Civication skal bruke **strict TypeScript som primær kodekontrakt** der typesystemet faktisk kan bevise korrekthet. Målet er færre overlappende guards, ikke flere.

- én canonical `tsc --noEmit`-port skal eie compile-time typeintegritet,
- eksplisitte domenetyper, discriminated unions og exhaustiveness brukes der state har ulike tilstander,
- `any` og parallelle ad-hoc typeguards skal reduseres,
- guards/tests beholdes når TypeScript ikke kan bevise runtimeforhold: boot, browser-integrasjon, localStorage/state-migrasjon, manifests/registre, genererte projections, People↔scenario-integritet og andre data-/runtimeinvarianter,
- en guard som bare dupliserer det TypeScript allerede beviser skal konsolideres eller fjernes fremfor å få flere lag rundt seg.

Den repo-overordnede TypeScript-policyen eies fortsatt av [`TYPESCRIPT_FIRST_POLICY.md`](./TYPESCRIPT_FIRST_POLICY.md) og [`HISTORY_GO_TECHNICAL_ARCHITECTURE.md`](./HISTORY_GO_TECHNICAL_ARCHITECTURE.md).

## Ting vi uttrykkelig ikke skal gjøre

- Ikke gjøre samtaletråder eller gamle audits autoritative over GitHub-state.
- Ikke opprette en ny Civication-runtime for et problem den eksisterende Scene Pipeline eller TaskEngine allerede eier.
- Ikke gjøre virkelige personer til frie fiktive NPC-er.
- Ikke oppfinne person→sted, profesjon, lønn, rollehistorie eller completion for å fylle matriser.
- Ikke duplisere History Go-quiz, People, Places eller Fagverk inne i Civication.
- Ikke markere `role_world_complete` bare fordi en rolle er `reference_complete`.
- Ikke la UI eie gameplay-sannhet eller task-completion.
- Ikke bygge nye guard-lag for compile-time egenskaper TypeScript allerede håndhever.

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
7. [`CIVICATION_HISTORY_GO_TASK_SCHEMA.md`](./CIVICATION_HISTORY_GO_TASK_SCHEMA.md), [`CIVICATION_HISTORY_GO_COMPLETION_BRIDGE.md`](./CIVICATION_HISTORY_GO_COMPLETION_BRIDGE.md) og [`CIVICATION_SCENARIO_PEOPLE.md`](./CIVICATION_SCENARIO_PEOPLE.md) for sine avgrensede ansvar
8. spesifikke role/FWG/mail/life-kontrakter
9. denne filens produksjonsrekkefølge
10. genererte audits og historiske snapshots

Ved konflikt mellom denne filens produksjonsplan og en høyere normativ kontrakt skal planen korrigeres; kontrakten skal ikke omgås.
