#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const P = Object.freeze({
  pensum: 'data/fag/politikk/politikkpensum_canonical_v4_5.json',
  emner: 'data/fag/politikk/emner_politikk_canonical_v4_5.json',
  fagkart: 'data/fag/politikk/fagkart_politikk_canonical_v4_5.json',
  methods: 'data/fag/politikk/methods_politikk_canonical_v4_5.json',
  mappings: 'data/fag/politikk/emnemapping_politikk_canonical_v4_5.json',
  quiz: 'data/fag/politikk/supersetQUIZMAL_politikk.json',
  badge: 'data/badges/politikk.json',
  compatibilityPage: 'data/fag/politikk/merke_politikk.html',
  registry: 'data/fagverk/fagverk_registry.json',
  report: 'reports/fagverk/politikk-quality-audit.json'
});
const abs = (p) => path.join(ROOT, p);
const read = (p) => fs.readFileSync(abs(p), 'utf8');
const json = (p) => JSON.parse(read(p));
const text = (v) => String(v ?? '').trim();
const norm = (v) => text(v).replace(/\s+/g, ' ').toLocaleLowerCase('nb-NO');
const assert = (ok, msg) => { if (!ok) throw new Error(msg); };
const unique = (values) => new Set(values.map((v) => JSON.stringify(v))).size === values.length;
const idLikeName = (value) => /^[a-z0-9]+(?:_[a-z0-9]+)+$/.test(text(value));
const lowerDisplayName = (value) => {
  const name = text(value);
  return name && /[a-zæøå]/.test(name) && !/[A-ZÆØÅ]/.test(name);
};
const walk = (value, visit, at = []) => {
  if (Array.isArray(value)) return value.forEach((item, index) => walk(item, visit, [...at, index]));
  if (!value || typeof value !== 'object') return;
  visit(value, at);
  for (const [key, item] of Object.entries(value)) walk(item, visit, [...at, key]);
};

export function auditPolitikkQuality({ writeReport = false, checkReport = true } = {}) {
  const pensum = json(P.pensum);
  const emner = json(P.emner);
  const fagkart = json(P.fagkart);
  const methodsDoc = json(P.methods);
  const mappings = json(P.mappings);
  const quiz = json(P.quiz);
  const badge = json(P.badge);
  const compatibilityPage = read(P.compatibilityPage);
  const registry = json(P.registry);
  const methods = methodsDoc.methods || [];
  const domains = pensum.domains || [];
  const domainIds = new Set(domains.map((d) => text(d.domain_id)));
  const emneIds = emner.map((e) => text(e.emne_id));
  const emneIdSet = new Set(emneIds);
  const pensumEmneIds = domains.flatMap((d) => d.emne_ids || []).map(text);
  const mappingIds = mappings.map((m) => text(m.emne_id));
  const methodIds = new Set(methods.map((m) => text(m.method_id)));
  const hookCount = (fagkart.categories || []).reduce((sum, category) => sum + (category.topic_hooks || []).length, 0);
  const mappingRelationCount = mappings.reduce((sum, row) => sum + (row.mappings || []).length, 0);

  assert(pensum.scope === 'universal', 'Politikkpensum skal ha universelt fagomfang');
  assert(methodsDoc.scope === 'universal', 'Politikkmetodene skal ha universelt fagomfang');
  assert(fagkart.scope === 'universal', 'Politikkfagkartet skal ha universelt fagomfang');
  assert(!text(fagkart.version).includes('draft'), 'Politikkfagkartet står fortsatt som draft');
  assert(domains.length === 13, `Forventet 13 politikkfagområder, fikk ${domains.length}`);
  assert(emner.length === 123, `Forventet 123 Politikk-emner, fikk ${emner.length}`);
  assert(methods.length === 71, `Forventet 71 Politikk-metoder, fikk ${methods.length}`);
  assert(mappings.length === emner.length, `Forventet én mappingrad per emne, fikk ${mappings.length} for ${emner.length}`);
  assert(hookCount === 152, `Forventet 152 fagkart-hooks, fikk ${hookCount}`);
  assert(unique(emneIds), 'Politikk har dupliserte emne-ID-er');
  assert(unique(pensumEmneIds), 'Pensumets domenelister har dupliserte emne-ID-er');
  assert(unique(mappingIds), 'Politikk har dupliserte mappingrader');
  assert(isDeepStrictEqual(new Set(pensumEmneIds), emneIdSet), 'Pensumets domenelister dekker ikke nøyaktig de 123 emnene');
  assert(isDeepStrictEqual(new Set(mappingIds), emneIdSet), 'Mappingfilen dekker ikke nøyaktig de 123 emnene');

  const definitions = [], whys = [], questionSets = [], distinctionSets = [];
  for (const emne of emner) {
    const id = text(emne.emne_id);
    assert(domainIds.has(text(emne.domain)), `${id}: ukjent domain ${emne.domain}`);
    assert(emne.area_id === emne.domain && emne.logic_family === emne.domain, `${id}: domain, area_id og logic_family er usynkrone`);
    assert(text(emne.definition).length >= 90, `${id}: for kort definisjon`);
    assert(text(emne.why_it_matters).length >= 70, `${id}: for svak hvorfor-forklaring`);
    assert((emne.key_questions || []).length >= 3, `${id}: mangler tre operative kjernespørsmål`);
    assert((emne.conflicts || []).length >= 3, `${id}: mangler tre reelle konfliktlinjer`);
    assert((emne.critical_distinctions || []).length >= 2, `${id}: mangler kritiske begrepsskiller`);
    assert((emne.analysis_axes || []).length >= 2, `${id}: mangler synlige analyseakser`);
    assert((emne.quiz_angles || []).length >= 3, `${id}: mangler operative quizvinkler`);
    assert((emne.blindspots || []).length >= 2, `${id}: mangler blindsoner`);
    assert(!(emne.norwegian_thinkers || []).some(idLikeName), `${id}: norske tenkernavn er lagret som rå ID-er`);
    assert(!(emne.canonical_thinkers || []).some(idLikeName), `${id}: canonicale tenkernavn er lagret som rå ID-er`);
    for (const methodId of new Set([...(emne.methods || []), ...(emne.method_ids || []), ...(emne.recommended_methods || [])].map(text))) {
      assert(!methodId || methodIds.has(methodId), `${id}: ukjent metode ${methodId}`);
    }
    definitions.push(norm(emne.definition));
    whys.push(norm(emne.why_it_matters));
    questionSets.push((emne.key_questions || []).map(norm));
    distinctionSets.push((emne.critical_distinctions || []).map(norm));
  }
  assert(unique(definitions), 'Politikk-emnene har dupliserte definisjoner');
  assert(unique(whys), 'Politikk-emnene har dupliserte hvorfor-forklaringer');
  assert(unique(questionSets), 'Politikk-emnene har dupliserte kjernespørsmål');
  assert(unique(distinctionSets), 'Politikk-emnene har dupliserte sett av kritiske skiller');

  const methodDescriptions = [], methodDataSets = [];
  for (const method of methods) {
    const id = text(method.method_id);
    assert(text(method.description).length >= 100, `${id}: for kort metodeforklaring`);
    assert(text(method.analytical_question), `${id}: mangler analytisk hovedspørsmål`);
    assert((method.data_forms || []).length >= 3, `${id}: mangler konkrete datatyper`);
    assert((method.procedure || []).length >= 3, `${id}: mangler arbeidsprosedyre`);
    assert((method.limitations || []).length >= 2, `${id}: mangler begrensninger`);
    assert((method.question_moves || []).length >= 3, `${id}: mangler operative spørsmålsbevegelser`);
    assert(!norm(method.description).includes('metoden brukes når konkrete institusjoner'), `${id}: generisk metodehale står igjen`);
    methodDescriptions.push(norm(method.description));
    methodDataSets.push((method.data_forms || []).map(norm));
  }
  assert(unique(methodDescriptions), 'Politikkmetodene har dupliserte beskrivelser');
  assert(new Set(methodDataSets.map(JSON.stringify)).size >= 60, 'Politikkmetodene har for lite variasjon i datagrunnlag');

  const badThinkerNames = [], genericThinkerRoles = [];
  walk({ fagkart, mappings }, (object, at) => {
    if (typeof object.name === 'string' && (idLikeName(object.name) || lowerDisplayName(object.name))) badThinkerNames.push(`${at.join('.')}: ${object.name}`);
    if (typeof object.role === 'string' && object.role.includes('målrettet teori- eller sammenligningsspor')) genericThinkerRoles.push(`${at.join('.')}: ${object.role}`);
    if (Array.isArray(object.tenkere) && object.tenkere.some((name) => idLikeName(name) || lowerDisplayName(name))) badThinkerNames.push(`${at.join('.')}.tenkere`);
  });
  assert(badThinkerNames.length === 0, `Fagkart/mappings har rå eller småskrevne tenkernavn: ${badThinkerNames.slice(0, 5).join(', ')}`);
  assert(genericThinkerRoles.length === 0, 'Norsk politikk-domenet har generiske teoripersonroller');

  assert(quiz.title === 'Politikk & samfunn', 'Quizprofilen bruker feil faglabel');
  assert(quiz.normal_question_opening?.sets === 2 && quiz.normal_question_opening?.questions_per_set === 7, 'Quizprofilen mangler 2 × 7 normale åpningsspørsmål');
  assert(quiz.knowledge_delivery?.required === true, 'Quizprofilen mangler obligatorisk Knowledge-leveranse');
  assert(emneIdSet.has(text(quiz.example_question?.emne_id)), 'Quizeksempelet bruker ikke en gyldig emne-ID');
  assert((quiz.domain_priorities || []).length === domains.length, 'Quizprofilen dekker ikke alle 13 fagområdene');
  assert((quiz.category_rules || []).some((rule) => norm(rule).includes('holdning')), 'Quizprofilen mangler vern mot generiske holdningsspørsmål');

  assert(text(badge.description).length >= 120, 'Politikkmerket har en for vag beskrivelse');
  assert(!(badge.tiers || []).some((tier) => ['President', 'Diktator'].includes(text(tier.label))), 'Politikkmerket bruker maktposisjoner som uegnede toppnivåer');
  assert(!compatibilityPage.includes('123 canonicale emner'), 'Compatibility-siden har hardkodet emnetall');
  assert(compatibilityPage.includes('fagverk.html?subject=politikk#fagverkIaProgresjon'), 'Compatibility-siden mangler canonical progresjonsrute');
  assert(compatibilityPage.includes('location.replace'), 'Compatibility-siden er ikke en redirect');
  assert(!compatibilityPage.includes('politikk-fagportal.js'), 'Compatibility-siden laster fortsatt legacy-runtime');
  assert(registry.subjects?.politikk?.canonicalModel?.sourceOfTruth === true, 'Fagverkregisteret peker ikke til canonical politikkmodell');

  assert(pensum.summary?.emne_count === emner.length, 'Pensumsammendraget har feil emnetall');
  assert(pensum.summary?.method_count === methods.length, 'Pensumsammendraget har feil metodetall');
  assert(pensum.summary?.mapping_count === mappings.length, 'Pensumsammendraget har feil mappingtall');
  assert(pensum.summary?.all_emner_have_mapping === true, 'Pensumsammendraget hevder ikke komplett mappingdekning');

  const report = {
    schema: 'history_go_politikk_subject_quality_audit_v1',
    version: '1.0.0',
    status: 'passed',
    generatedFrom: P,
    summary: {
      domainCount: domains.length,
      emneCount: emner.length,
      methodCount: methods.length,
      mappingRowCount: mappings.length,
      mappingRelationCount,
      hookCount,
      uniqueDefinitions: new Set(definitions).size,
      uniqueWhyExplanations: new Set(whys).size,
      uniqueQuestionSets: new Set(questionSets.map(JSON.stringify)).size,
      uniqueDistinctionSets: new Set(distinctionSets.map(JSON.stringify)).size,
      methodsWithProcedure: methods.filter((m) => (m.procedure || []).length >= 3).length,
      methodsWithLimitations: methods.filter((m) => (m.limitations || []).length >= 2).length,
      uniqueMethodDataSets: new Set(methodDataSets.map(JSON.stringify)).size,
      normalOpeningQuestions: quiz.normal_question_opening.sets * quiz.normal_question_opening.questions_per_set
    },
    gates: {
      universalSubjectScope: true,
      completePensumCoverage: true,
      completeMappingCoverage: true,
      emneSpecificLearningText: true,
      criticalDistinctionsVisible: true,
      methodProceduresAndLimitations: true,
      canonicalThinkerDisplayNames: true,
      specificNorwegianPoliticsTheoryRoles: true,
      twoTimesSevenNormalQuizOpening: true,
      knowledgeDeliveryRequired: true,
      learningOrientedBadgeProgression: true,
      integratedBadgeProgression: true
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
    const report = auditPolitikkQuality({ writeReport: args.has('--write-report'), checkReport: !args.has('--no-check-report') });
    console.log(`Politikk-kvalitet OK: ${report.summary.emneCount} emner, ${report.summary.methodCount} metoder, ${report.summary.mappingRowCount} mappingrader og ${report.summary.normalOpeningQuestions} normale åpningsspørsmål.`);
  } catch (error) {
    console.error(`Politikk-kvalitet FEIL: ${error.message}`);
    process.exitCode = 1;
  }
}
