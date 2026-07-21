# Quizgenerator-regler for BY v1.1

Denne filen skal leses sammen med `QUIZ_INNHOLDSSTANDARD_V1.md`. Innholdsstandarden er bindende dersom eldre eksempler eller profiler peker i en annen retning.

## Hovedregel

Spørsmål skal genereres slik:

> **ekstern kilde eller konkret observasjon → verifiserbar påstand → spørsmålsvinkel → konkret spørsmål → emnekobling som metadata**

Et emne får aldri være startpunktet for synlig quizinnhold. `quiz_profile`, emner og fagkart kan hjelpe generatoren å variere spørsmål og knytte dem til læringssystemet, men de kan ikke erstatte faktisk kunnskap om stedet.

## Innholdsbalanse

For quizpakker med minst ti spørsmål:

- 60–70 % konkrete fakta
- 20–30 % årsak, endring og sammenheng
- maks 10–15 % teori og begreper

Hvis kildestoffet ikke bærer denne balansen, skal quizen kortes ned.

## Bindinger generatoren må følge

- Minst tre ulike spørsmålsfamilier per sett.
- Minst to stedsspesifikke trekk per sett.
- Minst ett konkret historisk, fysisk eller funksjonelt holdepunkt per spørsmål.
- Maks ett nødvendig definisjons- eller begrepsspørsmål per sett.
- Emne- og teorifelt skal primært ligge i metadata og `knowledge`.
- Kontrastspørsmål krever en reell og kildebelagt forskjell, ikke en konstruert emnesammenligning.
- Spørsmål med samme seksordsåpning skal ikke masseproduseres på tvers av steder.
- Riktig svar skal ikke være lett å finne fordi det er mye lengre eller mer akademisk enn distraktorene.

## Blokkerte formuleringer

- Hvorfor passer stedet til emnet ...
- Hva gjør stedet relevant for emnet ...
- Hva gjør stedet til et eksempel på ...
- Hvordan kan stedet leses som ...
- Hva er den mest presise faglige lesningen ...
- Hvilket begrep passer eller beskriver best ...
- Hvilken teori, teoretiker, metode eller hook passer best ...
- Hvordan fungerer stedet som byrom ... når spørsmålet bare parafraserer et emne

## Foretrukne åpninger

- Hvem ...
- Når ...
- Hva skjedde ...
- Hva lå her før ...
- Hvorfor ble ...
- Hva førte til ...
- Hvilket spor viser ...
- Hvilken løsning gjør ...
- Hva skiller ...
- Hvordan virker den konkrete løsningen ...

## Spørsmålsfamilier

### konkret_fakta

Personer, datoer, verk, bygninger, funksjoner, hendelser og dokumenterte detaljer.

### historisk_endring

Hva stedet var før, hva som ble flyttet, revet, bygget eller endret, og hva endringen førte til.

### teknisk_fysisk

Konstruksjon, infrastruktur, materiale, arkitektonisk løsning eller synlig fysisk spor.

### bruk

Faktisk bruk, aktiviteter, brukergrupper og funksjoner. Unngå generisk språk om «byliv» når en konkret aktivitet kan spørres om.

### årsak_sammenheng

Hvorfor en beslutning ble tatt, hvorfor en løsning virker, eller hvordan en hendelse påvirket stedet.

### observasjon

Noe spilleren faktisk kan se eller kontrollere på stedet. Observasjonen må ha et presist fasitsvar.

### kontrast

En konkret og kildebelagt forskjell mot et navngitt sammenligningssted. Kontrast er ikke en unnskyldning for å dikte en abstrakt emneoppgave.

### teori_begrep

Tillatt i liten mengde når begrepet gir nødvendig presisjon. Spørsmålet skal fortsatt lære spilleren noe vesentlig om stedet.

## Knowledge-regel

`knowledge` skal forklare hvorfor svaret er riktig og legge til relevant kontekst. Det skal ikke bare gjenta korrekt alternativ eller skjule en ny teorileksjon som ikke hører til spørsmålet.

## Kilderegel

Synlig innhold skal hovedsakelig bygge på lokale historiekilder, offisielle institusjonssider, arkiv, museum, oppslagsverk, faglitteratur eller verifiserbar observasjon. Interne emnefiler er veiledning, ikke kildebelegg.

## Kontroll

Kjør `npm run audit:quiz-content` før nye større quizbatcher publiseres.
