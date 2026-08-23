# Birkelunden – aktivt stedproduksjonskort

- Oppdatert: 2026-08-23
- Place ID: `birkelunden`
- Canonical source: `data/places/by/oslo/places/birkelunden.json`
- Aktiv baseline `main`: fase-0 merge `d3945c43f10b1f5b4e1b758f915818342f95d240`
- Fase 0 merge: PR #5236 / `d3945c43f10b1f5b4e1b758f915818342f95d240`
- Nullmåling: `reports/place-production/birkelunden-nullmaaling-v1.md`
- Fase 1 audit: `reports/place-production/birkelunden-phase1-identity-source-boundary-v1.md`
- Styrende kontrakt: `docs/PLACE_PRODUCTION_CHECKLIST.md`
- Core: `docs/PLACE_PRODUCTION_CHECKLIST_CORE.md`
- Prior-work gate: `docs/PLACE_PRODUCTION_PRIOR_WORK_GATE.md`
- Content Factory: `data/places/regler/content_factory_v1.json`
- Produktkart: `docs/HISTORY_GO_PRODUCT_MAP.md`
- Klynge: **Birkelunden → Olaf Ryes plass**
- Første fullproduksjonsmål: **Birkelunden**

## Canonical identitet – låst i fase 1

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

### Description-scope som skal bæres videre

Dagens `popupDesc` omtaler også verneområdet med 116 dekar, 15 kvartaler og 139 bygårder. Disse tallene tilhører **kulturmiljøet**, ikke parkens fysiske utstrekning.

Fase 2 og 5 skal derfor eksplisitt skille:

1. park-eide claims;
2. kulturmiljø-/områdeclaims;
3. relasjonsclaims om nabosteder og omkringliggende bystruktur.

## Fasestatus

| Fase | Status | Baseline / beslutning |
| --- | --- | --- |
| 0. Nullmåling | **FERDIG OG MERGET** | PR #5236 / `d3945c43…`; kun rapport + workcard, ingen canonical dataendring |
| 1. Canonical identity/source | **KLAR FOR REVIEW** | park vs. kulturmiljø og Paulus' plass er kildeavgrenset; ingen canonical dataendring nødvendig |
| 2. Content Factory source/claim pack | **IKKE STARTET** | delt Grünerløkka-research, men eksplisitt claim→place-scope |
| 3. Koordinater/geometri | **EKSISTERER – forventet ALLEREDE FERDIG** | `verified_geometry`, OSM way 3236549; må bare re-auditeres, ikke geokodes på nytt |
| 4. Kategori, Badges, emner, Fagverk og Nature-eierskap | **EKSISTERER DELVIS – RE-AUDIT** | kategori `by`, to `em_by_*`, `nature_profile`; underbadges ikke låst |
| 5. `desc` + `popupDesc` v4.2 | **EKSISTERER – RE-AUDIT / MULIG REVISJON** | fyldig tekst finnes, men production package mangler og kulturmiljøscope må skilles eksplisitt |
| 6. Strukturerte place-profiler | **DELVIS** | `nature_profile` finnes; spatial/temporal/history/source-profiler mangler |
| 7. Popupfaner | **IKKE STARTET** | legacy Leksikon er source-tom/generisk og må auditeres; øvrige faner behandles separat |
| 8. Rundinger | **IKKE FERDIG** | ingen auditert `round_profile`; By-standardens objects/brands/structures er ikke dokumentert klar |
| 9. På stedet | **IKKE STARTET** | dagens onsite-kontrakt skal brukes; ingen legacy tasks-fyll |
| 10. Quiz | **REELT PRODUKSJONSHULL** | `quiz_profile` finnes, men ingen `targetId: birkelunden` i quizmanifestet |
| 11. Observer / Notat / Rute | **IKKE STARTET / RUTE MANGLER** | ingen Birkelunden-stopp funnet i `routes.json` eller `routes_walks.json` |
| 12. People–sted | **EKSISTERER – RE-AUDIT** | Thorvald Meyer har Birkelunden som primæranker; Olaf Rye er sekundær kobling fra naboplassen |
| 13. Brands | **RESEARCHHULL** | ingen `brands_by_place`-mapping; null mappings er ikke N/A-bevis |
| 14. Discovery / relations / NextUp / search / i18n | **DELVIS / IKKE STARTET** | Dælenenga-relasjon finnes i place; Språkleksikon mangler |
| 15–19. Besøk, progresjon, profil, legacy, bilder | **IKKE STARTET / RE-AUDIT** | hovedbilde finnes; slutt-QA og øvrige flater gjenstår |
| 20–24. Data-QA, UI-QA, innholds-QA, CI, ett-sted-gate | **IKKE STARTET** | lukkes først etter full produksjon |

## Fase 1 – aktivt scope

Aktivt filscope:

1. `reports/place-production/birkelunden-phase1-identity-source-boundary-v1.md`;
2. `reports/place-production/birkelunden-workcard-current.md`.

Fase 1 skal **ikke** endre:

- canonical Birkelunden-place;
- `year`;
- koordinater;
- `desc` / `popupDesc`;
- Nature-data;
- People;
- Leksikon;
- Quiz;
- Stories;
- Lesespor;
- Brands;
- routes/relations;
- runtime.

## Source boundary – låste regler

### Direkte park-scope

- Oslo kommune – Birkelunden: parkareal 16,3 dekar og fysisk avgrensning;
- Oslo byleksikon – Birkelunden: parkhistorie, 1860-årene, 1882-overdragelsen, parkendringer og navnehistorie;
- OSM way 3236549: parkpolygon/geometri.

### Større kulturmiljøscope

- Riksantikvaren – Birkelunden kulturmiljø: ca. 116 dekar, parken + Paulus kirke + Grünerløkka skole + 15 kvartaler med 139 bygårder;
- disse tallene kan brukes som kulturmiljøkontekst, ikke som parkens areal eller parkens bygningsbestand.

### Egen naboplass

- Oslo kommune – Paulus' plass: egen plass på 4,4 dekar som omkranser Paulus kirke og ligger ved Birkelunden;
- skal ikke brukes som Birkelunden-subplace, Object/Structure eller Før/etter-proxy uten en eksplisitt senere kontrakt som faktisk tillater relasjonen.

## Historisk identitet som sendes til fase 2

Oslo byleksikon støtter som claim-kandidater:

- parken ble anlagt i 1860-årene;
- Thorvald Meyer overlot den gratis til kommunens beplantningsvesen i 1882;
- navnet var Birkelunden fra starten;
- `Bjerkelunden` var navneformen 1926–1955;
- Birkelunden ble navnet igjen i 1955.

`year: 1910` er **ikke** endret. Senere metadatareview må først avklare feltsemantikken; tallet skal uansett ikke brukes brukerrettet som etableringsår uten ny evidens.

## Eksisterende arbeid som skal bevares inntil egen audit sier noe annet

- manifest-loadet canonical Place;
- `verified_geometry` / OSM way 3236549;
- eksisterende hovedbilde;
- `nature_profile`;
- to eksisterende `em_by_*`;
- fyldig historisk `popupDesc` som råstoff;
- Thorvald Meyer-relasjonen;
- Olaf Rye som eksplisitt sekundær place-kobling;
- eksisterende Dælenenga-relasjon.

Gjenbruk betyr ikke automatisk godkjenning. Hver flate må fortsatt bestå dagens kontrakt.

## Kjente hull etter fase 1

1. description-v4.2 production package mangler;
2. source/claim-pakken må skille park, kulturmiljø og relasjonsclaims claim-for-claim;
3. legacy Leksikon er `version: 1`, generisk, `medium` og uten kilder;
4. aktiv Quiz mangler;
5. canonical Story mangler;
6. Lesespor mangler i de relevante aktive Oslo-filene;
7. `source_summary` og inspectable brukerrettede kilder mangler;
8. canonical Objects mangler;
9. Brands må kandidatauditeres; ingen mapping finnes i dag;
10. Structures må avgrenses mot Paulus kirke/skole og andre egne objekter;
11. moderne 4+1-rundingsprofil er ikke godkjent;
12. Før/etter mangler;
13. Nyheter/current-status mangler;
14. Språkleksikon mangler; navnehistorien Birkelunden/Bjerkelunden gir et reelt researchspor;
15. ingen Birkelunden-rute er funnet;
16. popupfanene er ikke separat godkjent;
17. People-koblingene må own-place-/source-auditeres;
18. Nature må kildesjekkes og plasseres riktig i By-place-opplevelsen;
19. `year: 1910` må ikke tolkes som etableringsår uten egen felt-/metadatareview;
20. slutt-QA av bilder, progresjon, søk/discovery og faktisk UI gjenstår.

## Content Factory – tillatt gjenbruk i klyngen

Delt research kan dekke blant annet:

- Grünerløkkas 1800-talls byutvikling;
- Thorvald Meyer og utbyggingshistorien;
- park/plass som sosial infrastruktur;
- kulturmiljø- og vernedokumentasjon;
- kvartalsstruktur og offentlig rom;
- åpne lesespor og mulige lokale ruter.

Men hvert claim må ha eksplisitt `place_applicability`.

### Ikke tillatt som snarvei

- Olaf Rye-navnehistorie → Birkelunden uten Birkelunden-spesifikk kilde;
- Olaf Ryes plass-innhold → Birkelunden bare på grunn av nærhet;
- kulturmiljøets 116 dekar → parkens 16,3 dekar;
- kulturmiljøets 15 kvartaler / 139 bygårder → parkens egne Structures;
- Paulus kirke → Birkelunden Object/Structure dersom den har egen canonical eier;
- Grünerløkka-områdeclaim → parkclaim uten eksplisitt kildebro;
- fravær av Brand/Story/Språk-data → N/A uten faktisk kandidatresearch.

## Kvalitetsporter

Alle brukerrettede produksjonsfaser skal fortsatt bestå:

- name-swap;
- cross-place duplicate;
- place-specific evidence anchors;
- source → verified claim → text;
- local experience;
- fullness;
- own-place boundary;
- relevante subsystemtester og manuell slutt-QA.

API-/modellkreditter kan aldri brukes som begrunnelse for mindre innhold, generisk tekst eller N/A.

## Neste fase

Når fase 1 er grønn, merget og kontrollert på fersk `main`, starter **fase 2 – Content Factory source/claim pack**.

Fase 2 skal bygge en delt Grünerløkka-kildebase, men alle claims må eksplisitt merke hvilke av `birkelunden`, `olaf_ryes_plass`, større `grunerlokka`-kontekst eller `birkelunden_kulturmiljo` de faktisk gjelder.