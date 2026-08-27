#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const P = {
  pensum: 'data/fag/utdanning/utdanningpensum_canonical_v1.json',
  emner: 'data/fag/utdanning/emner_utdanning_canonical_v1.json',
  registry: 'data/fagverk/fagverk_registry.json',
  output: 'data/fag/utdanning/theory_integrity_bindings_utdanning_v1.json',
};
const abs = (file) => path.join(ROOT, file);
const read = (file) => JSON.parse(fs.readFileSync(abs(file), 'utf8'));
const write = (file, value) => { fs.mkdirSync(path.dirname(abs(file)), { recursive: true }); fs.writeFileSync(abs(file), `${JSON.stringify(value, null, 2)}\n`); };
const assert = (condition, message) => { if (!condition) throw new Error(message); };

function binding(section, moduleFile, chapterFile, claimsById, paragraphIndex, role) {
  const claimId = section.paragraphClaimIds[paragraphIndex]?.[0];
  const claim = claimsById.get(claimId);
  assert(claim, `${section.id}/${paragraphIndex}: claim mangler`);
  return { role, chapter_file: chapterFile, module_file: moduleFile, section_id: section.id, paragraph_index: paragraphIndex, claim_id: claimId, source_ids: claim.source_ids };
}

export function buildUtdanningTheoryIntegrityBindingsV1({ writeOutput = true } = {}) {
  const pensum = read(P.pensum);
  const emners = read(P.emner);
  const registry = read(P.registry).subjects.utdanning;
  assert(pensum.domain_order.length === 14 && registry.chapters.length === 14, 'Utdanning strict proof krever 14/14 kapitler');
  const emneByDomain = new Map(emners.map((entry) => [entry.domain, entry.emne_id]));
  const chapterByDomain = new Map(registry.chapters.map((entry) => [entry.primary_domain_id, entry]));

  const fields = pensum.domain_order.map((domainId) => {
    const chapterEntry = chapterByDomain.get(domainId);
    assert(chapterEntry, `${domainId}: registry-kapittel mangler`);
    const chapter = read(chapterEntry.file);
    const claimsDoc = read(chapterEntry.claimsFile);
    const claimsById = new Map(claimsDoc.claims.map((claim) => [claim.id, claim]));
    const sourcesById = new Map(claimsDoc.sources.map((source) => [source.id, source]));
    const sections = chapter.moduleFiles.flatMap((moduleFile) => read(moduleFile).sections.map((section) => ({ moduleFile, section })));
    assert(sections.length === 8, `${domainId}: åtte seksjoner kreves`);
    const selected = sections.slice(0, 2);
    const usedFieldSources = new Set();

    const modelObjects = selected.map(({ moduleFile, section }, index) => {
      const alternative = selected[1 - index];
      const mechanismClaimId = section.paragraphClaimIds[0][0];
      const mechanismClaim = claimsById.get(mechanismClaimId);
      const sourceId = mechanismClaim.source_ids.find((id) => !usedFieldSources.has(id));
      const source = sourcesById.get(sourceId);
      assert(source, `${domainId}/${section.id}: selvstendig scholarly source mangler`);
      usedFieldSources.add(sourceId);
      return {
        id: `utdanning-${String(pensum.domain_order.indexOf(domainId) + 1).padStart(2, '0')}-${index + 1}`,
        model_kind: 'documented_domain_theory_or_analytical_framework',
        model_name: section.title,
        named_work_binding: `${source.publisher || source.label} – ${source.title || source.label}`,
        emne_id: emneByDomain.get(domainId),
        domain_id: domainId,
        scope: `${section.title} brukes som kilde- og claimsporet analysegrunnlag innen ${chapter.title}, avgrenset til mekanismene, vilkårene og konsekvensene som faktisk dokumenteres i kapittelet.`,
        core_claim_or_mechanism: section.paragraphs[0],
        limitations: [
          section.paragraphs[3],
          'Bindingen dokumenterer generell utdanningsfaglig analyse. Den kan ikke alene avgjøre en enkelt elevs rettigheter, kompetanse, risiko, tiltak eller framtidige læringsutfall.',
        ],
        rival_or_alternative: `${alternative.section.title} er et komplementært analysegrunnlag som synliggjør andre mekanismer, forutsetninger og gyldighetsgrenser enn ${section.title}.`,
        interpretive_consequence: `Påstander fra ${section.title} må derfor prøves mot formål, kontekst, evidens og begrensninger, og kan ikke generaliseres forbi det claimsporede innholdet eller erstatte den komplementære analysen i ${alternative.section.title}.`,
        scholarly_source: {
          source_id: sourceId,
          label: source.label || `${source.publisher} – ${source.title}`,
          url: source.url,
          authority_class: source.type || 'inspectable-scholarly-or-official-source',
          source_role: source.evidence_role || source.source_location,
          use_limit: 'Kilden brukes bare innen sitt dokumenterte evidensområde og aldri som selvstendig grunnlag for individuell elevdiagnose, automatisk rettighetsavgjørelse eller udokumentert årsaksslutning.',
        },
        content_bindings: [
          binding(section, moduleFile, chapterEntry.file, claimsById, 0, 'mechanism'),
          binding(section, moduleFile, chapterEntry.file, claimsById, 3, 'limitation'),
          binding(alternative.section, alternative.moduleFile, chapterEntry.file, claimsById, 0, 'alternative'),
        ],
      };
    });

    return {
      domain_id: domainId,
      domain_label: pensum.domains.find((entry) => entry.domain_id === domainId).title,
      comparison: {
        model_object_ids: modelObjects.map((entry) => entry.id),
        interpretive_consequence: `${modelObjects[0].model_name} og ${modelObjects[1].model_name} brukes som komplementære, dokumenterte analysegrunnlag. Sammen hindrer de at ${domainId} reduseres til ett mål, én metode, én årsak eller en kontekstfri anbefaling.`,
      },
      model_objects: modelObjects,
    };
  });

  const bindings = {
    schema: 'history_go_utdanning_theory_integrity_bindings_v1',
    version: '1.0.0',
    status: 'canonical',
    subject_id: 'utdanning',
    profile: 'theorist_rival',
    completion_status_read_only: true,
    content_mutation: false,
    production_rule: 'Strict proof krever to komplementære teorier, modeller eller analysegrunnlag per canonicalt Utdanning-hovedfelt, inspectable faglige kilder, eksakte claimsporede prosebindings, eksplisitte begrensninger og reell alternativ analyse.',
    safety_boundary: 'Generell utdanningsfaglig analyse; aldri automatisk elevdiagnose, rettighetsavgjørelse, risikoklassifisering eller udokumentert årsaksslutning.',
    fields,
  };
  if (writeOutput) write(P.output, bindings);
  return bindings;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const result = buildUtdanningTheoryIntegrityBindingsV1();
  console.log(`Utdanning theory-integrity bindings bygget: ${result.fields.length} hovedfelt / ${result.fields.flatMap((field) => field.model_objects).length} modellobjekter.`);
}
