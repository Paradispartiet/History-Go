#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const abs = (p) => path.join(ROOT, p);
const json = (p) => JSON.parse(fs.readFileSync(abs(p), 'utf8'));
const assert = (ok, msg) => { if (!ok) throw new Error(msg); };
const unique = (xs) => new Set(xs).size === xs.length;
const P = {
  review: 'data/fag/scenekunst/scenekunst_scholarly_source_review_v1.json',
  emner: 'data/fag/scenekunst/emner_scenekunst_canonical_v1.json',
  registry: 'data/fagverk/fagverk_registry.json',
  report: 'reports/fagverk/scenekunst-scholarly-source-audit.json'
};
const SCHOLARLY_TYPES = new Set([
  'peer-reviewed-journal-article',
  'scholarly-book-chapter',
  'scholarly-monograph',
  'scholarly-edited-volume'
]);

export function auditScenekunstScholarlySources({ writeReport = false, checkReport = true } = {}) {
  const review = json(P.review);
  const emner = json(P.emner);
  const registry = json(P.registry);
  assert(review.schema === 'history_go_fagverk_scenekunst_scholarly_source_review_v1', 'Ugyldig scholarly review-schema');
  assert(review.subject_id === 'scenekunst', 'Scholarly review gjelder feil fag');
  assert(review.source_policy?.rule?.includes('does not by itself make a source scholarly research'), 'Kildepolicy skiller ikke inspectability fra forskning');
  for (const t of ['official-university-learning-outcomes', 'official-university-programme', 'official-university-course']) {
    assert(review.source_policy?.not_sufficient_as_scholarly?.includes(t), `Kildepolicy må avvise ${t} som selvstendig forskningsbevis`);
  }

  const canonicalIds = emner.map((e) => e.emne_id);
  assert(canonicalIds.length === 20 && unique(canonicalIds), 'Canonical Scenekunst-inventar skal fortsatt være 20 unike emner');

  const sources = review.sources || [];
  assert(sources.length >= 20 && unique(sources.map((s) => s.id)), 'Scholarly review krever minst 20 unike forskningskilder');
  const sourceMap = new Map(sources.map((s) => [s.id, s]));
  for (const s of sources) {
    assert(SCHOLARLY_TYPES.has(s.type), `Ikke-scholarly kildetype i forskningslaget: ${s.id} (${s.type})`);
    assert(Array.isArray(s.authors) && s.authors.length >= 1, `Forskningskilde mangler forfatter: ${s.id}`);
    assert(Number.isInteger(s.year) && s.year >= 1900, `Forskningskilde mangler gyldig år: ${s.id}`);
    assert(s.publisher?.length >= 5, `Forskningskilde mangler publisher: ${s.id}`);
    assert(/^https:\/\//.test(s.url || ''), `Forskningskilde mangler HTTPS-locator: ${s.id}`);
    assert((s.source_location || '').length >= 60, `Forskningskilde mangler konkret source_location: ${s.id}`);
    if (s.doi) assert(s.url.includes('doi.org/'), `DOI-kilde skal bruke DOI-locator: ${s.id}`);
  }

  const coverage = review.coverage || [];
  assert(coverage.length === 20 && unique(coverage.map((c) => c.emne_id)), 'Scholarly coverage skal ha nøyaktig én rad per canonical emne');
  assert(canonicalIds.every((id) => coverage.some((c) => c.emne_id === id)), 'Ikke alle canonicale emner har scholarly review');
  const subject = registry.subjects?.scenekunst;
  assert(subject?.chapters?.length === 4, 'Scenekunst registry skal fortsatt ha fire kapitler');
  const chapterMap = new Map(subject.chapters.map((c) => [c.id, c]));
  const allClaimIds = [];
  const chapterSources = new Map(subject.chapters.map((c) => [c.id, new Set()]));

  for (const c of coverage) {
    assert(chapterMap.has(c.chapter_id), `Coverage peker på ukjent kapittel: ${c.chapter_id}`);
    assert(Array.isArray(c.claim_ids) && c.claim_ids.length === 3 && unique(c.claim_ids), `${c.emne_id} skal scholarly-reviewe tre unike claims`);
    assert(Array.isArray(c.scholarly_source_ids) && c.scholarly_source_ids.length >= 2 && unique(c.scholarly_source_ids), `${c.emne_id} mangler minst to uavhengige scholarly kilder`);
    assert(c.scholarly_source_ids.every((id) => sourceMap.has(id)), `${c.emne_id} refererer ukjent scholarly kilde`);
    assert((c.review_note || '').length >= 120, `${c.emne_id} mangler substansiell scholarly review-note`);
    c.scholarly_source_ids.forEach((id) => chapterSources.get(c.chapter_id).add(id));
    allClaimIds.push(...c.claim_ids);

    const root = json(chapterMap.get(c.chapter_id).file);
    const claimsDoc = json(root.claimsFile);
    const claimSet = new Set(claimsDoc.claims.map((x) => x.id));
    assert(c.claim_ids.every((id) => claimSet.has(id)), `${c.emne_id} scholarly coverage er ikke bundet til faktiske claims`);
    let actualSection = null;
    for (const modPath of root.moduleFiles || []) {
      const mod = json(modPath);
      const found = mod.sections?.find((s) => s.id === c.section_id);
      if (found) actualSection = found;
    }
    assert(actualSection, `${c.emne_id} scholarly coverage peker på ukjent seksjon ${c.section_id}`);
    assert(actualSection.emne_id === c.emne_id, `${c.section_id} scholarly coverage peker på feil canonical emne`);
    const actualClaimIds = (actualSection.paragraphClaimIds || []).flat();
    assert(JSON.stringify(actualClaimIds) === JSON.stringify(c.claim_ids), `${c.emne_id} scholarly claim-set matcher ikke faktisk paragraph trace`);
  }

  assert(allClaimIds.length === 60 && unique(allClaimIds), 'Scholarly review skal dekke 60 unike claims');
  const expectedClaims = Array.from({ length: 60 }, (_, i) => `scn-${String(i + 1).padStart(3, '0')}`);
  assert(JSON.stringify([...allClaimIds].sort()) === JSON.stringify(expectedClaims), 'Scholarly review dekker ikke scn-001..scn-060 nøyaktig én gang');
  for (const [chapterId, ids] of chapterSources) assert(ids.size >= 3, `${chapterId} har for smalt scholarly kildegrunnlag`);

  const typeCounts = Object.fromEntries([...SCHOLARLY_TYPES].map((t) => [t, sources.filter((s) => s.type === t).length]));
  const report = {
    schema: 'history_go_fagverk_scenekunst_scholarly_source_audit_v1',
    version: '1.0.0',
    status: 'scholarly_source_quality_green',
    subject: 'scenekunst',
    summary: {
      canonicalEmneCount: 20,
      claimCount: 60,
      chapterCount: 4,
      scholarlySourceCount: sources.length,
      peerReviewedArticleCount: typeCounts['peer-reviewed-journal-article'],
      minimumSourcesPerEmne: Math.min(...coverage.map((c) => c.scholarly_source_ids.length))
    },
    sourceTypeCounts: typeCounts,
    chapterScholarlySourceCounts: Object.fromEntries([...chapterSources].map(([id, set]) => [id, set.size])),
    gates: {
      sourceTypeDistinctionExplicit: true,
      universityProgrammePagesNotCountedAsResearch: true,
      allCanonicalEmnerScholarlyReviewed: true,
      allClaimsScholarlyReviewed: true,
      everyEmneHasMultipleScholarlySources: true,
      everyChapterHasScholarlyBreadth: true,
      scholarlyCoverageBoundToActualParagraphClaims: true,
      primaryAndScholarlyRolesSeparated: true
    }
  };

  if (writeReport) {
    fs.mkdirSync(path.dirname(abs(P.report)), { recursive: true });
    fs.writeFileSync(abs(P.report), `${JSON.stringify(report, null, 2)}\n`);
  }
  if (checkReport) {
    assert(fs.existsSync(abs(P.report)), `${P.report} mangler`);
    assert(JSON.stringify(json(P.report)) === JSON.stringify(report), `${P.report} er utdatert`);
  }
  return report;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = new Set(process.argv.slice(2));
  try {
    const r = auditScenekunstScholarlySources({ writeReport: args.has('--write-report'), checkReport: !args.has('--no-check-report') });
    console.log(`Scenekunst scholarly source quality OK: ${r.summary.scholarlySourceCount} scholarly kilder / ${r.summary.canonicalEmneCount} emner / ${r.summary.claimCount} claims.`);
  } catch (e) {
    console.error(`Scenekunst scholarly source quality FEIL: ${e.message}`);
    process.exitCode = 1;
  }
}
