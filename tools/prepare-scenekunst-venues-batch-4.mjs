#!/usr/bin/env node
import fs from 'node:fs';

const path = 'tools/add-scenekunst-venues-batch-4.mjs';
let source = fs.readFileSync(path, 'utf8');
const startMarker = "  {\n    id: 'tou',";
const endMarker = "  {\n    id: 'bruddet_fjaereheia',";
const start = source.indexOf(startMarker);
const end = source.indexOf(endMarker, start);
if (start < 0 || end < 0) throw new Error('Tou candidate block not found');

const studio = `  {
    id: 'studio_bergen_carte_blanche',
    name: 'Studio Bergen / Carte Blanche',
    aliases: ['Studio Bergen', 'Carte Blanche'],
    sourceFile: 'places/scenekunst/vestland/studio_bergen_carte_blanche.json',
    fylke: 'vestland', kommune: 'Bergen', city: 'Bergen', municipalityNumber: '4601',
    street: 'Nøstegaten', number: 119, expectedPostcode: '5011',
    year: 1989,
    period: 'Nasjonalt kompani for samtidsdans og fast produksjons- og visningsscene',
    desc: 'Carte Blanches hjemmebase og scene for norsk og internasjonal samtidsdans i Nøstegaten 119.',
    popupDesc: 'Carte Blanche ble etablert i 1989 og er Norges nasjonale kompani for samtidsdans. Studio Bergen i Nøstegaten 119 er kompaniets hjemmebase, produksjonslokale og egen scene, med et intimt publikumsrom på rundt 160 plasser. Her utvikles nye koreografiske verk før de vises i Bergen og turnerer nasjonalt og internasjonalt. Stedet gjør forskjellen mellom et fast dansekompani, en produksjonsbase og en turnerende institusjon tydelig.',
    tags: ['samtidsdans','dans','koreografi','nasjonalt_kompani','bergen','turne'],
    emne_ids: ['em_scenekunst_teaterinstitusjon_repertoar','em_scenekunst_dans_koreografi','em_scenekunst_publikum_fjerde_vegg'],
    physicalScope: 'Studio Bergen-scenen og Carte Blanches produksjons- og publikumsfunksjoner i Nøstegaten 119. Kompaniets turnéspillesteder inngår ikke i samme markør.',
    quiz_profile: {
      place_type: 'nasjonalt_samtidsdanskompani_og_hjemmescene',
      subtype: 'fast_produksjonsbase_for_turnerende_dansekompani',
      signature_features: ['Carte Blanche etablert i 1989','Norges nasjonale kompani for samtidsdans','Studio Bergen som hjemmebase og intimscene'],
      primary_angles: ['samtidsdans','koreografi','kompanistruktur','turne'],
      question_families: ['institusjon','arbeidsprosess','publikum','kontrast'],
      avoid_angles: ['framstille_studioet_som_generelt_kulturhus','blande_turnearenaer_med_hjemmescenen'],
      must_include: ['forholdet mellom kompani, produksjonsbase og turné','samtidsdans som hovedkunstform'],
      contrast_targets: ['dansens_hus_oslo','cornerteateret'],
      notes: 'Spør som dansekompani og produksjonsscene, ikke som tradisjonelt taleteater.'
    },
    knowledge: {
      one_liner: 'Studio Bergen er hjemmebasen der Carte Blanche utvikler samtidsdans før verkene møter publikum i Bergen og på turné.',
      why_it_matters: ['Carte Blanche har en nasjonal rolle i utviklingen og formidlingen av samtidsdans.','En fast produksjonsbase gjør langsiktig ensemblearbeid og nye koreografiske produksjoner mulig.'],
      what_to_notice: ['Det intime forholdet mellom scene og publikum.','At lokalene både er arbeidssted og offentlig visningsscene.','Hvordan et verk kan skapes her og senere tilpasses helt andre turnéscener.'],
      terms: ['samtidsdans','koreografi','dansekompani','produksjonsbase'],
      sources: ['https://carteblanche.no/om-oss/','https://carteblanche.no/studio-bergen/','https://carteblanche.no/kontakt/']
    }
  },
`;
source = source.slice(0, start) + studio + source.slice(end);
const oldEmne = 'tags: venue.tags, emne_ids: EMNE_IDS, physicalScope: venue.physicalScope,';
const newEmne = 'tags: venue.tags, emne_ids: venue.emne_ids ?? EMNE_IDS, physicalScope: venue.physicalScope,';
if (!source.includes(oldEmne)) throw new Error('emne_ids builder fragment not found');
source = source.replace(oldEmne, newEmne);
fs.writeFileSync(path, source);
fs.rmSync('reports/scenekunst-new-venues-batch-4-runner-error.log', { force: true });
console.log('Prepared batch 4 with Studio Bergen / Carte Blanche.');
