#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CHAPTER_ID = 'utvikling-oppvekst-og-laring';
const DOMAIN_ID = 'utvikling_oppvekst_laring';
const CHAPTER_DIR = `data/fagverk/psykologi/${CHAPTER_ID}`;
const CHAPTER_FILE = `data/fagverk/psykologi/${CHAPTER_ID}.json`;
const REGISTRY_FILE = 'data/fagverk/fagverk_registry.json';
const STATUS_FILE = 'data/fagverk/subject_status.json';
const PENSUM_FILE = 'data/fag/psykologi/psykologipensum_canonical_v4_5.json';
const METHODS_FILE = 'data/fag/psykologi/methods_psykologi_canonical_v4_5.json';
const MODULE_FILES = [
  `${CHAPTER_DIR}/01-tidlig-utvikling-og-relasjoner.json`,
  `${CHAPTER_DIR}/02-laring-skole-og-motivasjon.json`,
  `${CHAPTER_DIR}/03-ungdom-identitet-og-livslop.json`
];
const DOMAIN_ORDER = [
  'psykisk_helse_institusjoner_behandling',
  'fagtradisjoner_teori_sinnet',
  'utvikling_oppvekst_laring',
  'kognisjon_folelser_atferd',
  'sosialpsykologi_normalitet_stigma',
  'traume_krise_resiliens_omsorg'
];
const abs = (file) => path.join(ROOT, file);
const readJson = (file) => JSON.parse(fs.readFileSync(abs(file), 'utf8'));
const writeJson = (file, value) => fs.writeFileSync(abs(file), `${JSON.stringify(value, null, 2)}\n`);
const assert = (ok, message) => { if (!ok) throw new Error(message); };

function validatePack() {
  for (const file of [CHAPTER_FILE, `${CHAPTER_DIR}/brief.json`, `${CHAPTER_DIR}/claims.json`, ...MODULE_FILES, PENSUM_FILE, METHODS_FILE]) {
    assert(fs.existsSync(abs(file)), `Mangler ${file}`);
  }
  const chapter = readJson(CHAPTER_FILE);
  const brief = readJson(`${CHAPTER_DIR}/brief.json`);
  const claimsDoc = readJson(`${CHAPTER_DIR}/claims.json`);
  const modules = MODULE_FILES.map(readJson);
  const pensum = readJson(PENSUM_FILE);
  const methods = readJson(METHODS_FILE);
  const domain = pensum.domains.find((item) => item.domain_id === DOMAIN_ID);
  assert(domain, `Mangler canonicalt domene ${DOMAIN_ID}`);
  assert(chapter.id === CHAPTER_ID && chapter.chapter_id === CHAPTER_ID, 'Feil kapittel-ID');
  assert(chapter.primary_domain_id === DOMAIN_ID, 'Feil primærdomene');
  assert(isDeepStrictEqual(chapter.emne_ids, domain.emne_ids), 'Kapittelet dekker ikke 9 canonicale emner i eksakt rekkefølge');
  assert(isDeepStrictEqual(chapter.method_ids, domain.method_ids), 'Kapittelet bruker ikke 18 canonicale metoder i eksakt rekkefølge');
  const canonicalMethods = new Set(methods.methods.map((item) => item.method_id));
  assert(chapter.method_ids.every((id) => canonicalMethods.has(id)), 'Kapittelet peker til ukjent metode');
  assert(chapter.doNotDiagnosePeople === true, 'Kapittelet mangler diagnosevern');
  assert(brief.safety?.doNotDiagnosePeople === true, 'Brief mangler diagnosevern');
  assert(brief.safety?.noDevelopmentalLabelingFromCasualObservation === true, 'Brief mangler utviklingsmerkingsvern');
  assert(claimsDoc.source_policy?.noDiagnosisOfIndividuals === true, 'Claims-policy mangler diagnosevern');
  assert(claimsDoc.source_policy?.noDevelopmentalLabelingFromCasualObservation === true, 'Claims-policy mangler utviklingsmerkingsvern');
  assert(isDeepStrictEqual(chapter.moduleFiles, MODULE_FILES), 'Kapittelwrapperen peker til feil modulsett');

  const sections = modules.flatMap((module) => module.sections || []);
  const paragraphs = sections.flatMap((section) => section.paragraphs || []);
  const paragraphClaimIds = sections.flatMap((section) => section.paragraphClaimIds || []);
  assert(modules.length === 3 && sections.length === 9 && paragraphs.length === 27, 'Kapittelet må være 3 moduler / 9 seksjoner / 27 avsnitt');
  assert(paragraphClaimIds.length === 27 && paragraphClaimIds.every((ids) => ids?.length), 'Alle avsnitt må ha claimspor');
  const coveredEmnes = new Set(sections.flatMap((section) => section.emne_ids || []));
  const usedMethods = new Set(sections.flatMap((section) => section.method_ids || []));
  assert(coveredEmnes.size === 9 && chapter.emne_ids.every((id) => coveredEmnes.has(id)), 'Seksjonene dekker ikke 9/9 emner');
  assert(usedMethods.size === 18 && chapter.method_ids.every((id) => usedMethods.has(id)), 'Seksjonene bruker ikke 18/18 metoder');

  const sources = claimsDoc.sources || [];
  const claims = claimsDoc.claims || [];
  const sourceIds = new Set(sources.map((item) => item.id));
  const claimIds = new Set(claims.map((item) => item.id));
  assert(sources.length === 19, 'Kapittelet skal ha 19 kilderegistreringer');
  assert(sources.filter((item) => item.type !== 'internal_place_record').length === 18, 'Kapittelet skal ha 18 eksterne kilder');
  assert(claims.length === 27, 'Kapittelet skal ha 27 claims');
  assert(sources.every((source) => source.source_location && source.label), 'Kilde mangler source_location eller label');
  assert(claims.every((claim) => claim.source_ids?.length && claim.source_ids.every((id) => sourceIds.has(id))), 'Claim peker til ukjent kilde');
  assert(paragraphClaimIds.flat().every((id) => claimIds.has(id)), 'Avsnitt peker til ukjent claim');
  assert(claims.every((claim) => paragraphClaimIds.flat().includes(claim.id)), 'Et claim er ikke brukt i fagtekst');
  assert(isDeepStrictEqual((chapter.relatedPlaces || []).map((item) => item.id), ['psykologisk_institutt_uio']), 'Kapittelet har feil runtime-place-sett');
  assert((chapter.developmentCases || []).length === 4 && chapter.developmentCases.every((item) => item.caseStatus === 'documented_case_not_runtime_place'), 'Utviklingscasene må være eksplisitt non-runtime');
  return { chapter, domain, sources, claims };
}

function updateRegistry(chapter) {
  const registry = readJson(REGISTRY_FILE);
  const subject = registry.subjects?.psykologi;
  assert(subject && Array.isArray(subject.chapters), 'Psykologi mangler kapittelliste i registry');
  const registryChapter = {
    id: CHAPTER_ID,
    title: chapter.title,
    subtitle: chapter.subtitle,
    file: CHAPTER_FILE,
    primary_domain_id: DOMAIN_ID,
    chapter_role: 'core',
    emne_ids: chapter.emne_ids,
    claimsFile: `${CHAPTER_DIR}/claims.json`,
    briefFile: `${CHAPTER_DIR}/brief.json`
  };
  const existingIndex = subject.chapters.findIndex((item) => item.id === CHAPTER_ID);
  if (existingIndex >= 0) subject.chapters[existingIndex] = registryChapter;
  else subject.chapters.push(registryChapter);
  subject.chapters.sort((a, b) => DOMAIN_ORDER.indexOf(a.primary_domain_id) - DOMAIN_ORDER.indexOf(b.primary_domain_id));
  assert(subject.chapters.length === 3, 'Psykologi skal ha 3/6 kapitler etter materialisering');
  subject.canonicalModel = {
    ...(subject.canonicalModel || {}),
    note: 'Psykologifagets seks canonicale fagområder eier rendererstrukturen. Alle 58 aktive emner er bevart. Tre redaksjonelle kapitler er nå materialisert: Psykisk helse, Fagtradisjoner og Utvikling/oppvekst/læring. Samlet fulltekstdekning er 35/58 emner, med eksplisitt diagnose- og utviklingsmerkingsvern.'
  };
  subject.editorialPlan = {
    targetChapterCount: 6,
    completionRequirements: [
      'all_canonical_domains_covered',
      'all_canonical_emners_covered_exactly_once',
      'all_canonical_methods_resolved',
      'paragraph_claim_trace_complete',
      'minimum_15_external_sources_per_chapter',
      'do_not_diagnose_people_guard',
      'full_subject_audit_green'
    ],
    nextGate: subject.chapters.length === 6 ? 'full_subject_audit' : 'remaining_domain_chapter_production'
  };
  registry.version = '2.67.0';
  registry.updatedAt = '2026-08-11';
  writeJson(REGISTRY_FILE, registry);
}

function updateStatus() {
  const status = readJson(STATUS_FILE);
  const subject = status.subjects.find((item) => item.id === 'psykologi');
  assert(subject, 'Psykologi mangler i subject_status');
  subject.editorialStatus = 'chapters_in_progress';
  subject.nextGate = 'remaining_domain_chapter_production';
  subject.note = 'Psykologi har seks canonicale fagområder og 58 aktive emner. Tre områder er nå fulltekstmaterialisert. Utvikling, oppvekst og læring dekker 9/9 emner med 18 canonicale metoder, 3 moduler, 9 seksjoner, 27 claimsporede fagavsnitt, 27 verifiserte claims og 19 kilderegistreringer (18 eksterne). Samlet dekker de tre kapitlene 35/58 emner. Tre canonicale kapitler gjenstår, og diagnose- og utviklingsmerkingsvernet er bindende.';
  status.version = '1.55.0';
  status.updatedAt = '2026-08-11';
  writeJson(STATUS_FILE, status);
}

const { chapter, sources, claims } = validatePack();
updateRegistry(chapter);
updateStatus();
console.log(`Materialiserte Psykologi ${DOMAIN_ID}: 9/9 emner, 18 metoder, 3 moduler, 9 seksjoner, 27 avsnitt, ${claims.length} claims og ${sources.length} kilder. Psykologi står 3/6 kapitler.`);
