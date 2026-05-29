# Oslo place-audit batch 19 — media remaining emner

**Dato:** 2026-05-29

## Kommandoer kjørt

- `npm run places:emners:check` — kontrollert først som foreslått, men scriptet finnes ikke i `package.json`; batchen brukte derfor eksisterende singular-script.
- `npm run places:emner:check`
- `rg -n "em_media_av_og_tv_produksjon|em_media_kritikk_kommentar" data/fag/media data/places/media/oslo/places_oslo_media.json reports/place-emne-missing-audit-batch-12.json reports/oslo-place-audit-batch-18-litteratur-remaining-emner.md reports/oslo-place-audit-batch-12-current-missing-emne-ids.md`
- `find data/fag/media -type f -iname 'emner*_canonical*.json' -print | sort`
- `npm run places:index:check`
- `npm run health:places`
- `git status --short`

## Filer undersøkt

- `reports/oslo-place-audit-batch-12-current-missing-emne-ids.md`
- `reports/place-emne-missing-audit-batch-12.json`
- `reports/oslo-place-audit-batch-18-litteratur-remaining-emner.md`
- `tools/check_place_emne_ids.mjs`
- `data/fag/media/Me.md`
- `data/fag/media/SET_MAL_README_media_v4_3.md`
- `data/fag/media/emnemapping_media_canonical_v4_5.json`
- `data/fag/media/emner_media_canonical_v4_5.json`
- `data/fag/media/fagkart_media_canonical_v4_5.json`
- `data/fag/media/mediapensum_canonical_v4_5.json`
- `data/fag/media/methods_media_canonical_v4_5.json`
- `data/fag/media/quiz_generator_rules_media_v5_1_source_priority_patch.json`
- `data/fag/media/supersetQUIZMAL_media.json`
- `data/places/media/oslo/places_oslo_media.json` — kun brukt som kontekst, ikke endret.

## Missing `em_media_*` før batchen

Før batchen rapporterte `npm run places:emner:check` 19 missing `emne_ids` totalt. Av disse var tre forekomster i media-familien:

| emne_id | Forekomster | Place-filer | Eksempel-place-id-er | Sannsynlig årsak |
| --- | ---: | --- | --- | --- |
| `em_media_av_og_tv_produksjon` | 1 | `data/places/media/oslo/places_oslo_media.json` | `nrk_huset_marienlyst` | Fullverdig, stedlig media-emne manglet i canonical media-emnefil; place-koblingen peker på konkret kringkastings- og studioproduksjon. |
| `em_media_kritikk_kommentar` | 2 | `data/places/media/oslo/places_oslo_media.json` | `dagbladet_akersgata`, `klassekampen_redaksjon` | Fullverdig, stedlig media-emne manglet i canonical media-emnefil; place-koblingene peker på konkrete redaksjoner med kommentar-, kritikk- og debattflater. |

## Søk i media-fagdata

- Begge ID-ene ble søkt i `data/fag/media/**`.
- Ingen av ID-ene fantes som fullverdig objekt i en ikke-canonical media-fil.
- Ingen av ID-ene fantes i eksisterende canonical media-emnefil før batchen.
- ID-ene fantes som place-referanser i `data/places/media/oslo/places_oslo_media.json` og som missing-ID-er i tidligere batchrapporter.

## Fullverdige emner fra før

Ingen av de to undersøkte `em_media_*`-ID-ene fantes fullverdig fra før.

## Gjort canonical

Ingen eksisterende ikke-canonical fullobjekter ble flyttet eller gjort synlige. Det fantes ikke slike objekter for disse ID-ene.

## Opprettet som fullverdige nye emner

To nye fullverdige canonical media-emner ble opprettet i `data/fag/media/emner_media_canonical_v4_5.json`:

- `em_media_av_og_tv_produksjon`
  - Avgrenset til audiovisuell produksjon, TV-produksjon, studio, kontrollrom, programformat, redaksjonell produksjonspraksis, teknikk og kringkastingsinstitusjoner.
  - Stedlig relevans: særlig `nrk_huset_marienlyst`, der place-data allerede peker på studioer, redaksjoner og teknisk infrastruktur for radio og TV.
  - Eksplisitt avgrenset bort fra generell film, scenekunst og populærkultur.
- `em_media_kritikk_kommentar`
  - Avgrenset til mediekritikk, kommentarjournalistikk, offentlig debatt, redaksjonell vurdering, spalter, anmeldelser og presseoffentlighet.
  - Stedlig relevans: `dagbladet_akersgata` og `klassekampen_redaksjon`, der place-data allerede peker på kommentarstoff, kulturjournalistikk, redaksjonell profil og debattflater.
  - Eksplisitt avgrenset bort fra generell politikk, litteraturkritikk uten medieanker og sosial mediebruk.

Begge objektene følger eksisterende media-emnestruktur med `emne_id` som identifikator, ikke `id`.

## Utsatt

Ingen `em_media_*` ble utsatt i Batch 19. Begge gjenværende media-ID-er var konkrete nok til fullverdige canonical emner.

## Legacy/place-variant eller feil prefix

Ingen av de to undersøkte `em_media_*`-ID-ene virker som legacy/place-variant eller feil prefix. Begge peker på media-kategoriens faglige kjerne: redaksjonell produksjon, kringkasting, kritikk, kommentar og presseoffentlighet.

## Bekreftelse: ingen place-filer endret

`git status --short` viste bare batchens endringer i:

- `data/fag/media/emner_media_canonical_v4_5.json`
- `reports/oslo-place-audit-batch-19-media-remaining-emner.md`

Det fantes også en urelatert, utracket `node_modules/` i arbeidskopien fra før; den er ikke del av batchen. Ingen filer under `data/places/**` ble endret. `data/places/places_index.json`, manifest, UI, CSS, HTML og JS ble ikke endret.

## Før/etter — `npm run places:emner:check`

### Før

- Active place files: 40
- Canonical emne files scanned: 15
- Canonical emne ids loaded: 989
- Missing emne_ids: 19
- Gjenværende `em_media_*`: 3 forekomster / 2 unike ID-er
- Duplicate emne_ids within same place: 0
- Duplicate place ids across active files: 0
- Duplicate canonical emne_ids across canonical files: 0

### Etter

- Active place files: 40
- Canonical emne files scanned: 15
- Canonical emne ids loaded: 991
- Missing emne_ids: 16
- Gjenværende `em_media_*`: 0
- Duplicate emne_ids within same place: 0
- Duplicate place ids across active files: 0
- Duplicate canonical emne_ids across canonical files: 0

`npm run places:emner:check` avslutter fortsatt med exit code 1 fordi 16 missing ID-er i andre fagfamilier gjenstår utenfor Batch 19-scope.

## Resultat — `npm run places:index:check`

Resultat: OK — `places_index.json is in sync with source place files.`

## Resultat — `npm run health:places`

Resultat:

- Files checked: 40
- Places checked: 470
- Hidden places: 0
- Stub places: 0
- Canonical emne files checked: 16
- emne_ids checked: 1049
- Canonical emne_ids: 1033
- Unknown emne_ids: 16
- Wrong-prefix emne_ids: 306
- Errors: 0
- Warnings: 1339

## Anbefalt Batch 20

Anbefalt Batch 20: ta neste avgrensede gjenværende Oslo-klynge uten å migrere place-data. Etter Batch 19 peker `em_naering_*` seg ut som en tydelig gruppe i `data/places/naeringsliv/oslo/places_naeringsliv.json` med 7 forekomster og 6 unike ID-er. Batch 20 bør først avklare om disse er fullverdige næringslivsemner eller legacy/place-varianter før eventuelle canonical-emner opprettes.
