#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { auditNaeringslivQuality } from '../scripts/audit-naeringsliv-subject-quality.mjs';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const P={
  pensum:'data/fag/naeringsliv/naeringslivpensum_canonical_v4_5.json',
  fagkart:'data/fag/naeringsliv/fagkart_naeringsliv_canonical_v4_5.json',
  theories:'data/fag/naeringsliv/teorikort_okonomi_og_naeringsliv_v1.json',
  extensions:'data/fag/naeringsliv/emneutvidelser_okonomi_og_naeringsliv_v1.json',
  quality:'data/fag/naeringsliv/universitetskvalitet_okonomi_og_naeringsliv_v2.json',
  registry:'data/fagverk/fagverk_registry.json',
  report:'reports/fagverk/naeringsliv-theory-integrity-audit.json'
};
const abs=p=>path.join(ROOT,p);
const json=p=>JSON.parse(fs.readFileSync(abs(p),'utf8'));
const text=v=>String(v??'').trim();
const norm=v=>text(v).toLocaleLowerCase('nb-NO').normalize('NFKD').replace(/\p{M}/gu,'').replace(/[^\p{L}\p{N}]+/gu,' ').replace(/\s+/g,' ').trim();
const assert=(ok,msg)=>{if(!ok)throw new Error(msg);};
const scholarly=/(universit|university|college|school|institutt|institute|research|forsk|press|journal|ssb|statistisk sentralbyra|regjeringen|departement|direktorat|tilsyn|norges bank|oecd|world bank|imf|ilo|united nations|europa|european commission|lovdata|museum|arkiv|archive|bibliotek|library)/iu;

function extensionProse(ext){
  return [ext.university_problem,...Object.values(ext.learning_activities||{}),...Object.values(ext.assessment||{}),...(ext.common_misconceptions||[]),...(ext.evidence_requirements||[]),...(ext.quiz_targets?.bridge||[]),...(ext.quiz_targets?.final||[]),ext.scholarly_conflict].map(text).join(' ');
}
function theoryMentioned(card,prose){
  const p=norm(prose), title=norm(card.title), id=norm(String(card.theory_id||'').replaceAll('_',' '));
  return (title.length>=8&&p.includes(title))||(id.length>=8&&p.includes(id));
}

function auditField(domain,{registry,extensionById,theoryById,fagkart}){
  const emneIds=domain.emne_ids||[];
  const extensions=emneIds.map(id=>extensionById.get(id)).filter(Boolean);
  const theoryIds=[...new Set(extensions.flatMap(e=>e.theory_ids||[]))];
  const cards=theoryIds.map(id=>theoryById.get(id)).filter(Boolean);
  const coreChapter=(registry.subjects?.naeringsliv?.chapters||[]).find(row=>(row.chapter_role||'core')==='core'&&row.primary_domain_id===domain.domain_id);
  assert(coreChapter,`${domain.domain_id}: mangler registrert core chapter`);
  const chapter=json(coreChapter.file);
  const modules=(chapter.moduleFiles||[]).map(json);
  const claimsDoc=json(chapter.claimsFile);
  const claimById=new Map((claimsDoc.claims||[]).map(c=>[c.id,c]));
  const sourceById=new Map((claimsDoc.sources||[]).map(s=>[s.id,s]));
  const paragraphs=modules.flatMap(m=>(m.sections||[]).flatMap(s=>(s.paragraphs||[]).map((p,i)=>({text:text(p),claimIds:(s.paragraphClaimIds?.[i]||[])}))));
  const usedClaimIds=new Set(paragraphs.flatMap(p=>p.claimIds));
  const verifiedClaims=(claimsDoc.claims||[]).filter(c=>c.status==='verified'&&usedClaimIds.has(c.id)&&(c.source_ids||[]).length>0);
  for(const p of paragraphs)for(const id of p.claimIds)assert(claimById.has(id),`${domain.domain_id}: ukjent paragraph claim ${id}`);
  const usedSourceIds=new Set(verifiedClaims.flatMap(c=>c.source_ids||[]));
  const authoritativeSources=[...usedSourceIds].map(id=>sourceById.get(id)).filter(Boolean).filter(s=>/^https:\/\//.test(text(s.url))&&scholarly.test([s.publisher,s.label,s.type,s.source_location].join(' ')));

  let proseBoundTheoryExtensions=0,rivalBoundExtensions=0,limitationBoundExtensions=0;
  for(const ext of extensions){
    assert((ext.theory_ids||[]).length>=2,`${ext.emne_id}: mangler minst to teorier/modeller`);
    const prose=extensionProse(ext);
    const mentioned=(ext.theory_ids||[]).map(id=>theoryById.get(id)).filter(Boolean).filter(card=>theoryMentioned(card,prose));
    assert(mentioned.length>=2,`${ext.emne_id}: teorier er ikke faktisk brukt i canonical emneprosa`);
    proseBoundTheoryExtensions+=1;
    const advanced=[ext.learning_activities?.advanced,ext.assessment?.advanced_product,...(ext.quiz_targets?.final||[])].map(text).join(' ');
    assert(text(ext.scholarly_conflict)&&/(mot|konflikt|alternativ|sammenlign)/iu.test(advanced),`${ext.emne_id}: mangler eksplisitt rival/fagkonflikt i avansert prosa`);
    rivalBoundExtensions+=1;
    assert(/(hvor langt evidensen rekker|usikker|konklusjonsgrense|begrens|feilkilde|gyldighetsomrade)/iu.test(norm(advanced)),`${ext.emne_id}: mangler usikkerhet eller konklusjonsgrense`);
    limitationBoundExtensions+=1;
  }

  assert(cards.length===theoryIds.length,`${domain.domain_id}: minst ett theory_id mangler theory card`);
  for(const card of cards){
    assert(text(card.mechanism).length>=40,`${card.theory_id}: mekanisme er for tynn`);
    assert((card.assumptions||[]).length>=2,`${card.theory_id}: mangler antakelser`);
    assert((card.competing_theories||[]).length>=2,`${card.theory_id}: mangler konkurrerende teorier`);
    assert((card.major_criticisms||[]).length>=2,`${card.theory_id}: mangler kritikk`);
    assert((card.limits||[]).length>=1,`${card.theory_id}: mangler limit`);
    assert((card.thinker_ids||[]).length>=1,`${card.theory_id}: mangler thinker binding`);
    assert((card.central_works||[]).length>=1,`${card.theory_id}: mangler sentralverk`);
    for(const work of card.central_works||[]){
      assert(text(work.title)&&Number.isInteger(work.year),`${card.theory_id}: sentralverk mangler tittel/år`);
      if(work.thinker_id)assert((card.thinker_ids||[]).includes(work.thinker_id),`${card.theory_id}: work thinker er ikke bundet til theory card`);
    }
  }

  const category=(fagkart.categories||[]).find(c=>c.id===domain.domain_id);
  assert(category,`${domain.domain_id}: mangler fagkart-kategori`);
  const hooks=category.topic_hooks||[];
  assert(hooks.length===10,`${domain.domain_id}: forventer 10 canonical hooks`);
  for(const hook of hooks){
    assert(hook.external_claim_basis_required===true,`${hook.id}: mangler external claim basis`);
    assert(hook.generator_constraints?.require_external_claim_basis===true,`${hook.id}: generator mangler source gate`);
    assert(hook.generator_constraints?.do_not_generate_from_hook_label_only===true,`${hook.id}: metadata-only generering er ikke blokkert`);
    assert((hook.comparison_pairs||[]).length>=1,`${hook.id}: mangler rival/comparison pair`);
  }

  assert(extensions.length===emneIds.length,`${domain.domain_id}: ikke alle canonical emner har extension`);
  assert(verifiedClaims.length>=12,`${domain.domain_id}: for få verified prose-bound claims`);
  assert(authoritativeSources.length>=4,`${domain.domain_id}: for få academically appropriate applied sources`);

  return {
    fieldId:domain.domain_id,
    strictlyProven:true,
    emneCount:emneIds.length,
    theoryCount:theoryIds.length,
    proseBoundTheoryExtensions,
    rivalBoundExtensions,
    limitationBoundExtensions,
    verifiedProseBoundClaims:verifiedClaims.length,
    authoritativeUsedSources:authoritativeSources.length,
    hookCount:hooks.length
  };
}

export function auditNaeringslivTheoryIntegrity({writeReport=false,checkReport=true}={}){
  const qualityAudit=auditNaeringslivQuality({checkReport:true});
  assert(qualityAudit.status==='passed','Næringsliv subject-quality audit er ikke grønn');
  const pensum=json(P.pensum),fagkart=json(P.fagkart),theories=json(P.theories),extensions=json(P.extensions),quality=json(P.quality),registry=json(P.registry);
  assert(pensum.subject_id==='naeringsliv','Næringsliv pensum har feil subject_id');
  assert((pensum.domains||[]).length===6,'Strict gate forventer seks canonicale hovedfelt');
  assert(quality.status==='canonical_university_quality','University quality manifest er ikke canonical');
  assert(quality.coverage?.core_emners===36,'Strict gate forventer 36 core emners');
  assert(quality.coverage?.theory_cards===(theories.cards||[]).length,'Theory-card coverage er stale');
  assert(quality.anti_tokenism?.theory_name_without_mechanism===false,'Anti-tokenism må blokkere teorinavn uten mekanisme');
  assert(quality.anti_tokenism?.thinker_name_without_central_work===false,'Anti-tokenism må blokkere thinker-navn uten sentralverk');
  assert(quality.anti_tokenism?.advanced_claim_without_uncertainty_or_conclusion_limit===false,'Avanserte claims må ha usikkerhet/konklusjonsgrense');
  assert(fagkart.principles?.source_first===true,'Næringsliv må være source-first');
  assert(fagkart.principles?.external_claim_basis_required===true,'Næringsliv må kreve external claim basis');
  assert(fagkart.principles?.work_capital_infrastructure_or_firm_before_theory===true,'Næringsliv må starte i arbeid/kapital/infrastruktur/virksomhet før teori');
  assert(fagkart.principles?.no_generic_economics_questions===true,'Generiske økonomispørsmål skal være blokkert');
  const extensionById=new Map((extensions.extensions||[]).map(e=>[e.emne_id,e]));
  const theoryById=new Map((theories.cards||[]).map(t=>[t.theory_id,t]));
  const fields=(pensum.domains||[]).map(domain=>auditField(domain,{registry,extensionById,theoryById,fagkart}));
  assert(fields.every(f=>f.strictlyProven),'Alle seks Næringsliv-felt må strict-proves');
  const report={
    schema:'history_go_naeringsliv_theory_integrity_audit_v1',
    version:'1.0.0',
    subject_id:'naeringsliv',
    status:'STRICTLY_PROVEN',
    proof_scope:'per_canonical_major_field',
    completion_status_read_only:true,
    content_rewrite_required:false,
    rules:{
      source_first:true,
      no_generic_economics_questions:true,
      named_people_require_central_work:true,
      theory_requires_mechanism_rival_criticism_and_limit:true,
      actual_prose_binding_required:true,
      verified_claim_and_applied_source_binding_required:true
    },
    summary:{canonicalMajorFields:6,fieldsStrictlyProven:6,coreEmners:36,theoryCards:(theories.cards||[]).length,substantiveContentGapsProven:0},
    fields
  };
  if(writeReport){fs.mkdirSync(path.dirname(abs(P.report)),{recursive:true});fs.writeFileSync(abs(P.report),`${JSON.stringify(report,null,2)}\n`);}
  if(checkReport){assert(fs.existsSync(abs(P.report)),`${P.report} mangler`);assert(JSON.stringify(json(P.report))===JSON.stringify(report),`${P.report} er utdatert`);}
  return report;
}

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const args=new Set(process.argv.slice(2));
  try{console.log(JSON.stringify(auditNaeringslivTheoryIntegrity({writeReport:args.has('--write-report'),checkReport:!args.has('--no-check-report')}),null,2));}
  catch(error){console.error(`Næringsliv theory integrity FEIL: ${error.message}`);process.exitCode=1;}
}
