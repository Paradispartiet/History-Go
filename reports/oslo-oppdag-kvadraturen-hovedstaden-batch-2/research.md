# Oppdag Kvadraturen – Hovedstaden Christiania batch 2

## Scope

This batch closes the last concrete physical-site gap in the `Hovedstaden Christiania` walk.

The route stop `Stortingsmennene i byen` points to Prinsens gate 26 because Laurentius Borchsenius rented rooms from Jomfru Hals there during the 1815–1816 Storting. The house from that period no longer stands. The older small buildings on the site were removed before the present Schiøllgården was erected in 1880–1881.

The representation therefore separates the standing building from the lost historical layer:

- `schiollgarden_prinsens_gate_26` — canonical standing place
- `wk_schiollgarden_prinsens_gate_26_stortingsmennene_i_byen` — Wonderkammer historical layer for the earlier lodging history on the site

## Schiøllgården

**Decision:** canonical `by` place.

The present building is a physically distinct, monumental 1881 building facing Wessels plass. It has an independent urban identity and later became part of the Storting's building complex. It is therefore useful as more than a proxy parent for the demolished earlier buildings.

Primary current reference:

- Stortinget documents Prinsens gate 26 as a building from 1881 and as part of the Storting's building mass.

Coordinate evidence:

- Geonorge Adresser API
- `geonorge-adresser-v1:0301:15742:26`
- `59.91224425845788, 10.739559115511142`

The coordinate is used only for the standing building. It is not presented as the exact footprint of one particular pre-1880 house on the larger historical site.

## Stortingsmennene i byen

**Decision:** Wonderkammer historical site layer under `schiollgarden_prinsens_gate_26`.

Oppdag Kvadraturen identifies Prinsens gate 26 as the place where Jomfru Hals rented rooms to Akershus representative Laurentius Borchsenius in 1815–1816. The route uses the example to explain how representatives in the early decades after 1814 generally had to rent private rooms in Christiania.

The current Schiøllgården did not yet exist. It must therefore not be described as the house in which Borchsenius stayed. The chamber text explicitly states that the older buildings were demolished before the present building was erected.

Primary source page:

- Oppdag Kvadraturen – `Stortingsmennene i byen`

## Completeness decision for the Hovedstaden route

After this batch, all concrete stops in the ten-stop `Hovedstaden Christiania` walk are represented by either:

- an existing canonical place;
- a new canonical place created in batches 1–2;
- or a Wonderkammer historical layer attached to the physically correct present-day parent.

The introductory stop `Velkommen til hovedstaden!` is thematic route context rather than a separate missing physical place and does not receive an artificial map marker.

## Coordinate workflow rule

The Geonorge lookup output was saved directly by the workflow with `tee` to `reports/oslo-oppdag-kvadraturen-hovedstaden-batch-2/coordinates/prinsens_gate_26.json`.
