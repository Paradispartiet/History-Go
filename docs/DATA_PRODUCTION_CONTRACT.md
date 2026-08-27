# History GO — dataproduksjonskontrakt

Status: **canonical data-production contract**
Eier: `history_go_data_production`
Sist kontrollert: **2026-08-03**

Dette dokumentet eier de **tverrgående reglene** for hvordan History GO-data produseres, aktiveres og kobles sammen. Det skal ikke duplisere subsystemenes detaljoppskrifter.

For full sted-for-sted arbeidsrekkefølge brukes:

- `docs/PLACE_PRODUCTION_CHECKLIST.md`

## 1. Autoritetskart

| Område | Canonical eier |
| --- | --- |
| Faktisitet | `docs/FACTUALITY_CONTRACT.md` |
| Stedstandard | `docs/PLACE_STANDARD.md` |
| `desc` / `popupDesc` | `data/places/regler/PLACE_DESCRIPTION_CANONICAL.md` |
| Stedspopup | `docs/PLACE_POPUP_SYSTEM.md` |
| Rundinger | `data/places/README_place_rounds.md` |
| Brands-semantikk og place-kobling | `data/brands/brand_rules_v1_1.json` |
| Kategorier | `data/categories/category_contract.json` |
| Quiz | `data/quiz/regler/QUIZ_PRODUCTION_CANONICAL.md` |
| People–sted | `docs/people-of-places-method.md` |
| People-profiler | `docs/PEOPLE_PROFILE_CANONICAL.md` |
| Objects | `docs/PLACE_OBJECTS_CANONICAL.md` |
| People-bilder | `docs/PEOPLE_IMAGES.md` |
| Stories | `docs/STORIES_DATA_GOVERNANCE.md` |
| Koordinater | `docs/coordinates/coordinate-source-contract-v1.md` |
| Coordinate evidence | `docs/coordinates/coordinate-evidence-files-v1.md` |
| Nature | `README/nature_mapping_workflow.md` |
| Fagverk-navigasjon | `docs/FAGVERK_NAVIGATION.md` |
| Fagsidearkitektur og ferdigstilling | `docs/FAGVERK.md` |
| Completion | `docs/COMPLETION_DEFINITIONS.md` |
| Progresjon/read-model | `docs/PROGRESSION_MODEL.md` |
| Historiske ruter | `docs/README_HistoryGo_Historiske_Ruter.md` |

Når et detaljspørsmål eies av en av disse filene, skal denne kontrakten **peke dit**, ikke lage en konkurrerende mini-standard.

## 2. Faktisitet er første port

All brukerrettet dataproduksjon følger `FACTUALITY_CONTRACT.md`.

- Ikke dikt, gjett eller fyll ut manglende fakta.
- En språkmodell er ikke en faktakilde.
- Eksisterende History GO-tekst er ikke alene bevis for samme påstand.
- Kilder skal støtte den konkrete påstanden, ikke bare omtale samme emne.
- Manglende informasjon skal forbli manglende.
- Kildekonflikter dokumenteres; uløste konflikter publiseres normalt ikke som sikre fakta.
- Schema, grønn CI eller `verifiedAt` beviser ikke faktisitetskontroll alene.

Produksjon stopper når kildegrunnlaget ikke bærer innholdet.

## 3. Ett place-ID — ett canonical place-object

Et place-ID skal ikke dupliseres på tvers av filer eller kategorier.

Arbeidsregel:

1. søk etter ID, navn og navnevarianter;
2. finn manifest-loadet source-fil;
3. oppdater eksisterende canonical object når stedet allerede finnes;
4. ta eksplisitt kategoribeslutning før eventuell flytting;
5. uttrykk tverrfaglighet gjennom badges/emner, People, Works, quiz, Stories, Leksikon, relations og ruter — ikke dupliserte Places.

Genererte indekser håndredigeres ikke.

## 4. Manifestet aktiverer data

En fil som finnes i repoet er ikke automatisk aktiv runtime-data.

For hvert subsystem skal canonical manifest-/loaderkjede følges.

For Places eier `data/places/manifest.json` den globale aktiveringen. Når et datasett er splittet til per-place-filer, redigeres den manifest-loadede per-place-filen, ikke et beholdt aggregate.

Samme prinsipp gjelder blant annet People, Quiz, Stories og Routes.

## 5. Kategori og underbadges

`category` er én canonical primærkategori og skal bruke ID fra:

- `data/categories/category_contract.json`.

`underbadge_ids` brukes til canonical underklassifisering.

Ikke opprett lokale parallelle kategorifelter for å uttrykke tverrfaglighet.

## 6. `desc` og `popupDesc`

Denne dataproduksjonskontrakten eier **ikke** hvordan teksten skrives eller faktagodkjennes.

All ny eller vesentlig revidert stedstekst følger:

- `data/places/regler/PLACE_DESCRIPTION_CANONICAL.md`;
- `data/places/regler/place_description_production_v4_2.schema.json`;
- tilhørende validator.

Det betyr identitetsport, inspectable kilder, claims, setning→claim-paritet, teksthash, faktareview og redaksjonell review.

Ikke produser `desc`/`popupDesc` fra en løs stedstype-mal eller læringsmål alene.

## 7. PlaceCard-samlinger

PlaceCard-samlinger er kuraterte innholdsflater, ikke kategori-, popup- eller progresjonslogikk.

Canonical eier:

- `data/places/README_place_rounds.md`.

For nye og fullproduserte ordinære Places gjelder:

```text
People · Objects · Brands · kategoriuttrykk
```

Nature bruker det faste firersettet:

```text
Map · Flora · Fauna · Destinations
```

Krav:

- `place_card_profile.collection_ids` har nøyaktig fire ferdige canonical IDs;
- alle fire samlinger er stedsspesifikke, substansielle og bildeklare;
- kategoriuttrykket og brukerrettet navn følger 19-kategorimatrisen i `data/places/README_place_rounds.md`;
- `related` er et relasjons-/navigasjonssystem og aldri PlaceCard-samling;
- `badges`, bilder, Details, Spots, Stories, popupfaner, Quiz og Civication teller ikke blant de fire;
- `round_profile`, `rounds` og legacy-aliaser brukes bare som compatibility-/migreringskilder;
- nye Objects bruker normalt `place.objects` og følger `docs/PLACE_OBJECTS_CANONICAL.md`;
- Brands er fast i ordinære fullprofiler og følger hele definisjonen i `data/brands/brand_rules_v1_1.json`, ikke bare forbrukermerker og butikker;
- Civication Store og Wonderkammer er separate systemer, ikke samlinger eller nye produksjonsmodeller.

## 8. People

People-data skal gå gjennom canonical People-system.

Følg:

- `docs/people-of-places-method.md` for stedskobling;
- `docs/PEOPLE_PROFILE_CANONICAL.md` for ny/revidert profil;
- `docs/PEOPLE_IMAGES.md` for personbilder;
- `data/people/manifest.json` for aktivering.

Søk etter eksisterende canonical person før ny record opprettes. Ikke flytt primæranker uten egen vurdering.

## 9. Works, Brands og andre entiteter

Før ny entitet opprettes:

1. søk canonical ID;
2. søk navn/navnevarianter;
3. vurder om eksisterende record kan få ny dokumentert place-kobling;
4. opprett bare ny record når det faktisk er en ny canonical entitet.

### Brands

Canonical eier er `data/brands/brand_rules_v1_1.json`.

Brands er **selvstendige, sosialt gjenkjennelige navn og identiteter med dokumentert kobling til stedet**. Kommersielle merker, profesjonelle firmaer, arkitektur-/ingeniørfirmaer, venue-, galleri-, serverings-, institusjons-, subkultur-, legacy- og skiltidentiteter kan kvalifisere når Brand-kontrakten består.

Brands skal ikke brukes som generell restkategori for personer, objekter eller generiske aktørnavn. Samtidig kan en kandidat ikke avvises bare fordi den er et arkitektkontor, entreprenørfirma, prosjektteam, institusjon, venue eller skilt. Avgjørelsen skal bygge på identitetsautonomi, gjenkjennelse, særpreg, visuell/symbolsk tilstedeværelse, minneverdi og place-versus-brand-regelen.

Null treff i `brands_master.json` eller `brands_by_place.json` beviser ikke N/A. Produksjonen skal også auditere dokumenterte aktører og historiske/aktuelle virksomheter ved stedet. N/A krever kandidatspesifikke avvisningsgrunner etter Brand-kontrakten.

### Works

Historiske hendelser, sportsresultater, rekorder og mesterskap er ikke Works. De hører normalt i stedspopupens Historie/kunnskapsflate.

## 10. Popup og kunnskapsdata

Popupen aggregerer eide systemer; den skal ikke føre til at alt kopieres inn i place-filen.

Presentasjon og faner eies av:

- `docs/PLACE_POPUP_SYSTEM.md`.

Typisk eierskap:

- place source → identitet, `desc`, `popupDesc`, place-profiler;
- Leksikon → artikkel, facts, chronology, nyhetsspor, `externalLinks`;
- Stories → Stories;
- `for_na` → Før/etter;
- Lesespor → Lesespor;
- source summaries / eksterne lenker → Kilder;
- tasks/training/play/events/møter → På stedet;
- observations/Knowledge → sine egne systemer.

## 11. Quiz

Quiz skal ikke produseres fra denne kontrakten.

Den eneste bindende produksjonsprosedyren er:

- `data/quiz/regler/QUIZ_PRODUCTION_CANONICAL.md`.

Quizfile/set-pakke er ikke aktiv før korrekt quiz-manifest/load-kjede inkluderer den.

Quiz kan påvirke kunnskap/progresjon/unlocks, men skal aldri registrere fysisk besøksstatus.

## 12. Stories

Nye eller vesentlig omskrevne Stories følger:

- `docs/STORIES_DATA_GOVERNANCE.md`.

Chronology og Stories har forskjellige roller. Ikke lag Story bare fordi et chronology-punkt er viktig.

## 13. Koordinater

Nye eller vesentlig endrede koordinater følger:

- `docs/coordinates/README.md`;
- `docs/coordinates/coordinate-source-contract-v1.md`;
- `docs/coordinates/coordinate-evidence-files-v1.md`.

Koordinatet skal representere riktig fysisk/historisk objekt, ikke bare et nærliggende kjent punkt.

## 14. Nature

Nature-mapping følger:

- `README/nature_mapping_workflow.md`.

Et fullprodusert Nature-Place bruker alltid Map, Flora, Fauna og Destinations. Alle fire krever stedsspesifikk dokumentasjon; generiske arter eller turmål brukes aldri som filler.

Naturkoblinger ved Places i andre hovedkategorier er betingede subsystemdata og gjør ikke `nature` til en ekstra PlaceCard-samling. Slike koblinger skal fortsatt være dokumenterte og canonical.

## 15. Wonderkammer

Wonderkammer er legacy migreringsgrunnlag.

Det skal ikke produseres nye Wonderkammer-entries som del av den canonical sted-for-sted-modellen.

Legacy-data klassifiseres etter faktisk innhold til Objects, Details, Spots, People, Works, Nature, På stedet, relations/NextUp, Historie eller Stories.

## 16. Civication

Civication Store / Thingstore er et separat spillsystem.

Et Civication-element kan presenteres via Objects når det samtidig er en virkelig, fysisk, stedsspesifikk og visuelt kvalifisert gjenstand.

Ikke alle Objects skal være kjøpbare.

## 17. Spillerstatus og progresjon

Produksjonsdata skal ikke forveksles med spillerstate.

Aktuell runtime skiller blant annet:

- `visited_places` — fysisk besøk;
- `places_collected` — quiz-/target-unlocked places;
- profilsamling — unionen av besøkte og quiz-samlede places.

Completion og read-model eies av:

- `docs/COMPLETION_DEFINITIONS.md`;
- `docs/PROGRESSION_MODEL.md`;
- `docs/QUIZ_AND_PHYSICAL_VISIT_MODEL.md`.

## 18. Routes og andre subsystemer

Rutedata, social, meetings, observations og andre subsystemer følger sine egne canonical schemaer, manifests og kontrakter.

Ikke opprett lokale place-felt som kopierer subsystem-state bare for å gjøre place-recorden «komplett».

## 19. Produksjonsgate

En dataproduksjonsendring er først klar når:

1. riktig canonical eierfil er endret;
2. alle referanser peker til eksisterende canonical IDs;
3. nødvendig manifest/load-kjede er korrekt;
4. brukerrettede fakta er kildestøttet;
5. subsystemets egen produksjonskontrakt er fulgt;
6. relevante bilder/visuelle identiteter er kontrollert;
7. relevante audits/tester passerer;
8. diffen inneholder bare tilsiktet scope.

For et komplett sted gjelder i tillegg hele `docs/PLACE_PRODUCTION_CHECKLIST.md`.
