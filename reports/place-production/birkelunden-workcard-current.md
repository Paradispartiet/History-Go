# Birkelunden – aktivt stedproduksjonskort

- Oppdatert: 2026-08-23
- Place ID: `birkelunden`
- Canonical source: `data/places/by/oslo/places/birkelunden.json`
- Aktiv fase-5-baseline `main`: `c02ce0993d2949efea19e70ca1976f32bd85f290`
- Fase 0 merge: PR #5236 / `d3945c43f10b1f5b4e1b758f915818342f95d240`
- Fase 1 merge: PR #5239 / `2dbc70a4984e01487a2dd7289d2e93bcbb0d6217`
- Fase 2 merge: PR #5241 / `61bcf3e1dc0156582eb1e3bd9bfcee6d9ba05c06`
- Fase 3 merge: PR #5243 / `6983331fd2be89dd6ae9aad51f660503809a305e`
- Fase 4 merge: PR #5244 / `ffca364854dcf4dec37b5129595f13017d5a7589`
- Nullmåling: `reports/place-production/birkelunden-nullmaaling-v1.md`
- Fase 1 audit: `reports/place-production/birkelunden-phase1-identity-source-boundary-v1.md`
- Fase 2 shared pack: `reports/place-production/content-factory-pilot-02-grunerlokka-parks-source-pack-v1.json`
- Fase 2 review: `reports/place-production/birkelunden-phase2-content-factory-source-pack-v1.md`
- Fase 3 audit: `reports/place-production/birkelunden-phase3-coordinate-prior-work-gate-v1.md`
- Fase 4 audit: `reports/place-production/birkelunden-phase4-fagverk-nature-ownership-audit-v1.md`
- Fase 5 review: `reports/place-production/birkelunden-phase5-description-v4_2-review-v1.md`
- Fase 5 production package: `data/places/production/birkelunden.json`
- Image backlog: `data/places/place_image_backlog_summary.json`
- Styrende kontrakt: `docs/PLACE_PRODUCTION_CHECKLIST.md`
- Description-kontrakt: `data/places/regler/PLACE_DESCRIPTION_CANONICAL.md`
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
| 4. Kategori/Badges/emner/Fagverk/Nature-eierskap | **ALLEREDE FERDIG / EIERSKAP AVKLART OG MERGET** | PR #5244; `by`, to `em_by_*`, ingen underbadge-fyll; biologisk Nature-QA fortsatt åpen |
| 5. `desc` + `popupDesc` v4.2 + changed-place image gate | **KLAR FOR REVIEW / CI** | canonical tekst + production packet + lisensiert stedsbilde + backlogoppdatering materialisert |
| 6. Strukturerte place-profiler | **DELVIS / NESTE** | `nature_profile` finnes; spatial/temporal/history/source-profiler må produseres source-first |
| 7. Popupfaner | **IKKE STARTET** | hver fane separat; legacy Leksikon må saneres/auditeres |
| 8. Rundinger | **IKKE FERDIG** | Objects/Brands/Structures/People må først få substans- og eieraudit |
| 9. På stedet | **IKKE STARTET** | onsite-kontrakt |
| 10. Quiz | **REELT PRODUKSJONSHULL** | ingen aktiv Birkelunden-quiz i quizmanifestet |
| 11. Observer / Notat / Rute | **IKKE STARTET / RUTE MANGLER** | egen subsystemproduksjon |
| 12. People–sted | **EKSISTERER – RE-AUDIT** | Thorvald Meyer, Olaf Rye og Jack Johnsen-spor |
| 13. Brands | **RESEARCHHULL** | ingen mapping; N/A er ikke bevist |
| 14. Discovery / relations / NextUp / search / i18n | **DELVIS / IKKE STARTET** | Språkleksikon mangler |
| 15–19. Besøk, progresjon, profil, legacy, bilder | **IKKE STARTET / RE-AUDIT** | fase 5 reparerer hovedbilde; Før/etter og øvrig bilde-QA gjenstår |
| 20–24. Data-QA, UI-QA, innholds-QA, CI, ett-sted-gate | **IKKE STARTET** | lukkes til slutt |

## Aktiv fase 5 – eksakt filscope

Bare disse fem filene kan endres:

1. `data/places/by/oslo/places/birkelunden.json`
   - `desc`;
   - `popupDesc`;
   - `image`;
   - `cardImage`;
   - `imageCredit`;
   - `imageLicense`;
   - `imageSourceUrl`.
2. `data/places/production/birkelunden.json`.
3. `data/places/place_image_backlog_summary.json`.
4. `reports/place-production/birkelunden-phase5-description-v4_2-review-v1.md`.
5. `reports/place-production/birkelunden-workcard-current.md`.

Fase 5 skal ikke endre koordinater, radius, category, emne IDs, Nature, People, Objects, Brands, Quiz, Stories, Lesespor, routes/relations eller runtime.

## Fase 5 – tekststatus

### `desc`

```text
65 ord
2 setninger
SHA-256 ea8efd6ab0ed583485b2c87dd28e4dbb9af7766c32381f57e4cb6a54e9d94dbe
```

### `popupDesc`

```text
301 ord
6 avsnitt
18 setninger
SHA-256 670dcbc8e37004fe1c3a595ae6af1a6dcfe304f1048ce906f37df3f7e8544ff7
```

### Claim-/reviewstatus

```text
production status: ready_v4_2
claims: 17/17 verified
sentence coverage: 20/20 synlige setninger
factual review: passed
editorial review: passed
quiz readiness: 11 direkte faktaspørsmål
```

Hashene er kontrollert byte-for-byte mot canonical teksten på fase-5-grenen.

## Fase 5 – viktigste tekstkorrigeringer

1. Parkens **16,3 dekar** og kulturmiljøets **ca. 116 dekar** skilles eksplisitt.
2. `15 kvartaler / 139 bygårder` eies av kulturmiljøet, ikke parkflaten.
3. `Norges første ...`-påstanden er fjernet fra brukerrettet tekst fordi strong-claim-gaten ikke er oppfylt.
4. SNLs konfliktende `1889` for Spaniamonumentet er ikke brukt; `1989` støttes av Oslo byleksikon + Nils Aas Kunstverksted.
5. Current søndagsmarked er holdt tilbake fordi current-volatile re-verifikasjon mangler.
6. Source-tomme detaljer fra gammel popuptekst er ikke videreført bare fordi de lød plausible.
7. `year: 1910` beholdes som eksisterende metadata, men brukes ikke som etableringsår i tekst, claims eller quiz-readiness.

## Fase 5 – changed-place image gate

De gamle canonical bildebanene var:

```text
bilder/places/birkelunden.JPG
bilder/kort/places/birkelunden.PNG
```

Begge er kontrollert mot repoet og returnerer 404. De kan derfor ikke beholdes når Place endres.

Ny image-kjede:

```text
image/cardImage:
https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/Birkelunden_%28121153%29.jpg/800px-Birkelunden_%28121153%29.jpg

imageCredit: Tore Sætre / Wikimedia Commons
imageLicense: CC BY-SA 4.0
imageSourceUrl: https://commons.wikimedia.org/wiki/File:Birkelunden_(121153).jpg
```

Commons-filsiden er kontrollert 2026-08-23 og viser at bildet faktisk forestiller Birkelunden park på Grünerløkka, er fotografert av Tore Sætre og publisert under CC BY-SA 4.0 med attribusjonskrav.

Backlog-effekt:

```text
validRemote:      29 → 30
invalidLocalPath: 36 → 35
remaining:      1371 → 1370
By valid:          28 → 29
By invalid:        36 → 35
```

Dette lukker bare Birkelundens changed-place bildeproblem. Før/etter-bilder, Objects-assets og øvrig bilde-QA gjenstår i sine egne faser.

## Fase 5 – innhold som nå er claim-sporbart

- parkareal og fysisk avgrensning;
- anlegg i 1860-årene;
- Thorvald Meyer og overdragelsen i 1882;
- vilkår om at parken ikke skulle bebygges;
- omlegging 1916–20;
- musikkpaviljong 1926 / Otto Hald;
- vannbasseng 1927–28;
- Birkelunden/Bjerkelunden-navnehistorien;
- Jack Johnsen / Venner i Bjerkelunden 1937;
- arbeiderbevegelsens massemønstringer tidlig 1900-tall;
- Ørnulf Basts `Føll`, 1953;
- Jack Johnsen-bysten, 1984;
- parkopprusting 1984–86;
- Nils Aas' Spaniamonument, 1989;
- kulturmiljøets fredningsprosess 1996–2006;
- kulturmiljøets 116 dekar / skole / kirke / 15 kvartaler / 139 bygårder;
- kommunalt listede 2026-fasiliteter.

## Fase 5 – anti-generisk gate

- **name-swap:** passerer; teksten kollapser ved bytte til en annen park;
- **cross-place duplicate:** ingen delt Pilot-prosa;
- **specific evidence anchors:** alle avsnitt har navngitt person, år, fysisk element eller scope-fakta;
- **source→claim→text:** alle setninger dekket;
- **local experience:** parken og kulturmiljøet blir fysisk/semantisk lesbare som to nivåer;
- **fullness:** description-flaten er rik, men resten av stedet står uttrykkelig åpent.

## Bevarte beslutninger fra fase 0–4

### Fagverk

- primærkategori `by`;
- `em_by_parker_som_sosial_infrastruktur`;
- `em_by_opphold_vs_gjennomgang`;
- ingen underbadge-fyll;
- By-faget materialized;
- Birkelunden er eksplisitt feltcase i `byliv-offentlige-rom`.

### Nature

- `nature_profile` er tverrfaglig place-lag;
- flora/fauna eies av `data/natur/*` og bridge;
- mapping finnes, men biologisk sluttgodkjenning er fortsatt åpen.

### Koordinater

```text
59.92634, 10.76013
r: 190
park_anchor
verified_geometry
osm-way:3236549
```

## Åpne hull etter fase 5

1. strukturerte `spatial_profile`, `temporal_profile`, `history_layers` og `source_summary`;
2. Nature claim-/habitat-/observasjons-QA;
3. current 2026-marked/events;
4. rettighetsklare Før/etter-bilder;
5. canonical Objects og assets;
6. Story med konkret episode;
7. aktiv Quiz;
8. full People-audit;
9. Brand-kandidataudit;
10. Structures-audit;
11. Språkleksikon;
12. åpne Lesespor;
13. lokal rute;
14. popupfaner én for én;
15. progression/search/UI slutt-QA.

## Neste fase

Når fase 5 er grønn og merget, starter **fase 6 – strukturerte place-profiler** fra fersk `main`.

Fase 6 skal materialisere bare source-støttede profiler. `spatial_profile` skal bruke **16,3 dekar parkareal**, aldri 116-dekar-kulturmiljøet. `temporal_profile` og `history_layers` skal bruke verifiserte milepæler uten å kopiere hele popupteksten. `source_summary` skal inneholde inspectable brukerrettede HTTPS-kilder, ikke interne auditnotater.