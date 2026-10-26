import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { JSDOM } from 'jsdom';
test('reopening the same hydrated place preserves the rendered QuizCard DOM',async()=>{
 const dom=new JSDOM('<div id="placeCard" data-current-place-id="hoyres_hus"></div><div id="pcFrontCardFlip"></div><div id="pcQuizCardContent" hidden></div><img id="pcQuizCardImage">',{url:'https://history-go.test/',runScripts:'outside-only'});
 const w=dom.window,collection=JSON.parse(fs.readFileSync('data/quizcards/politikk/topp10_politikk_oslo_sentrum_six_pr6579.json','utf8'));
 w.TEST_MODE=true;w.visited={};w.openPlaceCard=async()=>true;
 w.DataHub={loadQuizCardsCollection:async p=>p==='politikk/manifest.json'?{collections:['six.json']}:p==='politikk/six.json'?collection:null};
 w.eval(fs.readFileSync('js/ui/place-card-quizcards-patch.js','utf8'));
 try {
  await w.openPlaceCard({id:'hoyres_hus'});
  const host=w.document.getElementById('pcQuizCardContent'),node=host.firstElementChild;
  w.document.getElementById('pcFrontCardFlip').classList.add('is-flipped');
  await w.openPlaceCard({id:'hoyres_hus'});
  assert.equal(host.firstElementChild,node,'same data must not detach the card being read');
  collection.cards.find(c=>c.targetId==='hoyres_hus').questions[0].question='Oppdatert spørsmål';
  await w.openPlaceCard({id:'hoyres_hus'});
  assert.notEqual(host.firstElementChild,node,'changed content must be rendered');
  assert.match(host.textContent,/Oppdatert spørsmål/);
 } finally{dom.window.close();}
});
