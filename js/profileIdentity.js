// ============================================================
// HISTORY GO – USER PROFILE IDENTITY ENGINE
// Canonical owner for user name + profile color.
// Keeps legacy keys (`user_name`, `user_color`) in sync so older UI code keeps working.
// Adds AHA login button + popup on the profile page.
// ============================================================

(function () {
  const PROFILE_KEY = "hg_user_profile_v1";
  const LEGACY_NAME_KEY = "user_name";
  const LEGACY_COLOR_KEY = "user_color";
  const DEFAULT_NAME = "Utforsker #182";
  const DEFAULT_COLOR = "#f6c800";
  const COLOR_OPTIONS = ["#f6c800", "#8fd3ff", "#ff8fb3", "#a9f5b5", "#c7a7ff", "#ffb86b"];

  function cleanName(value) {
    const name = String(value || "").trim().replace(/\s+/g, " ");
    return name || DEFAULT_NAME;
  }

  function cleanColor(value) {
    const color = String(value || "").trim();
    return /^#[0-9a-fA-F]{6}$/.test(color) ? color : DEFAULT_COLOR;
  }

  function initialsFromName(name) {
    const parts = cleanName(name).replace(/#/g, "").split(/\s+/).filter(Boolean);
    if (!parts.length) return "HG";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0] || "H"}${parts[parts.length - 1][0] || "G"}`.toUpperCase();
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

  function getProfile() {
    const stored = readJson(PROFILE_KEY, {});
    const legacyName = localStorage.getItem(LEGACY_NAME_KEY);
    const legacyColor = localStorage.getItem(LEGACY_COLOR_KEY);
    return {
      version: 1,
      name: cleanName(stored.name || legacyName || DEFAULT_NAME),
      color: cleanColor(stored.color || legacyColor || DEFAULT_COLOR),
      updated_at: stored.updated_at || null
    };
  }

  function persistProfile(next) {
    const current = getProfile();
    const profile = {
      version: 1,
      name: cleanName(next?.name ?? current.name),
      color: cleanColor(next?.color ?? current.color),
      updated_at: new Date().toISOString()
    };

    writeJson(PROFILE_KEY, profile);
    localStorage.setItem(LEGACY_NAME_KEY, profile.name);
    localStorage.setItem(LEGACY_COLOR_KEY, profile.color);
    return profile;
  }

  function applyProfileToDom(profile = getProfile()) {
    document.documentElement.style.setProperty("--hg-user-color", profile.color);

    const miniName = document.getElementById("miniName");
    if (miniName) {
      miniName.textContent = profile.name;
      miniName.style.color = profile.color;
    }

    const profileName = document.getElementById("profileName");
    if (profileName) {
      profileName.textContent = profile.name;
      profileName.style.color = profile.color;
    }

    document.querySelectorAll(".profile-avatar-orb").forEach((el) => {
      el.textContent = initialsFromName(profile.name);
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
        <h2 id="hgProfileEditorTitle">Endre profil</h2>
        <p>Dette styrer navnet og fargen som vises i miniprofilen og på profilsiden.</p>
        <div class="hg-profile-field">
          <label for="hgProfileNameInput">Navn</label>
          <input id="hgProfileNameInput" type="text" maxlength="40" value="">
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
    const input = document.getElementById("hgProfileNameInput");
    input.value = profile.name;
    input.focus();
    input.select();

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
      const saved = persistProfile({ name: input.value, color: selectedColor });
      applyProfileToDom(saved);
      closeEditor();
      window.dispatchEvent(new CustomEvent("hg:user-profile-updated", { detail: saved }));
      window.dispatchEvent(new Event("updateProfile"));
      if (typeof window.syncHistoryGoToAHA === "function") window.syncHistoryGoToAHA();
      window.showToast?.("Profil oppdatert");
    });
  }

  function getHistoryGoRedirectUrl() {
    const path = window.location.pathname.includes("/History-Go/")
      ? window.location.pathname
      : "/History-Go/profile.html";
    return `${window.location.origin}${path}`;
  }

  async function refreshLoginButton() {
    const btn = document.getElementById("loginAhaBtn");
    if (!btn) return;
    try {
      const state = await window.HistoryGoAHAAuth?.refresh?.();
      if (state?.signed_in) {
        btn.textContent = "Innlogget";
        btn.dataset.signedIn = "true";
        btn.title = `Innlogget med AHA${state.email ? `: ${state.email}` : ""}`;
      } else {
        btn.textContent = "Logg inn";
        btn.dataset.signedIn = "false";
        btn.title = "Logg inn med AHA";
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

    const backdrop = document.createElement("div");
    backdrop.id = "hgAhaLoginBackdrop";
    backdrop.className = "hg-profile-editor-backdrop";
    backdrop.innerHTML = `
      <div class="hg-profile-editor" role="dialog" aria-modal="true" aria-labelledby="hgAhaLoginTitle">
        <h2 id="hgAhaLoginTitle">Logg inn med AHA</h2>
        <p>AHA er kontoen og profilen din. Når du er innlogget, kan History Go lagre progresjon på samme bruker.</p>
        <div class="hg-profile-field">
          <label for="hgAhaEmailInput">E-post</label>
          <input id="hgAhaEmailInput" type="email" inputmode="email" autocomplete="email" placeholder="navn@eksempel.no" value="${email}">
        </div>
        <div id="hgAhaLoginStatus" class="hg-auth-status">${session?.user?.id ? "Du er allerede innlogget med AHA." : "Skriv inn e-post for å få innloggingslenke."}</div>
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
    ["editProfileBtn", "editProfileBtnBottom"].forEach((id) => {
      const btn = document.getElementById(id);
      if (!btn || btn.dataset.hgProfileBound === "true") return;
      btn.dataset.hgProfileBound = "true";
      btn.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        openEditor();
      });
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

  function init() {
    persistProfile(getProfile());
    injectStyles();
    applyProfileToDom();
    bindProfileButtons();
    bindLoginButton();
  }

  window.HGUserProfile = {
    getProfile,
    saveProfile: persistProfile,
    applyProfileToDom,
    openEditor,
    openLoginPopup,
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
  window.addEventListener("aha:auth-ready", () => refreshLoginButton());
})();
