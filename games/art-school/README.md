# Kunstskolen

Kunstskolen er planlagt som en egen mini-modus i History Go: spilleren besøker kunststeder, låser opp kunstnere og verk, gjør små analyse-/observasjons-/skisseoppgaver og bygger en egen portfolio. Modusen skal ligne på de uavhengige spillmappene for HG Film Producer og Skrivekunstakademiet, men bruke eksisterende History Go-steder/personer/verk som kilder.

Kunstskolen skal **ikke** implementeres som en Civication-modus. Civication kan lenke hit og vise status, men skal ikke være motor, datakildeeier eller progresjonseier.

## Kartlegging av dagens repo

### Eksisterende mini-modus-mønster

- `data/historygo/shared/game_registry.json` registrerer uavhengige History Go-spill med `gameId`, `entryPath`, `readsFromHistoryGo`, `writesBackToProfile` og en eksplisitt uavhengighetsregel. Kunstskolen finnes allerede som `hgArtSchool` med `entryPath: "games/art-school/"`.
- `js/historyGoGameRegistry.js` leser registeret og tegner spillkort i profilens spillseksjon. Ikonet for `hgArtSchool` er allerede definert som 🎨.
- `games/film-producer/README.md` og `games/film-producer/data/manifest.json` er et minimalt scaffold for egen spillmappe uten runtime-endring.
- `games/writing-academy/README.md` viser et mer utviklet mønster: egen mappe, egne datascaffold, referanseindeks inn mot canonical History Go-data, og profilkontrakt via `window.dispatchEvent(new Event("updateProfile"))`.

### Eksisterende kunstdata og fagdata

- `data/art/artworks_Oslo.json` finnes som første kunstverkstruktur, men er foreløpig én JSON-post og ikke en stor katalog.
- `data/fag/kunst/` inneholder fagkart, emner, emnemapping, metoder, pensum, quiz-mal og quizgeneratorregler for kunstfaget. Dette bør brukes som lærings-/progresjonsgrunnlag, ikke som direkte spilltilstand.
- `data/epoker/epoker_kunst.json` og `js/epoker-runtime.js` viser at kunst allerede er en epoke-/domeneverdi i History Go.
- `data/quiz/quiz_kunst.json`, `data/quiz/quiz_kunst_plus_from_by.json` og `data/quiz/kunst/quiz_kunst_offentlig_kunst_v1.json` gir eksisterende quizinnhold for kunst.
- `data/debates/debates_kunst.json`, `data/badges/kunst.json`, `knowledge/knowledge_kunst.html` og `data/stories/stories_manifest_kunst_batch_01.json` viser at kunst allerede har merker, kunnskapsside, debatter og stories.
- `data/people/people_kunst.json` finnes, men er tom akkurat nå. Personer kan likevel finnes i andre people-/story-/fagfiler, så Kunstskolen må referere forsiktig til canonical `personId` når de finnes, og ha `pendingPersonRef`/review når de mangler.

### Kunststeder og stedskoblinger

Repoet har eksisterende kunstrelaterte steder i stedstekster/i18n og fagdata, blant annet Nasjonalmuseet, MUNCH, Astrup Fearnley Museet, Vigelandsparken, Ekebergparken, Tjuvholmen og Barcode. Disse bør brukes som låsepunkter i Kunstskolen i stedet for å kopiere steddata.

`data/relations.json` er relasjonslaget som er migrert fra people.placeId/people.places. Kunstskolen bør bruke samme idé: egne oppdrag peker til `placeId`, `personId` og `artworkId`, men canonical eierskap ligger fortsatt i History Go-data.

### Place card, quiz og progresjon

- `index.html` inneholder eksisterende place card (`#placeCard`) med quizknapp (`#pcQuiz`) og person-/Civication-elementer. Kunstskolen skal ikke endre dette i første fase.
- `js/quizzes.js` er eksisterende quizmotor. Den lagrer quizprogresjon i `quiz_progress`, set-progresjon i `hg_quiz_sets_v1`, skriver læringslogg og sender profiloppdatering.
- `js/progress/profileProgressReader.js` leser quiz-/unlock-progresjon read-only til profilvisninger.
- `js/core/knowledgeLearningState.js` har et lite localStorage-basert læringsstate-mønster og sender `updateProfile` ved endringer.

## Minimal datastruktur

Første versjon bør være små, referansebaserte datafiler under `games/art-school/data/`. Ikke kopier store canonical datasett; pek til dem.

### Manifest

```json
{
  "schemaVersion": "0.1.0",
  "gameId": "hgArtSchool",
  "displayName": "Kunstskolen",
  "status": "planning",
  "sourceIndexPath": "games/art-school/data/source_index.json",
  "tracksPath": "games/art-school/data/tracks.json",
  "assignmentsPath": "games/art-school/data/assignments.json",
  "progressionPath": "games/art-school/data/progression_rules.json"
}
```

### Kunstverk

```ts
type ArtSchoolArtworkRef = {
  artworkId: string;
  title: string;
  artistIds: string[];
  canonicalArtworkPath?: string;
  placeIds: string[];
  periodIds: string[];
  techniqueIds: string[];
  workType: "painting" | "sculpture" | "installation" | "mural" | "architecture" | "design";
  studyPrompts: string[];
};
```

```json
{
  "artworkId": "art_munch_scream_ref",
  "title": "Skrik",
  "artistIds": ["person_edvard_munch"],
  "placeIds": ["munch", "nasjonalmuseet"],
  "periodIds": ["modernisme", "symbolisme"],
  "techniqueIds": ["composition", "colour_observation"],
  "workType": "painting",
  "studyPrompts": ["Hva gjør linjene med følelsen i bildet?", "Finn én fargekontrast som styrer blikket."]
}
```

### Kunstnere

```ts
type ArtSchoolArtistRef = {
  artistId: string;
  canonicalPersonId?: string;
  displayName: string;
  linkedPlaceIds: string[];
  periodIds: string[];
  techniqueIds: string[];
  unlockBy?: { placeIds?: string[]; assignmentIds?: string[] };
};
```

### Steder

```ts
type ArtSchoolPlaceNode = {
  placeId: string;
  role: "museum" | "public_art" | "artist_home" | "architecture" | "gallery_area";
  unlocks: { artworkIds?: string[]; artistIds?: string[]; assignmentIds?: string[] };
  visitTaskIds: string[];
};
```

### Teknikker

```json
{
  "techniqueId": "colour_observation",
  "label": "Fargeobservasjon",
  "skillAxis": "blikk",
  "levels": ["se", "sammenligne", "begrunne"],
  "evidenceTypes": ["short_text", "photo_note", "sketch_note"]
}
```

### Epoker og stilarter

```json
{
  "periodId": "modernisme",
  "label": "Modernisme",
  "sourceDomain": "kunst",
  "canonicalEpokeRefs": ["data/epoker/epoker_kunst.json"],
  "starterPlaces": ["munch", "nasjonalmuseet"],
  "starterArtists": ["person_edvard_munch"]
}
```

### Oppgaver

```ts
type ArtSchoolAssignment = {
  assignmentId: string;
  title: string;
  assignmentType: "observe" | "analyse" | "sketch" | "compare" | "curate";
  requiredPlaceIds?: string[];
  artworkIds?: string[];
  artistIds?: string[];
  techniqueRewards: Record<string, number>;
  historyRewards: Record<string, number>;
  portfolioOutput: "note" | "sketch" | "comparison" | "mini_exhibition";
  prompt: string;
  completionContract: "local_draft_only" | "profile_progress";
};
```

### Progresjon

```json
{
  "storageKey": "hg_art_school_progress_v1",
  "tracks": [
    { "trackId": "blikk", "label": "Blikk", "levelThresholds": [0, 3, 7, 12] },
    { "trackId": "teknikk", "label": "Teknikk", "levelThresholds": [0, 3, 7, 12] },
    { "trackId": "kunsthistorie", "label": "Kunsthistorie", "levelThresholds": [0, 3, 7, 12] }
  ],
  "profileEvent": "updateProfile"
}
```

### Portfolio/galleri

```ts
type ArtSchoolPortfolioEntry = {
  entryId: string;
  assignmentId: string;
  createdAt: string;
  placeId?: string;
  artworkId?: string;
  artistId?: string;
  outputType: "note" | "sketch" | "comparison" | "mini_exhibition";
  title: string;
  playerText?: string;
  localAssetRef?: string;
  awardedTechniqueIds: string[];
};
```

Portfolio bør starte som lokal, enkel `localStorage`-tilstand. Ikke last opp bilder eller generer delbare gallerier i første PR-er.

## Første spillbare loop

1. Spilleren åpner profilens Spill-seksjon og velger **Kunstskolen**.
2. Kunstskolen viser én startoppgave: «Gå til Nasjonalmuseet og tren blikket: finn ett verk og beskriv linje, farge og stemning.»
3. Spilleren åpner/låser opp et eksisterende History Go-kunststed, for eksempel Nasjonalmuseet eller MUNCH.
4. Modusen kobler stedet til ett verk eller én kunstner, for eksempel Munch, Harriet Backer eller Gustav Vigeland når canonical person-/verk-ID finnes.
5. Spilleren gjør en enkel oppgave med tre felt:
   - Hva ser du først?
   - Hvilken teknikk/form styrer blikket?
   - Hva tror du kunstneren vil at du skal merke?
6. Ved fullføring får spilleren små poeng i `blikk`, `teknikk` og/eller `kunsthistorie`.
7. Svaret lagres som en portfolio-entry lokalt, og modusen sender `window.dispatchEvent(new Event("updateProfile"))`.
8. Neste oppgave låses opp: sammenlign ett museumsverk med ett offentlig verk i byen, for eksempel Nasjonalmuseet → Vigelandsparken.

## Foreslått filstruktur

```text
games/art-school/
  README.md                         # plan, datakontrakter og PR-plan
  data/
    manifest.json                   # liten modus-manifest
    source_index.json               # peker til eksisterende HG-kilder
    tracks.json                     # blikk/teknikk/kunsthistorie, ingen runtime ennå
    assignments.json                # 3-5 seed-oppgaver i PR 2/4
    progression_rules.json          # terskler og unlock-regler
    portfolio_schema.json           # lokal portfolio-kontrakt
  ui/
    README.md                       # plan for senere startside/panel, ingen stor UI først
```

Integrasjonspunkter mot eksisterende History Go-data:

- `data/historygo/shared/game_registry.json` for registrering og spillkort.
- `data/art/artworks_Oslo.json` som mulig første artwork-kilde.
- `data/fag/kunst/*` for fagkart, metoder, epoker, emner og oppgave-/quiz-prinsipper.
- `data/quiz/quiz_kunst*.json` og `data/quiz/kunst/*.json` for senere gjenbruk av quiz/studieinnhold.
- `data/relations.json` for person–sted-relasjoner.
- Eksisterende place card/quiz/profilflyt skal bare leses eller lenkes til i starten, ikke bygges om.

## Trygg implementasjonsplan

### PR 1: README + datastruktur + ingen runtime-endring

- Utvid `games/art-school/README.md` med kartlegging, kontrakter, eksempelskjemaer og plan.
- Oppdater `games/art-school/data/manifest.json` til `planning` hvis ønskelig.
- Eventuelt legg til tomme/små schemafiler uten å laste dem i appen.
- Ingen endring i `index.html`, place card, Civication eller produksjonsflyt.

### PR 2: seed-data for 5–10 kunstverk/kunstnere/steder

- Lag `source_index.json` og små seed-filer med referanser til eksisterende History Go-steder.
- Start med Nasjonalmuseet, MUNCH, Astrup Fearnley, Vigelandsparken, Tjuvholmen/Barcode og Ekebergparken.
- Bruk `canonicalPersonId`/`canonicalArtworkPath` der repoet faktisk har ID-er; ellers marker `needsReview`.

### PR 3: enkel Kunstskolen-startside

- Lag en minimal statisk inngang under `games/art-school/` som kan åpnes fra spillkortet.
- Vis tittel, status, første oppgave og lenker tilbake til History Go-steder.
- Ingen place card-ombygging og ingen stor UI.

### PR 4: første oppgave-loop

- Implementer én lokal oppgaveflyt: velg oppgave → les sted/verk-kort → svar på 2–3 tekstfelt → lagre completion.
- Bruk `localStorage`-nøkkel `hg_art_school_progress_v1`.
- Send `window.dispatchEvent(new Event("updateProfile"))` etter fullføring.

### PR 5: portfolio/progresjon

- Legg til lokal portfolio-visning og en enkel progresjonsoppsummering.
- Summer `blikk`, `teknikk` og `kunsthistorie`.
- Hold deling/opplasting/bildehåndtering utenfor denne PR-en.

## Avgrensninger

- Ikke flytt eksisterende filer.
- Ikke endre produksjonsflyt ennå.
- Ikke lag stor UI før datakontrakten er stabil.
- Ikke bland Kunstskolen inn i Civication.
- Ikke kopier canonical History Go-data inn i Kunstskolen når referanser holder.
- Bevar eksisterende place card, quiz, profil, badges og kunnskapssider.

## Anbefalt første implementeringsprompt

> Implementer PR 1 for Kunstskolen: Oppdater bare `games/art-school/README.md` og eventuelt `games/art-school/data/manifest.json` med planlagt status, datakontrakter og kildeindeks-konsept. Ikke legg til runtime-kode, ikke endre `index.html`, ikke endre Civication, og ikke opprett store seed-data ennå. Kjør en enkel JSON-validering av manifestet og commit endringen.
