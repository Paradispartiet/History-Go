(function () {
  "use strict";

  function getCount() {
    const fromState = Number(window.CivicationState?.getUnreadCivicationCount?.() || 0);
    return Number.isFinite(fromState) ? Math.max(0, fromState) : 0;
  }

  function renderBadge() {
    const badge = document.getElementById("civicationUnreadBadge");
    if (!badge) return;

    const count = getCount();
    if (count <= 0) {
      badge.hidden = true;
      badge.textContent = "";
      badge.setAttribute("aria-hidden", "true");
      return;
    }

    badge.hidden = false;
    badge.textContent = count > 99 ? "99+" : String(count);
    badge.setAttribute("aria-hidden", "false");
  }

  ["DOMContentLoaded", "updateProfile", "updateInbox", "updateCivicationBadge", "civi:inboxChanged"].forEach(function (eventName) {
    window.addEventListener(eventName, renderBadge);
  });

  renderBadge();

  window["CivicationBadgeUI"] = {
    render: renderBadge
  };
})();
