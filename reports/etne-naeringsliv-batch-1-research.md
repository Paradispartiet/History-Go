# Etne næringsliv batch 1 — research

## Scope and duplicate audit

The current `main` branch was searched before file creation for the selected IDs, names and relevant variants. No existing canonical place records were found for:

- `norsk_motormuseum_skanevik`
- `sunnhordland_mek_verkstad_leknestangen`
- `skanevik_hermetikkfabrikk`
- `litledalen_kraftverk`
- `hardeland_kraftverk`

The batch deliberately covers three distinct parts of Etne's economic history: mechanical industry, fish canning and hydropower.

## 1. Norsk Motormuseum – tidligere SMV-hall

### Decision

Create `norsk_motormuseum_skanevik` in `naeringsliv`, not `kultur`, because the canonical angle is the former industrial production hall and Norwegian engine industry.

### Evidence

Kringom states that Norsk Motormuseum is located in former production premises of Sunnhordland Mekaniske Verkstad and has one of Norway's largest collections of engines, with emphasis on Norwegian production. The museum provides a concrete industrial-history link between engine technology, fisheries and the West Norwegian mechanical industry.

### Coordinate

`59.73324, 5.93949`, mapped point for Norsk Motormuseum in Skånevik.

### Sources

- Kringom: Skånevik – Norsk motormuseum
- mapped museum point / OpenStreetMap-derived locality data

## 2. Sunnhordland Mekaniske Verkstad, Leknestangen

### Decision

Create `sunnhordland_mek_verkstad_leknestangen` as the current physical industrial anchor, distinct from the former production hall now used by Norsk Motormuseum.

### Evidence

BUI Sunnhordland documents that Sunnhordland Mekaniske Verksted was founded in 1958 and developed from a local supplier into a multi-disciplinary company working with special machinery, industrial mechanics, hydraulics, electrical systems and machining. Brønnøysundregistrene gives the current business address as Leknestangen 95, 5593 Skånevik.

### Coordinate

The source file initially uses a provisional Leiknestangen-area anchor. Before merge, the integration workflow must resolve and replace it with the official Kartverket/Geonorge address point for Leknestangen 95.

### Sources

- BUI Sunnhordland: SMV
- Brønnøysundregistrene: SUNNHORDLAND MEK VERKSTED AS

## 3. Skånevik hermetikkfabrikk

### Decision

Create `skanevik_hermetikkfabrikk` as a separate economic-history place from the surviving Gjestgjevargarden building.

### Evidence

Kringom documents that Chr. Bjelland bought the guesthouse complex in 1908 and built the canning factory on the site of the former seahouse and shop. Contemporary historical summaries describe the factory as a major local workplace, especially for women, with expansion in 1947, major modernization around 1960, transfer to Norway Foods in 1981, later Rieber & Søn, and final production on 30 March 2001. Store norske leksikon identifies Skånevik's traditional sprat production as one of the last such operations in Norway, ending in 2001.

### Coordinate

`59.73128737155455, 5.92525891571817`, deliberately used as a representative area anchor for the documented former guesthouse/factory property. This does not claim the exact historical factory footprint. The marker overlaps the wider property context of Gjestgjevargarden but represents a distinct demolished/industrial function and must remain editorially explicit about that distinction.

### Sources

- Kringom: Skånevik – handelsstaden
- Store norske leksikon: Etne, næringsliv
- Erling Jensen: Fabrikken i Skånevik
- Stavanger Aftenblad historical industry context

## 4. Litledalen kraftverk

### Decision

Create `litledalen_kraftverk` as a hydropower and electrification anchor.

### Evidence

NVE's hydropower database records Litledalen with operation history from 1920. The plant is part of the Litledalsvassdraget power system and is owned by Sunnhordland Kraftlag. The facility has been technically renewed, but the canonical place represents the long industrial continuity of power production at Litledalen.

### Coordinate

`59.66306, 6.065`, mapped historic Litledalen power-station point corroborated by open map/Wikidata data tied back to the NVE plant record.

### Sources

- NVE Vannkraftdatabase: Nye Litledalen, plant 248
- SKL power-system context
- mapped Litledalen power-station coordinate data

## 5. Hardeland kraftverk

### Decision

Create one canonical physical place, `hardeland_kraftverk`, covering both Hardeland H and Hardeland K rather than two overlapping map markers.

### Evidence

NVE records Hardeland H as commissioned in 1950 and the Hardeland K line as commissioned in 1958. Both are part of the same Hardeland power-station environment in Etne and the wider Litledalsvassdraget system. NVE lists Hardeland H at 24 MW and the later Hardeland line as a separate production unit; SKL documents an operational environment in Litledalen tied to Litledalen and Hardeland power plants.

### Coordinate

`59.65761, 6.09643`, mapped industrial-building point for Hardeland kraftverk. The source explicitly treats H and K as production lines within one canonical physical site.

### Sources

- NVE Vannkraftdatabase: Hardeland H, plant 129
- NVE Vannkraftdatabase: Nye Hardeland / Hardeland K history, plant 130
- SKL annual-report and operational context
- mapped Hardeland power-station point

## Editorial safeguards

- Do not duplicate `norsk_motormuseum_skanevik` and `sunnhordland_mek_verkstad_leknestangen`: they represent different physical sites, former and current SMV premises.
- Do not present the Skånevik canning-factory marker as an exact footprint; it is an explicitly representative property-area anchor.
- Do not create separate Hardeland H and Hardeland K places at the same physical plant environment.
- Litledalen and Hardeland must be treated as industrial energy places, not nature places.
- Current technical upgrades must not erase the documented historical commissioning dates used for the industrial-history angle.
