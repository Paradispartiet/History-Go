# People-bilder

Produksjonskilden er Wikidata og Wikimedia Commons. Google Images brukes ikke: søkeresultater er ikke en lisenskilde, gir ofte kopier fra tilfeldige nettsteder og kan ikke gi stabil attribusjon.

## Flyt

1. `npm run people:images:candidates -- --limit=25` leser `data/people/manifest.json`, støtter både `{ "people": [] }`, vanlige arrays og enkeltpersonfiler, søker Wikidata og prioriterer P18-bildet.
2. Commons-metadata hentes for bildet og bare kandidater med godkjent lisens skrives til `data/people/people_image_candidates.json` med `approved: false`.
3. Redaktør kontrollerer Commons-siden manuelt og setter `approved: true` for valgte kandidater.
4. `npm run people:images:apply` er dry-run og skriver ingenting.
5. `npm run people:images:apply:write` validerer kandidaten på nytt, laster ned bildet fra Wikimedia Commons og lagrer lokalt under `bilder/kort/people/`.
6. `data/people/people_image_attributions.json` regenereres deterministisk fra people-data.

## Lisensport

Tillatt: Public Domain, CC0, CC BY og CC BY-SA. Avvist: CC BY-NC, CC BY-ND, CC BY-NC-SA, CC BY-NC-ND, redaksjonell bruk, all rights reserved, tom/ukjent lisens og uklare betingelser. Porten kjøres både ved kandidatinnhenting og apply.

## Sikkerhet og attribusjon

Manifeststier må være `people/...` og løses kun under `data/people/`. Apply krever `approved: true`, entydig personmatch, Commons-URL, godkjent lisens og creator/credit/license/licenseUrl. `image` og `cardImage` får aldri ekstern URL, bare lokal fil. Eksisterende lokale bilder overskrives ikke.

Attribusjon lagres i `imageMeta` med Commons-side, creator, credit, license og licenseUrl. Kunstneriske fremstillinger skal merkes tydelig i eksisterende personfelt/tekst før godkjenning dersom bildet ikke er et fotografisk portrett.

Personer uten bilde skal bruke eksisterende initialer/placeholder i UI. Nye bildeleverandører kan legges til senere bare ved å normalisere metadata til samme kandidatformat og kjøre samme lisensport ved både kandidat- og apply-steg.

## Kommandoer

- `npm run people:images:candidates -- --limit=25 [--ids=id1,id2] [--include-existing]`
- `npm run people:images:apply`
- `npm run people:images:apply:write`
- `npm run people:images:audit`
