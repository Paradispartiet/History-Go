# CI-ruting: Psykoteori, Civication og History Go-quiz

**Dato:** 2026-10-10  
**Formål:** Beholde kritiske regresjonsporter uten å kjøre 698 Civication-testfiler to ganger på en ren fag-/teoriendring. Denne rutingen endrer ikke History Go-kjernen eller Civication-modellen.

## Workflow-eierskap

| Workflow | PR-endringer som utløser den | Kontroll |
| --- | --- | --- |
| `Psykoteori` (`.github/workflows/psychology-theory.yml`) | `data/psychology/**`, relevante Psykologifagverk-filer, Psykologrommet-kode/-stil, teoritester, pakkeavhengigheter | `node --check js/psychologyRoom.js` og `npm run test:psychology`. Kommandoen omfatter nå 58-emne-dekningsauditen og grensetestene mot Civication-kompetanse/persondata. |
| `Civication` (`civication.yml`) | Relevante `data/Civication/**`, `js/Civication/**`, karriere-, badge- og governance-endringer, generelle `civication-*.test.js` | Full `test:civication` (698 testfiler per 10. oktober 2026) samt governance og generert sceneregister. **Unntak:** ren `civication-psychology-room-theory/coverage`-testendring starter ikke fullpakke. Fullpakken kjører også daglig ved 03:17 UTC og manuelt. |
| `Typecheck baseline report` | TypeScript-/tool-kode, generelle Civication-tester, relevante npm-avhengigheter | Syntax- og TypeScript-diagnostikk med rapport. Kjøringen **gjentar ikke** full Civication-suite, karttester eller Playwright. |
| `Civication browser smoke` | Civication-runtime, scene-/kartdata og relevante nettleser-/karttestfiler | Karttester, eksplisitte kart-auditer, Playwright-installasjon og faktisk Civication-oppstart. |
| `Civication quiz references` | Endringer i `data/quiz/**` og relevante Civication roleWorld-/mail-/model-JSON | Liten Node-test: alle refererte quizfiler skal finnes og være registrert i canonical manifest. `#id` må være et **aktivt** `set_id` eller spørsmål (ikke en historisk ID i `existing_quiz_audit`). |

## Beskyttede grenseflater

- En endring i et **Psykoteori-kort** skal ikke avvises fordi en urelatert Civication-redaksjonscase mangler gamle quiz-ID-er. Til gjengjeld skal `Psykoteori` alltid validere faglig dekningsintegritet, teorinavigasjon og at rene teorikort ikke gir karriere- eller brukerpoeng.
- Endringer i Civications karrierelogikk, Mail, rolleverdener og felles runtime beholder full regresjon. Det er ikke trygt å fjerne de eksisterende Civication-testfilene.
- Endringer i **quizdata** skal validere de faktiske Civication–quiz-referansene selv om ingen Civication-kode ble endret. Denne kontrollen er uavhengig av History Go-kjernens quizaudit.
- Dersom både Psykoteori og Civication-runtime endres i samme PR, kan **flere relevante** workflows starte. Dette er tilsiktet, ikke utilsiktet duplisering.
- `workflow_dispatch` er beholdt for full manuell kontroll. Daglig Civication-kjøring er en kontroll av `main`, ikke en erstatning for nødvendig PR-regresjon.
- Jobbnavnet `Civication regression suite` og workflow-/jobbnavn i Typecheck er beholdt av hensyn til eksisterende CI-statuskrav. Eksakte branch-protection rulesets må verifiseres med riktig GitHub API/UI-tilgang før noen statusnavn fjernes eller gjøres obligatoriske.

## Feildokumentasjon og tekniske porter

- VG-huset-rotårsak er dokumentert i [issue #6192](https://github.com/Paradispartiet/History-Go/issues/6192). Referanser til historiske quiz-ID-er må rettes til semantisk riktige levende objekter, ikke skjules ved å svekke testen.
- Det nye manifestet bruker blant annet `sets[].file` for stedquiz (ikke bare `files[]`). Referansekontrollen følger denne strukturen.
- Grønn CI verifiserer at kode, filer, referanser og ruting er konsistent; den er **ikke** dokumentasjon for vitenskapelig sannhet i Psykoteori-innholdet.

## Vedlikehold

Når en ny testfamilie introduseres: identifiser hvilke runtime-/datakontrakter den eier, legg til de berørte PR-stiene, og mål om en allerede eksisterende workflow tester det samme. Utfør en målrettet CI-ruting-audit etter endringen. Endringer i branch-protection eller påkrevde statusnavn skal håndteres særskilt og eksplisitt, ikke som en utilsiktet følge av workflow-renaming.
