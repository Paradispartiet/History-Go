import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import test from 'node:test';

const readJson = path => JSON.parse(fs.readFileSync(path, 'utf8'));

const placePath = 'data/places/historie/oslo/places_historie/gamle_aker_kirke.json';
const place = readJson(placePath);
const data = place.for_na;
const report = fs.readFileSync('reports/place-production/gamle-aker-kirke-historie-v1.md', 'utf8');

test('Gamle Aker har et stedsspesifikt Før/etter-par med ærlig tidsgrense', () => {
  assert.equal(place.id, 'gamle_aker_kirke');
  assert.equal(data.title, 'Samme sørside, nye omgivelser');
  assert.match(data.before, /1863–1883/);
  assert.match(data.before, /restaureringen i 1858–1861/);
  assert.match(data.now, /10\. februar 2008/);
  assert.match(data.change, /kontinuitet/);
  assert.match(data.change, /ikke et urørt middelalderbygg/);
  assert.match(data.change, /viser derfor ikke resultatet av rehabiliteringen i 2023–2024/);
  assert.equal(data.lookFor.length, 3);
  assert.ok(data.lookFor.some(item => /midttårnet/.test(item)));
  assert.ok(data.lookFor.some(item => /vinduer/.test(item)));
  assert.equal(data.sources.length, 4);
  assert.ok(data.sources.every(source => URL.canParse(source) && new URL(source).protocol === 'https:'));
});

test('Begge bilder er lokale, forskjellige og har inspectable rettighetsmetadata', () => {
  assert.notEqual(data.beforeImage, data.nowImage);
  assert.ok(fs.existsSync(data.beforeImage));
  assert.ok(fs.existsSync(data.nowImage));
  assert.ok(fs.statSync(data.beforeImage).size >= 40_000);
  assert.ok(fs.statSync(data.nowImage).size >= 200_000);

  const historicalHash = crypto.createHash('sha256').update(fs.readFileSync(data.beforeImage)).digest('hex');
  assert.equal(historicalHash, 'a70b79f842a18ff065dfeb99bcd1e98c2fad57945d988f292e94d6df19bf077b');

  assert.equal(data.beforeImageLabel, 'Sørsiden og kirkegården, ca. 1863–1883');
  assert.equal(data.beforeImageMeta.author, 'Ole Tobias Olsen / Oslo Museum');
  assert.equal(data.beforeImageMeta.license, 'CC BY-SA 4.0');
  assert.equal(data.beforeImageMeta.verified, true);
  assert.match(data.beforeImageMeta.sourcePage, /^https:\/\/commons\.wikimedia\.org\/wiki\/File:/);
  assert.match(data.beforeImageMeta.modifications, /uten oppskalering eller beskjæring/);

  assert.equal(data.nowImage, place.image);
  assert.equal(data.nowImageMeta.author, place.imageMeta.author);
  assert.equal(data.nowImageMeta.license, 'Public domain');
  assert.equal(data.nowImageMeta.verified, true);
  assert.match(data.nowImageMeta.sourcePage, /^https:\/\/commons\.wikimedia\.org\/wiki\/File:/);
});

test('Fasekortet holder Før/etter godkjent mens senere popupfaser går videre', () => {
  assert.match(report, /\| 3 \| Story-review og eventuell episodeproduksjon \| \*\*GODKJENT – PR #4652, merge `8ce0bc33263dbbcc7581c9b8316f8a483c60143b`\*\* \|/);
  assert.match(report, /\| 4 \| Før\/etter \| \*\*GODKJENT – PR #4654, merge `850c3b3332f857fb98593f36588bc46cfe6945eb`\*\* \|/);
  assert.match(report, /\| 5 \| Nyheter \| \*\*GODKJENT – PR #4656, merge `1ae7d30113134edc26394289a1afce0226f58246`\*\* \|/);
  assert.match(report, /\| 6 \| Lesespor \| \*\*GODKJENT – PR #4658, merge `c78cb05353bfb61eb68fef74ee9f115dfacc3a8b`\*\* \|/);
  assert.match(report, /bildet fra 2008 dokumenterer ikke resultatet av rehabiliteringen i 2023–2024/);
});
