import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';

const root=new URL('../',import.meta.url);
const get=(path)=>readFileSync(new URL(path,root));
const read=(path)=>JSON.parse(get(path).toString('utf8'));
const gitSha=(bytes)=>createHash('sha1').update(Buffer.from('blob '+bytes.length)).update(Buffer.from([0])).update(bytes).digest('hex');

const protectedFiles={
  'bilder/merker/historie.PNG':'b74e316e34af8a4009c1e53bc5d7bd3c96849f14',
  'bilder/merker/historie/undermerker/forhistorie-brodert-v1.webp':'cda06198c91da713a17bf84bdc26e4b7aea71d93',
  'bilder/merker/historie/undermerker/middelalder-brodert-v1.webp':'2837fae1f07d67b620a67551f7baf6de26a43f04',
  'bilder/merker/historie/undermerker/tidlig_modernetid-brodert-v1.webp':'d31a90232fc5d2b6754a5695db3da705af426184'
};

test('Historie-originalen og de tre ferdige merkene er byte-identiske',()=>{
  for(const [path,sha] of Object.entries(protectedFiles)) assert.equal(gitSha(get(path)),sha,path);
});


test('De tre integrerte Historie-merkene har tekst og riktig kategorifarge',()=>{
  const originals=[
    ['historie_forhistorie_candidate_v1.json','FORHISTORIE'],
    ['historie_middelalder_candidate_v1.json','MIDDELALDER'],
    ['historie_tidlig_modernetid_candidate_v1.json','TIDLIG MODERNE TID']
  ];
  const footers={nb:'HISTORIE',en:'HISTORY',es:'HISTORIA',pt:'HISTÓRIA',fr:'HISTOIRE'};
  for(const [filename,heading] of originals){
    const a=read('data/badges/'+filename);
    assert.equal(a.quality.integrated,true,filename);
    assert.equal(a.palette.primary,'#603E1E',filename);
    assert.equal(a.palette.secondary,'#D6A127',filename);
    assert.equal(a.palette.text,'#F5E8CE',filename);
    assert.equal(a.variants.nb.heading,heading,filename);
    for(const [lang,footer] of Object.entries(footers)){
      assert.ok(a.variants[lang].heading.trim().length>0,filename+' '+lang+' topptekst');
      assert.equal(a.variants[lang].footer,footer,filename+' '+lang+' bunntekst');
    }
  }
});

test('1800-tallet krever tydelig topp- og bunntekst i riktig Historie-palett',()=>{
  const c=read('data/badges/historie.json');
  const a=read('data/badges/historie_attenhundretallet_candidate_v1.json');
  assert.equal(c.image,'bilder/merker/historie.PNG');
  assert.equal(c.color,'#603E1E');
  assert.equal(c.secondaryColor,'#D6A127');
  assert.equal(c.sub.length,14);
  assert.equal(a.id,'attenhundretallet');
  assert.equal(a.parentBadgeReference.preserveExactOriginal,true);
  assert.deepEqual(Object.keys(a.variants),['nb','en','es','pt','fr']);
  assert.equal(a.palette.primary,c.color);
  assert.equal(a.palette.secondary,c.secondaryColor);
  assert.equal(a.palette.text,'#F5E8CE');
  assert.equal(a.design.typography.placement,'integrated_into_badge');
  assert.equal(a.design.typography.top,'1800-TALLET');
  assert.equal(a.design.typography.bottom,'HISTORIE');
  assert.equal(a.design.typography.legibleAtPixels,128);
  assert.equal(a.design.typography.translateBothFields,true);
  assert.equal(a.design.typography.forbidAdditionalNumbers,true);
  assert.equal(a.design.categoryPaletteContract.darkBrown,'#603E1E');
  assert.equal(a.design.categoryPaletteContract.ochreAccent,'#D6A127');
  assert.equal(a.design.categoryPaletteContract.lightText,'#F5E8CE');
  assert.deepEqual(Object.fromEntries(Object.entries(a.variants).map(([k,v])=>[k,[v.heading,v.footer]])),{
    nb:['1800-TALLET','HISTORIE'],
    en:['19TH CENTURY','HISTORY'],
    es:['SIGLO XIX','HISTORIA'],
    pt:['SÉCULO XIX','HISTÓRIA'],
    fr:['XIXe SIÈCLE','HISTOIRE']
  });
  if(a.quality.integrated){
    assert.equal(a.quality.visualApproved,true);
    assert.equal(a.quality.binaryVerified,true);
    for(const key of ['topTextChecked','bottomTextChecked','allFiveLocaleTextsChecked','historieBrownChecked','braidedEdgeChecked']){
      assert.equal(a.visualReview[key],true,key+' må verifiseres visuelt før aktivering');
    }
    assert.equal(c.subBadgeImages?.attenhundretallet,a.sourceImage);
    assert.equal(a.localesActive,false);
  }else{
    assert.equal(c.subBadgeImages?.attenhundretallet,undefined);
  }
});

test('1800-tallet: ingen delvis bildeoverføring; alle fem må være gyldige WebP',()=>{
  const a=read('data/badges/historie_attenhundretallet_candidate_v1.json');
  const files=Object.entries(a.variants).map(([lang,v])=>({lang,v,path:v.path}));
  const present=files.filter(x=>existsSync(new URL(x.path,root)));
  assert.ok(present.length===0||present.length===5,'Delvis opplasting av 1800-tallet er ikke tillatt');
  if(!present.length){
    assert.equal(a.quality.integrated,false);
    assert.equal(a.quality.binaryVerified,false);
    return;
  }
  for(const {lang,v,path} of files){
    const b=get(path);
    assert.equal(b.toString('ascii',0,4),'RIFF',lang);
    assert.equal(b.toString('ascii',8,12),'WEBP',lang);
    assert.equal(b.toString('ascii',12,16),'VP8X',lang);
    assert.equal(b.readUIntLE(24,3)+1,1024,lang+' width');
    assert.equal(b.readUIntLE(27,3)+1,1024,lang+' height');
    assert.ok(b[20]&0x10,lang+' må ha alfakanal');
    assert.equal(b.length,v.bytes,lang+' filstørrelse');
    assert.equal(createHash('sha256').update(b).digest('hex'),v.sha256,lang+' SHA-256');
    assert.equal(gitSha(b),v.gitBlobSha,lang+' Git SHA-1');
  }
  assert.equal(a.quality.binaryVerified,true);
});
