# Kjeller flyplass – produksjonsrapport for koordinat

Dato: 2026-07-26  
Place ID: `kjeller_flyplass`  
Canonical fil: `data/places/by/akershus/kjeller_flyplass/kjeller_flyplass.json`

## Resultat

Kjeller flyplass beholder eksisterende avrundede koordinat og radius:

- canonical koordinat: `59.96944, 11.03889`
- Avinor AIP ENKJ ARP: `595810N 0110220E`
- desimalisert AIP-punkt: `59.96944444444445, 11.03888888888889`
- avstand mellom canonical og AIP-punkt: omtrent `0,5 m`
- radius: `360 m`
- status: `verified`
- rolle: `aerodrome_reference_point`
- kildeobjekt: `avinor-aip:ENKJ:ARP:595810N:0110220E`

Forskjellen på omtrent en halv meter skyldes avrunding og materialiseres ikke som unødvendige ekstra desimaler. Produksjonsendringen formaliserer et allerede riktig punkt med gjeldende luftfartsfaglig kilde og tydelig representasjonskontrakt.

## Offisielt referansepunkt

Avinors gjeldende AIP-side for ENKJ publiserer Aerodrome Reference Point som:

`595810N 0110220E`

ARP-et er et stabilt, operativt referansepunkt for flyplassen og brukes derfor foran generiske kartpunkter, rullebanemidtpunkt, hangarbygg eller et tilfeldig besøkssted.

Luftfartstilsynet fører ENKJ Kjeller airport i sin flyplassoversikt med Kjeller Aero Senter AS som operatør. Operatøren publiserer en avrundet flyplassposisjon som samsvarer med Avinor-punktet.

## Rullebane og områdeskala

Kjeller Aero Senter oppgir rullebane `12/30` med dimensjonene:

- lengde: `1 357 m`
- bredde: `30 m`

Den beholdte radiusen på `360 m` kan derfor ikke representere hele rullebanen, flyplassområdet eller det samlede historiske kulturmiljøet.

Radiusen brukes kun som sentral display- og gameplay-sone rundt det offisielle ARP-et.

## Historisk og teknologisk identitet

Kjeller skal formidles som et sammensatt luftfarts-, forsvars- og teknologimiljø med kontinuitet fra 1912. Stedets historie omfatter ikke bare flyging, men også:

- hangarer og bakkeinfrastruktur
- verksteder, kontroll og vedlikehold
- militær organisasjon og logistikk
- forskning, instrumentering og teknologiutvikling
- okkupasjonshistorie og etterkrigstid
- konflikter mellom kulturmiljø, drift og framtidig arealbruk

Canonical-punktet er det offisielle flyplassreferansepunktet, ikke et påstått sentrum for alle disse fysiske og historiske lagene.

## Kulturmiljøkontekst

Riksantikvaren beskriver Kjeller som et verdifullt kulturmiljø for luftfarts-, teknologi-, forsvars- og sikkerhetspolitisk historie, med spor som gjør utviklingen fra 1912 lesbar.

Den anvendte nettsiden om fredningsprosessen er merket avsluttet. Den brukes derfor som dokumentasjon av historisk betydning og vurdert områdeskala, ikke som påstand om at det foreligger et bestemt gjeldende endelig fredningsvedtak eller en anvendt fredningspolygon.

## Uavhengig kartkontroll

Wikidata `Q3356156` oppgir et Kjeller Airport-punkt ved omtrent:

`59.96930555555556, 11.03611111111111`

Dette ligger omtrent `155,3 m` vest for Avinors offisielle ARP. Punktet bekrefter flyplassidentiteten og den generelle plasseringen, men brukes ikke foran den gjeldende AIP-kilden.

## Radiusens begrensninger

Sirkelen på `360 m` er ikke:

- rullebanens geometri
- operativt manøvreringsområde
- flyplassgrense
- sikkerhetssone
- framtidig utviklingsområde
- eiendomsgrense
- juridisk kulturminne- eller fredningsavgrensning

Den viser kun det sentrale kartområdet rundt det offisielle flyplassreferansepunktet.

## Lagret materiale

- `data/coordinate-evidence/akershus/by/kjeller_flyplass.json`
- `reports/akershus-coordinate-kjeller-flyplass-source-probe/source-summary.json`
- denne produksjonsrapporten

## Produksjonsomfang

Endringen består av:

- beholdt canonical koordinat og radius
- Coordinate Source Contract basert på Avinor AIP
- Coordinate Evidence
- kildeoppsummering
- utvidet steds- og quiztekst

Ingen generert indeks-, runtime-, workflow-, people- eller kategorifil skal ligge i sluttdiffen.
