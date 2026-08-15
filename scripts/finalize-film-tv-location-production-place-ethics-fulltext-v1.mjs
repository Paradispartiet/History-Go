#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  buildFilmTvLocationProductionPlaceEthicsFulltextV1,
  materializeFilmTvLocationProductionPlaceEthicsFulltextV1
} from './materialize-film-tv-location-production-place-ethics-fulltext-v1.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const abs = (file) => path.join(ROOT, file);
const write = (file, value) => {
  fs.mkdirSync(path.dirname(abs(file)), { recursive: true });
  fs.writeFileSync(abs(file), `${JSON.stringify(value, null, 2)}\n`);
};

const BOILERPLATE = Object.freeze({
  start: 'Analysen må starte i produksjonens dokumenterte handlinger, ikke i en antakelse om hva et bilde av stedet betyr.',
  evidence: 'Det betyr at tillatelse, samtykke, standard, konsultasjon, måling eller digital teknikk bare får den evidensstyrken dokumentasjonen faktisk gir.',
  methodPrefix: 'Metodisk følger avsnittet ',
  disagreementPrefix: 'Den faglige uenigheten er derfor ikke et pyntelag:',
  conclusionPrefix: 'Avsnittets sluttkrav er et kontrollert claimspor'
});

export function polishFilmTvLocationProductionPlaceEthicsModuleV1(module) {
  const polished = structuredClone(module);
  polished.sections = polished.sections.map((section) => ({
    ...section,
    paragraphs: section.paragraphs.map((paragraph, index) => {
      const ordinal = index + 1;
      const sectionLabel = `«${section.title}», fagavsnitt ${ordinal}`;
      return paragraph
        .replace(
          BOILERPLATE.start,
          `I ${sectionLabel} starter analysen i produksjonens dokumenterte handlinger framfor i en antakelse om hva stedets skjermbilde betyr.`
        )
        .replace(
          BOILERPLATE.methodPrefix,
          `Metodisk følger ${sectionLabel} `
        )
        .replace(
          BOILERPLATE.evidence,
          `For ${sectionLabel} får tillatelse, samtykke, standard, konsultasjon, måling og digital teknikk derfor bare den evidensstyrken de navngitte dokumentene faktisk gir.`
        )
        .replace(
          BOILERPLATE.disagreementPrefix,
          `Den faglige uenigheten i ${sectionLabel} er derfor analytisk nødvendig:`
        )
        .replace(
          BOILERPLATE.conclusionPrefix,
          `Sluttkravet i ${sectionLabel} er et kontrollert claimspor`
        );
    })
  }));
  return polished;
}

export function buildFinalizedFilmTvLocationProductionPlaceEthicsFulltextV1() {
  const built = buildFilmTvLocationProductionPlaceEthicsFulltextV1();
  const modules = built.modules.map(polishFilmTvLocationProductionPlaceEthicsModuleV1);
  return {
    ...built,
    modules,
    sections: modules.flatMap((module) => module.sections)
  };
}

export function finalizeFilmTvLocationProductionPlaceEthicsFulltextV1() {
  const built = materializeFilmTvLocationProductionPlaceEthicsFulltextV1();
  const modules = built.modules.map(polishFilmTvLocationProductionPlaceEthicsModuleV1);
  modules.forEach((module, index) => write(built.chapter.moduleFiles[index], module));
  console.log('Polerte Film & TV/enhet 13: 39 claimsporede fagavsnitt med seksjons- og avsnittsspesifikk redaksjonell formulering.');
  return {
    ...built,
    modules,
    sections: modules.flatMap((module) => module.sections)
  };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    finalizeFilmTvLocationProductionPlaceEthicsFulltextV1();
  } catch (error) {
    console.error(`Film & TV enhet 13 finalisering FEIL: ${error.message}`);
    process.exitCode = 1;
  }
}
