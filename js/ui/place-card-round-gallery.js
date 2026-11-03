/* Place Sheet: show the complete image behind each visual round at its
   editorial section. Keep the original round in the DOM: it owns the popup
   action and is reused when the player switches places (including Micro). */
(function () {
  "use strict";

  const card = document.getElementById("placeCard");
  if (!card) return;

  // People and Badges remain in the original right-hand PlaceCard collection grid.
  // Only other rounds are expanded into full-size editorial images.
  const rounds = [
    { id: "pcNatureIcon", section: "about", label: "Natur" },
    { id: "pcWorksIcon", section: "history", label: "Verk" },
    { id: "pcFortellingerIcon", section: "stories", label: "Fortellinger" },
    { id: "pcForNaIcon", section: "before-after", label: "Før og nå" },
    { id: "pcLeksikonIcon", section: "language", label: "Leksikon" },
    { id: "pcPlayIcon", section: "learning", label: "Lek" },
    { id: "pcTrainingIcon", section: "learning", label: "Trening" },
    { id: "pcTasksIcon", section: "learning", label: "Oppgaver" },
    { id: "pcCivicationStoreIcon", section: "learning", label: "Civication Store" }
  ];
  const sections = ["about", "history", "stories", "before-after", "language", "learning"];
  let scheduled = false;

  function original(id) {
    const node = document.getElementById(id);
    return node instanceof HTMLElement && card.contains(node) ? node : null;
  }

  function preview(spec) {
    const source = original(spec.id);
    if (!source || source.hidden || source.getAttribute("aria-hidden") === "true") return null;
    const image = source.querySelector(":scope > img");
    if (!(image instanceof HTMLImageElement) || !image.getAttribute("src")
        || source.dataset.roundReady === "false") return null;
    return { source, image, spec };
  }

  function renderButton(parent, item, className) {
    let button = Array.from(parent.children).find(node =>
      node instanceof HTMLElement && node.dataset.pcRoundGalleryItem === item.spec.id
    );
    if (!(button instanceof HTMLButtonElement)) {
      button = document.createElement("button");
      button.type = "button";
      button.className = className;
      button.dataset.pcRoundGalleryItem = item.spec.id;
      const image = document.createElement("img");
      image.loading = "lazy";
      image.decoding = "async";
      const label = document.createElement("span");
      label.className = "pc-round-gallery-label";
      button.append(image, label);
      parent.appendChild(button);
    }

    const image = button.querySelector("img");
    const label = button.querySelector(".pc-round-gallery-label");
    const src = item.image.getAttribute("src") || "";
    if (image.getAttribute("src") !== src) image.setAttribute("src", src);
    const alt = item.image.getAttribute("alt") || item.spec.label;
    if (image.alt !== alt) image.alt = alt;
    if (label.textContent !== item.spec.label) label.textContent = item.spec.label;
    const actionLabel = "Åpne " + item.spec.label;
    if (button.getAttribute("aria-label") !== actionLabel) button.setAttribute("aria-label", actionLabel);

    // Optional editorial photo caption and real credit. Use only existing
    // DOM metadata; never infer photographers or sources from a filename.
    // Brands retains its compact logo layout without these captions.
    function setOptionalLine(className, text) {
      let line = button.querySelector(":scope > ." + className);
      if (!text) {
        if (line) line.remove();
        return;
      }
      if (!line) {
        line = document.createElement("span");
        line.className = className;
        button.appendChild(line);
      }
      if (line.textContent !== text) line.textContent = text;
    }
    if (className === "pc-round-gallery-item") {
      const detail = String(item.image.dataset.caption || item.source.dataset.imageCaption || alt).trim();
      const credit = String(
        item.image.dataset.credit || item.image.dataset.imageCredit ||
        item.source.dataset.imageCredit || item.source.dataset.credit || ""
      ).trim();
      setOptionalLine("pc-round-gallery-caption",
        detail && detail.toLocaleLowerCase() !== item.spec.label.toLocaleLowerCase() ? detail : "");
      setOptionalLine("pc-round-gallery-credit", credit ? "Kilde: " + credit : "");
    }
    // Forward to the canonical popup handler; do not create a second action path.
    button.onclick = function (event) {
      event.stopPropagation();
      const current = original(item.spec.id);
      if (current && !current.hidden) current.click();
    };
    return button;
  }

  function sectionAnchor(shell, section) {
    if (section === "about") return shell.querySelector(".pc-sheet-explore-grid");
    return shell.querySelector('[data-hg-place-sheet-section="' + section + '"]');
  }

  function syncSection(shell, section) {
    const anchor = sectionAnchor(shell, section);
    let host = Array.from(shell.querySelectorAll("[data-pc-round-gallery-section]")).find(node =>
      node.getAttribute("data-pc-round-gallery-section") === section
    ) || null;
    const matches = rounds.filter(spec => spec.section === section).map(preview).filter(Boolean);

    if (!(anchor instanceof HTMLElement) || !matches.length) {
      if (host) host.remove();
      return;
    }

    if (!(host instanceof HTMLElement)) {
      host = document.createElement("div");
      host.className = "pc-round-gallery-section";
      host.setAttribute("data-pc-round-gallery-section", section);
    }
    if (anchor.nextElementSibling !== host) anchor.insertAdjacentElement("afterend", host);

    const wanted = new Set(matches.map(item => item.spec.id));
    host.querySelectorAll("[data-pc-round-gallery-item]").forEach(node => {
      if (!wanted.has(node.getAttribute("data-pc-round-gallery-item"))) node.remove();
    });
    matches.forEach(item => {
      const button = renderButton(host, item, "pc-round-gallery-item");
      if (button !== host.lastElementChild) host.appendChild(button);
      item.source.dataset.pcRoundGallerySource = "1";
    });
  }

  function syncBrands(shell) {
    const about = shell.querySelector('.pc-sheet-canonical-about[data-hg-place-sheet-owner="about"]');
    const source = original("pcBrandsIcon");
    if (!(about instanceof HTMLElement) || !source) return;
    let host = about.querySelector(':scope > [data-pc-round-gallery-brand="1"]');
    if (source.hidden || source.getAttribute("aria-hidden") === "true") {
      if (host) host.remove();
      return;
    }

    const image = source.querySelector(":scope > img");
    const hasImage = image instanceof HTMLImageElement && !!image.getAttribute("src")
      && source.dataset.roundReady !== "false";
    // A brand without a logo retains a text entry at the end of About.
    const brands = document.getElementById("pcBrandsList");
    const hasBrands = Boolean(brands && brands.querySelector(".pc-brand-entry"));
    if (!hasImage && !hasBrands) {
      if (host) host.remove();
      return;
    }

    if (!(host instanceof HTMLElement)) {
      host = document.createElement("div");
      host.className = "pc-round-gallery-brand";
      host.setAttribute("data-pc-round-gallery-brand", "1");
    }
    if (host.parentElement !== about || host !== about.lastElementChild) about.appendChild(host);

    if (hasImage) {
      renderButton(host, {
        source, image, spec: { id: "pcBrandsIcon", label: "Brands" }
      }, "pc-round-gallery-brand-button");
      const button = host.firstElementChild;
      if (button) button.className = "pc-round-gallery-brand-button";
    } else {
      host.replaceChildren();
      const button = document.createElement("button");
      button.type = "button";
      button.className = "pc-round-gallery-brand-link";
      button.textContent = "Se Brands";
      button.onclick = function (event) {
        event.stopPropagation();
        const current = original("pcBrandsIcon");
        if (current && !current.hidden) current.click();
      };
      host.appendChild(button);
    }
  }

  function sync() {
    const shell = card.querySelector('[data-hg-place-sheet-shell="1"]');
    const placeId = card.dataset.currentPlaceId || "";
    if (!card.classList.contains("is-place-sheet-direct")
        || !card.classList.contains("is-unified-place")
        || !(shell instanceof HTMLElement) || !placeId || shell.dataset.placeId !== placeId) return;

    rounds.forEach(spec => {
      const source = original(spec.id);
      if (source && !preview(spec)) delete source.dataset.pcRoundGallerySource;
    });
    sections.forEach(section => syncSection(shell, section));
    syncBrands(shell);
  }

  function schedule() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(function () {
      scheduled = false;
      sync();
    });
  }

  const observer = new MutationObserver(function (mutations) {
    // Ignore the gallery's own changes to avoid a render/observer cycle.
    if (mutations.some(mutation => {
      const node = mutation.target;
      return !(node instanceof Element)
        || !node.closest(".pc-round-gallery-section, .pc-round-gallery-brand");
    })) schedule();
  });
  observer.observe(card, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ["class", "hidden", "src", "alt",
      "data-caption", "data-image-caption", "data-credit", "data-image-credit",
      "data-round-ready", "data-current-place-id", "data-place-id", "data-collection-id"]
  });
  window.addEventListener("hg:place-unified-ready", schedule);
  window.addEventListener("hg:place-selected", schedule);
  schedule();
})();
