import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const readJson = (relativePath) => JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), 'utf8'));
const A = (value) => Array.isArray(value) ? value : [];
const unique = (values) => [...new Set(values)];
const sorted = (values) => unique(values).sort((a, b) => String(a).localeCompare(String(b), 'nb'));

const claimsFile = readJson('data/fag/historie/claims_historie_canonical_v1.json');
const sourcesFile = readJson('data/fag/historie/sources_historie_canonical_v1.json');
const placeEvidenceFile = readJson('data/fag/historie/place_evidence_historie_v1.json');
const theoryEvidenceFile = readJson('data/fag/historie/theory_evidence_historie_canonical_v1.json');

const sourceById = new Map(A(sourcesFile.sources).map((source) => [source.source_id, source]));
const linksByClaim = new Map();
for (const link of A(placeEvidenceFile.evidence_links)) {
  const links = linksByClaim.get(link.claim_id) || [];
  links.push(link);
  linksByClaim.set(link.claim_id, links);
}
const existingBundles = new Set(A(theoryEvidenceFile.entries).map((entry) => sorted(entry.claim_ids).join('|')));

const targets = [
  {
    theory_id: 'theory_his_byutvidelse_grense_innlemmelse',
    keywords: ['byutvid', 'bygrense', 'innlemm', 'forstad', 'urbaniser', 'grense', 'aker', 'kommunesammens', 'transport', 'drabant']
  },
  {
    theory_id: 'theory_his_gatenett_tomtestruktur_infrastruktur',
    keywords: ['gatenett', 'gate', 'vei', 'veg', 'tomt', 'infrastruktur', 'jernbane', 'tunnel', 'transport', 'brygge', 'havn', 'energi', 'vann', 'trikk']
  },
  {
    theory_id: 'theory_his_regulering_plan_ekspropriasjon',
    keywords: ['reguler', 'plan', 'ekspropr', 'vedtak', 'kommun', 'utbygg', 'riving', 'sanering', 'rådhus', 'bispelokket']
  },
  {
    theory_id: 'theory_his_byfornyelse_bolig_standard',
    keywords: ['byforny', 'bolig', 'standard', 'rehabiliter', 'oppgrader', 'sanering', 'riving', 'ombruk', 'arbeiderbolig', 'pipervika']
  },
  {
    theory_id: 'theory_his_naring_funksjonsskifte',
    keywords: ['næring', 'funksjon', 'bruk', 'handel', 'kontor', 'restaurant', 'bolig', 'fabrikk', 'verksted', 'bibliotek', 'museum', 'ombruk']
  },
  {
    theory_id: 'theory_his_industrihavn_transformasjon',
    keywords: ['industri', 'havn', 'jernbane', 'verft', 'brygge', 'fabrikk', 'transform', 'nedlegg', 'ombygg', 'akerselva', 'aker brygge']
  },
  {
    theory_id: 'theory_his_gentrifisering_verdi_befolkning',
    keywords: ['gentrif', 'verdi', 'befolk', 'eiendom', 'bolig', 'fortreng', 'klasse', 'handel', 'kontor', 'ombruk', 'aker brygge', 'tøyen', 'grüner']
  }
];

function claimText(claim) {
  return [
    claim.claim_id,
    claim.statement,
    claim.claim_type,
    ...A(claim.emne_ids),
    ...A(claim.scope?.place_ids),
    ...A(claim.scope?.case_ids)
  ].join(' ').toLowerCase();
}

function relevanceScore(claim, target) {
  const text = claimText(claim);
  let score = 0;
  for (const keyword of target.keywords) {
    if (text.includes(keyword)) score += keyword.includes(' ') ? 5 : 3;
    if (String(claim.statement || '').toLowerCase().includes(keyword)) score += 2;
    if (String(claim.claim_type || '').toLowerCase().includes(keyword)) score += 1;
  }
  return score;
}

function temporalAnchors(claims) {
  return sorted(claims.flatMap((claim) => {
    const temporal = claim.scope?.temporal || {};
    return [temporal.from, temporal.to].filter((value) => value !== null && value !== undefined).map(String);
  }));
}

function claimEligible(claim) {
  if (!claim.uncertainty?.level || !String(claim.uncertainty?.note || '').trim()) return false;
  if (!A(claim.alternative_interpretations).length) return false;
  const links = A(linksByClaim.get(claim.claim_id));
  if (!links.length || links.some((link) => !['validated_case', 'validated_pilot'].includes(link.validation_status))) return false;
  for (const sourceId of A(claim.source_ids)) {
    const source = sourceById.get(sourceId);
    if (!source || A(source.limitations).length < 2 || !source.provenance?.repository_source) return false;
  }
  return true;
}

function bundleSummary(claims, target) {
  const sources = sorted(claims.flatMap((claim) => A(claim.source_ids)));
  const cases = sorted(claims.flatMap((claim) => A(claim.scope?.case_ids)));
  const places = sorted(claims.flatMap((claim) => A(claim.scope?.place_ids)));
  const claimTypes = sorted(claims.map((claim) => claim.claim_type).filter(Boolean));
  const anchors = temporalAnchors(claims);
  const score = claims.reduce((sum, claim) => sum + relevanceScore(claim, target), 0);
  const claimIds = claims.map((claim) => claim.claim_id);
  const bundleKey = sorted(claimIds).join('|');
  const qualifies = claims.length >= 3 && sources.length >= 2 && cases.length >= 2 && places.length >= 2 && claimTypes.length >= 2 && anchors.length >= 2 && !existingBundles.has(bundleKey);
  return { qualifies, score, claim_ids: claimIds, sources, cases, places, claim_types: claimTypes, temporal_anchors: anchors };
}

function combinations(items, size, start = 0, prefix = [], out = []) {
  if (prefix.length === size) {
    out.push(prefix);
    return out;
  }
  for (let i = start; i <= items.length - (size - prefix.length); i += 1) {
    combinations(items, size, i + 1, [...prefix, items[i]], out);
  }
  return out;
}

test('midlertidig Byhistorie claim-audit', () => {
  const report = [];
  const eligibleClaims = A(claimsFile.claims).filter(claimEligible);

  for (const target of targets) {
    const ranked = eligibleClaims
      .map((claim) => ({ claim, score: relevanceScore(claim, target) }))
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score || a.claim.claim_id.localeCompare(b.claim.claim_id))
      .slice(0, 18);

    const bundleCandidates = [3, 4]
      .flatMap((size) => combinations(ranked.map((item) => item.claim), size))
      .map((claims) => bundleSummary(claims, target))
      .filter((bundle) => bundle.qualifies)
      .sort((a, b) => b.score - a.score || a.claim_ids.join('|').localeCompare(b.claim_ids.join('|')))
      .slice(0, 10);

    report.push({
      theory_id: target.theory_id,
      top_claims: ranked.slice(0, 12).map(({ claim, score }) => ({
        claim_id: claim.claim_id,
        score,
        statement: claim.statement,
        claim_type: claim.claim_type,
        cases: claim.scope?.case_ids,
        places: claim.scope?.place_ids,
        sources: claim.source_ids
      })),
      top_contract_valid_bundles: bundleCandidates
    });
  }

  console.log('BYHISTORIE_AUDIT_JSON_START');
  console.log(JSON.stringify(report, null, 2));
  console.log('BYHISTORIE_AUDIT_JSON_END');
  assert.equal(report.length, 7);
});
