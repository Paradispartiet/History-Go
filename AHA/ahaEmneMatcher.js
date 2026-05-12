async function matchEmneForText(subjectId, text) {
  if (!text || !text.trim()) return null;

  // 1) Hent alle emner for faget (merket)
  const emner = await Emner.loadForSubject(subjectId);
  if (!Array.isArray(emner) || emner.length === 0) return null;

  const lower = text.toLowerCase();
  const GENERIC_WORD_WEIGHTS = {
    kunnskap: 0.35,
    mennesker: 0.35,
    sted: 0.35,
    samfunn: 0.35
  };

  let best = null;
  let bestScore = 0;

  for (const emne of emner) {
    const keywords = (emne.keywords || []).map(k => String(k).toLowerCase());
    const concepts = (emne.core_concepts || []).map(c => String(c).toLowerCase());
    const title = String(emne.title || '').toLowerCase();

    let score = 0;
    let hitCount = 0;

    if (title && lower.includes(title)) {
      score += 8;
      hitCount += 1;
    }

    keywords.forEach(k => {
      if (!k || !lower.includes(k)) return;
      score += 1.5 * (GENERIC_WORD_WEIGHTS[k] || 1);
      hitCount += 1;
    });

    concepts.forEach(c => {
      if (!c || !lower.includes(c)) return;
      score += 3 * (GENERIC_WORD_WEIGHTS[c] || 1);
      hitCount += 1;
    });

    if (hitCount >= 2) score += Math.min(5, hitCount * 0.8);

    if (score > bestScore) {
      bestScore = score;
      best = emne;
    }
  }

  if (!best || bestScore < 1.5) return null;

  return {
    emne_id: best.emne_id || best.id,
    title: best.title,
    short_label: best.short_label,
    score: bestScore
  };
}
