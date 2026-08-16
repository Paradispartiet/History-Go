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

const clean = (value) => String(value || '').replace(/\s+/gu, ' ').trim();
const noTerminal = (value) => clean(value).replace(/[.!?]+$/u, '').trim();
const lowerFirst = (value) => {
  const text = noTerminal(value);
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

const OPENINGS = [
  (title, focus) => `${title} kan undersøkes presist gjennom påstanden «${focus}»`,
  (title, focus) => `Et sentralt skille i ${title.toLocaleLowerCase('nb-NO')} blir synlig i påstanden «${focus}»`,
  (title, focus) => `For å avgrense ${title.toLocaleLowerCase('nb-NO')} analytisk testes påstanden «${focus}»`,
  (title, focus) => `Kildene gjør det mulig å prøve en konkret tese om ${title.toLocaleLowerCase('nb-NO')}: «${focus}»`,
  (title, focus) => `I stedet for å bruke ${title.toLocaleLowerCase('nb-NO')} som en løs etikett undersøkes påstanden «${focus}»`,
  (title, focus) => `Den empiriske kjernen i denne delen av ${title.toLocaleLowerCase('nb-NO')} er påstanden «${focus}»`,
  (title, focus) => `Her blir ${title.toLocaleLowerCase('nb-NO')} et spørsmål om dokumentasjon, fordi påstanden er «${focus}»`,
  (title, focus) => `Analysen av ${title.toLocaleLowerCase('nb-NO')} skjer gjennom en etterprøvbar tese: «${focus}»`,
  (title, focus) => `En presis vurdering av ${title.toLocaleLowerCase('nb-NO')} krever at påstanden «${focus}» kan følges i konkrete spor`,
  (title, focus) => `Denne delen undersøker ikke status i abstrakt form, men en avgrenset påstand om ${title.toLocaleLowerCase('nb-NO')}: «${focus}»`,
  (title, focus) => `Spørsmålet om ${title.toLocaleLowerCase('nb-NO')} kan operasjonaliseres som påstanden «${focus}»`,
  (title, focus) => `Det analytiske utgangspunktet for ${title.toLocaleLowerCase('nb-NO')} er en falsifiserbar påstand: «${focus}»`
];

const SOURCE_LEADS = [
  (labels) => `Dokumentasjonen hviler på ${labels}`,
  (labels) => `Som evidens brukes ${labels}`,
  (labels) => `På kildesiden kombineres ${labels}`,
  (labels) => `Den empiriske kontrollen begynner i ${labels}`,
  (labels) => `For denne vurderingen er ${labels} de bærende kildene`,
  (labels) => `Kildegrunnlaget består her av ${labels}`,
  (labels) => `Påstanden prøves mot ${labels}`,
  (labels) => `To eller flere uavhengige spor møtes i ${labels}`
];

const METHOD_LEADS = [
  (text) => `Metodisk må materialet leses fra flere sider: ${text}`,
  (text) => `Ingen enkelt metode kan avgjøre spørsmålet alene; ${text}`,
  (text) => `Metodevalget følger evidenstypen: ${text}`,
  (text) => `Analysen triangulerer ulike spor ved at ${text}`,
  (text) => `For å skille observasjon fra fortolkning brukes ${text}`,
  (text) => `Etterprøvbarheten styrkes når ${text}`
];

const CASE_LEADS = [
  (caseRow) => `Et konkret prøvepunkt er «${clean(caseRow.title)}» (${clean(caseRow.years)}, ${clean(caseRow.territory)}): ${lowerFirst(caseRow.purpose)}`,
  (caseRow) => `Caset «${clean(caseRow.title)}» fra ${clean(caseRow.territory)} (${clean(caseRow.years)}) viser hva som faktisk kan undersøkes: ${lowerFirst(caseRow.purpose)}`,
  (caseRow) => `I «${clean(caseRow.title)}» (${clean(caseRow.years)}) kan analysen forankres i en bestemt kontekst, fordi ${lowerFirst(caseRow.purpose)}`,
  (caseRow) => `Den abstrakte problemstillingen blir konkret i «${clean(caseRow.title)}» (${clean(caseRow.territory)}, ${clean(caseRow.years)}), der ${lowerFirst(caseRow.purpose)}`,
  (caseRow) => `Som avgrenset case brukes «${clean(caseRow.title)}» (${clean(caseRow.years)}); her er poenget at ${lowerFirst(caseRow.purpose)}`,
  (caseRow) => `«${clean(caseRow.title)}» (${clean(caseRow.years)}, ${clean(caseRow.territory)}) fungerer som kontrollcase fordi ${lowerFirst(caseRow.purpose)}`
];

const DISAGREEMENT_LEADS = [
  (text) => `Den faglige uenigheten skjerper testen: ${lowerFirst(text)}`,
  (text) => `En rivaliserende lesning må tas på alvor, ettersom ${lowerFirst(text)}`,
  (text) => `Materialet kan tolkes forskjellig: ${lowerFirst(text)}`,
  (text) => `Her finnes en reell analytisk konflikt, fordi ${lowerFirst(text)}`,
  (text) => `Konklusjonen avhenger av hvordan en dokumentert uenighet håndteres: ${lowerFirst(text)}`,
  (text) => `Et konkurrerende perspektiv setter en nødvendig grense for analysen: ${lowerFirst(text)}`
];

const LIMIT_LEADS = [
  (a, b) => `To inferensgrenser må holdes fast: ${lowerFirst(a)}; dessuten ${lowerFirst(b)}`,
  (a, b) => `Det er særlig to steder analysen kan overdrive: ${lowerFirst(a)}; samtidig ${lowerFirst(b)}`,
  (a, b) => `Fra disse sporene følger ikke alt: ${lowerFirst(a)}; og ${lowerFirst(b)}`,
  (a, b) => `Evidensen setter klare grenser for generalisering: ${lowerFirst(a)}; i tillegg ${lowerFirst(b)}`,
  (a, b) => `Analysen må stoppe før den gjør sterkere krav enn materialet bærer: ${lowerFirst(a)}; videre ${lowerFirst(b)}`,
  (a, b) => `To mulige kortslutninger må avvises: ${lowerFirst(a)}; deretter ${lowerFirst(b)}`,
  (a, b) => `Kildene tillater bare en avgrenset slutning: ${lowerFirst(a)}; samtidig må det tas høyde for at ${lowerFirst(b)}`,
  (a, b) => `Den metodiske disiplinen ligger i å respektere grensene: ${lowerFirst(a)}; og ${lowerFirst(b)}`
];

const QUESTION_LEADS = [
  (q) => `Det avgjørende kontrollspørsmålet blir derfor: ${clean(q)}`,
  (q) => `Før påstanden kan godtas, må analysen svare på ett konkret evidensspørsmål: ${clean(q)}`,
  (q) => `Vurderingen står eller faller på spørsmålet ${lowerFirst(q)}`,
  (q) => `Det som faktisk må dokumenteres, kan formuleres slik: ${clean(q)}`,
  (q) => `En etterprøvbar konklusjon krever svar på følgende: ${clean(q)}`,
  (q) => `Evidenskravet kan til slutt uttrykkes som spørsmålet ${lowerFirst(q)}`
];

const CLOSINGS = [
  (title) => `Dermed blir ${title.toLocaleLowerCase('nb-NO')} et spørsmål om dokumentert prosess og avgrenset inferens, ikke et synonym for popularitet eller kulturell prestisje`,
  (title) => `Denne framgangsmåten holder ${title.toLocaleLowerCase('nb-NO')} åpent for revisjon dersom nye kilder endrer proveniens, sirkulasjon eller kontekst`,
  (title) => `Resultatet er en betinget konklusjon om ${title.toLocaleLowerCase('nb-NO')}, der kilde, periode, aktør og metode må være synlige før status tilskrives`,
  (title) => `Slik skilles en dokumenterbar analyse av ${title.toLocaleLowerCase('nb-NO')} fra en etterpåklok fortelling som bare gjentar senere berømmelse`,
  (title) => `På den måten kan ${title.toLocaleLowerCase('nb-NO')} analyseres uten å gjøre dagens kanon, marked eller tilgjengelighet til målestokk for fortiden`,
  (title) => `Konklusjonen forblir derfor historisk og institusjonelt avgrenset, også når ${title.toLocaleLowerCase('nb-NO')} har fått sterk senere synlighet`,
  (title) => `Det er denne kombinasjonen av sporbar evidens og eksplisitte grenser som gjør vurderingen av ${title.toLocaleLowerCase('nb-NO')} faglig etterprøvbar`,
  (title) => `Analysen ender dermed i en kontrollert, kildebåret vurdering av ${title.toLocaleLowerCase('nb-NO')}, ikke i en generell rangering av kulturell verdi`
];

function sourceRoleSentence(sourceRows, index) {
  const roles = sourceRows.map((row) => `${labelSource(row)} er en ${sourceKind(row)} med relevans for ${clean(row.territory)}`);
  const lead = index % 3 === 0
    ? 'Kildenes roller er forskjellige'
    : index % 3 === 1
      ? 'Det er viktig å holde kildetypene fra hverandre'
      : 'Kildekritisk må materialet vektes etter funksjon';
  return `${lead}: ${roles.join('; ')}`;
}

function methodSentence(methodRows, index) {
  const selected = methodRows.slice(0, 4);
  const text = selected.map((row) => `${clean(row.title)} ${lowerFirst(row.purpose)}`).join('; ');
  return METHOD_LEADS[index % METHOD_LEADS.length](text);
}

function caseSentence(caseRow, index) {
  if (!caseRow) {
    const variants = [
      'Her finnes ikke ett enkelt case som kan bære slutningen; kildekjeden og den historiske konteksten må derfor gjøre hele evidensarbeidet',
      'Fraværet av et selvstendig case gjør kildekritikken viktigere: slutningen må kunne rekonstrueres direkte fra de navngitte dokumentene',
      'Ingen enkelt case får fungere som snarvei; vurderingen må i stedet bygges fra daterte kilder og eksplisitt kontekst'
    ];
    return variants[index % variants.length];
  }
  return CASE_LEADS[index % CASE_LEADS.length](caseRow);
}

function buildEditorialParagraph({ section, claim, methodRows, sourceRows, caseRow, globalIndex }) {
  const focus = clean(claim.claim);
  const labels = sourceRows.map(labelSource).join(sourceRows.length > 2 ? ', ' : ' og ');
  const sourceLead = SOURCE_LEADS[globalIndex % SOURCE_LEADS.length](labels);
  const sourceRole = sourceRoleSentence(sourceRows, globalIndex);
  const method = methodSentence(methodRows, globalIndex);
  const concreteCase = caseSentence(caseRow, globalIndex);
  const disagreement = DISAGREEMENT_LEADS[globalIndex % DISAGREEMENT_LEADS.length](section.documentedDisagreement);
  const limits = LIMIT_LEADS[globalIndex % LIMIT_LEADS.length](
    section.methodLimits?.[globalIndex % section.methodLimits.length],
    section.methodLimits?.[(globalIndex + 1) % section.methodLimits.length]
  );
  const question = QUESTION_LEADS[globalIndex % QUESTION_LEADS.length](section.evidenceQuestion);
  const closing = CLOSINGS[globalIndex % CLOSINGS.length](section.title);
  const frameVariants = [
    `Avgrensningen i emnet er at ${lowerFirst(section.definition)}`,
    `Læringsmålet krever at ${lowerFirst(section.learningGoal)}`,
    `Begrepsbruken må holdes innenfor denne avgrensningen: ${lowerFirst(section.definition)}`,
    `Det analytiske nivået er bestemt av at ${lowerFirst(section.learningGoal)}`
  ];
  const frame = frameVariants[globalIndex % frameVariants.length];
  const opening = OPENINGS[globalIndex % OPENINGS.length](section.title, focus);

  const blocks = [
    sentence(opening),
    sentence(frame),
    sentence(sourceLead),
    sentence(sourceRole),
    sentence(method),
    sentence(concreteCase),
    sentence(disagreement),
    sentence(limits),
    sentence(question),
    sentence(closing)
  ];

  const layouts = [
    [0,1,2,3,4,5,6,7,8,9],
    [0,2,3,5,4,1,6,7,8,9],
    [0,1,4,2,3,6,5,7,8,9],
    [0,5,2,3,4,1,7,6,8,9],
    [0,2,4,1,5,3,6,8,7,9],
    [0,1,3,2,5,4,7,6,8,9],
    [0,4,2,3,1,6,5,8,7,9],
    [0,2,5,1,3,4,6,7,8,9]
  ];
  return layouts[globalIndex % layouts.length].map((index) => blocks[index]).join(' ');
}

export function polishFilmTvCulturalHeritageCanonStarsMemoryBuiltV1(built) {
  const claimsById = new Map((built.claimsDoc.claims || []).map((row) => [row.id, row]));
  const sourcesById = new Map((built.sources || []).map((row) => [row.id, row]));
  const casesById = new Map((built.cases || []).map((row) => [row.id, row]));
  const methodsById = new Map((built.sourceBrief.method_basis || []).map((row) => [row.id, row]));
  let globalIndex = 0;

  for (const module of built.modules) {
    for (const section of module.sections) {
      section.paragraphs = section.paragraphClaimIds.map((claimId) => {
        const claim = claimsById.get(claimId);
        if (!claim) throw new Error(`Mangler sluttclaim ${claimId}`);
        const sourceRows = claim.source_ids.map((id) => sourcesById.get(id)).filter(Boolean);
        const methodRows = claim.method_basis_ids.map((id) => methodsById.get(id)).filter(Boolean);
        const caseRow = claim.case_id ? casesById.get(claim.case_id) : null;
        const paragraph = buildEditorialParagraph({ section, claim, methodRows, sourceRows, caseRow, globalIndex });
        globalIndex += 1;
        return paragraph;
      });
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
  console.log(`Film & TV Unit 15 editorial materialisering: ${paragraphs.length}/56 claimsporede fagavsnitt med claimspesifikk argumentasjon og variert struktur.`);
}
