# VisitOSLO Oslo West attraction completeness closure

Date: 2026-07-20

## Status

**Research/source classification: CLOSED for the bounded stable non-commercial / civic / institutional attraction pass.**

**Canonical production: CLOSED for all approved new candidates surfaced by this pass.**

This report closes the systematic review of the current VisitOSLO Oslo West attraction listing after the broader Atlas Obscura and museum-source completeness work. The closure is intentionally bounded: it covers durable public, cultural, historical, religious, museum-like and place-based attractions that fit History Go's canonical-place model. It does **not** treat every private commercial gallery, shop, showroom or high-churn visitor listing as a mandatory canonical place.

Primary source reviewed:

- https://www.visitoslo.com/en/activities-and-attractions/boroughs/oslo-west/attractions/

The source page was rechecked on 2026-07-20 against current repository state and the prior museum-source closure report.

## New canonical places produced from the Oslo West pass

1. `dronning_sonja_kunststall`
   - PR #2694
   - art institution in the historic Royal Stables
   - verified public address: Parkveien 50
   - Oslo coordinate batch 54

2. `fagerborg_kirke`
   - PR #2705
   - canonical `by` church place
   - verified building address: Pilestredet 74
   - Oslo coordinate batch 57

3. `uranienborg_kirke`
   - PR #2705
   - canonical `by` church place
   - verified building address: Holtegata 15
   - Oslo coordinate batch 58

4. `frogner_kirke`
   - PR #2705
   - canonical `by` church place
   - verified building address: Bygdøy allé 36
   - Oslo coordinate batch 59

5. `vestre_gravlund`
   - PR #2728
   - canonical `historie` cemetery/minnescape place
   - uses a representative area anchor inside the named cemetery geometry, not a postal-address shortcut
   - OSM way 4740772
   - Oslo coordinate batch 60

6. `skoytemuseet`
   - PR #2736
   - canonical `sport` museum institution
   - verified building address: Middelthuns gate 26
   - retained as separate from `frogner_stadion` after a 70.5 metre physical-marker overlap audit
   - Oslo coordinate batch 62

7. `vikaterrassen`
   - PR #2744
   - canonical `by` gate/building complex
   - uses named OSM relation 14169568 as geometry anchor, cross-checked against the official Geonorge points for Ruseløkkveien 3 and 5
   - preserves the historical sequence from Ruseløkkbakken and Ruseløkkbasarene through the 1964–72 modernist complex to the later pedestrian street
   - Oslo coordinate batch 63

All seven approved new candidates have been merged to `main` through repository coordinate and canonical-production gates.

## Important VisitOSLO Oslo West entries already covered before this pass

The source review confirmed existing canonical representation for the following durable attractions or their correct physical parent places:

- Vigeland Sculpture Park / Frogner Park
- `vigelandmuseet`
- `ibsen_museum_teater`
- Nasjonalbiblioteket
- `kunstnernes_hus`
- `tbs_gallery`
- Sporveismuseet / Oslo Transport Museum
- `nobelinstituttet`
- `emanuel_vigeland_museum`
- `villa_stenersen`
- `det_internasjonale_barnekunstmuseet`
- Museum of Oslo / Bymuseet through the shared physical parent `frogner_hovedgard`

These were not recreated merely because they appeared again on the Oslo West visitor listing.

## Representation decisions that prevented duplicate markers

### Museum of Oslo / Bymuseet

The institution uses the same physical Frogner hovedgård complex already represented as `frogner_hovedgard`.

Decision: no separate overlapping marker. Bymuseet remains an institutional/use layer of the physical parent place, consistent with the completed museum-source pass.

### Skøytemuseet and Frogner stadion

The museum is housed in the associated stadium building but has its own institution, collections and public visitor function. The verified museum-building marker is 70.5 metres from the existing arena marker.

Decision: keep two related canonical places:

- `frogner_stadion` = arena and sporting ground
- `skoytemuseet` = collection, archive and sport-history institution

### Vikaterrassen and Victoria terrasse

The names refer to historically and spatially related but distinct urban complexes. Vikaterrassen occupies the lower Ruseløkkveien 3–5 pedestrian/commercial complex, while Victoria terrasse is the monumental historic complex above it.

Decision: `vikaterrassen` is represented by its own named pedestrian-area geometry. The two names must not be treated as synonyms.

### Vestre gravlund

The municipal visitor address does not adequately represent a 243-decare cemetery.

Decision: use a verified representative point inside the named cemetery geometry rather than a building-style address point.

## Commercial/private gallery listings intentionally outside this closure gate

The current VisitOSLO Oslo West page also contains a substantial group of private commercial galleries, shops, art-sales venues and similar listings. Examples include Fineart Oslo, Standard (Oslo), ISCA Gallery, QB Gallery, Grafikk Oslo, Oslo Galleri, Galleri Albin Upp, Galleri SPINN, SORGENFRI and Utopia Retro Modern.

These are **not classified as missing mandatory canonical places** in this bounded pass. Reasons:

- the source list mixes civic attractions with commercial businesses;
- commercial gallery tenancy and branding can change faster than durable place identity;
- including one or two listings opportunistically would create an inconsistent gallery policy;
- several can still become valid History Go places later if they pass a dedicated commercial-gallery / art-venue inclusion framework based on longevity, independent place identity, cultural significance and coordinate stability.

Fineart Oslo was already explicitly deferred on the same basis in the museum-source closure report.

## Source-closure conclusion

As of 2026-07-20, there is **no known unclassified or unproduced approved stable non-commercial / civic / institutional candidate remaining from the current VisitOSLO Oslo West attraction listing**.

The Oslo West attraction source should therefore be treated as **research-complete and production-complete within this bounded inclusion policy**.

Future Oslo completeness work should move to another source family or another VisitOSLO area page rather than repeatedly re-auditing Oslo West. Private commercial galleries and retail-like art venues should be revisited only through a dedicated, consistent inclusion policy.
