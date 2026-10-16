# Civication – private NPC-kapitler i dag og innboks

Status 16. oktober 2026: Teknisk støtte implementert i de eksisterende eierne. Frode, Stein og Ingers private historier er fortsatt uregistrerte utkast. `narratives/manifest.json` er uendret.

## Årsak og rettelse

Private NPC-kapitler var avhengige av arbeidsdagstelleren og delte kvote med jobbkapitlene. Det kunne stoppe privat fremdrift uten jobb og la arbeid og privatliv konkurrere om samme tur. Dagsbyggerens normale private adapter hadde dessuten en tidlig `continue` som hindret narrativt privat innhold i å bli valgt.

`CivicationNarrativeSceneSource` skiller nå mellom jobb- og privatstrømmer med samme eksisterende NPC-format:

| Forløp | Klokke | Mellomrom mellom kapitler | Lagret svartid | Kvoten deles med |
| --- | --- | --- | --- | --- |
| Arbeid | `CivicationWorkdayRuntime.getWorkdayDayIndex()` | `available_after.min_workdays` | `answered_workday_day` | Andre jobb-NPC-kapitler |
| Privat | `CivicationCalendar.getClock().dayIndex` | `available_after.min_days` | `answered_calendar_day` | Andre private NPC-kapitler |

Begge gruppene har maksimalt ett NPC-kapittel per relevant dag. Både kølagte og besvarte kapitler teller. Den som sist fikk en tur lengst tilbake, får forrang blant like prioriterte NPC-kandidater. Kvote og rekkefølge kan ikke omgås ved omlasting eller ved å bygge køen på nytt.

De tre private utkastene bruker nå `min_days`. Jobbkapitlenes dagkrav og rolleoverganger er bevart. En gammel arbeidsdagstidsangivelse gjøres ikke om til en kalenderdag. Hvis et privat svar mangler kalenderstempel, åpnes ikke neste kapittel på grunnlag av gjetning. Ingen av disse private utkastene er tidligere registrert i produksjonsmanifestet.

## Dagsbygger og innboks

Med jobb prøver dagsbyggeren en kvalifisert privat NPC-scene før den ordinære private fasekilden i samme fase. Den øvrige private fasekilden brukes fortsatt, og jobbkandidatene beholder sin egen kvote. Bare NPC-strømmer får denne nye prioriteten; andre uregistrerte eller generelle fritidsstrømmer gis ikke en ny aktiveringsvei.

Uten jobb bygger dagskøen bare pågående NPC-korrespondanse. Den lager verken jobboppgaver, en arbeidsgiver eller generiske private fasevalg. Når ingen slik melding skal leveres, får den eksisterende arbeidsledig-/livsflyten fortsette gjennom sin eier. En privat NPC-scene blir ikke en jobbmail fordi den har en tidligere kollega som avsender.

Scenen går gjennom faktisk `SceneCatalog` og leveres via `CivicationMailEngine` til den eksisterende innboksen. Kanal, klasse og arbeidsbinding forblir private. `ChoiceDirector` behandler svaret; eksisterende narrative state og NPC-lager registrerer følger. Et avvist svar gjenoppretter fremdriften og lar meldingen være ubesvart. En vellykket besvarelse løser også innbokskopien.

Dagskøen lagrer kalenderdagen sammen med eksisterende dato- og rollekontekst. En ny spilldag kan dermed bygge ny privat kø selv om virkelighetens dato og antall arbeidsdager er uendret. `DayProgression` og kalenderbroen eier fortsatt selve døgnskiftet.

## Kontroll

`tests/civication-private-npc-day-inbox.test.js` har sju beståtte integrasjonstester med repositoryets faktiske kalender, kalenderbro, kanalklassifisering, mailmotor, aktørkontrakt, NPC-lager, SceneCatalog/Director, private fasekilde, narrative kildeadapter, dagsbygger og dagprogresjon. Testens avgrensede EventEngine-bunn svarer på hendelsene i den faktiske innboksen; det er ikke en test av nettleserens knapper.

- Hver av de tre buene fullføres uten jobb, med fire kapitler, gjentatt omlasting, normal innbokslevering og kalenderovergang.
- Et jobbkapittel og et privat kapittel kan ligge i samme normale dagskø med riktig kanal.
- Tap av spillerens jobb mellom private kapitler stopper ikke fortsettelsen.
- Avvist svar, manglende kalenderstempel og gjentatt åpning gir ingen uberettiget fremdrift.
- Uten etablert NPC-kontakt får den eksisterende livseieren fortsatt behandle appåpningen.
- Tolv private kalenderdager fordeler tre figurers kapitler i tur uten å flytte arbeidsdagstelleren.

I tillegg består målrettede tester for alle 28 private scenevarianter, ordinær jobbfordeling, jobbrollehistorikk, daglige svar, privat fasekilde, ventende svar, fasegeneratorer, SceneDirector-dagskatalog, innbokskanaler og engangsmailer ved arbeidsledighet. Syntakskontroll av begge endrede motorfiler og `git diff --check` består. Ingen ekstra full lokal regresjon eller nettleserkjøring er startet.

## Kvalitetsvurdering av teknisk støtte

| Dimensjon | Score | Evidens og grense |
| --- | --- | --- |
| Korrekthet og evidens | 5/5 | De to konkrete rotårsakene er lest i kode og dekkes av integrasjonstestene. To eksisterende klokker brukes etter sitt formål. |
| Dekning og ferdigstillelse | 5/5 | Dagfremdrift, dagkvote, normal privat adapter, innbokslevering, svar, omlasting og jobbfravær er dekket for alle tre figurer. |
| Faglig/redaksjonell kvalitet | 4/5 | Endringen og dokumentasjonen skiller teknisk funksjon fra karakterfakta og historieutkast. Den godkjenner ikke historienes litterære kvalitet. |
| Teknisk integritet | 4/5 | Faktiske eiere testes sammen med målrettede regresjoner. Ingen ny lagringseier. Ingen nettleserreise eller aktivering i produksjon hevdes. |
| Sikkerhet og ansvarlighet | 5/5 | Ingen nye fullmakter, arbeidsforhold, lønnstildeling eller History Go-endring. Manglende stempler åpner ikke kapitler. |
| Vedlikeholdbarhet og etterprøvbarhet | 4/5 | To eksisterende motorfiler, additive tilstandsfelt, avgrenset datakontrakt og en samlet integrasjonstestfil. |

**27/30 for den tekniske støtten.** Ingen teknisk aktiveringsblokkering gjenstår i det testede omfanget. Produksjonsregistrering av historiene er fortsatt en separat innholdsbeslutning. Personmodellen, generelle kunnskapslag og litterær produksjon har sine egne avgrensninger.

## Avledet synkronisering som blokkerte PR-kontrollen

Den faste TypeScript-jobben bestod typesjekk og bygging, men stoppet deretter i `place-open:check`. Det samme avviket finnes på basen `666c1307`: Historiene i `data/runtime/stories-all/part-001.json` til `part-006.json` hadde foreldede shardgrenser. Generatoren og alle dens historiekilder er identiske mellom basen og denne PR-en.

Eksisterende `build-place-open-payloads.mjs` er brukt til å regenerere de seks filene. Den flate sekvensen med **552 historieobjekter er kontrollert som identisk før og etter**, inkludert ID-er, innhold og rekkefølge. Ingen kildehistorie eller History Go-kjernelogikk er endret. Alle seks filer følger generatorens 240 000-byte-grense, og `node scripts/build-place-open-payloads.mjs --check` består for alle 1 534 Place-open-payloads. Dette er en avledet synkronisering for å fjerne den konkrete CI-blokkeringen.
