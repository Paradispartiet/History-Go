function showToast(msg, ms = 2000) {
  const t = el.toast;
  if (!t) return;
  t.textContent = msg;
  t.style.display = "block";
  clearTimeout(t._hide);
  t._hide = setTimeout(() => {
    t.style.display = "none";
  }, ms);
}
