# Youngstorget – aktivt stedproduksjonskort

- Oppdatert: 2026-08-23
- Place ID: `youngstorget`
- Canonical source: `data/places/politikk/oslo/places_politikk/youngstorget.json`
- Aktiv audit-baseline `main`: `3c0003dd9a6f5eba18c91ee0002857ba75e64e25`
- Fase 0 merge: PR #5213 / `0b62e1c96bbddcf9c8574f10e0d041bba90ca48e`
- Fase 1 merge: PR #5214 / `902a01c339fc3af75ac9c1d3053d1a06ca1c5136`
- Fase 2 merge: PR #5215 / `694cef96d85e3ba3ea09ec6f6d83f183bff0bdd4`
- Fase 3 merge: PR #5216 / `809c53eb40cb489cc77ef4b6ae6fceb5fdd90364`
- Fase 4 merge: PR #5218 / `7da39fab4381b1671527108d01d8736de51c63f4`
- Fase 5 merge: PR #5222 / `2ee41fbfc861d3cdf7aecddffc3246d28c3308b5`
- Fase 6 merge: PR #5227 / `222f6a556785fe13ff337995349b6998c50208ff`
- Styrende kontrakt: `docs/PLACE_PRODUCTION_CHECKLIST.md`
- Popupkontrakt: `docs/PLACE_POPUP_SYSTEM.md`
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
| 7. Popupfaner | **AUDIT AKTIV** | fase-7-audit klassifiserer fanene; deretter små PR-er 7A–7H |
| 8. Rundinger | **BLOKKERENDE LEGACY-AVVIK** | dagens `people · badges · civication · brands · leksikon · routes · music` følger ikke dagens 4+1-kontrakt |
| 9. På stedet | **IKKE STARTET** | legacy tasks skal ikke videreføres ukritisk |
| 10. Quiz | **EKSISTERER – RE-AUDIT SENERE** | aktivt 5-spørsmålssett finnes; ikke regenerer uten konkret behov |
| 11. Observer / Notat / Rute | **IKKE STARTET** | eide flows auditeres separat |
| 12. People–sted | **EKSISTERER – RE-AUDIT SENERE** | permanent test låser ≥22 koblinger; kvantitet er ikke kvalitetsbevis |
| 13. Brands | **EKSISTERER – OWN-PLACE AUDIT SENERE** | fire mappings finnes; place-eierskap må dokumenteres |
| 14. Discovery / relations / NextUp / search / i18n | **IKKE STARTET** | place-spesifikk audit |
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

## Aktiv fase 7 – popupfaner

Fase 7 starter med audit-only PR. Ingen canonical popupdata endres i auditsteget.

Auditens faneklassifisering:

| Fane | Status etter audit |
| --- | --- |
| Om | **7A – trenger arbeid**: `temporal_profile` finnes, men renderes ikke |
| Historie | **7B – innholdsklar, QA gjenstår**: fire `history_layers` vises; ikke bygg filler-chronology |
| Fortellinger | **7C – trenger reell Story-revisjon**: aktiv legacy-story er for generell som episode |
| Før/etter | **7D – trenger produksjon**: 1996-spor finnes, canonical bildepar/rettigheter mangler |
| Nyheter | **7E – trenger produksjon**: reelle 2026-notiser/current-stoff finnes |
| Lesespor | **7F – begrunnet N/A i åpen popup inntil åpent spor finnes**: fire Aftenposten-abonnementslenker filtreres korrekt |
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

## Kjente hull etter fase-7-audit

1. `temporal_profile` mangler runtimepresentasjon i Om.
2. Historie trenger eksplisitt tab-QA, ikke mer volum for volumets skyld.
3. Storyen `st_youngstorget_mayday` må få tydelig narrativ episode/konflikt og dagens source-governance ved vesentlig revisjon.
4. Før/etter mangler rettighetsklar assetpair for selve torget.
5. Nyheter/current-status må ferskkontrolleres og materialiseres.
6. Åpent Lesespor mangler; abonnementstilgang skal ikke omklassifiseres.
7. Kilder trenger inspectable, dedupliserte HTTPS-lenker.
8. Språknavnehistorien må auditeres etter Språkleksikon-kontrakten.
9. Canonical Objects mangler; Pioneren, Fredsmonumentet, fontenen og basaren er kandidater som må ID-/eierskapsauditeres.
10. Rundingssettet er legacy og må senere migreres til 4+1 uten filler.
11. Brands og People må own-place-auditeres.
12. Onsite må saneres mot dagens kontrakt; legacy tasks er ikke produktet.
13. Sterke «første»-claims krever uavhengig ekstra kilde dersom de senere skal publiseres.
14. Legacy `layers.populaerkultur`/tags/knagger er ikke sanert ennå og skal ikke brukes som kilde for nye popupfaner.

## Content Factory-resultat så langt

Shared source pack har 12 registrerte kilder, hvorav 2 kilder/proveniens ble direkte gjenbrukt fra eksisterende History GO-arbeid og 10 nye eksterne kilder ble lagt til cluster-pakken. Fem scope-ugyldige/generiske claim-kandidater ble eksplisitt avvist. Den samme verifiserte Youngstorget-researchpass brukes nå på tvers av description, profiler og popup-audit uten å senke kvalitetskravene.

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
