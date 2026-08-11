#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const P = Object.freeze({
  fagkart: 'data/fag/TV_og_Film/fagkart_film_tv_canonical_v4_5.json',
  emner: 'data/fag/TV_og_Film/emner_film_tv_canonical_v4_5.json',
  pensum: 'data/fag/TV_og_Film/film_tvpensum_canonical_v4_5.json',
  inventory: 'data/fag/TV_og_Film/film_tv_variable_inventory_v1.json',
  registry: 'data/fagverk/fagverk_registry.json',
  status: 'data/fagverk/subject_status.json',
  report: 'reports/fagverk/film-tv-curriculum-completeness-v1.json'
});

const EVIDENCE = Object.freeze([
  {
    id: 'qaa-2024-communication-media-film-cultural-studies',
    authority: 'Quality Assurance Agency for Higher Education',
    location: 'https://www.qaa.ac.uk/docs/qaa/sbs/sbs-communication-media-film-and-cultural-studies-24.pdf',
    use: 'Cross-cutting coverage of historical, aesthetic, technological, industrial, social, geographical, environmental, ethical and representational dimensions; methods, production and non-Western perspectives.'
  },
  {
    id: 'ntnu-filmvitenskap-2026-program',
    authority: 'NTNU',
    location: 'https://www.ntnu.no/studier/bfv/studiets-oppbygning',
    use: 'Norwegian university baseline: film and narrative, film history, film in society, Nordic film and TV, documentary, film/TV/game industries and film experience.'
  },
  {
    id: 'ntnu-filmvitenskap-2026-learning',
    authority: 'NTNU',
    location: 'https://www.ntnu.no/studier/bfv',
    use: 'Field purpose: film elements, narratology, Norwegian and international history, production conditions, artistic trajectories and social significance.'
  },
  {
    id: 'uio-audiovisual-aesthetics',
    authority: 'Universitetet i Oslo',
    location: 'https://www.uio.no/studier/emner/hf/imk/MEVIT1110/',
    use: 'Audiovisual aesthetics baseline for narrative, style and genre across film and television series.'
  }
]);

const PROPOSED_DOMAINS = Object.freeze([
  {
    id: 'audiovisuell_form_stil_analyse',
    title: 'Audiovisuell form, stil og analyse',
    rationale: 'Owns image, sound, mise-en-scene, editing, cinematography, performance and analytical vocabulary rather than hiding aesthetics inside production roles.'
  },
  {
    id: 'fortelling_sjanger_serialitet_format',
    title: 'Fortelling, sjanger, serialitet og format',
    rationale: 'Separates narrative organisation, genre conventions, episodic and seasonal structures, live formats and format adaptation.'
  },
  {
    id: 'film_tv_historie_historiografi',
    title: 'Film- og TV-historie og historiografi',
    rationale: 'Adds the missing historical core: early and classical cinema, television history, movements, Norwegian/Nordic and global trajectories, periodisation and historiographical source criticism.'
  },
  {
    id: 'dokumentar_virkelighetsformer_etikk',
    title: 'Dokumentar, virkelighetsformer og etikk',
    rationale: 'Gives documentary, essay film, news images, reality formats, evidence claims, staging and participant ethics a coherent home.'
  },
  {
    id: 'samfunn_representasjon_identitet_makt',
    title: 'Samfunn, representasjon, identitet og makt',
    rationale: 'Makes class, gender, race, sexuality, disability, Indigenous perspectives, nation, public debate and unequal visibility auditable rather than optional.'
  },
  {
    id: 'produksjon_arbeid_teknologi_praksis',
    title: 'Produksjon, arbeid, teknologi og praksis',
    rationale: 'Keeps creative and technical work, collaboration, labour conditions, digital workflows, virtual production, AI and sustainable practice together without reducing form to equipment.'
  },
  {
    id: 'industri_institusjoner_politikk_distribusjon',
    title: 'Industri, institusjoner, politikk og distribusjon',
    rationale: 'Owns financing, production systems, broadcasting, public service, rights, regulation, platforms, markets, circulation and access.'
  },
  {
    id: 'visning_publikum_resepsjon_deltakelse',
    title: 'Visning, publikum, resepsjon og deltakelse',
    rationale: 'Connects cinemas, festivals, programming, audience research, television routines, streaming, interpretation, fandom and participatory cultures.'
  },
  {
    id: 'sted_location_skjermgeografi',
    title: 'Sted, location og skjermgeografi',
    rationale: 'Treats location choice, built and synthetic space, city, street, interior, landscape, mobility, place identity, tourism, community effects and environmental location ethics as distinct questions.'
  },
  {
    id: 'arkiv_kulturarv_minne_stjerner',
    title: 'Arkiv, kulturarv, minne og stjerner',
    rationale: 'Owns preservation, loss, canon formation, reuse, audiovisual memory, celebrity and star construction while distinguishing archival evidence from nostalgia.'
  }
]);

const CROSS_CUTTING_GATES = Object.freeze([
  'film_and_television_both_explicit_across_the_curriculum',
  'norwegian_nordic_and_global_coverage_without_western_canon_default',
  'historical_aesthetic_social_technological_industrial_and_geographical_contexts',
  'representation_power_accessibility_and_intersectional_analysis',
  'environmental_sustainability_and_production_ethics',
  'close_analysis_archive_research_audience_research_industry_analysis_and_practice_methods',
  'documented_works_scenes_productions_institutions_places_audiences_and_archives_before_theory'
]);

const abs = (file) => path.join(ROOT, file);
const json = (file) => JSON.parse(fs.readFileSync(abs(file), 'utf8'));
const assert = (condition, message) => { if (!condition) throw new Error(message); };

function normaliseDefinition(row) {
  const subject = String(row.title || '').toLocaleLowerCase('nb-NO');
  return String(row.definition || '').toLocaleLowerCase('nb-NO').replace(subject, '<emne>').replace(/\s+/g, ' ').trim();
}

export function auditFilmTvCurriculumCompletenessV1({ writeReport = false, checkReport = true } = {}) {
  const fagkart = json(P.fagkart);
  const emner = json(P.emner);
  const pensum = json(P.pensum);
  const registry = json(P.registry).subjects?.film_tv;
  const status = json(P.status).subjects.find((row) => row.id === 'film_tv');
  if (['canonical_inventory_migrated_existing_chapter_reaudit', 'canonical_chapter_reaudit_complete_learning_order_plan'].includes(status?.nextGate)) {
    const inventory = json(P.inventory);
    const historical = json(P.report);
    assert(emner.length === 192 && fagkart.categories.length === 10 && pensum.domains.length === 10, 'Den migrerte canonen samsvarer ikke med completeness-planen');
    assert(new Set(inventory.emner.flatMap((row) => row.legacy_aliases)).size === 120, 'Legacygrunnlaget er ikke bevart som 120 aliases');
    assert(historical.legacy_inventory?.emne_count === 120 && historical.legacy_inventory?.domain_count === 6, 'Den historiske kvoteauditen er skadet');
    assert(registry?.chapters?.length === 2, 'De to materialiserte kapitlene skal bevares gjennom migrasjonen');
    return historical;
  }
  assert(Array.isArray(fagkart.categories) && fagkart.categories.length === 6, 'Film & TV-fagkartet mangler den auditerte legacystrukturen');
  assert(Array.isArray(emner) && emner.length === 120, 'Legacy-denominatoren skal være eksplisitt før refaktor');
  assert(Array.isArray(pensum.domains) && pensum.domains.length === 6, 'Legacy-pensumet mangler seks områder');

  const hooks = fagkart.categories.flatMap((domain) => domain.topic_hooks || []);
  const domainEmneCounts = pensum.domains.map((domain) => domain.emne_ids?.length || 0);
  const domainHookCounts = fagkart.categories.map((domain) => domain.topic_hooks?.length || 0);
  const hookEmneCounts = hooks.map((hook) => hook.emne_ids?.length || 0);
  const normalisedDefinitionCount = new Set(emner.map(normaliseDefinition)).size;
  const whyItMattersCount = new Set(emner.map((row) => row.why_it_matters)).size;
  const overlapNoteCount = new Set(emner.map((row) => row.overlap_resolution_note)).size;

  assert(domainEmneCounts.every((count) => count === 20), 'Legacy 6×20-mønsteret er endret; auditen må revideres');
  assert(domainHookCounts.every((count) => count === 10), 'Legacy 6×10 hook-mønsteret er endret; auditen må revideres');
  assert(hookEmneCounts.every((count) => count === 2), 'Legacy 2-emner-per-hook-mønsteret er endret; auditen må revideres');
  assert(normalisedDefinitionCount === 1, 'Forventet én generisk emnedefinisjonsmal etter at emnenavnet er fjernet');
  assert(whyItMattersCount === 6, 'Forventet seks generiske relevansmaler');
  assert(overlapNoteCount === 1, 'Forventet én generisk overlappsregel');
  assert(registry?.chapters?.length === 2, 'De to materialiserte kapitlene skal bevares under refaktoren');
  assert(status?.editorialStatus === 'chapters_in_progress', 'Film & TV skal stå som pågående under refaktoren');
  assert(['curriculum_completeness_refactor', 'canonical_inventory_migration'].includes(status?.nextGate), 'Film & TV skal være blokkert på completeness-refaktor eller canonical migrasjon');

  const report = {
    schema: 'history_go_film_tv_curriculum_completeness_audit_v1',
    version: '1.0.0',
    updated_at: '2026-08-11',
    status: 'quota_shaped_inventory_confirmed_refactor_required',
    subject_id: 'film_tv',
    evidence: EVIDENCE,
    legacy_inventory: {
      domain_count: pensum.domains.length,
      emne_count: emner.length,
      hook_count: hooks.length,
      materialized_chapter_count: registry.chapters.length,
      domain_emne_counts: domainEmneCounts,
      domain_hook_counts: domainHookCounts,
      hook_emne_counts_unique: [...new Set(hookEmneCounts)],
      normalized_definition_template_count: normalisedDefinitionCount,
      why_it_matters_template_count: whyItMattersCount,
      overlap_resolution_template_count: overlapNoteCount
    },
    findings: [
      'All six legacy domains contain exactly 20 emner.',
      'All six legacy domains contain exactly 10 hooks.',
      'Every hook contains exactly two emner.',
      'After replacing the inserted title, all 120 definitions reduce to one shared template.',
      'The current architecture lacks a distinct film and television history/historiography core.',
      'Television, global and non-Western trajectories, representation, accessibility, emerging technology and sustainability are not auditable as cross-cutting coverage.',
      'The two published chapters remain valid content, but 20/20 and 3/9/27 are inventory descriptions rather than completion evidence.'
    ],
    proposed_domain_candidates: PROPOSED_DOMAINS,
    cross_cutting_completeness_gates: CROSS_CUTTING_GATES,
    required_migration_sequence: [
      'classify_every_legacy_emne_as_keep_merge_move_split_or_retire',
      'identify_missing_relevant_emner_from_evidence_baseline',
      'publish_new_variable_domain_and_emne_inventory_with_alias_migration',
      'update_methods_hooks_mappings_quiz_rules_and_runtime_projection',
      'reaudit_existing_chapters_without_fixed_counts',
      'resume_chapter_production_in_faglig_learning_order',
      'run_full_gap_overlap_filler_and_exclusion_audit_before_complete'
    ],
    gates: {
      quotaPatternMeasured: true,
      universityAndSectorBaselineRecorded: EVIDENCE.length >= 4,
      missingCoverageNamed: true,
      proposedArchitectureIsNotCountLocked: true,
      existingChapterContentPreserved: true,
      newChapterProductionBlockedUntilRefactor: ['curriculum_completeness_refactor', 'canonical_inventory_migration'].includes(status.nextGate)
    }
  };

  if (writeReport) fs.writeFileSync(abs(P.report), `${JSON.stringify(report, null, 2)}\n`);
  if (checkReport) assert(isDeepStrictEqual(json(P.report), report), `${P.report} er utdatert`);
  return report;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = new Set(process.argv.slice(2));
  try {
    const report = auditFilmTvCurriculumCompletenessV1({ writeReport: args.has('--write-report'), checkReport: !args.has('--no-check-report') });
    console.log(`Film & TV completeness-audit OK: ${report.legacy_inventory.emne_count} legacy-emner viser 6×10×2-kvotemønster; refaktor er aktiv port.`);
  } catch (error) {
    console.error(`Film & TV completeness-audit FEIL: ${error.message}`);
    process.exitCode = 1;
  }
}
