// Header menu: keeps secondary topbar tools out of the fixed header row while
// preserving the original DOM ids/event hooks for search, map mode and panels.
(function () {
  function ensureLesesporStyles() {
    const existing = document.querySelector('link[data-hg-lesespor-styles="1"], link[href*="css/lesespor.css"]');
    if (existing) return existing;

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = new URL("css/lesespor.css?v=20260721-2", document.baseURI).href;
    link.dataset.hgLesesporStyles = "1";
    link.addEventListener("error", () => {
      console.warn("[Lesespor] Kunne ikke laste css/lesespor.css");
    }, { once: true });
    document.head.appendChild(link);
    return link;
  }

  // Start CSS-innlastingen med en gang scriptet evalueres. Tidligere ble den først
  // startet ved DOMContentLoaded, som gjorde Lesespor avhengig av lastrekkefølge/cache.
  ensureLesesporStyles();

  function promoteMinDayToHeader() {
    const minDayButton = document.getElementById("btnMinDag");
    const geoStatus = document.getElementById("geoStatus");
    if (!minDayButton || !geoStatus || typeof geoStatus.insertAdjacentElement !== "function") return;

    minDayButton.className = "iconbtn header-min-day-button";
    minDayButton.removeAttribute("role");

    const icon = minDayButton.querySelector?.(".header-menu-action-icon");
    if (icon) icon.className = "hg-header-icon";

    minDayButton.querySelector?.(".header-menu-action-label")?.remove();
    geoStatus.insertAdjacentElement("afterend", minDayButton);
  }

  function setLesesporMenuLabel() {
    const button = document.getElementById("btnLesespor");
    const label = button?.querySelector?.(".header-menu-action-label");
    if (label) label.textContent = "Lesespor";
  }

  function ensureKnowledgeMenuEntry() {
    const actions = document.querySelector("#headerMenuPanel .header-menu-actions");
    if (!actions || document.getElementById("btnKnowledge")) return;

    const link = document.createElement("a");
    link.id = "btnKnowledge";
    link.href = "knowledge.html";
    link.className = "header-menu-action";
    link.setAttribute("role", "menuitem");
    link.setAttribute("aria-label", "Knowledge");
    link.title = "Knowledge";

    const icon = document.createElement("span");
    icon.className = "header-menu-action-icon";
    icon.setAttribute("aria-hidden", "true");
    icon.textContent = "💡";

    const label = document.createElement("span");
    label.className = "header-menu-action-label";
    label.textContent = "Knowledge";

    link.append(icon, label);

    const routesButton = document.getElementById("btnKaravane");
    if (routesButton?.parentElement === actions) actions.insertBefore(link, routesButton);
    else actions.appendChild(link);
  }

  function initHeaderMenu() {
    ensureLesesporStyles();
    promoteMinDayToHeader();
    setLesesporMenuLabel();
    ensureKnowledgeMenuEntry();

    const root = document.getElementById("headerMenu");
    const button = document.getElementById("headerMenuButton");
    const panel = document.getElementById("headerMenuPanel");
    if (!root || !button || !panel || button.dataset.hgHeaderMenuBound === "1") return;

    button.dataset.hgHeaderMenuBound = "1";

    function setOpen(open) {
      root.classList.toggle("is-open", open);
      panel.hidden = !open;
      button.setAttribute("aria-expanded", open ? "true" : "false");
      button.setAttribute("aria-label", open ? "Lukk meny" : "Åpne meny");
    }

    const headerMenuApi = {
      open() {
        setOpen(true);
      },
      close() {
        setOpen(false);
      },
      toggle() {
        setOpen(panel.hidden);
      },
      isOpen() {
        return !panel.hidden;
      }
    };
    window.HGHeaderMenu = headerMenuApi;

    button.addEventListener("click", (event) => {
      event.stopPropagation();
      headerMenuApi.toggle();
    });

    panel.addEventListener("click", (event) => {
      event.stopPropagation();
    });

    document.getElementById("btnLesespor")?.addEventListener("click", () => {
      headerMenuApi.close();
    });

    document.addEventListener("click", (event) => {
      if (!root.contains(/** @type {Node} */ (event.target))) headerMenuApi.close();
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") headerMenuApi.close();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initHeaderMenu, { once: true });
  } else {
    initHeaderMenu();
  }
})();