import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read=path=>JSON.parse(fs.readFileSync(path,'utf8'));
const regions={
  innlandet:['dombas_stasjon_jernbaneknutepunkt','otta_stasjon_gudbrandsdalen','kongsvinger_stasjon_grensebanen','elverum_stasjon_jernbanemiljo','tynset_stasjon_rorosbanen','moelv_stasjon_mjoslinjen','stange_stasjon_dovrebanen','gran_stasjon_gjovikbanen','lena_stasjon_totenbanen','reinsvoll_stasjon_totenbanen','dokka_stasjon_valdresbanen','skarnes_stasjon_kongsvingerbanen','skreia_stasjon_totenbanen','flisa_stasjon_solorbanen','os_stasjon_rorosbanen'],
  vestfold:['faerder_fyr','sandefjord_kurbad','tollerodden_larvik','horten_stasjon_vestfoldbanen','tonsberg_stasjon_vestfoldbanen']
};
const manifest=read('data/quiz/manifest.json');
const cardManifest=read('data/quizcards/by/manifest.json');
const fagverk=read('data/fagverk/fagverk_registry.json');
const directDate=q=>/^(?:når|hvilket år|i hvilket år|fra hvilket år|fra hvilket tiår)\b/i.test(q.question)||/^(?:(?:i|fra)\s+)?(?:1\d{3}|20\d{2})(?:[-–]\d{2,4})?(?:-årene)?$/i.test(q.answer);

test('By04 covers 20 unique canonical places with linked Fagverk and attributable images',()=>{
  const ids=Object.values(regions).flat();
  assert.equal(ids.length,20);
  assert.equal(new Set(ids).size,20);
  for(const [region,placeIds] of Object.entries(regions))for(const id of placeIds){
    const path='data/places/by/'+region+'/'+id+'/'+id+'.json';
    const p=read(path);
    assert.equal(p.id,id);
    assert.equal(p.category,'by');
    assert.equal(p.fagverk?.status,'curated',id);
    assert.equal(p.fagverk?.article?.length,3,id);
    assert.equal(p.fagverk?.lenses?.length,3,id);
    assert.ok(p.fagverk?.source_urls?.length,id);
    assert.ok(p.image?.startsWith('https://commons.wikimedia.org/wiki/Special:Redirect/file/'),id);
    assert.equal(p.cardImage,p.image,id);
    assert.ok(p.imageCredit&&p.imageLicense&&p.imageSourceUrl&&p.imageLicenseUrl&&p.imageCaption,id);
    assert.equal(fagverk.placeLinks[id]?.sourceFile,'places/by/'+region+'/'+id+'/'+id+'.json',id);
  }
});

test('By04 fullquizzes and QuizCards have source parity, Knowledge, and balanced dates',()=>{
  for(const [region,ids] of Object.entries(regions)){
    const filename='regional_bolk04_'+region+'_v1_20261026.json';
    assert.equal(cardManifest.collections.filter(s=>s===filename).length,1);
    const collection=read('data/quizcards/by/'+filename);
    assert.equal(collection.cards.length,ids.length);
    for(const id of ids){
      const matches=collection.cards.filter(c=>c.targetId===id);
      assert.equal(matches.length,1,id);
      const card=matches[0],path='data/quiz/by/'+id+'_regional_v1_sets.json';
      assert.equal(card.sourceFile,path,id);
      assert.equal(manifest.sets.filter(e=>e.targetId===id&&e.file===path).length,1,id);
      const q=read(path),source=q.sets.flatMap(s=>s.questions||[]);
      assert.equal(source.length,10,id);
      assert.equal(card.questions.length,10,id);
      assert.equal(card.answerKey.length,10,id);
      assert.equal(card.questionCount,10,id);
      const sourceById=new Map(source.map(x=>[x.id,x]));
      let directDates=0;
      for(let i=0;i<10;i++){
        const entry=card.questions[i],src=sourceById.get(entry.sourceQuestionId);
        assert.ok(src,id+' missing source question');
        assert.equal(entry.question,src.question,id);
        assert.deepEqual(entry.options,src.options,id);
        assert.equal(entry.answer,src.answer,id);
        assert.equal(entry.answerIndex,src.answerIndex,id);
        assert.equal(entry.knowledge,src.knowledge,id);
        assert.deepEqual(entry.knowledge_unit_ids,src.knowledge_unit_ids,id);
        assert.ok(src.knowledge_unit_ids?.length,id+' Knowledge missing');
        assert.ok(src.source_urls?.length,id+' source missing');
        assert.ok(src.explanation?.length>=35,id+' short explanation');
        assert.equal(card.answerKey[i].answer,src.answer,id);
        assert.equal(src.answer,src.options[src.answerIndex],id);
        if(directDate(src))directDates++;
      }
      assert.ok(directDates<=2,id+' has '+directDates+' direct date questions');
    }
  }
});
