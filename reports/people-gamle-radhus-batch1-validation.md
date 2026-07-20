# People of Places — Gamle rådhus batch 1

Dato: 2026-07-20

## Resultat

Fire nye canonical personer og én gjenbrukt canonical person kobles til `gamle_radhus`.

### Nye personer

- `lauritz_hansen` — ledet oppføringen av rådhuset, ferdig 1641.
- `lars_backer` — dokumentert restaureringsplan fra 1917.
- `carl_berner_arkitekt` — kreditert av Oslo kommune for restaurantinteriøret fra 1926; særskilt ID brukes fordi `carl_berner` allerede er en annen canonical person.
- `gjoril_songvoll` — dokumentert moderne scene-/operatørkobling og opptreden på Gamle Raadhus Scene.

### Gjenbrukt person

- `hannibal_sehested` beholder `akershus_festning` som primæranker og får `gamle_radhus` i `places`, fordi generalkommissariatet hans hadde kontorer i bygningen i de første årene etter oppføringen.

## Stedsgate

Alle fem relasjonene gjelder selve bygningen gjennom bygging, administrativ bruk, restaurering, interiørarbeid eller dokumentert scenevirksomhet. Løse Christiania-/Oslo-assosiasjoner er ikke brukt.

## Kilder

- Oslo kommune — Gamle Rådhus.
- Oslo byleksikon — Nedre Slottsgate 1.
- Sceneweb — Gamle Raadhus Scene / Rådhussalen.
- Norsk kunstnerleksikon / SNL — Carl Berner (arkitekt).
- Lokalhistoriewiki — Gamle rådhus (Oslo), for Hannibal Sehesteds generalkommissariat.
- Operabase — dokumentert Gjøril Songvoll-opptreden på Gamle Raadhus Scene i 2014.

## Valideringsgate

Finalizeren skal etter materialisering kjøre `bash scripts/check-people.sh` og `git diff --check`.
