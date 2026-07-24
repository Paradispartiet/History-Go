# VisitOSLO Galleries — full 66-item scope classification

Date: 2026-07-23

Source: the complete 66-item VisitOSLO Galleries snapshot in `../api-source-discovery/gallery-source-snapshot.json`.

## Final result

All **66/66** source items are classified with **0 unresolved scope decisions**:

- **18 existing canonical places**
- **4 parent reuse / enrichment cases**
- **31 private/commercial policy deferrals**
- **10 new canonical candidates**
- **1 coordinate-only backlog item**
- **2 geographic out-of-scope items**

## Decision rule

The existing gallery policy remains binding. VisitOSLO inclusion alone does not create a canonical History Go place gap.

A new marker is approved for further production work when the venue has a durable and independent physical/cultural identity and is not merely a high-churn commercial listing. Member organisations, artist-run institutions, foundations and distinctive public cultural sites are treated separately from ordinary private sales galleries.

Where a current institution occupies an already canonical physical building, the default is parent reuse and content enrichment rather than a second overlapping marker.

## Existing canonical coverage

18 source items are already covered. The machine audit found 17 direct exact-name matches used here plus the secure variant match `Purenkel` → `purenkel_galleri`.

The out-of-scope item Blaafarveværket is intentionally not counted in the Oslo existing-coverage total even though it already has canonical coverage as `blaafarvevaerket_modum`.

## Parent reuse / enrichment

- **Oslo Kunstforening** → `radmannsgarden_og_anatomibygget` — already completed in the curated priority tranche.
- **BO Billedkunstnerne i Oslo** → `radmannsgarden_og_anatomibygget` — completed parent enrichment; BO is recorded as a current organisation and exhibition-space layer in Anatomigården.
- **Oslo Glass Studio** → `kirkeristen_basarene_brannvakten` — completed parent enrichment; the working glass studio/gallery is recorded as a current use layer inside Kirkeristen.
- **Atelier Nord** → `hauges_minde` — completed parent enrichment; Atelier Nord is recorded as the current media-art exhibition layer in Hauges Minde.

## Coordinate-only backlog

- **SOFT galleri** → `soft_galleri` remains scope-approved but coordinate-blocked. The ordinary Rådhusgata 20 address point exactly overlaps the institution-specific `fotografiens_hus` marker. No synthetic offset or guessed entrance may be used.

## Geographic out-of-scope

- **Blaafarveværket** — outside Oslo municipality; already canonical in Modum.
- **Henie Onstad Kunstsenter** — Høvikodden, Bærum; not an Oslo-municipality production gap.

## New canonical candidate queue

These 10 now proceed to individual current-main identity, duplicate, physical-parent and coordinate audits:

1. `edvard_munchs_atelier_ekely` — Edvard Munchs atelier på Ekely
2. `tegnerforbundet` — Tegnerforbundet – senter for tegnekunst
3. `unge_kunstneres_samfund` — Unge Kunstneres Samfund
4. `norske_grafikere` — Galleri Norske Grafikere
5. `rom_for_kunst_og_arkitektur` — Galleri ROM for kunst og arkitektur
6. `the_mini_bottle_gallery` — The Mini Bottle Gallery
7. `galleri_lnm` — Galleri LNM
8. `ram_galleri` — RAM galleri
9. `galleri_schaeffers_gate_5` — Galleri Schaeffers Gate 5
10. `grafill` — Grafill

This is a scope approval only. None of the ten receive a canonical marker until their individual physical identity and coordinate evidence pass the normal source-first gates.

## Private/commercial policy deferrals

31 listings remain deferred under the same policy used in the curated tranche. This group includes established commercial galleries as well as newer/private spaces where longevity, cultural significance, independent place identity or coordinate stability have not yet been resolved strongly enough to justify one-off canonical production.

The full list is recorded in `final-classification.json`.

## Next production order

1. Audit and produce the 10 approved new candidates one by one, with current-main duplicate and physical-parent gates before coordinate work.
2. Parent enrichment queue completed: BO, Oslo Glass Studio and Atelier Nord are now folded into their existing physical parent records.
3. Keep `soft_galleri` in coordinate-only backlog until a distinct authoritative physical anchor exists.
4. Leave the 31 private/commercial listings deferred until the gallery inclusion framework is intentionally revisited as a single consistent policy pass.

Status: **FULL VISITOSLO GALLERIES SCOPE CLOSED — 66/66 CLASSIFIED; PARENT ENRICHMENT QUEUE COMPLETE; 0 UNRESOLVED.**
