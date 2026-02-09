async function handleBadgeClick(badgeEl) {
  const badgeId = badgeEl.getAttribute("data-badge-id");
  const modal = document.getElementById("badgeModal");
  if (!badgeId || !modal) return;

  await ensureBadgesLoaded();
  const badge = BADGES.find(b => String(b.id || "").trim() === String(badgeId || "").trim());
  if (!badge) return;

  const localMerits = JSON.parse(localStorage.getItem("merits_by_category") || "{}");
const info =
  localMerits[String(badge.id || "").trim()] ||
  { points: 0 };


  const points = Number(info.points || 0);
  const { label } = deriveTierFromPoints(badge, points);

  const imgEl   = modal.querySelector(".badge-img");
  const titleEl = modal.querySelector(".badge-title");
  const levelEl = modal.querySelector(".badge-level");
  const textEl  = modal.querySelector(".badge-progress-text");
  const barEl   = modal.querySelector(".badge-progress-bar");

  if (imgEl)  imgEl.src = (badge.image || badge.icon || badge.img || badge.imageCard || "");
  if (titleEl) titleEl.textContent = badge.name;

  // Kanonisk: vis nivå ut fra tiers+points (ikke lagret level-tekst)
  if (levelEl) levelEl.textContent = label || "Nybegynner";
  if (textEl)  textEl.textContent = `${points} poeng`;

  // Progressbar
  if (barEl && Array.isArray(badge.tiers) && badge.tiers.length) {
    const max = Number(badge.tiers[badge.tiers.length - 1].threshold || 1);
    const pct = Math.max(0, Math.min(100, (points / Math.max(1, max)) * 100));
    barEl.style.width = `${pct}%`;
  } else if (barEl) {
    barEl.style.width = "0%";
  }

  modal.style.display = "flex";
  modal.setAttribute("aria-hidden", "false");

  const closeBtn = modal.querySelector(".close-btn");
  if (closeBtn) {
    closeBtn.onclick = () => {
      modal.style.display = "none";
      modal.setAttribute("aria-hidden", "true");
    };
  }
}

