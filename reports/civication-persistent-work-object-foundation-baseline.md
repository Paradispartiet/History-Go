# Civication Persistent Work Object Foundation — baseline

Dato: 2026-08-23  
Status: foundation-baseline for første additive work-world capability

## Formål

Denne baseline-auditen avgrenser hvorfor Civication trenger et lite, eksplisitt state-lag for vedvarende arbeidsobjekter, og hva laget **ikke** skal eie.

Målet er å kunne representere at en spiller møter den samme saken, leveransen, artikkelen, plansaken, avviket eller et annet faglig arbeidsobjekt igjen senere, med deterministisk identitet og historikk, uten å opprette en ny scene-, dag- eller karrieremotor.

## Eksisterende mekanismer og avgrensning

### `effects.state_set`

Canonical scene-effects støtter i dag et flatt sett av primitive verdier (`string`, `number`, `boolean`, `null`). Dette er nyttig for små, styrte signaler, men er ikke en egnet eier for et strukturert arbeidsobjekt med identitet, status, involverte, referanser og append-only historikk.

Konklusjon: behold `state_set` til små primitive signaler; ikke bruk fri nested state som skjult work-object database.

### Flags

Civication bruker flags flere steder for narrativ hukommelse, branch-bias og konsekvenser. Flags uttrykker at noe har skjedd eller gjelder, men de har ikke egen objektidentitet, fase, rolle-eierskap eller livsløp.

Konklusjon: flags kan fortsatt være avledede/komplementære signaler, men kan ikke alene bevise «samme sak».

### Thread-state

Mail-, story-, conflict- og narrative-tråder holder rekkefølge og dramaturgisk progresjon. De er riktig eier for relasjonell/narrativ sekvensering, men de modellerer ikke et generelt faglig arbeidsobjekt med egen tilstand og indeks på tvers av scener.

Konklusjon: thread IDs og work-object IDs er forskjellige begreper. En tråd kan referere til et arbeidsobjekt, men skal ikke være arbeidsobjektets database.

### Task results

`CivicationTaskEngine` lagrer oppgaver og completion-evidence, inkludert History Go-oppgaver. Dette beviser at en konkret oppgave er gjort, men beskriver ikke livsløpet til saken oppgaven inngår i.

Konklusjon: en task kan senere påvirke/åpne handlinger på et arbeidsobjekt, men task-state er ikke work-object state.

### Mail-/scenehistorikk

Eksisterende mail- og scenehistorikk dokumenterer leverte/besvarte hendelser. Det er interaksjonshistorikk, ikke domeneobjektets normaliserte nåtilstand.

Konklusjon: work-object history skal bare lagre viktige objekt-overganger og referanser til scene/valg; den skal ikke kopiere full scenehistorikk.

### `trigger_scene_ids`

Scene-effects kan trigge andre scener. Det gir deterministisk sekvensering, men ingen vedvarende identitet eller state for saken som binder scenene sammen.

Konklusjon: scene-triggering og arbeidsobjekthukommelse er komplementære, ikke alternative mekanismer.

## Nytt minimumslag

Foundation innfører bare:

- `CivicationState.work_world` som additiv state;
- schema `civication_work_world_state_v1`;
- work objects med stabil `work_object_id`;
- deterministiske indekser for aktive objekter, rolleobjekter og eksplisitt delte objekter;
- append-only, deduplisert historikk for viktige state-overganger;
- en liten state-adapter med create/upsert/transition/flag/note/close/read/list/resolve-funksjoner;
- kompatibilitet med gamle saves uten `work_world`.

## Ikke del av denne foundation-PR-en

Følgende utsettes eksplisitt til separate capability-slices:

1. ingen endring av `civication_scene_v1` ennå;
2. ingen `work_context` i compiled scene registry ennå;
3. ingen `effects.work_object_ops` i scene-compiler ennå;
4. ingen ChoiceDirector-/dayConsequences-handler ennå;
5. ingen scene-selection basert på work-object state ennå;
6. ingen UI for saker/arbeidsobjekter ennå;
7. ingen Role World completion-status endres;
8. ingen konkret rolle, inkludert `historie/historie_arkiv_og_dokumentasjon`, materialiseres mot work-world-laget ennå.

Denne rekkefølgen gjør at state-modellen kan bevises isolert før den kobles til canonical Scene Pipeline.

## Runtime-eierskap

`CivicationState` forblir persistenseier. `CivicationWorkWorld` er en avgrenset state-adapter og ikke en motor:

```text
CivicationState
  └── work_world
       ├── objects_by_id
       ├── active_object_ids
       ├── role_object_ids
       └── shared_object_ids
```

En senere Scene Pipeline-slice skal bruke denne adapteren gjennom den eksisterende answer/effect-kjeden. Den skal ikke opprette `RoleWorldEngine`, `WorkObjectSceneEngine` eller et nytt sceneformat.

## Identitet og idempotens

Alle viktige work-object mutations skal ha en stabil `event_id`. Hvis samme mutation blir replayet etter reload eller gjentatt delivery, skal samme event ikke legges til historikken på nytt.

`kind` og `role_scope` er immutable etter opprettelse. Status og fase endres gjennom eksplisitt transition, ikke via fri upsert.

## Exit-bevis for foundation

Den permanente testen skal bevise at:

1. et gammelt save uten `work_world` kan leses uten migrasjonsfeil;
2. scene A kan opprette ett arbeidsobjekt;
3. en mellomliggende scene kan skje uten å endre objektet;
4. scene B kan resolve nøyaktig samme objekt-ID og lese tidligere state;
5. et spillerlignende valg kan transitionere objektet;
6. replay av samme event er idempotent;
7. ny adapter-instans over samme serialiserte save ser samme objekt og historikk;
8. lukking fjerner objektet fra `active_object_ids`, men ikke fra rolleindeksen;
9. unrelated Civication-state bevares;
10. korrupte/legacy work-world-fragmenter normaliseres fail-closed i stedet for å krasje.

Når dette er grønt, er neste naturlige slice å koble `work_context` og strengt validerte `work_object_ops` inn i canonical scene schema/compiler og ChoiceDirector-kjeden.
