#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CHAPTER_ID = 'industri-regulering-og-distribusjon';
const INPUT_GATE = 'industry_regulation_distribution_source_brief_complete_full_chapter_production';
const OUTPUT_GATE = 'industry_regulation_distribution_full_chapter_complete_next_unit_source_brief';

const P = Object.freeze({
  sourceBrief: 'data/fag/TV_og_Film/film_tv_industry_regulation_distribution_source_claim_brief_v1.json',
  sources: 'data/fag/TV_og_Film/film_tv_industry_regulation_distribution_sources_v1.json',
  cases: 'data/fag/TV_og_Film/film_tv_industry_regulation_distribution_cases_v1.json',
  topicClaims: 'data/fag/TV_og_Film/film_tv_industry_regulation_distribution_topic_claims_v1.json',
  emners: 'data/fag/TV_og_Film/emner_film_tv_canonical_v4_5.json',
  methods: 'data/fag/TV_og_Film/methods_film_tv_canonical_v4_5.json',
  learningPlan: 'data/fag/TV_og_Film/film_tv_learning_order_plan_v1.json',
  chapter: `data/fagverk/film_tv/${CHAPTER_ID}.json`,
  brief: `data/fagverk/film_tv/${CHAPTER_ID}/brief.json`,
  claims: `data/fagverk/film_tv/${CHAPTER_ID}/claims.json`,
  registry: 'data/fagverk/fagverk_registry.json',
  status: 'data/fagverk/subject_status.json'
});

const CLAIM_SOURCE_IDS = Object.freeze({
  'ir-support-1': ['ir09-nfi-funding-schemes', 'ir10-nfi-after-support', 'ir11-nfi-launch-distribution'],
  'ir-support-2': ['ir09-nfi-funding-schemes', 'ir10-nfi-after-support'],
  'ir-support-3': ['ir12-creative-europe-media', 'ir14-creative-europe-content-cluster'],
  'ir-support-4': ['ir09-nfi-funding-schemes', 'ir11-nfi-launch-distribution', 'ir12-creative-europe-media', 'ir14-creative-europe-content-cluster'],
  'ir-coproduction-1': ['ir15-eurimages-coproduction', 'ir16-nfi-production-incentive'],
  'ir-coproduction-2': ['ir15-eurimages-coproduction'],
  'ir-coproduction-3': ['ir16-nfi-production-incentive'],
  'ir-coproduction-4': ['ir12-creative-europe-media', 'ir14-creative-europe-content-cluster', 'ir15-eurimages-coproduction'],
  'ir-coproduction-5': ['ir16-nfi-production-incentive'],
  'ir-festival-1': ['ir18-cannes-submit'],
  'ir-festival-2': ['ir18-cannes-submit', 'ir19-cannes-accreditation'],
  'ir-festival-3': ['ir13-creative-europe-business-cluster', 'ir18-cannes-submit'],
  'ir-festival-4': ['ir13-creative-europe-business-cluster', 'ir19-cannes-accreditation'],
  'ir-valuechain-1': ['ir11-nfi-launch-distribution', 'ir13-creative-europe-business-cluster', 'ir17-eurimages-marketing-audience'],
  'ir-valuechain-2': ['ir13-creative-europe-business-cluster'],
  'ir-valuechain-3': ['ir11-nfi-launch-distribution', 'ir17-eurimages-marketing-audience'],
  'ir-valuechain-4': ['ir11-nfi-launch-distribution', 'ir13-creative-europe-business-cluster'],
  'ir-ownership-1': ['ir07-eao-services-ownership-2025', 'ir08-eao-us-groups-europe'],
  'ir-ownership-2': ['ir07-eao-services-ownership-2025'],
  'ir-ownership-3': ['ir08-eao-us-groups-europe'],
  'ir-ownership-4': ['ir07-eao-services-ownership-2025', 'ir08-eao-us-groups-europe'],
  'ir-ownership-5': ['ir06-european-media-freedom-act'],
  'ir-platform-1': ['ir23-dsa-article27', 'ir24-ec-youtube-recommender-rfi'],
  'ir-platform-2': ['ir23-dsa-article27'],
  'ir-platform-3': ['ir24-ec-youtube-recommender-rfi'],
  'ir-platform-4': ['ir25-dma-gatekeepers'],
  'ir-platform-5': ['ir06-european-media-freedom-act', 'ir23-dsa-article27', 'ir24-ec-youtube-recommender-rfi', 'ir25-dma-gatekeepers'],
  'ir-audience-1': ['ir26-barb-methodology', 'ir27-barb-youtube-measurement'],
  'ir-audience-2': ['ir26-barb-methodology'],
  'ir-audience-3': ['ir27-barb-youtube-measurement'],
  'ir-audience-4': ['ir17-eurimages-marketing-audience', 'ir26-barb-methodology'],
  'ir-rights-1': ['ir20-eao-independent-production-ip', 'ir21-wipo-copyright-protection', 'ir22-eao-release-windows-territoriality'],
  'ir-rights-2': ['ir20-eao-independent-production-ip'],
  'ir-rights-3': ['ir22-eao-release-windows-territoriality'],
  'ir-rights-4': ['ir21-wipo-copyright-protection', 'ir22-eao-release-windows-territoriality'],
  'ir-rights-5': ['ir33-wipo-digital-copyright-adr'],
  'ir-format-1': ['ir28-frapa-format-ecosystem', 'ir31-eao-localized-services', 'ir34-eao-adaptations'],
  'ir-format-2': ['ir29-frapa-code'],
  'ir-format-3': ['ir30-frapa-registration'],
  'ir-format-4': ['ir31-eao-localized-services', 'ir34-eao-adaptations'],
  'ir-informal-1': ['ir21-wipo-copyright-protection'],
  'ir-informal-2': ['ir32-euipo-online-piracy'],
  'ir-informal-3': ['ir22-eao-release-windows-territoriality', 'ir32-euipo-online-piracy'],
  'ir-informal-4': ['ir33-wipo-digital-copyright-adr'],
  'ir-age-1': ['ir01-medietilsynet-age-ratings', 'ir02-bildeprogramloven'],
  'ir-age-2': ['ir01-medietilsynet-age-ratings', 'ir02-bildeprogramloven'],
  'ir-age-3': ['ir02-bildeprogramloven', 'ir03-avmsd-implementation-dialogue'],
  'ir-age-4': ['ir04-echr-article10-guide'],
  'ir-censorship-1': ['ir02-bildeprogramloven', 'ir03-avmsd-implementation-dialogue'],
  'ir-censorship-2': ['ir02-bildeprogramloven', 'ir05-coe-media-regulators'],
  'ir-censorship-3': ['ir04-echr-article10-guide'],
  'ir-censorship-4': ['ir05-coe-media-regulators']
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

export function buildFilmTvIndustryRegulationDistributionFulltextV1() {
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
  const unit = learningPlan.planned_units.find((row) => row.id === CHAPTER_ID);
  assert(unit, 'Læringsplanen mangler enhet 10');

  const modules = chapter.moduleFiles.map(read);
  const sections = modules.flatMap((module) => module.sections || []);
  assert(sections.length === 12 && sections.every((section) => section.emne_ids?.length === 1), 'Enhet 10 skal ha 12 emneeide seksjoner');
  const paragraphClaimIds = sections.flatMap((section) => section.paragraphClaimIds || []).flat();
  assert(paragraphClaimIds.length === 52 && new Set(paragraphClaimIds).size === 52, 'Enhet 10 skal ha 52 entydig claimsporede avsnitt');

  const sourceIds = new Set(sources.map((source) => source.id));
  const topicByClaimId = new Map();
  for (const topic of topicBriefs) {
    for (const planned of topic.planned_claims) {
      const evidence = CLAIM_SOURCE_IDS[planned.id];
      assert(Array.isArray(evidence) && evidence.length > 0, `Claim ${planned.id} mangler claimspesifikk evidensmapping`);
      assert(evidence.every((id) => topic.source_ids.includes(id)), `Claim ${planned.id} bruker en kilde utenfor emnets kildegrunnlag`);
      assert(evidence.every((id) => sourceIds.has(id)), `Claim ${planned.id} peker til ukjent kilde`);
      topicByClaimId.set(planned.id, topic);
    }
  }
  assert(topicByClaimId.size === 52, 'Kildebriefen skal ha 52 planlagte claims');
  assert(Object.keys(CLAIM_SOURCE_IDS).length === 52, 'Claim-evidensmappingen skal ha 52 oppføringer');
  assert(Object.keys(CLAIM_SOURCE_IDS).every((id) => topicByClaimId.has(id)), 'Claim-evidensmappingen inneholder ukjent claim-ID');
  assert(paragraphClaimIds.every((id) => topicByClaimId.has(id)), 'Et fulltekstavsnitt peker til ukjent claimplan');

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
  assert(sources.every((source) => usedSourceIds.has(source.id)), 'Alle 34 briefkilder må brukes av minst én sluttclaim');
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

  registry.version = maxDottedVersion(registry.version, '2.93.0');
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
  registry.subjects.film_tv.canonicalModel.note = 'Film & TVs variable canon har 192 emner. Industri, regulering og distribusjon er registrert etter fulltekst-, claim- og evidensport med 12 canonicale emner, 4 moduler, 12 emneeide seksjoner, 52 claimsporede fagavsnitt, 52/52 verifiserte claims, 34 brukte inspectable kilder og 34 case. Støtte, eierskap, plattformfunksjon, publikumsmåling, rettigheter, klassifisering, format og håndheving holdes i separate evidensspor med eksplisitt tid og territorium. Neste port er kilde- og claimbrief for Resepsjon, deltakelse og publikumsmetoder.';
  registry.subjects.film_tv.canonicalModel.tenthSourceClaimBrief = P.sourceBrief;

  status.version = maxDottedVersion(status.version, '1.86.0');
  status.updatedAt = maxIsoDate(status.updatedAt, '2026-08-14');
  const filmStatus = status.subjects.find((row) => row.id === 'film_tv');
  assert(filmStatus, 'Mangler Film & TV-status');
  filmStatus.editorialStatus = 'chapters_in_progress';
  filmStatus.nextGate = OUTPUT_GATE;
  filmStatus.note = 'Industri, regulering og distribusjon er registrert etter fulltekst- og evidensaudit: 12/12 canonicale emner, 4 moduler, 12 seksjoner, 52 claimsporede fagavsnitt, 52/52 løste claimplaner, 34 brukte inspectable kilder og 34 case. Marked, makt, rettigheter og regulering er avgrenset med aktør, objekt, metode, periode og territorium. Neste port er kilde- og claimbrief for Resepsjon, deltakelse og publikumsmetoder.';

  return {
    sourceBrief,
    sources,
    cases,
    topicBriefs,
    chapter,
    chapterBrief,
    claimsDoc,
    registry,
    status,
    modules,
    unit
  };
}

export function materializeFilmTvIndustryRegulationDistributionFulltextV1({ force = false } = {}) {
  const currentGate = read(P.status).subjects.find((row) => row.id === 'film_tv')?.nextGate;
  if (!force) assert([INPUT_GATE, OUTPUT_GATE].includes(currentGate), `Uventet Film & TV-port: ${currentGate}`);
  const built = buildFilmTvIndustryRegulationDistributionFulltextV1();
  write(P.chapter, built.chapter);
  write(P.brief, built.chapterBrief);
  write(P.claims, built.claimsDoc);
  write(P.registry, built.registry);
  write(P.status, built.status);
  console.log('Materialiserte Film & TV/enhet 10: 12 emner, 4 moduler, 12 seksjoner, 52 claims, 34 kilder og 34 case.');
  return built;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = new Set(process.argv.slice(2));
  try {
    materializeFilmTvIndustryRegulationDistributionFulltextV1({ force: args.has('--write') });
  } catch (error) {
    console.error(`Film & TV enhet 10 fulltekst FEIL: ${error.message}`);
    process.exitCode = 1;
  }
}
