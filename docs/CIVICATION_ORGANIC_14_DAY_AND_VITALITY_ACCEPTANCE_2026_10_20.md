# Civication – 21-dagers organisk spillerreise og balansering

Dato: 20. oktober 2026. Status: **21-dagers mål vedtatt 21.10.2026; under utvikling**, ikke godkjent full nettleser-/kontoakseptanse.

Dette er én samlet arbeidsbolk, slik at arbeidet med spillerreise ikke mister prioritet når psyke/energi balanseres. Ingen ny spillmotor, lagringsnøkkel, valuta eller gratis jobb/badge.

## Det som faktisk leveres i denne PR-en

- Life Story: +8 energi etter en fullført fortellingsdag, avgrenset til normal hvilegrense 85. Allerede høyere energi senkes ikke. Ved ekstrem utmattelse (energi <=20 før hvile) følger liten psyke-kostnad (-1). Ingen dag avanseres uten at eksisterende runner/dagport er oppfylt.
- Konkrete belastninger: ved energi <=30 får et arbeidskrevende valg (forfattet energikostnad <=-2) ytterligere psyke -1, og dersom psyke også <=30 reduseres handlingsrom -1. Ved lav psyke <=30 og krevende emosjonell situasjon (forfattet psyke-kostnad <=-2), men uten energi-trigger, reduseres energi -1. Alle ekstra effekter vises i konsekvensteksten, lagres én gang i eksisterende arkiv og gjelder ikke ved duplikatsvar.
- Energi, psyke og integritet følger spilleren ved rollebytte. Synlighet og handlingsrom forblir rolle-spesifikke. Ingen automatisk helbredelse ved å skifte jobb.
- Ekspeditør: egen dag-2-oppfølging når energi <=60, med tre forfattede løsninger (pause, be om hjelp, presse videre). Valg blir konkrete konsekvenser, og dagens erfaring huskes som flagg. Ingen konstruert lønn eller stilling.
- «Min dag»: synlig varsling om lav energi/psyke.

Terskler og tall er første **spillbalansehypoteser**, ikke medisinske normalverdier. De skal senere kalibreres med utfallet av organisk spillerreise, og må aldri tolkes som klinisk diagnose. Tidligere valg, konkrete historier og persistens skal bevares.

## Ny hovedakseptanse – 21 dager (vedtatt 21.10.2026)


**Frivillig jobb innen tre uker:** Dag 12 kan spilleren søke butikkjobb, dag 17 kan vedkommende delta på intervju, og dag 20 kan et skriftlig tilbud registreres i spillets kanoniske Karriere-løsning. Tilbudet må aksepteres av spilleren separat. Alle tre tidligere spillvalg valideres mot Life Story-arkivet før tilbudet opprettes. Ingen jobb oppstår ved å bare gå 21 dager. Å avslå underveis bevarer privatlivet og valgte livsretning.



Spilleren skal kunne leve **tre uker**, ikke bare 14 dager, og utvikle en faktisk livsretning gjennom handlinger. Arbeidsledighet forblir arbeidssituasjon, ikke en påtvunget identitet. Dagene må ha særskilte valg og konsekvenser; ikke 21 identiske meldekort. **Dag 8–21** har nå egne, forfattede private scener i `wave_e_c21_livsretning`, med tre spor: nærmiljø, skaping og læring. Dag 9 og 16 krever gjennomførte aktiviteter for å kunne erverve en praksisbasert livsposisjon. Ved dag 21 må spilleren selv velge om identiteten skal aktiveres i eksisterende Livsprofil. Denne praksisbaserte livsposisjonen kan ikke tildele arbeidsforhold, Badge, inntekt eller kompetanse den ikke har bevis for.

**21-dagers Node-akseptanse på PR-gren:** 3 spor med alle dager 1–21, private scener på hver dag 8–21, ingen merittinjeksjon, og korrekt bevaring av privat historie ved jobbbytte. Dette er bare én del av akseptansen; faktisk nettleserspill, ekte konto-gjenoppretting, relasjoner, økonomi og History Go skal fortsatt godkjennes separat.

| Periode | Akseptanse |
| --- | --- |
| Dag 1–7 | Ordinært liv, økonomi, NAV og de første sosiale valgene. Ingen identitetssperre for dag 8. |
| Dag 8–14 | Første egen aktivitet, små møter, hverdagsplikt og etterspill uten repeterte arbeidsledighetsmailer. |
| Dag 15–21 | En ny faktisk aktivitet, personlig grensesetting, økonomibalanse, dokumentasjon og frivillig livsposisjonsvalg. |
| Etter dag 21 | Ingen oppdiktet ny jobb eller særkapittel. Nye livsverdener må bygge på faktisk valgt posisjon/meritter, eller videre ordinær privatlivsproduksjon. |

## Tidligere akseptansegate – 14 dager (historisk delmål)

Følgende må bevises sammenhengende i ekte UI, **uten** kunstig `merits_by_category`, injisert `CivicationLifePositions`, utviklerroller eller konstruerte tilbud:

| Dag | Scenario og kriterium |
| --- | --- |
| 1–3 | Frisk profil, arbeidsledig. Meldekort, arbeidssøknad, økonomi og bolig blir relevante. Alle valg lagres og blir synlige. |
| 4–7 | Møter, vennskap, konflikter og private valg. Tidligere valg styrer senere scene og reelt sosialt etterspill. Ingen duplikatmail eller dobbel dagsrullning. |
| 8–10 | **Arbeidsledig fortsetter private Life Stories også helt uten History Go-meritter, livsposisjon eller jobbtilbud.** Separat valgfritt kapittel åpnes kun med faktisk dokumentert History Go-opptjening og frivillig livsposisjon; ekte jobb aksepteres bare via jobbtilbud. Private C01/C05-hendelser overlever jobbbytte. |
| 11–14 | Fullfør 14 spilldager **også som fortsatt arbeidsledig**, med private hendelser, økonomisk utvikling, mulige ytelser, utgifter, relasjoner og etterspill. Test i tillegg jobb eller faktisk alternativ levevei; ingen tvangsaktivering av livsposisjon og ingen fiktiv inntekt. |
| Konto | Lagre, oppdater, logg ut/inn og gjenopprett på nytt lagringsmiljø uten å miste historie, relasjoner, penger eller jobbstatus. |
| Sosialt | Samme NPC husker spillerens tidligere valg på tvers av fortelling, innboks og fysiske møter; sammenlign reell kanonisk relasjonstilstand. |
| Økonomi | Én spilluke utløser nøyaktig én riktig økonomisk avregning. Fortellingsøkonomi og kanonisk PC-wallet skal ikke forveksles. |

**Akseptanse krever alle punktene.** Den nye automatiske Node-testen starter med tom state og ingen testmerker, dokumenterer hvor langt authored historie kan spilles og rapporterer kapittelporten. Den **erstatter ikke** ekte nettleser-/konto- og History Go-tverrsystemtest. Et grønt testresultat betyr derfor ikke at hele tabellen er godkjent.

## Akseptanse: History Go og skill scores som del av livet (21.10.2026)

Eiergrenser, seks foreslåtte ferdigheter og kildebasert utvikling er samlet i [CIVICATION_PLAYER_GROWTH_AND_HISTORY_GO_CONTRACT.md](CIVICATION_PLAYER_GROWTH_AND_HISTORY_GO_CONTRACT.md). Denne akseptansen må ikke rapporteres som bestått på grunnlag av dokumentasjon alene.

**Eksisterende funksjon vs. planlagt funksjon må skilles i testresultatene.** Profilbroen leser allerede `visited_places`, `people_collected`, `merits_by_category` og læringsloggen og vekter private sceneemner. Det er ikke bevis for at seks varige ferdighetsskalaer eller full miljøspesifikk streetkred finnes. Følgende er akseptansekriterier for neste implementeringsbolk, ikke passerende tester:

1. En fersk arbeidsledig profil skal kunne gjennomføre dag 1–14 og senere dager med relevante privatlivshistorier **uten** Badge-poeng, livsposisjon eller jobb. Dag 7 skal vise `Fortsett privatlivet` ved ventende scener og valgfri History Go-veiledning samtidig.
2. Et dokumentert besøk i History Go gir korrekt registrert sted og kan påvirke stedlig samtalekontekst, men **ikke** automatisk korrekt quiz, visdomspoeng, relasjon, jobb eller lønn. Quizpoeng må komme fra reelt lagret quizresultat.
3. Historisk kunnskap eller observasjon skal endre et relevant fremtidig scenetilbud eller beslutningsgrunnlag **bare når domenet matcher**. Utforskning kan gi samtaler og interessebaserte invitasjoner uten å gjøre fiktive kontakter til venner.
4. Seks skill scores (visdom/dømmekraft, sosial teft, kreativitet, praktisk mestring, formidling, handlekraft) skal, når implementert, ha konkret score-/hendelseseier, 0–100-balansetest, unike kildehendelser, idempotent XP, reell virkning på minst én scenetype per ferdighet og pålitelig save/restore. Ingen skills tildeles automatisk for UI-klikk eller gjentatt identisk aktivitet.
5. Streetkred skal kontrolleres per faktisk miljø/aktør, med både positive og negative følger. Subkulturell kapital og generelt omdømme skal ikke endres som et globalt speil av streetkred; kvalifikasjoner, ansettelse og myndighet er egne porter.
6. Samlingen skal vises likt etter ny innlogging og på tvers av `index.html` / `Civication.html`. Companion-toast og navigasjon må aldri fullføre oppdrag eller utstede badge/skills alene. Sjekk ingen doble poeng etter reload, retry eller retur.
7. Én spillfigur bør prøves gjennom minst 30 dager som arbeidsledig, med vedvarende privatliv og økonomiske realiteter. Dette er et *framtidig* langløpskrav og ikke et påstått nåværende testresultat.

## Åpne risikoer som ikke skjules

1. `civicationEconomyEngine.js` beregner ukentlig lønn ut fra faktisk kalenderdato, mens CivicationCalendar har `dayIndex`. Det er ikke bevist at 7 spilldager alltid utløser riktig én økonomisk uke. Må måles og rettes uten utbetaling av to lønninger.
2. Life Story har egen relasjonstilstand, og `civicationRelationshipEngine.js` har egen sosial relasjon. Full kobling til NPC-samtale, etterspill og minne er ennå ikke bevist.
3. 34-dagerskapitler er ofte historietekst med meterdeltaer, ikke nødvendigvis konkrete handlinger. Flere scener skal ikke produseres før handlingskjeden er testet.
4. Badge-/livsposisjonskrav må testes på *valgfrie særkapitler*, ikke som vilkår for vanlige private Life Stories. 14 dager skal ikke «oppnås» ved å hoppe over faktiske dagsporter, ved test-injeksjon eller ved å låse opp et særkapittel gratis.
5. Skylagring finnes i `CivicationCloudSave.js`, men skal kontrolleres med en reell ny innlogging og konflikt-/gjenopprettingsscenario.

## Neste smale tekniske prioritet

- Test organisk jobb/livsposisjon → tilbake til Civication → faktisk unlock.
- Samkjør simulerte uker med wallet-avregning og tydelige økonomikonsekvenser.
- Bind faktiske Life Story-relasjoner til eksisterende NPC-motor, med idempotens og personidentitet.
- Kjør virkelig 14-dagers browser playthrough og verifiser alle akseptansekriterier ovenfor.

Behold dette dokumentet som PR-spor; oppdater status når hver del er testet i faktisk spill. 
