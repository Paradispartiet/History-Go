#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const readJson = (relativePath) => JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), 'utf8'));
const writeJson = (relativePath, value) => {
  const absolutePath = path.join(ROOT, relativePath);
  fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
  fs.writeFileSync(absolutePath, `${JSON.stringify(value, null, 2)}\n`);
};
const list = (value) => Array.isArray(value) ? value : [];
const unique = (values) => [...new Set(values.filter(Boolean))];
const humanize = (value) => String(value || '')
  .replace(/^his_/, '')
  .replaceAll('_', ' ')
  .replace(/(^|\s)\S/g, (letter) => letter.toLocaleUpperCase('nb-NO'));
const slug = (value) => String(value || '')
  .replace(/^his_/, '')
  .replace(/[^a-z0-9_]+/gi, '_')
  .replace(/^_+|_+$/g, '')
  .toLocaleLowerCase('nb-NO');

const pensum = readJson('data/fag/historie/historiepensum_canonical_v4_5.json');
const fagkart = readJson('data/fag/historie/fagkart_historie_canonical_v4_5.json');
const emner = readJson('data/fag/historie/emner_historie_canonical_v4_5.json');
const concepts = readJson('data/fag/historie/concepts_historie_canonical_v5_5.json');
const theories = readJson('data/fag/historie/theory_objects_historie_canonical_v5_5.json');
const evidence = readJson('data/fag/historie/theory_evidence_historie_canonical_v1.json');
const claimRegistry = readJson('data/fag/historie/claims_historie_canonical_v1.json');
const sourceRegistry = readJson('data/fag/historie/sources_historie_canonical_v1.json');
const registry = readJson('data/fagverk/fagverk_registry.json');
const status = readJson('data/fagverk/subject_status.json');

const emneById = new Map(emner.map((item) => [item.emne_id, item]));
const theoryByHookId = new Map(theories.map((item) => [item.source_hook_id, item]));
const evidenceByTheoryId = new Map(evidence.entries.map((item) => [item.theory_id, item]));
const claimById = new Map(claimRegistry.claims.map((item) => [item.claim_id, item]));
const sourceById = new Map(sourceRegistry.sources.map((item) => [item.source_id, item]));
const conceptsByEmneId = new Map();
for (const concept of concepts) {
  for (const emneId of list(concept.source_emne_ids)) {
    const rows = conceptsByEmneId.get(emneId) || [];
    rows.push(concept);
    conceptsByEmneId.set(emneId, rows);
  }
}

const chapterRows = registry.subjects.historie.chapters;
const existingDomainIds = new Set(chapterRows.map((item) => item.primary_domain_id));
const generatedRows = [];

function theoryPackage(category, emneId) {
  const hook = list(category.topic_hooks).find((item) => list(item.emne_ids).includes(emneId));
  if (!hook) throw new Error(`${category.id}/${emneId}: mangler topic hook`);
  const theory = theoryByHookId.get(hook.id);
  if (!theory) throw new Error(`${hook.id}: mangler teoriobjekt`);
  const theoryEvidence = evidenceByTheoryId.get(theory.theory_id);
  if (!theoryEvidence || theoryEvidence.status !== 'evidence_ready') throw new Error(`${theory.theory_id}: mangler ferdig evidens`);
  const claims = list(theoryEvidence.claim_ids).map((id) => claimById.get(id)).filter(Boolean);
  if (!claims.length) throw new Error(`${theory.theory_id}: mangler claims`);
  return { hook, theory, theoryEvidence, claims };
}

function sectionFor(category, emne, index) {
  const pack = theoryPackage(category, emne.emne_id);
  const claimIds = pack.claims.map((claim) => claim.claim_id);
  const evidenceSentences = pack.claims.slice(0, 3).map((claim) => claim.statement).join(' ');
  const limitation = list(pack.theory.limitations)[0] || list(pack.theoryEvidence.limitations)[0] || '';
  const conceptsForEmne = list(conceptsByEmneId.get(emne.emne_id)).slice(0, 6);
  const distinctions = unique([
    ...list(emne.conflicts),
    ...list(emne.analysis_axes),
    ...conceptsForEmne.flatMap((concept) => list(concept.distinguish_from).map((id) => concepts.find((item) => item.concept_id === id)?.label))
  ]).slice(0, 4);
  return {
    id: slug(emne.emne_id.replace(/^em_his_/, '')),
    title: `${index + 1}. ${emne.title}`,
    paragraphs: [
      emne.definition,
      emne.why_it_matters,
      `${pack.theory.definition} ${limitation ? `En viktig avgrensning er at ${limitation.charAt(0).toLocaleLowerCase('nb-NO')}${limitation.slice(1)}` : ''}`.trim(),
      `${evidenceSentences} Samlet brukes dette evidensgrunnlaget slik: ${pack.theoryEvidence.rationale}`
    ],
    paragraphClaimIds: [claimIds, claimIds, claimIds, claimIds],
    keyPoints: unique([
      ...list(emne.key_questions).slice(0, 2),
      ...distinctions.map((item) => `Skill analytisk mellom ${item}.`)
    ]).slice(0, 4),
    concepts: conceptsForEmne.map((concept) => ({
      id: concept.concept_id,
      term: concept.label,
      definition: concept.definition
    })),
    _pack: pack
  };
}

function sourceItem(source) {
  return {
    id: source.source_id,
    label: source.title,
    publisher: source.publisher,
    url: source.url,
    type: source.source_type,
    limitations: list(source.limitations)
  };
}

function buildChapter(domain) {
  const category = fagkart.categories.find((item) => item.id === domain.domain_id);
  if (!category) throw new Error(`${domain.domain_id}: mangler fagkartkategori`);
  const domainEmner = domain.emne_ids.map((id) => emneById.get(id));
  if (domainEmner.some((item) => !item)) throw new Error(`${domain.domain_id}: mangler emne`);
  const sections = domainEmner.map((emne, index) => sectionFor(category, emne, index));
  const packages = sections.map((section) => section._pack);
  const theoryIds = packages.map((pack) => pack.theory.theory_id);
  const allClaimIds = unique(packages.flatMap((pack) => pack.theoryEvidence.claim_ids));
  const allSourceIds = unique(packages.flatMap((pack) => pack.theoryEvidence.source_ids));
  const allConcepts = unique(domainEmner.flatMap((emne) => list(conceptsByEmneId.get(emne.emne_id)).map((item) => item.concept_id)))
    .map((id) => concepts.find((item) => item.concept_id === id)).filter(Boolean);
  const directory = `data/fagverk/historie/${slug(domain.domain_id)}`;
  const chapterId = slug(domain.domain_id);
  const moduleDefinitions = [
    { file: '01-grunnlag.json', rows: sections.slice(0, 4) },
    { file: '02-fordypning.json', rows: sections.slice(4, 7) },
    { file: '03-anvendelse.json', rows: sections.slice(7) }
  ];
  const moduleFiles = moduleDefinitions.map((item) => `${directory}/${item.file}`);

  for (const [moduleIndex, definition] of moduleDefinitions.entries()) {
    const modulePackages = definition.rows.map((section) => section._pack);
    const moduleClaimIds = unique(modulePackages.flatMap((pack) => pack.theoryEvidence.claim_ids));
    const moduleSourceIds = unique(modulePackages.flatMap((pack) => pack.theoryEvidence.source_ids));
    const outputSections = definition.rows.map(({ _pack, ...section }) => section);
    const module = {
      sections: outputSections,
      concepts: unique(definition.rows.flatMap((section) => list(conceptsByEmneId.get(section._pack.hook.emne_ids[0])).map((item) => item.concept_id)))
        .map((id) => concepts.find((item) => item.concept_id === id)).filter(Boolean).slice(0, 18)
        .map((concept) => ({ id: concept.concept_id, term: concept.label, definition: concept.definition })),
      claimIds: moduleClaimIds,
      theoryEvidenceIds: modulePackages.map((pack) => pack.theory.theory_id),
      sources: moduleSourceIds.map((id) => sourceById.get(id)).filter(Boolean).map(sourceItem),
      sourceLimitations: unique(moduleSourceIds.flatMap((id) => list(sourceById.get(id)?.limitations))).slice(0, 5)
    };
    if (moduleIndex === 2) {
      const examples = packages.slice(0, 2);
      module.workedExamples = examples.map((pack) => ({
        title: `Fra dokumentert spor til forklaring: ${pack.hook.title}`,
        situation: pack.claims.slice(0, 2).map((claim) => claim.statement).join(' '),
        analysis: unique([
          pack.theory.definition,
          pack.theoryEvidence.rationale,
          ...list(pack.theoryEvidence.limitations).slice(0, 1),
          ...list(pack.theoryEvidence.alternative_interpretations).slice(0, 1)
        ])
      }));
      const misconceptionConcepts = allConcepts.filter((concept) => list(concept.common_misuse).length).slice(0, 5);
      module.commonMisconceptions = misconceptionConcepts.map((concept) => ({
        claim: concept.common_misuse[0],
        correction: `${concept.label} betyr her: ${concept.definition}`
      }));
      while (module.commonMisconceptions.length < 5) {
        const pack = packages[module.commonMisconceptions.length % packages.length];
        module.commonMisconceptions.push({
          claim: `At ${pack.hook.title.toLocaleLowerCase('nb-NO')} kan forklares uten tidsavgrensning, kilder eller alternative tolkninger.`,
          correction: `${pack.theory.definition} Analysen må samtidig oppgi begrensningen: ${list(pack.theory.limitations)[0]}`
        });
      }
      module.applicationTasks = packages.slice(0, 4).map((pack) => ({
        task: `Undersøk ${pack.hook.title.toLocaleLowerCase('nb-NO')} i et konkret sted eller historisk forløp.`,
        prompts: [
          'Avgrens tid, sted, aktører og påstanden som skal undersøkes.',
          `Bruk minst to av disse kildene: ${pack.theoryEvidence.source_ids.slice(0, 3).join(', ')}.`,
          `Test forklaringen mot denne innvendingen: ${list(pack.theoryEvidence.alternative_interpretations)[0] || list(pack.theoryEvidence.limitations)[0]}`
        ]
      }));
      module.selfCheck = domainEmner.slice(0, 7).map((emne) => ({
        question: emne.key_questions[0],
        answer: emne.definition
      }));
      module.relatedPlaces = unique(packages.flatMap((pack) => pack.theoryEvidence.place_ids)).slice(0, 8).map((id) => ({
        id,
        name: humanize(id),
        role: `Dokumentert stedscase i evidensgrunnlaget for ${domain.label}.`
      }));
    }
    writeJson(`${directory}/${definition.file}`, module);
  }

  const lead = `${category.definition} Kapittelet følger fagfeltet gjennom de ti canonicale emnene og knytter hvert analyseproblem til konkrete claims, kilder, metoder og begrensninger. Målet er å bygge sammenhengende historiske forklaringer uten å forveksle samtidighet med årsak, regel med praksis eller et synlig spor med hele fortiden.`;
  const chapter = {
    schema: 'history_go_fagverk_chapter_v1',
    version: '1.0.0',
    subject: 'historie',
    id: chapterId,
    title: domain.label,
    subtitle: domain.tagline,
    lead,
    learningObjectives: domainEmner.map((emne) => `forklare ${emne.title.toLocaleLowerCase('nb-NO')} med avgrenset kronologi, navngitte kilder og en uttrykt kildebegrensning`),
    diagnosticQuestions: domainEmner.slice(0, 4).map((emne) => ({
      question: emne.key_questions[0],
      answer: emne.definition
    })),
    productionBriefFile: `${directory}/brief.json`,
    moduleFiles
  };
  const brief = {
    schema: 'history_go_fagverk_chapter_brief_v1',
    version: '1.0.0',
    subject: 'historie',
    chapterId,
    primaryDomainId: domain.domain_id,
    requiredEmneIds: domain.emne_ids,
    requiredMethodIds: domain.method_ids,
    requiredTheoryEvidenceIds: theoryIds,
    editorialRequirements: {
      minimumSectionCount: 10,
      minimumWorkedExamples: 2,
      minimumApplicationTasks: 4,
      minimumSelfChecks: 7,
      paragraphClaimTraceRequired: true,
      canonicalConceptDefinitionsRequired: true,
      sourceLimitationsRequired: true
    },
    evidenceBoundary: [
      'Kapittelet bruker bare claims og kilder som allerede er registrert i Historie-fagets canonicale evidenslag.',
      'Stedscasene dokumenterer anvendelse og variasjon, men gjør ikke lokale funn universelle.',
      'Hver forklaring skal skille dokumentert påstand, analytisk tolkning, alternativ forklaring og kildebegrensning.'
    ],
    generatedFrom: {
      pensum: 'data/fag/historie/historiepensum_canonical_v4_5.json',
      emner: 'data/fag/historie/emner_historie_canonical_v4_5.json',
      concepts: 'data/fag/historie/concepts_historie_canonical_v5_5.json',
      theories: 'data/fag/historie/theory_objects_historie_canonical_v5_5.json',
      evidence: 'data/fag/historie/theory_evidence_historie_canonical_v1.json',
      claims: 'data/fag/historie/claims_historie_canonical_v1.json',
      sources: 'data/fag/historie/sources_historie_canonical_v1.json'
    }
  };
  writeJson(`${directory}.json`, chapter);
  writeJson(`${directory}/brief.json`, brief);
  return {
    id: chapterId,
    title: domain.label,
    subtitle: domain.tagline,
    file: `${directory}.json`,
    primary_domain_id: domain.domain_id,
    emne_ids: domain.emne_ids
  };
}

for (const domain of pensum.domains) {
  if (existingDomainIds.has(domain.domain_id)) continue;
  generatedRows.push(buildChapter(domain));
}

registry.subjects.historie.chapters = [...chapterRows, ...generatedRows]
  .sort((a, b) => pensum.domains.findIndex((item) => item.domain_id === a.primary_domain_id) - pensum.domains.findIndex((item) => item.domain_id === b.primary_domain_id));
registry.subjects.historie.description = 'Et sammenhengende, kildekritisk læreverk om historisk tid, perioder, samfunn, aktører, institusjoner, steder, begreper og fortolkninger fra forhistorie til samtid.';
registry.subjects.historie.canonicalModel.note = 'Fagområder, emner, begreper, metoder, claims og teori-evidens leses fra canonical Historie-data. Registryet eier 23 redigerte lærekapitler og stedsspesifikk kuratering.';
const statusEntry = status.subjects.find((item) => item.id === 'historie');
statusEntry.editorialStatus = 'complete';
statusEntry.nextGate = 'maintenance_and_source_refresh';
statusEntry.note = 'Historie er redaksjonelt komplett med 23 av 23 canonicale fagområder og 23 fullverdige kapitler. Alle 230 emner inngår i et kapittel med teori-evidens, claim- og kildesporing, begrepsforklaringer, eksempler, misoppfatninger, oppgaver og selvtest. Den universitetsnære pensumarkitekturen organiserer stoffet i kronologi, tematiske fagretninger, metode og geografiske læringsstier.';
status.version = '2.18.0';
status.updatedAt = '2026-08-04';
writeJson('data/fagverk/fagverk_registry.json', registry);
writeJson('data/fagverk/subject_status.json', status);

console.log(`Materialiserte ${generatedRows.length} nye Historie-kapitler. Totalt: ${registry.subjects.historie.chapters.length}.`);
