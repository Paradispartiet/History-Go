// Lokale talemål i Språkatlaset.
// Utvider eksisterende nasjonalatlas uten å gjøre makroområder til enkeltstående dialekter.
(function installPlaceLanguageLocalVarieties(global) {
  "use strict";

  const INSTALL_FLAG = "__HG_PLACE_LANGUAGE_LOCAL_VARIETIES_V1__";
  const DATA_PATH = "data/leksikon/sprak/norge_local_varieties_v1.json";
  const STYLE_PATH = "css/place-language-local-varieties.css";
  let dataPromise = null;

  const text = value => String(value == null ? "" : value).trim();
  const list = value => Array.isArray(value) ? value : [];
  const esc = value => String(value == null ? "" : value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

  function ensureStyle() {
    if (document.querySelector('link[data-hg-language-local-varieties-style="1"]')) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = STYLE_PATH;
    link.dataset.hgLanguageLocalVarietiesStyle = "1";
    document.head.appendChild(link);
  }

  function loadData() {
    if (dataPromise) return dataPromise;
    dataPromise = fetch(DATA_PATH, { cache: "default" })
      .then(response => response.ok ? response.json() : null)
      .catch(() => null);
    return dataPromise;
  }

  function safeHttpsUrl(value) {
    const raw = text(value);
    if (!raw) return "";
    try {
      const parsed = new URL(raw, global.location?.origin || undefined);
      return parsed.protocol === "https:" ? parsed.href : "";
    } catch {
      return "";
    }
  }

  function profileLinks(profile) {
    const sourceRows = list(profile?.sources).map(source => ({ ...source, mode: "source" }));
    const researchRows = list(profile?.research_leads).map(source => ({ ...source, mode: "research" }));
    return [...sourceRows, ...researchRows]
      .map(source => {
        const url = safeHttpsUrl(source?.url);
        if (!url) return "";
        const prefix = source.mode === "research" ? "Researchkilde" : "Kilde";
        return `<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(prefix)} · ${esc(source?.label || "Språkkilde")} ↗</a>`;
      })
      .filter(Boolean)
      .join("");
  }

  function macroLabel(data, macroId) {
    return text(data?.macro_labels?.[macroId]) || macroId;
  }

  function profileStatus(profile) {
    return profile?.profile_status === "local_research_required"
      ? "Lokal research gjenstår"
      : "Lokalt kildegrunnlag";
  }

  function renderProfileButton(profile) {
    return `
      <button type="button"
              class="hg-language-local-variety"
              data-hg-local-variety="${esc(profile?.id)}"
              data-hg-local-macro="${esc(profile?.macro_region_id)}"
              aria-pressed="false">
        <strong>${esc(profile?.name)}</strong>
        <span>${esc(profileStatus(profile))}</span>
      </button>
    `;
  }

  function renderLocalSection(data) {
    const profiles = list(data?.profiles);
    if (!profiles.length) return "";

    const macroOrder = ["austlandsk", "vestlandsk", "trondersk", "nordnorsk"];
    const groups = macroOrder
      .map(macroId => ({
        macroId,
        rows: profiles.filter(profile => text(profile?.macro_region_id) === macroId)
      }))
      .filter(group => group.rows.length);

    return `
      <section class="hg-language-local-varieties" data-hg-language-local-varieties>
        <header>
          <div class="hg-language-kicker">Lokale talemål</div>
          <strong>Byer og lokale talemålsmiljøer</strong>
          <p>Dette er atlasets konkrete nivå. De store områdene over er bare orientering, ikke én dialekt. En by kan også romme flere samtidige talemålsvarianter.</p>
        </header>
        <div class="hg-language-local-variety-groups">
          ${groups.map(group => `
            <section class="hg-language-local-variety-group" data-hg-local-group="${esc(group.macroId)}">
              <h4>${esc(macroLabel(data, group.macroId))}</h4>
              <div>${group.rows.map(renderProfileButton).join("")}</div>
            </section>
          `).join("")}
        </div>
        <article class="hg-language-local-variety-detail" data-hg-local-variety-detail hidden aria-live="polite">
          <div class="hg-language-kicker">Lokalt talemål</div>
          <h3 data-hg-local-title></h3>
          <span class="hg-language-local-variety-status" data-hg-local-status></span>
          <p data-hg-local-summary></p>
          <p class="hg-language-local-variety-variation" data-hg-local-variation></p>
          <div class="hg-language-local-variety-features" data-hg-local-features hidden></div>
          <div class="hg-language-local-variety-sources" data-hg-local-sources></div>
        </article>
      </section>
    `;
  }

  function showProfile(atlas, section, data, profile) {
    if (!profile) return;

    section.querySelectorAll("[data-hg-local-variety]").forEach(button => {
      button.setAttribute("aria-pressed", text(button.getAttribute("data-hg-local-variety")) === text(profile.id) ? "true" : "false");
    });

    const detail = section.querySelector("[data-hg-local-variety-detail]");
    if (!(detail instanceof HTMLElement)) return;

    const title = detail.querySelector("[data-hg-local-title]");
    const status = detail.querySelector("[data-hg-local-status]");
    const summary = detail.querySelector("[data-hg-local-summary]");
    const variation = detail.querySelector("[data-hg-local-variation]");
    const features = detail.querySelector("[data-hg-local-features]");
    const sources = detail.querySelector("[data-hg-local-sources]");

    if (title) title.textContent = text(profile.name);
    if (status) status.textContent = profileStatus(profile);
    if (summary) summary.textContent = text(profile.summary);
    if (variation) variation.textContent = text(profile.variation_note);

    const featureRows = list(profile.feature_labels).map(text).filter(Boolean);
    if (features instanceof HTMLElement) {
      features.innerHTML = featureRows.map(label => `<span>${esc(label)}</span>`).join("");
      features.hidden = !featureRows.length;
    }
    if (sources) sources.innerHTML = profileLinks(profile);

    detail.hidden = false;

    atlas.querySelectorAll("[data-atlas-macro]").forEach(card => {
      card.classList.toggle("is-local-variety-context", text(card.getAttribute("data-atlas-macro")) === text(profile.macro_region_id));
    });

    detail.scrollIntoView?.({ behavior: "smooth", block: "nearest" });
  }

  function relabelMacroNavigation(atlas, data) {
    atlas.querySelectorAll("[data-atlas-map-region]").forEach(button => {
      const id = text(button.getAttribute("data-atlas-map-region"));
      const label = macroLabel(data, id);
      const strong = button.querySelector("strong");
      if (strong && label) strong.textContent = label;
      if (label) button.setAttribute("aria-label", `${label} – grov orientering`);
    });

    atlas.querySelectorAll("[data-atlas-macro]").forEach(card => {
      const id = text(card.getAttribute("data-atlas-macro"));
      const label = macroLabel(data, id);
      const heading = card.querySelector(":scope > header strong");
      if (heading && label) heading.textContent = label;

      const regions = card.querySelector(".hg-language-atlas-regions");
      if (regions && !card.querySelector("[data-hg-regional-orientation-label]")) {
        const caption = document.createElement("div");
        caption.className = "hg-language-regional-orientation-label";
        caption.dataset.hgRegionalOrientationLabel = "1";
        caption.textContent = "Regionale orienteringssoner";
        regions.before(caption);
      }
    });
  }

  function enhanceAtlas(atlas, data) {
    if (!(atlas instanceof HTMLElement) || atlas.dataset.hgLocalVarieties === "1" || !data) return;
    atlas.dataset.hgLocalVarieties = "1";

    relabelMacroNavigation(atlas, data);

    const head = atlas.querySelector(".hg-language-atlas-head");
    if (head && !head.querySelector("[data-hg-local-atlas-rule]")) {
      const rule = document.createElement("p");
      rule.className = "hg-language-local-atlas-rule";
      rule.dataset.hgLocalAtlasRule = "1";
      rule.innerHTML = "<strong>Viktig:</strong> Østnorsk, vestnorsk, trøndersk og nordnorsk brukes her bare som grove dialektologiske orienteringsområder. De er ikke én dialekt hver.";
      head.appendChild(rule);
    }

    const details = atlas.querySelector(".hg-language-atlas-details");
    if (!details) return;
    const summary = details.querySelector(":scope > summary");
    if (summary) summary.textContent = "Utforsk lokale talemål og regionale soner";

    if (!details.querySelector("[data-hg-language-local-varieties]")) {
      const holder = document.createElement("div");
      holder.innerHTML = renderLocalSection(data).trim();
      const section = holder.firstElementChild;
      const grid = details.querySelector(".hg-language-atlas-grid");
      if (section) details.insertBefore(section, grid || null);
    }

    const section = details.querySelector("[data-hg-language-local-varieties]");
    if (!section || section.dataset.hgLocalBound === "1") return;
    section.dataset.hgLocalBound = "1";
    section.addEventListener("click", event => {
      const target = event.target instanceof Element ? event.target : null;
      const button = target?.closest("[data-hg-local-variety]");
      if (!button) return;
      const id = text(button.getAttribute("data-hg-local-variety"));
      const profile = list(data.profiles).find(row => text(row?.id) === id);
      if (!profile) return;
      details.open = true;
      showProfile(atlas, section, data, profile);
    });
  }

  function scan(data) {
    document.querySelectorAll("[data-language-atlas]").forEach(atlas => enhanceAtlas(atlas, data));
  }

  function install() {
    if (global[INSTALL_FLAG]) return;
    global[INSTALL_FLAG] = true;
    ensureStyle();
    void loadData().then(data => {
      if (!data) return;
      scan(data);
      const observer = new MutationObserver(() => scan(data));
      observer.observe(document.body, { childList: true, subtree: true });
    });
  }

  global.HGLanguageLocalVarieties = {
    load: loadData,
    enhance: atlas => loadData().then(data => enhanceAtlas(atlas, data))
  };

  install();
})(window);
