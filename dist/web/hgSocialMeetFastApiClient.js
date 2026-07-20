(() => {
  // HGSocialMeetFastApiClient.ts
  var win = window;
  var API_PREFIX = "/api/v1";
  function trim(value) {
    return String(value != null ? value : "").trim();
  }
  function readMeta(name) {
    var _a;
    try {
      return trim((_a = document.querySelector(`meta[name="${name}"]`)) == null ? void 0 : _a.getAttribute("content"));
    } catch {
      return "";
    }
  }
  function readConfig() {
    var _a, _b, _c, _d, _e;
    const config = (_b = (_a = win.HG_SOCIAL_MEET_API) != null ? _a : win.HG_BACKEND_CONFIG) != null ? _b : {};
    const baseUrl = trim(
      (_e = (_d = (_c = config.baseUrl) != null ? _c : config.apiBaseUrl) != null ? _d : config.url) != null ? _e : readMeta("hg-backend-url")
    ).replace(/\/+$/, "");
    const mode = trim(win.HG_SOCIAL_MEET_BACKEND).toLowerCase();
    const enabled = config.enabled === true || mode === "fastapi" || Boolean(baseUrl);
    return {
      enabled,
      baseUrl,
      hasBaseUrl: Boolean(baseUrl)
    };
  }
  async function getAccessToken() {
    var _a, _b, _c, _d, _e, _f;
    const resolved = (_b = (_a = win.HG_SocialMeetSupabaseClient) == null ? void 0 : _a.getClient) == null ? void 0 : _b.call(_a);
    if (!(resolved == null ? void 0 : resolved.ok)) {
      return {
        ok: false,
        status: 401,
        reason: (resolved == null ? void 0 : resolved.reason) || "supabase_auth_unavailable",
        detail: resolved == null ? void 0 : resolved.config
      };
    }
    try {
      const sessionResult = await ((_d = (_c = resolved.client.auth) == null ? void 0 : _c.getSession) == null ? void 0 : _d.call(_c));
      const token = trim((_f = (_e = sessionResult == null ? void 0 : sessionResult.data) == null ? void 0 : _e.session) == null ? void 0 : _f.access_token);
      if (!token) {
        return {
          ok: false,
          status: 401,
          reason: "not_authenticated",
          detail: sessionResult == null ? void 0 : sessionResult.error
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
  function errorReason(payload, fallback) {
    if (!payload || typeof payload !== "object") return fallback;
    const detail = payload.detail;
    if (detail && typeof detail === "object") {
      const code = trim(detail.code);
      if (code) return code;
    }
    return fallback;
  }
  async function request(path, init = {}) {
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
    if (init.body !== void 0 && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }
    try {
      const response = await fetch(`${config.baseUrl}${API_PREFIX}${path}`, {
        ...init,
        headers
      });
      const text = await response.text();
      let payload = null;
      if (text) {
        try {
          payload = JSON.parse(text);
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
        data: payload
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
  function jsonBody(payload) {
    return {
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" }
    };
  }
  function queryString(options) {
    const params = new URLSearchParams();
    Object.entries(options).forEach(([key, value]) => {
      if (value === void 0 || value === null || value === "") return;
      params.set(key, String(value));
    });
    const query = params.toString();
    return query ? `?${query}` : "";
  }
  var api = {
    readConfig,
    health() {
      const config = readConfig();
      return {
        ok: !config.enabled || config.hasBaseUrl,
        enabled: config.enabled,
        hasBaseUrl: config.hasBaseUrl,
        baseUrl: config.baseUrl,
        reason: !config.enabled ? "backend_not_enabled" : config.hasBaseUrl ? null : "missing_backend_url"
      };
    },
    request,
    getMe: () => request("/social-meet/me"),
    upsertProfile: (payload) => request("/social-meet/profile", { method: "PUT", ...jsonBody(payload) }),
    getPublicProfile: (profileId) => request(`/social-meet/profiles/${encodeURIComponent(profileId)}`),
    unpublishProfile: () => request("/social-meet/profile/unpublish", { method: "POST" }),
    listPresets: () => request("/social-meet/spotmeeting/presets"),
    discoverCandidates: (payload) => request("/social-meet/spotmeeting/discovery/context-candidates", {
      method: "POST",
      ...jsonBody(payload)
    }),
    createInvite: (payload) => request("/social-meet/spotmeeting/invites", {
      method: "POST",
      ...jsonBody(payload)
    }),
    listInbox: (options = {}) => request(`/social-meet/spotmeeting/inbox${queryString(options)}`),
    syncInvites: (options = {}) => request(`/social-meet/spotmeeting/sync${queryString(options)}`),
    transitionInvite: (inviteId, action, expectedVersion = null) => request(
      `/social-meet/spotmeeting/invites/${encodeURIComponent(inviteId)}/${action}`,
      {
        method: "POST",
        ...jsonBody({ expectedVersion })
      }
    )
  };
  win.HG_SocialMeetFastApiClient = api;
})();
