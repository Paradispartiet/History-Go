
// ==============================
// 14. GLOBALT SØK
// ==============================

function dist(aLat, aLon, bLat, bLon) {
  const R = 6371e3; // meter
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
  const q = query.trim().toLowerCase();
  if (!q) return { people: [], places: [], categories: [] };

  // --- PERSONER ---
  const people = PEOPLE.filter(p =>
    p.name.toLowerCase().includes(q) ||
    (p.desc && p.desc.toLowerCase().includes(q)) ||
    (p.year && String(p.year).includes(q)) ||
(p.tags && normalizeTags(p.tags, TAGS_REGISTRY).some(t => String(t).toLowerCase().includes(q)))
  );

  // --- STEDER ---
  let places = PLACES.filter(s =>
    s.name.toLowerCase().includes(q) ||
    (s.desc && s.desc.toLowerCase().includes(q)) ||
    (s.type && s.type.toLowerCase().includes(q)) ||
    (s.year && String(s.year).includes(q)) ||
(s.tags && normalizeTags(s.tags, TAGS_REGISTRY).some(t => String(t).toLowerCase().includes(q)))
  );

  // --- NÆR MEG (når kartet er aktivt) ---
const pos = (typeof window.getPos === "function") ? window.getPos() : null;
if (pos) {
  places = places.slice().sort((a, b) => {
    const da = dist(pos.lat, pos.lon, a.lat, a.lon);
    const db = dist(pos.lat, pos.lon, b.lat, b.lon);
    return da - db;
  });
}

  // --- KATEGORIER ---
  const categories = CATEGORY_LIST.filter(c =>
    c.name.toLowerCase().includes(q) ||
    c.id.toLowerCase().includes(q)
  );

  return { people, places, categories };
}

function renderSearchResults({ people, places, categories }, query = "") {
  const box = document.getElementById("searchResults");

  if (!people.length && !places.length && !categories.length) {
    box.innerHTML = "";
    showSearchBox(false);
    return;
  }

  showSearchBox(true);

  function badge(catId) {
    return `<img class="sr-badge" src="bilder/merker/${catId}.PNG">`;
  }

  const q = query.toLowerCase();

  // --- SUGGESTIONS ---
  const peopleStarts = people.filter(p => p.name.toLowerCase().startsWith(q)).slice(0, 5);
  const placesStarts = places.filter(s => s.name.toLowerCase().startsWith(q)).slice(0, 5);
  const catStarts    = categories.filter(c => c.name.toLowerCase().startsWith(q)).slice(0, 5);

  const suggestions =
  catStarts
    .map(c => `<div class="search-item" data-category="${c.id}">${badge(c.id)}${c.name}</div>`)
    .concat(
      peopleStarts.map(p => `<div class="search-item" data-person="${p.id}">${badge(p.category)}${p.name}</div>`),
      placesStarts.map(s => `<div class="search-item" data-place="${s.id}">${badge(s.category)}${s.name}</div>`)
    )
    .join("");

  // --- NÆR DEG (når kart er aktivt) ---
  let nearList = "";

const pos = (typeof window.getPos === "function") ? window.getPos() : null;

if (pos) {
  const near = places.slice(0, 3);

  nearList = `
    <div class="search-section">
      <h3>Nær deg</h3>
      ${near.map(s => `
        <div class="search-item" data-place="${s.id}">
          ${badge(s.category)}${s.name}
        </div>
      `).join("")}
    </div>
  `;
}

  box.innerHTML = `
    ${nearList}
    ${suggestions ? `<div class="search-section"><h3>Forslag</h3>${suggestions}</div>` : ""}

    ${people.length ? `
      <div class="search-section"><h3>Personer</h3>
        ${people.map(p => `
          <div class="search-item" data-person="${p.id}">
            ${badge(p.category)}${p.name}
          </div>
        `).join("")}
      </div>` : ""}

    ${places.length ? `
      <div class="search-section"><h3>Steder</h3>
        ${places.map(s => `
          <div class="search-item" data-place="${s.id}">
            ${badge(s.category)}${s.name}
          </div>
        `).join("")}
      </div>` : ""}

    ${categories.length ? `
      <div class="search-section"><h3>Kategorier</h3>
        ${categories.map(c => `
          <div class="search-item" data-category="${c.id}">
            ${badge(c.id)}${c.name}
          </div>
        `).join("")}
      </div>` : ""}
  `;
}

function showSearchBox(show) {
  const box = document.getElementById("searchResults");
  box.style.display = show ? "block" : "none";
}

document.getElementById("globalSearch").addEventListener("input", e => {
  const value = e.target.value;
  const results = globalSearch(value);
  renderSearchResults(results, value);
});
