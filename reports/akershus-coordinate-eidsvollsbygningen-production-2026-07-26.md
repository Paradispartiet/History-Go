# Eidsvollsbygningen – produksjonsrapport for koordinat

Dato: 2026-07-26  
Place ID: `eidsvollsbygningen`  
Canonical fil: `data/places/politikk/akershus/eidsvollsbygningen/eidsvollsbygningen.json`

## Resultat

Eidsvollsbygningen flyttes fra et feilplassert legacy-punkt til selve den navngitte historiske bygningen:

- tidligere koordinat: `60.33056, 11.26139`
- anvendt koordinat: `60.30079, 11.17098`
- forskyvning: omtrent `5 978,6 m`
- radius: `260 m`
- koordinatstatus: `verified_geometry`
- rolle: `building_anchor`
- kildeobjekt: `osm-way:125813296`

Legacy-punktet lå omtrent 5,98 kilometer nordøst for Eidsvollsbygningen og representerte verken grunnlovsbygningen, museumsanlegget eller det nære Eidsvoll Verk-miljøet.

## Anvendt bygningsobjekt

OpenStreetMap way `125813296` er en navngitt bygningspolygon for Eidsvollsbygningen, merket som:

- `building=civic`
- `historic=building`
- `wikidata=Q4584720`

Det publiserte representasjonspunktet `60.30079, 11.17098` anvendes som canonical bygningsanker.

Rå nodeliste for polygonen ble ikke lagret i denne produksjonen. Beslutningen bygger derfor på det stabile, navngitte bygningsobjektet og det publiserte representasjonspunktet, kontrollert mot uavhengige identitets- og koordinatkilder.

## Uavhengig koordinatkontroll

Wikidata `Q4584720` identifiserer Eidsvollsbygningen og oppgir:

`60.30083333333333, 11.17083333333333`

Dette ligger omtrent `9,4 m` fra det anvendte OSM-punktet.

Wikidata kobler også bygningen til Kulturminne-ID `146171`, som samsvarer med Riksantikvarens Eidsvollsbygningen-objekt.

## Offisiell identitet og vernekontekst

Eidsvoll 1814 identifiserer Eidsvollsbygningen som huset der Grunnloven ble skrevet og vedtatt i 1814. Den offisielle besøkssiden oppgir `Carsten Ankers veg 17, 2074 Eidsvoll Verk`.

Riksantikvaren beskriver Eidsvollsbygningen som det sentrale fredede bygningsobjektet og opplyser at også parken og paviljongene rundt bygningen er fredet. Dette gir følgende representasjonsmodell:

1. canonical-punktet følger selve hovedbygningen
2. gameplay-radiusen dekker bygningen og det nærmeste museums- og minnesmerkeanlegget
3. radiusen er ikke den juridiske fredningsgrensen
4. det større industri- og kulturlandskapet behandles separat i `eidsvoll_verk_andelva`

## Avvist navnelik kandidat

OSM node `4909601826` har også navnet Eidsvollsbygningen, men er klassifisert som `tourism=information`.

Punktet ligger ved:

`60.29632, 11.18918`

Dette er omtrent `1 119,2 m` øst-sørøst for hovedbygningen. Objektet er et informasjonsskilt og avvises eksplisitt som canonical kandidat.

## Radius

Radius `260 m` beholdes. Fra hovedbygningen dekker den det nærmeste anlegget med park, paviljonger, besøksfunksjoner og øvrige museumsbygg.

Radiusen skal ikke tolkes som:

- fredningsgrense
- eiendomsgrense
- bygningspolygon
- Eidsvoll Verk-industrilandskapet
- geometrisk sentrum for hele anlegget langs Andelva

## Innholdsavgrensning

Canonical er tydelig avgrenset til Eidsvollsbygningen som:

- Riksforsamlingens møte- og arbeidssted
- stedet der Grunnloven ble vedtatt
- stedet for kongevalget i mai 1814
- et privat hovedhus som midlertidig ble politisk institusjon
- kjernen i et senere nasjonalmonument

Det større verk-, industri- og vannkraftlandskapet ligger i den separate posten `eidsvoll_verk_andelva`.

## Lagret materiale

- `data/coordinate-evidence/akershus/politikk/eidsvollsbygningen.json`
- `reports/akershus-coordinate-eidsvollsbygningen-source-probe/source-summary.json`
- denne produksjonsrapporten

## Produksjonsomfang

Endringen består av:

- flyttet canonical koordinat
- beholdt radius med ny begrunnelse
- Coordinate Source Contract
- Coordinate Evidence
- kildeoppsummering
- utvidet steds- og quiztekst

Ingen runtime-, people-, category-, workflow- eller generert indeksfil skal ligge i sluttdiffen.
