# Religion place migration — Agder

Dato: 2026-07-20

## Scope

Denne batchen flytter 42 tydelige kirke-/kyrkjesteder i Agder fra tidligere primærkategorier som `historie` og `by` til `religion` gjennom den eksplisitte kategori-override-listen.

Batchen dekker:

- 35 kirke-/kyrkjesteder fra historie-datasettet i Agder
- 7 byhistoriske kirke-/domkirkesteder

## Prinsipp

- Kirke-/kyrkjebygg og trossteder får `religion` som primærbadge.
- Historisk, arkitektonisk og lokalhistorisk betydning beholdes i beskrivelser, emner, quizprofiler og øvrige innholdslag.
- Ruiner, tidligere kirkebygg med ny hovedfunksjon og andre tvilstilfeller skal fortsatt vurderes separat.
- Ingen generell navnebasert runtime-regel er innført.

## Særskilt om eldre kirker

`bykle_gamle_kyrkje` og `sogne_gamle_kirke_kristiansand` flyttes som kirke-/trossteder, ikke fordi ordet «gamle» i seg selv gir Religion. Dersom et tidligere kirkebygg senere viser seg å være permanent omdefinert til en annen hovedfunksjon, skal det flyttes etter samme nåfunksjonsregel som Sofienberg kirke og Kulturkirken Jakob.

## Resultat

Etter denne batchen vil de registrerte Agder-kirkene i denne auditen vises og filtreres under Religion i appens runtime-kategori, selv om eldre source records fortsatt fysisk ligger i historiske/by-mapper frem til en senere strukturell filflytting.
