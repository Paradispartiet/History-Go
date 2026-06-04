# UI i18n batch 18: final post-cleanup verification

## Status

Post-#940 verification confirms that the specific observation and NextUp residues reported in `reports/i18n-final-audit-and-language-qa.md` are now wired through UI i18n calls in the inspected runtime files. No category A real UI leftovers were found in the inspected cleanup scope. Dictionary JSON parsing, code key coverage, dictionary key parity, duplicate-key checking, and placeholder parity all pass.

## Scope

Files/areas inspected:

- `reports/i18n-final-audit-and-language-qa.md`
- `index.html`
- `js/i18n.js`
- `js/observations.js`
- `js/nextUpRuntime.js`
- `js/profile.js`
- `js/quizzes.js`
- `js/map.js`
- `js/routes.js`
- `js/navRoutes.js`
- `js/ui/place-card.js`
- `js/ui/popup-utils.js`
- `js/ui/search.js`
- `js/ui/lists.js`
- `js/ui/left-panel.js`
- `js/ui/mini-profile.js`
- `js/ui/badge-modal.js`
- `js/ui/nature-card.js`
- `js/ui/wonderkammer-entry.js`
- `js/ui/events.js`
- `js/ui/interactions.js`
- `js/ui/*toast*.js`
- `data/i18n/ui/nb.json`
- `data/i18n/ui/en.json`
- `data/i18n/ui/pt.json`

Method:

- Re-checked every observation and NextUp residue named by the batch 15 report.
- Searched inspected JS/HTML for user-facing `innerHTML`, `textContent`, `title`, `aria-label`, `placeholder`, `showToast(...)`, `window.prompt(...)`, modal/button/status/popup/empty-state patterns, and interpolated template strings.
- Treated fallback strings inside valid `tUI(...)`, `tt(...)`, `_t(...)`, `tfUI(...)`, and `_tf(...)` calls as category B, then verified those literal `ui.*` keys through the code key coverage check.
- Did not count content/data values, names, route/place/person/category/species/content labels, user notes, loaded quiz/story/knowledge/dialog text, product names, debug/dev/internal strings, comments, storage keys, event names, source/layer IDs, or fallback text inside valid i18n calls as defects.

## PR #928 residue check

| Area | Previous residue | Current status | Comment |
|---|---|---|---|
| Observations | `Nullstill` | Resolved | Now rendered through `tUI("ui.observations.reset", "Nullstill")` in `js/observations.js`. |
| Observations | `Lagre` | Resolved | Now rendered through `tUI("ui.observations.save", "Lagre")` in `js/observations.js`. |
| Observations | `Observasjon-feil: mangler target-data` | Resolved | Now rendered through `tUI("ui.observations.missingTargetData", ...)` in `js/observations.js`. |
| Observations | `Fant ikke observasjon-linse` | Resolved | Now rendered through `tUI("ui.observations.lensNotFound", ...)` in `js/observations.js`. |
| Observations | `📝 Observasjon lagret` | Resolved | Now rendered through `tUI("ui.observations.saved", ...)` in `js/observations.js`. |
| Observations | `Observasjon-feil: noe krasjet` | Resolved | Now rendered through `tUI("ui.observations.runtimeError", ...)` in `js/observations.js`. |
| Observations | `Observasjon: ${target.title}` | Resolved | Now rendered through `tfUI("ui.observations.titleWithTarget", "Observasjon: {title}", { title })` in `js/observations.js`; the target title remains content/data. |
| Observations | `Kort observasjon (valgfritt)` | Resolved | Now rendered through `tUI("ui.observations.noteLabelOptional", ...)` as the fallback when no data-provided lens note label exists. |
| NextUp | `Rute i utvikling` | Resolved | Now rendered through `tUI("ui.nextup.route.developing", ...)` in `js/nextUpRuntime.js`. |
| NextUp | `Rute om mobilitet og bytransformasjon` | Resolved | Now rendered through `tUI("ui.nextup.route.mobilityTransformation", ...)` in `js/nextUpRuntime.js`. |
| NextUp | `Rute for å forstå byens begreper` | Resolved | Now rendered through `tUI("ui.nextup.route.cityConcepts", ...)` in `js/nextUpRuntime.js`. |
| NextUp | `Fortellingsrute gjennom byen` | Resolved | Now rendered through `tUI("ui.nextup.route.storyThroughCity", ...)` in `js/nextUpRuntime.js`. |
| NextUp | `Utforskningsrute i nærheten` | Resolved | Now rendered through `tUI("ui.nextup.route.nearbyExploration", ...)` in `js/nextUpRuntime.js`. |
| NextUp | `Du er i gang med en læringssti ...` | Resolved | Now rendered through `tUI("ui.nextup.route.learningPathStarted", ...)` in `js/nextUpRuntime.js`. |
| NextUp | `Du følger en rute ...` | Resolved | Now rendered through `tUI("ui.nextup.route.followingPath", ...)` in `js/nextUpRuntime.js`. |
| NextUp | `Begreper + fortellinger` | Resolved | Now rendered through `tUI("ui.nextup.learningStyle.conceptsStories", ...)` in `js/nextUpRuntime.js`. |
| NextUp | `Utforsking + detaljer` | Resolved | Now rendered through `tUI("ui.nextup.learningStyle.explorationDetails", ...)` in `js/nextUpRuntime.js`. |
| NextUp | `Begrepsbasert` | Resolved | Now rendered through `tUI("ui.nextup.learningStyle.conceptBased", ...)` in `js/nextUpRuntime.js`. |
| NextUp | `Fortellingsbasert` | Resolved | Now rendered through `tUI("ui.nextup.learningStyle.storyBased", ...)` in `js/nextUpRuntime.js`. |
| NextUp | `NextUp lærer retningen din når du bruker forslagene.` | Resolved | Now rendered through `tUI("ui.nextup.learnDirection", ...)` in `js/nextUpRuntime.js`. |
| NextUp | `NextUp-modus` | Resolved | Now rendered through `tUI("ui.nextup.modeTablistLabel", ...)` for the tablist `aria-label` in `js/nextUpRuntime.js`. |
| NextUp | `Du er i gang med en rute · Fortsett?` | Resolved | Now rendered through `tUI("ui.nextup.activePathContinue", ...)` in `js/nextUpRuntime.js`. |
| NextUp | `{count} steg` | Resolved | Now rendered through `tfUI("ui.nextup.stepsCount", "{count} steg", { count })` in `js/nextUpRuntime.js`. |
| NextUp | `Fant ikke Wonderkammer-visning` | Resolved | Now rendered through `tUI("ui.nextup.wonderkammerViewNotFound", ...)` in `js/nextUpRuntime.js`. |
| NextUp | Dynamic NextUp button `aria-label` / `title` = `Neste` | Resolved | Now rendered through `tUI("ui.nextup.next", "Neste")` in both `aria-label` and `title` assignments in `js/nextUpRuntime.js`. |

## Key coverage

- `ui.*` keys used in code: **452** literal keys in `index.html` and `js/**/*.js`
- Missing in `nb`: **0**
- Missing in `en`: **0**
- Missing in `pt`: **0**
- Dictionary key parity: **OK**. `data/i18n/ui/nb.json`, `data/i18n/ui/en.json`, and `data/i18n/ui/pt.json` each contain **514** keys and have identical key sets.

## Placeholder parity

Placeholder parity is **OK**.

- Placeholder names inside `{placeholder}` tokens match across `nb`, `en`, and `pt` for every shared key.
- Empty dictionary values found: **0**.
- Values equal to the key name found: **0**.
- Replacement-character / broken encoding marker `�` found: **0**.

## Remaining hardcoded UI

| File | Text / pattern | Category | Recommendation | Comment |
|---|---|---|---|---|
| `index.html` | Static Norwegian/English text paired with `data-i18n`, `data-hg-i18n-title`, `data-hg-i18n-aria-label`, or `data-hg-i18n-placeholder` | B: Valid i18n fallback, not a defect | No action. | Static fallback text remains available before/if i18n bootstrapping is unavailable; all literal `ui.*` keys found by the coverage script exist in all three dictionaries. |
| `js/observations.js` | PR #928 observation strings now appearing as second-argument fallbacks inside `tUI(...)` / `tfUI(...)` calls | B: Valid i18n fallback, not a defect | No action. | These are no longer hardcoded runtime UI residues because the UI path resolves through dictionary keys. |
| `js/nextUpRuntime.js` | PR #928 NextUp strings now appearing as second-argument fallbacks inside `tUI(...)` / `tfUI(...)` calls | B: Valid i18n fallback, not a defect | No action. | These are no longer hardcoded runtime UI residues because the UI path resolves through dictionary keys. |
| `js/observations.js` | `lens.title`, `lens.prompt`, `lens.options[].label`, `lens.note_label`, `target.title` | C: Content/data, not runtime UI | No action in UI dictionary wiring. | Observation lens prompts/chips/labels and target titles are data/content by the audit rules. |
| `js/nextUpRuntime.js` | `summary.title`, theme/type identifiers, suggestion/place labels | C: Content/data, not runtime UI | No action in UI dictionary wiring. | Data-derived titles and labels remain content values; surrounding UI sentence fragments are now i18n-wired. |
| Inspected JS/HTML | Console messages, storage keys, IDs, source/layer names, event names, comments, emoji-only controls, numeric counters | D: Debug/dev/internal, not UI | No action. | These were ignored according to the audit rules. |
| Inspected JS/HTML | `History Go`, `History GO`, `AHA`, `Civication`, `Wonderkammer`, `NextUp` | E: Product/brand/name, not localized as UI | No action. | Product/brand/module names are intentionally not treated as UI i18n defects. |

No category A real UI leftovers found in the inspected scope.

## Language QA notes

- No JSON parse failures, empty values, key-name values, placeholder mismatches, or broken encoding markers were found in the three UI dictionaries.
- The previous language QA notes from batch 15 remain product-language review candidates rather than wiring defects; this audit did not edit translations.

## Recommended next step

`i18n wiring is complete; proceed to manual language/UI QA.`

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
node - <<'NODE'
const fs = require('fs');
const files = ['data/i18n/ui/nb.json','data/i18n/ui/en.json','data/i18n/ui/pt.json'];
const data = Object.fromEntries(files.map(f => [f, JSON.parse(fs.readFileSync(f, 'utf8'))]));
const placeholders = value => [...String(value).matchAll(/{([A-Za-z0-9_]+)}/g)].map(m => m[1]).sort();
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

Result: `ui code key coverage ok (452 used keys)`

No runtime files changed. No dictionaries changed. No data files changed.
