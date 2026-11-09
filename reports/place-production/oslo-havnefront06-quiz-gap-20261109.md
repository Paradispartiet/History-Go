# Oslo havnefront 06 — quiz- og QuizCard-gap etter Fagverk-godkjenning

Dato 2026-11-09. Arbeidsgren: `research/oslo-havnefront-bolk06-tekst-20261109` / PR #7118. Ingen quiz-ID-er eller brukerprogresjon endret gjennom denne revisjonen.

Kontroll mot `data/quiz/manifest.json` (direkte target-oppslag) og faktisk innhold i alle aktive QuizCard-samlinger under `data/quizcards/by`, `kunst`, `naeringsliv` og `natur`. Det er ikke brukt antakelser fra forrige samtale som ferdigbevis.

| Place-ID | Eksisterende aktiv fullquiz | Eksisterende QuizCard | Avgrenset rest |
| --- | --- | --- | --- |
| `aker_brygge` | `data/quiz/by/aker_brygge_sets.json`, **8 sett × 7 = 56 spørsmål** | `data/quizcards/by/topp10_by_kort_batch1.json` | Behold 56; kontroller kun fullquiz-kilder, QuizCard-paritet og faktisk browser |
| `akershus_kaier` | `data/quiz/naeringsliv/akershus_kaier_sets_merged.json`, **5 sett × 6 = 30 spørsmål** | `data/quizcards/naeringsliv/topp10_naeringsliv_oslo_v1_batch02.json` | Behold 30; kontroller faktisk valideringsprofil og QuizCard/Knowledge-paritet |
| `akrobaten_gangbro` | `data/quiz/by/akrobaten_gangbro_oslo_v1_sets.json`, **1 sett × 10 spørsmål**, `size_class: v1_ten` | `data/quizcards/by/oslo_v1_historiske_fakta_20261024.json` | Eksisterende ettsett-ti-spørsmål-profil må verifiseres mot parser/manifest/Knowledge/Play før v1; utvid bare ved faktisk nødvendig |
| `astrup_fearnley` | **ingen direkte target-oppføring** | **ingen eksisterende card i kunst-manifestet** | Produser kildebundet fullquiz i gyldig kanonisk profil og 10 matchende QuizCard-spørsmål |
| `amerikalinjen` | **ingen direkte target-oppføring** | **ingen card i naeringsliv-manifestet** | Produser kildebundet fullquiz og 10 matchende QuizCard-spørsmål |
| `akerselva_utlop_bjorvika` | **ingen direkte target-oppføring** | **ingen card i natur-manifestet** | Produser natur- og historiepresis fullquiz og 10 matchende QuizCard-spørsmål; ikke forveksle med `akerselva` |

Merknad: «ingen direkte target-oppføring» utelukker ikke uavhengig legacy- eller flate quizspørsmål i eldre omnibusfil; et komplett produksjonsløp må gjennomgå slike kilder før nye ID-er opprettes.

## Åtte harde regler før aktivisering

1. **Bruk eksisterende spørsmåls-ID-er der de kvalifiserer.** Ikke endre dem for å oppnå 10 eller 21 på papiret.
2. Eksisterende `data/places/production/{id}.json` inneholder 10 **quizReadiness-kandidater** for Astrup, Amerikalinjen, Akrobaten og Akerselvas utløp. Disse er **ikke** runtime-spillbare quizsett.
3. Kildene styrer omfanget; ikke skriv like spørsmål med små ordendringer for å fylle ett sett.
4. For ny fullquiz: canonical `narrow` (minst 3×7) eller `normal` (minst 4×7) når kildegrunnlaget bærer bredden. Forsøkt 1×10 kan bare merkes runtimeklar når parser, manifest, Knowledge og QuizCard faktisk består; ikke svekk globale validatorer.
5. Hvert spørsmål har riktig `targetId`, kategori, kilde, riktig svar, plausible distraktorer og forskjellig læringsjobb.
6. QuizCard skal ha nøyaktig ti stedsspesifikke faktaspørsmål, med samme ID og fasit som de valgte aktive fullquizspørsmålene.
7. Regenerer Knowledge for bare nye og endrede spørsmålsenheter. Ikke slett eller bytt eksisterende Knowledge-ID-er som annen brukerprogresjon peker til.
8. Kjør målrettet quiz-/Knowledge-/QuizCard-audit og faktisk gjennomspilling i nettleser før eventuell v1-merking.

## Nåværende produksjonsstatus

Historietekster på 6/6 vurdert, revidert på 4/6; fysiske bilder på 6/6 (5 nye par + Akershuskaienes eksisterende); Fagverk på 6/6 med 3 nykurerte Fagverk-sider. For de 3 nye Fagverk-sidene er `node scripts/audit-fagverk-place-pages.mjs --write`, `node scripts/build-fagverk-release-manifest.mjs --check`, testpakkene og seks ekte browser-visninger med lenkeaktivering bestått i [Actions run 42605879078](https://github.com/Paradispartiet/History-Go/actions/runs/42605879078), `run_attempt: 3`. Ingen av de seks stedene er erklært `v1` eller `vFerdig` på grunnlag av dette.

**Neste innholdsproduksjon:** Astrup, Amerikalinjen, Akerselvas utløp (kildeførte quizsett), deretter felles QuizCard/Knowledge-paritet, People og PlaceCard-samlinger, browser-testing, hoved-CI og fresh-main. Ikke merge før disse portene er grønn.
