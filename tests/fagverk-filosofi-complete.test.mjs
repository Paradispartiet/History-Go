import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const json=(p)=>JSON.parse(fs.readFileSync(path.join(ROOT,p),'utf8'));
const words=(s)=>String(s||'').trim().split(/\s+/).filter(Boolean).length;

const registry=json('data/fagverk/filosofi/filosofi_article_registry_v1.json');
const concepts=json('data/fag/filosofi/begreper_filosofi_canonical_v2.json');
const methods=json('data/fag/filosofi/methods_filosofi_canonical_v1.json');
const sources=json('data/fagverk/filosofi/filosofi_sources_v1.json');
const completion=json('data/fagverk/filosofi/filosofi_completion_v1.json');
const audit=json('reports/fagverk/filosofi-complete-audit.json');
const sourceIds=new Set(sources.sources.map((s)=>s.id));
const conceptIds=new Set(concepts.concepts.map((c)=>c.id));
const methodIds=new Set(methods.methods.map((m)=>m.method_id));

const articles=registry.articles.map((row)=>json(row.file));
const chapters=registry.chapters.map((row)=>json(row.file));

test('Filosofi har eksakt canonical fulltekstdekning',()=>{
  assert.equal(articles.length,54);
  assert.equal(chapters.length,13);
  assert.equal(conceptIds.size,162);
  assert.equal(methodIds.size,27);
  assert.equal(completion.complete_ready,true);
  assert.equal(completion.status,'complete');
  assert.equal(audit.status,'filosofi_complete');
});

test('alle 54 artikler har universitetsdybde, argument, metode og kilder',()=>{
  for(const article of articles){
    const prose=article.sections.flatMap((s)=>s.paragraphs||[]);
    assert.ok(words(prose.join(' '))>=1200,`${article.id} er for kort`);
    assert.ok(article.sections.length>=9,`${article.id} mangler seksjoner`);
    assert.ok(prose.length>=20,`${article.id} mangler fagavsnitt`);
    assert.equal(article.claims.length,6,`${article.id} skal ha seks typed claims`);
    assert.ok(article.source_ids.length>=2,`${article.id} mangler kildedybde`);
    assert.ok(article.source_ids.every((id)=>sourceIds.has(id)),`${article.id} har ukjent kilde`);
    assert.ok(article.method_ids.length>=1 && article.method_ids.every((id)=>methodIds.has(id)),`${article.id} har uløst metode`);
    assert.ok(article.concept_ids.length>=1 && article.concept_ids.every((id)=>conceptIds.has(id)),`${article.id} har uløst begrep`);
    assert.ok(article.claims.every((c)=>c.source_ids?.length>=2 && c.source_ids.every((id)=>sourceIds.has(id))),`${article.id} har claim uten løste kilder`);
    assert.ok(article.sections.some((s)=>s.id==='argument'),`${article.id} mangler argumentrekonstruksjon`);
    assert.ok(article.sections.some((s)=>s.id==='uenighet'),`${article.id} mangler reell innvending`);
    assert.ok(article.sections.some((s)=>s.id==='metode'),`${article.id} mangler metode`);
    assert.ok(article.sections.some((s)=>s.id==='avgrensning'),`${article.id} mangler eksplisitt avgrensning`);
  }
});

test('alle 162 begreper er skrevet ut i faktisk artikkelprosa',()=>{
  const covered=new Set();
  for(const article of articles){
    const section=article.sections.find((s)=>s.id==='begreper');
    assert.ok(section,`${article.id} mangler begrepsseksjon`);
    assert.equal(section.paragraphs.length,article.concept_ids.length,`${article.id} har feil begrepsavsnitt`);
    article.concept_ids.forEach((id,i)=>{
      const label=concepts.concepts.find((c)=>c.id===id)?.label;
      assert.ok(section.paragraphs[i].includes(label),`${article.id} skriver ikke ut ${label}`);
      covered.add(id);
    });
  }
  assert.deepEqual([...covered].sort(),[...conceptIds].sort());
});

test('13 kapitler eier alle emneartikler uten duplikat',()=>{
  const ids=chapters.flatMap((c)=>c.article_ids||[]);
  assert.equal(ids.length,54);
  assert.equal(new Set(ids).size,54);
  assert.deepEqual([...new Set(ids)].sort(),articles.map((a)=>a.id).sort());
});

test('Filosofi-kildene er inspectable og rollebeskrevet',()=>{
  assert.ok(sources.sources.length>=39);
  for(const source of sources.sources){
    assert.match(source.url,/^https:\/\//,`${source.id} mangler inspectable URL`);
    assert.ok(source.publisher?.length>=3,`${source.id} mangler publisher`);
    assert.ok(source.use?.length>=40,`${source.id} mangler evidensrolle`);
  }
});

test('completion-auditen har ingen falske grønne porter',()=>{
  assert.ok(Object.keys(audit.gates).length>=13);
  assert.ok(Object.values(audit.gates).every((v)=>v===true));
  assert.equal(audit.summary.standalone_article_count,54);
  assert.equal(audit.summary.canonical_concept_count,162);
  assert.equal(audit.summary.chapter_count,13);
});
