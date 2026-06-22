(() => {
  // js/fagkartLoader.ts
  var DEBUG = !!globalThis.DEBUG;
  var FAGKART_URL = "/emner/fagkart.json";
  var cache = null;
  var loadingPromise = null;
  async function loadAll() {
    if (cache) return cache;
    if (loadingPromise) return loadingPromise;
    loadingPromise = fetch(FAGKART_URL).then((res) => {
      if (!res.ok) {
        if (DEBUG) console.warn("Kunne ikke laste fagkart:", res.status, res.statusText);
        return {};
      }
      return res.json();
    }).then((data) => {
      cache = data || {};
      return cache;
    }).catch((err) => {
      if (DEBUG) console.warn("Feil ved henting av fagkart:", err);
      cache = {};
      return cache;
    }).finally(() => {
      loadingPromise = null;
    });
    return loadingPromise;
  }
  async function getField(fieldId) {
    const all = await loadAll();
    return all[fieldId] || null;
  }
  async function listFields() {
    const all = await loadAll();
    return Object.entries(all).filter(([k, v]) => k !== "_meta" && v && typeof v === "object" && Array.isArray(v.families)).map(([, v]) => v);
  }
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
  var Fagkart = {
    loadAll,
    getField,
    listFields,
    listAllSubfields
  };
  globalThis.Fagkart = Fagkart;
})();
//# sourceMappingURL=fagkartLoader.js.map
