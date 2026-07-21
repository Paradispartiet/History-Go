#!/usr/bin/env node

const params = new URLSearchParams({
  adressenavn: 'Filipstadveien',
  nummer: '3',
  kommunenummer: '0301',
  treffPerSide: '100',
});
const url = `https://ws.geonorge.no/adresser/v1/sok?${params.toString()}`;
const response = await fetch(url, { headers: { Accept: 'application/json' } });
if (!response.ok) throw new Error(`Geonorge diagnostic failed: HTTP ${response.status}`);
const payload = await response.json();
const hits = Array.isArray(payload?.adresser) ? payload.adresser : [];
const summary = hits.map((hit) => ({
  adressenavn: hit?.adressenavn ?? null,
  adressetekst: hit?.adressetekst ?? null,
  nummer: hit?.nummer ?? null,
  bokstav: hit?.bokstav ?? null,
  kommunenummer: hit?.kommunenummer ?? null,
  kommunenavn: hit?.kommunenavn ?? null,
  adressekode: hit?.adressekode ?? null,
  postnummer: hit?.postnummer ?? null,
  poststed: hit?.poststed ?? null,
  representasjonspunkt: hit?.representasjonspunkt ?? null,
}));
console.error('SKUR13_STRUCTURED_GEONORGE_HITS=' + JSON.stringify(summary));
throw new Error(`Diagnostic only: structured query returned ${hits.length} hit(s); no data changed.`);
