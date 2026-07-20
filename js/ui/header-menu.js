// Header menu: keeps secondary topbar tools out of the fixed header row while
// preserving the original DOM ids/event hooks for search, map mode and panels.
(function () {
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

  function initHeaderMenu() {
    promoteMinDayToHeader();
    setLesesporMenuLabel();

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
