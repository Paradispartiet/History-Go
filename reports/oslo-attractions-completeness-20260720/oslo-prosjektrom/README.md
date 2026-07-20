# Oslo Prosjektrom – two-address coordinate intake

- Candidate: `oslo_prosjektrom`
- Address candidate A: `Platous gate 10 Oslo` (gallery's own latest published exhibition post says entrance via Platous gate 10).
- Address candidate B: `Platous gate 18 Oslo` (current Oslo Art Guide venue listing says entrance at Platous gate 18).
- Method: normative `places:coords:find:address` against Geonorge Adresser API for both addresses.
- Non-zero finder exits are preserved as valid audit outcomes rather than aborting the second lookup.

No canonical place data is changed in this intake. The two results must be compared with the physical building/entrance evidence before production.
