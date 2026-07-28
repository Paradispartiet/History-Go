# History GO — sted-for-sted produksjonsoppskrift

Status: **canonical produksjonsarbeidsflyt**  
Eier: `place_by_place_production_workflow`  
Sist kontrollert: **2026-07-29**

Dette dokumentet er arbeidsoppskriften for å ferdigstille **ett History GO-sted om gangen**.

Det er en **ruterings- og sjekkliste**, ikke en kopi av subsystemenes egne produksjonskontrakter. Når et punkt sier **LES FØRST**, skal den navngitte kontrakten faktisk leses og følges.

> **Ett sted ferdig før neste. Manglende relevant innhold er bedre enn filler. Glemt kontroll er ikke godkjent.**

---

# 0. Autoritetskart

| Område | Autoritativ produksjons-/runtimekontrakt |
| --- | --- |
| Overordnet faktisitet | `docs/FACTUALITY_CONTRACT.md` |
| Place-data, manifester og referanser | `docs/DATA_PRODUCTION_CONTRACT.md` |
| Canonical stedstandard | `docs/PLACE_STANDARD.md` |
| `desc` og `popupDesc` | **`data/places/regler/PLACE_DESCRIPTION_CANONICAL.md`** |
| Description-produksjonspakke | `data/places/regler/place_description_production_v4_2.schema.json` |
| Stedspopup / åtte faner | **`docs/PLACE_POPUP_SYSTEM.md`** |
| PlaceCard-rundinger | **`data/places/README_place_rounds.md`** |
| På stedet | **`docs/PLACE_ONSITE_SYSTEM.md`** + `data/categories/place_onsite_contract.json` |
| Kategori / canonical kategori-ID-er | `data/categories/category_contract.json` |
| Fagverk / merke vs fag / navigasjon | `docs/FAGVERK_NAVIGATION.md` |
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

Ved konflikt gjelder kontrakten som **eier subsystemet**, sammen med strengeste relevante faktisitetsregel.

## Absolutt regel mot duplisert governance

Denne filen sier **hva som skal kontrolleres**. Eierkontrakten sier **hvordan det produseres**.

Det er derfor ikke lov å:

- skrive quiz fra denne sjekklisten i stedet for quizkontrakten;
- skrive `desc`/`popupDesc` uten Place Description-protokollen;
- lage People-record uten People-kontraktene;
- lage Story uten Stories governance;
- definere eller velge rundinger fra denne filen;
- endre koordinat uten coordinate-kontraktene;
- kopiere subsystemets paletter/matriser/regler hit «for enkelhets skyld».

---

# DEL A — ARBEIDSKORT FOR DET AKTIVE STEDET

Fyll før research/produksjon:

```text
PLACE ID:
NAVN:
CANONICAL SOURCE-FIL:
MANIFEST:
HVA REPRESENTERER PLACE-OBJEKTET:
PRIMÆRKATEGORI:
UNDERBADGES:
EMNE_IDS:
STEDSTYPE:
KOORDINATSTATUS:
DESCRIPTION-PRODUCTION-PACKAGE:
LEKSIKON-ID/FIL:
RUNDINGSPROFIL: vanlig / natur
PEOPLE-KANDIDATER:
BRANDS SOM ALLEREDE FINNES:
ROUTE/RELATION-KOBLINGER:
QUIZ-STATUS:
STORY-STATUS:
VIKTIGSTE KILDER:
AVVIST/UVISST INNHOLD:
```

Arbeidskortet skal tydeliggjøre **hva stedet er, hvor canonical sannhet ligger og hvilke subsystemer som er relevante**.

---

# DEL B — PRODUKSJONSREKKEFØLGE

## 1. Lås canonical identitet og source

**LES FØRST:**

- `docs/DATA_PRODUCTION_CONTRACT.md`
- `docs/FACTUALITY_CONTRACT.md`

Sjekk:

- [ ] søk repoet etter place-ID;
- [ ] søk fullt navn, gamle navn, aliaser og stavevarianter;
- [ ] samme fysiske/historiske objekt finnes ikke allerede som annet canonical place;
- [ ] manifest-loadet source-fil er identifisert;
- [ ] aggregate-/legacyfil er ikke feil edit-target;
- [ ] place-objektet kan defineres i én presis setning;
- [ ] bygg/institusjon, område/enkeltobjekt, minnested/hendelsessted og historisk/dagens objekt er skilt når relevant.

**Stopp:** Ikke produser videre hvis place-identiteten eller source of truth er uklar.

## 2. Bygg kildegrunnlaget før teksten

**LES FØRST:** `docs/FACTUALITY_CONTRACT.md`

- [ ] åpne og les faktiske kilder, ikke bare søkeresultater/snippets;
- [ ] prioriter primærkilder, offentlige registre, arkiv og institusjonelle kilder;
- [ ] registrer hvilken kilde som støtter hvilken påstand;
- [ ] skill fakta fra tolkning;
- [ ] registrer konflikter og usikkerhet;
- [ ] eksisterende History GO-tekst brukes ikke som eneste kilde;
- [ ] språkmodell brukes aldri som faktakilde;
- [ ] uverifiserbare påstander utelates;
- [ ] nåtidsopplysninger får fersk kontroll.

Minimum for vesentlige fakta:

```text
påstand → konkret kilde → konkret kildeplassering → kontrollstatus
```

## 3. Koordinat, anker, radius og geometry

**LES FØRST:**

- `docs/coordinates/README.md`
- `docs/coordinates/coordinate-source-contract-v1.md`
- `docs/coordinates/coordinate-evidence-files-v1.md`

- [ ] `lat`/`lon` representerer riktig fysisk/historisk objekt;
- [ ] `locatorType`, `coordRole`, `sourceProvider` og source-identitet er riktige;
- [ ] `geocodeAccuracy` og `coordStatus` er ærlige;
- [ ] historisk/flyttet/revet objekt bruker historisk evidens når nødvendig;
- [ ] gate/park/elv/område/linje bruker egnet anker/geometry;
- [ ] `r` er gameplay-radius, ikke påstått areal;
- [ ] coordinate-evidence finnes når kontrakten krever det;
- [ ] relevante coordinate gates kjøres;
- [ ] kartet kontrolleres visuelt.

**Stopp:** Usikker koordinat skal ikke merkes `verified`.

## 4. Kategori, Badges, underbadges, emner og fagverk

**LES FØRST:**

- `data/categories/category_contract.json`
- `docs/FAGVERK_NAVIGATION.md`

- [ ] `category` er canonical primærkategori;
- [ ] place dupliseres ikke i andre kategorier for å uttrykke tverrfaglighet;
- [ ] `underbadge_ids` vurdert og alle ID-er finnes;
- [ ] `emne_ids` vurdert;
- [ ] badgegrafikk og fagverksnavigasjon fungerer;
- [ ] merke- og fagsider blandes ikke sammen.

Rundingens badge-presentasjon eies av rundingkontrakten og gjentas ikke her.

## 5. `desc` og `popupDesc`

**LES FØRST — obligatorisk:** `data/places/regler/PLACE_DESCRIPTION_CANONICAL.md`

- [ ] produksjonspakke finnes når standarden krever det;
- [ ] identitetsport er `resolved`;
- [ ] stabile claims finnes;
- [ ] hver claim har inspectable kilde og `sourceLocation`;
- [ ] sterke påstander følger streng evidensregel;
- [ ] nåtidsclaims har korrekt temporal status;
- [ ] `desc` er leksikalsk ingress;
- [ ] `popupDesc` er full stedartikkel;
- [ ] setning→claim-kobling er komplett;
- [ ] teksthash samsvarer;
- [ ] faktareview og redaksjonell review er utført;
- [ ] canonical validator/governance passerer.

Denne sjekklisten eier ikke en alternativ skriveoppskrift.

## 6. Strukturerte place-profiler

**LES FØRST:** `docs/PLACE_STANDARD.md`

Vurder bare det stedstypen faktisk støtter:

- [ ] `spatial_profile`;
- [ ] `temporal_profile`;
- [ ] `subplaces`;
- [ ] `history_layers`;
- [ ] `nature_profile`;
- [ ] `source_summary`;
- [ ] øvrige type-spesifikke strukturer i aktiv standard/schema.

Feltets eksistens avgjør ikke om det er en runding. Rundingidentitet eies separat.

---

# DEL C — STEDSPOPUPEN

## 7. Alle åtte faner vurderes

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
- [ ] rekorder/mesterskap ligger her når verdien er historisk kunnskap.

### Fortellinger
**LES FØRST:** `docs/STORIES_DATA_GOVERNANCE.md`
- [ ] eksisterende canonical Stories søkt;
- [ ] chronology er ikke automatisk Story;
- [ ] ny/revidert Story følger aktiv profil og manifest;
- [ ] narrativ verdi, aktører, handling, tid/sted og kilder er reelle;
- [ ] relevant story-gate passerer.

### Før/etter
- [ ] `for_na` vurdert;
- [ ] historisk og dagens bilde viser samme meningsfulle sammenligning;
- [ ] `before`, `now`, `change` er konkrete og kildebelagte.

### Nyheter
- [ ] historiske/nyere notiser vurdert;
- [ ] nåtidsnotiser er ferskt kontrollert;
- [ ] liten notis blåses ikke opp til Story.

### Lesespor
- [ ] eksisterende Lesespor søkt;
- [ ] `place_ids` peker eksplisitt til stedet;
- [ ] åpen flate viser bare egnet direkte lesbart materiale.

### Kilder
- [ ] brukerrettede sikre kilder vurdert;
- [ ] place-/Leksikon-/Før-etter-lenker vurdert;
- [ ] lenker er relevante, HTTPS og dedupliserte;
- [ ] interne audits/researchnotater lekker ikke ut.

### Mer
- [ ] smalere relevant kunnskap vurdert;
- [ ] Mer brukes ikke som søppelskuff for handlinger eller innhold som eies av andre systemer.

Alle åtte får status: **ferdig** eller **N/A**.

---

# DEL D — RUNDINGER

## 8. Verifiser canonical rundingsprofil

**LES FØRST — obligatorisk:** **`data/places/README_place_rounds.md`**

Denne sjekklisten vedlikeholder med hensikt **ingen egen rundingspalett, antallsregel eller prioriteringsmatrise**.

Kontroller bare at eierkontrakten er fulgt:

- [ ] riktig canonical profil brukes for stedets type;
- [ ] runtime viser nøyaktig den profilen kontrakten bestemmer;
- [ ] legacy `rounds`/`rundinger`/prioritetslogikk kan ikke overstyre profilen;
- [ ] preview er presentasjon og filtrerer ikke canonical innhold;
- [ ] naturstedets eventuelle spesialflater følger rundingkontrakten;
- [ ] relevante rundingstester/governance passerer.

Hvis du trenger å vite **hvilke rundinger som finnes eller hva de betyr**, les eierfilen. Ikke kopier svaret hit.

---

# DEL E — PÅ STEDET OG LÆRINGSFLATER

## 9. På stedet

**LES FØRST:**

- `docs/PLACE_ONSITE_SYSTEM.md`
- `data/categories/place_onsite_contract.json`
- `docs/PLACE_POPUP_SYSTEM.md`

### Events
- [ ] canonical event skjer faktisk ved stedet;
- [ ] tidsbundne forestillinger/oppsetninger/konserter behandles som Events;
- [ ] historisk omtale i Historie/Stories endrer ikke event-identiteten.

### Møter
Når Social Meet/Spotmeeting brukes:

**LES FØRST:**
- `docs/HG_SPOTMEETING.md`
- `docs/HG_SOCIAL_MEET_IDENTITY_CONTRACT.md`

- [ ] stedet er egnet offentlig møtekontekst;
- [ ] privacy-/sikkerhetsgrenser respekteres;
- [ ] live-posisjon, nearby people eller offentlig besøkshistorikk lekker ikke fra place-data.

### Andre handlinger
- [ ] kategori-/stedstypepolicyen følges;
- [ ] Lek vises bare der canonical onsite-policy tillater det;
- [ ] `tasks_profile` brukes ikke som nytt History GO-produkt;
- [ ] trening behandles som type-spesifikt sportsinnhold etter aktiv popup-/onsite-kontrakt.

## 10. Quiz

**LES FØRST — obligatorisk:** `data/quiz/regler/QUIZ_PRODUCTION_CANONICAL.md`

Denne sjekklisten er ikke quizoppskrift.

- [ ] relevant quiz finnes eller er eksplisitt N/A;
- [ ] `categoryId` og `targetId` er korrekte;
- [ ] manifest/required inputs er fulgt;
- [ ] eksterne kilder driver synlig faktainnhold etter quizkontrakten;
- [ ] progresjon, teori/method-binding og andre relevante gates passerer.

## 11. Observer, Notat og Rute

### Observer
- [ ] faktisk observerbart fenomen;
- [ ] korrekt lens/observation-data;
- [ ] learning-log-eierskap beholdes.

### Notat
- [ ] notatflow fungerer der produktet støtter dette.

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

Relevante personer vurderes uavhengig av om stedets aktuelle rundingsprofil viser People.

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

### Hvis personprofil opprettes eller revideres

**LES FØRST:** `docs/PEOPLE_PROFILE_CANONICAL.md`

- [ ] identitetsport;
- [ ] claims-/source-paritet;
- [ ] faktareview;
- [ ] redaksjonell review;
- [ ] canonical validator/gate.

Personens egne verk/bibliografi/filmografi/diskografi/arkitekturverk behandles i personens eide profilmodell – ikke som en egen PlaceCard-runding.

### Hvis People-bilde produseres eller endres

**LES FØRST:** `docs/PEOPLE_IMAGES.md`

- [ ] identitet kontrollert;
- [ ] tillatt kilde/lisens;
- [ ] attribusjon lagret;
- [ ] canonical lokal bildefil brukes etter aktiv pipeline.

## 13. Fysiske gjenstander og Brands

### Fysiske gjenstander
- [ ] fysisk identitet er kontrollert;
- [ ] konkret stedstilknytning er dokumentert;
- [ ] fysisk kunstverk/skulptur/installasjon behandles som gjenstand etter eierkontrakten;
- [ ] tidsbundet forestilling/oppsetning behandles ikke som gjenstand.

### Brands
- [ ] søk eksisterende Brands-data;
- [ ] gjenbruk eksisterende ID;
- [ ] dokumenter bedrift-/merke–sted-koblingen;
- [ ] korrekt logo;
- [ ] ingen omklassifisering av andre aktørtyper til Brands.

## 14. Leksikon, relations, NextUp, Nearby, søk og i18n

- [ ] eksisterende Leksikon-record søkt;
- [ ] hovedartikkel/facts/chronology er kildebelagt;
- [ ] Leksikon og `popupDesc` dupliserer ikke unødvendig;
- [ ] `related_place_ids` / relations er meningsfulle;
- [ ] NextUp gir reelt neste steg der systemet bruker det;
- [ ] Nearby viser riktig navn, kategori og bilde;
- [ ] Nearby åpner riktig PlaceCard;
- [ ] place-search finner canonical navn og relevante aliaser;
- [ ] i18n-/oversettelsesdata vurdert der datasettet bruker dette;
- [ ] alias/oversettelse endrer ikke objektets identitet.

### Offentlig hjemsted
- [ ] bare canonical History GO-place;
- [ ] aldri privat adresse;
- [ ] egnet koordinat/radius;
- [ ] privacy/synlighetsmodell følges;
- [ ] ellers N/A.

---

# DEL G — SPILLERSTATUS, BESØK, FAVORITT OG BELØNNINGER

## 15. Fysisk besøk / innsjekk

**LES FØRST:**
- `docs/COMPLETION_DEFINITIONS.md`
- `docs/QUIZ_AND_PHYSICAL_VISIT_MODEL.md`

- [ ] fysisk besøk bruker eksisterende canonical visit-state;
- [ ] radius/ankere fungerer;
- [ ] quizåpning/fullføring skriver ikke fysisk besøksstatus;
- [ ] place-data lager ikke konkurrerende visit-storageformat.

## 16. Favoritt og place-progress

**LES FØRST:** `docs/PROFILE_PROGRESS_READER_RUNTIME.md`

- [ ] favorittstatus leses riktig;
- [ ] favorittmarkering bruker eksisterende eier/runtime;
- [ ] place-progress/next action er riktig der runtime viser det;
- [ ] ingen ny lokal progresjonsstate opprettes i place-data.

## 17. Profil, miniProfile, unlocks og belønninger

**LES FØRST:** `docs/COMPLETION_DEFINITIONS.md`

Vurder bare effekter som faktisk har implementert eier:

- [ ] profil/miniProfile;
- [ ] unlocks;
- [ ] badge/achievement;
- [ ] People/nature/andre unlocks;
- [ ] downstream-effekter er testet og ikke antatt.

Fysisk besøk garanterer ikke automatisk andre belønninger uten eksplisitt implementasjon.

---

# DEL H — LEGACY WONDERKAMMER

## 18. Klassifiser legacy-innhold, produser ikke nytt Wonderkammer

Hvis legacy Wonderkammer finnes:

- [ ] vurder hvert element etter faktisk identitet;
- [ ] flytt bare når riktig canonical eier er kjent;
- [ ] ikke bruk Wonderkammer som ny place-produksjonsmodell;
- [ ] ikke la legacy-felt definere rundinger.

Civication Store beholdes som eget spillsystem og skal ikke gis rundingidentitet bare fordi data finnes der.

---

# DEL I — BILDER

## 19. Bilder

For hvert bilde som publiseres:

- [ ] viser riktig sted/person/gjenstand/art/brand;
- [ ] nabosted, feil bygg, feil avdeling eller navnelik entitet er utelukket;
- [ ] utsnitt og kvalitet er egnet;
- [ ] lisens/bruksvilkår er kontrollert;
- [ ] attribusjon lagres der datamodellen krever det;
- [ ] People-bilder følger `docs/PEOPLE_IMAGES.md`;
- [ ] rundingspreview følger rundingkontrakten og brukes aldri som datafilter.

---

# DEL J — SLUTT-QA

## 20. Data-QA

- [ ] JSON parser;
- [ ] place-ID unik;
- [ ] source-fil er manifest-loadet;
- [ ] genererte indekser regenereres fra source, aldri håndredigeres;
- [ ] refererte People/Story/Quiz/Brand/nature-ID-er finnes;
- [ ] kategori/emne/underbadge-referanser validerer;
- [ ] i18n/alias-data validerer når berørt;
- [ ] ingen duplikat-ID-er introdusert.

## 21. UI-QA — åpne akkurat stedet

- [ ] kartmarkør på riktig fysisk sted;
- [ ] Nearby/Søk åpner riktig sted;
- [ ] PlaceCard åpner uten feil;
- [ ] navn/kategori/hovedbilde/`desc` riktige;
- [ ] canonical rundingsprofil er riktig;
- [ ] ingen legacy-rundinger lekker inn;
- [ ] vanlige steder og natursteder følger sine respektive rundingskontrakter;
- [ ] naturspesialflater testes på et faktisk natursted;
- [ ] På stedet følger category/type-policy;
- [ ] popupens åtte faner fungerer;
- [ ] tomme/irrelevante flater skjules eller har korrekt tomtilstand.

## 22. Innholds-QA

- [ ] alle nye brukerrettede påstander har inspectable støtte;
- [ ] `desc`/`popupDesc` følger Place Description-kontrakten;
- [ ] datoer/år/roller/tall kontrollert;
- [ ] People-koblinger følger People of Places;
- [ ] Stories følger Stories governance;
- [ ] quiz følger quizkontrakten;
- [ ] naturdata følger naturmapping;
- [ ] rundingspresentasjon følger bare rundingkontrakten;
- [ ] avvist/usikkert innhold er fortsatt utelatt.

## 23. CI / repository-gates

Kjør gates som faktisk eier endringene. Typiske:

- [ ] Data checks / Places gate;
- [ ] Place description governance når tekst/produksjonspakke berøres;
- [ ] People gates når People berøres;
- [ ] Stories gate når Stories berøres;
- [ ] quiz gates når quiz berøres;
- [ ] nature gates når naturdata berøres;
- [ ] round governance/tests når rundingsruntime eller presentasjon berøres;
- [ ] TypeScript/build/smoke når runtime berøres.

---

# DEL K — MERGEGATE

## 24. Ett-sted-PR

- [ ] PR-en gjelder ett place eller én eksplisitt governance-/runtimeopprydding;
- [ ] avhengige data er med bare når nødvendig for oppgaven;
- [ ] neste sted er ikke blandet inn;
- [ ] sluttdiffen har bare forventede filer;
- [ ] reviewtråder er løst;
- [ ] CI er grønn;
- [ ] head-SHA er kontrollert før merge.

---

# DEL L — ENDELIG FERDIGDEFINISJON

Et sted er **sted-produksjon ferdig** først når hvert relevant punkt er sant eller eksplisitt **N/A**:

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
- [ ] fagverk-sted.

### Tekst
- [ ] `desc` følger `PLACE_DESCRIPTION_CANONICAL`;
- [ ] `popupDesc` følger `PLACE_DESCRIPTION_CANONICAL`;
- [ ] produksjonspakke/claims/reviews/validator er ferdige.

### Popup
- [ ] Om;
- [ ] Historie;
- [ ] Fortellinger / N/A;
- [ ] Før/etter / N/A;
- [ ] Nyheter / N/A;
- [ ] Lesespor / N/A;
- [ ] Kilder;
- [ ] Mer / N/A.

### Rundinger
- [ ] `data/places/README_place_rounds.md` er lest;
- [ ] canonical profil er korrekt;
- [ ] ingen legacy rundingsregel påvirker presentasjonen;
- [ ] preview filtrerer ikke innhold;
- [ ] rundingstester/governance passerer.

### På stedet / læring
- [ ] Events / N/A;
- [ ] Møter / N/A;
- [ ] øvrige onsite-flater følger aktiv policy;
- [ ] Quiz / N/A;
- [ ] Observer / N/A;
- [ ] Notat / N/A;
- [ ] Rute / N/A.

### Relasjoner og øvrige systemer
- [ ] People;
- [ ] Brands;
- [ ] fysiske gjenstander der relevant;
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
- [ ] eventuelle unlocks/belønninger har eksplisitt eier.

### Bilder og QA
- [ ] hovedbilder;
- [ ] subsystembilder;
- [ ] lisens/attribusjon;
- [ ] data-QA;
- [ ] UI-QA;
- [ ] relevante CI-gates.

**Sluttregel:** Denne sjekklisten skal aldri bli en ny kilde til subsystemregler. Når detaljene endres, oppdateres eierkontrakten og denne filen beholder bare routing/gate.
