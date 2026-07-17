# Concrete anchor ID cleanup validation

Dato: 2026-07-17T20:50:49.215Z

## Endringer

- Fjernet duplikatet `hausmania_miljoet_concrete_anchor` fordi stabil `hausmania_miljoet` allerede finnes.
- Fjernet duplikatet `xray_ungdomskulturhus_miljoet_concrete_anchor` fordi stabil `xray_ungdomskulturhus_miljoet` allerede finnes.
- Fjernet gammel stabil `bla_miljoet` fra subkultur-root fordi Blå nå er primær `musikk`.
- Omdøpte musikk-entryen `bla_miljoet_concrete_anchor` til stabil `bla_miljoet`.

## Verifisert før skriving

- Stabile Hausmania-, X-Ray- og Blå-ID-er fantes i root subkultur-fil.
- Hausmania- og X-Ray-concrete-anchor-duplikatene fantes i concrete-anchor-filen.
- Blå concrete-anchor-entryen fantes i musikk-filen.
- Musikk-filen hadde ikke allerede `bla_miljoet`.

## Ikke endret

- Ingen places.
- Ingen manifests.
- Ingen place-index.
- Ingen UI/runtime.
- Ingen quiz.
- Ingen andre people-entryer.

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

## Removed duplicate snapshots

- Hausmania: Hausmania-miljøet / hausmania
- X-Ray: X-Ray Ungdomskulturhus-miljøet / xray_ungdomskulturhus
- Old Blå: Blå-miljøet / bla

## Stable Blå promotion

- Blå-miljøet: `bla_miljoet_concrete_anchor` → `bla_miljoet` in `data/people/musikk/oslo/people_musikk_oslo.json`
