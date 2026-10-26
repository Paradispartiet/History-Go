# Statsvitenskap – gap-audit, første kildeetappe (2026-10-21)

Denne etappen viderefører designvedtaket fra 16. september 2026. Ingen ny fagdisiplin, bokdrevet kapittelstruktur eller runtime-sidekanal er opprettet.

## Kildekontroll

- **12 bøker** registrert etter designdokumentet: 8 hovedverk, 1 debattverk, 3 utsatte støtteverk.
- Collier og Waldner er kontrollert mot forlagenes publiseringsopplysninger og eksakte kapittelbidrag. Begge er fra 2026.
- Collier: skille mellom opphavsmann, redaktør og medforfattere i de relevante kapitlene.
- Waldner: forlagets kapitler 3 og 4 er lokalisert, men bare publiserte sammendrag er vurdert. Ikke fulltekstverifisert.
- De andre ti bøkene er foreløpig kun overført fra vedtatt design; bibliografi og kapitler skal kildekontrolleres før eventuell promotering.

## Resultat av foreløpig deduplisering

Eksisterende Politikk-fagverk inneholder 13 domener og 71 metoder. Følgende reelle, navngitte metode-ID-er er funnet i den kanoniske metodelisten:

- `met_pol_politisk_begrepsanalyse`: Colliers begrepsstrekk og målevaliditet peker mot mulig **berikelse** av eksisterende metode, ikke ny metode.
- `met_pol_komparativt_forskningsdesign`: Colliers typologier **utsettes** til full sammenligning med begrepsregisteret.
- `met_pol_prosessporing`: Waldners invariante mekanismer og hendelseshistoriske kart peker mot mulig **berikelse** av eksisterende metode. Kapitlene må undersøkes i fulltekst før videreføring.

Totalt fem avgrensede kandidatposter: fire foreløpig `enrich_existing`, én `defer`, **null publiserte claims**, **null nye kanoniske metode-ID-er**.

## Neste grense

Neste PR skal kontrollere øvrig kildebibliografi, fulltekst og eksisterende begrepsregister før noen kandidat kan gå fra `source_layer_only` til publiserbar fagtekst, claim eller vurdering. Særlig debattverket *How States Think* krever eksplisitte konkurrerende forklaringer.
