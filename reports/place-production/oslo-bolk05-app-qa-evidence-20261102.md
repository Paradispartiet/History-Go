# Oslo sentrum bolk 05 – faktisk app-QA, 2. november 2026

## Sporbar test
- GitHub Actions: https://github.com/Paradispartiet/History-Go/actions/runs/41400662709
- Testet commit: `84941f93b28b24a57dacf76fbbe6097fa51a3bec`.
- Steder: `folketeateret`, `kunstnernes_hus`, `historisk_museum`, `ibsen_museum_teater`, `blitzhuset` og `kulturkirken_jakob_litteratur`.
- Dokumentasjon: seks ZIP-artefakter med `result.json`, 390px/1440px skjermbilder, `place-quiz/<id>/summary.json` og fullquiz-resultatbilder.

## Resultat kontrollert mot faktisk lagrede testartefakter
| Kriterium | Resultat |
| --- | --- |
| PlaceCard og innlastet bilde i begge bredder | 12/12 |
| QuizCard snudd og utvidet, 10 spørsmål i begge visninger | 12/12 |
| QuizCard-spørsmål knyttet til forventet sted | 12/12 |
| Fullquiz i desktop og mobil, 21 spørsmål hver | 12/12 gjennomspillinger |
| Alle tre quizsett fullført med én stedslås opp | 12/12 |
| Registrerte nettleser-/JavaScript-feil | 0 |

De seks 390px PlaceCard- og QuizCard-skjermbildene er også visuelt kontrollert for synlige bilder og lesbart innhold. Skjermbildene gir ikke grunnlag for å godkjenne samtlige utsnitt, opphavsrettskrediteringer i alle visninger eller fysisk iPad-opplevelse; disse punktene er åpne.

## Avgrensning
Dette er bevis fra `84941f93`, ikke en påstand om grønne kontroller på etterfølgende administrative commits. V4.2-faktakontrollene for Historisk museum og Blitzhuset er registrert som `passed` og begge produksjonspakker står i `ready_v4_2`. PR-en holdes i draft inntil oppdatert CI, siste lisens-/iPad-sjekk og integrasjon mot nyeste main. John Dee-feilen i den globale v4.2-kontrollen er også til stede på main og er ikke en av de seks stedene.
