import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const readJson = path => JSON.parse(fs.readFileSync(path, 'utf8'));
const leksikon = readJson('data/leksikon/places/oslo/historie/leksikon_oslo_historie.json');
const main = leksikon.find(article => article.place_id === 'gamle_aker_kirke' && article.type !== 'news_note');
const languagePath = 'data/leksikon/sprak/places/europe/norway/oslo/gamle_aker_kirke.json';
const language = readJson(languagePath);
const languageManifest = readJson('data/leksikon/sprak/manifest.json');
const languageRuntime = fs.readFileSync('js/ui/place-language-layer.js', 'utf8');
const directTabsRuntime = fs.readFileSync('js/ui/place-popup-direct-tabs.js', 'utf8');
const collectionRouting = fs.readFileSync('js/ui/place-collection-knowledge-routing.js', 'utf8');
const popupContract = fs.readFileSync('docs/PLACE_POPUP_SYSTEM.md', 'utf8');
const report = fs.readFileSync('reports/place-production/gamle-aker-kirke-historie-v1.md', 'utf8');

test('Gamle Aker har et canonicalt Språkleksikon for den faste Språk-fanen', () => {
  assert.equal(languageManifest.place_files.gamle_aker_kirke, languagePath);
  assert.equal(language.place_id, 'gamle_aker_kirke');
  assert.equal(language.source_checked_at, '2026-08-22');
  assert.equal(language.subject_id, 'historie');
  assert.deepEqual(language.emne_ids, [
    'em_his_kirke_kloster_middelalder',
    'em_his_middelalder_oslo',
    'em_his_spor_materialitet',
    'em_his_kulturminner_bevaring'
  ]);
  assert.deepEqual(language.entries.map(entry => entry.id), [
    'gamle_aker_kirke_aker',
    'gamle_aker_kirke_ortocerkalkstein',
    'gamle_aker_kirke_basilika',
    'gamle_aker_kirke_apsis',
    'gamle_aker_kirke_krypt'
  ]);
});

test('Hvert språkspor er stedskoblet, kontekstualisert og kildebelagt', () => {
  for (const entry of language.entries) {
    assert.equal(entry.layer, 'language');
    assert.deepEqual(entry.linked_to, { kind: 'place', id: 'gamle_aker_kirke' });
    assert.ok(entry.meaning.length >= 90);
    assert.ok(entry.context.length >= 120);
    assert.ok(entry.tags.length >= 3);
    assert.ok(entry.sources.length >= 1);
    assert.ok(entry.sources.every(source => source.label.length >= 20));
    assert.ok(entry.sources.every(source => /^https:\/\//.test(source.url)));
  }
});

test('Kirkebygget eier vanlig Språkleksikon, men ikke Oslo-dialekt', () => {
  assert.equal(Object.hasOwn(language, 'dialect_area'), false);
  assert.equal(language.entries.some(entry => entry.layer === 'dialect'), false);
  assert.equal(language.entries.some(entry => entry.type === 'dialect_feature' || entry.type === 'dialekttrekk'), false);
  assert.match(report, /enkeltsted uten `placeScope: "area"`/);
  assert.match(report, /Dialektlaget er derfor eksplisitt N\/A/);
});

test('Tolkningen skiller observasjon, betydning og inferensgrenser', () => {
  assert.equal(main.version, 3);
  assert.equal(main.interpretation.what_to_notice.length, 3);
  assert.equal(main.interpretation.why_it_matters.length, 3);
  assert.equal(main.interpretation.counterpoints.length, 3);
  assert.equal(main.interpretation.source_checked_at, '2026-08-22');
  assert.equal(main.interpretation.sources.length, 7);
  assert.ok(main.interpretation.sources.every(source => source.startsWith('https://')));
  assert.match(main.interpretation.what_to_notice.join(' '), /basilikaformen.*ortocerkalksteinen.*restaureringene/i);
  assert.match(main.interpretation.why_it_matters.join(' '), /norrønt akr.*Oslofeltets geologi.*automatisk fredet/i);
  assert.match(main.interpretation.counterpoints.join(' '), /ikke ett sikkert byggeår.*1950–1955.*beviser ikke/i);
});

test('Fossilsporet får riktig eier uten nytt Story-, funfact- eller Object-filler', () => {
  assert.ok(language.entries.some(entry => entry.id === 'gamle_aker_kirke_ortocerkalkstein'));
  for (const key of ['knowledge', 'funfacts', 'relations', 'objects']) {
    assert.equal(Object.hasOwn(main, key), false, `uventet filler: ${key}`);
  }
  assert.deepEqual(main.artifacts, []);
  assert.match(report, /Ingen forklarende fossiltekst gjeninnføres som Story/);
});

test('Runtime viser fast Språk og ruter andre tillegg til eierflater', () => {
  assert.match(languageRuntime, /const MANIFEST_PATH = "data\/leksikon\/sprak\/manifest\.json"/);
  assert.match(languageRuntime, /data-place-panel="\$\{TAB_ID\}"/);
  assert.match(languageRuntime, /Språk på stedet/);
  assert.match(languageRuntime, /Samle kunnskapen/);
  assert.match(languageRuntime, /target="_blank" rel="noopener noreferrer"/);
  assert.match(directTabsRuntime, /requiredTabs:\s*\["language"\]/);
  assert.match(directTabsRuntime, /visibleOptionalTabs:\s*\[\]/);
  assert.match(directTabsRuntime, /heading === "spor og objekter" \|\| heading === "legg merke til"/);
  assert.match(directTabsRuntime, /heading === "hvorfor det betyr noe"/);
  assert.match(directTabsRuntime, /heading === "motpunkter"/);
  assert.match(collectionRouting, /objectsSupplement/);
  assert.match(collectionRouting, /interpretation\.what_to_notice/);
  assert.match(popupContract, /Objects\/Gjenstander-popupen/);
  assert.match(popupContract, /Språk er obligatorisk/i);
  assert.match(directTabsRuntime, /morePanel\.remove\(\)/);
});

test('Fasekortet bevarer historikken når Quiz/Knowledge går videre', () => {
  assert.match(report, /\| 7 \| Brukerrettede Kilder \| \*\*GODKJENT – PR #5184, merge `31af12e8852cca6d7c2da2ef2e5fdab480a287c2`\*\* \|/);
  assert.match(report, /\| Mer \| PASS – fase 8 \|/);
  assert.match(report, /\| 8 \| Mer \| \*\*GODKJENT – PR #5186, merge `3bc252d347b3dd8561155bdbd49c354378401767`\*\* \|/);
  assert.match(report, /\| 9 \| Quizåpning 2 × 7 og Knowledge \| \*\*GODKJENT – PR #5188, merge `5c400fdb79fa16af7eb23fcd61c3e8b70ef8e01b`\*\* \|/);
});
