#!/usr/bin/env node
/**
 * Build a read-only browser review for the actual six-place content.
 * No quiz/Place/Fagverk manifests are written; browser output is QA only.
 */
import { writeFileSync,mkdirSync } from 'node:fs';
import { resolve,dirname,relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildOsloSixCanonicalStaging } from './build-oslo-six-canonical-place-drafts.mjs';
import { buildOsloSixIntegrationPreview } from './build-oslo-six-integration-preview.mjs';

const ROOT=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const TARGET=resolve(ROOT,'reports/place-production/oslo-six-browser-review.html');
const fail=s=>{throw Error('Oslo-six browser QA: '+s);};

export function buildOsloSixBrowserReviewHtml({
  staging=buildOsloSixCanonicalStaging(),
  integration=buildOsloSixIntegrationPreview()
}={}) {
  if(staging.publication_status!=='NOT_REGISTERED_NOT_PLAYABLE_NO_FILE_WRITES'||
     integration.publication_status!=='BLOCKED_PREVIEW_ONLY_NO_RUNTIME_WRITES'||
     staging.places.length!==6||integration.places.length!==6)
    fail('publication gates not safe');
  const quizzes=new Map(integration.places.map(p=>[p.place_id,p]));
  const places=staging.places.map(p=>{
    const q=quizzes.get(p.id);
    if(!q||q.public_release!==false||q.canonical_place_registered!==false||
       p.publication_status!=='STAGING_ONLY_NOT_PLAYABLE'||
       q.fullquiz_preview.some(x=>x.runtime_registered!==false)||
       q.quizcard_preview.some(x=>x.runtime_registered!==false))
      fail('runtime registered or mismatched '+p.id);
    const image=p.staged_image_candidates;
    if(p.id==='kristiania_teglverk_bryn'&&image!==null)fail('unsafe teglverk image');
    if(p.id!=='kristiania_teglverk_bryn'&&!image)fail('missing reviewed image '+p.id);
    const photo=image?{
      lead:'../../'+image.paths.lead,
      card:'../../'+image.paths.card,
      popup:'../../'+image.paths.popup,
      author:image.author,license:image.license,
      license_url:image.license_url,source_page:image.source_page
    }:null;
    return {
      id:p.id,name:p.proposed_canonical_fields.name,
      category:p.proposed_canonical_fields.category,
      desc:p.proposed_canonical_fields.desc,
      popupDesc:p.proposed_canonical_fields.popupDesc,
      geoStatus:p.geo_evidence_status,visitorAddress:p.visitor_address_reference,
      image:photo,
      quizcard:q.quizcard_preview.map(x=>({
        id:x.sourceQuestionId,question:x.question,options:x.options,
        answerIndex:x.answerIndex,knowledge:x.knowledge,source_urls:x.source_urls
      })),
      fullquiz:q.fullquiz_preview.map(x=>({
        id:x.id,question:x.question,options:x.options,
        answerIndex:x.answerIndex,knowledge:x.knowledge,source_urls:x.source_urls
      })),
      fagverk:q.fagverk_preview
    };
  });
  if(places.reduce((n,p)=>n+p.quizcard.length,0)!==60||
     places.reduce((n,p)=>n+p.fullquiz.length,0)!==133||
     places.filter(p=>p.image!==null).length!==5)
    fail('staging count and images mismatch');
  const data=JSON.stringify({
    schema:'history_go_six_place_browser_review_v1',
    status:'BLOCKED_REVIEW_ONLY',noScorePersistence:true,noMapMarkers:true,
    places
  }).replaceAll('<','\\u003c').replaceAll('>','\\u003e').replaceAll('&','\\u0026');
  return [
    '<!doctype html><html lang="nb"><head><meta charset="utf-8" />',
    '<meta name="viewport" content="width=device-width,initial-scale=1" />',
    '<meta name="robots" content="noindex,nofollow" />',
    '<title>History Go – seks steder · intern QA</title>',
    '<link rel="stylesheet" href="../../css/oslo-six-browser-review.css" />',
    '</head><body>',
    '<header><strong>HISTORY GO</strong> · Oslo seksstedsbolk</header>',
    '<main class="layout"><nav class="side" id="place-nav" aria-label="Velg sted"></nav>',
    '<article class="place"><div class="card">',
    '<div class="warning" role="note"><strong>Utkast – ikke publisert.</strong> Seks stedsfortellinger, quizutkast og bildekandidater. Ingen kartmarkører, besøk, poeng eller progresjon er aktivert. Kilde- og geokontroll gjenstår.</div>',
    '<p class="muted">Viser sted <span id="current-place"></span> · 0 av 6 spillbare</p>',
    '<h1 id="place-title"></h1><p class="lede" id="place-intro"></p>',
    '<div id="place-photo"></div><p class="muted" id="place-meta"></p>',
    '<div class="tabs" role="tablist" aria-label="Innholdsfane" id="review-tabs"></div>',
    '<section class="panel" id="review-content" aria-live="polite"></section>',
    '</div></article></main>',
    '<script type="application/json" id="review-data">'+data+'</script>',
    '<script src="../../js/ui/oslo-six-browser-review.js"></script>',
    '</body></html>'
  ].join('\n');
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  try{
    const html=buildOsloSixBrowserReviewHtml();
    if(process.argv.includes('--write')){
      mkdirSync(dirname(TARGET),{recursive:true});
      writeFileSync(TARGET,html);
      console.log('Wrote read-only QA page: '+relative(ROOT,TARGET));
    }else console.log('Six-place browser QA payload valid ('+html.length+' chars)');
  }catch(error){console.error(error);process.exitCode=1;}
}
