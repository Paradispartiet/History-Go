# UI i18n batch 7 audit: main app runtime hardcoded strings

## Kort status

Audit-only gjennomgang av hovedappen/kart-runtime utenfor profilsiden. `js/i18n.js` er lest for mekanikk: UI-dictionary lastes fra `data/i18n/ui/{lang}.json`, `HG_I18N.t(key, fallback)` finnes, og MutationObserver/static fallback kan oversette leaf-tekst og attributtene `aria-label`, `title`, `placeholder` og `alt` når teksten matcher eksisterende fallback-dictionary.

Scope for denne rapporten:

- Ingen runtime-, data-, CSS- eller HTML-filer er endret.
- Ingen dictionary keys er lagt til.
- Ingen renderere er koblet om.
- Denne PR-en inneholder kun audit-rapporten `reports/i18n-main-runtime-audit.md`.

## Filer undersøkt

Primært undersøkt:

- `index.html`
- `js/app.js`
- `js/i18n.js`
- `data/i18n/ui/nb.json`
- `data/i18n/ui/en.json`
- `data/i18n/ui/pt.json`
- `js/ui/place-card.js`
- `js/quizzes.js`
- `js/ui/search.js`
- `js/ui/lists.js`
- `js/ui/left-panel.js`
- `js/map.js`
- `js/navRoutes.js`
- `js/routes.js`
- `js/ui/toast.js`
- `js/ui/popup-utils.js`
- `js/ui/nature-card.js`
- `js/ui/wonderkammer-entry.js`
- `js/ui/person-place-unlock-toast.js`
- `js/ui/nature-unlock-toast.js`
- `js/ui/badge-unlock-toast.js`
- `js/ui/badge-modal.js`
- `js/ui/mini-profile.js`
- `js/ui/geo-indicator.js`
- `js/ui/interactions.js`
- `js/ui/events.js`
- `js/hg_unlocks.js`

`js/app.js`, `js/hg_unlocks.js`, `js/ui/toast.js`, `js/ui/geo-indicator.js` har få/ingen nye UI-tekstfunn utover wrappers/ikoner og eksisterende `ui.toast.closeMessage`.

## Kategorier brukt

- **A — finnes passende key allerede**: kan kobles til eksisterende `data/i18n/ui/*.json`-key senere.
- **B — mangler dictionary key**: statisk UI-tekst som bør få ny key i Batch 8.
- **C — trenger sentence-format key**: dynamisk setning med variabler/telling/avstand/status.
- **D — innholdsdata / skal ikke runtime-oversettes som UI**: navn, beskrivelser, quizspørsmål/svar, story/person/place/nature-data, category IDs osv.

---

## Funn delt etter fil

### `index.html`

| Tekst | Kategori | Eksisterende nøkkel / foreslått handling | Kommentar |
|---|---:|---|---|
| `Kart` (`#map` aria-label) | A | Bruk `ui.attr.map` | Attributt kan fanges av static attr fallback hvis teksten matcher. |
| `Language` / `Språk` (`#languageSelect`) | A | Bruk `ui.attr.language` / `ui.language.label` | Verdiene finnes, men språklabel er inkonsistent NB (`Language` i `ui.attr.language`). |
| `Norsk`, `English`, `Português` | D | Ikke UI-i18n | Språknavn bør normalt være autonymer, ikke oversettes dynamisk. |
| `Profil` | B | Ny key, f.eks. `ui.attr.profile` | `ui.profile.pill` finnes, men er profilside-tekst; bedre egen attr-key for headerlenke. |
| `Utforsker #182` | A | Bruk `ui.profile.defaultExplorer` | Eksisterende key passer for fallback-navn. |
| `Merker` | A | Bruk `ui.tabs.badges` eller ny attr-spesifikk key | For aria-label på badge-count kan `ui.tabs.badges` gjenbrukes, men attr-key er ryddigere. |
| `0 steder` | C | Trenger sentence key, f.eks. `ui.profile.placesCount` | Count-format; eksisterende statiske keys dekker ikke plural. |
| `0 quizzer` | C | Trenger sentence key, f.eks. `ui.profile.quizCount` | Count-format/plural. |
| `Civication` | D | Ikke UI-i18n | Produkt-/modulnavn. |
| `Lesespor` | B | Ny key, f.eks. `ui.nav.readingTracks` | Brukes som aria/title for ikonknapp. |
| `Se kart` | A | Bruk `ui.map.show` | Allerede `data-i18n="ui.map.show"`. |
| `Kartmodus` | A | Bruk `ui.attr.mapMode` | Finnes i dictionary. |
| `Søk…` | A | Bruk `ui.attr.search` | Placeholder finnes. |
| `Posisjonstatus` | A | Bruk `ui.attr.positionStatus` | Title finnes. |
| `Unlock all` | A | Bruk `ui.attr.unlockAll` | Finnes, men NB-verdi er fortsatt engelsk. |
| `Sentrer` | A | Bruk `ui.attr.center` | Title finnes. |
| `Lukk kart` | A | Bruk `ui.attr.closeMap` | Title/aria finnes. |
| `Utforsk` | A | Bruk `ui.static.explore` | Venstrepaneltittel/tablist-label. |
| `Filter` | A | Bruk `ui.attr.filter` | Aria-label finnes. |
| `Steder`, `Folk`, `Natur`, `Ruter`, `Merker` | A | Bruk `ui.tabs.*` | Knappene har delvis `data-i18n`, men select-option `Nærmeste` mangler `data-i18n`. |
| `Velg visning` | A | Bruk `ui.attr.chooseView` | Aria-label finnes. |
| `Nærmeste` | A | Bruk `ui.static.nearest` | Select-option mangler `data-i18n`. |
| `Henter posisjon…` | A | Bruk `ui.position.loading` | Allerede `data-i18n`. |
| `Minimer` | B | Ny key, f.eks. `ui.attr.minimize` | Mangler key. |
| `Vis quizkort` | A | Bruk `ui.attr.showQuizCard` | Aria-label finnes. |
| `Det som skjer her` | A | Bruk `ui.attr.onSite` | Aria-label finnes. |
| `På stedet` | A | Bruk `ui.static.onSite` | Synlig title finnes. |
| `Legg til` | A | Bruk `ui.attr.add` | Aria-label finnes. |
| `Åpne` | A | Bruk `ui.attr.open` | Aria-label finnes. |
| `Mer info`, `Ta quiz`, `Lås opp` | A | Bruk `ui.place.moreInfo`, `ui.place.takeQuiz`, `ui.place.unlock` | Allerede `data-i18n`. |
| `Rute`, `Observer`, `Notat` | A | Bruk `ui.place.route`, `ui.place.observe`, `ui.place.note` | Aria-labels finnes som place keys. |
| `Merke` image alt | A | Bruk `ui.attr.badge` | Modal image alt. |
| `Lukk` close button | A | Bruk `ui.quiz.close` eller ny generic `ui.attr.close` | `ui.quiz.close` finnes, men generic close-key mangler. |

### `js/ui/place-card.js`

| Tekst | Kategori | Eksisterende nøkkel / foreslått handling | Kommentar |
|---|---:|---|---|
| `Vis frontbilde` | B | Ny key, f.eks. `ui.place.showFrontImage` | Quiz-card flip aria. |
| `Vis quizkort` | A | Bruk `ui.attr.showQuizCard` | Finnes. |
| `Quizkort mangler` | B | Ny key, f.eks. `ui.place.quizCardMissing` | Aria/status når quizkort mangler. |
| `Quizkort for ${placeName}` | C | Trenger sentence key, f.eks. `ui.place.quizCardFor` | Alt-tekst med place name. |
| `stedet` | B | Ny fallback noun, f.eks. `ui.place.fallbackPlace` | Del av sentence fallback. |
| `quiz fullført` / `quiz ikke tatt` | B | Nye keys, f.eks. `ui.nextwhy.quizCompleted` / `ui.nextwhy.quizNotTaken` | Bygger NextUp-why tekst. |
| `låst opp` / `ikke låst opp` | A/B | Bruk `ui.unlock.unlocked`; ny key for negative form | `ui.unlock.unlocked` finnes; `ikke låst opp` mangler. |
| `${persons.length} personer her` | C | Trenger sentence key, f.eks. `ui.place.peopleHereCount` | Count/plural. |
| `RELASJON` | B | Ny key, f.eks. `ui.place.relationFallback` | Label-chip fallback. |
| `På stedet` / `Legg til` | A | Bruk `ui.static.onSite` / `ui.attr.add` | Events box bygges dynamisk og bør bruke `tt`. |
| `Avtal å møtes` | B | Ny key, f.eks. `ui.events.meetup` | Social action. |
| `Start meldingsspill` | B | Ny key, f.eks. `ui.events.messageGame` | Social action. |
| `Ta quiz sammen` | B | Ny key, f.eks. `ui.events.groupQuiz` | Social action; ikke samme som `ui.place.takeQuiz`. |
| `${peopleCount} her · ${friendsCount} venner` | C | Trenger sentence key, f.eks. `ui.events.peopleFriendsHere` | To tellere i samme streng. |
| `${canonicalForPlace.length} ting skjer her` | C | Trenger sentence key, f.eks. `ui.events.countHere` | Count/plural. |
| `Ingen hendelser` | B | Ny key, f.eks. `ui.events.none` | Empty/status. |
| `Her nå`, `Personer:`, `Venner:`, `Skjer her`, `Sosialt` | B | Nye keys under `ui.events.*` | Popup-headings/labels. |
| `Ingen kanoniserte hendelser lagt til ennå.` | B | Ny key, f.eks. `ui.events.noCanonicalYet` | Empty state. |
| `Åpne leksikon` | B | Ny key, f.eks. `ui.place.openLexicon` | Place-card leksikon action. |
| `Quiz-modul ikke lastet` | B | Ny key, f.eks. `ui.quiz.moduleNotLoaded` | Toast. |
| `Rutevalg` | B | Ny key, f.eks. `ui.routes.menuLabel` | Aria-label. |
| `Gå Hit` | B | Ny key, f.eks. `ui.routes.goHere` | Button text. |
| `Ruter` | A | Bruk `ui.tabs.routes` | Route menu/tab. |
| `Rute-funksjon ikke lastet` | B | Ny key, f.eks. `ui.routes.notLoaded` | Toast appears in several modules. |
| `Ruter vises i utforsk-panelet` | B | Ny key, f.eks. `ui.routes.shownInExplorePanel` | Toast. |
| `Observasjoner er ikke lastet` | B | Ny key, f.eks. `ui.observations.notLoaded` | Toast. |
| `Allerede låst opp` | B | Ny key, f.eks. `ui.unlock.alreadyUnlocked` | Toast. |
| `Lås opp (test)` | C | Sentence/status key, e.g. `ui.unlock.lockedTest` | Runtime test-mode suffix. |
| `Gå nærmere: ${left} m` | C | Trenger sentence key, f.eks. `ui.unlock.goCloserMeters` | Existing `ui.unlock.goCloser` can be component, but sentence needs format. |

### `js/quizzes.js`

| Tekst | Kategori | Eksisterende nøkkel / foreslått handling | Kommentar |
|---|---:|---|---|
| `Quiz` | D/B | Mostly D as title fallback; optionally `ui.quiz.title` | Actual quiz title often target/place/person data. |
| `Lukk` | A | Bruk `ui.quiz.close` | Close buttons. |
| `Neste` | B | Ny key, f.eks. `ui.quiz.next` | Summary primary fallback. |
| `✔️ Tatt (kan gjentas)` | B | Ny key, f.eks. `ui.quiz.takenRepeatable` | Legacy button state. |
| `Riktig ✅` / `Feil ❌` | B | Nye keys, f.eks. `ui.quiz.correct` / `ui.quiz.wrong` | Feedback UI. |
| `Fant verken person eller sted` | B | Ny key, f.eks. `ui.quiz.targetMissing` | Toast. |
| `Du må trykke Lås opp før du kan ta denne quizen.` | A | Bruk `ui.quiz.unlockFirstPlace` | Allerede via `tt`. |
| `Du må trykke Lås opp på et av personens steder før du kan ta denne quizen.` | A | Bruk `ui.quiz.unlockFirstPersonPlace` | Allerede via `tt`. |
| `Kunne ikke laste quiz-set` | B | Ny key, f.eks. `ui.quiz.setLoadFailed` | Toast. |
| `Set-data feilformatert` | B | Ny key, f.eks. `ui.quiz.setMalformed` | Toast. |
| `Sett ${setIndex + 1}/${totalSets}` | C | Trenger sentence key, f.eks. `ui.quiz.setIndexOfTotal` | Reused in suffix/toasts. |
| `Dette settet er allerede tatt • ${remainingBefore} sett mangler fortsatt` | C | Trenger sentence key | Compound status with count. |
| `Alle sett er allerede fullført` | B | Ny key, f.eks. `ui.quiz.allSetsAlreadyCompleted` | Static status. |
| `${remainingAfterThis} sett igjen etter dette • +1 poeng` | C | Trenger sentence key | Count + reward. |
| `Siste sett • +1 poeng` | B | Ny key, f.eks. `ui.quiz.lastSetPlusPoint` | Static status. |
| `Sett ${n}/${total} fullført: ${correct}/${total}` | C | Trenger sentence key | Score/status toast. |
| `+1 poeng` | A | Kan bruke `ui.badge.progressPoints` med `{points}` eller ny `ui.quiz.plusPoints` | Existing key lacks plus sign. |
| `allerede fullført tidligere` | B | Ny key, f.eks. `ui.quiz.alreadyCompletedEarlier` | Toast fragment. |
| `mangler kategori – ingen poeng` | B | Ny key, f.eks. `ui.quiz.missingCategoryNoPoints` | Toast fragment. |
| `${remainingSets} sett gjenstår` | C | Trenger sentence key | Count/plural. |
| `alle sett fullført` | B | Ny key, f.eks. `ui.quiz.allSetsCompleted` | Toast fragment. |
| `Score: ${correct}/${total}` | C | Trenger sentence key | Summary meta. |
| `Ingen nye poeng – dette settet var allerede fullført.` | B | Ny key | Summary reward. |
| `Ingen nye poeng.` | B | Ny key | Summary reward. |
| `Ingen poeng – mangler kategori på settet.` | B | Ny key | Summary reward. |
| `Alle sett for dette stedet er fullført.` | B | Ny key | Summary line. |
| `Sett ${n} av ${total} fullført` | C | Trenger sentence key | Summary lead. |
| `Neste sett` / `Ferdig` | B | Nye keys, f.eks. `ui.quiz.nextSet`, `ui.quiz.done` | Summary buttons. |
| `Ingen quiz tilgjengelig her ennå` | B | Ny key, f.eks. `ui.quiz.noneHereYet` | Toast. |
| `Perfekt, men mangler kategori på quiz-data (ingen poeng gitt).` | B | Ny key | Toast. |
| `Perfekt! ${total}/${total} 🎯` | C | Trenger sentence key | Score toast. |
| `Fullført: ${correct}/${total} – prøv igjen for full score.` | C | Trenger sentence key | Score toast. |
| `Quiz-feil: noe krasjet i quizzes.js` | B | Ny key, f.eks. `ui.quiz.runtimeError` | User-facing toast; avoid filename in localized UI. |
| Quiz questions/options/trivia/concepts | D | Ikke UI-i18n i runtime | Loaded from quiz/content data; should remain content translation concern. |

### `js/ui/search.js`

| Tekst | Kategori | Eksisterende nøkkel / foreslått handling | Kommentar |
|---|---:|---|---|
| `Ingen treff på «${query}»` | C | Trenger sentence key, f.eks. `ui.search.noResultsFor` | Query interpolation. |
| `Sted` / `Person` / `Kategori` | B | Nye keys, f.eks. `ui.search.placeFallback`, `ui.search.personFallback`, `ui.search.category` | Metadata fallback/label. |
| `Steder` / `Personer` / `Kategorier` | A/B | `Steder` kan bruke `ui.tabs.places`; `Personer`/`Kategorier` trenger nye keys or careful reuse | Existing `ui.profile.people` = `Personer`, but not search-specific. |
| Place/person/category names, years, category IDs | D | Ikke UI-runtime oversettelse | Data/content fields. |

### `js/ui/lists.js`

| Tekst | Kategori | Eksisterende nøkkel / foreslått handling | Kommentar |
|---|---:|---|---|
| `Ingen treff` | B | Ny key, f.eks. `ui.empty.noMatches` | Generic empty title. |
| `Ingen ${noun} passer med badgefilteret ${label}. Trykk badgeknappen for å velge et annet badge eller alle.` | C | Trenger sentence key | Noun + badge label interpolation. |
| `${place._d} m`, `${Math.round(dist)} m`, `${_d} m` | C | Trenger distance-format key/helper | Distance unit formatting. |
| `Ny` | B | Ny key, f.eks. `ui.place.new` | Fresh place marker. |
| `Folk lastes inn` | B | Ny key, f.eks. `ui.people.loading` | Empty/loading title. |
| `Personene som hører til Oslo lastes nå.` | B | Ny key, f.eks. `ui.people.loadingText` | Static loading text. |
| `Natur lastes inn` | B | Ny key, f.eks. `ui.nature.loading` | Empty/loading title. |
| `Gi det et øyeblikk — flora og fauna for Oslo lastes i bakgrunnen.` | B | Ny key, f.eks. `ui.nature.loadingText` | Static loading text. |
| `Ingen arter samlet ennå` | B | Ny key, f.eks. `ui.nature.noneCollectedTitle` | Empty title. |
| `Ta en quiz på et naturrikt sted ...` | B | Ny key, f.eks. `ui.nature.noneCollectedText` | Empty help text. |
| `Vis steder` | B/A | New `ui.nature.showPlaces` or reuse `ui.tabs.places` with verb key | Button is action, not tab label. |
| `naturfunn`, `personer` noun arguments | B/C | Use noun keys or separate sentence variants | Avoid passing localized nouns manually. |
| Place/person/nature names, latin names, categories | D | Ikke UI-runtime oversettelse | Content/data. |

### `js/ui/left-panel.js`

| Tekst | Kategori | Eksisterende nøkkel / foreslått handling | Kommentar |
|---|---:|---|---|
| `${count} merke/merker samlet` | C | Trenger sentence/plural key, f.eks. `ui.badges.collectedCount` | Count/plural. |
| `Ingen kategorier lastet.` | B | Ny key, f.eks. `ui.badges.noCategoriesLoaded` | Empty status. |
| `Ingen merker` | B | Ny key, f.eks. `ui.badges.none` | Empty title. |
| `Badgefilteret skjuler alle merker akkurat nå. Trykk badgeknappen for å vise alle.` | B | Ny key, f.eks. `ui.badges.filterHidesAll` | Empty help text. |
| `Badgefilter` / `Badgefilter: alle` / `Badgefilter: ${cat.name}` | B/C | New static + sentence keys | Dynamic category name should remain data. |
| `Sortering: avstand` / `Sortering: Avstand` / `Eldst` / `Nyest` | B | New keys under `ui.sort.*` | Aria/title. |
| `Natur-filter: ${window.HG_NATURE_FILTER}` | C/D | Sentence key only if UI exposes raw modes; raw mode IDs are D | Better map mode IDs to UI labels later. |
| `Filter: ${window.HG_NEARBY_FILTER}` | C/D | Sentence key only if UI exposes raw modes; raw mode IDs are D | Filter IDs should not be translated as content. |
| Category names from `CATEGORY_LIST` | D | Ikke UI-runtime oversettelse | Category data/content. |

### `js/map.js`

| Tekst | Kategori | Eksisterende nøkkel / foreslått handling | Kommentar |
|---|---:|---|---|
| `Kart` | A | Bruk `ui.attr.map` | Map style toggle standard label. |
| `Detaljert` | B | Ny key, f.eks. `ui.map.detailed` | Satellite/detail style toggle. |

### `js/navRoutes.js` og `js/routes.js`

| Tekst | Kategori | Eksisterende nøkkel / foreslått handling | Kommentar |
|---|---:|---|---|
| `Kart ikke klart ennå.` | B | Ny key, f.eks. `ui.routes.mapNotReady` | Toast. |
| `Fant ingen posisjon ennå.` / `Fant ikke posisjon ennå.` | B | Ny key, f.eks. `ui.position.notFoundYet` | Two variants should converge. |
| `Sted mangler koordinater.` | B | Ny key, f.eks. `ui.routes.placeMissingCoordinates` | Toast. |
| `Beregner gangrute…` | B | Ny key, f.eks. `ui.routes.calculatingWalkingRoute` | Toast. |
| `Gangrute: ${km} km · ca ${min} min` | C | Trenger sentence key, f.eks. `ui.routes.walkingRouteEstimate` | Distance + duration. |
| `Gangrute vist på kartet` | B | Ny key, f.eks. `ui.routes.walkingRouteShown` | Toast. |
| `Fant ingen rute ennå (ORS-feil).` | B | Ny key, f.eks. `ui.routes.noRouteFound` | Toast; consider hiding provider acronym. |
| `${routeName} (${stopCount} stopp)` | C | Trenger sentence key, f.eks. `ui.routes.routeStopsToast` | Route name is D, count is variable. |
| `Ingen ruter lastet fra routes.json.` | B | Ny key, f.eks. `ui.routes.noneLoaded` | Empty/debug-ish UI. |
| `Ingen ruter tilgjengelige enda.` | B | Ny key, f.eks. `ui.routes.noneAvailableYet` | Empty. |
| `Ingen ruter` | B | Ny key, f.eks. `ui.routes.noneTitle` | Empty title. |
| `Ingen ruter har stopp i ${badgeName}. Trykk badgeknappen ...` | C | Trenger sentence key | Badge/category name is data. |
| `Ingen ruter har gyldige stopp i kartdataene.` | B | Ny key, f.eks. `ui.routes.noValidStops` | Empty. |
| `Rute` | A | Bruk `ui.place.route` or new `ui.routes.fallbackRoute` | Fallback route name. |
| `Rute-funksjon ikke lastet` | B | Ny shared key `ui.routes.notLoaded` | Appears multiple places. |
| Route names/titles/stops | D | Ikke UI-runtime oversettelse | Route content/data translation concern. |

### `js/ui/popup-utils.js`

| Tekst | Kategori | Eksisterende nøkkel / foreslått handling | Kommentar |
|---|---:|---|---|
| `Ingen innhold ennå.` | B | Ny key, f.eks. `ui.popup.noContentYet` | Generic popup fallback. |
| `Wonderkammer-handler ikke lastet` | B | Ny key, f.eks. `ui.wonderkammer.notLoaded` | Toast. |
| `Civication Store-handler ikke lastet` | B/D | Product name D + key for handler-not-loaded sentence | Toast. |
| `Rute-funksjon ikke lastet` | B | Use shared `ui.routes.notLoaded` | Toast. |
| `Brand-popup ikke lastet` / `Fant ikke brand` | B/D | Product/domain term may remain; key toast text | Toast. |
| `Lukk popup` | B | Ny key, f.eks. `ui.popup.close` | Aria-label. |
| `Ta quiz igjen · ${completed}/${total} sett` | C | Trenger sentence key | Dynamic quiz button. |
| `Fortsett quiz · ${completed}/${total} sett` | C | Trenger sentence key | Dynamic quiz button. |
| `Ta quiz · ${total} sett` | C | Trenger sentence key | Dynamic quiz button. |
| `Ta quiz igjen` | B | Ny key, f.eks. `ui.quiz.takeAgain` | Static button. |
| `Ingen observasjoner ennå.` | B | Ny key, f.eks. `ui.observations.noneYet` | Empty. |
| `Ingen beskrivelse ennå.` | B | Ny key, f.eks. `ui.popup.noDescriptionYet` | Fallback. |
| `Lukk` / `Fortsett` | A/B | `Lukk` can use `ui.quiz.close`; `Fortsett` needs key | Generic popup buttons. |
| `Ingen steder registrert ennå.` | B | Ny key, f.eks. `ui.popup.noPlacesRegisteredYet` | Empty. |
| `Ingen relaterte brands funnet ennå.` | B/D | Key sentence; brand term may remain. | Empty. |
| `Ingen registrerte verk.` | B | Ny key | Person popup. |
| `Ingen stedstilknytning.` | B | Ny key | Person popup. |
| `Observasjoner`, `Kunnskap` | A/B | `Kunnskap` can use `ui.knowledge.knowledge`; `Observasjoner` needs key | Section headings. |
| `Ingen kunnskap registrert ennå.` | B | Ny key, f.eks. `ui.knowledge.noneRegisteredYet` | Empty. |
| `Ingen funfacts ennå.` | B | Ny key, f.eks. `ui.trivia.noneYet` | Empty. |
| `Ingen Wonderkammer-koblinger ennå.` | B | Ny key | Empty. |
| Place/person/story titles/descriptions/facts/relations | D | Ikke UI-runtime oversettelse | Content fields. |

### `js/ui/nature-card.js`

| Tekst | Kategori | Eksisterende nøkkel / foreslått handling | Kommentar |
|---|---:|---|---|
| `Lukk` aria | A | Use `ui.quiz.close` or new generic close | Modal close. |
| `Familie: ${family}` | C/D | Trenger sentence key; family value is data | Label + taxonomy data. |
| `✔ Låst opp — du har samlet denne.` | B | Ny key, f.eks. `ui.nature.unlockedHint` | Static hint. |
| `🔒 Ikke samlet ennå. Ta en quiz på riktig sted.` | B | Ny key, f.eks. `ui.nature.lockedHint` | Static hint. |
| `Kjennetegn`, `Habitat`, `Fenologi`, `Økologi`, `I byen`, `Observasjonstips` | B/D | If these are chrome labels, add `ui.nature.section.*`; data section names otherwise D | These are renderer headings, not loaded values. |
| `Biotop`, `Jord`, `Lys`, `Fukt`, `Aktiv`, `Blomstring`, `Strategi`, `Rolle`, `Samspill`, `Typiske steder`, `Observert typisk` | B/D | Same as above; likely new nature field-label keys | Field labels. |
| `Her samlet du den` / `Hvor du kan finne den` | B | Nye keys under `ui.nature.*` | Conditional heading. |
| `Leter etter steder …` | B | Ny key, f.eks. `ui.nature.findingPlaces` | Loading text. |
| `Ingen steder koblet til denne arten ennå.` | B | Ny key, f.eks. `ui.nature.noLinkedPlacesYet` | Empty. |
| `${distance} m` | C | Distance-format key/helper | Dynamic. |
| Nature title/name/latin/taxonomy values | D | Ikke UI-runtime oversettelse | Content/data. |

### `js/ui/wonderkammer-entry.js`

| Tekst | Kategori | Eksisterende nøkkel / foreslått handling | Kommentar |
|---|---:|---|---|
| `Inne i dette nivået` | B | Ny key, f.eks. `ui.wonderkammer.insideThisLevel` | Child list heading. |
| Type labels such as `Utforskingssone`, `Faktisk stedsskatt`, `Typisk kategoriobjekt` | B/D | If renderer labels, add keys; raw types/data remain D | Labels map internal type IDs. |
| Section labels `Se etter`, `Hvorfor det betyr noe`, `Stedsspesifikk detalj`, etc. | B | Add `ui.wonderkammer.section.*` | Renderer chrome. |
| `Skatten`, `Skattetype`, `Grunnlag` | B | Add `ui.wonderkammer.treasure.*` | Renderer chrome. |
| `← Tilbake til ${parentTitle || "forrige nivå"}` | C | Trenger sentence key | Parent title is content data; fallback `forrige nivå` needs key. |
| `Hva kan man gjøre her?` | B | Ny key | Section heading. |
| `Alder / nivå` | B | Ny key | Section heading. |
| `Lukk` | A/B | Use existing close or generic popup close | Button. |
| Group titles `Lek`, `Natur`, `Sesong`, `Trening`, `Kunst`, `Gatekunst`, `Arkitektur`, `Kunnskap`, `Utforsking`, `Rolig`, `Annet` | B/D | Add keys if UI grouping chrome; if content taxonomy, treat as D | Shown in Wonderkammer grouping. |
| Wonderkammer entry titles/descriptions/activity text | D | Ikke UI-runtime oversettelse | Content fields. |

### Toast modules: `js/ui/person-place-unlock-toast.js`, `js/ui/nature-unlock-toast.js`, `js/ui/badge-unlock-toast.js`

| Tekst | Kategori | Eksisterende nøkkel / foreslått handling | Kommentar |
|---|---:|---|---|
| `Nytt sted` / `Ny person` | B | Nye keys, f.eks. `ui.unlock.newPlace`, `ui.unlock.newPerson` | Fallback names if event lacks name. |
| `✨ Nytt sted samlet` / `✨ Ny person møtt` | B | Nye keys, f.eks. `ui.unlock.placeCollected`, `ui.unlock.personMet` | Kicker. |
| `Lukk` aria | A | Use close key | Toast close. |
| `✨ Ny art samlet` / `✨ Ny plante samlet` | B | Nye keys under `ui.nature.unlock.*` | Kicker. |
| `+${count} til samlet` | C | Trenger sentence key, f.eks. `ui.nature.moreCollectedCount` | Count. |
| `Nytt nivå` | B | Ny key, f.eks. `ui.badge.newLevel` | Fallback tier label. |
| `🎓 Nytt nivå oppnådd` | B | Ny key, f.eks. `ui.badge.newLevelAchieved` | Kicker. |
| Unlocked object/person/place/category names | D | Ikke UI-runtime oversettelse | Event/content data. |

### `js/ui/interactions.js` og `js/ui/events.js`

| Tekst | Kategori | Eksisterende nøkkel / foreslått handling | Kommentar |
|---|---:|---|---|
| `Du snakker med ${person.name}. ...` prompt | C | Trenger sentence-format keys | Browser prompt UI. |
| `Samtale med ${person.name} lagret 💬` | C | Trenger sentence key | Toast. |
| `Notat om ${person.name}` / `Notat om ${place.name}` | C/D | User note title uses data name; if UI shown, sentence key | Stored user-note title may be user content; avoid forced runtime translation. |
| `Skriv én setning eller tanke du vil ta vare på:` | B | Ny key, f.eks. `ui.notes.promptOneSentence` | Prompt text. |
| `Notat om ${name} lagret 📝` | C | Trenger sentence key | Toast. |
| `Stedsbeskrivelse ikke lastet` | B | Ny key, f.eks. `ui.place.descriptionNotLoaded` | Toast. |
| `Trykk for å lese hele teksten` | B | Ny key, f.eks. `ui.place.readFullTextHint` | Title attr. |
| `Kartmodus` | A | Bruk `ui.attr.mapMode` | Toast/static mode label. |
| `Tilbake til oversikt` | B | Ny key, f.eks. `ui.map.backToOverview` | Toast. |
| `Quiz-modul ikke lastet` | B | Use shared `ui.quiz.moduleNotLoaded` | `js/ui/events.js`. |

---

## Funn delt etter kategori

### A — Tekster som allerede har passende key

Representative eksisterende keys som kan kobles i senere batch:

- `ui.attr.map`: `Kart`
- `ui.attr.language` / `ui.language.label`: language select labels
- `ui.profile.defaultExplorer`: `Utforsker #182`
- `ui.map.show`: `Se kart`
- `ui.attr.mapMode`: `Kartmodus`
- `ui.attr.search`: `Søk…`
- `ui.attr.positionStatus`: `Posisjonstatus`
- `ui.attr.unlockAll`: `Unlock all`
- `ui.attr.center`: `Sentrer`
- `ui.attr.closeMap`: `Lukk kart`
- `ui.static.explore`: `Utforsk`
- `ui.attr.filter`: `Filter`
- `ui.tabs.places`, `ui.tabs.people`, `ui.tabs.nature`, `ui.tabs.routes`, `ui.tabs.badges`
- `ui.static.nearest`: `Nærmeste`
- `ui.position.loading`: `Henter posisjon…`
- `ui.attr.showQuizCard`: `Vis quizkort`
- `ui.attr.onSite` / `ui.static.onSite`: `Det som skjer her` / `På stedet`
- `ui.attr.add`: `Legg til`
- `ui.attr.open`: `Åpne`
- `ui.place.moreInfo`, `ui.place.takeQuiz`, `ui.place.unlock`, `ui.place.route`, `ui.place.observe`, `ui.place.note`
- `ui.quiz.close`: `Lukk`
- `ui.quiz.unlockFirstPlace`, `ui.quiz.unlockFirstPersonPlace`
- `ui.toast.closeMessage`: `Lukk melding`
- `ui.unlock.goCloser`, `ui.unlock.locked`, `ui.unlock.unlocked`
- `ui.knowledge.knowledge`: `Kunnskap`

### B — Tekster som mangler dictionary key

Prioritert Batch 8-kandidater:

- Generic attrs/actions: `ui.attr.profile`, `ui.attr.minimize`, `ui.attr.close`/`ui.popup.close`, `ui.nav.readingTracks`.
- Place card: `ui.place.showFrontImage`, `ui.place.quizCardMissing`, `ui.place.fallbackPlace`, `ui.place.openLexicon`, `ui.place.relationFallback`, `ui.place.descriptionNotLoaded`, `ui.place.readFullTextHint`.
- Events/social: `ui.events.meetup`, `ui.events.messageGame`, `ui.events.groupQuiz`, `ui.events.none`, `ui.events.hereNow`, `ui.events.people`, `ui.events.friends`, `ui.events.happeningHere`, `ui.events.social`, `ui.events.noCanonicalYet`.
- Quiz: `ui.quiz.next`, `ui.quiz.takenRepeatable`, `ui.quiz.correct`, `ui.quiz.wrong`, `ui.quiz.targetMissing`, `ui.quiz.moduleNotLoaded`, `ui.quiz.setLoadFailed`, `ui.quiz.setMalformed`, `ui.quiz.allSetsAlreadyCompleted`, `ui.quiz.lastSetPlusPoint`, `ui.quiz.alreadyCompletedEarlier`, `ui.quiz.missingCategoryNoPoints`, `ui.quiz.allSetsCompleted`, `ui.quiz.noNewPointsAlreadyCompleted`, `ui.quiz.noNewPoints`, `ui.quiz.noPointsMissingCategory`, `ui.quiz.allSetsCompletedForPlace`, `ui.quiz.nextSet`, `ui.quiz.done`, `ui.quiz.noneHereYet`, `ui.quiz.perfectMissingCategory`, `ui.quiz.runtimeError`, `ui.quiz.takeAgain`.
- Search: `ui.search.noResultsFor`, `ui.search.placeFallback`, `ui.search.personFallback`, `ui.search.category`, `ui.search.people`, `ui.search.categories`.
- Lists/filter/sort: `ui.empty.noMatches`, `ui.people.loading`, `ui.people.loadingText`, `ui.nature.loading`, `ui.nature.loadingText`, `ui.nature.noneCollectedTitle`, `ui.nature.noneCollectedText`, `ui.nature.showPlaces`, `ui.badges.noCategoriesLoaded`, `ui.badges.none`, `ui.badges.filterHidesAll`, `ui.badges.badgeFilter`, `ui.sort.distance`, `ui.sort.oldest`, `ui.sort.newest`.
- Map/routes: `ui.map.detailed`, `ui.map.backToOverview`, `ui.routes.mapNotReady`, `ui.position.notFoundYet`, `ui.routes.placeMissingCoordinates`, `ui.routes.calculatingWalkingRoute`, `ui.routes.walkingRouteShown`, `ui.routes.noRouteFound`, `ui.routes.noneLoaded`, `ui.routes.noneAvailableYet`, `ui.routes.noneTitle`, `ui.routes.noValidStops`, `ui.routes.notLoaded`, `ui.routes.menuLabel`, `ui.routes.goHere`, `ui.routes.shownInExplorePanel`.
- Popup/nature/wonderkammer/toasts: `ui.popup.noContentYet`, `ui.popup.noDescriptionYet`, `ui.popup.noPlacesRegisteredYet`, `ui.popup.continue`, `ui.observations.noneYet`, `ui.observations.notLoaded`, `ui.knowledge.noneRegisteredYet`, `ui.trivia.noneYet`, `ui.nature.unlockedHint`, `ui.nature.lockedHint`, `ui.nature.findingPlaces`, `ui.nature.noLinkedPlacesYet`, `ui.wonderkammer.*`, `ui.unlock.newPlace`, `ui.unlock.newPerson`, `ui.unlock.placeCollected`, `ui.unlock.personMet`, `ui.nature.unlock.*`, `ui.badge.newLevel`, `ui.badge.newLevelAchieved`.

### C — Dynamiske setninger som trenger sentence-format key

Prioritert Batch 10-kandidater:

- Counts/plural:
  - `0 steder`, `0 quizzer`
  - `${persons.length} personer her`
  - `${count} merke/merker samlet`
  - `${canonicalForPlace.length} ting skjer her`
  - `+${count} til samlet`
- Distance/time:
  - `${distance} m`
  - `Gå nærmere: ${left} m`
  - `Gangrute: ${km} km · ca ${min} min`
- Search/filter:
  - `Ingen treff på «${query}»`
  - `Ingen ${noun} passer med badgefilteret ${label} ...`
  - `Badgefilter: ${cat.name}`
  - `Ingen ruter har stopp i ${badgeName} ...`
- Quiz:
  - `Sett ${n}/${total}`
  - `Dette settet er allerede tatt • ${remaining} sett mangler fortsatt`
  - `${remaining} sett igjen etter dette • +1 poeng`
  - `Sett ${n}/${total} fullført: ${correct}/${total}`
  - `${remainingSets} sett gjenstår`
  - `Score: ${correct}/${total}`
  - `Sett ${n} av ${total} fullført`
  - `Perfekt! ${total}/${total} 🎯`
  - `Fullført: ${correct}/${total} – prøv igjen for full score.`
- Notes/prompts/toasts:
  - `Du snakker med ${person.name}...`
  - `Samtale med ${person.name} lagret 💬`
  - `Notat om ${name}` / `Notat om ${name} lagret 📝`
- Place card/popup:
  - `Quizkort for ${placeName}`
  - `Familie: ${family}`
  - `← Tilbake til ${parentTitle || "forrige nivå"}`
  - `Ta quiz igjen · ${completed}/${total} sett`
  - `Fortsett quiz · ${completed}/${total} sett`
  - `Ta quiz · ${total} sett`

### D — Innholdsdata som ikke skal oversettes i runtime

Ikke flytt til UI-dictionary i disse batchene:

- Place names, place descriptions, popup descriptions, place years and route stop names.
- Person names, roles, works, facts and person descriptions.
- Story titles, story/body text, Wonderkammer entry titles/descriptions/activity text.
- Quiz questions, answers, trivia, concept IDs and emne IDs loaded from data files.
- Category IDs, filter mode IDs, route IDs, nature IDs, taxonomy/latin/family values, brand names.
- User-entered notes/dialog text and stored user note bodies.
- Product/module names where they are branding (`History Go`, `Civication`, `Wonderkammer`, possibly `Brand`).

---

## Anbefalt videre arbeid i små PR-batcher

### Batch 8: legg til manglende dictionary keys for hovedappen

- Add only keys in `data/i18n/ui/nb.json`, `en.json`, `pt.json`.
- Prioritize reusable generic keys first: close/minimize/profile/search/empty/sort/routes/quiz toasts.
- Add sentence-format keys but do not wire runtime yet if this batch should remain dictionary-only.

### Batch 9: koble statiske hovedapp-renderere til eksisterende/nye keys

- `index.html`: add missing `data-i18n` / i18n attr metadata where current static fallback is insufficient.
- `js/ui/place-card.js`: use `HG_I18N.t` for static labels in events, route menu, leksikon, quiz-card aria.
- `js/map.js`, `js/ui/left-panel.js`, `js/ui/lists.js`, `js/ui/search.js`: connect static labels/empty headings.

### Batch 10: koble dynamiske sentence-format keys

- Introduce/standardize a tiny formatting helper if not already available (do not refactor broadly).
- Wire counts, distances, route estimates, quiz progress/summary, badgefilter sentences and unlock toasts.
- Keep data values interpolated as variables, not translated UI strings.

### Batch 11: quiz-modal/toast spesialpass hvis nødvendig

- Finish quiz modal/summary and all shared toasts.
- Deduplicate repeated toasts like `Quiz-modul ikke lastet` and `Rute-funksjon ikke lastet` across modules.
- Verify MutationObserver does not fight explicit runtime `textContent` updates.

## Validering

Audit-only validation used read/search commands only. No build was run.

- `git status --short`
- `find .. -name AGENTS.md -print`
- `rg --files -g '!node_modules' | rg '(^index\.html$|^app\.js$|^js/|^data/i18n/ui/)'`
- `python3` JSON key inspection for `data/i18n/ui/nb.json`, `en.json`, `pt.json`
- `rg -n` targeted searches for hardcoded UI strings in the files listed above
- `nl -ba ... | sed -n ...` line-oriented source inspection

## Scope-bekreftelse

No runtime/data/CSS/HTML files changed. No dictionary keys created. No runtime refactor performed. This report is the only file added for PR delivery.
