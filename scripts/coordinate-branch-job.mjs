import fs from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const historyRoot = path.join(root, 'data/places/historie/oslo');
const evidenceRoot = path.join(root, 'data/coordinate-evidence/oslo/historie');
const reportDir = path.join(root, 'reports/oslo-coordinate-historical-sites-production-20260725');
const decisionsPath = 'reports/oslo-coordinate-historical-sites-research-20260725/final-decisions.json';
await fs.mkdir(evidenceRoot, { recursive: true });
await fs.mkdir(reportDir, { recursive: true });

const decisions = JSON.parse(await fs.readFile(path.join(root, decisionsPath), 'utf8'));
const accepted = new Map(decisions.acceptedForProduction.map((item) => [item.placeId, item]));
const blocked = new Map(decisions.blockedNeedsSource.map((item) => [item.placeId, item]));
const targetIds = new Set([...accepted.keys(), ...blocked.keys()]);
const verifiedAt = '2026-07-25';

const geometryMetrics = {
  clemenskirken: 21.3,
  korskirken: 18.7,
  mariakirken: 36.3,
  olavsklosteret: 42.6,
};

async function walk(dir) {
  const out = [];
  let entries = [];
  try { entries = await fs.readdir(dir, { withFileTypes: true }); } catch { return out; }
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...await walk(full));
    else if (entry.isFile() && entry.name.endsWith('.json')) out.push(full);
  }
  return out;
}
const rel = (file) => path.relative(root, file).split(path.sep).join('/');
const writeJson = async (file, value) => fs.writeFile(file, `${JSON.stringify(value, null, 2)}\n`, 'utf8');

function mergeLinks(existing, additions) {
  const result = Array.isArray(existing) ? [...existing] : [];
  const seen = new Set(result.map((item) => item?.url).filter(Boolean));
  for (const item of additions) {
    if (!item?.url || seen.has(item.url)) continue;
    result.push(item);
    seen.add(item.url);
  }
  return result;
}

function acceptedNote(item) {
  const parts = [item.evidenceSummary];
  if (Number.isFinite(item.displacementMeters)) parts.push(`Den tidligere markøren lå ${item.displacementMeters} meter fra det valgte ankeret.`);
  if (item.placeId === 'hallvardskatedralen') parts.push('OSM way 1286772112 ble forkastet fordi objektet er Olavsklosteret.');
  if (item.placeId === 'kongsgarden_middelalder_oslo') parts.push('OSM node 2679052764 ble forkastet fordi objektet er et informasjonsskilt.');
  if (item.placeId === 'tukthuset') parts.push('Adressepunktet representerer historisk lokalisering av et revet anlegg og er ikke bevart bygningsgeometri.');
  return parts.join(' ');
}
function blockedNote(item) {
  return `${item.blockedReason} Dagens koordinat beholdes kun som uverifisert historisk proxy og skal ikke tolkes som dokumentert fysisk sentrum.`;
}
function sourceLinks(item) {
  const links = [];
  const sourceEntries = [
    ['Historisk identitetskilde', item.identitySourceUrl],
    ['Kildegeometri', item.geometrySourceUrl],
    ['Publisert historisk locator', item.locatorSourceUrl],
    ['Offisielt adressepunkt', item.addressSourceUrl],
  ];
  for (const [label, url] of sourceEntries) {
    if (!url) continue;
    links.push({ type: 'source', label, url, lang: 'nb', verifiedAt });
  }
  return links;
}
function isFullPlace(node) {
  return Object.prototype.hasOwnProperty.call(node, 'desc')
    || Object.prototype.hasOwnProperty.call(node, 'popupDesc')
    || Array.isArray(node.rounds)
    || Array.isArray(node.emne_ids)
    || Object.prototype.hasOwnProperty.call(node, 'quiz_profile');
}

const occurrenceLog = new Map([...targetIds].map((id) => [id, []]));
const beforeById = new Map();

function updateNode(node, filePath) {
  if (Array.isArray(node)) return node.map((value) => updateNode(value, filePath));
  if (!node || typeof node !== 'object') return node;

  let current = node;
  const placeId = typeof node.id === 'string' ? node.id : null;
  const isCoordinateOccurrence = placeId && targetIds.has(placeId)
    && Number.isFinite(node.lat) && Number.isFinite(node.lon) && Number.isFinite(node.r);

  if (isCoordinateOccurrence) {
    if (!beforeById.has(placeId) && isFullPlace(node)) {
      beforeById.set(placeId, {
        lat: node.lat,
        lon: node.lon,
        r: node.r,
        coordStatus: node.coordStatus ?? null,
        coordType: node.coordType ?? null,
        year: node.year ?? null,
      });
    }
    const full = isFullPlace(node);
    const acceptedItem = accepted.get(placeId);
    const blockedItem = blocked.get(placeId);
    if (acceptedItem) {
      const note = acceptedNote(acceptedItem);
      current = {
        ...node,
        lat: acceptedItem.recommendedLat,
        lon: acceptedItem.recommendedLon,
        r: acceptedItem.recommendedRadius,
        coordStatus: acceptedItem.coordStatus,
        coordType: acceptedItem.coordType,
      };
      if (full) {
        current = {
          ...current,
          locatorType: acceptedItem.locatorType,
          sourceProvider: acceptedItem.sourceProvider,
          sourceObjectId: acceptedItem.sourceObjectId,
          geocodeAccuracy: acceptedItem.geocodeAccuracy,
          coordRole: acceptedItem.coordRole,
          coordSource: 'manual_historical_research',
          coordSourceId: acceptedItem.sourceObjectId,
          coordSourceUrl: acceptedItem.geometrySourceUrl || acceptedItem.locatorSourceUrl || acceptedItem.addressSourceUrl || acceptedItem.identitySourceUrl,
          coordVerifiedAt: verifiedAt,
          coordNote: note,
          externalLinks: mergeLinks(node.externalLinks, sourceLinks(acceptedItem)),
        };
        if (acceptedItem.geometrySourceUrl) {
          current.geometry = {
            type: 'source_object_reference',
            role: 'historical_site_geometry',
            sourceProvider: 'osm',
            sourceObjectId: acceptedItem.sourceObjectId,
            maximumDistanceMeters: geometryMetrics[placeId],
          };
        } else if (Object.prototype.hasOwnProperty.call(current, 'geometry')) {
          delete current.geometry;
        }
      }
    } else if (blockedItem) {
      const sourceObjectId = `history-go-research:historical-sites-20260725:${placeId}`;
      current = {
        ...node,
        coordStatus: blockedItem.coordStatus,
        coordType: blockedItem.coordType,
      };
      if (full) {
        current = {
          ...current,
          locatorType: blockedItem.locatorType,
          sourceProvider: 'manual_research',
          sourceObjectId,
          geocodeAccuracy: 'historical_approximation',
          coordRole: 'historical_anchor',
          coordSource: 'manual_historical_research',
          coordSourceId: sourceObjectId,
          coordSourceUrl: blockedItem.locatorSourceUrl || blockedItem.identitySourceUrl,
          coordNote: blockedNote(blockedItem),
          externalLinks: mergeLinks(node.externalLinks, sourceLinks(blockedItem)),
        };
      }
    }
    occurrenceLog.get(placeId).push({ file: filePath, fullPlace: full });
  }

  const result = { ...current };
  for (const [key, value] of Object.entries(result)) {
    if (key === 'geometry' || key === 'externalLinks') continue;
    if (value && typeof value === 'object') result[key] = updateNode(value, filePath);
  }
  return result;
}

const changedFiles = [];
for (const file of await walk(historyRoot)) {
  const filePath = rel(file);
  if (filePath.includes('/arkiv/')) continue;
  let payload;
  try { payload = JSON.parse(await fs.readFile(file, 'utf8')); } catch { continue; }
  const beforeText = `${JSON.stringify(payload, null, 2)}\n`;
  const updated = updateNode(payload, filePath);
  const afterText = `${JSON.stringify(updated, null, 2)}\n`;
  if (beforeText !== afterText) {
    await fs.writeFile(file, afterText, 'utf8');
    changedFiles.push(filePath);
  }
}

for (const placeId of targetIds) {
  const occurrences = occurrenceLog.get(placeId) || [];
  if (!occurrences.length) throw new Error(`${placeId}: no active coordinate occurrence found`);
  if (!occurrences.some((item) => item.fullPlace)) throw new Error(`${placeId}: no full canonical place record found`);
}

const evidenceFiles = [];
for (const placeId of targetIds) {
  const acceptedItem = accepted.get(placeId);
  const blockedItem = blocked.get(placeId);
  const before = beforeById.get(placeId);
  if (!before) throw new Error(`${placeId}: before snapshot missing`);
  const placeFiles = occurrenceLog.get(placeId).filter((item) => item.fullPlace).map((item) => item.file);
  const primaryPlaceFile = placeFiles[0];
  let evidence;

  if (acceptedItem) {
    const note = acceptedNote(acceptedItem);
    const coordinateSourceUrl = acceptedItem.geometrySourceUrl || acceptedItem.locatorSourceUrl || acceptedItem.addressSourceUrl || acceptedItem.identitySourceUrl;
    const coordinateEvidenceName = acceptedItem.geometrySourceUrl
      ? 'Navngitt historisk ruinpolygon'
      : acceptedItem.addressSourceUrl
        ? 'Historisk adresseanker'
        : 'Publisert historisk locatorpunkt';
    evidence = {
      schemaVersion: '1.0',
      placeId,
      placeFile: primaryPlaceFile,
      evidenceStatus: 'applied_to_place',
      coordinateDecision: acceptedItem.coordType,
      currentCoordinate: {
        lat: acceptedItem.recommendedLat,
        lon: acceptedItem.recommendedLon,
        r: acceptedItem.recommendedRadius,
        coordStatus: acceptedItem.coordStatus,
        coordSource: 'manual_historical_research',
        coordType: acceptedItem.coordType,
        coordNote: note,
      },
      identity: {
        currentName: placeId,
        resolvedIdentity: placeId,
        identityStatus: 'resolved',
        identityProblem: '',
        locatorTypeCandidate: acceptedItem.locatorType,
        requiresSplit: false,
        splitReason: '',
      },
      requiredEvidence: ['historisk identitetskilde', 'stabilt koordinat- eller geometriobjekt', 'målt eller konservativ radius'],
      evidence: [
        {
          sourceProvider: 'manual_research',
          sourceName: 'Historisk identitetskilde',
          sourceUrl: acceptedItem.identitySourceUrl,
          sourceObjectId: `history-source:${placeId}:identity`,
          sourceQuality: 'authoritative_or_specialist_historical_source',
          finding: acceptedItem.evidenceSummary,
          canVerifyCoordinate: true,
          reason: 'Bekrefter canonical historisk identitet og stedskontekst.',
        },
        {
          sourceProvider: acceptedItem.geometrySourceUrl ? 'osm' : 'manual_research',
          sourceName: coordinateEvidenceName,
          sourceUrl: coordinateSourceUrl,
          sourceObjectId: acceptedItem.sourceObjectId,
          sourceQuality: acceptedItem.geometrySourceUrl ? 'named_historical_geometry' : 'published_historical_locator',
          finding: `${acceptedItem.recommendedLat}, ${acceptedItem.recommendedLon}; radius ${acceptedItem.recommendedRadius} meter.`,
          canVerifyCoordinate: true,
          reason: acceptedItem.geocodeAccuracy === 'semantic_anchor'
            ? 'Eksakt navngitt ruin-/kulturminnegeometri.'
            : 'Kildebelagt historisk punkt som uttrykkelig behandles som approksimasjon.',
        },
        {
          sourceProvider: 'manual_research',
          sourceName: 'History Go final historical coordinate review',
          sourceUrl: decisionsPath,
          sourceObjectId: `history-go-research:historical-sites-20260725:${placeId}`,
          sourceQuality: 'reproducible_multi_source_research',
          finding: note,
          canVerifyCoordinate: true,
          reason: 'Dokumenterer valg, radius og forkastede feilobjekter.',
        },
      ],
      addressCandidates: [],
      sourceObjectCandidates: [
        { sourceProvider: acceptedItem.sourceProvider, sourceObjectId: acceptedItem.sourceObjectId, canApplyToPlace: true },
      ],
      geometryCandidates: acceptedItem.geometrySourceUrl
        ? [{ sourceProvider: 'osm', sourceObjectId: acceptedItem.sourceObjectId, canApplyToPlace: true }]
        : [],
      coordinateCandidates: [
        {
          lat: acceptedItem.recommendedLat,
          lon: acceptedItem.recommendedLon,
          coordRole: acceptedItem.coordRole,
          sourceObjectId: acceptedItem.sourceObjectId,
          canApplyToPlace: true,
        },
      ],
      decision: {
        canBecomeVerified: true,
        blockedReason: '',
        nextAction: 'Final historisk koordinatbeslutning er anvendt i canonical-data.',
      },
      notes: [note, `Decision file: ${decisionsPath}`],
    };
  } else {
    const sourceObjectId = `history-go-research:historical-sites-20260725:${placeId}`;
    const note = blockedNote(blockedItem);
    evidence = {
      schemaVersion: '1.0',
      placeId,
      placeFile: primaryPlaceFile,
      evidenceStatus: 'research_complete_needs_source',
      coordinateDecision: 'keep_current_point_as_unverified_historical_proxy',
      currentCoordinate: {
        lat: before.lat,
        lon: before.lon,
        r: before.r,
        coordStatus: 'needs_source',
        coordSource: 'manual_historical_research',
        coordType: 'unverified_historical_anchor',
        coordNote: note,
      },
      identity: {
        currentName: placeId,
        resolvedIdentity: placeId,
        identityStatus: 'resolved_identity_unresolved_geometry',
        identityProblem: blockedItem.blockedReason,
        locatorTypeCandidate: blockedItem.locatorType,
        requiresSplit: false,
        splitReason: '',
      },
      requiredEvidence: ['entydig fysisk historisk objekt eller reproducerbar historisk geometri'],
      evidence: [
        {
          sourceProvider: 'manual_research',
          sourceName: 'History Go final historical coordinate review',
          sourceUrl: decisionsPath,
          sourceObjectId,
          sourceQuality: 'canonical_scope_and_object_audit',
          finding: blockedItem.blockedReason,
          canVerifyCoordinate: false,
          reason: 'De identifiserte nabobyggene eller skiltobjektene kan ikke brukes som erstatning for canonical-stedet.',
        },
      ],
      addressCandidates: [],
      sourceObjectCandidates: (blockedItem.rejectedObjects || []).map((item) => ({
        sourceProvider: 'osm',
        sourceObjectId: item.sourceObjectId,
        canApplyToPlace: false,
        reason: `Forkastet: ${item.actualIdentity}`,
      })),
      geometryCandidates: [],
      coordinateCandidates: [
        { lat: before.lat, lon: before.lon, coordRole: 'historical_anchor', sourceObjectId, canApplyToPlace: false },
      ],
      decision: {
        canBecomeVerified: false,
        blockedReason: blockedItem.blockedReason,
        nextAction: 'Finn entydig historisk geometri eller et reproducerbart fysisk kildeobjekt før oppgradering.',
      },
      notes: [note, `Decision file: ${decisionsPath}`],
    };
  }

  const evidencePath = path.join(evidenceRoot, `${placeId}.json`);
  await writeJson(evidencePath, evidence);
  evidenceFiles.push(rel(evidencePath));
}

const production = [...targetIds].map((placeId) => {
  const acceptedItem = accepted.get(placeId);
  const blockedItem = blocked.get(placeId);
  const before = beforeById.get(placeId);
  return {
    placeId,
    before,
    after: acceptedItem ? {
      lat: acceptedItem.recommendedLat,
      lon: acceptedItem.recommendedLon,
      r: acceptedItem.recommendedRadius,
      coordStatus: acceptedItem.coordStatus,
      coordType: acceptedItem.coordType,
      locatorType: acceptedItem.locatorType,
      sourceProvider: acceptedItem.sourceProvider,
      sourceObjectId: acceptedItem.sourceObjectId,
    } : {
      lat: before.lat,
      lon: before.lon,
      r: before.r,
      coordStatus: blockedItem.coordStatus,
      coordType: blockedItem.coordType,
      locatorType: blockedItem.locatorType,
      sourceProvider: 'manual_research',
      sourceObjectId: `history-go-research:historical-sites-20260725:${placeId}`,
    },
    occurrencesUpdated: occurrenceLog.get(placeId),
    evidenceFile: `data/coordinate-evidence/oslo/historie/${placeId}.json`,
    canonicalYearPreserved: true,
  };
});

const summary = {
  version: '2026-07-25',
  productionApplied: true,
  researchDecisionFile: decisionsPath,
  verifiedHistoricalSourceCount: production.filter((item) => item.after.coordStatus === 'verified_historical_source').length,
  needsSourceCount: production.filter((item) => item.after.coordStatus === 'needs_source').length,
  changedDataFiles: changedFiles,
  evidenceFiles,
  places: production,
};
await writeJson(path.join(reportDir, 'summary.json'), summary);
await fs.writeFile(
  path.join(reportDir, 'README.md'),
  `# Oslo historical coordinate production — 2026-07-25\n\nApplied ${summary.verifiedHistoricalSourceCount} verified historical decisions and ${summary.needsSourceCount} needs-source decisions.\n`,
  'utf8',
);
console.log(JSON.stringify(summary, null, 2));
