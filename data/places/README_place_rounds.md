# History GO — canonical PlaceCard-samlinger

Status: **eneste autoritative PlaceCard-samlingskontrakt**

Eier: `place_card_collections_contract_v2`

Runtime: `js/ui/place-rounds-visual-collections.js`

Layout: `js/ui/place-rounds-fill-layout.js` og `css/place-rounds-fill-layout.css`

Schema: `data/places/regler/place_card_profile_v2.schema.json`

Sted-for-sted arbeidsflyt: `docs/PLACE_PRODUCTION_CHECKLIST.md`

Sist kontrollert: **2026-08-24**

Filnavnet beholdes midlertidig slik at gamle lenker og arbeidsløp ikke brytes. Kontrakten handler nå om **samlinger**, ikke om en kvote med runde elementer.

> **PlaceCard fremhever bare samlinger som er tydelige, stedsspesifikke, substansielle og visuelt ærlige. Ingen samling opprettes for å fylle en plass.**

## 1. Fast PlaceCard-komposisjon

Den eksisterende PlaceCard-komposisjonen beholdes:

1. `frontImage`-/medieflaten ligger i kortets venstre mediefelt;
2. to, tre eller fire kvalifiserte samlinger ligger balansert i samlingsfeltet ved siden av;
3. Badges ligger separat ved stedsoverskriften og teller ikke som samling;
4. de sju små stedspopup-snarveiene står i sitt eksisterende felt;
5. den obligatoriske, tydelige **Ta quiz**-handlingen beholdes i PlaceCard-footeren;
6. stedspopupens faner, eierskap og innhold endres ikke av denne kontrakten.

Antall samlinger følger innholdet:

- **2 samlinger:** én balansert rad;
- **3 samlinger:** 2 + 1, med siste samling sentrert;
- **4 samlinger:** balansert 2 × 2.

Det finnes ingen femte innholdsplass og ingen minimumskvote på fire.

## 2. Formregler

- `people`, `flora` og `fauna` vises som sirkler;
- alle øvrige samlinger vises som avrundede rektangler;
- Badges er en separat handling ved overskriften og kan beholde sin sirkelform;
- formen endrer bare presentasjonen, aldri popupens data eller samlingens innhold;
- bilde-preview kan brukes inne i en kvalifisert samling, men previewet filtrerer aldri popupinnholdet.

## 3. Canonical profil for nye og fullproduserte steder

Nye og vesentlig reviderte steder bruker:

```json
{
  "place_card_profile": {
    "schema": "history_go_place_card_profile_v2",
    "collection_ids": ["people", "objects", "related"],
    "reason": "Tre dokumenterte og tydelig forskjellige stedssamlinger består innholds- og UI-gaten.",
    "verifiedAt": "YYYY-MM-DD"
  }
}
```

Krav:

- `collection_ids` har 2–4 unike canonical IDs;
- rekkefølgen er redaksjonelt valgt og blir visningsrekkefølgen;
- hver valgt samling har reelt, stedsspesifikt innhold og forståelig brukerbetydning;
- maksimalt én kategori-eid samling (`productions`, `structures`, `competitions`, `related` eller `destinations`) kan velges fordi de deler runtime-visningsplass;
- `reason` forklarer hvorfor akkurat disse samlingene består og hvorfor relevante utelatelser ikke er filler;
- `verifiedAt` viser siste reelle innholds- og UI-kontroll;
- schemaet skal valideres, men strukturell schema-PASS erstatter aldri redaksjonell kontroll.

## 4. Bakoverkompatibilitet

Eksisterende steder migreres ikke samlet.

Runtime leser fortsatt legacy:

```json
{
  "round_profile": {
    "schema": "history_go_place_round_profile_v1",
    "content_round_ids": ["people", "images", "brands", "related"],
    "reason": "Tidligere auditert profil",
    "verifiedAt": "YYYY-MM-DD"
  }
}
```

Kompatibilitetslaget:

1. bevarer rekkefølgen på støttede samlinger;
2. dedupliserer IDs;
3. fjerner `images`, fordi Bilder ikke lenger er en samling;
4. godtar resultatet når 2–4 støttede samlinger gjenstår;
5. faller tilbake til kategoriens overgangsprofil dersom legacy-profilen ikke kan leses sikkert.

`round_profile` er read-only legacy for nye produksjonsløp. Stedet migreres til `place_card_profile` først når det faktisk fullproduseres eller PlaceCard-kurateres.

## 5. Overgangsprofil for steder uten profil

For at gamle steder ikke skal ødelegges, kan runtime fortsatt utlede en overgangsprofil.

Vanlige steder starter fra:

```text
people · objects · brands
```

Natursteder starter fra:

```text
map · flora · fauna
```

Når kategoriens naturlige samling har reelt runtime-innhold, kan den legges til som nummer fire:

| Kategori | Kategori-eid samling | Brukerrettet navn |
| --- | --- | --- |
| `kunst` | `productions` | Kunstverk |
| `litteratur` | `productions` | Bøker og tekster |
| `musikk` | `productions` | Sanger og album |
| `film_tv` | `productions` | Filmer og serier |
| `scenekunst` | `productions` | Forestillinger |
| `media` | `productions` | Utgivelser |
| `subkultur` | `productions` | Uttrykk og utgivelser |
| `sport` | `competitions` | Kamper og konkurranser |
| `natur` | `destinations` | Turmål |
| `by` | `structures` | Bygg og anlegg |
| `religion` | `structures` | Bygg og anlegg |
| `naeringsliv` | `structures` | Bygg og anlegg |
| `historie` | `related` | Relaterte steder |
| `politikk` | `related` | Relaterte steder |
| `vitenskap` | `related` | Relaterte steder |
| `filosofi` | `related` | Relaterte steder |
| `psykologi` | `related` | Relaterte steder |

Overgangsprofilen er kompatibilitet, ikke redaksjonell ferdigstatus. Ved fullproduksjon skal alle kandidatene vurderes, og den nye eksplisitte profilen skal velges.

## 6. Canonical samlingspool

```text
people
objects
brands
map
flora
fauna
productions
structures
competitions
related
destinations
```

`badges` står separat ved overskriften og inngår ikke i poolen.

## 7. People

People viser canonical personer med dokumentert stedstilknytning. Place-eierskap vurderes per profil. En personkobling som egentlig gjelder et delsted med egen canonical Place, brukes ikke som proxy for parent-stedet. Previewet filtrerer aldri hvem som finnes i People-popupen, og falsk 0 mens People-data lastes er en blocker.

## 8. Objects

Objects er en reell samling av fysiske, identifiserbare gjenstander med dokumentert stedstilknytning. Canonical felt er `place.objects`.

En fysisk Civication-post kan leses som compatibility-kilde når den faktisk oppfyller Objects-kontrakten. Det gjør ikke Civication til en samling. Én vilkårlig gjenstand er ikke automatisk nok til å etablere en god PlaceCard-samling.

## 9. Brands

Canonical semantisk eier er `data/brands/brand_rules_v1_1.json`.

Brands betyr selvstendige, sosialt gjenkjennelige navn og identiteter med dokumentert stedskobling. Profesjonelle firmaer, arkitektur- og ingeniørfirmaer, historiske virksomheter, venue-identiteter og institusjonsbrands kan kvalifisere når Brand-reglene består; aktørtypen er heller ikke et avslag i seg selv. Brands er ikke en restkategori, og null treff i dagens register er ikke alene grunnlag for N/A.

## 10. Map, Flora og Fauna

- `map` åpner et faktisk tur-/naturkart og faller aldri tilbake til det generelle hovedkartet;
- `flora` viser dokumenterte plantearter eller floraenheter knyttet til stedet;
- `fauna` viser dokumenterte dyrearter eller faunaenheter knyttet til stedet;
- naturprofilen skal aldri fylles med generisk naturinnhold som ikke gjelder stedet.

## 11. Productions

`productions` brukes bare der en produksjonssamling er et naturlig brukerbegrep. Samlingen heter aldri generelt «Verk» i grensesnittet.

Tillatte brukerrettede navn er Kunstverk, Bøker og tekster, Sanger og album, Filmer og serier, Forestillinger, Utgivelser og Uttrykk og utgivelser.

En produksjon er ikke det samme som en fysisk gjenstand: en sang kan høre til i Sanger og album, mens instrumentet er et Object; en bok kan høre til i Bøker og tekster, mens originalmanuskriptet er et Object.

## 12. Structures

`structures` betyr navngitte bygninger og anlegg som utgjør en reell samling ved stedet, som haller, tårn, tribuner, broer, verksteder eller andre identifiserbare konstruksjoner.

Gamle `subplaces`-/`spots`-data kan bare brukes som compatibility-kilde når posten uttrykkelig beskriver en bygning eller et anlegg. Objects og Structures velges ikke sammen når skillet er kunstig eller begge beskriver de samme fysiske elementene.

## 13. Competitions

`competitions` betyr dokumenterte kamper, løp, finaler, stevner og turneringer knyttet til et sportssted. Det finnes ingen generell Sport-samling. Utøvere hører i People, drakter og pokaler i Objects, og klubber/arenaidentiteter i Brands.

## 14. Related

`related` viser faktiske andre History GO-steder med dokumentert relasjon. Samlingen inneholder ikke tekstlige temaer, løse nøkkelord eller oppdiktede punkter. Et sted med egen canonical oppføring vises bare som eksplisitt relasjon, aldri som parent-stedets Object eller Structure.

## 15. Destinations

`destinations` viser navngitte turmål ved eller omkring et natursted, som topper, utsiktspunkter, strender, hytter og badeplasser. Et naturfenomen, en løs observasjon eller en terrengdetalj er ikke automatisk et Turmål.

## 16. Bilder er medieinnhold, ikke samling

`images` er fjernet fra samlingspoolen og kan aldri brukes som reserve.

Hovedbilder, galleri, historiske bilder og før-/nå-bilder beholdes hos sine eksisterende eiere og kan vises i `frontImage`-/medieflaten eller i riktig popupfane. Bilder skal dedupliseres, kilde- og lisensføres, og aldri kopieres eller gis ny identitet for å fylle PlaceCard.

Fjerningen av Bilder som samling reduserer ikke bildeproduksjonen eller provenienskravene.

## 17. Ikke PlaceCard-samlinger

Følgende er ikke canonical samlinger:

- `images` / Bilder;
- `works` / generisk Verk;
- `details` / Detaljer;
- `spots` / Punkter;
- generisk `nature`;
- Civication og Wonderkammer;
- Før/etter, Fortellinger/Stories, Leksikon, Nyheter og Lesespor;
- Lek, Trening, Oppgaver, Events, Observer og Notat;
- Quiz;
- Rute;
- de sju stedspopup-SVG-ene.

Disse kan fortsatt være viktige deler av den samlede stedsopplevelsen hos sine canonical eiere. At de ikke er PlaceCard-samlinger betyr aldri at de er valgfrie i stedsproduksjonen.

## 18. Badges og Quiz

Badges står separat ved stedsoverskriften og åpner:

```text
fagverk-sted.html?place=<place_id>
```

Badges teller ikke blant de 2–4 samlingene. Hvert sted skal ha fungerende fagverk-side etter produksjonssjekklisten.

Quiz er en obligatorisk, tydelig PlaceCard-handling i footeren. Quiz skal ikke gjøres valgfri, skjules eller flyttes inn i samlingsfeltet. Samlingsantall har ingen innvirkning på quizkravet.

## 19. Produksjonsgate

Et sted er PlaceCard-ferdig når:

1. Badges vises separat ved overskriften og åpner riktig fagverk-side;
2. Quiz vises som obligatorisk, tydelig handling og åpner riktig stedquiz;
3. 2–4 samlinger er valgt i `place_card_profile` etter reell kandidatvurdering;
4. alle valgte samlinger er relevante, stedsspesifikke, substansielle og tydelig forskjellige;
5. People, Flora og Fauna er sirkler, mens øvrige samlinger er avrundede rektangler;
6. 2-, 3- eller 4-layouten er kontrollert på mobil og desktop;
7. Bilder finnes bare i medie-/bildeeierne og aldri som samling eller reserve;
8. hver samling åpner korrekt popupinnhold, antall og datakilde;
9. ødelagt preview faller tilbake til ikon og antall uten ødelagt bildeikon;
10. People-previewet filtrerer ikke People-popupen;
11. naturkartet åpner faktisk detaljkart;
12. ingen delsted-, Object-/Structure-, Brand- eller relasjonseier er feil;
13. stedspopupen er uendret og fullverdig kontrollert etter popupkontrakten;
14. schema, typer, renderer, layout og relevante permanente tester passerer.

**Stoppgate:** PlaceCard kan ikke ferdigmeldes før runtime, schema og tester støtter den valgte modellen. Ingen fjerde samling skal produseres bare for å demonstrere 2 × 2-layouten.
