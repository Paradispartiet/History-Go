import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUTPUT = "data/epoker/epoke-place-index.json";

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

function ensurePlace(group, place) {
  let row = group.places.find((candidate) => candidate.place_id === place.id);
  if (!row) {
    row = {
      place_id: place.id,
      name: text(place.name || place.title || place.id),
      category: text(place.category || place.domain),
      source_file: text(place.sourceFile),
      roles: [],
      milestones: []
    };
    group.places.push(row);
  }
  return row;
}

function addMilestone(group, place, milestone, sourceFile, sources, roles) {
  const row = ensurePlace(group, place);
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
    source_file: sourceFile
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
  const epochs = history.epoker || [];
  const tracks = history.parallel_epoker || [];
  const epochGroups = Object.fromEntries(epochs.map((epoch) => [epoch.id, { places: [] }]));
  const trackGroups = Object.fromEntries(tracks.map((track) => [track.id, { places: [] }]));
  const warnings = { missing_source_files: [], unknown_place_ids: [], skipped_undated: 0, skipped_without_url_sources: 0 };

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
        addMilestone(epochGroups[epoch.id], place, milestone, sourceFile, sources, roles);
        for (const trackId of trackIdsFor(tracks, place, milestone)) {
          addMilestone(trackGroups[trackId], place, milestone, sourceFile, sources, roles);
        }
      }
    }
  }

  warnings.missing_source_files.sort();
  warnings.unknown_place_ids.sort((a, b) => a.place_id.localeCompare(b.place_id) || a.source_file.localeCompare(b.source_file));
  for (const group of Object.values(epochGroups)) finalizeGroup(group);
  for (const group of Object.values(trackGroups)) finalizeGroup(group);
  const allEpochPlaces = Object.values(epochGroups).flatMap((group) => group.places);
  const uniquePlaces = new Set(allEpochPlaces.map((place) => place.place_id));

  return {
    version: 3,
    contract: "source-backed-dated-leksikon-chronology",
    generated_from: [
      "data/places/places_index.json",
      "data/leksikon/manifest.json",
      "data/epoker/epoker_historie.json"
    ],
    domains: {
      historie: {
        epochs: epochGroups,
        parallel_tracks: trackGroups
      }
    },
    locations,
    stats: {
      canonical_place_count: places.length,
      located_place_count: places.length - locations.unknown_place_ids.length,
      city_located_place_count: Object.values(locations.places).filter((location) => location.city_id).length,
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
