# Wonderkammer – datastandard

Wonderkammer er History Gos *stedlige innsiktskammer*. Det er ikke en aktivitetsbank,
ikke et leksikon i miniformat, og ikke quiz. Det er en måte å se et sted med flere lag
samtidig: hva som er fysisk der, hvorfor det er interessant nettopp her, hva man kan
gjøre, og hva man kan ta med seg videre.

Denne mappa inneholder data som leses inn i `window.WONDERKAMMER` ved boot via
manifestet i `data/wonderkammer/index.json`, og rendres av
`js/ui/wonderkammer-entry.js`.

---

## Hva Wonderkammer skal være

- et stedlig innsiktskammer
- konkret for akkurat dette stedet
- sanselig, fysisk og observerbart
- koblet til historie, byrom, natur, kunst, lek eller sosial praksis
- nyttig både for barn og voksen
- mulig å bruke på stedet uten mye forklaring

## Hva Wonderkammer ikke skal være

- generiske aktivitetskort
- banale "tell fem ting"-oppgaver alene
- tilfeldige beskrivelser
- leksikon i miniformat
- quizspørsmål
- ren barnemoro uten stedlig dybde

Wonderkammer skal aldri blandes inn i `desc`, `popupDesc`, quiz eller leksikon.
Det er et eget datalag.

---

## Felter på en chamber/entry

### Eksisterende kjernefelt (bakoverkompatible, ikke fjern)

| Felt | Bruk |
|---|---|
| `id` | Unik streng. Konvensjon: `wk_<placeid>_<short>` |
| `title` | Kort visningstittel |
| `type` | Type fra typetabellen i renderer (`play_zone`, `art_zone`, `urban_space`, …) |
| `description` | Hva dette nivået eller objektet er |
| `activityText` | Hva man kan gjøre her (særlig for `play_*`, `training_*`, `activity`) |
| `ageHint` | Anbefalt aldersnivå eller "alle nivåer" |
| `items` | Array med underliggende entries (lekeobjekter, items, detaljer) |

Eksisterende meta-felt (rendres som meta-grid):
`safetyNote`, `durationHint`, `intensity`, `equipment`, `season`,
`playMode`, `socialMode`.

### Nye valgfrie smart-felt

Bruk disse til å løfte chambers fra banale til stedlige. Alle er valgfrie; rendereren
viser bare seksjoner som finnes. Rekkefølgen under tilsvarer rekkefølgen i popupen.

| Felt | Seksjonstittel | Hva det skal inneholde |
|---|---|---|
| `observationHook` | Se etter | Én konkret ting brukeren skal legge merke til her |
| `whyItMatters` | Hvorfor det betyr noe | Hvorfor dette er interessant nettopp her |
| `placeSpecificDetail` | Stedsspesifikk detalj | En detalj som gjør at teksten ikke kunne vært brukt hvor som helst |
| `sensoryPrompt` | Sans dette | Hva man kan se, høre, kjenne, lukte, merke i kroppen |
| `microMission` | Mikrooppgave | Én liten konkret oppgave på stedet |
| `childAction` | Barnets handling | Hva barnet faktisk kan gjøre, ikke bare se på |
| `adultRole` | Voksenrollen | Hva den voksne gjør: peke, spørre, sikre, holde avstand |
| `historyLayer` | Historisk lag | Historisk lag hvis relevant |
| `socialLayer` | Sosialt lag | Sosial koreografi, blikk, venting, makt, flyt |
| `materialLayer` | Materiallag | Materialer, form, spor, overflater, konstruksjon |
| `conceptHook` | Begrepskrok | Kobling til fagbegrep eller History Go-emne, uten å bli quiz |
| `collectibleHint` | Kan samles som | Hva dette kan bli som samlingsobjekt: observasjon, minne, merke, objekt, språkord, personkobling |

`adultRole` legges som dedikert seksjon når feltet finnes, og er derfor utelatt fra
meta-griden for å unngå duplisert visning.

---

## Kvalitetskrav

1. Hver chamber må ha minst én stedsspesifikk detalj. Hvis chamberen kunne vært
   limt inn på et hvilket som helst annet sted i Oslo, mangler det noe.
2. Hver chamber må svare på "hvorfor er dette interessant her?".
   Bruk gjerne `whyItMatters` eksplisitt.
3. Hver chamber bør ha enten `observationHook`, `microMission` eller `sensoryPrompt`
   – noe brukeren faktisk skal gjøre eller legge merke til.
4. **Lekeplassdata** må beskrive hva barnet kan gjøre, *og* hva objektet lærer barnet
   om kropp, rom, tur, risiko, rytme, materialer eller sosial samhandling.
5. **Treningsdata** må beskrive flere måter å trene på stedet, *og* hva stedet gjør
   mulig som andre steder ikke gjør.
6. **Byromsdata** må vise sosial koreografi, kanter, flyt, venting, blikk,
   materialer, rytme eller makt.
7. **Kunstdata** må vise form, materiale, plassering, blikkretning, publikumsrolle
   og historisk/kulturell betydning.
8. **Naturdata** må vise arter, terreng, vann, vær, lyd, lukt, årstid og økologiske
   sammenhenger der det passer.

---

## Eksempler

### Banalt vs. bedre: et torg

Dårlig:
> Barnet kan telle fem røde ting.

Bedre:
> Se etter hvor fargene sitter: på skilt, klær, varer og fasader. Barnet kan velge
> én farge og følge den gjennom torget. Slik blir torget et kart over handel,
> bevegelse og oppmerksomhet.

### Banalt vs. bedre: en huske

Dårlig:
> Barnet kan huske.

Bedre:
> Husken gjør rytme og tyngdekraft konkret. Barnet kan kjenne forskjellen mellom
> dytt utenfra og egen fart, og den voksne kan hjelpe barnet å merke når kroppen
> finner takten selv.

### Banalt vs. bedre: en fasade

Dårlig:
> Se på fasadene.

Bedre:
> Se etter hvordan vinduer, sokler, dører og materialer lager en grense mellom
> offentlig plass og institusjon. Fasaden viser hvem bygget vil slippe inn, og
> hvem det bare vil imponere.

---

## Praktiske notater

- Gamle entries uten smart-felt skal fortsatt fungere uendret. Renderer viser bare
  seksjoner som finnes.
- Ikke gjør tekstene lange for tekstens skyld. Korte, presise og fysisk brukbare
  tekster er bedre enn lange.
- Skriv på norsk. Ikke turistbrosjyre, ikke barnehagespråk, ikke akademisk tungt,
  ikke poetisk svulstig.
- Wonderkammer-popupen åpnes via `window.Wonderkammer.openEntry(id)`. API-en endres
  ikke når nye felter legges til.
- Validering: `node scripts/audit-wonderkammer-data.mjs`.
  Banal-varsler er warnings, ikke hard error, slik at eksisterende data
  fortsatt parses.
