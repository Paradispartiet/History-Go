#!/usr/bin/env node

const url = 'https://api.kartverket.no/stedsnavn/v1/sted?sok=Kongeskogen&knr=0301&treffPerSide=100&side=1';
const response = await fetch(url, { headers: { Accept: 'application/json' } });
if (!response.ok) throw new Error(`Kartverket SSR feilet: HTTP ${response.status}`);
const payload = await response.json();
console.log('KONGESKOGEN_SSR_PAYLOAD=' + JSON.stringify(payload));
throw new Error('Diagnostic only: no canonical data changed.');
