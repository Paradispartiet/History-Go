# History GO — canonical PlaceCard-samlinger

Status: **eneste autoritative PlaceCard-samlingskontrakt**  
Eier: `place_card_collections_contract_v2`  
Runtime: `js/ui/place-rounds-visual-collections.js`  
Layout: `js/ui/place-rounds-fill-layout.js` og `css/place-rounds-fill-layout.css`  
Schema: `data/places/regler/place_card_profile_v2.schema.json`  
Sted-for-sted arbeidsflyt: `docs/PLACE_PRODUCTION_CHECKLIST.md`  
Sist kontrollert: **2026-09-16**

Filnavnet beholdes slik at gamle lenker og arbeidsløp ikke brytes. Kontrakten handler om **samlinger**, ikke om dekorative rundinger eller en meny over alt et sted inneholder.

> **Et fullprodusert ordinært Place viser én til fire ferdige, relevante innholdssamlinger. Bare samlinger stedet faktisk bærer vises. Related er ikke en PlaceCard-samling.**

## 1. Adaptiv fullkomposisjon

Et fullprodusert ordinært PlaceCard viser:

1. én stående `frontImage`-/medieflate;
2. én til fire ferdige innholdssamlinger i en adaptiv, balansert komposisjon;
3. Badges separat ved stedsoverskriften;
4. de sju små stedspopup-snarveiene i sitt eget felt;
5. tydelig obligatorisk Quiz-handling i PlaceCard-footeren.

Badge, Quiz, bilder, Stories, Før/etter, Leksikon, relasjoner og popupfaner teller ikke som PlaceCard-samlinger.

Det finnes ingen tomme reservefelt. Dersom en kandidatsamling ikke har et ekte, kvalifisert, bildeklart medlem etter dokumentert kandidataudit, avsluttes den som `BEGRUNNET N/A` og vises ikke. Dersom en reell kvalifisert kandidat finnes, men evidens, asset, proveniens eller materialisering mangler, er samlingen `BLOCKED`. Micro følger sin egen kontrakt og kan aldri brukes som snarvei rundt manglende produksjon.

## 2. Grunnprofiler

Vanlige fullproduserte Places vurderer disse kandidatsamlingene:

```text
People · Objects · Brands · kategoriuttrykk
```

De er ikke universelle slots. Bare kandidatsamlinger med `PASS` legges i `place_card_profile.collection_ids`.

Natursteder følger sin eksplisitte spesialprofil:

```text
Kart · Flora · Fauna · Turmål
```

Canonicale Miljø og gjenbruk-steder med spesialprofil bruker:

```text
Ombruk · Materialer · Miljø · Systemer
```

Kategoriuttrykket viser hva kategorien faktisk frembringer, gjør eller organiserer: verk, hendelser, metoder, praksiser, behandlinger, programmer, konkurranser, produksjon eller byrom. Det skal ikke erstattes av `related` eller en tilfeldig Structure bare for å fylle layouten.

## 3. Alle 19 hovedkategorier

Tabellen viser kandidatsettet som skal vurderes, ikke en obligatorisk firefeltskvote.

| Kategori | Kandidatsamlinger | Brukerrettet kategoriuttrykk |
| --- | --- | --- |
| `by` | People · Objects · Brands · Structures | **Byrom og anlegg** |
| `historie` | People · Objects · Brands · Historical Events | **Historiske hendelser** |
| `kunst` | People · Objects · Brands · Productions | **Kunstverk** |
| `litteratur` | People · Objects · Brands · Productions | **Bøker og tekster** |
| `media` | People · Objects · Brands · Productions | **Utgivelser og sendinger** |
| `musikk` | People · Objects · Brands · Productions | **Sanger og album** |
| `naeringsliv` | People · Objects · Brands · Productions | **Produksjon og tjenester** |
| `natur` | Map · Flora · Fauna · Destinations | **Turmål** |
| `politikk` | People · Objects · Brands · Productions | **Hendelser og vedtak** |
| `psykologi` | People · Objects · Brands · Productions | **Studier og metoder** |
| `helse` | People · Objects · Brands · Productions | **Behandling og omsorg** |
| `utdanning` | People · Objects · Brands · Productions | **Pedagogikk og programmer** |
| `religion` | People · Objects · Brands · Productions | **Ritualer og tradisjoner** |
| `scenekunst` | People · Objects · Brands · Productions | **Forestillinger** |
| `sport` | People · Objects · Brands · Competitions | **Kamper og konkurranser** |
| `subkultur` | People · Objects · Brands · Productions | **Uttrykk og utgivelser** |
| `vitenskap` | People · Objects · Brands · Productions | **Forskning og oppdagelser** |
| `filosofi` | People · Objects · Brands · Productions | **Tekster og fagverk** |
| `film_tv` | People · Objects · Brands · Productions | **Filmer og serier** |

Alias normaliseres gjennom `data/categories/category_contract.json`; alias oppretter aldri en ny samlingsprofil.

### Stedsspesifikk Structure-variant

`Structures` er ikke automatisk kategoriuttrykk utenfor By. Den kan erstatte kategoriens normale uttrykk når flere navngitte bygg eller anlegg utgjør en selvstendig, sentral og bildeklart dokumentert gruppe ved akkurat dette stedet.

Eksempler kan være et fabrikkkompleks, sykehusanlegg, universitetscampus eller klosterkompleks. At en virksomhet holder til i en bygning er ikke nok. Valget og hvorfor det er bedre enn kategoriens normaluttrykk skal begrunnes i arbeidskortet.

Freia-fabrikken kan derfor bruke Structures dersom fabrikkbygningene, Freiasalen og Freiaparken utgjør et reelt fysisk anleggsspor. Det gjør ikke Structures til standard for alle Næringsliv-steder og tvinger heller ikke People, Objects eller Brands inn dersom kandidatauditen ender `BEGRUNNET N/A`.

## 4. Form og bilde

- `people`, `flora` og `fauna` vises som sirkler;
- øvrige samlinger vises som avrundede rektangler;
- Badges står separat og kan beholde sin egen form;
- `frontImage` er en faktisk stående fil/variant med `height > width`;
- hver valgt samling viser et lastet bilde av ett faktisk canonical medlem i samlingen;
- previewet er en inngang til hele samlingen og filtrerer aldri popupinnholdet;
- ikon-/statusfallback er bare runtime-feilhåndtering og kan ikke lukke produksjonsgaten.

Et tomt kort, et synlig 0-tall, et bilde fra en annen samling eller `frontImage` gjenbrukt som falskt medlemsbilde er blocker. En `BEGRUNNET N/A`-samling vises ikke som tomt kort.

## 5. Canonical profil

Et ordinært fullprodusert sted kan for eksempel bruke:

```json
{
  "place_card_profile": {
    "schema": "history_go_place_card_profile_v2",
    "collection_ids": ["people", "structures"],
    "reason": "Kandidataudit bekrefter People og Structures som de to kildebårne, bildeklare samlingene for stedet; Objects og Brands er begrunnet N/A.",
    "verifiedAt": "YYYY-MM-DD"
  }
}
```

Krav:

- `collection_ids` har én til fire unike canonical IDs, i tråd med schemaets `minItems: 1` og `maxItems: 4`;
- listen inneholder bare samlinger med `PASS`;
- vanlig profil vurderer People, Objects, Brands og kategoriuttrykket, men krever ikke at alle fire materialiseres;
- Nature og canonicale spesialprofiler følger sine eksplisitte faste sett;
- `related`, `images`, `badges` og popup-/handlingsflater kan aldri forekomme i `collection_ids`;
- hvert medlem og hvert preview følger sin egen subsystemkontrakt;
- `reason` forklarer hvorfor valgte samlinger kvalifiserer og eventuelle `BEGRUNNET N/A`-avgjørelser dokumenteres i arbeidskortet;
- `verifiedAt` er datoen for reell innholds- og UI-kontroll.

Schema-PASS er aldri nok dersom innhold, bilde eller eierskap er feil.

## 6. Canonical samlingspool

```text
people
objects
brands
map
flora
fauna
historical_events
productions
structures
competitions
destinations
reuse
materials
environment
systems
```

`badges` står separat. `related` er et relasjons- og navigasjonssystem og inngår ikke i PlaceCard-poolen.

## 7. People

People viser canonical personer med dokumentert direkte stedstilknytning. Utvalget skal forklare stedets hovedfunksjon.

Prioriter:

1. grunnleggere, etablerere og initiativtakere;
2. eiere, ledere, arbeidere, utøvere, forskere eller andre nøkkelpersoner med en særskilt direkte rolle;
3. andre kanoniserte personer som forklarer stedets utvikling.

Arkitekter tas ikke inn automatisk fordi et bygg har en arkitekt. Arkitekten kvalifiserer som People-kandidat når arkitekten er kjent/kanonisert, bygget er et sentralt kanonisert verk, og forbindelsen tilfører mer enn en teknisk kreditering.

En berømt perifer person eller et kjent sekundært kulturspor skal ikke dominere People-previewet eller hovedutvalget. Dersom dokumentert kandidataudit ikke finner en kvalifisert direkte personkobling, er People `BEGRUNNET N/A`.

## 8. Objects

Objects følger `docs/PLACE_OBJECTS_CANONICAL.md`.

Et Object er den fysiske, identifiserbare tingen. Hovedfunksjonen styrer utvalget, og kategoriene undersøker ulike objektfamilier:

| Kategori/familie | Typiske Objects |
| --- | --- |
| By | skilt, byinventar, lykter, fontener, modeller og monumentobjekter |
| Historie | artefakter, dokumenteksemplarer, redskaper, faner og personlige eiendeler |
| Kunst | kunstnerverktøy, materialer, arbeidsmodeller og katalogobjekter — ikke selve kunstverket |
| Litteratur | manuskripter, brev, skrivemaskiner, skrivebord og konkrete bokeksemplarer |
| Media | presser, kameraer, mikrofoner, sendere og fysiske aviseksemplarer |
| Musikk | instrumenter, lydutstyr, sceneutstyr, kostymer og billetter |
| Næringsliv | maskiner, former, verktøy, emballasje, produkter og butikk-/kontorutstyr |
| Politikk | valgurner, faner, segl, kampanjemateriell og dokumenteksemplarer |
| Psykologi | testutstyr, skjemaer, forsøksapparater og terapiredskaper |
| Helse | instrumenter, behandlingsutstyr, medisinemballasje og uniformer |
| Utdanning | læremidler, pulter, laboratorieutstyr, diplomer og bokeksemplarer |
| Religion | ritualgjenstander, tekstiler, relikvier, klokker og liturgiske bøker |
| Scenekunst | rekvisitter, kostymer, scenemodeller, teatermaskineri og billetter |
| Sport | sportsutstyr, drakter, pokaler, billetter og tidtakingsutstyr |
| Subkultur | klær, merker, fanziner, instrumenter, brett og sceneutstyr |
| Vitenskap | instrumenter, prøver, modeller, prototyper og laboratoriebøker |
| Filosofi | manuskripter, brev, annoterte bøker og forelesningsmateriale |
| Film og TV | kameraer, rekvisitter, kostymer, scenografimodeller og fysiske manuskripter |

Naturprofilen bruker ikke den ordinære Objects-samlingen. Dersom dokumentert kandidataudit ikke finner et kvalifisert fysisk Object, er Objects `BEGRUNNET N/A`; en kvalifisert, men uferdig Object-kandidat er `BLOCKED`.

## 9. Brands

Canonical semantisk eier er `data/brands/brand_rules_v1_1.json`.

Brands er en kandidatsamling når Badge-, underbadge- eller source-grunnlaget peker mot mulig selvstendig merke-/institusjonsidentitet. Brands er langt bredere enn forbrukerprodukter og kan omfatte:

- kommersielle og historiske virksomheter;
- produktidentiteter;
- profesjonelle firmaer og tjenesteidentiteter;
- institusjoner, skoler, universiteter, sykehus, forlag og medier;
- gallerier, museer, scener, klubber, organisasjoner og venue-identiteter;
- legacy-navn, autentiske ordmerker og skiltidentiteter;
- kjente place-first-identiteter når Brand-kontrakten uttrykkelig består.

Navnet må ha selvstendig gjenkjennelse, dokumentert stedstilknytning og verifisert logo eller autentisk historisk ordmerke. Et tilfeldig aktørnavn eller et vanlig stedsnavn blir ikke Brand bare for å fylle PlaceCard. Dersom ingen kandidat består Brand-definisjonen etter dokumentert kandidataudit, er Brands `BEGRUNNET N/A`.

Den fysiske Freia-emballasjen er Object; Freia-identiteten og en kvalifisert produktidentitet er Brands. Samme record skal ikke dupliseres, men de to forskjellige entity-rollene kan eksistere samtidig.

## 10. Historiske hendelser

`historical_events` er Histories dedikerte kategoriuttrykk. Samlingen eier avgrensede historiske hendelser med selvstendig identitet, direkte stedsevidens, kildebåret beskrivelse og et ærlig medlemsbilde.

- `historical_events` er ikke en alias for `productions`;
- `historical_events` er ikke kalender-/nåtidssystemet `events` under «På stedet»;
- chronology er den fulle tidsindeksen og kan inneholde langt flere tidsankere enn samlingen;
- en chronology-rad blir ikke automatisk et samlingsmedlem;
- Stories eier narrativ behandling, ikke selve hendelsesidentiteten;
- Objects eier fysiske spor og eksemplarer, mens `historical_events` eier den avgrensede hendelsen;
- Structures kan erstatte Histories normaluttrykk bare gjennom den begrunnede stedsspesifikke varianten i punkt 3.

Eldre Historie-profiler som fortsatt bruker `productions` kan leses fram til stedet revideres, men de er legacy og kan ikke kopieres inn i ny eller vesentlig revidert Historie-produksjon.

## 10A. Øvrige kategoriuttrykk / Productions

`productions` er den tekniske samlingsfamilien for de øvrige kategorienes identifiserbare verk, metoder, praksiser, behandlinger, programmer, forskning eller andre dokumenterte output. Brukeren skal alltid møte kategoriens konkrete navn, aldri det generiske ordet «Productions».

| Kategori | Hva samlingen eier |
| --- | --- |
| Kunst | kunstverk; ikke kunstnerens verktøy eller materialgjenstander |
| Litteratur | bøker og tekster som verk; et bestemt fysisk eksemplar kan være Object |
| Media | utgivelser og sendinger |
| Musikk | sanger og album; instrumenter er Objects |
| Næringsliv | dokumenterte produksjonsprosesser og tjenester; maskiner, emballasje og fysiske produkter er Objects |
| Politikk | avgrensede hendelser og vedtak; urner, faner og dokumenteksemplarer er Objects |
| Psykologi | studier og metoder; testapparater og fysiske skjemaer er Objects |
| Helse | behandlinger og omsorgspraksiser; utstyret er Objects |
| Utdanning | pedagogiske metoder og programmer; læremidler som fysiske eksemplarer er Objects |
| Religion | ritualer og tradisjoner; ritualgjenstandene er Objects |
| Scenekunst | forestillinger; rekvisitter og kostymer er Objects |
| Subkultur | uttrykk og utgivelser; klær, fanzine-eksemplarer og utstyr er Objects |
| Vitenskap | forskning og oppdagelser; instrumenter, prøver og prototyper er Objects |
| Filosofi | tekster og fagverk; annoterte fysiske eksemplarer er Objects |
| Film og TV | filmer og serier; kameraer, rekvisitter og kostymer er Objects |

Et fysisk eksemplar og det abstrakte verket/metoden/hendelsen er forskjellige entities. Eierskapet skal dokumenteres; samme entity kan ikke kopieres mellom samlingene.

## 11. Structures

Structures betyr navngitte bygninger, byrom og anlegg med egen identitet, dokumentert rolle og eget medlemsbilde.

- Structures er standard kategoriuttrykk for By;
- utenfor By brukes Structures bare gjennom den stedsspesifikke varianten i punkt 3;
- én hovedbygning skal ikke splittes i kunstige kort;
- en løs bygningsdetalj er ikke Structure;
- et separat canonical Place forblir eget Place og vises gjennom relasjonssystemet, ikke som Structure hos parent-stedet.

## 12. Competitions

Competitions er dokumenterte kamper, løp, finaler, stevner og turneringer knyttet til sportsstedet.

Utøvere hører i People. Drakter, pokaler og utstyr hører i Objects. Klubb-, lag- og arenaidentiteter kan høre i Brands når Brand-kontrakten består.

## 13. Map, Flora, Fauna og Destinations

Natursteder bruker alltid fire samlinger når den canonicale naturprofilen gjelder:

```text
Map · Flora · Fauna · Destinations
```

- `map` åpner et faktisk tur-/naturkart, aldri bare hovedkartet zoomet inn;
- `flora` viser dokumenterte plantearter eller floraenheter ved stedet;
- `fauna` viser dokumenterte dyrearter eller faunaenheter ved stedet;
- `destinations` viser navngitte turmål ved eller omkring stedet.

Alle fire skal ha stedsspesifikk dokumentasjon og fungerende visuell presentasjon. Generiske arter eller turmål brukes ikke som filler.

## 14. Related er ikke en samling

Relasjoner mellom Places er fortsatt viktige canonical data og kan brukes i Relasjoner-fanen, ruter, NextUp, Nearby og andre navigasjonsflater.

`related` kan aldri:

- stå i `place_card_profile.collection_ids`;
- brukes som kategoriuttrykk;
- brukes som reserve for en `BEGRUNNET N/A`-samling;
- absorbere Objects, Structures, Brands eller andre Places.

## 15. Bilder er medieinnhold

`images` er ikke en samling eller reserve. Hovedbilder, galleri, historiske bilder og Før/etter eies av sine respektive medieflater.

Bilder skal dedupliseres, kilde- og lisensføres og aldri kopieres eller gis ny identitet for å fylle samlingsfeltet.

## 16. Ikke PlaceCard-samlinger

Følgende er ikke PlaceCard-samlinger:

- Badges;
- Related/relasjoner;
- Bilder;
- generiske Details eller Spots;
- Civication og Wonderkammer;
- Før/etter, Stories, Leksikon, Nyheter og Lesespor;
- Lek, Trening, Oppgaver, Events, Observer og Notat;
- Quiz og Rute;
- de sju stedspopup-SVG-ene.

At noe ikke er PlaceCard-samling gjør det ikke valgfritt i den øvrige stedsproduksjonen.

## 17. Bakoverkompatibilitet

Legacy Places kan fortsatt leses gjennom eksisterende kompatibilitetsadapter til de faktisk revideres. Kompatibilitetsvisning er ikke redaksjonell ferdigstatus.

Når et ordinært sted fullproduseres eller vesentlig revideres, skal det bruke den adaptive `history_go_place_card_profile_v2`-kontrakten med én til fire kuraterte PASS-samlinger. En gammel profil med `related`, `images` eller tomme reservekort kan ikke kopieres videre som ny canonical profil. Eksisterende korrekte fire-samlingsprofiler kan beholdes uendret.

## 18. Produksjonsgate

Et ordinært sted er PlaceCard-ferdig når:

1. `frontImage` er stående, stedstro og har full proveniens;
2. `place_card_profile` inneholder én til fire riktige, unike samlings-ID-er;
3. alle valgte samlinger har canonicale, stedsspesifikke medlemmer;
4. hvert valgt samlingskort viser et faktisk lastet medlemsbilde;
5. People, Objects, Brands og kategoriuttrykk er vurdert når de er plausible og har dokumentert `PASS`, `BEGRUNNET N/A` eller `BLOCKED`;
6. kategoriuttrykket følger kategorimatrisen eller en eksplisitt begrunnet Structure-variant;
7. Objects og kategoriuttrykket har tydelig entity-grense;
8. en valgt Brand-samling er auditert etter Brand-definisjonen og har nødvendig logo-/ordmerkedekning;
9. `related`, Bilder, Badges og handlings-/popupflater er ute av samlingsfeltet;
10. adaptiv layout er kontrollert på mobil og desktop for det faktiske antallet valgte samlinger;
11. hver valgt samling åpner riktig popupinnhold og datakilde;
12. own-place-/entity-grenser er intakte;
13. schema, renderer, layout og permanente tester passerer;
14. manuell slutt-QA vurderer kortet som pent, tilsiktet og komplett.

**Stoppgate:** Et fullprodusert ordinært Place kan aldri lukkes med tomt samlingskort, manglende medlemsbilde, `related` som reserve, filler-entity eller en reelt kvalifisert samling som fortsatt er `BLOCKED`.

## Kort regel

**Én til fire ferdige PASS-samlinger på ordinære fulle steder. People, Objects, Brands og kategoriuttrykk vurderes, men bare samlinger stedet faktisk bærer vises. Natur følger sin eksplisitte fire-samlingsprofil. Related er aldri en samling. Ingen filler. Ingen tomme kort.**
