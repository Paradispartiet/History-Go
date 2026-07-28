# History GO — stedstandard

Status: **canonical produktstandard for et History GO-sted**  
Eier: `place_product_standard`  
Sist kontrollert: **2026-07-29**

Dette dokumentet definerer **hva et History GO-sted er og hvilke roller stedssystemet har**. Det er ikke detaljoppskrift for tekst, quiz, rundinger, People eller koordinater.

Sted-for-sted arbeidsrekkefølge:

- `docs/PLACE_PRODUCTION_CHECKLIST.md`

## 1. Autoritetskart

| Område | Eier |
| --- | --- |
| Faktisitet | `docs/FACTUALITY_CONTRACT.md` |
| Place-data/manifester/referanser | `docs/DATA_PRODUCTION_CONTRACT.md` |
| `desc` / `popupDesc` produksjon | `data/places/regler/PLACE_DESCRIPTION_CANONICAL.md` |
| Popup-presentasjon | `docs/PLACE_POPUP_SYSTEM.md` |
| Rundinger | **`data/places/README_place_rounds.md`** |
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

Ved konflikt gjelder subsystemets eierkontrakt og faktisk source/runtime foran oppsummeringen her.

**Denne filen gjentar ikke rundingspalett, rundingsantall eller rundingsprioriteringer.** Alt dette eies bare av `data/places/README_place_rounds.md`.

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

Dette betyr bare at stedet kan eksistere i grunnsystemet. Det betyr ikke at stedet er produksjonsferdig.

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
  underbadge_ids,
  year,
  desc,
  popupDesc,
  image,
  cardImage,
  frontImage,
  emne_ids,
  objects,
  details,
  spots,
  flora,
  fauna,
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

`rounds`, `rundinger` og `rounds_exclude` kan fortsatt finnes i eldre data som compatibility-felt, men er ikke canonical styringsfelt for ny rundingspresentasjon. Se rundingkontrakten.

Canonical data kan også eies utenfor place-recorden: People, Works, Brands, Stories, Leksikon, Før/etter, Lesespor, Quiz, Nature mappings, observations, routes, events og På stedet-profiler.

## 5. `desc` og `popupDesc`

Denne filen eier **ikke** produksjonsmetoden for tekstene.

All ny eller vesentlig revidert `desc`/`popupDesc` følger:

- `data/places/regler/PLACE_DESCRIPTION_CANONICAL.md`;
- tilhørende production-package schema og validator.

Det innebærer claim-first produksjon, setning→claim-paritet, teksthash, faktareview og redaksjonell review.

Denne stedstandarden fastslår bare rollen:

- `desc` = kort leksikalsk inngang;
- `popupDesc` = full stedartikkel til Om-fanen.

## 6. De tre brukerrettede stedflatene

### Rundinger

PlaceCard har en canonical rundingsflate. **Hele rundingsmodellen eies av `data/places/README_place_rounds.md`.** Denne filen skal ikke kopiere eller oppsummere paletten.

### På stedet

Hva som faktisk skjer eller kan gjøres ved stedet. Synlighet og handlinger eies av:

- `docs/PLACE_ONSITE_SYSTEM.md`;
- `data/categories/place_onsite_contract.json`.

Quiz, Observer, Notat og Rute kan ha egne flows.

### Stedspopup

Kunnskapsflaten:

```text
Om · Historie · Fortellinger · Før/etter · Nyheter · Lesespor · Kilder · Mer
```

Disse tre rollene skal ikke blandes for å fylle UI.

## 7. PlaceCard

PlaceCard er det kompakte kontrollrommet for stedet.

Det skal kunne vise, når relevant og implementert:

- navn og kategori;
- korrekt stedbilde;
- `desc`;
- canonical rundingsflate etter rundingkontrakten;
- På stedet;
- handlingsknapper;
- favoritt;
- fysisk visit/status;
- quiz/progress-signaler.

Lang kunnskap hører i popupen, ikke i selve PlaceCard.

## 8. Badges og fagverk

`category` er stedets primære canonical kategori/badgeidentitet.

`underbadge_ids` brukes til canonical underbadges.

Navigasjon mellom sted, merke og fag eies av `docs/FAGVERK_NAVIGATION.md`. Rundingens presentasjonsrolle eies av rundingkontrakten.

## 9. Rundinger og place-felt

Denne filen definerer **ingen rundingstyper**.

- `objects`, `details`, `spots`, `subplaces`, `flora`, `fauna` og andre strukturer kan være gyldige place-/subsystemdata uavhengig av om de presenteres som runding;
- eksisterende data skal ikke omklassifiseres bare for å fylle PlaceCard;
- all beslutning om hva som faktisk er en runding ligger i `data/places/README_place_rounds.md`.

## 10. Strukturerte place-profiler

### `spatial_profile`

Kildebelagte mål og fysisk form. Gameplay-radius `r` er ikke areal.

### `temporal_profile`

Få tydelige hovedmilepæler når ett `year` ikke er nok. Detaljert chronology eies av Historie/Leksikon.

### `subplaces`

Reelle fysiske deler eller soner under hovedstedet. Et subplace blir ikke automatisk et nytt globalt Place.

### `history_layers`

Kort historisk lagdeling som kan brukes i Historie-fanen. Det erstatter ikke canonical chronology.

### `nature_profile`

Landskap, habitat, sesong og observerbar naturkarakter til Om. Rundingspresentasjon bestemmes separat av rundingkontrakten.

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

## 12. Wonderkammer og Civication

Wonderkammer er legacy migreringsgrunnlag, ikke en ny PlaceCard-runding eller ny stedproduksjonsmodell.

Civication er et separat spillsystem. En fysisk Civication-ting kan gjenbrukes av et annet eierlag når den kvalifiserer etter den eierens kontrakt; Civication-identitet i seg selv gjør den ikke til en runding.

## 13. Produksjonsferdig sted

Et sted er ikke produksjonsferdig bare fordi basisobjektet validerer.

Ferdigstatus bestemmes gjennom `docs/PLACE_PRODUCTION_CHECKLIST.md`, som krever eksplisitt vurdering av alle relevante subsystemer, kilder, bilder, UI, spillerstatus og CI.

**Manglende relevant innhold kan være N/A. Glemt kontroll kan ikke være N/A.**
