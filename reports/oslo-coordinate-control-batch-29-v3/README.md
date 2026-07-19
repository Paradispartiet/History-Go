# Oslo koordinatkontroll – batch 29 v3

Dato: 2026-07-19

Denne batchen erstatter den lukkede metodeblandede PR #2459 og følger adresse-først-regelen konsekvent.

| placeId | resultat | beslutning |
|---|---|---|
| `kulturkirken_jakob_litteratur` | verified | Hausmanns gate 14 ga ett entydig Geonorge-treff. |
| `norli_universitetsgata` | needs_review | Offisiell adresse er 22–24; 22 og 24 gir to separate kandidater, så ingen velges vilkårlig. |
| `sigrid_undset_statue` | needs_review | Identitet og 1991 er dokumentert, men eksakt sokkelpunkt mangler. |
| `ruth_maier_minne` | verified | Snublestein.no dokumenterer Dalsbergstien 3; adressen ga ett entydig Geonorge-treff. |
| `alf_proysen_statue_nittedal` | moved + needs_review | Flyttet til Akershus/Nittedal; Flammen-adressen er kun foreløpig host/site-anchor. |
| `proysenhuset_rudshogda` | moved + verified | Flyttet til Innlandet/Ringsaker; Prestvegen 1 ga ett entydig Geonorge-treff. |
| `inger_hagerups_plass` | needs_review | Stedsidentitet og navn fra 1999 dokumentert, men ingen legitim adresse-/geometrianker er valgt. |

## Address-finder evidence

Alle Geonorge-oppslag ligger i `reports/oslo-coordinate-control-batch-29-v3/address-results/` og ble lagret direkte fra repoets `address-first-coordinate-finder`.

## Metodisk avgrensning

Ingen OSM- eller Wikidata-koordinater er brukt som erstatning for manglende adresseanker. Tre Oslo-steder forblir eksplisitt ikke-verifiserte, og Alf Prøysen-monumentets Flammen-punkt er markert som foreløpig host/site-anchor.
