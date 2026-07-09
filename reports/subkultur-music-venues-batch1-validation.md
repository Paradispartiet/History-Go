# Subkultur → musikk venues cleanup batch 1 validation

Dato: 2026-07-09T22:39:52.828Z

## Scope

Denne migreringen flytter fire rene musikk-/venue-/klubbsteder fra primær `subkultur` til primær `musikk`, med `secondaryBadgeIds: ["subkultur"]` for å beholde reell undergrunns-/klubbkulturkobling.

Dette følger primær-/sekundærbadge-modellen fra PR #2057 og audit-anbefalingen fra PR #2061.

## Endrede places

| placeId | name | før | etter | secondaryBadgeIds | begrunnelse |
|---|---|---|---|---|---|
| `bla` | Blå | `subkultur` | `musikk` | `["subkultur"]` | Konsert-, klubb-, jazz- og elektronika-arena; primært musikksted, med tydelig undergrunns-/klubbkultur som sekundær subkulturkobling. |
| `revolver_oslo` | Revolver | `subkultur` | `musikk` | `["subkultur"]` | Konsert-, klubb- og utelivssted; primært musikk-/venue-infrastruktur, med undergrunnsprofil som sekundær subkulturkobling. |
| `the_villa` | The Villa | `subkultur` | `musikk` | `["subkultur"]` | Elektronisk klubb, DJ-kultur og dansegulv; primært musikksted, med rave-/klubbkultur som sekundær subkulturkobling. |
| `jaeger_oslo` | Jaeger | `subkultur` | `musikk` | `["subkultur"]` | Elektronisk klubb, DJ-kultur og bakgårdsscene; primært musikksted, med klubbkultur som sekundær subkulturkobling. |

## Ikke endret

- Ingen people-filer.
- Ingen manifest-filer.
- Ingen UI/runtime-filer.
- Ingen nye places.
- Ingen hybridsteder.
- Ingen deaktivert place i `place_exclusions.json`.

## Påkrevde kommandoer etter migrering

```bash
npm run places:index:build
bash scripts/check-places.sh
```

Forventet:

- Place primary/secondary badge audit ok.
- Active subkultur place concreteness guard ok.
- Places index sync ok etter regenerering.
- Ingen ugyldige sekundærbadges.
