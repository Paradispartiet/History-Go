#!/usr/bin/env node

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const placeId = 'elvestrekning_bla_brenneriveien';
const aggregateFile = path.join(root, 'data/places/natur/oslo/places_oslo_natur_akerselvarute.json');
const childFile = path.join(root, 'data/places/natur/oslo/places_oslo_natur_akerselvarute/elvestrekning_bla_brenneriveien.json');
const manifestFile = path.join(root, 'data/places/natur/oslo/places_oslo_natur_akerselvarute_manifest.json');
const reportDir = path.join(root, 'reports/oslo-coordinate-control-batch-160-akerselva-bla-brenneriveien');
fs.mkdirSync(reportDir, { recursive: true });

const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const writeJson = (file, value) => fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
const sha256File = (file) => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');

const natureProfile = {
  type: 'smal byelv / tett kantvegetasjon / kulturmiljø',
  title: 'Den trange grønne elvekanten ved Brenneriveien',
  summary: 'Ved Blå presses Akerselva inn i et smalt byrom mellom mur, gangvei, kulturarenaer og tett vegetasjon langs vannet. Elva er fortsatt tydelig som levende naturstruktur, men breddene er korte, bratte og sterkt påvirket av den bygde byen. Natur-rundingen viser hvordan røtter, busker og skyggefulle kantsoner kan holde fast et grønt bånd selv der plassen er knapp, og hvordan vannløpet fortsatt binder dette kulturmiljøet sammen med parkene oppstrøms og elvestrekningene videre sør.',
  themes: [
    'smalt elveløp i tett by',
    'tett vegetasjon på begrensede bredder',
    'skygge mellom mur og trær',
    'røtter i bratte kantsoner',
    'naturstruktur gjennom kulturmiljøet',
    'forbindelse mellom Kuba og Fossveien',
  ],
  nearby_place_ids: [
    'kuba_parken',
    'fossveien_elvestrekning',
    'myralokka',
  ],
};

const aggregate = readJson(aggregateFile);
const matches = aggregate.filter((place) => place?.id === placeId);
if (matches.length !== 1) throw new Error(`${placeId} må finnes nøyaktig én gang i aggregate`);
for (const place of aggregate) {
  if (place?.id === placeId) place.nature_profile = natureProfile;
}
writeJson(aggregateFile, aggregate);

const child = readJson(childFile);
if (child?.id !== placeId) throw new Error(`Child-filen matcher ikke ${placeId}`);
child.nature_profile = natureProfile;
writeJson(childFile, child);

const manifest = readJson(manifestFile);
const manifestRow = (manifest.places || []).find((row) => row?.id === placeId);
if (!manifestRow) throw new Error(`${placeId} mangler i split-manifest`);
manifest.source_sha256 = sha256File(aggregateFile);
manifest.generated_at = new Date().toISOString();
manifestRow.sha256 = sha256File(childFile);
writeJson(manifestFile, manifest);

writeJson(path.join(reportDir, 'preserved-content.json'), {
  placeId,
  preservedFields: ['nature_profile.type', 'nature_profile.title', 'nature_profile.summary', 'nature_profile.themes', 'nature_profile.nearby_place_ids'],
  nearbyPlaceIds: natureProfile.nearby_place_ids,
});

console.log(`Restored existing nature_profile for ${placeId} in aggregate and child.`);
