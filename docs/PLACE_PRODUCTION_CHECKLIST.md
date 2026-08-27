# History GO — Place Production Checklist v2.2

Status: **canonical produksjonsarbeidsflyt**  
Eier: `place_by_place_production_workflow`  
Sist kontrollert: **2026-08-27**

Denne sjekklisten eier arbeidsrekkefølge, produksjonsprofil, review-checkpoints og mergekadens for ordinær sted-for-sted-produksjon.

Detaljkravene fra tidligere full checklist består gjennom:

- `docs/PLACE_PRODUCTION_CHECKLIST_REFERENCE_V1.md`

Produksjonsprofil og innholdsplan eies av:

- `docs/PLACE_PRODUCTION_PROFILES.md`

Micro Places følger:

- `docs/MICRO_PLACE_CONTRACT.md`

> **Hovedregel:** Alle ordinære Places har samme harde canonical core. Ulike steder får deretter bare de People, Objects, Brands, Structures/related/productions, Stories, Før/etter, Nyheter, Lesespor og øvrige moduler som faktisk passer stedet og kan dokumenteres. Et lettere sted er smalere ferdig — aldri halvferdig.

---

## 1. Før produksjon: kategori, profil og innholdsplan

Tre beslutninger skal gjøres eksplisitt og holdes fra hverandre:

1. `category` — faglig stedskategori;
2. `production_profile` — `major`, `standard`, `focused` eller `micro`;
3. `INNHOLDSPLAN` — hvilke konkrete subsystemer og PlaceCard-samlinger som skal produseres for akkurat dette stedet.

Kategori bestemmer hvilke kandidater som undersøkes først. Den bestemmer **ikke** at alle slike kandidater må materialiseres.

Eksempler:

- `naeringsliv` betyr ikke automatisk Brand;
- `historie` betyr ikke automatisk People;
- `natur` betyr ikke automatisk både Flora og Fauna;
- én fysisk enhet skal ikke splittes kunstig til både Object og Structure;
- chronology skal ikke kopieres til en svak Story bare for å fylle Stories.

### Produksjonsprofiler

- **major** — bredt, betydelig sted med flere selvstendige kildebårne spor;
- **standard** — full ordinær stedsopplevelse og hovedprofilen for de fleste steder;
- **focused** — canonical Place med reelt smalere stoffbredde;
- **micro** — følger egen Micro Place-kontrakt.

`focused` er aldri en kostnadssnarvei. Profilen skal begrunnes i faktisk scope og kilder.

---

## 2. Universal canonical core — obligatorisk for alle ordinære Places

For `major`, `standard` og `focused` kan følgende aldri settes profil-N/A:

- sikker canonical identitet og own-place-grense;
- verifisert koordinat/geometri med ærlig `coordRole`;
- inspiserbare kilder og factuality/source → claim-disiplin;
- korrekt `desc` og `popupDesc`;
- riktig kategori, relevante emner og fungerende stedsspesifikk Fagverk-side;
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

## 3. Betingede subsystemer — vurder alltid, produser når de passer

Følgende skal auditeres for relevans og source-dekning:

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

Gyldige sluttstatus for en betinget modul er:

```text
PASS
BEGRUNNET N/A
BLOCKED
```

`BEGRUNNET N/A` betyr at modulen etter korrekt research ikke hører til stedet. Det betyr ikke «gjør senere», og det skal ikke etterlate et tomt PlaceCard-kort.

**Ingen filler:** Det er forbudt å opprette en perifer person, et tilfeldig objekt, et konstruert Brand, en duplisert Structure, en svak Story eller quizspørsmål bare for å møte en kvote eller layout.

---

## 4. PlaceCard — alltid pent og stedstilpasset

Canonical samlingskontrakt: `data/places/README_place_rounds.md`.

For nye og fullproduserte ordinære Places gjelder:

- `place_card_profile.collection_ids` inneholder **1–4 ferdige, relevante samlinger**;
- hver valgt samling har minst ett ekte canonical medlem;
- hver valgt samling har et validert, lastbart previewbilde av et medlem;
- ikke-relevante eller source-tomme samlinger utelates fra `collection_ids`;
- **ingen tomme PlaceCard-kort er tillatt ved closeout**;
- 1 samling vises stor og sentrert;
- 2 samlinger vises som et balansert par;
- 3 samlinger bruker en balansert 2+1-komposisjon;
- 4 samlinger bruker 2×2;
- People/Flora/Fauna beholder sirkelform; øvrige samlinger er avrundede rektangler;
- `frontImage` er den stående hovedflaten og kan aldri brukes som falskt samlingspreview;
- gamle Places uten ny eksplisitt profil beholder kompatibilitetsvisningen til de faktisk fullproduseres/revideres.

Slutt-QA skal eksplisitt vurdere at kortet ser **pent, tilsiktet, balansert og komplett for akkurat denne typen sted** ut på mobil og desktop.

Et valgt samlingskort uten entity eller bilde er BLOCKED. Løsningen er enten å ferdigstille den reelle samlingen eller å fjerne den fra `collection_ids` når research viser at samlingen ikke hører til stedet — aldri å la et tomt kort stå igjen.

---

## 5. Fagverk-sted — obligatorisk

Alle ordinære canonical Places skal ha fungerende stedsspesifikk Fagverk-side.

Arbeidskortet skal føre:

```text
FAGVERK-STED-STATUS:
```

`fagverk-sted` er aldri N/A for et ordinært Place.

---

## 6. Språkleksikon og dialekt

**SPRÅKLEKSIKON — ALLE ORDINÆRE PLACES / ALDRI N/A**

Alle ordinære canonical Places skal researches for og materialisere minst ett reelt stedsspesifikt språkspor. Dette kan være:

- stedsnavn/navnehistorie;
- historisk betegnelse;
- funksjons-/fagbegrep med dokumentert stedskobling;
- lokalt uttrykk eller annen kildebundet språkbruk.

Generelle fagord uten stedskobling brukes ikke som filler.

**DIALEKTLAG — KUN `placeScope: "area"` / N/A**

Dialekt er et separat area-eid lag. Et enkeltsted skal ikke konstrueres til dialekteier. Fravær av dialekt betyr aldri fravær av obligatorisk Språkleksikon.

---

## 7. Kronologi og epoker

**KRONOLOGI/EPOKE — ALLE ORDINÆRE PLACES / RESEARCH ALDRI N/A**

Kronologi produseres samtidig med stedet, ikke som senere gaparbeid.

- research identitetsbærende hendelser som etablering, bygging/åpning, funksjonsskifte, utvidelse, ombruk, nedleggelse og andre reelle vendepunkter;
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

People produseres bare når canonical personer har dokumentert direkte relevans for stedet. En perifer person skal ikke produseres for å fylle kortet.

Canonical metode:

- `docs/people-of-places-method.md`;
- `docs/PEOPLE_PROFILE_CANONICAL.md`.

### Objects

Objects skal være fysiske, identifiserbare gjenstander med dokumentert stedstilknytning. Observasjonstekst eller et bygg gjøres ikke om til Object for å øke antallet.

`Spor og objekter` / `Legg merke til` kan være eide underseksjoner i Objects-popupen uten å bli egne samlinger.

### Brands

`data/brands/brand_rules_v1_1.json` er canonical Brand-eier.

Null treff i eksisterende register betyr «må researches», ikke automatisk N/A. Etter faktisk kandidatsøk kan Brands ende `BEGRUNNET N/A` dersom ingen kandidat består definisjonen.

Et virksomhetsnavn, stedsnavn, prosjektaktør eller skilt blir aldri Brand bare fordi PlaceCard ellers ville hatt færre samlinger.

---

## 9. Stories

Stories følger `docs/STORIES_DATA_GOVERNANCE.md`.

En ny Story skal ha en selvstendig narrativ akse — konflikt, valg, overraskelse, forvandling eller annet som gir mer enn chronology.

Anti-dupliseringsregel:

> Hvis datoen fjernes, må det fortsatt finnes en tydelig fortelling.

Hvis ikke, hører stoffet i chronology/leksikon i stedet. Et Focused Place kan derfor være komplett uten Story når kildene ikke bærer en ekte fortelling.

---

## 10. Quiz

Quiz følger bare `data/quiz/regler/QUIZ_PRODUCTION_CANONICAL.md`.

Eksisterende aktive, arkiverte og alternative quizfiler auditeres før profilvalg.

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

Produseres når det finnes en meningsfull, stedstro historisk sammenligning.

- ulike tilfeldige kamerastandpunkter er ikke nok;
- et separat canonical delsted skal ikke brukes som proxy;
- et nyere bildepar erstatter ikke automatisk et eldre, mer historisk relevant førbilde;
- hvis kildene ikke bærer en god sammenligning, settes modulen `BEGRUNNET N/A` og vises ikke som tomt innhold.

### Nyheter

Produseres når en reell nyhetsflate er relevant. Et sted uten meningsfull aktuell nyhetsflate kan etter audit være `BEGRUNNET N/A`.

### Lesespor

Relevante, tilgjengelige lesespor skal produseres. Betalingsmur alene er ikke N/A-grunn. Hvis et dokumentert kandidatsøk faktisk ikke finner et kvalifisert spor, kan modulen ende `BEGRUNNET N/A`.

---

## 12. Katalogtriage før videre ordinær produksjon

Vi bruker en hybridmodell, ikke full research av hele katalogen først.

### Stage A — provisional triage

Eksisterende katalog får en lett klassifisering basert på eksisterende canonical data:

```text
production_profile: major | standard | focused | micro
profile_status: provisional
profile_reason: <kort grunn>
```

Dette produserer ikke innhold. Formålet er realistisk backlog, prioritering og klyngeplan.

### Stage B — confirmed preflight

Når et sted faktisk går inn i produksjon, bekreftes eller overstyres profilen etter ekte source review:

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

- produksjonsprofil og profilbegrunnelse;
- canonical identitet og source-eier;
- prior work/kollisjoner;
- koordinater/geometri;
- kategori, emner og Fagverk;
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
PRODUKSJONSPROFIL: major | standard | focused
PROFILSTATUS: provisional | confirmed
PROFILBEGRUNNELSE:
PROFILENDRING FRA TRIAGE:
UNIVERSAL CORE STATUS:
INNHOLDSPLAN:
  People: PRODUSER | N/A + grunn
  Objects: PRODUSER | N/A + grunn
  Brands: PRODUSER | N/A + grunn
  Category collection: PRODUSER | N/A + grunn
  Stories: PRODUSER | N/A + grunn
  Før/etter: PRODUSER | N/A + grunn
  Nyheter: PRODUSER | N/A + grunn
  Lesespor: PRODUSER | N/A + grunn
PLACECARD-SAMLINGER: <1–4 ferdige IDs>
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

- profil og innholdsplan;
- identity/source boundary;
- koordinater;
- shared source/claim pack;
- category/Fagverk-eierskap.

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

Separat system-PR brukes når runtime/schema/generell kontrakt endres eller blast radius er bred. Denne produksjonsprofilendringen er nettopp en slik systemendring og skal være merget før Alunverket produseres etter den nye modellen.

---

## 16. Branch truth

Arbeidskort skal skille:

```text
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

PlaceCard-systemendringer skal ha permanente tester for:

- schema 1–4;
- ingen `images`/Badges som samlinger;
- legacy fallback;
- adaptiv 1/2/3/4-layout;
- ingen synlige tomme samlingskort for eksplisitt kuraterte profiler;
- faktisk preview fra medlem;
- fortsatt korrekt Micro-/underkategori-unntak.

---

## 18. Manuell slutt-QA — hard gate

Et ordinært sted kan ikke merkes `SLUTTFØRT` før hele opplevelsen er vurdert mot bekreftet profil og innholdsplan.

Minimum:

- bekreft `PROFILSTATUS: confirmed`;
- bekreft Universal canonical core;
- åpne alle relevante popupfaner;
- kontroller obligatorisk Språk;
- kontroller chronology/epokeviser;
- kontroller People/Objects/Brands/related-eierskap;
- kontroller Før/etter, Nyheter og Lesespor når de er valgt i innholdsplanen;
- kontroller Quiz og Stories mot sine egne kontrakter;
- kontroller `frontImage` som ekte stående fil;
- kontroller hver valgt PlaceCard-samling og dens popup;
- kontroller at ingen valgt samling står tom eller mangler bilde;
- kontroller at 1/2/3/4-layouten ser god ut på mobil og desktop;
- kontroller at et sted med færre samlinger ser **kuratert og komplett**, ikke «manglende», ut;
- gjenåpne produksjonen dersom slutt-QA motsier tidligere checkpoint.

Grønn CI kan aldri overstyre et dokumentert stygt, kunstig eller ufullstendig PlaceCard.

---

## 19. Forholdet til v1-referansen

`docs/PLACE_PRODUCTION_CHECKLIST_REFERENCE_V1.md` er fortsatt detaljruter for research og subsystemkvalitet, med disse aktive overstyringene:

1. merge mellom hver fase er ikke nødvendig;
2. Språkleksikon er obligatorisk for alle ordinære Places;
3. chronology/epoke research skjer samtidig med full stedsproduksjon;
4. produksjonsprofil bestemmer forventet bredde;
5. alle betingede subsystemer vurderes, men bare relevante subsystemer materialiseres;
6. filler for å nå felttall/fullness er forbudt;
7. PlaceCard for nye/fullproduserte ordinære Places viser 1–4 **ferdige** samlinger — aldri tomme reserver;
8. stedsprofil og Quiz-profil er separate beslutninger.

Ved konflikt med eldre formulering om fast firefelts-fullness, universell Brands/People/Objects-plikt eller obligatorisk materialisering av et irrelevant subsystem gjelder denne v2.2-sjekklisten.

---

## Kort regel

**Triage katalogen lett. Bekreft profil og innholdsplan i preflight. Behold samme harde canonical core. Produser bare moduler som faktisk passer stedet — men produser dem helt. PlaceCard viser 1–4 ferdige samlinger og skal alltid se pent, balansert og komplett ut. Ingen filler. Ingen tomme kort.**
