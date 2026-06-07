// tools/audit-visual-design-codes.mjs
//
// Audit av det felles visual designCode-systemet (data/visualDesignCodes.json)
// mot place-, people- og artikkel-/story-/leksikon-/lesespor-data.
//
// Speiler resolver-logikken i js/visualDesignCodes.js (uten DOM/fetch), så
// rapporten viser hvordan entiteter faktisk ville løst designCode i appen.
// Endrer ingen datafiler.
//
// Kjør:  node tools/audit-visual-design-codes.mjs
//
// Skriver:
//   reports/visual-design-codes-audit.json
//   reports/visual-design-codes-audit.md

import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const ROOT = process.cwd();
const DATA = path.join(ROOT, "data");
const REGISTRY = path.join(DATA, "visualDesignCodes.json");
const REPORTS_DIR = path.join(ROOT, "reports");

function readJSON(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function tryReadJSON(file) {
  try { return readJSON(file); } catch { return null; }
}

const lc = (v) => String(v == null ? "" : v).trim().toLowerCase();

function haystack(parts) {
  const out = [];
  for (const p of parts) {
    if (p == null) continue;
    if (Array.isArray(p)) out.push(p.map(lc).join(" "));
    else out.push(lc(p));
  }
  return out.join(" ").trim();
}

// ---------------------------------------------------------------------------
// Resolver-logikk – speiler js/visualDesignCodes.js.
// ---------------------------------------------------------------------------

const DEFAULTS = {
  place: "default_miniature",
  person: "person_default_miniature",
  article: "article_default_miniature"
};

const PLACE_ASSET_TO_CODE = {
  stadium: "stadium_miniature", arena: "stadium_miniature",
  sports_field: "sports_field_miniature", ice_arena: "ice_arena_miniature",
  museum: "museum_miniature", gallery: "gallery_miniature",
  theatre: "theatre_miniature", theater: "theatre_miniature",
  music_venue: "music_venue_miniature", venue: "music_venue_miniature",
  cinema: "cinema_miniature", library: "library_miniature",
  church: "church_miniature", school: "school_miniature",
  university: "university_miniature", station: "station_miniature",
  park: "park_miniature", playground: "playground_miniature",
  square: "square_miniature", street: "street_miniature",
  fortress: "fortress_miniature", civic: "civic_miniature",
  waterfront: "waterfront_miniature", harbor: "waterfront_miniature",
  industrial: "industrial_miniature", warehouse: "industrial_miniature",
  commerce: "commerce_miniature", shop: "commerce_miniature",
  apartment: "apartment_block_miniature", apartment_block: "apartment_block_miniature",
  subculture: "subculture_miniature", skyline: "apartment_block_miniature",
  default: "default_miniature"
};

const PLACE_CATEGORY_TO_CODE = {
  sport: "sports_field_miniature", kunst: "museum_miniature",
  litteratur: "library_miniature", musikk: "music_venue_miniature",
  film: "cinema_miniature", film_tv: "cinema_miniature",
  popkultur: "music_venue_miniature", populaerkultur: "music_venue_miniature",
  subkultur: "subculture_miniature", natur: "park_miniature",
  politikk: "civic_miniature", media: "civic_miniature",
  vitenskap: "university_miniature", psykologi: "university_miniature",
  naeringsliv: "commerce_miniature", by: "apartment_block_miniature"
};

const PLACE_KEYWORD_RULES = [
  [/ishall|ishockey|isbane|kunstisbane|skøytehall|skoytehall|amfi/, "ice_arena_miniature"],
  [/stadion|stadium|arena/, "stadium_miniature"],
  [/lekeplass|playground|sandlek/, "playground_miniature"],
  [/museum|museet/, "museum_miniature"],
  [/galleri|gallery|kunsthall/, "gallery_miniature"],
  [/bibliotek|library|deichman/, "library_miniature"],
  [/kino|cinema|filmteater/, "cinema_miniature"],
  [/teater|theatre|theater|revyscene|revy/, "theatre_miniature"],
  [/kirke|kapell|domkirke|katedral|church|moske|synagoge/, "church_miniature"],
  [/universitet|hogskole|høgskole|university|fakultet|campus/, "university_miniature"],
  [/skole|gymnas|videregaende|videregående|school/, "school_miniature"],
  [/stasjon|t-bane|jernbane|holdeplass|station|terminal|metro/, "station_miniature"],
  [/festning|slott|borg|skanse|fortress|fort\b/, "fortress_miniature"],
  [/brygge|havn|kai|fjord|vann|dam|tjern|elv|strand|waterfront|marina/, "waterfront_miniature"],
  [/park|hage|skog|lund|mark|allmenning|grøntdrag/, "park_miniature"],
  [/torg|plass\b|square/, "square_miniature"],
  [/fabrikk|lager|industri|verksted|verk\b|mølle|mølla|depot|warehouse/, "industrial_miniature"],
  [/butikk|marked|kjopesenter|kjøpesenter|handel|shop|mall|basar/, "commerce_miniature"],
  [/scene|konsert|musikkklubb|spellemann|rockefeller|spektrum|venue/, "music_venue_miniature"],
  [/gate\b|veien|allé|alle\b|street/, "street_miniature"]
];

const PERSON_KEYWORD_RULES = [
  [/footballer|fotball|football|spiss|keeper|midtbane|landslag/, "person_footballer_miniature"],
  [/runner|løper|loper|friidrett|athletics|sprint|maraton/, "person_runner_miniature"],
  [/skier|skiløper|skiloper|langrenn|alpint|hopp|ski\b/, "person_skier_miniature"],
  [/athlete|idrett|sport|utøver|utover/, "person_athlete_miniature"],
  [/poet|lyrik|dikter/, "person_poet_miniature"],
  [/writer|forfatter|author|roman|novell/, "person_writer_miniature"],
  [/musician|musiker|komponist|composer|band|sanger|vokalist/, "person_musician_miniature"],
  [/director|regissør|regissor|filmskaper|instruktør|instruktor/, "person_director_miniature"],
  [/actor|skuespiller|actress|performer/, "person_actor_miniature"],
  [/artist|kunstner|maler|billedhugger|painter|sculptor/, "person_artist_miniature"],
  [/politician|politiker|statsminister|minister|ordfører|ordforer|parlament/, "person_politician_miniature"],
  [/activist|aktivist|forkjemper|bevegelse/, "person_activist_miniature"],
  [/scientist|forsker|vitenskap|professor|nobel/, "person_scientist_miniature"],
  [/teacher|lærer|larer|pedagog|underviser/, "person_teacher_miniature"],
  [/explorer|polfarer|oppdager|ekspedisjon|eventyrer/, "person_explorer_miniature"],
  [/local legend|lokal|nabolag|byoriginal/, "person_local_legend_miniature"]
];

const PERSON_CATEGORY_TO_CODE = {
  sport: "person_athlete_miniature", litteratur: "person_writer_miniature",
  kunst: "person_artist_miniature", musikk: "person_musician_miniature",
  popkultur: "person_musician_miniature", populaerkultur: "person_musician_miniature",
  film: "person_actor_miniature", film_tv: "person_actor_miniature",
  politikk: "person_politician_miniature", media: "person_activist_miniature",
  vitenskap: "person_scientist_miniature", psykologi: "person_scientist_miniature",
  historie: "person_historical_miniature", natur: "person_explorer_miniature",
  subkultur: "person_local_legend_miniature"
};

const ARTICLE_KEYWORD_RULES = [
  [/groundhopper|stadion|stadium|arena|fotball|football|tribune/, "article_groundhopper_miniature"],
  [/sport|idrett|friidrett|løp|skøyte/, "article_sports_history_miniature"],
  [/musikk|music|konsert|band|plate/, "article_music_history_miniature"],
  [/litteratur|literature|essay|roman|dikt|bok\b|forfatter/, "article_literature_miniature"],
  [/arkitektur|architecture|bygning|byggekunst/, "article_architecture_miniature"],
  [/kunst|art\b|maleri|galleri|skulptur/, "article_art_miniature"],
  [/politikk|politic|valg|parti|demokrati/, "article_political_history_miniature"],
  [/wonderkammer|wonder|aha|kuriosa|cabinet/, "article_wonderkammer_miniature"],
  [/objekt|object|gjenstand|artefakt|artifact/, "article_object_story_miniature"],
  [/sprak|språk|language|dialekt|etymolog/, "article_language_miniature"],
  [/portrett|portrait|biografi|person/, "article_people_portrait_miniature"],
  [/lokal|nabolag|local story|strøk|strok/, "article_local_story_miniature"],
  [/sted|place|essay/, "article_place_essay_miniature"],
  [/histor/, "article_history_miniature"]
];

const ARTICLE_CATEGORY_TO_CODE = {
  historie: "article_history_miniature", sport: "article_sports_history_miniature",
  musikk: "article_music_history_miniature", litteratur: "article_literature_miniature",
  kunst: "article_art_miniature", arkitektur: "article_architecture_miniature",
  politikk: "article_political_history_miniature", sprak: "article_language_miniature",
  "språk": "article_language_miniature", by: "article_local_story_miniature",
  natur: "article_place_essay_miniature"
};

function explicitCode(obj) {
  if (!obj) return null;
  let v = obj.visual && obj.visual.designCode;
  if (v == null && obj.designCode != null) v = obj.designCode;
  if (v == null) return null;
  const s = String(v).trim();
  return s || null;
}

function makeResolvers(validCodes) {
  const isValid = (c) => validCodes.has(c);

  function resolveForPlace(place) {
    const explicit = explicitCode(place);
    if (explicit) return { designCode: explicit, source: "explicit", valid: isValid(explicit) };

    const cm = place.civiMap || {};
    const assetType = lc(cm.assetType || place.mapAssetType || place.assetType || "");
    if (assetType && PLACE_ASSET_TO_CODE[assetType]) {
      return { designCode: PLACE_ASSET_TO_CODE[assetType], source: "assetType", valid: true };
    }
    const qp = place.quiz_profile || {};
    const hay = haystack([place.id, place.name, place.title, qp.place_type, qp.subtype, assetType]);
    for (const [re, code] of PLACE_KEYWORD_RULES) {
      if (re.test(hay)) return { designCode: code, source: "heuristic", valid: true };
    }
    const cat = lc(place.category);
    if (cat && PLACE_CATEGORY_TO_CODE[cat]) {
      if (cat === "sport") {
        if (/jordal|ishall|amfi/.test(hay)) return { designCode: "ice_arena_miniature", source: "category", valid: true };
        if (/stadion|arena/.test(hay)) return { designCode: "stadium_miniature", source: "category", valid: true };
      }
      return { designCode: PLACE_CATEGORY_TO_CODE[cat], source: "category", valid: true };
    }
    const ptype = lc(qp.place_type);
    if (/park/.test(ptype)) return { designCode: "park_miniature", source: "heuristic", valid: true };
    if (/kirke/.test(ptype)) return { designCode: "church_miniature", source: "heuristic", valid: true };
    if (/museum/.test(ptype)) return { designCode: "museum_miniature", source: "heuristic", valid: true };
    if (/stadion/.test(ptype)) return { designCode: "stadium_miniature", source: "heuristic", valid: true };
    return { designCode: DEFAULTS.place, source: "default", valid: true };
  }

  function resolveForPerson(person) {
    const explicit = explicitCode(person);
    if (explicit) return { designCode: explicit, source: "explicit", valid: isValid(explicit) };
    const hay = haystack([person.role, person.profession, person.sport, person.tags,
      person.id, person.name, person.title, person.desc]);
    for (const [re, code] of PERSON_KEYWORD_RULES) {
      if (re.test(hay)) return { designCode: code, source: "heuristic", valid: true };
    }
    const cat = lc(person.category);
    if (cat && PERSON_CATEGORY_TO_CODE[cat]) return { designCode: PERSON_CATEGORY_TO_CODE[cat], source: "category", valid: true };
    return { designCode: DEFAULTS.person, source: "default", valid: true };
  }

  function resolveForArticle(article) {
    const explicit = explicitCode(article);
    if (explicit) return { designCode: explicit, source: "explicit", valid: isValid(explicit) };
    const hay = haystack([article.type, article.topic, article.category, article.tags,
      article.themes, article.title, article.id, article.subject]);
    for (const [re, code] of ARTICLE_KEYWORD_RULES) {
      if (re.test(hay)) return { designCode: code, source: "heuristic", valid: true };
    }
    const cat = lc(article.category);
    if (cat && ARTICLE_CATEGORY_TO_CODE[cat]) return { designCode: ARTICLE_CATEGORY_TO_CODE[cat], source: "category", valid: true };
    return { designCode: DEFAULTS.article, source: "default", valid: true };
  }

  return { resolveForPlace, resolveForPerson, resolveForArticle };
}

// ---------------------------------------------------------------------------
// Datalasting.
// ---------------------------------------------------------------------------

function entriesFromFileData(data) {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.places)) return data.places;
  if (data && Array.isArray(data.people)) return data.people;
  if (data && Array.isArray(data.items)) return data.items;
  if (data && Array.isArray(data.articles)) return data.articles;
  if (data && Array.isArray(data.entries)) return data.entries;
  return [];
}

// Manifestfiler bruker ulike konvensjoner for relative stier.
function resolveManifestFile(rel, baseDir) {
  const cleaned = String(rel || "").trim();
  if (!cleaned) return null;
  // Noen manifester (leksikon) prefikser med "data/".
  const candidates = [
    path.join(ROOT, cleaned),
    path.join(DATA, cleaned),
    path.join(baseDir, cleaned)
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  return null;
}

function loadFromManifest(manifestPath, baseDir) {
  const manifest = tryReadJSON(manifestPath);
  if (!manifest || !Array.isArray(manifest.files)) return [];
  const seen = new Set();
  const out = [];
  for (const rel of manifest.files) {
    const file = resolveManifestFile(rel, baseDir);
    if (!file) continue;
    const data = tryReadJSON(file);
    if (!data) continue;
    for (const e of entriesFromFileData(data)) {
      if (!e || typeof e !== "object") continue;
      const key = e.id || e.title || JSON.stringify(e).slice(0, 64);
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(e);
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// Audit.
// ---------------------------------------------------------------------------

function tallyResolved(entries, resolveFn, usage) {
  const counts = { explicit: 0, assetType: 0, category: 0, heuristic: 0, default: 0 };
  let withExplicit = 0;
  const invalidExplicit = [];
  // Eksplisitt (pilot-merket) bruk per designCode for denne entitetstypen.
  const explicitByCode = {};
  for (const e of entries) {
    const r = resolveFn(e);
    counts[r.source] = (counts[r.source] || 0) + 1;
    if (r.source === "explicit") {
      withExplicit++;
      explicitByCode[r.designCode] = (explicitByCode[r.designCode] || 0) + 1;
      if (!r.valid) invalidExplicit.push({ id: e.id || e.title || "(unknown)", designCode: r.designCode });
    }
    usage[r.designCode] = (usage[r.designCode] || 0) + 1;
  }
  return { counts, withExplicit, invalidExplicit, explicitByCode };
}

function main() {
  const registry = readJSON(REGISTRY);
  const codes = registry.codes || {};
  const codeIds = Object.keys(codes);
  const validCodes = new Set(codeIds);
  const { resolveForPlace, resolveForPerson, resolveForArticle } = makeResolvers(validCodes);

  // designCodes per entityType + manglende renderHints.
  const byEntityType = {};
  const missingRenderHints = [];
  for (const id of codeIds) {
    const c = codes[id];
    for (const t of (c.entityTypes || [])) byEntityType[t] = (byEntityType[t] || 0) + 1;
    const rh = c.renderHints || {};
    const missing = ["threeType", "canvasType", "cardType", "iconType"].filter((k) => !rh[k]);
    if (missing.length) missingRenderHints.push({ id, missing });
  }

  // Last data.
  const places = loadFromManifest(path.join(DATA, "places", "manifest.json"), path.join(DATA, "places"));
  const people = loadFromManifest(path.join(DATA, "people", "manifest.json"), path.join(DATA, "people"));
  const leksikon = loadFromManifest(path.join(DATA, "leksikon", "manifest.json"), path.join(DATA, "leksikon"));
  const lesespor = loadFromManifest(path.join(DATA, "lesespor", "manifest.json"), path.join(DATA, "lesespor"));

  const usage = {};
  const placeStats = tallyResolved(places, resolveForPlace, usage);
  const peopleStats = tallyResolved(people, resolveForPerson, usage);
  // Artikkel-familien dekker leksikon + lesespor.
  const articleEntries = leksikon.concat(lesespor);
  const articleStats = tallyResolved(articleEntries, resolveForArticle, usage);

  const totalExplicit = placeStats.withExplicit + peopleStats.withExplicit + articleStats.withExplicit;
  const sumSource = (key) => placeStats.counts[key] + peopleStats.counts[key] + articleStats.counts[key];

  // Topp brukte designCodes.
  const topUsed = Object.entries(usage).sort((a, b) => b[1] - a[1]).slice(0, 15)
    .map(([code, count]) => ({ code, count }));

  // designCodes uten bruk.
  const unused = codeIds.filter((id) => !usage[id]);

  const invalidExplicit = []
    .concat(placeStats.invalidExplicit.map((x) => ({ ...x, entityType: "place" })))
    .concat(peopleStats.invalidExplicit.map((x) => ({ ...x, entityType: "person" })))
    .concat(articleStats.invalidExplicit.map((x) => ({ ...x, entityType: "article" })));

  const report = {
    schema: "history-go.visual-design-codes-audit.v1",
    generatedAt: new Date().toISOString(),
    registry: {
      totalCodes: codeIds.length,
      byEntityType,
      missingRenderHints
    },
    data: {
      places: places.length,
      people: people.length,
      leksikon: leksikon.length,
      lesespor: lesespor.length,
      articlesTotal: articleEntries.length
    },
    resolution: {
      explicit: totalExplicit,
      bySource: {
        explicit: sumSource("explicit"),
        assetType: sumSource("assetType"),
        category: sumSource("category"),
        heuristic: sumSource("heuristic"),
        default: sumSource("default")
      },
      places: placeStats.counts,
      people: peopleStats.counts,
      articles: articleStats.counts
    },
    explicitDesignCodes: {
      places: placeStats.explicitByCode,
      people: peopleStats.explicitByCode,
      articles: articleStats.explicitByCode
    },
    topUsedDesignCodes: topUsed,
    unusedDesignCodes: unused,
    invalidExplicitDesignCodes: invalidExplicit,
    pilotBatch2: {
      baselineExplicit: 73,
      baselineByEntityType: { places: 28, people: 30, articles: 15 },
      addedExplicit: Math.max(0, totalExplicit - 73),
      addedByEntityType: {
        places: Math.max(0, placeStats.withExplicit - 28),
        people: Math.max(0, peopleStats.withExplicit - 30),
        articles: Math.max(0, articleStats.withExplicit - 15)
      },
      scope: "Kontrollert Pilot batch 2: høy nytte for sentrale kartsteder, stedskoblede people og kunnskapslagartikler."
    }
  };

  if (!fs.existsSync(REPORTS_DIR)) fs.mkdirSync(REPORTS_DIR, { recursive: true });
  fs.writeFileSync(path.join(REPORTS_DIR, "visual-design-codes-audit.json"), JSON.stringify(report, null, 2) + "\n");
  fs.writeFileSync(path.join(REPORTS_DIR, "visual-design-codes-audit.md"), toMarkdown(report));

  // Konsoll-sammendrag.
  console.log("Visual design codes audit");
  console.log(`  designCodes totalt:        ${report.registry.totalCodes}`);
  console.log(`  per entityType:            ${JSON.stringify(byEntityType)}`);
  console.log(`  places funnet:             ${report.data.places}`);
  console.log(`  people funnet:             ${report.data.people}`);
  console.log(`  artikler (lks+lsp):        ${report.data.articlesTotal} (leksikon ${report.data.leksikon}, lesespor ${report.data.lesespor})`);
  console.log(`  eksplisitt designCode:     ${totalExplicit}`);
  console.log(`  via assetType:             ${report.resolution.bySource.assetType}`);
  console.log(`  via category:              ${report.resolution.bySource.category}`);
  console.log(`  via heuristic:             ${report.resolution.bySource.heuristic}`);
  console.log(`  via default:               ${report.resolution.bySource.default}`);
  console.log(`  invalid eksplisitte:       ${invalidExplicit.length}`);
  console.log(`  manglende renderHints:     ${missingRenderHints.length}`);
  console.log(`  designCodes uten bruk:     ${unused.length}`);
  console.log("Skrev reports/visual-design-codes-audit.json og .md");

  if (invalidExplicit.length || missingRenderHints.length) {
    process.exitCode = 1;
  }
}

function toMarkdown(r) {
  const lines = [];
  lines.push("# Visual design codes – audit");
  lines.push("");
  lines.push(`Generert: ${r.generatedAt}`);
  lines.push("");
  lines.push("## Register");
  lines.push("");
  lines.push(`- designCodes totalt: **${r.registry.totalCodes}**`);
  lines.push("- per entityType:");
  for (const [t, n] of Object.entries(r.registry.byEntityType)) lines.push(`  - ${t}: ${n}`);
  lines.push("");
  lines.push("## Data funnet");
  lines.push("");
  lines.push(`- places: ${r.data.places}`);
  lines.push(`- people: ${r.data.people}`);
  lines.push(`- leksikon: ${r.data.leksikon}`);
  lines.push(`- lesespor: ${r.data.lesespor}`);
  lines.push(`- artikler totalt (leksikon + lesespor): ${r.data.articlesTotal}`);
  lines.push("");
  lines.push("## Resolusjon");
  lines.push("");
  lines.push(`- eksplisitt \`visual.designCode\`: ${r.resolution.explicit}`);
  lines.push("- per kilde (alle entiteter):");
  for (const [k, v] of Object.entries(r.resolution.bySource)) lines.push(`  - ${k}: ${v}`);
  lines.push("");
  lines.push("| entityType | explicit | assetType | category | heuristic | default |");
  lines.push("| --- | --- | --- | --- | --- | --- |");
  const row = (name, c) => `| ${name} | ${c.explicit || 0} | ${c.assetType || 0} | ${c.category || 0} | ${c.heuristic || 0} | ${c.default || 0} |`;
  lines.push(row("places", r.resolution.places));
  lines.push(row("people", r.resolution.people));
  lines.push(row("articles", r.resolution.articles));
  lines.push("");
  lines.push("## Eksplisitt pilot-merkede designCodes");
  lines.push("");
  const ex = r.explicitDesignCodes || {};
  const exEntityLabels = [["places", ex.places], ["people", ex.people], ["articles", ex.articles]];
  let anyExplicit = false;
  for (const [label, byCode] of exEntityLabels) {
    const codes = Object.entries(byCode || {}).sort((a, b) => b[1] - a[1]);
    if (!codes.length) continue;
    anyExplicit = true;
    const total = codes.reduce((s, [, n]) => s + n, 0);
    lines.push(`- ${label} (${total}):`);
    for (const [code, count] of codes) lines.push(`  - \`${code}\`: ${count}`);
  }
  if (!anyExplicit) lines.push("- (ingen)");
  lines.push("");
  const pb2 = r.pilotBatch2;
  if (pb2) {
    lines.push("## Pilot batch 2");
    lines.push("");
    lines.push(`- Batch 1-baseline: ${pb2.baselineExplicit} eksplisitte \`visual.designCode\` (${pb2.baselineByEntityType.places} places, ${pb2.baselineByEntityType.people} people, ${pb2.baselineByEntityType.articles} articles).`);
    lines.push(`- Nåværende total etter batch 2: ${r.resolution.explicit} eksplisitte \`visual.designCode\`.`);
    lines.push(`- Netto økning etter batch 1: ${pb2.addedExplicit} (${pb2.addedByEntityType.places} places, ${pb2.addedByEntityType.people} people, ${pb2.addedByEntityType.articles} articles).`);
    lines.push(`- Omfang: ${pb2.scope}`);
    lines.push("");
  }
  lines.push("## Topp brukte designCodes");
  lines.push("");
  for (const { code, count } of r.topUsedDesignCodes) lines.push(`- \`${code}\`: ${count}`);
  lines.push("");
  lines.push("## designCodes uten bruk");
  lines.push("");
  if (!r.unusedDesignCodes.length) lines.push("- (ingen)");
  else for (const c of r.unusedDesignCodes) lines.push(`- \`${c}\``);
  lines.push("");
  lines.push("## Invalid eksplisitte designCodes");
  lines.push("");
  if (!r.invalidExplicitDesignCodes.length) lines.push("- (ingen)");
  else for (const x of r.invalidExplicitDesignCodes) lines.push(`- ${x.entityType} \`${x.id}\` → \`${x.designCode}\``);
  lines.push("");
  lines.push("## Manglende renderHints");
  lines.push("");
  if (!r.registry.missingRenderHints.length) lines.push("- (ingen)");
  else for (const x of r.registry.missingRenderHints) lines.push(`- \`${x.id}\`: mangler ${x.missing.join(", ")}`);
  lines.push("");
  return lines.join("\n");
}

main();
