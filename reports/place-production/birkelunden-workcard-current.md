# Birkelunden – aktivt stedproduksjonskort

- Oppdatert: 2026-08-23
- Place ID: `birkelunden`
- Canonical source: `data/places/by/oslo/places/birkelunden.json`
- Aktiv fase-6-baseline `main`: `7ef7d80a334f80f44d48bbbdec60ac8ccf9db6cd`
- Fase 0 merge: PR #5236 / `d3945c43f10b1f5b4e1b758f915818342f95d240`
- Fase 1 merge: PR #5239 / `2dbc70a4984e01487a2dd7289d2e93bcbb0d6217`
- Fase 2 merge: PR #5241 / `61bcf3e1dc0156582eb1e3bd9bfcee6d9ba05c06`
- Fase 3 merge: PR #5243 / `6983331fd2be89dd6ae9aad51f660503809a305e`
- Fase 4 merge: PR #5244 / `ffca364854dcf4dec37b5129595f13017d5a7589`
- Fase 5 merge: PR #5251 / `7ef7d80a334f80f44d48bbbdec60ac8ccf9db6cd`
- Nullmåling: `reports/place-production/birkelunden-nullmaaling-v1.md`
- Fase 1 audit: `reports/place-production/birkelunden-phase1-identity-source-boundary-v1.md`
- Fase 2 shared pack: `reports/place-production/content-factory-pilot-02-grunerlokka-parks-source-pack-v1.json`
- Fase 2 review: `reports/place-production/birkelunden-phase2-content-factory-source-pack-v1.md`
- Fase 3 audit: `reports/place-production/birkelunden-phase3-coordinate-prior-work-gate-v1.md`
- Fase 4 audit: `reports/place-production/birkelunden-phase4-fagverk-nature-ownership-audit-v1.md`
- Fase 5 review: `reports/place-production/birkelunden-phase5-description-v4_2-review-v1.md`
- Fase 5 production package: `data/places/production/birkelunden.json`
- Fase 6 audit: `reports/place-production/birkelunden-phase6-structured-profiles-audit-v1.md`
- Styrende kontrakt: `docs/PLACE_PRODUCTION_CHECKLIST.md`
- Place-standard: `docs/PLACE_STANDARD.md`
- Content Factory: `data/places/regler/content_factory_v1.json`
- Klynge: **Birkelunden → Olaf Ryes plass**
- Approval unit: **Birkelunden alene**

## Canonical identitet

Birkelunden-place representerer **selve den avgrensede offentlige parken Birkelunden på Grünerløkka**.

```text
Birkelunden park:              16,3 dekar
Birkelunden kulturmiljø:     ca. 116 dekar
Paulus' plass:                  4,4 dekar
```

Parken er ikke synonym med det større fredede kulturmiljøet, Paulus' plass, Paulus kirke, Grünerløkka skole, Birkelunden holdeplass, omkringliggende bygårder eller hele Grünerløkka.

Koordinatidentiteten er `verified_geometry / osm-way:3236549 / park_anchor`.

## Fasestatus

| Fase | Status | Beslutning |
| --- | --- | --- |
| 0. Nullmåling | **FERDIG OG MERGET** | PR #5236 |
| 1. Canonical identity/source | **FERDIG OG MERGET** | PR #5239 |
| 2. Content Factory source/claim pack | **FERDIG OG MERGET** | PR #5241 |
| 3. Koordinater/geometri | **ALLEREDE FERDIG OG MERGET** | PR #5243; ingen ny geokoding |
| 4. Kategori/Badges/emner/Fagverk/Nature-eierskap | **ALLEREDE FERDIG / EIERSKAP AVKLART OG MERGET** | PR #5244 |
| 5. `desc` + `popupDesc` v4.2 + image gate | **FERDIG OG MERGET** | PR #5251; `ready_v4_2`, 17/17 claims, lisensiert stedsbilde |
| 6. Strukturerte place-profiler | **KLAR FOR REVIEW** | spatial/temporal/history/source materialisert; subplaces begrunnet N/A; Nature bevart uten falsk sluttgodkjenning |
| 7. Popupfaner | **IKKE STARTET / NESTE** | fanespesifikk audit før produksjon |
| 8. Rundinger | **IKKE FERDIG** | Objects/Brands/Structures/People må få substans- og eieraudit |
| 9. På stedet | **IKKE STARTET** | onsite-kontrakt |
| 10. Quiz | **REELT PRODUKSJONSHULL** | ingen aktiv Birkelunden-quiz i quizmanifestet |
| 11. Observer / Notat / Rute | **IKKE STARTET / RUTE MANGLER** | egen subsystemproduksjon |
| 12. People–sted | **EKSISTERER – RE-AUDIT** | Thorvald Meyer, Olaf Rye og Jack Johnsen-spor |
| 13. Brands | **RESEARCHHULL** | ingen mapping; N/A er ikke bevist |
| 14. Discovery / relations / NextUp / search / i18n | **DELVIS / IKKE STARTET** | Språkleksikon mangler |
| 15–19. Besøk, progresjon, profil, legacy, bilder | **IKKE STARTET / RE-AUDIT** | hovedbilde reparert i fase 5; Før/etter og øvrig bilde-QA gjenstår |
| 20–24. Data-QA, UI-QA, innholds-QA, CI, ett-sted-gate | **IKKE STARTET** | lukkes til slutt |

## Aktiv fase 6 – eksakt filscope

Bare disse tre filene kan endres:

1. `data/places/by/oslo/places/birkelunden.json`
   - `spatial_profile`;
   - `temporal_profile`;
   - `history_layers`;
   - `source_summary`.
2. `reports/place-production/birkelunden-phase6-structured-profiles-audit-v1.md`.
3. `reports/place-production/birkelunden-workcard-current.md`.

Fase 6 skal ikke endre phase-5 descriptions/hashes, image/provenance, coordinates, radius, category, emne IDs, existing `nature_profile`, People, Objects, Brands, Quiz, Stories, Lesespor, routes/relations eller runtime.

## Fase 6 – profilstatus

### `spatial_profile`

**PASS / materialisert**

- `place_form: offentlig_park`;
- canonical scope = selve Birkelunden park;
- offisielt areal = `16.3` dekar;
- avgrenset av Seilduksgata, Toftes gate, Schleppegrells gate og Thorvald Meyers gate;
- Paulus' plass/kirke eksplisitt separate naboer;
- `verified_named_park_geometry` fra OSM way 3236549;
- kulturmiljøets ca. 116 dekar lagres bare som større kontekst;
- `r=190` brukes ikke som areal.

### `temporal_profile`

**PASS / materialisert** med seks hovedmilepæler:

- 1860-årene – parken anlegges;
- 1882 – kommunal overdragelse;
- 1916–1920 – parkens aktivitetsomlegging;
- 1926 – dagens musikkpaviljong;
- 1926–1955 – Bjerkelunden som offisiell navneform;
- 2006 – kulturmiljøet fredes.

Detaljert chronology eies fortsatt av Historie/Leksikon.

### `history_layers`

**PASS / 4 lag materialisert**

1. Parken blir til — 1860-årene–1882;
2. Parken legges om — 1916–1928;
3. Møter, organisering og minnespor — tidlig 1900-tall–1989;
4. Parken blir del av et fredet kulturmiljø — 1996–2006.

### `subplaces`

**BEGRUNNET N/A**

Ingen source-defined stabil intern soneinndeling finnes. Paviljong, basseng og minnesmerker er senere Object/Structure-kandidater; Paulus' plass/kirke/skole er separate naboer. Ingen kunstige parksoner materialiseres.

### `nature_profile`

**BEVART / IKKE NYTT GODKJENT**

Eksisterende felt endres ikke. Fase 4 viste at biologisk provenance fortsatt krever separat Nature-QA. Fase 6 bruker ikke strukturprofilen som anledning til å godkjenne eller pynte på naturpåstander.

### `source_summary`

**PASS / 5 sikre kilder**

- Oslo kommune – Birkelunden;
- Oslo byleksikon – Birkelunden;
- Riksantikvaren – Birkelunden, Murbyens hjerte;
- Pensjonistforbundet – Vår historie;
- OpenStreetMap way 3236549 – Birkelunden.

Interne audits og konfliktende/for smale kilder er ikke lagt i brukerrettet basisliste.

## Fase 5 – bevaringslås

Description-flaten forblir:

```text
status: ready_v4_2
claims: 17/17 verified
desc SHA-256: ea8efd6ab0ed583485b2c87dd28e4dbb9af7766c32381f57e4cb6a54e9d94dbe
popupDesc SHA-256: 670dcbc8e37004fe1c3a595ae6af1a6dcfe304f1048ce906f37df3f7e8544ff7
```

Hovedbilde/proveniens forblir Tore Sætre / Wikimedia Commons / CC BY-SA 4.0.

## Modell- og kredittmåling

```text
modellkall brukt til ny fase-6-research: 0
API-/modellkreditter brukt til ny fase-6-research: 0
```

Grunnen er at allerede verifisert claim-bank + production packet + coordinate evidence var tilstrekkelig. Dette reduserer ikke innhold eller kvalitet. Evidensmangler håndteres med begrunnet N/A eller åpen QA, ikke filler.

## Åpne hull etter fase 6

1. Nature claim-/habitat-/observasjons-QA;
2. popupfaner én for én;
3. konkret Story-episode;
4. rettighetsklare Før/etter-bilder;
5. current 2026-marked/events;
6. åpne Lesespor;
7. klikkbare/deduplicerte Kilder;
8. Språkleksikon / Birkelunden–Bjerkelunden-navnespor;
9. canonical Objects og assets;
10. full People-audit;
11. Brand-kandidataudit;
12. Structures-audit;
13. aktiv Quiz;
14. lokal rute;
15. progression/search/UI slutt-QA;
16. metadatareview av `year: 1910` dersom feltsemantikken senere krever endring.

## Neste fase

Når fase 6 er grønn og merget, starter **fase 7 – popupfaner** fra fersk `main`.

Før noen fane produseres skal runtime/eierskap auditeres: Om, Historie, Fortellinger, Før/etter, Nyheter, Lesespor, Kilder, Språk og eventuelle direktefaner. Legacy Leksikon skal ikke få konkurrere med v4.2-teksten bare fordi det finnes.