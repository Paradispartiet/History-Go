# Ekspeditør: Life Story og kontrollert historikk

Viderefører det godkjente arbeidseksemplet i `docs/civication-symposium/ekspeditor.md` og normal jobbgameplay fra PR #7203. Ingen ny rolle, motor eller register.

- [x] Skill mellom kundens handel, melding, mottaksbekreftelse og kontrollert retting i eksisterende Life Story. Behold scene- og valg-ID-er for lagrede forløp.
- [x] Gi utsatte oppgaver reell oppfølging neste dag. Test faktisk Runner, lagring og Symposium, uten innsprøytede valg.
- [x] Gjør første arbeidsøkt til ordinær vakt 12–20 med bekreftet avløsning og overlevering; ikke gi en ny medarbeider implisitt låseansvar eller straff for avtalt vaktslutt.
- [x] Dekk ekstra kontroll etter Amirs resultat i normal jobbkjede.
- [ ] Kontroller begge prisforløp i faktisk nettleser ved mobil og to iPad-størrelser, også gjenlasting og vist historikk.
- [ ] Synkroniser genererte auditer, kjør full Civication-suite og få uavhengig review.
- [ ] Oppdater rolleprofilen med kontrollert status, merge grønn slutthead og kontroller main-integritet.

Nettleserkontrollen bruker eksisterende utviklerparameter `lifestoryRole=ekspeditor` i ny nettleserkontekst. Den klikker bare faktiske valg og oppretter ingen ferdig historikk. Skjermbilder og rapport er CI-artefakter.
