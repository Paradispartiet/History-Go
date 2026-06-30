# Civication v0.1 — audit av aktiv handlingsflate

## Runtime-kjede lest i kode

- Dagfasen bygges og inspiseres via `CivicationDayProgression.inspect()`, med fasebundle fra `CivicationDailyMailBuilder.inspect()`.
- Mailer velges/normaliseres i `civicationDailyMailBuilder.js`; konkrete mailvalg beholdes fra mailfamiliene, mens genererte fase-/dagsluttmailer har eksplisitte fasefallback-valg.
- Aktiv mail velges av `CivicationNextActionSelector.getCurrent()`: pending/delivered faseitem vinner, deretter neste queued item, deretter fase-advance, og først til slutt inbox-fallback.
- Svarvalg for aktiv mail rendres av `CivicationNextActionUI` med `data-civi-next-action-answer`.
- Etter svar dispatches `civi:inboxChanged`, `civi:dayPhaseChanged` og `updateProfile` fra NextAction-svarflyten slik at Dagens fase, innboks og profil oppdateres.
- Neste fase låses opp når dagprogresjonen rapporterer `canAdvance`; NextAction rendrer da faseknappen i stedet for at Dagens fase/WorkdayPanel blir en separat beslutningsflate.

## Flater som rendrer mailer

1. `CivicationNextActionUI` rendrer den ene aktive mailen/handlingen.
2. `CivicationDayPhaseUI` rendrer passiv fasestatus og tittelen på neste sak.
3. `CivicationInboxTopActionUI` rendrer innboksarkiv/detaljer per kanal.
4. `CivicationUI`/WorkdayPanel rendrer rolle-/arbeidsdagspanel og fase-HUD; full bundleliste er debug-only.
5. Legacy `CivicationUI` inbox/mailvisning kan fortsatt vise valgt mail som detalj, men skal rute videre til NextAction.

## Flater som rendrer svarvalg

- Primær runtime: bare `CivicationNextActionUI` rendrer aktive svarvalg med `data-civi-next-action-answer`.
- WorkdayPanel kan vise bundlevalg bare i eksplisitt debug/testmodus.
- Innboks og Dagens fase viser ikke primære svarvalg.

## Klikkbare svarvalg

- Klikkbare spillvalg for dagsflyten er `data-civi-next-action-answer` i NextAction.
- Queued saker må først åpnes via NextAction før valg vises.
- Innboks åpner NextAction via `data-civi-open-next-action` og bruker ikke lenger `data-civi-inbox-answer` for åpne mailer.

## Komponent som eier progresjon

- `CivicationNextActionSelector` eier hvilken handling som er aktiv.
- `CivicationNextActionUI` eier klikkflaten som svarer eller avanserer.
- Dagfase/runtime eier tilstanden som avgjør om neste fase er ulåst, men UI-progresjonen presenteres via NextAction.

## Risiko som ble ryddet

- Innboks kunne tidligere vise samme valg som NextAction for åpne mailer utenfor fasebundle.
- Legacy inboxvisning i `CivicationUI` kunne rendere egne knapper for samme aktive mail.
- WorkdayPanel hadde en debug-bundle som kan vise valg; normal runtime er fortsatt passiv.

## Risiko for aktiv/arkiv-dobbelvisning

- Samme mail kan fortsatt vises som detalj i innboks/arkiv og som aktiv handling i NextAction. Dette er akseptabelt så lenge bare NextAction viser svarknapper. Innboksen merker derfor åpne saker med «Håndteres i Neste handling» og ruter videre.
