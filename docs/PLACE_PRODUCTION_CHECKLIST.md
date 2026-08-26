# History GO — Place Production Checklist v2

Status: **canonical produksjonsarbeidsflyt**  
Eier: `place_by_place_production_workflow`  
Sist kontrollert: **2026-08-25**

> **Micro Place-unntak:** Denne fullproduksjonschecklisten gjelder ordinære
> Places. Steder med `placeTier: "micro"` følger den reduserte, men fortsatt
> kilde- og identitetsstrenge kontrakten i `docs/MICRO_PLACE_CONTRACT.md`. De skal
> ikke fylles med People, Stories, Quiz, språkpakker, Fagverk eller fire
> PlaceCard-samlinger bare for å bestå en fullhetsregel. Bilder er valgfrie for
> denne tieren, men valideres ordinært dersom de oppgis. Universelle
> fullproduksjonskrav nedenfor gjelder standardsteder med mindre Micro
> Place-kontrakten uttrykkelig krever noe annet.

Dette dokumentet eier **arbeidsrekkefølge, review-checkpoints og mergekadens** for sted-for-sted-produksjon.

Den komplette detaljerte sjekklisten er bevart og kontraktsoppdatert i:

- `docs/PLACE_PRODUCTION_CHECKLIST_REFERENCE_V1.md`

Alle faglige, redaksjonelle, faktuelle og subsystemspesifikke krav i referansen er fortsatt bindende. V2 endrer **ikke** innholdsmengde, checklist-dekning, kildekrav, fullness, own-place-regler, People/Objects/Brands/Quiz/Story-kvalitet eller manuell slutt-QA. V2 erstatter bare den gamle regelen om at hvert godkjent delsteg måtte bli en separat PR/merge.

Alle canonicale steder skal ha sin egen fungerende fagverkside. Kravet gjelder hvert sted, kan ikke settes til N/A og er en egen ferdigport. V2 endrer ikke dette kravet; den forenkler bare review- og mergekadensen.

Arbeidskortet skal eksplisitt føre `FAGVERK-STED-STATUS:`. `fagverk-sted` er aldri N/A. Sluttstatusen skal dokumentere `fagverk-sted — obligatorisk, fungerende og aldri N/A` før stedet kan godkjennes ferdig.

**SPRÅKLEKSIKON — ALLTID / ALDRI N/A.** Alle canonicale steder har stedsspesifikke navn og begreper som skal researches og materialiseres i Språkleksikonet. Et fullprodusert sted kan ikke ha null språkoppføringer eller mangle Språk-fanen. Manglende legacy-data er et produksjonsgap, ikke N/A.

**DIALEKTLAG — KUN `placeScope: "area"` / N/A.** Dialekt er et separat underlag og er ikke synonymt med Språkleksikon. Dialektinnhold kan kun eies av et område-Place med `placeScope: "area"`. Et enkeltsted skal ikke diktes om til dialekteier. `coordRole` beskriver koordinatgeometri og gir aldri dialekt-eierskap. Når dialektlaget researches på et område-Place, skal minst ett reelt dialektord eller lokalt uttrykk produseres når kildene bærer det; dersom kildene ikke bærer et forsvarlig dialektfunn kan **dialektdeljobben** settes begrunnet N/A/holdback. Språkleksikonet som helhet kan aldri settes N/A.

> **Ett sted ferdig før neste. Faser reviewes sekvensielt. Mergegrenser følger reell risiko — ikke antall faser.**

---

## 1. Autoritet og detaljkrav

For detaljproduksjon gjelder subsystemets canonical kontrakt, akkurat som i v1-referansen. Blant annet:

- faktisitet: `docs/FACTUALITY_CONTRACT.md`;
- Place-data: `docs/DATA_PRODUCTION_CONTRACT.md` og `docs/PLACE_STANDARD.md`;
- `desc`/`popupDesc`: `data/places/regler/PLACE_DESCRIPTION_CANONICAL.md` og v4.2-schema;
- popupfaner og eierstyrt routing: `docs/PLACE_POPUP_SYSTEM.md`;
- Språkleksikon: `docs/SPRAKLEKSIKON.md`;
- PlaceCard-samlinger og samlingspopuper: `data/places/README_place_rounds.md`;
- People: `docs/people-of-places-method.md` og `docs/PEOPLE_PROFILE_CANONICAL.md`;
- Brands: `data/brands/brand_rules_v1_1.json`;
- Stories: `docs/STORIES_DATA_GOVERNANCE.md`;
- Brands: `data/brands/brand_rules_v1_1.json`;
- Quiz: `data/quiz/regler/QUIZ_PRODUCTION_CANONICAL.md`;
- koordinater: `docs/coordinates/README.md` og coordinate-kontraktene;
- relevante Fagverk-/kategori-/Natur-/Historie-/Politikk-/Næringsliv-/Subkultur-kontrakter.

For **Brands** gjelder fortsatt de eksplisitte produksjonsgrensene: aktørtype alene brukes verken som godkjenning eller avslag. Null treff i eksisterende Brand-register behandles som «må researches», ikke som N/A; N/A krever dokumentert kandidatsøk og kandidatspesifikke avvisningsgrunner.

For **Quiz** skal alle aktive, arkiverte og alternative quizfiler for stedet auditeres før profilvalg. Profil og settantall følger den canonicale Quiz-kontrakten; et `major`-sted bruker 10 sett med 7 spørsmål per sett.

For **Språk** gjelder en egen absolutt ferdigport: alle steder skal ha en canonical Språkleksikon-eier og minst én reell, stedsspesifikk språkoppføring. Dette kan være et dokumentert stedsnavn/navnespor, et relevant fagord/begrep, en historisk betegnelse, et lokalt uttrykk eller annen kildebundet språkbruk. Det er ikke et krav at stedet har dialekt.

`PLACE_PRODUCTION_CHECKLIST_REFERENCE_V1.md` er den detaljerte ruteren for alle disse flatene. Ingen detalj kan hoppes over fordi mergekadensen nå er enklere. Der eldre referansetekst omtaler Språk som «valgfri», «når relevant» eller åpner for null språkoppføringer, er denne aktive v2-regelen autoritativ: **Språk er relevant for alle Places; bare dialektlaget kan være N/A.**

### Canonicale kvalitetslåser som fortsatt skal stå eksplisitt

Arbeidskortet bruker nå feltet:

`MÅL FOR PLACECARD-SAMLINGER: alltid fire flater i fast kategori-komposisjon + separat fast Badge + obligatorisk Quiz`

For PlaceCard-samlinger, Før/etter og eierstyrte popupflater gjelder:

- PlaceCard beholder dagens komposisjon og viser alltid nøyaktig fire samlingsflater i et fullt 2 × 2-felt ved `frontImage`;
- People, Flora og Fauna vises som sirkler; øvrige samlinger vises som avrundede rektangler;
- Bilder er ikke en samling eller reserve, men beholdes i `frontImage`-/medieflaten og hos sine bildeeiere;
- Quiz er obligatorisk og beholdes som tydelig PlaceCard-handling;
- en enkelt vilkårlig eller taksonomisk konstruert gjenstand er ikke nok til å gjøre Objects til en kvalitetsmessig ferdig samling;
- Objects og Structures/Bygg brukes ikke som to separate samlinger når innholdet i praksis er de samme fysiske stedselementene eller forskjellen er uklar for spilleren;
- de fire faste flatene skal researches og fylles med reelt, stedsspesifikt innhold når slikt kan forsvares; en svak eller tom canonical kilde kollapser aldri layouten, men vises som en ærlig ikon-/statusflate uten oppdiktet innhold eller synlig falsk 0, og registreres som produksjonsgap;
- nye/fullproduserte steder bruker `place_card_profile.collection_ids`; eksisterende `round_profile` leses bare gjennom kompatibilitetslaget og migreres når stedet faktisk fullproduseres;
- **Objects-popupen** eier `Spor og objekter` og `Legg merke til` når innholdet beskriver dokumenterte fysiske gjenstander/spor; supplementene endrer ikke Objects-antallet uten canonical Objects-materialisering;
- **People-popupen** eier personrelasjoner; en ren place→place-relasjon skal ikke inn i People;
- **Relaterte steder (`related`)** eier dokumenterte place→place-relasjoner;
- **Om** eier `Betydning`, `Motpunkter` og generell source-eid stedskunnskap/observasjonskunnskap når ingen smalere canonical eier finnes;
- **Språk** er en fast obligatorisk stedspopupfane på alle canonicale steder; fullproduksjon krever reelle, stedsspesifikke begreper/navnespor og Språk kan aldri være N/A;
- **Dialekt** er ikke obligatorisk for alle steder og skal aldri konstrueres for å fylle Språk-fanen;
- canonical place-register/manifester er søkt før motivet velges, slik at bygg, virksomheter, parker, plasser eller andre delsteder med egen place-oppføring blir oppdaget;
- et delsted som har egen canonical place-oppføring brukes ikke som primært Før/etter-stedfortreder for et overordnet sted;
- bilder fra ulike kamerastandpunkter kan brukes som supplerende historiske bilder, men består ikke alene som fullverdig primær Før/etter-sammenligning;
- 2009 → 2017 erstatter ikke automatisk et eldre historisk førbilde;
- Nyheter kan ikke godkjennes som tom/N/A når fanen er relevant for stedet;
- Lesespor kan ikke godkjennes som tom/N/A når relevant lesestoff finnes eller kan etableres etter kontrakten;
- betalingslåst er ikke tilstrekkelig N/A-grunn for Lesespor;
- innhold som tidligere lå i `Mer` skal rutes til canonical eierflate uten å slettes, dupliseres eller skjules bak `Mer`, «Annet», «Tillegg» eller en ny generell restfane.

---

## 2. Nullmåling er fortsatt obligatorisk

Før første brukerrettede endring skal stedet ha en skriftlig nullmåling og sanerings-/produksjonsplan som minst dekker:

- canonical identitet og source-eier;
- prior work og kollisjoner;
- koordinater/geometri;
- kategori, Badges, emner, Fagverk og Nature når relevant;
- description-produksjon;
- strukturerte place-profiler;
- alle åtte faste popupfaner, inkludert obligatorisk Språk, samt eierflater i Objects/People/Relaterte steder/Om;
- Språkleksikon-eier, eksisterende begreper/navnespor og eventuelt separat dialektlag;
- People, Objects/Works, Brands og PlaceCard-samlinger;
- Stories, Quiz, Knowledge/Aha, Lesespor og ruter/relasjoner;
- kilder, bilder/proveniens og faktisk UI-visning;
- relevante fagspesifikke place-gates.

Nullmålingen kan ligge i samme PR som senere research/preflight-checkpoints. Det kreves **ikke** en egen nullmålings-PR dersom ingen risikogrense krysses.

---

## 3. Faser er review-checkpoints, ikke PR-er

Produksjonen følger fortsatt faserekkefølgen og bare én fase kan være aktiv om gangen:

```text
IKKE STARTET → PÅGÅR → KLAR FOR REVIEW → GODKJENT / BEGRUNNET N/A
```

Før neste fase starter skal aktiv fase være reviewet og arbeidskortet oppdatert. Reviewet skal vise:

- hva som ble kontrollert;
- hvilke canonical filer som eier resultatet;
- hvilke eksisterende data som ble bevart;
- hvilke claims/kilder som støtter nye data;
- hvilke relevante tester/auditer som passerte;
- eventuelle blockers, held-back claims og N/A-begrunnelser.

**Et checkpoint kan godkjennes på samme arbeidsgren. Det trenger ikke en egen PR eller merge.**

### Faser som allerede er ferdige

Hvis prior-work-gaten viser `ALLEREDE FERDIG`, `BEHOLD` eller `BEGRUNNET N/A`, registreres beslutningen i arbeidskort/review og produksjonen går videre. Det skal normalt **ikke** opprettes en audit-only PR bare for å dokumentere at ingen canonical endring var nødvendig.

Eksempler:

- verifiserte koordinater som skal bevares;
- riktig kategori/emne/Fagverk-binding som allerede finnes;
- en popup-/samlingsflate som allerede har riktig canonical owner og full dekning;
- et irrelevant subsystem med dokumentert N/A.

Språk er ikke et irrelevant subsystem for et canonical Place. Bare dialektdeljobben kan ende begrunnet N/A.

---

## 4. Mergegrenser følger risiko

Standardmålet er **2–4 fokuserte PR-er for et komplett sted**, ikke én PR per fase og heller ikke én enorm ureviewet slutt-PR.

En typisk produksjon kan bruke disse mergegrensene:

### A. Preflight / evidence

Kan samle flere ferdigreviewede checkpoints, for eksempel:

- nullmåling;
- canonical identity/source boundary;
- shared source/claim pack;
- coordinate prior-work;
- category/Fagverk/Nature ownership.

Audit-only checkpoints som ikke muterer canonical data kan også forbli i samme senere innholds-PR dersom det er ryddigere.

### B. Canonical brukerinnhold

Kan samle flere **sekvensielt reviewede** innholdsfaser, for eksempel:

- description v4.2;
- strukturerte place-profiler;
- Om/Historie/Fortellinger/Før–etter/Nyheter/Lesespor/Kilder/Språk;
- obligatoriske Språkleksikon-begreper/navnespor og eventuelt separat dialektlag;
- relevante People/Objects/Brands/PlaceCard-samlinger og eide underseksjoner;
- Quiz/Story/Knowledge/ruter når kontraktene tillater samme avgrensede diff.

Det er ikke lov å hoppe over intern review bare fordi fasene ligger i samme PR.

### C. Integrasjon / slutt-QA

Brukes når det er behov for en egen sluttgrense for:

- genererte indekser/manifester;
- bred integrasjon;
- faktisk popup-/runde-/rute-QA;
- final completion report og produksjonsklar-status.

### Når egen PR fortsatt er riktig

Lag en separat PR når minst én av disse gjelder:

- runtime-, schema-, migrasjons- eller generell engine-endring;
- en endring har stor cross-subsystem blast radius;
- en separat canonical entity må gjennom sin egen kontrakt før stedet kan fortsette;
- en blocker må repareres uten å blande innholdsendringen inn i reparasjonen;
- en merge er nødvendig for å etablere en ny permanent kontrakt som senere checkpoints faktisk avhenger av.

**PR-grensen skal forklare en risikogrense. «Ny fase» alene er ikke en risikogrunn.**

---

## 5. Branch truth og publiseringsstatus

Det er tillatt å ha flere **godkjente checkpoints** på samme arbeidsgren. Det er ikke tillatt å rapportere dem som live/merget før merge faktisk har skjedd.

Arbeidskortet skal skille mellom:

```text
AKTIV FASE:
SISTE GODKJENTE CHECKPOINT:
AKTIVT FILSCOPE:
AKTIV MERGEGRENSE: preflight / canonical_content / integration / særskilt
BRANCH STATUS: lokal / pushet / PR / merget
LIVE STATUS: ikke live / live på main
NESTE FASE:
```

Den gamle v1-feltteksten `FORRIGE FASE MERGET OG LIVE-KONTROLLERT` skal fra v2 forstås slik:

- **checkpoint-review er obligatorisk før neste fase**;
- merge/live-kontroll er obligatorisk **ved valgt mergegrense og før sluttgodkjenning**, ikke mellom hvert internt checkpoint.

---

## 6. Kvalitetskrav som ikke endres

V2 skal aldri brukes til å begrunne kortere, mer generisk eller mindre kildebundet stedsinnhold.

Fortsatt obligatorisk:

- full checklist-dekning;
- source → claim → text der kontrakten krever det;
- place-specific tekst og local-experience-kvalitet;
- ingen filler for å tilfredsstille felttall;
- own-place og entity-grenser;
- alle relevante People/Objects/Brands/Stories/Quiz-/runde-kontrakter;
- obligatorisk Språkleksikon på alle Places, med reelle begreper/navnespor og uten konstruert dialekt;
- alle relevante faglige place-gates;
- koordinat- og bildeproveniens;
- deterministiske manifester/indekser der de eier data;
- teknisk PASS er aldri synonymt med redaksjonell ferdigstatus.

### Bindende detaljankere fra v1

Disse ankerreglene gjentas her fordi permanente governance-tester og produksjonsreview skal kunne lese dem direkte fra den aktive sjekklisten. De endrer ikke v2-mergekadensen.

#### Språkleksikon og dialekt

**SPRÅKLEKSIKON — ALLE PLACES / ALDRI N/A**

Alle canonicale steder skal researches for og materialisere reelle, stedsspesifikke språkoppføringer. Relevante kandidater er blant annet stedsnavn/navnehistorie, fagord, funksjonsbegreper, historiske betegnelser og dokumenterte lokale uttrykk. Null eksisterende språkdata betyr «må produseres», ikke N/A. Generelle fagord uten dokumentert stedskobling skal ikke brukes som filler.

**DIALEKTLAG — KUN `placeScope: "area"` / N/A**

Dialektinnhold kan kun eies av et område-Place med `placeScope: "area"`. `coordRole` beskriver bare koordinatgeometri og gir aldri dialekt-eierskap. Et enkeltsted skal ha Språkleksikon, men ikke et konstruert dialektlag. Når området faktisk kan eie dialekt, researches dialektord og lokale uttrykk; dialekt skal ikke diktes for å fylle en flate. Når kildene ikke bærer et forsvarlig dialektfunn kan dialektdeljobben settes begrunnet N/A/holdback, mens Språkleksikonet fortsatt må ferdigstilles.

#### Brands

`data/brands/brand_rules_v1_1.json` er canonical semantisk eier for Brand-vurderingen. aktørtype alene brukes verken som godkjenning eller avslag. Null treff i eksisterende brandregister behandles som «må researches», ikke som N/A. Brands kan først settes N/A etter reelt kandidatsøk og dokumenterte kandidatspesifikke avvisningsgrunner.

#### Quiz

Eksisterende quiz skal auditeres før profilvalg, og auditen skal omfatte alle aktive, arkiverte og alternative quizfiler. Profil og settantall skal velges eksplisitt etter canonical Quiz-kontrakt; et `major`-sted bruker 10 sett. Eksisterende gode spørsmål skal bevares, og `profile_hint` er ikke alene autoritet til å velge profil.

---

## 7. CI og validering

Kjør relevante gates når deres eide flate endres. Ikke bruk urelaterte brede gates som erstatning for presise kvalitetskontroller.

På en flercheckpoint-PR skal hver canonical endring fortsatt være beskyttet av sin relevante permanente test/audit. Final PR-head skal være grønn før merge.

Main-/produksjonskontroll gjøres:

- etter hver **reell mergegrense** der synlig produkt er endret;
- alltid etter siste mergegrense før stedet kan merkes sluttført;
- på nytt dersom manuell slutt-QA finner et avvik.

Det kreves ikke main/live-runde etter en audit-only intern checkpoint som ikke er merget og ikke hevdes publisert.

---

## 8. Manuell sluttvurdering er fortsatt en hard gate

Et sted kan ikke merkes `produksjonsklart` eller `SLUTTFØRT` før den synlige opplevelsen er vurdert som helhet.

Minimum:

- åpne alle åtte faste faner, inkludert Språk;
- kontroller at Språk viser reelle, stedsspesifikke oppføringer og ikke står i produksjonsgap-tilstand;
- kontroller at eventuelt dialektinnhold har riktig `placeScope: "area"`-eier, og at fravær av dialekt ikke behandles som fravær av språk;
- åpne Objects-popupen og kontroller eventuelle `Spor og objekter`/`Legg merke til`-seksjoner;
- åpne People-popupen og kontroller personrelasjoner når de finnes;
- kontroller at place→place-relasjoner ligger i Relaterte steder og ikke i People;
- kontroller at Betydning/Motpunkter/generell stedskunnskap ligger under Om eller annen dokumentert eierflate;
- kontroller alle valgte PlaceCard-samlinger, form, antall, datakilde og preview;
- kontroller Før/etter visuelt mot begge bilder;
- kontroller Nyheter-ferskhet der relevant;
- kontroller Lesespor-tilgang og Kilder-lenker;
- kontroller Stories/obligatorisk Quiz/People/Objects/Brands og ruter slik de faktisk vises;
- registrer tomme eller feilroutede flater, svake bildevalg, kunstige PlaceCard-samlinger og taksonomisk korrekte men brukerfiendtlige kombinasjoner som reelle blockers;
- gjenåpne checkpoint/fase når slutt-QA motsier tidligere godkjenning.

Grønn CI eller komplett schema kan aldri overstyre dokumentert svak sluttflate.

---

## 9. Forholdet til v1-referansen

`docs/PLACE_PRODUCTION_CHECKLIST_REFERENCE_V1.md` er fortsatt bindende for **hva som skal kontrolleres og hvordan subsystemene rutes**, med de eksplisitte v2-overstyringene nedenfor.

Følgende v1-regler/ordlyder er uttrykkelig erstattet av dette dokumentet:

1. «hver godkjent fase merges som en liten, avgrenset PR»;
2. krav om main/live-kontroll mellom hvert enkelt internt checkpoint;
3. implisitt krav om audit-only PR for en fase som ender `ALLEREDE FERDIG` eller `BEGRUNNET N/A`;
4. arbeidskortfelt som forutsetter at forrige fase må være merget fremfor reviewet;
5. enhver formulering som gjør Språk/Språkleksikon valgfritt, «når relevant» eller tillater null språkoppføringer som godkjent sluttstatus.

Alle øvrige kvalitets-, innholds-, source-, UI- og slutt-QA-krav består. Dialektreglene i referansen består også: dialektlaget er et separat area-eid underlag og kan være begrunnet N/A uten at Språkleksikonet blir N/A.

---

## Kort regel

**Review hver fase. Merge ved reelle risikogrenser. Behold full kvalitet. Alle Places har Språk; bare dialekt kan mangle. Ikke bruk GitHub-PR-er som fasebokføring.**
