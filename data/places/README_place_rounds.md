# PlaceCard-rundinger (`rounds`)

PlaceCard-rundinger er datastyrte per sted. Bruk feltet `rounds` på et sted
for å velge hvilke hovedrundinger/ikoner som skal vises, og i hvilken rekkefølge.
`rundinger` støttes som alias for eldre/norske data.

## Gyldige id-er

Canonical PlaceCard-round ids er:

- `people`
- `nature`
- `badges`
- `civication`
- `brands`
- `leksikon`
- `routes`
- `music`
- `football`

`lexicon` støttes kun som bakoverkompatibelt alias til canonical id `leksikon`.
Nye data skal bruke `leksikon`.

## Standard-fallback

Når et sted mangler både `rounds` og `rundinger`, bruker PlaceCard standardsettet:

```json
["people", "nature", "badges", "civication", "brands", "leksikon", "routes"]
```

`music` og `football` vises bare når stedet deklarerer dem eksplisitt i `rounds`
/ `rundinger`.

## Leksikon samler kunnskapsrundingen

Stories/Fortellinger, Lesespor, Wonderkammer, Språkleksikon og øvrige
leksikon-/kunnskapsobjekter ligger under Leksikon-rundingen. De skal ikke legges
inn som egne PlaceCard-hovedrundinger eller egne hovedikoner.

Eksempel:

```json
{
  "id": "torggata",
  "rounds": ["leksikon", "brands", "badges", "routes"]
}
```

## Kodekontrakt

- `PLACE_ROUND_REGISTRY` — eneste kilde for kjente rundinger (id, label,
  ikon-DOM, liste-DOM, alias og kind).
- `getPlaceRounds(place)` — leser `rounds`/`rundinger`, normaliserer alias og
  filtrerer ukjente id-er.
- `applyPlaceRounds(place)` — viser/skjuler PlaceCard-ikonene per sted.
