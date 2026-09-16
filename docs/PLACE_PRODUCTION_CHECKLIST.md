# History GO — Place Production Checklist v2.6

Status: **canonical produksjonsarbeidsflyt**  
Eier: `place_by_place_production_workflow`  
Sist kontrollert: **2026-09-16**

Denne sjekklisten eier arbeidsrekkefølge, Badge-gate, produksjonsprofil, review-checkpoints og mergekadens for ordinær sted-for-sted-produksjon.

Detaljkravene fra tidligere full checklist består gjennom:

- `docs/PLACE_PRODUCTION_CHECKLIST_REFERENCE_V1.md`

Alle faglige, redaksjonelle, faktuelle og subsystemspesifikke krav i referansen er fortsatt bindende, med bare de eksplisitte aktive overstyringene i denne checklisten.

Produksjonsprofil og innholdsplan eies av:

- `docs/PLACE_PRODUCTION_PROFILES.md`

Badge-drevet produksjonsruting eies av:

- `data/badges/index.json`
- `data/badges/<badge>.json`
- `data/badges/place_production_routing_v1.json`

Micro Places følger:

- `docs/MICRO_PLACE_CONTRACT.md`

> **Hovedregel:** Alle ordinære Places har samme harde canonical core. Hovedbadge og underbadges bestemmer hva produksjonen skal undersøke; stedets faktiske kilder bestemmer hvilke kandidater og samlinger som faktisk kvalifiserer; produksjonsprofilen bestemmer hvor dypt vi går. Et lettere sted er smalere ferdig — aldri halvferdig.

---

## 1. Før produksjon: Hovedbadge → underbadges → kilder → profil → innholdsplan

Fire beslutninger skal gjøres eksplisitt og holdes fra hverandre:

1. **HOVEDBADGE/CATEGORY** — stedets primære faglige identitet;
2. **UNDERBADGE_IDS** — hvilke sider ved Badgen dette konkrete stedet representerer;
3. **PRODUKSJONSPROFIL** — `major`, `standard`, `focused` eller `micro`;
4. **INNHOLDSPLAN** — hvilke konkrete subsystemer og PlaceCard-samlinger som skal produseres for akkurat dette stedet.

Canonical ruting:

```text
Universal canonical core
→ HOVEDBADGE/CATEGORY
→ UNDERBADGE_IDS
→ data/badges/place_production_routing_v1.json
→ stedsspesifikk source review
→ confirmed PRODUKSJONSPROFIL
→ endelig INNHOLDSPLAN
```

### BADGE-/UNDERBADGE-GATE — obligatorisk

Før endelig innholdsplan skal produsenten:

- slå opp hovedbadgen gjennom `data/badges/index.json`;
- lese hele `data/badges/<badge>.json`;
- kontrollere stedets `underbadge_ids` mot Badge-familien;
- lese hovedbadgens kandidatsamlinger og researchspor fra `data/badges/place_production_routing_v1.json`;
- bruke aktive underbadges til å prioritere/nedprioritere researchspor;
- når Badge-filen har `groups`, `children` eller `quizFocus`, bruke disse som semantiske research-/quiz-hints;
- deretter verifisere alle kandidater mot faktiske stedskilder og subsystemkontrakter.

Badge og underbadge er **routing**, ikke faktakilde og ikke innholdskvote.

Eksempler:

- `naeringsliv + industri` gjør produksjonsprosess, arbeid, teknologi, anlegg og fysiske spor til sterke kandidatspor; Brand researches når stedet faktisk bærer en kvalifisert identitet, men produseres ikke for å fylle et fast samlingskrav;
- `naeringsliv + bank_og_finans` skal ikke få industrimaskiner fordi et annet Næringsliv-sted har dem;
- `historie + industrihistorie` kan gi en annen innholdsplan enn `historie + sosialhistorie` eller `historie + kulturminner_og_bevaring`;
- `musikk + konsertsteder` prioriterer scenehistorie, artister, konserter og venue-/lydspor;
- `film_tv + filmlocations` prioriterer konkrete produksjoner og location-relasjoner; selve location-relasjonen er ikke Brand, mens produksjonsselskap, studio, kanal, kino eller venue-identitet kan kvalifisere etter Brand-kontrakten;
- `sport + stadion` og `sport + supporterkultur` skal ikke få identiske PlaceCards;
- `natur + fugler` prioriterer Fauna-research; Nature følger fortsatt sitt eget faste firersett når den canonicale naturkontrakten krever det;
- `natur + geologi` prioriterer kart-/landformsporet; Nature-spesialprofilen følger fortsatt sine egne krav og erstatter aldri manglende stedsspesifikk dokumentasjon med generiske arter;
- én fysisk enhet skal aldri splittes kunstig til både Object og Structure bare for å fylle kortet;
- chronology skal aldri kopieres til en svak Story bare for å fylle Stories.

### Produksjonsprofiler

- **major** — bredt, betydelig sted med flere selvstendige kildebårne spor;
- **standard** — full ordinær stedsopplevelse og hovedprofilen for de fleste steder;
- **focused** — canonical Place med reelt smalere stoffbredde;
- **micro** — følger egen Micro Place-kontrakt.

`focused` er aldri en kostnadssnarvei. Profilen skal begrunnes i faktisk Badge-/underbadge-scope og kilder.

---

## 2. Universal canonical core — obligatorisk for alle ordinære Places

For `major`, `standard` og `focused` kan følgende aldri settes profil-N/A:

- sikker canonical identitet og own-place-grense;
- verifisert koordinat/geometri med ærlig `coordRole`;
- inspiserbare kilder og factuality/source → claim-disiplin;
- korrekt `desc` og `popupDesc`;
- riktig Hovedbadge/category og korrekte/relevante `underbadge_ids`;
- relevante emner og fungerende stedsspesifikk Fagverk-side;
- bildeproveniens for publiserte bilder;
- `frontImage` er en egen PlaceCard-bildeflate og er **alltid stående** når feltet finnes: en faktisk fil/variant med `height > width`, aldri en liggende fil som bare maskeres eller beskjæres til stående av CSS;
- `frontImage` skal aldri genereres fra, kopiere eller automatisk falle tilbake til `image`; `image` og `frontImage` har separate roller;
- `cardImage` er legacy og er ikke del av den canonicale Place-bildekontrakten; feltet skal ikke opprettes, materialiseres, videreføres eller gjeninnføres i ny eller revidert Place-produksjon;
- dedikert QuizCard/flip-bakside for hvert ordinært PlaceCard, med eksisterende quizkort gjenbrukt når det allerede finnes;
- Språkleksikon med minst ett reelt stedsspesifikt navne-/begrepsspor;
- chronology/epoke-research og materialisering av kvalifiserte eksakte ankere;
- relasjons-/own-place-audit;
- runtime/materialisering;
- relevante CI-/audit-gater;
- manuell slutt-QA.

Teknisk PASS er aldri synonymt med redaksjonell ferdigstatus.

---

## 3. Stedsavhengige samlinger og betingede subsystemer

Badge-router og aktive underbadges åpner kandidatene. Faktiske kilder og subsystemkontrakter avgjør hvilke samlinger som faktisk hører til stedet.

For ordinære fullprofiler skal disse fire **alltid vurderes**, men de er ikke universelt obligatoriske å materialisere:

- People;
- Objects;
- Brands;
- kategoriuttrykk (`historical_events`, `productions`, `structures`, `competitions` eller `destinations` etter samlingskontrakten).

Hver samling får én av disse sluttstatusene etter dokumentert Badge-drevet kandidataudit og source review:

```text
PASS
BEGRUNNET N/A
BLOCKED
```

- `PASS` betyr at minst ett ekte canonical medlem kvalifiserer og er ferdig materialisert med nødvendig evidens og previewflate.
- `BEGRUNNET N/A` betyr at et reelt kandidatsøk er utført, men ingen kandidat kvalifiserer naturlig for akkurat dette stedet. Dette er en gyldig ferdigstatus og skal ikke utløse filler eller videre research bare for å fylle layouten.
- `BLOCKED` brukes når en reell kvalifisert kandidat finnes eller er tydelig kildebåret, men nødvendig evidens, asset, proveniens eller materialisering mangler. `BLOCKED` skal ikke brukes bare fordi en samling ikke finnes naturlig på stedet.

Betingede moduler omfatter blant annet:

- Stories;
- Før/etter;
- Nyheter;
- Lesespor;
- ruter/narrative koblinger;
- ekstra Fagverk-spor og medier.

De bruker samme prinsipp: relevant kildebåret innhold materialiseres; irrelevant innhold avsluttes som `BEGRUNNET N/A`; reelt, uferdig innhold er `BLOCKED`.

**Ingen filler:** Det er forbudt å opprette en perifer person, et tilfeldig objekt, et konstruert Brand, en duplisert Structure, et kunstig kategoriuttrykk, en svak Story eller svake/gjentatte quizspørsmål bare for å møte en kvote eller layout. Et ordinært Place kan fullføres med færre enn fire samlinger når dokumentert kandidataudit viser at færre samlinger faktisk hører til stedet.

---

## 4. PlaceCard — innholdet bestemmer samlingsflatene

Canonical samlingskontrakt: `data/places/README_place_rounds.md`.

For nye og fullproduserte ordinære Places gjelder:

- `place_card_profile.collection_ids` inneholder bare samlinger som har `PASS` for dette stedet;
- ordinære fullprofiler vurderer People, Objects, Brands og kategoriens uttrykk, men materialiserer bare de samlingene stedet faktisk bærer;
- det finnes ikke lenger et universelt krav om nøyaktig fire ordinære samlinger; et ordinært PlaceCard bruker 1–4 kvalifiserte samlinger etter dokumentert kandidataudit. Dersom ingen av de fire kandidattypene kvalifiserer, kan stedet ikke materialisere en ordinær `place_card_profile_v2` og må vurderes mot riktig canonical profil/scope fremfor å fylles kunstig;
- Nature bruker Kart, Flora, Fauna og Turmål når den canonicale naturkontrakten krever dette; andre canonicale spesialprofiler følger sine egne eksplisitte faste sett;
- `related` er et relasjons-/navigasjonssystem og kan aldri brukes som PlaceCard-samling eller reserve;
- kategoriuttrykket følger matrisen i `data/places/README_place_rounds.md`; Structures utenfor By krever et sentralt, substansielt bygnings-/anleggsmiljø og uttrykkelig begrunnelse;
- Historie bruker `historical_events` for avgrensede, stedsspesifikke historiske hendelser; `productions` er ikke Historie-samling, og kalender-/nåtidssystemet `events` er en annen eier;
- Structures velges for et Historie-sted bare som en begrunnet stedsspesifikk variant når flere navngitte bygg/anlegg er et sterkere uttrykk enn hendelser — aldri som automatisk reserve;
- samlingsvalget skal følge Badge-/underbadge-baserte kandidater og faktisk materialisert innhold;
- hver valgt samling har minst ett ekte canonical medlem;
- hver valgt samling har et validert, lastbart previewbilde av et medlem;
- en samling med en kvalifisert kandidat, men manglende nødvendig evidens eller asset, er `BLOCKED`; en samling uten kvalifiserte kandidater etter reell audit er `BEGRUNNET N/A` og skal ikke vises som tom flate;
- **ingen tomme PlaceCard-kort er tillatt ved closeout**;
- PlaceCard-layouten tilpasser seg antall valgte samlinger; 1, 2, 3 og 4 samlinger skal alle kunne presenteres som balanserte, tilsiktede komposisjoner uten tomme reservefelter;
- People/Flora/Fauna beholder sirkelform; øvrige samlinger er avrundede rektangler;
- `frontImage` er den stående hovedflaten og er **alltid** en faktisk stående fil/variant (`height > width`) når feltet finnes, aldri bare en liggende fil beskåret eller maskert av CSS; dette gjelder også legacy-steder når bildefeltet berøres;
- hvert nytt eller fullproduserte ordinært Place skal ha et dedikert QuizCard som PlaceCard-bakside og kunne flippe fra `frontImage` til quizkortet gjennom den canonicale PlaceCard-runtimeflyten;
- før nytt QuizCard produseres skal `bilder/QuizCards/**`, runtime-mapping/resolver og tidligere stedsspesifikke quizkort auditeres, slik at eksisterende quizkort bevares og ikke dobbeltproduseres;
- `bilder/QuizCards/**` er kun QuizCard/flip-support og skal aldri brukes som `image` eller `frontImage`; quizkortet skal være en separat visuell flate, og det utgåtte `cardImage`-feltet skal aldri brukes som alias eller reserve;
- manglende QuizCard, manglende runtime-binding eller en flip som ikke virker med faktisk input er BLOCKED for ordinær fullproduksjon;
- hvert samlingspreview er et faktisk bilde av ett canonical medlem, aldri `frontImage` brukt som falskt samlingspreview;
- ikon-/statusvisning er bare runtime-fallback ved lastingsfeil og kan aldri lukke produksjonsgaten;
- gamle Places kan beholde kompatibilitetsvisningen til de faktisk fullproduseres/revideres; ny/full produksjon migrerer til den stedsavhengige samlingskontrakten;
- ved enhver endring av Place-bilder skal source og genererte avledninger (`places_index`, `place-open` og andre relevante runtime-payloads) regenereres og kontrolleres slik at `cardImage` ikke overlever som stale generated data, og slik at `frontImage` aldri syntetiseres fra `image`.

Slutt-QA skal eksplisitt vurdere at kortet ser **pent, tilsiktet, balansert og komplett for akkurat denne typen sted og dens Badges** ut på mobil og desktop.

Et valgt samlingskort uten entity eller bilde er BLOCKED. Løsningen er å ferdigstille den reelle samlingen eller, dersom kategoriuttrykket var feil valgt, avslutte den samlingen som `BEGRUNNET N/A` når dokumentert kandidataudit viser at den ikke hører til stedet. People, Objects og Brands kan alle utelates fra et ordinært Place når de er dokumentert `BEGRUNNET N/A`.

---

## 5. Fagverk-sted — obligatorisk

Alle canonicale steder skal ha sin egen fungerende fagverkside.

**fagverk-sted — obligatorisk, fungerende og aldri N/A.** Kravet gjelder hvert sted, kan ikke settes til N/A og er en egen ferdigport.

Fagverk-siden produseres **samtidig med stedet**, fra det samme kildegrunnlaget og i den samme ordinære steds-PR-en. Den skal ikke skyves til en senere Fagverk-batch når et nytt sted opprettes eller et eksisterende sted fullproduseres eller vesentlig revideres. En separat Fagverk-batch brukes bare til å lukke dokumentert legacy-backlog for steder som ikke allerede er i ordinær stedsproduksjon.

### Canonical eier og avgrensning

- stedets manifest-loadede Place-kildefil eier en strukturert `fagverk`-blokk med schema `history_go_place_fagverk_v2`;
- `data/fagverk/fagverk_registry.json` indekserer bare Place-kildefil, felt, schema, nivå og status; registryet eier aldri stedstekst, linser, spørsmål, begreper eller observerbare spor;
- fagets manifest-resolverte modell eier fagområder, emner, kapitler og begrepsdefinisjoner; Place-filen refererer canonicale ID-er og kopierer ikke fagmodellen;
- samme source → claim-grunnlag som brukes til stedets øvrige tekst, kronologi, bilder og oppgaver brukes til Fagverk, med eksplisitte tolkningsgrenser der observasjon ikke alene kan bevise årsak, representativitet eller historisk datering;
- `popupDesc`, en fungerende URL, kategori-fallback eller automatisk avledede emnespørsmål er aldri ferdigbevis.

### Nivå låses i steds-preflight

Fagverk-nivå besluttes sammen med stedets confirmed produksjonsprofil, etter Badge-/underbadge- og source review:

| Stedsprofil | Minste Fagverk-nivå | Innholdskrav |
| --- | --- | --- |
| `major` | `full` | utfyllende stedsartikkel, flere selvstendige faglige spor, minst tre relevante canonicale emner, 3–5 linser, 4–6 spørsmål, begreper, minst to observerbare spor og minst fire kontrollerte kilder |
| `standard` | `standard` | egen læringsinngang og fagartikkel, relevante canonicale emner og kapitler, 3–5 stedsspesifikke linser, 4–6 spørsmål, begreper, observerbart spor og minst to kontrollerte kilder |
| `focused` | `standard` | konsentrert, men komplett standardinnhold rundt stedets dokumenterte hovedfunksjon; færre kilder eller mindre bredde kan aldri erstattes med generisk fyll |
| canonicalt `micro` | `micro` | kort Place-eid læringsinngang, den smaleste dokumenterte fag-/emnekoblingen, 1–2 spørsmål, begrep, observerbart spor og kilde |

Schemaet `data/places/regler/place_fagverk_v2.schema.json` eier eksakte maskinelle minimumskrav. `docs/FAGVERK_PLACE_V2_WORKCARD.md` eier migreringsprogrammet og legacy-backloggen, men er ikke en alternativ senere produksjonsløype for et aktivt sted.

### Integrert produksjonsrekkefølge

Følgende skjer mens stedskildene er åpne og før canonical brukerinnhold ferdigmeldes:

1. **Nullmål eksisterende side:** åpne `fagverk-sted.html?place=<place_id>`, kontroller eventuell Place-eid `fagverk`-blokk, registryoppføring, fallbackstatus, døde lenker og tidligere kuratering.
2. **Lås læringsjobben:** skriv én presis setning om hvorfor akkurat dette stedet er faglig interessant. Velg bare fag og emner som stedskildene faktisk bærer.
3. **Løs canonicale mål:** bruk `data/fag/fag_manifest.json`, manifest-resolverte emnefiler og `data/fagverk/fagverk_registry.json` til å validere `subject_ids`, `emne_ids` og `chapter_ids`. Ingen ID gjettes eller opprettes i Place-filen.
4. **Skriv Place-eid substans:** materialiser læringsinngang, egen fagartikkel, stedsspesifikke linser, undersøkelsesspørsmål, sentrale begreper og observerbare spor med tolkningsgrenser etter valgt nivå.
5. **Kildebind innholdet:** `source_urls` skal være kontrollerte HTTP(S)-kilder som faktisk dekker læringsinnholdet. Alle brukerrettede kilder materialiseres også med forståelige labels i Place-kildens eide kildeflate når datamodellen bruker `externalLinks`.
6. **Indekser uten duplisering:** oppdater registryets smale place-indeks. Ikke kopier innhold fra `fagverk`-blokken inn i registryet.
7. **Materialiser og auditér:** regenerer Fagverk-coverage/release-manifest og andre avledede filer fra source. Kjør schema-, substans-, unikhets-, lenke- og renderingstester.
8. **Klikk den faktiske siden:** åpne den canonicale stedsadressen i nettleser på PR-head, klikk minst én lenke i hver materialisert lenketype og kontroller at stedsparameteren bevares der kontrakten krever det.

### Stedsspesifikk substansport

Godkjent `status: "curated"` krever at:

- intro og artikkel forklarer akkurat dette stedet og ikke kan flyttes uendret til et annet sted i samme kategori;
- hver linse har eget spørsmål, canonicalt `subject_id`/`emne_id` og konkret evidens som kan undersøkes ved stedet eller i navngitte kilder;
- spørsmålene krever undersøkelse av stedet, kildene eller en dokumentert sammenligning og er ikke kategoriens generiske standardspørsmål;
- observerbare spor skiller det man kan se fra det som krever historiske, statistiske eller institusjonelle kilder;
- emner og kapitler er relevante for artikkelen, linsene og spørsmålene — de er ikke lenkekvoter;
- kildene er operative, inspectable og tilstrekkelige for påstandene;
- substansauditen finner ingen gjenbrukt intro, artikkel, linse- eller spørsmålsmal som får ulike steder til å se ferdige ut.

Når innholdet mangler, skal rendereren vise en ærlig kompakt uferdigstatus. Generiske kategori-linser og standardspørsmål er forbudt. En slik fallback er riktig runtime for legacy-backloggen, men den er ikke godkjent stedsproduksjonsstatus.

### Operative lenker — hard gate

Alle synlige Fagverk-handlinger skal være faktiske `<a href>`-mål:

- fag → `fagverk.html?subject=<subject>&place=<place>`;
- fagområde → validert `subject + domain + place`;
- emne/linse → validert `subject + domain + emne + place`;
- kapittel → validert `subject + chapter + place`;
- begrep → eieremnet når det finnes, ellers subject-roten med stedskontekst;
- kart → canonical kart-/place-rute;
- ekstern kilde → kontrollert HTTP(S)-adresse med `noopener noreferrer`.

En chip, et kort, en linse, et kapittel eller en kilde som ser klikkbar ut uten operativ destinasjon er BLOCKED. Ugyldige ID-er skal gi tydelig feil og må aldri falle tilbake til politikk, første emne eller et annet fag.

### Minimumsvalidering ved Fagverk-endring

Kjør minst:

```bash
node scripts/audit-fagverk-place-pages.mjs --write
node scripts/build-fagverk-release-manifest.mjs
node --test tests/fagverk-place-pages.test.mjs tests/fagverk-place-rendering.test.mjs tests/fagverk-place-substance-audit.test.mjs
node scripts/build-fagverk-release-manifest.mjs --check
```

Deretter kjøres relevante fag-/emne-, Place-, quiz-/Knowledge- og full-CI-gater for de faktiske filene som er endret. Browser-QA er obligatorisk i tillegg til JSDOM-/kontrakttester.

Arbeidskortet skal føre:

```text
FAGVERK-STED-STATUS:
FAGVERK-NIVÅ: full | standard | micro
FAGVERK-LÆRINGSJOBB:
FAGVERK-SUBJECT/EMNE/CHAPTER-RESOLUSJON:
FAGVERK-SUBSTANSAUDIT:
FAGVERK-KILDER/SPOR:
FAGVERK-LENKEAUDIT:
FAGVERK-BROWSER-QA:
FAGVERK-REGISTRY/MANIFEST-STATUS:
```

`fagverk-sted` er aldri N/A for et ordinært Place. Et nytt, fullprodusert eller vesentlig revidert sted kan ikke closeoutes med `status: "in_production"`, kategori-only fallback, utdatert registry/release-manifest, utestet klikkmål eller plan om å produsere Fagverk senere.

---

## 6. Språkleksikon og dialekt

**SPRÅKLEKSIKON — ALLTID / ALDRI N/A**

Språk er obligatorisk på alle canonicale steder. Alle ordinære canonical Places skal researches for og materialisere minst ett reelt stedsspesifikt språkspor. Dette kan være:

- stedsnavn/navnehistorie;
- historisk betegnelse;
- funksjons-/fagbegrep med dokumentert stedskobling;
- lokale uttrykk eller annen kildebundet språkbruk.

Badge/underbadge kan peke mot relevante fagbegreper, men generelle fagord uten dokumentert stedskobling brukes aldri som filler.

**DIALEKTLAG — KUN `placeScope: "area"` / N/A**

Dialektinnhold kan kun eies av et område-Place med `placeScope: "area"`.

Et enkeltsted skal ha Språkleksikon, men skal ikke diktes eller konstrueres til dialekteier. Dialekt skal ikke diktes. `coordRole` beskriver koordinatgeometri og gir aldri dialekt-eierskap. Fravær av dialekt betyr aldri fravær av obligatorisk Språkleksikon.

Når dialektlaget researches på et område-Place, skal minst ett reelt kildebelagt **dialektord eller lokalt uttrykk** produseres når kildene bærer det. Hvis kildene ikke bærer et forsvarlig dialektfunn, kan bare dialektdeljobben settes begrunnet N/A/holdback; Språkleksikonet som helhet kan aldri settes N/A.

---

## 7. Kronologi og epoker

**KRONOLOGI/EPOKE — ALLE ORDINÆRE PLACES / RESEARCH ALDRI N/A**

Kronologi produseres samtidig med stedet, ikke som senere gaparbeid.

- research identitetsbærende hendelser som etablering, bygging/åpning, funksjonsskifte, utvidelse, ombruk, nedleggelse og andre reelle vendepunkter;
- Badge-/underbadge-kontekst brukes til å prioritere hvilke tidsankere som faktisk er identitetsbærende;
- eksakt år materialiseres bare når kilden støtter eksakt år;
- tiår, århundrer, intervaller og «ca.» gjøres aldri om til oppdiktede enkeltår;
- chronology brukes for **hva som skjedde når**;
- Story brukes bare når materialet også har selvstendig narrativ verdi;
- chronology materialiseres gjennom canonical evidensbane som epokebyggeren faktisk leser;
- etter chronology-endring regenereres epokeindeks/runtime og epokeviser kontrolleres;
- `SOURCE-BOUNDED HOLDBACK` er bare tillatt når dokumentert research ikke finner et kvalifisert eksakt tidsanker.

Arbeidskortet skal føre:

```text
KRONOLOGI/EPOKE-STATUS:
KRONOLOGI-KILDER/ANKERE:
EPOKE-INDEX/RUNTIME-STATUS:
EPOKEVISER-QA:
```

Ny/full stedsproduksjon skal ikke skape nye unødvendige timeline-gap.

---

## 8. People, Objects og Brands

### People

People researches når Badge-/underbadge-planen og kildene peker mot canonical personer med mulig direkte relevans. En perifer person skal ikke produseres for å fylle kortet.

Canonical metode:

- `docs/people-of-places-method.md`;
- `docs/PEOPLE_PROFILE_CANONICAL.md`.

Etter kandidataudit:

- kvalifisert og ferdig personmaterialisering → `PASS`;
- ingen kvalifisert direkte personkobling → `BEGRUNNET N/A`;
- kvalifisert person finnes, men nødvendig evidens/profil/asset mangler → `BLOCKED`.

### Objects

Objects følger `docs/PLACE_OBJECTS_CANONICAL.md`.

Utvalget skal først forklare stedets hovedfunksjon. På industri- og produksjonssteder undersøkes former/verktøy, maskiner, måle- og kvalitetsutstyr, emballasje-/håndteringsutstyr og andre dokumenterte produksjonsgjenstander før sekundære kulturspor.

Objects skal være fysiske, identifiserbare gjenstander med dokumentert stedstilknytning og egne medlemsbilder. En kjent person eller et kjent verk skal ikke gjøre et sekundært tema til stedets hovedsamling. Når kandidatauditen ikke finner et kvalifisert Object, er `BEGRUNNET N/A` gyldig. Når et kvalifisert Object finnes, men objekt-, kilde-, bilde- eller proveniensbevis mangler, er samlingen `BLOCKED` til kontrakten består.

Objects følger kategoriens hovedfunksjon. Kunst kan for eksempel ha både Objects og Kunstverk: kunstnerverktøy, materialgjenstander, arbeidsmodeller og katalogobjekter hører i Objects, mens selve kunstverkene hører i Kunstverk. Tilsvarende skiller gjelder mellom fysisk eksemplar og verk, utstyr og metode, gjenstand og hendelse, emballasje/produkt og Brand-identitet.

`Spor og objekter` / `Legg merke til` kan være eide underseksjoner i Objects-popupen uten å bli egne samlinger.

**People-popupen** eier dokumenterte personrelasjoner. **Relaterte steder** eier dokumenterte place→place-relasjoner; slike relasjoner skal ikke flyttes inn i People bare for å fylle en samling.

### Brands

`data/brands/brand_rules_v1_1.json` er canonical Brand-eier.

Brands skal alltid kandidatauditeres når Badge-, underbadge- eller source-grunnlaget peker mot en mulig profesjonell, institusjonell, venue-, organisasjons-, legacy-, produkt- eller skiltidentitet med selvstendig gjenkjennelse og direkte stedstilknytning. Ingen underbadge kan godkjenne Brand alene.

Null treff i eksisterende register betyr «må researches», ikke automatisk N/A. Et faktisk kandidatsøk, dokumentert mot stedskildene, skal gjennomføres før Brand kan avsluttes som `BEGRUNNET N/A`. Etter dette gjelder:

- kvalifisert og ferdig Brand → `PASS`;
- ingen kandidat består Brand-definisjonen for stedet → `BEGRUNNET N/A`;
- en kvalifisert kandidat finnes, men nødvendig evidens, asset, proveniens eller materialisering mangler → `BLOCKED`.

Et virksomhetsnavn, stedsnavn, prosjektaktør eller skilt blir aldri Brand bare fordi PlaceCard ellers ville manglet en samling.

---

## 9. Stories

Stories følger `docs/STORIES_DATA_GOVERNANCE.md`.

Badge-/underbadge-rutingen kan peke på sannsynlige narrative akser, men en ny Story skal fortsatt ha selvstendig narrativ motor — konflikt, valg, overraskelse, forvandling eller annet som gir mer enn chronology.

Anti-dupliseringsregel:

> Hvis datoen fjernes, må det fortsatt finnes en tydelig fortelling.

Hvis ikke, hører stoffet i chronology/leksikon i stedet. Et Focused Place kan være komplett uten Story når kildene ikke bærer en ekte fortelling.

---

## 10. Quiz

Quiz følger bare `data/quiz/regler/QUIZ_PRODUCTION_CANONICAL.md`.

Eksisterende aktive, arkiverte og alternative quizfiler auditeres før profilvalg.

Quiz-auditen omfatter også den synlige QuizCard-flaten. Før nytt kort lages skal eksisterende `bilder/QuizCards/**`, tidligere quizkort og runtime-binding for `targetId` kontrolleres. Et eksisterende godt QuizCard gjenbrukes. Hvis kort mangler, produseres et dedikert stedsspesifikt QuizCard og bindes til PlaceCard-flippen; quizproduksjon er ikke closeout-klar før både quizdata og QuizCard-runtime er operative.

Badge, underbadges og eventuell canonical `quizFocus` brukes til å planlegge hva som skal undersøkes og læres. De er ikke faktakilder.

`production_profile` og quizprofil er separate systemer. Canonical Quiz velger adaptivt:

- `narrow`: 3×7;
- `normal`: 4×7;
- `rich`: 5–8×7;
- `major`: 8–10×7.

Påstandsbank og læringsbredde bestemmer eksakt lengde. Stedsprofil `major` kan ikke alene tvinge 10 sett dersom ti reelt ulike source-backed settplaner ikke finnes.

Ingen quiz fylles med svake eller gjentatte spørsmål for å nå et settantall.

---

## 11. Før/etter, Nyheter og Lesespor

### Før/etter

Produseres når Badge-/underbadge- og source-research viser en meningsfull, stedstro historisk sammenligning.

- canonical place-register/manifester er søkt før motivet velges;
- ulike tilfeldige kamerastandpunkter er ikke nok;
- et delsted som har egen canonical place-oppføring brukes ikke som primært Før/etter-stedfortreder for parent-stedet;
- et nyere bildepar erstatter ikke automatisk et eldre, mer historisk relevant førbilde;
- hvis kildene ikke bærer en god sammenligning, settes modulen `BEGRUNNET N/A` og vises ikke som tomt innhold.

### Nyheter

Produseres når en reell nyhetsflate er relevant for stedets Badge-/underbadge-identitet og nåværende rolle. Et sted uten meningsfull aktuell nyhetsflate kan etter audit være `BEGRUNNET N/A`.

### Lesespor

Relevante, tilgjengelige lesespor skal produseres. Badge/underbadge brukes til å lete målrettet etter passende lesestoff. Betalingsmur alene er ikke N/A-grunn. Hvis et dokumentert kandidatsøk faktisk ikke finner et kvalifisert spor, kan modulen ende `BEGRUNNET N/A`.

**Stoppgate:** Lesespor kan ikke godkjennes som tom/N/A for et innholdsrikt sted før et dokumentert søk viser at ingen relevant, rettighetsmessig trygg og direkte lesbar tekst kan vises. At de første treffene er betalingslåst er ikke tilstrekkelig N/A-grunn.

---

## 12. Katalogtriage før videre ordinær produksjon

Vi bruker en hybridmodell, ikke full research av hele katalogen først.

### Stage A — provisional triage

Eksisterende katalog får en lett klassifisering basert på eksisterende canonical data, inkludert Badge-feltene som allerede finnes:

```text
production_profile: major | standard | focused | micro
profile_status: provisional
profile_reason: <kort grunn>
badge_basis: <category + underbadge_ids>
```

Dette produserer ikke innhold. Formålet er realistisk backlog, prioritering og klyngeplan.

### Stage B — confirmed preflight

Når et sted faktisk går inn i produksjon, leses Badge-familien, underbadges og stedskilder ordentlig før profilen bekreftes eller overstyres:

```text
production_profile:
profile_status: confirmed
profile_reason:
profile_changed_from: <valgfritt>
```

Nye Places klassifiseres direkte som `confirmed` i preflight.

---

## 13. Nullmåling

Før første brukerrettede endring skal arbeidskort/nullmåling minst dekke:

- `HOVEDBADGE/CATEGORY` og canonical Badge-fil;
- alle `UNDERBADGE_IDS` og hva de betyr for stedet;
- Badge-routerens researchspor/kandidatsamlinger;
- produksjonsprofil og profilbegrunnelse;
- canonical identitet og source-eier;
- prior work/kollisjoner;
- koordinater/geometri;
- emner og Fagverk;
- description-status;
- popup-/eierflater;
- Språkleksikon og eventuelt dialektlag;
- chronology/epoke-status;
- People/Objects/Brands/kategori-samling;
- Stories/Quiz/Knowledge;
- Før/etter/Nyheter/Lesespor;
- relasjoner/ruter;
- bilder/proveniens;
- faktisk UI-status.

Arbeidskortet skal ha:

```text
HOVEDBADGE/CATEGORY:
UNDERBADGE_IDS:
BADGE-ROUTER STATUS:
BADGE-DREVNE RESEARCHSPOR:
PRODUKSJONSPROFIL: major | standard | focused
PROFILSTATUS: provisional | confirmed
PROFILBEGRUNNELSE:
PROFILENDRING FRA TRIAGE:
UNIVERSAL CORE STATUS:
INNHOLDSPLAN:
  People: PRODUSER | N/A + grunn | BLOCKED + grunn
  Objects: PRODUSER | N/A + grunn | BLOCKED + grunn
  Brands: PRODUSER | N/A + grunn | BLOCKED + grunn
  Category expression: PRODUSER | N/A + grunn | BLOCKED + grunn
  Stories: PRODUSER | N/A + grunn
  Før/etter: PRODUSER | N/A + grunn
  Nyheter: PRODUSER | N/A + grunn
  Lesespor: PRODUSER | N/A + grunn
PLACECARD-SAMLINGER: <kun ferdige PASS-IDs; ingen fast kvote>
KATEGORIUTTRYKK + BEGRUNNELSE:
OBJECTS ↔ KATEGORIUTTRYKK-EIERGRENSE:
```

Nullmålingen kan ligge i samme PR som senere preflight-/innholdscheckpoints når risikobildet tillater det.

---

## 14. Faser er review-checkpoints, ikke PR-er

Produksjonen følger fortsatt sekvensielle checkpoints:

```text
IKKE STARTET → PÅGÅR → KLAR FOR REVIEW → GODKJENT / BEGRUNNET N/A
```

Før neste checkpoint starter skal aktivt arbeid være reviewet og arbeidskort oppdatert med:

- hva som ble kontrollert;
- Badge-/underbadge-grunnlaget;
- canonical eierfiler;
- hvilke eksisterende data som ble bevart;
- kilder/claims;
- relevante tester/auditer;
- blockers, holdbacks og N/A-begrunnelser.

Et checkpoint trenger ikke egen PR.

---

## 15. Mergegrenser følger risiko

Standard er få fokuserte mergegrenser, ikke én PR per fase.

Typiske grenser:

### A. Preflight/evidence

- Badge-/underbadge-gate;
- profil og innholdsplan;
- identity/source boundary;
- koordinater;
- shared source/claim pack;
- Fagverk-eierskap.

### B. Canonical brukerinnhold

- descriptions;
- popup-/leksikon-/språkinnhold;
- chronology;
- relevante People/Objects/Brands/kategorisamlinger;
- relevante Stories/Quiz/Knowledge/Før-etter/Nyheter/Lesespor.

### C. Integrasjon/slutt-QA

- genererte indekser/manifester;
- epokeindex/runtime;
- bred integrasjon;
- visuell QA;
- completion report.

Separat system-PR brukes når runtime/schema/generell kontrakt endres eller blast radius er bred. Den stedsavhengige PlaceCard-samlingskontrakten er en slik systemendring og skal være implementert i schema/runtime/testene før neste ordinære nyproduksjon closeoutes etter denne modellen.

---

## 16. Branch truth

Arbeidskort skal skille:

```text
HOVEDBADGE/CATEGORY:
UNDERBADGE_IDS:
PRODUKSJONSPROFIL:
PROFILSTATUS:
AKTIV FASE:
SISTE GODKJENTE CHECKPOINT:
AKTIVT FILSCOPE:
AKTIV MERGEGRENSE:
BRANCH STATUS: lokal | pushet | PR | merget
LIVE STATUS: ikke live | live på main
NESTE FASE:
```

Ingenting omtales som publisert før faktisk merge/live-status.

---

## 17. CI og validering

Kjør relevante gates for alle eide flater som endres. Final PR-head skal være grønn før merge.

Når en brukeroppgave allerede eksplisitt autoriserer fullføring, push og merge, er grønn exact-head CI og fravær av reelle blockere tilstrekkelig til å utføre merge. Det skal ikke innføres et nytt manuelt godkjenningsspørsmål mellom grønn CI og merge. Ny godkjenning er bare nødvendig dersom brukeren eksplisitt har bedt om hold/review, eller arbeidet avdekker en ny materiell risiko eller omfangsendring utenfor den autoriserte oppgaven.

Ved chronology/epoke-endring er minimum:

```bash
npm run epoker:places:build
npm run epoker:places:check
node --test tests/epoke-place-index.test.mjs tests/epoker-runtime-place-index.test.mjs tests/epoke-viewer.test.mjs
```

Epokeindeks bygges fra sources og håndredigeres aldri for å få et sted inn i viewer.

Badge-/produksjonsprofil-systemet skal ha permanent test for:

- at alle hovedbadges i `data/badges/index.json` har routing i `data/badges/place_production_routing_v1.json`;
- at alle Badge-filer har canonical underbadges;
- at routingrekkefølgen krever underbadges og source review før endelig innholdsplan;
- at Badge-hints aldri overstyrer kilder eller skaper filler.

PlaceCard-systemendringer skal ha permanente tester for:

- schema/runtime aksepterer stedsavhengig antall ordinære samlinger og krever bare ferdige PASS-samlinger i `collection_ids`;
- People, Objects, Brands og kategoriuttrykk kan ende `BEGRUNNET N/A` etter dokumentert kandidataudit;
- `BLOCKED` brukes for reell kvalifisert, men uferdig samling — ikke for naturlig fravær;
- ingen `images`/Badges som samlinger;
- ingen `related` som samling;
- legacy fallback;
- balansert layout for 1, 2, 3 og 4 samlinger uten tomme reservefelter;
- ingen tomme samlingskort;
- faktisk preview fra medlem;
- fortsatt korrekt Micro-/Nature-/spesialprofil-unntak.

---

## 18. Manuell slutt-QA — hard gate

Et ordinært sted kan ikke merkes `SLUTTFØRT` før hele opplevelsen er vurdert mot bekreftet Badge-grunnlag, profil og innholdsplan.

Minimum:

- bekreft Hovedbadge/category og `underbadge_ids`;
- bekreft at endelig innholdsplan kan forklares ut fra Badges **og** faktiske kilder;
- bekreft `PROFILSTATUS: confirmed`;
- bekreft Universal canonical core;
- åpne alle relevante popupfaner;
- kontroller obligatorisk Språk;
- kontroller chronology/epokeviser;
- kontroller People/Objects/Brands/kategoriuttrykk-eierskap og at hver av dem har korrekt `PASS`, `BEGRUNNET N/A` eller `BLOCKED`;
- kontroller at ingen `BEGRUNNET N/A`-samling er erstattet med filler bare for layout;
- kontroller Før/etter, Nyheter og Lesespor når de er valgt i innholdsplanen;
- kontroller Quiz og Stories mot sine egne kontrakter;
- kontroller `frontImage` som ekte stående fil;
- kontroller at stedet har dedikert QuizCard, at eksisterende kort er gjenbrukt der det finnes, og at quizkortet ikke brukes som `image`, `cardImage` eller `frontImage`;
- flip PlaceCard fra `frontImage` til QuizCard og tilbake på faktisk PR-head; kontroller mus/touch og relevant tastaturinput, at riktig stedskort vises, og at flippen ikke åpner feil sted eller skjuler quiztilgangen;
- kontroller hver valgt PlaceCard-samling og dens popup;
- kontroller at ingen valgt samling står tom eller mangler bilde;
- kontroller at layouten ser god ut på mobil og desktop for det faktiske antallet valgte samlinger;
- kontroller at PlaceCard faktisk føles riktig for Badge-/underbadge-typen, ikke som en generisk mal;
- kontroller at alle valgte samlinger er ferdige, tydelig forskjellige og visuelt balanserte;
- gjenåpne produksjonen dersom slutt-QA motsier tidligere checkpoint.

Grønn CI kan aldri overstyre et dokumentert stygt, kunstig eller ufullstendig PlaceCard.

---

## 19. Forholdet til v1-referansen

`docs/PLACE_PRODUCTION_CHECKLIST_REFERENCE_V1.md` er fortsatt detaljruter for research og subsystemkvalitet, med disse aktive overstyringene:

1. merge mellom hver fase er ikke nødvendig;
2. Språkleksikon er obligatorisk for alle ordinære Places;
3. chronology/epoke research skjer samtidig med full stedsproduksjon;
4. Hovedbadge + underbadges er obligatorisk routinggrunnlag for innholdsplanen;
5. produksjonsprofil bestemmer forventet dybde/bredde etter Badge- og source-review;
6. alle plausible betingede subsystemer vurderes, men bare relevante subsystemer materialiseres;
7. filler for å nå felttall/fullness er forbudt;
8. PlaceCard for nye/fullproduserte ordinære Places viser bare ferdige `PASS`-samlinger og har ingen universell firefeltskvote;
9. People, Objects, Brands og kategoriuttrykk skal kandidatauditeres når relevante, men kan ende `BEGRUNNET N/A`; Related er aldri en samling;
10. stedsprofil og Quiz-profil er separate beslutninger;
11. hvert ordinært fullprodusert Place har et eget operativt QuizCard som flip-bakside til `frontImage`; eksisterende QuizCards auditeres og gjenbrukes før ny produksjon, og `bilder/QuizCards/**` brukes aldri som ordinært Place-bilde.

Ved konflikt med eldre formulering om fast firefelts-fullness, universell Brands/People/Objects-/kategoriuttrykk-plikt, separat senere Fagverk-produksjon eller obligatorisk materialisering av et irrelevant subsystem gjelder denne v2.6-sjekklisten.

---

## Kort regel

**La innholdet følge Badges og kildene. Hovedbadge åpner researchuniverset, underbadges former kandidatene, kildene avgjør hvilke samlinger og medlemmer som faktisk kvalifiserer, og produksjonsprofilen avgjør hvor dypt vi går. People, Objects, Brands og kategoriuttrykk vurderes når relevante, men produseres bare når stedet bærer dem. `BEGRUNNET N/A` er en legitim ferdigstatus. Related er aldri en samling. Ingen filler. Ingen tomme kort.**