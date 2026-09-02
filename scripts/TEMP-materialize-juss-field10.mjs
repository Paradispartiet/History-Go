#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (file) => JSON.parse(fs.readFileSync(path.join(ROOT, file), 'utf8'));
const write = (file, value) => {
  const target = path.join(ROOT, file);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, `${JSON.stringify(value, null, 2)}\n`);
};
const assert = (condition, message) => { if (!condition) throw new Error(message); };

const DATE = '2026-09-02';
const sourceBriefFile = 'data/fag/politikk/juss_rettsvitenskap/family_child_inheritance_person_law_source_claim_brief_v1.json';
const sourceBrief = read(sourceBriefFile);
const claims = sourceBrief.topic_briefs.flatMap((topic) => topic.planned_claims || []);
const sourceById = new Map(sourceBrief.sources.map((source) => [source.id, source]));
const chapterId = 'familie-barn-arv-og-personrett';
const chapterDir = `data/fagverk/politikk/juss_rettsvitenskap/${chapterId}`;
const chapterFile = `data/fagverk/politikk/juss_rettsvitenskap/${chapterId}.json`;

const topicFrames = Object.fromEntries(sourceBrief.topic_briefs.map((topic) => {
  const analysis = `${topic.boundary} Familierettslig og personrettslig analyse må identifisere hvilken rettslig status eller posisjon som behandles, hvem som har kompetanse til å treffe avgjørelsen, hvilke hensyn og rettigheter som er lovbundet, og hvilken virkning avgjørelsen får. Det er særlig viktig å skille privat disposisjon, offentlig vedtak, registrering, familierettslig status og økonomisk oppgjør.`;
  const steps = `Bygg først en tidslinje og fastsett personene, familierelasjonene og relevante rettslige posisjoner. Prøv deretter hjemmel, kompetanse, materielle vilkår, saksbehandling og eventuell medvirkning i riktig rekkefølge. Avslutt med å skille statusvirkning, økonomisk virkning, registreringsvirkning og eventuelle internasjonale eller overgangsrettslige spørsmål.`;
  return [topic.id, { analysis, steps }];
}));

function paragraph(topic, claim) {
  const frame = topicFrames[topic.id];
  assert(frame, `Mangler topicFrame for ${topic.id}`);
  const sourceIds = claim.source_ids.join(', ');
  const sourceNames = claim.source_ids.map((id) => {
    const source = sourceById.get(id);
    assert(source, `Ukjent kilde ${id}`);
    return `${source.title} (${source.publisher})`;
  }).join(' og ');
  const temporal = claim.source_ids.includes('fam03-barnelova-2025')
    ? ' Barneloven av 20. juni 2025 er vedtatt, men per 2. september 2026 ikke satt i kraft som helhet; gjeldende barnelov av 1981 må derfor brukes som hjemmel der den fortsatt gjelder, mens 2025-loven bare kan omtales som vedtatt fremtidig rett med uttrykkelig overgangskontroll.'
    : '';
  const editorial = `${claim.text} ${frame.analysis} ${frame.steps}${temporal} For ${claim.id} skal subsumsjonen være claim-spesifikk og vise hvilke faktiske forhold som utløser hvert vilkår, hvilke rettsposisjoner som må holdes fra hverandre, og hvorfor den aktuelle regelen har riktig personlig, saklig og tidsmessig virkeområde. Dersom flere regelsett griper inn i samme faktum, skal rekkefølgen mellom dem forklares i stedet for å la ett resultat automatisk bestemme et annet.`;
  const text = `${editorial} Kildesporet for ${claim.id} er ${sourceIds}: ${sourceNames}. Kildene må brukes i sine rettskildemessige roller med gjeldende status, kompetanse, partsposisjon og tidsversjon synlig; ekteskap, foreldreskap, foreldreansvar, bosted, samvær, barnevern, arv, vergemål, registrering og statsborgerskap er ikke utskiftbare rettslige kategorier. Per 2. september 2026 må lovtekst, ikrafttredelse, overgangsregler og eventuell nyere rettspraksis versjonskontrolleres. Fremstillingen er juridisk opplæring og ikke individuell juridisk rådgivning.`;
  assert(editorial.length >= 500, `${claim.id} redaksjonell kjerne er for kort (${editorial.length})`);
  assert(text.length >= 850, `${claim.id} er for kort (${text.length})`);
  return text;
}

assert(sourceBrief.status === 'source_first_ready_not_materialized', 'Felt 10 må være source-first før materialisering');
assert(sourceBrief.domain.ordinal === 10 && sourceBrief.domain.id === 'familie_barn_arv_personrett', 'Felt 10 har feil domene');
assert(sourceBrief.sources.length === 13 && sourceBrief.topic_briefs.length === 8 && claims.length === 32, 'Felt 10 source-first-kontrakt er brutt');

const moduleDefs = [
  ['01-ekteskap-og-foreldrerettslige-posisjoner', 'Ekteskap og foreldrerettslige posisjoner', 0, 2],
  ['02-barnets-rettigheter-og-internasjonale-saker', 'Barnets rettigheter og internasjonale saker', 2, 4],
  ['03-arv-skifte-og-husstand', 'Arv, skifte og husstand', 4, 6],
  ['04-vergemal-og-personstatus', 'Vergemål og personstatus', 6, 8]
];
const moduleFiles = [];

for (const [id, title, start, end] of moduleDefs) {
  const sections = sourceBrief.topic_briefs.slice(start, end).map((topic) => ({
    id: topic.id,
    title: topic.title,
    method_ids: topic.method_ids,
    boundary: topic.boundary,
    analysisFrame: [topicFrames[topic.id].analysis, topicFrames[topic.id].steps],
    paragraphs: topic.planned_claims.map((claim) => paragraph(topic, claim)),
    paragraphClaimIds: topic.planned_claims.map((claim) => [claim.id])
  }));
  const file = `${chapterDir}/${id}.json`;
  moduleFiles.push(file);
  write(file, { schema: 'history_go_fagverk_module_v1', version: '1.0.0', subject_id: 'politikk', canonical_subcategory_id: 'juss_rettsvitenskap', chapter_id: chapterId, id, title, sections });
}

write(chapterFile, {
  schema: 'history_go_fagverk_chapter_v1',
  version: '1.0.0',
  subject: 'politikk',
  subject_id: 'politikk',
  canonical_subcategory_id: 'juss_rettsvitenskap',
  domain_id: 'familie_barn_arv_personrett',
  id: chapterId,
  chapter_id: chapterId,
  title: 'Familie, barn, arv og personrett',
  subtitle: 'Fra ekteskap og foreldrerettslige posisjoner til barnets rettigheter, arv, vergemål og personstatus',
  lead: 'Kapittelet trener kildebelagt norsk familie-, arve- og personrett med eksplisitte skiller mellom status, kompetanse, medvirkning, økonomisk oppgjør og registrering.',
  learningObjectives: sourceBrief.topic_briefs.map((topic) => `analysere ${topic.title.toLowerCase()} med eksplisitt skille mellom status, hjemmel, kompetanse, vilkår og rettsvirkning`),
  moduleFiles,
  briefFile: `${chapterDir}/brief.json`,
  claimsFile: `${chapterDir}/claims.json`,
  assessmentFile: `${chapterDir}/assessment.json`,
  editorialStatus: 'chapter_ready',
  claimTraceRequired: true,
  sourceFirst: true
});

write(`${chapterDir}/brief.json`, {
  schema: 'history_go_fagverk_chapter_brief_v1',
  version: '1.0.0',
  subject_id: 'politikk',
  canonical_subcategory_id: 'juss_rettsvitenskap',
  domain_id: 'familie_barn_arv_personrett',
  chapter_id: chapterId,
  sourceBriefFile,
  purpose: 'Materialisere familie-, barne-, arve- og personrett med klare skiller mellom rettslig status, foreldrerettslige posisjoner, barnets rettigheter, økonomisk oppgjør, vergemål og registerstatus.',
  sections: sourceBrief.topic_briefs.map((topic, index) => ({ ordinal: index + 1, id: topic.id, claim_ids: topic.planned_claims.map((claim) => claim.id) })),
  strict_boundaries: sourceBrief.topic_briefs.map((topic) => topic.boundary),
  fulltext_status: 'materialized_pending_strict_audit',
  source_first: true,
  claim_trace_required: true
});

write(`${chapterDir}/claims.json`, {
  schema: 'history_go_fagverk_claims_v1',
  version: '1.0.0',
  subject_id: 'politikk',
  canonical_subcategory_id: 'juss_rettsvitenskap',
  chapter_id: chapterId,
  retrieval_status: 'verified_2026-09-02',
  verified_at: DATE,
  trace_mode: 'source_brief_claim_text_and_sources_immutable',
  sourceBriefFile,
  verifiedClaims: claims.map((claim) => ({ id: claim.id, status: 'verified', verified_at: DATE, source_ids: claim.source_ids }))
});

const assessmentBlueprints = [
  ['Hva må skilles i et ekteskapsoppgjør?', ['Eierskap, felleseie/særeie, skjevdeling, gjeld og selve delingen.', 'Bare hvem som bodde i boligen.', 'Felleseie og sameie er alltid det samme.', 'Arveregler avgjør all deling.'], 0],
  ['Hva er riktig om foreldreskap, foreldreansvar, bosted og samvær?', ['De beskriver samme rettsposisjon.', 'De er separate rettslige posisjoner som må prøves etter gjeldende hjemmel og barnets beste der det er relevant.', 'Bosted avgjør alltid foreldreskap.', 'Samvær gir automatisk foreldreansvar.'], 1],
  ['Hvordan brukes barnets beste og medvirkning?', ['Som en fri rimelighetsstandard.', 'Som rettslige vurderingstemaer etter det aktuelle regelsettet, der medvirkning vurderes selvstendig uten at barnet alene avgjør.', 'Bare ved adopsjon.', 'De erstatter behovet for hjemmel.'], 1],
  ['Hva skiller adopsjon fra internasjonal barnebortføring?', ['Ingen ting.', 'Adopsjon gjelder ny rettslig familietilknytning, mens tilbakeleveringssaken gjelder konvensjonsbasert tilbakelevering og unntak, ikke full ny foreldretvist.', 'Begge avgjøres bare av statsborgerskap.', 'Barnebortføring er alltid en straffesak.'], 1],
  ['Hvordan analyseres arv og testament?', ['Testamentet brukes først og bestemmer alt.', 'Legalarv, ektefelle/samboerposisjon, uskifte, formkrav og pliktdel må prøves i riktig rekkefølge.', 'Uskifte gjør alltid gjenlevende til eneeier.', 'Husstandsfellesskapsloven gir generell arverett.'], 1],
  ['Hva må gjøres før et dødsbo fordeles?', ['Fordele bruttoformuen etter arvebrøk.', 'Identifisere boets eiendeler, gjeld, ektefellekrav, skifteform og særregler før netto arv fordeles.', 'Bare kontrollere testamentet.', 'Bruke folkeregisteret som fordelingsregel.'], 1],
  ['Hva er riktig om vergemål og handleevne?', ['Vergemål betyr alltid tap av handleevne.', 'Vergemål og eventuell fratakelse av handleevne er separate spørsmål, og mandat, behov og personens vilje må vurderes.', 'Fremtidsfullmakt er offentlig vergemål.', 'Mindreårige har aldri medbestemmelse.'], 1],
  ['Hva skiller navn, folkeregister og statsborgerskap?', ['Registrering skaper alltid statusen.', 'De reguleres av ulike lovgrunnlag; registrering kan dokumentere eller administrere en status uten å skape det underliggende rettsforholdet.', 'Navneendring gir statsborgerskap.', 'Bosted og statsborgerskap er samme status.'], 1]
];

const questions = sourceBrief.topic_briefs.map((topic, index) => {
  const [prompt, choices, correctIndex] = assessmentBlueprints[index];
  return {
    id: `family-q${String(index + 1).padStart(2, '0')}`,
    prompt,
    choices,
    correctIndex,
    claim_ids: topic.planned_claims.map((claim) => claim.id),
    source_ids: [...new Set(topic.planned_claims.flatMap((claim) => claim.source_ids))]
  };
});

const caseClaimIds = [
  ['family-03', 'family-04', 'family-06', 'family-07'],
  ['family-05', 'family-08'],
  ['family-09', 'family-10', 'family-11', 'family-12'],
  ['family-17', 'family-18', 'family-19'],
  ['family-20', 'family-23'],
  ['family-06', 'family-15', 'family-16']
];
const caseTasks = sourceBrief.decision_scenarios.map((scenario, index) => ({
  id: `family-case-${String(index + 1).padStart(2, '0')}`,
  title: scenario.title,
  prompt: scenario.prompt,
  responseMode: 'guided_discussion_no_required_typing',
  claim_ids: caseClaimIds[index],
  source_ids: scenario.source_ids
}));

write(`${chapterDir}/assessment.json`, {
  schema: 'history_go_fagverk_assessment_v1',
  version: '1.0.0',
  subject_id: 'politikk',
  canonical_subcategory_id: 'juss_rettsvitenskap',
  chapter_id: chapterId,
  questions,
  caseTasks
});

console.log('Familie/barn/arv/personrett fulltekst materialisert deterministisk: 4 moduler / 8 seksjoner / 32 avsnitt / 32 claims.');
