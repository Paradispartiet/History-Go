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
  caseEvidence: 'data/fag/subkultur/case_evidence_subkultur_canonical_v1.json',
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
  assert(brief.caseProfileStatus === 'case_links_partial_source_validation', `${row.id} har feil caseprofilstatus`);

  let sectionCount = 0;
  let paragraphCount = 0;
  let claimReferenceCount = 0;
  let sourceReferenceCount = 0;
  let workedExamples = 0;
  let misconceptions = 0;
  let tasks = 0;
  let selfChecks = 0;
  let placeReferences = 0;
  let validatedPlaceReferences = 0;
  let rejectedPlaceReferences = 0;
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
      const validated = registries.caseEvidenceByPlace.get(place.id);
      const rejected = registries.rejectedCaseByPlace.get(place.id);
      if (validated) {
        assert(place.evidenceStatus === 'validated_case' && place.caseEvidenceId === validated.evidence_id, `${relative} materialiserer ikke validert case ${place.id}`);
        validatedPlaceReferences += 1;
      } else if (rejected) {
        assert(place.evidenceStatus === 'rejected_nonqualifying', `${relative} skjuler negativt case ${place.id}`);
        assert(place.rejectionReason === rejected.reason && place.classificationDecisionSource === rejected.decision_source, `${relative} har usporbar avvisning for ${place.id}`);
        rejectedPlaceReferences += 1;
      } else {
        assert(place.evidenceStatus === 'canonical_place_candidate_pending_profile_audit', `${relative} forskutterer stedsevidens for ${place.id}`);
      }
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
  return { id: row.id, domain_id: row.primary_domain_id, sections: sectionCount, paragraphs: paragraphCount, claim_references: claimReferenceCount, unique_claims: usedClaims.size, source_references: sourceReferenceCount, worked_examples: workedExamples, misconceptions, tasks, self_checks: selfChecks, place_references: placeReferences, validated_place_references: validatedPlaceReferences, rejected_place_references: rejectedPlaceReferences, unique_places: usedPlaces.size };
}

export function buildChaptersReport() {
  const manifest = readJson(PATHS.chapterManifest);
  const profileManifest = readJson(PATHS.profileManifest);
  const pensum = readJson(PATHS.pensum);
  const placeIds = activePlaceIds();
  const caseRegistry = readJson(PATHS.caseEvidence);
  const caseEvidence = list(caseRegistry.cases);
  const rejectedCases = list(caseRegistry.nonqualifying_cases);
  const caseEvidenceByPlace = new Map(caseEvidence.map((entry) => [entry.place_id, entry]));
  const rejectedCaseByPlace = new Map(rejectedCases.map((entry) => [entry.place_id, entry]));
  const registries = {
    emneIds: new Set(list(readJson(PATHS.emner)).map((entry) => entry.emne_id)),
    methodIds: new Set(list(readJson(PATHS.methods).methods).map((entry) => entry.method_id)),
    claimIds: new Set(list(readJson(PATHS.claims).claims).map((entry) => entry.claim_id)),
    sourceIds: new Set(list(readJson(PATHS.sources).sources).map((entry) => entry.source_id)),
    evidenceIds: new Set(list(readJson(PATHS.evidence).entries).map((entry) => entry.theory_id)),
    placeIds,
    caseEvidenceByPlace,
    rejectedCaseByPlace
  };
  const rows = list(manifest.chapters);
  const chapters = rows.map((row) => auditChapter(row, registries));
  const profileRows = list(profileManifest.profiles);
  const profiles = profileRows.map((row) => {
    assert(exists(row.file), `Profilfil mangler: ${row.file}`);
    const profile = readJson(row.file);
    const profileValidated = list(profile.candidates).filter((candidate) => candidate.status === 'validated_case');
    const profileRejected = list(profile.candidates).filter((candidate) => candidate.status === 'rejected_nonqualifying');
    const expectedValidated = caseEvidence.filter((entry) => entry.profile_id === row.id);
    const expectedRejected = rejectedCases.filter((entry) => entry.profile_id === row.id);
    assert(profile.production_coverage?.validated_cases === expectedValidated.length, `${row.id} har feil antall validerte cases`);
    assert(profile.production_coverage?.rejected_candidates === expectedRejected.length, `${row.id} har feil antall avviste cases`);
    assert(profile.production_coverage?.remaining_candidates === list(profile.candidates).length - expectedValidated.length - expectedRejected.length, `${row.id} har feil antall gjenstående cases`);
    assert(profile.status === (profile.production_coverage.remaining_candidates === 0 ? 'profile_case_validation_complete' : expectedValidated.length ? 'profile_partial_case_validation' : 'candidate_profile_pending_evidence_audit'), `${row.id} har feil profilstatus`);
    for (const candidate of list(profile.candidates)) {
      assert(placeIds.has(candidate.place_id), `${row.id} peker til ukjent sted ${candidate.place_id}`);
      const validated = caseEvidenceByPlace.get(candidate.place_id);
      const rejected = rejectedCaseByPlace.get(candidate.place_id);
      if (validated) {
        assert(list(candidate.required_case_requirement_ids).length === 5, `${candidate.case_id} mangler casekrav`);
        assert(candidate.status === 'validated_case', `${candidate.case_id} skjuler validert case`);
        assert(candidate.evidence_id === validated.evidence_id, `${candidate.case_id} peker til feil evidens`);
        assert(list(candidate.source_ids).length >= 2, `${candidate.case_id} mangler casekilder`);
        assert(list(candidate.missing_before_validation).length === 0, `${candidate.case_id} har uløste gap etter validering`);
        assert(candidate.ethics_review_status === 'PASS' && candidate.independent_control_status === 'PASS', `${candidate.case_id} mangler etikk eller kontrollkilde`);
      } else if (rejected) {
        assert(candidate.status === 'rejected_nonqualifying', `${candidate.case_id} skjuler negativt case`);
        assert(candidate.resulting_category === rejected.resulting_category && candidate.rejection_reason === rejected.reason, `${candidate.case_id} har usynkron avvisning`);
        assert(candidate.decision_source === rejected.decision_source, `${candidate.case_id} mangler beslutningskilde`);
        assert(list(candidate.required_case_requirement_ids).length === 0 && list(candidate.missing_before_validation).length === 0, `${candidate.case_id} teller avvisning som evidensgap`);
      } else {
        assert(list(candidate.required_case_requirement_ids).length === 5, `${candidate.case_id} mangler casekrav`);
        assert(candidate.status === 'candidate_unvalidated', `${candidate.case_id} forskutterer casevalidering`);
        assert(list(candidate.missing_before_validation).length === 5, `${candidate.case_id} skjuler produksjonsgap`);
      }
    }
    assert(profileValidated.length === expectedValidated.length, `${row.id} er ute av synk med caseevidensregisteret`);
    assert(profileRejected.length === expectedRejected.length, `${row.id} er ute av synk med negativt caseregister`);
    return { id: row.id, candidates: list(profile.candidates).length, validated: profile.production_coverage.validated_cases, rejected: profile.production_coverage.rejected_candidates, pending: profile.production_coverage.remaining_candidates, candidate_ids: list(profile.candidates).map((entry) => entry.case_id) };
  });
  const status = list(readJson(PATHS.status).subjects).find((entry) => entry.id === 'subkultur');
  return {
    schema: 'history_go_subkultur_chapters_audit_v1', version: '1.0.0', subject_id: 'subkultur', audited_at: '2026-08-04', status: 'CHAPTERS_READY_CASE_EVIDENCE_PARTIAL',
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
      validated_place_references: chapters.reduce((sum, row) => sum + row.validated_place_references, 0),
      rejected_place_references: chapters.reduce((sum, row) => sum + row.rejected_place_references, 0),
      profile_candidates: profiles.reduce((sum, row) => sum + row.candidates, 0),
      validated_profile_cases: profiles.reduce((sum, row) => sum + row.validated, 0),
      rejected_profile_cases: profiles.reduce((sum, row) => sum + row.rejected, 0),
      pending_profile_cases: profiles.reduce((sum, row) => sum + row.pending, 0)
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
    next_gate: 'remaining_case_source_validation'
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
  assert(report.totals.validated_profile_cases >= 19, 'Kapittelporten må materialisere den andre validerte casebatchen');
  assert(report.totals.rejected_profile_cases === 2, 'Kapittelporten må bevare to avviste grensecases');
  assert(report.totals.pending_profile_cases === 29, 'Kapittelporten skal dokumentere 29 gjenstående kandidater');
  assert(report.totals.validated_place_references >= 10, 'Validerte kapittelsteder mangler i modulene');
  assert(report.integrity.duplicate_chapter_ids.length === 0, 'Kapittel-ID-er må være unike');
  assert(report.integrity.duplicate_chapter_domains.length === 0, 'Hvert domene skal ha ett kapittel');
  assert(report.integrity.domain_order_matches_pensum, 'Kapittelrekkefølgen avviker fra pensum');
  assert(report.integrity.duplicate_profile_case_ids.length === 0, 'Samme case-ID finnes i flere profiler');
  assert(report.status_guard.navigation_status === 'planned', 'Navigasjon må forbli planned før runtime');
  assert(report.status_guard.assessment_status === 'pending', 'Assessment må forbli pending før quiz-audit');
  assert(report.status_guard.editorial_status === 'not_started', 'Planned fag må beholde not_started før runtime-materialisering');
  assert(report.status_guard.next_gate === 'remaining_case_source_validation', 'Neste port må være gjenstående casekildevalidering');
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
    console.log(`Subkultur chapters OK: ${report.totals.chapters} kapitler, ${report.totals.sections} seksjoner, ${report.totals.paragraphs} avsnitt; ${report.totals.validated_profile_cases} cases validert.`);
  } catch (error) {
    console.error(`Subkultur chapters FEIL: ${error.message}`);
    process.exitCode = 1;
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
