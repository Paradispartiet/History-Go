# Wonderkammer training expansion — batch 2B

Dato: 2026-07-28  
Kilde: `data/wonderkammer/training_expansion.json`  
Status: **partial migration; source file remains active with one deferred entry**

## Formål

Fortsette Wonderkammer → På stedet-migreringen ved å løse identitetsfeil og blandet trenings-/observasjonsinnhold entry-for-entry.

Batchen kopierer ikke legacy-kamre mekanisk. Hvert item er vurdert etter canonical place-identitet, fysisk egnethet, tilgangsantakelser og riktig onsite-kontrakt.

## Migrert og remappet

### `bislett` → `bislett_stadion`

Legacy-ID-en `bislett` beskriver stadion, ikke canonical by-record `bislett`.

Beslutning: **remapped** til `data/places/sport/europa/norway/oslo_sport/bislett_stadion.json`.

Migrert til `training_profile`:
- `wk_train_bislett_kort_loperunde` → `bislett_stadion_training_kort_runde`
- `wk_train_bislett_trapp_og_oppvarming` → `bislett_stadion_training_oppvarming`

Migrert til `tasks_profile`:
- `wk_train_bislett_idrettsblikk` → `bislett_stadion_task_idrettsblikk`

Sikkerhetsgrep:
- trening legges på offentlige fortau/ganglinjer rundt stadion
- ingen påstand om adgang til løpebane, tribuner eller stadioninteriør
- trapp brukes bare hvis den er offentlig tilgjengelig, trygg og ledig; ellers brukes flat oppvarmingsflate

Canonical by-record `bislett` er urørt.

### `holmenkollen` → `holmenkollen_nasjonalanlegg`

Legacy-ID-en `holmenkollen` er stale. Dagens canonical record er:

`data/places/sport/europa/norway/oslo_sport/holmenkollen_nasjonalanlegg.json`

Beslutning: **remapped → training_profile**.

Migrert:
- `wk_train_holmenkollen_trappegange` → `holmenkollen_nasjonalanlegg_training_trapp_eller_stigning`
- `wk_train_holmenkollen_bakkedrag` → `holmenkollen_nasjonalanlegg_training_bakkedrag`
- `wk_train_holmenkollen_vinterbevegelse` → `holmenkollen_nasjonalanlegg_training_vintergang`

Sikkerhetsgrep:
- bare åpne offentlige ganglinjer/trapper/utearealer
- ingen påstand om adgang til tribuner, konkurranseløyper eller stadioninteriør
- vinteraktivitet krever trygt føre og tydelig åpen ferdselslinje

### `valle_hovin` → `intility_arena`

Legacy-kammeret sier eksplisitt at «Intility Arena viser hvordan fotball, bydel, klubbidentitet og fysisk aktivitet kan samles i ett sted».

Audit av dagens canonical records viser at:
- `intility_arena` er Vålerengas fotballstadion og klubbground
- `valle_hovin_stadion` er kunstisbane for skøyter/bandy

Beslutning: **remapped** til `data/places/sport/europa/norway/oslo_sport/intility_arena.json` for de to stedlesings-itemene.

Migrert til `tasks_profile`:
- `wk_train_valle_hovin_supporterspor` → `intility_arena_task_supporterspor`
- `wk_train_valle_hovin_stadion_som_byrom` → `intility_arena_task_stadion_som_byrom`

Rejected / not migrated:
- `wk_train_valle_hovin_driblelinje`

Begrunnelse: Legacy-teksten angir ingen dokumentert offentlig og trygg ballflate. Vi skal ikke gjøre et stadionområde til treningsplass bare fordi en balløvelse er mulig i teorien.

`valle_hovin_stadion` er urørt.

### `ullevaal_stadion`

Entryen blander balltrening, publikumslogistikk og symbolsk landslagsinnhold.

Beslutning: **split by item**.

Migrert til `tasks_profile`:
- `wk_train_ullevaal_stadion_publikum_og_innganger` → `ullevaal_stadion_task_publikum_og_innganger`
- `wk_train_ullevaal_stadion_landslagsarena` → `ullevaal_stadion_task_landslagsarena`

Rejected / not migrated:
- `wk_train_ullevaal_stadion_pasningslek`

Begrunnelse: Canonical stadion-record dokumenterer arenaen, men ikke en offentlig og trygg balltreningsflate utenfor stadion. Ingen adgang til bane/interiør antas.

### `ekebergparken`

Dagens canonical place-fil er:

`data/places/kunst/oslo/places_kunst/ekebergparken.json`

Canonical beskriver en offentlig skulpturpark med kupert landskap, etablerte stier og offentlig tilgjengelig parkrom.

Beslutning: **migrate_to_actions → training_profile**.

Migrert:
- `wk_train_ekebergparken_bakkesloyfe` → `ekebergparken_training_bakkesloyfe`
- `wk_train_ekebergparken_skogbalanse` → `ekebergparken_training_skogbalanse`

Sikkerhetsgrep:
- aktiviteten holdes på etablerte stier
- ingen kunstverk brukes som treningsapparat
- ingen avstikkere for å oppsøke røtter, skrenter eller vanskeligere terreng
- tempo tilpasses underlag og føre

## Deferred

### `sognsvann`

Status: **deferred_large_geometry_profile_consolidation**.

Canonical place finnes i:

`data/places/natur/oslo/sognsvann.json`

Recorden har allerede:
- `activity_profile.training_types`: gåtur, jogging, intervall, bading, ski, mobilitet
- `activity_profile.wonderkammer_focus`: vannrunde, skogsstier, intervall, rolig restitusjon
- full polygongeometri for innsjøen

Legacy-itemene er semantisk overlappende med den eksisterende `activity_profile` og bør konsolideres samlet til/med `training_profile`, ikke legges oppå som en parallell duplikatprofil.

Denne arbeidsruntime-en kan lese repoet gjennom GitHub-connectoren, men lokal `git` kan ikke nå `github.com`, og connectorens `update_file` erstatter hele filen i stedet for å patch-e ett felt. Det er derfor ikke forsvarlig å helfilserstatte en stor geometrifil bare for å endre profilblokken.

Beslutning: behold Sognsvann-entryen i legacy-kilden til en trygg felt-/lokal patchmekanisme er tilgjengelig. Geometrien skal ikke forenkles eller regenereres.

## Legacy-kilde etter batch 2B

`data/wonderkammer/training_expansion.json` reduseres fra seks til én place-entry.

Fjernet etter migrering/remap/reject med dokumentert beslutning:
- `holmenkollen`
- `ullevaal_stadion`
- `valle_hovin`
- `bislett`
- `ekebergparken`

Beholdt eksplisitt:
- `sognsvann`

## Beslutningsoversikt

### migrated
- Bislett: 2 training + 1 task
- Holmenkollen: 3 training
- Ullevaal: 2 tasks
- Intility Arena: 2 tasks
- Ekebergparken: 2 training

### remapped
- `bislett` → `bislett_stadion`
- `holmenkollen` → `holmenkollen_nasjonalanlegg`
- `valle_hovin` → `intility_arena` for legacy-itemene som faktisk beskriver Vålerengas fotballstadion

### duplicate / not migrated
- ingen nye duplikater identifisert i denne delbatchen

### rejected
- `wk_train_valle_hovin_driblelinje` — ingen dokumentert trygg/offentlig ballflate
- `wk_train_ullevaal_stadion_pasningslek` — ingen dokumentert trygg/offentlig ballflate eller stadionadgang

### deferred
- `sognsvann` — konsolider `activity_profile`/`training_profile` med trygg patch uten å berøre geometrien

## Resultat

- place-entries før batch: 6
- fullt behandlet og fjernet fra legacy: 5
- migrerte canonical onsite-items: 11
- rejected med eksplisitt begrunnelse: 2
- deferred med eksplisitt begrunnelse: 1 place-entry / 3 legacy-items
- slettet uten canonical migrering eller dokumentert beslutning: 0
- `training_expansion.json` fortsatt aktiv: ja, kun for `sognsvann`
