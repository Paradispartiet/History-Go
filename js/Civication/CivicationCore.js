const getActivePosition = () =>
  window.CivicationState.getActivePosition();

const setActivePosition = (pos) =>
  window.CivicationState.setActivePosition(pos);

// ------------------------------------------------------------
// CIVICATION – Career rules (lønn, world logic)
// ------------------------------------------------------------
async function ensureCiviCareerRulesLoaded() {
  if (Array.isArray(window.CIVI_CAREER_RULES)) return;

  try {
    const data = await fetch("data/civication_careers_rules_v1.json", {
      cache: "no-store"
    }).then(r => r.json());

    window.CIVI_CAREER_RULES = Array.isArray(data?.careers)
      ? data.careers
      : [];
  } catch {
    window.CIVI_CAREER_RULES = [];
  }
}





