#!/usr/bin/env node
// FWG-governance-audit (report-only).
//
// Leser hver workGrammar/FWG-fil og sjekker at mailFamilies faktisk styres av
// stillingsgrammatikken: dekker mailene grammatikkens steder, aktører,
// konflikter, løsnings-/feilmønstre, obligatoriske akser og minimumsvolum?
//
// Dette er en audit/statusoversikt. Den endrer ikke runtime eller UI og feiler
// ALDRI bygget (exit 0), med mindre en datafil er ugyldig JSON. Avvik
// rapporteres som lesbar markdown slik at FWG kan brukes til å heve
// mailkvaliteten i stedet for å ligge dekorativt ved siden av systemet.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');

const ROLE_TYPES = ['job', 'people', 'conflict', 'story', 'event', 'micro', 'followup', 'knowledge', 'consequence'];

function exists(rel) {
  return fs.existsSync(path.join(repoRoot, rel));
}
function readJson(rel) {
  return JSON.parse(fs.readFileSync(path.join(repoRoot, rel), 'utf8'));
}
function walk(dir) {
  const full = path.join(repoRoot, dir);
  if (!fs.existsSync(full)) return [];
  const out = [];
  for (const entry of fs.readdirSync(full, { withFileTypes: true })) {
    const rel = path.join(dir, entry.name).replaceAll(path.sep, '/');
    if (entry.isDirectory()) out.push(...walk(rel));
    else out.push(rel);
  }
  return out;
}
function uniqueSorted(values) {
  return [...new Set(values.filter(v => v !== undefined && v !== null && v !== ''))].sort((a, b) => String(a).localeCompare(String(b), 'nb'));
}
function senderOf(mail) {
  return mail.person_id || mail.sender || mail.from || '';
}

// Samler alle mailer (og thread-rotmailer) for en rolle, gruppert per type.
function collectRole(fwg) {
  const category = fwg.category;
  const roleScope = fwg.role_scope;
  const catalogs = [];
  for (const type of ROLE_TYPES) {
    const rel = `data/Civication/mailFamilies/${category}/${type}/${roleScope}_${type}.json`;
    if (!exists(rel)) {
      catalogs.push({ type, rel, present: false, families: [], mails: [], threadCount: 0 });
      continue;
    }
    const json = readJson(rel);
    const families = Array.isArray(json.families) ? json.families : [];
    const mails = families.flatMap(f => (Array.isArray(f.mails) ? f.mails : []));
    const threadCount = families.reduce((sum, f) => sum + (Array.isArray(f.threads) ? f.threads.length : 0), 0);
    catalogs.push({ type, rel, present: true, families, mails, threadCount });
  }
  const allMails = catalogs.flatMap(c => c.mails);
  const familyIds = new Set(catalogs.flatMap(c => c.families.map(f => f.id)));
  return { category, roleScope, catalogs, allMails, familyIds };
}

// --- Sjekkene. Hver returnerer { dimension, status, findings: string[] } ---

function checkMinimumCounts(fwg, role) {
  const minimums = fwg.mail_generation_contract?.minimum_counts || {};
  const findings = [];
  for (const type of Object.keys(minimums).sort()) {
    const min = minimums[type];
    const catalog = role.catalogs.find(c => c.type === type);
    const count = (catalog?.mails.length || 0) + (catalog?.threadCount || 0);
    if (count < min) findings.push(`${type}: ${count}/${min} mailer (mangler ${min - count})`);
  }
  return { dimension: 'minimum_counts', status: findings.length ? 'avvik' : 'ok', findings };
}

function checkRequiredAxes(fwg, role) {
  const axes = fwg.mail_generation_contract?.required_axes || [];
  if (!axes.length) return { dimension: 'required_axes', status: 'n/a', findings: [] };
  const total = role.allMails.length;
  const findings = [];
  for (const axis of [...axes].sort((a, b) => String(a).localeCompare(String(b)))) {
    let present = 0;
    for (const mail of role.allMails) {
      const value = mail[axis];
      const empty = value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0);
      if (!empty) present += 1;
    }
    if (present === 0) {
      // Aksen finnes ikke som felt på noen mail. Da er den trolig ment som et
      // tematisk konsept, ikke en kolonne — eller required_axes peker feil.
      findings.push(`akse '${axis}' finnes ikke som felt på noen mail (FWG bruker den trolig som tema, ikke kolonne — avklar required_axes-semantikk mot Arealplanlegger-referansen)`);
    } else if (present < total) {
      findings.push(`${axis}: mangler i ${total - present} av ${total} mail(er)`);
    }
  }
  return { dimension: 'required_axes', status: findings.length ? 'avvik' : 'ok', findings };
}

function checkPlaceGrammar(fwg, role) {
  const declared = uniqueSorted((fwg.place_grammar || []).map(p => p.place_id));
  if (!declared.length) return { dimension: 'place_grammar', status: 'n/a', findings: [] };
  const used = new Set(role.allMails.map(m => m.place_id).filter(Boolean));
  const findings = [];
  for (const place of declared) {
    if (!used.has(place)) findings.push(`ubrukt sted i grammatikken: ${place} (ingen mail forankret her)`);
  }
  for (const place of uniqueSorted([...used])) {
    if (!declared.includes(place)) findings.push(`udeklarert sted i mail: ${place} (ikke i place_grammar)`);
  }
  return { dimension: 'place_grammar', status: findings.length ? 'avvik' : 'ok', findings };
}

function checkActorGrammar(fwg, role) {
  const actors = fwg.actor_grammar || [];
  if (!actors.length) return { dimension: 'actor_grammar', status: 'n/a', findings: [] };
  const sendersByType = new Map(); // example_id -> Set(mail_type)
  for (const mail of role.allMails) {
    const s = senderOf(mail);
    if (!s) continue;
    if (!sendersByType.has(s)) sendersByType.set(s, new Set());
    if (mail.mail_type) sendersByType.get(s).add(mail.mail_type);
  }
  const findings = [];
  for (const actor of actors) {
    const id = actor.example_id;
    if (!id) {
      findings.push(`aktørtype uten example_id: ${actor.actor_type || '(ukjent)'}`);
      continue;
    }
    if (!sendersByType.has(id)) {
      findings.push(`ubrukt aktør-eksempel: ${id} (${actor.actor_type || '?'}) dukker ikke opp som avsender`);
      continue;
    }
    const allowed = actor.can_send_mail_types;
    if (Array.isArray(allowed) && allowed.length) {
      const used = [...sendersByType.get(id)];
      const offTypes = used.filter(t => !allowed.includes(t));
      if (offTypes.length) {
        findings.push(`aktør ${id} sender mailtyper utenfor can_send_mail_types: ${uniqueSorted(offTypes).join(', ')} (tillatt: ${allowed.join(', ')})`);
      }
    }
  }
  return { dimension: 'actor_grammar', status: findings.length ? 'avvik' : 'ok', findings };
}

function checkConflictGrammar(fwg, role) {
  const conflicts = fwg.conflict_grammar || [];
  if (!conflicts.length) return { dimension: 'conflict_grammar', status: 'n/a', findings: [] };
  const findings = [];
  // 1. Konfliktfamilier nevnt i grammatikken bør finnes som faktiske family-ider.
  for (const conflict of conflicts) {
    for (const fam of conflict.mail_families || []) {
      if (!role.familyIds.has(fam)) findings.push(`konfliktfamilie mangler: ${fam} (nevnt i ${conflict.id})`);
    }
  }
  // 2. Hver conflict-mails pressure bør være forankret i en konfliktakse/-id.
  const anchors = new Set([...conflicts.map(c => c.id), ...conflicts.map(c => c.axis)].filter(Boolean));
  const conflictCatalog = role.catalogs.find(c => c.type === 'conflict');
  for (const mail of conflictCatalog?.mails || []) {
    if (mail.pressure && !anchors.has(mail.pressure)) {
      findings.push(`konflikt-mail ${mail.id} har pressure '${mail.pressure}' uten forankring i conflict_grammar`);
    }
  }
  return { dimension: 'conflict_grammar', status: findings.length ? 'avvik' : 'ok', findings };
}

function checkSolutionPatterns(fwg, role) {
  const patterns = fwg.solution_patterns || [];
  if (!patterns.length) return { dimension: 'solution_patterns', status: 'n/a', findings: [] };
  const declaredTags = uniqueSorted(patterns.flatMap(p => p.choice_tags || []));
  if (!declaredTags.length) return { dimension: 'solution_patterns', status: 'n/a', findings: [] };
  const usedTags = new Set(role.allMails.flatMap(m => (m.choices || []).flatMap(c => c.tags || [])));
  const findings = [];
  for (const tag of declaredTags) {
    if (!usedTags.has(tag)) findings.push(`ubrukt løsningsmønster-tag: ${tag} (ingen valg bruker den)`);
  }
  return { dimension: 'solution_patterns', status: findings.length ? 'avvik' : 'ok', findings };
}

function checkFailurePatterns(fwg, role) {
  const patterns = fwg.failure_patterns || [];
  if (!patterns.length) return { dimension: 'failure_patterns', status: 'n/a', findings: [] };
  const hooks = uniqueSorted(patterns.flatMap(p => p.followup_hooks || []));
  if (!hooks.length) return { dimension: 'failure_patterns', status: 'n/a', findings: [] };
  // En hook regnes som brukt hvis den dukker opp som family-id, mail-id eller
  // som mål i triggers_on_choice.
  const triggerTargets = new Set(role.allMails.flatMap(m => {
    const t = m.triggers_on_choice;
    if (!t || typeof t !== 'object') return [];
    return Object.values(t).flat();
  }));
  const mailIds = new Set(role.allMails.map(m => m.id));
  const findings = [];
  for (const hook of hooks) {
    const used = role.familyIds.has(hook) || mailIds.has(hook) || triggerTargets.has(hook);
    if (!used) findings.push(`ubrukt feilmønster-hook: ${hook} (ingen family/mail/trigger peker hit)`);
  }
  return { dimension: 'failure_patterns', status: findings.length ? 'avvik' : 'ok', findings };
}

const CHECKS = [
  checkMinimumCounts,
  checkRequiredAxes,
  checkPlaceGrammar,
  checkActorGrammar,
  checkConflictGrammar,
  checkSolutionPatterns,
  checkFailurePatterns,
];

function auditRole(fwgRel) {
  const fwg = readJson(fwgRel);
  const role = collectRole(fwg);
  const results = CHECKS.map(check => check(fwg, role));
  return { fwgRel, fwg, role, results };
}

// --- Rapport ---

const workGrammarFiles = walk('data/Civication/workGrammars')
  .filter(f => f.endsWith('.json'))
  .sort();

const audited = workGrammarFiles.map(auditRole);

const lines = [];
lines.push('# Civication FWG Governance Audit');
lines.push('');
lines.push('Generert av `node scripts/audit-civication-fwg-governance.mjs`. Rapporten er report-only: den endrer ikke runtime eller UI og feiler ikke bygget. Den viser om stillingsgrammatikken (FWG) faktisk styrer mailFamilies.');
lines.push('');
lines.push('Dimensjoner: `minimum_counts`, `required_axes`, `place_grammar`, `actor_grammar`, `conflict_grammar`, `solution_patterns`, `failure_patterns`. `n/a` betyr at FWG-fila ikke deklarerer den dimensjonen.');
lines.push('');

const totalDeviations = audited.reduce((sum, a) => sum + a.results.reduce((s, r) => s + r.findings.length, 0), 0);
lines.push('## Sammendrag');
lines.push('');
lines.push(`- FWG-filer auditert: ${audited.length}`);
lines.push(`- Totalt antall avvik: ${totalDeviations}`);
lines.push('');

const dimHeader = ['rolle', 'category', ...CHECKS.map((_, i) => audited[0]?.results[i]?.dimension).filter(Boolean)];
if (audited.length) {
  const dims = audited[0].results.map(r => r.dimension);
  lines.push('## Statusmatrise');
  lines.push('');
  lines.push(`| rolle | category | ${dims.join(' | ')} |`);
  lines.push(`| ${['---', '---', ...dims.map(() => '---')].join(' | ')} |`);
  for (const a of audited) {
    const cells = a.results.map(r => {
      if (r.status === 'n/a') return 'n/a';
      if (r.status === 'ok') return '✅';
      return `⚠️ ${r.findings.length}`;
    });
    lines.push(`| ${a.role.roleScope} | ${a.role.category} | ${cells.join(' | ')} |`);
  }
  lines.push('');
}

lines.push('## Detaljer');
lines.push('');
for (const a of audited) {
  lines.push(`### ${a.fwg.title || a.role.roleScope} (\`${a.role.category}/${a.role.roleScope}\`)`);
  lines.push('');
  lines.push(`Kilde: \`${a.fwgRel}\``);
  lines.push('');
  const anyFindings = a.results.some(r => r.findings.length);
  if (!anyFindings) {
    lines.push('Ingen avvik. FWG styrer mailFamilies på alle deklarerte dimensjoner. ✅');
    lines.push('');
    continue;
  }
  for (const r of a.results) {
    if (!r.findings.length) continue;
    lines.push(`- **${r.dimension}** (${r.findings.length}):`);
    for (const f of r.findings) lines.push(`  - ${f}`);
  }
  lines.push('');
}

const markdown = `${lines.join('\n')}\n`;
fs.mkdirSync(path.join(repoRoot, 'reports'), { recursive: true });
fs.writeFileSync(path.join(repoRoot, 'reports/civication-fwg-governance.md'), markdown);
fs.writeFileSync(path.join(repoRoot, 'docs/CIVICATION_FWG_GOVERNANCE.md'), markdown);
console.log(`FWG governance audit: ${audited.length} rolle(r), ${totalDeviations} avvik. Skrev docs/CIVICATION_FWG_GOVERNANCE.md og reports/civication-fwg-governance.md`);
