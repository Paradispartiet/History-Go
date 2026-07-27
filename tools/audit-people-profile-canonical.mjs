import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

export const STANDARD_VERSION = 'people_profile_v1.0';
export const VALIDATOR_VERSION = '1.0.0';

const STRONG_TERMS = [
  'første', 'eneste', 'yngste', 'eldste', 'største', 'viktigste',
  'ledende', 'fremste', 'sentral', 'bærende', 'særlig kjent for',
  'hovedverk', 'glansrolle', 'gjennombrudd', 'legendarisk',
  'banebrytende', 'revolusjonerte', 'endret for alltid',
  'førte til', 'på grunn av', 'dermed', 'var årsaken til',
];

const CURRENT_TERMS = [
  'er ansatt', 'arbeider ved', 'leder', 'bor', 'spiller nå', 'er teatersjef',
];

const READY_STATUS = 'ready_people_v1';
const ALLOWED_PUBLICATION_DECISIONS = new Set([
  'omit',
  'publish_common_secure_part',
  'publish_with_qualification',
  'prefer_primary_source',
  'unresolved_blocking',
]);

function text(value) {
  return String(value ?? '').trim();
}

function record(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
}

function array(value) {
  return Array.isArray(value) ? value : [];
}

function parseDate(value) {
  const raw = text(value);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) return null;
  const date = new Date(`${raw}T00:00:00Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function splitSentences(value) {
  const content = text(value);
  if (!content) return [];
  if (typeof Intl?.Segmenter === 'function') {
    const segmenter = new Intl.Segmenter('nb', { granularity: 'sentence' });
    return [...segmenter.segment(content)]
      .map((entry) => entry.segment.trim())
      .filter(Boolean);
  }
  return content
    .split(/(?<=[.!?])(?:\s+|$)/u)
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function containsTerm(sentence, terms) {
  const lower = sentence.toLocaleLowerCase('nb');
  return terms.some((term) => lower.includes(term));
}

function daysBetween(later, earlier) {
  return Math.floor((later.getTime() - earlier.getTime()) / 86_400_000);
}

function claimUsableForPublication(claim) {
  if (claim.status === 'verified') return true;
  if (claim.status !== 'source_conflict') return false;
  return ['publish_common_secure_part', 'publish_with_qualification', 'prefer_primary_source']
    .includes(claim.publication_decision);
}

function expectedFieldPaths(profile) {
  const paths = [];
  for (const field of [
    'name',
    'kindLabel',
    'birth_date',
    'death_date',
    'birth_place',
    'active_place',
    'year',
    'placeId',
  ]) {
    if (Object.hasOwn(profile, field) && profile[field] !== null && profile[field] !== '') paths.push(field);
  }

  array(profile.places).forEach((placeId) => {
    if (text(placeId)) paths.push(`places[${text(placeId)}]`);
  });

  array(profile.education).forEach((entry, index) => {
    if (text(entry)) paths.push(`education[${index}]`);
  });

  array(profile.works).forEach((rawWork, index) => {
    const work = record(rawWork);
    const selector = text(work.id) ? `id=${text(work.id)}` : `index=${index}`;
    for (const field of ['title', 'year', 'date', 'material', 'role', 'place', 'location', 'summary']) {
      if (Object.hasOwn(work, field) && work[field] !== null && work[field] !== '') {
        paths.push(`works[${selector}].${field}`);
      }
    }
  });

  return paths;
}

function validateVerifiedClaim(claim, errors, prefix) {
  if (!/^https?:\/\//i.test(text(claim.source_url))) {
    errors.push(`${prefix}: verified claim mangler inspectable source_url`);
  }
  if (!text(claim.source_location)) {
    errors.push(`${prefix}: verified claim mangler source_location`);
  }
  if (!text(claim.source_type)) {
    errors.push(`${prefix}: verified claim mangler source_type`);
  }
  if (!text(claim.temporal_status)) {
    errors.push(`${prefix}: verified claim mangler temporal_status`);
  }
  if (!parseDate(claim.verified_at)) {
    errors.push(`${prefix}: verified claim mangler gyldig verified_at`);
  }
  if (!['direct', 'explicit', 'qualified'].includes(text(claim.evidence_level))) {
    errors.push(`${prefix}: verified claim mangler gyldig evidence_level`);
  }
}

function validateSourceConflict(claim, errors, prefix) {
  if (array(claim.sources).length < 2) {
    errors.push(`${prefix}: source_conflict krever minst to kilder`);
  }
  if (!ALLOWED_PUBLICATION_DECISIONS.has(text(claim.publication_decision))) {
    errors.push(`${prefix}: source_conflict mangler gyldig publication_decision`);
  }
}

export function validatePeopleClaimsDocument(document, profile, options = {}) {
  const errors = [];
  const doc = record(document);
  const person = record(profile);
  const now = options.now instanceof Date ? options.now : new Date();
  const prefix = text(doc.person_id) || '(ukjent person)';

  if (doc.schema !== 'history_go_people_claims_v1') errors.push(`${prefix}: feil schema`);
  if (doc.version !== '1.0.0') errors.push(`${prefix}: feil claims-versjon`);
  if (!text(doc.person_id)) errors.push(`${prefix}: person_id mangler`);
  if (!text(doc.profile_file)) errors.push(`${prefix}: profile_file mangler`);
  if (text(person.id) !== text(doc.person_id)) errors.push(`${prefix}: person_id matcher ikke profile.id`);

  const identity = record(doc.identity);
  if (!text(identity.canonical_identity)) errors.push(`${prefix}: canonical_identity mangler`);
  if (!['verified', 'identity_unresolved', 'metadata_correction_required'].includes(text(identity.identity_status))) {
    errors.push(`${prefix}: ugyldig identity_status`);
  }

  const claims = array(doc.claims).map(record);
  const claimById = new Map();
  for (const claim of claims) {
    const id = text(claim.id);
    if (!id) {
      errors.push(`${prefix}: claim uten id`);
      continue;
    }
    if (claimById.has(id)) errors.push(`${prefix}: duplikat claim-id ${id}`);
    claimById.set(id, claim);
    if (!text(claim.claim)) errors.push(`${prefix}/${id}: claim-tekst mangler`);
    if (!['verified', 'source_conflict', 'rejected', 'insufficient_support'].includes(text(claim.status))) {
      errors.push(`${prefix}/${id}: ugyldig claim-status`);
    }
    if (claim.status === 'verified') validateVerifiedClaim(claim, errors, `${prefix}/${id}`);
    if (claim.status === 'source_conflict') validateSourceConflict(claim, errors, `${prefix}/${id}`);
  }

  const validateClaimRefs = (claimIds, location) => {
    for (const rawId of array(claimIds)) {
      const id = text(rawId);
      const claim = claimById.get(id);
      if (!claim) {
        errors.push(`${prefix}: ${location} refererer ukjent claim ${id}`);
        continue;
      }
      if (!claimUsableForPublication(claim)) {
        errors.push(`${prefix}: ${location} refererer ikke-publiserbart claim ${id}`);
      }
    }
  };

  const fieldMap = record(doc.field_claim_map);
  for (const [fieldPath, claimIds] of Object.entries(fieldMap)) {
    if (!array(claimIds).length) errors.push(`${prefix}: ${fieldPath} mangler claim-referanser`);
    validateClaimRefs(claimIds, fieldPath);
  }

  const completion = record(doc.completion);
  const currentStatus = text(completion.current_status);
  const ready = currentStatus === READY_STATUS;

  if (ready) {
    if (identity.identity_status !== 'verified') {
      errors.push(`${prefix}: ready_people_v1 krever verified identitet`);
    }
    if (person.profileStandard !== STANDARD_VERSION) {
      errors.push(`${prefix}: ready_people_v1 krever profileStandard ${STANDARD_VERSION}`);
    }
    if (!text(person.claimsFile)) {
      errors.push(`${prefix}: ready_people_v1 krever claimsFile`);
    }
    if (text(person.claimsFile) !== text(options.claimsPath ?? person.claimsFile)) {
      errors.push(`${prefix}: profile.claimsFile matcher ikke claims-filen`);
    }
    if (person.profileStatus !== READY_STATUS) {
      errors.push(`${prefix}: profileStatus må være ${READY_STATUS}`);
    }
    if (completion.completed_under !== STANDARD_VERSION) {
      errors.push(`${prefix}: completed_under må være ${STANDARD_VERSION}`);
    }
    if (completion.fact_review !== 'passed') errors.push(`${prefix}: fact_review må være passed`);
    if (completion.editorial_review !== 'passed') errors.push(`${prefix}: editorial_review må være passed`);
    if (completion.validator_version !== VALIDATOR_VERSION) {
      errors.push(`${prefix}: validator_version må være ${VALIDATOR_VERSION}`);
    }

    for (const fieldPath of expectedFieldPaths(person)) {
      if (!array(fieldMap[fieldPath]).length) {
        errors.push(`${prefix}: publisert felt mangler claim-mapping: ${fieldPath}`);
      }
    }
  }

  const sentenceMap = record(doc.sentence_claim_map);
  for (const surface of ['desc', 'popupDesc']) {
    const sentences = splitSentences(person[surface]);
    const mappings = array(sentenceMap[surface]).map(record);
    const byNumber = new Map();
    for (const mapping of mappings) {
      const number = Number(mapping.sentence);
      if (!Number.isInteger(number) || number < 1) {
        errors.push(`${prefix}: ${surface} har ugyldig setningsnummer`);
        continue;
      }
      if (byNumber.has(number)) errors.push(`${prefix}: ${surface} har duplikat mapping for setning ${number}`);
      byNumber.set(number, mapping);
      if (!array(mapping.claim_ids).length) errors.push(`${prefix}: ${surface} setning ${number} mangler claims`);
      validateClaimRefs(mapping.claim_ids, `${surface} setning ${number}`);
    }

    if (ready && mappings.length !== sentences.length) {
      errors.push(`${prefix}: ${surface} har ${sentences.length} setninger, men ${mappings.length} mappings`);
    }

    sentences.forEach((sentence, index) => {
      const number = index + 1;
      const mapping = byNumber.get(number);
      if (ready && !mapping) {
        errors.push(`${prefix}: ${surface} setning ${number} mangler mapping`);
        return;
      }
      if (!mapping) return;
      const mappedClaims = array(mapping.claim_ids).map((id) => claimById.get(text(id))).filter(Boolean);
      if (containsTerm(sentence, STRONG_TERMS) && !mappedClaims.some((claim) => claim.evidence_level === 'explicit')) {
        errors.push(`${prefix}: sterk påstand i ${surface} setning ${number} mangler explicit claim`);
      }
      if (containsTerm(sentence, CURRENT_TERMS)) {
        const currentClaims = mappedClaims.filter((claim) => claim.temporal_status === 'current');
        if (!currentClaims.length) {
          errors.push(`${prefix}: nåtidspåstand i ${surface} setning ${number} mangler current claim`);
        }
        for (const claim of currentClaims) {
          const verified = parseDate(claim.verified_at);
          const freshness = Number(claim.freshness_required_days ?? 180);
          if (!verified || daysBetween(now, verified) > freshness) {
            errors.push(`${prefix}: current claim ${claim.id} er foreldet`);
          }
        }
      }
    });
  }

  if (ready) {
    const blockingConflict = claims.some((claim) =>
      claim.status === 'source_conflict' && claim.publication_decision === 'unresolved_blocking');
    if (blockingConflict) errors.push(`${prefix}: unresolved_blocking kan ikke være ready_people_v1`);
    const usable = claims.filter(claimUsableForPublication).length;
    const declared = text(completion.claims_verified);
    if (declared && declared !== `${usable}/${claims.length}`) {
      errors.push(`${prefix}: claims_verified ${declared} matcher ikke ${usable}/${claims.length}`);
    }
  }

  return errors;
}

function walkJsonFiles(directory) {
  if (!fs.existsSync(directory)) return [];
  const files = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...walkJsonFiles(absolute));
    else if (entry.isFile() && entry.name.endsWith('.json')) files.push(absolute);
  }
  return files.sort();
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function repoPath(root, filePath) {
  return path.relative(root, filePath).replaceAll('\\', '/');
}

export function auditRepository(root, options = {}) {
  const errors = [];
  const claimsRoot = path.join(root, 'data/people/claims');
  const templatesPath = path.join(root, 'data/people/regler/people_profile_templates_v1.json');
  const schemaPath = path.join(root, 'data/people/regler/people_claims_schema_v1.json');
  const docsPath = path.join(root, 'docs/PEOPLE_PROFILE_CANONICAL.md');

  for (const required of [templatesPath, schemaPath, docsPath]) {
    if (!fs.existsSync(required)) errors.push(`Mangler ${repoPath(root, required)}`);
  }

  if (fs.existsSync(templatesPath)) {
    const templates = readJson(templatesPath);
    if (templates.version !== '1.0.0') errors.push('people_profile_templates_v1.json har feil versjon');
    if (templates.readinessPolicy?.countBasedRewardsForbidden !== true) {
      errors.push('People-malen må forby count-based readiness rewards');
    }
    if (templates.fieldSemantics?.education?.allowEmpty !== true) {
      errors.push('People-malen må tillate tom education');
    }
  }

  if (fs.existsSync(schemaPath)) {
    const schema = readJson(schemaPath);
    if (schema.properties?.schema?.const !== 'history_go_people_claims_v1') {
      errors.push('people_claims_schema_v1.json har feil schema-konstant');
    }
  }

  const claimFiles = walkJsonFiles(claimsRoot).filter((file) => !file.endsWith('/README.json'));
  for (const claimsFile of claimFiles) {
    const document = readJson(claimsFile);
    const profileFile = path.join(root, text(document.profile_file));
    if (!fs.existsSync(profileFile)) {
      errors.push(`${repoPath(root, claimsFile)} peker til manglende profile_file`);
      continue;
    }
    const parsed = readJson(profileFile);
    const profiles = Array.isArray(parsed) ? parsed : [parsed];
    const profile = profiles.find((item) => text(item?.id) === text(document.person_id));
    if (!profile) {
      errors.push(`${repoPath(root, claimsFile)} finner ikke person_id i profile_file`);
      continue;
    }
    errors.push(...validatePeopleClaimsDocument(document, profile, {
      now: options.now,
      claimsPath: repoPath(root, claimsFile),
    }));
  }

  if (options.requireClaims && claimFiles.length === 0) errors.push('Ingen People claims-filer funnet');
  return { errors, claimFiles };
}

function main() {
  const root = process.cwd();
  const requireClaims = process.argv.includes('--require-claims');
  const result = auditRepository(root, { requireClaims });
  if (result.errors.length) {
    console.error(`People Profile Canonical: ${result.errors.length} feil`);
    for (const error of result.errors) console.error(`- ${error}`);
    process.exitCode = 1;
    return;
  }
  console.log(`People Profile Canonical: PASS (${result.claimFiles.length} claims-filer)`);
}

const invokedPath = process.argv[1] ? pathToFileURL(path.resolve(process.argv[1])).href : '';
if (invokedPath === import.meta.url) main();
