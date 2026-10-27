/* History Go: fail-closed login gate for all main app entry pages. */
(() => {
  "use strict";
  const project = "wshmybqyksrwkawqleiz";
  const tokenKey = "sb-" + project + "-auth-token";
  const loginURL = new URL("login.html", location.href);

  function sendToLogin() {
    if (location.pathname.endsWith("/login.html")) return;
    loginURL.searchParams.set("next", location.pathname + location.search + location.hash);
    location.replace(loginURL.href);
  }

  // Hide content before layout, including on deep-linked pages.
  const style = document.createElement("style");
  style.textContent = "html.hg-auth-locked body { visibility: hidden !important; }";
  document.head.appendChild(style);
  document.documentElement.classList.add("hg-auth-locked");

  async function verify() {
    try {
      const client = await window.HistoryGoAHAAuth?.getClient?.();
      if (!client) throw new Error("No Supabase auth client");
      const { data, error } = await client.auth.getUser();
      if (error || !data?.user?.id || data.user.is_anonymous === true) {
        sendToLogin();
        return false;
      }
      document.documentElement.classList.remove("hg-auth-locked");
      document.documentElement.classList.add("hg-auth-verified");
      return true;
    } catch (error) {
      console.warn("[HG login gate] Session could not be verified", error);
      sendToLogin();
      return false;
    }
  }

  const gate = { allowed: false, ready: Promise.resolve(false), verify };
  window.HGLoginGate = gate;

  // Local development and CI browser tests are intentionally not production.
  // Public History Go URLs always require real Supabase authentication.
  if (location.hostname === "localhost" || location.hostname === "127.0.0.1") {
    document.documentElement.classList.remove("hg-auth-locked");
    document.documentElement.classList.add("hg-auth-verified");
    gate.allowed = true;
    gate.ready = Promise.resolve(true);
    return;
  }

  let hasToken = false;
  try { hasToken = Boolean(localStorage.getItem(tokenKey)); } catch { /* fail closed */ }
  if (!hasToken) {
    sendToLogin();
    return;
  }

  gate.ready = verify().then(allowed => {
    gate.allowed = allowed;
    return allowed;
  });

  // Browser back/forward cache and logout from another tab must not reopen content.
  window.addEventListener("pageshow", event => {
    if (event.persisted) {
      document.documentElement.classList.add("hg-auth-locked");
      document.documentElement.classList.remove("hg-auth-verified");
      gate.ready = verify().then(allowed => (gate.allowed = allowed, allowed));
    }
  });
  window.addEventListener("storage", event => {
    if (event.key === tokenKey && !event.newValue) sendToLogin();
  });

  document.addEventListener("click", async event => {
    const button = event.target instanceof Element
      ? event.target.closest("button[data-hg-sign-out]") : null;
    if (!(button instanceof HTMLButtonElement)) return;
    event.preventDefault();
    if (button.disabled) return;
    button.disabled = true;
    try {
      const client = await window.HistoryGoAHAAuth?.getClient?.();
      if (!client) throw new Error("Auth client unavailable");
      const { error } = await client.auth.signOut();
      if (error) throw error;
      sendToLogin();
    } catch (error) {
      console.warn("[HG login gate] Logout failed", error);
      button.disabled = false;
      alert("Kunne ikke logge ut. Prøv igjen.");
    }
  });
})();
