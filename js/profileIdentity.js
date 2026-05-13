// ============================================================
// HISTORY GO – USER PROFILE IDENTITY ENGINE
// AHA owns account display name.
// History Go owns local profile preferences: color, nickname, place.
// ============================================================

(function () {
  const PROFILE_KEY = "hg_user_profile_v1";
  const AHA_PROFILE_CACHE_KEY = "aha_profile_cache_v1";
  const LEGACY_NAME_KEY = "user_name";
  const LEGACY_COLOR_KEY = "user_color";
  const DEFAULT_DISPLAY_NAME = "Logg inn med AHA";
  const DEFAULT_COLOR = "#f6c800";
  const COLOR_OPTIONS = ["#f6c800", "#8fd3ff", "#ff8fb3", "#a9f5b5", "#c7a7ff", "#ffb86b"];

  function cleanText(value, fallback = "") {
    const text = String(value || "").trim().replace(/\s+/g, " ");
    return text || fallback;
  }


  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, (char) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    }[char] || char));
  }
  function cleanColor(value) {
    const color = String(value || "").trim();
    return /^#[0-9a-fA-F]{6}$/.test(color) ? color : DEFAULT_COLOR;
  }

  function readJson(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return fallback;
      return JSON.parse(raw) || fallback;
    } catch {
      return fallback;
    }
  }

  function writeJson(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
  }

  function getCachedAhaProfile() {
    const cached = readJson(AHA_PROFILE_CACHE_KEY, {});
    if (cached && typeof cached === "object") return cached;
    return {};
  }

  function getAhaDisplayName() {
    const cached = getCachedAhaProfile();
    return cleanText(cached.display_name || cached.name || "", "");
  }

  function getDisplayName() {
    return getAhaDisplayName() || DEFAULT_DISPLAY_NAME;
  }

  function initialsFromName(name) {
    const parts = cleanText(name, "HG").replace(/#/g, "").split(/\s+/).filter(Boolean);
    if (!parts.length) return "HG";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0] || "H"}${parts[parts.length - 1][0] || "G"}`.toUpperCase();
  }

  function getProfile() {
    const stored = readJson(PROFILE_KEY, {});
    const legacyColor = localStorage.getItem(LEGACY_COLOR_KEY);
    return {
      version: 2,
      aha_display_name: getAhaDisplayName(),
      display_name: getDisplayName(),
      nickname: cleanText(stored.nickname || "", ""),
      place: cleanText(stored.place || "", ""),
      color: cleanColor(stored.color || legacyColor || DEFAULT_COLOR),
      updated_at: stored.updated_at || null
    };
  }

  function persistProfile(next) {
    const current = getProfile();
    const profile = {
      version: 2,
      aha_display_name: current.aha_display_name || "",
      nickname: cleanText(next?.nickname ?? current.nickname, ""),
      place: cleanText(next?.place ?? current.place, ""),
      color: cleanColor(next?.color ?? current.color),
      updated_at: new Date().toISOString()
    };

    writeJson(PROFILE_KEY, profile);
    localStorage.setItem(LEGACY_COLOR_KEY, profile.color);

    // Legacy name key is cache only. AHA remains owner of the name.
    localStorage.setItem(LEGACY_NAME_KEY, profile.aha_display_name || DEFAULT_DISPLAY_NAME);
    return getProfile();
  }

  function applyProfileToDom(profile = getProfile()) {
    const displayName = profile.display_name || getDisplayName();
    document.documentElement.style.setProperty("--hg-user-color", profile.color);
    localStorage.setItem(LEGACY_NAME_KEY, displayName);
    localStorage.setItem(LEGACY_COLOR_KEY, profile.color);

    const miniName = document.getElementById("miniName");
    if (miniName) {
      miniName.textContent = displayName;
      miniName.style.color = profile.color;
    }

    const profileName = document.getElementById("profileName");
    if (profileName) {
      profileName.textContent = displayName;
      profileName.style.color = profile.color;
    }

    const sub = document.querySelector(".profile-sub");
    if (sub) {
      const localBits = [profile.nickname ? `Kallenavn: ${profile.nickname}` : "", profile.place ? `Sted: ${profile.place}` : ""].filter(Boolean);
      sub.textContent = localBits.length
        ? localBits.join(" · ")
        : "Din spillerprofil, kunnskapsreise og samling i ett kompakt dashboard.";
    }

    document.querySelectorAll(".profile-avatar-orb").forEach((el) => {
      el.textContent = initialsFromName(displayName);
      el.style.background = `linear-gradient(135deg, ${profile.color}, rgba(255,255,255,.18))`;
      el.style.boxShadow = `0 0 0 2px ${profile.color}55, 0 18px 50px rgba(0,0,0,.22)`;
    });

    document.querySelectorAll(".profile-pill.gold").forEach((el) => {
      el.style.borderColor = `${profile.color}99`;
      el.style.color = profile.color;
    });
  }

  function injectStyles() {
    if (document.getElementById("hgUserProfileStyle")) return;
    const style = document.createElement("style");
    style.id = "hgUserProfileStyle";
    style.textContent = `
      .hg-profile-editor-backdrop{position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,.58);display:flex;align-items:center;justify-content:center;padding:22px;backdrop-filter:blur(10px)}
      .hg-profile-editor{width:min(520px,100%);border:1px solid rgba(255,255,255,.16);border-radius:28px;background:rgba(15,18,28,.96);box-shadow:0 30px 90px rgba(0,0,0,.45);color:#fff;padding:22px;font-family:inherit}
      .hg-profile-editor h2{margin:0 0 6px;font-size:1.35rem}.hg-profile-editor p{margin:0 0 18px;color:rgba(255,255,255,.72);line-height:1.35}
      .hg-profile-field{display:flex;flex-direction:column;gap:8px;margin:14px 0}.hg-profile-field label{font-weight:700;font-size:.9rem;color:rgba(255,255,255,.84)}
      .hg-profile-field input{width:100%;box-sizing:border-box;border-radius:16px;border:1px solid rgba(255,255,255,.18);background:rgba(255,255,255,.08);color:#fff;padding:13px 14px;font:inherit;outline:none}
      .hg-profile-field input:focus{border-color:var(--hg-user-color,#f6c800);box-shadow:0 0 0 3px color-mix(in srgb,var(--hg-user-color,#f6c800) 24%,transparent)}
      .hg-profile-colors{display:flex;gap:10px;flex-wrap:wrap;margin-top:6px}.hg-profile-color{width:42px;height:42px;border-radius:999px;border:2px solid rgba(255,255,255,.26);cursor:pointer;box-shadow:inset 0 0 0 3px rgba(0,0,0,.18)}
      .hg-profile-color.is-active{border-color:#fff;transform:scale(1.08)}.hg-profile-actions{display:flex;gap:10px;justify-content:flex-end;flex-wrap:wrap;margin-top:20px}
      .hg-profile-actions button{border:0;border-radius:999px;padding:11px 16px;font-weight:800;cursor:pointer}.hg-profile-save{background:var(--hg-user-color,#f6c800);color:#111}.hg-profile-cancel{background:rgba(255,255,255,.12);color:#fff}
      .hg-auth-status{margin-top:10px;padding:10px 12px;border-radius:14px;background:rgba(255,255,255,.07);color:rgba(255,255,255,.82);font-size:.92rem;line-height:1.35}
      .hg-auth-status.is-ok{background:rgba(130,255,170,.12);color:#d7ffe0}.hg-auth-status.is-error{background:rgba(255,100,100,.13);color:#ffd6d6}
      #loginAhaBtn[data-signed-in="true"]{border-color:rgba(130,255,170,.55);color:#d7ffe0}
    `;
    document.head.appendChild(style);
  }

  function closeEditor() {
    document.getElementById("hgProfileEditorBackdrop")?.remove();
  }

  function closeLoginPopup() {
    document.getElementById("hgAhaLoginBackdrop")?.remove();
  }

  function openEditor() {
    injectStyles();
    closeEditor();
    const profile = getProfile();
    let selectedColor = profile.color;

    const backdrop = document.createElement("div");
    backdrop.id = "hgProfileEditorBackdrop";
    backdrop.className = "hg-profile-editor-backdrop";
    backdrop.innerHTML = `
      <div class="hg-profile-editor" role="dialog" aria-modal="true" aria-labelledby="hgProfileEditorTitle">
        <h2 id="hgProfileEditorTitle">Endre History Go-profil</h2>
        <p>Navnet hentes fra AHA. Her endrer du bare lokale History Go-valg.</p>
        <div class="hg-profile-field">
          <label for="hgProfileNicknameInput">Kallenavn i History Go</label>
          <input id="hgProfileNicknameInput" type="text" maxlength="40" placeholder="Valgfritt kallenavn" value="">
        </div>
        <div class="hg-profile-field">
          <label for="hgProfilePlaceInput">Sted / hjemsted</label>
          <input id="hgProfilePlaceInput" type="text" maxlength="60" placeholder="Valgfritt sted" value="">
        </div>
        <div class="hg-profile-field">
          <label>Profilfarge</label>
          <div class="hg-profile-colors" id="hgProfileColorOptions"></div>
        </div>
        <div class="hg-profile-actions">
          <button class="hg-profile-cancel" type="button" id="hgProfileCancel">Avbryt</button>
          <button class="hg-profile-save" type="button" id="hgProfileSave">Lagre</button>
        </div>
      </div>
    `;

    document.body.appendChild(backdrop);
    const nicknameInput = document.getElementById("hgProfileNicknameInput");
    const placeInput = document.getElementById("hgProfilePlaceInput");
    nicknameInput.value = profile.nickname || "";
    placeInput.value = profile.place || "";
    nicknameInput.focus();

    const colors = document.getElementById("hgProfileColorOptions");
    colors.innerHTML = COLOR_OPTIONS.map((color) => `
      <button type="button" class="hg-profile-color${color === selectedColor ? " is-active" : ""}" data-color="${color}" style="background:${color}" aria-label="Velg ${color}"></button>
    `).join("");

    colors.querySelectorAll(".hg-profile-color").forEach((btn) => {
      btn.addEventListener("click", () => {
        selectedColor = btn.dataset.color;
        colors.querySelectorAll(".hg-profile-color").forEach((b) => b.classList.toggle("is-active", b === btn));
      });
    });

    document.getElementById("hgProfileCancel")?.addEventListener("click", closeEditor);
    backdrop.addEventListener("click", (event) => {
      if (event.target === backdrop) closeEditor();
    });

    document.getElementById("hgProfileSave")?.addEventListener("click", () => {
      const saved = persistProfile({ nickname: nicknameInput.value, place: placeInput.value, color: selectedColor });
      applyProfileToDom(saved);
      closeEditor();
      window.dispatchEvent(new CustomEvent("hg:user-profile-updated", { detail: saved }));
      window.dispatchEvent(new Event("updateProfile"));
      if (typeof window.syncHistoryGoToAHA === "function") window.syncHistoryGoToAHA();
      window.showToast?.("Profilvalg oppdatert");
    });
  }

  function getHistoryGoRedirectUrl() {
    const path = window.location.pathname.includes("/History-Go/")
      ? window.location.pathname
      : "/History-Go/profile.html";
    return `${window.location.origin}${path}`;
  }

  async function refreshAhaProfileCache() {
    const loader = window.HistoryGoAHAAuth?.loadAhaProfile;
    if (typeof loader !== "function") return null;
    const result = await loader();
    if (result?.ok && result.data) {
      writeJson(AHA_PROFILE_CACHE_KEY, result.data);
      persistProfile({});
      applyProfileToDom();
      return result.data;
    }
    if (result?.reason === "no_aha_profile") {
      writeJson(AHA_PROFILE_CACHE_KEY, {});
      applyProfileToDom();
    }
    return null;
  }

  async function refreshLoginButton() {
    const btn = document.getElementById("loginAhaBtn");
    if (!btn) return;
    try {
      const state = await window.HistoryGoAHAAuth?.refresh?.();
      if (state?.signed_in) {
        const ahaProfile = await refreshAhaProfileCache();
        btn.textContent = ahaProfile?.display_name ? "Innlogget" : "Opprett AHA-profil";
        btn.dataset.signedIn = ahaProfile?.display_name ? "true" : "missing-profile";
        btn.title = ahaProfile?.display_name
          ? `Innlogget med AHA: ${ahaProfile.display_name}`
          : "Du er innlogget, men må opprette navn/profil i AHA først.";
      } else {
        btn.textContent = "Logg inn";
        btn.dataset.signedIn = "false";
        btn.title = "Logg inn med AHA";
        writeJson(AHA_PROFILE_CACHE_KEY, {});
        applyProfileToDom();
      }
    } catch {
      btn.textContent = "Logg inn";
      btn.dataset.signedIn = "false";
    }
  }

  function setAuthStatus(message, type = "") {
    const el = document.getElementById("hgAhaLoginStatus");
    if (!el) return;
    el.className = `hg-auth-status${type ? ` is-${type}` : ""}`;
    el.textContent = message;
  }

  async function sendMagicLink(email) {
    const cleanEmail = String(email || "").trim();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      setAuthStatus("Skriv inn en gyldig e-postadresse.", "error");
      return;
    }

    const client = await window.HistoryGoAHAAuth?.getClient?.();
    if (!client?.auth?.signInWithOtp) {
      setAuthStatus("AHA-login er ikke klar ennå. Prøv å åpne AHA direkte.", "error");
      return;
    }

    setAuthStatus("Sender innloggingslenke …");

    const { error } = await client.auth.signInWithOtp({
      email: cleanEmail,
      options: {
        emailRedirectTo: getHistoryGoRedirectUrl(),
        shouldCreateUser: true
      }
    });

    if (error) {
      setAuthStatus(error.message || "Kunne ikke sende innloggingslenke.", "error");
      return;
    }

    setAuthStatus("Innloggingslenke sendt. Åpne e-posten på samme enhet, trykk lenken, og kom tilbake hit.", "ok");
  }

  async function openLoginPopup() {
    injectStyles();
    closeLoginPopup();

    const session = await window.HistoryGoAHAAuth?.getSession?.();
    const email = session?.user?.email || "";
    const ahaName = getAhaDisplayName();
    const safeEmail = escapeHtml(email);
    const safeAhaName = escapeHtml(ahaName);

    const backdrop = document.createElement("div");
    backdrop.id = "hgAhaLoginBackdrop";
    backdrop.className = "hg-profile-editor-backdrop";
    backdrop.innerHTML = `
      <div class="hg-profile-editor" role="dialog" aria-modal="true" aria-labelledby="hgAhaLoginTitle">
        <h2 id="hgAhaLoginTitle">Logg inn med AHA</h2>
        <p>AHA er kontoen og hovedprofilen din. Navn opprettes og endres i AHA.</p>
        <div class="hg-profile-field">
          <label for="hgAhaEmailInput">E-post</label>
          <input id="hgAhaEmailInput" type="email" inputmode="email" autocomplete="email" placeholder="navn@eksempel.no" value="${safeEmail}">
        </div>
        <div id="hgAhaLoginStatus" class="hg-auth-status">${session?.user?.id ? (ahaName ? `Innlogget som ${safeAhaName}.` : "Du er innlogget. Opprett navn/profil i AHA først.") : "Skriv inn e-post for å få innloggingslenke."}</div>
        <div class="hg-profile-actions">
          <button class="hg-profile-cancel" type="button" id="hgAhaLoginCancel">Lukk</button>
          <button class="hg-profile-cancel" type="button" id="hgAhaOpenAha">Åpne AHA</button>
          <button class="hg-profile-save" type="button" id="hgAhaSendLink">Send lenke</button>
        </div>
      </div>
    `;

    document.body.appendChild(backdrop);
    const input = document.getElementById("hgAhaEmailInput");
    input?.focus();

    document.getElementById("hgAhaLoginCancel")?.addEventListener("click", closeLoginPopup);
    document.getElementById("hgAhaOpenAha")?.addEventListener("click", () => window.HistoryGoAHAAuth?.openAhaLogin?.());
    document.getElementById("hgAhaSendLink")?.addEventListener("click", () => sendMagicLink(input?.value));
    input?.addEventListener("keydown", (event) => {
      if (event.key === "Enter") sendMagicLink(input.value);
    });
    backdrop.addEventListener("click", (event) => {
      if (event.target === backdrop) closeLoginPopup();
    });
  }

  function bindProfileButtons() {
    const btn = document.getElementById("editProfileBtn");
    if (!btn || btn.dataset.hgProfileBound === "true") return;
    btn.dataset.hgProfileBound = "true";
    btn.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      openEditor();
    });
  }

  function bindLoginButton() {
    const editBtn = document.getElementById("editProfileBtn");
    if (!editBtn || document.getElementById("loginAhaBtn")) {
      refreshLoginButton();
      return;
    }

    const btn = document.createElement("button");
    btn.id = "loginAhaBtn";
    btn.className = editBtn.className || "btn";
    btn.type = "button";
    btn.textContent = "Logg inn";
    btn.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      openLoginPopup();
    });

    editBtn.insertAdjacentElement("afterend", btn);
    refreshLoginButton();
  }

  async function init() {
    persistProfile({});
    injectStyles();
    applyProfileToDom();
    bindProfileButtons();
    bindLoginButton();
    await refreshAhaProfileCache();
    applyProfileToDom();
  }

  window.HGUserProfile = {
    getProfile,
    getDisplayName,
    saveProfile: persistProfile,
    applyProfileToDom,
    openEditor,
    openLoginPopup,
    refreshAhaProfileCache,
    refreshLoginButton,
    initialsFromName,
    init
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  window.addEventListener("updateProfile", () => {
    applyProfileToDom();
    refreshLoginButton();
  });
  window.addEventListener("historygo:aha-readback", () => applyProfileToDom());
  window.addEventListener("aha:auth-ready", () => {
    refreshAhaProfileCache().then(() => refreshLoginButton());
  });
})();
