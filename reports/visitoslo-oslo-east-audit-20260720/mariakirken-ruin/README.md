# Mariakirken-ruinen — direkte offisielt objektintak

Dato: 2026-07-20

- Kandidat: `mariakirken_ruin_oslo`
- Riksantikvaren-feature: `42178`
- Offisielt navn: `Mariakirken kirkested`
- Kommune: `0301` Oslo
- Kulturminnesøk: lokalitet `42178`
- Geometri: `MultiPolygon`
- Geometrisk representasjonspunkt: `59.90346746534793, 10.762065934518056`
- Avstand til feature-feltets eget offisielle senterpunkt: `0 m` avrundet
- Koordinatstatus: `verified_geometry`
- Produksjonsgate: `ready_for_canonical_production`

Den endelige metoden bruker direkte oppslag på Riksantikvarens eksakte feature `42178`. Koordinaten er avledet fra den offisielle MultiPolygon-geometrien og kryssjekket mot feature-feltets eget `senterpunkt`, som sammenfaller med det avledede punktet.

Den automatiske duplikatgaten fant teksten «Mariakirken» i `granavollen_sosterkirkene`. Dette er en falsk positiv: recorden gjelder Søsterkirkene i Gran i Innlandet, der én av kirkene heter Mariakirken. Det finnes ingen canonical Mariakirken-ruin i Oslo. `middelalder_oslo` er et bredt områdeanker, mens `hallvardskirken_oslo` er en annen konkret kirkeruin.

Ingen parkcentroid, adresseproxy eller bred Middelalderbyen-markør brukes som coordinate source for Mariakirken.
