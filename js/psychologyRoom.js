// js/psychologyRoom.js
// ------------------------------------------------------
// PSYKOLOGROMMET V1
// Spillifisert selvrefleksjon. Ikke helsehjelp eller diagnose.
// ------------------------------------------------------

(function () {
  const STORAGE_KEYS = {
    profile: "hg_psychology_profile_v1",
    sessions: "hg_psychology_sessions_v1",
    insights: "hg_psychology_insights_v1"
  };

  const DATA_URLS = {
    tests: "data/psychology/psychology_tests.json",
    exercises: "data/psychology/psychology_exercises.json"
  };

  let dataCache = null;

  function readJson(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (err) {
      console.warn("[PsychologyRoom.readJson]", key, err);
      return fallback;
    }
  }

  function writeJson(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      console.warn("[PsychologyRoom.writeJson]", key, err);
    }
  }

  function getProfile() {
    const profile = readJson(STORAGE_KEYS.profile, {});
    return {
      insight_points: Number(profile.insight_points || 0),
      completed_sessions: Number(profile.completed_sessions || 0),
      last_session_at: profile.last_session_at || null
    };
  }

  function saveProfile(profile) {
    writeJson(STORAGE_KEYS.profile, profile);
    window.dispatchEvent(new Event("updateProfile"));
    window.dispatchEvent(new CustomEvent("hg:psychology:profile", { detail: { profile } }));
  }

  function appendList(key, entry) {
    const list = readJson(key, []);
    const safeList = Array.isArray(list) ? list : [];
    safeList.push(entry);
    writeJson(key, safeList);
    return safeList;
  }

  async function loadData() {
    if (dataCache) return dataCache;

    const [testsRes, exercisesRes] = await Promise.all([
      fetch(DATA_URLS.tests, { cache: "no-cache" }),
      fetch(DATA_URLS.exercises, { cache: "no-cache" })
    ]);

    if (!testsRes.ok) throw new Error(`psychology_tests HTTP ${testsRes.status}`);
    if (!exercisesRes.ok) throw new Error(`psychology_exercises HTTP ${exercisesRes.status}`);

    const tests = await testsRes.json();
    const exercises = await exercisesRes.json();

    dataCache = {
      tests: Array.isArray(tests.tests) ? tests.tests : [],
      exercises: Array.isArray(exercises.exercises) ? exercises.exercises : []
    };

    return dataCache;
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function makeOverlay() {
    let overlay = document.getElementById("psychologyRoomOverlay");
    if (overlay) return overlay;

    overlay = document.createElement("div");
    overlay.id = "psychologyRoomOverlay";
    overlay.className = "psychology-room-overlay";
    overlay.setAttribute("aria-hidden", "true");
    overlay.innerHTML = `
      <div class="psychology-room-panel" role="dialog" aria-modal="true" aria-labelledby="psychologyRoomTitle">
        <button class="psychology-room-close" type="button" aria-label="Lukk">✕</button>
        <div class="psychology-room-content"></div>
      </div>
    `;

    document.body.appendChild(overlay);
    overlay.querySelector(".psychology-room-close")?.addEventListener("click", close);
    overlay.addEventListener("click", (event) => {
      if (event.target === overlay) close();
    });

    return overlay;
  }

  function setContent(html) {
    const overlay = makeOverlay();
    const content = overlay.querySelector(".psychology-room-content");
    if (content) content.innerHTML = html;
    overlay.classList.add("is-open");
    overlay.setAttribute("aria-hidden", "false");
  }

  function close() {
    const overlay = document.getElementById("psychologyRoomOverlay");
    if (!overlay) return;
    overlay.classList.remove("is-open");
    overlay.setAttribute("aria-hidden", "true");
  }

  function shell(body) {
    return `
      <header class="psychology-room-header">
        <div class="psychology-room-kicker">Psykologi</div>
        <h2 id="psychologyRoomTitle">Psykologrommet</h2>
        <p>Et refleksjonsrom for tanker, følelser, vaner og reaksjonsmønstre. Dette er spillifisert selvrefleksjon, ikke diagnose eller behandling.</p>
      </header>
      ${body}
    `;
  }

  function backButton() {
    return `<button class="psychology-room-back" type="button" data-psych-back>← Tilbake</button>`;
  }

  function bindBack() {
    document.querySelector("[data-psych-back]")?.addEventListener("click", renderHome);
  }

  function renderHome() {
    const profile = getProfile();
    setContent(shell(`
      <section class="psychology-room-profile-card">
        <div>
          <span>Innsiktspoeng</span>
          <strong>${profile.insight_points}</strong>
        </div>
        <div>
          <span>Økter</span>
          <strong>${profile.completed_sessions}</strong>
        </div>
      </section>

      <section class="psychology-room-actions">
        <button type="button" data-psych-action="tests">Ta en kort test</button>
        <button type="button" data-psych-action="exercises">Gjør en øvelse</button>
        <button type="button" data-psych-action="journal">Skriv refleksjon</button>
        <button type="button" data-psych-action="profile">Se innsiktslogg</button>
      </section>
    `));

    document.querySelector("[data-psych-action='tests']")?.addEventListener("click", renderTestList);
    document.querySelector("[data-psych-action='exercises']")?.addEventListener("click", renderExerciseList);
    document.querySelector("[data-psych-action='journal']")?.addEventListener("click", renderJournal);
    document.querySelector("[data-psych-action='profile']")?.addEventListener("click", renderProfile);
  }

  function renderTestList() {
    const tests = dataCache?.tests || [];
    setContent(shell(`
      ${backButton()}
      <section class="psychology-room-list">
        ${tests.map(test => `
          <button class="psychology-room-list-item" type="button" data-test-id="${escapeHtml(test.id)}">
            <strong>${escapeHtml(test.title)}</strong>
            <span>${escapeHtml(test.description)}</span>
          </button>
        `).join("")}
      </section>
    `));

    bindBack();
    document.querySelectorAll("[data-test-id]").forEach(button => {
      button.addEventListener("click", () => {
        const test = tests.find(item => item.id === button.dataset.testId);
        if (test) renderTest(test);
      });
    });
  }

  function renderTest(test) {
    setContent(shell(`
      ${backButton()}
      <form id="psychologyRoomTestForm" class="psychology-room-form">
        <h3>${escapeHtml(test.title)}</h3>
        <p class="psychology-room-muted">${escapeHtml(test.description)}</p>
        ${(test.questions || []).map(question => `
          <fieldset class="psychology-room-question">
            <legend>${escapeHtml(question.text)}</legend>
            <div class="psychology-room-scale">
              ${[1, 2, 3, 4, 5].map(value => `
                <label>
                  <input type="radio" name="${escapeHtml(question.id)}" value="${value}" required>
                  <span>${value}</span>
                </label>
              `).join("")}
            </div>
          </fieldset>
        `).join("")}
        <button class="psychology-room-primary" type="submit">Lagre test</button>
      </form>
    `));

    bindBack();
    document.getElementById("psychologyRoomTestForm")?.addEventListener("submit", event => {
      event.preventDefault();
      completeSession("test", test.id, test.title, 10);
    });
  }

  function renderExerciseList() {
    const exercises = dataCache?.exercises || [];
    setContent(shell(`
      ${backButton()}
      <section class="psychology-room-list">
        ${exercises.map(exercise => `
          <button class="psychology-room-list-item" type="button" data-exercise-id="${escapeHtml(exercise.id)}">
            <strong>${escapeHtml(exercise.title)}</strong>
            <span>${escapeHtml(exercise.description)}</span>
          </button>
        `).join("")}
      </section>
    `));

    bindBack();
    document.querySelectorAll("[data-exercise-id]").forEach(button => {
      button.addEventListener("click", () => {
        const exercise = exercises.find(item => item.id === button.dataset.exerciseId);
        if (exercise) renderExercise(exercise);
      });
    });
  }

  function renderExercise(exercise) {
    setContent(shell(`
      ${backButton()}
      <form id="psychologyRoomExerciseForm" class="psychology-room-form">
        <h3>${escapeHtml(exercise.title)}</h3>
        <p class="psychology-room-muted">${escapeHtml(exercise.description)}</p>
        <ol class="psychology-room-steps">
          ${(exercise.steps || []).map(step => `<li>${escapeHtml(step.text)}</li>`).join("")}
        </ol>
        <label class="psychology-room-textarea-label">
          Kort refleksjon
          <textarea name="reflection" rows="5" required></textarea>
        </label>
        <button class="psychology-room-primary" type="submit">Lagre øvelse</button>
      </form>
    `));

    bindBack();
    document.getElementById("psychologyRoomExerciseForm")?.addEventListener("submit", event => {
      event.preventDefault();
      const reflection = String(event.currentTarget.elements.reflection?.value || "").trim();
      completeSession("exercise", exercise.id, exercise.title, Number(exercise.reward?.insight_points || 5), reflection);
    });
  }

  function renderJournal() {
    setContent(shell(`
      ${backButton()}
      <form id="psychologyRoomJournalForm" class="psychology-room-form">
        <h3>Refleksjonsrom</h3>
        <label class="psychology-room-textarea-label">
          Hva legger du merke til i deg selv akkurat nå?
          <textarea name="reflection" rows="6" required></textarea>
        </label>
        <button class="psychology-room-primary" type="submit">Lagre refleksjon</button>
      </form>
    `));

    bindBack();
    document.getElementById("psychologyRoomJournalForm")?.addEventListener("submit", event => {
      event.preventDefault();
      const reflection = String(event.currentTarget.elements.reflection?.value || "").trim();
      completeSession("journal", "reflection_room", "Refleksjonsrom", 4, reflection);
    });
  }

  function completeSession(type, sourceId, title, points, reflection = "") {
    const now = new Date().toISOString();
    const entry = {
      id: `psych_${type}_${Date.now()}`,
      type,
      source_id: sourceId,
      title,
      reflection,
      insight_points: points,
      created_at: now
    };

    appendList(STORAGE_KEYS.sessions, entry);
    if (reflection) appendList(STORAGE_KEYS.insights, entry);

    const profile = getProfile();
    profile.insight_points += points;
    profile.completed_sessions += 1;
    profile.last_session_at = now;
    saveProfile(profile);

    window.showToast?.(`Psykologrommet: +${points} innsikt 🧠`);
    renderHome();
  }

  function renderProfile() {
    const profile = getProfile();
    const insights = readJson(STORAGE_KEYS.insights, []);

    setContent(shell(`
      ${backButton()}
      <section class="psychology-room-profile-card">
        <div>
          <span>Innsiktspoeng</span>
          <strong>${profile.insight_points}</strong>
        </div>
        <div>
          <span>Økter</span>
          <strong>${profile.completed_sessions}</strong>
        </div>
      </section>
      <section class="psychology-room-section">
        <h3>Siste refleksjoner</h3>
        ${Array.isArray(insights) && insights.length ? insights.slice(-5).reverse().map(item => `
          <article class="psychology-room-insight">
            <strong>${escapeHtml(item.title)}</strong>
            <p>${escapeHtml(item.reflection || "")}</p>
          </article>
        `).join("") : `<p class="psychology-room-muted">Ingen refleksjoner lagret ennå.</p>`}
      </section>
    `));

    bindBack();
  }

  async function open() {
    try {
      await loadData();
      renderHome();
    } catch (err) {
      console.warn("[PsychologyRoom.open]", err);
      window.showToast?.("Psykologrommet kunne ikke lastes");
    }
  }

  window.PsychologyRoom = {
    open,
    close,
    getProfile,
    storageKeys: STORAGE_KEYS
  };
})();
