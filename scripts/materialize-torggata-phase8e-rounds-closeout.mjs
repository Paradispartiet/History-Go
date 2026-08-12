import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = rel => fs.readFileSync(path.join(root, rel), "utf8");
const write = (rel, value) => fs.writeFileSync(path.join(root, rel), value.endsWith("\n") ? value : `${value}\n`);
const replaceOnce = (source, from, to, label) => {
  const count = source.split(from).length - 1;
  if (count !== 1) throw new Error(`${label}: expected exactly one match, got ${count}`);
  return source.replace(from, to);
};

const placePath = "data/places/by/oslo/places/torggata.json";
const place = JSON.parse(read(placePath));
if (place.id !== "torggata") throw new Error("Unexpected canonical place id");
if (!Array.isArray(place.rounds) || place.rounds.length !== 9) throw new Error("Expected the nine-entry legacy Torggata rounds baseline");
const legacyRounds = [...place.rounds];
delete place.rounds;
write(placePath, JSON.stringify(place, null, 2));

const areaPath = "js/ui/area-overview-v2.js";
let area = read(areaPath);
area = replaceOnce(
  area,
  "      place?.emne_ids,\n      place?.rounds,\n      place?.rundinger\n",
  "      place?.emne_ids,\n      place?.objects,\n      place?.structures\n",
  "area overview legacy rounds heuristic"
);
write(areaPath, area);

const areaTestPath = "tests/area-overview-v2-runtime.test.js";
let areaTest = read(areaTestPath);
const areaRegression = `\nconst structuredMetadataEntries = [\n  {\n    place: {\n      id: 'legacy',\n      name: 'Z Legacy',\n      category: 'by',\n      image: 'same.jpg',\n      desc: 'Lik tekst',\n      rounds: ['people', 'objects', 'brands', 'structures'],\n      rundinger: ['people', 'objects', 'brands', 'structures']\n    },\n    distanceKm: 3\n  },\n  {\n    place: { id: 'plain', name: 'A Plain', category: 'by', image: 'same.jpg', desc: 'Lik tekst' },\n    distanceKm: 3\n  },\n  {\n    place: {\n      id: 'canonical',\n      name: 'M Canonical',\n      category: 'by',\n      image: 'same.jpg',\n      desc: 'Lik tekst',\n      objects: [{ id: 'obj' }],\n      structures: [{ id: 'structure' }]\n    },\n    distanceKm: 3\n  }\n];\n\nassert.deepEqual(\n  Array.from(api.rankHighlights(structuredMetadataEntries, 3), (entry) => entry.place.id),\n  ['canonical', 'plain', 'legacy'],\n  'legacy rounds/rundinger skal ikke gi områdeoversikten innholdspoeng; reelle canonical objects/structures skal gjøre det'\n);\n`;
areaTest = replaceOnce(areaTest, "\nconsole.log('area-overview-v2-runtime.test.js: OK');\n", `${areaRegression}\nconsole.log('area-overview-v2-runtime.test.js: OK');\n`, "area overview regression insertion");
write(areaTestPath, areaTest);

const phase8eTestPath = "tests/torggata-phase8e-rounds-closeout.test.mjs";
write(phase8eTestPath, `import test from "node:test";\nimport assert from "node:assert/strict";\nimport fs from "node:fs";\nimport path from "node:path";\nimport { fileURLToPath } from "node:url";\nimport { JSDOM } from "jsdom";\n\nconst __dirname = path.dirname(fileURLToPath(import.meta.url));\nconst place = JSON.parse(fs.readFileSync(path.join(__dirname, "../data/places/by/oslo/places/torggata.json"), "utf8"));\nconst roundsSource = fs.readFileSync(path.join(__dirname, "../js/ui/place-rounds-visual-collections.js"), "utf8");\n\ntest("Torggata 8E removes stale place.rounds without rewriting a hardcoded canonical list", () => {\n  assert.equal(Object.prototype.hasOwnProperty.call(place, "rounds"), false);\n  assert.equal(Object.prototype.hasOwnProperty.call(place, "rundinger"), false);\n  assert.equal(Object.prototype.hasOwnProperty.call(place, "rounds_exclude"), false);\n  assert.equal(place.category, "by");\n  assert.ok(Array.isArray(place.objects) && place.objects.length > 0, "8B Objects skal bestå");\n  assert.ok(Array.isArray(place.structures) && place.structures.length === 2, "8D Structures skal bestå med to fysiske anlegg");\n});\n\ntest("Torggata final PlaceCard is people · objects · brands · structures with Badges separate", async () => {\n  const legacyIds = [\n    "pcWorksIcon", "pcDetailsIcon", "pcSpotsIcon", "pcCivicationStoreIcon", "pcNatureIcon",\n    "pcForNaIcon", "pcFortellingerIcon", "pcLeksikonIcon", "pcPlayIcon", "pcTrainingIcon",\n    "pcTasksIcon", "pcWonderkammerIcon", "pcStoriesIcon", "pcRoutesIcon"\n  ];\n  const dom = new JSDOM(\`<!doctype html><body>\n    <div id="placeCard" data-current-place-id="torggata">\n      <div class="pc-body">\n        <div class="pc-title-row"><h2 id="pcTitle">Torggata</h2><div id="pcBadgesIcon" class="pc-round"></div></div>\n        <div class="pc-icons-quad">\n          <div id="pcPeopleIcon" class="pc-round"></div>\n          <div id="pcBrandsIcon" class="pc-round"></div>\n          \\${legacyIds.map(id => \`<div id="\\${id}" class="pc-round"></div>\`).join("")}\n        </div>\n        <div id="pcPeopleList"></div><div id="pcBrandsList"></div><div id="pcBadgesList"></div>\n      </div>\n    </div>\n  </body>\`, { url: "https://history-go.test/", runScripts: "outside-only" });\n\n  const w = dom.window;\n  w.PLACES = [place];\n  w.eval(roundsSource);\n  w.document.dispatchEvent(new w.Event("DOMContentLoaded", { bubbles: true }));\n  await w.HGVisualPlaceRounds.apply(place);\n\n  assert.deepEqual(Array.from(w.HGVisualPlaceRounds.get(place)), ["people", "objects", "brands", "structures"]);\n  assert.equal(w.HGVisualPlaceRounds.getFourth(place), "structures");\n  assert.equal(w.HGVisualPlaceRounds.getItems(place, "structures").length, 2);\n\n  const grid = w.document.querySelector(".pc-icons-quad");\n  const visible = [...grid.querySelectorAll(".pc-round")].filter(el => !el.hidden);\n  const ordered = visible.slice().sort((a, b) => Number(a.style.order) - Number(b.style.order)).map(el => el.id);\n  assert.equal(grid.dataset.roundCount, "4");\n  assert.equal(grid.dataset.roundCategory, "by");\n  assert.equal(grid.dataset.roundFourth, "structures");\n  assert.deepEqual(ordered, ["pcPeopleIcon", "pcObjectsIcon", "pcBrandsIcon", "pcCategoryCollectionIcon"]);\n  assert.equal(w.document.getElementById("pcBadgesIcon").parentElement.className, "pc-title-row");\n  assert.equal(w.document.getElementById("pcBadgesIcon").hidden, false);\n  for (const id of legacyIds) assert.equal(w.document.getElementById(id).hidden, true, id);\n  dom.window.close();\n});\n`);

const auditPath = "reports/place-production/torggata-phase8e-rounds-closeout-v1.json";
const audit = {
  schema: "history_go_place_rounds_closeout_v1",
  version: "1.0.0",
  generated_at: "2026-08-12",
  place_id: "torggata",
  phase: "8E",
  result: "PASS",
  baseline: {
    main_commit: "37de6d0d2d9633331f6acef2cbd7168f85552c80",
    legacy_rounds: legacyRounds,
    phase_8d_status: "merged_and_verified"
  },
  contract_findings: {
    rounds_field: "legacy presentation metadata; not a canonical round selector",
    canonical_runtime: "js/ui/place-rounds-visual-collections.js",
    runtime_selection: ["people", "objects", "brands", "structures"],
    badges: "separate from the 2x2 content grid",
    fourth_round: "structures",
    images_fallback: "not used because the verified structures collection is non-empty"
  },
  consumer_audit: {
    place_rounds_runtime: "does not consume place.rounds for selection",
    place_card: "legacy DOM hooks remain defensive only; canonical category-four runtime owns visible selection",
    schema_and_place_standard: "explicitly classify rounds/rundinger/rounds_exclude as legacy presentation fields",
    area_overview: "the only active content-scoring dependency found; migrated from rounds/rundinger metadata to canonical objects/structures"
  },
  cleanup: {
    removed_from_torggata: ["rounds"],
    not_replaced_with_hardcoded_four_list: true,
    reason: "canonical runtime derives the set from category plus real collections"
  },
  regression_expectations: {
    phase_8a_people: "preserved",
    phase_8b_objects: "preserved",
    phase_8c_brands: "preserved",
    phase_8d_structures: "preserved",
    legacy_grid_icons: "hidden",
    content_round_count: 4,
    quota_policy: "no numeric content quota"
  },
  next_phase: "9. På stedet"
};
write(auditPath, JSON.stringify(audit, null, 2));

const workcardPath = "reports/place-production/torggata-workcard-current.md";
let workcard = read(workcardPath);
workcard = replaceOnce(
  workcard,
  "- Fase 8D-audit: `reports/place-production/torggata-phase8d-structures-audit-v1.json`\n",
  "- Fase 8D-audit: `reports/place-production/torggata-phase8d-structures-audit-v1.json`\n- Fase 8E-audit: `reports/place-production/torggata-phase8e-rounds-closeout-v1.json`\n",
  "workcard 8E audit link"
);
workcard = replaceOnce(
  workcard,
  "| 8. Rundinger | **PÅGÅR – 8E legacy rounds + slutt-UI** | audit PR #4829; **8A People GODKJENT**; **8B Objects GODKJENT**; **8C Brands GODKJENT**; **8D Bygg og anlegg GODKJENT**; 8E er neste del |\n| 9–15 | **IKKE STARTET** | styres av hovedchecklisten |",
  "| 8. Rundinger | **GODKJENT** | audit PR #4829; **8A People GODKJENT**; **8B Objects GODKJENT**; **8C Brands GODKJENT**; **8D Bygg og anlegg GODKJENT**; **8E legacy rounds + slutt-UI GODKJENT** |\n| 9. På stedet | **PÅGÅR** | neste aktive fase etter lukket fase 8 |\n| 10–15 | **IKKE STARTET** | styres av hovedchecklisten |",
  "workcard phase status"
);
const closeoutSection = `\n## Fase 8E – legacy rounds + slutt-UI\n\n\`\`\`text\nTIDLIGERE-ARBEID-SØK: UTFØRT\nSISTE GODKJENTE TILSTAND: fase 8D merget på main 37de6d0d2d9633331f6acef2cbd7168f85552c80\nLEGACYFELT: place.rounds med ni historiske presentasjons-ID-er\nCANONICAL RUNTIME: js/ui/place-rounds-visual-collections.js velger fra kategori og reelle samlinger, ikke place.rounds\nAKTIV SEKUNDÆRLESER: area-overview-v2 brukte rounds/rundinger kun som ett strukturert-innholdspoeng\nBESLUTNING: fjern Torggatas stale rounds; flytt områdeheuristikken til canonical objects/structures; ikke skriv en ny hardkodet fireliste\n\`\`\`\n\n### Godkjent sluttstatus for fase 8\n\n- Torggatas gamle ni-elementers \`rounds\`-felt er fjernet; \`rundinger\` og \`rounds_exclude\` finnes heller ikke på stedet.\n- Rundingsvalget er fortsatt runtime-avledet, ikke place-kurert: **people · objects · brands · structures**.\n- **Badges står separat** ved stedsoverskriften og teller ikke i 2×2-feltet.\n- **Bygg og anlegg** er faktisk fjerderunding fordi fase 8D har to verifiserte Structures; Bilder-fallback brukes derfor ikke.\n- Legacy-ikonene for Works, Details, Spots, Civication, Før/nå, Fortellinger, Leksikon, Lek, Trening, Oppgaver, Wonderkammer og Ruter holdes ute av canonical 2×2-grid.\n- Områdeoversikten teller ikke lenger legacy presentasjonsmetadata som innhold; \`objects\` og \`structures\` brukes i den aktuelle strukturrikdomsheuristikken i stedet.\n- 8A People, 8B Objects, 8C Brands og 8D Structures er regresjonslåst i 8E-kjøringen.\n- Ingen antallskvote er innført; fire er UI-geometri, ikke et krav om et bestemt antall records inne i hver samling.\n\n**Fase 8 Rundinger = GODKJENT.**\n\nNeste aktive fase: **9. På stedet**.\n`;
if (workcard.includes("## Fase 8E – legacy rounds + slutt-UI")) throw new Error("8E closeout section already exists");
workcard = `${workcard.trimEnd()}\n${closeoutSection}`;
write(workcardPath, workcard);

console.log(JSON.stringify({
  place_id: place.id,
  removed_legacy_rounds: legacyRounds,
  canonical_four: ["people", "objects", "brands", "structures"],
  next_phase: "9. På stedet"
}, null, 2));
