# VisitOSLO Bygdøy – preliminary canonical coverage audit

Date: 2026-07-21
Source: VisitOSLO, `Museums and activities at Bygdøy`
Source entries: 10

This bounded pass audits the current VisitOSLO Bygdøy attraction list against current History Go canonical coverage. It deliberately reuses the completed Oslo museum-source pass and the existing Bygdøy nature structure instead of reopening already-closed museum decisions.

## Preliminary result

- **7 source entries resolved to existing canonical coverage**
- **3 entries require dedicated identity / physical-scope review before production**
- **0 new places created in this audit**

| VisitOSLO entry | preliminary History Go resolution | status | note |
|---|---|---|---|
| The Kon-Tiki Museum | `kon_tiki_museet` | resolved | Explicitly confirmed by the completed Oslo museum-source pass. |
| Fram Museum - The Polar Exploration Museum | `frammuseet` | resolved | Explicitly confirmed by the completed Oslo museum-source pass. |
| Norwegian Maritime Museum | `norsk_maritimt_museum` | resolved | Produced and closed in the completed Oslo museum-source pass. |
| Norsk Folkemuseum – Norwegian Museum of Cultural History | `norsk_folkemuseum` | resolved | Produced and closed in the completed Oslo museum-source pass. |
| Bygdø Royal Manor | proposed `bygdoy_kongsgard` | manual_review | Distinct royal estate / main-house identity. Existing `bygdoy_kongsgard_salamanderdam` is a separate nature locality and must not be treated as coverage for the royal residence and farm. |
| Holocaust Center | `villa_grande` | resolved | Explicitly confirmed by the completed Oslo museum-source pass. |
| Oscarshall | proposed `oscarshall` | manual_review | Distinct royal summer palace. Repository search surfaces Wonderkammer references but no canonical place identity. Requires exact duplicate and coordinate audit. |
| The Viking Ship Museum | proposed current-site identity review | manual_review | The old Vikingskipshuset is being incorporated into the new Vikingtidsmuseet. The canonical model must represent the stable physical museum site without falsely presenting the venue as currently open. |
| Bygdøy | `bygdoy_natur` | resolved | Existing broad Bygdøy nature-and-cultural-landscape area anchor covers the peninsula-level visitor entry. |
| Huk & Paradisbukta beach | `bygdoy_huk` + `bygdoy_paradisbukta` | resolved_split_source_entry | VisitOSLO combines two beaches; History Go correctly keeps them as two distinct physical nature places. No combined duplicate marker. |

## Existing-coverage evidence

The completed Oslo museum / visitor-source closure explicitly records current canonical coverage for:

- `kon_tiki_museet`
- `frammuseet`
- `norsk_maritimt_museum`
- `norsk_folkemuseum`
- HL-senteret through `villa_grande`

The existing Bygdøy nature model separately provides:

- `bygdoy_natur` as the broad peninsula-level nature and cultural-landscape anchor
- `bygdoy_huk`
- `bygdoy_paradisbukta`

The VisitOSLO combined beach listing therefore maps to two existing canonical places rather than creating a synthetic `Huk & Paradisbukta` place.

## Manual-review queue

### 1. Bygdø Kongsgård

**Provisional decision:** strong new canonical candidate, subject to duplicate and coordinate gates.

The Royal Court documents Bygdø Royal Farm as a long-standing royal estate and summer residence with a distinct main house and historic garden. The existing canonical `bygdoy_kongsgard_salamanderdam` represents a separate salamander locality and is not a substitute for the royal farm / residence.

Required next checks:

1. Search current canonical place IDs, aliases and aggregate files for hidden Bygdø Kongsgård identity.
2. Resolve the correct physical representation: main building / public visitor identity rather than the entire agricultural estate unless the source contract supports an area model.
3. Run normative address-first or exact official-object coordinate intake.
4. Audit overlap with Norsk Folkemuseum and nearby Bygdøy nature places.

Official identity source:
- https://www.royalcourt.no/the-royal-residences/bygdo-royal-farm

### 2. Oscarshall

**Provisional decision:** strong new canonical candidate, subject to duplicate and coordinate gates.

Oscarshall is a distinct royal summer palace and park with a public visitor identity. The Royal Court gives the public address as Oscarshallveien 15. Repository search currently surfaces content references but no canonical place record.

Required next checks:

1. Full canonical duplicate and alias search.
2. Normative Geonorge address-first lookup for Oscarshallveien 15.
3. Physical overlap audit against surrounding Bygdøy nature / royal-estate anchors.
4. Keep the palace as the primary place identity; the surrounding romantic park is part of the same visitor complex unless a separate source later justifies its own canonical place.

Official identity sources:
- https://www.royalcourt.no/the-royal-residences/oscarshall
- https://www.royalcourt.no/visits-and-cultural-activities/visit-oscarshall/a-visit-to-oscarshall

### 3. Vikingskipshuset / Vikingtidsmuseet site

**Provisional decision:** approve identity-and-scope audit, not immediate production.

VisitOSLO still exposes the source entry as `The Viking Ship Museum` while directing visitors toward the future Museum of the Viking Age. The physical site is undergoing a major transformation: the historic cross-shaped Vikingskipshuset is retained and connected to a new museum building. In 2026 the Viking ships and Oseberg sledges have already been moved into the new museum section, while the new museum is still a construction project rather than a normal open visitor venue.

The canonical model must therefore avoid two errors:

- creating separate overlapping active markers for the old Vikingskipshuset and the new Vikingtidsmuseet;
- presenting a construction-phase / future-opening museum as currently open merely because the physical site is coordinate-verifiable.

Required next checks:

1. Full canonical search for `vikingskipshuset`, `vikingskipsmuseet`, `vikingtidsmuseet` and English variants.
2. Decide one stable site identity and canonical ID for the retained historic building plus new museum complex.
3. Resolve exact site / building geometry rather than a generic Bygdøy address proxy if possible.
4. Encode current closure / construction status separately from coordinate verification.

Current project-status sources:
- https://www.statsbygg.no/nyheter/no-er-alle-vikingskipa-pa-plass
- https://www.statsbygg.no/nyheter/na-er-vikingskattene-trygt-pa-plass

## Next action

Run one combined identity-and-coordinate intake for the three manual-review entries. Production is allowed only after each candidate passes the duplicate, physical-scope and coordinate-source gates.
