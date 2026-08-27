# History GO — stedstandard

Status: **canonical produktstandard for et History GO-sted**  
Eier: `place_product_standard`  
Sist kontrollert: **2026-08-27**

Dette dokumentet definerer **hva et History GO-sted er og hvilke roller stedssystemet har**. Det er ikke detaljoppskrift for tekst, quiz, samlinger, People eller koordinater.

Sted-for-sted arbeidsrekkefølge:

- `docs/PLACE_PRODUCTION_CHECKLIST.md`
- `docs/PLACE_PRODUCTION_PROFILES.md`
- `docs/MICRO_PLACE_CONTRACT.md` for små canonicale kartpunkter med redusert innholdskontrakt

## 1. Autoritetskart

| Område | Eier |
| --- | --- |
| Faktisitet | `docs/FACTUALITY_CONTRACT.md` |
| Place-data/manifester/referanser | `docs/DATA_PRODUCTION_CONTRACT.md` |
| Badge-/underbadge-drevet produksjonsruting | `data/badges/place_production_routing_v1.json` + `data/badges/<badge>.json` |
| Produksjonsprofil/innholdsplan | `docs/PLACE_PRODUCTION_PROFILES.md` |
| `desc` / `popupDesc` produksjon | `data/places/regler/PLACE_DESCRIPTION_CANONICAL.md` |
| Popup-presentasjon | `docs/PLACE_POPUP_SYSTEM.md` |
| PlaceCard-samlinger | `data/places/README_place_rounds.md` |
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

Ved konflikt gjelder subsystemets eierkontrakt og faktisk source/runtime foran oppsummeringen her.

## 2. Grunnmodell

Ett fysisk/historisk objekt skal ha ett canonical place-object.

Harde regler:

1. `id` er unik.
2. Canonical source er manifest-loadet.
3. `category` er én canonical primærkategori og samtidig stedets Hovedbadge-familie.
4. `underbadge_ids` beskriver hvilke deler av Hovedbadgen stedet faktisk representerer.
5. Tverrfaglighet uttrykkes gjennom eide koblingssystemer, ikke dupliserte places.
6. Koordinatet representerer det faktiske History GO-objektet etter coordinate-kontrakten.
7. Brukerrettede fakta er source-led.
8. Genererte indekser er build-output og håndredigeres ikke.

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
  frontImageMeta,
  emne_ids,
  place_card_profile,
  objects,
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

For nye og fullproduserte ordinære Places er `frontImage` alltid en stående fil/variant med høyde større enn bredde. `frontImageMeta` eller tilsvarende canonical metadata dokumenterer kilde, lisens, original- og outputdimensjoner samt eventuelt crop. En liggende fil som bare maskeres av en stående CSS-ramme er ikke tilstrekkelig.

`place_card_profile.collection_ids` inneholder ved ny/full produksjon **1–4 ferdige, relevante samlinger**. Hver valgt samling skal ha et lastende previewbilde av ett faktisk canonical medlem. Et tomt samlingskort er aldri godkjent closeout; en irrelevant samling utelates i stedet.

Fallback er runtime-feilhåndtering, ikke godkjent closeout.

Felt brukes når de faktisk har en rolle. Manglende relevant informasjon skal ikke fylles med plausibelt innhold.

Canonical data kan også eies utenfor place-recorden: People, Works/Productions, Brands, Stories, Leksikon, Før/etter, Lesespor, Quiz, Nature mappings, observations, routes, events og På stedet-profiler.

## 5. Badge-/underbadge-drevet innhold

`category` er stedets primære Hovedbadge. `underbadge_ids` er den canonicale spesialiseringen under hovedbadgen.

Produksjon skal følge:

```text
category/Hovedbadge
→ underbadge_ids
→ data/badges/place_production_routing_v1.json
→ stedsspesifikke kilder
→ confirmed produksjonsprofil
→ endelig innholdsplan
```

Badge-systemet sier hva produsenten skal undersøke, ikke hva som automatisk finnes.

Eksempler:

- Næringsliv + industri gjør produksjonsprosess/anlegg/arbeid/teknologi til sterke kandidater, men skaper ikke automatisk et Brand;
- Historie + kulturminner/bevaring prioriterer materielle spor, vern og ombruk;
- Musikk + konsertsteder prioriterer scene, artister, konserter og lyd-/venuehistorie;
- Sport + stadion og Sport + supporterkultur skal ikke ende med identiske innholdsplaner;
- Natur-underbadges og eventuell `quizFocus` peker mot relevante arter, habitat, vann, geologi eller friluftsliv, men bare source-backed innhold materialiseres.

Badge-/underbadge-rutingen er obligatorisk i preflight etter `docs/PLACE_PRODUCTION_CHECKLIST.md`.

## 6. `desc` og `popupDesc`

Denne filen eier **ikke** produksjonsmetoden for tekstene.

All ny eller vesentlig revidert `desc`/`popupDesc` følger:

- `data/places/regler/PLACE_DESCRIPTION_CANONICAL.md`;
- tilhørende production-package schema og validator.

Det innebærer claim-first produksjon, setning→claim-paritet, teksthash, faktareview og redaksjonell review.

Denne stedstandarden fastslår bare rollen:

- `desc` = kort leksikalsk inngang;
- `popupDesc` = full stedartikkel til Om-fanen.

## 7. De tre brukerrettede stedflatene

### PlaceCard-samlinger

Samlingsmodellen eies **kun** av `data/places/README_place_rounds.md`.

For nye/fullproduserte ordinære steder viser PlaceCard bare 1–4 ferdige samlinger. Færre samlinger får egen balansert layout, ikke tomme reservekort.

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

Kunnskapsflaten eies av `docs/PLACE_POPUP_SYSTEM.md`. Språk er obligatorisk for ordinære Places. Betingede moduler produseres etter Badge-drevet innholdsplan og subsystemkontrakt; irrelevante moduler skal ikke fylles med generisk stoff.

Disse tre rollene skal ikke blandes for å fylle UI.

## 8. PlaceCard

PlaceCard er det kompakte kontrollrommet for stedet.

### Ordinære Places

Det skal kunne vise:

- navn og Hovedbadge/category;
- korrekte Badge-/underbadge-signaler;
- stedstro stående `frontImage`;
- 1–4 kuraterte samlinger med reelle previews;
- `desc`;
- relevante handlinger;
- favoritt;
- fysisk visit/status;
- quiz/progress-signaler der de gjelder.

Visuell sluttregel:

- 1 samling → stor og sentrert;
- 2 → balansert par;
- 3 → 2+1;
- 4 → 2×2;
- ingen tomme kort;
- ingen filler;
- kortet skal se tilsiktet og pent ut for akkurat stedstypen.

### Micro Places

Små, presist stedfestede punkter som trenger egen kartmarkør, men ikke ordinær Content Factory-pakke, bruker `placeTier: "micro"` og `micro_place_profile`. De er fortsatt canonical Places med egen identitet, kategori, underkategori og koordinater. De bruker det kompakte Micro PlaceCard-et og følger `docs/MICRO_PLACE_CONTRACT.md`.

Lang kunnskap hører i popupen, ikke i selve PlaceCard.

## 9. Badges og Fagverk

`category` er stedets primære canonical kategori/badgeidentitet.

`underbadge_ids` brukes til canonical underbadges og skal være en reell del av produksjonsroutingen, ikke bare dekorativ metadata.

Badge-familiene eies av `data/badges/index.json` og de 19 `data/badges/<badge>.json`-filene. Produksjonsruting eies av `data/badges/place_production_routing_v1.json`.

Badges-handlingen åpner:

```text
fagverk-sted.html?place=<place_id>
```

Merke- og fagsider har forskjellige roller; se `docs/FAGVERK_NAVIGATION.md`.

## 10. PlaceCard-felt og entities

Detaljreglene eies av `data/places/README_place_rounds.md`.

For ny/revidert stedproduksjon:

- `place_card_profile` = eksplisitt kuratering av 1–4 ferdige samlinger;
- `round_profile` / `rounds` = legacy presentasjonsfelt og compatibility;
- `objects` = canonical fysiske Object-kort;
- `subplaces` beholdes for reell stedstruktur/soner og kan være compatibility-kilde når semantic owner tillater det.

Legacy aliaser skal ikke bli nye standarder.

Brands-semantikken eies av `data/brands/brand_rules_v1_1.json`: profesjonelle, arkitektur-, venue-, institusjons-, legacy- og skiltidentiteter kan kvalifisere når navnet har selvstendig gjenkjennelse og dokumentert stedskobling. Aktørtype alene er verken godkjenning eller avslag. Null treff er ikke alene N/A; et kvalifisert Brand skal heller aldri konstrueres bare fordi Badge-rutingen gjør Brand til kandidat.

## 11. Strukturerte place-profiler

### `spatial_profile`

Kildebelagte mål og fysisk form. Gameplay-radius `r` er ikke areal.

### `temporal_profile`

Få tydelige hovedmilepæler når ett `year` ikke er nok. Detaljert chronology eies av Historie/Leksikon.

### `subplaces`

Reelle fysiske deler eller soner under hovedstedet. Et subplace blir ikke automatisk et nytt globalt Place.

### `history_layers`

Kort historisk lagdeling som kan brukes i Historie-fanen. Det erstatter ikke canonical chronology.

### `nature_profile`

Landskap, habitat, sesong og observerbar naturkarakter til Om. Badge-/underbadge-evidens kan gjøre naturmoduler relevante, men Nature-data må fortsatt være stedsspesifikke.

### `source_summary`

Brukerrettede sikre kilder til Kilder-fanen. Interne audits/researchnotater skal ikke lekke hit.

## 12. Samling, besøk og completion

Steddata og spillerstatus er forskjellige ting.

Aktuell produkt/runtimemodell skiller blant annet:

- fysisk besøkt sted;
- quiz-samlet sted;
- profilens samlede place-liste;
- quizstatus;
- favoritt;
- completion/mastery der eksplisitte regler finnes.

Se `docs/COMPLETION_DEFINITIONS.md`, `docs/PROGRESSION_MODEL.md` og `docs/QUIZ_AND_PHYSICAL_VISIT_MODEL.md`.

## 13. Wonderkammer og Civication

Wonderkammer er legacy migreringsgrunnlag, ikke ny PlaceCard-samling eller ny stedproduksjonsmodell.

Civication er et separat spillsystem. En fysisk Civication-ting kan vises som Object når den også kvalifiserer som et virkelig stedsspesifikt objekt.

## 14. Produksjonsferdig sted

Et sted er ikke produksjonsferdig bare fordi basisobjektet validerer.

Ferdigstatus bestemmes gjennom `docs/PLACE_PRODUCTION_CHECKLIST.md`, som krever:

- bekreftet Badge-/underbadge-grunnlag;
- bekreftet produksjonsprofil;
- komplett Universal canonical core;
- ferdig produksjon av alle relevante source-backed moduler;
- eksplisitt begrunnelse for irrelevante moduler;
- PlaceCard uten tomme samlingskort;
- visuell QA på mobil og desktop;
- relevante tester/CI.

**Manglende relevant innhold kan være N/A bare etter ordentlig audit. Glemt kontroll kan ikke være N/A. Et N/A-modul skal ikke etterlate et tomt kort.**
