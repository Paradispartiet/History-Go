#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const readJson = (relativePath) => JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), 'utf8'));
const list = (value) => Array.isArray(value) ? value : [];
const unique = (values) => [...new Set(values.filter(Boolean))];

function walkJsonFiles(directory) {
  if (!fs.existsSync(directory)) return [];
  const output = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) output.push(...walkJsonFiles(absolute));
    else if (entry.isFile() && entry.name.endsWith('.json')) output.push(absolute);
  }
  return output;
}

function visit(value, callback) {
  if (Array.isArray(value)) {
    for (const item of value) visit(item, callback);
    return;
  }
  if (!value || typeof value !== 'object') return;
  callback(value);
  for (const child of Object.values(value)) visit(child, callback);
}

function collectSourceLocations() {
  const index = new Map();
  const add = (sourceId, location) => {
    if (!sourceId || typeof location !== 'string' || location.trim().length < 20) return;
    const rows = index.get(sourceId) || [];
    rows.push(location.trim());
    index.set(sourceId, rows);
  };

  for (const absolute of walkJsonFiles(path.join(ROOT, 'data/fag/historie'))) {
    let document;
    try {
      document = JSON.parse(fs.readFileSync(absolute, 'utf8'));
    } catch {
      continue;
    }
    visit(document, (row) => {
      if (!row.source_id) return;
      if (typeof row.source_location === 'string') add(row.source_id, row.source_location);
      for (const location of list(row.source_locations)) add(row.source_id, location);
    });
  }
  return index;
}

function isLowAuthority(source) {
  const haystack = `${source?.source_type || ''} ${source?.publisher || ''} ${source?.title || ''}`.toLocaleLowerCase('en');
  return haystack.includes('wikipedia')
    || haystack.includes('wikimedia')
    || haystack.includes('generic_web')
    || haystack.includes('user_generated');
}

function isAcademicSecondary(source) {
  return ['academic_monograph', 'academic_secondary_monograph', 'peer_reviewed_journal_article'].includes(source?.source_type);
}

function collectMaterializedClaimIds(registry) {
  const ids = [];
  for (const chapterRow of list(registry?.subjects?.historie?.chapters)) {
    assert.ok(chapterRow.file, `Historie registry chapter ${chapterRow.id || chapterRow.primary_domain_id} mangler file`);
    const chapter = readJson(chapterRow.file);
    for (const moduleFile of list(chapter.moduleFiles)) {
      const module = readJson(moduleFile);
      ids.push(...list(module.claimIds));
      for (const section of list(module.sections)) {
        const traceTypes = list(section.paragraphTraceTypes);
        const paragraphClaimIds = list(section.paragraphClaimIds);
        if (!traceTypes.length && !paragraphClaimIds.length) continue;
        assert.equal(traceTypes.length, list(section.paragraphs).length, `${moduleFile}/${section.id}: paragraphTraceTypes må dekke alle avsnitt`);
        assert.equal(paragraphClaimIds.length, list(section.paragraphs).length, `${moduleFile}/${section.id}: paragraphClaimIds må dekke alle avsnitt`);
        for (let index = 0; index < traceTypes.length; index += 1) {
          const claimIds = list(paragraphClaimIds[index]);
          if (traceTypes[index] === 'claim_supported') {
            assert.ok(claimIds.length > 0, `${moduleFile}/${section.id}: claim_supported avsnitt mangler claim IDs`);
            ids.push(...claimIds);
          } else {
            assert.equal(claimIds.length, 0, `${moduleFile}/${section.id}: analytisk avsnitt skal ikke late som det er claim-sporet`);
          }
        }
      }
    }
  }
  return unique(ids);
}

export function auditHistorySourceAuthority() {
  const registry = readJson('data/fagverk/fagverk_registry.json');
  const claimsDocument = readJson('data/fag/historie/claims_historie_canonical_v1.json');
  const sourcesDocument = readJson('data/fag/historie/sources_historie_canonical_v1.json');
  const theoryEvidence = readJson('data/fag/historie/theory_evidence_historie_canonical_v1.json');
  const profilesDocument = readJson('data/fag/historie/editorial_profiles_historie_v1.json');
  const historiography = readJson('data/fag/historie/historiography_evidence_historie_v1.json');
  const sourceLocations = collectSourceLocations();

  const claimById = new Map(list(claimsDocument.claims).map((row) => [row.claim_id, row]));
  const sourceById = new Map(list(sourcesDocument.sources).map((row) => [row.source_id, row]));
  const scholarlyById = new Map(list(historiography.sources).map((row) => [row.source_id, row]));

  assert.equal(historiography.subject_id, 'historie');
  assert.equal(historiography.status, 'completion_evidence_ready');
  assert.equal(historiography.authority_policy?.shared_historical_method_source_required, true);
  assert.equal(historiography.authority_policy?.domain_specific_academic_secondary_required, true);
  assert.equal(historiography.authority_policy?.museum_or_general_web_cannot_stand_alone_for_historiographical_claims, true);
  assert.equal(historiography.authority_policy?.source_location_required, true);

  const profileDomainIds = list(profilesDocument.profiles).map((row) => row.domain_id).sort();
  const coverageDomainIds = list(historiography.coverage).map((row) => row.domain_id).sort();
  assert.equal(profileDomainIds.length, 18, 'Historie skal ha 18 generator-eide redaksjonelle fagprofiler');
  assert.deepEqual(coverageDomainIds, profileDomainIds, 'Historiografisk evidens må dekke nøyaktig de 18 redaksjonelle fagprofilene');

  for (const source of list(historiography.sources)) {
    assert.ok(source.source_id, 'Historiografisk kilde mangler source_id');
    assert.ok(isAcademicSecondary(source), `${source.source_id}: må være akademisk monografi eller fagfellevurdert artikkel`);
    assert.ok(String(source.publisher || '').length >= 4, `${source.source_id}: mangler utgiver/tidsskrift`);
    assert.ok(Number.isInteger(source.year) && source.year >= 1800, `${source.source_id}: ugyldig år`);
    assert.ok(String(source.source_location || '').length >= 45, `${source.source_id}: source_location er for vag`);
    assert.ok(String(source.authority || '').length >= 35, `${source.source_id}: mangler autoritetsbegrunnelse`);
    assert.ok(String(source.limitations || '').length >= 55, `${source.source_id}: mangler eksplisitt begrensning`);
  }

  for (const coverage of list(historiography.coverage)) {
    assert.ok(String(coverage.use || '').length >= 60, `${coverage.domain_id}: mangler forklaring på forskningskildenes bruk`);
    const sourceIds = unique(list(coverage.source_ids));
    assert.ok(sourceIds.length >= 2, `${coverage.domain_id}: krever minst metodekilde + domenespesifikk akademisk sekundærkilde`);
    assert.ok(sourceIds.includes('hist_method_gaddis_2002'), `${coverage.domain_id}: mangler delt historiefaglig metodekilde`);
    const domainSpecific = sourceIds.filter((id) => id !== 'hist_method_gaddis_2002');
    assert.ok(domainSpecific.length >= 1, `${coverage.domain_id}: mangler domenespesifikk forskning`);
    for (const sourceId of sourceIds) assert.ok(scholarlyById.has(sourceId), `${coverage.domain_id}: ukjent historiografisk source_id ${sourceId}`);
    assert.ok(domainSpecific.some((id) => isAcademicSecondary(scholarlyById.get(id))), `${coverage.domain_id}: domenekilden er ikke akademisk sekundærlitteratur`);
  }

  assert.equal(theoryEvidence.completion?.total_theories, 230, 'History theory evidence total må være 230');
  assert.equal(theoryEvidence.completion?.qualifying_entries, 230, 'Alle 230 teorier må ha kvalifiserende evidens');
  assert.equal(theoryEvidence.completion?.universal_status, 'COMPLETE', 'Theory evidence universal_status må være COMPLETE');
  for (const entry of list(theoryEvidence.entries)) {
    assert.equal(entry.status, 'evidence_ready', `${entry.theory_id}: teori-evidens er ikke ferdig`);
    assert.ok(list(entry.claim_ids).length > 0, `${entry.theory_id}: mangler claims`);
    assert.ok(list(entry.source_ids).length > 0, `${entry.theory_id}: mangler kilder`);
    assert.ok(String(entry.rationale || '').length >= 80, `${entry.theory_id}: mangler faglig evidensrationale`);
    assert.ok(list(entry.limitations).length > 0, `${entry.theory_id}: mangler begrensninger`);
    assert.ok(list(entry.alternative_interpretations).length > 0, `${entry.theory_id}: mangler alternativ tolkning`);
    assert.ok(list(entry.disconfirmation_conditions).length > 0, `${entry.theory_id}: mangler diskonfirmeringsvilkår`);
  }

  const fulltextClaimIds = collectMaterializedClaimIds(registry);
  assert.ok(fulltextClaimIds.length >= 150, `For få claim-sporede fulltekstclaims: ${fulltextClaimIds.length}`);
  const usedSourceIds = new Set();
  for (const claimId of fulltextClaimIds) {
    const claim = claimById.get(claimId);
    assert.ok(claim, `Fulltekst viser til ukjent claim ${claimId}`);
    const sourceIds = unique(list(claim.source_ids));
    assert.ok(sourceIds.length > 0, `${claimId}: mangler source_ids`);
    const claimSources = sourceIds.map((id) => {
      const source = sourceById.get(id);
      assert.ok(source, `${claimId}: ukjent canonical source ${id}`);
      usedSourceIds.add(id);
      return source;
    });
    assert.ok(claimSources.some((source) => !isLowAuthority(source)), `${claimId}: kan ikke støttes bare av Wikipedia/Wikimedia/generisk brukerkilde`);
  }

  const missingLocations = [];
  for (const sourceId of [...usedSourceIds].sort()) {
    const source = sourceById.get(sourceId);
    assert.ok(source?.provenance && typeof source.provenance === 'object', `${sourceId}: mangler provenance`);
    assert.ok(String(source.provenance.repository_source || source.provenance.extracted_from || '').length > 0, `${sourceId}: provenance mangler repository_source/extracted_from`);
    assert.ok(list(source.limitations).length > 0, `${sourceId}: mangler kildebegrensning`);
    assert.ok(source.quality && typeof source.quality === 'object', `${sourceId}: mangler quality-vurdering`);
    if (!list(sourceLocations.get(sourceId)).length) missingLocations.push(sourceId);
  }
  assert.deepEqual(missingLocations, [], `Fulltekstkilder uten konkret source_location: ${missingLocations.join(', ')}`);

  const result = {
    status: 'PASS',
    editorial_profiles_with_academic_secondary: coverageDomainIds.length,
    historiography_sources: scholarlyById.size,
    theory_evidence_ready: list(theoryEvidence.entries).length,
    fulltext_claims_traced: fulltextClaimIds.length,
    canonical_sources_used_in_fulltext: usedSourceIds.size,
    sources_with_concrete_location: usedSourceIds.size
  };
  return result;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const result = auditHistorySourceAuthority();
  console.log(JSON.stringify(result, null, 2));
}
