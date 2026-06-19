import fs from 'fs';
import path from 'path';

const root = process.cwd();
const manifestPath = path.join(root, 'data/places/manifest.json');
const reportPath = path.join(root, 'reports/place-coordinate-quality-gate.md');

// Terskler for review-signaler. Dette er lavrisiko-heuristikker for manuell
// kartkontroll, ikke fasit. Verdiene er valgt ut fra dagens r-fordeling i
// place-data (median ~160 m, p90 ~350 m) og kan justeres uten å endre
// hard-feil-semantikken.
const SMALL_RADIUS_M = 60; // "svært liten r" for steder som ser utstrakte ut
const VERY_LARGE_RADIUS_M = 500; // "svært stor r" som bør forklares med coordNote
const DUPLICATE_COORD_DECIMALS = 4; // ~11 m rutenett for nesten-identiske punkter
const ANCHOR_FAR_MIN_DISTANCE_M = 1500; // anchor regnes som "langt unna" forbi dette
const FILE_CLUSTER_MIN_PLACES = 5; // minste antall punkter før fil-klynge brukes
const FILE_CLUSTER_OUTLIER_M = 50000; // avstand fra fil-median som regnes som avvik

const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const isNum = (v) => typeof v === 'number' && Number.isFinite(v);
const rel = (p) => path.relative(root, p).replace(/\\/g, '/');
const isArchivePath = (p) => /(^|\/)arkiv(\/|$)/i.test(p);

function toPlaces(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.places)) return payload.places;
  if (Array.isArray(payload?.items)) return payload.items;
  return [];
}

function isLinearPlace(text) {
  return /(gate|vei|veien|rute|route|ring\s*\d|elv|elva|trase|sti)/i.test(text);
}

function isLargeAreaPlace(text, radius) {
  return radius >= 250 && /(park|parken|skog|marka|område|fjord|elva|vann|øy|dal)/i.test(text);
}
function isWideExtentPlace(text) {
  return /(park|parken|område|gate|vei|veien|rute|route|elv|elva|vann|fjord|dal|strekning|plass|torg)/i.test(text);
}
function isNamedInfrastructurePlace(text) {
  return /(stasjon|station|terminal|knutepunkt|park|parken|gate|torg|plass|elv|elva)/i.test(text);
}
function hasLowCoordPrecision(value) {
  if (!isNum(value)) return false;
  const decimals = String(value).split('.')[1]?.length ?? 0;
  return decimals < 4;
}

function haversineM(lat1, lon1, lat2, lon2) {
  const toRad = (d) => (d * Math.PI) / 180;
  const R = 6371000;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

const hardErrors = [];
const warnings = [];
const reviewCandidates = [];
const activeFiles = [];
const allPlaces = [];
let placesValidated = 0;

function addCandidate(place, reason, action) {
  reviewCandidates.push({
    id: place.id ?? '(mangler-id)',
    name: place.name ?? '(mangler-name)',
    category: place.category ?? '(mangler-category)',
    file: place.file,
    lat: place.lat,
    lon: place.lon,
    r: place.r,
    reason,
    action,
  });
}

const manifest = readJson(manifestPath);
const files = Array.isArray(manifest.files) ? manifest.files : [];
const activeManifestFiles = files
  .map((f) => path.join(root, 'data', f))
  .filter((f) => !isArchivePath(rel(f)));

for (const absFile of activeManifestFiles) {
  const file = rel(absFile);
  if (!fs.existsSync(absFile)) {
    hardErrors.push(`${file}: mangler fil referert i manifest`);
    continue;
  }

  let payload;
  try {
    payload = readJson(absFile);
  } catch (err) {
    hardErrors.push(`${file}: ugyldig JSON (${String(err)})`);
    continue;
  }

  activeFiles.push(file);
  for (const p of toPlaces(payload)) {
    placesValidated += 1;
    const id = p?.id;
    const name = p?.name;
    const category = p?.category;
    const lat = p?.lat;
    const lon = p?.lon;
    const r = p?.r;
    const anchors = Array.isArray(p?.anchors) ? p.anchors : null;
    const hasCoordMeta = typeof p?.coordNote === 'string' || typeof p?.coordStatus === 'string';
    const coordStatus = typeof p?.coordStatus === 'string' ? p.coordStatus : null;
    const coordSource = typeof p?.coordSource === 'string' ? p.coordSource.trim() : '';
    const hasCoordPrecision = isNum(p?.coordPrecisionM);
    const hasCoordNote = typeof p?.coordNote === 'string' && p.coordNote.trim().length > 0;

    const missingCore = [];
    if (!id) missingCore.push('id');
    if (!name) missingCore.push('name');
    if (!category) missingCore.push('category');

    const hasValidPoint = isNum(lat) && isNum(lon) && isNum(r);
    const hasAnchors = anchors && anchors.length > 0;

    if (!hasValidPoint && !hasAnchors) {
      missingCore.push('lat/lon/r eller gyldige anchors');
    }

    if (missingCore.length > 0) {
      hardErrors.push(`${file}#${id ?? '(mangler-id)'}: mangler ${missingCore.join(', ')}`);
    }

    if (lat != null && (!isNum(lat) || lat < -90 || lat > 90)) {
      hardErrors.push(`${file}#${id ?? '(mangler-id)'}: ugyldig lat (${lat})`);
    }
    if (lon != null && (!isNum(lon) || lon < -180 || lon > 180)) {
      hardErrors.push(`${file}#${id ?? '(mangler-id)'}: ugyldig lon (${lon})`);
    }

    if (r == null || !isNum(r) || r <= 0 || r > 10000) {
      hardErrors.push(`${file}#${id ?? '(mangler-id)'}: ugyldig r (${r})`);
    }

    if (anchors) {
      for (const [idx, a] of anchors.entries()) {
        const prefix = `${file}#${id ?? '(mangler-id)'}: anchor[${idx}]`;
        if (!a?.id) hardErrors.push(`${prefix} mangler id`);
        if (!a?.name) hardErrors.push(`${prefix} mangler name`);
        if (!isNum(a?.lat) || a.lat < -90 || a.lat > 90) hardErrors.push(`${prefix} mangler/ugyldig lat (${a?.lat})`);
        if (!isNum(a?.lon) || a.lon < -180 || a.lon > 180) hardErrors.push(`${prefix} mangler/ugyldig lon (${a?.lon})`);
        if (!isNum(a?.r) || a.r <= 0 || a.r > 10000) hardErrors.push(`${prefix} mangler/ugyldig r (${a?.r})`);
        if (!a?.type) hardErrors.push(`${prefix} mangler type`);
      }
    }

    const text = `${name ?? ''} ${category ?? ''}`;
    if (isLinearPlace(text) && !hasAnchors) {
      warnings.push(`${file}#${id ?? '(mangler-id)'}: lineært sted uten anchors`);
    }
    if (isLargeAreaPlace(text, isNum(r) ? r : -1) && !hasCoordMeta) {
      warnings.push(`${file}#${id ?? '(mangler-id)'}: stort område uten coordNote/coordStatus`);
    }
    if (coordStatus === 'verified' && !coordSource) {
      warnings.push(`${file}#${id ?? '(mangler-id)'}: coordStatus=verified uten coordSource`);
    }
    if (coordStatus === 'verified' && !hasCoordPrecision) {
      warnings.push(`${file}#${id ?? '(mangler-id)'}: coordStatus=verified uten coordPrecisionM`);
    }
    if (coordStatus === 'verified' && isWideExtentPlace(text) && !hasCoordNote) {
      warnings.push(`${file}#${id ?? '(mangler-id)'}: coordStatus=verified uten coordNote for område/gate/rute`);
    }
    if (hasLowCoordPrecision(lat) || hasLowCoordPrecision(lon)) {
      warnings.push(`${file}#${id ?? '(mangler-id)'}: lav koordinatpresisjon (<4 desimaler)`);
    }

    allPlaces.push({
      id,
      name,
      category,
      lat,
      lon,
      r,
      file,
      anchors,
      coordStatus,
      coordSource,
      hasCoordPrecision,
      hasCoordNote,
      text,
      hasValidPoint: isNum(lat) && isNum(lon),
    });
  }
}

// --- Review-kandidater ---
// Signalene under beviser ikke at en posisjon er feil. De peker ut steder der
// repo-data alene ikke gir grunn til å stole på punktet, slik at de kan
// kontrolleres manuelt mot kart.

for (const p of allPlaces) {
  const radius = isNum(p.r) ? p.r : null;
  const hasAnchors = p.anchors && p.anchors.length > 0;

  if (isLinearPlace(p.text) && !hasAnchors) {
    addCandidate(
      p,
      'lineært sted uten anchors',
      'Sjekk strekningen på kart; legg til anchors langs ruta eller coordNote som forklarer valgt punkt.'
    );
  }

  if (isLargeAreaPlace(p.text, radius ?? -1) && !hasAnchors && !p.hasCoordNote) {
    addCandidate(
      p,
      'park/stort område uten anchors eller coordNote',
      'Sjekk om punktet ligger sentralt i området; legg til anchors eller coordNote.'
    );
  }

  if (p.coordStatus === 'verified' && !p.coordSource) {
    addCandidate(
      p,
      'coordStatus=verified uten coordSource',
      'Legg til coordSource som dokumenterer verifiseringen, eller nedgrader coordStatus.'
    );
  }

  if (p.coordStatus === 'verified' && !p.hasCoordPrecision) {
    addCandidate(
      p,
      'coordStatus=verified uten coordPrecisionM',
      'Legg til coordPrecisionM etter manuell kartkontroll, eller nedgrader coordStatus.'
    );
  }

  if (hasLowCoordPrecision(p.lat) || hasLowCoordPrecision(p.lon)) {
    addCandidate(
      p,
      'lav koordinatpresisjon (<4 desimaler)',
      'Slå opp stedet manuelt på kart og oppgi lat/lon med minst 4 desimaler.'
    );
  }

  if (
    radius != null &&
    radius > 0 &&
    radius < SMALL_RADIUS_M &&
    isWideExtentPlace(p.text)
  ) {
    addCandidate(
      p,
      `svært liten r (<${SMALL_RADIUS_M} m) for sted som ser utstrakt ut`,
      'Navn/kategori tyder på park/gate/elv/område/rute/plass; vurder større r eller anchors.'
    );
  }

  if (radius != null && radius >= VERY_LARGE_RADIUS_M && !p.hasCoordNote) {
    addCandidate(
      p,
      `svært stor r (>=${VERY_LARGE_RADIUS_M} m) uten coordNote`,
      'Forklar den store radiusen med coordNote, eller stram inn r etter kartkontroll.'
    );
  }

  if (isNamedInfrastructurePlace(p.text) && !p.coordStatus && !p.coordSource && !p.hasCoordNote) {
    addCandidate(
      p,
      'stasjon/park/gate/torg/elv uten coordinate metadata',
      'Sjekk punktet manuelt og legg til coordStatus/coordSource/coordNote.'
    );
  }

  if (hasAnchors && p.hasValidPoint) {
    const distances = p.anchors
      .filter((a) => isNum(a?.lat) && isNum(a?.lon))
      .map((a) => ({
        anchor: a,
        dist: haversineM(p.lat, p.lon, a.lat, a.lon),
      }));

    if (!p.hasCoordNote) {
      for (const { anchor, dist } of distances) {
        const limit = Math.max(ANCHOR_FAR_MIN_DISTANCE_M, (radius ?? 0) * 3);
        if (dist > limit) {
          addCandidate(
            p,
            'anchor langt unna hovedpunktet uten coordNote',
            `Anchor "${anchor.id}" ligger ~${Math.round(dist)} m fra hovedpunktet; sjekk på kart og dokumenter med coordNote.`
          );
        }
      }
    }

    if (distances.length > 0 && !p.hasCoordNote) {
      const nearAny = distances.some(({ anchor, dist }) => {
        const reach = (radius ?? 0) + (isNum(anchor?.r) ? anchor.r : 0);
        return dist <= Math.max(reach, ANCHOR_FAR_MIN_DISTANCE_M);
      });
      if (!nearAny) {
        addCandidate(
          p,
          'hovedpunkt ligger ikke nær noen anchor',
          'Sjekk om hovedpunktet bør flyttes nærmere ruta/området, eller dokumenter plasseringen med coordNote.'
        );
      }
    }
  }
}

// Nesten-identiske koordinater på tvers av place IDs (samme ~11 m-rute).
const coordBuckets = new Map();
for (const p of allPlaces) {
  if (!p.hasValidPoint) continue;
  const key = `${p.lat.toFixed(DUPLICATE_COORD_DECIMALS)},${p.lon.toFixed(DUPLICATE_COORD_DECIMALS)}`;
  if (!coordBuckets.has(key)) coordBuckets.set(key, []);
  coordBuckets.get(key).push(p);
}
for (const [, group] of coordBuckets) {
  const distinctIds = new Set(group.map((p) => p.id));
  if (distinctIds.size < 2) continue;
  for (const p of group) {
    if (p.hasCoordNote) continue;
    const others = [...distinctIds].filter((id) => id !== p.id).join(', ');
    addCandidate(
      p,
      'identisk/nesten identisk lat/lon som annet sted uten forklaring',
      `Deler punkt med: ${others}. Bekreft at stedene faktisk overlapper, eller juster koordinatene; dokumenter med coordNote.`
    );
  }
}

// Datadrevet avstandssignal: punkter som ligger svært langt fra medianen av de
// andre punktene i samme fil. Dette er kun et lavrisiko review-signal og
// hardkoder ingen by eller region.
const median = (values) => {
  const s = [...values].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 === 0 ? (s[mid - 1] + s[mid]) / 2 : s[mid];
};
const byFile = new Map();
for (const p of allPlaces) {
  if (!p.hasValidPoint) continue;
  if (!byFile.has(p.file)) byFile.set(p.file, []);
  byFile.get(p.file).push(p);
}
for (const [, group] of byFile) {
  if (group.length < FILE_CLUSTER_MIN_PLACES) continue;
  const medLat = median(group.map((p) => p.lat));
  const medLon = median(group.map((p) => p.lon));
  for (const p of group) {
    const dist = haversineM(p.lat, p.lon, medLat, medLon);
    if (dist > FILE_CLUSTER_OUTLIER_M) {
      addCandidate(
        p,
        'ligger svært langt fra de andre stedene i samme fil',
        `Punktet ligger ~${Math.round(dist / 1000)} km fra fil-medianen; sjekk manuelt at lat/lon ikke er forvekslet eller feiltastet.`
      );
    }
  }
}

// --- Rapport ---
const fmt = (v) => (v == null ? '–' : String(v));
const candidatesByReason = new Map();
for (const c of reviewCandidates) {
  if (!candidatesByReason.has(c.reason)) candidatesByReason.set(c.reason, []);
  candidatesByReason.get(c.reason).push(c);
}
const uniqueCandidatePlaces = new Set(reviewCandidates.map((c) => `${c.file}#${c.id}`));

const generatedAt = new Date().toISOString();
let md = `# Place coordinate quality gate\n\n`;
md += `Generert: ${generatedAt}\n\n`;
md += `## Oppsummering\n`;
md += `- Aktive filer validert: **${activeFiles.length}**\n`;
md += `- Antall steder validert: **${placesValidated}**\n`;
md += `- Harde feil: **${hardErrors.length}**\n`;
md += `- Varsler: **${warnings.length}**\n`;
md += `- Coordinate review candidates: **${reviewCandidates.length}** signaler fordelt på **${uniqueCandidatePlaces.size}** steder\n\n`;
md += `Nivåene betyr:\n`;
md += `- **Harde feil**: formelle koordinatfeil (ugyldig/manglende lat/lon/r, ødelagte anchors, manglende filer). Disse stopper gaten.\n`;
md += `- **Varsler**: sannsynlige posisjonsrisikoer basert på enkle heuristikker.\n`;
md += `- **Coordinate review candidates**: steder der repo-data alene ikke gir grunn til å stole på punktet. Signalene beviser ikke at posisjonen er feil – de peker ut kandidater for manuell kartkontroll.\n\n`;
md += `## Aktive filer validert\n`;
md += `${activeFiles.map((f) => `- ${f}`).join('\n') || '- Ingen'}\n\n`;
md += `## Harde feil\n`;
md += `${hardErrors.map((e) => `- ${e}`).join('\n') || '- Ingen'}\n\n`;
md += `## Varsler\n`;
md += `${warnings.map((w) => `- ${w}`).join('\n') || '- Ingen'}\n\n`;
md += `## Coordinate review candidates\n\n`;
if (reviewCandidates.length === 0) {
  md += `- Ingen\n\n`;
} else {
  md += `Totalt ${reviewCandidates.length} signaler fordelt på ${uniqueCandidatePlaces.size} steder. `;
  md += `Et sted kan ha flere signaler. Kandidatene under er gruppert etter grunn.\n\n`;
  md += `### Antall per grunn\n\n`;
  md += `| Grunn | Antall |\n| --- | --- |\n`;
  for (const [reason, group] of candidatesByReason) {
    md += `| ${reason} | ${group.length} |\n`;
  }
  md += `\n`;
  for (const [reason, group] of candidatesByReason) {
    md += `### ${reason} (${group.length})\n\n`;
    md += `| id | name | category | fil | lat | lon | r | Foreslått manuell handling |\n`;
    md += `| --- | --- | --- | --- | --- | --- | --- | --- |\n`;
    for (const c of group) {
      md += `| ${fmt(c.id)} | ${fmt(c.name)} | ${fmt(c.category)} | ${fmt(c.file)} | ${fmt(c.lat)} | ${fmt(c.lon)} | ${fmt(c.r)} | ${c.action} |\n`;
    }
    md += `\n`;
  }
}
md += `## Anbefalt kommando\n`;
md += `- \`node tools/place-coordinate-quality-gate.mjs\`\n`;

fs.mkdirSync(path.dirname(reportPath), { recursive: true });
fs.writeFileSync(reportPath, md);

if (hardErrors.length > 0) {
  console.error(
    `Quality gate feilet: ${hardErrors.length} hard(e) feil, ${warnings.length} varsel, ${reviewCandidates.length} review-kandidatsignal(er).`
  );
  process.exit(1);
}

console.log(
  `Quality gate ok: ${activeFiles.length} filer, ${placesValidated} steder, ${warnings.length} varsel, ${reviewCandidates.length} review-kandidatsignal(er) på ${uniqueCandidatePlaces.size} steder (se reports/place-coordinate-quality-gate.md).`
);
