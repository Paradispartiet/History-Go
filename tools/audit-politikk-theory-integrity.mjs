#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { auditPolitikkQuality } from '../scripts/audit-politikk-subject-quality.mjs';
import { auditPolitikkThinkerIntegrity } from '../scripts/audit-politikk-thinker-integrity.mjs';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const P={
  pensum:'data/fag/politikk/politikkpensum_canonical_v4_5.json',
  emner:'data/fag/politikk/emner_politikk_canonical_v4_5.json',
  fagkart:'data/fag/politikk/fagkart_politikk_canonical_v4_5.json',
  thinkerNames:'data/fag/politikk/politikk_thinker_names.json',
  bindings:'data/fag/politikk/theory_integrity_bindings_politikk_v1.json',
  registry:'data/fagverk/fagverk_registry.json',
  report:'reports/fagverk/politikk-theory-integrity-audit.json'
};
const abs=p=>path.join(ROOT,p);
const json=p=>JSON.parse(fs.readFileSync(abs(p),'utf8'));
const text=v=>String(v??'').trim();
const norm=v=>text(v).toLocaleLowerCase('nb-NO').normalize('NFKD').replace(/\p{M}/gu,'').replace(/[^\p{L}\p{N}]+/gu,' ').replace(/\s+/g,' ').trim();
const assert=(ok,msg)=>{if(!ok)throw new Error(msg);};
const flattenStrings=value=>{const out=[];const walk=v=>{if(typeof v==='string')out.push(v);else if(Array.isArray(v))v.forEach(walk);else if(v&&typeof v==='object')Object.values(v).forEach(walk);};walk(value);return out;};
const claimRefs=value=>{const out=[];const walk=v=>{if(Array.isArray(v))return v.forEach(walk);if(!v||typeof v!=='object')return;for(const [k,x] of Object.entries(v)){if(['paragraphClaimIds','keyPointClaimIds','claimIds'].includes(k)&&Array.isArray(x))out.push(...x.flat(Infinity).map(text));else walk(x);}};walk(value);return out.filter(Boolean);};
const academicallyAppropriate=s=>/(peer review|research|forskn|fagfelle|akadem|academic|universit|university|press|monograph|monografi|journal|encyclop|oppslagsverk|dataset|methodolog|infrastructure|intergovernmental|official|offisiell|statist|government|regjering|storting|lovdata|departement|direktorat|tilsyn|ombud|world bank|oecd|united nations|nato|council of europe|cambridge|oxford|harvard|jstor|springer|sage|routledge|verso)/iu.test(norm([s.type,s.publisher,s.label,s.id].join(' ')));
const limitationSignal=s=>/(begrens|kan ikke|ikke (?:alene|automatisk|nødvendigvis|bevise)|usikker|rekkevidd|forbehold|blindson|inferens|varsom)/iu.test(s);
const rivalSignal=s=>/(motargument|alternativ|rival|konkurrer|uenighet|kritikk|konflikt|skiller|sammenlign|derimot|på den ene siden|på den andre siden)/iu.test(s);
const displaySurname=name=>norm(name).split(' ').at(-1)||'';

function directPersonWorkSources(sources,thinkerIds,thinkerRegistry){
  const surnames=[...new Set(thinkerIds.map(id=>displaySurname(thinkerRegistry[id]||id)).filter(s=>s.length>=4))];
  return sources.filter(source=>academicallyAppropriate(source)&&surnames.some(surname=>norm(source.label).includes(surname))&&text(source.label).length>=12);
}

function validateSidecar(domainId,thinkerIds,bindings,thinkerRegistry){
  const field=(bindings.fields||[]).find(row=>row.domain_id===domainId);
  assert(field,`${domainId}: mangler eksplisitt theory-integrity sidecar`);
  const objects=field.theory_groundings||[];
  assert(objects.length>=2,`${domainId}: sidecar må binde minst to teoriobjekter`);
  assert(new Set(objects.map(row=>row.thinker_id)).size>=2,`${domainId}: sidecar må bruke minst to distinkte canonicale tenkere`);
  const sourceById=new Map((bindings.scholarly_sources||[]).map(source=>[source.id,source]));
  for(const object of objects){
    assert(thinkerIds.includes(object.thinker_id),`${domainId}: ${object.thinker_id} er ikke canonicalt bundet til feltets emner`);
    assert(text(object.work).length>=8,`${domainId}: ${object.thinker_id} mangler navngitt verk`);
    assert(text(object.contribution).length>=80,`${domainId}: ${object.thinker_id} mangler substansiell bidragsforklaring`);
    const source=sourceById.get(object.scholarly_source_id);
    assert(source,`${domainId}: ukjent scholarly source ${object.scholarly_source_id}`);
    assert(/^https:\/\//.test(text(source.url)),`${source.id}: scholarly source mangler https`);
    assert(/scholarly|peer_reviewed/i.test(text(source.source_authority_class)),`${source.id}: feil source authority class`);
    assert(norm(source.title)===norm(object.work),`${domainId}: verk og scholarly source title er usynkrone for ${object.thinker_id}`);
    const canonicalName=thinkerRegistry[object.thinker_id];
    assert(canonicalName,`${object.thinker_id}: mangler canonicalt visningsnavn`);
    const canonicalSurname=displaySurname(canonicalName);
    assert((source.authors||[]).some(author=>norm(author)===norm(canonicalName)||displaySurname(author)===canonicalSurname),`${source.id}: scholarly source binder ikke canonical person ${canonicalName}`);
  }
  return objects;
}

export function auditPolitikkTheoryIntegrity({writeReport=false,checkReport=true}={}){
  const quality=auditPolitikkQuality({checkReport:true});
  const thinkerAudit=auditPolitikkThinkerIntegrity({checkReport:true});
  assert(quality.status==='passed','Politikk subject quality er ikke grønn');
  assert(thinkerAudit.status==='passed','Politikk thinker integrity er ikke grønn');

  const pensum=json(P.pensum),emner=json(P.emner),fagkart=json(P.fagkart),registry=json(P.registry),bindings=json(P.bindings),thinkerRegistry=json(P.thinkerNames).thinkers||{};
  assert(pensum.scope==='universal','Politikk strict gate krever universelt fagomfang');
  assert((pensum.domains||[]).length===13,'Politikk strict gate forventer 13 canonicale hovedfelt');
  assert(emner.length===123,'Politikk strict gate forventer 123 canonicale emner');
  assert(quality.summary.methodCount===71,'Politikk strict gate forventer 71 metoder');
  assert(quality.summary.hookCount===152,'Politikk strict gate forventer 152 hooks');
  assert(bindings.status==='proof_selection_only'&&bindings.content_mutation===false&&bindings.completion_status_read_only===true,'Politikk sidecar skal være read-only proof selection');

  const byEmne=new Map(emner.map(row=>[row.emne_id,row]));
  const categories=fagkart.categories||[];
  const chapters=registry.subjects?.politikk?.chapters||[];
  assert(chapters.length===13,'Politikk strict gate forventer 13 registrerte kapitler');
  const fields=[];

  for(const domain of pensum.domains||[]){
    const domainId=domain.domain_id;
    const fieldEmners=(domain.emne_ids||[]).map(id=>byEmne.get(id)).filter(Boolean);
    assert(fieldEmners.length===(domain.emne_ids||[]).length&&fieldEmners.length>0,`${domainId}: mangler canonical emnedekning`);
    const thinkerIds=[...new Set(fieldEmners.flatMap(row=>[...(row.canonical_thinker_ids||[]),...(row.norwegian_thinker_ids||[])]).filter(Boolean))];
    assert(thinkerIds.length>=2,`${domainId}: mangler strukturert thinker-binding`);
    for(const id of thinkerIds)assert(thinkerRegistry[id],`${domainId}: ukjent canonical thinker ${id}`);

    const chapterRow=chapters.find(row=>row.primary_domain_id===domainId);
    assert(chapterRow,`${domainId}: mangler registrert feltkapittel`);
    const chapter=json(chapterRow.file);
    assert(chapter.editorialStatus==='chapter_ready'&&chapter.claimTraceRequired===true,`${domainId}: kapittelet er ikke på full claim-trace contract`);
    assert(new Set(chapter.emne_ids||[]).size===(domain.emne_ids||[]).length&&(domain.emne_ids||[]).every(id=>(chapter.emne_ids||[]).includes(id)),`${domainId}: kapittelet dekker ikke nøyaktig feltets emner`);
    const modulePaths=chapter.moduleFiles||[];
    assert(modulePaths.length===3,`${domainId}: forventer tre moduler`);
    const modules=modulePaths.map(json);
    const claimsDoc=json(chapter.claimsFile);
    const claims=claimsDoc.claims||[],sources=claimsDoc.sources||[];
    const usedClaimIds=new Set(claimRefs(modules));
    const verifiedUsedClaims=claims.filter(claim=>claim.status==='verified'&&usedClaimIds.has(claim.id)&&(claim.source_ids||[]).length>0);
    assert(verifiedUsedClaims.length>=20,`${domainId}: for få verified prose-bound claims`);
    const usedSourceIds=new Set(verifiedUsedClaims.flatMap(claim=>claim.source_ids||[]));
    const appliedSources=sources.filter(source=>usedSourceIds.has(source.id)&&academicallyAppropriate(source));
    assert(appliedSources.length>=2,`${domainId}: for få faglig passende anvendte kilder`);
    const scholarlyClaimCount=verifiedUsedClaims.filter(claim=>(claim.source_ids||[]).some(id=>appliedSources.some(source=>source.id===id))).length;
    assert(scholarlyClaimCount>=2,`${domainId}: mangler applied-source claims i faktisk prosa`);

    const prose=`${flattenStrings(modules).join(' ')} ${flattenStrings(fieldEmners).join(' ')}`;
    assert(rivalSignal(prose),`${domainId}: mangler reell rival/alternativ-kontrast`);
    assert(limitationSignal(prose),`${domainId}: mangler begrensning eller inferensgrense`);

    const category=categories.find(row=>[row.id,row.domain_id,row.category_id,row.key].includes(domainId))||categories.find(row=>norm(row.title||row.name)===norm(domain.title||domain.name));
    const hooks=category?.topic_hooks||[];
    assert(hooks.length>0,`${domainId}: mangler canonical hooks`);
    for(const hook of hooks){
      const constraints=hook.generator_constraints||{};
      assert(Object.values(constraints).some(value=>value===true)||Object.keys(constraints).length>=2,`${hook.id}: mangler anti-trivia/source-first generator constraint`);
    }

    const directWorks=directPersonWorkSources(appliedSources,thinkerIds,thinkerRegistry);
    let proofMode='direct_chapter_sources',sidecarTheoryCount=0;
    if(directWorks.length<2){
      const objects=validateSidecar(domainId,thinkerIds,bindings,thinkerRegistry);
      proofMode='explicit_read_only_sidecar';
      sidecarTheoryCount=objects.length;
    }

    fields.push({
      domainId,
      chapterId:chapter.id,
      strictlyProven:true,
      proofMode,
      emneCount:fieldEmners.length,
      thinkerCount:thinkerIds.length,
      verifiedProseBoundClaims:verifiedUsedClaims.length,
      academicallyAppropriateUsedSources:appliedSources.length,
      directNamedPersonWorkSources:directWorks.length,
      sidecarTheoryCount,
      hookCount:hooks.length
    });
  }

  const sidecarFields=fields.filter(field=>field.proofMode==='explicit_read_only_sidecar').map(field=>field.domainId);
  const declaredSidecarFields=(bindings.fields||[]).map(row=>row.domain_id);
  assert(sidecarFields.length===declaredSidecarFields.length&&sidecarFields.every(id=>declaredSidecarFields.includes(id)),`Politikk sidecar er stale: gate trenger ${sidecarFields.join(', ')}, manifest har ${declaredSidecarFields.join(', ')}`);
  assert(fields.every(field=>field.strictlyProven),'Alle 13 Politikk-felt må strict-proves');

  const report={
    schema:'history_go_politikk_theory_integrity_audit_v1',
    version:'1.0.0',
    subject_id:'politikk',
    status:'STRICTLY_PROVEN',
    proof_scope:'per_canonical_major_field',
    completion_status_read_only:true,
    content_rewrite_required:false,
    summary:{
      canonicalMajorFields:13,
      fieldsStrictlyProven:13,
      canonicalEmners:123,
      canonicalMethods:71,
      canonicalHooks:152,
      directProofFields:fields.filter(field=>field.proofMode==='direct_chapter_sources').length,
      explicitReadOnlySidecarFields:sidecarFields.length,
      substantiveContentGapsProven:0
    },
    sidecarFields,
    fields
  };
  if(writeReport){fs.mkdirSync(path.dirname(abs(P.report)),{recursive:true});fs.writeFileSync(abs(P.report),`${JSON.stringify(report,null,2)}\n`);}
  if(checkReport){assert(fs.existsSync(abs(P.report)),`${P.report} mangler`);assert(JSON.stringify(json(P.report))===JSON.stringify(report),`${P.report} er utdatert`);}
  return report;
}

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const args=new Set(process.argv.slice(2));
  try{console.log(JSON.stringify(auditPolitikkTheoryIntegrity({writeReport:args.has('--write-report'),checkReport:!args.has('--no-check-report')}),null,2));}
  catch(error){console.error(`Politikk theory integrity FEIL: ${error.message}`);process.exitCode=1;}
}
