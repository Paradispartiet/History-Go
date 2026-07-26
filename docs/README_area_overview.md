# History GO — Områdeoversikt

Status: **operational runtime guide**
Sist kontrollert: **2026-07-26**

Dette dokumentet beskriver den implementerte Område-flaten. Koden eier faktisk atferd; dokumentet skal korrigeres når runtime, lastrekkefølge eller offentlig API endres.

## Autoritetsrekkefølge

1. `js/ui/area-overview.js` eier basisstate, radiusvalg, avstandsindeks, kategorifilter, resultatlister og `window.HGAreaOverview`.
2. `js/ui/area-overview-scroll.js` bevarer leseposisjon ved rerender og laster V2-utvidelsen.
3. `js/ui/area-overview-v2.js` legger til geografisk oversikt, høydepunkter og read-only progresjon gjennom `window.HGAreaOverviewV2`.
4. `js/ui/place-card-status-surface.js` eier den aktive lastkjeden fra PlaceCard-utvidelsen.
5. `css/area-overview.css` og `css/area-overview-v2.css` eier presentasjonen.
6. `tests/area-overview-runtime.test.js` og `tests/area-overview-v2-runtime.test.js` eier de automatiserte regresjonseksemplene.

Ved konflikt gjelder runtime og testene.

## Produktmodell

Områdeoversikten sentreres alltid på et valgt canonical History GO-sted. Den oppretter ikke kommunesider, regionrecords eller en ny place-database.

Basisstate:

```text
centerPlaceId
radiusKm
categoryFilter
```

Koordinatene leses fra det valgte place-recordet. De lagres ikke som en parallell sannhetskilde.

Faste radiusvalg:

```text
2 km
5 km
20 km
50 km
100 km
```

Første åpning velger den minste radiusen som inneholder minst 24 andre brukbare steder. Hvis ingen radius når dette nivået, velges den minste radiusen som rommer de tilgjengelige resultatene, med 100 km som øvre grense.

## Datagrunnlag

Basisruntime leser `window.PLACES`, den samme aktive place-flaten som kartet bruker.

Et resultat må:

- ha canonical `id`;
- ha endelige `lat`- og `lon`/`lng`-verdier;
- ikke være `hidden`;
- ikke være `stub`;
- ikke være sentrumstedet;
- ligge høyst 100 km unna.

Avstand beregnes med `window.distMeters` når den finnes. Runtime har en Haversine-fallback for robusthet. Base place-data brukes til listevisning; full place-loading skjer først når et sted åpnes.

## Basisflate

`area-overview.js` implementerer:

- PlaceCard-handlingen **Område**;
- åpning og lukking av fullskjermsflaten;
- radiusfilter;
- dynamisk kategorifilter;
- avstandsbånd;
- paginert/utvidbar visning av store bånd;
- navigasjon tilbake til kart og valgt sted.

Avstandsbåndene er:

| Avstand | Etikett |
| --- | --- |
| 0–2 km | Rett rundt stedet |
| 2–5 km | I nærheten |
| 5–20 km | En liten tur unna |
| 20–50 km | Utforsk regionen |
| 50–100 km | Større område |

Bare bånd med resultater innen aktiv radius vises.

## V2-utvidelse

`area-overview-v2.js` dekorerer den eksisterende flaten. Den erstatter ikke basisstate eller avstandsindeksen.

V2 legger til:

- et SVG-basert geografisk oversiktsplot;
- en knapp som åpner området på hovedkartet;
- kuraterte høydepunkter rangert etter bilde, beskrivelse, relasjoner, struktur og avstand;
- read-only progresjon for besøkte steder, quizstatus og favoritter gjennom `HGProfileProgressReader`.

V2 skriver ingen besøks-, quiz-, favoritt- eller area-state. `updateProfile` eller andre write-kontrakter eies ikke av Område-flaten.

## Navigasjonskontrakt

Når et resultat velges:

1. Område-flaten lukkes.
2. `HGMapView.openPlace(placeId)` brukes når den er tilgjengelig.
3. Eksisterende kartflyt flytter kartet.
4. PlaceCard åpnes gjennom kartets eksisterende ferdigstillelsesløp.

Direkte `openPlaceCard()` brukes bare som siste fallback når kartadapterne ikke finnes. Nye area-spesifikke kart- eller PlaceCard-timere skal ikke opprettes.

## Offentlig API

```js
HGAreaOverview.open({ centerPlaceId: "stensparken", radiusKm: 5 });
HGAreaOverview.close();
HGAreaOverview.setRadius(20);
HGAreaOverview.getState();
HGAreaOverview.distanceKm(placeA, placeB);
HGAreaOverview.buildDistanceIndex(centerPlace);
```

V2 eksponerer read-only hjelpefunksjoner gjennom `HGAreaOverviewV2`, blant annet modellbygging, progresjonslesing, highlight-ranking, projeksjon og åpning på hovedkartet.

## Lastkjede

```text
place-card-status-surface.js
→ area-overview.js
→ area-overview-scroll.js
→ area-overview-v2.js
```

V2-stilarket lastes av V2-runtime. Det skal ikke legges inn en parallell boot-path i `index.html` uten at denne kjeden samtidig konsolideres.

## Validering

```bash
node tests/area-overview-runtime.test.js
node tests/area-overview-v2-runtime.test.js
```

Manuell QA bør minst dekke et tett Oslo-sted, et Etne-sted, et spredt land-/fjellsted, alle radiusvalg, kategorifilter, scrollbevaring og kartretur.

## Avgrensninger

Områdeoversikten har ingen egen URL-/history-state, ingen kommunegeometri og ingen separat area-manifest. Nye people-, routes-, badges- eller naturmoduler skal lese den samme area-modellen fremfor å opprette parallelle geografiske spørringer.
