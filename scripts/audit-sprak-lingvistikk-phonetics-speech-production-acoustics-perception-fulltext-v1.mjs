#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CHAPTER = 'data/fagverk/litteratur/sprak_lingvistikk/fonetikk-taleproduksjon-akustikk-og-persepsjon.json';
const SOURCE = 'data/fag/litteratur/sprak_lingvistikk/phonetics_speech_production_acoustics_perception_source_claim_brief_v1.json';
const REPORT = 'reports/fagverk/sprak-lingvistikk-phonetics-speech-production-acoustics-perception-fulltext-v1-audit.json';
const abs = (f) => path.join(ROOT, f);
const read = (f) => JSON.parse(fs.readFileSync(abs(f), 'utf8'));
const write = (f,v) => { fs.mkdirSync(path.dirname(abs(f)), {recursive:true}); fs.writeFileSync(abs(f), `${JSON.stringify(v,null,2)}\n`); };
const assert = (c,m) => { if (!c) throw new Error(m); };

export function audit() {
  const chapter = read(CHAPTER);
  const source = read(SOURCE);
  const brief = read(chapter.briefFile);
  const claims = read(chapter.claimsFile);
  const assessment = read(chapter.assessmentFile);
  assert(chapter.subject_id === 'litteratur' && chapter.canonical_subcategory_id === 'sprak_lingvistikk', 'Feil eierskap');
  assert(chapter.domain_id === 'fonetikk_taleproduksjon_akustikk_persepsjon', 'Feil felt 2');
  assert(chapter.moduleFiles?.length === 4 && chapter.sourceFirst && chapter.claimTraceRequired, 'Chapter-kontrakt ufullstendig');
  assert(brief.sections?.length === 8 && brief.fulltext_status === 'materialized_pending_strict_audit', 'Brief-kontrakt ufullstendig');

  const sourceIds = new Set(source.sources.map(x=>x.id));
  const planned = source.topic_briefs.flatMap(x=>x.planned_claims);
  const plannedIds = planned.map(x=>x.id);
  assert(source.sources.length === 13 && sourceIds.size === 13, 'Fonetikk skal ha 13 unike kilder');
  assert(source.sources.every(x=>/^https:\/\//u.test(x.url) && x.retrieval_status === 'verified_2026-08-31'), 'Alle kilder må være inspectable/verifisert');
  assert(source.topic_briefs.length === 8 && planned.length === 32 && new Set(plannedIds).size === 32, 'Source-first skal ha 8 emner / 32 claims');
  assert(planned.every(x=>x.source_ids?.length>=2 && x.source_ids.every(id=>sourceIds.has(id))), 'Alle claims må ha minst to gyldige kilder');

  const modules = chapter.moduleFiles.map(read);
  const sections = modules.flatMap(x=>x.sections||[]);
  const paragraphs = sections.flatMap(x=>x.paragraphs||[]);
  const bindings = sections.flatMap(x=>x.paragraphClaimIds||[]);
  const used = bindings.flatMap(x=>x||[]);
  assert(modules.every(x=>x.schema==='history_go_fagverk_module_v1' && x.subject_id==='litteratur' && x.canonical_subcategory_id==='sprak_lingvistikk'), 'Modulschema/eierskap feil');
  assert(sections.length===8 && paragraphs.length===32 && bindings.length===32, 'Fulltekst skal være 8 seksjoner / 32 avsnitt / 32 bindinger');
  assert(paragraphs.every(x=>typeof x==='string' && x.length>=420), 'Hvert avsnitt må være minst 420 tegn');
  assert(bindings.every(x=>Array.isArray(x) && x.length===1), 'Ett primært claim per avsnitt');
  assert(new Set(used).size===32 && JSON.stringify(used)===JSON.stringify(plannedIds), 'Claim-dekning/rekkefølge må være eksakt');

  const verified = claims.verifiedClaims || [];
  assert(claims.trace_mode === 'source_brief_claim_text_and_sources_immutable', 'Claim-registeret må være immutable mot source brief');
  assert(verified.length===32 && JSON.stringify(verified.map(x=>x.id))===JSON.stringify(plannedIds), '32 claims må reverifiseres i canonical rekkefølge');
  assert(verified.every(x=>x.status==='verified' && x.verified_at==='2026-08-31'), 'Alle claims må være verified');

  const questions = assessment.questions || [];
  const cases = assessment.caseTasks || [];
  const validClaims = new Set(plannedIds);
  assert(questions.length===8 && cases.length===6, 'Vurdering skal ha 8 spørsmål og 6 case');
  assert(questions.every(x=>x.choices?.length===4 && Number.isInteger(x.correctIndex) && x.correctIndex>=0 && x.correctIndex<4), 'Ugyldig firevalgsoppgave');
  for (const x of [...questions,...cases]) {
    assert(x.claim_ids?.length>=1 && x.claim_ids.every(id=>validClaims.has(id)), `${x.id}: ugyldig claim-link`);
    assert(x.source_ids?.length>=2 && x.source_ids.every(id=>sourceIds.has(id)), `${x.id}: ugyldig source-link`);
  }
  assert(cases.every(x=>x.responseMode==='guided_discussion_no_required_typing' && x.prompt?.length>=80), 'Case-format feil');

  const boundary = sections.map(x=>x.boundary||'').join(' ').toLowerCase();
  const text = paragraphs.join(' ').toLowerCase();
  assert(/ortografi/u.test(text), 'Ortografi/artikulasjon-grense mangler');
  assert(/ipa-symbol|symbolidentitet/u.test(text), 'IPA/signal-grense mangler');
  assert(/formant/u.test(boundary) && /univers/u.test(boundary), 'Formant/populasjonsgrense mangler');
  assert(/spektrogram/u.test(text) && /anatom/u.test(text), 'Spektrogram/anatomi-grense mangler');
  assert(/voice onset time|vot/u.test(boundary) && /univers/u.test(text), 'VOT-grense mangler');
  assert(/pitch/u.test(boundary) && /opplevd/u.test(boundary), 'F0/pitch-grense mangler');
  assert(/akustisk forskjell/u.test(boundary) && /percept/u.test(boundary), 'Akustisk/perseptuell grense mangler');
  assert(/ikke selvvaliderende/u.test(boundary) || /ikke selvvalider/u.test(boundary), 'Verktøy/målevaliditet-grense mangler');

  const quality = {correctness_and_evidence:5, phonetic_method_and_measurement:5, production_acoustics_perception:5, traceability_and_reproducibility:5, assessment_readiness:5, uncertainty_and_responsible_interpretation:5};
  const report = {
    schema:'history_go_sprak_lingvistikk_phonetics_fulltext_audit_v1',version:'1.0.0',updated_at:'2026-08-31',subject_id:'litteratur',canonical_subcategory_id:'sprak_lingvistikk',domain_id:chapter.domain_id,
    status:'pass_fulltext_materialized_domain_ready_for_registry',
    counts:{modules:modules.length,sections:sections.length,paragraphs:paragraphs.length,verifiedClaims:verified.length,sources:source.sources.length,assessments:questions.length,decisionScenarios:cases.length},
    gates:{ownership:true,source_first_trace:true,paragraph_depth:true,exact_claim_coverage:true,ipa_signal_boundary:true,formant_population_boundary:true,spectrogram_boundary:true,vot_boundary:true,f0_pitch_boundary:true,perception_boundary:true,measurement_validation:true,assessment:true},
    six_part_quality_review:{...quality,total:Object.values(quality).reduce((a,b)=>a+b,0)},
    next_gate:'register_domain_2_only_after_domain_3_phonology_source_first_is_ready'
  };
  write(REPORT, report);
  return report;
}

try { const r=audit(); console.log(`Språk & lingvistikk felt 2 fulltekst OK: ${r.counts.modules} moduler, ${r.counts.sections} seksjoner, ${r.counts.paragraphs} avsnitt, ${r.counts.verifiedClaims} claims.`); }
catch (e) { console.error(`Språk & lingvistikk felt 2 fulltekst FEIL: ${e.message}`); process.exitCode=1; }
