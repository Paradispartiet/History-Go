#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const P = Object.freeze({
  chapter: 'data/fagverk/naeringsliv/kapital-eierskap-finans.json',
  brief: 'data/fagverk/naeringsliv/kapital-eierskap-finans/brief.json',
  claims: 'data/fagverk/naeringsliv/kapital-eierskap-finans/claims.json',
  module1: 'data/fagverk/naeringsliv/kapital-eierskap-finans/01-grunnlag.json',
  module2: 'data/fagverk/naeringsliv/kapital-eierskap-finans/02-fordypning.json',
  module3: 'data/fagverk/naeringsliv/kapital-eierskap-finans/03-anvendelse.json',
  pensum: 'data/fag/naeringsliv/naeringslivpensum_canonical_v4_5.json',
  methods: 'data/fag/naeringsliv/methods_naeringsliv_canonical_v4_5.json',
  registry: 'data/fagverk/fagverk_registry.json',
  runtime: 'data/fag/naeringsliv/naeringsliv_runtime_manifest.json',
  status: 'data/fagverk/subject_status.json',
  report: 'reports/fagverk/naeringsliv-kapital-eierskap-finans-audit.json'
});
const abs = (value) => path.join(ROOT, value);
const read = (value) => fs.readFileSync(abs(value), 'utf8');
const json = (value) => JSON.parse(read(value));
const text = (value) => String(value ?? '').trim();
const assert = (ok, message) => { if (!ok) throw new Error(message); };
const sorted = (values) => [...(values || [])].map(text).sort();
const equalSet = (a, b) => isDeepStrictEqual(sorted(a), sorted(b));
export const hasCompleteClaimTrace = (values) => Array.isArray(values)
  && values.every((claimIds) => Array.isArray(claimIds) && claimIds.some((claimId) => text(claimId)));
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

export function auditNaeringslivKapitalEierskapFinansChapter({ writeReport = false, checkReport = true } = {}) {
  const chapter = json(P.chapter);
  const brief = json(P.brief);
  const claimsDoc = json(P.claims);
  const modules = [json(P.module1), json(P.module2), json(P.module3)];
  const pensum = json(P.pensum);
  const methodsDoc = json(P.methods);
  const registry = json(P.registry);
  const runtime = json(P.runtime);
  const status = json(P.status);
  const domain = (pensum.domains || []).find((row) => row.domain_id === 'kapital_eierskap_finans');

  assert(domain, 'Pensum mangler fagområdet kapital, eierskap og finans');
  assert(chapter.schema === 'history_go_fagverk_chapter_v1', 'Kapittelet bruker feil schema');
  assert(chapter.subject_id === 'naeringsliv' && chapter.subject === 'naeringsliv', 'Kapittelet bruker feil fag');
  assert(chapter.id === 'kapital-eierskap-finans' && chapter.chapter_id === chapter.id, 'Kapittel-ID er usynkron');
  assert(chapter.primary_domain_id === domain.domain_id, 'Kapittelet bruker feil primærfagområde');
  assert(chapter.editorialStatus === 'chapter_ready' && chapter.claimTraceRequired === true, 'Kapittelet mangler redaksjonell eller sporbar status');
  assert(equalSet(chapter.emne_ids, domain.emne_ids), 'Kapittelet dekker ikke nøyaktig fagområdets ni emner');
  assert(equalSet(brief.requiredEmneIds, chapter.emne_ids), 'Brief og kapittel har ulike emnelister');
  assert(equalSet(brief.requiredMethodIds, chapter.method_ids), 'Brief og kapittel har ulike metodelister');
  assert(equalSet(chapter.method_ids, domain.method_ids), 'Kapittelet dekker ikke nøyaktig fagområdets fjorten metoder');
  const canonicalMethodIds = new Set((methodsDoc.methods || []).map((row) => text(row.method_id)));
  for (const id of chapter.method_ids || []) assert(canonicalMethodIds.has(id), `Ukjent metode i kapittelet: ${id}`);
  assert((chapter.learningObjectives || []).length >= 10, 'Kapittelet mangler minst ti læringsmål');
  assert((chapter.diagnosticQuestions || []).length >= 5, 'Kapittelet mangler forkunnskapsspørsmål');
  assert(isDeepStrictEqual(chapter.moduleFiles, [P.module1, P.module2, P.module3]), 'Kapittelet peker ikke til de tre canonicale modulene');
  assert(chapter.briefFile === P.brief && chapter.claimsFile === P.claims, 'Kapittelet peker ikke til brief og claims');

  let sectionCount = 0;
  let paragraphCount = 0;
  let paragraphTraceCount = 0;
  let keyPointCount = 0;
  for (const [moduleIndex, module] of modules.entries()) {
    assert((module.sections || []).length >= 3, `Modul ${moduleIndex + 1} har færre enn tre redigerte seksjoner`);
    for (const section of module.sections || []) {
      sectionCount += 1;
      assert(text(section.id) && text(section.title), 'Seksjon mangler stabil ID eller tittel');
      assert((section.paragraphs || []).length >= 3, `${section.id}: færre enn tre sammenhengende avsnitt`);
      assert((section.paragraphClaimIds || []).length === section.paragraphs.length, `${section.id}: avsnitt og claimspor er usynkrone`);
      assert(hasCompleteClaimTrace(section.paragraphClaimIds), `${section.id}: minst ett avsnitt mangler claim-ID`);
      paragraphCount += section.paragraphs.length;
      paragraphTraceCount += section.paragraphClaimIds.length;
      if (section.keyPoints) {
        assert((section.keyPointClaimIds || []).length === section.keyPoints.length, `${section.id}: nøkkelpunkter og claimspor er usynkrone`);
        assert(hasCompleteClaimTrace(section.keyPointClaimIds), `${section.id}: minst ett nøkkelpunkt mangler claim-ID`);
        keyPointCount += section.keyPoints.length;
      }
    }
  }
  const workedExampleCount = (modules[1].workedExamples || []).length;
  const misconceptionCount = (modules[1].commonMisconceptions || []).length;
  const applicationTaskCount = (modules[2].applicationTasks || []).length;
  const selfCheckCount = (modules[2].selfCheck || []).length;
  const relatedPlaceCount = (modules[2].relatedPlaces || []).length;
  assert(sectionCount >= 9 && paragraphCount >= 27, 'Kapittelet mangler tilstrekkelig sammenhengende lærestoff');
  assert(workedExampleCount >= 2, 'Kapittelet mangler arbeidseksempler');
  assert(misconceptionCount >= 5, 'Kapittelet mangler reelle misoppfatninger');
  assert(applicationTaskCount >= 3, 'Kapittelet mangler anvendelsesoppgaver');
  assert(selfCheckCount >= 8, 'Kapittelet mangler kontrollspørsmål');
  assert(relatedPlaceCount >= 6, 'Kapittelet mangler canonicale stedskoblinger');

  const sources = claimsDoc.sources || [];
  const claims = claimsDoc.claims || [];
  const sourceIds = new Set(sources.map((row) => text(row.id)));
  const claimIds = new Set(claims.map((row) => text(row.id)));
  assert(sources.length >= 18, 'Kapittelet har for få inspectable kilder');
  assert(claims.length >= 36, 'Kapittelet har for få påstandsposter');
  assert(sourceIds.size === sources.length && claimIds.size === claims.length, 'Kilde- eller claim-ID-er er dupliserte');
  for (const source of sources) {
    assert(/^https:\/\//.test(text(source.url)), `${source.id}: kilden bruker ikke https`);
    assert(text(source.publisher), `${source.id}: mangler utgiver`);
    assert(text(source.source_location), `${source.id}: mangler inspectable source_location`);
  }
  for (const claim of claims) {
    assert(text(claim.claim).length >= 40, `${claim.id}: for kort eller tom påstand`);
    assert(claim.status === 'verified', `${claim.id}: står ikke verified`);
    assert((claim.source_ids || []).length >= 1, `${claim.id}: mangler kilde`);
    for (const sourceId of claim.source_ids || []) assert(sourceIds.has(sourceId), `${claim.id}: ukjent kilde ${sourceId}`);
    assert((claim.used_in || []).length >= 1, `${claim.id}: mangler brukt-i-spor`);
  }
  const usedClaimIds = collectClaimIds(modules);
  for (const claimId of usedClaimIds) assert(claimIds.has(claimId), `Modulene peker til ukjent claim ${claimId}`);
  for (const claimId of claimIds) assert(usedClaimIds.includes(claimId), `Claim ${claimId} brukes ikke i kapittelet`);
  const allText = [read(P.chapter), read(P.brief), ...[P.module1, P.module2, P.module3].map(read)].join('\n').toLowerCase();
  assert(!/(todo|lorem ipsum|fyll inn|placeholder)/.test(allText), 'Kapittelpakken inneholder arbeids- eller filler-tekst');

  const registryChapter = (registry.subjects?.naeringsliv?.chapters || []).find((row) => row.id === chapter.id);
  assert(registryChapter && registryChapter.file === P.chapter, 'Fagverkregisteret mangler kapittelet');
  assert(registryChapter.primary_domain_id === domain.domain_id, 'Registeret bruker feil primærfagområde');
  assert(equalSet(registryChapter.emne_ids, chapter.emne_ids), 'Registerets emner er usynkrone');
  assert(equalSet(registryChapter.method_ids, chapter.method_ids), 'Registerets metoder er usynkrone');
  assert(runtime.chapterByDomain?.[domain.domain_id] === chapter.id, 'Runtime mangler domain→chapter-kobling');
  for (const emneId of chapter.emne_ids || []) assert(runtime.chapterByEmne?.[emneId] === chapter.id, `Runtime mangler emne→chapter for ${emneId}`);
  const subjectStatus = (status.subjects || []).find((row) => row.id === 'naeringsliv');
  const registeredChapterCount = registry.subjects?.naeringsliv?.chapters?.length || 0;
  const canonicalDomainCount = (pensum.domains || []).length;
  const subjectIsComplete = registeredChapterCount === canonicalDomainCount;
  assert(subjectStatus?.editorialStatus === (subjectIsComplete ? 'complete' : 'chapters_in_progress'), 'Næringslivstatus samsvarer ikke med registrert kapitteldekning');
  assert(subjectStatus?.nextGate === (subjectIsComplete ? 'maintenance_and_source_refresh' : 'phase_4_chapters'), 'Næringslivstatus peker til feil neste port');

  const report = {
    schema: 'history_go_naeringsliv_chapter_kapital_eierskap_finans_audit_v1',
    version: '1.0.0',
    status: 'passed',
    generatedFrom: P,
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
      tracedClaimCount: new Set(usedClaimIds).size
    },
    gates: {
      canonicalDomainCoverage: true,
      canonicalMethodCoverage: true,
      editedLearningText: true,
      workedExamplesAndMisconceptions: true,
      tasksAndSelfCheck: true,
      inspectableSources: true,
      paragraphLevelClaimTrace: true,
      allClaimsUsed: true,
      registryAndRuntimeSynced: true,
      honestEditorialStatus: true
    }
  };
  if (writeReport) {
    fs.mkdirSync(path.dirname(abs(P.report)), { recursive: true });
    fs.writeFileSync(abs(P.report), `${JSON.stringify(report, null, 2)}\n`);
  }
  if (checkReport) assert(isDeepStrictEqual(json(P.report), report), `${P.report} er utdatert`);
  return report;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = new Set(process.argv.slice(2));
  try {
    const report = auditNaeringslivKapitalEierskapFinansChapter({ writeReport: args.has('--write-report'), checkReport: !args.has('--no-check-report') });
    console.log(`Kapital, eierskap og finans OK: ${report.summary.sectionCount} seksjoner, ${report.summary.claimCount} claims, ${report.summary.sourceCount} kilder.`);
  } catch (error) {
    console.error(`Kapital, eierskap og finans FEIL: ${error.message}`);
    process.exitCode = 1;
  }
}
