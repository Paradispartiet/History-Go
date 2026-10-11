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
    pathProgress: "hg_psychology_path_progress_v1",
    pathReflections: "hg_psychology_path_reflections_v1",
    workbench: "hg_psychology_workbench_v1"
  };

  const DATA_URLS = {
    tests: "data/psychology/psychology_tests.json",
    exercises: "data/psychology/psychology_exercises.json",
    textConfig: "data/psychology/module_text_config.json",
    phenomena: "data/psychology/psychology_phenomena.json",
    tools: "data/psychology/cbt_tools.json",
    paths: "data/psychology/psychology_paths.json",
    theories: "data/psychology/psychology_theories.json"
  };

  let dataCache = null;
  let activeSection = "home";

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

    const [tests, exercises, textConfig, phenomena, tools, paths, theoryCatalog] = await Promise.all([
      fetchJsonSoft(DATA_URLS.tests, { tests: [] }),
      fetchJsonSoft(DATA_URLS.exercises, { exercises: [] }),
      fetchJsonSoft(DATA_URLS.textConfig, {}),
      fetchJsonSoft(DATA_URLS.phenomena, { phenomena: [], safety_note: "" }),
      fetchJsonSoft(DATA_URLS.tools, { tools: [], safety_note: "" }),
      fetchJsonSoft(DATA_URLS.paths, { paths: [], safety_note: "" }),
      fetchJsonSoft(DATA_URLS.theories, { chapters: [], theories: [], introduction: "", safety_note: "" })
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
      pathsSafetyNote: String(paths.safety_note || "").trim(),
      theoryChapters: Array.isArray(theoryCatalog.chapters) ? theoryCatalog.chapters : [],
      theories: Array.isArray(theoryCatalog.theories) ? theoryCatalog.theories : [],
      theoryIntroduction: String(theoryCatalog.introduction || "").trim(),
      theorySafetyNote: String(theoryCatalog.safety_note || "").trim()
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

  function navigationIcon(kind) {
    const paths = {
      home: '<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/>',
      phenomena: '<circle cx="12" cy="12" r="8"/><path d="M12 7v10M7 12h10M9 9l6 6M15 9l-6 6"/>',
      practice: '<path d="M7 3h10v4H7zM5 7h14v14H5z"/><path d="m9 14 2 2 4-5"/>',
      theories: '<path d="M12 6C9.3 4.3 6.4 4 3 5v14c3.4-1 6.3-.7 9 1 2.7-1.7 5.6-2 9-1V5c-3.4-1-6.3-.7-9 1zM12 6v14"/>',
      profile: '<circle cx="12" cy="8" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2"/>'
    };
    return '<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">' +
      (paths[kind] || paths.home) + '</svg>';
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
        <button class="psychology-room-close" type="button" aria-label="Lukk Psykologrommet">
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="m6 6 12 12M18 6 6 18"/></svg>
        </button>
        <div class="psychology-room-content"></div>
        <nav class="psychology-room-footer" aria-label="Navigasjon i Psykologrommet">
          <button type="button" data-psych-nav="home" aria-label="Hjem">${navigationIcon("home")}<span>Hjem</span></button>
          <button type="button" data-psych-nav="phenomena" aria-label="Fenomener">${navigationIcon("phenomena")}<span>Fenomener</span></button>
          <button type="button" data-psych-nav="practice" aria-label="Øvelser og verktøy">${navigationIcon("practice")}<span>Øvelser</span></button>
          <button type="button" data-psych-nav="theories" aria-label="Psykoteori">${navigationIcon("theories")}<span>Teori</span></button>
          <button type="button" data-psych-nav="profile" aria-label="Min side">${navigationIcon("profile")}<span>Min side</span></button>
        </nav>
      </div>
    `;
    document.body.appendChild(overlay);
    overlay.querySelector(".psychology-room-close")?.addEventListener("click", close);
    const navigation = {
      home: renderHome,
      phenomena: renderPhenomenaList,
      practice: renderToolsList,
      theories: renderTheoryList,
      profile: renderProfile
    };
    Object.entries(navigation).forEach(([section, action]) => {
      overlay.querySelector('[data-psych-nav="' + section + '"]')?.addEventListener("click", () => action());
    });
    overlay.addEventListener("click", (event) => {
      if (event.target === overlay) close();
    });
    document.addEventListener?.("keydown", (event) => {
      if (event.key === "Escape" && overlay.classList.contains("is-open")) close();
    });
    return overlay;
  }

  function setActiveSection(section) {
    activeSection = section;
  }

  function setContent(html) {
    const overlay = makeOverlay();
    const content = overlay.querySelector(".psychology-room-content");
    if (content) {
      content.innerHTML = html;
      content.scrollTop = 0;
    }
    overlay.dataset.activeSection = activeSection;
    for (const section of ["home", "phenomena", "practice", "theories", "profile"]) {
      const button = overlay.querySelector('[data-psych-nav="' + section + '"]');
      if (activeSection === section) button?.setAttribute("aria-current", "page");
      else button?.removeAttribute?.("aria-current");
    }
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
        <div class="psychology-room-header-logo" aria-hidden="true">Ψ</div>
        <div class="psychology-room-header-copy">
          <div class="psychology-room-kicker">History Go <span aria-hidden="true">/</span> Fagrom</div>
          <h2 id="psychologyRoomTitle">Psykologrommet</h2>
          <p>Forstå · Utforsk · Prøv · Lær</p>
        </div>
      </header>
      ${body}
    `;
  }

  function backButton(target = "home") {
    return `<button class="psychology-room-back" type="button" data-psych-back="${escapeHtml(target)}">← Tilbake</button>`;
  }

  function pathBackButton(pathId) {
    return `<button class="psychology-room-back" type="button" data-psych-back-path="${escapeHtml(pathId)}">← Tilbake</button>`;
  }

  function bindBack() {
    document.querySelectorAll("[data-psych-back]").forEach((/** @type {HTMLElement} */ button) => {
      button.addEventListener("click", () => {
        const target = button.dataset.psychBack || "home";
        if (target.startsWith("theory:")) {
          const theory = findById(dataCache?.theories || [], target.slice(7));
          if (theory) renderTheoryDetail(theory);
          else renderTheoryList();
        }
        else if (target === "theories") renderTheoryList();
        else if (target === "phenomena") renderPhenomenaList();
        else if (target === "workbench") renderWorkbench();
        else if (target.startsWith("phenomenon:")) {
          const phenomenon = findById(dataCache?.phenomena || [], target.slice(11));
          if (phenomenon) renderPhenomenonDetail(phenomenon);
          else renderPhenomenaList();
        }
        else if (target === "tools") renderToolsList();
        else if (target === "paths") renderPathsList();
        else renderHome();
      });
    });

    document.querySelectorAll("[data-psych-back-path]").forEach((/** @type {HTMLElement} */ button) => {
      button.addEventListener("click", () => {
        const path = findById(dataCache?.paths || [], button.dataset.psychBackPath);
        if (path) renderPathDetail(path);
        else renderPathsList();
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
      screening: profile.screening && typeof profile.screening === "object" ? profile.screening : {},
      psychology_competence: Number(profile.psychology_competence || 0)
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

  // Reflections remain in local browser storage; they are not personality,
  // diagnosis, or gameplay measurements and are never forwarded to Civication.
  function getWorkbenchEntries() {
    const saved = readJson(STORAGE_KEYS.workbench, []);
    return Array.isArray(saved) ? saved.filter((entry) =>
      entry && typeof entry === "object" && typeof entry.situation === "string") : [];
  }

  function saveWorkbench(values = {}) {
    const fields = ["situation", "thoughts", "feelings", "body", "actions", "next_step"];
    const clean = Object.fromEntries(fields.map((field) =>
      [field, String(values[field] || "").trim().slice(0, 2400)]));
    if (!clean.situation) return { saved: false, reason: "situation_required" };
    const entry = {
      id: "psych_workbench_" + Date.now(),
      created_at: new Date().toISOString(),
      ...clean
    };
    const history = getWorkbenchEntries();
    history.push(entry);
    writeJson(STORAGE_KEYS.workbench, history.slice(-30));
    return { saved: true, entry };
  }

  function renderWorkbench() {
    setActiveSection("home");
    const recent = getWorkbenchEntries().slice(-1)[0] || null;
    setContent(shell(`${backButton()}
      <section class="psychology-room-workbench">
        <div class="psychology-room-eyebrow">TRINN 01 / OBSERVER</div>
        <h3>Tankeverksted</h3>
        <p class="psychology-room-lead">Utforsk én situasjon uten å sette merkelapp på deg selv.</p>
        <p class="psychology-room-muted">Skill det som skjedde fra tolkningen din. Du velger selv hvilket fenomen du vil lese om etterpå.</p>
        <form id="psychologyRoomWorkbenchForm" class="psychology-room-form">
          <label class="psychology-room-textarea-label"><span>1. Hva skjedde konkret?</span>
            <textarea name="situation" rows="3" maxlength="2400" placeholder="Beskriv en bestemt hendelse …" required></textarea>
          </label>
          <label class="psychology-room-textarea-label"><span>2. Hva tenkte eller antok du?</span>
            <textarea name="thoughts" rows="3" maxlength="2400" placeholder="Hva var tolkningen din?"></textarea>
          </label>
          <div class="psychology-room-workbench-grid">
            <label class="psychology-room-textarea-label"><span>3. Hvilke følelser la du merke til?</span>
              <textarea name="feelings" rows="3" maxlength="2400"></textarea>
            </label>
            <label class="psychology-room-textarea-label"><span>4. Hva merket du i kroppen?</span>
              <textarea name="body" rows="3" maxlength="2400"></textarea>
            </label>
          </div>
          <label class="psychology-room-textarea-label"><span>5. Hva gjorde du?</span>
            <textarea name="actions" rows="3" maxlength="2400" placeholder="Hva var handlingen eller reaksjonen?"></textarea>
          </label>
          <label class="psychology-room-textarea-label"><span>6. Hva vil du undersøke eller prøve neste gang? (valgfritt)</span>
            <textarea name="next_step" rows="2" maxlength="2400"></textarea>
          </label>
          <p class="psychology-room-privacy">Lagring skjer bare lokalt i nettleseren på denne enheten. Ingen svar sendes til Civication, brukes til diagnostikk eller gir kompetansepoeng.</p>
          <button class="psychology-room-primary" type="submit">Lagre og utforsk fenomener →</button>
        </form>
        ${recent ? '<div class="psychology-room-workbench-recent"><span>Sist lagret refleksjon</span><strong>' +
          escapeHtml(recent.situation.slice(0, 180)) + '</strong></div>' : ""}
      </section>
    `));
    bindBack();
    document.getElementById("psychologyRoomWorkbenchForm")?.addEventListener("submit", (event) => {
      event.preventDefault();
      const form = /** @type {HTMLFormElement} */ (event.currentTarget);
      const values = Object.fromEntries(["situation", "thoughts", "feelings", "body", "actions", "next_step"]
        .map((field) => [field, form.elements[field]?.value || ""]));
      const result = saveWorkbench(values);
      if (!result.saved) {
        window.showToast?.("Beskriv først en konkret hendelse");
        return;
      }
      window.showToast?.("Refleksjonen er lagret på denne enheten");
      renderPhenomenaList(true);
    });
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

  function readPathReflections() {
    const raw = readJson(STORAGE_KEYS.pathReflections, {});
    return raw && typeof raw === "object" && !Array.isArray(raw) ? raw : {};
  }

  function writePathReflections(reflections) {
    writeJson(STORAGE_KEYS.pathReflections, reflections && typeof reflections === "object" && !Array.isArray(reflections) ? reflections : {});
    window.dispatchEvent(new Event("updateProfile"));
  }

  function getDayReflection(pathId, dayNumber) {
    const reflections = readPathReflections();
    const pathReflections = reflections?.[pathId];
    const dayReflection = pathReflections && typeof pathReflections === "object" ? pathReflections[String(Number(dayNumber))] : null;
    return dayReflection && typeof dayReflection === "object" ? dayReflection : { reflection: "", updated_at: null };
  }

  function saveDayReflection(pathId, dayNumber, reflectionText) {
    if (!pathId || !Number.isFinite(Number(dayNumber))) return null;
    const reflections = readPathReflections();
    const pathReflections = reflections[pathId] && typeof reflections[pathId] === "object" && !Array.isArray(reflections[pathId]) ? reflections[pathId] : {};
    const entry = {
      reflection: String(reflectionText || "").trim(),
      updated_at: new Date().toISOString()
    };
    reflections[pathId] = { ...pathReflections, [String(Number(dayNumber))]: entry };
    writePathReflections(reflections);
    return entry;
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

  function completePathDay(path, dayNumber, reflectionText = "") {
    if (!path?.id || !Number.isFinite(Number(dayNumber))) return;

    const dayNo = Number(dayNumber);
    const savedReflection = getDayReflection(path.id, dayNo).reflection || "";
    const finalReflection = String(reflectionText || savedReflection || "").trim();
    if (!finalReflection) {
      window.showToast?.("Skriv en kort refleksjon før du fullfører dagen");
      return;
    }

    const now = new Date().toISOString();
    saveDayReflection(path.id, dayNo, finalReflection);

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
    completed.add(dayNo);
    const completedDays = [...completed].sort((a, b) => a - b);
    const isCompleted = completedDays.length >= totalDays;

    const updated = {
      ...existing,
      completed_days: completedDays,
      current_day: isCompleted ? totalDays : Math.min(totalDays, dayNo + 1),
      completed_at: isCompleted ? (existing.completed_at || now) : null
    };

    const dayEntry = {
      id: `psych_path_day_${path.id}_${dayNo}_${Date.now()}`,
      type: "path_day",
      source_id: path.id,
      title: `${path.title} – dag ${dayNo}`,
      reflection: finalReflection,
      insight_points: 0,
      path_id: path.id,
      day: dayNo,
      created_at: now
    };
    appendList(STORAGE_KEYS.sessions, dayEntry);
    appendList(STORAGE_KEYS.insights, dayEntry);

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
      window.showToast?.(`Dag ${dayNo} fullført`);
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

  function renderRelatedActions(title, ids, source, kind) {
    const entries = (Array.isArray(ids) ? ids : [])
      .map((id) => findById(source, id)).filter(Boolean);
    if (!entries.length) return "";
    return '<section class="psychology-room-related"><h4>' + escapeHtml(title) +
      '</h4><div class="psychology-room-related-grid">' +
      entries.map((item) => '<button type="button" class="psychology-room-related-action" data-psych-related="' +
        escapeHtml(kind) + '" data-psych-related-id="' + escapeHtml(item.id) +
        '"><strong>' + escapeHtml(item.title) + '</strong><span aria-hidden="true">↗</span></button>').join("") +
      '</div></section>';
  }

  function renderLinkedList(title, ids, sourceList, className = "psychology-room-link-list") {
    const list = Array.isArray(ids) ? ids.filter(Boolean) : [];
    if (!list.length) return "";
    return `<section class="${escapeHtml(className)}"><h4>${escapeHtml(title)}</h4><ul>${list.map((id) => `<li>${escapeHtml(titleFor(sourceList, id))}</li>`).join("")}</ul></section>`;
  }


  // Learning cards reference canonical Fagverk chapter and emne IDs. They never
  // score mental health, modify psychology competence, or award insight points.
  function theoryChapterLink(chapterId) {
    return "fagverk.html?subject=psykologi&chapter=" + encodeURIComponent(chapterId);
  }

  function theoryEmneLink(emneId) {
    return "fagverk.html?subject=psykologi&emne=" + encodeURIComponent(emneId);
  }

  function renderTheoryList() {
    setActiveSection("theories");
    const chapters = dataCache?.theoryChapters || [];
    const theories = dataCache?.theories || [];
    const sections = chapters.map((chapter) => {
      const grouped = theories.filter((item) => item.chapter_id === chapter.id);
      if (!grouped.length) return "";
      return '<section class="psychology-room-theory-group"><div class="psychology-room-theory-head"><h4>' +
        escapeHtml(chapter.title) + '</h4><a href="' + escapeHtml(theoryChapterLink(chapter.id)) +
        '">Les fagverkskapittelet ↗</a></div><div class="psychology-room-list">' +
        grouped.map((item) => '<button class="psychology-room-list-item psychology-room-card" type="button" data-theory-id="' +
          escapeHtml(item.id) + '"><strong>' + escapeHtml(item.title) + '</strong><span>' +
          escapeHtml(item.teaching_view?.idea || item.idea) + '</span></button>').join("") + '</div></section>';
    }).join("");
    setContent(shell(backButton() + '<section class="psychology-room-section"><h3>Psykoteori</h3><p class="psychology-room-muted">' +
      escapeHtml(dataCache?.theoryIntroduction || "Innføring i psykologiske teorier.") +
      '</p><a class="psychology-room-fagverk-link" href="fagverk.html?subject=psykologi">Åpne hele psykologifagverket ↗</a></section>' +
      (sections || '<p class="psychology-room-muted">Ingen teorier funnet.</p>') + 
      (dataCache?.theorySafetyNote ? '<p class="psychology-room-safety-note">' + escapeHtml(dataCache.theorySafetyNote) + '</p>' : '')));
    bindBack();
    document.querySelectorAll("[data-theory-id]").forEach((button) => {
      button.addEventListener("click", () => {
        const theory = findById(theories, button.dataset.theoryId);
        if (theory) renderTheoryDetail(theory);
      });
    });
  }

  function renderTheoryDetail(theory) {
    setActiveSection("theories");
    const theories = dataCache?.theories || [];
    const chapter = (dataCache?.theoryChapters || []).find((item) => item.id === theory.chapter_id);
    const comparison = findById(theories, theory.compare_with);
    const related = (theory.related_phenomena || []).map((id) =>
      findById(dataCache?.phenomena || [], id)).filter(Boolean);
    const reading = theory.teaching_view || theory;
    const information = [
      ["Kjerneidé", reading.idea],
      ["Hvordan undersøkes dette?", reading.method],
      ["Begrensninger og kritikk", reading.limit],
      ["Undervisningseksempel 1 (hypotetisk)", theory.example],
      ["Undervisningseksempel 2 (hypotetisk)", theory.example_secondary]
    ].map(([heading, value]) => '<section><h4>' + escapeHtml(heading) + '</h4><p>' +
      escapeHtml(value || "") + '</p></section>').join("");
    const comparisonHtml = comparison
      ? '<section class="psychology-room-theory-compare"><h4>Sammenlign teoriene</h4><p>' +
        escapeHtml(theory.contrast || "") + '</p><button type="button" class="psychology-room-mini-action" data-theory-compare="' +
        escapeHtml(comparison.id) + '">Se ' + escapeHtml(comparison.title) + ' →</button></section>'
      : '';
    const phenomenaHtml = related.length
      ? '<section class="psychology-room-section"><h4>Beslektede fenomener</h4><div class="psychology-room-theory-links">' +
        related.map((item) => '<button type="button" class="psychology-room-mini-action" data-theory-phenomenon="' +
          escapeHtml(item.id) + '">' + escapeHtml(item.title) + ' →</button>').join("") + '</div></section>'
      : '';
    const additionalEmnes = Array.isArray(theory.related_emne_links)
      ? theory.related_emne_links.filter((item) => item?.emne_id && item.title && item.why && item.emne_id !== theory.emne_id)
      : [];
    const extraEmneHtml = additionalEmnes.length
      ? '<div class="psychology-room-theory-related-emner"><h5>Også relevant for</h5>' +
        additionalEmnes.map((item) => '<p><a class="psychology-room-fagverk-link" href="' +
          escapeHtml(theoryEmneLink(item.emne_id)) + '">' + escapeHtml(item.title) +
          ' ↗</a><span> ' + escapeHtml(item.why) + '</span></p>').join("") + '</div>'
      : '';
    const references = Array.isArray(theory.reference_links) ? theory.reference_links.filter((item) =>
      item && /^https:\/\/[^\s"'<>]+$/.test(String(item.url || "")) && item.title && item.supports) : [];
    const featuredUrls = Array.isArray(reading.featured_reference_urls)
      ? reading.featured_reference_urls : [];
    const featured = featuredUrls.length
      ? featuredUrls.map((url) => references.find((item) => item.url === url)).filter(Boolean)
      : references;
    const preferred = featuredUrls.length ? featured.slice(0, 4) : references;
    const remaining = featuredUrls.length
      ? references.filter((item) => !preferred.some((selected) => selected.url === item.url))
      : [];
    const referenceItems = (items) => '<ul class="psychology-room-theory-references">' +
      items.map((item) => '<li><a href="' + escapeHtml(item.url) +
        '" target="_blank" rel="noopener noreferrer">' + escapeHtml(item.title) +
        ' ↗</a><span>' + escapeHtml(item.supports) + '</span></li>').join("") + '</ul>';
    const sourcesHtml = references.length
      ? '<section class="psychology-room-theory-source"><h4>Kilder og videre lesning</h4>' +
        '<p>Kildene viser den historiske bakgrunnen og forskningen bak kortet. For fordypning, se psykologifagverket.</p>' +
        referenceItems(preferred) +
        (remaining.length ? '<details><summary>Vis flere kilder (' + remaining.length +
          ')</summary>' + referenceItems(remaining) + '</details>' : '') +
        '</section>'
      : '';
    setContent(shell(backButton("theories") + '<article class="psychology-room-detail psychology-room-theory-detail">' +
      '<div class="psychology-room-kicker">Psykoteori · ' + escapeHtml(chapter?.title || "Psykologi") + '</div>' +
      '<h3>' + escapeHtml(theory.title) + '</h3><p class="psychology-room-muted">' +
      escapeHtml(theory.founders || "") + ' · ' + escapeHtml(reading.period || theory.period || "") + '</p>' +
      information + comparisonHtml + phenomenaHtml + sourcesHtml +
      '<section class="psychology-room-theory-source"><h4>Fordypning i psykologifagverket</h4>' +
      '<p>Kortet er en innføring. Les hele fagkapittelet for forskning, historikk og kildegrunnlag.</p>' +
      '<div class="psychology-room-theory-links"><a class="psychology-room-fagverk-link" href="' +
      escapeHtml(theoryChapterLink(theory.chapter_id)) + '">Les ' + escapeHtml(chapter?.title || "kapittelet") +
      ' ↗</a><a class="psychology-room-fagverk-link" href="' + escapeHtml(theoryEmneLink(theory.emne_id)) +
      '">Åpne tilknyttet fagverksemne ↗</a></div>' + extraEmneHtml + '</section>' +
      (dataCache?.theorySafetyNote ? '<p class="psychology-room-safety-note">' + escapeHtml(dataCache.theorySafetyNote) + '</p>' : '') +
      '</article>'));
    bindBack();
    document.querySelector("[data-theory-compare]")?.addEventListener("click", () => {
      if (comparison) renderTheoryDetail(comparison);
    });
    document.querySelectorAll("[data-theory-phenomenon]").forEach((button) => {
      button.addEventListener("click", () => {
        const phenomenon = findById(dataCache?.phenomena || [], button.dataset.theoryPhenomenon);
        if (phenomenon) renderPhenomenonDetail(phenomenon, { type: "theory", theoryId: theory.id });
      });
    });
  }

  function renderTheoryCrossLinks(phenomenon) {
    const theories = (dataCache?.theories || []).filter((item) =>
      Array.isArray(item.related_phenomena) && item.related_phenomena.includes(phenomenon.id));
    if (!theories.length) return "";
    return '<section class="psychology-room-section"><h4>Teoretisk bakgrunn</h4><div class="psychology-room-theory-links">' +
      theories.map((item) => '<button type="button" class="psychology-room-mini-action" data-phenomenon-theory="' +
        escapeHtml(item.id) + '">' + escapeHtml(item.title) + ' →</button>').join("") + '</div></section>';
  }

  function renderHome() {
    setActiveSection("home");
    const profile = getProfile();
    const pathProgress = readPathProgress();
    const activePaths = Object.values(pathProgress).filter((item) => item && !item.completed_at).length;
    const sessions = readJson(STORAGE_KEYS.sessions, []);
    const recent = Array.isArray(sessions) ? sessions[sessions.length - 1] : null;
    const suggested = [
      "unngaelsesforsterkning", "ruminasjon", "bekreftelsesbias"
    ].map((id) => findById(dataCache?.phenomena || [], id)).filter(Boolean);

    setContent(shell(`
      <section class="psychology-room-hero">
        <div class="psychology-room-eyebrow"><span class="psychology-room-spark" aria-hidden="true"></span> DIN ARBEIDSFLATE</div>
        <h3>Hva vil du forstå<br><em>i dag?</em></h3>
        <p>Begynn med en konkret situasjon. Undersøk et mønster, prøv en øvelse og finn forskningen bak.</p>
        <div class="psychology-room-hero-actions">
          <button class="psychology-room-hero-primary" type="button" data-psych-action="workbench">Åpne tankeverkstedet <span aria-hidden="true">↗</span></button>
          <button class="psychology-room-hero-secondary" type="button" data-psych-action="tests">Ta en frivillig innsjekk <span aria-hidden="true">→</span></button>
        </div>
      </section>
      <section class="psychology-room-section psychology-room-journey">
        <div class="psychology-room-section-heading">
          <div><div class="psychology-room-eyebrow">ET SAMMENHENGENDE LØP</div><h3>Fra opplevelse til innsikt</h3></div>
          <span class="psychology-room-section-count">01 — 04</span>
        </div>
        <div class="psychology-room-journey-grid">
          <div class="psychology-room-journey-item"><span class="psychology-room-journey-index">01</span><strong>Observer</strong><p>Beskriv hendelsen, tankene, følelsene, kroppen og handlingen.</p><button type="button" data-psych-action="workbench">Åpne tankeverkstedet →</button></div>
          <div class="psychology-room-journey-item"><span class="psychology-room-journey-index">02</span><strong>Forstå</strong><p>Finn et fenomen som kan belyse situasjonen.</p><button type="button" data-psych-action="phenomena">Utforsk fenomener →</button></div>
          <div class="psychology-room-journey-item"><span class="psychology-room-journey-index">03</span><strong>Prøv</strong><p>Bruk et konkret verktøy eller en øvelse.</p><button type="button" data-psych-action="tools">Åpne verktøy →</button></div>
          <div class="psychology-room-journey-item"><span class="psychology-room-journey-index">04</span><strong>Lær</strong><p>Se hvordan forskere har undersøkt fenomenet.</p><button type="button" data-psych-action="theories">Utforsk Psykoteori →</button></div>
        </div>
      </section>
      <section class="psychology-room-section psychology-room-featured">
        <div class="psychology-room-section-heading"><div><div class="psychology-room-eyebrow">UTFORSK ET MØNSTER</div><h3>Et sted å begynne</h3></div></div>
        <div class="psychology-room-featured-grid">
          ${suggested.map((item, index) => `<button class="psychology-room-featured-card" type="button" data-psych-focus="${escapeHtml(item.id)}">
            <span class="psychology-room-featured-number">0${index + 1}</span><strong>${escapeHtml(item.title)}</strong><span>${escapeHtml(item.short || "")}</span>
            <span class="psychology-room-featured-arrow" aria-hidden="true">↗</span>
          </button>`).join("")}
        </div>
      </section>
      <section class="psychology-room-section psychology-room-continue">
        <div class="psychology-room-continue-copy">
          <div class="psychology-room-eyebrow">DIN EGEN OVERSIKT</div>
          <h3>${recent ? "Fortsett der du slapp" : "Ta vare på det du lærer"}</h3>
          <p>${recent ? "Siste aktivitet: " + escapeHtml(recent.title || "Refleksjon") : "Refleksjoner og øvelser samles i din egen oversikt."}</p>
          <div class="psychology-room-meta-row"><span>${profile.completed_sessions} økter</span><span>${activePaths} aktive løp</span></div>
        </div>
        <button type="button" class="psychology-room-continue-button" data-psych-action="profile">Min side →</button>
      </section>
      <section class="psychology-room-utility-row">
        <button type="button" data-psych-action="journal">Fri refleksjon <span aria-hidden="true">↗</span></button>
        <button type="button" data-psych-action="paths">7-dagersløp <span aria-hidden="true">↗</span></button>
      </section>
      <p class="psychology-room-safety-inline">Refleksjon og faglig informasjon – ikke diagnostikk eller behandling.</p>
    `));

    document.querySelectorAll("[data-psych-action='workbench']").forEach((button) => button.addEventListener("click", renderWorkbench));
    document.querySelector("[data-psych-action='tests']")?.addEventListener("click", renderTestList);
    document.querySelector("[data-psych-action='exercises']")?.addEventListener("click", renderExerciseList);
    document.querySelector("[data-psych-action='phenomena']")?.addEventListener("click", () => renderPhenomenaList());
    document.querySelector("[data-psych-action='theories']")?.addEventListener("click", renderTheoryList);
    document.querySelector("[data-psych-action='tools']")?.addEventListener("click", renderToolsList);
    document.querySelector("[data-psych-action='paths']")?.addEventListener("click", renderPathsList);
    document.querySelector("[data-psych-action='journal']")?.addEventListener("click", renderJournal);
    document.querySelector("[data-psych-action='profile']")?.addEventListener("click", renderProfile);
    document.querySelectorAll("[data-psych-focus]").forEach((button) => {
      button.addEventListener("click", () => {
        const item = findById(dataCache?.phenomena || [], button.dataset.psychFocus);
        if (item) renderPhenomenonDetail(item);
      });
    });
  }

  function renderTestList() {
    setActiveSection("home");
    const tests = dataCache?.tests || [];
    setContent(shell(`${backButton()}<section class="psychology-room-list">${tests.map(test => `<button class="psychology-room-list-item psychology-room-card" type="button" data-test-id="${escapeHtml(test.id)}"><strong>${escapeHtml(test.title)}</strong><span>${escapeHtml(test.description)}</span></button>`).join("") || `<p class="psychology-room-muted">Ingen tester funnet.</p>`}</section>`));
    bindBack();
    document.querySelectorAll("[data-test-id]").forEach((/** @type {HTMLElement} */ button) => {
      button.addEventListener("click", () => {
        const test = tests.find(item => item.id === button.dataset.testId);
        if (test) renderTest(test);
      });
    });
  }

  function renderTest(test) {
    setActiveSection("home");
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
    setActiveSection("home");
    const exercise = (dataCache?.exercises || []).find((item) => item.id === result.recommended_exercise_id);
    const highGuidance = Number(result.top_score) >= 70;
    const followUpText = getFollowUpText();
    const terms = getScreeningTerms();
    setContent(shell(`${backButton()}<section class="psychology-room-result"><h3>${escapeHtml(test.title)}</h3><p class="psychology-room-kicker">${escapeHtml(result.result_title)}</p><p>${escapeHtml(result.result_text)}</p>${terms.length ? `<p class="psychology-room-muted"><strong>Faglige nøkkelord:</strong> ${escapeHtml(terms.join(", "))}</p>` : ""}<p class="psychology-room-guidance">Dette er screening og selvinnsikt, ikke en endelig klinisk vurdering.</p>${highGuidance && followUpText ? `<p class="psychology-room-guidance">${escapeHtml(followUpText)}</p>` : ""}<section class="psychology-room-section"><h4>Dimensjonsscorer</h4>${Object.entries(result.dimensions || {}).map(([dim, score]) => `<div class="psychology-room-score"><span>${escapeHtml(dim)}</span><strong>${escapeHtml(score)}</strong></div>`).join("")}</section>${exercise ? `<button class="psychology-room-primary" type="button" data-open-exercise="${escapeHtml(exercise.id)}">Anbefalt øvelse: ${escapeHtml(exercise.title)}</button>` : ""}</section>`));
    bindBack();
    document.querySelector("[data-open-exercise]")?.addEventListener("click", () => { if (exercise) renderExercise(exercise); });
  }

  function renderExerciseList() {
    setActiveSection("practice");
    const exercises = dataCache?.exercises || [];
    setContent(shell(`${backButton()}<section class="psychology-room-list">${exercises.map(exercise => `<button class="psychology-room-list-item psychology-room-card" type="button" data-exercise-id="${escapeHtml(exercise.id)}"><strong>${escapeHtml(exercise.title)}</strong><span>${escapeHtml(exercise.description)}</span></button>`).join("") || `<p class="psychology-room-muted">Ingen øvelser funnet.</p>`}</section>`));
    bindBack();
    document.querySelectorAll("[data-exercise-id]").forEach((/** @type {HTMLElement} */ button) => {
      button.addEventListener("click", () => {
        const exercise = exercises.find(item => item.id === button.dataset.exerciseId);
        if (exercise) renderExercise(exercise);
      });
    });
  }

  function renderExercise(exercise, context = null) {
    setActiveSection("practice");
    const isPathContext = context?.type === "path";
    const path = isPathContext ? findById(dataCache?.paths || [], context.pathId) : null;
    const contextText = path ? `Denne øvelsen hører til: ${path.title} – dag ${Number(context.dayNumber || 1)}` : "";
    const back = path ? pathBackButton(path.id) : context?.type === "phenomenon" ? backButton("phenomenon:" + context.phenomenonId) : backButton();
    setContent(shell(`${back}<form id="psychologyRoomExerciseForm" class="psychology-room-form"><h3>${escapeHtml(exercise.title)}</h3>${contextText ? `<p class="psychology-room-path-context">${escapeHtml(contextText)}</p>` : ""}<p class="psychology-room-muted">${escapeHtml(exercise.description)}</p><ol class="psychology-room-steps">${(exercise.steps || []).map(step => `<li>${escapeHtml(step.text)}</li>`).join("")}</ol><label class="psychology-room-textarea-label">Kort refleksjon<textarea name="reflection" rows="5" required></textarea></label><button class="psychology-room-primary" type="submit">Lagre øvelse</button></form>`));
    bindBack();
    document.getElementById("psychologyRoomExerciseForm")?.addEventListener("submit", event => {
      event.preventDefault();
      const reflection = String(/** @type {any} */ (event.currentTarget).elements.reflection?.value || "").trim();
      completeSession("exercise", exercise.id, exercise.title, Number(exercise.reward?.insight_points || 5), reflection, null, { returnPathId: path?.id || null, returnPhenomenonId: context?.type === "phenomenon" ? context.phenomenonId : null });
    });
  }

  function renderPhenomenaList(fromWorkbench = false) {
    fromWorkbench = fromWorkbench === true;
    setActiveSection("phenomena");
    const phenomena = dataCache?.phenomena || [];
    const workbenchNotice = fromWorkbench ? '<div class="psychology-room-workbench-next"><span>TRINN 02 / FORSTÅ</span><strong>Velg selv et fenomen å undersøke</strong><p>Dette er begreper fra psykologien, ikke en automatisk tolkning av refleksjonen din.</p></div>' : "";
    setContent(shell(`${backButton(fromWorkbench ? "workbench" : "home")}${workbenchNotice}<section class="psychology-room-section"><h3>Fenomenleksikon</h3><p class="psychology-room-muted">Psykologiske fenomener og kognitive mønstre som kan hjelpe deg å forstå egne reaksjoner.</p></section><section class="psychology-room-list">${phenomena.map((item) => `<button class="psychology-room-list-item psychology-room-card" type="button" data-phenomenon-id="${escapeHtml(item.id)}"><strong>${escapeHtml(item.title)}</strong><span>${escapeHtml(item.short || "")}</span>${renderTags(item.appears_when)}</button>`).join("") || `<p class="psychology-room-muted">Ingen fenomener funnet.</p>`}</section>`));
    bindBack();
    document.querySelectorAll("[data-phenomenon-id]").forEach((button) => {
      button.addEventListener("click", () => {
        const item = findById(phenomena, button.dataset.phenomenonId);
        if (item) renderPhenomenonDetail(item, fromWorkbench ? { type: "workbench" } : null);
      });
    });
  }

  function renderPhenomenonDetail(item, context = null) {
    setActiveSection("phenomena");
    const path = context?.type === "path" ? findById(dataCache?.paths || [], context.pathId) : null;
    const back = path ? pathBackButton(path.id) : context?.type === "theory" ? backButton("theory:" + context.theoryId) : backButton("phenomena");
    setContent(shell(`${back}<article class="psychology-room-detail psychology-room-phenomenon-detail">
      <div class="psychology-room-kicker">${escapeHtml(item.category || "fenomen")}</div>
      <h3>${escapeHtml(item.title)}</h3>
      ${context?.type === "workbench" ? '<p class="psychology-room-privacy">Du har valgt dette fenomenet selv etter å ha skrevet en refleksjon. Ingen automatisk analyse er gjort.</p>' : ""}
      <p class="psychology-room-lead">${escapeHtml(item.short || "")}</p>
      <p>${escapeHtml(item.description || "")}</p>
      ${renderTags(item.appears_when)}
      ${renderLinkedList("Vanlige tegn", item.common_signs, [])}
      ${renderLinkedList("Spørsmål å undersøke", item.helpful_questions, [])}
      <section class="psychology-room-next"><div class="psychology-room-eyebrow">FRA BEGREP TIL HANDLING</div><h3>Hva vil du gjøre videre?</h3>
      ${renderRelatedActions("Prøv et refleksjonsverktøy", item.related_tools, dataCache?.tools || [], "tool")}
      ${renderRelatedActions("Prøv en kort øvelse", item.related_exercises, dataCache?.exercises || [], "exercise")}
      ${renderRelatedActions("Undersøk en innsjekk", item.related_tests, dataCache?.tests || [], "test")}
      </section>
      ${item.history_go_angle ? `<p class="psychology-room-guidance">${escapeHtml(item.history_go_angle)}</p>` : ""}
      ${renderTheoryCrossLinks(item)}
      ${dataCache?.phenomenaSafetyNote ? `<p class="psychology-room-safety-note">${escapeHtml(dataCache.phenomenaSafetyNote)}</p>` : ""}
      </article>`));
    bindBack();
    document.querySelectorAll("[data-psych-related]").forEach((button) => {
      button.addEventListener("click", () => {
        const kind = button.dataset.psychRelated;
        const id = button.dataset.psychRelatedId;
        if (kind === "tool") {
          const tool = findById(dataCache?.tools || [], id);
          if (tool) renderToolDetail(tool, path ? { type: "path", pathId: path.id } : { type: "phenomenon", phenomenonId: item.id });
        } else if (kind === "exercise") {
          const exercise = findById(dataCache?.exercises || [], id);
          if (exercise) renderExercise(exercise, path ? { type: "path", pathId: path.id } : { type: "phenomenon", phenomenonId: item.id });
        } else if (kind === "test") {
          const test = findById(dataCache?.tests || [], id);
          if (test) renderTest(test);
        }
      });
    });
    document.querySelectorAll("[data-phenomenon-theory]").forEach((button) => {
      button.addEventListener("click", () => {
        const theory = findById(dataCache?.theories || [], button.dataset.phenomenonTheory);
        if (theory) renderTheoryDetail(theory);
      });
    });
  }

  function getToolCompletions(toolId) {
    const sessions = readJson(STORAGE_KEYS.sessions, []);
    return (Array.isArray(sessions) ? sessions : []).filter((entry) => entry && entry.type === "tool" && String(entry.source_id || "") === String(toolId || ""));
  }

  // Builds the stored worksheet text from the player's step and reflection answers.
  // Shared by the interactive form and the programmatic completeTool API.
  function buildToolReflection(tool, stepValues, reflectionValues) {
    const steps = Array.isArray(tool?.steps) ? tool.steps : [];
    const questions = Array.isArray(tool?.reflection_questions) ? tool.reflection_questions : [];
    const stepAnswers = steps
      .map((step, index) => {
        const value = String((Array.isArray(stepValues) ? stepValues[index] : "") || "").trim();
        return value ? `${step.text || step} → ${value}` : "";
      })
      .filter(Boolean);
    const reflectionAnswers = questions
      .map((question, index) => {
        const value = String((Array.isArray(reflectionValues) ? reflectionValues[index] : "") || "").trim();
        return value ? `${question} ${value}` : "";
      })
      .filter(Boolean);
    return [...stepAnswers, ...reflectionAnswers].join("\n").trim();
  }

  // Applies the concrete player effect for finishing a CBT tool: logs the session,
  // adds insight points and (anti-farmed) psychology competence via completeSession.
  function runToolCompletion(tool, combinedReflection, context) {
    const path = context?.type === "path" ? findById(dataCache?.paths || [], context.pathId) : null;
    completeSession("tool", tool.id, tool.title, Number(tool.reward?.insight_points || 0), combinedReflection, null, {
      returnPathId: path?.id || null,
      returnPhenomenonId: context?.type === "phenomenon" ? context.phenomenonId : null
    });
  }

  // Programmatic completion (used by tests / future automation). Returns a result
  // object instead of rendering; the concrete psyche effect still runs.
  function completeTool(toolId, answers = {}) {
    const tool = findById(dataCache?.tools || [], toolId);
    if (!tool) return { completed: false, reason: "unknown_tool" };
    const combined = buildToolReflection(tool, answers.steps, answers.reflections);
    if (!combined) return { completed: false, reason: "empty" };
    runToolCompletion(tool, combined, answers.pathId ? { type: "path", pathId: answers.pathId } : null);
    return { completed: true, tool_id: tool.id, insight_points: Number(tool.reward?.insight_points || 0) };
  }

  function renderToolsList() {
    setActiveSection("practice");
    const tools = dataCache?.tools || [];
    setContent(shell(`${backButton()}<section class="psychology-room-section"><h3>CBT-verktøy</h3><p class="psychology-room-muted">Kognitive og atferdsbaserte verktøy for strukturert selvhjelp. Fyll ut verktøyet steg for steg. Refleksjonene dine blir ikke brukt som psykologiske målinger eller Civication-poeng.</p></section><section class="psychology-room-list">${tools.map((tool) => {
      const done = getToolCompletions(tool.id).length;
      return `<button class="psychology-room-list-item psychology-room-card" type="button" data-tool-id="${escapeHtml(tool.id)}"><strong>${escapeHtml(tool.title)}</strong><span>${escapeHtml(tool.short || "")}</span>${renderTags([label(tool.type), `${Number(tool.duration_minutes || 0)} min`, ...(done ? [`Utfylt ${done}×`] : [])])}</button>`;
    }).join("") || `<p class="psychology-room-muted">Ingen verktøy funnet.</p>`}</section>`));
    bindBack();
    document.querySelectorAll("[data-tool-id]").forEach((/** @type {HTMLElement} */ button) => {
      button.addEventListener("click", () => {
        const tool = findById(tools, button.dataset.toolId);
        if (tool) renderToolDetail(tool);
      });
    });
  }

  function renderToolDetail(tool, context = null) {
    setActiveSection("practice");
    const reward = tool.reward || {};
    const points = Number(reward.insight_points || 0);
    const path = context?.type === "path" ? findById(dataCache?.paths || [], context.pathId) : null;
    const back = path ? pathBackButton(path.id) : context?.type === "phenomenon" ? backButton("phenomenon:" + context.phenomenonId) : backButton("tools");
    const steps = Array.isArray(tool.steps) ? tool.steps : [];
    const questions = Array.isArray(tool.reflection_questions) ? tool.reflection_questions : [];
    const priorCompletions = getToolCompletions(tool.id).length;

    setContent(shell(`${back}<form id="psychologyRoomToolForm" class="psychology-room-form"><div class="psychology-room-kicker">${escapeHtml(label(tool.type || "verktøy"))}</div><h3>${escapeHtml(tool.title)}</h3><p>${escapeHtml(tool.short || "")}</p>${renderTags([`${Number(tool.duration_minutes || 0)} min`, ...(priorCompletions ? [`Utfylt ${priorCompletions}×`] : [])])}${renderLinkedList("Når brukes det", tool.when_to_use, [])}<section class="psychology-room-section"><h4>Fyll ut verktøyet</h4>${steps.map((step, index) => `<label class="psychology-room-textarea-label"><span class="psychology-room-step-number">${index + 1}.</span> ${escapeHtml(step.text || step)}<textarea name="step_${index}" rows="2" placeholder="Ditt svar"></textarea></label>`).join("")}</section>${questions.length ? `<section class="psychology-room-section"><h4>Refleksjonsspørsmål</h4>${questions.map((question, index) => `<label class="psychology-room-textarea-label">${escapeHtml(question)}<textarea name="reflection_${index}" rows="2"></textarea></label>`).join("")}</section>` : ""}${renderLinkedList("Relaterte fenomener", tool.related_phenomena, dataCache?.phenomena || [])}${renderLinkedList("Relaterte øvelser", tool.related_exercises, dataCache?.exercises || [])}<button class="psychology-room-primary" type="submit">Fullfør verktøy${points ? ` (+${escapeHtml(points)} innsikt)` : ""}</button>${dataCache?.toolsSafetyNote ? `<p class="psychology-room-safety-note">${escapeHtml(dataCache.toolsSafetyNote)}</p>` : ""}</form>`));
    bindBack();
    document.getElementById("psychologyRoomToolForm")?.addEventListener("submit", (event) => {
      event.preventDefault();
      const elements = /** @type {any} */ (event.currentTarget).elements;
      const stepValues = steps.map((step, index) => String(elements[`step_${index}`]?.value || ""));
      const reflectionValues = questions.map((question, index) => String(elements[`reflection_${index}`]?.value || ""));
      const combined = buildToolReflection(tool, stepValues, reflectionValues);
      if (!combined) {
        window.showToast?.("Fyll ut minst ett felt før du fullfører verktøyet");
        return;
      }
      runToolCompletion(tool, combined, context);
    });
  }

  function renderPathsList() {
    setActiveSection("practice");
    const paths = dataCache?.paths || [];
    setContent(shell(`${backButton()}<section class="psychology-room-section"><h3>7-dagersløp</h3><p class="psychology-room-muted">Start et kort selvhjelpsløp, fullfør én dag om gangen og få reward først når hele løpet er fullført.</p></section><section class="psychology-room-list">${paths.map((path) => {
      const progress = getPathProgress(path.id);
      const completed = progress?.completed_days?.length || 0;
      const total = Array.isArray(path.days) ? path.days.length : Number(path.duration_days || 7);
      const status = progress?.completed_at ? "Fullført" : progress?.started_at ? `${completed}/${total} dager` : "Ikke startet";
      return `<button class="psychology-room-list-item psychology-room-card" type="button" data-path-id="${escapeHtml(path.id)}"><strong>${escapeHtml(path.title)}</strong><span>${escapeHtml(path.description || "")}</span>${renderTags([`${total} dager`, status, ...(path.focus || [])])}</button>`;
    }).join("") || `<p class="psychology-room-muted">Ingen løp funnet.</p>`}</section>`));
    bindBack();
    document.querySelectorAll("[data-path-id]").forEach((/** @type {HTMLElement} */ button) => {
      button.addEventListener("click", () => {
        const path = findById(paths, button.dataset.pathId);
        if (path) renderPathDetail(path);
      });
    });
  }

  function renderPathDayAction(kind, title, buttonText, datasetName, idValue) {
    const hasItem = Boolean(idValue);
    const dataAttr = hasItem ? ` data-${datasetName}="${escapeHtml(idValue)}"` : " disabled";
    return `<button class="psychology-room-mini-action" type="button"${dataAttr}><strong>${escapeHtml(buttonText)}</strong><span>${escapeHtml(title || "Ikke satt opp for denne dagen")}</span></button>`;
  }

  function renderActivePathDay(path, day, currentDay) {
    if (!day) return "";
    const phenomenon = findById(dataCache?.phenomena || [], day.phenomenon_id);
    const tool = findById(dataCache?.tools || [], day.tool_id);
    const exercise = findById(dataCache?.exercises || [], day.exercise_id);
    const saved = getDayReflection(path.id, currentDay).reflection || "";

    return `<section class="psychology-room-active-day"><div class="psychology-room-kicker">Dagens steg</div><h4>Dag ${escapeHtml(currentDay)}: ${escapeHtml(day.title || "")}</h4>${day.reflection_prompt ? `<p class="psychology-room-guidance">${escapeHtml(day.reflection_prompt)}</p>` : ""}<ul class="psychology-room-link-list"><li>Fenomen: ${escapeHtml(phenomenon?.title || day.phenomenon_id || "Ikke satt")}</li><li>CBT-verktøy: ${escapeHtml(tool?.title || day.tool_id || "Ikke satt")}</li><li>Øvelse: ${escapeHtml(exercise?.title || day.exercise_id || "Ikke satt")}</li></ul><div class="psychology-room-day-actions">${renderPathDayAction("phenomenon", phenomenon?.title || day.phenomenon_id || "", "Les fenomen", "path-phenomenon-id", phenomenon?.id || "")}${renderPathDayAction("tool", tool?.title || day.tool_id || "", "Les CBT-verktøy", "path-tool-id", tool?.id || "")}${renderPathDayAction("exercise", exercise?.title || day.exercise_id || "", "Gjør øvelse", "path-exercise-id", exercise?.id || "")}</div><div class="psychology-room-day-reflection"><label class="psychology-room-textarea-label">Dagens refleksjon<textarea id="psychologyRoomDayReflection" rows="4" placeholder="Hva la du merke til i dag?">${escapeHtml(saved)}</textarea></label><button class="psychology-room-primary" type="button" data-save-day-reflection="${escapeHtml(currentDay)}">Lagre refleksjon</button></div><button class="psychology-room-primary" type="button" data-complete-path-day="${escapeHtml(currentDay)}">Fullfør dag</button></section>`;
  }

  function renderPathDetail(path) {
    setActiveSection("practice");
    if (!path?.id) return renderPathsList();
    const progress = getPathProgress(path.id);
    const days = Array.isArray(path.days) ? path.days : [];
    const completedDays = new Set(progress?.completed_days || []);
    const total = days.length || Number(path.duration_days || 7);
    const currentDay = progress?.current_day || 1;
    const isStarted = Boolean(progress?.started_at);
    const isCompleted = Boolean(progress?.completed_at);
    const reward = path.completion_reward || {};
    const activeDay = days.find((day) => Number(day.day || 0) === Number(currentDay)) || days[Math.max(0, Number(currentDay) - 1)] || null;
    const activeDayHtml = isStarted && !isCompleted ? renderActivePathDay(path, activeDay, currentDay) : "";

    setContent(shell(`${backButton("paths")}<article class="psychology-room-detail"><div class="psychology-room-kicker">7-dagersløp</div><h3>${escapeHtml(path.title)}</h3><p>${escapeHtml(path.description || "")}</p>${renderTags([`${total} dager`, ...(path.focus || [])])}<section class="psychology-room-section"><h4>Status</h4><div class="psychology-room-score"><span>Progresjon</span><strong>${escapeHtml(completedDays.size)}/${escapeHtml(total)}</strong></div>${isCompleted ? `<p class="psychology-room-guidance">Løpet er fullført.</p>` : isStarted ? `<p class="psychology-room-guidance">Dagens steg: dag ${escapeHtml(currentDay)}.</p>` : `<p class="psychology-room-muted">Dette løpet er ikke startet ennå.</p>`}${reward.insight_points ? `<p class="psychology-room-muted">Fullføring: ${escapeHtml(reward.insight_points)} innsiktspoeng${reward.badge_hint ? ` · ${escapeHtml(reward.badge_hint)}` : ""}</p>` : ""}</section>${!isStarted ? `<button class="psychology-room-primary" type="button" data-start-path="${escapeHtml(path.id)}">Start løp</button>` : ""}${activeDayHtml}<section class="psychology-room-section"><h4>Dag for dag</h4>${days.length ? days.map((day) => {
      const dayNo = Number(day.day || 0);
      const done = completedDays.has(dayNo);
      const isToday = dayNo === Number(currentDay) && isStarted && !isCompleted;
      return `<article class="psychology-room-day${done ? " is-done" : ""}${isToday ? " is-active" : ""}"><div class="psychology-room-day-head"><strong>Dag ${escapeHtml(dayNo)}: ${escapeHtml(day.title || "")}</strong><span>${done ? "Fullført" : isToday ? "Dagens steg" : ""}</span></div><p>${escapeHtml(day.reflection_prompt || "")}</p><ul class="psychology-room-link-list"><li>Fenomen: ${escapeHtml(titleFor(dataCache?.phenomena || [], day.phenomenon_id) || "Ikke satt")}</li><li>Verktøy: ${escapeHtml(titleFor(dataCache?.tools || [], day.tool_id) || "Ikke satt")}</li><li>Øvelse: ${escapeHtml(titleFor(dataCache?.exercises || [], day.exercise_id) || "Ikke satt")}</li></ul></article>`;
    }).join("") : `<p class="psychology-room-muted">Ingen dager er satt opp for dette løpet.</p>`}</section>${dataCache?.pathsSafetyNote ? `<p class="psychology-room-safety-note">${escapeHtml(dataCache.pathsSafetyNote)}</p>` : ""}</article>`));

    bindBack();
    document.querySelector("[data-start-path]")?.addEventListener("click", () => startPath(path));
    document.querySelector("[data-save-day-reflection]")?.addEventListener("click", () => {
      const dayNo = Number(/** @type {HTMLElement|null} */ (document.querySelector("[data-save-day-reflection]"))?.dataset.saveDayReflection || currentDay);
      const reflection = String(/** @type {HTMLTextAreaElement|null} */ (document.getElementById("psychologyRoomDayReflection"))?.value || "").trim();
      saveDayReflection(path.id, dayNo, reflection);
      window.showToast?.("Dag-refleksjon lagret");
      renderPathDetail(path);
    });
    document.querySelectorAll("[data-complete-path-day]").forEach((/** @type {HTMLElement} */ button) => {
      button.addEventListener("click", () => {
        const reflection = String(/** @type {HTMLTextAreaElement|null} */ (document.getElementById("psychologyRoomDayReflection"))?.value || "").trim();
        completePathDay(path, Number(button.dataset.completePathDay), reflection);
      });
    });
    document.querySelector("[data-path-phenomenon-id]")?.addEventListener("click", (event) => {
      const item = findById(dataCache?.phenomena || [], /** @type {HTMLElement} */ (event.currentTarget).dataset.pathPhenomenonId);
      if (item) renderPhenomenonDetail(item, { type: "path", pathId: path.id });
    });
    document.querySelector("[data-path-tool-id]")?.addEventListener("click", (event) => {
      const tool = findById(dataCache?.tools || [], /** @type {HTMLElement} */ (event.currentTarget).dataset.pathToolId);
      if (tool) renderToolDetail(tool, { type: "path", pathId: path.id });
    });
    document.querySelector("[data-path-exercise-id]")?.addEventListener("click", (event) => {
      const exercise = findById(dataCache?.exercises || [], /** @type {HTMLElement} */ (event.currentTarget).dataset.pathExerciseId);
      if (exercise) renderExercise(exercise, { type: "path", pathId: path.id, dayNumber: currentDay });
    });
  }

  function renderJournal() {
    setActiveSection("home");
    setContent(shell(`${backButton()}<form id="psychologyRoomJournalForm" class="psychology-room-form"><h3>Refleksjonsrom</h3><label class="psychology-room-textarea-label">Hva legger du merke til i deg selv akkurat nå?<textarea name="reflection" rows="6" required></textarea></label><button class="psychology-room-primary" type="submit">Lagre refleksjon</button></form>`));
    bindBack();
    document.getElementById("psychologyRoomJournalForm")?.addEventListener("submit", event => {
      event.preventDefault();
      const reflection = String(/** @type {any} */ (event.currentTarget).elements.reflection?.value || "").trim();
      completeSession("journal", "reflection_room", "Refleksjonsrom", 4, reflection);
    });
  }

  function renderJourneyNext(phenomenon, completedTitle) {
    setActiveSection("practice");
    const related = (dataCache?.theories || []).filter((theory) =>
      Array.isArray(theory.related_phenomena) && theory.related_phenomena.includes(phenomenon.id));
    setContent(shell(`${backButton("phenomenon:" + phenomenon.id)}
      <section class="psychology-room-journey-finish">
        <div class="psychology-room-eyebrow">TRINN 03 AVSLUTTET / VIDERE TIL KUNNSKAP</div>
        <h3>Du har gjennomført en øvelse</h3>
        <p>«${escapeHtml(completedTitle)}» er lagret i Psykologrommet. Det gir ingen vurdering av deg eller din psykiske helse.</p>
        <div class="psychology-room-journey-context"><span>Fenomenet du valgte</span><strong>${escapeHtml(phenomenon.title)}</strong></div>
        <h4>Trinn 04: Utforsk forskningen</h4>
        <div class="psychology-room-related-grid">
          ${related.map((theory) => '<button type="button" class="psychology-room-related-action" data-psych-next-theory="' +
            escapeHtml(theory.id) + '"><strong>' + escapeHtml(theory.title) + '</strong><span aria-hidden="true">↗</span></button>').join("") ||
            '<button type="button" class="psychology-room-related-action" data-psych-show-theories="1">Se alle teorier <span aria-hidden="true">↗</span></button>'}
        </div>
        <button type="button" class="psychology-room-back" data-psych-next-workbench="1">Undersøk en ny situasjon →</button>
      </section>
    `));
    bindBack();
    document.querySelectorAll("[data-psych-next-theory]").forEach((button) => {
      button.addEventListener("click", () => {
        const theory = findById(dataCache?.theories || [], button.dataset.psychNextTheory);
        if (theory) renderTheoryDetail(theory);
      });
    });
    document.querySelector("[data-psych-show-theories]")?.addEventListener("click", renderTheoryList);
    document.querySelector("[data-psych-next-workbench]")?.addEventListener("click", renderWorkbench);
  }

  function completeSession(type, sourceId, title, points, reflection = "", screeningResult = null, options = null) {
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

    window.showToast?.(`Psykologrommet: refleksjon lagret · +${points} innsikt`);
    if (options?.returnPathId) {
      const path = findById(dataCache?.paths || [], options.returnPathId);
      if (path) {
        renderPathDetail(path);
        return;
      }
    }
    if (options?.returnPhenomenonId) {
      const phenomenon = findById(dataCache?.phenomena || [], options.returnPhenomenonId);
      if (phenomenon) {
        renderJourneyNext(phenomenon, title);
        return;
      }
    }
    if (!screeningResult) renderHome();
  }

  function getLatestPathReflection(pathId, completedDays = []) {
    const pathReflections = readPathReflections()[pathId];
    if (!pathReflections || typeof pathReflections !== "object") return "";
    const preferredDays = Array.isArray(completedDays) ? completedDays.map(Number).filter(Boolean).sort((a, b) => b - a) : [];
    const fallbackDays = Object.keys(pathReflections).map(Number).filter(Boolean).sort((a, b) => b - a);
    const days = preferredDays.length ? preferredDays : fallbackDays;
    const foundDay = days.find((day) => String(pathReflections[String(day)]?.reflection || "").trim());
    return foundDay ? String(pathReflections[String(foundDay)]?.reflection || "").trim() : "";
  }

  function renderProfile() {
    setActiveSection("profile");
    const profile = getProfile();
    const insights = readJson(STORAGE_KEYS.insights, []);
    const screenings = Array.isArray(insights) ? insights.filter((item) => item.type === "screening") : [];
    const pathProgress = readPathProgress();
    const pathEntries = Object.values(pathProgress).filter((item) => item && typeof item === "object");
    const workbenchEntries = getWorkbenchEntries();
    const workbenchHtml = '<section class="psychology-room-section"><div class="psychology-room-section-heading"><h3>Tankeverkstedet mitt</h3></div>' +
      (workbenchEntries.length ? workbenchEntries.slice(-5).reverse().map((item) =>
        '<article class="psychology-room-insight"><strong>' + escapeHtml(item.situation) +
        '</strong>' + (item.next_step ? '<p>Et mulig neste steg: ' + escapeHtml(item.next_step) + '</p>' : '') +
        '</article>').join("") : '<p class="psychology-room-muted">Ingen situasjoner lagret ennå.</p>') +
      '<p class="psychology-room-privacy">Disse notatene lagres bare på denne enheten. De brukes ikke til psykologisk vurdering eller Civication-progresjon.</p>' +
      (workbenchEntries.length ? '<button type="button" class="psychology-room-back" data-psych-clear-workbench="1">Slett lagrede tankeverksted-notater</button>' : '') +
      '</section>';

    setContent(shell(`${backButton()}${workbenchHtml}<section class="psychology-room-profile-card"><div><span>Innsiktspoeng</span><strong>${profile.insight_points}</strong></div><div><span>Økter</span><strong>${profile.completed_sessions}</strong></div><div><span>Lagrede situasjoner</span><strong>${getWorkbenchEntries().length}</strong></div></section><section class="psychology-room-section"><h3>Screeningprofil</h3>${Object.keys(profile.screening || {}).length ? Object.entries(profile.screening).map(([dimension, score]) => `<div class="psychology-room-score"><span>${escapeHtml(dimension)}</span><strong>${escapeHtml(score)}</strong></div>`).join("") : `<p class="psychology-room-muted">Ingen screeningdata lagret ennå.</p>`}</section><section class="psychology-room-section"><h3>7-dagersløp</h3>${pathEntries.length ? pathEntries.map((item) => { const path = findById(dataCache?.paths || [], item.path_id); const total = path?.days?.length || path?.duration_days || 7; const completed = Array.isArray(item.completed_days) ? item.completed_days.map(Number).filter(Boolean) : []; const done = completed.length; const currentDay = Number(item.current_day || 1); const today = (path?.days || []).find((day) => Number(day.day || 0) === currentDay); const latestReflection = getLatestPathReflection(item.path_id, completed); return `<article class="psychology-room-insight"><strong>${escapeHtml(path?.title || item.path_id)} — ${item.completed_at ? "Fullført" : `Pågår: ${done}/${total} dager`}</strong>${!item.completed_at ? `<p>Dagens steg: dag ${escapeHtml(currentDay)}${today?.title ? ` – ${escapeHtml(today.title)}` : ""}</p>` : `<p>Fullført: ${escapeHtml(done)}/${escapeHtml(total)} dager</p>`}<p>Fullførte dager: ${escapeHtml(done)}/${escapeHtml(total)}</p>${latestReflection ? `<p>Siste refleksjon: ${escapeHtml(latestReflection)}</p>` : ""}</article>`; }).join("") : `<p class="psychology-room-muted">Ingen løp startet ennå.</p>`}</section><section class="psychology-room-section"><h3>Siste refleksjoner / screeningresultater</h3>${Array.isArray(insights) && insights.length ? insights.slice(-7).reverse().map(item => `<article class="psychology-room-insight"><strong>${escapeHtml(item.title)}</strong><p>${escapeHtml(item.reflection || item.result_text || "")}</p></article>`).join("") : `<p class="psychology-room-muted">Ingen refleksjoner lagret ennå.</p>`}</section><section class="psychology-room-section"><h3>Siste screening</h3>${screenings.length ? screenings.slice(-3).reverse().map(item => `<article class="psychology-room-insight"><strong>${escapeHtml(item.result_title || item.title)}</strong><p>${escapeHtml(item.result_text || "")}</p></article>`).join("") : `<p class="psychology-room-muted">Ingen screeningresultater lagret ennå.</p>`}</section>`));
    bindBack();
    document.querySelector("[data-psych-clear-workbench]")?.addEventListener("click", () => {
      if (typeof window.confirm !== "function" ||
          !window.confirm("Slette alle lagrede tankeverksted-notater på denne enheten?")) return;
      try {
        localStorage.removeItem(STORAGE_KEYS.workbench);
        window.showToast?.("Tankeverksted-notatene er slettet fra denne enheten");
        renderProfile();
      } catch (err) {
        console.warn("[PsychologyRoom.clearWorkbench]", err);
      }
    });
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
    getToolCompletions,
    getWorkbenchEntries,
    saveWorkbench,
    completeTool,
    storageKeys: STORAGE_KEYS
  };
})();
