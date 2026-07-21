# History Go – bindende innholdsstandard for stedsquiz v1

Denne standarden gjelder for aktive stedsquizfiler i `data/quiz/**`.

## Produksjonsrekkefølge

Quizproduksjonen skal alltid gå denne veien:

> **kilde og virkelighet → konkret påstand, hendelse eller observasjon → godt spørsmål → emnekobling som metadata**

Følgende produksjonsrekkefølge er feil:

> emne → sted → konstruert spørsmål som demonstrerer emnet

Emner, fagkart, begreper og teori kan organisere stoffet, men skal ikke være hovedkilden til det spilleren ser.

## Obligatorisk balanse

For en quiz med minst ti spørsmål skal innholdet samlet ligge omtrent her:

- **60–70 % konkrete faktaspørsmål**
- **20–30 % årsak, utvikling og sammenheng**
- **maks 10–15 % teori eller begreper**

Konkrete faktaspørsmål omfatter blant annet:

- personer
- datoer og perioder
- verk og bygninger
- tidligere og nåværende funksjon
- hendelser
- arkitektur og konstruksjon
- synlige spor
- bruk og stedsspesifikke detaljer

Årsak og sammenheng omfatter blant annet:

- hvorfor noe ble bygget, flyttet, revet eller endret
- hva en hendelse førte til
- hvorfor en løsning ble valgt
- hvordan en funksjon eller konflikt utviklet stedet

Teori og begreper er tillatt når de tilfører nødvendig presisjon. De skal normalt ligge i `emne_id`, `core_concepts`, `concept_focus`, `knowledge` eller annen metadata.

## Faglig bevaringsregel

Reparasjon av en quiz skal ikke avfagliggjøre den.

Når et svakt teorispørsmål fjernes, skal essensielle faguttrykk og relevante poenger fortsatt bevares på riktig sted:

- i et konkret og kildebelagt spørsmål når begrepet faktisk må forstås
- i `knowledge` når begrepet forklarer hvorfor svaret er riktig
- i `emne_id`, `core_concepts` og `concept_focus` som læringsmetadata
- i kunnskapspopupen når poenget er viktig, men ikke egner seg som flervalgsoppgave

Målet er ikke null teori. Målet er at teori skal forklare virkeligheten, ikke erstatte den.

Eksempler på gode, stedbundne fagbegreper:

- sosial infrastruktur ved et gratis bibliotek
- lav terskel i et offentlig tilbud uten kjøpspress
- termisk masse i betongdekker som demper temperatursvingninger
- nasjonalarena som fast scene for landslag og cupfinaler
- supporterkultur som sanger, farger, ritualer og minner knyttet til en arena

Slike begreper kan inngå i de 10–15 prosentene når de er nødvendige og spørsmålene fortsatt lærer spilleren noe konkret om stedet.

## Forbudte spørsmålsmaler

Disse formuleringene skal ikke brukes som standardproduksjon:

- «Hvorfor passer stedet til emnet …?»
- «Hva gjør stedet relevant for emnet …?»
- «Hvordan kan stedet leses som …?»
- «Hva er den mest presise faglige lesningen …?»
- «Hvilket begrep beskriver best stedet …?»
- «Hvilken teori eller teoretiker passer best …?»
- spørsmål som nevner fagplan, fagkart, emnekart, mapping eller topic hooks

Et spørsmål er også for svakt dersom det i praksis bare ber spilleren velge den lengste og mest akademiske formuleringen.

## Språk og variasjon

En quiz skal ikke bestå av samme syntaktiske mal gjentatt med nye substantiver.

Varier mellom naturlige spørsmål som:

- Hvem …?
- Når …?
- Hva lå her før …?
- Hvilken bygning, hendelse eller person …?
- Hvorfor ble …?
- Hva førte til …?
- Hvordan virker den konkrete løsningen …?
- Hvilket synlig spor viser …?
- Hva skiller dette stedet fra …?

Variasjon betyr ikke at alle spørsmål må være kreative. Et klart faktaspørsmål er bedre enn en kunstig analytisk formulering.

## Svaralternativer

Alle alternativer skal være plausible innen samme kategori og omtrent samme språklige nivå.

Ikke bruk:

- ett langt, nyansert korrekt svar mot to korte tullesvar
- åpenbart umulige distraktorer
- «bare», «aldri» eller «alltid» som enkel avsløring
- alternativer som tilhører helt andre fag eller tidsperioder uten grunn

Riktig svar skal vinnes med kunnskap eller forståelse, ikke med språkgjenkjenning.

## Kilderegel

Den synlige kunnskapen skal primært bygge på:

1. lokale og historiske kilder
2. offisielle institusjonssider
3. oppslagsverk, museer, arkiver og faglitteratur
4. verifiserbare observasjoner ved stedet

Interne emne- og fagfiler er veiledning og metadata, ikke tilstrekkelig kilde til synlige spørsmål.

## Kuttregel

Hvis det ikke finnes nok godt og verifiserbart stoff, skal quizen kortes ned.

Den skal ikke fylles ut med:

- emneparafraser
- gjentatte begrepsvalg
- konstruerte sammenligninger
- akademisk klingende fyllstoff
- trivielle spørsmål som bare eksisterer for å nå et bestemt antall

## Kontroll

Kjør:

```bash
npm run audit:quiz-content
```

For maskinlesbar rapport:

```bash
npm run audit:quiz-content:report
```

Auditen finner:

- brudd på 60/20/15-balansen
- forbudte emne- og lesningsmaler
- gjentatte spørsmålsåpninger på tvers av filer
- korrektalternativer som skiller seg mistenkelig ut i lengde
- JSON-filer som ikke kan leses

Auditen skal ikke fjerne eller straffe faguttrykk i `knowledge` eller metadata. Den kontrollerer hvordan spørsmålene er bygget.

`--strict` kan brukes når eksisterende arv er ryddet nok til at porten skal blokkere nye brudd.
