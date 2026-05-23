// js/psychologyRoom.js
// ------------------------------------------------------
// PSYKOLOGROMMET V2
// Spillifisert selvrefleksjon, screening og selvhjelp.
// Ikke helsehjelp, diagnose eller behandling.
// ------------------------------------------------------

(function () {
  const STORAGE_KEYS = {
    profile: "hg_psychology_profile_v1",
    sessions: "hg_psychology_sessions_v1",
    insights: "hg_psychology_insights_v1",
    pathProgress: "hg_psychology_path_progress_v1"
  };

  const DATA_URLS = {
    tests: "data/psychology/psychology_tests.json",
    exercises: "data/psychology/psychology_exercises.json",
    textConfig: "data/psychology/module_text_config.json",
    phenomena: "data/psychology/psychology_phenomena.json",
    tools: "data/psychology/cbt_tools.json",
    paths: "data/psychology/psychology_paths.json"
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

  async function fetchJsonSoft(url, fallback) {
    try {
      const res = await fetch(url, { cache: "no-cache" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn("[PsychologyRoom.fetchJsonSoft]", url, err);
      return fallback;
    }
  }

  async function loadData() {
    if (dataCache) return dataCache;

    const [tests, exercises, textConfig, phenomena, tools, paths] = await Promise.all([
      fetchJsonSoft(DATA_URLS.tests, { tests: [] }),
      fetchJsonSoft(DATA_URLS.exercises, { exercises: [] }),
      fetchJsonSoft(DATA_URLS.textConfig, {}),
      fetchJsonSoft(DATA_URLS.phenomena, { phenomena: [], safety_note: "" }),
      fetchJsonSoft(DATA_URLS.tools, { tools: [], safety_note: "" }),
      fetchJsonSoft(DATA_URLS.paths, { paths: [], safety_note: "" })
    ]);

    dataCache = {
      tests: Array.isArray(tests.tests) ? tests.tests : [],
      exercises: Array.isArray(exercises.exercises) ? exercises.exercises : [],
      textConfig: textConfig && typeof textConfig === "object" ? textConfig : {},
      phenomena: Array.isArray(phenomena.phenomena) ? phenomena.phenomena : [],
      phenomenaSafetyNote: String(phenomena.safety_note || "").trim(),
      tools: Array.isArray(tools.tools) ? tools.tools : [],
      toolsSafetyNote: String(tools.safety_note || "").trim(),
      paths: Array.isArray(paths.paths) ? paths.paths : [],
      pathsSafetyNote: String(paths.safety_note || "").trim()
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

  function label(value) {
    return String(value || "")
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
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
        <p>Et selvhjelpsrom for screening, kognitiv terapi, psykoedukasjon og refleksjon. Innholdet erstatter ikke helsehjelp.</p>
      </header>
      ${body}
    `;
  }

  function backButton(target = "home") {
    return `<button class="psychology-room-back" type="button" data-psych-back="${escapeHtml(target)}">← Tilbake</button>`;
  }

  function bindBack() {
    document.querySelectorAll("[data-psych-back]").forEach((button) => {
      button.addEventListener("click", () => {
        const target = button.dataset.psychBack || "home";
        if (target === "phenomena") renderPhenomenaList();
        else if (target === "tools") renderToolsList();
        else if (target === "paths") renderPathsList();
        else renderHome();
      });
    });
  }

  function getTextConfig() {
    return dataCache?.textConfig || {};
  }

  function getScreeningTerms() {
    const config = getTextConfig();
    return Array.isArray(config.terms) ? config.terms : [];
  }

  function getFollowUpText() {
    const config = getTextConfig();
    return String(config.follow_up || "").trim();
  }

  function getProfile() {
    const profile = readJson(STORAGE_KEYS.profile, {});
    return {
      insight_points: Number(profile.insight_points || 0),
      completed_sessions: Number(profile.completed_sessions || 0),
      last_session_at: profile.last_session_at || null,
      screening: profile.screening && typeof profile.screening === "object" ? profile.screening : {}
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

  function readPathProgress() {
    const raw = readJson(STORAGE_KEYS.pathProgress, {});
    return raw && typeof raw === "object" && !Array.isArray(raw) ? raw : {};
  }

  function writePathProgress(progress) {
    writeJson(STORAGE_KEYS.pathProgress, progress && typeof progress === "object" ? progress : {});
    window.dispatchEvent(new Event("updateProfile"));
    window.dispatchEvent(new CustomEvent("hg:psychology:path-progress", { detail: { progress: readPathProgress() } }));
  }

  function getPathProgress(pathId) {
    const progress = readPathProgress();
    const item = progress[pathId];
    if (!item || typeof item !== "object") return null;
    return {
      path_id: pathId,
      started_at: item.started_at || null,
      current_day: Number(item.current_day || 1),
      completed_days: Array.isArray(item.completed_days) ? item.completed_days.map(Number).filter(Boolean) : [],
      completed_at: item.completed_at || null,
      reward_claimed_at: item.reward_claimed_at || null
    };
  }

  function savePathProgressItem(pathId, item) {
    const progress = readPathProgress();
    progress[pathId] = item;
    writePathProgress(progress);
  }

  function startPath(path) {
    if (!path?.id) return;
    const existing = getPathProgress(path.id);
    if (existing?.started_at) {
      renderPathDetail(path);
      return;
    }

    savePathProgressItem(path.id, {
      path_id: path.id,
      started_at: new Date().toISOString(),
      current_day: 1,
      completed_days: [],
      completed_at: null,
      reward_claimed_at: null
    });
    window.showToast?.(`Startet: ${path.title}`);
    renderPathDetail(path);
  }

  function completePathDay(path, dayNumber) {
    if (!path?.id || !Number.isFinite(Number(dayNumber))) return;

    const now = new Date().toISOString();
    const existing = getPathProgress(path.id) || {
      path_id: path.id,
      started_at: now,
      current_day: 1,
      completed_days: [],
      completed_at: null,
      reward_claimed_at: null
    };

    const totalDays = Array.isArray(path.days) ? path.days.length : Number(path.duration_days || 7);
    const completed = new Set(existing.completed_days || []);
    completed.add(Number(dayNumber));
    const completedDays = [...completed].sort((a, b) => a - b);
    const isCompleted = completedDays.length >= totalDays;

    const updated = {
      ...existing,
      completed_days: completedDays,
      current_day: isCompleted ? totalDays : Math.min(totalDays, Number(dayNumber) + 1),
      completed_at: isCompleted ? (existing.completed_at || now) : null
    };

    appendList(STORAGE_KEYS.sessions, {
      id: `psych_path_day_${path.id}_${dayNumber}_${Date.now()}`,
      type: "path_day",
      source_id: path.id,
      title: `${path.title} – dag ${dayNumber}`,
      reflection: "",
      insight_points: 0,
      path_id: path.id,
      day: Number(dayNumber),
      created_at: now
    });

    if (isCompleted && !existing.reward_claimed_at) {
      const reward = path.completion_reward || {};
      const points = Number(reward.insight_points || 0);
      updated.reward_claimed_at = now;

      if (points > 0) {
        const profile = getProfile();
        profile.insight_points += points;
        profile.completed_sessions += 1;
        profile.last_session_at = now;
        saveProfile(profile);
      }

      const completionEntry = {
        id: `psych_path_completed_${path.id}_${Date.now()}`,
        type: "path_completion",
        source_id: path.id,
        title: path.title,
        reflection: `Fullført 7-dagersløp: ${path.title}`,
        insight_points: points,
        path_id: path.id,
        created_at: now,
        badge_hint: reward.badge_hint || null
      };
      appendList(STORAGE_KEYS.sessions, completionEntry);
      appendList(STORAGE_KEYS.insights, completionEntry);
      window.showToast?.(`Fullført løp: +${points} innsikt 🧠`);
    } else {
      window.showToast?.(`Dag ${dayNumber} fullført`);
    }

    savePathProgressItem(path.id, updated);
    renderPathDetail(path);
  }

  function mergeScreening(oldScreening, newDimensions) {
    const merged = { ...(oldScreening || {}) };
    Object.entries(newDimensions || {}).forEach(([dim, score]) => {
      const oldScore = Number(merged[dim]);
      const newScore = Number(score);
      if (Number.isFinite(oldScore)) merged[dim] = Math.round(oldScore * 0.6 + newScore * 0.4);
      else merged[dim] = Math.round(newScore);
    });
    return merged;
  }

  function scoreTest(test, form) {
    const min = Number(test?.scale?.min ?? 1);
    const max = Number(test?.scale?.max ?? 5);
    const denom = Math.max(1, max - min);
    const answers = {};
    const grouped = {};

    (test.questions || []).forEach((question) => {
      const raw = Number(form.elements[question.id]?.value);
      answers[question.id] = raw;
      const adjusted = question.reverse ? max - (raw - min) : raw;
      const normalized = Math.max(0, Math.min(100, ((adjusted - min) / denom) * 100));
      const dimension = String(question.dimension || "generell");
      grouped[dimension] = grouped[dimension] || [];
      grouped[dimension].push(normalized);
    });

    const dimensions = Object.fromEntries(
      Object.entries(grouped).map(([dimension, values]) => [dimension, Math.round(values.reduce((sum, v) => sum + v, 0) / values.length)])
    );

    const sorted = Object.entries(dimensions).sort((a, b) => b[1] - a[1]);
    const [topDimension = "", topScore = 0] = sorted[0] || [];

    const matchingRules = (test.result_rules || [])
      .filter((rule) => rule.dimension === topDimension && Number(topScore) >= Number(rule.min || 0))
      .sort((a, b) => Number(b.min || 0) - Number(a.min || 0));

    const bestRule = matchingRules[0] || null;
    const resultLanguage = String(getTextConfig().result_language || "").trim();
    const defaultText = resultLanguage === "faglig_screening"
      ? `Dette er et screeningmønster knyttet til ${topDimension || "dette området"}. Bruk resultatet som et øyeblikksbilde av hvordan du svarer akkurat nå.`
      : "Svarene dine er lagret som et screeningmønster. Bruk dette som et øyeblikksbilde av hvordan du svarer akkurat nå.";

    return {
      answers,
      dimensions,
      top_dimension: topDimension,
      top_score: Number(topScore) || 0,
      result_title: bestRule?.title || "Screeningprofil registrert",
      result_text: bestRule?.text || defaultText,
      recommended_exercise_id: bestRule?.recommended_exercise_id || null
    };
  }

  function findById(list, id) {
    return (Array.isArray(list) ? list : []).find((item) => String(item?.id || "") === String(id || "")) || null;
  }

  function titleFor(list, id) {
    const item = findById(list, id);
    return item?.title || id;
  }

  function renderTags(values) {
    const list = Array.isArray(values) ? values : [];
    if (!list.length) return "";
    return `<div class="psychology-room-tag-row">${list.map((item) => `<span class="psychology-room-tag">${escapeHtml(item)}</span>`).join("")}</div>`;
  }

  function renderLinkedList(title, ids, sourceList, className = "psychology-room-link-list") {
    const list = Array.isArray(ids) ? ids.filter(Boolean) : [];
    if (!list.length) return "";
    return `<section class="${escapeHtml(className)}"><h4>${escapeHtml(title)}</h4><ul>${list.map((id) => `<li>${escapeHtml(titleFor(sourceList, id))}</li>`).join("")}</ul></section>`;
  }

  function renderHome() {
    const profile = getProfile();
    const pathProgress = readPathProgress();
    const activePaths = Object.values(pathProgress).filter((item) => item && !item.completed_at).length;

    setContent(shell(`
      <section class="psychology-room-profile-card">
        <div><span>Innsiktspoeng</span><strong>${profile.insight_points}</strong></div>
        <div><span>Økter</span><strong>${profile.completed_sessions}</strong></div>
        <div><span>Aktive løp</span><strong>${activePaths}</strong></div>
        <div><span>Screeningfelt</span><strong>${Object.keys(profile.screening || {}).length}</strong></div>
      </section>
      <section class="psychology-room-actions psychology-room-tabs">
        <button type="button" data-psych-action="tests">Tester</button>
        <button type="button" data-psych-action="exercises">Øvelser</button>
        <button type="button" data-psych-action="phenomena">Fenomenleksikon</button>
        <button type="button" data-psych-action="tools">CBT-verktøy</button>
        <button type="button" data-psych-action="paths">7-dagersløp</button>
        <button type="button" data-psych-action="journal">Skriv refleksjon</button>
        <button type="button" data-psych-action="profile">Mine mønstre</button>
      </section>
    `));

    document.querySelector("[data-psych-action='tests']")?.addEventListener("click", renderTestList);
    document.querySelector("[data-psych-action='exercises']")?.addEventListener("click", renderExerciseList);
    document.querySelector("[data-psych-action='phenomena']")?.addEventListener("click", renderPhenomenaList);
    document.querySelector("[data-psych-action='tools']")?.addEventListener("click", renderToolsList);
    document.querySelector("[data-psych-action='paths']")?.addEventListener("click", renderPathsList);
    document.querySelector("[data-psych-action='journal']")?.addEventListener("click", renderJournal);
    document.querySelector("[data-psych-action='profile']")?.addEventListener("click", renderProfile);
  }

  function renderTestList() {
    const tests = dataCache?.tests || [];
    setContent(shell(`${backButton()}<section class="psychology-room-list">${tests.map(test => `<button class="psychology-room-list-item psychology-room-card" type="button" data-test-id="${escapeHtml(test.id)}"><strong>${escapeHtml(test.title)}</strong><span>${escapeHtml(test.description)}</span></button>`).join("") || `<p class="psychology-room-muted">Ingen tester funnet.</p>`}</section>`));
    bindBack();
    document.querySelectorAll("[data-test-id]").forEach(button => {
      button.addEventListener("click", () => {
        const test = tests.find(item => item.id === button.dataset.testId);
        if (test) renderTest(test);
      });
    });
  }

  function renderTest(test) {
    setContent(shell(`${backButton()}<form id="psychologyRoomTestForm" class="psychology-room-form"><h3>${escapeHtml(test.title)}</h3><p class="psychology-room-muted">${escapeHtml(test.description)}</p>${(test.questions || []).map(question => `<fieldset class="psychology-room-question"><legend>${escapeHtml(question.text)}</legend><div class="psychology-room-scale">${[1,2,3,4,5].map(value => `<label><input type="radio" name="${escapeHtml(question.id)}" value="${value}" required><span>${value}</span></label>`).join("")}</div></fieldset>`).join("")}<button class="psychology-room-primary" type="submit">Lagre test</button></form>`));
    bindBack();
    document.getElementById("psychologyRoomTestForm")?.addEventListener("submit", event => {
      event.preventDefault();
      const results = scoreTest(test, event.currentTarget);
      completeSession("screening", test.id, test.title, 10, "", results);
      renderScreeningResult(test, results);
    });
  }

  function renderScreeningResult(test, result) {
    const exercise = (dataCache?.exercises || []).find((item) => item.id === result.recommended_exercise_id);
    const highGuidance = Number(result.top_score) >= 70;
    const followUpText = getFollowUpText();
    const terms = getScreeningTerms();
    setContent(shell(`${backButton()}<section class="psychology-room-result"><h3>${escapeHtml(test.title)}</h3><p class="psychology-room-kicker">${escapeHtml(result.result_title)}</p><p>${escapeHtml(result.result_text)}</p>${terms.length ? `<p class="psychology-room-muted"><strong>Faglige nøkkelord:</strong> ${escapeHtml(terms.join(", "))}</p>` : ""}<p class="psychology-room-guidance">Dette er screening og selvinnsikt, ikke en endelig klinisk vurdering.</p>${highGuidance && followUpText ? `<p class="psychology-room-guidance">${escapeHtml(followUpText)}</p>` : ""}<section class="psychology-room-section"><h4>Dimensjonsscorer</h4>${Object.entries(result.dimensions || {}).map(([dim, score]) => `<div class="psychology-room-score"><span>${escapeHtml(dim)}</span><strong>${escapeHtml(score)}</strong></div>`).join("")}</section>${exercise ? `<button class="psychology-room-primary" type="button" data-open-exercise="${escapeHtml(exercise.id)}">Anbefalt øvelse: ${escapeHtml(exercise.title)}</button>` : ""}</section>`));
    bindBack();
    document.querySelector("[data-open-exercise]")?.addEventListener("click", () => { if (exercise) renderExercise(exercise); });
  }

  function renderExerciseList() {
    const exercises = dataCache?.exercises || [];
    setContent(shell(`${backButton()}<section class="psychology-room-list">${exercises.map(exercise => `<button class="psychology-room-list-item psychology-room-card" type="button" data-exercise-id="${escapeHtml(exercise.id)}"><strong>${escapeHtml(exercise.title)}</strong><span>${escapeHtml(exercise.description)}</span></button>`).join("") || `<p class="psychology-room-muted">Ingen øvelser funnet.</p>`}</section>`));
    bindBack();
    document.querySelectorAll("[data-exercise-id]").forEach(button => {
      button.addEventListener("click", () => {
        const exercise = exercises.find(item => item.id === button.dataset.exerciseId);
        if (exercise) renderExercise(exercise);
      });
    });
  }

  function renderExercise(exercise) {
    setContent(shell(`${backButton()}<form id="psychologyRoomExerciseForm" class="psychology-room-form"><h3>${escapeHtml(exercise.title)}</h3><p class="psychology-room-muted">${escapeHtml(exercise.description)}</p><ol class="psychology-room-steps">${(exercise.steps || []).map(step => `<li>${escapeHtml(step.text)}</li>`).join("")}</ol><label class="psychology-room-textarea-label">Kort refleksjon<textarea name="reflection" rows="5" required></textarea></label><button class="psychology-room-primary" type="submit">Lagre øvelse</button></form>`));
    bindBack();
    document.getElementById("psychologyRoomExerciseForm")?.addEventListener("submit", event => {
      event.preventDefault();
      const reflection = String(event.currentTarget.elements.reflection?.value || "").trim();
      completeSession("exercise", exercise.id, exercise.title, Number(exercise.reward?.insight_points || 5), reflection);
    });
  }

  function renderPhenomenaList() {
    const phenomena = dataCache?.phenomena || [];
    setContent(shell(`${backButton()}<section class="psychology-room-section"><h3>Fenomenleksikon</h3><p class="psychology-room-muted">Psykologiske fenomener og kognitive mønstre som kan hjelpe deg å forstå egne reaksjoner.</p></section><section class="psychology-room-list">${phenomena.map((item) => `<button class="psychology-room-list-item psychology-room-card" type="button" data-phenomenon-id="${escapeHtml(item.id)}"><strong>${escapeHtml(item.title)}</strong><span>${escapeHtml(item.short || "")}</span>${renderTags(item.appears_when)}</button>`).join("") || `<p class="psychology-room-muted">Ingen fenomener funnet.</p>`}</section>`));
    bindBack();
    document.querySelectorAll("[data-phenomenon-id]").forEach((button) => {
      button.addEventListener("click", () => {
        const item = findById(phenomena, button.dataset.phenomenonId);
        if (item) renderPhenomenonDetail(item);
      });
    });
  }

  function renderPhenomenonDetail(item) {
    setContent(shell(`${backButton("phenomena")}<article class="psychology-room-detail"><div class="psychology-room-kicker">${escapeHtml(item.category || "fenomen")}</div><h3>${escapeHtml(item.title)}</h3><p><strong>${escapeHtml(item.short || "")}</strong></p><p>${escapeHtml(item.description || "")}</p>${renderTags(item.appears_when)}${renderLinkedList("Vanlige tegn", item.common_signs, [])}${renderLinkedList("Nyttige spørsmål", item.helpful_questions, [])}${renderLinkedList("Relaterte CBT-verktøy", item.related_tools, dataCache?.tools || [])}${renderLinkedList("Relaterte tester", item.related_tests, dataCache?.tests || [])}${renderLinkedList("Relaterte øvelser", item.related_exercises, dataCache?.exercises || [])}${item.history_go_angle ? `<p class="psychology-room-guidance">${escapeHtml(item.history_go_angle)}</p>` : ""}${dataCache?.phenomenaSafetyNote ? `<p class="psychology-room-safety-note">${escapeHtml(dataCache.phenomenaSafetyNote)}</p>` : ""}</article>`));
    bindBack();
  }

  function renderToolsList() {
    const tools = dataCache?.tools || [];
    setContent(shell(`${backButton()}<section class="psychology-room-section"><h3>CBT-verktøy</h3><p class="psychology-room-muted">Kognitive og atferdsbaserte verktøy for strukturert selvhjelp. I denne versjonen kan verktøyene leses; interaktiv utfylling kommer senere.</p></section><section class="psychology-room-list">${tools.map((tool) => `<button class="psychology-room-list-item psychology-room-card" type="button" data-tool-id="${escapeHtml(tool.id)}"><strong>${escapeHtml(tool.title)}</strong><span>${escapeHtml(tool.short || "")}</span>${renderTags([label(tool.type), `${Number(tool.duration_minutes || 0)} min`])}</button>`).join("") || `<p class="psychology-room-muted">Ingen verktøy funnet.</p>`}</section>`));
    bindBack();
    document.querySelectorAll("[data-tool-id]").forEach((button) => {
      button.addEventListener("click", () => {
        const tool = findById(tools, button.dataset.toolId);
        if (tool) renderToolDetail(tool);
      });
    });
  }

  function renderToolDetail(tool) {
    const reward = tool.reward || {};
    setContent(shell(`${backButton("tools")}<article class="psychology-room-detail"><div class="psychology-room-kicker">${escapeHtml(label(tool.type || "verktøy"))}</div><h3>${escapeHtml(tool.title)}</h3><p>${escapeHtml(tool.short || "")}</p>${renderTags([`${Number(tool.duration_minutes || 0)} min`])}${renderLinkedList("Når brukes det", tool.when_to_use, [])}<section class="psychology-room-section"><h4>Steg</h4><ol class="psychology-room-steps">${(tool.steps || []).map((step) => `<li>${escapeHtml(step.text || step)}</li>`).join("")}</ol></section>${renderLinkedList("Refleksjonsspørsmål", tool.reflection_questions, [])}${renderLinkedList("Relaterte fenomener", tool.related_phenomena, dataCache?.phenomena || [])}${renderLinkedList("Relaterte øvelser", tool.related_exercises, dataCache?.exercises || [])}${reward.insight_points ? `<p class="psychology-room-muted">Senere kan dette gi ${escapeHtml(reward.insight_points)} innsiktspoeng når interaktiv utfylling er på plass.</p>` : ""}${dataCache?.toolsSafetyNote ? `<p class="psychology-room-safety-note">${escapeHtml(dataCache.toolsSafetyNote)}</p>` : ""}</article>`));
    bindBack();
  }

  function renderPathsList() {
    const paths = dataCache?.paths || [];
    setContent(shell(`${backButton()}<section class="psychology-room-section"><h3>7-dagersløp</h3><p class="psychology-room-muted">Start et kort selvhjelpsløp, fullfør én dag om gangen og få reward først når hele løpet er fullført.</p></section><section class="psychology-room-list">${paths.map((path) => {
      const progress = getPathProgress(path.id);
      const completed = progress?.completed_days?.length || 0;
      const total = Array.isArray(path.days) ? path.days.length : Number(path.duration_days || 7);
      const status = progress?.completed_at ? "Fullført" : progress?.started_at ? `${completed}/${total} dager` : "Ikke startet";
      return `<button class="psychology-room-list-item psychology-room-card" type="button" data-path-id="${escapeHtml(path.id)}"><strong>${escapeHtml(path.title)}</strong><span>${escapeHtml(path.description || "")}</span>${renderTags([`${total} dager`, status, ...(path.focus || [])])}</button>`;
    }).join("") || `<p class="psychology-room-muted">Ingen løp funnet.</p>`}</section>`));
    bindBack();
    document.querySelectorAll("[data-path-id]").forEach((button) => {
      button.addEventListener("click", () => {
        const path = findById(paths, button.dataset.pathId);
        if (path) renderPathDetail(path);
      });
    });
  }

  function renderPathDetail(path) {
    const progress = getPathProgress(path.id);
    const days = Array.isArray(path.days) ? path.days : [];
    const completedDays = new Set(progress?.completed_days || []);
    const total = days.length || Number(path.duration_days || 7);
    const currentDay = progress?.current_day || 1;
    const isStarted = Boolean(progress?.started_at);
    const isCompleted = Boolean(progress?.completed_at);
    const reward = path.completion_reward || {};

    setContent(shell(`${backButton("paths")}<article class="psychology-room-detail"><div class="psychology-room-kicker">7-dagersløp</div><h3>${escapeHtml(path.title)}</h3><p>${escapeHtml(path.description || "")}</p>${renderTags([`${total} dager`, ...(path.focus || [])])}<section class="psychology-room-section"><h4>Status</h4><div class="psychology-room-score"><span>Progresjon</span><strong>${escapeHtml(completedDays.size)}/${escapeHtml(total)}</strong></div>${isCompleted ? `<p class="psychology-room-guidance">Løpet er fullført.</p>` : isStarted ? `<p class="psychology-room-guidance">Dagens steg: dag ${escapeHtml(currentDay)}.</p>` : `<p class="psychology-room-muted">Dette løpet er ikke startet ennå.</p>`}${reward.insight_points ? `<p class="psychology-room-muted">Fullføring: ${escapeHtml(reward.insight_points)} innsiktspoeng${reward.badge_hint ? ` · ${escapeHtml(reward.badge_hint)}` : ""}</p>` : ""}</section>${!isStarted ? `<button class="psychology-room-primary" type="button" data-start-path="${escapeHtml(path.id)}">Start løp</button>` : ""}<section class="psychology-room-section"><h4>Dag for dag</h4>${days.map((day) => {
      const dayNo = Number(day.day || 0);
      const done = completedDays.has(dayNo);
      const canComplete = isStarted && !isCompleted && dayNo === currentDay && !done;
      return `<article class="psychology-room-day${done ? " is-done" : ""}"><div class="psychology-room-day-head"><strong>Dag ${escapeHtml(dayNo)}: ${escapeHtml(day.title || "")}</strong><span>${done ? "Fullført" : dayNo === currentDay && isStarted ? "Dagens steg" : ""}</span></div><p>${escapeHtml(day.reflection_prompt || "")}</p><ul class="psychology-room-link-list"><li>Fenomen: ${escapeHtml(titleFor(dataCache?.phenomena || [], day.phenomenon_id))}</li><li>Verktøy: ${escapeHtml(titleFor(dataCache?.tools || [], day.tool_id))}</li><li>Øvelse: ${escapeHtml(titleFor(dataCache?.exercises || [], day.exercise_id))}</li></ul>${canComplete ? `<button class="psychology-room-primary" type="button" data-complete-path-day="${escapeHtml(dayNo)}">Fullfør dag ${escapeHtml(dayNo)}</button>` : ""}</article>`;
    }).join("")}</section>${dataCache?.pathsSafetyNote ? `<p class="psychology-room-safety-note">${escapeHtml(dataCache.pathsSafetyNote)}</p>` : ""}</article>`));

    bindBack();
    document.querySelector("[data-start-path]")?.addEventListener("click", () => startPath(path));
    document.querySelectorAll("[data-complete-path-day]").forEach((button) => {
      button.addEventListener("click", () => completePathDay(path, Number(button.dataset.completePathDay)));
    });
  }

  function renderJournal() {
    setContent(shell(`${backButton()}<form id="psychologyRoomJournalForm" class="psychology-room-form"><h3>Refleksjonsrom</h3><label class="psychology-room-textarea-label">Hva legger du merke til i deg selv akkurat nå?<textarea name="reflection" rows="6" required></textarea></label><button class="psychology-room-primary" type="submit">Lagre refleksjon</button></form>`));
    bindBack();
    document.getElementById("psychologyRoomJournalForm")?.addEventListener("submit", event => {
      event.preventDefault();
      const reflection = String(event.currentTarget.elements.reflection?.value || "").trim();
      completeSession("journal", "reflection_room", "Refleksjonsrom", 4, reflection);
    });
  }

  function completeSession(type, sourceId, title, points, reflection = "", screeningResult = null) {
    const now = new Date().toISOString();
    const entry = {
      id: `psych_${type}_${Date.now()}`,
      type,
      source_id: sourceId,
      title,
      reflection,
      insight_points: points,
      created_at: now,
      ...(screeningResult || {})
    };

    appendList(STORAGE_KEYS.sessions, entry);
    if (reflection || screeningResult) appendList(STORAGE_KEYS.insights, entry);

    const profile = getProfile();
    profile.insight_points += points;
    profile.completed_sessions += 1;
    profile.last_session_at = now;
    if (screeningResult?.dimensions) {
      profile.screening = mergeScreening(profile.screening, screeningResult.dimensions);
    }
    saveProfile(profile);

    window.showToast?.(`Psykologrommet: +${points} innsikt 🧠`);
    if (!screeningResult) renderHome();
  }

  function renderProfile() {
    const profile = getProfile();
    const insights = readJson(STORAGE_KEYS.insights, []);
    const screenings = Array.isArray(insights) ? insights.filter((item) => item.type === "screening") : [];
    const pathProgress = readPathProgress();
    const pathEntries = Object.values(pathProgress).filter(Boolean);

    setContent(shell(`${backButton()}<section class="psychology-room-profile-card"><div><span>Innsiktspoeng</span><strong>${profile.insight_points}</strong></div><div><span>Økter</span><strong>${profile.completed_sessions}</strong></div></section><section class="psychology-room-section"><h3>Screeningprofil</h3>${Object.keys(profile.screening || {}).length ? Object.entries(profile.screening).map(([dimension, score]) => `<div class="psychology-room-score"><span>${escapeHtml(dimension)}</span><strong>${escapeHtml(score)}</strong></div>`).join("") : `<p class="psychology-room-muted">Ingen screeningdata lagret ennå.</p>`}</section><section class="psychology-room-section"><h3>7-dagersløp</h3>${pathEntries.length ? pathEntries.map((item) => { const path = findById(dataCache?.paths || [], item.path_id); const total = path?.days?.length || path?.duration_days || 7; const done = Array.isArray(item.completed_days) ? item.completed_days.length : 0; return `<article class="psychology-room-insight"><strong>${escapeHtml(path?.title || item.path_id)}</strong><p>${item.completed_at ? "Fullført" : `Pågår: ${done}/${total} dager`}</p></article>`; }).join("") : `<p class="psychology-room-muted">Ingen løp startet ennå.</p>`}</section><section class="psychology-room-section"><h3>Siste refleksjoner / screeningresultater</h3>${Array.isArray(insights) && insights.length ? insights.slice(-7).reverse().map(item => `<article class="psychology-room-insight"><strong>${escapeHtml(item.title)}</strong><p>${escapeHtml(item.reflection || item.result_text || "")}</p></article>`).join("") : `<p class="psychology-room-muted">Ingen refleksjoner lagret ennå.</p>`}</section><section class="psychology-room-section"><h3>Siste screening</h3>${screenings.length ? screenings.slice(-3).reverse().map(item => `<article class="psychology-room-insight"><strong>${escapeHtml(item.result_title || item.title)}</strong><p>${escapeHtml(item.result_text || "")}</p></article>`).join("") : `<p class="psychology-room-muted">Ingen screeningresultater lagret ennå.</p>`}</section>`));
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
    getPathProgress,
    storageKeys: STORAGE_KEYS
  };
})();
