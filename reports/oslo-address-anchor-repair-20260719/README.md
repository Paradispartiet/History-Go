# Oslo address anchor repair — Torggata, Storgata og Torggata Blad

## Bakgrunn

Denne reparasjonen gjenopptar den normative Geonorge-løypen fra de vellykkede adressebatchene og erstatter den senere gategeometri/status-tilnærmingen som lot feil hovedkoordinater stå.

## Anvendte adresseankre

- `torggata` → **Torggata 22, Oslo** — `geonorge-adresser-v1:0301:17635:22` — `59.916435093332616, 10.752031295338192`.
- `storgata` → **Storgata 26, Oslo** — `geonorge-adresser-v1:0301:17059:26` — `59.91394825604604, 10.751953875941378`.
- `torggata_blad` → historisk redaksjonssted **Hausmannsgate 19, 6. etasje**, dokumentert i Torggata Blads egne 2007–2008-utgaver. Dagens offisielle **Hausmanns gate 19A** brukes som displayanker — `geonorge-adresser-v1:0301:12782:19A` — `59.91657334372696, 10.75561428991178`.

Det generiske Geonorge-oppslaget `Hausmanns gate 19 Oslo` returnerte både 19A og 19B og ble derfor avvist som `needs_review`. Primærpublikasjonene dokumenterer nummer 19 og 6. etasje, men ikke dagens A/B-bokstav. Bruken av 19A er derfor eksplisitt registrert som en moderne adresse-normalisering for det historiske kontorstedet, ikke som et historisk sitat.

## Gate-regel

For Torggata og Storgata dokumenterer Oslo byleksikon selve gateløpet. Geonorge-adressepunktet brukes som en konkret representativ hovedmarkør innenfor gateløpet. `locatorType` forblir derfor `street`, `coordRole` er `line_anchor`, og koordinatet er ikke et beregnet midtpunkt.

## Faktisk markørflytting

Sammenlignet med de tidligere runtime-koordinatene flyttet markørene seg:

- `torggata`: **141 m**
- `storgata`: **194 m**
- `torggata_blad`: **215 m**

Kilde, splitfil, aggregat, kategoriindeks og global `places_index.json` er synkronisert.

## Validering

Bestått på sluttdata:

- eksakt Geonorge address-first: tre entydige `verified_candidate`
- split/manifest-paritet
- global place-index-paritet
- coordinate source contract
- coordinate quality gate
- strict coordinate intake
- coordinate evidence audit
- `git diff --check`

## Visuell kart-QA

Branchens faktiske `data/places/places_index.json` ble rendret i Chromium på OpenStreetMap-bakgrunn med gammel og ny markør samtidig. Alle tre kartbilder ble kontrollert visuelt før merge:

- Torggata: ny runtime-markør ligger på Torggata 22-strekningen og er tydelig flyttet fra det tidligere midtpunktet.
- Storgata: ny runtime-markør ligger ved Storgata 26 og er tydelig flyttet sørover fra det tidligere midtpunktet.
- Torggata Blad: ny runtime-markør ligger ved Hausmanns gate 19A-ankeret og er tydelig flyttet fra den feilaktige Torggata-markøren.

## Hard gate

Ingen koordinatendring godtas dersom repoets normative adressefinner ikke returnerer ett entydig `verified_candidate`. Et generisk eller tvetydig adresseoppslag skal aldri brukes ved å velge første eller nærmeste treff.
