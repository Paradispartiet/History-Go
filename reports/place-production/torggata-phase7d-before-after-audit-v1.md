# Torggata – fase 7D Før/etter audit V1

- Dato: 2026-08-11
- Place ID: `torggata`
- Canonical place: `data/places/by/oslo/places/torggata.json`
- Popupkontrakt: `docs/PLACE_POPUP_SYSTEM.md`
- Fase-7-audit: `reports/place-production/torggata-phase7-popup-tabs-audit-v1.md`
- Baseline: 7C Fortellinger merget i PR #4824, merge `d07c55f1ec9b790bfa64b26cf7d3c87d3d4c7771`
- Status: **KLAR FOR REVIEW**

## Tidligere-arbeid-gate

```text
TIDLIGERE-ARBEID-SØK: UTFØRT
TIDLIGERE GODKJENT 7D-PR/COMMIT: ingen funnet
EKSISTERENDE DATA: place.for_na finnes, men bruker interne History Go-/Wonderkammer-kilder og har ikke bildepar/attribusjon
BESLUTNING: RETROFIT – behold transformasjonsideen, bygg ekstern faktabasis og lisensiert bildepar, fjern udokumenterte kausalitetssprang
```

## Problem i legacy `for_na`

Det tidligere før/etter-sporet hadde en relevant hovedidé, men tre kontraktproblemer:

1. `sources` blandet Oslo byleksikon med `History Go stedsdata` og `History Go Wonderkammer`; interne produktdata kan ikke være selvstendig faktabevis.
2. `change` gikk fra fysisk oppgradering til påstander om leienivålogikk, symbolsk verdi, eiendomspress og hvem som får plass uten et inspectable evidensledd for akkurat disse påstandene.
3. Før/etter-fanen hadde ikke noe historisk/nyere bildepar med fotograf, lisens og kildeside.

## Ny faktabasis

Før/etter-teksten avgrenses til det eksterne kilder faktisk bærer:

- Oslo byleksikon – Torggata: gatehistorie, 2009-endringen og åpningen av ny gateutforming i 2014;
- Arkitektur skaper verdi – Torggata: bystyrevedtaket i 2010, gå-/sykkelprioritering og ombyggingsforløpet 2013–2014;
- Transportøkonomisk institutt: dokumenterte konflikter mellom gående og syklende etter ombyggingen.

`for_na.sources` inneholder nå bare inspectable HTTPS-URL-er til eksterne fakta- og bildekilder.

## Tekstlig avgrensning

Ny `before` beskriver overgangsfasen før den permanente 2013–2014-utformingen og bruker 2009/2010 som dokumenterte beslutnings- og inngrepspunkter.

Ny `now` brukes semantisk som **etter ombyggingen**, ikke som påstand om et 2026-fotografi. Den sier eksplisitt at etterbildet er fra 2017.

Ny `change` gjør den sentrale inferensgrensen synlig:

> Den sikreste dokumenterte endringen er trafikk- og byromsprofilen, ikke et bestemt leienivå eller en automatisk sosial effekt.

Deretter kobles ombyggingen til TØIs dokumenterte konflikt mellom gående og syklende. Dette viser en faktisk konsekvens uten å gjøre korrelasjon eller generell gentrifiseringsteori til lokal årsaksdokumentasjon.

## Bildepar

### Før

- fil: Wikimedia Commons `Torggata 2009-06-08.jpg`;
- dato: 2009-06-08;
- fotograf: Kjetil Ree;
- lisens: CC BY-SA 3.0;
- kamerastandpunkt: Youngstorget, 59.914563 / 10.748979, heading 225°;
- brukes som dokumentasjon av Torggata før ferdig 2013–2014-utforming.

### Etter

- fil: Wikimedia Commons `Torggata (2017-01-08).jpg`;
- dato: 2017-01-08;
- fotograf: Kjetil Ree;
- lisens: CC BY-SA 3.0;
- Commons-filen oppgir ikke et geokodet kamerastandpunkt;
- brukes som etterbilde av Torggata etter 2014-ombyggingen.

### Viktig begrensning

Dette er **ikke et eksakt re-fotograferingspar**. Bildene er tatt fra ulike kamerastandpunkter. Data og UI-labels sier derfor `Før ombyggingen (2009)` og `Etter ombyggingen (2017)`, og teksten ber brukeren sammenligne gateprofilen — ikke enkeltfasader eller piksel-for-piksel-endring.

Et perfekt samme-standpunkt-par skal ikke konstrueres eller påstås uten dokumentasjon.

## Observe / lookFor

Tre observasjoner beholdes, men omskrives til det bildene og den fysiske gata faktisk kan støtte:

1. kjøreareal, dekke og gang-/sykkelsoner;
2. hvordan varelevering/begrenset biladkomst må dele rom med gående og syklende;
3. eksplisitt påminnelse om at bildene har ulike kamerastandpunkter.

## Bevisst ikke gjort

- ingen endring i `desc` eller `popupDesc`;
- ingen endring i koordinater, anchors eller routeSegments;
- ingen endring i `spatial_profile`, `temporal_profile`, `subplaces`, `history_layers` eller `source_summary`;
- ingen Story-, Quiz-, People-, Brands-, Works- eller rundingsendring;
- ingen påstand om at 2017-bildet er «dagens Torggata»;
- ingen påstand om dokumentert leiepris-, fortrengnings- eller gentrifiseringseffekt bare fordi gaten ble fysisk oppgradert.

## Regresjonslås

`tests/place-card-for-na-torggata.test.js` låser nå:

1. ny tittel `Torggata før og etter ombyggingen`;
2. konkrete `before`, `now` og `change`;
3. kun inspectable HTTPS-kilder og ingen interne History Go-/Wonderkammer-kilder;
4. direkte Commons-media for begge bilder;
5. fotograf, lisens, kildeside og dato for begge;
6. eksplisitt kamerastandpunktbegrensning;
7. eksplisitt inferensgrense mot udokumentert leienivå/gentrifiseringskausalitet;
8. popupstøtte for bildeattribusjon og `Bildekilde ↗`.

7D settes først **GODKJENT** etter relevant CI, squash-merge og kontroll på faktisk `main`.
