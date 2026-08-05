# BY – kanonisk fagverk og quizproduksjon

**Status: canonical pointer, redaksjonell v4.6. Denne filen definerer ingen konkurrerende fagregler.**

## Startrekkefølge

1. `data/quiz/regler/QUIZ_PRODUCTION_CANONICAL.md`
2. `data/fag/fag_manifest.json` med kategorien `by`
3. `data/fag/by/quality_contract_by_v1.json`
4. `data/fag/by/curriculum_architecture_by_v1.json`
5. `data/fag/by/quiz_generator_rules_by_v5_1_source_priority_patch.json`
6. `data/fag/by/source_registry_by_v1.json`

Manifestet resolver den operative BY-pakken: `pensum_by.json`, `emner_by.json`, `fagkart_by.json`, `methods_by.json`, `supersetQUIZMAL_by.json`, felles produksjonsstandard og spørsmåls-/pakkeskjema. De fire redaksjonelle filene over er obligatoriske kvalitetsporter og kan ikke erstattes av eldre README-er eller arkivfiler.

## Autoritet

- **Global produksjonsstandard** styrer språk, format, pakke og felles kildekrav.
- **Fagmanifestet** resolver aktive filer og produksjonsmål.
- **Quality contract** styrer redaksjonell integritet, people/place-evidens og blokkregler.
- **Curriculum architecture** gir den menneskelesbare universitetsstrukturen og progresjonen.
- **Source-priority patch** presiserer at eksterne eller protokollførte observasjonskilder bærer synlig innhold.
- **Source registry** viser om et sted faktisk er kildeklart. `needs_external_source_review` er en blokkstatus, ikke en kilde.

Ved konflikt gjelder den strengeste regelen. Canonical fagfiler er veiledning og struktur, aldri erstatning for dokumentert stedsstoff.

## Produksjon

Kontekst bygges med:

```bash
npm run quiz:context -- --category by --target <targetId>
```

Før publisering skal følgende passere:

```bash
node scripts/validate-by-editorial-integrity.mjs
```

En quiz er ikke publiserbar når `source_refs` mangler, når `claim_basis` bare parafraserer en canonical fagfil, eller når people-of-place-koblingen bare er symbolsk/kuratorisk.
