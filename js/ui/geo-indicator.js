function setGeo(status) {
  const el = document.getElementById("geoStatus");
  if (!el) return;

  el.classList.remove("geo-ok","geo-bad","geo-unknown");

  if (status === "granted" || status === "test") {
    el.classList.add("geo-ok"); el.textContent = "📍";
  } else if (status === "blocked" || status === "unsupported") {
    el.classList.add("geo-bad"); el.textContent = "⛔";
  } else {
    el.classList.add("geo-unknown"); el.textContent = "…";
  }
}

window.addEventListener("hg:geo", (e) => {
  const event = /** @type {CustomEvent} */ (e);
  const st = event.detail?.status || "unknown";
  setGeo(st);
});
