# Subkultur Oslo – nye stedskandidater batch 01 (PR #916 QA)

Post-merge QA er kjørt på `main` etter at PR #916 var merget. Denne rapporten dokumenterer hva PR-en la inn, hva som ble hoppet over eller utsatt, og hvilke valideringer som ble kjørt i denne QA-jobben. QA-jobben legger ikke inn nye steder og endrer ikke UI, runtime, CSS eller schema.

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

## QA-scope

QA-sjekken kontrollerte de syv PR #916-stedene mot følgende krav:

1. Alle syv finnes i `data/places/subkultur/oslo/places_subkultur.json`.
2. Alle syv finnes i `data/places/places_index.json`.
3. Det finnes ikke duplikate place-ID-er i aktive place-filer.
4. Alle syv fullposter i `places_subkultur.json` har feltene `id`, `name`, `lat`, `lon`, `r`, `category`, `year`, `desc`, `popupDesc`, `emne_ids`, `underbadge_ids`, `quiz_profile`, `coordType`, `coordSource`, `coordSourceId`, `coordSourceUrl`, `coordStatus`, `coordPrecisionM`, `coordVerifiedAt` og `coordNote`.
5. `lat` og `lon` er ikke `null` for noen av de syv fullpostene.
6. `category` er `subkultur` for alle syv fullpostene.
7. `emne_ids` er gyldige mot canonical subkultur-emner.
8. `underbadge_ids` er kontrollert mot eksisterende subkultur-badge-system uten å opprette nye underbadges.

## Valideringer kjørt i denne QA-jobben

- `node`-basert JSON-parse-sjekk av alle JSON-filer under `data/`.
- `npm run i18n:dupkeys:check`.
- `npm run places:emner:check`.
- `npm run places:aliases:check`.
- `npm run places:index:check`.
- `npm run health:places`.
- Manuell/custom Node-sjekk for de syv PR #916-ID-ene i `places_subkultur.json` og `places_index.json`, required fields, `lat`/`lon`, `category`, canonical `emne_ids` og `underbadge_ids` mot `data/badges/subkultur.json`.

## QA-resultat

### Place- og emnevalidering

- Alle syv PR #916-stedene finnes nøyaktig én gang i `data/places/subkultur/oslo/places_subkultur.json`.
- Alle syv PR #916-stedene finnes nøyaktig én gang i `data/places/places_index.json`.
- Alle syv fullposter i `places_subkultur.json` har alle påkrevde felt.
- `lat` og `lon` er ikke `null` for noen av de syv fullpostene.
- `category` er `subkultur` for alle syv fullpostene.
- `emne_ids` er gyldige mot canonical subkultur-emner.
- `npm run places:emner:check` rapporterte `Missing emne_ids: 0`, `Duplicate emne_ids within same place: 0`, `Duplicate place ids across active files: 0` og `Duplicate canonical emne_ids across canonical files: 0`.
- `npm run places:aliases:check` rapporterte ingen legacy place-ID-er i sjekket JSON-data.
- `npm run places:index:check` rapporterte at `places_index.json` er synkron med source place files.

### JSON-parse og datahelse

- Den brede JSON-parse-sjekken av alle JSON-filer under `data/` feilet på eksisterende ugyldige JSON-/mal-/arkivfiler utenfor PR #916-scope:
  - `data/fag/by/arkiv/emner_by2.json`
  - `data/fag/musikk/emnergvb_musikk.json`
  - `data/maler/relationMAL.json`
  - `data/maler/wonderkammer_enryMAL.json`
  - `data/natur/Insekter.json`
  - `data/natur/emne_fauna_insekterBACKUP.json`
  - `data/natur/fauna/insekter_sommerfugler_og_larver.json`
- `npm run i18n:dupkeys:check` passerte.
- `npm run health:places` passerte med `Errors: 0`, men rapporterte eksisterende advarsler om manglende bildefiler. Dette er ikke endret i denne QA-jobben.

### Underbadge-QA

Eksisterende underbadge-system for `subkultur` er `data/badges/subkultur.json`, der `sub` inneholder følgende canonical under-ID-er:

- `punk`
- `hiphop`
- `rave_og_klubbkultur`
- `skate`
- `graffiti`
- `underground_scener`
- `alternativ_mote`
- `motkulturhistorie`

`underbadge_ids` i de syv PR #916-stedene ble kontrollert mot denne listen. Følgende ID-er mangler i eksisterende underbadge-system:

| Manglende underbadge_id | Steder som bruker ID-en |
| --- | --- |
| `aktivisme` | `blitzhuset` |
| `diy` | `blitzhuset` |
| `undergrunn` | `kafe_haerverk`, `brenneriveien_ingens_gate` |
| `klubbkultur` | `kafe_haerverk` |
| `eksperimentell_musikk` | `kafe_haerverk` |
| `street_art` | `brenneriveien_ingens_gate` |
| `dugnad` | `gamlebyen_sport_og_fritid` |
| `dans` | `xray_ungdomskulturhus` |
| `ungdomskultur` | `xray_ungdomskulturhus` |
| `metal` | `vaterland_bar_scene` |
| `rock` | `vaterland_bar_scene` |

`punk`, `graffiti`, `skate` og `hiphop` finnes i eksisterende `sub`-liste og validerer mot dagens badge-system.

## Fil/funksjon som forventer underbadge-definisjoner

Underbadge-visning i placecard leser stedets `underbadge_ids` og matcher dem mot `placeBadge.sub` eller `placeBadge.groups.children`. Dersom en ID ikke finnes i badge-definisjonen, blir den filtrert bort fra visningen:

- `js/ui/place-card.js`: `getRelevantBadgeSubcategories(place, placeBadge)` matcher `place.underbadge_ids` mot `placeBadge.sub` / `placeBadge.groups.children`.
- `js/ui/place-card.js`: placecard-renderingen bruker resultatet fra `getRelevantBadgeSubcategories`; manglende match gir tom/ikke vist underbadge-chip.
- `js/ui/badges.js`: `renderBadgeSubcategories(place, badge)` bygger underkategori-visning fra `badge.sub`.
- `README/badgesREADME.json`: dokumenterer at `badge.sub` er canonical listen med under-ID-er.

## Anbefalt separat oppfølgingsjobb

Lag en egen, avgrenset underbadge/badge-QA-oppfølgingsjobb for `subkultur` som tar stilling til én av disse modellene uten å blande det inn i PR #916 post-merge QA:

1. Utvide `data/badges/subkultur.json` med nye canonical underbadges etter eksplisitt modellbeslutning, eller
2. mappe PR #916-stedenes `underbadge_ids` til allerede eksisterende canonical IDs, for eksempel der repoet allerede har et klart semantisk etablert synonym, eller
3. etablere et tydelig alias-/synonym-lag for underbadges dersom prosjektet ønsker å beholde mer detaljerte place-level IDs enn `badge.sub`.

Denne QA-jobben gjør ingen av delene, fordi underbadge-systemet er for uklart til å gjette løsning innenfor post-merge QA-scope.
