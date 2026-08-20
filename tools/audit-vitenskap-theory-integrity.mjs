#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { auditVitenskapHolisticUniversityBreadthCompletion } from '../scripts/audit-fagverk-vitenskap-holistic-university-breadth-completion.mjs';
import { auditVitenskapHolisticQualityReview } from '../scripts/audit-fagverk-vitenskap-holistic-quality-review.mjs';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const PENSUM='data/fag/vitenskap/vitenskappensum_canonical_v4_6.json';
const EMNERS='data/fag/vitenskap/emner_vitenskap_canonical_v4_6.json';
const MAPPINGS='data/fag/vitenskap/emnemapping_vitenskap_canonical_v4_6.json';
const BINDINGS='data/fag/vitenskap/theory_integrity_bindings_vitenskap_v1.json';
const REGISTRY='data/fagverk/fagverk_registry.json';
const REPORT='reports/fagverk/vitenskap-theory-integrity-audit.json';
const ORDER=['institusjoner_laboratorier_kunnskapssteder','metoder_maling_modeller','paradigmer_teorier_sannhet','teknologi_data_infrastruktur','natur_medisin_miljo','samfunn_makt_etikk'];
const MODEL_KINDS=new Set(['institutional_evidence_framework','measurement_chain','causal_inference_framework','model_validation_framework','epistemic_model_framework','historical_epistemic_framework','computational_evidence_framework','data_lifecycle_framework','population_evidence_framework','systems_risk_framework','science_governance_framework','risk_evidence_framework']);
const AUTHORITY_CLASSES=new Set(['scholarly_consensus_report','national_research_authority','national_scientific_authority','scholarly_reference','peer_reviewed_article','national_public_health_authority','national_research_ethics_authority','intergovernmental_scientific_assessment']);
const REQUIRED_ROLES=new Set(['mechanism','evidence','limitation_or_alternative']);
const abs=p=>path.join(ROOT,p);
const json=p=>JSON.parse(fs.readFileSync(abs(p),'utf8'));
const text=v=>String(v??'').trim();
const assert=(ok,msg)=>{if(!ok)throw new Error(msg);};
const unique=(xs,key=x=>x)=>new Set(xs.map(key)).size===xs.length;

function sectionFor(module,binding,objectId){
  const section=(module.sections||[]).find(row=>row.id===binding.section_id);
  assert(section,`${objectId}: ukjent seksjon ${binding.section_id}`);
  assert(Number.isInteger(binding.paragraph_index)&&binding.paragraph_index>=0&&binding.paragraph_index<section.paragraphs.length,`${objectId}: ugyldig paragraph_index`);
  return section;
}

export function auditVitenskapTheoryIntegrity({writeReport=false,checkReport=true}={}){
  const holistic=auditVitenskapHolisticUniversityBreadthCompletion({checkReport:true});
  const quality=auditVitenskapHolisticQualityReview({checkReport:true});
  const pensum=json(PENSUM),emners=json(EMNERS),mappings=json(MAPPINGS),bridge=json(BINDINGS),registry=json(REGISTRY);
  const subject=registry.subjects?.vitenskap;

  assert(bridge.schema==='history_go_vitenskap_theory_integrity_bindings_v1'&&bridge.status==='canonical','Vitenskap proof bridge må være canonical v1');
  assert(bridge.subject_id==='vitenskap'&&bridge.profile==='model_evidence','Vitenskap proof bridge må bruke model_evidence-profil');
  assert(bridge.completion_status_read_only===true&&bridge.content_mutation===false,'Vitenskap proof bridge må være read-only uten corpusmutasjon');
  assert(/proveniens.+ikke trivia/iu.test(bridge.production_rule)&&/faktisk kapittelprosa/iu.test(bridge.production_rule),'Vitenskap proof bridge mangler anti-trivia-/prosaregel');
  assert(holistic.status==='complete_and_holistically_audited'&&holistic.blockers.length===0,'Vitenskap strict gate krever holistisk komplett corpus uten blockers');
  assert(holistic.canonicalInventory.domainCount===6&&holistic.canonicalInventory.emneCount===117&&holistic.canonicalInventory.explicitChapterOwnedEmneCount===117&&holistic.canonicalInventory.explicitUncoveredEmneCount===0,'Vitenskap universal emnedekning har endret seg');
  assert(holistic.canonicalInventory.methodCount===84&&holistic.canonicalInventory.mappingCount===117&&holistic.canonicalInventory.hookCount===64,'Vitenskap canonical metode-/mapping-/hookbaseline har endret seg');
  assert(holistic.chapters.count===5&&holistic.chapters.totalParagraphCount===261&&holistic.chapters.totalClaimCount===178&&holistic.chapters.totalSourceCount===103,'Vitenskap kapittel-/provenancebaseline har endret seg');
  assert(holistic.evidence.allClaimsResolve===true&&holistic.evidence.methodsWithLimitsChapterCount===5&&holistic.evidence.fillerClean===true,'Vitenskap claim-, begrensnings- eller filler-gate er ikke grønn');
  assert(holistic.originality.exactDuplicateParagraphCount===0&&holistic.originality.maxCrossChapterFiveGramJaccard<holistic.originality.threshold,'Vitenskap originality-gate er ikke grønn');
  assert(holistic.technology.passes===true&&holistic.technology.topLevelSubject===false,'Nested Teknologi må forbli grønn og nested');
  assert(quality.status==='pass'&&quality.totalScore===28&&Object.values(quality.scores).every(score=>score>=4),'Vitenskap holistisk 28/30-review må bestå før strict proof');
  assert(JSON.stringify(pensum.domain_order)===JSON.stringify(ORDER),'Vitenskap canonical feltrekkefølge har endret seg');
  assert(bridge.fields.length===6&&JSON.stringify(bridge.fields.map(row=>row.domain_id))===JSON.stringify(ORDER),'Vitenskap bridge må dekke alle seks felt i canonical rekkefølge');

  const domains=new Map(pensum.domains.map(row=>[row.domain_id,row]));
  const emneById=new Map(emners.map(row=>[row.emne_id,row]));
  const mappingById=new Map(mappings.map(row=>[row.emne_id,row]));
  const core=(subject?.chapters||[]).find(row=>row.id==='vitenskap-fra-observasjon-til-etterprovbar-kunnskap');
  assert(core?.claimsFile&&core.editorialCoverageSupplements?.length===6,'Vitenskap core chapter må eie seks permanente field supplements');
  const supplements=new Map(core.editorialCoverageSupplements.map(row=>[row.domain_id,row]));
  assert(JSON.stringify([...supplements.keys()].sort())===JSON.stringify([...ORDER].sort()),'Vitenskap supplements må samsvare med canonicale felt');
  const claimsDocument=json(core.claimsFile);
  const claims=new Map(claimsDocument.claims.map(row=>[row.id,row]));
  const sources=new Map(claimsDocument.sources.map(row=>[row.id,row]));
  assert(claims.size===100&&sources.size===57,'Vitenskap core claim/source-ledger har endret seg');

  const usedObjectIds=[],usedSourceIds=[],usedClaimIds=[],usedProse=[],rows=[];
  let contentRoleBindings=0;
  for(const field of bridge.fields){
    const domain=domains.get(field.domain_id),supplement=supplements.get(field.domain_id);
    assert(domain&&supplement,`Ukjent Vitenskap-felt: ${field.domain_id}`);
    const module=json(supplement.moduleFile);
    assert(module.subject_id==='vitenskap'&&module.domain_id===field.domain_id,`${field.domain_id}: supplement peker til feil modul`);
    assert((module.sections||[]).length>=6&&module.misconceptions?.length>=5&&module.selfCheck?.length>=5,`${field.domain_id}: permanent fulltekst-/anti-trivia-lag er ufullstendig`);
    assert(field.model_objects?.length===2,`${field.domain_id}: strict proof krever eksakt to modellobjekter`);
    assert(unique(field.model_objects,row=>row.id),`${field.domain_id}: duplisert modellobjekt`);
    const objectIds=field.model_objects.map(row=>row.id);
    assert(new Set(field.comparison?.model_object_ids||[]).size===2&&objectIds.every(id=>field.comparison.model_object_ids.includes(id)),`${field.domain_id}: comparison må binde begge modellobjekter`);
    assert(text(field.comparison.interpretive_consequence).length>=180,`${field.domain_id}: comparison mangler fortolkningskonsekvens`);

    for(const object of field.model_objects){
      usedObjectIds.push(object.id);
      assert(MODEL_KINDS.has(object.model_kind),`${object.id}: ugyldig model_kind`);
      assert(text(object.model_name).length>=20,`${object.id}: mangler substansielt modellnavn`);
      for(const key of ['scope','core_claim_or_mechanism','evidence_or_observable_basis','rival_or_alternative','what_it_explains_or_interprets','interpretive_consequence'])assert(text(object[key]).length>=100,`${object.id}: mangler substansiell ${key}`);
      assert(object.assumptions_or_preconditions?.length>=2&&object.assumptions_or_preconditions.every(row=>text(row).length>=80),`${object.id}: mangler reelle forutsetninger`);
      assert(object.limitations?.length>=2&&object.limitations.every(row=>text(row).length>=80),`${object.id}: mangler reelle begrensninger`);
      assert(object.emne_ids?.length>=1&&object.emne_ids.every(id=>domain.emne_ids.includes(id)),`${object.id}: emne-binding ligger utenfor feltet`);
      for(const emneId of object.emne_ids){
        const emne=emneById.get(emneId),mapping=mappingById.get(emneId);
        assert(emne?.domain===field.domain_id,`${object.id}: ${emneId} har feil canonicalt felt`);
        assert(mapping?.mappings?.some(row=>row.mapping_tier==='primary'&&row.fagkart_kategori===field.domain_id),`${object.id}: ${emneId} mangler primary field mapping`);
      }

      const sourceRecord=sources.get(object.scholarly_source?.source_id);
      assert(sourceRecord&&/^https:\/\//.test(sourceRecord.url)&&text(sourceRecord.publisher)&&text(sourceRecord.source_location).length>=80,`${object.id}: scholarly source er uløst eller uinspiserbar`);
      assert(AUTHORITY_CLASSES.has(object.scholarly_source.authority_class),`${object.id}: kildeklassen er ikke faglig godkjent`);
      assert(text(object.scholarly_source.source_role).length>=100&&text(object.scholarly_source.use_limit).length>=100,`${object.id}: kilden mangler rolle eller brukgrense`);
      usedSourceIds.push(sourceRecord.id);

      const evidence=object.evidence_binding;
      assert(evidence?.module_file===supplement.moduleFile,`${object.id}: evidence binding peker til feil feltmodul`);
      const evidenceSection=sectionFor(module,evidence,object.id);
      const paragraphClaims=evidenceSection.paragraphClaimIds?.[evidence.paragraph_index]||[];
      assert(paragraphClaims.includes(evidence.claim_id),`${object.id}: claim er ikke bundet til faktisk avsnitt`);
      const claim=claims.get(evidence.claim_id);
      assert(claim?.status==='verified'&&claim.source_ids?.includes(evidence.source_id),`${object.id}: claim/source-binding er uløst`);
      assert(evidence.source_id===sourceRecord.id,`${object.id}: evidence source og scholarly source avviker`);
      usedClaimIds.push(claim.id);

      const bindings=object.content_bindings||[];
      assert(bindings.length===3,`${object.id}: må ha tre rollebaserte prosabindinger`);
      assert(new Set(bindings.map(row=>row.role)).size===3&&bindings.every(row=>REQUIRED_ROLES.has(row.role)),`${object.id}: må binde mechanism, evidence og limitation_or_alternative`);
      assert(unique(bindings,row=>`${row.section_id}:${row.paragraph_index}`),`${object.id}: prosabindingene må bruke tre ulike avsnitt`);
      for(const binding of bindings){
        assert(binding.module_file===supplement.moduleFile,`${object.id}: prosabinding peker til feil feltmodul`);
        const section=sectionFor(module,binding,object.id),paragraph=section.paragraphs[binding.paragraph_index];
        assert(text(paragraph).length>=300,`${object.id}: bundet prosa er ikke substansiell`);
        assert(section.emne_ids?.some(id=>object.emne_ids.includes(id)),`${object.id}: prosabindingen er ikke koblet til objektets canonicale emner`);
        const refs=section.paragraphClaimIds?.[binding.paragraph_index]||[];
        assert(refs.length>=1&&refs.every(id=>claims.has(id)),`${object.id}: bundet prosa mangler løst claim-proveniens`);
        usedProse.push(`${binding.module_file}:${binding.section_id}:${binding.paragraph_index}`);
        contentRoleBindings+=1;
      }
    }
    rows.push({domainId:field.domain_id,strictlyProven:true,modelObjectCount:2,scholarlySourceCount:2,claimSourceBindingCount:2,contentRoleBindingCount:6,actualProseBindingCount:6,personWorkBinding:'not_applicable_model_evidence_profile',universalSubjectGate:true});
  }

  assert(usedObjectIds.length===12&&unique(usedObjectIds),'Vitenskap strict gate krever tolv unike modellobjekter');
  assert(usedSourceIds.length===12&&unique(usedSourceIds),'Vitenskap strict gate krever tolv unike faglige kilder');
  assert(usedClaimIds.length===12&&unique(usedClaimIds),'Vitenskap strict gate krever tolv unike claim-bindinger');
  assert(contentRoleBindings===36&&usedProse.length===36&&unique(usedProse),'Vitenskap strict gate krever 36 unike rollebaserte prosabindinger');

  const report={
    schema:'history_go_vitenskap_theory_integrity_audit_v1',version:'1.0.0',subject_id:'vitenskap',status:'STRICTLY_PROVEN',proof_scope:'per_canonical_major_field',profile:'model_evidence',completion_status_read_only:true,content_rewrite_required:false,person_work_binding:'not_applicable_model_evidence_profile',
    safety:'verified_population_and_system_evidence_not_individual_medical_advice_or_policy_decision',
    summary:{canonicalMajorFields:6,fieldsStrictlyProven:6,modelObjects:12,scholarlySources:12,claimSourceBindings:12,contentRoleBindings:36,actualProseBindings:36,universalCanonicalEmnesValidated:117,substantiveContentGapsProven:0},
    lockedBaseline:{domains:6,topics:117,methods:84,mappings:117,theoryHooks:64,registeredChapters:5,sections:87,paragraphs:261,claims:178,sources:103,explicitChapterOwnedEmnes:117,explicitUncoveredEmnes:0,exactDuplicateParagraphs:0,holisticQualityScore:28,nestedTechnologyAreas:12,nestedTechnologyTopics:48},
    sourceModel:{modelGrounding:'canonical field + canonical emne/mapping + scope/mechanism/assumptions/evidence/limits/alternative',appliedEvidence:'existing fulltext module + exact section/paragraph + verified claim + inspectable scholarly or scientific-authority source',universalScope:'holistic permanent gate proves 117/117 canonical emners, all 178 claims, all 103 sources, method limits and cross-chapter originality',safety:'population and system evidence never becomes individual medical advice, automatic policy choice or authority-as-truth'},
    fields:rows
  };
  if(writeReport){fs.mkdirSync(path.dirname(abs(REPORT)),{recursive:true});fs.writeFileSync(abs(REPORT),`${JSON.stringify(report,null,2)}\n`);}
  if(checkReport){assert(fs.existsSync(abs(REPORT)),`${REPORT} mangler`);assert(JSON.stringify(json(REPORT))===JSON.stringify(report),`${REPORT} er utdatert`);}
  return report;
}

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const args=new Set(process.argv.slice(2));
  try{console.log(JSON.stringify(auditVitenskapTheoryIntegrity({writeReport:args.has('--write-report'),checkReport:!args.has('--no-check-report')}),null,2));}
  catch(error){console.error(`Vitenskap theory integrity FEIL: ${error.message}`);process.exitCode=1;}
}
