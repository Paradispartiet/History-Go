# Oslo place audit – Batch 22: migrate em_nat prefix

## Scope

Batch 22 migrates only the two remaining legacy `em_nat_*` place references that were explicitly deferred from Batch 21:

- `em_nat_by_natur_motepunkt`
- `em_nat_okologi_grenser`

No `data/fag/**` canonical files, UI/CSS/HTML/JS files, or alias schema files are changed in this batch.

## Changed place files

- `data/places/natur/oslo/places_oslo_alna.json`
- `data/places/natur/oslo/places_oslo_natur_hovedsteder.json`

`places_index.json` was not changed because the index check reports that it is already in sync with source place files.

## Migration mapping

| Place | File | Legacy `em_nat_*` reference | Replacement `em_natur_*` reference | Rationale |
|---|---|---|---|---|
| `alnaelva` | `data/places/natur/oslo/places_oslo_alna.json` | `em_nat_by_natur_motepunkt` | `em_natur_urban_okologi_byrom` | Alnaelva is a byelv with urban nature, restoration and blue-green city ecology as the primary natur angle. |
| `gressholmen` | `data/places/natur/oslo/places_oslo_natur_hovedsteder.json` | `em_nat_by_natur_motepunkt` | `em_natur_kyst_okosystemer` | Gressholmen is an Oslofjord island with fjord nature, bird life, plant life and protected coastal ecology. |
| `gressholmen` | `data/places/natur/oslo/places_oslo_natur_hovedsteder.json` | `em_nat_okologi_grenser` | `em_natur_arter_habitat_mangfold` | The boundary/randsoner concern is represented through habitat, species and biodiversity for the island context. |
| `maerradalen` | `data/places/natur/oslo/places_oslo_natur_hovedsteder.json` | `em_nat_by_natur_motepunkt` | `em_natur_gronnstruktur_korridorer` | Mærradalen is a forested valley and stream corridor, so the green-structure corridor canonical target is the narrowest fit. |

## Post-migration status

`node tools/check_place_emne_ids.mjs` no longer reports either of the two Batch 22 `em_nat_*` IDs in Oslo natur place files. The remaining missing IDs are outside this batch scope and were not modified here.

`npm run places:index:check` reports `places_index.json` is in sync, so no index rebuild was required.
