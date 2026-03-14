(function () {
  function escapeHtml(text) {
    return String(text ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  function shorten(text, max = 220) {
    if (!text) return "";
    if (text.length <= max) return text;
    return text.slice(0, max) + "...";
  }

  function labelForType(type) {
    const types = window.HGStoryTypes?.types || [];
    const match = types.find(item => item.id === type);
    return match?.label || type;
  }

  function createStoryCard(story) {
    const el = document.createElement("div");
    el.className = "hg-story-card";

    const year = story.year ? `<div class="hg-story-year">${escapeHtml(story.year)}</div>` : "";

    el.innerHTML = `
      <div class="hg-story-header">
        <div class="hg-story-type">${escapeHtml(labelForType(story.type))}</div>
        ${year}
      </div>
      <div class="hg-story-title">${escapeHtml(story.title)}</div>
      <div class="hg-story-text">${escapeHtml(shorten(story.story))}</div>
      <div class="hg-story-footer">
        <button type="button" class="hg-story-more">Les mer</button>
        <div class="hg-story-source">${escapeHtml(story.sources?.[0] ?? "")}</div>
      </div>
    `;

    const btn = el.querySelector(".hg-story-more");
    btn.addEventListener("click", () => {
      const text = el.querySelector(".hg-story-text");

      if (text.dataset.expanded) {
        text.textContent = shorten(story.story);
        text.dataset.expanded = "";
        btn.textContent = "Les mer";
      } else {
        text.textContent = story.story;
        text.dataset.expanded = "true";
        btn.textContent = "Skjul";
      }
    });

    return el;
  }

  function groupStories(stories) {
    const groups = {};

    for (const story of stories) {
      const type = story.type || "other";
      if (!groups[type]) groups[type] = [];
      groups[type].push(story);
    }

    return groups;
  }

  function renderGroups(groups, container) {
    container.innerHTML = "";

    for (const type of Object.keys(groups)) {
      const block = document.createElement("div");
      block.className = "hg-story-group";

      const title = document.createElement("div");
      title.className = "hg-story-group-title";
      title.textContent = labelForType(type);
      block.appendChild(title);

      groups[type].forEach(story => {
        block.appendChild(createStoryCard(story));
      });

      container.appendChild(block);
    }
  }

  function renderPlaceStories(placeId, container) {
    if (!container) return;

    const stories = window.HGStories?.getByPlace(placeId) || [];
    if (!stories.length) {
      container.innerHTML = `<div class="hg-no-stories">Ingen historier ennå</div>`;
      return;
    }

    renderGroups(groupStories(stories), container);
  }

  function renderPersonStories(personId, container) {
    if (!container) return;

    const stories = window.HGStories?.getByPerson(personId) || [];
    if (!stories.length) {
      container.innerHTML = `<div class="hg-no-stories">Ingen historier ennå</div>`;
      return;
    }

    renderGroups(groupStories(stories), container);
  }

  window.HGStoryUI = {
    renderPlaceStories,
    renderPersonStories,
    createStoryCard,
    groupStories,
    shorten
  };
})();
