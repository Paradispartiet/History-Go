# Oslo coordinate control batch 121 – sport main

## Verified
- `bislett_stadion` → `osm-way:115277337`
- `ullevaal_stadion` → `osm-way:43222619`
- `intility_arena` → `osm-way:443983964`
- `jordal_amfi` → `osm-way:760875553`
- `holmenkollen_nasjonalanlegg` → `osm-way:81300521`
- `frogner_stadion` → `osm-way:4272321`
- `valle_hovin_stadion` → `osm-way:1528387076`
- `ekebergsletta` → `osm-relation:15951742`
- `vallhall_arena` → `osm-way:50634101`
- `manglerudhallen` → `osm-way:176303011`
- `furuset_forum` → `osm-way:131269106`

## Completed without approved coordinate
- `daelenenga_idrettspark` → needs_review / needs_source
- `gressbanen` → needs_review / needs_source
- `kfum_arena` → needs_review / needs_source
- `nordre_aasen_idrettspark` → needs_review / needs_source

Frogner stadion accepts the exact named pitch polygon because that polygon is the canonical stadium playing surface. Holmenkollen nasjonalanlegg uses the exact aggregate landuse=winter_sports polygon, not an individual ski jump. No nearest/first-hit selection is used.

Replay note: validated payload copied from commit `4a05cc98487c19215670d5f13d50285bd15f09d7` after a byte-for-byte fresh-main guard against source base `b0e4227557591cec48f53dcdd4eb98a0d61af072`. Shared runtime and protocol outputs are regenerated on current main.
