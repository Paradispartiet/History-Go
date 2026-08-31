import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import test from 'node:test';

const readJson = path => JSON.parse(fs.readFileSync(path, 'utf8'));
const placePath = 'data/places/politikk/oslo/places_politikk/regjeringskvartalet.json';
const placeBuffer = fs.readFileSync(placePath);
const place = JSON.parse(placeBuffer.toString('utf8'));
const context = readJson('data/quiz/production_context/politikk/regjeringskvartalet.json');
const runtime = fs.readFileSync('js/ui/place-popup-tabs.js', 'utf8');
const report = fs.readFileSync('reports/place-production/regjeringskvartalet-politikk-v1.md', 'utf8');

test('Regjeringskvartalet har en kuratert brukerrettet Kilder-flate', () => {
  assert.equal(place.source_summary.safe_sources.length, 6);
  assert.equal(place.source_summary.hold_back_sources.length, 2);
  assert.equal(place.externalLinks.length, 12);
  assert.equal(new Set(place.externalLinks.map(link => link.url)).size, 12);
  assert.ok(place.externalLinks.every(link => link.label.length >= 20));
  assert.ok(place.externalLinks.every(link => link.url.startsWith('https://')));
  assert.ok(place.externalLinks.every(link => ['nb', 'en'].includes(link.lang)));
});

test('Kildegruppene dekker de seks eide funksjonene uten interne produksjonsdata', () => {
  const safe = place.source_summary.safe_sources.join(' ');
  for (const pattern of [
    /identitet.*historie/i,
    /plan.*vedtak/i,
    /bygg.*gjennomføring/i,
    /kunst.*arkitektur/i,
    /22\. juli.*minne/i,
    /bilder.*attribusjon.*lisens/i
  ]) assert.match(safe, pattern);
  assert.doesNotMatch(safe.toLowerCase(), /audit|quiz|claim|report\/place-production|production_context|internal/);
  const holdBack = place.source_summary.hold_back_sources.join(' ').toLowerCase();
  assert.match(holdBack, /produksjonsrapporter.*quiz-kontekst.*claims.*coordinate-audits/);
  assert.match(holdBack, /planlagte byggetrinn.*kontrollert status og dato/);
});

test('Navngitte lenker dekker beslutning, gjennomføring, kunst, minne, referanse og lisens', () => {
  const types = new Set(place.externalLinks.map(link => link.type));
  for (const type of [
    'official',
    'official_map',
    'official_report',
    'official_project',
    'art_and_architecture',
    'memorial_and_learning',
    'reference',
    'license'
  ]) assert.ok(types.has(type), `mangler kildetype ${type}`);
  const byUrl = new Map(place.externalLinks.map(link => [link.url, link]));
  for (const url of [
    'https://www.regjeringen.no/no/dokumenter/meld.-st.-21-20182019/id2641647/',
    'https://www.statsbygg.no/byggeprosjekter/nytt-regjeringskvartal/',
    'https://koro.no/offisiell-apning-av-regjeringskvartalet-13-april/',
    'https://www.22julisenteret.no/no/om-senteret/historikk',
    'https://snl.no/Regjeringskvartalet',
    'https://creativecommons.org/licenses/by-sa/4.0/'
  ]) assert.ok(byUrl.has(url), `mangler brukerrettet lenke ${url}`);
  assert.equal(byUrl.get('https://od2.pbe.oslo.kommune.no/cgi-bin/wms?map=REGTILLEGG&SERVICE=WFS&VERSION=2.0.0&REQUEST=GetFeature&TYPENAMES=ms%3AOmraadeplan&OUTPUTFORMAT=geojson&SRSNAME=EPSG%3A32632').verifiedAt, '2026-07-24');
  assert.ok(place.externalLinks.filter(link => link.type !== 'official_map').every(link => link.verifiedAt === '2026-08-02'));
});

test('Eksisterende runtime dedupliserer place-, Leksikon- og Før/etter-kilder', () => {
  assert.match(runtime, /includeProfileLabels \? uniqueBy\(strings\(sourceProfile\?\.safe_sources/);
  assert.match(runtime, /const configuredLinks = \[place, \.\.\.list\(articles\)\]/);
  assert.match(runtime, /const beforeAfterLinks = \[/);
  assert.match(runtime, /uniqueBy\(\[\.\.\.configuredLinks, \.\.\.beforeAfterLinks\]/);
  assert.match(runtime, /target="_blank" rel="noopener noreferrer"/);
  assert.doesNotMatch(runtime, /\.\.\.strings\(place\?\.for_na\?\.sources[\s\S]{0,160}value => value\);/);
});

test('Canonical place og deterministisk Quiz-kontekst er synkronisert', () => {
  const target = context.source_files.target;
  assert.equal(target.path, placePath);
  assert.equal(target.bytes, placeBuffer.byteLength);
  assert.equal(target.sha256, createHash('sha256').update(placeBuffer).digest('hex'));
  assert.equal(target.bytes, 28118);
  assert.equal(target.sha256, '9e763ff92cf5d1bb9f1aff6e314389796c016078a4b189397336d219137c3514');
});

test('Fasekortet lukker Lesespor, åpner Kilder og peker bare videre til Mer', () => {
  assert.match(report, /\| 6 \| Lesespor \| \*\*GODKJENT – PR #4669, merge `c68881578a5a56c6ae9b610f7c5132fc448297c3`\*\* \|/);
  assert.match(report, /\| Kilder \| PASS – fase 7 \|/);
  assert.match(report, /\| 7 \| Brukerrettede Kilder \| \*\*GODKJENT – PR #4670, merge `318119d72d63838d487bbaeec85bda2dd58209b1`\*\* \|/);
  assert.match(report, /\| 12 \| Brands \| \*\*GODKJENT – PR #4673, merge `f4e078f06422747dd6f1ee34985d9c5752bcb3b6`\*\* \|/);
  assert.match(report, /\| 13 \| Badges, fagverk, alle åtte popupfaner, rundinger og full UI-\/produksjonsaudit \| \*\*(?:KLAR FOR REVIEW – FULL UI-\/PRODUKSJONSAUDIT PASS|GODKJENT – PR #[0-9]+, merge `[0-9a-f]{40}`)\*\* \|/);
});
