# Birkelunden – aktivt stedproduksjonskort

- Oppdatert: 2026-08-23
- Place ID: `birkelunden`
- Canonical source: `data/places/by/oslo/places/birkelunden.json`
- Aktiv baseline `main`: fase-3 merge `6983331fd2be89dd6ae9aad51f660503809a305e`
- Fase 0 merge: PR #5236 / `d3945c43f10b1f5b4e1b758f915818342f95d240`
- Fase 1 merge: PR #5239 / `2dbc70a4984e01487a2dd7289d2e93bcbb0d6217`
- Fase 2 merge: PR #5241 / `61bcf3e1dc0156582eb1e3bd9bfcee6d9ba05c06`
- Fase 3 merge: PR #5243 / `6983331fd2be89dd6ae9aad51f660503809a305e`
- Nullmåling: `reports/place-production/birkelunden-nullmaaling-v1.md`
- Fase 1 audit: `reports/place-production/birkelunden-phase1-identity-source-boundary-v1.md`
- Fase 2 shared pack: `reports/place-production/content-factory-pilot-02-grunerlokka-parks-source-pack-v1.json`
- Fase 2 review: `reports/place-production/birkelunden-phase2-content-factory-source-pack-v1.md`
- Fase 3 audit: `reports/place-production/birkelunden-phase3-coordinate-prior-work-gate-v1.md`
- Fase 4 audit: `reports/place-production/birkelunden-phase4-fagverk-nature-ownership-audit-v1.md`
- Styrende kontrakt: `docs/PLACE_PRODUCTION_CHECKLIST.md`
- Core: `docs/PLACE_PRODUCTION_CHECKLIST_CORE.md`
- Prior-work gate: `docs/PLACE_PRODUCTION_PRIOR_WORK_GATE.md`
- Content Factory: `data/places/regler/content_factory_v1.json`
- Produktkart: `docs/HISTORY_GO_PRODUCT_MAP.md`
- Klynge: **Birkelunden → Olaf Ryes plass**
- Første fullproduksjonsmål: **Birkelunden**

## Canonical identitet – låst

Birkelunden-place representerer **selve det avgrensede parkrommet Birkelunden på Grünerløkka**.

```text
Birkelunden park:              16,3 dekar  – Oslo kommune
Birkelunden kulturmiljø:     ca. 116 dekar – Riksantikvaren
Paulus' plass:                  4,4 dekar  – Oslo kommune
```

Canonical `birkelunden` representerer ikke automatisk det større fredede kulturmiljøet, Birkelunden holdeplass, Paulus' plass, Paulus kirke, Grünerløkka skole, omkringliggende leiegårder eller hele Grünerløkka.

Koordinatevidensen låser parkidentiteten til OSM way `3236549`.

## Fasestatus

| Fase | Status | Beslutning |
| --- | --- | --- |
| 0. Nullmåling | **FERDIG OG MERGET** | PR #5236 |
| 1. Canonical identity/source | **FERDIG OG MERGET** | PR #5239; park vs. kulturmiljø/Paulus' plass låst |
| 2. Content Factory source/claim pack | **FERDIG OG MERGET** | PR #5241; 14 source/proveniensposter, 26 scopede claims, conflicts/held-backs/gaps |
| 3. Koordinater/geometri | **ALLEREDE FERDIG OG MERGET** | PR #5243; `verified_geometry`, OSM way 3236549, ingen ny geokoding |
| 4. Kategori, Badges, emner, Fagverk og Nature-eierskap | **KLAR FOR REVIEW** | `by` + to `em_by_*` beholdes; ingen underbadge-fyll; Nature-eierskap avklart, biologisk slutt-QA står åpen |
| 5. `desc` + `popupDesc` v4.2 | **EKSISTERER – RE-AUDIT / MULIG REVISJON** | fyldig tekst finnes; production package mangler; kulturmiljøscope må skilles |
| 6. Strukturerte place-profiler | **DELVIS** | `nature_profile` finnes; spatial/temporal/history/source-profiler mangler |
| 7. Popupfaner | **IKKE STARTET** | legacy Leksikon er source-tom/generisk og må auditeres |
| 8. Rundinger | **IKKE FERDIG** | ingen auditert `round_profile`; Objects/Brands/Structures ikke dokumentert klare |
| 9. På stedet | **IKKE STARTET** | dagens onsite-kontrakt; ingen legacy tasks-fyll |
| 10. Quiz | **REELT PRODUKSJONSHULL** | `quiz_profile` finnes, men ingen aktiv Birkelunden-quiz i manifestet |
| 11. Observer / Notat / Rute | **IKKE STARTET / RUTE MANGLER** | ingen Birkelunden-stopp funnet i `routes.json` eller `routes_walks.json` |
| 12. People–sted | **EKSISTERER – RE-AUDIT** | Thorvald Meyer primæranker; Olaf Rye sekundær kobling; Jack Johnsen sterk candidate |
| 13. Brands | **RESEARCHHULL** | ingen `brands_by_place`-mapping; null mapping er ikke N/A-bevis |
| 14. Discovery / relations / NextUp / search / i18n | **DELVIS / IKKE STARTET** | Dælenenga-relasjon finnes; Språkleksikon mangler |
| 15–19. Besøk, progresjon, profil, legacy, bilder | **IKKE STARTET / RE-AUDIT** | hovedbilde finnes; øvrige flater gjenstår |
| 20–24. Data-QA, UI-QA, innholds-QA, CI, ett-sted-gate | **IKKE STARTET** | lukkes først etter full produksjon |

## Fase 4 – aktivt scope

Aktivt filscope:

1. `reports/place-production/birkelunden-phase4-fagverk-nature-ownership-audit-v1.md`;
2. `reports/place-production/birkelunden-workcard-current.md`.

Fase 4 endrer **ikke** canonical Place, kategori, emner, underbadges, Fagverk, Nature-data, description, Quiz, People/Objects/Brands, Stories/Lesespor, routes/relations eller runtime.

## Fase 4 – låste beslutninger

### Primærkategori

`category: by` beholdes. Birkelunden er et urbant offentlig parkrom der sted/struktur, bruk/bevegelse, historiske lag og planlegging er den riktige primære History GO-fagidentiteten.

`natur` blir ikke primærkategori bare fordi parken har grøntinnhold og artsmapping.

### Underbadges

Ingen `underbadge_ids` legges til. Feltet er vurdert, ikke glemt.

Mulige By-underbadges som `byplanlegging` eller `monumenter_og_landemerker` ville overdrive delspor som allerede eies bedre av emner, People/Objects eller senere historiske flater. Ingen underbadge-kvote finnes.

### Emner

Behold:

- `em_by_parker_som_sosial_infrastruktur`;
- `em_by_opphold_vs_gjennomgang`.

Begge ligger i Fagverk-kapittelet `byliv-offentlige-rom`, som har `editorialStatus: chapter_ready`.

Kapittelets anvendelsesmodul materialiserer Birkelunden selv som feltcase:

- undersøk parken på to tidspunkt;
- skill aktivitet og ro;
- identifiser opphold, gjennomgang eller begge deler;
- trekk ikke sterkere konklusjoner om tidsvariasjon enn observasjonene tillater.

`relatedPlaces` beskriver Birkelunden som «Feltcase for park, opphold, aktivitet, ro og tidsvariasjon».

Ingen nye emner legges til bare for volum.

### Fagverk

By er materialisert i `data/fagverk/fagverk_portal.json`:

```text
badgePage: data/fag/by/merke_by.html
subjectPage: fagverk.html?subject=by
subjectStatus: materialized
```

Canonical stedsside er `fagverk-sted.html?place=birkelunden`.

### Nature-eierskap

Birkelunden har både inline `nature_profile` og en aktiv entry i `data/natur/nature_place_map.json`.

Eiergrensen låses slik:

```text
PRIMARY PLACE CATEGORY: by
PLACE LANDSCAPE LAYER: nature_profile
FLORA/FAUNA OWNERSHIP: data/natur/* + nature_place_map_bridge
NATURE CATEGORY PROMOTION: NEI
BIOLOGICAL COMPLETION: IKKE GODKJENT I FASE 4
```

Nature-mappingen har fire flora-ID-er og tre fauna-ID-er for Birkelunden og kan spores til `nature_unlock_map.json`. Samtidig sier mappingens egen metadata at ekstern validering fortsatt trengs, og Birkelunden-entryen mangler den eksplisitte `artskartCandidateSource`-blokken som finnes på flere andre parker.

Derfor beholdes eksisterende Nature-data urørt, men dens eksistens brukes ikke som sluttgodkjenning. Senere Nature-QA må kontrollere habitat, observasjonsgrunnlag, aktualitet, koordinatusikkerhet og pedagogisk verdi. `nature_profile` må også source-/claim-auditeres før sluttgodkjenning.

## Fase 2–3 bevares

Shared source pack har fortsatt:

- 14 source/proveniensposter;
- 26 scopede claims;
- 5 held-back claims;
- 4 konflikter/usikkerheter;
- park 16,3 daa og kulturmiljø ca. 116 daa eksplisitt separert;
- Spaniamonumentet `1989` verifisert mot Oslo byleksikon + Nils Aas Kunstverksted, mens SNL `1889` er konfliktmarkert.

Coordinate-kjeden forblir:

```text
lat: 59.92634
lon: 10.76013
r: 190
coordType: park_anchor
coordStatus: verified_geometry
coordSourceId: osm-way:3236549
```

## Kjente hull etter fase 4

1. `desc`/`popupDesc` må gjennom v4.2 claim-/scope-review og production package mangler;
2. `nature_profile` og Nature-mapping trenger senere biologisk kilde-QA;
3. 2026-marked/events/current use må ferskverifiseres;
4. rettighetsklare historiske/nå-bilder av selve parken mangler;
5. canonical Object-ID/eierskap/assets for paviljong, Føll, Jack Johnsen-byste, Spaniamonument og eventuelt basseng;
6. Story med konkret episode; Jack Johnsen-sporet er sterk kandidat;
7. aktiv Quiz;
8. full own-place People-audit;
9. Brand-kandidataudit;
10. Structure-audit som ekskluderer Paulus kirke/skole/nabobygg;
11. Språkleksikon-research utover navnechronology;
12. åpne Lesespor;
13. lokal Grünerløkka-rute;
14. metadatareview av `year: 1910`;
15. brukerrettet `source_summary` / inspectable HTTPS-kilder;
16. alle senere popup-/onsite-/progression-/UI-sluttgater.

## Content Factory-regler som fortsatt gjelder

- Olaf Ryes plass-innhold → Birkelunden: **NEI** uten eksplisitt shared claim.
- Kulturmiljøets 116 dekar → parkens 16,3 dekar: **NEI**.
- Paulus kirke/skole → Birkelunden Objects/Structures: **NEI** uten korrekt canonical eierskap.
- Nature-mapping finnes → biologisk ferdig: **NEI**.
- eksisterende generic/source-tomt Leksikon → evidens: **NEI**.
- fravær av Brand/Story/Språk → N/A: **NEI** uten faktisk kandidatresearch.

Alle brukerrettede faser skal fortsatt bestå name-swap, cross-place duplicate, place-specific evidence anchors, source→claim→text, local experience, fullness og own-place boundary.

## Neste fase

Når fase 4 er grønn, merget og kontrollert på fersk `main`, starter **fase 5 – `desc` + `popupDesc` v4.2**.

Det blir første Pilot-02-fase som kan endre canonical brukerrettet Birkelunden-tekst. Den skal bevare richness, men rette park/kulturmiljø-scope, bygge production package og mappe hver setning til verifiserte phase-2 claims.