# History GO — produktkart og ferdigstillelseskart

Dette dokumentet er styringskartet for å gjøre History GO ferdig som spillbar app.

Det gjelder **History GO-spillet**: kart, steder, PlaceCard, innsjekk, quiz, badges, profil, people/relations, Wonderkammer, Nearby, favoritter, ruter, natur/sport/musikk/kunst/by/litteratur/politikk/vitenskap/næringsliv/subkultur, HG Social og Spotmeeting.

**Civication er eget prosjekt** og er ikke del av dette ferdigstillelseskartet. Eventuelle koblinger mellom History GO og Civication skal behandles som integrasjon senere, ikke som del av History GO-hovedløypen.

---

## Kort status

History GO mangler ikke først og fremst flere ideer. Det mangler ferdigstillelseskart.

Prosjektet har allerede et stort spillgrunnlag:

- stort stedunivers
- kartbasert grunnspill
- mange kategorier
- PlaceCard / stedkort
- quiz / badges
- profil / miniProfile / NextUp
- people / relations
- Wonderkammer
- Nearby / favoritter
- ruter påbegynt
- HG Social-kontrakt
- privacy guards
- Spotmeeting-produktflyt
- mye Oslo-data

History GO er derfor ikke en liten prototype. Det er et stort spillunivers med mange bygde systemer, men uten ferdig produktforsegling.

Den viktigste oppgaven nå er å samle systemene til ett spill om oppdagelse, læring og samling:

```text
Kart → Sted / PlaceCard → Oppdagelse / innsjekk → Læring → Samling i profil → Wonderkammer-fordypning → Neste nysgjerrighet
```

Steder er navet. Profilen er spillerkortet, samlingen og progresjonsflaten. Wonderkammer er et eget fordypnings- og kuriositetsrom, ikke spillerens hovedsamling. Ruter er valgfrie læringsløp. Social og Spotmeeting skal handle om steder, ruter, funn og trygg offentlig møtebruk.

---

## Hva mangler?

### A. Ferdig lærings- og samlingsmodell

Det største som mangler er en praktisk definisjon av hva History GO er som spill.

History GO skal ikke først og fremst bygges rundt runder som skal fullføres. Spillet skal bygges rundt oppdagelse, samling og gradvis kunnskapsvekst.

Målet for spilleren er ikke å bli ferdig med byen. Målet er å forstå stadig mer av den.

Avklaringer som må låses:

- Hva betyr det å oppdage et sted?
- Hva betyr det å lære noe på et sted?
- Hva betyr det å samle et sted, en person, et funn, et badge eller en kunnskap?
- Hva betyr bronse, sølv og gull som kunnskapsnivåer?
- Hva er forskjellen på sted, person, rute, badge, oppdrag, profilfunn og Wonderkammer-fordypning?
- Hva er minimum et sted må ha for å gi spilleren verdi?
- Hva skjer etter at spilleren har lært noe eller samlet noe?
- Hvordan påvirker handlingen profil, ruter, social og Spotmeeting?
- Hva skal åpne en Wonderkammer-fordypning, og hvordan skiller den seg fra profilens samling?

Uten dette blir History GO mange funksjoner. Med dette blir det et åpent lærings- og samlingsspill.

---

### B. Felles progresjonssystem

History GO trenger én samlet progresjonsmodell på tvers av systemene.

Minimum:

- `discoveredPlaces`
- `visitedPlaces`
- `checkedInPlaces`
- `learnedPlaces`
- `masteredPlaces`
- `attemptedQuizzes`
- `completedQuizzes`
- `earnedBadges`
- `unlockedPeople`
- `collectedFinds`
- `unlockedWonderEntries`
- `favoritePlaces`
- `activeRoutes`
- `completedRoutes`
- `homePlace`
- `socialActivity`
- `spotmeetings`
- `categoryProgress`

Dette er ryggraden. Alt annet bør lese fra eller skrive til denne modellen.

Viktig produktregel:

> Profilen viser samlingen og progresjonen. Wonderkammer viser fordypningene, kuriositetene og de skjulte kunnskapsrommene.

---

### C. Ferdig startflyt

Appen må ha en tydelig førstegangsopplevelse.

Ikke fordi noe skal fjernes, men fordi spilleren må forstå hvor hun er og hva hun kan gjøre.

Førstegangsopplevelsen bør avklare:

1. Velkommen til History GO
2. Velg offentlig hjemsted
3. Se steder i nærheten
4. Velg første sted
5. Sjekk inn eller oppdag stedet
6. Lær noe gjennom tekst, quiz, oppgave, person eller funn
7. Få første badge, personkort eller profilfunn
8. Se profilen oppdatert
9. Åpne eventuell Wonderkammer-fordypning
10. Få neste anbefalte sted, tema eller rute

---

### D. Ferdig PlaceCard-standard

PlaceCard er hovedgrensesnittet for steder.

Et komplett PlaceCard bør kunne vise:

- stedets navn
- kategori
- bilde / cardImage
- kort forklaring
- lang forklaring
- innsjekkstatus
- quizstatus
- badge / kunnskapsnivå
- personer / relasjoner
- relaterte steder
- ruter som inkluderer stedet
- profilfunn
- Wonderkammer-koblinger / fordypning
- favorittstatus
- social-aktivitet
- Spotmeeting-mulighet
- kategori-spesifikke handlinger, for eksempel naturfunn, sportshistorie eller kunstobservasjon

Normen bør være: hvert sted må ha en tydelig læringshandling og en tydelig progresjonseffekt.

---

### E. Ferdig profil

Profilen må være spillerens hovedkort, samling og progresjonsflate.

Den skal vise:

- hvem spilleren er i History GO
- oppdagede steder
- besøkte steder
- sjekkede steder
- lærte / mestrede steder
- badges
- kategoriprogresjon
- låste og opplåste personer
- profilfunn
- aktive og fullførte ruter
- favoritter
- offentlig hjemsted
- social-status
- Spotmeeting-status
- neste anbefalte mål

Profilen er ikke bare en konto- eller innstillingsside. Den er spillerens samling, status og identitet i History GO.

Hvis en belønning ikke vises i profilen, føles den ikke som en del av spillerens progresjon.

---

### F. Ferdig Wonderkammer

Wonderkammer er ikke spillerens hovedsamling. Samlingen ligger på profilsiden.

Wonderkammer er et eget kunnskapsrom: et kuriositetskammer der steder, personer, hendelser, objekter, ideer og rare forbindelser kan åpnes som fordypning.

Wonderkammer bør brukes til:

- merkelige historiske koblinger
- skjulte lag ved steder
- objekter og funn med fortelling
- sitater, spor og fragmenter
- «visste du at»-kunnskap
- tematiske rom
- små historiske mysterier
- koblinger mellom steder, personer og epoker
- kulturhistoriske, vitenskapelige eller kunstneriske perspektiver
- byens hemmelige skuffer

Wonderkammer bør kunne filtrere eller strukturere fordypninger etter:

- Alle
- Steder
- Personer
- Funn
- Tema
- Kategorier
- Epoker
- Ruter
- Kuriositeter

Wonderkammer er ikke ekstra pynt og ikke en kopi av profilen. Det er stedet der kunnskapen får dybde, overraskelse og egen atmosfære.

---

### G. Ferdige ruter

Ruter gjør History GO til et spill med organiserte læringsløp.

En rute er ikke hovedmålet i seg selv. En rute er en måte å sette steder, personer, funn og kunnskap i sammenheng.

En rute bør ha:

- navn
- tema
- startsted
- 3–8 stopp
- anbefalt rekkefølge
- kartlinje
- progresjon
- læringshandling per stopp
- sluttspørsmål, sluttbadge eller profilfunn
- visning i profil
- eventuell Wonderkammer-fordypning

Tidlige ruter som bør finnes:

- Litterære Oslo
- Akerselva industri
- Demokratiruten
- Byutvikling og gentrifisering
- Kunst ved fjorden
- Oslo øst og arbeiderhistorie
- Fotballbyen Oslo
- Vitenskap i sentrum
- Natur i byen
- Subkultur og scener
- Musikkbyen Oslo

---

### H. Ferdig Nearby / favoritter

Nearby bør være spillets svar på: Hva kan jeg oppdage nå?

Nearby bør prioritere:

- nærmeste uoppdagede sted
- nærmeste sted i aktiv rute
- sted med ufullført quiz
- sted som låser opp person
- sted som styrker en kategori
- sted som passer valgt interesse
- favoritter i nærheten
- kort tur / lang tur
- ute / inne / regnværsvennlig der data finnes

Nearby bør bruke spilltekst:

- Du mangler ett sted for sølv i Litteratur.
- Dette stedet låser opp en person.
- Dette stedet er del av Akerselva-ruten.
- Du har vært her, men ikke tatt quiz.
- Dette ligger nær ditt offentlige hjemsted.

---

### I. People / relations som unlock-system

People skal ikke bare være data. De skal være personer spilleren møter gjennom byen.

Personer bør kunne ha:

- personkort
- steder
- relasjoner
- tidslinje
- kategori
- låst / ulåst status
- sitat / funn
- kobling til ruter
- kobling til profil
- eventuell kobling til Wonderkammer-fordypning

Eksempler:

- Nationaltheatret låser opp dramatikere og teaterhistorie.
- Vår Frelsers gravlund låser opp kulturpersoner.
- Nasjonalbiblioteket låser opp forfatterarkiver.
- Ullevaal låser opp fotballhistorie.
- MUNCH låser opp kunsthistorie.
- Observatoriet låser opp vitenskapshistorie.

Dette gjør History GO til et samlespill, ikke bare et kart.

---

### J. HG Social

Social er ikke ferdig før det har faktisk brukeropplevelse.

HG Social bør handle om:

- steder
- ruter
- funn
- profiler
- favoritter
- felles aktivitet
- trygg deling

Det bør ikke bygges som generell sosial feed først. Det skal være sosialitet rundt History GO-objekter.

Mangler som bør fullføres:

- venner / relasjoner
- offentlig profil
- aktivitetsfeed rundt steder og funn
- delte funn
- felles ruter
- blokkeringsflyt i UI
- rapportering / moderering i UI
- tydelig visning av hva andre kan se
- backend-login / sync senere

---

### K. Spotmeeting

Spotmeeting skal være stedbasert møtefunksjon.

Det bør bety:

> Jeg vil møte noen ved et offentlig History GO-sted for å gjøre en rute, et funn, en samtale eller en aktivitet.

Mangler som bør fullføres:

- live invitasjoner
- lagring
- kalender / tid
- deltakerstatus
- privacy-regler
- kobling til offentlig History GO-sted
- varsler
- kansellering / endring
- backend senere
- trygghetsflyt

Spotmeeting skal ikke være tilfeldig møteapp. Det er en trygg stedmodus inne i History GO.

---

### L. Backend / login / sync

For full release trengs:

- konto
- login
- sky-sync av progresjon
- brukerprofil
- venner
- social-data
- Spotmeeting-data
- moderation / reporting
- backup
- eksport / import
- GDPR og personvern rundt posisjon

Men lokal singleplayer-progresjon kan og bør fungere før backend er komplett.

---

## Hva bør fullføres først?

Prioritet:

1. Felles progresjonssystem
2. PlaceCard-standard
3. Profil som samling og progresjonsflate
4. Wonderkammer som fordypningsrom
5. Nearby / favoritter
6. Ruter
7. Innholdsstandard per kategori
8. Innholdshull i svake kategorier
9. HG Social
10. Spotmeeting
11. Backend / login / sync

Dette er ikke kutt. Det er rekkefølge.

---

## Kategorier og spillrolle

| Kategori | Spillrolle |
|---|---|
| Historie | tidslag, hendelser, minnesteder, før/nå-kontraster |
| Litteratur | forfattere, tekster, steder, sitater, bokkultur |
| Kunst | kunstverk, museer, kunstnere, teknikker, visuell observasjon |
| Musikk | artister, scener, studioer, sjangre, konserthistorie |
| Sport | klubber, arenaer, spillere, prestasjoner, supporter- og breddekultur |
| Natur | arter, observasjoner, økologi, parker, marka, sesonger |
| By | byutvikling, arkitektur, mobilitet, nabolag, sosial geografi |
| Politikk | institusjoner, demokrati, protest, makt, offentlighet |
| Næringsliv | industri, handel, teknologi, arbeid, modernisering |
| Vitenskap | forskere, institusjoner, metoder, instrumenter, oppdagelser |
| Subkultur | scener, alternative miljøer, skate, graffiti, punk, rave, kulturhus |

Kategoriene bør dele grunnsystem, men ha ulik spillfølelse.

---

## Innholdsbalanse

History GO har mye bredde, men kategoriene er ujevnt modne.

Prioritert innholdsutjevning:

1. Musikk
2. Natur
3. Sport
4. Kunst
5. Vitenskap
6. Politikk
7. Subkultur
8. Næringsliv
9. Litteratur
10. By

By og litteratur virker sterkest som datagrunnlag. De svakere kategoriene bør løftes for at History GO skal føles som et bredt kultur-, natur-, sport- og kunnskapsspill.

---

## Stedskvalitet

Et History GO-sted bør ha modenhetsnivå.

| Nivå | Betydning |
|---|---|
| Stub | finnes bare som peker |
| Basis | kart + kort tekst |
| Spillbart | innsjekk + quiz + badge |
| Rikt | personer + emner + profilfunn + Wonderkammer-koblinger |
| Læringsløp | del av rute + full progresjon |
| Premium | bilde, lang tekst, quizprofil, personkort, rute, funn og fordypning |

Målet er ikke at alle steder skal være Premium med én gang. Målet er at appen vet hva hvert sted kan gjøre.

---

## Belønningsøkonomi

Forslag til belønningsstige:

- Stedsmerke: sted oppdaget, besøkt eller mestret
- Kategorimerke: flere steder i kategori lært / mestret
- Rutemerke: rute gjennomført
- Personkort: person låst opp
- Profilfunn: objekt, historisk spor, kuriositet eller særskilt kobling som legges i spillerens samling
- Wonderkammer-åpning: fordypning, mysterium, kobling eller kunnskapsrom som åpnes
- Diplom: større prøve eller kategorinivå
- Tittel: samlet nivå

Bronse / sølv / gull bør konkretiseres slik:

- Bronse: oppdaget, besøkt eller sjekket inn
- Sølv: hovedfortelling forstått og quiz / læringshandling fullført
- Gull: sted koblet til person, funn, ruteoppgave eller dypere kunnskap

Et sted er derfor ikke «ferdig» i absolutt forstand. Det kan alltid få flere lag senere. Men spilleren kan oppnå et synlig mestringsnivå som viser hvor godt stedet er utforsket.

---

## Offentlig hjemsted

History GO bør bruke offentlig hjemsted som lokal startposisjon.

Regel:

> Hjemsted skal være et offentlig History GO-sted, ikke privat adresse.

Lagre:

- `placeId`
- navn
- kategori
- lat / lon
- radius
- valgt dato
- synlighet / privacy

Brukes til:

- Nearby
- anbefalinger
- ruter
- profilidentitet
- trygg social / Spotmeeting
- lokale starter

---

## Privacy for stedbasert sosialitet

Siden History GO bruker ekte steder, gjelder denne produktregelen:

> Sosiale funksjoner skal bare bruke offentlige History GO-steder, aldri private adresser.

Dette gjelder:

- hjemsted
- Spotmeeting
- ruter med venner
- offentlig profil
- delte funn
- social feed

Brukeren må forstå:

- hvem kan se besøkte steder?
- hvem kan se favoritter?
- hvem kan se hjemsted?
- ser noen min live-posisjon?
- hvem kan invitere meg?
- hvordan blokkerer eller rapporterer jeg?

---

## Lokal vs live status

History GO skal være spillbart lokalt selv når backend ikke er ferdig.

Produktet bør skille mellom:

- lagret på denne enheten
- synkronisert med konto
- kan eksporteres/importeres
- krever login
- live sosial funksjon
- mock/local sosial funksjon

Dette skal vises ryddig, ikke som debugstøy.

---

## Innholdsproduksjonsløype

For hvert sted:

1. Velg sted
2. Sjekk koordinat og radius
3. Skriv korttekst
4. Skriv langtekst
5. Legg bilde og kortbilde
6. Knytt til emner
7. Lag 3–5 quizspørsmål
8. Knytt person / profilfunn der relevant
9. Legg til Wonderkammer-fordypning der relevant
10. Legg til rute der relevant
11. Test PlaceCard
12. Test quiz
13. Test profil-belønning
14. Test Wonderkammer-fordypning

Dette er den redaksjonelle løypen som gjør steder ferdige uten kaos.

---

## Redaksjonelt dashboard som mangler

History GO bør ha intern oversikt over modenhet.

Eksempel:

| Kategori | Steder | Spillbare | Med quiz | Med bilde | Med rute | Med person | Prioritet |
|---|---:|---:|---:|---:|---:|---:|---|
| By | høy | høy | middels | høy | lav | middels | 1 |
| Litteratur | høy | middels | middels | høy | lav | høy | 1 |
| Kunst | middels | lav | lav | middels | lav | middels | 2 |
| Natur | lav | lav | lav | lav | lav | lav | 1 |
| Musikk | svært lav | lav | lav | lav | lav | lav | 1 |
| Sport | lav | lav | lav | lav | lav | lav | 1 |

Et slikt dashboard bør gjøre det lett å se hva som faktisk mangler.

---

## Hva bør ikke prioriteres først?

Dette bør vente til kjerneløypen er strammere:

- flere store nye moduser
- flere sideprosjekter
- mer generell AHA-integrasjon
- avansert multiplayer
- avansert AI-anbefaling
- full App Store-pakke
- stor backend før lokal progresjon er stabil
- tusenvis av nye steder før de første 100–200 er gode
- komplisert sosial feed før stedbaserte handlinger fungerer
- flere dokumenter før README-strukturen er ryddet

Dette betyr ikke at noe skal bort. Det betyr at ferdigstillelse må ha rekkefølge.

---

## Definisjonen av progresjon

Den viktigste mangelen er én felles definisjon av progresjon:

- oppdaget sted
- besøkt / sjekket sted
- lært sted
- mestret sted
- gjennomført rute
- utviklet kategori
- opplåst person
- samlet profilfunn
- åpnet Wonderkammer-fordypning
- endret profilnivå
- gjennomført social-handling
- gjennomført Spotmeeting

Når dette er definert, kan alle systemene kobles.

---

## Arbeidsregel

History GO skal ikke gjøres mindre.

History GO skal gjøres ferdig.

Det betyr:

- ikke skjul hovedsystemer som produktstrategi
- ikke bygg videre tilfeldig
- ikke la hvert system være sin egen øy
- koble alt til steder, progresjon, profil og relevante fordypninger
- la profilen være samlingen
- la Wonderkammer være fordypningsrommet
- fullfør grunnmodellen før nye store lag bygges

Kjernesetning:

> History GO er ikke et lite spill som må kuttes ned. Det er et stort lærings- og samlingsspill som må få ferdig progresjon, ferdige belønninger og ferdige koblinger mellom systemene.
