function showToast(msg, ms = null) {
  const t = el.toast;
  if (!t) return;

  clearTimeout(t._hide);
  t._hide = null;

  t.innerHTML = "";

  const closeBtn = document.createElement("button");
  closeBtn.type = "button";
  closeBtn.className = "toast-close";
  closeBtn.setAttribute("aria-label", "Lukk melding");
  closeBtn.textContent = "×";
  closeBtn.addEventListener("click", () => {
    t.style.display = "none";
  });

  const body = document.createElement("div");
  body.className = "toast-body";
  body.textContent = String(msg || "");

  t.appendChild(closeBtn);
  t.appendChild(body);
  t.style.display = "block";

  if (Number.isFinite(ms) && Number(ms) > 0) {
    t._hide = setTimeout(() => {
      t.style.display = "none";
    }, Number(ms));
  }
}
