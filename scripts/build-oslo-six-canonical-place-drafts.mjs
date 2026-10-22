#!/usr/bin/env node
/**
 * Generates production-shaped Place story payloads, read-only.
 * Never register these as active: visitor coordinates, radius and images are absent.
 */
import { readFileSync } from 'node:fs';
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
  const roughLocations=new Map(candidates.places.map(p=>[p.place_id,p]));
  if(images.size!==6 || geoRows.size!==6 || roughLocations.size!==2)
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
    const fields={
      id,name:p.name,category:p.categoryId,
      lat:null,lon:null,r:null,
      desc:story.desc,popupDesc:story.popupDesc,
      image:'',cardImage:''
    };
    return {
      id,publication_status:'STAGING_ONLY_NOT_PLAYABLE',
      proposed_canonical_fields:fields,
      visitor_address_reference:point.confirmed_address||null,
      geo_evidence_status:point.coordinate_status,
      provisional_site_poi_reference:proof?{...proof.provisional_poi,scope:proof.provisional_precision}:null,
      image_source_page_candidate:photo.lead_candidate?.page||null,
      image_license_candidate:photo.lead_candidate?.license||null,
      quiz_candidate_count:p.fullquiz_preview.length,
      quizcard_candidate_count:p.quizcard_preview.length,
      fagverk_prepared:!!p.fagverk_preview,
      missing_release_checks:[
        'line_by_line_history_review','semantic_question_review',
        'safe_visitor_geopoint_and_radius','canonical_rule_preflight',
        'image_file_and_3_webp_derivatives','quiz_and_quizcard_activation',
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
