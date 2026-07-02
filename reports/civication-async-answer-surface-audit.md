# Civication async answer surface audit

## Bakgrunn
PR #1613/#1614 gjorde `CivicationEventEngine.answer()` og `CivicationMailEngine.answerMail()` asynkrone fordi svar nå kan vente på followup-/mailflyt før resultatet er komplett. Kontrakten er derfor at alle svarflater må vente på resolved resultat før de sjekker `ok`, viser feedback eller refresher UI.

## Svarflater funnet
- **NextAction**: `data-civi-next-action-answer` i `js/Civication/ui/CivicationNextActionUI.js`. Denne gikk allerede via `Promise.resolve(result).then(...)` og håndterer `ok:false`, rejected Promise, refresh og lukking etter resolved resultat.
- **Aktiv inbox-card**: `data-civi-inbox-answer` i `js/Civication/ui/CivicationInboxTopActionUI.js`. Denne ventet allerede med `Promise.resolve`, men manglet kontrollert `ok:false`-feedback.
- **Profile-mode inbox**: `civiChoiceA/B/C` og `civiChoiceOK` i `js/Civication/ui/CivicationUI.js`. Denne hadde synkron `const res = HG_CiviEngine.answer(...); if (!res?.ok) return` og var hovedfunnet i auditten.
- **Daily/debug bundle**: `data-civi-bundle-choice` i `js/Civication/ui/CivicationUI.js`. Handleren er allerede `async` og bruker `await` mot daily-mail-builderens svar/markering.
- **MailEngine**: `CivicationMailEngine.answerMail()` i `js/Civication/systems/civicationMailEngine.js`. Denne er `async` og awaiter `HG_CiviEngine.answer()` før mail markeres resolved.
- **TestMode**: start rolle/start dag/åpne handling bygger ikke en egen answer-svarflate; start dag awaiter `CivicationDailyMailBuilder.startToday(...)`.

## Endringer
- Profile-mode inbox awaiter nå `HG_CiviEngine.answer(...)` via `await Promise.resolve(...)` før `res.ok` sjekkes.
- Profile-mode inbox viser feedback, skjuler valg og viser OK først etter async success.
- Profile-mode inbox viser kontrollert feil og reaktiverer valg ved `ok:false` eller rejected/thrown Promise.
- No-choice profile OK venter på async close/answer-resultatet før refresh og viser kontrollert feil ved `ok:false`/rejection.
- Aktiv inbox-card behandler nå resolved `{ ok:false }` som kontrollert feil i stedet for suksess-summary.

## Tester
Ny test: `tests/civication-async-answer-surfaces.test.js`

Dekning:
- Mock av `HG_CiviEngine.answer()` som returnerer en unresolved/async Promise.
- Profile-mode inbox viser ikke feedback/OK før Promise er resolved.
- Profile-mode inbox viser feedback og OK etter async success.
- `ok:false` gir kontrollert feil og reaktiverer valg.
- Rejected Promise gir kontrollert feil.
- NextAction velger fortsatt aktiv mail.
- Aktiv inbox-card render fortsatt `data-civi-inbox-answer`.

## v0.1 reference loop
Regression-runden inkluderer `tests/civication-test-mode-ui.test.js`, som fortsatt verifiserer referanserollene og at `broken_mapping` er `0`.
