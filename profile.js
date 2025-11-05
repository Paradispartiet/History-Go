<script>
(function () {
  if (!document.body.classList.contains('profile-page')) return;

  // Helper: safe parse from localStorage
  const read = (k, fallback={}) => {
    try { return JSON.parse(localStorage.getItem(k)) || fallback; }
    catch { return fallback; }
  };

  const peopleCollected = read('peopleCollected', {});
  const placesCollected = read('placesCollected', {});
  const favCategory = localStorage.getItem('favCategory') || '–';

  // ------- Header-statistikk -------
  function updateProfileHeader() {
    const nameEl = document.getElementById('profileName');
    const statPlaces = document.getElementById('statPlaces');
    const statPeople = document.getElementById('statPeople');
    const statCategory = document.getElementById('statCategory');

    const pc = Object.keys(placesCollected).length;
    const hc = Object.keys(peopleCollected).length;

    if (nameEl && !nameEl.textContent) nameEl.textContent = 'Utforsker';
    if (statPlaces) statPlaces.textContent = `${pc} steder`;
    if (statPeople) statPeople.textContent = `${hc} personer`;
    if (statCategory) statCategory.textContent = `Favoritt: ${favCategory}`;
  }

  // ------- Merker (enkeltuttak) -------
  function renderBadges() {
    const wrap = document.getElementById('userBadgesGrid');
    if (!wrap) return;
    // Anta at merker ligger i localStorage "badges" som array av {id, name, image}
    const badges = read('badges', []);
    wrap.innerHTML = badges.length
      ? badges.map(b => `
          <div class="badge">
            <img src="${b.image}" alt="${b.name}">
            <div class="label">${b.name}</div>
          </div>
        `).join('')
      : `<div class="muted">Ingen merker ennå.</div>`;
  }

  // ------- Steder/personer (bruker samme rutenett som forsiden) -------
  function renderPlacesAndPeople() {
    const cg = document.getElementById('collectionGrid');
    const gg = document.getElementById('gallery');
    if (cg && window.PLACES) {
      const gotIds = new Set(Object.keys(placesCollected));
      const got = window.PLACES.filter(p => gotIds.has(p.id));
      cg.innerHTML = got.length
        ? got.map(p => `
            <button class="chip" data-open="${p.id}">
              ${p.emoji || '📍'} ${p.name}
            </button>`).join('')
        : `<div class="muted">Ingen steder registrert ennå.</div>`;
    }
    if (gg && window.PEOPLE) {
      const gotIds = new Set(Object.keys(peopleCollected));
      const got = window.PEOPLE.filter(p => gotIds.has(p.id));
      gg.innerHTML = got.length
        ? got.map(p => `
            <div class="card mini">
              <img src="${p.image || `bilder/kort/people/${p.id}.PNG`}" alt="${p.name}">
              <div class="title">${p.name}</div>
            </div>`).join('')
        : `<div class="muted">Ingen personer registrert ennå.</div>`;
    }
  }

  // ------- Tidslinje (funksjonen kan ligge i app.js; kall den her) -------
  function tryRenderTimeline() {
    if (typeof renderTimelineProfile === 'function') {
      renderTimelineProfile(); // bruker PEOPLE + peopleCollected
    }
  }

  // ------- Del profil (poster) -------
  function setupShare() {
    const btn = document.getElementById('shareProfileBtn');
    const poster = document.getElementById('profilePoster');
    const posterName = document.getElementById('posterName');
    const posterStats = document.getElementById('posterStats');

    if (!btn || !poster) return;
    btn.addEventListener('click', async () => {
      // Synk med header-stat før snapshot
      const pc = Object.keys(placesCollected).length;
      const hc = Object.keys(peopleCollected).length;
      posterName.textContent = document.getElementById('profileName')?.textContent || 'Utforsker';
      posterStats.textContent = `${pc} steder · ${hc} personer`;

      poster.style.display = 'block';
      const canvas = await html2canvas(poster, {backgroundColor: null});
      poster.style.display = 'none';

      const url = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = url;
      a.download = 'historygo_profil.PNG';
      a.click();
    });
  }

  // Init
  document.addEventListener('DOMContentLoaded', () => {
    updateProfileHeader();
    renderBadges();
    renderPlacesAndPeople();
    tryRenderTimeline();
    setupShare();
  });
})();
</script>
