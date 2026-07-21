# Oslo coordinate control batch 119 – popkultur

## Verified
- `cinemateket_oslo` → `osm-node:2555016576`
- `colosseum_kino` → `osm-way:115958003`
- `house_of_nerds` → `osm-node:10204324977`
- `latter` → `osm-way:92649935`
- `grand_hotel` → `osm-node:307505492`
- `slottsplassen` → `osm-relation:12806921`
- `chat_noir` → `osm-node:34693408`
- `edderkoppen_scene` → `osm-node:12635984964`

## Completed without approved coordinate
- `frognerstranda` → needs_review / needs_source

Existing official Geonorge addresses are retained when already canonical. All bounded OSM candidate sets are stored here. No nearest/first-hit selection is used.

## Address-first correction

Den opprinnelige batch-kjøringen brukte direkte OSM-verifikasjon for flere konkrete adressebare venue-/hotellsteder. Dette er korrigert: Geonorge Adresser API kjøres først for Cinemateket, Colosseum kino, House of Nerds, Latter, Grand Hotel, Chat Noir og Edderkoppen Scene. Tekniske Geonorge-feil blokkerer og kan ikke legitimere fallback. Slottsplassen forblir et geometrianker, mens Frognerstranda forblir needs_source.

- Geonorge primary: cinemateket_oslo, house_of_nerds, latter, grand_hotel, chat_noir, edderkoppen_scene
- OSM fallback etter dokumentert ikke-feilende adresseforsøk: colosseum_kino
