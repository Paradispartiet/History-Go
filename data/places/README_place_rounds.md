# History GO — canonical PlaceCard-samlinger

Status: **eneste autoritative PlaceCard-samlingskontrakt**

Eier: `place_card_collections_contract_v2`

Runtime: `js/ui/place-rounds-visual-collections.js`

Layout: `js/ui/place-rounds-fill-layout.js` og `css/place-rounds-fill-layout.css`

Schema: `data/places/regler/place_card_profile_v2.schema.json`

Sted-for-sted arbeidsflyt: `docs/PLACE_PRODUCTION_CHECKLIST.md`

Sist kontrollert: **2026-08-26**

Filnavnet beholdes midlertidig slik at gamle lenker og arbeidsløp ikke brytes. Kontrakten handler nå om **samlinger**, ikke om en kvote med runde elementer.

> **PlaceCard har alltid en full, fast 2 × 2-komposisjon. På nye og fullproduserte steder skal hver flate vise et faktisk bilde av ett canonical medlem i samlingen. Ikon-/statusfallback er bare en runtime-sikring ved lasting eller feil og er aldri godkjent ferdigstatus.**

Denne fireflatersregelen gjelder standard Places. Canonical Micro Places med
`placeTier: "micro"` bruker i stedet det forenklede kortet definert i
`docs/MICRO_PLACE_CONTRACT.md` og skal ikke ha `place_card_profile`.

## 1. Fast PlaceCard-komposisjon

Den eksisterende PlaceCard-komposisjonen beholdes:

1. `frontImage`-/medieflaten ligger i kortets venstre mediefelt;
2. nøyaktig fire samlingsflater ligger i et balansert 2 × 2-felt ved siden av;
3. Badges ligger separat ved stedsoverskriften og teller ikke som samling;
4. de sju små stedspopup-snarveiene står i sitt eksisterende felt;
5. den obligatoriske, tydelige **Ta quiz**-handlingen beholdes i PlaceCard-footeren;
6. hver samling åpner sin egen brukerrettede popup og kan der vise semantisk eide underseksjoner uten å opprette nye samlingsflater eller dupliserte stedspopupfaner.

`frontImage` skal være et stående bilde eller et ferdig, kildeført stående utsnitt. Den publiserte filen/varianten skal ha høyde større enn bredde, med dokumentert orientering, dimensjoner, utsnitt og proveniens. Å plassere en liggende kildefil i en stående CSS-ramme med `object-fit` oppfyller ikke kravet alene.

Vanlige PlaceCards viser alltid **People** som én sirkel og **Objects**, **Brands** og kategoriens samling som tre avrundede rektangler. Nature PlaceCards viser alltid **Flora** og **Fauna** som to sirkler og **Kart** og **Turmål** som to avrundede rektangler. Badges-rundingene ved overskriften kommer i tillegg og teller ikke blant de fire.

Det finnes ingen femte samlingsplass. En samling uten registrerte treff beholder ikon og forståelig tomtilstand uten å vise tallet 0; den må aldri fjernes slik at kortet får et visuelt hull. For et nytt eller fullprodusert sted er denne tomtilstanden samtidig en produksjonsblocker: samlingen og minst ett bildeklart canonical medlem må produseres før closeout.

### Samlingspopup er ikke en ny samling

En samlingspopup kan ha flere seksjoner når de beskriver den samme semantiske eieren. Eksempler:

- **Objects/Gjenstander** kan ha canonical gjenstandsliste + «Spor og objekter» + «Legg merke til»;
- **People** kan ha canonical personliste + personrelasjoner;
- **Relaterte steder** kan ha place→place-relasjoner.

Disse seksjonene teller aldri som egne PlaceCard-samlinger og skal ikke få egne plasseringer i 2 × 2-feltet.

## 2. Formregler

- `people`, `flora` og `fauna` vises som sirkler;
- alle øvrige samlinger vises som avrundede rektangler;
- Badges er en separat handling ved overskriften og kan beholde sin sirkelform;
- formen endrer bare presentasjonen, aldri popupens data eller samlingens innhold;
- hver av de fire flatene viser et bilde av ett faktisk medlem fra sin kvalifiserte samling; previewet filtrerer aldri popupinnholdet;
- People/Flora/Fauna bruker et bilde av personen/arten, Objects bruker det konkrete objektet, Brands bruker verifisert logo/brandmark, og øvrige samlinger bruker et bilde av det viste medlemmet eller et faktisk detaljkart for `map`;
- generisk ikon, navn, antall eller stedets `frontImage` kan ikke brukes som ferdig samlingspreview.

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
- innhold skal være reelt og stedsspesifikt; alle fire samlinger skal ha minst ett canonical medlem med validert bilde før fullproduksjon kan lukkes;
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

Legacy popupinnhold som tidligere ble samlet under `Mer`, migreres **presentasjonsmessig** til riktig samlingspopup eller Om etter `docs/PLACE_POPUP_SYSTEM.md`; dette endrer ikke source-data eller `place_card_profile`.

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

Kategoriens naturlige samling fyller alltid den fjerde plassen. For legacy-/overgangssteder vises manglende treff som ikon-/statusreserve uten falskt innhold. Denne kompatibilitetsvisningen teller aldri som ferdig produksjon:

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

`Spor og objekter`, `Legg merke til`, `Relasjoner`, `Betydning`, `Motpunkter`, `Kunnskap` og `Observasjoner` er **ikke** samlings-ID-er. De kan være seksjoner hos en canonical eier, men aldri femte/sjette PlaceCard-flater.

## 7. People

People viser canonical personer med dokumentert stedstilknytning. Place-eierskap vurderes per profil. En personkobling som egentlig gjelder et delsted med egen canonical Place, brukes ikke som proxy for parent-stedet. Previewet filtrerer aldri hvem som finnes i People-popupen, og falsk 0 mens People-data lastes er en blocker.

### Personrelasjoner eies av People-popupen

Når stedet har dokumenterte relasjoner som faktisk involverer personer, kan People-popupen i tillegg vise en seksjon **Relasjoner**. Dette kan omfatte person↔person eller person↔aktør-relasjoner når koblingen er kildebelagt og relevant for stedet.

Regler:

- Relasjoner er en **underseksjon**, ikke en femte samling;
- en relasjon teller ikke som en ny person i People-antallet;
- People-previewet og People-antallet eies fortsatt av canonical personlisten;
- en ren place→place-relasjon skal **ikke** ligge i People; den eies av `related`;
- relasjonsdata skal ikke dupliseres som en egen `Relasjoner`-fane i stedspopupen.

## 8. Objects

Objects er en reell samling av fysiske, identifiserbare gjenstander med dokumentert stedstilknytning. Canonical felt er `place.objects`.

En fysisk Civication-post kan leses som compatibility-kilde når den faktisk oppfyller Objects-kontrakten. Det gjør ikke Civication til en samling. En tom eller svak Objects-kilde fylles aldri med en vilkårlig gjenstand; flaten beholder i stedet sin ærlige reservevisning.

### «Spor og objekter» og «Legg merke til» eies av Objects-popupen

Objects-popupen kan supplere canonical gjenstandslisten med stedsspesifikk kunnskap fra Leksikon og andre eide kilder:

- **Spor og objekter** kan vise kildebelagte `artifacts`, object-like Leksikon-oppføringer og dokumenterte fysiske spor;
- **Legg merke til** kan vise `interpretation.what_to_notice` når dette faktisk handler om de fysiske sporene/gjenstandene brukeren kan se.

Viktig:

- supplementene endrer **ikke** Objects-antallet med mindre elementet faktisk består Objects-kontrakten og materialiseres hos canonical Objects-eier;
- samme gjenstand skal dedupliseres mot `place.objects`/`place.artifacts`;
- observasjonstekst skal ikke konstrueres til en falsk gjenstand bare for å øke antallet;
- disse seksjonene skal ikke samtidig vises som egne `Spor & objekter`- eller `Legg merke til`-faner i stedspopupen.

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

`related` er den brukerrettede eieren for **place→place-relasjoner**. En slik relasjon skal ikke flyttes til People bare fordi det finnes personer ved begge steder. People eier kun relasjonen når relasjonen semantisk gjelder en person.

## 15. Destinations

`destinations` viser navngitte turmål ved eller omkring et natursted, som topper, utsiktspunkter, strender, hytter og badeplasser. Et naturfenomen, en løs observasjon eller en terrengdetalj er ikke automatisk et Turmål.

## 16. Bilder er medieinnhold, ikke samling

`images` er fjernet fra samlingspoolen og kan aldri brukes som reserve.

Hovedbilder, galleri, historiske bilder og før-/nå-bilder beholdes hos sine eksisterende eiere og kan vises i `frontImage`-/medieflaten eller i riktig popupfane. Bilder skal dedupliseres, kilde- og lisensføres, og aldri kopieres eller gis ny identitet for å fylle PlaceCard.

`frontImage` skal publiseres i stående orientering (`height > width`). Dersom kilden er liggende, produseres en egen, redaksjonelt kontrollert stående variant med kilde, lisens, originaldimensjoner, outputdimensjoner og crop dokumentert i `frontImageMeta` eller tilsvarende canonical metadata.

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
- `Spor & objekter`, `Legg merke til`, personrelasjoner, Betydning, Motpunkter, Kunnskap og Observasjoner som egne samlingsflater;
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
4. hver av de fire samlingene har reelt, stedsspesifikt innhold og viser et faktisk bilde av ett av sine canonicale medlemmer;
5. vanlige kort har People som sirkel og tre rektangler; Nature har Flora og Fauna som sirkler og to rektangler;
6. den fulle 2 × 2-layouten er kontrollert på mobil og desktop;
7. `frontImage` er en validert stående fil/variant med dokumentert crop og proveniens; Bilder finnes bare i medie-/bildeeierne og aldri som samling eller reserve;
8. hver samling åpner korrekt popupinnhold, antall og datakilde;
9. Objects-popupen viser eventuelle `Spor og objekter`/`Legg merke til`-supplementer uten å forfalske Objects-antallet;
10. People-popupen viser relevante personrelasjoner uten å blande inn rene place→place-relasjoner;
11. `related` beholder place→place-relasjoner;
12. ingen av disse supplementene dupliseres som egne stedspopupfaner;
13. ødelagt preview faller trygt tilbake uten ødelagt bildeikon, men fallbacken registreres som blocker og kan ikke godkjennes i closeout;
14. People-previewet filtrerer ikke People-popupen;
15. naturkartet åpner faktisk detaljkart;
16. ingen delsted-, Object-/Structure-, Brand- eller relasjonseier er feil;
17. stedspopupen er fullverdig kontrollert etter popupkontrakten;
18. schema, typer, renderer, layout og relevante permanente tester passerer.

**Stoppgate:** PlaceCard kan ikke ferdigmeldes før runtime, schema og tester støtter den fulle modellen, `frontImage` er stående, og alle fire samlingsflater har lastende bilder av faktiske canonicale medlemmer. Manglende innhold eller mediefil registreres som et produksjonsgap, mens runtime fortsatt holder komposisjonen full og visuelt stabil.
