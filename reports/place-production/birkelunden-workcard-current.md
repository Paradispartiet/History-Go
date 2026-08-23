# Birkelunden – aktivt stedproduksjonskort

- Oppdatert: 2026-08-23
- Place ID: `birkelunden`
- Canonical source: `data/places/by/oslo/places/birkelunden.json`
- Aktiv fase-0-baseline `main`: `5f988ef475a8d84287b5d8db3d34ec1acc80ec03`
- Nullmåling: `reports/place-production/birkelunden-nullmaaling-v1.md`
- Styrende kontrakt: `docs/PLACE_PRODUCTION_CHECKLIST.md`
- Core: `docs/PLACE_PRODUCTION_CHECKLIST_CORE.md`
- Prior-work gate: `docs/PLACE_PRODUCTION_PRIOR_WORK_GATE.md`
- Content Factory: `data/places/regler/content_factory_v1.json`
- Produktkart: `docs/HISTORY_GO_PRODUCT_MAP.md`
- Klynge: **Birkelunden → Olaf Ryes plass**
- Første fullproduksjonsmål: **Birkelunden**

## Canonical identitet

Birkelunden-place representerer **selve det avgrensede parkrommet Birkelunden på Grünerløkka**.

Det representerer ikke automatisk:

- det større fredede `Birkelunden kulturmiljø`;
- Birkelunden holdeplass;
- Paulus plass;
- Paulus kirke;
- omkringliggende leiegårder eller hele Grünerløkka.

Koordinatevidensen låser parkidentiteten til OSM way `3236549` og beskriver representasjonspunktet som et geometriforankret parkanker.

### Åpent scope-avvik som må løses før description-godkjenning

Dagens `popupDesc` omtaler også det større verneområdet med 116 dekar, 15 kvartaler og 139 leiegårder. Dette kan være relevant historisk kontekst, men skal ikke presenteres som om det er parkens egen fysiske utstrekning.

Fase 1–2 skal derfor eksplisitt skille:

1. park-eide claims;
2. kulturmiljø-/områdeclaims;
3. relasjonsclaims om nabosteder og omkringliggende bystruktur.

## Fasestatus

| Fase | Status | Baseline / beslutning |
| --- | --- | --- |
| 0. Nullmåling | **KLAR FOR REVIEW** | denne grenen; kun rapport + workcard, ingen canonical dataendring |
| 1. Canonical identity/source | **IKKE STARTET** | park vs. større kulturmiljø og naboplaces skal låses |
| 2. Content Factory source/claim pack | **IKKE STARTET** | delt Grünerløkka-research, men eksplisitt claim→place-scope |
| 3. Koordinater/geometri | **EKSISTERER – forventet ALLEREDE FERDIG** | `verified_geometry`, OSM way 3236549; må bare re-auditeres, ikke geokodes på nytt |
| 4. Kategori, Badges, emner, Fagverk og Nature-eierskap | **EKSISTERER DELVIS – RE-AUDIT** | kategori `by`, to `em_by_*`, `nature_profile`; underbadges ikke låst |
| 5. `desc` + `popupDesc` v4.2 | **EKSISTERER – RE-AUDIT / MULIG REVISJON** | fyldig tekst finnes, men production package mangler og scope må rettes/avklares |
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

## Fase 0 – aktivt scope

Aktivt filscope:

1. `reports/place-production/birkelunden-nullmaaling-v1.md`;
2. `reports/place-production/birkelunden-workcard-current.md`.

Fase 0 skal **ikke** endre:

- canonical Birkelunden-place;
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

## Kjente hull etter nullmålingen

1. parkens own-place-grense mot det større Birkelunden kulturmiljø må låses;
2. description-v4.2 production package mangler;
3. legacy Leksikon er `version: 1`, generisk, `medium` og uten kilder;
4. aktiv Quiz mangler;
5. canonical Story mangler;
6. Lesespor mangler i de relevante aktive Oslo-filene;
7. `source_summary` og inspectable brukerrettede kilder mangler;
8. canonical Objects mangler;
9. Brands må kandidatauditeres; ingen mapping finnes i dag;
10. Structures må avgrenses mot nabobygg med egen canonical identitet;
11. moderne 4+1-rundingsprofil er ikke godkjent;
12. Før/etter mangler;
13. Nyheter/current-status mangler;
14. Språkleksikon mangler og kan ikke merkes N/A uten research;
15. ingen Birkelunden-rute er funnet;
16. popupfanene er ikke separat godkjent;
17. People-koblingene må own-place-/source-auditeres;
18. Nature må kildesjekkes og plasseres riktig i By-place-opplevelsen;
19. slutt-QA av bilder, progresjon, søk/discovery og faktisk UI gjenstår.

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
- kulturmiljøets totalareal → parkens areal;
- Paulus kirke → Birkelunden Object/Structure hvis kirken har egen canonical eier;
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

Når fase 0 er grønn, merget og kontrollert på fersk `main`, starter **fase 1 – canonical identity/source boundary**.

Målet i fase 1 er ikke å omskrive tekst. Målet er å bevise nøyaktig hva Birkelunden-place eier, hva som bare er kulturmiljø-/områdekontekst, og hvilke nabosteder som skal behandles som relasjoner.