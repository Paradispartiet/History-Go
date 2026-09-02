import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const root = process.cwd();
const read = (file) => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
const registry = read('data/fagverk/fagverk_registry.json');
const reportDir = path.join(root, 'reports/place-production');

const curatedPlaceIds = new Set(
  Object.entries(registry.placeLinks || {})
    .filter(([, entry]) => entry?.status === 'curated')
    .map(([placeId]) => placeId)
);

const unfinishedStatuses = new Set([
  'linked_unfinished',
  'category_only_unfinished',
  'in_production',
  'unfinished',
  'missing',
  'not_materialized'
]);

function normalizeStatus(value) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/gu, '_');
}

function explicitFagverkStatus(value) {
  if (typeof value === 'string') return normalizeStatus(value);
  if (value && typeof value === 'object' && typeof value.status === 'string') {
    return normalizeStatus(value.status);
  }
  return '';
}

test('curated Fagverk har ingen stale unfinished-status i gjeldende workcards eller completion-audits', () => {
  const stale = [];
  const files = fs.readdirSync(reportDir)
    .filter((name) => name.endsWith('-workcard-current.json') || name.endsWith('-phase1-24-gate-audit-v1.json'));

  for (const name of files) {
    const relative = `reports/place-production/${name}`;
    const document = read(relative);
    const placeId = document.place_id || document.placeId;
    if (!placeId || !curatedPlaceIds.has(placeId) || !Object.hasOwn(document, 'fagverk')) continue;

    const status = explicitFagverkStatus(document.fagverk);
    if (unfinishedStatuses.has(status)) {
      stale.push(`${relative}: ${placeId} registry=curated report=${status}`);
    }
  }

  assert.deepEqual(stale, [], `Stale Fagverk-status:\n${stale.join('\n')}`);
});
