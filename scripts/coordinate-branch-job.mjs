import { readFileSync, mkdirSync, writeFileSync } from "node:fs";

const DATE = "2026-07-23";
const placeId = "fotogalleriet";
const reportDir = "reports/visitoslo-galleries-audit-20260723/fotogalleriet-map-disambiguation";
mkdirSync(reportDir, { recursive: true });

const OFFICIAL_VISIT_URL = "https://fotogalleriet.no/visit/";
const OFFICIAL_MAP_SHORT_URL = "https://maps.app.goo.gl/AaMRNLjcry6DSwZT9";

function norm(value) {
  return String(value ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/ø/g, "o").replace(/æ/g, "ae").replace(/å/g, "a").replace(/[^a-z0-9]+/g, " ").trim();
}
function haversineMeters(a, b) {
  const rad = (d) => d * Math.PI / 180;
  const R = 6371000;
  const dLat = rad(b.lat - a.lat);
  const dLon = rad(b.lon - a.lon);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
function parseCoordinates(text) {
  const candidates = [];
  const patterns = [
    /@(-?\d{1,3}\.\d+),(-?\d{1,3}\.\d+)/g,
    /(?:query|destination|center)=(-?\d{1,3}\.\d+)%?2C(-?\d{1,3}\.\d+)/g,
    /(?:query|destination|center)=(-?\d{1,3}\.\d+),(-?\d{1,3}\.\d+)/g,
    /"latitude"\s*:\s*(-?\d{1,3}\.\d+)[\s\S]{0,100}?"longitude"\s*:\s*(-?\d{1,3}\.\d+)/g,
    /(-?\d{2}\.\d{5,}),\s*(-?\d{1,2}\.\d{5,})/g
  ];
  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(text))) {
      const lat = Number(match[1]);
      const lon = Number(match[2]);
      if (lat >= 59.8 && lat <= 60.1 && lon >= 10.5 && lon <= 10.95) candidates.push({ lat, lon, matched: match[0] });
    }
  }
  const unique = new Map();
  for (const candidate of candidates) unique.set(`${candidate.lat.toFixed(7)},${candidate.lon.toFixed(7)}`, candidate);
  return [...unique.values()];
}
async function fetchText(url, options = {}) {
  const response = await fetch(url, { redirect: "follow", headers: { "User-Agent": "History-Go-coordinate-audit/1.0", Accept: "text/html,*/*" }, ...options });
  const text = await response.text();
  return { ok: response.ok, status: response.status, finalUrl: response.url, text, headers: Object.fromEntries(response.headers.entries()) };
}

const indexRaw = JSON.parse(readFileSync("data/places/places_index.json", "utf8"));
const places = Array.isArray(indexRaw) ? indexRaw : indexRaw.places ?? [];
if (places.some((p) => p.id === placeId || norm(p.name) === norm("Fotogalleriet"))) throw new Error("Fotogalleriet already canonical on current main.");

// Verify the official visit page still contains the expected institution-provided map link.
const visit = await fetchText(OFFICIAL_VISIT_URL);
if (!visit.ok) throw new Error(`Official Fotogalleriet visit page failed: HTTP ${visit.status}`);
if (!visit.text.includes("AaMRNLjcry6DSwZT9") && !visit.text.includes(OFFICIAL_MAP_SHORT_URL)) {
  throw new Error("Official Fotogalleriet visit page no longer exposes the locked map link; manual review required.");
}

// Fetch all four official address points first.
const geoUrl = `https://ws.geonorge.no/adresser/v1/sok?sok=${encodeURIComponent("Møllergata 34 0179 Oslo")}`;
const geoResponse = await fetch(geoUrl, { headers: { Accept: "application/json" } });
if (!geoResponse.ok) throw new Error(`Geonorge HTTP ${geoResponse.status}`);
const geoPayload = await geoResponse.json();
const hits = (geoPayload?.adresser ?? []).filter((hit) => norm(hit.adressenavn) === norm("Møllergata") && String(hit.nummer ?? "") === "34" && String(hit.postnummer ?? "") === "0179" && String(hit.kommunenummer ?? "") === "0301" && ["A", "B", "C", "D"].includes(String(hit.bokstav ?? "")));
if (hits.length !== 4) throw new Error(`Expected four Møllergata 34A-D hits, found ${hits.length}`);
const addressPoints = hits.map((hit) => ({
  label: `Møllergata 34${hit.bokstav}`,
  letter: String(hit.bokstav),
  sourceObjectId: `geonorge-adresser-v1:${hit.kommunenummer}:${hit.adressekode}:${hit.nummer}${hit.bokstav}`,
  lat: Number(hit.representasjonspunkt?.lat),
  lon: Number(hit.representasjonspunkt?.lon),
  rawHit: hit
}));

// Follow the official institution-provided Google Maps short link and parse any Oslo coordinate encoded
// in the final URL or returned HTML. This is disambiguation evidence only; the applied coordinate remains Geonorge.
const map = await fetchText(OFFICIAL_MAP_SHORT_URL);
if (!map.ok) throw new Error(`Official map link failed: HTTP ${map.status}`);
const coordinateCandidates = parseCoordinates(`${map.finalUrl}\n${map.text}`);
if (!coordinateCandidates.length) {
  writeFileSync(`${reportDir}/unresolved-map-response.json`, `${JSON.stringify({ version: DATE, officialVisitUrl: OFFICIAL_VISIT_URL, officialMapShortUrl: OFFICIAL_MAP_SHORT_URL, finalUrl: map.finalUrl, httpStatus: map.status, htmlPreview: map.text.slice(0, 5000), addressPoints }, null, 2)}\n`, "utf8");
  throw new Error("Official Fotogalleriet map link could be fetched but no unambiguous Oslo coordinate could be parsed from its final URL or response.");
}

const rankedMapCandidates = coordinateCandidates.map((mapPoint) => {
  const rankedAddresses = addressPoints.map((address) => ({ ...address, distanceM: Math.round(haversineMeters(mapPoint, address) * 10) / 10 })).sort((a, b) => a.distanceM - b.distanceM);
  return { mapPoint, rankedAddresses, nearestDistanceM: rankedAddresses[0].distanceM, marginToSecondM: Math.round((rankedAddresses[1].distanceM - rankedAddresses[0].distanceM) * 10) / 10 };
}).sort((a, b) => a.nearestDistanceM - b.nearestDistanceM);

const viable = rankedMapCandidates.filter((candidate) => candidate.nearestDistanceM <= 60 && candidate.marginToSecondM >= 5);
const uniqueWinningSourceIds = [...new Set(viable.map((candidate) => candidate.rankedAddresses[0].sourceObjectId))];
if (uniqueWinningSourceIds.length !== 1) {
  writeFileSync(`${reportDir}/ambiguous-map-disambiguation.json`, `${JSON.stringify({ version: DATE, finalUrl: map.finalUrl, coordinateCandidates, rankedMapCandidates, addressPoints }, null, 2)}\n`, "utf8");
  throw new Error(`Official map-link disambiguation did not select exactly one Geonorge address object. Viable winners: ${JSON.stringify(uniqueWinningSourceIds)}`);
}

const selectedSourceId = uniqueWinningSourceIds[0];
const selectedAddress = addressPoints.find((address) => address.sourceObjectId === selectedSourceId);
const supportingMapPoints = viable.filter((candidate) => candidate.rankedAddresses[0].sourceObjectId === selectedSourceId);
const best = supportingMapPoints.sort((a, b) => a.nearestDistanceM - b.nearestDistanceM)[0];

const result = {
  version: DATE,
  placeId,
  status: "verified_address_candidate_from_official_map_disambiguation",
  selectionRule: "The institution publishes an unlettered Møllergata 34 address but links to a concrete Google Maps place. The official institution-provided map coordinate is used only to disambiguate among four official Geonorge 34A-D objects; the applied source remains the uniquely selected Geonorge address object. No nearest/first-hit is accepted unless one address is within 60 m and at least 5 m closer than the second-nearest, consistently across viable parsed map coordinates.",
  officialVisitUrl: OFFICIAL_VISIT_URL,
  officialMapShortUrl: OFFICIAL_MAP_SHORT_URL,
  mapResolution: {
    finalUrl: map.finalUrl,
    parsedCoordinateCandidates: coordinateCandidates,
    rankedMapCandidates,
    selectedDisambiguationPoint: best.mapPoint,
    selectedDistanceM: best.nearestDistanceM,
    marginToSecondM: best.marginToSecondM
  },
  coordinate: {
    lat: selectedAddress.lat,
    lon: selectedAddress.lon,
    r: 55,
    locatorType: "building",
    sourceProvider: "official_address",
    sourceObjectId: selectedAddress.sourceObjectId,
    address: { street: "Møllergata", number: `34${selectedAddress.letter}`, postcode: "0179", city: "Oslo", country: "NO" },
    geocodeAccuracy: "rooftop",
    coordRole: "display_marker",
    coordStatus: "verified",
    coordSource: "geonorge_adresser_v1",
    coordSourceId: selectedAddress.sourceObjectId,
    coordSourceUrl: geoUrl,
    coordType: "address_point",
    coordNote: `Offisiell Geonorge-adressekoordinat for ${selectedAddress.label}, valgt blant Møllergata 34A-D ved hjelp av Fotogalleriets egen besøksides konkrete Google Maps-lenke som disambigueringsbevis. Google Maps-koordinaten brukes ikke som canonical kilde; den identifiserer bare hvilket offisielt Geonorge-adresseobjekt institusjonens egen kartlenke peker klart nærmest på.`
  },
  allOfficialAddressPoints: addressPoints.map(({ rawHit, ...rest }) => rest)
};
writeFileSync(`${reportDir}/result.json`, `${JSON.stringify(result, null, 2)}\n`, "utf8");
writeFileSync(`${reportDir}/README.md`, `# Fotogalleriet — official map-link address disambiguation\n\nDate: ${DATE}\n\nStatus: **${result.status}**\n\nSelected official address object: **${result.coordinate.sourceObjectId}**\n\nCoordinate: **${result.coordinate.lat}, ${result.coordinate.lon}**\n\nThe applied coordinate remains an official Geonorge address point. Fotogalleriet's own Google Maps link is used only to choose among the four lettered Møllergata 34 address objects.\n`, "utf8");
console.log(`Fotogalleriet map disambiguation: ${selectedAddress.label}; ${selectedAddress.sourceObjectId}; ${selectedAddress.lat},${selectedAddress.lon}; distance=${best.nearestDistanceM}m; margin=${best.marginToSecondM}m`);
