(function () {
  function asString(v) {
    return typeof v === "string" ? v.trim() : "";
  }

  function lower(v) {
    return asString(v).toLowerCase();
  }

  function ensureArray(v) {
    return Array.isArray(v) ? v : [];
  }

  function count(pattern, text) {
    return (text.match(pattern) || []).length;
  }

  function narrativeScore(text) {
    let score = 3;
    score += count(/\bkonflikt|strid|debatt|drama\b/g, text);
    score += count(/\bulykke|skandale|krise\b/g, text);
    return Math.min(score, 5);
  }

  function historicalScore(text) {
    let score = 2;
    score += count(/\bkrig|valg|regjering|okkupasjon\b/g, text);
    score += count(/\bbyutvikling|industri|arbeider\b/g, text);
    return Math.min(score, 5);
  }

  function sourceScore(sources) {
    const n = ensureArray(sources).length;
    if (n >= 3) return 5;
    if (n === 2) return 4;
    if (n === 1) return 3;
    return 1;
  }

  function playScore(text) {
    let score = 3;
    score += count(/\bmorsom|absurd|merkelig|underlig\b/g, text);
    score += count(/\bkonflikt|skandale|drama|vendepunkt\b/g, text);
    return Math.min(score, 5);
  }

  function originalityScore(text) {
    let score = 3;
    score += count(/\buvanlig|unik|første gang|sjelden\b/g, text);
    score += count(/\bmerkelig|underlig|absurd\b/g, text);
    return Math.min(score, 5);
  }

  function computeScore(story) {
    const text = lower(`${story.summary} ${story.story}`);

    const narrative = narrativeScore(text);
    const historical = historicalScore(text);
    const source = sourceScore(story.sources);
    const play_value = playScore(text);
    const originality = originalityScore(text);

    const total =
      narrative +
      historical +
      source +
      play_value +
      originality;

    return {
      narrative,
      historical,
      source,
      play_value,
      originality,
      total
    };
  }

  window.HGStoryScoring = {
    scoreStory(story) {
      story.score = computeScore(story);
      return story;
    },

    scoreStories(stories) {
      return stories.map(story => {
        story.score = computeScore(story);
        return story;
      });
    }
  };
})();
