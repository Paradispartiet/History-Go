import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';

const read = file => fs.readFileSync(file, 'utf8');
const readJson = file => JSON.parse(read(file));
const sha256 = value => crypto.createHash('sha256').update(value, 'utf8').digest('hex');

const newsPath = 'data/leksikon/places/oslo/by/leksikon_oslo_by_birkelunden_news.json';
const news = readJson(newsPath);
const manifest = readJson('data/leksikon/manifest.json');
const runtime = read('js/ui/place-popup-tabs.js');
const audit = read('reports/place-production/birkelunden-phase7e-news-audit-v1.md');
const workcard = read('reports/place-production/birkelunden-workcard-current.md');
const place = readJson('data/places/by/oslo/places/birkelunden.json');

assert.ok(Array.isArray(news), 'Birkelunden-nyheter skal være en manifest-lastet artikkelliste');
assert.equal(news.length, 2, 'Fase 7E skal publisere to proporsjonale 2026-notiser');
assert.deepEqual(news.map(item => item.id), [
  'birkelunden_news_oslo_pix_utekino_2026',
  'birkelunden_news_bondens_marked_host_2026'
]);
assert.ok(news.every(item => item.place_id === 'birkelunden'));
assert.ok(news.every(item => item.type === 'news_note'));
assert.ok(news.every(item => item.version === 1));
assert.ok(news.every(item => item.verifiedAt === '2026-08-23'));
assert.ok(news.every(item => Array.isArray(item.tags) && item.tags.includes('news_note')));
assert.ok(news.every(item => Array.isArray(item.sources) && item.sources.length === 1));
assert.ok(news.every(item => /^https:\/\//.test(item.sources[0].url)));
assert.ok(news.every(item => String(item.popupDesc).length > 200));

const pix = news[0];
assert.equal(pix.date, '2026-08-25');
assert.equal(pix.date_type, 'scheduled_event');
assert.equal(pix.status, 'scheduled');
assert.equal(pix.valid_through, '2026-08-26');
assert.match(pix.popupDesc, /25\. og onsdag 26\. august 2026/);
assert.match(pix.popupDesc, /The Truman Show/);
assert.match(pix.popupDesc, /Thelma & Louise/);
assert.equal(
  pix.sources[0].url,
  'https://www.oslopix.no/no/arrangement/2026/kveldsvisninger-p%C3%A5-birkelunden-gratis-utekino'
);

const market = news[1];
assert.equal(market.date, '2026-09-13');
assert.equal(market.date_type, 'scheduled_event');
assert.equal(market.status, 'scheduled');
assert.equal(market.valid_through, '2026-12-13');
for (const expected of ['13. september', '18. oktober', '14. november', '13. desember 2026']) {
  assert.match(market.popupDesc, new RegExp(expected.replace('.', '\\.')));
}
assert.equal(
  market.sources[0].url,
  'https://bondensmarked.no/markedsplasser/birkelunden-gr-nerloekka'
);
assert.match(market.verification_note, /13\. september, 18\. oktober, 14\. november og 13\. desember 2026/);

assert.equal(manifest.files.filter(file => file === newsPath).length, 1);
const mainIndex = manifest.files.indexOf('data/leksikon/places/oslo/by/leksikon_oslo_by_birkelunden.json');
assert.ok(mainIndex >= 0, 'canonical Birkelunden Leksikon-fil skal finnes i manifestet');
assert.equal(manifest.files[mainIndex + 1], newsPath, 'nyhetsfilen skal ligge ved canonical Birkelunden-artikkel');

assert.match(runtime, /news_note.*nyere_notis.*incident/s);
assert.match(runtime, /return "news_notes"/);
assert.match(runtime, /renderNews\(buckets\.historical_news, buckets\.news_notes\)/);
assert.match(runtime, /Nyere notiser/);
assert.match(runtime, /hg-place-news-source/);

assert.match(audit, /Fersksøk 2026-08-23/);
assert.match(audit, /Oslo Pix Filmfestival[\s\S]*Publisert/);
assert.match(audit, /Bondens marked[\s\S]*Publisert/);
assert.match(audit, /Oslo kommune – Birkelunden[\s\S]*Holdt tilbake/);
assert.match(audit, /Tankesmien Agenda[\s\S]*Avvist/);
assert.match(audit, /Paulus' plass, Paulus kirke, Grünerløkka skole, Olaf Ryes plass, Sofienbergparken/);
assert.match(audit, /Automatiske tester[\s\S]*ikke alene bevise/);

assert.match(workcard, /7E Nyheter \| \*\*KLAR FOR REVIEW \/ CI\*\*/);
assert.match(workcard, /7F Lesespor \| \*\*NESTE – REELT RESEARCHHULL\*\*/);
assert.match(workcard, /Oslo Pix/);
assert.match(workcard, /Bondens marked/);

assert.equal(sha256(place.desc), 'ea8efd6ab0ed583485b2c87dd28e4dbb9af7766c32381f57e4cb6a54e9d94dbe');
assert.equal(sha256(place.popupDesc), '670dcbc8e37004fe1c3a595ae6af1a6dcfe304f1048ce906f37df3f7e8544ff7');
assert.equal(place.spatial_profile?.area_m2, 16300);

console.log('Birkelunden phase 7E news regression: PASS');
