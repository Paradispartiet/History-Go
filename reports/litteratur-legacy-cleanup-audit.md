# Litteratur legacy cleanup audit

Generert: 2026-06-01T09:43:03.206Z

Analysert kilde: `data/people/people_litteratur.json` (kun gjenværende legacy-personer).
Fasit for aktive placeId-er: `data/places/manifest.json` (470 aktive placeId-er).
`data/people.json` brukes ikke. `places_index.json` brukes ikke som fasit.

Denne rapporten endrer ingen data – den klassifiserer kun gjenværende litteratur-legacy.

## 1. Sammendrag
- Legacy-personer lest: **10**
- Forventede legacy-personer funnet: **10 / 10**
- Uventede legacy-personer: **0**
- Personer med gyldig primary placeId: **8**
- Personer uten gyldig sted: **2**
- Stubber: **1**
- Ugyldige placeRefs (treff totalt): **14**
- Unike ugyldige placeRefs: **10**
- missing_place_candidate: **9**
- likely_rename_to_existing_place: **0**
- needs_manual_review (refs): **1**

Klassifisering (personer):
- has_valid_primary_but_invalid_secondary_refs: **7**
- missing_place_data_required: **1**
- ready_for_manual_mapping: **1**
- stub_needs_manual_completion: **1**

## 2. Gjenværende legacy-personer
### sigrid_undset — Sigrid Undset
- classification: **has_valid_primary_but_invalid_secondary_refs**
- placeId: `nasjonalbiblioteket` (status: valid)
- valid places: `nasjonalbiblioteket`, `ullevål_hageby`, `sigrid_undset_statue`
- invalid places: `bøker_i_byen`
- manglende schemafelt: (ingen)
- stub: false
- anbefalt neste handling: Gyldig primary, men sekundærrefs peker trolig på manglende steder. Beslutt place-data eller fjern refs manuelt.

### bjornstjerne_bjornson — Bjørnstjerne Bjørnson
- classification: **has_valid_primary_but_invalid_secondary_refs**
- placeId: `nasjonalbiblioteket` (status: valid)
- valid places: `nasjonalbiblioteket`, `nationaltheatret`
- invalid places: `bjornson_bolig`, `ibsen_bjornson_graver`
- manglende schemafelt: (ingen)
- stub: false
- anbefalt neste handling: Gyldig primary, men sekundærrefs peker trolig på manglende steder. Beslutt place-data eller fjern refs manuelt.

### henrik_wergeland — Henrik Wergeland
- classification: **has_valid_primary_but_invalid_secondary_refs**
- placeId: `voienvolden` (status: valid)
- valid places: `voienvolden`, `henrik_wergeland_statue`
- invalid places: `bøker_i_byen`, `henrik_wergeland_park`, `wergeland_barndom`, `wergeland_grav`, `wergelandsveien_15`
- manglende schemafelt: (ingen)
- stub: false
- anbefalt neste handling: Gyldig primary, men sekundærrefs peker trolig på manglende steder. Beslutt place-data eller fjern refs manuelt.

### camilla_collett — Camilla Collett
- classification: **has_valid_primary_but_invalid_secondary_refs**
- placeId: `camilla_collett_statue` (status: valid)
- valid places: `camilla_collett_statue`
- invalid places: `collett_barndom`, `henrik_wergeland_park`
- duplikate refs i person: `camilla_collett_statue`
- manglende schemafelt: (ingen)
- stub: false
- anbefalt neste handling: Gyldig primary, men sekundærrefs peker trolig på manglende steder. Beslutt place-data eller fjern refs manuelt.

### andre_bjerke — André Bjerke
- classification: **has_valid_primary_but_invalid_secondary_refs**
- placeId: `grotta` (status: valid)
- valid places: `grotta`
- invalid places: `grotten_utsikt`
- manglende schemafelt: (ingen)
- stub: false
- anbefalt neste handling: Gyldig primary, men sekundærrefs peker trolig på manglende steder. Beslutt place-data eller fjern refs manuelt.

### inger_hagerup — Inger Hagerup
- classification: **has_valid_primary_but_invalid_secondary_refs**
- placeId: `grotta` (status: valid)
- valid places: `grotta`
- invalid places: `grotten_utsikt`, `inger_hagerup_minne`
- manglende schemafelt: (ingen)
- stub: false
- anbefalt neste handling: Gyldig primary, men sekundærrefs peker trolig på manglende steder. Beslutt place-data eller fjern refs manuelt.

### jon_fosse — Jon Fosse
- classification: **has_valid_primary_but_invalid_secondary_refs**
- placeId: `grotta` (status: valid)
- valid places: `grotta`
- invalid places: `grotten_utsikt`
- manglende schemafelt: (ingen)
- stub: false
- anbefalt neste handling: Gyldig primary, men sekundærrefs peker trolig på manglende steder. Beslutt place-data eller fjern refs manuelt.

### alf_proysen — Alf Prøysen
- classification: **ready_for_manual_mapping**
- placeId: `alf_proysen_statue_nittedal` (status: valid)
- valid places: `alf_proysen_statue_nittedal`
- invalid places: (ingen)
- manglende schemafelt: (ingen)
- stub: false
- anbefalt neste handling: Gyldig primary og kun gyldige refs. Kan tas i trygg manuell mapping-batch (evt. rydde duplikat/tomme refs).

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
- **sigrid_undset** (Sigrid Undset) — has_valid_primary_but_invalid_secondary_refs
  - `bøker_i_byen` → missing_place_candidate
- **bjornstjerne_bjornson** (Bjørnstjerne Bjørnson) — has_valid_primary_but_invalid_secondary_refs
  - `bjornson_bolig` → missing_place_candidate
  - `ibsen_bjornson_graver` → missing_place_candidate
- **henrik_wergeland** (Henrik Wergeland) — has_valid_primary_but_invalid_secondary_refs
  - `bøker_i_byen` → missing_place_candidate
  - `henrik_wergeland_park` → needs_manual_review
  - `wergeland_barndom` → missing_place_candidate
  - `wergeland_grav` → missing_place_candidate
  - `wergelandsveien_15` → missing_place_candidate
- **camilla_collett** (Camilla Collett) — has_valid_primary_but_invalid_secondary_refs
  - `collett_barndom` → missing_place_candidate
  - `henrik_wergeland_park` → needs_manual_review
- **andre_bjerke** (André Bjerke) — has_valid_primary_but_invalid_secondary_refs
  - `grotten_utsikt` → missing_place_candidate
- **inger_hagerup** (Inger Hagerup) — has_valid_primary_but_invalid_secondary_refs
  - `grotten_utsikt` → missing_place_candidate
  - `inger_hagerup_minne` → missing_place_candidate
- **jon_fosse** (Jon Fosse) — has_valid_primary_but_invalid_secondary_refs
  - `grotten_utsikt` → missing_place_candidate

## 4. Unike ugyldige placeRefs
### `bjornson_bolig`
- antall treff: 1
- brukt av: bjornstjerne_bjornson
- klassifisering: **missing_place_candidate**
- finnes i places_index.json (kun runtime-sammenligning): false
- kandidatforslag: missing_place_candidate (ingen god kandidat)

### `bøker_i_byen`
- antall treff: 2
- brukt av: henrik_wergeland, sigrid_undset
- klassifisering: **missing_place_candidate**
- finnes i places_index.json (kun runtime-sammenligning): false
- kandidatforslag: missing_place_candidate (ingen god kandidat)

### `collett_barndom`
- antall treff: 1
- brukt av: camilla_collett
- klassifisering: **missing_place_candidate**
- finnes i places_index.json (kun runtime-sammenligning): false
- kandidatforslag: missing_place_candidate (ingen god kandidat)

### `grotten_utsikt`
- antall treff: 3
- brukt av: andre_bjerke, inger_hagerup, jon_fosse
- klassifisering: **missing_place_candidate**
- finnes i places_index.json (kun runtime-sammenligning): false
- kandidatforslag: missing_place_candidate (ingen god kandidat)

### `henrik_wergeland_park`
- antall treff: 2
- brukt av: camilla_collett, henrik_wergeland
- klassifisering: **needs_manual_review**
- finnes i places_index.json (kun runtime-sammenligning): false
- kandidatforslag:
  - `henrik_wergeland_statue` (confidence: low)

### `ibsen_bjornson_graver`
- antall treff: 1
- brukt av: bjornstjerne_bjornson
- klassifisering: **missing_place_candidate**
- finnes i places_index.json (kun runtime-sammenligning): false
- kandidatforslag: missing_place_candidate (ingen god kandidat)

### `inger_hagerup_minne`
- antall treff: 1
- brukt av: inger_hagerup
- klassifisering: **missing_place_candidate**
- finnes i places_index.json (kun runtime-sammenligning): false
- kandidatforslag: missing_place_candidate (ingen god kandidat)

### `wergeland_barndom`
- antall treff: 1
- brukt av: henrik_wergeland
- klassifisering: **missing_place_candidate**
- finnes i places_index.json (kun runtime-sammenligning): false
- kandidatforslag: missing_place_candidate (ingen god kandidat)

### `wergeland_grav`
- antall treff: 1
- brukt av: henrik_wergeland
- klassifisering: **missing_place_candidate**
- finnes i places_index.json (kun runtime-sammenligning): false
- kandidatforslag: missing_place_candidate (ingen god kandidat)

### `wergelandsveien_15`
- antall treff: 1
- brukt av: henrik_wergeland
- klassifisering: **missing_place_candidate**
- finnes i places_index.json (kun runtime-sammenligning): false
- kandidatforslag: missing_place_candidate (ingen god kandidat)

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
- sigrid_undset
- bjornstjerne_bjornson
- henrik_wergeland
- camilla_collett
- andre_bjerke
- inger_hagerup
- jon_fosse
- alf_proysen

### Batch B — missing place-data candidates
missing_place_candidate placeRefs som bør få egne places (egen place-beslutning) før people kan ryddes.
- `bjornson_bolig`
- `bøker_i_byen`
- `collett_barndom`
- `grotten_utsikt`
- `ibsen_bjornson_graver`
- `inger_hagerup_minne`
- `wergeland_barndom`
- `wergeland_grav`
- `wergelandsveien_15`

### Batch C — stubber / personer uten gyldig sted
Stubber / personer uten gyldig sted som må kurateres manuelt i chat før implementering.
- rolf_jacobsen
- per_petterson

