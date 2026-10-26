# Fagverket Politikk – sjette etappe: empirisk femtrinnsforløp

Dato: 21. oktober 2026  
Forarbeid: PR #6493 og #6501.

## Arbeid utført

Ett komplett **femtrinns fagområdeforløp** om demokratisk tilbakegang og valgintegritet er skrevet som en selvstendig, kjørbar *datakandidat*, med korrekt quizskjema og fem kildeklare spørsmålsclaims. Fagområdeforløp er ikke stedsquizer, og den generelle stedsregelen 2 × 7 gjelder ikke.

**Filer:** `data/quiz/politikk/politikk_subject_pathways_v1.json` og `data/fag/politikk/advanced_political_science_wave6_poland_case_evidence_v1.json`.

| Trinn | Faglig handling | Empirisk kontroll |
| --- | --- | --- |
| `observe` | Gjengi ODIHRs vurdering av konkurranse og administrasjon | Konkurransepreget valg, effektiv administrasjon, lukket beslutningsprosess |
| `explain` | Identifisere mekanisme | Sammenfall mellom regjeringskampanje, statlige ressurser og offentlig mediedekning |
| `evaluate_evidence` | Vurdere belegg og slutningsstyrke | Gjenbruker ordrett den kildebelagte kjernespørsmålsformuleringen fra bølge 5 |
| `diagnose_failure` | Avvise ugyldig inferens | Skjev konkurranse og begrenset valgdagsobservasjon gir ikke bevis for manipulert opptelling |
| `decide_and_justify` | Koble tiltak til diagnostisert problem | Åpen valgkommisjon, kampanjefinansiering, statlige ressurser, offentlig kringkasting |

Samtlige fem spørsmål har fire svaralternativer, svarlogikk, alternativspesifikke tilbakemeldinger, Knowledge-oppsummering og utdyping, metodekobling, lærerettet mål, eksplisitt bevisbasis og kilde-/lokatorbinding.

## Kilder og presisjonsgrenser

- [ODIHRs offisielle oppsummering av sluttrapporten, 27. mars 2024](https://odihr.osce.org/odihr/elections/poland/565426).
- [Felles ODIHR/OSCE PA/PACE-observasjon publisert 17. oktober 2023](https://odihr.osce.org/odihr/elections/poland/555072).
- [ODIHRs beskrivelse av den begrensede valgobservasjonens metode](https://odihr.osce.org/odihr/elections/poland/548260).
- Dixon og Landau (2024), `10.1017/9781009447713.004`, brukes bare som analytisk bakgrunn og **ikke** som empirisk kilde om Polen.

Observasjonene gir ikke bevis for manipulert opptelling, ugyldig valgresultat eller beregnede endringer i stemmetall. ODIHRs valgdagsobservasjon var begrenset. Forslag til reformer er ikke dokumentasjon på gjennomføring eller effekt.

## Kanoniske bindinger og Knowledge

Beholdt: 13 domener, 71 metoder og 123 emner. Hovedmetode `met_pol_institusjonell_tilbakegangsanalyse`, emne `em_pol_institusjonsfordypning_demokratisk_tilbakegang` og eksisterende `pol_concept_*`-ID-er.

Det er to ID-rom som **ikke må blandes**: de eksisterende kanoniske Politikk-begrepene (feltet `canonical_politikk_concept_ids`) og quiz/Knowledge-kontraktens `co_*`-referanser (`concept_ids`). Sistnevnte er deterministiske lenkenøkler, ikke nye pensumbegreper. Alle spørsmål har `ku_*`, `term_*` og `lo_*`-referanser samt `knowledge_payload`.

## Publiseringsport

**Status: `editorial_ready_unregistered` — 5/5 ferdigskrevne spørsmål, 0 aktivert i appen.** Forløpet er ikke oppført i `data/quiz/manifest.json`, `data/fag/fag_manifest.json` eller `data/knowledge/knowledge_manifest.json`. Dette er en bevisst port, fordi quizmanifest-aktivering uten samtidig regenererte Knowledge-registerfiler ville føre til brutte referanser.

Før `pilot_active`: tilordne/publisere manifestene, kjøre `scripts/knowledge-canonical-data.mts --write` (og kontroll), oppdatere genererte Knowledge-registerfiler, kontrollere kanoniske lenker, deretter full Politikk-, Knowledge-, Fagverk- og nettlesertest.

Permanent test: `node --test tests/politikk-advanced-political-science-subject-pathway-v6.test.mjs`.
