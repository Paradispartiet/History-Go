# Oppdag Kvadraturen – Hovedstaden Christiania batch 1

## Scope

This batch continues the Oslo completeness pass with the `Hovedstaden Christiania` thematic walk. The representation rule is the same as in the preceding Oppdag Kvadraturen batches:

- standing, physically distinct places may receive canonical map markers;
- demolished buildings or historical institutions on an already represented site become Wonderkammer time layers;
- no historical site is assigned to a nearby but physically incorrect parent merely to avoid creating a missing canonical place.

## Canonical places

### Avisen Tiden – Rådhusgata 10

**Decision:** canonical `historie` place.

The Oppdag Kvadraturen stop identifies Rådhusgata 10 as the building where Niels Wulfsberg operated a bookshop and printing press and published `Tiden` from 1808. The place has a distinct standing physical address and an independent role in the political information landscape around 1814.

Coordinate evidence:

- Geonorge Adresser API
- `geonorge-adresser-v1:0301:16115:10`
- `59.909004916311204, 10.744092944484954`

The record deliberately treats `1808` as the beginning of the newspaper at the site, not as a construction date for the building.

Primary source page:

- Oppdag Kvadraturen – `Rådhusgata 10, avisen Tiden`

### Sjøfartsbygningen

**Decision:** canonical `naeringsliv` place.

Sjøfartsbygningen is a standing, physically distinct commercial building from 1914–1915 associated with shipping and shipping-related businesses. It replaced the earlier Stiftsgården complex and therefore provides the correct modern canonical parent for that demolished political layer.

The named-building OSM queries returned no exact named object, so the marker is not based on an unverified OSM identity. Three normative Geonorge address lookups were checked instead:

- Kongens gate 6 — `geonorge-adresser-v1:0301:13846:6`
- Kirkegata 7 — `geonorge-adresser-v1:0301:13707:7`
- Rådhusgata 13 — `geonorge-adresser-v1:0301:16115:13`

All three address records share `gnr. 207 / bnr. 137`, confirming that they refer to the same large property/building complex. `Kongens gate 6` is used as the documented primary display anchor:

- `59.90991497265444, 10.741833670297687`

Primary references:

- Oppdag Kvadraturen – architecture stop covering the Rådhusgata/Kirkegata intersection
- Oslo byleksikon – `Sjøfartsbygningen`

## Wonderkammer historical layers

### Departementsgården → `oslo_posthus`

**Decision:** Wonderkammer historical site layer, not a second map marker.

The older state and department buildings occupied the Dronningens gate 15 site before the standing Hovedpostkontoret. The current canonical parent already represents the physical site.

### Den første stortingssalen → `oslo_posthus`

**Decision:** separate Wonderkammer historical site layer.

The first Storting met in Christiania Katedralskole's auditorium on the same larger site later occupied by the Hovedpostkontoret. The hall itself was preserved and moved to Norsk Folkemuseum, but the original site remains Dronningens gate 15. A separate overlapping map marker would therefore be physically misleading.

### Stiftsgården → `sjofartsbygningen`

**Decision:** Wonderkammer historical site layer.

Stiftsgården and the associated state property occupied the site before demolition in 1913. The standing Sjøfartsbygningen is the correct canonical physical parent for the historical layer.

### Høyesterett 1821–1846 → `gamle_radhus`

**Decision:** Wonderkammer historical site layer.

The institution occupied rooms in the existing Gamle Rådhus. Since the building is already canonical, the court's period there belongs as a time layer rather than a duplicate marker.

## Representation summary

| Candidate | Representation |
|---|---|
| Avisen Tiden / Rådhusgata 10 | New canonical `historie` place |
| Sjøfartsbygningen | New canonical `naeringsliv` place |
| Departementsgården | Wonderkammer time layer under `oslo_posthus` |
| Den første stortingssalen | Wonderkammer time layer under `oslo_posthus` |
| Stiftsgården | Wonderkammer time layer under `sjofartsbygningen` |
| Høyesterett 1821–1846 | Wonderkammer time layer under `gamle_radhus` |

## Coordinate rule

All terminal-generated coordinate outputs used by the batch are persisted under `reports/oslo-oppdag-kvadraturen-hovedstaden-batch-1/coordinates/` in the same workflow commands that produced them. No coordinate was copied from unsaved terminal output.
