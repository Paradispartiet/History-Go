import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import { buildEpokePlaceIndex, exactProductionClaimYears, geographyForPlace, serializeEpokePlaceIndex } from "../scripts/build-epoke-place-index.mjs";

test("generated epoch-place index is deterministic and current", () => {
  const index = buildEpokePlaceIndex();
  assert.equal(
    fs.readFileSync("data/epoker/epoke-place-index.json", "utf8"),
    serializeEpokePlaceIndex(index)
  );
  assert.equal(index.contract, "source-backed-history-coverage-v1");
  assert.equal(index.version, 6);
  assert.equal(index.locations.contract, "canonical-place-geography-v1");
  assert.equal(index.stats.canonical_claim_count, 315);
  assert.equal(index.stats.canonical_source_count, 256);
  assert.equal(index.stats.place_evidence_link_count, 325);
  assert.equal(index.stats.period_case_count, 9);
  assert.equal(index.stats.canonical_story_milestone_count, 215);
  assert.equal(index.stats.verified_place_production_milestone_count, 363);
});

test("canonical place geography separates Oslo, Lisboa and other countries deterministically", () => {
  const index = buildEpokePlaceIndex();
  assert.deepEqual(index.locations.places.torggata, {
    country_id: "no", country_label: "Norge", city_id: "oslo", city_label: "Oslo", source: "canonical_source_path"
  });
  assert.deepEqual(index.locations.places.lisbon_city, {
    country_id: "pt", country_label: "Portugal", city_id: "lisboa", city_label: "Lisboa", source: "canonical_source_path"
  });
  assert.deepEqual(index.locations.places.wembley_stadium_london, {
    country_id: "gb", country_label: "Storbritannia", city_id: "london", city_label: "London", source: "canonical_source_path"
  });
  assert.equal(index.stats.located_place_count, index.stats.canonical_place_count);
  assert.ok(index.stats.city_located_place_count >= 850);
  assert.deepEqual(index.locations.unknown_place_ids, []);

  assert.deepEqual(geographyForPlace({ id: "unknown", sourceFile: "places/custom/unknown.json" }), {
    country_id: "", country_label: "", city_id: "", city_label: "", source: "unknown"
  });
});

test("history index supports multi-epoch places without changing primary categories", () => {
  const index = buildEpokePlaceIndex();
  const epochs = index.domains.historie.epochs;
  const memberships = new Map();
  const categories = new Set();
  for (const [epochId, group] of Object.entries(epochs)) {
    for (const place of group.places) {
      categories.add(place.category);
      const ids = memberships.get(place.place_id) || [];
      ids.push(epochId);
      memberships.set(place.place_id, ids);
    }
  }
  assert.ok(index.stats.indexed_place_count >= 120, "expected the canonical place-evidence corpus to be materialized");
  assert.ok([...memberships.values()].some((ids) => ids.length >= 3), "a place may carry evidence in several periods");
  assert.ok(categories.size >= 3, "History must include places from several unchanged primary categories");
});

test("every indexed milestone is dated, inspectable and sourced from an approved canonical evidence lane", () => {
  const index = buildEpokePlaceIndex();
  const allowedTypes = new Set(["leksikon_chronology", "canonical_place_claim", "canonical_story", "verified_place_production_claim"]);
  for (const group of Object.values(index.domains.historie.epochs)) {
    for (const place of group.places) {
      assert.ok(place.source_file.startsWith("places/"), `primary source file missing for ${place.place_id}`);
      for (const milestone of place.milestones) {
        assert.ok(Number.isFinite(milestone.year), `${place.place_id}:${milestone.id} must be dated`);
        assert.ok(
          milestone.source_file.startsWith("data/leksikon/") || milestone.source_file.startsWith("data/fag/historie/") || milestone.source_file.startsWith("data/runtime/stories-all/") || milestone.source_file.startsWith("data/places/"),
          `${place.place_id}:${milestone.id} must point to canonical History evidence`
        );
        assert.ok(allowedTypes.has(milestone.evidence_type), `${place.place_id}:${milestone.id} has an unknown evidence type`);
        assert.ok(milestone.sources.length > 0, `${place.place_id}:${milestone.id} must have a source`);
        assert.ok(milestone.sources.every((source) => /^https?:\/\//.test(source.url)));
        if (milestone.evidence_type === "canonical_place_claim") assert.ok(milestone.claim_id, `${place.place_id}:${milestone.id} lacks claim id`);
        if (milestone.evidence_type === "canonical_story") {
          assert.ok(milestone.story_id, `${place.place_id}:${milestone.id} lacks story id`);
          assert.equal(index.locations.places[place.place_id]?.country_id, "no", `${place.place_id}:${milestone.id} must belong to Norway`);
          assert.equal(index.locations.places[place.place_id]?.city_id, "oslo", `${place.place_id}:${milestone.id} must belong to Oslo`);
        }
        if (milestone.evidence_type === "verified_place_production_claim") {
          assert.equal(index.locations.places[place.place_id]?.country_id, "no", `${place.place_id}:${milestone.id} must belong to Norway`);
          assert.equal(index.locations.places[place.place_id]?.city_id, "oslo", `${place.place_id}:${milestone.id} must belong to Oslo`);
          assert.ok(milestone.source_file.startsWith("data/places/production/"), `${place.place_id}:${milestone.id} must point to its production package`);
          assert.equal(milestone.id, `production_${milestone.claim_id}`);
          const production = JSON.parse(fs.readFileSync(milestone.source_file, "utf8"));
          assert.equal(production.placeId, place.place_id);
          const claim = production.claims.find((candidate) => candidate.id === milestone.claim_id);
          assert.ok(claim, `${place.place_id}:${milestone.id} must resolve its production claim`);
          assert.equal(claim.status, "verified");
          assert.ok(!claim.temporalStatus || claim.temporalStatus === "historical");
          assert.equal(milestone.title, claim.claim);
          assert.equal(milestone.sources.length, 1);
          assert.equal(milestone.sources[0].url, claim.sourceUrl);
          assert.equal(milestone.sources[0].title, claim.sourceLocation || claim.sourceType || claim.sourceUrl);
          assert.equal(milestone.sources[0].verifiedAt, claim.verifiedAt || "");
          if (claim.timelineYear !== undefined) assert.equal(milestone.year, claim.timelineYear);
          const anchorMatch = milestone.title.match(new RegExp(`(^|[^0-9])${milestone.year}(?![0-9])`));
          assert.ok(anchorMatch);
          const anchorPosition = anchorMatch.index + String(anchorMatch[1] || "").length;
          assert.doesNotMatch(milestone.title.slice(Math.max(0, anchorPosition - 45), anchorPosition), /(?:\bca\.?|\bcirka|\bomkring|\bomtrent|\brundt|\btrolig|\bantakelig|\bkanskje)[^.!?\n]{0,35}$/i);
          assert.doesNotMatch(milestone.title.slice(anchorPosition, anchorPosition + 24), new RegExp(`^${milestone.year}(?:\\s*[-–]\\s*årene|[-–]tallet)`, "i"));
          assert.doesNotMatch(milestone.title, /(?:dateringen er usikker|teknisk midtpunkt|kildene (?:spriker|varierer)|omtrentlig datering)/i);
        }
      }
    }
  }
});

test("Oslo coverage classifies every canonical place exactly once without overstating completeness", () => {
  const index = buildEpokePlaceIndex();
  const coverage = index.domains.historie.oslo_coverage;
  const allowedStatuses = new Set(["dated_evidence", "documented_case", "awaiting_source_backed_history"]);
  const osloPlaceIds = Object.entries(index.locations.places)
    .filter(([, location]) => location.country_id === "no" && location.city_id === "oslo")
    .map(([placeId]) => placeId)
    .sort();

  assert.equal(coverage.contract, "oslo-history-coverage-v1");
  // Reviewed Oslo places, including the phase-2 blue signs, carry dated, source-backed History evidence.
  assert.equal(coverage.canonical_place_count, 586);
  assert.equal(coverage.dated_evidence_place_count, 227);
  assert.equal(coverage.documented_case_place_count, 2);
  assert.equal(coverage.awaiting_source_backed_history_count, 357);
  for (const placeId of ["akershus_slott", "gamle_radhus", "gamle_trikkestallen", "markveien", "waisenhuset_kongens_gate", "paulus_kirke", "freia_fabrikken", "lilleborg_fabrikker", "ovre_foss", "arbeidermuseet", "clemenskirken_ruin_oslo", "minneparken_gamlebyen", "saxegarden", "gamlebyen_gravlund", "gamlebyen_kirke", "galgeberg", "kampen_kirke", "kampen_park", "klosterenga_skulpturpark", "sagene", "torshov", "torshovparken", "grorud", "grorudparken"]) {
    assert.equal(
      coverage.places.find((place) => place.place_id === placeId)?.status,
      "dated_evidence",
      `${placeId} must materialize its reviewed historical claims`
    );
  }
  for (const placeId of [
    "hoybraten_miljostasjon",
    "bla_skilt_kjeglebanen_briskebyveien_21",
    "bla_skilt_fredrikke_qvam_pilestredet_81",
    "bla_skilt_sophie_borchgrevink_cort_adelers_gate_33"
  ]) {
    assert.equal(
      coverage.places.find((place) => place.place_id === placeId)?.status,
      "awaiting_source_backed_history",
      `${placeId} must not claim dated History evidence before a separate evidence package exists`
    );
  }
  assert.deepEqual(coverage.places.map((place) => place.place_id).sort(), osloPlaceIds);
  assert.equal(new Set(coverage.places.map((place) => place.place_id)).size, coverage.canonical_place_count);
  assert.ok(coverage.places.every((place) => allowedStatuses.has(place.status)));
  assert.equal(
    coverage.dated_evidence_place_count + coverage.documented_case_place_count + coverage.awaiting_source_backed_history_count,
    coverage.canonical_place_count
  );
  assert.equal(coverage.categories.reduce((sum, category) => sum + category.total, 0), coverage.canonical_place_count);
  for (const category of coverage.categories) {
    assert.equal(category.dated_evidence + category.documented_case + category.awaiting_source_backed_history, category.total);
  }
});

test("Gamlebyen leksikon chronology materializes only reviewed exact anchors", () => {
  const index = buildEpokePlaceIndex();
  const chronologyMilestonesFor = (placeId) => Object.values(index.domains.historie.epochs)
    .flatMap((group) => group.places)
    .filter((place) => place.place_id === placeId)
    .flatMap((place) => place.milestones)
    .filter((milestone) => milestone.evidence_type === "leksikon_chronology");
  const yearsFor = (placeId) => [...new Set(chronologyMilestonesFor(placeId).map((milestone) => milestone.year))].sort((a, b) => a - b);

  assert.deepEqual(yearsFor("clemenskirken_ruin_oslo"), [1920, 1970, 2000]);
  assert.deepEqual(yearsFor("minneparken_gamlebyen"), [1932, 2024]);
  assert.deepEqual(yearsFor("saxegarden"), [1334, 1624]);
  assert.equal(chronologyMilestonesFor("clemenskirken_ruin_oslo").some((milestone) => milestone.year === 1135), false);
});

test("Eastern Gamlebyen chronology replaces approximate metadata with reviewed exact anchors", () => {
  const index = buildEpokePlaceIndex();
  const chronologyMilestonesFor = (placeId) => Object.values(index.domains.historie.epochs)
    .flatMap((group) => group.places)
    .filter((place) => place.place_id === placeId)
    .flatMap((place) => place.milestones)
    .filter((milestone) => milestone.evidence_type === "leksikon_chronology");
  const yearsFor = (placeId) => [...new Set(chronologyMilestonesFor(placeId).map((milestone) => milestone.year))].sort((a, b) => a - b);

  assert.deepEqual(yearsFor("gamlebyen_gravlund"), [1874, 1894, 1925, 1961]);
  assert.deepEqual(yearsFor("gamlebyen_kirke"), [1794, 1796, 1939]);
  assert.deepEqual(yearsFor("galgeberg"), [1197, 1240, 1745, 1934]);
  assert.equal(chronologyMilestonesFor("gamlebyen_gravlund").some((milestone) => milestone.year === 1880), false);
  assert.equal(chronologyMilestonesFor("galgeberg").some((milestone) => milestone.year === 1600), false);
});

test("Kampen and Klosterenga chronology materializes exact place-specific anchors only", () => {
  const index = buildEpokePlaceIndex();
  const chronologyMilestonesFor = (placeId) => Object.values(index.domains.historie.epochs)
    .flatMap((group) => group.places)
    .filter((place) => place.place_id === placeId)
    .flatMap((place) => place.milestones)
    .filter((milestone) => milestone.evidence_type === "leksikon_chronology");
  const yearsFor = (placeId) => [...new Set(chronologyMilestonesFor(placeId).map((milestone) => milestone.year))].sort((a, b) => a - b);

  assert.deepEqual(yearsFor("kampen_kirke"), [1880, 1882, 1913, 1942, 1975, 1987]);
  assert.deepEqual(yearsFor("kampen_park"), [1885, 1888, 1899, 1913, 1999, 2009]);
  assert.deepEqual(yearsFor("klosterenga_skulpturpark"), [1999, 2000, 2019, 2023]);
  assert.equal(chronologyMilestonesFor("kampen_kirke").some((milestone) => milestone.year === 1878), false);
  assert.equal(chronologyMilestonesFor("kampen_park").some((milestone) => milestone.year === 1886 || milestone.year === 1895), false);
  assert.equal(chronologyMilestonesFor("klosterenga_skulpturpark").some((milestone) => milestone.year === 1990), false);
});

test("Sagene and Torshov chronology materializes exact district and park events only", () => {
  const index = buildEpokePlaceIndex();
  const chronologyMilestonesFor = (placeId) => Object.values(index.domains.historie.epochs)
    .flatMap((group) => group.places)
    .filter((place) => place.place_id === placeId)
    .flatMap((place) => place.milestones)
    .filter((milestone) => milestone.evidence_type === "leksikon_chronology");
  const yearsFor = (placeId) => [...new Set(chronologyMilestonesFor(placeId).map((milestone) => milestone.year))].sort((a, b) => a - b);

  assert.deepEqual(yearsFor("sagene"), [1629, 1687, 1859]);
  assert.deepEqual(yearsFor("torshov"), [1878, 1916, 1917, 1930, 1958]);
  assert.deepEqual(yearsFor("torshovparken"), [1916, 1924, 1928, 1931, 1942, 2002]);
  assert.equal(chronologyMilestonesFor("sagene").some((milestone) => [1300, 1500, 1840, 1980].includes(milestone.year)), false);
  assert.equal(chronologyMilestonesFor("torshov").some((milestone) => milestone.year === 1925), false);
  assert.equal(chronologyMilestonesFor("torshovparken").some((milestone) => milestone.year === 1940), false);
});

test("Grorud chronology materializes exact district and park events only", () => {
  const index = buildEpokePlaceIndex();
  const chronologyMilestonesFor = (placeId) => Object.values(index.domains.historie.epochs)
    .flatMap((group) => group.places)
    .filter((place) => place.place_id === placeId)
    .flatMap((place) => place.milestones)
    .filter((milestone) => milestone.evidence_type === "leksikon_chronology");
  const yearsFor = (placeId) => [...new Set(chronologyMilestonesFor(placeId).map((milestone) => milestone.year))].sort((a, b) => a - b);

  assert.deepEqual(yearsFor("grorud"), [1595, 1831, 1846, 1854, 1862, 1867, 1897, 1900, 1902, 1917, 1918, 1947, 1966, 1972]);
  assert.deepEqual(yearsFor("grorudparken"), [2002, 2009, 2011, 2013]);
  assert.equal(chronologyMilestonesFor("grorud").some((milestone) => [1350, 1940, 1970].includes(milestone.year)), false);
  assert.equal(chronologyMilestonesFor("grorudparken").some((milestone) => [2010, 2012].includes(milestone.year)), false);
});

test("verified production claims fail closed for uncertainty, current-only state and non-Oslo places", () => {
  const index = buildEpokePlaceIndex();
  const productionClaimsFor = (placeId) => Object.values(index.domains.historie.epochs)
    .flatMap((group) => group.places)
    .filter((place) => place.place_id === placeId)
    .flatMap((place) => place.milestones)
    .filter((milestone) => milestone.evidence_type === "verified_place_production_claim");

  assert.ok(productionClaimsFor("bankplassen").some((milestone) => milestone.claim_id === "claim_bankplassen_first_bank_1828"));
  assert.equal(productionClaimsFor("gamle_aker_kirke").some((milestone) => milestone.claim_id === "claim_gak_dating_uncertain"), false);
  assert.equal(productionClaimsFor("bankplassen").some((milestone) => milestone.claim_id === "claim_bankplassen_current_bank_1986"), false);
  assert.equal(productionClaimsFor("lisbon_anjos70").length, 0);
  assert.equal(productionClaimsFor("frysja_miljostasjon").length, 0, "Rema 1000 is not a historical year");
  assert.equal(productionClaimsFor("gronmo_gjenvinningsstasjon").length, 0, "1279 Oslo is a postal code, not a historical year");
});

test("production year extraction rejects commercial names and Oslo postal codes", () => {
  assert.deepEqual(exactProductionClaimYears("Den står ved Rema 1000 Frysja."), []);
  assert.deepEqual(exactProductionClaimYears("Stedet ligger i Sørliveien 1, 1279 Oslo."), []);
  assert.deepEqual(exactProductionClaimYears("Tandbergs Radiofabrikk startet her i 1933."), [1933]);
});

test("explicit timeline anchors materialize reviewed multi-year historical claims", () => {
  const index = buildEpokePlaceIndex();
  const milestoneFor = (placeId, claimId) => Object.values(index.domains.historie.epochs)
    .flatMap((group) => group.places)
    .filter((place) => place.place_id === placeId)
    .flatMap((place) => place.milestones)
    .find((milestone) => milestone.claim_id === claimId);

  assert.equal(milestoneFor("bla_skilt_vebjorn_tandberg_kongens_gate_15", "claim_bla_skilt_vebjorn_tandberg_kongens_gate_15_context")?.year, 1933);
  assert.equal(milestoneFor("haraldrud_ombrukstelt", "claim_haraldrud_ombrukstelt_closed")?.year, 2026);
  assert.equal(milestoneFor("snublestein_benno_damelin_schonings_gate_14", "claim_snublestein_benno_damelin_schonings_gate_14_context")?.year, 1943);
  assert.equal(milestoneFor("snublestein_fanny_steinsapir_bjerregaards_gate_68", "claim_snublestein_fanny_steinsapir_bjerregaards_gate_68_context")?.year, 1942);
  assert.equal(milestoneFor("snublestein_harry_isidor_mendel_ullevalsveien_97", "claim_snublestein_harry_isidor_mendel_ullevalsveien_97_context")?.year, 1942);
  assert.equal(milestoneFor("snublestein_isak_kaplan_kirkegardsgata_2", "claim_snublestein_isak_kaplan_kirkegardsgata_2_context")?.year, 1943);
  assert.equal(milestoneFor("snublestein_rebekka_blatt_nordre_gate_13", "claim_snublestein_rebekka_blatt_nordre_gate_13_context")?.year, 1943);
  assert.equal(milestoneFor("snublestein_salomon_bogomolno_d_y_jens_bjelkes_gate_64", "claim_snublestein_salomon_bogomolno_d_y_jens_bjelkes_gate_64_context")?.year, 1942);
});

test("every epoch and parallel track has substantial canonical place coverage", () => {
  const index = buildEpokePlaceIndex();
  for (const [epochId, group] of Object.entries(index.domains.historie.epochs)) {
    assert.ok(group.placeCount >= 15, `${epochId} has insufficient place coverage`);
    assert.ok(group.milestoneCount >= 30, `${epochId} has insufficient milestone coverage`);
  }
  for (const [trackId, group] of Object.entries(index.domains.historie.parallel_tracks)) {
    assert.ok(group.placeCount >= 10, `${trackId} has insufficient cross-period place coverage`);
    assert.ok(group.milestoneCount >= 30, `${trackId} has insufficient cross-period milestone coverage`);
  }
  const modules = JSON.parse(fs.readFileSync("data/fag/historie/period_modules_historie_v1.json", "utf8"));
  const sourceById = new Map(modules.sources.map((source) => [source.source_id, source]));
  const placeIds = new Set(JSON.parse(fs.readFileSync("data/places/places_index.json", "utf8")).map((place) => place.id));
  assert.ok(modules.cases.every((periodCase) => placeIds.has(periodCase.place_id)));
  assert.ok(modules.cases.every((periodCase) => periodCase.source_ids.length >= 2 && periodCase.source_ids.every((id) => /^https?:\/\//.test(sourceById.get(id)?.url || ""))));
  assert.ok(modules.cases.some((periodCase) => periodCase.place_id === "lisbon_teatro_romano"), "Lisboa's canonical Roman Theatre case must remain in Fagverk coverage");
  const materializedCases = Object.values(index.domains.historie.epochs).flatMap((group) => group.places.flatMap((place) => (
    place.period_cases.map((periodCase) => ({ place_id: place.place_id, ...periodCase }))
  )));
  assert.ok(materializedCases.length >= modules.cases.length);
  assert.ok(materializedCases.every((periodCase) => !("year" in periodCase)), "undated Fagverk cases must not receive invented years");
  assert.ok(materializedCases.every((periodCase) => periodCase.sources.length >= 2 && periodCase.sources.every((source) => /^https?:\/\//.test(source.url))));
  assert.ok(materializedCases.some((periodCase) => periodCase.place_id === "lisbon_teatro_romano"));
});

test("epoch places expose existing source-inspectable people, works and stories without copying popup prose", () => {
  const index = buildEpokePlaceIndex();
  assert.ok(index.stats.connected_people_count >= 30);
  assert.ok(index.stats.connected_work_count >= 90);
  assert.ok(index.stats.connected_story_count >= 100);
  const uniquePlaces = [...new Map(Object.values(index.domains.historie.epochs).flatMap((group) => group.places).map((place) => [place.place_id, place])).values()];
  assert.ok(uniquePlaces.some((place) => place.connections.person_ids.length));
  assert.ok(uniquePlaces.some((place) => place.connections.works.length));
  assert.ok(uniquePlaces.some((place) => place.connections.stories.length));
  const peopleManifest = JSON.parse(fs.readFileSync("data/runtime/people-all.json", "utf8"));
  const canonicalPeopleIds = new Set(peopleManifest.files.flatMap((file) => (
    JSON.parse(fs.readFileSync(file, "utf8")).map((person) => person.id)
  )));
  assert.ok(uniquePlaces.every((place) => place.connections.person_ids.every((id) => canonicalPeopleIds.has(id))));
});

test("parallel tracks remain separate cross-period relations", () => {
  const index = buildEpokePlaceIndex();
  const history = JSON.parse(fs.readFileSync("data/epoker/epoker_historie.json", "utf8"));
  assert.deepEqual(
    Object.keys(index.domains.historie.parallel_tracks).sort(),
    history.parallel_epoker.map((track) => track.id).sort()
  );
  assert.ok(Object.values(index.domains.historie.parallel_tracks).some((track) => track.milestoneCount > 0));
  assert.equal(Object.keys(index.domains.historie.epochs).length, history.epoker.length);
});

test("every History epoch has distinct analysis grounded in its Fagverk periods", () => {
  const history = JSON.parse(fs.readFileSync("data/epoker/epoker_historie.json", "utf8"));
  const periodGuides = JSON.parse(fs.readFileSync("data/fag/historie/period_guides_historie_v1.json", "utf8"));
  const guideById = new Map(periodGuides.guides.map((guide) => [guide.period_id, guide]));
  const prose = new Set();
  for (const epoch of history.epoker) {
    const analysis = epoch.analysis;
    assert.ok(analysis, `${epoch.id} lacks analysis`);
    for (const field of ["what_changed", "what_continued", "power_and_conflict", "visible_traces"]) {
      assert.ok(String(analysis[field] || "").length >= 80, `${epoch.id}.${field} is too shallow`);
      const normalized = analysis[field].toLowerCase().replace(/[^a-zæøå0-9]+/g, " ").trim();
      assert.equal(prose.has(normalized), false, `${epoch.id}.${field} duplicates another epoch`);
      prose.add(normalized);
    }
    assert.ok(Array.isArray(analysis.guiding_questions) && analysis.guiding_questions.length >= 2);
    const linkedPeriods = new Set((epoch.fagverk_links || []).flatMap((link) => link.period_ids || []));
    assert.ok(analysis.basis_period_ids.every((periodId) => linkedPeriods.has(periodId)), `${epoch.id} has an unlinked analysis basis`);
    for (const periodId of linkedPeriods) {
      const guide = guideById.get(periodId);
      assert.ok(guide, `${epoch.id} references missing period guide ${periodId}`);
      assert.equal(guide.editorial_status, "complete");
      assert.ok(guide.sections.length >= 3 && guide.sections.flatMap((section) => section.paragraphs).length >= 6, `${periodId} lacks full overview prose`);
      assert.ok(guide.core_concepts.length >= 8);
    }
  }
});
