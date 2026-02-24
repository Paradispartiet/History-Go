// =======================================================
// Capital Engine v3 – Strukturell modell + Home Influence
// =======================================================

function calculateCapital(
  user,
  CIVI_ITEMS,
  CIVI_SYNERGIES,
  CAREERS,
  LIFESTYLES
) {

  const capital = {
  economic: 0,
  cultural: 0,
  social: 0,
  symbolic: 0,
  political: 0,
  institutional: 0,
  subculture: 0
};

  // ----------------------------------------------------
  // 1️⃣ Jobb-base (strukturell posisjon)
  // ----------------------------------------------------

  if (user.currentCareer) {
    const career = CAREERS[user.currentCareer];

    if (career && career.capital_base) {
      Object.keys(career.capital_base).forEach(key => {
        capital[key] += career.capital_base[key];
      });
    }
  }

  // ----------------------------------------------------
  // 2️⃣ Items (akkumulert uttrykk)
  // ----------------------------------------------------

  if (user.ownedItems) {
    user.ownedItems.forEach(id => {
      const item = CIVI_ITEMS[id];
      if (!item || !item.capital_effect) return;

      Object.keys(item.capital_effect).forEach(key => {
        capital[key] += item.capital_effect[key];
      });
    });
  }

  // ----------------------------------------------------
  // 3️⃣ Livsstil (retning, ikke makt)
  // ----------------------------------------------------

  if (user.currentLifestyle) {
    const lifestyle = LIFESTYLES[user.currentLifestyle];

    if (lifestyle && lifestyle.capital_shift) {
      Object.keys(lifestyle.capital_shift).forEach(key => {
        capital[key] += lifestyle.capital_shift[key];
      });
    }
  }

  // ----------------------------------------------------
  // 4️⃣ Synergier (valgfritt, svært moderat)
  // ----------------------------------------------------

  if (CIVI_SYNERGIES) {
    CIVI_SYNERGIES.forEach(synergy => {
      if (synergy.condition(user)) {
        Object.keys(synergy.effect).forEach(key => {
          capital[key] += synergy.effect[key];
        });
      }
    });
  }

  // ----------------------------------------------------
  // 5️⃣ HOME INFLUENCE (permanent materiell forankring)
  // ----------------------------------------------------

  const homeInfluence = window.CivicationHome?.getHomeInfluence?.();

  if (homeInfluence) {
    capital.economic += homeInfluence.economic || 0;
    capital.cultural += homeInfluence.cultural || 0;
    capital.symbolic += homeInfluence.symbolic || 0;
    // autonomy går IKKE inn i kapital
  }

  return capital;
}


// =======================================================
// Career multiplier
// =======================================================

function applyCareerCapital(career, tier, capitalState) {
  if (!career || !career.capital_base) return capitalState;

  const tierMultiplier = tier === 3 ? 2 : tier === 2 ? 1.5 : 1;

  const updated = { ...capitalState };

  Object.keys(career.capital_base).forEach(type => {
    const base = career.capital_base[type] || 0;
    updated[type] = (updated[type] || 0) + base * tierMultiplier;
  });

  return updated;
}


window.CAPITAL_ENGINE = {
  calculateCapital,
  applyCareerCapital
};
