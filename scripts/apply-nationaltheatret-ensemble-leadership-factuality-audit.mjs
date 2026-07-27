import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const readJson = (relativePath) => JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
const writeJson = (relativePath, value) => {
  const fullPath = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, `${JSON.stringify(value, null, 2)}\n`);
};

const personPaths = {
  anneMarit: 'data/people/litteratur/oslo/nationaltheatret/anne_marit_jacobsen.json',
  anneke: 'data/people/litteratur/oslo/nationaltheatret/anneke_von_der_lippe.json',
  anton: 'data/people/litteratur/oslo/nationaltheatret/anton_ronneberg.json',
  arild: 'data/people/litteratur/oslo/nationaltheatret/arild_brinchmann.json',
};

const loadPerson = (relativePath, expectedId) => {
  const records = readJson(relativePath);
  if (!Array.isArray(records) || records.length !== 1 || records[0]?.id !== expectedId) {
    throw new Error(`Unexpected canonical person shape for ${expectedId}`);
  }
  return { records, person: records[0] };
};

const findWork = (person, id) => {
  const work = person.works?.find((candidate) => candidate.id === id);
  if (!work) throw new Error(`Missing work ${id} on ${person.id}`);
  return work;
};

const addSource = (person, source) => {
  person.externalLinks ??= [];
  person.source_urls ??= [];
  if (!person.externalLinks.some((entry) => entry.url === source.url)) {
    person.externalLinks.push(source);
  }
  if (!person.source_urls.includes(source.url)) person.source_urls.push(source.url);
};

const { records: anneMaritRecords, person: anneMarit } = loadPerson(personPaths.anneMarit, 'anne_marit_jacobsen');
const lilli = findWork(anneMarit, 'lilli_valentin_1989_jacobsen');
lilli.summary = 'Bearbeidet teksten og spilte tittelrollen i en forestilling som ble spilt omkring 300 ganger.';

const jacobsenVaersagod = findWork(anneMarit, 'jacobsen_vaersagod_2018_jacobsen');
jacobsenVaersagod.place = 'Centralteatret';
jacobsenVaersagod.summary = 'Medvirket som skuespiller og bidro med tekst i produksjonen, som hadde urpremiere på Centralteatret.';

if (!anneMarit.works.some((work) => work.id === 'saa_inn_i_norden_1984_jacobsen')) {
  const lilliIndex = anneMarit.works.findIndex((work) => work.id === 'lilli_valentin_1989_jacobsen');
  anneMarit.works.splice(lilliIndex, 0, {
    id: 'saa_inn_i_norden_1984_jacobsen',
    title: 'Så inn i Norden',
    year: 1984,
    material: 'revy og skuespillerarbeid',
    place: 'Oslo Nye Teater – Hovedscenen',
    summary: 'Medvirket som skuespiller i flere roller i Oslo Nye Teaters revyproduksjon på Hovedscenen.',
  });
}
anneMarit.active_place = 'Oslo; Nationaltheatret, Torshovteatret, Centralteatret, Oslo Nye Teaters hovedscene, Det Norske Teatret og NRK';
anneMarit.places = [
  'nationaltheatret',
  'centralteatret',
  'oslo_nye_teater_hovedscenen',
  'det_norske_teatret',
  'nrk_huset_marienlyst',
];
anneMarit.popupDesc = anneMarit.popupDesc
  .replace('Nationaltheatret oppgir at forestillingen ble spilt over 300 ganger.', 'Kildene oppgir at forestillingen ble spilt omkring 300 ganger.')
  .replace(
    'Produksjonene ved Torshovteatret, Oslo Nye Teater og Det Norske Teatret, sammen med arbeidet i NRK, dokumenterer at virket også har omfattet andre scener og fjernsyn.',
    'Produksjonene ved Torshovteatret, Oslo Nye Teaters hovedscene, Centralteatret og Det Norske Teatret, sammen med arbeidet i NRK, dokumenterer at virket også har omfattet andre scener og fjernsyn.',
  );
addSource(anneMarit, {
  type: 'source',
  label: 'Sceneweb – Så inn i Norden',
  url: 'https://sceneweb.no/nb/production/22246/S%C3%A5_inn%20i%20Norden',
  verifiedAt: '2026-07-27',
});
writeJson(personPaths.anneMarit, anneMaritRecords);

const { person: anneke } = loadPerson(personPaths.anneke, 'anneke_von_der_lippe');
const uskyld = findWork(anneke, 'uskyld_2011_von_der_lippe');
if (uskyld.summary !== 'Spilte Ella i Dea Lohers drama.') {
  throw new Error('Anneke von der Lippes Uskyld claim no longer matches the resolved direct-production evidence');
}

const { person: anton } = loadPerson(personPaths.anton, 'anton_ronneberg');
if (anton.birth_date !== '1902-08-09' || anton.death_date !== '1989-05-07') {
  throw new Error('Anton Rønnebergs audited life data changed unexpectedly');
}

const { records: arildRecords, person: arild } = loadPerson(personPaths.arild, 'arild_brinchmann');
const balansegang = findWork(arild, 'balansegang_1967_brinchmann');
balansegang.summary = 'Regisserte Edward Albees drama ved Nationaltheatret i 1967; produksjonen var den første i hans sjefstid.';
const hedda = findWork(arild, 'hedda_gabler_1971_brinchmann');
hedda.summary = 'Regisserte Nationaltheatrets oppsetning, som senere ble filmet og sendt av NRK Fjernsynsteatret i 1975.';
const natten = findWork(arild, 'natten_er_dagens_mor_1984_brinchmann');
natten.material = 'sceneregi';
natten.summary = 'Regisserte Lars Noréns drama på Nationaltheatrets Amfiscene.';
writeJson(personPaths.arild, arildRecords);

const report = {
  schemaVersion: 1,
  auditType: 'retrospective_claim_by_claim_factuality_audit',
  contract: 'docs/FACTUALITY_CONTRACT.md',
  auditedAt: '2026-07-27',
  scope: {
    placeCluster: 'nationaltheatret',
    profileIds: ['anne_marit_jacobsen', 'anneke_von_der_lippe', 'anton_ronneberg', 'arild_brinchmann'],
    fields: ['identity', 'life_data', 'education', 'roles_and_productions', 'institutional_periods', 'place_links', 'popup_narrative'],
    exclusions: ['subjective theme selection is editorial synthesis and is not labelled as an independently verified historical event'],
  },
  statusDefinitions: {
    verified: 'The checked claim is directly supported by an inspectable source.',
    corrected: 'The prior canonical wording or linkage was changed to match the source.',
    resolved_source_conflict: 'Sources disagreed; the direct production record and corroborating authoritative source controlled the canonical wording.',
    editorial_synthesis: 'The wording summarizes verified facts without adding a new factual detail.',
  },
  profiles: [
    {
      id: 'anne_marit_jacobsen',
      status: 'corrected',
      corrections: [
        {
          claim: 'Jacobsen, værsågod! venue',
          before: 'Oslo Nye Teater',
          after: 'Centralteatret',
          reason: 'Sceneweb identifies Centralteatret as the premiere venue.',
          source: 'https://sceneweb.no/nb/production/85684/Jacobsen%2C_v%C3%A6rs%C3%A5god',
        },
        {
          claim: 'Oslo Nye Teater main-stage place link',
          before: 'Linked through an imprecisely located production.',
          after: 'Grounded in Så inn i Norden (1984), performed on Hovedscenen with Jacobsen in several roles.',
          source: 'https://sceneweb.no/nb/production/22246/S%C3%A5_inn%20i%20Norden',
        },
        {
          claim: 'Lilli Valentin performance count',
          before: 'over 300 performances',
          after: 'around 300 performances',
          reason: 'Nationaltheatret and Store norske leksikon use slightly different counts; the canonical wording no longer asserts a disputed exact threshold.',
          sources: ['https://www.nationaltheatret.no/om-oss/ensemble/anne-marit-jacobsen', 'https://snl.no/Anne_Marit_Jacobsen'],
        },
      ],
      verifiedClaimGroups: [
        { group: 'identity_life_education_and_debut', sources: ['https://snl.no/Anne_Marit_Jacobsen', 'https://sceneweb.no/nb/artist/7665/Anne_Marit%20Jacobsen'] },
        { group: 'nationaltheatret_roles_and_projects', sources: ['https://www.nationaltheatret.no/om-oss/ensemble/anne-marit-jacobsen', 'https://forest.nationaltheatret.no/person/anne-marit-jacobsen'] },
        { group: 'selected_sceneweb_productions', sources: anneMarit.source_urls.filter((url) => url.includes('sceneweb.no/nb/production/')) },
      ],
    },
    {
      id: 'anneke_von_der_lippe',
      status: 'resolved_source_conflict',
      sourceConflict: {
        claim: 'Role in Uskyld (2011)',
        conflictingBriefSource: 'Nationaltheatrets short ensemble page lists Professoren.',
        canonicalResolution: 'Ella',
        reason: 'The direct FOREST production/person record and Store norske leksikon both identify the role as Ella.',
        controllingSources: ['https://forest.nationaltheatret.no/person/anneke-von-der-lippe', 'https://snl.no/Anneke_von_der_Lippe'],
      },
      verifiedClaimGroups: [
        { group: 'identity_education_stage_and_screen_career', sources: ['https://snl.no/Anneke_von_der_Lippe', 'https://sceneweb.no/nb/artist/4144/Anneke_von%20der%20Lippe'] },
        { group: 'nationaltheatret_roles', sources: ['https://forest.nationaltheatret.no/person/anneke-von-der-lippe'] },
        { group: 'det_norske_teatret_roles', sources: ['https://sceneweb.no/nb/production/42669/Salka_Valka', 'https://sceneweb.no/nb/production/42814/Medmenneske', 'https://sceneweb.no/nb/production/80304/Molly_Sweeney', 'https://sceneweb.no/nb/production/46568/Macbeth'] },
      ],
    },
    {
      id: 'anton_ronneberg',
      status: 'verified',
      corrections: [],
      verifiedClaimGroups: [
        { group: 'life_data_education_and_early_criticism', sources: ['https://nbl.snl.no/Anton_R%C3%B8nneberg', 'https://snl.no/Anton_R%C3%B8nneberg'] },
        { group: 'nationaltheatret_periods_and_leadership', sources: ['https://nbl.snl.no/Anton_R%C3%B8nneberg', 'https://sceneweb.no/nb/artist/20279/Anton_R%C3%B8nneberg'] },
        { group: 'book_publications', sources: ['https://nbl.snl.no/Anton_R%C3%B8nneberg', 'https://snl.no/Anton_R%C3%B8nneberg'] },
      ],
    },
    {
      id: 'arild_brinchmann',
      status: 'corrected',
      corrections: [
        {
          claim: 'Natten er dagens mor contribution',
          before: 'adaptation and direction',
          after: 'direction',
          reason: 'Sceneweb credits Klaus Hagerup with translation and Arild Brinchmann with direction only.',
          source: 'https://sceneweb.no/nb/production/43374/Natten_er%20dagens%20mor',
        },
        {
          claim: 'Hedda Gabler 1971/1975 continuity',
          before: 'later reworked for Fjernsynsteatret',
          after: 'the Nationaltheatret production was later filmed and broadcast by NRK Fjernsynsteatret in 1975',
          reason: 'The source documents filming and broadcast, not a separate unsupported reworking claim.',
          source: 'https://sceneweb.no/nb/production/17226/Hedda_Gabler',
        },
        {
          claim: 'Balansegang and chief-tenure wording',
          before: 'interpretive claim that the production began the tenure',
          after: 'direct source wording: the 1967 production was the first in his tenure as theatre director',
          source: 'https://sceneweb.no/nb/production/39880/Balansegang',
        },
      ],
      verifiedClaimGroups: [
        { group: 'life_training_film_and_institutional_roles', sources: ['https://nbl.snl.no/Arild_Brinchmann', 'https://snl.no/Arild_Brinchmann'] },
        { group: 'selected_stage_and_television_direction', sources: ['https://sceneweb.no/nb/artist/29899/Arild_Brinchmann', 'https://sceneweb.no/nb/production/65259/Den_fjerde%20nattevakt', 'https://sceneweb.no/nb/production/17282/Fruen_fra%20havet', 'https://sceneweb.no/nb/production/43374/Natten_er%20dagens%20mor'] },
      ],
    },
  ],
  conclusion: {
    auditedProfiles: 4,
    profilesCorrected: 2,
    sourceConflictsResolved: 1,
    profilesRetainedWithoutCorrection: 1,
    wholeAppVerified: false,
    note: 'This report verifies only the listed claim groups for these four profiles. It is not evidence that every History GO object is factually audited.',
  },
};

writeJson('reports/people-factuality/nationaltheatret-ensemble-leadership-2026-07-27.json', report);

const markdown = `# Retrospektiv faktakontroll — Nationaltheatrets ensemble- og ledelseskjerne\n\nStatus: **gjennomført for de oppførte påstandsgruppene**  \nKontrakt: \`docs/FACTUALITY_CONTRACT.md\`  \nKontrolldato: **2026-07-27**\n\nDenne rapporten gjelder Anne Marit Jacobsen, Anneke von der Lippe, Anton Rønneberg og Arild Brinchmann. Den dokumenterer en påstand-for-påstand-kontroll av identitet, livsdata, utdanning, sentrale roller og produksjoner, institusjonsperioder, stedskoblinger og popuptekst. Den betyr ikke at hele History GO eller alle redaksjonelle temaord er ferdig faktarevidert.\n\n## Resultat\n\n- **Anne Marit Jacobsen — korrigert:** \`Jacobsen, værsågod!\` er plassert på Centralteatret; Oslo Nye Teaters hovedscene er nå forankret i \`Så inn i Norden\`; det sprikende antallet for \`Lilli Valentin\` er formulert som «omkring 300».\n- **Anneke von der Lippe — kildeavvik løst:** den konkrete FOREST-registreringen og Store norske leksikon oppgir Ella i \`Uskyld\`; dette veier tyngre enn «Professoren» på den korte ensemblesiden.\n- **Anton Rønneberg — beholdt:** de kontrollerte livsdataene, institusjonsperiodene, kritikerperiodene og bokutgivelsene støttes av SNL/NBL og Sceneweb.\n- **Arild Brinchmann — korrigert:** \`Natten er dagens mor\` krediterer ham bare for regi; Hedda Gabler-teksten beskriver filming og TV-sending i stedet for en udokumentert «omarbeidelse»; Balansegang-formuleringen følger produksjonskilden.\n\n## Metode\n\n1. Canonical personfiler ble lest i sin helhet.\n2. Datoer, roller, produksjoner, institusjonsperioder og stedskoblinger ble kontrollert mot åpne institusjons-, arkiv- og oppslagskilder.\n3. Den mest direkte produksjonsregistreringen fikk forrang ved kildeavvik.\n4. Formuleringer som var sterkere eller mer presise enn kildegrunnlaget ble innsnevret.\n5. Manglende bevis ble ikke erstattet med sannsynlighet eller språkmodellutfylling.\n\nDen maskinlesbare rapporten ved siden av denne filen inneholder påstandsgrupper, korrigeringer, kildeavvik og konkrete URL-er.\n`;
fs.writeFileSync(path.join(root, 'reports/people-factuality/nationaltheatret-ensemble-leadership-2026-07-27.md'), markdown);

console.log('Applied retrospective Nationaltheatret factuality audit corrections.');
