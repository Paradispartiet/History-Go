#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CHAPTER_ID = 'skapende-arbeid-teknologi-og-ansvar';
const INPUT_GATE = 'screen_public_sphere_community_society_full_chapter_complete_next_unit_source_brief';
const OUTPUT_GATE = 'creative_work_technology_responsibility_full_chapter_complete_next_unit_source_brief';
const P = Object.freeze({
  sourceBrief: 'data/fag/TV_og_Film/film_tv_creative_work_technology_responsibility_source_claim_brief_v1.json',
  sources: 'data/fag/TV_og_Film/film_tv_creative_work_technology_responsibility_sources_v1.json',
  cases: 'data/fag/TV_og_Film/film_tv_creative_work_technology_responsibility_cases_v1.json',
  topicClaims: 'data/fag/TV_og_Film/film_tv_creative_work_technology_responsibility_topic_claims_v1.json',
  emners: 'data/fag/TV_og_Film/emner_film_tv_canonical_v4_5.json',
  learningPlan: 'data/fag/TV_og_Film/film_tv_learning_order_plan_v1.json',
  chapter: `data/fagverk/film_tv/${CHAPTER_ID}.json`,
  brief: `data/fagverk/film_tv/${CHAPTER_ID}/brief.json`,
  claims: `data/fagverk/film_tv/${CHAPTER_ID}/claims.json`,
  registry: 'data/fagverk/fagverk_registry.json',
  status: 'data/fagverk/subject_status.json'
});
const abs = (file) => path.join(ROOT, file);
const read = (file) => JSON.parse(fs.readFileSync(abs(file), 'utf8'));
const write = (file, value) => { fs.mkdirSync(path.dirname(abs(file)), { recursive: true }); fs.writeFileSync(abs(file), `${JSON.stringify(value, null, 2)}\n`); };
const assert = (ok, message) => { if (!ok) throw new Error(message); };
const maxDottedVersion = (current, floor) => {
  const p = (value) => String(value || '0.0.0').split('.').map((x) => Number.parseInt(x, 10) || 0);
  const a = p(current), b = p(floor);
  for (let i = 0; i < Math.max(a.length, b.length); i += 1) {
    if ((a[i] || 0) !== (b[i] || 0)) return (a[i] || 0) > (b[i] || 0) ? current : floor;
  }
  return current || floor;
};
const maxIsoDate = (current, floor) => current && current > floor ? current : floor;

export function buildFilmTvCreativeWorkTechnologyResponsibilityFulltextV1() {
  const sourceBrief = structuredClone(read(P.sourceBrief));
  const sourcesDoc = read(P.sources);
  const casesDoc = read(P.cases);
  const topicClaims = structuredClone(read(P.topicClaims));
  const emners = read(P.emners);
  const learningPlan = read(P.learningPlan);
  const chapter = structuredClone(read(P.chapter));
  const chapterBrief = structuredClone(read(P.brief));
  const registry = structuredClone(read(P.registry));
  const status = structuredClone(read(P.status));
  const unit = learningPlan.planned_units.find((row) => row.id === CHAPTER_ID);
  assert(unit, 'Læringsplanen mangler enhet 9');
  const modules = chapter.moduleFiles.map(read);
  const sections = modules.flatMap((row) => row.sections || []);
  assert(sections.length === 11 && sections.every((row) => row.emne_ids?.length === 1), 'Enhet 9 skal ha 11 emneeide seksjoner');
  const paragraphClaimIds = sections.flatMap((row) => row.paragraphClaimIds || []).flat();
  assert(paragraphClaimIds.length === 48 && new Set(paragraphClaimIds).size === 48, 'Enhet 9 skal ha 48 entydig claimsporede avsnitt');
  const topicByClaimId = new Map();
  for (const topic of topicClaims.topic_briefs) for (const planned of topic.planned_claims) topicByClaimId.set(planned.id, topic);
  const sectionByEmne = new Map(sections.map((row) => [row.emne_ids[0], row.id]));
  const sourceIds = new Set(sourcesDoc.sources.map((row) => row.id));
  const claims = topicClaims.topic_briefs.flatMap((topic) => topic.planned_claims.map((planned) => ({
    id: planned.id,
    claim_plan_id: planned.id,
    claim: planned.claim_focus,
    source_ids: [...topic.source_ids],
    status: 'verified',
    plan_resolution: 'verified_as_planned',
    evidence_mode: planned.claim_type,
    used_in: [sectionByEmne.get(topic.emne_id)]
  })));
  assert(claims.length === 48 && new Set(claims.map((row) => row.id)).size === 48, 'Sluttregisteret skal ha 48 unike claims');
  assert(claims.every((row) => row.used_in[0] && row.source_ids.length && row.source_ids.every((id) => sourceIds.has(id))), 'En sluttclaim har uløst seksjon eller kilde');
  const usedSourceIds = new Set(claims.flatMap((row) => row.source_ids));
  assert(sourcesDoc.sources.every((row) => usedSourceIds.has(row.id)), 'Alle 29 briefkilder må brukes av minst én sluttclaim');
  assert(paragraphClaimIds.every((id) => topicByClaimId.has(id)), 'Et avsnitt peker til ukjent claimplan');

  const emneById = new Map(emners.map((row) => [row.emne_id, row]));
  const methodIds = [...new Set(chapter.emne_ids.flatMap((id) => emneById.get(id)?.method_ids || []))];
  assert(methodIds.length > 0, 'Kapitlet mangler canonicale metoder');
  chapter.method_ids = methodIds;
  chapter.workCases = casesDoc.cases.map((row) => ({
    id: row.id, title: row.work, year: row.years, medium: row.medium, role: row.purpose, source_ids: row.source_ids
  }));
  chapterBrief.requiredMethodIds = methodIds;

  const claimsDoc = {
    schema: 'history_go_fagverk_chapter_claims_v1', version: '1.0.0', subject_id: 'film_tv', chapter_id: CHAPTER_ID,
    sourceBriefFile: P.sourceBrief,
    sources: sourcesDoc.sources.map((row) => ({ ...row, label: `${row.publisher} – ${row.title}` })),
    claims
  };

  registry.version = maxDottedVersion(registry.version, '2.91.0');
  registry.updatedAt = maxIsoDate(registry.updatedAt, '2026-08-13');
  const registryChapter = {
    id: CHAPTER_ID, title: chapter.title, subtitle: chapter.subtitle, file: P.chapter,
    primary_domain_id: chapter.primary_domain_id, emne_ids: chapter.emne_ids, claimsFile: P.claims, briefFile: P.brief
  };
  const chapters = registry.subjects.film_tv.chapters;
  const index = chapters.findIndex((row) => row.id === CHAPTER_ID);
  if (index === -1) chapters.push(registryChapter); else chapters[index] = registryChapter;
  registry.subjects.film_tv.canonicalModel.note = 'Film & TVs variable canon har 192 emner. Skapende arbeid, teknologi og ansvar er registrert etter fulltekst-, claim- og evidensport med 11 canonicale emner, 4 moduler, 11 emneeide seksjoner, 48 claimsporede fagavsnitt, 48/48 verifiserte claims, 29 brukte inspectable kilder og 23 case. Teknisk kapasitet holdes adskilt fra kvalitet, kostnad, arbeid, klima og effekt; samtykke, HMS, tilgjengelighet og KI har egne evidensgrenser. Neste port er kilde- og claimbrief for Industri, regulering og distribusjon.';
  registry.subjects.film_tv.canonicalModel.ninthSourceClaimBrief = P.sourceBrief;

  status.version = maxDottedVersion(status.version, '1.84.0');
  status.updatedAt = maxIsoDate(status.updatedAt, '2026-08-13');
  const filmStatus = status.subjects.find((row) => row.id === 'film_tv');
  assert(filmStatus, 'Mangler Film & TV-status');
  filmStatus.editorialStatus = 'chapters_in_progress';
  filmStatus.nextGate = OUTPUT_GATE;
  filmStatus.note = 'Skapende arbeid, teknologi og ansvar er registrert etter fulltekst- og evidensaudit: 11/11 canonicale emner, 4 moduler, 11 seksjoner, 48 claimsporede fagavsnitt, 48/48 løste claimplaner, 29 brukte inspectable kilder og 23 case. Teknisk kapasitet, arbeidsvilkår, samtykke, HMS, tilgjengelighet, klima og KI-effekt holdes i separate evidensspor. Neste port er kilde- og claimbrief for Industri, regulering og distribusjon.';

  return { sourceBrief, sourcesDoc, casesDoc, topicClaims, chapter, chapterBrief, claimsDoc, registry, status, modules, unit };
}

export function materializeFilmTvCreativeWorkTechnologyResponsibilityFulltextV1({ force = false } = {}) {
  const currentGate = read(P.status).subjects.find((row) => row.id === 'film_tv')?.nextGate;
  assert([INPUT_GATE, OUTPUT_GATE].includes(currentGate), `Uventet Film & TV-port: ${currentGate}`);
  if (currentGate === OUTPUT_GATE && !force) {
    console.log('Enhet 9 er allerede materialisert; bevarer neste kildebriefport.');
    return null;
  }
  const built = buildFilmTvCreativeWorkTechnologyResponsibilityFulltextV1();
  write(P.chapter, built.chapter);
  write(P.brief, built.chapterBrief);
  write(P.claims, built.claimsDoc);
  write(P.registry, built.registry);
  write(P.status, built.status);
  console.log('Materialiserte Film & TV/enhet 9: 11 emner, 4 moduler, 11 seksjoner, 48 claims, 29 kilder og 23 case.');
  return built;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = new Set(process.argv.slice(2));
  try { materializeFilmTvCreativeWorkTechnologyResponsibilityFulltextV1({ force: args.has('--write') }); }
  catch (error) { console.error(`Film & TV enhet 9 fulltekst FEIL: ${error.message}`); process.exitCode = 1; }
}
