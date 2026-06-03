# Civication status audit etter merge 953 og 955

Dato: 2026-06-03

Dette auditnotatet beskriver faktisk status i `main` for Civication-innboks, jobbmail/personlige meldinger og Civication-badge etter kontroll av merge 953 og 955. Notatet er avgrenset til merge-kontroll; det innfører ikke ny jobbmail-arc, profilsideredesign eller ny arkitektur.

## Kontrollert

- Civication scriptrekkefølge og UI-entry i `Civication.html` og `index.html`.
- Innboksrendering i `js/Civication/ui/CivicationUI.js` og topp-/popup-rendering i `js/Civication/ui/CivicationInboxTopActionUI.js`.
- Kanal-/typeklassifisering i `js/Civication/systems/civicationEventChannels.js`.
- Mail store, status og svarflyt i `js/Civication/systems/civicationMailEngine.js`.
- Jobbtilbud og første-jobbmail i `js/Civication/core/civicationJobs.js`.
- Dag-/arbeidsflyt, livsmail og progresjonsmail i `js/Civication/systems/civicationDailyMailBuilder.js`, `js/Civication/systems/civicationLifeMailRuntime.js` og `js/Civication/systems/civicationBrandJobProgression.js`.
- Civication-notifikasjonsbadge i `js/Civication/ui/CivicationBadge.js` og ulest-state i `js/Civication/core/civicationState.js`.
- Live update via `window.dispatchEvent(new Event("updateProfile"))` i relevante Civication-muteringer.

## Status: innboks og meldingsdeling

- Civication har fortsatt én underliggende mail-/inbox-store (`hg_civi_mail_v1` med legacy-speil til `hg_civi_inbox_v1`). Det er forventet i dagens struktur.
- Visningen er splittet i tydelige seksjoner: **Jobbmail** og **Personlige meldinger**.
- Data/state/rendering har tydelig type-/kanalskille via `mail_class`, `mail_type`, `source_type`, eksplisitt `channel/messageChannel` og metadata som `daily_mail_meta`, `role_content_meta`, `life_mail_meta`, `mail_plan_meta` og `career_outcome_meta`.
- Kveld/fritid/livsmail klassifiseres som personlig gjennom `source_type: "life"`, `mail_class: "private_message"`, `mail_type`/`type` private/personal eller slot/phase som evening/free_time/leisure/personal.
- Jobbrelatert mail klassifiseres som jobbmail gjennom eksplisitt jobbkanal, rolle-/arbeidsmetadata, dag-/arbeidsflyt, brand-progresjon, career outcome og relevante jobmail-klasser.
- Det finnes fortsatt eldre rendering i `renderCivicationInbox`, men den bygger nå seksjoner og bruker samme klassifisering i stedet for å vise én udifferensiert blandet liste.

## Status: jobbmail

- Jobbmail har egen seksjon i Civication-innboksen og i topp-/popup-innboksen.
- Jobbmailvalg går gjennom `CivicationMailEngine.answerMail`/`HG_CiviEngine.answer`, markerer mail resolved og kan trigge eksisterende consequence-/thread-flyt.
- Første jobbsekvens ved akseptert jobbtilbud legger inn introduksjon og første dagshendelse som jobbmail.
- Dagens delivery guards hindrer samme mail-key/type/week i å bli levert meningsløst på nytt. Livsmail har egen syklusmekanikk; den er adskilt fra jobbmail og er ikke ny jobbmail-arc.
- Gjenstår til neste funksjons-PR: selve sluttstrukturen for forfremmelse/sparken/stagnasjon må fortsatt bygges som eget arbeid, ikke i denne kontrollen.

## Status: personlige meldinger

- Personlige meldinger er separat fra jobbmail i rendering.
- Livs-/kvelds-/fritidsmeldinger går til personlig kanal og skal ikke havne i jobbmail når de har dagens metadata/slot/source-type.
- Usikre/uklassifiserte meldinger vises sammen med personlige meldinger for ikke å bli skjult, men klassifiseres ikke som jobbmail uten jobb-/rolleindikatorer.

## Status: Civication-badge

- Civication-ikonet i hovednavigasjonen har et dedikert badge-element.
- Badge-tallet kommer fra `CivicationState.getUnreadCivicationCount()` og er ikke hardkodet.
- Nye jobbtilbud markeres ulest når `CivicationJobs.pushOffer` legger inn et pending offer.
- Nye jobbmail markeres ulest når `CivicationMailEngine.sendMail` leverer jobbrelatert mail, og når første jobbsekvens legger inn introduksjon/dagshendelse.
- Badge skjules når ulest-tallet er 0.
- Funnet feil: jobbmail ble markert ulest ved levering, men `CivicationMailEngine.markResolved`/`markRead` ryddet ikke tilhørende `unreadJobMailIds`. Dette kunne gjøre at badgen ble stående etter at mailen var håndtert/lest.
- Rettelse i denne PR-en: mail engine rydder nå relevante unread-jobmail-ID-er når mail markeres lest eller resolved.

## Profil/live update

- Relevante Civication-muteringer sender fortsatt `window.dispatchEvent(new Event("updateProfile"))` eller badge-/inbox-events som igjen oppdaterer UI.
- Profilsidens layout er ikke endret.

## Neste PR-kandidater

- Bygg faktisk jobbmail-sluttstruktur for forfremmelse/sparken/stagnasjon.
- Vurder en eksplisitt "åpnet/lest"-handling i Civication-visningen hvis produktet ønsker at bare åpning av innboksen, ikke svar/OK, skal rydde badge.
- Eventuelt samle kanalklassifisering enda mer rundt `CivicationEventChannels` når eldre fallback-rendering fases ut.
