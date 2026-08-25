import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const readJson = (path) => JSON.parse(readFileSync(path, 'utf8'));
const manifest = readJson('data/stories/stories_manifest.json');
const categoryContract = readJson('data/categories/category_contract.json');
const entries = Array.isArray(manifest.files) ? manifest.files : [];
const uniquePaths = [...new Set(entries.map((entry) => entry.path))];

assert.ok(categoryContract.runtimeCategories.includes('naeringsliv'));
assert.ok(categoryContract.runtimeCategories.includes('psykologi'));
assert.ok(entries.some((entry) => entry.category === 'naeringsliv'));
assert.ok(entries.some((entry) => entry.category === 'psykologi'));

let expectedStories = 0;
for (const path of uniquePaths) {
  const stories = readJson(path);
  assert.ok(Array.isArray(stories), `${path} must have an array root`);
  expectedStories += stories.length;
}

const result = spawnSync(process.execPath, ['dist/tools/check_stories_integrity.mjs'], {
  encoding: 'utf8',
});
const output = `${result.stdout || ''}\n${result.stderr || ''}`;

assert.ok(result.status === 0 || result.status === 1, output);
assert.doesNotMatch(output, /Duplikat story\.id:/);
assert.doesNotMatch(output, /Ugyldig manifest category:/);

const fileCount = Number(output.match(/- Story-filer: (\d+)/)?.[1]);
const storyCount = Number(output.match(/- Stories: (\d+)/)?.[1]);
assert.equal(fileCount, uniquePaths.length, output);
assert.equal(storyCount, expectedStories, output);

const failureLines = output
  .split('\n')
  .filter((line) => line.startsWith('- '))
  .filter((line) => !/^-(?: Story-filer| Stories| Place-koblede stories| Person-koblede stories| Next scenes| Episode-v1-filer| Episode-v1-stories| Place-sourcefiler lest):/.test(line));
assert.ok(
  failureLines.every((line) => line.startsWith('- Ugyldig place_id:')),
  `Unexpected integrity failures:\n${failureLines.join('\n')}`,
);

console.log(`Stories manifest regression OK: ${uniquePaths.length} unique files, ${expectedStories} stories`);
