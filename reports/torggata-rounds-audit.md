# Torggata rundingaudit

## Status
- people: ✅
- tasks: ✅
- badges: ✅
- works: 🟡
- civication: ✅
- brands: ✅
- før_nå: ✅
- fortellinger: ✅
- leksikon: ✅

## Mangler
- Torggata har nøyaktig de 9 ønskede rundingene i `place.rounds`, og ingen `nature`, `play`, `training` eller `routes` i Torggata-rundingen.
- DOM-hook/list/popup-kobling finnes for alle 9 rundinger via canonical PlaceCard-rundinger og `bindRoundPopup`.
- `people` har Torggata-personkoblinger i eksisterende people-data, og PlaceCard kan vise personlisten/personrelasjoner.
- `tasks` har stedsspesifikt `tasks_profile` med 3 oppgaver.
- `badges` har grunninnhold gjennom kategori/emner (`by`, `em_by_gentrifisering_eiendom`, `em_by_styring_forvaltning_planmakt`).
- `works` åpner PlaceCard-popup, men Torggata mangler faktisk verk-/prestasjoninnhold bak rundingen. PlaceCard faller derfor tilbake til «Ingen verk eller prestasjoner ennå».
- `civication` åpner PlaceCard-popup og Torggata har nå stedsspesifikke `civication_store`-items i place-dataene som PlaceCard leser: gateskilt, sykkel-/gågatesymbol, serveringssone-markør og før/nå-bildekort for miljøgate-transformasjonen.
- `brands` har stedskoblinger i `data/brands/brands_by_place.json`.
- `før_nå` har komplett `for_na`-innhold.
- `fortellinger` har story-manifest og `data/stories/stories_torggata.json`; rundingen åpner `HGStories.openPlace` når stories-runtime er lastet.
- `leksikon` har leksikonoppføring for Torggata og åpner `HGLeksikon.openPlace` når leksikon-runtime er lastet.

## Anbefalt neste steg
Neste hull er `works`: rundingen er synlig og teknisk koblet, men trenger faktisk verk-/prestasjoninnhold før den gir nyttig PlaceCard-innhold.
