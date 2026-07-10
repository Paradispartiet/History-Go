# Subkultur → musikk people cleanup batch 1 validation

Dato: 2026-07-10T07:45:14.745Z

## Scope

Denne migreringen flytter fire kollektive venue-/klubb-/musikkmiljøankre fra primær `subkultur` til primær `musikk`, etter at de tilsvarende place-ankrene ble flyttet i PR #2068.

Dette er people-opprydding, ikke ny research og ikke ny dataproduksjon.

## Flyttede entries

| peopleId | name | placeId | før | etter | begrunnelse |
|---|---|---|---|---|---|
| `revolver_oslo_miljoet` | Revolver-miljøet | `revolver_oslo` | `subkultur` | `musikk` | Revolver-miljøet er knyttet til et sted som batch 1 flyttet til primær musikk; entryen handler primært om konsert-, klubb- og musikkmiljø. |
| `the_villa_miljoet` | The Villa-miljøet | `the_villa` | `subkultur` | `musikk` | The Villa-miljøet er elektronisk klubb-/DJ-/dansegulvsmiljø og følger place-flyttingen til primær musikk. |
| `jaeger_oslo_miljoet` | Jæger-miljøet | `jaeger_oslo` | `subkultur` | `musikk` | Jæger-miljøet er elektronisk klubb-/DJ-miljø og følger place-flyttingen til primær musikk. |
| `bla_miljoet_concrete_anchor` | Blå-miljøet | `bla` | `subkultur` | `musikk` | Blå-miljøet er konsert-, klubb-, jazz- og elektronika-miljø og følger place-flyttingen til primær musikk. |

## Filer endret av migreringen

- `data/people/subkultur/oslo/people_subkultur_oslo_venues_batch3.json`
- `data/people/subkultur/oslo/people_subkultur_oslo_concrete_anchors_batch4.json`
- `data/people/musikk/oslo/people_musikk_oslo.json`

## Ikke endret

- Ingen place-filer.
- Ingen manifests.
- Ingen places_index.
- Ingen UI/runtime.
- Ingen quiz.
- Ingen hybridsteder.
- Ingen Blitzhuset/Hausmania/X-Ray/Torggata Blad-miljøer flyttet.

## Validering

Kjør:

```bash
bash scripts/check-people.sh
```

Forventet:

- duplicatePeopleIds = 0
- invalidPlaceRefs = 0
- peopleWithoutValidPrimaryAnchor = 0
- peopleWithEmptyPlacesArray = 0
