#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { auditPolitikkQuality } from '../scripts/audit-politikk-subject-quality.mjs';
import { auditPolitikkThinkerIntegrity } from '../scripts/audit-politikk-thinker-integrity.mjs';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const abs=p=>path.join(ROOT,p);
const json=p=>JSON.parse(fs.readFileSync(abs(p),'utf8'));
const text=v=>String(v??'').trim();
const norm=v=>text(v).toLocaleLowerCase('nb-NO').normalize('NFKD').replace(/\p{M}/gu,'').replace(/[^\p{L}\p{N}]+/gu,' ').replace(/\s+/g,' ').trim();
const readIf=p=>fs.existsSync(abs(p))?json(p):null;
const scholarlySource=s=>/(peer review|research|forskn|fagfelle|akadem|academic|universit|university|press|monograph|monografi|journal|encyclop|oppslagsverk|dataset|methodolog|infrastructure|intergovernmental|official|offisiell|statist|government|regjering|storting|lovdata|departement|direktorat|tilsyn|ombud|world bank|oecd|united nations|nato|council of europe|cambridge|oxford|harvard|jstor|springer|sage|routledge|verso)/iu.test(norm([s.type,s.publisher,s.label,s.id].join(' ')));
const limitationSignal=s=>/(begrens|kan ikke|ikke (?:alene|automatisk|nødvendigvis|bevise)|usikker|rekkevidd|forbehold|blindson|inferens|varsom)/iu.test(s);
const rivalSignal=s=>/(motargument|alternativ|rival|konkurrer|uenighet|kritikk|konflikt|skiller|sammenlign|derimot|på den ene siden|på den andre siden)/iu.test(s);
const flattenStrings=value=>{const out=[];const walk=v=>{if(typeof v==='string')out.push(v);else if(Array.isArray(v))v.forEach(walk);else if(v&&typeof v==='object')Object.values(v).forEach(walk);};walk(value);return out;};
const claimRefs=value=>{const out=[];const walk=v=>{if(Array.isArray(v))return v.forEach(walk);if(!v||typeof v!=='object')return;for(const [k,x] of Object.entries(v)){if(['paragraphClaimIds','keyPointClaimIds','claimIds'].includes(k)&&Array.isArray(x))out.push(...x.flat(Infinity).map(text));else walk(x);}};walk(value);return out.filter(Boolean);};
const sourceMatchesThinker=(source,thinkerId,displayName)=>{
  const hay=norm([source.id,source.label,source.publisher].join(' '));
  const idParts=norm(thinkerId).split(' ').filter(t=>t.length>=4);
  const nameParts=norm(displayName).split(' ').filter(t=>t.length>=4);
  const surname=nameParts.at(-1);
  return Boolean((surname&&hay.includes(surname))||idParts.some(t=>hay.includes(t)));
};

const quality=auditPolitikkQuality({checkReport:true});
const thinkersAudit=auditPolitikkThinkerIntegrity({checkReport:true});
const pensum=json('data/fag/politikk/politikkpensum_canonical_v4_5.json');
const emner=json('data/fag/politikk/emner_politikk_canonical_v4_5.json');
const fagkart=json('data/fag/politikk/fagkart_politikk_canonical_v4_5.json');
const registry=json('data/fagverk/fagverk_registry.json');
const thinkerRegistry=json('data/fag/politikk/politikk_thinker_names.json').thinkers||{};
const chapters=registry.subjects?.politikk?.chapters||[];
const categories=fagkart.categories||[];
const byEmne=new Map(emner.map(e=>[e.emne_id,e]));

const resultFields=[];
for(const domain of pensum.domains||[]){
  const domainId=domain.domain_id;
  const chapterRow=chapters.find(c=>c.primary_domain_id===domainId);
  const chapterId=chapterRow?.id||null;
  const base=chapterId?`data/fagverk/politikk/${chapterId}`:null;
  const modulePaths=base?[`${base}/01-grunnlag.json`,`${base}/02-fordypning.json`,`${base}/03-anvendelse.json`]:[];
  const modules=modulePaths.map(readIf).filter(Boolean);
  const claimsDoc=base?readIf(`${base}/claims.json`):null;
  const claims=claimsDoc?.claims||[];
  const sources=claimsDoc?.sources||[];
  const usedClaimIds=new Set(claimRefs(modules));
  const scholarlySources=sources.filter(s=>scholarlySource(s));
  const proseBoundScholarlyClaims=claims.filter(c=>usedClaimIds.has(c.id)&&(c.source_ids||[]).some(id=>scholarlySources.some(s=>s.id===id)));
  const verifiedUsedClaims=claims.filter(c=>c.status==='verified'&&usedClaimIds.has(c.id));
  const fieldEmners=(domain.emne_ids||[]).map(id=>byEmne.get(id)).filter(Boolean);
  const thinkerIds=[...new Set(fieldEmners.flatMap(e=>[...(e.canonical_thinker_ids||[]),...(e.norwegian_thinker_ids||[])]).filter(Boolean))];
  const namedWorkSources=scholarlySources.filter(source=>thinkerIds.some(id=>sourceMatchesThinker(source,id,thinkerRegistry[id]||id)));
  const prose=flattenStrings(modules).join(' ');
  const fieldMeta=flattenStrings(fieldEmners).join(' ');
  const category=categories.find(c=>[c.id,c.domain_id,c.category_id,c.key].includes(domainId))||categories.find(c=>norm(c.title||c.name)===norm(domain.title||domain.name));
  const hooks=category?.topic_hooks||[];
  const constrainedHooks=hooks.filter(h=>{const g=h.generator_constraints||{};return Object.values(g).some(v=>v===true)||Object.keys(g).length>=2;});
  const checks={registeredChapter:Boolean(chapterRow&&base&&modules.length===3&&claimsDoc),exactEmneCoverage:fieldEmners.length===(domain.emne_ids||[]).length&&fieldEmners.length>0,structuredThinkerBinding:thinkerIds.length>=2,namedPersonWorkBinding:namedWorkSources.length>=2,verifiedClaimBinding:verifiedUsedClaims.length>=20,scholarlyProseBinding:proseBoundScholarlyClaims.length>=2,academicallyAppropriateSources:scholarlySources.length>=2,rivalOrAlternative:rivalSignal(`${prose} ${fieldMeta}`),limitationsOrAlternatives:limitationSignal(`${prose} ${fieldMeta}`),antiTriviaOrSourceFirst:hooks.length>0&&constrainedHooks.length===hooks.length};
  resultFields.push({domainId,chapterId,emneCount:fieldEmners.length,thinkerCount:thinkerIds.length,thinkerNames:thinkerIds.map(id=>thinkerRegistry[id]||id),hookCount:hooks.length,constrainedHookCount:constrainedHooks.length,sourceCount:sources.length,sourceTypes:[...new Set(sources.map(s=>text(s.type)).filter(Boolean))],scholarlySourceCount:scholarlySources.length,scholarlySourceLabels:scholarlySources.map(s=>s.label),namedWorkSourceCount:namedWorkSources.length,namedWorkSourceLabels:namedWorkSources.map(s=>s.label),verifiedUsedClaimCount:verifiedUsedClaims.length,proseBoundScholarlyClaimCount:proseBoundScholarlyClaims.length,limitationSignal:checks.limitationsOrAlternatives,rivalSignal:checks.rivalOrAlternative,checks,strictCandidate:Object.values(checks).every(Boolean),missingStrictProof:Object.entries(checks).filter(([,v])=>!v).map(([k])=>k)});
}

const report={schema:'history_go_politikk_theory_integrity_probe_v1',status:'diagnostic_only',completion_status_read_only:true,content_rewrite_required:false,existingQuality:{subjectQualityStatus:quality.status,thinkerIntegrityStatus:thinkersAudit.status,domains:quality.summary.domainCount,emners:quality.summary.emneCount,methods:quality.summary.methodCount,hooks:quality.summary.hookCount},summary:{canonicalMajorFields:resultFields.length,strictCandidates:resultFields.filter(f=>f.strictCandidate).length,fieldsNeedingProofReconciliation:resultFields.filter(f=>!f.strictCandidate).map(f=>f.domainId),substantiveContentGapsProven:0},fields:resultFields};
fs.writeFileSync('/tmp/politikk-theory-integrity-probe.json',`${JSON.stringify(report,null,2)}\n`);
console.log(JSON.stringify(report,null,2));
