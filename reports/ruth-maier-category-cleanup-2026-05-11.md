# Ruth Maier – kategorirydding

## Konklusjon

Ruth Maier skal ha `historie` som hovedkategori i History Go.

Begrunnelse:

- Hun er først og fremst relevant gjennom Holocaust, okkupasjon, deportasjonen av norske jøder, minnekultur og dagbøker som historiske kilder.
- Dagbøkene gjør henne relevant for litteratur og dokumentasjon, men dette er en sekundær tag/fagkobling, ikke hovedkategori.

## Korrekt hovedplassering

Riktig hovedpersonfil:

- `data/people/people_historie.json`

Riktig nåværende batch:

- `data/people/people_historie_next_batch_01.json`

Riktig place-batch:

- `data/places/historie/oslo/places_historie_next_batch_ruth_maier_01.json`

## Korrekt modell

Anbefalt people-entry skal ha:

```json
"id": "ruth_maier",
"category": "historie",
"tags": ["historie", "krig", "minne", "litteratur"]
```

`litteratur` kan beholdes som tag fordi dagbøkene er tekstlige kilder, men `category` skal være `historie`.

## Opprydding ved senere merge

Før endelig merge må repoet sjekkes for eksisterende Ruth Maier-forekomster i:

- `data/people/people_litteratur.json`
- `data/places/litteratur/oslo/places_litteratur.json`
- legacy `data/people.json`
- relevante quiz-/leksikonfiler

Hvis `ruth_maier` finnes i litteratur, skal hun ikke dupliseres som egen litteraturperson. Hun skal enten:

1. flyttes til historie, eller
2. beholdes kun i historie og gis `litteratur` som tag.

## Viktig arbeidsregel

Ikke overskriv store people-filer fra trunkerte GitHub-lesninger.

`people_litteratur.json` og `people_historie.json` kan være lange nok til at verktøyresponsen avkortes. Bruk derfor trygg JSON-merge, lokal skriptmerge eller direkte redigering i GitHub når Ruth Maier normaliseres.
