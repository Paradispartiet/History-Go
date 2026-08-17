#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ID = 'industri-regulering-og-distribusjon';
const NEXT = 'industry_regulation_distribution_full_chapter_complete_next_unit_source_brief';
const RECEPTION_SOURCE_GATE = 'reception_participation_audience_methods_source_brief_complete_full_chapter_production';
const RECEPTION_FULLTEXT_GATE = 'reception_participation_audience_methods_full_chapter_complete_next_unit_source_brief';
const SCREEN_PLACES_SOURCE_GATE = 'screen_places_identity_circulation_source_brief_complete_full_chapter_production';
const SCREEN_PLACES_FULLTEXT_GATE = 'screen_places_identity_circulation_full_chapter_complete_next_unit_source_brief';
const LOCATION_PRODUCTION_SOURCE_GATE = 'location_production_place_ethics_source_brief_complete_full_chapter_production';
const LOCATION_PRODUCTION_FULLTEXT_GATE = 'location_production_place_ethics_full_chapter_complete_next_unit_source_brief';
const ARCHIVE_PRESERVATION_SOURCE_GATE = 'archive_preservation_access_authenticity_source_brief_complete_full_chapter_production';
const ARCHIVE_PRESERVATION_FULLTEXT_GATE = 'archive_preservation_access_authenticity_full_chapter_complete_next_unit_source_brief';
const UNIT15_SOURCE_GATE = 'cultural_heritage_canon_stars_memory_source_brief_complete_full_chapter_production';
const UNIT_FIFTEEN_COMPLETION_AUDIT_GATE = 'cultural_heritage_canon_stars_memory_full_chapter_complete_completion_audit';
const MAINTENANCE_GATE = 'maintenance_source_refresh_and_place_case_expansion';
const UNIT_TEN_OR_LATER_PRODUCTION_GATES = new Set([
  NEXT,
  RECEPTION_SOURCE_GATE,
  RECEPTION_FULLTEXT_GATE,
  SCREEN_PLACES_SOURCE_GATE,
  SCREEN_PLACES_FULLTEXT_GATE,
  LOCATION_PRODUCTION_SOURCE_GATE,
  LOCATION_PRODUCTION_FULLTEXT_GATE,
  ARCHIVE_PRESERVATION_SOURCE_GATE,
  ARCHIVE_PRESERVATION_FULLTEXT_GATE,
  UNIT15_SOURCE_GATE, UNIT_FIFTEEN_COMPLETION_AUDIT_GATE, MAINTENANCE_GATE
]);

export const isFilmTvUnitTenOrLaterGate = (gate) => UNIT_TEN_OR_LATER_PRODUCTION_GATES.has(gate);

const read = (file) => JSON.parse(fs.readFileSync(path.join(ROOT, file), 'utf8'));
const write = (file, value) => {
  fs.mkdirSync(path.dirname(path.join(ROOT, file)), { recursive: true });
  fs.writeFileSync(path.join(ROOT, file), `${JSON.stringify(value, null, 2)}\n`);
};
const assert = (ok, message) => { if (!ok) throw new Error(message); };
const rowsFromManifest = (manifestPath, filesKey, rowsKey) =>
  read(manifestPath)[filesKey].flatMap((file) => read(file)[rowsKey]);

export function auditFilmTvIndustryRegulationDistributionFulltextV1({
  writeReport = false,
  checkReport = true
} = {}) {
  const chapter = read(`data/fagverk/film_tv/${ID}.json`);
  const brief = read(`data/fagverk/film_tv/${ID}/brief.json`);
  const claims = read(`data/fagverk/film_tv/${ID}/claims.json`);
  const sourceBrief = read('data/fag/TV_og_Film/film_tv_industry_regulation_distribution_source_claim_brief_v1.json');
  const topicBriefs = rowsFromManifest(
    'data/fag/TV_og_Film/film_tv_industry_regulation_distribution_topic_claims_v1.json',
    'topic_claim_files',
    'topic_briefs'
  );
  const cases = rowsFromManifest(
    'data/fag/TV_og_Film/film_tv_industry_regulation_distribution_cases_v1.json',
    'case_files',
    'cases'
  );
  const plan = read('data/fag/TV_og_Film/film_tv_learning_order_plan_v1.json');
  const registry = read('data/fagverk/fagverk_registry.json');
  const status = read('data/fagverk/subject_status.json');
  const modules = chapter.moduleFiles.map(read);
  const sections = modules.flatMap((module) => module.sections || []);
  const paragraphs = sections.flatMap((section) => section.paragraphs || []);
  const paragraphClaims = sections.flatMap((section) => section.paragraphClaimIds || []).flat();
  const planned = new Set(topicBriefs.flatMap((topic) => topic.planned_claims.map((claim) => claim.id)));
  const final = new Set(claims.claims.map((claim) => claim.id));
  const sourceIds = new Set(claims.sources.map((source) => source.id));
  const usedSourceIds = new Set(claims.claims.flatMap((claim) => claim.source_ids));
  const unit = plan.planned_units.find((row) => row.id === ID);
  const registered = registry.subjects.film_tv.chapters.find((row) => row.id === ID);
  const film = status.subjects.find((row) => row.id === 'film_tv');
  const combined = paragraphs.join(' ');

  const gates = {
    exact_twelve_emne_coverage: unit?.emne_count === 12 && isDeepStrictEqual(chapter.emne_ids, unit.emne_ids),
    four_modules_twelve_sections: modules.length === 4
      && sections.length === 12
      && sections.every((section) => section.emne_ids?.length === 1)
      && new Set(sections.map((section) => section.emne_ids[0])).size === 12,
    variable_scope: isDeepStrictEqual(
      modules.map((module) => module.sections.reduce((sum, section) => sum + section.paragraphs.length, 0)),
      [17, 14, 13, 8]
    ),
    fifty_two_paragraph_claims: paragraphs.length === 52
      && paragraphClaims.length === 52
      && new Set(paragraphClaims).size === 52
      && paragraphClaims.every((id) => planned.has(id)),
    fifty_two_verified_claims: claims.claims.length === 52
      && final.size === 52
      && isDeepStrictEqual(final, planned)
      && claims.claims.every((claim) =>
        claim.status === 'verified'
        && claim.claim_plan_id === claim.id
        && claim.plan_resolution === 'verified_as_planned'
        && claim.source_ids.length > 0
        && claim.used_in.length === 1
      ),
    claim_specific_evidence: topicBriefs.some((topic) =>
      topic.planned_claims.some((plannedClaim) => {
        const finalClaim = claims.claims.find((claim) => claim.id === plannedClaim.id);
        return finalClaim && finalClaim.source_ids.length < topic.source_ids.length;
      })
    ),
    thirty_four_sources_used: claims.sources.length === 34
      && [...sourceIds].every((id) => usedSourceIds.has(id))
      && claims.sources.every((source) => /^https:\/\//.test(source.url) && source.source_location && source.territory),
    thirty_four_cases: cases.length === 34
      && chapter.workCases.length === 34
      && new Set(chapter.workCases.map((row) => row.id)).size === 34,
    canonical_methods: chapter.method_ids.length > 0 && isDeepStrictEqual(brief.requiredMethodIds, chapter.method_ids),
    immutable_source_brief: sourceBrief.status === 'source_claim_brief_complete_full_chapter_production'
      && sourceBrief.runtime_registration.registered === false
      && sourceBrief.runtime_registration.allowed_before_full_chapter_gate === false,
    registered: registered?.file === `data/fagverk/film_tv/${ID}.json`
      && registered?.claimsFile === `data/fagverk/film_tv/${ID}/claims.json`
      && registered?.briefFile === `data/fagverk/film_tv/${ID}/brief.json`,
    next_gate: ['chapters_in_progress', 'complete'].includes(film?.editorialStatus)
      && isFilmTvUnitTenOrLaterGate(film?.nextGate),
    funding_boundary: /tildeling.{0,180}(ikke|dokumenterer ikke).{0,180}(kvalitet|publikum|virkning)/i.test(combined),
    ownership_boundary: /tjeneste.{0,120}foretak.{0,120}konsern.{0,160}(kontroll|reell kontroll)/i.test(combined),
    platform_procedure_boundary: /informasjonskrav.{0,180}(ikke|ingen).{0,140}(lovbrudd|konklusjon)/i.test(combined),
    audience_measurement_boundary: /univers.{0,140}(panel|census).{0,180}(enhet|vekting|tidsrom)/i.test(combined),
    rights_chain_boundary: /opphav.{0,100}(eierskap|vern).{0,120}lisens.{0,120}territorium.{0,120}(eksklusivitet|visningsvindu)/i.test(combined),
    regulation_boundary: /myndighet.{0,100}rettsgrunnlag.{0,100}territorium.{0,100}periode.{0,140}(prosess|klage)/i.test(combined),
    format_boundary: /idé.{0,100}(TV-format|format).{0,120}produksjonsbibel.{0,120}lisens.{0,120}lokal/i.test(combined),
    piracy_boundary: /EUIPO-data.{0,220}(ikke|dokumenterer ikke).{0,120}(motiv|betalingsvilje|velferd)/i.test(combined),
    reception_remains_next_unit: /Konkret publikumsbruk, fortolkning, identitetsarbeid, fellesskap og publikumsmetoder eies av neste enhet/i.test(brief.scopeBoundary)
  };

  assert(
    Object.values(gates).every(Boolean),
    `Fulltekstporter feiler: ${Object.entries(gates).filter(([, value]) => !value).map(([key]) => key).join(', ')}`
  );

  const report = {
    schema: 'history_go_film_tv_industry_regulation_distribution_fulltext_v1_audit',
    version: '1.0.0',
    updated_at: '2026-08-14',
    status: 'industry_regulation_distribution_chapter_verified_registered',
    subject_id: 'film_tv',
    chapter_id: ID,
    summary: {
      emne_count: 12,
      module_count: 4,
      section_count: 12,
      paragraph_count: 52,
      verified_claim_count: 52,
      used_source_count: 34,
      case_count: 34,
      method_count: chapter.method_ids.length
    },
    gates,
    next_gate: NEXT
  };

  const reportPath = 'reports/fagverk/film-tv-industry-regulation-distribution-fulltext-v1-audit.json';
  if (writeReport) write(reportPath, report);
  if (checkReport) {
    assert(
      fs.existsSync(path.join(ROOT, reportPath)) && isDeepStrictEqual(read(reportPath), report),
      `${reportPath} er utdatert`
    );
  }
  return report;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = new Set(process.argv.slice(2));
  try {
    const report = auditFilmTvIndustryRegulationDistributionFulltextV1({
      writeReport: args.has('--write-report'),
      checkReport: !args.has('--write-report')
    });
    console.log(`Film & TV enhet 10 fulltekst OK: ${report.summary.verified_claim_count} claims.`);
  } catch (error) {
    console.error(`Film & TV enhet 10 fulltekst FEIL: ${error.message}`);
    process.exitCode = 1;
  }
}
