#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const P={evidence:'data/fagverk/litteratur/maintenance/source-refresh-round9-2026-09-06.json',round8:'data/fagverk/litteratur/maintenance/source-refresh-round8-2026-09-06.json',claims:'data/fag/litteratur/litteraturvitenskap_canonical_v1/foundation_texts/forfatterskap_intertekstualitet/claims.json',materializer:'scripts/materialize-litteratur-authorship-textual-full-fields-v1.mjs',pathway:'data/quiz/litteratur/litteratur_subject_pathways_v1.json',knowledge:'data/knowledge/subjects/litteratur/knowledge_units.generated.json',coverage:'data/fag/litteratur/litteraturvitenskap_canonical_v1/coverage_contract_v1.json',status:'data/fagverk/subject_status.json'};
const BASELINE='ecf01f11564527fe3eed699b72b5c1a3140e42fe'; const AREA='forfatterskap_intertekstualitet';
const URLS={fa01:'https://shelleygodwinarchive.org/contents/frankenstein/',fa02:'https://shelleygodwinarchive.org/about/',fa03:'https://www.ibsen.uio.no/',fa04:'https://www.poetryfoundation.org/poems/47311/the-waste-land',fa05:'https://www.cambridge.org/core/books/paratexts/8E570577FE5C3C417DEB6B70EA8A714D',fa06:'https://www.routledge.com/Intertextuality/Allen/p/book/9780415596949',fa07:'https://cup.columbia.edu/book/desire-in-language/9780231048071',fa08:'https://www.gutenberg.org/ebooks/84',fa09:'https://www.gutenberg.org/ebooks/1257',fa10:'https://www.ndbooks.com/book/nox/',fa11:'https://link.springer.com/book/10.1007/978-3-030-90542-2',fa12:'https://www.pennpress.org/9780812237771/genetic-criticism/',fa13:'https://www.wumingfoundation.com/english/english_biography.htm',fa14:'https://whitmanarchive.org/'};
const DIRECT=new Set(['fa01','fa02','fa04','fa05','fa08','fa09','fa10','fa11','fa12','fa14']);
const RESTRICTED=new Set(['fa03','fa07']); const FAIL=new Set(['fa06','fa13']);
const read=f=>JSON.parse(fs.readFileSync(path.join(ROOT,f),'utf8')); const text=f=>fs.readFileSync(path.join(ROOT,f),'utf8'); const assert=(c,m)=>{if(!c)throw new Error(m)}; const sid=id=>`src_lit_${AREA}_${id}`;

export function auditLitteraturMaintenanceSourceRefreshRound9(){
 const evidence=read(P.evidence),r8=read(P.round8),claims=read(P.claims),pathway=read(P.pathway),knowledge=read(P.knowledge),coverage=read(P.coverage),materializer=text(P.materializer),status=read(P.status).subjects.find(x=>x.id==='litteratur');
 assert(evidence.schema==='history_go_litteratur_maintenance_source_refresh_v1'&&evidence.round_id==='source_refresh_round9_2026_09_06','Feil round-9 identitet');
 assert(evidence.baseline_main_sha===BASELINE&&evidence.checked_at==='2026-09-06'&&evidence.status==='verified','Round 9 baseline/status mismatch');
 assert(evidence.scope?.area_id===AREA&&evidence.scope?.canonical_source_mutation===false&&evidence.scope?.maintenance_evidence_only===true,'Round 9 skal være evidence-only');
 assert(evidence.scope?.new_strict_subcategory===false&&evidence.scope?.place_production===false,'Round 9 har utvidet scope');
 assert(r8.scope?.area_id==='leser_resepsjon_affekt','Round 8 mangler foran round 9');
 assert(Array.isArray(evidence.source_checks)&&evidence.source_checks.length===14&&new Set(evidence.source_checks.map(x=>x.claims_source_id)).size===14,'Round 9 må ha 14 unike kildekontroller');
 assert(claims.chapter_id===AREA&&claims.sources.length===14&&new Set(claims.sources.map(x=>x.id)).size===14,'Forfatterskap-claims må ha 14 unike kilder');
 const expected=Object.keys(URLS).sort();
 assert(JSON.stringify(claims.sources.map(x=>x.id).sort())===JSON.stringify(expected),'Canonical source-ID-settet er endret');
 assert(JSON.stringify(evidence.source_checks.map(x=>x.claims_source_id).sort())===JSON.stringify(expected),'Evidensen dekker ikke eksakt source-ID-sett');
 assert(Array.isArray(evidence.verification_targets)&&[P.claims,P.materializer,P.pathway,P.knowledge].every(x=>evidence.verification_targets.includes(x)),'Round 9 verification targets er ufullstendige');
 assert(pathway.schema==='history_go_subject_pathway_package_v1'&&pathway.subject_id==='litteratur'&&pathway.sources.length===384&&new Set(pathway.sources.map(x=>x.source_id)).size===384&&pathway.sets.length===28,'Pathway 384/28-kontrakten driftet');
 const articleIds=pathway.sets.flatMap(s=>s.article_ids||[]); assert(articleIds.length===168&&new Set(articleIds).size===168,'Pathway må dekke 168 artikler eksakt én gang');
 assert(coverage.completion_definition?.required_area_count===28&&coverage.completion_definition?.required_topic_count===168,'Coverage 28/168-baseline flyttet');
 assert(knowledge.schema==='history_go_knowledge_unit_registry_v1'&&knowledge.subject_id==='litteratur'&&Array.isArray(knowledge.units)&&knowledge.units.length>0,'Generert Litteratur-Knowledge identitet feil');
 const cb=new Map(claims.sources.map(x=>[x.id,x])),eb=new Map(evidence.source_checks.map(x=>[x.claims_source_id,x])),pb=new Map(pathway.sources.map(x=>[x.source_id,x])); const ks=knowledge.units.flatMap(u=>Array.isArray(u.sources)?u.sources:[]);
 for(const [id,url] of Object.entries(URLS)){
  const c=cb.get(id),e=eb.get(id),p=pb.get(sid(id)); assert(c?.url===url,`${id}: claims URL drift`); assert(e?.canonical_url===url,`${id}: evidence URL drift`); assert(p?.url===url,`${id}: pathway root URL drift`); assert(materializer.includes(url),`${id}: materializer mangler canonical URL`);
  assert(ks.filter(s=>s?.source_id===sid(id)).every(s=>s?.url===url),`${id}: Knowledge URL drift`);
  if(DIRECT.has(id)) assert(e.verification_state==='verified_live'&&e.action==='retain_canonical_url',`${id}: live evidens feil`);
  else if(RESTRICTED.has(id)) assert(e.verification_state==='verified_identity_endpoint_restricted'&&e.action==='retain_canonical_url',`${id}: restricted evidens feil`);
  else if(FAIL.has(id)) assert(e.verification_state==='retained_fail_closed_no_authoritative_replacement'&&e.action==='retain_until_authoritative_replacement_is_verified',`${id}: fail-closed evidens feil`);
  else throw new Error(`${id}: mangler statusgruppe`);
 }
 assert(evidence.summary?.canonical_sources_checked===14&&evidence.summary?.verified_live===10&&evidence.summary?.verified_identity_endpoint_restricted===2&&evidence.summary?.retained_fail_closed_no_authoritative_replacement===2&&evidence.summary?.canonical_url_replacements===0,'Round 9 summary feil');
 assert(Object.values(evidence.quality_gates||{}).length===11&&Object.values(evidence.quality_gates).every(Boolean),'Alle elleve round-9 quality gates må være sanne');
 assert(status?.navigationStatus==='materialized'&&status?.assessmentStatus==='audited'&&status?.editorialStatus==='complete'&&status?.nextGate==='maintenance_and_source_refresh','Litteratur completion-status driftet');
 return {status:'passed',round:9,area_id:AREA,sources_checked:14,canonical_url_replacements:0,direct_live:10,restricted_retained:2,fail_closed_retained:2,pathway_sources:pathway.sources.length,knowledge_units:knowledge.units.length,canonical_areas:pathway.sets.length,assessed_articles:new Set(articleIds).size,maintained_areas_total:9,next_gate:status.nextGate};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){try{const r=auditLitteraturMaintenanceSourceRefreshRound9();console.log(`Litteratur maintenance round 9 OK: ${r.sources_checked}/14 kilder, ${r.canonical_url_replacements} URL-erstatninger, ${r.direct_live} direkte live, ${r.restricted_retained} endpoint-retentions, ${r.fail_closed_retained} fail-closed retentions, ${r.pathway_sources} pathway-kilder, ${r.knowledge_units} Knowledge units og ${r.maintained_areas_total}/28 områder vedlikeholdt.`)}catch(error){console.error(`Litteratur maintenance round 9 FEIL: ${error.message}`);process.exitCode=1;}}
