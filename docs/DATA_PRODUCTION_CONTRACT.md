# History GO — dataproduksjonskontrakt

Status: **canonical data-production contract**
Eier: History GO data/runtime
Sist kontrollert: **2026-07-28**

Dette dokumentet definerer hvordan nye eller vesentlig endrede History GO-data skal produseres, kontrolleres og settes inn uten å bryte kategori-, place-, people-, badge-, progresjons-, kilde- eller manifestlogikk.

For full sted-for-sted arbeidsrekkefølge brukes:

- `docs/PLACE_PRODUCTION_CHECKLIST.md`

Relaterte kontrakter:

- `docs/FACTUALITY_CONTRACT.md`
- `docs/DOMAIN_CONTRACT.md`
- `data/categories/category_contract.json`
- `docs/SUBJECT_FILE_CONTRACT.md`
- `docs/FAGVERK_SUBJECT_PAGE_CONTRACT.md`
- `docs/PLACE_STANDARD.md`
- `docs/PLACE_POPUP_SYSTEM.md`
- `data/places/README_place_rounds.md`
- `docs/people-of-places-method.md`
- `docs/coordinates/coordinate-source-contract-v1.md`
- `README/SYSTEM_REGISTRY.md`

Runtime source of truth er de faktiske source-dataene, manifestene, loaderne og valideringen.

---

## 0. Faktisitet og kildeverifikasjon

All brukerrettet dataproduksjon styres av `FACTUALITY_CONTRACT.md`.

- Ikke dikt, gjett, interpoler eller fyll ut manglende fakta.
- En språkmodell er ikke en faktakilde.
- Eksisterende History GO-tekst er ikke alene bevis for samme påstand.
- Hver publisert faktapåstand skal kunne spores til en inspectable kilde som faktisk støtter den.
- Manglende informasjon skal forbli manglende.
- Kildekonflikter skal dokumenteres; uløste konflikter skal normalt ikke publiseres som sikre fakta.
- Schema, readiness, grønn CI eller `verifiedAt` beviser ikke faktisitetskontroll.

Produksjon skal stoppe når kildegrunnlaget er utilstrekkelig.

---

## 1. Ett place-ID — ett canonical place-object

Et place-ID skal ikke dupliseres på tvers av kategorier eller filer.

Arbeidsregel:

1. Søk hele `data/places/**` etter ID, navn og navnevarianter.
2. Finn manifest-loadet source-fil.
3. Hvis stedet finnes, oppdater eksisterende canonical object.
4. Hvis primærkategori er feil, ta en eksplisitt kategoribeslutning før flytting.
5. Tverrfaglighet løses gjennom badges/emner, people, works, quiz, relations, Stories, Leksikon, ruter og andre eide systemer — ikke dupliserte places.

`data/places/places_index.json` er build-output og skal aldri håndredigeres.

Når et datasett er splittet til én fil per sted, skal den manifest-loadede per-place-filen redigeres. Et beholdt aggregate er ikke automatisk aktiv source of truth.

---

## 2. `category` er primær fag-/badgeidentitet

Hvert place har én canonical primærkategori.

Gyldige runtimekategorier eies av:

```text
data/categories/category_contract.json
```

Ikke opprett lokale parallelle kategorifelter for å uttrykke tverrfaglighet.

Eksempel:

```json
"category": "politikk"
```

Ved kategorivalg skal canonical kategori-ID brukes, ikke visningsnavn eller legacy-alias.

---

## 3. `underbadge_ids` er canonical underbadgefelt

Bruk `underbadge_ids` for relevant underklassifisering.

Alle verdier må finnes i korrekt badgefil.

Eksempel:

```json
"underbadge_ids": [
  "arbeiderbevegelse",
  "aktivisme_og_protest"
]
```

Ikke opprett planleggingsfelt eller lokale aliaslister i place-data.

---

## 4. Rundinger er visuell presentasjon, ikke fagklassifisering

Canonical rundingkontrakt eies av:

```text
data/places/README_place_rounds.md
```

Canonical rundingpalett er:

```text
badges
people
works
objects
details
spots
nature
brands
```

Harde regler for nye/reviderte places:

- `badges` er obligatorisk;
- ferdig sted viser nøyaktig **4 eller 6** rundinger;
- bruk bare canonical IDs;
- valgt runding skal ha reelt stedsspesifikt og bildeklart innhold;
- ikke bruk rundinger til fagklassifisering;
- ikke produser filler for å nå layouten;
- Nature er valgfri og skal ikke presses inn;
- Brands beholder betydningen **bedrifter og kjente merker knyttet til stedet**;
- Civication Store er ikke egen runding;
- Wonderkammer er ikke egen runding;
- Leksikon, Stories, Før/etter og handlinger er ikke rundinger;
- `rundinger` er legacy alias; bruk `rounds` i nye/reviderte data.

Kategoriens rundingprioritet og sted-for-sted kuratering ligger i `PLACE_PRODUCTION_CHECKLIST.md` og `README_place_rounds.md`.

---

## 5. Places skal inn gjennom manifest-loadede source-filer

Nye places skal ligge i riktig source-fil under `data/places/**` og være aktivert gjennom canonical manifestkjede.

Standardregel:

```text
data/places/manifest.json
```

eier global runtimeaktivering.

Hvis source-filen ikke er manifest-loadet, er dataene ikke canonical runtime-data.

Genererte indekser skal regenereres fra source, aldri håndredigeres.

---

## 6. People skal inn gjennom canonical People-system

Nye eller endrede People følger:

- `docs/people-of-places-method.md`
- `docs/PEOPLE_PROFILE_CANONICAL.md`
- `data/people/manifest.json`

Regler:

- søk etter eksisterende person før ny record;
- ikke dupliser samme person i flere kategorifiler;
- person–sted-kobling må ha konkret inspectable kilde;
- `placeId` er primæranker i standard-schema;
- `places` kan inneholde flere dokumenterte steder;
- flytt ikke primæranker uten egen vurdering;
- bruk aktivt schema for datasettet; ikke normaliser legacy-varianter lokalt uten migrering.

---

## 7. Works, Brands og andre canonical entiteter skal gjenbrukes

Før ny entitet opprettes:

1. søk etter canonical ID;
2. søk etter navn/navnevarianter;
3. kontroller om eksisterende record kan få ny dokumentert place-kobling;
4. opprett ny record bare når det faktisk er en ny canonical entitet.

### Brands

Brands er **bedrifter og kjente merker med dokumentert kobling til stedet**.

- Ikke bruk Brands som generell organisasjons-/institusjons-/lag-restkategori.
- Ikke endre eksisterende Brands-semantikk for å fylle en PlaceCard-runding.
- Gjenbruk eksisterende canonical Brand når den finnes.

### Works

Sportsresultater, rekorder og historiske hendelser er ikke Works. De hører normalt i stedspopupens Historie/kunnskapsflate.

---

## 8. Wonderkammer er legacy-migreringsgrunnlag

Det skal ikke produseres nye Wonderkammer-entries.

Eksisterende entries klassifiseres etter hva de faktisk er:

- fysisk gjenstand → `objects`;
- liten fysisk detalj/spor → `details`;
- fysisk delsted → `spots`;
- person → `people`;
- verk → `works`;
- naturentitet → `nature`;
- handling → På stedet;
- navigasjon → relations/NextUp;
- chronology/hendelse → Historie;
- narrativ episode → Stories bare hvis storykontrakten er oppfylt.

Legacy-data slettes først når canonical destinasjon er validert.

---

## 9. Civication er ikke stedets generelle objektmodell

Civication Store / Thingstore består som eget spillsystem.

Et Civication-element kan presenteres via `objects` bare når det også representerer en virkelig, fysisk, stedsspesifikk og visuelt kvalifisert gjenstand.

Skillet er:

```text
Objects = hva tingen er
Civication = kjøp/eierskap/bruk i spillet
```

Ikke alle Objects skal være kjøpbare.

---

## 10. Place-popup og kunnskapsdata skal bli i eide systemer

Stedspopupen aggregerer canonical data; den skal ikke føre til at alt kopieres inn i place-filen.

Eierskap:

- place source → identitet, `desc`, `popupDesc`, place-profiler;
- Leksikon → artikkel, facts, chronology, nyhetsspor, externalLinks;
- Stories → canonical Stories;
- `for_na` → Før/etter;
- Lesespor → Lesespor;
- source summaries / external links → Kilder;
- observations/knowledge → egne systemer;
- tasks/training/play/events/møter → På stedet/eide systemer.

Popupfanene er:

```text
Om
Historie
Fortellinger
Før/etter
Nyheter
Lesespor
Kilder
Mer
```

---

## 11. Koordinater følger Coordinate Source Contract

Nye eller vesentlig endrede koordinater følger:

- `docs/coordinates/coordinate-source-contract-v1.md`
- `docs/coordinates/coordinate-evidence-files-v1.md`

Regler inkluderer blant annet:

- address-first for relevante aktive norske adresseobjekter;
- korrekt `locatorType`, `sourceProvider`, `sourceObjectId`/adresse, `geocodeAccuracy`, `coordRole`, `coordType`, `coordNote` og status;
- `manual_map_check` alene kan ikke gi `verified`;
- historiske steder krever historisk kilde/representasjon når dagens adresse ikke beviser objektet;
- lineære/arealbaserte steder må representeres som det de faktisk er.

---

## 12. Politikkdata er manifestdrevet

Politikk skal ikke ha en parallell datastruktur.

Aktive place-filer i splittede datasett redigeres i manifest-loadede per-place-filer, ikke i beholdte aggregates.

For Oslo politikk har per-place-strukturen vært brukt under:

```text
data/places/politikk/oslo/places_politikk/<place_id>.json
```

Den globale runtimeautoriteten er fortsatt `data/places/manifest.json`.

Aktiv people-/badge-struktur skal hentes fra manifest og canonical badgefil, ikke fra statiske lister i dokumentasjonen.

Historisk viktig ID-kompatibilitet skal ikke brytes uten eksplisitt migrering, for eksempel canonical ID-er som allerede er etablert i runtime.

---

## 13. Tverrfaglige steder

Et sted kan være relevant for mange fag, men har ett canonical place-object og én primær `category`.

Tverrfaglighet uttrykkes gjennom relevante eide systemer, blant annet:

- `underbadge_ids`;
- `emne_ids`;
- people;
- works;
- quiz;
- relations;
- Stories;
- Leksikon;
- ruter;
- observations/knowledge;
- andre eksplisitt støttede overlays.

Ikke dupliser place-objectet.

---

## 14. Quiz er source-led

Quizinnhold skal bygges:

```text
ekstern/lokal kilde → konkret påstand → lærings-/story-enhet → spørsmål
```

Canonical fagfiler kan brukes til å velge emne, metode, teori og progresjonsplassering, men skal ikke automatisk bli den synlige faktateksten.

Quizfasit, alternativer og forklaringer er brukerrettede fakta og følger faktisitetskontrakten.

---

## 15. Bilder er også faktapåstander

Et bilde kan hevde identitet like sterkt som tekst.

Ved place-/People-/Works-/Objects-/Details-/Spots-/Nature-/Brands-produksjon skal det kontrolleres at:

- bildet viser riktig objekt/person/sted/art/brand;
- historisk bilde ikke presenteres som dagens situasjon;
- attribusjon/kilde kan etterprøves der modellen lagrer dette;
- generert bilde ikke presenteres som dokumentarfoto eller virkelig personportrett;
- en visuell runding ikke regnes som produksjonsklar på tekst alene.

---

## 16. Historie: profil- og evidenslag

Historie bruker separat profil- og evidenslag for konkrete geografiske cases.

Universelle emner eier `case_requirement_ids`; profiler eier casekandidater/mappings; claim-, source- og place-evidence-registre eier dokumenterte påstander og kildegrunnlag.

Dette laget erstatter ikke canonical place source eller place-faktisitetskontrollen.

---

## 17. Validering før merge

Før data merges skal minst følgende være kontrollert når relevant:

1. JSON parser.
2. Ingen duplisert place-ID.
3. Ingen duplisert person-/work-/brand-ID.
4. Manifest/source er riktig.
5. `category` er canonical.
6. `underbadge_ids` eksisterer.
7. `emne_ids` eksisterer.
8. People place-referanser eksisterer.
9. Quiz targets eksisterer.
10. Works/Brands/route/Story-referanser eksisterer.
11. Genererte indekser er regenerert fra source.
12. Nye/endrede fakta er kildekontrollert påstand for påstand.
13. Bilder er identitetskontrollert.
14. Place-rundinger følger 4/6-kontrakten og er bildeklare.
15. Relevant coordinate-gate passerer ved koordinatendring.
16. Relevant People/Stories/Nature/category/quiz/system-gate passerer ved endring av disse dataene.
17. Progresjonsendrende kode bruker eksisterende eier og dispatch/adapter etter kontrakten.
18. Slutt-diffen inneholder bare forventede filer.

Grønn CI beviser bare det kontrollene faktisk tester; den erstatter ikke source review.

---

## 18. Dataarbeidsprinsipp

> **Fiks source of truth.**

Ikke løs dataproblemer med runtimefiltre, hardkodede unntak eller midlertidig UI-logikk når canonical data er feil.

Source-first betyr at kilden åpnes og leses **før** påstanden skrives; det betyr ikke å skrive en plausibel tekst og legge ved en URL etterpå.

For stedproduksjon gjelder i tillegg:

> **Ett sted ferdig før neste.**

Den operative sjekklisten er `docs/PLACE_PRODUCTION_CHECKLIST.md`.
