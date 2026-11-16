import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

// Keep Civication regression for changes to its behavior. Artwork-only
// replacements of already registered subbadge image paths are UI assets.
const artworkPath = /^bilder\/merker\/[a-zA-Z0-9_/-]+\.webp$/;

function affectsCivicationPath(path) {
  if (path.startsWith('data/badges/')) return true;
  if (path.startsWith('data/Civication/')) {
    if (path === 'data/Civication/historyPeople_index.json') return false;
    if (path === 'data/Civication/scenarioPeople_index.json') return false;
    if (path.startsWith('data/Civication/scenarioPeople/')) return false;
    return true;
  }
  if (path === 'docs/CIVICATION_FWG_GOVERNANCE.md') return true;
  if (path.startsWith('js/Civication/')) return true;
  if (/^tests\/civication-.*\.test\.js$/.test(path)) {
    return !['tests/civication-psychology-room-theory.test.js',
      'tests/civication-psychology-room-coverage.test.js'].includes(path);
  }
  if (/^tests\/acceptance-civication-.*\.test\.js$/.test(path)) return true;
  if (path === 'tests/run-civication-tests.mjs') return true;
  if (/^scripts\/audit-civication-.*\.mjs$/.test(path)) return true;
  if (/^scripts\/auditJob(LearningProfiles|KnowledgeRequirements)\..+$/.test(path)) return true;
  return ['package.json', 'package-lock.json', '.github/workflows/civication.yml'].includes(path);
}

export function artworkOnlyBadgeRegistryChange(before, after) {
  if (!before || !after || Array.isArray(before) || Array.isArray(after)) return false;
  const { subBadgeImages: oldImages, ...oldSemantics } = before;
  const { subBadgeImages: newImages, ...newSemantics } = after;
  if (!oldImages || !newImages ||
      Array.isArray(oldImages) || Array.isArray(newImages) ||
      typeof oldImages !== 'object' || typeof newImages !== 'object') return false;
  if (JSON.stringify(oldSemantics) !== JSON.stringify(newSemantics)) return false;
  const oldKeys = Object.keys(oldImages).sort();
  const newKeys = Object.keys(newImages).sort();
  if (JSON.stringify(oldKeys) !== JSON.stringify(newKeys) || oldKeys.length === 0) return false;
  let changed = false;
  for (const id of oldKeys) {
    if (typeof oldImages[id] !== 'string' || typeof newImages[id] !== 'string' ||
        !artworkPath.test(oldImages[id]) || !artworkPath.test(newImages[id])) return false;
    if (oldImages[id] !== newImages[id]) changed = true;
  }
  return changed;
}

export function needsCivicationRegression(paths, readBadgeVersion) {
  for (const path of paths) {
    if (!affectsCivicationPath(path)) continue;
    if (!path.startsWith('data/badges/')) return true;
    // Unknown badge manifests or binary edits fail closed to full regression.
    if (!/^data\/badges\/[a-z0-9_-]+\.json$/.test(path)) return true;
    try {
      const before = readBadgeVersion(path, 'base');
      const after = readBadgeVersion(path, 'head');
      if (!artworkOnlyBadgeRegistryChange(before, after)) return true;
    } catch {
      return true;
    }
  }
  return false;
}

function git(args) {
  return execFileSync('git', args, { encoding: 'utf8', maxBuffer: 8 * 1024 * 1024 }).trim();
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [base, head] = process.argv.slice(2);
  if (!/^[0-9a-f]{40}$/.test(base || '') || !/^[0-9a-f]{40}$/.test(head || '')) {
    throw new Error('Expected exact base/head commit SHAs');
  }
  const changedPaths = git(['diff', '--name-only', '--diff-filter=ACDMRT', base, head])
    .split('\n').filter(Boolean);
  const run = needsCivicationRegression(changedPaths, (path, version) =>
    JSON.parse(git(['show', (version === 'base' ? base : head) + ':' + path])));
  process.stdout.write('regression=' + (run ? 'true' : 'false') + '\n');
  process.stderr.write('Civication full regression ' + (run ? 'required' : 'skipped (artwork-only / unrelated changes)') + '\n');
}
