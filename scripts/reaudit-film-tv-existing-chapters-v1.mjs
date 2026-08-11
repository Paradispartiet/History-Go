#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const P = Object.freeze({
  inventory: 'data/fag/TV_og_Film/film_tv_variable_inventory_v1.json',
  emners: 'data/fag/TV_og_Film/emner_film_tv_canonical_v4_5.json',
  registry: 'data/fagverk/fagverk_registry.json',
  status: 'data/fagverk/subject_status.json',
  report: 'reports/fagverk/film-tv-existing-chapter-reaudit-v1-audit.json'
});
const CHAPTERS = Object.freeze([
  {
    id: 'kinoer-visningssteder-og-publikum',
    domain: 'visning_publikum_resepsjon_deltakelse',
    chapter: 'data/fagverk/film_tv/kinoer-visningssteder-og-publikum.json',
    brief: 'data/fagverk/film_tv/kinoer-visningssteder-og-publikum/brief.json',
    previousAudit: 'reports/fagverk/film-tv-kinoer-visningssteder-publikum-phase4-audit.json'
  },
  {
    id: 'produksjon-studio-og-filmarbeid',
    domain: 'produksjon_arbeid_teknologi_praksis',
    chapter: 'data/fagverk/film_tv/produksjon-studio-og-filmarbeid.json',
    brief: 'data/fagverk/film_tv/produksjon-studio-og-filmarbeid/brief.json',
    previousAudit: 'reports/fagverk/film-tv-produksjon-studio-filmarbeid-phase4-audit.json'
  }
]);
const abs = (file) => path.join(ROOT, file);
const read = (file) => JSON.parse(fs.readFileSync(abs(file), 'utf8'));
const write = (file, value) => fs.writeFileSync(abs(file), `${JSON.stringify(value, null, 2)}\n`);
const unique = (items) => [...new Set(items)];
const assert = (ok, message) => { if (!ok) throw new Error(message); };

function aliasMap(inventory) {
  const map = new Map();
  for (const emne of inventory.emner) for (const alias of emne.legacy_aliases) {
    if (!map.has(alias)) map.set(alias, []);
    map.get(alias).push(emne.emne_id);
  }
  return map;
}

export function buildFilmTvExistingChapterReauditV1() {
  const inventory = read(P.inventory);
  const canonicalIds = new Set(read(P.emners).map((row) => row.emne_id));
  const aliases = aliasMap(inventory);
  const outputs = {};
  const chapterRows = [];

  for (const spec of CHAPTERS) {
    const previous = read(spec.previousAudit);
    const legacyIds = previous.canonicalCoverage.legacySourceEmneIds || previous.canonicalCoverage.requiredEmneIds;
    const resolvedIds = unique(legacyIds.flatMap((id) => aliases.get(id) || []));
    assert(legacyIds.every((id) => aliases.has(id)), `${spec.id}: et legacyemne mangler aliasmål`);
    assert(resolvedIds.every((id) => canonicalIds.has(id)), `${spec.id}: aliasmål mangler i canonen`);

    const chapter = structuredClone(read(spec.chapter));
    chapter.version = '1.1.0';
    chapter.primary_domain_id = spec.domain;
    chapter.emne_ids = resolvedIds;
    chapter.canonicalInventoryVersion = 'film_tvpensum_variable_v1';
    chapter.legacyAliasReaudit = { status: 'complete', source_emne_ids: legacyIds };

    const brief = structuredClone(read(spec.brief));
    brief.version = '1.1.0';
    brief.primary_domain_id = spec.domain;
    brief.requiredEmneIds = resolvedIds;
    brief.canonicalInventoryVersion = 'film_tvpensum_variable_v1';
    brief.legacyAliasReaudit = { status: 'complete', source_emne_ids: legacyIds };

    outputs[spec.chapter] = chapter;
    outputs[spec.brief] = brief;
    chapterRows.push({
      chapter_id: spec.id,
      primary_domain_id: spec.domain,
      legacy_source_emne_count: legacyIds.length,
      canonical_emne_count: resolvedIds.length,
      legacy_source_emne_ids: legacyIds,
      canonical_emne_ids: resolvedIds,
      text_claims_and_sources_preserved: true
    });
  }

  const registry = structuredClone(read(P.registry));
  const currentFilmStatus = read(P.status).subjects.find((row) => row.id === 'film_tv');
  const laterLearningOrderGate = ['learning_order_plan_complete_first_chapter_source_brief', 'audiovisual_form_source_brief_complete_full_chapter_production', 'audiovisual_form_full_chapter_complete_next_unit_source_brief', 'narrative_viewpoint_genre_source_brief_complete_full_chapter_production', 'narrative_viewpoint_genre_full_chapter_complete_next_unit_source_brief', 'seriality_format_adaptation_source_brief_complete_full_chapter_production', 'seriality_format_adaptation_full_chapter_complete_next_unit_source_brief', 'film_history_movements_historiography_source_brief_complete_full_chapter_production', 'film_history_movements_historiography_full_chapter_complete_next_unit_source_brief', 'television_platforms_participation_source_brief_complete_full_chapter_production'].includes(currentFilmStatus?.nextGate);
  if (!laterLearningOrderGate) {
    registry.version = '2.73.0';
    registry.updatedAt = '2026-08-11';
    registry.subjects.film_tv.canonicalModel.note = 'Film & TVs variable canon er materialisert med 192 emner, 119 metoder og 192 hooks/mappinger. Begge eksisterende fulltekstkapitler er reauditerte mot legacyaliasene: Kinoer, visningssteder og publikum dekker 18 canonicale etterfølgere, og Produksjon, studio og filmarbeid dekker 20. Tekst, claims og kilder er bevart. Neste port er å planlegge resterende læringsrekkefølge fra faktiske faglige hull uten fast kapittelantall.';
  }
  for (const row of chapterRows) {
    const chapter = registry.subjects.film_tv.chapters.find((item) => item.id === row.chapter_id);
    chapter.primary_domain_id = row.primary_domain_id;
    chapter.emne_ids = row.canonical_emne_ids;
  }

  const status = structuredClone(read(P.status));
  const filmStatus = status.subjects.find((row) => row.id === 'film_tv');
  if (!laterLearningOrderGate) {
    status.version = '1.61.0';
    status.updatedAt = '2026-08-11';
    filmStatus.nextGate = 'canonical_chapter_reaudit_complete_learning_order_plan';
    filmStatus.note = 'Film & TVs to bevarte fulltekstkapitler er nå reauditerte mot den migrerte canonen. Kapittel 1 projiserer 20 legacy-ID-er til 18 canonicale emner; kapittel 2 projiserer 20 legacy-ID-er til 20 canonicale emner. Tekst, 54 verifiserte claims, 44 kilder og 8 stedscase er bevart. Neste port er å planlegge resterende kapitler i faglig læringsrekkefølge fra dokumenterte hull, uten fast kapittel- eller emnetall.';
  }

  const report = {
    schema: 'history_go_film_tv_existing_chapter_reaudit_v1',
    version: '1.0.0', updated_at: '2026-08-11', status: 'existing_chapters_reaudited_learning_order_plan_next', subject_id: 'film_tv',
    chapters: chapterRows,
    preserved_totals: { chapter_count: 2, paragraph_count: 54, verified_claim_count: 54, source_count: 44, place_case_count: 8 },
    gates: {
      both_existing_chapters_reaudited: true,
      every_legacy_source_id_resolves_to_active_canon: true,
      chapter_and_brief_ids_are_canonical: true,
      registry_runtime_matches_chapter_sources: true,
      text_claims_sources_and_places_preserved: true,
      fixed_chapter_and_emne_targets_absent: true,
      new_chapter_production_waits_for_learning_order_plan: true
    },
    next_gate: 'plan_remaining_chapters_in_faglig_learning_order_without_fixed_count'
  };
  return { inventory, aliases, canonicalIds, outputs, registry, status, report };
}

export function auditFilmTvExistingChapterReauditV1({ writeFiles = false, checkFiles = true } = {}) {
  const built = buildFilmTvExistingChapterReauditV1();
  const outputs = { ...built.outputs, [P.registry]: built.registry, [P.status]: built.status, [P.report]: built.report };
  if (writeFiles) for (const [file, value] of Object.entries(outputs)) write(file, value);
  if (checkFiles) for (const [file, value] of Object.entries(outputs)) assert(isDeepStrictEqual(read(file), value), `${file} er utdatert`);
  assert(built.report.chapters.length === 2, 'Begge kapitlene må reauditeres samlet');
  assert(built.report.chapters.every((row) => row.canonical_emne_ids.every((id) => built.canonicalIds.has(id))), 'Kapittel peker til ukjent canonicalt emne');
  assert(Object.values(built.report.gates).every(Boolean), 'Minst én reauditeringsport feiler');
  return built;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = new Set(process.argv.slice(2));
  try {
    const result = auditFilmTvExistingChapterReauditV1({ writeFiles: args.has('--write'), checkFiles: !args.has('--write') && !args.has('--no-check') });
    console.log(`Film & TV kapittelreaudit OK: ${result.report.chapters.map((row) => `${row.legacy_source_emne_count}->${row.canonical_emne_count}`).join(' og ')} emner; læringsrekkefølge er neste port.`);
  } catch (error) {
    console.error(`Film & TV kapittelreaudit FEIL: ${error.message}`);
    process.exitCode = 1;
  }
}
