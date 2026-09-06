#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const P={evidence:'data/fagverk/litteratur/maintenance/source-refresh-round8-2026-09-06.json',round7:'data/fagverk/litteratur/maintenance/source-refresh-round7-2026-09-06.json',claims:'data/fag/litteratur/litteraturvitenskap_canonical_v1/foundation_texts/leser_resepsjon_affekt/claims.json',materializer:'scripts/materialize-litteratur-reader-reception-full-field-v1.mjs',pathway:'data/quiz/litteratur/litteratur_subject_pathways_v1.json',knowledge:'data/knowledge/subjects/litteratur/knowledge_units.generated.json',coverage:'data/fag/litteratur/litteraturvitenskap_canonical_v1/coverage_contract_v1.json',status:'data/fagverk/subject_status.json'};
const BASELINE='4409604dee55932360f3ccb3fefb2d75824c7d83'; const AREA='leser_resepsjon_affekt';
const URLS={
 lr01:'https://www.press.jhu.edu/books/title/2456/act-reading',
 lr02:'https://www.upress.umn.edu/9780816610372/toward-an-aesthetic-of-reception/',
 lr03:'https://www.hup.harvard.edu/books/9780674467262',
 lr04:'https://www.routledge.com/The-Cultural-Politics-of-Emotion/Ahmed/p/book/9781138805033',
 lr05:'https://www.routledge.com/Textual-Poachers-Television-Fans-and-Participatory-Culture/Jenkins/p/book/9780415533294',
 lr06:'https://uncpress.org/9780807898857/reading-the-romance/',
 lr07:'https://www.gutenberg.org/ebooks/1260',
 lr08:'https://www.gutenberg.org/ebooks/2542',
 lr09:'https://www.gutenberg.org/ebooks/209',
 lr10:'https://www.gutenberg.org/ebooks/25344',
 lr11:'https://www.gutenberg.org/ebooks/1342',
 lr12:'https://www.transformativeworks.org/our-projects/archive-of-our-own/',
 lr13:'https://methods.sagepub.com/book/empirical-methods-for-the-study-of-literature-and-reading',
 lr14:'https://www.graywolfpress.org/books/citizen'
};
const DIRECT=new Set(['lr01','lr02','lr04','lr06','lr07','lr08','lr09','lr10','lr11','lr12','lr14']);
const CRAWLER=new Set(['lr03','lr05']); const FAIL=new Set(['lr13']);
const read=f=>JSON.parse(fs.readFileSync(path.join(ROOT,f),'utf8')); const text=f=>fs.readFileSync(path.join(ROOT,f),'utf8'); const assert=(c,m)=>{if(!c)throw new Error(m)}; const sid=id=>`src_lit_${AREA}_${id}`;

export function auditLitteraturMaintenanceSourceRefreshRound8(){
 const evidence=read(P.evidence),r7=read(P.round7),claims=read(P.claims),pathway=read(P.pathway),knowledge=read(P.knowledge),coverage=read(P.coverage),materializer=text(P.materializer),status=read(P.status).subjects.find(x=>x.id==='litteratur');
 assert(evidence.schema==='history_go_litteratur_maintenance_source_refresh_v1'&&evidence.round_id==='source_refresh_round8_2026_09_06','Feil round-8 identitet');
 assert(evidence.baseline_main_sha===BASELINE&&evidence.checked_at==='2026-09-06'&&evidence.status==='verified','Round 8 baseline/status mismatch');
 assert(evidence.scope?.area_id===AREA&&evidence.scope?.canonical_source_mutation===false&&evidence.scope?.maintenance_evidence_only===true,'Round 8 skal være evidence-only uten canonical source mutation');
 assert(evidence.scope?.new_strict_subcategory===false&&evidence.scope?.place_production===false,'Round 8 har utvidet scope');
 assert(r7.scope?.area_id==='sjanger_modus_form','Round 7 mangler foran round 8');
 assert(Array.isArray(evidence.source_checks)&&evidence.source_checks.length===14&&new Set(evidence.source_checks.map(x=>x.claims_source_id)).size===14,'Round 8 må ha 14 unike kildekontroller');
 assert(claims.chapter_id===AREA&&claims.sources.length===14&&new Set(claims.sources.map(x=>x.id)).size===14,'Leser/resepsjon-claims må ha 14 unike kilder');
 const expected=Object.keys(URLS).sort();
 assert(JSON.stringify(claims.sources.map(x=>x.id).sort())===JSON.stringify(expected),'Canonical source-ID-settet er endret');
 assert(JSON.stringify(evidence.source_checks.map(x=>x.claims_source_id).sort())===JSON.stringify(expected),'Evidensen dekker ikke eksakt source-ID-sett');
 assert(Array.isArray(evidence.verification_targets)&&evidence.verification_targets.includes(P.claims)&&evidence.verification_targets.includes(P.materializer)&&evidence.verification_targets.includes(P.pathway)&&evidence.verification_targets.includes(P.knowledge),'Round 8 verification targets er ufullstendige');
 assert(pathway.schema==='history_go_subject_pathway_package_v1'&&pathway.subject_id==='litteratur'&&pathway.sources.length===384&&new Set(pathway.sources.map(x=>x.source_id)).size===384&&pathway.sets.length===28,'Pathway 384/28-kontrakten driftet');
 const articleIds=pathway.sets.flatMap(s=>s.article_ids||[]); assert(articleIds.length===168&&new Set(articleIds).size===168,'Pathway må dekke 168 artikler eksakt én gang');
 assert(coverage.completion_definition?.required_area_count===28&&coverage.completion_definition?.required_topic_count===168,'Coverage 28/168-baseline flyttet');
 assert(knowledge.schema==='history_go_knowledge_unit_registry_v1'&&knowledge.subject_id==='litteratur'&&Array.isArray(knowledge.units)&&knowledge.units.length>0,'Generert Litteratur-Knowledge identitet feil');
 const cb=new Map(claims.sources.map(x=>[x.id,x])),eb=new Map(evidence.source_checks.map(x=>[x.claims_source_id,x])),pb=new Map(pathway.sources.map(x=>[x.source_id,x])); const ks=knowledge.units.flatMap(u=>Array.isArray(u.sources)?u.sources:[]);
 for(const [id,url] of Object.entries(URLS)){
   const c=cb.get(id),e=eb.get(id),p=pb.get(sid(id));
   assert(c?.url===url,`${id}: canonical claims URL drift`); assert(e?.canonical_url===url,`${id}: evidence URL drift`); assert(p?.url===url,`${id}: pathway root URL drift`); assert(materializer.includes(url),`${id}: reader-reception materializer mangler canonical URL`);
   const materialized=ks.filter(s=>s?.source_id===sid(id)); assert(materialized.every(s=>s?.url===url),`${id}: Knowledge har URL-drift`);
   if(DIRECT.has(id)) assert(e.verification_state==='verified_live'&&e.action==='retain_canonical_url',`${id}: direct-live evidens feil`);
   else if(CRAWLER.has(id)) assert(e.verification_state==='verified_live_crawler_restricted'&&e.action==='retain_canonical_url',`${id}: crawler-retention evidens feil`);
   else if(FAIL.has(id)) assert(e.verification_state==='retained_fail_closed_no_authoritative_replacement'&&e.action==='retain_until_authoritative_replacement_is_verified',`${id}: fail-closed evidens feil`);
   else throw new Error(`${id}: mangler statusgruppe`);
 }
 assert(evidence.summary?.canonical_sources_checked===14&&evidence.summary?.verified_live===11&&evidence.summary?.verified_live_crawler_restricted===2&&evidence.summary?.retained_fail_closed_no_authoritative_replacement===1&&evidence.summary?.canonical_url_replacements===0,'Round 8 summary feil');
 assert(Object.values(evidence.quality_gates||{}).length===11&&Object.values(evidence.quality_gates).every(Boolean),'Alle elleve round-8 quality gates må være sanne');
 assert(status?.navigationStatus==='materialized'&&status?.assessmentStatus==='audited'&&status?.editorialStatus==='complete'&&status?.nextGate==='maintenance_and_source_refresh','Litteratur completion-status driftet');
 return {status:'passed',round:8,area_id:AREA,sources_checked:14,canonical_url_replacements:0,direct_live:11,crawler_restricted_retained:2,fail_closed_retained:1,pathway_sources:pathway.sources.length,knowledge_units:knowledge.units.length,canonical_areas:pathway.sets.length,assessed_articles:new Set(articleIds).size,maintained_areas_total:8,next_gate:status.nextGate};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){try{const r=auditLitteraturMaintenanceSourceRefreshRound8();console.log(`Litteratur maintenance round 8 OK: ${r.sources_checked}/14 kilder, ${r.canonical_url_replacements} URL-erstatninger, ${r.direct_live} direkte live, ${r.crawler_restricted_retained} crawler-retentions, ${r.fail_closed_retained} fail-closed retention, ${r.pathway_sources} pathway-kilder, ${r.knowledge_units} Knowledge units og ${r.maintained_areas_total}/28 områder vedlikeholdt.`)}catch(error){console.error(`Litteratur maintenance round 8 FEIL: ${error.message}`);process.exitCode=1;}}
