# Religion place migration — Akershus

Dato: 2026-07-20

## Resultat

13 kirker og kirkesteder flyttes til primærbadge `religion` gjennom `data/places/category_overrides/akershus.json`.

Batchen omfatter:

- Tanum kirke
- Skedsmo kirke
- Asker kirke/kirkested
- Enebakk kirke
- Haslum kirke
- Kråkstad kirke og gravhaug
- Ski middelalderkirke
- Lunner kirke
- Nesodden kirke
- Sørum kirke
- Frogner gamle kirke
- Ullensaker kirke/kirkested
- Drøbak kirke

Drøbak kirke ble fanget opp i en senere tverrkategori-audit fordi canonical place-data ligger under `by` i stedet for `historie`. Kirken flyttes til Religion, mens ladesteds-, handels- og trelasthistorien beholdes i innholdslagene.

## Beholdes under Historie

`nes_kirkeruiner` flyttes ikke. Stedet er en ruin og et historisk/arkeologisk kulturminne, ikke et eksisterende kirkebygg.

Bygdetun, hovedgårder, boplasser og andre place-records som bare omtaler kirker eller kirkelig historie beholder sine eksisterende primærkategorier.

## Sammensatte steder

`krakstad_kirke_og_gravhaug` flyttes til Religion fordi selve kirken er place-objektets primære identitet. Gravhaugen og førkristne lag er viktige historiske dimensjoner, men beholdes som innholdslag i stedet for å styre primærbadgen.

## Prinsipp

Eksisterende kirkebygg og tydelige kirkesteder får Religion uansett hvilken eldre fagmappe canonical record ligger i. Ruiner og indirekte kirkehistoriske steder beholdes under Historie. Sammensatte steder vurderes etter hva place-objektet først og fremst representerer.
