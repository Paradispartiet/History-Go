# Youngstorget – fase 7B Historie audit v1

- Dato: 2026-08-23
- Place ID: `youngstorget`
- Baseline: `main` etter fase 7A / PR #5230 / `bee5692301164b52ad9df5a0daabfbde974ee47a`
- Popupkontrakt: `docs/PLACE_POPUP_SYSTEM.md`
- Status: **KLAR FOR REVIEW**

## Tidligere-arbeid-gate

```text
TIDLIGERE-ARBEID-SØK: UTFØRT
SISTE GODKJENTE TILSTAND: fase 6 materialiserte fire kildebårne history_layers og seks temporal-milestones; fase 7A låste én-visuell-eier-grensen
KONKRET REGRESJONSEVIDENS: ingen Youngstorget-eid Leksikonartikkel/chronology finnes; popup-v2 renderer history_layers og tabs-runtime flytter historiedelen til Historie-fanen
BESLUTNING: ALLEREDE FERDIG – lås eksisterende Historie-flate og chronology-eierskap uten å produsere parallell tidslinje eller filler
```

## Historieflaten som faktisk finnes

Canonical Youngstorget har fire sorterte `history_layers`:

| Rekkefølge | Periode | Lag | Dekning |
| --- | --- | --- | --- |
| 10 | 1846–1870-årene | Markedstorget blir til | anlegg 1846, Nytorvet 1852, handel/kveghandel, markedstrafikk og basaren |
| 20 | 1890–1930-årene | Arbeiderbevegelsens samlingsrom | 1. mai-demonstrasjonen 1890 og dokumenterte massemøter i 1920-/1930-årene |
| 30 | 1951–1997 | Nytt navn og synlige minnespor | Youngstorget-navnet 1951, Pioneren 1958 og fredsmonumentet 1997 |
| 40 | 1990-årene–1996 | Torget bygges om | omfattende omarbeiding og gjenåpning med endret trafikkmønster i 1996 |

Dette er korte historiske lag med tydelig periodisering, ikke en kopi av den lange `popupDesc`-artikkelen.

## Temporal profile og chronology-eierskap

`temporal_profile` registrerer seks strukturelle milepæler: **1846, 1852, 1890, 1951, 1958 og 1996**. Alle seks er allerede eksplisitt representert i de fire `history_layers`.

Popupkontrakten tillater både Leksikon `chronology` og place `history_layers`, men én-visuell-eier-regelen skal hindre at samme tidsstoff vises to ganger uten redaksjonell merverdi.

Youngstorget skiller seg her fra Torggata:

- Torggata hadde en egen Leksikon-hovedartikkel og en konkret legacy chronology-regresjon som måtte supersedes i fase 7B;
- Youngstorget har ingen manifest-lastet Leksikonartikkel med `place_id: youngstorget`;
- det finnes derfor ingen canonical Youngstorget-chronology som må bygges, repareres eller undertrykkes;
- å lage seks nye chronology-poster bare for å speile `temporal_profile` ville doble det eksisterende Historie-innholdet uten ny kunnskapsverdi.

Beslutningen er derfor å la `history_layers` være den brukerrettede historietidslinjen for Youngstorget på dette stadiet.

## Runtimebevis

`js/ui/place-popup-v2.js` har en generell `renderHistoryTimeline(place)` som:

1. leser `place.history_layers`;
2. sorterer på `sort_order`;
3. renderer perioden, tittelen og sammendraget som `.hg-place-history-section`;
4. er koblet direkte inn i den canonical popup-bodyen.

`js/ui/place-popup-tabs.js` flytter eksisterende `.hg-place-history-section` inn i `tabs.panels.history` før Leksikon-data hydreres.

Den separate Leksikon-tidslinjen bygges bare fra `main?.chronology` og `extras[*].chronology`. Siden Youngstorget ikke har en egen Leksikonartikkel, blir det ikke opprettet en parallell chronology i 7B.

## Kilde- og placegrense

7B introduserer ingen nye historiske påstander. Innholdet gjenbruker fase-2/5/6-claimbanken og den låste `source_summary`, blant annet Oslo kommune, Oslo byleksikon og Arbeiderbevegelsens arkiv og bibliotek.

Nære egne Places som Folkets Hus, Folketeateret, Møllergata 19, Torggata, Storgata og Brugata–Storgata-rusmiljøet brukes ikke som proxy for Youngstorgets historie.

Produksjonsmodell/API-kreditter i 7B: **0**, fordi denne fasen bare verifiserer og låser allerede verifisert, place-spesifikt innhold. Dette er ikke en budsjettbegrunnet reduksjon av innhold eller research.

## Bevisst ikke endret

- canonical Youngstorget JSON;
- `desc`, `popupDesc` eller production-pakken;
- `spatial_profile`, `temporal_profile`, `history_layers` eller `source_summary`;
- Leksikonfiler eller manifest;
- popup-runtime;
- Stories, Før/etter, Nyheter, Lesespor, Kilder eller Språk;
- rundinger, People, Objects, Brands, Quiz eller onsite.

## Regresjonslås

`tests/youngstorget-phase7b-history.test.mjs` låser at:

1. Youngstorget fortsatt har nøyaktig fire `history_layers` med stabil ID- og sorteringsrekkefølge;
2. alle fire lag har konkret periode, tittel og substansielt sammendrag;
3. de seks strukturelle temporal-milepælene er representert i Historie-lagene;
4. popup-v2 fortsatt renderer `history_layers` gjennom `renderHistoryTimeline(place)`;
5. tabs-runtime fortsatt flytter `.hg-place-history-section` til Historie-fanen;
6. ingen manifest-lastet Youngstorget-Leksikonpost oppretter en konkurrerende chronology;
7. ingen generell `temporal_profile`-renderer legges til for å duplisere Historie.

## Kvalitetsvurdering før CI

1. Korrekthet og evidens: **5/5** – ingen nye claims; eksisterende verifisert claimbase og placegrense bevares.
2. Dekning og ferdigstillelse: **5/5** – alle fire lag og alle seks strukturelle milepæler er kontrollert.
3. Faglig/redaksjonell kvalitet: **5/5** – chronology-filler og dobbeltpresentasjon unngås.
4. Teknisk integritet: **4/5** – permanent regresjonslås er lagt til; endelig score krever grønn PR-CI.
5. Sikkerhet og ansvarlighet: **5/5** – ingen personvern-, høyrisiko- eller udokumentert nåtidsflate endres.
6. Vedlikeholdbarhet og etterprøvbarhet: **5/5** – eiergrensen mellom temporal struktur, history-lag og Leksikon chronology er eksplisitt.

Foreløpig sum: **29/30**. Fase 7B kan klassifiseres ferdig først etter grønn CI, merge og kontroll på fersk `main`.

Neste delsteg er **7C – Fortellinger**.
