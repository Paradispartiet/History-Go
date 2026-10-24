#!/usr/bin/env node
// Pre-production identity/source gate for PR #6578. This is NOT a v1 acceptance test.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const read=relative=>JSON.parse(fs.readFileSync(path.join(root,relative),'utf8'));
const ledger=read('reports/place-production/oslo-sentrum-kvadraturen-six-source-ledger-20261024.json');
assert.equal(ledger.schema,'history_go_oslo_kvadraturen_six_source_ledger_v1');
assert.equal(ledger.status,'research_only_not_published');
assert.equal(ledger.places.length,6);
assert.equal(ledger.publication_policy.v1_status,'NONE_APPROVED');
assert.equal(new Set(ledger.places.map(p=>p.place_id)).size,6);
const allPaths=new Set(read('data/places/manifest.json').files.map(p=>p.startsWith('data/')?p:'data/'+p));
const quizManifest=read('data/quiz/manifest.json');
const quizRefs=[...(quizManifest.sets||[]),...(quizManifest.targets||[])];
const quizCardSources={
  historie:read('data/quizcards/historie/manifest.json'),
  naeringsliv:read('data/quizcards/naeringsliv/manifest.json')
};
const report=[];
for(const p of ledger.places){
  assert.equal(allPaths.has(p.path),true,p.place_id+': canonical path absent from place manifest');
  assert.equal(fs.existsSync(p.path),true,p.place_id+': canonical Place missing');
  const place=read(p.path);
  assert.equal(place.id,p.place_id,p.place_id+': ID mismatch');
  assert.equal(place.category,p.category,p.place_id+': category mismatch');
  assert.ok(Number.isFinite(place.lat)&&Number.isFinite(place.lon),p.place_id+': no coordinates');
  assert.ok(typeof place.desc==='string'&&place.desc.length>50,p.place_id+': missing ingress');
  assert.ok(typeof place.popupDesc==='string'&&place.popupDesc.length>250,p.place_id+': missing historical article');
  assert.ok(p.sources.length>=1 && p.claims.length>=4,p.place_id+': insufficient traceable research');
  for(const [n,c] of p.claims.entries()){
    assert.equal(c.claim_id,p.place_id+'_source_'+String(n+1).padStart(2,'0'),p.place_id+': noncanonical claim id');
    assert.ok(c.statement.length>=40 && c.refs.length>=1,p.place_id+': empty or unreferenced claim');
    for(const ref of c.refs) assert.ok(Number.isInteger(ref)&&ref>=0&&ref<p.sources.length,p.place_id+': invalid citation index');
  }
  for(const url of p.sources) assert.match(url,/^https:\/\//);
  const relevantQuiz=quizRefs.filter(r=>r.targetId===p.place_id);
  const categoryQuizCardPaths=quizCardSources[p.category].collections.map(n=>'data/quizcards/'+p.category+'/'+n);
  const missingLegacyQuizCardFiles=categoryQuizCardPaths.filter(f=>!fs.existsSync(f));
  const categoryQuizCardMatches=categoryQuizCardPaths.filter(f=>
    fs.existsSync(f) && fs.readFileSync(f,'utf8').includes('"'+p.place_id+'"')
  );
  const articleReady=place.fagverk?.schema==='history_go_place_fagverk_v2' &&
    place.fagverk?.status==='curated' &&
    Array.isArray(place.fagverk?.article)&&place.fagverk.article.length>0;
  const visualReady=Boolean(place.frontImage&&place.image&&place.cardImage);
  report.push({id:p.place_id,canonical:true,sourceClaims:p.claims.length,quizSetFiles:relevantQuiz.map(z=>z.file),quizCardCollections:categoryQuizCardMatches,missingLegacyQuizCardFiles,fagverkReady:articleReady,visualFieldsReady:visualReady,notYetV1:!(relevantQuiz.length&&categoryQuizCardMatches.length&&articleReady&&visualReady)});
}
console.log(JSON.stringify({schema:'oslo_six_research_preflight_v1',status:'PASS_RESEARCH_IDENTITY_ONLY_NOT_V1',records:report},null,2));
