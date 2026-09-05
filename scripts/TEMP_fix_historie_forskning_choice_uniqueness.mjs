import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const catalogs = [
  'data/Civication/mailFamilies/historie/job/historie_forskning_og_akademia_job.json',
  'data/Civication/mailFamilies/historie/people/historie_forskning_og_akademia_people.json'
];

const choicesByMail = {
  historie_forskning_og_akademia_job_motbevis_001: {
    A: ['Revider hovedtesen mot den nye kilden', 'Jeg lar den nye kilden endre akkurat premisset den faktisk treffer, beholder motbeviset synlig og versjonerer den berørte argumentrekken før neste handoff.'],
    B: ['Tone ned motbeviset for å bevare hovedtesen', 'Jeg beholder hovedtesen uendret, gjør motbeviset mindre synlig og sender manus videre for å beskytte fremdrift og investert argumentasjon.']
  },
  historie_forskning_og_akademia_job_fragmentert_arkiv_002: {
    A: ['Avgrens konklusjonen rundt arkivets skjevhet', 'Jeg dokumenterer hvem arkivet overrepresenterer, lar fraværet stå som kildeproblem og begrenser påstanden til det materialet faktisk kan bære.'],
    B: ['Behandle det bevarte arkivet som representativt', 'Jeg bruker det rikeste materialet som om det dekket hele aktørbildet og lar den manglende dokumentasjonen forsvinne fra argumentets usikkerhet.']
  },
  historie_forskning_og_akademia_job_publiseringsfrist_003: {
    A: ['Kontroller kildegruppen eller avgrens påstanden før innsending', 'Jeg gjør kildegapet eksplisitt og enten fullfører kontrollen eller snevrer inn påstanden før manus får status som innsendingsklart.'],
    B: ['Send manuset før kildekontrollen er ferdig', 'Jeg lar fristen definere modenhet og sender den sterkere påstanden selv om den sentrale kildegruppen fortsatt kan endre argumentstyrken.']
  },
  historie_forskning_og_akademia_job_review_rework_004: {
    A: ['Gjenåpne bare avsnittene rivalforklaringen faktisk treffer', 'Jeg binder reviewinnvendingen til de to berørte avsnittene, tester rivalforklaringen mot samme kilder og versjonerer avgrenset rework.'],
    B: ['Forsvar manusversjonen uten å prøve rivalforklaringen', 'Jeg behandler fagfelleinnvendingen som et preferansespørsmål og lar de berørte avsnittene stå uten ny motprøving.']
  },
  historie_forskning_og_akademia_people_veiledning_001: {
    A: ['Avgrens forskningsspørsmålet sammen med veilederen', 'Jeg skiller tema fra forskbart spørsmål og gjør kilde-, metode- og avgrensningskrav eksplisitte før arbeidet skaleres opp.'],
    B: ['Behold det brede spørsmålet for å unngå omarbeid', 'Jeg lar prosjektets opprinnelige bredde stå selv om kilde- og metodekravene ikke kan prøves på en ryddig måte.']
  },
  historie_forskning_og_akademia_people_arkivar_002: {
    A: ['Registrer proveniens- og tilgangshullet med arkivaren', 'Jeg fører serie, bevaringslogikk, tilgang og det konkrete hullet inn i forskningssporet og lar usikkerheten begrense videre bruk.'],
    B: ['Fyll arkivhullet med en plausibel antakelse', 'Jeg behandler fraværet som om det kan rekonstrueres fra nabomateriale og lar antakelsen gli inn i analysen uten egen usikkerhetsmarkør.']
  },
  historie_forskning_og_akademia_people_fagfelle_003: {
    A: ['Prøv rivalforklaringen mot de samme kildene', 'Jeg gjør fagfellens alternativ eksplisitt, tester premissene mot samme kildegrunnlag og viser hvorfor eget argument eventuelt fortsatt står.'],
    B: ['Avvis rivalforklaringen som en forsinkelse', 'Jeg behandler fagfellens alternativ som sidespor fordi hovedargumentet allerede er godt utviklet og fristen nærmer seg.']
  },
  historie_forskning_og_akademia_people_administrasjon_004: {
    A: ['Skill etikk- og leveransestatus fra det historiske funnet', 'Jeg rapporterer frist, etikk/personvern og ressursbehov presist, men lar ikke prosjektstyringen bestemme hva kildene skal konkludere med.'],
    B: ['La prosjektfristen skjerpe den faglige konklusjonen', 'Jeg gjør konklusjonen tydeligere enn evidensen tåler for å gi prosjektgrensesnittet en enklere leveranse- og statusrapport.']
  }
};

const seenIds = new Set();
for (const rel of catalogs) {
  const file = path.join(root, rel);
  if (!fs.existsSync(file)) throw new Error(`Expected materialized catalog: ${rel}`);
  const catalog = JSON.parse(fs.readFileSync(file, 'utf8'));
  const mails = catalog?.families?.flatMap((family) => family.mails || []) || [];
  for (const mail of mails) {
    const replacement = choicesByMail[mail.id];
    if (!replacement) throw new Error(`No authored choice mapping for ${mail.id}`);
    if (!Array.isArray(mail.choices) || mail.choices.length !== 2) throw new Error(`${mail.id}: expected exactly two choices`);
    for (const choice of mail.choices) {
      const authored = replacement[choice.id];
      if (!authored) throw new Error(`${mail.id}: missing authored mapping for choice ${choice.id}`);
      choice.label = authored[0];
      choice.reply = authored[1];
    }
    seenIds.add(mail.id);
  }
  const signatures = mails.map((mail) => mail.choices.map((choice) => String(choice.label).trim().toLowerCase()).sort().join(' || '));
  if (new Set(signatures).size !== signatures.length) throw new Error(`${rel}: choice signatures are still duplicated`);
  fs.writeFileSync(file, `${JSON.stringify(catalog, null, 2)}\n`);
}

const expectedIds = Object.keys(choicesByMail);
if (seenIds.size !== expectedIds.length || expectedIds.some((id) => !seenIds.has(id))) {
  throw new Error(`Choice correction coverage mismatch: saw ${seenIds.size}/${expectedIds.length}`);
}

console.log('Authored eight distinct research decision pairs across job and people mails.');
