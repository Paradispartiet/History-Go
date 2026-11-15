# Renholder: ordinært dagskifte og reststatus

Brukeren har bedt om å lukke renholderens testrestanser før neste rolle. Eksisterende renholdertest spiller faktiske scener, men hopper via Runner når shell-innboksen blokkerer neste dag. Dette beviser ikke ordinær kalenderflyt.

Gjenbruk `nextDayViaUi` fra arbeidsledig-/21-dagerskontrollen, som svarer gjennom den synlige innboksen og bruker ekte dagskifteknapper. En ny streng `dagskifte`-modus spiller de samme tre klagerutene gjennom sju dager på mobil og to iPad-formater. Dagskifte må flytte både kanonisk kalender og Life Story nøyaktig én dag; Runner-reserven skal ikke være tilgjengelig i denne modusen. Det gir bedre bevis enn å kopiere hele kalenderhjelperen eller bare fjerne sperren. Dette er implementasjonsvalget innen brukerens godkjente testoppdrag.

Testen starter fortsatt med eksplisitt Life Story-rolleparameter, uten opptjent/akseptert ansettelse. Den må derfor ikke omtales som full kontroll av vanlig renholderansettelse eller hele lønns-/jobbmailforløpet. Ingen produksjonskode endres uten en reprodusert feil.

Fysisk iPad/Safari er ikke tilgjengelig i kjøringsmiljøet. En konkret manuell sjekkliste og ærlig åpen status føres i eksisterende profil/register. Verken skjermstørrelse, Chromium eller en eventuell WebKit-emulering teller som fysisk test. Tjuvholmen holdes separat.
