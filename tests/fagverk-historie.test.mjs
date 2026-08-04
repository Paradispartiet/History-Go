import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { assertHistoryRendererContract, auditHistorySubject } from '../scripts/audit-fagverk-historie.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const readJson = (relativePath) => JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), 'utf8'));

test('Historie er materialisert og redaksjonelt komplett', () => {
  const { report } = auditHistorySubject();
  assert.equal(report.subject.id, 'historie');
  assert.equal(report.subject.adapter, 'standard');
  assert.equal(report.subject.assessmentStatus, 'audited');
  assert.equal(report.subject.editorialStatus, 'complete');
  assert.deepEqual(report.summary, {
    domainCount: 23,
    emneCount: 230,
    conceptCount: 976,
    methodCount: 105,
    mappingCount: 230,
    hookCount: 230,
    chapterCount: 23,
    chapterDomainCount: 23,
    remainingChapterDomains: 0,
    placeCount: 0,
    curriculumPeriods: 9,
    curriculumPeriodGuides: 9,
    curriculumCoveredPeriods: 6,
    curriculumPartialPeriods: 2,
    curriculumMissingPeriods: 1,
    curriculumThematicFields: 14,
    curriculumMethodModules: 6,
    curriculumGeographicPaths: 6
  });
});

test('alle 23 Historie-kapitlene oppfyller kapittel- og evidensporten', () => {
  const { report } = auditHistorySubject();
  assert.equal(report.chapters.length, 23);
  assert.equal(new Set(report.chapters.map((chapter) => chapter.domainId)).size, 23);
  for (const chapter of report.chapters) {
    assert.ok(chapter.sectionCount >= 8, chapter.id);
    assert.ok(chapter.workedExampleCount >= 2, chapter.id);
    assert.ok(chapter.misconceptionCount >= 4, chapter.id);
    assert.ok(chapter.taskCount >= 3, chapter.id);
    assert.ok(chapter.selfCheckCount >= 5, chapter.id);
    assert.ok(chapter.sourceCount >= 4, chapter.id);
    assert.ok(chapter.claimReferenceCount > 0, chapter.id);
    assert.ok(chapter.theoryEvidenceReferenceCount > 0, chapter.id);
  }
  assert.equal(report.chapters.filter((chapter) => chapter.productionBriefValidated).length, 20);
  assert.equal(report.gates.registeredChaptersValidated, true);
  assert.equal(report.gates.chapterEvidenceReferencesResolved, true);
  assert.equal(report.gates.productionBriefAndParagraphTraceValidated, true);
  assert.equal(report.gates.historyPlaceFallbackResolved, true);
});

test('kapittelproduksjon rapporterer full universell evidensdekning', () => {
  const { report } = auditHistorySubject();
  assert.equal(report.universalCoverage.status, 'COMPLETE');
  assert.equal(report.universalCoverage.coveredCells, 58);
  assert.equal(report.universalCoverage.totalCells, 58);
  assert.equal(report.universalCoverage.productionGaps, 0);
  assert.equal(report.universalCoverage.theoryEvidenceQualifying, 230);
  assert.equal(report.universalCoverage.theoryEvidenceTotal, 230);
  assert.equal(report.gates.honestCompletionBoundary, true);
});

test('teori-evidensregisteret bevarer alle stedskoblinger for fler-steds-claims', () => {
  const theoryEvidence = readJson('data/fag/historie/theory_evidence_historie_canonical_v1.json');
  const placeEvidence = readJson('data/fag/historie/place_evidence_historie_v1.json');
  const linksByClaim = new Map();

  for (const link of placeEvidence.evidence_links) {
    const links = linksByClaim.get(link.claim_id) || [];
    links.push(link.evidence_id);
    linksByClaim.set(link.claim_id, links);
  }

  for (const entry of theoryEvidence.entries) {
    const expected = [...new Set(entry.claim_ids.flatMap((claimId) => linksByClaim.get(claimId) || []))].sort();
    assert.deepEqual([...entry.evidence_link_ids].sort(), expected, entry.theory_id);
  }
});

test('vitenskapsteorier har minst to cases koblet til teoriens eget emne', () => {
  const theoryObjects = readJson('data/fag/historie/theory_objects_historie_canonical_v5_5.json');
  const theoryEvidence = readJson('data/fag/historie/theory_evidence_historie_canonical_v1.json');
  const claims = readJson('data/fag/historie/claims_historie_canonical_v1.json');
  const theoriesById = new Map(theoryObjects.map((theory) => [theory.theory_id, theory]));
  const claimsById = new Map(claims.claims.map((claim) => [claim.claim_id, claim]));

  for (const entry of theoryEvidence.entries) {
    const theory = theoriesById.get(entry.theory_id);
    if (!theory?.explanatory_scope?.includes('his_vitenskap_teknologi_kunnskap')) continue;

    const targetEmneId = `em_${theory.source_hook_id}`;
    const topicSpecificCases = new Set(entry.claim_ids
      .map((claimId) => claimsById.get(claimId))
      .filter((claim) => claim?.emne_ids?.includes(targetEmneId))
      .flatMap((claim) => claim.scope?.case_ids || []));

    assert.ok(
      topicSpecificCases.size >= 2,
      `${entry.theory_id} trenger minst to cases koblet til ${targetEmneId}`
    );
  }
});

test('Børsen og Tollboden har reell kildesammenligning på tvers av kildetyper', () => {
  const profile = readJson('data/fag/profiles/historie/oslo_akershus/profile.json');
  const placeEvidence = readJson('data/fag/historie/place_evidence_historie_v1.json');
  const sourceRegistry = readJson('data/fag/historie/sources_historie_canonical_v1.json');
  const sourcesById = new Map(sourceRegistry.sources.map((source) => [source.source_id, source]));
  const sourceFamilyByType = new Map([
    ['editorially_reviewed_encyclopedia', 'secondary_reference_work'],
    ['local_history_reference_work', 'secondary_reference_work'],
    ['government_administrative_database', 'government_administrative_record'],
    ['official_heritage_management_plan', 'government_heritage_record']
  ]);

  for (const caseId of ['case_his_borsen', 'case_his_tollboden']) {
    const profileCase = profile.cases.find((item) => item.case_id === caseId);
    assert.ok(profileCase, caseId);
    assert.ok(profileCase.case_requirement_ids.includes('case_req_his_source_comparison'), caseId);

    const sourceIds = [...new Set(placeEvidence.evidence_links
      .filter((link) => link.case_id === caseId)
      .flatMap((link) => link.source_ids || []))];
    const sourceFamilies = [...new Set(sourceIds.map((sourceId) => (
      sourceFamilyByType.get(sourcesById.get(sourceId)?.source_type)
    )))];

    assert.ok(sourceIds.length >= 2, `${caseId} trenger minst to selvstendige kilder`);
    assert.ok(sourceFamilies.every(Boolean), `${caseId} har kilde uten normalisert kildefamilie`);
    assert.ok(sourceFamilies.length >= 2, `${caseId} trenger minst to normaliserte kildefamilier`);
  }
});

test('Domkirken og Trefoldighetskirken har uavhengige kildefamilier', () => {
  const profile = readJson('data/fag/profiles/historie/oslo_akershus/profile.json');
  const placeEvidence = readJson('data/fag/historie/place_evidence_historie_v1.json');
  const sourceRegistry = readJson('data/fag/historie/sources_historie_canonical_v1.json');
  const sourcesById = new Map(sourceRegistry.sources.map((source) => [source.source_id, source]));
  const sourceFamilyByType = new Map([
    ['official_church_heritage_page', 'institutional_church_record'],
    ['official_church_consultation_report', 'institutional_church_record'],
    ['local_history_reference_work', 'secondary_reference_work']
  ]);

  for (const caseId of ['case_his_oslo_domkirke', 'case_his_trefoldighetskirken']) {
    const profileCase = profile.cases.find((item) => item.case_id === caseId);
    assert.equal(profileCase?.evidence_status, 'claim_source_linked', caseId);
    assert.ok(profileCase.case_requirement_ids.includes('case_req_his_source_comparison'), caseId);

    const sourceIds = [...new Set(placeEvidence.evidence_links
      .filter((link) => link.case_id === caseId)
      .flatMap((link) => link.source_ids || []))];
    const sourceFamilies = [...new Set(sourceIds.map((sourceId) => (
      sourceFamilyByType.get(sourcesById.get(sourceId)?.source_type)
    )))];

    assert.ok(sourceIds.length >= 2, `${caseId} trenger minst to selvstendige kilder`);
    assert.ok(sourceFamilies.every(Boolean), `${caseId} har kilde uten normalisert kildefamilie`);
    assert.ok(sourceFamilies.length >= 2, `${caseId} trenger minst to normaliserte kildefamilier`);
  }
});

test('Teknisk Museum og Kjeller/FFI har uavhengige kildefamilier', () => {
  const profile = readJson('data/fag/profiles/historie/oslo_akershus/profile.json');
  const placeEvidence = readJson('data/fag/historie/place_evidence_historie_v1.json');
  const sourceRegistry = readJson('data/fag/historie/sources_historie_canonical_v1.json');
  const sourcesById = new Map(sourceRegistry.sources.map((source) => [source.source_id, source]));
  const sourceFamilyByType = new Map([
    ['official_museum_institution_page', 'institutional_museum_record'],
    ['official_research_institute_history', 'institutional_research_record'],
    ['official_research_institute_feature', 'institutional_research_record'],
    ['national_library_collection_research_feature', 'national_library_research_collection'],
    ['editorially_reviewed_encyclopedia', 'secondary_reference_work']
  ]);

  for (const caseId of ['case_his_norsk_teknisk_museum', 'case_his_kjeller_ffi']) {
    const profileCase = profile.cases.find((item) => item.case_id === caseId);
    assert.equal(profileCase?.evidence_status, 'claim_source_linked', caseId);
    assert.ok(profileCase.case_requirement_ids.includes('case_req_his_source_comparison'), caseId);

    const sourceIds = [...new Set(placeEvidence.evidence_links
      .filter((link) => link.case_id === caseId)
      .flatMap((link) => link.source_ids || []))];
    const sourceFamilies = [...new Set(sourceIds.map((sourceId) => (
      sourceFamilyByType.get(sourcesById.get(sourceId)?.source_type)
    )))];

    assert.ok(sourceIds.length >= 2, `${caseId} trenger minst to selvstendige kilder`);
    assert.ok(sourceFamilies.every(Boolean), `${caseId} har kilde uten normalisert kildefamilie`);
    assert.ok(sourceFamilies.length >= 2, `${caseId} trenger minst to normaliserte kildefamilier`);
  }
});

test('1814-kapittelets pedagogiske kort følger renderer-kontrakten', () => {
  const chapter = readJson('data/fagverk/historie/1814_statsdannelse.json');
  const modules = chapter.moduleFiles.map(readJson);
  const workedExamples = modules.flatMap((module) => module.workedExamples || []);
  const misconceptions = modules.flatMap((module) => module.commonMisconceptions || []);
  const applicationTasks = modules.flatMap((module) => module.applicationTasks || []);
  const relatedPlaces = modules.flatMap((module) => module.relatedPlaces || []);

  assert.equal(workedExamples.length, 2);
  assert.equal(misconceptions.length, 5);
  assert.equal(applicationTasks.length, 4);
  assert.equal(relatedPlaces.length, 6);

  for (const example of workedExamples) {
    assert.equal(typeof example.title, 'string');
    assert.equal(typeof example.situation, 'string');
    assert.ok(Array.isArray(example.analysis) && example.analysis.length > 0);
    assert.equal('steps' in example, false);
  }
  for (const misconception of misconceptions) {
    assert.equal(typeof misconception.claim, 'string');
    assert.equal(typeof misconception.correction, 'string');
    assert.equal('misconception' in misconception, false);
  }
  for (const task of applicationTasks) {
    assert.equal(typeof task.task, 'string');
    assert.ok(Array.isArray(task.prompts) && task.prompts.length > 0);
    assert.equal('title' in task, false);
    assert.equal('prompt' in task, false);
  }
  for (const place of relatedPlaces) {
    assert.equal(typeof place.id, 'string');
    assert.equal(typeof place.name, 'string');
    assert.equal(typeof place.role, 'string');
    assert.equal('placeId' in place, false);
    assert.equal('reason' in place, false);
  }
});

test('Historie-auditen avviser renderer-lister som ikke er arrays', () => {
  assert.throws(
    () => assertHistoryRendererContract({
      workedExamples: [{
        title: 'Eksempel',
        situation: 'Situasjon',
        analysis: 'Dette er en streng, ikke en liste.'
      }]
    }, 'ugyldig-eksempel.json'),
    /title\/situation\/analysis/
  );

  assert.throws(
    () => assertHistoryRendererContract({
      applicationTasks: [{
        task: 'Oppgave',
        prompts: 'Dette er en streng, ikke en liste.'
      }]
    }, 'ugyldig-oppgave.json'),
    /task\/prompts/
  );
});
