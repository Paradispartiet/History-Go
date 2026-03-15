(function () {
  const STOPWORDS = new Set([
    "Oslo", "Norge", "Norway", "By", "Gate", "Gata", "Vei", "Veien",
    "Plass", "Park", "Sentrum", "Bjørvika", "Grünerløkka", "Løkka",
    "Majorstua", "Gamlebyen", "Tøyen", "Aker", "Brygge", "Karl", "Johan",
    "Markveien", "Bogstadveien", "Torggata", "Vulkan", "Barcode",
    "Place", "Store", "Brand", "Concept", "Hotel", "Hotels"
  ]);

  const BRAND_HINT_PATTERNS = [
    /\bbrand\b/i,
    /\bbrand store\b/i,
    /\bconcept store\b/i,
    /\bkonseptbutikk\b/i,
    /\bmerkebutikk\b/i,
    /\blogo\b/i,
    /\breklameskilt\b/i,
    /\bgavlreklame\b/i,
    /\bsignage\b/i,
    /\blegendarisk\b/i,
    /\blegendary\b/i,
    /\bcult\b/i,
    /\bkult\b/i,
    /\biconic\b/i,
    /\bikonisk\b/i,
    /\bluxury\b/i,
    /\bluksus\b/i,
    /\badvokat\b/i,
    /\blaw firm\b/i,
    /\bvenue\b/i,
    /\butested\b/i,
    /\bbar\b/i,
    /\bclub\b/i,
    /\bplatebutikk\b/i,
    /\brecord store\b/i,
    /\bforhandler\b/i,
    /\bdealer\b/i
  ];

  const FIELD_NAMES = [
    "brands",
    "brand_candidates",
    "brandCandidates",
    "brand_names",
    "brandNames",
    "logos",
    "logo_names",
    "logoNames",
    "tenants",
    "stores",
    "venues",
    "legacy_brands",
    "legacyBrands",
    "signage",
    "named_entities",
    "namedEntities"
  ];

  function asString(v) {
    return typeof v === "string" ? v.trim() : "";
  }

  function ensureArray(v) {
    return Array.isArray(v) ? v : [];
  }

  function uniq(arr) {
    return [...new Set(ensureArray(arr).map(asString).filter(Boolean))];
  }

  function slugify(v) {
    return asString(v)
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/&/g, " and ")
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "");
  }

  function maybeBrandishName(name) {
    const s = asString(name);
    if (!s) return false;
    if (s.length < 2) return false;
    if (STOPWORDS.has(s)) return false;
    if (/^\d+$/.test(s)) return false;
    if (/^(butikk|store|brand|logo|reklame|skilt)$/i.test(s)) return false;
    return true;
  }

  function makeRawCandidate(name, extra = {}) {
    const clean = asString(name);
    if (!maybeBrandishName(clean)) return null;

    return {
      id: extra.id || slugify(clean),
      name: clean,
      brand_type: asString(extra.brand_type),
      sector: asString(extra.sector),
      status: asString(extra.status),
      verification: asString(extra.verification),
      logo: asString(extra.logo),
      popupdesc: asString(extra.popupdesc),
      desc: asString(extra.desc),
      tags: uniq(extra.tags || []),
      source_text: asString(extra.source_text),
      source_kind: asString(extra.source_kind),
      source_place_id: asString(extra.source_place_id),
      source_url: asString(extra.source_url)
    };
  }

  function extractExplicitFields(place) {
    const out = [];

    for (const field of FIELD_NAMES) {
      const value = place?.[field];

      if (Array.isArray(value)) {
        value.forEach(item => {
          if (typeof item === "string") {
            const cand = makeRawCandidate(item, {
              source_kind: `place.${field}`,
              source_place_id: place.id
            });
            if (cand) out.push(cand);
          } else if (item && typeof item === "object") {
            const cand = makeRawCandidate(
              item.name || item.title || item.label || item.id,
              {
                ...item,
                source_kind: `place.${field}`,
                source_place_id: place.id
              }
            );
            if (cand) out.push(cand);
          }
        });
      } else if (typeof value === "string") {
        const parts = value.split(/[,;|]/g).map(asString).filter(Boolean);
        parts.forEach(part => {
          const cand = makeRawCandidate(part, {
            source_kind: `place.${field}`,
            source_place_id: place.id
          });
          if (cand) out.push(cand);
        });
      }
    }

    return out;
  }

  function extractQuotedNames(text, placeId, sourceKind) {
    const out = [];
    const s = asString(text);
    if (!s) return out;

    const regexes = [
      /"([^"]{2,60})"/g,
      /«([^»]{2,60})»/g,
      /'([^']{2,60})'/g
    ];

    regexes.forEach(re => {
      let m;
      while ((m = re.exec(s))) {
        const cand = makeRawCandidate(m[1], {
          source_kind: sourceKind,
          source_place_id: placeId,
          source_text: s
        });
        if (cand) out.push(cand);
      }
    });

    return out;
  }

  function extractCapitalizedPhrases(text, placeId, sourceKind) {
    const out = [];
    const s = asString(text);
    if (!s) return out;

    const re = /\b([A-ZÆØÅ][A-Za-zÆØÅæøå0-9'.&-]+(?:\s+[A-ZÆØÅ][A-Za-zÆØÅæøå0-9'.&-]+){0,3})\b/g;
    let m;

    while ((m = re.exec(s))) {
      const phrase = asString(m[1]);
      if (!maybeBrandishName(phrase)) continue;
      if (phrase.split(" ").every(w => STOPWORDS.has(w))) continue;

      const cand = makeRawCandidate(phrase, {
        source_kind: sourceKind,
        source_place_id: placeId,
        source_text: s
      });

      if (cand) out.push(cand);
    }

    return out;
  }

  function textLooksBrandRelevant(text) {
    const s = asString(text);
    if (!s) return false;
    return BRAND_HINT_PATTERNS.some(re => re.test(s));
  }

  function extractFromTexts(place) {
    const out = [];
    const textFields = [
      "desc",
      "popupdesc",
      "history",
      "notes",
      "narrative",
      "story",
      "stories",
      "identity",
      "culture",
      "commerce",
      "business",
      "nearby"
    ];

    textFields.forEach(field => {
      const value = place?.[field];
      if (typeof value !== "string") return;
      if (!textLooksBrandRelevant(value)) return;

      out.push(...extractQuotedNames(value, place.id, `place.${field}`));
      out.push(...extractCapitalizedPhrases(value, place.id, `place.${field}`));
    });

    return out;
  }

  function extractFromRelations(place, relations) {
    const out = [];

    ensureArray(relations).forEach(rel => {
      const text = [
        rel?.type,
        rel?.kind,
        rel?.label,
        rel?.desc,
        rel?.popupdesc,
        ...(ensureArray(rel?.tags))
      ].map(asString).join(" ");

      if (!textLooksBrandRelevant(text)) return;

      const directName =
        rel?.brand_name || rel?.brand || rel?.name || rel?.title || rel?.label;

      if (directName) {
        const cand = makeRawCandidate(directName, {
          brand_type: asString(rel?.brand_type),
          sector: asString(rel?.sector),
          popupdesc: asString(rel?.popupdesc || rel?.desc),
          desc: asString(rel?.desc),
          tags: rel?.tags,
          source_kind: "relations",
          source_place_id: place.id,
          source_text: text
        });
        if (cand) out.push(cand);
      }

      out.push(...extractQuotedNames(text, place.id, "relations"));
      out.push(...extractCapitalizedPhrases(text, place.id, "relations"));
    });

    return out;
  }

  function extractFromStories(place, stories) {
    const out = [];

    ensureArray(stories).forEach(st => {
      const text = [
        st?.title,
        st?.summary,
        st?.story,
        st?.type,
        ...(ensureArray(st?.tags))
      ].map(asString).join(" ");

      if (!textLooksBrandRelevant(text)) return;

      out.push(...extractQuotedNames(text, place.id, "stories"));
      out.push(...extractCapitalizedPhrases(text, place.id, "stories"));
    });

    return out;
  }

  function extractFromWonderkammer(place, wkChambers) {
    const out = [];

    ensureArray(wkChambers).forEach(ch => {
      const text = [
        ch?.title,
        ch?.label,
        ch?.name,
        ch?.desc,
        ch?.popupdesc,
        ...(ensureArray(ch?.tags))
      ].map(asString).join(" ");

      if (!textLooksBrandRelevant(text)) return;

      out.push(...extractQuotedNames(text, place.id, "wonderkammer"));
      out.push(...extractCapitalizedPhrases(text, place.id, "wonderkammer"));
    });

    return out;
  }

  function extractFromEvents(place, events) {
    const out = [];

    ensureArray(events).forEach(evt => {
      const text = [
        evt?.title,
        evt?.organizer,
        evt?.description,
        evt?.venue_name,
        ...(ensureArray(evt?.tags))
      ].map(asString).join(" ");

      if (!textLooksBrandRelevant(text)) return;

      if (evt?.organizer) {
        const cand = makeRawCandidate(evt.organizer, {
          source_kind: "events.organizer",
          source_place_id: place.id,
          source_text: text
        });
        if (cand) out.push(cand);
      }

      out.push(...extractQuotedNames(text, place.id, "events"));
      out.push(...extractCapitalizedPhrases(text, place.id, "events"));
    });

    return out;
  }

  function mergeCandidates(candidates) {
    const byId = {};

    ensureArray(candidates).forEach(raw => {
      if (!raw) return;

      const id = asString(raw.id) || slugify(raw.name);
      if (!id) return;

      if (!byId[id]) {
        byId[id] = {
          ...raw,
          id,
          tags: uniq(raw.tags),
          place_ids: uniq([raw.source_place_id].filter(Boolean)),
          source_kinds: uniq([raw.source_kind].filter(Boolean))
        };
        return;
      }

      const prev = byId[id];

      byId[id] = {
        ...prev,
        name: prev.name || raw.name,
        brand_type: prev.brand_type || raw.brand_type,
        sector: prev.sector || raw.sector,
        status: prev.status || raw.status,
        verification: prev.verification || raw.verification,
        logo: prev.logo || raw.logo,
        popupdesc: prev.popupdesc || raw.popupdesc,
        desc: prev.desc || raw.desc,
        source_url: prev.source_url || raw.source_url,
        tags: uniq([...(prev.tags || []), ...(raw.tags || [])]),
        place_ids: uniq([...(prev.place_ids || []), raw.source_place_id]),
        source_kinds: uniq([...(prev.source_kinds || []), raw.source_kind])
      };
    });

    return Object.values(byId);
  }

  function buildSearchQueries(place) {
    const name = asString(place?.name || place?.title);
    const id = asString(place?.id);

    if (!name && !id) return [];

    const base = name || id;

    return uniq([
      `${base} brand store`,
      `${base} concept store`,
      `${base} kultbutikk`,
      `${base} vintagebutikk`,
      `${base} legendary venue`,
      `${base} reklameskilt`,
      `${base} gavlreklame`,
      `${base} law firm`,
      `${base} advokatkontor`,
      `${base} luxury brand`,
      `${base} iconic store`,
      `${base} dealer`,
      `${base} bilforhandler`
    ]);
  }

  window.HGBrandSourceCollector = {
    collect(place, ctx = {}) {
      const relations = ensureArray(ctx.relations);
      const stories = ensureArray(ctx.stories);
      const wonderkammer = ensureArray(ctx.wonderkammer);
      const events = ensureArray(ctx.events);
      const manual = ensureArray(ctx.manual_candidates);

      const raw = [
        ...extractExplicitFields(place),
        ...extractFromTexts(place),
        ...extractFromRelations(place, relations),
        ...extractFromStories(place, stories),
        ...extractFromWonderkammer(place, wonderkammer),
        ...extractFromEvents(place, events),
        ...manual.map(item => {
          if (typeof item === "string") {
            return makeRawCandidate(item, {
              source_kind: "manual",
              source_place_id: place?.id
            });
          }
          return makeRawCandidate(
            item?.name || item?.title || item?.label || item?.id,
            {
              ...item,
              source_kind: "manual",
              source_place_id: place?.id
            }
          );
        }).filter(Boolean)
      ];

      return mergeCandidates(raw);
    },

    buildSearchQueries,

    collectAndSuggest(place, ctx = {}) {
      return {
        place_id: asString(place?.id),
        place_name: asString(place?.name || place?.title),
        raw_candidates: this.collect(place, ctx),
        search_queries: buildSearchQueries(place)
      };
    }
  };
})();
