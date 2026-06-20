#!/usr/bin/env node
import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = process.cwd();

const CAREER_ID = 'naeringsliv';
const REPORT_PATH = 'docs/CIVICATION_BADGE_ROLE_MAPPING_AUDIT.md';
const BADGES_PATH = 'data/badges/naeringsliv.json';
const MAPPINGS_PATH = 'data/Civication/badgeRoleMappings.json';
const PROFILES_PATH = 'data/Civication/jobLearningProfiles.json';
const MAIL_PLANS_DIR = 'data/Civication/mailPlans/naeringsliv';
const MAIL_FAMILIES_DIR = 'data/Civication/mailFamilies/naeringsliv';

const MAIL_FAMILY_PATTERNS = [
  ['job intro', 'job', '{role_scope}_intro_v2.json'],
  ['job', 'job', '{role_scope}_job.json'],
  ['people', 'people', '{role_scope}_people.json'],
  ['story', 'story', '{role_scope}_story.json'],
  ['conflict', 'conflict', '{role_scope}_conflict.json'],
  ['event', 'event', '{role_scope}_event.json']
];

function repoPath(...segments) {
  return path.join(repoRoot, ...segments);
}


async function readJson(relativePath) {
  const fullPath = repoPath(relativePath);
  return JSON.parse(await readFile(fullPath, 'utf8'));
}

function hasOwn(object, key) {
  return Object.prototype.hasOwnProperty.call(object || {}, key);
}

function markdownCell(value) {
  const text = String(value ?? '');
  return text.replace(/\|/g, '\\|').replace(/\n/g, '<br>');
}

function statusLabel(ok, warning = false) {
  if (!ok) return 'ERROR';
  if (warning) return 'WARNING';
  return 'OK';
}

function collectAcceptedFallbackTitles(mapping) {
  const titles = new Set();
  const candidates = Array.isArray(mapping?.future_split_candidates)
    ? mapping.future_split_candidates
    : [];

  for (const candidate of candidates) {
    const candidateTitles = Array.isArray(candidate?.candidate_badge_titles)
      ? candidate.candidate_badge_titles
      : [];
    for (const title of candidateTitles) titles.add(title);
  }

  return titles;
}

function getMailFamilyPaths(roleScope) {
  return MAIL_FAMILY_PATTERNS.map(([label, directory, filePattern]) => {
    const fileName = filePattern.replace('{role_scope}', roleScope || '');
    const relativePath = `${MAIL_FAMILIES_DIR}/${directory}/${fileName}`;
    return { label, relativePath, exists: Boolean(roleScope) && existsSync(repoPath(relativePath)) };
  });
}

async function audit() {
  const badges = await readJson(BADGES_PATH);
  const mappings = await readJson(MAPPINGS_PATH);
  const profiles = await readJson(PROFILES_PATH);

  const careerMapping = mappings?.careers?.[CAREER_ID] || {};
  const roles = careerMapping.roles || {};
  const titleToRoleScope = careerMapping.title_to_role_scope || {};
  const profileMap = profiles?.profiles || {};
  const acceptedFallbackTitles = collectAcceptedFallbackTitles(careerMapping);

  const tiers = Array.isArray(badges?.tiers) ? badges.tiers : [];

  const rows = tiers.map((tier) => {
    const title = String(tier?.label || '').trim();
    const threshold = tier?.threshold;
    const titleHasMapping = hasOwn(titleToRoleScope, title);
    const roleScope = titleHasMapping ? titleToRoleScope[title] : '';
    const roleExists = Boolean(roleScope) && hasOwn(roles, roleScope);
    const roleId = roleExists ? String(roles[roleScope]?.role_id || '').trim() : '';
    const roleIdExists = Boolean(roleId);
    const profileExists = roleIdExists && hasOwn(profileMap, roleId);
    const mailPlanPath = `${MAIL_PLANS_DIR}/${roleScope}_plan.json`;
    const mailPlanExists = Boolean(roleScope) && existsSync(repoPath(mailPlanPath));
    const mailFamilies = getMailFamilyPaths(roleScope);
    const existingMailFamilies = mailFamilies.filter((family) => family.exists);
    const mailFamiliesExist = existingMailFamilies.length > 0;
    const acceptedFallback = roleScope === 'mellomleder' && acceptedFallbackTitles.has(title);

    const errors = [];
    const warnings = [];

    if (!titleHasMapping) errors.push('badge-title mangler mapping');
    if (titleHasMapping && !roleExists) errors.push(`mapping peker til role_scope uten roles-entry: ${roleScope}`);
    if (roleExists && !roleIdExists) errors.push(`mapping peker til role_scope uten role_id: ${roleScope}`);
    if (roleIdExists && !profileExists) errors.push(`role_id mangler jobLearningProfile: ${roleId}`);
    if (roleScope && !mailPlanExists) errors.push(`role_scope mangler mailPlan: ${mailPlanPath}`);
    if (roleScope && !mailFamiliesExist) errors.push('role_scope mangler alle mailFamilies');

    if (acceptedFallback) {
      warnings.push('accepted fallback: høyere eier-/kapitaltittel bruker mellomleder inntil fremtidig split');
    } else if (roleScope === 'mellomleder') {
      warnings.push('mellomleder-fallback er ikke dokumentert i future_split_candidates');
    }

    if (mailFamiliesExist && existingMailFamilies.length <= 1) {
      warnings.push(`role_scope har svært få mailFamilies (${existingMailFamilies.length})`);
    }

    const judgment = statusLabel(errors.length === 0, warnings.length > 0);

    return {
      threshold,
      title,
      titleHasMapping,
      roleScope,
      roleExists,
      roleId,
      roleIdExists,
      profileExists,
      mailPlanExists,
      mailPlanPath,
      mailFamilies,
      existingMailFamilies,
      mailFamiliesExist,
      acceptedFallback,
      errors,
      warnings,
      judgment
    };
  });

  return { rows, careerMapping };
}

function formatStatus(ok, okText = 'OK', missingText = 'Mangler') {
  return ok ? `OK (${okText})` : `ERROR (${missingText})`;
}

function buildReport({ rows, careerMapping }) {
  const errors = rows.flatMap((row) => row.errors.map((message) => ({ row, message })));
  const warnings = rows.flatMap((row) => row.warnings.map((message) => ({ row, message })));
  const acceptedFallbacks = rows.filter((row) => row.acceptedFallback);

  const lines = [];
  lines.push('# Civication badge → role_scope mapping audit');
  lines.push('');
  lines.push('Generated by `npm run civication:badge-role-audit`.');
  lines.push('');
  lines.push('## Modell');
  lines.push('');
  lines.push('- **Badge** er tittelen/progresjonen spilleren ser i karrierestigen.');
  lines.push('- **role_scope** er intern spillbar jobbtype som resolveren og mailruntime bruker for å laste riktig innhold.');
  lines.push('- **mailPlan** og **mailFamilies** er spillinnholdet som gir jobbmailflyt for en role_scope.');
  lines.push('- **jobLearningProfile** beskriver hvilken læring role_id gir.');
  lines.push('');
  lines.push('Dette betyr at flere badge-titler kan dele samme `role_scope` når de bruker samme mailhverdag og læringsprofil. Audit-scriptet kontrollerer derfor sammenhengen `badge title → role_scope → role_id → mailPlan/mailFamilies → jobLearningProfile` uten å lage nye roller, jobber eller mailer.');
  lines.push('');
  lines.push('## Næringsliv badge-titler');
  lines.push('');
  lines.push('| threshold | badge title | mapped role_scope | role_id | mailPlan status | mailFamilies status | jobLearningProfile status | vurdering |');
  lines.push('| ---: | --- | --- | --- | --- | --- | --- | --- |');

  for (const row of rows) {
    const familyLabels = row.existingMailFamilies.map((family) => family.label).join(', ');
    const familyStatus = row.mailFamiliesExist
      ? `OK (${row.existingMailFamilies.length}/${MAIL_FAMILY_PATTERNS.length}: ${familyLabels})`
      : 'ERROR (0/6)';
    const vurderingParts = [row.judgment];
    if (row.acceptedFallback) vurderingParts.push('accepted fallback');
    if (row.warnings.length && !row.acceptedFallback) vurderingParts.push(row.warnings.join('; '));
    if (row.errors.length) vurderingParts.push(row.errors.join('; '));

    lines.push(`| ${markdownCell(row.threshold)} | ${markdownCell(row.title)} | ${markdownCell(row.roleScope || '—')} | ${markdownCell(row.roleId || '—')} | ${markdownCell(formatStatus(row.mailPlanExists, row.mailPlanPath, 'mangler plan'))} | ${markdownCell(familyStatus)} | ${markdownCell(formatStatus(row.profileExists, row.roleId || 'profil funnet', 'mangler profil'))} | ${markdownCell(vurderingParts.join(' — '))} |`);
  }

  lines.push('');
  lines.push('## Accepted fallbacks');
  lines.push('');
  if (acceptedFallbacks.length === 0) {
    lines.push('Ingen accepted fallbacks funnet.');
  } else {
    lines.push('Disse høyere eier-/kapitaltitlene mapper til `mellomleder` som midlertidig fallback og er dokumentert i `badgeRoleMappings.future_split_candidates`:');
    lines.push('');
    for (const row of acceptedFallbacks) {
      lines.push(`- ${row.title} → ${row.roleScope} (${row.roleId})`);
    }
  }

  lines.push('');
  lines.push('## Errors');
  lines.push('');
  if (errors.length === 0) {
    lines.push('Ingen faktiske hull funnet.');
  } else {
    for (const { row, message } of errors) {
      lines.push(`- ${row.title}: ${message}`);
    }
  }

  lines.push('');
  lines.push('## Warnings');
  lines.push('');
  if (warnings.length === 0) {
    lines.push('Ingen warnings.');
  } else {
    for (const { row, message } of warnings) {
      lines.push(`- ${row.title}: ${message}`);
    }
  }

  lines.push('');
  lines.push('## Kilder kontrollert');
  lines.push('');
  lines.push(`- \`${BADGES_PATH}\``);
  lines.push(`- \`${MAPPINGS_PATH}\``);
  lines.push(`- \`${PROFILES_PATH}\``);
  lines.push(`- \`${MAIL_PLANS_DIR}/\``);
  lines.push(`- \`${MAIL_FAMILIES_DIR}/\``);

  const futureSplits = Array.isArray(careerMapping?.future_split_candidates)
    ? careerMapping.future_split_candidates
    : [];
  if (futureSplits.length > 0) {
    lines.push('');
    lines.push('## Future split candidates');
    lines.push('');
    for (const candidate of futureSplits) {
      const titles = Array.isArray(candidate?.candidate_badge_titles)
        ? candidate.candidate_badge_titles.join(', ')
        : '—';
      lines.push(`- ${candidate.role_scope || 'ukjent'}: ${titles}. ${candidate.reason || ''}`.trim());
    }
  }

  lines.push('');
  return lines.join('\n');
}

function printConsoleSummary(rows) {
  const errors = rows.flatMap((row) => row.errors.map((message) => `${row.title}: ${message}`));
  const warnings = rows.flatMap((row) => row.warnings.map((message) => `${row.title}: ${message}`));

  for (const row of rows) {
    const familyCount = row.existingMailFamilies.length;
    console.log(`${row.judgment}: ${row.title} -> ${row.roleScope || '—'} -> ${row.roleId || '—'} | mailPlan=${row.mailPlanExists ? 'OK' : 'ERROR'} | mailFamilies=${familyCount}/${MAIL_FAMILY_PATTERNS.length} | jobLearningProfile=${row.profileExists ? 'OK' : 'ERROR'}`);
  }

  if (warnings.length > 0) {
    console.warn('\nWarnings:');
    for (const warning of warnings) console.warn(`- ${warning}`);
  }

  if (errors.length > 0) {
    console.error('\nErrors:');
    for (const error of errors) console.error(`- ${error}`);
  }

  console.log(`\nReport written to ${REPORT_PATH}`);

  return { errors, warnings };
}

try {
  const result = await audit();
  const report = buildReport(result);
  await mkdir(repoPath(path.dirname(REPORT_PATH)), { recursive: true });
  await writeFile(repoPath(REPORT_PATH), report, 'utf8');

  const { errors, warnings } = printConsoleSummary(result.rows);
  if (errors.length > 0) process.exit(1);
  console.log(`Civication badge-role audit passed with ${warnings.length} warning(s).`);
} catch (error) {
  console.error('Civication badge-role audit failed with an unexpected error:');
  console.error(error);
  process.exit(1);
}
