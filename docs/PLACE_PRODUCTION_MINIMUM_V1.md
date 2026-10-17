# History Go – stedsproduksjon i to nivåer: v1 og vFerdig

**Status:** Vedtatt redaksjonell produksjonsmetode 17. oktober 2026. Implementering av særskilt 10-spørsmålsprofil og dens runtime-/CI-kontrakt må valideres før nye v1-steder erklæres publisert.  
**Omfang:** Alle ikke-ferdigproduserte steder i katalogen, med Micro Places vurdert mot sin særkontrakt.  
**Fullproduksjonens kilde:** `docs/PLACE_PRODUCTION_CHECKLIST.md`. Ingen av kravene i fullproduksjonen oppheves av dette dokumentet.

## Målet

Gi først alle gjenstående steder et **reelt minimum av spillbart, stedsspesifikt innhold**; utvid deretter til komplett produksjon. v1 og vFerdig er *modenhetsnivåer*, ikke nye Badge-kategorier, V3-produksjonsprofiler eller konkurrerende kilder til stedsfakta.

Prioriter å produsere innhold i **20–50 stedsbolker**. Ikke bruk én PR, én full CI eller et særskilt administrativt løp per enkeltsted.

## Nivå A: v1 – minimum som faktisk kan brukes

Et ordinært sted kan betegnes `v1` først når alle disse punktene er oppfylt:

1. **Sted og historisk tekst:** Sikker `place_id`, riktig fysisk sted, kartkoordinater og kategori; en kort, naturlig historisk ingress (`desc`) og selvstendig historisk stedartikkel (`popupDesc`), begge konkrete, kildebelagte og frie for generisk spill-/produksjonsprosa. Gjenbruk ferdige tekster; skriv bare det som faktisk mangler.
2. **Bilde:** Minst ett relevant, identitetskontrollert stedbilde med sporbar kilde, bruksrett og korrekt bildefelt. Der den eksisterende PlaceCard-flippen krever `frontImage`, må dette være en **egen faktisk stående bildefil**, ikke `image` kopiert, beskåret med CSS eller en tilfeldig illustrasjon. Ikke marker bildefeltet ferdig hvis fil, rettighet eller faktisk visning mangler.
3. **Quiz:** **Ti forskjellige, direkte og kildebelagte faktaspørsmål**, med korrekte svar, plausible distraktorer og stedsspesifikke forklaringer. Hver oppgave kontrolleres mot dokumenterte fakta. Ikke still generiske spørsmål om «hvilket fagområde som passer», «hva slags quizspørsmål dette er» eller oppdiktede hendelser. Runtime stokker allerede svaralternativene; ingen manuell omstokking av fasitposisjoner.
4. **QuizCard:** Ett reelt quizkort for samme sted med **de samme ti spørsmålene** og korrekt fasit. Gjenbruk et eksisterende QuizCard framfor å lage dubletter. Registrer korrekt `categoryId`, `targetId` og runtime-/PlaceCard-kobling.
5. **Publiserbar integrasjon:** Riktig quizregistrering, image/QuizCard-binding og nødvendig materialisering til runtime; én målrettet relevant kontroll av den ferdige bolken, samt ordinær PR-mergeport.

**Eksisterende gode pakker skal ikke nedgraderes.** Hvis et sted har en større, kildebasert quiz, behold denne og bruk ti passende spørsmål på QuizCard – ikke fjern spørsmål bare for å oppnå nøyaktig ti. Tallet ti er *minimumet og målet for ny v1-quiz*, ikke et tak for tidligere fullført innhold.

### Teknisk kontrakt for ti-spørsmålsquiz

Arbeidsnavnet `minimum_v1_1x10` beskriver et **foreslått begrenset v1-format**. Den nåværende kanoniske fullquizstandarden har profilene `narrow`, `normal`, `rich` og `major` med henholdsvis minst 3×7, 4×7, 5–8×7 og 8–10×7 spørsmål. Den globale 2×7-regelen gjelder quiz med **minst to sett**.

Før v1-formatet tas i bruk for storpublisering, må quizparser, skjema, manifest, Knowledge-integrasjon og PlaceCard/QuizCard faktisk akseptere og spille ett sett à ti spørsmål. Ikke svekk fullquiz-validatorene eller merk uvaliderte data som publiserte. Fullproduksjonen følger fortsatt gjeldende `QUIZ_PRODUCTION_CANONICAL.md`.

## Nivå B: vFerdig – ordinær komplett stedsproduksjon

`vFerdig` betyr **fullført etter eksisterende stedssjekkliste**. Full Fagverk-side, kronologi/epoker, Språkleksikon, kategori- og underbadge-styrt source review, kvalifiserte People/Objects/Brands/kategoriuttrykk, relevante Stories/Lesespor/før–etter, bilder, rikere quiz/Knowledge, full runtime-integrasjon og manuell sluttkontroll gjennomføres etter stedets dokumenterte profil.

Ikke fyll samlinger med kunstige personer eller objekter; bruk `BEGRUNNET_NA` når et reelt kandidatsøk ikke gir kvalifiserte funn, og `BLOCKED` når nødvendig bevis/asset faktisk mangler. Kun `vFerdig` kan tilsvare ordinær V3-`state: complete`, og bare når fullproduksjonens egne porter består.

**v1 er aldri synonymt med V3 `complete`.** Hold dette nivået utenfor V3s faste `major|standard|focused|micro`-profil og `PASS|BEGRUNNET_NA|BLOCKED`-verdier til en egen, gjennomført og validert nivåkontrakt eventuelt finnes.

## Produksjonskø og store bolker

1. **Ta én fersk katalog- og manifestoversikt.** Klassifiser steder i `vFerdig`, `v1`, `v1_kandidat`, `mangler_bilde`, `mangler_kilder` eller `ikke_startet`. De siste fire er arbeidskøetiketter, **ikke** nye canonicale V3-statusverdier. Ikke sett `v1` uten alle minimumsfeltene.
2. **Gjenbruk før nyproduksjon.** Finn godkjente `desc`, `popupDesc`, eksisterende bilder, fullquiz og QuizCards. Ikke skriv om godt historisk innhold, og ikke ødelegg fullproduserte steder.
3. **Bearbeid 20–50 steder per bolk**, helst innen samme geografiske/tematiske kildeområde. Kildeinnhenting, tekster, quiz, QuizCard, bildehåndtering, manifestkobling og avledede data gjøres samlet.
4. **To parallelle spor:** Der bilde og historisk tekst allerede finnes, ferdigstill manglende quiz/QuizCard raskt. Der bilde mangler, produser tekst og quiz og legg stedet i en konkret, rettighetsstyrt bildekø. Dette stopper ikke resten av bolken.
5. **Vanskelige tilfeller parkeres**, med presis årsak, ikke med oppdiktede fakta, tilfeldige bilder eller falske PASS-markeringer. Et sted uten publiserbart bilde kan være innholdsprodusert, men er ikke ferdig `v1`.
6. **Publiser samlet.** En PR per stor bolk og én målrettet integrasjonskontroll etter at innholdet er produsert. La ordinær obligatorisk CI være mergeport. Full browser-/katalog-/sesongregresjon brukes bare ved faktisk bred teknisk endring eller avtalte milepæler; ikke ved hvert lite innholdstilskudd. Ikke gjenta allerede verifiserte merger.
7. **Oppgrader senere uten omstart.** vFerdig bygger videre på v1: behold kildeklarerte tekster, bilder, spørsmål og identiteter; legg til de moduler og den dybden som faktisk passer stedet.

### Minimumsstatusrapport per bolk

Rapporter alltid: antall kandidater, nye `v1`, nye `vFerdig`, steder med ferdig tekst/quiz som venter bilde, steder holdt tilbake av kilder/rettigheter, PR-lenke og **bekreftet** merge-/teststatus. Ikke bland «innhold skrevet», «klar til validering» og «publisert» i samme tall.

## Første produksjonsbolk og avgrensning

PR #6354 inneholder det innledende firestedsutkastet for Bislett, Majorstuen T-banestasjon, Nationaltheatret stasjon og Vøienvolden (til sammen 40 nye spørsmål). Dette er et **pågående integrasjonsarbeid**, ikke bevis på at v1-formatet er godkjent eller at alle fire stedene er publisert.

Tidligere metodeutkast lå i denne PR-en. Dokumentet her eier nå den varige redaksjonelle metoden, mens eksisterende kanoniske steds-, bilde- og quizkontrakter fortsatt eier teknisk validering og kravene til `vFerdig`.
