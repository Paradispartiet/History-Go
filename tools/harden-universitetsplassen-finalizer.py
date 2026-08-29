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
