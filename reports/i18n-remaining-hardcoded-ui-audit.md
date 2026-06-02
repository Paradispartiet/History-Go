# UI i18n batch 11: audit remaining hardcoded UI

Audit-only report for remaining hardcoded, user-facing UI after PR #906.

## Scope and method

- Reviewed `index.html` and relevant main-app JavaScript under `js/`, with extra focus on `profile.js`, `quizzes.js`, `map.js`, `routes.js`, `navRoutes.js`, `nextUpRuntime.js`, `observations.js`, and `js/ui/*` renderers/toasts.
- Read `js/i18n.js` to distinguish runtime fallbacks from hardcoded UI leftovers.
- Checked code-used `ui.*` keys against `data/i18n/ui/nb.json`, `data/i18n/ui/en.json`, and `data/i18n/ui/pt.json`.
- Did not treat content/data strings as UI defects. Place descriptions, quiz content, story text, people descriptions, nature descriptions, Wonderkammer content, and loaded knowledge/trivia remain content translation concerns.

## Key coverage check

- `ui.*` keys found in `index.html` + `js/**/*.js`: **299**.
- Keys used in code but missing from `data/i18n/ui/nb.json`: **0**.
- Keys used in code but missing from `data/i18n/ui/en.json`: **0**.
- Keys used in code but missing from `data/i18n/ui/pt.json`: **0**.
- Keys present in one of the three UI dictionaries but missing from another: **0**.
- Obvious `ui.*` key spelling errors found by coverage check: **0**.

## Category legend

| Kategori | Meaning |
|---|---|
| A | Real hardcoded user-facing UI leftover that should be translated/wired. |
| B | Existing fallback text inside valid `tUI(...)`, `tt(...)`, `_t(...)`, `tfUI(...)`, or `_tf(...)`; not counted as missing. |
| C | Content/data text that should not be runtime-translated as UI. |
| D | Debug/dev/internal text that does not need UI i18n. |
| E | Real UI leftover that needs new dictionary keys before it can be wired. |
| F | Real UI leftover that needs sentence-format/plural/interpolated keys before it can be wired. |

## Findings by file

### `index.html`

| Tekst / mønster | Kategori | Anbefalt handling | Kommentar |
|---|---:|---|---|
| `History Go`, `History GO` brand/title/alt | C | Ikke koble som UI-tekst | Product/brand label. |
| Language option labels: `Norsk`, `English`, `Português` | C | Ikke koble som ordinary UI; keep as language self-names unless a language-name dictionary is added | These are language self-labels, not app copy. |
| `Civication` link label/title | C/D | Out of this main-app UI batch | Product/module name. |
| Existing static text/attrs with `data-i18n` or `data-hg-i18n-*` | B | Ingen handling | Static DOM i18n wiring already covers these fallbacks. |
| Geo status glyphs `📍`, `⛔`, `…`, count fallback `0` | D | Ingen handling | Icon/status tokens, not localizable prose. |

### `js/quizzes.js`

| Tekst / mønster | Kategori | Anbefalt handling | Kommentar |
|---|---:|---|---|
| `tt(...)` / `tfUI(...)` quiz copy and fallback strings | B | Ingen handling | All observed quiz UI fallbacks use keys that exist in all three dictionaries. |
| Quiz questions/options/trivia/concepts | C | Ikke runtime-koble som UI | Loaded content/data, not UI chrome. |

### `js/profile.js`

| Tekst / mønster | Kategori | Anbefalt handling | Kommentar |
|---|---:|---|---|
| `_t(...)` / `_tf(...)` profile, groundhopper, knowledge, quiz, and modal fallbacks | B | Ingen handling | Used keys exist in all three UI dictionaries. |
| Badge names, place names, people names, concept labels, user notes, loaded knowledge/trivia | C | Ikke runtime-koble som UI | Content/profile/user data. |
| Direct learning debug/state tokens `seen`, `not-seen`, `understood`, `not-understood`, `applied`, `not-applied`, `score` | D | Optional later cleanup only if surfaced as polished UI | Currently diagnostic-style state text in knowledge signal explanation. |
| AHA login button `AHA koblet` / `Logg inn` | A/E | Needs keys if this profile/AHA button is part of the localized main UI | Small profile page residue outside the earlier profile-runtime sections. |

### `js/nextUpRuntime.js`

| Tekst / mønster | Kategori | Anbefalt handling | Kommentar |
|---|---:|---|---|
| Mode labels/chips: `Nærmest`, `Lær mest`, `Fortsett historien`, `Oppdag noe rart`, `Fullfør merket`, `Historie`, `Rart`, `Fullfør` | A/E | Add `ui.nextup.mode.*` keys, then wire mode label/chip rendering | Static mode labels are user-facing. |
| Path summary titles/descriptions: `Rute i utvikling`, `Rute om mobilitet ...`, `Fortellingsrute ...`, `Du er i gang ...` | A/E/F | Add static keys for fixed variants; sentence keys if later variants interpolate counts/topics | Shown in NextUp/profile summaries. |
| Suggestion titles: `Neste sted`, `Wonderkammer`, `Neste scene`, `Forstå`, `Neste quiz`, `Neste merke`, `Neste` | A/E | Add `ui.nextup.suggestion.*` keys or reuse existing where safe | User-facing labels in cards/history. |
| Learning style labels: `Utforskende`, `Detalj- og objektbasert`, `Under utvikling` | A/E | Add `ui.nextup.learningStyle.*` keys | Derived UI labels. |
| Empty/current direction text: `NextUp lærer retningen din når du bruker forslagene.` | A/E | Add a new key | Static empty/help copy. |
| Panel render text: `Rute startet: ${summary.step_count} steg`, `Tema: ...`, `Nullstill`, `NextUp kan bygge en rute ...`, `Neste`, `Ingen forslag ennå` | A/F | Add sentence-format keys for count/topic fragments plus static action/empty keys | Contains interpolation and static labels. |
| Internal storage keys and event names | D | Ingen handling | Not user-facing UI. |

### `js/ui/mini-profile.js`

| Tekst / mønster | Kategori | Anbefalt handling | Kommentar |
|---|---:|---|---|
| `💼 ${pos.title} · ${careerName}` with fallback `Karriere` | A/F | Add a sentence-format key and a fallback key for `Karriere` | Mini-profile career/status line is user-facing. |
| Mini NextUp labels: `Neste Sted:`, `Wonderkammer:`, `Neste Scene:`, `Forstå:` and empty dash `—` | A/E | Reuse/add `ui.nextup.suggestion.*` keys; dash can remain token | Duplicates NextUp labels outside `nextUpRuntime.js`. |
| Toasts: `Fant ikke stedet`, `Fant ikke Wonderkammer-visning`, `Fant ikke neste kapittel-sted`, `Du har ingen fullførte quizzer ennå.`, `Viser steder på kartet` | A/E | Add toast/empty keys | User-visible failure/status messages. |
| Quiz history modal: `Fullførte quizzer`, close button without aria label | A/E | Add modal title key and close aria/text key | Modal button only has glyph text today. |
| Place/person/category names in mini-profile and quiz history | C | Ikke runtime-koble som UI | Data/content labels. |
| Console warning `[mpNextUp] No Wonderkammer open handler found for` | D | Ingen handling | Developer/debug text. |

### `js/observations.js`

| Tekst / mønster | Kategori | Anbefalt handling | Kommentar |
|---|---:|---|---|
| Modal title/button: `Observasjon`, `Lukk` | A/E | Reuse `ui.observations.title` for title and `ui.attr.close` for close | Hardcoded modal chrome. |
| Feedback: `Velg minst ett ord før du lagrer.` | A/E | Add a validation/error key | User-facing validation message. |
| Lens prompts/chips loaded from observation lens data | C | Ikke runtime-koble som generic UI | Content/data from lens definitions. |

### `js/ui/badge-modal.js`

| Tekst / mønster | Kategori | Anbefalt handling | Kommentar |
|---|---:|---|---|
| Tier fallback `Nybegynner` | A/E | Reuse `ui.badge.beginner` or add a badge-modal specific key | Same semantic fallback already exists elsewhere. |
| Progress text ``${points} poeng`` | A/F | Reuse `ui.badge.progressPoints` or equivalent sentence-format key | Count interpolation. |
| `badge.name` / tier labels from badge data | C | Ikke runtime-koble as UI chrome | Badge data/content. |

### `js/routes.js`

| Tekst / mønster | Kategori | Anbefalt handling | Kommentar |
|---|---:|---|---|
| Toasts: `Kartet er ikke klart ennå.`, `Fant ikke rute.`, `Ruten har ingen gyldige stopp i PLACES.`, `Fottur vist på kartet`, `Rutestopp vist på kartet`, `Kunne ikke hente fottur – viser stopp uten luftlinje.`, `Kunne ikke tegne ruten på kartet.`, `Fant ikke posisjon ennå.`, `Kunne ikke hente gangrute (ORS).`, `Kunne ikke tegne gangruten.` | A/E | Add route/map toast keys or wire to existing route keys if semantically exact | Several route keys already exist, but these call sites still use raw strings. |
| Toasts with measurements: `Fottur vist: ${km} km · ca ${min} min`, `Gårute: ${km} km · ca ${min} min`, `Gårute til ${place.name || "sted"}` | A/F | Add sentence-format keys for distance/time and destination fallback | Interpolated route status. |
| Fallback label `Rute` in map feature/route toast | A/E | Reuse `ui.routes.fallbackRoute` | UI fallback, not data. |
| Route names/stops from `data/routes.json` | C | Ikke runtime-koble as UI chrome in this audit | Route content/data. |
| ORS/internal identifiers (`foot-walking`, `PLACES`, source/layer ids) | D | Ingen handling | Internal/debug/dev text. |

### `js/navRoutes.js`

| Tekst / mønster | Kategori | Anbefalt handling | Kommentar |
|---|---:|---|---|
| Any remaining `tUI(...)` / `tfUI(...)` route menu fallbacks | B | Ingen handling | Used `ui.routes.*` keys are covered in all three dictionaries. |
| Route names from data | C | Ikke runtime-koble as UI chrome | Content/data. |

### `js/map.js`

| Tekst / mønster | Kategori | Anbefalt handling | Kommentar |
|---|---:|---|---|
| Map style toggle `Kart` / `Detaljert` | B | Ingen handling | The toggle uses covered keys (`ui.attr.map`, `ui.map.detailed`). |
| Console diagnostics about MapLibre/MapTiler/style switching | D | Ingen handling | Debug/dev text. |

### `js/ui/place-card.js`

| Tekst / mønster | Kategori | Anbefalt handling | Kommentar |
|---|---:|---|---|
| Existing `tUI(...)` / `tfUI(...)` place-card fallbacks | B | Ingen handling | Covered by all three dictionaries. |
| Place names, descriptions, images, people names, route/story/content fields | C | Ikke runtime-koble as UI chrome | Content/data. |

### `js/ui/popup-utils.js`

| Tekst / mønster | Kategori | Anbefalt handling | Kommentar |
|---|---:|---|---|
| Quiz button title fallbacks: `Alle ${info.totalSets} sett er fullført.`, `Quizen er allerede fullført, men kan tas igjen.` | A/F | Add sentence/static quiz title keys | User-facing `title` attributes. |
| Place/person popup close button `Lukk` without i18n in one detail popup | A/E | Reuse `ui.attr.close` or `ui.popup.close` | Hardcoded button copy remains in one template. |
| Section heading `Relaterte brands i samme område` | A/E | Add popup/brand relation heading key | User-facing section heading. |
| Event phase labels `Pågår nå`, `Kommer`, `Tidligere` | A/E | Add `ui.events.phase.*` keys | UI labels derived from event dates. |
| Person kind fallback `Institusjonsbærer` and person popup section/action labels `Samtale & notat`, `Snakk med ${person.name}`, `Notat` | A/E/F | Add static keys and sentence key for `Snakk med {name}` | User-facing chrome/actions; person name stays data. |
| Wonderkammer empty/fact labels: `Ingen Wonderkammer-koblinger ennå.`, `Fakta`, `Ingen fakta ennå.` | A/E | Add/reuse Wonderkammer popup keys | Empty states and labels, not content values. |
| NextUp reasons/fallbacks in local picker: `I nærheten`, `Fortsett historien`, `Neste kapittel`, `Forstå mer`, `Begreper ×${bestScore}` | A/F | Add static/sentence-format `ui.nextup.*` keys | These feed user-visible NextUp reasons. |
| Existing `tUI(...)` popup fallbacks (`Ingen observasjoner ennå.`, `Ingen beskrivelse ennå.`, etc.) | B | Ingen handling | Covered by all three dictionaries. |
| Story prose, descriptions, work titles, place/person names, Wonderkammer dossier content/fact values | C | Ikke runtime-koble as UI chrome | Content/data. |
| Console warnings and internal/source labels | D | Ingen handling | Debug/internal. |

### `js/ui/lists.js`

| Tekst / mønster | Kategori | Anbefalt handling | Kommentar |
|---|---:|---|---|
| `renderBadgeFilterEmpty(listEl, "steder" / "personer" / "naturfunn")` noun arguments | A/F | Replace with sentence variants or noun keys before wiring | Current sentence key localizes the shell, but the noun argument is hardcoded Norwegian. |
| Existing empty/loading/nature fallbacks in `tUI(...)` / `tfUI(...)` | B | Ingen handling | Covered keys exist in all dictionaries. |
| Distance strings such as meters (`m`) | D/F | Optional locale QA; only add formatting keys/helpers if product wants localized units | Not a missing dictionary key today. |
| Place/person/nature names, species names, categories | C | Ikke runtime-koble as UI chrome | Content/data. |

### `js/ui/left-panel.js`

| Tekst / mønster | Kategori | Anbefalt handling | Kommentar |
|---|---:|---|---|
| Existing badge/filter/sort fallbacks in `tUI(...)` / `tfUI(...)` | B | Ingen handling | Covered keys exist in all dictionaries. |
| Category/badge names from `CATEGORY_LIST` | C | Ikke runtime-koble as generic UI | Data/content. |
| Internal storage/filter mode ids | D | Ingen handling | Internal state values. |

### `js/ui/search.js`

| Tekst / mønster | Kategori | Anbefalt handling | Kommentar |
|---|---:|---|---|
| Search empty/section/type fallbacks in `tUI(...)` / `tfUI(...)` | B | Ingen handling | Covered keys exist in all dictionaries. |
| Search result names/categories/years from data | C | Ikke runtime-koble as UI chrome | Content/data. |

### `js/ui/nature-card.js`

| Tekst / mønster | Kategori | Anbefalt handling | Kommentar |
|---|---:|---|---|
| Nature UI labels/fallbacks in `tUI(...)` | B | Ingen handling | Covered keys exist in all dictionaries. |
| Species names, Latin names, ecology/habitat/content values | C | Ikke runtime-koble as UI chrome | Nature content/data. |

### `js/ui/wonderkammer-entry.js`

| Tekst / mønster | Kategori | Anbefalt handling | Kommentar |
|---|---:|---|---|
| Type/group label maps such as `Lekeområde`, `Ting å se`, `Vårtegn`, `Snøobservasjon` | A/E | Add `ui.wonderkammer.type.*` / `ui.wonderkammer.group.*` keys or move labels to translatable data | These are UI/category labels, distinct from entry titles/descriptions. |
| Smart-field label `Hva kan du gjøre med den?` | A/E | Add a smart-field label key | UI label for optional field. |
| Existing Wonderkammer headings/buttons in `tUI(...)` / `tfUI(...)` | B | Ingen handling | Covered keys exist in all dictionaries. |
| Wonderkammer entry titles/descriptions/content values | C | Ikke runtime-koble as UI chrome | Content/data. |

### `js/ui/events.js`

| Tekst / mønster | Kategori | Anbefalt handling | Kommentar |
|---|---:|---|---|
| Event UI strings observed in this file | B/D | Ingen handling | File is mostly event wiring/comments; user-facing copy is handled elsewhere or data-driven. |
| Event titles/descriptions from data | C | Ikke runtime-koble as UI chrome | Content/data. |

### `js/ui/interactions.js`

| Tekst / mønster | Kategori | Anbefalt handling | Kommentar |
|---|---:|---|---|
| Note/talk prompt/toast fallbacks in `tUI(...)` / `tfUI(...)` | B | Ingen handling | Covered keys exist in all dictionaries. |
| `showToast("Kartmodus")` | A/E | Add/reuse a map mode toast key | Still hardcoded user-facing status. |
| User note body and prompted text | C | Ikke runtime-koble after saved as user content | User-generated content. |

### `js/ui/*toast*.js`

| Tekst / mønster | Kategori | Anbefalt handling | Kommentar |
|---|---:|---|---|
| Badge/nature/person-place unlock toast fallbacks in `tUI(...)` / `tfUI(...)` | B | Ingen handling | Covered keys exist in all dictionaries. |
| Names/titles from unlocked badge/nature/person/place data | C | Ikke runtime-koble as UI chrome | Content/data. |
| Console warning prefixes | D | Ingen handling | Debug/dev text. |

## Ikke rapportert som feil

The following were intentionally not counted as hardcoded UI defects:

- Place names.
- Person names.
- Route names from route/content data.
- Badge names from data.
- Category names from data.
- Nature species names and Latin names.
- Wonderkammer titles, descriptions, dossier values, and entry content.
- Quiz questions, answers, trivia, and concept/content fields.
- Story titles and story prose.
- Place/person/nature descriptions.
- User notes and user-authored reflections.
- Loaded knowledge/trivia text.
- Product/module names such as `History Go`, `History GO`, and `Civication`.
- Fallback text inside valid i18n calls when the `ui.*` key exists in all three UI dictionaries.
- Debug/dev/internal strings such as console warnings, storage keys, event names, source/layer IDs, and code comments.

## Recommended next work

Because remaining UI leftovers do exist, split follow-up work into small batches:

1. **Batch 12: dictionary-only for remaining keys**
   - Add static keys for NextUp labels, mini-profile toasts/modal labels, observation modal/validation labels, badge modal fallbacks, route/map toasts, popup section headings, Wonderkammer type labels, and `Kartmodus`.
   - Add sentence-format keys for route distance/time messages, NextUp route summaries/counts, mini-profile career line, quiz title attributes, `Snakk med {name}`, and `Begreper ×{count}`.

2. **Batch 13: wire remaining static leftovers**
   - Wire static labels in `nextUpRuntime.js`, `mini-profile.js`, `observations.js`, `badge-modal.js`, `popup-utils.js`, and `wonderkammer-entry.js`.

3. **Batch 14: wire remaining dynamic/sentence leftovers**
   - Wire interpolated toasts/statuses in `routes.js`, `nextUpRuntime.js`, `mini-profile.js`, `popup-utils.js`, and `lists.js` noun handling.

4. **Batch 15: optional cleanup of duplicated local i18n helpers / label maps**
   - Consolidate duplicated NextUp labels/reasons between `nextUpRuntime.js`, `mini-profile.js`, and `popup-utils.js` where practical.

5. **Batch 16: language QA / manual smoke test on `nb`, `en`, and `pt`**
   - Manually test map route toasts, NextUp panel, mini-profile modal/toasts, observations modal, badge modal, person/place popups, and Wonderkammer entry labels in all three languages.

No runtime files changed. No dictionaries changed. No data files changed.
