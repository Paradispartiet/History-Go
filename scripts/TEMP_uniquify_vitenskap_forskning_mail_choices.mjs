import fs from 'node:fs';

const ROLE = 'vitenskap_forskning';
const CATEGORY = 'vitenskap';

const labelsByMailId = {
  vitenskap_forskning_job_001: [
    'Lås spørsmål og oppdragsgrense før analyse',
    'Tilpass prosjektet til ønsket konklusjon'
  ],
  vitenskap_forskning_job_002: [
    'Frys data, kode og miljø for reproduksjon',
    'Godta én vellykket lokal kjøring'
  ],
  vitenskap_forskning_job_003: [
    'Vis usikkerhet og alternative analyser',
    'Velg analysen med tydeligst resultat'
  ],
  vitenskap_forskning_job_004: [
    'Stans og avklar etikk, rettigheter og deling',
    'Del videre uten ny kontroll'
  ],
  vitenskap_forskning_people_001: [
    'Svar Ida med evidensens faktiske grense',
    'Gi oppdragsgiver svaret de ønsker'
  ],
  vitenskap_forskning_people_002: [
    'Reproduser sammen med Amir fra ren start',
    'Be Amir stole på den opprinnelige kjøringen'
  ],
  vitenskap_forskning_people_003: [
    'Gjenåpne avklaringen med Ragnhild',
    'La gammel godkjenning dekke nytt formål'
  ],
  vitenskap_forskning_people_004: [
    'Versjoner reworken etter Majas kritikk',
    'Omskriv analysen uten synlig historikk'
  ]
};

function patchType(type) {
  const file = `data/Civication/mailFamilies/${CATEGORY}/${type}/${ROLE}_${type}.json`;
  const catalog = JSON.parse(fs.readFileSync(file, 'utf8'));
  const mails = catalog?.families?.[0]?.mails;
  if (!Array.isArray(mails) || mails.length !== 4) {
    throw new Error(`${file}: expected exactly 4 mails`);
  }

  for (const mail of mails) {
    const labels = labelsByMailId[mail.id];
    if (!labels) throw new Error(`${file}: unexpected mail id ${mail.id}`);
    if (!Array.isArray(mail.choices) || mail.choices.length !== 2) {
      throw new Error(`${mail.id}: expected exactly 2 choices`);
    }
    mail.choices[0].label = labels[0];
    mail.choices[1].label = labels[1];
  }

  const signatures = mails.map((mail) => mail.choices
    .map((choice) => String(choice.label || '').trim().toLowerCase().replace(/\s+/g, ' '))
    .sort()
    .join(' || '));
  if (new Set(signatures).size !== signatures.length) {
    throw new Error(`${file}: choice signatures are still duplicated`);
  }

  fs.writeFileSync(file, `${JSON.stringify(catalog, null, 2)}\n`);
}

patchType('job');
patchType('people');

console.log('Uniquified Vitenskap Forskning choice labels for 4 job mails and 4 people mails.');
