#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const P={
  pensum:'data/fag/naeringsliv/naeringslivpensum_canonical_v4_5.json',
  fagkart:'data/fag/naeringsliv/fagkart_naeringsliv_canonical_v4_5.json',
  theories:'data/fag/naeringsliv/teorikort_okonomi_og_naeringsliv_v1.json',
  extensions:'data/fag/naeringsliv/emneutvidelser_okonomi_og_naeringsliv_v1.json',
  quality:'data/fag/naeringsliv/universitetskvalitet_okonomi_og_naeringsliv_v2.json',
  registry:'data/fagverk/fagverk_registry.json'
};
const abs=p=>path.join(ROOT,p);
const json=p=>JSON.parse(fs.readFileSync(abs(p),'utf8'));
const text=v=>String(v??'').trim();
const norm=v=>text(v).toLocaleLowerCase('nb-NO').normalize('NFKD').replace(/\p{M}/gu,'').replace(/[^\p{L}\p{N}]+/gu,' ').replace(/\s+/g,' ').trim();
const scholarly=/(universit|university|college|school|institutt|institute|research|forsk|press|journal|ssb|statistisk sentralbyra|regjeringen|departement|direktorat|tilsyn|norges bank|oecd|world bank|imf|ilo|united nations|europa|european commission|lovdata|museum|arkiv|archive|bibliotek|library)/iu;

function extProse(ext){
  return [
    ext.university_problem,
    ...Object.values(ext.learning_activities||{}),
    ...Object.values(ext.assessment||{}),
    ...(ext.common_misconceptions||[]),
    ...(ext.evidence_requirements||[]),
    ...(ext.quiz_targets?.bridge||[]),
    ...(ext.quiz_targets?.final||[]),
    ext.scholarship_conflict,
    ext.scholarly_conflict
  ].map(text).join(' ');
}

function theoryMentioned(card, prose){
  const p=norm(prose);
  const title=norm(card.title);
  const id=norm(String(card.theory_id||'').replaceAll('_',' '));
  return (title.length>=8&&p.includes(title))||(id.length>=8&&p.includes(id));
}

function loadField(domain, registry, extensionById, theoryById, fagkart){
  const emneIds=domain.emne_ids||[];
  const extensions=emneIds.map(id=>extensionById.get(id)).filter(Boolean);
  const theoryIds=[...new Set(extensions.flatMap(e=>e.theory_ids||[]))];
  const cards=theoryIds.map(id=>theoryById.get(id)).filter(Boolean);
  const coreChapter=(registry.subjects?.naeringsliv?.chapters||[]).find(row=>(row.chapter_role||'core')==='core'&&row.primary_domain_id===domain.domain_id);
  if(!coreChapter) throw new Error(`${domain.domain_id}: mangler core chapter`);
  const chapter=json(coreChapter.file);
  const modules=(chapter.moduleFiles||[]).map(json);
  const claimsDoc=json(chapter.claimsFile);
  const claimById=new Map((claimsDoc.claims||[]).map(c=>[c.id,c]));
  const sourceById=new Map((claimsDoc.sources||[]).map(s=>[s.id,s]));
  const paragraphs=modules.flatMap(m=>(m.sections||[]).flatMap(s=>(s.paragraphs||[]).map((p,i)=>({text:text(p),claimIds:(s.paragraphClaimIds?.[i]||[])}))));
  const usedClaimIds=new Set(paragraphs.flatMap(p=>p.claimIds));
  const verifiedClaims=(claimsDoc.claims||[]).filter(c=>c.status==='verified'&&usedClaimIds.has(c.id)&&(c.source_ids||[]).length>0);
  const usedSourceIds=new Set(verifiedClaims.flatMap(c=>c.source_ids||[]));
  const authoritativeSources=[...usedSourceIds].map(id=>sourceById.get(id)).filter(Boolean).filter(s=>/^https:\/\//.test(text(s.url))&&scholarly.test([s.publisher,s.label,s.type,s.source_location].join(' ')));

  let proseBoundTheoryExtensions=0;
  let rivalBoundExtensions=0;
  let limitationBoundExtensions=0;
  for(const ext of extensions){
    const prose=extProse(ext);
    const mentioned=(ext.theory_ids||[]).map(id=>theoryById.get(id)).filter(Boolean).filter(card=>theoryMentioned(card,prose));
    if(mentioned.length>=2)proseBoundTheoryExtensions+=1;
    const advanced=[ext.learning_activities?.advanced,ext.assessment?.advanced_product,...(ext.quiz_targets?.final||[])].map(text).join(' ');
    if(text(ext.scholarly_conflict)&&/(mot|konflikt|alternativ|sammenlign)/iu.test(advanced))rivalBoundExtensions+=1;
    if(/(hvor langt evidensen rekker|usikker|konklusjonsgrense|begrens|feilkilde|gyldighetsomrade)/iu.test(norm(advanced)))limitationBoundExtensions+=1;
  }

  const theoryRich=cards.length===theoryIds.length&&cards.every(card=>
    text(card.mechanism).length>=40&&
    (card.assumptions||[]).length>=2&&
    (card.competing_theories||[]).length>=2&&
    (card.major_criticisms||[]).length>=2&&
    (card.limits||[]).length>=1
  );
  const personWorkBound=cards.length===theoryIds.length&&cards.every(card=>
    (card.thinker_ids||[]).length>=1&&
    (card.central_works||[]).length>=1&&
    (card.central_works||[]).every(work=>text(work.title)&&Number.isInteger(work.year)&&(!work.thinker_id||(card.thinker_ids||[]).includes(work.thinker_id)))
  );
  const category=(fagkart.categories||[]).find(c=>c.id===domain.domain_id);
  const hooks=category?.topic_hooks||[];
  const antiTrivia=Boolean(category)&&hooks.length>0&&hooks.every(h=>
    h.external_claim_basis_required===true&&
    h.generator_constraints?.require_external_claim_basis===true&&
    h.generator_constraints?.do_not_generate_from_hook_label_only===true&&
    (h.comparison_pairs||[]).length>=1
  );

  const checks={
    registeredCoreChapter:Boolean(coreChapter),
    exactEmneExtensionCoverage:extensions.length===emneIds.length,
    multipleTheoriesPerEmne:extensions.every(e=>(e.theory_ids||[]).length>=2),
    theoryMechanismRivalLimit:theoryRich,
    personWorkBinding:personWorkBound,
    actualProseTheoryBinding:proseBoundTheoryExtensions===extensions.length,
    scholarlyConflictBinding:rivalBoundExtensions===extensions.length,
    limitationInferenceBinding:limitationBoundExtensions===extensions.length,
    verifiedClaimBinding:verifiedClaims.length>=12,
    academicallyAppropriateAppliedSources:authoritativeSources.length>=4,
    antiTriviaSourceFirstHooks:antiTrivia
  };
  return {
    fieldId:domain.domain_id,
    emneCount:emneIds.length,
    extensionCount:extensions.length,
    theoryCount:theoryIds.length,
    proseBoundTheoryExtensions,
    rivalBoundExtensions,
    limitationBoundExtensions,
    verifiedProseBoundClaims:verifiedClaims.length,
    authoritativeUsedSources:authoritativeSources.length,
    hookCount:hooks.length,
    checks,
    strictCandidate:Object.values(checks).every(Boolean),
    proofDimensionGaps:Object.entries(checks).filter(([,ok])=>!ok).map(([key])=>key)
  };
}

const pensum=json(P.pensum), fagkart=json(P.fagkart), theories=json(P.theories), extensions=json(P.extensions), quality=json(P.quality), registry=json(P.registry);
const extensionById=new Map((extensions.extensions||[]).map(e=>[e.emne_id,e]));
const theoryById=new Map((theories.cards||[]).map(t=>[t.theory_id,t]));
const fields=(pensum.domains||[]).map(d=>loadField(d,registry,extensionById,theoryById,fagkart));
const result={
  schema:'history_go_temp_naeringsliv_theory_integrity_probe_v1',
  subject_id:'naeringsliv',
  read_only:true,
  baseline:{
    canonicalMajorFields:(pensum.domains||[]).length,
    coreEmners:quality.coverage?.core_emners,
    theoryCards:quality.coverage?.theory_cards,
    registeredChapters:registry.subjects?.naeringsliv?.chapters?.length||0
  },
  summary:{
    canonicalMajorFields:fields.length,
    strictCandidates:fields.filter(f=>f.strictCandidate).length,
    fieldsNeedingProofReconciliation:fields.filter(f=>!f.strictCandidate).map(f=>f.fieldId),
    substantiveContentGapsProven:0
  },
  fields
};
fs.writeFileSync('/tmp/naeringsliv-theory-integrity-probe.json',`${JSON.stringify(result,null,2)}\n`);
console.log(JSON.stringify(result,null,2));
