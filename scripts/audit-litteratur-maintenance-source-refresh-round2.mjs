#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const P = Object.freeze({
  evidence: 'data/fagverk/litteratur/maintenance/source-refresh-round2-2026-09-05.json',
  round1: 'data/fagverk/litteratur/maintenance/source-refresh-round1-2026-09-04.json',
  claims: 'data/fag/litteratur/litteraturvitenskap_canonical_v1/foundation_texts/poetikk_estetikk_litteraritet/claims.json',
  materializer: 'scripts/materialize-litteratur-poetics-style-v1.mjs',
  pathway: 'data/quiz/litteratur/litteratur_subject_pathways_v1.json',
  coverage: 'data/fag/litteratur/litteraturvitenskap_canonical_v1/coverage_contract_v1.json',
  status: 'data/fagverk/subject_status.json'
});
const BASELINE = 'bf3f9982180828da66635221de8058167b415869';
const AREA = 'poetikk_estetikk_litteraritet';
const EXPECTED_REPLACEMENTS = Object.freeze({
  spo06: {
    old: 'https://www.cambridge.org/core/books/critique-of-the-power-of-judgment/1B3D8A80D0A7B8C6953A88D7855B90C4',
    current: 'https://www.cambridge.org/core/books/critique-of-the-power-of-judgment/3705CD4E7C5C7B1CE079AFA9B924122E'
  },
  spo07: {
    old: 'https://www.penguinrandomhouse.com/books/294029/art-as-experience-by-john-dewey/',
    current: 'https://www.penguinrandomhouse.com/books/296640/art-as-experience-by-john-dewey/'
  },
  spo08: {
    old: 'https://www.bloomsbury.com/uk/aesthetic-theory-9781780936590/',
    current: 'https://www.bloomsbury.com/uk/aesthetic-theory-9781780936598/'
  },
  spo09: {
    old: 'https://www.cambridge.org/core/books/arabic-poetics/AA5279D26A3B57133DAFEDF8AF6CA6CF',
    current: 'https://www.cambridge.org/core/books/arabic-poetics/069E5876505AED64A8B3FD53A4A5EB4A'
  },
  spo10: {
    old: 'https://www.penguin.co.uk/books/60318/to-the-lighthouse-by-woolf-virginia/9780241371954',
    current: 'https://www.penguin.co.uk/books/57101/to-the-lighthouse-by-woolf-virginia/9780241371954'
  }
});
const EXPECTED_RETAINED = Object.freeze({
  spo01: 'https://www.cambridge.org/core/books/cambridge-history-of-literary-criticism/aristotles-poetics/901DBEBFF50D43D0709ACF7BBC6C0495',
  spo02: 'https://www.cambridge.org/core/books/cambridge-history-of-literary-criticism/plato-and-poetry/885B1DB0512C060514EFEDA2396E6E2B',
  spo03: 'https://academic.oup.com/edited-volume/37198/chapter/327329809',
  spo04: 'https://www.hup.harvard.edu/books/9780674576032',
  spo05: 'https://www.cambridge.org/core/books/expression-and-meaning/C4CBA3EB44908E98410502D821A0D4EB',
  spo11: 'https://www.gutenberg.org/ebooks/174',
  spo12: 'https://www.gutenberg.org/ebooks/521'
});

const read = (f) => JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'));
const text = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const countBy = (items, key) => items.filter((item) => item.verification_state === key).length;

export function auditLitteraturMaintenanceSourceRefreshRound2() {
  const evidence = read(P.evidence);
  const round1 = read(P.round1);
  const claims = read(P.claims);
  const pathway = read(P.pathway);
  const coverage = read(P.coverage);
  const materializer = text(P.materializer);
  const status = read(P.status).subjects.find((item) => item.id === 'litteratur');

  assert(evidence.schema === 'history_go_litteratur_maintenance_source_refresh_v1', 'Feil round-2 schema');
  assert(evidence.subject_id === 'litteratur' && evidence.round_id === 'source_refresh_round2_2026_09_05', 'Feil round-2 identitet');
  assert(evidence.baseline_main_sha === BASELINE, 'Round 2 baseline er ikke låst til forventet main');
  assert(evidence.checked_at === '2026-09-05' && evidence.status === 'verified', 'Round 2 mangler verifisert datostatus');
  assert(evidence.scope?.area_id === AREA, 'Round 2 peker på feil canonicalt område');
  assert(evidence.scope?.canonical_source_mutation === true, 'Round 2 skal dokumentere faktiske canonicale URL-erstatninger');
  assert(evidence.scope?.new_strict_subcategory === false && evidence.scope?.place_production === false, 'Round 2 har utvidet scope ulovlig');

  assert(round1.scope?.area_id === 'faggrunnlag_metode_forskningspraksis', 'Round 1 reconciliation mangler');
  assert(round1.scope.area_id !== evidence.scope.area_id, 'Round 2 dupliserer round 1-området');

  assert(Array.isArray(evidence.source_checks) && evidence.source_checks.length === 12, 'Round 2 må ha nøyaktig 12 kildekontroller');
  assert(new Set(evidence.source_checks.map((x) => x.claims_source_id)).size === 12, 'Round 2 source IDs er ikke unike');
  assert(claims.chapter_id === AREA && claims.sources.length === 12, 'Poetikk-claims må fortsatt ha 12 kilder');
  assert(new Set(claims.sources.map((x) => x.id)).size === 12, 'Poetikk-claims har dupliserte source IDs');

  const expectedIds = [...Object.keys(EXPECTED_RETAINED), ...Object.keys(EXPECTED_REPLACEMENTS)].sort();
  assert(JSON.stringify([...claims.sources.map((x) => x.id)].sort()) === JSON.stringify(expectedIds), 'Canonical source-ID-settet for poetikk er endret');
  assert(JSON.stringify([...evidence.source_checks.map((x) => x.claims_source_id)].sort()) === JSON.stringify(expectedIds), 'Maintenance-evidensen dekker ikke eksakt canonical source-ID-sett');

  assert(pathway.schema === 'history_go_subject_pathway_package_v1' && pathway.subject_id === 'litteratur', 'Pathway-pakken har feil identitet');
  assert(pathway.sources.length === 384 && new Set(pathway.sources.map((x) => x.source_id)).size === 384, 'Pathway må fortsatt ha 384 unike canonicale kilder');
  assert(pathway.sets.length === 28, 'Pathway må fortsatt ha 28 områder');
  const articleIds = pathway.sets.flatMap((set) => set.article_ids || []);
  assert(articleIds.length === 168 && new Set(articleIds).size === 168, 'Pathway må fortsatt dekke 168 artikler nøyaktig én gang');
  assert(coverage.completion_definition?.required_area_count === 28 && coverage.completion_definition?.required_topic_count === 168, 'Coverage contract har flyttet 28/168-baseline');

  const claimsById = new Map(claims.sources.map((x) => [x.id, x]));
  const evidenceById = new Map(evidence.source_checks.map((x) => [x.claims_source_id, x]));
  const corpus = `${JSON.stringify(claims)}\n${JSON.stringify(pathway)}\n${materializer}`;

  for (const [id, urls] of Object.entries(EXPECTED_REPLACEMENTS)) {
    const c = claimsById.get(id);
    const e = evidenceById.get(id);
    assert(c?.url === urls.current, `${id}: claims bruker ikke verifisert replacement URL`);
    assert(e?.verification_state === 'verified_authoritative_replacement' && e?.old_url === urls.old && e?.canonical_url === urls.current, `${id}: maintenance-evidensen dokumenterer ikke replacement korrekt`);
    assert(e?.action === 'replace_canonical_url', `${id}: feil maintenance action`);
    assert(pathway.sources.filter((x) => x.url === urls.current).length === 1, `${id}: pathway-registeret må ha nøyaktig én current URL`);
    assert(materializer.includes(urls.current), `${id}: materializer mangler current URL`);
    assert(!corpus.includes(urls.old), `${id}: gammel URL finnes fortsatt i canonical/materialized flater`);
  }

  for (const [id, url] of Object.entries(EXPECTED_RETAINED)) {
    const c = claimsById.get(id);
    const e = evidenceById.get(id);
    assert(c?.url === url && e?.canonical_url === url, `${id}: retained URL er endret`);
    assert(pathway.sources.filter((x) => x.url === url).length === 1, `${id}: pathway-registeret må beholde nøyaktig én canonical URL`);
    assert(e?.action === 'retain_canonical_url' || e?.action === 'retain_until_authoritative_replacement_is_verified', `${id}: ugyldig retain-action`);
  }

  assert(evidenceById.get('spo04')?.verification_state === 'publisher_endpoint_reachable_content_sparse_no_replacement', 'spo04 skal være sparse/no-replacement');
  assert(evidenceById.get('spo05')?.verification_state === 'fetch_indeterminate_no_replacement', 'spo05 skal være indeterminate/no-replacement');
  assert(countBy(evidence.source_checks, 'verified_authoritative_replacement') === 5, 'Round 2 skal ha fem autoritative replacements');
  assert(countBy(evidence.source_checks, 'verified_live_redirect_same_resource') === 3, 'Round 2 skal ha tre live redirect-retentions');
  assert(countBy(evidence.source_checks, 'verified_live') === 2, 'Round 2 skal ha to direkte live-retentions');
  assert(countBy(evidence.source_checks, 'publisher_endpoint_reachable_content_sparse_no_replacement') === 1, 'Round 2 skal ha ett sparse/no-replacement-endepunkt');
  assert(countBy(evidence.source_checks, 'fetch_indeterminate_no_replacement') === 1, 'Round 2 skal ha ett indeterminate/no-replacement-endepunkt');

  assert(evidence.summary?.canonical_sources_checked === 12, 'Feil source summary');
  assert(evidence.summary?.verified_live_or_redirected === 5, 'Feil live/redirect summary');
  assert(evidence.summary?.verified_authoritative_replacement === 5, 'Feil replacement summary');
  assert(evidence.summary?.publisher_endpoint_reachable_content_sparse_no_replacement === 1, 'Feil sparse summary');
  assert(evidence.summary?.fetch_indeterminate_no_replacement === 1, 'Feil indeterminate summary');
  assert(evidence.summary?.canonical_url_replacements === 5, 'Feil replacement count');
  assert(Object.values(evidence.quality_gates || {}).length === 10 && Object.values(evidence.quality_gates).every(Boolean), 'Alle ti round-2 quality gates må være sanne');

  assert(status?.navigationStatus === 'materialized', 'Litteratur navigationStatus må forbli materialized');
  assert(status?.assessmentStatus === 'audited', 'Litteratur assessmentStatus må forbli audited');
  assert(status?.editorialStatus === 'complete', 'Litteratur editorialStatus må forbli complete');
  assert(status?.nextGate === 'maintenance_and_source_refresh', 'Litteratur nextGate må forbli maintenance_and_source_refresh');

  return {
    status: 'passed',
    round: 2,
    area_id: AREA,
    sources_checked: evidence.source_checks.length,
    authoritative_replacements: countBy(evidence.source_checks, 'verified_authoritative_replacement'),
    retained_without_guessing: countBy(evidence.source_checks, 'publisher_endpoint_reachable_content_sparse_no_replacement') + countBy(evidence.source_checks, 'fetch_indeterminate_no_replacement'),
    pathway_sources: pathway.sources.length,
    canonical_areas: pathway.sets.length,
    assessed_articles: new Set(articleIds).size,
    maintained_areas_total: new Set([round1.scope.area_id, evidence.scope.area_id]).size,
    next_gate: status.nextGate
  };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const r = auditLitteraturMaintenanceSourceRefreshRound2();
    console.log(`Litteratur maintenance round 2 OK: ${r.sources_checked}/12 kilder, ${r.authoritative_replacements} autoritative URL-erstatninger, ${r.retained_without_guessing} fail-closed retentions, ${r.pathway_sources} pathway-kilder og ${r.maintained_areas_total}/28 områder vedlikeholdt.`);
  } catch (error) {
    console.error(`Litteratur maintenance round 2 FEIL: ${error.message}`);
    process.exitCode = 1;
  }
}
