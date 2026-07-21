# VisitOSLO Grünerløkka – closure

Date: 2026-07-21
Source: VisitOSLO, `Galleries and attractions at Grünerløkka`
Source entries: 14
Resolved entries: 14
New canonical places produced: 4
Existing canonical places reused: 10
Unresolved canonical gaps: 0

## Final source-to-canonical mapping

| VisitOSLO entry | Final History Go resolution | Decision |
|---|---|---|
| Akerselva river | `akerselva` | Reuse existing canonical river/area place. |
| Sculpturestop – HEAD N.N. | `hodet_nn_torshovdalen` | New distinct canonical public-art place. |
| Paulus Church | `paulus_kirke` | New distinct canonical active church; runtime category `religion`. |
| Torshovparken | `torshovparken` | New distinct canonical park; separate from broad `torshov`. |
| Atelier Nord | `hauges_minde` | Reuse same physical building at Olaf Ryes plass 2. |
| Sofienberg Park | `sofienbergparken_subkultur` | Reuse existing canonical park identity. |
| Hønse-Lovisas hus | `honse_lovisas_hus` | Reuse existing canonical place. |
| Purenkel | `purenkel_galleri` | New distinct canonical physical gallery. |
| Labour Museum | `arbeidermuseet` | Reuse existing canonical museum. |
| Jakob Culture Church | `kulturkirken_jakob_litteratur` | Reuse existing canonical place. |
| Vulkan | `vulkan_industriomrade` | Reuse broad canonical Vulkan area, not `vulkan_energisentral`. |
| Waterfall at Mølla | `voienfossen` | Reuse Vøyenfallene; preliminary `ovre_foss` fuzzy match is explicitly rejected. |
| Anker bridge | `ankerbrua` | Reuse existing canonical bridge. |
| Birkelunden | `birkelunden` | Reuse existing canonical park/place. |

## New canonical production

The four approved gaps were produced on current `main` in Oslo coordinate batches **98–101**:

- batch 98 — `paulus_kirke`
- batch 99 — `purenkel_galleri`
- batch 100 — `torshovparken`
- batch 101 — `hodet_nn_torshovdalen`

All four passed the repository's blocking place and coordinate gates before publication:

- split-manifest synchronization
- runtime place-index synchronization
- coordinate source contract
- coordinate quality gate
- strict-new coordinate intake
- coordinate-evidence audit
- `git diff --check`

The standard `health:places` result remains a separately captured non-blocking health signal under the repository's established coordinate-runner convention.

## Locked scope decisions

### Atelier Nord

Atelier Nord does not receive a duplicate place marker. Its gallery, office and studio are in the same physical municipal building already represented by `hauges_minde`, whose canonical content already includes the building's current artist-studio and contemporary-art use.

### Vulkan

The VisitOSLO attraction refers to the transformed Vulkan neighbourhood/area and therefore maps to `vulkan_industriomrade`. The more specific `vulkan_energisentral` is not the source-level match.

### Fossen ved Mølla

The VisitOSLO waterfall beside Beierbrua and Hønse-Lovisas hus maps to `voienfossen` / Vøyenfallene. The preliminary automated candidate `ovre_foss` was a name-similarity false match and is explicitly rejected for this source entry.

### Torshovparken

Torshovparken is a separately bounded physical park and is not collapsed into the broad `torshov` district anchor or the distinct `treningssted_torshovdalen` sport place.

### Paulus kirke

`paulus_kirke` is stored within the established Oslo history source structure but has runtime primary category `religion` through the canonical category-override model because it is an active church and primary religious place.

## Closure status

The bounded 14-entry VisitOSLO Grünerløkka source pass is complete.

- 14/14 source entries resolved
- 4 new canonical places
- 10 existing canonical reuses
- 0 unresolved scope decisions
- 0 unresolved canonical gaps
