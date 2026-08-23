# History GO — sted-for-sted produksjonsoppskrift

Status: **canonical produksjonsarbeidsflyt**  
Eier: `place_by_place_production_workflow`  
Sist kontrollert: **2026-08-23**

Dette dokumentet er obligatorisk inngang til History GO-stedproduksjon etter **Content Factory v1**.

Content Factory er **kun en smartere research- og produksjonsmetode**. Den endrer ikke målet for et ferdig sted, reduserer ikke innholdsmengden, innfører ingen billige produksjonsnivåer og erstatter ingen eksisterende kvalitetskrav.

Den komplette sted-for-sted-checklisten som gjaldt før Content Factory er bevart **byte-identisk** i:

- **`docs/PLACE_PRODUCTION_CHECKLIST_CORE.md`**

Hele relevante CORE-checklisten er fortsatt obligatorisk for hvert Place. Denne filen legger bare reuse-, evidens- og anti-generic-regler foran den.

Maskinlesbar metodekontrakt:

- **`data/places/regler/content_factory_v1.json`**

> **Research smartere. Produser like fyldig eller bedre. Godkjenn alltid sted for sted. Ingen snarveier.**

---

# 0. Ufravikelig kvalitetsregel

Content Factory kan bare redusere **duplisert arbeid**.

Den kan redusere:

- at samme kilde finnes og leses på nytt for hvert Place;
- at samme verified claim researches på nytt for flere brukerflater;
- at samme People/Object/Brand/relation opprettes eller oppdages flere ganger;
- at samme kildekontekst sendes gjentatte ganger til en modell;
- manuelt arbeid som kan gjøres eksakt og deterministisk av scripts.

Den kan **aldri** redusere:

- hvor komplett den relevante sted-checklisten skal være;
- research som faktisk mangler for det enkelte Place;
- faktisitet og kildekritikk;
- source→claim→tekst-sporbarhet;
- stedsspesifisitet;
- redaksjonell fylde og kvalitet;
- relevante People, Objects, Brands, Stories, Quiz/Knowledge, språk, før/etter, ruter, observasjoner eller andre flater;
- subsystemenes egne canonical gates;
- manuell slutt-QA og faktisk produksjonskontroll.

Hvis delt research ikke er nok til å gjøre et Place fullt og godt etter checklisten, skal det gjøres **mer place-spesifikk research**. Kostnad er ikke en gyldig grunn til å stoppe tidlig.

---

# 1. Fullt innhold er fortsatt målet for alle Places

Det finnes ingen `anchor`/`standard`/`baseline`-modell og ingen billigere innholdsklasse.

For hvert Place gjelder:

- [ ] hele relevante CORE-checklisten vurderes;
- [ ] alle relevante flater researches;
- [ ] alt relevant, kildebærende innhold produseres så fyldig og godt som evidensen tillater;
- [ ] dersom en relevant flate er underbelagt, søkes mer evidens før den eventuelt kan markeres N/A;
- [ ] N/A brukes bare når innholdstypen faktisk er irrelevant eller ikke kan forsvares etter ordentlig research;
- [ ] antall modellkall, tokens eller researchkostnad kan aldri brukes som ferdigkriterium;
- [ ] teknisk grønt kan aldri kompensere for en synlig tynn eller generisk sluttflate.

Målet er fortsatt at hvert sted skal føles **rikt, særegent og verdt å oppsøke**.

## 1A. Språkleksikon og dialekt — eksisterende CORE-regler er fortsatt bindende

Content Factory endrer ingen språkregel. Språkleksikon skal fortsatt være kildebelagt, og dialektord og lokale uttrykk skal ikke diktes.

Dialektinnhold kan kun eies av et område-Place med canonical `placeScope: "area"`. Et enkeltsted med Språkleksikon er ikke dermed dialekt-eier og skal ikke få konstruert dialektinnhold. `coordRole` beskriver koordinatgeometri og gir aldri dialekt-eierskap.

Følgende eksisterende CORE-felt skal fortsatt fylles der de er relevante:

```text
SPRÅKLEKSIKON-STATUS:
SPRÅKLEKSIKON-TYPE — OMRÅDE / DIREKTE SPRÅKSTED / ENKELTSTED:
DIALEKTLAG — KUN `placeScope: "area"` / N/A:
DIALEKTORD/LOKALE UTTRYKK — RESEARCH OG PRODUKSJON:
```

Et enkeltsted med Språkleksikon skal ikke behandles som dialektlag; områdeeierskap, kildekrav og alle øvrige språkregler i CORE og `docs/SPRAKLEKSIKON.md` gjelder uendret.

---

# 2. Reuse-preflight — obligatorisk før ny research

Før ny research eller modellbruk:

- [ ] søk canonical place-ID, fullt navn, gamle navn og aliaser;
- [ ] søk eksisterende place production packages og source packs;
- [ ] søk eksisterende claims og kilderegistre;
- [ ] søk People, Objects, Brands, Stories, relations og ruter;
- [ ] søk relevant Fagverk-evidens og quiz production contexts;
- [ ] identifiser kilde-/historikk-/institusjons-/naturkontekst som faktisk kan deles med andre Places;
- [ ] bygg eller gjenbruk et source/evidence pack når slik deling er faglig riktig;
- [ ] list eksplisitt hvilke claims som gjelder dette Place;
- [ ] list eksplisitt hvilke checklist-punkter som fortsatt mangler place-spesifikk evidens;
- [ ] gjør deretter den ekstra researchen som trengs for å fylle disse hullene.

Reuse-preflighten skal hindre dobbeltarbeid. Den skal aldri brukes til å si «godt nok» når checklisten viser et reelt innholdsgap.

---

# 3. Researchklynger — del evidens, ikke slutttekst

Research kan organiseres i geografiske eller tematiske klynger når flere Places faktisk deler:

- historiske kilder;
- hendelser;
- institusjoner;
- People;
- Objects/Brands;
- naturlige systemer;
- ruter/korridorer;
- andre dokumenterte sammenhenger.

Eksempel:

```text
Oslo-klynge
→ felles kilder og historisk kontekst leses én gang
→ claims får eksplisitt place/entity-scope
→ hvert Place får identifisert egne evidensgap
→ place-spesifikk research fyller hullene
→ hvert Place produseres fullt etter CORE-checklisten
```

Regler:

- [ ] hver claim har kilde og locator;
- [ ] hver claim har evidence scope;
- [ ] hver claim har eksplisitt Place/entity-scope;
- [ ] områdepåstand brukes aldri automatisk som enkeltstedspåstand;
- [ ] delt kilde betyr ikke delt ferdigtekst;
- [ ] delsted brukes ikke som parent-place-bevis uten eksplisitt avgrensning;
- [ ] kildekonflikter, usikkerhet og held-back claims bevares;
- [ ] hvert Place får egen supplerende research når det er nødvendig for full checklist-dekning.

---

# 4. Claim-bank — research fakta én gang, skriv stedet individuelt

Et allerede verifisert faktum skal normalt ikke finnes på nytt.

Før ny claim opprettes:

- [ ] søk eksisterende claims/evidens;
- [ ] søk People-claims;
- [ ] søk Stories og relations;
- [ ] søk Fagverkets kilde-/claimlag;
- [ ] søk place production packages og quiz production contexts;
- [ ] gjenbruk source-ID/locator når belegget faktisk er det samme;
- [ ] opprett ny claim når nytt faktum, ny evidens eller nødvendig ny avgrensning krever det.

En claim skal minst kunne bære:

```text
CLAIM ID:
FAKTUM/PÅSTAND:
SOURCE ID:
LOCATOR:
EVIDENCE SCOPE:
PLACE/ENTITY SCOPE:
TIME SCOPE:
FRESHNESS CLASS:
REVIEW STATUS:
INFERENCE LIMIT:
```

**Viktig:** Claim-gjenbruk er ikke tekstgjenbruk. Den samme dokumenterte hendelsen kan ha betydning for flere Places, men den ferdige teksten, Story-en, observasjonen eller quizen skal utvikles ut fra hva hendelsen betyr **på akkurat dette stedet**.

---

# 5. Freshness — research det som faktisk kan ha endret seg

Bruk som arbeidsklassifisering, uten å svekke strengere subsystemregler:

- `historical_stable` — stabil historisk evidens kan gjenbrukes uten å rediscoveres hver gang;
- `institutional_periodic` — drift, eierskap, funksjon eller operatør re-verifiseres ved relevant revisjon/promotion;
- `current_volatile` — nåværende virksomhet, åpning, event, nyhet, adgang, timer osv. ferskkontrolleres før publisering;
- `source_volatile` — faktum kan være stabilt mens kilden/URL-en trenger vedlikehold.

Dette er en metode for å bruke researchtid der den gir kvalitet, ikke for å hoppe over research.

---

# 6. Modellbruk — gjenbruk kontekst, men bruk så mye resonnering kvaliteten krever

Det finnes **ingen prosentgrense eller maksgrense** for modellbruk.

Prinsippet er:

- scripts gjør arbeid som kan gjøres eksakt;
- reviewed researchkontekst gjenbrukes i stedet for å sendes inn på nytt unødvendig;
- når flere Places deler reell kontekst, kan én reasoning-pass produsere strukturerte **kandidater** per Place;
- deretter får hvert Place ekstra research, kildekritikk, skriving og review så langt kvaliteten krever;
- sterke modellkall skal brukes når de faktisk forbedrer research, syntese, Story, pedagogikk eller redaksjonell kvalitet.

Kostnadsoptimalisering skal altså komme fra **mindre repetisjon**, ikke svakere modell, færre nødvendige steg eller kortere sluttinnhold.

---

# 7. Anti-generic gate — blocking

Batching får aldri lov til å bli templatisert innholdsproduksjon.

Et Place kan ikke godkjennes dersom ett av følgende står igjen:

### 7.1 Name-swap-test

Hvis et place-authored avsnitt fortsatt er i hovedsak korrekt etter at stedsnavnet byttes med et annet sammenlignbart Place, er teksten generisk og skal omskrives eller fjernes.

### 7.2 Stedsspesifikt evidensanker

Hver substansiell synlig seksjon skal være forankret i noe som faktisk kjennetegner stedet, for eksempel:

- konkret hendelse eller tidslag;
- dokumentert person;
- objekt/verk/produksjon;
- arkitektonisk eller fysisk trekk;
- dokumentert funksjon eller bruk;
- lokal språklig egenskap;
- naturtrekk;
- eksplisitt relasjon;
- annet kildebåret stedsspesifikt forhold.

### 7.3 Cross-place duplicate-test

Place-authored tekst fra samme batch sammenlignes. Eksakte eller nære dubletter som primært varierer i navn er blocker. Canonical delt UI-tekst er selvsagt unntatt.

### 7.4 Source→claim→tekst

Distinkte faktapåstander skal kunne føres tilbake til reviewed claim/source locator eller eksplisitt canonical entity-relation.

### 7.5 Lokalopplevelsen

Manuell slutt-QA skal kunne svare konkret:

> Hva lærer, ser, forstår, sammenligner eller gjør spilleren **på dette stedet** som man ikke får fra en generisk beskrivelse av området eller kategorien?

Hvis svaret er uklart, er stedet ikke godt nok.

### 7.6 Fullness-test

Et Place kan ikke erklæres ferdig mens relevante, kildebårne People, Objects, Brands, Stories, Quiz/Knowledge, språk, historie, før/etter, ruter, observasjoner eller andre checklist-flater fortsatt er materielt underprodusert.

---

# 8. Nye obligatoriske arbeidskortfelt

Disse feltene fylles **i tillegg til hele arbeidskortet i `docs/PLACE_PRODUCTION_CHECKLIST_CORE.md`**:

```text
CONTENT FACTORY SOURCE/CLUSTER PACK:
EXISTERENDE KILDER GJENBRUKT:
EXISTERENDE CLAIMS GJENBRUKT:
EXISTERENDE PEOPLE/OBJECTS/BRANDS/STORIES/RELATIONS GJENBRUKT:
DELT KONTEXT SOM FAKTISK GJELDER DETTE PLACE:
PLACE-SPESIFIKKE EVIDENSGAP ETTER REUSE:
EKSTRA PLACE-SPESIFIKK RESEARCH GJENNOMFØRT:
FRESHNESS-KONTROLLER:
ANTI-GENERIC — NAME-SWAP:
ANTI-GENERIC — EVIDENSANKRE:
ANTI-GENERIC — CROSS-PLACE DUPLIKAT:
ANTI-GENERIC — SOURCE→CLAIM→TEKST:
ANTI-GENERIC — LOKALOPPLEVELSE:
FULLNESS — RELEVANTE CHECKLIST-FLATER FAKTISK PRODUSERT:
GENERISKE/UVISSE KANDIDATER HOLDT UTE:
```

---

# 9. Hele CORE-checklisten er fortsatt obligatorisk

Etter reuse-preflighten skal **hele relevante forløpet** i:

- **`docs/PLACE_PRODUCTION_CHECKLIST_CORE.md`**

følges uten reduksjon.

Det omfatter blant annet eksisterende krav til:

- nullmåling og saneringsplan;
- canonical identitet/source ownership;
- Politikk/Historie/Næringsliv/Subkultur-gates der relevant;
- description production package;
- alle relevante popupfaner;
- rundinger;
- People;
- Objects/Brands;
- Stories;
- Quiz/Knowledge;
- språk/dialekt;
- koordinater;
- bilder og Før/etter;
- kilder og Lesespor;
- relasjoner/ruter;
- På stedet;
- fase-for-fase review/merge;
- faktisk UI- og browserkontroll;
- manuell redaksjonell sluttvurdering.

Content Factory kan aldri overstyre et CORE-punkt med «allerede batch-produsert».

---

# 10. Batch-output er bare kandidatmateriale

Hvis flere Places får kandidater fra samme research-/reasoning-pass:

- [ ] splitt kandidatene etter canonical Place-eier;
- [ ] kjør exact- og near-duplicate-kontroll;
- [ ] kjør name-swap-test;
- [ ] kontroller stedsspesifikke evidensankre;
- [ ] kontroller source→claim→tekst;
- [ ] utfør full place-spesifikk gap-research;
- [ ] kjør hele CORE-checklisten;
- [ ] vurder stedet isolert som faktisk spilleropplevelse;
- [ ] merge/godkjenn sted for sted.

Batching reduserer altså **antall ganger vi leser samme grunnlag**, ikke antall kvalitetssteg per Place.

---

# 11. Målinger — bare for å oppdage spart dobbeltarbeid

Vi kan måle:

```text
PLACES FERDIGSTILT:
KILDER GJENBRUKT:
NYE KILDER LAGT TIL:
CLAIMS GJENBRUKT:
NYE CLAIMS:
DELTE SOURCE PACKS:
DETERMINISTISKE OPPGAVER SOM ERSTATTET REPETITIVT ARBEID:
MODELLKALL MED GJENBRUKT KONTEXT:
PLACE-SPESIFIKKE OPPFØLGINGSKALL:
GENERISKE KANDIDATER AVVIST:
MANUELL REVIEW REOPENS:
```

Men:

> **Ingen kostnad, tokenmengde, modellkall, reuse-ratio eller produksjonstakt er et ferdigkriterium.**

Et Place er ferdig fordi det er godt nok etter checklisten — aldri fordi det var billig å produsere.

---

# 12. Skalering

Metoden piloteres først i én sammenhengende Oslo-klynge.

Den skal sammenlignes med nyere sted-for-sted-produksjon på:

- innholdsfylde;
- stedsspesifisitet;
- faktisitet;
- kilde-/claim-sporbarhet;
- full checklist-dekning;
- synlig UI-kvalitet;
- manuell sluttvurdering;
- samtidig hvor mye identisk research/kontekst som slapp å gjentas.

Metoden skaleres bare dersom vi får **samme eller høyere kvalitet og fylde**, samtidig som dobbeltarbeidet faktisk faller.

Hvis kvaliteten går ned, skal metoden forbedres før videre skalering.

---

# 13. Sluttregel

```text
Gjenbruk research — aldri kvalitet.
Gjenbruk claims — aldri generisk stedstekst.
Gjenbruk canonical entiteter — aldri lag duplikater.
La scripts ta det eksakte arbeidet.
Bruk så mye place-spesifikk research og resonnering som kvaliteten krever.
Produser alt relevant innhold etter hele checklisten.
Godkjenn hvert sted som en egen rik History GO-opplevelse.
```
