# Nordre Åsen – moderne Skeid-profiler, batch 2: validering

## Innhold

Fem separate personfiler er lagt til og registrert enkeltvis i `data/people/manifest.json`:

- `tom_nordlie`
- `vilde_mollestad_rislaa`
- `arild_stavrum`
- `mustafa_abdellaoue`
- `daniel_fredheim_holm`

Alle bruker:

- `placeId: nordre_aasen_idrettspark`
- `places: [nordre_aasen_idrettspark]`
- `category: sport`

## Avgrensning

- Ingen eksisterende people-entry er overskrevet.
- Mohammed Abdellaoue er ikke duplisert; han finnes fra før i Ullevaal-settet.
- Ingen place-data, place-ID-er, UI-filer, runtimefiler eller bilder er endret.
- Midlertidig CI-diagnostikk ble fjernet før sluttkontrollen.

## Audit- og toolchain-fikser

Under valideringen ble to eksisterende kompatibilitetsfeil avdekket og rettet:

1. Den delte people/place-loaderen undersøkte wrapperfeltet `places` før den undersøkte om JSON-objektet selv var en kanonisk enkeltoppføring. En personfil kunne derfor bli tolket som en liste med sted-ID-er. Enkeltoppføringer gjenkjennes nå først.
2. `people-image-pipeline.mts` brukte typen `HeadersInit`, som manglet i Node-only tools-konfigurasjonen. En avgrenset Node-kompatibel typedefinisjon er lagt til for tools-byggingen.

## GitHub Actions

Sluttresultat på branch-head etter at midlertidig diagnostikk var fjernet:

- People data: **success**
- Places data: **success**
- TypeScript root typecheck: **success**
- Scripts typecheck/build: **success**
- Tools typecheck/build: **success**

PR-en er dermed validert mot repoets aktive data- og TypeScript-gates.
