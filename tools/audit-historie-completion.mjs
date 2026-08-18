#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { auditHistorySourceAuthority } from './audit-historie-source-authority.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const readJson = (relativePath) => JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), 'utf8'));
const list = (value) => Array.isArray(value) ? value : [];
const unique = (values) => [...new Set(values.filter(Boolean))];
const normalize = (value) => String(value || '').replace(/\s+/g, ' ').trim();

function isGeneratorOwnedChapter(chapter) {
  if (!chapter.productionBriefFile) return false;
  const brief = readJson(chapter.productionBriefFile);
  return brief.generatedFrom?.generator === 'tools/materialize-historie-editorial-chapters.mjs';
}

function auditFulltextChapter(chapterRow, canonicalEmneById, paragraphCorpus) {
  assert.ok(chapterRow.file && fs.existsSync(path.join(ROOT, chapterRow.file)), `${chapterRow.primary_domain_id}: registrert kapittelfil mangler`);
  const chapter = readJson(chapterRow.file);
  assert.equal(chapter.schema, 'history_go_fagverk_chapter_v1', `${chapterRow.file}: feil chapter schema`);
  assert.equal(chapter.subject, 'historie', `${chapterRow.file}: feil subject`);
  assert.ok(normalize(chapter.lead).length >= 180, `${chapterRow.file}: lead er for kort til substansiell fulltekst`);
  assert.ok(list(chapter.learningObjectives).length >= 5, `${chapterRow.file}: for få learning objectives`);
  assert.ok(list(chapter.moduleFiles).length >= 3, `${chapterRow.file}: færre enn tre fulltekstmoduler`);

  const chapterSectionIds = [];
  let paragraphCount = 0;
  let paragraphChars = 0;
  let generatedSectionCount = 0;
  let historiographyEvidenceModules = 0;
  const generated = isGeneratorOwnedChapter(chapter);

  for (const moduleFile of list(chapter.moduleFiles)) {
    assert.ok(fs.existsSync(path.join(ROOT, moduleFile)), `${chapterRow.file}: mangler modul ${moduleFile}`);
    const module = readJson(moduleFile);
    assert.ok(list(module.sections).length > 0, `${moduleFile}: ingen fulltekstseksjoner`);
    if (generated && module.historiographicalDebate) {
      const historiography = module.historiographyEvidence;
      assert.ok(historiography, `${moduleFile}: historiografisk debatt mangler akademisk evidenslag`);
      assert.ok(normalize(historiography.use).length >= 60, `${moduleFile}: historiografi-evidens mangler bruksvurdering`);
      assert.ok(list(historiography.sourceIds).length >= 2, `${moduleFile}: historiografi-evidens krever metodekilde + domenekilde`);
      assert.equal(list(historiography.sources).length, list(historiography.sourceIds).length, `${moduleFile}: historiografikilder er ikke materialisert`);
      assert.ok(list(historiography.sources).every((source) => normalize(source.sourceLocation).length >= 45), `${moduleFile}: historiografisk kilde mangler konkret sourceLocation`);
      historiographyEvidenceModules += 1;
    }

    for (const section of list(module.sections)) {
      assert.ok(section.id, `${moduleFile}: seksjon mangler id`);
      chapterSectionIds.push(section.id);
      const paragraphs = list(section.paragraphs).map(normalize);
      assert.ok(paragraphs.length >= 3, `${moduleFile}/${section.id}: færre enn tre faktiske prosaavsnitt`);
      assert.ok(paragraphs.every((paragraph) => paragraph.length >= 80), `${moduleFile}/${section.id}: inneholder metadata-/fragmenttekst i stedet for fulltekst`);
      assert.equal(unique(paragraphs).length, paragraphs.length, `${moduleFile}/${section.id}: duplisert avsnitt internt i seksjonen`);
      paragraphCount += paragraphs.length;
      paragraphChars += paragraphs.reduce((sum, paragraph) => sum + paragraph.length, 0);
      for (const paragraph of paragraphs) {
        const key = paragraph.toLocaleLowerCase('nb-NO');
        const previous = paragraphCorpus.get(key);
        assert.equal(previous, undefined, `${moduleFile}/${section.id}: identisk fulltekstparagraph er gjenbrukt fra ${previous}`);
        paragraphCorpus.set(key, `${moduleFile}/${section.id}`);
      }

      if (generated) {
        generatedSectionCount += 1;
        const emne = canonicalEmneById.get(section.emneId);
        assert.ok(emne, `${moduleFile}/${section.id}: generatorseksjonen viser til ukjent emne ${section.emneId}`);
        const semanticHookId = list(emne.primary_theory_hooks)[0];
        assert.ok(semanticHookId, `${section.emneId}: mangler canonical primary_theory_hook`);
        assert.equal(section.semanticHookId, semanticHookId, `${moduleFile}/${section.id}: materialisert hook avviker fra canonical semantisk primærhook`);
        assert.ok(normalize(section.theoryId).length > 0, `${moduleFile}/${section.id}: mangler eksplisitt theoryId`);
        assert.ok(paragraphs.length >= 5, `${moduleFile}/${section.id}: generator-eid seksjon må ha minst fem avsnitt etter prose-repair`);
        assert.ok(!paragraphs.some((paragraph) => paragraph.includes('Samlet brukes dette evidensgrunnlaget slik:')), `${moduleFile}/${section.id}: gammel generisk evidensformel er fortsatt materialisert`);
        assert.ok(!paragraphs.slice(1).some((paragraph) => paragraph.startsWith(`${paragraphs[0]} `)), `${moduleFile}/${section.id}: emnedefinisjonen er kopiert som innledning til et senere avsnitt`);
        const traceTypes = list(section.paragraphTraceTypes);
        const paragraphClaimIds = list(section.paragraphClaimIds);
        assert.equal(traceTypes.length, paragraphs.length, `${moduleFile}/${section.id}: trace types dekker ikke alle avsnitt`);
        assert.equal(paragraphClaimIds.length, paragraphs.length, `${moduleFile}/${section.id}: claim trace dekker ikke alle avsnitt`);
        const claimSupportedIndexes = traceTypes.map((type, index) => type === 'claim_supported' ? index : -1).filter((index) => index >= 0);
        assert.ok(claimSupportedIndexes.length >= 1, `${moduleFile}/${section.id}: mangler claim-supported prosa`);
        for (const index of claimSupportedIndexes) {
          const claimIds = unique(list(paragraphClaimIds[index]));
          assert.equal(claimIds.length, 1, `${moduleFile}/${section.id}: hvert evidensavsnitt skal bære nøyaktig ett claim etter prose-repair`);
          assert.ok(paragraphs[index].length <= 1200, `${moduleFile}/${section.id}: evidensavsnitt er for langt og ser ut som claim-sammenliming`);
        }
      }
    }
  }

  assert.equal(unique(chapterSectionIds).length, chapterSectionIds.length, `${chapterRow.file}: dupliserte section IDs`);
  assert.ok(paragraphCount >= 24, `${chapterRow.file}: for lite faktisk fulltekst (${paragraphCount} avsnitt)`);
  const minimumParagraphChars = generated ? 10000 : 8000;
  assert.ok(paragraphChars >= minimumParagraphChars, `${chapterRow.file}: for lite substansiell prosa (${paragraphChars} tegn; minimum ${minimumParagraphChars})`);
  if (generated) {
    assert.equal(generatedSectionCount, 10, `${chapterRow.file}: generator-eid kapittel skal eie 10 canonicale kompatibilitetsemner`);
    assert.equal(historiographyEvidenceModules, 1, `${chapterRow.file}: nøyaktig anvendelsesmodulen skal materialisere historiografi-evidens`);
  }

  for (const emneId of list(chapterRow.emne_ids)) {
    assert.ok(canonicalEmneById.has(emneId), `${chapterRow.file}: registry eier ukjent emne ${emneId}`);
  }

  return { generated, paragraphCount, paragraphChars, sectionCount: chapterSectionIds.length, generatedSectionCount };
}

export function auditHistoryCompletion() {
  const pensum = readJson('data/fag/historie/historiepensum_canonical_v4_5.json');
  const emner = readJson('data/fag/historie/emner_historie_canonical_v4_5.json');
  const registry = readJson('data/fagverk/fagverk_registry.json');
  const statusDocument = readJson('data/fagverk/subject_status.json');
  const architecture = readJson('data/fag/historie/curriculum_architecture_historie_v1.json');
  const identityAudit = readJson('reports/fagverk/historie-canonical-emne-identity-audit.json');
  const completionReport = readJson('reports/fagverk/historie-completion-gap-report.json');

  assert.equal(list(pensum.domains).length, 23, 'Historie skal ha 23 canonicale fagområder');
  const canonicalDomainIds = list(pensum.domains).map((domain) => domain.domain_id);
  assert.equal(unique(canonicalDomainIds).length, 23, 'Canonicale History domain IDs må være unike');
  const canonicalEmneIds = new Set(list(pensum.domains).flatMap((domain) => list(domain.emne_ids)));
  const canonicalEmneById = new Map(list(emner).map((emne) => [emne.emne_id, emne]));
  assert.equal(canonicalEmneIds.size, 230, 'Historie skal ha 230 stabile canonicale kompatibilitetsemner');
  assert.equal(canonicalEmneById.size, 230, 'Canonical emnefil skal ha 230 unike emner');

  const chapterRows = list(registry?.subjects?.historie?.chapters);
  assert.equal(chapterRows.length, 23, 'History registry skal ha 23 kapitler');
  assert.equal(unique(chapterRows.map((row) => row.id)).length, 23, 'Kapittel-ID-er må være unike');
  assert.equal(unique(chapterRows.map((row) => row.file)).length, 23, 'Kapittelfiler må være unike');
  assert.deepEqual(chapterRows.map((row) => row.primary_domain_id).sort(), [...canonicalDomainIds].sort(), 'Hvert canonicalt fagområde skal eies av nøyaktig ett kapittel');

  const ownership = new Map();
  for (const row of chapterRows) {
    for (const emneId of list(row.emne_ids)) {
      const owners = ownership.get(emneId) || [];
      owners.push(row.primary_domain_id);
      ownership.set(emneId, owners);
    }
  }
  const missingEmners = [...canonicalEmneIds].filter((emneId) => !ownership.has(emneId));
  const duplicateEmners = [...ownership.entries()].filter(([, owners]) => owners.length !== 1);
  const extraEmners = [...ownership.keys()].filter((emneId) => !canonicalEmneIds.has(emneId));
  assert.deepEqual(missingEmners, [], `Canonicale emner uten kapittel: ${missingEmners.join(', ')}`);
  assert.deepEqual(duplicateEmners, [], `Canonicale emner med parallelt eierskap: ${duplicateEmners.map(([id, owners]) => `${id}=>${owners.join('|')}`).join(', ')}`);
  assert.deepEqual(extraEmners, [], `Registry eier ikke-canonicale emner: ${extraEmners.join(', ')}`);
  assert.equal(ownership.size, 230, 'Alle 230 canonicale emner skal eies nøyaktig én gang');

  const periods = list(architecture.chronological_spine);
  assert.equal(periods.length, 9, 'Historie skal ha 9 hovedperioder');
  assert.equal(unique(periods.map((period) => period.id)).length, 9, 'Hovedperioder må være unike');
  assert.ok(periods.every((period) => period.coverage_status === 'covered'), `Alle 9 hovedperioder må være covered; avvik: ${periods.filter((period) => period.coverage_status !== 'covered').map((period) => period.id).join(', ')}`);

  assert.equal(identityAudit.summary?.emne_count, 230);
  assert.equal(identityAudit.summary?.unique_emne_ids, 230);
  assert.equal(identityAudit.summary?.unique_titles, 230);
  assert.equal(identityAudit.summary?.unique_semantic_keys, 230);
  assert.equal(identityAudit.summary?.unresolved_blockers, 0, 'Legacy/semantic identity blockers må være 0');
  assert.equal(identityAudit.policy?.semantic_key_is_primary_theory_hook, true, 'Identity-auditen må låse primærhook som semantisk identitet');
  assert.equal(identityAudit.policy?.renaming_stable_ids_without_reference_migration_forbidden, true);

  const paragraphCorpus = new Map();
  let generatedChapters = 0;
  let handBuiltChapters = 0;
  let fulltextParagraphs = 0;
  let fulltextCharacters = 0;
  let fulltextSections = 0;
  let semanticSectionsLocked = 0;
  for (const chapterRow of chapterRows) {
    const metrics = auditFulltextChapter(chapterRow, canonicalEmneById, paragraphCorpus);
    if (metrics.generated) {
      generatedChapters += 1;
      semanticSectionsLocked += metrics.generatedSectionCount;
    } else handBuiltChapters += 1;
    fulltextParagraphs += metrics.paragraphCount;
    fulltextCharacters += metrics.paragraphChars;
    fulltextSections += metrics.sectionCount;
  }
  assert.equal(generatedChapters, 18, 'Completion-kontrakten forventer 18 generator-eide kapitler');
  assert.equal(handBuiltChapters, 5, 'Completion-kontrakten forventer 5 håndbygde kapitler');
  assert.equal(semanticSectionsLocked, 180, 'Alle 180 generator-eide seksjoner skal være låst til canonical primærhook');

  const sourceAuthority = auditHistorySourceAuthority();
  assert.equal(sourceAuthority.status, 'PASS');

  assert.equal(completionReport.schema, 'history_go_history_completion_gap_report_v1');
  assert.equal(completionReport.status, 'resolved_completion_gaps');
  assert.equal(list(completionReport.prose_review?.period_samples).length, 9, 'Gaprapporten må dokumentere faktisk prose review gjennom alle 9 perioder');
  assert.ok(list(completionReport.prose_review?.period_samples).every((sample) => sample.review_status === 'reviewed'), 'Alle periodestikkprøver må være faktisk lest');
  assert.deepEqual(list(completionReport.open_blockers), [], 'Completion-gaprapporten har fortsatt åpne blokkere');
  assert.ok(list(completionReport.resolved_gaps).length >= 3, 'Gaprapporten må dokumentere de faktiske reparasjonene');

  const statusEntry = list(statusDocument.subjects).find((row) => row.id === 'historie');
  assert.ok(statusEntry, 'Historie mangler subject status');
  if (statusEntry.editorialStatus === 'complete') {
    assert.equal(statusEntry.nextGate, 'maintenance_source_refresh_and_place_case_expansion', 'Complete History skal gå til vedlikehold, ikke ny completion-produksjon');
  } else {
    assert.equal(statusEntry.editorialStatus, 'expanded_and_audited', 'Før terminal status er eneste tillatte History-status expanded_and_audited');
  }

  return {
    status: 'PASS',
    canonical_domains: 23,
    registered_chapters: 23,
    uniquely_owned_emner: ownership.size,
    covered_periods: 9,
    unresolved_identity_blockers: 0,
    generated_chapters: generatedChapters,
    hand_built_chapters: handBuiltChapters,
    semantic_sections_locked_to_primary_hook: semanticSectionsLocked,
    fulltext_sections: fulltextSections,
    fulltext_paragraphs: fulltextParagraphs,
    fulltext_characters: fulltextCharacters,
    source_authority: sourceAuthority
  };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  console.log(JSON.stringify(auditHistoryCompletion(), null, 2));
}
