# History GO — quiz og fysisk besøksmodell

## Grunnregel

Quiz er alltid digitalt tilgjengelig. Fysisk besøksstatus registreres bare gjennom posisjonskontroll ved stedet.

De tre handlingene skal aldri blandes:

1. `opened` — spilleren har åpnet stedet i appen.
2. `quiz_completed` — spilleren har fullført læringsinnhold om stedet.
3. `visited` — spilleren har vært fysisk innenfor stedets besøksradius og registrert besøket.

## Digital quiz

Quiz kan tas uansett hvor spilleren befinner seg.

Quiz kan gi:

- knowledge og trivia
- emner og konsepter
- quizprogresjon
- faglige meritpoeng og læringsmerker
- personer som digitale samlingsobjekter
- dypere leksikoninnhold
- digital ruteprogresjon

Quiz skal ikke:

- skrive til `visited_places`
- telle som Groundhopper-besøk
- fullføre et fysisk rutestopp
- gi et «jeg har vært her»-merke

## Fysisk besøk

PlaceCard-knappen heter `Registrer besøk`.

Besøket kan bare registreres når GPS-gaten godkjenner minst ett av stedets besøksankre. Testmodus kan fortsatt brukes til utvikling.

Fysisk besøk kan gi:

- besøksstatus og kartmarkering
- første og siste besøksdato
- besøksantall
- reiselogg og besøksstatistikk
- Groundhopper-progresjon
- fysisk ruteprogresjon
- steds- og oppdagelsesmerker
- stedlige observasjoner og faktiske funn

Fysisk innsjekk gir ikke automatisk faglige quizpoeng.

## Runtime-kontrakt

- `window.HGPhysicalVisits.record(place)` er inngangen for fysisk besøksregistrering.
- Den tidligere `window.saveVisitedFromQuiz` er deaktivert som quiz-skrivevei.
- QuizEngine får en digital tilgangsvisning som oppfyller den gamle besøksgaten uten å endre fysisk besøksdata.
- Quizbelønning for et sted omtales som `Stedskunnskap fullført`, ikke som at stedet er fysisk samlet.

## Statusnivåer

| Status | Betydning |
|---|---|
| Åpnet | Stedet er utforsket digitalt |
| Quiz fullført | Spilleren har lært om stedet |
| Besøkt | Spilleren har vært fysisk til stede |
| Utforsket | Quiz og fysisk besøk er fullført |
| Mestret | Quiz, fysisk besøk og en ekstra stedlig handling er fullført |
