const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const read = relativePath => fs.readFileSync(path.join(repo, relativePath), 'utf8');
const readJson = relativePath => JSON.parse(read(relativePath));

const readingPath = 'data/lesespor/oslo/lesespor_oslo_by.json';
const data = readJson(readingPath);
const manifest = readJson('data/lesespor/manifest.json');
const backlog = readJson('reports/place-production/torggata-quality-improvement-backlog-v1.json');
const runtime = read('js/ui/place-popup-tabs.js');
const audit = read('reports/place-production/torggata-phase7g-reading-trail-audit-v1.md');
const workcard = read('reports/place-production/torggata-workcard-current.md');
const checklist = read('docs/PLACE_PRODUCTION_CHECKLIST.md');

assert.strictEqual(data.schema, 'history_go_lesespor_v1');
assert.strictEqual(data.city, 'oslo');
assert.strictEqual(data.category, 'by');
assert.strictEqual(data.rights_policy.default, 'link_only');
assert(Array.isArray(data.items));
const items = data.items.filter(item => item.place_ids?.includes('torggata'));
assert.strictEqual(items.length, 3);
assert.deepStrictEqual(items.map(item => item.id), [
  'lesespor_torggata_byleksikon_001',
  'lesespor_torggata_toi_2017_001',
  'lesespor_torggata_nla_001'
]);

for (const item of items) {
  assert.deepStrictEqual(item.place_ids, ['torggata']);
  assert.strictEqual(item.access, 'open');
  assert.strictEqual(item.rights, 'link_only');
  assert.strictEqual(item.source_quality, 'recognized');
  assert.strictEqual(item.verifiedAt, '2026-08-14');
  assert(/^https:\/\//.test(item.url));
  assert(String(item.popupDesc).length > 170);
  assert(String(item.relevance).length > 80);
  assert(!/Torggata Bad|Rockefeller|Youngstorget/.test(item.popupDesc));
}

const byleksikon = items[0];
assert.strictEqual(byleksikon.publication, 'Oslo byleksikon');
assert.strictEqual(byleksikon.url, 'https://oslobyleksikon.no/index.php/Torggata');
assert.match(byleksikon.popupDesc, /1846 til 1876/);
assert.match(byleksikon.relevance, /selve Torggata fra Stortorvet til Ankertorget/);

const toi = items[1];
assert.strictEqual(toi.year, 2017);
assert.strictEqual(toi.type, 'forskningsrapport');
assert.strictEqual(toi.author, 'Torkel Bjørnskau, Oddrun Helen Hagen og Ole Aasvik');
assert.match(toi.url, /^https:\/\/www\.toi\.no\/publikasjoner\/sykling-i-gagater/);
assert.match(toi.popupDesc, /videoregistreringer, fartsmålinger og registrerte interaksjoner/);
assert.match(toi.access_note, /åpent sammendrag og lenke til hele rapporten/);

const nla = items[2];
assert.strictEqual(nla.year, 2014);
assert.strictEqual(nla.date_type, 'project_completion');
assert.strictEqual(nla.publication, 'Norske landskapsarkitekters forening (NLA)');
assert.strictEqual(nla.url, 'https://landskapsarkitektur.no/prosjekter/torggata');
assert.match(nla.popupDesc, /asymmetriske gateprofilen/);

const manifestEntry = 'oslo/lesespor_oslo_by.json';
assert.strictEqual(manifest.files.filter(file => file === manifestEntry).length, 1);
assert(!manifest.files.includes('oslo/lesespor_oslo_by_torggata.json'));

assert.match(runtime, /list\(item\?\.place_ids\)\.map\(text\)\.includes\(placeId\)/);
assert.match(runtime, /paywall.*subscription.*subscriber.*abonnement.*betalingsmur.*krever abonnement/);
assert.match(runtime, /Ingen åpne Lesespor for dette stedet ennå/);
assert.match(runtime, /hg-place-reading-list/);
assert.match(runtime, /Les teksten ↗/);

assert.match(audit, /Alle 14 Oslo-filer/);
assert.match(audit, /Ingen manifest-lastet Torggata-oppføring fantes/);
assert.match(audit, /Oslo byleksikon[\s\S]*Publisert/);
assert.match(audit, /Transportøkonomisk institutt[\s\S]*Publisert/);
assert.match(audit, /Norske landskapsarkitekters forening[\s\S]*Publisert/);
assert.match(audit, /Torggata Bad-artikler[\s\S]*Avvist som parent-place-spor/);
assert.match(audit, /artikkel- eller rapporttekst kopieres/);
assert.match(audit, /Automatiske tester[\s\S]*beviser ikke alene/);

const finding = backlog.findings.find(item => item.id === 'reading_trail_missing');
assert(finding);
assert.strictEqual(finding.workflow_status, 'RESOLVED_PHASE_7G');
assert.deepStrictEqual(finding.resolution.items, items.map(item => item.id));
assert.strictEqual(finding.resolution.source_owner, readingPath);
assert.strictEqual(finding.resolution.verified_at, '2026-08-14');
assert.strictEqual(backlog.sequence[0].status, 'RESOLVED');
assert.strictEqual(backlog.sequence[1].status, 'RESOLVED');
assert.strictEqual(backlog.sequence[2].status, 'RESOLVED');
assert.strictEqual(backlog.sequence[3].status, 'RESOLVED');
assert.deepStrictEqual(backlog.active_phase, {
  id: 'final_closeout',
  status: 'COMPLETED'
});

assert.match(workcard, /Gjenåpnet fase 7G Lesespor = LØST/);
assert.match(workcard, /Torggata = SLUTTFØRT, MERGET OG DEPLOYET/);
assert.match(workcard, /Ingen oppføring bruker Torggata Bad, Rockefeller eller Youngstorget som stedfortreder/);
assert.match(checklist, /Lesespor kan ikke godkjennes som tom\/N\/A/);
assert.match(checklist, /betalingslåst er ikke tilstrekkelig N\/A-grunn/);
