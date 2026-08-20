#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { auditByComplete } from '../scripts/audit-fagverk-by-complete.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const abs = relativePath => path.join(ROOT, relativePath);
const json = relativePath => JSON.parse(fs.readFileSync(abs(relativePath), 'utf8'));
const text = value => String(value ?? '').trim();

const STOPWORDS = new Set([
  'og','eller','som','for','med','til','fra','av','i','på','om','en','et','den','det','de','der','hvordan','hva','hvor','mellom','mot','ved','kan','skal','blir','bruk','brukes','byen','by','urban','urbane','analyse','lesning'
]);
const LIMIT_RE = /\b(ikke|aldri|begrens|begrensning|avheng|forutset|usikker|varier|kan ikke|uten å|må skille|skille mellom|sier ikke|beviser ikke|automatisk|universell|konflikt|trade.?off)\b/giu;
const ALTERNATIVE_RE = /\b(alternativ|sammenlign|sammenligne|kontrast|på den ene|på den andre|versus|vs\.?|både|samtidig|ulike|forskjellig|rival|konflikt|spenning)\b/giu;
const SOURCE_QUALITY_RE = /(universit|university|press|journal|review|evidence|evidens|research|forskning|who|world health|un-habitat|oecd|ssb|statistisk sentralbyrå|nibr|nina|toi|transportøkonomisk|forskningsråd|miljødirektorat|riksantikvar|museum|arkiv|institutt)/iu;

function tokens(value) {
  return [...new Set(text(value)
    .toLocaleLowerCase('nb-NO')
    .normalize('NFKD')
    .replace(/\p{M}/gu, '')
    .split(/[^\p{L}\p{N}]+/u)
    .filter(token => token.length >= 4 && !STOPWORDS.has(token)))];
}

function sectionText(section) {
  return [
    section.title,
    ...(section.paragraphs || []),
    ...(section.keyPoints || [])
  ].map(text).filter(Boolean).join('\n');
}

function loadDomainCorpus(chapterRecords) {
  const sections = [];
  const claims = [];
  const sources = [];
  for (const record of chapterRecords) {
    const chapter = json(record.file);
    const claimRegistry = json(chapter.claimsFile);
    claims.push(...(claimRegistry.claims || []).map(claim => ({ ...claim, chapterId: chapter.id })));
    sources.push(...(claimRegistry.sources || []).map(source => ({ ...source, chapterId: chapter.id })));
    for (const modulePath of chapter.moduleFiles || []) {
      const module = json(modulePath);
      for (const section of module.sections || []) {
        sections.push({
          chapterId: chapter.id,
          modulePath,
          sectionId: section.id,
          title: section.title,
          paragraphs: section.paragraphs || [],
          keyPoints: section.keyPoints || [],
          claimIds: [...new Set((section.paragraphClaimIds || []).flat().concat((section.keyPointClaimIds || []).flat()).map(text).filter(Boolean))],
          prose: sectionText(section)
        });
      }
    }
  }
  return { sections, claims, sources };
}

function hookSectionCandidates(hook, sections) {
  const hookTokens = tokens([
    hook.title,
    ...(hook.canon?.thinkers || []).flatMap(thinker => [thinker.why, ...(thinker.works || [])])
  ].flat().join(' '));
  return sections.map(section => {
    const sectionTokens = new Set(tokens(section.prose));
    const overlap = hookTokens.filter(token => sectionTokens.has(token));
    return {
      sectionId: section.sectionId,
      chapterId: section.chapterId,
      score: overlap.length,
      overlap
    };
  }).filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score || a.sectionId.localeCompare(b.sectionId))
    .slice(0, 3);
}

function countMatches(regex, values) {
  let count = 0;
  for (const value of values) {
    regex.lastIndex = 0;
    const matches = text(value).match(regex);
    count += matches?.length || 0;
  }
  return count;
}

function uniqueBy(items, keyFn) {
  const seen = new Set();
  return items.filter(item => {
    const key = keyFn(item);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

const { report: completeReport } = auditByComplete({ checkReport: true });
const registry = json('data/fagverk/fagverk_registry.json');
const fagkart = json('data/fag/by/fagkart_by.json');
const byRegistry = registry.subjects.by;

const domains = (fagkart.categories || []).map(domain => {
  const chapterRecords = (byRegistry.chapters || []).filter(chapter => chapter.primary_domain_id === domain.id);
  const { sections, claims, sources } = loadDomainCorpus(chapterRecords);
  const hooks = domain.topic_hooks || [];
  const thinkers = uniqueBy(hooks.flatMap(hook => hook.canon?.thinkers || []), thinker => text(thinker.id || thinker.name));
  const thinkersWithWorks = thinkers.filter(thinker => (thinker.works || []).some(work => text(work)));
  const comparisonPairCount = hooks.reduce((sum, hook) => sum + (hook.comparison_pairs || []).length, 0);
  const proseValues = sections.flatMap(section => [section.title, ...(section.paragraphs || []), ...(section.keyPoints || [])]);
  const limitationSignalCount = countMatches(LIMIT_RE, proseValues);
  const alternativeSignalCount = countMatches(ALTERNATIVE_RE, proseValues);
  const qualitySources = sources.filter(source => SOURCE_QUALITY_RE.test([
    source.publisher,
    source.type,
    source.title,
    source.label,
    source.source_location,
    source.url
  ].map(text).join(' ')));
  const usedClaimIds = new Set(sections.flatMap(section => section.claimIds));
  const verifiedUsedClaims = claims.filter(claim => claim.status === 'verified' && usedClaimIds.has(claim.id) && (claim.source_ids || []).length > 0);
  const hookCandidates = hooks.map(hook => ({
    hookId: hook.id,
    title: hook.title,
    emneCount: (hook.emne_ids || []).length,
    thinkerCount: (hook.canon?.thinkers || []).length,
    thinkerWorkCount: (hook.canon?.thinkers || []).filter(thinker => (thinker.works || []).some(work => text(work))).length,
    comparisonPairCount: (hook.comparison_pairs || []).length,
    candidates: hookSectionCandidates(hook, sections)
  }));

  return {
    domainId: domain.id,
    title: domain.title,
    chapterCount: chapterRecords.length,
    chapterIds: chapterRecords.map(chapter => chapter.id),
    canonicalEmneCount: new Set(hooks.flatMap(hook => hook.emne_ids || [])).size,
    hookCount: hooks.length,
    uniqueThinkerCount: thinkers.length,
    thinkersWithWorksCount: thinkersWithWorks.length,
    comparisonPairCount,
    sectionCount: sections.length,
    paragraphCount: sections.reduce((sum, section) => sum + section.paragraphs.length, 0),
    verifiedUsedClaimCount: verifiedUsedClaims.length,
    sourceCount: sources.length,
    qualitySourceCount: qualitySources.length,
    qualitySourcePublishers: [...new Set(qualitySources.map(source => text(source.publisher)).filter(Boolean))].sort(),
    limitationSignalCount,
    alternativeSignalCount,
    candidateHooksWithProseMatch: hookCandidates.filter(hook => hook.candidates.length > 0).length,
    hookCandidates
  };
});

const hybridMinimum = {
  structuredUnits: 5,
  namedPeopleOrWorks: 2,
  rivalOrLimitSignals: 2,
  contentBindings: 4
};

const fieldReadiness = domains.map(domain => ({
  domainId: domain.domainId,
  structuredUnitsReady: domain.hookCount >= hybridMinimum.structuredUnits || domain.sectionCount >= hybridMinimum.structuredUnits,
  namedPeopleOrWorksReady: domain.thinkersWithWorksCount >= hybridMinimum.namedPeopleOrWorks,
  rivalOrLimitReady: domain.comparisonPairCount >= 1 && (domain.limitationSignalCount + domain.alternativeSignalCount) >= hybridMinimum.rivalOrLimitSignals,
  contentBindingsReady: domain.verifiedUsedClaimCount >= hybridMinimum.contentBindings && domain.candidateHooksWithProseMatch >= 1,
  sourceQualityReady: domain.qualitySourceCount >= 2,
  actualProseAvailable: domain.paragraphCount >= 4,
  noContentRepairInferred: true
}));

const result = {
  schema: 'history_go_by_theory_integrity_probe_v1',
  version: '1.0.0',
  mode: 'read_only_diagnostic',
  mainAssumption: 'Proof gaps are not content gaps. This probe measures whether existing canonical By structure, claims, sources and registered prose can carry a strict field-level adapter without rewriting subject content.',
  completeAuditSummary: completeReport.summary,
  canonicalMajorFieldCount: domains.length,
  hybridMinimum,
  summary: {
    fieldsMeasured: domains.length,
    fieldsWithStructuredUnits: fieldReadiness.filter(row => row.structuredUnitsReady).length,
    fieldsWithNamedPeopleOrWorks: fieldReadiness.filter(row => row.namedPeopleOrWorksReady).length,
    fieldsWithRivalOrLimitSignals: fieldReadiness.filter(row => row.rivalOrLimitReady).length,
    fieldsWithContentBindings: fieldReadiness.filter(row => row.contentBindingsReady).length,
    fieldsWithSourceQuality: fieldReadiness.filter(row => row.sourceQualityReady).length,
    fieldsWithActualProse: fieldReadiness.filter(row => row.actualProseAvailable).length,
    fieldsReadyForBridgeCandidate: fieldReadiness.filter(row => row.structuredUnitsReady && row.namedPeopleOrWorksReady && row.rivalOrLimitReady && row.contentBindingsReady && row.sourceQualityReady && row.actualProseAvailable).length,
    substantiveContentGapsProven: 0
  },
  fieldReadiness,
  domains
};

console.log(JSON.stringify(result, null, 2));
