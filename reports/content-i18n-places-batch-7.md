# Content i18n places batch 7

## Status

Kort oppsummering:

- Data-only translation batch.
- 20 placeIds translated to en/es/pt.
- Priority: Oslo nature/route places first, then next visible Oslo knowledge/media/civic places where Oslo nature candidates were exhausted.
- No runtime changes.
- No UI dictionary changes.
- No canonical place-data changes.
- No places_index regeneration.

## Scope

Files changed:

- `data/i18n/content/places/en.json`
- `data/i18n/content/places/es.json`
- `data/i18n/content/places/pt.json`
- `reports/content-i18n-places-batch-7.md`

## Selection method

The 20 ids were selected from canonical ids in `data/places/manifest.json` source files, then compared against `data/i18n/content/places/en.json`, `data/i18n/content/places/es.json` and `data/i18n/content/places/pt.json`.

Selection prioritized Oslo nature/route source files. The main Akerselva, Alnaelva, Alna, Bygdøy and Oslo nature hub files were already translated in all three languages, so the batch used the remaining untranslated Oslo salamander-pond nature file first. The remaining slots were filled with next visible Oslo science/nature-knowledge, media and civic places that had direct visible `name`, `desc` and `popupDesc` fields.

Already translated ids, stale translation-only ids, non-manifest ids and entries without direct visible canonical fields were excluded.

## Source placeIds

| placeId | Canonical source file | Selection reason | Fields translated |
|---|---|---|---|
| `bygdoy_kongsgard_salamanderdam` | `data/places/natur/oslo/places_oslo_natur_salamanderdammer.json` | Oslo nature; remaining untranslated salamander pond | `name`, `desc`, `popupDesc` |
| `bantjern_salamanderlokalitet` | `data/places/natur/oslo/places_oslo_natur_salamanderdammer.json` | Oslo nature; remaining untranslated salamander site | `name`, `desc`, `popupDesc` |
| `tjernsmyr_salamanderlokalitet` | `data/places/natur/oslo/places_oslo_natur_salamanderdammer.json` | Oslo nature; remaining untranslated wetland/amphibian site | `name`, `desc`, `popupDesc` |
| `blindern_forskningsparken_salamanderdam` | `data/places/natur/oslo/places_oslo_natur_salamanderdammer.json` | Oslo nature; remaining untranslated urban amphibian pond | `name`, `desc`, `popupDesc` |
| `naturhistorisk_museum` | `data/places/vitenskap/oslo/places_vitenskap.json` | Oslo science/nature-knowledge place | `name`, `desc`, `popupDesc` |
| `botanisk_hage` | `data/places/vitenskap/oslo/places_vitenskap.json` | Oslo science/nature-knowledge place | `name`, `desc`, `popupDesc` |
| `forskningsparken` | `data/places/vitenskap/oslo/places_vitenskap.json` | Oslo visible knowledge place | `name`, `desc`, `popupDesc` |
| `meteorologisk_institutt` | `data/places/vitenskap/oslo/places_vitenskap.json` | Oslo science/nature-data place | `name`, `desc`, `popupDesc` |
| `universitetet_i_oslo_blindern` | `data/places/vitenskap/oslo/places_vitenskap.json` | Oslo visible knowledge place | `name`, `desc`, `popupDesc` |
| `teknisk_museum` | `data/places/vitenskap/oslo/places_vitenskap.json` | Oslo science/history place | `name`, `desc`, `popupDesc` |
| `rikshospitalet` | `data/places/vitenskap/oslo/places_vitenskap.json` | Oslo science/medical knowledge place | `name`, `desc`, `popupDesc` |
| `radiumhospitalet` | `data/places/vitenskap/oslo/places_vitenskap.json` | Oslo science/medical knowledge place | `name`, `desc`, `popupDesc` |
| `oslo_met_pilestredet` | `data/places/vitenskap/oslo/places_vitenskap.json` | Oslo visible knowledge place | `name`, `desc`, `popupDesc` |
| `arkitektur_og_designhogskolen` | `data/places/vitenskap/oslo/places_vitenskap.json` | Oslo visible knowledge place | `name`, `desc`, `popupDesc` |
| `bi_nydalen` | `data/places/vitenskap/oslo/places_vitenskap.json` | Oslo visible knowledge place | `name`, `desc`, `popupDesc` |
| `nrk_huset_marienlyst` | `data/places/media/oslo/places_oslo_media.json` | Oslo visible media/culture place | `name`, `desc`, `popupDesc` |
| `aftenposten_akersgata` | `data/places/media/oslo/places_oslo_media.json` | Oslo visible media/history place | `name`, `desc`, `popupDesc` |
| `dagbladet_akersgata` | `data/places/media/oslo/places_oslo_media.json` | Oslo visible media/history place | `name`, `desc`, `popupDesc` |
| `klassekampen_redaksjon` | `data/places/media/oslo/places_oslo_media.json` | Oslo visible media/history place | `name`, `desc`, `popupDesc` |
| `hoyesteretts_hus` | `data/places/politikk/oslo/places_politikk.json` | Oslo visible civic/history place | `name`, `desc`, `popupDesc` |

## Skipped candidates

| placeId | Reason skipped |
|---|---|
| `frysjadammen` | already translated |
| `alnsjoen_alna_kilde` | already translated |
| `alnaelva` | already translated |
| `bygdoy_kongeskogen` | already translated |
| `ostensjovannet` | already translated |
| `ljanselva` | already translated |

## Translation summary

| Language | File | Entries before | Entries after | Added entries |
|---|---|---:|---:|---:|
| English | `data/i18n/content/places/en.json` | 488 canonical / 494 total | 508 canonical / 514 total | 20 |
| Spanish | `data/i18n/content/places/es.json` | 488 canonical / 494 total | 508 canonical / 514 total | 20 |
| Portuguese | `data/i18n/content/places/pt.json` | 488 canonical / 494 total | 508 canonical / 514 total | 20 |

## Added translations

| placeId | en | es | pt | Notes |
|---|---|---|---|---|
| `bygdoy_kongsgard_salamanderdam` | Bygdøy Kongsgård salamander pond | Estanque de salamandras de Bygdøy Kongsgård | Lagoa de salamandras de Bygdøy Kongsgård | Salamander pond |
| `bantjern_salamanderlokalitet` | Båntjern salamander site | Lugar de salamandras de Båntjern | Local de salamandras de Båntjern | Amphibian site |
| `tjernsmyr_salamanderlokalitet` | Tjernsmyr salamander site | Lugar de salamandras de Tjernsmyr | Local de salamandras de Tjernsmyr | Wetland |
| `blindern_forskningsparken_salamanderdam` | Blindern/Forskningsparken salamander pond | Estanque de salamandras de Blindern/Forskningsparken | Lagoa de salamandras de Blindern/Forskningsparken | Urban pond |
| `naturhistorisk_museum` | Natural History Museum | Museo de Historia Natural | Museu de História Natural | Nature science |
| `botanisk_hage` | Botanical Garden | Jardín Botánico | Jardim Botânico | Plants |
| `forskningsparken` | Forskningsparken | Forskningsparken | Forskningsparken | Knowledge cluster |
| `meteorologisk_institutt` | Norwegian Meteorological Institute | Instituto Meteorológico de Noruega | Instituto Meteorológico da Noruega | Weather/climate data |
| `universitetet_i_oslo_blindern` | University of Oslo, Blindern | Universidad de Oslo, Blindern | Universidade de Oslo, Blindern | Campus |
| `teknisk_museum` | Norwegian Museum of Science and Technology | Museo Noruego de Ciencia y Tecnología | Museu Norueguês de Ciência e Tecnologia | Technology/science |
| `rikshospitalet` | Rikshospitalet | Rikshospitalet | Rikshospitalet | Medical research |
| `radiumhospitalet` | Radiumhospitalet | Radiumhospitalet | Radiumhospitalet | Oncology |
| `oslo_met_pilestredet` | OsloMet, Pilestredet | OsloMet, Pilestredet | OsloMet, Pilestredet | Applied research |
| `arkitektur_og_designhogskolen` | Oslo School of Architecture and Design | Escuela de Arquitectura y Diseño de Oslo | Escola de Arquitetura e Design de Oslo | Built environment |
| `bi_nydalen` | BI in Nydalen | BI en Nydalen | BI em Nydalen | Social science |
| `nrk_huset_marienlyst` | The NRK building at Marienlyst | El edificio de NRK en Marienlyst | O edifício da NRK em Marienlyst | Broadcasting |
| `aftenposten_akersgata` | Aftenposten in Akersgata | Aftenposten en Akersgata | Aftenposten em Akersgata | Press history |
| `dagbladet_akersgata` | Dagbladet in Akersgata | Dagbladet en Akersgata | Dagbladet em Akersgata | Press history |
| `klassekampen_redaksjon` | The Klassekampen editorial office (Hausmanns gate) | Redacción de Klassekampen (Hausmanns gate) | Redação do Klassekampen (Hausmanns gate) | Editorial history |
| `hoyesteretts_hus` | The Supreme Court building | El edificio del Tribunal Supremo | O edifício do Supremo Tribunal | Civic history |

## Fields translated

| placeId | name | desc | popupDesc | Other fields |
|---|---:|---:|---:|---|
| `bygdoy_kongsgard_salamanderdam` | yes | yes | yes | none |
| `bantjern_salamanderlokalitet` | yes | yes | yes | none |
| `tjernsmyr_salamanderlokalitet` | yes | yes | yes | none |
| `blindern_forskningsparken_salamanderdam` | yes | yes | yes | none |
| `naturhistorisk_museum` | yes | yes | yes | none |
| `botanisk_hage` | yes | yes | yes | none |
| `forskningsparken` | yes | yes | yes | none |
| `meteorologisk_institutt` | yes | yes | yes | none |
| `universitetet_i_oslo_blindern` | yes | yes | yes | none |
| `teknisk_museum` | yes | yes | yes | none |
| `rikshospitalet` | yes | yes | yes | none |
| `radiumhospitalet` | yes | yes | yes | none |
| `oslo_met_pilestredet` | yes | yes | yes | none |
| `arkitektur_og_designhogskolen` | yes | yes | yes | none |
| `bi_nydalen` | yes | yes | yes | none |
| `nrk_huset_marienlyst` | yes | yes | yes | none |
| `aftenposten_akersgata` | yes | yes | yes | none |
| `dagbladet_akersgata` | yes | yes | yes | none |
| `klassekampen_redaksjon` | yes | yes | yes | none |
| `hoyesteretts_hus` | yes | yes | yes | none |

## Quality checks

- JSON parse result: `place content json ok`.
- Selected ids present in all three files: `selected place translations ok`.
- No empty values among new entries: covered by selected-id check.
- No missing selected ids: covered by selected-id check.
- No runtime files changed: `git diff -- js` produced no diff.
- No UI dictionaries changed: `git diff -- data/i18n/ui` produced no diff.
- No canonical place data changed: `git diff -- data/places` produced no diff.
- No places_index regeneration: `git diff -- data/places/places_index.json` produced no diff.

## Known non-goals

- No stale id cleanup.
- No nested `for_na`, `works`, `tasks_profile`, `leksikon`.
- No quiz/people/story/Civication translations.
- No `places_index.json` regeneration.

## Recommended next batch

`Content i18n batch 8 — translate next visible Oslo/Østlandet places to en/es/pt`

## Validation

Commands run:

```sh
node -e "for (const f of ['data/i18n/content/places/en.json','data/i18n/content/places/es.json','data/i18n/content/places/pt.json']) JSON.parse(require('fs').readFileSync(f,'utf8')); console.log('place content json ok')"
```

```sh
node - <<'NODE'
// selected-id coverage and empty-string check from batch instructions
NODE
```

```sh
git diff -- data/i18n/ui
git diff -- js
git diff -- data/places
git diff -- data/places/places_index.json
git diff --check
npm run i18n:places:audit
```

The broad `npm run i18n:places:audit` may continue to report unrelated missing/stale/extra ids outside this controlled batch.

## Final note

No runtime files changed. No UI dictionaries changed. No canonical place data changed. No places_index regeneration.
