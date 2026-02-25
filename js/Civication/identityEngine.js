// =======================================================
// Identity Engine v1
// =======================================================

const CAPITAL_KEYS = [
  "economic",
  "cultural",
  "social",
  "symbolic",
  "institutional",
  "subculture"
];

// -------------------------------------------------------
// 1️⃣ Zone calculation
// -------------------------------------------------------

function getZone(value) {
  if (value < 30) return 0;
  if (value < 60) return 1;
  if (value < 80) return 2;
  return 3;
}

function calculateZones(capital) {
  const zones = {};
  CAPITAL_KEYS.forEach(key => {
    zones[key] = getZone(capital[key]);
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

  CAPITAL_KEYS.forEach(key => {
    if (previous.lastCapitalZones[key] !== newZones[key]) {
      zoneShift = true;
    }
  });

  if (previous.lastProfileId !== newProfileId) {
    profileShift = true;
  }

  return { zoneShift, profileShift };
}

// -------------------------------------------------------
// 3️⃣ Hint generator (A + B + conditional C)
// -------------------------------------------------------

function generateNarrativeHint(capital, zones, changes) {

  // Finn sterkeste og svakeste kapital
  const sorted = [...CAPITAL_KEYS].sort(
    (a, b) => capital[b] - capital[a]
  );

  const strongest = sorted[0];
  const weakest = sorted[sorted.length - 1];

  const capitalLabel = {
    economic: "økonomiske handlekraft",
    cultural: "kulturelle investeringer",
    social: "sosiale nettverk",
    symbolic: "symbolske prestisje",
    institutional: "institusjonelle forankring",
    subculture: "subkulturelle tyngde"
  };

  let sentences = [];

  // A) Situasjonsbeskrivelse
  sentences.push(
    `Din ${capitalLabel[strongest]} preger i økende grad din posisjon.`
  );

  // B) Retning (kun hvis zoneShift)
  if (changes.zoneShift) {
    sentences.push(
      `Du beveger deg gradvis mot en mer markant rolle innen dette feltet.`
    );
  }

  // C) Advarsel (kun hvis sterk ubalanse)
  if (capital[strongest] - capital[weakest] > 40) {
    sentences.push(
      `Samtidig skaper dette avstand til andre deler av din livsverden.`
    );
  }

  return sentences.join(" ");
}

// -------------------------------------------------------
// 4️⃣ Main identity update
// -------------------------------------------------------

function updateIdentity(
  user,
  CIVI_ITEMS,
  CIVI_SYNERGIES,
  calculateCapital,
  getLifeProfile
) {

  // 1. Recalculate capital
  const capital = calculateCapital(user, CIVI_ITEMS, CIVI_SYNERGIES);

  // 2. Zones
  const zones = calculateZones(capital);

  // 3. Profile
  const profile = getLifeProfile(capital);

  // 4. Detect changes
  const changes = detectChanges(user, zones, profile.profileId);

  // 5. Generate hint if needed
  let hint = user.currentHint || null;

  if (changes.zoneShift || changes.profileShift) {
    hint = generateNarrativeHint(capital, zones, changes);
  }

  // 6. Update user state
  user.capital = capital;
  user.profile = profile.profileId;
  user.currentHint = hint;

  user.identityState = {
    lastProfileId: profile.profileId,
    lastCapitalZones: zones
  };

  return {
    capital,
    profile: profile.profileId,
    hint
  };
}

window.HG_CivicationCommercial = {
  updateIdentity
};
