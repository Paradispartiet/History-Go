#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  buildFilmTvCulturalHeritageCanonStarsMemoryFulltextV1,
  materializeFilmTvCulturalHeritageCanonStarsMemoryFulltextV1
} from './materialize-film-tv-cultural-heritage-canon-stars-memory-fulltext-v1.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CHAPTER_ID = 'kulturarv-kanon-stjerner-og-minne';
const MODULE_FILES = [
  `data/fagverk/film_tv/${CHAPTER_ID}/01-kulturarv-kanon-og-motarkiv.json`,
  `data/fagverk/film_tv/${CHAPTER_ID}/02-stjerner-kanonmakt-og-kollektiv-referanse.json`,
  `data/fagverk/film_tv/${CHAPTER_ID}/03-kult-nostalgi-og-kulturell-varighet.json`,
  `data/fagverk/film_tv/${CHAPTER_ID}/04-sitat-stjerneapparat-og-tv-minne.json`
];

const clean = (value) => String(value || '')
  .replace(/\s+/gu, ' ')
  .replace(/[;,:\s]+$/u, '')
  .trim();

const clause = (value) => clean(value)
  .replace(/[.!?]+\s*/gu, ', ')
  .replace(/,\s*,+/gu, ', ')
  .replace(/,\s*$/u, '')
  .trim();

const lowerFirst = (value) => {
  const text = clean(value);
  return text ? text.charAt(0).toLocaleLowerCase('nb-NO') + text.slice(1) : text;
};

const sentence = (value) => {
  const text = clean(value);
  return /[.!?]$/u.test(text) ? text : `${text}.`;
};

const labelSource = (source) => `${clean(source.publisher)}, «${clean(source.title)}»`;

const sourceKind = (source) => {
  const type = String(source.type || '').toLowerCase();
  if (type.includes('peer-reviewed') || type.includes('academic')) return 'forskningskilde';
  if (type.includes('bibliography')) return 'faglig oversiktskilde';
  if (type.includes('register') || type.includes('institutional') || type.includes('programme') || type.includes('collection') || type.includes('guidance') || type.includes('recommendation')) return 'institusjonskilde';
  return 'dokumentert fagkilde';
};

const sourceLeadVariants = [
  (labels) => `Kildegrunnlaget begynner med ${labels}`,
  (labels) => `Dokumentasjonen kombinerer ${labels}`,
  (labels) => `Påstanden kan kontrolleres mot ${labels}`,
  (labels) => `De bærende kildesporene er ${labels}`,
  (labels) => `Evidensen hentes fra ${labels}`
];

const openingVariants = [
  (title, focus) => `I analysen av ${title.toLocaleLowerCase('nb-NO')} prøves denne avgrensede påstanden: «${focus}»`,
  (title, focus) => `For ${title.toLocaleLowerCase('nb-NO')} er det avgjørende å teste følgende påstand mot daterte spor: «${focus}»`,
  (title, focus) => `Et konkret problem innen ${title.toLocaleLowerCase('nb-NO')} er om kildene faktisk bærer påstanden «${focus}»`,
  (title, focus) => `Her behandles ${title.toLocaleLowerCase('nb-NO')} gjennom en etterprøvbar påstand: «${focus}»`,
  (title, focus) => `Denne delen av ${title.toLocaleLowerCase('nb-NO')} starter i et kontrollspørsmål snarere enn en statusetikett: «${focus}»`
];

function buildEditorialParagraph({ section, claim, methodRows, sourceRows, caseRow, topicIndex, claimIndex }) {
  const focus = clean(claim.claim);
  const opening = openingVariants[(topicIndex * 2 + claimIndex) % openingVariants.length](section.title, focus);
  const lens = clause(section.definition || section.learningGoal);
  const analyticLens = clause(section.documentedDisagreement ? section.definition : section.learningGoal);
  const methods = methodRows.slice(0, 4);
  const methodText = methods.map((row) => `${clean(row.title)} brukes til å ${lowerFirst(clause(row.purpose))}`).join('; ');
  const labels = sourceRows.map(labelSource);
  const sourceLead = sourceLeadVariants[(topicIndex + claimIndex) % sourceLeadVariants.length](labels.join(labels.length > 2 ? ', ' : ' og '));
  const sourceRoles = sourceRows.map((row) => `${labelSource(row)} fungerer her som ${sourceKind(row)} fra ${clean(row.territory)}`).join('; ');
  const caseText = caseRow
    ? `Caset «${clean(caseRow.title)}» (${clean(caseRow.years)}, ${clean(caseRow.territory)}) gir et konkret prøvepunkt: ${lowerFirst(clause(caseRow.purpose))}`
    : 'Ingen enkeltcase får bære konklusjonen alene; slutningen må derfor forankres i kildene, perioden og den eksplisitte avgrensningen';
  const disagreement = clause(section.documentedDisagreement);
  const limitA = clause(section.methodLimits?.[claimIndex % section.methodLimits.length]);
  const limitB = clause(section.methodLimits?.[(claimIndex + 1) % section.methodLimits.length]);
  const question = clause(section.evidenceQuestion);
  const claimAnchor = focus.length > 115 ? `${focus.slice(0, 112).trim()}…` : focus;

  return [
    sentence(opening),
    sentence(`Begrepet avgrenses her slik: ${lens}; derfor må «${claimAnchor}» vurderes innenfor en navngitt aktør-, tids- og mediekontekst`),
    sentence(`Metodisk er ikke én etikett nok: ${methodText}; metodene brukes som forskjellige kontroller på hvilke spor som kan bære akkurat denne slutningen`),
    sentence(sourceLead),
    sentence(`${sourceRoles}; kombinasjonen gjør det mulig å sammenholde forskjellige typer dokumentasjon uten å gjøre én kilde eller institusjon til universell fasit for «${claimAnchor}»`),
    sentence(caseText),
    sentence(`Caset brukes analytisk fordi det konkretiserer prosessen i påstanden, men det generaliseres ikke utover perioden, offentligheten eller institusjonen som kildene faktisk dekker`),
    sentence(`For «${claimAnchor}» er den relevante faglige uenigheten at ${lowerFirst(disagreement)}; analysen må derfor vise hvilket evidensnivå som avgjør mellom forklaringene i dette konkrete tilfellet`),
    sentence(`To inferensgrenser er særlig viktige i denne påstanden: ${lowerFirst(limitA)}; i tillegg ${lowerFirst(limitB)}; begge grensene hindrer at synlighet, berømmelse eller tilgjengelighet gjøres om til sterkere kulturarv-, kanon- eller minneclaims enn materialet bærer`),
    sentence(`Det avgjørende evidensspørsmålet for «${claimAnchor}» er dermed ${lowerFirst(question)}; svaret må kunne spores tilbake til kilder, case, periode og metode før påstanden behandles som verifisert`),
    sentence(`Konklusjonen er derfor avgrenset: claimet kan beholdes når de navngitte sporene faktisk dokumenterer prosessen, men ikke som en generell regel om popularitet, kvalitet, stjernestatus, kultstatus eller kollektiv erindring`)
  ].join(' ');
}

export function polishFilmTvCulturalHeritageCanonStarsMemoryBuiltV1(built) {
  const claimsById = new Map((built.claimsDoc.claims || []).map((row) => [row.id, row]));
  const sourcesById = new Map((built.sources || []).map((row) => [row.id, row]));
  const casesById = new Map((built.cases || []).map((row) => [row.id, row]));
  const methodsById = new Map((built.sourceBrief.method_basis || []).map((row) => [row.id, row]));
  let topicIndex = 0;

  for (const module of built.modules) {
    for (const section of module.sections) {
      section.paragraphs = section.paragraphClaimIds.map((claimId, claimIndex) => {
        const claim = claimsById.get(claimId);
        if (!claim) throw new Error(`Mangler sluttclaim ${claimId}`);
        const sourceRows = claim.source_ids.map((id) => sourcesById.get(id)).filter(Boolean);
        const methodRows = claim.method_basis_ids.map((id) => methodsById.get(id)).filter(Boolean);
        const caseRow = claim.case_id ? casesById.get(claim.case_id) : null;
        return buildEditorialParagraph({ section, claim, methodRows, sourceRows, caseRow, topicIndex, claimIndex });
      });
      topicIndex += 1;
    }
  }
  built.sections = built.modules.flatMap((module) => module.sections);
  return built;
}

export function buildFilmTvCulturalHeritageCanonStarsMemoryEditorialV1() {
  return polishFilmTvCulturalHeritageCanonStarsMemoryBuiltV1(
    buildFilmTvCulturalHeritageCanonStarsMemoryFulltextV1()
  );
}

export function materializeFilmTvCulturalHeritageCanonStarsMemoryEditorialV1() {
  const built = materializeFilmTvCulturalHeritageCanonStarsMemoryFulltextV1();
  polishFilmTvCulturalHeritageCanonStarsMemoryBuiltV1(built);
  built.modules.forEach((module, index) => {
    const output = path.join(ROOT, MODULE_FILES[index]);
    fs.writeFileSync(output, `${JSON.stringify(module, null, 2)}\n`);
  });
  return built;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const built = materializeFilmTvCulturalHeritageCanonStarsMemoryEditorialV1();
  const paragraphs = built.sections.flatMap((section) => section.paragraphs || []);
  console.log(`Film & TV Unit 15 editorial materialisering: ${paragraphs.length}/56 claimsporede fagavsnitt uten sporlogg-prosa.`);
}
