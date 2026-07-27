#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const historyDir = path.join(root, 'data/fag/historie');
const reportDir = path.join(root, 'reports/historie-theory-evidence/candidate-audit-v2');
const jsonPath = path.join(reportDir, 'candidates.json');
const markdownPath = path.join(reportDir, 'candidates.md');

const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const A = (value) => Array.isArray(value) ? value : [];
const unique = (values) => [...new Set(values)];
const sorted = (values) => unique(values).sort((a, b) => String(a).localeCompare(String(b), 'nb'));
const normalize = (value) => String(value ?? '')
  .toLowerCase()
  .normalize('NFKD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9æøå]+/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const stop = new Set([
  'og','eller','som','for','til','fra','med','uten','ved','av','i','pa','på','en','et','den','det','de','der','hvordan','kan','ma','må','ikke','ogsa','også','om','mellom','gjennom','etter','under','over','ulike','historisk','historiske','historie','analyse','analyserer','rammeverk','modell','teori','teorier','forklarer','undersoker','undersøker','samt','innen','samme','andre','flere','ett','én','sin','sine','sitt','blir','ble','har','hadde','er','var','være','vaere','dette','disse','deres','hvilke','hva','hvor','nar','når','bare','alene','seg','mot','enn','fordi','slik','og','at'
]);

function tokens(value) {
  return unique(normalize(value).split(' ').filter((token) => token.length >= 4 && !stop.has(token)));
}

function flatten(value) {
  if (value == null) return [];
  if (Array.isArray(value)) return value.flatMap(flatten);
  if (typeof value === 'object') return Object.values(value).flatMap(flatten);
  return [String(value)];
}

function temporalAnchors(claims) {
  return sorted(claims.flatMap((claim) => {
    const temporal = claim.scope?.temporal || {};
    return [temporal.from, temporal.to].filter((value) => value !== null && value !== undefined).map(String);
  }));
}

const theories = readJson(path.join(historyDir, 'theory_objects_historie_canonical_v5_5.json'));
const registry = readJson(path.join(historyDir, 'theory_evidence_historie_canonical_v1.json'));
const claimsFile = readJson(path.join(historyDir, 'claims_historie_canonical_v1.json'));
const sourcesFile = readJson(path.join(historyDir, 'sources_historie_canonical_v1.json'));
const placeEvidenceFile = readJson(path.join(historyDir, 'place_evidence_historie_v1.json'));

const existingTheoryIds = new Set(A(registry.entries).map((entry) => entry.theory_id));
const evidenceByClaim = new Map(A(placeEvidenceFile.evidence_links).map((entry) => [entry.claim_id, entry]));
const sourceById = new Map(A(sourcesFile.sources).map((source) => [source.source_id, source]));
const claims = A(claimsFile.claims).filter((claim) => {
  const link = evidenceByClaim.get(claim.claim_id);
  return link && ['validated_case', 'validated_pilot'].includes(link.validation_status);
});

function theoryTokenSet(theory) {
  const texts = [
    theory.label,
    theory.definition,
    ...flatten(theory.explanatory_scope),
    ...flatten(theory.limitations),
    ...flatten(theory.source_hook_id),
    ...flatten(theory.method_links),
  ];
  const base = new Set(tokens(texts.join(' ')));
  for (const value of A(theory.explanatory_scope)) {
    for (const token of tokens(String(value).replace(/^his_/, '').replaceAll('_', ' '))) base.add(token);
  }
  for (const token of tokens(String(theory.source_hook_id || '').replace(/^his_/, '').replaceAll('_', ' '))) base.add(token);
  return base;
}

function claimTokenSet(claim) {
  const evidence = evidenceByClaim.get(claim.claim_id);
  const sourceTitles = A(claim.source_ids).map((id) => sourceById.get(id)?.title || '');
  const texts = [
    claim.statement,
    claim.claim_type,
    ...flatten(claim.emne_ids).map((value) => value.replace(/^em_his_/, '').replaceAll('_', ' ')),
    ...flatten(claim.alternative_interpretations),
    claim.uncertainty?.note,
    evidence?.note,
    ...sourceTitles,
  ];
  return new Set(tokens(texts.join(' ')));
}

const claimTokens = new Map(claims.map((claim) => [claim.claim_id, claimTokenSet(claim)]));

function directBoost(theory, claim) {
  const hookTokens = tokens(String(theory.source_hook_id || '').replace(/^his_/, '').replaceAll('_', ' '));
  const scopeTokens = A(theory.explanatory_scope).flatMap((value) => tokens(String(value).replace(/^his_/, '').replaceAll('_', ' ')));
  const emneText = normalize(A(claim.emne_ids).join(' ').replaceAll('_', ' '));
  let boost = 0;
  for (const token of hookTokens) if (emneText.includes(token)) boost += 2;
  for (const token of scopeTokens) if (emneText.includes(token)) boost += 1;
  return Math.min(boost, 8);
}

function claimScore(theory, theoryTokens, claim) {
  const cTokens = claimTokens.get(claim.claim_id) || new Set();
  const overlap = [...theoryTokens].filter((token) => cTokens.has(token));
  const boost = directBoost(theory, claim);
  const score = overlap.length + boost;
  return { claim, score, overlap: overlap.sort(), direct_boost: boost };
}

function bundleStats(bundle) {
  return {
    claims: bundle.length,
    cases: sorted(bundle.flatMap(({claim}) => A(claim.scope?.case_ids))),
    places: sorted(bundle.flatMap(({claim}) => A(claim.scope?.place_ids))),
    sources: sorted(bundle.flatMap(({claim}) => A(claim.source_ids))),
    claim_types: sorted(bundle.map(({claim}) => claim.claim_type).filter(Boolean)),
    temporal_anchors: temporalAnchors(bundle.map(({claim}) => claim)),
  };
}

function qualifies(stats) {
  return stats.claims >= 3
    && stats.cases.length >= 2
    && stats.places.length >= 2
    && stats.sources.length >= 2
    && stats.claim_types.length >= 2
    && stats.temporal_anchors.length >= 2;
}

function chooseBundle(scored) {
  const candidates = scored.filter((item) => item.score >= 2).slice(0, 12);
  let best = null;
  const n = candidates.length;
  for (let mask = 1; mask < (1 << n); mask += 1) {
    const count = mask.toString(2).replaceAll('0', '').length;
    if (count < 3 || count > 5) continue;
    const bundle = [];
    for (let i = 0; i < n; i += 1) if (mask & (1 << i)) bundle.push(candidates[i]);
    const stats = bundleStats(bundle);
    if (!qualifies(stats)) continue;
    const totalScore = bundle.reduce((sum, item) => sum + item.score, 0);
    const diversity = stats.cases.length * 2 + stats.claim_types.length + Math.min(stats.temporal_anchors.length, 6) * 0.5;
    const weakest = Math.min(...bundle.map((item) => item.score));
    const quality = totalScore + diversity + weakest - Math.max(0, bundle.length - 4);
    if (!best || quality > best.quality) best = {bundle, stats, quality, totalScore, weakest};
  }
  return best;
}

const results = [];
for (const theory of A(theories)) {
  if (existingTheoryIds.has(theory.theory_id)) continue;
  const tTokens = theoryTokenSet(theory);
  const scored = claims
    .map((claim) => claimScore(theory, tTokens, claim))
    .sort((a, b) => b.score - a.score || a.claim.claim_id.localeCompare(b.claim.claim_id));
  const best = chooseBundle(scored);
  if (!best) continue;
  const averageScore = best.totalScore / best.bundle.length;
  const strongClaims = best.bundle.filter((item) => item.score >= 4).length;
  const confidence = averageScore >= 5 && strongClaims >= 3 ? 'strong'
    : averageScore >= 3.5 && strongClaims >= 2 ? 'moderate'
      : 'weak';
  results.push({
    theory_id: theory.theory_id,
    label: theory.label,
    explanatory_scope: A(theory.explanatory_scope),
    source_hook_id: theory.source_hook_id || null,
    confidence,
    score: Math.round(best.quality * 100) / 100,
    average_claim_score: Math.round(averageScore * 100) / 100,
    strong_claims: strongClaims,
    claim_ids: best.bundle.map((item) => item.claim.claim_id),
    claim_matches: best.bundle.map((item) => ({
      claim_id: item.claim.claim_id,
      score: item.score,
      overlap: item.overlap,
      direct_boost: item.direct_boost,
      case_ids: A(item.claim.scope?.case_ids),
      claim_type: item.claim.claim_type,
    })),
    counts: {
      claims: best.stats.claims,
      cases: best.stats.cases.length,
      places: best.stats.places.length,
      sources: best.stats.sources.length,
      claim_types: best.stats.claim_types.length,
      temporal_anchors: best.stats.temporal_anchors.length,
    },
    case_ids: best.stats.cases,
    place_ids: best.stats.places,
    source_ids: best.stats.sources,
    claim_types: best.stats.claim_types,
    temporal_anchors: best.stats.temporal_anchors,
  });
}

results.sort((a, b) => {
  const rank = {strong: 0, moderate: 1, weak: 2};
  return rank[a.confidence] - rank[b.confidence]
    || b.score - a.score
    || a.label.localeCompare(b.label, 'nb');
});

const recommended = results.filter((item) => item.confidence !== 'weak').slice(0, 30);
const report = {
  schema_version: '1.0',
  report_id: 'history_theory_evidence_candidate_audit_v2',
  subject_id: 'historie',
  status: 'DIAGNOSTIC_ONLY',
  interpretation: 'Rangeringen identifiserer kontraktgyldige kandidatbundles i eksisterende canonical evidens. Den gjør ingen teori evidence-ready og er ikke historiefaglig fasit.',
  inventory: {
    total_theories: A(theories).length,
    existing_theory_evidence_entries: existingTheoryIds.size,
    remaining_theories: A(theories).length - existingTheoryIds.size,
    validated_claims: claims.length,
    candidates_with_qualifying_bundle: results.length,
    strong_candidates: results.filter((item) => item.confidence === 'strong').length,
    moderate_candidates: results.filter((item) => item.confidence === 'moderate').length,
    weak_candidates: results.filter((item) => item.confidence === 'weak').length,
  },
  recommended,
  all_candidates: results,
};

const lines = [
  '# Historie — teori-evidens kandidat-audit V2',
  '',
  `Status: **${report.status}**`,
  '',
  report.interpretation,
  '',
  '## Inventar',
  '',
  `- Teoriobjekter totalt: **${report.inventory.total_theories}**`,
  `- Allerede kvalifisert: **${report.inventory.existing_theory_evidence_entries}**`,
  `- Gjenstående: **${report.inventory.remaining_theories}**`,
  `- Validerte claims tilgjengelig: **${report.inventory.validated_claims}**`,
  `- Kandidater med kontraktgyldig bundle: **${report.inventory.candidates_with_qualifying_bundle}**`,
  `- Sterke: **${report.inventory.strong_candidates}**, moderate: **${report.inventory.moderate_candidates}**, svake: **${report.inventory.weak_candidates}**`,
  '',
  '## Anbefalte kandidater',
  '',
  '| Teori | Treff | Score | Claims | Cases | Kilder | Claim-typer |',
  '|---|---:|---:|---:|---:|---:|---:|',
  ...recommended.map((item) => `| ${item.label} | ${item.confidence} | ${item.score} | ${item.counts.claims} | ${item.counts.cases} | ${item.counts.sources} | ${item.counts.claim_types} |`),
  '',
  '## Tolkningsgrense',
  '',
  '- Auditen er et kilde- og koblingsinventar, ikke en automatisk historiefaglig godkjenning.',
  '- Kandidater må fortsatt få teorispesifikk begrunnelse, begrensninger, alternativ fortolkning og disconfirmation-vilkår.',
  '- Svake kandidater skal ikke materialiseres uten nye claims eller kilder.',
  '',
];

fs.mkdirSync(reportDir, {recursive: true});
fs.writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`);
fs.writeFileSync(markdownPath, `${lines.join('\n')}\n`);
console.log(`Candidate audit: ${recommended.length} recommended, ${report.inventory.strong_candidates} strong, ${report.inventory.moderate_candidates} moderate.`);
