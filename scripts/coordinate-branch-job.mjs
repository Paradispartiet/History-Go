#!/usr/bin/env node

const queries = [
  ['Røykensvika', 'https://api.kartverket.no/stedsnavn/v1/sted?sok=R%C3%B8ykensvika&knr=0301&treffPerSide=100&side=1'],
  ['Røykensvik', 'https://api.kartverket.no/stedsnavn/v1/sted?sok=R%C3%B8ykensvik&knr=0301&treffPerSide=100&side=1'],
];
for (const [label, url] of queries) {
  const response = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!response.ok) throw new Error(`Kartverket SSR feilet for ${label}: HTTP ${response.status}`);
  const payload = await response.json();
  console.log(`ROYKENSVIK_SSR_${label.toUpperCase()}=` + JSON.stringify(payload));
}
throw new Error('Diagnostic only: no canonical data changed.');
