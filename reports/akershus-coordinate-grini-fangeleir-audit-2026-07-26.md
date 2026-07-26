# Grini fangeleir – koordinat- og avgrensningsaudit

Dato: 2026-07-26  
Place ID: `grini_fangeleir`  
Canonical fil: `data/places/historie/akershus/grini_fangeleir.json`

## Resultat

Ingen koordinat eller radius endres.

Legacy-verdiene beholdes midlertidig:

- koordinat: `59.9565, 10.5909`
- radius: `240 m`
- status: `needs_manual_map_check`
- rolle: `provisional_area_anchor`

Auditen viser at tilgjengelige punkter representerer ulike fysiske og historiske objekter. Ingen av dem kan uten videre brukes som sentrum for den historiske fangeleiren.

## Historisk sted

MiA dokumenterer at Grini fangeleir først tok i bruk den nesten ferdige fengselsbygningen på Ila. Da fangetallet steg, ble skogen rundt ryddet og leiren utvidet med mer enn 30 brakker for innkvartering, verksteder, sykesaler og andre funksjoner.

Den historiske leiren var dermed et sammensatt område med blant annet:

- hovedbygning og celleavdeling
- stor appellplass
- brakker
- verksteder og sykesaler
- kjøkken, vaskeri og lagerfunksjoner
- jordbruks- og ytre leirfunksjoner

Et enkelt museums-, adresse- eller navnepunkt kan ikke representere hele denne strukturen uten dokumentert avledning.

## Dagens museum

Grinimuseet ligger i Jøssingveien 31. OSM node `5446566958` gir et museumspunkt ved omtrent:

`59.95579, 10.58470`

Punktet ligger omtrent `354,1 m` vest for legacy-markøren.

MiA opplyser at museet holder til i en autentisk fangebrakke som står like utenfor den opprinnelige leirplassen. Museumspunktet er derfor et godt fremtidig besøksanker, men et dårlig canonical sentrum for den historiske leiren.

## Historisk entitetspunkt

Wikidata `Q637411` oppgir omtrent:

`59.9534333333, 10.5825472222`

Dette ligger:

- omtrent `576,7 m` fra legacy-markøren
- omtrent `288,2 m` fra museumspunktet

Koordinatutsagnet har ingen kilde eller dokumentert avledning fra leirkartet. Det lagres derfor som kandidat, ikke som produksjonsfasit.

## Avvist kandidat

Et OSM-basert søkeresultat knytter Grini fangeleir til node `6465581140` ved omtrent `59.9495, 10.62951`.

Objektet er klassifisert som gård/lokalitet og ligger klart øst for det dokumenterte Ila/Grini-området. Det avvises eksplisitt som feil objekt og feil plassering.

## Historisk kart

Et historisk leirkart viser hovedbygningen, appellplassen, brakkene, verksteder, gårder og perimeterfunksjoner. Et sammenligningskart mot dagens terreng viser at leiren omfattet et betydelig større og mer sammensatt område enn dagens museum.

Kartene er nyttige for identitet og avgrensning, men er ikke georeferert produksjonsgeometri.

## Blokkering

Før coordinate production kreves:

1. georeferering av et autoritativt historisk leirkart mot dagens Ila-område
2. sikker identifikasjon av hovedbygningen og appellplassen
3. dokumentert utstrekning for den utvidede brakkeleiren
4. kontroll mot bevarte opprinnelige elementer
5. valg av historisk områdeanker med radiusbegrunnelse
6. separat besøksanker for Grinimuseet

## Beslutning

`coordinateDecision`:

`needs_georeferenced_historical_camp_geometry`

`evidenceStatus`:

`candidate_sources_collected`

Canonical-punktet er fortsatt provisorisk og skal ikke tolkes som leirgrense, fengselsområde, eiendomsgrense eller verneområde.

## Lagret materiale

- `data/coordinate-evidence/akershus/historie/grini_fangeleir.json`
- `reports/akershus-coordinate-grini-fangeleir-source-probe/source-summary.json`
- denne rapporten
