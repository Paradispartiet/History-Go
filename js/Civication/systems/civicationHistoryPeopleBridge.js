// js/Civication/systems/civicationHistoryPeopleBridge.js
// CivicationHistoryPeopleBridge — History Go-samlingen → ekte personer i Civication.
//
// Prinsipp (hybridmodellen):
// - Arketypene i people_access_map.json beholder mekanikken (access, scoring,
//   social_style). Har spilleren SAMLET en History Go-person i en av arketypens
//   `hg_categories`, vises den ekte personen som identitet i stedet for det
//   konstruerte arketypenavnet.
// - Hverdags-NPC-ene i mailflyten (data/Civication/npcs/**) forblir fiktive.
// - RoleModelRuntime bruker samme oppslag til å legge samlede personer som
//   faglige forbilder (`history_people`) på role_model_meta.
//
// Datakilder:
// - localStorage `people_collected` ({ personId: true }) — eies av History Go
//   (js/state/persistence.js). Leses kun; skrives aldri herfra.
// - data/Civication/historyPeople_index.json — generert kategoriindeks over
//   personene (npm run civication:history-people:build).
//
// Alle valg er deterministiske: samme samling gir samme person per arketype.
(function () {
  "use strict";

  if (window.CivicationHistoryPeopleBridge) return;

  const INDEX_PATH = "data/Civication/historyPeople_index.json";

  let categoriesCache = null; // { [category]: LightPerson[] } eller null før load
  let loadPromise = null;

  async function load() {
    if (categoriesCache) return categoriesCache;
    if (loadPromise) return loadPromise;

    loadPromise = (async () => {
      let json = null;
      const sharedStore = window.CivicationJsonStore;
      if (sharedStore?.fetchJson) {
        json = await sharedStore.fetchJson(INDEX_PATH);
      } else {
        try {
          const res = await fetch(INDEX_PATH, { cache: "no-store" });
          if (res.ok) json = await res.json();
        } catch {}
      }
      const categories = json?.categories;
      categoriesCache = categories && typeof categories === "object" ? categories : {};
      return categoriesCache;
    })();

    try {
      return await loadPromise;
    } finally {
      loadPromise = null;
    }
  }

  function getCollectedIds() {
    try {
      const raw = JSON.parse(localStorage.getItem("people_collected") || "{}");
      if (!raw || typeof raw !== "object") return [];
      return Object.keys(raw).filter((id) => raw[id]);
    } catch {
      return [];
    }
  }

  // Samlede personer i én kategori, sortert på id (deterministisk).
  // Krever at load() har fullført; før det returneres tom liste.
  function getCollectedByCategory(category) {
    const cat = String(category || "").trim();
    if (!cat || !categoriesCache) return [];
    const rows = Array.isArray(categoriesCache[cat]) ? categoriesCache[cat] : [];
    const collected = new Set(getCollectedIds());
    return rows
      .filter((p) => collected.has(String(p?.id || "")))
      .sort((a, b) => String(a.id).localeCompare(String(b.id)));
  }

  function stableHash(str) {
    let h = 0;
    const s = String(str || "");
    for (let i = 0; i < s.length; i++) {
      h = ((h << 5) - h + s.charCodeAt(i)) | 0;
    }
    return Math.abs(h);
  }

  // Velger den samlede personen som legemliggjør en arketype. Startpunktet i
  // kandidatlisten er en stabil hash av arketype-id-en (variasjon mellom
  // arketyper), deretter skannes fremover forbi personer som allerede er i
  // bruk (usedIds) så to arketyper ikke viser samme person.
  function pickForArchetype(archetypeId, hgCategories, usedIds) {
    const seen = new Set();
    const candidates = [];
    (Array.isArray(hgCategories) ? hgCategories : []).forEach((cat) => {
      getCollectedByCategory(cat).forEach((p) => {
        const id = String(p?.id || "");
        if (id && !seen.has(id)) {
          seen.add(id);
          candidates.push(p);
        }
      });
    });
    if (!candidates.length) return null;

    const start = stableHash(archetypeId) % candidates.length;
    for (let i = 0; i < candidates.length; i++) {
      const person = candidates[(start + i) % candidates.length];
      if (!usedIds || !usedIds.has(String(person.id))) return person;
    }
    return null; // alle kandidatene er alt i bruk – behold arketypen
  }

  // Dekorerer PeopleEngine-rader (available_people): access_map-arketyper med
  // hg_categories får identiteten til en samlet person. Radene ellers urørt.
  async function decorateAvailablePeople(rows) {
    if (!Array.isArray(rows) || !rows.length) return rows;
    const relevant = rows.some(
      (r) => r?.source === "access_map" && Array.isArray(r?.hg_categories) && r.hg_categories.length
    );
    if (!relevant) return rows;

    await load();
    const usedIds = new Set();

    return rows.map((row) => {
      if (!row || row.source !== "access_map") return row;
      const cats = Array.isArray(row.hg_categories) ? row.hg_categories : [];
      if (!cats.length) return row;

      const person = pickForArchetype(row.id, cats, usedIds);
      if (!person) return row;
      usedIds.add(String(person.id));

      return {
        ...row,
        name: String(person.name || row.name),
        description: String(person.desc || row.description || ""),
        archetype_name: row.name,
        hg_person: {
          id: person.id,
          name: person.name,
          category: person.category,
          desc: person.desc || "",
          placeId: person.placeId || "",
          year: Number.isFinite(Number(person.year)) ? Number(person.year) : null,
          image: person.image || "",
          cardImage: person.cardImage || ""
        }
      };
    });
  }

  function inspect() {
    return {
      index_loaded: !!categoriesCache,
      categories: categoriesCache ? Object.keys(categoriesCache).sort() : [],
      collected_ids: getCollectedIds()
    };
  }

  window.CivicationHistoryPeopleBridge = {
    load,
    getCollectedIds,
    getCollectedByCategory,
    pickForArchetype,
    decorateAvailablePeople,
    inspect
  };
})();
