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
  'og','eller','som','for','med','til','fra','av','i','på','om','en','et','den','det','de','der','hvordan','hva','hvor','mellom','mot','ved','kan','skal','blir','bruk','brukes','byen','by','urban','urbane','analyse','lesning','perspektiv','modell','teori','tilnærming'
]);
const LIMIT_RE = /\b(ikke|aldri|begrens|begrensning|avheng|forutset|usikker|varier|kan ikke|uten å|må skille|skille mellom|sier ikke|beviser ikke|automatisk|universell|konflikt|trade.?off)\b/giu;
const ALTERNATIVE_RE = /\b(alternativ|sammenlign|sammenligne|kontrast|på den ene|på den andre|versus|vs\.?|både|samtidig|ulike|forskjellig|rival|konflikt|spenning)\b/giu;
const AUTHORITATIVE_CLAIM_SOURCE_TYPE_RE = /(academic|research|official|national|municipal|law|regulation|statistic|audit|government|authority|register|guidance|strategy|policy|report|archive|museum|institute|institutional|directorate|dataset|plan)/iu;

function tokens(value) {
  return [...new Set(text(value)
    .toLocaleLowerCase('nb-NO')
    .normalize('NFKD')
    .replace(/\p{M}/gu, '')
    .split(/[^\p{L}\p{N}]+/u)
    .filter(token => token.length >= 4 && !STOPWORDS.has(token)))];
}

function sectionText(section) {
  return [section.title, ...(section.paragraphs || []), ...(section.keyPoints || [])]
    .map(text).filter(Boolean).join('\n');
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

function hookSectionCandidates(hook, sections, verifiedClaimIds) {
  const titleTokens = tokens(hook.title);
  const rationaleTokens = tokens((hook.canon?.thinkers || []).map(thinker => thinker.why).join(' '));
  const workTokens = tokens((hook.canon?.thinkers || []).flatMap(thinker => thinker.works || []).join(' '));
  const combinedTokens = [...new Set([...titleTokens, ...rationaleTokens, ...workTokens])];
  return sections.map(section => {
    const sectionTokens = new Set(tokens(section.prose));
    const overlap = combinedTokens.filter(token => sectionTokens.has(token));
    const titleOverlap = titleTokens.filter(token => sectionTokens.has(token));
    const rationaleOverlap = rationaleTokens.filter(token => sectionTokens.has(token));
    const workOverlap = workTokens.filter(token => sectionTokens.has(token));
    const verifiedClaims = section.claimIds.filter(id => verifiedClaimIds.has(id));
    return {
      sectionId: section.sectionId,
      chapterId: section.chapterId,
      score: overlap.length,
      overlap,
      titleOverlap,
      rationaleOverlap,
      workOverlap,
      verifiedClaimCount: verifiedClaims.length,
      verifiedClaimIds: verifiedClaims,
      substantive: overlap.length >= 2 && verifiedClaims.length > 0
    };
  }).filter(item => item.score > 0)
    .sort((a, b) => Number(b.substantive) - Number(a.substantive) || b.score - a.score || b.verifiedClaimCount - a.verifiedClaimCount || a.sectionId.localeCompare(b.sectionId))
    .slice(0, 8);
}

function countMatches(regex, values) {
  let count = 0;
  for (const value of values) {
    regex.lastIndex = 0;
    count += text(value).match(regex)?.length || 0;
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
  const thinkersWithWorks = thinkers.filter(thinker => text(thinker.why) && (thinker.works || []).some(work => text(work)));
  const comparisonPairCount = hooks.reduce((sum, hook) => sum + (hook.comparison_pairs || []).length, 0);
  const proseValues = sections.flatMap(section => [section.title, ...(section.paragraphs || []), ...(section.keyPoints || [])]);
  const limitationSignalCount = countMatches(LIMIT_RE, proseValues);
  const alternativeSignalCount = countMatches(ALTERNATIVE_RE, proseValues);
  const usedClaimIds = new Set(sections.flatMap(section => section.claimIds));
  const verifiedUsedClaims = claims.filter(claim => claim.status === 'verified' && usedClaimIds.has(claim.id) && (claim.source_ids || []).length > 0);
  const verifiedClaimIds = new Set(verifiedUsedClaims.map(claim => claim.id));
  const usedSourceIds = new Set(verifiedUsedClaims.flatMap(claim => claim.source_ids || []));
  const usedSources = sources.filter(source => usedSourceIds.has(source.id));
  const authoritativeUsedSources = usedSources.filter(source =>
    /^https:\/\//.test(text(source.url)) &&
    AUTHORITATIVE_CLAIM_SOURCE_TYPE_RE.test([source.type, source.publisher, source.title].map(text).join(' '))
  );

  const hookCandidates = hooks.map(hook => {
    const candidates = hookSectionCandidates(hook, sections, verifiedClaimIds);
    const thinkersOnHook = hook.canon?.thinkers || [];
    const thinkerWorkCount = thinkersOnHook.filter(thinker => text(thinker.why) && (thinker.works || []).some(work => text(work))).length;
    return {
      hookId: hook.id,
      title: hook.title,
      emneCount: (hook.emne_ids || []).length,
      thinkerCount: thinkersOnHook.length,
      thinkerWorkCount,
      comparisonPairCount: (hook.comparison_pairs || []).length,
      substantiveCandidateCount: candidates.filter(candidate => candidate.substantive).length,
      bearingHook: thinkerWorkCount >= 2 && candidates.some(candidate => candidate.substantive),
      candidates
    };
  });

  const substantiveBindings = uniqueBy(
    hookCandidates.flatMap(hook => hook.candidates.filter(candidate => candidate.substantive).map(candidate => ({ hookId: hook.hookId, ...candidate }))),
    item => `${item.hookId}:${item.sectionId}`
  );

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
    usedSourceCount: usedSources.length,
    authoritativeUsedSourceCount: authoritativeUsedSources.length,
    authoritativeSourceTypes: [...new Set(authoritativeUsedSources.map(source => text(source.type)).filter(Boolean))].sort(),
    limitationSignalCount,
    alternativeSignalCount,
    bearingHookCount: hookCandidates.filter(hook => hook.bearingHook).length,
    substantiveHookProseBindingCount: substantiveBindings.length,
    substantiveBoundSectionCount: new Set(substantiveBindings.map(item => item.sectionId)).size,
    hookCandidates
  };
});

const hybridMinimum = {
  structuredUnits: 5,
  namedPeopleOrWorks: 2,
  rivalOrLimitSignals: 2,
  contentBindings: 4,
  authoritativeClaimSources: 4,
  substantiveProseSections: 2
};

const fieldReadiness = domains.map(domain => ({
  domainId: domain.domainId,
  structuredUnitsReady: domain.hookCount >= hybridMinimum.structuredUnits || domain.sectionCount >= hybridMinimum.structuredUnits,
  namedPeopleOrWorksReady: domain.thinkersWithWorksCount >= hybridMinimum.namedPeopleOrWorks,
  bearingTheoryOrModelReady: domain.bearingHookCount >= 1,
  rivalOrLimitReady: domain.comparisonPairCount >= 1 && (domain.limitationSignalCount + domain.alternativeSignalCount) >= hybridMinimum.rivalOrLimitSignals,
  contentBindingsReady: domain.verifiedUsedClaimCount >= hybridMinimum.contentBindings,
  academicallyAppropriateSourcesReady: domain.authoritativeUsedSourceCount >= hybridMinimum.authoritativeClaimSources && domain.thinkersWithWorksCount >= hybridMinimum.namedPeopleOrWorks,
  actualProseBindingReady: domain.substantiveBoundSectionCount >= hybridMinimum.substantiveProseSections,
  noContentRepairInferred: true
}));

const ready = row => row.structuredUnitsReady && row.namedPeopleOrWorksReady && row.bearingTheoryOrModelReady && row.rivalOrLimitReady && row.contentBindingsReady && row.academicallyAppropriateSourcesReady && row.actualProseBindingReady;

const result = {
  schema: 'history_go_by_theory_integrity_probe_v1',
  version: '1.1.0',
  mode: 'read_only_diagnostic',
  sourceModel: {
    theoryGrounding: 'Canonical thinker work + substantive contribution metadata; institutional programme pages never serve as theory evidence.',
    empiricalClaimGrounding: 'Verified claim-bound primary, legal, statistical, audit, research or other authoritative sources appropriate to the applied urban claim.'
  },
  mainAssumption: 'Proof gaps are not content gaps. This probe measures whether existing canonical By structure, claims, sources and registered prose can carry a strict field-level adapter without rewriting subject content.',
  completeAuditSummary: completeReport.summary,
  canonicalMajorFieldCount: domains.length,
  hybridMinimum,
  summary: {
    fieldsMeasured: domains.length,
    fieldsWithStructuredUnits: fieldReadiness.filter(row => row.structuredUnitsReady).length,
    fieldsWithNamedPeopleOrWorks: fieldReadiness.filter(row => row.namedPeopleOrWorksReady).length,
    fieldsWithBearingTheoryOrModel: fieldReadiness.filter(row => row.bearingTheoryOrModelReady).length,
    fieldsWithRivalOrLimitSignals: fieldReadiness.filter(row => row.rivalOrLimitReady).length,
    fieldsWithContentBindings: fieldReadiness.filter(row => row.contentBindingsReady).length,
    fieldsWithAcademicallyAppropriateSources: fieldReadiness.filter(row => row.academicallyAppropriateSourcesReady).length,
    fieldsWithActualProseBinding: fieldReadiness.filter(row => row.actualProseBindingReady).length,
    fieldsReadyForPermanentGate: fieldReadiness.filter(ready).length,
    substantiveContentGapsProven: 0
  },
  fieldReadiness,
  domains
};

console.log(JSON.stringify(result, null, 2));
