#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const VERIFIED_AT = '2026-09-01';

const patches = {
  'data/places/by/oslo/places/bankplassen.json': {
    paragraphs: [
      'Finanshistorien rundt Bankplassen må også holdes på riktig skala. Norges Bank har hatt flere bygninger og funksjoner knyttet til området, og dagens hovedkontor ved Bankplassen 2 ble innviet i 1986. Dette gjør sentralbanken synlig i plassrommet, men selve plassen er ikke banken: pengepolitikk, bankdrift og institusjonelle beslutninger må dokumenteres gjennom Norges Banks egne kilder, ikke utledes av fasaden eller adressen.',
      'Plassen er samtidig et eksempel på hvordan offentlig rom kan endre karakter uten å skifte navn. Fra ryddet festningsterreng via bank- og teatermiljø til parkpreg, kunst og museumsnær bruk har nye lag kommet til mens eldre spor er blitt fjernet, flyttet eller minnet på andre måter. En sammenligning av kart, bilder, bygninger og monumenter viser derfor både kontinuitet og brudd, og gjør det mulig å skille fysisk overlevelse fra senere minnekultur.'
    ],
    sources: [
      ['Norges Bank – bygget på Bankplassen', 'https://www.norges-bank.no/tema/Om-Norges-Bank/Bygget/']
    ]
  },
  'data/places/by/oslo/gamle_radhus/gamle_radhus.json': {
    paragraphs: [
      'Høyesterettsperioden viser hvor viktig det er å skille bygning, institusjon og rettssystem. Høyesterett holdt til i Gamle rådhus fra 1821 til 1846, men domstolen var opprettet i 1815 og fortsatte etter utflyttingen. Bygningen dokumenterer dermed én lokalisert fase i norsk rettshistorie, ikke hele institusjonens historie. Oppdag Kvadraturens dokumentasjon gjør det mulig å følge denne perioden uten å gjøre senere restaurant- og scenevirksomhet til del av samme funksjon.',
      'Også gatekonteksten hjelper til med å lese ombruk og byendring. Nedre Slottsgate og Christiania torv binder huset til den planlagte 1600-tallsbyen, mens senere ombygginger og nabofunksjoner viser at den opprinnelige institusjonsrammen ikke er bevart som et lukket tidsbilde. Historiske kart, gatehistorie og bygningsdokumentasjon kan derfor brukes sammen for å kontrollere hvilke sammenhenger som faktisk hører til hver periode, og hvilke som er resultat av senere byutvikling.'
    ],
    sources: [
      ['Oppdag Kvadraturen – Høyesterett', 'https://www.oppdagkvadraturen.no/stoppesteder/hoyesterett'],
      ['Oslo byleksikon – Nedre Slottsgate', 'https://oslobyleksikon.no/side/Nedre_Slottsgate']
    ]
  }
};

const read = relative => JSON.parse(fs.readFileSync(path.join(ROOT, relative), 'utf8'));
const write = (relative, value) => fs.writeFileSync(path.join(ROOT, relative), `${JSON.stringify(value, null, 2)}\n`);

function addExternalLink(place, label, url) {
  const field = Array.isArray(place.externalLinks)
    ? 'externalLinks'
    : Array.isArray(place.external_links)
      ? 'external_links'
      : 'externalLinks';
  place[field] ||= [];
  if (!place[field].some(row => row?.url === url)) {
    place[field].push({ type: 'source', label, url, verifiedAt: VERIFIED_AT });
  }
}

for (const [relative, patch] of Object.entries(patches)) {
  const place = read(relative);
  if (place?.fagverk?.level !== 'full' || place?.fagverk?.status !== 'curated') {
    throw new Error(`${relative}: expected freshly curated full Fagverk`);
  }
  for (const paragraph of patch.paragraphs) {
    if (!place.fagverk.article.includes(paragraph)) place.fagverk.article.push(paragraph);
  }
  for (const [label, url] of patch.sources) {
    addExternalLink(place, label, url);
    if (!place.fagverk.source_urls.includes(url)) place.fagverk.source_urls.push(url);
  }
  write(relative, place);
  console.log(`Strengthened full Fagverk: ${place.id} (${place.fagverk.article.length} paragraphs, ${place.fagverk.source_urls.length} sources)`);
}
