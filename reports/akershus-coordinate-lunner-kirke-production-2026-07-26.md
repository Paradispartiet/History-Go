# Lunner kirke – produksjonsrapport for koordinat

Dato: 2026-07-26  
Place ID: `lunner_kirke`  
Canonical fil: `data/places/historie/akershus/places_historie_akershus_batch4/lunner_kirke.json`

## Resultat

Lunner kirke flyttes fra et feilplassert legacy-punkt til den navngitte middelalderkirken:

- tidligere koordinat: `60.2939, 10.5866`
- anvendt koordinat: `60.30747, 10.55713`
- forskyvning: omtrent `2 216,5 m`
- radius: `260 m`
- status: `verified_geometry`
- rolle: `building_anchor`
- kildeobjekt: `osm-way:557779765`

Legacy-punktet lå omtrent 2,22 kilometer sørøst for kirkebygningen og representerte verken kirken eller kirkegården.

## Anvendt bygningsobjekt

OpenStreetMap way `557779765` er den navngitte bygningsgeometrien for Lunner kirke og har representasjonspunkt omtrent:

`60.30747, 10.55713`

Objektet er klassifisert som kirke og gudshus og er koblet til Wikidata `Q6514433`.

Rå nodeliste for polygonen er ikke lagret i denne produksjonen. Det publiserte bygningspunktet brukes derfor som stabil building anchor, kontrollert mot offisiell kirkeside og kulturminneidentitet.

## Offisiell adresse og historie

Lunner kirkelige fellesråd oppgir besøksadressen:

`Kjørkevegen 125, 2730 Lunner`

Fellesrådets historiske materiale beskriver en liten middelalderkirke i stein, trolig fra midten av 1100-tallet. Kirken ble senere utvidet i tømmer og fikk korskirkeform i 1780-årene.

Kulturminne-ID `84342` brukes som uavhengig identitetskontroll.

## Avviste nabopunkter

To nærliggende objekter skal ikke forveksles med kirken:

- `osm-node:5379128398` – Lunner kirkestue, et separat bygg øst for kirken
- `osm-node:10992715759` – en elektrisk transformatorstasjon med et tilsvarende kirkenavn

Ingen av disse brukes som canonical koordinat.

## Pilegrimskontekst

Lunner kirke brukes fortsatt som utgangspunkt for pilegrimsvandringer mot Granavollen. Dette bekrefter kirkens rolle i et større regionalt ferdsels- og kirkesystem.

Canonical-punktet følger likevel selve kirkebygningen. Pilegrimsleden er en lineær forbindelse og skal ikke tolkes som dekket av punktets radius.

## Radius

Radius `260 m` beholdes for:

- kirkebygningen
- kirkegården
- det nære middelalderske kirkestedet
- den umiddelbare pilegrims- og kulturlandskapskonteksten

Radiusen er ikke:

- fredningsgrense
- eiendomsgrense
- kirkegårdspolygon
- pilegrimsrute
- avgrensning av hele Hadelands kulturlandskap

## Lagret materiale

- `data/coordinate-evidence/akershus/historie/lunner_kirke.json`
- `reports/akershus-coordinate-lunner-kirke-source-probe/source-summary.json`
- denne produksjonsrapporten

## Produksjonsomfang

Endringen består av:

- flyttet canonical koordinat
- beholdt radius med dokumentert begrunnelse
- Coordinate Source Contract
- Coordinate Evidence
- kildeoppsummering
- utvidet steds- og quiztekst

Ingen generert indeks-, runtime-, workflow-, people- eller kategorifil skal ligge i sluttdiffen.
