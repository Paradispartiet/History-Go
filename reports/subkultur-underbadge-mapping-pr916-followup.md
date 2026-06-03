# Subkultur Oslo – underbadge mapping PR #916 follow-up

Oppfølgingsrapport for de syv stedene som ble lagt inn i PR #916. Formålet med denne jobben var kun å mappe ugyldige `underbadge_ids` til eksisterende definerte subkultur-underbadges i `data/badges/subkultur.json`.

## Kontrollerte steder

Følgende syv PR #916-steder ble kontrollert i `data/places/subkultur/oslo/places_subkultur.json`:

- `blitzhuset`
- `kafe_haerverk`
- `brenneriveien_ingens_gate`
- `gamlebyen_sport_og_fritid`
- `oslo_skatehall`
- `xray_ungdomskulturhus`
- `vaterland_bar_scene`

## Underbadge-endringer per sted

Eksisterende gyldige subkultur-underbadges ble hentet fra `data/badges/subkultur.json` feltet `sub`:

- `alternativ_mote`
- `graffiti`
- `hiphop`
- `motkulturhistorie`
- `punk`
- `rave_og_klubbkultur`
- `skate`
- `underground_scener`

| Sted | Før | Etter |
| --- | --- | --- |
| `blitzhuset` | `punk`, `diy`, `aktivisme` | `punk`, `motkulturhistorie`, `underground_scener` |
| `kafe_haerverk` | `undergrunn`, `klubbkultur`, `eksperimentell_musikk` | `underground_scener`, `rave_og_klubbkultur` |
| `brenneriveien_ingens_gate` | `graffiti`, `street_art`, `undergrunn` | `graffiti`, `underground_scener` |
| `gamlebyen_sport_og_fritid` | `skate`, `graffiti`, `dugnad` | `skate`, `graffiti`, `motkulturhistorie` |
| `oslo_skatehall` | `skate` | `skate` |
| `xray_ungdomskulturhus` | `hiphop`, `dans`, `ungdomskultur` | `hiphop`, `underground_scener` |
| `vaterland_bar_scene` | `punk`, `metal`, `rock` | `punk`, `underground_scener` |

`oslo_skatehall` ble kontrollert og var allerede mappet til en gyldig underbadge, så verdien forble `skate`.

## Avgrensning

- Ingen nye underbadges ble opprettet.
- Ingen nye steder ble lagt inn.
- UI, runtime, CSS og schema ble ikke endret.
- Rapporten fra PR #920, `reports/subkultur-oslo-new-place-candidates-batch-01.md`, ble ikke endret. Denne filen er en separat oppfølgingsrapport.

## Valideringer kjørt

- `python -m json.tool data/places/subkultur/oslo/places_subkultur.json > /tmp/places_subkultur.json.check`
- `python -m json.tool data/badges/subkultur.json > /tmp/subkultur_badges.json.check`
- `npm run places:emner:check`
- `npm run places:aliases:check`
- `npm run places:index:check`
- Egen Python-kontroll mot `data/badges/subkultur.json` som bekreftet at de syv PR #916-stedene kun bruker gyldige underbadge-ID-er.

## Status for ugyldige underbadge_ids på de syv stedene

Etter mappingen finnes det ingen ugyldige `underbadge_ids` på de syv PR #916-stedene. Den egne kontrollen sammenlignet hvert `underbadge_ids`-felt for de syv stedene mot `sub`-listen i `data/badges/subkultur.json` og returnerte ingen avvik.
