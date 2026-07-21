#!/usr/bin/env node

const addressParams = new URLSearchParams({
  adressenavn: 'Schweigaards gate',
  nummer: '56',
  kommunenummer: '0301',
  treffPerSide: '100',
});
const addressUrl = `https://ws.geonorge.no/adresser/v1/sok?${addressParams.toString()}`;
const addressResponse = await fetch(addressUrl, { headers: { Accept: 'application/json' } });
if (!addressResponse.ok) throw new Error(`Geonorge diagnostic failed: HTTP ${addressResponse.status}`);
const addressPayload = await addressResponse.json();
const addressHits = Array.isArray(addressPayload?.adresser) ? addressPayload.adresser : [];

const query = 'Neseblod Records, Oslo, Norway';
const poiUrl = 'https://nominatim.openstreetmap.org/search?format=jsonv2&q=' + encodeURIComponent(query) + '&limit=20&addressdetails=1&namedetails=1&extratags=1&polygon_geojson=1&countrycodes=no&bounded=1&viewbox=10.70%2C59.94%2C10.82%2C59.88';
const poiResponse = await fetch(poiUrl, { headers: { Accept: 'application/json', 'User-Agent': 'History-Go-coordinate-audit/1.0' } });
if (!poiResponse.ok) throw new Error(`Nominatim diagnostic failed: HTTP ${poiResponse.status}`);
const rows = await poiResponse.json();

const addressSummary = addressHits.map((hit) => ({
  adressetekst: hit?.adressetekst ?? null,
  adressenavn: hit?.adressenavn ?? null,
  nummer: hit?.nummer ?? null,
  bokstav: hit?.bokstav ?? null,
  kommunenummer: hit?.kommunenummer ?? null,
  adressekode: hit?.adressekode ?? null,
  representasjonspunkt: hit?.representasjonspunkt ?? null,
}));
const poiSummary = (Array.isArray(rows) ? rows : []).map((row) => ({
  name: row?.namedetails?.name || row?.name || null,
  display_name: row?.display_name ?? null,
  category: row?.category ?? null,
  type: row?.type ?? null,
  osm_type: row?.osm_type ?? null,
  osm_id: row?.osm_id ?? null,
  lat: row?.lat ?? null,
  lon: row?.lon ?? null,
  address: row?.address ?? null,
  geojson_type: row?.geojson?.type ?? null,
}));
console.error('NESEBLOD_GEONORGE_56_HITS=' + JSON.stringify(addressSummary));
console.error('NESEBLOD_NOMINATIM_POI_HITS=' + JSON.stringify(poiSummary));
throw new Error(`Diagnostic only: ${addressHits.length} official address hit(s), ${(Array.isArray(rows) ? rows.length : 0)} POI hit(s); no data changed.`);
