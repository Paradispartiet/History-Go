#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CHECK = process.argv.includes('--check');
const GENERATOR_ID = 'tools/materialize-historie-editorial-chapters.mjs';
const mismatches = [];
const readJson = (relativePath) => JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), 'utf8'));
const writeJson = (relativePath, value) => {
  const absolutePath = path.join(ROOT, relativePath);
  const serialized = `${JSON.stringify(value, null, 2)}\n`;
  if (CHECK) {
    if (!fs.existsSync(absolutePath) || fs.readFileSync(absolutePath, 'utf8') !== serialized) mismatches.push(relativePath);
    return;
  }
  fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
  fs.writeFileSync(absolutePath, serialized);
};
const list = (value) => Array.isArray(value) ? value : [];
const unique = (values) => [...new Set(values.filter(Boolean))];
const normalize = (value) => String(value || '').replace(/\s+/g, ' ').trim();
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
const editorialProfilesDocument = readJson('data/fag/historie/editorial_profiles_historie_v1.json');
const historiographyDocument = readJson('data/fag/historie/historiography_evidence_historie_v1.json');
const registry = readJson('data/fagverk/fagverk_registry.json');
const status = readJson('data/fagverk/subject_status.json');
const editorialTheoryDocument = readJson('data/fag/historie/editorial_theory_overrides_historie_v1.json');

const emneById = new Map(emner.map((item) => [item.emne_id, item]));
const theoryByHookId = new Map(theories.map((item) => [item.source_hook_id, item]));
const evidenceByTheoryId = new Map(evidence.entries.map((item) => [item.theory_id, item]));
const claimById = new Map(claimRegistry.claims.map((item) => [item.claim_id, item]));
const sourceById = new Map(sourceRegistry.sources.map((item) => [item.source_id, item]));
const editorialProfileByDomainId = new Map(editorialProfilesDocument.profiles.map((item) => [item.domain_id, item]));
const historiographyCoverageByDomainId = new Map(historiographyDocument.coverage.map((item) => [item.domain_id, item]));
const historiographySourceById = new Map(historiographyDocument.sources.map((item) => [item.source_id, item]));
const hookById = new Map();
for (const category of list(fagkart.categories)) {
  for (const hook of list(category.topic_hooks)) {
    if (hookById.has(hook.id)) throw new Error(`Duplisert History hook-id ${hook.id}`);
    hookById.set(hook.id, hook);
  }
}
const editorialOverrideByEmneId = new Map(list(editorialTheoryDocument.overrides).map((row) => [row.emne_id, row]));
const resolvedLegacyEditorialIds = new Set(list(editorialTheoryDocument.resolved_legacy_question_surface_ids).map((row) => row.legacy_emne_id));
const editorialBlueprintByEmneId = new Map();
for (const blueprintFile of list(editorialTheoryDocument.source_blueprint_files)) {
  for (const row of list(readJson(blueprintFile))) {
    if (!emneById.has(row.emne_id)) {
      if (!resolvedLegacyEditorialIds.has(row.emne_id)) throw new Error(`${blueprintFile}: uavklart legacy editorial emne ${row.emne_id}`);
      continue;
    }
    if (editorialBlueprintByEmneId.has(row.emne_id)) throw new Error(`${row.emne_id}: duplisert aktiv editorial blueprint`);
    editorialBlueprintByEmneId.set(row.emne_id, row);
  }
}
for (const emneId of editorialOverrideByEmneId.keys()) {
  if (!emneById.has(emneId)) throw new Error(`Editorial override peker på ukjent emne ${emneId}`);
  if (editorialBlueprintByEmneId.has(emneId)) throw new Error(`${emneId}: både blueprint og override skaper uklar editorial precedence`);
}
const conceptsByEmneId = new Map();
for (const concept of concepts) {
  for (const emneId of list(concept.source_emne_ids)) {
    const rows = conceptsByEmneId.get(emneId) || [];
    rows.push(concept);
    conceptsByEmneId.set(emneId, rows);
  }
}

const chapterRows = registry.subjects.historie.chapters;
const chapterRowByDomainId = new Map(chapterRows.map((item) => [item.primary_domain_id, item]));
const generatedRows = [];

function isGeneratorOwnedChapter(chapterRow) {
  if (!chapterRow?.file || !fs.existsSync(path.join(ROOT, chapterRow.file))) return false;
  const chapter = readJson(chapterRow.file);
  if (!chapter.productionBriefFile || !fs.existsSync(path.join(ROOT, chapter.productionBriefFile))) return false;
  const brief = readJson(chapter.productionBriefFile);
  return brief.generatedFrom?.generator === GENERATOR_ID
    || brief.generatedFrom?.pensum === 'data/fag/historie/historiepensum_canonical_v4_5.json';
}

function theoryPackage(category, emne) {
  const semanticHookId = list(emne.primary_theory_hooks)[0];
  if (!semanticHookId) throw new Error(`${category.id}/${emne.emne_id}: mangler primary_theory_hooks`);
  if (!list(category.topic_hooks).some((item) => item.id === semanticHookId)) throw new Error(`${category.id}/${emne.emne_id}: semantisk hook ${semanticHookId} finnes ikke i fagkartkategorien`);
  const semanticHook = hookById.get(semanticHookId);
  if (!semanticHook) throw new Error(`${semanticHookId}: mangler canonical hook`);
  if (!list(semanticHook.emne_ids).includes(emne.emne_id)) throw new Error(`${semanticHookId}: mangler canonical primary association for ${emne.emne_id}`);

  const override = editorialOverrideByEmneId.get(emne.emne_id);
  const blueprint = editorialBlueprintByEmneId.get(emne.emne_id);
  if (override && blueprint) throw new Error(`${emne.emne_id}: både override og blueprint er aktive`);
  const editorialHookId = override?.editorial_primary_hook_id || blueprint?.primary_hook_id || semanticHookId;
  const editorialSecondaryHookId = override?.editorial_secondary_hook_id || blueprint?.secondary_hook_id || null;
  const hook = hookById.get(editorialHookId);
  if (!hook) throw new Error(`${category.id}/${emne.emne_id}: editorial hook ${editorialHookId} finnes ikke`);
  const theory = theoryByHookId.get(editorialHookId);
  if (!theory) throw new Error(`${editorialHookId}: mangler teoriobjekt`);
  if (editorialSecondaryHookId) {
    if (!hookById.has(editorialSecondaryHookId)) throw new Error(`${editorialSecondaryHookId}: editorial secondary hook finnes ikke`);
    if (!theoryByHookId.has(editorialSecondaryHookId)) throw new Error(`${editorialSecondaryHookId}: editorial secondary hook mangler teoriobjekt`);
  }
  const theoryEvidence = evidenceByTheoryId.get(theory.theory_id);
  if (!theoryEvidence || theoryEvidence.status !== 'evidence_ready') throw new Error(`${theory.theory_id}: mangler ferdig evidens`);
  const claims = list(theoryEvidence.claim_ids).map((id) => claimById.get(id)).filter(Boolean);
  if (!claims.length) throw new Error(`${theory.theory_id}: mangler claims`);
  return { emneId: emne.emne_id, semanticHookId, editorialHookId, editorialSecondaryHookId, semanticHook, hook, theory, theoryEvidence, claims };
}

function claimParagraph(claim, emne) {
  const sourceLabels = unique(list(claim.source_ids)
    .map((sourceId) => sourceById.get(sourceId)?.title)
    .filter(Boolean))
    .slice(0, 2);
  const sourceSentence = sourceLabels.length
    ? `Kildesporet går via ${sourceLabels.join(' og ')}; påstanden brukes her som et avgrenset evidenspunkt for ${emne.title.toLocaleLowerCase('nb-NO')}, ikke som en full årsaksforklaring alene.`
    : `Påstanden brukes her som et avgrenset evidenspunkt for ${emne.title.toLocaleLowerCase('nb-NO')}, ikke som en full årsaksforklaring alene.`;
  return `${normalize(claim.statement)} ${sourceSentence}`;
}

function sectionFor(category, emne, index, editorialProfile) {
  const pack = theoryPackage(category, emne);
  const limitation = list(pack.theory.limitations)[0] || list(pack.theoryEvidence.limitations)[0] || '';
  const alternative = list(pack.theoryEvidence.alternative_interpretations)[0] || '';
  const disconfirmation = list(pack.theoryEvidence.disconfirmation_conditions)[0] || '';
  const conceptsForEmne = list(conceptsByEmneId.get(emne.emne_id)).slice(0, 6);
  const distinctions = unique([
    ...list(emne.conflicts),
    ...list(emne.analysis_axes),
    ...conceptsForEmne.flatMap((concept) => list(concept.distinguish_from).map((id) => concepts.find((item) => item.concept_id === id)?.label))
  ]).slice(0, 4);
  const editorialLens = editorialProfile.section_lenses[emne.emne_id];
  if (!editorialLens) throw new Error(`${category.id}/${emne.emne_id}: mangler redaksjonell emnelinse`);

  const definition = normalize(emne.definition);
  const theoryDefinition = normalize(pack.theory.definition);
  const distinctTheoryDefinition = theoryDefinition && theoryDefinition !== definition ? theoryDefinition : '';
  const interpretiveParts = [
    distinctTheoryDefinition,
    list(emne.key_questions)[0] ? `Analysen testes mot spørsmålet: ${normalize(list(emne.key_questions)[0])}` : '',
    distinctions.length ? `Det krever et eksplisitt skille mellom ${distinctions.join('; ')}.` : '',
    limitation ? `Rekkeviddegrensen er at ${limitation.charAt(0).toLocaleLowerCase('nb-NO')}${limitation.slice(1)}` : ''
  ].filter(Boolean);
  const evidenceParagraphs = pack.claims.map((claim) => claimParagraph(claim, emne));
  const synthesisParts = [
    normalize(pack.theoryEvidence.rationale),
    alternative ? `En alternativ tolkning som må prøves er: ${normalize(alternative)}` : '',
    disconfirmation ? `Forklaringen må svekkes eller revideres dersom: ${normalize(disconfirmation)}` : ''
  ].filter(Boolean);
  const paragraphs = [
    definition,
    `${normalize(emne.why_it_matters)} ${normalize(editorialLens)}`.trim(),
    interpretiveParts.join(' '),
    ...evidenceParagraphs,
    synthesisParts.join(' ')
  ];
  const paragraphTraceTypes = [
    'analytical',
    'analytical',
    'analytical',
    ...pack.claims.map(() => 'claim_supported'),
    'analytical'
  ];
  const paragraphClaimIds = [
    [],
    [],
    [],
    ...pack.claims.map((claim) => [claim.claim_id]),
    []
  ];

  return {
    id: slug(emne.emne_id.replace(/^em_his_/, '')),
    emneId: emne.emne_id,
    semanticHookId: pack.semanticHookId,
    editorialHookId: pack.editorialHookId,
    editorialSecondaryHookId: pack.editorialSecondaryHookId,
    theoryId: pack.theory.theory_id,
    title: `${index + 1}. ${emne.title}`,
    paragraphs,
    paragraphTraceTypes,
    paragraphClaimIds,
    editorialLens,
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

function historiographySourceItem(source) {
  return {
    id: source.source_id,
    authors: list(source.authors),
    title: source.title,
    publisher: source.publisher,
    year: source.year,
    type: source.source_type,
    identifier: source.identifier || null,
    sourceLocation: source.source_location,
    authority: source.authority,
    limitations: source.limitations
  };
}

function buildChapter(domain) {
  const category = fagkart.categories.find((item) => item.id === domain.domain_id);
  if (!category) throw new Error(`${domain.domain_id}: mangler fagkartkategori`);
  const editorialProfile = editorialProfileByDomainId.get(domain.domain_id);
  if (!editorialProfile) throw new Error(`${domain.domain_id}: mangler redaksjonell fagprofil`);
  const historiographyCoverage = historiographyCoverageByDomainId.get(domain.domain_id);
  if (!historiographyCoverage) throw new Error(`${domain.domain_id}: mangler akademisk historiografi-evidens`);
  const domainEmner = domain.emne_ids.map((id) => emneById.get(id));
  if (domainEmner.some((item) => !item)) throw new Error(`${domain.domain_id}: mangler emne`);
  const sections = domainEmner.map((emne, index) => sectionFor(category, emne, index, editorialProfile));
  const packages = sections.map((section) => section._pack);
  const theoryIds = unique(packages.map((pack) => pack.theory.theory_id));
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
      editorialIntroduction: editorialProfile.module_introductions[moduleIndex],
      sections: outputSections,
      concepts: unique(definition.rows.flatMap((section) => list(conceptsByEmneId.get(section._pack.emneId)).map((item) => item.concept_id)))
        .map((id) => concepts.find((item) => item.concept_id === id)).filter(Boolean)
        .map((concept) => ({ id: concept.concept_id, term: concept.label, definition: concept.definition })),
      claimIds: moduleClaimIds,
      theoryEvidenceIds: modulePackages.map((pack) => pack.theory.theory_id),
      sources: moduleSourceIds.map((id) => sourceById.get(id)).filter(Boolean).map(sourceItem),
      sourceLimitations: unique(moduleSourceIds.flatMap((id) => list(sourceById.get(id)?.limitations))).slice(0, 5)
    };
    if (moduleIndex === 2) {
      module.causalFramework = editorialProfile.causal_chain;
      module.historiographicalDebate = editorialProfile.debate;
      module.historiographyEvidence = {
        use: historiographyCoverage.use,
        sourceIds: historiographyCoverage.source_ids,
        sources: historiographyCoverage.source_ids
          .map((id) => historiographySourceById.get(id))
          .filter(Boolean)
          .map(historiographySourceItem)
      };
      module.caseAnchors = editorialProfile.case_anchors;
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

  const lead = editorialProfile.thesis;
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
    editorialProfileId: editorialProfile.domain_id,
    narrativeArchitecture: {
      causalFramework: editorialProfile.causal_chain,
      historiographicalQuestion: editorialProfile.debate.question,
      historiographyEvidenceSourceIds: historiographyCoverage.source_ids,
      caseAnchorIds: editorialProfile.case_anchors.map((item) => item.place_id)
    },
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
    requiredHistoriographySourceIds: historiographyCoverage.source_ids,
    editorialRequirements: {
      minimumSectionCount: 10,
      minimumWorkedExamples: 2,
      minimumApplicationTasks: 4,
      minimumSelfChecks: 7,
      paragraphClaimTraceRequired: true,
      canonicalConceptDefinitionsRequired: true,
      sourceLimitationsRequired: true,
      editorialProfileRequired: true,
      historiographicalDebateRequired: true,
      academicHistoriographyEvidenceRequired: true,
      semanticPrimaryHookRequired: true,
      separateEditorialTheoryHookRequired: true,
      causalFrameworkRequired: true,
      minimumCaseAnchors: 3
    },
    evidenceBoundary: [
      'Kapittelet bruker bare claims og kilder som allerede er registrert i Historie-fagets canonicale evidenslag.',
      'Akademisk sekundærlitteratur underbygger historiografisk og kausal orientering, men erstatter ikke claim-spesifikke primær-, arkiv- eller casekilder.',
      'Stedscasene dokumenterer anvendelse og variasjon, men gjør ikke lokale funn universelle.',
      'Hver forklaring skal skille dokumentert påstand, analytisk tolkning, alternativ forklaring og kildebegrensning.'
    ],
    generatedFrom: {
      generator: GENERATOR_ID,
      pensum: 'data/fag/historie/historiepensum_canonical_v4_5.json',
      emner: 'data/fag/historie/emner_historie_canonical_v4_5.json',
      concepts: 'data/fag/historie/concepts_historie_canonical_v5_5.json',
      theories: 'data/fag/historie/theory_objects_historie_canonical_v5_5.json',
      evidence: 'data/fag/historie/theory_evidence_historie_canonical_v1.json',
      claims: 'data/fag/historie/claims_historie_canonical_v1.json',
      sources: 'data/fag/historie/sources_historie_canonical_v1.json',
      editorialProfiles: 'data/fag/historie/editorial_profiles_historie_v1.json',
      editorialTheoryOverrides: 'data/fag/historie/editorial_theory_overrides_historie_v1.json',
      historiographyEvidence: 'data/fag/historie/historiography_evidence_historie_v1.json'
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
  const existingRow = chapterRowByDomainId.get(domain.domain_id);
  if (!existingRow || isGeneratorOwnedChapter(existingRow)) generatedRows.push(buildChapter(domain));
}

const generatedRowByDomainId = new Map(generatedRows.map((item) => [item.primary_domain_id, item]));
registry.subjects.historie.chapters = pensum.domains.map((domain) => (
  generatedRowByDomainId.get(domain.domain_id) || chapterRowByDomainId.get(domain.domain_id)
));
registry.subjects.historie.description = 'Et sammenhengende, kildekritisk læreverk om historisk tid, perioder, samfunn, aktører, institusjoner, steder, begreper og fortolkninger fra forhistorie til samtid.';
registry.subjects.historie.canonicalModel.note = 'Fagområder, emner, begreper, metoder, claims og teori-evidens leses fra canonical Historie-data. Registryet eier fem håndbygde kapitler og atten generator-eide kapitler med semantisk låste primærhooks, separat kuraterte editorial theory hooks, håndredigerte fagprofiler, emnelinser, årsakskjeder, tolkningsuenighet, akademisk historiografi-evidens og stedscaser.';
const statusEntry = status.subjects.find((item) => item.id === 'historie');
statusEntry.editorialStatus = 'expanded_and_audited';
statusEntry.nextGate = 'source_refresh_and_case_expansion';
statusEntry.note = 'Historie har 23 av 23 canonicale fagområder, 23 fullverdige kapitler og 9 av 9 dekkede hovedperioder. De tre tidligere kronologiske gapene har egne evidensklare moduler med 21 læringsenheter, 18 kilder og 9 stedscaser. De 230 stabile kompatibilitetsemnene har unike titler, definisjoner og semantiske nøkler; 26 legacy-id-er er eksplisitt låst til riktig primærhook uten uløste identitetsblokkere. Completion-sporet kvalitetssikrer nå generatorprosa, akademisk historiografi-evidens og kildeautoritet før terminal status.';
status.version ||= '2.19.0';
status.updatedAt ||= '2026-08-04';
writeJson('data/fagverk/fagverk_registry.json', registry);
writeJson('data/fagverk/subject_status.json', status);

if (CHECK && mismatches.length) {
  throw new Error(`Historie-kapitlene avviker fra deterministisk materialisering:\n- ${mismatches.join('\n- ')}`);
}
console.log(`${CHECK ? 'Kontrollerte' : 'Materialiserte'} ${generatedRows.length} generator-eide Historie-kapitler. Totalt: ${registry.subjects.historie.chapters.length}.`);
