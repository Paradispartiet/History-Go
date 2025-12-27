// fagkartLoader.js
// Felles loader for fagkart.json (fagfelt → families → subfields)

window.Fagkart = (function () {
  // DEBUG følger global bryter hvis den finnes (window.DEBUG), ellers false
  const DEBUG = !!window.DEBUG;

  // Juster stien hvis du legger fagkart.json et annet sted
  const FAGKART_URL = "/emner/fagkart.json";

  let cache = null;
  let loadingPromise = null;

  async function loadAll() {
    // Returner cache hvis vi allerede har lastet
    if (cache) return cache;

    // Hvis en lastingen allerede pågår, gjenbruk samme promise
    if (loadingPromise) return loadingPromise;

    loadingPromise = fetch(FAGKART_URL)
      .then((res) => {
        if (!res.ok) {
          if (DEBUG) console.warn("Kunne ikke laste fagkart:", res.status, res.statusText);
          return {};
        }
        return res.json();
      })
      .then((data) => {
        cache = data || {};
        return cache;
      })
      .catch((err) => {
        if (DEBUG) console.warn("Feil ved henting av fagkart:", err);
        cache = {};
        return cache;
      })
      .finally(() => {
        loadingPromise = null;
      });

    return loadingPromise;
  }

  // Hent ett fagfelt (humaniora, naturvitenskap, osv.)
  async function getField(fieldId) {
    const all = await loadAll();
    return all[fieldId] || null;
  }

  // Liste over alle fagfelt (som array)
  async function listFields() {
  const all = await loadAll();
  return Object.entries(all)
    .filter(([k, v]) => k !== "_meta" && v && typeof v === "object" && Array.isArray(v.families))
    .map(([, v]) => v);
}
  
  // Sync/bruk senere: f.eks. hente alle subfields som flat liste
  async function listAllSubfields() {
    const all = await loadAll();
    const out = [];

    Object.entries(all).forEach(([fieldId, field]) => {
  if (fieldId === "_meta") return;
  (field.families || []).forEach((fam) => {
    (fam.subfields || []).forEach((sf) => {
      out.push({
        fieldId,
        fieldLabel: field.label,
        familyId: fam.id,
        familyLabel: fam.label,
        subfieldId: sf.id,
        subfieldLabel: sf.label
      });
    });
  });
});

    return out;
  }

  return {
    loadAll,
    getField,
    listFields,
    listAllSubfields
  };
})();
