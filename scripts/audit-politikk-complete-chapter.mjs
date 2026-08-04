#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const abs = (value) => path.join(ROOT, value);
const read = (value) => fs.readFileSync(abs(value), 'utf8');
const json = (value) => JSON.parse(read(value));
const text = (value) => String(value ?? '').trim();
const assert = (ok, message) => { if (!ok) throw new Error(message); };
const sorted = (values) => [...values].map(text).sort();
const equalSet = (a, b) => isDeepStrictEqual(sorted(a), sorted(b));

export const hasCompleteClaimTrace = (values) => Array.isArray(values)
  && values.every((claimIds) => Array.isArray(claimIds) && claimIds.some((claimId) => text(claimId)));

export const hasRenderableWorkedExampleAnalysis = (examples) => Array.isArray(examples)
  && examples.every((example) => Array.isArray(example.analysis)
    && example.analysis.length >= 3
    && example.analysis.every((step) => text(step)));

const collectClaimIds = (value, result = []) => {
  if (Array.isArray(value)) {
    for (const item of value) collectClaimIds(item, result);
    return result;
  }
  if (!value || typeof value !== 'object') return result;
  for (const [key, item] of Object.entries(value)) {
    if (['claimIds', 'paragraphClaimIds', 'keyPointClaimIds'].includes(key) && Array.isArray(item)) {
      result.push(...item.flat(Infinity).map(text));
    } else {
      collectClaimIds(item, result);
    }
  }
  return result;
};

const COMMON = Object.freeze({
  pensum: 'data/fag/politikk/politikkpensum_canonical_v4_5.json',
  methods: 'data/fag/politikk/methods_politikk_canonical_v4_5.json',
  registry: 'data/fagverk/fagverk_registry.json',
  runtime: 'data/fag/politikk/politikk_runtime_manifest.json',
  status: 'data/fagverk/subject_status.json'
});

export function auditPolitikkCompleteChapter(config, { writeReport = false, checkReport = true } = {}) {
  const base = `data/fagverk/politikk/${config.id}`;
  const paths = {
    ...COMMON,
    chapter: `${base}.json`,
    brief: `${base}/brief.json`,
    claims: `${base}/claims.json`,
    module1: `${base}/01-grunnlag.json`,
    module2: `${base}/02-fordypning.json`,
    module3: `${base}/03-anvendelse.json`,
    report: config.report
  };
  const chapter = json(paths.chapter);
  const brief = json(paths.brief);
  const claimsDoc = json(paths.claims);
  const modules = [json(paths.module1), json(paths.module2), json(paths.module3)];
  const pensum = json(paths.pensum);
  const methodsDoc = json(paths.methods);
  const registry = json(paths.registry);
  const runtime = json(paths.runtime);
  const status = json(paths.status);
  const domain = (pensum.domains || []).find((row) => row.domain_id === config.domainId);

  assert(domain, `${config.id}: canonicalt fagområde finnes ikke`);
  assert(chapter.schema === 'history_go_fagverk_chapter_v1', `${config.id}: feil kapittelskjema`);
  assert(chapter.subject === 'politikk' && chapter.subject_id === 'politikk', `${config.id}: feil fag`);
  assert(chapter.id === config.id && chapter.chapter_id === config.id, `${config.id}: kapittel-ID er usynkron`);
  assert(chapter.primary_domain_id === domain.domain_id, `${config.id}: feil primærfagområde`);
  assert(chapter.editorialStatus === 'chapter_ready' && chapter.claimTraceRequired === true, `${config.id}: mangler redaksjonell eller sporbar status`);
  assert(equalSet(chapter.emne_ids || [], domain.emne_ids || []), `${config.id}: dekker ikke nøyaktig fagområdets emner`);
  assert(equalSet(chapter.method_ids || [], domain.method_ids || []), `${config.id}: dekker ikke nøyaktig fagområdets metoder`);
  assert(equalSet(brief.requiredEmneIds || [], chapter.emne_ids || []), `${config.id}: brief og kapittel har ulike emnelister`);
  assert(equalSet(brief.requiredMethodIds || [], chapter.method_ids || []), `${config.id}: brief og kapittel har ulike metodelister`);
  const canonicalMethodIds = new Set((methodsDoc.methods || []).map((row) => text(row.method_id)));
  for (const id of chapter.method_ids || []) assert(canonicalMethodIds.has(id), `${config.id}: ukjent metode ${id}`);
  assert((chapter.learningObjectives || []).length >= 8, `${config.id}: mangler læringsmål`);
  assert((chapter.diagnosticQuestions || []).length >= 4, `${config.id}: mangler forkunnskapsspørsmål`);
  assert(isDeepStrictEqual(chapter.moduleFiles, [paths.module1, paths.module2, paths.module3]), `${config.id}: feil modulpekere`);
  assert(chapter.briefFile === paths.brief && chapter.claimsFile === paths.claims, `${config.id}: mangler brief- eller claimspeker`);

  let sectionCount = 0;
  let paragraphCount = 0;
  let paragraphTraceCount = 0;
  let keyPointCount = 0;
  for (const [moduleIndex, module] of modules.entries()) {
    assert((module.sections || []).length >= 3, `${config.id}: modul ${moduleIndex + 1} har færre enn tre seksjoner`);
    for (const section of module.sections || []) {
      sectionCount += 1;
      assert(text(section.id) && text(section.title), `${config.id}: seksjon mangler stabil ID eller tittel`);
      assert((section.paragraphs || []).length >= 3, `${section.id}: færre enn tre avsnitt`);
      assert((section.paragraphClaimIds || []).length === section.paragraphs.length, `${section.id}: avsnitt og claimspor er usynkrone`);
      assert(hasCompleteClaimTrace(section.paragraphClaimIds), `${section.id}: minst ett avsnitt mangler claim-ID`);
      paragraphCount += section.paragraphs.length;
      paragraphTraceCount += section.paragraphClaimIds.length;
      assert((section.keyPointClaimIds || []).length === (section.keyPoints || []).length, `${section.id}: nøkkelpunkter og claimspor er usynkrone`);
      assert(hasCompleteClaimTrace(section.keyPointClaimIds), `${section.id}: minst ett nøkkelpunkt mangler claim-ID`);
      keyPointCount += section.keyPoints.length;
    }
  }
  const workedExamples = modules[1].workedExamples || [];
  const workedExampleCount = workedExamples.length;
  const misconceptionCount = (modules[1].commonMisconceptions || []).length;
  const applicationTaskCount = (modules[2].applicationTasks || []).length;
  const selfCheckCount = (modules[2].selfCheck || []).length;
  const relatedPlaceCount = (modules[2].relatedPlaces || []).length;
  assert(sectionCount === 9 && paragraphCount === 27, `${config.id}: kapittelet skal ha 9 seksjoner og 27 avsnitt`);
  assert(workedExampleCount >= 2 && hasRenderableWorkedExampleAnalysis(workedExamples), `${config.id}: arbeidseksemplene er ikke renderbare`);
  assert(misconceptionCount >= 4, `${config.id}: mangler misoppfatninger`);
  assert(applicationTaskCount >= 3, `${config.id}: mangler anvendelsesoppgaver`);
  assert(selfCheckCount >= 6, `${config.id}: mangler kontrollspørsmål`);
  assert(relatedPlaceCount >= 4, `${config.id}: mangler stedskoblinger`);

  const sources = claimsDoc.sources || [];
  const claims = claimsDoc.claims || [];
  const sourceIds = new Set(sources.map((row) => text(row.id)));
  const claimIds = new Set(claims.map((row) => text(row.id)));
  assert(sources.length >= 20, `${config.id}: færre enn 20 inspectable kilder`);
  assert(claims.length >= 30, `${config.id}: færre enn 30 claimposter`);
  assert(sourceIds.size === sources.length && claimIds.size === claims.length, `${config.id}: dupliserte kilde- eller claim-ID-er`);
  for (const source of sources) {
    assert(/^https:\/\//.test(text(source.url)), `${source.id}: kilden bruker ikke https`);
    assert(text(source.source_location), `${source.id}: mangler source_location`);
  }
  for (const claim of claims) {
    assert(text(claim.claim).length >= 40, `${claim.id}: for kort claimtekst`);
    assert(claim.status === 'verified', `${claim.id}: står ikke verified`);
    assert((claim.source_ids || []).length >= 1, `${claim.id}: mangler kilde`);
    for (const sourceId of claim.source_ids || []) assert(sourceIds.has(sourceId), `${claim.id}: ukjent kilde ${sourceId}`);
    assert((claim.used_in || []).length >= 1, `${claim.id}: mangler used_in`);
  }
  const usedClaimIds = collectClaimIds(modules);
  for (const claimId of usedClaimIds) assert(claimIds.has(claimId), `${config.id}: ukjent claim ${claimId}`);
  for (const claimId of claimIds) assert(usedClaimIds.includes(claimId), `${config.id}: claim ${claimId} brukes ikke`);
  const sourceUse = new Set(claims.flatMap((claim) => claim.source_ids || []));
  for (const sourceId of sourceIds) assert(sourceUse.has(sourceId), `${config.id}: kilden ${sourceId} brukes ikke`);

  const registryChapter = (registry.subjects?.politikk?.chapters || []).find((row) => row.id === config.id);
  assert(registryChapter?.file === paths.chapter, `${config.id}: registry mangler kapittelet`);
  assert(registryChapter.primary_domain_id === domain.domain_id, `${config.id}: registry bruker feil fagområde`);
  assert(equalSet(registryChapter.emne_ids || [], chapter.emne_ids || []), `${config.id}: registryets emner er usynkrone`);
  assert(runtime.chapterByDomain?.[domain.domain_id] === config.id, `${config.id}: runtime mangler domain→chapter`);
  for (const emneId of chapter.emne_ids || []) {
    assert(runtime.chapterByEmne?.[emneId] === config.id, `${config.id}: runtime mangler emne→chapter for ${emneId}`);
  }

  const politicsStatus = (status.subjects || []).find((row) => row.id === 'politikk');
  assert(politicsStatus?.editorialStatus === 'expanded_and_audited', 'Politikkstatus skal være expanded_and_audited');
  assert(politicsStatus?.nextGate === 'source_refresh_and_case_expansion', 'Politikkstatus peker ikke til neste kvalitetsport');
  const registryChapters = registry.subjects?.politikk?.chapters || [];
  assert(registryChapters.length === 13, 'Politikk skal ha tretten registrerte kapitler');
  let fullContractChapterCount = 0;
  for (const row of registryChapters) {
    const registered = json(row.file);
    assert(registered.editorialStatus === 'chapter_ready' && registered.claimTraceRequired === true, `${row.id}: mangler moderne kapittelstatus`);
    assert(text(registered.briefFile) && fs.existsSync(abs(registered.briefFile)), `${row.id}: mangler brief`);
    assert(text(registered.claimsFile) && fs.existsSync(abs(registered.claimsFile)), `${row.id}: mangler claims`);
    fullContractChapterCount += 1;
  }

  const report = {
    schema: config.reportSchema,
    version: '1.0.0',
    status: 'passed',
    generatedFrom: paths,
    summary: {
      emneCount: chapter.emne_ids.length,
      methodCount: chapter.method_ids.length,
      moduleCount: modules.length,
      sectionCount,
      paragraphCount,
      paragraphTraceCount,
      keyPointCount,
      workedExampleCount,
      misconceptionCount,
      applicationTaskCount,
      selfCheckCount,
      relatedPlaceCount,
      sourceCount: sources.length,
      claimCount: claims.length,
      tracedClaimCount: new Set(usedClaimIds).size,
      fullContractChapterCount
    },
    gates: {
      canonicalDomainCoverage: true,
      canonicalMethodCoverage: true,
      editedLearningText: true,
      workedExamplesAndMisconceptions: true,
      renderableWorkedExampleAnalysis: true,
      tasksAndSelfCheck: true,
      inspectableSources: true,
      allSourcesUsed: true,
      paragraphLevelClaimTrace: true,
      allClaimsUsed: true,
      registryAndRuntimeSynced: true,
      allThirteenChaptersOnFullContract: true,
      completeEditorialStatus: true
    }
  };
  if (writeReport) {
    fs.mkdirSync(path.dirname(abs(paths.report)), { recursive: true });
    fs.writeFileSync(abs(paths.report), `${JSON.stringify(report, null, 2)}\n`);
  }
  if (checkReport) assert(isDeepStrictEqual(json(paths.report), report), `${paths.report} er utdatert`);
  return report;
}
