# Youngstorget – aktivt stedproduksjonskort

- Oppdatert: 2026-08-23
- Place ID: `youngstorget`
- Canonical source: `data/places/politikk/oslo/places_politikk/youngstorget.json`
- Aktiv baseline `main`: `d2ab0e7f845ee530c071f3aebfb430dc12efabf7`
- Fase 0 merge: PR #5213 / `0b62e1c96bbddcf9c8574f10e0d041bba90ca48e`
- Fase 1 merge: PR #5214 / `902a01c339fc3af75ac9c1d3053d1a06ca1c5136`
- Fase 2 merge: PR #5215 / `694cef96d85e3ba3ea09ec6f6d83f183bff0bdd4`
- Fase 3 merge: PR #5216 / `809c53eb40cb489cc77ef4b6ae6fceb5fdd90364`
- Fase 4 merge: PR #5218 / `7da39fab4381b1671527108d01d8736de51c63f4`
- Fase 5 merge: PR #5222 / `2ee41fbfc861d3cdf7aecddffc3246d28c3308b5`
- Fase 6 merge: PR #5227 / `222f6a556785fe13ff337995349b6998c50208ff`
- Fase 7 audit merge: PR #5228 / `7b257c603f53141862eff19a7b9e1d28b8d2fb75`
- Fase 7A merge: PR #5230 / `bee5692301164b52ad9df5a0daabfbde974ee47a`
- Fase 7B merge: PR #5231 / `d2ab0e7f845ee530c071f3aebfb430dc12efabf7`
- Styrende kontrakt: `docs/PLACE_PRODUCTION_CHECKLIST.md`
- Popupkontrakt: `docs/PLACE_POPUP_SYSTEM.md`
- Story-governance: `docs/STORIES_DATA_GOVERNANCE.md`
- Prior-work gate: `docs/PLACE_PRODUCTION_PRIOR_WORK_GATE.md`
- Content Factory: `data/places/regler/content_factory_v1.json`
- Fase 7 audit: `reports/place-production/youngstorget-phase7-popup-tabs-audit-v1.md`
- Klynge: Torggata → Youngstorget → Storgata / Brugata–Storgata
- Referanse-/ankersted: `torggata` – skal ikke produseres på nytt i Pilot 01
- Første fullproduksjonsmål: `youngstorget`

## Canonical identitet

Youngstorget-place representerer **selve det navngitte offentlige torget/byrommet fra anlegget i 1846 og fram til dagens plass**, ikke bygg, virksomheter, organisasjoner, scener eller gater rundt torget.

Tre tidsfakta er låst separat:

- 1846: torget ble anlagt/etablert;
- 1852–1951: offisielt navn `Nytorvet`;
- 1951: `Youngstorget` ble offisielt navn.

Nære egne Places som ikke skal brukes som proxy omfatter minst `folkets_hus_oslo`, `folketeateret`, `mollergata_19`, `torggata`, `storgata` og `brugata_storgata_rusmiljo`.

`year: 1852` beholdes som representativ navnemilepæl. Fase-5-pakken låser samtidig `identity.period: 1846–`, og synlig tekst skiller anlegget i 1846 fra navnemilepælene i 1852 og 1951.

## Fasestatus

| Fase | Status | Dokumentasjon / beslutning |
| --- | --- | --- |
| 0. Nullmåling | **FERDIG OG MERGET** | PR #5213 |
| 1. Canonical identity/source | **FERDIG OG MERGET** | PR #5214 |
| 2. Content Factory source/claim pack | **FERDIG OG MERGET** | PR #5215 |
| 3. Koordinater/geometri | **ALLEREDE FERDIG OG MERGET** | PR #5216; `verified_geometry`, `osm-relation:12773689` |
| 4. Kategori, Badges, emner og Fagverk | **ALLEREDE FERDIG OG MERGET** | PR #5218; `politikk`, to underbadges og tre `em_pol_*` |
| 5. `desc` + `popupDesc` | **FERDIG OG MERGET** | PR #5222; 17/17 verified claims, 3/3 + 26/26 sentence coverage |
| 6. Strukturerte place-profiler | **FERDIG OG MERGET** | PR #5227; spatial/temporal/history/source materialisert; subplaces/nature begrunnet N/A; 6/6 workflows grønne |
| 7. Popupfaner | **7C FORTELLINGER KLAR FOR REVIEW** | audit #5228; 7A Om #5230; 7B Historie #5231; 7C migrerer én legacy-story til episode_v1 |
| 8. Rundinger | **BLOKKERENDE LEGACY-AVVIK** | dagens `people · badges · civication · brands · leksikon · routes · music` følger ikke dagens 4+1-kontrakt |
| 9. På stedet | **IKKE STARTET** | legacy tasks skal ikke videreføres ukritisk |
| 10. Quiz | **EKSISTERER – RE-AUDIT SENERE** | aktivt 5-spørsmålssett finnes; ikke regenerer uten konkret behov |
| 11. Observer / Notat / Rute | **IKKE STARTET** | eide flows auditeres separat |
| 12. People–sted | **EKSISTERER – RE-AUDIT SENERE** | permanent test låser ≥22 koblinger; kvantitet er ikke kvalitetsbevis |
| 13. Brands | **EKSISTERER – OWN-PLACE AUDIT SENERE** | fire mappings finnes; place-eierskap må dokumenteres |
| 14. Discovery / relations / NextUp / search / i18n | **IKKE STARTET** | place-spesifikk audit; legacy graph-snapshots ryddes først her hvis de faktisk er aktive/relevante |
| 15–19. Besøk, progresjon, profil, legacy, bilder | **IKKE STARTET / RE-AUDIT** | place-bilde er materialisert; øvrige flater gjenstår |
| 20–24. Data-QA, UI-QA, innholds-QA, CI, ett-sted-gate | **IKKE STARTET** | lukkes først etter full produksjon |

## Fase 5 – låst og bevart

- `desc`: 55 ord / 3 setninger;
- `popupDesc`: 421 ord / 6 avsnitt / 26 setninger;
- 17/17 claims verified;
- sentence coverage 3/3 + 26/26;
- name-swap PASS;
- cross-place duplicate PASS;
- place-specific evidence anchors PASS;
- source → claim → text PASS;
- local experience PASS;
- fullness PASS for description-fasen;
- lisensiert place-bilde og nødvendig Politikk-production mirror materialisert.

Fase 7 skal ikke omskrive denne teksten uten ny konkret description-regresjon.

## Fase 6 – låst og bevart

- `spatial_profile`: offentlig torg, own-place-grense, kildebelagt boundary og OSM-geometri uten falsk arealmåling;
- `temporal_profile`: 1846, 1852, 1890, 1951, 1958, 1996;
- `history_layers`: fire korte historiske lag;
- `source_summary`: fem sikre kildeetiketter;
- `subplaces`: begrunnet N/A;
- `nature_profile`: begrunnet N/A;
- produksjonsmodell/API-kreditter: 0 fordi allerede verifisert claim-bank var tilstrekkelig, ikke fordi innhold ble kuttet.

## Fase 7A – Om – ferdig og merget

PR #5230 låste Om-fanen uten canonical dataendring:

- fase-5 `popupDesc` forblir hovedartikkel;
- fase-6 `spatial_profile` rendres gjennom eksisterende runtime;
- ingen manifest-lastet Leksikonpost konkurrerer om Youngstorget;
- `temporal_profile` dobbeltrendres ikke i Om;
- permanent regresjon: `tests/youngstorget-phase7a-about.test.mjs`.

## Fase 7B – Historie – ferdig og merget

PR #5231 låste Historie-fanen uten canonical data- eller runtimeendring:

- fire `history_layers` er user-facing historietidslinje;
- lagene dekker temporal-milepælene 1846, 1852, 1890, 1951, 1958 og 1996;
- ingen filler-Leksikon chronology ble laget;
- popup-v2 renderer `history_layers`, tabs-runtime flytter seksjonen til Historie;
- permanent regresjon: `tests/youngstorget-phase7b-history.test.mjs`.

## Aktiv fase 7C – Fortellinger

Legacy-storyen `st_youngstorget_mayday` beholdes som én narrativ Story og med samme ID, men er vesentlig omskrevet til dagens `episode_v1`-kontrakt.

Aktivt filscope:

1. `data/stories/stories_youngstorget.json`;
2. `data/stories/stories_episode_v1_manifest.json`;
3. `reports/place-production/youngstorget-phase7c-story-source-addendum-v1.json`;
4. `reports/place-production/youngstorget-phase7c-story-audit-v1.md`;
5. `reports/place-production/youngstorget-workcard-current.md`;
6. `tests/youngstorget-phase7c-story.test.mjs`.

Canonical Youngstorget Place-data og popup-runtime endres ikke i 7C.

Storybeslutning:

- ID: `st_youngstorget_mayday` beholdes for `nar_workers_movement_oslo`;
- hovedår: 1890, ikke generisk 1930;
- type: `political`;
- episode: 1. mai 1890, Youngstorget → Stortinget → Tullinløkka;
- sammendrag bruker «flere tusen» fordi kildene oppgir 3 600 vs. nærmere 4 000;
- begge tall oppgis med tydelig kildeeierskap i hovedteksten;
- held-back «første»-superlativ publiseres ikke;
- `martin_tranmael` fjernes fra `related_people` fordi han ikke er aktør i 1890-episoden;
- `stortinget` beholdes som eneste related/next Place fordi toget faktisk gikk dit og kravet ble overlevert presidentskapet;
- Tullinløkka nevnes historisk, men opprettes ikke som ny Place;
- tre inspectable HTTPS-kilder;
- maskinberegnet score: 20;
- Story-filen registreres i `stories_episode_v1_manifest.json`.

Auditens faneklassifisering:

| Fane | Status etter 7C-produksjon |
| --- | --- |
| Om | **7A – FERDIG OG MERGET #5230** |
| Historie | **7B – FERDIG OG MERGET #5231** |
| Fortellinger | **7C – KLAR FOR REVIEW**: én place-spesifikk episode_v1-Story med konkret 1890-scene og source governance |
| Før/etter | **7D – trenger produksjon**: 1996-spor finnes, canonical bildepar/rettigheter mangler |
| Nyheter | **7E – trenger produksjon**: reelle 2026-notiser/current-stoff finnes |
| Lesespor | **7F – tilgangs-QA**: fire Aftenposten-spor finnes; åpen popup må fortsatt filtrere registrert abonnement/betalingsmur |
| Kilder | **7G – trenger arbeid**: source labels finnes, inspectable HTTPS-lenker mangler |
| Språk | **7H – egen vurdering**: Nytorvet/Youngstorget-navnehistorien er reell, men Språkleksikon-verdien må avgjøres uten filler |
| Spor & objekter | **senere canonical eierfase**: Object-ID/eierskap må avklares først |
| Legg merke til / Betydning / Motpunkter | **ikke godkjent nå**: legacy medielag er ukildet/generisk og skal ikke løftes direkte til nye faner |
| Relasjoner | **senere relations-fase** |
| Kunnskap / Observasjoner | **ikke materialisert uten source-eid innhold** |

Delstegrekkefølge:

```text
7 audit → 7A Om → 7B Historie → 7C Fortellinger → 7D Før/etter → 7E Nyheter → 7F Lesespor → 7G Kilder → 7H Språk
```

Fase 7 blir først samlet godkjent når relevante delsteg er ferdige, begrunnede N/A-er er dokumentert, relevante CI-/runtimeporter er grønne og sluttresultatet er kontrollert på faktisk `main`.

## Kjente hull etter 7C-produksjon

1. 7C må gjennom Story-integritet/CI og merge før den kan klassifiseres ferdig.
2. Før/etter mangler rettighetsklar assetpair for selve torget.
3. Nyheter/current-status må ferskkontrolleres og materialiseres.
4. Åpent Lesespor må avgjøres fra faktisk `access` item-for-item; abonnementstilgang skal ikke omklassifiseres.
5. Kilder trenger inspectable, dedupliserte HTTPS-lenker.
6. Språknavnehistorien må auditeres etter Språkleksikon-kontrakten.
7. Canonical Objects mangler; Pioneren, Fredsmonumentet, fontenen og basaren er kandidater som må ID-/eierskapsauditeres.
8. Rundingssettet er legacy og må senere migreres til 4+1 uten filler.
9. Brands og People må own-place-auditeres.
10. Onsite må saneres mot dagens kontrakt; legacy tasks er ikke produktet.
11. Legacy `layers.populaerkultur`/tags/knagger er ikke sanert ennå og skal ikke brukes som kilde for nye popupfaner.
12. Legacy graph-snapshots inneholder eldre avledede Story-relasjoner og behandles i relations/discovery-fasen, ikke som Stories source-of-truth.

## Content Factory-resultat så langt

Shared source pack har 12 registrerte baselinekilder. 7C gjenbruker tre relevante Youngstorget-provenienser/claims fra pakken og registrerer ett nytt uavhengig evidence-addendum for Oslo byleksikons 1. mai-side. Det nye materialet brukes til å dokumentere den konkrete Stortinget-ruten og håndtere deltakertall-konflikten eksplisitt.

Dette er arbeids-/gjenbruksmåling, **aldri kvalitet, richness eller ferdigstatus**.

## Scope-gater som fortsatt gjelder

- TØI Torggata/Brugata → `youngstorget`: **NEI**.
- TØI Brugata → `brugata_storgata_rusmiljo`: **NEI**.
- Storgata-byhistorie → `youngstorget`: **NEI** uten eksplisitt relasjonsclaim.
- `street:brugata` → ny bare-`brugata` Place: **NEI**; canonical eier er ikke bevist.
- nabobygg/virksomhet → Youngstorget People/Brands/Stories: **NEI** ved nærhet alene.

## Pilotregel

Research kan batches i klyngen. Godkjenning og merge skjer fortsatt ett Place om gangen.

Hvis en senere checklistflate møter et evidensgap, er neste handling **mer Youngstorget-spesifikk research** — aldri kortere innhold, generisk fyll eller budsjettbegrunnet N/A.

Kvalitetsmålet står fast: **Youngstorget skal bli minst like rikt, kildebåret og stedsspesifikt som separat fullproduksjon.**
