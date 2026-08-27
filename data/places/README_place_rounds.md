# History GO — canonical PlaceCard-samlinger

Status: **eneste autoritative PlaceCard-samlingskontrakt**

Eier: `place_card_collections_contract_v2`

Runtime: `js/ui/place-rounds-visual-collections.js`

Layout: `js/ui/place-rounds-fill-layout.js` og `css/place-rounds-fill-layout.css`

Schema: `data/places/regler/place_card_profile_v2.schema.json`

Sted-for-sted arbeidsflyt: `docs/PLACE_PRODUCTION_CHECKLIST.md`

Produksjonsprofiler: `docs/PLACE_PRODUCTION_PROFILES.md`

Sist kontrollert: **2026-08-27**

Filnavnet beholdes midlertidig slik at gamle lenker og arbeidsløp ikke brytes. Kontrakten handler nå om **samlinger**, ikke om en kvote med runde elementer.

> **PlaceCard har fortsatt en full, fast 2 × 2-komposisjon. En relevant og kvalifisert samlingsflate skal vise et faktisk bilde av ett canonical medlem. Dersom korrekt kandidataudit etter stedets bekreftede produksjonsprofil ender `BEGRUNNET N/A`, er en ærlig ikon-/statusfallback tillatt som sluttstatus for akkurat den semantisk tomme flaten. Filler er aldri tillatt.**

Denne fireflatersregelen gjelder ordinære Places. Canonical Micro Places med
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

Det finnes ingen femte samlingsplass. En samling uten registrerte treff beholder ikon og forståelig tomtilstand uten å vise tallet 0; den må aldri fjernes slik at kortet får et visuelt hull. For et nytt eller fullprodusert sted er tomtilstanden en produksjonsblocker **når samlingen er relevant og burde ha kvalifisert innhold**. Når produksjonsprofilens dokumenterte kandidataudit har konkludert `BEGRUNNET N/A`, skal tomtilstanden beholdes ærlig og er ikke i seg selv en blocker.

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
- hver relevant og kvalifisert flate viser et bilde av ett faktisk medlem fra sin samling; previewet filtrerer aldri popupinnholdet;
- People/Flora/Fauna bruker et bilde av personen/arten, Objects bruker det konkrete objektet, Brands bruker verifisert logo/brandmark, og øvrige samlinger bruker et bilde av det viste medlemmet eller et faktisk detaljkart for `map`;
- generisk ikon, navn, antall eller stedets `frontImage` kan ikke brukes som ferdig samlingspreview for en relevant samling;
- en profilgodkjent `BEGRUNNET N/A`-flate bruker runtime-fallback som en **ærlig tomtilstand**, ikke som en falsk ferdig preview.

## 3. Canonical profil for nye og fullproduserte steder

Nye og vesentlig reviderte ordinære steder bruker:

```json
{
  "place_card_profile": {
    "schema": "history_go_place_card_profile_v2",
    "collection_ids": ["people", "objects", "brands", "related"],
    "reason": "Den faste standardkomposisjonen er kandidatvurdert mot bekreftet produksjonsprofil; relevante samlinger er fylt og eventuelle N/A-flater er dokumentert i arbeidskortet.",
    "verifiedAt": "YYYY-MM-DD"
  }
}
```

Krav:

- `collection_ids` har nøyaktig fire unike canonical IDs;
- rekkefølgen følger den faste standard- eller naturkomposisjonen;
- hver **relevant** samling skal ha reelt, stedsspesifikt canonical innhold med validert bilde før fullproduksjon kan lukkes;
- en tom flate kan bare være ferdig når stedets `PRODUKSJONSPROFIL` er `confirmed` og samlingen er eksplisitt dokumentert `BEGRUNNET N/A` etter korrekt kandidataudit;
- maksimalt én kategori-eid samling (`productions`, `structures`, `competitions`, `related` eller `destinations`) kan velges fordi de deler runtime-visningsplass;
- `reason` forklarer kategori-komposisjonen; arbeidskortet eier den detaljerte PASS/N/A/BLOCKED-beslutningen for hver betinget samling;
- `verifiedAt` viser siste reelle innholds- og UI-kontroll;
- schemaet skal valideres, men strukturell schema-PASS erstatter aldri redaksjonell kontroll;
- `BEGRUNNET N/A` kan aldri brukes hvis research faktisk har funnet en kvalifisert entity som bare mangler materialisering eller bilde.

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

Kategoriens naturlige samling fyller alltid den fjerde plassen. For legacy-/overgangssteder vises manglende treff som ikon-/statusreserve uten falskt innhold. Denne kompatibilitetsvisningen er ikke i seg selv bevis på verken PASS eller N/A; status avgjøres først ved profilert stedsproduksjon og kandidataudit.

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

Overgangsprofilen er kompatibilitet, ikke redaksjonell ferdigstatus. Ved fullproduksjon skal kandidatene vurderes, og den nye eksplisitte profilen skal brukes sammen med den bekreftede produksjonsprofilen.

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

En faktisk tom People-kandidataudit kan ende `BEGRUNNET N/A` for `standard`/`focused` når det ikke finnes en person som består People-kontrakten. Det er bedre enn å produsere en perifer person bare for å fylle sirkelen. `major` forventes normalt å ha sterk People-dekning, men evidens vinner også der.

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

En fysisk Civication-post kan leses som compatibility-kilde når den faktisk oppfyller Objects-kontrakten. Det gjør ikke Civication til en samling. En tom eller svak Objects-kilde fylles aldri med en vilkårlig gjenstand; flaten beholder i stedet sin ærlige reservevisning. Etter full kandidataudit kan dette være `BEGRUNNET N/A` i den bekreftede produksjonsprofilen.

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

Brand-kandidater skal alltid researches etter Brand-kontrakten. Når alle plausible kandidater er vurdert og ingen består definisjonen, er `BEGRUNNET N/A` en gyldig profilstatus. Det skal **aldri** konstrueres et historisk «brand» fra virksomhetsnavn, stedets navn, eiernavn eller et tilfeldig skilt bare for å få et bilde i Brands-flaten.

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

Gamle `subplaces`-/`spots`-data kan bare brukes som compatibility-kilde når posten uttrykkelig beskriver en bygning eller et anlegg. Objects og Structures kan ha hver sin faste flate, men samme fysiske element må aldri dupliseres eller gis et kunstig skille mellom samlingene. Hvis stedet ikke bærer en reell Structures-samling etter audit, brukes `BEGRUNNET N/A` fremfor å splitte ett fysisk spor kunstig.

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

Disse kan fortsatt være viktige deler av den samlede stedsopplevelsen hos sine canonical eiere. At de ikke er PlaceCard-samlinger betyr at relevans og produksjonskrav avgjøres av `docs/PLACE_PRODUCTION_CHECKLIST.md`, `docs/PLACE_PRODUCTION_PROFILES.md` og subsystemets egen kontrakt — ikke av et behov for å fylle PlaceCard.

## 18. Badges og Quiz

Badges står separat ved stedsoverskriften og åpner:

```text
fagverk-sted.html?place=<place_id>
```

Badges teller ikke blant de fire samlingene. Hvert ordinært sted skal ha fungerende fagverk-side etter produksjonssjekklisten.

Quiz beholdes som en tydelig PlaceCard-handling i footeren. Quizens produksjonsomfang og eventuelle evidensbaserte avgrensning avgjøres av den canonicale Quiz-kontrakten og produksjonsprofilen; samlingsfullness kan aldri brukes som grunn til å skrive svake eller dupliserte spørsmål.

## 19. Produksjonsgate

Et ordinært sted er PlaceCard-ferdig når:

1. Badges vises separat ved overskriften og åpner riktig fagverk-side;
2. Quiz-handlingen følger gjeldende Quiz-/produktkontrakt for stedet;
3. nøyaktig fire samlingsflater er valgt i `place_card_profile` etter dagens faste runtime-komposisjon;
4. hver **relevant** samling har reelt, stedsspesifikt innhold og viser et faktisk bilde av ett av sine canonicale medlemmer;
5. hver tom samling som godkjennes som sluttstatus er dokumentert `BEGRUNNET N/A` under en `confirmed` produksjonsprofil og har en etterprøvbar kandidataudit;
6. vanlige kort har People som sirkel og tre rektangler; Nature har Flora og Fauna som sirkler og to rektangler;
7. den fulle 2 × 2-layouten er kontrollert på mobil og desktop;
8. `frontImage` er en validert stående fil/variant med dokumentert crop og proveniens; Bilder finnes bare i medie-/bildeeierne og aldri som samling eller reserve;
9. hver relevant samling åpner korrekt popupinnhold, antall og datakilde; en N/A-samling viser en ærlig tomtilstand uten falske entities;
10. Objects-popupen viser eventuelle `Spor og objekter`/`Legg merke til`-supplementer uten å forfalske Objects-antallet;
11. People-popupen viser relevante personrelasjoner uten å blande inn rene place→place-relasjoner;
12. `related` beholder place→place-relasjoner;
13. ingen av disse supplementene dupliseres som egne stedspopupfaner;
14. ødelagt preview for en **relevant** samling faller trygt tilbake, men registreres som blocker; profilgodkjent N/A-fallback er derimot en gyldig tomtilstand;
15. People-previewet filtrerer ikke People-popupen;
16. naturkartet åpner faktisk detaljkart når `map` er relevant;
17. ingen delsted-, Object-/Structure-, Brand- eller relasjonseier er feil;
18. stedspopupen er fullverdig kontrollert etter popupkontrakten og den bekreftede produksjonsprofilen;
19. schema, typer, renderer, layout og relevante permanente tester passerer.

**Stoppgate:** PlaceCard kan ikke ferdigmeldes før runtime, schema og tester støtter den faste modellen, `frontImage` er stående, alle relevante samlingsflater har lastende bilder av faktiske canonicale medlemmer, og alle tomme flater er eksplisitt dokumentert `BEGRUNNET N/A`. Manglende relevant innhold eller mediefil er fortsatt et produksjonsgap. Manglende semantisk kandidat etter korrekt audit skal aldri repareres med filler.
