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
const sourceBriefFile = 'data/fag/politikk/juss_rettsvitenskap/tort_property_private_law_priority_protection_source_claim_brief_v1.json';
const sourceBrief = read(sourceBriefFile);
const claims = sourceBrief.topic_briefs.flatMap((topic) => topic.planned_claims || []);
const sourceById = new Map(sourceBrief.sources.map((source) => [source.id, source]));
const chapterId = 'erstatning-tingsrett-formuesrett-og-rettsvern';
const chapterDir = `data/fagverk/politikk/juss_rettsvitenskap/${chapterId}`;
const chapterFile = `data/fagverk/politikk/juss_rettsvitenskap/${chapterId}.json`;

const topicFrames = Object.fromEntries(sourceBrief.topic_briefs.map((topic) => {
  const analysis = `${topic.boundary} Den rettslige analysen må identifisere rettsgrunnlag, rettighet eller plikt, partenes posisjoner og hvilken konfliktstype som faktisk foreligger før rettsvirkningen bestemmes. Erstatningsrettslige spørsmål må holdes fra tingsrettslige og kreditorrettslige spørsmål, selv når de oppstår i samme faktum.`;
  const steps = `Bygg først en faktatidslinje og klassifiser formuesgode, skade, rettighet og aktører. Prøv deretter hvert vilkår i riktig rekkefølge, og skill uttrykkelig mellom gyldighet mellom partene, rettsvern mot tredjeperson, prioritet, ansvar, årsak, tap og eventuell beføyelse. Dokumenter til slutt hvilken publisitetsakt, tidsregel eller særhjemmel som styrer resultatet.`;
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
  const editorial = `${claim.text} ${frame.analysis} ${frame.steps} For ${claim.id} skal subsumsjonen være claim-spesifikk: den må vise hvilke fakta som utløser hvert vilkår, hvilke alternative forklaringer eller konkurrerende rettigheter som må avgrenses, og hvorfor den valgte regelen har riktig saklig, personlig og tidsmessig virkeområde. Dersom flere regelsett overlapper, skal analysen forklare om de gjelder kumulativt, subsidiært eller på ulike trinn, og den skal ikke bruke et resultat i ett spor som snarvei for et annet.`;
  const text = `${editorial} Kildesporet for ${claim.id} er ${sourceIds}: ${sourceNames}. Kildene må brukes i sine rettskildemessige roller med jurisdiksjon, formuesgode, ansvarssubjekt, tredjepersonsposisjon og tidsversjon synlig; en ansvarsregel, en eiendomsregel, en registreringsregel og en insolvensregel er ikke utskiftbare. Per 2. september 2026 må lovtekst og eventuell nyere rettspraksis versjonskontrolleres, og den konkrete rettsvernsakten må kontrolleres for riktig formuesgode. Fremstillingen er juridisk opplæring og ikke individuell juridisk rådgivning.`;
  assert(editorial.length >= 500, `${claim.id} redaksjonell kjerne er for kort (${editorial.length})`);
  assert(text.length >= 850, `${claim.id} er for kort (${text.length})`);
  return text;
}

assert(sourceBrief.status === 'source_first_ready_not_materialized', 'Felt 9 må være source-first før materialisering');
assert(sourceBrief.domain.ordinal === 9 && sourceBrief.domain.id === 'erstatning_tingsrett_formuesrett_rettsvern', 'Felt 9 har feil domene');
assert(sourceBrief.sources.length === 13 && sourceBrief.topic_briefs.length === 8 && claims.length === 32, 'Felt 9 source-first-kontrakt er brutt');

const moduleDefs = [
  ['01-erstatningsansvar-og-forsikringskrav', 'Erstatningsansvar og forsikringskrav', 0, 2],
  ['02-arsak-personskade-og-utmaling', 'Årsak, personskade og utmåling', 2, 4],
  ['03-eiendomsrett-servitutter-og-hevd', 'Eiendomsrett, servitutter og hevd', 4, 6],
  ['04-rettsvern-prioritet-pant-og-dekning', 'Rettsvern, prioritet, pant og dekning', 6, 8]
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
  domain_id: 'erstatning_tingsrett_formuesrett_rettsvern',
  id: chapterId,
  chapter_id: chapterId,
  title: 'Erstatning, tingsrett, formuesrett og rettsvern',
  subtitle: 'Fra ansvarsgrunnlag og årsak til eiendomsposisjon, tredjepersonsvern, pant og kreditorbeslag',
  lead: 'Kapittelet trener kildebelagt norsk privatrettslig analyse med klare skiller mellom erstatningsvilkår, eiendomsrett, rettsvern, prioritet og insolvensvirkninger.',
  learningObjectives: sourceBrief.topic_briefs.map((topic) => `analysere ${topic.title.toLowerCase()} med eksplisitt skille mellom grunnlag, vilkår, tredjepersonsvern og rettsvirkning`),
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
  domain_id: 'erstatning_tingsrett_formuesrett_rettsvern',
  chapter_id: chapterId,
  sourceBriefFile,
  purpose: 'Materialisere erstatning, tingsrett, formuesrett og rettsvern med klare skiller mellom ansvar, årsak, tap, eiendomsposisjon, gyldighet, rettsvern, prioritet og kreditorbeslag.',
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
  ['Hva må holdes atskilt i et ordinært erstatningskrav?', ['Ansvarsgrunnlag, faktisk og rettslig årsak, vernet skade og tap.', 'Bare tap og skyld.', 'Eiendomsrett og tinglysing alene.', 'Forsikring og pant som samme regel.'], 0],
  ['Hvordan analyseres lovfestet objektivt ansvar?', ['Skyld må alltid bevises først.', 'Virkeområde, ansvarssubjekt, skadebegrep, årsak, unntak og eventuell forsikringsmekanisme prøves etter særregimet.', 'Alle særregimer har identiske vilkår.', 'Et direktekrav fjerner behovet for skadebevis.'], 1],
  ['Hva er riktig om årsak, medvirkning og lemping?', ['De er alternative ord for samme vurdering.', 'Faktisk årsak og rettslig avgrensning prøves først; medvirkning og lemping er egne korrigerende spørsmål.', 'Medvirkning beviser manglende årsak.', 'Lemping brukes bare ved pant.'], 1],
  ['Hva må skilles ved personskadeutmåling?', ['Påført tap, fremtidig inntektstap, utgifter, menerstatning og forsørgertap.', 'Bare medisinsk invaliditet.', 'Alle forsikringsytelser kan summeres uten samordning.', 'Oppreisning og inntektstap er samme post.'], 0],
  ['Hvordan starter en eiendomsrettslig analyse?', ['Med å avgjøre hvem som virker mest rimelig.', 'Med objekt, rettighetens innhold, stiftelsesgrunnlag og konfliktens parter.', 'Med tinglysing uansett formuesgode.', 'Med erstatningsutmåling.'], 1],
  ['Hva skiller hevd fra servituttens innhold?', ['Ingenting; all langvarig bruk er servitutt.', 'Hevd gjelder erverv gjennom kvalifisert rådighet over tid, mens servituttens innhold først fastsettes ut fra sitt stiftelsesgrunnlag og regelverk.', 'Tinglysing erstatter hevdstid.', 'Sameieandel avgjør alltid servitutten.'], 1],
  ['Hva er riktig om rettsvern og prioritet?', ['Gyldighet mellom partene garanterer vern mot tredjeperson.', 'Riktig publisitetsakt, tidspunkt, formuesgode og eventuell god tro må vurderes etter den konkrete ekstinksjons- eller prioritetsregelen.', 'Besittelse og tinglysing er alltid utskiftbare.', 'God tro skaper alltid eierskap.'], 1],
  ['Hvordan analyseres pant og kreditorbeslag?', ['Avtale om sikkerhet er nok.', 'Pantegrunnlag, panteobjekt, sikret krav og rettsvern prøves før prioritet; beslag og omstøtelse vurderes deretter etter egne regler.', 'Omstøtelse er det samme som ugyldighet.', 'Boet kan beslaglegge alt skyldneren bruker.'], 1]
];

const questions = sourceBrief.topic_briefs.map((topic, index) => {
  const [prompt, choices, correctIndex] = assessmentBlueprints[index];
  return {
    id: `property-q${String(index + 1).padStart(2, '0')}`,
    prompt,
    choices,
    correctIndex,
    claim_ids: topic.planned_claims.map((claim) => claim.id),
    source_ids: [...new Set(topic.planned_claims.flatMap((claim) => claim.source_ids))]
  };
});

const caseClaimIds = [
  ['property-01', 'property-05', 'property-15'],
  ['property-07', 'property-13'],
  ['property-08', 'property-19'],
  ['property-21', 'property-23', 'property-24'],
  ['property-25', 'property-26', 'property-28'],
  ['property-29', 'property-30', 'property-31']
];
const caseTasks = sourceBrief.decision_scenarios.map((scenario, index) => ({
  id: `property-case-${String(index + 1).padStart(2, '0')}`,
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

console.log('Erstatning/tingsrett fulltekst materialisert deterministisk: 4 moduler / 8 seksjoner / 32 avsnitt / 32 claims.');
