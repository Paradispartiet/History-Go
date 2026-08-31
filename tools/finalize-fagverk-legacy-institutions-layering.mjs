#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const VERIFIED_AT = '2026-08-31';
const REGISTRY_FILE = 'data/fagverk/fagverk_registry.json';

const targets = {
  'data/places/by/oslo/places/universitetsplassen.json': {
    sources: [
      ['Oslo byleksikon – Universitetsplassen', 'https://oslobyleksikon.no/side/Universitetsplassen'],
      ['Oslo byleksikon – Universitetet i Oslo', 'https://oslobyleksikon.no/side/Universitetet_i_Oslo'],
      ['UiO – Aula-prosjektet', 'https://www.hf.uio.no/iakh/forskning/prosjekter/aula-prosjektet/bilder/iicposter_2012.pdf'],
      ['UiO – UiO i sentrum / Karl Johans gate', 'https://www.uio.no/om/organisasjon/styret/moter/2022/12-06/i-sak-20-22-uio-i-sentrum-karl-johans-gate.pdf']
    ],
    fagverk: {
      schema: 'history_go_place_fagverk_v2',
      level: 'standard',
      status: 'curated',
      intro: 'Universitetsplassen viser hvordan arkitektur, monumenter og ritualer kan gjøre en institusjon synlig i byen. Et faglig blikk må skille plassflaten fra universitetsbygningene og Aulaens kunstverk, og skille symbolsk representasjon fra dokumentasjon på hvem som faktisk har hatt tilgang, innflytelse eller tilhørighet.',
      article: [
        'Universitetsplassen ble formet som universitetets monumentale front mot Karl Johans gate. Christian Heinrich Groschs tre hovedbygninger ble tatt i bruk i 1851–1854 og organiserer et tydelig representasjonsrom rundt plassen. Men selve plassen er ikke det samme som Domus Media, Domus Academica, Domus Bibliotheca eller Aulaen. Bygningene rammer inn stedet og gir det institusjonell betydning, mens handlinger og samlinger inne i dem må kildeføres til de respektive bygningene.',
        'Schweigaard-statuen fra 1883 og Peter Andreas Munch-statuen fra 1933 gjør bestemte akademiske og samfunnsmessige idealer fysisk synlige. Monumentene kan analyseres som representasjon og kanonisering, men de er ikke en nøytral oversikt over universitetets historie. Hvem som får monument, hvor monumentet plasseres, og hvilke personer som ikke er representert, er egne spørsmål om symbolsk makt og senere historiebruk.',
        'Plassen er også et bruksrom. Omleggingen i 1930–1931, immatrikulering, julegrantradisjon og andre samlinger viser at det monumentale anlegget stadig aktiveres gjennom ritualer og offentlig ferdsel. Et fotografi eller en enkelt seremoni dokumenterer en bestemt bruk på et bestemt tidspunkt, ikke hele plassens sosiale tilgjengelighet. Derfor bør fysisk utforming, institusjonell intensjon og faktisk bruk undersøkes som tre forskjellige evidensnivåer.'
      ],
      subject_ids: ['by'],
      emne_ids: ['em_by_symbolsk_makt_og_representasjon', 'em_by_offentlige_rom_motesteder', 'em_by_bygningstyper_og_typologier', 'em_by_historiske_lag_i_hverdagsrom', 'em_by_materialitet_og_sanseerfaring'],
      chapter_ids: ['arkitektur-gatekant-makt-ombruk', 'byliv-offentlige-rom', 'historiske-lag-ruiner-minner'],
      lenses: [
        {
          id: 'universitetsplassen-representasjon',
          title: 'Arkitektur som representasjon',
          prompt: 'Hvordan gjør plassens akse, symmetri og bygningsfronter Universitetet i Oslo synlig som institusjon uten å bevise hvordan makt faktisk fordeles?',
          subject_id: 'by',
          emne_id: 'em_by_symbolsk_makt_og_representasjon',
          evidence: 'Beskriv den fysiske organiseringen først og bruk institusjonelle kilder separat når styring, adgang eller funksjon skal forklares.'
        },
        {
          id: 'universitetsplassen-monumenter',
          title: 'Monumenter velger hvem som vises',
          prompt: 'Hva forteller Schweigaard- og P.A. Munch-monumentene om hvilke personer senere generasjoner har gjort synlige i universitetets frontrom?',
          subject_id: 'by',
          emne_id: 'em_by_historiske_lag_i_hverdagsrom',
          evidence: 'Koble monumentenes dokumenterte oppføringsår og plassering til spørsmålet om representasjon uten å gjøre utvalget til en komplett akademisk kanon.'
        },
        {
          id: 'universitetsplassen-plass-bygning',
          title: 'Plass er ikke bygning',
          prompt: 'Hvor går kildegrensen mellom Universitetsplassen og Domus-bygningene eller Aulaen?',
          subject_id: 'by',
          emne_id: 'em_by_bygningstyper_og_typologier',
          evidence: 'Behandle plassflaten, bygningene og kunstverkene som egne fysiske enheter selv når de inngår i samme universitetsanlegg.'
        },
        {
          id: 'universitetsplassen-ritual',
          title: 'Ritual aktiverer byrommet',
          prompt: 'Hvordan endrer immatrikulering og andre seremonier et representasjonsrom til et midlertidig kollektivt bruksrom?',
          subject_id: 'by',
          emne_id: 'em_by_offentlige_rom_motesteder',
          evidence: 'Bruk daterte institusjonskilder for ritualet og skill dokumentert arrangement fra påstander om generell bruk gjennom året.'
        }
      ],
      guiding_questions: [
        'Hva tilhører selve Universitetsplassen, og hva tilhører universitetsbygningene som rammer den inn?',
        'Hvordan kan klassisistisk arkitektur uttrykke institusjonell representasjon uten å dokumentere faktisk sosial inkludering?',
        'Hva gjør monumentene synlig om universitetets offentlige selvbilde, og hvem blir mindre synlig?',
        'Hvordan skiller en seremoniell bruk av plassen seg fra vanlig ferdsel og opphold?',
        'Hva kan fotografier fra ulike perioder sammenlignes for når kamerastandpunktene ikke er identiske?'
      ],
      concepts: ['symbolsk makt', 'representasjon', 'institusjonsarkitektur', 'monument', 'kanonisering', 'offentlig rom', 'ritual', 'stedseierskap', 'materialitet'],
      observable_traces: [
        {
          title: 'Den symmetriske universitetsfronten',
          observation: 'Domus Media står sentralt med sidebygningene rundt en åpen plassflate mot Karl Johans gate.',
          interpretation_boundary: 'Symmetri og monumentalitet kan beskrives som representasjonsgrep, men de dokumenterer ikke alene institusjonens faktiske beslutningsmakt eller hvem som opplever rommet som tilgjengelig.',
          source_urls: ['https://oslobyleksikon.no/side/Universitetsplassen', 'https://oslobyleksikon.no/side/Universitetet_i_Oslo']
        },
        {
          title: 'To monumenter ved hovedinngangen',
          observation: 'Schweigaard- og P.A. Munch-statuene står på hver sin side av inngangen mot Domus Media.',
          interpretation_boundary: 'Plasseringen viser et kuratert minnelag, men er ikke en objektiv rangering av universitetets viktigste personer.',
          source_urls: ['https://oslobyleksikon.no/side/Universitetsplassen']
        }
      ],
      source_urls: [
        'https://oslobyleksikon.no/side/Universitetsplassen',
        'https://oslobyleksikon.no/side/Universitetet_i_Oslo',
        'https://www.hf.uio.no/iakh/forskning/prosjekter/aula-prosjektet/bilder/iicposter_2012.pdf',
        'https://www.uio.no/om/organisasjon/styret/moter/2022/12-06/i-sak-20-22-uio-i-sentrum-karl-johans-gate.pdf'
      ],
      verified_at: VERIFIED_AT
    }
  },

  'data/places/by/oslo/places/tullin.json': {
    sources: [
      ['Oslo byleksikon – Tullinløkka', 'https://oslobyleksikon.no/side/Tullinl%C3%B8kka'],
      ['OpenStreetMap – Tullinløkka', 'https://www.openstreetmap.org/way/666946874'],
      ['Oslo Museum – orgel ved Industri- og Kunstudstillingen 1883', 'https://www.oslobilder.no/OMU/OB.03774']
    ],
    fagverk: {
      schema: 'history_go_place_fagverk_v2',
      level: 'standard',
      status: 'curated',
      intro: 'Tullinløkka viser hvordan en åpen byflate kan skifte program mange ganger uten å miste sin romlige identitet. Lek, sykkelbruk, industriutstilling, demonstrasjoner, parkering, midlertidig kunsthall og park må leses som ulike tidslag, mens Nasjonalgalleriet og Historisk museum forblir egne institusjoner langs kanten.',
      article: [
        'Tullin er forankret i Tullinløkka, ikke i en løs markedsføringsbydel. Løkka ble skilt ut i 1869 og har siden vært brukt til svært forskjellige formål. Det historiske forløpet viser at offentlig rom ikke har én naturlig funksjon: bruk oppstår gjennom tillatelser, investeringer, midlertidige bygg, transportbehov og politiske eller kulturelle arrangementer.',
        'Industri- og Kunstudstillingen i 1883 fylte plassen med en stor midlertidig struktur og et stort antall utstillere. Senere demonstrasjoner og dokumentert velocipedbruk viser andre måter å ta den åpne flaten i bruk på. Disse episodene kan sammenlignes fordi de brukte samme sted, men de må ikke blandes til én kontinuerlig aktivitet. Hver hendelse har eget tidspunkt, formål og kildegrunnlag.',
        'Gjennom store deler av 1900-tallet ble løkka brukt til parkering. Kunsthallen fra 2005 var midlertidig, og i 2011 ble området omformet til park og aktivitetsflate. Før/nå-bilder kan vise endringer i plassflate og kanter, men ulike kamerastandpunkt gjør dem uegnet som presis optisk overlapp. Tullin trener derfor både lesning av historiske lag og metodisk nøktern sammenligning av byrom.'
      ],
      subject_ids: ['by'],
      emne_ids: ['em_by_offentlige_rom_motesteder', 'em_by_historiske_lag_i_hverdagsrom', 'em_by_demonstrasjoner_markeringer', 'em_by_bygningstyper_og_typologier', 'em_by_symbolsk_makt_og_representasjon'],
      chapter_ids: ['byliv-offentlige-rom', 'historiske-lag-ruiner-minner', 'makt-konflikt-protest-grenser-trygghet', 'arkitektur-gatekant-makt-ombruk'],
      lenses: [
        {
          id: 'tullin-programskifte',
          title: 'Samme flate, nye programmer',
          prompt: 'Hvordan kan Tullinløkka beholde stedlig kontinuitet når bruken skifter mellom lek, utstilling, demonstrasjon, parkering, kunsthall og park?',
          subject_id: 'by',
          emne_id: 'em_by_historiske_lag_i_hverdagsrom',
          evidence: 'Sett dokumenterte bruksfaser i kronologisk rekkefølge og unngå å lese én periode som stedets permanente identitet.'
        },
        {
          id: 'tullin-offentlig-rom',
          title: 'Åpen flate er organisert bruk',
          prompt: 'Hva viser tidsavgrenset velocipedbruk og andre tillatelser om reguleringen av et tilsynelatende åpent byrom?',
          subject_id: 'by',
          emne_id: 'em_by_offentlige_rom_motesteder',
          evidence: 'Koble bruken til daterte tillatelser eller arrangementsbeskrivelser, ikke bare til rommets fysiske åpenhet.'
        },
        {
          id: 'tullin-demonstrasjon',
          title: 'Plassen som politisk scene',
          prompt: 'Hvordan kan dokumenterte demonstrasjoner på Tullinløkka brukes til å studere mobilisering uten å gjøre folkemengden til mål på representativitet?',
          subject_id: 'by',
          emne_id: 'em_by_demonstrasjoner_markeringer',
          evidence: 'Skill at en demonstrasjon fant sted fra påstander om hvor bred støtte den hadde eller hvilken direkte effekt den fikk.'
        },
        {
          id: 'tullin-kantinstitusjoner',
          title: 'Plassen og institusjonene langs kanten',
          prompt: 'Hvordan påvirker Nasjonalgalleriet og Historisk museum rommet uten at deres interne historie blir Tullinløkkas egen historie?',
          subject_id: 'by',
          emne_id: 'em_by_bygningstyper_og_typologier',
          evidence: 'Beskriv bygningene som fysiske kanter og behold institusjonsspesifikke hendelser hos de respektive stedene.'
        }
      ],
      guiding_questions: [
        'Hvilke bruksfaser på Tullinløkka er dokumentert, og hvilke må holdes tydelig fra hverandre?',
        'Hva viser 1883-utstillingen om midlertidig arkitektur i et offentlig byrom?',
        'Hvordan kan demonstrasjoner studeres som bruk av plass uten å overdrive deres representativitet eller effekt?',
        'Hva tilhører Tullinløkka, og hva tilhører institusjonene langs kanten?',
        'Hvorfor bør før/nå-fotografier fra ulike ståsteder brukes til å lese lag, ikke som eksakt visuell måling?'
      ],
      concepts: ['programskifte', 'offentlig rom', 'midlertidig arkitektur', 'demonstrasjon', 'regulert bruk', 'historiske lag', 'stedseierskap', 'parkering', 'bildekritikk'],
      observable_traces: [
        {
          title: 'Den åpne løkka mellom institusjoner',
          observation: 'En sammenhengende åpen plassflate ligger mellom de store museumsbygningene og dagens bygateforbindelser.',
          interpretation_boundary: 'Plassens åpenhet dokumenterer en romlig struktur, men ikke hvilke grupper som faktisk bruker den mest eller hvordan bruken fordeler seg gjennom året.',
          source_urls: ['https://oslobyleksikon.no/side/Tullinl%C3%B8kka', 'https://www.openstreetmap.org/way/666946874']
        },
        {
          title: 'Dagens park- og aktivitetsflate',
          observation: 'Den tidligere parkeringsdominerte løkka fremstår i dag som park- og aktivitetsflate med et fleksibelt midtfelt.',
          interpretation_boundary: 'Dagens utforming viser en fysisk omforming, men dokumenterer ikke alene sosial effekt, aktivitetsnivå eller hvordan tidligere bruk oppleves av ulike grupper.',
          source_urls: ['https://oslobyleksikon.no/side/Tullinl%C3%B8kka']
        }
      ],
      source_urls: [
        'https://oslobyleksikon.no/side/Tullinl%C3%B8kka',
        'https://www.openstreetmap.org/way/666946874',
        'https://www.oslobilder.no/OMU/OB.03774'
      ],
      verified_at: VERIFIED_AT
    }
  },

  'data/places/historie/oslo/places_historie/akershus_festning.json': {
    sources: [
      ['Forsvarsbygg – Akershus festning', 'https://www.forsvarsbygg.no/eiendomsforvaltning/festningene/akershus-festning'],
      ['Forsvarsbygg – Festningsløypa Akershus festning', 'https://www.forsvarsbygg.no/globalassets/festningene/akershus-festning/akershus-festning.pdf'],
      ['Store norske leksikon – Akershus slott og festning', 'https://snl.no/Akershus_slott_og_festning']
    ],
    fagverk: {
      schema: 'history_go_place_fagverk_v2',
      level: 'standard',
      status: 'curated',
      intro: 'Akershus festning er et flerhundreårig maktlandskap der kongemakt, militær kontroll, fengsel, okkupasjon, restaurering og minnekultur ligger i samme kompleks. Analysen må bevare usikkerheten rundt de tidligste dateringene og skille hovedstedet fra Akershus slott, museene, Slottskirken og andre egne steder innenfor murene.',
      article: [
        'Festningen ble sannsynligvis påbegynt under Håkon 5. i perioden 1299–1304. `year: 1299` fungerer som teknisk tidsanker i steddataene, men skal ikke gjøres om til et sikkert byggeår. Fra middelalderborg utviklet Akershus seg gjennom renessanseomforming og artilleriforsvar til et statlig og militært kompleks. Denne lange kontinuiteten gjør stedet velegnet til å studere institusjonell makt gjennom endrede fysiske former.',
        'Beleiringen i 1716, fengsels- og slaverihistorien og bruken under okkupasjonen viser forskjellige former for kontroll. De skal ikke behandles som én sammenhengende institusjon eller én enkel utvikling. Under okkupasjonen ble festningen brukt som forlegning, fengsel og rettersted; minnesmerket ved Retterstedet er et senere minnelag. Stedet krever derfor et tydelig skille mellom hendelsen, det fysiske sporet og ettertidens markering.',
        'Restaureringen på 1900-tallet er også historie. Undersøkelser, gjenreisning og bevaringsvalg påvirket hvordan middelalder- og renessanselag fremstår i dag. Akershus er dermed ikke et urørt dokument, men et sammensatt kildeområde. Samtidig er festningen fortsatt et aktivt stats- og forsvarsanlegg. Fortidig materiale, moderne forvaltning og offentlig minnekultur må leses parallelt uten å slå dem sammen.'
      ],
      subject_ids: ['historie'],
      emne_ids: ['em_his_stat_institusjoner', 'em_his_okkupasjon_motstand', 'em_his_fangenskap_kontroll', 'em_his_spor_materialitet', 'em_his_minnesteder_historiebruk', 'em_his_kontroll_overvakning'],
      chapter_ids: ['makt_stat_institusjoner', 'krig_okkupasjon_motstand', 'kilder_arkiv_spor', 'minne_kulturarv_historiebruk'],
      lenses: [
        {
          id: 'akershus-datering',
          title: 'Usikker begynnelse',
          prompt: 'Hvorfor bør Akershus dateres til et dokumentert intervall rundt 1300 fremfor ett sikkert grunnleggingsår?',
          subject_id: 'historie',
          emne_id: 'em_his_spor_materialitet',
          evidence: 'Sammenhold den tekniske year-verdien med kildeformuleringene som daterer byggefasen til 1299–1304.'
        },
        {
          id: 'akershus-statsmakt',
          title: 'Makt skifter form',
          prompt: 'Hvordan kan samme kompleks gå fra kongeborg til militært og administrativt statsanlegg uten å være den samme institusjonen gjennom hele perioden?',
          subject_id: 'historie',
          emne_id: 'em_his_stat_institusjoner',
          evidence: 'Skill daterte funksjoner, styringsformer og bygningsendringer før kontinuitet på sted brukes som argument for institusjonell kontinuitet.'
        },
        {
          id: 'akershus-kontroll',
          title: 'Fengsel, krig og kontroll',
          prompt: 'Hva skiller festningens militære forsvar, fengselsfunksjoner og okkupasjonsbruk som historiske kontrollformer?',
          subject_id: 'historie',
          emne_id: 'em_his_fangenskap_kontroll',
          evidence: 'Bruk separate perioder og institusjonsnavn og unngå en lineær fortelling der alle kontrollformer behandles som samme system.'
        },
        {
          id: 'akershus-minne-restaurering',
          title: 'Restaurering og minne former stedet',
          prompt: 'Hvordan påvirker restaurering og minnesmerker det vi i dag kan se og forstå som Akershus’ historie?',
          subject_id: 'historie',
          emne_id: 'em_his_minnesteder_historiebruk',
          evidence: 'Skill stående eldre materiale fra senere rekonstruksjon, bevaring og minnemarkeringer med egne dateringer.'
        }
      ],
      guiding_questions: [
        'Hvilke deler av Akershus’ tidlige historie er sikkert datert, og hvor må usikkerhet beholdes?',
        'Hvordan endret festningens statlige og militære funksjoner seg fra middelalder til moderne tid?',
        'Hvorfor må fengsels-, beleirings- og okkupasjonshistorie behandles som forskjellige institusjonelle lag?',
        'Hva kan Retterstedets minnesmerke dokumentere om etterkrigstidens minnekultur, og hva krever kilder til selve 1945-hendelsene?',
        'Hvordan påvirker restaurering det som i dag fremstår som historisk autentisk?'
      ],
      concepts: ['statsmakt', 'festning', 'institusjon', 'beleiring', 'fangenskap', 'okkupasjon', 'restaurering', 'materialspor', 'minnekultur'],
      observable_traces: [
        {
          title: 'Festningsverk fra flere perioder',
          observation: 'Murer, porter, bastioner og bygninger viser at anlegget består av fysisk ulike forsvars- og bruksfaser.',
          interpretation_boundary: 'Synlige forskjeller dokumenterer flerlagd materialitet, men nøyaktig datering og funksjon må knyttes til bygningshistoriske kilder.',
          source_urls: ['https://www.forsvarsbygg.no/eiendomsforvaltning/festningene/akershus-festning', 'https://snl.no/Akershus_slott_og_festning']
        },
        {
          title: 'Retterstedets minneplate',
          observation: 'Minnesmerket navngir de 42 nordmennene som ble henrettet på festningen i februar og mars 1945.',
          interpretation_boundary: 'Minnesmerket er et etterkrigsobjekt fra 1949 og må skilles fra de samtidige kildene til henrettelsene og okkupasjonsapparatet.',
          source_urls: ['https://www.forsvarsbygg.no/globalassets/festningene/akershus-festning/akershus-festning.pdf']
        }
      ],
      source_urls: [
        'https://www.forsvarsbygg.no/eiendomsforvaltning/festningene/akershus-festning',
        'https://www.forsvarsbygg.no/globalassets/festningene/akershus-festning/akershus-festning.pdf',
        'https://snl.no/Akershus_slott_og_festning'
      ],
      verified_at: VERIFIED_AT
    }
  },

  'data/places/historie/oslo/places_historie_added_batch_01/oslo_hospital.json': {
    sources: [
      ['Oslo Hospital – historien', 'https://www.oslohospital.no/oslo-hospital-sin-historie'],
      ['Oslo byarkiv – Oslo Hospitals historie', 'https://blogg.oslobyarkiv.no/blog/2018/12/06/oslo-hospitals-historie/'],
      ['Tidsskriftet – etableringen av Oslo Hospitals Dollhus', 'https://tidsskriftet.no/2000/11/merkesteiner-i-norsk-medisin/etableringen-av-oslo-hospitals-dollhus'],
      ['Allstad – åpningen av Oslo Hospital i 2026', 'https://www.allstad.no/aktuelt/vellykket-%C3%A5pning-av-oslo-hospital']
    ],
    fagverk: {
      schema: 'history_go_place_fagverk_v2',
      level: 'standard',
      status: 'curated',
      intro: 'Oslo Hospital gjør omsorg, fattigvesen, psykiatri, eiendomsøkonomi og institusjonell kontroll lesbart i ett historisk kompleks. Kildekritikken er avgjørende: «hospital» er et historisk institusjonsbegrep, 1777/1778-konflikten om Dollhuset skal beholdes, og eldre kildeord skal ikke oversettes til moderne diagnoser.',
      article: [
        'På stedet lå et fransiskanerkloster fra middelalderen før Christian 3 i 1538 ga ordre om at anlegget skulle brukes som hospital for fattige og syke. Hospital betydde her en bred omsorgs- og forsørgelsesinstitusjon, ikke et moderne akutt- eller spesialsykehus. Jordeboken fra 1648 viser samtidig at omsorg krevde eiendom, inntekter og administrasjon. Institusjonshistorie må derfor også undersøke det materielle og økonomiske grunnlaget.',
        'Dollhuset synliggjør hvordan omsorg og kontroll kunne overlappe. Kildene oppgir både 1777 og 1778 for etablering eller ferdigstillelse, og avviket bør stå åpent. Herman Wedel Major arbeidet ved Oslo Hospital fra 1847 og deltok i reformarbeidet som ledet til loven av 1848. Koblingen er viktig, men historien må ikke bli en én-persons heltefortelling: pasienter, forvaltere, lovgivere og institusjonelle rammer inngikk i en større prosess.',
        'Komplekset rommer bygninger fra flere perioder og ble brukt til pleie og institusjonsdrift fram til 2018. Etter rehabilitering åpnet det i august 2026 som arbeids- og møtested. Denne ombruken gjør det mulig å studere kulturminne som fortsatt infrastruktur. Samtidig er arkivene sterkere på vedtak, eiendom og institusjon enn på beboernes egne erfaringer. Fraværet av pasientstemmer er derfor en kildebegrensning som skal synliggjøres, ikke fylles med antakelser.'
      ],
      subject_ids: ['historie'],
      emne_ids: ['em_his_kirke_kloster_middelalder', 'em_his_sosialhistorie_hverdagsliv', 'em_his_stat_institusjoner', 'em_his_historiske_lag_i_byrom'],
      chapter_ids: ['middelalder_kirke_kongemakt', 'velferd_rett_hverdagsliv', 'makt_stat_institusjoner', 'kilder_arkiv_spor'],
      lenses: [
        {
          id: 'oslo-hospital-begrep',
          title: 'Historiske begreper må historiseres',
          prompt: 'Hvorfor blir det misvisende å lese ordet hospital i 1500- og 1700-tallskildene som om det betydde det samme som sykehus i dag?',
          subject_id: 'historie',
          emne_id: 'em_his_sosialhistorie_hverdagsliv',
          evidence: 'Bruk institusjonens dokumenterte oppgaver innen pleie, forsørgelse, bolig og administrasjon til å avgrense begrepets historiske betydning.'
        },
        {
          id: 'oslo-hospital-kildekonflikt',
          title: '1777 eller 1778?',
          prompt: 'Hvordan bør en historisk framstilling håndtere at kildene oppgir ulike år for Dollhuset?',
          subject_id: 'historie',
          emne_id: 'em_his_historiske_lag_i_byrom',
          evidence: 'Publiser avviket og skill mulige hendelser som bygging, ferdigstillelse og åpning i stedet for å velge ett år uten belegg.'
        },
        {
          id: 'oslo-hospital-institusjon',
          title: 'Omsorg og kontroll i samme institusjon',
          prompt: 'Hvordan kan Dollhuset og hospitalets øvrige omsorgsfunksjoner undersøkes uten å redusere stedet til enten hjelp eller kontroll?',
          subject_id: 'historie',
          emne_id: 'em_his_stat_institusjoner',
          evidence: 'Sammenlign institusjonelle regler, fysiske rom og reformarbeid og behold motsetningene mellom forsørgelse, behandling og kontroll.'
        },
        {
          id: 'oslo-hospital-arkivtaushet',
          title: 'Arkivet har skjeve stemmer',
          prompt: 'Hva betyr det for historien at kildene er rikere på eiendom, vedtak og forvaltning enn på beboernes egne erfaringer?',
          subject_id: 'historie',
          emne_id: 'em_his_sosialhistorie_hverdagsliv',
          evidence: 'Marker hvilke aktører som faktisk taler i kildene og unngå å rekonstruere pasienters erfaringer når dokumentasjonen mangler.'
        }
      ],
      guiding_questions: [
        'Hva betydde hospital som institusjon i eldre tid, og hvorfor er moderne sykehus en dårlig direkte analogi?',
        'Hvordan viser jordeboken fra 1648 at omsorg også var avhengig av eiendom og økonomisk forvaltning?',
        'Hvordan bør 1777/1778-konflikten om Dollhuset presenteres kildekritisk?',
        'Hvordan kan Herman Wedel Majors reformarbeid knyttes til loven av 1848 uten å gjøre institusjonshistorien til en enkel heltefortelling?',
        'Hvilke erfaringer er svakt representert i de bevarte kildene, og hvordan påvirker det hva vi kan hevde?'
      ],
      concepts: ['hospital', 'fattigomsorg', 'institusjon', 'jordebok', 'psykiatrihistorie', 'kildekonflikt', 'reform', 'arkivtaushet', 'ombruk'],
      observable_traces: [
        {
          title: 'Bygninger fra flere omsorgsperioder',
          observation: 'Gråsteinsbygningen, kirken og senere institusjonsbygninger gjør flere historiske faser fysisk synlige i samme kompleks.',
          interpretation_boundary: 'Bygningenes alder og form dokumenterer materielle lag, men sier ikke alene hvordan beboere ble behandlet eller opplevde institusjonen.',
          source_urls: ['https://www.oslohospital.no/oslo-hospital-sin-historie', 'https://blogg.oslobyarkiv.no/blog/2018/12/06/oslo-hospitals-historie/']
        },
        {
          title: 'Et tidligere lukket institusjonsområde i ny bruk',
          observation: 'Det rehabiliterte komplekset brukes i 2026 som arbeids- og møtested etter at pleie- og sykehusdriften på stedet opphørte i 2018.',
          interpretation_boundary: 'Ny fysisk og organisatorisk bruk dokumenterer ombruk, men kan ikke alene brukes som mål på hvor inkluderende, vellykket eller sosialt tilgjengelig transformasjonen er.',
          source_urls: ['https://www.allstad.no/aktuelt/vellykket-%C3%A5pning-av-oslo-hospital', 'https://www.oslohospital.no/oslo-hospital-sin-historie']
        }
      ],
      source_urls: [
        'https://www.oslohospital.no/oslo-hospital-sin-historie',
        'https://blogg.oslobyarkiv.no/blog/2018/12/06/oslo-hospitals-historie/',
        'https://tidsskriftet.no/2000/11/merkesteiner-i-norsk-medisin/etableringen-av-oslo-hospitals-dollhus',
        'https://www.allstad.no/aktuelt/vellykket-%C3%A5pning-av-oslo-hospital'
      ],
      verified_at: VERIFIED_AT
    }
  }
};

const read = (relative) => JSON.parse(fs.readFileSync(path.join(ROOT, relative), 'utf8'));
const write = (relative, value) => fs.writeFileSync(path.join(ROOT, relative), `${JSON.stringify(value, null, 2)}\n`);

function addExternalLink(place, label, url) {
  const field = Array.isArray(place.externalLinks)
    ? 'externalLinks'
    : Array.isArray(place.external_links)
      ? 'external_links'
      : 'externalLinks';
  place[field] ||= [];
  const existing = place[field].find((row) => row?.url === url);
  if (existing) {
    if (!String(existing.label || existing.title || existing.name || '').trim()) existing.label = label;
    return;
  }
  place[field].push({ type: 'source', label, url, verifiedAt: VERIFIED_AT });
}

const registry = read(REGISTRY_FILE);
registry.placeLinks ||= {};

for (const [relative, target] of Object.entries(targets)) {
  const place = read(relative);
  if (!place?.id) throw new Error(`${relative}: missing Place id`);
  if (place.fagverk?.status === 'curated') throw new Error(`${place.id}: already curated; refusing overwrite`);

  for (const [label, url] of target.sources) addExternalLink(place, label, url);
  place.fagverk = target.fagverk;

  registry.placeLinks[place.id] = {
    sourceFile: relative.replace(/^data\//u, ''),
    field: 'fagverk',
    schema: target.fagverk.schema,
    level: target.fagverk.level,
    status: target.fagverk.status
  };

  write(relative, place);
  console.log(`Curated Fagverk: ${place.id}`);
}

write(REGISTRY_FILE, registry);
console.log('Indexed four Place-owned Fagverk packages');
