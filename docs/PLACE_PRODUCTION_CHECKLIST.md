# History GO — Place Production Checklist v2

Status: **canonical produksjonsarbeidsflyt**  
Eier: `place_by_place_production_workflow`  
Sist kontrollert: **2026-08-24**

Dette dokumentet eier **arbeidsrekkefølge, review-checkpoints og mergekadens** for sted-for-sted-produksjon.

Den komplette detaljerte v1-sjekklisten er bevart byte-for-byte i:

- `docs/PLACE_PRODUCTION_CHECKLIST_REFERENCE_V1.md`

Alle faglige, redaksjonelle, faktuelle og subsystemspesifikke krav i referansen er fortsatt bindende. V2 endrer **ikke** innholdsmengde, checklist-dekning, kildekrav, fullness, own-place-regler, People/Objects/Brands/Quiz/Story-kvalitet eller manuell slutt-QA. V2 erstatter bare den gamle regelen om at hvert godkjent delsteg måtte bli en separat PR/merge.

Alle canonicale steder skal ha sin egen fungerende fagverkside. Kravet gjelder hvert sted, kan ikke settes til N/A og er en egen ferdigport. V2 endrer ikke dette kravet; den forenkler bare review- og mergekadensen.

Arbeidskortet skal eksplisitt føre `FAGVERK-STED-STATUS:`. `fagverk-sted` er aldri N/A. Sluttstatusen skal dokumentere `fagverk-sted — obligatorisk, fungerende og aldri N/A` før stedet kan godkjennes ferdig.

DIALEKTLAG — KUN `placeScope: "area"` / N/A. Dialektinnhold kan kun eies av et område-Place med `placeScope: "area"`. Et enkeltsted med Språkleksikon skal ikke diktes om til dialekteier. `coordRole` beskriver koordinatgeometri og gir aldri dialekt-eierskap. Når Språkleksikon produseres, skal minst ett reelt dialektord eller lokalt uttrykk være kildebelagt når dialektlaget er relevant; øvrige relevante dialektord og lokale uttrykk skal vurderes og kildebelegges etter språk-/dialektkontrakten.

> **Ett sted ferdig før neste. Faser reviewes sekvensielt. Mergegrenser følger reell risiko — ikke antall faser.**

---

## 1. Autoritet og detaljkrav

For detaljproduksjon gjelder subsystemets canonical kontrakt, akkurat som i v1-referansen. Blant annet:

- faktisitet: `docs/FACTUALITY_CONTRACT.md`;
- Place-data: `docs/DATA_PRODUCTION_CONTRACT.md` og `docs/PLACE_STANDARD.md`;
- `desc`/`popupDesc`: `data/places/regler/PLACE_DESCRIPTION_CANONICAL.md` og v4.2-schema;
- popupfaner: `docs/PLACE_POPUP_SYSTEM.md`;
- Språkleksikon: `docs/SPRAKLEKSIKON.md`;
- rundinger: `data/places/README_place_rounds.md`;
- People: `docs/people-of-places-method.md` og `docs/PEOPLE_PROFILE_CANONICAL.md`;
- Stories: `docs/STORIES_DATA_GOVERNANCE.md`;
- Brands: `data/brands/brand_rules_v1_1.json`;
- Quiz: `data/quiz/regler/QUIZ_PRODUCTION_CANONICAL.md`;
- koordinater: `docs/coordinates/README.md` og coordinate-kontraktene;
- relevante Fagverk-/kategori-/Natur-/Historie-/Politikk-/Næringsliv-/Subkultur-kontrakter.

For **Brands** gjelder fortsatt de eksplisitte produksjonsgrensene: aktørtype alene brukes verken som godkjenning eller avslag. Null treff i eksisterende Brand-register behandles som «må researches», ikke som N/A; N/A krever dokumentert kandidatsøk og kandidatspesifikke avvisningsgrunner.

For **Quiz** skal alle aktive, arkiverte og alternative quizfiler for stedet auditeres før profilvalg. Profil og settantall følger den canonicale Quiz-kontrakten; et `major`-sted bruker 10 sett med 7 spørsmål per sett.

`PLACE_PRODUCTION_CHECKLIST_REFERENCE_V1.md` er den detaljerte ruteren for alle disse flatene. Ingen detalj kan hoppes over fordi mergekadensen nå er enklere.

### Canonicale kvalitetslåser som fortsatt skal stå eksplisitt

Arbeidskortet bruker fortsatt feltet:

`MÅL FOR INNHOLDSRUNDINGER: 4 + separat fast Badge`

For rundinger, Før/etter og direktefaner gjelder fortsatt:

- nøyaktig fire innholdsrundinger vises i et 2 × 2-felt ved `frontImage`;
- en enkelt vilkårlig eller taksonomisk konstruert gjenstand er ikke nok til å gjøre Objects til en kvalitetsmessig ferdig runding;
- Objects og Structures/Bygg brukes ikke som to separate rundinger når innholdet i praksis er de samme fysiske stedselementene eller forskjellen er uklar for spilleren;
- Fire plasser skal aldri fylles bare for å oppnå 4+1-layouten; mangler stedet fire reelt sterke og distinkte samlinger, skal innholdet eller rundingsmodellen forbedres før sluttgodkjenning;
- canonical place-register/manifester er søkt før motivet velges, slik at bygg, virksomheter, parker, plasser eller andre delsteder med egen place-oppføring blir oppdaget;
- et delsted som har egen canonical place-oppføring brukes ikke som primært Før/etter-stedfortreder for et overordnet sted;
- bilder fra ulike kamerastandpunkter kan brukes som supplerende historiske bilder, men består ikke alene som fullverdig primær Før/etter-sammenligning;
- 2009 → 2017 erstatter ikke automatisk et eldre historisk førbilde;
- Nyheter kan ikke godkjennes som tom/N/A når fanen er relevant for stedet;
- Lesespor kan ikke godkjennes som tom/N/A når relevant lesestoff finnes eller kan etableres etter kontrakten;
- betalingslåst er ikke tilstrekkelig N/A-grunn for Lesespor;
- Innhold som tidligere lå i Mer kan ikke skjules bak en restfane for å få en manglende direktefane til å se ferdig ut.

---

## 2. Nullmåling er fortsatt obligatorisk

Før første brukerrettede endring skal stedet ha en skriftlig nullmåling og sanerings-/produksjonsplan som minst dekker:

- canonical identitet og source-eier;
- prior work og kollisjoner;
- koordinater/geometri;
- kategori, Badges, emner, Fagverk og Nature når relevant;
- description-produksjon;
- strukturerte place-profiler;
- alle relevante popupfaner og direktefaner;
- People, Objects/Works, Brands og rundinger;
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
- en popupfane som allerede har riktig canonical owner og full dekning;
- et irrelevant subsystem med dokumentert N/A.

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
- relevante People/Objects/Brands/rundinger;
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
- alle relevante faglige place-gates;
- koordinat- og bildeproveniens;
- deterministiske manifester/indekser der de eier data;
- teknisk PASS er aldri synonymt med redaksjonell ferdigstatus.

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

- åpne alle relevante popupfaner og direktefaner;
- kontroller alle valgte rundinger, antall, datakilde og bilder;
- kontroller Før/etter visuelt mot begge bilder;
- kontroller Nyheter-ferskhet der relevant;
- kontroller Lesespor-tilgang og Kilder-lenker;
- kontroller Stories/Quiz/People/Objects/Brands og ruter slik de faktisk vises;
- registrer tomme faner, svake bildevalg, kunstige samlinger og taksonomisk korrekte men brukerfiendtlige kombinasjoner som reelle blockers;
- gjenåpne checkpoint/fase når slutt-QA motsier tidligere godkjenning.

Grønn CI eller komplett schema kan aldri overstyre dokumentert svak sluttflate.

---

## 9. Forholdet til v1-referansen

`docs/PLACE_PRODUCTION_CHECKLIST_REFERENCE_V1.md` er fortsatt bindende for **hva som skal kontrolleres og hvordan subsystemene rutes**.

Følgende v1-kadensregler er uttrykkelig erstattet av dette dokumentet:

1. «hver godkjent fase merges som en liten, avgrenset PR»;
2. krav om main/live-kontroll mellom hvert enkelt internt checkpoint;
3. implisitt krav om audit-only PR for en fase som ender `ALLEREDE FERDIG` eller `BEGRUNNET N/A`;
4. arbeidskortfelt som forutsetter at forrige fase må være merget fremfor reviewet.

Alle øvrige kvalitets-, innholds-, source-, UI- og slutt-QA-krav består.

---

## Kort regel

**Review hver fase. Merge ved reelle risikogrenser. Behold full kvalitet. Ikke bruk GitHub-PR-er som fasebokføring.**
