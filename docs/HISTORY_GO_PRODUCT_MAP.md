# History GO — produktkart og ferdigstillelseskart

Dette dokumentet er styringskartet for å gjøre History GO ferdig som spillbar app.

Det gjelder **History GO-spillet**: kart, steder, PlaceCard, quiz, badges, profil, people/relations, Wonderkammer, Nearby, favoritter, ruter, natur/sport/musikk/kunst/by/litteratur/politikk/vitenskap/næringsliv/subkultur, HG Social og Spotmeeting.

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

Den viktigste oppgaven nå er å samle systemene til ett spill:

```text
Kart → Sted / PlaceCard → Innsjekk → Quiz / oppgave → Belønning → Profil / Wonderkammer → Neste sted / rute
```

Steder er navet. Profilen er spillerkortet. Wonderkammer er samlingen. Ruter er kampanjer. Social og Spotmeeting skal handle om steder, ruter, funn og trygg offentlig møtebruk.

---

## Hva mangler?

### A. Ferdig spillmodell

Det største som mangler er en praktisk definisjon av hva History GO er som spill.

Avklaringer som må låses:

- Hva er en runde?
- Hva er et funn?
- Hva betyr det å fullføre et sted?
- Hva betyr bronse, sølv og gull?
- Hva er forskjellen på sted, person, rute, badge, oppdrag og samlingsobjekt?
- Hva er minimum et sted må ha for å være spillbart?
- Hva skjer etter at man har fullført et sted?
- Hvordan påvirker handlingen profil, Wonderkammer, ruter, social og Spotmeeting?

Uten dette blir History GO mange funksjoner. Med dette blir det et spill.

---

### B. Felles progresjonssystem

History GO trenger én samlet progresjonsmodell på tvers av systemene.

Minimum:

- `visitedPlaces`
- `checkedInPlaces`
- `completedPlaces`
- `attemptedQuizzes`
- `completedQuizzes`
- `earnedBadges`
- `unlockedPeople`
- `unlockedWonderItems`
- `favoritePlaces`
- `activeRoutes`
- `completedRoutes`
- `homePlace`
- `socialActivity`
- `spotmeetings`
- `categoryProgress`

Dette er ryggraden. Alt annet bør lese fra eller skrive til denne modellen.

---

### C. Ferdig startflyt

Appen må ha en tydelig førstegangsopplevelse.

Ikke fordi noe skal fjernes, men fordi spilleren må forstå hvor hun er og hva hun kan gjøre.

Førstegangsopplevelsen bør avklare:

1. Velkommen til History GO
2. Velg offentlig hjemsted
3. Se steder i nærheten
4. Velg første sted
5. Sjekk inn
6. Ta første quiz / oppgave
7. Få første badge / funn
8. Se profilen oppdatert
9. Få neste anbefalte sted eller rute

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
- badge / belønning
- personer / relasjoner
- relaterte steder
- ruter som inkluderer stedet
- Wonderkammer-funn
- favorittstatus
- social-aktivitet
- Spotmeeting-mulighet
- kategori-spesifikke handlinger, for eksempel naturfunn, sportshistorie eller kunstobservasjon

Normen bør være: hvert sted må ha en tydelig spillhandling og en tydelig belønning.

---

### E. Ferdig profil

Profilen må være spillerens hovedkort.

Den skal vise:

- hvem spilleren er i History GO
- besøkte steder
- fullførte steder
- badges
- kategoriprogresjon
- låste og opplåste personer
- Wonderkammer-funn
- aktive og fullførte ruter
- favoritter
- offentlig hjemsted
- social-status
- Spotmeeting-status
- neste anbefalte mål

Profilen er bindeleddet mellom alle systemene. Hvis noe ikke vises i profil eller Wonderkammer, føles det ikke som en belønning.

---

### F. Ferdig Wonderkammer

Wonderkammer skal være spillerens samling og arkiv.

Det bør samle:

- steder
- personer
- badges
- ruter
- historiske koblinger
- kunstverk
- litterære spor
- naturfunn
- sportshistorie
- politiske hendelser
- musikksteder
- næringslivshistorie
- byfenomener
- spesielle funn

Wonderkammer bør ha filtre:

- Alle
- Steder
- Personer
- Funn
- Badges
- Ruter
- Kategorier
- Favoritter

Wonderkammer er ikke ekstra pynt. Det er grunnen til at samling gir mening.

---

### G. Ferdige ruter

Ruter gjør History GO til et spill med kampanjer.

En rute bør ha:

- navn
- tema
- startsted
- 3–8 stopp
- anbefalt rekkefølge
- kartlinje
- progresjon
- oppgaver per stopp
- sluttspørsmål eller sluttbadge
- visning i profil
- Wonderkammer-funn

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

Nearby bør være spillets svar på: Hva kan jeg gjøre nå?

Nearby bør prioritere:

- nærmeste uoppdagede sted
- nærmeste sted i aktiv rute
- sted med ufullført quiz
- sted som låser opp person
- sted som fullfører kategori
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
- kobling til Wonderkammer

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
3. Profil
4. Wonderkammer
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
| Rikt | personer + emner + Wonderkammer |
| Kampanje | del av rute + full progresjon |
| Premium | bilde, lang tekst, quizprofil, personkort, rute, funn |

Målet er ikke at alle steder skal være Premium med én gang. Målet er at appen vet hva hvert sted kan gjøre.

---

## Belønningsøkonomi

Forslag til belønningsstige:

- Stedsmerke: sted fullført
- Kategorimerke: flere steder i kategori fullført
- Rutemerke: rute fullført
- Personkort: person låst opp
- Funn: kuriositet, objekt, historisk spor eller særskilt kobling
- Diplom: større prøve eller kategorinivå
- Tittel: samlet nivå

Bronse / sølv / gull bør konkretiseres slik:

- Bronse: besøkt eller sjekket inn
- Sølv: quiz fullført
- Gull: quiz + relatert funn/person/ruteoppgave fullført

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
8. Knytt person / funn der relevant
9. Legg til rute der relevant
10. Test PlaceCard
11. Test quiz
12. Test profil / Wonderkammer-belønning

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

## Definisjonen av ferdig

Den viktigste mangelen er én felles definisjon av fullført:

- fullført sted
- fullført rute
- fullført kategori
- fullført person
- fullført funn
- fullført profilnivå
- fullført social-handling
- fullført Spotmeeting

Når dette er definert, kan alle systemene kobles.

---

## Arbeidsregel

History GO skal ikke gjøres mindre.

History GO skal gjøres ferdig.

Det betyr:

- ikke skjul hovedsystemer som produktstrategi
- ikke bygg videre tilfeldig
- ikke la hvert system være sin egen øy
- koble alt til steder, progresjon, profil og Wonderkammer
- fullfør grunnmodellen før nye store lag bygges

Kjernesetning:

> History GO er ikke et lite spill som må kuttes ned. Det er et stort spill som må få ferdig progresjon, ferdige belønninger og ferdige koblinger mellom systemene.
