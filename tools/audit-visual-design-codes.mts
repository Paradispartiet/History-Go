// tools/audit-visual-design-codes.mts
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
// Kjør:  npm run test:visual-design-codes
//
// Skriver:
//   reports/visual-design-codes-audit.json  (detaljert, full liste)
//   reports/visual-design-codes-audit.md    (lesbar, avkortede lister)

import fs from "node:fs";
import path from "node:path";
import process from "node:process";

type JsonValue = string | number | boolean | null | JsonObject | JsonArray;
type JsonObject = { [key: string]: JsonValue };
type JsonArray = JsonValue[];
type EntityType = "place" | "person" | "article";
type ResolutionSource = "explicit" | "assetType" | "category" | "heuristic" | "default";
type KeywordRule = [RegExp, string, boolean?];
type AuditEntity = { [key: string]: any };
type WrappedEntity = { entry: AuditEntity; file: string };
type VisualDesignCode = {
  id?: string;
  entityTypes?: string[];
  renderHints?: Record<string, unknown>;
  tags?: string[];
  [key: string]: unknown;
};
type VisualDesignRegistry = { codes?: Record<string, VisualDesignCode> };
type ResolvedDesignCode = { designCode: string; source: ResolutionSource; valid: boolean };
type CandidateRow = {
  id: unknown;
  nameOrTitle: unknown;
  file: string;
  [key: string]: unknown;
};
type BatchSuggestion = CandidateRow & {
  entityType: EntityType;
  suggestedDesignCode: string;
  reason: string;
  priority: number;
};
type AuditReport = { [key: string]: any };
type Resolver = (entity: AuditEntity) => ResolvedDesignCode;

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
// Article default analysis – Markdown-grenser (full liste i JSON).
const MD_MAX_ADA_SAFE = 50;
const MD_MAX_ADA_METADATA = 40;
const MD_MAX_ADA_KEEP = 30;
const MD_MAX_ADA_MANUAL = 40;
const MD_MAX_ADA_BATCH7 = 60;

function readJSON(file: string): unknown {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function tryReadJSON(file: string): unknown | null {
  try { return readJSON(file); } catch { return null; }
}

const lc = (v: unknown) => String(v == null ? "" : v).trim().toLowerCase();

function haystack(parts: unknown[]): string {
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
function flattenText(v: unknown, depth?: number): string {
  if (v == null) return "";
  if (depth == null) depth = 0;
  if (depth > 4) return "";
  if (typeof v === "string") return v;
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  if (Array.isArray(v)) return v.map((x) => flattenText(x, depth + 1)).join(" ");
  if (typeof v === "object") {
    const out = [];
    for (const k in v) {
      if (Object.prototype.hasOwnProperty.call(v, k)) out.push(flattenText((v as Record<string, unknown>)[k], depth + 1));
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

const PLACE_ASSET_TO_CODE: Record<string, string> = {
  opera: "opera_miniature", palace: "palace_miniature",
  cemetery: "cemetery_miniature", monument: "monument_miniature",
  farm: "farm_estate_miniature", estate: "farm_estate_miniature",
  prison: "prison_miniature",
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

const PLACE_CATEGORY_TO_CODE: Record<string, string> = {
  sport: "sports_field_miniature", kunst: "museum_miniature",
  litteratur: "library_miniature", musikk: "music_venue_miniature",
  film: "cinema_miniature", film_tv: "cinema_miniature",
  popkultur: "music_venue_miniature", populaerkultur: "music_venue_miniature",
  subkultur: "subculture_miniature", natur: "park_miniature",
  politikk: "civic_miniature", media: "civic_miniature",
  vitenskap: "university_miniature", psykologi: "university_miniature",
  naeringsliv: "commerce_miniature", by: "apartment_block_miniature"
};

const PLACE_KEYWORD_RULES: KeywordRule[] = [
  [/opera|operahuset/, "opera_miniature"],
  [/slott|palace|palass|kongelig residens/, "palace_miniature"],
  [/gravlund|kirkegård|cemetery|cemiterio|cemitério|graveyard/, "cemetery_miniature"],
  [/monument|statue|memorial|minnesmerke|padrão/, "monument_miniature"],
  [/gård|gard|farm|estate|manor|quinta/, "farm_estate_miniature"],
  [/fengsel|prison|fangeleir|detention|botsfengsel/, "prison_miniature"],
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
  [/festning|borg|skanse|fortress|fort\b/, "fortress_miniature"],
  [/brygge|havn|kai|fjord|vann|dam|tjern|elv|strand|waterfront|marina/, "waterfront_miniature"],
  [/park|hage|skog|lund|mark|allmenning|grøntdrag/, "park_miniature"],
  [/torg|plass\b|square/, "square_miniature"],
  [/fabrikk|lager|industri|verksted|verk\b|mølle|mølla|depot|warehouse/, "industrial_miniature"],
  [/butikk|marked|kjopesenter|kjøpesenter|handel|shop|mall|basar/, "commerce_miniature"],
  [/scene|konsert|musikkklubb|spellemann|rockefeller|spektrum|venue/, "music_venue_miniature"],
  [/gate\b|veien|allé|alle\b|street/, "street_miniature"]
];

const PERSON_KEYWORD_RULES: KeywordRule[] = [
  [/trener|coach|manager|head coach/, "person_coach_miniature"],
  [/skøyte|skoyte|skøyteløper|skoyteloper|speed skating|kunstløper|kunstloper|figure skater/, "person_skater_miniature"],
  [/byplanlegger|urban planner|city planner|planlegger/, "person_urban_planner_miniature"],
  [/arkitekt|architect/, "person_architect_miniature"],
  [/næringsliv|naeringsliv|business|entrepreneur|industrialist|bank|shipping|handel|hotell|investor|eiendom/, "person_business_miniature"],
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

const PERSON_CATEGORY_TO_CODE: Record<string, string> = {
  sport: "person_athlete_miniature", litteratur: "person_writer_miniature",
  kunst: "person_artist_miniature", musikk: "person_musician_miniature",
  popkultur: "person_musician_miniature", populaerkultur: "person_musician_miniature",
  film: "person_actor_miniature", film_tv: "person_actor_miniature",
  politikk: "person_politician_miniature", media: "person_activist_miniature",
  vitenskap: "person_scientist_miniature", psykologi: "person_scientist_miniature",
  historie: "person_historical_miniature", natur: "person_explorer_miniature",
  subkultur: "person_local_legend_miniature"
};

// Speiler js/visualDesignCodes.js. Rekkefølgen er viktig (spesifikt før bredt).
// Reglene med tredje element `true` er TOPICAL-ONLY: de matches kun mot
// strukturert tematisk metadata (type/topic/category/tags/themes/subject), ikke
// mot fritekst id/title. Dette er de presise artikkelkodene fra "Article
// register expansion" – de gir kapasitet i resolveren uten å reklassifisere
// eksisterende artikler som bare nevner et tema i id/title.
const ARTICLE_KEYWORD_RULES: KeywordRule[] = [
  [/biografi|biography|portrett|portrait|liv|personportrett/, "article_biography_miniature"],
  [/sprak|språk|language|dialekt|etymolog/, "article_language_miniature"],
  [/gravlund|kirkegård|memorial|minne|minnesmerke|okkupasjon|fangeleir/, "article_memory_place_miniature"],
  [/menighet|trosliv|religion|kloster|moske|synagoge|tempel|kirkehistorie|gudstjeneste/, "article_religion_miniature", true],
  [/forskning|vitenskap|laboratorium|forskningsmiljø|fagfelt|fagutvikling|vitenskapshistorie/, "article_science_history_miniature", true],
  [/redaksjon|avishus|\bavis\b|journalistikk|kringkasting|allmennkringkasting|\bnrk\b|mediehus|presse|medieoffentlighet|mediefelt/, "article_media_history_miniature", true],
  [/natursti|elvesti|turvei|grøntdrag|naturkorridor|parkdrag|elveløp|\belv\b|elva|elve|bekk|vassdrag|naturreservat|bynatur/, "article_nature_route_miniature", true],
  [/trikk|t-?bane|jernbane|\btog\b|bussterminal|\bbuss\b|kollektivtransport|kollektivsystem|knutepunkt|transportåre|mobilitet|samferdsel/, "article_transport_miniature", true],
  [/\bbro\b|\bbru\b|brua|tunnel|akvedukt|vannforsyning|kraftforsyning|teknisk infrastruktur|teknisk anlegg|ledningsnett|kloakk/, "article_urban_infrastructure_miniature", true],
  [/bryggeri|fabrikk|verksted|industrihistorie|industriområde|industrikultur|\bmølle\b/, "article_industry_miniature", true],
  [/matmarked|markedshall|mathall|torghandel|matkultur|serveringskultur/, "article_food_market_miniature", true],
  [/lekeplass|barndom|barnelek|skolegård/, "article_childhood_play_miniature", true],
  [/arkitektur|architecture|bygning|byggekunst/, "article_architecture_miniature"],
  [/institusjon|institution|skole|hospital|fengsel|prison|kontor|forvaltning/, "article_institution_miniature"],
  [/musikkhistorie|music history|konserthistorie|bandhistorie|platehistorie/, "article_music_history_miniature", true],
  [/populærkultur|populaerkultur|popkultur|filmkultur|\bfilm\b|\bkino\b|\btv\b|fjernsyn|scene|standup|komedie|revy|kjendiskultur|kjendis|nerdkultur|gaming|spillkultur|cosplay|fandom|kultfilm|programkino|house of nerds|latter|colosseum kino|cinemateket/, "article_popular_culture_miniature", true],
  [/kunstinstitusjon|billedkunst|kunst|art\b|maleri|galleri|skulptur/, "article_art_miniature"],
  [/musikk|music|konsert|band|plate/, "article_music_history_miniature"],
  [/groundhopper|stadion|stadium|arena|fotball|football|tribune/, "article_groundhopper_miniature"],
  [/sport|idrett|friidrett|løp|skøyte/, "article_sports_history_miniature"],
  [/hverdagsliv|hverdagsbruk|hverdagsbevegelse|daglig bruk|møteplass|møtepunkt|oppholdssted|nabolagsrom|sosial bruk|byliv|parkbruk|lokalt liv|folks bruk|offentlig rom i bruk|hverdagsspottingsone|sesongbruk|rekreasjon|nærvær|byromsliv/, "article_everyday_life_miniature", true],
  [/litteratur|literature|essay|roman|dikt|bok\b|forfatter/, "article_literature_miniature"],
  [/politikk|politic|valg|parti|demokrati/, "article_political_history_miniature"],
  [/wonderkammer|wonder|aha|kuriosa|cabinet/, "article_wonderkammer_miniature"],
  [/objekt|object|gjenstand|artefakt|artifact/, "article_object_story_miniature"],
  [/portrett|portrait|biografi|person/, "article_people_portrait_miniature"],
  [/lokal|nabolag|local story|strøk|strok/, "article_local_story_miniature"],
  [/sted|place|essay/, "article_place_essay_miniature"],
  [/histor/, "article_history_miniature"]
];

const ARTICLE_CATEGORY_TO_CODE: Record<string, string> = {
  historie: "article_history_miniature", sport: "article_sports_history_miniature",
  musikk: "article_music_history_miniature", litteratur: "article_literature_miniature",
  kunst: "article_art_miniature", arkitektur: "article_architecture_miniature",
  politikk: "article_political_history_miniature", sprak: "article_language_miniature",
  "språk": "article_language_miniature", by: "article_local_story_miniature",
  natur: "article_place_essay_miniature",
  populærkultur: "article_popular_culture_miniature",
  populaerkultur: "article_popular_culture_miniature",
  popkultur: "article_popular_culture_miniature",
  hverdagsliv: "article_everyday_life_miniature"
};

function explicitCode(obj: AuditEntity): string | null {
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
function placeHay(place: AuditEntity): string {
  const cm = place.civiMap || {};
  const assetType = lc(cm.assetType || place.mapAssetType || place.assetType || "");
  const qp = place.quiz_profile || {};
  return haystack([place.id, place.name, place.title, qp.place_type, qp.subtype, assetType]);
}

function personHay(person: AuditEntity): string {
  return haystack([person.role, person.profession, person.sport, person.tags,
    person.id, person.name, person.title, person.desc]);
}

function articleHay(article: AuditEntity): string {
  return haystack([article.type, article.topic, article.category, article.tags,
    article.themes, article.title, article.id, article.subject]);
}

// Strukturert tematisk metadata uten fritekst id/title – brukes av de
// TOPICAL-ONLY artikkelreglene (presise temakoder). Speiler resolverens
// topicalHay i js/visualDesignCodes.js.
function articleTopicalHay(article: AuditEntity): string {
  return haystack([article.type, article.topic, article.category, article.tags,
    article.themes, article.subject]);
}

// Finn første artikkelregel som treffer, med riktig haystack per regel
// (TOPICAL-ONLY-regler matches kun mot articleTopicalHay).
function matchArticleRule(article: AuditEntity) {
  const full = articleHay(article);
  const topical = articleTopicalHay(article);
  for (const rule of ARTICLE_KEYWORD_RULES) {
    const h = rule[2] ? topical : full;
    const m = rule[0].exec(h);
    if (m) return { code: rule[1], keyword: m[0] };
  }
  return null;
}

function makeResolvers(validCodes: Set<string>) {
  const isValid = (c: string) => validCodes.has(c);

  function resolveForPlace(place: AuditEntity): ResolvedDesignCode {
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

  function resolveForPerson(person: AuditEntity): ResolvedDesignCode {
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

  function resolveForArticle(article: AuditEntity): ResolvedDesignCode {
    const explicit = explicitCode(article);
    if (explicit) return { designCode: explicit, source: "explicit", valid: isValid(explicit) };
    const m = matchArticleRule(article);
    if (m) return { designCode: m.code, source: "heuristic", valid: true };
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
function entityIdentity(e: AuditEntity, type: EntityType) {
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
function firstKeywordMatch(hay: string, rules: KeywordRule[]) {
  for (const [re, code] of rules) {
    const m = re.exec(hay);
    if (m) return { code, keyword: m[0] };
  }
  return null;
}

// Tydelige nøkkelord gir high confidence.
const HIGH_CONFIDENCE_RE = /(opera|operahuset|slott|palace|palass|gravlund|kirkegård|cemetery|graveyard|monument|statue|memorial|minnesmerke|fengsel|prison|fangeleir|gård|gard|farm|estate|manor|quinta|stadion|stadium|ishall|museum|museet|galleri|gallery|kunsthall|kirke|domkirke|katedral|kapell|bibliotek|library|deichman|stasjon|jernbane|t-bane|metro|park|teater|theatre|theater|kino|cinema|trener|coach|manager|skøyte|skoyte|skøyteløper|speed skating|kunstløper|figure skater|arkitekt|architect|byplanlegger|urban planner|business|entrepreneur|industrialist|forfatter|author|musiker|komponist|composer|forsker|professor|nobel|politiker|statsminister|universitet|fotball|football|skiløper|skiloper|langrenn|friidrett|maraton|sprint|sport|idrett|biografi|biography|portrett|portrait|institusjon|institution|okkupasjon)/;
// Brede/uklare treff gir low confidence.
const LOW_CONFIDENCE_TERMS = new Set([
  "sted", "place", "essay", "lokal", "local", "nabolag", "person", "histor",
  "art", "by", "object", "objekt", "gjenstand", "scene"
]);

function confidenceFor(keyword: string | null) {
  const k = lc(keyword || "");
  if (!k) return "low";
  if (HIGH_CONFIDENCE_RE.test(k)) return "high";
  if (LOW_CONFIDENCE_TERMS.has(k)) return "low";
  return "medium";
}

// Forklar hvilket nøkkelord/kilde som ga en heuristisk kode.
function explainHeuristic(type: EntityType, e: AuditEntity) {
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
  const m = matchArticleRule(e);
  return m ? m.keyword : null;
}

// Dype haystacks for batch 3 – tør lese mer tekst enn runtime-resolveren.
function placeDeepHay(e: AuditEntity): string {
  const cm = e.civiMap || {};
  const assetType = lc(cm.assetType || e.mapAssetType || e.assetType || "");
  const qp = e.quiz_profile || {};
  return haystack([e.id, e.name, e.title, e.category, qp.place_type, qp.subtype,
    assetType, e.desc, e.popupDesc]);
}

function personDeepHay(e: AuditEntity): string {
  return haystack([e.role, e.profession, e.sport, e.tags, e.id, e.name, e.title,
    e.category, e.desc, e.popupDesc]);
}

function articleDeepHay(e: AuditEntity): string {
  const parts = [e.type, e.topic, e.category, e.tags, e.themes, e.title, e.id,
    e.subject, e.place_id, e.popupDesc, e.category_hints,
    flattenText(e.summary), flattenText(e.wikiText)];
  if (Array.isArray(e.subjects)) parts.push(e.subjects.map((s) => s && s.name).filter(Boolean));
  return haystack(parts);
}

// Søkeforslag/oppfølging for ubrukte koder.
const UNUSED_CODE_HINTS = {
  opera_miniature: {
    searchTerms: ["opera", "operahuset", "performing arts", "teater"],
    nextAction: "Vurder operabygg og store scenekunsthus for eksplisitt opera_miniature."
  },
  palace_miniature: {
    searchTerms: ["slott", "palass", "palace", "kongelig residens"],
    nextAction: "Vurder slott, palasser og representative statsbygg for eksplisitt palace_miniature."
  },
  cemetery_miniature: {
    searchTerms: ["gravlund", "kirkegård", "cemetery", "graveyard"],
    nextAction: "Vurder gravlunder, kirkegårder og minnelandskap for eksplisitt cemetery_miniature."
  },
  monument_miniature: {
    searchTerms: ["monument", "statue", "memorial", "minnesmerke"],
    nextAction: "Vurder frittstående monumenter, statuer og minnesmerker for eksplisitt monument_miniature."
  },
  farm_estate_miniature: {
    searchTerms: ["gård", "gard", "farm", "estate", "manor", "quinta"],
    nextAction: "Vurder historiske gårder, gods, herregårder og eldre landsteder for eksplisitt farm_estate_miniature."
  },
  prison_miniature: {
    searchTerms: ["fengsel", "prison", "fangeleir", "detention", "botsfengsel"],
    nextAction: "Vurder fengsler, fangeleirer og andre straffeinstitusjoner for eksplisitt prison_miniature."
  },
  person_coach_miniature: {
    searchTerms: ["trener", "coach", "manager", "head coach"],
    nextAction: "Vurder trenere, managere og taktiske idrettsledere for eksplisitt person_coach_miniature."
  },
  person_skater_miniature: {
    searchTerms: ["skøyte", "skøyteløper", "speed skating", "kunstløper", "figure skater"],
    nextAction: "Vurder skøyteløpere og kunstløpere for eksplisitt person_skater_miniature."
  },
  person_architect_miniature: {
    searchTerms: ["arkitekt", "architect"],
    nextAction: "Vurder arkitekter for eksplisitt person_architect_miniature."
  },
  person_business_miniature: {
    searchTerms: ["næringsliv", "business", "entrepreneur", "industrialist", "bank", "shipping", "handel"],
    nextAction: "Vurder næringslivsfolk, industribyggere, investorer og finans-/handelsprofiler for eksplisitt person_business_miniature."
  },
  person_urban_planner_miniature: {
    searchTerms: ["byplanlegger", "urban planner", "city planner", "planlegger"],
    nextAction: "Vurder byplanleggere og urbanismeprofiler for eksplisitt person_urban_planner_miniature."
  },
  article_biography_miniature: {
    searchTerms: ["biografi", "biography", "portrett", "portrait", "personportrett"],
    nextAction: "Vurder biografier og personfokuserte historietekster for eksplisitt article_biography_miniature."
  },
  article_institution_miniature: {
    searchTerms: ["institusjon", "institution", "skole", "hospital", "fengsel", "forvaltning"],
    nextAction: "Vurder institusjonsartikler om skoler, sykehus, fengsler og offentlige kontorer for eksplisitt article_institution_miniature."
  },
  article_memory_place_miniature: {
    searchTerms: ["gravlund", "kirkegård", "memorial", "minne", "okkupasjon", "fangeleir"],
    nextAction: "Vurder minnesteder, gravlunder og okkupasjons-/fangeleirhistorie for eksplisitt article_memory_place_miniature."
  },
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
  },
  // Nye presise artikkelkoder fra "Article register expansion" (PR #1236-oppfølging).
  // Foreløpig ubrukte – batch 7 kan ta dem i bruk via articleBatch7Plan.
  article_nature_route_miniature: {
    searchTerms: ["elv", "elveløp", "natursti", "turvei", "grøntdrag", "vassdrag", "bekk", "naturkorridor"],
    nextAction: "Vurder naturstier, elver/bekker, vann, grøntdrag, turveier og natur-/elveforløp for eksplisitt article_nature_route_miniature (jf. articleBatch7Plan)."
  },
  article_media_history_miniature: {
    searchTerms: ["redaksjon", "avis", "journalistikk", "nrk", "kringkasting", "mediehus", "offentlighet"],
    nextAction: "Vurder avisredaksjoner, NRK/mediehus, pressehistorie og medieoffentlighet for eksplisitt article_media_history_miniature (jf. articleBatch7Plan)."
  },
  article_transport_miniature: {
    searchTerms: ["trikk", "t-bane", "tog", "buss", "stasjon", "knutepunkt", "kollektiv", "terminal"],
    nextAction: "Vurder trikk/t-bane/tog/buss, stasjoner, knutepunkt og kollektivsystem for eksplisitt article_transport_miniature (jf. articleBatch7Plan)."
  },
  article_urban_infrastructure_miniature: {
    searchTerms: ["bro", "bru", "tunnel", "akvedukt", "vannforsyning", "infrastruktur", "kraft"],
    nextAction: "Vurder veier, bruer, tunneler, vannforsyning, kraft og teknisk infrastruktur for eksplisitt article_urban_infrastructure_miniature (jf. articleBatch7Plan)."
  },
  article_industry_miniature: {
    searchTerms: ["bryggeri", "fabrikk", "verksted", "industri", "produksjon"],
    nextAction: "Vurder bryggeri, fabrikk, verksted, produksjon og industrihistorie for eksplisitt article_industry_miniature (jf. articleBatch7Plan)."
  },
  article_religion_miniature: {
    searchTerms: ["kirke", "menighet", "trosliv", "religion", "kloster", "moske", "synagoge"],
    nextAction: "Vurder kirkerom, menighet, trosliv og kirkehistorie (religion mer enn bygning) for eksplisitt article_religion_miniature (jf. articleBatch7Plan)."
  },
  article_science_history_miniature: {
    searchTerms: ["forskning", "vitenskap", "laboratorium", "institutt", "metode", "fagfelt"],
    nextAction: "Vurder forskning, vitenskapshistorie, fagmiljøer og laboratorier for eksplisitt article_science_history_miniature (jf. articleBatch7Plan)."
  },
  article_food_market_miniature: {
    searchTerms: ["matmarked", "torghandel", "mathall", "markedshall", "matkultur", "servering"],
    nextAction: "Vurder matmarked, torghandel, mathall, serverings- og matkultur for eksplisitt article_food_market_miniature (jf. articleBatch7Plan)."
  },
  article_childhood_play_miniature: {
    searchTerms: ["lekeplass", "barndom", "lek", "barn", "skolegård", "aktivitet"],
    nextAction: "Vurder lekeplasser, barndom/lek og barns bruk av sted for eksplisitt article_childhood_play_miniature (jf. articleBatch7Plan)."
  },
  article_popular_culture_miniature: {
    searchTerms: ["populærkultur", "filmkultur", "kino", "TV", "standup", "gaming", "kjendis"],
    nextAction: "Vurder film, TV, scene/standup, spillkultur, kjendiskultur og populærkulturell stedsbruk for eksplisitt article_popular_culture_miniature (jf. future small data batch)."
  },
  article_everyday_life_miniature: {
    searchTerms: ["hverdagsliv", "møteplass", "daglig bruk", "parkbruk", "sosial bruk", "byliv"],
    nextAction: "Vurder hverdagsbruk, møteplasser, parkbruk og sosialt byliv for eksplisitt article_everyday_life_miniature (jf. future small data batch)."
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
  if (/opera|operahuset/.test(hay) && code !== "opera_miniature") {
    return `Navn/id antyder opera, men koden er '${code}' (vurder opera_miniature).`;
  }
  if (/slott|palace|palass|kongelig residens/.test(hay) && code !== "palace_miniature") {
    return `Navn/id antyder slott/palass, men koden er '${code}' (vurder palace_miniature).`;
  }
  if (/gravlund|kirkegård|cemetery|graveyard/.test(hay) && code !== "cemetery_miniature") {
    return `Navn/id antyder gravlund/kirkegård, men koden er '${code}' (vurder cemetery_miniature).`;
  }
  if (/monument|statue|memorial|minnesmerke/.test(hay) && code !== "monument_miniature") {
    return `Navn/id antyder monument/minnesmerke, men koden er '${code}' (vurder monument_miniature).`;
  }
  return null;
}

function personReviewReason(e, code) {
  const hay = haystack([e.tags, e.desc, e.role, e.profession, e.name, e.id]);
  if (/trener|coach|manager|head coach/.test(hay) && code !== "person_coach_miniature") {
    return `Tags/desc antyder trener/coach, men koden er '${code}' (vurder person_coach_miniature).`;
  }
  if (/skøyte|skoyte|skøyteløper|skoyteloper|speed skating|kunstløper|kunstloper|figure skater/.test(hay) && code !== "person_skater_miniature") {
    return `Skøyte/skøyteløper antydes, men koden er '${code}' (vurder person_skater_miniature).`;
  }
  if (/byplanlegger|urban planner|city planner|planlegger/.test(hay) && code !== "person_urban_planner_miniature") {
    return `Byplanlegging/urbanisme antydes, men koden er '${code}' (vurder person_urban_planner_miniature).`;
  }
  if (/arkitekt|architect/.test(hay) && code !== "person_architect_miniature") {
    return `Arkitekt antydes, men koden er '${code}' (vurder person_architect_miniature).`;
  }
  if (/næringsliv|naeringsliv|business|entrepreneur|industrialist|bank|shipping|handel|hotell|investor|eiendom/.test(hay) && code !== "person_business_miniature") {
    return `Næringsliv/handel antydes, men koden er '${code}' (vurder person_business_miniature).`;
  }
  return null;
}

function articleReviewReason(e, code) {
  const hay = haystack([e.title, e.id, e.place_id]);
  if (/biografi|biography|portrett|portrait|personportrett/.test(hay) && code !== "article_biography_miniature") {
    return `Tittel/id inneholder biografi/portrett, men koden er '${code}' (vurder article_biography_miniature).`;
  }
  if (/institusjon|institution|skole|hospital|fengsel|prison|kontor|forvaltning/.test(hay) && code !== "article_institution_miniature") {
    return `Tittel/id antyder institusjon, men koden er '${code}' (vurder article_institution_miniature).`;
  }
  if (/gravlund|kirkegård|memorial|minne|minnesmerke|okkupasjon|fangeleir/.test(hay) && code !== "article_memory_place_miniature") {
    return `Tittel/id antyder minne-/gravlundssted, men koden er '${code}' (vurder article_memory_place_miniature).`;
  }
  if (/arkitektur/.test(hay) && code !== "article_architecture_miniature") {
    return `Tittel/id inneholder 'arkitektur', men koden er '${code}' (vurder article_architecture_miniature).`;
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
// Article default analysis – ren intern analysehelper.
//
// Klassifiserer de gjenværende `article_default_miniature`-artiklene før neste
// data-batch (batch 7). Denne delen leser kun eksisterende felter
// (id/place_id/title/popupDesc/summary/classification/subjects/category_hints)
// og endrer ingen datafiler, registeret eller resolveren. Den foreslår koder,
// men merker ingenting. Resultatet brukes til å bygge batch 7 presist i stedet
// for å gjette.
// ---------------------------------------------------------------------------

// Eksisterende artikkelkoder audit kan foreslå som trygge batch 7-kandidater.
// Rekkefølgen er fra mest til minst spesifikk (brukes som tie-breaker).
const ARTICLE_DEFAULT_SAFE_RULES: KeywordRule[] = [
  [/gravlund|kirkegård|minnesmerke|minnelund|minnested|krigsminne|okkupasjon|fangeleir|falne|deportasjon|henrettelse/, "article_memory_place_miniature"],
  [/biografi|biography|personportrett|portrettartikkel|livsløp|livshistorie/, "article_biography_miniature"],
  [/folkeliv|befolkning|arbeiderklasse|lokalbefolkning|byoriginal/, "article_people_portrait_miniature"],
  [/vigelandsanlegget|skulpturpark|skulptur|utsmykning|kunstmuseum|kunsthall|billedkunst|offentlig kunst|\bgalleri|kunstverk/, "article_art_miniature"],
  [/hageby|trehus|gårdsanlegg|byggeskikk|arkitektur|byggekunst|fasade|kvartalsstruktur|boligstruktur|bygningsmiljø/, "article_architecture_miniature"],
  [/bibliotek|universitet|sykehus|hospital|\bfengsel|stiftelse|institutt|studenthus|studentersamfund|departement|forvaltning/, "article_institution_miniature"],
  [/jernbane|t-?bane|trikk|bussterminal|\bbuss|stasjon|knutepunkt|kollektiv|innfartsvei|motorvei|ring ?\d|drammensbanen|grorudbanen|drammensveien|\be18\b|samferdsel|transitrom|transportknutepunkt/, "article_transport_miniature"],
  [/byelv|\belv\b|elva|elve|vassdrag|bekk|\bfoss|tjern|innsjø|\bvann\b|vannet|\bmyr\b|våtmark|naturreservat|fjordøy|svaberg|kantvegetasjon|grøntdrag|turvei|friområde|ravine|dalrom|kløft|bynatur|nærnatur|natur\b|naturstruktur|naturhistorie|skogbelte|kongeskogen|miradouro|jardim|monsanto|tapada|markavann/, "article_nature_route_miniature"],
  [/\bbro\b|\bbrua|akvedukt|aqueduto|energisentral|vannregulering|kloakk|ledningsnett|trafikkmaskin|bispelokket|\bdam\b|dammen/, "article_urban_infrastructure_miniature"],
  [/redaksjon|avishus|\bavis\b|kringkasting|allmennkringkasting|\bnrk\b|presse|tabloid|lederartikkel|dagsorden|mediefelt|kulturjournalistikk/, "article_media_history_miniature"],
  [/industriområde|fabrikk|\bmølle\b|bryggeri|verksted|industrikultur|industrihistorie|driftsanlegg|trikkestall|vannkraft/, "article_industry_miniature"],
  [/\bkirke\b|kapell|menighet|kloster|katedral|domkirke|moske|synagoge|trosliv|kirkehistorie/, "article_religion_miniature"],
  [/laboratorium|vitenskapshistorie|forskningsmiljø|psykologi|fagmiljø|forskning/, "article_science_history_miniature"],
  [/torghandel|matmarked|markedshall|restaurantliv|spisested|mathall|matkultur|servering/, "article_food_market_miniature"],
  [/lekeplass|barndom|barnelek|lek\b/, "article_childhood_play_miniature"],
  [/stadion|fotballklubb|idrettshistorie|friidrett|skøytehall|sportshistorie|tribune/, "article_sports_history_miniature"],
  [/groundhopper|bortefelt|stadiontur|kampdag/, "article_groundhopper_miniature"],
  [/musikkhistorie|konserthus|plateselskap|jazzklubb|musikkscene/, "article_music_history_miniature"],
  [/forfatterskap|litteraturhistorie|diktning|poesi|romankunst/, "article_literature_miniature"],
  [/storting|regjeringshistorie|partihistorie|valgkamp|demokratihistorie/, "article_political_history_miniature"],
  [/stedsnavn|navnespor|språkhistorie|dialekt|etymologi/, "article_language_miniature"],
  [/gjenstand|objektfortelling|minnegjenstand|materiell kultur/, "article_object_story_miniature"],
  [/wonderkammer|raritetskabinett|kuriositet/, "article_wonderkammer_miniature"],
  [/middelalderby|christiania|byhistorie/, "article_history_miniature"],
  [/lokalhistorie|nabolagshistorie|strøkshistorie/, "article_local_story_miniature"],
  [/stedsessay|representasjonsrom|seremoniell byform|byakse|plassrom|\bbyrom/, "article_place_essay_miniature"]
];

// Smale restgruppe-regler. Kodene som finnes i registeret blir safe/future
// batch-kandidater; koder som fortsatt mangler blir registerExpansionCandidates.
const ARTICLE_DEFAULT_NEW_RULES: KeywordRule[] = [
  [/populaerkultur|populærkultur|popkultur|filmkultur|filmkulisse|filmsted|film[- ]? og tv|\bfilm\b|\bkino\b|\btv\b|fjernsyn|tv-drama|krim|serie|scene|standup|komedie|revy|kjendiskultur|kjendis|sladder|livsstilsmedier|nerdkultur|gaming|spillkultur|cosplay|fandom|kultfilm|programkino|house of nerds|latter|colosseum kino|cinemateket|sjangerfellesskap/, "article_popular_culture_miniature"],
  [/hverdagsbruk|hverdagsliv|hverdagskultur|hverdagsbevegelse|hverdag|daglig bruk|møteplass|møtepunkt|oppholdssted|oppholdsplass|nabolagsrom|sosial bruk|uformell rekreasjon|byliv|parkbruk|lokalt liv|folks bruk|offentlig rom i bruk|hverdagsspottingsone|sesongbruk|rekreasjon|nærvær|byromsliv/, "article_everyday_life_miniature"],
  [/sosialhistorie|arbeiderforstad|arbeidsliv|klasse|fattigdom|leiegård|sanering|byfornyelse|boligsosial|rimelige boliger/, "article_social_history_miniature"],
  [/arrangement|festival|markering|seremoni|parade|demonstrasjon|feiring|event|skøytebane|sesongskifte/, "article_event_place_miniature"],
  [/uteliv|natteliv|\bbar\b|\bpub\b|klubb|serveringsmiljø|byliv om natten/, "article_nightlife_miniature"],
  [/utdanning|skole|læring|undervisning|studentmiljø|campus|universitetsmiljø/, "article_education_place_miniature"],
  [/offentlig rom|offentlig scene|torgflate|byrom|nabolagstorg|plassrom|civic space|borgerrom|demokratisk rom/, "article_civic_space_miniature"],
  [/nabolagsidentitet|strøksidentitet|identitet|tilhørighet|lokal identitet|områdeløft|sentrumsskala/, "article_neighborhood_identity_miniature"]
];

// Temaer som peker mot bevisst generelle/populærkulturelle artikler uten klar
// visuell hovedtype – default er ofte bedre enn å tvinge en smal kode.
const ARTICLE_DEFAULT_KEEP_RE = /populaerkultur|populærkultur|kjendis|sladder|livsstilsmedier|filmkulisse|filmsted|film_tv|standup|nerdkultur|sjangerfellesskap|hverdagskultur|kjendissone/;

// Svært entydige trefford gir høy konfidens selv ved ett felt.
const ARTICLE_VERY_UNAMBIGUOUS = new Set([
  "gravlund", "kirkegård", "fangeleir", "bibliotek", "universitet", "sykehus",
  "stiftelse", "studentersamfund", "vigelandsanlegget", "skulpturpark",
  "middelalderby", "stedsnavn", "navnespor", "akvedukt", "aqueduto",
  "naturreservat", "jernbane", "trikkestall", "bryggeri", "populærkultur",
  "populaerkultur", "filmkultur", "hverdagsliv", "hverdagsbruk", "møteplass"
]);

type ArticleField = { field: string; text: string };
type CodeScore = { code: string; isNew: boolean; words: string[]; fields: Set<string>; order: number };
type ArticleDefaultGroup =
  "safeBatch7Candidates" | "needsMetadata" | "needsNewDesignCode" |
  "keepDefaultForNow" | "manualReview";

// Finn alle distinkte treff (m[0]) av et mønster i en streng.
function findAllMatches(re: RegExp, text: string): string[] {
  const g = new RegExp(re.source, "g");
  const out: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = g.exec(text)) !== null) {
    if (!out.includes(m[0])) out.push(m[0]);
    if (m.index === g.lastIndex) g.lastIndex++;
  }
  return out;
}

// Feltvis tekst for en artikkel, med feltnavn for evidence.fieldsUsed.
function articleAnalysisFields(e: AuditEntity): ArticleField[] {
  const cls = e.classification || {};
  const sum = e.summary || {};
  const joinArr = (v: unknown) => Array.isArray(v) ? v.map(lc).join(" ") : "";
  const subjects = Array.isArray(e.subjects)
    ? e.subjects.map((s: any) => (s && s.name) ? s.name : s) : [];
  const raw: ArticleField[] = [
    { field: "id", text: lc(e.id || e.place_id || "") },
    { field: "title", text: lc(e.title || "") },
    { field: "popupDesc", text: lc(e.popupDesc || "") },
    { field: "summary.one_liner", text: lc(sum.one_liner || "") },
    { field: "summary.themes", text: joinArr(sum.themes) },
    { field: "classification.tags", text: joinArr(cls.tags) },
    { field: "classification.knagger", text: joinArr(cls.knagger) },
    { field: "classification.entry_types_in_use", text: joinArr(cls.entry_types_in_use) },
    { field: "subjects", text: joinArr(subjects) },
    { field: "category_hints", text: joinArr(e.category_hints) }
  ];
  return raw.filter((f) => f.text);
}

function articleConfidence(s: CodeScore): "high" | "medium" | "low" {
  if (s.fields.size >= 2) return "high";
  if (s.words.some((w) => ARTICLE_VERY_UNAMBIGUOUS.has(w))) return "high";
  if (s.fields.size === 1) return "medium";
  return "low";
}

// Klassifiser én default-artikkel. Returnerer { group, entry }.
//
// `validCodes` er kodene som faktisk finnes i registeret. En foreslått kode
// regnes som "ny" (needsNewDesignCode) KUN hvis den ikke finnes i registeret
// ennå. Etter "Article register expansion" finnes de tidligere foreslåtte
// artikkelkodene (transport, nature_route, media_history, …), så treff på dem
// blir trygge batch 7-kandidater i stedet for needsNewDesignCode.
function classifyArticleDefault(e: AuditEntity, file: string, validCodes: Set<string>) {
  const fields = articleAnalysisFields(e);
  const sum = e.summary || {};
  const cls = e.classification || {};
  const themes: string[] = Array.isArray(sum.themes) ? sum.themes : [];
  const tags: string[] = Array.isArray(cls.tags) ? cls.tags : [];
  const oneLiner = lc(sum.one_liner || "");
  const popupLen = String(e.popupDesc || "").length;
  const realTitle = !!e.title && lc(e.title) !== lc(e.id || e.place_id || "");

  const scores = new Map<string, CodeScore>();
  const apply = (rules: KeywordRule[]) => {
    rules.forEach(([re, code], order) => {
      for (const f of fields) {
        const ws = findAllMatches(re, f.text);
        if (!ws.length) continue;
        let s = scores.get(code);
        // "Ny" avgjøres dynamisk: koden mangler i registeret.
        if (!s) { s = { code, isNew: !validCodes.has(code), words: [], fields: new Set(), order }; scores.set(code, s); }
        s.fields.add(f.field);
        for (const w of ws) if (!s.words.includes(w)) s.words.push(w);
      }
    });
  };
  apply(ARTICLE_DEFAULT_SAFE_RULES);
  apply(ARTICLE_DEFAULT_NEW_RULES);

  const ranked = [...scores.values()].sort(
    (a, b) => b.fields.size - a.fields.size || Number(a.isNew) - Number(b.isNew) || a.order - b.order);
  const popCulture = ARTICLE_DEFAULT_KEEP_RE.test(
    [themes.join(" "), tags.join(" "), oneLiner, lc(e.popupDesc || "")].join(" "));

  const id = e.id || e.place_id || e.title || "(unknown)";
  const title = e.title || sum.one_liner || id;
  const place_id = e.place_id ||
    (Array.isArray(e.place_ids) && e.place_ids[0]) || "";
  const presentFields = fields.map((f) => f.field);

  const baseEntry = (suggested: string, confidence: string, reason: string,
    words: string[], fieldsUsed: string[], extra?: Record<string, unknown>) => ({
    id, title, place_id, file,
    currentDesignCode: "article_default_miniature",
    suggestedDesignCode: suggested,
    confidence, reason,
    evidence: { matchedWords: words, fieldsUsed },
    ...(extra || {})
  });

  const thinMeta = themes.length === 0 && tags.length === 0 &&
    popupLen < 40 && !oneLiner;

  // 1) For lite metadata til trygg klassifisering.
  if (thinMeta || (ranked.length === 0 && tags.length === 0 && themes.length <= 1 && popupLen < 80)) {
    const missing: string[] = [];
    if (!realTitle) missing.push("title");
    if (themes.length === 0) missing.push("summary.themes");
    if (tags.length === 0) missing.push("classification.tags");
    if (popupLen < 40) missing.push("popupDesc");
    const hint = Array.isArray(e.category_hints) && e.category_hints.length
      ? ` (category_hints: ${e.category_hints.join("/")})` : "";
    return {
      group: "needsMetadata" as ArticleDefaultGroup,
      entry: baseEntry("", "low",
        `for lite metadata til trygg designCode${hint}`,
        [], presentFields, { missing })
    };
  }

  // 2) Ingen nøkkelordtreff, men noe metadata → bevisst generell/neutral.
  if (ranked.length === 0) {
    return {
      group: "keepDefaultForNow" as ArticleDefaultGroup,
      entry: baseEntry("article_default_miniature", "low",
        popCulture
          ? "populærkulturell/blandet artikkel uten klar visuell hovedtype"
          : "generell artikkel uten tydelig fagområde; default beholdes",
        [], presentFields)
    };
  }

  const top = ranked[0];
  const second = ranked[1];
  const tie = second && second.fields.size === top.fields.size &&
    second.code !== top.code;
  const fieldsUsed = [...top.fields];

  // 3) To plausible koder med lik styrke, eller eksplisitt/ny-konflikt.
  if (tie) {
    const words = [...new Set([...top.words, ...second.words])];
    return {
      group: "manualReview" as ArticleDefaultGroup,
      entry: baseEntry(top.code, "low",
        `flere plausible koder med lik styrke: \`${top.code}\` vs \`${second.code}\``,
        words, [...new Set([...top.fields, ...second.fields])],
        { alternativeDesignCode: second.code })
    };
  }

  const confidence = articleConfidence(top);

  // Id/place_id alene er for svakt som batchgrunnlag selv om ordet matcher.
  if (fieldsUsed.every((f) => f === "id" || f === "place_id")) {
    const missing: string[] = [];
    if (!realTitle) missing.push("title");
    if (themes.length === 0) missing.push("summary.themes");
    if (tags.length === 0) missing.push("classification.tags");
    if (popupLen < 40) missing.push("popupDesc");
    if (!missing.length) missing.push("strong non-id metadata signal");
    return {
      group: "needsMetadata" as ArticleDefaultGroup,
      entry: baseEntry(top.code, "low",
        `id/place_id er eneste sterke signal for \`${top.code}\`; trenger bedre metadata før batch`,
        top.words, fieldsUsed, { missing })
    };
  }

  // 4) Ny kode trengs (dagens katalog er for grov).
  if (top.isNew) {
    return {
      group: "needsNewDesignCode" as ArticleDefaultGroup,
      entry: baseEntry(top.code, confidence,
        `temaet dekkes ikke av dagens artikkelkoder; foreslår ny kode \`${top.code}\``,
        top.words, fieldsUsed, { suggestedNewDesignCode: top.code })
    };
  }

  // 5) Eksisterende kode treffer, men populærkulturell ramme gir tvil.
  if (popCulture && top.code === "article_place_essay_miniature" && top.fields.size <= 1) {
    return {
      group: "manualReview" as ArticleDefaultGroup,
      entry: baseEntry(top.code, "low",
        `byrom-/torgessay med populærkulturell ramme; ${top.code} vs default bør avgjøres manuelt`,
        top.words, fieldsUsed)
    };
  }

  // 6) Trygg batch 7-kandidat med tydelig eksisterende kode.
  return {
    group: "safeBatch7Candidates" as ArticleDefaultGroup,
    entry: baseEntry(top.code, confidence,
      `tydelig eksisterende fagområde (${top.words.join(", ")}) → \`${top.code}\``,
      top.words, fieldsUsed)
  };
}


function missingArticleDecisionFields(entry: any): string[] {
  const missing = new Set<string>();
  for (const m of entry.missing || []) missing.add(m);
  if (!entry.title || entry.title === entry.id) missing.add("title");
  const used = new Set(entry.evidence?.fieldsUsed || []);
  if (!used.has("summary.themes")) missing.add("summary.themes");
  if (!used.has("classification.tags")) missing.add("classification.tags");
  if (!used.has("popupDesc")) missing.add("popupDesc");
  return [...missing];
}

function metadataRecommendationFor(entry: any) {
  const idText = lc(`${entry.id} ${entry.title} ${entry.place_id}`);
  if (/bjorvika|fjordbyen|rimelige bolig/.test(idText)) {
    return {
      "summary.themes": ["byutvikling", "boligpolitikk", "fjordbyen"],
      "classification.tags": ["byutvikling", "rimelige boliger", "boligsosial historie"],
      popupDescNeeds: "kort presisering av boligpolitikk og Fjordbyen-kontekst"
    };
  }
  if (/gronland|grønland|tryggere byer|god byutvikling/.test(idText)) {
    return {
      "summary.themes": ["byutvikling", "offentlig rom", "sosial byhistorie"],
      "classification.tags": ["Grønland", "aktivitet i byrom", "trygghet"],
      popupDescNeeds: "kort presisering av om artikkelen primært handler om sosial byutvikling, byrom eller politikk"
    };
  }
  if (/bygdoy_natur|bygdøy natur/.test(idText)) {
    return {
      "summary.themes": ["bynatur", "fjordlandskap", "kulturlandskap"],
      "classification.tags": ["Bygdøy", "naturmiljø", "fjordnær naturbruk"],
      popupDescNeeds: "kort presisering av naturmiljøets hovedtype og bruk"
    };
  }
  if (/furuset|haugerud|skogbelte|boligkant/.test(idText)) {
    return {
      "summary.themes": ["nærnatur", "boligkant", "hverdagsbevegelse"],
      "classification.tags": ["skogbelte", "Alna", "naturkant"],
      popupDescNeeds: "kort presisering av forholdet mellom boligområde og skogbelte"
    };
  }
  return {
    "summary.themes": ["hovedtema må avklares"],
    "classification.tags": ["presise fagord må legges til"],
    popupDescNeeds: "kort presisering av hovedtema"
  };
}

function decisionEntryFromAnalysis(entry: any, group: string, recommendedAction: string, extra?: Record<string, unknown>) {
  const evidence = entry.evidence || {};
  const missingFields = missingArticleDecisionFields(entry);
  return {
    id: entry.id,
    title: entry.title,
    place_id: entry.place_id || "",
    file: entry.file,
    currentDesignCode: "article_default_miniature",
    group,
    reason: entry.reason,
    recommendedAction,
    confidence: entry.confidence,
    evidence: {
      matchedWords: evidence.matchedWords || [],
      fieldsUsed: evidence.fieldsUsed || [],
      missingFields
    },
    ...(extra || {})
  };
}

function buildRemainingArticleDefaultDecision(articleDefaultAnalysis: any) {
  const metadataFirst = (articleDefaultAnalysis.needsMetadata || []).map((entry: any) =>
    decisionEntryFromAnalysis(
      entry,
      "metadataFirst",
      "improve article metadata before assigning a designCode",
      {
        possibleDesignCode: entry.suggestedDesignCode || "",
        recommendedMetadata: metadataRecommendationFor(entry)
      }
    ));

  const newCodeEntries = (articleDefaultAnalysis.needsNewDesignCode || []).map((entry: any) =>
    decisionEntryFromAnalysis(
      entry,
      "registerExpansionCandidates",
      "consider register expansion before any data batch",
      { suggestedDesignCode: entry.suggestedNewDesignCode || entry.suggestedDesignCode }
    ));

  const bySuggested: Record<string, any[]> = {};
  for (const entry of newCodeEntries) {
    const code = entry.suggestedDesignCode;
    (bySuggested[code] = bySuggested[code] || []).push(entry);
  }

  const registerPriority: Record<string, { priority: number; shouldAddNow: boolean; reason: string }> = {
    article_popular_culture_miniature: {
      priority: 5,
      shouldAddNow: true,
      reason: "Mange gjenværende artikler handler eksplisitt om film, TV, scene, standup, kjendissone eller nerdkultur; dette er et reelt hull i artikkelkatalogen."
    },
    article_everyday_life_miniature: {
      priority: 4,
      shouldAddNow: true,
      reason: "Flere park-, møtepunkt- og mobilitetsartikler beskriver hverdagsbruk heller enn natur, institusjon eller stedsessay."
    },
    article_civic_space_miniature: {
      priority: 3,
      shouldAddNow: false,
      reason: "Tydelig systemverdi for torg og offentlig scene, men bare få sikre kandidater i restgruppen; bør vurderes sammen med manuell byromsgjennomgang."
    },
    article_event_place_miniature: {
      priority: 2,
      shouldAddNow: false,
      reason: "Seremonier, parader og sesonghendelser er et mulig visuelt mønster, men restgruppen har for få entydige kandidater til egen kode nå."
    },
    article_neighborhood_identity_miniature: {
      priority: 2,
      shouldAddNow: false,
      reason: "Nabolagsidentitet kan bli nyttig, men én sikker kandidat bør ikke alene drive registerutvidelse."
    },
    article_social_history_miniature: {
      priority: 3,
      shouldAddNow: false,
      reason: "Sosialhistorie er faglig relevant, men restgruppen har få entydige kandidater og flere manuelle grenseflater mot natur/byfornyelse."
    },
    article_nightlife_miniature: {
      priority: 1,
      shouldAddNow: false,
      reason: "Ingen tydelige gjenværende kandidater etter batch 7; ikke legg til kode nå."
    },
    article_education_place_miniature: {
      priority: 1,
      shouldAddNow: false,
      reason: "Ingen tydelige gjenværende kandidater etter batch 7; ikke legg til kode nå."
    }
  };

  const consideredCodes = new Set([...Object.keys(bySuggested), "article_nightlife_miniature", "article_education_place_miniature"]);
  const registerExpansionCandidates = [...consideredCodes].sort().map((code) => {
    const candidates = bySuggested[code] || [];
    const meta = registerPriority[code] || {
      priority: candidates.length >= 3 ? 4 : 2,
      shouldAddNow: candidates.length >= 3,
      reason: candidates.length >= 3
        ? "Flere kandidater peker mot samme manglende artikkelkode."
        : "For få kandidater til å anbefale registerendring nå."
    };
    return {
      suggestedDesignCode: code,
      candidateCount: candidates.length,
      candidateIds: candidates.map((c) => c.id),
      reason: meta.reason,
      shouldAddNow: meta.shouldAddNow,
      priority: meta.priority,
      candidates
    };
  }).sort((a, b) => b.priority - a.priority || b.candidateCount - a.candidateCount || a.suggestedDesignCode.localeCompare(b.suggestedDesignCode));

  const manualReviewBeforeAction = (articleDefaultAnalysis.manualReview || []).map((entry: any) => {
    const possible = [entry.suggestedDesignCode, entry.alternativeDesignCode].filter(Boolean);
    return decisionEntryFromAnalysis(
      entry,
      "manualReviewBeforeAction",
      "human review required before choosing a designCode or keeping default",
      {
        possibleDesignCodes: possible,
        whyAuditShouldNotDecide: "To eller flere koder har omtrent lik evidens i eksisterende metadata, og automatisk valg vil låse en faglig tolkning.",
        recommendedHumanDecision: "Velg én hovedlesning for artikkelen (stedstype, bruk, sosialhistorie eller infrastruktur), eller behold default hvis artikkelen er bevisst blandet."
      }
    );
  });

  const keepDefaultIntentionally = (articleDefaultAnalysis.keepDefaultForNow || []).map((entry: any) =>
    decisionEntryFromAnalysis(
      entry,
      "keepDefaultIntentionally",
      "keep article_default_miniature for now"
    ));

  const deferSafeButLowValue = (articleDefaultAnalysis.safeBatch7Candidates || [])
    .filter((entry: any) => entry.confidence !== "high")
    .map((entry: any) => decisionEntryFromAnalysis(
      entry,
      "deferSafeButLowValue",
      "defer until metadata/register/manual-review work is complete",
      { possibleDesignCode: entry.suggestedDesignCode }
    ));

  const recommendedRoadmap = [
    {
      step: 1,
      title: "Audit-only review of new popular culture/everyday life candidates",
      type: "audit",
      reason: "Registeret har nå egne koder for de to største tidligere hullene; neste steg er å lese de omklassifiserte safe/deferred kandidatene uten å starte en bred artikkelbatch.",
      scope: "Bruk remainingArticleDefaultDecision og articleBatch7Plan som beslutningsgrunnlag; ingen visual.designCode endres av audit alene."
    },
    {
      step: 2,
      title: "Small data batch only for high-confidence candidates",
      type: "data-batch",
      reason: "Etter audit-only gjennomgang kan en liten batch merke bare artikler med tydelig metadata og vedtatte koder, inkludert de nye kodene der evidensen er klar.",
      scope: "Eventuell senere batch skal være smal og eksplisitt ikke en automatisk Article batch 8 over hele restgruppen."
    },
    {
      step: 3,
      title: "Manual review of ambiguous remainder",
      type: "manual-review",
      reason: "Flere artikler har to omtrent like plausible koder eller krever faglig valg mellom sted, bruk, sosialhistorie, byrom og infrastruktur.",
      scope: "Beslutningsnotat per artikkel; kan ende med eksisterende kode, ny kode, metadataarbeid eller bevisst default."
    },
    {
      step: 4,
      title: "Defer further register expansion",
      type: "register",
      reason: "Etter popular culture/everyday life-utvidelsen bør nye registerkoder vente til audit viser et nytt, konsolidert hull med flere sikre kandidater.",
      scope: "Ikke foreslå en ny register-PR umiddelbart; samle civic/social/event/neighborhood-spørsmål med manuell vurdering først."
    },
    {
      step: 5,
      title: "Accept intentional article defaults",
      type: "none",
      reason: "Noen brede, blandede eller svakt visuelle artikler bør ikke presses inn i smale designCodes.",
      scope: "Behold article_default_miniature for artiklene i keepDefaultIntentionally til bedre semantisk grunnlag finnes."
    }
  ];
  return {
    total: articleDefaultAnalysis.total,
    recommendedNextStep: "Do not create Article batch 8 now; run audit-only review of the new popular culture/everyday life candidates, then consider a small high-confidence data batch.",
    metadataFirst,
    registerExpansionCandidates,
    manualReviewBeforeAction,
    keepDefaultIntentionally,
    deferSafeButLowValue,
    recommendedRoadmap
  };
}

// Bygg hele articleDefaultAnalysis + articleBatch7Plan fra artikkel-entiteter.
function buildArticleDefaultAnalysis(articleEntries: WrappedEntity[], resolveFn: Resolver, validCodes: Set<string>) {
  const groups: Record<ArticleDefaultGroup, any[]> = {
    safeBatch7Candidates: [],
    needsMetadata: [],
    needsNewDesignCode: [],
    keepDefaultForNow: [],
    manualReview: []
  };

  for (const { entry: e, file } of articleEntries) {
    const r = resolveFn(e);
    if (r.source !== "default") continue; // kun article_default_miniature
    const { group, entry } = classifyArticleDefault(e, file, validCodes);
    groups[group].push(entry);
  }

  const total = groups.safeBatch7Candidates.length + groups.needsMetadata.length +
    groups.needsNewDesignCode.length + groups.keepDefaultForNow.length +
    groups.manualReview.length;

  // Stabil sortering i hver gruppe (confidence, så kode, så id).
  const confRank: Record<string, number> = { high: 0, medium: 1, low: 2 };
  const sortGroup = (arr: any[]) => arr.sort((a, b) =>
    (confRank[a.confidence] ?? 3) - (confRank[b.confidence] ?? 3) ||
    String(a.suggestedDesignCode).localeCompare(String(b.suggestedDesignCode)) ||
    String(a.id).localeCompare(String(b.id)));
  for (const k of Object.keys(groups) as ArticleDefaultGroup[]) sortGroup(groups[k]);

  const articleDefaultAnalysis = {
    total,
    safeBatch7Candidates: groups.safeBatch7Candidates,
    needsMetadata: groups.needsMetadata,
    needsNewDesignCode: groups.needsNewDesignCode,
    keepDefaultForNow: groups.keepDefaultForNow,
    manualReview: groups.manualReview
  };

  // Batch 7-plan: kun trygge, high/medium-confidence kandidater, prioritert.
  const batchCandidates = groups.safeBatch7Candidates
    .filter((c) => c.confidence === "high" || c.confidence === "medium")
    .map((c) => ({
      id: c.id, title: c.title, place_id: c.place_id, file: c.file,
      suggestedDesignCode: c.suggestedDesignCode, confidence: c.confidence,
      reason: c.reason
    }));

  const articleBatch7Plan = {
    recommendedScope: { min: 0, max: 40 },
    priorityOrder: [
      "safe high/medium-confidence article defaults",
      "only candidates backed by existing metadata",
      "do not include metadata/new-code/default/manual-review groups"
    ],
    candidates: batchCandidates
  };

  return { articleDefaultAnalysis, articleBatch7Plan };
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
function loadFromManifest(manifestPath: string, baseDir: string): WrappedEntity[] {
  const manifest = tryReadJSON(manifestPath) as AuditEntity | null;
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
function analyzeEntities(type: EntityType, wrapped: WrappedEntity[], resolveFn: Resolver, usage: Record<string, number>) {
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
function deepSuggest(type: EntityType, e: AuditEntity, unusedSet: Set<string>) {
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
function buildBatch3(type: EntityType, wrapped: WrappedEntity[], resolveFn: Resolver, unusedSet: Set<string>): BatchSuggestion[] {
  const out: BatchSuggestion[] = [];
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
    String(a.id).localeCompare(b.id as string));
  return out;
}

function main() {
  const registry = readJSON(REGISTRY) as VisualDesignRegistry;
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

  const usage: Record<string, number> = {};
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

  // Klassifisering av de gjenværende article_default_miniature (audit-only).
  const { articleDefaultAnalysis, articleBatch7Plan } =
    buildArticleDefaultAnalysis(articleEntries, resolveForArticle, validCodes);
  const remainingArticleDefaultDecision = buildRemainingArticleDefaultDecision(articleDefaultAnalysis);

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
    articleDefaultAnalysis,
    articleBatch7Plan,
    remainingArticleDefaultDecision,
    pilotBatchStatus: {
      batch1Baseline: 73,
      afterBatch2: 169,
      afterBatch3: 249,
      currentExplicit: totalExplicit,
      currentByEntityType: {
        places: placeStats.withExplicit,
        people: peopleStats.withExplicit,
        articles: articleStats.withExplicit
      },
      addedSinceBatch3: Math.max(0, totalExplicit - 249),
      scope: "Kontrollerte pilot-batcher for visual.designCode-dekning; nåværende total beregnes fra data."
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
  const ada = report.articleDefaultAnalysis;
  console.log(`  article-default analyse:   ${ada.total} (safe ${ada.safeBatch7Candidates.length}, metadata ${ada.needsMetadata.length}, ny-kode ${ada.needsNewDesignCode.length}, keep ${ada.keepDefaultForNow.length}, manuell ${ada.manualReview.length})`);
  console.log(`  batch7-kandidater:         ${report.articleBatch7Plan.candidates.length}`);
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

// Render «Article default analysis»-seksjonen (Del 7) og batch 7-forslaget
// (Del 8). Tall fra JSON, avkortede tabeller for lesbarhet.
function pushArticleDefaultAnalysis(lines: string[], r: AuditReport) {
  const ada = r.articleDefaultAnalysis;
  if (!ada) return;
  lines.push("## Remaining article default audit");
  lines.push("");
  lines.push(`Klassifisering av de gjenværende \`article_default_miniature\`. Denne`);
  lines.push("delen merker **ingen** datafiler – den klassifiserer om en eventuell batch 7 har nok trygge kandidater.");
  lines.push("");
  lines.push(`- total \`article_default_miniature\`: **${ada.total}**`);
  lines.push(`- safeBatch7Candidates: ${ada.safeBatch7Candidates.length}`);
  lines.push(`- needsMetadata: ${ada.needsMetadata.length}`);
  lines.push(`- needsNewDesignCode: ${ada.needsNewDesignCode.length}`);
  lines.push(`- keepDefaultForNow: ${ada.keepDefaultForNow.length}`);
  lines.push(`- manualReview: ${ada.manualReview.length}`);
  lines.push("");

  const idTitle = { head: "id / title", get: (x: any) => `${x.id}${x.title && x.title !== x.id ? " — " + x.title : ""}` };
  const safeCols = [
    idTitle,
    { head: "suggestedDesignCode", get: (x: any) => x.suggestedDesignCode },
    { head: "confidence", get: (x: any) => x.confidence },
    { head: "reason", get: (x: any) => x.reason },
    { head: "file", get: (x: any) => x.file }
  ];
  lines.push("### Trygge batch 7-kandidater");
  lines.push("");
  pushCandidateList(lines, "safeBatch7Candidates", ada.safeBatch7Candidates, MD_MAX_ADA_SAFE, safeCols);

  const metaCols = [
    idTitle,
    { head: "missing", get: (x: any) => (x.missing || []).join(", ") },
    { head: "reason", get: (x: any) => x.reason },
    { head: "file", get: (x: any) => x.file }
  ];
  lines.push("### Mangler metadata");
  lines.push("");
  pushCandidateList(lines, "needsMetadata", ada.needsMetadata, MD_MAX_ADA_METADATA, metaCols);

  // Trenger ny designCode – gruppert etter suggestedNewDesignCode.
  lines.push("### Trenger mulig ny designCode");
  lines.push("");
  const nn = ada.needsNewDesignCode || [];
  lines.push(`#### needsNewDesignCode (${nn.length})`);
  lines.push("");
  if (!nn.length) {
    lines.push("- (ingen)");
    lines.push("");
  } else {
    const byNew: Record<string, any[]> = {};
    for (const it of nn) {
      const k = it.suggestedNewDesignCode || it.suggestedDesignCode;
      (byNew[k] = byNew[k] || []).push(it);
    }
    for (const code of Object.keys(byNew).sort()) {
      const items = byNew[code];
      lines.push(`- \`${code}\` (${items.length}):`);
      for (const it of items.slice(0, 20)) {
        lines.push(`  - ${mdEscape(it.id)} [${it.confidence}] — ${mdEscape(it.reason)} (\`${mdEscape(it.file)}\`)`);
      }
      if (items.length > 20) lines.push(`  - _… ${items.length - 20} til i JSON._`);
    }
    lines.push("");
  }

  const keepCols = [
    idTitle,
    { head: "reason", get: (x: any) => x.reason },
    { head: "file", get: (x: any) => x.file }
  ];
  lines.push("### Bør forbli default foreløpig");
  lines.push("");
  pushCandidateList(lines, "keepDefaultForNow", ada.keepDefaultForNow, MD_MAX_ADA_KEEP, keepCols);

  const manualCols = [
    idTitle,
    { head: "suggestedDesignCode", get: (x: any) => x.suggestedDesignCode },
    { head: "reason", get: (x: any) => x.reason },
    { head: "file", get: (x: any) => x.file }
  ];
  lines.push("### Manuell vurdering");
  lines.push("");
  pushCandidateList(lines, "manualReview", ada.manualReview, MD_MAX_ADA_MANUAL, manualCols);

  // ---- Del 8: Forslag til Article batch 7 ----
  const plan = r.articleBatch7Plan;
  if (plan) {
    lines.push("## Article batch 7 plan");
    lines.push("");
    lines.push(`Anbefalt omfang: **${plan.recommendedScope.min}–${plan.recommendedScope.max}** artikler (ikke press frem batch hvis kandidatgrunnlaget er lite).`);
    if (plan.candidates.length < 20) {
      lines.push(`Audit finner bare **${plan.candidates.length}** trygge kandidater nå; det er et lite grunnlag, så en batch 7 bør ikke presses frem.`);
    }
    lines.push("Prioritert rekkefølge:");
    for (const p of plan.priorityOrder) lines.push(`1. ${p}`);
    lines.push("");
    lines.push("Kun trygge kandidater (high/medium-confidence). `needsMetadata` og");
    lines.push("`needsNewDesignCode` tas **ikke** med som direkte batchkandidater.");
    lines.push("");
    const shown = plan.candidates.slice(0, MD_MAX_ADA_BATCH7);
    lines.push(`Topp ${shown.length} av ${plan.candidates.length}, gruppert etter \`suggestedDesignCode\`:`);
    lines.push("");
    if (!plan.candidates.length) {
      lines.push("- (ingen)");
    } else {
      const byCode: Record<string, any[]> = {};
      for (const c of shown) (byCode[c.suggestedDesignCode] = byCode[c.suggestedDesignCode] || []).push(c);
      for (const code of Object.keys(byCode).sort()) {
        lines.push(`- \`${code}\` (${byCode[code].length}):`);
        for (const c of byCode[code]) {
          lines.push(`  - ${mdEscape(c.id)} [${c.confidence}] — ${mdEscape(c.reason)}`);
        }
      }
      if (plan.candidates.length > shown.length) {
        lines.push("");
        lines.push(`_Viser ${shown.length} av ${plan.candidates.length}. Full liste i \`articleBatch7Plan.candidates\` i JSON._`);
      }
    }
    lines.push("");
  }
}


function pushRemainingArticleDefaultDecision(lines: string[], r: AuditReport) {
  const d = r.remainingArticleDefaultDecision;
  if (!d) return;
  lines.push("## Remaining article-default decision");
  lines.push("");
  lines.push("Dette er en audit-/beslutningsseksjon etter Article batch 7, ikke en ny data-batch. Den merker ingen artikler og endrer ikke register eller resolver.");
  lines.push("");
  lines.push(`- total remaining \`article_default_miniature\`: **${d.total}**`);
  lines.push(`- metadataFirst count: ${d.metadataFirst.length}`);
  const registerArticleCount = (d.registerExpansionCandidates || []).reduce((sum: number, g: any) => sum + (g.candidateCount || 0), 0);
  lines.push(`- registerExpansionCandidates count: ${registerArticleCount} artikler / ${(d.registerExpansionCandidates || []).length} kodeforslag`);
  lines.push(`- manualReviewBeforeAction count: ${d.manualReviewBeforeAction.length}`);
  lines.push(`- keepDefaultIntentionally count: ${d.keepDefaultIntentionally.length}`);
  lines.push(`- deferSafeButLowValue count: ${d.deferSafeButLowValue.length}`);
  lines.push("");
  lines.push(`**Anbefalt neste steg:** ${mdEscape(d.recommendedNextStep)}`);
  lines.push("");

  lines.push("### Metadata først");
  lines.push("");
  const metaCols = [
    { head: "id/title", get: (x: any) => `${x.id}${x.title && x.title !== x.id ? " — " + x.title : ""}` },
    { head: "missing metadata", get: (x: any) => (x.evidence?.missingFields || []).join(", ") || "—" },
    { head: "recommended metadata", get: (x: any) => {
      const rm = x.recommendedMetadata || {};
      const themes = (rm["summary.themes"] || []).join("/");
      const tags = (rm["classification.tags"] || []).join("/");
      return `themes: ${themes || "—"}; tags: ${tags || "—"}; popupDesc: ${rm.popupDescNeeds || "—"}`;
    } },
    { head: "file", get: (x: any) => x.file }
  ];
  pushCandidateList(lines, "metadataFirst", d.metadataFirst, d.metadataFirst.length, metaCols);

  lines.push("### Mulige nye designCodes");
  lines.push("");
  if (!d.registerExpansionCandidates.length) {
    lines.push("- (ingen)");
    lines.push("");
  } else {
    for (const group of d.registerExpansionCandidates) {
      const examples = (group.candidates || []).slice(0, 5).map((c: any) => c.id).join(", ") || "—";
      lines.push(`#### \`${group.suggestedDesignCode}\``);
      lines.push("");
      lines.push(`- candidateCount: ${group.candidateCount}`);
      lines.push(`- priority: ${group.priority}`);
      lines.push(`- shouldAddNow: ${group.shouldAddNow}`);
      lines.push(`- eksempelartikler: ${mdEscape(examples)}`);
      lines.push(`- reason: ${mdEscape(group.reason)}`);
      lines.push("");
    }
  }

  lines.push("### Manuell vurdering");
  lines.push("");
  const manualCols = [
    { head: "id/title", get: (x: any) => `${x.id}${x.title && x.title !== x.id ? " — " + x.title : ""}` },
    { head: "possibleDesignCodes", get: (x: any) => (x.possibleDesignCodes || []).join(", ") },
    { head: "reason", get: (x: any) => x.reason },
    { head: "file", get: (x: any) => x.file }
  ];
  pushCandidateList(lines, "manualReviewBeforeAction", d.manualReviewBeforeAction, d.manualReviewBeforeAction.length, manualCols);

  lines.push("### Behold default foreløpig");
  lines.push("");
  const keepCols = [
    { head: "id/title", get: (x: any) => `${x.id}${x.title && x.title !== x.id ? " — " + x.title : ""}` },
    { head: "reason", get: (x: any) => x.reason },
    { head: "file", get: (x: any) => x.file }
  ];
  pushCandidateList(lines, "keepDefaultIntentionally", d.keepDefaultIntentionally, d.keepDefaultIntentionally.length, keepCols);

  lines.push("### Vent selv om mulig");
  lines.push("");
  const deferCols = [
    { head: "id/title", get: (x: any) => `${x.id}${x.title && x.title !== x.id ? " — " + x.title : ""}` },
    { head: "possibleDesignCode", get: (x: any) => x.possibleDesignCode || "—" },
    { head: "reason", get: (x: any) => x.reason }
  ];
  pushCandidateList(lines, "deferSafeButLowValue", d.deferSafeButLowValue, d.deferSafeButLowValue.length, deferCols);

  lines.push("### Anbefalt neste PR-rekkefølge");
  lines.push("");
  lines.push("| step | title | type | reason | scope |");
  lines.push("| --- | --- | --- | --- | --- |");
  for (const step of d.recommendedRoadmap || []) {
    lines.push(`| ${step.step} | ${mdEscape(step.title)} | ${mdEscape(step.type)} | ${mdEscape(step.reason)} | ${mdEscape(step.scope)} |`);
  }
  lines.push("");
}

function toMarkdown(r: AuditReport) {
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
  const exEntityLabels: Array<[string, Record<string, number> | undefined]> = [["places", ex.places], ["people", ex.people], ["articles", ex.articles]];
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

  const pbs = r.pilotBatchStatus;
  if (pbs) {
    lines.push("## Pilot batch status");
    lines.push("");
    lines.push(`- Batch 1-baseline: ${pbs.batch1Baseline} eksplisitte \`visual.designCode\`.`);
    lines.push(`- Etter batch 2: ${pbs.afterBatch2} eksplisitte \`visual.designCode\`.`);
    lines.push(`- Etter batch 3: ${pbs.afterBatch3} eksplisitte \`visual.designCode\`.`);
    lines.push(`- Nåværende total: ${pbs.currentExplicit} eksplisitte \`visual.designCode\` (${pbs.currentByEntityType.places} places, ${pbs.currentByEntityType.people} people, ${pbs.currentByEntityType.articles} articles).`);
    lines.push(`- Endring siden batch 3: ${pbs.addedSinceBatch3}.`);
    lines.push(`- Omfang: ${pbs.scope}`);
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

  // ---- Article default analysis ----
  pushArticleDefaultAnalysis(lines, r);

  // ---- Restgruppebeslutning etter Article batch 7 ----
  pushRemainingArticleDefaultDecision(lines, r);

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
