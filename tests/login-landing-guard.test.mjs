import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { runInNewContext } from "node:vm";

const guardSource = readFileSync("js/auth/require-login.js", "utf8");
const page = readFileSync("login.html", "utf8");
// Automatically cover every root-level app page. Redirect-only shims are
// checked separately so new HTML pages cannot silently skip authentication.
const redirectOnly = new Set(["knowledge-profile.html", "knowledge_by.html"]);
const entries = readdirSync(".").filter(file =>
  file.endsWith(".html") && file !== "login.html" && !redirectOnly.has(file)
);

test("all main app entries require login and remain hidden until verification", () => {
  for (const file of entries) {
    const html = readFileSync(file, "utf8");
    const head = html.slice(0, html.indexOf("</head>"));
    assert.match(head, /html:not\(\.hg-auth-verified\) body/);
    assert.match(head, /src="js\/aha\.js"/);
    assert.match(head, /src="js\/auth\/require-login\.js/);
    assert.equal((html.match(/src="js\/aha\.js"/g) || []).length, 1, file);
  }
  assert.match(readFileSync("js/app.js", "utf8"), /await window\.HGLoginGate\.ready/);
});

test("service worker cannot serve stale unauthenticated HTML from its offline cache", () => {
  const sw = readFileSync("sw.js", "utf8");
  const precache = sw.split("const PRECACHE_URLS = [")[1]?.split("];")[0];
  assert.ok(precache, "precache declaration is present");
  assert.doesNotMatch(precache, /["'](?:\.\/|[^"']*\.html)["']/);
  assert.match(sw, /if \(req\.mode === "navigate"\)/);
  assert.match(sw, /return await fetchWithTimeout\(req, 4500\)/);
  // Check only the navigation branch: JS and CSS assets may legitimately use
  // the static cache, but an HTML navigation must return before asset routing.
  const navigate = sw.slice(
    sw.indexOf('if (req.mode === "navigate")'),
    sw.indexOf("// Same-origin: styr caching per type")
  );
  assert.match(navigate, /event\.respondWith\(\(async \(\) => \{/);
  assert.match(navigate, /\}\)\(\)\);\s*return;/);
  assert.doesNotMatch(navigate, /networkFirst\(req, CACHE_STATIC\)/);
});

test("legacy redirect pages only forward to the guarded knowledge page", () => {
  for (const file of redirectOnly) {
    const html = readFileSync(file, "utf8");
    assert.match(html, /url=knowledge\.html/i, file);
    assert.doesNotMatch(html, /\bHGLoginGate\b/, file);
  }
});

test("login screen uses AHA email link and Google plus optional password, without guest bypass", () => {
  assert.match(page, /id="hgLoginForm"/);
  assert.match(page, /type="password"/);
  assert.match(page, /auth\.signInWithPassword/);
  assert.match(page, /auth\.signInWithOtp/);
  assert.match(page, /auth\.signInWithOAuth/);
  assert.match(page, /Logg inn med Google/);
  assert.match(page, /auth\.resetPasswordForEmail/);
  assert.doesNotMatch(page, /Fortsett som gjest/);
});

async function simulate({ token = false, user = null, error = null } = {}) {
  const redirects = [];
  const classes = new Set();
  const document = {
    createElement: () => ({ textContent: "" }),
    head: { appendChild() {} },
    documentElement: {
      classList: {
        add(value) { classes.add(value); },
        remove(value) { classes.delete(value); }
      }
    },
    addEventListener() {}
  };
  const location = {
    href: "https://paradispartiet.github.io/History-Go/index.html?view=map#/quiz",
    pathname: "/History-Go/index.html",
    search: "?view=map",
    hash: "#/quiz",
    replace(value) { redirects.push(value); }
  };
  const window = {
    addEventListener() {},
    HistoryGoAHAAuth: {
      async getClient() { return { auth: { async getUser() { return { data: { user }, error }; } } }; }
    }
  };
  runInNewContext(guardSource, {
    URL, window, document, location, console,
    localStorage: { getItem() { return token ? '{"access_token":"sample"}' : null; } }
  });
  const allowed = await window.HGLoginGate.ready;
  return { allowed, redirects, classes };
}

test("unauthenticated visitors are redirected to login with deep link preserved", async () => {
  const value = await simulate();
  assert.equal(value.allowed, false);
  assert.equal(value.redirects.length, 1);
  const redirected = new URL(value.redirects[0]);
  assert.equal(redirected.pathname, "/History-Go/login.html");
  assert.equal(redirected.searchParams.get("next"), "/History-Go/index.html?view=map#/quiz");
  assert.ok(!value.classes.has("hg-auth-verified"));
});

test("cached token alone never permits entry if Supabase rejects it", async () => {
  const value = await simulate({ token: true, user: null });
  assert.equal(value.allowed, false);
  assert.equal(value.redirects.length, 1);
  assert.ok(!value.classes.has("hg-auth-verified"));
});

test("a verified, non-anonymous user may enter", async () => {
  const value = await simulate({ token: true, user: { id: "signed-in-user", is_anonymous: false } });
  assert.equal(value.allowed, true);
  assert.deepEqual(value.redirects, []);
  assert.ok(value.classes.has("hg-auth-verified"));
});

test("anonymous accounts and expired tokens cannot unlock the app", async () => {
  const anonymous = await simulate({ token: true, user: { id: "anonymous", is_anonymous: true } });
  assert.equal(anonymous.allowed, false);
  assert.equal(anonymous.redirects.length, 1);
  const expired = await simulate({ token: true, error: { message: "JWT expired" } });
  assert.equal(expired.allowed, false);
  assert.equal(expired.redirects.length, 1);
});
