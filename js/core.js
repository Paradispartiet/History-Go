// CORE: global namespace + feilfanger
window.HG = window.HG || { data:{} };

(function installErrorTrap(){
  let shown = false;
  window.addEventListener("error", (e) => {
    if (shown) return; shown = true;
    console.error("JS-feil:", e.error || e.message);
    const t = document.getElementById("toast");
    if (t){ t.textContent = "Feil: " + (e.message || "Se konsoll"); t.style.display = "block"; }
  });
  window.addEventListener("unhandledrejection", (e) => {
    if (shown) return; shown = true;
    console.error("Promise-feil:", e.reason);
    const t = document.getElementById("toast");
    if (t){ t.textContent = "Feil (promise): " + (e.reason?.message || "Se konsoll"); t.style.display = "block"; }
  });
})();
