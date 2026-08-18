#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { classifyFilmTvSourceAuthority } from './audit-film-tv-source-authority-quality-v1.mjs';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const abs=p=>path.join(ROOT,p),json=p=>JSON.parse(fs.readFileSync(abs(p),'utf8')),assert=(ok,msg)=>{if(!ok)throw new Error(msg);};
const P={
  canon:'data/fag/TV_og_Film/theory_objects_film_tv_canonical_v1.json',
  scholarly:'data/fag/TV_og_Film/film_tv_theory_scholarly_registry_v1.json',
  overrides:'data/fag/TV_og_Film/film_tv_theory_scholarly_overrides_v1.json',
  registry:'data/fagverk/fagverk_registry.json'
};
const ACADEMIC=new Set(['peer_reviewed_scholarship','scholarly_book']);

export function auditFilmTvTheoryCanon(){
 const canon=json(P.canon),sch=json(P.scholarly),overrides=json(P.overrides),registry=json(P.registry);const chapters=registry.subjects?.film_tv?.chapters||[];
 assert(canon.schema==='history_go_film_tv_theory_objects_v1'&&canon.status==='canonical','Ugyldig Film & TV theory canon');
 assert(sch.schema==='history_go_film_tv_theory_scholarly_registry_v1'&&sch.status==='canonical','Ugyldig Film & TV scholarly theory registry');
 assert(overrides.schema==='history_go_film_tv_theory_scholarly_overrides_v1'&&overrides.status==='canonical','Ugyldig Film & TV scholarly override registry');
 assert(/provenance, ikke trivia/.test(canon.production_rule),'Film & TV theory canon må blokkere navnetrivia');
 const domainData=new Map();
 for(const ch of chapters){const domain=ch.primary_domain_id;assert(domain&&ch.claimsFile,`Kapittel mangler domain/claims: ${ch.id}`);if(!domainData.has(domain))domainData.set(domain,{emnes:new Set(),sources:new Map(),usedSources:new Set()});const d=domainData.get(domain);for(const id of ch.emne_ids||[])d.emnes.add(id);const ledger=json(ch.claimsFile);for(const s of ledger.sources||[])d.sources.set(s.id,s);for(const c of ledger.claims||[])for(const id of c.source_ids||[])d.usedSources.add(id);}
 assert(domainData.size===10,'Film & TV theory canon krever eksakt 10 canonicale domener');const allEmnes=new Set([...domainData.values()].flatMap(d=>[...d.emnes]));assert(allEmnes.size===192,'Film & TV canonical domain-eierskap skal fortsatt være 192 emner');
 const overrideById=new Map();
 for(const o of overrides.overrides||[]){assert(o.id&&!overrideById.has(o.id),`Duplikat scholarly override: ${o.id}`);overrideById.set(o.id,o);}
 const theoristWorkOverrideByKey=new Map();
 for(const o of overrides.theorist_work_overrides||[]){const key=`${o.theory_id}::${o.name}`;assert(o.theory_id&&o.name&&o.works?.length>=1&&!theoristWorkOverrideByKey.has(key),`Ugyldig theorist work override: ${key}`);theoristWorkOverrideByKey.set(key,o);}
 const schById=new Map(),existingAuthorityFailures=[];
 for(const raw of sch.sources){const s=overrideById.get(raw.id)||raw;assert(s.id&&s.authors?.length>=1&&s.title&&s.source_location?.length>=80&&s.domain_ids?.length>=1,`Tynn scholarly source: ${s.id}`);assert(ACADEMIC.has(s.source_authority_class),`Ikke-akademisk scholarly class: ${s.id}`);assert(s.domain_ids.every(id=>domainData.has(id)),`Scholarly source har ukjent domene: ${s.id}`);assert(!schById.has(s.id),`Duplikat scholarly id: ${s.id}`);schById.set(s.id,s);
   if(s.existing_source_id){for(const domain of s.domain_ids){const existing=domainData.get(domain).sources.get(s.existing_source_id);assert(existing,`Scholarly registry peker til manglende claim-kilde ${s.existing_source_id}`);assert(existing.title===s.title,`Scholarly title matcher ikke claim-kilde: ${s.id}`);const cls=classifyFilmTvSourceAuthority(existing);if(!ACADEMIC.has(cls))existingAuthorityFailures.push({id:s.id,existing_source_id:s.existing_source_id,classifier:cls});}}
   else assert(/^https:\/\//.test(s.url||'')&&s.publisher?.length>=3,`Ekstern scholarly source mangler HTTPS/publisher: ${s.id}`);
 }
 assert([...overrideById.keys()].every(id=>sch.sources.some(s=>s.id===id)),'Scholarly override peker til ukjent registry-id');
 assert(existingAuthorityFailures.length===0,`Existing theory sources er ikke akademisk klassifisert: ${JSON.stringify(existingAuthorityFailures)}`);
 assert(canon.theory_objects.length===20,'Film & TV theory canon skal ha 20 teoriobjekter = 2 per domene');const counts={},people=new Set(),works=new Set(),usedSch=new Set(),usedWorkOverrides=new Set();
 for(const t of canon.theory_objects){assert(domainData.has(t.domain_id),`Ukjent theory domain ${t.domain_id}`);counts[t.domain_id]=(counts[t.domain_id]||0)+1;assert(t.id&&t.label&&t.scope?.length>=100&&t.core_claim_or_mechanism?.length>=120&&t.evidence_or_observable_basis?.length>=80,`For tynt theory object: ${t.id}`);assert(t.limitations?.length>=2&&t.rival_or_alternative?.length>=120,`Mangler begrensninger/rival: ${t.id}`);assert(t.claim_source_ids?.length>=1,`Mangler claim-source binding: ${t.id}`);const d=domainData.get(t.domain_id);for(const sid of t.claim_source_ids){assert(d.sources.has(sid),`Theory claim source finnes ikke i riktig domene: ${t.id}/${sid}`);assert(d.usedSources.has(sid),`Theory claim source er ikke faktisk brukt av claim: ${t.id}/${sid}`);}
   assert(t.scholarly_refs?.length>=1,`Mangler scholarly ref: ${t.id}`);for(const sid of t.scholarly_refs){const s=schById.get(sid);assert(s,`Ukjent scholarly ref ${sid}`);assert(s.domain_ids.includes(t.domain_id),`Scholarly ref er ikke godkjent for theory domain: ${t.id}/${sid}`);usedSch.add(sid);}
   assert(t.theorists?.length>=1,`Theory object mangler navngitt forsker/teoretiker: ${t.id}`);for(const p of t.theorists){const key=`${t.id}::${p.name}`,workOverride=theoristWorkOverrideByKey.get(key),effectiveWorks=workOverride?.works||p.works;if(workOverride)usedWorkOverrides.add(key);assert(p.name&&effectiveWorks?.length>=1&&p.scholarly_refs?.length>=1,`Tynn theorist provenance i ${t.id}`);people.add(p.name);effectiveWorks.forEach(w=>works.add(w));for(const rid of p.scholarly_refs){const s=schById.get(rid);assert(s&&t.scholarly_refs.includes(rid),`Theorist scholarly ref er ikke del av theory object: ${p.name}/${rid}`);assert(s.authors.includes(p.name),`Theorist-navn finnes ikke i scholarly source metadata: ${p.name}/${rid}`);assert(effectiveWorks.includes(s.title),`Theorist-verk matcher ikke scholarly source: ${p.name}/${rid}`);}}
 }
 assert(usedWorkOverrides.size===theoristWorkOverrideByKey.size,`Ubrukte theorist work overrides: ${[...theoristWorkOverrideByKey.keys()].filter(k=>!usedWorkOverrides.has(k)).join(', ')}`);
 for(const domain of domainData.keys())assert(counts[domain]===2,`Film & TV theory canon krever eksakt to teoriobjekter i ${domain}, fant ${counts[domain]||0}`);assert(usedSch.size===schById.size,`Ubrukte scholarly theory sources: ${[...schById.keys()].filter(id=>!usedSch.has(id)).join(', ')}`);assert(people.size>=25,`Film & TV theory canon krever minst 25 unike forskere/teoretikere, fant ${people.size}`);assert(works.size>=20,`Film & TV theory canon krever minst 20 unike verk/bidrag, fant ${works.size}`);
 return {status:'strong_theory_canon',domainCount:domainData.size,canonicalEmneCount:allEmnes.size,theoryObjectCount:canon.theory_objects.length,scholarlySourceCount:schById.size,uniquePeopleCount:people.size,uniqueWorkCount:works.size,scholarlyOverrideCount:overrideById.size,theoristWorkOverrideCount:theoristWorkOverrideByKey.size};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){try{console.log(JSON.stringify(auditFilmTvTheoryCanon(),null,2));}catch(e){console.error(`Film & TV theory canon FEIL: ${e.message}`);process.exitCode=1;}}
