export type PlaceKnowledgeBuckets = {
  history: Record<string, any>[];
  events: Record<string, any>[];
  historical_news: Record<string, any>[];
  news_notes: Record<string, any>[];
  objects: Record<string, any>[];
};

export type PlaceKnowledgeContext = {
  placeId: string;
  articles: Record<string, any>[];
  main: Record<string, any> | null;
  visibleArticles: Record<string, any>[];
  buckets: PlaceKnowledgeBuckets;
};

type ContextRuntime = Window & typeof globalThis & {
  LEKSIKON_BY_PLACE?: Record<string, Record<string, any>[]>;
  HGLeksikon?: {
    init?: () => Promise<unknown> | unknown;
    leksikonReadRecordsForPlace?: (place: Record<string, any>, placeId: string) => Record<string, any>[];
  };
  HGReads?: { recordLeksikon?: (record: Record<string, any>) => void };
};

const runtime = window as ContextRuntime;
const cache = new Map<string, Promise<PlaceKnowledgeContext>>();

function text(value: unknown): string {
  return String(value == null ? "" : value).trim();
}

function list<T = Record<string, any>>(value: unknown): T[] {
  return Array.isArray(value) ? value.filter(Boolean) as T[] : [];
}

function strings(value: unknown): string[] {
  return list<unknown>(value).map(text).filter(Boolean);
}

function mainArticle(articles: Record<string, any>[], place: Record<string, any>): Record<string, any> | null {
  const rows = list(articles);
  const placeName = text(place?.name).toLowerCase();
  return rows.find(article => text(article?.title || article?.name).toLowerCase() === placeName)
    || rows.find(article => /hoved|main|primary/.test([article?.id, article?.type, article?.kind].map(value => text(value).toLowerCase()).join(" ")))
    || rows[0]
    || null;
}

function visibleArticlesForPlace(articles: Record<string, any>[], main: Record<string, any> | null): Record<string, any>[] {
  const rows = list(articles);
  if (main?.suppress_untitled_legacy_articles !== true) return rows;
  return rows.filter(article => article === main || Boolean(text(article?.title || article?.name || article?.label)));
}

function classifyArticle(article: Record<string, any>): keyof PlaceKnowledgeBuckets {
  const signals = [
    article?.id, article?.title, article?.name, article?.type, article?.kind,
    article?.category, article?.popupDesc, article?.summary?.one_liner,
    ...strings(article?.tags), ...strings(article?.summary?.themes)
  ].map(value => text(value).toLowerCase()).join(" ");
  const has = (terms: string[]) => terms.some(term => signals.includes(term));
  if (has(["historical_news", "gamle_nyheter", "gamle nyheter", "avisnotis", "newspaper", "moralpanikk", "old_news"])) return "historical_news";
  if (has(["news_note", "nyere_notis", "nyere notis", "incident", "brann", "politi", "drap"])) return "news_notes";
  if (has(["arrangement", "event", "competition", "sports_event", "stevne", "rekord", "resultat", "statistikk"])) return "events";
  if (has(["object", "objekt", "artifact", "anlegg", "facility", "installation", "infrastructure", "dekke"])) return "objects";
  return "history";
}

async function loadArticles(placeId: string): Promise<Record<string, any>[]> {
  if (Object.prototype.hasOwnProperty.call(runtime.LEKSIKON_BY_PLACE || {}, placeId)) {
    return list(runtime.LEKSIKON_BY_PLACE?.[placeId]);
  }
  try { await runtime.HGLeksikon?.init?.(); } catch {}
  return list(runtime.LEKSIKON_BY_PLACE?.[placeId]);
}

function recordReads(place: Record<string, any>, context: PlaceKnowledgeContext): void {
  if (!context.visibleArticles.length || typeof runtime.HGLeksikon?.leksikonReadRecordsForPlace !== "function") return;
  try {
    runtime.HGLeksikon.leksikonReadRecordsForPlace(place, context.placeId)
      .forEach(record => runtime.HGReads?.recordLeksikon?.(record));
  } catch {}
}

export function resolvePlaceKnowledgeContext(place: Record<string, any>): Promise<PlaceKnowledgeContext> {
  const placeId = text(place?.id);
  if (!placeId) return Promise.resolve({
    placeId: "",
    articles: [],
    main: null,
    visibleArticles: [],
    buckets: { history: [], events: [], historical_news: [], news_notes: [], objects: [] }
  });
  const existing = cache.get(placeId);
  if (existing) return existing;

  const pending = (async () => {
    const articles = await loadArticles(placeId);
    const main = mainArticle(articles, place);
    const visibleArticles = visibleArticlesForPlace(articles, main);
    const buckets: PlaceKnowledgeBuckets = { history: [], events: [], historical_news: [], news_notes: [], objects: [] };
    visibleArticles.filter(article => article !== main).forEach(article => {
      buckets[classifyArticle(article)].push(article);
    });
    const context = { placeId, articles, main, visibleArticles, buckets };
    recordReads(place, context);
    return context;
  })();
  cache.set(placeId, pending);
  return pending;
}

export function clearPlaceKnowledgeContext(placeId?: string): void {
  const id = text(placeId);
  if (id) cache.delete(id);
  else cache.clear();
}
