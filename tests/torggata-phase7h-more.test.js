const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const read = relativePath => fs.readFileSync(path.join(repo, relativePath), 'utf8');
const readJson = relativePath => JSON.parse(read(relativePath));

const mainPath = 'data/leksikon/places/oslo/by/leksikon_oslo_by_torggata.json';
const languagePath = 'data/leksikon/sprak/places/europe/norway/oslo/torggata.json';
const main = readJson(mainPath);
const language = readJson(languagePath);
const manifest = readJson('data/leksikon/sprak/manifest.json');
const backlog = readJson('reports/place-production/torggata-quality-improvement-backlog-v1.json');
const runtime = read('js/ui/place-popup-tabs.js');
const directTabsRuntime = read('js/ui/place-popup-direct-tabs.js');
const collectionRouting = read('js/ui/place-collection-knowledge-routing.js');
const checklist = read('docs/PLACE_PRODUCTION_CHECKLIST.md');
const popupContract = read('docs/PLACE_POPUP_SYSTEM.md');
const audit = read('reports/place-production/torggata-phase7h-more-audit-v1.md');
const workcard = read('reports/place-production/torggata-workcard-current.md');

assert.strictEqual(main.place_id, 'torggata');
assert.strictEqual(main.version, 5);
assert.deepStrictEqual(Object.keys(main.interpretation), [
  'what_to_notice', 'why_it_matters', 'counterpoints', 'sources'
]);
assert.strictEqual(main.interpretation.what_to_notice.length, 2);
assert.strictEqual(main.interpretation.why_it_matters.length, 2);
assert.strictEqual(main.interpretation.counterpoints.length, 1);
assert.match(main.interpretation.what_to_notice.join(' '), /nordsiden to meter bredere/);
assert.match(main.interpretation.what_to_notice.join(' '), /Ginkgo biloba/);
assert.match(main.interpretation.why_it_matters.join(' '), /Fire meter kjørebane/);
assert.match(main.interpretation.counterpoints[0], /vestre del er ren gågate/);
for (const source of main.interpretation.sources) {
  assert(/^https:\/\//.test(source.url));
  assert.strictEqual(source.verifiedAt, '2026-08-14');
}

assert.strictEqual(language.place_id, 'torggata');
assert.strictEqual(language.verified_at, '2026-08-14');
assert.deepStrictEqual(language.entries.map(entry => entry.id), [
  'torggata_ovre_torvegade',
  'torggata_torvegaden_1852',
  'torggata_gang_og_sykkelprioritert_gate'
]);
for (const entry of language.entries) {
  assert.strictEqual(entry.linked_to.kind, 'place');
  assert.strictEqual(entry.linked_to.id, 'torggata');
  assert(entry.meaning.length > 70);
  assert(entry.context.length > 100);
  assert(entry.sources.length >= 2);
  assert(entry.sources.every(source => /^https:\/\//.test(source.url)));
  assert(!/Torggata Bad|Rockefeller|Youngstorget-materiale/.test(entry.meaning + entry.context));
}
assert.strictEqual(manifest.place_files.torggata, languagePath);

assert.match(runtime, /renderMore\(main, buckets\.objects, language\)/);
assert.match(directTabsRuntime, /heading === "spor og objekter" \|\| heading === "legg merke til"/);
assert.match(directTabsRuntime, /heading === "hvorfor det betyr noe"/);
assert.match(directTabsRuntime, /heading === "motpunkter"/);
assert.match(directTabsRuntime, /ensureLanguageTab\(tablist, panelWrap\)/);
assert.match(directTabsRuntime, /morePanel\.remove\(\)/);
assert.match(collectionRouting, /objectsSupplement/);
assert.match(collectionRouting, /interpretation\.what_to_notice/);

const finding = backlog.findings.find(item => item.id === 'more_missing');
assert(finding);
assert.strictEqual(finding.workflow_status, 'RESOLVED_PHASE_7H');
assert.deepStrictEqual(finding.resolution.language_entries, language.entries.map(entry => entry.id));
assert.deepStrictEqual(finding.resolution.source_owners, [mainPath, languagePath]);
assert.strictEqual(backlog.sequence.find(item => item.id === 'more_missing').status, 'RESOLVED');
assert.strictEqual(backlog.sequence.find(item => item.id === 'objects_structures_round_overlap').status, 'QUEUED_NEXT');
assert.deepStrictEqual(backlog.active_phase, {
  id: 'objects_structures_round_overlap',
  status: 'QUEUED_NEXT'
});

assert.match(checklist, /canonical place-register\/manifester er søkt/);
assert.match(checklist, /delsted som har egen canonical place-oppføring brukes ikke som primært Før\/etter-stedfortreder/);
assert.match(popupContract, /Placegrensen gjelder hele popupen/);
assert.match(popupContract, /kan ikke brukes i stedet for parent-place i Om, Historie, Fortellinger, Før\/etter, Nyheter, Lesespor, Kilder, Språk eller andre eierflater/);
assert.match(popupContract, /Objects\/Gjenstander-popupen/);
assert.match(audit, /Torggata Bad, Rockefeller, Youngstorget[\s\S]*brukes ikke som Mer-erstatning/);
assert.match(audit, /Automatiske tester[\s\S]*beviser ikke alene/);
assert.match(workcard, /Gjenåpnet fase 7H Mer = LØST/);
assert.match(workcard, /ÉN REDAKSJONELL BLOKKER GJENSTÅR/);
