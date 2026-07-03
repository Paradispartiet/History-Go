# Kunstakademiet

Kunstakademiet er et planlagt, selvstendig småspill for kunstlæring. Første spillmodus er **Kunstskolen**, der spilleren lærer kunst gjennom handling: å oppsøke steder, møte kunstnere, studere verk, løse observasjons-, analyse- og skisseoppgaver og bygge en egen portfolio.

Dette repo-scaffoldet er bevisst lite. Det etablerer produktidé, dataform, seed-data og første game-loop, men bygger ikke en stor app ennå.

## Repo-kartlegging

Dagens History Go-repo har allerede et lite mønster for selvstendige spillmapper:

- `games/art-school/README.md` og `games/art-school/data/manifest.json` finnes fra før som planlagt Kunstskolen-scaffold.
- `games/film-producer/README.md` og `games/film-producer/data/manifest.json` viser samme type liten spillmappe uten egen backend.
- `games/writing-academy/README.md` viser et mer modent selvstendig læringsspillmønster.
- Roten har `package.json` med TypeScript-, build-, smoke- og datakontrollscript for History Go.
- Roten har eksisterende `src/`, `public/`, `data/`, `docs/` og `scripts/`, men denne PR-en legger ikke Kunstakademiet inn i runtime.
- Eksisterende kunstdata finnes blant annet i `data/art/`, `data/epoker/`, `data/quiz/` og fagdata, men seed-filene her kopierer ikke full produksjonsdata.

## Hva Kunstskolen er

Kunstskolen er første spillmodus i Kunstakademiet. Spilleren starter som elev og lærer å se, beskrive, tolke og prøve kunstneriske teknikker gjennom korte spillhandlinger.

Spillet skal lære bort kunst ved at spilleren:

1. velger et kunststed eller en kunstner,
2. studerer ett kunstverk,
3. svarer på en observasjons-, analyse- eller skisseoppgave,
4. får progresjon i blikk, teknikk eller kunsthistorie,
5. lagrer arbeidet i portfolio/galleri,
6. låser opp neste oppgave.

## Kunstnere, verk, steder, teknikker og epoker

Kunstakademiet organiserer læringen rundt små, koblede noder:

- **Artist**: kunstnere som Edvard Munch, Harriet Backer og Gustav Vigeland.
- **Artwork**: konkrete verk eller verk-referanser som kan studeres gjennom oppgaver.
- **ArtPlace**: steder som MUNCH, Nasjonalmuseet og Vigelandsparken.
- **Technique**: ferdigheter som fargeobservasjon, komposisjon, lys/skygge og skisse.
- **Era**: epoker/stilarter som modernisme, naturalisme og symbolisme.
- **ArtTask**: korte spillbare oppgaver som gir progresjon og portfolioinnhold.

## Oppgaver

Oppgaver skal være små og handlingsbaserte. En oppgave kan be spilleren om å:

- observere linjer, farger, lys eller materialer,
- analysere stemning, motiv eller komposisjon,
- lage en rask skisse eller notere en skisseidé,
- sammenligne to verk eller steder,
- kuratere et lite galleriutvalg.

Første seed inneholder én observasjonsoppgave, én skisseoppgave og én analyseoppgave.

## Portfolio og galleri

Portfolio/galleri er spillerens lokale samling av svar, notater, skissebeskrivelser og miniutstillinger. Første versjon skal være en enkel lokal spillkontrakt, ikke opplasting, innlogging eller sosial deling.

## Senere kobling til History Go

Kunstakademiet skal senere kunne kobles til History Go via stabile referanser som `placeId`, `personId` og eventuelle `artworkId`-koblinger. Integrasjonen skal være referansebasert, ikke en direkte filavhengighet eller kopiering av hele History Go-data.

## Ikke implementert ennå

Denne grunnmuren implementerer ikke:

- stor UI eller startside,
- backend,
- innlogging,
- bildeopplasting,
- delbart galleri,
- direkte History Go-integrasjon,
- Civication-kobling,
- full kunsthistorisk database,
- runtime-endringer.

## Struktur i denne PR-en

```text
games/art-school/
  README.md
  docs/
    game-loop.md
    data-model.md
    pr-plan.md
  data/
    manifest.json
    seed/
      artists.json
      art-places.json
      artworks.json
      eras.json
      techniques.json
      tasks.json
      progress-state.example.json
      portfolio-items.example.json
```

Runtime er ikke endret. Filene er dokumentasjon og dev-/seed-data for videre arbeid.
