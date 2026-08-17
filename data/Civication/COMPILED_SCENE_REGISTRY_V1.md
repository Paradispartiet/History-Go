# Civication Compiled Scene Registry v1

## Status

4H-A etablerte kontrakten og den deterministiske compileren for `compiled_scene_registry_v1`. **4H-B er nå runtime-cutoveren:** det materialiserte `data/Civication/compiledSceneRegistryV1.json` er den statiske work-scene-kilden som `CivicationSceneCatalog` leser i runtime.

`mailFamilies` er fortsatt source-of-build i denne fasen, men kan ikke leses direkte av normal work-runtime. `node scripts/build-civication-scene-registry.mjs --check` er permanent sync-gate, parity-testen låser før/etter-semantikken, og `compiled_registry_ready` er `true` først etter at shadowed duplicate-gjelden er null.

Normative filer:

- `data/Civication/compiledSceneRegistryV1.schema.json`
- `data/Civication/sceneContractV1.schema.json`
- `data/Civication/scenePipelinePolicyV1.json`
- `scripts/build-civication-scene-registry.mjs`
- `tests/civication-compiled-scene-registry.test.js`

## Hvorfor registryet bygges før cutover

Dagens SceneCatalog har allerede ett runtime-eierskap, men arbeidskildene ligger fortsatt i mange `mailFamilies`-filer. En direkte cutover til en ny, strengt canonical modell ville risikere å miste felt som eksisterende gameplay faktisk bruker, blant annet valg-tags, prioritet, cooldown, repeatability og andre legacyfelt som ennå ikke finnes i `civication_scene_v1`.

4H-A løser dette uten å lage to sannhetskilder:

```text
mailFamilies (kilde)
      |
      v
build-civication-scene-registry.mjs
      |
      v
compiled_scene_registry_v1
  |- scene: civication_scene_v1
  `- compatibility_projection: generert runtime-projeksjon
```

`compatibility_projection` er **ikke håndskrevet innhold** og skal aldri redigeres som en egen datakilde. Den genereres deterministisk fra samme source mail som den canonicale scenen. Den finnes bare for å gjøre 4H-B mulig uten gameplayendring. Når runtimeforbrukerne ikke lenger trenger legacyfeltene, skal projeksjonen krympes eller fjernes i en senere kontraktversjon.

## Determinisme

Compileren:

- traverserer `data/Civication/mailFamilies` i stabil rekkefølge;
- speiler SceneCatalogs faktiske runtime-rekkefølge: intro → job → navngitte ekstratyper;
- bevarer eksisterende scene-ID;
- lager stabil rolleindeks;
- mapper eksisterende valg til canonical `effects.score_delta` uten å dikte nye valg;
- bevarer dagens runtimefelt i den genererte compatibility-projeksjonen;
- legger på build-provenance og SHA-256 per source mail;
- lager ett `registry_hash` uten klokketidsfelt;
- inventerer gamle `data/Civication/jobbmails` som eksplisitt migreringsgjeld, men kompilerer dem **ikke** inn som konkurrerende kilde.

Compileren skiller mellom **fysisk filtilstedeværelse** og **runtime-reachability**. Den inventerer alle JSON-filer under `mailFamilies`, men kompilerer bare filstier som dagens `CivicationSceneCatalog.getFamilyPaths()` faktisk kan laste: canonical `role_scope_job`, `role_scope_intro_v2` og de navngitte ekstratypene. Overgangs- eller arkivfiler utenfor disse mønstrene legges i `ignored_source_files`; de blir ikke nye runtimekilder bare fordi de ligger i katalogtreet. Slike kollisjoner skal aldri «løses» ved å gi canonical gameplay nye ID-er; reachability-grensen skal speile faktisk runtime og gjelden skal forbli synlig i inventory.

### Shadowed duplicate IDs

4H-A avdekket også en viktig forskjell mellom «unik kilde-ID» og dagens faktiske runtime: samme scene-ID kan finnes i mer enn én **runtime-reachable** katalog. SceneCatalog laster disse katalogene i en fast rekkefølge og JavaScripts stabile kandidatsortering gjør at en tidligere kilde beholder forrang når type, familie og score/routing er identisk.

Compileren får ikke skjule dette ved å finne på nye ID-er. Reglene er derfor:

1. Første runtime-reachable kilde i SceneCatalog-rekkefølgen er den midlertidige eieren.
2. En senere duplicate kan bare registreres i `shadowed_duplicates` når den har samme routing-signatur som den første. Signaturen låser blant annet mailtype, familie, prioritet, fase, stage, cooldown, repeatability, thread-routing og eligibility-felt.
3. Hvis routing-signaturen er forskjellig, feiler compileren. Da finnes det ikke én sikker canonical scene uten en eksplisitt datamigrering.
4. `shadowed_duplicates` er **gjeld, ikke tillatt sluttarkitektur**. 4H-B kan ikke slå runtime over på registryet før telleren er null.

Dette gjør 4H-A i stand til å beskrive dagens deterministiske runtime uten å late som duplikatproblemet er løst. Selve skyggekopiene ryddes i neste cutover-port, med parity-test som beviser at den faktiske vinnerscenen og gameplayet er uendret.

Kjøring uten flagg validerer og rapporterer in-memory-registry. `--write` materialiserer standardfilen `data/Civication/compiledSceneRegistryV1.json`. `--check` blir den senere sync-gaten når 4H-B faktisk committer den genererte artefakten.

## Dynamic source adapters

`private`, `life`, `narrative` og `social` er allerede flyttet bak SceneCatalog i 4G. De er state-/faseavhengige produsenter og registreres derfor i 4H-A som `runtime_materialized_sources`, ikke som ferdigvalgte statiske scener.

Dette er fortsatt ett eierlag:

```text
compiled registry beskriver kildene og de statiske arbeidsscenene
                    |
             SceneCatalog
                    |
        runtime-materialisering der state kreves
```

Ingen ny side-registry eller alternativ SceneDirector introduseres.

## Canonical mapping i 4H-A

Mail-family-scener kompileres til `civication_scene_v1` med:

- `domain = work`
- `delivery = mail`
- `scene_kind` fra eksisterende mailtype
- `interaction_mode` fra eksplisitt kontrakt, task-contract eller antall reelle kildevalg
- eksisterende ID som canonical scene-ID
- stabil `thread_id`
- canonical `content`
- canonical choice-effekter
- `knowledge_contract` når kilden allerede har en gyldig pinning; ellers `mode = none`
- provenance med `adapter = mail_family` og `compiled_at_build = true`

Det er bevisst **ingen** syntetiske valg eller ny gameplaylogikk i compileren.

## 4H-B — fullført runtime-cutover

4H-B materialiserer og committer registryet, håndhever `--check`, og gjør `CivicationSceneCatalog` til runtime-leser av registryet for work-scenes. Den ene runtime-reachable skyggekopien av `ml_faction_001` er fjernet; den eksisterende vinnerscenen i `naeringsliv/job/mellomleder_job.json` er uendret. `shadowed_duplicate_count` er derfor null før cutover.

Den permanente parity-porten beviser hele runtime-projeksjonen før/etter, inkludert scene-ID-er per rolle, mailtype/familie/source-path, choices/tags/effect/feedback/reply, priority/cooldown/repeatable/phase/stage og øvrige eligibility-felt, thread/dedupe, Career Knowledge Bridge, kandidatsett og deterministisk utvalg. Renholder og Arealplanlegger brukes som representative arbeidsdager. Terminal karriere forblir lukket.

`private`, `life`, `narrative` og `social` forblir runtime-materialiserte source adapters bak samme SceneCatalog. De flates ikke inn i det statiske registryet.

## 4H-C — fjern parallelle legacyveier

Etter registry-cutoveren skal runtime ikke lese `data/Civication/jobbmails` som en alternativ gameplaykilde. Gamle filer kan beholdes midlertidig som arkiv/migreringsgrunnlag hvis nødvendig, men de skal ikke kunne åpne gameplay når canonical registry har en lukket eller tom kandidatpakke.

## 4H-D — blokkerende semantisk gate

Når compiled registry er eneste scene-eier og dagsbudsjettet er migrert, kan den globale Scene Pipeline-gaten gå fra observasjon til blokkering:

```text
plansteg
→ scene
→ decision / task / ack / info
→ konsekvens
→ progresjon
→ neste steg
```

Dette er sluttbeviset på at konsolideringen har fjernet konkurrerende pipelines uten å flate ut gameplayet.
