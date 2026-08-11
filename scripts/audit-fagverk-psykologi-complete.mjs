#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const NEXT_GATE='university_matrix_topic_articles_concept_registry_and_methods';
const P=Object.freeze({pensum:'data/fag/psykologi/psykologipensum_canonical_v4_5.json',methods:'data/fag/psykologi/methods_psykologi_canonical_v4_5.json',registry:'data/fagverk/fagverk_registry.json',status:'data/fagverk/subject_status.json',report:'reports/fagverk/psykologi-complete-audit.json'});
const ORDER=['psykisk_helse_institusjoner_behandling','fagtradisjoner_teori_sinnet','utvikling_oppvekst_laring','kognisjon_folelser_atferd','sosialpsykologi_normalitet_stigma','traume_krise_resiliens_omsorg'];
const abs=(f)=>path.join(ROOT,f),read=(f)=>JSON.parse(fs.readFileSync(abs(f),'utf8'));
const assert=(ok,m)=>{if(!ok)throw new Error(m);};
const projection=(r)=>({schema:r.schema,version:r.version,status:r.status,generatedFrom:r.generatedFrom,subject:r.subject,summary:r.summary,domainCoverage:r.domainCoverage,chapterIds:r.chapterIds,gates:r.gates,interpretation:r.interpretation});

export function auditPsykologiComplete({writeReport=false,checkReport=true}={}){
  for(const f of Object.values(P).filter((f)=>f!==P.report))assert(fs.existsSync(abs(f)),`Mangler ${f}`);
  const pensum=read(P.pensum),methodsDoc=read(P.methods),registry=read(P.registry),status=read(P.status);
  const subject=registry.subjects?.psykologi;assert(subject&&Array.isArray(subject.chapters),'Psykologi mangler i registry');
  const statusEntry=status.subjects.find((s)=>s.id==='psykologi');assert(statusEntry,'Psykologi mangler subject_status');
  assert(subject.chapters.length===6,'Psykologi må ha 6/6 kapitler i canonical baseline');
  assert(isDeepStrictEqual(subject.chapters.map((c)=>c.primary_domain_id),ORDER),'Kapittelrekkefølgen avviker fra canonical domeneorden');
  assert(statusEntry.editorialStatus==='expanded_and_audited','Psykologi må stå expanded_and_audited før universitetsporten er ferdig');
  assert(statusEntry.nextGate===NEXT_GATE,'Psykologi har feil universitetsport');
  assert(subject.editorialPlan?.nextGate===NEXT_GATE,'Registry har feil universitetsport');
  const methodIds=new Set(methodsDoc.methods.map((m)=>m.method_id));assert(methodIds.size===58,'Canonical metodefil skal ha 58 unike metoder');
  const canonicalEmnes=pensum.domains.flatMap((d)=>d.emne_ids||[]),canonicalEmneSet=new Set(canonicalEmnes);
  assert(canonicalEmnes.length===58&&canonicalEmneSet.size===58,'Canonical pensum skal ha 58 emner uten duplikater');
  let moduleCount=0,sectionCount=0,paragraphCount=0,claimCount=0,sourceCount=0,externalSourceCount=0;
  const seenEmnes=[];const domainCoverage={};const chapterIds=[];
  for(const [index,row] of subject.chapters.entries()){
    assert(fs.existsSync(abs(row.file)),`Mangler kapittelfil ${row.file}`);
    const chapter=read(row.file),domain=pensum.domains.find((d)=>d.domain_id===row.primary_domain_id);
    assert(domain,`Ukjent domene ${row.primary_domain_id}`);
    assert(row.primary_domain_id===ORDER[index],`Feil domene på kapittel ${row.id}`);
    assert(chapter.id===row.id&&chapter.primary_domain_id===domain.domain_id,`Registry/wrapper mismatch for ${row.id}`);
    assert(isDeepStrictEqual(chapter.emne_ids,domain.emne_ids),`${row.id} avviker fra canonical emnedekning`);
    assert(isDeepStrictEqual(chapter.method_ids,domain.method_ids),`${row.id} avviker fra canonical metodesett`);
    assert(chapter.method_ids.every((id)=>methodIds.has(id)),`${row.id} peker til ukjent metode`);
    assert(chapter.doNotDiagnosePeople===true,`${row.id} mangler diagnosevern`);
    assert(fs.existsSync(abs(chapter.claimsFile)),`${row.id} mangler claims-fil`);
    assert(fs.existsSync(abs(chapter.briefFile)),`${row.id} mangler brief-fil`);
    const claimsDoc=read(chapter.claimsFile),brief=read(chapter.briefFile),modules=(chapter.moduleFiles||[]).map((f)=>{assert(fs.existsSync(abs(f)),`${row.id} mangler modul ${f}`);return read(f);});
    assert(brief.safety?.doNotDiagnosePeople===true,`${row.id} brief mangler diagnosevern`);
    const sections=modules.flatMap((m)=>m.sections||[]),paragraphs=sections.flatMap((s)=>s.paragraphs||[]),traces=sections.flatMap((s)=>s.paragraphClaimIds||[]);
    const claims=claimsDoc.claims||[],sources=claimsDoc.sources||[],claimIds=new Set(claims.map((c)=>c.id)),sourceIds=new Set(sources.map((s)=>s.id));
    assert(modules.length>=3&&sections.length>=9,`${row.id} har for lite redaksjonelt innhold for canonical baseline`);
    assert(paragraphs.length===traces.length&&traces.every((ids)=>ids?.length),`${row.id} mangler paragraph claim trace`);
    assert(claims.every((c)=>c.source_ids?.length&&c.source_ids.every((id)=>sourceIds.has(id))),`${row.id} har uløst kildepeker`);
    assert(traces.flat().every((id)=>claimIds.has(id))&&claims.every((c)=>traces.flat().includes(c.id)),`${row.id} har ufullstendig claimspor`);
    const external=sources.filter((s)=>s.type!=='internal_place_record');assert(external.length>=15,`${row.id} har færre enn 15 eksterne kilder`);
    assert(sources.every((s)=>s.source_location&&s.label),`${row.id} har ufullstendig kildemetadata`);
    seenEmnes.push(...chapter.emne_ids);chapterIds.push(chapter.id);
    moduleCount+=modules.length;sectionCount+=sections.length;paragraphCount+=paragraphs.length;claimCount+=claims.length;sourceCount+=sources.length;externalSourceCount+=external.length;
    domainCoverage[domain.domain_id]={chapterId:chapter.id,emneCount:chapter.emne_ids.length,methodCount:chapter.method_ids.length,moduleCount:modules.length,paragraphCount:paragraphs.length,claimCount:claims.length,externalSourceCount:external.length};
  }
  assert(seenEmnes.length===58&&new Set(seenEmnes).size===58,'De seks kapitlene dekker ikke 58 emner nøyaktig én gang');
  assert(canonicalEmnes.every((id)=>seenEmnes.includes(id))&&seenEmnes.every((id)=>canonicalEmneSet.has(id)),'Kapittelunionen avviker fra canonical emner');
  assert(Object.keys(domainCoverage).length===6,'Ikke alle seks domener er representert');
  const report={schema:'history_go_fagverk_psykologi_canonical_baseline_audit_v1',version:'2.0.0',status:'psykologi_canonical_baseline_expanded_and_audited',generatedFrom:P,subject:{id:'psykologi',editorialStatus:statusEntry.editorialStatus,nextGate:statusEntry.nextGate,registeredChapterCount:subject.chapters.length,canonicalDomainCount:pensum.summary.domain_count,canonicalEmneCount:pensum.summary.emne_count,canonicalMethodCount:pensum.summary.method_count},summary:{chapterCount:6,domainCount:6,emneCount:58,uniqueEmneCount:58,canonicalMethodCount:58,moduleCount,sectionCount,paragraphCount,claimCount,sourceCount,externalSourceCount},domainCoverage,chapterIds,gates:{sixCanonicalDomainsCovered:true,all58CanonicalEmnersCoveredExactlyOnce:true,allCanonicalChapterMethodSetsResolved:true,allChapterClaimsTraceToSources:true,minimumExternalSourceFloorMetForEveryChapter:true,allChapterBriefsCarryDiagnosisGuard:true,registryAndStatusExpandedAndAudited:true,universityExpansionGateSet:true},interpretation:'Denne auditen dokumenterer en sterk 6/58 canonical kapittelbaseline. Den dokumenterer ikke at 58 selvstendige emneartikler, et komplett begrepsregister, full metode/statistikk eller universitetsmatrisen er ferdige; disse kravene eies av university-readiness-auditen.'};
  if(writeReport){fs.mkdirSync(path.dirname(abs(P.report)),{recursive:true});fs.writeFileSync(abs(P.report),`${JSON.stringify(projection(report),null,2)}\n`);}
  if(checkReport){assert(fs.existsSync(abs(P.report)),`${P.report} mangler. Kjør --write-report`);assert(isDeepStrictEqual(read(P.report),projection(report)),`${P.report} er utdatert`);}
  return {report:projection(report)};
}
function main(){const args=new Set(process.argv.slice(2));try{const r=auditPsykologiComplete({writeReport:args.has('--write-report'),checkReport:!args.has('--no-check-report')&&!args.has('--write-report')});console.log(`Psykologi canonical baseline OK: ${r.report.summary.chapterCount}/6 kapitler, ${r.report.summary.emneCount}/58 emner, ${r.report.summary.paragraphCount} avsnitt, ${r.report.summary.claimCount} claims og ${r.report.summary.externalSourceCount} eksterne kilder. Endelig complete krever university-readiness.`);}catch(e){console.error(`Psykologi canonical baseline FEIL: ${e.message}`);process.exitCode=1;}}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))main();
