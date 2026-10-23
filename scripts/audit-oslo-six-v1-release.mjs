#!/usr/bin/env node
/**
 * Read-only release readiness assessment for Oslo six.
 *
 * Distinguishes staged content/assets, preview-only Chromium QA, and live
 * published v1. No optimistic promotion based on a prepared quiz or image.
 */
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildOsloSixCanonicalStaging } from './build-oslo-six-canonical-place-drafts.mjs';
import { buildOsloSixIntegrationPreview } from './build-oslo-six-integration-preview.mjs';

const ROOT=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const load=p=>JSON.parse(readFileSync(resolve(ROOT,p),'utf8'));
const fail=x=>{throw Error('Oslo six v1 readiness: '+x);};

export function auditOsloSixV1Readiness({
  staging=buildOsloSixCanonicalStaging(),
  integration=buildOsloSixIntegrationPreview(),
  gates=load('reports/place-production/oslo-six-places-integration-gates-20261022.json'),
  activeManifest=load('data/places/manifest.json'),
  quizManifest=load('data/quiz/manifest.json')
}={}){
  if(staging.publication_status!=='NOT_REGISTERED_NOT_PLAYABLE_NO_FILE_WRITES'||
     integration.publication_status!=='BLOCKED_PREVIEW_ONLY_NO_RUNTIME_WRITES'||
     gates.safeguards.active_places!==0 || gates.safeguards.v1_certified!==0 ||
     staging.places.length!==6 || integration.places.length!==6 || gates.places.length!==6)
    fail('staging provenance or release holds differ from the canonical six-place audit');
  const preview=new Map(integration.places.map(x=>[x.place_id,x]));
  const gateRows=new Map(gates.places.map(x=>[x.place_id,x]));
  const publishedPaths=new Set(activeManifest.files);
  const registeredQuizIds=new Set((quizManifest.sets||[]).map(x=>x.targetId));
  const rows=staging.places.map(place=>{
    const id=place.id,content=preview.get(id),gate=gateRows.get(id);
    if(!content||!gate||gate.release_status!=='BLOCKED'||place.publication_status!=='STAGING_ONLY_NOT_PLAYABLE')
      fail('missing or released place '+id);
    const proposed=place.proposed_canonical_fields;
    const editorial={
      story: proposed.desc?.length>=110 && proposed.popupDesc?.length>=600,
      fullquiz_candidates: content.fullquiz_preview.length===(id==='linderud_gard'?28:21),
      quizcard_candidates: content.quizcard_preview.length===10,
      fagverk_draft: !!content.fagverk_preview?.article?.length,
      credited_landscape_triplet: place.staged_image_candidates?.publication_status==='STAGED_ONLY_NOT_BOUND'
    };
    const live={
      source_claim_review_approved:content.fullquiz_preview.every(x=>x.needs_independent_claim_review===false),
      approved_visitor_anchor:Number.isFinite(proposed.lat)&&Number.isFinite(proposed.lon)&&
        Number.isFinite(proposed.r)&&proposed.r>0,
      standing_frontImage:!!proposed.frontImage,
      canonical_place_in_manifest:[...publishedPaths].some(path=>path.endsWith('/'+id+'.json')),
      fullquiz_registered:registeredQuizIds.has(id),
      quizcard_registered:content.quizcard_preview.every(x=>x.runtime_registered===true),
      fagverk_registered:content.fagverk_registered===true,
      knowledge_synced:content.knowledge_synced===true,
      actual_live_app_browser_qa:content.browser_qa_passed===true
    };
    if(Object.values(live).some(Boolean)||
       Object.values(gate.publication_gates).some(Boolean)||
       gate.geographical_anchor.lat!==null||gate.geographical_anchor.lon!==null||
       gate.geographical_anchor.radius_m!==null)
      fail('unexpected partially activated release gate for '+id+'; reassess publication workflow');
    if(!editorial.story||!editorial.fullquiz_candidates||!editorial.quizcard_candidates||!editorial.fagverk_draft)
      fail('editorial candidate unexpectedly missing for '+id);
    const blockers=Object.entries(live).filter(([,ready])=>!ready).map(([k])=>k);
    if(!editorial.credited_landscape_triplet)blockers.push('credited_landscape_triplet');
    return {
      place_id:id,name:proposed.name,
      status:'STAGING_ONLY_NOT_V1',
      editorial,
      live,
      blocking_release_gates:blockers
    };
  });
  return {
    schema:'history_go_oslo_six_readiness_audit_v1',
    status:'RELEASE_BLOCKED_NO_ACTIVE_PLACE_WRITES',
    as_of:'2026-10-23',
    candidate_count:rows.length,
    story_drafts:rows.filter(x=>x.editorial.story).length,
    fullquiz_candidates:integration.fullquiz_candidate_count,
    quizcard_candidates:integration.quizcard_candidate_count,
    fagverk_drafts:rows.filter(x=>x.editorial.fagverk_draft).length,
    staged_credited_image_triplets:rows.filter(x=>x.editorial.credited_landscape_triplet).length,
    published_v1:0,
    note:'A successful standalone 390/1440px browser preview is not live History Go app QA.',
    places:rows
  };
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  try{
    const audit=auditOsloSixV1Readiness();
    if(process.argv.includes('--json'))process.stdout.write(JSON.stringify(audit,null,2)+'\n');
    else console.log('Six-place release check: '+audit.story_drafts+' stories, '+audit.staged_credited_image_triplets+
      ' credited photo triplets, '+audit.fullquiz_candidates+' fullquiz drafts; '+audit.published_v1+' live v1.');
  }catch(error){console.error(error);process.exitCode=1;}
}
