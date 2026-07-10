# Bilder av personer

History Go skal ikke vise tilfeldige bilder direkte fra Google eller andre søkemotorer. Søkeresultater dokumenterer ikke bruksrett, er ustabile og kan føre til hotlinking.

## Godkjente kilder

Automatisk kandidatinnhenting bruker Wikidata og Wikimedia Commons. Bare følgende lisenser kan gå videre til manuell godkjenning:

- Public Domain
- CC0
- CC BY
- CC BY-SA

Andre eller uklare lisenser avvises. Et bilde publiseres aldri automatisk bare fordi det finnes i Commons.

## Arbeidsflyt

1. Kjør `npm run people:images:candidates`.
2. Åpne `data/people/people_image_candidates.json`.
3. Kontroller identitet, motiv, opphav, lisens og om beskjæring er tillatt.
4. Sett `approvedCandidateIndex` på raden som er kontrollert.
5. Kjør `npm run people:images:apply` for dry-run.
6. Kjør `npm run people:images:apply:write` for å laste ned bildet lokalt og oppdatere persondata.

Skriptet skriver `image`, `cardImage` og `imageMeta`. Bilder lagres lokalt under `bilder/people/auto/`; appen er dermed ikke avhengig av ekstern hotlinking.

## Metadata

`imageMeta` skal minst inneholde kilde, Commons-side, opphavsperson, lisens, lisenslenke, hentet dato og godkjenningsstatus.

## Fallback

Når et trygt bilde ikke finnes, skal grensesnittet vise en nøytral History Go-placeholder eller initialer. En illustrasjon, statue eller senere kunstnerisk fremstilling må merkes som illustrasjon og ikke presenteres som autentisk portrett.
