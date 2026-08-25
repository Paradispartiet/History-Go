# History GO — stedstandard

Status: **canonical produktstandard for et History GO-sted**  
Eier: `place_product_standard`  
Sist kontrollert: **2026-08-25**

Dette dokumentet definerer **hva et History GO-sted er og hvilke roller stedssystemet har**. Det er ikke detaljoppskrift for tekst, quiz, rundinger, People eller koordinater.

Sted-for-sted arbeidsrekkefølge for ordinære steder:

- `docs/PLACE_PRODUCTION_CHECKLIST.md`

Lettvektssteder med `placeTier: "micro"` følger i stedet den avgrensede ferdigdefinisjonen i:

- `docs/MICRO_PLACE_CONTRACT.md`

## 1. Autoritetskart

| Område | Eier |
| --- | --- |
| Faktisitet | `docs/FACTUALITY_CONTRACT.md` |
| Place-data/manifester/referanser | `docs/DATA_PRODUCTION_CONTRACT.md` |
| Ordinær Place-produksjon | `docs/PLACE_PRODUCTION_CHECKLIST.md` |
| Micro Place-produksjon | `docs/MICRO_PLACE_CONTRACT.md` |
| `desc` / `popupDesc` produksjon | `data/places/regler/PLACE_DESCRIPTION_CANONICAL.md` |
| Popup-presentasjon | `docs/PLACE_POPUP_SYSTEM.md` |
| Rundinger | `data/places/README_place_rounds.md` |
| Brands-semantikk og place-kobling | `data/brands/brand_rules_v1_1.json` |
| Kategorier | `data/categories/category_contract.json` |
| Koordinater | `docs/coordinates/coordinate-source-contract-v1.md` |
| People–sted | `docs/people-of-places-method.md` |
| People-profiler | `docs/PEOPLE_PROFILE_CANONICAL.md` |
| Quiz | `data/quiz/regler/QUIZ_PRODUCTION_CANONICAL.md` |
| Stories | `docs/STORIES_DATA_GOVERNANCE.md` |
| Nature | `README/nature_mapping_workflow.md` |
| Completion | `docs/COMPLETION_DEFINITIONS.md` |
| Progresjon/read-model | `docs/PROGRESSION_MODEL.md` |
| Fagverk-navigasjon | `docs/FAGVERK_NAVIGATION.md` |

Ved konflikt gjelder subsystemets eierkontrakt og faktisk source/runtime foran oppsummeringen her. `MICRO_PLACE_CONTRACT.md` eier uttrykkelig hvilke ordinære fullness-krav som ikke gjelder når `placeTier: "micro"` er validert.

## 2. Grunnmodell

Ett fysisk/historisk objekt skal ha ett canonical place-object.

Harde regler:

1. `id` er unik.
2. Canonical source er manifest-loadet.
3. `category` er én canonical primærkategori.
4. Tverrfaglighet uttrykkes gjennom eide koblingssystemer, ikke dupliserte places.
5. Koordinatet representerer det faktiske History GO-objektet etter coordinate-kontrakten.
6. Brukerrettede fakta er source-led.
7. Genererte indekser er build-output og håndredigeres ikke.
8. `placeTier` beskriver produksjonsomfang, ikke fagkategori. Fravær betyr ordinært/standard sted; `micro` krever `MICRO_PLACE_CONTRACT.md`.
9. Et Micro Place kan ha egen kartprikk ved et større parent-place uten å arve parentens kategori.

## 3. Minimum place-object

Et basissted trenger minst:

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

Dette betyr bare at stedet kan eksistere i grunnsystemet. Det betyr ikke at et ordinært sted er produksjonsferdig.

Et Micro Place trenger i tillegg minst:

```js
{
  placeTier: "micro",
  subcategory_id,
  micro_place_profile
}
```

og full koordinat-/kildekontrakt etter `docs/MICRO_PLACE_CONTRACT.md`.

## 4. Rikt place-object

Relevante og dokumenterte felt kan blant annet være:

```js
{
  id,
  name,
  lat,
  lon,
  r,
  category,
  subcategory_id,
  placeTier,
  micro_place_profile,
  parent_place_id,
  underbadge_ids,
  year,
  desc,
  popupDesc,
  image,
  cardImage,
  frontImage,
  emne_ids,
  rounds,
  rounds_exclude,
  objects,
  details,
  spots,
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

Felt brukes når de faktisk har en rolle. Manglende relevant informasjon skal ikke fylles med plausibelt innhold.

Canonical data kan også eies utenfor place-recorden: People, Works, Brands, Stories, Leksikon, Før/etter, Lesespor, Quiz, Nature mappings, observations, routes, events og På stedet-profiler.

## 5. `desc` og `popupDesc`

Denne filen eier **ikke** produksjonsmetoden for tekstene.

All ny eller vesentlig revidert ordinær `desc`/`popupDesc` følger:

- `data/places/regler/PLACE_DESCRIPTION_CANONICAL.md`;
- tilhørende production-package schema og validator.

Det innebærer claim-first produksjon, setning→claim-paritet, teksthash, faktareview og redaksjonell review.

Denne stedstandarden fastslår bare rollen:

- `desc` = kort leksikalsk inngang;
- `popupDesc` = full stedartikkel til Om-fanen.

For et validert Micro Place er en source-led `desc` obligatorisk, mens full `popupDesc`-artikkel ikke er obligatorisk med mindre mikroobjektets dokumenterte stoffmengde faktisk tilsier det. Faktisitetskontrakten gjelder uansett.

## 6. De tre brukerrettede stedflatene

### Rundinger

Rundingsmodellen eies **kun** av `data/places/README_place_rounds.md`. Denne filen vedlikeholder ikke egen palett, profil eller antallsregel.

Det ordinære firefeltskravet gjelder ikke Micro Place; micro-presentasjonen eies av `docs/MICRO_PLACE_CONTRACT.md`.

### På stedet

Hva som faktisk skjer eller kan gjøres ved stedet, for eksempel:

- Events;
- Social Meet;
- Spotmeeting/Kunnskapsmøte;
- Tasks;
- Training;
- Play.

Quiz, Observer, Notat og Rute kan ha egne flows.

### Stedspopup

Kunnskapsflaten for ordinære steder:

```text
Om · Historie · Fortellinger · Før/etter · Nyheter · Lesespor · Kilder · direkte datastyrte faner
```

Disse tre rollene skal ikke blandes for å fylle UI.

Stedspopupens hero skal gi orientering og primær handling, ikke gjenta nøkkeltall som allerede eies av type-spesifikke detaljseksjoner. Se `docs/PLACE_POPUP_SYSTEM.md` for regelen om én visuell eier per opplysning.

Micro Place skal ikke vise eller kreve tomme ordinære faner bare for å etterligne et fullsted.

## 7. PlaceCard

PlaceCard er det kompakte kontrollrommet for stedet.

For ordinære steder skal det kunne vise, når relevant og implementert:

- navn og kategori;
- korrekt stedbilde;
- `desc`;
- rundingssett etter canonical rundingskontrakt;
- På stedet;
- handlingsknapper;
- favoritt;
- fysisk visit/status;
- quiz/progress-signaler.

Lang kunnskap hører i popupen, ikke i selve PlaceCard.

For `placeTier: "micro"` gjelder den kompakte Micro PlaceCard-kontrakten: det ordinære firefelts-gridet skjules, Fagverk-badge er ikke obligatorisk, og Quiz vises bare når `micro_place_profile.quizMode` er `place`.

## 8. Badges og fagverk

`category` er stedets primære canonical kategori/badgeidentitet.

`underbadge_ids` brukes til canonical underbadges.

For ordinære steder åpner Badges-handlingen:

```text
fagverk-sted.html?place=<place_id>
```

Merke- og fagsider har forskjellige roller; se `docs/FAGVERK_NAVIGATION.md`.

Micro Place beholder toppkategoriens kartidentitet, men egen Fagverk-sted-side er ikke et ferdigkrav med mindre en aktivert micro-flate uttrykkelig trenger den.

## 9. Rundinger og canonical place-felt

Detaljreglene for ordinære steder eies av `data/places/README_place_rounds.md`.

For ny/revidert ordinær stedproduksjon:

- `rounds` = legacy presentasjonsfelt; rundingsvalg eies av canonical rundingskontrakt;
- `objects` = nye Object-kort;
- `details` = nye Detail-kort;
- `spots` = nye Spot-kort;
- `subplaces` beholdes for reell stedstruktur/soner og kan også være compatibility-kilde for Spots.

Legacy aliaser skal ikke bli nye standarder.

Nature er valgfri. Brands-semantikken eies av `data/brands/brand_rules_v1_1.json`: også profesjonelle, arkitektur-, venue-, institusjons-, legacy- og skiltidentiteter kan kvalifisere når navnet har selvstendig gjenkjennelse og dokumentert stedskobling. Aktørtype alene er verken godkjenning eller avslag.

Micro Place skal ikke opprette `place_card_profile` for å fylle fire kunstige samlinger.

## 10. Strukturerte place-profiler

### `spatial_profile`

Kildebelagte mål og fysisk form. Gameplay-radius `r` er ikke areal.

### `temporal_profile`

Få tydelige hovedmilepæler når ett `year` ikke er nok. Detaljert chronology eies av Historie/Leksikon.

### `subplaces`

Reelle fysiske deler eller soner under hovedstedet. Et subplace blir ikke automatisk et nytt globalt Place.

Et element som trenger egen faglig kartprikk og består Micro Place-identitetsporten kan i stedet bli eget Micro Place med parent-/relation-kobling.

### `history_layers`

Kort historisk lagdeling som kan brukes i Historie-fanen. Det erstatter ikke canonical chronology.

### `nature_profile`

Landskap, habitat, sesong og observerbar naturkarakter til Om. Det er ikke automatisk en Nature-runding.

### `source_summary`

Brukerrettede sikre kilder til Kilder-fanen. Interne audits/researchnotater skal ikke lekke hit.

## 11. Samling, besøk og completion

Steddata og spillerstatus er forskjellige ting.

Aktuell produkt/runtimemodell skiller blant annet:

- fysisk besøkt sted;
- quiz-samlet sted;
- profilens samlede place-liste;
- quizstatus;
- favoritt;
- completion/mastery der eksplisitte regler finnes.

Se `docs/COMPLETION_DEFINITIONS.md`, `docs/PROGRESSION_MODEL.md` og `docs/QUIZ_AND_PHYSICAL_VISIT_MODEL.md`.

Et Micro Place uten egen quiz skal ikke få manglende quiz presentert som en ufullført handling.

## 12. Wonderkammer og Civication

Wonderkammer er legacy migreringsgrunnlag, ikke ny PlaceCard-runding eller ny stedproduksjonsmodell.

Civication er et separat spillsystem. En fysisk Civication-ting kan vises som Object når den også kvalifiserer som et virkelig stedsspesifikt objekt.

## 13. Produksjonsferdig sted

Et ordinært sted er ikke produksjonsferdig bare fordi basisobjektet validerer.

Ordinær ferdigstatus bestemmes gjennom `docs/PLACE_PRODUCTION_CHECKLIST.md`, som krever eksplisitt vurdering av alle relevante subsystemer, kilder, bilder, UI, spillerstatus og CI.

Et validert `placeTier: "micro"` er ferdig etter `docs/MICRO_PLACE_CONTRACT.md`. Denne ferdigdefinisjonen er bevisst mindre i innholdsbredden, men beholder full styrke på identitet, faktisitet, coordinate source, canonical source/manifest/index og faktisk UI-kontroll.

**Manglende relevant innhold kan være N/A. Glemt kontroll kan ikke være N/A. Micro Place er en egen kontrakt, ikke en generell snarvei.**
