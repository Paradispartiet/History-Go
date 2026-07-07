# Content i18n audit batch 1

## Status

Kort oppsummering:

- UI-i18n er ferdig for `nb/en/es/pt`: `data/i18n/ui/nb.json`, `en.json`, `es.json` og `pt.json` finnes og har lik nøkkelmengde i denne batchens kontroll.
- Denne rapporten kartlegger content-i18n etter ferdig UI-i18n. UI-dictionaries og UI-runtime er ikke scope for endring i denne batchen.
- Ingen runtime/data/dictionary-endringer gjort.

## Scope

Inspiserte filer og områder:

- `reports/i18n-post-cleanup-verification.md`
- `js/i18n.js`
- `data/i18n/ui/nb.json`
- `data/i18n/ui/en.json`
- `data/i18n/ui/es.json`
- `data/i18n/ui/pt.json`
- `data/i18n/content/**`
- `data/places/**`
- `data/people/**`
- `data/quiz/**`
- `data/stories/**`
- `data/natur/**` (`data/nature/**` finnes ikke)
- `data/Civication/**` (`data/civication/**` finnes ikke; Civication-data ligger med stor C)
- `data/wonderkammer/**`
- Andre åpenbare content-kataloger under `data/**`: `data/routes/**`, `data/badges/**`, `data/quizcards/**`, `data/lesespor/**`, `data/tags.json`, `data/registerknagger.json`, `data/routes.json`, `data/routes_walks.json`, `data/places_baseskjema.json`, `data/people_baseskjema.json`.

## Existing i18n architecture

- UI dictionaries ligger i `data/i18n/ui/<lang>.json`. `js/i18n.js` laster UI JSON via `loadJson(lang)` fra `data/i18n/ui/${lang}.json`.
- Content translation loader finnes, men er smal: `loadContentJson(type, lang)` henter `data/i18n/content/<type>/<lang>.json`.
- Eksisterende content-type i runtime er `places`: `loadPlaceTranslations(lang)` kaller `loadContentJson("places", normalized)` for språk ulik fallback `nb`.
- Fallback-mønsteret for places er norsk canonical data: hvis språk er `nb`, eller contentfil mangler, returneres `{}` og original place-data brukes.
- `localizePlace(place)` oversetter bare `name`, `desc`, `popupDesc` og `popupdesc` via id-mapping i `currentPlaceDict`.
- Ingen tilsvarende runtime-støtte ble funnet for people, quiz, stories, natur, Civication, Wonderkammer, badges, routes eller tags.
- `data/i18n/content/places/` finnes med `en.json`, `es.json` og `pt.json`; det finnes ingen `nb.json` der fordi norske canonical place-data fungerer som fallback/source-of-truth.

## Content area inventory

| Area | Path(s) | Current language structure | User-facing fields | Existing translation support | Risk | Notes |
|---|---|---|---|---|---|---|
| Places | `data/places/**`, `data/places_*.json` | Canonical data ser primært norsk ut, med portugisiske stedsnavn i Lisboa-data og noen allerede oversatte id-mapper i `data/i18n/content/places/{en,es,pt}.json`. | `name`, `desc`, `popupDesc`, `title`, `summary`, `learning`, `trivia`, `category`, observasjons-/badge-tekster. | Ja, bare for `name`, `desc`, `popupDesc`/`popupdesc` via `data/i18n/content/places/<lang>.json`. | Høy | Mest synlig innhold i kort, kart, søk og popup. Place-substrukturer utover de fire feltene kan fortsatt være norsk-only. |
| People | `data/people/**`, `data/people_baseskjema.json` | Ser monolingual norsk ut; ingen `data/i18n/content/people/`. | `name`, `title`, `summary`, `description`, `bio`/biografi-lignende felt, `role`, `category`, merknader. | Nei | Middels | Personnavn skal ofte beholdes, men rolle/biografi/etiketter trenger oversettelser. |
| Quiz | `data/quiz/**`, `data/quizcards/**` | Ser monolingual norsk ut; ingen språkmapper eller content-i18n lookup. | `title`, `question`, `answers`, `explanation`, `hint`, `prompt`, `label`, `summary`. | Nei | Høy | Quiz er kjerneinnhold og vil oppleves som UI-feil hvis spørsmål/svar står på norsk etter språkvalg. |
| Routes / NextUp content | `data/routes/**`, `data/routes.json`, `data/routes_walks.json`, route-/nextup-lignende felt i place/story-data | Ser monolingual norsk ut; UI-fragmenter i NextUp er i18n, men datadrevne titler/summary er content. | `title`, `name`, `summary`, `description`, `intro`, `outro`, `learning`, `theme`, `category`. | Nei, bortsett fra indirekte place-lokalisering når NextUp viser place-felt som er støttet. | Høy | Ofte synlig anbefalings-/ruteinnhold bør skilles fra ferdig UI-i18n. |
| Stories | `data/stories/**` | Ser i hovedsak norsk-only ut, men Lisboa-stedsnavn/personnavn og fremmedspråklige egennavn forekommer. Ingen `nb/en/es/pt` struktur. | `title`, `summary`, `story`, `body`, `text`, `intro`, `outro`, `description`, `label`. | Nei | Middels/høy | Stort volum; bør planlegges etter kortere kjerneflater. |
| Nature | `data/natur/**`, naturfiler under `data/places/natur/**` | Norsk canonical struktur; ingen `data/nature/**` og ingen egen content-i18n for natur. | `name`, `title`, `summary`, `description`, `learning`, `trivia`, species-/korttekst. | Nei, unntatt natur-places som kan få place-feltene via `places`-oversettelser. | Middels | `data/natur` og `data/places/natur` bør behandles separat: arts-/emnedata vs. stedskort. |
| Wonderkammer | `data/wonderkammer/**` | Monolingual norsk i titler/beskrivelser; ingen språkfelt funnet som arkitektur. | `title`, `description`, `summary`, `prompt`, `content`, `label`, aktivitets-/objekttekster. | Nei | Middels | Modulnavn kan beholdes, men kammer-/objekt-/oppgavetekster er content. |
| Civication | `data/Civication/**` | Stort norsk content-korpus med mail, roller, livshistorier, narrativer, konflikter og modeller; ingen content-i18n lookup. | `title`, `name`, `label`, `description`, `body`, `text`, `dialog`, `story`, `intro`, `outro`, mail subject/body, rolleforklaringer. | Nei | Høy, men bør migreres sent | Svært stort og komplekst volum; bør ha egen plan før oversettelse. |
| Badges / merits | `data/badges/**`, badge-/meritfelt i `data/Civication/**` og place/quiz-data | Ser norsk-only ut; ofte data, ikke UI. | `name`, `title`, `label`, `description`, `badge`, kriterietekster. | Nei | Middels | Synlig i profil/progresjon og bør prioriteres etter places/quiz. |
| Categories / tags / themes | `data/tags.json`, `data/registerknagger.json`, `data/knagger/**`-lignende filer, `category`/`theme` i content | Blandede tekniske id-er og brukerrettede etiketter; hovedsakelig norsk. | `label`, `name`, `title`, `description`, `category`, `theme`. | Nei | Middels/lav | Tekniske id-er må ikke oversettes; bare visningsetiketter. |
| Lesespor / articles | `data/lesespor/**` | Norsk content og eksterne artikkeltitler; ingen i18n-struktur. | `title`, `description`, `summary`, `name`. | Nei | Lav/middels | Eksterne publiserte titler kan være sitater/kildenavn og bør vurderes manuelt. |

## Monolingual Norwegian content

| Area | Example path | Example fields | Suggested target structure | Priority |
|---|---|---|---|---|
| Places canonical data | `data/places/natur/oslo/places_oslo_natur_akerselvarute.json` | `name`, `desc`, `popupDesc`, `title`, `summary`, `learning`, `trivia` | Fortsett med `data/i18n/content/places/<lang>.json` id-mapping; utvid eventuelt feltscope etter audit. | 1 |
| Quiz | `data/quiz/quiz_natur.json` | `title`, `question`, `answers`, `explanation`, `hint` | `data/i18n/content/quiz/<lang>.json` med `quizSetId`/question-id mappings. | 1 |
| Routes / NextUp content | `data/routes.json`, `data/routes_walks.json`, `data/routes/historical/routes_historical_oslo.json` | `title`, `summary`, `description`, `intro`, `outro` | `data/i18n/content/routes/<lang>.json` med `routeId` mappings. | 1 |
| Badges / merits | `data/badges/index.json`, `data/badges/natur.json` | `name`, `title`, `description`, kriterier | `data/i18n/content/badges/<lang>.json` med `badgeId` mappings. | 2 |
| People | `data/people/people_litteratur.json` | `name`, `title`, `summary`, `description` | `data/i18n/content/people/<lang>.json` med `personId` mappings. | 2 |
| Nature cards/species | `data/natur/Insekter.json`, `data/natur/fauna/**`, `data/natur/flora/**` | `name`, `title`, `summary`, `description`, `learning`, `trivia` | `data/i18n/content/nature/<lang>.json` med species/card ids. | 2 |
| Stories | `data/stories/stories_*.json` | `title`, `summary`, `story`, `body`, `text`, `intro`, `outro` | `data/i18n/content/stories/<lang>.json` med `storyId` mappings. | 3 |
| Wonderkammer | `data/wonderkammer/*.json` | `title`, `description`, `prompt`, `content` | `data/i18n/content/wonderkammer/<lang>.json` med object/chamber ids. | 3 |
| Civication | `data/Civication/jobbmails/**`, `data/Civication/lifestory/**`, `data/Civication/roles/**` | mail subject/body, `title`, `description`, `dialog`, `story` | Egen plan: `data/i18n/content/civication/<lang>.json` eller moduldelte mapper. | 3 |
| Categories/tags/themes | `data/tags.json`, `data/registerknagger.json` | `label`, `name`, `description`, `theme` | `data/i18n/content/taxonomy/<lang>.json` med tag/category ids. | 4 |

## Existing multilingual or partially multilingual content

| Area | Path | Languages found | Notes |
|---|---|---|---|
| UI dictionaries | `data/i18n/ui/{nb,en,es,pt}.json` | `nb`, `en`, `es`, `pt` | Ferdig UI-i18n; ikke content-scope for endring. |
| Place content translations | `data/i18n/content/places/en.json` | `en` | Runtime loader støtter denne typen. |
| Place content translations | `data/i18n/content/places/es.json` | `es` | Runtime loader støtter denne typen. |
| Place content translations | `data/i18n/content/places/pt.json` | `pt` | Runtime loader støtter denne typen. |
| Canonical place content | `data/places/**` | `nb` fallback/source, med mange portugisiske egennavn i Lisboa-data | Ikke strukturert som `nb` språkfil; originaldata er fallback. |
| Lisboa content | `data/places/**/portugal/lisbon/**`, `data/stories/stories_lisbon_*.json` | Blandet: norsk forklaringstekst + portugisiske navn/termer | Egennavn/termer er ikke nødvendigvis oversettelsesfeil, men må sjekkes manuelt. |

## Spanish/Portuguese risk check

- Det finnes spansk UI og place-contentfil (`data/i18n/content/places/es.json`) samt portugisisk UI og place-contentfil (`data/i18n/content/places/pt.json`). Denne batchen endret ikke tekstene.
- Søket etter `Español`, `spansk`, `Spanish`, `Português`, `portugisisk`, `Portuguese` fant språkvelgertekst i HTML og mange forekomster i Lisboa-/Portugal-relatert content. Det er forventet at portugisiske egennavn og fagord forekommer i norsk canonical content.
- Risiko: `es.json` og `pt.json` bør manuelt QA-leses for falske venner, spansk/portugisisk sammenblanding og gamle `es`-spor. Særlig Lisboa-steder med portugisiske navn kan gjøre automatisk språkdeteksjon lite pålitelig.
- Ingen tekst bør rettes i denne batchen; anbefalt oppfølging er manuell språkkontroll per contentfil og stikkprøver av rendered place cards.

## Recommended migration model

Anbefalt modell:

- Behold canonical norske datafiler som source-of-truth.
- Legg oversettelser i `data/i18n/content/<type>/<lang>.json`.
- Bruk id-baserte mappings:
  - `placeId`
  - `personId`
  - `quizSetId` + question-id eller stabil question key
  - `routeId`
  - `badgeId`
  - `storyId`
  - `tagId`/`categoryId`/`themeId`
- Ikke dupliser hele store datasett hvis bare tekstfelter må oversettes.
- Ikke oversett tekniske felt som `id`, `placeId`, `personId`, `slug`, `type`, `categoryId`, koordinater, kilder, bilder, ikoner, farger, versjon og timestamps.
- Fallback til norsk hvis oversettelse mangler, slik place-loaderen allerede gjør.
- Utvid eksisterende places-mønster før nye typer: det gir lavest risiko fordi `js/i18n.js` allerede har content-loader, fallback og patching for places.

## Recommended next batches

1. Content i18n batch 2 — places translation architecture audit/fix.
2. Content i18n batch 3 — translate top visible places to en/es/pt.
3. Content i18n batch 4 — quiz content translation architecture.
4. Content i18n batch 5 — people/nature/badges translation architecture.
5. Content i18n batch 6 — Civication/story/Wonderkammer translation plan.

Prioritetssystem for videre arbeid:

- Prioritet 1 — synlig kjerneinnhold:
  - place card titles/summaries/descriptions
  - quiz questions/answers/explanations
  - route/NextUp content hvis det vises ofte
- Prioritet 2 — profil/progresjon/content:
  - badges/merker som er data, ikke UI
  - people labels/biografier
  - nature cards/species text
- Prioritet 3 — større fortellinger:
  - stories
  - Wonderkammer
  - Civication mail/fortellinger/dialoger
- Prioritet 4 — metadata/kategorier:
  - tags
  - themes
  - category labels
  - internal labels hvis de vises til bruker

## Validation

Kommandoer/søk kjørt:

```sh
find data -maxdepth 4 -type f | sort
```

```sh
rg -n '"(title|name|label|description|summary|body|text|question|answers|explanation|hint|prompt|content|dialog|story|intro|outro|learning|trivia|badge|category|theme)"\s*:' data
```

```sh
rg -n '"(nb|en|es|pt)"\s*:' data
```

```sh
rg -n 'data/i18n/content|loadContentJson|loadPlaceTranslations|translatePlace|placeTranslations' js data
```

```sh
rg -n 'Español|spansk|Spanish|Português|portugisisk|Portuguese' data js *.html
```

```sh
find data -maxdepth 2 -type d | sort
```

```sh
find data/i18n/content -maxdepth 3 -type f | sort
```

```sh
python3 - <<'PY'
import os,json
for d in ['places','people','quiz','stories','nature','natur','Civication','wonderkammer','routes','badges']:
 p='data/'+d
 if os.path.exists(p):
  files=[os.path.join(r,f) for r,_,fs in os.walk(p) for f in fs if f.endswith(('.json','.md'))]
  print(d, len(files), files[:8])
print('content dirs', os.listdir('data/i18n/content'))
PY
```

```sh
git diff --check
```

## Final note

No runtime files changed. No dictionaries changed. No content data changed.
