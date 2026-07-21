# VisitOSLO Parks / natural attractions – canonical coverage scope

Date: 2026-07-21

Scope: the 30 visible result cards surfaced before the current **Vis flere** control in the indexed Norwegian VisitOSLO page snapshot.

## Final scope result

All 30 source rows are resolved at the scope level:

- **17 already covered** by current canonical places, including two grouped VisitOSLO rows represented by separate island places.
- **3 outside Oslo** and therefore not new Oslo production work.
- **7 approved as distinct new physical places.**
- **3 require canonical identity migration instead of a duplicate new place.**
- **0 unresolved.**

The scope decisions are based on a runtime-index audit against the current canonical place set and on the one-place/one-physical-identity rule.

## Approved new physical places — 7

### `frognerparken`

VisitOSLO lists Frognerparken separately from Vigelandsparken. Runtime currently has `vigelandsparken` but no `frognerparken`. The broader park is a distinct physical area that contains the Vigeland installation and other park functions; it should not be represented solely by the sculpture park.

Next gate: exact named park geometry and parent/child overlap model with `vigelandsparken`, `vigelandmuseet` and `frogner_hovedgard`.

### `lillomarka`

No runtime place represents the named forest area. Lillomarka is a stable large natural area rather than a single trail or activity product.

Next gate: exact named area geometry / authoritative boundary-aware semantic anchor. Do not invent a single-address point.

### `grorudparken`

Runtime has the broad district place `grorud`, but no separate Grorudparken. The park is a distinct physical public landscape and should not be collapsed into the district marker.

Next gate: exact named park geometry and overlap audit against nearby Grorud places.

### `aamot_bru`

No runtime place matches the VisitOSLO bridge row. Aamot bru is a stable physical bridge and can be represented independently within the wider Akerselva system.

Next gate: exact bridge object/geometry and name normalization audit (`Aamot`/`Åmot`/historical spelling variants).

### `klosterenga_skulpturpark`

No runtime place represents the named sculpture park. It is a stable physical park and public-art environment rather than merely a collection of individual artworks.

Next gate: exact named park geometry plus parent/child rules for individual artworks if any are already canonical.

### `brekkedammen`

VisitOSLO’s `Frysja / Brekkedammen` row represents the recreation and bathing area around Brekkedammen in the upper Akerselva. The current runtime record `frysjadammen` is **not** the same physical place: its own content identifies it as the regulated Maridalsoset outlet where Maridalsvannet becomes Akerselva.

Brekkedammen therefore remains a real new-place gap. The misleading `frysjadammen` identity is a separate cleanup issue and must not be used as a proxy.

Next gate: exact named dam/water/recreation geometry and distinction from Brekke kraftstasjon, Frysja 33, the existing Maridalsoset record and the broader Akerselva route.

### `peer_gynt_parken`

No runtime place represents the named sculpture park at Løren. The park has a stable physical identity distinct from individual sculptures and from the surrounding Løren area.

Next gate: exact named park geometry and public-art parent/child audit.

## Canonical identity migrations — 3

These rows are physically represented only by old purpose-specific pseudo-place IDs. Creating a second place would violate the one-place/one-physical-identity rule.

### Sofienbergparken

- Current physical record: `sofienbergparken_subkultur`
- Target canonical identity: `sofienbergparken`
- Rule: the park is the place; subculture is a content/use layer.

### Sognsvann

- Current physical record: `treningssted_sognsvann`
- Target canonical identity: `sognsvann`
- Rule: the lake and recreation landscape are the place; the training loop is a sport/use layer.

The existing training record alone must not justify creating a second overlapping `sognsvann` marker.

### Torshovdalen

- Current physical record: `treningssted_torshovdalen`
- Target canonical identity: `torshovdalen`
- Rule: the valley/park is the place; training and activity are use layers.

Individual artwork such as `hodet_nn_torshovdalen` may remain a separate exact physical object where the existing public-art model supports that granularity.

## Already covered — 17

- Vigelandsparken → `vigelandsparken`
- Ekebergparken skulpturpark → `ekebergparken`
- Stovnertårnet → `stovnertarnet`
- Botanisk hage → `botanisk_hage`
- Bleikøya → `bleikoya`
- Akerselva → `akerselva`
- Torshovparken → `torshovparken`
- Gressholmen, Heggholmen og Rambergøya → `gressholmen`, `heggholmen`, `rambergoya`
- Langøyene → `langoyene`
- Lindøya → `lindoya`
- Helleristningene på Ekeberg → `ekeberg_helleristninger`
- Ormøya og Malmøya → `ormoya`, `malmoya`
- Bogstadvannet → `bogstadvannet`
- Ulvøya → `ulvoya`
- Østensjøvannet → `ostensjovannet`
- Oscarshall → `oscarshall`
- Bygdøy → `bygdoy_natur`

## Outside Oslo — 3

- Bærums Verk — already canonical in Akershus as `baerums_verk_jernverk`.
- Ingierstrand bad — already canonical outside Oslo as `ingierstrand_bad`.
- Steilene — already canonical outside Oslo as `steilene`.

## Non-blocking cleanup findings

These do not change the completeness decisions above but should be handled in dedicated cleanup work:

1. `stovnertarnet` is physically covered but still categorized as `subkultur`; taxonomy should be audited separately.
2. `langoyene` is physically covered but its source file currently lives under `natur/akershus`; geographic file placement should be audited separately.
3. `frysjadammen` describes the regulated Maridalsoset outlet, not Brekkedammen. Its canonical identity/name requires a separate correction before future content generation relies on the label.

## Next action

Run two separate workflows:

1. **Coordinate intake for the seven approved new physical places** using exact named geometry/object evidence. Address-first should only be used if a candidate is genuinely represented by a concrete public address rather than a park, forest, lake or bridge geometry.
2. **Canonical migration audit for the three pseudo-place IDs** (`sofienbergparken_subkultur`, `treningssted_sognsvann`, `treningssted_torshovdalen`) including all people, quiz, leksikon, Wonderkammer, routes and other references before any ID replacement.

No other row in this bounded 30-result VisitOSLO snapshot is approved for new Oslo place production.
