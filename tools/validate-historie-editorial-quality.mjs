#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DEFAULT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const list = (value) => Array.isArray(value) ? value : [];
const readJson = (root, file) => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
const assert = (condition, message) => { if (!condition) throw new Error(message); };

export function validateHistoryEditorialQuality({ root = DEFAULT_ROOT } = {}) {
  const profilesDocument = readJson(root, 'data/fag/historie/editorial_profiles_historie_v1.json');
  const pensum = readJson(root, 'data/fag/historie/historiepensum_canonical_v4_5.json');
  const emners = readJson(root, 'data/fag/historie/emner_historie_canonical_v4_5.json');
  const fagkart = readJson(root, 'data/fag/historie/fagkart_historie_canonical_v4_5.json');
  const theories = readJson(root, 'data/fag/historie/theory_objects_historie_canonical_v5_5.json');
  const evidence = readJson(root, 'data/fag/historie/theory_evidence_historie_canonical_v1.json');
  const registry = readJson(root, 'data/fagverk/fagverk_registry.json');
  const status = readJson(root, 'data/fagverk/subject_status.json');

  assert(profilesDocument.schema === 'history_go_historie_editorial_profiles_v1', 'Feil schema for Historie-fagprofilene');
  assert(profilesDocument.status === 'expanded_and_audited', 'Historie-fagprofilene mangler auditert status');
  const profiles = list(profilesDocument.profiles);
  assert(profiles.length === 18, 'Det skal finnes atten redaksjonelle fagprofiler');
  assert(new Set(profiles.map((profile) => profile.domain_id)).size === profiles.length, 'Dupliserte fagprofil-id-er');
  assert(new Set(profiles.map((profile) => profile.thesis)).size === profiles.length, 'Fagprofilene gjenbruker samme hovedfortelling');
  assert(new Set(profiles.map((profile) => profile.debate?.question)).size === profiles.length, 'Fagprofilene gjenbruker samme tolkningsspørsmål');

  const domainById = new Map(list(pensum.domains).map((domain) => [domain.domain_id, domain]));
  const emneById = new Map(emners.map((emne) => [emne.emne_id, emne]));
  const theoryByHookId = new Map(theories.map((theory) => [theory.source_hook_id, theory]));
  const evidenceByTheoryId = new Map(evidence.entries.map((entry) => [entry.theory_id, entry]));
  const chapterByDomainId = new Map(registry.subjects.historie.chapters.map((chapter) => [chapter.primary_domain_id, chapter]));

  const primaryOwnerByHook = new Map();
  for (const emne of emners) {
    const primaryHooks = list(emne.primary_theory_hooks);
    assert(primaryHooks.length === 1, `${emne.emne_id}: skal ha nøyaktig én canonical primary hook`);
    const hookId = primaryHooks[0];
    assert(!primaryOwnerByHook.has(hookId), `${hookId}: canonical primary hook brukes av flere emner`);
    primaryOwnerByHook.set(hookId, emne.emne_id);
  }
  assert(primaryOwnerByHook.size === 230, 'Historie skal ha 230 unike canonical primary hooks');
  let fagkartHookCount = 0;
  for (const category of list(fagkart.categories)) {
    for (const hook of list(category.topic_hooks)) {
      fagkartHookCount += 1;
      const expectedOwner = primaryOwnerByHook.get(hook.id);
      assert(expectedOwner, `${hook.id}: fagkart-hook mangler canonical primary-eier`);
      const owners = list(hook.emne_ids);
      assert(owners.length === 1 && owners[0] === expectedOwner, `${hook.id}: hook.emne_ids skal uttrykke nøyaktig én canonical primary-eier (${expectedOwner}), ikke secondary/editorial analysebaner`);
    }
  }
  assert(fagkartHookCount === 230, `Historie-fagkartet skal ha 230 hooks, fant ${fagkartHookCount}`);

  const generatorOwnedDomains = new Set();
  for (const chapterMeta of registry.subjects.historie.chapters) {
    const chapter = readJson(root, chapterMeta.file);
    if (!chapter.productionBriefFile) continue;
    const brief = readJson(root, chapter.productionBriefFile);
    if (brief.generatedFrom?.generator === 'tools/materialize-historie-editorial-chapters.mjs') generatorOwnedDomains.add(chapterMeta.primary_domain_id);
  }
  assert(generatorOwnedDomains.size === 18, 'Inventaret av generator-eide Historie-kapitler er endret');
  assert(new Set(profiles.map((profile) => profile.domain_id)).size === generatorOwnedDomains.size, 'Fagprofilene dekker ikke det generator-eide inventaret');

  let sectionLensCount = 0;
  let caseAnchorCount = 0;
  let causalStepCount = 0;
  for (const profile of profiles) {
    assert(generatorOwnedDomains.has(profile.domain_id), `${profile.domain_id}: er ikke et generator-eid kapittel`);
    const domain = domainById.get(profile.domain_id);
    assert(domain, `${profile.domain_id}: ukjent fagområde`);
    assert(typeof profile.thesis === 'string' && profile.thesis.length >= 330, `${profile.domain_id}: hovedfortellingen er for kort`);
    assert(list(profile.module_introductions).length === 3, `${profile.domain_id}: må ha tre modulintroduksjoner`);
    assert(profile.module_introductions.every((text) => text.length >= 80), `${profile.domain_id}: modulintroduksjon er for kort`);
    assert(list(profile.causal_chain).length === 4, `${profile.domain_id}: må ha fire ledd i årsakskjeden`);
    assert(profile.causal_chain.every((text) => text.length >= 75), `${profile.domain_id}: årsaksledd er for kort`);
    causalStepCount += profile.causal_chain.length;
    assert(profile.debate?.question?.length >= 85, `${profile.domain_id}: mangler et reelt tolkningsspørsmål`);
    assert(list(profile.debate?.positions).length === 2, `${profile.domain_id}: må ha to konkurrerende tolkninger`);
    assert(profile.debate.positions.every((text) => text.length >= 100), `${profile.domain_id}: tolkningsposisjon er for kort`);
    assert(profile.debate.editorial_note?.length >= 100, `${profile.domain_id}: mangler redaksjonell behandling av uenigheten`);
    assert(list(profile.case_anchors).length === 3, `${profile.domain_id}: må ha tre kuraterte stedscaser`);
    assert(new Set(profile.case_anchors.map((anchor) => anchor.place_id)).size === 3, `${profile.domain_id}: dupliserte stedscaser`);
    assert(profile.case_anchors.every((anchor) => anchor.use?.length >= 80), `${profile.domain_id}: stedscase mangler faglig bruk`);
    caseAnchorCount += profile.case_anchors.length;

    const category = fagkart.categories.find((row) => row.id === profile.domain_id);
    assert(category, `${profile.domain_id}: mangler fagkartkategori`);
    const evidencedPlaces = new Set(category.topic_hooks.flatMap((hook) => {
      const theory = theoryByHookId.get(hook.id);
      return theory ? list(evidenceByTheoryId.get(theory.theory_id)?.place_ids) : [];
    }));
    for (const anchor of profile.case_anchors) assert(evidencedPlaces.has(anchor.place_id), `${profile.domain_id}: stedscaset ${anchor.place_id} mangler teori-evidens`);

    const lensEntries = Object.entries(profile.section_lenses || {});
    assert(lensEntries.length === domain.emne_ids.length && lensEntries.length === 10, `${profile.domain_id}: må ha én linse per emne`);
    assert(new Set(lensEntries.map(([emneId]) => emneId)).size === 10, `${profile.domain_id}: dupliserte emnelinser`);
    for (const [emneId, lens] of lensEntries) {
      assert(domain.emne_ids.includes(emneId) && emneById.has(emneId), `${profile.domain_id}: ukjent emne i linse ${emneId}`);
      assert(typeof lens === 'string' && lens.length >= 65, `${profile.domain_id}/${emneId}: redaksjonell linse er for kort`);
    }
    sectionLensCount += lensEntries.length;

    const chapterMeta = chapterByDomainId.get(profile.domain_id);
    const chapter = readJson(root, chapterMeta.file);
    const brief = readJson(root, chapter.productionBriefFile);
    assert(chapter.lead === profile.thesis, `${profile.domain_id}: kapittelledeteksten avviker fra fagprofilen`);
    assert(chapter.editorialProfileId === profile.domain_id, `${profile.domain_id}: kapittelet mangler profil-id`);
    assert(list(chapter.narrativeArchitecture?.causalFramework).length === 4, `${profile.domain_id}: kapittelet mangler årsaksarkitektur`);
    assert(list(chapter.narrativeArchitecture?.caseAnchorIds).length === 3, `${profile.domain_id}: kapittelet mangler stedscaser`);
    assert(brief.editorialRequirements?.editorialProfileRequired === true, `${profile.domain_id}: briefen krever ikke fagprofil`);
    assert(brief.generatedFrom?.editorialProfiles === 'data/fag/historie/editorial_profiles_historie_v1.json', `${profile.domain_id}: briefen sporer ikke fagprofilen`);
    const modules = chapter.moduleFiles.map((file) => readJson(root, file));
    assert(modules.every((module, index) => module.editorialIntroduction === profile.module_introductions[index]), `${profile.domain_id}: modulintroduksjon avviker`);
    const sections = modules.flatMap((module) => list(module.sections));
    assert(sections.length === 10, `${profile.domain_id}: kapittelet må ha ti emneseksjoner`);
    for (const section of sections) {
      assert(section.editorialLens === profile.section_lenses[section.emneId], `${profile.domain_id}/${section.emneId}: linsen er ikke materialisert`);
      assert(list(section.paragraphs)[1]?.includes(section.editorialLens), `${profile.domain_id}/${section.emneId}: linsen inngår ikke i brødteksten`);
    }
    const application = modules[2];
    assert(JSON.stringify(application.causalFramework) === JSON.stringify(profile.causal_chain), `${profile.domain_id}: årsakskjeden avviker i anvendelsesmodulen`);
    assert(JSON.stringify(application.historiographicalDebate) === JSON.stringify(profile.debate), `${profile.domain_id}: tolkningsdebatten avviker`);
    assert(JSON.stringify(application.caseAnchors) === JSON.stringify(profile.case_anchors), `${profile.domain_id}: stedscasene avviker`);
    assert(!chapter.lead.includes('Kapittelet følger fagfeltet gjennom de ti canonicale emnene'), `${profile.domain_id}: gammel kapittelmal står igjen`);
  }

  assert(sectionLensCount === 180, 'Historie må ha 180 emnespesifikke redaksjonelle linser');
  assert(new Set(profiles.flatMap((profile) => Object.values(profile.section_lenses || {}))).size === sectionLensCount, 'Emnelinsene må være redaksjonelt selvstendige');
  assert(caseAnchorCount === 54, 'Historie må ha 54 kuraterte stedscaser');
  assert(causalStepCount === 72, 'Historie må ha 72 redigerte årsaksledd');
  const statusEntry = status.subjects.find((entry) => entry.id === 'historie');
  assert(statusEntry?.editorialStatus === 'expanded_and_audited', 'Historie-statusen beskriver ikke kvalitetsutvidelsen');

  return { profiles: profiles.length, sectionLenses: sectionLensCount, caseAnchors: caseAnchorCount, causalSteps: causalStepCount, debates: profiles.length, primaryHookOwners: primaryOwnerByHook.size };
}

function main() {
  try {
    const result = validateHistoryEditorialQuality();
    console.log(`Historie-redaksjonell kvalitet OK: ${result.profiles} fagprofiler, ${result.sectionLenses} emnelinser, ${result.caseAnchors} stedscaser, ${result.causalSteps} årsaksledd, ${result.debates} tolkningsdebatter og ${result.primaryHookOwners} entydige primary hook-eiere.`);
  } catch (error) {
    console.error(`Historie-redaksjonell kvalitet FEIL: ${error.message}`);
    process.exitCode = 1;
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
