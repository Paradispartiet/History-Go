#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const WRITE = process.argv.includes('--write');
const FINAL_GATE = 'cultural_heritage_canon_stars_memory_full_chapter_complete_completion_audit';
const MAINTENANCE_GATE = 'maintenance_source_refresh_and_place_case_expansion';
const STALE_PRODUCTION_PATTERN = '(?:source_brief_complete_full_chapter_production|full_chapter_complete_next_unit_source_brief|full_chapter_complete_completion_audit)$';
const COMPLETION_AWARE_PRODUCTION_PATTERN = '(?:source_brief_complete_full_chapter_production|full_chapter_complete_next_unit_source_brief|full_chapter_complete_completion_audit|maintenance_source_refresh_and_place_case_expansion)$';

const TARGET_DIRS = ['scripts', 'tests'];
const TARGET_FILE = /(?:film-tv|fagverk-film-tv).*\.mjs$/;

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(full);
    return [full];
  });
}

function relative(file) {
  return path.relative(ROOT, file).split(path.sep).join('/');
}

function addMaintenanceToLaterGateSets(text) {
  const gateConst = text.match(new RegExp(`const\\s+([A-Z0-9_]+)\\s*=\\s*['\"]${FINAL_GATE}['\"];`));
  if (!gateConst) return text;

  const gateVar = gateConst[1];
  if (!text.includes(`const MAINTENANCE_GATE = '${MAINTENANCE_GATE}';`)) {
    text = text.replace(gateConst[0], `${gateConst[0]}\nconst MAINTENANCE_GATE = '${MAINTENANCE_GATE}';`);
  }

  return text.replace(/new Set\(\[([\s\S]*?)\]\)/g, (whole, body) => {
    if (!new RegExp(`\\b${gateVar}\\b`).test(body) || /\bMAINTENANCE_GATE\b/.test(body)) return whole;
    const updatedBody = body.replace(new RegExp(`\\b${gateVar}\\b\\s*,?`), `${gateVar}, MAINTENANCE_GATE`);
    return `new Set([${updatedBody}])`;
  });
}

function transform(text) {
  let next = text.split(STALE_PRODUCTION_PATTERN).join(COMPLETION_AWARE_PRODUCTION_PATTERN);
  next = addMaintenanceToLaterGateSets(next);
  next = next.replace(
    "assert(statusEntry.editorialStatus === 'chapters_in_progress', 'Film & TV skal stå chapters_in_progress');",
    "assert(['chapters_in_progress', 'complete'].includes(statusEntry.editorialStatus), 'Film & TV skal stå i produksjon eller bevist complete-tilstand');"
  );
  return next;
}

const files = TARGET_DIRS.flatMap((dir) => walk(path.join(ROOT, dir)))
  .filter((file) => TARGET_FILE.test(relative(file)));

const changed = [];
const unresolved = [];
for (const file of files) {
  const before = fs.readFileSync(file, 'utf8');
  const after = transform(before);
  const rel = relative(file);

  if (before !== after) {
    changed.push(rel);
    if (WRITE) fs.writeFileSync(file, after);
  }

  const checked = WRITE ? after : before;
  if (checked.includes(STALE_PRODUCTION_PATTERN)) {
    unresolved.push(`${rel}: stale production-gate regex`);
  }

  const gateConst = checked.match(new RegExp(`const\\s+([A-Z0-9_]+)\\s*=\\s*['\"]${FINAL_GATE}['\"];`));
  if (gateConst) {
    const gateVar = gateConst[1];
    for (const match of checked.matchAll(/new Set\(\[([\s\S]*?)\]\)/g)) {
      if (new RegExp(`\\b${gateVar}\\b`).test(match[1]) && !/\bMAINTENANCE_GATE\b/.test(match[1])) {
        unresolved.push(`${rel}: later-gate set containing ${gateVar} omits MAINTENANCE_GATE`);
      }
    }
  }

  if (/audit-fagverk-film-tv-(?:kinoer-visningssteder-publikum|produksjon-studio-filmarbeid)-phase4\.mjs$/.test(rel)
      && checked.includes("statusEntry.editorialStatus === 'chapters_in_progress'")) {
    unresolved.push(`${rel}: legacy chapter audit still pins chapters_in_progress`);
  }
}

if (unresolved.length) {
  for (const message of unresolved) {
    if (process.env.GITHUB_ACTIONS) console.error(`::error title=Film TV completion monotonicity::${message}`);
    else console.error(message);
  }
  process.exitCode = 1;
} else {
  console.log(`Film & TV completion monotonicity: ${WRITE ? 'repaired' : 'checked'} ${changed.length} file(s).`);
  for (const file of changed) console.log(`- ${file}`);
}
