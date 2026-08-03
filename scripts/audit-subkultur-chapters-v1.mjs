#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const REPORT = 'reports/fagverk/subkultur-chapters-audit.json';
const PATHS = Object.freeze({
  chapterManifest: 'data/fagverk/subkultur/manifest.json',
  profileManifest: 'data/fag/profiles/subkultur/manifest.json',
  pensum: 'data/fag/subkultur/subkulturpensum_canonical_v4_5.json',
  emner: 'data/fag/subkultur/emner_subkultur_canonical_v4_5.json',
  methods: 'data/fag/subkultur/methods_subkultur_canonical_v4_5.json',
  claims: 'data/fag/subkultur/claims_subkultur_canonical_v1.json',
  sources: 'data/fag/subkultur/sources_subkultur_canonical_v1.json',
  evidence: 'data/fag/subkultur/theory_evidence_subkultur_canonical_v1.json',
  placeManifest: 'data/places/manifest.json',
  status: 'data/fagverk/subject_status.json'
});

const abs = (relative) => path.join(ROOT, relative);
const readJson = (relative) => JSON.parse(fs.readFileSync(abs(relative), 'utf8'));
const list = (value) => Array.isArray(value) ? value : [];
const text = (value) => String(value ?? '').trim();
const exists = (relative) => fs.existsSync(abs(relative));
const assert = (condition, message) => { if (!condition) throw new Error(message); };

function duplicates(values) {
  const counts = new Map();
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
  return [...counts].filter(([, count]) => count > 1).map(([value]) => value).sort();
}

function flattenRecords(value) {
  if (Array.isArray(value)) return value.flatMap(flattenRecords);
  if (!value || typeof value !== 'object') return [];
  if (text(value.id)) return [value];
  return Object.values(value).flatMap(flattenRecords);
}

function activePlaceIds() {
  const ids = new Set();
  for (const entry of list(readJson(PATHS.placeManifest).files)) {
    const relative = text(entry).startsWith('data/') ? text(entry) : `data/${text(entry)}`;
    if (!exists(relative)) continue;
    for (const record of flattenRecords(readJson(relative))) ids.add(record.id);
  }
  return ids;
}

function auditChapter(row, registries) {
  assert(exists(row.file), `Kapittelfil mangler: ${row.file}`);
  assert(exists(row.brief), `Kapittelbrief mangler: ${row.brief}`);
  const chapter = readJson(row.file);
  const brief = readJson(row.brief);
  assert(chapter.schema === 'history_go_fagverk_chapter_v1', `${row.id} har feil kapittelschema`);
  assert(chapter.subject === 'subkultur' && chapter.id === row.id, `${row.id} har feil identitet`);
  assert(text(chapter.title) && text(chapter.subtitle) && text(chapter.lead), `${row.id} mangler redaksjonell inngang`);
  assert(list(chapter.learningObjectives).length >= 5, `${row.id} har for få læringsmål`);
  assert(list(chapter.diagnosticQuestions).length >= 3, `${row.id} har for få diagnostiske spørsmål`);
  assert(list(chapter.moduleFiles).length === 3, `${row.id} må ha tre moduler`);
  assert(brief.schema === 'history_go_fagverk_chapter_brief_v1', `${row.id} har feil briefschema`);
  assert(brief.subject === 'subkultur' && brief.chapterId === row.id, `${row.id} har feil briefidentitet`);
  assert(brief.primaryDomainId === row.primary_domain_id, `${row.id} har feil primærdomene`);
  assert(isDeepStrictEqual([...brief.requiredEmneIds].sort(), [...row.emne_ids].sort()), `${row.id} har usynkron emnedekning`);
  for (const id of brief.requiredEmneIds) assert(registries.emneIds.has(id), `${row.id} peker til ukjent emne ${id}`);
  for (const id of brief.requiredMethodIds) assert(registries.methodIds.has(id), `${row.id} peker til ukjent metode ${id}`);
  for (const id of brief.requiredTheoryEvidenceIds) assert(registries.evidenceIds.has(id), `${row.id} peker til ukjent theory-evidence ${id}`);
  for (const id of brief.requiredClaimIds) assert(registries.claimIds.has(id), `${row.id} peker til ukjent claim ${id}`);
  assert(brief.caseProfileStatus === 'candidate_links_pending_place_people_audit', `${row.id} forskutterer casevalidering`);

  let sectionCount = 0;
  let paragraphCount = 0;
  let claimReferenceCount = 0;
  let sourceReferenceCount = 0;
  let workedExamples = 0;
  let misconceptions = 0;
  let tasks = 0;
  let selfChecks = 0;
  let placeReferences = 0;
  const usedClaims = new Set();
  const usedTheories = new Set();
  const usedPlaces = new Set();

  for (const relative of chapter.moduleFiles) {
    assert(exists(relative), `Modul mangler: ${relative}`);
    const module = readJson(relative);
    assert(module.schema === 'history_go_fagverk_module_v1' && module.subject === 'subkultur', `${relative} har feil modulkontrakt`);
    assert(module.chapterId === row.id, `${relative} peker til feil kapittel`);
    const sections = list(module.sections);
    assert(sections.length === 3, `${relative} må ha tre seksjoner`);
    sectionCount += sections.length;
    for (const section of sections) {
      assert(list(section.paragraphs).length === 3, `${section.id} må ha tre avsnitt`);
      assert(list(section.paragraphClaimIds).length === section.paragraphs.length, `${section.id} mangler avsnittssporing`);
      paragraphCount += section.paragraphs.length;
      for (const paragraphClaimIds of section.paragraphClaimIds) {
        assert(list(paragraphClaimIds).length >= 1, `${section.id} har avsnitt uten claim`);
        claimReferenceCount += paragraphClaimIds.length;
        for (const claimId of paragraphClaimIds) {
          assert(registries.claimIds.has(claimId), `${section.id} peker til ukjent claim ${claimId}`);
          usedClaims.add(claimId);
        }
      }
    }
    for (const claimId of list(module.claimIds)) assert(registries.claimIds.has(claimId), `${relative} peker til ukjent claim ${claimId}`);
    for (const id of list(module.theoryEvidenceIds)) {
      assert(registries.evidenceIds.has(id), `${relative} peker til ukjent theory-evidence ${id}`);
      usedTheories.add(id);
    }
    for (const source of list(module.sources)) {
      assert(registries.sourceIds.has(source.id), `${relative} peker til ukjent kilde ${source.id}`);
      assert(/^https:\/\//.test(text(source.url)), `${relative} har ikke-inspectable kilde ${source.id}`);
      sourceReferenceCount += 1;
    }
    for (const example of list(module.workedExamples)) assert(text(example.title) && text(example.situation) && list(example.analysis).length >= 2, `${relative} har ugyldig arbeidseksempel`);
    for (const misconception of list(module.commonMisconceptions)) assert(text(misconception.claim) && text(misconception.correction), `${relative} har ugyldig misoppfatning`);
    for (const task of list(module.applicationTasks)) assert(text(task.task) && list(task.prompts).length >= 3, `${relative} har ugyldig oppgave`);
    for (const item of list(module.selfCheck)) assert(text(item.question) && text(item.answer), `${relative} har ugyldig selvtest`);
    for (const place of list(module.relatedPlaces)) {
      assert(registries.placeIds.has(place.id), `${relative} peker til ukjent sted ${place.id}`);
      assert(place.evidenceStatus === 'canonical_place_candidate_pending_profile_audit', `${relative} forskutterer stedsevidens`);
      usedPlaces.add(place.id);
      placeReferences += 1;
    }
    workedExamples += list(module.workedExamples).length;
    misconceptions += list(module.commonMisconceptions).length;
    tasks += list(module.applicationTasks).length;
    selfChecks += list(module.selfCheck).length;
  }

  const req = brief.editorialRequirements;
  assert(sectionCount === req.sectionCount, `${row.id} har ${sectionCount}/${req.sectionCount} seksjoner`);
  assert(paragraphCount === req.paragraphCount, `${row.id} har ${paragraphCount}/${req.paragraphCount} avsnitt`);
  assert(claimReferenceCount >= req.minimumClaimReferences, `${row.id} har for få claimreferanser`);
  assert(sourceReferenceCount >= req.minimumSourceReferences, `${row.id} har for få kildereferanser`);
  assert(workedExamples >= req.minimumWorkedExamples, `${row.id} har for få arbeidseksempler`);
  assert(misconceptions >= req.minimumMisconceptions, `${row.id} har for få misoppfatninger`);
  assert(tasks >= req.minimumApplicationTasks, `${row.id} har for få anvendelsesoppgaver`);
  assert(selfChecks >= req.minimumSelfChecks, `${row.id} har for få kontrollspørsmål`);
  assert(placeReferences >= req.minimumRelatedPlaces, `${row.id} har for få stedskoblinger`);
  assert(isDeepStrictEqual([...usedClaims].sort(), [...brief.requiredClaimIds].sort()), `${row.id} dekker ikke briefens claims eksakt`);
  assert(isDeepStrictEqual([...usedTheories].sort(), [...brief.requiredTheoryEvidenceIds].sort()), `${row.id} dekker ikke briefens teoriobjekter eksakt`);
  assert(usedPlaces.size === 6, `${row.id} må ha seks unike stedskoblinger`);
  return { id: row.id, domain_id: row.primary_domain_id, sections: sectionCount, paragraphs: paragraphCount, claim_references: claimReferenceCount, unique_claims: usedClaims.size, source_references: sourceReferenceCount, worked_examples: workedExamples, misconceptions, tasks, self_checks: selfChecks, place_references: placeReferences, unique_places: usedPlaces.size };
}

export function buildChaptersReport() {
  const manifest = readJson(PATHS.chapterManifest);
  const profileManifest = readJson(PATHS.profileManifest);
  const pensum = readJson(PATHS.pensum);
  const placeIds = activePlaceIds();
  const registries = {
    emneIds: new Set(list(readJson(PATHS.emner)).map((entry) => entry.emne_id)),
    methodIds: new Set(list(readJson(PATHS.methods).methods).map((entry) => entry.method_id)),
    claimIds: new Set(list(readJson(PATHS.claims).claims).map((entry) => entry.claim_id)),
    sourceIds: new Set(list(readJson(PATHS.sources).sources).map((entry) => entry.source_id)),
    evidenceIds: new Set(list(readJson(PATHS.evidence).entries).map((entry) => entry.theory_id)),
    placeIds
  };
  const rows = list(manifest.chapters);
  const chapters = rows.map((row) => auditChapter(row, registries));
  const profileRows = list(profileManifest.profiles);
  const profiles = profileRows.map((row) => {
    assert(exists(row.file), `Profilfil mangler: ${row.file}`);
    const profile = readJson(row.file);
    assert(profile.status === 'candidate_profile_pending_evidence_audit', `${row.id} forskutterer validert profil`);
    assert(profile.production_coverage?.validated_cases === 0, `${row.id} forskutterer validerte cases`);
    for (const candidate of list(profile.candidates)) {
      assert(placeIds.has(candidate.place_id), `${row.id} peker til ukjent sted ${candidate.place_id}`);
      assert(candidate.status === 'candidate_unvalidated', `${candidate.case_id} forskutterer casevalidering`);
      assert(list(candidate.required_case_requirement_ids).length === 5, `${candidate.case_id} mangler casekrav`);
      assert(list(candidate.missing_before_validation).length === 5, `${candidate.case_id} skjuler produksjonsgap`);
    }
    return { id: row.id, candidates: list(profile.candidates).length, validated: profile.production_coverage.validated_cases, candidate_ids: list(profile.candidates).map((entry) => entry.case_id) };
  });
  const status = list(readJson(PATHS.status).subjects).find((entry) => entry.id === 'subkultur');
  return {
    schema: 'history_go_subkultur_chapters_audit_v1', version: '1.0.0', subject_id: 'subkultur', audited_at: '2026-08-04', status: 'CHAPTERS_READY_CASE_EVIDENCE_PENDING',
    totals: {
      chapters: chapters.length,
      modules: chapters.length * 3,
      sections: chapters.reduce((sum, row) => sum + row.sections, 0),
      paragraphs: chapters.reduce((sum, row) => sum + row.paragraphs, 0),
      claim_references: chapters.reduce((sum, row) => sum + row.claim_references, 0),
      unique_claim_bindings: chapters.reduce((sum, row) => sum + row.unique_claims, 0),
      source_references: chapters.reduce((sum, row) => sum + row.source_references, 0),
      worked_examples: chapters.reduce((sum, row) => sum + row.worked_examples, 0),
      misconceptions: chapters.reduce((sum, row) => sum + row.misconceptions, 0),
      application_tasks: chapters.reduce((sum, row) => sum + row.tasks, 0),
      self_checks: chapters.reduce((sum, row) => sum + row.self_checks, 0),
      place_references: chapters.reduce((sum, row) => sum + row.place_references, 0),
      profile_candidates: profiles.reduce((sum, row) => sum + row.candidates, 0),
      validated_profile_cases: profiles.reduce((sum, row) => sum + row.validated, 0)
    },
    chapters,
    profiles: profiles.map(({ candidate_ids, ...row }) => row),
    integrity: {
      duplicate_chapter_ids: duplicates(rows.map((row) => row.id)),
      duplicate_chapter_domains: duplicates(rows.map((row) => row.primary_domain_id)),
      domain_order_matches_pensum: isDeepStrictEqual(rows.map((row) => row.primary_domain_id), list(pensum.domain_order)),
      duplicate_profile_case_ids: duplicates(profiles.flatMap((row) => row.candidate_ids))
    },
    status_guard: {
      navigation_status: status?.navigationStatus ?? null,
      assessment_status: status?.assessmentStatus ?? null,
      editorial_status: status?.editorialStatus ?? null,
      next_gate: status?.nextGate ?? null
    },
    next_gate: 'case_profiles_places_people_audit'
  };
}

export function auditChapters({ writeReport = false, checkReport = true } = {}) {
  const report = buildChaptersReport();
  assert(report.totals.chapters === 8 && report.totals.modules === 24, 'Kapittellaget må ha 8 kapitler og 24 moduler');
  assert(report.totals.sections === 72 && report.totals.paragraphs === 216, 'Kapittellaget må ha 72 seksjoner og 216 avsnitt');
  assert(report.totals.claim_references >= 288 && report.totals.unique_claim_bindings === 160, 'Kapittellaget mangler claimdekning');
  assert(report.totals.source_references >= 160, 'Kapittellaget mangler kildereferanser');
  assert(report.totals.worked_examples >= 16, 'Kapittellaget mangler arbeidseksempler');
  assert(report.totals.misconceptions >= 40, 'Kapittellaget mangler misoppfatningskontroll');
  assert(report.totals.application_tasks >= 24, 'Kapittellaget mangler anvendelsesoppgaver');
  assert(report.totals.self_checks >= 64, 'Kapittellaget mangler selvtest');
  assert(report.totals.place_references === 48, 'Kapittellaget må ha 48 stedskoblinger');
  assert(report.totals.profile_candidates >= 40, 'Profilene må ha et bredt kandidatgrunnlag');
  assert(report.totals.validated_profile_cases === 0, 'Denne porten skal ikke forskuttere validerte cases');
  assert(report.integrity.duplicate_chapter_ids.length === 0, 'Kapittel-ID-er må være unike');
  assert(report.integrity.duplicate_chapter_domains.length === 0, 'Hvert domene skal ha ett kapittel');
  assert(report.integrity.domain_order_matches_pensum, 'Kapittelrekkefølgen avviker fra pensum');
  assert(report.integrity.duplicate_profile_case_ids.length === 0, 'Samme case-ID finnes i flere profiler');
  assert(report.status_guard.navigation_status === 'planned', 'Navigasjon må forbli planned før runtime');
  assert(report.status_guard.assessment_status === 'pending', 'Assessment må forbli pending før quiz-audit');
  assert(report.status_guard.editorial_status === 'not_started', 'Planned fag må beholde not_started før runtime-materialisering');
  assert(report.status_guard.next_gate === 'case_profiles_places_people_audit', 'Neste port må være case-/dataaudit');
  if (writeReport) {
    fs.mkdirSync(path.dirname(abs(REPORT)), { recursive: true });
    fs.writeFileSync(abs(REPORT), `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  }
  if (checkReport) {
    assert(exists(REPORT), `${REPORT} mangler. Kjør --write-report`);
    assert(isDeepStrictEqual(readJson(REPORT), report), `${REPORT} er utdatert. Kjør --write-report`);
  }
  return report;
}

function main() {
  const args = new Set(process.argv.slice(2));
  try {
    const report = auditChapters({ writeReport: args.has('--write-report'), checkReport: !args.has('--no-check-report') });
    console.log(`Subkultur chapters OK: ${report.totals.chapters} kapitler, ${report.totals.sections} seksjoner, ${report.totals.paragraphs} avsnitt; profiles pending.`);
  } catch (error) {
    console.error(`Subkultur chapters FEIL: ${error.message}`);
    process.exitCode = 1;
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
