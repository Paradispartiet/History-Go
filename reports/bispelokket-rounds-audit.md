# Bispelokket rundingaudit

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

## Mangler
- people: har eksplisitt personkobling til `jens_stoltenberg` gjennom relasjon `rel_bispelokket_jens_stoltenberg_riving`.
- works: har stedsspesifikk `works`-liste i Bispelokket source-data med infrastrukturverk, konstruksjon, byplaninngrep, infrastrukturgrep og byutviklingsverk.
- civication: har stedsspesifikke `civication_store`-items i Bispelokket source-data.
- brands: har eksplisitte aktørkoblinger i Bispelokket source-data: Statens vegvesen, Plan- og bygningsetaten Oslo kommune, Bjørvika Utvikling, Fjordbyen og Fjellinjen.
- badges: har `emne_ids`, og vurderes derfor grønn for rundingens minimumskobling.
- fortellinger: `data/stories/stories_bispelokket.json` finnes og er koblet med `place_id: "bispelokket"`.
- leksikon: `data/leksikon/places/oslo/by/leksikon_oslo_by_batch1.json` har leksikonoppføring for `place_id: "bispelokket"`.

## Anbefalt neste steg
Bispelokket har nå 9/9 grønne rundinger. Neste steg bør være generell QA av stedskortet i appen: åpne PlaceCard, sjekk at alle ni rundinger har innhold, og kontroller at people-rundingen viser Jens Stoltenberg uten å trekke inn løse eller usikre personer.
