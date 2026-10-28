import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read = p => JSON.parse(readFileSync(p, 'utf8'));

const cases=[
  {id:'vigelandsparken',place:'data/places/by/oslo/places/vigelandsparken.json',quiz:'data/quiz/by/vigelandsparken_sets.json',cards:'data/quizcards/by/topp10_by_kort_batch6.json',full:45},
  {id:'uranienborg_kirke',place:'data/places/by/oslo/places/uranienborg_kirke.json',quiz:'data/quiz/by/uranienborg_kirke_oslo_v1_sets.json',cards:'data/quizcards/by/oslo_bolk02_kirker_oyer_20261025.json',full:10},
  {id:'ulvoya',place:'data/places/by/oslo/places/ulvoya.json',quiz:'data/quiz/by/ulvoya_oslo_v1_sets.json',cards:'data/quizcards/by/oslo_bolk02_kirker_oyer_20261025.json',full:10}
];
for(const s of cases){
  test(s.id+' – preserves sourced Commons photo for full-sized frontImage',()=>{
    const p=read(s.place);
    assert.equal(p.id,s.id);
    assert.equal(p.frontImage,p.image);
    assert.equal(p.cardImage,p.image);
    assert.ok(p.image.startsWith('https://commons.wikimedia.org/wiki/Special:Redirect/file/'));
    assert.equal(p.frontImageMeta.source,'wikimedia_commons');
    assert.equal(p.imageMeta.source,'wikimedia_commons');
    assert.equal(p.frontImageMeta.sourcePage,p.imageSourceUrl);
    assert.equal(p.imageMeta.sourcePage,p.imageSourceUrl);
    assert.equal(p.frontImageMeta.creator,p.imageCredit.split(' / ')[0]);
    assert.equal(p.frontImageMeta.credit,p.imageCredit);
    assert.equal(p.frontImageMeta.license,p.imageLicense);
    assert.equal(p.frontImageMeta.licenseUrl,p.imageLicenseUrl);
    assert.ok(p.fagverk.article.length>=3);
  });
  test(s.id+' – existing ten QuizCard questions still agree with active fullquiz',()=>{
    const q=read(s.quiz).sets.flatMap(x=>x.questions), cards=read(s.cards).cards.filter(c=>c.targetId===s.id);
    assert.equal(q.length,s.full);
    assert.equal(cards.length,1);
    assert.equal(cards[0].questions.length,10);
    for(const c of cards[0].questions){
      const src=q.find(x=>x.id===c.sourceQuestionId);
      assert.ok(src);
      assert.equal(c.question,src.question);
      assert.deepEqual(c.options,src.options);
      assert.equal(c.answer,src.answer);
      assert.equal(c.primary_knowledge_unit_id,src.primary_knowledge_unit_id);
    }
  });
}
