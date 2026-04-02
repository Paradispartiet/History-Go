// =======================================================
// Identity Engine v2
// =======================================================

const CAPITAL_KEYS = [
  "economic",
  "cultural",
  "social",
  "symbolic",
  "political",
  "institutional",
  "subculture"
];

// -------------------------------------------------------
// 1️⃣ Zone calculation
// -------------------------------------------------------

function getZone(value) {
  const n = Number(value || 0);
  if (n < 30) return 0;
  if (n < 60) return 1;
  if (n < 80) return 2;
  return 3;
}

function calculateZones(capital) {
  const zones = {};
  CAPITAL_KEYS.forEach((key) => {
    zones[key] = getZone(capital?.[key]);
  });
  return zones;
}

// -------------------------------------------------------
// 2️⃣ Change detection
// -------------------------------------------------------

function detectChanges(user, newZones, newProfileId) {
  const previous = user.identityState || {
    lastProfileId: null,
    lastCapitalZones: {}
  };

  let zoneShift = false;
  let profileShift = false;

  CAPITAL_KEYS.forEach((key) => {
    if (previous.lastCapitalZones?.[key] !== newZones[key]) {
      zoneShift = true;
    }
  });

  if (previous.lastProfileId !== newProfileId) {
    profileShift = true;
  }

  return { zoneShift, profileShift };
}

// -------------------------------------------------------
// 3️⃣ Hint generator
// -------------------------------------------------------

function generateNarrativeHint(capital, zones, changes) {
  const safeCapital = capital && typeof capital === "object" ? capital : {};

  const sorted = [...CAPITAL_KEYS].sort(
    (a, b) => Number(safeCapital?.[b] || 0) - Number(safeCapital?.[a] || 0)
  );

  const strongest = sorted[0];
  const weakest = sorted[sorted.length - 1];

  const capitalLabel = {
    economic: "økonomiske handlekraft",
    cultural: "kulturelle investeringer",
    social: "sosiale nettverk",
    symbolic: "symbolske prestisje",
    political: "politiske innflytelse",
    institutional: "institusjonelle forankring",
    subculture: "subkulturelle tyngde"
  };

  const strongestValue = Number(safeCapital?.[strongest] || 0);
  const weakestValue = Number(safeCapital?.[weakest] || 0);

  const sentences = [];

  sentences.push(
    `Din ${capitalLabel[strongest] || strongest} preger i økende grad din posisjon.`
  );

  if (changes?.zoneShift) {
    sentences.push(
      "Du beveger deg gradvis mot en mer markant rolle innen dette feltet."
    );
  }

  if (strongestValue - weakestValue > 40) {
    sentences.push(
      "Samtidig skaper dette avstand til andre deler av din livsverden."
    );
  }

  return sentences.join(" ");
}

// -------------------------------------------------------
// 4️⃣ Capital source resolution
// -------------------------------------------------------

function readMaintainedCapital() {
  try {
    const raw = JSON.parse(localStorage.getItem("hg_capital_v1") || "{}");
    return raw && typeof raw === "object" ? raw : {};
  } catch {
    return {};
  }
}

function mergeCapitalShapes(baseCapital, maintainedCapital) {
  const merged = {};

  CAPITAL_KEYS.forEach((key) => {
    const baseValue = Number(baseCapital?.[key] || 0);
    const maintainedValue = Number(maintainedCapital?.[key] || 0);

    merged[key] = maintainedValue || baseValue;
  });

  return merged;
}

function resolveCapital(
  user,
  CIVI_ITEMS,
  CIVI_SYNERGIES,
  CAREERS,
  LIFESTYLES,
  calculateCapital
) {
  const calculated =
    typeof calculateCapital === "function"
      ? calculateCapital(
          user,
          CIVI_ITEMS || {},
          CIVI_SYNERGIES || [],
          CAREERS || {},
          LIFESTYLES || {}
        )
      : {};

  const maintained = readMaintainedCapital();

  return mergeCapitalShapes(calculated, maintained);
}

// -------------------------------------------------------
// 5️⃣ Main identity update
// -------------------------------------------------------

function updateIdentity(
  user,
  CIVI_ITEMS,
  CIVI_SYNERGIES,
  CAREERS,
  LIFESTYLES,
  calculateCapital,
  getLifeProfile
) {
  if (!user || typeof user !== "object") {
    return {
      capital: {},
      profile: null,
      hint: null
    };
  }

  const capital = resolveCapital(
    user,
    CIVI_ITEMS,
    CIVI_SYNERGIES,
    CAREERS,
    LIFESTYLES,
    calculateCapital
  );

  const zones = calculateZones(capital);

  const profile =
    typeof getLifeProfile === "function"
      ? getLifeProfile(capital)
      : { profileId: null };

  const profileId = profile?.profileId || null;
  const changes = detectChanges(user, zones, profileId);

  let hint = user.currentHint || null;

  if (changes.zoneShift || changes.profileShift) {
    hint = generateNarrativeHint(capital, zones, changes);
  }

  user.capital = capital;
  user.profile = profileId;
  user.currentHint = hint;

  user.identityState = {
    lastProfileId: profileId,
    lastCapitalZones: zones
  };

  return {
    capital,
    profile: profileId,
    hint
  };
}

// -------------------------------------------------------
// 6️⃣ Public API
// -------------------------------------------------------

window.HG_IdentityEngine = {
  getZone,
  calculateZones,
  detectChanges,
  generateNarrativeHint,
  resolveCapital,
  updateIdentity
};
