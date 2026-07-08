# Bispelokket rundingaudit

## Status
- people: 🔴
- tasks: ✅
- badges: ✅
- works: ✅
- civication: ✅
- brands: 🔴
- før_nå: ✅
- fortellinger: ✅
- leksikon: ✅

## Mangler
- people: mangler eksplisitt personkobling for Bispelokket; eksisterende helserapport peker også på `missing_people_linkage`.
- works: har stedsspesifikk `works`-liste i Bispelokket source-data med infrastrukturverk, konstruksjon, byplaninngrep, infrastrukturgrep og byutviklingsverk.
- civication: har stedsspesifikke `civication_store`-items i Bispelokket source-data.
- brands: mangler eksplisitte merkevare-/aktørkoblinger for stedet.
- badges: har `emne_ids`, og vurderes derfor grønn for rundingens minimumskobling.
- fortellinger: `data/stories/stories_bispelokket.json` finnes og er koblet med `place_id: "bispelokket"`.
- leksikon: `data/leksikon/places/oslo/by/leksikon_oslo_by_batch1.json` har leksikonoppføring for `place_id: "bispelokket"`.

## Anbefalt neste steg
Fyll `brands` med eksplisitte merkevare-/aktørkoblinger for Bispelokket, siden dette nå er neste strukturelle hull etter at `tasks`, `works`, `civication`, `før_nå`, `fortellinger` og `leksikon` er dekket.
