# Litteratur legacy cleanup audit

Generert: 2026-06-01T10:36:04.084Z

Analysert kilde: `data/people/people_litteratur.json` (kun gjenværende legacy-personer).
Fasit for aktive placeId-er: `data/places/manifest.json` (470 aktive placeId-er).
`data/people.json` brukes ikke. `places_index.json` brukes ikke som fasit.

Denne rapporten endrer ingen data – den klassifiserer kun gjenværende litteratur-legacy.

## 1. Sammendrag
- Legacy-personer lest: **2**
- Forventede legacy-personer funnet: **2 / 10**
- Uventede legacy-personer: **0**
- Personer med gyldig primary placeId: **0**
- Personer uten gyldig sted: **2**
- Stubber: **1**
- Ugyldige placeRefs (treff totalt): **0**
- Unike ugyldige placeRefs: **0**
- missing_place_candidate: **0**
- likely_rename_to_existing_place: **0**
- needs_manual_review (refs): **0**

Klassifisering (personer):
- missing_place_data_required: **1**
- stub_needs_manual_completion: **1**

**expected_legacy_people_missing:**
- sigrid_undset
- bjornstjerne_bjornson
- henrik_wergeland
- camilla_collett
- andre_bjerke
- inger_hagerup
- jon_fosse
- alf_proysen

## 2. Gjenværende legacy-personer
### rolf_jacobsen — Rolf Jacobsen
- classification: **missing_place_data_required**
- placeId: `(mangler)` (status: missing)
- valid places: (ingen)
- invalid places: (ingen)
- manglende schemafelt: placeId, places
- stub: false
- anbefalt neste handling: Mangler all gyldig stedskobling. Avgjør om sted finnes/skal opprettes før people kan ryddes.

### per_petterson — Per Petterson
- classification: **stub_needs_manual_completion**
- placeId: `(mangler)` (status: missing)
- valid places: (ingen)
- invalid places: (ingen)
- manglende schemafelt: initials, placeId, year, popupDesc, places, image, cardImage
- avvikende felt: kind, imageCard, stub
- stub: true
- anbefalt neste handling: Kurater person manuelt i chat: fyll inn manglende schemafelt og bestem stedskobling før implementering.

## 3. Ugyldige placeRefs gruppert per person
Ingen ugyldige placeRefs funnet.

## 4. Unike ugyldige placeRefs
Ingen ugyldige placeRefs.
## 5. People uten gyldig sted
- **rolf_jacobsen** (Rolf Jacobsen) — placeId-status: missing, classification: missing_place_data_required
- **per_petterson** (Per Petterson) — placeId-status: missing, classification: stub_needs_manual_completion

## 6. Stubber / avvikende schema
- **rolf_jacobsen** (Rolf Jacobsen) — stub: false, classification: missing_place_data_required
  - manglende schemafelt: placeId, places
- **per_petterson** (Per Petterson) — stub: true, classification: stub_needs_manual_completion
  - avvikende felt: kind, imageCard, stub
  - manglende schemafelt: initials, placeId, year, popupDesc, places, image, cardImage

## 7. Anbefalt neste ryddebatch
Foreslår neste arbeid uten å utføre det. Ingen data endres av denne rapporten.

### Batch A — trygge personer med gyldig primary placeId
Trygge personer med gyldig primary placeId. Ugyldige sekundærrefs kan fjernes eller mappes etter manuell beslutning.
- (ingen)

### Batch B — missing place-data candidates
missing_place_candidate placeRefs som bør få egne places (egen place-beslutning) før people kan ryddes.
- (ingen)

### Batch C — stubber / personer uten gyldig sted
Stubber / personer uten gyldig sted som må kurateres manuelt i chat før implementering.
- rolf_jacobsen
- per_petterson

