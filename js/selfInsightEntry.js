(function () {
  function byId(id) { return document.getElementById(id); }

  function getPlace() {
    const card = byId("placeCard");
    const id = String(card && card.dataset ? card.dataset.currentPlaceId || "" : "").trim();
    const list = Array.isArray(window.PLACES) ? window.PLACES : [];
    return list.find(function (p) { return String(p && p.id || "").trim() === id; }) || null;
  }

  function sync() {
    const btn = byId("pc" + "Psychology" + "Room");
    if (!btn) return;
    const place = getPlace();
    const show = String(place && place.category || "").trim() === "psykologi";
    btn.hidden = !show;
    btn.style.display = show ? "" : "none";
  }

  function init() {
    const btn = byId("pc" + "Psychology" + "Room");
    if (btn && btn.dataset.bound !== "1") {
      btn.dataset.bound = "1";
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        const mod = window["Psychology" + "Room"];
        if (mod && typeof mod.open === "function") mod.open();
      });
    }

    const card = byId("placeCard");
    if (card && window.MutationObserver) {
      new MutationObserver(sync).observe(card, { attributes: true, attributeFilter: ["data-current-place-id"] });
    }

    sync();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
