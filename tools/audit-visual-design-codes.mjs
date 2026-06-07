// tools/audit-visual-design-codes.mjs
//
// Audit av det felles visual designCode-systemet (data/visualDesignCodes.json)
// mot place-, people- og artikkel-/story-/leksikon-/lesespor-data.
//
// Speiler resolver-logikken i js/visualDesignCodes.js (uten DOM/fetch), så
// rapporten viser hvordan entiteter faktisk ville løst designCode i appen.
// Endrer ingen datafiler.
//
// Rapporten er ikke bare en dekningsoversikt: den lister også konkrete
// kandidater for neste batch (default-fallback, heuristiske treff som kan
// gjøres eksplisitte), ubrukte koder med søkeforslag, mulige semantisk svake
// eksplisitte valg (review candidates) og et prioritert batch 3-forslag.
//
// Kjør:  node tools/audit-visual-design-codes.mjs
//
// Skriver:
//   reports/visual-design-codes-audit.json  (detaljert, full liste)
//   reports/visual-design-codes-audit.md    (lesbar, avkortede lister)

import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const ROOT = process.cwd();
const DATA = path.join(ROOT, "data");
const REGISTRY = path.join(DATA, "visualDesignCodes.json");
const REPORTS_DIR = path.join(ROOT, "reports");

// Markdown-grenser (full liste finnes alltid i JSON-rapporten).
const MD_MAX_DEFAULT = 40;
const MD_MAX_HEURISTIC = 30;
const MD_MAX_REVIEW = 50;
const MD_MAX_BATCH3_PLACES = 20;
const MD_MAX_BATCH3_PEOPLE = 20;
const MD_MAX_BATCH3_ARTICLES = 30;

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

// Flat tekst-uttrekk fra string/array/objekt (brukes for dyp tekstskanning i
// batch 3-forslag, der vi tør lese mer enn resolveren leser i runtime).
function flattenText(v, depth) {
  if (v == null) return "";
  if (depth == null) depth = 0;
  if (depth > 4) return "";
  if (typeof v === "string") return v;
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  if (Array.isArray(v)) return v.map((x) => flattenText(x, depth + 1)).join(" ");
  if (typeof v === "object") {
    const out = [];
    for (const k in v) {
      if (Object.prototype.hasOwnProperty.call(v, k)) out.push(flattenText(v[k], depth + 1));
    }
    return out.join(" ");
  }
  return "";
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

// Haystack-byggere som speiler resolverens feltvalg per entitetstype. Disse
// brukes både til å gjenfinne hvilket nøkkelord som traff (reason/confidence)
// og som basis for resolveren.
function placeHay(place) {
  const cm = place.civiMap || {};
  const assetType = lc(cm.assetType || place.mapAssetType || place.assetType || "");
  const qp = place.quiz_profile || {};
  return haystack([place.id, place.name, place.title, qp.place_type, qp.subtype, assetType]);
}

function personHay(person) {
  return haystack([person.role, person.profession, person.sport, person.tags,
    person.id, person.name, person.title, person.desc]);
}

function articleHay(article) {
  return haystack([article.type, article.topic, article.category, article.tags,
    article.themes, article.title, article.id, article.subject]);
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
    const hay = personHay(person);
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
    const hay = articleHay(article);
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
// Kandidat-/kvalitetshjelpere.
// ---------------------------------------------------------------------------

// Entitetsidentitet for kandidatlister. Artikler (leksikon) har ofte bare
// place_id; lesespor har id + title.
function entityIdentity(e, type) {
  const id = e.id || (type === "article" ? e.place_id : null) || e.title || "(unknown)";
  const nameOrTitle = e.name || e.title || (type === "article" ? e.place_id : null) || e.id || "(unknown)";
  let category = lc(e.category);
  if (!category && Array.isArray(e.category_hints) && e.category_hints.length) {
    category = lc(e.category_hints[0]);
  }
  return { id, nameOrTitle, category };
}

// Finn første nøkkelord-treff i en regelliste og returner det faktiske
// triggerordet (m[0]) – nyttig som "reason".
function firstKeywordMatch(hay, rules) {
  for (const [re, code] of rules) {
    const m = re.exec(hay);
    if (m) return { code, keyword: m[0] };
  }
  return null;
}

// Tydelige nøkkelord gir high confidence.
const HIGH_CONFIDENCE_RE = /(stadion|stadium|ishall|museum|museet|galleri|gallery|kunsthall|kirke|domkirke|katedral|kapell|bibliotek|library|deichman|stasjon|jernbane|t-bane|metro|park|teater|theatre|theater|kino|cinema|forfatter|author|musiker|komponist|composer|forsker|professor|nobel|politiker|statsminister|universitet|fotball|football|skiløper|skiloper|langrenn|friidrett|maraton|sprint|sport|idrett)/;
// Brede/uklare treff gir low confidence.
const LOW_CONFIDENCE_TERMS = new Set([
  "sted", "place", "essay", "lokal", "local", "nabolag", "person", "histor",
  "art", "by", "object", "objekt", "gjenstand", "scene"
]);

function confidenceFor(keyword) {
  const k = lc(keyword || "");
  if (!k) return "low";
  if (HIGH_CONFIDENCE_RE.test(k)) return "high";
  if (LOW_CONFIDENCE_TERMS.has(k)) return "low";
  return "medium";
}

// Forklar hvilket nøkkelord/kilde som ga en heuristisk kode.
function explainHeuristic(type, e) {
  if (type === "place") {
    const m = firstKeywordMatch(placeHay(e), PLACE_KEYWORD_RULES);
    if (m) return m.keyword;
    const qp = e.quiz_profile || {};
    const pt = lc(qp.place_type);
    if (pt) return "place_type:" + pt;
    return null;
  }
  if (type === "person") {
    const m = firstKeywordMatch(personHay(e), PERSON_KEYWORD_RULES);
    return m ? m.keyword : null;
  }
  const m = firstKeywordMatch(articleHay(e), ARTICLE_KEYWORD_RULES);
  return m ? m.keyword : null;
}

// Dype haystacks for batch 3 – tør lese mer tekst enn runtime-resolveren.
function placeDeepHay(e) {
  const cm = e.civiMap || {};
  const assetType = lc(cm.assetType || e.mapAssetType || e.assetType || "");
  const qp = e.quiz_profile || {};
  return haystack([e.id, e.name, e.title, e.category, qp.place_type, qp.subtype,
    assetType, e.desc, e.popupDesc]);
}

function personDeepHay(e) {
  return haystack([e.role, e.profession, e.sport, e.tags, e.id, e.name, e.title,
    e.category, e.desc, e.popupDesc]);
}

function articleDeepHay(e) {
  const parts = [e.type, e.topic, e.category, e.tags, e.themes, e.title, e.id,
    e.subject, e.place_id, e.popupDesc, e.category_hints,
    flattenText(e.summary), flattenText(e.wikiText)];
  if (Array.isArray(e.subjects)) parts.push(e.subjects.map((s) => s && s.name).filter(Boolean));
  return haystack(parts);
}

// Søkeforslag/oppfølging for ubrukte koder.
const UNUSED_CODE_HINTS = {
  gallery_miniature: {
    searchTerms: ["galleri", "gallery", "kunsthall", "utstilling"],
    nextAction: "Vurder places med galleri/kunsthall som i dag løses som museum_miniature eller default."
  },
  article_literature_miniature: {
    searchTerms: ["litteratur", "forfatter", "roman", "dikt", "poesi", "novelle"],
    nextAction: "Vurder leksikon/lesespor om litteratur og forfatterskap for eksplisitt article_literature_miniature."
  },
  article_architecture_miniature: {
    searchTerms: ["arkitektur", "architecture", "bygning", "byrom", "byggeskikk"],
    nextAction: "Vurder artikler om arkitektur og bygde miljøer for eksplisitt article_architecture_miniature."
  },
  article_people_portrait_miniature: {
    searchTerms: ["portrett", "biografi", "person", "portrait"],
    nextAction: "Vurder biografiske artikler/portretter for eksplisitt article_people_portrait_miniature."
  },
  article_wonderkammer_miniature: {
    searchTerms: ["wonderkammer", "kuriosa", "objekt", "samling", "cabinet"],
    nextAction: "Vurder AHA-/kuriosa-/objektsamling-artikler for eksplisitt article_wonderkammer_miniature."
  }
};

function unusedCodeDetail(code, registryEntry) {
  const entry = registryEntry || {};
  const hint = UNUSED_CODE_HINTS[code];
  const tags = Array.isArray(entry.tags) ? entry.tags : [];
  return {
    code,
    entityTypes: Array.isArray(entry.entityTypes) ? entry.entityTypes : [],
    family: entry.family || "",
    suggestedSearchTerms: hint ? hint.searchTerms : tags.slice(0, 4),
    suggestedNextAction: hint
      ? hint.nextAction
      : "Ingen entiteter løser til denne koden i dag. Vurder om noen entiteter bør merkes eksplisitt, eller om koden kan utgå."
  };
}

// Review-regler (mulige semantisk svake eksplisitte valg). Kjøres kun på
// entiteter med eksplisitt designCode. Ikke "feil" – bare manuelle sjekkpunkter.
function placeReviewReason(e, code) {
  const hay = haystack([e.id, e.name, e.title]);
  if (/slott|palace|palass/.test(hay) &&
      code !== "fortress_miniature" && code !== "civic_miniature") {
    return `Navn/id antyder slott/palass, men koden er '${code}' (vurder fortress_miniature eller civic_miniature).`;
  }
  if (/opera/.test(hay) && code === "theatre_miniature") {
    return "Navn/id inneholder 'opera' og koden er theatre_miniature (egen opera-kode kan vurderes senere).";
  }
  return null;
}

function personReviewReason(e, code) {
  const hay = haystack([e.tags, e.desc, e.role, e.profession, e.name, e.id]);
  if (/trener|coach/.test(hay) && code === "person_footballer_miniature") {
    return "Tags/desc antyder trener og koden er person_footballer_miniature (person_coach_miniature kan vurderes senere).";
  }
  if (/skøyte|skoyte|skøyteløper|skoyteloper/.test(hay) && code === "person_athlete_miniature") {
    return "Skøyte/skøyteløper og koden er person_athlete_miniature (person_skater_miniature kan vurderes senere).";
  }
  return null;
}

function articleReviewReason(e, code) {
  const hay = haystack([e.title, e.id, e.place_id]);
  if (/arkitektur/.test(hay) && code !== "article_architecture_miniature") {
    return `Tittel/id inneholder 'arkitektur', men koden er '${code}' (vurder article_architecture_miniature).`;
  }
  if (/portrett|biografi/.test(hay) && code !== "article_people_portrait_miniature") {
    return `Tittel/id inneholder portrett/biografi, men koden er '${code}' (vurder article_people_portrait_miniature).`;
  }
  if (/wonderkammer/.test(hay) && code !== "article_wonderkammer_miniature") {
    return `Tittel/id inneholder 'wonderkammer', men koden er '${code}' (vurder article_wonderkammer_miniature).`;
  }
  return null;
}

function reviewReasonFor(type, e, code) {
  if (type === "place") return placeReviewReason(e, code);
  if (type === "person") return personReviewReason(e, code);
  return articleReviewReason(e, code);
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

// Returnerer [{ entry, file }] der file er sti relativt til repo-roten.
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
    const relPath = path.relative(ROOT, file);
    for (const e of entriesFromFileData(data)) {
      if (!e || typeof e !== "object") continue;
      const key = e.id || e.title || JSON.stringify(e).slice(0, 64);
      if (seen.has(key)) continue;
      seen.add(key);
      out.push({ entry: e, file: relPath });
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// Audit.
// ---------------------------------------------------------------------------

// Enkelt-gjennomgang per entitetstype. Samler tellinger og alle kandidatlister.
function analyzeEntities(type, wrapped, resolveFn, usage) {
  const counts = { explicit: 0, assetType: 0, category: 0, heuristic: 0, default: 0 };
  let withExplicit = 0;
  const invalidExplicit = [];
  const explicitByCode = {};
  const defaultCandidates = [];
  const heuristicCandidates = [];
  const semanticReviewCandidates = [];

  for (const { entry: e, file } of wrapped) {
    const r = resolveFn(e);
    counts[r.source] = (counts[r.source] || 0) + 1;
    usage[r.designCode] = (usage[r.designCode] || 0) + 1;

    const ident = entityIdentity(e, type);

    if (r.source === "explicit") {
      withExplicit++;
      explicitByCode[r.designCode] = (explicitByCode[r.designCode] || 0) + 1;
      if (!r.valid) invalidExplicit.push({ id: ident.id, designCode: r.designCode });
      const reviewReason = reviewReasonFor(type, e, r.designCode);
      if (reviewReason) {
        semanticReviewCandidates.push({
          id: ident.id, nameOrTitle: ident.nameOrTitle, file,
          currentDesignCode: r.designCode, reason: reviewReason,
          suggestedAction: "review_only"
        });
      }
    } else if (r.source === "default") {
      defaultCandidates.push({
        id: ident.id, nameOrTitle: ident.nameOrTitle, file,
        category: ident.category, resolvedCode: r.designCode, reason: "default"
      });
    } else if (r.source === "heuristic") {
      const keyword = explainHeuristic(type, e);
      const confidence = confidenceFor(keyword);
      heuristicCandidates.push({
        id: ident.id, nameOrTitle: ident.nameOrTitle, file,
        category: ident.category, resolvedCode: r.designCode,
        source: "heuristic", confidence,
        reason: keyword ? `keyword: ${keyword}` : "heuristic match"
      });
    }
  }

  return {
    counts, withExplicit, invalidExplicit, explicitByCode,
    defaultCandidates, heuristicCandidates, semanticReviewCandidates
  };
}

// Dyp skann for batch 3-forslag: prøver å finne en konkret kode (særlig en
// ubrukt kode) for default-fallback-entiteter.
function deepSuggest(type, e, unusedSet) {
  let hay;
  let rules;
  if (type === "place") { hay = placeDeepHay(e); rules = PLACE_KEYWORD_RULES; }
  else if (type === "person") { hay = personDeepHay(e); rules = PERSON_KEYWORD_RULES; }
  else { hay = articleDeepHay(e); rules = ARTICLE_KEYWORD_RULES; }
  const m = firstKeywordMatch(hay, rules);
  if (!m) return null;
  const confidence = confidenceFor(m.keyword);
  const coversUnused = unusedSet.has(m.code);
  return { code: m.code, keyword: m.keyword, confidence, coversUnused };
}

// Bygg prioritert batch 3-forslag fra heuristiske og default-kandidater.
function buildBatch3(type, wrapped, resolveFn, unusedSet) {
  const out = [];
  for (const { entry: e, file } of wrapped) {
    const r = resolveFn(e);
    if (r.source === "explicit") continue;
    const ident = entityIdentity(e, type);
    let suggestion = null;

    if (r.source === "heuristic") {
      const keyword = explainHeuristic(type, e);
      const confidence = confidenceFor(keyword);
      if (confidence === "high") {
        suggestion = {
          code: r.designCode, priority: 5,
          reason: `heuristisk high-confidence treff (${keyword}); gjør eksplisitt for stabil visuell identitet`
        };
      } else if (confidence === "medium") {
        suggestion = {
          code: r.designCode, priority: 3,
          reason: `heuristisk medium-confidence treff (${keyword}); bør sjekkes før eksplisitt merking`
        };
      }
    } else if (r.source === "default") {
      const deep = deepSuggest(type, e, unusedSet);
      if (deep) {
        if (deep.coversUnused) {
          suggestion = {
            code: deep.code, priority: deep.confidence === "low" ? 3 : 5,
            reason: `default-fallback; dyp-tekst treff '${deep.keyword}' dekker ubrukt kode ${deep.code}`
          };
        } else if (deep.confidence === "high") {
          suggestion = {
            code: deep.code, priority: 4,
            reason: `default-fallback; tydelig dyp-tekst treff '${deep.keyword}'`
          };
        } else if (deep.confidence === "medium") {
          suggestion = {
            code: deep.code, priority: 3,
            reason: `default-fallback; mulig dyp-tekst treff '${deep.keyword}'`
          };
        }
      }
    }

    if (suggestion) {
      out.push({
        id: ident.id, nameOrTitle: ident.nameOrTitle, file,
        entityType: type, suggestedDesignCode: suggestion.code,
        reason: suggestion.reason, priority: suggestion.priority
      });
    }
  }
  out.sort((a, b) => b.priority - a.priority ||
    String(a.suggestedDesignCode).localeCompare(b.suggestedDesignCode) ||
    String(a.id).localeCompare(b.id));
  return out;
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

  // Last data (wrapped: { entry, file }).
  const places = loadFromManifest(path.join(DATA, "places", "manifest.json"), path.join(DATA, "places"));
  const people = loadFromManifest(path.join(DATA, "people", "manifest.json"), path.join(DATA, "people"));
  const leksikon = loadFromManifest(path.join(DATA, "leksikon", "manifest.json"), path.join(DATA, "leksikon"));
  const lesespor = loadFromManifest(path.join(DATA, "lesespor", "manifest.json"), path.join(DATA, "lesespor"));

  const usage = {};
  const placeStats = analyzeEntities("place", places, resolveForPlace, usage);
  const peopleStats = analyzeEntities("person", people, resolveForPerson, usage);
  // Artikkel-familien dekker leksikon + lesespor.
  const articleEntries = leksikon.concat(lesespor);
  const articleStats = analyzeEntities("article", articleEntries, resolveForArticle, usage);

  const totalExplicit = placeStats.withExplicit + peopleStats.withExplicit + articleStats.withExplicit;
  const sumSource = (key) => placeStats.counts[key] + peopleStats.counts[key] + articleStats.counts[key];

  // Topp brukte designCodes.
  const topUsed = Object.entries(usage).sort((a, b) => b[1] - a[1]).slice(0, 15)
    .map(([code, count]) => ({ code, count }));

  // designCodes uten bruk.
  const unused = codeIds.filter((id) => !usage[id]);
  const unusedSet = new Set(unused);
  const unusedDetails = unused.map((code) => unusedCodeDetail(code, codes[code]));

  const invalidExplicit = []
    .concat(placeStats.invalidExplicit.map((x) => ({ ...x, entityType: "place" })))
    .concat(peopleStats.invalidExplicit.map((x) => ({ ...x, entityType: "person" })))
    .concat(articleStats.invalidExplicit.map((x) => ({ ...x, entityType: "article" })));

  // Batch 3-forslag per entitetstype.
  const batch3 = {
    places: buildBatch3("place", places, resolveForPlace, unusedSet),
    people: buildBatch3("person", people, resolveForPerson, unusedSet),
    articles: buildBatch3("article", articleEntries, resolveForArticle, unusedSet)
  };

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
    unusedDesignCodeDetails: unusedDetails,
    invalidExplicitDesignCodes: invalidExplicit,
    defaultCandidates: {
      places: placeStats.defaultCandidates,
      people: peopleStats.defaultCandidates,
      articles: articleStats.defaultCandidates
    },
    heuristicCandidates: {
      places: placeStats.heuristicCandidates,
      people: peopleStats.heuristicCandidates,
      articles: articleStats.heuristicCandidates
    },
    semanticReviewCandidates: {
      places: placeStats.semanticReviewCandidates,
      people: peopleStats.semanticReviewCandidates,
      articles: articleStats.semanticReviewCandidates
    },
    batch3Suggestions: batch3,
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
  const countCand = (c) => c.places.length + c.people.length + c.articles.length;
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
  console.log(`  default-kandidater:        ${countCand(report.defaultCandidates)}`);
  console.log(`  heuristic-kandidater:      ${countCand(report.heuristicCandidates)}`);
  console.log(`  review-kandidater:         ${countCand(report.semanticReviewCandidates)}`);
  console.log(`  batch3-forslag:            ${countCand(report.batch3Suggestions)}`);
  console.log(`  invalid eksplisitte:       ${invalidExplicit.length}`);
  console.log(`  manglende renderHints:     ${missingRenderHints.length}`);
  console.log(`  designCodes uten bruk:     ${unused.length}`);
  console.log("Skrev reports/visual-design-codes-audit.json og .md");

  if (invalidExplicit.length || missingRenderHints.length) {
    process.exitCode = 1;
  }
}

// ---------------------------------------------------------------------------
// Markdown-rendering.
// ---------------------------------------------------------------------------

function mdEscape(s) {
  return String(s == null ? "" : s).replace(/\|/g, "\\|").replace(/\n/g, " ");
}

// Render avkortet kandidatliste med totalantall og JSON-henvisning.
function pushCandidateList(lines, label, items, max, columns) {
  const total = items.length;
  lines.push(`#### ${label} (${total})`);
  lines.push("");
  if (!total) {
    lines.push("- (ingen)");
    lines.push("");
    return;
  }
  lines.push(`| ${columns.map((c) => c.head).join(" | ")} |`);
  lines.push(`| ${columns.map(() => "---").join(" | ")} |`);
  for (const it of items.slice(0, max)) {
    lines.push(`| ${columns.map((c) => mdEscape(c.get(it))).join(" | ")} |`);
  }
  if (total > max) {
    lines.push("");
    lines.push(`_Viser ${max} av ${total}. Full liste i \`reports/visual-design-codes-audit.json\`._`);
  }
  lines.push("");
}

// Grupper batch3-forslag etter suggestedDesignCode, avkortet til max totalt.
function pushBatch3Group(lines, label, items, max) {
  const shown = items.filter((x) => x.priority >= 3).slice(0, max);
  lines.push(`#### ${label} (totalt ${items.length}, viser ${shown.length})`);
  lines.push("");
  if (!shown.length) {
    lines.push("- (ingen)");
    lines.push("");
    return;
  }
  const byCode = {};
  for (const it of shown) {
    (byCode[it.suggestedDesignCode] = byCode[it.suggestedDesignCode] || []).push(it);
  }
  for (const code of Object.keys(byCode).sort()) {
    lines.push(`- \`${code}\`:`);
    for (const it of byCode[code]) {
      lines.push(`  - [P${it.priority}] ${mdEscape(it.nameOrTitle)} (\`${mdEscape(it.id)}\`) — ${mdEscape(it.reason)}`);
    }
  }
  lines.push("");
}

function toMarkdown(r) {
  const lines = [];
  lines.push("# Visual design codes – audit");
  lines.push("");
  lines.push(`Generert: ${r.generatedAt}`);
  lines.push("");
  lines.push("> Denne rapporten viser ikke bare dekning, men også konkrete kandidater for");
  lines.push("> neste batch. Full, uavkortet liste finnes alltid i");
  lines.push("> [`reports/visual-design-codes-audit.json`](visual-design-codes-audit.json).");
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

  // ---- Del 1: default-kandidater ----
  lines.push("## Default-kandidater for neste batch");
  lines.push("");
  lines.push("Entiteter som fortsatt løses via default-fallback. Dette er den neste");
  lines.push("ryddelisten – kandidater som kan vurderes for eksplisitt designCode.");
  lines.push("");
  const defCols = [
    { head: "id", get: (x) => x.id },
    { head: "navn/tittel", get: (x) => x.nameOrTitle },
    { head: "kategori", get: (x) => x.category || "—" },
    { head: "fil", get: (x) => x.file }
  ];
  pushCandidateList(lines, "Places som fortsatt er `default_miniature`", r.defaultCandidates.places, MD_MAX_DEFAULT, defCols);
  pushCandidateList(lines, "People som fortsatt er `person_default_miniature`", r.defaultCandidates.people, MD_MAX_DEFAULT, defCols);
  pushCandidateList(lines, "Artikler som fortsatt er `article_default_miniature`", r.defaultCandidates.articles, MD_MAX_DEFAULT, defCols);

  // ---- Del 2: heuristic-kandidater ----
  lines.push("## Heuristiske kandidater for eksplisitt designCode");
  lines.push("");
  lines.push("Entiteter uten eksplisitt kode, men der resolveren gir en konkret kode via");
  lines.push("heuristikk. High-confidence treff er trygge kandidater for eksplisitt merking.");
  lines.push("");
  const heurCols = [
    { head: "id", get: (x) => x.id },
    { head: "navn/tittel", get: (x) => x.nameOrTitle },
    { head: "resolvedCode", get: (x) => x.resolvedCode },
    { head: "reason", get: (x) => x.reason }
  ];
  for (const [label, key] of [["Places", "places"], ["People", "people"], ["Artikler", "articles"]]) {
    const all = r.heuristicCandidates[key] || [];
    const high = all.filter((x) => x.confidence === "high");
    lines.push(`### ${label}`);
    lines.push("");
    const byConf = { high: 0, medium: 0, low: 0 };
    for (const x of all) byConf[x.confidence] = (byConf[x.confidence] || 0) + 1;
    lines.push(`- totalt: ${all.length} (high ${byConf.high}, medium ${byConf.medium}, low ${byConf.low})`);
    lines.push("");
    pushCandidateList(lines, `Topp high-confidence`, high, MD_MAX_HEURISTIC, heurCols);
  }

  // ---- Del 3: ubrukte designCodes ----
  lines.push("## Ubrukte designCodes – anbefalt oppfølging");
  lines.push("");
  const ud = r.unusedDesignCodeDetails || [];
  if (!ud.length) {
    lines.push("- (ingen)");
    lines.push("");
  } else {
    for (const u of ud) {
      lines.push(`### \`${u.code}\``);
      lines.push("");
      lines.push(`- family: ${u.family || "—"}`);
      lines.push(`- entityTypes: ${(u.entityTypes || []).join(", ") || "—"}`);
      lines.push(`- søkeord: ${(u.suggestedSearchTerms || []).map((t) => `\`${t}\``).join(", ") || "—"}`);
      lines.push(`- anbefalt: ${u.suggestedNextAction}`);
      lines.push("");
    }
  }

  // ---- Del 4: review-kandidater ----
  lines.push("## Review-kandidater – ikke nødvendigvis feil");
  lines.push("");
  lines.push("Eksplisitte koder som kan være riktige, men bør vurderes manuelt. Dette er");
  lines.push("**ikke** feil – bare sjekkpunkter for semantisk presisjon.");
  lines.push("");
  const reviewCols = [
    { head: "id", get: (x) => x.id },
    { head: "navn/tittel", get: (x) => x.nameOrTitle },
    { head: "currentDesignCode", get: (x) => x.currentDesignCode },
    { head: "reason", get: (x) => x.reason }
  ];
  const allReview = []
    .concat((r.semanticReviewCandidates.places || []).map((x) => ({ ...x, _t: "place" })))
    .concat((r.semanticReviewCandidates.people || []).map((x) => ({ ...x, _t: "person" })))
    .concat((r.semanticReviewCandidates.articles || []).map((x) => ({ ...x, _t: "article" })));
  pushCandidateList(lines, "Review candidates", allReview, MD_MAX_REVIEW, reviewCols);

  // ---- Del 5: batch 3-forslag ----
  lines.push("## Forslag til Pilot batch 3");
  lines.push("");
  lines.push("Prioritert liste (P5 = åpenbar og viktig, P3 = sannsynlig, bør sjekkes).");
  lines.push("Lavere prioritet (P1–P2) finnes kun i JSON-rapporten.");
  lines.push("");
  pushBatch3Group(lines, "Places", r.batch3Suggestions.places, MD_MAX_BATCH3_PLACES);
  pushBatch3Group(lines, "People", r.batch3Suggestions.people, MD_MAX_BATCH3_PEOPLE);
  pushBatch3Group(lines, "Artikler", r.batch3Suggestions.articles, MD_MAX_BATCH3_ARTICLES);

  // ---- Eksisterende kvalitetsseksjoner ----
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
