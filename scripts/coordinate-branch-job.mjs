import fs from 'node:fs';
import path from 'node:path';

const reportDir = 'reports/visitoslo-bjorvika-audit-20260721';
const source = JSON.parse(fs.readFileSync(path.join(reportDir, 'source.json'), 'utf8'));
const places = JSON.parse(fs.readFileSync('data/places/places_index.json', 'utf8'));

const variants = {
  'SALT': ['SALT', 'SALT Oslo'],
  'The Fjords: Oslo City Cruise': ['The Fjords', 'Oslo City Cruise'],
  'Deichman Bjørvika': ['Deichman Bjørvika', 'Deichman Bjorvika'],
  'Oslo Sauna Association: Sukkerbiten': ['Sukkerbiten', 'Oslo Badstuforening Sukkerbiten'],
  'MUNCH': ['MUNCH', 'Munchmuseet', 'Munch Museum'],
  'Oslobukta shopping': ['Oslobukta', 'Oslo Bukta'],
  'The Norwegian National Opera & Ballet': ['Den Norske Opera & Ballett', 'Operaen', 'Oslo Opera House'],
  'KOK Oslo': ['KOK Oslo', 'KOK'],
  'Fæbrik': ['Fæbrik', 'Faebrik'],
  'Åretak - Viking Rowboat Rental': ['Åretak', 'Aaretak'],
  'Losæter': ['Losæter', 'Losaeter'],
  'Narvesen Barcode': ['Narvesen Barcode'],
  'Hunter Oslo': ['Hunter Oslo'],
  'Way Nor Munch Brygge': ['Way Nor Munch Brygge'],
  'Friluftshuset: outdoor activity centre': ['Friluftshuset', 'Friluftshuset Sørenga'],
  'Sørenga Seawater Pool': ['Sørenga sjøbad', 'Sorenga sjobad', 'Sørenga Seawater Pool'],
  'Fiskeriet Bjørvika fish shop': ['Fiskeriet Bjørvika'],
  'Barcode Bjørvika': ['Barcode', 'Barcode Bjørvika'],
  'Oslo Sauna Association: Bademaschinen sauna raft': ['Bademaschinen', 'Oslo Badstuforening Bademaschinen'],
  'KÖSK': ['KÖSK', 'KOSK'],
  'Operastranda in Bjørvika': ['Operastranda', 'Operastranda Bjørvika'],
  'Optiker G Krogh Oslobukta': ['G Krogh Oslobukta', 'Optiker G Krogh Oslobukta'],
  'Sauna at SALT': ['SALT', 'SALT sauna'],
  'Lillelam Boutique Bjørvika': ['Lillelam Boutique Bjørvika'],
  'Devold Brandstore Oslo': ['Devold Brandstore Oslo'],
  'FLOP museum': ['FLOP museum', 'Flop Museum'],
  'Best of You': ['Best of You'],
  'Best View of the Oslofjord Walk Winter Edition': ['Best View of the Oslofjord Walk'],
  'T-Michael / Norwegian Rain Concept store': ['T-Michael', 'Norwegian Rain'],
  'Ice skating rink at Bjørvika': ['Ice skating rink at Bjørvika', 'Bjørvika skøytebane'],
};

const sourceKindHints = {
  'SALT': 'stable_physical_place_or_existing_parent',
  'The Fjords: Oslo City Cruise': 'mobile_service',
  'Deichman Bjørvika': 'stable_physical_place_or_existing_parent',
  'Oslo Sauna Association: Sukkerbiten': 'activity_or_operator_on_physical_site',
  'MUNCH': 'stable_physical_place_or_existing_parent',
  'Oslobukta shopping': 'area_or_commercial_district',
  'The Norwegian National Opera & Ballet': 'stable_physical_place_or_existing_parent',
  'KOK Oslo': 'mobile_or_multi_site_service',
  'Fæbrik': 'retail_or_commercial_listing',
  'Åretak - Viking Rowboat Rental': 'rental_service',
  'Losæter': 'stable_physical_place_or_existing_parent',
  'Narvesen Barcode': 'retail_or_commercial_listing',
  'Hunter Oslo': 'retail_or_commercial_listing',
  'Way Nor Munch Brygge': 'retail_or_commercial_listing',
  'Friluftshuset: outdoor activity centre': 'stable_physical_candidate',
  'Sørenga Seawater Pool': 'stable_physical_place_or_existing_parent',
  'Fiskeriet Bjørvika fish shop': 'retail_or_commercial_listing',
  'Barcode Bjørvika': 'stable_area_or_existing_parent',
  'Oslo Sauna Association: Bademaschinen sauna raft': 'floating_activity_or_operator',
  'KÖSK': 'stable_physical_place_or_existing_parent',
  'Operastranda in Bjørvika': 'stable_physical_place_or_existing_parent',
  'Optiker G Krogh Oslobukta': 'retail_or_commercial_listing',
  'Sauna at SALT': 'activity_on_existing_place',
  'Lillelam Boutique Bjørvika': 'retail_or_commercial_listing',
  'Devold Brandstore Oslo': 'retail_or_commercial_listing',
  'FLOP museum': 'stable_physical_place_or_existing_parent',
  'Best of You': 'commercial_service_listing',
  'Best View of the Oslofjord Walk Winter Edition': 'itinerary_or_guided_activity',
  'T-Michael / Norwegian Rain Concept store': 'retail_or_commercial_listing',
  'Ice skating rink at Bjørvika': 'seasonal_activity',
};

function normalize(value) {
  return String(value || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function similarity(a, b) {
  const aa = new Set(normalize(a).split(' ').filter(Boolean));
  const bb = new Set(normalize(b).split(' ').filter(Boolean));
  if (!aa.size || !bb.size) return 0;
  const intersection = [...aa].filter((token) => bb.has(token)).length;
  return (2 * intersection) / (aa.size + bb.size);
}

const indexed = places.map((place) => {
  const names = [place.id, place.name];
  for (const key of ['aliases', 'altNames', 'alternateNames']) {
    const value = place[key];
    if (Array.isArray(value)) names.push(...value);
    else if (typeof value === 'string') names.push(value);
  }
  return {
    place,
    normalizedNames: names.filter(Boolean).map(normalize),
    names: names.filter(Boolean),
  };
});

const results = [];
for (const entry of source.entries) {
  const queries = variants[entry.name] || [entry.name];
  const normalizedQueries = queries.map(normalize);
  const exact = [];
  const scored = [];

  for (const row of indexed) {
    if (row.normalizedNames.some((name) => normalizedQueries.includes(name))) {
      exact.push({
        id: row.place.id,
        name: row.place.name,
        category: row.place.category,
        sourceFile: row.place.sourceFile,
      });
    }

    let score = 0;
    for (const query of queries) {
      for (const candidate of row.names) {
        score = Math.max(score, similarity(query, candidate));
      }
    }
    if (score >= 0.35) {
      scored.push({
        score,
        id: row.place.id,
        name: row.place.name,
        category: row.place.category,
        sourceFile: row.place.sourceFile,
      });
    }
  }

  scored.sort((a, b) => b.score - a.score || String(a.id).localeCompare(String(b.id)));
  results.push({
    sourceName: entry.name,
    sourceKindHint: sourceKindHints[entry.name] || 'manual_review',
    queryVariants: queries,
    status: exact.length ? 'exact_or_alias_match' : 'manual_review',
    exactMatches: exact,
    topCandidates: scored.slice(0, 5).map((candidate) => ({
      ...candidate,
      score: Number(candidate.score.toFixed(3)),
    })),
  });
}

const summary = {
  sourceEntryCount: results.length,
  exactOrAliasMatches: results.filter((result) => result.status === 'exact_or_alias_match').length,
  manualReview: results.filter((result) => result.status === 'manual_review').length,
  sourceKindCounts: results.reduce((acc, result) => {
    acc[result.sourceKindHint] = (acc[result.sourceKindHint] || 0) + 1;
    return acc;
  }, {}),
};

const audit = { source: source.source, summary, results };
fs.writeFileSync(path.join(reportDir, 'preliminary-audit.json'), `${JSON.stringify(audit, null, 2)}\n`);

const lines = [
  '# VisitOSLO Bjørvika – preliminary visible-result coverage audit',
  '',
  `Captured: ${source.source.capturedAt}`,
  `Scope: ${source.source.scope}`,
  `Entries: ${summary.sourceEntryCount}`,
  `Exact/alias matches: ${summary.exactOrAliasMatches}`,
  `Manual review: ${summary.manualReview}`,
  '',
  'This source mixes durable places with retail, services, itineraries, mobile activities and seasonal uses. Exact-name matches are diagnostic only; no source entry becomes a new canonical place without a physical-scope and inclusion-policy decision.',
  '',
  '| Source entry | source-kind hint | preliminary status | exact match(es) | strongest candidates |',
  '|---|---|---|---|---|',
];
for (const result of results) {
  const exactText = result.exactMatches.map((match) => `\`${match.id}\``).join(', ') || '—';
  const candidates = result.topCandidates.slice(0, 3).map((candidate) => `\`${candidate.id}\` (${candidate.score.toFixed(3)})`).join(', ') || '—';
  lines.push(`| ${result.sourceName} | ${result.sourceKindHint} | ${result.status} | ${exactText} | ${candidates} |`);
}
lines.push('', '## Representation gate', '', '- Reuse a canonical place for activities clearly occurring on that physical place.', '- Do not create place markers for mobile tours, rental services, ordinary retail or guided itineraries by default.', '- Seasonal facilities require a stable physical-site identity before canonical production.', '- Stable institutions and civic/public visitor places still require duplicate and coordinate audits before new production.', '');
fs.writeFileSync(path.join(reportDir, 'README.md'), `${lines.join('\n')}\n`);

console.log(JSON.stringify(summary, null, 2));
