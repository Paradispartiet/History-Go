# Youngstorget – aktivt stedproduksjonskort

- Oppdatert: 2026-08-23
- Place ID: `youngstorget`
- Canonical source: `data/places/politikk/oslo/places_politikk/youngstorget.json`
- Aktiv baseline `main`: `0b62e1c96bbddcf9c8574f10e0d041bba90ca48e`
- Fase 0 merge: PR #5213 / `0b62e1c96bbddcf9c8574f10e0d041bba90ca48e`
- Styrende kontrakt: `docs/PLACE_PRODUCTION_CHECKLIST.md`
- Obligatorisk preflight: `docs/PLACE_PRODUCTION_PRIOR_WORK_GATE.md`
- Content Factory: `data/places/regler/content_factory_v1.json`
- Nullmåling: `reports/place-production/youngstorget-nullmaaling-v1.md`
- Fase 1: `reports/place-production/youngstorget-phase1-identity-source-v1.md`
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

`year: 1852` endres ikke blindt. Primærårssemantikken må dokumenteres sammen med description-production package fordi repoet ikke definerer `year` universelt som etableringsår, mens metadata–tekst-konsistens er obligatorisk.

## Fasestatus

| Fase | Status | Dokumentasjon / beslutning |
| --- | --- | --- |
| 0. Nullmåling | **FERDIG OG MERGET** | PR #5213 / `0b62e1c9…`; kun rapport/workcard |
| 1. Canonical identity/source | **FERDIG PÅ AKTIV BRANCH – KLAR FOR PR** | Identitet, source-owner, own-place-grense og 1846/1852/1951 er låst; ingen canonical data endret |
| 2. Kildebase / Content Factory source pack | **NESTE ETTER FASE-1-MERGE** | Felles source registry + scoped claims + Youngstorget-spesifikke gaps |
| 3. Koordinater/geometri | **FORVENTET ALLEREDE FERDIG** | `verified_geometry`; tidligere-arbeid-gate skal bekrefte uten ny geokoding |
| 4. Kategori, Badges, emner og Fagverk | **IKKE STARTET** | `politikk`; tre `em_pol_*`; to underbadges re-auditeres |
| 5. `desc` + `popupDesc` | **BLOKKERT AV SOURCE PACK** | dagens tekst blander 1846-anlegget med 1852-navnet |
| 6. Strukturerte place-profiler | **IKKE STARTET** | stoffstyrt, ikke felttvang |
| 7. Popupfaner | **IKKE STARTET** | hver fane separat review |
| 8. Rundinger | **BLOKKERENDE LEGACY-AVVIK** | dagens `people · badges · civication · brands · leksikon · routes · music` følger ikke 4+1-kontrakten |
| 9. På stedet | **IKKE STARTET** | legacy tasks skal ikke videreføres ukritisk |
| 10. Quiz | **EKSISTERER – RE-AUDIT SENERE** | aktivt 5-spørsmålssett finnes; ikke regenerer uten konkret behov |
| 11. Observer / Notat / Rute | **IKKE STARTET** | eide flows auditeres separat |
| 12. People–sted | **EKSISTERER – RE-AUDIT SENERE** | permanent test låser ≥22 koblinger; kvantitet er ikke kvalitetsbevis |
| 13. Brands | **EKSISTERER – OWN-PLACE AUDIT SENERE** | 4 mappings i `brands_by_place.json` |
| 14. Discovery / relations / NextUp / search / i18n | **IKKE STARTET** | place-spesifikk audit |
| 15–19. Besøk, progresjon, profil, legacy, bilder | **IKKE STARTET / RE-AUDIT** | bilder er et kjent faktisk hull |
| 20–24. Data-QA, UI-QA, innholds-QA, CI, ett-sted-gate | **IKKE STARTET** | kan først lukkes etter full produksjon |

## Aktiv fase

På denne branchen er **fase 1 den eneste fasen som er utført**. Ingen brukerrettet Place-, People-, Story-, Quiz-, Brand-, image-, rounds- eller runtime-data er endret.

Etter merge skal ny branch opprettes fra fersk `main`, og bare **fase 2 – Content Factory source/claim pack** skal være aktiv.

## Tidligere-arbeid-gate – overordnet

```text
TIDLIGERE-ARBEID-SØK: UTFØRT
SISTE GODKJENTE PR/COMMIT: fase 0 PR #5213 / 0b62e1c96bbddcf9c8574f10e0d041bba90ca48e
SISTE GODKJENTE TILSTAND: canonical place + verified geometry + politikk-emner + eksisterende Stories + aktiv quiz + 22+ People + Brands + Lesespor
KONKRET REGRESJONSEVIDENS: description blander anlegg 1846 og Nytorvet-navn 1852; legacy rundingsmodell bryter dagens 4+1; eldre tasks/Civication/Leksikon/routes/music er ikke canonicale rundinger
BESLUTNING: FULLPRODUKSJON MED BEVARING AV DELSYSTEMER SOM BESTÅR DAGENS KONTRAKT
```

## Kjente behold-punkter

- canonical ID og manifest-source `youngstorget`;
- category `politikk` inntil fase 4 eventuelt dokumenterer noe annet;
- verified coordinate-evidence inntil konkret regresjon dokumenteres;
- eksisterende quiz, Stories, People, Lesespor og emner/underbadges som baseline, ikke automatisk ferdigstatus;
- eksisterende Brands som kandidater, ikke automatisk godkjent place-eierskap.

## Kjente hull / regressions

1. `desc` og `popupDesc` blander 1846-anlegget med 1852-navnet.
2. Ingen moderne description production package er identifisert.
3. Popup/historie mangler dokumentert full canonical chronology/source-eier.
4. Før/etter mangler.
5. Kilder/source_summary mangler som komplett brukerflate.
6. Bilder mangler som place-assets i preflight.
7. Canonical Objects mangler.
8. Rundingssettet er legacy og må migreres til 4+1 uten filler.
9. Brands må own-place-auditeres.
10. People må own-place-, profile-, image- og runtime-auditeres; ≥22 er bare baseline.
11. Språk må vurderes eksplisitt, ikke automatisk N/A.
12. Nyheter må vurderes med fersk 2026-evidens.
13. Onsite må saneres mot dagens kontrakt; legacy tasks er ikke produktet.
14. `year: 1852` må få eksplisitt metadata-semantikk i description/temporal-fasen; ingen blind rewrite.

## Popupstatus

| Fane | Status |
| --- | --- |
| Om | **IKKE GODKJENT** |
| Historie | **IKKE GODKJENT** |
| Fortellinger | **EKSISTERER – IKKE RE-AUDITERT** |
| Før/etter | **MANGLER** |
| Nyheter | **MANGLER / FERSK RESEARCH NØDVENDIG** |
| Lesespor | **EKSISTERER – IKKE RE-AUDITERT** |
| Kilder | **IKKE FERDIG** |
| Språk | **IKKE VURDERT FERDIG** |
| Andre direktefaner | **IKKE VURDERT FERDIG** |

## Content Factory-regel

Research kan batches i klyngen. Godkjenning og merge skjer fortsatt ett Place om gangen.

Et cluster-claim kan bare brukes på Youngstorget når source packen eksplisitt har `applicable_place_ids` som inkluderer `youngstorget`, eller når en egen Youngstorget-kilde gir samme claim. Torggata-, Storgata- og Brugata-materiale kan ikke flyttes over via geografisk nærhet.

Kvalitetsporter som skal dokumenteres i sluttproduksjonen:

- name-swap;
- cross-place duplicate;
- place-specific evidence anchors;
- source → claim → text;
- local experience;
- fullness.

## Pilotmåling

Research-effektivitet logges separat fra kvalitet:

- kilder som kunne gjenbrukes lovlig;
- claims som kunne gjenbrukes med korrekt scope;
- unngåtte dupliserte fetch/research-operasjoner;
- Youngstorget-spesifikke gap som krevde ny research.

Kvalitetsmålet er uendret: **Youngstorget skal være minst like rikt, kildebåret og stedsspesifikt som separat fullproduksjon.**