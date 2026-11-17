# Renholder: opptjent ansettelse og første lønnsuke

Fortsett etter #7295. Den strenge dagskiftekontrollen bruker rolleparameter og beviser ikke ansettelse. Ny akseptansekontroll starter en tom nettleser, fullfører åtte ekte Næringsliv-quizsett, venter på automatisk Renholder-tilbud ved terskel 8 og aksepterer gjennom Karriere. Ingen merits, jobb, tilbud, klokke eller saldo forhåndsfylles. Bare eksisterende testgeografi/onboarding og quizens visningstid konfigureres.

Gjenbruk eksisterende organisk quiz-/tilbudsmønster og `nextDayViaUi`. En egen, avgrenset testmodul gir tydelig renholderbevis uten å omskrive museumsreisen eller lage et nytt kalendersystem. Grand Hotel (3 sett), Oslo Børs (4 sett) og Café Engebret (1 sett) gir åtte unike sett. Oppgavene besvares via faktiske knapper med kanonisk fasit, aldri ved ferdigmarkering i lagring.

Etter aksept må rollepakken bli renholder uten query-override. Spill første sju dager og håndter normal innboks via UI. Kontroller aktiv jobb hver dag, faktisk svart jobbmail fra renholderens kanoniske katalog, daglige opptjeningsposter og første ukesoppgjør på kalenderdag 8. En observatør på ekte dagsluttklikk leser saldo og opptjeningsposter før oppgjøret; den endrer ingen produksjonstilstand. Kontroller nøyaktig betaling og at reload ikke betaler på nytt. Ordinær tilfeldig oppsigelse etter ukesoppgjøret skal registreres som mulig faktisk utfall, ikke deaktiveres eller gjøre testen tilfeldig rød.

Fysisk Safari, senere arbeidsuker, oppsigelse som selvstendig scenario og faktiske kontotransporter står utenfor denne kontrollen. Ingen produksjonsretting uten konkret reprodusert feil. Registerets ansettelsesstatus oppdateres bare med det CI faktisk beviser.
