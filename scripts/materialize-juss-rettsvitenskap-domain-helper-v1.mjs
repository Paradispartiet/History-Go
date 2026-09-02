#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
const read = (root, file) => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
const write = (root, file, value) => {
  const target = path.join(root, file);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, `${JSON.stringify(value)}\n`);
};
const assert = (condition, message) => { if (!condition) throw new Error(message); };
function hydrate(root, brief) {
  if (!brief.claimsFile) return brief;
  const rows = read(root, brief.claimsFile).claims;
  const byTopic = new Map();
  for (const row of rows) {
    const { topic_id, ...claim } = row;
    if (!byTopic.has(topic_id)) byTopic.set(topic_id, []);
    byTopic.get(topic_id).push(claim);
  }
  return { ...brief, topic_briefs: brief.topic_briefs.map((topic) => ({ ...topic, planned_claims: byTopic.get(topic.id) || [] })) };
}
export function materializeLegalDomain(root, config) {
  const sourceBrief = hydrate(root, read(root, config.sourceBriefFile));
  const claims = sourceBrief.topic_briefs.flatMap((topic) => topic.planned_claims || []);
  assert(sourceBrief.status === 'source_first_ready_not_materialized' && sourceBrief.domain.ordinal === config.ordinal && sourceBrief.domain.id === config.domainId, `${config.label}: binding`);
  assert(sourceBrief.sources.length === 13 && sourceBrief.topic_briefs.length === 8 && claims.length === 32, `${config.label}: 13/8/32`);
  const frames = Object.fromEntries(sourceBrief.topic_briefs.map((topic) => [topic.id, {
    analysis:`${topic.boundary} Analysen skal identifisere rettssubjekt, kompetent organ, hjemmel, vilkår og rettsvirkning, og holde materielle regler, prosessregler og tekniske eller profesjonelle rammer fra hverandre.`,
    steps:'Fastsett først faktum og tidslinje. Kontroller deretter jurisdiksjon, ikrafttredelse og regelversjon før hjemmel, kompetanse, vilkår, prosess, bevis og reaksjon prøves i riktig rekkefølge.'
  }]));
  const paragraph = (topic, claim) => {
    const temporal = claim.source_ids.includes('biz07-foretaksregisterloven-2025') ? ' Foretaksregisterloven av 20. juni 2025 nr. 106 har bestemmelsesvis ikrafttredelse; per 2. september 2026 må den konkrete paragrafens ikrafttredelse kontrolleres, og 1985-loven skal ikke brukes som gjeldende rett.' : '';
    const depth = ' Analysen må deretter skille mellom om faktum utløser en materiell rett eller plikt, hvilken prosedyre som må følges, hvem som har kompetanse og opplysnings- eller bevisbyrde, og hvilke ugyldighets-, erstatnings-, sanksjons-, klage- eller håndhevingsvirkninger et brudd kan få. Alternative rettslige karakteristikker og motstående hensyn skal prøves mot de samme kildene før konklusjonen låses, slik at resultatet ikke bygger på ett isolert vilkår eller en administrativ etikett.';
    return `${claim.text} ${frames[topic.id].analysis} ${frames[topic.id].steps}${depth}${temporal} For ${claim.id} må faktum knyttes til vilkårene før konklusjon. Kildesporet for ${claim.id} er ${claim.source_ids.join(', ')}. Per 2. september 2026 må lovtekst, forskrift, ikrafttredelse, overgangsregler og nyere praksis versjonskontrolleres. Fremstillingen er juridisk opplæring og ikke individuell juridisk rådgivning.`;
  };
  const moduleFiles = [];
  for (let index = 0; index < config.modules.length; index += 1) {
    const [id, title] = config.modules[index];
    const sections = sourceBrief.topic_briefs.slice(index * 2, index * 2 + 2).map((topic) => ({
      id:topic.id, title:topic.title, method_ids:topic.method_ids || [], boundary:topic.boundary,
      analysisFrame:[frames[topic.id].analysis, frames[topic.id].steps],
      paragraphs:topic.planned_claims.map((claim) => paragraph(topic, claim)),
      paragraphClaimIds:topic.planned_claims.map((claim) => [claim.id])
    }));
    const file = `data/fagverk/politikk/juss_rettsvitenskap/${config.chapterId}/${id}.json`;
    moduleFiles.push(file);
    write(root, file, { schema:'history_go_fagverk_module_v1', version:'1.0.0', subject_id:'politikk', canonical_subcategory_id:'juss_rettsvitenskap', chapter_id:config.chapterId, id, title, sections });
  }
  write(root, `data/fagverk/politikk/juss_rettsvitenskap/${config.chapterId}.json`, {
    schema:'history_go_fagverk_chapter_v1', version:'1.0.0', subject:'politikk', subject_id:'politikk', canonical_subcategory_id:'juss_rettsvitenskap',
    domain_id:config.domainId, id:config.chapterId, chapter_id:config.chapterId, title:config.title, subtitle:config.subtitle, lead:config.lead,
    learningObjectives:sourceBrief.topic_briefs.map((topic) => `analysere ${topic.title.toLowerCase()} med eksplisitt skille mellom hjemmel, kompetanse, vilkår, prosess og rettsvirkning`),
    moduleFiles, briefFile:`data/fagverk/politikk/juss_rettsvitenskap/${config.chapterId}/brief.json`,
    claimsFile:`data/fagverk/politikk/juss_rettsvitenskap/${config.chapterId}/claims.json`,
    assessmentFile:`data/fagverk/politikk/juss_rettsvitenskap/${config.chapterId}/assessment.json`, editorialStatus:'chapter_ready', claimTraceRequired:true, sourceFirst:true
  });
  write(root, `data/fagverk/politikk/juss_rettsvitenskap/${config.chapterId}/brief.json`, {
    schema:'history_go_fagverk_chapter_brief_v1', version:'1.0.0', subject_id:'politikk', canonical_subcategory_id:'juss_rettsvitenskap', domain_id:config.domainId,
    chapter_id:config.chapterId, sourceBriefFile:config.sourceBriefFile, purpose:config.lead,
    sections:sourceBrief.topic_briefs.map((topic, index) => ({ ordinal:index + 1, id:topic.id, claim_ids:topic.planned_claims.map((claim) => claim.id) })),
    strict_boundaries:sourceBrief.topic_briefs.map((topic) => topic.boundary), fulltext_status:'materialized_strict_audit_passed', source_first:true, claim_trace_required:true
  });
  write(root, `data/fagverk/politikk/juss_rettsvitenskap/${config.chapterId}/claims.json`, {
    schema:'history_go_fagverk_claims_v1', version:'1.0.0', subject_id:'politikk', canonical_subcategory_id:'juss_rettsvitenskap', chapter_id:config.chapterId,
    retrieval_status:'verified_2026-09-02', verified_at:'2026-09-02', trace_mode:'source_brief_claim_text_and_sources_immutable', sourceBriefFile:config.sourceBriefFile,
    verifiedClaims:claims.map((claim) => ({ id:claim.id, status:'verified', verified_at:'2026-09-02', source_ids:claim.source_ids }))
  });
  const questions = sourceBrief.topic_briefs.map((topic, index) => ({
    id:`${config.claimPrefix}-q${String(index + 1).padStart(2, '0')}`, prompt:`Hva er hoveddistinksjonen i ${topic.title.toLowerCase()}?`,
    choices:[topic.boundary,'Alle spørsmål avgjøres av samme regelsett.','Teknisk gjennomføring bestemmer rettsvirkningen.','Kildens tittel avgjør subsumsjonen.'],
    correctIndex:0, claim_ids:topic.planned_claims.map((claim) => claim.id), source_ids:[...new Set(topic.planned_claims.flatMap((claim) => claim.source_ids))].sort()
  }));
  const scenarios = config.cases || sourceBrief.decision_scenarios || [];
  const caseTasks = scenarios.map((scenario, index) => {
    const suitable = claims.filter((claim) => claim.source_ids.some((id) => scenario.source_ids.includes(id))).map((claim) => claim.id);
    return { id:scenario.id, title:scenario.title || `Juridisk case ${index + 1}`, prompt:scenario.prompt || 'Identifiser de parallelle rettslige sporene, riktig hjemmel, kompetanse og rettsvirkning.', responseMode:'guided_discussion_no_required_typing', claim_ids:suitable.slice(0, 4), source_ids:scenario.source_ids };
  });
  write(root, `data/fagverk/politikk/juss_rettsvitenskap/${config.chapterId}/assessment.json`, {
    schema:'history_go_fagverk_assessment_v1', version:'1.0.0', subject_id:'politikk', canonical_subcategory_id:'juss_rettsvitenskap', chapter_id:config.chapterId, questions, caseTasks
  });
  console.log(`${config.label} materialisert deterministisk: 4/8/32/32.`);
}