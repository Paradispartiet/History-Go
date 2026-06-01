# Litteratur legacy cleanup audit

Generert: 2026-06-01T11:12:52.224Z

Analysert kilde: `data/people/people_litteratur.json` (kun gjenværende legacy-personer).
Fasit for aktive placeId-er: `data/places/manifest.json` (470 aktive placeId-er).
`data/people.json` brukes ikke. `places_index.json` brukes ikke som fasit.

Denne rapporten endrer ingen data – den klassifiserer kun gjenværende litteratur-legacy.

## 1. Sammendrag
- Legacy-personer lest: **0**
- Forventede legacy-personer funnet: **0 / 10**
- Uventede legacy-personer: **0**
- Personer med gyldig primary placeId: **0**
- Personer uten gyldig sted: **0**
- Stubber: **0**
- Ugyldige placeRefs (treff totalt): **0**
- Unike ugyldige placeRefs: **0**
- missing_place_candidate: **0**
- likely_rename_to_existing_place: **0**
- needs_manual_review (refs): **0**

Klassifisering (personer):

**expected_legacy_people_missing:**
- sigrid_undset
- bjornstjerne_bjornson
- henrik_wergeland
- camilla_collett
- andre_bjerke
- inger_hagerup
- jon_fosse
- rolf_jacobsen
- alf_proysen
- per_petterson

## 2. Gjenværende legacy-personer
## 3. Ugyldige placeRefs gruppert per person
Ingen ugyldige placeRefs funnet.

## 4. Unike ugyldige placeRefs
Ingen ugyldige placeRefs.
## 5. People uten gyldig sted
Ingen.

## 6. Stubber / avvikende schema
Ingen.

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
- (ingen)

