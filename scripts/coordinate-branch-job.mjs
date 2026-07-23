import { promises as fs } from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const verifiedAt = '2026-07-23';
const placeId = 'vikedalsvassdraget_bjonndalen';
const reportDir = path.join(root, 'reports', 'vikedalsvassdraget-bjonndalen-nature-rounds-batch1');
const sourceDir = path.join(reportDir, 'sources');
const validationDir = path.join(reportDir, 'validation');
const placeRel = 'places/natur/vestland/etne/vikedalsvassdraget_bjonndalen.json';
const placePath = path.join(root, 'data', placeRel);
const storyRel = 'data/stories/stories_vikedalsvassdraget_bjonndalen.json';
const storyPath = path.join(root, storyRel);
const articleRel = 'data/leksikon/places/vestland/etne/natur/leksikon_vikedalsvassdraget_bjonndalen.json';
const articlePath = path.join(root, articleRel);
const testRel = 'tests/vikedalsvassdraget-bjonndalen-nature-rounds-batch1.test.js';
const testPath = path.join(root, testRel);

const urls = {
  nve: 'https://www.nve.no/vann-og-vassdrag/vassdragsforvaltning/verneplan-for-vassdrag/rogaland/038-1-vikedalselva/',
  etne: 'https://www.etne.kommune.no/naring-natur-og-miljo/natur-og-miljovern/naturforvaltning/',
  monitoring: 'https://www.miljodirektoratet.no/ansvarsomrader/overvaking-arealplanlegging/miljoovervaking/overvakingsprogrammer/ferskvann-hav-og-kyst/biologisk-mangfold-i-ferskvann/',
  acidRain1999: 'https://www.miljodirektoratet.no/link/c205d89ac5b5423684577f03c251ef92.aspx',
  verneplan: 'https://www.nve.no/vann-og-vassdrag/vassdragsforvaltning/verneplan-for-vassdrag/'
};

await fs.mkdir(sourceDir, { recursive: true });
await fs.mkdir(validationDir, { recursive: true });
await fs.mkdir(path.dirname(placePath), { recursive: true });
await fs.mkdir(path.dirname(storyPath), { recursive: true });
await fs.mkdir(path.dirname(articlePath), { recursive: true });

async function writeJson(file, value) {
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

async function snapshotSource(label, url) {
  try {
    const response = await fetch(url, { headers: { 'User-Agent': 'History-Go source-led round production' } });
    const text = await response.text();
    await fs.writeFile(path.join(sourceDir, `${label}.txt`), `URL: ${url}\nHTTP: ${response.status}\n\n${text}`, 'utf8');
  } catch (error) {
    await fs.writeFile(path.join(sourceDir, `${label}.txt`), `URL: ${url}\nFETCH_ERROR: ${String(error)}\n`, 'utf8');
  }
}

for (const [label, url] of Object.entries(urls)) await snapshotSource(label, url);

function normalize(value) {
  return String(value ?? '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9æøå]+/g, ' ').trim();
}

function numeric(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function collectCandidates(value, out = []) {
  if (!value || typeof value !== 'object') return out;
  if (Array.isArray(value)) {
    for (const item of value) collectCandidates(item, out);
    return out;
  }
  const rp = value.representasjonspunkt || value.representationPoint;
  if (rp && typeof rp === 'object') {
    const lat = numeric(rp.nord ?? rp.lat ?? rp.latitude ?? rp.y);
    const lon = numeric(rp.øst ?? rp.ost ?? rp.lon ?? rp.lng ?? rp.longitude ?? rp.x);
    if (lat != null && lon != null && Math.abs(lat) <= 90 && Math.abs(lon) <= 180) {
      const strings = [];
      const walkStrings = (node, depth = 0) => {
        if (depth > 4 || node == null) return;
        if (typeof node === 'string') { strings.push(node); return; }
        if (Array.isArray(node)) { for (const item of node) walkStrings(item, depth + 1); return; }
        if (typeof node === 'object') for (const [key, item] of Object.entries(node)) if (!['representasjonspunkt','representationPoint','geometry','coordinates'].includes(key)) walkStrings(item, depth + 1);
      };
      walkStrings(value);
      out.push({
        lat,
        lon,
        strings,
        sourceId: value.stedsnummer ?? value.stednummer ?? value.id ?? value.objectid ?? value.OBJECTID ?? null
      });
    }
  }
  for (const item of Object.values(value)) collectCandidates(item, out);
  return out;
}

async function resolveBjonndalen() {
  const aliases = ['Bjønndalen', 'Bjørndalen', 'Bjonndalen'];
  const attempts = [];
  for (const alias of aliases) {
    const params = new URLSearchParams({ knr: '4611', sok: alias, treffPerSide: '100', side: '1', utkoordsys: '4258' });
    const url = `https://api.kartverket.no/stedsnavn/v1/sted?${params}`;
    const response = await fetch(url, { headers: { 'User-Agent': 'History-Go coordinate research' } });
    const text = await response.text();
    await fs.writeFile(path.join(sourceDir, `kartverket-ssr-${normalize(alias).replace(/\s+/g,'-')}.txt`), text, 'utf8');
    if (!response.ok) { attempts.push({ alias, status: response.status }); continue; }
    const json = JSON.parse(text);
    const wanted = normalize(alias);
    const candidates = collectCandidates(json).map((candidate) => {
      const haystack = candidate.strings.map(normalize).join(' | ');
      let score = 0;
      if (candidate.strings.some((s) => normalize(s) === wanted)) score += 100;
      if (haystack.includes(wanted)) score += 35;
      if (haystack.includes('etne')) score += 10;
      if (haystack.includes('bjonndalen') || haystack.includes('bjørndalen') || haystack.includes('bjønndalen')) score += 20;
      return { ...candidate, score };
    }).sort((a, b) => b.score - a.score);
    attempts.push({ alias, candidates });
    if (candidates[0] && candidates[0].score >= 35) {
      const best = candidates[0];
      await writeJson(path.join(reportDir, 'coordinate-resolution.json'), { alias, url, best, attempts });
      return {
        lat: Number(best.lat.toFixed(7)),
        lon: Number(best.lon.toFixed(7)),
        sourceObjectId: `kartverket-ssr:${best.sourceId || `${best.lat},${best.lon}`}`,
        sourceUrl: url,
        matchedAlias: alias
      };
    }
  }
  await writeJson(path.join(reportDir, 'coordinate-resolution.json'), { unresolved: true, attempts });
  throw new Error('Could not resolve a defensible Kartverket SSR anchor for Bjønndalen in Etne municipality');
}

const coordinate = await resolveBjonndalen();

const sourceRefs = [
  { type: 'official', label: 'NVE – 038/1 Vikedalselva', url: urls.nve, lang: 'nb', verifiedAt },
  { type: 'official', label: 'Etne kommune – naturforvaltning og verna vassdrag', url: urls.etne, lang: 'nn', verifiedAt },
  { type: 'official', label: 'Miljødirektoratet – biologisk mangfold i ferskvann', url: urls.monitoring, lang: 'nb', verifiedAt },
  { type: 'official', label: 'Miljødirektoratet – overvåking av langtransporterte forurensninger 1999', url: urls.acidRain1999, lang: 'nb', verifiedAt },
  { type: 'official', label: 'NVE – Verneplan for vassdrag', url: urls.verneplan, lang: 'nb', verifiedAt }
];

const place = {
  id: placeId,
  name: 'Vikedalsvassdraget – Bjønndalen',
  lat: coordinate.lat,
  lon: coordinate.lon,
  r: 1400,
  coordType: 'area_center',
  coordStatus: 'needs_manual_visual_qa',
  coordSource: 'Kartverket SSR – navngitt Bjønndalen-anker i Etne, krysskontrollert mot Etne kommunes oppføring av Vikedalsvassdraget (Bjønndalen) og NVE 038/1 Vikedalselva',
  coordVerifiedAt: verifiedAt,
  coordNote: 'Markøren er et semantisk områdeanker for den delen av det vernede Vikedalsvassdraget som Etne kommune omtaler som Bjønndalen. Punktet representerer ikke hele det 118 km² store nedbørfeltet, ikke hovedelvas utløp i Vikedal og ikke en anbefalt adkomst til vannkant. Bruk bare offentlig vei eller etablert ferdselslinje ved fysisk besøk.',
  locatorType: 'natural_area',
  sourceProvider: 'kartverket',
  sourceObjectId: coordinate.sourceObjectId,
  geocodeAccuracy: 'semantic_anchor',
  coordRole: 'area_anchor',
  category: 'natur',
  fylke: 'vestland',
  kommune: 'Etne',
  year: 1986,
  period: 'Vernet vassdrag siden Verneplan III',
  tags: ['vikedalsvassdraget','bjonndalen','vernet_vassdrag','typevassdrag','vannkvalitet','sur_nedbor','miljoovervaking','nedborfelt'],
  desc: 'Bjønndalen er Etne-ankeret for det vernede Vikedalsvassdraget, et regionalt typevassdrag med fjell, vann, våtmark og varierte elveløp. Vassdraget ble vernet i 1986 og har lange overvåkingsserier for ferskvannsøkologi og påvirkning fra sur nedbør.',
  popupDesc: 'Etne kommune fører Vikedalsvassdraget, med Bjønndalen som lokal angivelse, blant kommunens vernede vassdrag. NVE beskriver hele 038/1 Vikedalselva som et 118 km² stort typevassdrag som strekker seg fra fjellområder gjennom vann, våtmark og dal til Sandeidfjorden. History Go-markøren ligger i Etne-delen og skal derfor leses som et lokalt vindu inn i et mye større nedbørfelt. Stedet er særlig interessant fordi naturvern og langvarig miljøovervåking møtes her: Vikedalsvassdraget ble vernet i 1986, har vært overvåket for ferskvannsøkologi siden 1995 og har vært viktig i studier av langtransportert forurensning og forsuring.',
  quiz_profile: {
    place_type: 'vernet_vassdrag',
    subtype: 'etne_anker_i_regionalt_typevassdrag',
    signature_features: [
      'Etne kommune omtaler Vikedalsvassdraget lokalt som Bjønndalen',
      'hele vassdraget er NVE-objekt 038/1 og ble vernet i 1986',
      'nedbørfeltet omfatter mange vann, varierte elveløp og våtmarksområder',
      'vassdraget har lange tidsserier for ferskvannsøkologi og forsuring'
    ],
    primary_angles: ['vernet_vassdrag','nedborfelt','ferskvannsokologi','vannkvalitet','miljoovervaking'],
    question_families: ['verneplan_for_vassdrag','typevassdrag','fra_fjell_til_fjord','sur_nedbor','langtidsserier'],
    avoid_angles: ['late_som_bjonndalen_er_hele_vassdraget','flytte_vikedal_sentrum_til_etne','dagsaktuelle_fiskekvoter'],
    must_include: ['at Bjønndalen er Etne-ankeret, ikke hele vassdraget','verneåret 1986','den langsiktige miljøovervåkingen'],
    contrast_targets: ['etnevassdraget','mosneselva_etne','vaulaelva_vassdraget'],
    notes: 'Spør som vernet nedbørfelt og overvåkingslandskap. Ikke gjør markeringspunktet til hovedelvas utløp eller til et bestemt fiske-/badepunkt.'
  },
  externalLinks: sourceRefs,
  emne_ids: ['em_natur_elver_bekker_vassdrag','em_natur_arter_habitat_mangfold','em_natur_miljodata_overvaking','em_natur_vern_forvaltning_politikk'],
  underbadge_ids: ['vann_og_vassdrag','elv','innsjo','vatmark','ravine_og_dal','skog','vannkvalitet','biologisk_mangfold','fisk','fisk_og_amfibier','naturvern','friluftsliv','sedimenter','istidsspor'],
  tasks_profile: {
    title: 'Les et nedbørfelt fra Bjønndalen',
    summary: 'Fire trygge stedshandlinger som gjør terreng, avrenning og vannmiljø synlig uten å gå ned til elve- eller bekkekant.',
    tasks: [
      { id: 'vikedalsvassdraget_les_dalretningen', title: 'Finn dalens samleretning', instruction: 'Stå på offentlig vei eller etablert ferdselslinje. Se på åssidene rundt deg og pek ut hvilken retning terrenget naturlig samler regn- og smeltevann. Ikke forlat ferdselslinjen for å kontrollere svaret.', why: 'Et nedbørfelt kan leses i terrenget lenge før man ser hovedelva: høydene deler vannet, mens daler og søkk samler det.' },
      { id: 'vikedalsvassdraget_finn_tre_vannspor', title: 'Finn tre vannspor', instruction: 'Finn tre synlige tegn på vannets arbeid fra trygg grunn, for eksempel en bekk, grøft, fuktig søkk, myrkant, erodert renne eller vegetasjon som følger et vannsig.', why: 'Vikedalsvassdraget består av mange små vannveier som til sammen bygger det større systemet.' },
      { id: 'vikedalsvassdraget_sammenlign_torr_og_fuktig', title: 'Sammenlign tørr og fuktig mark', instruction: 'Velg to punkter du kan se fra samme trygge ståsted: ett høyereliggende/tørrere og ett lavere/fuktigere. Noter én forskjell i vegetasjon, jordfarge eller overflate.', why: 'Forskjeller over korte avstander viser hvordan topografi og vann påvirker habitatene i et nedbørfelt.' },
      { id: 'vikedalsvassdraget_tegn_mininedborfelt', title: 'Tegn et mini-nedbørfelt med blikket', instruction: 'Velg et lite søkk eller sidedrag du kan se uten å gå nær vann. Finn to høyder som avgrenser området og følg med blikket hvor avrenningen må samles etter regn.', why: 'Oppgaven gjør prinsippet bak et helt nedbørfelt forståelig i liten skala.' }
    ]
  },
  nature_profile: {
    type: 'vernet typevassdrag / fjell–vann–våtmark–elv / overvåkingslandskap',
    title: 'Etne-vinduet inn i Vikedalsvassdraget',
    summary: 'Bjønndalen er ikke hele Vikedalsvassdraget, men et Etne-anker i et langt større system. Etne kommune fører Vikedalsvassdraget (Bjønndalen) blant kommunens vernede vassdrag, mens NVE beskriver 038/1 Vikedalselva som et 118 kvadratkilometer stort nedbørfelt som også berører Vindafjord, Suldal og Sauda. Vassdraget er valgt som typevassdrag fordi det samler mange av regionens naturformer i ett sammenhengende system: fjellområder, mange vann, varierte elveløp, våtmark, skog og kulturmark før hovedelva når Sandeidfjorden. Omtrent førti prosent av nedbørfeltet består ifølge NVE av de største fjellpartiene i nordøst. Under skoggrensen dominerer blant annet furu- og bjørkeskog sammen med kulturmark. Fjellgardsvatnet er det største vannet i hele vassdraget, og NVE fremhever også stor kvartærgeologisk verdi, elveløpsformer og isavsmeltingsformer. For History Go er Bjønndalen særlig interessant fordi landskapet kan leses både som hydrologi og som miljøhistorie. Vassdraget ble vernet i 1986 gjennom Verneplan III, i en region der mange andre nedbørfelt er sterkt påvirket av vannkraftutbygging. Senere ble Vikedalsvassdraget også et viktig overvåkingsområde for langtransportert forurensning og ferskvannsøkologi. Miljødirektoratet oppgir at ferskvannsøkologisk overvåking har pågått siden 1995, med målinger i både rennende vann og innsjø og med undersøkelser av blant annet vannkjemi, påvekstalger, bunndyr og fisk. Eldre overvåkingsresultater beskrev moderate forsuringsskader, men også en positiv utvikling etter 1990 og lokale refugier med bedre vannkvalitet. Det gjør stedet til et eksempel på at et vernet vassdrag ikke bare er et landskap man ser på. Det er også et referanse- og læringssystem der lange tidsserier kan vise hvordan vannmiljø reagerer på forurensning, tiltak og klima over flere tiår. På selve Etne-ankeret skal dette leses uten å late som man står ved hele vassdraget: se etter dalformen, små vannveier, fuktige søkk, skog og retningen terrenget leder vannet. Markøren er et semantisk områdeanker, og all observasjon skal skje fra lovlig, trygg ferdselslinje.',
    themes: ['nedbørfelt','typevassdrag','vann og våtmark','kvartærgeologi','forsuring','langtids-overvåking','vern og referanseverdi'],
    nearby_place_ids: ['etnefjella','krokavatnet_etneforkastningen','etnevassdraget'],
    source_boundaries: ['Bjønndalen er Etne-ankeret, ikke navnet på hele NVE-objektet','fakta om laks og sjøørret gjelder Vikedalsvassdraget som helhet, ikke nødvendigvis markeringspunktet','ingen aktive artskart kobles til dette nye place-id-et i denne batchen']
  },
  training_profile: {
    title: 'Rolig felttrening i et nedbørfelt',
    summary: 'Tre lavintensive øvelser som trener terrenglesing, balanse og observasjon fra eksisterende ferdselslinjer.',
    safety: 'Bruk bare offentlig vei, merket sti eller tydelig etablert ferdselslinje. Ikke gå ut i elv, bekk, myr eller bratt dalside, og hold god avstand til glatte kanter og flomvann. Avbryt ved kraftig regn, tordenvær, is, dårlig sikt eller høy vannføring. Vis hensyn til privat grunn, beitedyr og eventuell jaktaktivitet.',
    exercises: [
      { id: 'vikedalsvassdraget_rolig_terrenglesing', title: 'Ti minutter terrenglesing', instruction: 'Gå rolig i fem minutter på trygg ferdselslinje, stopp og pek ut høyde, søkk og sannsynlig vannretning, og gå samme vei tilbake.', duration_minutes: 10, intensity: 'lett', why: 'Rolig bevegelse gjør det lettere å se hvordan terrengets form endrer avrenningen over korte avstander.' },
      { id: 'vikedalsvassdraget_stopp_og_se', title: 'Tre stopp – tre skalaer', instruction: 'Gjør tre stopp på trygg grunn. På første stopp ser du etter detaljer i bakken, på andre etter en liten vannvei, og på tredje etter hele dalsiden.', duration_minutes: 9, intensity: 'svært lett', why: 'Vassdrag forstås best når man veksler mellom detalj, lokal vannvei og hele nedbørfeltet.' },
      { id: 'vikedalsvassdraget_rolig_balansegange', title: 'Rolig linjegange på fast underlag', instruction: 'På en flat og tørr del av veien eller stien går du rolig 20 skritt mens du holder blikket framme og registrerer underlagets helling. Snu og gjenta én gang.', duration_minutes: 5, intensity: 'svært lett', why: 'Øvelsen trener oppmerksomhet på helning og underlag uten å sende brukeren ut i utrygt terreng.' }
    ]
  },
  civication_store: [
    { id: 'vikedalsvassdraget_bjonndalen_relief', title: 'Relieffmodellen av Bjønndalen', type: 'nedborfeltsmodell', kind: 'physical_object', desc: 'En fysisk relieffmodell som viser et lokalt dalsøkk med vannskiller og små tilløp samlet mot Vikedalsvassdraget.', placeSpecificReason: 'Bjønndalen er det lokale Etne-ankeret for det større vernede vassdraget, og relieffet forklarer nettopp hvordan et delområde inngår i et større nedbørfelt.', historicalFunction: 'Gjør verneplanens helhetlige nedbørfeltperspektiv fysisk forståelig.', physicalObject: true, placeSpecific: true, storePrice: 55, currency: 'PC', collection: placeId, collectable: true, civicationUse: ['nedborfelt','terrenglesing','vannskille'] },
    { id: 'vikedalsvassdraget_verneplan_iii_kort', title: 'Verneplan III-kortet 1986', type: 'vernekort', kind: 'physical_object', desc: 'Et fysisk arkivkort som markerer at Vikedalsvassdraget ble vernet i 1986 gjennom Verneplan III.', placeSpecificReason: 'Verneåret og verneplanen er direkte knyttet til NVE-objekt 038/1 Vikedalselva.', historicalFunction: 'Representerer skiftet fra mulig utbyggingsressurs til nasjonalt vernet vassdrag.', physicalObject: true, placeSpecific: true, storePrice: 30, currency: 'PC', collection: placeId, collectable: true, civicationUse: ['naturvern','vassdragsforvaltning','1986'] },
    { id: 'vikedalsvassdraget_vannkjemiflaska', title: 'Vannkjemiflaska fra langtidsovervåkingen', type: 'feltutstyr', kind: 'physical_object', desc: 'En fysisk samlerflaske modellert som prøvetakingsutstyr for vannkjemiske tidsserier i Vikedalsvassdraget.', placeSpecificReason: 'Vassdraget er dokumentert som langtidsområde for overvåking av ferskvannsøkologi og langtransportert forurensning.', historicalFunction: 'Gjør miljøovervåkingens metode synlig som en konkret gjenstand, ikke bare som et datasett.', physicalObject: true, placeSpecific: true, storePrice: 40, currency: 'PC', collection: placeId, collectable: true, civicationUse: ['vannkjemi','miljoovervaking','tidsserier'] },
    { id: 'vikedalsvassdraget_typevassdrag_profil', title: 'Profilen fra fjell til fjord', type: 'vassdragsprofil', kind: 'physical_object', desc: 'Et fysisk profilkort som følger Vikedalsvassdraget fra fjellområdene via vann og dal til Sandeidfjorden.', placeSpecificReason: 'NVE begrunner vernet med helheten og variasjonen gjennom nettopp dette regionale typevassdraget.', historicalFunction: 'Viser hvorfor verneplanen beskytter hele nedbørfelt og ikke bare ett fossefall eller én elvestrekning.', physicalObject: true, placeSpecific: true, storePrice: 45, currency: 'PC', collection: placeId, collectable: true, civicationUse: ['typevassdrag','fra_fjell_til_fjord','landskapsvariasjon'] }
  ],
  brands: [
    { id: 'nve', name: 'Norges vassdrags- og energidirektorat', brand_kind: 'public_agency', brand_type: 'watercourse_protection_authority' },
    { id: 'etne_kommune', name: 'Etne kommune', brand_kind: 'public_actor', brand_type: 'municipality_and_local_nature_management' },
    { id: 'miljodirektoratet', name: 'Miljødirektoratet', brand_kind: 'public_agency', brand_type: 'environmental_monitoring_authority' },
    { id: 'biologisk_mangfold_ferskvann_vikedal', name: 'Biologisk mangfold i ferskvann – Vikedalen', brand_kind: 'monitoring_program', brand_type: 'long_term_freshwater_monitoring' },
    { id: 'vindafjord_kommune', name: 'Vindafjord kommune', brand_kind: 'public_actor', brand_type: 'main_lower_catchment_municipality' }
  ],
  for_na: {
    title: 'Fra vernekandidat og forsuring til langtidslaboratorium',
    before: 'Før Verneplan III i 1986 var Vikedalsvassdraget ikke del av det nasjonale vernet mot kraftutbygging. Senere overvåking viste at deler av ferskvannssystemet var påvirket av sur nedbør og at bunndyrfaunaen rundt 1990 kunne være sterkt skadet.',
    now: 'I dag er hele NVE-objekt 038/1 vernet, og Vikedalsvassdraget inngår i lange overvåkingsserier for vannkjemi og ferskvannsøkologi. Miljødirektoratet oppgir overvåking siden 1995, og deler av stasjonsnettet ble innlemmet i elveovervåkingen i 2017.',
    change: 'Stedets rolle har utviklet seg fra et representativt vassdrag som måtte sikres mot kraftutbygging til et vernet landskap som også fungerer som langtidsreferanse for hvordan ferskvann reagerer på forurensning og miljøendringer.',
    look_for: ['dalens vannskiller','små søkk som samler avrenning','bekker eller fuktige renner sett fra trygg avstand','myr- og våtmarkspreg','overgangen mellom skog og åpnere mark','furu- og bjørkepreg under skoggrensen','erosjon eller sedimentspor der dette kan sees fra ferdselslinjen','retningen terrenget leder vannet','skillet mellom lokalt Bjønndalen-anker og det mye større vassdraget'],
    sources: [urls.nve, urls.etne, urls.monitoring, urls.acidRain1999]
  }
};

const story = {
  id: 'st_vikedalsvassdraget_fra_vern_til_tidsserie',
  type: 'environmental',
  title: 'Fra vern til tidsserie',
  year: 1986,
  place_id: placeId,
  person_id: null,
  summary: 'Vikedalsvassdraget gikk fra å være et regionalt typevassdrag som ble sikret mot kraftutbygging til å bli et viktig landskap for langtidsmåling av forsuring og ferskvannsøkologi.',
  story: 'I 1986 ble Vikedalsvassdraget tatt inn i Verneplan III. Begrunnelsen handlet ikke om ett enkelt punkt, men om helheten: mange vann, varierte elveløp, våtmark, fjell, skog, kulturmark og overgangen mot fjorden. NVE bruker begrepet typevassdrag fordi systemet samler naturformer som kan representere en større region.\n\nFor Etne er inngangen mer lokal. Kommunen fører Vikedalsvassdraget som et vernet vassdrag og setter Bjønndalen i parentes. History Go-markøren bruker derfor Bjønndalen som Etne-anker, men lar hele vassdragets historie være bakteppet. Spilleren står ikke ved munningen i Vikedal og heller ikke ved et geometrisk sentrum for 118 kvadratkilometer. Han står ved én del av vannsystemet og må lese hvordan lokale høyder, søkk og små vannveier kobles til en større helhet.\n\nPå slutten av 1900-tallet fikk vassdraget en ny rolle. Langtransportert luftforurensning hadde gjort mange sørnorske vann surere. Overvåkingsrapporten fra 1999 beskrev Vikedalsvassdraget som moderat forsuringsskadet, men viste også en positiv utvikling etter 1990 og lokale refugier med bedre vannkvalitet og rikere bunndyrfauna. Slike refugier kunne bli kilder til rekolonisering etter sure episoder.\n\nFra 1995 ble ferskvannsøkologien fulgt i et langsiktig overvåkingsprogram. Vannkjemi, påvekstalger, bunndyr og fisk gjør vassdraget til noe mer enn et verneobjekt: det blir en tidsserie. I 2017 ble enkelte Vikedal-stasjoner tatt inn i elveovervåkingsprogrammet. Miljødirektoratet peker på at lange dataserier kan få økende verdi når klimaendringer og andre miljøpåvirkninger skal forstås.\n\nDermed rommer Bjønndalen to typer vern. Det ene er det juridiske og geografiske vernet av et helt nedbørfelt. Det andre er kunnskapsvernet som oppstår når de samme stedene måles igjen og igjen over mange år. Det første beskytter landskapet mot enkelte inngrep. Det andre gjør det mulig å oppdage langsomme endringer som ingen enkelt turdag kan vise.',
  sources: [
    { title: 'NVE: 038/1 Vikedalselva', url: urls.nve },
    { title: 'Etne kommune: Naturforvaltning', url: urls.etne },
    { title: 'Miljødirektoratet: Biologisk mangfold i ferskvann', url: urls.monitoring },
    { title: 'Miljødirektoratet: Overvåking av langtransporterte forurensninger 1999', url: urls.acidRain1999 },
    { title: 'NVE: Verneplan for vassdrag', url: urls.verneplan }
  ],
  tags: ['vikedalsvassdraget','bjonndalen','verneplan_iii','sur_nedbor','ferskvannsovervaking','tidsserier'],
  related_people: [],
  related_places: ['etnefjella','krokavatnet_etneforkastningen','etnevassdraget'],
  score: { narrative: 5, historical: 4, source: 5, play_value: 5, originality: 5, total: 24 },
  arc: {
    start: 'Et regionalt typevassdrag blir vernet som helhet i 1986.',
    middle: 'Forsuring gjør vannkvalitet og bunndyr til tegn på langtransportert forurensning.',
    end: 'Langtidsmålinger gjør vassdraget til en tidsserie for framtidige miljøendringer.'
  },
  next_scenes: [
    { place_id: 'etnefjella', reason: 'Etnefjella viser høyfjellslandskapet og vannskillene som former flere av kommunens nedbørfelt.' },
    { place_id: 'krokavatnet_etneforkastningen', reason: 'Krokavatnet viser hvordan geologi gir et annet lag av naturhistorien i de sørlige Etnefjellene.' }
  ]
};

const facts = [
  ['Etne-ankeret Bjønndalen','Etne kommune fører Vikedalsvassdraget blant kommunens vernede vassdrag og angir Bjønndalen i parentes.','Etne kommune: Naturforvaltning'],
  ['NVE-objekt 038/1','Det vernede vassdraget er registrert av NVE som 038/1 Vikedalselva.','NVE: 038/1 Vikedalselva'],
  ['Vernet i 1986','Vikedalsvassdraget ble vernet gjennom Verneplan III i 1986.','NVE: 038/1 Vikedalselva'],
  ['118 km² nedbørfelt','NVE oppgir hele nedbørfeltet til 118 kvadratkilometer.','NVE: 038/1 Vikedalselva'],
  ['Fire kommuner','NVE fører Vindafjord, Etne, Suldal og Sauda som kommuner i nedbørfeltet.','NVE: 038/1 Vikedalselva'],
  ['Fjellgardsvatnet størst','Fjellgardsvatnet er oppgitt som største vann i vassdraget, 2,2 km² og 158 meter over havet.','NVE: 038/1 Vikedalselva'],
  ['Omtrent 40 prosent fjell','NVE beskriver de største fjellpartiene i nordøst som omtrent 40 prosent av nedbørfeltet.','NVE: 038/1 Vikedalselva'],
  ['Furu, bjørk og kulturmark','Under skoggrensen beskrives store arealer som kulturmark og skog med furu og bjørk.','NVE: 038/1 Vikedalselva'],
  ['Mange vann og våtmarker','Mange vann, varierte elveløp og våtmarksområder er sentrale deler av vernegrunnlaget.','NVE: 038/1 Vikedalselva'],
  ['Stor kvartærgeologisk verdi','NVE framhever nedbørfeltets kvartærgeologiske verdi og egnethet som typevassdrag.','NVE: 038/1 Vikedalselva'],
  ['Overvåket for sur nedbør','Vassdraget har vært del av overvåking av langtransportert forurensning med vannkvalitet som sentralt tema.','NVE: 038/1 Vikedalselva'],
  ['Ferskvannsovervåking siden 1995','Miljødirektoratet oppgir at overvåkingen av ferskvannsøkologi i Vikedalsvassdraget har pågått siden 1995.','Miljødirektoratet: Biologisk mangfold i ferskvann'],
  ['Flere biologiske måletyper','Programmet omfatter blant annet vannkjemi, påvekstalger, bunndyr og fisk i elvestasjoner.','Miljødirektoratet: Biologisk mangfold i ferskvann'],
  ['Vikedal inn i elveovervåking i 2017','Miljødirektoratet oppgir at noen Vikedal-stasjoner ble tatt inn i elveovervåkingsprogrammet i 2017.','Miljødirektoratet: Biologisk mangfold i ferskvann']
].map(([label, desc, source], index) => ({ id: `fact_vikedalsvassdraget_${String(index + 1).padStart(2,'0')}`, label, desc, confidence: 'high', sources: [source] }));

const article = {
  place_id: placeId,
  visual: { designCode: 'article_nature_route_miniature' },
  version: 2,
  title: 'Vikedalsvassdraget – Bjønndalen',
  popupDesc: 'Etne-anker i et vernet regionalt typevassdrag med lange tidsserier for ferskvannsøkologi og forsuring.',
  wikiText: [
    'Etne kommune fører Vikedalsvassdraget (Bjønndalen) blant de vernede vassdragene i kommunen. NVE registrerer hele systemet som 038/1 Vikedalselva. History Go-markøren bruker Bjønndalen som et lokalt Etne-anker og skal ikke tolkes som hele vassdragets geografiske sentrum eller som hovedelvas utløp i Vikedal.',
    'NVE beskriver et 118 kvadratkilometer stort nedbørfelt som berører Vindafjord, Etne, Suldal og Sauda. Mange vann, varierte elveløp og våtmarker inngår i et landskap som går fra fjellområder via dal til Sandeidfjorden. De største fjellpartiene ligger i nordøst og utgjør omtrent førti prosent av feltet.',
    'Fjellgardsvatnet er vassdragets største innsjø, oppgitt til 2,2 kvadratkilometer og 158 meter over havet. Under skoggrensen består store arealer av kulturmark og skog med furu og bjørk. NVE framhever også elveløpsformer, isavsmeltingsformer og stor kvartærgeologisk verdi.',
    'Vikedalsvassdraget ble vernet i 1986 gjennom Verneplan III. NVE omtaler det som et anbefalt typevassdrag for regionen. Verneplan for vassdrag skal beskytte helhetlige nedbørfelt og den naturlige dynamikken og variasjonen fra fjell til fjord, først og fremst mot vannkraftutbygging som kan svekke verneverdiene.',
    'Vassdraget ble også et viktig sted for miljøovervåking. Miljødirektoratet oppgir at ferskvannsøkologisk overvåking har pågått siden 1995. I innsjø og rennende vann undersøkes blant annet vannkjemi, plankton, påvekstalger, bunndyr og fisk. Noen Vikedal-stasjoner ble tatt inn i elveovervåkingsprogrammet i 2017.',
    'Forsuring er en viktig del av miljøhistorien. En overvåkingsrapport fra 1999 beskrev Vikedalsvassdraget som moderat forsuringsskadet, men med positiv utvikling etter 1990. Rapporten pekte også på lokale refugier med bedre vannkvalitet og rik bunndyrfauna som kunne bidra til rekolonisering etter sure episoder.',
    'Ved Bjønndalen kan spilleren derfor lese et stort system gjennom små tegn: vannskiller i åssidene, søkk der avrenning samles, fuktig mark, små vannveier og overgangen mellom skog og åpnere areal. Det viktigste kildekritiske grepet er å holde skalaene fra hverandre: det lokale Etne-ankeret er én inngang til et vassdrag som fortsetter langt utenfor markøren.'
  ],
  summary: {
    one_liner: 'Bjønndalen er Etne-ankeret i et vernet typevassdrag der landskapsvern og flere tiår med ferskvannsovervåking møtes.',
    themes: ['vernet vassdrag','typevassdrag','nedbørfelt','forsuring','ferskvannsøkologi','langtidsserier','Bjønndalen'],
    tone: ['nøktern','faglig','stedsspesifikk','kildekritisk']
  },
  facts,
  chronology: [
    { id: 'chrono_vikedalsvassdraget_01', year: 1986, period: 'Verneplan III', desc: 'Vikedalsvassdraget blir vernet som NVE-objekt 038/1.', confidence: 'high', sources: ['NVE: 038/1 Vikedalselva'] },
    { id: 'chrono_vikedalsvassdraget_02', year: 1990, period: 'Vendepunkt i forsuringstrenden', desc: 'Overvåkingsrapporten fra 1999 beskriver en positiv utvikling etter 1990, etter at bunndyrfaunaen tidligere var sterkere skadet.', confidence: 'medium', sources: ['Miljødirektoratet: Overvåking av langtransporterte forurensninger 1999'] },
    { id: 'chrono_vikedalsvassdraget_03', year: 1995, period: 'Langsiktig ferskvannsovervåking', desc: 'Miljødirektoratet oppgir oppstart av ferskvannsøkologisk overvåking i Vikedalsvassdraget.', confidence: 'high', sources: ['Miljødirektoratet: Biologisk mangfold i ferskvann'] },
    { id: 'chrono_vikedalsvassdraget_04', year: 1999, period: 'Forsuringsstatus dokumentert', desc: 'En samlet overvåkingsrapport beskriver moderat forsuringsskade, positive trender og lokale refugier med bedre vannkvalitet.', confidence: 'high', sources: ['Miljødirektoratet: Overvåking av langtransporterte forurensninger 1999'] },
    { id: 'chrono_vikedalsvassdraget_05', year: 2017, period: 'Elveovervåkingsprogram', desc: 'Noen Vikedal-stasjoner blir tatt inn i elveovervåkingsprogrammet.', confidence: 'high', sources: ['Miljødirektoratet: Biologisk mangfold i ferskvann'] },
    { id: 'chrono_vikedalsvassdraget_06', year: 2026, period: 'History Go-anker i Etne', desc: 'Bjønndalen blir etablert som det lokale History Go-ankeret for Vikedalsvassdraget i Etne og får første komplette natur-rundingsbatch.', confidence: 'high', sources: ['History Go place data'] }
  ],
  sources: [
    { id: 'source_vikedalsvassdraget_01', label: 'NVE: 038/1 Vikedalselva', type: 'official', url: urls.nve, confidence: 'high' },
    { id: 'source_vikedalsvassdraget_02', label: 'Etne kommune: Naturforvaltning', type: 'official', url: urls.etne, confidence: 'high' },
    { id: 'source_vikedalsvassdraget_03', label: 'Miljødirektoratet: Biologisk mangfold i ferskvann', type: 'official', url: urls.monitoring, confidence: 'high' },
    { id: 'source_vikedalsvassdraget_04', label: 'Miljødirektoratet: Overvåking av langtransporterte forurensninger 1999', type: 'official_report', url: urls.acidRain1999, confidence: 'high' },
    { id: 'source_vikedalsvassdraget_05', label: 'NVE: Verneplan for vassdrag', type: 'official', url: urls.verneplan, confidence: 'high' }
  ],
  interpretation: {
    what_to_notice: ['vannskiller i åssidene','søkk der avrenning samles','små vannveier sett fra trygg avstand','fuktige partier og våtmarkspreg','skoggrensen og vegetasjonsskifter','tegn på erosjon eller sedimenttransport','forskjellen mellom et lokalt anker og et helt nedbørfelt'],
    why_it_matters: ['Vassdraget viser hvorfor naturvern ofte må gjelde hele nedbørfelt og ikke bare enkeltpunkter.','Langtidsmålinger gjør langsomme miljøendringer synlige.','Bjønndalen gjør det mulig å forstå et regionalt vassdrag fra en lokal Etne-inngang.'],
    counterpoints: ['Markøren er ikke hele Vikedalsvassdraget.','Fakta om hovedelva ved Vikedal skal ikke flyttes til Bjønndalen som lokalfakta.','Ingen artsliste er lagt til uten dokumentert place-level mapping.']
  },
  links: { entry_ids: [story.id], related_places: ['etnefjella','krokavatnet_etneforkastningen','etnevassdraget'], related_people: [] }
};

const placeManifestPath = path.join(root, 'data/places/manifest.json');
const placeManifest = JSON.parse(await fs.readFile(placeManifestPath, 'utf8'));
if (!Array.isArray(placeManifest.files)) throw new Error('data/places/manifest.json missing files[]');

for (const rel of placeManifest.files) {
  const full = path.join(root, 'data', rel);
  try {
    const payload = JSON.parse(await fs.readFile(full, 'utf8'));
    const rows = Array.isArray(payload) ? payload : Array.isArray(payload?.places) ? payload.places : [];
    if (rows.some((row) => row?.id === placeId)) throw new Error(`Refusing duplicate active place id ${placeId} in ${rel}`);
  } catch (error) {
    if (String(error).includes('Refusing duplicate active place id')) throw error;
  }
}

await writeJson(placePath, [place]);
if (!placeManifest.files.includes(placeRel)) placeManifest.files.push(placeRel);
await writeJson(placeManifestPath, placeManifest);

await writeJson(storyPath, [story]);
const storyManifestPath = path.join(root, 'data/stories/stories_manifest.json');
const storyManifest = JSON.parse(await fs.readFile(storyManifestPath, 'utf8'));
if (!Array.isArray(storyManifest.files)) throw new Error('stories_manifest.json missing files[]');
if (!storyManifest.files.some((entry) => (typeof entry === 'string' ? entry === storyRel : entry?.path === storyRel))) {
  storyManifest.files.push({ category: 'natur', path: storyRel, entity_id: placeId });
}
await writeJson(storyManifestPath, storyManifest);

await writeJson(articlePath, article);
const leksikonManifestPath = path.join(root, 'data/leksikon/manifest.json');
const leksikonManifest = JSON.parse(await fs.readFile(leksikonManifestPath, 'utf8'));
if (!Array.isArray(leksikonManifest.files)) throw new Error('data/leksikon/manifest.json missing files[]');
if (!leksikonManifest.files.includes(articleRel)) leksikonManifest.files.push(articleRel);
await writeJson(leksikonManifestPath, leksikonManifest);

const testSource = `const assert = require('assert');\nconst fs = require('fs');\nconst path = require('path');\nconst repo = path.resolve(__dirname, '..');\nconst readJson = p => JSON.parse(fs.readFileSync(path.join(repo,p),'utf8'));\nconst expectedRounds = ['tasks','nature','badges','training','civication','brands','før_nå','fortellinger','leksikon'];\nconst runtime = fs.readFileSync(path.join(repo,'js/ui/place-card.js'),'utf8');\nconst profileMatch = runtime.match(/natur:\\s*\\[([^\\]]+)\\]/);\nassert(profileMatch,'runtime mangler naturprofil');\nassert.deepStrictEqual(JSON.parse('[' + profileMatch[1] + ']'), expectedRounds);\nconst place = readJson('data/${placeRel}')[0];\nconst story = readJson('${storyRel}')[0];\nconst article = readJson('${articleRel}');\nconst storyManifest = readJson('data/stories/stories_manifest.json');\nconst leksikonManifest = readJson('data/leksikon/manifest.json');\nconst validBadges = new Set(readJson('data/badges/natur.json').sub);\nassert.strictEqual(place.id,'${placeId}');\nassert.strictEqual(place.category,'natur');\nassert.strictEqual(place.year,1986);\nassert.strictEqual(place.coordStatus,'needs_manual_visual_qa');\nassert(/^kartverket-ssr:/.test(place.sourceObjectId));\nfor (const forbidden of ['rounds','rundinger','routes','play_profile','flora','fauna']) assert(!Object.prototype.hasOwnProperty.call(place,forbidden),'forbudt felt '+forbidden);\nconst roundContent = { tasks:place.tasks_profile, nature:place.nature_profile, badges:place.underbadge_ids, training:place.training_profile, civication:place.civication_store, brands:place.brands, 'før_nå':place.for_na, fortellinger:[story], leksikon:[article] };\nassert.deepStrictEqual(Object.keys(roundContent),expectedRounds);\nfor (const [id,value] of Object.entries(roundContent)) { const filled=Array.isArray(value)?value.length>0:Boolean(value&&typeof value==='object'); assert(filled,'mangler '+id); }\nassert(place.externalLinks.length>=5);\nassert(place.underbadge_ids.length>=12 && place.underbadge_ids.every(x=>validBadges.has(x)));\nassert.strictEqual(place.tasks_profile.tasks.length,4);\nassert.strictEqual(place.training_profile.exercises.length,3);\nassert(/ikke gå ut i elv|offentlig vei|merket sti/i.test(place.training_profile.safety));\nassert(place.nature_profile.summary.length>=1500);\nassert.strictEqual(place.civication_store.length,4);\nassert(place.civication_store.every(x=>x.physicalObject===true&&x.placeSpecific===true));\nassert(place.brands.length>=5);\nassert(place.for_na.look_for.length>=8);\nassert(story && story.place_id===place.id && story.sources.length>=5);\nassert(storyManifest.files.some(x=>typeof x==='object'&&x.path==='${storyRel}'&&x.entity_id===place.id&&x.category==='natur'));\nassert(article && article.place_id===place.id && article.version===2 && article.title===place.name);\nassert(article.sources.length>=5 && article.facts.length>=14 && article.chronology.length>=6);\nassert(article.links.entry_ids.includes(story.id));\nassert(leksikonManifest.files.includes('${articleRel}'));\nconst all=JSON.stringify({place,story,article});\nfor (const token of ['1986','118','Fjellgardsvatnet','1995','2017','sur nedbør','Bjønndalen','typevassdrag']) assert(all.includes(token),'mangler '+token);\nassert(/ikke hele Vikedalsvassdraget|ikke.*hele.*vassdraget/i.test(all));\nconsole.log('Vikedalsvassdraget Bjønndalen nature rounds batch 1 OK');\n`;
await fs.writeFile(testPath, testSource, 'utf8');

const result = spawnSync(process.execPath, [testPath], { cwd: root, encoding: 'utf8' });
await fs.writeFile(path.join(validationDir, 'round-content-test.txt'), `${result.stdout || ''}${result.stderr || ''}`, 'utf8');
if (result.status !== 0) throw new Error(`Round content test failed with exit ${result.status}`);

const summary = {
  batch: 'Vikedalsvassdraget – Bjønndalen nature rounds batch 1',
  date: verifiedAt,
  addedPlaceId: placeId,
  coordinate: { lat: place.lat, lon: place.lon, status: place.coordStatus, sourceObjectId: place.sourceObjectId },
  rounds: ['tasks','nature','badges','training','civication','brands','før_nå','fortellinger','leksikon'],
  content: {
    tasks: place.tasks_profile.tasks.length,
    trainingExercises: place.training_profile.exercises.length,
    civicationObjects: place.civication_store.length,
    brands: place.brands.length,
    storyId: story.id,
    articlePath: articleRel,
    facts: article.facts.length,
    chronologyEntries: article.chronology.length
  },
  documentationRead: ['data/places/README_place_rounds.md','docs/PLACE_STANDARD.md','docs/DATA_PRODUCTION_CONTRACT.md','README/quizREADME.md','reports/nature-round-eligibility-rule.md','README/nature_mapping_workflow.md']
};
await writeJson(path.join(reportDir, 'summary.json'), summary);
await fs.writeFile(path.join(reportDir, 'README.md'), `# Vikedalsvassdraget – Bjønndalen: natur-rundinger batch 1\n\nDato: ${verifiedAt}\n\nDenne batchen legger inn det siste systematiske Etne-naturstedet og starter rundingsproduksjonen med en komplett naturprofil uten manuell \`rounds\`-override.\n\nFylte canonical rundinger: ${summary.rounds.join(', ')}.\n\nKildeprinsipp: synlig innhold er ledet av NVE, Etne kommune og Miljødirektoratet. Bjønndalen behandles eksplisitt som Etne-anker for et større vassdrag, ikke som hele Vikedalsvassdraget.\n\nKoordinatstatus: \`${place.coordStatus}\` med Kartverket SSR-anker \`${place.sourceObjectId}\`.\n\nValidering: \`validation/round-content-test.txt\`.\n`, 'utf8');

console.log(JSON.stringify(summary, null, 2));