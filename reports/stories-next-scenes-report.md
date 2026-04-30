# Stories Next Scenes Report

Dato: 2026-04-30

## Oppsummering
- Story-filer gjennomgått (fra `stories_manifest.json`): **14**
- Stories gjennomgått totalt: **15**
- Stories som fikk nye `next_scenes`: **3**

## Nye `next_scenes` lagt til
1. `st_akerselva_fyrstikkpikene_1889` (`akerselva`) → `youngstorget`
   - Begrunnelse: fortellingen går fra streik ved industrien til organisert politisk mobilisering i byens arbeider-offentlighet.
2. `st_universitetet_1811` (`universitetsplassen`) → `stortinget`
   - Begrunnelse: narrativ fortsettelse fra akademisk institusjonsbygging til nasjonal beslutningsarena.
3. `st_munch_tyveriet_2004` (`munch_museet`) → `bjorvika`
   - Begrunnelse: direkte fortsettelse i historien om flytting av Munch-samlingen og ny museumsramme.

## Kandidater vurdert, men ikke lagt til
- `st_bislett_hjalmar_andersen_1952` → `holmenkollen` (tematisk sportskobling, men ikke tydelig narrativ fortsettelse i storyteksten).
- `st_stortinget_unionsopplosning_1905` → `akerhus_slott` (historisk nærhet, men ikke eksplisitt sceneovergang i denne fortellingen).
- `st_vigeland_kontrakten_1921` → `vigelandsmuseet` (kunne vært relevant, men avklart ikke lagt inn uten sikker place-validering i aktiv place-dataflyt).

## Place-id validering for nye next_scenes
Validerte og beholdte `place_id`:
- `youngstorget`
- `stortinget`
- `bjorvika`

Alle tre finnes i place-data, og ingen nye `next_scenes.place_id` peker til ukjent sted.

## Manglende place-id-er (ikke lagt til)
- Ingen manglende `place_id` i de faktisk innlagte `next_scenes`.
