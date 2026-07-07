# Bispelokket rundingaudit

## Status
- people: 🔴
- tasks: ✅
- badges: ✅
- works: 🔴
- civication: ✅
- brands: 🔴
- før_nå: ✅
- fortellinger: ✅
- leksikon: ✅

## Mangler
- people: mangler eksplisitt personkobling for Bispelokket; eksisterende helserapport peker også på `missing_people_linkage`.
- works: mangler `works`-liste i Bispelokket source-data.
- civication: har stedsspesifikke `civication_store`-items i Bispelokket source-data.
- brands: mangler eksplisitte merkevare-/aktørkoblinger for stedet.
- badges: har `emne_ids`, og vurderes derfor grønn for rundingens minimumskobling.
- fortellinger: `data/stories/stories_bispelokket.json` finnes og er koblet med `place_id: "bispelokket"`.
- leksikon: `data/leksikon/places/oslo/by/leksikon_oslo_by_batch1.json` har leksikonoppføring for `place_id: "bispelokket"`.

## Anbefalt neste steg
Fyll `tasks` først med en manuell `tasks_profile` for Bispelokket. Den kan bygge direkte på stedets kjerne som revet trafikkmaskin, barriere og skifte fra bilby til Fjordbyen, og vil gi en tydelig interaktiv runding uten å kreve at alle øvrige innholdstyper ferdigstilles samtidig.
