# History Go quizkort-generator

Dette er et deterministisk utviklerverktøy for å lage rene topp 10-quizkort fra eksisterende quizdata. Verktøyet lager HTML-preview og PNG uten å endre appkode eller quizdata.

## Kjøring

Fra repo-roten:

```bash
node tools/quiz-card-generator/generate_quiz_card.mjs --place kampen_kirke --category by
```

Eksempel for Jernbanetorget:

```bash
node tools/quiz-card-generator/generate_quiz_card.mjs --place jernbanetorget --category by
```

Du kan overstyre tittel og ribbon fra kommandolinjen:

```bash
node tools/quiz-card-generator/generate_quiz_card.mjs \
  --place kampen_kirke \
  --category by \
  --title "KAMPEN KIRKE" \
  --ribbon "BY / KIRKE & NABOLAG"
```

## Input

Generatoren finner quizfilen via `data/quiz/manifest.json`. For `--place kampen_kirke --category by` peker manifestet til `data/quiz/by/kampen_kirke_sets.json`.

Spørsmålene hentes fra `sets[].questions[]` i quizfilen. Scriptet bruker den eksakte spørsmålsteksten og svaralternativene fra JSON, med kun små typografiske normaliseringer som doble mellomrom.

## Output

Generatoren skriver:

- HTML-preview: `tools/quiz-card-generator/output/<placeId>_top10.html`
- PNG: `bilder/kort/quiz/top10/<placeId>_top10.png`

HTML-previewen er den kanoniske layouten og bruker `quiz_card_template.html` + `quiz_card.css`. Hvis Playwright er installert, rendres PNG fra HTML-en i en headless Chromium-side. Hvis Playwright ikke finnes i miljøet, skriver scriptet en gyldig PNG-fallback og logger dette tydelig; HTML-previewen er da fortsatt ferdig layout for visuell kontroll og senere rasterisering.

## Spørsmålsvalg

Når et sted ikke har manuell override, scorer generatoren spørsmål og velger de 10 beste trygge kandidatene. Den prioriterer spørsmål som har:

- `question_scope: "place"`
- `question_type` lik `fact`, `story`, `curiosity`, `observation` eller `comparison`
- ikke-tom `source`
- `question_layer` lik `intro_story` eller `history_place`
- konkrete stedlige/historiske markører som bygning, årstall, person, hendelse, materiale, funksjon eller synlig spor

Generiske teori-/tolkningsspørsmål blir nedprioritert. Hvis færre enn 10 trygge spørsmål finnes, stopper scriptet og skriver hvilke spørsmål som ble vurdert som trygge og hvilke nærmeste kandidater som manglet kvalitet.

## Manuell låsing av topp 10-utvalg

Bruk `tools/quiz-card-generator/top10_overrides.json` når et kort skal kvalitetssikres manuelt. Format:

```json
{
  "kampen_kirke": {
    "title": "KAMPEN KIRKE",
    "ribbon": "BY / KIRKE & NABOLAG",
    "questionIds": [
      "kampen_kirke_quiz_1_1",
      "kampen_kirke_quiz_1_2"
    ]
  }
}
```

`questionIds` må inneholde nøyaktig 10 eksisterende spørsmål. Når feltet finnes, bruker generatoren akkurat disse spørsmålene i akkurat denne rekkefølgen. Filen inneholder eksempel-overrides for `kampen_kirke` og `jernbanetorget`.

## Ribbon og badge

Scriptet har innebygd kategori-/stedmapping for ribbon, blant annet:

- `by + jernbanetorget` → `BY / KNUTEPUNKT`
- `by + kampen_kirke` → `BY / KIRKE & NABOLAG`
- `by + grunerlokka_helgesens_tm` eller `grunerlokka` → `BY / INDUSTRI & BYLIV`
- `by + gronland_basarene` → `BY / HANDEL & HISTORIE`
- `by + bogstadveien` → `BY / HANDEL`

Ukjente steder får `BY / HISTORIE`. Malen bruker en enkel innebygd SVG-badge og en History Go-badge, slik at generatoren virker uten eksterne bildefiler og uten falske fotobakgrunner.

## Deterministisk shuffle og fasit

Svaralternativene shuffles deterministisk per `placeId`, `questionId` og shuffle-forsøk. Etter shuffle beregner scriptet fasit ved å finne hvilket A/B/C-alternativ som matcher riktig svartekst.

For et 10-spørsmålskort krever generatoren at:

- A, B og C alle brukes minst én gang som riktig bokstav.
- Ingen bokstav har mer enn 5 riktige svar.

Hvis første shuffle gir dårlig fordeling, prøver scriptet nye deterministiske seed-varianter. Hvis ingen god fordeling finnes etter flere forsøk, stopper scriptet med en tydelig feilmelding i stedet for å lage et ubalansert kort.
