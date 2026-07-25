# History GO — quizdokumentasjon

Status: **operational compatibility-pointer**  
Sist kontrollert: **2026-07-25**

Denne filstien beholdes fordi eldre dokumenter og arbeidsflyter fortsatt peker hit. Den eier ikke lenger en selvstendig quizmodell.

## Bindende produksjonsrekkefølge

Les i denne rekkefølgen:

1. [`../data/quiz/regler/QUIZ_PRODUCTION_CANONICAL.md`](../data/quiz/regler/QUIZ_PRODUCTION_CANONICAL.md) — eneste bindende produksjonsprosedyre for nye og reviderte quizer
2. [`../data/quiz/regler/QUIZ_TEMPLATE_REGISTRY_V2.json`](../data/quiz/regler/QUIZ_TEMPLATE_REGISTRY_V2.json) — maskinlesbar autoritetsrekkefølge og kategori-profiler
3. [`../data/quiz/regler/QUIZ_NORMAL_OPENING_POLICY_V1.json`](../data/quiz/regler/QUIZ_NORMAL_OPENING_POLICY_V1.json) — global 2 × 7 normalåpning
4. [`../data/fag/fag_manifest.json`](../data/fag/fag_manifest.json) — resolver for kategoriens pensum, emner, fagkart, metoder, superset og schemas
5. kategoriens `required_inputs` og målstedets gjennomgåtte kildegrunnlag
6. [`../data/quiz/regler/QUIZ_QUESTION_SCHEMA_V2.json`](../data/quiz/regler/QUIZ_QUESTION_SCHEMA_V2.json) — spørsmålskontrakt
7. [`../data/quiz/regler/QUIZ_PACKAGE_SCHEMA_V1.json`](../data/quiz/regler/QUIZ_PACKAGE_SCHEMA_V1.json) — pakkekontrakt og `production_context`
8. [`../data/quiz/manifest.json`](../data/quiz/manifest.json) — runtime-aktivering av quizfiler og target-bundne sett

## Runtime og progresjon

Aktivt runtime-eierskap ligger i:

- [`SYSTEM_REGISTRY.md`](./SYSTEM_REGISTRY.md) — overordnede runtimegrenser
- [`SYSTEM_REGISTRY_SUBSYSTEM_CONTRACTS.md`](./SYSTEM_REGISTRY_SUBSYSTEM_CONTRACTS.md) — QuizEngine, Knowledge, learning log, observations og subsystemkontrakter
- [`SYSTEM_MAP.md`](./SYSTEM_MAP.md) — faktisk flyt mellom quiz, innsikt, Knowledge/trivia, learning log og profil

Runtime-sannhet ligger i kode, manifests, schemas og validering — ikke i denne pekeren.

## Produksjonsløp

> kategori og mål → fagmanifest → full fagpakke → stedets kilder → påstandsbank → faglig utvalg → adaptiv profil → settplan → spørsmål → audits → Knowledge

Ufravikelige regler:

- Eksterne, gjennomgåtte kilder og konkrete observasjoner bærer de synlige påstandene.
- Pensum, emner, fagkart, metoder, mapping og superset styrer utvalg og progresjon; de er ikke faktakilder.
- Sett 1 og 2 skal ha sju normale, direkte og kildebelagte spørsmål hver.
- Teori og eksplisitt metode kan tidligst drive spørsmål fra sett 3.
- Profilen skal reduseres når kildegrunnlaget ikke bærer planlagt lengde.
- Nye og fullt reviderte pakker skal lagre faktisk `production_context`.
- En quizfil eller set-pakke er ikke runtime-aktiv før den er registrert i `data/quiz/manifest.json`.

## Produksjonskommandoer

```bash
npm run quiz:context -- --category <categoryId> --target <targetId>
npm run audit:quiz-content
npm run audit:quiz-templates
npm run audit:quiz-production-context
npm run audit:quiz-progression
npm run audit:quiz-theory-binding
npm run test:quiz-content-audit
```

Kjør målrettede kontroller for endringen og den samlede datasjekken når quizpakken påvirker produksjonsdata.

## Ikke-bindende historikk

Den tidligere kombinerte quiz-/lærings-/observations-/popup-filen er bevart byte-identisk i:

- [`archive/QUIZ_README_PRE_CONSOLIDATION_2026-07-25.md`](./archive/QUIZ_README_PRE_CONSOLIDATION_2026-07-25.md)

Følgende konkurrerende modeller er fjernet fra aktiv dokumentflate:

- `README/QuizREADMEny.md` — BY-spesifikk, fast syvsettsmodell
- `README/SET_MAL_README_v2.md` — fast sekssettsmodell

Originaltekstene finnes fortsatt i Git-historikken. Andre gamle set-maler, generatorpatcher og pseudokodefiler er ikke autoritative med mindre `QUIZ_TEMPLATE_REGISTRY_V2.json` uttrykkelig registrerer dem.

Ikke skriv eller revider quiz fra en løs README-mal, emneetikett eller generatorpatch alene.
