# Youngstorget – aktivt stedproduksjonskort

- Oppdatert: 2026-08-23
- Place ID: `youngstorget`
- Canonical source: `data/places/politikk/oslo/places_politikk/youngstorget.json`
- Aktiv baseline `main`: `2ee41fbfc861d3cdf7aecddffc3246d28c3308b5`
- Fase 0 merge: PR #5213 / `0b62e1c96bbddcf9c8574f10e0d041bba90ca48e`
- Fase 1 merge: PR #5214 / `902a01c339fc3af75ac9c1d3053d1a06ca1c5136`
- Fase 2 merge: PR #5215 / `694cef96d85e3ba3ea09ec6f6d83f183bff0bdd4`
- Fase 3 merge: PR #5216 / `809c53eb40cb489cc77ef4b6ae6fceb5fdd90364`
- Fase 4 merge: PR #5218 / `7da39fab4381b1671527108d01d8736de51c63f4`
- Fase 5 merge: PR #5222 / `2ee41fbfc861d3cdf7aecddffc3246d28c3308b5`
- Styrende kontrakt: `docs/PLACE_PRODUCTION_CHECKLIST.md`
- Prior-work gate: `docs/PLACE_PRODUCTION_PRIOR_WORK_GATE.md`
- Content Factory: `data/places/regler/content_factory_v1.json`
- Nullmåling: `reports/place-production/youngstorget-nullmaaling-v1.md`
- Fase 1: `reports/place-production/youngstorget-phase1-identity-source-v1.md`
- Fase 2 source pack: `reports/place-production/content-factory-pilot-01-oslo-sentrum-ost-source-pack-v1.json`
- Fase 2 review: `reports/place-production/youngstorget-phase2-content-factory-source-pack-v1.md`
- Fase 3: `reports/place-production/youngstorget-phase3-coordinate-prior-work-gate-v1.md`
- Fase 4: `reports/place-production/youngstorget-phase4-fagverk-audit-v1.md`
- Fase 5 production packet: `data/places/production/youngstorget.json`
- Fase 5 review: `reports/place-production/youngstorget-phase5-description-review-v1.md`
- Fase 6 review: `reports/place-production/youngstorget-phase6-structured-profiles-audit-v1.md`
- Klynge: Torggata → Youngstorget → Storgata / Brugata–Storgata
- Referanse-/ankersted: `torggata` – skal ikke produseres på nytt i Pilot 01
- Første fullproduksjonsmål: `youngstorget`

## Canonical identitet

Youngstorget-place representerer **selve det navngitte offentlige torget/byrommet fra anlegget i 1846 og fram til dagens plass**, ikke bygg, virksomheter, organisasjoner, scener eller gater rundt torget.

Tre tidsfakta er låst separat:

- 1846: torget ble anlagt/etablert;
- 1852–1951: offisielt navn `Nytorvet`;
- 1951: `Youngstorget` ble offisielt navn.

Nære egne Places som ikke skal brukes som proxy for Youngstorget omfatter minst `folkets_hus_oslo`, `folketeateret`, `mollergata_19`, `torggata`, `storgata` og `brugata_storgata_rusmiljo`.

`year: 1852` beholdes som representativ navnemilepæl. Fase-5 production packet låser samtidig `identity.period: 1846–`, og synlig tekst skiller anlegget i 1846 fra navnemilepælene i 1852 og 1951.

## Fasestatus

| Fase | Status | Dokumentasjon / beslutning |
| --- | --- | --- |
| 0. Nullmåling | **FERDIG OG MERGET** | PR #5213 |
| 1. Canonical identity/source | **FERDIG OG MERGET** | PR #5214 |
| 2. Content Factory source/claim pack | **FERDIG OG MERGET** | PR #5215 |
| 3. Koordinater/geometri | **ALLEREDE FERDIG OG MERGET** | PR #5216; `verified_geometry`, `osm-relation:12773689` |
| 4. Kategori, Badges, emner og Fagverk | **ALLEREDE FERDIG OG MERGET** | PR #5218; `politikk`, to underbadges og tre `em_pol_*` |
| 5. `desc` + `popupDesc` | **FERDIG OG MERGET** | PR #5222; 17/17 verified claims, 3/3 + 26/26 sentence coverage, alle ordinære workflows grønne |
| 6. Strukturerte place-profiler | **KLAR FOR REVIEW PÅ AKTIV BRANCH** | spatial/temporal/history/source materialisert; subplaces/nature begrunnet N/A |
| 7. Popupfaner | **IKKE STARTET** | starter først etter fase-6-merge; hver fane separat review |
| 8. Rundinger | **BLOKKERENDE LEGACY-AVVIK** | dagens `people · badges · civication · brands · leksikon · routes · music` følger ikke dagens 4+1-kontrakt |
| 9. På stedet | **IKKE STARTET** | legacy tasks skal ikke videreføres ukritisk |
| 10. Quiz | **EKSISTERER – RE-AUDIT SENERE** | aktivt 5-spørsmålssett finnes; ikke regenerer uten konkret behov |
| 11. Observer / Notat / Rute | **IKKE STARTET** | eide flows auditeres separat |
| 12. People–sted | **EKSISTERER – RE-AUDIT SENERE** | permanent test låser ≥22 koblinger; kvantitet er ikke kvalitetsbevis |
| 13. Brands | **EKSISTERER – OWN-PLACE AUDIT SENERE** | fire mappings finnes; place-eierskap må dokumenteres |
| 14. Discovery / relations / NextUp / search / i18n | **IKKE STARTET** | place-spesifikk audit |
| 15–19. Besøk, progresjon, profil, legacy, bilder | **IKKE STARTET / RE-AUDIT** | place-bilde er nå materialisert; øvrige flater gjenstår |
| 20–24. Data-QA, UI-QA, innholds-QA, CI, ett-sted-gate | **IKKE STARTET** | lukkes først etter full produksjon |

## Aktiv fase

På denne branchen er **fase 6 – strukturerte place-profiler** eneste aktive fase.

Aktivt filscope:

1. `data/places/politikk/oslo/places_politikk/youngstorget.json`;
2. `reports/place-production/youngstorget-phase6-structured-profiles-audit-v1.md`;
3. `reports/place-production/youngstorget-workcard-current.md`.

Fase 6 endrer ikke fase-5 production packet, `desc`/`popupDesc`, quiz, Stories, People, Brands, Objects, rundinger, onsite eller andre senere subsystemer.

## Fase 6 – strukturerte profiler

### `spatial_profile`

**PASS / materialisert.** Youngstorget behandles som offentlig torg. Pløens gate, Eva Kolstads gate, Møllergata, Youngs gate og Folketeaterkvartalet brukes som kildebelagt grensekontekst; Torggata er en kryssende gate. OSM relation `12773689` forblir verifisert navngitt geometri. `r=150` brukes ikke som areal, og det publiseres ikke et oppdiktet arealmål.

### `temporal_profile`

**PASS / materialisert.** Seks hovedmilepæler: 1846, 1852, 1890, 1951, 1958 og 1996. Feltet holdes kort og erstatter ikke chronology/Leksikon.

### `subplaces`

**BEGRUNNET N/A.** Source packen dokumenterer ingen stabile, navngitte interne Youngstorget-soner som bør bli subplaces. Gatene og institusjonene rundt torget skal ikke konstrueres som delsoner bare for completeness.

### `history_layers`

**PASS / materialisert.** Fire lag:

1. markedstorget blir til, 1846–1870-årene;
2. arbeiderbevegelsens samlingsrom, 1890–1930-årene;
3. nytt navn og synlige minnespor, 1951–1997;
4. torget bygges om, 1990-årene–1996.

### `nature_profile`

**BEGRUNNET N/A.** Kommunal beplantning er et byromstiltak, men det finnes ikke kildegrunnlag for en naturfaglig hovedrolle/habitatprofil. Feltet fylles ikke med natur-filler.

### `source_summary`

**PASS / materialisert.** Brukerrettet basisliste med Oslo kommune, Oslo byleksikon, to Arbark-kilder og OSM-geometrikilden. Interne audits/researchnotater er holdt ute.

## Fase-5 bevaring

Fase 5 er nå faktisk merget på `main` via #5222 / `2ee41fb…`:

- `desc`: 55 ord / 3 setninger;
- `popupDesc`: 421 ord / 6 avsnitt / 26 setninger;
- 17/17 claims verified;
- `desc` sentence coverage: 3/3;
- `popupDesc` sentence coverage: 26/26;
- name-swap PASS;
- cross-place duplicate PASS;
- place-specific evidence anchors PASS;
- source → claim → text PASS;
- local experience PASS;
- fullness PASS for description-fasen;
- lisensiert place-bilde og nødvendig Politikk-production mirror er materialisert;
- alle seks ordinære PR-workflows var grønne før merge.

## Content Factory-resultat så langt

Shared source pack har:

- 12 registrerte kilder;
- 2 kilder/proveniens direkte gjenbrukt fra eksisterende History GO-arbeid;
- 10 nye eksterne kilder lagt til cluster-pakken;
- 5 scope-ugyldige/generiske claim-kandidater eksplisitt avvist;
- coordinate-subsystem bevart uten ny geokoding;
- category/badge/emne/Fagverk bevart uten ny modell-/fagproduksjon;
- én kontrollert Youngstorget-researchpass gjenbrukt i description, strukturerte profiler og forberedelse til senere history/object/current-use/before-after/quiz/relations-arbeid.

Dette er arbeids-/gjenbruksmåling, **aldri kvalitet, richness eller ferdigstatus**.

## Modell- og kredittstatus fase 6

- produksjonsmodellkall: **0**;
- token-/API-kreditter brukt: **0**;
- begrunnelse: fase 2-claimbanken og fase-3-geometrien gir allerede eksplisitt evidens til de materialiserte feltene;
- ingen relevant profil er kortet ned av budsjett. Ved nytt evidensgap er handlingen mer research, ikke svakere innhold.

## Scope-gater som fortsatt gjelder

- TØI Torggata/Brugata → `youngstorget`: **NEI**.
- TØI Brugata → `brugata_storgata_rusmiljo`: **NEI**.
- Storgata-byhistorie → `youngstorget`: **NEI** uten eksplisitt relasjonsclaim.
- `street:brugata` → ny bare-`brugata` Place: **NEI**; canonical eier er ikke bevist.
- nabobygg/virksomhet → Youngstorget People/Brands/Stories: **NEI** ved nærhet alene.

## Kjente hull etter fase 6

1. Popupfanene mangler separat tab-level review.
2. Før/etter mangler ferdig rettighetsklar assetpair; 1996-sporet er bare researchgrunnlag.
3. Kilder-fanen har nå `source_summary`, men faktisk popup-runtime og full source-visning må godkjennes i fase 7.
4. Canonical Objects mangler; Pioneren, Fredsmonumentet, fontenen og basaren er kandidater som må ID-/eierskapsauditeres.
5. Rundingssettet er legacy og må migreres til 4+1 uten filler.
6. Brands må own-place-auditeres.
7. People må own-place-, profile-, image- og runtime-auditeres; ≥22 er bare baseline.
8. Språk må vurderes eksplisitt, ikke automatisk N/A.
9. Nyheter/current-status må ferskkontrolleres før godkjenning.
10. Onsite må saneres mot dagens kontrakt; legacy tasks er ikke produktet.
11. Sterke «første»-claims krever uavhengig ekstra kilde dersom de senere skal publiseres.
12. Legacy `layers.populaerkultur`, tags/knagger og andre medieflater er ikke sanert i fase 6; de skal gjennom sin eierfase.

## Popupstatus

| Fane | Status |
| --- | --- |
| Om | **DESCRIPTION-INNHOLD FERDIG OG MERGET – TAB-LEVEL QA I FASE 7 GJENSTÅR** |
| Historie | **STRUKTURERT HISTORY-LAYER MATERIALISERT – TAB-QA/CHRONOLOGY-GRENSE GJENSTÅR** |
| Fortellinger | **EKSISTERER – IKKE RE-AUDITERT** |
| Før/etter | **RESEARCHSPOR FUNNET – ASSETS/RETTIGHETER MANGLER** |
| Nyheter | **FERSKE 2026-KILDER FINNES – IKKE MATERIALISERT/GODKJENT** |
| Lesespor | **EKSISTERER – IKKE RE-AUDITERT** |
| Kilder | **SOURCE_SUMMARY MATERIALISERT – TAB-RUNTIME/QA GJENSTÅR** |
| Språk | **IKKE VURDERT FERDIG** |
| Spor & objekter | **KANDIDATCLAIMS FINNES – CANONICAL OBJECT AUDIT MANGLER** |
| Andre direktefaner | **IKKE VURDERT FERDIG** |

## Pilotregel

Research kan batches i klyngen. Godkjenning og merge skjer fortsatt ett Place om gangen.

Hvis en senere checklistflate møter et evidensgap, er neste handling **mer Youngstorget-spesifikk research** — aldri kortere innhold, generisk fyll eller budsjettbegrunnet N/A.

Kvalitetsmålet står fast: **Youngstorget skal bli minst like rikt, kildebåret og stedsspesifikt som separat fullproduksjon.**
