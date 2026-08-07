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

export function auditLitteraturArticleEditorialQuality() {
  const coverage = read(`${PACKAGE}/coverage_contract_v1.json`);
  const registry = read(`${PACKAGE}/editorial_quality_v1.json`);
  const areaById = new Map(coverage.coverage_areas.map((area) => [area.id, area]));

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
      check((section.keyPoints || []).some((point) => /grense|begrens|skiller|ikke|usikker|alternativ/iu.test(point)), `${entry.areaId}/${section.id}: mangler synlig inferensgrense`);
      for (const sentence of prose.split(/(?<=[.!?])\s+/u).map((value) => value.trim()).filter((value) => words(value) >= 8)) {
        sentenceCounts.set(sentence, (sentenceCounts.get(sentence) || 0) + 1);
      }
    }
  }
  const repeated = [...sentenceCounts.entries()].filter(([, count]) => count >= 3);
  check(repeated.length === 0, `Samme hele setning er gjentatt i minst tre artikler: ${repeated[0]?.[0] || ''}`);
  return { areaCount: registry.areas.length, articleCount, paragraphCount, pendingAreaCount: registry.pendingAreaIds.length };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const result = auditLitteraturArticleEditorialQuality();
    console.log(`Redaksjonell litteraturaudit OK: ${result.areaCount} områder, ${result.articleCount} artikler og ${result.paragraphCount} fagavsnitt; ${result.pendingAreaCount} områder gjenstår.`);
  } catch (error) {
    console.error(`Redaksjonell litteraturaudit FEIL: ${error.message}`);
    process.exitCode = 1;
  }
}
