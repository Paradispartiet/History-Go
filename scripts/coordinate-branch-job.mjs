import { readFile, writeFile } from 'node:fs/promises';

const sourcePath = 'reports/oslo-coordinate-sigrid-undset-independent-anchor-post-195/summary.json';
const outputPath = 'reports/oslo-coordinate-sigrid-undset-independent-anchor-post-195/compact-summary.json';
const source = JSON.parse(await readFile(sourcePath, 'utf8'));

if (source.placeId !== 'sigrid_undset_statue') throw new Error('Unexpected source placeId.');
if (source.coordinateMaxBatch !== 195) throw new Error('Unexpected coordinate max batch.');
if (!source.hardGates?.rejectedOsmNodeBlocked) throw new Error('Rejected OSM node hard gate is missing.');

const nonEmptyNominatim = (source.nominatim ?? []).map((row) => ({
  query: row.query,
  status: row.capture?.status,
  resultCount: Array.isArray(row.results) ? row.results.length : 0,
  results: Array.isArray(row.results) ? row.results.slice(0, 20) : []
}));

const compact = {
  version: source.version,
  placeId: source.placeId,
  coordinateMaxBatch: source.coordinateMaxBatch,
  hardGates: source.hardGates,
  officialIdentity: source.officialIdentity,
  liveSourceStatus: Object.fromEntries(Object.entries(source.officialCaptures ?? {}).map(([key, value]) => [key, {
    status: value.status,
    ok: value.ok,
    sha256: value.sha256,
    flags: value.flags,
    coordinateSignalCount: value.coordinateSignals?.length ?? 0
  }])),
  emuseum: {
    representationCount: source.emuseum?.representationCount ?? 0,
    successfulRepresentationCount: (source.emuseum?.representations ?? []).filter((row) => row.ok).length,
    downloadedMediaCount: source.emuseum?.downloadedMediaCount ?? 0,
    exactCoordinateSignals: source.emuseum?.exactCoordinateSignals ?? []
  },
  wikimedia: {
    searchQueries: (source.wikimedia?.searchQueries ?? []).map((row) => ({ query: row.query, status: row.capture?.status, resultCount: row.resultCount, resultTitles: (row.results ?? []).map((result) => result.title) })),
    geosearchStatus: source.wikimedia?.geosearchCapture?.status,
    geosearchCount: source.wikimedia?.geosearchCount ?? 0,
    relevantPageCount: source.wikimedia?.relevantPages?.length ?? 0,
    relevantPages: (source.wikimedia?.relevantPages ?? []).map((page) => ({
      pageid: page.pageid,
      title: page.title,
      coordinates: page.coordinates,
      distanceFromLegacyM: page.distanceFromLegacyM,
      descriptionUrls: (page.imageinfo ?? []).map((info) => info.descriptionurl),
      descriptions: (page.imageinfo ?? []).map((info) => info.extmetadata?.ImageDescription?.value ?? info.extmetadata?.ObjectName?.value ?? null),
      categories: (page.imageinfo ?? []).map((info) => info.extmetadata?.Categories?.value ?? null)
    }))
  },
  wikidata: {
    searchResultCounts: (source.wikidata?.searches ?? []).map((row) => ({ query: row.query, status: row.capture?.status, count: row.results?.length ?? 0, results: row.results ?? [] })),
    sparqlStatus: source.wikidata?.sparqlCapture?.status,
    nearbyBindingCount: source.wikidata?.nearbyBindingCount,
    relevantBindings: source.wikidata?.relevantBindings ?? []
  },
  openstreetmap: {
    overpassStatus: source.openstreetmap?.overpassCapture?.status,
    nearbyArtworkAndMemorialCount: source.openstreetmap?.nearbyArtworkAndMemorialCount ?? 0,
    knownRejectedNodePresent: source.openstreetmap?.knownRejectedNodePresent,
    newExactIdentityCandidates: source.openstreetmap?.newExactIdentityCandidates ?? [],
    closestNonRejectedRows: (source.openstreetmap?.rows ?? []).filter((row) => !row.rejectedKnownNode).slice(0, 20)
  },
  nominatim: nonEmptyNominatim,
  exactIndependentCandidates: source.exactIndependentCandidates ?? [],
  coordinateChanged: source.coordinateChanged,
  decision: source.decision,
  nextAction: source.nextAction
};

await writeFile(outputPath, `${JSON.stringify(compact, null, 2)}\n`, 'utf8');
console.log(JSON.stringify({
  decision: compact.decision,
  exactIndependentCandidateCount: compact.exactIndependentCandidates.length,
  relevantCommonsPageCount: compact.wikimedia.relevantPageCount,
  wikidataRelevantBindingCount: compact.wikidata.relevantBindings.length,
  newExactOsmCandidateCount: compact.openstreetmap.newExactIdentityCandidates.length,
  nominatimResultCounts: compact.nominatim.map((row) => [row.query, row.resultCount])
}, null, 2));
