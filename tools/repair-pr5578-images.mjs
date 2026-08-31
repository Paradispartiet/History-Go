#!/usr/bin/env node
import fs from 'node:fs';

const changes = [
  {
    file: 'data/places/by/oslo/sofienbergparken.json',
    fromImage: '/images/places/by/oslo/sofienbergparken.JPG',
    toImage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7f/Sofienbergparken_Oslo_2022-08-17_01.jpg/1280px-Sofienbergparken_Oslo_2022-08-17_01.jpg',
    fromCredit: 'Foto: History Go',
    toCredit: 'Leonhard Lenz / Wikimedia Commons · CC0 1.0'
  },
  {
    file: 'data/places/by/oslo/places/markveien.json',
    fromImage: '/images/places/by/oslo/markveien.JPG',
    toImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Markveien.jpg',
    fromCredit: 'Foto: History Go',
    toCredit: 'Mahlum / Wikimedia Commons · public domain'
  }
];

for (const change of changes) {
  const json = JSON.parse(fs.readFileSync(change.file, 'utf8'));
  if (json.popupImage !== change.fromImage) throw new Error(`${change.file}: unexpected popupImage ${json.popupImage}`);
  json.popupImage = change.toImage;
  if (json.imageCredit === change.fromCredit || !json.imageCredit) json.imageCredit = change.toCredit;
  fs.writeFileSync(change.file, `${JSON.stringify(json, null, 2)}\n`);
}
