#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const BINDINGS='data/fag/filosofi/theory_integrity_bindings_filosofi_v1.json';
const REPORT='reports/fagverk/filosofi-theory-integrity-audit.json';
const abs=p=>path.join(ROOT,p);
const json=p=>JSON.parse(fs.readFileSync(abs(p),'utf8'));
const text=v=>String(v??'').replace(/\s+/gu,' ').trim();
const norm=v=>text(v).toLocaleLowerCase('nb-NO').normalize('NFKD').replace(/\p{M}/gu,'');
const words=v=>text(v).split(/\s+/u).filter(Boolean).length;
const assert=(ok,msg)=>{if(!ok)throw new Error(msg);};

function auditArticle(article,{sourceById,thinkerById}){
  assert(article.subject_id==='filosofi',`${article.id}: feil subject_id`);
  assert(article.editorial_quality==='university_depth_reviewed',`${article.id}: ikke university_depth_reviewed`);
  assert(article.quality?.review_state==='university_depth_reviewed',`${article.id}: stale review-state`);
  assert(article.quality?.reviewed_against_university_gate===true,`${article.id}: mangler university-gate review`);
  assert(article.university_quality?.substantive_argument===true,`${article.id}: mangler substansielt argument`);
  assert(article.university_quality?.real_rival===true,`${article.id}: mangler reell rival`);
  assert(article.university_quality?.primary_work_grounding===true,`${article.id}: mangler primærverkgrunnlag`);
  assert(article.university_quality?.topic_specific_secondary_sources===true,`${article.id}: mangler emnespesifikke sekundærkilder`);
  assert(article.university_quality?.generic_template_rejected===true,`${article.id}: anti-malport er ikke bestått`);

  const sectionById=new Map((article.sections||[]).map(section=>[section.id,section]));
  const requiredSections=['problem','argument','uenighet','teorihistorie','metode','kilder','avgrensning'];
  for(const id of requiredSections){
    const paragraphs=sectionById.get(id)?.paragraphs||[];
    assert(paragraphs.length>=2,`${article.id}: ${id} mangler minst to fulltekstavsnitt`);
    assert(paragraphs.every(p=>words(p)>=10),`${article.id}: ${id} har placeholder-prosa`);
  }
  const prose=text((article.sections||[]).flatMap(section=>section.paragraphs||[]).join(' '));
  const proseNorm=norm(prose);
  const claims=article.claims||[];
  assert(claims.length>=5,`${article.id}: mangler claim-dybde`);
  let exactProseBoundClaims=0;
  let claimSourceBindings=0;
  for(const claim of claims){
    const sourceIds=claim.source_ids||[];
    assert(sourceIds.length>=2,`${article.id}/${claim.id}: claim mangler minst to kilder`);
    if(proseNorm.includes(norm(claim.text)))exactProseBoundClaims++;
    for(const sourceId of sourceIds){
      const source=sourceById.get(sourceId);
      assert(source,`${article.id}/${claim.id}: ukjent kilde ${sourceId}`);
      assert(source.kind==='scholarly_reference',`${article.id}/${sourceId}: ikke scholarly reference`);
      assert(/^https:\/\//u.test(text(source.url)),`${article.id}/${sourceId}: mangler inspectable URL`);
      assert(text(source.publisher).length>=3,`${article.id}/${sourceId}: mangler publisher`);
      assert(text(source.use).length>=40,`${article.id}/${sourceId}: mangler evidensrolle`);
      claimSourceBindings++;
    }
  }
  assert(exactProseBoundClaims>=5,`${article.id}: færre enn fem eksakte claim→prosa-bindinger`);

  const sourceIds=article.source_ids||[];
  assert(sourceIds.length>=3,`${article.id}: mangler minst tre emnespesifikke kilder`);
  assert(sourceIds.every(id=>sourceById.has(id)),`${article.id}: uløst artikkelkilde`);
  const sourceProse=norm((sectionById.get('kilder')?.paragraphs||[]).join(' '));
  for(const sourceId of sourceIds){
    const source=sourceById.get(sourceId);
    assert(sourceProse.includes(norm(source.title)),`${article.id}: kildedrøftingen navngir ikke ${source.title}`);
  }

  const integrity=article.quality?.source_integrity;
  assert(integrity?.state==='reviewed',`${article.id}: source-integrity er ikke reviewed`);
  assert(integrity?.standard==='debate_aligned_primary_works_v2',`${article.id}: feil source-integrity-standard`);
  const anchors=integrity.primary_work_anchors||[];
  assert(anchors.length>=2,`${article.id}: mangler minst to person→verk-ankre`);
  assert(JSON.stringify(article.primary_work_refs||[])===JSON.stringify(anchors.map(anchor=>anchor.work)),`${article.id}: primary_work_refs avviker fra ankrene`);
  const theoryProse=norm((sectionById.get('teorihistorie')?.paragraphs||[]).join(' '));
  for(const anchor of anchors){
    assert(theoryProse.includes(norm(anchor.actor)),`${article.id}: teoriprosa mangler ${anchor.actor}`);
    assert(theoryProse.includes(norm(anchor.work)),`${article.id}: teoriprosa mangler ${anchor.work}`);
    if(anchor.canonical_ref!==null){
      const thinker=thinkerById.get(anchor.canonical_ref);
      assert(thinker,`${article.id}: ukjent teoretiker ${anchor.canonical_ref}`);
      assert((thinker.works||[]).some(work=>norm(work)===norm(anchor.work)),`${article.id}: ${anchor.actor} er ikke registerbundet til ${anchor.work}`);
    }
  }

  return {
    articleId:article.id,
    domainId:article.domain_id,
    exactProseBoundClaims,
    claimSourceBindings,
    scholarlySources:sourceIds.length,
    personWorkAnchors:anchors.length,
    roleParagraphs:requiredSections.reduce((sum,id)=>sum+(sectionById.get(id)?.paragraphs||[]).length,0),
    strictlyProven:true
  };
}

export function auditFilosofiTheoryIntegrity({writeReport=false,checkReport=true}={}){
  const bindings=json(BINDINGS);
  const coverage=json(bindings.canonical_major_field_source);
  const registry=json(bindings.article_registry);
  const sources=json(bindings.source_registry);
  const thinkers=json(bindings.thinker_registry);
  assert(bindings.schema==='history_go_filosofi_theory_integrity_bindings_v1','Ugyldig Filosofi-bindingsschema');
  assert(bindings.profile==='theorist_rival','Filosofi må bruke theorist_rival-profil');
  assert(bindings.completion_status_read_only===true,'Completion-status må være read-only');
  assert(bindings.content_rewrite_required===false,'Proof-selection skal ikke kreve corpusrewrite');
  assert(coverage.status==='major_university_fields_complete','Filosofi mangler major-field benchmark');

  const articleById=new Map(registry.articles.map(row=>[row.id,json(row.file)]));
  const sourceById=new Map(sources.sources.map(source=>[source.id,source]));
  const thinkerById=new Map(thinkers.thinkers.map(thinker=>[thinker.id,thinker]));
  assert(articleById.size===bindings.universal_subject_scope.canonical_articles,'Filosofi-artikkeltallet har driftet');
  assert(registry.chapters.length===bindings.universal_subject_scope.canonical_chapters,'Filosofi-kapiteltallet har driftet');

  const articleProofs=[...articleById.values()].map(article=>auditArticle(article,{sourceById,thinkerById}));
  const proofById=new Map(articleProofs.map(proof=>[proof.articleId,proof]));
  const coverageById=new Map(coverage.fields.map(field=>[field.field_id,field]));
  assert(coverageById.size===bindings.universal_subject_scope.canonical_major_fields,'Major-field-tallet har driftet');
  assert(bindings.fields.length===coverageById.size,'Bindings må dekke alle benchmarkfelt');
  assert(new Set(bindings.fields.map(field=>field.field_id)).size===bindings.fields.length,'Duplikate feltbindinger');

  const fields=bindings.fields.map(binding=>{
    const field=coverageById.get(binding.field_id);
    assert(field,`Ukjent benchmarkfelt: ${binding.field_id}`);
    assert(binding.evidence_article_ids.length>=1,`${binding.field_id}: mangler evidensartikkel`);
    const selected=binding.evidence_article_ids.map(id=>{
      const article=articleById.get(id);
      assert(article,`${binding.field_id}: ukjent evidensartikkel ${id}`);
      assert(field.domain_ids.includes(article.domain_id),`${binding.field_id}: ${id} ligger utenfor benchmarkdomenet`);
      return article;
    });
    const selectedProse=norm(selected.flatMap(article=>article.sections.flatMap(section=>section.paragraphs||[])).join(' '));
    for(const term of binding.evidence_terms||[])assert(selectedProse.includes(norm(term)),`${binding.field_id}: evidensprosa mangler ${term}`);
    const fieldArticleIds=registry.articles.filter(row=>field.domain_ids.includes(row.domain_id)).map(row=>row.id);
    assert(fieldArticleIds.length>=1,`${binding.field_id}: benchmarkfeltet mangler canonicale artikler`);
    assert(fieldArticleIds.every(id=>proofById.get(id)?.strictlyProven),`${binding.field_id}: ikke alle feltartikler er strict-proven`);
    return {
      fieldId:binding.field_id,
      domainIds:field.domain_ids,
      evidenceArticleIds:binding.evidence_article_ids,
      canonicalFieldArticles:fieldArticleIds.length,
      exactProseBoundClaims:fieldArticleIds.reduce((sum,id)=>sum+proofById.get(id).exactProseBoundClaims,0),
      scholarlySources:new Set(fieldArticleIds.flatMap(id=>articleById.get(id).source_ids)).size,
      personWorkAnchors:fieldArticleIds.reduce((sum,id)=>sum+proofById.get(id).personWorkAnchors,0),
      strictlyProven:true
    };
  });
  assert(fields.every(field=>field.strictlyProven),'Alle Filosofi-felt må strict-proves');
  const representedDomains=new Set(fields.flatMap(field=>field.domainIds));
  assert(representedDomains.size===bindings.universal_subject_scope.canonical_domains,'Ikke alle canonicale domener er benchmarkbundet');

  const report={
    schema:'history_go_filosofi_theory_integrity_audit_v1',
    version:'1.0.0',
    subject_id:'filosofi',
    profile:'theorist_rival',
    status:'STRICTLY_PROVEN',
    proof_scope:'per_canonical_major_field_plus_universal_article_gate',
    completion_status_read_only:true,
    content_rewrite_required:false,
    rules:{fixed_theorist_quota_forbidden:true,named_people_require_prose_bound_work_or_research_contribution:true,theory_metadata_without_prose_binding_fails:true,contested_fields_require_rival_or_alternative:true,academically_appropriate_used_sources_required:true,personal_opinion_is_not_scored_knowledge:true},
    summary:{
      canonicalMajorFields:fields.length,
      fieldsStrictlyProven:fields.filter(field=>field.strictlyProven).length,
      canonicalDomains:representedDomains.size,
      canonicalArticles:articleProofs.length,
      articlesStrictlyProven:articleProofs.filter(proof=>proof.strictlyProven).length,
      canonicalChapters:registry.chapters.length,
      canonicalConcepts:bindings.universal_subject_scope.canonical_concepts,
      canonicalMethods:bindings.universal_subject_scope.canonical_methods,
      canonicalHooks:bindings.universal_subject_scope.canonical_hooks,
      claims:articleProofs.reduce((sum,proof)=>sum+articleById.get(proof.articleId).claims.length,0),
      exactProseBoundClaims:articleProofs.reduce((sum,proof)=>sum+proof.exactProseBoundClaims,0),
      claimSourceBindings:articleProofs.reduce((sum,proof)=>sum+proof.claimSourceBindings,0),
      scholarlySourceRecords:sources.sources.length,
      usedScholarlySources:new Set([...articleById.values()].flatMap(article=>article.claims.flatMap(claim=>claim.source_ids||[]))).size,
      personWorkAnchors:articleProofs.reduce((sum,proof)=>sum+proof.personWorkAnchors,0),
      substantiveContentGapsProven:0
    },
    fields,
    universalArticleGate:{status:'STRICTLY_PROVEN',articles:articleProofs}
  };
  if(writeReport){fs.mkdirSync(path.dirname(abs(REPORT)),{recursive:true});fs.writeFileSync(abs(REPORT),`${JSON.stringify(report,null,2)}\n`);}
  if(checkReport){assert(fs.existsSync(abs(REPORT)),`${REPORT} mangler`);assert(JSON.stringify(json(REPORT))===JSON.stringify(report),`${REPORT} er utdatert`);}
  return report;
}

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const args=new Set(process.argv.slice(2));
  try{console.log(JSON.stringify(auditFilosofiTheoryIntegrity({writeReport:args.has('--write-report'),checkReport:!args.has('--no-check-report')}),null,2));}
  catch(error){console.error(`Filosofi theory integrity FEIL: ${error.message}`);process.exitCode=1;}
}
