#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { auditSportPhase3 } from '../scripts/audit-fagverk-sport-phase3.mjs';
import { auditSportEditorialDepth } from '../scripts/audit-fagverk-sport-editorial-depth.mjs';
import { auditSportScientificQuality } from '../scripts/audit-fagverk-sport-scientific-quality.mjs';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const PENSUM='data/fag/sport/sportpensum_canonical_v4_5.json';
const QUALITY='data/fag/sport/sport_quality_manifest_v5.json';
const UNITS='data/fag/sport/theory_units_sport_canonical_v6.json';
const THINKERS='data/fag/sport/teoretikere_sport_canonical_v5.json';
const HOOKS='data/fag/sport/theory_hooks_sport_canonical_v5.json';
const BINDINGS='data/fag/sport/theory_integrity_bindings_sport_v1.json';
const REGISTRY='data/fagverk/fagverk_registry.json';
const ARTICLE_REGISTRY='data/fagverk/sport/sport_article_registry_v1.json';
const REPORT='reports/fagverk/sport-theory-integrity-audit.json';
const ORDER=['arenaer_steder_groundhopper','regler_spill_konkurranse','kropp_trening_prestasjon','klubber_lag_frivillighet','supportere_publikum_kultur','inkludering_helse_lek_samfunn'];
const AUTH=new Set(['scholarly_book','scholarly_primary_book','peer_reviewed_article']);
const abs=p=>path.join(ROOT,p);
const json=p=>JSON.parse(fs.readFileSync(abs(p),'utf8'));
const text=v=>String(v??'').trim();
const norm=v=>text(v).toLocaleLowerCase('nb-NO').normalize('NFKD').replace(/\p{M}/gu,'').replace(/[^\p{L}\p{N}]+/gu,' ');
const assert=(ok,msg)=>{if(!ok)throw new Error(msg);};
const unique=(xs,key)=>new Set(xs.map(key)).size===xs.length;
const authorMatches=(authors,name)=>norm(name).split(' ').filter(part=>part.length>1).every(part=>norm(authors.join(' ')).split(' ').includes(part));

function chapterCorpus(chapterRecord){
  const chapter=json(chapterRecord.file);
  const claimsDoc=json(chapter.claimsFile);
  const sources=chapter.sourcesFile?json(chapter.sourcesFile).sources:(claimsDoc.sources||[]);
  return {claims:new Map((claimsDoc.claims||[]).map(row=>[row.id,row])),sources:new Map(sources.map(row=>[row.id,row]))};
}

function section(article,id){
  const row=(article.sections||[]).find(candidate=>candidate.id===id);
  assert(row,`${article.emne_id}: mangler seksjon ${id}`);
  return row;
}

function assertTheoryParagraph(article,paragraph){
  assert(text(paragraph).length>=320,`${article.emne_id}: teorimekanismen er for kort`);
  for(const marker of ['Mekanismen','En reell alternativ forklaring','kritikk','bruksgrense'])assert(norm(paragraph).includes(norm(marker)),`${article.emne_id}: teorimekanismen mangler ${marker}`);
}

export function auditSportTheoryIntegrity({writeReport=false,checkReport=true}={}){
  const phase3=auditSportPhase3({checkReport:true}).report;
  const editorial=auditSportEditorialDepth({checkReport:true});
  const scientific=auditSportScientificQuality({checkReport:true}).report;
  const pensum=json(PENSUM),quality=json(QUALITY),bridge=json(BINDINGS);
  const unitsDoc=json(UNITS),thinkersDoc=json(THINKERS),hooksDoc=json(HOOKS);
  const sportRegistry=json(REGISTRY).subjects.sport,articleRegistry=json(ARTICLE_REGISTRY);

  assert(pensum.subject_id==='sport'&&bridge.subject_id==='sport','Ugyldig Sport-fag eller proof bridge');
  assert(bridge.schema==='history_go_sport_theory_integrity_bindings_v1'&&bridge.status==='canonical'&&bridge.profile==='hybrid','Sport proof bridge må være canonical hybrid v1');
  assert(bridge.completion_status_read_only===true&&bridge.content_mutation===false,'Sport proof bridge må være read-only uten corpusmutasjon');
  assert(/proveniens.+ikke sportstrivia/iu.test(bridge.production_rule)&&/faktiske claim-sporede artikkelprosaen/iu.test(bridge.production_rule),'Sport proof bridge mangler anti-trivia-/prosaregel');
  assert(phase3.status==='sport_complete'&&phase3.summary.domainCount===6,'Sport strict gate krever komplett 6-felts fase-3-corpus');
  assert(phase3.summary.emneCount===116&&phase3.summary.methodCount===109&&phase3.summary.hookCount===60,'Sport canonical emne-/metode-/hookbaseline har endret seg');
  assert(phase3.summary.registeredChapterCount===6&&phase3.summary.sectionCount===54&&phase3.summary.paragraphCount===162,'Sport kapittelbaseline har endret seg');
  assert(phase3.summary.claimCount===162&&phase3.summary.sourceRegistrationCount===74,'Sport claim-/kildebaseline har endret seg');
  assert(editorial.status==='editorial_depth_complete'&&editorial.summary.standaloneArticleCount===116&&editorial.summary.integratedConceptCount===140,'Sport editorial-depth-baseline er ikke komplett');
  assert(editorial.summary.totalWordCount===134923&&editorial.summary.minimumWordsPerArticle===1015,'Sport fulltekstbaseline har endret seg');
  assert(scientific.status==='scientific_quality_strong'&&scientific.summary.peerReviewedSourceCount===25&&scientific.summary.chaptersMeetingMinimum===6,'Sport scientific-quality-baseline er ikke sterk over alle felt');
  assert(quality.counts?.theory_units===56&&quality.counts?.thinkers_total===183&&quality.counts?.works===123,'Sport V6 teori-/person-/verkbaseline har endret seg');
  assert(quality.production_invariants?.some(row=>/gruppe(funn|nivå).+individuell vurdering/iu.test(row)),'Sport health-safety-regel mangler');

  const units=new Map(unitsDoc.theory_units.map(row=>[row.theory_unit_id,row]));
  const thinkers=new Map(thinkersDoc.thinkers.map(row=>[row.thinker_id,row]));
  const hooks=new Map(hooksDoc.hooks.map(row=>[row.hook_id,row]));
  const domains=new Map(pensum.domains.map(row=>[row.domain_id,row]));
  const chapters=new Map(sportRegistry.chapters.map(row=>[row.id,row]));
  const chapterCorpora=new Map([...chapters].map(([id,row])=>[id,chapterCorpus(row)]));
  const articleRows=new Map(articleRegistry.articles.map(row=>[row.file,row]));
  const sources=new Map(bridge.scholarly_sources.map(row=>[row.id,row]));

  assert(units.size===56&&hooks.size===56&&thinkers.size===183,'Sport quality registries har feil tellinger');
  assert(JSON.stringify(pensum.domain_order)===JSON.stringify(ORDER),'Sport canonical feltrekkefølge har endret seg');
  assert(bridge.fields.length===6&&JSON.stringify(bridge.fields.map(row=>row.domain_id))===JSON.stringify(ORDER),'Sport bridge må dekke alle seks felt i canonical rekkefølge');
  assert(sources.size===12&&bridge.scholarly_sources.length===12,'Sport bridge må ha tolv unike scholarly sources');
  for(const source of sources.values()){
    assert(source.authors?.length&&text(source.title)&&text(source.publisher)&&/^https:\/\//.test(source.url),`Ufullstendig scholarly source: ${source.id}`);
    assert(AUTH.has(source.source_authority_class)&&text(source.source_location).length>=80,`Ikke-faglig eller uinspiserbar scholarly source: ${source.id}`);
  }

  let universalTheoryUnits=0,universalClaimBindings=0;
  const domainArticleCounts=new Map();
  for(const row of articleRegistry.articles){
    const article=json(row.file),domain=domains.get(article.domain_id),corpus=chapterCorpora.get(article.chapter_id);
    assert(domain&&domain.emne_ids.includes(article.emne_id),`${article.emne_id}: artikkelen ligger utenfor canonicalt felt`);
    assert(corpus,`${article.emne_id}: ukjent kapittel`);
    assert(article.theory_unit_ids?.length>=2&&article.theory_unit_ids.every(id=>units.has(id)),`${article.emne_id}: uløst teoridybde`);
    const mechanism=section(article,'mekanisme'),theorySources=section(article,'teori_og_kilder');
    assert(mechanism.paragraphs?.length>=3,`${article.emne_id}: teorisammenligningen er ufullstendig`);
    assertTheoryParagraph(article,mechanism.paragraphs[0]);
    assertTheoryParagraph(article,mechanism.paragraphs[1]);
    assert(/flere teorirammer.+testbar/iu.test(mechanism.paragraphs[2]),`${article.emne_id}: teorisammenligningen er ikke eksplisitt testbar`);
    assert(theorySources.paragraphs?.length>=2&&/Teorihistorisk.+arbeider/iu.test(theorySources.paragraphs[0]),`${article.emne_id}: person–verk-prosa mangler`);
    assert(/teorinavn aldri i seg selv er bevis/iu.test(theorySources.paragraphs[1]),`${article.emne_id}: anti-trivia-regel mangler i faktisk prosa`);
    for(const claimId of article.claim_ids||[]){
      const claim=corpus.claims.get(claimId);
      assert(claim&&claim.sourceIds?.length&&claim.sourceIds.every(id=>corpus.sources.has(id)),`${article.emne_id}: uløst claim ${claimId}`);
      universalClaimBindings+=1;
    }
    universalTheoryUnits+=article.theory_unit_ids.length;
    domainArticleCounts.set(article.domain_id,(domainArticleCounts.get(article.domain_id)||0)+1);
  }
  assert(articleRegistry.articles.length===116&&domainArticleCounts.size===6,'Sport universal artikkelkontroll må dekke 116 artikler og 6 felt');
  assert(universalTheoryUnits>=232&&universalClaimBindings>=116,'Sport universal teori-/claimkontroll er ufullstendig');

  const usedObjectIds=[],usedSourceIds=[],usedArticles=[],rows=[];
  for(const field of bridge.fields){
    assert(domains.has(field.domain_id),`Ukjent Sport-felt: ${field.domain_id}`);
    assert(field.theory_objects?.length===2,`${field.domain_id}: strict proof krever eksakt to theory objects`);
    assert(unique(field.theory_objects,row=>row.id),`${field.domain_id}: duplisert theory object`);
    const objectIds=field.theory_objects.map(row=>row.id);
    assert(new Set(field.comparison?.theory_object_ids||[]).size===2&&objectIds.every(id=>field.comparison.theory_object_ids.includes(id)),`${field.domain_id}: comparison må binde begge theory objects`);
    assert(text(field.comparison.interpretive_consequence).length>=180,`${field.domain_id}: comparison mangler fortolkningskonsekvens`);
    for(const object of field.theory_objects){
      usedObjectIds.push(object.id);usedSourceIds.push(object.scholarly_source_id);usedArticles.push(object.content_binding?.article_file);
      const unit=units.get(object.theory_unit_id),thinker=thinkers.get(object.thinker_id),source=sources.get(object.scholarly_source_id);
      assert(unit&&hooks.has(unit.hook_id),`${object.id}: canonical teorienhet/hook finnes ikke`);
      assert(text(unit.main_theory).length>=20&&text(unit.mechanism).length>=60,`${object.id}: teorienheten mangler scope/mekanisme`);
      assert(text(unit.rival_or_alternative).length>=20,`${object.id}: reell rival mangler`);
      assert(unit.criticism?.length>=2&&unit.boundary_conditions?.length>=2,`${object.id}: kritikk eller bruksgrenser mangler`);
      assert([...unit.main_thinker_ids,...unit.rival_thinker_ids].includes(object.thinker_id),`${object.id}: person er ikke bundet til teorienheten`);
      const work=(unit.primary_works||[]).find(row=>row.thinker_id===object.thinker_id&&row.title===object.work);
      assert(work,`${object.id}: konkret verk mangler i teorienheten`);
      assert(thinker?.status==='active'&&thinker.direct_theory_use_allowed===true&&thinker.theory_readiness==='primary_source_ready',`${object.id}: person er ikke klar for direkte teoribruk`);
      assert((thinker.selected_works||[]).some(row=>row.title===object.work),`${object.id}: verk mangler i personregisteret`);
      assert(source?.title===object.work&&authorMatches(source.authors,thinker.name),`${object.id}: scholarly person–verk-binding er ugyldig`);

      const binding=object.content_binding,articleRow=articleRows.get(binding?.article_file);
      assert(articleRow,`${object.id}: artikkelen er ikke i permanent register`);
      const article=json(binding.article_file),corpus=chapterCorpora.get(article.chapter_id);
      assert(article.domain_id===field.domain_id&&article.emne_id===binding.emne_id,`${object.id}: artikkel/felt/emne-binding avviker`);
      assert(article.theory_unit_ids.includes(object.theory_unit_id),`${object.id}: artikkelen bruker ikke teorienheten`);
      const mechanism=section(article,binding.mechanism_section_id),sourceSection=section(article,binding.theory_source_section_id);
      const prose=mechanism.paragraphs?.[binding.mechanism_paragraph_index],sourceProse=sourceSection.paragraphs?.[binding.theory_source_paragraph_index];
      assertTheoryParagraph(article,prose);
      for(const fragment of [unit.main_theory,unit.mechanism,unit.rival_or_alternative,unit.criticism[0],unit.boundary_conditions[0]])assert(norm(prose).includes(norm(fragment)),`${object.id}: faktisk prosa mangler canonicalt teorifragment`);
      assert(norm(sourceProse).includes(norm(thinker.name))&&norm(sourceProse).includes(norm(object.work)),`${object.id}: faktisk person–verk-prosa mangler`);
      const claim=corpus.claims.get(binding.claim_id),chapterSource=corpus.sources.get(binding.chapter_source_id);
      assert((article.claim_ids||[]).includes(binding.claim_id)&&(article.chapter_source_ids||[]).includes(binding.chapter_source_id),`${object.id}: proof-utvalget ligger utenfor artikkelens provenance`);
      assert(claim?.sourceIds?.includes(binding.chapter_source_id),`${object.id}: claim og chapter source er ikke koblet`);
      assert(chapterSource&&/^https:\/\//.test(chapterSource.url),`${object.id}: chapter source er ikke ekstern og inspiserbar`);
    }
    rows.push({domainId:field.domain_id,strictlyProven:true,theoryObjectCount:2,scholarlySourceCount:2,personWorkBindingCount:2,claimBindingCount:2,actualProseBindingCount:2,universalArticleGate:true,healthSafetyGuard:true});
  }
  assert(usedObjectIds.length===12&&new Set(usedObjectIds).size===12,'Sport strict gate krever tolv unike theory objects');
  assert(usedSourceIds.length===12&&new Set(usedSourceIds).size===12,'Alle tolv scholarly sources må brukes eksakt én gang');
  assert(usedArticles.length===12&&new Set(usedArticles).size===12,'Sport proof-utvalget må bruke tolv ulike fulltekstartikler');

  const report={
    schema:'history_go_sport_theory_integrity_audit_v1',version:'1.0.0',subject_id:'sport',status:'STRICTLY_PROVEN',proof_scope:'per_canonical_major_field',profile:'hybrid',completion_status_read_only:true,content_rewrite_required:false,
    health_safety:'verified_group_evidence_not_individual_medical_or_performance_advice',
    summary:{canonicalMajorFields:6,fieldsStrictlyProven:6,theoryObjects:12,scholarlySources:12,personWorkBindings:12,claimBindings:12,actualProseBindings:12,theorySourceProseBindings:12,universalArticlesValidated:116,substantiveContentGapsProven:0},
    lockedBaseline:{topics:116,methods:109,canonicalTopicHooks:60,qualityTheoryHooks:56,theoryUnits:56,thinkers:183,primaryWorks:123,registeredChapters:6,sections:54,paragraphs:162,claims:162,chapterSources:74,peerReviewedSources:25,standaloneArticles:116,canonicalConcepts:140,totalArticleWords:134923},
    sourceModel:{theoryGrounding:'canonical theory unit + named person + concrete work + academically appropriate source',appliedEvidence:'existing article prose + exact claim-ledger source binding',universalScope:'all 116 articles retain at least two theory units, mechanism, rival, criticism, boundary and anti-trivia prose',safety:'group evidence never becomes individual diagnosis, medical advice or performance prognosis'},
    fields:rows
  };
  if(writeReport){fs.mkdirSync(path.dirname(abs(REPORT)),{recursive:true});fs.writeFileSync(abs(REPORT),`${JSON.stringify(report,null,2)}\n`);}
  if(checkReport){assert(fs.existsSync(abs(REPORT)),`${REPORT} mangler`);assert(JSON.stringify(json(REPORT))===JSON.stringify(report),`${REPORT} er utdatert`);}
  return report;
}

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const args=new Set(process.argv.slice(2));
  try{console.log(JSON.stringify(auditSportTheoryIntegrity({writeReport:args.has('--write-report'),checkReport:!args.has('--no-check-report')}),null,2));}
  catch(error){console.error(`Sport theory integrity FEIL: ${error.message}`);process.exitCode=1;}
}
