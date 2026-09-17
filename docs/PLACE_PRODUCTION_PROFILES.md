# History GO — Produksjonsprofiler og innholdsplan for Places

Status: **canonical scope-kontrakt for stedsproduksjon**  
Eier: `place_by_place_production_workflow`  
Sist kontrollert: **2026-09-16**

Denne kontrakten bestemmer **hvor omfattende et sted skal produseres**. Hva slags innhold stedet skal få bestemmes primært av Badge-systemet og stedets kilder, ikke av en universell sjekkliste.

Canonical Badge-router:

- `data/badges/index.json` — alle 19 hovedbadges;
- `data/badges/<badge>.json` — canonical underbadges og eventuelle grupper/`quizFocus`;
- `data/badges/place_production_routing_v1.json` — produksjonsruting per hovedbadge.

Et `focused` Place skal være like korrekt, kildebundet, pent og ferdig som et `major` Place. Forskjellen er reell stoffbredde, ikke kvalitetsnivå eller hvor mye arbeid produsenten ønsker å gjøre.

## 1. Fire separate beslutninger

Disse skal aldri blandes:

1. **Hovedbadge / category** — stedets primære faglige identitet.
2. **Underbadges** — hvilke sider ved hovedbadgen dette konkrete stedet faktisk representerer.
3. **Produksjonsprofil** — hvor bredt det kildebårne stedet er: `major`, `standard`, `focused` eller `micro`.
4. **Innholdsplan** — hvilke konkrete moduler og PlaceCard-samlinger som produseres helt for akkurat dette stedet.

Canonical rekkefølge:

```text
Universal canonical core
→ hovedbadge
→ aktive underbadge_ids
→ stedsspesifikk source review
→ confirmed produksjonsprofil
→ endelig innholdsplan
→ produksjon
```

Badge/underbadge bestemmer hvilke medlemmer og faglige spor som må undersøkes; kildene bestemmer hva som faktisk kvalifiserer. For ordinære Places er PlaceCard-samlingene adaptive: `place_card_profile.collection_ids` inneholder **én til fire** ferdige, relevante samlinger. People, Objects, Brands og kategoriuttrykk er kandidatsamlinger, ikke en universell fyllkvote.

## 2. Universal canonical core

For alle ordinære Places (`major`, `standard`, `focused`) er følgende obligatorisk uansett Badge og profil:

1. løst identitet, scope og own-place-grense;
2. verifisert koordinat/geometri med ærlig `coordRole`;
3. inspiserte, sporbare kilder og source → claim-disiplin;
4. canonical `desc` og `popupDesc` i korrekt kvalitet;
5. riktig hovedbadge/category, riktige underbadges, relevante emner og Place-eid, substansauditert stedsspesifikk Fagverk-side;
6. publiserte bilder med proveniens og et faktisk stående `frontImage` der ordinær PlaceCard bruker det;
7. chronology/epoke-research med korrekt dateringspresisjon og materialisering av kvalifiserte eksakte år;
8. canonical Språkleksikon med minst ett reelt stedsspesifikt navn-/begrepsspor;
9. own-place-/relasjonsaudit;
10. runtime/materialisering, relevante CI-gater og manuell slutt-QA.

En mindre profil reduserer **stoffbredde**, aldri factuality, source-kvalitet eller sluttføring.

## 3. Badge-drevet innholdsplan

Preflight skal alltid:

1. slå opp stedets hovedbadge i `data/badges/index.json`;
2. lese hele `data/badges/<badge>.json`;
3. kontrollere alle `underbadge_ids` mot Badge-familien;
4. lese `data/badges/place_production_routing_v1.json`;
5. bruke hovedbadge + aktive underbadges til å lage kandidatlisten for research;
6. teste kandidatene mot faktiske kilder og subsystemkontrakter;
7. lage endelig `INNHOLDSPLAN` med `PRODUSER`, `BEGRUNNET N/A` eller `BLOCKED` per relevant samling/modul.

Når Badge-filen har `groups`, `children` eller `quizFocus`, skal disse brukes som canonical semantiske hint i research-/quizplanleggingen. De er ikke faktakilder og kan aldri erstatte stedsspesifikk evidens.

### Eksempler på hvorfor underbadge betyr noe

- `naeringsliv + industri` prioriterer produksjonsprosess, anlegg, maskiner/gjenstander, arbeidere/eiere, teknologi og eventuelt dokumentert merkeidentitet;
- `naeringsliv + bank_og_finans` prioriterer institusjon, finansielle aktører, eierskap, dokumenter/objekter og arkitektur — ikke industrimaskiner;
- `historie + industrihistorie` styrker produksjons-/arbeids-/teknologisporet selv om hovedbadgen er Historie;
- `historie + kulturminner_og_bevaring` prioriterer materielle spor, vern, ombruk og minne;
- `by + byplanlegging` prioriterer plan, byrom, infrastruktur og endring;
- `by + monumenter_og_landemerker` prioriterer struktur, symbolfunksjon, design/arkitekt og offentlig resepsjon;
- `musikk + konsertsteder` prioriterer scenehistorie, artister, konserter, venue-identitet og lyd/utstyr;
- `film_tv + filmlocations` prioriterer konkrete produksjoner, locations og skapere fremfor å late som stedet er et produksjonsselskap;
- `sport + stadion` prioriterer anlegg, konkurranser, utøvere/klubber og publikumskultur;
- `sport + supporterkultur` flytter tyngde mot mennesker, uttrykk, objekter og scene-/identitetskultur;
- `natur + vann_og_vassdrag` bruker Badge-filens vann-/økologi-hints og dokumenterte arter/landform;
- `natur + fugler` prioriterer Fauna-research; Nature følger sitt eksplisitte samlingssett når naturkontrakten krever det, og generiske arter brukes aldri som filler;
- `religion + trossteder_og_hellige_rom` prioriterer ritualer/tradisjoner, People, Objects og Brands; Structures velges bare når et reelt bygnings-/anleggsmiljø er et selvstendig hovedspor;
- `kunst + offentlig_kunst` prioriterer Productions, kunstnere, materialer og commissioning/offentlig resepsjon;
- `litteratur + forfattere_og_litteratursteder` prioriterer People, tekster/verk, Objects og relaterte steder;
- `politikk + arbeiderbevegelse` prioriterer personer/organisasjoner, møter/hendelser, dokumenter og relaterte steder;
- `utdanning + utdanningshistorie` prioriterer institusjonshistorie, lærere/elever, skolebygg og læremidler;
- `helse + helsetjenester_helseokonomi` prioriterer institusjon, system, profesjoner og historiske tjenester fremfor individuell klinikk.

Dette er kandidatstyring, ikke en pålagt samlingskvote. Objects-kandidater følger i tillegg `docs/PLACE_OBJECTS_CANONICAL.md`: stedets hovedfunksjon styrer utvalget, og på industristeder prioriteres produksjonsverktøy, former, maskiner, emballasje og fysiske produkter før sekundære kulturspor.

### Stedsavhengig PlaceCard-modell

Ordinære fullprofiler vurderer som utgangspunkt:

```text
People · Objects · Brands · kategoriuttrykk
```

Hver kandidatsamling får etter source review status `PASS`, `BEGRUNNET N/A` eller `BLOCKED`. Bare `PASS`-samlinger legges i `place_card_profile.collection_ids`. Et ordinært PlaceCard har **én til fire** ferdige samlinger; det finnes ingen tomme reservefelt og ingen filler. Nature og canonicale spesialprofiler følger sine egne eksplisitte samlingssett. Kategoriuttrykket og brukerrettet navn følger kategorimatrisen i `data/places/README_place_rounds.md`. `related` er aldri en PlaceCard-samling. Structures er bare standard for By og ellers en uttrykkelig begrunnet stedsspesifikk variant.

## 4. Kandidatsamlinger og betingede moduler

For en ordinær fullprofil skal disse fire kandidatsamlingene vurderes når Badge-/underbadge-/source-grunnlaget gjør dem plausible:

- People;
- Objects;
- Brands;
- kategoriuttrykket (`historical_events`, `productions`, `structures`, `competitions` eller `destinations` etter samlingskontrakten).

Sluttstatus per samling:

```text
PASS
BEGRUNNET N/A
BLOCKED
```

- `PASS`: minst ett ekte canonical medlem kvalifiserer og nødvendig evidens/preview er ferdig.
- `BEGRUNNET N/A`: dokumentert kandidataudit finner ingen naturlig kvalifisert kandidat. Dette er en legitim ferdigstatus.
- `BLOCKED`: en reell kvalifisert kandidat finnes, men evidens, asset, proveniens eller materialisering mangler.

For Historie er standarduttrykket `historical_events`. Det er en egen historisk entity-familie, ikke en alias for `productions` og ikke kalender-/nåtidssystemet `events`. `Structures` kan fortsatt velges som en eksplisitt stedsspesifikk variant når et reelt bygnings- eller anleggsmiljø er sterkere enn hendelsessporet.

Følgende øvrige moduler er betingede og produseres når de er reelt relevante og source-backed:

- Stories;
- Før/etter;
- Nyheter;
- Lesespor;
- ruter/narrative koblinger;
- ekstra Fagverk-spor;
- ekstra medier.

`BEGRUNNET N/A` brukes når korrekt research viser at en samling/modul ikke hører naturlig til stedet. Det betyr ikke «gjør senere». `BLOCKED` brukes bare for reelt kvalifisert, men uferdig innhold.

**Ingen tomme PlaceCard-samlinger ved fullført ny/full produksjon. Ingen filler.** En samling uten kvalifisert medlem utelates som `BEGRUNNET N/A`; en kvalifisert, men uferdig samling blokkerer til den er ferdig eller evidensen viser at den ikke kvalifiserer.

## 5. Produksjonsprofiler

### `major`

Sted med stor betydning og bredt kildebåret stoff som bærer flere selvstendige lærings-, material- eller narrative spor.

Forventning: dypest research, `fagverk.level: full` med utfyllende fagartikkel og flere selvstendige læringsspor, og alle sterke, kvalifiserte PlaceCard-samlinger som stedet faktisk bærer.

### `standard`

Default for et betydelig canonical Place med komplett stedsopplevelse, flere reelle innholdsvinkler og nok materiale til solid Fagverk/quiz uten Major-bredde.

Forventning: full universal core, minst `fagverk.level: standard` med egen læringsinngang, minst tre linser, fire spørsmål, observerbart spor og kilder, og et kildebåret utvalg på én til fire ferdige PlaceCard-samlinger.

### `focused`

Canonical Place med historisk/kulturell verdi konsentrert i én hovedfunksjon, hendelse, struktur, spor eller snevert tema.

Forventning: full universal core og de PlaceCard-samlingene stedet faktisk bærer, ofte færre og smalere enn et bredere sted. `focused` bruker fortsatt minst Fagverk-nivå `standard`; nivå `micro` er bare for canonicale Micro Places. `focused` reduserer aldri kvaliteten på samlingene som faktisk produseres.

`focused` kan aldri velges bare fordi oppgaven ønskes billigere eller raskere.

### `micro`

Brukes bare når stedet kvalifiserer etter `docs/MICRO_PLACE_CONTRACT.md`.

## 6. Profilavgjørelse

Preflight vurderer fem dimensjoner **etter Badge-/underbadge-researchen**:

1. historisk dybde;
2. entity-dybde;
3. kildedybde;
4. tolkningsdybde;
5. stedets betydning.

- `major` krever at flere dimensjoner er tydelig høye;
- `focused` brukes når canonical verdi består, men bredden er reelt smal;
- `standard` er hovedprofilen i midten;
- `micro` følger egen kontrakt.

Ingen mekanisk poengsum er endelig autoritet.

## 7. Katalogtriage før videre produksjon

Vi bruker en hybridmodell.

### Stage A — lett provisional triage

Eksisterende katalog får planleggingsmetadata basert på det som allerede finnes:

```text
production_profile: major | standard | focused | micro
profile_status: provisional
profile_reason: <kort grunn>
badge_basis: <category + eksisterende underbadge_ids>
```

Triage skal lese eksisterende hovedbadge/underbadges, men er **ikke full research** og produserer ikke nytt innhold.

### Stage B — confirmed preflight

Når stedet går inn i produksjon, leses Badge-filen og kildene ordentlig, og profilen bekreftes eller overstyres:

```text
production_profile:
profile_status: confirmed
profile_reason:
profile_changed_from: <valgfritt>
```

Nye steder klassifiseres direkte som `confirmed`.

## 8. Quizprofil er separat

`production_profile` og quizprofil er ikke det samme.

Canonical Quiz-kontrakt velger adaptivt:

- `narrow`: 3 × 7;
- `normal`: 4 × 7;
- `rich`: 5–8 × 7;
- `major`: 8–10 × 7.

Badge, underbadges og eventuell `quizFocus` brukes til å planlegge hvilke kunnskapsområder som undersøkes; påstandsbank og faktisk læringsbredde bestemmer quizprofil og eksakt lengde.

## 9. PlaceCard: én til fire ferdige samlinger, aldri tomme kort

For nye/fullproduserte ordinære Places er `place_card_profile.collection_ids` en eksplisitt kuratert liste med **én til fire ferdige, relevante samlinger**.

- bare samlinger med `PASS` inngår;
- People, Objects, Brands og kategoriuttrykk er kandidater, ikke obligatoriske slots;
- Nature og canonicale spesialprofiler følger sine eksplisitte samlingssett;
- `related` er aldri samling eller reserve;
- hver valgt samling har minst ett ekte canonical medlem og validert, lastbart previewbilde;
- en kvalifisert kandidat med manglende evidens/asset er `BLOCKED`;
- fravær av kvalifisert kandidat etter dokumentert audit er `BEGRUNNET N/A`;
- runtime bruker den adaptive 1–4-layouten uten tomme reservefelter;
- People/Flora/Fauna er sirkler; øvrige er avrundede rektangler;
- `frontImage` forblir stående hovedflate;
- gamle Places beholder kompatibilitetsvisningen til revisjon.

Designregel: **Alle viste flater skal oppleves som nødvendige, tydelig forskjellige og stedsegne.** Ingen flate fylles med en perifer entity bare for å fylle geometri.

## 10. Arbeidskort

Hvert ordinære aktive sted skal minst føre:

```text
HOVEDBADGE/CATEGORY:
UNDERBADGE_IDS:
BADGE-ROUTER STATUS:
BADGE-DREVNE RESEARCHSPOR:
PRODUKSJONSPROFIL: major | standard | focused
PROFILSTATUS: provisional | confirmed
PROFILBEGRUNNELSE:
INNHOLDSPLAN:
  People: PRODUSER | N/A + grunn | BLOCKED + grunn
  Objects: PRODUSER | N/A + grunn | BLOCKED + grunn
  Brands: PRODUSER | N/A + grunn | BLOCKED + grunn
  Category expression: PRODUSER | N/A + grunn | BLOCKED + grunn
  Stories: PRODUSER | N/A + grunn
  Før/etter: PRODUSER | N/A + grunn
  Nyheter: PRODUSER | N/A + grunn
  Lesespor: PRODUSER | N/A + grunn
PLACECARD-SAMLINGER: <én til fire ferdige PASS-IDs, ingen tomme>
KATEGORIUTTRYKK + BRUKERRETTET NAVN:
OBJECTS ↔ KATEGORIUTTRYKK-EIERGRENSE:
UNIVERSAL CORE STATUS:
```

## 11. Anti-snarvei

- eksisterende korrekt innhold beholdes;
- relevant source-backed innhold kan ikke hoppes over fordi stedet er `focused`;
- Badge/underbadge kan ikke brukes til å dikte innhold som kildene ikke bærer;
- `BEGRUNNET N/A` krever dokumentert kandidataudit og kan ikke brukes som kostnadssnarvei;
- en reell kvalifisert, men uferdig samling er `BLOCKED`, ikke N/A;
- `focused` betyr smalt komplett, ikke halvferdig;
- grønn CI kan ikke overstyre svak redaksjonell eller visuell sluttflate.

## Kort regel

**La innholdet følge Badges og kildene: hovedbadge åpner researchuniverset, underbadges former kandidatene, kildene avgjør hvilke samlinger og medlemmer som er sanne og relevante, og produksjonsprofilen avgjør hvor dypt vi går. Ordinære Places viser én til fire ferdige PASS-samlinger. People, Objects, Brands og kategoriuttrykk produseres bare når stedet faktisk bærer dem.**
