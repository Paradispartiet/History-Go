# History GO — Place Production Checklist v2.3

Status: **canonical produksjonsarbeidsflyt**  
Eier: `place_by_place_production_workflow`  
Sist kontrollert: **2026-08-27**

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

> **Hovedregel:** Alle ordinære Places har samme harde canonical core. Hovedbadge og underbadges bestemmer hva produksjonen skal undersøke; stedets faktiske kilder bestemmer hvilke kandidater som kvalifiserer; produksjonsprofilen bestemmer hvor dypt vi går. Et lettere sted er smalere ferdig — aldri halvferdig.

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

- `naeringsliv + industri` gjør produksjonsprosess, arbeid, teknologi, anlegg og fysiske spor til sterke kandidater; Brand produseres bare hvis Brand-kontrakten faktisk består;
- `naeringsliv + bank_og_finans` skal ikke få industrimaskiner fordi et annet Næringsliv-sted har dem;
- `historie + industrihistorie` kan gi en annen innholdsplan enn `historie + sosialhistorie` eller `historie + kulturminner_og_bevaring`;
- `musikk + konsertsteder` prioriterer scenehistorie, artister, konserter og venue-/lydspor;
- `film_tv + filmlocations` prioriterer konkrete produksjoner og location-relasjoner, ikke automatisk et Brand;
- `sport + stadion` og `sport + supporterkultur` skal ikke få identiske PlaceCards;
- `natur + fugler` gjør Fauna til en sterk kandidat bare når arter er dokumentert for stedet;
- `natur + geologi` kan gi et sterkt sted uten Flora/Fauna dersom biologisk dokumentasjon ikke bærer dem;
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
- stående, stedstro `frontImage` når ordinær PlaceCard brukes;
- Språkleksikon med minst ett reelt stedsspesifikt navne-/begrepsspor;
- chronology/epoke-research og materialisering av kvalifiserte eksakte ankere;
- relasjons-/own-place-audit;
- runtime/materialisering;
- relevante CI-/audit-gater;
- manuell slutt-QA.

Teknisk PASS er aldri synonymt med redaksjonell ferdigstatus.

---

## 3. Betingede subsystemer — vurder gjennom Badges, produser når de passer

Badge-router og aktive underbadges åpner kandidatene. Faktiske kilder og subsystemkontrakter avgjør sluttstatus.

Betingede moduler omfatter blant annet:

- People;
- Objects;
- Brands;
- kategori-eid samling (`structures`, `related`, `productions`, `competitions`, `destinations`);
- Stories;
- Før/etter;
- Nyheter;
- Lesespor;
- ruter/narrative koblinger;
- ekstra Fagverk-spor og medier.

Gyldige sluttstatus:

```text
PASS
BEGRUNNET N/A
BLOCKED
```

`BEGRUNNET N/A` betyr at modulen etter korrekt Badge-drevet kandidataudit og source review ikke hører til stedet. Det betyr ikke «gjør senere», og det skal aldri etterlate et tomt PlaceCard-kort.

**Ingen filler:** Det er forbudt å opprette en perifer person, et tilfeldig objekt, et konstruert Brand, en duplisert Structure, en svak Story eller svake/gjentatte quizspørsmål bare for å møte en kvote eller layout.

---

## 4. PlaceCard — alltid pent og stedstilpasset

Canonical samlingskontrakt: `data/places/README_place_rounds.md`.

For nye og fullproduserte ordinære Places gjelder:

- `place_card_profile.collection_ids` inneholder **1–4 ferdige, relevante samlinger**;
- samlingsvalget skal følge Badge-/underbadge-baserte kandidater og faktisk materialisert innhold;
- hver valgt samling har minst ett ekte canonical medlem;
- hver valgt samling har et validert, lastbart previewbilde av et medlem;
- ikke-relevante eller source-tomme samlinger utelates fra `collection_ids`;
- **ingen tomme PlaceCard-kort er tillatt ved closeout**;
- 1 samling vises stor og sentrert;
- 2 samlinger vises som et balansert par;
- 3 samlinger bruker en balansert 2+1-komposisjon;
- 4 samlinger bruker 2×2;
- People/Flora/Fauna beholder sirkelform; øvrige samlinger er avrundede rektangler;
- `frontImage` er den stående hovedflaten og skal være en faktisk stående fil/variant (`height > width`), aldri bare en liggende fil beskåret av CSS;
- hvert samlingspreview er et faktisk bilde av ett canonical medlem, aldri `frontImage` brukt som falskt samlingspreview;
- ikon-/statusvisning er bare runtime-fallback ved lastingsfeil og kan aldri lukke produksjonsgaten;
- gamle Places uten ny eksplisitt profil og eksisterende firefeltsprofiler beholder kompatibilitetsvisningen til de faktisk fullproduseres/revideres; nye adaptive 1–3-profiler viser bare bildeklare samlinger.

Slutt-QA skal eksplisitt vurdere at kortet ser **pent, tilsiktet, balansert og komplett for akkurat denne typen sted og dens Badges** ut på mobil og desktop.

Et valgt samlingskort uten entity eller bilde er BLOCKED. Løsningen er enten å ferdigstille den reelle samlingen eller å fjerne den fra `collection_ids` når research viser at samlingen ikke hører til stedet — aldri å la et tomt kort stå igjen.

---

## 5. Fagverk-sted — obligatorisk

Alle canonicale steder skal ha sin egen fungerende fagverkside.

**fagverk-sted — obligatorisk, fungerende og aldri N/A.** Kravet gjelder hvert sted, kan ikke settes til N/A og er en egen ferdigport.

Alle ordinære canonical Places skal ha fungerende stedsspesifikk Fagverk-side. Fagverkets faglige vekt skal samsvare med Hovedbadge, underbadges, emner og dokumentert stedskunnskap.

Arbeidskortet skal føre:

```text
FAGVERK-STED-STATUS:
```

`fagverk-sted` er aldri N/A for et ordinært Place.

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

People produseres når Badge-/underbadge-planen og kildene viser canonical personer med dokumentert direkte relevans. En perifer person skal ikke produseres for å fylle kortet.

Canonical metode:

- `docs/people-of-places-method.md`;
- `docs/PEOPLE_PROFILE_CANONICAL.md`.

### Objects

Objects skal være fysiske, identifiserbare gjenstander med dokumentert stedstilknytning. Badge kan peke mot relevante objekttyper, men observasjonstekst eller et bygg gjøres ikke om til Object for å øke antallet.

`Spor og objekter` / `Legg merke til` kan være eide underseksjoner i Objects-popupen uten å bli egne samlinger.

