#!/usr/bin/env node
import { auditFagverkTheoryIntegrity } from './audit-fagverk-theory-integrity.mjs';

const report = auditFagverkTheoryIntegrity();
const args = new Set(process.argv.slice(2));
const subjectArg = [...args].find((arg) => arg.startsWith('--subject='));
const subjectId = subjectArg?.slice('--subject='.length);

if (subjectId) {
  const subject = report.subjects.find((item) => item.id === subjectId);
  if (!subject) {
    console.error(`Ukjent fag: ${subjectId}`);
    process.exitCode = 1;
  } else {
    console.log(JSON.stringify({
      id: subject.id,
      status: subject.status,
      profile: subject.profile,
      editorialStatus: subject.editorialStatus,
      fieldInventoryResolved: subject.fieldInventoryResolved,
      fieldInventorySource: subject.fieldInventorySource,
      fieldCount: subject.fieldCount,
      theoryCandidateCount: subject.theoryCandidateCount,
      blockers: subject.blockers,
      parseFailures: subject.parseFailures,
      fields: subject.fields.map((field) => ({
        id: field.id,
        label: field.label,
        status: field.status,
        emneCount: field.emneCount,
        candidateCount: field.candidateCount,
        fullyStructuredCandidateCount: field.fullyStructuredCandidateCount,
        scholarlySourceBoundCandidateCount: field.scholarlySourceBoundCandidateCount,
        explicitProseOrClaimBoundCandidateCount: field.explicitProseOrClaimBoundCandidateCount,
        rivalOrAlternativeCandidateCount: field.rivalOrAlternativeCandidateCount,
        namedPeople: field.namedPeople,
        namedPeopleWithConcreteWork: field.namedPeopleWithConcreteWork,
        missingSignals: field.missingSignals
      }))
    }, null, 2));
  }
} else {
  console.log(JSON.stringify({
    schema: report.schema,
    status: report.status,
    finalReady: report.finalReady,
    scope: report.scope,
    summary: report.summary,
    repairQueue: report.repairQueue,
    subjects: report.subjects.map((subject) => {
      const redFields = subject.fields.filter((field) => field.status === 'red');
      const yellowFields = subject.fields.filter((field) => field.status === 'yellow');
      const greenFields = subject.fields.filter((field) => field.status === 'green');
      const missingSignalCounts = {};
      for (const field of [...redFields, ...yellowFields]) {
        for (const signal of field.missingSignals) {
          missingSignalCounts[signal] = (missingSignalCounts[signal] || 0) + 1;
        }
      }
      return {
        id: subject.id,
        status: subject.status,
        profile: subject.profile,
        editorialStatus: subject.editorialStatus,
        fieldInventoryResolved: subject.fieldInventoryResolved,
        fieldInventorySource: subject.fieldInventorySource,
        fieldCount: subject.fieldCount,
        theoryCandidateCount: subject.theoryCandidateCount,
        greenFields: greenFields.length,
        yellowFields: yellowFields.map((field) => field.id),
        redFields: redFields.map((field) => field.id),
        missingSignalCounts,
        blockers: subject.blockers,
        parseFailureCount: subject.parseFailures.length
      };
    })
  }, null, 2));
}
