# Batch 52 — by/oslo first five asset production pack

Dato: 2026-06-02

## Scope

Batch 52 gjelder bare første konkrete produksjonsrunde for fem Gruppe A-assets. Dette er ikke en asset-commit-batch, og ingen faktiske bilder, place-data, index-filer, scripts/tools, CSS/HTML/JS eller canonical-filer ble endret.

Tillatt endringsomfang for denne batchen er kun:

- `reports/oslo-place-audit-batch-52-by-oslo-first-five-asset-production-pack.md`
- `reports/by-oslo-first-five-asset-production-pack-batch-52.json`

## Commands run

- `npm run health:places`
- `npm run places:emner:check`
- `npm run places:index:check`
- `python3 -m json.tool reports/by-oslo-first-five-asset-production-pack-batch-52.json`

## Baseline after Batch 51

- `health:places`: Errors 0
- `health:places`: Warnings 1085
- `places:emner:check`: OK
- `places:index:check`: OK

## Source files read

- `reports/by-oslo-asset-intake-manifest-batch-51.json`
- `reports/oslo-place-audit-batch-51-by-oslo-asset-intake-review-plan.md`
- `reports/by-oslo-asset-generation-queue-batch-50.json`
- `reports/oslo-place-audit-batch-50-by-oslo-asset-generation-prompts.md`
- `data/places/by/oslo/places_by.json`

## Batch 52 asset list

1. `torggata.cardImage` → `bilder/kort/places/by/torggata_CardImage.PNG`
2. `barcode.image` → `bilder/places/barcode.PNG`
3. `barcode.cardImage` → `bilder/kort/places/barcode.PNG`
4. `bogstadveien.image` → `bilder/places/bogstadveien.JPG`
5. `bogstadveien.cardImage` → `bilder/kort/places/bogstadveien.PNG`

## Shared production policy

- `bilder/QuizCards/**` skal ikke brukes for `image`, `cardImage` eller `frontImage`.
- `ImageCard` / `imageCard` skal ikke brukes, innføres eller bygges videre på.
- `image` skal bruke canonical place assets under `bilder/places/**`.
- `cardImage` skal bruke dedikerte card assets under `bilder/kort/places/**`.
- Samme asset skal ikke brukes både som `image` og `cardImage` uten eksplisitt senere beslutning.
- Bildene skal ikke ha tekst, labels, logo-fokus, ramme, typografi, quizkort-layout eller History Go card-surface.

## Local intake status

`_asset_intake/by-oslo-batch-50/` finnes ikke lokalt i arbeidskopien. Alle fem assets står derfor som `not_generated_yet`.

## Asset prompts and review package

### Torggata — `torggata.cardImage`

- Exact target path: `bilder/kort/places/by/torggata_CardImage.PNG`
- Expected filename: `torggata_CardImage.PNG`
- Expected format: `PNG`
- Required dimensions: minimum 1600x800
- Orientation: landscape 2:1 card-friendly crop
- Asset type: `dedicated_card_image`
- Commit readiness status: `not_generated_yet`
- Approved for commit: `false`

#### Prompt NB

Lag et realistisk dokumentarisk bilde av Torggata i Oslo som en urban gateakse med handel, servering, syklister og fotgjengere. Vis sentrumsgatepreg, oppgradert gateprofil, fortausliv og spenningen mellom råere fortid og kuratert nåtid uten å gjøre skilttekst lesbar. Naturlig nordisk dagslys, norsk bymiljø, tydelig stedskarakter og troverdig menneskelig aktivitet der det passer. no text in image, no labels, no logo focus, no quiz card layout, no frame, no typography, realistic documentary style.

#### Prompt EN

Create a realistic documentary image of Torggata in Oslo as an urban street axis with commerce, cafes, cyclists, and pedestrians. Show a central Oslo street character, upgraded street profile, sidewalk life, and the tension between a rougher past and a curated present without readable signage. Use natural Nordic daylight, an Oslo urban environment, clear place character, and believable human activity where appropriate. no text in image, no labels, no logo focus, no quiz card layout, no frame, no typography, realistic documentary style.

#### Quality checklist

- exact target_path planned
- correct place or correct historical/documentary visualization
- no text
- no labels
- no logo focus
- no quiz card layout
- no frame
- no typography
- not QuizCards
- not ImageCard/imageCard
- format matches target_path
- no obvious AI artifacts
- readable composition
- for cardImage: works in wide 2:1 card format
- for image: works as ordinary place image

#### Reject criteria

- contains visible generated text or labels
- looks like a quiz card
- contains History Go frame or card layout
- uses QuizCards source
- uses ImageCard/imageCard
- wrong place
- generic unrelated city
- severe AI artifacts
- wrong file format
- wrong aspect/crop for intended field
- unreadable/cropped main subject

#### Notes

No matching local intake file found in _asset_intake/by-oslo-batch-50; not generated yet. Batch 52 production pack only; do not commit asset files or update place data until a later manual review batch approves the exact generated file.

### Barcode — `barcode.image`

- Exact target path: `bilder/places/barcode.PNG`
- Expected filename: `barcode.PNG`
- Expected format: `PNG`
- Required dimensions: minimum 1600x1000
- Orientation: landscape wide photo format
- Asset type: `ordinary_place_image`
- Commit readiness status: `not_generated_yet`
- Approved for commit: `false`

#### Prompt NB

Lag et realistisk dokumentarisk bilde av Barcode-rekken i Bjørvika som moderne byutvikling og markant høyhusrekke. Vis rekkelogikken som gir strekkodepreg, moderne næringsbygg, skyline og byrom ved gateplan. Naturlig nordisk dagslys, norsk bymiljø, tydelig stedskarakter og troverdig menneskelig aktivitet der det passer. no text in image, no labels, no logo focus, no quiz card layout, no frame, no typography, realistic documentary style.

#### Prompt EN

Create a realistic documentary image of the Barcode row in Bjørvika as modern urban development and a distinctive high-rise sequence. Show the barcode-like row logic, modern office architecture, skyline, and street-level urban space. Use natural Nordic daylight, an Oslo urban environment, clear place character, and believable human activity where appropriate. no text in image, no labels, no logo focus, no quiz card layout, no frame, no typography, realistic documentary style.

#### Quality checklist

- exact target_path planned
- correct place or correct historical/documentary visualization
- no text
- no labels
- no logo focus
- no quiz card layout
- no frame
- no typography
- not QuizCards
- not ImageCard/imageCard
- format matches target_path
- no obvious AI artifacts
- readable composition
- for cardImage: works in wide 2:1 card format
- for image: works as ordinary place image

#### Reject criteria

- contains visible generated text or labels
- looks like a quiz card
- contains History Go frame or card layout
- uses QuizCards source
- uses ImageCard/imageCard
- wrong place
- generic unrelated city
- severe AI artifacts
- wrong file format
- wrong aspect/crop for intended field
- unreadable/cropped main subject

#### Notes

No matching local intake file found in _asset_intake/by-oslo-batch-50; not generated yet. Batch 52 production pack only; do not commit asset files or update place data until a later manual review batch approves the exact generated file.

### Barcode — `barcode.cardImage`

- Exact target path: `bilder/kort/places/barcode.PNG`
- Expected filename: `barcode.PNG`
- Expected format: `PNG`
- Required dimensions: minimum 1600x800
- Orientation: landscape 2:1 card-friendly crop
- Asset type: `dedicated_card_image`
- Commit readiness status: `not_generated_yet`
- Approved for commit: `false`

#### Prompt NB

Lag et realistisk dokumentarisk bilde av Barcode i Bjørvika i et bredt kortvennlig utsnitt med tydelig skyline og arkitekturrekke. La høyhusrekken fylle bildet horisontalt med synlig rytme, mellomrom, glassflater og urbant gateplan. Naturlig nordisk dagslys, norsk bymiljø, tydelig stedskarakter og troverdig menneskelig aktivitet der det passer. no text in image, no labels, no logo focus, no quiz card layout, no frame, no typography, realistic documentary style.

#### Prompt EN

Create a realistic documentary image of Barcode in Bjørvika in a wide card-friendly composition with a clear skyline and architectural row. Let the high-rise sequence fill the image horizontally with visible rhythm, gaps, glass facades, and urban street level. Use natural Nordic daylight, an Oslo urban environment, clear place character, and believable human activity where appropriate. no text in image, no labels, no logo focus, no quiz card layout, no frame, no typography, realistic documentary style.

#### Quality checklist

- exact target_path planned
- correct place or correct historical/documentary visualization
- no text
- no labels
- no logo focus
- no quiz card layout
- no frame
- no typography
- not QuizCards
- not ImageCard/imageCard
- format matches target_path
- no obvious AI artifacts
- readable composition
- for cardImage: works in wide 2:1 card format
- for image: works as ordinary place image

#### Reject criteria

- contains visible generated text or labels
- looks like a quiz card
- contains History Go frame or card layout
- uses QuizCards source
- uses ImageCard/imageCard
- wrong place
- generic unrelated city
- severe AI artifacts
- wrong file format
- wrong aspect/crop for intended field
- unreadable/cropped main subject

#### Notes

No matching local intake file found in _asset_intake/by-oslo-batch-50; not generated yet. Batch 52 production pack only; do not commit asset files or update place data until a later manual review batch approves the exact generated file.

### Bogstadveien — `bogstadveien.image`

- Exact target path: `bilder/places/bogstadveien.JPG`
- Expected filename: `bogstadveien.JPG`
- Expected format: `JPG`
- Required dimensions: minimum 1600x1000
- Orientation: landscape wide photo format
- Asset type: `ordinary_place_image`
- Commit readiness status: `not_generated_yet`
- Approved for commit: `false`

#### Prompt NB

Lag et realistisk dokumentarisk bilde av Bogstadveien i Oslo som handlegate med butikker, brede fortau, byliv og vestkantpreg. Vis kommersiell gateaktivitet, gående, servering eller butikkfronter uten lesbare logoer, og et tydelig urbant vestkantmiljø. Naturlig nordisk dagslys, norsk bymiljø, tydelig stedskarakter og troverdig menneskelig aktivitet der det passer. no text in image, no labels, no logo focus, no quiz card layout, no frame, no typography, realistic documentary style.

#### Prompt EN

Create a realistic documentary image of Bogstadveien in Oslo as a shopping street with storefronts, broad sidewalks, urban life, and a west-side city character. Show commercial street activity, pedestrians, cafes or shopfronts without readable logos, and a distinctly urban west-side Oslo environment. Use natural Nordic daylight, an Oslo urban environment, clear place character, and believable human activity where appropriate. no text in image, no labels, no logo focus, no quiz card layout, no frame, no typography, realistic documentary style.

#### Quality checklist

- exact target_path planned
- correct place or correct historical/documentary visualization
- no text
- no labels
- no logo focus
- no quiz card layout
- no frame
- no typography
- not QuizCards
- not ImageCard/imageCard
- format matches target_path
- no obvious AI artifacts
- readable composition
- for cardImage: works in wide 2:1 card format
- for image: works as ordinary place image

#### Reject criteria

- contains visible generated text or labels
- looks like a quiz card
- contains History Go frame or card layout
- uses QuizCards source
- uses ImageCard/imageCard
- wrong place
- generic unrelated city
- severe AI artifacts
- wrong file format
- wrong aspect/crop for intended field
- unreadable/cropped main subject

#### Notes

No matching local intake file found in _asset_intake/by-oslo-batch-50; not generated yet. Batch 52 production pack only; do not commit asset files or update place data until a later manual review batch approves the exact generated file.

### Bogstadveien — `bogstadveien.cardImage`

- Exact target path: `bilder/kort/places/bogstadveien.PNG`
- Expected filename: `bogstadveien.PNG`
- Expected format: `PNG`
- Required dimensions: minimum 1600x800
- Orientation: landscape 2:1 card-friendly crop
- Asset type: `dedicated_card_image`
- Commit readiness status: `not_generated_yet`
- Approved for commit: `false`

#### Prompt NB

Lag et realistisk dokumentarisk bilde av Bogstadveien i et bredt kortvennlig utsnitt som viser handlegate, fortausliv, butikker og vestkantpreg. Prioriter en horisontal gateakse med mennesker i bevegelse og opphold, men uten lesbar skilttekst eller merkevarefokus. Naturlig nordisk dagslys, norsk bymiljø, tydelig stedskarakter og troverdig menneskelig aktivitet der det passer. no text in image, no labels, no logo focus, no quiz card layout, no frame, no typography, realistic documentary style.

#### Prompt EN

Create a realistic documentary image of Bogstadveien in a wide card-friendly view showing a shopping street, sidewalk life, storefronts, and west-side Oslo character. Prioritize a horizontal street-axis composition with people walking and lingering, but without readable signage or brand focus. Use natural Nordic daylight, an Oslo urban environment, clear place character, and believable human activity where appropriate. no text in image, no labels, no logo focus, no quiz card layout, no frame, no typography, realistic documentary style.

#### Quality checklist

- exact target_path planned
- correct place or correct historical/documentary visualization
- no text
- no labels
- no logo focus
- no quiz card layout
- no frame
- no typography
- not QuizCards
- not ImageCard/imageCard
- format matches target_path
- no obvious AI artifacts
- readable composition
- for cardImage: works in wide 2:1 card format
- for image: works as ordinary place image

#### Reject criteria

- contains visible generated text or labels
- looks like a quiz card
- contains History Go frame or card layout
- uses QuizCards source
- uses ImageCard/imageCard
- wrong place
- generic unrelated city
- severe AI artifacts
- wrong file format
- wrong aspect/crop for intended field
- unreadable/cropped main subject

#### Notes

No matching local intake file found in _asset_intake/by-oslo-batch-50; not generated yet. Batch 52 production pack only; do not commit asset files or update place data until a later manual review batch approves the exact generated file.

## Batch 52 confirmations

- Ingen bilder ble lagt inn i repoet.
- Ingen filer under `bilder/**` ble endret.
- Ingen datafiler under `data/places/**` ble endret.
- `data/places/places_index.json` ble ikke endret.
- Ingen scripts/tools ble endret.
- Ingen CSS/HTML/JS ble endret, og `js/ui/place-card.js` ble ikke endret.
- `bilder/QuizCards/**` brukes ikke i denne produksjonspakken.
- `ImageCard` / `imageCard` brukes ikke i denne produksjonspakken.
- Manifestet fra Batch 51 ble bare lest og ikke endret.
- Gruppe B og de resterende 15 asset entries behandles ikke i Batch 52.

## Recommended Batch 53

Hvis faktiske bildefiler er generert og manuelt godkjent:

`Batch 53: add first five reviewed by/oslo asset files without data changes`

Hvis bildefiler fortsatt ikke finnes:

`Batch 53: generate first five by/oslo asset files externally and review them`
