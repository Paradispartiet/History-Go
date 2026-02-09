window.renderCivicationInbox = function () {
  const box = document.getElementById("civicationInbox");
  if (!box) return;

  let offers = [];
  try {
    offers = JSON.parse(localStorage.getItem("hg_job_offers_v1") || "[]");
  } catch {}

  if (!offers.length) {
    box.innerHTML = `<div class="muted">Ingen nye meldinger</div>`;
    return;
  }

  box.innerHTML = offers.map(o => `
    <div class="civi-mail">
      <div class="civi-title">${o.title}</div>
      <div class="civi-meta">${o.career_name}</div>
      <button class="primary" data-accept-offer="${o.id}">Aksepter</button>
    </div>
  `).join("");
};
