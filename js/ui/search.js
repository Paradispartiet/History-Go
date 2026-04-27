// ==============================
// GLOBALT SØK
// ==============================
// Lastes dynamisk etter boot(), slik at window.PLACES/window.PEOPLE finnes.

(function () {
  const MAX_PER_SECTION = 24;

  function norm(value) {
    return String(value ?? "")
      .trim()
      .toLowerCase()
      .replace(/æ/g, "ae")
      .replace(/ø/g, "o")
      .replace(/å/g, "a")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  function html(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function getCategory(catId) {
    return (window.CATEGORY_LIST || []).find(c => c.id === catId) || null;
  }

  function searchableText(item, extra = []) {
    return norm([
      item?.name,
      item?.title,
      item?.desc,
      item?.popupDesc,
      item?.type,
      item?.category,
      item?.year,
      ...(Array.isArray(item?.tags) ? item.tags : []),
      ...(Array.isArray(item?.emne_ids) ? item.emne_ids : []),
      ...extra
    ].filter(Boolean).join(" "));
  }

  function scoreItem(item, q, extra = []) {
    const name = norm(item?.name || item?.title || "");
    const haystack = searchableText(item, extra);

    if (!haystack.includes(q)) return -1;
    if (name === q) return 100;
    if (name.startsWith(q)) return 80;
    if (name.includes(q)) return 60;
    return 30;
  }

  function distance(aLat, aLon, bLat, bLon) {
    if (typeof window.distMeters === "function") {
      const d = window.distMeters({ lat: aLat, lon: aLon }, { lat: bLat, lon: bLon });
      return Number.isFinite(d) ? d : Infinity;
    }

    const R = 6371e3;
    const toRad = d => d * Math.PI / 180;

    const lat1 = Number(aLat), lon1 = Number(aLon);
    const lat2 = Number(bLat), lon2 = Number(bLon);
    if (![lat1, lon1, lat2, lon2].every(Number.isFinite)) return Infinity;

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const la1 = toRad(lat1);
    const la2 = toRad(lat2);

    const x =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(la1) * Math.cos(la2) *
      Math.sin(dLon / 2) ** 2;

    return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
  }

  function globalSearch(query) {
    const q = norm(query);
    if (!q) return { people: [], places: [], categories: [] };

    const people = (window.PEOPLE || [])
      .map(person => {
        const cat = getCategory(person.category || person.cat || person.categoryId);
        return {
          item: person,
          score: scoreItem(person, q, [cat?.name])
        };
      })
      .filter(row => row.score >= 0)
      .sort((a, b) => b.score - a.score || String(a.item.name || "").localeCompare(String(b.item.name || ""), "nb"))
      .slice(0, MAX_PER_SECTION)
      .map(row => row.item);

    let places = (window.PLACES || [])
      .filter(place => !place.hidden)
      .map(place => {
        const cat = getCategory(place.category);
        return {
          item: place,
          score: scoreItem(place, q, [cat?.name]),
          distance: Infinity
        };
      })
      .filter(row => row.score >= 0);

    const pos = (typeof window.getPos === "function") ? window.getPos() : null;
    if (pos) {
      places = places.map(row => ({
        ...row,
        distance: distance(pos.lat, pos.lon, row.item.lat, row.item.lon)
      }));
    }

    places = places
      .sort((a, b) => b.score - a.score || a.distance - b.distance || String(a.item.name || "").localeCompare(String(b.item.name || ""), "nb"))
      .slice(0, MAX_PER_SECTION)
      .map(row => row.item);

    const categories = (window.CATEGORY_LIST || [])
      .map(cat => ({ item: cat, score: scoreItem(cat, q, [cat.id]) }))
      .filter(row => row.score >= 0)
      .sort((a, b) => b.score - a.score || String(a.item.name || "").localeCompare(String(b.item.name || ""), "nb"))
      .map(row => row.item);

    return { people, places, categories };
  }

  function badge(catId) {
    if (!catId) return "";
    return `<img class="sr-badge" src="bilder/merker/${html(catId)}.PNG" alt="">`;
  }

  function renderSearchResults({ people, places, categories }, query = "") {
    const box = document.getElementById("searchResults");
    if (!box) return;

    if (!people.length && !places.length && !categories.length) {
      box.innerHTML = `
        <div class="search-section">
          <div class="search-empty">Ingen treff på «${html(query)}»</div>
        </div>
      `;
      showSearchBox(query.trim().length > 1);
      return;
    }

    showSearchBox(true);

    const section = (title, rows) => rows.length ? `
      <div class="search-section">
        <h3>${html(title)}</h3>
        ${rows.join("")}
      </div>
    ` : "";

    const placeRows = places.map(place => `
      <div class="search-item" role="button" tabindex="0" data-type="place" data-place="${html(place.id)}">
        ${badge(place.category)}
        <div class="title">${html(place.name)}</div>
        <div class="meta">${html(getCategory(place.category)?.name || place.category || "Sted")}${place.year ? ` · ${html(place.year)}` : ""}</div>
      </div>
    `);

    const peopleRows = people.map(person => `
      <div class="search-item" role="button" tabindex="0" data-type="person" data-person="${html(person.id)}">
        ${badge(person.category)}
        <div class="title">${html(person.name)}</div>
        <div class="meta">${html(getCategory(person.category)?.name || person.category || "Person")}${person.year ? ` · ${html(person.year)}` : ""}</div>
      </div>
    `);

    const categoryRows = categories.map(cat => `
      <div class="search-item" role="button" tabindex="0" data-type="category" data-category="${html(cat.id)}">
        ${badge(cat.id)}
        <div class="title">${html(cat.name)}</div>
        <div class="meta">Kategori</div>
      </div>
    `);

    box.innerHTML = `
      ${section("Steder", placeRows)}
      ${section("Personer", peopleRows)}
      ${section("Kategorier", categoryRows)}
    `;
  }

  function showSearchBox(show) {
    const box = document.getElementById("searchResults");
    if (!box) return;
    box.classList.toggle("is-open", !!show);
    box.style.display = show ? "block" : "none";
  }

  function clearSearch({ blur = false } = {}) {
    const input = document.getElementById("globalSearch");
    if (input) {
      input.value = "";
      if (blur) input.blur();
    }
    showSearchBox(false);
  }

  function openPlaceFromSearch(place) {
    if (!place) return;
    const input = document.getElementById("globalSearch");
    input?.blur?.();
    showSearchBox(false);

    if (typeof window.flyToPlace === "function") {
      window.flyToPlace(place);
      return;
    }

    window.openPlaceCard?.(place);
  }

  function bindGlobalSearch() {
    const input = document.getElementById("globalSearch");
    const box = document.getElementById("searchResults");
    if (!input || !box || input.dataset.hgSearchBound === "1") return;

    input.dataset.hgSearchBound = "1";

    input.addEventListener("input", e => {
      const value = e.target.value || "";
      if (value.trim().length < 2) {
        showSearchBox(false);
        return;
      }
      renderSearchResults(globalSearch(value), value);
    });

    input.addEventListener("focus", e => {
      const value = e.target.value || "";
      if (value.trim().length >= 2) {
        renderSearchResults(globalSearch(value), value);
      }
    });

    box.addEventListener("click", e => {
      const item = e.target.closest(".search-item");
      if (!item) return;
      activateSearchItem(item);
    });

    box.addEventListener("keydown", e => {
      if (e.key !== "Enter" && e.key !== " ") return;
      const item = e.target.closest(".search-item");
      if (!item) return;
      e.preventDefault();
      activateSearchItem(item);
    });

    document.addEventListener("click", e => {
      if (!box.contains(e.target) && !input.contains(e.target)) {
        showSearchBox(false);
      }
    });

    document.addEventListener("keydown", e => {
      if (e.key === "Escape") clearSearch({ blur: true });
    });
  }

  function activateSearchItem(item) {
    const placeId = item.dataset.place;
    const personId = item.dataset.person;
    const categoryId = item.dataset.category;

    if (placeId) {
      const place = (window.PLACES || []).find(p => String(p.id) === String(placeId));
      openPlaceFromSearch(place);
      return;
    }

    if (personId) {
      const person = (window.PEOPLE || []).find(p => String(p.id) === String(personId));
      const input = document.getElementById("globalSearch");
      input?.blur?.();
      showSearchBox(false);
      if (person) window.showPersonPopup?.(person);
      return;
    }

    if (categoryId) {
      const input = document.getElementById("globalSearch");
      if (input) input.value = categoryId;
      const places = (window.PLACES || []).filter(p => p.category === categoryId && !p.hidden);
      renderSearchResults({ people: [], places, categories: [] }, categoryId);
    }
  }

  bindGlobalSearch();

  window.globalSearch = globalSearch;
  window.renderSearchResults = renderSearchResults;
  window.bindGlobalSearch = bindGlobalSearch;
})();
