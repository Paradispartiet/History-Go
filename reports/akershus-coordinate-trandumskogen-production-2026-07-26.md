# Trandumskogen – produksjonsrapport for koordinat

Dato: 2026-07-26  
Place ID: `trandumskogen`  
Canonical fil: `data/places/historie/akershus/places_historie_akershus_batch1/trandumskogen.json`

## Resultat

Trandumskogen beholder eksisterende koordinat og radius:

- breddegrad: `60.2189`
- lengdegrad: `11.1177`
- radius: `300 m`
- koordinatendring: `0 m`
- status: `verified`
- rolle: `memorial_site_anchor`
- kildeobjekt: `osm-node:8745441267`

Produksjonsendringen retter ikke et feilplassert punkt. Den formaliserer et punkt som allerede var korrekt, men som manglet kildeobjekt, rolle, presisjonsnivå og eksplisitt avgrensning.

## Anvendt objekt

Det navngitte Trandumskogen-objektet i OpenStreetMap er koblet til Wikidata `Q7833396` og ligger på nøyaktig samme koordinat som legacy-markøren: `60.2189, 11.1177`.

Punktet anvendes som områdeanker for:

- minnelunden og seremoniplassen
- de markerte tidligere gravstedene langs stien
- den sentrale besøksopplevelsen i Trandumskogen

Det anvendes ikke som påstått centroid for hele det fredede kulturmiljøet.

## Offisiell omfangskontroll

Riksantikvaren beskriver det fredede Trandumskogen-miljøet som:

- et avgrenset skogområde
- stridsvognskytebanen
- seremoniplassen

Ullensaker kommune beskriver parkeringsadkomst til minnelunden, gravene langs stien og sammenhengen mellom retterstedet, minnesmerkene og skytebanen.

Den navngitte stridsvognskytebanen, OpenStreetMap way `42996009`, har et publisert representasjonspunkt ved omtrent `60.2206, 11.1171`. Dette ligger omtrent `191,9 m` fra canonical-punktet og er dermed innenfor gameplay-radiusen på `300 m`.

Skytebanen er et historisk delobjekt og brukes som omfangskontroll. Den overtar ikke canonical-markøren.

## Visuell kontroll

Et historisk fotografi av gravområdet har opptaksposisjon `60.218861, 11.116944`, omtrent `42,0 m` fra markøren.

Fotokoordinaten brukes kun som visuell QA. Den er ikke kilde for produksjonskoordinaten.

## Radius

Radius `300 m` beholdes fordi den dekker:

- minnelunden og gravstien
- seremoniplassen
- den nærmeste dokumenterte skytebanekomponenten

Radiusen er ikke:

- juridisk fredningsgrense
- eiendomsgrense
- massegravpolygon
- arkeologisk sikringssone
- påstand om at hele Trandumskogen har sentrum i punktet

## Historisk innhold

Canonical-teksten er utvidet med den dokumenterte sammenhengen mellom:

- de 194 henrettede
- de 17 lokaliserte massegravene
- stridsvognskytebanens rolle i å kamuflere skyting
- minnesmerket fra 1954
- navnetavlen fra 1970
- fredningen i 2020

Formidlingen er holdt nøktern og stedsspesifikk. Skytebanen behandles som del av terrorens og hemmeligholdets fysiske landskap, ikke som en løsrevet militærattraksjon.

## Produksjonsomfang

Endringen består av:

- oppdatert canonical sted med Coordinate Source Contract
- ny Coordinate Evidence-fil
- lagret kildeoppsummering
- denne produksjonsrapporten

Ingen koordinat flyttes, og ingen juridisk geometri oppfinnes.
