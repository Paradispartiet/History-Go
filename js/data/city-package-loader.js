// js/data/city-package-loader.js
// Central registry loader for city packages declared in data/cities/manifest.json.
(function installCityPackageLoader() {
  "use strict";

  if (window.HGCityPackages) return;

  const REPO_NAME = "History-Go";
  const isGitHubPages = location.hostname.includes("github.io");
  const BASE = isGitHubPages ? `/${REPO_NAME}/` : "/";
  let packagePromise = null;

  const normalizeRows = (data, key) => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.[key])) return data[key];
    return [];
  };

  const normalizePath = (value, prefix = "data/") => {
    const raw = String(value || "").trim().replace(/^\.?\//, "");
    if (!raw) return "";
    return raw.startsWith("data/") ? raw : `${prefix}${raw}`;
  };

  async function fetchJSON(path) {
    const res = await fetch(BASE + path, { cache: "default" });
    if (!res.ok) throw new Error(`City package fetch failed ${res.status}: ${path}`);
    return res.json();
  }

  async function loadPackages() {
    if (packagePromise) return packagePromise;

    packagePromise = (async () => {
      const registry = await fetchJSON("data/cities/manifest.json");
      const cityEntries = Array.isArray(registry?.cities) ? registry.cities : [];
      const out = { places: [], people: [], relations: [], cities: [] };

      for (const entry of cityEntries) {
        const manifestPath = normalizePath(entry?.manifest, "data/cities/");
        if (!manifestPath) continue;

        const manifest = await fetchJSON(manifestPath);
        out.cities.push(manifest);

        const placeFiles = Array.isArray(manifest?.places?.files) ? manifest.places.files : [];
        for (const file of placeFiles) {
          const data = await fetchJSON(normalizePath(file));
          out.places.push(...normalizeRows(data, "places"));
        }

        const peopleFile = normalizePath(manifest?.people?.file);
        if (peopleFile) {
          const data = await fetchJSON(peopleFile);
          out.people.push(...normalizeRows(data, "people"));
        }

        const relationFile = normalizePath(manifest?.relations?.file);
        if (relationFile) {
          const data = await fetchJSON(relationFile);
          out.relations.push(...normalizeRows(data, "relations"));
        }
      }

      return out;
    })().catch((error) => {
      packagePromise = null;
      console.warn("[HGCityPackages] load failed", error);
      return { places: [], people: [], relations: [], cities: [] };
    });

    return packagePromise;
  }

  function mergeById(base, extra) {
    const map = new Map();
    for (const row of [...(Array.isArray(base) ? base : []), ...(Array.isArray(extra) ? extra : [])]) {
      const id = String(row?.id || "").trim();
      if (!id) continue;
      if (!map.has(id)) map.set(id, row);
    }
    return [...map.values()];
  }

  async function applyPlaces() {
    if (!Array.isArray(window.PLACES)) return false;
    const pkg = await loadPackages();
    if (!pkg.places.length) return false;

    const merged = mergeById(window.PLACES, pkg.places);
    if (merged.length === window.PLACES.length) return true;

    window.PLACES = merged;
    window.HGPlaces = merged;
    window.allPlaces = merged;
    window.HGMap?.setPlaces?.(merged);
    window.HGMap?.refreshMarkers?.();
    window.dispatchEvent(new CustomEvent("hg:city-packages-places-ready", {
      detail: { added: pkg.places.length, total: merged.length }
    }));
    return true;
  }

  async function applyPeople() {
    if (!Array.isArray(window.PEOPLE)) return false;
    const pkg = await loadPackages();
    if (!pkg.people.length) return false;

    window.PEOPLE = mergeById(window.PEOPLE, pkg.people);
    window.dispatchEvent(new CustomEvent("hg:city-packages-people-ready", {
      detail: { added: pkg.people.length, total: window.PEOPLE.length }
    }));
    return true;
  }

  async function applyRelations() {
    if (!Array.isArray(window.RELATIONS)) return false;
    const pkg = await loadPackages();
    if (!pkg.relations.length) return false;

    window.RELATIONS = mergeById(window.RELATIONS, pkg.relations);
    window.HG_REL_INDEX = null;
    window.dispatchEvent(new CustomEvent("hg:city-packages-relations-ready", {
      detail: { added: pkg.relations.length, total: window.RELATIONS.length }
    }));
    return true;
  }

  async function applyAll() {
    await Promise.all([applyPlaces(), applyPeople(), applyRelations()]);
  }

  window.HGCityPackages = { loadPackages, applyPlaces, applyPeople, applyRelations, applyAll };

  window.addEventListener("hg:criticalReady", applyPlaces);
  window.addEventListener("hg:places-ready", applyPlaces);
  window.addEventListener("hg:people-ready", applyPeople);
  window.addEventListener("hg:relations-ready", applyRelations);
  window.addEventListener("hg:backgroundReady", applyAll);

  loadPackages().then(applyAll);
})();
