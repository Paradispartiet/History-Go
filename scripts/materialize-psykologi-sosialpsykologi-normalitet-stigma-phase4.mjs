#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';
import { preserveNewerFagverkMetadata } from './lib/preserve-fagverk-metadata.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CHAPTER_ID = 'sosialpsykologi-normalitet-og-stigma';
const DOMAIN_ID = 'sosialpsykologi_normalitet_stigma';
const DIR = `data/fagverk/psykologi/${CHAPTER_ID}`;
const CHAPTER_FILE = `data/fagverk/psykologi/${CHAPTER_ID}.json`;
const REGISTRY_FILE = 'data/fagverk/fagverk_registry.json';
const STATUS_FILE = 'data/fagverk/subject_status.json';
const PENSUM_FILE = 'data/fag/psykologi/psykologipensum_canonical_v4_5.json';
const METHODS_FILE = 'data/fag/psykologi/methods_psykologi_canonical_v4_5.json';
const MODULES = [`${DIR}/01-grupper-roller-og-pavirkning.json`,`${DIR}/02-kategorier-normalitet-og-diagnose.json`,`${DIR}/03-stigma-offentlighet-og-tilhorighet.json`];
const ORDER = ['psykisk_helse_institusjoner_behandling','fagtradisjoner_teori_sinnet','utvikling_oppvekst_laring','kognisjon_folelser_atferd','sosialpsykologi_normalitet_stigma','traume_krise_resiliens_omsorg'];
const abs = (f) => path.join(ROOT, f);
const read = (f) => JSON.parse(fs.readFileSync(abs(f), 'utf8'));
const write = (f, v) => fs.writeFileSync(abs(f), `${JSON.stringify(v, null, 2)}\n`);
const assert = (ok, m) => { if (!ok) throw new Error(m); };

function validate() {
  for (const f of [CHAPTER_FILE,`${DIR}/brief.json`,`${DIR}/claims.json`,...MODULES,PENSUM_FILE,METHODS_FILE]) assert(fs.existsSync(abs(f)), `Mangler ${f}`);
  const chapter=read(CHAPTER_FILE), brief=read(`${DIR}/brief.json`), claimsDoc=read(`${DIR}/claims.json`), modules=MODULES.map(read), pensum=read(PENSUM_FILE), methodsDoc=read(METHODS_FILE);
  const domain=pensum.domains.find((d)=>d.domain_id===DOMAIN_ID);
  assert(domain && domain.emne_count===8 && domain.method_count===15,'Canonicalt domene skal være 8 emner / 15 metoder');
  assert(chapter.id===CHAPTER_ID && chapter.chapter_id===CHAPTER_ID && chapter.primary_domain_id===DOMAIN_ID,'Feil kapittel-ID eller domene');
  assert(isDeepStrictEqual(chapter.emne_ids,domain.emne_ids) && isDeepStrictEqual(chapter.method_ids,domain.method_ids),'Wrapper avviker fra canonical emner/metoder');
  const canonicalMethods=new Set(methodsDoc.methods.map((m)=>m.method_id)); assert(chapter.method_ids.every((id)=>canonicalMethods.has(id)),'Ukjent metode');
  assert(chapter.doNotDiagnosePeople===true && brief.safety?.doNotDiagnosePeople===true && brief.safety?.noGroupOrStigmaTypingFromCasualObservation===true,'Sikkerhetsvern mangler');
  assert(claimsDoc.source_policy?.noDiagnosisOfIndividuals===true && claimsDoc.source_policy?.noGroupOrStigmaTypingFromCasualObservation===true,'Claims-policy mangler sikkerhetsvern');
  assert(isDeepStrictEqual(chapter.moduleFiles,MODULES),'Feil modulsett');
  const sections=modules.flatMap((m)=>m.sections||[]), paragraphs=sections.flatMap((s)=>s.paragraphs||[]), traces=sections.flatMap((s)=>s.paragraphClaimIds||[]);
  assert(modules.length===3 && sections.length===9 && paragraphs.length===27,'Kapittelet må være 3/9/27');
  assert(traces.length===27 && traces.every((x)=>x?.length),'Alle avsnitt må ha claimspor');
  const emnes=new Set(sections.flatMap((s)=>s.emne_ids||[])), methods=new Set(sections.flatMap((s)=>s.method_ids||[]));
  assert(emnes.size===8 && chapter.emne_ids.every((id)=>emnes.has(id)),'Seksjonene dekker ikke 8/8 emner');
  assert(methods.size===15 && chapter.method_ids.every((id)=>methods.has(id)),'Seksjonene bruker ikke 15/15 metoder');
  const sources=claimsDoc.sources||[], claims=claimsDoc.claims||[], sourceIds=new Set(sources.map((s)=>s.id)), claimIds=new Set(claims.map((c)=>c.id));
  assert(sources.length===21 && sources.filter((s)=>s.type!=='internal_place_record').length===20,'Kapittelet skal ha 21 kilder / 20 eksterne');
  assert(claims.length===27,'Kapittelet skal ha 27 claims');
  assert(sources.every((s)=>s.source_location&&s.label),'Kilde mangler source_location/label');
  assert(claims.every((c)=>c.source_ids?.length&&c.source_ids.every((id)=>sourceIds.has(id))),'Claim peker til ukjent kilde');
  assert(traces.flat().every((id)=>claimIds.has(id))&&claims.every((c)=>traces.flat().includes(c.id)),'Claimspor er ufullstendig');
  assert(isDeepStrictEqual((chapter.relatedPlaces||[]).map((p)=>p.id),['psykologisk_institutt_uio']),'Feil runtime-place-sett');
  assert((chapter.socialCases||[]).length===4 && chapter.socialCases.every((c)=>c.caseStatus==='documented_case_not_runtime_place'),'Social cases må være non-runtime');
  return {chapter,sources,claims};
}

function updateRegistry(chapter) {
  const registry=read(REGISTRY_FILE), subject=registry.subjects?.psykologi; assert(subject&&Array.isArray(subject.chapters),'Psykologi mangler registry chapters');
  const row={id:CHAPTER_ID,title:chapter.title,subtitle:chapter.subtitle,file:CHAPTER_FILE,primary_domain_id:DOMAIN_ID,chapter_role:'core',emne_ids:chapter.emne_ids,claimsFile:`${DIR}/claims.json`,briefFile:`${DIR}/brief.json`};
  const i=subject.chapters.findIndex((c)=>c.id===CHAPTER_ID); if(i>=0) subject.chapters[i]=row; else subject.chapters.push(row);
  subject.chapters.sort((a,b)=>ORDER.indexOf(a.primary_domain_id)-ORDER.indexOf(b.primary_domain_id));
  assert([5,6].includes(subject.chapters.length),'Psykologi skal stå på 5/6 eller 6/6 kapitler');
  if(subject.chapters.length===5){
    subject.canonicalModel={...(subject.canonicalModel||{}),note:'Psykologifagets seks canonicale fagområder eier rendererstrukturen. Alle 58 aktive emner er bevart. Fem redaksjonelle kapitler er materialisert, inkludert Sosialpsykologi, normalitet og stigma. Samlet fulltekstdekning er 51/58 emner, med eksplisitt diagnose-, gruppe- og stigmatypestemplingsvern.'};
    subject.editorialPlan={targetChapterCount:6,completionRequirements:['all_canonical_domains_covered','all_canonical_emners_covered_exactly_once','all_canonical_methods_resolved','paragraph_claim_trace_complete','minimum_15_external_sources_per_chapter','do_not_diagnose_people_guard','full_subject_audit_green'],nextGate:'remaining_domain_chapter_production'};
    preserveNewerFagverkMetadata(registry, '2.71.0', '2026-08-11');
  }
  write(REGISTRY_FILE,registry);
}
function updateStatus(){
  const status=read(STATUS_FILE), subject=status.subjects.find((s)=>s.id==='psykologi'); assert(subject,'Psykologi mangler subject_status');
  if(subject.editorialStatus==='complete' || subject.editorialStatus==='expanded_and_audited') return;
  subject.editorialStatus='chapters_in_progress'; subject.nextGate='remaining_domain_chapter_production';
  subject.note='Psykologi har seks canonicale fagområder og 58 aktive emner. Fem områder er nå fulltekstmaterialisert. Sosialpsykologi, normalitet og stigma dekker 8/8 emner med 15 canonicale metoder, 3 moduler, 9 seksjoner, 27 claimsporede fagavsnitt, 27 verifiserte claims og 21 kilderegistreringer (20 eksterne). Samlet dekker de fem kapitlene 51/58 emner. Ett canonicalt kapittel gjenstår.';
  preserveNewerFagverkMetadata(status, '1.59.0', '2026-08-11'); write(STATUS_FILE,status);
}
const {chapter,sources,claims}=validate(); updateRegistry(chapter); updateStatus();
console.log(`Materialiserte Psykologi ${DOMAIN_ID}: 8/8 emner, 15 metoder, 3 moduler, 9 seksjoner, 27 avsnitt, ${claims.length} claims og ${sources.length} kilder. Fremdrift beholdes ved 6/6.`);
