#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { auditHistoryCompletion } from '../tools/audit-historie-completion.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => JSON.parse(fs.readFileSync(path.join(ROOT, p), 'utf8'));
const arr = (v) => Array.isArray(v) ? v : [];
const norm = (v) => String(v || '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('nb').replace(/[^a-z0-9]+/g, ' ').trim();
const assert = (ok, msg) => { if (!ok) throw new Error(msg); };
const deepStrings = (value, out = []) => {
  if (typeof value === 'string') out.push(value);
  else if (Array.isArray(value)) value.forEach((item) => deepStrings(item, out));
  else if (value && typeof value === 'object') Object.values(value).forEach((item) => deepStrings(item, out));
  return out;
};

const P = {
  registry: 'data/fagverk/fagverk_registry.json',
  pensum: 'data/fag/historie/historiepensum_canonical_v4_5.json',
  emner: 'data/fag/historie/emner_historie_canonical_v4_5.json',
  theories: 'data/fag/historie/theory_objects_historie_canonical_v5_5.json',
  evidence: 'data/fag/historie/theory_evidence_historie_canonical_v1.json'
};

function isGeneratorOwned(chapter) {
  const doc = read(chapter.file);
  if (!doc.productionBriefFile) return false;
  const brief = read(doc.productionBriefFile);
  return brief.generatedFrom?.generator === 'tools/materialize-historie-editorial-chapters.mjs';
}

function thinkerAppears(text, thinkerId) {
  const parts = norm(thinkerId).split(/\s+/).filter(Boolean);
  const surname = parts.at(-1);
  return surname?.length >= 4 && (` ${norm(text)} `).includes(` ${surname} `);
}

export function auditHistorieTheoryIntegrity() {
  const completion = auditHistoryCompletion();
  const registry = read(P.registry).subjects.historie;
  const pensum = read(P.pensum);
  const emners = read(P.emner);
  const theories = read(P.theories);
  const evidenceDoc = read(P.evidence);
  const emneById = new Map(emners.map((emne) => [emne.emne_id, emne]));
  const theoryByHook = new Map(theories.map((theory) => [theory.source_hook_id, theory]));
  const theoryById = new Map(theories.map((theory) => [theory.theory_id, theory]));
  const evidenceById = new Map(arr(evidenceDoc.entries).map((entry) => [entry.theory_id, entry]));
  const domainById = new Map(arr(pensum.domains).map((domain) => [domain.domain_id, domain]));

  assert(registry.chapters.length === 23, `Historie skal ha 23 kapitler, fant ${registry.chapters.length}`);
  const handBuilt = registry.chapters.filter((chapter) => !isGeneratorOwned(chapter));
  const generated = registry.chapters.filter(isGeneratorOwned);
  assert(generated.length === 18, `Historie skal ha 18 generator-eide kapitler, fant ${generated.length}`);
  assert(handBuilt.length === 5, `Historie skal ha 5 håndbygde kapitler, fant ${handBuilt.length}`);

  const fields = [];
  for (const chapterMeta of handBuilt) {
    const chapter = read(chapterMeta.file);
    const domain = domainById.get(chapterMeta.primary_domain_id);
    assert(domain, `${chapterMeta.id}: ukjent canonicalt hovedfelt ${chapterMeta.primary_domain_id}`);
    assert(arr(domain.emne_ids).length === 10, `${chapterMeta.id}: håndbygd Historie-felt skal ha 10 canonicale emner`);
    assert(JSON.stringify(arr(chapterMeta.emne_ids)) === JSON.stringify(arr(domain.emne_ids)), `${chapterMeta.id}: registry-emner avviker fra canonicalt hovedfelt`);
    assert(arr(chapter.moduleFiles).length === 3, `${chapterMeta.id}: håndbygd kapittel må ha tre moduler`);

    const modules = chapter.moduleFiles.map(read);
    const prose = deepStrings(modules).join(' ');
    const claimIds = [...new Set(modules.flatMap((module) => arr(module.claimIds)))];
    const theoryEvidenceIds = [...new Set(modules.flatMap((module) => arr(module.theoryEvidenceIds)))];
    const sources = modules.flatMap((module) => arr(module.sources));
    const sourceLimitations = modules.flatMap((module) => arr(module.sourceLimitations));
    const scholarlySources = sources.filter((source) => /scholarly|academic|journal|university_press/i.test(String(source.type || '')));

    assert(claimIds.length > 0, `${chapterMeta.id}: mangler eksplisitt claim-binding`);
    assert(theoryEvidenceIds.length > 0, `${chapterMeta.id}: mangler eksplisitt theoryEvidenceIds-binding`);
    assert(scholarlySources.length > 0, `${chapterMeta.id}: mangler scholarly teori-/historiografikilde`);
    assert(sourceLimitations.length >= 2, `${chapterMeta.id}: mangler eksplisitte kilde-/gyldighetsbegrensninger`);
    assert(/alternativ|konkurrer|uenig|motperspektiv|sammenlign/i.test(prose), `${chapterMeta.id}: mangler reell alternativ/rival-signal i kapittelmaterialet`);

    const domainThinkers = arr(domain.canonical_thinker_ids);
    assert(domainThinkers.length > 0, `${chapterMeta.id}: canonicalt hovedfelt mangler historiografisk provenance`);
    const usedThinkers = domainThinkers.filter((id) => thinkerAppears(prose, id));
    assert(usedThinkers.length > 0, `${chapterMeta.id}: ingen canonical historiker/teoretiker er faktisk brukt i kapittelprosaen`);

    const primaryTheories = [];
    for (const emneId of domain.emne_ids) {
      const emne = emneById.get(emneId);
      assert(emne, `${chapterMeta.id}/${emneId}: canonicalt emne mangler`);
      const hooks = arr(emne.primary_theory_hooks);
      assert(hooks.length === 1, `${chapterMeta.id}/${emneId}: skal ha nøyaktig én canonical primary theory hook`);
      const theory = theoryByHook.get(hooks[0]);
      assert(theory, `${chapterMeta.id}/${emneId}: primary hook mangler theory object`);
      assert(arr(theory.explanatory_scope).includes(domain.domain_id), `${chapterMeta.id}/${emneId}: theory object har feil scope`);
      assert(arr(theory.limitations).length >= 2, `${chapterMeta.id}/${emneId}: theory object mangler begrensninger`);
      assert(arr(theory.thinker_ids).length > 0, `${chapterMeta.id}/${emneId}: theory object mangler faglig provenance`);
      const evidence = evidenceById.get(theory.theory_id);
      assert(evidence?.status === 'evidence_ready', `${chapterMeta.id}/${emneId}: theory evidence er ikke evidence_ready`);
      assert(arr(evidence.source_ids).length > 0, `${chapterMeta.id}/${emneId}: theory evidence mangler kilder`);
      assert(arr(evidence.limitations).length >= 1, `${chapterMeta.id}/${emneId}: theory evidence mangler begrensning`);
      assert(arr(evidence.alternative_interpretations).length >= 1, `${chapterMeta.id}/${emneId}: theory evidence mangler alternativ fortolkning`);
      assert(arr(evidence.emne_ids).includes(emneId), `${chapterMeta.id}/${emneId}: theory evidence er ikke bundet til canonicalt emne`);
      primaryTheories.push(theory.theory_id);
    }

    for (const theoryId of theoryEvidenceIds) {
      const theory = theoryById.get(theoryId);
      const evidence = evidenceById.get(theoryId);
      assert(theory, `${chapterMeta.id}: theoryEvidenceId peker til ukjent teori ${theoryId}`);
      assert(evidence?.status === 'evidence_ready', `${chapterMeta.id}: eksplisitt theoryEvidenceId er ikke evidence_ready ${theoryId}`);
      assert(arr(theory.explanatory_scope).includes(domain.domain_id), `${chapterMeta.id}: eksplisitt theoryEvidenceId har feil hovedfeltscope ${theoryId}`);
    }

    fields.push({
      id: domain.domain_id,
      chapterId: chapterMeta.id,
      status: 'green',
      emneCount: domain.emne_ids.length,
      primaryTheoryCount: new Set(primaryTheories).size,
      explicitTheoryEvidenceIds: theoryEvidenceIds,
      claimCount: claimIds.length,
      scholarlySourceCount: scholarlySources.length,
      sourceLimitationCount: sourceLimitations.length,
      usedCanonicalThinkerIds: usedThinkers
    });
  }

  assert(fields.length === 5 && fields.every((field) => field.status === 'green'), 'Historie håndbygde hovedfelt er ikke fullt reconcilet');
  return {
    status: 'strong_field_theory_integrity',
    chapterCount: registry.chapters.length,
    generatedChapterCount: generated.length,
    handBuiltChapterCount: handBuilt.length,
    handBuiltChapterIds: handBuilt.map((chapter) => chapter.id),
    completionAudit: completion,
    fields
  };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const result = auditHistorieTheoryIntegrity();
    console.log(JSON.stringify({
      status: result.status,
      chapterCount: result.chapterCount,
      generatedChapterCount: result.generatedChapterCount,
      handBuiltChapterCount: result.handBuiltChapterCount,
      handBuiltChapterIds: result.handBuiltChapterIds,
      fields: result.fields
    }, null, 2));
  } catch (error) {
    console.error(`Fagverk Historie theory integrity FEIL: ${error.message}`);
    process.exitCode = 1;
  }
}
