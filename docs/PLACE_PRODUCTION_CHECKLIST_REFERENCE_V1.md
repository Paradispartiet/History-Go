# History GO — sted-for-sted produksjonsoppskrift

Status: **canonical produksjonsarbeidsflyt**  
Eier: `place_by_place_production_workflow`  
Sist kontrollert: **2026-08-27**

Dette dokumentet er arbeidsoppskriften for å ferdigstille **ett History GO-sted om gangen**.

Det er en **ruterings- og sjekkliste**, ikke en erstatning for subsystemenes egne produksjonskontrakter. Når et punkt nedenfor sier **LES FØRST**, skal den navngitte kontrakten faktisk leses og følges før data produseres eller godkjennes.

> **Ett sted ferdig før neste. Manglende relevant innhold er bedre enn filler. Glemt kontroll er ikke godkjent.**

---

# 0. Autoritetskart — les riktig oppskrift før du produserer

| Område | Autoritativ produksjons-/runtimekontrakt |
| --- | --- |
| Overordnet faktisitet | `docs/FACTUALITY_CONTRACT.md` |
| Place-data, manifester og referanser | `docs/DATA_PRODUCTION_CONTRACT.md` |
| Canonical stedstandard | `docs/PLACE_STANDARD.md` |
| `desc` og `popupDesc` | **`data/places/regler/PLACE_DESCRIPTION_CANONICAL.md`** |
| Description-produksjonspakke | `data/places/regler/place_description_production_v4_2.schema.json` |
| Stedspopup / direkte faner og scrollbar | **`docs/PLACE_POPUP_SYSTEM.md`** |
| Språkleksikon / dialektord og lokale uttrykk | **`docs/SPRAKLEKSIKON.md`** |
| PlaceCard-samlinger | **`data/places/README_place_rounds.md`** |
| Brands-semantikk, klassifisering og place-kobling | **`data/brands/brand_rules_v1_1.json`** |
| Kategori / canonical kategori-ID-er | `data/categories/category_contract.json` |
| Fagverk / merke vs fag / navigasjon | `docs/FAGVERK_NAVIGATION.md` |
| Politikk — canonical fagmodell | `data/fag/politikk/politikk_runtime_manifest.json` |
| Politikk — faglig kvalitet og inferensgrenser | `scripts/audit-politikk-subject-quality.mjs` og `scripts/audit-politikk-thinker-integrity.mjs` |
| Politikk — stedsgate og produksjonsrapport | `data/places/regler/politikk_place_production_v1.schema.json` og `scripts/audit-politikk-place-production.mjs` |
| Historie — canonical V5.8-fagmodell | `data/fag/historie/historie_v5_contract.json` |
| Historie — casekrav, claims, kilder og stedsevidens | `data/fag/historie/case_requirements_historie_canonical_v1.json`, `claims_historie_canonical_v1.json`, `sources_historie_canonical_v1.json` og `place_evidence_historie_v1.json` |
| Historie — stedsgate og produksjonsrapport | `data/places/regler/historie_place_production_v1.schema.json` og `scripts/audit-historie-place-production.mjs` |
| Kronologi / epokeviser | `scripts/build-epoke-place-index.mjs`, `data/epoker/epoke-place-index.json`, `.github/workflows/epoke-viewer-quality.yml`, `tests/epoke-place-index.test.mjs`, `tests/epoker-runtime-place-index.test.mjs` og `tests/epoke-viewer.test.mjs` |
| Økonomi og næringsliv — canonical fagmodell | `data/fag/naeringsliv/naeringsliv_runtime_manifest.json`, `emner_naeringsliv_canonical_v4_5.json` og `methods_naeringsliv_canonical_v4_5.json` |
| Økonomi og næringsliv — faglig standard og kildeprioritet | `data/fag/naeringsliv/universitetsramme_okonomi_og_naeringsliv_v1.json`, `quiz_generator_rules_naeringsliv_v5_1_source_priority_patch.json` og `scripts/audit-naeringsliv-source-maintenance.mjs` |
| Økonomi og næringsliv — stedsgate og produksjonsrapport | `data/places/regler/naeringsliv_place_production_v1.schema.json` og `scripts/audit-naeringsliv-place-production.mjs` |
| Subkultur — bindende kategorigrense | `data/fag/subkultur/SUBKULTUR_CATEGORY_BOUNDARY.md` |
| Subkultur — canonical emner, metoder og kildeprioritet | `data/fag/subkultur/emner_subkultur_canonical_v4_5.json`, `methods_subkultur_canonical_v4_5.json`, `subkulturpensum_canonical_v4_5.json` og `quiz_generator_rules_subkultur_v5_1_source_priority_patch.json` |
| Subkultur — stedsgate og produksjonsrapport | `data/places/regler/subkultur_place_production_v1.schema.json` og `scripts/audit-subkultur-place-production.mjs` |
| People–sted-koblinger | **`docs/people-of-places-method.md`** |
| Ny/revidert People-profil | **`docs/PEOPLE_PROFILE_CANONICAL.md`** |
| People-bilder / lisens / attribusjon | `docs/PEOPLE_IMAGES.md` |
| Stories | **`docs/STORIES_DATA_GOVERNANCE.md`** |
| Quiz | **`data/quiz/regler/QUIZ_PRODUCTION_CANONICAL.md`** |
| Koordinatdokumentasjon | `docs/coordinates/README.md` |
| Coordinate source contract | **`docs/coordinates/coordinate-source-contract-v1.md`** |
| Coordinate evidence | `docs/coordinates/coordinate-evidence-files-v1.md` |
| Naturmapping | `README/nature_mapping_workflow.md` |
| Ferdig-/progresjonsmodell | `docs/COMPLETION_DEFINITIONS.md` |
| Quiz vs fysisk besøk | `docs/QUIZ_AND_PHYSICAL_VISIT_MODEL.md` |
| Implementert profil/progresjonslesing | `docs/PROFILE_PROGRESS_READER_RUNTIME.md` |
| Historiske ruter | `docs/README_HistoryGo_Historiske_Ruter.md` |
| Spotmeeting | `docs/HG_SPOTMEETING.md` |
| Social Meet-identitet | `docs/HG_SOCIAL_MEET_IDENTITY_CONTRACT.md` |

Ved konflikt gjelder den canonical kontrakten som eier subsystemet, sammen med strengeste relevante faktisitetsregel.

## Absolutt regel for detaljproduksjon

Denne filen kan si **at** Quiz, Story, People, `popupDesc`, Nature osv. skal vurderes. Den andre kontrakten bestemmer **hvordan** det produseres.

Det er derfor ikke lov å:

- skrive en quiz bare ut fra punktene i denne filen;
- skrive `desc`/`popupDesc` uten Place Description-protokollen;
- lage en People-record uten People Profile-kontrakten;
- lage en Story uten Stories governance;
- velge PlaceCard-samlinger uten samlingskontrakten;
- endre koordinat uten coordinate-kontraktene.

---

## Obligatorisk arbeidsmåte — nullmåling og én fase om gangen

Før et eksisterende eller nytt sted fylles, skal det lages en skriftlig nullmåling og sanerings-/produksjonsplan. Nullmålingen skal minst dekke canonical identitet, Politikk-, Historie-, Næringsliv- og Subkultur-gate når relevant, alle relevante popupfaner, inkludert datastyrte direktefaner, PlaceCard-samlinger, People, Objects, Brands, Badges, Stories, Quiz, Knowledge, kildebelagt chronology/epokedekning, kilder og faktisk UI-visning.

Produksjonen deles deretter i små faser. Bare én fase kan ha status `PÅGÅR` om gangen:

```text
IKKE STARTET → PÅGÅR → KLAR FOR REVIEW → GODKJENT / BEGRUNNET N/A
```

- [ ] nullmåling finnes før første innholdsendring;
- [ ] planen sier eksplisitt hva som beholdes, omskrives, flyttes, fjernes og mangler;
- [ ] aktiv fase og eksakt filscope er skrevet i arbeidskortet;
- [ ] neste fase starter ikke før den aktive fasen er reviewet;
- [ ] teknisk PASS brukes ikke som synonym for redaksjonell ferdigstatus;
- [ ] en samling er ikke ferdig fordi bare preview-elementet ser riktig ut;
- [ ] hver popupfane vurderes og godkjennes separat;
- [ ] checkpointene reviewes sekvensielt på samme branch, mens 2–4 risikobaserte PR-er normalt brukes per sted;
- [ ] branch-, PR-, merge- og live-status rapporteres presist; arbeid på en flercheckpoint-branch omtales aldri som publisert før merge.

### Stoppgate

Et sted kan ikke merkes `produksjonsklart` når nullmålingen eller fasesporingen mangler, når en relevant fase fortsatt er `IKKE STARTET`/`PÅGÅR`, eller når en teknisk minimumstest motsies av den synlige redaksjonelle kvaliteten.

### Manuell sluttvurdering kan gjenåpne stedet

- [ ] den synlige spilleropplevelsen vurderes som helhet etter at alle tekniske faser er merget;
- [ ] hver valgt PlaceCard-samling åpnes på faktisk produksjonsflate; synlig antall, popupinnhold og datakilde må stemme, og en samling som viser falsk 0 under lasting er et blockerfunn;
- [ ] alle valgte samlings-preview kontrolleres; hver flate skal vise et lastet bilde av et faktisk canonical medlem, mens ikon-/antallsfallback kun er trygg runtime-feilhåndtering og alltid er en blocker for fullproduksjon;
- [ ] Før/etter-tekstens retning, høyre/venstre, motivanker og observasjonsinstruks kontrolleres visuelt mot begge bildene;
- [ ] tomme faner, svake bildevalg, kunstige samlinger og taksonomisk korrekte men brukerfiendtlige kombinasjoner registreres som reelle kvalitetsavvik;
- [ ] manuell kvalitetskritikk kan gjenåpne en tidligere godkjent fase og oppheve `SLUTTFØRT`;
- [ ] grønn CI, komplett schema, kildeproveniens og korrekt feltantall brukes aldri til å overstyre en dokumentert svak sluttflate;
- [ ] den seksdelte kvalitetsvurderingen omscores når nye sluttfunn endrer dekning eller redaksjonell kvalitet.

---

# DEL A — ARBEIDSKORT FOR DET AKTIVE STEDET

Fyll før research/produksjon:

```text
PLACE ID:
NAVN:
CANONICAL SOURCE-FIL:
MANIFEST:
HVA REPRESENTerer PLACE-OBJEKTET:
PRIMÆRKATEGORI:
UNDERBADGES:
EMNE_IDS:
FAGVERK-STED-STATUS:
POLITIKK-HOVEDFUNKSJON (hvis relevant):
POLITIKK-EMNE_IDS (kun em_pol_*):
POLITIKK-EVIDENSKJEDE:
POLITIKK-NÅTIDSKONTROLL:
POLITIKK-PRODUKSJONSRAPPORT:
HISTORIE-HOVEDIDENTITET (hvis relevant):
HISTORIE-EMNE_IDS (kun em_his_*):
HISTORIE-STEDSTILKNYTNING:
HISTORIE-TIDSAVGRENSNING:
HISTORIE-CASE-REALISERINGER:
HISTORIE-KILDEKRITIKK:
HISTORIE-DAGENS-SPOR:
HISTORIE-PRODUKSJONSRAPPORT:
NÆRINGSLIV-HOVEDIDENTITET (hvis relevant):
NÆRINGSLIV-ANKERTYPE:
NÆRINGSLIV-EMNE_IDS (kun em_naering_*):
NÆRINGSLIV-ØKONOMISKE CASE:
NÆRINGSLIV-VERDISKAPINGSKJEDE:
NÆRINGSLIV-METODE/MÅL/ENHET:
NÆRINGSLIV-FORDELING/MAKT/RISIKO:
NÆRINGSLIV-DAGENS DRIFTSSTATUS:
NÆRINGSLIV-PRODUKSJONSRAPPORT:
STEDSTYPE:
KOORDINATSTATUS:
PLACE-SCOPE (canonical): `area` / ikke satt
DESCRIPTION-PRODUCTION-PACKAGE:
LEKSIKON-ID/FIL:
KRONOLOGI/EPOKE-STATUS — PASS / SOURCE-BOUNDED HOLDBACK / BLOKKERT:
KRONOLOGI-KILDER/ANKERE:
EPOKE-INDEX/RUNTIME-STATUS:
EPOKEVISER-QA:
SPRÅKLEKSIKON-STATUS:
SPRÅKLEKSIKON-TYPE — OMRÅDE / DIREKTE SPRÅKSTED / ENKELTSTED:
DIALEKTLAG — KUN `placeScope: "area"` / N/A:
DIALEKTORD/LOKALE UTTRYKK — RESEARCH OG PRODUKSJON:
MÅL FOR PLACECARD-SAMLINGER: 1–4 sterke flater valgt adaptivt + separat fast Badge + obligatorisk Quiz
VALGTE PLACECARD-SAMLINGER:
PEOPLE-KANDIDATER:
WORKS-KANDIDATER:
BRANDS SOM ALLEREDE FINNES:
ROUTE/RELATION-KOBLINGER:
QUIZ-STATUS:
STORY-STATUS:
VIKTIGSTE KILDER:
AVVIST/UVISST INNHOLD:
NULLMÅLING:
SANERINGS-/PRODUKSJONSPLAN:
AKTIV FASE:
AKTIVT FILSCOPE:
FORRIGE FASE MERGET OG LIVE-KONTROLLERT:
POPUPSTATUS — OM:
POPUPSTATUS — HISTORIE:
POPUPSTATUS — FORTELLINGER:
POPUPSTATUS — FØR/ETTER:
POPUPSTATUS — NYHETER:
POPUPSTATUS — LESESPOR:
POPUPSTATUS — KILDER:
POPUPSTATUS — SPRÅK:
POPUPSTATUS — SPOR OG OBJEKTER:
POPUPSTATUS — LEGG MERKE TIL:
POPUPSTATUS — BETYDNING:
POPUPSTATUS — MOTPUNKTER:
POPUPSTATUS — RELASJONER:
POPUPSTATUS — KUNNSKAP:
POPUPSTATUS — OBSERVASJONER:
MANUELL SLUTT-QA — FØR/ETTER-SAMMENLIGNING:
MANUELL SLUTT-QA — NYHETER-DEKNING:
MANUELL SLUTT-QA — DIREKTE TILLEGGSFANER:
MANUELL SLUTT-QA — RUNDINGSKOHERENS:
MANUELL SLUTT-QA — KRITISKE FUNN/BLOKKERE:
```

Arbeidskortet skal gjøre det tydelig **hva stedet er, hvor canonical sannhet ligger, hvilke subsystemer som er relevante og hvilke kontrakter som skal brukes**.

---

# DEL B — PRODUKSJONSREKKEFØLGE

## 1. Lås canonical identitet og source

**LES FØRST:**

- `docs/DATA_PRODUCTION_CONTRACT.md`
- `docs/FACTUALITY_CONTRACT.md`

Sjekk:

- [ ] søk repoet etter place-ID;
- [ ] søk fullt navn, gamle navn, aliaser og stavevarianter;
- [ ] bekreft at samme fysiske/historiske objekt ikke allerede finnes som et annet canonical place;
- [ ] kartlegg bygg, virksomheter, parker, plasser og andre delsteder innenfor eller langs stedet som allerede har egne canonical place-oppføringer;
- [ ] legg innholdet hos riktig place-eier: et delsted med egen place-oppføring kan lenkes som relasjon eller brukes som tydelig avgrenset supplement, men kan ikke brukes i stedet for parent-place i noen fane, samling, bildepar, Story eller hovedpåstand;
- [ ] finn manifest-loadet source-fil som faktisk eier stedet;
- [ ] aggregate-/legacyfil er ikke feilaktig edit-target;
- [ ] definer place-objektet i én presis setning;
- [ ] skill bygg/institusjon, område/enkeltobjekt, minnested/hendelsessted, historisk/dagens objekt der det er relevant.

### Stoppgate

Ikke produser videre hvis place-identiteten eller source of truth er uklar, eller hvis innhold fra et eget canonical place brukes som stedfortreder for stedet som produseres.

---

## 2. Bygg kildegrunnlaget før teksten

**LES FØRST:** `docs/FACTUALITY_CONTRACT.md`

- [ ] åpne og les faktiske kilder, ikke bare søkeresultater/snippets;
- [ ] prioriter primærkilder, offentlige registre, arkiv og institusjonelle kilder;
- [ ] registrer hvilken kilde som støtter hvilken påstand;
- [ ] skill fakta fra tolkning;
- [ ] registrer konflikter og usikkerhet;
- [ ] bruk ikke eksisterende History GO-tekst som eneste kilde;
- [ ] bruk aldri språkmodell som faktakilde;
- [ ] utelat påstander som ikke kan verifiseres;
- [ ] samtidige/nåtidsopplysninger får fersk kontroll.

Minimum for vesentlige fakta:

```text
påstand → konkret kilde → konkret kildeplassering → kontrollstatus
```

---

## 2A. Kildebelagt kronologi og epoker — universell ferdigport

Denne fasen gjelder **alle ordinære canonicale Places**, uavhengig av primærkategori. Historie-gaten kan skjerpe kravene for et Historie-sted, men kronologi/epoke er ikke forbeholdt Historie-kategorien. Researchen gjøres mens kildegrunnlaget er ferskt, og materialiseringen ferdigstilles i samme stedsproduksjon.

**LES FØRST — obligatorisk:**

- `docs/FACTUALITY_CONTRACT.md`;
- `scripts/build-epoke-place-index.mjs`;
- `.github/workflows/epoke-viewer-quality.yml`;
- relevante leksikon-/place-production-/Historie-/Stories-kontrakter for evidensbanen som brukes.

### A. Research kronologi samtidig med stedet

- [ ] søk etter relevante, stedsspesifikke historiske hendelser mens de samme kildene brukes til description, Historie, People, Brands, Før/etter og øvrig research;
- [ ] registrer eksplisitt hvilke kilder som støtter hvilke daterte hendelser;
- [ ] prioriter identitetsbærende og forklarende tidsankere: etablering, bygging/åpning, funksjonsskifte, viktige utvidelser, dokumenterte eierskifter når de forklarer stedet, nedleggelse, ombruk, institusjons-/navneskifte og andre reelle vendepunkter;
- [ ] ikke fyll timeline med trivielle årstall bare fordi en kilde inneholder dem;
- [ ] eksisterende chronology og epokedekning auditeres før nye ankere opprettes, slik at samme hendelse ikke dupliseres.

### B. Dateringspresisjon er source-bounded

- [ ] et eksakt år brukes bare når kilden faktisk støtter et eksakt år;
- [ ] `ca.`, `cirka`, `omkring`, `rundt`, usikker datering, tiår, århundre eller periode gjøres aldri om til et oppdiktet enkeltår;
- [ ] flere år i samme claim skilles til egne hendelser eller får eksplisitt `timelineYear` bare når claimet og kilden faktisk bærer den valgte ankeringen;
- [ ] hendelsesår, publiseringsår, byggeperiode, flytteår og senere minne-/jubileumsår blandes ikke;
- [ ] chronology brukes ikke som årsaksbevis; den dokumenterer først og fremst **hva som skjedde når**.

### C. Materialiser gjennom canonical evidensbane

`scripts/build-epoke-place-index.mjs` leser flere source-backed baner. Bruk banen som faktisk eier evidensen; ikke håndrediger den genererte epokeindeksen.

- [ ] manifest-loadet leksikon-`chronology[]` kan brukes når posten har numerisk `year` og inspectable HTTP-kilde;
- [ ] verifiserte place-production-claims kan brukes når claimet er historisk, har eksakt kvalifisert år, inspectable `sourceUrl` og claim-/source-location-proveniens;
- [ ] canonical Story kan bidra bare når den allerede består Stories-kontrakten, har eksplisitt år og inspectable kilde; et årstall alene er aldri grunn til å lage en Story;
- [ ] validert Historie-evidens kan brukes når den canonicale Historie-banen og kildeproveniensen faktisk er komplett;
- [ ] samme hendelse dupliseres ikke mekanisk mellom leksikon, claim, Story og Historie-evidens bare for å øke antall milestones.

### D. Bygg epokeindeksen og kontroller spillerflaten

Etter chronology-endringer kjøres minst:

```bash
npm run epoker:places:build
npm run epoker:places:check
node --test tests/epoke-place-index.test.mjs tests/epoker-runtime-place-index.test.mjs tests/epoke-viewer.test.mjs
```

- [ ] generert `data/epoker/epoke-place-index.json` er resultat av source-bygging, ikke håndredigering;
- [ ] hvert nytt milestone ligger i riktig canonical epoke;
- [ ] stedets navn/ID/geografi løses riktig i epokeviseren;
- [ ] kilde og konsekvenstekst peker tilbake til riktig hendelse uten å overdrive kilden;
- [ ] land-/byfiltrering og stedskobling fungerer der det er relevant;
- [ ] endringen skaper ikke nye ubegrunnede `awaiting_source_backed_history`-gap.

### E. Ferdigstatus

Kronologivurderingen er **aldri N/A** for et ordinært fullprodusert Place. Den ender i én av tre eksplisitte statuser:

- **PASS** — kvalifiserte kilder er undersøkt, relevante source-backed eksakte ankere er materialisert, genererte flater er i sync og epokeviseren er kontrollert;
- **SOURCE-BOUNDED HOLDBACK** — dokumentert research er utført, men ingen kvalifisert kilde bærer en relevant eksakt datering som dagens epokebygger kan materialisere uten å dikte presisjon;
- **BLOKKERT** — researchen har en relevant, kvalifisert og source-backed eksakt dato som ikke er materialisert, eller epokeindex/runtime/viewer er ute av sync.

Et sted kan ikke merkes fullprodusert med **BLOKKERT** status. **SOURCE-BOUNDED HOLDBACK** skal føre hvilke kilder som er søkt og hvorfor presisjonen ikke kan materialiseres; det er en dokumentert kildegrense, ikke en snarvei eller N/A.

Separate timeline-gap-transer er kun en legacy-mekanisme for steder som ble ferdigstilt før denne regelen. Ny/full stedsproduksjon skal lukke chronology/epoke samtidig og skal ikke bevisst skyve kvalifiserte tidsankere til en senere backlog.

---

## 3. Koordinat, anker, radius og geometry

**LES FØRST:**

- `docs/coordinates/README.md`
- `docs/coordinates/coordinate-source-contract-v1.md`
- `docs/coordinates/coordinate-evidence-files-v1.md`

- [ ] `lat`/`lon` representerer riktig fysisk/historisk objekt;
- [ ] korrekt `locatorType`;
- [ ] korrekt `coordRole`;
- [ ] korrekt `sourceProvider` og stabil source-identitet;
- [ ] `geocodeAccuracy` er riktig;
- [ ] `coordStatus` er ærlig;
- [ ] historisk/flyttet/revet objekt bruker historisk evidens når nødvendig;
- [ ] gate/park/elv/område/linje bruker egnet anker/geometry, ikke tilfeldig adressepunkt;
- [ ] `r` er gameplay-radius, ikke påstått areal;
- [ ] coordinate-evidence finnes når kontrakten krever det;
- [ ] relevant coordinate gate/audit kjøres ved endring;
- [ ] kartet kontrolleres visuelt.

### Stoppgate

Usikker koordinat skal ikke merkes `verified`.

---

## 4. Kategori, Badges, underbadges, emner og fagverk

**Absolutt krav:** Alle canonicale steder skal ha sin egen fungerende fagverkside på `fagverk-sted.html?place=<place_id>`. Kravet gjelder hvert sted, kan ikke settes til N/A og er en egen ferdigport. Den generiske ruten alene er ikke nok dersom siden ikke løser riktig place-ID eller viser blankt, feil eller stedfremmed innhold.

**LES FØRST:**

- `data/categories/category_contract.json`
- `docs/FAGVERK_NAVIGATION.md`

- [ ] `category` er canonical og uttrykker primær fagidentitet;
- [ ] ikke dupliser place i andre kategorier for å uttrykke tverrfaglighet;
- [ ] `underbadge_ids` vurdert og alle ID-er finnes;
- [ ] `emne_ids` vurdert;
- [ ] Badges-handlingen er fast, separat fra samlingene og vises øverst til høyre ved stedsoverskriften;
- [ ] riktig badgegrafikk finnes;
- [ ] Badges åpner `fagverk-sted.html?place=<place_id>`;
- [ ] stedets fagverkside viser riktig sted, kategori og relevante fag-/emnekoblinger;
- [ ] fagverksiden er åpnet og kontrollert på den canonicale adressen for dette stedet;
- [ ] merke- og fagsider blandes ikke sammen.

### Stoppgate

Et sted kan ikke merkes `produksjonsklart` før `fagverk-sted.html?place=<place_id>` åpner en fungerende, stedsspesifikk fagverkside med korrekt identitet og relevante fagkoblinger. `fagverk-sted` er aldri N/A.

---

## 4A. Politikk-sted — obligatorisk faglig tillegg og sluttgate

Denne delen gjelder når stedet foreslås med **Politikk som primær fagidentitet**, eller når `emne_ids` skal inneholde canonicale Politikk-emner. Den erstatter ikke de generelle place-, fagverk-, quiz-, story- eller faktisitetskontraktene; den skjerper dem for Politikk.

**LES FØRST — obligatorisk:**

- `docs/FACTUALITY_CONTRACT.md`;
- `docs/FAGVERK_NAVIGATION.md`;
- `data/fag/politikk/politikk_runtime_manifest.json`;
- `data/places/regler/politikk_place_production_v1.schema.json`;
- `data/quiz/regler/QUIZ_PRODUCTION_CANONICAL.md`;
- `docs/STORIES_DATA_GOVERNANCE.md` når fortellinger produseres.

### A. Politikk må være stedets dokumenterte hovedfunksjon

- [ ] stedet er primært en politisk institusjon, beslutningsarena, forvaltningsarena, retts-/myndighetsarena, offentlig tjeneste, demokratisk møteplass, organisasjonsarena, demonstrasjonssted eller et fysisk sted der styring, representasjon, rett, fordeling, konflikt, normer eller offentlighet faktisk er hovedpoenget;
- [ ] koblingen beskriver hva som politisk skjer eller har skjedd **på dette stedet**, ikke bare en generell samfunnsrelevans;
- [ ] bygg og institusjon, organisasjon og adresse, hendelse og hendelsessted samt historisk og nåværende funksjon er skilt eksplisitt;
- [ ] stedet er ikke gitt Politikk som primæridentitet bare fordi en politiker, offentlig etat eller politisk hendelse kan nevnes perifert.

### B. Bruk bare canonicale Politikk-emner som materialet bærer

- [ ] Politikk-koblinger bruker eksisterende `em_pol_*` fra den canonicale Politikk-modellen;
- [ ] hvert valgt emne har stedsspesifikk evidens og kan forklares uten å importere et annet fags hovedidentitet;
- [ ] Historie-, by-, næringslivs-, medie-, kunst-, musikk- eller andre fag-ID-er brukes ikke som erstatning for et manglende Politikk-emne;
- [ ] de 13 komplette Politikk-kapitlene behandles som et målregister, **ikke som en kvote per sted**;
- [ ] irrelevante emner utelates selv om de finnes i fagmodellen.

### C. Bygg en inspectable politisk evidenskjede

For hver vesentlig politisk læringspåstand skal de relevante leddene kunne følges:

```text
institusjon/aktør
  → formell kompetanse eller faktisk rolle
  → regel, kontrakt, prosedyre eller vedtak
  → ressurs, finansiering eller virkemiddel
  → faktisk gjennomføring
  → dokumentert output, outcome eller langsiktig effekt
```

- [ ] hvert påstått ledd har konkret ekstern kilde og `sourceLocation`;
- [ ] manglende ledd markeres som manglende og fylles ikke med antakelser;
- [ ] norsk forvaltning, flernivåstyring, EØS/EU, konstitusjonelle forhold og offentlig politikk får egen beslutningskjede når de brukes;
- [ ] kontraktstekst eller vedtak alene brukes ikke som bevis for faktisk gjennomføring eller målt resultat;
- [ ] output, outcome og langsiktig effekt holdes adskilt.

### D. Eksterne kilder dominerer og nåtid ferskverifiseres

- [ ] canonicale fagfiler velger emner og metoder, men brukes ikke som faktakilde for stedspåstander;
- [ ] lover, forskrifter, vedtak, budsjetter, stortings- og kommunedokumenter, domstolskilder, SSB, NOU-er, offentlige arkiv og relevant forskning prioriteres etter påstanden;
- [ ] dagens innehavere, organisering, kompetanse, lover, regler, budsjetter og pågående reformer kontrolleres mot ferske kilder;
- [ ] kontrolltidspunkt og temporal status registreres for nåtidsclaims;
- [ ] eldre kilder brukes bare for det tidsrommet de faktisk dokumenterer.

### E. Politikkfaglige skiller er bindende

Påstandsbank, tekst og quiz skal håndheve minst disse skillene når de er relevante:

- [ ] regel er ikke det samme som faktisk etterlevelse;
- [ ] vedtak/output er ikke det samme som outcome eller langsiktig effekt;
- [ ] formell kompetanse er ikke det samme som faktisk innflytelse;
- [ ] konsultasjon er ikke det samme som samtykke;
- [ ] rettighet er ikke det samme som håndheving eller faktisk tilgang;
- [ ] representasjon er ikke automatisk politisk gjennomslag;
- [ ] korrelasjon er ikke dokumentasjon på årsak.

### F. Quizåpningen skal være vanlig, konkret quiz

- [ ] sett 1 og 2 har sju direkte, stedsspesifikke og kildebelagte spørsmål hver;
- [ ] de første 14 spørsmålene drives ikke av synlige teorinavn, metodenavn, «hvilken mekanisme»-språk eller akademisk fagplansjargong;
- [ ] senere teori- og metodespørsmål introduseres bare når normalåpningen, påstandsbanken og evidensen bærer dem;
- [ ] `source_brief`, `required_inputs`, `production_context`, audits og Knowledge-synkronisering følger Quiz-kontrakten;
- [ ] spørsmål tester dokumentert kunnskap om stedet og politikken, ikke bare gjenkjenning av fagterminologi.

### G. Chronology og Stories holdes adskilt

- [ ] en politisk dato eller beslutning legges i chronology når verdien først og fremst er **hva som skjedde når**;
- [ ] en Story opprettes bare når det finnes en sammenhengende narrativ idé, aktører, handling, konflikt eller transformasjon og tydelig fysisk forankring;
- [ ] samme materiale dupliseres ikke mekanisk som chronology, Story, nyhet og quiz;
- [ ] Stories følger `docs/STORIES_DATA_GOVERNANCE.md` fullt ut.

### Politikk-stoppgate

Stedet kan ikke godkjennes som Politikk-sted dersom ett av disse forholdene består:

- Politikk er ikke den dokumenterte hovedfunksjonen;
- primære Politikk-koblinger mangler canonicale `em_pol_*` eller stedsspesifikk evidens;
- beslutningskjeden fylles med antatte ledd;
- nåtidsopplysninger er utdatert eller uten kontrolltidspunkt;
- tekst eller quiz blander regel og praksis, output og outcome eller korrelasjon og årsak;
- de første 14 quizspørsmålene bryter normalåpningen;
- en chronology-post er gjort til Story uten narrativ og fysisk forankring.

Produksjonsrapporten ligger i `data/places/politikk-production/<place_id>.json` og følger `data/places/regler/politikk_place_production_v1.schema.json`. Rapporten skal peke tilbake til den manifest-loadede place-filen, registrere politisk hovedfunksjon, canonicale `em_pol_*`, kilder med `sourceLocation`, inspectable evidenskjeder, nåtidskontroll og status for A–G.

Alle delene A–G får status **PASS** eller **N/A med begrunnelse** i produksjonsrapporten. A–E er obligatoriske PASS for et ferdig Politikk-sted; F og G kan være begrunnet N/A når stedet ikke har henholdsvis quiz eller chronology/Stories. `node scripts/audit-politikk-place-production.mjs --all` validerer alle registrerte rapporter. PR-porten i **Data checks → Places data** kjører changed-mode og krever rapport når et nytt Politikk-sted opprettes eller et eksisterende Politikk-steds fagkobling, brukerrettede tekst, quizgrunnlag, chronology eller Story-kobling revideres. Politikk kan ikke settes til ferdig på stedet før denne porten passerer.

## 4B. Historie-sted — obligatorisk faglig tillegg og sluttgate

Denne delen gjelder når stedet foreslås med **Historie som primær fagidentitet**, eller når `emne_ids` skal inneholde canonicale Historie-emner. Den erstatter ikke de generelle place-, fagverk-, quiz-, story- eller faktisitetskontraktene; den skjerper dem for Historie.

**LES FØRST — obligatorisk:**

- `docs/FACTUALITY_CONTRACT.md`;
- `docs/FAGVERK_NAVIGATION.md`;
- `data/fag/historie/historie_v5_contract.json`;
- `data/fag/historie/case_requirements_historie_canonical_v1.json`;
- `data/fag/historie/claims_historie_canonical_v1.json`;
- `data/fag/historie/sources_historie_canonical_v1.json`;
- `data/fag/historie/place_evidence_historie_v1.json`;
- `data/places/regler/historie_place_production_v1.schema.json`;
- `data/quiz/regler/QUIZ_PRODUCTION_CANONICAL.md` når quiz produseres;
- `docs/STORIES_DATA_GOVERNANCE.md` når fortellinger produseres.

### A. Historie må være stedets dokumenterte hovedidentitet

- [ ] stedet er primært et hendelsessted, institusjonssted, historisk landskap, materiell rest, bosted/arbeidssted, funnsted, rekonstruert sted, flyttet historisk objekt eller senere minnested der det historiske forholdet faktisk er hovedpoenget;
- [ ] koblingen beskriver hva som skjedde, utviklet seg, ble brukt, ble bevart, ble flyttet eller senere ble minnet **på eller gjennom dette stedet**;
- [ ] hendelsessted, institusjonssted, funnsted, nåværende plassering og senere minnested skilles eksplisitt;
- [ ] originalt, ombygd, rekonstruert, flyttet, ødelagt og rent kommemorativt objekt skilles eksplisitt;
- [ ] stedet er ikke gitt Historie som primæridentitet bare fordi det er gammelt, har en generell fortid eller kan knyttes løst til en kjent person eller epoke.

### B. Bruk bare canonicale Historie-emner som stedet realiserer

- [ ] Historie-koblinger bruker eksisterende `em_his_*` fra den canonicale Historie-modellen;
- [ ] hvert valgt emne har stedsspesifikk evidens og minst én konkret case-realisering;
- [ ] By-emner eller eldre `his_*` topic hooks brukes ikke som erstatning for canonicale `em_his_*`;
- [ ] fagfiler velger emner, metoder, begreper og teorihooks, men brukes ikke som faktakilde for stedspåstander;
- [ ] Historie-modellens **23 domener og 230 teoriobjekter er dagens canonicale inventar, ikke en kvote per sted eller en uforanderlig sluttkvote for faget**;
- [ ] irrelevante emner utelates selv om de finnes i fagmodellen;
- [ ] universell fagmodell og geografisk/stedlig evidens holdes adskilt: en teori er ikke realisert ved stedet før lokal claim-, source- og place-evidens finnes.

### C. Bygg et avgrenset tidsforløp med brudd og kontinuitet

For hver case-realisering skal tidsforløpet kunne følges:

```text
begrunnet startpunkt
  → hendelser og prosesser
  → minst ett brudd eller vendepunkt
  → minst én dokumentert kontinuitet
  → begrunnet sluttpunkt og konsekvensgrense
```

- [ ] start, slutt og dateringspresisjon følger kildenes faktiske sikkerhet;
- [ ] dag, år, tiår, århundre, periode, relativ datering og usikker datering blandes ikke;
- [ ] hendelse, lengre prosess og konsekvens holdes adskilt;
- [ ] kronologisk rekkefølge brukes ikke alene som årsaksbevis;
- [ ] et synlig lov-, regime- eller bygningsskifte brukes ikke som bevis for at sosial praksis endret seg samtidig;
- [ ] etterpåklokskap gjør ikke utfallet uunngåelig for samtidens aktører.

### D. Aktører, interesser, makt og konflikt skal være konkrete

- [ ] hver case identifiserer minst to historiske aktører eller grupper med ulike interesser, handlingsrom eller maktposisjoner;
- [ ] aktørrolle og stedstilknytning har konkret kilde;
- [ ] konflikt, forhandling, samarbeid eller ulikt handlingsrom beskrives uten å dikte motiv;
- [ ] samtidens kunnskap og mulige framtider skilles fra det vi vet i ettertid;
- [ ] grupper homogeniseres ikke når kildene bare dokumenterer enkelte medlemmer eller institusjonelle representanter;
- [ ] fravær av en gruppe i bevarte kilder behandles ikke automatisk som fravær fra historien.

### E. Kildekritikk, proveniens og sammenligning er bindende

- [ ] hver case bruker minst to eksterne kilder og minst to relevante kildetyper;
- [ ] arkivreferanse/URL, konkret `sourceLocation`, proveniens, temporal dekning og begrensning registreres for hver kilde;
- [ ] samtidige og retrospektive kilder skilles;
- [ ] kilder sammenlignes for samsvar, motsetninger, utelatelser og bevaringsskjevhet;
- [ ] en kildes taushet brukes ikke som positivt bevis uten særskilt begrunnelse;
- [ ] bevart dokumentmengde brukes ikke som mål på historisk betydning eller hyppighet;
- [ ] minne, intervju og senere fortelling brukes ikke ukritisk som dokumentasjon av samtidige intensjoner;
- [ ] eksisterende History GO-tekst og språkmodell er aldri eneste faktakilde.

### F. Skala, årsak, usikkerhet og dagens spor må kontrolleres

- [ ] minst ett lokalt eller regionalt funn kobles eksplisitt til en relevant større regional, nasjonal, nordisk, europeisk eller global sammenheng;
- [ ] større kontekst brukes til sammenligning, ikke til å anta at det lokale stedet fulgte samme forløp;
- [ ] årsakspåstander skiller utløsende hendelser, langsiktige betingelser, aktørvalg og strukturelle rammer når materialet bærer det;
- [ ] minst én alternativ forklaring eller konkurrerende tolkning vurderes;
- [ ] usikkerhet, kildehull og forklaringens gyldighetsgrense skrives eksplisitt;
- [ ] dagens fysiske status og forholdet til det opprinnelige stedet ferskverifiseres;
- [ ] nåværende minnebruk, museumspresentasjon eller nasjonal fortelling skilles fra den historiske hendelsen og samtidens erfaring;
- [ ] nasjonalt hovedforløp brukes ikke som automatisk fasit for samiske, lokale, regionale, sosiale eller marginaliserte aktørers tidsforløp.

### G. Quizåpningen skal være vanlig, konkret og source-led

- [ ] sett 1 og 2 har sju direkte, stedsspesifikke og kildebelagte spørsmål hver;
- [ ] de første 14 spørsmålene handler primært om lokalhistorie, personer, bygninger, hendelser, tidligere funksjoner, konflikter og synlige spor;
- [ ] synlige teorinavn, metodenavn, topic hooks og akademisk fagplansjargong driver ikke åpningssettene;
- [ ] eksterne historie- og stedskilder dominerer det faktiske spørsmålsinnholdet i alle sett;
- [ ] spørsmålsveien kan følges som `ekstern kilde → claim → historieenhet → spørsmål`;
- [ ] quizen kortes ned når stoffgrunnlaget er for svakt; den fylles ikke med isolerte årstall, opplagte navnespørsmål eller teori forkledd som stedsquiz;
- [ ] adaptiv profil, `source_brief`, alle `required_inputs`, `production_context`, audits og Knowledge-synkronisering følger Quiz-kontrakten.

### H. Chronology og Stories holdes adskilt

- [ ] chronology brukes for **hva som skjedde når**, med ærlig dateringspresisjon og kilde;
- [ ] en Story opprettes bare når det finnes en selvstendig narrativ idé, aktører, handling, konflikt/valg/transformasjon, konsekvens og tydelig fysisk eller biografisk forankring;
- [ ] viktige årstall blir ikke automatisk egne Stories;
- [ ] samme materiale dupliseres ikke mekanisk som chronology, Story, før/etter, nyhet og quiz;
- [ ] Stories følger `docs/STORIES_DATA_GOVERNANCE.md` fullt ut.

### Historie-stoppgate

Stedet kan ikke godkjennes som Historie-sted dersom ett av disse forholdene består:

- Historie er ikke den dokumenterte hovedidentiteten;
- den fysiske stedstilknytningen eller forskjellen mellom originalsted, nåværende objekt og senere minnested er uklar;
- primære Historie-koblinger mangler canonicale `em_his_*` eller konkret case-realisering;
- tidsforløpet mangler begrunnet avgrensning, brudd eller kontinuitet;
- aktører, interesser eller maktposisjoner er generiske eller udokumenterte;
- caset mangler to kilder, to kildetyper, proveniens eller eksplisitte begrensninger;
- kronologisk rekkefølge, kildebevaring eller nasjonalt hovedforløp brukes som automatisk årsaks- eller representativitetsbevis;
- dagens fysiske spor ikke er ferskverifisert;
- de første 14 quizspørsmålene bryter normalåpningen;
- en chronology-post er gjort til Story uten selvstendig narrativ og fysisk forankring.

Produksjonsrapporten ligger i `data/places/historie-production/<place_id>.json` og følger `data/places/regler/historie_place_production_v1.schema.json`. Rapporten skal peke tilbake til den manifest-loadede place-filen og registrere historisk hovedidentitet, stedstilknytningstype, tidsavgrensning, canonicale `em_his_*`, kilder, case-realiseringer, dagens fysiske spor og status for A–H.

Alle delene A–H får status **PASS** eller **N/A med begrunnelse** i produksjonsrapporten. A–F er obligatoriske PASS for et ferdig Historie-sted; G og H kan være begrunnet N/A når stedet ikke har henholdsvis quiz eller chronology/Stories. `node scripts/audit-historie-place-production.mjs --all` validerer alle registrerte rapporter. PR-porten i **Data checks → Places data** kjører changed-mode og krever rapport når et nytt Historie-sted opprettes eller et eksisterende Historie-steds identitet, fagkobling, brukerrettede tekst, quizgrunnlag, chronology eller Story-kobling revideres. Ren koordinatendring forblir eid av coordinate-gaten. Historie kan ikke settes til ferdig på stedet før denne porten passerer.

## 4C. Økonomi og næringsliv-sted — obligatorisk faglig tillegg og sluttgate

Denne delen gjelder når stedet foreslås med **Næringsliv som primær fagidentitet**, eller når `emne_ids` skal inneholde canonicale Næringsliv-emner. Den erstatter ikke de generelle place-, fagverk-, quiz-, story- eller faktisitetskontraktene; den skjerper dem for Økonomi og næringsliv.

**LES FØRST — obligatorisk:**

- `docs/FACTUALITY_CONTRACT.md`;
- `docs/FAGVERK_NAVIGATION.md`;
- `data/fag/naeringsliv/naeringsliv_runtime_manifest.json`;
- `data/fag/naeringsliv/emner_naeringsliv_canonical_v4_5.json`;
- `data/fag/naeringsliv/methods_naeringsliv_canonical_v4_5.json`;
- `data/fag/naeringsliv/universitetsramme_okonomi_og_naeringsliv_v1.json`;
- `data/fag/naeringsliv/quiz_generator_rules_naeringsliv_v5_1_source_priority_patch.json`;
- `data/places/regler/naeringsliv_place_production_v1.schema.json`;
- `data/quiz/regler/QUIZ_PRODUCTION_CANONICAL.md` når quiz produseres;
- `docs/STORIES_DATA_GOVERNANCE.md` når fortellinger produseres.

### A. Økonomisk virksomhet må være stedets dokumenterte hovedidentitet

- [ ] stedet er primært et arbeidssted, virksomhetssted, fabrikk, produksjonssted, butikk, handelsgate, bank, børs, marked, hovedkontor, teknologimiljø, lager, havn, logistikk-/infrastrukturpunkt, fagforening, bransjeinstitusjon eller annen økonomisk institusjon;
- [ ] koblingen beskriver konkret arbeid, virksomhet, produksjon, kapital, eierskap, marked, teknologi, logistikk, infrastruktur, regulering eller verdikjede **på eller gjennom dette stedet**;
- [ ] fysisk bygg, virksomhet, juridisk enhet, merkevare, arbeidsplass, konsern og dagens leietaker/bruk skilles eksplisitt;
- [ ] historisk virksomhet, senere ombruk og dagens drift skilles eksplisitt;
- [ ] stedet er ikke gitt Næringsliv som primæridentitet bare fordi det er et kontorbygg, et historisk bygg, et byutviklingsprosjekt eller har en kommersiell leietaker.

### B. Bruk bare canonicale Næringsliv-emner som stedet realiserer

- [ ] Næringsliv-koblinger bruker eksisterende `em_naering_*` fra den canonicale Næringsliv-modellen;
- [ ] hvert valgt emne har stedsspesifikk evidens og minst én konkret økonomisk case-realisering;
- [ ] `em_by_*`, `em_his_*`, `em_pol_*` eller andre fag-ID-er brukes ikke som erstatning for et manglende Næringsliv-emne;
- [ ] fagfiler velger emner, metoder og teorihooks, men brukes ikke som faktakilde for stedspåstander;
- [ ] modellens 38 emner, 27 metoder og 12 kapitler er dagens canonicale inventar, **ikke en kvote per sted eller en uforanderlig sluttkvote for faget**;
- [ ] irrelevante emner utelates selv om de finnes i fagmodellen.

### C. Bygg en inspectable økonomisk case og verdiskapingskjede

For hver case-realisering skal den dokumenterte økonomiske prosessen kunne følges:

```text
avgrenset analyseenhet
  → arbeid, kapital, teknologi, råvarer, data eller andre innsatsfaktorer
  → produksjon, tjeneste, handel, finansiering eller logistisk aktivitet
  → dokumentert output
  → avgrenset vurdering av verdiskaping
```

- [ ] analyseenhet, geografisk grense, periode og skala er eksplisitte;
- [ ] innsatsfaktorer, aktivitet og output har konkrete kilder;
- [ ] omsetning, produksjon, resultat, kontantstrøm, produktivitet og samfunnsøkonomisk verdiskaping blandes ikke;
- [ ] virksomhetens egen markedsføring brukes ikke alene som bevis for økonomisk betydning eller samfunnsvirkning;
- [ ] ledd som ikke kan dokumenteres, utelates eller markeres som usikre; de fylles ikke med antakelser.

### D. Aktører, arbeid, eierskap, fordeling og makt skal være konkrete

- [ ] hver økonomisk case identifiserer minst to aktører eller grupper med ulike roller, interesser eller økonomiske posisjoner;
- [ ] eierskap, kontroll, ledelse, arbeid, kunder, leverandører, kreditorer, offentlige aktører eller berørte naboer tas med etter hva kildene faktisk bærer;
- [ ] det registreres hvem som mottar lønn, avkastning, rente, leie, skatt eller andre gevinster når det kan dokumenteres;
- [ ] det registreres hvem som bærer arbeidsbelastning, omstillingsrisiko, finansiell risiko, kostnader eller tap når det kan dokumenteres;
- [ ] arbeid, ubetalt arbeid og leverandørbidrag gjøres ikke usynlig bare fordi de faller utenfor virksomhetens regnskap;
- [ ] motiv, makt og fordeling påstås ikke uten kilde.

### E. Metode, måling, enhet og sammenlignbarhet er bindende

- [ ] hver case bruker minst én relevant canonical `met_naering_*`;
- [ ] indikator eller observasjon, måleenhet, periode og datakilde registreres;
- [ ] nominelle og reelle verdier, beholdning og strøm, prosent og prosentpoeng samt absolutte og relative tall holdes adskilt;
- [ ] regnskapsdata, registerdata, statistikk, arkivdata og kvalitative observasjoner tolkes innenfor sin faktiske definisjon og dekning;
- [ ] sammenlignbarhet over tid, sted eller virksomhet begrunnes;
- [ ] utvalg, manglende data, målefeil og endrede definisjoner registreres;
- [ ] beregning eller modell presenteres ikke uten variabel-, enhets- og antakelsestolkning.

### F. Risiko, eksternaliteter, årsak, usikkerhet og dagens drift må kontrolleres

- [ ] risiko vurderes konkret for caset; eksternaliteter dokumenteres eller settes begrunnet `not_applicable`;
- [ ] gevinst for virksomheten brukes ikke automatisk som bevis for samfunnsøkonomisk gevinst;
- [ ] korrelasjon, tidsrekkefølge eller samtidig vekst brukes ikke alene som årsaksbevis;
- [ ] minst én alternativ forklaring og analysens gyldighetsgrense registreres;
- [ ] minst to eksterne kilder og to relevante kildetyper sammenlignes;
- [ ] minst én primær, offisiell, register-, statistikk-, arkiv-, årsrapport- eller teknisk kilde inngår;
- [ ] kildenes proveniens, `sourceLocation`, tidsdekning og begrensninger registreres;
- [ ] alle kildekontroller og dagens driftsstatus er høyst 365 dager gamle;
- [ ] aktiv, tidligere, blandet, flyttet, avsluttet eller revet virksomhet skilles eksplisitt.

### G. Quizåpningen skal være vanlig, konkret og source-led

- [ ] sett 1 og 2 har sju direkte, stedsspesifikke og kildebelagte spørsmål hver;
- [ ] de første 14 spørsmålene starter i konkret virksomhet, arbeid, produksjon, kapital, marked, teknologi, logistikk, infrastruktur eller dokumentert økonomisk praksis;
- [ ] synlige emnenavn, metodenavn, teorinavn og fagplansjargong driver ikke åpningssettene;
- [ ] eksterne virksomhets-, arbeidslivs-, register-, statistikk-, arkiv-, bransje- og forskningskilder dominerer det faktiske spørsmålsinnholdet;
- [ ] spørsmål fremstiller ikke økonomisk aktivitet som nøytral uten arbeid, eierskap, risiko, regulering, ressursbruk, fordeling eller makt når dette er relevant;
- [ ] adaptiv profil, `source_brief`, alle `required_inputs`, `production_context`, audits og Knowledge-synkronisering følger Quiz-kontrakten.

### H. Chronology og Stories holdes adskilt

- [ ] etablering, eierskifte, produksjonsendring, konflikt, krise, omstilling og nedleggelse legges i chronology når verdien først og fremst er **hva som skjedde når**;
- [ ] en Story opprettes bare når det finnes en selvstendig narrativ idé, konkrete aktører, handling, konflikt/valg/transformasjon, konsekvens og tydelig fysisk eller biografisk forankring;
- [ ] virksomhetens milepælsliste eller markedsføringshistorie kopieres ikke automatisk til Stories;
- [ ] samme materiale dupliseres ikke mekanisk som chronology, Story, nyhet og quiz;
- [ ] Stories følger `docs/STORIES_DATA_GOVERNANCE.md` fullt ut.

### Næringsliv-stoppgate

Stedet kan ikke godkjennes som Næringsliv-sted dersom ett av disse forholdene består:

- Næringsliv er ikke den dokumenterte hovedidentiteten;
- bygg, virksomhet, juridisk enhet, merkevare eller dagens bruk er blandet sammen;
- primære Næringsliv-koblinger mangler canonicale `em_naering_*` eller konkret økonomisk case;
- caset mangler avgrenset analyseenhet, innsatsfaktorer, aktivitet, output eller verdiskapingsvurdering;
- arbeid, eierskap, fordeling, kostnader eller risiko er generiske eller udokumenterte;
- måling mangler canonical metode, enhet, periode, sammenlignbarhet eller databegrensning;
- omsetning, resultat eller virksomhetsmarkedsføring brukes som automatisk bevis for verdiskaping eller samfunnseffekt;
- korrelasjon eller tidsrekkefølge brukes som årsaksbevis uten identifikasjon og alternative forklaringer;
- kildene mangler proveniens, kildeplassering, variasjon eller ferskhetskontroll;
- dagens driftsstatus er uklar eller foreldet;
- de første 14 quizspørsmålene bryter normalåpningen;
- en chronology-post er gjort til Story uten selvstendig narrativ og fysisk forankring.

Produksjonsrapporten ligger i `data/places/naeringsliv-production/<place_id>.json` og følger `data/places/regler/naeringsliv_place_production_v1.schema.json`. Rapporten skal peke tilbake til den manifest-loadede place-filen og registrere økonomisk hovedidentitet, ankertype, tidsavgrensning, canonicale `em_naering_*`, kilder, økonomiske case-realiseringer, verdiskapingskjede, aktører, måling/metode, fordeling/makt, risiko/eksternaliteter, inferensgrenser, dagens driftsstatus og status for A–H.

Alle delene A–H får status **PASS** eller **N/A med begrunnelse** i produksjonsrapporten. A–F er obligatoriske PASS for et ferdig Næringsliv-sted; G og H kan være begrunnet N/A når stedet ikke har henholdsvis quiz eller chronology/Stories. `node scripts/audit-naeringsliv-place-production.mjs --all` validerer alle registrerte rapporter. PR-porten i **Data checks → Places data** kjører changed-mode og krever rapport når et nytt Næringsliv-sted opprettes eller et eksisterende Næringsliv-steds identitet, fagkobling, brukerrettede tekst, økonomiske profiler, quizgrunnlag, chronology eller Story-kobling revideres. Ren koordinatendring forblir eid av coordinate-gaten. Næringsliv kan ikke settes til ferdig på stedet før denne porten passerer.

---

## 4D. Subkultur-sted eller Subkultur-lag — obligatorisk faglig tillegg og sluttgate

Denne delen gjelder når stedet har **Subkultur som primærkategori**, `secondaryBadgeIds: ["subkultur"]` eller ett eller flere canonicale `em_sub_*`. Den gjelder derfor både selvstendige Subkultur-steder og dokumenterte Subkultur-lag på ordinære parker, idrettsanlegg eller andre canonicale steder. Den erstatter ikke de generelle place-, fagverk-, quiz-, story-, personvern- eller faktisitetskontraktene; den skjerper dem for Subkultur.

**LES FØRST — obligatorisk:**

- `docs/FACTUALITY_CONTRACT.md`;
- `docs/FAGVERK_NAVIGATION.md`;
- `data/fag/subkultur/SUBKULTUR_CATEGORY_BOUNDARY.md`;
- `data/fag/subkultur/subkulturpensum_canonical_v4_5.json`;
- `data/fag/subkultur/emner_subkultur_canonical_v4_5.json`;
- `data/fag/subkultur/methods_subkultur_canonical_v4_5.json`;
- `data/places/regler/subkultur_place_production_v1.schema.json`;
- `data/quiz/regler/QUIZ_PRODUCTION_CANONICAL.md` når quiz produseres;
- `docs/STORIES_DATA_GOVERNANCE.md` når fortellinger produseres.

### A. Bevis en reell Subkultur-identitet eller et reelt Subkultur-lag

- [ ] stedet har vært et dokumentert samlingspunkt, territorium, uttrykksrom eller støttepunkt for en subkultur, gatekultur, undergrunn eller sosial randsone;
- [ ] identiteten ligger i menneskene, miljøet, den gjentatte bruken og den sosiale funksjonen, ikke bare i fysisk anleggstype, urbant preg eller alternativ markedsføring;
- [ ] forholdet til etablert samfunn og hovedkultur er konkret: på siden av, under, i friksjon med, kontrollert av, forhandlet med eller senere institusjonalisert;
- [ ] fysisk sted, sosialt territorium, organisasjon, scene, arrangement, hjelpetiltak og enkeltpersoner skilles eksplisitt;
- [ ] primærkategori og sekundærbadge følger canonical place-identitet: tverrfaglighet løses ikke med duplikatmarkør;
- [ ] vanlig park, lovlig graffitivegg, kommunal skatepark eller organisert arena avvises ikke dersom et faktisk miljø er dokumentert;
- [ ] pumptrack, fritidsarena, konsertscene, butikk eller trendy byrom får ikke Subkultur-status bare på grunn av aktivitet, publikum eller estetikk.

### B. Bruk bare canonicale Subkultur-emner som stedet realiserer

- [ ] alle Subkultur-koblinger bruker eksisterende `em_sub_*` fra den canonicale fagmodellen;
- [ ] hvert valgt emne har en stedsspesifikk case-realisering og konkrete kilder;
- [ ] emner velges etter dokumentert praksis, fellesskap, uttrykk, rom, konflikt, kontroll eller endring—ikke for å fylle bredde;
- [ ] fagkartet og emnelisten brukes som styring, aldri som faktakilde;
- [ ] rene Musikk-, Sport-, Kunst-, By-, Helse- eller Næringslivsforhold brukes ikke som erstatning for manglende Subkultur-evidens;
- [ ] place-filens `em_sub_*` og produksjonsrapportens emner samsvarer nøyaktig.

### C. Miljø, praksis, deltakelse og egenorganisering skal være konkrete

- [ ] hver case identifiserer minst to relevante aktører eller grupper, herunder miljøets deltakere og aktører med formell, økonomisk eller regulerende makt når relevant;
- [ ] stedlige praksiser beskrives konkret: opphold, arrangering, skating, graffiti, DIY, omsorg, matutdeling, handel, publisering, ritualer, språk, stil eller andre dokumenterte handlinger;
- [ ] tilhørighet og deltakelse skilles fra tilfeldig publikum, enkeltbesøk og generell popularitet;
- [ ] selvorganisering, dugnad, portvoktere, adgang, arbeidsdeling og uformelle regler dokumenteres uten å anta at alle i miljøet er like;
- [ ] uttrykk, koder, objekter og stil beskrives som sosial praksis, ikke som overflatisk liste over klær, sjangre eller symboler; manglende dokumentasjon markeres eksplisitt fremfor å fylles med antakelser;
- [ ] interne forskjeller, terskler, trygghet og eksklusjon synliggjøres når kildene bærer det.

### D. Rom, territorium, makt, kontroll og fortrengning må analyseres

- [ ] det forklares hvordan gjentatt bruk gjorde det fysiske stedet til et sosialt territorium eller støttepunkt;
- [ ] eierskap, regulering, politi, vakthold, planlegging, åpningstider, økonomi eller andre kontrollformer identifiseres konkret;
- [ ] konflikt og forhandling om adgang, synlighet, bruk og videre eksistens dokumenteres når det finnes; fravær eller manglende dokumentasjon markeres eksplisitt;
- [ ] kriminalisering og sosial kontroll beskrives presist uten å gjøre myndighetskilder til nøytral fasit;
- [ ] gentrifisering, kommersialisering, flytting, nedleggelse, legalisering eller institusjonalisering dokumenteres som prosess, ikke som automatisk årsaksforklaring;
- [ ] dagens sted og historiske territorier tidsavgrenses når miljøet har flyttet eller endret karakter.

### E. Stemmebalanse, representasjon, personvern og redaksjonell etikk er bindende

- [ ] kildegrunnlaget har minst én deltaker-, miljø- eller støttetjenestestemme og minst én uavhengig myndighets-, forsknings- eller sekundærkilde;
- [ ] miljøets selvforståelse og eksterne betegnelser holdes adskilt;
- [ ] kildenes posisjon, proveniens, `sourceLocation`, tidsdekning og begrensninger registreres;
- [ ] mennesker beskrives som mennesker, ikke som problemer, kulisse, kriminalitet eller avvik;
- [ ] rus, hjemløshet, vold, fattigdom eller annen sårbarhet verken romantiseres eller sensationaliseres;
- [ ] nåværende sårbare enkeltpersoner identifiseres ikke unødvendig;
- [ ] én synlig talsperson, arrangør, avis eller politirapport behandles ikke automatisk som representativ for et helt miljø;
- [ ] redaksjonelle formuleringer skiller dokumentert praksis, aktørpåstand og analytisk tolkning.

### F. Canonical metode, endring over tid og inferensgrenser skal være eksplisitte

- [ ] hver case bruker minst én relevant canonical `met_sub_*`;
- [ ] observasjon/evidens og analysemetode registreres før konklusjonen;
- [ ] analysen har minst én alternativ forklaring, eksplisitt usikkerhet og refleksjon over forsker-/redaktørblikket;
- [ ] samtidighet, medieoppmerksomhet eller tidsrekkefølge brukes ikke alene som årsaksbevis;
- [ ] startpunkt, vendepunkt/endring, nåværende eller avsluttende punkt og minst én kontinuitet dokumenteres;
- [ ] aktiv, historisk, blandet, flyttet, stengt eller revet funksjon skilles;
- [ ] aktiv, blandet eller flyttet nåtidsfunksjon har minst én relevant `current`/`mixed`-kilde kontrollert siste 365 dager;
- [ ] tap av sted behandles ikke automatisk som tap av miljø, og formalisering behandles ikke automatisk som full assimilasjon.

### G. Quizåpningen skal starte i sted, mennesker og praksis

- [ ] sett 1 og 2 har sju direkte, stedsspesifikke og kildebelagte spørsmål hver;
- [ ] de første 14 spørsmålene starter i konkrete miljøer, praksiser, hendelser, objekter, koder, rom, konflikter eller kontrollformer;
- [ ] synlige emnenavn, metodenavn, teorinavn og fagplansjargong driver ikke åpningssettene;
- [ ] spørsmål gjengir ikke stigma, politibegreper eller medieetiketter som nøytral beskrivelse;
- [ ] eksterne kilder dominerer, mens fagfilene styrer utvalg og analyse;
- [ ] adaptiv profil, `source_brief`, alle `required_inputs`, `production_context`, audits og Knowledge-synkronisering følger Quiz-kontrakten.

### H. Chronology og Stories holdes adskilt

- [ ] etablering, okkupasjon, åpning, konflikt, kontrolltiltak, flytting, legalisering, institusjonalisering og nedleggelse legges i chronology når verdien først og fremst er **hva som skjedde når**;
- [ ] en Story opprettes bare når det finnes en selvstendig narrativ idé, konkrete aktører, handling, konflikt/valg/transformasjon, konsekvens og tydelig fysisk eller biografisk forankring;
- [ ] scenehistorikk, arrangementsliste, medieoppslag eller hjelpeinstitusjonens milepæler kopieres ikke automatisk til Stories;
- [ ] samme materiale dupliseres ikke mekanisk som chronology, Story, nyhet og quiz;
- [ ] omtale av sårbare miljøer følger samme personvern- og etikkkrav i Stories som i place-teksten;
- [ ] Stories følger `docs/STORIES_DATA_GOVERNANCE.md` fullt ut.

### Subkultur-stoppgate

Stedet eller Subkultur-laget kan ikke godkjennes dersom ett av disse forholdene består:

- koblingen bygger bare på urbant preg, ungdom, kreativitet, aktivitet, sjanger eller alternativ markedsføring;
- det finnes ikke et dokumentert miljø, en gjentatt praksis, et sosialt territorium eller en støttefunksjon;
- fysisk sted, miljø, organisasjon, arrangement eller hjelpetiltak er blandet sammen;
- `em_sub_*` mangler eller er lagt på uten stedsspesifikk case-evidens;
- aktører, deltakelse, egenorganisering, uttrykk eller interne grenser er generiske;
- eierskap, kontroll, konflikt, regulering, fortrengning eller institusjonalisering er utelatt der det er relevant;
- kildene mangler miljønær stemme eller uavhengig kontroll;
- mennesker reduseres til rus, kriminalitet, avvik eller dekorativ undergrunn;
- nåværende sårbare personer kan identifiseres unødvendig;
- canonical metode, endring over tid, alternative forklaringer eller usikkerhet mangler;
- dagens funksjon er uklar eller foreldet;
- de første 14 quizspørsmålene bryter normalåpningen;
- en chronology-post er gjort til Story uten selvstendig narrativ og fysisk forankring.

Produksjonsrapporten ligger i `data/places/subkultur-production/<place_id>.json` og følger `data/places/regler/subkultur_place_production_v1.schema.json`. Rapporten peker tilbake til den manifest-loadede place-filen og registrerer Subkultur-identitet eller sekundærlag, ankertype, forholdet til storsamfunnet, tidsavgrensning, canonicale `em_sub_*`, balanserte kilder, stedlige case, aktører, praksis/fellesskap, rom/makt, representasjon/etikk, canonical metode, inferensgrenser, endring over tid, dagens funksjon og status for A–H.

Alle delene A–H får status **PASS** eller **N/A med begrunnelse**. A–F er obligatoriske PASS; G og H kan være begrunnet N/A når stedet ikke har henholdsvis quiz eller chronology/Stories. `node scripts/audit-subkultur-place-production.mjs --all` validerer alle registrerte rapporter. PR-porten i **Data checks → Places data** kjører changed-mode og krever rapport når et nytt Subkultur-sted eller -lag opprettes, eller når identitet, kategori/sekundærbadge, `em_sub_*`, brukerrettet tekst, Subkultur-/sosial profil, quizgrunnlag, chronology eller Story-kobling revideres. Ren koordinatendring forblir eid av coordinate-gaten. Subkultur kan ikke settes til ferdig på stedet før denne porten passerer.

---

## 5. `desc` og `popupDesc`

**LES FØRST — obligatorisk:** `data/places/regler/PLACE_DESCRIPTION_CANONICAL.md`

Dette punktet kan **ikke** godkjennes bare fordi teksten ser god ut.

For nytt eller revidert sted:

- [ ] produksjonspakke finnes under `data/places/production/<place_id>.json` når standarden krever det;
- [ ] identitetsport er `resolved`;
- [ ] stabile claims er opprettet;
- [ ] hver claim har inspectable kilde og `sourceLocation`;
- [ ] sterke påstander følger den strengere evidensregelen;
- [ ] nåtidsclaims har korrekt temporal status/fersk kontroll;
- [ ] `desc` er en leksikalsk ingress, ikke inventarliste;
- [ ] `popupDesc` er en stoffstyrt, selvstendig stedartikkel;
- [ ] `popupDesc` har vesentlig mer innhold enn `desc`;
- [ ] setning→claim-kobling er komplett;
- [ ] teksthash samsvarer med godkjent tekst;
- [ ] faktareview er utført;
- [ ] redaksjonell review er utført;
- [ ] production status er den ferdigstatusen Place Description-kontrakten tillater;
- [ ] place-description validator/governance passerer.

### Viktig

Ikke bruk en lokal «kortere» popupDesc-regel fra denne sjekklisten. **Place Description-kontrakten eier produksjonsformen.**

---

## 6. Strukturerte place-profiler

**LES FØRST:** `docs/PLACE_STANDARD.md`

Vurder etter stedstype, uten filler:

- [ ] `spatial_profile`;
- [ ] `temporal_profile`;
- [ ] `subplaces`;
- [ ] `history_layers`;
- [ ] `nature_profile`;
- [ ] `source_summary`;
- [ ] øvrige type-spesifikke strukturer som aktiv standard/schema støtter.

Kontroller spesielt der relevant:

- park/grøntområde: areal, landskap, topografi, natur, delsteder;
- gate/vei: avgrensning, segment, kryss, navnehistorie;
- bygning: arkitekt, år, stil, materialer, bruk, vern;
- torg/byrom: avgrensning, fasader, monumenter, ombygging;
- vann/kyst: løp/vannflate, regulering, natur, industri;
- institusjon/anlegg: funksjon, saler, bygninger, samlinger, milepæler;
- kulturminne/kunstverk: opphav, år, materiale, motiv, vern;
- arkeologisk lokalitet: datering, synlige strukturer, funn, undersøkelser;
- idrettsanlegg: åpning, kapasitet, konstruksjon, historiske brukere/hendelser;
- industri/teknologi: funksjon, drift, maskiner, energi, råvarer, transport, gjenbruk.

`nature_profile` i Om betyr ikke automatisk en PlaceCard-samling.

---

### Kronologi og epoke — slutt-QA

- [ ] chronology/epoke er eksplisitt vurdert og står ikke uavklart;
- [ ] relevante source-backed eksakte tidsankere fra stedsresearchen er materialisert gjennom canonical evidensbane;
- [ ] omtrentlig eller usikker datering er ikke gjort om til oppdiktet enkeltår;
- [ ] epokeindex/runtime/viewer er regenerert og kontrollert når chronology er endret;
- [ ] status er PASS, eller SOURCE-BOUNDED HOLDBACK med dokumentert kildesøk og presis begrunnelse;
- [ ] BLOKKERT chronology/epoke-status forekommer ikke ved sluttgodkjenning.

# DEL C — STEDSPOPUPEN

## 7. Alle relevante faner vurderes

**LES FØRST — obligatorisk:** `docs/PLACE_POPUP_SYSTEM.md`

Popupen aggregerer canonical data; den skal ikke skape en ny parallell sannhet.

### Om
- [ ] `popupDesc` fungerer som hovedartikkel;
- [ ] nøkkelfakta og relevante place-profiler vurdert;
- [ ] Leksikon tilfører uten unødig duplisering;
- [ ] «Se etter» er observasjon, ikke skjult oppgave.

### Historie
- [ ] chronology vurdert;
- [ ] `history_layers` vurdert;
- [ ] daterte bruksendringer/hendelser vurdert;
- [ ] sportsrekorder/mesterskap ligger her når verdien er historisk kunnskap.

### Fortellinger
**LES FØRST:** `docs/STORIES_DATA_GOVERNANCE.md`

- [ ] eksisterende canonical Stories søkt opp;
- [ ] chronology er ikke automatisk Story;
- [ ] ny/vesentlig omskrevet Story følger aktiv storyprofil og manifest;
- [ ] narrativ verdi, aktører, handling, tid/sted og kilder er reelle;
- [ ] `npm run check:stories` / relevant gate passerer.

### Før/etter
- [ ] `for_na` vurdert;
- [ ] arkivsøk er utført etter skikkelig gamle bilder, ikke bare bilder fra hver side av en nyere ombygging;
- [ ] et historisk sted med tilgjengelig arkivmateriale viser minst én reell gammel–nå-sammenligning som gjør lang tidsendring synlig;
- [ ] primærparet viser samme gateutsnitt, bygg, plassrom eller annen tydelig gjenkjennelig del av stedet fra sammenlignbar retning og målestokk;
- [ ] canonical place-register/manifester er søkt før motivet velges, slik at bygg, virksomheter, parker, plasser eller andre delsteder med egen place-oppføring blir oppdaget;
- [ ] et delsted som har egen canonical place-oppføring brukes ikke som primært Før/etter-stedfortreder for et overordnet sted; det kan bare brukes som tydelig merket supplement eller lenket relasjon når det er relevant;
- [ ] bilder fra ulike kamerastandpunkter kan brukes som supplerende historiske bilder, men består ikke alene som fullverdig primær Før/etter-sammenligning;
- [ ] eldre historiske lag og en eventuell nyere ombyggingssammenligning kan vises som flere tydelig daterte par; 2009 → 2017 erstatter ikke automatisk et eldre historisk førbilde;
- [ ] dagens bilde er faktisk aktuelt, eller er tydelig datert som et eldre «etter»-bilde uten å utgi seg for nåtid;
- [ ] `before`, `now`, `change` er konkrete, kildebelagte og begrenset til det bildene faktisk lar spilleren sammenligne;
- [ ] fotograf, dato, lisens, kilde og kamerastandpunkt/utsnitt er dokumentert for hvert bilde.

**Stoppgate:** Før/etter er ikke ferdig når hovedparet viser forskjellige, vanskelig sammenlignbare utsnitt, når et innholdsrikt historisk sted mangler gjennomført arkivsøk, når «før» og «etter» bare dekker en kort nyere periode selv om eldre egnet materiale finnes, eller når et underbygg/delsted med egen place-oppføring brukes som erstatning for stedet som faktisk produseres.

### Nyheter
- [ ] repo, offisielle aktører, lokale medier og andre relevante ferske kilder er faktisk søkt;
- [ ] historiske og nyere notiser vurdert;
- [ ] aktive bysteder, institusjoner og kultursteder har daterte, stedsspesifikke og ferskt kontrollerte notiser når slikt materiale finnes;
- [ ] tomt eksisterende datasett er aldri alene grunnlag for N/A;
- [ ] proporsjonalitet beholdes;
- [ ] nåtidsnotiser er ferskt kontrollert og har tydelig publiserings-/hendelsesdato;
- [ ] notis gjøres ikke til Story uten narrativ grunn.

**Stoppgate:** Nyheter kan ikke godkjennes som tom/N/A for et aktivt, innholdsrikt sted før et dokumentert fersksøk viser at ingen relevante, trygge og stedsspesifikke notiser kan publiseres.

### Lesespor
- [ ] eksisterende Lesespor søkt;
- [ ] repo, åpne tidsskrifter, biblioteker, arkiv, institusjoner, forlag/forfattere og andre relevante leseeiere er konkret undersøkt;
- [ ] `place_ids` peker eksplisitt til stedet;
- [ ] stedsspesifikk åpen flate viser egnet, direkte lesbart og faktisk Torggata-relevant materiale;
- [ ] betalingslåste lenker registreres som holdback, men brukes ikke som begrunnelse for å avslutte søket etter åpne alternativer;
- [ ] tomt eksisterende datasett er aldri alene grunnlag for N/A;
- [ ] Lesespor tilfører fordypning og er ikke bare en ny kopi av Kilder-fanen.

**Stoppgate:** Lesespor kan ikke godkjennes som tom/N/A for et innholdsrikt sted før et dokumentert søk viser at ingen relevant, rettighetsmessig trygg og direkte lesbar tekst kan vises. At de første treffene er betalingslåst er ikke tilstrekkelig N/A-grunn.

### Kilder
- [ ] `source_summary.safe_sources` / aktiv kildeflate vurdert;
- [ ] place- og Leksikon-`externalLinks` vurdert;
- [ ] Før/etter-kilder vurdert;
- [ ] brukerrettede lenker er relevante, HTTPS og dedupliserte;
- [ ] interne audits/researchnotater lekker ikke ut.

### Place-scope — semantisk områdeeierskap

- [ ] `placeScope: "area"` settes bare når Place faktisk representerer et geografisk, urbant eller lokalt område som brukeren kan forstå som et område — for eksempel strøk, bydel, by/bygd, tettsted eller ladested;
- [ ] `coordRole` og `coordType` beskriver koordinatgeometri og kan **ikke** alene gjøre et Place til område-Place; parker, torg, stadioner, gravlunder, museer, festninger og andre fysiske flater blir ikke område-Places bare fordi koordinaten bruker `area_anchor`;
- [ ] nye område-Places får `placeScope` eksplisitt i canonical Place-data; runtime skal ikke gjette områdeeierskap fra navn, kategori eller koordinatrolle;
- [ ] ved lav kartzoom er `placeScope: "area"` den eneste Place-klassen som beholder vanlig place-prikk, label og klikkeflate; detalj-Places kommer tilbake ved innzooming;
- [ ] et område-Place kan eie områdebundet språk og relasjoner, mens underliggende enkeltsteder peker til områdeeieren i stedet for å kopiere samme innhold.

**Stoppgate:** `area_anchor` er ikke synonymt med område-Place. Semantisk scope og koordinatankertype skal holdes som to separate kontrakter.

### Språk — direkte fane når relevant
**LES FØRST — obligatorisk ved Språkleksikon-produksjon:** `docs/SPRAKLEKSIKON.md`

- [ ] eksisterende Språkleksikon-record og språkmanifest er søkt;
- [ ] Språkleksikonet og dialektlaget er vurdert som **to forskjellige nivåer**: Språkleksikon kan finnes på alle Place-typer, dialektinnhold kan kun eies av et område-Place;
- [ ] place-objektet er klassifisert som **område-Place**, **direkte språksted** eller **enkeltsted** ut fra canonical identitet — ikke bare navn;
- [ ] `placeScope: "area"` er den eneste canonical tillatelsen til å eie dialektlaget; `coordRole`/`coordType` er bare koordinatgeometri og gir aldri dialekt-eierskap;
- [ ] `DIALEKTLAG` i arbeidskortet er satt til aktivt bare når `placeScope: "area"`; alle andre Places får N/A;
- [ ] for **område-Place** er navnehistorie, ordbruk, dialektord, lokale uttrykk, talemålsmateriale og andre relevante språklag undersøkt i eksterne kilder;
- [ ] for **område-Place** produseres minst ett reelt, kildebelagt **dialektord eller lokalt uttrykk** som `word` eller `expression` med `layer: "dialect"` når kildene bærer det;
- [ ] nyproduksjon som er dialekt merkes eksplisitt med `layer: "dialect"`; `dialect_feature` og `dialect_area` regnes alltid som dialektinnhold og krever derfor `placeScope: "area"`;
- [ ] `word`/`expression` på et **enkeltsted** kan brukes for dokumentert stedsspesifikt Språkleksikon, men er ikke dialekt og skal ikke merkes `layer: "dialect"` eller få `dialect_area`;
- [ ] gater, markeder, havner, arbeidsmiljøer og lignende kan være **direkte språksted** for stedsspesifikt språk, men «direkte språksted» gir aldri rett til å eie dialektlaget;
- [ ] et generelt områdeord eies av nærmeste relevante område-Place og dupliseres ikke inn i underliggende bygg, institusjoner, gater eller andre enkeltsteder; relevante enkeltsteder bruker `related_places` / `related_entries`;
- [ ] betydning, eksempel, geografisk utbredelse og historisk/moderne status avgrenses etter kildene;
- [ ] dialektord eller lokale talemålsformer skal ikke diktes, normaliseres fram eller konstrueres av språkmodell;
- [ ] dersom eksplisitt søk på et område-Place ikke finner et forsvarlig dialektord/lokalt uttrykk, dokumenteres søkte kilder og begrunnet holdback/N/A for denne deljobben i stedet for filler;
- [ ] enkeltsted med Språkleksikon er eksplisitt kontrollert for at innholdet ikke feilklassifiseres som dialekt;
- [ ] språkoppføringer er reelt sted- eller områdebundet og dupliserer ikke bare Om/Historie;
- [ ] brukerrettede kilder er inspectable HTTPS-lenker;
- [ ] tomt eksisterende språksett er aldri alene grunnlag for N/A.

**Stoppgate:** Dialektinnhold kan kun eies av et område-Place med `placeScope: "area"`. `layer: "dialect"`, `dialect_feature` eller `dialect_area` på et enkelt-Place er blocker. Et enkeltsted kan fortsatt ha et godt Språkleksikon med stedsspesifikt språk, men ikke et dialektlag. Manglende dokumenterbart dialektord etter reelt søk på et område-Place er lov; oppdiktet, duplisert eller feil-eid dialektinnhold er ikke lov.

### Datastyrte direkte tilleggsfaner

Det finnes ikke lenger en brukerrettet **Mer**-fane. Når source-data finnes, materialiseres de som egne faner i den samme horisontalt scrollbar fanestripen:

- [ ] **Spor & objekter** vurdert for kildebelagte popup-`artifacts`/legacy-objekter som ikke eies av en annen flate;
- [ ] **Legg merke til** vurdert fra `interpretation.what_to_notice`;
- [ ] **Betydning** vurdert fra `interpretation.why_it_matters`;
- [ ] **Motpunkter** vurdert fra `interpretation.counterpoints` og inferensgrenser;
- [ ] **Relasjoner** vurdert når curated relations faktisk forklarer stedet;
- [ ] **Kunnskap** vurdert etter Knowledge-/unlock-eierskapet;
- [ ] **Observasjoner** vurdert når observasjonsdata finnes;
- [ ] hvert tilleggslag får en navngitt direktefane bare når det faktisk har innhold;
- [ ] ukjent legacy-innhold får en konkret, reviewbar faneetikett fra sin egen overskrift og parkeres ikke i en ny restkategori;
- [ ] ingen av disse fanene brukes som søppelskuff for handlinger eller for fysiske elementer som egentlig eies av PlaceCard-samlinger eller andre places.

**Stoppgate:** Innhold som tidligere lå i Mer kan ikke skjules bak en restfane. Det skal enten ligge hos riktig eksisterende eier, vises som en konkret direktefane, eller utelates med dokumentert grunn.

Hver fast og hver faktisk materialisert datastyrt fane får egen status: **ikke startet**, **pågår**, **klar for review**, **ferdig** eller **N/A med fanespesifikk begrunnelse, dokumentert søk og evidenspeker**.

Status kan ikke arves mellom faner. Særlig gjelder:

- chronology kan ikke settes N/A fordi materialet mangler narrativ Story-kvalitet;
- Story kan ikke settes N/A bare fordi chronology finnes;
- en samlet formulering som «chronology/Stories vurdert» er ikke tilstrekkelig;
- Kilder er ikke ferdig fordi URL-er finnes i en intern produksjonsrapport eller quizfil; brukerflaten må ha sin canonical kildeflate;
- korte `knowledge`-tekster inne i quiz er ikke det samme som synkroniserte Knowledge-enheter.

---

# DEL D — PLACECARD-SAMLINGER

## 8. Kontroller PlaceCard-samlingene

**LES FØRST — obligatorisk:** `data/places/README_place_rounds.md`

Denne oppskriften gjentar ikke samlingspool, profiler eller naturkartkrav. **PlaceCard-kontrakten eier hele samlingsmodellen.**

- [ ] stedet følger canonical PlaceCard-samlingskontrakt;
- [ ] Badges vises fast og separat ved stedsoverskriften og teller ikke blant samlingene;
- [ ] obligatorisk Quiz vises som tydelig PlaceCard-handling og fungerer;
- [ ] 1–4 valgte samlingsflater vises adaptivt ved `frontImage`; People, Flora og Fauna bruker sirkel, øvrige samlinger avrundede rektangler;
- [ ] `frontImage` er en stående fil/variant (`height > width`) med kontrollert motiv, crop, dimensjoner og proveniens; en liggende fil i stående CSS-ramme teller ikke;
- [ ] alle valgte samlingsflater viser et bilde av ett faktisk medlem i sin egen samling; ikon, navn og antall teller ikke som ferdig preview;
- [ ] People, Flora og Fauna er sirkler; øvrige samlinger er avrundede rektangler;
- [ ] Bilder ligger i `frontImage`-/medieflaten eller hos riktig bildeeier og brukes aldri som samling/reserve;
- [ ] hver samling har en naturlig brukerforståelse, tydelig egen innholdstype og reell stedsspesifikk substans;
- [ ] Objects følger `docs/PLACE_OBJECTS_CANONICAL.md`; hovedfunksjonen styrer utvalget, og en enkelt vilkårlig eller taksonomisk konstruert gjenstand er ikke nok til å gjøre Objects ferdig;
- [ ] Objects og Structures/Bygg brukes ikke som to separate samlinger når skillet er uklart eller innholdet overlapper;
- [ ] semantisk overlappende innhold dupliseres ikke mellom valgte flater; en svak eller tom kandidat utelates fra profilen og registreres som produksjonsgap uten oppdiktet innhold eller synlig falsk 0;
- [ ] nye/fullproduserte steder bruker `place_card_profile.collection_ids` med 1–4 sterke IDs valgt adaptivt, begrunnelse og verifiseringsdato;
- [ ] eksisterende `round_profile.content_round_ids` leses bare gjennom kompatibilitetslaget, og `images` filtreres bort;
- [ ] alle valgte samlinger vurderes samlet i faktisk UI; korrekt JSON hver for seg er ikke tilstrekkelig;
- [ ] hver samling åpnes i produksjon og viser reelt innhold; tom popup eller falsk 0 er ikke godkjent;
- [ ] People kontrollerer place-eierskap per profil: en personkobling som egentlig gjelder et delsted med egen canonical place, holdes tilbake eller flyttes til delstedet og kan ikke brukes som proxy for parent-place;
- [ ] mutable People-manifest, profilfiler for åpent sted og canonical relasjonsregistre revalideres etter produksjonsendringer; aggregerte profilfiler uten place-id i filstien registreres i manifestets `priorityFilesByPlace`; en stale cache som mangler nye place→person-koblinger, gir tom popup eller falsk 0 er et blockerfunn;
- [ ] alle valgte samlinger har et forståelig tilgjengelig navn i faktisk UI;
- [ ] runtime og data bruker ikke legacy 6-/9-/12-rundersmodell i mediefeltet;
- [ ] preview representerer samlingen ærlig og brukes ikke som innholdsfilter;
- [ ] et preview med manglende/ødelagt bildefil faller tilbake til samlingens ikon og antall uten ødelagt bildeikon;
- [ ] gammel place-spesifikk `rounds`-kuratering brukes ikke som ny standard.

**Stoppgate:** Stedet er ikke PlaceCard-klart dersom en valgt samling er tynn, kunstig, misvisende eller i vesentlig semantisk overlapp med en annen. Runtime, schema og tester må støtte modellen før stedet kan ferdigmeldes.

---

# DEL E — PÅ STEDET OG SPILLHANDLINGER

## 9. På stedet

**LES FØRST:** `docs/PLACE_POPUP_SYSTEM.md`

### Events
- [ ] canonical event skjer faktisk ved stedet;
- [ ] historiske hendelser er ikke blandet inn som dagens event.

### Møter
Når Social Meet/Spotmeeting brukes:

**LES FØRST:**
- `docs/HG_SPOTMEETING.md`
- `docs/HG_SOCIAL_MEET_IDENTITY_CONTRACT.md`

- [ ] stedet er egnet offentlig møtekontekst;
- [ ] privacy-/sikkerhetsgrenser respekteres;
- [ ] ingen live-posisjon, nearby people eller offentlig besøkshistorikk lekker fra place-data.

### Gjør på stedet
- [ ] `tasks_profile` vurdert;
- [ ] `training_profile` vurdert;
- [ ] `play_profile` vurdert;
- [ ] handlingen er reelt mulig på stedet;
- [ ] sikkerhet og fysisk gjennomførbarhet vurdert;
- [ ] gammel Wonderkammer-aktivitet flyttes hit bare når den faktisk er en handling.

---

## 10. Quiz

**LES FØRST — obligatorisk før en quiz lages eller revideres:**  
`data/quiz/regler/QUIZ_PRODUCTION_CANONICAL.md`

Denne sjekklisten skal **ikke** brukes som quizoppskrift.

Ved relevant stedquiz:

- [ ] `categoryId` og `targetId` er fastslått;
- [ ] alle aktive, arkiverte og alternative quizfiler/manifestoppføringer for `targetId` er søkt før noe overskrives;
- [ ] eksisterende sett, spørsmål, påstander og Knowledge er dokumentert med behold / omskriv / flytt / slå sammen / fjern;
- [ ] `data/fag/fag_manifest.json` brukes som filresolver;
- [ ] alle `required_inputs` for kategorien er faktisk lest;
- [ ] målstedets `source_brief` er brukt/oppdatert etter quizkontrakten;
- [ ] eksterne kilder er lest og reviewstatus dokumentert;
- [ ] påstandsbank bygges før spørsmål skrives;
- [ ] faglig utvalg/metoder/emner/teorihooks vurderes etter kontrakten;
- [ ] adaptiv quizprofil velges ut fra dokumentert stoffmengde og bredde, aldri fra et forhåndslåst `profile_hint` eller ønsket kort leveranse;
- [ ] eksakt settantall er valgt og begrunnet: `narrow` = 3, `normal` = 4, `rich` = 5–8, `major` = 8–10; alle sett har 7 spørsmål;
- [ ] `rich`/`major` har én kildebåret, ikke-duplisert læringsjobb per sett;
- [ ] et dokumentert `major`-sted bruker 10 sett når materialet bærer ti selvstendige settplaner; 8 eller 9 krever navngitte holdback-spor og konkret grunn;
- [ ] normalåpning og settplan følger canonical quizregler;
- [ ] spørsmål er source-led, ikke konstruert fra ønsket emneetikett;
- [ ] `production_context` lagres når kontrakten krever det;
- [ ] quiz-schema/package/integrity audits passerer;
- [ ] Knowledge-koblinger genereres/synkroniseres etter quizkontrakten;
- [ ] quiz må ikke registrere fysisk besøk.

Status: **ferdig** eller **N/A**.

---

## 11. Observer, Notat og Rute

### Observer
- [ ] faktisk observerbart fenomen;
- [ ] korrekt lens/observation-data;
- [ ] dupliserer ikke bare en Detail som tekst;
- [ ] learning-log-eierskap beholdes.

### Notat
- [ ] notatflow fungerer fra stedet der produktet støtter dette.

### Rute
Når historisk rute berøres: **LES FØRST:** `docs/README_HistoryGo_Historiske_Ruter.md`

- [ ] eksisterende route-kobling/stopp kontrollert;
- [ ] riktig route-ID;
- [ ] online/fysisk progresjon blandes ikke;
- [ ] rute opprettes ikke bare for completeness.

---

# DEL F — PEOPLE, BRANDS OG RELASJONER

## 12. People–sted-koblinger

**LES FØRST — obligatorisk:** `docs/people-of-places-method.md`

Selv om People ikke velges som PlaceCard-samling, skal relevante personer vurderes.

Researchrekkefølge:

1. grunnlegger/etablerer/initiativtaker;
2. arkitekt/kunstner/skaper;
3. eier/leder/nøkkelperson;
4. beboer/arbeidende;
5. utøver/forsker/politiker/aktivist med særskilt dokumentert forbindelse;
6. eponym/minneperson.

- [ ] direkte inspectable stedskilde for hver kobling;
- [ ] tilfeldig besøk/by-/bransjetilknytning avvises;
- [ ] eksisterende canonical person søkes og gjenbrukes;
- [ ] primæranker flyttes ikke uten faglig grunn;
- [ ] duplikat-ID opprettes ikke.
- [ ] personer som uttrykker stedets dokumenterte hovedfunksjon dominerer utvalget; sekundære kunst-, arkitektur- eller besøkskoblinger overtar ikke galleriet;
- [ ] hver synlig person har en egen, presis rolle ved stedet;
- [ ] `desc` er en kort, særpreget People-teaser, mens `popupDesc` er den lengre profilteksten;
- [ ] navnet er ikke det eneste som skiller ellers malidentiske `desc`/`popupDesc`;
- [ ] gjentatte setningsåpninger og boilerplate er eksplisitt kontrollert;
- [ ] hver person som vises i den ferdige People-samlingen har identitetskontrollert bilde eller tydelig merket redaksjonell illustrasjon;
- [ ] manglende tillatt foto kan løses med redaksjonell illustrasjon etter bildekontrakten; logoer kan brukes som identifikasjon i Brands, men ikke som personportrett.

### Hvis personprofil opprettes eller revideres

**LES FØRST — obligatorisk:** `docs/PEOPLE_PROFILE_CANONICAL.md`

- [ ] identitetsport;
- [ ] claims-fil;
- [ ] felt→claim-paritet;
- [ ] faktareview;
- [ ] redaksjonell review;
- [ ] canonical validator/gate.

### Hvis People-bilde produseres eller endres

**LES FØRST:** `docs/PEOPLE_IMAGES.md`

- [ ] identitet kontrollert;
- [ ] tillatt kilde/lisens;
- [ ] attribusjon lagret;
- [ ] canonical lokal bildefil brukes etter aktiv pipeline.

---

## 13. Brands

**LES FØRST — obligatorisk:** `data/brands/brand_rules_v1_1.json` og `docs/BRAND_ASSETS.md`

Brands er ikke begrenset til forbrukermerker. Profesjonelle firmaer, arkitektur-/ingeniørfirmaer, entreprenører, venue-/galleri-/serveringsidentiteter, institusjonsmerker, subkulturmerker, legacy-navn og skiltidentiteter kan kvalifisere når de har selvstendig gjenkjennelse og en dokumentert rolle ved stedet.

- [ ] søk eksisterende canonical Brand-ID-er, aliaser, `brands_by_place` og innebygde place-records;
- [ ] auditér dokumenterte eiere, operatører, grunnleggere, historiske virksomheter, arkitekt-/ingeniørfirmaer, entreprenører, profesjonelle tjenestefirmaer, venue-navn, institusjoner og skiltidentiteter ved stedet;
- [ ] vurder hver kandidat etter identitetsautonomi, gjenkjennelse, særpreg, visuell/symbolsk tilstedeværelse, minneverdi og place-versus-brand-regelen;
- [ ] aktørtype alene brukes verken som godkjenning eller avslag;
- [ ] gjenbruk eksisterende ID når kandidaten allerede er canonical;
- [ ] dokumenter Brand–sted-koblingen med inspectable kilde, konkret rolle og tidsrom;
- [ ] **alle** canonical Brands som skal være synlige i den ferdige Brand-samlingen har lokal, verifisert logo eller autentisk dokumentert historisk ordmerke/brandmark;
- [ ] logo-/ordmerkedekning er **100 %** før Brand-fasen kan godkjennes;
- [ ] vanlig dokumentarfoto kan supplere et brand, men teller ikke som logo;
- [ ] navnefallback teller ikke som ferdig logoport;
- [ ] historisk ordmerke kan hentes som kildebåret utsnitt fra foto/scan når det ikke rekonstrueres eller redesignes;
- [ ] hver logo/ordmerke har proveniens, kilde- og rettighetskontroll og eksplisitt no-endorsement-kontekst;
- [ ] personer, objekter og generiske aktørnavn omklassifiseres ikke til Brands;
- [ ] null treff i Brand-master eller `brands_by_place` behandles som «må researches», ikke som N/A;
- [ ] N/A brukes bare etter dokumentert kandidatsøk og kandidatspesifikke avvisningsgrunner.

Personverk håndteres i People-profilen etter People-kontrakten, ikke som PlaceCard-samling.

---

---

## 14. Leksikon, relations, NextUp, Nearby, søk og i18n

- [ ] eksisterende Leksikon-record søkt;
- [ ] hovedartikkel/facts/chronology er kildebelagt;
- [ ] Leksikon og `popupDesc` dupliserer ikke unødvendig;
- [ ] `related_place_ids` / relations er meningsfulle;
- [ ] NextUp gir et reelt neste steg der systemet bruker det;
- [ ] Nearby viser riktig navn, kategori og bilde;
- [ ] Nearby åpner riktig PlaceCard;
- [ ] place-search finner canonical navn og relevante aliaser;
- [ ] i18n-/oversettelsesdata vurdert der datasettet bruker dette;
- [ ] alias/oversettelse endrer ikke objektets identitet.

### Offentlig hjemsted

- [ ] vurder eksplisitt;
- [ ] bare canonical History GO-place;
- [ ] aldri privat adresse;
- [ ] egnet koordinat/radius;
- [ ] eksisterende privacy/synlighetsmodell følges;
- [ ] ellers N/A.

---

# DEL G — SPILLERSTATUS, BESØK, FAVORITT OG BELØNNINGER

## 15. Fysisk besøk / innsjekk

**LES FØRST:**

- `docs/COMPLETION_DEFINITIONS.md`
- `docs/QUIZ_AND_PHYSICAL_VISIT_MODEL.md`

- [ ] PlaceCard viser korrekt fysisk besøksknapp/status;
- [ ] avstandsgate bruker riktig place-anker/radius;
- [ ] for langt unna gir riktig tilstand;
- [ ] gyldig fysisk registrering gir `Besøkt` etter eksisterende runtime;
- [ ] quizåpning eller quizfullføring skriver ikke fysisk besøksstatus;
- [ ] place-data lager ikke et nytt konkurrerende visit-storageformat.

---

## 16. Favoritt og place-progress

**LES FØRST:** `docs/PROFILE_PROGRESS_READER_RUNTIME.md`

- [ ] favorittstatus kan leses riktig for stedet;
- [ ] favorittmarkering bruker eksisterende eier/runtime;
- [ ] PlaceCard/Nearby/profil er konsistente om favoritt der flatene viser den;
- [ ] besøkt-status leses riktig;
- [ ] quiz-fullført-status leses riktig;
- [ ] beregnet place-progress/next action er riktig der runtime viser det;
- [ ] ingen ny lokal progresjonsstate opprettes i place-data.

---

## 17. Profil, miniProfile, unlocks og belønninger

**LES FØRST:** `docs/COMPLETION_DEFINITIONS.md`

Vurder alle effekter stedet faktisk skal ha:

- [ ] besøkt sted synlig i relevante profilflater;
- [ ] quizstatus/progresjon kan leses;
- [ ] eventuell People-unlock fungerer;
- [ ] eventuell Object/funn/samlings-unlock fungerer;
- [ ] eventuell badge/merit/kategoriprogresjon fungerer;
- [ ] Bronse/Sølv/Gull vurderes bare der eksisterende runtime/data faktisk støtter dette;
- [ ] belønning hevdes ikke implementert bare fordi produktmodellen beskriver den;
- [ ] `updateProfile` dispatches der den eide runtimekontrakten krever det;
- [ ] Next action etter handling er meningsfull;
- [ ] samme spillerstatus leses konsistent i PlaceCard, Nearby og profil/miniProfile der de viser den.

### Viktig

Fysisk besøksmodul garanterer **ikke automatisk** badge, stedsmerke, People-unlock eller samlingsobjekt. Slike downstream-effekter må ha egen implementert eier og test.

---

# DEL H — LEGACY WONDERKAMMER

## 18. Klassifiser legacy-innhold, men produser ikke nytt Wonderkammer for stedet

Hvis legacy Wonderkammer finnes:

- [ ] fysisk ting → Objects;
- [ ] liten fysisk detalj/spor → Details;
- [ ] fysisk delsted → Spots;
- [ ] person → People;
- [ ] verk → Works;
- [ ] natur → Nature;
- [ ] handling → På stedet;
- [ ] navigasjon → relations/NextUp;
- [ ] chronology/hendelse → Historie;
- [ ] narrativ episode → Story bare hvis Story-kontrakten består;
- [ ] gammel entry slettes ikke før canonical erstatning er validert.

Civication Store beholdes som eget spillsystem. Det er ikke en PlaceCard-samling.

---

# DEL I — BILDER

## 19. Hovedbilder og samlingsbilder

For hvert bilde som publiseres:

- [ ] viser riktig sted/person/verk/objekt/detail/spot/art/brand;
- [ ] nabosted, feil bygg, feil avdeling eller navnelik entitet er utelukket;
- [ ] fil/URL eksisterer og laster;
- [ ] crop/aspect ratio fungerer i aktuell flate;
- [ ] `frontImage` er publisert i stående orientering med høyde større enn bredde og dokumentert `frontImageMeta`/tilsvarende metadata;
- [ ] historisk bilde presenteres som historisk;
- [ ] illustrasjon presenteres ikke som dokumentarfoto;
- [ ] attribusjon/lisens lagres der datamodellen krever det;
- [ ] hver valgt samling har et previewbilde av et faktisk canonical medlem i samlingen;
- [ ] generisk ikon-/antallsfallback kan brukes ved runtime-feil, men manglende eller ødelagt previewbilde blokkerer produksjonsklar status;
- [ ] Objects/Details/Spots viser det konkrete elementet, ikke bare generisk hovedbilde;
- [ ] People-bilder følger `docs/PEOPLE_IMAGES.md`.

### Stoppgate

En valgt samling med ødelagt, misvisende eller falskt preview er ikke produksjonsklar selv om JSON/CI er grønn.

---

# DEL J — SLUTT-QA

## 20. Data-QA

- [ ] JSON parser;
- [ ] place-ID unik;
- [ ] source-fil er manifest-loadet;
- [ ] genererte indekser regenereres fra source, aldri håndredigeres;
- [ ] category gyldig;
- [ ] underbadge-ID-er gyldige;
- [ ] emne-ID-er gyldige;
- [ ] coordinate contract passerer;
- [ ] description-production/claim-paritet passerer ved tekstendring;
- [ ] People-referanser finnes;
- [ ] Works-referanser finnes;
- [ ] Brands-referanser finnes og beholder Brands-semantikk;
- [ ] Story-referanser/manifest passerer;
- [ ] quiz targets/production package passerer;
- [ ] route-referanser finnes;
- [ ] i18n/alias-data validerer når berørt;
- [ ] ingen duplikat-ID-er introdusert.

---

## 21. UI-QA — åpne akkurat stedet

- [ ] kartmarkør på riktig fysisk sted;
- [ ] Nearby/Søk åpner riktig sted;
- [ ] PlaceCard åpner uten feil;
- [ ] navn/kategori/hovedbilde/`desc` riktige;
- [ ] `popupDesc`/popup åpner riktig;
- [ ] popup har Om · Historie · Fortellinger · Før/etter · Nyheter · Lesespor · Kilder · Mer;
- [ ] Før/etter-hovedparet er visuelt sammenlignbart og inkluderer et reelt gammelt–nå-lag når stedet og arkivtilgangen tilsier det;
- [ ] Nyheter, Lesespor og Mer er kontrollert som faktiske brukerflater; tomt/N/A er ikke godkjent bare fordi data mangler;
- [ ] PlaceCard-samlingene følger `data/places/README_place_rounds.md`;
- [ ] Badges vises separat ved stedsoverskriften;
- [ ] obligatorisk Quiz er tydelig og fungerer;
- [ ] 1–4 samlingsflater vises adaptivt ved `frontImage`;
- [ ] People, Flora og Fauna er sirkler; øvrige samlinger er avrundede rektangler;
- [ ] Bilder ligger i medieflaten/riktig popupflate og aldri som PlaceCard-samling eller reserve;
- [ ] alle valgte samlinger har korrekte, lastende previewbilder av canonicale medlemmer; robust ikonfallback er bare feilhåndtering og ikke ferdigstatus;
- [ ] People-kortet viser personens korte `desc`, ikke hele `popupDesc`;
- [ ] full People-tekst vises først i personpopupen;
- [ ] Badges åpner riktig sted/fagverk;
- [ ] Badge og alle valgte canonicale samlinger åpner riktig innhold;
- [ ] samlingene er innholdsmessig tydelige og ikke kunstige eller semantisk overlappende;
- [ ] Objects bæres av en naturlig gruppe som forklarer stedets hovedfunksjon og velges ikke bare på grunn av én tilfeldig gjenstand eller et kjent sekundært kulturspor;
- [ ] Brands viser bare kandidater som består `data/brands/brand_rules_v1_1.json` og har dokumentert stedskobling;
- [ ] natursteder bruker den canonical naturprofilen;
- [ ] Civication/Wonderkammer vises ikke som canonical samling;
- [ ] På stedet ligger under samlingene;
- [ ] visit-knapp/status fungerer;
- [ ] favorittstatus fungerer;
- [ ] quiz fungerer uten å skrive fysisk besøk;
- [ ] relevante unlocks/belønninger kan leses i riktige flater;
- [ ] tomme/irrelevante flater skjules eller har korrekt tomtilstand;
- [ ] ingen gammel 3×3-/ni-runderslogikk lekker gjennom.

---

## 22. Innholds-QA

- [ ] alle nye brukerrettede påstander har inspectable støtte;
- [ ] `desc`/`popupDesc` følger Place Description-kontrakten, ikke bare denne listen;
- [ ] datoer/år/roller/tall kontrollert;
- [ ] People-koblinger følger People of Places;
- [ ] nye/reviderte People følger People Profile-kontrakten;
- [ ] Stories følger Stories governance;
- [ ] Quiz følger Quiz Production Canonical;
- [ ] Nature følger naturmappingens eierskap og evidens;
- [ ] bilder identitetskontrollert;
- [ ] Brands følger den canonicale Brand-definisjonen uten å snevres inn til bare forbrukermerker eller utvides til en generell aktørrestkategori;
- [ ] Før/etter er vurdert for sammenlignbart utsnitt, historisk dybde og faktisk nåbilde — ikke bare lisens og kilder;
- [ ] Nyheter, Lesespor og Mer har reell dekning eller en dokumentert, streng N/A-begrunnelse etter aktivt søk;
- [ ] samlingsinnhold er ikke filler;
- [ ] PlaceCard-samlingene er samlet vurdert for brukerforståelse, substans og semantisk overlapp;
- [ ] avvist/usikkert innhold er fortsatt utelatt.

---

## 23. CI / repository-gates

Kjør gates som faktisk eier endringene. Typiske:

- [ ] Data checks / Places gate;
- [ ] Place description governance når `desc`/`popupDesc`/produksjonspakke berøres;
- [ ] Place rounds governance;
- [ ] Fagverk and place learning ved relevante place/fagverk/bildeendringer;
- [ ] coordinate gate ved koordinatendring;
- [ ] People profile / People of Places / People image gates når People berøres;
- [ ] Stories gate når Stories berøres;
- [ ] quiz/category governance når Quiz/kategori berøres;
- [ ] Nature gate når naturmapping berøres;
- [ ] TypeScript guard når runtime/schema berøres;
- [ ] øvrige subsystemgates for faktisk berørte filer.

**Grønn CI erstatter aldri faktakontroll eller manuell UI-kontroll.**

---

# DEL K — MERGEGATE

## 24. Ett-sted-PR

- [ ] PR-en gjelder ett place;
- [ ] PR-en gjelder bare den aktive produksjonsfasen eller en uttrykkelig nødvendig sikringsendring;
- [ ] avhengige People/Works/Story/Quiz/Objects/Details/Spots-data er med bare når nødvendig for dette stedet;
- [ ] neste sted er ikke blandet inn;
- [ ] sluttdiffen har bare forventede filer;
- [ ] branch er à jour med `main`;
- [ ] reviewtråder er løst;
- [ ] alle relevante gates er grønne på uendret head-SHA;
- [ ] manuell sted-QA er utført på samme innhold;
- [ ] merge bruker låst/forventet head-SHA.
- [ ] den mergede fasen er kontrollert på faktisk `main`/produksjonsflate før neste fase starter.

Ikke start neste sted før dette stedet er merget eller eksplisitt stoppet/blokkert med dokumentert grunn.

---

# DEL L — ENDELIG FERDIGDEFINISJON

Et sted er **sted-produksjon ferdig** først når hvert punkt nedenfor er sant eller eksplisitt **N/A**:

### Identitet og fakta
- [ ] canonical place/source/manifest avklart;
- [ ] faktakilder lest;
- [ ] påstander sporbare;
- [ ] usikkerhet utelatt eller korrekt markert.

### Geografi
- [ ] koordinat/anker;
- [ ] radius/geometry;
- [ ] source/evidence/gate.

### Fag
- [ ] category;
- [ ] underbadges;
- [ ] emner;
- [ ] Badges;
- [ ] egen fungerende `fagverk-sted.html?place=<place_id>` er kontrollert og kan ikke være N/A;
- [ ] Politikk-gate/produksjonsrapport PASS når relevant;
- [ ] Historie-gate/produksjonsrapport PASS når relevant;
- [ ] Næringsliv-gate/produksjonsrapport PASS når relevant.

### Tekst
- [ ] `desc` følger `PLACE_DESCRIPTION_CANONICAL`;
- [ ] `popupDesc` følger `PLACE_DESCRIPTION_CANONICAL`;
- [ ] produksjonspakke/claims/reviews/validator er ferdige.

### Popup
- [ ] Om;
- [ ] Historie;
- [ ] Fortellinger / N/A;
- [ ] Før/etter / N/A;
- [ ] Nyheter / strengt dokumentert N/A etter fersksøk;
- [ ] Lesespor / strengt dokumentert N/A etter søk etter direkte lesbart materiale;
- [ ] Kilder;
- [ ] Mer / strengt dokumentert N/A etter søk i alle relevante innholdseiere.

### PlaceCard-samlinger
- [ ] `data/places/README_place_rounds.md` er fulgt;
- [ ] Badges vises separat ved stedsoverskriften;
- [ ] Quiz vises som obligatorisk, tydelig handling;
- [ ] stedet viser 1–4 substansielle samlingsflater fra `place_card_profile`;
- [ ] hver samling er substansiell, naturlig og tydelig forskjellig fra de andre;
- [ ] samlingsform og adaptiv 1–4-layout er kontrollert på mobil og desktop;
- [ ] Bilder brukes ikke som samling eller reserve;
- [ ] Objects og Structures/Bygg er ikke kunstig splittet;
- [ ] preview og innhold følger PlaceCard-kontrakten.

### På stedet / læring
- [ ] Events / N/A;
- [ ] Møter / N/A;
- [ ] Tasks / N/A;
- [ ] Training / N/A;
- [ ] Play / N/A;
- [ ] Quiz etter canonical quizprosedyre / N/A;
- [ ] Observer / N/A;
- [ ] Notat / N/A;
- [ ] Rute / N/A.

### Relasjoner
- [ ] People;
- [ ] Works;
- [ ] Brands;
- [ ] Leksikon;
- [ ] Relations/NextUp;
- [ ] Nearby/Søk;
- [ ] alias/i18n;
- [ ] offentlig hjemsted / N/A;
- [ ] Wonderkammer-legacy / N/A.

### Spillerstatus
- [ ] fysisk besøk/visit-knapp;
- [ ] quiz ↔ fysisk besøk-separasjon;
- [ ] favoritt;
- [ ] place-progress;
- [ ] profil/miniProfile;
- [ ] People/Object/andre unlocks / N/A;
- [ ] badge/merit/Bronse–Sølv–Gull / N/A;
- [ ] Next action;
- [ ] status konsistent på relevante flater.

### Bilder
- [ ] hovedbilder;
- [ ] samlingspreview;
- [ ] identitet;
- [ ] lisens/attribusjon der relevant.

### QA / merge
- [ ] data validerer;
- [ ] subsystemkontrakter er fulgt;
- [ ] UI manuelt kontrollert;
- [ ] relevant CI grønn;
- [ ] ren ett-sted-diff;
- [ ] merge ferdig.

---

# KOPIERBAR STATUSMAL PER STED

```markdown
## <place_id> — produksjonsstatus

### 0. Nullmåling og fasekontroll
- [ ] nullmåling
- [ ] behold / omskriv / flytt / fjern / mangler
- [ ] aktiv fase
- [ ] eksakt filscope
- [ ] forrige fase merget og live-kontrollert / første fase

### A. Source og identitet
- [ ] canonical object
- [ ] manifest/source
- [ ] duplikatsøk
- [ ] identitetssetning

### B. Fakta og koordinat
- [ ] kilder lest / claims
- [ ] koordinat/anker
- [ ] radius/geometry
- [ ] coordinate evidence/gate

### C. Fag
- [ ] category
- [ ] underbadges
- [ ] emne_ids
- [ ] Badges
- [ ] fagverk-sted — obligatorisk, fungerende og aldri N/A
- [ ] Politikk-gate/produksjonsrapport / N/A
- [ ] Historie-gate/produksjonsrapport / N/A
- [ ] Næringsliv-gate/produksjonsrapport / N/A

### D. desc / popupDesc
LES: data/places/regler/PLACE_DESCRIPTION_CANONICAL.md
- [ ] production package
- [ ] claims
- [ ] desc
- [ ] popupDesc
- [ ] sentence→claim
- [ ] faktareview
- [ ] redaksjonell review
- [ ] validator

### E. Popup
LES: docs/PLACE_POPUP_SYSTEM.md
- [ ] Om — status + evidens
- [ ] Historie — status + evidens
- [ ] Fortellinger — status + egen N/A-begrunnelse/evidens
- [ ] Før/etter — status + egen N/A-begrunnelse/evidens
- [ ] Nyheter — status + egen N/A-begrunnelse/evidens
- [ ] Lesespor — status + egen N/A-begrunnelse/evidens
- [ ] Kilder — status + brukerrettet kildeflate
- [ ] Mer — status + egen N/A-begrunnelse/evidens

### F. PlaceCard-samlinger
LES: data/places/README_place_rounds.md
Mål: [ ] 1–4 sterke flater valgt adaptivt + separat Badge + obligatorisk Quiz
- [ ] `place_card_profile.collection_ids` / dokumentert legacy-adapter
- [ ] Badge separat ved overskriften
- [ ] Quiz tydelig og fungerende
- [ ] adaptiv 1–4-layout balansert ved `frontImage`
- [ ] `frontImage` er stående (`height > width`) med kontrollert motiv og dokumentert crop/proveniens
- [ ] People/Flora/Fauna sirkler; øvrige samlinger avrundede rektangler
- [ ] Bilder bare i medie-/bildeflater, aldri som samling/reserve
For hver samling: [ ] relevant  [ ] stedsspesifikk  [ ] substansiell  [ ] faktisk medlemsbilde laster  [ ] riktig flow
Samlet: [ ] tydelig forskjellige samlinger  [ ] ingen kunstig Objects/Structures-splitt  [ ] ingen enkel gjenstand som fyll  [ ] ingen kunstig fjerde samling

### G. People / Stories / Quiz
- [ ] People of Places lest og vurdert
- [ ] People Profile Canonical brukt ved People-endring / N/A
- [ ] Stories Governance brukt ved Story / N/A
- [ ] Quiz Production Canonical brukt ved Quiz / N/A
- [ ] eksisterende quiz auditert før profilvalg
- [ ] quizprofil + eksakt settantall: `narrow` 3 / `normal` 4 / `rich` 5–8 / `major` 8–10
- [ ] begrunnelse for eksakt settantall og eventuelle holdback-spor

### H. På stedet
- [ ] Events / N/A
- [ ] Møter / N/A
- [ ] Tasks / N/A
- [ ] Training / N/A
- [ ] Play / N/A
- [ ] Observer / N/A
- [ ] Notat / N/A
- [ ] Rute / N/A

### I. Relasjoner
- [ ] Works
- [ ] Brands — Brand-regler lest, kandidatsøk, place-evidens, logo/rettigheter og N/A-gate
- [ ] Leksikon
- [ ] Relations / NextUp
- [ ] Nearby / Søk
- [ ] alias / i18n
- [ ] hjemsted / N/A
- [ ] Wonderkammer legacy / N/A

### J. Spillerstatus
- [ ] fysisk besøk
- [ ] quiz skriver ikke fysisk visit
- [ ] favoritt
- [ ] place-progress
- [ ] profil / miniProfile
- [ ] unlocks / N/A
- [ ] badge/merit/nivå / N/A
- [ ] next action

### K. Bilder og slutt-QA
- [ ] hovedbilder
- [ ] samlingsbilder
- [ ] stående `frontImage`-fil/variant (`height > width`), ikke bare CSS-ramme
- [ ] alle valgte samlingsflater viser faktisk canonical medlemsbilde uten ikon-/antallsfallback
- [ ] Før/etter: sammenlignbart utsnitt + gammel–nå-lag + faktisk nåbilde
- [ ] Nyheter, Lesespor og Mer: innhold eller strengt dokumentert N/A etter søk
- [ ] identitet/attribusjon
- [ ] JSON/referanser
- [ ] adaptiv layout med 1–4 samlingsflater + separat Badge-plassering + tydelig obligatorisk Quiz
- [ ] popupfaner
- [ ] relevant CI
- [ ] ren slutt-diff
- [ ] merge
```

---

## Hovedprinsippet

> **Vi ferdigstiller ikke et sted ved å fylle flest mulig felt. Vi ferdigstiller det ved å følge riktig subsystemkontrakt for hvert relevant lag, produsere bare dokumenterbart innhold, teste hele spillerflaten og lukke stedet før vi går videre til det neste.**


## Kart-LOD v2

- `placeScope` beskriver hva et Place **er** semantisk. `placeScope: "area"` skal bare brukes for reelle område-Places.
- `mapLod` beskriver hvordan Place-et prioriteres i kartet. Runtime-indeksen materialiserer `mapLod: "area"` automatisk fra canonical `placeScope: "area"` når ingen eksplisitt `mapLod` finnes.
- Kartet har separate område- og detaljlag: områdeprikker/-navn er synlige på oversiktszoom, detaljprikker fader inn fra zoom 11,8, detalj-hitflate åpnes fra 12,35 og detaljetiketter fra 13,15.
- Koordinatroller som `area_anchor` og `district_anchor` er geometri, ikke områdeeierskap, og skal aldri alene gjøre et Place til område.
- `places_index.json` må bevare `placeScope` og avledet `mapLod`; sync- og kart-LOD-testene skal stoppe regresjoner.
