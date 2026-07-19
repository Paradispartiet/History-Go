# Oslo koordinatkontroll – batch 21

Dato: 2026-07-19

Batch 21 starter den sekundære Oslo-kildekøen. Køkriteriet er manifeststier i leksikografisk rekkefølge, bevart record-ordre i hvert manifest og skip av tidligere kontrollerte placeId-er. Sju kontroller er fullført.

| placeId | resultat | kilde / avgjørelse |
|---|---|---|
| `ekebergparken` | verified_geometry | `ekebergparken:official-map` |
| `ibsen_quotes` | needs_review | mangler rutegeometri/flerankre |
| `camilla_collett_statue` | verified_geometry | `osm-node:7573449468` |
| `henrik_wergeland_statue` | verified_geometry | `wikimedia-commons:oslo-museum-ob-a17403` |
| `grotta` | verified | `geonorge-adresser-v1:0301:18496:4` |
| `eldorado_bokhandel` | verified | `geonorge-adresser-v1:0301:17635:9A` |
| `gamle_deichman` | verified | `geonorge-adresser-v1:0301:10244:4` |

## Viktige avgjørelser

- Ekebergparken behandles som et utstrakt område, ikke som museum-/adressepunkt.
- Ibsen-sitatene er en distribuert installasjon med 69 sitater langs to gater og kan ikke verifiseres av ett enkelt punkt.
- Camilla Collett- og Henrik Wergeland-monumentene flyttes til dokumenterte objektposisjoner.
- Grotten, Eldorado og Gamle Deichman er kjørt adresse-first; bare entydige finder-resultater er anvendt.
