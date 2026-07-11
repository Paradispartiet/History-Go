import fs from 'fs';
import path from 'path';

type PeopleAuditSummary = {
  duplicatePeopleIds?: number;
  invalidPlaceRefs?: number;
  peopleWithoutValidPrimaryAnchor?: number;
  peopleWithEmptyPlacesArray?: number;
};

type PeopleAuditReport = {
  summary?: PeopleAuditSummary;
};

const reportPath = path.join(process.cwd(), 'reports/people-of-places-status.json');

if (!fs.existsSync(reportPath)) {
  console.error(`People of Places audit gate failed: missing ${path.relative(process.cwd(), reportPath)}`);
  process.exit(1);
}

const report = JSON.parse(fs.readFileSync(reportPath, 'utf8')) as PeopleAuditReport;
const summary = report.summary ?? {};
const failures = [
  ['duplicatePeopleIds', summary.duplicatePeopleIds],
  ['invalidPlaceRefs', summary.invalidPlaceRefs],
  ['peopleWithoutValidPrimaryAnchor', summary.peopleWithoutValidPrimaryAnchor],
  ['peopleWithEmptyPlacesArray', summary.peopleWithEmptyPlacesArray],
].filter(([, count]) => Number(count) > 0);

if (failures.length > 0) {
  console.error('People of Places audit gate failed:');
  for (const [field, count] of failures) console.error(`- ${field}: ${count}`);
  process.exit(1);
}

console.log('People of Places audit gate passed');
