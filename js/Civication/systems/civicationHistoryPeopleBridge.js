// js/Civication/systems/civicationHistoryPeopleBridge.js
// CivicationHistoryPeopleBridge — History Go-samlingen → ekte personer i Civication.
//
// Prinsipp (hybridmodellen):
// - Arketypene i people_access_map.json beholder mekanikken (access, scoring,
//   social_style). Har spilleren SAMLET en History Go-person i en av arketypens
//   `hg_categories`, kan den ekte personen vises som identitet i stedet for det
//   konstruerte arketypenavnet.
// - ALLE samlede History Go-personer eksponeres i tillegg som egne, stabile
//   samtalepartnere. De er et personlig sosialt lag og er ikke avhengige av
//   aktiv jobb/rolle i Civication.
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
// Alle valg er deterministiske: samme samling gir samme person per arketype og
// samme conversation_friend_id for en historisk person på tvers av roller.
(function () {
  "use strict";

  if (window.CivicationHistoryPeopleBridge) return;

  const INDEX_PATH = "data/Civication/historyPeople_index.json";
  const CONVERSATION_ID_PREFIX = "history_go_person_";

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

  function snapshotPerson(person, fallbackCategory) {
    const id = String(person?.id || "").trim();
    if (!id) return null;
    return {
      id,
      name: String(person?.name || id),
      category: String(person?.category || fallbackCategory || ""),
      desc: String(person?.desc || ""),
      placeId: String(person?.placeId || ""),
      year: Number.isFinite(Number(person?.year)) ? Number(person.year) : null,
      image: String(person?.image || ""),
      cardImage: String(person?.cardImage || "")
    };
  }

  function conversationFriendId(personId) {
    const id = String(personId || "").trim();
    return id ? CONVERSATION_ID_PREFIX + id : "";
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

  // Hele spillerens History Go-personsamling, ikke bare personer som passer en
  // av de generiske Civication-arketypene. Dedupliseres på canonical person-id.
  async function getCollectedPeople() {
    await load();
    const collected = new Set(getCollectedIds());
    const byId = new Map();

    Object.keys(categoriesCache || {}).sort().forEach((category) => {
      const rows = Array.isArray(categoriesCache[category]) ? categoriesCache[category] : [];
      rows.forEach((person) => {
        const id = String(person?.id || "").trim();
        if (!id || !collected.has(id) || byId.has(id)) return;
        const snapshot = snapshotPerson(person, category);
        if (snapshot) byId.set(id, snapshot);
      });
    });

    return Array.from(byId.values()).sort((a, b) => {
      const byName = String(a.name).localeCompare(String(b.name), "nb");
      return byName || String(a.id).localeCompare(String(b.id));
    });
  }

  // Normaliserer samlede History Go-personer til selvstendige PeopleEngine-rader.
  // excludeIds brukes når en person allerede legemliggjør en access_map-arketype,
  // slik at samme historiske person ikke vises to ganger i samme panel.
  async function getCollectedConversationPeople(excludeIds) {
    const excluded = new Set(
      (excludeIds instanceof Set ? Array.from(excludeIds) : Array.isArray(excludeIds) ? excludeIds : [])
        .map(String)
    );
    const people = await getCollectedPeople();
    return people
      .filter((person) => !excluded.has(String(person.id)))
      .map((person) => ({
        id: CONVERSATION_ID_PREFIX + person.id,
        type: "history_person",
        name: person.name,
        description: person.desc,
        category: person.category,
        source_place_id: person.placeId || null,
        social_style: "history_go",
        score: null,
        hg_categories: person.category ? [person.category] : [],
        source: "history_go_collection",
        conversation_friend_id: conversationFriendId(person.id),
        can_converse: true,
        hg_person: { ...person }
      }));
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
      const snapshot = snapshotPerson(person, cats[0]);

      return {
        ...row,
        name: String(person.name || row.name),
        description: String(person.desc || row.description || ""),
        archetype_name: row.name,
        conversation_friend_id: conversationFriendId(person.id),
        can_converse: true,
        hg_person: snapshot
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
    getCollectedPeople,
    getCollectedConversationPeople,
    conversationFriendId,
    pickForArchetype,
    decorateAvailablePeople,
    inspect
  };
})();