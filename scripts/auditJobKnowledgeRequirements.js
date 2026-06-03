#!/usr/bin/env node
// scripts/auditJobKnowledgeRequirements.js
//
// Validates data/Civication/jobKnowledgeRequirements.json — the knowledge-gate side of
// the dual-gate job eligibility model. Keeps the contract small and safe:
//   - valid JSON with schema/version
//   - categories is an object; each category has a known mode
//   - requirements have a supported type and well-formed fields
//   - category ids referenced by requirements are real History Go quiz categories
//     (discovered from data/quiz/*.json categoryId values)
//   - no `required` mode is used with a requirement the runtime cannot safely evaluate
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const requirementsPath = path.join(root, 'data/Civication/jobKnowledgeRequirements.json');
const quizDir = path.join(root, 'data/quiz');

const VALID_MODES = new Set(['not_required', 'soft_required', 'required']);
// Requirement types the runtime can actually evaluate against existing state.
const EVALUABLE_TYPES = new Set(['category_quiz_count']);

function relativePath(filePath) {
  return path.relative(root, filePath).split(path.sep).join('/');
}

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

// Discover real History Go quiz category ids from data/quiz/*.json "categoryId" values.
// Best-effort: if the directory is missing/unreadable we skip the cross-check (warn).
function discoverQuizCategories() {
  const categories = new Set();
  function walk(dir) {
    let entries;
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch (_e) {
      return;
    }
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full);
        continue;
      }
      if (!/\.json$/.test(entry.name)) continue;
      let raw;
      try {
        raw = fs.readFileSync(full, 'utf8');
      } catch (_e) {
        continue;
      }
      const re = /"categoryId"\s*:\s*"([^"]+)"/g;
      let m;
      while ((m = re.exec(raw)) !== null) {
        const cat = String(m[1] || '').trim().toLowerCase();
        if (cat) categories.add(cat);
      }
    }
  }
  walk(quizDir);
  return categories;
}

function validateRequirement(scopeLabel, requirement, mode, knownCategories, errors, warnings) {
  if (!isPlainObject(requirement)) {
    errors.push(`${scopeLabel}: requirement must be an object`);
    return;
  }
  const type = String(requirement.type || '').trim();
  if (!type) {
    errors.push(`${scopeLabel}: requirement is missing a type`);
    return;
  }
  if (!EVALUABLE_TYPES.has(type)) {
    // Unknown types are tolerated by the runtime (resolve to "unknown"), but they can
    // never be safely confirmed missing — so they must not appear under `required`.
    if (mode === 'required') {
      errors.push(`${scopeLabel}: type "${type}" cannot be safely evaluated, so it must not be used with mode "required"`);
    } else {
      warnings.push(`${scopeLabel}: type "${type}" is not evaluated yet; it will resolve to "unknown"`);
    }
    return;
  }

  if (type === 'category_quiz_count') {
    const category = String(requirement.category || '').trim().toLowerCase();
    if (!category) {
      errors.push(`${scopeLabel}: category_quiz_count requires a "category"`);
    } else if (knownCategories && knownCategories.size > 0 && !knownCategories.has(category)) {
      errors.push(`${scopeLabel}: category "${category}" is not a known History Go quiz category`);
    }
    if (typeof requirement.min_completed !== 'number' || !Number.isFinite(requirement.min_completed) || requirement.min_completed < 1) {
      errors.push(`${scopeLabel}: category_quiz_count requires a numeric "min_completed" >= 1`);
    }
  }
}

function validateScope(kind, key, cfg, knownCategories, errors, warnings) {
  const scopeLabel = `${kind} "${key}"`;
  if (!isPlainObject(cfg)) {
    errors.push(`${scopeLabel}: expected an object`);
    return;
  }
  const mode = String(cfg.mode || '').trim();
  if (!mode) {
    errors.push(`${scopeLabel}: missing "mode"`);
  } else if (!VALID_MODES.has(mode)) {
    errors.push(`${scopeLabel}: unknown mode "${mode}"`);
  }
  if (Object.prototype.hasOwnProperty.call(cfg, 'requirements')) {
    if (!Array.isArray(cfg.requirements)) {
      errors.push(`${scopeLabel}: "requirements" must be an array`);
    } else {
      cfg.requirements.forEach((req, idx) => {
        validateRequirement(`${scopeLabel} requirement[${idx}]`, req, mode, knownCategories, errors, warnings);
      });
    }
  } else if (mode && mode !== 'not_required') {
    warnings.push(`${scopeLabel}: mode "${mode}" without any requirements has no effect`);
  }
}

function run() {
  const errors = [];
  const warnings = [];

  if (!fs.existsSync(requirementsPath)) {
    errors.push(`Missing knowledge requirements file: ${relativePath(requirementsPath)}`);
    return { errors, warnings, categoriesChecked: 0, rolesChecked: 0 };
  }

  let doc;
  try {
    doc = JSON.parse(fs.readFileSync(requirementsPath, 'utf8'));
  } catch (e) {
    errors.push(`Invalid JSON in ${relativePath(requirementsPath)}: ${e.message}`);
    return { errors, warnings, categoriesChecked: 0, rolesChecked: 0 };
  }

  if (!isPlainObject(doc)) {
    errors.push('Top-level value must be an object');
    return { errors, warnings, categoriesChecked: 0, rolesChecked: 0 };
  }
  if (typeof doc.schema !== 'string' || !doc.schema.trim()) {
    errors.push('Missing or empty "schema"');
  }
  if (typeof doc.version !== 'number' || !Number.isFinite(doc.version)) {
    errors.push('Missing or invalid "version" (expected number)');
  }
  if (!isPlainObject(doc.categories)) {
    errors.push('"categories" must be an object');
  }
  if (Object.prototype.hasOwnProperty.call(doc, 'roles') && !isPlainObject(doc.roles)) {
    errors.push('"roles" must be an object when present');
  }
  if (Object.prototype.hasOwnProperty.call(doc, 'default') && !isPlainObject(doc.default)) {
    errors.push('"default" must be an object when present');
  }

  const knownCategories = discoverQuizCategories();
  if (knownCategories.size === 0) {
    warnings.push('Could not discover History Go quiz categories from data/quiz; skipping category-id cross-check');
  }

  let categoriesChecked = 0;
  let rolesChecked = 0;

  if (isPlainObject(doc.categories)) {
    for (const [key, cfg] of Object.entries(doc.categories)) {
      categoriesChecked += 1;
      validateScope('category', key, cfg, knownCategories, errors, warnings);
    }
  }
  if (isPlainObject(doc.roles)) {
    for (const [key, cfg] of Object.entries(doc.roles)) {
      rolesChecked += 1;
      validateScope('role', key, cfg, knownCategories, errors, warnings);
    }
  }

  return { errors, warnings, categoriesChecked, rolesChecked };
}

try {
  const { errors, warnings, categoriesChecked, rolesChecked } = run();

  for (const warning of warnings) {
    console.warn(`Warning: ${warning}`);
  }

  if (errors.length) {
    console.error('Job Knowledge Requirements audit failed:');
    for (const error of errors) {
      console.error(`- ${error}`);
    }
    process.exit(1);
  }

  console.log(`Job Knowledge Requirements audit passed: ${categoriesChecked} categories checked, ${rolesChecked} roles checked.`);
} catch (error) {
  console.error('Job Knowledge Requirements audit failed with an unexpected error:');
  console.error(error);
  process.exit(1);
}
