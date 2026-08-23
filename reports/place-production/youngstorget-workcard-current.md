# Youngstorget – aktivt stedproduksjonskort

- Oppdatert: 2026-08-23
- Place ID: `youngstorget`
- Canonical source: `data/places/politikk/oslo/places_politikk/youngstorget.json`
- Baseline `main`: `3ee60d3bec6de6cf519a1df0b3d17cafecc63b53`
- Styrende kontrakt: `docs/PLACE_PRODUCTION_CHECKLIST.md`
- Obligatorisk preflight: `docs/PLACE_PRODUCTION_PRIOR_WORK_GATE.md`
- Content Factory: `data/places/regler/content_factory_v1.json`
- Nullmåling: `reports/place-production/youngstorget-nullmaaling-v1.md`
- Klynge: Torggata → Youngstorget → Storgata / Brugata–Storgata
- Referanse-/ankersted: `torggata` – skal ikke produseres på nytt i Pilot 01
- Første produksjonsmål: `youngstorget`

## Identitet

Denne oppføringen representerer **selve Youngstorget som offentlig torg/byrom i Oslo sentrum**, ikke de selvstendige byggene, virksomhetene, institusjonene eller andre canonical Places rundt torget.

Nære egne Place-objekter skal behandles som relasjoner når evidensen tillater det, ikke som proxyinnhold. Viktige grenser inkluderer blant annet Folkets Hus, Folketeaterbygningen/Folketeateret, Møllergata 19, Torggata og Storgata.

## Korrigert fasestatus

| Fase | Status | Dokumentasjon / beslutning |
| --- | --- | --- |
| 0. Nullmåling | **GJENNOMFØRT PÅ BRANCH – KLAR FOR PR/REVIEW** | `youngstorget-nullmaaling-v1.md`; ingen canonical data endret |
| 1. Canonical identity/source | **NESTE** | Lås objektgrense, manifest/source, metadata-semantikk og 1846/1852-korreksjonsgrunnlag |
| 2. Kildebase / Content Factory source pack | **IKKE STARTET** | Felles cluster source registry + scoped claims + Youngstorget-spesifikke researchgap |
| 3. Koordinater/geometri | **FORVENTET ALLEREDE FERDIG** | `verified_geometry`; må bekreftes med tidligere-arbeid-gate før godkjenning |
| 4. Kategori, Badges, emner og Fagverk | **IKKE STARTET** | `politikk`; tre `em_pol_*`; to underbadges re-auditeres |
| 5. `desc` + `popupDesc` | **BLOKKERT AV SOURCE PACK** | canonical `desc` har dokumentert 1846/1852-faktaavvik |
| 6. Strukturerte place-profiler | **IKKE STARTET** | Stoffstyrt, ikke felttvang |
| 7. Popupfaner | **IKKE STARTET** | Hver fane får separat review |
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

**Kun fase 0 er gjennomført på arbeidsbranchen. Neste aktive fase etter merge er fase 1.**

Ingen brukerrettet tekst, rounds, People, Brands, quiz, Stories eller andre canonical data skal endres i fase-0-PR-en.

## Tidligere-arbeid-gate – overordnet

```text
TIDLIGERE-ARBEID-SØK: UTFØRT
SISTE GODKJENTE PR/COMMIT: delsystemhistorikk identifisert; ingen full stedproduksjons-closeout funnet
SISTE GODKJENTE TILSTAND: canonical place + verified geometry + politikk-emner + eksisterende Stories + aktiv quiz + 22+ People + Brands + Lesespor
KONKRET REGRESJONSEVIDENS: feil formulering om 1852 som anleggsår; legacy rundingsmodell bryter dagens 4+1; eldre tasks/Civication/Leksikon/routes/music er ikke canonicale rundinger
BESLUTNING: REELT NYTT FULLPRODUKSJONSARBEID, MEN MED BEVARING AV DELSYSTEMER SOM BESTÅR DAGENS KONTRAKT
```

## Kjente behold-punkter før ny produksjon

- canonical ID `youngstorget`;
- category `politikk` inntil fase 4 eventuelt viser noe annet;
- verified coordinate-evidence inntil konkret regresjon dokumenteres;
- eksisterende quiz som baseline;
- eksisterende Stories som baseline;
- eksisterende People som baseline;
- eksisterende Lesespor som baseline;
- eksisterende emner/underbadges som baseline;
- existing Brands as candidates, not automatic approval.

## Kjente hull / regressions

1. `desc` blander etablering i 1846 med offisielt navn Nytorvet fra 1852.
2. Ingen moderne description production package er identifisert.
3. Popup/historie mangler dokumentert full canonical chronology/source-eier.
4. Før/etter mangler.
5. Kilder/source_summary mangler som komplett brukerflate.
6. Bilder mangler som place-assets i preflight.
7. Canonical Objects mangler.
8. Rundingssettet er legacy og må migreres til 4+1 uten filler.
9. Brands må own-place-auditeres.
10. People må own-place-, profile-, image- og runtime-auditeres; ≥22 er bare en baseline.
11. Språk må vurderes eksplisitt, ikke automatisk N/A.
12. Nyheter må vurderes med fersk 2026-evidens.
13. Onsite må saneres mot dagens kontrakt; legacy tasks er ikke produktet.

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

## Content Factory-regel for denne piloten

Research kan batches i klyngen. Godkjenning og merge skjer fortsatt ett Place om gangen.

Et cluster-claim kan bare brukes på Youngstorget når source packen eksplisitt har `applicable_place_ids` som inkluderer `youngstorget`, eller når en egen Youngstorget-kilde gir samme claim. Torggata-materiale, Storgata-materiale og Brugata-materiale kan ikke flyttes over via geografisk nærhet.

Følgende kvalitetsporter skal dokumenteres i sluttproduksjonen:

- name-swap;
- cross-place duplicate;
- place-specific evidence anchors;
- source → claim → text;
- local experience;
- fullness.

## Pilotmåling

Cost/research-effektivitet logges, men er aldri ferdigport:

- kilder som kunne gjenbrukes lovlig;
- claims som kunne gjenbrukes med korrekt scope;
- unngåtte dupliserte fetch/research-operasjoner;
- Youngstorget-spesifikke gap som krevde ny research.

Kvalitetsmålet er uendret: **Youngstorget skal være minst like rikt, kildebåret og stedsspesifikt som separat fullproduksjon.**