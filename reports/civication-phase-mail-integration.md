# Civication Phase Mail Integration

## Hva ble fjernet/flyttet

Den tidligere toppviseren ble laget av `CivicationMiniSectionsUI.ensureHomeControls()` som et permanent `#civiTopActionCard` over de øvrige hovedflatene, og ble oppdatert av både `CivicationMiniSectionsUI.refreshTopActionCard()` og `CivicationInboxTopActionUI.setTopCard()`. Kortet kunne vise kopien «Ny melding», «Krever svar» / «Din sak er registrert · Innkommende» og primærhandlingen «Åpne innkommende» samtidig som Dagens fase, Neste fokus og Innboks viste samme sak.

Kortet opprettes ikke lenger som en egen hovedseksjon. Livsområdeknappene Personlig/Karriere/Fritid/Kommers/Kultur er beholdt som en kompakt kategorinavigasjon for seksjonsgridet, ikke som del av en mailviser.

## Hvordan Dagens fase viser fase-mail

`CivicationDayPhaseUI` har fått en intern `renderPhaseMailPreview()`-flyt som viser fase-label, dag/neste fase, åpent antall og en fase-mailblokk inne i Dagens fase:

- «Åpen sak i denne fasen» når NextActionSelector eller DayProgression peker på en sak.
- «Håndteres i Neste handling» for aktiv/pending sak.
- Tomtilstanden «Ingen åpne saker i denne fasen» når fasen ikke har sak.
- Handlingen «Gå til neste handling» ruter fortsatt til NextAction.

## NextAction-kontrakten

NextActionSelector er fortsatt single source of truth for aktiv sak. Dagens fase leser `CivicationNextActionSelector.getCurrent()` først og faller bare tilbake til DayProgression-inspeksjonen når selector ikke finnes. Dagens fase rendrer fortsatt ingen `data-civi-next-action-answer`, `data-civi-inbox-answer` eller bundle-choice-knapper.

## Innboks som arkiv/detalj/handover

Innboksseksjonene i `CivicationInboxTopActionUI` er beholdt. De viser jobbmail, personlige meldinger og systemmeldinger som arkiv/detalj. Aktiv inbox-card kan fremdeles vise direkte valg bare når mailen er current NextAction; andre åpne tråder forblir passive eller peker til «Gå til Neste handling» når saken eies av NextAction.

## Tester kjørt

- `npm run test:civication -- --runInBand`
