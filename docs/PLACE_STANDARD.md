# History GO — stedstandard

Dette dokumentet definerer hva et History GO-sted bør inneholde, og hvordan vi vurderer om et sted er stub, basis, spillbart, rikt, kampanje eller premium.

Det bygger på eksisterende kontrakter:

- `docs/DATA_PRODUCTION_CONTRACT.md`
- `data/places/README_place_rounds.md`
- `docs/APP_STRUCTURE_INDEX.md`
- `README/quizREADME.md`
- `data/wonderkammer/README.md`
- `docs/COMPLETION_DEFINITIONS.md`
- `docs/PROGRESSION_MODEL.md`

Gjelder History GO-spillet. Civication er eget prosjekt og inngår ikke i denne stedstandarden.

---

## 1. Hvorfor stedstandard?

Steder er navet i History GO.

Et sted kan brukes av kart, PlaceCard, quiz, observations, badges, people, Wonderkammer, ruter, Nearby, favoritter, Social Meet og Spotmeeting.

Derfor må det være tydelig hva et komplett sted er.

---

## 2. Harde dataregler

1. Ett sted skal ha én canonical place object.
2. Place ID skal ikke dupliseres på tvers av kategorifiler.
3. `category` er primært badge/domain.
4. Bruk `underbadge_ids` for underbadges.
5. Nye places skal ligge i manifest-loadede source-filer under `data/places/<category>/...`.
6. `data/places/places_index.json` er build-output og skal ikke håndredigeres.
7. Cross-domain-relevans skal løses med people, relations, quiz, emne_ids, leksikon, Wonderkammer, ruter, works eller overlays — ikke dupliserte place objects.
8. Progresjonsendrende kode må dispatch’e `updateProfile`.

---

## 3. Minimumsfelt

Et sted må minst ha:

```js
{
  id,
  name,
  lat,
  lon,
  category,
  desc
}
```

Dette gjør stedet synlig og søkbart, men ikke nødvendigvis spillbart.

---

## 4. Anbefalt komplett sted

Et rikt/spillbart sted bør ha:

```js
{
  id,
  name,
  lat,
  lon,
  r,
  category,
  underbadge_ids,
  year,
  desc,
  popupDesc,
  image,
  cardImage,
  frontImage,
  emne_ids,
  quiz_profile,
  people_ids,
  related_place_ids,
  route_ids,
  wonder_item_ids,
  tags,
  source_notes
}
```

Feltlisten er en produktstandard, ikke et krav om at alle eksisterende steder må migreres samtidig.

---

## 5. Modenhetsnivåer

| Nivå | Navn | Krav | Spillrolle |
|---|---|---|---|
| 0 | Stub | id/navn, ofte ufullstendig | peker/referanse |
| 1 | Basis | koordinat + kategori + korttekst | kartobjekt |
| 2 | Presentabelt | god PlaceCard/popup-tekst + bilde der mulig | lesbart sted |
| 3 | Spillbart | quiz/oppgave/observasjon eller annen handling + progresjon | faktisk spillobjekt |
| 4 | Rikt | emner, people, leksikon/Wonderkammer, relasjoner eller badges | samlingsobjekt |
| 5 | Kampanje | del av rute med stopp/progresjon/belønning | kampanjested |
| 6 | Premium | tekst, bilde, quizprofil, people, rute, funn, NextUp/Nearby-verdi og trygg social-kontekst der relevant | fullverdig History GO-sted |

---

## 6. Spillbart sted

Et sted er spillbart når det har:

1. gyldig koordinat og kategori
2. PlaceCard/popup som kan åpnes
3. tydelig stedstekst
4. minst én faktisk spillhandling
5. progresjon eller learning event
6. synlig status/belønning i profil, PlaceCard, Wonderkammer/leksikon, rute eller Nearby

Minimum spillflyt:

```text
Åpne sted → gjør handling → lagre progresjon/event → vis belønning/status → foreslå neste steg
```

---

## 7. PlaceCard-standard

PlaceCard er stedets kontrollrom, men må følge eksisterende appstruktur.

`index.html` eier PlaceCard/bottom sheet og quiz modal flow. `MapView` skal koordinere eksisterende DOM/runtime, ikke erstatte place card, kartmotor eller quizmotor.

PlaceCard bør vise:

- navn
- kategori
- bilde
- korttekst/langtekst
- status/medalje/badge
- primær handling
- people
- works
- badges
- routes
- fortellinger
- leksikon
- favoritt
- Social Meet / Spotmeeting der trygg og manuelt initiert

---

## 8. PlaceCard-rundinger

`rounds` er UI, ikke kategori- eller progresjonslogikk.

Canonical round IDs styres av `data/places/README_place_rounds.md`.

Viktige regler:

- Nye data trenger normalt ikke sette `rounds`; kategori-profilen bestemmer gridet.
- `rounds` skal ikke brukes til fagklassifisering.
- `rundinger` er legacy alias og skal ikke brukes i nye data.
- `wonderkammer` er ikke egen hovedrunding; Wonderkammer-innhold ligger under `leksikon`-flowen / leksikon-huben.
- `observations` er ikke egen hovedrunding; observasjoner er handling/flyt utenfor gridet.
- `tasks` brukes bare når brukeren faktisk kan gjøre en konkret fysisk oppgave på stedet.

---

## 9. Tekststandard

### `desc`

Kort tekst. Bør være 1–2 setninger.

Skal svare på:

- Hva er dette stedet?
- Hvorfor er det relevant i History GO?

### `popupDesc`

Lengre tekst. Bør gi historisk, kulturell eller faglig kontekst, forklare hvorfor stedet betyr noe, og vise hva spilleren bør legge merke til.

`popupDesc` skal ikke bare være leksikon. Den skal gjøre stedet observerbart og spillbart.

---

## 10. Quizstandard

Et spillbart sted bør ha stedsspesifikk quiz eller oppgave.

Quiz bør teste:

- hva stedet er
- hvorfor det er viktig
- hva man kan observere
- hvilket emne/kategori det hører til
- hvordan det skiller seg fra lignende steder

Quiz skal være source-led:

```text
external/local source → concrete claim → story unit → question
```

---

## 11. Emnekobling

Steder bør kobles til emner via `emne_ids` der dette er støttet.

Regel:

- emner er mikro-kunnskap
- quiz tester emner
- steder konkretiserer fagkartet
- observations gjør kunnskap situert
- courses/pensum tolker erfaring til progresjon

---

## 12. People-kobling

Et rikt sted bør kunne kobles til personer.

Personkobling bør svare på:

- hvem er relevant her?
- hva er relasjonen til stedet?
- er personen oppdaget eller låst opp her?
- vises personen i PlaceCard/popup?
- går personen til profil/samling/Wonderkammer?

Dataregel:

- Ikke dupliser people.
- Bruk manifest-loadede people-filer.
- `placeId` er primær place.
- `places[]` kan inneholde flere relevante anchors.
- Alle references må peke til eksisterende places.

---

## 13. Wonderkammer / leksikon-kobling

Wonderkammer-funn bør være konkrete stedsskatter.

Bruk regelen fra Wonderkammer-README:

```text
først tingen → så undringen → så handlingen → så samlingen
```

Nye Wonderkammer-entries bør helst være `actual_site_treasure`.

I PlaceCard skal dette primært vises via `leksikon`-flowen/huben, ikke som egen canonical `wonderkammer`-runding.

---

## 14. Rute-kobling

Et sted kan være del av én eller flere ruter.

For rute-klare steder bør data/kontrakt kunne svare på:

- hvilken rute?
- hvilket stopp?
- obligatorisk eller valgfritt?
- online, fysisk eller begge?
- hvilken handling fullfører stoppet?
- hvilken belønning/progresjon gis?

---

## 15. Nearby / NextUp-kobling

Et godt sted bør kunne anbefales fordi det:

- ligger nær spilleren eller offentlig hjemsted
- er ufullført
- inngår i aktiv rute
- låser opp person/funn
- gir kategori-progresjon
- er favoritt
- passer valgt interesse

Nearby skal ikke bare sortere avstand. Det skal gi spilleren neste gode handling.

---

## 16. Social Meet / Spotmeeting-kobling

Et sted kan være Spotmeeting-kontekst hvis:

1. brukeren starter flowen manuelt
2. context er trygt og forklarbart
3. det ikke brukes live-posisjon, nearby people, distance ranking eller public visit history
4. meldingen er preset-only
5. privacy guards godkjenner handlingen

---

## 17. Offentlig hjemsted

Et sted kan brukes som offentlig hjemsted hvis:

- det er et eksisterende History GO-sted
- det ikke er privat adresse
- det har lat/lon/radius
- brukeren kan endre det
- synlighet/privacy er tydelig

---

## 18. Sted QA

Før et sted regnes som spillbart, sjekk:

1. JSON parser.
2. Place ID er unik.
3. Source-filen er manifest-loadet.
4. `category` er gyldig canonical domain.
5. `underbadge_ids` finnes i relevant badgefil hvis brukt.
6. Koordinat og radius gir mening.
7. PlaceCard åpner.
8. Quiz/oppgave/observasjon starter.
9. Quiz-target peker til eksisterende place/person.
10. People references peker til eksisterende people/places.
11. Wonderkammer-entries validerer hvis brukt.
12. Rute references validerer hvis brukt.
13. `places_index.json` regenereres fra source ved behov.
14. Progresjonsendring trigger `updateProfile`.

---

## 19. Sted er ferdig når

Et sted kan kalles ferdig når:

- det har canonical data
- det har god PlaceCard
- det har en tydelig handling
- det gir status/belønning
- det kan vises i profil/Nearby/Wonderkammer/rute der relevant
- det bryter ikke data-, quiz-, place-rounds-, social- eller privacy-kontrakter

Kort sagt:

> Et History GO-sted er ikke bare et punkt på kartet. Det er et spillobjekt med handling, mening, progresjon og koblinger.
