/*
 * js/visualDesignCodes.js
 *
 * Shared visual design-code resolver for History Go / Civication.
 *
 * Data (places, people, articles/stories/leksikon/lesespor) point to a
 * `designCode`. Renderers (Three.js miniatures, Canvas map, cards, icons,
 * encyclopedia) read the resolved code's `renderHints` and decide how to draw
 * it. This module is a metadata/resolver layer only – it never renders, never
 * mutates the data objects it inspects, and never throws into the app if the
 * registry has not loaded yet.
 *
 * Registry: data/visualDesignCodes.json (schema history-go.visual-design-codes.v1)
 *
 * Public API (window.HGVisualDesignCodes):
 *   init(opts?)              -> Promise<boolean>  loads the registry (idempotent)
 *   get(code)                -> entry | null
 *   all()                    -> { code: entry, ... }   (shallow copy)
 *   resolveForPlace(place)   -> { designCode, entry, source }
 *   resolveForPerson(person) -> { designCode, entry, source }
 *   resolveForArticle(art)   -> { designCode, entry, source }
 *   normalizeDesignCode(x)   -> string | null
 *   getRenderHint(code, key) -> hint value | null
 *   isValidCode(code)        -> boolean
 *
 * The resolver works even before init() resolves: it falls back to its built-in
 * heuristics and returns a designCode string with `entry: null`. Once the
 * registry is loaded, entries are attached and codes are validated against it.
 */
(function () {
  "use strict";

  var DEFAULT_URL = "data/visualDesignCodes.json";

  // Loaded registry (null until init succeeds). Codes are keyed by id.
  var _codes = null;
  var _loadPromise = null;
  var _loaded = false;

  // ---- small helpers ------------------------------------------------------

  function lc(v) { return String(v == null ? "" : v).trim().toLowerCase(); }

  function asArray(v) {
    if (Array.isArray(v)) return v;
    if (v == null || v === "") return [];
    return [v];
  }

  // Build a lowercase "haystack" from several candidate fields/arrays.
  function haystack(parts) {
    var out = [];
    for (var i = 0; i < parts.length; i++) {
      var p = parts[i];
      if (p == null) continue;
      if (Array.isArray(p)) out.push(p.map(lc).join(" "));
      else out.push(lc(p));
    }
    return out.join(" ").trim();
  }

  // Default codes per entity family.
  var DEFAULTS = {
    place: "default_miniature",
    person: "person_default_miniature",
    article: "article_default_miniature"
  };

  // ---- place keyword -> designCode -----------------------------------------
  // Mirrors the spirit of CivicationThreeMap.resolvePlaceMiniatureType but
  // returns full designCodes. The map there reads renderHints.threeType back.

  // assetType / explicit keyword tokens -> designCode.
  var PLACE_ASSET_TO_CODE = {
    opera: "opera_miniature",
    palace: "palace_miniature",
    cemetery: "cemetery_miniature",
    monument: "monument_miniature",
    farm: "farm_estate_miniature",
    estate: "farm_estate_miniature",
    prison: "prison_miniature",
    stadium: "stadium_miniature",
    arena: "stadium_miniature",
    sports_field: "sports_field_miniature",
    ice_arena: "ice_arena_miniature",
    museum: "museum_miniature",
    gallery: "gallery_miniature",
    theatre: "theatre_miniature",
    theater: "theatre_miniature",
    music_venue: "music_venue_miniature",
    venue: "music_venue_miniature",
    cinema: "cinema_miniature",
    library: "library_miniature",
    church: "church_miniature",
    school: "school_miniature",
    university: "university_miniature",
    station: "station_miniature",
    park: "park_miniature",
    playground: "playground_miniature",
    square: "square_miniature",
    street: "street_miniature",
    fortress: "fortress_miniature",
    civic: "civic_miniature",
    waterfront: "waterfront_miniature",
    harbor: "waterfront_miniature",
    industrial: "industrial_miniature",
    warehouse: "industrial_miniature",
    commerce: "commerce_miniature",
    shop: "commerce_miniature",
    apartment: "apartment_block_miniature",
    apartment_block: "apartment_block_miniature",
    subculture: "subculture_miniature",
    skyline: "apartment_block_miniature",
    default: "default_miniature"
  };

  // category -> designCode (used when keyword heuristics do not match).
  var PLACE_CATEGORY_TO_CODE = {
    sport: "sports_field_miniature",
    kunst: "museum_miniature",
    litteratur: "library_miniature",
    musikk: "music_venue_miniature",
    film: "cinema_miniature",
    film_tv: "cinema_miniature",
    popkultur: "music_venue_miniature",
    populaerkultur: "music_venue_miniature",
    subkultur: "subculture_miniature",
    natur: "park_miniature",
    politikk: "civic_miniature",
    media: "civic_miniature",
    vitenskap: "university_miniature",
    psykologi: "university_miniature",
    naeringsliv: "commerce_miniature",
    by: "apartment_block_miniature"
  };

  // Ordered keyword heuristics for places. First match wins. The ice_arena
  // rule stays narrow on purpose so skating-history athletics stadiums (Bislett)
  // still resolve to stadium.
  var PLACE_KEYWORD_RULES = [
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

  // ---- person heuristics ---------------------------------------------------

  var PERSON_KEYWORD_RULES = [
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

  var PERSON_CATEGORY_TO_CODE = {
    sport: "person_athlete_miniature",
    litteratur: "person_writer_miniature",
    kunst: "person_artist_miniature",
    musikk: "person_musician_miniature",
    popkultur: "person_musician_miniature",
    populaerkultur: "person_musician_miniature",
    film: "person_actor_miniature",
    film_tv: "person_actor_miniature",
    politikk: "person_politician_miniature",
    media: "person_activist_miniature",
    vitenskap: "person_scientist_miniature",
    psykologi: "person_scientist_miniature",
    historie: "person_historical_miniature",
    natur: "person_explorer_miniature",
    subkultur: "person_local_legend_miniature"
  };

  // ---- article heuristics --------------------------------------------------

  // Ordered article keyword heuristics. First match wins, so more specific
  // rules come before broad ones (e.g. religion/science/media/nature/transport
  // before architecture/institution/art/place_essay).
  //
  // The precise topic codes added in the "Article register expansion" carry a
  // third element `true` = TOPICAL-ONLY. Those rules are matched against the
  // structured topical metadata (type/topic/category/tags/themes/subject) and
  // NOT against the free-text id/title slug. This keeps the new codes available
  // as heuristic capability without reclassifying existing articles that merely
  // mention a topic word in their id/title – data is marked explicitly in a
  // later, controlled batch instead. Broad/legacy rules keep reading the full
  // haystack (incl. id/title) exactly as before.
  var ARTICLE_KEYWORD_RULES = [
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

  var ARTICLE_CATEGORY_TO_CODE = {
    historie: "article_history_miniature",
    sport: "article_sports_history_miniature",
    musikk: "article_music_history_miniature",
    litteratur: "article_literature_miniature",
    kunst: "article_art_miniature",
    arkitektur: "article_architecture_miniature",
    politikk: "article_political_history_miniature",
    sprak: "article_language_miniature",
    "språk": "article_language_miniature",
    by: "article_local_story_miniature",
    natur: "article_place_essay_miniature",
    populærkultur: "article_popular_culture_miniature",
    populaerkultur: "article_popular_culture_miniature",
    popkultur: "article_popular_culture_miniature",
    hverdagsliv: "article_everyday_life_miniature"
  };

  // ---- registry access -----------------------------------------------------

  function isValidCode(code) {
    var c = normalizeDesignCode(code);
    if (!c) return false;
    if (!_codes) return false;
    return Object.prototype.hasOwnProperty.call(_codes, c);
  }

  function get(code) {
    var c = normalizeDesignCode(code);
    if (!c || !_codes) return null;
    return Object.prototype.hasOwnProperty.call(_codes, c) ? _codes[c] : null;
  }

  function all() {
    if (!_codes) return {};
    var out = {};
    for (var k in _codes) {
      if (Object.prototype.hasOwnProperty.call(_codes, k)) out[k] = _codes[k];
    }
    return out;
  }

  function normalizeDesignCode(x) {
    if (x == null) return null;
    var s = String(x).trim();
    if (!s) return null;
    return s;
  }

  function getRenderHint(code, key) {
    var entry = get(code);
    if (!entry || !entry.renderHints) return null;
    var v = entry.renderHints[key];
    return v == null ? null : v;
  }

  // Wrap a resolved code into the standard return shape. Attaches the registry
  // entry when available, otherwise entry: null (resolver still usable early).
  function result(code, source) {
    var entry = get(code);
    return { designCode: code, entry: entry, source: source };
  }

  // ---- resolvers -----------------------------------------------------------

  function explicitCode(obj) {
    if (!obj) return null;
    var v = obj.visual && obj.visual.designCode;
    if (v == null && obj.designCode != null) v = obj.designCode;
    return normalizeDesignCode(v);
  }

  function resolveForPlace(place) {
    if (!place || typeof place !== "object") return result(DEFAULTS.place, "default");

    var explicit = explicitCode(place);
    if (explicit) {
      // Explicit always wins. If the registry is loaded it must be valid;
      // otherwise we trust it (registry may not be loaded yet).
      if (!_loaded || isValidCode(explicit)) return result(explicit, "explicit");
    }

    var cm = place.civiMap || {};
    var assetType = lc(cm.assetType || place.mapAssetType || place.assetType || "");
    if (assetType && PLACE_ASSET_TO_CODE[assetType]) {
      return result(PLACE_ASSET_TO_CODE[assetType], "assetType");
    }

    var qp = place.quiz_profile || {};
    var hay = haystack([
      place.id, place.name, place.title,
      qp.place_type, qp.subtype, assetType
    ]);

    for (var i = 0; i < PLACE_KEYWORD_RULES.length; i++) {
      if (PLACE_KEYWORD_RULES[i][0].test(hay)) {
        return result(PLACE_KEYWORD_RULES[i][1], "heuristic");
      }
    }

    var cat = lc(place.category);
    if (cat && PLACE_CATEGORY_TO_CODE[cat]) {
      // Category sport: keep stadium/ice_arena split if hints are present.
      if (cat === "sport") {
        if (/jordal|ishall|amfi/.test(hay)) return result("ice_arena_miniature", "category");
        if (/stadion|arena/.test(hay)) return result("stadium_miniature", "category");
      }
      return result(PLACE_CATEGORY_TO_CODE[cat], "category");
    }

    var ptype = lc(qp.place_type);
    if (/park/.test(ptype)) return result("park_miniature", "heuristic");
    if (/kirke/.test(ptype)) return result("church_miniature", "heuristic");
    if (/museum/.test(ptype)) return result("museum_miniature", "heuristic");
    if (/stadion/.test(ptype)) return result("stadium_miniature", "heuristic");

    return result(DEFAULTS.place, "default");
  }

  function resolveForPerson(person) {
    if (!person || typeof person !== "object") return result(DEFAULTS.person, "default");

    var explicit = explicitCode(person);
    if (explicit) {
      if (!_loaded || isValidCode(explicit)) return result(explicit, "explicit");
    }

    var role = lc(person.role);
    var prof = lc(person.profession);
    var sport = lc(person.sport);
    var hay = haystack([
      role, prof, sport, person.tags,
      person.id, person.name, person.title, person.desc
    ]);

    for (var i = 0; i < PERSON_KEYWORD_RULES.length; i++) {
      if (PERSON_KEYWORD_RULES[i][0].test(hay)) {
        return result(PERSON_KEYWORD_RULES[i][1], "heuristic");
      }
    }

    var cat = lc(person.category);
    if (cat && PERSON_CATEGORY_TO_CODE[cat]) {
      return result(PERSON_CATEGORY_TO_CODE[cat], "category");
    }

    return result(DEFAULTS.person, "default");
  }

  function resolveForArticle(article) {
    if (!article || typeof article !== "object") return result(DEFAULTS.article, "default");

    var explicit = explicitCode(article);
    if (explicit) {
      if (!_loaded || isValidCode(explicit)) return result(explicit, "explicit");
    }

    var type = lc(article.type);
    var topic = lc(article.topic);
    // Full haystack (incl. free-text id/title) for broad/legacy rules.
    var hay = haystack([
      type, topic, article.category, article.tags, article.themes,
      article.title, article.id, article.subject
    ]);
    // Structured topical metadata only (no id/title) for the precise topic
    // codes flagged TOPICAL-ONLY in ARTICLE_KEYWORD_RULES.
    var topicalHay = haystack([
      type, topic, article.category, article.tags, article.themes,
      article.subject
    ]);

    for (var i = 0; i < ARTICLE_KEYWORD_RULES.length; i++) {
      var rule = ARTICLE_KEYWORD_RULES[i];
      var h = rule[2] ? topicalHay : hay;
      if (rule[0].test(h)) {
        return result(rule[1], "heuristic");
      }
    }

    var cat = lc(article.category);
    if (cat && ARTICLE_CATEGORY_TO_CODE[cat]) {
      return result(ARTICLE_CATEGORY_TO_CODE[cat], "category");
    }

    return result(DEFAULTS.article, "default");
  }

  // ---- loading -------------------------------------------------------------

  function ingest(json) {
    if (json && json.codes && typeof json.codes === "object") {
      _codes = json.codes;
      _loaded = true;
      return true;
    }
    return false;
  }

  function init(opts) {
    if (_loadPromise) return _loadPromise;
    var url = (opts && opts.url) || DEFAULT_URL;

    // If a registry object was injected directly (e.g. tests), use it.
    if (opts && opts.data) {
      _loadPromise = Promise.resolve(ingest(opts.data));
      return _loadPromise;
    }

    if (typeof fetch !== "function") {
      // No fetch (e.g. plain node). Stay in heuristic-only mode without error.
      _loadPromise = Promise.resolve(false);
      return _loadPromise;
    }

    _loadPromise = fetch(url)
      .then(function (res) {
        if (!res || !res.ok) throw new Error("HTTP " + (res && res.status));
        return res.json();
      })
      .then(function (json) { return ingest(json); })
      .catch(function (err) {
        // Never crash the app. Resolver keeps working via heuristics.
        if (typeof console !== "undefined" && console.warn) {
          console.warn("[HGVisualDesignCodes] registry load failed, using heuristics:", err && err.message ? err.message : err);
        }
        return false;
      });
    return _loadPromise;
  }

  var api = {
    init: init,
    get: get,
    all: all,
    resolveForPlace: resolveForPlace,
    resolveForPerson: resolveForPerson,
    resolveForArticle: resolveForArticle,
    normalizeDesignCode: normalizeDesignCode,
    getRenderHint: getRenderHint,
    isValidCode: isValidCode,
    // Introspection helpers (handy for tests / audit / dev console).
    _isLoaded: function () { return _loaded; },
    _ingest: ingest
  };

  if (typeof window !== "undefined") {
    window.HGVisualDesignCodes = api;
    // Kick off a non-blocking load. Failure is swallowed in init().
    try { api.init(); } catch (e) { /* never block */ }
  }

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
})();
