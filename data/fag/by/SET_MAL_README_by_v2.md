# BY – peker til kanonisk quizproduksjon

**Status: pekerfil. Denne filen definerer ingen selvstendige quizregler.**

Start alltid med:

1. `data/quiz/regler/QUIZ_PRODUCTION_CANONICAL.md`
2. `data/fag/fag_manifest.json` med kategorien `by`

Manifestet resolver hele BY-pakken:

- `data/fag/by/pensum_by.json`
- `data/fag/by/emner_by.json`
- `data/fag/by/fagkart_by.json`
- `data/fag/by/methods_by.json`
- `data/fag/by/supersetQUIZMAL_by.json`
- `data/quiz/regler/QUIZ_PRODUCTION_CANONICAL.md`
- `data/quiz/regler/QUIZ_QUESTION_SCHEMA_V2.json`

For hvert aktivt produksjonsmål resolver `quizProduction.targets` dessuten kildegrunnlag, kontekstarterfakt og quizfil. Kildegrunnlaget skal bygges og gjennomgås før spørsmålene skrives.

Kontekst bygges med:

```bash
npm run quiz:context -- --category by --target <targetId>
```

Ved konflikt gjelder den kanoniske produksjonsfilen.
