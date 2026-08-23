# Birkelunden – fase 6 strukturerte place-profiler V1

- Dato: 2026-08-23
- Place ID: `birkelunden`
- Baseline `main`: fase-5 merge `7ef7d80a334f80f44d48bbbdec60ac8ccf9db6cd`
- Canonical Place: `data/places/by/oslo/places/birkelunden.json`
- Description production packet: `data/places/production/birkelunden.json`
- Content Factory pack: `reports/place-production/content-factory-pilot-02-grunerlokka-parks-source-pack-v1.json`
- Styrende kontrakter: `docs/PLACE_PRODUCTION_CHECKLIST.md` og `docs/PLACE_STANDARD.md` §10
- Status: **KLAR FOR REVIEW**

## 1. Tidligere-arbeid-gate

```text
TIDLIGERE-ARBEID-SØK: UTFØRT
SISTE GODKJENTE PR/COMMIT: #5251 / 7ef7d80a334f80f44d48bbbdec60ac8ccf9db6cd
SISTE GODKJENTE TILSTAND: claim-dekket desc/popupDesc, v4.2 production packet, verifisert parkgeometri og rettighetsklart hovedbilde; nature_profile fantes fra før, men spatial_profile, temporal_profile, history_layers og source_summary manglet.
KONKRET REGRESJONSEVIDENS: INGEN
BESLUTNING: REELT NYTT ARBEID for fire strukturerte profiler; eksisterende nature_profile bevares uten ny sluttgodkjenning; subplaces materialiseres ikke uten reell intern stedstruktur.
```

Fase 6 bruker bare allerede verifiserte claims fra Pilot-02-pakken, fase-5 production packet og tidligere godkjent geometri. Ingen Olaf Ryes plass-claim eller bred Grünerløkka-kontekst restemples som Birkelunden-fakta.

## 2. Evidensgrunnlag

Viktigste Birkelunden-ankere som brukes i fase 6:

- parkens canonical identitet og **16,3 dekar** areal;
- avgrensning mot Seilduksgata, Toftes gate, Schleppegrells gate og Thorvald Meyers gate;
- OSM way `3236549` som verifisert navngitt parkgeometri;
- anlegg i 1860-årene;
- Thorvald Meyers overdragelse til kommunen i 1882 og vilkåret mot bebyggelse;
- omlegging 1916–20;
- dagens musikkpaviljong 1926 / Otto Hald;
- vannbasseng 1927–28;
- Birkelunden/Bjerkelunden-navnehistorien;
- arbeiderbevegelsens dokumenterte parkbruk;
- Jack Johnsen / Venner i Bjerkelunden;
- `Føll` 1953;
- Jack Johnsen-bysten 1984;
- Spaniamonumentet 1989;
- fredningsprosess for Birkelunden kulturmiljø 1996–2006;
- kulturmiljøet som et **annet og større objektnivå** på ca. 116 dekar.

Tilbakeholdte sterke claims forblir tilbakeholdt. SNLs konfliktende `1889`-datering for Spaniamonumentet brukes ikke.

## 3. `spatial_profile` — PASS

Birkelunden har et reelt offentlig arealmål, og fase 6 kan derfor gjøre mer enn Youngstorget-precedensen uten å finne på geometri.

Materialisert:

- `place_form: offentlig_park`;
- canonical scope = den navngitte Birkelunden-parken;
- offisielt areal = **16,3 dekar**;
- runtimefelt `area_m2: 16300`;
- gateavgrensning fra Oslo kommune;
- Paulus' plass og Paulus kirke uttrykkelig som separate nabosteder;
- geometri = `verified_named_park_geometry` fra OSM way 3236549;
- kulturmiljøet på ca. 116 dekar lagres bare som eksplisitt kontekst, ikke som parkens egen utstrekning;
- tre inspectable HTTPS-kilder ligger direkte på profilen.

### Hard arealregel og runtime-paritet

```text
parkareal:             16,3 dekar = 16 300 m²
spatial_profile field: area_m2 = 16300
kulturmiljø:           ca. 116 dekar
gameplay-radius r:     190 meter-parameter i Place-systemet, IKKE areal
```

`js/ui/place-popup-v2.js` sin `renderSpatialSection()` leser `spatial_profile.area_m2`/`areaM2` og formatterer 16 300 m² som 16,3 daa. Den første fase-6-utgaven brukte et semantisk riktig, men runtime-ubenyttet `area_decares`-felt. Dette ble fanget før merge og korrigert til `area_m2: 16300`. Dermed er source-faktum, canonical data og synlig popup-renderer i parity.

`r=190` er ikke brukt som areal eller som kilde til fysisk måling.

## 4. `temporal_profile` — PASS

Feltet skal være en liten samling hovedmilepæler, ikke en ny chronology.

Seks hovedmilepæler materialiseres:

1. `1860-årene` – parken blir anlagt;
2. `1882` – Thorvald Meyer overfører Birkelunden til kommunen;
3. `1916–1920` – parken legges om for lek og aktivitet;
4. `1926` – dagens musikkpaviljong oppføres;
5. `1926–1955` – den offisielle navneformen Bjerkelunden;
6. `2006` – det større Birkelunden kulturmiljøet fredes.

Dette er nok til å gi tidsdybde uten å lage en konkurrerende Historie-/Leksikonchronology. 1937, 1953, 1984 og 1989 beholdes i `history_layers` og i den fullstendige popupteksten.

## 5. `history_layers` — PASS

Fire korte, stedsspesifikke historielag materialiseres:

### 1. Parken blir til — `1860-årene–1882`

Thorvald Meyer, parkdannelsen og overdragelsen med vilkår mot bebyggelse.

### 2. Parken legges om — `1916–1928`

Aktivitetsomleggingen, Otto Halds musikkpaviljong og vannbassenget.

### 3. Møter, organisering og minnespor — `tidlig 1900-tall–1989`

Arbeiderbevegelsens bruk, Jack Johnsen/Venner i Bjerkelunden og senere synlige kunst-/minnespor.

### 4. Parken blir del av et fredet kulturmiljø — `1996–2006`

Fredningsprosessen og den eksplisitte forskjellen mellom parkens 16,3 dekar og det større verneområdet.

Lagene sammenfatter dokumenterte skifter. De erstatter ikke Stories, Objects eller detaljert chronology.

## 6. `subplaces` — BEGRUNNET N/A

Fase-2-kildene og fase-5-pakken dokumenterer ingen stabil, navngitt intern soneinndeling som bør bli `subplaces`.

Følgende skal **ikke** konstrueres som subplaces:

- musikkpaviljongen — Object/Structure-kandidat;
- vannbassenget — Object-kandidat;
- `Føll` — Object-kandidat;
- Jack Johnsen-bysten — Object-kandidat;
- Spaniamonumentet — Object-kandidat;
- Paulus' plass — eget nabosted;
- Paulus kirke — eget bygg/sted;
- Grünerløkka skole — eget bygg/sted.

Å lage «norddelen», «plenen», «paviljongsonen» eller lignende uten source-defined intern identitet ville være completeness-filler. Feltet materialiseres derfor ikke.

## 7. Eksisterende `nature_profile` — BEVART, IKKE GODKJENT

Birkelunden hadde `nature_profile` før Pilot 02. Fase 4 avklarte at:

- primærkategori fortsatt er `by`;
- flora/fauna eies av `data/natur/*` og Nature bridge;
- eksisterende Nature-mapping har reelle arts-ID-er, men mangler sterk nok per-place ekstern provenance til biologisk sluttgodkjenning;
- den globale mappingen sier selv at ekstern validering fortsatt trengs.

Fase 6 **endrer derfor ikke ett ord** i `nature_profile` og gir det ikke ny PASS-status.

Dette er med vilje strengere enn å skrive om feltet fra generiske parkantakelser. Senere Nature-QA må kontrollere habitat, faktiske observasjoner, aktualitet, koordinatusikkerhet og pedagogisk verdi før naturflaten kan sluttgodkjennes.

## 8. `source_summary` — PASS

Brukerrettet sikker basisliste materialiseres med fem kilder:

- Oslo kommune – Birkelunden;
- Oslo byleksikon – Birkelunden;
- Riksantikvaren – Birkelunden, Murbyens hjerte;
- Pensjonistforbundet – Vår historie;
- OpenStreetMap way 3236549 – Birkelunden.

Listen dekker identitet, parkhistorie, verneområde, Jack Johnsen-sporet og geometri.

Bevisst utelatt:

- interne History GO-audits og reports;
- Content Factory JSON som selvkilde;
- SNL Birkelunden fra basislisten på grunn av den dokumenterte Spaniamonument-dateringskonflikten;
- current Sunday-market-kandidat;
- Nils Aas Kunstverksted som generell place-kilde — den er fortsatt relevant som objektspesifikk corroboration senere.

`source_summary` er en trygg brukerrettet basis. Klikkbare/deduplicerte Kilder-fane-URL-er vurderes separat i popupfase 7.

## 9. Bevaringskontroll

Fase 6 endrer ikke:

- `desc` eller `popupDesc`;
- fase-5 SHA-256-hashene eller production packet;
- hovedbilde, cardImage, credit, lisens eller source URL;
- `year: 1910`;
- category eller `emne_ids`;
- koordinatpunkt, radius eller OSM source identity;
- eksisterende `nature_profile`;
- Quiz/quiz_profile;
- People;
- Objects;
- Brands;
- Stories;
- Lesespor;
- routes/relations;
- runtime.

Den eneste canonical Place-endringen er materialisering av `spatial_profile`, `temporal_profile`, `history_layers` og `source_summary`.

## 10. Anti-generisk kontroll

- **name-swap:** profilene kollapser ved bytte til en annen park på grunn av 16,3/116-dekar-grensen, Meyer, Bjerkelunden-navnet, Jack Johnsen og konkrete minnespor;
- **cross-place duplicate:** Youngstorget-feltstrukturen brukes som kontraktspresedens, men ingen Youngstorget-prosa eller torgdata kopieres;
- **specific evidence anchors:** hvert materialisert profilfelt har Birkelunden-spesifikke kilder/fakta;
- **source→claim→profile:** alle profiler bygger på tidligere verified claims eller godkjent coordinate evidence;
- **local experience:** spilleren kan forstå fysisk parkgrense, tidslag og hvorfor verneområdet rundt er større enn selve parken;
- **fullness:** fase 6 fyller reelle strukturer, men lar Nature/subplaces og senere subsystemhull stå ærlig åpne.

## 11. Modell- og kredittbudsjett

```text
produksjonsmodellkall: 0
API-/modellkreditter brukt til ny research i fase 6: 0
```

Årsak: den allerede verifiserte Pilot-02 claim-banken, fase-5 production packet og fase-3-geometrien er tilstrekkelige for akkurat disse strukturerte profilene.

Dette er **researchgjenbruk, ikke kvalitetsreduksjon**. Dersom en profil hadde manglet evidens, skulle fasen gjort mer research. Derfor er `subplaces` begrunnet N/A, mens `nature_profile` bevares som uferdig fremfor å fylles eller kunstig godkjennes.

## 12. Fasebeslutning før CI

```text
SUBSYSTEM: structured place profiles
SPATIAL_PROFILE: PASS / MATERIALISERT / area_m2=16300 RUNTIME-KOMPATIBELT
TEMPORAL_PROFILE: PASS / MATERIALISERT
HISTORY_LAYERS: PASS / 4 LAG MATERIALISERT
SOURCE_SUMMARY: PASS / 5 SIKRE KILDER
SUBPLACES: BEGRUNNET N/A
NATURE_PROFILE: BEVART / IKKE NYTT GODKJENT
PARKAREA: 16,3 DEKAR
CULTURAL ENVIRONMENT AREA: CA. 116 DEKAR, KUN KONTEKST
RADIUS r SOM AREAL: NEI
PHASE-5 TEXT/HASHES CHANGED: NEI
OTHER SUBSYSTEMS CHANGED: NEI
MODEL CALLS/CREDITS: 0 / 0
STATUS: KLAR FOR REVIEW
```

Fase 6 kan først klassifiseres **FERDIG OG MERGET** når relevant CI er grønn og resultatet er kontrollert mot faktisk `main`.

## 13. Neste fase

Etter grønn merge går Birkelunden til **fase 7 – popupfaner**, med separat audit før fanespesifikk produksjon.

Fase 7 skal blant annet avklare:

- Om/Historie-eierskap for de nye strukturerte profilene;
- legacy Leksikon og mulig sanering;
- konkret Story-episode;
- Før/etter;
- ferske Nyheter/current-claims;
- Lesespor;
- klikkbare Kilder;
- Språk/Birkelunden–Bjerkelunden-navnehistorie;
- Objects og andre direktefaner bare når riktig eier og faktisk innhold finnes.
