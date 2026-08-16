# Civication Compiled Scene Registry v1

## Status

4H-A etablerer kontrakten og den deterministiske compileren for `compiled_scene_registry_v1`.

Dette trinnet **bytter ikke runtime-leseren**. `CivicationSceneCatalog` leser fortsatt dagens `mailFamilies` til 4H-B har bevist full runtime-paritet. `compiled_registry_ready` skal derfor fortsatt være `false` i produksjonsruntime etter 4H-A.

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

## 4H-B — neste port

4H-B skal materialisere registryet og gjøre SceneCatalog til leser av dette artefaktet for arbeidskatalogen. Cutoveren skal være låst av parity-test før rå `mailFamilies`-lesing fjernes fra runtime.

Minstekrav før cutover:

1. samme scene-ID-er per rolle;
2. samme mailtype/familie og source-path;
3. samme valg, choice tags, effect, feedback og reply;
4. samme priority/cooldown/repeatable/phase/stage og øvrige eligibility-felt;
5. samme thread-dedupe;
6. samme Career Knowledge Bridge-dekorering;
7. samme deterministiske utvalg i SceneDirector/Daily;
8. terminal karriere åpner ikke fallback;
9. representative Renholder- og Arealplanlegger-arbeidsdager har identisk kandidatsett før/etter;
10. `shadowed_duplicate_count === 0` før `compiled_registry_ready` kan bli `true`.

Først når disse er grønne kan `CivicationSceneCatalog.inspect().compiled_registry_ready` settes til `true`.

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
