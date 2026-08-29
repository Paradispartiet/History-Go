from pathlib import Path
import re

path = Path("tools/finalize-universitetsplassen-completion.mjs")
text = path.read_text()

if 'api.searchParams.set("iiurlwidth", "1600")' not in text:
    marker = 'api.searchParams.set("origin", "*");'
    if marker not in text:
        raise SystemExit("Commons origin marker not found")
    text = text.replace(marker, marker + '\n  api.searchParams.set("iiurlwidth", "1600");', 1)

if 'originalUrl: info.thumburl || info.url,' not in text:
    text, count = re.subn(r'originalUrl:\s*info\.url\s*,', 'originalUrl: info.thumburl || info.url,', text, count=1)
    if count != 1:
        raise SystemExit("Commons image URL assignment not found")

text = text.replace(
    'History-Go-place-production/1.0"',
    'History-Go-place-production/1.0 (github.com/Paradispartiet/History-Go)"'
)

fetch_replacement = r'''const imageBufferCache = new Map();
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchBuffer(url) {
  const parsed = new URL(url);
  for (const key of ["utm_source", "utm_campaign", "utm_content"]) parsed.searchParams.delete(key);
  const cleanUrl = parsed.toString();
  if (imageBufferCache.has(cleanUrl)) return imageBufferCache.get(cleanUrl);

  let lastStatus = 0;
  for (let attempt = 0; attempt < 6; attempt += 1) {
    const response = await fetch(cleanUrl, {
      headers: {
        "user-agent": "History-Go-place-production/1.0 (github.com/Paradispartiet/History-Go)",
        "accept": "image/avif,image/webp,image/*,*/*;q=0.8"
      }
    });
    lastStatus = response.status;
    if (response.ok) {
      const buffer = Buffer.from(await response.arrayBuffer());
      imageBufferCache.set(cleanUrl, buffer);
      await sleep(750);
      return buffer;
    }
    if (![429, 500, 502, 503, 504].includes(response.status)) {
      throw new Error(`Kunne ikke hente bilde (${response.status}): ${cleanUrl}`);
    }
    const retryAfter = Number(response.headers.get("retry-after"));
    const delay = Number.isFinite(retryAfter) && retryAfter > 0
      ? Math.min(retryAfter * 1000, 30000)
      : Math.min(1500 * (2 ** attempt), 30000);
    await sleep(delay);
  }
  throw new Error(`Kunne ikke hente bilde etter retries (${lastStatus}): ${cleanUrl}`);
}

async function outputImage'''
pattern = r'async function fetchBuffer\(url\)\s*\{.*?\n\}\s*\n\s*async function outputImage'
text, count = re.subn(pattern, fetch_replacement, text, count=1, flags=re.S)
if count != 1 and 'const imageBufferCache = new Map();' not in text:
    raise SystemExit("fetchBuffer function not found")

# Avoid Intl.Segmenter splitting spaced initials into artificial sentences.
text = text.replace("P. A. Munch", "Peter Andreas Munch")

# Keep temporal wording aligned with the v4.2.1 validator: exact timeline years
# must occur literally in timeline claims, while comparison prose must not use
# the validator's current-time marker "nå" unless it is genuinely current.
text = text.replace(
    "Universitetsplassen ble lagt om i 1930–31 etter planer av Bjercke og Eliassen.",
    "Omleggingen av Universitetsplassen ble fullført i 1931 etter arbeid i 1930–31, etter planer av Bjercke og Eliassen."
)
text = text.replace(
    "Bildene kan brukes til å sammenligne plassflate, monumenter og bygningsfront, men de er ikke et optisk identisk før-og-nå-par.",
    "Bildene kan sammenlignes for plassflate, monumenter og bygningsfront, men ståstedet er ulikt og sammenstillingen er ikke optisk identisk."
)

# Universitetsplassen own-place cleanup across every canonical people source in
# data/people/manifest.json. Keep each person and all other legitimate place
# relations; remove only stale direct Universitetsplassen ownership except Grosch.
cleanup_marker = 'const universPeopleManifestFile = "data/people/manifest.json";'
if cleanup_marker not in text:
    anchor = 'write(peopleFile, people);\n\nconst brandsMasterFile = "data/brands/brands_master.json";'
    if anchor not in text:
        raise SystemExit("People cleanup insertion anchor not found")
    cleanup = r'''write(peopleFile, people);

const universPeopleManifestFile = "data/people/manifest.json";
const universPeopleManifest = read(universPeopleManifestFile);
for (const relativePersonFile of universPeopleManifest.files || []) {
  const canonicalPersonFile = `data/${relativePersonFile}`;
  if (!fs.existsSync(path.join(root, canonicalPersonFile))) continue;
  const rawPeople = read(canonicalPersonFile);
  const personRecords = Array.isArray(rawPeople)
    ? rawPeople
    : rawPeople && typeof rawPeople === "object" && typeof rawPeople.id === "string"
      ? [rawPeople]
      : [];
  let changed = false;
  for (const person of personRecords) {
    if (!person || person.id === "christian_heinrich_grosch") continue;
    for (const key of ["places", "place_ids", "placeIds", "related_place_ids"]) {
      if (!Array.isArray(person[key]) || !person[key].includes(placeId)) continue;
      person[key] = person[key].filter((id) => id !== placeId);
      changed = true;
    }
    for (const key of ["placeId", "place_id", "place", "source_place_id", "primary_place_id"]) {
      if (person[key] !== placeId) continue;
      const replacement = [person.places, person.place_ids, person.placeIds]
        .find((values) => Array.isArray(values) && values.length > 0)?.[0];
      if (replacement) person[key] = replacement;
      else delete person[key];
      changed = true;
    }
  }
  if (changed) write(canonicalPersonFile, rawPeople);
}

const brandsMasterFile = "data/brands/brands_master.json";'''
    text = text.replace(anchor, cleanup, 1)

popup_replacement = '''const popupCoverage = coverage(popupDesc, [
  ["claim_universitetsplassen_identity"],
  ["claim_universitetsplassen_founding"],
  ["claim_universitetsplassen_cornerstone"],
  ["claim_universitetsplassen_grosch"],
  ["claim_universitetsplassen_grosch"],
  ["claim_universitetsplassen_use_1851_54"],
  ["claim_universitetsplassen_urbygningen"],
  ["claim_universitetsplassen_schweigaard", "claim_universitetsplassen_pamunch"],
  ["claim_universitetsplassen_schweigaard"],
  ["claim_universitetsplassen_pamunch"],
  ["claim_universitetsplassen_pamunch"],
  ["claim_universitetsplassen_schweigaard", "claim_universitetsplassen_pamunch", "claim_universitetsplassen_munch"],
  ["claim_universitetsplassen_aula"],
  ["claim_universitetsplassen_munch"],
  ["claim_universitetsplassen_munch"],
  ["claim_universitetsplassen_aula", "claim_universitetsplassen_munch"],
  ["claim_universitetsplassen_repaving"],
  ["claim_universitetsplassen_repaving", "claim_universitetsplassen_immatriculation"],
  ["claim_universitetsplassen_immatriculation"],
  ["claim_universitetsplassen_tree"],
  ["claim_universitetsplassen_historic_photo"],
  ["claim_universitetsplassen_current_photo"],
  ["claim_universitetsplassen_historic_photo", "claim_universitetsplassen_current_photo"],
  ["claim_universitetsplassen_identity", "claim_universitetsplassen_grosch", "claim_universitetsplassen_schweigaard", "claim_universitetsplassen_pamunch", "claim_universitetsplassen_aula"],
  ["claim_universitetsplassen_grosch"],
  ["claim_universitetsplassen_identity"],
  ["claim_universitetsplassen_grosch", "claim_universitetsplassen_aula", "claim_universitetsplassen_use_1851_54"]
]);'''
popup_pattern = r'const popupCoverage = coverage\(popupDesc, \[.*?\n\]\);'
text, count = re.subn(popup_pattern, popup_replacement, text, count=1, flags=re.S)
if count != 1 and popup_replacement not in text:
    raise SystemExit("popupCoverage block not found")

path.write_text(text)
