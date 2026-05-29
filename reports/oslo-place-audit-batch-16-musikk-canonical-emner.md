# Oslo place-audit batch 16 — musikk canonical emner

**Dato:** 2026-05-29

## Formål
Batch 16 verifiserte gjenværende egne `em_musikk_*`-mangler fra Oslo musikk etter Batch 14–15 og gjorde bare fullverdige musikkemner synlige i `data/fag/musikk/emner_musikk_canonical_v4_5.json`.

## Kommandoer kjørt
- `npm run places:emner:check` før endring
- `rg -n "em_musikk_scene_klubb_livekultur|em_musikk_konsertokonomi_arrangorledd|em_musikk_rock_metal_alternativ|em_musikk_pop_mainstream" reports data/fag data/places/musikk/oslo/places_musikk.json`
- `rg -n "scene_klubb_livekultur|konsertokonomi_arrangorledd|rock_metal_alternativ|pop_mainstream|Scene Klubb Livekultur|Konsertøkonomi" data/fag reports data/places/musikk/oslo/places_musikk.json`
- `node -e "JSON.parse(require('fs').readFileSync('data/fag/musikk/emner_musikk_canonical_v4_5.json','utf8')); console.log('json ok')"`
- `npm run places:emner:check` etter endring
- `npm run places:index:check`
- `npm run health:places`
- `git diff --name-only`

## Filer undersøkt
- `reports/oslo-place-audit-batch-12-current-missing-emne-ids.md`
- `reports/place-emne-missing-audit-batch-12.json`
- `reports/oslo-place-audit-batch-14-musikk-canonical-prefixdrift.md`
- `reports/oslo-place-audit-batch-15-migrate-em-mus-prefix.md`
- `tools/check_place_emne_ids.mjs`
- `data/fag/musikk/emner_musikk_canonical_v4_5.json`
- `data/fag/musikk/emnergvb_musikk.json`
- `data/fag/musikk/fagkart_musikk_canonical_v4_5.json`
- `data/fag/musikk/musikkpensum_canonical_v4_5.json`
- `data/fag/musikk/supersetQUIZMAL_musikk.json`
- `data/fag/fagkart.json`
- `data/places/musikk/oslo/places_musikk.json` kun som kontekst

## Missing `em_musikk_*` før batchen
Før endring rapporterte `npm run places:emner:check` fortsatt 51 missing `emne_ids` totalt. De gjenværende musikk-ID-ene var:

| Emne-ID | Forekomster | Place-eksempler |
| --- | ---: | --- |
| `em_musikk_scene_klubb_livekultur` | 4 | `blaa`, `rockefeller`, `john_dee`, `sentrum_scene` |
| `em_musikk_konsertokonomi_arrangorledd` | 1 | `rockefeller` |
| `em_musikk_rock_metal_alternativ` | 1 | `john_dee` |
| `em_musikk_pop_mainstream` | 1 | `sentrum_scene` |

## Verifisering mot eksisterende musikk-fagdata
Eksakte fullverdige emneobjekter for de fire ID-ene fantes ikke fra før i `data/fag/musikk/emner_musikk_canonical_v4_5.json` eller øvrige undersøkte musikkdata. Søk fant ID-ene bare i place-kontekst og tidligere auditrapporter.

Faglig grunnlag fantes likevel i etablerte canonical musikkemner og quiz-/pensumstruktur:

- `em_musikk_klubb_scene_subkultur`, `em_musikk_scene_live_performativitet`, `em_musikk_publikum_fellesskap` og `em_musikk_festival_sceneinfrastruktur` dekker scene, klubb, live, publikum og sceneinfrastruktur.
- `em_musikk_arbeid_bransje_okonomi`, `em_musikk_kulturpolitikk_stotte` og `em_musikk_skjult_arbeid_blindsoner` dekker bransje, økonomi, institusjoner og skjult arbeid.
- `em_musikk_rock_pop_populaermusikk`, `em_musikk_sjangerbrudd_hybridformer` og `em_musikk_identitet_subkultur_tilhorighet` dekker sjanger, populærmusikk, alternativ tilhørighet og subkulturelle felt.
- `supersetQUIZMAL_musikk.json` bruker Blå som scene-/klubb-/liveeksempel og støtter at slike stedlige koblinger er musikkfaglige, ikke generiske placeholders.

## Fullverdige emner gjort canonical
Følgende fire ID-er ble lagt inn som fullverdige canonical emneobjekter i `data/fag/musikk/emner_musikk_canonical_v4_5.json` med eksisterende musikk-schema/stil, `emne_id`, metoder, teori-hooks, Oslo-cases, generator constraints og guardrails:

| Emne-ID | Handling | Avgrensning |
| --- | --- | --- |
| `em_musikk_scene_klubb_livekultur` | Opprettet som fullverdig canonical emne | Klubber, konsertscener, livekultur, publikumspraksis, booking, nattliv og sceneøkologi. |
| `em_musikk_konsertokonomi_arrangorledd` | Opprettet som fullverdig canonical emne | Arrangørledd, booking, billetter, produksjon, teknikk, økonomisk risiko og sceneinfrastruktur. |
| `em_musikk_rock_metal_alternativ` | Opprettet som fullverdig canonical emne | Rock, metal og alternativ musikk som sjangerfelt, scene, publikum, estetikk og subkulturell tilhørighet. |
| `em_musikk_pop_mainstream` | Opprettet som fullverdig canonical emne | Pop og mainstream-musikk som bred offentlig kultur, kommersiell scene, publikum og mediesirkulasjon. |

## Fantes fullverdig fra før
Ingen av de fire ID-ene fantes som eksakte fullverdige emneobjekter fra før. Derfor ble ingen objekter kopiert direkte uendret fra en eksisterende fullverdig definisjon.

## Utsatt
Ingen av de fire undersøkte `em_musikk_*`-emnene ble utsatt. Alle fire hadde tydelig musikkfaglig forankring i eksisterende canonical musikkdata og konkrete Oslo-stedskoblinger.

## Ikke endret
- Ingen filer under `data/places/**` ble endret.
- `data/places/places_index.json` ble ikke endret.
- Manifest ble ikke endret.
- UI, CSS, HTML og JS ble ikke endret.
- Ingen alias-schema eller mini-placeholder-schema ble innført.
- Ingen andre fagfamilier ble endret.

`git status --short` etter endring viste bare PR-relevante endringer i musikk-canonical-filen og denne rapporten. `node_modules/` var allerede en lokal untracked arbeidskatalog og tas ikke med i commit. Ingen `data/places/**`-filer var endret.

## Før/etter-resultat fra `npm run places:emner:check`

### Før
```text
Canonical emne ids loaded: 973
Missing emne_ids: 51
Duplicate emne_ids within same place: 0
Duplicate place ids across active files: 0
Duplicate canonical emne_ids across canonical files: 0
```

### Etter
```text
Canonical emne ids loaded: 977
Missing emne_ids: 44
Duplicate emne_ids within same place: 0
Duplicate place ids across active files: 0
Duplicate canonical emne_ids across canonical files: 0
```

`places:emner:check` returnerer fortsatt exit code 1 fordi 44 ikke-musikkrelaterte missing `emne_ids` står igjen. Batch 16 fjernet de 7 musikkforekomstene den skulle håndtere.

## Resultat fra `npm run places:index:check`
```text
places_index.json is in sync with source place files.
```

## Resultat fra `npm run health:places`
```text
Files checked: 40
Places checked: 470
Hidden places: 0
Stub places: 0
Canonical emne files checked: 16
emne_ids checked: 1049
Canonical emne_ids: 1005
Unknown emne_ids: 44
Wrong-prefix emne_ids: 306
Errors: 0
Warnings: 1367
```

## Anbefalt Batch 17
Anbefalt Batch 17: fortsett med én av de gjenværende ikke-musikkfamiliene i `places:emner:check`, helst `em_vit_*` eller `em_lit_*`, og bruk samme arbeidsmåte: verifiser mot eksisterende fagdata, gjør bare fullverdige canonical emner synlige, ikke migrer place-data og ikke innfør alias-/placeholder-schema.
