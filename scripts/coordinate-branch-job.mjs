#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const ROOT = process.cwd();
const VERIFIED_AT = "2026-08-19";
const REPORT_DIR = path.join(ROOT, "reports/sprakatlas-place-links-v1");
const readText = rel => fs.readFileSync(path.join(ROOT, rel), "utf8");
const readJson = rel => JSON.parse(readText(rel));
const writeJson = (rel, value) => {
  const target = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, JSON.stringify(value, null, 2) + "\n", "utf8");
};
const writeText = (rel, value) => {
  const target = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, value, "utf8");
};
const unique = values => [...new Set((Array.isArray(values) ? values : []).map(value => String(value ?? "").trim()).filter(Boolean))];
const slug = value => String(value ?? "").trim().toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9_-]+/g, "_").replace(/^_+|_+$/g, "");
const replaceOnce = (source, needle, replacement, label) => {
  if (!source.includes(needle)) throw new Error(`Patch needle missing: ${label}`);
  return source.replace(needle, replacement);
};
const appendUnique = (source, marker, block) => source.includes(marker) ? source : source.replace(/\s*$/, "\n\n" + block.trim() + "\n");

fs.mkdirSync(REPORT_DIR, { recursive: true });
execFileSync("npm", ["run", "build:tools"], { cwd: ROOT, stdio: ["ignore", fs.openSync(path.join(REPORT_DIR, "build-tools.log"), "w"), fs.openSync(path.join(REPORT_DIR, "build-tools.err.log"), "w")] });

const placeSpecs = [
  {
    id: "bergen",
    name: "Bergen",
    profileName: "Bergen",
    addressQuery: "Rådhusgaten 10 5014 Bergen",
    path: "data/places/by/vestland/bergen/bergen.json",
    languagePath: "data/leksikon/sprak/places/europe/norway/vestland/bergen/bergen.json",
    fylke: "vestland",
    kommune: "Bergen",
    r: 1600,
    desc: "Bergen er et sammenhengende by- og tettstedsområde i Vestland og det sentrale urbane tyngdepunktet i Bergen kommune. History Go bruker Bergen som et område-Place; markøren er et representativt sentrumsanker, ikke en avgrensning av hele tettstedet eller kommunen.",
    popupDesc: "Bergen behandles i History Go som et område, ikke som ett enkelt bygg eller punkt. Det gjør at stedbundet kunnskap om blant annet byutvikling, språk og lokale miljøer kan knyttes til Bergen uten å gjøre rådhuset eller en annen institusjon til eier av hele byen. Det konkrete kartpunktet er derfor bare et representativt sentrumsanker. Bergen kommune og Bergen tettsted er heller ikke identiske geografiske størrelser; denne recorden skal leses som inngang til det urbane Bergen, mens konkrete bygg, gater, parker og institusjoner fortsatt har egne canonical Places.",
    sources: [
      ["Store norske leksikon – Bergen (tettsted)", "https://snl.no/Bergen_-_tettsted"],
      ["Bergen kommune – kontakt / Rådhusgaten 10", "https://www.bergen.kommune.no/omkommunen/avdelinger/byradsleders-avdeling-stab/kontakt"]
    ]
  },
  {
    id: "valle_setesdal",
    name: "Valle i Setesdal",
    profileName: "Valle i Setesdal",
    addressQuery: "Kjellebergsvegen 1 4747 Valle",
    path: "data/places/by/agder/valle/valle_setesdal.json",
    languagePath: "data/leksikon/sprak/places/europe/norway/agder/valle/valle_setesdal.json",
    fylke: "agder",
    kommune: "Valle",
    r: 750,
    desc: "Valle er administrasjonssenter og tettstedsområde i Valle kommune i øvre Setesdal. History Go bruker sentrum som område-Place, adskilt fra konkrete steder som Valle kyrkje, Rygnestadtunet og andre enkelt-Places i kommunen.",
    popupDesc: "Valle ligger i øvre Setesdal og fungerer som administrasjonssenter i Valle kommune. I History Go er Valle et områdeanker for selve sentrums- og tettstedsmiljøet, ikke et synonym for hele kommunen. Det skillet er viktig fordi kommunen rommer mange separate steder, bygder, kulturminner og naturmiljøer som beholder sine egne canonical Place-identiteter. Område-Place-et gjør det samtidig mulig å knytte lokal kunnskap, blant annet det dokumenterte talemålet i Valle og Setesdal, til riktig geografisk nivå uten å legge dialekten på én kirke eller institusjon.",
    sources: [
      ["Store norske leksikon – Valle", "https://snl.no/Valle"],
      ["Store norske leksikon – Setesdal", "https://snl.no/Setesdal"],
      ["Valle kommune", "https://www.valle.kommune.no/"]
    ]
  },
  {
    id: "narvik",
    name: "Narvik",
    profileName: "Narvik",
    addressQuery: "Kongens gate 45 8514 Narvik",
    path: "data/places/by/nordland/narvik/narvik.json",
    languagePath: "data/leksikon/sprak/places/europe/norway/nordland/narvik/narvik.json",
    fylke: "nordland",
    kommune: "Narvik",
    r: 1300,
    desc: "Narvik er et tettsted og byområde i Narvik kommune i Nordland, ved Ofotfjorden. History Go bruker Narvik som område-Place; rådhuspunktet er et representativt sentrumsanker og ikke en påstått tettstedsgrense.",
    popupDesc: "Narvik er det sentrale by- og tettstedsområdet i Narvik kommune ved Ofotfjorden. History Go modellerer Narvik som et område slik at byomfattende kunnskap kan ha en geografisk eier uten å bli lagt på ett bestemt bygg. Det er samtidig viktig å skille området fra hele Narvik kommune og fra konkrete canonical Places i og rundt byen. Kartmarkøren bruker et dokumentert sentrumsanker ved rådhuset for navigasjon; den skal ikke tolkes som sentrum av en eksakt polygon eller som grensen for tettstedet.",
    sources: [
      ["Store norske leksikon – Narvik (tettsted)", "https://snl.no/Narvik_-_tettsted"],
      ["Narvik kommune", "https://www.narvik.kommune.no/"]
    ]
  },
  {
    id: "aal",
    name: "Ål",
    profileName: "Ål",
    addressQuery: "Torget 1 3570 Ål",
    path: "data/places/by/buskerud/aal/aal.json",
    languagePath: "data/leksikon/sprak/places/europe/norway/buskerud/aal/aal.json",
    fylke: "buskerud",
    kommune: "Ål",
    r: 850,
    desc: "Ål er et tettsted og administrasjonssenter i Ål kommune i Hallingdal, Buskerud. History Go bruker Ål som område-Place; kommunehuset på Torget er et representativt sentrumsanker, ikke en avgrensning av tettstedet.",
    popupDesc: "Ål er tettstedet og administrasjonssenteret i Ål kommune i øvre Hallingdal. Store norske leksikon beskriver at størstedelen av tettstedet ligger på nordsiden av Hallingdalselva. History Go bruker Ål som et områdeanker slik at stedbundet kunnskap som gjelder tettstedet og det lokale talemålet kan knyttes til riktig geografisk nivå. Konkrete bygninger og institusjoner beholder egne Place-identiteter. Kartpunktet ved kommunehuset på Torget er bare et representativt navigasjonsanker og skal ikke forstås som tettstedsgrensen.",
    sources: [
      ["Store norske leksikon – Ål (tettstad)", "https://snl.no/%C3%85l_-_tettstad"],
      ["Ål kommune – kontakt oss", "https://www.aal.kommune.no/kontakt-oss/"]
    ]
  }
];

function coordinateCandidate(spec) {
  const stdout = execFileSync("node", ["dist/tools/address-first-coordinate-finder.mjs", "--address", spec.addressQuery], { cwd: ROOT, encoding: "utf8" });
  writeText(`reports/sprakatlas-place-links-v1/geonorge-${spec.id}.json`, stdout.endsWith("\n") ? stdout : stdout + "\n");
  const candidate = JSON.parse(stdout);
  if (!candidate?.ok || candidate?.status !== "verified_candidate" || !candidate?.coordinate) {
    throw new Error(`${spec.id}: Geonorge address candidate not verified_candidate: ${candidate?.status} ${candidate?.reason}`);
  }
  return candidate;
}

const atlas = readJson("data/leksikon/sprak/norge_atlas_v1.json");
const localProfiles = Array.isArray(atlas.local_varieties) ? atlas.local_varieties : [];
const profilesByName = new Map(localProfiles.map(row => [String(row?.name || "").trim(), row]));
const languageManifest = readJson("data/leksikon/sprak/manifest.json");
const placeManifest = readJson("data/places/manifest.json");

for (const spec of placeSpecs) {
  const profile = profilesByName.get(spec.profileName);
  if (!profile) throw new Error(`${spec.id}: atlas profile named ${spec.profileName} missing`);
  if (profile.profile_status !== "evidence_materialized") throw new Error(`${spec.id}: profile is not evidence_materialized`);
  if (!Array.isArray(profile.feature_evidence) || profile.feature_evidence.length < 4) throw new Error(`${spec.id}: profile lacks >=4 evidence rows`);

  const candidate = coordinateCandidate(spec);
  const c = candidate.coordinate;
  const place = {
    id: spec.id,
    name: spec.name,
    placeScope: "area",
    lat: c.lat,
    lon: c.lon,
    r: spec.r,
    coordType: "district_anchor",
    coordStatus: "verified_geometry",
    coordNote: `Offisielt Geonorge-adressepunkt for ${spec.name} sitt kommunale sentrumsanker (${c.address.street} ${c.address.number}) brukes som representativt områdeanker. Punktet er ikke en påstått tettsteds-, by- eller kommunegrense.`,
    category: "by",
    fylke: spec.fylke,
    kommune: spec.kommune,
    desc: spec.desc,
    popupDesc: spec.popupDesc,
    tags: unique(["by", "tettsted", "område", slug(spec.name), slug(spec.kommune)]),
    externalLinks: spec.sources.map(([label, url]) => ({ type: url.includes("kommune") ? "official" : "reference", label, url, verifiedAt: VERIFIED_AT })),
    locatorType: "linear_area",
    sourceProvider: "official_address",
    sourceObjectId: candidate.sourceObjectId,
    address: c.address,
    geocodeAccuracy: "semantic_anchor",
    coordRole: "area_anchor",
    coordSource: "geonorge_adresser_v1",
    coordSourceId: candidate.sourceObjectId,
    coordSourceUrl: candidate.sourceUrl,
    coordVerifiedAt: VERIFIED_AT
  };
  writeJson(spec.path, place);

  const profileSources = (Array.isArray(profile.sources) ? profile.sources : []).map(source => String(source?.url || "").trim()).filter(Boolean);
  const dialectArea = spec.id === "bergen" ? "Bergensk bytalemål – lokal og sosial variasjon"
    : spec.id === "valle_setesdal" ? "Setesdalsmål i Valle – tradisjon og endring"
    : spec.id === "narvik" ? "Narvik bymål – lokalt talemål i Ofoten"
    : "Ål i Hallingdal – lokalt talemål med regional ramme";
  const entries = profile.feature_evidence.slice(0, 4).map((evidence, index) => {
    const urls = unique([...(Array.isArray(evidence.source_urls) ? evidence.source_urls : []), ...profileSources]).slice(0, Math.max(2, unique([...(Array.isArray(evidence.source_urls) ? evidence.source_urls : []), ...profileSources]).length));
    if (urls.length < 2) throw new Error(`${spec.id}/${evidence.id}: needs >=2 source URLs for Place language evidence`);
    const timeScope = String(evidence.time_scope || "").trim();
    const status = timeScope === "historical" ? "historical" : timeScope === "traditional" ? "older" : "current";
    return {
      id: `${spec.id}_${slug(evidence.id || evidence.label || index + 1)}`,
      term: String(evidence.label || `Dokumentert talemålstrekk ${index + 1}`).trim(),
      type: "dialekttrekk",
      layer: "dialect",
      meaning: String(evidence.claim || "").trim(),
      dialect_area: dialectArea,
      status,
      usage: "Kildebelagt trekk eller endringsmønster i den lokale atlasprofilen. Oppføringen beskriver dokumentert talemål og skal ikke leses som at alle innbyggere bruker trekket, eller at trekket er unikt for stedet.",
      context: String(profile.variation_note || profile.summary || "").trim(),
      linked_to: { kind: "place", id: spec.id },
      tags: unique(["dialekt", "språkatlas", slug(spec.name), String(evidence.kind || "").trim(), timeScope]),
      sources: urls.map((url, sourceIndex) => ({ label: sourceIndex === 0 ? "Kilde til belegget" : `Profilkilde ${sourceIndex}`, url }))
    };
  });
  const article = {
    place_id: spec.id,
    title: `Språkleksikon: ${spec.name}`,
    verified_at: String(profile.evidence_last_verified || VERIFIED_AT),
    dialect_area: dialectArea,
    notes: "Område-Place-et er navigasjonsanker for en forskningsbasert lokal talemålsprofil. Det betyr ikke at alle på stedet snakker likt, og regionale trekk skal ikke fremstilles som unike lokale kjennetegn uten direkte lokalt belegg.",
    entries,
    atlas_region_ids: unique([profile.macro_region_id, profile.region_id]),
    atlas_local_ids: [profile.id]
  };
  writeJson(spec.languagePath, article);

  const manifestPlacePath = spec.path.replace(/^data\//, "");
  if (!placeManifest.files.includes(manifestPlacePath)) placeManifest.files.push(manifestPlacePath);
  languageManifest.place_files[spec.id] = spec.languagePath;
}
writeJson("data/places/manifest.json", placeManifest);
writeJson("data/leksikon/sprak/manifest.json", languageManifest);

// Connect existing area-owned dialect articles back to the local atlas where the relation is already documented.
const existingAtlasLinks = {
  sagene: "oslo_local_speech",
  frogner: "oslo_local_speech",
  vaalerenga: "oslo_local_speech",
  holmlia: "oslo_local_speech",
  svartlamon_trondheim: "trondheim_local_speech"
};
for (const [placeId, localId] of Object.entries(existingAtlasLinks)) {
  const rel = languageManifest.place_files[placeId];
  if (!rel) throw new Error(`${placeId}: language manifest entry missing`);
  const article = readJson(rel);
  article.atlas_local_ids = unique([...(Array.isArray(article.atlas_local_ids) ? article.atlas_local_ids : []), localId]);
  writeJson(rel, article);
}

// Språkleksikon article schema: canonical atlas-local navigation metadata.
const languageSchema = readJson("data/leksikon/sprak/schema_v2.json");
languageSchema.properties.atlas_local_ids = {
  type: "array",
  items: { type: "string", minLength: 1 },
  uniqueItems: true
};
writeJson("data/leksikon/sprak/schema_v2.json", languageSchema);

// Runtime base index must preserve area ownership; otherwise the map-loaded Place loses placeScope.
let buildIndex = readText("tools/build_places_index.mts");
buildIndex = replaceOnce(buildIndex,
  "  stub?: unknown;\n  groundhopper?: unknown;",
  "  stub?: unknown;\n  placeScope?: unknown;\n  groundhopper?: unknown;",
  "place index PlaceRow placeScope"
);
buildIndex = replaceOnce(buildIndex,
  "'id','name','lat','lon','r','category','year','desc','aliases','image','cardImage','frontImage','hidden','stub','groundhopper','locatorType'",
  "'id','name','lat','lon','r','category','year','desc','aliases','image','cardImage','frontImage','hidden','stub','placeScope','groundhopper','locatorType'",
  "place index LIGHT_FIELDS placeScope"
);
writeText("tools/build_places_index.mts", buildIndex);

let placeTypes = readText("schemas/place.ts");
placeTypes = replaceOnce(placeTypes,
  "  stub?: boolean;\n  sport_profile?: PlaceSportProfile;",
  "  stub?: boolean;\n  /** Area-level owner for spatial knowledge layers such as dialect; omitted for ordinary POIs. */\n  placeScope?: string;\n  sport_profile?: PlaceSportProfile;",
  "Place type placeScope"
);
writeText("schemas/place.ts", placeTypes);

let runtime = readText("js/ui/place-language-layer.js");
runtime = replaceOnce(runtime,
  "  let manifestPromise = null;\n  let atlasPromise = null;",
  "  let manifestPromise = null;\n  let atlasPromise = null;\n  let atlasPlaceIndexPromise = null;",
  "runtime atlas place index cache"
);
runtime = replaceOnce(runtime,
  "  async function loadForPlace(placeId) {",
  `  async function loadAtlasPlaceIndex() {\n    if (atlasPlaceIndexPromise) return atlasPlaceIndexPromise;\n    atlasPlaceIndexPromise = (async () => {\n      const manifest = await loadManifest();\n      const index = new Map();\n      for (const placeId of Object.keys(manifest?.place_files || {})) {\n        const loaded = await loadForPlace(placeId);\n        if (!loaded?.article) continue;\n        const localIds = unique(loaded.article?.atlas_local_ids);\n        if (!localIds.length) continue;\n        const runtimePlace = list(global.PLACES).find(row => text(row?.id) === placeId);\n        const placeName = text(runtimePlace?.name || loaded.article?.title?.replace(/^Språkleksikon:\\s*/i, \"\") || placeId);\n        for (const localId of localIds) {\n          const rows = index.get(localId) || [];\n          if (!rows.some(row => row.placeId === placeId)) rows.push({ placeId, placeName });\n          index.set(localId, rows);\n        }\n      }\n      return index;\n    })().catch(() => new Map());\n    return atlasPlaceIndexPromise;\n  }\n\n  async function loadForPlace(placeId) {`,
  "runtime loadAtlasPlaceIndex"
);
runtime = replaceOnce(runtime,
  "  function renderLanguageAtlas(article, atlas) {",
  "  function renderLanguageAtlas(article, atlas, atlasPlaceIndex = new Map()) {",
  "runtime renderLanguageAtlas signature"
);
runtime = replaceOnce(runtime,
  "          <div class=\"hg-language-atlas-evidence\" data-atlas-selection-evidence hidden></div>\n        </div>",
  "          <div class=\"hg-language-atlas-evidence\" data-atlas-selection-evidence hidden></div>\n          <div class=\"hg-language-atlas-place-links\" data-atlas-selection-places hidden></div>\n        </div>",
  "runtime atlas place links slot"
);
runtime = replaceOnce(runtime,
  "  function countByType(entries) {",
  `  function renderAtlasJumpLinks(article, atlas) {\n    const ids = atlasIds(article, \"atlas_local_ids\");\n    if (!ids.length) return \"\";\n    const locals = list(atlas?.local_varieties);\n    const buttons = ids.map(id => {\n      const profile = locals.find(row => text(row?.id) === id);\n      if (!profile) return \"\";\n      return \`<button type=\"button\" data-atlas-jump-local=\"\${esc(id)}\">Se talemålet i Språkatlas\${ids.length > 1 ? \`: \${esc(profile?.name)}\` : \"\"}</button>\`;\n    }).filter(Boolean).join(\"\");\n    return buttons ? \`<nav class=\"hg-language-atlas-jump\" aria-label=\"Naviger til Språkatlas\">\${buttons}</nav>\` : \"\";\n  }\n\n  function countByType(entries) {`,
  "runtime atlas jump renderer"
);
runtime = replaceOnce(runtime,
  "        ${renderLanguageAtlas(article, atlas)}",
  "        ${renderAtlasJumpLinks(article, atlas)}\n        ${renderLanguageAtlas(article, atlas, atlasPlaceIndex)}",
  "runtime language panel atlas render"
);
runtime = replaceOnce(runtime,
  "  function renderLanguagePanel(place, article, atlas = null) {",
  "  function renderLanguagePanel(place, article, atlas = null, atlasPlaceIndex = new Map()) {",
  "runtime renderLanguagePanel signature"
);
runtime = replaceOnce(runtime,
  "  function activateAtlasSelection(panel, atlas, itemId, macroHint = \"\") {",
  "  function activateAtlasSelection(panel, atlas, itemId, macroHint = \"\", atlasPlaceIndex = new Map()) {",
  "runtime activateAtlasSelection signature"
);
runtime = replaceOnce(runtime,
  "      selection.hidden = false;\n    }\n\n    macroCard?.scrollIntoView",
  `      const places = panel.querySelector(\"[data-atlas-selection-places]\");\n      if (places instanceof HTMLElement) {\n        if (!local) {\n          places.hidden = true;\n          places.innerHTML = \"\";\n        } else {\n          const linked = list(atlasPlaceIndex?.get?.(id));\n          places.hidden = false;\n          places.innerHTML = \`\n            <strong>Utforsk steder med dokumenterte språkspor</strong>\n            <p>Dette er steder der History Go har dokumenterte språkspor. Listen er ikke komplett og er ikke et kart over hvor talemålet finnes.</p>\n            \${linked.length\n              ? \`<div>\${linked.map(row => \`<button type=\"button\" data-atlas-open-place=\"\${esc(row.placeId)}\">\${esc(row.placeName)}</button>\`).join(\"\")}</div>\`\n              : \`<p class=\"hg-language-atlas-place-empty\">History Go har foreløpig ingen dokumenterte Place-spor knyttet direkte til denne profilen.</p>\`}\n          \`;\n        }\n      }\n      selection.hidden = false;\n    }\n\n    macroCard?.scrollIntoView`,
  "runtime atlas selected places"
);
runtime = replaceOnce(runtime,
  "  function bindLanguagePanel(panel, place, article, sourceFile, atlas = null) {",
  "  function bindLanguagePanel(panel, place, article, sourceFile, atlas = null, atlasPlaceIndex = new Map()) {",
  "runtime bindLanguagePanel signature"
);
runtime = replaceOnce(runtime,
  "      const atlasFocus = target?.closest(\"[data-atlas-focus]\");",
  `      const openAtlasPlace = target?.closest(\"[data-atlas-open-place]\");\n      if (openAtlasPlace) {\n        const placeId = text(openAtlasPlace.getAttribute(\"data-atlas-open-place\"));\n        const opened = placeId && global.HGMapView?.openPlace?.(placeId);\n        if (!opened) global.showToast?.(\"Kunne ikke åpne stedet fra Språkatlas.\");\n        return;\n      }\n\n      const atlasJump = target?.closest(\"[data-atlas-jump-local]\");\n      if (atlasJump && atlas) {\n        const localId = atlasJump.getAttribute(\"data-atlas-jump-local\");\n        activateAtlasSelection(panel, atlas, localId, \"\", atlasPlaceIndex);\n        panel.querySelector(\"[data-atlas-selection]\")?.scrollIntoView?.({ behavior: \"smooth\", block: \"nearest\" });\n        return;\n      }\n\n      const atlasFocus = target?.closest(\"[data-atlas-focus]\");`,
  "runtime atlas place and reverse click handlers"
);
runtime = runtime.replaceAll("activateAtlasSelection(panel, atlas, atlasFocus.getAttribute(\"data-atlas-focus\"));", "activateAtlasSelection(panel, atlas, atlasFocus.getAttribute(\"data-atlas-focus\"), \"\", atlasPlaceIndex);");
runtime = runtime.replaceAll("          atlasRegion.getAttribute(\"data-atlas-macro-id\")\n        );", "          atlasRegion.getAttribute(\"data-atlas-macro-id\"),\n          atlasPlaceIndex\n        );");
runtime = runtime.replaceAll("          atlasLocal.getAttribute(\"data-atlas-macro-id\")\n        );", "          atlasLocal.getAttribute(\"data-atlas-macro-id\"),\n          atlasPlaceIndex\n        );");
runtime = replaceOnce(runtime,
  "    const atlas = await loadAtlas();",
  "    const [atlas, atlasPlaceIndex] = await Promise.all([loadAtlas(), loadAtlasPlaceIndex()]);",
  "runtime parallel atlas/index load"
);
runtime = replaceOnce(runtime,
  "    panel.innerHTML = renderLanguagePanel(place, loaded.article, atlas);\n    bindLanguagePanel(panel, place, loaded.article, loaded.sourceFile, atlas);",
  "    panel.innerHTML = renderLanguagePanel(place, loaded.article, atlas, atlasPlaceIndex);\n    bindLanguagePanel(panel, place, loaded.article, loaded.sourceFile, atlas, atlasPlaceIndex);",
  "runtime panel render bind with place index"
);
runtime = replaceOnce(runtime,
  "    loadAtlas,\n    canonicalType,",
  "    loadAtlas,\n    loadAtlasPlaceIndex,\n    canonicalType,",
  "runtime API exposes atlas place index"
);
writeText("js/ui/place-language-layer.js", runtime);

let css = readText("css/place-language-layer.css");
css = appendUnique(css, ".hg-language-atlas-place-links {", `
.hg-language-atlas-jump {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 10px 0 2px;
}
.hg-language-atlas-jump button,
.hg-language-atlas-place-links button {
  font: inherit;
  font-weight: 700;
  border: 1px solid currentColor;
  border-radius: 999px;
  padding: 8px 12px;
  background: transparent;
  cursor: pointer;
}
.hg-language-atlas-place-links {
  margin-top: 14px;
  padding-top: 12px;
  border-top: 1px solid rgba(127, 127, 127, 0.28);
}
.hg-language-atlas-place-links > p {
  margin: 6px 0 10px;
}
.hg-language-atlas-place-links > div {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.hg-language-atlas-place-empty {
  opacity: 0.75;
  font-style: italic;
}
`);
writeText("css/place-language-layer.css", css);

const statuses = ["evidence_materialized", "documented_seed", "local_research_required"];
const coverage = Object.fromEntries(statuses.map(status => [status, localProfiles.filter(row => row?.profile_status === status).map(row => String(row?.name || row?.id)).sort((a, b) => a.localeCompare(b, "nb"))]));
let docs = readText("docs/SPRAKLEKSIKON.md");
docs = appendUnique(docs, "## Språkatlas → Steder v1", `
## Språkatlas → Steder v1

Språkatlas og canonical Places er nå koblet uten en parallell sted-/dialektdatabase. Relasjonen eies av den eksisterende stedbundne språkfilen gjennom \`atlas_local_ids\`; runtime bygger en navigasjonsindeks fra \`data/leksikon/sprak/manifest.json\` og disse artiklene.

- Fra en lokal talemålsprofil kan brukeren åpne **steder med dokumenterte språkspor** direkte via den eksisterende \`HGMapView.openPlace()\`-flyten. Kartet fullfører flyttingen før PlaceCard åpnes.
- Listen er uttrykkelig **ikke komplett** og skal ikke tolkes som et utbredelseskart for talemålet.
- Fra et område-Place med \`atlas_local_ids\` kan brukeren gå tilbake med **«Se talemålet i Språkatlas»**.
- \`layer: "dialect"\` eies fortsatt bare av \`placeScope: "area"\`. Enkelt-Places kan ha Språkleksikon, men blir ikke dialekteiere av denne navigasjonen.
- \`places_index.json\` bevarer nå \`placeScope\`, slik at områdeeierskapet ikke går tapt i normal kart-runtime.

### Dekningsaudit for lokale talemålsprofiler

Audit mot canonical \`local_varieties\` ${VERIFIED_AT}:

- \`evidence_materialized\`: **${coverage.evidence_materialized.length}** — ${coverage.evidence_materialized.join(", ") || "ingen"}
- \`documented_seed\`: **${coverage.documented_seed.length}** — ${coverage.documented_seed.join(", ") || "ingen"}
- \`local_research_required\`: **${coverage.local_research_required.length}** — ${coverage.local_research_required.join(", ") || "ingen"}

Statusaudit er en lesning av atlasets canonical profiler, ikke en ny database. Nye lokale profiler skal fortsatt materialiseres etter kildekvalitet og direkte lokalt belegg; geografisk balanse alene er ikke grunn til å oppgradere en profil.
`);
writeText("docs/SPRAKLEKSIKON.md", docs);

let tests = readText("tests/place-language-dialect-scope.test.mjs");
tests = appendUnique(tests, "Språkatlas → Steder bruker canonical språkfiler", `

test("Språkatlas → Steder bruker canonical språkfiler og area-Places uten parallell koblingsdatabase", () => {
  const atlas = json("data/leksikon/sprak/norge_atlas_v1.json");
  const schema = json("data/leksikon/sprak/schema_v2.json");
  const places = loadPlacesById();
  const localIds = new Set((atlas.local_varieties || []).map(row => text(row.id)));
  assert.equal(schema.properties.atlas_local_ids.type, "array");
  assert.equal(schema.properties.atlas_local_ids.uniqueItems, true);

  const expected = new Map([
    ["bergen", "Bergen"],
    ["valle_setesdal", "Valle i Setesdal"],
    ["narvik", "Narvik"],
    ["aal", "Ål"]
  ]);
  for (const [placeId, name] of expected) {
    const place = places.get(placeId);
    assert.ok(place, `${placeId}: nytt canonical område-Place mangler`);
    assert.equal(place.name, name);
    assert.equal(place.placeScope, "area", `${placeId}: talemålsanker må være area-Place`);
    assert.equal(place.category, "by");
    assert.equal(place.coordStatus, "verified_geometry");
    assert.equal(place.coordRole, "area_anchor");
    assert.equal(place.sourceProvider, "official_address");
    assert.equal(place.geocodeAccuracy, "semantic_anchor");
    assert.match(text(place.coordNote), /representativt områdeanker/i);
    assert.match(text(place.coordNote), /ikke en påstått.*grense/i);

    const relative = languageManifest.place_files?.[placeId];
    assert.ok(relative, `${placeId}: Språkleksikon-fil mangler i manifestet`);
    const article = json(relative);
    assert.deepEqual(article.atlas_local_ids?.length, 1, `${placeId}: skal peke til én lokal atlasprofil`);
    assert.ok(localIds.has(article.atlas_local_ids[0]), `${placeId}: ukjent atlas_local_id`);
    const profile = (atlas.local_varieties || []).find(row => row.id === article.atlas_local_ids[0]);
    assert.equal(profile?.profile_status, "evidence_materialized", `${placeId}: Place skal ikke materialiseres fra tynn lokalprofil`);
    assert.ok((article.entries || []).length >= 4, `${placeId}: trenger minst fire kildebelagte språkspor`);
    for (const entry of article.entries || []) {
      assert.equal(entry.layer, "dialect");
      assert.ok((entry.sources || []).length >= 2, `${entry.id}: trenger minst to kilder`);
    }
  }

  for (const [placeId, relative] of Object.entries(languageManifest.place_files || {})) {
    const article = json(relative);
    for (const localId of article.atlas_local_ids || []) {
      assert.ok(localIds.has(localId), `${relative}: atlas_local_ids peker til ukjent profil ${localId}`);
      const place = places.get(placeId);
      assert.ok(place, `${relative}: koblet Place mangler`);
      if ((article.entries || []).some(entry => isDialectEntry(entry, article))) {
        assert.equal(place.placeScope, "area", `${relative}: dialektkoblet Place må være area`);
      }
    }
  }
});

test("Språkatlas og PlaceCard har toveis navigasjon med ufullstendighetsvern", () => {
  const runtime = read("js/ui/place-language-layer.js");
  const buildIndex = read("tools/build_places_index.mts");
  const placeType = read("schemas/place.ts");
  assert.match(runtime, /function\\s+loadAtlasPlaceIndex\\s*\\(/);
  assert.match(runtime, /data-atlas-open-place/);
  assert.match(runtime, /HGMapView\\?\\.openPlace/);
  assert.match(runtime, /data-atlas-jump-local/);
  assert.match(runtime, /Se talemålet i Språkatlas/);
  assert.match(runtime, /Utforsk steder med dokumenterte språkspor/);
  assert.match(runtime, /Listen er ikke komplett/);
  assert.match(runtime, /ikke et kart over hvor talemålet finnes/);
  assert.match(buildIndex, /'placeScope'/, "places_index må bevare area-eierskap i runtime");
  assert.match(placeType, /placeScope\\?:\\s*string/);
});
`);
writeText("tests/place-language-dialect-scope.test.mjs", tests);

// Fast local validations; the coordinate runner workflow adds the full coordinate/index gate suite afterwards.
execFileSync("node", ["--check", "js/ui/place-language-layer.js"], { cwd: ROOT, stdio: ["ignore", fs.openSync(path.join(REPORT_DIR, "runtime-syntax.log"), "w"), fs.openSync(path.join(REPORT_DIR, "runtime-syntax.err.log"), "w")] });
execFileSync("node", ["--test", "tests/place-language-dialect-scope.test.mjs"], { cwd: ROOT, stdio: ["ignore", fs.openSync(path.join(REPORT_DIR, "language-tests.log"), "w"), fs.openSync(path.join(REPORT_DIR, "language-tests.err.log"), "w")] });
for (const rel of ["data/places/manifest.json", "data/leksikon/sprak/manifest.json", "data/leksikon/sprak/schema_v2.json", ...placeSpecs.flatMap(spec => [spec.path, spec.languagePath])]) JSON.parse(readText(rel));
writeText("reports/sprakatlas-place-links-v1/summary.txt", `PASS: ${placeSpecs.length} area Places + ${placeSpecs.length} local language articles + bidirectional atlas navigation + coverage audit.\n`);
console.log(`Språkatlas → Steder v1 generated for ${placeSpecs.map(row => row.name).join(", ")}`);
