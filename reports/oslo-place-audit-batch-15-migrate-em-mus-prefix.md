# Oslo place audit — Batch 15 (migrer `em_mus_*` place-referanser)

**Dato:** 2026-05-28

## Formål
Migrere kun de to kjente place-referansene med gammel musikk-prefix fra `em_mus_*` til canonical `em_musikk_*`, etter at Batch 14 etablerte de riktige canonical musikk-emnene.

## Kommandoer kjørt
1. `npm run places:emner:check` (før migrering)
2. `rg -n "em_mus_musikk_som_sosial_energi|em_mus_lydlandskap_byen" .`
3. `sed -n '1,180p' reports/oslo-place-audit-batch-14-musikk-canonical-prefixdrift.md`
4. `sed -n '70,100p;570,595p' reports/place-emne-missing-audit-batch-12.json`
5. `sed -n '1,220p' tools/check_place_emne_ids.mjs`
6. `rg -n "em_musikk_musikk_som_sosial_energi|em_musikk_lydlandskap_byen" data/fag/musikk/emner_musikk_canonical_v4_5.json data/fag/musikk`
7. `sed -n '40,75p' data/places/musikk/oslo/places_musikk.json`
8. `sed -n '150,260p' data/places/subkultur/europe/portugal/lisbon/places_lisbon_subkultur.json`
9. `npm run places:emner:check` (etter migrering)
10. `node - <<'NODE' ... NODE` (duplikatsjekk for `emne_ids` i migrerte place-filer)
11. `rg -n "em_mus_musikk_som_sosial_energi|em_mus_lydlandskap_byen" data/places`
12. `rg -n "em_musikk_musikk_som_sosial_energi|em_musikk_lydlandskap_byen" data/places/musikk/oslo/places_musikk.json data/places/subkultur/europe/portugal/lisbon/places_lisbon_subkultur.json`
13. `npm run places:index:check`
14. `npm run health:places`

## Filer undersøkt
- `reports/oslo-place-audit-batch-14-musikk-canonical-prefixdrift.md`
- `reports/place-emne-missing-audit-batch-12.json`
- `tools/check_place_emne_ids.mjs`
- `data/fag/musikk/emner_musikk_canonical_v4_5.json`
- `data/places/musikk/oslo/places_musikk.json`
- `data/places/subkultur/europe/portugal/lisbon/places_lisbon_subkultur.json`
- Reposøk etter `em_mus_musikk_som_sosial_energi`
- Reposøk etter `em_mus_lydlandskap_byen`

## Filer endret
- `data/places/musikk/oslo/places_musikk.json`
- `data/places/subkultur/europe/portugal/lisbon/places_lisbon_subkultur.json`
- `reports/oslo-place-audit-batch-15-migrate-em-mus-prefix.md`

Ingen canonical-filer, fagfiler, manifest, UI/CSS/HTML/JS eller alias-schema ble endret.

## Migreringer utført
| Gammel ID | Ny canonical ID |
| --- | --- |
| `em_mus_musikk_som_sosial_energi` | `em_musikk_musikk_som_sosial_energi` |
| `em_mus_lydlandskap_byen` | `em_musikk_lydlandskap_byen` |

## Berørte place-id-er
| Place-fil | Place-id | Migrerte referanser |
| --- | --- | --- |
| `data/places/musikk/oslo/places_musikk.json` | `det_norske_teatret` | `em_mus_musikk_som_sosial_energi` → `em_musikk_musikk_som_sosial_energi` |
| `data/places/subkultur/europe/portugal/lisbon/places_lisbon_subkultur.json` | `lisbon_galeria_ze_dos_bois` | `em_mus_musikk_som_sosial_energi` → `em_musikk_musikk_som_sosial_energi` |
| `data/places/subkultur/europe/portugal/lisbon/places_lisbon_subkultur.json` | `lisbon_musicbox` | `em_mus_musikk_som_sosial_energi` → `em_musikk_musikk_som_sosial_energi`; `em_mus_lydlandskap_byen` → `em_musikk_lydlandskap_byen` |

## Bekreftelse: canonical `em_musikk_*` finnes
`rg -n "em_musikk_musikk_som_sosial_energi|em_musikk_lydlandskap_byen" data/fag/musikk/emner_musikk_canonical_v4_5.json data/fag/musikk` bekreftet at begge canonical ID-ene finnes i `data/fag/musikk/emner_musikk_canonical_v4_5.json`:
- `em_musikk_musikk_som_sosial_energi` på linje 11417
- `em_musikk_lydlandskap_byen` på linje 11710

## Duplikatsjekk for `emne_ids`
Egen duplikatsjekk på de to migrerte place-filene ga:

```text
Duplicate emne_ids in migrated files: 0
```

`npm run places:emner:check` rapporterte også fortsatt:

```text
Duplicate emne_ids within same place: 0
Duplicate place ids across active files: 0
Duplicate canonical emne_ids across canonical files: 0
```

## Før/etter: `npm run places:emner:check`
### Før migrering
Kommandoen bekreftet at de to gamle `em_mus_*`-ID-ene fortsatt var missing:

```text
Missing emne_ids: 55
...
"place_id": "det_norske_teatret",
"emne_id": "em_mus_musikk_som_sosial_energi"
...
"place_id": "lisbon_galeria_ze_dos_bois",
"emne_id": "em_mus_musikk_som_sosial_energi"
...
"place_id": "lisbon_musicbox",
"emne_id": "em_mus_musikk_som_sosial_energi"
...
"place_id": "lisbon_musicbox",
"emne_id": "em_mus_lydlandskap_byen"
```

### Etter migrering
Kommandoen rapporterte:

```text
Missing emne_ids: 51
Duplicate emne_ids within same place: 0
Duplicate place ids across active files: 0
Duplicate canonical emne_ids across canonical files: 0
```

De fire missing-forekomstene knyttet til de to gamle `em_mus_*`-ID-ene ble fjernet fra place-check-resultatet.

## Resultat: `npm run places:index:check`
Kommandoen feilet på eksisterende index-avvik utenfor denne batchens tillatte endringsområde:

```text
places_index sync check failed.
Showing first 2 difference(s):
- index=94 placeId=munch_museet type=missing_field field=image
  expected: "bilder/places/kunst/Munch_liggende.JPG"
  actual:   undefined
- index=94 placeId=munch_museet type=missing_field field=frontImage
  expected: "bilder/places/kunst/munch_standing.JPG"
  actual:   undefined
```

Ingen `places_index`- eller manifest-endring ble gjort, fordi oppgaven eksplisitt avgrenser endringer til berørte place-filer og denne rapporten.

## Resultat: `npm run health:places`
Kommandoen fullførte med `Errors: 0`:

```text
Files checked: 40
Places checked: 470
Hidden places: 0
Stub places: 0
Canonical emne files checked: 16
emne_ids checked: 1049
Canonical emne_ids: 998
Unknown emne_ids: 51
Wrong-prefix emne_ids: 306
Errors: 0
Warnings: 1374
```

Sammenlignet med Batch 14-rapportens ettertilstand gikk `Unknown emne_ids` fra 55 til 51, og `Wrong-prefix emne_ids` fra 307 til 306.

## Anbefalt Batch 16
1. Håndter eksisterende `places_index`-avvik for `munch_museet` slik at `npm run places:index:check` igjen kan bli grønn uten å blande det inn i Batch 15.
2. Fortsett deretter med neste avgrensede prefiks-/canonical-opprydding for gjenværende `Unknown emne_ids`, prioritert etter flest forekomster og lavest semantisk risiko.
