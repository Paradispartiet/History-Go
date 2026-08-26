import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUTPUT = "data/epoker/epoke-place-index.json";
const CLAIMS_FILE = "data/fag/historie/claims_historie_canonical_v1.json";
const SOURCES_FILE = "data/fag/historie/sources_historie_canonical_v1.json";
const PLACE_EVIDENCE_FILE = "data/fag/historie/place_evidence_historie_v1.json";
const PERIOD_MODULES_FILE = "data/fag/historie/period_modules_historie_v1.json";
const EMNER_FILE = "data/fag/historie/emner_historie_canonical_v4_5.json";

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), "utf8"));
}

function text(value) {
  return String(value ?? "").trim();
}

function normalized(value) {
  return text(value)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

const COUNTRY_ALIASES = new Map([
  ["no", { id: "no", label: "Norge" }],
  ["norge", { id: "no", label: "Norge" }],
  ["norway", { id: "no", label: "Norge" }],
  ["pt", { id: "pt", label: "Portugal" }],
  ["portugal", { id: "pt", label: "Portugal" }],
  ["gb", { id: "gb", label: "Storbritannia" }],
  ["uk", { id: "gb", label: "Storbritannia" }],
  ["england", { id: "gb", label: "Storbritannia" }],
  ["united kingdom", { id: "gb", label: "Storbritannia" }]
]);

const NORWAY_PATH_SEGMENTS = new Set([
  "oslo", "akershus", "agder", "buskerud", "finnmark", "innlandet", "more_og_romsdal",
  "nordland", "norge", "ostfold", "rogaland", "telemark", "troms", "trondelag", "vestfold", "vestland"
]);

const CITY_ALIASES = new Map([
  ["oslo", { id: "oslo", label: "Oslo", country_id: "no" }],
  ["lisbon", { id: "lisboa", label: "Lisboa", country_id: "pt" }],
  ["lisboa", { id: "lisboa", label: "Lisboa", country_id: "pt" }],
  ["london", { id: "london", label: "London", country_id: "gb" }],
  ["york", { id: "york", label: "York", country_id: "gb" }],
  ["etne", { id: "etne", label: "Etne", country_id: "no" }]
]);

function slug(value) {
  return text(value)
    .toLowerCase()
    .replace(/æ/g, "ae")
    .replace(/ø/g, "o")
    .replace(/å/g, "a")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function countryFrom(value) {
  return COUNTRY_ALIASES.get(normalized(value)) || null;
}

function cityFrom(value) {
  const raw = text(value);
  if (!raw) return null;
  const alias = CITY_ALIASES.get(normalized(raw));
  if (alias) return alias;
  return { id: slug(raw), label: raw, country_id: "" };
}

export function geographyForPlace(place) {
  const sourceFile = text(place?.sourceFile).replace(/^data\//, "");
  const segments = sourceFile.split("/").map(slug);
  const explicitCountry = countryFrom(place?.address?.country || place?.country || place?.country_id);
  const explicitCity = cityFrom(place?.address?.city || place?.city || place?.cityLabel || place?.municipality || place?.kommune);
  let country = explicitCountry;
  let city = explicitCity;
  let source = explicitCity || explicitCountry ? "canonical_place_fields" : "";

  if (!country) {
    if (segments.includes("portugal")) country = countryFrom("portugal");
    else if (segments.includes("england") || segments.includes("utland_england")) country = countryFrom("england");
    else if (segments.includes("norway") || NORWAY_PATH_SEGMENTS.has(segments[2])) country = countryFrom("no");
    if (country) source = "canonical_source_path";
  }

  if (!city) {
    const knownPathCity = [...CITY_ALIASES.keys()].find((candidate) => segments.some((segment) => (
      segment === candidate || segment.startsWith(`${candidate}_`) || segment.endsWith(`_${candidate}`)
    )));
    if (knownPathCity) city = cityFrom(knownPathCity);
    else if (segments.includes("footballgrounds_london")) city = cityFrom("london");
    else if (segments.includes("york_jorvik")) city = cityFrom("york");
    if (city) source = "canonical_source_path";
  }

  if (!country && city?.country_id) country = countryFrom(city.country_id);
  if (country && city?.country_id && city.country_id !== country.id) city = null;

  return {
    country_id: text(country?.id),
    country_label: text(country?.label),
    city_id: text(city?.id),
    city_label: text(city?.label),
    source: source || "unknown"
  };
}

function buildLocationIndex(places) {
  const placeLocations = Object.create(null);
  const countries = new Map();
  const unknownPlaceIds = [];

  for (const place of places) {
    const placeId = text(place?.id);
    if (!placeId) continue;
    const location = geographyForPlace(place);
    placeLocations[placeId] = location;
    if (!location.country_id) {
      unknownPlaceIds.push(placeId);
      continue;
    }
    let country = countries.get(location.country_id);
    if (!country) {
      country = { id: location.country_id, label: location.country_label, place_count: 0, cities: new Map() };
      countries.set(location.country_id, country);
    }
    country.place_count += 1;
    if (location.city_id) {
      let city = country.cities.get(location.city_id);
      if (!city) {
        city = { id: location.city_id, label: location.city_label, place_count: 0 };
        country.cities.set(location.city_id, city);
      }
      city.place_count += 1;
    }
  }

  return {
    contract: "canonical-place-geography-v1",
    places: placeLocations,
    countries: [...countries.values()]
      .map((country) => ({
        id: country.id,
        label: country.label,
        place_count: country.place_count,
        cities: [...country.cities.values()].sort((a, b) => a.label.localeCompare(b.label, "nb"))
      }))
      .sort((a, b) => a.label.localeCompare(b.label, "nb")),
    unknown_place_ids: unknownPlaceIds.sort()
  };
}

function articleList(payload) {
  if (Array.isArray(payload)) return payload;
  for (const key of ["articles", "entries", "items", "places"]) {
    if (Array.isArray(payload?.[key])) return payload[key];
  }
  return payload && typeof payload === "object" ? [payload] : [];
}

function sourceList(milestone, article) {
  const direct = Array.isArray(milestone?.sources) ? milestone.sources : [];
  const fallback = Array.isArray(article?.sources) ? article.sources : [];
  const articleSources = fallback.map((source) => typeof source === "string" ? { title: source, url: "" } : source);
  return direct
    .map((source) => {
      const value = typeof source === "string" ? { title: source, url: "" } : source;
      const title = text(value?.title || value?.label);
      const matched = articleSources.find((candidate) => normalized(candidate?.title || candidate?.label) === normalized(title));
      return {
        title,
        url: text(value?.url || matched?.url),
        verifiedAt: text(value?.verifiedAt || matched?.verifiedAt)
      };
    })
    .filter((source) => source.title && /^https?:\/\//.test(source.url));
}

function epochForYear(epochs, year) {
  return epochs.find((epoch) => {
    const from = Number(epoch?.years?.from);
    const rawTo = epoch?.years?.to;
    const to = rawTo == null ? Number.POSITIVE_INFINITY : Number(rawTo);
    return Number.isFinite(from) && year >= from && year <= to;
  }) || null;
}

function canonicalYear(value) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  const match = text(value).match(/^-?\d{1,4}/);
  return match ? Number(match[0]) : null;
}

const APPROXIMATE_YEAR_CONTEXT = /(?:\bca\.?|\bcirka|\bomkring|\bomtrent|\brundt|\bmidt(?:en)?\s+av|\bslutten\s+av|\bbegynnelsen\s+av|\btrolig|\bantakelig|\bkanskje)[^.!?\n]{0,35}$/i;
const UNCERTAIN_YEAR_CLAIM = /(?:dateringen er usikker|teknisk midtpunkt|kildene (?:spriker|varierer)|omtrentlig datering)/i;

function placeDetailFor(place) {
  const sourceFile = text(place?.sourceFile);
  if (!sourceFile) return null;
  const relativePath = sourceFile.startsWith("data/") ? sourceFile : `data/${sourceFile}`;
  const absolutePath = path.join(ROOT, relativePath);
  if (!fs.existsSync(absolutePath)) return null;
  const payload = readJson(relativePath);
  return Array.isArray(payload)
    ? payload.find((candidate) => text(candidate?.id) === text(place?.id)) || null
    : payload;
}

function exactProductionClaimYears(statement) {
  const value = text(statement);
  if (!value || UNCERTAIN_YEAR_CLAIM.test(value)) return [];
  const years = [];
  const matcher = /(^|[^0-9])(\d{4})(?![0-9]|\s*[-–]\s*årene|[-–]tallet)/gi;
  let match;
  while ((match = matcher.exec(value))) {
    const year = Number(match[2]);
    const yearPosition = match.index + text(match[1]).length;
    if (
      year >= 1000 && year <= 2026 &&
      !APPROXIMATE_YEAR_CONTEXT.test(value.slice(Math.max(0, yearPosition - 45), yearPosition))
    ) years.push(year);
  }
  return [...new Set(years)];
}

const ROLE_RULES = [
  ["makt_og_styring", "Makt og styring", ["politikk", "regjering", "storting", "kommune", "stat", "kong", "myndighet", "lov", "rett"]],
  ["konflikt_og_motstand", "Konflikt og motstand", ["krig", "okkupasjon", "motstand", "streik", "oppror", "konflikt", "demonstrasjon", "deportasjon"]],
  ["arbeid_og_okonomi", "Arbeid og økonomi", ["arbeid", "industri", "fabrikk", "handel", "marked", "bank", "bedrift", "produksjon"]],
  ["by_og_infrastruktur", "By og infrastruktur", ["jernbane", "gate", "havn", "bygning", "arkitektur", "bolig", "byutvikling", "transport", "park"]],
  ["kultur_og_offentlighet", "Kultur og offentlighet", ["kunst", "kultur", "teater", "museum", "presse", "avis", "musikk", "litteratur", "offentlighet"]],
  ["hverdagsliv_og_velferd", "Hverdagsliv og velferd", ["hverdag", "skole", "helse", "velferd", "omsorg", "fritid", "sosial"]],
  ["religion_og_livssyn", "Religion og livssyn", ["kirke", "religion", "kloster", "moske", "synagoge", "tro", "ritual"]],
  ["migrasjon_og_tilhorighet", "Migrasjon og tilhørighet", ["migrasjon", "innvandring", "minoritet", "diaspora", "flukt", "tilhorighet", "tilhørighet"]],
  ["minne_og_historiebruk", "Minne og historiebruk", ["minne", "monument", "jubileum", "gatenavn", "historiebruk", "museum"]]
];

function rolesFor(place, milestone) {
  const haystack = normalized([
    place?.category,
    place?.name,
    milestone?.title,
    milestone?.desc,
    milestone?.period
  ].join(" "));
  const roles = ROLE_RULES
    .filter(([, , terms]) => terms.some((term) => haystack.includes(normalized(term))))
    .map(([id, label]) => ({ id, label }));
  return roles.length ? roles.slice(0, 3) : [{ id: "stedshistorisk_spor", label: "Stedshistorisk spor" }];
}

function trackIdsFor(tracks, place, milestone) {
  const haystack = normalized([
    place?.category,
    place?.name,
    milestone?.title,
    milestone?.desc,
    milestone?.period
  ].join(" "));
  return tracks
    .filter((track) => [...(track.markers || []), ...(track.tags || [])]
      .some((term) => {
        const needle = normalized(term);
        return needle.length >= 5 && haystack.includes(needle);
      }))
    .map((track) => track.id);
}

function sourceBackedStories(placeDetail) {
  return (Array.isArray(placeDetail?.stories) ? placeDetail.stories : [])
    .filter((story) => text(story?.id) && text(story?.title) && text(story?.story || story?.summary))
    .filter(storyHasInspectableSource)
    .map((story) => ({
      id: text(story.id),
      title: text(story.title),
      year: canonicalYear(story.year),
      type: text(story.type)
    }));
}

function storyHasInspectableSource(story) {
  return (Array.isArray(story?.sources) ? story.sources : []).some((source) => {
    const value = typeof source === "string" ? source : source?.url;
    return /^(https?:\/\/|data\/)/.test(text(value));
  });
}

function buildConnectionCatalog() {
  const storyManifest = readJson("data/runtime/stories-all.json");
  const storiesByPlace = new Map();
  for (const shardPath of storyManifest.files || []) {
    for (const story of readJson(shardPath)) {
      const placeId = text(story?.place_id);
      if (!placeId || !storyHasInspectableSource(story)) continue;
      const list = storiesByPlace.get(placeId) || [];
      list.push({ ...story, source_file: shardPath });
      storiesByPlace.set(placeId, list);
    }
  }

  const peopleByPlace = new Map();
  for (const relationFile of ["data/relations.json", "data/relations_philanthropy.json"]) {
    for (const relation of readJson(relationFile)) {
      const source = text(relation?.sourceUrl || relation?.source_url || relation?.source);
      if (!/^https?:\/\//.test(source)) continue;
      const placeId = text(relation?.place || relation?.place_id || relation?.placeId);
      const personId = text(relation?.person || relation?.person_id || relation?.personId);
      if (!placeId || !personId) continue;
      const ids = peopleByPlace.get(placeId) || new Set();
      ids.add(personId);
      peopleByPlace.set(placeId, ids);
    }
  }
  return { storiesByPlace, peopleByPlace };
}

function connectionPersonIds(placeDetail) {
  const ids = new Set();
  for (const relation of Array.isArray(placeDetail?.relations) ? placeDetail.relations : []) {
    for (const value of [relation?.person, relation?.person_id, relation?.personId]) {
      if (text(value)) ids.add(text(value));
    }
    for (const side of ["from", "to"]) {
      const type = text(relation?.[`${side}Type`] || relation?.[`${side}_type`]);
      const id = text(relation?.[`${side}Id`] || relation?.[`${side}_id`]);
      if (type === "person" && id) ids.add(id);
    }
  }
  return [...ids].sort();
}

function connectionsForPlace(place, connectionCatalog) {
  const detail = placeDetailFor(place);
  if (!detail) return { person_ids: [], works: [], stories: [] };
  const personIds = new Set([
    ...connectionPersonIds(detail),
    ...(connectionCatalog?.peopleByPlace?.get(text(place?.id)) || [])
  ]);
  const stories = [
    ...sourceBackedStories(detail),
    ...sourceBackedStories({ stories: connectionCatalog?.storiesByPlace?.get(text(place?.id)) || [] })
  ];
  return {
    person_ids: [...personIds].sort(),
    works: (Array.isArray(detail?.works) ? detail.works : [])
      .filter((work) => text(work?.id) && text(work?.title || work?.name))
      .map((work) => ({ id: text(work.id), title: text(work.title || work.name), type: text(work.type) })),
    stories: [...new Map(stories.map((story) => [story.id, story])).values()]
      .sort((a, b) => (a.year ?? 999999) - (b.year ?? 999999) || a.title.localeCompare(b.title, "nb"))
  };
}

function ensurePlace(group, place, connectionCatalog) {
  let row = group.places.find((candidate) => candidate.place_id === place.id);
  if (!row) {
    row = {
      place_id: place.id,
      name: text(place.name || place.title || place.id),
      category: text(place.category || place.domain),
      source_file: text(place.sourceFile),
      roles: [],
      milestones: [],
      period_cases: [],
      connections: connectionsForPlace(place, connectionCatalog)
    };
    group.places.push(row);
  }
  return row;
}

function addMilestone(group, place, milestone, sourceFile, sources, roles, connectionCatalog) {
  const row = ensurePlace(group, place, connectionCatalog);
  for (const role of roles) {
    if (!row.roles.some((candidate) => candidate.id === role.id)) row.roles.push(role);
  }
  const item = {
    id: text(milestone.id) || `${place.id}_${milestone.year}`,
    year: Number(milestone.year),
    title: text(milestone.title || milestone.label || milestone.period) || "Historisk hendelse",
    consequence: text(milestone.desc || milestone.description),
    confidence: text(milestone.confidence),
    sources,
    source_file: sourceFile,
    evidence_type: text(milestone.evidence_type || "leksikon_chronology"),
    claim_id: text(milestone.claim_id),
    story_id: text(milestone.story_id),
    limitations: (Array.isArray(milestone.limitations) ? milestone.limitations : []).map(text).filter(Boolean)
  };
  const uniqueKey = `${item.year}|${item.title}|${item.consequence}`;
  if (!row.milestones.some((candidate) => `${candidate.year}|${candidate.title}|${candidate.consequence}` === uniqueKey)) {
    row.milestones.push(item);
  }
}

function finalizeGroup(group) {
  group.places.sort((a, b) => a.name.localeCompare(b.name, "nb") || a.place_id.localeCompare(b.place_id));
  for (const place of group.places) {
    place.roles.sort((a, b) => a.label.localeCompare(b.label, "nb"));
    place.milestones.sort((a, b) => a.year - b.year || a.title.localeCompare(b.title, "nb"));
    place.period_cases.sort((a, b) => a.id.localeCompare(b.id));
  }
  group.placeCount = group.places.length;
  group.milestoneCount = group.places.reduce((sum, place) => sum + place.milestones.length, 0);
  return group;
}

export function buildEpokePlaceIndex() {
  const places = readJson("data/places/places_index.json");
  const locations = buildLocationIndex(places);
  const placeById = new Map(places.map((place) => [text(place.id), place]));
  const manifest = readJson("data/leksikon/manifest.json");
  const history = readJson("data/epoker/epoker_historie.json");
  const claimsRegistry = readJson(CLAIMS_FILE);
  const sourcesRegistry = readJson(SOURCES_FILE);
  const placeEvidenceRegistry = readJson(PLACE_EVIDENCE_FILE);
  const periodModules = readJson(PERIOD_MODULES_FILE);
  const emner = readJson(EMNER_FILE);
  const connectionCatalog = buildConnectionCatalog();
  const epochs = history.epoker || [];
  const tracks = history.parallel_epoker || [];
  const epochGroups = Object.fromEntries(epochs.map((epoch) => [epoch.id, { places: [] }]));
  const trackGroups = Object.fromEntries(tracks.map((track) => [track.id, { places: [] }]));
  const warnings = {
    missing_source_files: [],
    unknown_place_ids: [],
    unknown_evidence_place_ids: [],
    missing_claim_ids: [],
    skipped_undated: 0,
    skipped_without_url_sources: 0,
    skipped_evidence_without_sources: 0
  };

  for (const sourceFile of manifest.files || []) {
    const absolute = path.join(ROOT, sourceFile);
    if (!fs.existsSync(absolute)) {
      warnings.missing_source_files.push(sourceFile);
      continue;
    }
    for (const article of articleList(readJson(sourceFile))) {
      const placeId = text(article?.place_id || article?.placeId || article?.id);
      if (!placeId) continue;
      const place = placeById.get(placeId);
      if (!place) {
        warnings.unknown_place_ids.push({ place_id: placeId, source_file: sourceFile });
        continue;
      }
      for (const milestone of Array.isArray(article?.chronology) ? article.chronology : []) {
        const year = Number(milestone?.year);
        if (!Number.isFinite(year)) {
          warnings.skipped_undated += 1;
          continue;
        }
        const sources = sourceList(milestone, article);
        if (!sources.length) {
          warnings.skipped_without_url_sources += 1;
          continue;
        }
        const epoch = epochForYear(epochs, year);
        if (!epoch) continue;
        const roles = rolesFor(place, milestone);
        addMilestone(epochGroups[epoch.id], place, milestone, sourceFile, sources, roles, connectionCatalog);
        for (const trackId of trackIdsFor(tracks, place, milestone)) {
          addMilestone(trackGroups[trackId], place, milestone, sourceFile, sources, roles, connectionCatalog);
        }
      }
    }
  }

  // Runtime Stories are already canonical, source-inspectable History GO
  // material. Only Oslo stories with an explicit year and HTTP sources become
  // timeline evidence here; no date is inferred from prose or place metadata.
  for (const place of places) {
    const location = locations.places[text(place?.id)];
    if (location?.country_id !== "no" || location?.city_id !== "oslo") continue;
    for (const story of connectionCatalog.storiesByPlace.get(text(place?.id)) || []) {
      const year = canonicalYear(story?.year);
      const sources = (Array.isArray(story?.sources) ? story.sources : [])
        .map((source) => typeof source === "string" ? { title: source, url: source } : {
          title: text(source?.title || source?.label || source?.url),
          url: text(source?.url),
          verifiedAt: text(source?.verifiedAt)
        })
        .filter((source) => source.title && /^https?:\/\//.test(source.url));
      if (!Number.isFinite(year) || !text(story?.id) || !text(story?.title) || !text(story?.summary || story?.story) || !sources.length) continue;
      const epoch = epochForYear(epochs, year);
      if (!epoch) continue;
      const milestone = {
        id: `story_${text(story.id)}`,
        story_id: text(story.id),
        year,
        title: text(story.title),
        desc: text(story.summary || story.story),
        evidence_type: "canonical_story",
        period: (Array.isArray(story?.tags) ? story.tags : []).map(text).join(" ")
      };
      const roles = rolesFor(place, milestone);
      const sourceFile = text(story?.source_file);
      addMilestone(epochGroups[epoch.id], place, milestone, sourceFile, sources, roles, connectionCatalog);
      for (const trackId of trackIdsFor(tracks, place, milestone)) {
        addMilestone(trackGroups[trackId], place, milestone, sourceFile, sources, roles, connectionCatalog);
      }
    }
  }

  // Production claims have claim-level provenance: the exact assertion,
  // source URL and source location were reviewed together. Only verified,
  // explicitly historical Oslo claims with unambiguous exact years enter the
  // timeline. Legacy packages without temporalStatus remain eligible, while
  // claims explicitly marked current are excluded. All years in one claim
  // must resolve to the same canonical epoch.
  const productionDirectory = "data/places/production";
  for (const fileName of fs.readdirSync(path.join(ROOT, productionDirectory)).filter((name) => name.endsWith(".json")).sort()) {
    const sourceFile = `${productionDirectory}/${fileName}`;
    const production = readJson(sourceFile);
    const place = placeById.get(text(production?.placeId));
    const location = locations.places[text(production?.placeId)];
    if (!place || location?.country_id !== "no" || location?.city_id !== "oslo") continue;
    for (const claim of Array.isArray(production?.claims) ? production.claims : []) {
      const claimText = text(claim?.claim);
      const sourceUrl = text(claim?.sourceUrl);
      const years = exactProductionClaimYears(claimText);
      const matchingEpochs = [...new Set(years.map((year) => epochForYear(epochs, year)?.id).filter(Boolean))];
      if (
        text(claim?.status) !== "verified" ||
        (text(claim?.temporalStatus) && text(claim.temporalStatus) !== "historical") ||
        !/^https?:\/\//.test(sourceUrl) ||
        !text(claim?.id) || !claimText || !years.length || matchingEpochs.length !== 1
      ) continue;
      const epoch = epochs.find((candidate) => candidate.id === matchingEpochs[0]);
      if (!epoch) continue;
      const sources = [{
        title: text(claim?.sourceLocation || claim?.sourceType || sourceUrl),
        url: sourceUrl,
        verifiedAt: text(claim?.verifiedAt)
      }];
      const milestone = {
        id: `production_${text(claim.id)}`,
        claim_id: text(claim.id),
        year: years[0],
        title: claimText,
        evidence_type: "verified_place_production_claim"
      };
      const roles = rolesFor(place, milestone);
      addMilestone(epochGroups[epoch.id], place, milestone, sourceFile, sources, roles, connectionCatalog);
      for (const trackId of trackIdsFor(tracks, place, milestone)) {
        addMilestone(trackGroups[trackId], place, milestone, sourceFile, sources, roles, connectionCatalog);
      }
    }
  }

  const claimById = new Map((claimsRegistry.claims || []).map((claim) => [text(claim?.claim_id), claim]));
  const canonicalSourceById = new Map((sourcesRegistry.sources || []).map((source) => [text(source?.source_id), source]));
  const moduleSourceById = new Map((periodModules.sources || []).map((source) => [text(source?.source_id), source]));
  const emneById = new Map((Array.isArray(emner) ? emner : []).map((emne) => [text(emne?.emne_id), emne]));
  const sourceRows = (sourceIds, registries = [canonicalSourceById]) => (Array.isArray(sourceIds) ? sourceIds : [])
    .map((sourceId) => registries.map((registry) => registry.get(text(sourceId))).find(Boolean))
    .filter(Boolean)
    .map((source) => ({
      title: text(source?.title || source?.publisher || source?.source_id),
      url: text(source?.url),
      verifiedAt: text(source?.dating?.accessed_at || source?.accessed_at)
    }))
    .filter((source) => source.title && /^https?:\/\//.test(source.url));

  for (const evidence of placeEvidenceRegistry.evidence_links || []) {
    if (!["validated_case", "validated_pilot"].includes(text(evidence?.validation_status))) continue;
    const placeId = text(evidence?.place_id);
    const place = placeById.get(placeId);
    if (!place) {
      warnings.unknown_evidence_place_ids.push(placeId);
      continue;
    }
    const claimId = text(evidence?.claim_id);
    const claim = claimById.get(claimId);
    if (!claim) {
      warnings.missing_claim_ids.push(claimId);
      continue;
    }
    const year = canonicalYear(claim?.scope?.temporal?.from);
    if (!Number.isFinite(year)) {
      warnings.skipped_undated += 1;
      continue;
    }
    const sources = sourceRows(evidence?.source_ids || claim?.source_ids);
    if (!sources.length) {
      warnings.skipped_evidence_without_sources += 1;
      continue;
    }
    const epoch = epochForYear(epochs, year);
    if (!epoch) continue;
    const emneRows = (evidence?.emne_ids || claim?.emne_ids || []).map((id) => emneById.get(text(id))).filter(Boolean);
    const roles = emneRows.slice(0, 3).map((emne) => ({
      id: text(emne?.emne_id),
      label: text(emne?.short_label || emne?.title)
    }));
    const limitations = [
      text(claim?.uncertainty?.note),
      ...(Array.isArray(claim?.alternative_interpretations) ? claim.alternative_interpretations : [])
    ].filter(Boolean);
    const milestone = {
      id: `claim_${claimId}`,
      year,
      title: text(emneRows[0]?.short_label || emneRows[0]?.title) || "Kildebelagt historisk spor",
      desc: text(claim?.statement),
      confidence: text(claim?.confidence),
      claim_id: claimId,
      evidence_type: "canonical_place_claim",
      limitations
    };
    addMilestone(epochGroups[epoch.id], place, milestone, PLACE_EVIDENCE_FILE, sources, roles.length ? roles : rolesFor(place, milestone), connectionCatalog);
    const trackMilestone = { ...milestone, period: emneRows.map((emne) => text(emne?.title)).join(" ") };
    for (const trackId of trackIdsFor(tracks, place, trackMilestone)) {
      addMilestone(trackGroups[trackId], place, milestone, PLACE_EVIDENCE_FILE, sources, roles.length ? roles : rolesFor(place, milestone), connectionCatalog);
    }
  }

  for (const periodCase of periodModules.cases || []) {
    const place = placeById.get(text(periodCase?.place_id));
    if (!place) {
      warnings.unknown_evidence_place_ids.push(text(periodCase?.place_id));
      continue;
    }
    const sources = sourceRows(periodCase?.source_ids, [moduleSourceById, canonicalSourceById]);
    if (!sources.length) {
      warnings.skipped_evidence_without_sources += 1;
      continue;
    }
    const periodId = text(periodCase?.period_id);
    const matchingEpochs = epochs.filter((epoch) => (epoch?.fagverk_links || []).some((link) => (
      (link?.period_ids || []).map(text).includes(periodId)
    )));
    for (const epoch of matchingEpochs) {
      const row = ensurePlace(epochGroups[epoch.id], place, connectionCatalog);
      if (!row.roles.some((role) => role.id === "canonical_fagverk_case")) {
        row.roles.push({ id: "canonical_fagverk_case", label: "Dokumentert Fagverk-case" });
      }
      if (!row.period_cases.some((candidate) => candidate.id === text(periodCase?.case_id))) {
        row.period_cases.push({
          id: text(periodCase?.case_id),
          period_id: periodId,
          use: text(periodCase?.use),
          sources,
          source_file: PERIOD_MODULES_FILE
        });
      }
    }
  }

  warnings.missing_source_files.sort();
  warnings.unknown_place_ids.sort((a, b) => a.place_id.localeCompare(b.place_id) || a.source_file.localeCompare(b.source_file));
  warnings.unknown_evidence_place_ids = [...new Set(warnings.unknown_evidence_place_ids)].sort();
  warnings.missing_claim_ids = [...new Set(warnings.missing_claim_ids)].sort();
  for (const group of Object.values(epochGroups)) finalizeGroup(group);
  for (const group of Object.values(trackGroups)) finalizeGroup(group);
  const allEpochPlaces = Object.values(epochGroups).flatMap((group) => group.places);
  const uniquePlaces = new Set(allEpochPlaces.map((place) => place.place_id));
  const uniquePlaceRows = [...new Map(allEpochPlaces.map((place) => [place.place_id, place])).values()];
  const connectedPeople = new Set(uniquePlaceRows.flatMap((place) => place.connections?.person_ids || []));
  const connectedWorks = new Set(uniquePlaceRows.flatMap((place) => (place.connections?.works || []).map((work) => work.id)));
  const connectedStories = new Set(uniquePlaceRows.flatMap((place) => (place.connections?.stories || []).map((story) => story.id)));
  const datedPlaceIds = new Set(uniquePlaceRows.filter((place) => place.milestones.length).map((place) => place.place_id));
  const casePlaceIds = new Set(uniquePlaceRows.filter((place) => place.period_cases.length && !datedPlaceIds.has(place.place_id)).map((place) => place.place_id));
  const osloPlaces = places.filter((place) => {
    const location = locations.places[text(place?.id)];
    return location?.country_id === "no" && location?.city_id === "oslo";
  });
  const osloCoveragePlaces = osloPlaces.map((place) => {
    const placeId = text(place?.id);
    const status = datedPlaceIds.has(placeId)
      ? "dated_evidence"
      : casePlaceIds.has(placeId) ? "documented_case" : "awaiting_source_backed_history";
    return {
      place_id: placeId,
      name: text(place?.name || place?.title || placeId),
      category: text(place?.category || place?.domain),
      source_file: text(place?.sourceFile),
      status
    };
  }).sort((a, b) => a.name.localeCompare(b.name, "nb") || a.place_id.localeCompare(b.place_id));
  const osloCategories = [...new Set(osloCoveragePlaces.map((place) => place.category))].sort((a, b) => a.localeCompare(b, "nb")).map((category) => {
    const categoryPlaces = osloCoveragePlaces.filter((place) => place.category === category);
    return {
      category,
      total: categoryPlaces.length,
      dated_evidence: categoryPlaces.filter((place) => place.status === "dated_evidence").length,
      documented_case: categoryPlaces.filter((place) => place.status === "documented_case").length,
      awaiting_source_backed_history: categoryPlaces.filter((place) => place.status === "awaiting_source_backed_history").length
    };
  });
  const osloCoverage = {
    contract: "oslo-history-coverage-v1",
    canonical_place_count: osloCoveragePlaces.length,
    dated_evidence_place_count: osloCoveragePlaces.filter((place) => place.status === "dated_evidence").length,
    documented_case_place_count: osloCoveragePlaces.filter((place) => place.status === "documented_case").length,
    awaiting_source_backed_history_count: osloCoveragePlaces.filter((place) => place.status === "awaiting_source_backed_history").length,
    categories: osloCategories,
    places: osloCoveragePlaces
  };

  return {
    version: 6,
    contract: "source-backed-history-coverage-v1",
    generated_from: [
      "data/places/places_index.json",
      "data/leksikon/manifest.json",
      "data/epoker/epoker_historie.json",
      CLAIMS_FILE,
      SOURCES_FILE,
      PLACE_EVIDENCE_FILE,
      PERIOD_MODULES_FILE,
      EMNER_FILE,
      "data/runtime/stories-all.json",
      "data/places/production/*.json",
      "data/relations.json",
      "data/relations_philanthropy.json"
    ],
    domains: {
      historie: {
        epochs: epochGroups,
        parallel_tracks: trackGroups,
        oslo_coverage: osloCoverage
      }
    },
    locations,
    stats: {
      canonical_place_count: places.length,
      located_place_count: places.length - locations.unknown_place_ids.length,
      city_located_place_count: Object.values(locations.places).filter((location) => location.city_id).length,
      canonical_claim_count: (claimsRegistry.claims || []).length,
      canonical_source_count: (sourcesRegistry.sources || []).length,
      place_evidence_link_count: (placeEvidenceRegistry.evidence_links || []).length,
      period_case_count: (periodModules.cases || []).length,
      connected_people_count: connectedPeople.size,
      connected_work_count: connectedWorks.size,
      connected_story_count: connectedStories.size,
      canonical_story_milestone_count: allEpochPlaces.reduce((sum, place) => sum + place.milestones.filter((milestone) => milestone.evidence_type === "canonical_story").length, 0),
      verified_place_production_milestone_count: allEpochPlaces.reduce((sum, place) => sum + place.milestones.filter((milestone) => milestone.evidence_type === "verified_place_production_claim").length, 0),
      indexed_place_count: uniquePlaces.size,
      epoch_place_relations: allEpochPlaces.length,
      milestone_count: allEpochPlaces.reduce((sum, place) => sum + place.milestones.length, 0)
    },
    warnings
  };
}

export function serializeEpokePlaceIndex(index = buildEpokePlaceIndex()) {
  return `${JSON.stringify(index, null, 2)}\n`;
}

function runCli() {
  const content = serializeEpokePlaceIndex();
  const outputPath = path.join(ROOT, OUTPUT);
  if (process.argv.includes("--check")) {
    assert.equal(fs.existsSync(outputPath), true, `${OUTPUT} is missing; run npm run epoker:places:build`);
    assert.equal(fs.readFileSync(outputPath, "utf8"), content, `${OUTPUT} is stale; run npm run epoker:places:build`);
    console.log(`Epoke place index is current: ${OUTPUT}`);
    return;
  }
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, content);
  const index = JSON.parse(content);
  console.log(`Wrote ${OUTPUT}: ${index.stats.indexed_place_count} places, ${index.stats.milestone_count} milestones`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) runCli();
