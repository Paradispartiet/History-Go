#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const P = Object.freeze({
  pensum: 'data/fag/natur/naturpensum_canonical_v4_5.json',
  emner: 'data/fag/natur/emner_natur_canonical_v4_5.json',
  methods: 'data/fag/natur/methods_natur_canonical_v4_5.json',
  fagkart: 'data/fag/natur/fagkart_natur_canonical_v4_5.json',
  mappings: 'data/fag/natur/emnemapping_natur_canonical_v4_5.json',
  report: 'reports/fagverk/natur-fagkart-quality-audit.json'
});
const abs = (p) => path.join(ROOT, p);
const json = (p) => JSON.parse(fs.readFileSync(abs(p), 'utf8'));
const assert = (ok, msg) => { if (!ok) throw new Error(msg); };
const norm = (v) => String(v ?? '').trim().replace(/\s+/g, ' ').toLocaleLowerCase('nb-NO');
const unique = (values) => new Set(values.map((v) => JSON.stringify(v))).size === values.length;

export function auditNaturFagkartQuality({ writeReport = false, checkReport = true } = {}) {
  const pensum = json(P.pensum);
  const emners = json(P.emner);
  const methodsDoc = json(P.methods);
  const fagkart = json(P.fagkart);
  const mappings = json(P.mappings);
  const emneIds = new Set(emners.map((e) => e.emne_id));
  const methodIds = new Set((methodsDoc.methods || []).map((m) => m.method_id));
  const pensumDomains = new Map(pensum.domains.map((d) => [d.domain_id, d]));
  const categories = fagkart.categories || [];
  const categoryIds = new Set(categories.map((c) => c.id));
  const hooks = categories.flatMap((category) => (category.topic_hooks || []).map((hook) => ({ category, hook })));
  const hookIndex = new Map(hooks.map((row) => [row.hook.id, row]));

  assert(fagkart.scope === 'universal', 'Natur-fagkartet skal ha universelt fagomfang');
  assert(categories.length === 6, `Forventet 6 fagkartkategorier, fikk ${categories.length}`);
  assert(hooks.length === 60, `Forventet 60 Natur-hooks, fikk ${hooks.length}`);
  assert(hookIndex.size === 60, 'Natur-fagkartet har dupliserte hook-id-er');
  assert(categories.every((c) => pensumDomains.has(c.id)), 'Fagkartkategori mangler i pensum');

  const focusQuestions = [];
  const questionMoves = [];
  const rotationNotes = [];
  let hookEmneReferences = 0;
  let hookMethodReferences = 0;
  for (const { category, hook } of hooks) {
    const id = hook.id;
    assert(categoryIds.has(category.id), `${id}: ukjent kategori`);
    assert(norm(hook.focus_question).length >= 55, `${id}: mangler konkret fokusspørsmål`);
    assert((hook.evidence_focus || []).length >= 3, `${id}: mangler minst tre evidensformer`);
    assert((hook.preferred_question_moves || []).length === 3, `${id}: skal ha tre hookspesifikke spørsmålsbevegelser`);
    assert(norm(hook.rotation_note).length >= 75, `${id}: mangler hookspesifikt rotasjonsnotat`);
    assert(!(hook.preferred_question_moves || []).includes('start_with_concrete_ecosystem_species_water_climate_or_geology'), `${id}: gammel generisk spørsmålsmal står igjen`);
    assert(!norm(hook.rotation_note).startsWith('roter arter, habitater, vassdrag'), `${id}: gammelt generisk rotasjonsnotat står igjen`);
    for (const emneId of hook.emne_ids || []) {
      assert(emneIds.has(emneId), `${id}: ukjent emne ${emneId}`);
      hookEmneReferences += 1;
    }
    for (const methodId of hook.recommended_method_ids || []) {
      assert(methodIds.has(methodId), `${id}: ukjent metode ${methodId}`);
      hookMethodReferences += 1;
    }
    focusQuestions.push(norm(hook.focus_question));
    questionMoves.push(hook.preferred_question_moves);
    rotationNotes.push(norm(hook.rotation_note));
  }
  assert(unique(focusQuestions), 'Natur-hooks har dupliserte fokusspørsmål');
  assert(unique(questionMoves), 'Natur-hooks har dupliserte spørsmålsbevegelser');
  assert(unique(rotationNotes), 'Natur-hooks har dupliserte rotasjonsnotater');

  assert(mappings.length === 35, `Forventet 35 emnemappings, fikk ${mappings.length}`);
  assert(new Set(mappings.map((row) => row.emne_id)).size === mappings.length, 'Dupliserte emne-rader i mappingregisteret');
  const mappingUseNotes = [];
  let mappingCount = 0;
  for (const row of mappings) {
    assert(emneIds.has(row.emne_id), `Mappingregisteret har ukjent emne ${row.emne_id}`);
    assert((row.mappings || []).length > 0, `${row.emne_id}: mangler hookmapping`);
    for (const mapping of row.mappings) {
      mappingCount += 1;
      const indexed = hookIndex.get(mapping.topic_hook);
      assert(indexed, `${row.emne_id}: ukjent hook ${mapping.topic_hook}`);
      assert(mapping.fagkart_kategori === indexed.category.id, `${row.emne_id}/${mapping.topic_hook}: feil fagkartkategori`);
      assert(mapping.fagkart_kategori_tittel === indexed.category.title, `${row.emne_id}/${mapping.topic_hook}: feil kategoritittel`);
      assert(mapping.topic_hook_tittel === indexed.hook.title, `${row.emne_id}/${mapping.topic_hook}: feil hooktittel`);
      assert(isDeepStrictEqual(mapping.preferred_question_moves, indexed.hook.preferred_question_moves), `${row.emne_id}/${mapping.topic_hook}: spørsmålsbevegelser er ikke synkronisert`);
      assert(isDeepStrictEqual(mapping.evidence_focus, indexed.hook.evidence_focus), `${row.emne_id}/${mapping.topic_hook}: evidensfokus er ikke synkronisert`);
      assert(norm(mapping.use_note).length >= 90, `${row.emne_id}/${mapping.topic_hook}: use_note er for svak`);
      assert(!norm(mapping.use_note).includes('canonical kobling materialisert'), `${row.emne_id}/${mapping.topic_hook}: generisk materialiseringsnote står igjen`);
      for (const methodId of mapping.recommended_method_ids || []) assert(methodIds.has(methodId), `${row.emne_id}/${mapping.topic_hook}: ukjent metode ${methodId}`);
      mappingUseNotes.push(norm(mapping.use_note));
    }
  }
  assert(unique(mappingUseNotes), 'Emnemappingene har dupliserte use_notes');

  const report = {
    schema: 'history_go_natur_fagkart_quality_audit_v1',
    version: '1.0.0',
    status: 'passed',
    generatedFrom: P,
    summary: {
      categoryCount: categories.length,
      hookCount: hooks.length,
      uniqueFocusQuestions: new Set(focusQuestions).size,
      uniqueQuestionMoveSets: new Set(questionMoves.map(JSON.stringify)).size,
      uniqueRotationNotes: new Set(rotationNotes).size,
      hookEmneReferences,
      hookMethodReferences,
      mappedEmneCount: mappings.length,
      mappingCount,
      uniqueMappingUseNotes: new Set(mappingUseNotes).size
    },
    gates: {
      universalScope: true,
      canonicalCategoryReferences: true,
      allHookReferencesResolved: true,
      hookSpecificLearningFocus: true,
      hookSpecificQuestionMoves: true,
      mappingCategoryAndTitleSync: true,
      mappingEvidenceAndUseNotes: true
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
    const report = auditNaturFagkartQuality({ writeReport: args.has('--write-report'), checkReport: !args.has('--no-check-report') });
    console.log(`Natur-fagkart OK: ${report.summary.hookCount} unike hooks og ${report.summary.mappingCount} synkroniserte mappings.`);
  } catch (error) {
    console.error(`Natur-fagkart FEIL: ${error.message}`);
    process.exitCode = 1;
  }
}
