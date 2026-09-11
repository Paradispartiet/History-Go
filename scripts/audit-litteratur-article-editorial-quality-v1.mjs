#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PACKAGE = 'data/fag/litteratur/litteraturvitenskap_canonical_v1';
const read = (file) => JSON.parse(fs.readFileSync(path.join(ROOT, file), 'utf8'));
const words = (value) => String(value || '').trim().split(/\s+/u).filter(Boolean).length;
const check = (condition, message) => { if (!condition) throw new Error(message); };
const genericLocator = /^(verk-, prosjekt- eller institusjonspresentasjon|nettside|landingsside|hele verket)$/iu;
const labelClaim = /^[^.!?]{2,80}:\s*[^.!?]{2,120}\.?$/u;
const THEORY_OR_RESEARCH = /\b(?:\p{L}*teori\p{L}*|modell\p{L}*|\p{L}*forskn\p{L}*|formalisme\p{L}*|nykritikk\p{L}*|hermeneut\p{L}*|struktural\p{L}*|semiot\p{L}*|narratolog\p{L}*|resepsjon\p{L}*|diskurs\p{L}*|dekonstruksjon\p{L}*|psykoanal\p{L}*|fenomenolog\p{L}*|marxis\p{L}*|feminis\p{L}*|queer\p{L}*|postkolon\p{L}*|dekolon\p{L}*|okokrit\p{L}*|kognitiv\p{L}*|empirisk\p{L}*|intertekst\p{L}*|paratekst\p{L}*|poetikk\p{L}*|retorikk\p{L}*|filologi\p{L}*)/iu;
const METHOD = /\b(?:metod\p{L}*|analyse\p{L}*|nærles\p{L}*|naerles\p{L}*|kompar\p{L}*|sammenlign\p{L}*|tekstkrit\p{L}*|kontekstual\p{L}*|korpus\p{L}*|operasjonalis\p{L}*|kartlegg\p{L}*|registr\p{L}*|arkiv\p{L}*|empirisk\p{L}*|historisk\p{L}*)/iu;
const LIMIT = /\b(?:inferensgrense\p{L}*|kildegrense\p{L}*|begrens\p{L}*|kan ikke|ikke alene|ikke automatisk|usikker\p{L}*|forbehold\p{L}*|avgrens\p{L}*|rekkevidde\p{L}*|moteksempel\p{L}*)/iu;
const DISAGREEMENT = /\b(?:alternativ\p{L}*|rivaliser\p{L}*|konkurrer\p{L}*|motles\p{L}*|motmodell\p{L}*|kontrast\p{L}*|spenning\p{L}*|uenig\p{L}*|motstrid\p{L}*|debatt\p{L}*|kritikk\p{L}*|utfordr\p{L}*)/iu;
const BACKGROUND = /\b(?:histor\p{L}*|institusjon\p{L}*|medie\p{L}*|arkiv\p{L}*|forlag\p{L}*|tradisjon\p{L}*|periode\p{L}*|århund\p{L}*|tidlig\p{L}*|senere\p{L}*|samtid\p{L}*|kultur\p{L}*|samfunn\p{L}*|system\p{L}*|praksis\p{L}*)/iu;
const DEFINITION = /\b(?:er|betegner|viser til|forstås|definer\p{L}*|skiller|omfatter|undersøker)\b/iu;
const SCHOLARLY = /(?:fagfelle|vitenskap|fagbok|monografi|tidsskrift|universitet|forskn|encyclopedia|companion|handbook)/iu;
const unique = (items) => [...new Set(items.filter(Boolean))];

function loadCommon() {
  const coverage = read(`${PACKAGE}/coverage_contract_v1.json`);
  const registry = read(`${PACKAGE}/editorial_quality_v1.json`);
  const foundations = read(`${PACKAGE}/topic_foundations_v1.json`);
  const areaById = new Map(coverage.coverage_areas.map((area) => [area.id, area]));
  const foundationByTopic = new Map((foundations.areas || []).flatMap((area) => (area.topics || []).map((topic) => [topic.id, topic])));
  return { coverage, registry, areaById, foundationByTopic };
}

export function auditLitteraturArticleEditorialQuality() {
  const { coverage, registry, areaById } = loadCommon();

  check(registry.schema === 'history_go_literature_editorial_quality_v1', 'Feil redaksjonelt registerschema');
  check(registry.contract === 'docs/LITTERATUR_ARTICLE_EDITORIAL_CONTRACT_V1.md', 'Registeret peker ikke til redaksjonell kontrakt');
  check(registry.totals.areas === coverage.progress.areas_total && registry.totals.topics === coverage.progress.topics_total, 'Redaksjonelle totaler er ikke synkronisert');
  check(registry.totals.editorialReadyAreas === registry.areas.length, 'Feil antall redaksjonelt ferdige områder');
  check(registry.totals.editorialReadyTopics === registry.areas.reduce((sum, area) => sum + area.topicCount, 0), 'Feil antall redaksjonelt ferdige artikler');
  check(registry.totals.rewritePendingAreas === registry.pendingAreaIds.length, 'Feil antall pending-områder');
  check(registry.totals.editorialReadyAreas + registry.totals.rewritePendingAreas === registry.totals.areas, 'Områdestatusene dekker ikke hele feltet');
  check(registry.totals.editorialReadyTopics + registry.totals.rewritePendingTopics === registry.totals.topics, 'Artikkelstatusene dekker ikke hele feltet');
  check(new Set([...registry.areas.map((area) => area.areaId), ...registry.pendingAreaIds]).size === registry.totals.areas, 'Områder overlapper eller mangler i redaksjonelt register');

  const sentenceCounts = new Map();
  let articleCount = 0;
  let paragraphCount = 0;
  for (const entry of registry.areas) {
    const area = areaById.get(entry.areaId);
    check(area && entry.status === 'editorial_ready_v1', `${entry.areaId}: ugyldig redaksjonell status`);
    check(entry.topicCount === area.topics.length, `${entry.areaId}: feil artikkelantall`);
    const chapter = read(`${PACKAGE}/foundation_texts/${entry.areaId}.json`);
    check(chapter.editorial_status === 'editorial_ready_v1', `${entry.areaId}: kapittelet er ikke redaksjonelt frigitt`);
    check(chapter.qualityProfile === 'full_depth_v2', `${entry.areaId}: mangler full-dybdeprofil`);
    const modules = chapter.moduleFiles.map(read);
    const sections = modules.flatMap((module) => module.sections || []);
    check(sections.length === 6, `${entry.areaId}: krever seks hovedartikler`);
    check(JSON.stringify(sections.map((section) => section.coverageTopic)) === JSON.stringify(area.topics), `${entry.areaId}: artiklene følger ikke canonical rekkefølge`);

    const claimFile = read(chapter.claimsFile);
    const conceptRegistry = read(chapter.conceptRegistry);
    const claimById = new Map(claimFile.claims.map((claim) => [claim.id, claim]));
    check(conceptRegistry.editorial_status === 'editorial_ready_v1', `${entry.areaId}: begrepsregisteret er ikke redaksjonelt frigitt`);
    for (const concept of conceptRegistry.concepts) {
      check(words(concept.definition) >= 10, `${entry.areaId}/${concept.id}: begrepsdefinisjonen er for kort`);
      check(words(concept.distinguish_from) >= 4, `${entry.areaId}/${concept.id}: begrepsgrensen er for kort`);
      check(!/Begrepet skal knyttes til bestemte verk/iu.test(concept.definition), `${entry.areaId}/${concept.id}: generisk definisjonssuffiks`);
      check(!/krever en annen analyseenhet eller evidenstype/iu.test(concept.distinguish_from), `${entry.areaId}/${concept.id}: generisk grensesuffiks`);
    }
    for (const source of claimFile.sources) {
      check(words(source.source_location) >= 3 && !genericLocator.test(source.source_location.trim()), `${entry.areaId}/${source.id}: upresis source_location`);
    }
    for (const claim of claimFile.claims) {
      check(words(claim.claim) >= 8 && !labelClaim.test(claim.claim.trim()), `${entry.areaId}/${claim.id}: etikett-claim er ikke en proposisjon`);
    }

    for (const section of sections) {
      articleCount += 1;
      paragraphCount += section.paragraphs.length;
      check(section.paragraphs.length >= 5, `${entry.areaId}/${section.id}: færre enn fem fagavsnitt`);
      check(words(section.paragraphs.join(' ')) >= 430, `${entry.areaId}/${section.id}: artikkelen er kortere enn 430 ord`);
      check(section.paragraphClaimIds?.length === section.paragraphs.length, `${entry.areaId}/${section.id}: claim-spor mangler`);
      check(section.paragraphClaimIds.every((ids) => ids.length > 0 && ids.every((id) => claimById.has(id))), `${entry.areaId}/${section.id}: hvert avsnitt trenger gyldig claim-spor`);
      check(new Set(section.paragraphClaimIds.flat()).size >= 4, `${entry.areaId}/${section.id}: for få særskilte claims`);
      const prose = section.paragraphs.join(' ');
      check(!/Artikkelen behandler/u.test(prose), `${entry.areaId}/${section.id}: serieprodusert åpning`);
      check(!/\b[a-zæøå0-9]+(?:_[a-zæøå0-9]+){2,}\b/u.test(prose), `${entry.areaId}/${section.id}: rå canonical-ID i leserprosa`);
      check(section.paragraphs.every((paragraph) => /^\p{Lu}/u.test(paragraph.trim())), `${entry.areaId}/${section.id}: avsnitt starter ikke med stor bokstav`);
      check((section.keyPoints || []).some((point) => /grense|begrens|skiller|ikke|usikker|alternativ|utfordr|for grov|trengs før/iu.test(point)), `${entry.areaId}/${section.id}: mangler synlig inferensgrense`);
      for (const sentence of prose.split(/(?<=[.!?])\s+/u).map((value) => value.trim()).filter((value) => words(value) >= 8)) {
        sentenceCounts.set(sentence, (sentenceCounts.get(sentence) || 0) + 1);
      }
    }
  }
  const repeated = [...sentenceCounts.entries()].filter(([, count]) => count >= 3);
  check(repeated.length === 0, `Samme hele setning er gjentatt i minst tre artikler: ${repeated[0]?.[0] || ''}`);
  return { areaCount: registry.areas.length, articleCount, paragraphCount, pendingAreaCount: registry.pendingAreaIds.length };
}

export function auditLitteraturExpandedArticleRequirements() {
  auditLitteraturArticleEditorialQuality();
  const { registry, foundationByTopic } = loadCommon();
  const reviews = [];

  for (const entry of registry.areas) {
    const chapter = read(`${PACKAGE}/foundation_texts/${entry.areaId}.json`);
    const claimFile = read(chapter.claimsFile);
    const claimById = new Map(claimFile.claims.map((claim) => [claim.id, claim]));
    const sourceById = new Map(claimFile.sources.map((source) => [source.id, source]));
    const modules = chapter.moduleFiles.map(read);
    const fulfillment = chapter.expandedContractFulfillment ? read(`${PACKAGE}/${chapter.expandedContractFulfillment}`) : null;
    const fulfillmentByTopic = new Map((fulfillment?.topicEvidence || []).map((row) => [row.topicId, row]));

    for (const module of modules) {
      const sections = module.sections || [];
      const examples = module.workedExamples || [];
      check(examples.length >= sections.length, `${entry.areaId}/${module.id}: hvert artikkelemne må ha et deklarert arbeidseksempel`);
      for (let index = 0; index < sections.length; index += 1) {
        const section = sections[index];
        const foundation = foundationByTopic.get(section.coverageTopic);
        const topicEvidence = fulfillmentByTopic.get(section.coverageTopic);
        const workedExample = examples[index];
        check(foundation, `${entry.areaId}/${section.id}: mangler canonical topic-foundation`);
        check(workedExample && words(workedExample.object) >= 3, `${entry.areaId}/${section.id}: mangler deklarert arbeidseksempel`);
        const claimIds = unique((section.paragraphClaimIds || []).flat());
        const claims = claimIds.map((id) => claimById.get(id)).filter(Boolean);
        const sourceIds = unique(claims.flatMap((claim) => claim.source_ids || []));
        const sources = sourceIds.map((id) => sourceById.get(id)).filter(Boolean);
        const scholarlyUsedSources = sources.filter((source) => SCHOLARLY.test([source.type, source.publisher, source.label].filter(Boolean).join(' ')));
        const prose = section.paragraphs.join(' ');
        const prompts = (section.keyPoints || []).join(' ');
        const combined = [prose, prompts, foundation.text, (foundation.concepts || []).join(' '), workedExample.object, ...(workedExample.steps || [])].join(' ');
        const declaredCaseEvidence = unique([
          ...(topicEvidence?.namedAnalysisObjects || []),
          workedExample.object,
          foundation.example
        ].map((value) => String(value || '').trim()).filter((value) => words(value) >= 2));
        const resolvedClaimSources = claims.length >= 4 && sources.length >= 2 && claims.every((claim) => claim.status === 'verified' && (claim.source_ids || []).length > 0 && claim.source_ids.every((id) => sourceById.has(id)));
        const theoryEvidence = topicEvidence?.appliedTheoryTraditions || [];
        const methodEvidence = topicEvidence?.appliedMethods || [];
        const requirements = {
          precise_definition: words(section.paragraphs[0]) >= 55 && (DEFINITION.test(section.paragraphs[0]) || words(foundation.text) >= 18),
          historical_or_systemic_background: (topicEvidence?.historicalCoverage || []).length >= 2 || BACKGROUND.test(combined),
          theories_researchers_and_findings: (theoryEvidence.length >= 2 || THEORY_OR_RESEARCH.test(combined) || scholarlyUsedSources.length >= 2) && resolvedClaimSources,
          methods_and_limitations: (methodEvidence.length >= 2 || METHOD.test(combined)) && LIMIT.test(combined),
          boundaries_and_disagreements: DISAGREEMENT.test(combined) || ((topicEvidence?.boundaryAreaIds || []).length >= 2 && LIMIT.test(combined)),
          documented_cases_or_teaching_scenarios: declaredCaseEvidence.length >= 2 && Array.isArray(workedExample.claimIds) && workedExample.claimIds.length > 0 && workedExample.claimIds.every((id) => claimById.has(id)),
          key_questions: Array.isArray(section.keyPoints) && section.keyPoints.length >= 2 && section.keyPoints.every((point) => words(point) >= 6),
          resolved_source_and_claim_ids: resolvedClaimSources
        };
        const missing = Object.entries(requirements).filter(([, ok]) => !ok).map(([name]) => name);
        reviews.push({
          areaId: entry.areaId,
          topicId: section.coverageTopic,
          sectionId: section.id,
          requirements,
          evidence: {
            paragraphCount: section.paragraphs.length,
            wordCount: words(prose),
            claimIds,
            sourceIds,
            scholarlySourceIds: scholarlyUsedSources.map((source) => source.id),
            appliedTheoryTraditions: theoryEvidence,
            appliedMethods: methodEvidence,
            declaredCaseEvidence,
            analyticalPromptCount: section.keyPoints?.length || 0
          },
          missing
        });
      }
    }
  }

  const gaps = reviews.filter((review) => review.missing.length > 0);
  check(reviews.length === 168, `Expanded artikkelreview forventer 168 artikler, fikk ${reviews.length}`);
  check(gaps.length === 0, `Expanded artikkelreview fant ${gaps.length} artikler med hull: ${gaps.map((row) => `${row.topicId}[${row.missing.join(',')}]`).join('; ')}`);
  return {
    articleCount: reviews.length,
    fullyReviewedArticleCount: reviews.length - gaps.length,
    articleRequirementGapCount: gaps.length,
    requiredDimensions: 8,
    reviews
  };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const result = auditLitteraturArticleEditorialQuality();
    const expanded = auditLitteraturExpandedArticleRequirements();
    console.log(`Redaksjonell litteraturaudit OK: ${result.areaCount} områder, ${result.articleCount} artikler og ${result.paragraphCount} fagavsnitt; ${result.pendingAreaCount} områder gjenstår. Expanded artikkelreview: ${expanded.fullyReviewedArticleCount}/${expanded.articleCount}.`);
  } catch (error) {
    console.error(`Redaksjonell litteraturaudit FEIL: ${error.message}`);
    process.exitCode = 1;
  }
}
