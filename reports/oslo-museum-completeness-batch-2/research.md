# Oslo museum completeness batch 2 — research audit

Date: 2026-07-20

## Scope

This batch audits three Oslo Museum destinations / site identities surfaced by the broader Oslo museum completeness pass:

1. Frogner hovedgård / Bymuseet / Teatermuseet
2. Interkulturelt Museum
3. Arbeidermuseet

The purpose is to model the physical places correctly rather than creating one canonical marker per institution name regardless of shared buildings or existing place records.

## 1. Frogner hovedgård, Bymuseet and Teatermuseet

### Existing-place audit

No canonical `frogner_hovedgard` record was found on current `main`.

Existing `vigelandsparken` represents the larger park / sculpture-park complex. Previous completeness work correctly represented the small Wegner pavilion as a Wonderkammer treasure under that parent, but Frogner hovedgård is a large, historically independent manor complex and current museum destination.

Bymuseet and Teatermuseet share the same visitor address at Halvdan Svartes gate 58 and operate from the Frogner hovedgård museum complex. Creating separate map markers for both institution names would duplicate the same physical destination.

### Representation decision

**Create one canonical candidate: `frogner_hovedgard`.**

Model the surviving manor complex as the place. Bymuseet and Teatermuseet should be represented as current institutional/use layers in the same record and, where useful, as Wonderkammer chambers or other content layers.

This preserves both the long history of the physical site and the current museum function without stacking duplicate markers on one address.

### Source basis

Official Oslo Museum visitor information lists both Bymuseet and Teatermuseet at Halvdan Svartes gate 58 in Frognerparken. Oslo Museum also presents Frogner hovedgård as the historic manor site in which the museum operates.

Official source:
- https://www.oslomuseum.no/
- https://www.oslomuseum.no/besok-oss/apningstider/

Status: **APPROVED FOR COORDINATE INTAKE as `frogner_hovedgard`.**

Coordinate method: address-first query for `Halvdan Svartes gate 58 Oslo`, followed by physical verification that the returned point represents the manor/museum complex rather than an unrelated park point.

## 2. Interkulturelt Museum

### Existing-place audit

Interkulturelt Museum is located in the former old Grønland police station at Tøyenbekken 5. The same physical building is already canonical as `gronland_politistasjon`.

The existing record already documents:

- the original police and arrest function;
- occupation-period use of the arrest wing;
- the police departure in 1978;
- the later transformation into a culture and museum site;
- a verified Geonorge address point for Tøyenbekken 5.

Oslo Museum's current visitor information explicitly confirms that Interkulturelt Museum occupies the old Grønland police station and uses former cells as exhibition spaces.

### Representation decision

**Do not create `interkulturelt_museum` as a new canonical marker.**

Instead, strengthen the current-use layer on `gronland_politistasjon` by explicitly naming Interkulturelt Museum and linking the official museum page. This is a direct application of the standing-parent / no-duplicate-marker rule.

Official source:
- https://www.oslomuseum.no/besok-oss/interkulturelt-museum/

Status: **ENRICH EXISTING CANONICAL PLACE; NO NEW COORDINATE.**

## 3. Arbeidermuseet

### Existing-place audit

No canonical `arbeidermuseet` record was found on current `main`.

The nearby canonical `sagene_kvernhus` is not a duplicate. It is a broad industrial-history place with a 200-metre radius representing the mill/kvernhus and Akerselva production landscape. Arbeidermuseet is a specific museum destination in a distinct historic building at Sagveien 28.

### Representation decision

**Create one canonical candidate: `arbeidermuseet`.**

The record should anchor the concrete museum building and use the museum as an entry into labour, industrialisation and everyday social history along Akerselva, while keeping the broader industrial landscape separate in `sagene_kvernhus`.

Official Oslo Museum visitor information lists Arbeidermuseet at Sagveien 28, 0459 Oslo.

Official source:
- https://www.oslomuseum.no/besok-oss/apningstider/

Status: **APPROVED FOR COORDINATE INTAKE as `arbeidermuseet`.**

Coordinate method: address-first query for `Sagveien 28 Oslo`, followed by physical verification of the returned building point.

## Batch result

| Candidate | Decision |
| --- | --- |
| Frogner hovedgård / Bymuseet / Teatermuseet | New canonical `frogner_hovedgard`; one physical marker, museum uses as content layers |
| Interkulturelt Museum | No new marker; enrich existing `gronland_politistasjon` |
| Arbeidermuseet | New canonical `arbeidermuseet` |

This batch therefore produces two approved coordinate-intake candidates and one immediate no-coordinate enrichment of an existing canonical place.
