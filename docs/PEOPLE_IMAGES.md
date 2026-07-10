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

1. Kjør `node scripts/people-images.mjs audit` for status.
2. Kjør `node scripts/people-images.mjs candidates --limit=50` for å lage kandidater.
3. Åpne `data/people/people_image_candidates.json`.
4. Kontroller identitet, motiv, opphav, lisens og om beskjæring er tillatt.
5. Sett `approved: true` på nøyaktig den kandidaten som er kontrollert.
6. Kjør `node scripts/people-images.mjs apply` for dry-run.
7. Kjør `node scripts/people-images.mjs apply --write` for å laste ned bildet lokalt og oppdatere persondata.

Kandidatkommandoen støtter også `--ids=id1,id2` og `--include-existing`. Apply er alltid dry-run uten `--write`.

Pipelinen skriver `image`, `cardImage`, `wikidataId` og `imageMeta`. Bilder lagres lokalt under `bilder/kort/people/`; appen er dermed ikke avhengig av ekstern hotlinking. En samlet krediteringsfil skrives til `data/people/people_image_attributions.json`.

## Metadata

`imageMeta` skal minst inneholde kilde, Commons-side, opphavsperson, lisens, lisenslenke, hentet dato og godkjenningsstatus.

## Sikkerhetsregler

- Google Images kan brukes til research, men aldri som produksjonskilde.
- Eksterne bilde-URL-er skal ikke lagres i `image` eller `cardImage`.
- Kandidater uten godkjent lisens kan ikke brukes selv om `approved` settes ved en feil.
- Identiteten må kontrolleres manuelt; navnelikhet alene er ikke nok.
- Nålevende personer krever samme lisenskontroll som historiske personer.

## Fallback

Når et trygt bilde ikke finnes, skal grensesnittet vise en nøytral History Go-placeholder eller initialer. En illustrasjon, statue eller senere kunstnerisk fremstilling må merkes som illustrasjon og ikke presenteres som autentisk portrett.
