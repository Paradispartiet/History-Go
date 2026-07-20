# VisitOSLO City Centre — final source-to-repo audit

Date: 2026-07-20

## Scope

This report closes the bounded VisitOSLO City Centre candidate list that remained after the completed Atlas Obscura Oslo audit, the broader Oslo museum/visitor audit, and the Oslo West source pass.

The purpose is not to re-audit every already canonical central-Oslo landmark. It resolves the remaining source names that had still appeared as possible gaps in the City Centre source-to-repo comparison.

## Result

| VisitOSLO candidate | Repository decision | Status |
| --- | --- | --- |
| Nordic Bible and Book Museum | Existing canonical `nordisk_bibelmuseum` | COVERED |
| The Viking Planet | Existing canonical `viking_planet_oslo` | COVERED |
| Oslo Reptile Park | Existing canonical `oslo_reptilpark` | COVERED |
| Brannmuseet i Oslo | Existing canonical `brannmuseet_oslo` | COVERED |
| Mini Bottle Gallery | Previously audited; intentionally deferred | DEFERRED |
| Paradox Museum Oslo | Previously audited; outside core museum scope pending dedicated interactive-attraction policy | DEFERRED |
| Fotografiens Hus | Genuine canonical gap | APPROVED FOR COORDINATE INTAKE |
| Christian Radich | No stable ship-position marker; do not use the shore office address as a proxy for the vessel | DEFERRED TO MOBILE/HISTORIC-VESSEL POLICY |

## 1. Fotografiens Hus

### Existing-place audit

No canonical `fotografiens_hus` place was found on current `main`, and no existing place at Rådhusgata 20 was found that already represents the gallery.

### Source basis

Fotografiens Hus describes itself as a public photography gallery and community resource for photographers and lens-based artists. It has operated as an exhibition venue in Rådhusgata 20 since 1999, presents a recurring exhibition programme, and explicitly frames photography as both art form and professional field.

Official source:
- https://fotografiens-hus.no/om-oss/
- https://fotografiens-hus.no/en/

Visitor address:
- Rådhusgata 20, 0151 Oslo

### Representation decision

**Create one canonical candidate: `fotografiens_hus`.**

Recommended primary category: `kunst`.

The place has a stable independent physical identity, a durable public exhibition function, a clear photography-specific learning case, and no need for a duplicate building marker elsewhere in the current City Centre candidate set.

The canonical content should focus on photography as artistic medium, documentary practice, visual culture, exhibition history and the institutional role of a dedicated photo gallery. It should avoid generic “gallery in Oslo” framing.

Status: **APPROVED FOR NORMATIVE ADDRESS-FIRST COORDINATE INTAKE.**

Coordinate input:
- `Rådhusgata 20 Oslo`

Production must use the repository's current Geonorge address-first workflow and pass the ordinary overlap, taxonomy, evidence, manifest and runtime-index gates before a place record is added.

## 2. Christian Radich

### Existing-place audit

No canonical Christian Radich place was found on current `main`.

### Source basis

VisitOSLO describes Christian Radich as the historic sailing ship first launched in 1937. Current operator information gives the organisation's shore address as Akershusstranda 9, Skur 32, with a temporary office move during renovation. Visitor information also makes clear that the vessel sails actively and is away on voyages for significant periods; when not on assignment it is associated with the Akershusutstikkeren area.

Sources:
- https://www.visitoslo.com/en/product/?name=Christian-Radich&tlp=2985083
- https://www.radich.no/en/pages/kontakt-og-presse-christian-radich
- https://www.visitnorway.no/listings/christian-radich/15755/

### Representation decision

**Do not create a normal fixed-address `christian_radich` place from the present City Centre pass.**

The shore administration address is not the ship itself, and assigning that address as the vessel's canonical map point would violate the physical-identity principle used in the Oslo coordinate work. The ship is also genuinely mobile rather than a permanently moored museum vessel.

This does not mean Christian Radich lacks History Go value. It should be handled only when the data model has an explicit rule for mobile historic vessels and home-berth anchors. A future solution could either:

- model a documented home berth / Akershusutstikkeren place anchor with the vessel as the historical object, or
- introduce a mobile-asset relation that does not pretend the ship is always present at one coordinate.

Status: **DEFERRED TO MOBILE/HISTORIC-VESSEL POLICY.**

Hard guard: **do not use Akershusstranda 9 or the temporary Akershusstranda 53 office as a proxy coordinate for the ship.**

## Previously resolved candidates

### Nordic Bible and Book Museum

Already canonical as `nordisk_bibelmuseum`, added through Atlas Obscura Oslo museum batch 6. The verified visitor address used in that work was Nedre Slottsgate 4C.

### The Viking Planet

Already canonical as `viking_planet_oslo`. The earlier museum-boundary audit approved it as a stable, independently visitable digital history museum and required source-critical framing of VR and immersive reconstruction.

### Oslo Reptile Park

Already canonical as `oslo_reptilpark` and completed in the post-museum VisitOSLO attraction pass.

### Brannmuseet i Oslo

Already canonical as `brannmuseet_oslo`, with the Grønlandsleiret 32 address and the ordinary Oslo coordinate validation chain completed.

### Mini Bottle Gallery

Previously audited and intentionally deferred. It remains active, but the earlier Atlas Obscura museum pass assessed it as lower History Go priority because the venue combines the collection strongly with event and hospitality use.

### Paradox Museum Oslo

Previously audited in museum boundary batch 8 and intentionally left outside the core museum scope. It may be reconsidered only under a dedicated interactive-attraction / perception-science policy.

## Source-line closure

The carried-forward VisitOSLO City Centre candidate list now has no unaudited names.

One genuine new place candidate remains for production:

- `fotografiens_hus`

One candidate is explicitly deferred because the current place/coordinate model should not invent a fixed position for a mobile vessel:

- Christian Radich

The other recurring City Centre names are either already canonical or deliberately deferred under documented scope decisions.

## Next production step

Run the normal Oslo coordinate intake for `Fotografiens Hus`, starting from the exact visitor address `Rådhusgata 20 Oslo`. Only after the address, overlap and taxonomy gates pass should the canonical `kunst` place be produced and registered.
