import fs from 'node:fs';
import path from 'node:path';

const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const writeJson = (file, value) => {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
};
const pushUnique = (arr, value) => {
  if (!arr.includes(value)) arr.push(value);
};
const pushLink = (arr, link) => {
  if (!arr.some((item) => item.url === link.url)) arr.push(link);
};
const requirePlace = (items, id, file) => {
  const place = items.find((item) => item.id === id);
  if (!place) throw new Error(`Missing ${id} in ${file}`);
  return place;
};

const verifiedAt = '2026-07-24';

// 1) BO Billedkunstnerne i Oslo -> Rådmannsgården / Anatomibygget.
{
  const file = 'data/places/historie/oslo/places_historie_oslo_kultureiendommer_batch_02.json';
  const items = readJson(file);
  const place = requirePlace(items, 'radmannsgarden_og_anatomibygget', file);

  place.desc = 'To av Kvadraturens eldste og mest lagdelte bygninger, med spor etter rådmannsbolig, militærforvaltning, universitet, sykehus, bibliotek, atelier og kunstnerorganisasjoner. Bygningene rommer i dag både Oslo Kunstforening og BO – Billedkunstnerne i Oslo som aktive lag i stedets kunstliv.';

  const boParagraph = 'BO (Billedkunstnerne i Oslo) holder også til i Anatomigården i Rådhusgata 19. Organisasjonen er både fagorganisasjon for billedkunstnere i Oslo og et visningsrom for samtidskunst. I History Go behandles BO som et nåværende institusjonslag i den allerede canonical bygningsidentiteten, på samme måte som Oslo Kunstforening, slik at stedet får én fysisk markør uten å miste de ulike kunstinstitusjonene som faktisk bruker anlegget.';
  if (!place.popupDesc.includes('BO (Billedkunstnerne i Oslo)')) place.popupDesc += `\n\n${boParagraph}`;

  const qp = place.quiz_profile;
  pushUnique(qp.signature_features, 'BO – Billedkunstnerne i Oslo holder til i Anatomigården som fagorganisasjon og visningsrom for samtidskunst');
  pushUnique(qp.primary_angles, 'samtidskunst_og_kunstnerorganisasjoner');
  pushUnique(qp.must_include, 'BO som nåværende fagorganisasjon og visningsrom i Anatomigården');
  qp.notes = 'Representeres som én canonical place for å unngå overlappende markører på samme kulturhistoriske eiendom. Quiz og leksikon skal holde Rådmannsgården og Anatomibyggets historiske lag tydelig fra hverandre, samtidig som dagens kunstinstitusjoner Oslo Kunstforening og BO kan formidles som separate brukslag.';

  place.externalLinks ??= [];
  pushLink(place.externalLinks, {
    type: 'official',
    label: 'BO – om organisasjonen og visningsrommet',
    url: 'https://www.billedkunstnerneioslo.no/om-boa/',
    lang: 'nb',
    verifiedAt
  });
  writeJson(file, items);
}

// 2) Oslo Glass Studio -> Kirkeristen, Basarene og Brannvakten.
{
  const file = 'data/places/historie/oslo/places_historie_oslo_oppdag_kvadraturen_batch_01.json';
  const items = readJson(file);
  const place = requirePlace(items, 'kirkeristen_basarene_brannvakten', file);

  place.desc = 'Det nygotiske basar- og brannvaktanlegget rundt Oslo domkirke, tegnet av Christian H. Grosch og ferdigstilt i etapper fram mot 1856. I dag rommer basarene blant annet Oslo Glass Studio, der publikum kan møte levende glassblåserhåndverk i det historiske anlegget.';

  const glassParagraph = 'Et nyere brukslag er Oslo Glass Studio i Dronningens gate 27. Tre etablerte glasskunstnere tok over verkstedet i 2023 og åpnet galleriet for publikum under Oslo Open samme vår. Her fungerer en del av de historiske basarene som aktiv glasshytte, verksted, galleri og butikk, og besøkende kan se glassblåsing på nært hold. I History Go behandles dette som nåværende bruk av Kirkeristen-komplekset, ikke som en egen overlappende markør.';
  if (!place.popupDesc.includes('Oslo Glass Studio')) place.popupDesc += `\n\n${glassParagraph}`;

  const qp = place.quiz_profile;
  pushUnique(qp.signature_features, 'en del av basaranlegget brukes i dag av Oslo Glass Studio som glasshytte, verksted og galleri');
  pushUnique(qp.primary_angles, 'kunsthandverk_og_levende_verksted');
  pushUnique(qp.question_families, 'historisk_bygg_og_naverende_bruk');
  pushUnique(qp.must_include, 'dagens glassblåserhåndverk som et nytt brukslag i det historiske basaranlegget');
  qp.notes = 'Skal representeres som det sammenhengende anlegget rundt domkirken, ikke som overlappende markører. Oslo Glass Studio formidles som et nåværende brukslag inne i den canonical fysiske identiteten.';

  place.externalLinks ??= [];
  pushLink(place.externalLinks, {
    type: 'official',
    label: 'Oslo Glass Studio – om verkstedet på Kirkeristen',
    url: 'https://www.osloglassstudio.com/om-oss.html',
    lang: 'nb',
    verifiedAt
  });
  writeJson(file, items);
}

// 3) Atelier Nord -> Hauges Minde.
{
  const file = 'data/places/historie/oslo/places_historie_oslo_kultureiendommer_batch_03.json';
  const items = readJson(file);
  const place = requirePlace(items, 'hauges_minde', file);

  place.desc = 'Bedehus fra 1875 ved Olaf Ryes plass, senere brukt som kirkerom, okkupasjonskontor, herberge og krisesenter. I dag er bygget et kunstnerhus med atelierer og Atelier Nord, som har visningsrom for mediekunst her.';

  const atelierParagraph = 'Atelier Nord utgjør et tydelig nåværende kunstlag i Hauges Minde. Institusjonen utvidet virksomheten med visningsrom på Olaf Ryes plass 2 i 2011, og i 2017 flyttet også administrasjonen inn i samme bygg. Atelier Nord arbeider særlig med å vise og formidle mediekunst. I History Go behandles institusjonen som dagens bruk av den allerede canonical kulturbygningen, ikke som en ekstra markør på samme adresse.';
  if (!place.popupDesc.includes('Atelier Nord utgjør')) place.popupDesc += `\n\n${atelierParagraph}`;

  const qp = place.quiz_profile;
  pushUnique(qp.signature_features, 'Atelier Nord har hatt visningsrom for mediekunst i bygget siden 2011');
  pushUnique(qp.primary_angles, 'mediekunst_og_samtidskunst');
  pushUnique(qp.question_families, 'historisk_bygg_og_naverende_bruk');
  pushUnique(qp.must_include, 'Atelier Nord som nåværende visningsrom for mediekunst i bygget');
  qp.notes = 'Skal leses som et flerlaget institusjonsbygg. Hold Hans Nielsen Hauge som navne- og idéhistorisk referanse adskilt fra Storjohanns rolle som konkret initiativtaker, og formidle Atelier Nord som et nåværende brukslag i den samme fysiske bygningen.';

  place.externalLinks ??= [];
  pushLink(place.externalLinks, {
    type: 'official',
    label: 'Atelier Nord – om visningsrommet på Olaf Ryes plass 2',
    url: 'https://ateliernord.no/om-oss/',
    lang: 'nb',
    verifiedAt
  });
  writeJson(file, items);
}

// Close the three parent-enrichment queue items in the authoritative classification.
{
  const file = 'reports/visitoslo-galleries-audit-20260723/full-scope-classification/final-classification.json';
  const data = readJson(file);
  const completed = new Set(['BO Billedkunstnerne i Oslo', 'Oslo Glass Studio', 'Atelier Nord']);
  for (const item of data.parentReuseEnrichment) {
    if (completed.has(item.sourceItem)) item.status = 'completed_parent_enrichment';
  }
  data.nextWork.parentEnrichmentQueue = [];
  data.nextWork.completedParentEnrichments = [
    'radmannsgarden_og_anatomibygget:BO Billedkunstnerne i Oslo',
    'kirkeristen_basarene_brannvakten:Oslo Glass Studio',
    'hauges_minde:Atelier Nord'
  ];
  writeJson(file, data);
}

// Update the human-readable scope closure.
{
  const file = 'reports/visitoslo-galleries-audit-20260723/full-scope-classification/README.md';
  let text = fs.readFileSync(file, 'utf8');
  text = text
    .replace('- **BO Billedkunstnerne i Oslo** → `radmannsgarden_og_anatomibygget` — BO is housed at Rådhusgata 19 / Anatomigården, so the existing combined physical parent should be enriched rather than duplicated.', '- **BO Billedkunstnerne i Oslo** → `radmannsgarden_og_anatomibygget` — completed parent enrichment; BO is recorded as a current organisation and exhibition-space layer in Anatomigården.')
    .replace('- **Oslo Glass Studio** → `kirkeristen_basarene_brannvakten` — the working glass studio/gallery is inside the already canonical Kirkeristen complex.', '- **Oslo Glass Studio** → `kirkeristen_basarene_brannvakten` — completed parent enrichment; the working glass studio/gallery is recorded as a current use layer inside Kirkeristen.')
    .replace('- **Atelier Nord** → `hauges_minde` — Atelier Nord occupies Olaf Ryes plass 2, the already canonical Hauges Minde cultural property.', '- **Atelier Nord** → `hauges_minde` — completed parent enrichment; Atelier Nord is recorded as the current media-art exhibition layer in Hauges Minde.')
    .replace('2. Apply the three remaining parent enrichments for BO, Oslo Glass Studio and Atelier Nord.', '2. Parent enrichment queue completed: BO, Oslo Glass Studio and Atelier Nord are now folded into their existing physical parent records.')
    .replace('Status: **FULL VISITOSLO GALLERIES SCOPE CLOSED — 66/66 CLASSIFIED; 0 UNRESOLVED.**', 'Status: **FULL VISITOSLO GALLERIES SCOPE CLOSED — 66/66 CLASSIFIED; PARENT ENRICHMENT QUEUE COMPLETE; 0 UNRESOLVED.**');
  fs.writeFileSync(file, text);
}

// Durable closure record for this enrichment pass.
writeJson('reports/visitoslo-galleries-audit-20260723/parent-enrichments/closure.json', {
  version: '2026-07-24',
  status: 'completed',
  policy: 'Reuse the existing canonical physical parent and enrich current institutional use instead of creating overlapping markers.',
  enrichments: [
    {
      sourceItem: 'BO Billedkunstnerne i Oslo',
      parentPlaceId: 'radmannsgarden_og_anatomibygget',
      officialSource: 'https://www.billedkunstnerneioslo.no/om-boa/',
      result: 'current organisation and contemporary-art exhibition-space layer added'
    },
    {
      sourceItem: 'Oslo Glass Studio',
      parentPlaceId: 'kirkeristen_basarene_brannvakten',
      officialSource: 'https://www.osloglassstudio.com/om-oss.html',
      result: 'current glassblowing workshop, gallery and public-use layer added'
    },
    {
      sourceItem: 'Atelier Nord',
      parentPlaceId: 'hauges_minde',
      officialSource: 'https://ateliernord.no/om-oss/',
      result: 'current media-art exhibition-space layer added'
    }
  ],
  coordinateDecision: 'No new markers or coordinate changes. All three institutions reuse existing canonical physical parents.'
});

console.log('Completed VisitOSLO Galleries parent enrichments for BO, Oslo Glass Studio and Atelier Nord.');
