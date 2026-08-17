#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const REPAIR = 'scripts/repair-film-tv-completion-monotonicity-v1.mjs';
const abs = (file) => path.join(ROOT, file);

function replaceOnce(text, before, after, label) {
  const first = text.indexOf(before);
  if (first === -1) throw new Error(`${label}: fant ikke forventet mønster`);
  if (text.indexOf(before, first + before.length) !== -1) throw new Error(`${label}: mønsteret forekommer mer enn én gang`);
  return text.slice(0, first) + after + text.slice(first + before.length);
}

let repair = fs.readFileSync(abs(REPAIR), 'utf8');

const unit12Repair = `function repairUnit12CanonicalClaimIds(rel, text) {
  if (rel !== 'scripts/materialize-film-tv-screen-places-identity-circulation-fulltext-v1.mjs') return text;
  let next = text;
  next = next.replace(
    "assert(new Set(allPlannedClaims.map((row) => row.id)).size === 52, 'Claimplan-ID-er må være unike');",
    "assert(new Set(allPlannedClaims.map((row) => row.id)).size === 52, 'Claimplan-ID-er må være unike');\\n  assert(allPlannedClaims.every((row) => /^sp-/u.test(row.id)), 'Unit 12 claimplan-ID-er må bruke sp--prefikset før canonicalisering');"
  );
  next = next.replace(
    'paragraphClaimIds: topic.planned_claims.map((claim) => [claim.id]),',
    "paragraphClaimIds: topic.planned_claims.map((claim) => [claim.id.replace(/^sp-/u, 'spsi-')]),"
  );
  next = next.replace(
    \`keyPointClaimIds: [
        [topic.planned_claims[0].id],
        [topic.planned_claims.at(-1).id]
      ],\`,
    \`keyPointClaimIds: [
        [topic.planned_claims[0].id.replace(/^sp-/u, 'spsi-')],
        [topic.planned_claims.at(-1).id.replace(/^sp-/u, 'spsi-')]
      ],\`
  );
  next = next.replace(
    '    id: plan.id,\\n    claim_plan_id: plan.id,',
    "    id: plan.id.replace(/^sp-/u, 'spsi-'),\\n    claim_plan_id: plan.id,"
  );
  next = next.replace(
    'used_in: [sectionByClaim.get(plan.id)]',
    "used_in: [sectionByClaim.get(plan.id.replace(/^sp-/u, 'spsi-'))]"
  );
  return next;
}

`;

repair = replaceOnce(
  repair,
  'function transform(rel, text) {',
  `${unit12Repair}function transform(rel, text) {`,
  'insert Unit12 canonical claim-ID repair'
);

const transformNeedle = `  next = next.replace(
    "filmStatus?.editorialStatus === 'chapters_in_progress'",
    "['chapters_in_progress', 'complete'].includes(filmStatus?.editorialStatus)"
  );
  next = repairUnit12ClaimPlanLookup(rel, next);`;
const transformReplacement = `  next = next.replace(
    "filmStatus?.editorialStatus === 'chapters_in_progress'",
    "['chapters_in_progress', 'complete'].includes(filmStatus?.editorialStatus)"
  );
  next = next.replace(
    "assert.equal(filmStatus.editorialStatus, 'chapters_in_progress');",
    "assert.ok(['chapters_in_progress', 'complete'].includes(filmStatus.editorialStatus));"
  );
  next = next.replace(
    "assert(status?.editorialStatus === 'chapters_in_progress', 'Film & TV skal fortsatt stå som pågående');",
    "assert(status?.editorialStatus === 'chapters_in_progress' || (status?.editorialStatus === 'complete' && status?.nextGate === 'maintenance_source_refresh_and_place_case_expansion'), 'Film & TV skal stå som pågående eller i bevist complete-/maintenance-tilstand');"
  );
  next = next.replace(
    "assert(isDeepStrictEqual(chapter.method_ids, EXPECTED_METHODS), 'Kapittelet har feil canonicalt metodeutvalg');",
    "assert(EXPECTED_METHODS.every((id) => chapter.method_ids.includes(id)), 'Kapittelet mangler historisk påkrevde canonicale metoder');\\n  assert(new Set(chapter.method_ids).size === chapter.method_ids.length, 'Kapittelet har duplikate metode-ID-er');"
  );
  next = repairUnit12CanonicalClaimIds(rel, next);
  next = repairUnit12ClaimPlanLookup(rel, next);`;
repair = replaceOnce(repair, transformNeedle, transformReplacement, 'extend monotonic transform');

const unresolvedNeedle = `  if (/audit-fagverk-film-tv-(?:kinoer-visningssteder-publikum|produksjon-studio-filmarbeid)-phase4\\.mjs$/.test(rel)
      && text.includes("statusEntry.editorialStatus === 'chapters_in_progress'")) {
    problems.push(\`${'${rel}'}: legacy chapter audit still pins chapters_in_progress\`);
  }
  return problems;`;
const unresolvedReplacement = `  if (/audit-fagverk-film-tv-(?:kinoer-visningssteder-publikum|produksjon-studio-filmarbeid)-phase4\\.mjs$/.test(rel)
      && text.includes("statusEntry.editorialStatus === 'chapters_in_progress'")) {
    problems.push(\`${'${rel}'}: legacy chapter audit still pins chapters_in_progress\`);
  }
  if (/assert\\.equal\\(filmStatus\\.editorialStatus,\\s*['\"]chapters_in_progress['\"]\\)/.test(text)) {
    problems.push(\`${'${rel}'}: stale exact Film & TV editorialStatus assertion\`);
  }
  if (text.includes("assert(status?.editorialStatus === 'chapters_in_progress', 'Film & TV skal fortsatt stå som pågående');")) {
    problems.push(\`${'${rel}'}: variable inventory still pins chapters_in_progress\`);
  }
  if (/audit-fagverk-film-tv-(?:kinoer-visningssteder-publikum|produksjon-studio-filmarbeid)-phase4\\.mjs$/.test(rel)
      && text.includes("assert(isDeepStrictEqual(chapter.method_ids, EXPECTED_METHODS)")) {
    problems.push(\`${'${rel}'}: legacy Phase4 audit still forbids valid canonical method expansion\`);
  }
  if (rel === 'scripts/materialize-film-tv-screen-places-identity-circulation-fulltext-v1.mjs'
      && (text.includes('paragraphClaimIds: topic.planned_claims.map((claim) => [claim.id]),')
        || text.includes('    id: plan.id,\\n    claim_plan_id: plan.id,')
        || text.includes('used_in: [sectionByClaim.get(plan.id)]'))) {
    problems.push(\`${'${rel}'}: Unit12 materializer still emits claim-plan IDs as canonical claim IDs\`);
  }
  return problems;`;
repair = replaceOnce(repair, unresolvedNeedle, unresolvedReplacement, 'extend unresolved monotonicity guard');

fs.writeFileSync(abs(REPAIR), repair);
execFileSync(process.execPath, [abs(REPAIR), '--write'], { cwd: ROOT, stdio: 'inherit' });
execFileSync(process.execPath, [abs(REPAIR)], { cwd: ROOT, stdio: 'inherit' });
console.log('Film & TV final gap repair materialized and rechecked.');
