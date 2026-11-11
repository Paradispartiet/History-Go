import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, existsSync} from 'node:fs';
import {createHash} from 'node:crypto';

const root = new URL('../', import.meta.url);
const json = path => JSON.parse(readFileSync(new URL(path, root), 'utf8'));
const candidate = json('data/badges/vitenskap_teknologi_og_ingeniorfag_candidate_v1.json');
const parent = json('data/badges/vitenskap.json');

test('Vitenskap: ingeniørfag beholder hovedmerke og eksisterende undermerker', () => {
  assert.equal(parent.id, 'vitenskap');
  assert.equal(parent.color, '#6A5AE0');
  assert.equal(parent.secondaryColor, '#FFFFFF');
  assert.equal(parent.image, 'bilder/merker/vitenskap/brodert/vitenskap.webp');
  assert.equal(parent.sub.length, 16);
  assert.ok(parent.sub.includes('teknologi_og_ingeniorfag'));
  assert.equal(Object.keys(parent.subBadgeImages).length, candidate.status === 'integrated' ? 9 : 8);
  const originalSeven = {
    naturvitenskap:'bilder/merker/vitenskap/brodert/naturvitenskap.webp',
    teknologi:'bilder/merker/vitenskap/brodert/teknologi.webp',
    matematikk:'bilder/merker/vitenskap/brodert/matematikk.webp',
    informasjonsteknologi:'bilder/merker/vitenskap/brodert/informasjonsteknologi.webp',
    forskning_og_metode:'bilder/merker/vitenskap/brodert/forskning_og_metode.webp',
    astronomi_og_fysikk:'bilder/merker/vitenskap/brodert/astronomi_og_fysikk.webp',
    kjemi_og_materialvitenskap:'bilder/merker/vitenskap/brodert/kjemi_og_materialvitenskap.webp'
  };
  for (const [id, path] of Object.entries(originalSeven)) {
    assert.equal(parent.subBadgeImages[id],path,id+' existing badge path unchanged');
  }
  assert.equal(candidate.parentBadgeReference.path, parent.image);
  assert.equal(candidate.palette.primary, parent.color);
  assert.equal(candidate.palette.secondary, parent.secondaryColor);
  if (candidate.status !== 'integrated') {
    assert.equal(parent.subBadgeImages[candidate.id], undefined);
    assert.equal(candidate.quality.integrated, false);
    assert.equal(candidate.binaryTransfer.verifiedInRepository, false);
  } else {
    assert.equal(parent.subBadgeImages[candidate.id], candidate.sourceImage);
    assert.equal(candidate.quality.integrated, true);
    assert.equal(candidate.binaryTransfer.verifiedInRepository, true);
  }
});

test('Vitenskap: fem språkvarianter, korrekt tekst og ingen progresjonstall', () => {
  assert.deepEqual(Object.keys(candidate.variants).sort(), ['en','es','fr','nb','pt']);
  assert.deepEqual(Object.fromEntries(Object.entries(candidate.variants).map(([l,v]) => [l,[v.heading,v.footer]])), {
    nb:['TEKNOLOGI OG INGENIØRFAG','VITENSKAP'],
    en:['TECHNOLOGY AND ENGINEERING','SCIENCE'],
    es:['TECNOLOGÍA E INGENIERÍA','CIENCIA'],
    pt:['TECNOLOGIA E ENGENHARIA','CIÊNCIA'],
    fr:['TECHNOLOGIE ET INGÉNIERIE','SCIENCE']
  });
  assert.equal(candidate.design.typography.forbidProgressFraction, true);
  assert.equal(candidate.localesActive, false);
  for (const [lang, v] of Object.entries(candidate.variants)) {
    assert.equal(v.path.endsWith('teknologi_og_ingeniorfag.webp'), true, lang);
    assert.equal(/[0-9]/.test(v.heading + ' ' + v.footer), false, lang);
    assert.match(v.sha256, /^[a-f0-9]{64}$/);
    assert.match(v.gitBlobSha, /^[a-f0-9]{40}$/);
    assert.ok(v.bytes > 1000, lang);
  }
});

test('Vitenskap: låste WebP-originaler verifiseres når binærene er overført', () => {
  for (const [lang,v] of Object.entries(candidate.variants)) {
    const url = new URL(v.path, root);
    if (candidate.status !== 'integrated') {
      assert.equal(existsSync(url), false, lang + ' skal ikke aktiveres uten binær');
      continue;
    }
    const b = readFileSync(url);
    assert.equal(b.toString('ascii',0,4), 'RIFF', lang);
    assert.equal(b.toString('ascii',8,12), 'WEBP', lang);
    assert.equal(b.length,v.bytes,lang);
    assert.equal(b.readUIntLE(24,3)+1,1024,lang);
    assert.equal(b.readUIntLE(27,3)+1,1024,lang);
    assert.ok((b[20]&16)!==0,lang+' alpha');
    assert.equal(createHash('sha256').update(b).digest('hex'),v.sha256,lang);
    const blob = createHash('sha1').update(Buffer.from('blob '+b.length)).update(Buffer.from([0])).update(b).digest('hex');
    assert.equal(blob,v.gitBlobSha,lang);
  }
});
