import fs from 'node:fs';
import path from 'node:path';

const splitFile = 'data/places/subkultur/oslo/places_subkultur/torggata_blad.json';
const aggregateFile = 'data/places/subkultur/oslo/places_subkultur.json';
const indexFile = 'data/places/subkultur/oslo/places_subkultur_index.json';

const read = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const write = (file, value) => fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);

const place = read(splitFile);

// Preserve the coordinate repair from merged PR #2486 exactly.
const lockedCoordinate = {
  lat: 59.91657334372696,
  lon: 10.75561428991178,
  r: 60,
  sourceObjectId: 'geonorge-adresser-v1:0301:12782:19A',
};

if (
  place.lat !== lockedCoordinate.lat ||
  place.lon !== lockedCoordinate.lon ||
  place.r !== lockedCoordinate.r ||
  place.sourceObjectId !== lockedCoordinate.sourceObjectId
) {
  throw new Error('Torggata Blad coordinate state has changed since merged Geonorge batch 7; refusing identity-only edit.');
}

place.year = 2007;
place.desc = 'Historisk redaksjons- og publiseringssted for det uavhengige kulturbladet Torggata Blad i Hausmannsgate 19.';
place.popupDesc = 'Torggata Blad ble grunnlagt i 2007 som et uavhengig lokal- og kulturblad. De tidlige papirutgavene dokumenterer at redaksjonen holdt til i Hausmannsgate 19, 6. etasje. History Go-markøren representerer dette historiske redaksjons- og publiseringsstedet — ikke en bokhandel. Dagens offisielle adressepunkt Hausmanns gate 19A brukes som displayanker for eiendommen; A-bokstaven er en moderne adresse-normalisering og er ikke gjengitt som et historisk sitat fra bladet.';
place.quiz_profile = {
  place_type: 'redaksjonssted',
  subtype: 'uavhengig_kulturblad_og_publiseringsmiljo',
  signature_features: [
    'historisk redaksjon i Hausmannsgate 19, 6. etasje',
    'uavhengig lokal- og kulturpublisering fra 2007',
    'fysisk anker for småskala redaksjonell og subkulturell infrastruktur'
  ],
  primary_angles: [
    'historie',
    'uavhengig_kultur',
    'publiseringsmiljo',
    'subkulturell_distribusjon'
  ],
  question_families: [
    'historisk_endring',
    'miljo',
    'kulturokonomi',
    'kontrast'
  ],
  avoid_angles: [
    'generisk_bokhandel',
    'nåværende_redaksjonsadresse',
    'kun_mainstream_litteratur'
  ],
  must_include: [
    'rollen som uavhengig kulturpublikasjon',
    'Hausmannsgate 19 som dokumentert historisk redaksjonssted'
  ],
  contrast_targets: [
    'tronsmo_bokhandel',
    'hausmania',
    'bla'
  ],
  notes: 'Spør som historisk redaksjons- og publiseringssted for Torggata Blad, ikke som bokhandel.'
};

write(splitFile, place);

const aggregate = read(aggregateFile);
const aggregateIndex = aggregate.findIndex((item) => item?.id === 'torggata_blad');
if (aggregateIndex < 0) throw new Error('torggata_blad missing from subkultur aggregate');
aggregate[aggregateIndex] = place;
write(aggregateFile, aggregate);

const index = read(indexFile);
const indexEntry = index.find((item) => item?.id === 'torggata_blad');
if (!indexEntry) throw new Error('torggata_blad missing from subkultur index');
indexEntry.year = place.year;
indexEntry.name = place.name;
indexEntry.lat = place.lat;
indexEntry.lon = place.lon;
indexEntry.r = place.r;
indexEntry.coordStatus = place.coordStatus;
indexEntry.coordType = place.coordType;
write(indexFile, index);

const report = `# Torggata Blad identity correction — 2026-07-19\n\n## Problem\n\nDen mergede koordinatreparasjonen i PR #2486 flyttet markøren korrekt til det historiske adresseankeret i Hausmanns gate 19A, men den eldre place-teksten beskrev fortsatt Torggata Blad som en fysisk bokhandel. Det ga en intern motsetning mellom det historiske redaksjonsankeret og stedets identitet.\n\n## Primærkilder\n\n- **Torggata Blad nr. 2, 2007:** redaksjonen oppgir at den holder til i «Hausmannsgate 19, 6. etasje» og beskriver utsikten og takterrassen.\n- **Torggata Blad nr. 1 og nr. 2, 2008:** mastheadene oppgir «Torggata Blad, Hausmannsgate 19, 0182 Oslo».\n- Den eksisterende History Go-storyen dokumenterer allerede at bladet ble grunnlagt i **2007**.\n\n## Rettelse\n\n- place-identiteten er nå historisk redaksjons- og publiseringssted, ikke bokhandel\n- \`year\` er korrigert fra 1990 til 2007\n- quiz-profilen er endret fra bokhandel til redaksjons-/publiseringsmiljø\n- det mergede Geonorge-koordinatet fra PR #2486 er eksplisitt låst og uendret\n- Hausmanns gate 19A omtales fortsatt som dagens offisielle display-normalisering for den historiske adressen Hausmannsgate 19\n\n## Kilder\n\n- https://torggatablad.no/wp-content/uploads/2020/04/torggatablad_nr02_07_web.pdf\n- https://torggatablad.no/torggata-blad-total/\n- \`data/stories/stories_torggata_blad.json\`\n`;
fs.mkdirSync('reports', { recursive: true });
fs.writeFileSync('reports/torggata-blad-identity-fix-20260719.md', report);
