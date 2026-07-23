import { readFileSync, writeFileSync } from 'node:fs';

const REPORT = 'reports/oslo-coordinate-bryn-industrial-model-audit-post-191/summary.json';
const SOURCES = 'reports/oslo-coordinate-bryn-industrial-model-audit-post-191/sources.md';
const readJson = (file) => JSON.parse(readFileSync(file, 'utf8'));
const writeJson = (file, value) => writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`, 'utf8');

const summary = readJson(REPORT);
if (summary.version !== '2026-07-23' || summary.legacy?.id !== 'bryn_industriomrade') throw new Error('Unexpected Bryn audit report state');

const allCandidates = Array.isArray(summary.brynCandidates) ? summary.brynCandidates : [];
const contextualRouteCandidates = allCandidates.filter((place) => place.locatorType === 'route' && String(place.coordStatus || '').startsWith('verified'));
const trueAreaCandidates = allCandidates.filter((place) => ['linear_area', 'natural_area', 'park'].includes(place.locatorType) || /^(bryn|bryn industriområde)$/i.test(place.name));
const verifiedBroadAreaCandidate = trueAreaCandidates.find((place) => String(place.coordStatus || '').startsWith('verified')) || null;

summary.areaCandidates = trueAreaCandidates;
summary.contextualRouteCandidates = contextualRouteCandidates;
summary.verifiedBroadCandidate = verifiedBroadAreaCandidate;
summary.conclusion = verifiedBroadAreaCandidate
  ? `A verified broad Bryn canonical area exists (${verifiedBroadAreaCandidate.id}); audit semantic overlap before creating separate industrial geometry.`
  : 'No verified broad canonical Bryn area exists. The verified Alna/Alnastien records are route context through Bryn, not substitutes for a Bryn industrial-area geometry. Keep bryn_industriomrade unresolved until a source-backed industrial-area scope/geometry or a deliberately redefined concrete physical identity is documented.';

writeJson(REPORT, summary);
writeFileSync(SOURCES, `# Bryn industrial model audit\n\nDate: 2026-07-23\n\n${summary.conclusion}\n\n- Bryn-named canonical candidates: ${allCandidates.length}\n- Verified Bryn-context routes: ${contextualRouteCandidates.length}\n- True area-like Bryn candidates: ${trueAreaCandidates.length}\n- Verified broad Bryn area candidate: ${verifiedBroadAreaCandidate ? verifiedBroadAreaCandidate.id : 'none'}\n- Exact legacy-ID reference lines: ${summary.referenceInventory?.count ?? 'unknown'} across ${summary.referenceInventory?.fileCount ?? 'unknown'} files\n\nThe earlier machine heuristic temporarily classified a route containing “Bryn” in its name as a broad area candidate. This correction explicitly rejects that equivalence. No coordinate or canonical place data is changed.\n`, 'utf8');

console.log(JSON.stringify({
  legacyId: 'bryn_industriomrade',
  contextualRouteCandidateCount: contextualRouteCandidates.length,
  trueAreaCandidateCount: trueAreaCandidates.length,
  verifiedBroadAreaCandidate,
  conclusion: summary.conclusion
}, null, 2));
