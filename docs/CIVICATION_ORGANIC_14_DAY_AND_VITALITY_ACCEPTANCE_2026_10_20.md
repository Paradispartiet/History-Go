# Civication – 14-dagers organisk spillerreise og balansering

Dato: 20. oktober 2026. Status: **pågående akseptanse**, ikke godkjent full gjennomspilling.

Dette er én samlet arbeidsbolk, slik at arbeidet med spillerreise ikke mister prioritet når psyke/energi balanseres. Ingen ny spillmotor, lagringsnøkkel, valuta eller gratis jobb/badge.

## Det som faktisk leveres i denne PR-en

- Life Story: +8 energi etter en fullført fortellingsdag, avgrenset til normal hvilegrense 85. Allerede høyere energi senkes ikke. Ved ekstrem utmattelse (energi <=20 før hvile) følger liten psyke-kostnad (-1). Ingen dag avanseres uten at eksisterende runner/dagport er oppfylt.
- Konkrete belastninger: ved energi <=30 får et arbeidskrevende valg (forfattet energikostnad <=-2) ytterligere psyke -1, og dersom psyke også <=30 reduseres handlingsrom -1. Ved lav psyke <=30 og krevende emosjonell situasjon (forfattet psyke-kostnad <=-2), men uten energi-trigger, reduseres energi -1. Alle ekstra effekter vises i konsekvensteksten, lagres én gang i eksisterende arkiv og gjelder ikke ved duplikatsvar.
- Energi, psyke og integritet følger spilleren ved rollebytte. Synlighet og handlingsrom forblir rolle-spesifikke. Ingen automatisk helbredelse ved å skifte jobb.
- Ekspeditør: egen dag-2-oppfølging når energi <=60, med tre forfattede løsninger (pause, be om hjelp, presse videre). Valg blir konkrete konsekvenser, og dagens erfaring huskes som flagg. Ingen konstruert lønn eller stilling.
- «Min dag»: synlig varsling om lav energi/psyke.

Terskler og tall er første **spillbalansehypoteser**, ikke medisinske normalverdier. De skal senere kalibreres med utfallet av organisk spillerreise, og må aldri tolkes som klinisk diagnose. Tidligere valg, konkrete historier og persistens skal bevares.

## Ærlig akseptansegate – 14 dager, fersk profil

Følgende må bevises sammenhengende i ekte UI, **uten** kunstig `merits_by_category`, injisert `CivicationLifePositions`, utviklerroller eller konstruerte tilbud:

| Dag | Scenario og kriterium |
| --- | --- |
| 1–3 | Frisk profil, arbeidsledig. Meldekort, arbeidssøknad, økonomi og bolig blir relevante. Alle valg lagres og blir synlige. |
| 4–7 | Møter, vennskap, konflikter og private valg. Tidligere valg styrer senere scene og reelt sosialt etterspill. Ingen duplikatmail eller dobbel dagsrullning. |
| 8–10 | Eksisterende fortelling videreføres bare når reell History Go-opptjening gir riktig livsposisjon; ekte jobb aksepteres bare via jobbtilbud. Private C01/C05-hendelser overlever jobbbytte. |
| 11–14 | 14 kalenderdager med jobb eller reell alternativ levevei. Gjennomfør jobbdag, privatliv, ukentlig inntekt/utgifter og senere effekter; prøv også avslag, slitenhet og gjenoppretting. |
| Konto | Lagre, oppdater, logg ut/inn og gjenopprett på nytt lagringsmiljø uten å miste historie, relasjoner, penger eller jobbstatus. |
| Sosialt | Samme NPC husker spillerens tidligere valg på tvers av fortelling, innboks og fysiske møter; sammenlign reell kanonisk relasjonstilstand. |
| Økonomi | Én spilluke utløser nøyaktig én riktig økonomisk avregning. Fortellingsøkonomi og kanonisk PC-wallet skal ikke forveksles. |

**Akseptanse krever alle punktene.** Den nye automatiske Node-testen starter med tom state og ingen testmerker, dokumenterer hvor langt authored historie kan spilles og rapporterer kapittelporten. Den **erstatter ikke** ekte nettleser-/konto- og History Go-tverrsystemtest. Et grønt testresultat betyr derfor ikke at hele tabellen er godkjent.

## Åpne risikoer som ikke skjules

1. `civicationEconomyEngine.js` beregner ukentlig lønn ut fra faktisk kalenderdato, mens CivicationCalendar har `dayIndex`. Det er ikke bevist at 7 spilldager alltid utløser riktig én økonomisk uke. Må måles og rettes uten utbetaling av to lønninger.
2. Life Story har egen relasjonstilstand, og `civicationRelationshipEngine.js` har egen sosial relasjon. Full kobling til NPC-samtale, etterspill og minne er ennå ikke bevist.
3. 34-dagerskapitler er ofte historietekst med meterdeltaer, ikke nødvendigvis konkrete handlinger. Flere scener skal ikke produseres før handlingskjeden er testet.
4. Rolle-/livsposisjonskrav og ekte History Go-badges må testes uten test-injeksjon; 14 dager skal ikke «oppnås» ved å hoppe over en blokkering.
5. Skylagring finnes i `CivicationCloudSave.js`, men skal kontrolleres med en reell ny innlogging og konflikt-/gjenopprettingsscenario.

## Neste smale tekniske prioritet

- Test organisk jobb/livsposisjon → tilbake til Civication → faktisk unlock.
- Samkjør simulerte uker med wallet-avregning og tydelige økonomikonsekvenser.
- Bind faktiske Life Story-relasjoner til eksisterende NPC-motor, med idempotens og personidentitet.
- Kjør virkelig 14-dagers browser playthrough og verifiser alle akseptansekriterier ovenfor.

Behold dette dokumentet som PR-spor; oppdater status når hver del er testet i faktisk spill. 
