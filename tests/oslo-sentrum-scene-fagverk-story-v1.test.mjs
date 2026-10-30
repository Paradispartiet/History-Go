import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));const id='sentrum_scene';
test('Sentrum Scene Fagverk and story registration are canonical and source-backed',()=>{
 const p=read('data/places/musikk/oslo/places_musikk/sentrum_scene.json'),r=read('data/fagverk/fagverk_registry.json'),m=read('data/stories/stories_manifest_music_batch_01.json');
 assert.equal(p.fagverk.status,'curated');assert.equal(p.fagverk.level,'standard');assert.equal(p.fagverk.article.length,3);
 assert.equal(r.placeLinks[id].sourceFile,'places/musikk/oslo/places_musikk/sentrum_scene.json');
 assert.equal(m.files.filter(x=>x.entity_id===id&&x.path==='data/stories/stories_sentrum_scene.json').length,1);
 const urls=new Set(p.externalLinks.map(x=>x.url));
 for(const url of p.fagverk.source_urls)assert.ok(urls.has(url),url);
 const subjectIds=new Set(r.subjects.musikk.chapters.flatMap(x=>x.emne_ids));
 for(const emne of p.fagverk.emne_ids)assert.ok(subjectIds.has(emne),emne);
 const chapterIndex=new Map(r.subjects.musikk.chapters.map(ch=>[ch.id,ch]));
 assert.deepEqual(p.fagverk.chapter_ids,['historisk-musikkvitenskap-historiografi','institusjoner-okonomi-politikk-offentlighet']);
 for(const chapterId of p.fagverk.chapter_ids)assert.ok(chapterIndex.has(chapterId),`Dead canonical chapter: ${chapterId}`);
 const coveredByChapters=new Set(p.fagverk.chapter_ids.flatMap(chapterId=>chapterIndex.get(chapterId).emne_ids));
 for(const emne of p.fagverk.emne_ids)assert.ok(coveredByChapters.has(emne),`Unmapped music topic: ${emne}`);
 const runtime=read('data/runtime/place-open/sentrum_scene.json');
 assert.deepEqual(runtime.place.fagverk.chapter_ids,p.fagverk.chapter_ids,'Place-open Fagverk must match canonical chapter IDs');
 for(const lens of p.fagverk.lenses)assert.ok(subjectIds.has(lens.emne_id),lens.id);
 for(const img of [p.image,p.frontImage,p.cardImage])assert.ok(fs.existsSync(img),img);
});
test('Sentrum Scene retains correct 2005 Story chronology and 30/10 Knowledge+QuizCard',()=>{
 const story=read('data/stories/stories_sentrum_scene.json')[0];
 assert.equal(story.year,2005);assert.match(story.story,/1992/);assert.match(story.story,/1956/);
 const questions=read('data/quiz/musikk/sentrum_scene_sets_merged.json').sets.flatMap(s=>s.questions);
 assert.equal(questions.length,30);assert.equal(questions.filter(q=>q.knowledge_link_status==='linked').length,30);
 const card=read('data/quizcards/musikk/topp10_musikk_oslo_v1_batch01.json').cards.find(c=>c.targetId===id);
 assert.equal(card.questions.length,10);const byId=new Map(questions.map(q=>[q.id,q]));
 for(const cq of card.questions){const q=byId.get(cq.sourceQuestionId);assert.ok(q,cq.sourceQuestionId);assert.equal(q.question,cq.question);assert.equal(q.answer,cq.answer);assert.equal(q.quiz_id,cq.sourceQuizId);}
});
