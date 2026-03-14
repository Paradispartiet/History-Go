(function () {
  function ensureArray(value) {
    return Array.isArray(value) ? value : [];
  }

  function asString(value) {
    return typeof value === "string" ? value.trim() : "";
  }

  function lower(value) {
    return asString(value).toLowerCase();
  }

  function normalizeWhitespace(text) {
    return asString(text).replace(/\s+/g, " ").trim();
  }

  function splitSentences(text) {
    return normalizeWhitespace(text)
      .split(/(?<=[.!?])\s+/)
      .map(s => s.trim())
      .filter(Boolean);
  }

  function uniqueBy(items, getKey) {
    const seen = new Set();
    const out = [];

    for (const item of items) {
      const key = getKey(item);
      if (!key || seen.has(key)) continue;
      seen.add(key);
      out.push(item);
    }

    return out;
  }

  function extractYears(text) {
    const matches = asString(text).match(/\b(1[6-9]\d{2}|20\d{2})\b/g) || [];
    return [...new Set(matches.map(Number))];
  }

  function firstYear(text) {
    const years = extractYears(text);
    return years.length ? years[0] : null;
  }

  function hasAny(text, patterns) {
    return patterns.some(pattern => pattern.test(text));
  }

  function countHits(text, patterns) {
    let count = 0;
    for (const pattern of patterns) {
      if (pattern.test(text)) count += 1;
    }
    return count;
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  const EVENT_PATTERNS = [
    /\bskjedde\b/i,
    /\bskapte\b/i,
    /\butløste\b/i,
    /\boppstod\b/i,
    /\bbrøt ut\b/i,
    /\bførte til\b/i,
    /\bstartet\b/i,
    /\båpnet\b/i,
    /\bvedtok\b/i,
    /\bgrunnla\b/i,
    /\bbygde\b/i,
    /\bflyttet\b/i,
    /\barrangerte\b/i,
    /\bholdt\b/i,
    /\bprotesterte\b/i,
    /\bdemonstrerte\b/i,
    /\bangrep\b/i,
    /\bdøde\b/i,
    /\bdruknet\b/i,
    /\bbrant\b/i,
    /\brømte\b/i,
    /\bble kjent\b/i,
    /\bble arrestert\b/i,
    /\bble dømt\b/i,
    /\bble oppført\b/i,
    /\bble revet\b/i
  ];

  const CONFLICT_PATTERNS = [
    /\bkonflikt\b/i,
    /\bstrid\b/i,
    /\bdebatt\b/i,
    /\bkrangel\b/i,
    /\buenighet\b/i,
    /\bprotest\b/i,
    /\bdemonstrasjon\b/i,
    /\bmotstand\b/i,
    /\bkritikk\b/i,
    /\bskandale\b/i,
    /\bkontrovers\b/i,
    /\bkrise\b/i,
    /\banklage\b/i,
    /\boppgjør\b/i,
    /\bfiende\b/i
  ];

  const CONSEQUENCE_PATTERNS = [
    /\bførte til\b/i,
    /\bresulterte i\b/i,
    /\bble et symbol\b/i,
    /\bendret\b/i,
    /\bforandret\b/i,
    /\bgjorde at\b/i,
    /\bderfor\b/i,
    /\bkonsekvens\b/i,
    /\better dette\b/i,
    /\bsiden\b/i,
    /\btil slutt\b/i
  ];

  const TIME_PATTERNS = [
    /\b(1[6-9]\d{2}|20\d{2})\b/,
    /\ben gang\b/i,
    /\ben natt\b/i,
    /\ben dag\b/i,
    /\bsenere\b/i,
    /\btidlig\b/i,
    /\bunder\b/i,
    /\better\b/i,
    /\bfør\b/i,
    /\bpå [0-3]?\d\.\s*[A-Za-zÆØÅæøå]+\b/i
  ];

  const PLACE_PATTERNS = [
    /\boslo\b/i,
    /\bkristiania\b/i,
    /\bbjørvika\b/i,
    /\byoungstorget\b/i,
    /\bstortinget\b/i,
    /\bkarl johan\b/i,
    /\bakershus\b/i,
    /\bgrand café\b/i,
    /\bekely\b/i,
    /\bfrogner\b/i,
    /\bgrünerløkka\b/i,
    /\bgrunerløkka\b/i,
    /\bbislett\b/i,
    /\btøyen\b/i
  ];

  const PERSON_ROLE_PATTERNS = [
    /\bhan\b/i,
    /\bhun\b/i,
    /\bde\b/i,
    /\bforfatteren\b/i,
    /\bkunstneren\b/i,
    /\bpolitikeren\b/i,
    /\barkitekten\b/i,
    /\barbeiderne\b/i,
    /\bmyndighetene\b/i,
    /\bpublikum\b/i,
    /\bfolk\b/i,
    /\bmotstandsmannen\b/i
  ];

  const DRY_FACT_PATTERNS = [
    /\ber en\b/i,
    /\bvar en\b/i,
    /\bligger i\b/i,
    /\ber kjent for\b/i,
    /\ber blant\b/i,
    /\bble grunnlagt i\b/i,
    /\bhar adresse\b/i,
    /\bhar vært\b/i,
    /\ber oppført\b/i
  ];

  function extractCapitalizedNames(text) {
    const matches = asString(text).match(/\b[A-ZÆØÅ][a-zæøå]+ [A-ZÆØÅ][a-zæøå]+\b/g) || [];
    return [...new Set(matches)];
  }

  function escapeRegex(str) {
    return asString(str).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  function scoreEpisodeText(text, entity) {
    const raw = asString(text);

    let actorScore = 0;
    let eventScore = 0;
    let placeScore = 0;
    let timeScore = 0;
    let conflictScore = 0;
    let consequenceScore = 0;
    let surpriseScore = 0;
    let drynessPenalty = 0;

    const explicitNames = extractCapitalizedNames(raw);
    if (explicitNames.length) actorScore += 2;
    if (hasAny(raw, PERSON_ROLE_PATTERNS)) actorScore += 1;
    if (entity?.kind === "person" && new RegExp(escapeRegex(entity.label), "i").test(raw)) actorScore += 1;

    eventScore += countHits(raw, EVENT_PATTERNS);
    placeScore += countHits(raw, PLACE_PATTERNS);

    if (entity?.kind === "place" && new RegExp(escapeRegex(entity.label), "i").test(raw)) {
      placeScore += 2;
    }

    timeScore += countHits(raw, TIME_PATTERNS);
    conflictScore += countHits(raw, CONFLICT_PATTERNS);
    consequenceScore += countHits(raw, CONSEQUENCE_PATTERNS);

    if (/\bmorsom\b/i.test(raw) || /\bmerkelig\b/i.test(raw) || /\bunderlig\b/i.test(raw) || /\babsurd\b/i.test(raw) || /\bplutselig\b/i.test(raw)) {
      surpriseScore += 2;
    }
    if (/\bskandale\b/i.test(raw) || /\bulykke\b/i.test(raw) || /\bdram[a-z]*\b/i.test(raw)) {
      surpriseScore += 1;
    }

    drynessPenalty += countHits(raw, DRY_FACT_PATTERNS);
    if (raw.length < 90) drynessPenalty += 1;

    const dimensions = {
      actor: actorScore > 0,
      event: eventScore > 0,
      place: placeScore > 0,
      time: timeScore > 0,
      conflict: conflictScore > 0,
      consequence: consequenceScore > 0,
      surprise: surpriseScore > 0
    };

    const dimensionCount = Object.values(dimensions).filter(Boolean).length;

    const weighted =
      actorScore * 2 +
      eventScore * 3 +
      placeScore * 2 +
      timeScore * 1.5 +
      conflictScore * 2 +
      consequenceScore * 1.5 +
      surpriseScore * 1.5 -
      drynessPenalty * 2;

    return {
      actor_score: actorScore,
      event_score: eventScore,
      place_score: placeScore,
      time_score: timeScore,
      conflict_score: conflictScore,
      consequence_score: consequenceScore,
      surprise_score: surpriseScore,
      dryness_penalty: drynessPenalty,
      dimension_count: dimensionCount,
      weighted_score: weighted
    };
  }

  function isGoodEpisodeScore(score) {
    return score.dimension_count >= 3 && score.weighted_score >= 4;
  }

  function buildEpisodeWindow(sentences, startIndex) {
    const picked = [];
    for (let i = startIndex; i < Math.min(sentences.length, startIndex + 4); i += 1) {
      picked.push(sentences[i]);
    }
    return picked.join(" ").trim();
  }

  function chooseBestWindows(text, entity) {
    const sentences = splitSentences(text);
    if (!sentences.length) return [];

    const windows = [];

    for (let i = 0; i < sentences.length; i += 1) {
      const windowText = buildEpisodeWindow(sentences, i);
      if (!windowText) continue;

      const score = scoreEpisodeText(windowText, entity);
      windows.push({
        episode_text: windowText,
        score
      });
    }

    return windows
      .filter(window => isGoodEpisodeScore(window.score))
      .sort((a, b) => b.score.weighted_score - a.score.weighted_score);
  }

  function summaryFromEpisode(text) {
    const sentences = splitSentences(text);
    if (!sentences.length) return "";
    const first = sentences[0];
    return first.length <= 220 ? first : `${first.slice(0, 220).replace(/\s+\S*$/, "")} …`;
  }

  function buildEpisodeCandidate(entity, block, window) {
    const episodeText = normalizeWhitespace(window.episode_text);
    const score = window.score;

    return {
      source: asString(block?.source) || "Ukjent kilde",
      year: firstYear(episodeText),
      raw_text: normalizeWhitespace(asString(block?.text)),
      episode_text: episodeText,
      summary_hint: summaryFromEpisode(episodeText),
      score_signal: clamp(Math.round(score.weighted_score), 0, 99),
      analysis: {
        dimension_count: score.dimension_count,
        actor_score: score.actor_score,
        event_score: score.event_score,
        place_score: score.place_score,
        time_score: score.time_score,
        conflict_score: score.conflict_score,
        consequence_score: score.consequence_score,
        surprise_score: score.surprise_score,
        dryness_penalty: score.dryness_penalty,
        weighted_score: score.weighted_score
      },
      detected_names: extractCapitalizedNames(episodeText)
    };
  }

  function extractFromBlock(entity, block) {
    const text = asString(block?.text);
    if (!text) return [];

    const windows = chooseBestWindows(text, entity);
    return windows.slice(0, 3).map(window => buildEpisodeCandidate(entity, block, window));
  }

  function dedupeEpisodes(episodes) {
    return uniqueBy(
      episodes,
      ep => lower(ep.episode_text)
        .replace(/\d{4}/g, "")
        .replace(/[^\p{L}\p{N}\s]/gu, "")
        .replace(/\s+/g, " ")
        .slice(0, 220)
    );
  }

  function sortEpisodes(episodes) {
    return [...episodes].sort((a, b) => {
      const scoreA = a?.analysis?.weighted_score ?? -999;
      const scoreB = b?.analysis?.weighted_score ?? -999;
      if (scoreB !== scoreA) return scoreB - scoreA;

      const dimA = a?.analysis?.dimension_count ?? -1;
      const dimB = b?.analysis?.dimension_count ?? -1;
      if (dimB !== dimA) return dimB - dimA;

      const yearA = typeof a?.year === "number" ? a.year : 999999;
      const yearB = typeof b?.year === "number" ? b.year : 999999;
      if (yearA !== yearB) return yearA - yearB;

      return asString(a?.episode_text).localeCompare(asString(b?.episode_text), "no");
    });
  }

  window.HGStoryEpisodeExtractor = {
    extract(entity, sourceBlocks) {
      const blocks = ensureArray(sourceBlocks);
      let episodes = [];

      for (const block of blocks) {
        episodes = episodes.concat(extractFromBlock(entity, block));
      }

      episodes = dedupeEpisodes(episodes);
      episodes = sortEpisodes(episodes);

      return episodes;
    },

    scoreText(text, entity = null) {
      return scoreEpisodeText(text, entity);
    },

    isEpisode(text, entity = null) {
      return isGoodEpisodeScore(scoreEpisodeText(text, entity));
    }
  };
})();
