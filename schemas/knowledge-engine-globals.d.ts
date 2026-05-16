type HGKnowledgeEngineReport = {
  ok?: boolean;
  generatedAt?: string;
  summary?: Record<string, unknown>;
  subjects?: Record<string, unknown>;
  recommendations?: unknown[];
  sourceState?: Record<string, unknown>;
  healthReport?: unknown;
  [key: string]: unknown;
};

type HGKnowledgeEngineApi = {
  run?: (opts?: Record<string, unknown>) => Promise<HGKnowledgeEngineReport>;
  readState?: () => unknown;
  analyzeSubjects?: (opts?: Record<string, unknown>) => Promise<unknown>;
  buildRecommendations?: (analysis: unknown) => unknown[];
  [key: string]: unknown;
};

declare global {
  interface Window {
    HGKnowledgeEngine?: HGKnowledgeEngineApi;
    hgKnowledgeReport?: HGKnowledgeEngineReport;
  }
}

export {};
