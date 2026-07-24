# Sigrid Undset exact-anchor research plan

This branch is research-only and starts from coordinate protocol batch 195.

The one-shot runner:

- requires `sigrid_undset_statue` to remain `needs_source`;
- requires the existing visual rejection of `osm-node:7596280553`;
- inspects Oslo kommunes art-collection portal and its machine-facing assets/endpoints;
- searches Wikidata and geotagged Wikimedia Commons material;
- performs a fresh bounded Overpass/Nominatim audit around Stensparken;
- excludes the rejected OSM node from every candidate set;
- stores all HTTP responses, hashes, candidate extracts and conclusions under this report directory;
- does not modify canonical place data, coordinate evidence or the protocol.

A production batch 196 is allowed only if a new exact monument object is independently tied to the Sigrid Undset sculpture in Stensparken. Proximity, nearest-hit and park-level anchors are insufficient.
