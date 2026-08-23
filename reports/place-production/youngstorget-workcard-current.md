# Youngstorget – aktivt stedproduksjonskort

- Oppdatert: 2026-08-23
- Place ID: `youngstorget`
- Canonical source: `data/places/politikk/oslo/places_politikk/youngstorget.json`
- Aktiv baseline `main`: `68080524e50489d45b78d8d18fc09a5ca1e6f657`
- Fase 0 merge: PR #5213 / `0b62e1c96bbddcf9c8574f10e0d041bba90ca48e`
- Fase 1 merge: PR #5214 / `902a01c339fc3af75ac9c1d3053d1a06ca1c5136`
- Fase 2 merge: PR #5215 / `694cef96d85e3ba3ea09ec6f6d83f183bff0bdd4`
- Fase 3 merge: PR #5216 / `809c53eb40cb489cc77ef4b6ae6fceb5fdd90364`
- Styrende kontrakt: `docs/PLACE_PRODUCTION_CHECKLIST.md`
- Obligatorisk preflight: `docs/PLACE_PRODUCTION_PRIOR_WORK_GATE.md`
- Content Factory: `data/places/regler/content_factory_v1.json`
- Nullmåling: `reports/place-production/youngstorget-nullmaaling-v1.md`
- Fase 1: `reports/place-production/youngstorget-phase1-identity-source-v1.md`
- Fase 2 source pack: `reports/place-production/content-factory-pilot-01-oslo-sentrum-ost-source-pack-v1.json`
- Fase 2 review: `reports/place-production/youngstorget-phase2-content-factory-source-pack-v1.md`
- Fase 3: `reports/place-production/youngstorget-phase3-coordinate-prior-work-gate-v1.md`
- Fase 4: `reports/place-production/youngstorget-phase4-fagverk-audit-v1.md`
- Klynge: Torggata → Youngstorget → Storgata / Brugata–Storgata
- Referanse-/ankersted: `torggata` – skal ikke produseres på nytt i Pilot 01
- Første produksjonsmål: `youngstorget`

## Canonical identitet

Youngstorget-place representerer **selve det navngitte offentlige torget/byrommet fra anlegget i 1846 og fram til dagens plass**, ikke bygg, virksomheter, organisasjoner, scener eller gater rundt torget.

Tre tidsfakta er låst separat:

- 1846: torget ble anlagt/etablert;
- 1852–1951: offisielt navn `Nytorvet`;
- 1951: `Youngstorget` ble offisielt navn.

Nære egne Places som ikke skal brukes som proxy for Youngstorget omfatter minst `folkets_hus_oslo`, `folketeateret`, `mollergata_19`, `torggata`, `storgata` og `brugata_storgata_rusmiljo`.

`year: 1852` endres ikke blindt. Primærårssemantikken skal dokumenteres i description-production package fordi repoet ikke definerer `year` universelt som etableringsår, mens metadata–tekst-konsistens er obligatorisk.

## Fasestatus

| Fase | Status | Dokumentasjon / beslutning |
| --- | --- | --- |
| 0. Nullmåling | **FERDIG OG MERGET** | PR #5213 / `0b62e1c9…` |
| 1. Canonical identity/source | **FERDIG OG MERGET** | PR #5214 / `902a01c3…`; identitet/source-owner/own-place-grense låst |
| 2. Kildebase / Content Factory source pack | **FERDIG OG MERGET** | PR #5215 / `694cef96…`; scoped 12-source registry, claim-bank, relations, held-back claims, freshness og gaps |
| 3. Koordinater/geometri | **ALLEREDE FERDIG OG MERGET** | PR #5216 / `809c53eb…`; `verified_geometry` / `osm-relation:12773689`; ingen ny geokoding |
| 4. Kategori, Badges, emner og Fagverk | **ALLEREDE FERDIG PÅ AKTIV BRANCH – KLAR FOR PR** | `politikk`, to underbadges og tre `em_pol_*` består place-, chapter-, runtime- og Fagverk-gatene uten dataendring |
| 5. `desc` + `popupDesc` | **NESTE ETTER FASE-4-MERGE** | første canonical brukerrettede tekstendring; rett 1846/1852, bygg v4.2 production package, bevar richness |
| 6. Strukturerte place-profiler | **IKKE STARTET** | stoffstyrt, ikke felttvang |
| 7. Popupfaner | **IKKE STARTET** | hver fane separat review |
| 8. Rundinger | **BLOKKERENDE LEGACY-AVVIK** | dagens `people · badges · civication · brands · leksikon · routes · music` følger ikke dagens 4+1-kontrakt |
| 9. På stedet | **IKKE STARTET** | legacy tasks skal ikke videreføres ukritisk |
| 10. Quiz | **EKSISTERER – RE-AUDIT SENERE** | aktivt 5-spørsmålssett finnes; ikke regenerer uten konkret behov |
| 11. Observer / Notat / Rute | **IKKE STARTET** | eide flows auditeres separat |
| 12. People–sted | **EKSISTERER – RE-AUDIT SENERE** | permanent test låser ≥22 koblinger; kvantitet er ikke kvalitetsbevis |
| 13. Brands | **EKSISTERER – OWN-PLACE AUDIT SENERE** | fire mappings finnes; må place-eies eksplisitt |
| 14. Discovery / relations / NextUp / search / i18n | **IKKE STARTET** | place-spesifikk audit |
| 15–19. Besøk, progresjon, profil, legacy, bilder | **IKKE STARTET / RE-AUDIT** | bilder er et kjent faktisk hull |
| 20–24. Data-QA, UI-QA, innholds-QA, CI, ett-sted-gate | **IKKE STARTET** | lukkes først etter full produksjon |

## Aktiv fase

På denne branchen er **fase 4 den eneste aktive fasen**. Den er klassifisert `ALLEREDE FERDIG` etter prior-work, place-relevans, canonical badge/emne-ID-er, materialiserte Fagverk-kapitler, runtime-mapping og permanente kapittelaudits.

Ingen canonical Place-, category-, underbadge-, emne-, People-, Story-, Quiz-, Brand-, image-, rounds- eller runtime-data er endret i fase 4.

Etter merge skal ny branch opprettes fra fersk `main`, og bare **fase 5 – `desc` + `popupDesc`** skal være aktiv.

## Fase 4 – behold-beslutning

### Category

- `politikk`: **BEHOLD**.

### Underbadges

- `arbeiderbevegelse`: **BEHOLD**;
- `aktivisme_og_protest`: **BEHOLD**.

Begge finnes i canonical `data/badges/politikk.json` og har direkte Youngstorget-evidens i source packen.

### Emner

- `em_pol_arbeidsliv_kollektiv_kamp`: **BEHOLD** → materialisert i `konflikt-makt-sivilsamfunn`;
- `em_pol_demonstrasjoner_protest`: **BEHOLD** → materialisert i `konflikt-makt-sivilsamfunn`;
- `em_pol_mediert_offentlighet`: **BEHOLD** → materialisert i `parlamentarisme` og tidligere etablert gjennom egen Youngstorget place-audit.

Begge aktuelle Fagverk-kapittelauditene har `status: passed` og registry/runtime-synkronisering. Politikk er `subjectStatus: materialized` i Fagverk-portalen.

Ingen nye emner eller underbadges legges til bare for fullness. Fagkoblinger skal være presise; richness skal produseres i brukerinnholdet.

## Fase 2 – Content Factory-resultat

Shared source pack har:

- **12 registrerte kilder**;
- eksplisitte Youngstorget-claims for identitet, 1846/1852/1951, marked, basar, Pioneren, Fredsmonumentet, historisk fotoutstilling, nåtidsbruk, kommunale tiltak, hendelser og 1990-tallsendring;
- downstream seeds for Storgata og `street:brugata` uten å batch-godkjenne dem;
- eksplisitt gjenbruk av TØI-proveniens fra Torggata source base;
- eksplisitt gjenbruk av Oslo kommune-proveniens fra canonical `brugata_storgata_rusmiljo`;
- per-claim scope, freshness og inference limits;
- separate `held_back_claims` og per-place research gaps.

### Viktigste scope-gater

- TØI Torggata/Brugata → `youngstorget`: **NEI**.
- TØI Brugata → `brugata_storgata_rusmiljo`: **NEI**.
- Storgata-byhistorie → `youngstorget`: **NEI** uten eksplisitt relasjonsclaim.
- `street:brugata` → ny bare-`brugata` Place: **NEI**; canonical eier er ikke bevist.
- nabobygg/virksomhet → Youngstorget People/Brands/Stories: **NEI** ved nærhet alene.

### Sterke claims holdt tilbake

Følgende publiseres ikke ubetinget uten uavhengig ekstra kilde:

- «første» 1. mai-demonstrasjonsprosesjon i hovedstaden i 1890;
- «første» kvinnedemonstrasjonsprosesjon i 1898;
- «første» 1. mai-hovedarrangement på Youngstorget i 1956.

## Content Factory-måling så langt

- kilder gjenbrukt direkte fra eksisterende History GO-research/proveniens: **2**;
- nye eksterne kilder lagt til cluster-pakken: **10**;
- scope-ugyldige/generiske claim-kandidater eksplisitt avvist: **5**;
- ferdig coordinate-subsystem bevart uten ny research/geokoding: **1**;
- ferdig category/badge/emne/Fagverk-subsystem bevart uten ny modell-/fagproduksjon: **1**.

Dette er arbeids-/gjenbruksmåling, **aldri kvalitet, richness eller ferdigstatus**.

## Tidligere-arbeid-gate – overordnet

```text
TIDLIGERE-ARBEID-SØK: UTFØRT
SISTE GODKJENTE PR/COMMIT: fase 3 PR #5216 / 809c53eb40cb489cc77ef4b6ae6fceb5fdd90364
SISTE GODKJENTE TILSTAND: canonical identity + Content Factory source/claim pack + verified geometry + korrekt politikk-kategori + canonical underbadges/emner + eksisterende Stories + aktiv quiz + 22+ People + Brands + Lesespor
KONKRET REGRESJONSEVIDENS: description blander anlegg 1846 og Nytorvet-navn 1852; legacy rundingsmodell bryter dagens 4+1; eldre tasks/Civication/Leksikon/routes/music er ikke canonicale rundinger
BESLUTNING: FULLPRODUKSJON MED BEVARING AV DELSYSTEMER SOM BESTÅR DAGENS KONTRAKT
```

## Kjente behold-punkter etter fase 4

- canonical ID og manifest-source `youngstorget`;
- verified geometry;
- `category: politikk`;
- `underbadge_ids: arbeiderbevegelse, aktivisme_og_protest`;
- de tre eksisterende `em_pol_*`-koblingene og deres Fagverk-runtime;
- eksisterende quiz, Stories, People og Lesespor som baseline, ikke automatisk ferdigstatus;
- eksisterende Brands som kandidater, ikke automatisk godkjent place-eierskap.

## Kjente hull / regressions etter fase 4

1. `desc` og `popupDesc` blander 1846-anlegget med 1852-navnet.
2. Ingen moderne description production package er identifisert.
3. Popup/historie mangler dokumentert full canonical chronology/source-eier.
4. Før/etter mangler; source pack har 1990-talls/1996-researchspor, men assetpar og rettigheter mangler.
5. Kilder/source_summary mangler som komplett brukerflate.
6. Bilder mangler som godkjente place-assets/proveniens i preflight.
7. Canonical Objects mangler; source pack har kandidatene Pioneren, Fredsmonumentet, fontene og basar som må ID-/eierskapsauditeres.
8. Rundingssettet er legacy og må migreres til 4+1 uten filler.
9. Brands må own-place-auditeres.
10. People må own-place-, profile-, image- og runtime-auditeres; ≥22 er bare baseline.
11. Språk må vurderes eksplisitt, ikke automatisk N/A.
12. Nyheter/current-status må ferskkontrolleres mot kommunens 2026-side før godkjenning.
13. Onsite må saneres mot dagens kontrakt; legacy tasks er ikke produktet.
14. `year: 1852` må få eksplisitt metadata-semantikk i description/temporal-fasen; ingen blind rewrite.
15. Sterke «første»-claims krever uavhengig ekstra kilde dersom de skal publiseres.

## Popupstatus

| Fane | Status |
| --- | --- |
| Om | **IKKE GODKJENT – claims finnes nå** |
| Historie | **IKKE GODKJENT – rik claim-base finnes nå** |
| Fortellinger | **EKSISTERER – IKKE RE-AUDITERT** |
| Før/etter | **RESEARCHSPOR FUNNET – ASSETS/RETTIGHETER MANGLER** |
| Nyheter | **FERSKE 2026-KILDER FUNNET – IKKE MATERIALISERT/GODKJENT** |
| Lesespor | **EKSISTERER – IKKE RE-AUDITERT** |
| Kilder | **SOURCE PACK FINNES – BRUKERFLATE IKKE FERDIG** |
| Språk | **IKKE VURDERT FERDIG** |
| Spor & objekter | **KANDIDATCLAIMS FINNES – CANONICAL OBJECT AUDIT MANGLER** |
| Andre direktefaner | **IKKE VURDERT FERDIG** |

## Content Factory-regel

Research kan batches i klyngen. Godkjenning og merge skjer fortsatt ett Place om gangen.

Et cluster-claim kan bare brukes på Youngstorget når source packen eksplisitt inkluderer `youngstorget` i claimets place-scope, eller når egen Youngstorget-evidens gir samme claim. Torggata-, Storgata- og Brugata-materiale kan ikke flyttes over via geografisk nærhet.

Kvalitetsporter som skal dokumenteres i sluttproduksjonen:

- name-swap;
- cross-place duplicate;
- place-specific evidence anchors;
- source → claim → text;
- local experience;
- fullness.

Kvalitetsmålet er uendret: **Youngstorget skal være minst like rikt, kildebåret og stedsspesifikt som separat fullproduksjon.**

Hvis en senere checklistflate møter et evidensgap, er neste handling mer Youngstorget-spesifikk research — aldri kortere innhold eller budsjettbegrunnet N/A.