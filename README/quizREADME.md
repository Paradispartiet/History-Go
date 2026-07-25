# History GO — quizdokumentasjon

Status: **operational compatibility-pointer**  
Sist kontrollert: **2026-07-25**

Dette filnavnet beholdes fordi eldre dokumenter og arbeidsflyter fortsatt peker til `README/quizREADME.md`.

Filen er ikke lenger en parallell fasit for quizproduksjon, runtime, Knowledge, observations eller popup-oppførsel.

## Autoritetsrekkefølge

1. [`data/quiz/regler/QUIZ_PRODUCTION_CANONICAL.md`](../data/quiz/regler/QUIZ_PRODUCTION_CANONICAL.md) — eneste bindende produksjonsprosedyre
2. [`data/quiz/regler/QUIZ_NORMAL_OPENING_POLICY_V1.json`](../data/quiz/regler/QUIZ_NORMAL_OPENING_POLICY_V1.json) — global 2 × 7-åpning
3. [`data/fag/fag_manifest.json`](../data/fag/fag_manifest.json) — kategoriens filresolver og aktive `quizProduction.targets`
4. kategoriens `required_inputs` fra fagmanifestet
5. [`data/quiz/regler/QUIZ_QUESTION_SCHEMA_V2.json`](../data/quiz/regler/QUIZ_QUESTION_SCHEMA_V2.json) — spørsmålskontrakt
6. [`data/quiz/regler/QUIZ_PACKAGE_SCHEMA_V1.json`](../data/quiz/regler/QUIZ_PACKAGE_SCHEMA_V1.json) — pakkekontrakt og `production_context`
7. [`data/quiz/manifest.json`](../data/quiz/manifest.json) — runtime-aktivering av quizfiler og target-bundne sett

Runtime-eierskap, learning-log-grenser og progresjonskjeden dokumenteres i:

- [`SYSTEM_REGISTRY_SUBSYSTEM_CONTRACTS.md`](./SYSTEM_REGISTRY_SUBSYSTEM_CONTRACTS.md)
- [`SYSTEM_MAP.md`](./SYSTEM_MAP.md)

## Produksjonsløp

```text
kategori og mål
→ fagmanifest
→ full fagpakke
→ gjennomgåtte eksterne kilder
→ påstandsbank
→ faglig utvalg
→ adaptiv profil
→ settplan
→ spørsmål
→ audits
→ Knowledge
```

Start kontekstbyggeren med:

```bash
npm run quiz:context -- --category <categoryId> --target <targetId>
```

Kjør minst:

```bash
npm run audit:quiz-content
npm run audit:quiz-templates
npm run audit:quiz-production-context
npm run audit:quiz-progression
npm run audit:quiz-theory-binding
npm run test:quiz-content-audit
```

## Ufravikelige regler

- Eksterne, gjennomgåtte kilder og konkrete observasjoner bærer synlige påstander.
- Pensum, emner, fagkart, metoder og superset styrer utvalg og progresjon; de er ikke faktakilder.
- Sett 1 og 2 skal ha sju normale, direkte og kildebelagte spørsmål hver.
- Teori og eksplisitt metode kan tidligst drive spørsmål fra sett 3.
- Profilen skal reduseres når kildegrunnlaget ikke bærer planlagt lengde.
- Nye og fullt reviderte pakker skal lagre faktisk `production_context`.
- En quizfil eller set-pakke er ikke runtime-aktiv før den er registrert i `data/quiz/manifest.json`.
- Ikke gjeninnfør produksjonsregler, balanser eller generatorpatcher i denne compatibility-filen.

## Historikk

Den tidligere 913-linjersfilen er bevart byte-identisk i:

- [`archive/QUIZ_README_PRE_CONSOLIDATION_2026-07-25.md`](./archive/QUIZ_README_PRE_CONSOLIDATION_2026-07-25.md)

Arkivet er historisk dokumentasjon og skal ikke brukes som aktiv kontrakt.
