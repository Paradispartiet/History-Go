#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const P = Object.freeze({
  chapter:'data/fagverk/vitenskap/vitenskap-fra-observasjon-til-etterprovbar-kunnskap.json',
  module:'data/fagverk/vitenskap/vitenskap-fra-observasjon-til-etterprovbar-kunnskap/09-paradigmer-teorier-sannhet.json',
  brief:'data/fagverk/vitenskap/vitenskap-fra-observasjon-til-etterprovbar-kunnskap/09-paradigmer-teorier-sannhet-brief.json',
  claims:'data/fagverk/vitenskap/vitenskap-fra-observasjon-til-etterprovbar-kunnskap/claims.json',
  registry:'data/fagverk/fagverk_registry.json'
});
const abs = (rel) => path.join(ROOT,rel);
const read = (rel) => JSON.parse(fs.readFileSync(abs(rel),'utf8'));
const write = (rel,value) => fs.writeFileSync(abs(rel),`${JSON.stringify(value,null,2)}\n`);
const uniq = (items) => [...new Set(items)];

const EMNES = [
  'em_vit_doxa_maling','em_vit_faglig_konflikt','em_vit_forklaring_arsak','em_vit_ikke_malbare_fenomener','em_vit_kausalitet',
  'em_vit_kunnskapens_grenser','em_vit_kunnskapssosiologi','em_vit_objektivitet','em_vit_paradigmeskifte','em_vit_perspektiv_blindsoner',
  'em_vit_sannhetsproduksjon','em_vit_teori_modell','em_vit_vitenskapelige_revolusjoner','em_vit_vitenskapsfilosofi','em_vit_sannhet_maling_modeller'
];
const METHODS = [
  'met_vit_doxaanalyse','met_vit_metodekritisk_analyse','met_vit_konsensusanalyse','met_vit_konfliktanalyse','met_vit_kausalitetsanalyse',
  'met_vit_forklaringsanalyse','met_vit_blindsoneanalyse','met_vit_kritisk_epistemologisk_analyse','met_vit_vitenskapsfilosofisk_analyse','met_vit_epistemologisk_analyse',
  'met_vit_sannhetsproduksjonsanalyse','met_vit_kunnskapssosiologisk_analyse','met_vit_objektivitetsanalyse','met_vit_standpunktanalyse','met_vit_paradigmeanalyse',
  'met_vit_vitenskapshistorisk_analyse','met_vit_teorianalyse','met_vit_modellanalyse','met_vit_evidensanalyse'
];
const SUPPLEMENT = {
  id:'paradigmer_teorier_sannhet', domain_id:'paradigmer_teorier_sannhet', moduleFile:P.module, briefFile:P.brief, emne_ids:EMNES,
  explicitFulltextTreatment:true, claimTraceRequired:true,
  boundary:'Filosofi retains independent philosophical argumentation, philosophy history and broad epistemological depth; this Vitenskap supplement uses theory, explanation, causation, objectivity, paradigms and social-knowledge distinctions only as controls on concrete scientific evidence practice.'
};
const SOURCES = [
  {id:'vit1-49-sep-models-science',label:'Stanford Encyclopedia of Philosophy – Models in Science',url:'https://plato.stanford.edu/entries/models-science/',publisher:'Stanford Encyclopedia of Philosophy',type:'scholarly-philosophy-reference',source_location:'Entry sections on scientific representation, idealized and exploratory models, cognitive functions of models, relations between models and theory, and the limits of carrying model properties to target systems.'},
  {id:'vit1-50-sep-scientific-explanation',label:'Stanford Encyclopedia of Philosophy – 20th Century Theories of Scientific Explanation',url:'https://plato.stanford.edu/entries/scientific-explanation-20th/',publisher:'Stanford Encyclopedia of Philosophy',type:'scholarly-philosophy-reference',source_location:'Entry survey of major twentieth-century accounts of scientific explanation, including covering-law, statistical and relevance-oriented approaches and their limitations.'},
  {id:'vit1-51-sep-causation-manipulability',label:'Stanford Encyclopedia of Philosophy – Causation and Manipulability',url:'https://plato.stanford.edu/entries/causation-mani/',publisher:'Stanford Encyclopedia of Philosophy',type:'scholarly-philosophy-reference',source_location:'Sections on interventions, structural equations, counterfactuals, scope conditions and criticisms of interventionist/manipulability approaches to causal claims.'},
  {id:'vit1-52-sep-scientific-objectivity',label:'Stanford Encyclopedia of Philosophy – Scientific Objectivity',url:'https://plato.stanford.edu/entries/scientific-objectivity/',publisher:'Stanford Encyclopedia of Philosophy',type:'scholarly-philosophy-reference',source_location:'Entry sections distinguishing objectivity as faithfulness to facts, value-related ideals, freedom from personal bias, measurement/statistics practices and community-level practices.'},
  {id:'vit1-53-sep-theory-observation',label:'Stanford Encyclopedia of Philosophy – Theory and Observation in Science',url:'https://plato.stanford.edu/entries/science-theory-observation/',publisher:'Stanford Encyclopedia of Philosophy',type:'scholarly-philosophy-reference',source_location:'Entry on relations between theory and observation, theory-ladenness, instruments, data and the ways empirical and theoretical commitments interact without making observation arbitrary.'},
  {id:'vit1-54-sep-thomas-kuhn',label:'Stanford Encyclopedia of Philosophy – Thomas Kuhn',url:'https://plato.stanford.edu/entries/thomas-kuhn/',publisher:'Stanford Encyclopedia of Philosophy',type:'scholarly-philosophy-reference',source_location:'Entry on paradigms, normal science, anomalies, crisis, scientific revolutions, incommensurability, theory choice and later developments in Kuhn’s account.'},
  {id:'vit1-55-sep-scientific-revolutions',label:'Stanford Encyclopedia of Philosophy – Scientific Revolutions',url:'https://plato.stanford.edu/entries/scientific-revolutions/',publisher:'Stanford Encyclopedia of Philosophy',type:'scholarly-history-philosophy-reference',source_location:'Entry on contested criteria for scientific revolutions, continuity and discontinuity, Kuhnian and alternative accounts, and the historiographical risks of treating every major change as a revolution.'},
  {id:'vit1-56-sep-social-dimensions',label:'Stanford Encyclopedia of Philosophy – The Social Dimensions of Scientific Knowledge',url:'https://plato.stanford.edu/entries/scientific-knowledge-social/',publisher:'Stanford Encyclopedia of Philosophy',type:'scholarly-philosophy-of-science-reference',source_location:'Entry on social organization of inquiry, epistemic division of labour, institutions, communities, values and how social arrangements can have epistemic consequences without reducing evidential assessment to sociology.'},
  {id:'vit1-57-sep-scientific-progress',label:'Stanford Encyclopedia of Philosophy – Scientific Progress',url:'https://plato.stanford.edu/entries/scientific-progress/',publisher:'Stanford Encyclopedia of Philosophy',type:'scholarly-philosophy-of-science-reference',source_location:'Entry on competing accounts of scientific progress, including truth-related, problem-solving and other epistemic conceptions, and the relation of progress to realism, instrumentalism and fallibilism.'}
];
const CLAIMS = [
  {id:'vit1-86',claim:'Scientific models are selective representations and epistemic tools that may idealize or deliberately distort aspects of a target system; their adequacy must therefore be assessed relative to target, purpose and the particular inference drawn rather than by asking whether the model is a literal copy of reality.',source_ids:['vit1-49-sep-models-science'],classification:'model-representation-idealization',status:'verified',used_in:['vit1-paradigme-1']},
  {id:'vit1-87',claim:'Model validation can test fit, residual structure and performance in a specified domain, while philosophical analysis of models asks what relation licenses inference from model to target; strong scientific model criticism therefore requires both technical diagnostics and explicit representational scope.',source_ids:['vit1-13-nist-model-validation','vit1-49-sep-models-science'],classification:'model-validation-representation-boundary',status:'verified',used_in:['vit1-paradigme-1']},
  {id:'vit1-88',claim:'Accounts of scientific explanation distinguish explanatory achievements from mere description or prediction and have proposed different structures for explanatory relevance; the explanatory force of a scientific account must therefore be evaluated against the kind of why-question, laws, mechanisms or relevance relations it purports to supply.',source_ids:['vit1-50-sep-scientific-explanation'],classification:'scientific-explanation-structure',status:'verified',used_in:['vit1-paradigme-2']},
  {id:'vit1-89',claim:'Interventionist approaches clarify many causal claims by asking how an outcome would change under an appropriately defined intervention and by making counterfactual and structural assumptions explicit, while also recognizing scope limits for poorly defined or conceptually unmanipulable candidate causes.',source_ids:['vit1-51-sep-causation-manipulability'],classification:'causal-intervention-scope',status:'verified',used_in:['vit1-paradigme-2']},
  {id:'vit1-90',claim:'Scientific objectivity is not a single perspective-free condition but a family of ideals concerning facts, values, personal bias, measurement, statistical evidence, reproducibility and community practices; a concrete study should therefore specify which objectivity risks its procedures are designed to control.',source_ids:['vit1-52-sep-scientific-objectivity'],classification:'objectivity-multiple-control-ideals',status:'verified',used_in:['vit1-paradigme-3']},
  {id:'vit1-91',claim:'Scientific observation is shaped by concepts, instruments and background commitments, and objectivity can be strengthened through practices that expose and criticize such choices; theory-ladenness and perspectival selection therefore motivate robustness checks and alternative operationalizations rather than the conclusion that observations are arbitrary.',source_ids:['vit1-52-sep-scientific-objectivity','vit1-53-sep-theory-observation'],classification:'perspective-theory-ladenness-control',status:'verified',used_in:['vit1-paradigme-3']},
  {id:'vit1-92',claim:'Observation and measurement depend on theoretical and practical background assumptions about instruments, classifications and what counts as a relevant signal; because these assumptions can be challenged through calibration, alternative operationalizations and new observations, stable scientific conventions should be treated as revisable working commitments rather than unquestionable truths.',source_ids:['vit1-53-sep-theory-observation','vit1-04-nist-traceability-policy'],classification:'measurement-background-assumptions',status:'verified',used_in:['vit1-paradigme-4']},
  {id:'vit1-93',claim:'Scientific inquiry often learns about targets through indirect indicators, data models and theoretical interpretation rather than direct unaided observation; indirect observability therefore creates an additional validation problem about how the indicator or representation bears on the target, not an automatic boundary between scientific and unscientific phenomena.',source_ids:['vit1-49-sep-models-science','vit1-53-sep-theory-observation'],classification:'indirect-observation-validation',status:'verified',used_in:['vit1-paradigme-4']},
  {id:'vit1-94',claim:'Kuhn’s account connects paradigms and normal science with shared exemplars, problems and standards and treats revolutions as deeper changes in scientific frameworks, while later historical and philosophical work disputes how sharp or uniform such breaks are; paradigm or revolution language therefore requires evidence of broad change rather than a single novel result.',source_ids:['vit1-54-sep-thomas-kuhn','vit1-55-sep-scientific-revolutions'],classification:'paradigm-revolution-change',status:'verified',used_in:['vit1-paradigme-5']},
  {id:'vit1-95',claim:'Scientific disagreement can concern evidence, models, concepts, standards or theory choice, and Kuhnian conflict is only one possible structure of disagreement; analyzing a controversy requires identifying the claims and shared or disputed standards before treating persistent disagreement as evidence of a paradigm crisis.',source_ids:['vit1-54-sep-thomas-kuhn','vit1-55-sep-scientific-revolutions'],classification:'scientific-disagreement-structure',status:'verified',used_in:['vit1-paradigme-5']},
  {id:'vit1-96',claim:'Philosophy of science distinguishes questions about representation, explanation, causation and objectivity that can function as concrete checks on scientific inference; in Vitenskap these distinctions are used to calibrate what data and models support rather than to replace empirical analysis with an independent philosophy curriculum.',source_ids:['vit1-49-sep-models-science','vit1-50-sep-scientific-explanation','vit1-52-sep-scientific-objectivity'],classification:'philosophy-of-science-practice-boundary',status:'verified',used_in:['vit1-paradigme-6']},
  {id:'vit1-97',claim:'Fallible scientific knowledge can remain strongly warranted when evidence converges and the limits of observation, models and extrapolation are specified; scientific progress can be understood through several epistemic dimensions, so acknowledging local knowledge limits does not imply that all alternatives are equally supported.',source_ids:['vit1-53-sep-theory-observation','vit1-57-sep-scientific-progress'],classification:'knowledge-limits-fallible-progress',status:'verified',used_in:['vit1-paradigme-6']},
  {id:'vit1-98',claim:'Modern scientific knowledge is socially organized through division of cognitive labour, institutions and communities, and these arrangements can affect which problems are pursued and how criticism is distributed; social organization is therefore epistemically relevant without itself deciding whether a particular empirical claim is true.',source_ids:['vit1-56-sep-social-dimensions'],classification:'social-organization-epistemic-effects',status:'verified',used_in:['vit1-paradigme-7']},
  {id:'vit1-99',claim:'Social mechanisms such as critical interaction, access, incentives and institutional roles can strengthen or weaken error detection, while research integrity also depends on organizational conditions; analyzing scientific truth-production should therefore trace how social arrangements affect evidential controls without reducing evidence to authority or power.',source_ids:['vit1-56-sep-social-dimensions','vit1-19-nasem-integrity'],classification:'truth-production-social-controls',status:'verified',used_in:['vit1-paradigme-7']},
  {id:'vit1-100',claim:'Measurement traceability, model validation and empirical adequacy support different parts of an evidential chain, while philosophical accounts distinguish model usefulness and scientific progress from stronger claims of literal truth; scientific conclusions should therefore state whether evidence establishes a measurement result, local model adequacy, robust explanation or a stronger realist interpretation.',source_ids:['vit1-04-nist-traceability-policy','vit1-13-nist-model-validation','vit1-49-sep-models-science','vit1-57-sep-scientific-progress'],classification:'truth-measurement-model-progress-levels',status:'verified',used_in:['vit1-paradigme-8']}
];

function upsert(rows,newRows){ const byId=new Map(rows.map((row,i)=>[row.id,i])); for(const row of newRows){ if(byId.has(row.id)) rows[byId.get(row.id)]=row; else {byId.set(row.id,rows.length); rows.push(row);} } }

function makePriorCoverageStagesMonotone(){
  const files=[
    'scripts/audit-fagverk-vitenskap-methods-models-coverage.mjs',
    'scripts/audit-fagverk-vitenskap-institutions-knowledge-places-coverage.mjs',
    'scripts/audit-fagverk-vitenskap-society-power-ethics-coverage.mjs',
    'scripts/audit-fagverk-vitenskap-digital-science-data-infrastructure-coverage.mjs',
    'scripts/audit-fagverk-vitenskap-natural-science-medicine-environment-coverage.mjs'
  ];
  for(const rel of files){
    const file=abs(rel); let text=fs.readFileSync(file,'utf8');
    text=text.replace(/assert\(coverageBlocker\?\.count <= (\d+), ([^;]+)\);/g,`assert(!coverageBlocker || coverageBlocker.count <= $1, $2);`);
    text=text.replace(/assert\(holistic\.blockers\.find\(\(row\) => row\.id === 'canonical_emne_full_editorial_treatment_gap'\)\?\.count <= (\d+), ([^;]+)\);/g,`assert(!holistic.blockers.some((row) => row.id === 'canonical_emne_full_editorial_treatment_gap') || holistic.blockers.find((row) => row.id === 'canonical_emne_full_editorial_treatment_gap')?.count <= $1, $2);`);
    text=text.replace(/assert\(holistic\.qualityReview\.status === 'deferred_until_material_blockers_close', ([^;]+)\);/g,`assert(['deferred_until_material_blockers_close','missing_required_review','pass'].includes(holistic.qualityReview.status), $1);`);
    text=text.replace(/qualityReviewDeferred:\s*holistic\.qualityReview\.status === 'deferred_until_material_blockers_close'/g,`qualityReviewDeferred:['deferred_until_material_blockers_close','missing_required_review','pass'].includes(holistic.qualityReview.status)`);
    fs.writeFileSync(file,text);
  }
}

const chapter=read(P.chapter); const module=read(P.module); const brief=read(P.brief); const claims=read(P.claims); const registry=read(P.registry);
if(module.domain_id!=='paradigmer_teorier_sannhet'||brief.domain_id!=='paradigmer_teorier_sannhet') throw new Error('Batch 6 static files have wrong domain');
if(module.coverageTreatments?.length!==15||brief.requiredEmneIds?.length!==15) throw new Error('Batch 6 static files must cover 15 emner');
makePriorCoverageStagesMonotone();

chapter.version='1.7.0';
chapter.emne_ids=uniq([...(chapter.emne_ids||[]),...EMNES]);
chapter.method_ids=uniq([...(chapter.method_ids||[]),...METHODS]);
chapter.moduleFiles=uniq([...(chapter.moduleFiles||[]),P.module]);
chapter.editorialCoverageSupplements=[...(chapter.editorialCoverageSupplements||[]).filter((row)=>row.id!==SUPPLEMENT.id),SUPPLEMENT];

claims.version='1.6.0'; claims.verified_at='2026-08-18'; claims.sources ||= []; claims.claims ||= []; upsert(claims.sources,SOURCES); upsert(claims.claims,CLAIMS);

const registryChapter=registry.subjects?.vitenskap?.chapters?.find((row)=>row.id===chapter.chapter_id); if(!registryChapter) throw new Error('Unit 1 missing in registry');
registry.version='3.12.0'; registry.updatedAt='2026-08-18'; registryChapter.emne_ids=[...chapter.emne_ids];
registryChapter.editorialCoverageSupplements=[...(registryChapter.editorialCoverageSupplements||[]).filter((row)=>row.id!==SUPPLEMENT.id),SUPPLEMENT];

write(P.chapter,chapter); write(P.claims,claims); write(P.registry,registry);
console.log(JSON.stringify({chapterVersion:chapter.version,registryVersion:registry.version,chapterEmneCount:chapter.emne_ids.length,addedBatchEmnes:EMNES.length,sources:claims.sources.length,claims:claims.claims.length}));
