// Canonical badge presentation for Knowledge V2.
// Uses DataHub.loadBadges() so Knowledge never maintains a parallel icon registry.
(function () {
  "use strict";

  /** @type {Map<string, any>} */
  let badgeById = new Map();
  let applyQueued = false;

  function s(value) {
    return String(value == null ? "" : value).trim();
  }

  function esc(value) {
    return s(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function canonicalSubjectId(value) {
    const raw = s(value);
    if (!raw) return "";
    try {
      return s(window.DomainRegistry?.resolve?.(raw) || raw);
    } catch {
      return raw;
    }
  }

  function badgeFor(subjectId) {
    const raw = s(subjectId);
    const canonical = canonicalSubjectId(raw);
    return badgeById.get(canonical) || badgeById.get(raw) || null;
  }

  function subjectIdFromHref(href) {
    try {
      return s(new URL(href, location.href).searchParams.get("subject"));
    } catch {
      return "";
    }
  }

  function imageMarkup(badge, className) {
    const src = s(badge?.image || badge?.img || badge?.imageCard);
    if (!src) return "";
    return `<img class="${className}" src="${esc(src)}" alt="" loading="lazy" decoding="async">`;
  }

  function applySubjectRows() {
    document.querySelectorAll(".kv2-subject-row").forEach((row) => {
      if (!(row instanceof HTMLAnchorElement)) return;
      const subjectId = subjectIdFromHref(row.href);
      const badge = badgeFor(subjectId);
      if (!badge) return;

      const slot = row.querySelector(".kv2-subject-row-title > span:first-child");
      const image = imageMarkup(badge, "kv2-subject-badge-image");
      if (slot && image && slot.getAttribute("data-hg-badge-id") !== s(badge.id)) {
        slot.className = "kv2-subject-badge-slot";
        slot.setAttribute("data-hg-badge-id", s(badge.id));
        slot.innerHTML = image;
      }

      const label = row.querySelector(".kv2-subject-row-title > strong");
      const badgeName = s(badge.name);
      if (label && badgeName && label.textContent !== badgeName) label.textContent = badgeName;
    });
  }

  function applySubjectNav() {
    document.querySelectorAll(".kv2-subject-pill").forEach((pill) => {
      if (!(pill instanceof HTMLAnchorElement)) return;
      const subjectId = subjectIdFromHref(pill.href);
      if (!subjectId) return;
      const badge = badgeFor(subjectId);
      if (!badge) return;

      const imageSrc = s(badge.image || badge.img || badge.imageCard);
      if (imageSrc && !pill.querySelector(".kv2-subject-pill-badge")) {
        const img = document.createElement("img");
        img.className = "kv2-subject-pill-badge";
        img.src = imageSrc;
        img.alt = "";
        img.loading = "lazy";
        img.decoding = "async";
        pill.prepend(img);
      }

      const label = pill.querySelector("span");
      const badgeName = s(badge.name);
      if (label && badgeName && label.textContent !== badgeName) label.textContent = badgeName;
    });
  }

  function applySubjectHero() {
    const subjectId = s(new URLSearchParams(location.search).get("subject"));
    if (!subjectId) return;
    const badge = badgeFor(subjectId);
    const eyebrow = document.querySelector(".kv2-subject-hero > .kv2-eyebrow");
    if (!badge || !eyebrow) return;

    const image = imageMarkup(badge, "kv2-subject-hero-badge");
    const badgeId = s(badge.id);
    if (image && eyebrow.getAttribute("data-hg-badge-id") !== badgeId) {
      eyebrow.innerHTML = `${image}<span>Fag</span>`;
      eyebrow.setAttribute("data-hg-badge-id", badgeId);
    }

    const title = document.querySelector(".kv2-subject-hero > h2");
    const badgeName = s(badge.name);
    if (title && badgeName && title.textContent !== badgeName) title.textContent = badgeName;
  }

  function applyBadges() {
    applyQueued = false;
    if (!badgeById.size) return;
    applySubjectRows();
    applySubjectNav();
    applySubjectHero();
  }

  function queueApply() {
    if (applyQueued) return;
    applyQueued = true;
    queueMicrotask(applyBadges);
  }

  async function boot() {
    if (typeof window.DataHub?.loadBadges !== "function") return;
    const badges = await window.DataHub.loadBadges({ cache: "default" });
    badgeById = new Map((Array.isArray(badges) ? badges : [])
      .map((badge) => [s(badge?.id), badge])
      .filter(([id]) => id));

    applyBadges();

    const observer = new MutationObserver(queueApply);
    const content = document.getElementById("knowledgeContent");
    const nav = document.getElementById("knowledgeSubjectNav");
    if (content) observer.observe(content, { childList: true, subtree: true });
    if (nav) observer.observe(nav, { childList: true, subtree: true });
  }

  document.addEventListener("DOMContentLoaded", () => {
    boot().catch((error) => console.warn("[KnowledgeBadgePresentation]", error));
  });
})();
