import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';

const raw=p=>readFileSync(new URL('../'+p,import.meta.url));
const data=p=>JSON.parse(raw(p).toString('utf8'));
const manifest=data('data/badges/vitenskap_forskning_internal_locales_v3_20261112.json');
const active=data('data/badges/vitenskap.json');
const archive=data('data/badges/vitenskap_v2_locale_candidates_artwork_20261112.json');
const plan=data('data/badges/vitenskap_v2_localization_20261112.json');
const expected={
  en:['HYPOTHESIS','TEST','RESULT','CONCLUSION','METHOD','Sampling','Procedure','Measurement','Analysis','SAMPLE\nA-037'],
  es:['HIPÓTESIS','PRUEBA','RESULTADO','CONCLUSIÓN','MÉTODO','Muestreo','Procedimiento','Medición','Análisis','MUESTRA\nA-037'],
  pt:['HIPÓTESE','TESTE','RESULTADO','CONCLUSÃO','MÉTODO','Amostragem','Procedimento','Medição','Análise','AMOSTRA\nA-037']
};
test('three isolated research v3 candidates do not activate or replace existing science badges',()=>{
 assert.equal(manifest.schemaVersion,1);
 assert.equal(manifest.status,'three_separate_v3_candidates_not_active');
 assert.equal(manifest.activeBadgeImagesUnchanged,true);
 assert.equal(manifest.id,'forskning_og_metode');
 assert.equal(Object.keys(active.subBadgeImages).length,16);
 assert.equal(active.sub.length,16);
 assert.equal(archive.items.length,20);
 assert.equal(manifest.items.length,3);
 assert.deepEqual(manifest.items.map(x=>x.locale).sort(),Object.keys(expected));
 for(const m of manifest.items){
   assert.ok(m.path.startsWith('bilder/merker/vitenskap/kandidater/revisjoner/'+m.locale+'/'));
   assert.equal(m.path,'bilder/merker/vitenskap/kandidater/revisjoner/'+m.locale+'/forskning_og_metode-v3.webp');
   assert.notEqual(m.path,active.subBadgeImages.forskning_og_metode);
   assert.ok(archive.items.find(x=>x.path===m.source),'original v2 source retained');
   assert.equal(m.sameAlphaAsSource,true);
   assert.deepEqual(m.edits.map(x=>x.localizedText),expected[m.locale]);
   const bytes=raw(m.path);
   assert.equal(bytes.toString('ascii',0,4),'RIFF');
   assert.equal(bytes.toString('ascii',8,12),'WEBP');
   assert.equal(bytes.toString('ascii',12,16),'VP8X');
   assert.equal(bytes.readUIntLE(24,3)+1,1024);
   assert.equal(bytes.readUIntLE(27,3)+1,1024);
   assert.notEqual(bytes[20]&16,0);
   assert.equal(bytes.length,m.bytes);
   assert.equal(createHash('sha256').update(bytes).digest('hex'),m.sha256);
   assert.equal(createHash('sha1').update(Buffer.from('blob '+bytes.length+'\0')).update(bytes).digest('hex'),m.gitBlobSha);
   const base=plan.items.find(x=>x.id==='forskning_og_metode');
   assert.equal(base.variants[m.locale].status,'not_generated','original plan remains unchanged');
 }
});
