# History GO — stedstandard

Status: **canonical produktstandard for et History GO-sted**  
Eier: `place_product_standard`  
Sist kontrollert: **2026-07-28**

Dette dokumentet definerer **hva et History GO-sted er og hvilke produktflater et rikt sted kan ha**.

Den konkrete arbeidsrekkefølgen for å ferdigstille ett sted ligger i:

- `docs/PLACE_PRODUCTION_CHECKLIST.md`

Bindende nabokontrakter:

- `docs/FACTUALITY_CONTRACT.md`
- `docs/DATA_PRODUCTION_CONTRACT.md`
- `data/places/README_place_rounds.md`
- `docs/PLACE_POPUP_SYSTEM.md`
- `docs/coordinates/coordinate-source-contract-v1.md`
- `docs/people-of-places-method.md`
- `docs/COMPLETION_DEFINITIONS.md`
- `docs/PROGRESSION_MODEL.md`

History GO-stedet er navet mellom kart, PlaceCard, fagverk, popupkunnskap, samleobjekter, handlinger, mennesker, quiz, ruter og progresjon.

---

## 1. Grunnmodell

Ett fysisk/historisk objekt skal ha ett canonical place-object.

Harde regler:

1. Place-ID er unik.
2. Canonical source er manifest-loadet.
3. `category` er én canonical primærkategori.
4. Tverrfaglighet uttrykkes gjennom eide koblingssystemer, ikke dupliserte places.
5. Koordinatet skal representere det faktiske History GO-objektet etter Coordinate Source Contract.
6. Brukerrettede fakta er source-led.
7. Genererte indekser er build-output og håndredigeres ikke.

---

## 2. Minimum place-object

Et kart-/basissted trenger minst:

```js
{
  id,
  name,
  lat,
  lon,
  category,
  desc
}
```

Dette gjør ikke automatisk stedet innholdsmessig ferdig.

---

## 3. Felter et rikt sted kan bruke

Felt brukes når de er relevante og dokumenterte — ikke for completeness.

```js
{
  id,
  name,
  lat,
  lon,
  r,
  category,
  underbadge_ids,
  year,
  desc,
  popupDesc,
  image,
  cardImage,
  frontImage,
  emne_ids,
  rounds,
  spatial_profile,
  temporal_profile,
  subplaces,
  history_layers,
  nature_profile,
  source_summary,
  people_ids,
  related_place_ids,
  route_ids,
  tags,
  source_notes
}
```

Canonical data kan også ligge i tilknyttede systemer i stedet for inne i place-recorden: People, Works, Brands, Stories, Leksikon, Før/etter, Lesespor, quiz, observations, routes, events og På stedet-profiler.

---

## 4. De tre brukerrettede stedflatene

Stedsarkitekturen har tre tydelige roller.

### Rundinger

Visuelle samlinger av identifiserbare ting med bilder.

Canonical palett:

```text
Badges
People
Works
Objects
Details
Spots
Nature
Brands
```

Et ferdig sted viser nøyaktig **4 eller 6** rundinger. Badges er obligatorisk.

### På stedet

Hva som skjer eller kan gjøres ved stedet:

- Events
- Møter / Social Meet
- Kunnskapsmøte / Spotmeeting
- Oppgaver
- Trening
- Lek

Quiz, Observer, Notat og Rute kan ha egne handlingsflows.

### Stedspopup

Kunnskapssiden med fanene:

```text
Om
Historie
Fortellinger
Før/etter
Nyheter
Lesespor
Kilder
Mer
```

Disse tre flatene skal ikke blandes sammen for å fylle UI.

---

## 5. PlaceCard

PlaceCard er det kompakte kontrollrommet for stedet.

Det skal kunne vise:

- navn og kategori;
- korrekt stedbilde;
- kort stedstekst;
- 4 eller 6 canonical rundinger;
- På stedet-flaten;
- relevante handlingsknapper;
- favoritt/status etter eksisterende runtime.

Kunnskapsartikler skal ikke presses inn i PlaceCard; de hører i stedspopupen.

---

## 6. Badges og fagverk

`category` er primær fag-/badgeidentitet.

`underbadge_ids` brukes for canonical underbadges.

Badges-rundingen er obligatorisk og skal åpne:

```text
fagverk-sted.html?place=<place_id>
```

Fagverksiden skal forstå stedet gjennom canonical kategori/emner og skal ikke kreve en parallell place-record.

---

## 7. Rundinger

Canonical kontrakt eies av `data/places/README_place_rounds.md`.

Regler:

- nøyaktig 4 eller 6;
- `badges` alltid med;
- alle valgte rundinger er stedsspesifikke;
- alle valgte rundinger er bildeklare;
- Nature er valgfri;
- Brands betyr bedrifter og kjente merker knyttet til stedet;
- Civication er ikke egen runding;
- Wonderkammer er ikke egen runding;
- Leksikon, Fortellinger og Før/etter er popupkunnskap;
- Tasks/Training/Play er På stedet;
- sportshendelser, rekorder og mesterskap er kunnskap/historie, ikke Sports-runding;
- `rounds` er presentasjonskuratering, ikke fagklassifisering.

Den konkrete kategori→rundingmatrisen og ferdigchecken ligger i `PLACE_PRODUCTION_CHECKLIST.md`.

---

## 8. Tekststandard

### `desc`

Kort og presis inngang som svarer:

1. Hva er stedet?
2. Hvorfor er det relevant i History GO?

### `popupDesc`

Lengre kildebelagt forklaring av stedets historiske/faglige betydning og observerbare egenart.

Regler:

- ingen fakta fra gjetning;
- ingen generisk turisttekst som skjuler hva place-recorden faktisk representerer;
- ikke dupliser Leksikon/Stories ordrett;
- stedsspesifisitet foran generell kategoriinformasjon.

---

## 9. Strukturerte place-profiler

### `spatial_profile`

Kildebelagte mål og fysisk form. Gameplay-radius `r` er ikke areal.

### `temporal_profile`

Få tydelige hovedmilepæler når ett `year` ikke er nok. Detaljert chronology hører i Historie.

### `subplaces`

Fysiske deler/soner under hovedstedet. Et subplace blir ikke automatisk et nytt canonical Place og kan være source for Spots.

### `history_layers`

Kort historisk lagdeling til Historie-fanen.

### `nature_profile`

Landskap, naturtype, habitat, sesong og observerbare naturtrekk til Om. Dette er ikke automatisk Nature-runding.

### `source_summary`

Brukerrettede sikre kilder til Kilder-fanen; interne audits skal ikke lekke hit.

---

## 10. Stedstyper og researchprioritet

Typeprofil er researchguide, ikke krav om kunstig feltdekning.

| Stedstype | Viktige spørsmål |
| --- | --- |
| Park / grøntområde | areal, topografi, geologi, delsteder, landskap, historiske lag, natur |
| Gate / vei / allé | start/slutt, lengde, segmenter, kryss, adresser, infrastruktur, navnehistorie |
| Bygning | arkitekt, byggeår, stil, materialer, konstruksjon, høyde, etasjer, bruk, vern |
| Torg / plass / byrom | avgrensning, areal, fasader, monumenter, bruk, ombygging |
| Elv / bekk / innsjø / kyst | lengde/vannflate, kilde/utløp, natur, regulering, industri, restaurering |
| Rute / sti | start/slutt, lengde, etapper, høydeprofil, underlag, sesong, sikkerhet |
| Institusjon / anlegg | grunnlagt, funksjon, bygninger, samlinger, saler, aktører, milepæler |
| Kulturminne / monument / kunstverk | opphavsperson, år, materiale, mål, motiv, plassering, vern |
| Arkeologisk / historisk lokalitet | datering, synlige strukturer, funn, undersøkelser, vern |
| Bydel / strøk / område | avgrensning, delområder, hovedakser, landskap, utviklingsfaser, møteplasser |
| Idrettsanlegg | åpning, kapasitet, banemål, konstruksjon, hjemmebrukere, historiske hendelser |
| Industrielt / teknisk sted | funksjon, driftsperiode, maskiner, energi, størrelse, råvarer, transport, gjenbruk |

---

## 11. People

People-koblinger følger `docs/people-of-places-method.md`.

Et rikt sted bør undersøkes for relevante:

- grunnleggere/initiativtakere;
- arkitekter/kunstnere/skapere;
- eiere/ledere;
- beboere/arbeidende;
- utøvere/forskere/politikere/aktivister med særskilt dokumentert forbindelse;
- eponymer/minnepersoner.

En kjent person med svak forbindelse er dårligere enn ingen People-kobling.

---

## 12. Works, Objects, Details og Spots

### Works

Selvstendige skapte verk med dokumentert stedskobling.

### Objects

Fysiske identifiserbare ting: artefakter, funn, maskiner, kjøretøy, instrumenter, drakter, produkter, dokumentobjekter osv.

### Details

Små fysiske ting brukeren kan oppdage: skilt, symboler, inskripsjoner, ornamenter, skadespor og andre konkrete detaljer.

### Spots

Fysiske delpunkter: rom, porter, tårn, broer, scener, tribuner, tunneler, bunkere, utsiktspunkter osv.

Alle er visuelle samletyper og skal ha bildeklart innhold når de velges som runding.

---

## 13. Nature

Nature-rundingen brukes bare når stedet har dokumenterte naturentiteter/fenomener som gir selvstendig samleverdi.

Det er ikke nok at stedet står ute eller har et tre i nærheten.

Minneskilt, plaketter, bygg og urbane steder skal ikke få Nature som filler.

`nature_profile` i Om og Nature-rundingen er to forskjellige roller.

---

## 14. Brands

Brands beholder eksisterende datamodell og betydning:

> **bedrifter og kjente merker med dokumentert kobling til stedet**

Brands er ikke generell aktørkategori og skal ikke brukes som restplass for klubber, institusjoner, skilt eller objekter.

Eksisterende canonical Brands skal gjenbrukes.

---

## 15. Wonderkammer og Civication

Wonderkammer er legacy-migreringsgrunnlag, ikke ny produksjonsmodell eller runding.

Legacy entries flyttes etter faktisk type til Objects, Details, Spots, People, Works, Nature, På stedet, relations/NextUp, Historie eller Stories.

Civication Store er eget spillsystem, ikke en runding. Et Store-element kan også være et Object når det er en virkelig fysisk, stedsspesifikk og visuelt kvalifisert ting.

---

## 16. Quiz og handlinger

Et sted bør vurderes for faktisk spillhandling, men handling skal være relevant og trygg.

Quiz skal være source-led og stedsspesifikk.

`tasks_profile`, `training_profile` og `play_profile` presenteres under På stedet når de passer.

Quiz, Observer, Notat og Rute er egne flows og skal ikke gjøres til rundinger.

---

## 17. Ruter, Nearby og NextUp

Et sted kan inngå i ruter og anbefalingsflyt når koblingen faktisk gir mening.

Kontroller:

- route-ID/stopp;
- relations/related place;
- Nearby-presentasjon;
- søk/aliaser;
- at NextUp peker til et faglig/geografisk meningsfullt neste steg.

Ikke opprett koblinger bare for completeness.

Søk/aliaser og i18n skal også kontrolleres når stedets datasett bruker dette.

### Offentlig hjemsted

Et place kan brukes som offentlig hjemsted bare når det er et eksisterende canonical History GO-sted, ikke er en privat adresse, har egnet koordinat/radius og følger eksisterende privacy-/synlighetsmodell. Dette vurderes per sted og kan være N/A.

---

## 18. Social Meet / Spotmeeting

Et sted kan være kontekst for sosial flyt bare gjennom eksisterende privacy- og sikkerhetsgrenser.

Steddata skal ikke introdusere live-posisjon, nearby people, offentlig besøkshistorikk eller andre nye eksponeringsflater.

---

## 19. Modenhetsnivåer

| Nivå | Navn | Kjennetegn |
| --- | --- | --- |
| 0 | Stub | referanse/ufullstendig objekt |
| 1 | Basis | identitet + koordinat + kategori + korttekst |
| 2 | Presentabelt | god PlaceCard/popup og korrekt bilde der tilgjengelig |
| 3 | Spillbart | minst én reell handling/læringsflow + eksisterende progresjonskobling |
| 4 | Rikt | relevante samlinger, kunnskapsfaner, fagkoblinger og relasjoner |
| 5 | Kampanje | aktiv rolle i rute/kampanjeflyt |
| 6 | Premium | helhetlig, kildebelagt, visuelt og spillmessig rikt sted uten kunstig filler |

Modenhet er ikke faktaverifikasjon. Et rikt feltsett med svake kilder er ikke et ferdig sted.

---

## 20. Ferdigdefinisjon

Et sted er ferdig i sted-for-sted-produksjonen når:

- canonical identitet/source er avklart;
- faktapåstander er kildekontrollert;
- koordinatet er riktig representasjon;
- kategori/badges/fagverk er riktig;
- PlaceCard har korrekt tekst/bilde;
- alle åtte popupfaner er vurdert;
- nøyaktig 4 eller 6 bildeklare rundinger er kuratert;
- På stedet og øvrige handlinger er vurdert;
- People/Works/Brands/relations/Leksikon og legacy Wonderkammer er vurdert;
- relevante bilder er identitetskontrollert;
- data/UI/referanser/CI er kontrollert;
- PR-en gjelder dette stedet og er merget.

Den bindende, kopierbare sluttlisten er:

- `docs/PLACE_PRODUCTION_CHECKLIST.md`

> **Et History GO-sted er ikke ferdig fordi det har mange felt. Det er ferdig når hele den relevante stedsflaten er kontrollert, alt publisert innhold er dokumenterbart, og ingenting er fylt kunstig bare for å se komplett ut.**
