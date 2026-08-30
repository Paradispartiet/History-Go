#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';

const P = Object.freeze({
  archive: 'data/fag/politikk/archive/merke_politikk_rich_runtime_legacy_20260830.html',
  compatibility: 'data/fag/politikk/merke_politikk.html',
  portal: 'data/fagverk/fagverk_portal.json',
  manifest: 'data/fag/fag_manifest.json',
  runtimeManifest: 'data/fag/politikk/politikk_runtime_manifest.json',
  badge: 'data/badges/politikk.json',
  concepts: 'data/fag/politikk/concepts_politikk_canonical_v1.json',
  subjectModel: 'js/fagverk-subject-model.js',
  subjectCore: 'js/fagverk-subject-core.js',
  subjectPage: 'js/fagverk.js',
  ia: 'js/fagverk-ia-v3.js',
  badgeUi: 'js/fagverk-ia-v3-badge-progress.js',
  badgeIndex: 'merker/merker.html'
});

const EXPECTED_ARCHIVE_BLOB = '9529684894ff913bc350f64b2a553b0288c7abff';
const TARGET = 'fagverk.html?subject=politikk#fagverkIaProgresjon';
const read = (file) => fs.readFileSync(file, 'utf8');
const json = (file) => JSON.parse(read(file));
const list = (value) => Array.isArray(value) ? value : [];
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const gitBlob = (file) => {
  const body = fs.readFileSync(file);
  return crypto.createHash('sha1').update(`blob ${body.length}\0`).update(body).digest('hex');
};

export function auditPolitikkRuntimeEquivalence() {
  const archive = read(P.archive);
  const compatibility = read(P.compatibility);
  const portal = json(P.portal);
  const fagManifest = json(P.manifest);
  const runtimeManifest = json(P.runtimeManifest);
  const badge = json(P.badge);
  const concepts = json(P.concepts);
  const subjectModel = read(P.subjectModel);
  const subjectCore = read(P.subjectCore);
  const subjectPage = read(P.subjectPage);
  const ia = read(P.ia);
  const badgeUi = read(P.badgeUi);
  const badgeIndex = read(P.badgeIndex);
  const portalEntry = portal.categories.find((entry) => entry.id === 'politikk');
  const underbadgeIds = list(badge.sub);

  assert(gitBlob(P.archive) === EXPECTED_ARCHIVE_BLOB, 'Politikk-arkivet er ikke byteidentisk med den pensjonerte rich-runtime-siden');
  for (const id of ['politikkBadgeProgress', 'politikkUnderbadges', 'politikkDomains', 'politikkFagverkChapters', 'politikkEmneProgress', 'politikkQuizHistory', 'politikkPlaces', 'politikkConcepts']) {
    assert(archive.includes(`id="${id}"`), `Legacy-arkivet mangler funksjonsbeviset ${id}`);
  }
  assert(compatibility.includes(`location.replace('../../../${TARGET}')`), 'Politikk-wrapperen redirecter ikke til integrert Progresjon');
  assert(!/politikk-fagportal\.js|politikkEmneProgress|politikkQuizHistory|politikkConcepts/.test(compatibility), 'Politikk-wrapperen inneholder fortsatt aktiv legacy-runtime');
  assert(portalEntry?.badgePage === TARGET, 'Portalregisteret peker ikke Politikk-merket direkte til Progresjon');
  assert(badgeIndex.includes(`../${TARGET}`), 'Alle merker peker ikke Politikk direkte til Progresjon');

  assert(fagManifest.politikk?.runtimeManifest === 'politikk/politikk_runtime_manifest.json', 'Fagmanifestet eier ikke Politikk runtime-manifestet');
  assert(subjectModel.includes('manifestEntry.runtimeManifest'), 'Den generelle subject-modellen laster ikke valgfritt runtime-manifest');
  assert(subjectCore.includes('runtimeManifest: source.runtimeManifest || null'), 'Den generelle subject-modellen eksponerer ikke runtime-manifestet');
  assert(underbadgeIds.length === 11, 'Politikk-badget har ikke de elleve canonicale undermerkene');
  assert(new Set(Object.keys(runtimeManifest.underbadgeLabels || {})).size === underbadgeIds.length, 'Runtime-manifestet mangler canonicale undermerkenavn');
  assert(new Set(Object.keys(runtimeManifest.underbadgeDomains || {})).size === underbadgeIds.length, 'Runtime-manifestet mangler undermerke-til-fagområde-koblinger');
  assert(badgeUi.includes('runtimeManifest.underbadgeLabels'), 'Progresjon bruker ikke canonicale undermerkenavn');
  assert(badgeUi.includes('runtimeManifest.underbadgeDomains'), 'Progresjon bruker ikke canonicale undermerke-til-fagområde-koblinger');
  assert(badgeUi.includes('MODEL.domainUrl(model.subject.id, domainId)'), 'Undermerkene lenker ikke til canonicale fagområder');

  assert(subjectPage.includes('renderPolitikkCurriculumOverview'), 'Fagverket mangler Politikk-studieløpet');
  assert(subjectPage.includes('politikkConceptSearch'), 'Fagverket mangler søkbart Politikk-begrepsverk');
  assert(concepts.summary?.concept_count === 962, 'Politikk-begrepsregisteret har uventet omfang');
  assert(ia.includes('fagverkIaEmneSearch'), 'Fagverket mangler søkbar canonical emneoversikt');
  assert(ia.includes('fagverk-ia-quiz-history'), 'Fagverket mangler detaljert quizhistorikk');
  assert(ia.includes("progress.visited?.has?.(place.id)"), 'Utforsk mangler besøksstatus per sted');
  assert(ia.includes('profile.html#merker'), 'Progresjon mangler inngang til merkeprofilen');
  assert(!fs.existsSync('js/politikk-fagportal.js'), 'Det pensjonerte Politikk-portalruntime-laget finnes fortsatt');
  assert(!fs.existsSync('css/politikk-fagportal.css'), 'Det pensjonerte Politikk-portalstylesheetet finnes fortsatt');
  assert(!fs.existsSync('css/politikk-merke-role.css'), 'Det pensjonerte Politikk-rolle-stylesheetet finnes fortsatt');

  return {
    schema: 'history_go_fagverk_politikk_runtime_equivalence_v1',
    status: 'passed',
    archive: { file: P.archive, gitBlob: EXPECTED_ARCHIVE_BLOB },
    target: TARGET,
    canonicalCounts: {
      underbadges: underbadgeIds.length,
      domains: Object.keys(runtimeManifest.chapterByDomain || {}).length,
      concepts: concepts.summary.concept_count
    },
    owners: {
      badgeProgress: 'fagverk-ia-v3-badge-progress',
      underbadges: 'runtime-manifest + fagverk-ia-v3-badge-progress',
      domainsAndChapters: 'fagverk subject model + registry',
      emneProgress: 'fagverk-ia-v3',
      quizHistory: 'fagverk-ia-v3',
      places: 'fagverk-ia-v3',
      concepts: 'fagverk subject page'
    }
  };
}

if (process.argv[1]?.endsWith('audit-fagverk-politikk-runtime-equivalence.mjs')) {
  try {
    process.stdout.write(`${JSON.stringify(auditPolitikkRuntimeEquivalence(), null, 2)}\n`);
  } catch (error) {
    console.error(`Politikk runtime-equivalence FEIL: ${error.message}`);
    process.exitCode = 1;
  }
}
