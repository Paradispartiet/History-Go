const ui = (() => {
  function showToast(msg, ms=2000){
    const el = document.getElementById("toast");
    if (!el) return;
    el.textContent = msg; el.style.display = "block";
    clearTimeout(showToast._t); showToast._t = setTimeout(()=> el.style.display="none", ms);
  }
  function openModal(title, content){
    const m = document.getElementById("modal");
    const h = document.getElementById("modalTitle");
    const b = document.getElementById("modalContent");
    if (!m||!h||!b) return;
    h.textContent = title; b.innerHTML = content; m.setAttribute("aria-hidden","false");
  }
  function closeModal(){ document.getElementById("modal")?.setAttribute("aria-hidden","true"); }
  document.addEventListener("DOMContentLoaded", ()=>{
    document.getElementById("modalClose")?.addEventListener("click", closeModal);
  });
  return { showToast, openModal, closeModal };
})();
