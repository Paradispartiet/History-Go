# VisitOSLO Bygdøy – final canonical coverage audit

Date: 2026-07-21  
Source: VisitOSLO, `Museums and activities at Bygdøy`  
Source entries: 10

This bounded pass audits the VisitOSLO Bygdøy attraction list against current History Go canonical coverage. It reuses the completed Oslo museum-source pass and the existing Bygdøy nature structure instead of reopening already-closed decisions.

## Final result

- **10 of 10 source entries resolved to canonical coverage**
- **7 entries reuse existing canonical places**
- **3 previously unresolved entries were produced after dedicated identity / physical-scope and coordinate review**
- **0 unresolved VisitOSLO Bygdøy gaps remain**

| VisitOSLO entry | final History Go resolution | status | note |
|---|---|---|---|
| The Kon-Tiki Museum | `kon_tiki_museet` | resolved_existing | Existing museum place. |
| Fram Museum - The Polar Exploration Museum | `frammuseet` | resolved_existing | Existing museum place. |
| Norwegian Maritime Museum | `norsk_maritimt_museum` | resolved_existing | Produced in the completed Oslo museum-source pass. |
| Norsk Folkemuseum – Norwegian Museum of Cultural History | `norsk_folkemuseum` | resolved_existing | Produced in the completed Oslo museum-source pass. |
| Bygdø Royal Manor | `bygdoy_kongsgard` | produced | Distinct canonical royal-farm / visitor identity; separate from `bygdoy_kongsgard_salamanderdam`. |
| Holocaust Center | `villa_grande` | resolved_existing | Existing canonical coverage for the HL-senteret site. |
| Oscarshall | `oscarshall` | produced | Distinct royal summer palace at Oscarshallveien 15; surrounding park remains part of the same visitor complex. |
| The Viking Ship Museum | `vikingtidsmuseet` | produced | One stable physical identity for the retained Vikingskipshuset and connected new Vikingtidsmuseum; no duplicate old/new markers. |
| Bygdøy | `bygdoy_natur` | resolved_existing | Broad peninsula-level nature and cultural-landscape anchor. |
| Huk & Paradisbukta beach | `bygdoy_huk` + `bygdoy_paradisbukta` | resolved_split_source_entry | One combined VisitOSLO listing maps to two distinct existing physical beaches. |

## Production trail

### Coordinate and identity intake

PR #3037 completed the bounded intake for the three unresolved candidates:

- Oscarshall: one clear Geonorge address result for Oscarshallveien 15.
- Vikingtidsmuseet: one clear Geonorge address result for Huk aveny 35.
- Bygdø Kongsgård: named-object review, with the salamander locality explicitly rejected as proxy coverage.

### Oscarshall and Vikingtidsmuseet

PR #3039 produced:

- `oscarshall` — Oslo coordinate batch 103
- `vikingtidsmuseet` — Oslo coordinate batch 104

Representation locks:

- Oscarshall is the palace / visitor complex. The surrounding romantic park is not duplicated as a second place from this source alone.
- Vikingtidsmuseet is one physical museum-site identity spanning the retained historic Vikingskipshuset and the connected new museum complex. Coordinate verification is separate from construction / opening status.

### Bygdø Kongsgård

PR #3044 produced:

- `bygdoy_kongsgard` — Oslo coordinate batch 105

The canonical marker uses an exact named OSM visitor object inside the royal-farm complex. The record is explicitly distinct from:

- `bygdoy_kongsgard_salamanderdam`
- Oscarshall
- the broad park polygon
- the entire agricultural / royal-estate extent

The final Oslo coordinate-control count after batch 105 is 248 documented verified or source-controlled canonical places.

## Existing coverage retained

The completed Oslo museum / visitor-source closure already covers:

- `kon_tiki_museet`
- `frammuseet`
- `norsk_maritimt_museum`
- `norsk_folkemuseum`
- HL-senteret through `villa_grande`

The existing Bygdøy nature model separately provides:

- `bygdoy_natur`
- `bygdoy_huk`
- `bygdoy_paradisbukta`
- `bygdoy_kongsgard_salamanderdam`

The combined VisitOSLO `Huk & Paradisbukta` listing therefore remains mapped to two physical canonical beach places rather than creating a synthetic combined marker.

## Closure decision

The bounded 10-entry VisitOSLO Bygdøy source pass is **closed**.

No entry remains in manual review. Future Bygdøy additions should come from a new source family or a new independently documented physical place, not by reopening this completed list without new evidence.
