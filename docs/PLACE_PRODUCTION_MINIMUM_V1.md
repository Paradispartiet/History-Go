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
3. **Quiz med fullquiz-kvalitetskontroll:** Minst **ti forskjellige, direkte og kildebelagte faktaspørsmål**, med korrekte svar, plausible distraktorer og stedsspesifikke forklaringer. Kontroller også den eksisterende *fulle* quizen, ikke bare ti spørsmål til kortet: fjern eller erstatt generiske metaspørsmål, interne History Go-uttrykk, repetisjon, løse påstander og spørsmål uten entydig kilde. Behold en kildebelagt fullquiz i gyldig `narrow|normal|rich|major`-profil dersom den finnes; `normal` er minst 4×7, `narrow` minst 3×7, ikke et universelt krav om nøyaktig fire sett. Verifiser unike ID-er, spørsmål–fasit–forklaring–kilde–Knowledge-paritet og korrekt manifest. Runtime stokker svaralternativene; ingen manuell fasitomstokking.
4. **QuizCard:** Ett reelt quizkort for samme sted med **de samme ti spørsmålene** og korrekt fasit. Gjenbruk et eksisterende QuizCard framfor å lage dubletter. Registrer korrekt `categoryId`, `targetId` og runtime-/PlaceCard-kobling.
5. **Egen kunnskapsside (Fagverk-sted):** Hvert ordinært sted skal ha en **stedsspesifikk, kildebelagt og fungerende** `fagverk`-blokk i sin canonical Place-fil, indeksert i `data/fagverk/fagverk_registry.json`, og tilgjengelig via `fagverk-sted.html?place=<place_id>`. Bruk `micro`, `standard` eller `full` etter dokumentert læringsjobb og nivåkrav i `place_fagverk_v2.schema.json`; et generisk kategorifallback, ren URL eller `in_production` teller ikke som v1. Kontroller fag/emne/kapittel-koblinger, særskilt artikkel, undersøkelser, kildehenvisninger, spor, lenker, runtime og reell sidevisning. Full `vFerdig` har fortsatt resten av den ordinære sjekklisten som tillegg.
6. **Publiserbar integrasjon og faktisk QA:** Riktig quizregistrering, Knowledge- og QuizCard-paritet, bilde-/PlaceCard-binding, Fagverk-side og avledede filer; målrettede kontraktstester, ordinær PR-CI **og dokumentert faktisk app-/browserkontroll** for sideåpning, quizkort og bilder på relevante skjermer. Manglende manuell eller nettleserbasert visning gir `v1_candidate`, ikke publisert `v1`.

7. **People – kildekoblede personer:** Undersøk alltid relevante People som del av den samme stedspakken. Finn eksisterende canonicale personer først og utvid den dokumenterte `places`-koblingen uten å flytte primærankeret eller opprette dubletter. Ta med de personene som har en etterprøvbar rolle på eller ved stedet (for eksempel arkitekter, kunstnere, beboere, arbeidere eller hendelsesaktører). Opprett nye profiler bare etter identitetskontroll, konkrete kildeclaims og bildereview. Personer uten tilstrekkelig kilde- eller bildeklarering føres som kandidater, ikke som godkjent People. **Ikke fyll en tallkvote med fjerne eller anekdotiske personer.** Kontroller aktiv People-manifest-/runtimebinding og faktisk visning før v1-godkjenning.

### Fagverk og fullquiz hører til samme v1-stedspakke

- **Fire parallelle redaksjonelle leveranser:** (1) spennende, dokumentert `desc` og `popupDesc`; (2) egen Place-eid Fagverk-side med unik historisk fagartikkel og undersøkelser; (3) kildekontroll av hele eksisterende fullquiz pluss de ti QuizCard-spørsmålene; (4) rettighetsklarerte bilder og faktisk appvisning. Kilder, påstander og historisk identitet deles; brukerrettet tekst, fagartikkel og quiz har forskjellige funksjoner.
- **Ingen ren statusinflasjon:** Å skrive ny Fagverk-blokk eller trimme en fullquiz er produksjon, ikke alene bevis for `v1`. Kilde-/substansaudit, registry/release og Place-open-materialisering, quizmanifest, QuizCard- og Knowledge-paritet, bildevisning og målrettet browser-QA må kontrolleres. Stedet forblir kandidat til gjenstående porter er bestått.
- **Eksisterende kvalitetsinnhold bevares:** Ikke forkort gode fullquizer for å treffe 10, 21 eller 28 spørsmål. Fjern bare identifiserte svake, dupliserte eller ukildede spørsmål; erstatt når kildene gir bedre lokale fakta og oppretthold profilminimumet.
- **Produksjonsbolk:** Produser Fagverk, tekst-QA, fullquiz-QA og bilder for de samme neste stedene med felles kildepakke. Del bare PR når canonical kontrakt krever isolasjon, f.eks. stedsbeskrivelse/claim-pakke fra Fagverk/quiz, og merge i riktig avhengighetsrekkefølge.

### Redaksjonell historiefortelling er en del av v1-porten

- Hvert nytt eller revidert sted skal få **redaksjonell kvalitetskontroll av både `desc` og `popupDesc`**, også når tidligere versjon er faktakontrollert. En svak tekst er ikke «ferdig» fordi den er kildebelagt eller validert. Gode eksisterende tekster beholdes; dokumenter konkrete feil før omskriving.
- **Skriv historie, ikke administrasjon:** led med det som faktisk skjedde, menneskene og bruken av stedet, historiske hendelser, valg, interesser og virkninger. Beskriv hva stedet representerer gjennom konkrete og kontrollerbare fakta, ikke abstrakte produksjonsuttrykk. Bygninger, produksjon, miljø, konflikt og endring skal få den plassen kildene fortjener.
- **Årstall er fortellerverktøy, ikke måltall:** ta med årstall ved vesentlige vendepunkter, men flytt lange rekker av etableringsår, eierskifter, endringsvedtak og andre registreringsdata til kronologi der de hører hjemme. Ingen datokvote og ingen kunstig dramatikk.
- **Bindende metode** ligger i `data/places/regler/PLACE_DESCRIPTION_CANONICAL.md` §9A, og sluttreview i `docs/PLACE_PRODUCTION_CHECKLIST.md`. Følg dokumentert kilde→claim→setningsparitet, oppdatert teksthash og separat faktareview/redaksjonell review ved tekstendringer. Reglene endres separat fra stedsinnhold.

### Visuell bildekvalitet er en del av v1-porten

- **Velg motivet før du beskjærer:** Bildet skal dokumentere det konkrete stedet og være visuelt leselig som liten miniatyr, stående PlaceCard og bredt toppbilde. Et tilfeldig hyggelig bilde fra serveringsstedet, nabolaget eller en konsert er ikke automatisk et godt stedsbilde. Unngå dominante biler, reklameflater, tom himmel og utsnitt som skjuler selve objektet.
- **Tre selvstendige bildevarianter:** `image` for stedsflaten, `frontImage` for stående PlaceCard og `cardImage` for kort/listning. Produksjonsmål for nye foto er henholdsvis **1400×900**, **900×1350** og **900×600** WebP. Velg og forhåndsvis hvert av de tre utsnittene fra lisensiert original, ikke bare ett felles sentrert autokutt.
- **Utsnitt i appen:** For historiske eller brede motiver som fungerer forskjellig i mobil og toppbanner, lagre `imageComposition.portraitPosition` og `imageComposition.heroPosition` som prosentverdier, f.eks. `"50% 60%"`. Stedsfoto kan fylle med `cover`; **hele QuizCard-illustrasjonen skal alltid vises med `contain`**, uten ekstra zoom.
- **Visuell gjennomgang:** Se et oversiktsark med faktisk stående 3:4-bilde og en simulert bred toppbeskjæring for hvert sted. Kontroller at hovedmotiv, skilting, arkitektur eller landskap fortsatt er synlig. Når mulig skal også PlaceCard, flipping til QuizCard, miniatur og toppbilde kontrolleres i kjørende app med smal mobilskjerm og bredere skjerm.
- **Rettigheter, representasjon og status:** Registrer fotograf, lisens, Commons-kilde og bearbeiding. Historiske malerier eller fotografier må merkes som slike, ikke som dagens utsikt. Et forhåndsvist bilde eller bestått CSS-/datatest gir **ikke** automatisk `v1`: faktisk app-visning må være dokumentert, ellers behold `v1_candidate` og registrer hva som gjenstår.
- **Effektivitet:** Gjennomfør motivvalg, tre utsnitt, visuell kontroll, stedsmetadata og runtime-materialisering som én produksjonsbolk. Hopp over uegnede eller rettighetsuavklarte motiver uten å blokkere resten. Bare endringsrelevante tester og ordinær PR-CI, ikke full katalogregresjon for hvert bilde.

**Eksisterende gode pakker skal ikke nedgraderes.** Hvis et sted har en større, kildebasert quiz, behold denne og bruk ti passende spørsmål på QuizCard – ikke fjern spørsmål bare for å oppnå nøyaktig ti. Tallet ti er *minimumet og målet for ny v1-quiz*, ikke et tak for tidligere fullført innhold.

### Teknisk kontrakt for ti-spørsmålsquiz

Arbeidsnavnet `minimum_v1_1x10` beskriver et **foreslått begrenset v1-format**. Den nåværende kanoniske fullquizstandarden har profilene `narrow`, `normal`, `rich` og `major` med henholdsvis minst 3×7, 4×7, 5–8×7 og 8–10×7 spørsmål. Den globale 2×7-regelen gjelder quiz med **minst to sett**.

Før v1-formatet tas i bruk for storpublisering, må quizparser, skjema, manifest, Knowledge-integrasjon og PlaceCard/QuizCard faktisk akseptere og spille ett sett à ti spørsmål. Ikke svekk fullquiz-validatorene eller merk uvaliderte data som publiserte. Fullproduksjonen følger fortsatt gjeldende `QUIZ_PRODUCTION_CANONICAL.md`.

## Nivå B: vFerdig – ordinær komplett stedsproduksjon

`vFerdig` betyr **fullført etter eksisterende stedssjekkliste**. Fagverk-siden er allerede et v1-krav og utvides ved behov til stedets fulle produksjonsprofil. Kronologi/epoker, Språkleksikon, kategori- og underbadge-styrt source review, kvalifiserte People/Objects/Brands/kategoriuttrykk, relevante Stories/Lesespor/før–etter, bilder, rikere quiz/Knowledge, full runtime-integrasjon og manuell sluttkontroll gjennomføres etter stedets dokumenterte profil.

Ikke fyll samlinger med kunstige personer eller objekter; bruk `BEGRUNNET_NA` når et reelt kandidatsøk ikke gir kvalifiserte funn, og `BLOCKED` når nødvendig bevis/asset faktisk mangler. Kun `vFerdig` kan tilsvare ordinær V3-`state: complete`, og bare når fullproduksjonens egne porter består.

**v1 er aldri synonymt med V3 `complete`.** Hold dette nivået utenfor V3s faste `major|standard|focused|micro`-profil og `PASS|BEGRUNNET_NA|BLOCKED`-verdier til en egen, gjennomført og validert nivåkontrakt eventuelt finnes.

## Produksjonskø og store bolker

1. **Ta én fersk katalog- og manifestoversikt.** Klassifiser steder i `vFerdig`, `v1`, `v1_kandidat`, `mangler_bilde`, `mangler_kilder` eller `ikke_startet`. De siste fire er arbeidskøetiketter, **ikke** nye canonicale V3-statusverdier. Ikke sett `v1` uten alle minimumsfeltene.
2. **Gjenbruk før nyproduksjon.** Finn godkjente `desc`, `popupDesc`, eksisterende bilder, fullquiz og QuizCards. Ikke skriv om godt historisk innhold, og ikke ødelegg fullproduserte steder.
3. **Bearbeid 20–50 steder per bolk**, helst innen samme geografiske/tematiske kildeområde. Kildeinnhenting, tekster, quiz, QuizCard, bildehåndtering, manifestkobling og avledede data gjøres samlet.
4. **To parallelle spor:** Der bilde og historisk tekst allerede finnes, revider historien og hele fullquizen ved behov, bygg en egen Fagverk-side og ferdigstill manglende quiz/QuizCard raskt. Der bilde mangler, produser tekst og quiz og legg stedet i en konkret, rettighetsstyrt bildekø. Dette stopper ikke resten av bolken.
5. **Vanskelige tilfeller parkeres**, med presis årsak, ikke med oppdiktede fakta, tilfeldige bilder eller falske PASS-markeringer. Et sted uten publiserbart bilde kan være innholdsprodusert, men er ikke ferdig `v1`.
6. **Publiser samlet.** En PR per stor bolk og én målrettet integrasjonskontroll etter at innholdet er produsert. La ordinær obligatorisk CI være mergeport. Full browser-/katalog-/sesongregresjon brukes bare ved faktisk bred teknisk endring eller avtalte milepæler; ikke ved hvert lite innholdstilskudd. Ikke gjenta allerede verifiserte merger.
7. **Oppgrader senere uten omstart.** vFerdig bygger videre på v1: behold kildeklarerte tekster, bilder, spørsmål og identiteter; legg til de moduler og den dybden som faktisk passer stedet.

### Minimumsstatusrapport per bolk

Rapporter alltid: antall kandidater, nye `v1`, nye `vFerdig`, steder med ferdig tekst/quiz som venter bilde, steder holdt tilbake av kilder/rettigheter, PR-lenke og **bekreftet** merge-/teststatus. Ikke bland «innhold skrevet», «klar til validering» og «publisert» i samme tall.

## Første produksjonsbolk og avgrensning

PR #6354 inneholder det innledende firestedsutkastet for Bislett, Majorstuen T-banestasjon, Nationaltheatret stasjon og Vøienvolden (til sammen 40 nye spørsmål). Dette er et **pågående integrasjonsarbeid**, ikke bevis på at v1-formatet er godkjent eller at alle fire stedene er publisert.

Tidligere metodeutkast lå i denne PR-en. Dokumentet her eier nå den varige redaksjonelle metoden, mens eksisterende kanoniske steds-, bilde- og quizkontrakter fortsatt eier teknisk validering og kravene til `vFerdig`.
