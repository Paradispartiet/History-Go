# Oslo museum completeness batch 8 — research audit

Date: 2026-07-20

## Scope

This batch resolves four visitor-list names that sit near the boundary between museum, gallery and commercial experience:

1. TBS Gallery
2. The Viking Planet
3. Fineart Oslo
4. Paradox Museum Oslo

Commercial ownership is not in itself a rejection criterion. The key questions are whether the site has a stable independent physical identity, durable cultural/educational content, and a sufficiently strong History Go learning case.

## 1. TBS Gallery

### Existing-place audit

No canonical TBS Gallery / Oscars gate 23 place was found on current `main`.

TBS Gallery is not merely a temporary sales exhibition. The institution describes itself as an art museum, gallery and cultural centre dedicated to Tore Bjørn Skjølsvik, with a permanent collection of more than 200 works. It occupies an 1858 historic villa and former stable designed by Georg Andreas Bull, includes a sculpture garden, and also functions as the artist's home and studio.

### Source basis

Official sources:
- https://tbsgalleri.no/
- https://tbsgalleri.no/om-oss/
- https://tbsgalleri.no/fast_utstilling/
- https://tbsgalleri.no/kontakt-oss/

Address: Oscars gate 23, 0352 Oslo.

### Representation decision

**Create one canonical candidate: `tbs_gallery`.**

The place has a strong combined case in art, artist biography, historic architecture and permanent collection. The canonical record should avoid promotional framing and distinguish the museum/gallery collection from the building's separate 19th-century architectural history.

Status: **APPROVED FOR COORDINATE INTAKE.**

Coordinate method: normative address-first query for `Oscars gate 23 Oslo`, followed by verification of the villa/gallery complex.

## 2. The Viking Planet

### Existing-place audit

No canonical `viking_planet_oslo` place was found on current `main`.

The venue is a dedicated, independently visitable digital Viking museum at Fridtjof Nansens plass 4. It is physically distinct from Oslo rådhus and Rådhusplassen even though it sits immediately beside them.

### Source basis

Official sources:
- https://www.thevikingplanet.com/no/
- https://www.thevikingplanet.com/no/planlegg-ditt-besok/
- https://www.thevikingplanet.com/no/om-oss/apningstider/

Address: Fridtjof Nansens plass 4, 0160 Oslo.

The museum uses VR, holographic and interactive presentation. A History Go record must therefore be source-critical: immersive reconstructions are forms of interpretation and presentation, not primary historical evidence.

### Representation decision

**Create one canonical candidate: `viking_planet_oslo`.**

The venue has a sufficiently stable physical identity and educational historical focus to qualify despite its commercial and experience-driven format. It must be kept clearly distinct from the future Vikingtidsmuseet at Bygdøy.

Status: **APPROVED FOR COORDINATE INTAKE.**

Coordinate method: normative address-first query for `Fridtjof Nansens plass 4 Oslo`, followed by verification of the visitor entrance/building point.

## 3. Fineart Oslo

### Existing-place audit

No canonical Fineart Oslo record was found on current `main`.

Fineart operates a large physical gallery at Filipstad brygge and presents changing exhibitions, but its own description centres strongly on art sales, web shop, framing and commercial inventory.

### Source basis

Official sources:
- https://www.fineart.no/
- https://www.fineart.no/fineart_oslo

### Representation decision

**Do not add Fineart Oslo in the museum completeness pass.**

This is not a judgment that the gallery lacks cultural value. It is a scope decision: a systematic commercial-gallery policy should determine which sales galleries become canonical places, rather than allowing a museum visitor list to select one large commercial gallery arbitrarily.

Status: **DEFERRED TO A FUTURE OSLO GALLERY / COMMERCIAL ART-VENUE COMPLETENESS POLICY.**

## 4. Paradox Museum Oslo

### Existing-place audit

No canonical Paradox Museum Oslo record was found on current `main`.

The venue is an active ticketed attraction at Rosenkrantz' gate 11. Its content is built around interactive paradoxes, optical effects and entertainment experiences.

### Source basis

Official sources:
- https://www.paradoxmuseumoslo.com/
- https://www.paradoxmuseumoslo.com/en/plan-your-visit/
- https://www.paradoxmuseumoslo.com/en/contact-us/

Address: Rosenkrantz' gate 11, 0159 Oslo.

### Representation decision

**Do not add Paradox Museum Oslo in the core museum completeness pass.**

The venue is part of an international franchise concept and the present audit found no strong Oslo-specific historical, institutional or collection identity comparable to the canonical museum candidates added in the other batches. It may be reconsidered if History Go develops a dedicated perception/interactive-science attraction policy.

Status: **DEFERRED / OUT OF CORE MUSEUM SCOPE.**

## Batch result

| Candidate | Decision |
| --- | --- |
| TBS Gallery | New canonical `tbs_gallery`; coordinate intake |
| The Viking Planet | New canonical `viking_planet_oslo`; coordinate intake with source-critical framing |
| Fineart Oslo | Deferred to gallery/commercial-art completeness policy |
| Paradox Museum Oslo | Deferred outside core museum scope |

This batch produces two new canonical candidates and explicitly closes two recurring visitor-list items without forcing them into the current place model.
