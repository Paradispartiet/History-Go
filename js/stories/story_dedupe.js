(function () {
  function asString(v) {
    return typeof v === "string" ? v.trim() : "";
  }

  function lower(v) {
    return asString(v).toLowerCase();
  }

  function normalizeText(text) {
    return lower(text)
      .replace(/\d{4}/g, "")
      .replace(/[^\p{L}\p{N}\s]/gu, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function similarity(a, b) {
    const ta = normalizeText(a);
    const tb = normalizeText(b);

    if (!ta || !tb) return 0;
    if (ta === tb) return 1;

    const setA = new Set(ta.split(" "));
    const setB = new Set(tb.split(" "));

    let intersection = 0;
    setA.forEach(word => {
      if (setB.has(word)) intersection += 1;
    });

    const union = new Set([...setA, ...setB]).size;
    return union ? intersection / union : 0;
  }

  function chooseBestStory(a, b) {
    const scoreA = a?.score?.total ?? 0;
    const scoreB = b?.score?.total ?? 0;

    if (scoreB > scoreA) return b;
    if (scoreA > scoreB) return a;

    const lenA = asString(a.story).length;
    const lenB = asString(b.story).length;

    if (lenB > lenA) return b;
    return a;
  }

  window.HGStoryDedupe = {
    dedupeStories(stories) {
      const result = [];

      for (const story of stories) {
        let duplicateIndex = -1;

        for (let i = 0; i < result.length; i += 1) {
          const existing = result[i];
          const sim = similarity(
            existing.story || existing.summary,
            story.story || story.summary
          );

          if (sim > 0.65) {
            duplicateIndex = i;
            break;
          }
        }

        if (duplicateIndex === -1) {
          result.push(story);
        } else {
          const best = chooseBestStory(result[duplicateIndex], story);
          result[duplicateIndex] = best;
        }
      }

      return result;
    }
  };
})();
