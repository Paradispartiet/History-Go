# Christiania Torv – fase 7 Quiz/Knowledge audit v1

Dato: 2026-08-23  
Place ID: `christiania_torv`  
Baseline: `main` etter fase-6-merge `87343213dae6eb4ab17720463f68334184395c68`  
Styrende kontrakter: `data/quiz/regler/QUIZ_PRODUCTION_CANONICAL.md`, `QUIZ_PACKAGE_SCHEMA_V1.json`, `QUIZ_QUESTION_SCHEMA_V2.json`

## Tidligere-arbeid-gate

Repo, quizmanifest og canonical By-quizstier er kontrollert før materialisering. Det finnes ingen aktiv Christiania Torv-quiz. Gamle Rådhus har egen Historie-quiz og kan ikke brukes som proxy for torget.

## Profilbeslutning

Planlagt profil er **rich 5 × 7 = 35 spørsmål**. Valget er evidensstyrt: fem selvstendige læringsjobber bæres av kildene, mens flere sett ville splitte de samme påstandene kunstig. Ingen tallkvote brukes som ferdigkriterium.

Planlagt progresjon: `opening → middle → middle → bridge → final`. Første 14 spørsmål er direkte, normale og eksternt kildebelagte. Feltobservasjon kommer i bridge-fasen; William H. Whyte / `byliv_aapne_rom` brukes først i final-fasen med konkret plassanker.

Deterministisk production-context, canonical Knowledge-materialisering og full quiz-pipeline er gjennomført og dokumentert nedenfor.

## Sluttresultat – PASS

Status: **PASS**  
Sluttvalidering: workflow-run `32698513593`, jobb `97345190242` (grønn)  
Canonical writeback-head: `7ef83f8c8469673a4c6c152387384b68f4226692`

- Canonical quiz: nøyaktig **5 sett × 7 = 35 spørsmål**.
- Progresjon: `opening → middle → middle → bridge → final`; de første 14 spørsmålene er direkte og kildebårne, mens metode/teori er bundet til senere faser.
- Innholdsbalanse og alle permanente quizporter er grønne: manifest v2, production context, progression, theory binding, content og quiz-production-testene.
- Alle ni quiz-kilde-ID-er løser mot det gjennomgåtte source brief-registeret.
- Gamle Rådhus beholdes som separat canonical Place; quizen gjør ingen eierskapsoverføring til bygget.
- Alle 35 spørsmål er canonical Knowledge-linked med `knowledge_link_status: linked`, minst én `knowledge_unit_ids` og `primary_knowledge_unit_id`.
- Canonical Knowledge check og Fagverk release er grønne. Repoets aktive canonical materialisering bruker `data/knowledge/knowledge_units.generated.json`; den etterspurte eldre stien `data/knowledge/units.json` finnes ikke og er derfor ikke introdusert kunstig.
- Ingen filler eller udokumenterte dialekt-/språkpåstander er lagt til.
- Begge midlertidige Phase-7-workflows er slettet før merge.
