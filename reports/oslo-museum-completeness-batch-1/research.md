# Oslo museum completeness batch 1 — research audit

Date: 2026-07-20

## Scope

This batch audits three major, physically visitable Oslo museums that were surfaced after the Atlas Obscura, Kultureiendommer and Oppdag Kvadraturen source-completeness passes were closed:

1. Norsk Folkemuseum
2. Norsk Maritimt Museum
3. Historisk museum

The purpose is to determine whether each candidate needs a new canonical History Go place, while avoiding duplicate markers for existing parent areas or individual objects.

## Canonical duplicate audit

### Norsk Folkemuseum

No canonical `norsk_folkemuseum` place record was found on current `main`.

Relevant existing records are not duplicates:

- `gol_stavkirke_bygdoy` represents one specific historic building inside the museum grounds.
- `frammuseet` and `kon_tiki_museet` are separate institutions at Bygdøynes.
- Bygdøy nature records represent outdoor areas and landscape anchors, not the museum institution.

Decision: **new canonical place candidate**.

Overlap rule: the marker must represent the museum institution/visitor site rather than Gol stavkirke. A separate museum marker is justified because the museum is a large independent destination with many buildings, collections and exhibitions; Gol stavkirke remains a separately collectible historic object inside it.

## Norsk Maritimt Museum

No canonical `norsk_maritimt_museum` place record was found on current `main`.

Relevant existing records are not duplicates:

- `frammuseet` is a separate museum at Bygdøynes.
- `kon_tiki_museet` is a separate museum at Bygdøynes.

Decision: **new canonical place candidate**.

The three institutions are adjacent but functionally and physically independent visitor destinations, so proximity is not a reason to collapse them into one marker.

## Historisk museum

No canonical `historisk_museum` place record was found on current `main`.

Relevant existing record:

- `tullin` is a broad urban-area anchor for Tullinløkka and explicitly lists Historisk museum as one of several institutions in the area. It does not model the museum itself.

Decision: **new canonical place candidate**.

A dedicated museum marker is justified because `tullin` is an area place (`locatorType: square`, `coordRole: area_anchor`), while Historisk museum is a specific institution in a protected museum building.

## External source basis

### Norsk Folkemuseum

Official sources:

- https://norskfolkemuseum.no/om-norsk-folkemuseum
- https://norskfolkemuseum.no/norsk-folkemuseums-historie
- https://norskfolkemuseum.no/kontakt-oss

Key claims:

- Founded in 1894 on the initiative of Hans Aall.
- Permanently established at Bygdøy in 1898; first broad cultural-history exhibition opened in 1901.
- One of Europe's largest and oldest open-air museums and a national cultural-history museum.
- Covers everyday life in Norway from the 1500s to today.
- Includes Gol stave church, the Old Town/open-air collections and King Oscar II's Collection.
- Official visitor address: Museumsveien 10, 0287 Oslo.

### Norsk Maritimt Museum

Official sources:

- https://marmuseum.no/om-norsk-maritimt-museum
- https://marmuseum.no/en/about-the-museum
- https://marmuseum.no/kontakt-oss

Key claims:

- National museum for Norwegian maritime cultural heritage.
- Founded in 1914; the first collections came from the Kristiania centennial exhibition that year.
- Located at Bygdøynes beside the Fram and Kon-Tiki museums.
- The first museum building stage was completed in 1958 and is an important work by Trond Eliassen and Birger Lambertz-Nilssen.
- Official visitor address: Bygdøynesveien 37, 0286 Oslo.

### Historisk museum

Sources:

- https://lovdata.no/dokument/SF/forskrift/2011-11-09-1088/KAPITTEL_13
- https://www.khm.uio.no/

Key claims:

- Historisk museum is part of Kulturhistorisk museum at the University of Oslo.
- The institution researches, manages and communicates archaeological, ethnographic and numismatic collections.
- The museum building at Frederiks gate 2 is formally protected as a state cultural-historic property.
- Official/established visitor address: Frederiks gate 2, 0164 Oslo.

## Coordinate method

All three candidates are institutions in specific buildings or visitor complexes with concrete Norwegian addresses. Therefore the normative first method is the repository's Geonorge address-first finder.

The exact queries are documented in `coordinate-queries.md`.

No canonical record should be created until the query output is captured, uniqueness is checked, and the returned address point is confirmed to represent the intended History Go display marker.

## Batch decision

All three candidates pass the place relevance and duplicate gates.

Status:

- `norsk_folkemuseum` — **APPROVED FOR COORDINATE INTAKE**
- `norsk_maritimt_museum` — **APPROVED FOR COORDINATE INTAKE**
- `historisk_museum` — **APPROVED FOR COORDINATE INTAKE**

Next production step: capture and review Geonorge address-first evidence, then create canonical source records and run the repository validation/index workflows.
