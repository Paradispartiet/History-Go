# Oslo koordinatkontroll – batch 18

Dato: 2026-07-19

Sju kontroller fra Oslo-køen er fullført. Fem canonical Oslo-steder er godkjent. Legacy-recorden `akerhus_slott` er dokumentert som duplikat av `akershus_festning`, og `grini_fangeleir` er flyttet fra Oslo-kilden til Akershus/Bærum uten at den eldre koordinaten ble godkjent.

| placeId | resultat | kilde / beslutning |
|---|---|---|
| `middelalder_oslo` | verified_geometry | `oslo-kommune:kultureiendom:middelalderparken` |
| `gamlebyen_gravlund` | verified_geometry | `oslo-kommune:gravplass:gamlebyen` |
| `akerhus_slott` | needs_review | legacy-typofeil for `akershus_festning` |
| `akershus_festning` | verified_geometry | `forsvarsbygg:akershus-festning` |
| `var_frelsers_gravlund` | verified_geometry | `oslo-kommune:gravplass:var-frelsers` |
| `hovedoya_kloster` | verified_geometry | `osm-way:457724681`; hovedpunkt flyttet til ruinområdet |
| `grini_fangeleir` | needs_review; moved to Akershus/Bærum | feil fylkeskilde rettet; koordinat beholdt uverifisert |

## Viktige avgjørelser

- Gravlunder behandles som områder; besøksadresser brukes ikke som kunstige sentrumspunkter.
- `akerhus_slott` får ikke egen koordinatgodkjenning fordi repoets tidligere canonical-audit dokumenterer ID-en som en legacy-typofeil.
- Hovedøya kloster flyttes fra det gamle feilplasserte punktet til OSM-geometrien for selve klosterruinen.
- Grini flyttes organisatorisk til Akershus/Bærum, men museumsadressen Jøssingveien 31 brukes bare som identitetskontroll, ikke som leirsentrum.
