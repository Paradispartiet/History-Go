#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const CONTRACT='data/fag/fagverk_theory_quality_contract_v1.json';
const STATUS='data/fagverk/subject_status.json';
const REPORT='reports/fagverk/fagverk-theory-quality-audit.json';
const EXCLUDED=new Set(['data/fag/musikk/emnergvb_musikk.json']);
const SUBJECT_ROOT_ALIASES={film_tv:['data/fag/TV_og_Film/theory_objects_film_tv_canonical_v1.json']};
const ARCHIVE=/(^|\/)(arkiv|archive)(\/|$)/i;
const THEORY=new Set(['theories','teorier','theory_hooks','theoryHooks','topic_hooks','topicHooks','theory_lane','theory_lanes','theoryLane','theoryLanes','theory_objects','theoryObjects','model_objects','modelObjects','models','modeller','frameworks','rammeverk','paradigms','paradigmer','laws','lover','principles','prinsipper']);
const PEOPLE=new Set(['thinkers','theorists','theoreticians','teoretikere','debate_thinkers','debateThinkers','researchers','forskere','scholars']);
const WORKS=new Set(['works','verk','work_refs','workRefs','primary_works','primaryWorks','key_works','keyWorks','scholarly_source','scholarlySource','scholarly_sources','scholarlySources']);
const BINDINGS=new Set(['emne_id','emne_ids','claim_id','claim_ids','used_in','topic_hook_id','topic_hook_ids','theory_ref','theory_refs','paragraphClaimIds','paragraph_claim_ids','claim_source_ids','scholarly_refs']);
const RIVAL=/(rival|alternativ|competing|debate|motperspektiv|counter|contested)/i;
const LIMIT=/(limitation|begrens|assumption|forutset|validity|gyldighet|scope|misuse|caveat|forbehold)/i;
const THEORY_TEXT=/\b(teori|theory|modell|model|paradigm|rammeverk|framework|skole|school|retning|perspektiv)\b/gi;
const abs=p=>path.join(ROOT,p), exists=p=>fs.existsSync(abs(p)), json=p=>JSON.parse(fs.readFileSync(abs(p),'utf8')), assert=(ok,msg)=>{if(!ok)throw new Error(msg);};

function walk(rel){
 if(!exists(rel)||ARCHIVE.test(rel)||EXCLUDED.has(rel)) return [];
 const st=fs.statSync(abs(rel)); if(st.isFile()) return rel.endsWith('.json')?[rel]:[];
 return fs.readdirSync(abs(rel),{withFileTypes:true}).flatMap(e=>walk(path.posix.join(rel,e.name)));
}
function count(v){if(Array.isArray(v))return v.length;if(v&&typeof v==='object'){const ks=Object.keys(v);return ks.length&&ks.every(k=>v[k]&&typeof v[k]==='object')?ks.length:(ks.length?1:0);}return v==null||v===''?0:1;}
function inspect(v,m,k=''){
 if(THEORY.has(k))m.structuredUnits+=count(v); if(PEOPLE.has(k))m.namedPeople+=count(v); if(WORKS.has(k))m.works+=count(v); if(BINDINGS.has(k))m.contentBindings+=count(v);
 if(RIVAL.test(k))m.rivalSignals+=Math.max(1,count(v)); if(LIMIT.test(k))m.limitSignals+=Math.max(1,count(v));
 if(typeof v==='string'){m.theoryTextMentions+=(v.match(THEORY_TEXT)||[]).length;return;} if(Array.isArray(v)){v.forEach(x=>inspect(x,m,k));return;} if(v&&typeof v==='object')Object.entries(v).forEach(([x,y])=>inspect(y,m,x));
}
function scan(id){
 const roots=[`data/fag/${id}`,`data/fag/${id}.json`,`data/fagverk/${id}`,`data/fagverk/${id}.json`,...(SUBJECT_ROOT_ALIASES[id]||[])];
 const files=[...new Set(roots.flatMap(walk))].sort();
 const m={filesScanned:files.length,structuredUnits:0,namedPeople:0,works:0,contentBindings:0,rivalSignals:0,limitSignals:0,theoryTextMentions:0}, parseFailures=[];
 for(const f of files){try{inspect(json(f),m);}catch(e){parseFailures.push({file:f,error:String(e.message||e)});}}
 m.namedPeopleOrWorks=m.namedPeople+m.works;m.rivalOrLimitSignals=m.rivalSignals+m.limitSignals;return {m,parseFailures};
}
function classify(m,p){const n=p.minimum;if(m.structuredUnits>=n.structured_units&&m.namedPeopleOrWorks>=n.named_people_or_works&&m.rivalOrLimitSignals>=n.rival_or_limit_signals&&m.contentBindings>=n.content_bindings)return 'strong_structured_evidence';if(m.structuredUnits>=Math.max(1,Math.ceil(n.structured_units/2))&&(n.named_people_or_works===0||m.namedPeopleOrWorks>=1)&&m.contentBindings>=1)return 'partial_structured_evidence';if(m.theoryTextMentions>=10&&m.contentBindings>=1)return 'unstructured_theory_evidence';return 'theory_quality_gap';}
function missing(m,p){const n=p.minimum,o=[];if(m.structuredUnits<n.structured_units)o.push('structured_units');if(m.namedPeopleOrWorks<n.named_people_or_works)o.push('named_people_or_works');if(m.rivalOrLimitSignals<n.rival_or_limit_signals)o.push('rival_or_limit_signals');if(m.contentBindings<n.content_bindings)o.push('content_bindings');return o;}

export function auditFagverkTheoryQuality({writeReport=false,checkReport=true,includeDiagnostics=false}={}){
 const contract=json(CONTRACT), status=json(STATUS); assert(contract.schema==='history_go_fagverk_theory_quality_contract_v1','Ugyldig theory-quality contract'); assert(contract.subjects.length===20,'Theory-quality contract skal dekke 19 toppfag + Teknologi nested');
 const a=status.subjects.map(s=>s.id).sort(),b=contract.subjects.filter(s=>s.top_level).map(s=>s.id).sort();assert(JSON.stringify(a)===JSON.stringify(b),'Theory-quality contract matcher ikke canonical subject_status');
 const sb=new Map(status.subjects.map(s=>[s.id,s])), diagnostics={};
 const subjects=contract.subjects.map(e=>{const p=contract.profiles[e.profile];assert(p,`Ukjent profile ${e.profile}`);const s=scan(e.id);diagnostics[e.id]={metrics:s.m,parseFailures:s.parseFailures};const baseline=classify(s.m,p), editorialStatus=sb.get(e.id)?.editorialStatus||'nested_specialization';return {id:e.id,topLevel:e.top_level,parentSubject:e.parent_subject||null,profile:e.profile,editorialStatus,baseline,repairPriority:baseline==='strong_structured_evidence'?'none':(['complete','expanded_and_audited'].includes(editorialStatus)?'high':'medium'),missingSignals:missing(s.m,p),parseFailureCount:s.parseFailures.length};});
 assert(subjects.every(s=>s.parseFailureCount===0),`Aktive theory-quality inputs har parsefeil: ${subjects.filter(s=>s.parseFailureCount).map(s=>s.id).join(', ')}`);
 const keys=['strong_structured_evidence','partial_structured_evidence','unstructured_theory_evidence','theory_quality_gap'];
 const report={schema:'history_go_fagverk_theory_quality_audit_v1',version:'1.0.0',status:'baseline_only_not_completion_gate',scope:{topLevelSubjects:19,nestedSpecializations:1,totalAudited:20},rules:{noCompletionStatusChanges:true,strongRequiresStructuredTheoryOrModels:true,contestedFieldsRequireRivalOrLimitSignals:true,namedPeopleRequiredOnlyByProfile:true,actualContentBindingRequired:true,archivedCopiesExcluded:true,genericContributorsDoNotCountAsTheorists:true,knownNoncanonicalPlaceholdersExcluded:[...EXCLUDED]},summary:Object.fromEntries(keys.map(k=>[k,subjects.filter(s=>s.baseline===k).length])),historicalBaseline:{topLevelSubjects:17,nestedSpecializations:1,totalAudited:18,strongStructuredEvidence:18},repairQueue:subjects.filter(s=>s.baseline!=='strong_structured_evidence'&&s.editorialStatus!=='not_started').map(s=>s.id),expansionProductionQueue:subjects.filter(s=>s.editorialStatus==='not_started').map(s=>s.id),subjects};
 if(writeReport){fs.mkdirSync(path.dirname(abs(REPORT)),{recursive:true});fs.writeFileSync(abs(REPORT),`${JSON.stringify(report,null,2)}\n`);}if(checkReport){assert(exists(REPORT),`${REPORT} mangler`);assert(JSON.stringify(json(REPORT))===JSON.stringify(report),`${REPORT} er utdatert`);}return includeDiagnostics?{...report,diagnostics}:report;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){const args=new Set(process.argv.slice(2));try{console.log(JSON.stringify(auditFagverkTheoryQuality({writeReport:args.has('--write-report'),checkReport:!args.has('--no-check-report'),includeDiagnostics:args.has('--diagnostic')}),null,2));}catch(e){console.error(`Fagverk theory quality FEIL: ${e.message}`);process.exitCode=1;}}
