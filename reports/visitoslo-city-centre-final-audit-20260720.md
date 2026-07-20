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
| Christian Radich | Historic vessel with a documented permanent Oslo home berth at Akershusutstikkeren; use an explicit home-berth anchor, not an instantaneous vessel-position claim | APPROVED FOR HOME-BERTH COORDINATE INTAKE |

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

No canonical Christian Radich place was found on current `main` at the time of this audit.

### Source basis

Christian Radich is a historic full-rigged sailing ship launched in 1937 and still operated actively. The vessel is therefore mobile, but its Oslo base is not merely an administrative office association.

VisitOSLO states explicitly that Christian Radich lies at Akershusutstikkeren when it is not away on assignment. Oslo Havn describes Akershusutstikkeren as the vessel's home harbour and states that Christian Radich has had its permanent place there since 1994. The Christian Radich foundation likewise describes its quay office as being where the ship stays when it is in Oslo.

Sources:
- https://www.visitoslo.com/no/produkt/?name=Christian-Radich&tlp=2985083
- https://www.oslohavn.no/no/aktuelt/christian-radich-har-kommet-hjem/
- https://www.oslohavn.no/no/aktuelt/akershusutstikkeren-er-rehabilitert-for-de-neste-hundre-ar/
- https://www.radich.no/en/the-foundation/
- https://www.radich.no/kontakt/

### Representation decision

**Create one canonical candidate: `christian_radich`.**

The place model must use an explicit **home-berth anchor** at Akershusutstikkeren. The coordinate represents the vessel's documented permanent Oslo base and normal berth when it is in Oslo; it must not be presented as live tracking or as a claim that the ship is physically present at every moment.

This is materially different from using a shore office address as a proxy for an unrelated mobile asset. Here the quay and Skur 32 are documented parts of the vessel's long-term operational base, and authoritative sources identify Akershusutstikkeren itself as Christian Radich's home harbour and regular berth.

Recommended primary category: `historie`.

Recommended physical model:
- `locatorType`: `home_berth`
- `coordType`: `home_berth_anchor`
- coordinate role: stable Oslo base / unlock marker
- explicit note that the vessel may be away on voyages or in shipyard
- no live-position semantics

Overlap rule:
- keep `akershus_kaier` as the broader linear harbour/quay place
- model `christian_radich` as the distinct historic vessel identity attached to its documented home berth
- do not create a second generic Akershusutstikkeren place merely to support the ship

Status: **APPROVED FOR HOME-BERTH COORDINATE INTAKE.**

Coordinate method:
1. Run the normal address-first lookup for `Akershusstranda 9 Oslo` to establish the exact Skur 32 / land-base reference.
2. Cross-check that point against the documented Akershusutstikkeren quay geometry and the existing broad `akershus_kaier` canonical place.
3. Apply a berth/home-base anchor only after confirming that the chosen point represents the Akershusutstikkeren base rather than merely an office doorway.
4. Record the non-live, mobile-vessel semantics explicitly in coordinate evidence and place content.

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

Two genuine new place candidates were identified by the final City Centre pass:

- `fotografiens_hus`
- `christian_radich`

`fotografiens_hus` proceeds through the ordinary fixed-building address workflow. `christian_radich` proceeds through a documented home-berth model that preserves the distinction between a stable Oslo base and the vessel's changing live position.

The other recurring City Centre names are either already canonical or deliberately deferred under documented scope decisions.

## Next production step

Run the Christian Radich home-berth coordinate intake. Start with `Akershusstranda 9 Oslo`, cross-check against Akershusutstikkeren and the existing `akershus_kaier` harbour geometry, and only then produce the canonical historic-vessel place with explicit non-live home-base semantics.
