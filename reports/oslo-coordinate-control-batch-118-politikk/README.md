# Oslo coordinate control batch 118 – politikk

## Verified
- `stortinget` → `osm-way:29132806`
- `youngstorget` → `osm-relation:12773689`
- `oslo_radhus` → `osm-way:24900009`
- `eidsvolls_plass` → `osm-way:841080897`
- `hoyesteretts_hus` → `osm-way:65071968`
- `politihuset_gronland` → `osm-way:557060199`
- `folkets_hus_oslo` → `osm-way:112233121`

## Completed without approved coordinate
- `regjeringskvartalet` → needs_review / needs_source

Youngstorget uses the full named pedestrian-square relation rather than a same-name road segment. All bounded candidate sets are stored in this report directory. No nearest/first-hit selection is used.

## Address-first correction

Den opprinnelige batch-kjøringen gikk direkte til OSM for konkrete adressebare bygg. Dette er korrigert mot den låste coordinate policyen: Geonorge Adresser API er forsøkt først for Stortinget, Oslo rådhus, Høyesteretts hus, Politihuset på Grønland og Folkets Hus i Oslo. Entydige adressepunkter brukes som primær koordinatkilde; OSM-geometri beholdes bare som dokumentert fallback etter et faktisk ikke-feilende Geonorge-resultat uten anvendbart treff. Tekniske Geonorge-feil blokkerer kjøringen og kan ikke legitimere fallback. Youngstorget og Eidsvolls plass forblir geometriankre, og Regjeringskvartalet forblir needs_review.

- Geonorge primary: stortinget, oslo_radhus, hoyesteretts_hus, politihuset_gronland, folkets_hus_oslo
- OSM fallback etter dokumentert ikke-feilende adresseforsøk: ingen
