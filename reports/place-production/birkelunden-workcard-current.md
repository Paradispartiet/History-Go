# Birkelunden – aktivt stedproduksjonskort

- Oppdatert: 2026-08-23
- Place ID: `birkelunden`
- Canonical source: `data/places/by/oslo/places/birkelunden.json`
- Aktiv baseline `main`: fase-1 merge `2dbc70a4984e01487a2dd7289d2e93bcbb0d6217`
- Fase 0 merge: PR #5236 / `d3945c43f10b1f5b4e1b758f915818342f95d240`
- Fase 1 merge: PR #5239 / `2dbc70a4984e01487a2dd7289d2e93bcbb0d6217`
- Nullmåling: `reports/place-production/birkelunden-nullmaaling-v1.md`
- Fase 1 audit: `reports/place-production/birkelunden-phase1-identity-source-boundary-v1.md`
- Fase 2 shared pack: `reports/place-production/content-factory-pilot-02-grunerlokka-parks-source-pack-v1.json`
- Fase 2 review: `reports/place-production/birkelunden-phase2-content-factory-source-pack-v1.md`
- Styrende kontrakt: `docs/PLACE_PRODUCTION_CHECKLIST.md`
- Core: `docs/PLACE_PRODUCTION_CHECKLIST_CORE.md`
- Prior-work gate: `docs/PLACE_PRODUCTION_PRIOR_WORK_GATE.md`
- Content Factory: `data/places/regler/content_factory_v1.json`
- Produktkart: `docs/HISTORY_GO_PRODUCT_MAP.md`
- Klynge: **Birkelunden → Olaf Ryes plass**
- Første fullproduksjonsmål: **Birkelunden**

## Canonical identitet – låst

Birkelunden-place representerer **selve det avgrensede parkrommet Birkelunden på Grünerløkka**.

Kildene skiller tre relevante areal-/objektnivåer:

```text
Birkelunden park:              16,3 dekar  – Oslo kommune
Birkelunden kulturmiljø:     ca. 116 dekar – Riksantikvaren
Paulus' plass:                  4,4 dekar  – Oslo kommune
```

Canonical `birkelunden` representerer ikke automatisk:

- det større fredede `Birkelunden kulturmiljø`;
- Birkelunden holdeplass;
- Paulus' plass;
- Paulus kirke;
- Grünerløkka skole;
- omkringliggende leiegårder eller hele Grünerløkka.

Koordinatevidensen låser parkidentiteten til OSM way `3236549`. Fase 1 fant ingen grunn til å endre canonical metadata eller koordinater.

## Fasestatus

| Fase | Status | Baseline / beslutning |
| --- | --- | --- |
| 0. Nullmåling | **FERDIG OG MERGET** | PR #5236 / `d3945c43…`; kun rapport + workcard |
| 1. Canonical identity/source | **FERDIG OG MERGET** | PR #5239 / `2dbc70a4…`; park vs. kulturmiljø/Paulus' plass kildeavgrenset |
| 2. Content Factory source/claim pack | **KLAR FOR REVIEW** | 14 source/proveniensposter, 26 scopede claims, konflikter/held-backs/gaps; ingen canonical innholdsendring |
| 3. Koordinater/geometri | **EKSISTERER – forventet ALLEREDE FERDIG** | `verified_geometry`, OSM way 3236549; prior-work gate neste |
| 4. Kategori, Badges, emner, Fagverk og Nature-eierskap | **EKSISTERER DELVIS – RE-AUDIT** | kategori `by`, to `em_by_*`, `nature_profile`; underbadges ikke låst |
| 5. `desc` + `popupDesc` v4.2 | **EKSISTERER – RE-AUDIT / MULIG REVISJON** | fyldig tekst finnes, production package mangler; kulturmiljøscope må skilles eksplisitt |
| 6. Strukturerte place-profiler | **DELVIS** | `nature_profile` finnes; spatial/temporal/history/source-profiler mangler |
| 7. Popupfaner | **IKKE STARTET** | legacy Leksikon er source-tom/generisk og må auditeres; faner separat |
| 8. Rundinger | **IKKE FERDIG** | ingen auditert `round_profile`; By-standardens objects/brands/structures er ikke dokumentert klar |
| 9. På stedet | **IKKE STARTET** | dagens onsite-kontrakt; ingen legacy tasks-fyll |
| 10. Quiz | **REELT PRODUKSJONSHULL** | `quiz_profile` finnes, men ingen aktiv Birkelunden-quiz i manifestet |
| 11. Observer / Notat / Rute | **IKKE STARTET / RUTE MANGLER** | ingen Birkelunden-stopp funnet i `routes.json` eller `routes_walks.json` |
| 12. People–sted | **EKSISTERER – RE-AUDIT** | Thorvald Meyer primæranker; Olaf Rye sekundær kobling; Jack Johnsen er sterk ny candidate |
| 13. Brands | **RESEARCHHULL** | ingen `brands_by_place`-mapping; null mapping er ikke N/A-bevis |
| 14. Discovery / relations / NextUp / search / i18n | **DELVIS / IKKE STARTET** | Dælenenga-relasjon finnes; Språkleksikon mangler |
| 15–19. Besøk, progresjon, profil, legacy, bilder | **IKKE STARTET / RE-AUDIT** | hovedbilde finnes; slutt-QA og øvrige flater gjenstår |
| 20–24. Data-QA, UI-QA, innholds-QA, CI, ett-sted-gate | **IKKE STARTET** | lukkes først etter full produksjon |

## Fase 2 – aktivt scope

Aktivt filscope:

1. `reports/place-production/content-factory-pilot-02-grunerlokka-parks-source-pack-v1.json`;
2. `reports/place-production/birkelunden-phase2-content-factory-source-pack-v1.md`;
3. `reports/place-production/birkelunden-workcard-current.md`.

Fase 2 skal **ikke** endre:

- canonical Birkelunden-place;
- `year`;
- koordinater;
- `desc` / `popupDesc`;
- Nature-data;
- People/Objects/Brands;
- Leksikon;
- Quiz;
- Stories;
- Lesespor;
- routes/relations;
- runtime.

## Fase 2 – source/claim-status

Shared packen registrerer:

- 14 source/proveniensposter totalt;
- 13 nye eksterne kilder for Pilot 02;
- 1 gjenbrukt provenance fra godkjent coordinate-evidence;
- 26 claims med eksplisitt place/entity-scope;
- 20 claims tilgjengelige som Birkelunden-researchgrunnlag for senere review;
- 7 downstream Olaf Ryes-claim seeds;
- 5 held-back claims;
- 4 eksplisitte konflikter/usikkerheter.

Tallene er **kun efficiency-/researchmåling**, aldri completion eller kvalitetsbevis.

### Viktigste Birkelunden-claims

Pakken låser blant annet:

- 16,3 dekar park + fysisk avgrensning;
- anlegg i 1860-årene;
- Thorvald Meyer-overdragelse i 1882;
- gavevilkår om at parken ikke skulle bebygges;
- fysisk omlegging 1916–20;
- dagens paviljong fra 1926, Otto Hald;
- vannbasseng 1927–28;
- Birkelunden/Bjerkelunden-navnehistorie 1926–1955;
- `Føll`, 1953;
- Jack Johnsens Birkelunden-baserte organisering og `Venner i Bjerkelunden`, 1937;
- Jack Johnsen-byste, 1984;
- parkopprusting 1984–86;
- Nils Aas' Spaniamonument, **1989**;
- Birkelunden park som én del av det større kulturmiljøet fredet i 2006;
- 2026-fasiliteter fra Oslo kommune, markert current-volatile;
- arbeiderbevegelsens massemønstringer tidlig 1900-tall som research-seed, ikke ferdig Story;
- eksisterende OSM-geometri som gjenbrukt coordinate-proveniens.

## Konflikter og held-back-claims

### Spaniamonumentet

- Oslo byleksikon: `1989`;
- Nils Aas Kunstverksted: `1989`;
- SNL Birkelunden: `1889`.

Beslutning: **1989** er godkjent claim-verdi. SNLs `1889` er registrert som kildekonflikt og sperres for akkurat dette årstallet; den blir ikke stilletiende ignorert.

### Park vs. kulturmiljø

`16,3 dekar` og `ca. 116 dekar` beskriver ulike objektnivåer. 116 dekar kan aldri brukes som parkens `spatial_profile.area_m2`, og 15 kvartaler/139 bygårder kan ikke bli parkens Structures.

### Held back

- sterk «første fredede bykulturmiljø»-claim;
- «Norges eldste pensjonistforening»;
- SNLs 1889-datering;
- søndagsmarked som fast current-2026-claim uten fersk operatør/offisiell verifikasjon;
- arbeidsbevegelsesbruk blåst opp til Story uten konkret episode/narrativ akse.

## Object-/People-/Story-kandidater som researchen nå peker på

- Thorvald Meyer → People relation;
- Jack Johnsen → People + Story-kandidat;
- musikkpaviljongen → Object-kandidat;
- `Føll` → Object-kandidat;
- Jack Johnsen-bysten → Object-kandidat;
- Spaniamonumentet → Object-kandidat;
- arbeiderbevegelsens parkbruk → historisk use-claim, men trenger episode research før Story.

Kandidat betyr ikke materialisert eller godkjent subsysteminnhold.

## Olaf Ryes downstream-seed

Shared packen inneholder bare seed-evidens, ikke approval:

- separat fysisk plassidentitet;
- 1863 kommunalt kjøpt løkke;
- regulert/navngitt plass 1864;
- parkopparbeidelse 1890;
- Eilert Sundt-byste 1892;
- fontene 1927;
- 2026-fasiliteter fra kommunen, markert current-volatile;
- felles Grünerløkka-kontekst via Thorvald Meyers gate.

Når Olaf Ryes plass senere tas, starter det med egen nullmåling og egen full checklist.

## Kjente Birkelunden-hull etter fase 2

1. kilder for eksisterende `nature_profile` / reell økologi og habitat;
2. 2026-ferskkontroll av marked, events og recurring use;
3. rettighetsklare historiske/nå-bilder av selve parken;
4. canonical Object-ID/eierskap/assets for paviljong, Føll, Jack Johnsen-byste, Spaniamonument og eventuelt basseng;
5. Story med konkret episode; Jack Johnsen-sporet er sterk kandidat;
6. aktiv Quiz;
7. full own-place People-audit;
8. Brand-kandidataudit;
9. Structure-audit som ekskluderer Paulus kirke/skole/nabobygg;
10. Språkleksikon-research utover navnechronology;
11. åpne Lesespor;
12. lokal Grünerløkka-rute;
13. metadatareview av `year: 1910`;
14. brukerrettet `source_summary` / inspectable HTTPS-kilder;
15. alle senere popup-/onsite-/progression-/UI-sluttgater.

## Content Factory-regler som fortsatt gjelder

- Olaf Ryes plass-innhold → Birkelunden: **NEI** uten eksplisitt shared claim.
- Thorvald Meyers gate-innhold → Birkelunden: **NEI** ved nærhet alene.
- Kulturmiljøets 116 dekar → parkens 16,3 dekar: **NEI**.
- Paulus kirke/skole → Birkelunden Objects/Structures: **NEI** uten korrekt canonical eierskap.
- eksisterende generic/source-tomt Leksikon → evidens: **NEI**.
- fravær av Brand/Story/Språk → N/A: **NEI** uten faktisk kandidatresearch.

Alle brukerrettede faser skal fortsatt bestå name-swap, cross-place duplicate, specific evidence anchors, source→claim→text, local experience, fullness og own-place boundary.

API-/modellkreditter kan aldri brukes som begrunnelse for mindre innhold, generisk tekst eller N/A.

## Neste fase

Når fase 2 er grønn, merget og kontrollert på fersk `main`, starter **fase 3 – koordinater/geometri, prior-work gate**.

Forventning: eksisterende coordinate-evidence (`verified_geometry`, OSM way 3236549) skal klassifiseres **ALLEREDE FERDIG** dersom identitet, geometri og applied coordinates fortsatt består dagens kontrakt. Ingen ny geokoding skal utføres bare for å lage en faseendring.