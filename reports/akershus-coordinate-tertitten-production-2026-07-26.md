# Tertitten / Urskog-Hølandsbanen – produksjonsrapport for koordinat

Dato: 2026-07-26  
Place ID: `tertitten_urskog_holandsbanen`  
Canonical fil: `data/places/by/akershus/tertitten_urskog_holandsbanen/tertitten_urskog_holandsbanen.json`

## Resultat

Tertitten beholder eksisterende koordinat og radius:

- koordinat: `59.98628, 11.24367`
- radius: `260 m`
- koordinatendring: `0 m`
- status: `verified`
- rolle: `museum_railway_visitor_anchor`
- kildeobjekt: `osm-node:6593405621`

Legacy-punktet samsvarer eksakt med det navngitte museumsobjektet for Urskog-Hølandsbanen. Produksjonsendringen formaliserer derfor et allerede korrekt punkt fremfor å flytte det.

## Anvendt objekt

OpenStreetMap node `6593405621` er navngitt `Urskog-Hølandsbanen`, klassifisert som museum og ligger ved:

`59.98628, 11.24367`

Punktet representerer:

- museumsområdet på Sørumsand
- stasjons- og avgangsmiljøet
- verkstedet
- spor og rullende materiell
- den fysiske besøksinngangen til Tertitten

MiA bekrefter besøksadressen `Sørumsandvegen 70, 1920 Sørumsand`.

## Avgrensning mot stasjon og trase

Et separat OSM-objekt, node `5148364154`, representerer museumsstasjonen `Urskog-Hølandsbanen (Tertitten)`. Det behandles som en operativ del av museumsområdet og overtar ikke canonical-punktet.

Ordinær Sørumsand stasjon på Kongsvingerbanen ligger ved omtrent:

`59.98588, 11.24104`

Dette er omtrent `152,9 m` vest for museumsankeret. Nærheten dokumenterer det historiske overgangs- og transportknutepunktet, men hovedlinjestasjonen er ikke Tertitten.

## Historisk trase

MiA dokumenterer at Urskog-Hølandsbanen:

- ble åpnet etappevis fra 1896
- fikk forbindelse inn til Sørumsand i 1903
- hadde sporvidde `750 mm`
- fraktet både passasjerer og gods
- var i ordinær drift til 1. juli 1960
- i dag har `3,6 km` i museumsdrift

Canonical-punktet representerer ikke hele den opprinnelige linjen til Skulerud og heller ikke alle 3,6 kilometer av dagens museumsbane. Traseen er lineær historisk kontekst.

## Radius

Radius `260 m` beholdes fordi den dekker det sentrale museums-, stasjons- og verkstedsmiljøet og den nære forbindelsen til ordinær Sørumsand stasjon.

Radiusen er ikke:

- den historiske jernbanetraseen
- den nåværende museumsbanens fullstendige utstrekning
- jernbaneteknisk sikkerhetssone
- fredningsgrense
- eiendomsgrense

## Innholdsavgrensning

Teksten er utvidet slik at Tertitten behandles som et komplett transportsystem, ikke bare som damptognostalgi. Formidlingen omfatter:

- smalspor og teknisk standard
- passasjer- og godstransport
- forbindelsen til Kongsvingerbanen og Haldenkanalen
- stasjon, verksted, spor og rullende materiell
- frivillig bevaringsarbeid og levende museumsdrift

## Lagret materiale

- `data/coordinate-evidence/akershus/by/tertitten_urskog_holandsbanen.json`
- `reports/akershus-coordinate-tertitten-source-probe/source-summary.json`
- denne produksjonsrapporten

## Produksjonsomfang

Endringen består av:

- beholdt canonical koordinat og radius
- Coordinate Source Contract
- Coordinate Evidence
- kildeoppsummering
- utvidet steds- og quiztekst

Ingen generert indeks-, runtime-, workflow-, people- eller kategorifil skal ligge i sluttdiffen.
