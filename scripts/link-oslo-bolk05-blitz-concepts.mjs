#!/usr/bin/env node
// Source-first canonical concept links for the 21 existing Blitzhuset questions.
// No new questions, answers, source claims, Fagverk emner or concept IDs are invented.
import fs from 'node:fs';
import assert from 'node:assert/strict';

const quizFile='data/quiz/subkultur/blitzhuset_sets.json';
const registryFile='data/knowledge/subjects/subkultur/concepts.generated.json';
const quiz=JSON.parse(fs.readFileSync(quizFile,'utf8'));
const registry=JSON.parse(fs.readFileSync(registryFile,'utf8'));
const byLabel=new Map(registry.concepts.map(c=>[c.label,c.concept_id]));
const mapping=[
 ['okkuperte rom','sted'],
 ['sted'],
 ['autonomi og motstand'],
 ['musikkscener og subkulturmiljøer'],
 ['øvingsrom og kjeller'],
 ['medier'],
 ['undergrunnsmiljø'],
 ['faktisk bruk vs juridisk eierskap'],
 ['motstand'],
 ['institusjonalisering'],
 ['kontinuitet vs retrospektiv rekonstruksjon'],
 ['relativ autonomi vs isolasjon'],
 ['grunnbegreper i subkultur'],
 ['bakromsinfrastruktur vs offentlig arena'],
 ['dokumentasjon og arkiv'],
 ['dokumentasjon og arkiv','historiemakt'],
 ['bevart materiale vs representativ fortid'],
 ['graffiti som praksis vs bilde som estetikk'],
 ['dokumentasjon og arkiv'],
 ['kollektivt minne vs dokumentert historisk mangfold'],
 ['subkultur vs scene vs motkultur']
];
assert.equal(quiz.targetId,'blitzhuset');
assert.equal(quiz.categoryId,'subkultur');
assert.equal(quiz.sets.length,3);
const questions=quiz.sets.flatMap(s=>s.questions);
assert.equal(questions.length,21);
let updates=0;
for(const [i,q] of questions.entries()){
  assert.equal(q.targetId,'blitzhuset');
  assert.equal(q.categoryId,'subkultur');
  assert.ok(q.knowledge_unit_ids?.length>0 && q.knowledge_link_status==='linked',
    'Canonical Knowledge link missing '+q.id);
  const ids=mapping[i].map(label=>{
    const id=byLabel.get(label);
    assert.ok(id,'Unknown canonical concept '+label);
    return id;
  });
  assert.equal(new Set(ids).size,ids.length);
  if(q.concept_ids?.length && JSON.stringify(q.concept_ids)!==JSON.stringify(ids)){
    throw Error('Preexisting, different concept binding on '+q.id);
  }
  if(JSON.stringify(q.concept_ids)!==JSON.stringify(ids)){
    q.concept_ids=ids;
    updates++;
  }
}
assert.equal(updates,21,'Expected exactly 21 previously unlinked questions');
fs.writeFileSync(quizFile,JSON.stringify(quiz,null,2)+'\n');
console.log('Blitzhuset concept binding: 21/21 questions, all IDs from canonical Subkultur registry');
