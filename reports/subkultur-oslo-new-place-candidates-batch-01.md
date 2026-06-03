# Subkultur Oslo – new place candidates batch 01 (post-merge QA)

Post-merge QA etter PR #916 på `main`. Denne rapporten dokumenterer hva som ble lagt inn, hva som ble hoppet over eller utsatt, og hvilke valideringer som ble kjørt i denne QA-jobben.

## Steder lagt inn i PR #916

- `blitzhuset`
- `kafe_haerverk`
- `brenneriveien_ingens_gate`
- `gamlebyen_sport_og_fritid`
- `oslo_skatehall`
- `xray_ungdomskulturhus`
- `vaterland_bar_scene`

## Steder hoppet over fordi de allerede finnes

- `hausmania`
- `bla`
- `skur13`

## Steder utsatt til senere batch

- `jordal_skatepark`
- `voldslokka_pumptrack`
- `revolver_oslo`
- `the_villa`
- `jaeger_oslo`
- `sub_scene`
- `mir_grunerlokka_lufthavn`

## Filer endret i PR #916

- `data/places/subkultur/oslo/places_subkultur.json`
- `data/places/places_index.json`

## QA-kontroll av merge-resultatet

### Tilstedeværelse

Alle syv PR #916-steder finnes i `data/places/subkultur/oslo/places_subkultur.json` og i `data/places/places_index.json`.

### Obligatoriske felter og koordinater

Alle syv PR #916-steder i `data/places/subkultur/oslo/places_subkultur.json` har følgende felter:

- `id`
- `name`
- `lat`
- `lon`
- `r`
- `category`
- `year`
- `desc`
- `popupDesc`
- `emne_ids`
- `underbadge_ids`
- `quiz_profile`
- `coordType`
- `coordSource`
- `coordSourceId`
- `coordSourceUrl`
- `coordStatus`
- `coordPrecisionM`
- `coordVerifiedAt`
- `coordNote`

Alle syv har `category: "subkultur"`, og ingen av dem har `lat` eller `lon` satt til `null`.

`data/places/places_index.json` er en lett indeks bygget fra manifestet og inneholder bare indeksfeltene som `tools/check_places_index_sync.mjs` forventer. Derfor ble rikere metadata som `popupDesc`, `emne_ids`, `underbadge_ids`, `quiz_profile` og koordinatkilde-felter kontrollert i kildefilen `data/places/subkultur/oslo/places_subkultur.json`, ikke lagt inn på nytt i indeksen.

### Emne-ID-er

Alle `emne_ids` brukt av de syv stedene er gyldige mot canonical subkultur-emner i `data/fag/subkultur/emner_subkultur_canonical_v4_5.json`.

### Duplikate place-ID-er

Det ble ikke funnet duplikate place-ID-er på tvers av aktive place-filer i repoets emne-/place-ID-validering.

## Underbadge-/badge-QA

Eksisterende subkultur-underbadge-system er definert i `data/badges/subkultur.json` under feltet `sub`. UI-oppslaget skjer i `getRelevantBadgeSubcategories()` i `js/ui/place-card.js`, som matcher `place.underbadge_ids` mot underbadge-ID-er fra badge-definisjonen.

Eksisterende definerte subkultur-underbadges:

- `alternativ_mote`
- `graffiti`
- `hiphop`
- `motkulturhistorie`
- `punk`
- `rave_og_klubbkultur`
- `skate`
- `underground_scener`

### Manglende underbadge-ID-er funnet i PR #916-stedene

Følgende `underbadge_ids` brukes av de syv stedene, men mangler i eksisterende underbadge-/badge-system:

| Manglende underbadge-ID | Steder som bruker ID-en |
| --- | --- |
| `diy` | `blitzhuset` |
| `aktivisme` | `blitzhuset` |
| `undergrunn` | `kafe_haerverk`, `brenneriveien_ingens_gate` |
| `klubbkultur` | `kafe_haerverk` |
| `eksperimentell_musikk` | `kafe_haerverk` |
| `street_art` | `brenneriveien_ingens_gate` |
| `dugnad` | `gamlebyen_sport_og_fritid` |
| `dans` | `xray_ungdomskulturhus` |
| `ungdomskultur` | `xray_ungdomskulturhus` |
| `metal` | `vaterland_bar_scene` |
| `rock` | `vaterland_bar_scene` |

### Anbefalt separat oppfølgingsjobb

Ikke løs dette som del av post-merge QA uten en tydelig produkt-/datamodellbeslutning. Anbefalt separat jobb:

1. Avklar om `underbadge_ids` skal bruke eksisterende `data/badges/subkultur.json`-ID-er direkte, eller om badge-systemet skal utvides med nye underbadges.
2. Hvis systemet skal utvides, legg til manglende underbadge-definisjoner i badge-kilden og verifiser visning via `getRelevantBadgeSubcategories()` i `js/ui/place-card.js`.
3. Hvis systemet ikke skal utvides, map PR #916-stedenes `underbadge_ids` til eksisterende canonical subkultur-underbadges etter en eksplisitt redaksjonell beslutning.
4. Legg eventuelt til et dedikert script for underbadge-QA slik at mismatch mellom `place.underbadge_ids` og badge-definisjoner fanges automatisk.

## Valideringer kjørt i denne QA-jobben

- `npm run places:index:check` – bekreftet at `places_index.json` er synkron med source place-filer.
- `npm run places:emner:check` – bekreftet gyldige emne-ID-er, ingen duplikate emne-ID-er per sted, ingen duplikate place-ID-er i aktive place-filer og ingen duplikate canonical emne-ID-er.
- `npm run places:aliases:check` – bekreftet at det ikke finnes legacy place-ID-er i sjekkede JSON-data.
- `npm run i18n:dupkeys:check` – bekreftet at det ikke finnes duplikate JSON-nøkler i i18n place-filer.
- `npm run health:data` – kjørt som bred datahelse-sjekk. Scriptet fullførte, men rapporterte eksisterende globale feil/advarsler uten å isolere nye PR #916-feil.
- Egen Python-basert kontroll av de syv PR #916-stedene for tilstedeværelse, obligatoriske felter, `category: "subkultur"`, ikke-null `lat`/`lon`, canonical subkultur-emne-ID-er og underbadge-mismatch mot `data/badges/subkultur.json`.
