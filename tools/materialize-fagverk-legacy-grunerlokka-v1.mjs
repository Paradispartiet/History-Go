#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const verifiedAt = '2026-08-31';
const readJson = (file) => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
const writeJson = (file, value) => fs.writeFileSync(path.join(root, file), `${JSON.stringify(value, null, 2)}\n`, 'utf8');

function ensureSourceLinks(place, sources) {
  const links = Array.isArray(place.externalLinks) ? place.externalLinks : [];
  const byUrl = new Map(links.map((row) => [row?.url, row]).filter(([url]) => url));
  for (const source of sources) {
    if (byUrl.has(source.url)) continue;
    links.push({ type: 'source', label: source.label, url: source.url, verifiedAt });
  }
  place.externalLinks = links;
}

const configs = [
  {
    id: 'birkelunden',
    file: 'data/places/by/oslo/places/birkelunden.json',
    registrySourceFile: 'places/by/oslo/places/birkelunden.json',
    sources: [
      { label: 'Oslo byleksikon – Birkelunden', url: 'https://oslobyleksikon.no/side/Birkelunden' },
      { label: 'Riksantikvaren – Birkelunden, Murbyens hjerte', url: 'https://www.riksantikvaren.no/kulturhistorie/birkelunden-murbyens-hjerte/' },
      { label: 'Pensjonistforbundet – Vår historie', url: 'https://www.pensjonistforbundet.no/om-oss/var-historie' }
    ],
    fagverk: {
      schema: 'history_go_place_fagverk_v2',
      level: 'standard',
      status: 'curated',
      intro: 'Birkelunden gjør det mulig å undersøke hvordan et planlagt grøntrom blir sosial infrastruktur, minnelandskap og vernet bymiljø samtidig, uten å blande selve parken på 16,3 dekar med det langt større fredede kulturmiljøet rundt.',
      article: [
        'Birkelunden ble anlagt som del av utbyggingen av Grünerløkka i 1860-årene og overført til kommunen i 1882 med vilkår om at parken ikke skulle bebygges. Det gjør eierskap, planlegging og offentlig tilgang til en konkret del av stedets historie. Parkens avgrensning, ganglinjer og åpne flater kan leses som fysisk infrastruktur, men de sier ikke alene hvem som bruker parken eller hvor lenge folk oppholder seg der.',
        'Omleggingen i 1916–1920, musikkpaviljongen fra 1926 og vannbassenget fra 1927–1928 viser hvordan nye aktivitets- og oppholdsfunksjoner ble skrevet inn i det samme grøntrommet. Kilder knytter også Birkelunden til arbeiderbevegelsens massemønstringer og til pensjonistenes organisering. Slike historiske brukslag kan dokumenteres, mens dagens bruksmønstre må undersøkes gjennom daterte observasjoner fremfor å antas fra parkens form.',
        'Parken rommer flere offentlige minnespor, blant annet Føll, Jack Johnsen-bysten og Spaniamonumentet. Samtidig inngår den i Birkelunden kulturmiljø, som dekker et langt større område med kirke, skole og bygårder. En faglig lesning må derfor holde to skalaer fra hverandre: hva som fysisk og historisk tilhører parkstedet, og hva som er relevant nabokontekst i det fredede bymiljøet.'
      ],
      subject_ids: ['by'],
      emne_ids: ['em_by_parker_som_sosial_infrastruktur', 'em_by_opphold_vs_gjennomgang'],
      chapter_ids: ['byliv-offentlige-rom'],
      lenses: [
        {
          id: 'birkelunden-sosial-infrastruktur',
          title: 'Park som infrastruktur',
          prompt: 'Hvordan legger Birkelundens ganglinjer, åpne flater, paviljong og basseng til rette for ulike former for offentlig bruk?',
          subject_id: 'by',
          emne_id: 'em_by_parker_som_sosial_infrastruktur',
          evidence: 'Skill de synlige fysiske tilbudene fra påstander om faktisk bruk, og dokumenter observasjonstidspunktet.'
        },
        {
          id: 'birkelunden-opphold-bevegelse',
          title: 'Opphold og bevegelse',
          prompt: 'Hvor i Birkelunden ser du tegn på gjennomgang, korte stopp og lengre opphold, og hvordan kan forskjellen registreres?',
          subject_id: 'by',
          emne_id: 'em_by_opphold_vs_gjennomgang',
          evidence: 'Bruk ganglinjer, benker, plen og aktivitetssoner som observasjonsenheter uten å generalisere fra ett besøk.'
        },
        {
          id: 'birkelunden-skala-grense',
          title: 'Park og kulturmiljø',
          prompt: 'Hvordan kan du skille Birkelundens egen parkflate fra det større fredede kulturmiljøet når du analyserer stedet?',
          subject_id: 'by',
          emne_id: 'em_by_parker_som_sosial_infrastruktur',
          evidence: 'Sammenhold parkens dokumenterte areal og fysiske kanter med Riksantikvarens langt større kulturmiljøavgrensning.'
        }
      ],
      guiding_questions: [
        'Hvilke fysiske elementer i Birkelunden inviterer til opphold, og hvilke leder først og fremst mennesker gjennom parken?',
        'Hvordan kan paviljongen og vannbassenget brukes som daterte spor etter endringer i parkens planlagte funksjoner?',
        'Hva må observeres flere ganger før du kan beskrive et stabilt sosialt bruksmønster i Birkelunden?',
        'Hvilke minnespor tilhører selve parkrommet, og hvilke historiske forbindelser ligger i kulturmiljøet utenfor parkgrensen?',
        'Hvorfor er forskjellen mellom 16,3 dekar park og det større fredede kulturmiljøet viktig for en presis stedsanalyse?'
      ],
      concepts: ['sosial infrastruktur', 'offentlig rom', 'opphold', 'gjennomgang', 'kulturmiljø', 'minnelandskap', 'romlig avgrensning'],
      observable_traces: [
        {
          title: 'Paviljong og basseng',
          observation: 'Musikkpaviljongen og vannområdet ligger som faste, daterbare orienteringspunkter i det sentrale parkrommet.',
          interpretation_boundary: 'De dokumenterer fysisk tilrettelegging og historiske lag, men beviser ikke dagens bruksmengde eller brukergrupper.',
          source_urls: ['https://oslobyleksikon.no/side/Birkelunden']
        },
        {
          title: 'Park mot kulturmiljø',
          observation: 'Parkens grøntflate kan skilles fra kirke, skole og bygårder som inngår i det større fredede området rundt.',
          interpretation_boundary: 'Nabobebyggelsen er relevant kontekst, men skal ikke regnes som parkens egne strukturer eller areal.',
          source_urls: ['https://www.riksantikvaren.no/kulturhistorie/birkelunden-murbyens-hjerte/']
        }
      ],
      source_urls: [
        'https://oslobyleksikon.no/side/Birkelunden',
        'https://www.riksantikvaren.no/kulturhistorie/birkelunden-murbyens-hjerte/',
        'https://www.pensjonistforbundet.no/om-oss/var-historie'
      ],
      verified_at: verifiedAt
    }
  },
  {
    id: 'olaf_ryes_plass',
    file: 'data/places/by/oslo/places/olaf_ryes_plass.json',
    registrySourceFile: 'places/by/oslo/places/olaf_ryes_plass.json',
    sources: [],
    fagverk: {
      schema: 'history_go_place_fagverk_v2',
      level: 'standard',
      status: 'curated',
      intro: 'Olaf Ryes plass kan undersøkes som et lite offentlig park- og torgrom med stor nabolagsrolle: den kombinerer ferdsel, opphold, monumenter og arrangementer, samtidig som de kommersielle fasadene rundt må skilles fra selve plassflaten.',
      article: [
        'Kommunen kjøpte den åpne løkken i 1863, plassen fikk navn etter Olaf Rye i 1864 og ble opparbeidet som park i 1890. Denne utviklingen gjør stedet egnet til å studere hvordan et tett bystrøk fikk et definert offentlig frirom. De fire gatene rundt fungerer som en tydelig romlig kontroll: parkens ganglinjer, plen og anlegg tilhører plassen, mens bygninger og virksomheter langs kanten ikke automatisk gjør det.',
        'Eilert Sundt-bysten fra 1892 og fontenen fra 1927 legger to daterte lag inn i hverdagsrommet. Bysten gjør folkeopplysning og samfunnsforskning fysisk synlig, mens fontenen organiserer parkrommet som et fast orienteringspunkt. Monumenter og anlegg kan dokumentere planlagte og historiske funksjoner; hvor lenge mennesker blir sittende eller hvilke ruter de velger, må derimot observeres som egen bruksevidens.',
        'Marked og andre daterte arrangementer viser at Olaf Ryes plass fortsatt kan fungere som offentlig scene. Slike programmer dokumenterer bestemte hendelser, ikke en permanent brukstilstand. Parkteatret er på samme måte en viktig nabo og del av plassens bylivskontekst, men kino- og konsertstedets bygning og institusjonshistorie skal ikke flyttes inn i den canonicale parkflaten.'
      ],
      subject_ids: ['by'],
      emne_ids: ['em_by_offentlige_rom_motesteder', 'em_by_torg_plasser_som_scene'],
      chapter_ids: ['byliv-offentlige-rom'],
      lenses: [
        {
          id: 'olaf-ryes-motested',
          title: 'Møteplass i hverdagen',
          prompt: 'Hvordan fordeler Olaf Ryes plass rom mellom ferdsel, sitteplasser, grøntareal og mulige møtepunkter på en vanlig dag?',
          subject_id: 'by',
          emne_id: 'em_by_offentlige_rom_motesteder',
          evidence: 'Registrer synlige soner og faktisk aktivitet på et datert tidspunkt uten å gjøre enkeltobservasjonen universell.'
        },
        {
          id: 'olaf-ryes-offentlig-scene',
          title: 'Plassen som scene',
          prompt: 'Hvilke trekk gjør Olaf Ryes plass egnet for marked og arrangement, og hva endres når en hendelse faktisk pågår?',
          subject_id: 'by',
          emne_id: 'em_by_torg_plasser_som_scene',
          evidence: 'Sammenlign parkens permanente romstruktur med dokumentasjon av tidsavgrensede arrangementer og deres bruk av flaten.'
        },
        {
          id: 'olaf-ryes-kant',
          title: 'Offentlig kjerne og kant',
          prompt: 'Hvordan påvirker fasader og virksomheter rundt Olaf Ryes plass opplevelsen av rommet uten å være del av parkens canonicale flate?',
          subject_id: 'by',
          emne_id: 'em_by_offentlige_rom_motesteder',
          evidence: 'Bruk de fire gatekantene som grense og skill visuell eller funksjonell påvirkning fra stedseierskap.'
        }
      ],
      guiding_questions: [
        'Hvor oppstår de tydeligste overgangene mellom gjennomgang og opphold inne på Olaf Ryes plass?',
        'Hvordan påvirker Eilert Sundt-bysten og fontenen måten parkrommet kan orienteres og leses historisk på?',
        'Hva kan et datert marked dokumentere om plassen som offentlig scene, og hva kan det ikke dokumentere?',
        'Hvordan kan du beskrive den kommersielle kanten rundt plassen uten å gjøre nabovirksomhetene til en del av parkflaten?',
        'Hvilke observasjoner måtte gjentas for å sammenligne hverdagsbruk med arrangementsbruk på en etterprøvbar måte?'
      ],
      concepts: ['offentlig møteplass', 'torgrom', 'arrangementsarena', 'romlig kant', 'opphold', 'gjennomgang', 'minnespor'],
      observable_traces: [
        {
          title: 'Byste og fontene',
          observation: 'Eilert Sundt-bysten og fontenen er daterte, faste elementer som kan lokaliseres inne i parkrommet.',
          interpretation_boundary: 'Elementene viser historiske og romlige lag, men sier ikke alene hvordan ulike grupper bruker plassen i dag.',
          source_urls: ['https://oslobyleksikon.no/side/Olaf_Ryes_plass', 'https://www.oslo.kommune.no/natur-kultur-og-fritid/tur-og-friluftsliv/parker-og-lekeplasser/olaf-ryes-plass/']
        }
      ],
      source_urls: [
        'https://www.oslo.kommune.no/natur-kultur-og-fritid/tur-og-friluftsliv/parker-og-lekeplasser/olaf-ryes-plass/',
        'https://oslobyleksikon.no/side/Olaf_Ryes_plass',
        'https://visitlokka.no/lokkadagene/'
      ],
      verified_at: verifiedAt
    }
  },
  {
    id: 'sofienbergparken',
    file: 'data/places/by/oslo/sofienbergparken.json',
    registrySourceFile: 'places/by/oslo/sofienbergparken.json',
    sources: [],
    fagverk: {
      schema: 'history_go_place_fagverk_v2',
      level: 'standard',
      status: 'curated',
      intro: 'Sofienbergparken er særlig egnet til å studere historiske lag i et hverdagsrom: tidligere gravlund, bevart jødisk gravlund, parkpolitikk og nyere møteplasser finnes i samme landskap, men må dokumenteres med ulike typer evidens.',
      article: [
        'Parkgrunnen var tidligere del av Sofienberg gravlund. Kommunen vedtok i 1918 å avvikle gravlunden og omforme arealet til park, de første parkdelene ble tatt i bruk rundt 1920, og gravene ble fjernet gradvis fram til 1972. Den bevarte jødiske gravlunden gjør den tidligere arealbruken fysisk lesbar. Dette er et eksempel på at historiske lag kan være synlige uten at hele dagens park kan beskrives med den gamle funksjonen.',
        'Som offentlig park består stedet av flere brukssoner, og Rathkes gate deler anlegget fysisk. Dagens fasiliteter og oppgraderingen av den østlige delen viser hvordan parkforvaltning fortsatt endrer vilkårene for opphold og bevegelse. Nye møteplasser eller møbler dokumenterer et tiltak, men bedre tilgjengelighet eller mer inkluderende bruk må undersøkes separat gjennom designanalyse, tilgjengelighetsdata og faktisk observasjon.',
        'Festivaler og Pride Park viser at Sofienbergparken kan bli en tidsavgrenset offentlig scene, men slike hendelser skal ikke gjøres om til en permanent identitet for alle som bruker parken. Sofienberg kirke er på samme måte et visuelt landemerke og nabosted, ikke et parkobjekt. En presis analyse holder derfor funksjon, tidslag, stedseierskap og aktuell bruk fra hverandre.'
      ],
      subject_ids: ['by'],
      emne_ids: ['em_by_parker_som_sosial_infrastruktur', 'em_by_opphold_vs_gjennomgang', 'em_by_historiske_lag_i_hverdagsrom'],
      chapter_ids: ['byliv-offentlige-rom', 'arkitektur-type-skala-byform'],
      lenses: [
        {
          id: 'sofienberg-historiske-lag',
          title: 'Historiske lag i parken',
          prompt: 'Hvilke fysiske spor i Sofienbergparken kan knyttes til den tidligere gravlunden, og hvilke tolkninger krever tekstkilder?',
          subject_id: 'by',
          emne_id: 'em_by_historiske_lag_i_hverdagsrom',
          evidence: 'Skill observerbare grenser og landskapsspor fra datering, beslutninger og årsaksforklaringer som må hentes fra kilder.'
        },
        {
          id: 'sofienberg-sosial-infrastruktur',
          title: 'Parkens sosiale tilbud',
          prompt: 'Hvordan fordeler Sofienbergparken leke-, møte-, hvile- og bevegelsesmuligheter mellom ulike deler av det delte parkområdet?',
          subject_id: 'by',
          emne_id: 'em_by_parker_som_sosial_infrastruktur',
          evidence: 'Kartlegg synlige tilbud og barrierer, men hold fysisk tilrettelegging adskilt fra dokumentert faktisk bruk.'
        },
        {
          id: 'sofienberg-opphold-gjennomgang',
          title: 'Bevegelse gjennom parken',
          prompt: 'Hvordan påvirker Rathkes gate og parkens ganglinjer forholdet mellom gjennomgang og opphold i Sofienbergparken?',
          subject_id: 'by',
          emne_id: 'em_by_opphold_vs_gjennomgang',
          evidence: 'Observer kryssinger, gangretninger og stopp på et avgrenset tidspunkt og noter forhold som vær eller arrangement.'
        },
        {
          id: 'sofienberg-hendelseslag',
          title: 'Hendelse og hverdagsrom',
          prompt: 'Hva skjer analytisk når Sofienbergparken brukes til festival eller Pride Park, sammenlignet med parkens hverdagslige funksjoner?',
          subject_id: 'by',
          emne_id: 'em_by_parker_som_sosial_infrastruktur',
          evidence: 'Bruk daterte hendelseskilder som tidsavgrenset dokumentasjon og unngå å gjøre arrangementet til permanent parkidentitet.'
        }
      ],
      guiding_questions: [
        'Hvordan kan den bevarte jødiske gravlunden leses som et historisk lag uten å redusere hele dagens park til gravlund?',
        'Hvilke deler av Sofienbergparken ser ut til å prioritere opphold, og hvilke fungerer tydeligst som forbindelser gjennom området?',
        'Hva kan oppgraderingen i 2025 dokumentere om planlagt tilrettelegging, og hvilke påstander om tilgjengelighet krever mer evidens?',
        'Hvordan bør en tidsavgrenset festival skilles fra stabile egenskaper ved Sofienbergparken som offentlig rom?',
        'Hvor går grensen mellom parkens egne elementer og Sofienberg kirke eller andre separate nabosteder?'
      ],
      concepts: ['historiske lag', 'arealbruk', 'sosial infrastruktur', 'tilgjengelighet', 'opphold', 'gjennomgang', 'hendelseslag', 'stedseierskap'],
      observable_traces: [
        {
          title: 'Bevart gravlund',
          observation: 'Den jødiske gravlundens avgrensning er et synlig fysisk spor etter parkarealets tidligere bruk som gravlund.',
          interpretation_boundary: 'Det synlige sporet dokumenterer kontinuitet i landskapet, mens datering og avviklingsprosess krever historiske kilder.',
          source_urls: ['https://lokalhistoriewiki.no/wiki/Sofienberg_gravlund']
        },
        {
          title: 'Delt parkflate',
          observation: 'Rathkes gate skjærer gjennom parkområdet og skaper et tydelig brudd mellom deler av den offentlige grøntflaten.',
          interpretation_boundary: 'Veien kan observeres direkte, men konsekvenser for bruk og tilgjengelighet må undersøkes og kan ikke leses av kartet alene.',
          source_urls: ['https://www.oslo.kommune.no/natur-kultur-og-fritid/tur-og-friluftsliv/parker-og-lekeplasser/sofienbergparken/']
        }
      ],
      source_urls: [
        'https://www.oslo.kommune.no/natur-kultur-og-fritid/tur-og-friluftsliv/parker-og-lekeplasser/sofienbergparken/',
        'https://lokalhistoriewiki.no/wiki/Sofienberg_gravlund',
        'https://www.arkitektur.no/aktuelt/byutvikling/oppgraderte-sofienbergparken-endelig-aapnet-vi-har-aldri-gitt-oss/'
      ],
      verified_at: verifiedAt
    }
  },
  {
    id: 'markveien',
    file: 'data/places/by/oslo/places/markveien.json',
    registrySourceFile: 'places/by/oslo/places/markveien.json',
    sources: [],
    fagverk: {
      schema: 'history_go_place_fagverk_v2',
      level: 'standard',
      status: 'curated',
      intro: 'Markveien kan leses som en kommersiell gate med flere økonomiske og sosiale tidslag: fabrikkboliger, samvirkehandel, småskalavirksomheter, krigsminner og saneringskonflikt gir et bedre analysegrunnlag enn å beskrive gaten bare som trendy eller gentrifisert.',
      article: [
        'Markveien ble innlemmet i Christiania i 1859 og utviklet seg med leiegårder, fabrikkboliger, butikker og verksteder. Seilduksgårdene i nummer 29–33 og den kooperative butikken som åpnet i nummer 28 i 1895 viser at bolig, arbeid, handel og organisering lå tett sammen. En kommersiell gate bør derfor undersøkes både gjennom dagens butikkmiks og gjennom de funksjonene som har vært knyttet til konkrete adresser over tid.',
        'Gaten rommer også lag som ikke kan reduseres til handelsutvikling. Plasskafeen ved Olaf Ryes plass var åsted for Gestapo-bakholdet mot Gregers Gram og Edvard Tallaksen i 1944, og snublesteiner knytter deporterte jødiske beboere til bestemte adresser. Slike minnespor krever kildepresisjon og skal ikke behandles som dekorative elementer i en generell gateprofil.',
        'Rivningen av gården med Plasskafeen i 1977 utløste protester og sammenstøt og inngår i historien om sanering og senere bevaring på Grünerløkka. Dagens kafeer og butikker kan være relevante når gentrifisering undersøkes, men synlig oppussing eller en bestemt butikkmiks er ikke i seg selv bevis for fortrengning. En sterkere analyse trenger tidsserier for eierskap, leier, virksomhetsutskifting og befolkningsendring.'
      ],
      subject_ids: ['by'],
      emne_ids: ['em_by_kommersielle_gater', 'em_by_uteservering_kommersielt_byliv', 'em_by_gentrifisering_eiendom'],
      chapter_ids: ['arbeid-naering-handel-logistikk', 'bolig-nabolag-tilgang-endring', 'arkitektur-gatekant-makt-ombruk'],
      lenses: [
        {
          id: 'markveien-kommersiell-gate',
          title: 'Butikkmiks over tid',
          prompt: 'Hvordan kan dagens virksomheter i Markveien registreres slik at gatebildet senere kan sammenlignes med historiske handels- og arbeidsfunksjoner?',
          subject_id: 'by',
          emne_id: 'em_by_kommersielle_gater',
          evidence: 'Lag en datert adressebasert registrering og skill nåværende observasjon fra dokumenterte historiske funksjoner i kildene.'
        },
        {
          id: 'markveien-kommersielt-byliv',
          title: 'Handel og opphold',
          prompt: 'Hvor påvirker butikkfasader, servering og innganger forholdet mellom ferdsel og kommersielt opphold langs Markveien?',
          subject_id: 'by',
          emne_id: 'em_by_uteservering_kommersielt_byliv',
          evidence: 'Observer gatekant, møblering og bruk på et bestemt tidspunkt uten å anta at samme mønster gjelder hele gaten.'
        },
        {
          id: 'markveien-gentrifisering-evidens',
          title: 'Gentrifisering som hypotese',
          prompt: 'Hvilke data utover synlige butikker og oppussing trenger du for å vurdere gentrifisering og mulig fortrengning i Markveien?',
          subject_id: 'by',
          emne_id: 'em_by_gentrifisering_eiendom',
          evidence: 'Kombiner virksomhetsutskifting med eierskap, leie- eller prisutvikling og befolkningsdata før du trekker en fortrengningskonklusjon.'
        },
        {
          id: 'markveien-bevaring-endring',
          title: 'Bevaring etter konflikt',
          prompt: 'Hvordan kan 1977-konflikten brukes til å undersøke sammenhengen mellom sanering, protest og det bevarte gatepreget i Markveien?',
          subject_id: 'by',
          emne_id: 'em_by_gentrifisering_eiendom',
          evidence: 'Skill den dokumenterte rivingskonflikten fra senere utvikling og unngå å tilskrive alle nåværende trekk én årsak.'
        }
      ],
      guiding_questions: [
        'Hvilke adresser i Markveien viser tydeligst at bolig, arbeid og handel historisk har vært blandet i samme gate?',
        'Hvordan kan dagens butikkmiks dokumenteres uten å gjøre en tidsbundet observasjon til en varig beskrivelse av Markveien?',
        'Hva tilfører snublesteinene gateanalysen, og hvilke etiske grenser gjelder når de behandles som historiske spor?',
        'Hvilke påstander om gentrifisering kan støttes av feltobservasjon, og hvilke krever økonomiske eller demografiske tidsserier?',
        'Hvordan endrer saneringskonflikten i 1977 forståelsen av hvorfor eldre bebyggelse fortsatt preger deler av gaten?'
      ],
      concepts: ['kommersiell gate', 'butikkmiks', 'aktiv gatekant', 'samvirkehandel', 'sanering', 'bevaring', 'gentrifisering', 'fortrengning', 'minnespor'],
      observable_traces: [
        {
          title: 'Adressebundne tidslag',
          observation: 'Seilduksgårdene, Markveien 57 og andre navngitte adresser gjør flere bolig-, arbeids- og institusjonslag fysisk lokaliserbare i gaten.',
          interpretation_boundary: 'Bygningene kan observeres, men historisk funksjon, datering og institusjonstilknytning må dokumenteres i kilder.',
          source_urls: ['https://oslobyleksikon.no/side/Markveien', 'https://lokalhistoriewiki.no/wiki/Markveien_(Oslo)']
        },
        {
          title: 'Snublestein i gateplanet',
          observation: 'En snublestein ved en konkret adresse kobler et navngitt menneske til forfølgelse og deportasjon gjennom et lite fysisk minnesmerke.',
          interpretation_boundary: 'Minnesmerket dokumenterer minnepraksis og personbinding; biografiske og historiske detaljer må hentes fra den navngitte kilden.',
          source_urls: ['https://www.snublestein.no/Philip-Sam-Watchman/p=532/']
        }
      ],
      source_urls: [
        'https://oslobyleksikon.no/side/Markveien',
        'https://lokalhistoriewiki.no/wiki/Markveien_(Oslo)',
        'https://www.snublestein.no/Philip-Sam-Watchman/p=532/'
      ],
      verified_at: verifiedAt
    }
  }
];

const registryPath = 'data/fagverk/fagverk_registry.json';
const registry = readJson(registryPath);
registry.placeLinks ||= {};

for (const config of configs) {
  const place = readJson(config.file);
  if (place.id !== config.id) throw new Error(`${config.file}: expected ${config.id}, found ${place.id}`);
  ensureSourceLinks(place, config.sources);
  place.fagverk = config.fagverk;
  writeJson(config.file, place);
  registry.placeLinks[config.id] = {
    sourceFile: config.registrySourceFile,
    field: 'fagverk',
    schema: config.fagverk.schema,
    level: config.fagverk.level,
    status: config.fagverk.status
  };
}

writeJson(registryPath, registry);
console.log(`Materialized Fagverk-sted v2 for ${configs.map((row) => row.id).join(', ')}`);
