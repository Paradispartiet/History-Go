# History GO — definisjoner av fullført

Dette dokumentet definerer hva “fullført” betyr i History GO.

Formålet er å gi alle systemer samme språk for ferdigtilstand, progresjon og belønning.

Gjelder History GO-spillet. Civication er eget prosjekt og inngår ikke her.

---

## 1. Grunnprinsipp

History GO skal ikke bare registrere at en bruker har åpnet noe. Spillet må vite hva brukeren faktisk har gjort.

Derfor skilles det mellom:

- sett
- åpnet
- besøkt
- sjekket inn
- forsøkt
- fullført
- mestret
- samlet
- delt

En modul er ikke ferdig før dens handlinger gir synlig status i minst ett av disse systemene:

- PlaceCard
- profil
- Wonderkammer
- Nearby
- ruter
- social / Spotmeeting der relevant

---

## 2. Fullført sted

Et sted er **fullført** når spilleren har gjort en reell spillhandling ved stedet og fått en belønning/status.

Minimum:

1. Stedet er åpnet i PlaceCard.
2. Spilleren har sjekket inn, eller gjennomført gyldig alternativ handling dersom fysisk innsjekk ikke brukes.
3. Spilleren har fullført stedets quiz eller oppgave.
4. Progresjon er lagret.
5. Profilen viser stedet som fullført.
6. PlaceCard viser fullført status.

Anbefalt full fullføring:

- quiz fullført
- stedsmerke opptjent
- relevant person/funn låst opp hvis data finnes
- ruteprogresjon oppdatert hvis stedet er del av rute
- Wonderkammer oppdatert hvis stedet gir funn

---

## 3. Stedstatus

Steder bør kunne ha disse statusene:

| Status | Betydning |
|---|---|
| `unknown` | stedet finnes i data, men brukeren har ikke sett det |
| `discovered` | stedet er vist i kart/Nearby eller åpnet indirekte |
| `opened` | PlaceCard er åpnet |
| `visited` | brukeren har vært ved stedet eller registrert besøk |
| `checked_in` | innsjekk er fullført |
| `quiz_attempted` | quiz er startet eller forsøkt |
| `quiz_completed` | quiz er bestått/fullført |
| `completed` | stedet er fullført etter History GO-reglene |
| `mastered` | høyeste nivå på stedet er oppnådd |

`completed` skal være spillbar ferdigtilstand. `mastered` er ekstra dybde.

---

## 4. Bronse / sølv / gull

Bronse, sølv og gull bør brukes konsekvent.

| Nivå | Betydning |
|---|---|
| Bronse | besøkt eller sjekket inn |
| Sølv | quiz/oppgave fullført |
| Gull | quiz/oppgave + ekstra kobling fullført, for eksempel person, funn, ruteoppgave eller observasjon |

Hvis et sted ikke har ekstra kobling ennå, kan gull være låst til “kommer senere” eller beregnes som perfekt quizscore.

---

## 5. Fullført quiz

En quiz er fullført når:

1. Quiz er startet fra gyldig kontekst, normalt PlaceCard eller rute.
2. Alle nødvendige spørsmål er besvart.
3. Resultatet er beregnet.
4. Progresjon er lagret.
5. Relevante rewards/hooks er kjørt.
6. Profil, PlaceCard og eventuelt Wonderkammer/rute er oppdatert.

Quiz bør skille mellom:

- forsøkt
- bestått
- perfekt
- repetert

---

## 6. Fullført badge / merke

Et badge er fullført når:

1. Regelen for badget er oppfylt.
2. Badget er skrevet til progresjonsmodellen.
3. Badget vises i profil.
4. Badget kan spores tilbake til hva spilleren gjorde.

Badge må aldri bare være dekor. Det må svare på: hvorfor fikk spilleren dette?

---

## 7. Fullført person

En person er fullført på flere nivåer.

| Nivå | Betydning |
|---|---|
| Oppdaget | personen er vist via sted/rute/søk |
| Låst opp | spilleren har gjort handlingen som låser opp personen |
| Samlet | personen er lagt til i profil/Wonderkammer |
| Ferdig utforsket | nøkkelsteder, relasjoner eller quiz er fullført |

Minimum for opplåst person:

1. Personen har gyldig `personId`.
2. Personen er koblet til minst ett sted eller én rute.
3. Spilleren fullfører handlingen som låser personen opp.
4. Profil og Wonderkammer oppdateres.

---

## 8. Fullført Wonderkammer-funn

Et Wonderkammer-funn er fullført når:

1. Funnobjektet har id, tittel, type og kildekontekst.
2. Spilleren har gjort handlingen som låser det opp.
3. Funnobjektet er lagret i samlingen.
4. Funnobjektet vises i Wonderkammer.
5. Funnobjektet peker tilbake til sted/person/rute/kategori.

Funn uten opplåsingslogikk er bare innhold. Funn med opplåsingslogikk er spillobjekter.

---

## 9. Fullført rute

En rute er fullført når:

1. Ruten er startet.
2. Alle obligatoriske stopp er fullført.
3. Eventuelle ruteoppgaver/sluttspørsmål er fullført.
4. Ruteprogresjon er lagret.
5. Rutemerke/sluttbadge er gitt.
6. Profil viser ruten som fullført.
7. Wonderkammer viser ruten eller rutefunnet der relevant.

Ruter bør ha delstatus:

- ikke startet
- startet
- delvis fullført
- klar for sluttoppgave
- fullført
- mestret

---

## 10. Fullført kategori

En kategori er fullført på nivåer, ikke som én binær status.

Eksempel:

| Nivå | Krav |
|---|---|
| Startet | minst ett sted åpnet |
| Bronse | minst tre steder fullført |
| Sølv | minst én rute eller fem steder fullført |
| Gull | flere ruter/steder/personer/funn fullført |
| Mestergrad | større kategori-prøve eller definert hovedmål fullført |

Kategori-progresjon må vises i profil.

---

## 11. Fullført Nearby-handling

Nearby er fullført som handling når brukeren går fra anbefaling til faktisk spillhandling.

Eksempel:

1. Nearby anbefaler sted.
2. Brukeren åpner stedet.
3. Brukeren gjør innsjekk/quiz/oppgave.
4. Nearby oppdaterer anbefalingene.

Nearby skal ikke bare vise avstand. Det skal skape neste handling.

---

## 12. Fullført favoritt

Favoritt er fullført når:

1. Sted/person/rute markeres som favoritt.
2. Favoritten lagres.
3. Favoritten vises i profil eller samling.
4. Nearby kan bruke favoritter i anbefaling.

Favoritt må kunne fjernes igjen.

---

## 13. Fullført social-handling

En social-handling er fullført når:

1. Den er knyttet til et History GO-objekt: sted, rute, funn, profil eller Spotmeeting.
2. Privacy-regler er sjekket.
3. Handlingen lagres lokalt eller sendes til backend.
4. Brukeren ser tydelig resultat.
5. Eventuell mottaker/visning følger blokkerings- og synlighetsregler.

Eksempler:

- dele funn
- følge venn
- se venns offentlige ruteprogresjon
- kommentere på sted/rute dersom aktivert
- invitere til felles rute

---

## 14. Fullført Spotmeeting

Et Spotmeeting er fullført når:

1. Det er knyttet til et offentlig History GO-sted.
2. Tidspunkt er valgt.
3. Deltakere/invitasjon er definert.
4. Privacy/safety-regler er sjekket.
5. Møtet er lagret.
6. Deltakerstatus kan oppdateres.
7. Møtet kan kanselleres eller endres.
8. Det vises i relevant profil/social/stedskontekst.

Spotmeeting skal aldri bruke privat adresse som sted.

---

## 15. Fullført offentlig hjemsted

Offentlig hjemsted er fullført når:

1. Brukeren velger et eksisterende History GO-sted.
2. Appen lagrer `placeId`, navn, kategori, lat/lon og radius.
3. Det lagres ikke privat adresse.
4. Brukeren kan se og endre hjemstedet.
5. Nearby/ruter/anbefalinger kan bruke hjemstedet.
6. Synlighet/privacy er tydelig.

---

## 16. Definisjon av spillbar modul

En modul er spillbar når den har:

1. tydelig inngang
2. tydelig handling
3. tydelig lagring
4. tydelig belønning/status
5. tydelig visning i profil/Wonderkammer/PlaceCard der relevant
6. tydelig neste steg

Hvis en modul mangler flere av disse, er den bygget, men ikke ferdig spillbar.

---

## 17. Arbeidsregel

Alle nye systemer bør svare på:

- Hva gjør spilleren?
- Hva lagres?
- Hva låses opp?
- Hvor vises resultatet?
- Hva er neste steg?

Hvis svaret ikke finnes, er systemet ikke ferdig definert.
