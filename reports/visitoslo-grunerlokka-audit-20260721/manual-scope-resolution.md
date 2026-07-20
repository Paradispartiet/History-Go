# VisitOSLO Grünerløkka – manual scope resolution

Date: 2026-07-21

This closes the seven `manual_review` rows from the merged 14-entry VisitOSLO Grünerløkka source audit. The decisions are physical-scope decisions only; approved new places still require the normal coordinate intake, overlap gate, manifest registration and validation stack before production.

## Resolution summary

| VisitOSLO entry | decision | canonical target / proposed id | reason |
|---|---|---|---|
| Sculpturestop – HEAD N.N. | approve new canonical place | `hodet_nn_torshovdalen` | Permanent, named, site-specific seven-metre bronze artwork in Torshovdalen; no canonical or Wonderkammer identity match found. |
| Paulus Church | approve new canonical place | `paulus_kirke` | Distinct active church building at Thorvald Meyers gate 31; current canonical search finds references to the church but no actual canonical place record. |
| Torshovparken | approve new canonical place | `torshovparken` | Stable named municipal park with its own bounded physical identity; distinct from the broad `torshov` district anchor and from `treningssted_torshovdalen`. |
| Atelier Nord | reuse existing canonical place | `hauges_minde` | Atelier Nord's gallery/office/studio are in the same physical municipal building at Olaf Ryes plass 2 already represented by `hauges_minde`; the existing record explicitly includes the building's present artist-studio/contemporary-art use. |
| Purenkel | approve new canonical place | `purenkel_galleri` | Current, publicly visitable gallery at Grüners gate 3; no canonical place or hidden address-level duplicate found. |
| Vulkan | reuse existing canonical place | `vulkan_industriomrade` | The VisitOSLO attraction is the transformed Vulkan neighbourhood/area, already represented by the broad canonical Vulkan area anchor; do not substitute the separate `vulkan_energisentral`. |
| Waterfall at Mølla | reuse existing canonical place | `voienfossen` | The source describes the falls beside Beierbrua and Hønse-Lovisas hus. This is the existing Vøyenfallene canonical system, not `ovre_foss`; the preliminary fuzzy candidate was therefore rejected. |

## 1. HODET N.N.

**Decision:** approve `hodet_nn_torshovdalen` as a new `kunst` candidate.

Skulpturstopp documents Marianne Heske's permanent work `HODET N.N.` from 2014 in Torshovdalen. VisitOSLO describes the same physical attraction. Repository searches for `HODET N.N.`, `HEAD N.N.`, `Marianne Heske` and the work/place combination found no canonical place or existing artwork layer representing this object.

The work is physically and semantically distinct from the broad Torshov district record and from the separate Torshovdalen training-place record. Production must resolve one exact artwork coordinate or an independently cross-checked point for the sculpture itself; a generic Torshovdalen park anchor is not sufficient.

Sources:
- https://www.skulpturstopp.no/oslo
- https://www.visitoslo.com/en/activities-and-attractions/boroughs/grunerlokka/attractions/

## 2. Paulus kirke

**Decision:** approve `paulus_kirke` as a new active church candidate, with runtime primary category `religion` under the current primary-function rule.

The Church of Norway documents Paulus kirke as the 1892 church building at Thorvald Meyers gate 31 opposite Birkelunden. Repository search finds textual references and contrast-target strings for `paulus_kirke`, but no actual canonical place object. The church is a distinct physical place and must not be collapsed into `birkelunden`, `grunerlokka_helgesens_tm` or the parish office.

Production should run the normative address-first Geonorge lookup for **Thorvald Meyers gate 31** and then apply the ordinary nearby-overlap audit.

Source:
- https://www.kirken.no/nn-NO/fellesrad/kirkeneioslo/menigheter/paulus-sofienberg/paulus-kirke/

## 3. Torshovparken

**Decision:** approve `torshovparken` as a new `by` park candidate.

Oslo kommune defines Torshovparken as a named municipal park bounded by Agathe Grøndahls gate, Johan Svendsens gate, Hagermanns gate and Per Kvibergs gate. This is a stable, separately bounded physical park. The existing `torshov` record is explicitly a 450-metre district/area anchor whose description merely includes Torshovparken among several neighbourhood spaces; it is not a park representation. The existing `treningssted_torshovdalen` is a different sport/training site in the neighbouring Torshovdalen.

Production should prefer named park geometry or another documented area anchor, not an arbitrary surrounding street address.

Source:
- https://www.oslo.kommune.no/natur-kultur-og-fritid/tur-og-friluftsliv/parker-og-lekeplasser/torshovparken/

## 4. Atelier Nord

**Decision:** no new place; map the VisitOSLO entry to `hauges_minde`.

The merged `hauges_minde` canonical record already represents the exact municipal building at Olaf Ryes plass 2 and explicitly documents its present artist-studio and contemporary-art use. The earlier Oslo cultural-properties research also records that the property contains Atelier Nord. Atelier Nord's own current public information places its gallery, office and studio at the same address/building.

A separate marker would therefore duplicate the physical building. Future Atelier Nord-specific material can enrich `hauges_minde` as a current-use/content layer.

Sources:
- https://ateliernord.no/
- existing canonical `hauges_minde`
- `reports/oslo-kultureiendommer-batch-3/research.md`

## 5. Purenkel

**Decision:** approve `purenkel_galleri` as a new `kunst` candidate.

Purenkel's current official site describes a publicly visitable gallery at Grüners gate 3 and gives current 2026 opening information. Repository searches for the institution name and exact address found no canonical gallery identity or address-level duplicate.

The gallery is a stable physical visitor place despite also operating an online shop. Production should use the normative address-first lookup for **Grüners gate 3** and keep retail/e-commerce details secondary to the physical gallery and art-formidling role.

Sources:
- https://www.purenkel.no/pages/om-galleriet
- https://www.purenkel.no/

## 6. Vulkan

**Decision:** no new place; map to `vulkan_industriomrade`.

VisitOSLO presents Vulkan as the transformed neighbourhood/area. The existing canonical `vulkan_industriomrade` is already a broad area anchor for exactly that former industrial site and its contemporary mixed urban reuse. The separate `vulkan_energisentral` is a specific technical building and is not the correct source-level match.

## 7. Fossen ved Mølla / Waterfall at Mølla

**Decision:** no new place; map to `voienfossen` (`Vøyenfallene`).

The preliminary automated audit surfaced `ovre_foss` by name similarity, but manual physical-scope review rejects that match. VisitOSLO locates the attraction beside Beierbrua and Hønse-Lovisas hus. The existing `voienfossen` record represents the Vøyenfallene system between Bentsebrua and Sannerbrua and explicitly covers the documented falls around Hjula/Vøyen.

This source entry should therefore enrich/refer to `voienfossen`; it must not create a duplicate waterfall marker. The existing Vøyenfallene coordinate status remains an independent coordinate-control issue and is not changed by this coverage decision.

Sources:
- https://www.visitoslo.com/no/produkt/?name=Fossen-ved-Molla&tlp=2982973
- existing canonical `voienfossen`

## Closed manual-review queue

- **4 approved new-place candidates:** `hodet_nn_torshovdalen`, `paulus_kirke`, `torshovparken`, `purenkel_galleri`
- **3 existing canonical reuses:** `hauges_minde`, `vulkan_industriomrade`, `voienfossen`
- **0 unresolved scope decisions**

Next production order:
1. Run coordinate/overlap intake for Paulus kirke and Purenkel using documented addresses.
2. Resolve exact named geometry/object anchors for Torshovparken and HODET N.N.
3. Produce only candidates that pass the coordinate source contract and duplicate gate.
4. Run a final 14-entry closure audit after production.
