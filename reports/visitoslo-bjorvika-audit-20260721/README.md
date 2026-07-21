# VisitOSLO Bjørvika – preliminary visible-result coverage audit

Captured: 2026-07-21
Scope: first 30 visible results in current source result set
Entries: 30
Exact/alias matches: 8
Manual review: 22

This source mixes durable places with retail, services, itineraries, mobile activities and seasonal uses. Exact-name matches are diagnostic only; no source entry becomes a new canonical place without a physical-scope and inclusion-policy decision.

| Source entry | source-kind hint | preliminary status | exact match(es) | strongest candidates |
|---|---|---|---|---|
| SALT | stable_physical_place_or_existing_parent | exact_or_alias_match | `salt` | `salt` (1.000), `borsen_oslo` (0.500), `brannmuseet_oslo` (0.500) |
| The Fjords: Oslo City Cruise | mobile_service | manual_review | — | `the_den_london` (0.500), `the_valley_london` (0.500), `the_villa` (0.500) |
| Deichman Bjørvika | stable_physical_place_or_existing_parent | exact_or_alias_match | `deichman_bjorvika` | `deichman_bjorvika` (1.000), `bjorvika` (0.800), `deichman_grunerlokka` (0.500) |
| Oslo Sauna Association: Sukkerbiten | activity_or_operator_on_physical_site | manual_review | — | `borsen_oslo` (0.400), `brannmuseet_oslo` (0.400), `cinemateket_oslo` (0.400) |
| MUNCH | stable_physical_place_or_existing_parent | exact_or_alias_match | `munch_museet` | `munch_museet` (1.000), `bygland_museum` (0.500), `dagali_museum` (0.500) |
| Oslobukta shopping | area_or_commercial_district | manual_review | — | `borsen_oslo` (0.500), `brannmuseet_oslo` (0.500), `cinemateket_oslo` (0.500) |
| The Norwegian National Opera & Ballet | stable_physical_place_or_existing_parent | manual_review | — | `borsen_oslo` (0.400), `brannmuseet_oslo` (0.400), `cinemateket_oslo` (0.400) |
| KOK Oslo | mobile_or_multi_site_service | manual_review | — | `borsen_oslo` (0.500), `brannmuseet_oslo` (0.500), `cinemateket_oslo` (0.500) |
| Fæbrik | retail_or_commercial_listing | manual_review | — | `faerder_fyr` (0.400), `fugl_fonix_etne` (0.400) |
| Åretak - Viking Rowboat Rental | rental_service | manual_review | — | — |
| Losæter | stable_physical_place_or_existing_parent | manual_review | — | — |
| Narvesen Barcode | retail_or_commercial_listing | manual_review | — | `barcode` (0.667) |
| Hunter Oslo | retail_or_commercial_listing | manual_review | — | `borsen_oslo` (0.500), `brannmuseet_oslo` (0.500), `cinemateket_oslo` (0.500) |
| Way Nor Munch Brygge | retail_or_commercial_listing | manual_review | — | `munch_museet` (0.400) |
| Friluftshuset: outdoor activity centre | stable_physical_candidate | manual_review | — | `sorenga` (0.800), `sorenga_sjobad` (0.571), `oslo_s` (0.400) |
| Sørenga Seawater Pool | stable_physical_place_or_existing_parent | exact_or_alias_match | `sorenga_sjobad` | `sorenga_sjobad` (1.000), `sorenga` (0.667) |
| Fiskeriet Bjørvika fish shop | retail_or_commercial_listing | manual_review | — | `bjorvika` (0.800), `deichman_bjorvika` (0.667), `alna_utlop_bjorvika` (0.444) |
| Barcode Bjørvika | stable_area_or_existing_parent | exact_or_alias_match | `barcode` | `barcode` (1.000), `bjorvika` (0.800), `deichman_bjorvika` (0.667) |
| Oslo Sauna Association: Bademaschinen sauna raft | floating_activity_or_operator | manual_review | — | `borsen_oslo` (0.400), `brannmuseet_oslo` (0.400), `cinemateket_oslo` (0.400) |
| KÖSK | stable_physical_place_or_existing_parent | exact_or_alias_match | `kosk_oslo` | `kosk_oslo` (1.000) |
| Operastranda in Bjørvika | stable_physical_place_or_existing_parent | manual_review | — | `bjorvika` (0.800), `deichman_bjorvika` (0.667), `alna_utlop_bjorvika` (0.444) |
| Optiker G Krogh Oslobukta | retail_or_commercial_listing | manual_review | — | — |
| Sauna at SALT | activity_on_existing_place | exact_or_alias_match | `salt` | `salt` (1.000) |
| Lillelam Boutique Bjørvika | retail_or_commercial_listing | manual_review | — | `bjorvika` (0.667), `deichman_bjorvika` (0.571), `alna_utlop_bjorvika` (0.400) |
| Devold Brandstore Oslo | retail_or_commercial_listing | manual_review | — | `borsen_oslo` (0.400), `brannmuseet_oslo` (0.400), `cinemateket_oslo` (0.400) |
| FLOP museum | stable_physical_place_or_existing_parent | exact_or_alias_match | `flop_museum` | `flop_museum` (1.000), `bygland_museum` (0.500), `dagali_museum` (0.500) |
| Best of You | commercial_service_listing | manual_review | — | — |
| Best View of the Oslofjord Walk Winter Edition | itinerary_or_guided_activity | manual_review | — | — |
| T-Michael / Norwegian Rain Concept store | retail_or_commercial_listing | manual_review | — | `toyenbadet` (0.500), `biblo_toyen` (0.400), `majorstuen_tbanestasjon` (0.400) |
| Ice skating rink at Bjørvika | seasonal_activity | manual_review | — | `bjorvika` (0.667), `deichman_bjorvika` (0.571), `alna_utlop_bjorvika` (0.400) |

## Representation gate

- Reuse a canonical place for activities clearly occurring on that physical place.
- Do not create place markers for mobile tours, rental services, ordinary retail or guided itineraries by default.
- Seasonal facilities require a stable physical-site identity before canonical production.
- Stable institutions and civic/public visitor places still require duplicate and coordinate audits before new production.

