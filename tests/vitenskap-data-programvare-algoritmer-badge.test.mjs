import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';

const root = new URL('../', import.meta.url);
const manifest = JSON.parse(readFileSync(new URL('data/badges/vitenskap_data_programvare_algoritmer_candidate_v1.json',root),'utf8'));
const badge = JSON.parse(readFileSync(new URL('data/badges/vitenskap.json',root),'utf8'));
const previouslyActive = {
  naturvitenskap:'bilder/merker/vitenskap/brodert/naturvitenskap.webp',
  teknologi:'bilder/merker/vitenskap/brodert/teknologi.webp',
  matematikk:'bilder/merker/vitenskap/brodert/matematikk.webp',
  informasjonsteknologi:'bilder/merker/vitenskap/brodert/informasjonsteknologi.webp',
  forskning_og_metode:'bilder/merker/vitenskap/brodert/forskning_og_metode.webp',
  astronomi_og_fysikk:'bilder/merker/vitenskap/brodert/astronomi_og_fysikk.webp',
  kjemi_og_materialvitenskap:'bilder/merker/vitenskap/brodert/kjemi_og_materialvitenskap.webp',
  teknologi_og_ingeniorfag:'bilder/merker/vitenskap/brodert/teknologi_og_ingeniorfag.webp'
};

test('Data/programvare/algoritmer: previous science badges are preserved exactly',()=>{
  assert.equal(manifest.categoryId,'vitenskap');
  assert.equal(manifest.id,'data_programvare_og_algoritmer');
  assert.ok(badge.sub.includes(manifest.id));
  assert.equal(badge.image,manifest.baseCategoryImage);
  assert.equal(badge.color,'#6A5AE0');
  assert.equal(badge.secondaryColor,'#FFFFFF');
  for (const [id,path] of Object.entries(previouslyActive)) {
    assert.equal(badge.subBadgeImages[id],path,id+' was changed');
    assert.ok(existsSync(new URL(path,root)),id+' existing asset missing');
  }
  assert.equal(Object.keys(badge.subBadgeImages).length,manifest.status==='integrated'?9:8);
  assert.equal(badge.subBadgeImages[manifest.id],manifest.status==='integrated'?manifest.variants.nb.path:undefined);
});

test('Five translated science originals, no progress counter and locked hashes',()=>{
  assert.deepEqual(Object.keys(manifest.variants).sort(),['en','es','fr','nb','pt']);
  assert.equal(manifest.design.noProgressCounters,true);
  assert.equal(manifest.localesActive,false);
  for (const [lang,v] of Object.entries(manifest.variants)) {
    assert.match(v.path,/^bilder\/merker\/vitenskap\/(?:brodert|locales\/(?:en|es|fr|pt))\/data_programvare_og_algoritmer\.webp$/);
    assert.ok(v.bytes>1000);
    assert.match(v.gitBlobSha,/^[a-f0-9]{40}$/);
    assert.match(v.sha256,/^[a-f0-9]{64}$/);
    assert.ok(v.heading.length>5 && v.footer.length>3);
    assert.doesNotMatch(v.heading+v.footer,/\d+\/\d+/);
    const asset = new URL(v.path,root);
    if (manifest.status!=='integrated') {
      assert.equal(existsSync(asset),false,lang+' must remain pending until the binary is uploaded');
      continue;
    }
    const bytes=readFileSync(asset);
    assert.equal(bytes.toString('ascii',0,4),'RIFF');
    assert.equal(bytes.toString('ascii',8,12),'WEBP');
    assert.equal(bytes.readUIntLE(24,3)+1,1024);
    assert.equal(bytes.readUIntLE(27,3)+1,1024);
    assert.notEqual(bytes[20]&16,0,'alpha channel required');
    assert.equal(bytes.length,v.bytes);
    assert.equal(createHash('sha256').update(bytes).digest('hex'),v.sha256);
    const git = createHash('sha1').update(Buffer.from('blob '+bytes.length+'\0')).update(bytes).digest('hex');
    assert.equal(git,v.gitBlobSha);
  }
});
