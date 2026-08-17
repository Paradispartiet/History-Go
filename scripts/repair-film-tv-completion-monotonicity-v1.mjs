#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const WRITE = process.argv.includes('--write');
const FINAL_GATE = 'cultural_heritage_canon_stars_memory_full_chapter_complete_completion_audit';
const MAINTENANCE_GATE = 'maintenance_source_refresh_and_place_case_expansion';
const TARGET_DIRS = ['scripts', 'tests'];
const TARGET_FILE = /(?:film-tv|fagverk-film-tv).*\.mjs$/;
const SELF = 'scripts/repair-film-tv-completion-monotonicity-v1.mjs';

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

function addMaintenanceToProductionRegexes(text) {
  return text.replace(
    /full_chapter_complete_completion_audit\)\$/g,
    'full_chapter_complete_completion_audit|maintenance_source_refresh_and_place_case_expansion)$'
  );
}

function finalGateConstant(text) {
  return text.match(new RegExp(`const\\s+([A-Z0-9_]+)\\s*=\\s*['\"]${FINAL_GATE}['\"];`));
}

function ensureMaintenanceConstant(text, gateConst) {
  if (!gateConst || text.includes(`const MAINTENANCE_GATE = '${MAINTENANCE_GATE}';`)) return text;
  return text.replace(gateConst[0], `${gateConst[0]}\nconst MAINTENANCE_GATE = '${MAINTENANCE_GATE}';`);
}

function addMaintenanceToLaterGateSets(text) {
  const gateConst = finalGateConstant(text);
  if (!gateConst) return text;
  const gateVar = gateConst[1];
  let next = ensureMaintenanceConstant(text, gateConst);

  next = next.replace(/new Set\(\[([\s\S]*?)\]\)/g, (whole, body) => {
    if (!new RegExp(`\\b${gateVar}\\b`).test(body) || /\bMAINTENANCE_GATE\b/.test(body)) return whole;
    const updatedBody = body.replace(new RegExp(`\\b${gateVar}\\b\\s*,?`), `${gateVar}, MAINTENANCE_GATE`);
    return `new Set([${updatedBody}])`;
  });
  return next;
}

function addMaintenanceToNextGateIncludes(text) {
  const gateConst = finalGateConstant(text);
  const gateVar = gateConst?.[1];
  let next = ensureMaintenanceConstant(text, gateConst);

  return next.replace(/\[([^\]]*)\]\.includes\(([^)]*(?:nextGate|currentGate)[^)]*)\)/g, (whole, body, argument) => {
    if (/\bMAINTENANCE_GATE\b/.test(body) || body.includes(`'${MAINTENANCE_GATE}'`) || body.includes(`\"${MAINTENANCE_GATE}\"`)) return whole;

    if (gateVar && new RegExp(`\\b${gateVar}\\b`).test(body)) {
      const updatedBody = body.replace(new RegExp(`\\b${gateVar}\\b\\s*,?`), `${gateVar}, MAINTENANCE_GATE`);
      return `[${updatedBody}].includes(${argument})`;
    }

    const literalPattern = new RegExp(`(['\"])${FINAL_GATE}\\1\\s*,?`);
    if (literalPattern.test(body)) {
      const updatedBody = body.replace(literalPattern, (match, quote) => `${quote}${FINAL_GATE}${quote},\n    ${quote}${MAINTENANCE_GATE}${quote}`);
      return `[${updatedBody}].includes(${argument})`;
    }
    return whole;
  });
}

function transform(text) {
  let next = addMaintenanceToProductionRegexes(text);
  next = addMaintenanceToLaterGateSets(next);
  next = addMaintenanceToNextGateIncludes(next);
  next = next.replace(
    "assert(statusEntry.editorialStatus === 'chapters_in_progress', 'Film & TV skal stå chapters_in_progress');",
    "assert(['chapters_in_progress', 'complete'].includes(statusEntry.editorialStatus), 'Film & TV skal stå i produksjon eller bevist complete-tilstand');"
  );
  next = next.replace(
    "filmStatus?.editorialStatus === 'chapters_in_progress'",
    "['chapters_in_progress', 'complete'].includes(filmStatus?.editorialStatus)"
  );
  return next;
}

function unresolvedProblems(rel, text) {
  const problems = [];
  if (/full_chapter_complete_completion_audit\)\$/.test(text)) {
    problems.push(`${rel}: stale production-gate regex`);
  }

  const gateConst = finalGateConstant(text);
  if (gateConst) {
    const gateVar = gateConst[1];
    for (const match of text.matchAll(/new Set\(\[([\s\S]*?)\]\)/g)) {
      if (new RegExp(`\\b${gateVar}\\b`).test(match[1]) && !/\bMAINTENANCE_GATE\b/.test(match[1])) {
        problems.push(`${rel}: later-gate Set containing ${gateVar} omits MAINTENANCE_GATE`);
      }
    }
  }

  for (const match of text.matchAll(/\[([^\]]*)\]\.includes\(([^)]*(?:nextGate|currentGate)[^)]*)\)/g)) {
    const body = match[1];
    const hasFinal = body.includes(FINAL_GATE) || (gateConst && new RegExp(`\\b${gateConst[1]}\\b`).test(body));
    const hasMaintenance = body.includes(MAINTENANCE_GATE) || /\bMAINTENANCE_GATE\b/.test(body);
    if (hasFinal && !hasMaintenance) problems.push(`${rel}: nextGate/currentGate include-list omits maintenance gate`);
  }

  if (/audit-fagverk-film-tv-(?:kinoer-visningssteder-publikum|produksjon-studio-filmarbeid)-phase4\.mjs$/.test(rel)
      && text.includes("statusEntry.editorialStatus === 'chapters_in_progress'")) {
    problems.push(`${rel}: legacy chapter audit still pins chapters_in_progress`);
  }
  return problems;
}

const files = TARGET_DIRS.flatMap((dir) => walk(path.join(ROOT, dir)))
  .filter((file) => TARGET_FILE.test(relative(file)))
  .filter((file) => relative(file) !== SELF);

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
  unresolved.push(...unresolvedProblems(rel, checked));
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
