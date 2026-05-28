# History Go quizkort-generator

Dette er et deterministisk utviklerverktøy for å lage **History Go topp 10-quizkort** fra eksisterende quizdata. Verktøyet er ikke app-UI, og det endrer ikke quizdataene.

## Kjøring

Fra repo-roten:

```bash
node tools/quiz-card-generator/generate_quiz_card.mjs --place kampen_kirke --category by
```

Eksempel for Jernbanetorget:

```bash
node tools/quiz-card-generator/generate_quiz_card.mjs --place jernbanetorget --category by
```

## Input

Generatoren slår først opp `place` og `category` i:

```text
data/quiz/manifest.json
```

Deretter leser den quizfilen manifestet peker på, for eksempel:

```text
data/quiz/by/kampen_kirke_sets.json
data/quiz/by/jernbanetorget_sets.json
```

## Output

Generatoren skriver:

```text
tools/quiz-card-generator/output/<placeId>_top10.html
```

I tillegg skriver den en SVG-kilde ved siden av HTML-previewen:

```text
tools/quiz-card-generator/output/<placeId>_top10.svg
```

PNG-filen skrives til:

```text
bilder/kort/quiz/top10/<placeId>_top10.png
```

HTML-previewen inneholder den faktiske SVG-layouten med tekst, badges, ribbon, svaralternativer og fasit. PNG-filen lages deterministisk uten bildegenerering, slik at byggesteg og filnavn er stabile også i miljøer uten nettleserbasert renderer.

## Manuell overstyring av tittel, ribbon og topp 10-utvalg

Bruk filen:

```text
tools/quiz-card-generator/top10_overrides.json
```

Format:

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

Når `questionIds` finnes for et sted, bruker generatoren akkurat disse spørsmålene i oppgitt rekkefølge. Listen må ha nøyaktig 10 spørsmål. Dette er anbefalt når et kort er kvalitetssikret manuelt og utvalget skal låses.

Du kan også overstyre tittel og ribbon fra kommandolinjen:

```bash
node tools/quiz-card-generator/generate_quiz_card.mjs \
  --place kampen_kirke \
  --category by \
  --title "KAMPEN KIRKE" \
  --ribbon "BY / KIRKE & NABOLAG"
```

## Automatisk spørsmålsvalg

Hvis et sted ikke har `questionIds` i override-filen, vurderer scriptet alle spørsmål i quizfilen og velger de 10 tryggeste. Det prioriterer spørsmål som har:

- `question_scope: "place"`
- `question_type` som er `fact`, `story`, `curiosity`, `observation` eller `comparison`
- ikke-tom `source`
- `question_layer` som er `intro_story` eller `history_place`
- tekst/kunnskapsfelt som peker på konkret stedshistorie, bygning, årstall, person, hendelse, materiale, funksjon eller synlig spor

Generiske teori-/tolkningsspørsmål nedprioriteres. Hvis færre enn 10 trygge spørsmål finnes, stopper scriptet med en feilmelding som viser hvilke spørsmål som ble valgt og hvorfor det mangler nok gode spørsmål.

## Deterministisk shuffle og fasit

For hvert spørsmål normaliseres tekst forsiktig uten å endre fakta:

- doble mellomrom fjernes
- mellomrom før tegnsetting ryddes
- norske tegn beholdes

Svaralternativene shuffles med en deterministisk seed basert på `placeId`, `questionId` og shuffle-forsøk. Etter shuffle finner scriptet hvilket alternativ som matcher `answer`, og fasiten beregnes fra den nye posisjonen.

Scriptet godtar bare et kort når fasitfordelingen er naturlig:

- A, B og C må alle brukes
- ingen bokstav kan ha mer enn 5 riktige svar på et 10-spørsmålskort

Hvis fordelingen ikke er god nok, prøver generatoren en ny deterministisk seed. Etter 250 mislykkede forsøk stopper den med en tydelig feilmelding.

## Badge og ribbon

Generatoren har innebygget mapping for kjente steder, blant annet:

- `by + jernbanetorget` → `BY / KNUTEPUNKT`
- `by + kampen_kirke` → `BY / KIRKE & NABOLAG`
- `by + grunerlokka` → `BY / INDUSTRI & BYLIV`
- `by + gronland_basarene` → `BY / HANDEL & HISTORIE`
- `by + bogstadveien` → `BY / HANDEL`

Hvis et sted mangler mapping, brukes `BY / HISTORIE`. Malen bruker en enkel SVG-badge direkte i kortet, slik at generatoren virker uten eksterne bildefiler og uten falsk fotobakgrunn.
