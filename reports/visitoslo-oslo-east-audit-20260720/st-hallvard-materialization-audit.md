# St. Hallvard kirke og kloster — materialization audit

Date: 2026-07-20

- Place id: `st_hallvard_kirke_kloster`
- Record present in aggregate source: **true**
- Aggregate source listed in place manifest: **true**
- Present in generated runtime index: **false**

## Data files containing the id

- data/Civication/historyPeople_index.json
- data/people/by/oslo/st_hallvard_kirke_kloster/kjell_lund.json
- data/people/by/oslo/st_hallvard_kirke_kloster/nils_slaatto.json
- data/people/historie/oslo/st_hallvard_kirke_kloster/johan_castricum.json
- data/people/manifest.json
- data/places/historie/oslo/places_historie_added_batch_01.json
- data/places/historie/oslo/places_historie_atlas_obscura_bygdoy_batch_05.json

## Known control-file probes

- data/places/split-manifest.json: exists=false, containsId=false
- data/places/split_manifest.json: exists=false, containsId=false
- data/places/places_split_manifest.json: exists=false, containsId=false
- data/places/disabled.json: exists=false, containsId=false
- data/places/disabled_places.json: exists=false, containsId=false
- data/places/disabled-place-ids.json: exists=false, containsId=false
- data/places/places_disabled.json: exists=false, containsId=false

## Conclusion

The canonical source record is active at the manifest level but is excluded from the generated runtime index. The next debugging step is to inspect the index builder's disabled-place and split-source filtering logic rather than creating a duplicate place.
