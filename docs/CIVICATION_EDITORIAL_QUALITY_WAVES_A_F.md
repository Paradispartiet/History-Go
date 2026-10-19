# Civication – redaksjonell kvalitetsrevisjon A–F

Status: under redaksjonell gjennomgang. PR #6382 skal stå som **draft**, uten automatisk merge.

## Mål

Civication skal fortelle troverdige livshistorier, ikke være en løpende saksrapport. Spilleren skal møte personer med navn og særpreg, konkrete situasjoner, et forståelig dilemma og minst to genuint forskjellige måter å reagere på. Fortellingen kan være lavmælt, men den må bevege seg.

Sporbarhet, tidligere valg, dager mellom hendelser, rettigheter og kildegrenser håndteres av data og spillmotor. Synlig tekst forklarer bare forbehold når et menneske faktisk trenger å forstå dem for å velge.

## Utført på Wave F-grenen

- Alle 68 scener / 136 valg i Wave F er redaksjonelt omskrevet, med uendrede scene-ID-er, choice-ID-er, inngangsvilkår og effektflagg. Gjennomgang på PR-grenen; ingen merge.
- 12 Wave E-scener i C05 er omskrevet for å binde ventingen hos NAV til vanlige gjøremål, økonomisk usikkerhet og forholdet til andre mennesker.
- Gjentatte rollebetegnelser er erstattet av eksisterende/tilknyttede navn i de eldre historieløpene: Mira (musikk), Lea (prosjekt), Arvid (miljø). Disse er kun presentasjonsendringer; tekniske rollekoder, relasjonsnøkler og scene-ID-er beholdes.
- Den gamle NAV-scenen der en telefonsamtale løste både meldekort og arbeidsdokumentasjon er korrigert. Samtalen kan gi veiledning, men utløser ikke flagg for dokumenter som ikke er sendt. En målrettet regresjonstest dekker dette.
- I Wave F har 38 av 136 valg fått en tilleggsvirkning utover flagg, i 35 av 68 scener, med nøkterne utslag der en handling faktisk påvirker energi, psyke, relasjon eller integritet. Andre valg er bevisst uten tallverdi; ikke gi kunstige målerutslag for å oppnå 100 prosent.
- Andelen Wave F-beskrivelser med ordet «ikke», «ingen», «uten» eller «aldri» er redusert fra 62 til 41 av 68. Dette er kun en indikator på språkendringen, ikke en litterær kvalitetstest.

## Redaksjonell sjekkliste for neste pass

1. **Hendelse:** Hva skjer med spilleren i akkurat denne scenen? En ny sansning, samtale, handling, bekymring eller praktisk hindring må bære teksten.
2. **Person:** Navngitte mennesker skal ha forskjellig motivasjon og talemåte. Ikke la rollebetegnelsen erstatte et menneske.
3. **Valg:** To valg skal være reelt ulike i kostnad, prioritet eller forhold til andre. «Skriv et notat» vs. «skriv et annet notat» er ikke nok.
4. **Utvikling:** Et uløst problem kan følge spilleren over tid, men en ny scene må tilføre en opplevelse, kostnad, sidevirkning eller relasjonell forskyvning.
5. **Logikk:** Ingen møtebekreftelse, godkjenning, betaling, jobb, kvittering, fysisk utbedring eller forsoning kan oppstå retroaktivt. Nye faktiske hendelser må framgå av en scene eller en eksplisitt valgt handling.
6. **Tid:** Replikker bruker «i morgen», ukedager eller konkrete datoer i stedet for interne livsdager. Dager i data brukes til å styre løypa, ikke som naturlig talespråk.
7. **Naturlig språk:** Les scenen og begge valgene høyt. Kutt forklaringer på registerstatus når innsatsen kan vises gjennom situasjonen.
8. **Konsekvens:** Kontroller både de umiddelbare målerutslagene, den faktisk valgte handlingen og om senere oppfølging bygger på denne – uten å late som en etterfølgende scene er en bekreftelse fra tredjepart.

## Gjenstående før redaksjonell godkjenning

Denne revisjonen er **ikke** en full litterær godkjenning av alle 217 scener i A–F. Flere tidligere scener, spesielt i C01–C07, trenger fortsatt sammenhengende gjennomspilling og selektiv omskriving. Forutgående scenevalg og deres konsekvenstekster må leses samlet mot nye Wave F-scener for å fange overgangsfeil. De faktiske meter-effektene må verifiseres i spillmotoren, og hele løpene bør spilles av mennesker på norsk. Ingen av de automatiske testene kan bevise naturlig dialog eller god dramatikk.

**Publiseringskrav:** Én relevant teknisk kontroll på siste commit, samt en faktisk redaksjonell gjennomspilling av de åtte hele historieløpene. Ikke start Wave G før kvaliteten i A–F er tilfredsstillende. Ikke utvid administrative QA-systemer i stedet for å forbedre historiene.
