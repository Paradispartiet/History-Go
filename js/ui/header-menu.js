// Header menu: keeps secondary topbar tools out of the fixed header row while
// preserving the original DOM ids/event hooks for search, map mode and panels.
(function () {
  function ensureStylesheet({ selector, href, dataKey }) {
    const existing = document.querySelector(selector);
    if (existing) return existing;

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = new URL(href, document.baseURI).href;
    if (dataKey) link.dataset[dataKey] = "1";
    link.addEventListener("error", () => {
      console.warn(`[HeaderMenu] Kunne ikke laste ${href}`);
    }, { once: true });
    document.head.appendChild(link);
    return link;
  }

  function ensureLesesporStyles() {
    return ensureStylesheet({
      selector: 'link[data-hg-lesespor-styles="1"], link[href*="css/lesespor.css"]',
      href: "css/lesespor.css?v=20260721-2",
      dataKey: "hgLesesporStyles"
    });
  }

  function ensureLearningMenuStyles() {
    return ensureStylesheet({
      selector: 'link[data-hg-header-learning-styles="1"], link[href*="css/header-learning-menu.css"]',
      href: "css/header-learning-menu.css?v=20260728-1",
      dataKey: "hgHeaderLearningStyles"
    });
  }

  // Start CSS-innlastingen med en gang scriptet evalueres. Tidligere ble den først
  // startet ved DOMContentLoaded, som gjorde menyflater avhengige av lastrekkefølge/cache.
  ensureLesesporStyles();
  ensureLearningMenuStyles();

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

  function createLearningLink({ id, href, iconText, labelText, description, modifier }) {
    const link = document.createElement("a");
    link.id = id;
    link.href = new URL(href, document.baseURI).href;
    link.className = `header-menu-action ${modifier}`;
    link.setAttribute("role", "menuitem");
    link.setAttribute("aria-label", `${labelText}: ${description}`);
    link.title = `${labelText} – ${description}`;

    const icon = document.createElement("span");
    icon.className = "header-menu-action-icon";
    icon.setAttribute("aria-hidden", "true");
    icon.textContent = iconText;

    const copy = document.createElement("span");
    copy.className = "header-menu-action-copy";

    const label = document.createElement("span");
    label.className = "header-menu-action-label";
    label.textContent = labelText;

    const sublabel = document.createElement("span");
    sublabel.className = "header-menu-action-description";
    sublabel.textContent = description;

    copy.append(label, sublabel);
    link.append(icon, copy);
    return link;
  }

  function ensureLearningMenuEntries() {
    const actions = document.querySelector("#headerMenuPanel .header-menu-actions");
    if (!actions) return;

    let group = document.getElementById("headerLearningMenuGroup");
    if (!group) {
      group = document.createElement("div");
      group.id = "headerLearningMenuGroup";
      group.className = "header-menu-learning-group";
      group.setAttribute("role", "group");
      group.setAttribute("aria-label", "Læring");

      const heading = document.createElement("p");
      heading.className = "header-menu-section-label";
      heading.textContent = "Læring";
      group.appendChild(heading);

      const routesButton = document.getElementById("btnKaravane");
      if (routesButton?.parentElement === actions) actions.insertBefore(group, routesButton);
      else actions.appendChild(group);
    }

    if (!document.getElementById("btnFagverk")) {
      group.appendChild(createLearningLink({
        id: "btnFagverk",
        href: "fagverk-forside.html",
        iconText: "📖",
        labelText: "Fagverket",
        description: "Velg mellom merkesider og fagsider",
        modifier: "header-menu-action--fagverk"
      }));
    }

    if (!document.getElementById("btnKnowledge")) {
      group.appendChild(createLearningLink({
        id: "btnKnowledge",
        href: "knowledge.html",
        iconText: "💡",
        labelText: "Knowledge",
        description: "Det du har lært, samlet og forstått",
        modifier: "header-menu-action--knowledge"
      }));
    }
  }

  function initHeaderMenu() {
    ensureLesesporStyles();
    ensureLearningMenuStyles();
    promoteMinDayToHeader();
    setLesesporMenuLabel();
    ensureLearningMenuEntries();

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
      open() { setOpen(true); },
      close() { setOpen(false); },
      toggle() { setOpen(panel.hidden); },
      isOpen() { return !panel.hidden; }
    };
    window.HGHeaderMenu = headerMenuApi;

    button.addEventListener("click", (event) => {
      event.stopPropagation();
      headerMenuApi.toggle();
    });

    panel.addEventListener("click", (event) => {
      event.stopPropagation();
    });

    ["btnLesespor", "btnFagverk", "btnKnowledge"].forEach((id) => {
      document.getElementById(id)?.addEventListener("click", () => headerMenuApi.close());
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
