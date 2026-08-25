const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const read = relativePath => fs.readFileSync(path.join(repo, relativePath), 'utf8');
const readJson = relativePath => JSON.parse(read(relativePath));

const newsPath = 'data/leksikon/places/oslo/by/leksikon_oslo_by_torggata_news.json';
const news = readJson(newsPath);
const manifest = readJson('data/leksikon/manifest.json');
const backlog = readJson('reports/place-production/torggata-quality-improvement-backlog-v1.json');
const runtime = read('js/ui/place-popup-tabs.js');
const audit = read('reports/place-production/torggata-phase7f-news-audit-v1.md');
const workcard = read('reports/place-production/torggata-workcard-current.md');
const checklist = read('docs/PLACE_PRODUCTION_CHECKLIST_REFERENCE_V1.md');

assert(Array.isArray(news), 'Torggata-nyheter skal være en manifest-lastet artikkelliste');
assert.strictEqual(news.length, 2, 'Fase 7F skal publisere to proporsjonale 2026-notiser');
assert.deepStrictEqual(news.map(item => item.id), [
  'torggata_news_oslometer_2026',
  'torggata_news_torggatelangs_september_2026'
]);
assert(news.every(item => item.place_id === 'torggata'));
assert(news.every(item => item.type === 'news_note'));
assert(news.every(item => item.version === 1));
assert(news.every(item => item.verifiedAt === '2026-08-14'));
assert(news.every(item => Array.isArray(item.tags) && item.tags.includes('news_note')));
assert(news.every(item => Array.isArray(item.sources) && item.sources.length === 1));
assert(news.every(item => /^https:\/\//.test(item.sources[0].url)));
assert(news.every(item => String(item.popupDesc).length > 150));
assert(news.every(item => !/Torggata Bad|Rockefeller|Youngstorget/.test(item.popupDesc)), 'egne places skal ikke bære gate-notisene');

const oslometer = news[0];
assert.strictEqual(oslometer.date, '2026-08-01');
assert.strictEqual(oslometer.date_type, 'event_start');
assert.strictEqual(oslometer.status, 'active');
assert.strictEqual(oslometer.valid_through, '2026-10-31');
assert.match(oslometer.popupDesc, /1\. august til 31\. oktober 2026/);
assert.match(oslometer.popupDesc, /én meter kommunal gategrunn/);
assert.strictEqual(
  oslometer.sources[0].url,
  'https://www.oslo.kommune.no/gate-transport-og-parkering/leie-torg-fortau-og-gater/oslometer-pilot-2026/'
);

const torggatelangs = news[1];
assert.strictEqual(torggatelangs.date, '2026-09-19');
assert.strictEqual(torggatelangs.date_type, 'scheduled_event');
assert.strictEqual(torggatelangs.status, 'scheduled');
assert.match(torggatelangs.popupDesc, /19\. september 2026/);
assert.match(torggatelangs.popupDesc, /handel, servering og aktiviteter/);
assert.strictEqual(torggatelangs.sources[0].url, 'https://www.torggata.oslo.no/');
assert.match(torggatelangs.verification_note, /eldre aktivitetssiden med 2025-dato er ikke brukt/);

assert.strictEqual(manifest.files.filter(file => file === newsPath).length, 1);
const mainIndex = manifest.files.indexOf('data/leksikon/places/oslo/by/leksikon_oslo_by_torggata.json');
assert.strictEqual(manifest.files[mainIndex + 1], newsPath, 'nyhetsfilen skal ligge ved canonical Torggata-artikkel');

assert.match(runtime, /news_note.*nyere_notis.*incident/);
assert.match(runtime, /return "news_notes"/);
assert.match(runtime, /renderNews\(buckets\.historical_news, buckets\.news_notes\)/);
assert.match(runtime, /Nyere notiser/);
assert.match(runtime, /hg-place-news-source/);

assert.match(audit, /Fersksøk 2026-08-14/);
assert.match(audit, /Oslo kommune/);
assert.match(audit, /Torggata Gateforening/);
assert.match(audit, /Gateforeningens aktivitetsside[\s\S]*Avvist som 2026-kilde/);
assert.match(audit, /Lokale medier[\s\S]*Holdt tilbake/);
assert.match(audit, /Ingen notis bruker Torggata Bad eller Rockefeller[\s\S]*Ingen notis bruker Youngstorget/);
assert.match(audit, /Automatiske tester[\s\S]*beviser ikke alene/);

const finding = backlog.findings.find(item => item.id === 'news_missing');
assert(finding, 'Nyheter-funnet skal finnes');
assert.strictEqual(finding.workflow_status, 'RESOLVED_PHASE_7F');
assert.deepStrictEqual(finding.resolution.items, news.map(item => item.id));
assert.strictEqual(finding.resolution.source_owner, newsPath);
assert.strictEqual(finding.resolution.verified_at, '2026-08-14');
assert.strictEqual(backlog.sequence[0].status, 'RESOLVED');
assert.strictEqual(backlog.sequence[1].status, 'RESOLVED');
assert.strictEqual(backlog.sequence[2].status, 'RESOLVED');
assert.deepStrictEqual(backlog.active_phase, {
  id: 'final_closeout',
  status: 'READY_TO_MERGE'
});

assert.match(workcard, /Gjenåpnet fase 7F Nyheter = LØST/);
assert.match(workcard, /Torggata = SLUTTGODKJENT FOR CLOSEOUT-MERGE/);
assert.match(workcard, /Torggata Bad, Rockefeller og Youngstorget brukes ikke som stedfortredere/);
assert.match(checklist, /Nyheter kan ikke godkjennes som tom\/N\/A/);
assert.match(checklist, /nåtidsnotiser er ferskt kontrollert og har tydelig publiserings-\/hendelsesdato/);
