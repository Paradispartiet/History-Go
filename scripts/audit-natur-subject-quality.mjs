#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';
import { composeNaturFinal, readNaturFinalOverlay, NATUR_FINAL_OVERLAY_PATH } from './natur-final-phase-compose.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const P = Object.freeze({
  pensum: 'data/fag/natur/naturpensum_canonical_v4_5.json',
  emner: 'data/fag/natur/emner_natur_canonical_v4_5.json',
  fagkart: 'data/fag/natur/fagkart_natur_canonical_v4_5.json',
  methods: 'data/fag/natur/methods_natur_canonical_v4_5.json',
  mappings: 'data/fag/natur/emnemapping_natur_canonical_v4_5.json',
  overlay: NATUR_FINAL_OVERLAY_PATH,
  quiz: 'data/fag/natur/supersetQUIZMAL_natur.json',
  badge: 'data/fag/natur/archive/merke_natur_full_teori_legacy_20260829.html',
  report: 'reports/fagverk/natur-quality-audit.json'
});
const abs = (p) => path.join(ROOT, p);
const read = (p) => fs.readFileSync(abs(p), 'utf8');
const json = (p) => JSON.parse(read(p));
const text = (v) => String(v ?? '').trim();
const norm = (v) => text(v).replace(/\s+/g, ' ').toLocaleLowerCase('nb-NO');
const assert = (ok, msg) => { if (!ok) throw new Error(msg); };
const unique = (values) => new Set(values.map((v) => JSON.stringify(v))).size === values.length;

export function auditNaturQuality({ writeReport = false, checkReport = true } = {}) {
  const composed = composeNaturFinal({
    pensum: json(P.pensum),
    emners: json(P.emner),
    methodsDoc: json(P.methods),
    fagkart: json(P.fagkart),
    mappings: json(P.mappings),
    overlay: readNaturFinalOverlay()
  });
  const pensum = composed.pensum;
  const emner = composed.emners;
  const fagkart = composed.fagkart;
  const methodsDoc = composed.methodsDoc;
  const mappings = composed.mappings;
  const quiz = json(P.quiz);
  const badge = read(P.badge);
  const methods = methodsDoc.methods || [];
  const domains = new Map(pensum.domains.map((d) => [d.domain_id, d]));
  const methodIds = new Set(methods.map((m) => m.method_id));
  const mappingIds = new Set(mappings.map((m) => m.emne_id));
  const pensumEmneIds = new Set(pensum.domains.flatMap((d) => d.emne_ids || []));

  assert(composed.overlay.status === 'canonical_final_phase_overlay', 'Kvalitetsauditen bruker ikke canonical sluttfase-overlay');
  assert(pensum.scope === 'universal', 'Naturpensum skal ha universelt fagomfang');
  assert(methodsDoc.scope === 'universal', 'Naturmetodene skal ha universelt fagomfang');
  assert(emner.length === 77, `Forventet 77 Natur-emner etter sluttfasen, fikk ${emner.length}`);
  assert(methods.length === 51, `Forventet 51 Natur-metoder etter sluttfasen, fikk ${methods.length}`);
  assert(mappings.length === emner.length, 'Hvert Natur-emne skal ha én canonical mapping');
  assert(unique(pensum.domains.map((d) => d.question_role)), 'Fagområdene har kopierte question_role-tekster');

  const definitions = [], whys = [], questions = [], conflicts = [];
  for (const emne of emner) {
    const id = emne.emne_id;
    assert(domains.has(emne.domain), `${id}: ukjent domain ${emne.domain}`);
    assert(emne.area_id === emne.domain, `${id}: area_id er ikke synkron med domain`);
    assert(emne.logic_family === emne.domain, `${id}: logic_family er ikke synkron med domain`);
    assert(pensumEmneIds.has(id), `${id}: mangler i pensumets domenelister`);
    assert(mappingIds.has(id), `${id}: mangler canonical mapping`);
    assert(text(emne.definition).length >= 100, `${id}: for kort definisjon`);
    assert(text(emne.why_it_matters).length >= 80, `${id}: for svak hvorfor-forklaring`);
    assert((emne.key_questions || []).length === 3, `${id}: skal ha tre kjernespørsmål`);
    assert((emne.conflicts || []).length >= 3, `${id}: skal ha minst tre fagspesifikke konflikter`);
    assert((emne.critical_distinctions || []).length >= 2, `${id}: mangler kritiske skiller`);
    assert(isDeepStrictEqual(emne.analysis_axes, emne.critical_distinctions), `${id}: synlige analyseakser er ikke emnespesifikke`);
    assert((emne.quiz_angles || []).length === 3, `${id}: mangler tre operative quizvinkler`);
    assert((emne.blindspots || []).length === 2, `${id}: mangler emnespesifikke blindsoner`);
    assert(!norm(emne.definition).includes('som natur- og miljøfaglig inngang'), `${id}: generisk definisjonsmal står igjen`);
    assert(!(emne.key_questions || [])[0]?.startsWith('Hvilken konkret art, habitat, vassdrag'), `${id}: generisk kjernespørsmål står igjen`);
    assert(!(emne.conflicts || []).includes('naturopplevelse vs økologisk analyse'), `${id}: generisk konfliktliste står igjen`);
    for (const methodId of new Set([...(emne.method_ids || []), ...(emne.methods || []), ...(emne.recommended_methods || [])])) {
      assert(methodIds.has(methodId), `${id}: ukjent metode ${methodId}`);
    }
    definitions.push(norm(emne.definition));
    whys.push(norm(emne.why_it_matters));
    questions.push(emne.key_questions);
    conflicts.push(emne.conflicts);
  }
  assert(unique(definitions), 'Natur-emnene har dupliserte definisjoner');
  assert(unique(whys), 'Natur-emnene har dupliserte hvorfor-forklaringer');
  assert(unique(questions), 'Natur-emnene har dupliserte kjernespørsmål');
  assert(unique(conflicts), 'Natur-emnene har dupliserte konfliktsett');

  const methodDescriptions = [], methodData = [];
  for (const method of methods) {
    const id = method.method_id;
    assert(text(method.description).length >= 110, `${id}: for svak metodeforklaring`);
    assert((method.data_forms || []).length >= 3, `${id}: mangler konkrete datatyper`);
    assert((method.procedure || []).length >= 3, `${id}: mangler arbeidsprosedyre`);
    assert((method.limitations || []).length >= 2, `${id}: mangler begrensninger`);
    assert((method.question_moves || []).length >= 3, `${id}: mangler spørsmålsbevegelser`);
    assert(!norm(method.description).includes('brukes når konkrete naturdata, stedsspor'), `${id}: generisk metodehale står igjen`);
    methodDescriptions.push(norm(method.description));
    methodData.push(method.data_forms);
  }
  assert(unique(methodDescriptions), 'Natur-metodene har dupliserte beskrivelser');
  assert(unique(methodData), 'Natur-metodene har identiske datagrunnlag');

  assert(quiz.title === 'Natur & miljø', 'Quizprofilen bruker feil faglabel');
  assert(quiz.normal_question_opening?.sets === 2 && quiz.normal_question_opening?.questions_per_set === 7, 'Quizprofilen mangler 2 × 7 normale åpningsspørsmål');
  assert((quiz.category_rules || []).some((r) => r.includes('stedet eller fenomenet')), 'Quizprofilen mangler konkretitetsregel');
  assert(quiz.knowledge_delivery?.required === true, 'Quizprofilen mangler Knowledge-leveranse');
  assert(!JSON.stringify({ emner, methods }).includes('miljørettpferdig'), 'Naturpakken inneholder kjent språkfeil');
  assert(!badge.includes('full teoretisk beskrivelse') && !badge.includes('fulle interne teorien'), 'Det byte-bevarte Natur-arkivet fremstår som intern teorifil');
  assert(badge.includes('fagverk.html?subject=natur'), 'Det byte-bevarte Natur-arkivet mangler fagsidelenke');
  assert(badge.includes('77 materialiserte emner, 51 metoder og tolv redigerte kapitler'), 'Det byte-bevarte Natur-arkivet mangler sluttfasens produksjonstall');
  assert(badge.includes('audited') && badge.includes('complete'), 'Det byte-bevarte Natur-arkivet mangler sluttstatus');
  for (const domain of pensum.domains) assert(badge.includes(domain.label), `Det byte-bevarte Natur-arkivet omtaler ikke fagområdet ${domain.label}`);

  const report = {
    schema: 'history_go_natur_subject_quality_audit_v1',
    version: '1.2.0',
    status: 'passed',
    generatedFrom: P,
    summary: {
      domainCount: pensum.domains.length,
      emneCount: emner.length,
      methodCount: methods.length,
      mappingCount: mappings.length,
      hookCount: (fagkart.categories || []).reduce((sum, c) => sum + (c.topic_hooks || []).length, 0),
      uniqueDefinitions: new Set(definitions).size,
      uniqueWhyExplanations: new Set(whys).size,
      uniqueQuestionSets: new Set(questions.map(JSON.stringify)).size,
      uniqueConflictSets: new Set(conflicts.map(JSON.stringify)).size,
      methodsWithProcedure: methods.filter((m) => (m.procedure || []).length >= 3).length,
      methodsWithLimitations: methods.filter((m) => (m.limitations || []).length >= 2).length,
      normalOpeningQuestions: quiz.normal_question_opening.sets * quiz.normal_question_opening.questions_per_set
    },
    gates: {
      canonicalFinalOverlayLoaded: true,
      universalSubjectScope: true,
      canonicalDomainReferences: true,
      noGenericEmneTemplates: true,
      noDuplicateEmneLearningText: true,
      emneSpecificVisibleAnalysis: true,
      emneSpecificQuizAndBlindspots: true,
      methodProceduresAndLimits: true,
      twoTimesSevenNormalQuizOpening: true,
      preservedLegacyBadgeSource: true,
      finalPhaseCountsVisible: true,
      finalStatusVisible: true
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
    const report = auditNaturQuality({ writeReport: args.has('--write-report'), checkReport: !args.has('--no-check-report') });
    console.log(`Natur-kvalitet OK: ${report.summary.emneCount} emner, ${report.summary.methodCount} metoder og ${report.summary.normalOpeningQuestions} normale åpningsspørsmål.`);
  } catch (error) {
    console.error(`Natur-kvalitet FEIL: ${error.message}`);
    process.exitCode = 1;
  }
}
