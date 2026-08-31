import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

export const VALIDATOR_VERSION = '4.2.1';
const DEFAULT_MAX_CURRENT_AGE_DAYS = 180;
const ROOT = process.cwd();
const PACKET_DIR = 'data/places/production';
const TEMPLATE_PATH = 'data/places/regler/place_description_templates_v1.json';
const RULE_PATH = 'data/places/regler/PLACE_DESCRIPTION_CANONICAL.md';
const SCHEMA_PATH = 'data/places/regler/place_description_production_v4_2.schema.json';

const READY_STATUS = 'ready_v4_2';
const ALLOWED_STATUSES = new Set([
  READY_STATUS,
  'needs_research',
  'source_conflict',
  'identity_unresolved',
  'blocked_insufficient_sources',
  'metadata_correction_required'
]);
const ALLOWED_SOURCE_TYPES = new Set([
  'primary',
  'official',
  'institutional',
  'archive',
  'catalogue',
  'scholarly',
  'reputable_secondary'
]);
const IDENTITY_SOURCE_TYPES = new Set(['primary', 'official', 'institutional', 'archive', 'catalogue']);
const QUIZ_TYPES = new Set([
  'hvem',
  'når',
  'hva',
  'hvor',
  'hvilket_verk_eller_objekt',
  'hva_skjedde',
  'hva_ble_bygget_produsert_eller_endret'
]);
const STRONG_TERMS = [
  'første',
  'eldste',
  'største',
  'minste',
  'eneste',
  'viktigste',
  'ledende',
  'særlig kjent for',
  'avgjørende',
  'førte til',
  'på grunn av',
  'derfor',
  'dermed',
  'revolusjonerte',
  'endret for alltid'
];
const TEMPORAL_MARKERS = [
  'i dag',
  'nå',
  'holder til',
  'drives av',
  'brukes som',
  'er under bygging',
  'skal åpne',
  'planlegges',
  'forventes ferdig'
];
const FORBIDDEN_META_PATTERNS = [
  /\bhistory go\b/iu,
  /\bspilleren (?:skal|bør|kan)\b/iu,
  /\bse hvordan\b/iu,
  /\bhusk at\b/iu,
  /\bkartpunkt(?:et)?\b/iu,
  /\bmarkør(?:en)?\b/iu,
  /\bkoordinatstatus\b/iu,
  /\bcanonical[- ]?id\b/iu,
  /\bmå holdes adskilt fra\b/iu
];
const GENERATED_INDEX_PATTERNS = [
  /(?:^|\/)places_index\.json$/u,
  /(?:^|\/)places-index\.json$/u,
  /(?:^|\/)generated\//u
];

export function isGeneratedPlaceIndex(file) {
  return GENERATED_INDEX_PATTERNS.some((pattern) => pattern.test(String(file ?? '')));
}

function normalizeText(value) {
  return String(value ?? '')
    .normalize('NFKC')
    .replace(/\s+/gu, ' ')
    .trim();
}

function normalizeComparable(value) {
  return normalizeText(value)
    .toLocaleLowerCase('nb-NO')
    .replace(/[\p{P}\p{S}]+/gu, ' ')
    .replace(/\s+/gu, ' ')
    .trim();
}

export function sha256Text(value) {
  return crypto.createHash('sha256').update(String(value ?? ''), 'utf8').digest('hex');
}

export function splitSentences(value) {
  const text = String(value ?? '').trim();
  if (!text) return [];
  if (typeof Intl?.Segmenter === 'function') {
    const segmenter = new Intl.Segmenter('nb', { granularity: 'sentence' });
    return [...segmenter.segment(text)]
      .map((entry) => entry.segment.trim())
      .filter(Boolean);
  }
  return text
    .split(/(?<=[.!?])(?:["»”')\]]*)\s+(?=[A-ZÆØÅ0-9«“"(])/gu)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}

export function containsStrongClaim(sentence) {
  const normalized = normalizeComparable(sentence);
  return STRONG_TERMS.some((term) => {
    const needle = normalizeComparable(term);
    return new RegExp(`(?:^|\\s)${escapeRegex(needle)}(?=\\s|$)`, 'u').test(normalized);
  });
}

export function containsTemporalClaim(sentence) {
  const normalized = normalizeComparable(sentence);
  return TEMPORAL_MARKERS.some((marker) => normalized.includes(normalizeComparable(marker)));
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function wordCount(value) {
  const normalized = normalizeComparable(value);
  return normalized ? normalized.split(' ').length : 0;
}

function paragraphCount(value) {
  const text = String(value ?? '').trim();
  return text ? text.split(/\n\s*\n/gu).filter((part) => part.trim()).length : 0;
}

function parseDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/u.test(String(value ?? ''))) return null;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isNaN(date.valueOf()) ? null : date;
}

function daysSince(value, now = new Date()) {
  const date = parseDate(value);
  if (!date) return Number.POSITIVE_INFINITY;
  return Math.floor((now.valueOf() - date.valueOf()) / 86_400_000);
}

function isHttpsUrl(value) {
  try {
    const url = new URL(String(value ?? ''));
    return url.protocol === 'https:' && Boolean(url.hostname);
  } catch {
    return false;
  }
}

function sameValue(a, b) {
  return JSON.stringify(a ?? null) === JSON.stringify(b ?? null);
}

function readJson(root, relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}

function collectJsonFiles(root, relativeDir) {
  const absoluteDir = path.join(root, relativeDir);
  if (!fs.existsSync(absoluteDir)) return [];
  const output = [];
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const absolute = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(absolute);
      else if (entry.isFile() && entry.name.endsWith('.json')) output.push(path.relative(root, absolute).replace(/\\/g, '/'));
    }
  };
  walk(absoluteDir);
  return output.sort();
}

function extractPlace(raw, placeId) {
  if (Array.isArray(raw)) return raw.find((place) => String(place?.id ?? '') === placeId) ?? null;
  if (Array.isArray(raw?.places)) return raw.places.find((place) => String(place?.id ?? '') === placeId) ?? null;
  if (String(raw?.id ?? '') === placeId) return raw;
  return null;
}

function collectPlaceRecords(raw) {
  if (Array.isArray(raw)) return raw;
  if (Array.isArray(raw?.places)) return raw.places;
  if (raw && typeof raw === 'object') return [raw];
  return [];
}

export function descriptionFieldsChanged(baseRaw, headRaw) {
  const toMap = (raw) => new Map(collectPlaceRecords(raw).map((place, index) => [String(place?.id ?? `__index_${index}`), place]));
  const basePlaces = toMap(baseRaw);
  const headPlaces = toMap(headRaw);
  const ids = new Set([...basePlaces.keys(), ...headPlaces.keys()]);
  for (const id of ids) {
    const before = basePlaces.get(id);
    const after = headPlaces.get(id);
    // A retired Place no longer has a user-facing description to validate.
    // Additions and edits still pass through the normal 4.2 packet gate.
    if (!after) continue;
    if (!sameValue(before?.desc, after?.desc) || !sameValue(before?.popupDesc, after?.popupDesc)) return true;
  }
  return false;
}

function coordinatesSnapshot(place) {
  if (place?.coordinates && typeof place.coordinates === 'object') return place.coordinates;
  const lat = place?.lat ?? place?.latitude ?? null;
  const lon = place?.lon ?? place?.lng ?? place?.longitude ?? null;
  if (lat === null && lon === null) return undefined;
  return { lat, lon };
}

function metadataValue(place, field) {
  if (field === 'coordinates') return coordinatesSnapshot(place);
  if (field === 'operationStatus') return place?.operationStatus ?? place?.status ?? undefined;
  if (field === 'placeType') return place?.placeType ?? place?.type ?? undefined;
  return place?.[field];
}

function sentenceCoverageMap(entries) {
  const map = new Map();
  for (const entry of Array.isArray(entries) ? entries : []) {
    const sentence = Number(entry?.sentence);
    if (!Number.isInteger(sentence) || sentence < 1 || map.has(sentence)) continue;
    map.set(sentence, Array.isArray(entry?.claimIds) ? entry.claimIds.map(String) : []);
  }
  return map;
}

function addIssue(issues, code, message, detail = {}) {
  issues.push({ code, message, ...detail });
}

function validateCoverage({ field, text, coverage, claimsById, issues, packetFile, now, maxCurrentAgeDays }) {
  const sentences = splitSentences(text);
  const map = sentenceCoverageMap(coverage);
  for (let index = 0; index < sentences.length; index += 1) {
    const sentenceNumber = index + 1;
    const sentence = sentences[index];
    const claimIds = map.get(sentenceNumber) ?? [];
    if (claimIds.length === 0) {
      addIssue(issues, 'sentence_without_claim', `${field} setning ${sentenceNumber} mangler claim-dekning.`, { packetFile, field, sentenceNumber });
      continue;
    }
    const claims = claimIds.map((id) => claimsById.get(id)).filter(Boolean);
    for (const claimId of claimIds) {
      if (!claimsById.has(claimId)) {
        addIssue(issues, 'unknown_claim_reference', `${field} setning ${sentenceNumber} viser til ukjent claim ${claimId}.`, { packetFile, field, sentenceNumber, claimId });
      }
    }
    if (claims.some((claim) => claim.status !== 'verified')) {
      addIssue(issues, 'sentence_uses_unverified_claim', `${field} setning ${sentenceNumber} bruker et claim som ikke er verified.`, { packetFile, field, sentenceNumber });
    }
    if (containsStrongClaim(sentence)) {
      const explicitStrong = claims.some((claim) => claim.claimKind === 'strong' && claim.evidenceMode === 'explicit');
      if (!explicitStrong) {
        addIssue(issues, 'strong_claim_without_explicit_evidence', `${field} setning ${sentenceNumber} inneholder en sterk påstand uten eksplisitt strong-claim.`, { packetFile, field, sentenceNumber });
      }
    }
    if (containsTemporalClaim(sentence)) {
      const currentClaims = claims.filter((claim) => ['current', 'planned'].includes(claim.temporalStatus));
      if (currentClaims.length === 0) {
        addIssue(issues, 'temporal_claim_without_status', `${field} setning ${sentenceNumber} inneholder nåtids- eller planopplysning uten temporalStatus.`, { packetFile, field, sentenceNumber });
      }
      for (const claim of currentClaims) {
        if (daysSince(claim.verifiedAt, now) > maxCurrentAgeDays) {
          addIssue(issues, 'stale_temporal_claim', `${field} setning ${sentenceNumber} bruker et tidsavhengig claim eldre enn ${maxCurrentAgeDays} dager.`, { packetFile, field, sentenceNumber, claimId: claim.id });
        }
      }
    }
  }
  for (const sentenceNumber of map.keys()) {
    if (sentenceNumber > sentences.length) {
      addIssue(issues, 'coverage_sentence_out_of_range', `${field} har dekning for setning ${sentenceNumber}, men teksten har bare ${sentences.length} setninger.`, { packetFile, field, sentenceNumber });
    }
  }
  return sentences;
}

export function validatePacket({ packet, place, packetFile = '(packet)', now = new Date(), maxCurrentAgeDays = DEFAULT_MAX_CURRENT_AGE_DAYS }) {
  const issues = [];
  const status = String(packet?.status ?? '');
  if (packet?.schemaVersion !== '4.2') addIssue(issues, 'wrong_schema_version', 'schemaVersion må være 4.2.', { packetFile });
  if (!/^4\.2\.\d+$/u.test(String(packet?.validatorVersion ?? ''))) addIssue(issues, 'wrong_validator_version', 'validatorVersion må være 4.2.x.', { packetFile });
  if (!ALLOWED_STATUSES.has(status)) addIssue(issues, 'invalid_status', `Ugyldig produksjonsstatus: ${status || '(mangler)'}.`, { packetFile });
  if (!place) {
    addIssue(issues, 'place_not_found', `Fant ikke placeId ${packet?.placeId ?? '(mangler)'} i ${packet?.placeFile ?? '(mangler)'}.`, { packetFile });
    return { issues, sentences: { desc: [], popupDesc: [] } };
  }
  if (String(place?.id ?? '') !== String(packet?.placeId ?? '')) addIssue(issues, 'place_id_mismatch', 'placeId samsvarer ikke med place-objektet.', { packetFile });

  const identity = packet?.identity ?? {};
  if (!normalizeText(identity.represents) || !normalizeText(identity.period) || !Array.isArray(identity.excludes)) {
    addIssue(issues, 'incomplete_identity_gate', 'Identitetsporten må angi represents, period og excludes.', { packetFile });
  }
  if (status === READY_STATUS && identity.status !== 'resolved') addIssue(issues, 'ready_with_unresolved_identity', 'ready_v4_2 krever identity.status resolved.', { packetFile });

  const metadataSnapshot = packet?.metadataSnapshot ?? {};
  for (const field of ['name', 'year', 'period', 'category', 'address', 'coordinates', 'externalLinks', 'operationStatus', 'placeType']) {
    if (!(field in metadataSnapshot)) continue;
    const actual = metadataValue(place, field);
    if (!sameValue(metadataSnapshot[field], actual)) {
      addIssue(issues, 'metadata_mismatch', `metadataSnapshot.${field} samsvarer ikke med place-filen.`, { packetFile, field });
    }
  }

  const desc = String(place?.desc ?? '');
  const popupDesc = String(place?.popupDesc ?? '');
  if (status === READY_STATUS) {
    if (!desc.trim()) addIssue(issues, 'missing_desc', 'ready_v4_2 krever desc.', { packetFile });
    if (!popupDesc.trim()) addIssue(issues, 'missing_popupDesc', 'ready_v4_2 krever popupDesc.', { packetFile });
    if (wordCount(desc) < 40 || wordCount(desc) > 80) addIssue(issues, 'desc_outside_normal_range', `desc har ${wordCount(desc)} ord; forventet 40–80.`, { packetFile });
    if (wordCount(popupDesc) < 300) addIssue(issues, 'popup_below_minimum', `popupDesc har ${wordCount(popupDesc)} ord; minimum er 300 for ready_v4_2.`, { packetFile });
    if (paragraphCount(popupDesc) < 3) addIssue(issues, 'popup_too_few_paragraphs', 'popupDesc må ha minst tre avsnitt.', { packetFile });
  }
  const hashes = packet?.textHashes ?? {};
  if (hashes.algorithm !== 'sha256') addIssue(issues, 'wrong_hash_algorithm', 'textHashes.algorithm må være sha256.', { packetFile });
  if (hashes.desc !== sha256Text(desc)) addIssue(issues, 'stale_desc_hash', 'desc-hashen samsvarer ikke med place-filen.', { packetFile });
  if (hashes.popupDesc !== sha256Text(popupDesc)) addIssue(issues, 'stale_popup_hash', 'popupDesc-hashen samsvarer ikke med place-filen.', { packetFile });

  const claims = Array.isArray(packet?.claims) ? packet.claims : [];
  const claimsById = new Map();
  for (const claim of claims) {
    const id = String(claim?.id ?? '');
    if (!/^claim_[A-Za-z0-9_-]+$/u.test(id)) addIssue(issues, 'invalid_claim_id', `Ugyldig claim-ID: ${id || '(mangler)'}.`, { packetFile });
    if (claimsById.has(id)) addIssue(issues, 'duplicate_claim_id', `Duplisert claim-ID: ${id}.`, { packetFile });
    claimsById.set(id, claim);
    if (!normalizeText(claim?.claim)) addIssue(issues, 'empty_claim', `${id || 'Claim'} mangler claim-tekst.`, { packetFile });
    if (!isHttpsUrl(claim?.sourceUrl)) addIssue(issues, 'uninspectable_source_url', `${id || 'Claim'} må ha inspectable https-kilde.`, { packetFile });
    if (!normalizeText(claim?.sourceLocation)) addIssue(issues, 'missing_source_location', `${id || 'Claim'} mangler sourceLocation.`, { packetFile });
    if (!ALLOWED_SOURCE_TYPES.has(claim?.sourceType)) addIssue(issues, 'invalid_source_type', `${id || 'Claim'} har ugyldig sourceType.`, { packetFile });
    if (!parseDate(claim?.verifiedAt)) addIssue(issues, 'invalid_verified_date', `${id || 'Claim'} har ugyldig verifiedAt.`, { packetFile });
    if (claim?.timelineYear !== undefined) {
      const timelineYear = Number(claim.timelineYear);
      if (!Number.isInteger(timelineYear) || timelineYear < 1000 || timelineYear > 9999) {
        addIssue(issues, 'invalid_timeline_year', `${id || 'Claim'} har ugyldig timelineYear.`, { packetFile });
      } else {
        const exactYear = new RegExp(`(^|[^0-9])${timelineYear}(?![0-9])`, 'u');
        if (!exactYear.test(String(claim?.claim ?? ''))) {
          addIssue(issues, 'timeline_year_missing_from_claim', `${id || 'Claim'} må nevne timelineYear eksplisitt i claim-teksten.`, { packetFile });
        }
        if (claim?.temporalStatus !== 'historical') {
          addIssue(issues, 'timeline_year_requires_historical_status', `${id || 'Claim'} kan bare ha timelineYear når temporalStatus er historical.`, { packetFile });
        }
      }
    }
    if (claim?.status === 'verified' && claim?.claimKind === 'strong') {
      const independent = new Set([claim.sourceUrl, ...(Array.isArray(claim.independentSourceUrls) ? claim.independentSourceUrls : [])].filter(Boolean));
      if (independent.size < 2) addIssue(issues, 'strong_claim_needs_two_sources', `${id} er strong og må ha minst to uavhengige kilder.`, { packetFile });
      if (claim.evidenceMode !== 'explicit') addIssue(issues, 'strong_claim_not_explicit', `${id} er strong og må ha evidenceMode explicit.`, { packetFile });
    }
  }
  if (status === READY_STATUS && claims.length === 0) addIssue(issues, 'ready_without_claims', 'ready_v4_2 krever claims.', { packetFile });
  if (status === READY_STATUS && !claims.some((claim) => claim.status === 'verified' && (claim.claimKind === 'identity' || IDENTITY_SOURCE_TYPES.has(claim.sourceType)))) {
    addIssue(issues, 'missing_identity_source', 'ready_v4_2 krever minst ett verifisert identitetsclaim fra primær, offentlig, institusjonell, arkiv- eller katalogkilde.', { packetFile });
  }

  const sentences = {
    desc: validateCoverage({ field: 'desc', text: desc, coverage: packet?.sentenceCoverage?.desc, claimsById, issues, packetFile, now, maxCurrentAgeDays }),
    popupDesc: validateCoverage({ field: 'popupDesc', text: popupDesc, coverage: packet?.sentenceCoverage?.popupDesc, claimsById, issues, packetFile, now, maxCurrentAgeDays })
  };

  const combined = `${desc}\n${popupDesc}`;
  for (const pattern of FORBIDDEN_META_PATTERNS) {
    if (pattern.test(combined)) addIssue(issues, 'forbidden_user_meta_text', `Brukerteksten treffer forbudt metatekst: ${pattern}.`, { packetFile });
  }

  const factual = packet?.reviews?.factual ?? {};
  const editorial = packet?.reviews?.editorial ?? {};
  if (status === READY_STATUS && factual.status !== 'passed') addIssue(issues, 'factual_review_not_passed', 'ready_v4_2 krever bestått faktareview.', { packetFile });
  if (status === READY_STATUS && editorial.status !== 'passed') addIssue(issues, 'editorial_review_not_passed', 'ready_v4_2 krever bestått redaksjonell review.', { packetFile });
  if (editorial.introducedNewFacts !== false) addIssue(issues, 'editorial_review_added_facts', 'Redaksjonell review må eksplisitt angi introducedNewFacts: false.', { packetFile });

  const questions = Array.isArray(packet?.quizReadiness?.questions) ? packet.quizReadiness.questions : [];
  const questionTypes = new Set();
  let normalQuestions = 0;
  for (const question of questions) {
    if (!QUIZ_TYPES.has(question?.type)) addIssue(issues, 'invalid_quiz_question_type', `Ugyldig quiztype: ${question?.type ?? '(mangler)'}.`, { packetFile });
    else questionTypes.add(question.type);
    if (question?.normalKnowledgeQuestion === true) normalQuestions += 1;
    if (!normalizeText(question?.answer)) addIssue(issues, 'quiz_question_without_answer', 'Quiz-readiness-spørsmål mangler entydig answer.', { packetFile });
    for (const claimId of Array.isArray(question?.claimIds) ? question.claimIds : []) {
      if (!claimsById.has(String(claimId))) addIssue(issues, 'quiz_unknown_claim', `Quizspørsmål viser til ukjent claim ${claimId}.`, { packetFile });
    }
  }
  if (status === READY_STATUS && questions.length < 8) addIssue(issues, 'too_few_quiz_questions', `ready_v4_2 krever minst 8 direkte faktaspørsmål; fant ${questions.length}.`, { packetFile });
  if (status === READY_STATUS && normalQuestions < 5) addIssue(issues, 'too_few_normal_quiz_questions', `ready_v4_2 krever minst 5 normale kunnskapsspørsmål; fant ${normalQuestions}.`, { packetFile });
  if (status === READY_STATUS && questionTypes.size < 4) addIssue(issues, 'too_few_quiz_types', `ready_v4_2 krever minst 4 spørsmålstyper; fant ${questionTypes.size}.`, { packetFile });

  const verifiedClaims = claims.filter((claim) => claim.status === 'verified').length;
  const completion = packet?.completion ?? {};
  if (status === READY_STATUS) {
    if (completion.completedUnder !== '4.2') addIssue(issues, 'wrong_completed_under', 'ready_v4_2 krever completedUnder 4.2.', { packetFile });
    if (completion.currentStatus !== 'current') addIssue(issues, 'wrong_current_status', 'ready_v4_2 krever currentStatus current.', { packetFile });
    if (!parseDate(completion.sourceVerifiedAt)) addIssue(issues, 'invalid_source_verified_at', 'completion.sourceVerifiedAt må være en dato.', { packetFile });
    if (completion.factualReview !== 'passed' || completion.editorialReview !== 'passed') addIssue(issues, 'completion_reviews_not_passed', 'completion må registrere begge reviews som passed.', { packetFile });
    if (completion.validatorVersion !== packet.validatorVersion) addIssue(issues, 'completion_validator_mismatch', 'completion.validatorVersion må samsvare med packet.validatorVersion.', { packetFile });
    if (completion?.claimsVerified?.verified !== verifiedClaims || completion?.claimsVerified?.total !== claims.length) {
      addIssue(issues, 'claims_verified_count_mismatch', 'completion.claimsVerified samsvarer ikke med claim-registeret.', { packetFile });
    }
  }

  return { issues, sentences };
}

function wordSet(text) {
  return new Set(normalizeComparable(text).split(' ').filter((word) => word.length > 2));
}

function jaccard(a, b) {
  const union = new Set([...a, ...b]);
  if (union.size === 0) return 0;
  let intersection = 0;
  for (const value of a) if (b.has(value)) intersection += 1;
  return intersection / union.size;
}

function exemptedSentence(packet, sentence) {
  const normalized = normalizeComparable(sentence);
  return (Array.isArray(packet?.similarityExemptions) ? packet.similarityExemptions : [])
    .some((entry) => normalizeComparable(entry?.sentence) === normalized);
}

export function validateSimilarity(records) {
  const issues = [];
  const seenSentences = new Map();
  const openings = new Map();
  const endings = new Map();
  for (const record of records) {
    const sentences = splitSentences(record.popupDesc);
    const first = normalizeComparable(sentences[0] ?? '');
    const last = normalizeComparable(sentences.at(-1) ?? '');
    if (first) {
      const previous = openings.get(first);
      if (previous && previous.placeId !== record.placeId) addIssue(issues, 'duplicate_opening', `${record.placeId} og ${previous.placeId} har samme åpning.`, { placeIds: [previous.placeId, record.placeId] });
      else openings.set(first, record);
    }
    if (last) {
      const previous = endings.get(last);
      if (previous && previous.placeId !== record.placeId) addIssue(issues, 'duplicate_ending', `${record.placeId} og ${previous.placeId} har samme avslutning.`, { placeIds: [previous.placeId, record.placeId] });
      else endings.set(last, record);
    }
    for (const sentence of sentences) {
      if (wordCount(sentence) <= 8 || exemptedSentence(record.packet, sentence)) continue;
      const normalized = normalizeComparable(sentence);
      const previous = seenSentences.get(normalized);
      if (previous && previous.placeId !== record.placeId && !exemptedSentence(previous.packet, sentence)) {
        addIssue(issues, 'repeated_sentence', `${record.placeId} og ${previous.placeId} gjenbruker en hel setning på mer enn åtte ord.`, { placeIds: [previous.placeId, record.placeId], sentence });
      } else seenSentences.set(normalized, record);
    }
  }
  for (let i = 0; i < records.length; i += 1) {
    for (let j = i + 1; j < records.length; j += 1) {
      const a = records[i];
      const b = records[j];
      if (wordCount(a.popupDesc) < 100 || wordCount(b.popupDesc) < 100) continue;
      const score = jaccard(wordSet(a.popupDesc), wordSet(b.popupDesc));
      if (score > 0.75) addIssue(issues, 'high_text_similarity', `${a.placeId} og ${b.placeId} har tekstlikhet ${score.toFixed(3)}, over 0.75.`, { placeIds: [a.placeId, b.placeId], score });
    }
  }
  return issues;
}

function git(args, root) {
  return execFileSync('git', args, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
}

function getChangedFiles(root, base, head) {
  if (process.env.PLACE_DESCRIPTION_CHANGED_FILES) {
    return process.env.PLACE_DESCRIPTION_CHANGED_FILES.split(/\r?\n/gu).map((value) => value.trim()).filter(Boolean);
  }
  return git(['diff', '--name-only', `${base}...${head}`], root).split(/\r?\n/gu).filter(Boolean);
}

function readJsonAtRef(root, ref, file) {
  try { return JSON.parse(git(['show', `${ref}:${file}`], root)); }
  catch { return null; }
}

function changedDescriptionPlaceFiles(root, base, head, changedFiles) {
  const files = [];
  for (const file of changedFiles.filter((value) => value.startsWith('data/places/') && value.endsWith('.json') && !value.startsWith(`${PACKET_DIR}/`) && !value.includes('/regler/') && !isGeneratedPlaceIndex(value))) {
    const baseRaw = readJsonAtRef(root, base, file);
    const headRaw = readJsonAtRef(root, head, file);
    if (descriptionFieldsChanged(baseRaw, headRaw)) files.push(file);
  }
  return files;
}

function validatePrScope({ root, base, head, changedFiles, packets }) {
  const issues = [];
  const descriptionFiles = changedDescriptionPlaceFiles(root, base, head, changedFiles);
  if (descriptionFiles.length === 0) return issues;
  const changedPackets = new Set(changedFiles.filter((file) => file.startsWith(`${PACKET_DIR}/`) && file.endsWith('.json')));
  for (const placeFile of descriptionFiles) {
    const matching = packets.filter((entry) => entry.packet.placeFile === placeFile);
    if (matching.length === 0) addIssue(issues, 'changed_description_without_packet', `${placeFile} endrer desc/popupDesc uten 4.2-produksjonspakke.`, { placeFile });
    for (const entry of matching) {
      if (!changedPackets.has(entry.packetFile)) addIssue(issues, 'unchanged_packet_for_changed_description', `${placeFile} endrer desc/popupDesc uten at ${entry.packetFile} er endret.`, { placeFile, packetFile: entry.packetFile });
    }
  }
  const changedRules = changedFiles.some((file) => file === RULE_PATH || file === TEMPLATE_PATH || file === SCHEMA_PATH || file === 'scripts/validate-place-description-production-v4_2.mjs');
  if (changedRules && descriptionFiles.length > 0) addIssue(issues, 'mixed_rules_and_place_content', 'Regelendringer og stedsbeskrivelser skal ikke ligge i samme PR.', { descriptionFiles });
  const changedCoordinates = changedFiles.filter((file) => file.startsWith('data/coordinate-evidence/') || /coordinate/i.test(path.basename(file)));
  if (changedCoordinates.length > 0) addIssue(issues, 'mixed_description_and_coordinate_scope', 'Beskrivelsesendringer og koordinatendringer skal ikke blandes i samme PR.', { files: changedCoordinates });
  const changedIndexes = changedFiles.filter(isGeneratedPlaceIndex);
  if (changedIndexes.length > 0) addIssue(issues, 'generated_index_in_description_pr', 'En ren beskrivelses-PR skal ikke endre genererte indekser.', { files: changedIndexes });
  return issues;
}

export function validateRepository({ root = ROOT, changed = false, base = '', head = 'HEAD', reportPath = '', now = new Date() } = {}) {
  const issues = [];
  for (const required of [TEMPLATE_PATH, RULE_PATH, SCHEMA_PATH]) {
    if (!fs.existsSync(path.join(root, required))) addIssue(issues, 'missing_contract_file', `Mangler ${required}.`, { file: required });
  }
  let template = {};
  try { template = readJson(root, TEMPLATE_PATH); }
  catch (error) { addIssue(issues, 'invalid_template_json', `Kan ikke lese ${TEMPLATE_PATH}: ${error.message}`, { file: TEMPLATE_PATH }); }
  if (template.version !== '4.2.0') addIssue(issues, 'template_version_mismatch', `Template-versjon må være 4.2.0, fant ${template.version ?? '(mangler)'}.`, { file: TEMPLATE_PATH });
  const maxCurrentAgeDays = Number(template?.global?.temporalClaims?.maximumVerificationAgeDays ?? DEFAULT_MAX_CURRENT_AGE_DAYS);
  const packetFiles = collectJsonFiles(root, PACKET_DIR);
  const packets = [];
  const readyRecords = [];
  for (const packetFile of packetFiles) {
    let packet;
    try { packet = readJson(root, packetFile); }
    catch (error) { addIssue(issues, 'invalid_packet_json', `Kan ikke lese ${packetFile}: ${error.message}`, { packetFile }); continue; }
    if (!String(packet?.placeFile ?? '').startsWith('data/places/')) {
      addIssue(issues, 'invalid_place_file_path', `${packetFile} har ugyldig placeFile.`, { packetFile });
      packets.push({ packetFile, packet, place: null });
      continue;
    }
    const absolutePlaceFile = path.join(root, packet.placeFile);
    let place = null;
    if (!fs.existsSync(absolutePlaceFile)) addIssue(issues, 'missing_place_file', `${packetFile} peker på manglende ${packet.placeFile}.`, { packetFile });
    else {
      try { place = extractPlace(readJson(root, packet.placeFile), String(packet.placeId ?? '')); }
      catch (error) { addIssue(issues, 'invalid_place_json', `Kan ikke lese ${packet.placeFile}: ${error.message}`, { packetFile }); }
    }
    const result = validatePacket({ packet, place, packetFile, now, maxCurrentAgeDays });
    issues.push(...result.issues);
    packets.push({ packetFile, packet, place });
    if (packet.status === READY_STATUS && place) readyRecords.push({ placeId: packet.placeId, popupDesc: String(place.popupDesc ?? ''), packet });
  }
  issues.push(...validateSimilarity(readyRecords));
  if (changed) {
    if (!base) addIssue(issues, 'missing_base_ref', '--changed krever --base eller GITHUB_BASE_SHA.', {});
    else {
      let changedFiles = [];
      try { changedFiles = getChangedFiles(root, base, head); }
      catch (error) { addIssue(issues, 'git_diff_failed', `Kunne ikke lese git-diff: ${error.message}`, {}); }
      issues.push(...validatePrScope({ root, base, head, changedFiles, packets }));
    }
  }
  const report = {
    schema: 'history_go_place_description_validation_report_v4_2',
    validatorVersion: VALIDATOR_VERSION,
    generatedAt: new Date().toISOString(),
    mode: changed ? 'changed' : 'all',
    packetCount: packetFiles.length,
    readyPacketCount: readyRecords.length,
    errorCount: issues.length,
    issues
  };
  if (reportPath) {
    const absolute = path.join(root, reportPath);
    fs.mkdirSync(path.dirname(absolute), { recursive: true });
    fs.writeFileSync(absolute, `${JSON.stringify(report, null, 2)}\n`);
  }
  return report;
}

function parseArgs(argv) {
  const options = { changed: false, base: process.env.GITHUB_BASE_SHA ?? '', head: process.env.GITHUB_HEAD_SHA ?? 'HEAD', reportPath: '' };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--changed') options.changed = true;
    else if (arg === '--all') options.changed = false;
    else if (arg === '--base') options.base = argv[++index] ?? '';
    else if (arg === '--head') options.head = argv[++index] ?? 'HEAD';
    else if (arg === '--report') options.reportPath = argv[++index] ?? 'reports/place-description-validation-v4_2.json';
    else throw new Error(`Ukjent argument: ${arg}`);
  }
  return options;
}

function main() {
  let options;
  try { options = parseArgs(process.argv.slice(2)); }
  catch (error) { console.error(error.message); process.exitCode = 2; return; }
  const report = validateRepository(options);
  console.log(`Place description v4.2: ${report.packetCount} pakker, ${report.readyPacketCount} ready, ${report.errorCount} feil`);
  for (const issue of report.issues.slice(0, 100)) console.error(`- ${issue.code}: ${issue.message}`);
  if (report.issues.length > 100) console.error(`- ... ${report.issues.length - 100} flere feil`);
  if (report.errorCount > 0) process.exitCode = 1;
}

const invokedPath = process.argv[1] ? pathToFileURL(path.resolve(process.argv[1])).href : '';
if (import.meta.url === invokedPath) main();
