#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const VERIFIED_AT = '2026-08-31';
const REGISTRY_FILE = 'data/fagverk/fagverk_registry.json';

const read = (relative) => JSON.parse(fs.readFileSync(path.join(ROOT, relative), 'utf8'));
const write = (relative, value) => fs.writeFileSync(path.join(ROOT, relative), `${JSON.stringify(value, null, 2)}\n`);
const text = (value) => String(value ?? '').trim();

function ensureNamedLinks(place, links) {
  const field = Array.isArray(place.externalLinks)
    ? 'externalLinks'
    : Array.isArray(place.external_links)
      ? 'external_links'
      : 'externalLinks';
  place[field] ||= [];
  for (const link of links) {
    const existing = place[field].find((row) => text(row?.url) === link.url);
    if (existing) {
      if (!text(existing.label || existing.title || existing.name)) existing.label = link.label;
      continue;
    }
    place[field].push({ type: link.type || 'source', label: link.label, url: link.url, verifiedAt: VERIFIED_AT });
  }
}

function assertCompletion(relative, place) {
  if (place.id === 'oslo_radhus') {
    if (place.production_status !== 'complete') throw new Error(`${relative}: Oslo rådhus is not production_status=complete`);
    return;
  }
  if (place.id === 'youngstorget') {
    const report = path.join(ROOT, 'reports/place-production/youngstorget-phase7d-24-closeout-v1.md');
    if (!fs.existsSync(report)) throw new Error(`${relative}: Youngstorget closeout report is missing`);
    const body = fs.readFileSync(report, 'utf8');
    if (!body.includes('0 uløste blokkere') || !body.includes('PR #5316')) {
      throw new Error(`${relative}: Youngstorget closeout does not prove zero blockers and final PR`);
    }
    return;
  }
  throw new Error(`${relative}: no explicit completion rule`);
}

const targets = {
  'data/places/politikk/oslo/places_politikk/youngstorget.json': {
    links: [
      { label: 'Oslo kommune – Youngstorget', url: 'https://www.oslo.kommune.no/slik-bygger-vi-oslo/youngstorget/', type: 'official' },
      { label: 'Oslo byleksikon – Youngstorget', url: 'https://oslobyleksikon.no/side/Youngstorget', type: 'source' },
      { label: 'Arbeiderbevegelsens arkiv – Det røde torg', url: 'https://www.arbark.no/eldok/Arbeiderhistorie1996_9.pdf', type: 'archive' },
      { label: 'Arbeiderbevegelsens arkiv – Åttetimersdagen del 3', url: 'https://www.arbark.no/Utstilling/8timersdagen/8timersdagen_kap03.htm', type: 'archive' }
    ],
    fagverk: {
      schema: 'history_go_place_fagverk_v2',
      level: 'standard',
      status: 'curated',
      intro: 'Youngstorget er et offentlig mobiliseringsrom, ikke et beslutningsorgan. Torgets historie gjør det mulig å undersøke hvordan marked, arbeiderorganisering, demonstrasjoner og mediert synlighet kan bruke samme byrom uten at synlighet i seg selv beviser representativitet eller politisk effekt.',
      article: [
        'Youngstorget ble anlagt i 1846, fikk navnet Nytorvet i 1852 og var lenge et marked for landbruksvarer og kveghandel. Basaren og den åpne torgflaten gjør dette økonomiske laget fysisk lesbart. Mot slutten av 1800-tallet fikk plassen samtidig en tydelig rolle som samlingsrom for arbeiderbevegelsen, slik at handel og politisk mobilisering ble to historiske funksjoner i det samme byrommet.',
        'Den 1. mai 1890 gikk en arbeiderdemonstrasjon fra Youngstorget til Tullinløkka; Arbeiderbevegelsens arkiv oppgir rundt 4 000 deltakere. Hendelsen dokumenterer organisert kollektiv handling og offentlig synlighet, men torget vedtar ikke lover eller tariffavtaler. For å undersøke virkning må markeringen derfor kobles videre til organisasjoner, forhandlinger, beslutninger og daterte dokumenter.',
        'Pioneren fra 1958, fredsmonumentet fra 1997 og den permanente historiske fotoutstillingen gjør ulike politiske minner synlige på selve plassen. Samtidig er dagens Youngstorget også handel-, serverings-, kultur- og arrangementsrom. En faglig lesning må derfor skille det som kan observeres på torget fra påstander om hvem som representerer opinionen, hvorfor folk deltar eller hvilken politisk effekt en markering får.'
      ],
      subject_ids: ['politikk'],
      emne_ids: ['em_pol_arbeidsliv_kollektiv_kamp', 'em_pol_demonstrasjoner_protest', 'em_pol_mediert_offentlighet'],
      chapter_ids: ['konflikt-makt-sivilsamfunn', 'parlamentarisme'],
      lenses: [
        {
          id: 'youngstorget-kollektiv-kamp',
          title: 'Fra marked til kollektiv mobilisering',
          prompt: 'Hvordan kan samme torg gå fra handel og kveghandel til å bli et varig samlingsrom for arbeiderbevegelsen uten at den eldre funksjonen forsvinner fra historien?',
          subject_id: 'politikk',
          emne_id: 'em_pol_arbeidsliv_kollektiv_kamp',
          evidence: 'Koble kommunens og Oslo byleksikons plasshistorie til Arbeiderbevegelsens arkivs dokumentasjon av demonstrasjoner og massemøter.'
        },
        {
          id: 'youngstorget-protest',
          title: 'Demonstrasjon er ikke vedtak',
          prompt: 'Hva dokumenterer en demonstrasjon på Youngstorget, og hvilke ekstra kilder trenger du for å hevde at den førte til en bestemt politisk beslutning?',
          subject_id: 'politikk',
          emne_id: 'em_pol_demonstrasjoner_protest',
          evidence: 'Start med den dokumenterte 1. mai-prosesjonen i 1890 og spor eventuelle virkninger videre til organisasjons- og beslutningskilder.'
        },
        {
          id: 'youngstorget-mediert-offentlighet',
          title: 'Et torg blir et bilde',
          prompt: 'Hva gjør fotografier, monumenter og mediedekning synlig ved en politisk markering, og hva blir borte uten informasjon om arrangører, deltakere og etterfølgende prosess?',
          subject_id: 'politikk',
          emne_id: 'em_pol_mediert_offentlighet',
          evidence: 'Skill observerbare folkemengder, plakater og fysiske minnespor fra slutninger om representativitet, motiv og effekt.'
        },
        {
          id: 'youngstorget-torg-institusjon',
          title: 'Torget og organisasjonene rundt',
          prompt: 'Hvordan skiller selve Youngstorget som offentlig arena seg fra organisasjonene og bygningene som ligger rundt plassen?',
          subject_id: 'politikk',
          emne_id: 'em_pol_arbeidsliv_kollektiv_kamp',
          evidence: 'Hold den canonicale plassgrensen fast: nabobygg og organisasjoner blir ikke del av torget bare fordi de vender mot det.'
        }
      ],
      guiding_questions: [
        'Hva kan Youngstorgets fysiske plassflate fortelle om marked, mobilisering og offentlighet?',
        'Hvorfor er stor deltakelse i en demonstrasjon ikke det samme som et formelt politisk vedtak?',
        'Hvordan kan 1. mai 1890 undersøkes uten å gjøre én historisk hendelse til bevis for all senere bruk av torget?',
        'Hva kan Pioneren, fredsmonumentet og fotoutstillingen fortelle om politisk minnekultur?',
        'Hvordan skiller du selve torget fra Folkets Hus, Folketeaterbygningen og andre naboinstitusjoner?'
      ],
      concepts: ['kollektiv handling', 'arbeiderbevegelse', 'demonstrasjon', 'protest', 'mobilisering', 'politisk offentlighet', 'mediert offentlighet', 'representativitet', 'politisk virkning', 'minnekultur'],
      observable_traces: [
        {
          title: 'Pioneren på torget',
          observation: 'Bronsefiguren Pioneren står som et permanent, synlig minnespor etter arbeiderbevegelsens historie på Youngstorget.',
          interpretation_boundary: 'Skulpturen dokumenterer en offentlig minnehandling og plassering, men kan ikke alene brukes som mål på dagens støtte til arbeiderbevegelsen eller én bestemt politisk linje.',
          source_urls: ['https://www.oslo.kommune.no/slik-bygger-vi-oslo/youngstorget/', 'https://oslobyleksikon.no/side/Youngstorget']
        },
        {
          title: 'Basaren og torgflaten',
          observation: 'Basarbygningen og den åpne torgflaten gjør det mulig å lese både historisk markedsbruk og dagens flerbruk i samme plassrom.',
          interpretation_boundary: 'Fysiske spor viser rom og funksjon, men sier ikke alene hvem som brukte torget på en bestemt dato eller hvilke politiske konsekvenser bruken fikk.',
          source_urls: ['https://www.oslo.kommune.no/slik-bygger-vi-oslo/youngstorget/', 'https://oslobyleksikon.no/side/Youngstorget']
        }
      ],
      source_urls: [
        'https://www.oslo.kommune.no/slik-bygger-vi-oslo/youngstorget/',
        'https://oslobyleksikon.no/side/Youngstorget',
        'https://www.arbark.no/eldok/Arbeiderhistorie1996_9.pdf',
        'https://www.arbark.no/Utstilling/8timersdagen/8timersdagen_kap03.htm'
      ],
      verified_at: VERIFIED_AT
    }
  },

  'data/places/politikk/oslo/places_politikk/oslo_radhus.json': {
    links: [
      { label: 'Oslo kommune – Oslo rådhus', url: 'https://www.oslo.kommune.no/radhuset/', type: 'official' },
      { label: 'Oslo kommune – Slik styres Oslo', url: 'https://www.oslo.kommune.no/politikk/slik-styres-oslo/', type: 'official' },
      { label: 'Oslo kommune – Møter i bystyret', url: 'https://www.oslo.kommune.no/politikk/bystyret/moter-i-bystyret/', type: 'official' },
      { label: 'Oslo kommune – Møter i byrådet', url: 'https://www.oslo.kommune.no/politikk/byradet/moter-i-byradet/', type: 'official' },
      { label: 'Oslo kommune – Klokkespillet i Oslo rådhus', url: 'https://www.oslo.kommune.no/english/oslo-city-hall/the-carillon-at-oslo-city-hall/', type: 'official' },
      { label: 'Nobel Peace Prize – Award ceremony', url: 'https://www.nobelpeaceprize.org/nobel-peace-prize/about-the-nobel-peace-prize/nobel-peace-prize-celebrations/award-ceremony', type: 'source' }
    ],
    fagverk: {
      schema: 'history_go_place_fagverk_v2',
      level: 'standard',
      status: 'curated',
      intro: 'Oslo rådhus samler lokaldemokrati, administrasjon, offentlig kunst og seremoni i samme bygg. Faglig analyse krever at bystyrets vedtak, byrådets politiske ledelse og administrasjonens gjennomføring holdes fra hverandre, samtidig som arkitektur og offentlighet undersøkes som måter kommunal makt blir synlig på.',
      article: [
        'Oslo rådhus åpnet 15. mai 1950 og er sete for både Oslo bystyre og byråd. Organene har forskjellige roller: bystyret er kommunens øverste folkevalgte organ, mens byrådet er politisk ansvarlig overfor bystyret, leder administrasjonen og gjennomfører vedtatt politikk. At funksjonene deler bygning gjør det ekstra viktig å skille hvem som forbereder, vedtar og gjennomfører en sak.',
        'Bystyremøter er åpne for publikum, med sakspapirer før møtene og protokoller etterpå. Byrådets arbeid har andre prosedyrer, blant annet forberedende konferanser og formelle møter. Rådhuset er derfor et godt sted for å lære at demokratisk åpenhet ikke betyr at alle arbeidsprosesser er identiske eller foregår i samme rom; sporbarhet ligger i møteformer, dokumenter og ansvarslinjer.',
        'Rådhushallen, kunsten, tårnene og klokkespillet gjør kommunen synlig også utover selve beslutningsarbeidet. Nobels fredsprisseremoni viser samtidig hvordan bygningen kan være arena for en internasjonal seremoni uten å være institusjonen som velger prisvinneren. Arkitektur og ritual kan dermed analyseres som offentlig representasjon, men de må ikke forveksles med den formelle myndigheten til bystyret eller byrådet.'
      ],
      subject_ids: ['politikk'],
      emne_ids: ['em_pol_lokaldemokrati', 'em_pol_byrakrati_forvaltning', 'em_pol_mediert_offentlighet'],
      chapter_ids: ['forvaltning', 'parlamentarisme'],
      lenses: [
        {
          id: 'oslo-radhus-lokaldemokrati',
          title: 'Hvem bestemmer i kommunen?',
          prompt: 'Hvordan kan du skille bystyrets folkevalgte vedtaksrolle fra byrådets politiske ledelse og administrasjonens gjennomføring?',
          subject_id: 'politikk',
          emne_id: 'em_pol_lokaldemokrati',
          evidence: 'Bruk Oslo kommunes forklaring av styringssystemet og møtedokumentene til å følge ansvarslinjen fra sak til vedtak og gjennomføring.'
        },
        {
          id: 'oslo-radhus-forvaltning',
          title: 'Vedtak blir til administrasjon',
          prompt: 'Hva skjer mellom et politisk vedtak og den praktiske gjennomføringen i en stor kommune?',
          subject_id: 'politikk',
          emne_id: 'em_pol_byrakrati_forvaltning',
          evidence: 'Skill politisk ansvar fra administrativ saksbehandling og bruk dokumenterte møte- og styringsformer fremfor bygningens symbolikk som bevis.'
        },
        {
          id: 'oslo-radhus-offentlighet',
          title: 'Åpne møter og dokumentert offentlighet',
          prompt: 'Hvordan gjør åpne bystyremøter, publiserte sakspapirer, protokoller og digitale sendinger kommunal politikk etterprøvbar?',
          subject_id: 'politikk',
          emne_id: 'em_pol_mediert_offentlighet',
          evidence: 'Sammenlign det som kan følges i møte eller sending med dokumentene som viser forslag, behandling og vedtak.'
        },
        {
          id: 'oslo-radhus-seremoni',
          title: 'Arena er ikke beslutningstaker',
          prompt: 'Hva lærer fredsprisseremonien om forskjellen mellom et representativt seremonirom og institusjonen som faktisk treffer beslutningen?',
          subject_id: 'politikk',
          emne_id: 'em_pol_mediert_offentlighet',
          evidence: 'Skill Oslo rådhus som seremoniarena fra Den norske Nobelkomité som velger fredsprisvinneren.'
        }
      ],
      guiding_questions: [
        'Hva er forskjellen mellom bystyrets og byrådets roller i Oslo?',
        'Hvordan kan sakspapirer og protokoller brukes til å etterprøve en kommunal beslutningsprosess?',
        'Hvorfor er åpenhet i bystyremøter ikke det samme som at alle administrative prosesser er offentlige i sanntid?',
        'Hvordan gjør rådhusets arkitektur, kunst og klokkespill kommunen synlig uten å være politiske organer?',
        'Hvorfor må fredsprisseremonien skilles fra Nobelkomiteens beslutning om hvem som får prisen?'
      ],
      concepts: ['lokaldemokrati', 'bystyre', 'byråd', 'forvaltning', 'administrasjon', 'politisk ansvar', 'sakspapir', 'protokoll', 'offentlighet', 'representasjon', 'seremonirom'],
      observable_traces: [
        {
          title: 'Tårnene og hovedfasaden',
          observation: 'De to rådhustårnene og den monumentale hovedfasaden gjør kommunens institusjonsbygg tydelig lesbart i bybildet ved fjorden.',
          interpretation_boundary: 'Arkitekturen viser et offentlig symbolbygg, men kan ikke alene fortelle hvilket organ som vedtok en konkret sak eller hvordan administrasjonen gjennomførte den.',
          source_urls: ['https://www.oslo.kommune.no/radhuset/']
        },
        {
          title: 'Klokkespillet over byen',
          observation: 'Rådhusets klokkespill består av 49 klokker og gjør bygningen hørbar i det offentlige byrommet.',
          interpretation_boundary: 'Lyden er et fysisk og kulturelt signal fra bygningen, ikke dokumentasjon på at et politisk møte pågår eller at et bestemt vedtak er truffet.',
          source_urls: ['https://www.oslo.kommune.no/english/oslo-city-hall/the-carillon-at-oslo-city-hall/']
        }
      ],
      source_urls: [
        'https://www.oslo.kommune.no/radhuset/',
        'https://www.oslo.kommune.no/politikk/slik-styres-oslo/',
        'https://www.oslo.kommune.no/politikk/bystyret/moter-i-bystyret/',
        'https://www.oslo.kommune.no/politikk/byradet/moter-i-byradet/',
        'https://www.oslo.kommune.no/english/oslo-city-hall/the-carillon-at-oslo-city-hall/',
        'https://www.nobelpeaceprize.org/nobel-peace-prize/about-the-nobel-peace-prize/nobel-peace-prize-celebrations/award-ceremony'
      ],
      verified_at: VERIFIED_AT
    }
  }
};

const registry = read(REGISTRY_FILE);
registry.placeLinks ||= {};

for (const [relative, config] of Object.entries(targets)) {
  const place = read(relative);
  if (!place || typeof place !== 'object' || Array.isArray(place) || !place.id) throw new Error(`${relative}: expected one canonical Place object`);
  assertCompletion(relative, place);
  if (place.fagverk?.status === 'curated') throw new Error(`${relative}: already has curated Fagverk; refusing overwrite`);

  ensureNamedLinks(place, config.links);
  place.fagverk = config.fagverk;
  registry.placeLinks[place.id] = {
    sourceFile: relative.replace(/^data\//u, ''),
    field: 'fagverk',
    schema: config.fagverk.schema,
    level: config.fagverk.level,
    status: config.fagverk.status
  };
  write(relative, place);
  console.log(`Curated Fagverk: ${place.id}`);
}

write(REGISTRY_FILE, registry);
console.log('Indexed Youngstorget and Oslo rådhus Place-owned Fagverk');
