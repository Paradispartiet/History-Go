import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { auditLitteraturScientificPackage, validateFullFieldContract } from '../scripts/audit-litteratur-scientific-package-v1.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PACKAGE = 'data/fag/litteratur/litteraturvitenskap_canonical_v1';
const read = (file) => JSON.parse(fs.readFileSync(path.join(ROOT, file), 'utf8'));

test('Litteratur har synkronisert oversiktslag og kildeførte full-dybde-kapitler', () => {
  assert.deepEqual(auditLitteraturScientificPackage(), {
    areaCount: 28,
    topicCount: 168,
    completeAreaCount: 28,
    fullDepthChapterCount: 28,
    expandedContractCount: 18,
    expandedContractFulfilledCount: 18,
    conceptCount: 804,
    moduleCount: 84,
    sourceCount: 384,
    claimCount: 1266
  });
});

test('utvidede fullfeltkontrakter avviser seks overskrifter uten bindende underdekning', () => {
  const coverage = read(`${PACKAGE}/coverage_contract_v1.json`);
  const areaIds = new Set(coverage.coverage_areas.map((area) => area.id));
  for (const area of coverage.coverage_areas.filter((row) => row.full_field_contract)) {
    const contract = read(`${PACKAGE}/${area.full_field_contract}`);
    assert.doesNotThrow(() => validateFullFieldContract(area, contract, areaIds));
    const incomplete = structuredClone(contract);
    incomplete.topicRequirements[0].requiredSubcoverage = incomplete.topicRequirements[0].requiredSubcoverage.slice(0, 6);
    assert.throws(() => validateFullFieldContract(area, incomplete, areaIds), /mangler bindende underdekning/u);
  }
});
