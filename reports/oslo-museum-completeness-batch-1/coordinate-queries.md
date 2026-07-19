# Oslo museum completeness batch 1 — coordinate queries

The three candidates are concrete visitor institutions in specific buildings, so the normative address-first flow applies before canonical place data is created.

- Norsk Folkemuseum — Museumsveien 10, Oslo — https://ws.geonorge.no/adresser/v1/sok?sok=Museumsveien%2010%20Oslo
- Norsk Maritimt Museum — Bygdøynesveien 37, Oslo — https://ws.geonorge.no/adresser/v1/sok?sok=Bygd%C3%B8ynesveien%2037%20Oslo
- Historisk museum — Frederiks gate 2, Oslo — https://ws.geonorge.no/adresser/v1/sok?sok=Frederiks%20gate%202%20Oslo

These queries must be evaluated with the same uniqueness rules as `places:coords:find:address`; no returned candidate is accepted solely because an address search produced a hit.
