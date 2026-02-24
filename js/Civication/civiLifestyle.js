/* ============================================================
   HG Lifestyle v0.1
   - Leser data/lifestyles.json
   - Samler tags over tid (path dependency)
   - Regner ut "stamp" (dominant lifestyle)
   ============================================================ */

(() => {
  const LS_LIFE = "hg_lifestyle_v1";
  const DEFAULT = {
    tag_counts: {},     // { tag: count }
    lifestyle_scores: {}, // { lifestyleId: score }
    stamp: null,        // { id, name, icon, score }
    updated_at: null
  };

  function safeParse(raw, fb) {
    try { return JSON.parse(raw); } catch { return fb; }
  }
  function lsGet(k, fb) {
    const raw = localStorage.getItem(k);
    return raw == null ? fb : safeParse(raw, fb);
  }
  function lsSet(k, v) {
    try { localStorage.setItem(k, JSON.stringify(v)); } catch {}
  }

  function normalizeTag(t) {
    return String(t || "")
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "_")
      .slice(0, 64);
  }

  function getState() {
    const s = lsGet(LS_LIFE, null);
    return { ...DEFAULT, ...(s || {}) };
  }

  function saveState(next) {
    lsSet(LS_LIFE, next);
    return next;
  }

  // ---------- data cache ----------
  let _lifeData = null;
  async function ensureLifeData(url = "data/lifestyles.json") {
    if (_lifeData) return _lifeData;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Could not load lifestyles.json");
    const json = await res.json();
    _lifeData = json;
    return _lifeData;
  }

  // ---------- scoring ----------
  function scoreLifestyle(life, tagCounts) {
    // enkel, men robust:
    // +2 per match i "core_tags"
    // +1 per match i "tags"
    // -1 per match i "avoid_tags"
    const core = Array.isArray(life?.core_tags) ? life.core_tags : [];
    const plus = Array.isArray(life?.tags) ? life.tags : [];
    const avoid = Array.isArray(life?.avoid_tags) ? life.avoid_tags : [];

    let score = 0;

    for (const t of core) {
      const k = normalizeTag(t);
      score += 2 * (Number(tagCounts[k] || 0));
    }
    for (const t of plus) {
      const k = normalizeTag(t);
      score += 1 * (Number(tagCounts[k] || 0));
    }
    for (const t of avoid) {
      const k = normalizeTag(t);
      score -= 1 * (Number(tagCounts[k] || 0));
    }
    return score;
  }

  function recomputeStamp(lifeData, state) {
    const lifestyles = Array.isArray(lifeData?.lifestyles) ? lifeData.lifestyles : [];
    const tagCounts = state.tag_counts || {};

    let best = null;
    const scores = {};

    for (const life of lifestyles) {
      const id = String(life?.id || "").trim();
      if (!id) continue;

      const sc = scoreLifestyle(life, tagCounts);
      scores[id] = sc;

      if (!best) best = { life, score: sc };
      else if (sc > best.score) best = { life, score: sc };
    }

    const stamp = best
      ? {
          id: String(best.life.id),
          name: String(best.life.name || best.life.id),
          icon: String(best.life.icon || "🏷️"),
          score: Number(best.score || 0)
        }
      : null;

    return { scores, stamp };
  }

  // ---------- public api ----------
  async function addTags(tags = [], source = "") {
    const arr = Array.isArray(tags) ? tags : [];
    if (!arr.length) return getState();

    const st = getState();
    const next = { ...st, tag_counts: { ...(st.tag_counts || {}) } };

    for (const raw of arr) {
      const k = normalizeTag(raw);
      if (!k) continue;
      next.tag_counts[k] = Number(next.tag_counts[k] || 0) + 1;
    }

    next.updated_at = new Date().toISOString();

    // recompute
    try {
      const lifeData = await ensureLifeData();
      const { scores, stamp } = recomputeStamp(lifeData, next);
      next.lifestyle_scores = scores;
      next.stamp = stamp;
    } catch {
      // hvis json ikke lastes, behold counts uten stamp
    }

    saveState(next);
    return next;
  }

  function getStamp() {
    const st = getState();
    return st.stamp || null;
  }

  function getTagCounts() {
    const st = getState();
    return st.tag_counts || {};
  }

  async function forceRecompute() {
    const st = getState();
    const lifeData = await ensureLifeData();
    const { scores, stamp } = recomputeStamp(lifeData, st);
    const next = { ...st, lifestyle_scores: scores, stamp };
    saveState(next);
    return next;
  }

  window.HG_Lifestyle = {
    addTags,
    getStamp,
    getTagCounts,
    forceRecompute
  };
})();
