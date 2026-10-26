#!/usr/bin/env node
/** Register the four existing Oslo v1 candidates for branch-level integration QA.
 * No publication label or production completion is granted by this script.
 * May be used after the source bundle and original image assets are checked in.
 */
import fs from 'node:fs';
import path from 'node:path';
import {buildOsloFourV1Batch} from './build-oslo-four-v1-batch.mjs';
const ROOT=process.cwd();
const read=p=>JSON.parse(fs.readFileSync(path.join(ROOT,p),'utf8'));
const put=(p,o)=>{const file=path.join(ROOT,p);fs.mkdirSync(path.dirname(file),{recursive:true});
 fs.writeFileSync(file,JSON.stringify(o,null,2)+'\n');};
const batch=buildOsloFourV1Batch();
if(batch.length!==4||batch.reduce((n,x)=>n+x.quiz.sets.flatMap(s=>s.questions).length,0)!==91)throw Error('incomplete batch');
if(process.argv.includes('--sync-knowledge')){
 for(const item of batch){
  const quiz=read(item.quizPath),byId=new Map(quiz.sets.flatMap(s=>s.questions).map(q=>[q.id,q]));
  const cardPath=`data/quizcards/${item.place.category}/oslo_four_20261024.json`;
  const pack=read(cardPath),card=pack.cards.find(c=>c.targetId===item.id);
  if(!card)throw Error('missing card '+item.id);
  for(const row of card.questions){
    const q=byId.get(row.sourceQuestionId);
    if(!q?.primary_knowledge_unit_id||!q.knowledge_unit_ids?.length)
       throw Error('Knowledge not generated for '+item.id+' '+row.sourceQuestionId);
    row.primary_knowledge_unit_id=q.primary_knowledge_unit_id;
    row.knowledge_unit_ids=q.knowledge_unit_ids;
    row.knowledge_contract_version=q.knowledge_contract_version;
    row.knowledge_link_status='linked';
    row.concept_ids=q.concept_ids||[];
    row.term_ids=q.term_ids||[];
  }
  put(cardPath,pack);
 }
 console.log('Synced 40 QuizCard questions to 91 canonical quiz Knowledge units');
 process.exit(0);
}
if(!process.argv.includes('--write')){console.log('Use --write to prepare four active registries on this PR branch');process.exit(0);}
const placeManifest=read('data/places/manifest.json');
const quizManifest=read('data/quiz/manifest.json');
const historyCards=read('data/quizcards/historie/manifest.json');
const businessCards=read('data/quizcards/naeringsliv/manifest.json');
const registry=read('data/fagverk/fagverk_registry.json');
for(const entry of batch){
 const site=read(entry.placePath);
 const questionPack=read(entry.quizPath);
 if(site.id!==entry.id||questionPack.targetId!==entry.id)throw Error('candidate out of sync '+entry.id);
 const relative=entry.placePath.replace(/^data\//,'');
 if(!placeManifest.files.includes(relative))placeManifest.files.push(relative);
 if(!quizManifest.sets.some(q=>q.targetId===entry.id))
  quizManifest.sets.push({categoryId:site.category,targetId:entry.id,file:entry.quizPath});
 const imgs=[[site.image,site.imageMeta],[site.frontImage,site.frontImageMeta]];
 for(const [previewImage,meta] of imgs){
  if(!fs.existsSync(path.join(ROOT,previewImage)))throw Error('missing image '+previewImage);
  if(!meta?.author||!meta?.sourceUrl)throw Error('missing image credits '+entry.id);
  site.externalLinks.push({label:'Bildekilde – kreditering',type:'image_source',
    url:meta.sourceUrl,previewImage,credit:meta.author+' / '+meta.license,license:meta.license,licenseUrl:meta.licenseUrl});
 }
 site.fagverk.status='curated';
 site.coordNote+=' Dette er et kartbasert historisk referansepunkt; følg kun offentlig tilgjengelige gangarealer.';
 put(entry.placePath,site);
 registry.placeLinks[entry.id]={sourceFile:relative,field:'fagverk',schema:'history_go_place_fagverk_v2',level:'standard',status:'curated'};
}
if(!historyCards.collections.includes('oslo_four_20261024.json'))historyCards.collections.push('oslo_four_20261024.json');
if(!businessCards.collections.includes('oslo_four_20261024.json'))businessCards.collections.push('oslo_four_20261024.json');
put('data/places/manifest.json',placeManifest);
put('data/quiz/manifest.json',quizManifest);
put('data/quizcards/historie/manifest.json',historyCards);
put('data/quizcards/naeringsliv/manifest.json',businessCards);
put('data/fagverk/fagverk_registry.json',registry);
put('reports/place-production/oslo-four-onboarding-state-20261024.json',{
 schema:'oslo_four_onboarding_v1',batch:batch.map(x=>x.id),
 status:'ON_BRANCH_REGISTERED_PENDING_KNOWLEDGE_PRODUCTION_AUDIT_AND_BROWSER_QA',
 notes:['Approximate historical/address POI is a display marker, never a public entrance',
 'Kristiania Teglverk is private industry property; access by the public street only',
 'No v1 complete claim without Knowledge parity, preflight and actual browser QA']
});
console.log('Registered four locations in branch-level manifests; final app/Knowledge QA still required.');
