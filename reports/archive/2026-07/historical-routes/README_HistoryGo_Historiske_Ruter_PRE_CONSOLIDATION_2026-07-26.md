# History Go — Historiske ruter

## Arbeidsstatus

Dette dokumentet beskriver en ny hovedfeature i History Go: **Historiske ruter**. Funksjonen springer ut av ideen om BackToTheFuture, men presiseres her som en bredere History Go-modus der brukeren kan reise gjennom historiske ferdselsårer, gamle veier, seilingsleder, handelslinjer, fluktruter, smuglerruter, pilegrimsveier, militære marsjruter, postveier, migrasjonsruter og andre historiske bevegelsessystemer. Kjernen er ikke en moderne turforslag-funksjon. Kjernen er en tekstuell historisk reise gjennom ruter slik de fungerte den gangen, med steder, personer, hendelser, varer, konflikter, farer og historiske dramaer knyttet til ruten.

## Kort definisjon

**Historiske ruter** er en History Go-feature der ruten fungerer som en narrativ ryggrad. Brukeren kan spille ruten online som en tekstuell historisk reise, og senere samle ruten fysisk ved å besøke faktiske steder langs eller knyttet til ruten. Online-modus gjør ruten tilgjengelig som historisk læringsspill uansett hvor brukeren befinner seg. Fysisk modus gir dypere samling, GPS-bekreftede stopp, sterkere badge/progresjon og en tydelig “jeg var der”-status.

Den grunnleggende setningen for funksjonen er:

> Online = du reiser historien. Fysisk = du samler sporene etter den.

## Plassering i History Go

Historiske ruter skal ligge i History Go, ikke som egen app og ikke som et isolert BackToTheFuture-system. BackToTheFuture kan brukes som navn på en opplevelsesmodus, undertittel eller visuell/tidsreiseorientert inngang, men hovedfeature-navnet bør være **Historiske ruter**.

Riktig konseptuell plassering:

```txt
History Go
  └─ Ruter
       └─ Historiske ruter
            ├─ Online historisk reise
            └─ Fysisk rutesamling
```

Nextup kan senere foreslå historiske ruter, men Nextup er bare inngangen som anbefaler hva brukeren kan gjøre nå. Selve spillet, samlingen, progresjonen og ruten hører til History Go.

## Forskjell fra vanlige ruter

Vanlige ruter binder sammen steder i en geografisk rekkefølge.

Historiske ruter binder sammen **historiske bevegelseslinjer**.

Vanlig rute:

```txt
sted → sted → sted
```

Historisk rute:

```txt
reise → epoke → landskap → fare → stopp → drama → neste kapittel
```

Ruten er ikke bare en linje på kartet. Ruten er fortellingen. Stedene er kapitler i ruten.

## Kjerneprinsipper

1. Ruten er hovedpersonen.
2. Steder langs ruten er kapitler, terskler, spor eller dramatiske knutepunkter.
3. Hver rute skal ha en historisk bevegelseslogikk: handel, flukt, krig, pilegrim, smugling, post, sjøfart, migrasjon, ekspedisjon, arbeid, ideer eller makt.
4. Ruten skal kunne spilles online som tekstuell historisk reise.
5. Ruten skal kunne samles fysisk gjennom History Go-besøk.
6. Fysisk besøk skal gi sterkere status enn online fullføring, men online-spill skal være en fullverdig læringsopplevelse.
7. Ruter skal gjenbruke eksisterende History Go-steder der de finnes.
8. Nye rute-stopp skal kunne være både konkrete places, omtrentlige historiske punkter, regioner, havner, fjellpass, elveløp, sjøområder eller tekstuelle etapper.
9. Ruten skal kunne låse opp personer, hendelser, objekter, quiz, Lesespor, Wonderkammer-objekter, badges og nye steder.
10. Progresjon som påvirker brukerprofilen må trigge `window.dispatchEvent(new Event("updateProfile"));`.

## To spillmoduser

### 1. Online historisk reise

Online-modus lar brukeren spille ruten hjemmefra eller hvor som helst. Dette er den tekstuelle hovedreisen. Brukeren leser og spiller seg gjennom kapitler, valg, quiz, kartpunkter, personer, objekter og historiske situasjoner.

Eksempel:

```txt
Du følger en gammel smuglerrute langs Oslofjorden. Det er natt. Lasten ligger under fiskekassene. Du vet at tollvaktene følger lyktene langs kaia, men du har fått høre om en vik lenger sør der båter kan gli inn uten å bli sett.
```

Online-modus kan inneholde:

- introfortelling
- historisk premiss
- kapitler
- stopp
- valg
- quiz
- minikart
- gjenstander
- personer
- risikomåler
- omdømmemåler
- forsyningsmåler
- tidslinje
- kilder/Lesespor
- unlocks
- online-badge

Online-modus skal ikke være en passiv artikkel. Den skal være en spillbar fortelling der spilleren beveger seg gjennom ruten.

### 2. Fysisk rutesamling

Fysisk modus lar brukeren samle ruten i virkeligheten ved å besøke steder langs eller knyttet til ruten. Brukeren kan ha fullført online-reisen først, og deretter få en fysisk samlerstatus når faktiske steder besøkes med GPS.

Fysisk modus kan inneholde:

- GPS-bekreftede stopp
- stedsspesifikke oppgaver
- bilde/minne fra besøket
- ekstra tekstlag som bare åpnes på stedet
- sterkere badge
- stedsmerker
- lokal quiz
- “jeg var der”-status
- prosentvis fysisk fullføring
- komplett rute-samling

Eksempel på progresjon:

```txt
Ikke startet
Påbegynt online
Fullført online
Delvis samlet fysisk
Fullført fysisk
Komplett historisk rute
```

Kortere visningsmodell:

```txt
Lest
Reist
Besøkt
Samlet
Fullført
```

## Rutetyper

Historiske ruter skal være fantasifulle, brede og dramadrevne. Dette er ikke bare pilegrimsleder og kulturvandringer. Funksjonen skal kunne romme alle slags historiske bevegelseslinjer.

### Handelsveier

Handelsveier følger varer, markeder, havner, tollsteder, makt og økonomisk avhengighet. De handler om hvordan ting beveger seg og hvordan samfunn bygges rundt vareflyt.

Mulige varer:

```txt
salt
jern
tømmer
korn
fisk
skinn
sølv
tekstiler
krydder
kaffe
te
våpen
bøker
medisin
```

Mulige mekanikker:

```txt
pris
risiko
vær
toll
svindel
lager
markedsdag
mangel
transportkapasitet
forhandling
```

Eksempler:

```txt
Tømmerruten langs Glomma
Hanseatenes handelsvei
Kornveien til byen
Kystens tørrfiskrute
Silkeveien
```

### Fluktruter

Fluktruter følger mennesker som forsøker å komme seg unna krig, forfølgelse, straff, sult, slaveri, okkupasjon eller politisk jakt.

Mulige mekanikker:

```txt
tillit
skjul
nattreise
angiverfare
grensepassering
matmangel
barn/familie
falske papirer
vær
valg mellom kort og farlig vei eller lang og tryggere vei
```

Eksempler:

```txt
Fluktruter over grensen til Sverige under krigen
Jødiske fluktruter i Europa
Slavers fluktruter i USA
Flyktningeruter gjennom Balkan
```

### Smuglerruter

Smuglerruter følger skjulte stier, fjorder, bakrom, grensebygder, havner og nettverk der ulovlige eller forbudte varer flyttes.

Mulige objekter:

```txt
båt
tønne
falsk last
lykt
kodeord
hemmelig lager
kartbit
fiskekasse
brev
våpen
radio
```

Mulige mekanikker:

```txt
risikomåler
kontrollposter
skjulte stopp
falske valg
kodeord
rykter
lokale hjelpere
nattmodus
```

Eksempler:

```txt
Brennevinsruter over svenskegrensen
Smuglerruter langs Oslofjorden
Våpenruter under okkupasjonen
Forbudstidens spritruter
```

### Pilegrimsruter

Pilegrimsruter følger tro, bot, sykdom, håp, makt, kirker, relikvier, herberger og hellige steder. De skal ikke bare være rolige turer, men reiser gjennom middelalderens verdensbilde.

Mulige mekanikker:

```txt
tro
utmattelse
herberge
sykdom
velsignelse
relikvie
kirkelig kontroll
farlig terreng
```

Eksempler:

```txt
Pilegrimsleden til Nidaros
Pilegrimsveier gjennom Europa
Lokale kirkeveier
```

### Kongeveier og maktruter

Kongeveier følger stat, kontroll, administrasjon, militær transport, embetsmenn, kongereiser og byggingen av sentralmakt.

Mulige mekanikker:

```txt
ordre
skysstasjon
bro
veiarbeid
militær eskorte
maktmarkør
lojalitet
```

Eksempler:

```txt
Den bergenske kongevei
Kongeveier i Danmark-Norge
Kongereiser mellom maktsteder
```

### Postveier og kommunikasjonsruter

Postveier følger brev, nyheter, ordre, rykter, sensur, krigsmeldinger og den langsomme byggingen av informasjonsnettverk.

Mulige mekanikker:

```txt
brev
forsegling
forsinkelse
vær
hesteskifte
postgård
hemmelig melding
sensur
```

Eksempler:

```txt
Postveien mellom byene
Kurérveier under krig
Telegrafens tidlige rute
```

### Militærruter

Militærruter følger hærer, retrett, invasjon, forsyning, festninger, broer, fjellpass, slagsteder og sårbare sivile samfunn.

Mulige mekanikker:

```txt
forsyning
marsjfart
moral
ordre
terreng
brokontroll
skanse
retrett
beleiring
```

Eksempler:

```txt
Felttogsruter i Norden
Invasjonsruter 1940
Forsyningsruter til festninger
Retrettruter etter tapte slag
```

### Seilingsleder og kystleder

Seilingsleder følger havner, fjorder, fyr, skjær, stormer, skipsvrak, tollsteder, handelssteder, marinefartøy, fiskevær og sjøfartens infrastruktur.

Mulige mekanikker:

```txt
vind
storm
last
fyrlys
skjær
havn
toll
piratfare
vrak
mannskap
```

Eksempler:

```txt
Vikingleden langs norskekysten
Oslofjordens toll- og handelsrute
Nordlandsjektenes rute
Seilingsleden til Bergen
```

### Elveruter

Elveruter følger vann som transportåre, energikilde, grense, handelslinje og industrimotor.

Mulige mekanikker:

```txt
strøm
flom
mølle
sagbruk
tømmerfløting
bro
fergested
elveby
```

Eksempler:

```txt
Akerselva som industriell rute
Glomma som tømmer- og transportåre
Nilen som historisk livsnerve
Donau som imperierute
```

### Jernbaneruter

Jernbaneruter følger modernitet, industri, arbeid, migrasjon, krig, pendling, gods og nasjonsbygging.

Mulige mekanikker:

```txt
stasjon
billett
gods
forsinkelse
arbeidermiljø
klasseforskjell
krigstransport
emigrasjon
```

Eksempler:

```txt
Bergensbanen som nasjonsbygging
Ofotbanen og malmruten
Jernbanens vei inn i Oslo
Emigrantruter til havn
```

### Migrasjons- og utvandrerruter

Migrasjonsruter følger mennesker som forlater ett sted og forsøker å bygge liv et annet sted. De handler om tap, håp, språk, arbeid, familie, brev og ny identitet.

Mulige mekanikker:

```txt
avreise
havn
skip
grense
arbeid
språk
brev hjem
familiesplittelse
nytt navn
ankomst
```

Eksempler:

```txt
Norsk utvandring til Amerika
Arbeidsvandring til industribyene
Innvandreruter til Oslo
Romani-/taterreiser
Samiske flytteleier
```

### Spion-, motstands- og undergrunnsruter

Disse rutene følger hemmelige nettverk, safehouses, kurérer, radioer, mikrofilm, dekknavn, angivere og fare for arrestasjon.

Mulige mekanikker:

```txt
kodeord
kontaktperson
safehouse
dekknavn
radio
angiverfare
arrestasjon
flukt
hemmelig møte
```

Eksempler:

```txt
Motstandsruten gjennom Oslo
Kurérveien til Sverige
Radiostasjoner på fjellet
Etterretningsruter under krig
```

### Pest- og karanteneruter

Disse rutene følger sykdom, skip, havner, rykter, isolasjon, byporter, leger, kirker og myndigheter.

Mulige mekanikker:

```txt
smitte
karantene
havn
rykter
matmangel
lege
brenning av varer
stengte porter
```

Eksempler:

```txt
Karantene langs kysten
Pestens vei gjennom Europa
Koleraens rute inn i byen
```

### Kunstner-, forfatter- og idéreiser

Disse rutene følger skapere, bøker, brev, kaféer, atelierer, forlag, eksil, møter, konflikter og verk som oppstår gjennom reise.

Mulige mekanikker:

```txt
brev
verk
møte
kritikk
eksil
atelier
forlag
opplesning
skandale
```

Eksempler:

```txt
Ibsens Europa-reise
Munch mellom Åsgårdstrand, Oslo, Berlin og Paris
Undsets vei mellom Oslo, Lillehammer og Europa
Wergelands Kristiania
```

### Industri- og arbeidsruter

Disse rutene følger råvarer, arbeidere, fabrikker, verksteder, elver, jernbane, havn, streik, ulykker og fagforeninger.

Mulige mekanikker:

```txt
arbeidsdag
lønn
maskin
ulykke
streik
fabrikkport
arbeiderbolig
råvare
transport
```

Eksempler:

```txt
Akerselva som industriell rute
Tømmerets vei fra skog til havn
Jernbanens arbeiderrute
Havnas arbeidsspor
```

## Historisk rute som datastruktur

En historisk rute må lagre mer enn `placeIds`. Den må lagre fortelling, etapper, historisk premiss, rutetype, spillmekanikk, online-progresjon og fysisk samling.

Foreslått grunnstruktur:

```json
{
  "id": "smuglerruten_oslofjorden",
  "title": "Smuglerruten i Oslofjorden",
  "type": "historical_route",
  "feature": "historiske_ruter",
  "routeArchetype": "smuggling_route",
  "city": "oslo",
  "region": "oslofjorden",
  "historicalPeriod": "1800-1900",
  "playModes": {
    "online": {
      "enabled": true,
      "completionType": "narrative"
    },
    "physical": {
      "enabled": true,
      "completionType": "gps_collection"
    }
  },
  "narrativePremise": "Du følger en skjult smuglerlinje langs fjorden, der varer, rykter og risiko beveger seg mellom havner, viker og kontrollposter.",
  "routeTension": "Du må få lasten frem uten å bli stoppet av tollkontrollen.",
  "historicalForces": [
    "forbud",
    "handel",
    "kontroll",
    "fattigdom",
    "risiko"
  ],
  "routeObjects": [
    "båt",
    "tønne",
    "falsk last",
    "lykt",
    "kodeord"
  ],
  "stops": [],
  "rewards": {
    "onlineBadgeId": "badge_smuglerruten_reist",
    "physicalBadgeId": "badge_smuglerruten_samlet",
    "pointsOnline": 100,
    "pointsPhysical": 300
  }
}
```

## Stoppstruktur

Hvert stopp bør kunne fungere både online og fysisk. Noen stopp finnes som vanlige History Go-places. Andre stopp kan være historiske etapper, omtrentlige områder, sjøstrekninger eller tekstuelle kapitler.

Foreslått stoppstruktur:

```json
{
  "sequence": 1,
  "id": "smuglerruten_oslofjorden_01_avreise",
  "placeId": "tollbukaia",
  "chapterTitle": "Avreisen fra kaia",
  "year": 1890,
  "era": "Toll, havn og skjult vareflyt",
  "online": {
    "story": "Det er kveld ved kaia. Varene er registrert på papiret, men ikke alt som ligger i båten finnes i lastenotatet.",
    "taskType": "choice",
    "task": "Velg om du skjuler lasten under fiskekasser eller venter til neste natt.",
    "choices": [
      {
        "id": "hide_now",
        "label": "Skjul lasten nå",
        "effect": {
          "risk": 2,
          "speed": 1
        }
      },
      {
        "id": "wait",
        "label": "Vent til neste natt",
        "effect": {
          "risk": -1,
          "speed": -1
        }
      }
    ]
  },
  "physical": {
    "requiresVisit": true,
    "gpsRadius": 160,
    "task": "Stå ved kaia og finn ett tegn på at dette området en gang handlet om kontroll, havn eller vareflyt.",
    "extraUnlock": "historisk_lag_toll_og_smugling"
  },
  "unlocks": {
    "people": [],
    "objects": [
      "obj_falsk_last"
    ],
    "places": [],
    "lexicon": [
      "leksikon_toll",
      "leksikon_smugling"
    ]
  }
}
```

## Progresjonsmodell

Historiske ruter trenger separat progresjon for online og fysisk samling.

Foreslått lagring:

```txt
hg_historical_routes_progress_v1
hg_historical_routes_physical_collection_v1
hg_historical_routes_unlocked_v1
```

Eksempel:

```json
{
  "routeId": "smuglerruten_oslofjorden",
  "online": {
    "started": true,
    "completed": false,
    "currentStopId": "smuglerruten_oslofjorden_02_vika",
    "completedStopIds": [
      "smuglerruten_oslofjorden_01_avreise"
    ],
    "choices": {
      "smuglerruten_oslofjorden_01_avreise": "hide_now"
    }
  },
  "physical": {
    "visitedStopIds": [
      "tollbukaia"
    ],
    "completed": false,
    "lastVisitAt": "2026-06-12T12:00:00.000Z"
  }
}
```

Når online-stopp fullføres, fysisk stopp samles, badge låses opp eller ruteprogresjon endres, må profilen oppdateres live:

```js
window.dispatchEvent(new Event("updateProfile"));
```

## UI-modell

Historiske ruter bør ha en egen visning i History Go, men bruke eksisterende designspråk og samlingslogikk.

Foreslåtte UI-flater:

```txt
1. Ruteoversikt
2. Rutekort
3. Online reisevisning
4. Stopp-/kapittelvisning
5. Fysisk samlingsvisning
6. Ruteprogresjon på profil
7. Nextup-anbefalinger senere
```

### Rutekort

Rutekortet bør vise:

```txt
tittel
rutetype
periode
kort premiss
online-status
fysisk status
antall stopp
badge-status
start/fortsett-knapp
```

Eksempel:

```txt
Smuglerruten i Oslofjorden
Rutetype: Smuglerrute
Periode: 1800-1900
Online: 2 av 8 kapitler
Fysisk: 1 av 5 steder samlet
```

### Online reisevisning

Online reisevisning bør prioritere tekst, valg og atmosfære. Kart kan støtte reisen, men teksten er hovedmotoren.

Visningen bør inneholde:

```txt
kapitteltittel
historisk år/periode
fortelling
valg/oppgave/quiz
låste og åpne stopp
ruteobjekter
progresjon
```

### Fysisk samlingsvisning

Fysisk visning bør vise hvilke stopp som kan besøkes, hvilke som er samlet, og hvilke som er historisk omtrentlige eller knyttet til større områder.

Visningen bør inneholde:

```txt
kart/stedsliste
GPS-status
besøkt/ikke besøkt
samlerprosent
ekstra unlocks
```

## Forhold til eksisterende History Go-systemer

### Places

Historiske ruter bør gjenbruke eksisterende places der det finnes relevante steder. Nye steder skal bare opprettes når ruten trenger faktiske fysiske samlingspunkter som mangler i datagrunnlaget.

### People

Ruter kan låse opp historiske personer knyttet til reise, handel, flukt, krig, kunst, tro eller arbeid.

### Objects / Wonderkammer

Ruter bør kunne låse opp objekter som båt, brev, handelsvare, kartbit, våpen, relikvie, verktøy, billett, pass, falsk dokument, radio, mynt eller tekstil.

### Lesespor

Ruter bør kunne kobles til Lesespor for videre fordypning: artikler, essays, historiske kilder, intervjuer, museale tekster og andre kuraterte leseforslag.

### Leksikon

Ruter bør kunne åpne begreper som toll, karantene, pilegrim, kongevei, postgård, skysstasjon, smugling, hanseat, tømmerfløting, kurér, migrasjon og eksil.

### Profile

Profilen bør vise:

```txt
historiske ruter startet
historiske ruter fullført online
historiske ruter samlet fysisk
favoritt-rutetyper
badges
ruteobjekter
```

## Creator-modell

På sikt bør Historiske ruter kunne bygges av flere typer skapere:

```txt
History Go-redaksjonen
historikere
lokalhistorikere
museer
lærere
byvandrere
DNT-/turmiljøer
kystlag
arkiver
forfattere
lokale entusiaster
```

Men første fase bør ha redaksjonelle, kuraterte ruter laget direkte i repoet. Creator-system kan komme senere.

## Kvalitetskrav for innhold

Historiske ruter må være dramatiske, men ikke slurvete. Hver rute bør ha:

```txt
klart historisk premiss
rutetype
periode
geografisk forankring
minst 3 stopp
minst 1 sentral konflikt/spenning
minst 1 objekt eller unlock
online-progresjon
fysisk samlingsmulighet der det gir mening
kilde-/Lesespor-felt for senere dokumentasjon
```

Ruter skal ikke bare beskrive “fine steder”. De skal forklare hvorfor mennesker beveget seg, hva som stod på spill, og hvordan landskap, makt, økonomi, fare og håp formet reisen.

## Første byggefase: v0.1

Første byggefase skal etablere datamodellen og en enkel spillbar ruteopplevelse. Målet er ikke å bygge hele systemet ferdig, men å få en ren, utvidbar kjerne inn i History Go.

### Mål for v0.1

1. Legg inn dokumentasjon for Historiske ruter.
2. Finn eksisterende rute-/Nextup-/progressionslogikk i repoet.
3. Etabler dataskjema for historiske ruter.
4. Lag én konkret eksempelrute.
5. Lag enkel online-spillbar rutevisning.
6. Lag enkel progresjon for online fullføring.
7. Forbered fysisk samling uten å bygge hele GPS-laget på nytt.
8. Sørg for at profiloppdatering trigges når progresjon endres.

### Fase 0: Audit før kode

Før endring må repoet leses og eksisterende struktur avklares.

Må leses:

```txt
README.md
package.json
index.html
js/boot.js
js/dataHub.js
relevante route-filer hvis de finnes
relevante Nextup-filer hvis de finnes
relevante profile/progression-filer
relevante place-card/profil-filer
```

Audit skal svare på:

```txt
Finnes det allerede rutedata?
Finnes det Nextup-logikk som kan foreslå ting?
Hvordan lagres progresjon nå?
Hvor vises badges/profilstatus?
Hvor bør historiske ruter legges i data-strukturen?
Hvilken UI-flate er tryggest å koble første versjon til?
```

### Fase 1: Dokumentasjon

Legg dette dokumentet eller en repo-tilpasset versjon inn som:

```txt
docs/README_HISTORISKE_RUTER.md
```

eller hvis repoet bruker feature-docs:

```txt
docs/features/historiske-ruter.md
```

### Fase 2: Datafundament

Foreslått mappe:

```txt
data/routes/historical/
```

Foreslåtte filer:

```txt
data/routes/historical/manifest.json
data/routes/historical/routes_historical_oslo.json
data/routes/historical/schema_historical_route.json
```

Første eksempelrute bør være liten, tydelig og basert på steder som allerede finnes i History Go.

Forslag til første rute:

```txt
Oslo: Fra middelalderby til fjordby
```

Dette er en god v0.1-rute fordi den kan koble eksisterende steder og samtidig demonstrere konseptet med historisk reise gjennom byens tidslag.

Mulige stopp:

```txt
Middelalderparken
Oslo domkirke
Christiania Torv
Bankplassen
Karl Johan
Bjørvika
```

Denne ruten er ikke like fantasifull som smuglerrute eller fluktrute, men den er trygg som første tekniske demonstrasjon fordi den viser datamodellen uten å kreve mange nye steder.

Alternativ første rute hvis man vil vise mer særpreg:

```txt
Smuglerruten i Oslofjorden
```

Den er mer dramatisk, men krever trolig mer nytt innhold.

### Fase 3: Online-spiller

Lag en enkel online route-player som kan:

```txt
vise ruteintro
vise nåværende stopp/kapittel
gå til neste stopp etter oppgave/quiz/valg
lagre completedStopIds
vise fullført online-status
utløse badge/progresjon ved fullføring
```

Første versjon kan være tekstbasert og enkel. Den trenger ikke avansert kart eller animasjon.

Minimum UI:

```txt
Rutetittel
Rutetype
Periode
Kapittel/stopp
Fortelling
Oppgave/valg
Neste-knapp
Progresjon
```

### Fase 4: Fysisk samlingsforberedelse

Første byggefase bør forberede fysisk modus i data, men ikke nødvendigvis bygge all GPS-logikk hvis eksisterende place-collection allerede kan brukes.

Minimum:

```txt
physical.enabled
physical.requiresVisit
physical.gpsRadius
physical.placeId
physical.completed/visitedStopIds i progresjonsstruktur
```

Hvis eksisterende History Go already har stedssamling/check-in, skal historiske ruter helst lytte til eksisterende stedssamling i stedet for å lage en parallell GPS-mekanikk.

### Fase 5: Profil/progresjon

Når en rute startes, et online-stopp fullføres, en online-rute fullføres, et fysisk stopp samles, eller et badge låses opp, må progresjonen oppdateres.

Krav:

```js
window.dispatchEvent(new Event("updateProfile"));
```

Profilen bør i v0.1 minst kunne vise eller lagre:

```txt
historiske ruter startet
historiske ruter fullført online
historiske ruter fysisk samlet
```

Hvis profil-UI ikke skal endres i første PR, må progresjonen likevel lagres riktig slik at profilvisning kan kobles på i neste fase.

## Akseptansekriterier for v0.1

v0.1 er ferdig når:

```txt
1. README/dokumentasjon for Historiske ruter finnes i repoet.
2. Datafolder eller dataskjema for historiske ruter finnes.
3. Én eksempelrute er lagt inn.
4. Eksempelruten har online-modus og fysisk-modus i data.
5. Eksempelruten har minst 3 stopp.
6. Hvert stopp har chapterTitle, story og minst én task/interaction.
7. Online-ruten kan startes og fullføres i enkel UI eller intern player.
8. Progresjon lagres.
9. updateProfile-event trigges ved progresjonsendring.
10. Ingen eksisterende place-data dupliseres unødvendig.
11. Eksisterende History Go-kategorier og places fortsetter å fungere.
```

## Første konkrete v0.1-rute

Anbefalt første rute:

```txt
Oslo: Fra middelalderby til fjordby
```

Premiss:

```txt
Du reiser gjennom Oslos tidslag, fra middelalderbyen ved Alna og fjorden, via Christianias regulerte sentrum, maktens og handelens plasser, hovedstadens paradeakse og frem til den moderne fjordbyen der havn, trafikk, kultur og eiendom har skrevet byen om på nytt.
```

Rutetype:

```txt
urban_time_route
```

Stopp:

```txt
1. Middelalderparken — byen før flyttingen
2. Oslo domkirke — Christianias religiøse og sosiale sentrum
3. Christiania Torv — den regulerte byen etter 1624
4. Bankplassen — handel, institusjoner og Kvadraturens tyngde
5. Karl Johan — hovedstadens maktakse
6. Bjørvika — havn, trafikkmaskin, kultur og fjordby
```

Online-spillfølelse:

```txt
Dette er en roligere tidsreise som demonstrerer systemet. Den skal vise at ruten kan bevege seg gjennom epoker, ikke bare gjennom avstand.
```

Fysisk samling:

```txt
Alle stopp kan senere knyttes til eksisterende places der de finnes. Brukeren kan fullføre reisen online, men får fysisk samlingsstatus når han/hun faktisk besøker stoppene.
```

## Videre byggefaser etter v0.1

### v0.2 — Rutebibliotek

Legg til ruteoversikt, filtrering etter rutetype og status:

```txt
Alle
Påbegynt
Fullført online
Delvis samlet fysisk
Fullført fysisk
Handelsveier
Fluktruter
Smuglerruter
Pilegrimsruter
Seilingsleder
```

### v0.3 — Fysisk samling koblet til eksisterende place unlocks

Når brukeren besøker et sted som inngår i en historisk rute, skal ruten automatisk oppdatere fysisk samlingsstatus.

### v0.4 — Route objects og Wonderkammer

Ruter kan låse opp objekter:

```txt
kartbit
brev
kompass
båt
relikvie
handelsvare
pass
falsk dokument
radio
verktøy
```

### v0.5 — Route creators

Bygg støtte for eksterne eller redaksjonelle route creators med metadata, kildekrav og publiseringsstatus.

### v0.6 — Nextup-kobling

Nextup kan foreslå historiske ruter basert på:

```txt
nærhet
brukerens interesser
påbegynte ruter
steder brukeren allerede har samlet
vær/tid/sesong
historisk tema
```

### v0.7 — Mer avanserte rutespill

Legg inn rutespesifikke mekanikker:

```txt
risiko
forsyning
tillit
last
vær
moral
hemmelighet
smitte
omdømme
penger
```

## Langsiktig visjon

Historiske ruter kan bli en av de viktigste delene av History Go, fordi ruter binder sammen alt spillet allerede har:

```txt
steder
personer
hendelser
objekter
kart
quiz
fortellinger
Lesespor
Wonderkammer
badges
samling
fysisk reise
online-spill
```

Den store ideen er at historien ikke bare ligger i steder. Historien ligger også i bevegelsene mellom steder. Folk handlet, flyktet, smuglet, marsjerte, rodde, seilte, skrev brev, bar varer, mistet barn, krysset grenser, bygde veier, fulgte elver, søkte frelse, unnslapp makt eller fraktet hemmeligheter. Historiske ruter gjør disse bevegelsene spillbare.

