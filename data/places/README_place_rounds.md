# History GO — canonical PlaceCard-samlinger

Status: **eneste autoritative PlaceCard-samlingskontrakt**

Eier: `place_card_collections_contract_v2`

Runtime: `js/ui/place-rounds-visual-collections.js`

Layout: `js/ui/place-rounds-fill-layout.js` og `css/place-rounds-fill-layout.css`

Schema: `data/places/regler/place_card_profile_v2.schema.json`

Sted-for-sted arbeidsflyt: `docs/PLACE_PRODUCTION_CHECKLIST.md`

Sist kontrollert: **2026-08-24**

Filnavnet beholdes midlertidig slik at gamle lenker og arbeidsløp ikke brytes. Kontrakten handler nå om **samlinger**, ikke om en kvote med runde elementer.

> **PlaceCard har alltid en full, fast 2 × 2-komposisjon. Tomme registre gir en ærlig ikon-/statusflate; de skal aldri kollapse layouten eller fylles med oppdiktet innhold.**

## 1. Fast PlaceCard-komposisjon

Den eksisterende PlaceCard-komposisjonen beholdes:

1. `frontImage`-/medieflaten ligger i kortets venstre mediefelt;
2. nøyaktig fire samlingsflater ligger i et balansert 2 × 2-felt ved siden av;
3. Badges ligger separat ved stedsoverskriften og teller ikke som samling;
4. de sju små stedspopup-snarveiene står i sitt eksisterende felt;
5. den obligatoriske, tydelige **Ta quiz**-handlingen beholdes i PlaceCard-footeren;
6. stedspopupens faner, eierskap og innhold endres ikke av denne kontrakten.

Vanlige PlaceCards viser alltid **People** som én sirkel og **Objects**, **Brands** og kategoriens samling som tre avrundede rektangler. Nature PlaceCards viser alltid **Flora** og **Fauna** som to sirkler og **Kart** og **Turmål** som to avrundede rektangler. Badges-rundingene ved overskriften kommer i tillegg og teller ikke blant de fire.

Det finnes ingen femte samlingsplass. En samling uten registrerte treff beholder ikon og forståelig tomtilstand uten å vise tallet 0; den må aldri fjernes slik at kortet får et visuelt hull.

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
    "collection_ids": ["people", "objects", "brands", "related"],
    "reason": "Den faste fulle standardkomposisjonen er kontrollert med én sirkel og tre rektangler.",
    "verifiedAt": "YYYY-MM-DD"
  }
}
```

Krav:

- `collection_ids` har nøyaktig fire unike canonical IDs;
- rekkefølgen følger den faste standard- eller naturkomposisjonen;
- innhold skal være reelt og stedsspesifikt; et tomt register vises som en ærlig reserveflate og aldri som oppdiktet innhold eller synlig 0;
- maksimalt én kategori-eid samling (`productions`, `structures`, `competitions`, `related` eller `destinations`) kan velges fordi de deler runtime-visningsplass;
- `reason` forklarer kategori-komposisjonen og dokumenterer hvilke tomme flater som fortsatt er reelle produksjonsgap;
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
4. kompletterer resultatet til den faste fireflaterskomposisjonen for kategorien;
5. faller tilbake til samme kategori-profil dersom legacy-profilen ikke kan leses sikkert.

`round_profile` er read-only legacy for nye produksjonsløp. Stedet migreres til `place_card_profile` først når det faktisk fullproduseres eller PlaceCard-kurateres.

## 5. Overgangsprofil for steder uten profil

For at gamle steder ikke skal ødelegges, kan runtime fortsatt utlede en overgangsprofil.

Vanlige steder bruker alltid:

```text
people · objects · brands · kategoriens samling
```

Natursteder bruker alltid:

```text
flora · fauna · map · destinations
```

Kategoriens naturlige samling fyller alltid den fjerde plassen. Manglende registrerte treff vises som ikon-/statusreserve uten falskt innhold:

| Kategori | Kategori-eid samling | Brukerrettet navn |
| --- | --- | --- |
| `kunst` | `productions` | Kunstverk |
| `litteratur` | `productions` | Bøker og tekster |
| `musikk` | `productions` | Sanger og album |
| `film_tv` | `productions` | Filmer og serier |
| `scenekunst` | `productions` | Forestillinger |
| `media` | `productions` | Utgivelser |
| `subkultur` | `productions` | Uttrykk og utgivelser |
| `popkultur` | `productions` | Uttrykk og utgivelser |
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

En fysisk Civication-post kan leses som compatibility-kilde når den faktisk oppfyller Objects-kontrakten. Det gjør ikke Civication til en samling. En tom eller svak Objects-kilde fylles aldri med en vilkårlig gjenstand; flaten beholder i stedet sin ærlige reservevisning.

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

Gamle `subplaces`-/`spots`-data kan bare brukes som compatibility-kilde når posten uttrykkelig beskriver en bygning eller et anlegg. Objects og Structures kan ha hver sin faste flate, men samme fysiske element må aldri dupliseres eller gis et kunstig skille mellom samlingene.

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

Badges teller ikke blant de fire samlingene. Hvert sted skal ha fungerende fagverk-side etter produksjonssjekklisten.

Quiz er en obligatorisk, tydelig PlaceCard-handling i footeren. Quiz skal ikke gjøres valgfri, skjules eller flyttes inn i samlingsfeltet. Samlingsantall har ingen innvirkning på quizkravet.

## 19. Produksjonsgate

Et sted er PlaceCard-ferdig når:

1. Badges vises separat ved overskriften og åpner riktig fagverk-side;
2. Quiz vises som obligatorisk, tydelig handling og åpner riktig stedquiz;
3. nøyaktig fire samlingsflater er valgt i `place_card_profile` etter kategoriens faste komposisjon;
4. samlinger med innhold er relevante og stedsspesifikke; tomme registre viser ærlig reserveflate uten falskt 0;
5. vanlige kort har People som sirkel og tre rektangler; Nature har Flora og Fauna som sirkler og to rektangler;
6. den fulle 2 × 2-layouten er kontrollert på mobil og desktop;
7. Bilder finnes bare i medie-/bildeeierne og aldri som samling eller reserve;
8. hver samling åpner korrekt popupinnhold, antall og datakilde;
9. ødelagt preview faller tilbake til ikon og antall uten ødelagt bildeikon;
10. People-previewet filtrerer ikke People-popupen;
11. naturkartet åpner faktisk detaljkart;
12. ingen delsted-, Object-/Structure-, Brand- eller relasjonseier er feil;
13. stedspopupen er uendret og fullverdig kontrollert etter popupkontrakten;
14. schema, typer, renderer, layout og relevante permanente tester passerer.

**Stoppgate:** PlaceCard kan ikke ferdigmeldes før runtime, schema og tester støtter den fulle modellen. Manglende innhold skal registreres som et produksjonsgap, men PlaceCard-komposisjonen skal fortsatt være full og visuelt stabil.
