type ApiSuccess<T> = {
  ok: true;
  status: number;
  data: T;
};

type ApiFailure = {
  ok: false;
  status: number;
  reason: string;
  detail?: unknown;
};

export type ApiResult<T> = ApiSuccess<T> | ApiFailure;

type FastApiConfig = {
  enabled: boolean;
  baseUrl: string;
  hasBaseUrl: boolean;
};

type SupabaseSession = {
  access_token?: string | null;
};

type SupabaseAuth = {
  getSession?: () => Promise<{
    data?: { session?: SupabaseSession | null };
    error?: unknown;
  }>;
};

type SupabaseClient = {
  auth?: SupabaseAuth;
};

type SupabaseClientRuntime = {
  getClient?: () =>
    | { ok: true; client: SupabaseClient }
    | { ok: false; reason?: string; config?: unknown };
};

type RuntimeConfig = {
  enabled?: boolean;
  baseUrl?: string;
  url?: string;
  apiBaseUrl?: string;
};

type FastApiClientApi = {
  readConfig: () => FastApiConfig;
  health: () => {
    ok: boolean;
    enabled: boolean;
    hasBaseUrl: boolean;
    baseUrl: string;
    reason: string | null;
  };
  request: <T>(path: string, init?: RequestInit) => Promise<ApiResult<T>>;
  getMe: () => Promise<ApiResult<unknown>>;
  upsertProfile: (payload: unknown) => Promise<ApiResult<unknown>>;
  getPublicProfile: (profileId: string) => Promise<ApiResult<unknown>>;
  unpublishProfile: () => Promise<ApiResult<unknown>>;
  listPresets: () => Promise<ApiResult<unknown>>;
  discoverCandidates: (payload: unknown) => Promise<ApiResult<unknown>>;
  createInvite: (payload: unknown) => Promise<ApiResult<unknown>>;
  listInbox: (options?: Record<string, unknown>) => Promise<ApiResult<unknown>>;
  syncInvites: (options?: Record<string, unknown>) => Promise<ApiResult<unknown>>;
  transitionInvite: (
    inviteId: string,
    action: "accept" | "decline" | "cancel" | "complete",
    expectedVersion?: number | null
  ) => Promise<ApiResult<unknown>>;
};

type RuntimeWindow = Window &
  typeof globalThis & {
    HG_SOCIAL_MEET_API?: RuntimeConfig;
    HG_BACKEND_CONFIG?: RuntimeConfig;
    HG_SOCIAL_MEET_BACKEND?: unknown;
    HG_SocialMeetSupabaseClient?: SupabaseClientRuntime;
    HG_SocialMeetFastApiClient?: FastApiClientApi;
  };

const win = window as RuntimeWindow;
const API_PREFIX = "/api/v1";

function trim(value: unknown): string {
  return String(value ?? "").trim();
}

function readMeta(name: string): string {
  try {
    return trim(document.querySelector(`meta[name="${name}"]`)?.getAttribute("content"));
  } catch {
    return "";
  }
}

function readConfig(): FastApiConfig {
  const config = win.HG_SOCIAL_MEET_API ?? win.HG_BACKEND_CONFIG ?? {};
  const baseUrl = trim(
    config.baseUrl ?? config.apiBaseUrl ?? config.url ?? readMeta("hg-backend-url")
  ).replace(/\/+$/, "");
  const mode = trim(win.HG_SOCIAL_MEET_BACKEND).toLowerCase();
  const enabled = config.enabled === true || mode === "fastapi" || Boolean(baseUrl);
  return {
    enabled,
    baseUrl,
    hasBaseUrl: Boolean(baseUrl)
  };
}

async function getAccessToken(): Promise<ApiResult<string>> {
  const resolved = win.HG_SocialMeetSupabaseClient?.getClient?.();
  if (!resolved?.ok) {
    return {
      ok: false,
      status: 401,
      reason: resolved?.reason || "supabase_auth_unavailable",
      detail: resolved?.config
    };
  }

  try {
    const sessionResult = await resolved.client.auth?.getSession?.();
    const token = trim(sessionResult?.data?.session?.access_token);
    if (!token) {
      return {
        ok: false,
        status: 401,
        reason: "not_authenticated",
        detail: sessionResult?.error
      };
    }
    return { ok: true, status: 200, data: token };
  } catch (error) {
    return {
      ok: false,
      status: 401,
      reason: "auth_session_error",
      detail: error
    };
  }
}

function errorReason(payload: unknown, fallback: string): string {
  if (!payload || typeof payload !== "object") return fallback;
  const detail = (payload as { detail?: unknown }).detail;
  if (detail && typeof detail === "object") {
    const code = trim((detail as { code?: unknown }).code);
    if (code) return code;
  }
  return fallback;
}

async function request<T>(path: string, init: RequestInit = {}): Promise<ApiResult<T>> {
  const config = readConfig();
  if (!config.enabled) {
    return { ok: false, status: 503, reason: "backend_not_enabled" };
  }
  if (!config.hasBaseUrl) {
    return { ok: false, status: 503, reason: "missing_backend_url" };
  }

  const tokenResult = await getAccessToken();
  if (!tokenResult.ok) return tokenResult;

  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${tokenResult.data}`);
  headers.set("Accept", "application/json");
  if (init.body !== undefined && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  try {
    const response = await fetch(`${config.baseUrl}${API_PREFIX}${path}`, {
      ...init,
      headers
    });
    const text = await response.text();
    let payload: unknown = null;
    if (text) {
      try {
        payload = JSON.parse(text) as unknown;
      } catch {
        payload = text;
      }
    }

    if (!response.ok) {
      return {
        ok: false,
        status: response.status,
        reason: errorReason(payload, `http_${response.status}`),
        detail: payload
      };
    }

    return {
      ok: true,
      status: response.status,
      data: payload as T
    };
  } catch (error) {
    return {
      ok: false,
      status: 0,
      reason: "network_error",
      detail: error
    };
  }
}

function jsonBody(payload: unknown): Pick<RequestInit, "body" | "headers"> {
  return {
    body: JSON.stringify(payload),
    headers: { "Content-Type": "application/json" }
  };
}

function queryString(options: Record<string, unknown>): string {
  const params = new URLSearchParams();
  Object.entries(options).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    params.set(key, String(value));
  });
  const query = params.toString();
  return query ? `?${query}` : "";
}

const api: FastApiClientApi = {
  readConfig,
  health() {
    const config = readConfig();
    return {
      ok: !config.enabled || config.hasBaseUrl,
      enabled: config.enabled,
      hasBaseUrl: config.hasBaseUrl,
      baseUrl: config.baseUrl,
      reason: !config.enabled
        ? "backend_not_enabled"
        : config.hasBaseUrl
          ? null
          : "missing_backend_url"
    };
  },
  request,
  getMe: () => request("/social-meet/me"),
  upsertProfile: (payload) =>
    request("/social-meet/profile", { method: "PUT", ...jsonBody(payload) }),
  getPublicProfile: (profileId) =>
    request(`/social-meet/profiles/${encodeURIComponent(profileId)}`),
  unpublishProfile: () => request("/social-meet/profile/unpublish", { method: "POST" }),
  listPresets: () => request("/social-meet/spotmeeting/presets"),
  discoverCandidates: (payload) =>
    request("/social-meet/spotmeeting/discovery/context-candidates", {
      method: "POST",
      ...jsonBody(payload)
    }),
  createInvite: (payload) =>
    request("/social-meet/spotmeeting/invites", {
      method: "POST",
      ...jsonBody(payload)
    }),
  listInbox: (options = {}) =>
    request(`/social-meet/spotmeeting/inbox${queryString(options)}`),
  syncInvites: (options = {}) =>
    request(`/social-meet/spotmeeting/sync${queryString(options)}`),
  transitionInvite: (inviteId, action, expectedVersion = null) =>
    request(
      `/social-meet/spotmeeting/invites/${encodeURIComponent(inviteId)}/${action}`,
      {
        method: "POST",
        ...jsonBody({ expectedVersion })
      }
    )
};

win.HG_SocialMeetFastApiClient = api;

export {};
