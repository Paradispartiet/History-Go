# History GO — Place Production Checklist v2.4

Status: **canonical produksjonsarbeidsflyt**  
Eier: `place_by_place_production_workflow`  
Sist kontrollert: **2026-08-31**

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

- `naeringsliv + industri` gjør produksjonsprosess, arbeid, teknologi, anlegg og fysiske spor til sterke kandidatspor; den faste Brand-samlingen krever fortsatt en kandidat som faktisk består Brand-kontrakten;
- `naeringsliv + bank_og_finans` skal ikke få industrimaskiner fordi et annet Næringsliv-sted har dem;
- `historie + industrihistorie` kan gi en annen innholdsplan enn `historie + sosialhistorie` eller `historie + kulturminner_og_bevaring`;
- `musikk + konsertsteder` prioriterer scenehistorie, artister, konserter og venue-/lydspor;
- `film_tv + filmlocations` prioriterer konkrete produksjoner og location-relasjoner; selve location-relasjonen er ikke Brand, mens produksjonsselskap, studio, kanal, kino eller venue-identitet kan kvalifisere etter Brand-kontrakten;
- `sport + stadion` og `sport + supporterkultur` skal ikke få identiske PlaceCards;
- `natur + fugler` prioriterer Fauna-research, men alle fire faste naturflater må fortsatt dokumenteres;
- `natur + geologi` prioriterer kart-/landformsporet uten å fjerne Kart, Flora, Fauna eller Turmål; manglende stedsspesifikk dokumentasjon blokkerer fullproduksjonen og erstattes aldri med generiske arter;
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

## 3. Faste samlinger og betingede subsystemer

Badge-router og aktive underbadges åpner kandidatene. Faktiske kilder og subsystemkontrakter avgjør sluttstatus.

For ordinære fullprofiler er medlemsproduksjon til disse fire samlingene obligatorisk:

- People;
- Objects;
- Brands;
- kategoriuttrykk (`historical_events`, `productions`, `structures`, `competitions` eller `destinations` etter samlingskontrakten);

Badge og kilder avgjør hvilke medlemmer som kvalifiserer. De fire samlingsflatene kan ikke settes N/A eller utelates.

Betingede moduler omfatter blant annet:

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

`BEGRUNNET N/A` betyr at en betinget modul etter korrekt Badge-drevet kandidataudit og source review ikke hører til stedet. Det betyr ikke «gjør senere». For de fire faste fullprofil-samlingene er manglende kvalifiserte medlemmer `BLOCKED`, aldri N/A.

**Ingen filler:** Det er forbudt å opprette en perifer person, et tilfeldig objekt, et konstruert Brand, en duplisert Structure, et kunstig kategoriuttrykk, en svak Story eller svake/gjentatte quizspørsmål bare for å møte en kvote eller layout. Samtidig kan et ordinært Place ikke fullføres før alle fire reelle samlinger er produsert.

---

## 4. PlaceCard — fire ferdige samlinger på alle fulle steder

Canonical samlingskontrakt: `data/places/README_place_rounds.md`.

For nye og fullproduserte ordinære Places gjelder:

- `place_card_profile.collection_ids` inneholder **nøyaktig fire ferdige, relevante samlinger**;
- ordinære fullprofiler bruker People, Objects, Brands og kategoriens uttrykk;
- Nature bruker Kart, Flora, Fauna og Turmål; canonicale spesialprofiler følger sitt eget faste firersett;
- `related` er et relasjons-/navigasjonssystem og kan aldri brukes som PlaceCard-samling eller reserve;
- kategoriuttrykket følger matrisen i `data/places/README_place_rounds.md`; Structures utenfor By krever et sentralt, substansielt bygnings-/anleggsmiljø og uttrykkelig begrunnelse;
- Historie bruker `historical_events` for avgrensede, stedsspesifikke historiske hendelser; `productions` er ikke Historie-samling, og kalender-/nåtidssystemet `events` er en annen eier;
- Structures velges for et Historie-sted bare som en begrunnet stedsspesifikk variant når flere navngitte bygg/anlegg er et sterkere uttrykk enn hendelser — aldri som automatisk reserve;
- samlingsvalget skal følge Badge-/underbadge-baserte kandidater og faktisk materialisert innhold;
- hver valgt samling har minst ett ekte canonical medlem;
- hver valgt samling har et validert, lastbart previewbilde av et medlem;
- source-tomme samlinger blokkerer fullproduksjonen og skal ferdigstilles med reelt innhold, aldri skjules eller fylles kunstig;
- **ingen tomme PlaceCard-kort er tillatt ved closeout**;
- de fire samlingene vises i en fast, balansert 2×2-komposisjon;
- People/Flora/Fauna beholder sirkelform; øvrige samlinger er avrundede rektangler;
- `frontImage` er den stående hovedflaten og skal være en faktisk stående fil/variant (`height > width`), aldri bare en liggende fil beskåret av CSS;
- hvert samlingspreview er et faktisk bilde av ett canonical medlem, aldri `frontImage` brukt som falskt samlingspreview;
- ikon-/statusvisning er bare runtime-fallback ved lastingsfeil og kan aldri lukke produksjonsgaten;
- gamle Places kan beholde kompatibilitetsvisningen til de faktisk fullproduseres/revideres; ny/full produksjon migrerer alltid til firefeltskontrakten.

Slutt-QA skal eksplisitt vurdere at kortet ser **pent, tilsiktet, balansert og komplett for akkurat denne typen sted og dens Badges** ut på mobil og desktop.

Et valgt samlingskort uten entity eller bilde er BLOCKED. Løsningen er å ferdigstille den reelle samlingen eller, dersom kategoriuttrykket var feil valgt, velge et annet kategoriuttrykk som kontrakten faktisk tillater og stedet bærer. People, Objects eller Brands fjernes ikke fra en ordinær fullprofil. Et sted kan ikke closeoutes med færre enn fire samlinger.

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

Objects følger `docs/PLACE_OBJECTS_CANONICAL.md`.

Utvalget skal først forklare stedets hovedfunksjon. På industri- og produksjonssteder undersøkes former/verktøy, maskiner, måle- og kvalitetsutstyr, emballasje-/håndteringsutstyr og andre dokumenterte produksjonsgjenstander før sekundære kulturspor.

Objects skal være fysiske, identifiserbare gjenstander med dokumentert stedstilknytning og egne medlemsbilder. En kjent person eller et kjent verk skal ikke gjøre et sekundært tema til stedets hovedsamling. Når Object-gruppen mangler tilstrekkelig objekt-, kilde- eller bildebevis, føres den som `SOURCE-BOUNDED HOLDBACK` og fullproduksjonen forblir blokkert til samlingen består kontrakten.

Objects følger kategoriens hovedfunksjon. Kunst kan for eksempel ha både Objects og Kunstverk: kunstnerverktøy, materialgjenstander, arbeidsmodeller og katalogobjekter hører i Objects, mens selve kunstverkene hører i Kunstverk. Tilsvarende skiller gjelder mellom fysisk eksemplar og verk, utstyr og metode, gjenstand og hendelse, emballasje/produkt og Brand-identitet.

`Spor og objekter` / `Legg merke til` kan være eide underseksjoner i Objects-popupen uten å bli egne samlinger.

**People-popupen** eier dokumenterte personrelasjoner. **Relaterte steder** eier dokumenterte place→place-relasjoner; slike relasjoner skal ikke flyttes inn i People bare for å fylle en samling.

### Brands

`data/brands/brand_rules_v1_1.json` er canonical Brand-eier.

Brands er en fast samling og en obligatorisk kandidataudit i alle ordinære fullprofiler. Brand-kontrakten omfatter ikke bare forbrukermerker, men også dokumenterte profesjonelle, institusjonelle, venue-, organisasjons-, legacy-, produkt- og skiltidentiteter med selvstendig gjenkjennelse og direkte stedstilknytning. Ingen underbadge kan likevel godkjenne Brand alene.

Null treff i eksisterende register betyr «må researches», ikke automatisk N/A. Et faktisk kandidatsøk skal dokumenteres. Hvis ingen kandidat består definisjonen, er ordinær fullproduksjon blokkert; løsningen er videre source-bounded research eller ny vurdering av stedets canonical scope, aldri et konstruert Brand.

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
  People: PRODUSER | BLOCKED + grunn
  Objects: PRODUSER | BLOCKED + grunn
  Brands: PRODUSER | BLOCKED + grunn
  Category expression: PRODUSER | BLOCKED + grunn
  Stories: PRODUSER | N/A + grunn
  Før/etter: PRODUSER | N/A + grunn
  Nyheter: PRODUSER | N/A + grunn
  Lesespor: PRODUSER | N/A + grunn
PLACECARD-SAMLINGER: <nøyaktig fire ferdige IDs>
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

Separat system-PR brukes når runtime/schema/generell kontrakt endres eller blast radius er bred. Denne produksjonsprofil-/Badge-/PlaceCard-endringen er en slik systemendring og skal være merget før neste ordinære nyproduksjon følger modellen.

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

- schema krever nøyaktig fire for ordinære fullprofiler;
- ingen `images`/Badges som samlinger;
- ingen `related` som samling;
- legacy fallback;
- fast 2×2-layout for fullprofiler;
- ingen tomme samlingskort;
- faktisk preview fra medlem;
- fortsatt korrekt Micro-/underkategori-unntak.

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
- kontroller People/Objects/Brands/kategoriuttrykk-eierskap;
- kontroller Før/etter, Nyheter og Lesespor når de er valgt i innholdsplanen;
- kontroller Quiz og Stories mot sine egne kontrakter;
- kontroller `frontImage` som ekte stående fil;
- kontroller hver valgt PlaceCard-samling og dens popup;
- kontroller at ingen valgt samling står tom eller mangler bilde;
- kontroller at den fulle 2×2-layouten ser god ut på mobil og desktop;
- kontroller at PlaceCard faktisk føles riktig for Badge-/underbadge-typen, ikke som en generisk mal;
- kontroller at alle fire samlinger er ferdige, tydelig forskjellige og visuelt balanserte;
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
8. PlaceCard for nye/fullproduserte ordinære Places viser nøyaktig fire **ferdige** samlinger — aldri tomme reserver;
9. ordinære fullprofiler bruker People, Objects, Brands og kategoriuttrykk; Related er aldri en samling;
10. stedsprofil og Quiz-profil er separate beslutninger.

Ved konflikt med eldre formulering om fast firefelts-fullness, universell Brands/People/Objects-plikt eller obligatorisk materialisering av et irrelevant subsystem gjelder denne v2.3-sjekklisten.

---

## Kort regel

**La innholdet følge Badges. Hovedbadge åpner researchuniverset, underbadges former kandidatene, kildene avgjør hvilke medlemmer som kvalifiserer, og produksjonsprofilen avgjør hvor dypt vi går. Alle fulle ordinære Places viser People, Objects, Brands og kategoriens eget uttrykk i fire ferdige flater. Related er aldri en samling. Ingen filler. Ingen tomme kort.**
