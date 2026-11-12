import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';

const raw = path => readFileSync(new URL('../'+path, import.meta.url));
const json = path => JSON.parse(raw(path).toString('utf8'));
const b = json('data/badges/vitenskap.json');
const originals = json('data/badges/vitenskap_v2_candidates_20261112.json');
const all20 = json('data/badges/vitenskap_v2_locale_candidates_artwork_20261112.json');
const fr3 = json('data/badges/vitenskap_forskning_fr_internal_labels_v3.json');
const source = 'bilder/merker/vitenskap/kandidater/locales/fr/forskning_og_metode-v2.webp';

test('French research revision v3 remains a separate inactive science candidate',()=>{
 assert.equal(fr3.status,'individual_revised_candidate_requires_visual_approval');
 assert.equal(fr3.categoryId,'vitenskap');
 assert.equal(fr3.id,'forskning_og_metode');
 assert.equal(fr3.locale,'fr');
 assert.equal(fr3.source,source);
 assert.notEqual(fr3.path,source);
 assert.equal(b.subBadgeImages[fr3.id],'bilder/merker/vitenskap/brodert/forskning_og_metode.webp');
 assert.equal(b.sub.length,16);
 assert.equal(Object.keys(b.subBadgeImages).length,16);
 assert.equal(originals.items.length,5);
 assert.equal(all20.items.length,20);
 assert.ok(all20.items.some(it=>it.path===source),'original French v2 must remain byte-preserved');
 assert.ok(!Object.values(b.subBadgeImages).includes(fr3.path));
 assert.equal(fr3.activeBadgeUnchanged,true);
 assert.equal(fr3.originalAlphaPreserved,true);
});

test('French research v3 has authentic image and matched Git SHA, with French labels',()=>{
 const bytes=raw(fr3.path);
 assert.equal(bytes.toString('ascii',0,4),'RIFF');
 assert.equal(bytes.toString('ascii',8,12),'WEBP');
 assert.equal(bytes.toString('ascii',12,16),'VP8X');
 assert.equal(bytes.readUIntLE(24,3)+1,1024);
 assert.equal(bytes.readUIntLE(27,3)+1,1024);
 assert.ok((bytes[20] & 16)!==0);
 assert.equal(bytes.length,fr3.bytes);
 assert.equal(createHash('sha256').update(bytes).digest('hex'),fr3.sha256);
 assert.equal(createHash('sha1').update(Buffer.from('blob '+bytes.length+'\0')).update(bytes).digest('hex'),fr3.gitBlobSha);
 const labelMap=new Map(fr3.edits.map(x=>[x.meaning,x]));
 assert.equal(labelMap.size,10);
 for(const [meaning,expected] of [
  ['hypothesis sign','HYPOTHÈSE'],
  ['testing sign','TEST'],
  ['result sign','RÉSULTAT'],
  ['conclusion sign','CONCLUSION'],
  ['clipboard heading','MÉTHODE'],
  ['clipboard sampling','Échantillon'],
  ['clipboard procedure','Procédure'],
  ['clipboard measurement','Mesure'],
  ['clipboard analysis','Analyse'],
 ]) assert.equal(labelMap.get(meaning)?.frenchText,expected);
 assert.equal(labelMap.get('sample packet')?.frenchText,'PRÉLÈV.\nA-037');
 assert.notEqual(bytes.toString('hex').slice(0,100),raw(source).toString('hex').slice(0,100));
});
