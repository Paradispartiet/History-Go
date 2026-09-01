#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const VERIFIED_AT = '2026-09-01';
const REGISTRY_FILE = 'data/fagverk/fagverk_registry.json';

const targets = {
  'data/places/by/oslo/places/bankplassen.json': {
    sources: [
      ['Oslo byleksikon – Bankplassen', 'https://oslobyleksikon.no/side/Bankplassen'],
      ['Oppdag Kvadraturen – Grev Wedels plass og Bankplassen', 'https://www.oppdagkvadraturen.no/stoppesteder/grev-wedels-plass-bankplassen'],
      ['Nasjonalmuseet – historien til Nasjonalmuseet Arkitektur', 'https://www.nasjonalmuseet.no/en/visit/locations/national-museum-architecture/the-history-of-the-national-museum--architecture/']
    ],
    fagverk: {
      schema: 'history_go_place_fagverk_v2', level: 'full', status: 'curated',
      intro: 'Bankplassen kan leses som et offentlig rom der statsbygging, finans, scenekunst, arkitektur og senere museumsbruk ligger som separate lag rundt samme plassflate. Faglig analyse må skille selve plassen fra bygningene som vender seg mot den, og skille et synlig historisk spor fra institusjonen eller hendelsen sporet viser til.',
      article: [
        'Bankplassen vokste fram etter at de nedre festningsverkene ble fjernet fra midten av 1820-årene. Plassrommet fikk tidlig en representativ rolle mellom sivile og militære institusjoner, men de omkringliggende byggene er egne steder og aktører. Groschs bankbygning fra 1828, Christiania Theater fra 1837 og senere bank- og museumsbygninger kan derfor brukes til å lese endring rundt plassen uten at deres komplette institusjonshistorie overtas av plassflaten.',
        'Parkmessig beplantning fra 1860, skiftende bankarkitektur, den forsvunne teaterbygningen og offentlig kunst gjør ulike perioder synlige i samme kompakte byrom. Johannes Brun-monumentet viser hvordan et borte teaterlag kan få et senere minnespor, mens nyere skulpturer er integrert i sittekanter og sikring. Materialsporene dokumenterer valg og plasseringer, men ikke alene hvordan folk brukte plassen eller hvordan institusjonene virket.',
        'Bankplassen trener derfor to typer presisjon samtidig: stedseierskap og tidslag. Et fotografi, en fasade eller en statue kan dokumentere et avgrenset spor, mens påstander om økonomisk makt, teaterliv eller museumspraksis må knyttes til egne kilder. Når slike kilder kombineres, blir plassen en lesbar overgang fra festningsterreng til finans-, kultur- og hverdagsrom.'
      ],
      subject_ids: ['by'],
      emne_ids: ['em_by_torg_plasser_som_scene','em_by_offentlige_rom_motesteder','em_by_historiske_lag_i_hverdagsrom','em_by_transformasjon_ombruk'],
      chapter_ids: ['byliv-offentlige-rom','arkitektur-type-skala-byform','arkitektur-gatekant-makt-ombruk'],
      lenses: [
        { id:'bankplassen-plass-og-bygg', title:'Plass og institusjonsbygg', prompt:'Hvordan kan Bankplassen undersøkes som eget offentlig rom uten å absorbere historien til bank-, teater- og museumsbygningene rundt?', subject_id:'by', emne_id:'em_by_offentlige_rom_motesteder', evidence:'Avgrens plassflaten først og bruk bygningenes fasader som relasjonelle spor, ikke som identiske med stedet.' },
        { id:'bankplassen-teaterlag', title:'Et forsvunnet teaterlag', prompt:'Hvordan kan Johannes Brun-monumentet og historiske bilder gjøre Christiania Theater lesbart etter at selve bygningen er borte?', subject_id:'by', emne_id:'em_by_historiske_lag_i_hverdagsrom', evidence:'Koble monumentets plassering og daterte bilder til skriftlige kilder om teatrets periode 1837–1899.' },
        { id:'bankplassen-ombruk', title:'Fra bank til museum', prompt:'Hva viser ombruken av Groschs bankbygning om hvordan institusjonsbygg kan få nye funksjoner uten at materialiteten forsvinner?', subject_id:'by', emne_id:'em_by_transformasjon_ombruk', evidence:'Sammenhold bank-, arkiv- og museumsfasene med Nasjonalmuseets dokumenterte bygningshistorie.' },
        { id:'bankplassen-scene', title:'Torget som offentlig scene', prompt:'Hvordan virker kunst, vegetasjon, sittekanter og fasader sammen om å gjøre Bankplassen til mer enn et forrom for institusjoner?', subject_id:'by', emne_id:'em_by_torg_plasser_som_scene', evidence:'Beskriv de observerbare elementene før du vurderer hvordan de organiserer opphold og oppmerksomhet.' },
        { id:'bankplassen-kildegrense', title:'Spor er ikke hele historien', prompt:'Hvorfor kan en fasade eller statue dokumentere et historisk lag uten å bevise hvordan institusjonen fungerte eller hvordan plassen ble brukt?', subject_id:'by', emne_id:'em_by_historiske_lag_i_hverdagsrom', evidence:'Skill fysisk observasjon fra institusjons- og bruksdata i de navngitte kildene.' }
      ],
      guiding_questions: [
        'Hva tilhører Bankplassen som plass, og hva tilhører de separate bygningene rundt?',
        'Hvordan kan et forsvunnet teater fortsatt være historisk synlig i dagens plassrom?',
        'Hva viser ombruk av den gamle bankbygningen om kontinuitet og funksjonsskifte?',
        'Hvilke deler av plassens historie kan observeres direkte, og hvilke krever dokumentkilder?',
        'Hvordan endrer kunst, vegetasjon og sittekanter måten den institusjonstunge plassen kan leses på?'
      ],
      concepts: ['offentlig plass','stedseierskap','historiske lag','institusjonsarkitektur','ombruk','minnespor','offentlig kunst','materialitet','kildekritikk'],
      observable_traces: [
        { title:'Johannes Brun-monumentet', observation:'Johannes Brun-statuen står nær stedet der Christiania Theater lå og gir et synlig minnespor etter teaterlaget.', interpretation_boundary:'Monumentet dokumenterer senere minnekultur og stedlig kobling, men viser ikke alene teatrets virksomhet eller publikumsbruk.', source_urls:['https://oslobyleksikon.no/side/Bankplassen','https://www.oppdagkvadraturen.no/stoppesteder/grev-wedels-plass-bankplassen'] },
        { title:'Grosch-anlegget ved plassen', observation:'Den klassisistiske bankbygningen og senere museumstilbygg gjør flere arkitekturperioder synlige ved samme plasskant.', interpretation_boundary:'Bygningsformen kan observeres, men institusjonelle funksjoner og dateringer må hentes fra bygningshistoriske kilder.', source_urls:['https://www.nasjonalmuseet.no/en/visit/locations/national-museum-architecture/the-history-of-the-national-museum--architecture/'] }
      ],
      source_urls: ['https://oslobyleksikon.no/side/Bankplassen','https://www.oppdagkvadraturen.no/stoppesteder/grev-wedels-plass-bankplassen','https://www.nasjonalmuseet.no/en/visit/locations/national-museum-architecture/the-history-of-the-national-museum--architecture/'],
      verified_at: VERIFIED_AT
    }
  },
  'data/places/by/oslo/places_by_oslo_oppdag_kvadraturen_batch_03/grev_wedels_plass.json': {
    sources: [
      ['Oppdag Kvadraturen – Grev Wedels plass', 'https://www.oppdagkvadraturen.no/stoppesteder/grev-wedels-plass'],
      ['Oslo byleksikon – Grev Wedels plass', 'https://oslobyleksikon.no/side/Grev_Wedels_plass']
    ],
    fagverk: {
      schema:'history_go_place_fagverk_v2', level:'standard', status:'curated',
      intro:'Grev Wedels plass er et lite parkrom der utfylt sjøgrunn, urealiserte statsplaner, bilbruk, krigsanlegg og kulturminnevern kan leses som ulike tidslag. Analysen må skille parken fra Gamle Logen, Militærhospitalet og Akershus festning, og skille planer som aldri ble bygget fra fysiske spor som faktisk finnes.',
      article:[
        'Grev Wedels plass viser at byhistorie også består av planer som ikke ble realisert. På 1820- og 1830-tallet ble området vurdert for sentrale statsinstitusjoner, men byggene ble aldri oppført. Parken som faktisk ble anlagt i 1869 må derfor ikke leses som rest av et ferdig statsanlegg, men som et senere resultat av andre beslutninger om arealet.',
        'På 1900-tallet ble parkfunksjonen presset tilbake av biler, bensinstasjon, parkering og midlertidige krigsanlegg. Restaureringen på 1980-tallet og gjenreisningen av Militærhospitalet ved plassen skapte igjen et grønt og kulturhistorisk orientert rom. Bygningen er likevel et eget objekt; flyttingen og plasseringen ved parken er det relevante parksporet.',
        'Fontene og skulpturer gjør nyere lag synlige, men de representerer kuratering og kunstvalg, ikke et komplett historisk register. Grev Wedels plass egner seg derfor til å sammenligne plan, faktisk fysisk endring og senere historiebruk i samme avgrensede offentlige rom.'
      ],
      subject_ids:['by'], emne_ids:['em_by_parker_som_sosial_infrastruktur','em_by_historiske_lag_i_hverdagsrom','em_by_offentlige_rom_motesteder'], chapter_ids:['byliv-offentlige-rom','arkitektur-type-skala-byform'],
      lenses:[
        {id:'grev-urealisert-plan',title:'Hovedstaden som ikke ble bygget',prompt:'Hvordan kan urealiserte statsplaner være historisk viktige uten å behandles som fysiske bygg som faktisk sto på plassen?',subject_id:'by',emne_id:'em_by_historiske_lag_i_hverdagsrom',evidence:'Bruk planhistorien som dokumentert beslutnings- og idéspor, og skill den fra parkens observerbare materialitet.'},
        {id:'grev-park-sosial',title:'Park som sosial infrastruktur',prompt:'Hva ved dagens park legger til rette for opphold og møte, og hvilke bruksvirkninger kan ikke leses direkte fra utformingen?',subject_id:'by',emne_id:'em_by_parker_som_sosial_infrastruktur',evidence:'Beskriv stier, vegetasjon, fontene og sittemuligheter uten å gjøre øyeblikksobservasjon til generell brukerstatistikk.'},
        {id:'grev-bil-park',title:'Fra biler tilbake til park',prompt:'Hva viser overgangen fra bensinstasjon og parkering til restaurert grøntrom om konkurrerende bruk av offentlig areal?',subject_id:'by',emne_id:'em_by_offentlige_rom_motesteder',evidence:'Sammenlign daterte fotografier og kilder til bilbruk med den senere parkrestaureringen.'},
        {id:'grev-flyttet-bygg',title:'Flyttet bygning ved parken',prompt:'Hvordan kan Militærhospitalets gjenreisning ved plassen studeres uten å gjøre bygningen og parken til samme canonical sted?',subject_id:'by',emne_id:'em_by_historiske_lag_i_hverdagsrom',evidence:'Skill bygningens egen historie fra parkens historie om plassering, restaurering og kulturminnevern.'}
      ],
      guiding_questions:['Hva er fysisk bevart på Grev Wedels plass, og hva finnes bare som dokumenterte planer?','Hvordan endret bilbruk og bensinstasjon parkens funksjon gjennom 1900-tallet?','Hva betyr det for stedets historie at Militærhospitalet ble flyttet og gjenreist her?','Hvordan kan skulpturer og fontene analyseres som nyere historiebruk i parkrommet?','Hvorfor må parken skilles fra Gamle Logen, Militærhospitalet og Akershus festning?'],
      concepts:['urealisert plan','offentlig park','tidslag','funksjonsskifte','bilby','kulturminnevern','flyttet bygning','historiebruk'],
      observable_traces:[
        {title:'Fontene og parkrom',observation:'Fontenen, vegetasjonen og ganglinjene gjør dagens parkfunksjon tydelig lesbar.',interpretation_boundary:'Utformingen viser fysisk parkorganisering, men dokumenterer ikke alene hvem som bruker stedet eller hvor mye.',source_urls:['https://www.oppdagkvadraturen.no/stoppesteder/grev-wedels-plass','https://oslobyleksikon.no/side/Grev_Wedels_plass']},
        {title:'Militærhospitalet ved parken',observation:'Den gjenreiste bygningen står ved parkens kant som et tydelig kulturminnelag fra restaureringsperioden på 1980-tallet.',interpretation_boundary:'Bygningen er et separat sted og kan ikke brukes som om hele dens tidligere institusjonshistorie foregikk på Grev Wedels plass.',source_urls:['https://oslobyleksikon.no/side/Grev_Wedels_plass']}
      ],
      source_urls:['https://www.oppdagkvadraturen.no/stoppesteder/grev-wedels-plass','https://oslobyleksikon.no/side/Grev_Wedels_plass'], verified_at:VERIFIED_AT
    }
  },
  'data/places/by/oslo/gamle_trikkestallen/gamle_trikkestallen.json': {
    sources:[
      ['Sporveien – Torshov','https://www.sporveien.no/vare-tjenester/trikken/trikkeholdeplasser/t-o/torshov/'],
      ['Oslo byleksikon – Torshovgata','https://oslobyleksikon.no/side/Torshovgata'],
      ['Oslo Nye – historikk','https://oslonye.no/historikk/'],
      ['Égal Teater – Trikkestallen','https://egalteater.no/om/trikkestallen/']
    ],
    fagverk:{
      schema:'history_go_place_fagverk_v2',level:'standard',status:'curated',
      intro:'Gamle trikkestallen på Torshov er et godt eksempel på hvordan transportinfrastruktur kan skifte funksjon uten at bygningen forsvinner. Hallporter, store rom og verkstedhistorie dokumenterer drift og arbeid, mens kulturhus- og teaterfasen viser ombruk. De ulike periodene må skilles fra hverandre og fra dagens operatør.',
      article:[
        'Anlegget ble oppført i 1899 som vognhall og verksted da den elektriske Torshovlinjen åpnet. Det var derfor en del av et teknisk system for oppstilling, vedlikehold og drift, ikke bare et stort industribygg. Arkivbilder av motorvogner og personale gjør arbeidsfunksjonen konkret, men ett fotografi dokumenterer bare den situasjonen og tiden bildet faktisk viser.',
        'Vognhallfunksjonen opphørte i 1957, mens karosseriverksted fortsatte senere. Slike skift viser hvordan en bygning kan endre rolle gradvis. Når anlegget senere ble kulturhus og teaterscene, ble den romlige kapasiteten gjenbrukt i en helt annen offentlig funksjon. Materialkontinuitet betyr derfor ikke funksjonskontinuitet.',
        'Dagens skilt og operatører er også tidsbundne. Et foto fra 2016 viser Oslo Nye-perioden, mens Égal Teater bruker lokalet i dag. En presis stedsanalyse skiller mellom bygningen som langvarig fysisk anker, organisasjonene som bruker den i bestemte perioder, og de historiske kjøretøyene og arbeidsprosessene som dokumenteres i arkivene.'
      ],
      subject_ids:['by'],emne_ids:['em_by_infrastruktur_mobilitet','em_by_historiske_lag_i_hverdagsrom','em_by_transformasjon_ombruk','em_by_bygningstyper_og_typologier','em_by_materialitet_og_sanseerfaring'],chapter_ids:['urbanisme-idealer-forbindelser-fortetting','arkitektur-type-skala-byform','arkitektur-gatekant-makt-ombruk','byliv-stemning-mikrokomfort'],
      lenses:[
        {id:'trikkestallen-infrastruktur',title:'Bygning som transportinfrastruktur',prompt:'Hvordan viser hallporter, romvolum og arkivbilder at Trikkestallen var del av et drifts- og vedlikeholdssystem for trikken?',subject_id:'by',emne_id:'em_by_infrastruktur_mobilitet',evidence:'Koble observerbar bygningstype til Sporveiens og arkivenes dokumentasjon av vognhall og verksted.'},
        {id:'trikkestallen-ombruk',title:'Fra verksted til kulturhus',prompt:'Hva endres, og hva består, når et teknisk driftsanlegg blir teater- og kulturhus?',subject_id:'by',emne_id:'em_by_transformasjon_ombruk',evidence:'Skill fysisk bygningskontinuitet fra skiftende funksjoner, operatører og publikum.'},
        {id:'trikkestallen-tidslag',title:'Flere driftsfaser i samme bygg',prompt:'Hvordan kan vognhall, karosseriverksted og kulturhus leses som separate tidslag uten å blandes sammen?',subject_id:'by',emne_id:'em_by_historiske_lag_i_hverdagsrom',evidence:'Bruk daterte kilder for hver fase og behandle fotografier som avgrensede tidsutsnitt.'},
        {id:'trikkestallen-materialitet',title:'Hallrom og materialitet',prompt:'Hvilke fysiske trekk ved den gamle vognhallen kan observeres i dag, og hvilke historiske arbeidsfunksjoner krever arkivkilder?',subject_id:'by',emne_id:'em_by_materialitet_og_sanseerfaring',evidence:'Beskriv fasade, porter og romtype først og hent arbeidsprosesser fra dokumenterte kilder.'}
      ],
      guiding_questions:['Hvorfor var Trikkestallen en del av trikkens infrastruktur og ikke bare et industribygg?','Hva er forskjellen mellom vognhallfasen og den senere karosseriverkstedfasen?','Hvordan viser ombruk til kulturhus både kontinuitet og brudd i stedets funksjon?','Hvorfor kan et foto med Oslo Nye-skilt ikke brukes som bevis for dagens operatør?','Hvilke arbeidsprosesser kan observeres i materialiteten, og hvilke må dokumenteres gjennom arkiver?'],
      concepts:['transportinfrastruktur','vognhall','verksted','ombruk','funksjonsskifte','materialitet','arbeidshistorie','kulturhus','tidslag'],
      observable_traces:[
        {title:'Store hallporter mot gaten',observation:'De store åpningene og den lange hallfasaden gjør bygningens opprinnelige funksjon for kjøretøy fysisk lesbar.',interpretation_boundary:'Formen viser en driftsbygning, men spesifikke verkstedoppgaver og driftsår må dokumenteres i kilder.',source_urls:['https://www.sporveien.no/vare-tjenester/trikken/trikkeholdeplasser/t-o/torshov/','https://oslobyleksikon.no/side/Torshovgata']},
        {title:'Teaterbruk i industribygget',observation:'Skilt, publikumsinngang og dagens kulturbruk viser at hallen er tatt i bruk som offentlig teaterlokale.',interpretation_boundary:'Dagens operatør og bruk skal ikke projiseres bakover på vognhall- og verkstedperiodene.',source_urls:['https://egalteater.no/om/trikkestallen/','https://oslonye.no/historikk/']}
      ],
      source_urls:['https://www.sporveien.no/vare-tjenester/trikken/trikkeholdeplasser/t-o/torshov/','https://oslobyleksikon.no/side/Torshovgata','https://oslonye.no/historikk/','https://egalteater.no/om/trikkestallen/'],verified_at:VERIFIED_AT
    }
  },
  'data/places/by/oslo/gamle_radhus/gamle_radhus.json': {
    sources:[
      ['Oslo kommune – Gamle Rådhus','https://www.oslo.kommune.no/natur-kultur-og-fritid/kunst-og-kultur/kultureiendommer/gamle-radhus/'],
      ['Sceneweb – Gamle Raadhus Scene','https://sceneweb.no/nb/venue/31901/Gamle_Raadhus%20Scene%20%2F%20R%C3%A5dhussalen%2C%20Oslo']
    ],
    fagverk:{
      schema:'history_go_place_fagverk_v2',level:'full',status:'curated',
      intro:'Gamle rådhus viser hvordan én bygning kan skifte mellom lokal styring, rett, religion, selskapsliv, servering og scenekunst. Den viktigste faglige utfordringen er å holde funksjonene tidsmessig adskilt og samtidig lese dagens renessansepreg kritisk, fordi deler av uttrykket er resultat av senere restaurering.',
      article:[
        'Da Gamle rådhus sto ferdig i 1641 fikk den nye Christiania-bebyggelsen et fast institusjonsbygg for magistrat, rett, borgerskap og arrest. Dette var ikke et moderne folkevalgt rådhus: embeter, borgerrettigheter og lokal styring fulgte andre institusjonelle ordninger. Bygningen egner seg derfor til å undersøke hvordan politiske og rettslige institusjoner må forstås på sine egne historiske premisser.',
        'Etter rådhusperioden fikk huset en rekke nye funksjoner. Rådhussalen ble brukt til gudstjenester etter brannen i 1686, bygningen ble senere frimurerlosje, Høyesterett holdt til her på 1800-tallet, og restaurant- og scenevirksomhet kom til i senere perioder. At alt skjedde i samme hus betyr ikke at funksjonene var samtidige eller at dagens rom viser dem uforandret.',
        'Materialiteten må også kildekritiseres. Opprinnelige tårn og gavler forsvant, restaureringsarbeid på 1900-tallet tilbakeførte et renessansepreg, og restaurantinteriøret fra 1926 ble gjenskapt etter brann i 1996. Gamle rådhus er derfor både en historisk bygning og et produkt av senere bevaringsvalg. En presis analyse kombinerer fysiske spor med dokumenter om når og hvorfor endringene skjedde.'
      ],
      subject_ids:['historie'],emne_ids:['em_his_stat_institusjoner','em_his_historiske_lag_i_byrom','em_his_modernisering_1800','em_his_arkiv_og_dokumentasjon','em_his_spor_materialitet'],chapter_ids:['makt_stat_institusjoner','historisk_tid_periodisering','kilder_arkiv_spor'],
      lenses:[
        {id:'gamle-radhus-institusjoner',title:'Styring på 1600-tallet',prompt:'Hvordan skilte magistrat, borgerskap, rett og arrest i Gamle rådhus seg fra dagens kommunale styringsmodell?',subject_id:'historie',emne_id:'em_his_stat_institusjoner',evidence:'Bruk kommunens bygningshistorie og unngå å oversette tidligmoderne embeter direkte til dagens folkevalgte roller.'},
        {id:'gamle-radhus-tidslag',title:'Funksjoner i ulike perioder',prompt:'Hvordan kan rådhus, gudstjeneste, frimurerlosje, Høyesterett, restaurant og scene holdes fra hverandre som daterte bruksfaser?',subject_id:'historie',emne_id:'em_his_historiske_lag_i_byrom',evidence:'Bygg en tidslinje og krev en kilde for overgangene mellom funksjonene.'},
        {id:'gamle-radhus-materialitet',title:'Restaurert renessansepreg',prompt:'Hva ved dagens fasade er historisk materiale, og hva er senere restaureringsvalg som tilbakefører et eldre uttrykk?',subject_id:'historie',emne_id:'em_his_spor_materialitet',evidence:'Sammenhold dagens gavler og bygningsform med dokumentasjonen av ombygging og restaurering.'},
        {id:'gamle-radhus-arkiv',title:'Dokument og bygning sammen',prompt:'Hvorfor er fysiske observasjoner utilstrekkelige for å datere skiftende institusjoner og restaureringsfaser i Gamle rådhus?',subject_id:'historie',emne_id:'em_his_arkiv_og_dokumentasjon',evidence:'Bruk bygningen som materialspor og de skriftlige kildene til funksjon, datering og institusjonell sammenheng.'},
        {id:'gamle-radhus-modernisering',title:'Fra embetsby til moderne bruk',prompt:'Hvordan viser 1800- og 1900-tallets retts-, restaurant- og kulturbruk at en eldre institusjonsbygning kan moderniseres uten å miste alle tidligere lag?',subject_id:'historie',emne_id:'em_his_modernisering_1800',evidence:'Følg dokumenterte bruks- og restaureringsskifter framfor å anta én lineær moderniseringshistorie.'}
      ],
      guiding_questions:['Hvordan fungerte Gamle rådhus som institusjonsbygg før moderne lokaldemokrati?','Hvorfor må de mange funksjonene i huset holdes adskilt som ulike historiske perioder?','Hva ved dagens renessansepreg er resultat av senere restaurering og tilbakeføring?','Hvordan kan skriftlige kilder korrigere det inntrykket dagens bygning gir ved første blikk?','Hva viser restaurant- og scenebruken om ombruk av et gammelt offentlig bygg?'],
      concepts:['magistrat','borgerskap','institusjonshistorie','tidslag','restaurering','rekonstruksjon','materialspor','arkiv','ombruk','rettshistorie'],
      observable_traces:[
        {title:'Restaurerte trappegavler',observation:'Trappegavlene gir dagens bygning et tydelig renessansepreg og er lette å observere fra offentlig gate.',interpretation_boundary:'Gavlene kan ikke behandles som urørte originaler fra 1641; formen ble tilbakeført gjennom senere restaureringsarbeid.',source_urls:['https://www.oslo.kommune.no/natur-kultur-og-fritid/kunst-og-kultur/kultureiendommer/gamle-radhus/']},
        {title:'Rådhussalen som scene',observation:'Den historiske salen brukes i dag som scene- og arrangementsrom, slik Sceneweb dokumenterer.',interpretation_boundary:'Dagens scenevirksomhet er et nytt brukslag og skal ikke projiseres tilbake på rådhus-, kirke- eller Høyesterettsperiodene.',source_urls:['https://sceneweb.no/nb/venue/31901/Gamle_Raadhus%20Scene%20%2F%20R%C3%A5dhussalen%2C%20Oslo','https://www.oslo.kommune.no/natur-kultur-og-fritid/kunst-og-kultur/kultureiendommer/gamle-radhus/']}
      ],
      source_urls:['https://www.oslo.kommune.no/natur-kultur-og-fritid/kunst-og-kultur/kultureiendommer/gamle-radhus/','https://sceneweb.no/nb/venue/31901/Gamle_Raadhus%20Scene%20%2F%20R%C3%A5dhussalen%2C%20Oslo'],verified_at:VERIFIED_AT
    }
  }
};

const read = relative => JSON.parse(fs.readFileSync(path.join(ROOT, relative), 'utf8'));
const write = (relative, value) => fs.writeFileSync(path.join(ROOT, relative), `${JSON.stringify(value, null, 2)}\n`);
function addExternalLink(place,label,url){
  const field=Array.isArray(place.externalLinks)?'externalLinks':Array.isArray(place.external_links)?'external_links':'externalLinks';
  place[field] ||= [];
  const existing=place[field].find(row=>row?.url===url);
  if(existing){ if(!String(existing.label||existing.title||existing.name||'').trim()) existing.label=label; return; }
  place[field].push({type:'source',label,url,verifiedAt:VERIFIED_AT});
}
const registry=read(REGISTRY_FILE); registry.placeLinks ||= {};
for(const [relative,target] of Object.entries(targets)){
  const place=read(relative);
  if(!place?.id) throw new Error(`${relative}: missing id`);
  if(place.fagverk?.status==='curated') throw new Error(`${place.id}: already curated; refusing overwrite`);
  for(const [label,url] of target.sources) addExternalLink(place,label,url);
  place.fagverk=target.fagverk;
  registry.placeLinks[place.id]={sourceFile:relative.replace(/^data\//u,''),field:'fagverk',schema:target.fagverk.schema,level:target.fagverk.level,status:target.fagverk.status};
  write(relative,place); console.log(`Curated Fagverk: ${place.id}`);
}
write(REGISTRY_FILE,registry); console.log('Indexed four central-city Fagverk packages');
