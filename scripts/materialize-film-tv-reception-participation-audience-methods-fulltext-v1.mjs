#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CHAPTER_ID = 'resepsjon-deltakelse-og-publikumsmetoder';
const INPUT_GATE = 'reception_participation_audience_methods_source_brief_complete_full_chapter_production';
const OUTPUT_GATE = 'reception_participation_audience_methods_full_chapter_complete_next_unit_source_brief';
const SCREEN_PLACES_SOURCE_GATE = 'screen_places_identity_circulation_source_brief_complete_full_chapter_production';
const SCREEN_PLACES_FULLTEXT_GATE = 'screen_places_identity_circulation_full_chapter_complete_next_unit_source_brief';
const LOCATION_PRODUCTION_SOURCE_GATE = 'location_production_place_ethics_source_brief_complete_full_chapter_production';
const LOCATION_PRODUCTION_FULLTEXT_GATE = 'location_production_place_ethics_full_chapter_complete_next_unit_source_brief';
const ARCHIVE_PRESERVATION_SOURCE_GATE = 'archive_preservation_access_authenticity_source_brief_complete_full_chapter_production';
const ARCHIVE_PRESERVATION_FULLTEXT_GATE = 'archive_preservation_access_authenticity_full_chapter_complete_next_unit_source_brief';
const UNIT_TWELVE_OR_LATER_GATES = new Set([SCREEN_PLACES_SOURCE_GATE, SCREEN_PLACES_FULLTEXT_GATE, LOCATION_PRODUCTION_SOURCE_GATE, LOCATION_PRODUCTION_FULLTEXT_GATE, ARCHIVE_PRESERVATION_SOURCE_GATE, ARCHIVE_PRESERVATION_FULLTEXT_GATE]);

export const isFilmTvUnitTwelveOrLaterGate = (gate) => UNIT_TWELVE_OR_LATER_GATES.has(gate);

const P = Object.freeze({
  sourceBrief: 'data/fag/TV_og_Film/film_tv_reception_participation_audience_methods_source_claim_brief_v1.json',
  sources: 'data/fag/TV_og_Film/film_tv_reception_participation_audience_methods_sources_v1.json',
  cases: 'data/fag/TV_og_Film/film_tv_reception_participation_audience_methods_cases_v1.json',
  topicClaims: 'data/fag/TV_og_Film/film_tv_reception_participation_audience_methods_topic_claims_v1.json',
  emners: 'data/fag/TV_og_Film/emner_film_tv_canonical_v4_5.json',
  methods: 'data/fag/TV_og_Film/methods_film_tv_canonical_v4_5.json',
  learningPlan: 'data/fag/TV_og_Film/film_tv_learning_order_plan_v1.json',
  chapter: `data/fagverk/film_tv/${CHAPTER_ID}.json`,
  brief: `data/fagverk/film_tv/${CHAPTER_ID}/brief.json`,
  claims: `data/fagverk/film_tv/${CHAPTER_ID}/claims.json`,
  registry: 'data/fagverk/fagverk_registry.json',
  status: 'data/fagverk/subject_status.json'
});

export const CLAIM_SOURCE_IDS = Object.freeze({
  'rp-children-1': ['rp01-ofcom-children-2026', 'rp04-pew-teens-methodology-2024', 'rp05-ofcom-adults-2026'],
  'rp-children-2': ['rp01-ofcom-children-2026', 'rp02-ofcom-children-asmr-self-improvement', 'rp03-pew-teens-2024', 'rp04-pew-teens-methodology-2024'],
  'rp-children-3': ['rp01-ofcom-children-2026', 'rp03-pew-teens-2024', 'rp04-pew-teens-methodology-2024', 'rp25-ofcom-media-nations-2026'],
  'rp-children-4': ['rp01-ofcom-children-2026', 'rp02-ofcom-children-asmr-self-improvement'],
  'rp-children-5': ['rp01-ofcom-children-2026', 'rp05-ofcom-adults-2026', 'rp25-ofcom-media-nations-2026'],
  'rp-fans-1': ['rp07-ofcom-online-communities-2026', 'rp08-ghosh-aragon-fanfiction-participation'],
  'rp-fans-2': ['rp07-ofcom-online-communities-2026', 'rp08-ghosh-aragon-fanfiction-participation', 'rp09-ocone-bobaboard-ethnography'],
  'rp-fans-3': ['rp08-ghosh-aragon-fanfiction-participation', 'rp09-ocone-bobaboard-ethnography'],
  'rp-fans-4': ['rp07-ofcom-online-communities-2026', 'rp08-ghosh-aragon-fanfiction-participation', 'rp09-ocone-bobaboard-ethnography'],
  'rp-fans-5': ['rp12-schreyer-navi-fandom-survey', 'rp18-participations-cult-television-issue', 'rp31-aapor-best-practices'],
  'rp-expectation-1': ['rp13-schroder-postbroadcast-reception', 'rp15-tkalec-device-horizon-reception', 'rp19-wessels-how-audiences-form'],
  'rp-expectation-2': ['rp14-michelle-hobbit-expectations', 'rp31-aapor-best-practices'],
  'rp-expectation-3': ['rp13-schroder-postbroadcast-reception', 'rp14-michelle-hobbit-expectations', 'rp19-wessels-how-audiences-form'],
  'rp-expectation-4': ['rp14-michelle-hobbit-expectations', 'rp15-tkalec-device-horizon-reception'],
  'rp-repetition-1': ['rp19-wessels-how-audiences-form', 'rp20-choi-li-repeat-viewing', 'rp21-donnelly-repeated-viewing', 'rp22-johnson-default-viewing'],
  'rp-repetition-2': ['rp21-donnelly-repeated-viewing'],
  'rp-repetition-3': ['rp18-participations-cult-television-issue', 'rp19-wessels-how-audiences-form', 'rp20-choi-li-repeat-viewing'],
  'rp-repetition-4': ['rp18-participations-cult-television-issue', 'rp20-choi-li-repeat-viewing', 'rp22-johnson-default-viewing'],
  'rp-household-1': ['rp05-ofcom-adults-2026', 'rp06-ofcom-media-lives-2026', 'rp25-ofcom-media-nations-2026'],
  'rp-household-2': ['rp05-ofcom-adults-2026', 'rp25-ofcom-media-nations-2026'],
  'rp-household-3': ['rp06-ofcom-media-lives-2026', 'rp23-nee-barker-second-screening'],
  'rp-household-4': ['rp06-ofcom-media-lives-2026', 'rp22-johnson-default-viewing'],
  'rp-cult-1': ['rp08-ghosh-aragon-fanfiction-participation', 'rp18-participations-cult-television-issue', 'rp19-wessels-how-audiences-form'],
  'rp-cult-2': ['rp11-petersen-older-sherlock-fans', 'rp18-participations-cult-television-issue', 'rp19-wessels-how-audiences-form'],
  'rp-cult-3': ['rp11-petersen-older-sherlock-fans', 'rp12-schreyer-navi-fandom-survey', 'rp31-aapor-best-practices'],
  'rp-cult-4': ['rp12-schreyer-navi-fandom-survey', 'rp18-participations-cult-television-issue', 'rp19-wessels-how-audiences-form'],
  'rp-social-users-1': ['rp07-ofcom-online-communities-2026', 'rp08-ghosh-aragon-fanfiction-participation', 'rp09-ocone-bobaboard-ethnography', 'rp23-nee-barker-second-screening'],
  'rp-social-users-2': ['rp07-ofcom-online-communities-2026', 'rp09-ocone-bobaboard-ethnography', 'rp32-aoir-ethics'],
  'rp-social-users-3': ['rp22-johnson-default-viewing', 'rp23-nee-barker-second-screening'],
  'rp-social-users-4': ['rp07-ofcom-online-communities-2026', 'rp09-ocone-bobaboard-ethnography', 'rp32-aoir-ethics'],
  'rp-identity-1': ['rp10-joyce-bl-identity-work', 'rp11-petersen-older-sherlock-fans', 'rp12-schreyer-navi-fandom-survey'],
  'rp-identity-2': ['rp34-orning-embodied-spectator', 'rp35-vu-shot-scale', 'rp36-tchernev-character-identification'],
  'rp-identity-3': ['rp10-joyce-bl-identity-work', 'rp11-petersen-older-sherlock-fans', 'rp12-schreyer-navi-fandom-survey'],
  'rp-identity-4': ['rp10-joyce-bl-identity-work', 'rp11-petersen-older-sherlock-fans', 'rp32-aoir-ethics', 'rp35-vu-shot-scale', 'rp36-tchernev-character-identification'],
  'rp-methods-1': ['rp01-ofcom-children-2026', 'rp06-ofcom-media-lives-2026', 'rp09-ocone-bobaboard-ethnography', 'rp24-barb-methodology', 'rp30-ucl-subtitle-reading'],
  'rp-methods-2': ['rp01-ofcom-children-2026', 'rp12-schreyer-navi-fandom-survey', 'rp14-michelle-hobbit-expectations', 'rp24-barb-methodology', 'rp31-aapor-best-practices'],
  'rp-methods-3': ['rp06-ofcom-media-lives-2026', 'rp09-ocone-bobaboard-ethnography', 'rp32-aoir-ethics'],
  'rp-methods-4': ['rp06-ofcom-media-lives-2026', 'rp14-michelle-hobbit-expectations', 'rp24-barb-methodology', 'rp30-ucl-subtitle-reading'],
  'rp-methods-5': ['rp01-ofcom-children-2026', 'rp32-aoir-ethics', 'rp33-icc-esomar-code-2025'],
  'rp-methods-6': ['rp06-ofcom-media-lives-2026', 'rp09-ocone-bobaboard-ethnography', 'rp14-michelle-hobbit-expectations', 'rp24-barb-methodology', 'rp30-ucl-subtitle-reading'],
  'rp-history-1': ['rp16-media-history-digital-library', 'rp17-fiaf-periodicals-index', 'rp18-participations-cult-television-issue'],
  'rp-history-2': ['rp13-schroder-postbroadcast-reception', 'rp16-media-history-digital-library', 'rp17-fiaf-periodicals-index'],
  'rp-history-3': ['rp16-media-history-digital-library', 'rp17-fiaf-periodicals-index'],
  'rp-history-4': ['rp14-michelle-hobbit-expectations', 'rp18-participations-cult-television-issue', 'rp31-aapor-best-practices'],
  'rp-access-1': ['rp26-w3c-captions', 'rp27-w3c-audio-description', 'rp28-eu-accessibility-act', 'rp29-ofcom-access-services-2025'],
  'rp-access-2': ['rp28-eu-accessibility-act', 'rp29-ofcom-access-services-2025'],
  'rp-access-3': ['rp25-ofcom-media-nations-2026', 'rp26-w3c-captions', 'rp27-w3c-audio-description', 'rp30-ucl-subtitle-reading'],
  'rp-access-4': ['rp26-w3c-captions', 'rp27-w3c-audio-description', 'rp30-ucl-subtitle-reading'],
  'rp-access-5': ['rp25-ofcom-media-nations-2026', 'rp29-ofcom-access-services-2025', 'rp30-ucl-subtitle-reading'],
  'rp-spectator-1': ['rp13-schroder-postbroadcast-reception', 'rp34-orning-embodied-spectator'],
  'rp-spectator-2': ['rp34-orning-embodied-spectator', 'rp35-vu-shot-scale', 'rp36-tchernev-character-identification'],
  'rp-spectator-3': ['rp21-donnelly-repeated-viewing', 'rp35-vu-shot-scale', 'rp36-tchernev-character-identification'],
  'rp-spectator-4': ['rp21-donnelly-repeated-viewing', 'rp35-vu-shot-scale', 'rp36-tchernev-character-identification'],
  'rp-spectator-5': ['rp13-schroder-postbroadcast-reception', 'rp15-tkalec-device-horizon-reception', 'rp34-orning-embodied-spectator']
});

const abs = (file) => path.join(ROOT, file);
const read = (file) => JSON.parse(fs.readFileSync(abs(file), 'utf8'));
const write = (file, value) => {
  fs.mkdirSync(path.dirname(abs(file)), { recursive: true });
  fs.writeFileSync(abs(file), `${JSON.stringify(value, null, 2)}\n`);
};
const assert = (ok, message) => { if (!ok) throw new Error(message); };
const rowsFromManifest = (manifestPath, filesKey, rowsKey) =>
  read(manifestPath)[filesKey].flatMap((file) => read(file)[rowsKey]);
const maxDottedVersion = (current, floor) => {
  const parse = (value) => String(value || '0.0.0').split('.').map((part) => Number.parseInt(part, 10) || 0);
  const a = parse(current);
  const b = parse(floor);
  for (let index = 0; index < Math.max(a.length, b.length); index += 1) {
    if ((a[index] || 0) !== (b[index] || 0)) return (a[index] || 0) > (b[index] || 0) ? current : floor;
  }
  return current || floor;
};
const maxIsoDate = (current, floor) => current && current > floor ? current : floor;

export function buildFilmTvReceptionParticipationAudienceMethodsFulltextV1() {
  const sourceBrief = structuredClone(read(P.sourceBrief));
  const sources = rowsFromManifest(P.sources, 'source_files', 'sources');
  const cases = rowsFromManifest(P.cases, 'case_files', 'cases');
  const topicBriefs = rowsFromManifest(P.topicClaims, 'topic_claim_files', 'topic_briefs');
  const emners = read(P.emners);
  const methodsDocument = read(P.methods);
  const methods = Array.isArray(methodsDocument) ? methodsDocument : methodsDocument.methods;
  const methodRegistry = new Set(methods.map((row) => row.method_id || row.id));
  const learningPlan = read(P.learningPlan);
  const chapter = structuredClone(read(P.chapter));
  const chapterBrief = structuredClone(read(P.brief));
  const registry = structuredClone(read(P.registry));
  const status = structuredClone(read(P.status));
  const currentGate = status.subjects.find((row) => row.id === 'film_tv')?.nextGate;
  const laterGateAlreadyActive = isFilmTvUnitTwelveOrLaterGate(currentGate);
  const unit = learningPlan.planned_units.find((row) => row.id === CHAPTER_ID);
  assert(unit?.sequence === 11, 'Læringsplanen mangler enhet 11');

  const modules = chapter.moduleFiles.map(read);
  const sections = modules.flatMap((module) => module.sections || []);
  assert(modules.length === 4, 'Enhet 11 skal ha fire moduler');
  assert(sections.length === 12 && sections.every((section) => section.emne_ids?.length === 1), 'Enhet 11 skal ha 12 emneeide seksjoner');
  const paragraphsByModule = modules.map((module) => module.sections.reduce((sum, section) => sum + section.paragraphs.length, 0));
  assert(JSON.stringify(paragraphsByModule) === JSON.stringify([17, 14, 13, 10]), 'Enhet 11 skal ha variabel avsnittsfordeling 17/14/13/10');
  const paragraphClaimIds = sections.flatMap((section) => section.paragraphClaimIds || []).flat();
  assert(paragraphClaimIds.length === 54 && new Set(paragraphClaimIds).size === 54, 'Enhet 11 skal ha 54 entydig claimsporede avsnitt');

  const sourceIds = new Set(sources.map((source) => source.id));
  const caseIds = new Set(cases.map((row) => row.id));
  const topicByClaimId = new Map();
  const topicByEmneId = new Map(topicBriefs.map((topic) => [topic.emne_id, topic]));
  for (const topic of topicBriefs) {
    for (const planned of topic.planned_claims) {
      const evidence = CLAIM_SOURCE_IDS[planned.id];
      assert(Array.isArray(evidence) && evidence.length > 0, `Claim ${planned.id} mangler claimspesifikk evidensmapping`);
      assert(evidence.every((id) => topic.source_ids.includes(id)), `Claim ${planned.id} bruker kilde utenfor emnets brief`);
      assert(evidence.every((id) => sourceIds.has(id)), `Claim ${planned.id} peker til ukjent kilde`);
      topicByClaimId.set(planned.id, topic);
    }
  }
  assert(topicByClaimId.size === 54, 'Kildebriefen skal ha 54 planlagte claims');
  assert(Object.keys(CLAIM_SOURCE_IDS).length === 54, 'Claim-evidensmappingen skal ha 54 oppføringer');
  assert(Object.keys(CLAIM_SOURCE_IDS).every((id) => topicByClaimId.has(id)), 'Claim-evidensmappingen inneholder ukjent claim-ID');
  assert(paragraphClaimIds.every((id) => topicByClaimId.has(id)), 'Et fulltekstavsnitt peker til ukjent claimplan');

  for (const section of sections) {
    const topic = topicByEmneId.get(section.emne_ids[0]);
    assert(topic, `Seksjon ${section.id} mangler canonical emneeier`);
    assert(section.documentedCaseIds?.length >= 2, `Seksjon ${section.id} mangler minst to dokumenterte case`);
    assert(section.documentedCaseIds.every((id) => topic.case_ids.includes(id) && caseIds.has(id)), `Seksjon ${section.id} bruker case utenfor emnebriefen`);
    assert(section.theoryResearchers?.length >= 2, `Seksjon ${section.id} mangler navngitte forskere eller teoritradisjoner`);
    assert(section.methodLimits?.length >= 2, `Seksjon ${section.id} mangler metodebegrensninger`);
    assert(typeof section.documentedDisagreement === 'string' && section.documentedDisagreement.length >= 100, `Seksjon ${section.id} mangler dokumentert faglig uenighet`);
  }

  const sectionByEmne = new Map(sections.map((section) => [section.emne_ids[0], section.id]));
  const claims = topicBriefs.flatMap((topic) => topic.planned_claims.map((planned) => ({
    id: planned.id,
    claim_plan_id: planned.id,
    claim: planned.claim_focus,
    source_ids: [...CLAIM_SOURCE_IDS[planned.id]],
    status: 'verified',
    plan_resolution: 'verified_as_planned',
    evidence_mode: planned.claim_type,
    used_in: [sectionByEmne.get(topic.emne_id)]
  })));
  assert(claims.every((claim) => claim.used_in[0]), 'En sluttclaim mangler emneeid seksjon');
  const usedSourceIds = new Set(claims.flatMap((claim) => claim.source_ids));
  assert(sources.every((source) => usedSourceIds.has(source.id)), 'Alle 36 briefkilder må brukes av minst én sluttclaim');
  assert(claims.some((claim) => claim.source_ids.length < topicByClaimId.get(claim.id).source_ids.length), 'Sluttclaimene kan ikke arve hele emnets kildeliste ukritisk');

  const emneById = new Map(emners.map((row) => [row.emne_id, row]));
  const methodIds = [...new Set(chapter.emne_ids.flatMap((id) => emneById.get(id)?.method_ids || []))];
  assert(methodIds.length > 0 && methodIds.every((id) => methodRegistry.has(id)), 'Kapitlet mangler gyldige canonicale metoder');
  chapter.method_ids = methodIds;
  chapter.workCases = cases.map((row) => ({
    id: row.id,
    title: row.work,
    year: row.years,
    medium: row.medium,
    territory: row.territory,
    role: row.purpose,
    source_ids: row.source_ids
  }));
  chapterBrief.requiredMethodIds = methodIds;

  const claimsDoc = {
    schema: 'history_go_fagverk_chapter_claims_v1',
    version: '1.0.0',
    subject_id: 'film_tv',
    chapter_id: CHAPTER_ID,
    sourceBriefFile: P.sourceBrief,
    sources: sources.map((source) => ({ ...source, label: `${source.publisher} – ${source.title}` })),
    claims
  };

  registry.version = maxDottedVersion(registry.version, '2.95.0');
  registry.updatedAt = maxIsoDate(registry.updatedAt, '2026-08-14');
  const registryChapter = {
    id: CHAPTER_ID,
    title: chapter.title,
    subtitle: chapter.subtitle,
    file: P.chapter,
    primary_domain_id: chapter.primary_domain_id,
    emne_ids: chapter.emne_ids,
    claimsFile: P.claims,
    briefFile: P.brief
  };
  const chapters = registry.subjects.film_tv.chapters;
  const chapterIndex = chapters.findIndex((row) => row.id === CHAPTER_ID);
  if (chapterIndex === -1) chapters.push(registryChapter); else chapters[chapterIndex] = registryChapter;
  if (!laterGateAlreadyActive) {
    registry.subjects.film_tv.canonicalModel.note = 'Film & TVs variable canon har 192 emner. Resepsjon, deltakelse og publikumsmetoder er registrert etter fulltekst-, claim- og evidensport med 12 canonicale emner, 4 variable moduler, 12 emneeide seksjoner, 54 claimsporede fagavsnitt, 54/54 verifiserte claims, 36 brukte inspectable kilder og 32 dokumenterte case. Faktisk resepsjon holdes adskilt fra tekstlig mulighet, og survey, intervju, etnografi, panel, digital trace, eksperiment og arkiv beholder egne evidensroller. Neste port er kilde- og claimbrief for Skjermsteder, identitet og sirkulasjon.';
  }
  registry.subjects.film_tv.canonicalModel.eleventhSourceClaimBrief = P.sourceBrief;

  status.version = maxDottedVersion(status.version, '1.88.0');
  status.updatedAt = maxIsoDate(status.updatedAt, '2026-08-14');
  const filmStatus = status.subjects.find((row) => row.id === 'film_tv');
  assert(filmStatus, 'Mangler Film & TV-status');
  if (!laterGateAlreadyActive) {
    filmStatus.editorialStatus = 'chapters_in_progress';
    filmStatus.nextGate = OUTPUT_GATE;
    filmStatus.note = 'Resepsjon, deltakelse og publikumsmetoder er registrert etter fulltekst- og evidensaudit: 12/12 canonicale emner, 4 variable moduler, 12 seksjoner, 54 claimsporede fagavsnitt, 54/54 løste claimplaner, 36 brukte inspectable kilder og 32 case. Verksanalyse, publikumsdata, digitale spor, historiske kilder og eksperimentelle effekter er avgrenset etter analyseenhet, konstruksjon, metode, periode, territorium og etikk. Neste port er kilde- og claimbrief for Skjermsteder, identitet og sirkulasjon.';
  }

  return { sourceBrief, sources, cases, topicBriefs, chapter, chapterBrief, claimsDoc, registry, status, modules, sections, unit };
}

export function materializeFilmTvReceptionParticipationAudienceMethodsFulltextV1({ force = false } = {}) {
  const currentGate = read(P.status).subjects.find((row) => row.id === 'film_tv')?.nextGate;
  if (!force) assert([INPUT_GATE, OUTPUT_GATE].includes(currentGate) || isFilmTvUnitTwelveOrLaterGate(currentGate), `Uventet Film & TV-port: ${currentGate}`);
  const built = buildFilmTvReceptionParticipationAudienceMethodsFulltextV1();
  write(P.chapter, built.chapter);
  write(P.brief, built.chapterBrief);
  write(P.claims, built.claimsDoc);
  write(P.registry, built.registry);
  write(P.status, built.status);
  console.log('Materialiserte Film & TV/enhet 11: 12 emner, 4 moduler, 12 seksjoner, 54 claims, 36 kilder og 32 case.');
  return built;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = new Set(process.argv.slice(2));
  try { materializeFilmTvReceptionParticipationAudienceMethodsFulltextV1({ force: args.has('--write') }); }
  catch (error) { console.error(`Film & TV enhet 11 fulltekst FEIL: ${error.message}`); process.exitCode = 1; }
}
