# Eidsvoll Verk / Andelva – produksjonsrapport for koordinat

Dato: 2026-07-26  
Place ID: `eidsvoll_verk_andelva`  
Canonical fil: `data/places/naeringsliv/akershus/eidsvoll_verk_andelva/eidsvoll_verk_andelva.json`

## Resultat

Posten flyttes fra et feilplassert legacy-punkt til det sentrale jernverks- og vannkraftmiljøet ved Andelva:

- tidligere koordinat: `60.3297, 11.2575`
- anvendt koordinat: `60.30153, 11.1709`
- forskyvning: omtrent `5 705,5 m`
- tidligere radius: `300 m`
- ny radius: `360 m`
- status: `verified`
- rolle: `industrial_landscape_anchor`
- hovedkildeobjekt: `osm-node:4909468088`

## Representasjonsmodell

Posten representerer ikke ett enkelt bygg. Den representerer den sentrale historiske jernverks- og vannkraftkjernen med et sekundært anker langs Andelva.

Hovedankeret er det navngitte tolkningspunktet `Vannkraft – ren energi` ved:

`60.30153, 11.1709`

Punktet ligger:

- omtrent `82,4 m` fra Eidsvollsbygningen
- omtrent `186,2 m` fra tettstedspunktet Eidsvoll Verk
- i umiddelbar nærhet til Krutthuset og det tidligere verksområdet

Punktet velges fordi temaet og plasseringen samsvarer med canonical-postens industrielle og hydrologiske identitet. Det er ikke et tilfeldig tettstedspunkt eller en gjenbruk av Eidsvollsbygningen.

## Sekundæranker langs Andelva

Det navngitte tolkningspunktet `Langs Andelva`, OSM node `4909468099`, legges inn ved:

`60.30129, 11.17689`

Det ligger omtrent `331,1 m` øst for hovedankeret og utvider posten fra den tidligere jernverkskjernen inn i den industrielle elvekorridoren.

Radiusen økes fra 300 til 360 meter slik at begge ankerpunktene ligger i den sentrale gameplay-sonen.

## Historisk identitet

Eidsvoll 1814 dokumenterer at Eidsvoll Jernverk ble etablert i 1624 ved Andelva. Elva leverte energi til foredling og senere til flere produksjonsfunksjoner. Under Carsten Anker ble verket modernisert, og Eidsvoll fungerte i økende grad som foredlingsverk for råjern fra Feiring.

Det historiske komplekset besto av mer enn tretti bruksbygninger og boliger, blant annet:

- smier
- hammerbygninger
- køllagre
- boder
- masovn
- sagbruk
- mølle
- valseverk

Krutthuset er den eneste gjenværende bygningen fra selve Eidsvold Jernværk. Slagghauger, elveløp, historiske kart og øvrige kulturspor viser at industrimiljøet var langt større enn det som er synlig i dag.

## Avgrensning mot Eidsvollsbygningen

Eidsvollsbygningen har en separat canonical post med bygningsanker ved `60.30079, 11.17098`.

Avstanden mellom de to canonical-ankrene er omtrent `82,4 m`, men rollene er forskjellige:

- `eidsvollsbygningen`: den historiske hovedbygningen og politiske arenaen
- `eidsvoll_verk_andelva`: industri-, energi- og arbeidslandskapet rundt Andelva

Den korte fysiske avstanden er derfor ikke en duplikatfeil, men uttrykker at politikk og industri var del av samme historiske eiendom med ulike funksjoner.

## Avvist tettstedspunkt

OSM node `6236538566` representerer tettstedet Eidsvoll Verk ved omtrent `60.30204, 11.16768`.

Punktet brukes som lokalitetskontroll, men avvises som canonical fordi det er et bredt bosettingspunkt og ikke stedsspesifikt for det historiske jernverket eller Andelva-landskapet.

## Radius og begrensninger

Radius `360 m` dekker:

- hovedankeret i den tidligere industrikjernen
- Krutthuset og nærmeste historiske miljø
- Eidsvollsbygningen som fysisk nabokontekst uten å overta dens canonical rolle
- sekundærankeret `Langs Andelva`

Radiusen er ikke:

- juridisk fredningsgrense
- eiendomsgrense
- full historisk jernverksutstrekning
- tettstedsgrense
- representasjon av hele Andelvas 15,5 kilometer lange løp

## Lagret materiale

- `data/coordinate-evidence/akershus/naeringsliv/eidsvoll_verk_andelva.json`
- `reports/akershus-coordinate-eidsvoll-verk-andelva-source-probe/source-summary.json`
- denne produksjonsrapporten

## Produksjonsomfang

Endringen består av:

- flyttet canonical koordinat
- økt radius fra 300 til 360 meter
- hovedanker og sekundæranker
- Coordinate Source Contract
- Coordinate Evidence
- kildeoppsummering
- utvidet steds- og quiztekst

Ingen generert indeks-, runtime-, people-, workflow- eller kategori-fil skal ligge i sluttdiffen.
