
  function renderNearbyPeople() {
  const list = document.getElementById("leftPeopleList");
  if (!list) return;

  if (!Array.isArray(window.PEOPLE) || window.PEOPLE.length === 0) {
    list.innerHTML = `<div class="muted">Ingen personer enda.</div>`;
    return;
  }

  const pos = (typeof window.getPos === "function") ? window.getPos() : null;

  const sorted = window.PEOPLE
    .map(p => ({
      ...p,
      _d: (pos && p.lat && p.lon)
        ? Math.round(distMeters(pos, { lat: p.lat, lon: p.lon }))
        : null
    }))
    .sort((a, b) => (a._d ?? 1e12) - (b._d ?? 1e12));

  list.innerHTML = sorted.map(p => {
    const dist =
      p._d == null
        ? ""
        : p._d < 1000
        ? `${p._d} m`
        : `${(p._d / 1000).toFixed(1)} km`;

    return `
      <div class="nearby-item">
        <span class="nearby-name">${p.name}</span>
        <span class="nearby-dist">${dist}</span>
      </div>
    `;
  }).join("");
}


// ==============================
// 7. LISTEVISNINGER
// ==============================
function renderNearbyPlaces() {
  const list = document.getElementById("nearbyList");
  if (!list) return;

  const pos = (typeof window.getPos === "function") ? window.getPos() : null;

  const sorted = (window.PLACES || [])
    .map(p => ({
      ...p,
      _d: pos ? Math.round(distMeters(pos, { lat: p.lat, lon: p.lon })) : null
    }))
    .sort((a, b) => (a._d ?? 1e12) - (b._d ?? 1e12));

  const q = (window.HG_NEARBY_QUERY || "").trim().toLowerCase();
  const filtered = q
    ? sorted.filter(p => String(p.name || "").toLowerCase().includes(q))
    : sorted;

  list.innerHTML = filtered.map(renderPlaceCard).join("");
}

function renderPlaceCard(p) {
  const dist =
    p._d == null
      ? ""
      : p._d < 1000
      ? `${p._d} m`
      : `${(p._d / 1000).toFixed(1)} km`;

  const img = p.image; 

  return `
    <div class="nearby-item" data-open="${p.id}">
      
      <img class="nearby-thumb" src="${img}" alt="${p.name}">
      
      <span class="nearby-name">${p.name}</span>

      <span class="nearby-dist">${dist}</span>

      <img class="nearby-badge" src="bilder/merker/${catClass(p.category)}.PNG" alt="">
    </div>
  `;
}

window.renderNearbyPlaces = renderNearbyPlaces;

// ✅ API: bruk denne fra "Se kart" osv. for å skjule/vis hele panelet
window.setNearbyCollapsed = function (hidden) {
  const container = document.getElementById("nearbyListContainer");
  if (!container) return;

  container.classList.toggle("is-hidden", !!hidden);
};



function renderPersonCardInline(pr) {
  const cat = tagToCat(pr.tags);
  const dist =
    pr._d < 1000 ? `${pr._d} m` : `${(pr._d / 1000).toFixed(1)} km`;

  const img = pr.imageCard || pr.image;

  return `
    <article class="card person-inline-card">
      <img src="${img}" alt="${pr.name}" class="inline-thumb">

      <div class="inline-info">
        <div class="name">${pr.name}</div>
        <div class="meta">${cat}</div>
        <p class="desc">${pr.desc || ""}</p>

        <div class="row between">
          <div class="dist">${dist}</div>
          <button class="primary" data-quiz="${pr.id}">Ta quiz</button>
        </div>
      </div>
    </article>`;
}


function renderCollection() {
  const grid = el.collectionGrid;
  if (!grid) return;

  const items = PLACES.filter(p => visited[p.id]);

  if (el.collectionCount) el.collectionCount.textContent = items.length;

  const first = items.slice(0, 18);
  grid.innerHTML = first
    .map(
      p => `
    <span class="badge ${catClass(p.category)}" title="${p.name}">
      <span class="i" style="background:${catColor(p.category)}"></span> ${p.name}
    </span>`
    )
    .join("");
}

function renderGallery() {
  if (!el.gallery) return;
  const collectedIds = Object.keys(peopleCollected).filter(id => peopleCollected[id]);
  const collectedPeople = PEOPLE.filter(p => collectedIds.includes(p.id));

  el.gallery.innerHTML = collectedPeople
    .map(p => {
      const imgPath = p.imageCard || p.image;
      const cat = tagToCat(p.tags);
      return `
        <div class="person-card" data-quiz="${p.id}">
          <img src="${imgPath}" alt="${p.name}" class="person-thumb">
          <div class="person-label" style="color:${catColor(cat)}">${p.name}</div>
        </div>`;
    })
    .join("");
}
