// ============================================================
// === HISTORY GO – PROFILE.JS (v22) ==========================
// ============================================================
//
// Ny funksjonalitet:
//  - Tidslinje sortert etter årstall (stigende) + popup ved klikk
//  - Merker gjengis som bilder (PNG) med medalje (🥇/🥈/🥉)
//  - Person-galleri: runde, trykkbare ansikter -> personkort
//  - Steder: wiki-stil infobokser (valgfri seksjon) + "Se på kart"
//  - Sikker init: venter på at PLACES/PEOPLE er lastet fra app.js
//
// Forutsetter:
//  - app.js definerer globalt: PLACES, PEOPLE, openPlaceOverlay(), focusPlaceOnMap()
//  - Bilder finnes:
//      /bilder/merker/<badgeId>.PNG
//      /bilder/people/<personId>.PNG
//      /bilder/steder/<placeId>.PNG
// ============================================================

(function () {
  // -----------------------------
  // Små hjelpere
  // -----------------------------
  const $ = (sel) => document.querySelector(sel);
  const $all = (sel) => Array.from(document.querySelectorAll(sel));

  const delay = (ms) => new Promise((r) => setTimeout(r, ms));

  function safeJSONParse(s, fallback) {
    try { return JSON.parse(s); } catch { return fallback; }
  }

  function lsGet(key, fallback = null) {
    if (!('localStorage' in window)) return fallback;
    const v = localStorage.getItem(key);
    return v == null ? fallback : safeJSONParse(v, fallback);
  }

  function lsSet(key, value) {
    if (!('localStorage' in window)) return;
    localStorage.setItem(key, JSON.stringify(value));
  }

  // Normaliser id til filsti
  function normId(id = "") {
    return String(id).trim().toLowerCase().replace(/\s+/g, '_');
  }

  // Finn plass/person tryggere
  function findPlaceById(id) {
    const nid = normId(id);
    if (Array.isArray(window.PLACES)) {
      return window.PLACES.find(p => normId(p.id) === nid || normId(p.placeId) === nid) || null;
    }
    return null;
  }

  function findPersonById(id) {
    const nid = normId(id);
    if (Array.isArray(window.PEOPLE)) {
      return window.PEOPLE.find(p => normId(p.id) === nid) || null;
    }
    return null;
  }

  // -----------------------------
  // Datagrensesnitt (tolerant)
  // -----------------------------
  // Badges/merker: prøv flere nøkler
  function getBadges() {
    return (
      lsGet('hg.badges') ||
      lsGet('hg_merits') ||
      lsGet('badges') ||
      [] // {id,name,level}
    );
  }

  // Besøkte steder: ID-liste eller objekter
  function getVisitedPlaces() {
    let raw =
      lsGet('hg.visitedPlaces') ||
      lsGet('visitedPlaces') ||
      lsGet('hg_places_visited') ||
      [];

    // Hvis det bare er id'er, mapp til objekter via PLACES
    if (raw.length && typeof raw[0] === 'string') {
      raw = raw
        .map(id => findPlaceById(id))
        .filter(Boolean);
    }

    // Hvis tomt, fall tilbake på *alle* steder som har field "visited"
    if ((!raw || !raw.length) && Array.isArray(window.PLACES)) {
      raw = window.PLACES.filter(p => p.visited);
    }

    return Array.isArray(raw) ? raw : [];
  }

  // Opplåste personer (id'er) – fallback: vis alle
  function getUnlockedPeople() {
    const ids =
      lsGet('hg.peopleUnlocked') ||
      lsGet('peopleUnlocked') ||
      [];
    if (ids.length && typeof ids[0] === 'string') {
      return ids.map(id => findPersonById(id)).filter(Boolean);
    }
    // fallback: alle personer
    return Array.isArray(window.PEOPLE) ? window.PEOPLE : [];
  }

  // Profildata (navn, tittel, nivå)
  function getProfile() {
    return (
      lsGet('hg.profile') ||
      lsGet('profile') ||
      { name: 'Utforsker', title: 'Historiker', level: 1 }
    );
  }

  // -----------------------------
  // RENDER: Profilkort
  // -----------------------------
  function renderProfileCard() {
    const p = getProfile();
    const elName = $('#profileName');
    const elTitle = $('#profileTitle');
    const elLevel = $('#profileLevel');

    if (elName)  elName.textContent = p.name || 'Utforsker';
    if (elTitle) elTitle.textContent = p.title || 'Historiker';
    if (elLevel) elLevel.textContent = p.level ?? 1;

    // Statistikk
    const visited = getVisitedPlaces();
    const statPlaces = $('#statPlaces');
    const statPeople = $('#statPeople');
    const statCategory = $('#statCategory');
    if (statPlaces)  statPlaces.textContent  = `${visited.length} steder`;

    // Unike personer via unlocked, fallback PEOPLE
    const people = getUnlockedPeople();
    if (statPeople)  statPeople.textContent  = `${people.length} personer`;

    // Favorittkategori (enkel telling fra visited.desc/category/tags)
    if (statCategory) {
      const tally = {};
      visited.forEach(p => {
        const cats = [].concat(p.category || p.categories || p.tags || []);
        cats.forEach(c => {
          const k = String(c || '').toLowerCase();
          if (!k) return;
          tally[k] = (tally[k] || 0) + 1;
        });
      });
      const best = Object.entries(tally).sort((a,b) => b[1]-a[1])[0];
      statCategory.textContent = best ? `Favoritt: ${best[0]}` : 'Favoritt: Ingen ennå';
    }

    // Rediger-knapp (modal/enkelt prompt)
    const editBtn = $('#editProfileBtn');
    if (editBtn) {
      editBtn.onclick = () => {
        const name = prompt('Ditt navn:', p.name || '');
        if (name && name.trim()) {
          const cur = getProfile();
          cur.name = name.trim();
          lsSet('hg.profile', cur);
          renderProfileCard();
        }
      };
    }
  }

  // -----------------------------
  // RENDER: Merker (med bilder)
  // -----------------------------
  function renderMerits() {
    const cont = $('#merits');
    if (!cont) return;

    const badges = getBadges();
    cont.innerHTML = '';

    if (!badges.length) {
      cont.innerHTML = `<p class="muted">Ingen merker ennå – besøk steder og ta quizer for å låse dem opp.</p>`;
      return;
    }

    const frag = document.createDocumentFragment();
    badges.forEach(b => {
      const id = normId(b.id || b.name || 'merke');
      const level = (b.level || '').toLowerCase(); // gull/sølv/bronse/…
      const medal =
        level === 'gull'  ? '🥇' :
        level === 'sølv'  ? '🥈' :
        level === 'bronse'? '🥉' : '';

      const wrap = document.createElement('div');
      wrap.className = 'badge-mini';
      wrap.innerHTML = `
        <div class="badge-wrapper">
          <img class="badge-mini-icon" src="bilder/merker/${id}.PNG" alt="${b.name || id}">
          ${medal ? `<span class="badge-medal">${medal}</span>` : ``}
        </div>
        <p class="muted" style="text-align:center">${b.name || id}</p>
      `;
      frag.appendChild(wrap);
    });

    cont.appendChild(frag);
  }

  // -----------------------------
  // RENDER: Person-galleri (runde, trykkbare)
  // -----------------------------
  function renderPeopleProfile() {
    const cont = $('#gallery');
    if (!cont) return;

    const people = getUnlockedPeople();
    cont.innerHTML = '';

    const frag = document.createDocumentFragment();
    people.forEach(p => {
      const id = normId(p.id || p.name);
      const card = document.createElement('div');
      card.className = 'person-card';
      card.innerHTML = `
        <img class="person-thumb" src="bilder/people/${id}.PNG" alt="${p.name}">
        <span class="person-label">${p.name}</span>
      `;
      card.onclick = () => {
        if (typeof window.openPersonPopup === 'function') {
          window.openPersonPopup(p);
        } else {
          // Fallback – enkel modal
          openSimpleModal(`<h3>${p.name}</h3><p class="muted">${p.desc || ''}</p>`);
        }
      };
      frag.appendChild(card);
    });

    cont.appendChild(frag);
  }

  // -----------------------------
  // RENDER: Tidslinje (sortert etter årstall)
  // -----------------------------
  function renderTimelineProfile() {
    const body = $('#timelineBody');
    const bar  = $('#timelineProgressBar');
    const txt  = $('#timelineProgressText');

    if (!body) return;

    const visited = getVisitedPlaces()
      .map(p => ({ ...p, _year: Number(p.year) || 0 }))
      .sort((a,b) => a._year - b._year);

    body.innerHTML = '';

    if (txt) txt.textContent = `${visited.length} av ${visited.length}`;

    if (!visited.length) {
      body.innerHTML = `<p class="muted">Ingen steder ennå. Utforsk kartet og ta quizer – alt du finner dukker opp her.</p>`;
      if (bar) bar.style.width = '0%';
      return;
    }

    if (bar) {
      // Du kan regne progress mot et mål (f.eks. 50) – bruker 100% når vi ikke har mål
      bar.style.width = '100%';
    }

    const frag = document.createDocumentFragment();
    visited.forEach(p => {
      const id = normId(p.id || p.placeId || p.name);
      const card = document.createElement('div');
      card.className = 'timeline-card';
      card.innerHTML = `
        <img src="bilder/steder/${id}.PNG" alt="${p.name}">
        <div class="timeline-name">${p.name}</div>
        <div class="timeline-year">${p.year || ''}</div>
      `;
      card.onclick = () => {
        const place = findPlaceById(id) || p;
        if (typeof window.openPlaceOverlay === 'function') {
          window.openPlaceOverlay(place);
        } else {
          openSimpleModal(`<h3>${place.name}</h3><p>${place.desc || ''}</p>`);
        }
      };
      frag.appendChild(card);
    });

    body.appendChild(frag);
  }

  // -----------------------------
  // RENDER: Wiki/Google-lignende infobokser for steder (valgfri seksjon)
  // Krever <div id="placeInfoList"></div> i profile.html
  // -----------------------------
  function renderPlaceInfoList() {
    const cont = $('#placeInfoList');
    if (!cont) return; // valgfri

    const visited = getVisitedPlaces()
      .map(p => ({ ...p, _year: Number(p.year) || 0 }))
      .sort((a,b) => a._year - b._year);

    cont.innerHTML = '';

    if (!visited.length) {
      cont.innerHTML = `<p class="muted">Ingen besøkte steder ennå.</p>`;
      return;
    }

    const frag = document.createDocumentFragment();
    visited.forEach(p => {
      const id = normId(p.id || p.placeId || p.name);
      const box = document.createElement('div');
      box.className = 'place-info-box';
      box.innerHTML = `
        <h3 style="margin:0 0 2px 0">${p.name}</h3>
        <p class="muted" style="margin:0 0 8px 0">${p.year || ''}</p>
        <p style="margin:0 0 10px 0">${p.desc || 'Ingen beskrivelse tilgjengelig.'}</p>
        <div style="display:flex; gap:8px; flex-wrap:wrap">
          <button class="secondary small" data-place="${id}" data-action="map">Se på kart</button>
          <button class="secondary small" data-place="${id}" data-action="popup">Vis info</button>
        </div>
      `;
      frag.appendChild(box);
    });

    cont.appendChild(frag);

    // Delegert klikk for knappene
    cont.addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-place]');
      if (!btn) return;
      const id = btn.getAttribute('data-place');
      const action = btn.getAttribute('data-action');
      const place = findPlaceById(id);
      if (!place) return;

      if (action === 'map' && typeof window.focusPlaceOnMap === 'function') {
        window.focusPlaceOnMap(place.id || id);
      }
      if (action === 'popup' && typeof window.openPlaceOverlay === 'function') {
        window.openPlaceOverlay(place);
      }
    }, { once: true }); // én lytter per render
  }

  // -----------------------------
  // Enkel fallback-modal (hvis person/sted-popup mangler)
  // -----------------------------
  function openSimpleModal(html) {
    const modal = $('#modal');
    const body  = modal ? modal.querySelector('.modal-body') : null;
    const content = $('#modalContent');
    if (!modal || !body || !content) return;
    content.innerHTML = html || '';
    modal.setAttribute('aria-hidden', 'false');
    const close = $('#modalClose') || body.querySelector('button, .icon-btn, .ghost');
    if (close) close.onclick = () => modal.setAttribute('aria-hidden', 'true');
  }

  // -----------------------------
  // INIT – vent på at data er lastet i app.js
  // -----------------------------
  async function waitForData(maxWaitMs = 5000) {
    const start = Date.now();
    while (
      (!Array.isArray(window.PLACES) || !window.PLACES.length) ||
      (!Array.isArray(window.PEOPLE) || !window.PEOPLE.length)
    ) {
      if (Date.now() - start > maxWaitMs) break;
      await delay(60);
    }
  }

  async function initProfilePage() {
    await waitForData();

    renderProfileCard();
    renderMerits();
    renderTimelineProfile();
    renderPeopleProfile();     // valgfri – rendres kun hvis #gallery finnes
    renderPlaceInfoList();     // valgfri – rendres kun hvis #placeInfoList finnes

    // Eksporter / del / nullstill
    const btnExport = $('#btnExportProfile');
    if (btnExport) btnExport.onclick = exportProfilePoster;

    const btnShare = $('#btnShareProfile');
    if (btnShare) btnShare.onclick = shareProfile;

    const btnClear = $('#btnClearData');
    if (btnClear) btnClear.onclick = clearAllData;
  }

  // -----------------------------
  // Handlinger: Eksport / Del / Nullstill
  // -----------------------------
  async function exportProfilePoster() {
    // Forenklet – ta skjermdump av profileCard
    const box = $('#profileCard');
    if (!box || !window.html2canvas) return alert('Beklager, kunne ikke eksportere.');

    const canvas = await window.html2canvas(box, { backgroundColor: null, scale: 2 });
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = 'HistoryGo-profil.png';
    a.click();
  }

  async function shareProfile() {
    const p = getProfile();
    const text = `Min History Go-profil: ${p.name || 'Utforsker'} · nivå ${p.level ?? 1}`;
    if (navigator.share) {
      try { await navigator.share({ text }); } catch {}
    } else {
      navigator.clipboard?.writeText(text);
      // showToast finnes i app.js, men kall bare hvis tilgjengelig
      if (typeof window.showToast === 'function') window.showToast('Kopiert til utklippstavlen');
      else alert('Kopiert til utklippstavlen');
    }
  }

  function clearAllData() {
    if (!confirm('Slette lokal progresjon? Dette kan ikke angres.')) return;
    ['hg.profile','hg.badges','hg_merits','badges',
     'hg.visitedPlaces','visitedPlaces','hg_places_visited',
     'hg.peopleUnlocked','peopleUnlocked'].forEach(k => localStorage.removeItem(k));
    renderProfileCard();
    renderMerits();
    renderTimelineProfile();
    renderPeopleProfile();
    renderPlaceInfoList();
    if (typeof window.showToast === 'function') window.showToast('Data er nullstilt');
  }

  // -----------------------------
  // Start
  // -----------------------------
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initProfilePage);
  } else {
    initProfilePage();
  }
})();
