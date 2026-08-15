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
const coverage=json('data/fagverk/filosofi/filosofi_field_coverage_v1.json');
const audit=json('reports/fagverk/filosofi-complete-audit.json');
const sourceIds=new Set(sources.sources.map((s)=>s.id));
const conceptIds=new Set(concepts.concepts.map((c)=>c.id));
const methodIds=new Set(methods.methods.map((m)=>m.method_id));
const articles=registry.articles.map((row)=>json(row.file));
const chapters=registry.chapters.map((row)=>json(row.file));
const reviewed=articles.filter((article)=>article.editorial_quality==='university_depth_reviewed');
const E=coverage.expected_counts;
test('Filosofi beholder eksakt canonical dekning uten å forveksle dekning med universitetsdybde',()=>{
 assert.equal(articles.length,E.articles);assert.equal(chapters.length,E.chapters);assert.equal(conceptIds.size,E.concepts);assert.equal(methodIds.size,E.methods);
 assert.equal(completion.standalone_article_count,E.articles);assert.equal(completion.chapter_count,E.chapters);assert.equal(completion.canonical_concept_count,E.concepts);assert.equal(completion.canonical_method_count,E.methods);
});
test('alle artikler har solid strukturell baseline, men struktur er ikke kvalitetsproxy',()=>{for(const article of articles){
 const prose=article.sections.flatMap((s)=>s.paragraphs||[]);assert.ok(words(prose.join(' '))>=1200,article.id+' er for kort');assert.ok(article.sections.length>=9,article.id+' mangler seksjoner');assert.ok(prose.length>=20,article.id+' mangler fagavsnitt');assert.ok(article.claims.length>=5,article.id+' har for få claims');assert.ok(article.source_ids.length>=3,article.id+' mangler kildedybde');assert.ok(article.source_ids.every((id)=>sourceIds.has(id)),article.id+' har ukjent kilde');assert.ok(article.method_ids.length>=1&&article.method_ids.every((id)=>methodIds.has(id)),article.id+' har uløst metode');assert.ok(article.concept_ids.length>=1&&article.concept_ids.every((id)=>conceptIds.has(id)),article.id+' har uløst begrep');assert.ok(article.claims.every((c)=>c.source_ids?.length>=2&&c.source_ids.every((id)=>sourceIds.has(id))),article.id+' har claim uten løste kilder');for(const id of ['argument','uenighet','metode','avgrensning'])assert.ok(article.sections.some((s)=>s.id===id),article.id+' mangler '+id);
}});
test('completion er bare grønn når alle artikler er individuelt universitetsreviewet og feltbenchmarken er komplett',()=>{
 assert.equal(completion.reviewed_article_count,reviewed.length);assert.equal(completion.remaining_university_review_count,articles.length-reviewed.length);assert.equal(completion.complete_ready,reviewed.length===articles.length&&coverage.complete_ready);assert.equal(audit.gates.completeReadyHonest,true);assert.equal(audit.gates.universityDepthReviewedAllArticles,true);assert.equal(audit.gates.majorUniversityFieldsCovered,true);
});
test('alle canonicale begreper er skrevet ut i faktisk artikkelprosa',()=>{const covered=new Set();for(const article of articles){const section=article.sections.find((s)=>s.id==='begreper');assert.ok(section,article.id+' mangler begrepsseksjon');assert.equal(section.paragraphs.length,article.concept_ids.length,article.id+' har feil begrepsavsnitt');article.concept_ids.forEach((id,i)=>{const label=concepts.concepts.find((c)=>c.id===id)?.label;assert.ok(section.paragraphs[i].toLocaleLowerCase('nb').includes(label.toLocaleLowerCase('nb')),article.id+' skriver ikke ut '+label);covered.add(id);});}assert.deepEqual([...covered].sort(),[...conceptIds].sort());});
test('kapitlene eier alle emneartikler uten duplikat',()=>{const ids=chapters.flatMap((c)=>c.article_ids||[]);assert.equal(ids.length,E.articles);assert.equal(new Set(ids).size,E.articles);assert.deepEqual([...new Set(ids)].sort(),articles.map((a)=>a.id).sort());});
test('Filosofi-kildene er inspectable og rollebeskrevet',()=>{for(const source of sources.sources){assert.match(source.url,/^https:\/\//,source.id+' mangler inspectable URL');assert.ok(source.publisher?.length>=3,source.id+' mangler publisher');assert.ok(source.use?.length>=40,source.id+' mangler evidensrolle');}});
test('completion-auditen skiller strukturelle porter, universitetsdybde og feltdekning',()=>{for(const gate of ['canonicalCountsExact','allEmnersHaveStandaloneArticles','allConceptsWrittenOut','allDomainsHaveChapters','minimumArticleDepth','minimumSourceDepth','completeReadyHonest','majorUniversityFieldsCovered'])assert.equal(audit.gates[gate],true,'gate '+gate+' skal være grønn');assert.equal(audit.summary.standalone_article_count,E.articles);assert.equal(audit.summary.canonical_concept_count,E.concepts);assert.equal(audit.summary.chapter_count,E.chapters);});
