import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const load=path=>JSON.parse(readFileSync(new URL('../'+path,import.meta.url),'utf8'));
const pack=load('reports/place-production/oslo-six-fagverk-preintegration-20261022.json');
const gate=load('reports/place-production/oslo-six-places-integration-gates-20261022.json');

test('six individual Fagverk packages have real place-specific lessons and sources, not category fallbacks',()=>{
 assert.equal(pack.schema,'history_go_oslo_six_fagverk_preintegration_v1');
 assert.equal(pack.status,'STAGING_ONLY_NOT_IN_REGISTRY');
 assert.equal(pack.places.length,6);
 assert.deepEqual(pack.places.map(p=>p.place_id),gate.places.map(p=>p.place_id));
 const intros=new Set(),articles=new Set(),lensTitles=new Set(),traceTitles=new Set();
 for(const p of pack.places){
  const f=p.fagverk;
  assert.equal(p.canonical_place_bound,false,p.place_id);
  assert.equal(p.fagverk_registry_registered,false,p.place_id);
  assert.equal(p.fagverk_browser_qa_passed,false,p.place_id);
  assert.equal(p.source_claim_review,'pending_independent_line_by_line');
  assert.equal(p.categoryId,gate.places.find(x=>x.place_id===p.place_id).category_candidate);
  assert.equal(f.schema,'history_go_place_fagverk_v2');
  assert.equal(f.level,'standard');
  assert.equal(f.status,'in_production');
  assert.ok(f.intro.length>=70,p.place_id+': intro');
  assert.ok(!intros.has(f.intro),p.place_id+': reused intro');
  intros.add(f.intro);
  assert.equal(f.article.length,3,p.place_id);
  assert.equal(f.lenses.length,3,p.place_id);
  assert.equal(f.guiding_questions.length,4,p.place_id);
  assert.ok(f.concepts.length>=5,p.place_id);
  assert.equal(f.observable_traces.length,1,p.place_id);
  assert.ok(f.source_urls.length>=2,p.place_id);
  assert.ok(f.source_urls.every(s=>s.startsWith('https://')),p.place_id);
  assert.equal(new Set(f.source_urls).size,f.source_urls.length);
  assert.deepEqual(f.subject_ids,[p.categoryId]);
  assert.ok(f.emne_ids.length>=3,p.place_id);
  for(const [i,article] of f.article.entries()){
    assert.ok(article.length>=250,p.place_id+': paragraph '+i);
    assert.ok(!articles.has(article),p.place_id+': repeated article');
    articles.add(article);
    const lens=f.lenses[i];
    assert.equal(lens.subject_id,p.categoryId);
    assert.equal(lens.emne_id,f.emne_ids[i]);
    assert.equal(lens.evidence,article);
    assert.ok(lens.prompt.endsWith('?'));
    assert.ok(lens.title.length>=8);
    assert.ok(!lensTitles.has(lens.title),p.place_id+': reused lens');
    lensTitles.add(lens.title);
    assert.equal(f.guiding_questions[i],lens.prompt);
  }
  assert.ok(f.guiding_questions.every(x=>x.endsWith('?')));
  const trace=f.observable_traces[0];
  assert.ok(!traceTitles.has(trace.title),p.place_id+': reused trace');
  traceTitles.add(trace.title);
  assert.ok(trace.observation.length>=70);
  assert.ok(trace.interpretation_boundary.length>=70);
  assert.deepEqual(trace.source_urls,f.source_urls);
  const hold=gate.places.find(x=>x.place_id===p.place_id);
  assert.equal(hold.release_status,'BLOCKED');
  assert.equal(hold.publication_gates.fagverk_registry,false);
 }
});

test('teglverk study task cannot imply public access or a resolved 14/18 pin',()=>{
 const p=pack.places.find(x=>x.place_id==='kristiania_teglverk_bryn');
 assert.ok(p);
 const text=p.fagverk.article.join('\n')+'\n'+p.fagverk.observable_traces[0].observation+
  '\n'+p.fagverk.observable_traces[0].interpretation_boundary;
 assert.match(text,/14/);
 assert.match(text,/18/);
 assert.match(text,/privat/);
 assert.match(text,/Utsett all fysisk observasjonsoppgave/);
 assert.equal(gate.places.at(-1).geographical_anchor.status,'HOLD');
});
