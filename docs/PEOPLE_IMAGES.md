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


## GitHub Actions-kandidatkjøring

GitHub-hosted Actions-runneren er den autoritative nettverkskjøringen for people-image-kandidatinnhenting. Codex-runtime kan ha DNS-/proxybegrensninger mot Wikidata og Wikimedia Commons, for eksempel `getaddrinfo EAI_AGAIN www.wikidata.org`, og skal derfor ikke brukes til live kandidatinnhenting.

1. Åpne GitHub-repoet.
2. Gå til Actions.
3. Velg **Build people image candidates**.
4. Trykk **Run workflow**.
5. Angi people-ID-er og `limit`.
6. La `open_draft_pr` være av ved ren test.
7. Last ned artifactet `people-image-candidates-<run_id>` og kontroller rapportene.
8. Bruk draft-PR bare etter en vellykket og ikke-tom kandidatbatch.
9. Ingen kandidater skal godkjennes i selve workflowen; alle kandidater skal fortsatt ha `approved: false` og må gjennom manuell identitets- og lisenskontroll før apply.

Workflowen kjører DNS-/HTTP-sjekker mot npm, Wikidata og Wikimedia Commons før verktøykjeden installeres og kandidatinnhentingen starter. Ved feil stopper workflowen uten å endre kandidatfila eller opprette branch/PR, men rapport-artifactet lastes fortsatt opp for feilsøking. Når `open_draft_pr` er aktivert etter en grønn kjøring, committes bare kandidatfila og de korte verifikasjonsrapportene til en `automation/people-image-candidates-<run_id>`-branch, og det åpnes en draft-PR mot `main`. Workflowen pusher aldri direkte til `main`, merger aldri PR-en og kjører ikke apply eller bildenedlasting.

## Kommandoer

- `npm run people:images:candidates -- --limit=25 [--ids=id1,id2] [--include-existing]`
- `npm run people:images:apply`
- `npm run people:images:apply:write`
- `npm run people:images:audit`
