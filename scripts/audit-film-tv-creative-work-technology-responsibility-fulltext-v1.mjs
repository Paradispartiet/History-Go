#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ID = 'skapende-arbeid-teknologi-og-ansvar';
const NEXT = 'creative_work_technology_responsibility_full_chapter_complete_next_unit_source_brief';
const read = (p) => JSON.parse(fs.readFileSync(path.join(ROOT, p), 'utf8'));
const write = (p, v) => { fs.mkdirSync(path.dirname(path.join(ROOT,p)), {recursive:true}); fs.writeFileSync(path.join(ROOT,p), `${JSON.stringify(v,null,2)}\n`); };
const assert = (ok,m) => { if(!ok) throw new Error(m); };

export function auditFilmTvCreativeWorkTechnologyResponsibilityFulltextV1({writeReport=false,checkReport=true}={}) {
  const chapter=read(`data/fagverk/film_tv/${ID}.json`);
  const brief=read(`data/fagverk/film_tv/${ID}/brief.json`);
  const claims=read(`data/fagverk/film_tv/${ID}/claims.json`);
  const sourceBrief=read('data/fag/TV_og_Film/film_tv_creative_work_technology_responsibility_source_claim_brief_v1.json');
  const topicClaims=read('data/fag/TV_og_Film/film_tv_creative_work_technology_responsibility_topic_claims_v1.json');
  const plan=read('data/fag/TV_og_Film/film_tv_learning_order_plan_v1.json');
  const cases=read('data/fag/TV_og_Film/film_tv_creative_work_technology_responsibility_cases_v1.json');
  const registry=read('data/fagverk/fagverk_registry.json');
  const status=read('data/fagverk/subject_status.json');
  const modules=chapter.moduleFiles.map(read);
  const sections=modules.flatMap(m=>m.sections||[]);
  const paragraphs=sections.flatMap(s=>s.paragraphs||[]);
  const paragraphClaims=sections.flatMap(s=>s.paragraphClaimIds||[]).flat();
  const planned=new Set(topicClaims.topic_briefs.flatMap(t=>t.planned_claims.map(c=>c.id)));
  const final=new Set(claims.claims.map(c=>c.id));
  const sourceIds=new Set(claims.sources.map(s=>s.id));
  const used=new Set(claims.claims.flatMap(c=>c.source_ids));
  const unit=plan.planned_units.find(u=>u.id===ID);
  const reg=registry.subjects.film_tv.chapters.find(c=>c.id===ID);
  const film=status.subjects.find(s=>s.id==='film_tv');
  const combined=paragraphs.join(' ');
  const gates={
    exact_eleven_emne_coverage: unit?.emne_count===11 && isDeepStrictEqual(chapter.emne_ids,unit.emne_ids),
    four_modules_eleven_sections: modules.length===4 && sections.length===11 && sections.every(s=>s.emne_ids?.length===1),
    variable_scope: isDeepStrictEqual(modules.map(m=>m.sections.reduce((n,s)=>n+s.paragraphs.length,0)),[16,10,9,13]),
    forty_eight_paragraph_claims: paragraphs.length===48 && paragraphClaims.length===48 && new Set(paragraphClaims).size===48,
    forty_eight_verified_claims: claims.claims.length===48 && final.size===48 && isDeepStrictEqual(final,planned) && claims.claims.every(c=>c.status==='verified'&&c.claim_plan_id===c.id&&c.source_ids.length),
    twenty_nine_sources_used: claims.sources.length===29 && [...sourceIds].every(id=>used.has(id)) && claims.sources.every(s=>/^https:\/\//.test(s.url)&&s.source_location),
    twenty_three_cases: cases.cases.length===23 && chapter.workCases.length===23,
    canonical_methods: chapter.method_ids.length>0 && isDeepStrictEqual(brief.requiredMethodIds,chapter.method_ids),
    immutable_source_brief: sourceBrief.status==='source_claim_brief_complete_full_chapter_production' && sourceBrief.runtime_registration.registered===false,
    registered: reg?.file===`data/fagverk/film_tv/${ID}.json` && reg?.claimsFile===`data/fagverk/film_tv/${ID}/claims.json`,
    next_gate: film?.nextGate===NEXT,
    consent_boundary: /samtykke.{0,160}(utøverens|utøveren)/i.test(combined),
    safety_boundary: /aktivitet.{0,160}fare.{0,160}ekspon/i.test(combined),
    accessibility_boundary: /(brukerbehov|brukerkrav).{0,220}(testing|testet)|(testing|testet).{0,220}(brukerbehov|brukerkrav)/i.test(combined),
    carbon_boundary: /systemgrense/i.test(combined) && /(utslippsfaktor|faktorer som omregner)/i.test(combined),
    ai_effect_boundary: /jobbtap.{0,180}produktivit/i.test(combined) && /empirisk|målemetode/i.test(combined),
    next_unit_scope: /Finansiering, marked, eierskap, regulering og distribusjon/i.test(brief.scopeBoundary)
  };
  assert(Object.values(gates).every(Boolean),`Fulltekstporter feiler: ${Object.entries(gates).filter(([,v])=>!v).map(([k])=>k).join(', ')}`);
  const report={schema:'history_go_film_tv_creative_work_technology_responsibility_fulltext_v1_audit',version:'1.0.0',updated_at:'2026-08-13',status:'creative_work_technology_responsibility_chapter_verified_registered',subject_id:'film_tv',chapter_id:ID,summary:{emne_count:11,module_count:4,section_count:11,paragraph_count:48,verified_claim_count:48,used_source_count:29,case_count:23,method_count:chapter.method_ids.length},gates,next_gate:NEXT};
  const reportPath='reports/fagverk/film-tv-creative-work-technology-responsibility-fulltext-v1-audit.json';
  if(writeReport) write(reportPath,report);
  if(checkReport) assert(fs.existsSync(path.join(ROOT,reportPath))&&isDeepStrictEqual(read(reportPath),report),`${reportPath} er utdatert`);
  return report;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const a=new Set(process.argv.slice(2));
  try{const r=auditFilmTvCreativeWorkTechnologyResponsibilityFulltextV1({writeReport:a.has('--write-report'),checkReport:!a.has('--write-report')});console.log(`Film & TV enhet 9 fulltekst OK: ${r.summary.verified_claim_count} claims.`);}
  catch(e){console.error(`Film & TV enhet 9 fulltekst FEIL: ${e.message}`);process.exitCode=1;}
}
