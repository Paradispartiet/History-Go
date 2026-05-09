function getToastDuration(msg) {
  const text = String(msg || "").trim();
  const len = text.length;

  if (len <= 20) return 1400;
  if (len <= 55) return 2300;
  if (len <= 110) return 3600;
  return 5200;
}

function showToast(msg, ms = null) {
  const tt = (key, fallback) => window.HG_I18N?.t?.(key, fallback) || fallback;
  const t = el.toast;
  if (!t) return;

  clearTimeout(t._hide);
  t._hide = null;

  t.innerHTML = "";

  const closeBtn = document.createElement("button");
  closeBtn.type = "button";
  closeBtn.className = "toast-close";
  closeBtn.setAttribute("aria-label", tt("ui.toast.closeMessage", "Lukk melding"));
  closeBtn.textContent = "×";
  closeBtn.addEventListener("click", () => {
    clearTimeout(t._hide);
    t._hide = null;
    t.style.display = "none";
  });

  const body = document.createElement("div");
  body.className = "toast-body";
  body.textContent = String(msg || "");

  t.appendChild(closeBtn);
  t.appendChild(body);
  t.style.display = "block";

  const duration = Number.isFinite(ms) ? Number(ms) : getToastDuration(msg);

  if (duration > 0) {
    t._hide = setTimeout(() => {
      t.style.display = "none";
    }, duration);
  }
}
