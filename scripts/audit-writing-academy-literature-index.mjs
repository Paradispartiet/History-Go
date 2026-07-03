import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const readJson = (p) => JSON.parse(fs.readFileSync(path.join(root, p), 'utf8'));
const assert = (condition, message) => { if (!condition) throw new Error(message); };

const registry = readJson('data/historygo/shared/game_registry.json');
const game = registry.games?.find((entry) => entry.gameId === 'hgWritingAcademy');
assert(game, 'hgWritingAcademy missing from game_registry');
assert(game.status === 'external_scaffold', 'hgWritingAcademy must be marked external_scaffold');
assert(game.entryPath === 'https://paradispartiet.github.io/Skrivekunstakademiet/', 'hgWritingAcademy entryPath must point to Skrivekunstakademiet GitHub Pages');
assert(Array.isArray(game.readsFromHistoryGo) && game.readsFromHistoryGo.includes('people') && game.readsFromHistoryGo.includes('places'), 'hgWritingAcademy must continue to read canonical History-Go collections');
assert(Array.isArray(game.writesBackToProfile) && game.writesBackToProfile.includes('progression'), 'hgWritingAcademy must keep profile write-back contract');
assert(String(game.independenceRule || '').includes('uavhengig'), 'hgWritingAcademy independenceRule must be preserved');

const externalRepo = path.resolve(root, '..', 'Skrivekunstakademiet');
const externalAudit = path.join(externalRepo, 'scripts/audit-writing-academy-literature-index.mjs');
if (fs.existsSync(externalAudit)) {
  const result = spawnSync(process.execPath, [externalAudit], { cwd: externalRepo, stdio: 'inherit' });
  assert(result.status === 0, 'external Skrivekunstakademiet audit failed');
} else {
  console.warn(`Skrivekunstakademiet checkout not found at ${externalRepo}; registry bridge validated only.`);
}

console.log(JSON.stringify({ ok: true, game: 'hgWritingAcademy', status: game.status, entryPath: game.entryPath }, null, 2));
