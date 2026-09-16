import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { deriveSelectedCollections, validateWorkflowRecord } from '../scripts/place-production-v3-lib.mjs';

const repoRoot = path.resolve(new URL('..', import.meta.url).pathname);
const EXPECTED_FACTUALITY_GIT_BLOB = '9643617d78bb0d6af40f8bd2a9a6aac0b043f1a6';

function readJson(relative) {
  return JSON.parse(fs.readFileSync(path.join(repoRoot, relative), 'utf8'));
}

test('Akershus slott uses v3 workflow without changing factuality bytes', () => {
  const workflow = readJson('data/places/workflow/akershus_slott.json');
  assert.equal(workflow.schema, 'history_go_place_production_workflow_v3');
  assert.equal(workflow.place_id, 'akershus_slott');
  assert.equal(workflow.sources.factuality_record, 'data/places/production/akershus_slott.json');
  assert.ok(['major', 'standard', 'focused', 'micro'].includes(workflow.profile.id));
  assert.notEqual(workflow.profile.id, 'rich');
  assert.equal(workflow.state, 'complete');
  assert.equal(validateWorkflowRecord(workflow).ok, true);
  assert.deepEqual(
    deriveSelectedCollections(workflow),
    Object.keys(workflow.collections).filter((id) => workflow.collections[id].status === 'PASS'),
  );

  const blob = execFileSync('git', ['hash-object', 'data/places/production/akershus_slott.json'], {
    cwd: repoRoot,
    encoding: 'utf8',
  }).trim();
  assert.equal(blob, EXPECTED_FACTUALITY_GIT_BLOB);
});
