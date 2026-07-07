# Torggata rundingaudit

## Status
- people: ✅
- tasks: ✅
- badges: ✅
- works: ✅
- civication: ✅
- brands: ✅
- før_nå: ✅
- fortellinger: ✅
- leksikon: ✅

## Kontrollpunkter
- Torggata har nøyaktig de 9 ønskede rundingene i `place.rounds`, og ingen `nature`, `play`, `training` eller `routes` i Torggata-rundingen.
- DOM-hook/list/popup-kobling finnes for alle 9 rundinger via canonical PlaceCard-rundinger og `bindRoundPopup`.
- `people` har Torggata-personkoblinger i eksisterende people-data, og PlaceCard kan vise personlisten/personrelasjoner.
- `tasks` har stedsspesifikt `tasks_profile` med 3 oppgaver.
- `badges` har grunninnhold gjennom kategori/emner (`by`, `em_by_gentrifisering_eiendom`, `em_by_styring_forvaltning_planmakt`).
- `works` åpner PlaceCard-popup og Torggata har nå 5 stedsspesifikke `works`-items i `place.works`, som er feltet PlaceCard leser for `pcWorksList`: Torggata Bad/Rockefeller-komplekset, Rockefeller, John Dee, Eldorado som kino-/bokhandelombruk og miljøgateombyggingen.
- `civication` åpner PlaceCard-popup og Torggata har nå stedsspesifikke `civication_store`-items i place-dataene som PlaceCard leser: gateskilt, sykkel-/gågatesymbol, serveringssone-markør og før/nå-bildekort for miljøgate-transformasjonen.
- `brands` har stedskoblinger i `data/brands/brands_by_place.json`.
- `før_nå` har komplett `for_na`-innhold.
- `fortellinger` har story-manifest og `data/stories/stories_torggata.json`; rundingen åpner `HGStories.openPlace` når stories-runtime er lastet.
- `leksikon` har leksikonoppføring for Torggata og åpner `HGLeksikon.openPlace` når leksikon-runtime er lastet.

## Status etter oppdatering
Alle 9 ønskede Torggata-rundinger er nå ✅. `works` har faktisk verk-/prestasjoninnhold, og kunst-/kulturinnholdet ligger under `works` i stedet for som egen runding.
