import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { assertHistoryRendererContract, auditHistorySubject } from '../scripts/audit-fagverk-historie.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const readJson = (relativePath) => JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), 'utf8'));

test('Historie er materialisert med fem redaksjonelle kapitler', () => {
  const { report } = auditHistorySubject();
  assert.equal(report.subject.id, 'historie');
  assert.equal(report.subject.adapter, 'standard');
  assert.equal(report.subject.assessmentStatus, 'audited');
  assert.equal(report.subject.editorialStatus, 'chapters_in_progress');
  assert.deepEqual(report.summary, {
    domainCount: 23,
    emneCount: 230,
    methodCount: 105,
    mappingCount: 230,
    hookCount: 230,
    chapterCount: 5,
    chapterDomainCount: 5,
    remainingChapterDomains: 18,
    placeCount: 0
  });
});

test('alle Historie-kapitlene oppfyller kapittel- og evidensporten', () => {
  const { report } = auditHistorySubject();
  assert.deepEqual(report.chapters, [
    {
      id: 'historisk_tid_periodisering',
      domainId: 'his_tid_periodisering',
      sectionCount: 9,
      workedExampleCount: 2,
      misconceptionCount: 5,
      taskCount: 4,
      selfCheckCount: 7,
      sourceCount: 6,
      claimReferenceCount: 4,
      sourceReferenceCount: 4,
      theoryEvidenceReferenceCount: 1
    },
    {
      id: 'kilder_arkiv_spor',
      domainId: 'his_kilder_arkiv_spor',
      sectionCount: 11,
      workedExampleCount: 2,
      misconceptionCount: 5,
      taskCount: 4,
      selfCheckCount: 7,
      sourceCount: 7,
      claimReferenceCount: 8,
      sourceReferenceCount: 6,
      theoryEvidenceReferenceCount: 5
    },
    {
      id: 'makt_stat_institusjoner',
      domainId: 'his_makt_stat_institusjoner',
      sectionCount: 11,
      workedExampleCount: 2,
      misconceptionCount: 5,
      taskCount: 4,
      selfCheckCount: 7,
      sourceCount: 7,
      claimReferenceCount: 8,
      sourceReferenceCount: 7,
      theoryEvidenceReferenceCount: 3
    },
    {
      id: 'middelalder_kirke_kongemakt',
      domainId: 'his_middelalder_kirke_kongemakt',
      sectionCount: 11,
      workedExampleCount: 2,
      misconceptionCount: 5,
      taskCount: 4,
      selfCheckCount: 7,
      sourceCount: 26,
      claimReferenceCount: 40,
      sourceReferenceCount: 26,
      theoryEvidenceReferenceCount: 10,
      tracedParagraphCount: 33,
      productionBriefValidated: true
    },
    {
      id: '1814_statsdannelse',
      domainId: 'his_1814_statsdannelse',
      sectionCount: 12,
      workedExampleCount: 2,
      misconceptionCount: 5,
      taskCount: 4,
      selfCheckCount: 7,
      sourceCount: 32,
      claimReferenceCount: 33,
      sourceReferenceCount: 32,
      theoryEvidenceReferenceCount: 10,
      tracedParagraphCount: 36,
      productionBriefValidated: true
    }
  ]);
  assert.equal(report.gates.registeredChaptersValidated, true);
  assert.equal(report.gates.chapterEvidenceReferencesResolved, true);
  assert.equal(report.gates.productionBriefAndParagraphTraceValidated, true);
  assert.equal(report.gates.historyPlaceFallbackResolved, true);
});

test('kapittelproduksjon skjuler ikke ufullstendig universell evidensdekning', () => {
  const { report } = auditHistorySubject();
  assert.equal(report.universalCoverage.status, 'INCOMPLETE');
  assert.equal(report.universalCoverage.coveredCells, 58);
  assert.equal(report.universalCoverage.totalCells, 58);
  assert.equal(report.universalCoverage.productionGaps, 1);
  assert.equal(report.universalCoverage.theoryEvidenceQualifying, 170);
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

test('Børsen og Tollboden har reell kildesammenligning på tvers av kildetyper', () => {
  const profile = readJson('data/fag/profiles/historie/oslo_akershus/profile.json');
  const placeEvidence = readJson('data/fag/historie/place_evidence_historie_v1.json');
  const sourceRegistry = readJson('data/fag/historie/sources_historie_canonical_v1.json');
  const sourcesById = new Map(sourceRegistry.sources.map((source) => [source.source_id, source]));

  for (const caseId of ['case_his_borsen', 'case_his_tollboden']) {
    const profileCase = profile.cases.find((item) => item.case_id === caseId);
    assert.ok(profileCase, caseId);
    assert.ok(profileCase.case_requirement_ids.includes('case_req_his_source_comparison'), caseId);

    const sourceIds = [...new Set(placeEvidence.evidence_links
      .filter((link) => link.case_id === caseId)
      .flatMap((link) => link.source_ids || []))];
    const sourceTypes = [...new Set(sourceIds.map((sourceId) => sourcesById.get(sourceId)?.source_type))];

    assert.ok(sourceIds.length >= 2, `${caseId} trenger minst to selvstendige kilder`);
    assert.ok(sourceTypes.length >= 2, `${caseId} trenger minst to kildetyper`);
    assert.ok(sourceTypes.every(Boolean), `${caseId} har kilde uten canonical source_type`);
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
