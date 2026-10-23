import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { buildOsloSixBrowserReviewHtml } from '../scripts/build-oslo-six-browser-review.mjs';

const text=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const load=p=>JSON.parse(text(p));
const readData=html=>{
  const match=html.match(/<script type="application\/json" id="review-data">([\s\S]*?)<\/script>/);
  assert.ok(match,'Browser QA page must include the constrained input payload');
  return JSON.parse(match[1]);
};
test('six-place browser review is strictly nonpublishing and renders all real content',()=>{
  const html=buildOsloSixBrowserReviewHtml();
  const d=readData(html);
  assert.equal(d.schema,'history_go_six_place_browser_review_v1');
  assert.equal(d.status,'BLOCKED_REVIEW_ONLY');
  assert.equal(d.noScorePersistence,true);
  assert.equal(d.noMapMarkers,true);
  assert.equal(d.places.length,6);
  assert.equal(d.places.reduce((sum,p)=>sum+p.quizcard.length,0),60);
  assert.equal(d.places.reduce((sum,p)=>sum+p.fullquiz.length,0),133);
  assert.equal(d.places.filter(p=>p.image).length,5);
  assert.equal(d.places.find(p=>p.id==='kristiania_teglverk_bryn').image,null);
  const attr=load('reports/place-production/oslo-six-generated-image-attribution-20261022.json');
  const images=new Map(attr.places.map(x=>[x.place_id,x]));
  for(const p of d.places){
    assert.ok(p.desc.length>=110&&p.popupDesc.length>=600,p.id);
    assert.ok(p.fagverk.article.length>=3);
    assert.equal(p.quizcard.length,10);
    assert.ok(p.quizcard.every(c=>p.fullquiz.some(q=>q.id===c.id)));
    assert.ok(p.fullquiz.every(q=>q.options.length===4&&q.answerIndex>=0&&q.answerIndex<4));
    const a=images.get(p.id);
    if(!a){assert.equal(p.image,null);continue;}
    assert.ok(p.image.lead.startsWith('../../bilder/'));
    assert.ok(p.image.card.startsWith('../../bilder/'));
    assert.ok(p.image.popup.startsWith('../../bilder/'));
    assert.equal(p.image.author,a.author);
    assert.equal(p.image.license,a.license);
    assert.equal(p.image.source_page,a.source_page);
  }
  assert.ok(html.includes('name="robots" content="noindex,nofollow"'));
  assert.ok(html.includes('0 av 6 spillbare'));
  assert.ok(html.includes('Utkast – ikke publisert'));
  assert.ok(!html.includes('https://fonts.googleapis.com'));
  assert.ok(!html.includes('window.openPlaceCard'));
  const script=text('js/ui/oslo-six-browser-review.js');
  assert.ok(!/\blocalStorage\b|\bsessionStorage\b|fetch\s*\(/.test(script));
  assert.ok(!/visited|visit.*completed|quiz.*score|recordProgress/i.test(script));
  assert.match(script,/window\.__HG_SIX_REVIEW__/);
  assert.match(text('css/oslo-six-browser-review.css'),/@media\(max-width:740px\)/);
});

test('tampering with publication gates breaks browser QA generator',()=>{
  // A release status is not valid input for a non-publishing browser preview.
  const invalidStaging={publication_status:'PUBLISHED',places:new Array(6).fill({})};
  assert.throws(()=>buildOsloSixBrowserReviewHtml({staging:invalidStaging}),/publication gates/);
});
