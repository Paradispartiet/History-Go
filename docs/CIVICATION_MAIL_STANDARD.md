# Civication Mail Standard

Dette dokumentet er standarden for alle nye Civication-mailer. Målet er at mailene ikke bare skal være hendelser i en inbox, men hovedscenen i Civication: stedet der rolle, arbeid, makt, relasjoner, tillit, klasse, sted og konsekvens blir spillbare.

Standarden gjelder for:

- `data/Civication/mailPlans/...`
- `data/Civication/mailFamilies/...`
- V2-mailer med `from`, `place_id`, `reply`, `triggers_on_choice` og `threads`
- fremtidige roller, kategorier og karriereløp

Den tekniske runtime-en skal være enkel: den leser plan og familier. Kvaliteten skal ligge i dataene.

## 1. Hva en Civication-mail er

En Civication-mail er ikke bare en tekstmelding. Den er en liten sosial scene med valg.

En god mail skal gjøre minst én av disse tingene:

1. Gi spilleren et konkret valg.
2. Avsløre noe om rollen spilleren har.
3. Bygge en relasjon til en person.
4. Koble arbeid til sted, klasse, makt, økonomi eller institusjon.
5. Endre tillit, risiko, status, lojalitet eller retning.
6. Flytte spilleren ett lite steg i en større karrierefortelling.

Hvis mailen ikke gjør minst én av disse tingene, skal den ikke inn.

## 2. Grunnform

Alle nye mailer bør følge denne formen:

```json
{
  "id": "mellomleder_intro_v2_001",
  "mail_type": "job",
  "mail_family": "mellomleder_intro_v2",
  "role_scope": "mellomleder",
  "phase": "intro",
  "priority": 60,
  "cooldown": 1,
  "repeatable": false,
  "stage": "stable",
  "from": "inger_avdelingsleder",
  "place_id": "lilleborg_fabrikker",
  "subject": "Tall for september — vi må snakke",
  "purpose": "Etablere mellomlederens press ovenfra og ansvar for avvik.",
  "stakes": "Spilleren må velge mellom realistisk ansvar og offensiv synlighet.",
  "situation": [
    "Kort inngang.",
    "Konkret melding eller situasjon.",
    "Hva som står på spill."
  ],
  "choices": [
    {
      "id": "A",
      "label": "Kort handling eller replikk.",
      "reply": "Kort svartekst som kan vises i tråd.",
      "tags": ["legitimacy", "humility"],
      "effect": 0,
      "feedback": "Kort konsekvens.",
      "triggers_on_choice": "inger_thread_tall_a"
    }
  ]
}
```

`purpose` og `stakes` er dramaturgiske kvalitetsfelt. De trenger ikke vises i UI. De gjør det lettere å forstå hvorfor mailen finnes, og gjør senere generering, revisjon og debugging bedre.

## 3. Lengde

Standardmailen skal være kort nok til å leses på mobil uten å føles som en artikkel.

Normal lengde:

- `subject`: 3–9 ord
- `situation`: 2–4 linjer
- samlet situasjonstekst: ca. 60–110 ord
- `choices`: normalt 2 valg
- `feedback`: 1–2 setninger
- thread-followup: kortere enn hovedmailen

Unntak:

- `climax` kan være lengre.
- store `conflict`- eller `event`-mailer kan være lengre.
- første mail i en ny rolle kan være litt fyldigere.

Men som hovedregel skal Civication være rytmisk: korte scener, tydelige valg, gradvis akkumulering.

## 4. Mailtyper

### `job`

Formål: vise hva rollen faktisk gjør.

`job`-mailer skal handle om arbeidets konkrete hverdagskrav. De skal ikke bare forklare rollen, men la spilleren kjenne hva rollen krever.

Eksempler:

- Arbeider: skift, rutiner, tempo, sikkerhet, uformell opplæring.
- Fagarbeider: presisjon, mentoransvar, faglig dømmekraft, kunnskapsoverføring.
- Mellomleder: tall, rapportering, press ovenfra, krav nedenfra, prioritering.

### `faction_choice`

Formål: plassere spilleren sosialt og politisk.

Dette skal ikke føles som et flatt «velg lag». Det skal føles som en konkret situasjon der spilleren må vise hvem de lytter til, hvem de beskytter, og hvem de risikerer å miste tillit hos.

Gode spørsmål i `faction_choice`:

- Hvem svarer du først?
- Hvem får vite hva?
- Hvilken versjon av saken sender du videre?
- Hvem lar du vente?
- Hvilket problem gjør du formelt, og hvilket lar du bli uformelt?

### `people`

Formål: bygge personer over tid.

`people`-mailer er der NPC-er blir mer enn navn. De skal bygge gjenkjennelige stemmer, relasjoner og små historiske spor.

En personmail bør ha:

- en tydelig avsenderstemme
- en konkret grunn til at personen kontakter deg
- et valg som påvirker tillit, avstand, respekt eller irritasjon
- mulighet for gjentakelse over tid, men ikke repetisjon av samme scene

### `story`

Formål: bygge karrierefortellingen.

`story`-mailer peker utover enkeltoppgaven og spør: hvor er livet ditt på vei?

De bør handle om:

- forfremmelse
- omdømme
- slitasje
- lojalitet
- nye muligheter
- overgang mellom roller
- personlige eller sosiale konsekvenser av arbeidslivet

### `conflict`

Formål: sette spilleren i en reell klemme.

En conflict-mail er bare god hvis alle valg har kostnad. Den skal ikke ha ett åpenbart riktig valg.

Eksempel på konfliktlogikk:

- Gjør du ledelsen fornøyd, mister gulvet tillit.
- Beskytter du gulvet, skaper du rapporteringsproblem.
- Forteller du hele sannheten, skader du en allianse.
- Tier du, får problemet vokse.

### `event`

Formål: større ytre hendelser.

`event`-mailer er hendelser som kommer utenfra rollen, men påvirker rollen.

Eksempler:

- inspeksjon
- streik
- omorganisering
- ulykke
- mediesak
- markedskrise
- kommunal beslutning
- ny teknologi
- nedbemanning

## 5. Faser

Civication-mailer bruker disse fasene:

```text
intro → early → mid → advanced → mastery → climax
```

### `intro`

Etablerer rollen. Spilleren lærer hva rollen er, hvem som betyr noe, og hvilke typer press som finnes.

### `early`

Små valg får sosial betydning. Spilleren begynner å bli lest av andre.

### `mid`

Tidligere valg kommer tilbake. Relasjoner, tillit og lojalitet begynner å gjøre systemet asymmetrisk.

### `advanced`

Spilleren får større handlingsrom og større risiko. Flere systemer kobles sammen.

### `mastery`

Spilleren forstår rollen godt nok til å bruke den aktivt. Mailene bør handle om strategisk dømmekraft, ikke bare reaksjon.

### `climax`

En større konsekvens eller avgjørelse. Dette skal være sjeldent og føles fortjent.

## 6. Rollebuer

### Arbeider

Fra: ny på gulvet.

Til: forstår rutiner, tempo, sikkerhet, uformell makt, arbeidsfellesskap og små former for motstand.

Typiske spørsmål:

- Hører du etter?
- Lærer du rytmen?
- Hvem beskytter deg?
- Når sier du fra?
- Når holder du kjeft?

### Fagarbeider

Fra: dyktig praktiker.

Til: kunnskapsbærer, mentor, faglig autoritet og oversetter mellom praksis og system.

Typiske spørsmål:

- Hvordan lærer du bort det du kan?
- Når holder du på faglig standard?
- Når bøyer du deg for tempo?
- Hvem får tilgang til din kunnskap?
- Hvordan bygger du autoritet uten formell makt?

### Mellomleder

Fra: forfremmet og klemt mellom nivåer.

Til: strateg, oversetter, politisk aktør og ansvarsbærer.

Typiske spørsmål:

- Hvem beskytter du når tallene faller?
- Hva rapporterer du oppover?
- Hva skjuler du nedover?
- Hvem bygger du allianse med?
- Hvor mye menneske tåler systemet at du er?

### Formann / leder videre

Fra: lokal autoritet.

Til: institusjonell makt, konflikt, kompromiss og systemansvar.

Typiske spørsmål:

- Når blir erfaring til styring?
- Når blir lojalitet til kontroll?
- Når må du ofre en god relasjon for å holde systemet gående?
- Når må du bryte systemet for å være anstendig?

## 7. Valg

Valgene er kjernen. De må være konkrete.

Dårlige valg:

```text
Ta ansvar
Vær forsiktig
Sats på samarbeid
Vær effektiv
```

Gode valg:

```text
«Jeg har en plan klar fredag. Realistisk, ikke optimistisk.»
Møt opp 06:45 med termos.
Send Roger utkastet før du svarer Inger.
«Vi venter til september-tallene er bra. Ny plan da.»
```

Valg bør skille seg langs minst én akse:

- ærlig / strategisk
- formell / uformell
- lojal oppover / lojal nedover
- synlig / forsiktig
- faglig / politisk
- relasjonell / effektiv
- kortsiktig / langsiktig

Valg skal ikke alltid være moralske. Ofte skal begge valg være forståelige.

## 8. Feedback

Feedback skal ikke forklare hele systemet. Den skal vise en liten konsekvens.

God feedback:

```text
Inger setter pris på at du senker forventningen først.
Roger registrerer deg som en allierbar.
Du har gitt henne den trygge formelen, men ikke den ekte kunnskapen.
```

Dårlig feedback:

```text
Du får +1 legitimitet og mister -1 risiko.
Dette valget gjør deg mer samarbeidsorientert.
Du valgte riktig.
```

Tall og systemeffekter kan finnes i data, men teksten bør være menneskelig.

## 9. Threads

Threads er Re:-oppfølgere som trigges av valg.

Bruk:

```json
"triggers_on_choice": "inger_thread_tall_a"
```

Threaden skal ligge i samme family under:

```json
"threads": []
```

En thread skal normalt:

- være kortere enn hovedmailen
- vise at noen faktisk reagerer på svaret ditt
- forsterke personens stemme
- gi én liten konsekvens
- ikke introdusere en helt ny stor sak

Threads skal brukes når svaret betyr noe sosialt. De skal ikke brukes på alle valg bare for å lage mer tekst.

## 10. Personer

Personer er langsiktige relasjoner, ikke bare avsendere.

Hver viktig NPC bør ha:

- fast `id`
- navn
- rolle/tittel
- stemme
- sosial posisjon
- hva de vil ha fra spilleren
- hva de frykter
- hva som får dem til å stole mer på spilleren
- hva som får dem til å trekke seg unna

Mailen bør aldri bruke en NPC bare som dekor. Hvis Egil, Liv, Inger, Frode eller Tor sender en mail, skal det gradvis bygge et forhold.

## 11. Steder

`place_id` skal ikke være pynt. Stedet skal gi scenen konkretitet.

Et godt sted gjør minst én av disse tingene:

- forankrer rollen i Oslo / History Go-verdenen
- gir arbeidets konflikt en fysisk ramme
- kobler Civication til steder spilleren kjenner fra kartet
- gjør økonomi, industri, kultur eller makt lokal

Eksempel:

```json
"place_id": "lilleborg_fabrikker"
```

bør ikke bare bety “mailen skjer et sted”, men at Lilleborg faktisk former arbeidsrollen, språket og konfliktene.

## 12. Tags og effekter

Tags skal beskrive retning, ikke bare tema.

Gode tags:

```text
legitimacy
humility
visibility
risk
craft
process
mentor
alliance
isolation
loyalty_to_workers
loyalty_to_leader
formal
informal
```

Tags bør brukes konsekvent slik at senere systemer kan lese spillerens mønster.

`effect` skal være enkel og forsiktig. Ikke overbelast enkeltsvar med store tall. Civication bør bygge konsekvenser over tid.

## 13. Hva mailene ikke skal være

Civication-mailer skal ikke være:

- lange forklaringsartikler
- quizspørsmål i forkledning
- generiske RPG-oppdrag
- moralske fasiter
- ren flavor-tekst uten valg
- løsrevet prosa uten systemeffekt
- UI-instruksjoner
- ren opplæringstekst om hvordan spillet fungerer

Mailen skal alltid være en situasjon.

## 14. Kvalitetssjekk før en mail legges inn

Før en ny mail legges inn, sjekk:

1. Har mailen en tydelig avsender?
2. Har den et konkret sted?
3. Har den et formål (`purpose`)?
4. Har den noe som står på spill (`stakes`)?
5. Er situasjonen kort nok?
6. Er valgene konkrete?
7. Peker valgene i ulike retninger?
8. Gir feedbacken en sosial eller praktisk konsekvens?
9. Passer mailen inn i rollefasen?
10. Bygger den en større retning?

Hvis svaret er nei på flere av disse, må mailen skrives om.

## 15. Standard arbeidsflyt for nye mailpakker

Når vi lager en ny rollepakke eller reviderer en eksisterende:

1. Definer rollebuen.
2. Definer 3–6 sentrale NPC-er.
3. Definer 3–6 relevante steder.
4. Definer mailplanen: intro, early, mid, advanced, mastery, climax.
5. Skriv `job`-mailene først.
6. Skriv `faction_choice` tidlig.
7. Skriv `people`-mailer rundt NPC-ene.
8. Skriv `conflict`-mailer først når rollen har nok sosial kontekst.
9. Skriv `story`-mailer som bindevev.
10. Skriv `event`-mailer som ytre press.
11. Legg til threads bare der valget faktisk bør gi svar.
12. Test med `window.CivicationMailRuntime.debugCandidates()`.

## 16. Retning for Civication

Civication skal ikke bare være et jobbspill.

Det skal være et system der spilleren gradvis lærer hvordan roller, steder, arbeid, status og relasjoner former handlingsrommet deres.

Mailene er hovedformen for dette. De skal føles som arbeidsliv, men under overflaten skal de handle om makt, tillit, kunnskap, lojalitet og sosial posisjon.

Hver mail skal derfor spørre, direkte eller indirekte:

```text
Hva slags menneske blir du i denne rollen?
Hvem får tillit til deg?
Hvem mister tillit til deg?
Hva slags makt lærer du å bruke?
Hva ofrer du for å fungere i systemet?
```

Dette er standarden fremover.
