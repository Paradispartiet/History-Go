#!/usr/bin/env node
/**
 * Generates production-shaped Place story payloads, read-only.
 * Never register these as active: visitor coordinates, radius and images are absent.
 */
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildOsloSixIntegrationPreview } from './build-oslo-six-integration-preview.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const load = path => JSON.parse(readFileSync(resolve(ROOT,path),'utf8'));
const fail = why => { throw new Error('Oslo six canonical staging: '+why); };
const EDITORIAL_FILE = 'reports/place-production/oslo-six-places-editorial-20261022.md';
const tick = String.fromCharCode(96);

function extractStory(text, id, name) {
  const heading='## '+name+' ('+tick+id+tick+')';
  const start=text.indexOf(heading);
  if(start<0) fail(id+': missing narrative heading');
  const after=text.slice(start+heading.length);
  const stop=after.indexOf('\n## ');
  const section=stop<0?after:after.slice(0,stop);
  const short='**Foreslått '+tick+'desc'+tick+' (ikke canonical):** ';
  const long='**Foreslått '+tick+'popupDesc'+tick+' (ikke canonical):**';
  const a=section.indexOf(short),b=section.indexOf(long);
  const end=section.indexOf('**Kilder, for individuell fulltekstreview:**');
  if(a<0||b<0||end<0||a>b||b>end) fail(id+': narrative markers invalid');
  const desc=section.slice(a+short.length,b).trim();
  const popupDesc=section.slice(b+long.length,end).trim();
  if(desc.length<110||popupDesc.length<600||popupDesc.split('\n\n').length<3)
    fail(id+': narrative text incomplete');
  return {desc,popupDesc};
}

export function buildOsloSixCanonicalStaging({
  integration = buildOsloSixIntegrationPreview(),
  geo = load('reports/place-production/oslo-six-geo-entrance-source-audit-20261022.json'),
  imageRights = load('reports/place-production/oslo-six-image-rights-shortlist-20261022.json'),
  imageAttribution = load('reports/place-production/oslo-six-generated-image-attribution-20261022.json'),
  imageVisualQA = load('reports/place-production/oslo-six-image-visual-qa-20261022.json'),
  portraitReview = load('reports/place-production/oslo-six-portrait-visual-review-20261023.json'),
  candidates = load('reports/place-production/oslo-six-geolocation-candidates-20261022.json'),
  editorialText = readFileSync(resolve(ROOT,EDITORIAL_FILE),'utf8')
}={}) {
  if(integration.publication_status!=='BLOCKED_PREVIEW_ONLY_NO_RUNTIME_WRITES'||
     geo.release_status!=='RESEARCH_ONLY_NO_COORDINATES_OR_PINS'||
     imageRights.status!=='SOURCE_PAGES_REVIEWED_15_CROPS_STAGED_NOT_REGISTERED'||
     candidates.status!=='RESEARCH_CANDIDATES_NO_CANONICAL_COORDINATES')
     fail('publication hold was removed');
  const images=new Map(imageRights.places.map(p=>[p.place_id,p]));
  const geoRows=new Map(geo.places.map(p=>[p.place_id,p]));
  const imageFiles=new Map(imageAttribution.places.map(p=>[p.place_id,p]));
  const imageReviews=new Map(imageVisualQA.per_place.map(p=>[p.place_id,p]));
  const roughLocations=new Map(candidates.places.map(p=>[p.place_id,p]));
  const portraitSelections=new Map(portraitReview.per_place.map(p=>[p.place_id,p]));
  if(portraitReview.status!=='SELECTED_CANDIDATES_IN_ARTIFACT_ONLY_ZERO_FRONTIMAGE_REGISTERED' ||
     portraitReview.constraints.candidates_checked_into_repository!==false ||
     portraitReview.constraints.release_allowed!==false ||
     portraitSelections.size!==5 || portraitReview.per_place.length!==5 ||
     portraitReview.rejected_industrial_place.place_id!=='kristiania_teglverk_bryn' ||
     portraitReview.rejected_industrial_place.portrait_candidate_created!==false)
    fail('portrait review must not imply image release');
  if(images.size!==6 || geoRows.size!==6 || roughLocations.size!==2 ||
     imageFiles.size!==5 || imageReviews.size!==5 ||
     imageAttribution.places.length!==5 || imageVisualQA.per_place.length!==5)
    fail('unexpected evidence coverage');
  const places=integration.places.map(p=>{
    const id=p.place_id,photo=images.get(id),point=geoRows.get(id);
    if(!photo||!point||point.coordinate!==null||point.radius_m!==null||
       p.canonical_place_registered||p.images_integrated||p.fagverk_registered)
       fail(id+': place prematurely activated');
    const story=extractStory(editorialText,id,p.name);
    const proof=roughLocations.get(id);
    if(proof&&(proof.public_entrance_coordinate_verified||proof.visitor_radius_m!==null))
      fail(id+': tentative point mistaken for verified entry');
    // Only five places have licensed image triplets. These are *candidates*,
    // not live Place image fields; the ordinary PlaceCard also needs its
    // own actually portrait frontImage and visible attribution.
    const assets=imageFiles.get(id);
    const reviewed=imageReviews.get(id);
    const portrait=portraitSelections.get(id);
    let stagedImages=null;
    if(id==='kristiania_teglverk_bryn') {
      if(assets||reviewed||portrait||photo.asset_paths?.length||photo.lead_candidate)
        fail(id+': unsafe factory photograph staged as a matching image');
    } else {
      if(!assets||!reviewed||!portrait||!photo.lead_candidate||
         assets.source_page!==photo.lead_candidate.page||
         assets.author!==photo.lead_candidate.author||
         assets.license!==photo.lead_candidate.license||
         !assets.license_url||assets.variants.length!==3||
         photo.asset_paths.length!==3)
        fail(id+': image attribution, ownership or crop coverage mismatch');
      const variants={};
      for(const v of assets.variants) {
        if(!['lead','card','popup'].includes(v.role)||variants[v.role]||
           v.path!=='bilder/places/auto/'+id+'__commons_'+v.role+'.webp'||
           !photo.asset_paths.includes(v.path)||!existsSync(resolve(ROOT,v.path))||
           !(v.width>v.height) || reviewed[v.role+'_status']!=='FRAMING_PASS')
          fail(id+': invalid, missing or unreviewed '+v.role+' image candidate');
        variants[v.role]=v.path;
      }
      if(Object.keys(variants).length!==3)
        fail(id+': incomplete image roles');
      const pair=portrait.candidate_sha256;
      if(portrait.source_page!==assets.source_page || portrait.author!==assets.author ||
         portrait.license!==assets.license ||
         !pair || !/^[a-f0-9]{64}$/.test(pair.center_original) ||
         !/^[a-f0-9]{64}$/.test(pair.offset_original) ||
         pair.center_original===pair.offset_original ||
         !['PASS_FRAMING','HOLD_ALTERNATIVE_SOURCE_OR_COMPOSITION'].includes(portrait.visual_decision) ||
         (portrait.visual_decision==='PASS_FRAMING' && !['center_original','offset_original'].includes(portrait.preferred_mode)) ||
         (portrait.visual_decision!=='PASS_FRAMING' && portrait.preferred_mode!==null))
        fail(id+': portrait metadata, image attribution or safe selection differs');
      stagedImages={
        publication_status:'STAGED_ONLY_NOT_BOUND',
        paths:variants,
        author:assets.author,
        license:assets.license,
        license_url:assets.license_url,
        source_page:assets.source_page,
        source_attribution_rendered:false,
        front_image_status:portrait.visual_decision==='PASS_FRAMING'?
          'REVIEWED_PORTRAIT_ARTIFACT_NOT_CHECKED_IN':'REJECTED_PORTRAIT_COMPOSITION',
        portrait_review_candidate:portrait.preferred_mode ? {
          mode:portrait.preferred_mode,
          sha256:pair[portrait.preferred_mode],
          artifact_id:portraitReview.artifact_id,
          artifact_only:true,
          runtime_registered:false
        }:null,
        note:'Three repository crops are landscape; portrait candidate is stored only as CI artifact and is NOT an approved runtime frontImage.'
      };
    }
    const fields={
      id,name:p.name,category:p.categoryId,
      lat:null,lon:null,r:null,
      desc:story.desc,popupDesc:story.popupDesc,
      image:'',frontImage:'',cardImage:''
    };
    return {
      id,publication_status:'STAGING_ONLY_NOT_PLAYABLE',
      proposed_canonical_fields:fields,
      visitor_address_reference:point.confirmed_address||null,
      geo_evidence_status:point.coordinate_status,
      provisional_site_poi_reference:proof?{...proof.provisional_poi,scope:proof.provisional_precision}:null,
      image_source_page_candidate:photo.lead_candidate?.page||null,
      image_license_candidate:photo.lead_candidate?.license||null,
      staged_image_candidates:stagedImages,
      quiz_candidate_count:p.fullquiz_preview.length,
      quizcard_candidate_count:p.quizcard_preview.length,
      fagverk_prepared:!!p.fagverk_preview,
      missing_release_checks:[
        'line_by_line_history_review','semantic_question_review',
        'safe_visitor_geopoint_and_radius','canonical_rule_preflight',
        'licensed_image_binding_and_attribution','separate_portrait_frontImage',
        'quiz_and_quizcard_activation',
        'fagverk_and_knowledge_registration','mobile_desktop_browser_qa'
      ]
    };
  });
  if(places.length!==6||places.reduce((n,p)=>n+p.quiz_candidate_count,0)!==133)
    fail('six places / 133 questions mismatch');
  return {
    schema:'history_go_oslo_six_unpublished_canonical_place_staging_v1',
    publication_status:'NOT_REGISTERED_NOT_PLAYABLE_NO_FILE_WRITES',
    note:'Never copy this output into live data/places unchanged.',
    editorial_source_file:EDITORIAL_FILE,
    places
  };
}
if (process.argv[1] && resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  try {
    const result=buildOsloSixCanonicalStaging();
    if(process.argv.includes('--json')) process.stdout.write(JSON.stringify(result,null,2)+'\n');
    else console.log('Six unpublished story-shaped Place drafts for review; 0 mapped or playable.');
  } catch(err){console.error(err);process.exitCode=1;}
}
