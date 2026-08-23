# Birkelunden – fase 7 popupfaner audit V1

- Dato: 2026-08-23
- Place ID: `birkelunden`
- Baseline `main`: fase-6 merge `735a7490072adc8b7decb133a0aebdd8fb33de36`
- Canonical Place: `data/places/by/oslo/places/birkelunden.json`
- Popupkontrakt: `docs/PLACE_POPUP_SYSTEM.md`
- Basisruntime: `js/ui/place-popup-v2.js`
- Faneruntime: `js/ui/place-popup-tabs.js`
- Direct-tabs runtime: `js/ui/place-popup-direct-tabs.js`
- Status: **POPUP AUDIT FERDIG – KLAR FOR REVIEW; INGEN BRUKERRETTET DATA ENDRET**

## 1. Formål

Denne fasen produserer ikke fanedata. Den avgjør først hvem som eier hvert kunnskapslag, hva som allerede er innholdssterkt etter fase 5–6, hva som faktisk mangler, og hvilke legacy-data som vil forurense popupen dersom de får fortsette å rendres ukritisk.

Auditprinsippet er:

> samme opplysning skal ha én tydelig visuell eier; eksisterende svakt legacy-innhold skal ikke kopieres eller beholdes bare fordi en renderer kan lese det.

Approval unit er fortsatt **kun Birkelunden**.

## 2. Runtime-eierskap – bekreftet

### `place-popup-v2.js`

Runtimen:

- bruker `popupDesc` som hovedartikkel;
- renderer `spatial_profile` gjennom `renderSpatialSection()`;
- leser `spatial_profile.area_m2` og formatterer `16300` til `16,3 daa`;
- renderer `history_layers` gjennom `renderHistoryTimeline()`;
- kan rendere `nature_profile.summary` i Om;
- renderer `source_summary` som source-seksjon.

`temporal_profile` kan leses av helperen, men audit har ikke funnet en separat milepælrenderer som må fylles. Det er riktig: tidsdata som allerede eies visuelt av hovedartikkel/`history_layers` skal ikke dobbeltrendres bare fordi feltet finnes.

### `place-popup-tabs.js`

Runtimen fordeler eksisterende seksjoner slik:

- `popupDesc`/spatial/nature og andre grunnseksjoner → **Om**;
- `.hg-place-history-section` → **Historie**;
- Stories → **Fortellinger**;
- `for_na` → **Før/etter**;
- Leksikon-klassifiserte notiser → **Nyheter**;
- place-linkede åpne Lesespor → **Lesespor**;
- source summary / external links → **Kilder**.

Hydratoren kan samtidig hente Leksikon og legge:

- Leksikon-`wikiText`/facts til Om;
- Leksikon-`chronology` til Historie.

Det er derfor Leksikon-kvaliteten en reell popup-eierport, ikke bare et separat arkivproblem.

### `place-popup-direct-tabs.js`

Direct-tabs-runtimen er aktiv og bekrefter at `Mer` bare er et bakoverkompatibelt staging-panel.

Den bruker ikke `Mer` som brukerrettet fane. Innhold flyttes til navngitte faner som:

- Språk;
- Spor & objekter;
- Legg merke til;
- Betydning;
- Motpunkter;
- Relasjoner;
- Kunnskap;
- Observasjoner.

Det trengs derfor **ingen Birkelunden-spesifikk runtimeendring bare for å fjerne Mer**.

## 3. Blocker 1 – legacy Leksikon forurenser Om og Historie

Aktiv legacyoppføring finnes i:

`data/leksikon/places/oslo/by/leksikon_oslo_by_batch3.json`

Birkelunden-posten er:

- `place_id: birkelunden`;
- `version: 1`;
- source-tom på artikkelnivå;
- har `facts[0].confidence: medium` og `sources: []`;
- har `chronology[0].confidence: medium` og `sources: []`;
- bruker generisk tekst om «mye brukt park», lek, piknik, trening, uformelle møter, tett boligbebyggelse og lokal identitet.

Eksempler på problematiske legacy-formuleringer:

- «Birkelunden brukes til lek, piknik, trening og uformelle møter»;
- «Birkelunden er en av de mest brukte nærparkene på Grünerløkka»;
- chronology: «Parken har fulgt utviklingen av Grünerløkka ...».

Ingen av disse postene har inspectable sources i legacy-recorden.

### Hvorfor dette blokkerer

`renderAbout()` kan legge legacy `wikiText` og facts under den nye v4.2-artikkelen i **Om**.

`renderTimeline()` kan legge legacy `chronology` som en ekstra **Tidslinje** i Historie ved siden av source-bårne `history_layers`.

Det ville gi to problemer samtidig:

1. svakere, source-tom tekst blir synlig ved siden av godkjent v4.2-innhold;
2. samme kunnskap får parallelle visuelle eiere.

### Fasebeslutning

Legacy Birkelunden-Leksikon skal **ikke** oppgraderes ved å kopiere fase-5/6-prosa inn i en ny parallell artikkel.

7A/7B skal i stedet sanitere/retirere Birkelunden-legacybidraget slik at:

- v4.2 `popupDesc` forblir Om-hovedartikkel;
- `spatial_profile` forblir fysisk nøkkelprofil;
- `history_layers` forblir Historie-eier;
- source-tom `wikiText`, fact og generic chronology ikke injiseres i popupen.

## 4. Blocker 2 – `nature_profile` kan rendres i Om før biologisk QA

Canonical Birkelunden har et eldre `nature_profile` som ble bevart gjennom fase 4–6, men **ikke biologisk sluttgodkjent**.

Profilens summary hevder blant annet:

- trekroner gir skygge og mildere lokalklima;
- blomstring/små vegetasjonsflater gir mat og skjul til pollinatorer og andre byarter;
- den kompakte parken kan fungere som leveområde og daglig naturkontakt.

Fase 4 slo fast at Birkelundens Nature-mapping har reelle arts-ID-er, men mangler sterk nok per-place ekstern provenance til sluttgodkjenning. Mappingens globale metadata sier dessuten at ekstern validering fortsatt trengs.

`renderNatureLandscape()` kan likevel gjøre `nature_profile.summary` synlig i **Om** bare fordi summary finnes.

### Fasebeslutning

Om kan ikke ferdigmeldes mens en uttrykkelig ikke-godkjent naturtekst kan rendres som ferdig kunnskap.

7A må derfor løse dette hos riktig eier:

- **foretrukket:** gjennomfør Nature source-/habitat-/observasjons-QA og behold/revider bare det som faktisk støttes;
- alternativt: fjern/suppressér unsupported Nature-laget til evidensen er god nok.

Det er ikke tillatt å godkjenne naturteksten bare fordi den allerede finnes eller fordi den ser plausibel ut.

## 5. Fast faneaudit

| Fane | Status etter fase 6 | Auditbeslutning / neste handling |
| --- | --- | --- |
| **Om** | **CORE READY, BLOCKED** | v4.2 `popupDesc` + runtime-kompatibelt `spatial_profile` er sterke. Blockers: source-tom legacy Leksikon + ikke-godkjent synlig `nature_profile`. 7A eier dette. |
| **Historie** | **CORE READY, BLOCKED** | Fire source-bårne `history_layers` er klare og runtimeplasseres riktig. Legacy source-tom chronology må ut. Ikke legg parallell temporal milestone-rad. 7B. |
| **Fortellinger** | **REELT PRODUKSJONSHULL** | Ingen Birkelunden-eid canonical Story/narrative funnet. Jack Johnsen / Venner i Bjerkelunden 1937 er sterk episodekandidat. Må følge Stories governance og få episode-spesifikk research. 7C. |
| **Før/etter** | **REELT PRODUKSJONSHULL** | Ingen `for_na`. Gode source-bårne endringsakser: 1916–20, 1926-paviljong, 1984–86. Må ha rights-clear historisk + nå-bilde av selve parken. 7D. |
| **Nyheter** | **RESEARCH REQUIRED, IKKE N/A** | Ingen godkjente Birkelunden-notiser. Current marked/events ble holdt tilbake som volatile. Fersk 2026-research kreves før publisering. 7E. |
| **Lesespor** | **REELT RESEARCHHULL** | Ingen `birkelunden` i kontrollerte By-/Historie-Lesespor; Natur-filen er tom. Finn åpne direkte place-spesifikke tekster. 7F. |
| **Kilder** | **LABELS READY, LINKS MANGLER** | `source_summary.safe_sources` gir fem trygge labels. Klikkbare lenker krever `externalLinks`/Før-etter-kilder. Legg dedupliserte HTTPS-lenker senere. 7G. |

## 6. Om – 7A kontrakt

### Behold

- `popupDesc` uendret;
- `desc` uendret;
- `spatial_profile` uendret;
- `area_m2: 16300` som synlig arealkilde;
- image/provenance uendret;
- fase-5 production packet/hashes uendret.

### Ikke gjør

- ikke lag ny temporal milestone-rad bare fordi `temporal_profile` finnes;
- ikke kopier `history_layers` tilbake til Om;
- ikke kopier source-summary-tekster inn som brødtekst;
- ikke behold generisk legacy-Leksikon som «ekstra innhold»;
- ikke la ikke-verifisert Nature-summary passere bare for å unngå tom naturseksjon.

### 7A sluttgate

Om kan klassifiseres ferdig når:

1. legacy Leksikon ikke lenger injiserer source-tom wikiText/facts;
2. synlig Nature-lag er source-godkjent eller ærlig utelatt;
3. popupDesc er hovedartikkel;
4. spatial profile vises med 16,3 daa, ikke `r=190` eller 116-dekar-kulturmiljøet;
5. ingen dupliserende temporal/history UI er introdusert.

## 7. Historie – 7B kontrakt

### Behold

De fire fase-6-lagene:

1. Parken blir til;
2. Parken legges om;
3. Møter, organisering og minnespor;
4. Parken blir del av et fredet kulturmiljø.

Runtimen flytter allerede `.hg-place-history-section` til Historie.

### Blocker

Legacy Leksikon-chronology:

- `period: Utviklingsløp`;
- `confidence: medium`;
- `sources: []`;
- generisk kontinuitetsformulering.

Denne må ikke få konkurrere med `history_layers`.

### Temporal owner

`temporal_profile` er strukturert data for de viktigste milepælene. De samme fakta er allerede lest gjennom artikkel/history layers. «Én visuell eier» betyr derfor at 7B **ikke** skal lage en ekstra timeline-komponent for de seks temporal-feltene bare for symmetri.

## 8. Fortellinger – 7C

Repo-audit:

- `data/stories/places_by.json` har ikke Birkelunden;
- `data/stories/narratives.json` har ingen Birkelunden-place/narrative.

Fase-2 research gir en sterk kandidat:

**Jack Johnsen / Venner i Bjerkelunden, 1937**

Pensjonistforbundet beskriver:

- 10–12 pensjonister samlet på en benk i Birkelunden;
- 18 personer stiftet Venner i Bjerkelunden i 1937.

Dette har sted, aktører, sosial situasjon og en mulig episodeakse. 7C må likevel lese `docs/STORIES_DATA_GOVERNANCE.md`, gjøre nødvendig episode-/kildeutvidelse og materialisere hos Stories-eieren.

Bredt «arbeiderbevegelsens massemønstringer tidlig 1900-tall» skal **ikke** blåses opp til Story uten en konkret hendelse.

## 9. Før/etter – 7D

Canonical Birkelunden har ingen `for_na`.

Source-bårne endringsakser:

- parkens omlegging 1916–20;
- dagens musikkpaviljong fra 1926;
- basseng/beplantningsarbeider 1984–86.

Krav:

- begge bilder må vise canonical parkområde;
- historisk og nåtidig motiv må være meningsfullt sammenlignbart;
- bildecredit, lisens og source page må være inspectable;
- Paulus kirke, Grünerløkka skole eller omkringliggende bygårder kan ikke brukes som proxy for park-place;
- observer-/look-for-tekst må samsvare visuelt med bildene.

## 10. Nyheter – 7E

Ingen canonical Birkelunden-current/news-pakke er godkjent.

Fase 5 holdt eksplisitt tilbake:

- fast søndagsmarked som 2026-claim;
- generell/current arrangementsbruk uten fersk operatør-/offisiell bekreftelse.

Nyheter er derfor **ikke N/A**. 7E må bruke fersk webresearch på produksjonsdatoen og skille:

- aktuell hendelse/notis;
- varig parkfakta;
- historisk arrangement.

En aktuell liten notis skal forbli Nyheter, ikke gjøres til Story.

## 11. Lesespor – 7F

Kontrollert:

- `data/lesespor/oslo/lesespor_oslo_by.json` → ingen `birkelunden`;
- `data/lesespor/oslo/lesespor_oslo_historie.json` → ingen `birkelunden`;
- `data/lesespor/oslo/lesespor_oslo_natur.json` → `items: []`.

Resultat: **reelt researchhull**.

7F skal prioritere:

- åpne, direkte, stedsspesifikke tekster;
- solide institusjonelle/faglige kilder som faktisk gir en leseopplevelse, ikke bare et teknisk kildebevis;
- korrekt `access` item-for-item.

Ikke relabel paywall/access for å få fanen til å vises.

## 12. Kilder – 7G

Fase 6 materialiserte fem trygge labels:

- Oslo kommune – Birkelunden;
- Oslo byleksikon – Birkelunden;
- Riksantikvaren – Birkelunden, Murbyens hjerte;
- Pensjonistforbundet – Vår historie;
- OpenStreetMap way 3236549 – Birkelunden.

`renderSources()` gjør disse til tekstlabels, men gjør bare `externalLinks`/Før-etter-sources til klikkbare HTTPS-lenker.

7G skal derfor materialisere inspectable, dedupliserte `externalLinks` for de fem sikre brukerrettede kildene.

Begrensninger:

- OSM er geometry/identity-kilde, ikke historisk artikkel;
- interne audit-/claim-bank-filer skal aldri vises som brukerrettede kilder;
- SNL Birkelunden skal ikke inn i safe basislisten så lenge den dokumenterte Spaniamonument-dateringskonflikten står;
- Nils Aas Kunstverksted er bedre som objektspesifikk source når Spaniamonumentet materialiseres.

## 13. Språk – 7H

`data/leksikon/sprak/manifest.json` har ingen `birkelunden`.

Men source packen har reelt stedbundet språkstoff:

- Birkelunden var navnet fra starten;
- den offisielle formen ble `Bjerkelunden` i 1926;
- `Birkelunden` ble tatt tilbake i 1955.

Dette gjør Språk til **reell researchkandidat, ikke N/A**.

7H må lese `docs/SPRAKLEKSIKON.md` før materialisering og avgjøre om navnehistorien alene er substansiell nok til en språkoppføring.

Ikke finn på:

- usourced etymologi for «lund» eller «bjørk»;
- dialekt;
- lokal uttale;
- generiske Grünerløkka-uttrykk.

## 14. Direktefaner

### Spor & objekter

Fase 2 har gode kandidater:

- musikkpaviljong;
- vannbasseng;
- `Føll`;
- Jack Johnsen-byste;
- Spaniamonumentet.

Men de skal ikke materialiseres som legacy popup-artifacts for å fylle en fane. Canonical Object/Structure-eierskap skal auditeres i den senere rundings-/Object-fasen. Direct-tab kan først vises når riktig source-eier faktisk produserer popupkunnskap.

### Legg merke til / Betydning / Motpunkter

Ingen godkjent source-eid `interpretation`-pakke finnes. Legacy By-Leksikonets generiske betydningsprosa skal ikke promoteres.

### Relasjoner

Canonical `related_place_ids`/Dælenenga-kobling er ikke automatisk en curated forklarende popup-relasjon. Senere relations-audit avgjør dette.

### Kunnskap

`quiz_profile` er produksjonsretning og **ikke** aktiv Quiz/Knowledge.

### Observasjoner

Ingen Birkelunden-spesifikk canonical observasjonspakke er godkjent i denne auditen.

Resultat: ingen nye direktefaner materialiseres i auditfasen.

## 15. Samlet fase-7 arbeidsrekkefølge

```text
7A Om
  - sanitere/retirere legacy Leksikon-bidrag til Om
  - løse Nature synlighets-/kildeblocker
  - QA popupDesc + spatial_profile runtime

7B Historie
  - sikre history_layers som eneste sterk timeline-eier
  - fjerne source-tom legacy chronology
  - ingen parallell temporal timeline

7C Fortellinger
  - Story governance
  - Jack Johnsen / Venner i Bjerkelunden som primær episodekandidat

7D Før/etter
  - historisk/nå bildepar av selve parken
  - rights/provenance + visuell sammenlignings-QA

7E Nyheter
  - fersk 2026 webresearch
  - korte source-bårne notiser

7F Lesespor
  - åpne direkte stedstekster

7G Kilder
  - inspectable HTTPS externalLinks

7H Språk
  - Birkelunden/Bjerkelunden-navnehistorie under Språkleksikon-kontrakten
```

Subfasene merges separat. Ingen senere popupsubfase får ferdigstatus fordi en tidligere ble grønn.

## 16. Modell-/kredittmåling

```text
nye eksterne researchkall i auditfasen: 0
modell-/API-kreditter brukt til ny research i auditfasen: 0
```

Auditen kunne gjennomføres deterministisk fra canonical repo, runtime, fase-2 source pack og fase-5/6 produksjonsartefakter.

Dette betyr **ikke** at 7C–7H skal spares for research. Der audit har identifisert reelle evidenshull, skal det gjøres mer research til kvalitetskravet er oppfylt.

## 17. Auditbeslutning

```text
PHASE 7 AUDIT: FERDIG / KLAR FOR REVIEW
CANONICAL PLACE CHANGED: NEI
RUNTIME CHANGED: NEI
LEKSIKON CHANGED: NEI
NATURE CHANGED: NEI
STORIES/LESESPOR/LANGUAGE CHANGED: NEI

OM: CORE READY, BLOCKED BY LEGACY LEKSIKON + UNAPPROVED NATURE
HISTORIE: CORE READY, BLOCKED BY LEGACY CHRONOLOGY
FORTELLINGER: REAL CONTENT GAP
FØR/ETTER: REAL CONTENT GAP
NYHETER: FRESH RESEARCH REQUIRED
LESESPOR: REAL RESEARCH GAP
KILDER: LABELS READY / CLICKABLE LINKS MISSING
SPRÅK: REAL NAME-HISTORY CANDIDATE / CONTRACT REVIEW REQUIRED
DIRECT TABS: NO NEW MATERIALIZATION YET

NEXT: 7A – OM
```
