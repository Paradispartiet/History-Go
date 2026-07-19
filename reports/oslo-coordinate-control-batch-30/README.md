# Oslo coordinate control batch 30

Dato: 2026-07-19

Batch 30 avslutter de to siste ukontrollerte Oslo-litteraturrecordene.

## Resultat

- `oscar_braaten_statuen` → **verified_geometry** på eksakt OSM artwork-node `10819902960`. Identiteten er korrigert til Oskar Braaten-bysten ved Beierbrua, og årstallet til 1961.
- `alexander_kiellands_plass` → **verified_geometry** på OSM park-way `3610607`, som dekker parken innenfor Oslo kommunes dokumenterte gateavgrensning. Navneåret er korrigert fra 1913 til 1914.

Kartverket SSR ga ingen treff for noen av navnene, og Geonorge-adressefinder ga ingen treff for Alexander Kiellands plass. Ingen naboadresse eller proxy ble brukt.

Begge faktiske markørflyttinger skal gjennom visuell kart-QA før merge.

Før kart-QA repareres den eksisterende canonical/split-driften tapsfritt: berikelsen fra `nasjonalbiblioteket` og den nyere koordinatverifikasjonen for `deichman_grunerlokka` løftes tilbake inn i canonical aggregate før regenerering.

Lossless canonical reconciliation triggered as the sole temporary workflow before final visual QA.
