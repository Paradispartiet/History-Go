# Oslo place-audit batch 21 — natur/nat remaining emne_ids

**Dato:** 2026-05-30

## Formål

Batch 21 verifiserer gjenværende naturrelaterte missing `emne_ids` etter Batch 20, med særskilt vekt på `em_nat_*` og `em_natur_*`. Arbeidet er konservativt: place-data er ikke migrert, alias-schema er ikke innført, og `em_nat_*` er ikke gjort canonical når observert natur-canonical bruker `em_natur_*`.

## Kommandoer kjørt

- `npm run places:emner:check` — før endring
- `rg`/Node-søk i `data/fag/natur/**`, relevante rapporter og aktive natur-place-filer
- `npm run places:emner:check` — etter endring
- `npm run places:index:check`
- `npm run health:places`

## Filer undersøkt

- `reports/oslo-place-audit-batch-12-current-missing-emne-ids.md`
- `reports/place-emne-missing-audit-batch-12.json`
- `reports/oslo-place-audit-batch-20-naeringsliv-remaining-emner.md`
- `tools/check_place_emne_ids.mjs`
- `data/fag/natur/**`
- `data/fag/natur/emner_natur_canonical_v4_5.json`
- `data/fag/natur/emnemapping_natur_canonical_v4_5.json`
- `data/fag/natur/fagkart_natur_canonical_v4_5.json`
- `data/fag/natur/methods_natur_canonical_v4_5.json`
- `data/fag/natur/naturpensum_canonical_v4_5.json`
- `data/places/natur/oslo/places_oslo_alna.json` — kontekst kun
- `data/places/natur/oslo/places_oslo_natur_hovedsteder.json` — kontekst kun
- `data/places/manifest.json` — for å bekrefte aktive place-filer via check-scriptets logikk

## Manglende naturrelaterte IDs før batchen

Før endringen rapporterte `npm run places:emner:check` **16** missing `emne_ids` totalt. Natur-/nat-klyngen besto av **6 forekomster / 4 unike IDs**:

| emne_id | Forekomster | Place-filer | Eksempel-place-id-er | Sannsynlig årsak | Vurdering |
| --- | ---: | --- | --- | --- | --- |
| `em_nat_by_natur_motepunkt` | 3 | `data/places/natur/oslo/places_oslo_alna.json`, `data/places/natur/oslo/places_oslo_natur_hovedsteder.json` | `alnaelva`, `gressholmen`, `maerradalen` | Gammel `em_nat_*`-variant for bynatur/naturmøte. Dekkes tematisk av eksisterende `em_natur_urban_okologi_byrom`, `em_natur_gronnstruktur_korridorer` og delvis `em_natur_naturopplevelse_folkehelse`. | Prefixdrift / legacy place-variant. Utsatt til eksplisitt place-migrering. |
| `em_nat_okologi_grenser` | 1 | `data/places/natur/oslo/places_oslo_natur_hovedsteder.json` | `gressholmen` | Gammel `em_nat_*`-variant for økologiske grenser/randsoner. Dekkes tematisk av eksisterende `em_natur_gronnstruktur_korridorer`, `em_natur_arter_habitat_mangfold` og `em_natur_byutvikling_naturkonflikt` avhengig av sted. | Prefixdrift / legacy place-variant. Utsatt til eksplisitt place-migrering. |
| `em_natur_kyst_okosystemer` | 1 | `data/places/natur/oslo/places_oslo_natur_hovedsteder.json` | `hovedoya` | Canonical prefix stemmer med observert praksis. Eksisterende `em_natur_kyst_fjord_og_strand` dekker kyst/fjord/strand som landskap/geologi, men ikke like presist kystøkosystemer med marine habitater, fugleliv, vannkvalitet og brukspress. | Fullverdig natur-emne opprettet. |
| `em_natur_friluftsliv_helse` | 1 | `data/places/natur/oslo/places_oslo_natur_hovedsteder.json` | `noklevann` | Canonical prefix stemmer med observert praksis. Eksisterende `em_natur_naturopplevelse_folkehelse` finnes, men den nye ID-en er en konkret, place-egnet friluftsliv/bruk/helse-vinkel for marka, vann, turveier, badeplasser og grøntområder. | Fullverdig natur-emne opprettet. |

## Observert prefix-praksis i natur-canonical

`data/fag/natur/emner_natur_canonical_v4_5.json` inneholdt før batchen **33** canonical natur-emner. Alle brukte `em_natur_*` som `emne_id`; ingen canonical natur-emner brukte `em_nat_*`.

Konklusjon: `em_natur_*` er faktisk observert canonical-prefix i natur-emnefilen. `em_nat_*` ble derfor ikke canonicalisert i denne batchen, fordi det ville innført en ny canonical prefix-praksis og skjult prefixdrift i place-data.

## Søk i `data/fag/natur/**`

- De fire aktuelle missing ID-ene fantes ikke som fullverdige `emne_id`-objekter i naturfilene før batchen.
- `em_nat_by_natur_motepunkt` og `em_nat_okologi_grenser` fantes bare i place-/rapportkontekst, ikke som canonical natur-emner.
- Natur-canonical inneholdt allerede sterke nærliggende mål for `em_nat_*`-variantene:
  - `em_natur_urban_okologi_byrom`
  - `em_natur_gronnstruktur_korridorer`
  - `em_natur_byutvikling_naturkonflikt`
  - `em_natur_arter_habitat_mangfold`
- `em_natur_kyst_okosystemer` og `em_natur_friluftsliv_helse` hadde riktig observert prefix og tydelige place-forankrede bruksområder, og ble derfor opprettet som fullverdige canonical natur-emner.

## Endringer gjort

### Gjort canonical

Ingen eksisterende ikke-canonical fullobjekter ble flyttet eller gjort synlige; de aktuelle ID-ene fantes ikke som fullverdige objekter utenfor canonical natur-emnefil.

### Opprettet som fullverdige nye emner

Følgende fullverdige `em_natur_*`-emner ble lagt til i `data/fag/natur/emner_natur_canonical_v4_5.json` med samme strukturelle stil som eksisterende natur-emner:

- `em_natur_kyst_okosystemer`
  - Kort definisjon: kyst- og fjordnære økosystemer der strandsoner, marine habitater, fugleliv, vannkvalitet og menneskelig bruk møtes i konkrete steder.
  - Avgrensning: skal ikke brukes som generell sjøfart, næringsliv eller byhistorie uten kyst-/fjord-/habitat-/vannkvalitetsanker.
  - Relevant eksempel fra active place-data: `hovedoya`.

- `em_natur_friluftsliv_helse`
  - Kort definisjon: friluftsliv, bevegelse, rekreasjon, naturkontakt og folkehelse der konkrete naturområder brukes i hverdagen.
  - Avgrensning: skal ikke brukes som sport eller helsepolitikk uten naturbruk, landskap, vann, skog, park eller grøntområde.
  - Relevant eksempel fra active place-data: `noklevann`.

### Utsatt

- `em_nat_by_natur_motepunkt` er utsatt som prefixdrift / legacy place-variant. Mulige senere canonical mål ved place-migrering: primært `em_natur_urban_okologi_byrom`, eventuelt `em_natur_gronnstruktur_korridorer` eller `em_natur_naturopplevelse_folkehelse` etter stedskontekst.
- `em_nat_okologi_grenser` er utsatt som prefixdrift / legacy place-variant. Mulige senere canonical mål ved place-migrering: `em_natur_gronnstruktur_korridorer`, `em_natur_arter_habitat_mangfold` eller `em_natur_byutvikling_naturkonflikt` etter stedskontekst.

Ingen `em_nat_*`-emner ble opprettet, og ingen place-data ble migrert i denne PR-en.

## Før/etter-resultat — `npm run places:emner:check`

### Før

- Active place files: 40
- Canonical emne files scanned: 15
- Canonical emne ids loaded: 991
- Missing emne_ids: 16
- Natur-/nat-relatert: 6 forekomster / 4 unike
- Duplicate emne_ids within same place: 0
- Duplicate place ids across active files: 0
- Duplicate canonical emne_ids across canonical files: 0

### Etter

- Active place files: 40
- Canonical emne files scanned: 15
- Canonical emne ids loaded: 993
- Missing emne_ids: 14
- Gjenværende natur-/nat-relatert: 4 forekomster / 2 unike
  - `em_nat_by_natur_motepunkt` — 3
  - `em_nat_okologi_grenser` — 1
- Duplicate emne_ids within same place: 0
- Duplicate place ids across active files: 0
- Duplicate canonical emne_ids across canonical files: 0

Kommandoen returnerer fortsatt non-zero fordi 14 known missing `emne_ids` gjenstår på tvers av fagfamilier, inkludert de to utsatte `em_nat_*`-variantene.

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
- Canonical emne_ids: 1035
- Unknown emne_ids: 14
- Wrong-prefix emne_ids: 306
- Errors: 0
- Warnings: 1337

## Bekreftelser

- Ingen filer under `data/places/**` er endret.
- `data/places/places_index.json` er ikke endret.
- Manifest er ikke endret.
- UI, CSS, HTML og JS er ikke endret.
- Alias-schema eller alias-mini-schema er ikke innført.
- Ingen korte placeholder-emner er lagt til.
- Ingen place-data er migrert.
- Ingen andre fagfamilier er endret.

## Anbefalt Batch 22

Anbefalt Batch 22: håndter gjenværende `em_nat_*` som eksplisitt place-migrering i natur-place-data, ikke som nye canonical duplikater. Migreringen bør per place velge eksisterende `em_natur_*`-mål:

- `alnaelva`: sannsynlig `em_natur_urban_okologi_byrom` eller `em_natur_gronnstruktur_korridorer`, med vurdering mot elv/restaurering.
- `gressholmen`: sannsynlig kombinasjon av `em_natur_kyst_okosystemer`, `em_natur_gronnstruktur_korridorer` eller `em_natur_arter_habitat_mangfold`, med vurdering av fugleliv/fjordøy/randsone.
- `maerradalen`: sannsynlig `em_natur_gronnstruktur_korridorer` eller `em_natur_urban_okologi_byrom`, med vurdering av bekkedrag, dalrom og grøntdrag.

Etter natur-migreringen kan en senere batch fortsette med de fortsatt kjente ikke-natur-klyngene (`em_naering_*`, `em_pol_*`, `em_kunst_*`) uten å blande fagfamilier.
