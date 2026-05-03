# Place coordinate source fixes — by batch 2

Generert: 2026-05-03

## Omfang
- Vurdert fil: `data/places/by/oslo/places_by.json`
- Kandidatrapport: `reports/place-coordinate-source-candidates-by.json` og `.md`

## Resultat
- Vurderte steder: se kandidatrapporten (alle steder i by-filen).
- Rettede steder: **0**

## Hvorfor ingen auto-retting i denne batchen
- Eksisterende kandidater kommer fra Nominatim enkelttreff uten full fler-kilde-kryssjekk (SSR/Wikidata/offisiell kilde).
- Batchkravet sier at kun high-confidence med tydelig kildegrunnlag og uten konflikt skal apply-es.
- Flere by-steder er lineære/områder (gate/rute/byområde) som krever semantisk anchor-vurdering (P3), ikke punkt-autofiks.

## Ikke rettet (årsaker)
- P0/P1/P2/P3-kandidater er dokumentert i kandidatrapporten med avstand, confidence og reason.
- Alle kandidater er satt `approved=false` i denne batchen for å unngå lav-kvalitet apply uten full ekstern verifisering.

## Endringer i datafiler
- Ingen koordinatfelt i `data/places/by/oslo/places_by.json` ble endret i batch 2.
