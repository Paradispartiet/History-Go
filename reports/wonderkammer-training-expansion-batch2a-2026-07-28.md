# Wonderkammer training expansion — batch 2A

Dato: 2026-07-28  
Kilde: `data/wonderkammer/training_expansion.json`  
Status: **partial migration; source file remains active with six deferred entries**

## Formål

Følge opp batch 1 ved å migrere entydige treningsentries fra aktivitets-Wonderkammer til canonical `training_profile` under **På stedet → Gjør på stedet**.

Denne delbatchen er bevisst konservativ: vi skriver bare til canonical place-filer der både ID, filbane og fysisk sted er entydige og håndterbare gjennom connector-workflowen.

## Migrert i batch 2A

### `st_hanshaugen_park`

Legacy:
- `wk_train_st_hanshaugen_park_bakker_og_stier`
- `wk_train_st_hanshaugen_bakkedrag`
- `wk_train_st_hanshaugen_stirunde`
- `wk_train_st_hanshaugen_rolig_uttoying`

Beslutning: **migrate_to_actions → training_profile**.

Canonical resultat:
- `st_hanshaugen_training_bakkedrag`
- `st_hanshaugen_training_stirunde`
- `st_hanshaugen_training_bevegelighet`

Profilen bruker etablerte stier, åpne partier og kontrollert intensitet. Den presiserer hensyn til andre parkbrukere og underlag.

### `akerselva`

Legacy:
- `wk_train_akerselva_elvelop_og_gange`
- `wk_train_akerselva_bro_til_bro`
- `wk_train_akerselva_trapp_og_bakke`
- `wk_train_akerselva_restitusjonsgange`

Beslutning: **migrate_to_actions → training_profile**.

Canonical resultat:
- `akerselva_training_bro_til_bro`
- `akerselva_training_bakke`
- `akerselva_training_rolig_gange`

Profilen holder aktiviteten på etablerte turveier og trygge trapper/bakker og legger eksplisitt inn avstand til vannkant og glatte partier.

### `vigelandsparken`

Legacy:
- `wk_train_vigelandsparken_plener_og_akser`
- `wk_train_vigelandsparken_aksejogg`
- `wk_train_vigelandsparken_plenstyrke`

Beslutning: **migrate_to_actions → training_profile**.

Canonical resultat:
- `vigelandsparken_training_aksejogg`
- `vigelandsparken_training_plenstyrke`

Profilen bruker etablerte ganglinjer og rolige plenpartier. Skulpturene er omgivelser, ikke treningsapparater, og profilen krever god avstand til kunstverk og andre besøkende.

## Utsatt fra batch 2A

Følgende entries beholdes i `training_expansion.json` og er ikke slettet:

### `sognsvann`

Status: **deferred_large_canonical_file**.

Canonical `sognsvann` finnes og har allerede et eldre `activity_profile` med treningstyper og Wonderkammer-fokus. Place-filen inneholder en stor fullgeometri. Lokal git er utilgjengelig i dette arbeidsmiljøet (`Could not resolve host: github.com`), og connector-basert fullfilserstatning av en flere tusen linjer lang geometrifil er ikke en forsvarlig migreringsmetode.

Neste steg er å migrere `activity_profile`/legacy-training samlet når filen kan patches lokalt eller med en trygg strukturert patchmekanisme.

### `holmenkollen`

Status: **deferred_stale_place_id**.

Repoets tidligere ID-audit dokumenterer `holmenkollen` som stale ID etter omdøping til canonical `_nasjonalanlegg`-ID. Entryen remappes ikke før korrekt canonical record og fysisk aktivitetsflate er kontrollert.

### `ullevaal_stadion`

Status: **deferred_mixed_content**.

Entryen blander faktisk balløvelse med observasjon av innganger og samtale om landslagsidentitet. Den skal splittes mellom trening og stedoppgaver/observasjon i stedet for å kopieres som én treningsprofil.

### `valle_hovin`

Status: **deferred_stale_place_id_and_mixed_content**.

Repoets tidligere ID-audit dokumenterer `valle_hovin` som stale ID etter omdøping til canonical stadion-ID. Entryen omtaler samtidig Intility Arena, dribling, supporterspor og stadion som byrom. Identitet og innhold må derfor splittes før migrering.

### `bislett`

Status: **deferred_identity_mismatch**.

Legacy-entryen heter `bislett`, men innholdet beskriver Bislett stadion. Repoets ID-audit dokumenterer at `bislett` var stale sport-ID etter omdøping til `bislett_stadion`, samtidig som det finnes en egen canonical by-record `bislett`. Ingen aktivitet flyttes til bydel/strøk-recorden.

### `ekebergparken`

Status: **deferred_canonical_file_resolution**.

Canonical ID finnes, men den tidligere kunst-aggregatefilen er ikke lenger gjeldende filbane. Entryen beholdes til dagens canonical place-fil er entydig lokalisert og kontrollert.

## Endring i legacy-kilden

`training_expansion.json` reduseres fra ni til seks place-entries.

Fjernet fordi de er migrert:
- `st_hanshaugen_park`
- `akerselva`
- `vigelandsparken`

Beholdt for eksplisitt senere behandling:
- `sognsvann`
- `holmenkollen`
- `ullevaal_stadion`
- `valle_hovin`
- `bislett`
- `ekebergparken`

## Resultat

- place-entries før batch: 9
- migrert til canonical `training_profile`: 3
- utsatt med eksplisitt begrunnelse: 6
- slettet uten canonical migrering eller dokumentert defer: 0
- `training_expansion.json` fortsatt aktiv: ja
