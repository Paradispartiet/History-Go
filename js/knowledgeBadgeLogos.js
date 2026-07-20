// js/knowledgeBadgeLogos.js
(function () {
  "use strict";

  let badgesById = new Map();
  let observer = null;

  function s(value) {
    return String(value == null ? "" : value).trim();
  }

  function subjectIdFromHref(href) {
    try {
      return s(new URL(href, location.href).searchParams.get("subject"));
    } catch {
      return "";
    }
  }

  function makeBadgeImage(subjectId, label) {
    const badge = badgesById.get(s(subjectId));
    const image = s(badge?.image);
    if (!image) return null;

    const img = document.createElement("img");
    img.className = "kv2-subject-badge-img";
    img.src = image;
    img.alt = badge?.name ? `${badge.name}-merke` : `${label || subjectId}-merke`;
    img.loading = "lazy";
    img.decoding = "async";
    return img;
  }

  function enhanceSubjectRows(root) {
    root.querySelectorAll?.(".kv2-subject-row").forEach((row) => {
      const subjectId = subjectIdFromHref(row.getAttribute("href"));
      if (!subjectId) return;

      const slot = row.querySelector(".kv2-subject-row-title > span:first-child");
      if (!slot || slot.querySelector(".kv2-subject-badge-img")) return;

      const label = row.querySelector(".kv2-subject-row-title strong")?.textContent || subjectId;
      const img = makeBadgeImage(subjectId, label);
      if (!img) return;

      slot.textContent = "";
      slot.classList.add("kv2-subject-badge-slot");
      slot.appendChild(img);
    });
  }

  function enhanceSubjectNav(root) {
    root.querySelectorAll?.(".kv2-subject-pill[href*='subject=']").forEach((pill) => {
      if (pill.querySelector(".kv2-subject-badge-img")) return;
      const subjectId = subjectIdFromHref(pill.getAttribute("href"));
      if (!subjectId) return;

      const label = pill.querySelector("span")?.textContent || subjectId;
      const img = makeBadgeImage(subjectId, label);
      if (!img) return;
      pill.insertBefore(img, pill.firstChild);
    });
  }

  function enhanceSubjectHero(root) {
    const hero = root.querySelector?.(".kv2-subject-hero");
    if (!hero) return;

    const subjectId = s(new URLSearchParams(location.search).get("subject"));
    if (!subjectId) return;

    const eyebrow = hero.querySelector(".kv2-eyebrow");
    if (!eyebrow || eyebrow.querySelector(".kv2-subject-badge-img")) return;

    const label = hero.querySelector("h2")?.textContent || subjectId;
    const img = makeBadgeImage(subjectId, label);
    if (!img) return;

    eyebrow.textContent = "";
    eyebrow.append(img, document.createTextNode("Fag"));
  }

  function enhance(root = document) {
    if (!badgesById.size) return;
    enhanceSubjectRows(root);
    enhanceSubjectNav(root);
    enhanceSubjectHero(root);
  }

  async function boot() {
    try {
      const badges = typeof window.DataHub?.loadBadges === "function"
        ? await window.DataHub.loadBadges()
        : [];
      badgesById = new Map((Array.isArray(badges) ? badges : []).map((badge) => [s(badge?.id), badge]));
    } catch (error) {
      console.warn("[KnowledgeBadgeLogos] could not load badges", error);
      return;
    }

    enhance(document);

    observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node.nodeType === Node.ELEMENT_NODE) enhance(node);
        }
      }
      enhance(document);
    });

    observer.observe(document.body, { childList: true, subtree: true });
  }

  document.addEventListener("DOMContentLoaded", boot);
})();
