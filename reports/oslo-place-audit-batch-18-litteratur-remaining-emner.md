# Batch 18: Oslo litteratur — remaining `em_lit_*` emne_ids

Dato: 2026-05-29

## Kommandoer kjørt

- `npm run places:emner:check` før endring
- `rg -n "em_lit_" reports/oslo-place-audit-batch-12-current-missing-emne-ids.md reports/place-emne-missing-audit-batch-12.json reports/oslo-place-audit-batch-17-vitenskap-remaining-emner.md tools/check_place_emne_ids.mjs data/fag/litteratur data/places/litteratur/oslo/places_litteratur.json`
- `python`/`json`-lesing av `data/places/litteratur/oslo/places_litteratur.json` og `data/fag/litteratur/emner_litteratur_canonical_v4_5.json`
- `npm run places:emner:check` etter endring
- `npm run places:index:check`
- `npm run health:places`
- `git diff --name-only`

## Filer undersøkt

- `reports/oslo-place-audit-batch-12-current-missing-emne-ids.md`
- `reports/place-emne-missing-audit-batch-12.json`
- `reports/oslo-place-audit-batch-17-vitenskap-remaining-emner.md`
- `tools/check_place_emne_ids.mjs`
- `data/fag/litteratur/L.md`
- `data/fag/litteratur/SET_MAL_README_litteratur_v4_3.md`
- `data/fag/litteratur/emnemapping_litteratur_canonical_v4_5.json`
- `data/fag/litteratur/emner_litteratur_canonical_v4_5.json`
- `data/fag/litteratur/fagkart_litteratur_canonical_v4_5.json`
- `data/fag/litteratur/litteraturpensum_canonical_v4_5.json`
- `data/fag/litteratur/methods_litteratur_canonical_v4_5.json`
- `data/fag/litteratur/quiz_generator_rules_litteratur_v5_1_source_priority_patch.json`
- `data/fag/litteratur/supersetQUIZMAL_litteratur.json`
- `data/places/litteratur/oslo/places_litteratur.json` kun som kontekst

## Før batchen

`npm run places:emner:check` rapporterte 24 missing `emne_ids` totalt. Av disse var 5 forekomster `em_lit_*`, fordelt på 3 unike ID-er, alle i `data/places/litteratur/oslo/places_litteratur.json`.

| emne_id | forekomster | place-filer | eksempel-place-id-er | sannsynlig årsak |
| --- | ---: | --- | --- | --- |
| `em_lit_kanon_kritikk_og_offentlighet` | 2 | `data/places/litteratur/oslo/places_litteratur.json` | `nasjonalbiblioteket`, `litteraturhuset` | Fullverdig Oslo-relevant litteraturemne manglet som canonical ID; tett på eksisterende `em_lit_kanon_kritikk_symbolsk_makt`, men stedene peker på kanon/kritikk som offentlig arena. |
| `em_lit_adapsjon_tolkning_iscenesettelse` | 1 | `data/places/litteratur/oslo/places_litteratur.json` | `nationaltheatret` | Fullverdig litterært scene-/teksttolkningsemne manglet som canonical ID; ikke bare drama generelt, men tekst til scene/adapsjon. |
| `em_lit_lesning_formidling_offentlighet` | 2 | `data/places/litteratur/oslo/places_litteratur.json` | `litteraturhuset`, `tronsmo_bokhandel` | Fullverdig Oslo-relevant formidlings-/lesekulturemne manglet som canonical ID; nær eksisterende `em_lit_lesere_offentlighet_formidling`, men place-bruken handler om praksis og arena. |

## Søk i litteratur-fagdata

- Ingen av de tre missing ID-ene fantes som `emne_id` i en eksisterende canonical litteratur-emnefil før batchen.
- Ingen av de tre missing ID-ene fantes som fullverdig objekt i en ikke-canonical litteratur-fil.
- ID-ene fantes i tidligere rapporter og i Oslo-litteratur-placefilen, men ikke i canonical emneregister.

## Fullverdige emner fra før

Ingen av de tre missing `em_lit_*`-ID-ene fantes fullverdig fra før med samme `emne_id`.

## Gjort canonical

Følgende er gjort synlige som fullverdige canonical litteratur-emner i `data/fag/litteratur/emner_litteratur_canonical_v4_5.json`:

- `em_lit_adapsjon_tolkning_iscenesettelse`
- `em_lit_kanon_kritikk_og_offentlighet`
- `em_lit_lesning_formidling_offentlighet`

Alle tre bruker `emne_id`, ikke `id`, og følger eksisterende full-emne-struktur ved å bygge på nærliggende fullverdige canonical litteratur-emner.

## Opprettet som nye fullverdige emner

- `em_lit_adapsjon_tolkning_iscenesettelse`: avgrenset til litterære tekster, drama og fortellinger som tolkes, bearbeides og iscenesettes i konkrete scener, institusjoner og offentligheter.
- `em_lit_kanon_kritikk_og_offentlighet`: avgrenset til hvordan litterær kanon, kritikk og offentlig samtale formes i møte med konkrete verk, samlinger, institusjoner og leserfellesskap.
- `em_lit_lesning_formidling_offentlighet`: avgrenset til lesning som offentlig praksis i arrangementer, bokhandel, bibliotek og litteraturhus.

## Utsatt

Ingen `em_lit_*` ble utsatt. Alle tre gjenværende litteratur-ID-er hadde konkret place-bruk og kunne støtte History Go-steder uten å bli korte placeholder-emner.

## Legacy/place-variant eller mulig feil prefix

- `em_lit_lesning_formidling_offentlighet` ligger nær `em_lit_lesere_offentlighet_formidling` og kan historisk ha vært en place-variant. Den ble likevel beholdt som eget fullverdig emne fordi place-bruken er konkret og praksis-/arenaorientert.
- `em_lit_kanon_kritikk_og_offentlighet` ligger nær `em_lit_kanon_kritikk_symbolsk_makt` og `em_lit_litteratur_og_offentlig_debatt`, men ble avgrenset til samspillet mellom kanonisering, kritikk og offentlig samtale ved konkrete litteraturinstitusjoner.
- `em_lit_adapsjon_tolkning_iscenesettelse` vurderes ikke som feil prefix; bruken ved `nationaltheatret` er litteraturfaglig når stedet kobles til tekst, verk, tolkning og iscenesettelse.

## Ingen place-endringer

Bekreftet med `git diff --name-only`: ingen filer under `data/places/**` ble endret. `data/places/places_index.json`, manifest, UI, CSS, HTML og JS ble ikke endret.

## Før/etter-validering

### `npm run places:emner:check`

Før:

- Active place files: 40
- Canonical emne files scanned: 15
- Canonical emne ids loaded: 986
- Missing emne_ids: 24
- Gjenværende `em_lit_*`: 5 forekomster / 3 unike ID-er
- Duplicate emne_ids within same place: 0
- Duplicate place ids across active files: 0
- Duplicate canonical emne_ids across canonical files: 0

Etter:

- Active place files: 40
- Canonical emne files scanned: 15
- Canonical emne ids loaded: 989
- Missing emne_ids: 19
- Gjenværende `em_lit_*`: 0
- Duplicate emne_ids within same place: 0
- Duplicate place ids across active files: 0
- Duplicate canonical emne_ids across canonical files: 0

`npm run places:emner:check` avslutter fortsatt med exit code 1 fordi 19 missing ID-er i andre fagfamilier gjenstår utenfor Batch 18-scope.

### `npm run places:index:check`

Resultat: OK — `places_index.json is in sync with source place files.`

### `npm run health:places`

Resultat:

- Files checked: 40
- Places checked: 470
- Hidden places: 0
- Stub places: 0
- Canonical emne files checked: 16
- emne_ids checked: 1049
- Canonical emne_ids: 1030
- Unknown emne_ids: 19
- Wrong-prefix emne_ids: 306
- Errors: 0
- Warnings: 1342

## Anbefalt Batch 19

Anbefalt Batch 19: ta neste avgrensede fagfamilie med få unike missing ID-er og én tydelig place-klynge. Basert på etter-resultatet peker `em_media_*` seg ut som en liten Oslo-gruppe med to unike ID-er og tre forekomster i `data/places/media/oslo/places_oslo_media.json`: `em_media_av_og_tv_produksjon` og `em_media_kritikk_kommentar`.
