#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const rolesDir = path.join(root, 'data/Civication/roles');
const profilesPath = path.join(root, 'data/Civication/jobLearningProfiles.json');

const requiredWrapperKeys = ['schema', 'version', 'note', 'field_docs', 'default', 'profiles'];
const requiredProfileKeys = [
  'learning_value',
  'teaches',
  'mastery_threshold',
  'usefulness',
  'transferable_skills',
  'dead_end_risk'
];
const rankedValues = new Set(['high', 'standard', 'low']);
const deadEndRiskValues = new Set(['low', 'medium', 'high']);

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function relativePath(filePath) {
  return path.relative(root, filePath).split(path.sep).join('/');
}

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function nonEmptyStrings(value) {
  return Array.isArray(value) && value.every(item => typeof item === 'string' && item.trim().length > 0);
}

function validateProfile(roleId, profile, errors, warnings) {
  if (!isPlainObject(profile)) {
    errors.push(`Invalid job learning profile for ${roleId}: expected object`);
    return;
  }

  for (const key of requiredProfileKeys) {
    if (!Object.prototype.hasOwnProperty.call(profile, key)) {
      errors.push(`Missing ${key} for ${roleId}`);
    }
  }

  if (Object.prototype.hasOwnProperty.call(profile, 'learning_value') && !rankedValues.has(profile.learning_value)) {
    errors.push(`Unknown learning_value for ${roleId}: ${JSON.stringify(profile.learning_value)}`);
  }

  if (Object.prototype.hasOwnProperty.call(profile, 'usefulness') && !rankedValues.has(profile.usefulness)) {
    errors.push(`Unknown usefulness for ${roleId}: ${JSON.stringify(profile.usefulness)}`);
  }

  if (Object.prototype.hasOwnProperty.call(profile, 'dead_end_risk')) {
    const risk = profile.dead_end_risk;
    const validNumericRisk = typeof risk === 'number' && Number.isFinite(risk) && risk >= 0 && risk <= 1;
    if (!(deadEndRiskValues.has(risk) || validNumericRisk)) {
      errors.push(`Unknown dead_end_risk for ${roleId}: ${JSON.stringify(risk)}`);
    }
  }

  if (Object.prototype.hasOwnProperty.call(profile, 'mastery_threshold')) {
    if (typeof profile.mastery_threshold !== 'number' || !Number.isFinite(profile.mastery_threshold)) {
      errors.push(`Invalid mastery_threshold for ${roleId}: expected number`);
    } else if (profile.mastery_threshold < 1) {
      errors.push(`Invalid mastery_threshold for ${roleId}: expected at least 1`);
    }
  }

  if (Object.prototype.hasOwnProperty.call(profile, 'teaches')) {
    if (!Array.isArray(profile.teaches) || !profile.teaches.every(item => typeof item === 'string')) {
      errors.push(`Invalid teaches for ${roleId}: expected array of strings`);
    } else if (!nonEmptyStrings(profile.teaches) || profile.teaches.length < 3) {
      errors.push(`Invalid teaches for ${roleId}: expected at least 3 non-empty strings`);
    } else if (profile.teaches.length > 6) {
      warnings.push(`Warning for ${roleId}: teaches has ${profile.teaches.length} items; runtime/view model shows at most 6`);
    }
  }

  if (Object.prototype.hasOwnProperty.call(profile, 'transferable_skills')) {
    if (!Array.isArray(profile.transferable_skills) || !profile.transferable_skills.every(item => typeof item === 'string')) {
      errors.push(`Invalid transferable_skills for ${roleId}: expected array of strings`);
    } else if (!nonEmptyStrings(profile.transferable_skills) || profile.transferable_skills.length < 3) {
      errors.push(`Invalid transferable_skills for ${roleId}: expected at least 3 non-empty strings`);
    }
  }
}

function run() {
  const errors = [];
  const warnings = [];

  if (!fs.existsSync(rolesDir)) {
    errors.push(`Missing roles directory: ${relativePath(rolesDir)}`);
  }
  if (!fs.existsSync(profilesPath)) {
    errors.push(`Missing job learning profiles file: ${relativePath(profilesPath)}`);
  }
  if (errors.length) return { errors, warnings, rolesChecked: 0, profilesFound: 0 };

  const roleFiles = fs.readdirSync(rolesDir)
    .filter(file => /^naer_.*\.json$/.test(file))
    .sort()
    .map(file => path.join(rolesDir, file));

  const profilesDocument = readJson(profilesPath);
  for (const key of requiredWrapperKeys) {
    if (!Object.prototype.hasOwnProperty.call(profilesDocument, key)) {
      errors.push(`Missing wrapper key in jobLearningProfiles.json: ${key}`);
    }
  }
  if (!isPlainObject(profilesDocument.profiles)) {
    errors.push('Invalid jobLearningProfiles.json: profiles must be an object');
  }

  let profilesFound = 0;
  for (const roleFile of roleFiles) {
    const role = readJson(roleFile);
    const roleId = typeof role.role_id === 'string' ? role.role_id.trim() : '';
    if (!roleId) {
      errors.push(`Missing role_id in ${relativePath(roleFile)}`);
      continue;
    }

    const profile = isPlainObject(profilesDocument.profiles) ? profilesDocument.profiles[roleId] : undefined;
    if (profile === undefined) {
      errors.push(`Missing job learning profile for role_id: ${roleId}`);
      continue;
    }

    profilesFound += 1;
    validateProfile(roleId, profile, errors, warnings);
  }

  return { errors, warnings, rolesChecked: roleFiles.length, profilesFound };
}

try {
  const { errors, warnings, rolesChecked, profilesFound } = run();

  for (const warning of warnings) {
    console.warn(warning);
  }

  if (errors.length) {
    console.error('Job Learning Profiles audit failed:');
    for (const error of errors) {
      console.error(`- ${error}`);
    }
    process.exit(1);
  }

  console.log(`Job Learning Profiles audit passed: ${rolesChecked} roles checked, ${profilesFound} profiles found.`);
} catch (error) {
  console.error('Job Learning Profiles audit failed with an unexpected error:');
  console.error(error);
  process.exit(1);
}
