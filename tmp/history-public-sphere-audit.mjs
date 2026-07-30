import fs from 'node:fs';

const REGISTRY = 'data/fag/historie/theory_evidence_historie_canonical_v1.json';
const CLAIMS = 'data/fag/historie/claims_historie_canonical_v1.json';
const EVIDENCE = 'data/fag/historie/place_evidence_historie_v1.json';
const DOC = 'docs/HISTORY_THEORY_EVIDENCE.md';
const TEST = 'tests/fagverk-historie.test.mjs';
const read = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
const A = (v) => Array.isArray(v) ? v : [];
const uniq = (v) => [...new Set(v)];
const sorted = (v) => uniq(v).sort((a,b)=>String(a).localeCompare(String(b),'nb'));
const stable = (v) => `${JSON.stringify(v, null, 2)}\n`;

const registry = read(REGISTRY);
const claimsFile = read(CLAIMS);
const evidenceFile = read(EVIDENCE);
const claimById = new Map(A(claimsFile.claims).map((c)=>[c.claim_id,c]));
const evidenceByClaim = new Map();
for (const link of A(evidenceFile.evidence_links)) {
  const links = evidenceByClaim.get(link.claim_id) || [];
  links.push(link);
  evidenceByClaim.set(link.claim_id, links);
}

const specs = [
  {
    theory_id: 'theory_his_offentlighet_mobilisering_presse_offentlighet_og_politisk_kommunikasjon',
    claim_ids: [
      'claim_his_aftenposten_occupation_censorship_directives_1940_1945',
      'claim_his_aftenposten_press_printed_deutsche_zeitung_1940_1945',
      'claim_his_storting_protest_archive_petition_repertoires'
    ],
    rationale: 'Aftenposten-casen gjør både redaksjonell kontroll og pressens materielle distribusjonsinfrastruktur under okkupasjonen etterprøvbar gjennom sensur, direktiver og trykking av Deutsche Zeitung. Stortingets bevarte protesthenvendelser gir en kontrasterende politisk kommunikasjonskanal der organiserte aktører kunne forsøke å sette saker på den representative dagsordenen uten å gjøre presseinnhold til et direkte mål på opinion.',
    limitations: [
      'Aftenposten-materialet dokumenterer sensur, produksjon og distribusjon, men ikke representativ lesing, publikums fortolkning eller redaksjonell autonomi i hver enkeltsak.',
      'Stortingsarkivets petisjoner dokumenterer politisk henvendelse og bevarte spor, men kan ikke brukes som mål på pressens dagsordensmakt eller på hvor representative avsenderne var.'
    ],
    alternative_interpretations: ['Materialet kan leses som konkurrerende offentlighetskanaler under ulike institusjonelle vilkår, men også som ulike kildetyper som ikke uten videre kan rangeres etter politisk gjennomslag.'],
    disconfirmation_conditions: ['Anvendelsen svekkes dersom opplag, trykking eller publisert innhold behandles som direkte opinion, eller dersom bevarte petisjoner brukes som bevis på medieeffekt uten dokumentert kobling.']
  },
  {
    theory_id: 'theory_his_offentlighet_mobilisering_foreninger_partier_og_organisasjonssamfunn',
    claim_ids: [
      'claim_his_blitz_antifascist_network_center_1982_1994',
      'claim_his_bryn_gronvold_strike_health_reform_1889_1892',
      'claim_his_norsk_folkemuseum_enebakkveien16_workers_temperance'
    ],
    rationale: 'Bryn og Grønvold viser organisering rundt lønn, arbeidstid, helse og regulering, Enebakkveien 16 viser hvordan arbeider- og avholdsforeninger delte lokal infrastruktur over tid, og Blitz dokumenterer et senere antifascistisk nettverksmiljø. Til sammen gjør casene organisasjon som mellomledd, møteplass og ressurs prøvbar på tvers av ulike perioder og organisasjonsformer.',
    limitations: [
      'Casene dokumenterer konkrete organisasjonsmiljøer, men ikke komplette medlemslister, økonomier eller representasjonsregler for de berørte organisasjonene.',
      'Arbeiderorganisering, avholdsforening og autonom antifascisme hadde ulike mål, interne hierarkier og forhold til myndighetene og kan ikke behandles som én organisasjonstype.'
    ],
    alternative_interpretations: ['Varige møteplasser og nettverk kan forstås som demokratisk mellomledd, men også som selektive miljøer der adgang, medlemskap og uformell makt fordelte innflytelse ulikt.'],
    disconfirmation_conditions: ['Anvendelsen svekkes dersom eksistensen av et hus, nettverk eller kollektiv aksjon alene brukes som bevis på aktivt medlemskap, representativitet eller faktisk myndighetspåvirkning.']
  },
  {
    theory_id: 'theory_his_offentlighet_mobilisering_borgerrettigheter_solidaritet_og_internasjonalisme',
    claim_ids: [
      'claim_his_stortinget_womens_petition_1905',
      'claim_his_eidsvolls_plass_vietnam_demonstration_1968',
      'claim_his_eidsvolls_plass_alta_demonstration_1979',
      'claim_his_storting_nuclear_free_nordic_zone_petition_1982'
    ],
    rationale: 'Kvinnenes underskriftsaksjon i 1905 dokumenterer et rettighetskrav fra en gruppe uten full formell politisk adgang, Vietnamdemonstrasjonen viser internasjonal solidaritet i offentlig rom, Alta-mobiliseringen kobler miljø og urfolksrettigheter, og atomvåpenpetisjonen viser hvordan et transnasjonalt sikkerhetsspørsmål ble oversatt til et konkret nasjonalt krav mot Stortinget.',
    limitations: [
      'De fire mobiliseringene hadde forskjellige berørte grupper, juridiske posisjoner, allianser og mål og kan ikke samles til én lineær rettighetsbevegelse.',
      'Underskrifter og demonstrasjoner dokumenterer krav og mobilisering, men ikke alene representativitet, ressursutveksling, varig organisasjonskapasitet eller faktisk politisk effekt.'
    ],
    alternative_interpretations: ['Casene kan analyseres som rettighets- og solidaritetsmobilisering på tvers av grenser, men også som særskilte nasjonale konflikter der internasjonale ideer fikk svært ulike lokale betydninger.'],
    disconfirmation_conditions: ['Anvendelsen svekkes dersom moralsk eller internasjonalt språk tas som bevis på berørte gruppers egne prioriteringer, eller dersom formelle krav likestilles med gjennomført rettighetsendring.']
  },
  {
    theory_id: 'theory_his_offentlighet_mobilisering_lekmanns_sprak_og_motkulturelle_bevegelser',
    claim_ids: [
      'claim_his_norsk_folkemuseum_enebakkveien16_workers_temperance',
      'claim_his_beaivvas_sami_theatre_institution_1981_1993',
      'claim_his_stortinget_kven_language_recognition_institutions_1999_2008'
    ],
    rationale: 'Enebakkveien 16 dokumenterer et lokalt forsamlingsrom brukt av arbeider- og avholdsmiljø før baptistmenigheten overtok, Beaivváš viser samiskspråklig kulturproduksjon som bygde egen institusjonell autoritet, og kvensk språkstatus med språkråd og språkting viser hvordan minoritetsspråklig organisering kunne få varige normerings- og revitaliseringsinstitusjoner.',
    limitations: [
      'Enebakkveien-casen gir bare et indirekte og lokalt vindu mot lekmanns- og religiøse motkulturer og dokumenterer ikke teologi, medlemspraksis eller regionale nettverk i bredden.',
      'Samisk teater og kvenske språkinstitusjoner er forskjellige minoritetshistorier; statlig finansiering eller anerkjennelse kan ikke i seg selv brukes som mål på selvbestemmelse, språkbruk eller sosial rekkevidde.'
    ],
    alternative_interpretations: ['Institusjonene kan leses som motkulturell bygging av alternative språk- og kulturautoritet, men også som gradvis integrasjon i offentlige finansierings- og styringsstrukturer.'],
    disconfirmation_conditions: ['Anvendelsen svekkes dersom avvikende språk, religion eller kultur alene kalles motkultur uten dokumentert varighet, organisasjon, møtepraksis eller institusjonsbygging.']
  },
  {
    theory_id: 'theory_his_offentlighet_mobilisering_digitale_offentligheter_nettverk_og_nye_mobiliseringsformer',
    claim_ids: [
      'claim_his_folkets_hus_first_opened_1907',
      'claim_his_folkets_hus_current_complex_1958_1962',
      'claim_his_radhusplassen_social_media_organized_rituals_2011'
    ],
    rationale: 'Folkets Hus dokumenterer fysisk organisasjons- og møteinfrastruktur fra 1907 og videre i det nye anlegget fra 1958–1962, mens Rådhusplassen i juli 2011 dokumenterer at Facebook og Twitter ble brukt til å organisere og dele erfaringer fra en fysisk massemobilisering. Sammen gjør casene det mulig å prøve digital nyhet mot organisatorisk kontinuitet og hybrid kobling mellom nettverk og sted.',
    limitations: [
      'Den digitale delen bygger på ett dokumentert hendelsesforløp i 2011 og kan ikke representere plattformoffentligheter, influensere, algoritmisk synlighet eller nettverksstruktur generelt.',
      'Folkets Hus fungerer som historisk sammenligningsgrunnlag for fysisk organisasjonsinfrastruktur, ikke som dokumentasjon på at de samme organisasjonene eller relasjonene fortsatte digitalt i 2011.'
    ],
    alternative_interpretations: ['Rosetogets digitale koordinering kan forstås som en ny hybrid offentlighetsform, men også som rask teknisk støtte til eldre repertoarer for møte, markering, organisasjon og fysisk samling.'],
    disconfirmation_conditions: ['Anvendelsen svekkes dersom ett sosialt medie-eksempel gjøres til bevis på et komplett digitalt nettverk, eller dersom teknologisk nyhet antas uten å teste organisatorisk og repertoarmessig kontinuitet.']
  },
  {
    theory_id: 'theory_his_offentlighet_mobilisering_digital_mobilisering_overvakning_og_motmakt',
    claim_ids: [
      'claim_his_blitz_antifascist_network_center_1982_1994',
      'claim_his_storting_lund_illegal_surveillance_oversight_redress_1994_2000',
      'claim_his_radhusplassen_social_media_organized_rituals_2011'
    ],
    rationale: 'Blitz dokumenterer autonom antifascistisk nettverksinfrastruktur som en form for organisert motmakt, Lund-kommisjonen gjør statlig overvåking, rettsstridighet, kontroll og senere reparasjon institusjonelt etterprøvbart, og Rådhusplassen i 2011 viser konkret plattformbasert koordinering av fysisk offentlig mobilisering. Bunten prøver dermed mobilisering, overvåking og motmakt uten å anta at de tre mekanismene alltid opptrer samtidig.',
    limitations: [
      'Lund-materialet gjelder i hovedsak den kalde krigens overvåkingspraksis og dokumenterer ikke plattformselskapers datainnsamling, algoritmisk synlighet eller digital myndighetsovervåking i 2011.',
      'Rosetoget dokumenterer digital koordinering og deling, men ikke komplette nettverksdata, organisatorisk varighet, viralitet eller hvordan plattformenes egne rangeringer påvirket synlighet.'
    ],
    alternative_interpretations: ['Materialet kan leses som historisk endring i forholdet mellom nettverk, kontroll og offentlig mobilisering, men også som tre ulike institusjonelle mekanismer som må holdes analytisk adskilt.'],
    disconfirmation_conditions: ['Anvendelsen svekkes dersom analog overvåkingshistorie uten videre gjøres til digital plattformovervåking, eller dersom digital synlighet behandles som bevis på varig motmakt eller politisk gjennomslag.']
  }
];

for (const spec of specs) {
  if (A(registry.entries).some((e)=>e.theory_id === spec.theory_id)) continue;
  const selected = spec.claim_ids.map((id)=>{
    const claim = claimById.get(id);
    if (!claim) throw new Error(`Missing claim ${id}`);
    const links = A(evidenceByClaim.get(id));
    if (!links.length) throw new Error(`Missing place evidence for ${id}`);
    return claim;
  });
  const entry = {
    theory_id: spec.theory_id,
    status: 'evidence_ready',
    scope_status: 'multi_case_geographic_pilot',
    universalization_status: 'provisional_not_universal',
    claim_ids: spec.claim_ids,
    source_ids: sorted(selected.flatMap((c)=>A(c.source_ids))),
    case_ids: sorted(selected.flatMap((c)=>A(c.scope?.case_ids))),
    place_ids: sorted(selected.flatMap((c)=>A(c.scope?.place_ids))),
    emne_ids: sorted(selected.flatMap((c)=>A(c.emne_ids))),
    evidence_link_ids: sorted(selected.flatMap((c)=>A(evidenceByClaim.get(c.claim_id)).map((e)=>e.evidence_id).filter(Boolean))),
    evidence_dimensions: ['documented_application','limitation_test','alternative_interpretation','multi_case_comparison','existing_claim_reuse'],
    rationale: spec.rationale,
    limitations: spec.limitations,
    alternative_interpretations: spec.alternative_interpretations,
    disconfirmation_conditions: spec.disconfirmation_conditions,
    scope_note: 'Dette er et fler-case evidensgrunnlag på tvers av de valgte geografiene og er ikke universelt bevis for teoriens gyldighet på tvers av alle perioder, geografier, aktørgrupper, plattformer og kildetyper.'
  };
  registry.entries.push(entry);
}
registry.entries.sort((a,b)=>String(a.theory_id).localeCompare(String(b.theory_id),'nb'));
registry.completion.qualifying_entries = registry.entries.length;
registry.completion.ratio = Math.round((registry.entries.length / registry.completion.total_theories) * 1000) / 1000;
registry.completion.universal_status = registry.entries.length === registry.completion.total_theories ? 'COMPLETE' : 'INCOMPLETE';
fs.writeFileSync(REGISTRY, stable(registry));

let doc = fs.readFileSync(DOC, 'utf8');
doc = doc.replace('Produksjonen står på 81 av 230', 'Produksjonen står på 87 av 230');
doc = doc.replace('- Totalt: **81 av 230** teoriobjekter (**35.2 %**).', '- Offentlighet, mobilisering og bevegelser V1: **6** nye kvalifiserende teoriobjekter ved ren claim-gjenbruk; **0** nye claims, kilder, cases eller place-evidence-lenker.\n- Totalt: **87 av 230** teoriobjekter (**37.8 %**).');
doc = doc.replace('- Gjenstående teoriobjekter: **149**.', '- Gjenstående teoriobjekter: **143**.');
fs.writeFileSync(DOC, doc);

let test = fs.readFileSync(TEST, 'utf8');
test = test.replace("assert.equal(report.universalCoverage.theoryEvidenceQualifying, 81);", "assert.equal(report.universalCoverage.theoryEvidenceQualifying, 87);");
fs.writeFileSync(TEST, test);

console.log(`Materialized ${registry.entries.length}/230 theory evidence entries.`);
