# Oslo coordinate control batch 96 – art queue tail

Closes the final two records in `places_kunst.json`.

- `emanuel_vigeland_mausoleum`: exact named OSM node 974731248 fetched directly from the OSM API; official museum address used as identity cross-check; Wikidata removed as coordinate source.
- `framtidsbiblioteket_nordmarka`: explicit Visit Norway visitor coordinate 59°59′10.8″N 10°41′48.7″E, converted directly to decimal degrees.

The raw OSM node response is persisted in this report directory. No nearest/first-hit coordinate selection is used.
