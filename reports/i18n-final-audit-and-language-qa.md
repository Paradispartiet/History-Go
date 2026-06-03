# UI i18n batch 15: final audit and language QA

## Status

Final audit after PR #925 shows that the main-app UI i18n wiring is substantially complete, with one small remaining runtime UI pocket in `js/observations.js` and a few still-hardcoded NextUp sentence fragments. No runtime code, dictionaries, HTML, CSS, or data files were changed in this batch.

The dictionary checks are healthy: all code-used `ui.*` keys are present in `nb`, `en`, and `pt`; all three UI dictionaries have the same key set; JSON parses cleanly; duplicate-key check passes; and placeholder names match across languages.

## Scope

Investigated:

- `index.html`
- `js/i18n.js`
- `js/profile.js`
- `js/nextUpRuntime.js`
- `js/quizzes.js`
- `js/map.js`
- `js/routes.js`
- `js/navRoutes.js`
- `js/observations.js`
- Relevant UI modules under `js/ui/`, including place card, popup utils, search, lists, left panel, mini profile, badge modal, nature card, Wonderkammer entry, events, interactions, and toast/unlock modules.
- `data/i18n/ui/nb.json`
- `data/i18n/ui/en.json`
- `data/i18n/ui/pt.json`

Method:

- Searched app JS/HTML for user-facing assignments and render patterns such as `innerHTML`, `textContent`, `title`, `aria-label`, `placeholder`, `showToast(...)`, `window.prompt(...)`, modal buttons, empty states, status messages, popup labels, sort/filter labels, and interpolated template strings.
- Treated fallback strings inside valid `tUI(...)`, `tt(...)`, `_t(...)`, `tfUI(...)`, and `_tf(...)` calls as category B, not defects, then verified their keys through the key coverage check.
- Did not analyze content data as if it must be runtime-translated by the UI dictionary.
- Did not count debug/dev/internal strings, comments, event names, storage keys, source/layer IDs, product names, or data-provided content values as UI defects.

## Key coverage

- `ui.*` keys used in `index.html` + `js/**/*.js`: **425**
- Missing keys in `nb`: **0**
- Missing keys in `en`: **0**
- Missing keys in `pt`: **0**
- Key parity status: **OK**. `data/i18n/ui/nb.json`, `data/i18n/ui/en.json`, and `data/i18n/ui/pt.json` each contain **488** keys and have identical key sets.
- Obvious code-used `ui.*` key spelling errors found by coverage check: **0**
- Approximate unused UI dictionary keys by literal code scan: **63**. These were not treated as defects because some may be reserved for static pages, future wiring, or non-literal lookup paths.

## Placeholder parity

Placeholder parity is **OK**.

- Placeholder names inside `{placeholder}` tokens match across `nb`, `en`, and `pt` for every shared key.
- Empty dictionary values found: **0**
- Values equal to the key name found: **0**
- Replacement-character / broken encoding marker `�` found: **0**

## Remaining hardcoded UI

| File | Text / pattern | Category | Recommendation | Comment |
|---|---|---|---|---|
| `js/observations.js` | Modal buttons `Nullstill` and `Lagre` in `ensureUI()` | A | Small restbatch: wire to existing or new observation/action keys. | User-facing modal chrome remains hardcoded. Existing generic keys such as `ui.nextup.reset` / `ui.profile.modalSave` exist but may be semantically too narrow; decide whether to reuse or add observation-specific/generic action keys in a later non-audit batch. |
| `js/observations.js` | Toasts `Observasjon-feil: mangler target-data`, `Fant ikke observasjon-linse`, `📝 Observasjon lagret`, `Observasjon-feil: noe krasjet` | A / G | Small restbatch: add/wire sentence/static observation status keys. | These are user-facing status/toast strings, including error states. |
| `js/observations.js` | Fallback `Observasjon: ${target.title}` | G | Small restbatch: add/wire a sentence-format key such as observation title with `{title}`. | `target.title` itself is data/content and should remain data; the sentence wrapper is UI. |
| `js/observations.js` | Fallback note label `Kort observasjon (valgfritt)` | A / F | Small restbatch: add/wire observation note-label key unless `lens.note_label` is intentionally always data-provided. | If `lens.note_label` is data, it is category C when present; only the hardcoded fallback is UI. |
| `js/observations.js` | `lens.title`, `lens.prompt`, `lens.options[].label`, `lens.note_label` | C | Do not runtime-translate as UI in this batch. | Observation lens prompts/chips/labels are data-provided content, explicitly out of scope unless a separate content-i18n path is introduced. |
| `js/observations.js` | Validation strings like `lens missing`, `targetId missing`, debug warnings | D | No action. | Internal validation/debug text, not UI. |
| `js/nextUpRuntime.js` | `Rute i utvikling`, `Rute om mobilitet og bytransformasjon`, `Rute for å forstå byens begreper`, `Fortellingsrute gjennom byen`, `Utforskningsrute i nærheten` in path summary construction | A / F | Small restbatch: wire existing `ui.nextup.routeDeveloping` where appropriate and add/wire route-summary title keys for the variants. | These summary titles can surface through profile/NextUp summaries. |
| `js/nextUpRuntime.js` | Path descriptions `Du er i gang med en læringssti ...` and `Du følger en rute ...` | A / F | Small restbatch: add/wire route-summary description keys. | User-facing explanatory copy. |
| `js/nextUpRuntime.js` | Learning-style strings `Begreper + fortellinger`, `Utforsking + detaljer`, `Begrepsbasert`, `Fortellingsbasert` | A / F | Small restbatch: add/wire learning-style keys. | Other learning-style labels in this function already use `ui.nextup.learningStyle.*` keys. |
| `js/nextUpRuntime.js` | `NextUp lærer retningen din når du bruker forslagene.` returned by `buildCurrentDirection()` | A | Wire to existing `ui.nextup.learnDirection`. | The key exists in all dictionaries; this hardcoded return should be connected in a later runtime batch. |
| `js/nextUpRuntime.js` | Dynamically created NextUp button `aria-label` / `title` = `Neste` | A | Wire to existing `ui.nextup.next` or `ui.nextup.suggestion.next`. | Small accessibility/title residue. |
| `js/nextUpRuntime.js` | Toast `Fant ikke Wonderkammer-visning` | B | No defect if intentionally covered elsewhere; consider reuse of `ui.miniprofile.wonderkammerViewNotFound` in a cleanup batch. | Equivalent key exists for mini-profile; this location still uses a literal. |
| `js/nextUpRuntime.js` | `aria-label="NextUp-modus"` for the mode tablist | E | Add/wire a key if this attribute is considered localized UI. | Contains product name `NextUp` plus localized noun. Product name itself should remain unchanged. |
| `js/nextUpRuntime.js` | Active path status `Du er i gang med en rute · Fortsett?` and `${summary.step_count} steg` | G | Add/wire sentence-format keys. | Count/sentence composition remains hardcoded. |
| `js/nextUpRuntime.js` | Fallbacks inside `tUI(...)` / `tfUI(...)` such as `Nærmest`, `Neste quiz`, `Rute startet: {count} steg`, `Tema: {theme}`, `Ingen forslag ennå` | B | No action for fallback status. | Keys exist in all three UI dictionaries. |
| `js/quizzes.js` | Quiz questions, answers, trivia/concept labels | C | Do not runtime-translate as UI. | Loaded quiz/content data is out of scope for UI dictionary runtime wiring. |
| `js/quizzes.js` | Fallbacks inside `tt(...)` / `tfUI(...)` and emoji/status composition around translated strings | B | No action for fallback status. | All literal `ui.*` keys used here are present in all three UI dictionaries. |
| `js/profile.js` | Profile/user names, place names, people names, badge/category/career/position names, user notes, loaded knowledge/trivia values | C | Do not runtime-translate as UI. | These are data/content/user values and were not counted as UI defects. |
| `js/profile.js` | Fallbacks inside `_t(...)` / `_tf(...)` | B | No action for fallback status. | Covered by the key coverage check. |
| `js/map.js` | Map style toggle fallback text `Kart` / `Detaljert` with `data-i18n` | B | No action. | Static DOM i18n wiring covers these fallbacks; keys exist in all dictionaries. |
| `js/routes.js` / `js/navRoutes.js` | Route titles/names/stops and route IDs from route data | C | Do not runtime-translate as UI. | Route names and stops are content/data. |
| `js/routes.js` | Empty/status messages using `tUI(...)` / `tfUI(...)` | B | No action. | Keys exist in all dictionaries. |
| `js/ui/search.js` | Place/person/category names, category names, years, query text | C | Do not runtime-translate as UI. | Data/user-provided values. |
| `js/ui/search.js` | Search section labels and empty states using `tUI(...)` / `tfUI(...)` | B | No action. | Keys exist in all dictionaries. |
| `js/ui/lists.js` | Place/person/nature names, Latin names, category IDs/names, distance values, active badge label values | C | Do not runtime-translate as UI. | Data/content and formatted values. UI wrappers already use keys where inspected. |
| `js/ui/lists.js` | Loading/empty/filter fallbacks inside `tUI(...)` / `tfUI(...)` | B | No action. | Keys exist in all dictionaries. |
| `js/ui/mini-profile.js` | NextUp labels, career line, quiz history UI, toasts inside `tUI(...)` / `tfUI(...)` | B | No action. | Keys exist in all dictionaries. The `Wonderkammer` product name is intentionally retained as a name. |
| `js/ui/nature-card.js` / `js/ui/wonderkammer-entry.js` / toast modules | Species names, Wonderkammer titles/descriptions/content, images/icons, product names | C / E | Do not runtime-translate as UI. | Content/name/product values were intentionally not counted as defects. UI chrome fallbacks inspected here use keys. |
| `index.html` | Static text/attrs with `data-i18n` or `data-hg-i18n-*` | B | No action. | Static HTML fallbacks are valid i18n fallback text. |
| `index.html` | Language option self-names `Norsk`, `English`, `Português` | E | No action. | Language self-names are expected to remain as language labels unless a language-name dictionary is introduced. |
| `index.html` | `History Go`, `History GO`, `AHA`, `Civication`, `Wonderkammer` | E | No action. | Product/brand/module names are not localized as ordinary UI copy. |
| `index.html` / `js/ui/dom.js` / `js/ui/geo-indicator.js` | Glyph/status tokens `📍`, `⛔`, `…`, numeric fallback `0`, check icons | D | No action. | Icon/status tokens, not localizable prose. |
| `js/i18n.js` | Attribute names, observer logic, SVG markup, fallback normalization internals | D | No action. | i18n runtime internals, not user-facing copy. |

## Language QA notes

- No JSON parse errors, duplicate UI JSON keys, placeholder mismatches, empty values, key-name-as-value entries, or broken replacement characters were found.
- `pt` value `ui.nextup.theme` is `Tema: {theme}`. This matches Norwegian text and may still be acceptable Portuguese, but it is worth a native-speaker check because it was the only `pt` value equal to `nb` for a sentence label that is actively used in code.
- `pt` value `ui.quiz.setIndexOfTotal` is `Set {current}/{total}`. This may be an English carryover or accepted product terminology; verify with Portuguese language QA.
- `pt` value `ui.events.social` is `Social`. This may be acceptable depending on locale/orthography choice, but should be reviewed by Portuguese QA.
- `nb` values `ui.profile.pcBalance`, `ui.knowledge.streams`, `ui.groundhopper.groundsVisited`, and `ui.groundhopper.footballGrounds` intentionally or accidentally keep English/domain terms. Not a key/parity defect, but worth product-language review for Norwegian consistency.
- `ui.wonderkammer.type.mural` is `Mural` in both `en` and `pt`; this can be valid in both languages but should be confirmed by language QA.
- Product/brand names such as `History Go`, `AHA`, `Civication`, `Wonderkammer`, and `NextUp` were not treated as translation problems.

## Not counted as defects

The audit intentionally did not count these as UI i18n defects:

- Place names
- Person names
- Route names and route stop names
- Badge names from data
- Category names from data
- Career names and position names from data
- Subject/topic/theme names from data
- Nature species names and Latin names
- Wonderkammer titles, descriptions, item/chamber content values, and product name
- Quiz questions, answers, trivia, concepts, and loaded quiz content
- Story titles and story/dialog text
- Descriptions loaded from content/data files
- User notes and user-entered prompt text
- Observation lens prompts/chips/labels when data-provided
- Product/brand/module names: `History Go`, `History GO`, `AHA`, `Civication`, `Wonderkammer`, `NextUp`
- Debug/dev/internal strings, console warnings, comments, storage keys, event names, source IDs, layer IDs, and validation identifiers
- Icons, emoji-only status tokens, numeric counters, IDs, and CSS/SVG/internal markup

## Recommended next step

A very small final i18n cleanup batch is recommended before manual QA if the team wants zero known runtime UI residues:

1. **Observation modal/status cleanup**: add or reuse keys for `js/observations.js` modal buttons, note fallback label, observation title wrapper, success toast, and error toasts.
2. **NextUp summary/accessibility cleanup**: wire remaining `js/nextUpRuntime.js` path-summary titles/descriptions, active-path count sentences, learning-style variants, `ui.nextup.learnDirection`, NextUp button `aria-label`/`title`, and the `NextUp-modus` tablist label.
3. **Language QA review only**: have a native speaker/product owner review the small list in “Language QA notes”, especially Portuguese `Set {current}/{total}` / `Tema: {theme}` and Norwegian Groundhopper terminology.

After those small cleanups, the app should be ready for manual language/UI QA. If the team accepts the listed observation/NextUp residues for now, no broad i18n wiring batch is recommended before manual QA.

## Validation

Commands/checks run:

```sh
node -e "for (const f of ['data/i18n/ui/nb.json','data/i18n/ui/en.json','data/i18n/ui/pt.json']) JSON.parse(require('fs').readFileSync(f,'utf8')); console.log('ui json ok')"
```

Result: `ui json ok`

```sh
node - <<'NODE'
const fs = require('fs');
const files = ['data/i18n/ui/nb.json','data/i18n/ui/en.json','data/i18n/ui/pt.json'];
const data = Object.fromEntries(files.map(f => [f, JSON.parse(fs.readFileSync(f,'utf8'))]));
const keysets = Object.fromEntries(Object.entries(data).map(([f,o]) => [f, new Set(Object.keys(o))]));
let ok = true;
for (const a of files) for (const b of files) {
  const missing = [...keysets[a]].filter(k => !keysets[b].has(k));
  if (missing.length) {
    ok = false;
    console.log(`${b} missing keys from ${a}:`, missing);
  }
}
if (!ok) process.exit(1);
console.log('ui key parity ok');
NODE
```

Result: `ui key parity ok`

```sh
npm run i18n:dupkeys:check
```

Result: `OK: no duplicate JSON keys in i18n place files.`

```sh
git diff --check
```

Result: pass.

```sh
node - <<'NODE'
const fs = require('fs');
const cp = require('child_process');
const sourceFiles = ['index.html', ...cp.execSync("rg --files js -g '*.js'", { encoding: 'utf8' }).trim().split(/\n/).filter(Boolean)];
const used = new Set();
const keyRe = /["'`]((?:ui)\.[A-Za-z0-9_.-]+)["'`]/g;
for (const file of sourceFiles) {
  const text = fs.readFileSync(file, 'utf8');
  for (const match of text.matchAll(keyRe)) used.add(match[1]);
}
const dictFiles = ['data/i18n/ui/nb.json','data/i18n/ui/en.json','data/i18n/ui/pt.json'];
let ok = true;
for (const file of dictFiles) {
  const dict = JSON.parse(fs.readFileSync(file, 'utf8'));
  const missing = [...used].filter((key) => !(key in dict));
  console.log(`${file}: ${Object.keys(dict).length} dictionary keys, ${missing.length} missing of ${used.size} used ui.* code keys`);
  if (missing.length) {
    ok = false;
    for (const key of missing) console.log(`  missing ${key}`);
  }
}
if (!ok) process.exit(1);
console.log(`ui code key coverage ok (${used.size} used keys)`);
NODE
```

Result: `ui code key coverage ok (425 used keys)`

```sh
node - <<'NODE'
const fs = require('fs');
const files = ['data/i18n/ui/nb.json','data/i18n/ui/en.json','data/i18n/ui/pt.json'];
const data = Object.fromEntries(files.map(f => [f, JSON.parse(fs.readFileSync(f, 'utf8'))]));
const placeholders = value => [...String(value).matchAll(/\{([A-Za-z0-9_]+)\}/g)].map(m => m[1]).sort();
let mismatches = [];
for (const key of Object.keys(data[files[0]])) {
  const base = placeholders(data[files[0]][key]).join(',');
  for (const file of files.slice(1)) {
    const got = placeholders(data[file][key]).join(',');
    if (got !== base) mismatches.push({ key, nb: base, file, got });
  }
}
if (mismatches.length) {
  console.log(mismatches);
  process.exit(1);
}
console.log('ui placeholder parity ok');
NODE
```

Result: `ui placeholder parity ok`

No runtime files changed. No dictionaries changed. No data files changed.
