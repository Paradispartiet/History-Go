# History GO — canonical PlaceCard-rundinger

Status: **eneste autoritative rundingskontrakt**  
Eier: `place_rounds_contract`  
Runtime: `js/ui/place-rounds-visual-collections.js`  
Layout: `js/ui/place-rounds-fill-layout.js` og `css/place-rounds-fill-layout.css`  
Sted-for-sted arbeidsflyt: `docs/PLACE_PRODUCTION_CHECKLIST.md`  
Sist kontrollert: **2026-08-04**

Denne filen bestemmer hva som er en PlaceCard-runding, hvor rundingene plasseres, hvor mange som vises og hvilke profiler som brukes.

> **Rundingen er en visuell inngang. Previewet er for syns skyld og skal aldri filtrere eller redefinere innholdet bak.**

## 1. Fast geometri

Et PlaceCard viser alltid:

1. én Badges-runding øverst til høyre ved stedsoverskriften;
2. nøyaktig fire øvrige rundinger i et 2 × 2-felt til høyre for `frontImage`;
3. sju små stedspopup-SVG-er i et separat felt til høyre for de fire rundingene.

Badges-rundingen teller ikke som en av de fire rundingene i mediefeltet. PlaceCard har dermed fem synlige rundinger totalt.

Det finnes ikke en 3-, 6-, 9- eller 12-rundersvariant i mediefeltet.

## 2. Vanlige steder

Vanlige steder bruker dette faste oppsettet:

```text
badge ved overskriften: badges
rundinger ved frontImage: people · objects · brands · civication
```

- `badges` = Merker og inngang til stedets fagverkside;
- `people` = canonical personer med dokumentert stedstilknytning;
- `objects` = fysiske, identifiserbare gjenstander med dokumentert stedstilknytning;
- `brands` = selvstendige, sosialt gjenkjennelige identiteter med dokumentert stedskobling;
- `civication` = stedsspesifikke Civication-objekter og Store-innganger.

Vanlige steder skal aldri få naturkart, Flora eller Fauna som erstatning for den faste standardprofilen.

## 3. Natursteder

Canonical natursteder bruker dette faste oppsettet:

```text
badge ved overskriften: badges
rundinger ved frontImage: map · flora · fauna · civication
```

På natursteder erstatter Kart, Flora og Fauna People, Gjenstander og Brands. Civication beholdes som den fjerde visuelle inngangen.

### Kart på natursteder

`map` er et eget tur-/naturkart for naturstedet. Et generisk bykart eller History GOs hovedkart med mer zoom er ikke tilstrekkelig.

For norske natursteder er canonical førsteversjon:

1. Kartverkets `toporaster` WMTS som turkartgrunnlag;
2. Kartverkets Turrutebasen WMS som eget rutelag;
3. Miljødirektoratets Naturtyper på land (NiN) som valgfritt naturfaglig kartlag.

Runtime-eier er `js/ui/nature-detailed-map.js` gjennom `HGNatureDetailedMap`. Kartflaten skal aldri delegere til eller manipulere History GOs ordinære hovedkart.

Kartet skal ikke dikte opp manglende stier, ruter, turmål, vernegrenser eller artslokaliteter. Sensitive artsfunn skal ikke eksponeres med presisjon uten eksplisitt håndtering.

## 4. Hele canonical rundingspoolen

```text
badges
people
objects
brands
civication
map
flora
fauna
```

`badges` ligger ved overskriften. De øvrige profiltypene ligger i mediefeltet.

Følgende er uttrykkelig ikke PlaceCard-rundinger:

- `nature` som generisk samlerunding;
- `works` / Verk;
- `details` / Detaljer;
- `spots` / Punkter;
- Før/nå;
- Fortellinger/Stories;
- Leksikon;
- Lek;
- Trening;
- Oppgaver;
- Events;
- Quiz;
- Observer;
- Notat;
- Rute;
- Wonderkammer;
- de sju monokrome stedspopup-SVG-ene.

## 5. People er en inngang, ikke et filter

People-rundingen viser ett representativt portrett. Previewet bestemmer ikke hvem som finnes bak rundingen.

- alle canonical personer med gyldig stedstilknytning skal fortsatt kunne vises i People-popupen;
- ikke bruk `people_ids`, lokal kuratering eller previewvalg til å snevre inn popupinnholdet;
- verk hører under personen og skal ikke opprettes som egen PlaceCard-runding.

## 6. Gjenstander og Civication

`objects` er fysiske, identifiserbare ting med dokumentert stedstilknytning. Canonical felt for ny eller revidert produksjon er `place.objects`.

`civication` er inngangen til stedsspesifikke Civication-objekter og Store-funksjoner. En fysisk Civication-post kan også kvalifisere som Gjenstand når den faktisk oppfyller Objects-kontrakten, men samme innhold skal ikke dupliseres eller gis to ulike identiteter.

Civication-rundingen skal bruke eksisterende Civication-data og eksisterende åpnehandler. Den skal ikke produsere filler bare for å vise et bilde.

## 7. Brands

Canonical semantisk eier er `data/brands/brand_rules_v1_1.json`.

Brands betyr selvstendige, sosialt gjenkjennelige navn og identiteter med dokumentert stedskobling. Kommersielle og historiske selskaper, profesjonelle firmaer, serveringssteder, gallerier, venue-identiteter, institusjoner, legacy-navn og skiltidentiteter kan kvalifisere når Brand-reglene består. Det betyr at aktørtypen heller ikke er et avslag i seg selv.

Null treff i dagens Brand-register er ikke alene grunnlag for N/A. Kandidater skal vurderes etter identitets-, gjenkjennelses- og stedstilknytningskravene.

## 8. Flora og Fauna

Flora og Fauna skal bruke eksisterende canonical naturarter og place-level naturmapping. Ikke opprett parallelle artsregistre i PlaceCard.

Sensitive arter eller lokaliteter skal ikke få presis kartplassering bare for å fylle rundingsflaten.

## 9. Badges

Badges-rundingen står separat ved stedsoverskriften og åpner:

```text
fagverk-sted.html?place=<place_id>
```

Badges skal ikke dupliseres i 2 × 2-feltet.

## 10. Stedspopup-snarveiene

De sju SVG-snarveiene er ikke rundinger. `Om`-ikonet er fjernet. Om-fanen åpnes ved trykk på stedsnavnet eller infoteksten i PlaceCard.

Snarveikontrakten eies av `docs/PLACE_CARD_SHORTCUTS.md`.

## 11. Legacy `rounds`

`place.rounds`, `rundinger` og `rounds_exclude` er legacy presentasjonsgjeld. Nye og reviderte steder skal ikke bruke disse feltene til å finne opp egne rundingssett.

Runtime bruker én fast badge og to faste fire-rundersprofiler:

```text
badge:  badges
vanlig: people · objects · brands · civication
natur:  map · flora · fauna · civication
```

Gamle round-ID-er skal ikke få gjenoppstå gjennom aliaser eller fallback.

## 12. Produksjonsgate

Et sted er rundingsklart når:

1. Badges vises ved stedsoverskriften;
2. nøyaktig fire rundinger vises i et 2 × 2-felt ved `frontImage`;
3. profilen er korrekt for vanlig sted eller natursted;
4. previewene er reelle og egnede;
5. People-previewet filtrerer ikke People-popupen;
6. naturstedets Kart åpner et faktisk tur-/naturkart;
7. Flora og Fauna bruker canonical naturdata;
8. Civication-rundingen bruker stedsspesifikke Civication-data;
9. de sju popup-SVG-ene står separat til høyre for rundingene;
10. relevante rundings-, popup- og datagater passerer.
