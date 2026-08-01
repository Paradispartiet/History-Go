// @ts-nocheck
// js/ui/person-popup-v2.js
// Rich, compact people popup with structured biography, works, places and sources.
(function installPersonPopupV2(global) {
  "use strict";

  const INSTALL_FLAG = "__HG_PERSON_POPUP_V2_INSTALLED__";
  const POLL_FLAG = "__HG_PERSON_POPUP_V2_POLLING__";

  function text(value) {
    return String(value == null ? "" : value).trim();
  }

  function list(value) {
    return Array.isArray(value) ? value : [];
  }

  function objectValue(value) {
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function escapeAttr(value) {
    return escapeHtml(value).replaceAll("\n", " ").trim();
  }

  function firstText() {
    for (const value of arguments) {
      const candidate = text(value);
      if (candidate) return candidate;
    }
    return "";
  }

  function uniqueStrings(values) {
    const seen = new Set();
    const out = [];
    values.forEach(value => {
      const candidate = text(value);
      if (!candidate || seen.has(candidate)) return;
      seen.add(candidate);
      out.push(candidate);
    });
    return out;
  }

  function humanize(value) {
    const cleaned = text(value).replaceAll("_", " ").replace(/\s+/g, " ");
    if (!cleaned) return "";
    return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  }

  function compactText(value, maxLength = 220) {
    const cleaned = text(value).replace(/\s+/g, " ");
    if (cleaned.length <= maxLength) return cleaned;
    return cleaned.slice(0, Math.max(0, maxLength - 1)).trimEnd() + "…";
  }

  function helper(name) {
    return typeof global[name] === "function" ? global[name] : null;
  }

  function localizePerson(person) {
    try {
      if (typeof global.HG_I18N?.localizePerson === "function") {
        return global.HG_I18N.localizePerson(person) || person;
      }
    } catch {}
    return person;
  }

  function renderParagraphs(value) {
    const source = text(value);
    if (!source) return "";
    return source
      .split(/\n\s*\n+/)
      .map(paragraph => text(paragraph))
      .filter(Boolean)
      .map(paragraph => `<p>${escapeHtml(paragraph).replaceAll("\n", "<br>")}</p>`)
      .join("");
  }

  function initialsFor(person) {
    const explicit = firstText(person?.initials);
    if (explicit) return explicit.slice(0, 4).toUpperCase();
    const name = firstText(person?.name, person?.title, person?.id);
    return name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 3)
      .map(part => part.charAt(0))
      .join("")
      .toUpperCase() || "•";
  }

  function imageCandidates(person) {
    return uniqueStrings([
      person?.image,
      person?.portrait,
      person?.portraitImage,
      person?.imageCard,
      person?.cardImage,
      person?.photo,
      person?.frontImage
    ]);
  }

  function isEditorialIllustration(person) {
    return firstText(person?.imageMeta?.mediaType, person?.imageMeta?.source) === "editorial_illustration"
      || firstText(person?.imageMeta?.source) === "history_go_editorial_illustration";
  }

  function formatDate(value) {
    const raw = text(value);
    if (!raw) return "";
    const isoMatch = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!isoMatch) return raw;
    const date = new Date(`${raw}T00:00:00Z`);
    if (!Number.isFinite(date.getTime())) return raw;
    return new Intl.DateTimeFormat("nb-NO", {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "UTC"
    }).format(date);
  }

  function birthLabel(person) {
    const born = objectValue(person?.born);
    return formatDate(firstText(
      person?.birth_date,
      person?.birthDate,
      born.date,
      born.year,
      person?.birthYear,
      typeof person?.born === "string" || typeof person?.born === "number" ? person.born : ""
    ));
  }

  function deathLabel(person) {
    const died = objectValue(person?.died);
    return formatDate(firstText(
      person?.death_date,
      person?.deathDate,
      died.date,
      died.year,
      person?.deathYear,
      typeof person?.died === "string" || typeof person?.died === "number" ? person.died : ""
    ));
  }

  function lifeLabel(person) {
    const born = birthLabel(person);
    const died = deathLabel(person);
    if (born && died) return `${born} – ${died}`;
    if (born) return `Født ${born}`;
    if (died) return `Død ${died}`;
    return "";
  }

  function kindLabel(person) {
    const kind = firstText(person?.kindLabel, person?.occupation, person?.profession, person?.role);
    if (kind) return humanize(kind);
    const legacy = firstText(person?.kind);
    if (legacy === "ikon") return "Ikon";
    if (legacy === "institusjonsbærer") return "Institusjonsbærer";
    if (legacy === "kontekst") return "Kontekstperson";
    return humanize(legacy);
  }

  function categoryLabel(person) {
    return humanize(firstText(person?.category, person?.categoryId, list(person?.tags)[0]));
  }

  function personWorks(person) {
    const source = [
      ...list(person?.works),
      ...list(person?.notable_works),
      ...list(person?.notableWorks)
    ];
    const seen = new Set();
    return source.map((item, index) => {
      if (typeof item === "string" || typeof item === "number") {
        const title = text(item);
        return title ? { id: `${index}:${title}`, title, meta: "", summary: "" } : null;
      }
      if (!item || typeof item !== "object") return null;
      const title = firstText(item.title, item.name, item.work, item.label, item.id);
      if (!title) return null;
      const meta = uniqueStrings([
        item.year,
        item.date,
        item.material,
        item.place,
        item.location
      ]).join(" · ");
      const summary = firstText(item.summary, item.desc, item.description, item.note);
      return { id: firstText(item.id, `${index}:${title}`), title, meta, summary };
    }).filter(item => {
      if (!item) return false;
      const key = item.title.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  function stringList() {
    const out = [];
    for (const value of arguments) {
      if (Array.isArray(value)) out.push(...value);
      else if (value != null && value !== "") out.push(value);
    }
    return uniqueStrings(out);
  }

  function placesForPerson(person) {
    const getPlaces = helper("getPlacesForPerson");
    if (!getPlaces) return [];
    try {
      return list(getPlaces(person?.id));
    } catch {
      return [];
    }
  }

  function relationsForPerson(person) {
    const getRelations = helper("getRelationsForPerson");
    if (!getRelations) return [];
    try {
      const relations = list(getRelations(person?.id));
      const filter = helper("filterCuratedRels");
      return filter ? list(filter(relations)) : relations;
    } catch {
      return [];
    }
  }

  function observationsForPerson(person) {
    const getObservations = helper("getObservationsForTarget");
    if (!getObservations) return [];
    try {
      return list(getObservations(person?.id, "person"));
    } catch {
      return [];
    }
  }

  function renderFact(label, value) {
    const safeValue = text(value);
    if (!safeValue) return "";
    return `
      <div class="hg-person-fact">
        <span>${escapeHtml(label)}</span>
        <strong>${escapeHtml(safeValue)}</strong>
      </div>
    `;
  }

  function renderWorks(works) {
    if (!works.length) return "";
    return `
      <section class="hg-section hg-person-section hg-person-works-section">
        <h3>Verk og bidrag</h3>
        <div class="hg-person-work-grid">
          ${works.map(work => `
            <article class="hg-person-work-card">
              <strong>${escapeHtml(work.title)}</strong>
              ${work.meta ? `<span>${escapeHtml(work.meta)}</span>` : ""}
              ${work.summary ? `<p>${escapeHtml(work.summary)}</p>` : ""}
            </article>
          `).join("")}
        </div>
      </section>
    `;
  }

  function renderProfileBlock(title, values) {
    const items = uniqueStrings(values);
    if (!items.length) return "";
    return `
      <section class="hg-section hg-person-section hg-person-profile-block">
        <h3>${escapeHtml(title)}</h3>
        <div class="hg-person-chip-list">
          ${items.map(item => `<span class="hg-person-chip">${escapeHtml(humanize(item))}</span>`).join("")}
        </div>
      </section>
    `;
  }

  function renderPlaces(places) {
    if (!places.length) return "";
    return `
      <section class="hg-section hg-person-section hg-person-places-section">
        <h3>Steder</h3>
        <div class="hg-person-place-grid">
          ${places.map(place => {
            const name = firstText(place?.name, place?.title, place?.id);
            const type = humanize(firstText(place?.quiz_profile?.place_type, place?.locatorType, place?.type, place?.category));
            const summary = compactText(firstText(place?.desc, place?.popupDesc), 180);
            return `
              <button type="button" class="hg-person-place-card" data-place="${escapeAttr(place?.id)}">
                <span class="hg-person-place-icon" aria-hidden="true">⌖</span>
                <span class="hg-person-place-copy">
                  <strong>${escapeHtml(name)}</strong>
                  ${type ? `<span>${escapeHtml(type)}</span>` : ""}
                  ${summary ? `<small>${escapeHtml(summary)}</small>` : ""}
                </span>
                <span class="hg-person-place-arrow" aria-hidden="true">→</span>
              </button>
            `;
          }).join("")}
        </div>
      </section>
    `;
  }

  function renderRelations(relations) {
    const renderRow = helper("renderRelationRow");
    if (!relations.length || !renderRow) return "";
    return `
      <section class="hg-section hg-person-section hg-person-relations-section">
        <h3>Tilknytninger</h3>
        <ul class="hg-rel-list hg-person-relations-list">
          ${relations.map(relation => renderRow(relation)).join("")}
        </ul>
      </section>
    `;
  }

  function sourceEntries(person) {
    const entries = [];
    list(person?.externalLinks).forEach(item => {
      if (typeof item === "string") {
        entries.push({ label: item, url: item });
        return;
      }
      if (!item || typeof item !== "object") return;
      const url = firstText(item.url, item.href);
      const label = firstText(item.label, item.title, item.name, url);
      if (url || label) entries.push({ label, url });
    });
    list(person?.sources).forEach(item => {
      if (typeof item === "string") entries.push({ label: item, url: item.startsWith("http") ? item : "" });
      else if (item && typeof item === "object") {
        const url = firstText(item.url, item.href);
        const label = firstText(item.label, item.title, item.name, url);
        if (url || label) entries.push({ label, url });
      }
    });
    list(person?.source_urls).forEach(url => entries.push({ label: text(url), url: text(url) }));

    const seenUrls = new Set();
    const seenLabels = new Set();
    return entries.filter(entry => {
      const label = text(entry?.label);
      const url = safeHttpUrl(entry?.url);
      if (!label) return false;
      if (url) {
        const key = url.replace(/\/+$/, "").toLowerCase();
        if (seenUrls.has(key)) return false;
        seenUrls.add(key);
        return true;
      }
      const key = label.toLowerCase();
      if (seenLabels.has(key)) return false;
      seenLabels.add(key);
      return true;
    });
  }

  function safeHttpUrl(value) {
    const raw = text(value);
    if (!/^https?:\/\//i.test(raw)) return "";
    return raw;
  }

  function sourceLabel(entry, index) {
    const label = text(entry?.label);
    const url = safeHttpUrl(entry?.url);
    if (label && label !== url) return label;
    if (url) {
      try {
        return new URL(url).hostname.replace(/^www\./, "");
      } catch {}
    }
    return label || `Kilde ${index + 1}`;
  }

  function renderSources(sources) {
    if (!sources.length) return "";
    return `
      <section class="hg-section hg-person-section hg-person-sources-section">
        <h3>Kilder og videre lesning</h3>
        <div class="hg-person-source-list">
          ${sources.map((source, index) => {
            const url = safeHttpUrl(source.url);
            const label = sourceLabel(source, index);
            return url
              ? `<a href="${escapeAttr(url)}" target="_blank" rel="noopener noreferrer"><span>${escapeHtml(label)}</span><span aria-hidden="true">↗</span></a>`
              : `<div><span>${escapeHtml(label)}</span></div>`;
          }).join("")}
        </div>
      </section>
    `;
  }

  function renderKnowledge(person) {
    const completed = helper("hasCompletedQuiz")?.(person?.id) === true;
    if (!completed) return "";
    const categoryId = firstText(person?.category, person?.categoryId, list(person?.tags)[0]);
    const knowledge = categoryId ? helper("getInlineKnowledgeFor")?.(categoryId, person?.id) : null;
    const trivia = categoryId ? list(helper("getInlineTriviaFor")?.(categoryId, person?.id)) : [];
    if (!knowledge && !trivia.length) return "";

    const groups = knowledge && typeof knowledge === "object"
      ? Object.entries(knowledge).map(([dimension, items]) => {
          const rows = list(items).filter(Boolean);
          if (!rows.length) return "";
          return `
            <div class="hg-person-knowledge-group">
              <h4>${escapeHtml(humanize(dimension))}</h4>
              <ul>${rows.map(item => {
                const topic = firstText(item?.topic, item?.title);
                const body = firstText(item?.text, item?.knowledge, item?.desc);
                return `<li>${topic ? `<strong>${escapeHtml(topic)}:</strong> ` : ""}${escapeHtml(body)}</li>`;
              }).join("")}</ul>
            </div>
          `;
        }).join("")
      : "";

    return `
      <section class="hg-section hg-person-section hg-person-knowledge-section">
        <h3>Kunnskap</h3>
        ${groups}
        ${trivia.length ? `
          <div class="hg-person-knowledge-group">
            <h4>Funfacts</h4>
            <ul>${trivia.map(item => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
          </div>
        ` : ""}
      </section>
    `;
  }

  function renderObservations(observations) {
    if (!observations.length) return "";
    const renderList = helper("renderObsList");
    if (!renderList) return "";
    return `
      <section class="hg-section hg-person-section hg-person-observations-section">
        <h3>Observasjoner</h3>
        ${renderList(observations)}
      </section>
    `;
  }

  function attachPortrait(popup, candidates) {
    const media = popup?.querySelector?.("[data-person-hero-media]");
    const image = popup?.querySelector?.("[data-person-hero-image]");
    if (!media || !image) return;
    if (!candidates.length) {
      media.classList.add("is-missing");
      image.hidden = true;
      return;
    }

    let index = 0;
    const loadNext = () => {
      if (index >= candidates.length) {
        image.removeAttribute("src");
        image.hidden = true;
        media.classList.remove("is-loading");
        media.classList.add("is-missing");
        return;
      }
      media.classList.add("is-loading");
      image.hidden = false;
      image.src = candidates[index++];
    };
    image.addEventListener("load", () => media.classList.remove("is-loading", "is-missing"));
    image.addEventListener("error", loadNext);
    loadNext();
  }

  async function configureQuizButton(popup, personId) {
    const button = popup?.querySelector?.("[data-person-quiz]");
    if (!button) return;
    const engine = global.QuizEngine;
    if (engine && typeof engine.getTargetSummary === "function") {
      try {
        const info = await engine.getTargetSummary(personId);
        if (!button.isConnected) return;
        if (!info?.hasAny) {
          button.remove();
          return;
        }
      } catch {}
    }
    button.hidden = false;
    helper("enhanceQuizButton")?.(button, personId);
  }

  function showPersonPopupV2(inputPerson) {
    if (!inputPerson) return;
    const person = localizePerson(inputPerson);
    const makePopup = helper("makePopup");
    if (!makePopup) return;

    try {
      global.HGReads?.recordPerson?.({ personId: person?.id });
      list(global.HGStories?.getByPerson?.(person?.id)).forEach(story => {
        global.HGReads?.recordStory?.({
          storyId: story?.id,
          personId: person?.id,
          placeId: story?.place_id
        });
      });
    } catch {}

    const name = firstText(person?.name, person?.title, person?.id);
    const category = categoryLabel(person);
    const role = kindLabel(person);
    const shortDesc = firstText(person?.desc, person?.summary);
    const fullText = firstText(person?.popupDesc, person?.popupdesc, person?.wiki, person?.description, shortDesc);
    const showLead = shortDesc && shortDesc !== fullText;
    const works = personWorks(person);
    const places = placesForPerson(person);
    const relations = relationsForPerson(person);
    const observations = observationsForPerson(person);
    const stories = list(global.HGStories?.getByPerson?.(person?.id));
    const education = stringList(person?.education, person?.utdanning, person?.training);
    const materials = stringList(person?.materials, person?.materialer, person?.media, person?.material);
    const themes = stringList(person?.themes, person?.topics, person?.tags).slice(0, 14);
    const sources = sourceEntries(person);
    const birthplace = firstText(person?.birth_place, person?.birthPlace, objectValue(person?.born).place);
    const activePlace = firstText(person?.active_place, person?.activePlace, person?.virkested, person?.base);
    const anchorYear = firstText(person?.year, person?.anchorYear);
    const candidates = imageCandidates(person);
    const initials = initialsFor(person);
    const editorialIllustration = isEditorialIllustration(person);
    const portraitAlt = editorialIllustration ? `Illustrasjon av ${name}` : name;

    const facts = [
      renderFact("Rolle", role),
      renderFact("Liv", lifeLabel(person)),
      renderFact("Fødested", birthplace),
      renderFact("Virkested", activePlace),
      renderFact("Nøkkelår", anchorYear),
      renderFact("Verk", works.length ? String(works.length) : ""),
      renderFact("Steder", places.length ? String(places.length) : "")
    ].filter(Boolean).join("");

    const renderStories = helper("renderStoriesSection");
    const html = `
      <article class="hg-modal hg-person-popup-v2">
        <header class="hg-modal-header hg-person-popup-header">
          <div class="hg-person-popup-heading">
            <p class="hg-person-popup-eyebrow">${escapeHtml(category || "Person")}</p>
            <h2 class="hg-popup-name hg-modal-title">${escapeHtml(name)}</h2>
            ${role ? `<p class="hg-modal-meta">${escapeHtml(role)}</p>` : ""}
          </div>
        </header>

        <div class="hg-modal-body hg-person-popup-body">
          <section class="hg-person-hero">
            <div class="hg-person-hero-media is-missing" data-person-hero-media>
              <img class="hg-person-hero-image" data-person-hero-image alt="${escapeAttr(portraitAlt)}" hidden>
              ${editorialIllustration ? `<small class="hg-person-portrait-kind">Illustrasjon</small>` : ""}
              <div class="hg-person-hero-placeholder">
                <strong>${escapeHtml(initials)}</strong>
                <span>${escapeHtml(name)}</span>
                <small>Portrett ikke registrert</small>
              </div>
            </div>

            <div class="hg-person-overview">
              ${showLead ? `<p class="hg-person-lead">${escapeHtml(shortDesc)}</p>` : ""}
              ${facts ? `<div class="hg-person-facts">${facts}</div>` : ""}
              <div class="hg-person-actions" aria-label="Personhandlinger">
                <button type="button" class="hg-quiz-btn hg-person-quiz-btn" data-quiz="${escapeAttr(person?.id)}" data-person-quiz hidden>Quiz</button>
                <button type="button" class="hg-person-action-btn" data-chat-person="${escapeAttr(person?.id)}">💬 Samtale</button>
                <button type="button" class="hg-person-action-btn" data-note-person="${escapeAttr(person?.id)}">📝 Notat</button>
              </div>
            </div>
          </section>

          ${fullText ? `
            <section class="hg-section hg-person-section hg-person-about-section">
              <h3>Om personen</h3>
              <div class="hg-person-longread">${renderParagraphs(fullText)}</div>
            </section>
          ` : ""}

          ${renderWorks(works)}

          <div class="hg-person-profile-grid">
            ${renderProfileBlock("Utdanning", education)}
            ${renderProfileBlock("Materialer", materials)}
            ${renderProfileBlock("Temaer", themes)}
          </div>

          ${renderPlaces(places)}
          ${renderRelations(relations)}
          ${renderStories ? renderStories(stories) : ""}
          ${renderKnowledge(person)}
          ${renderSources(sources)}
          ${renderObservations(observations)}
        </div>
      </article>
    `;

    makePopup(html, "person-popup person-popup-v2");
    const popup = document.querySelector(".hg-popup.person-popup-v2");
    attachPortrait(popup, candidates);
    configureQuizButton(popup, person?.id);
  }

  function install() {
    if (global[INSTALL_FLAG]) return true;
    if (typeof global.showPersonPopup !== "function") return false;
    if (typeof global.makePopup !== "function") return false;
    const previous = global.showPersonPopup;
    showPersonPopupV2.__previous = previous;
    showPersonPopupV2.__hgPersonPopupV2 = true;
    global.showPersonPopup = showPersonPopupV2;
    global[INSTALL_FLAG] = true;
    return true;
  }

  if (!install() && !global[POLL_FLAG]) {
    global[POLL_FLAG] = true;
    let attempts = 0;
    const timer = global.setInterval(() => {
      attempts += 1;
      if (install() || attempts > 400) {
        global.clearInterval(timer);
        global[POLL_FLAG] = false;
      }
    }, 50);
  }
})(window);
