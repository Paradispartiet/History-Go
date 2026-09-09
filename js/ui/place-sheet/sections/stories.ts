type PlaceLike = Record<string, any>;
type StoryLike = Record<string, any>;

type PlaceSheetStoriesApi = {
  forPlace: (place: PlaceLike) => StoryLike[];
  renderHtml: (stories: StoryLike[]) => string;
  renderPlaceHtml: (place: PlaceLike) => string;
  mount: (container: HTMLElement, place: PlaceLike) => HTMLElement | null;
};

type PlaceSheetStoriesRuntime = Window & typeof globalThis & {
  PEOPLE?: PlaceLike[];
  PLACES?: PlaceLike[];
  HGStories?: { getByPlace?: (placeId: string) => StoryLike[] | null | undefined };
  HGPlaceSheetSections?: Record<string, unknown> & { stories?: PlaceSheetStoriesApi };
  showPersonPopup?: (person: PlaceLike) => unknown;
  showPlacePopup?: (place: PlaceLike) => unknown;
};

const runtime = window as PlaceSheetStoriesRuntime;

function text(value: unknown): string {
  return String(value == null ? "" : value).trim();
}

function escapeHtml(value: unknown): string {
  return String(value == null ? "" : value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function safeHttpUrl(value: unknown): string {
  const candidate = text(value);
  return /^https?:\/\/[^\s]+$/i.test(candidate) ? candidate : "";
}

function people(): PlaceLike[] {
  return Array.isArray(runtime.PEOPLE) ? runtime.PEOPLE : [];
}

function places(): PlaceLike[] {
  return Array.isArray(runtime.PLACES) ? runtime.PLACES : [];
}

function personLabel(id: unknown): string {
  const key = text(id);
  const person = people().find(row => text(row?.id) === key);
  return text(person?.name) || key;
}

function placeLabel(id: unknown): string {
  const key = text(id);
  const place = places().find(row => text(row?.id) === key);
  return text(place?.name || place?.title) || key;
}

function relatedChip(kind: "person" | "place", id: unknown): string {
  const key = text(id);
  if (!key) return "";
  const label = kind === "person" ? personLabel(key) : placeLabel(key);
  return `<button type="button" class="pc-story-chip" data-${kind}="${escapeHtml(key)}">${escapeHtml(label)}</button>`;
}

export function canonicalStoriesForPlace(place: PlaceLike): StoryLike[] {
  const id = text(place?.id);
  if (!id || typeof runtime.HGStories?.getByPlace !== "function") return [];
  try {
    const rows = runtime.HGStories.getByPlace(id);
    return Array.isArray(rows) ? rows.filter(row => Boolean(row && typeof row === "object" && !Array.isArray(row))) : [];
  } catch {
    return [];
  }
}

export function renderCanonicalStoriesHtml(stories: StoryLike[]): string {
  const rows = Array.isArray(stories) ? stories : [];
  if (!rows.length) return "";

  const items = rows.map(story => {
    const fullStory = text(story?.story);
    const summary = text(story?.summary);
    const hasBoth = Boolean(fullStory && summary && summary !== fullStory);
    const bodyText = fullStory || summary;
    const year = text(story?.year);

    const related = [
      ...(Array.isArray(story?.related_people) ? story.related_people.map((id: unknown) => relatedChip("person", id)) : []),
      ...(Array.isArray(story?.related_places) ? story.related_places.map((id: unknown) => relatedChip("place", id)) : [])
    ].filter(Boolean);

    const tags = Array.isArray(story?.tags) ? story.tags.map(text).filter(Boolean) : [];
    const sources = Array.isArray(story?.sources) ? story.sources.slice(0, 3) : [];
    const sourceLinks = sources.map((source: any) => {
      const url = safeHttpUrl(source?.url);
      const title = text(source?.title || source?.author || source?.url);
      if (!title && !url) return "";
      return url
        ? `<a href="${escapeHtml(url)}" target="_blank" rel="noopener" class="pc-story-source">${escapeHtml(title || url)}</a>`
        : `<span class="pc-story-source">${escapeHtml(title)}</span>`;
    }).filter(Boolean).join(" · ");

    return `
      <article class="pc-story" data-story-id="${escapeHtml(story?.id)}">
        <header class="pc-story-header">
          ${year ? `<div class="pc-story-year-badge">${escapeHtml(year)}</div>` : ""}
          <h4 class="pc-story-title">${escapeHtml(story?.title)}</h4>
        </header>
        ${hasBoth ? `<p class="pc-story-lede">${escapeHtml(summary)}</p>` : ""}
        <div class="pc-story-body">${escapeHtml(bodyText)}</div>
        ${related.length ? `<div class="pc-story-related">${related.join("")}</div>` : ""}
        ${tags.length ? `<div class="pc-story-tags">${tags.map(tag => `<span class="pc-story-tag">#${escapeHtml(tag)}</span>`).join("")}</div>` : ""}
        ${sourceLinks ? `<footer class="pc-story-sources">${sourceLinks}</footer>` : ""}
      </article>
    `;
  }).join("");

  return `
    <section class="hg-section hg-section-stories" data-hg-place-sheet-owner="stories">
      <h3>Fortellinger</h3>
      <div class="pc-stories-list">${items}</div>
    </section>
  `;
}

export function renderPlaceStoriesHtml(place: PlaceLike): string {
  return renderCanonicalStoriesHtml(canonicalStoriesForPlace(place));
}

function bindRelatedTargets(container: HTMLElement): void {
  container.querySelectorAll<HTMLElement>("[data-person]").forEach(button => {
    button.onclick = () => {
      const id = text(button.dataset.person);
      const person = people().find(row => text(row?.id) === id);
      if (person && typeof runtime.showPersonPopup === "function") runtime.showPersonPopup(person);
    };
  });
  container.querySelectorAll<HTMLElement>("[data-place]").forEach(button => {
    button.onclick = () => {
      const id = text(button.dataset.place);
      const place = places().find(row => text(row?.id) === id);
      if (place && typeof runtime.showPlacePopup === "function") runtime.showPlacePopup(place);
    };
  });
}

export function mountCanonicalStories(container: HTMLElement, place: PlaceLike): HTMLElement | null {
  const html = renderPlaceStoriesHtml(place);
  container.replaceChildren();
  if (!html) {
    container.hidden = true;
    return null;
  }
  container.hidden = false;
  container.insertAdjacentHTML("beforeend", html);
  bindRelatedTargets(container);
  return container.querySelector<HTMLElement>('[data-hg-place-sheet-owner="stories"]');
}

const storiesApi: PlaceSheetStoriesApi = {
  forPlace: canonicalStoriesForPlace,
  renderHtml: renderCanonicalStoriesHtml,
  renderPlaceHtml: renderPlaceStoriesHtml,
  mount: mountCanonicalStories
};

runtime.HGPlaceSheetSections = {
  ...(runtime.HGPlaceSheetSections || {}),
  stories: storiesApi
};
