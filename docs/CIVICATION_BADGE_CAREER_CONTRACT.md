# Civication Badge Career Contract

## Canonical sannhet

`data/badges/*.json` er canonical kilde for spillerens opptjente stillingsstige i Civication.

Jobbtilbud bygges fra den aktuelle Badge-filen. `tier.label` er den faktiske stillingstittelen spilleren får tilbud om, og `tier.threshold` er poenggrensen som åpner tittelen.

Badges er derfor ikke en statisk historisk liste. Stigene skal videreutvikles når Civication får bedre, mer realistiske eller tydeligere karriereløp.

## Badge-tier og role_scope er forskjellige ting

En **Badge-tier** er spillerens synlige stilling og progresjonsnivå.

Et **`role_scope`** er en intern Civication-kontrakt for hvilken jobb-/Life Story-pakke som kan spille stillingen. `role_scope` skal aldri fungere som en skjult alternativ stillingsstige.

Flere Badge-titler kan dele samme `role_scope` når arbeidsformen, valgene, læringen og fortellingsmekanikken faktisk er den samme. En høyere stilling skal derimot ikke tvinges inn i en lavere rollepakke bare for å oppnå teknisk dekning.

## Life Story-binding

Alle aktive opptjente jobbroller i `data/Civication/lifestory/manifest.json` skal ha:

- `badge_id`
- minst én eksakt `badge_titles`-verdi som finnes i den canonical Badge-filen
- `role_scope`

Systemroller som ikke opptjenes gjennom Badges, for eksempel `arbeidsledig`, skal merkes eksplisitt med `system_role: true`.

Når en ny Life Story-jobb utvikles, skal den tilhørende Badge-stillingen finnes fra før eller legges til i samme endring. Innholdspakken skal ikke introdusere en spillerstilling i skjul.

## Videreutvikling av stillingsstiger

Når en eksisterende Badge-stige er gammel eller for grov, skal den forbedres på Badge-nivå. En god endring kan:

- legge til manglende inngangsstillinger
- skille fagarbeid, førstelinje, rådgivning og ledelse tydeligere
- utvide en kort stige til et reelt karriereløp
- justere progresjonen slik at ansvar og kompleksitet øker forståelig
- introdusere nye `role_scope` når høyere eller annerledes arbeid faktisk krever en annen simulering

Det er bedre å utvikle Badge-stigen enn å opprette roller som bare finnes i Civication-data.

## Runtime-kontrakt

`js/Civication/merits-and-jobs.js` leser `data/badges/index.json` og de canonical Badge-filene for jobbtilbud. Civication skal derfor ikke bruke eldre, avledede karrierelister som fasit for stillingstitler.

`data/Civication/hg_careers.json` eier supplerende karriereregler som økonomi, vedlikehold og krysskrav. Den eier ikke stillingsnavnene.

`data/Civication/hg_careers2.json` er legacy/avledet materiale og skal ikke behandles som canonical stillingsstige.

## Permanent gate

`tests/civication-badge-career-contract.test.js` håndhever at:

- sentrale Badge-stiger har strengt stigende terskler og unike titler
- aktive Life Story-jobber peker på eksisterende Badge-titler
- resolveren mapper hver bundet Badge-tittel til riktig `role_scope`
- systemroller er eksplisitte

Når Badge-stigene videreutvikles, skal denne testen følge den canonical modellen og hindre at Civication og Badges glir fra hverandre igjen.
