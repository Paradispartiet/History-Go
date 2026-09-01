#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const VERIFIED_AT = '2026-09-01';
const REGISTRY_FILE = 'data/fagverk/fagverk_registry.json';

const targets = {
  'data/places/historie/oslo/places_historie/ekebergparken_museum.json': {
    sources: [
      ['Ekebergparken – Museum & Gift Shop','https://ekebergparken.com/en/visit-us/museum-and-shop'],
      ['VisitNorway / VisitOSLO – Ekebergparken Museum','https://www.visitnorway.com/listings//ekebergparken-museum/173210/'],
      ['Ekebergparken – kulturminner','https://ekebergparken.com/kulturminner']
    ],
    fagverk: {
      schema:'history_go_place_fagverk_v2',level:'standard',status:'curated',
      intro:'Ekebergparken Museum viser hvordan et historisk hus kan være både kilde og formidlingsmaskin. Lunds villa har hatt flere bruksfaser, mens museet i dag velger, ordner og tolker gjenstander og fortellinger fra et langt større Ekeberg-område. Derfor må bygningens egen historie skilles fra historiene utstillingen presenterer.',
      article:[
        'Lunds hus ble oppført som privat villa i 1891 og har senere vært kommunal eiendom, brukt under okkupasjonen og ombygd til leiligheter før rehabiliteringen som museum. Disse bruksskiftene gjør selve bygningen til et materielt historisk spor. Fasade og rom kan observeres, men detaljene i hvem som brukte huset når må hentes fra daterte kilder.',
        'Da huset åpnet som museum i 2013 fikk det en ny rolle som formidler av Ekebergs kulturhistorie og natur. Arkeologiske funn, fotografier og andre objekter ordnes i en valgt utstilling. En museumssamling er derfor ikke et nøytralt utsnitt av fortiden: innsamling, bevaring, katalogisering og kuratering bestemmer hva publikum møter og hvilke sammenhenger som framstår som viktige.',
        'Museet må også avgrenses fra skulpturparken og helleristningsfeltet. Lunds hus kan forklare og vise materiale fra området, men overtar ikke identiteten eller kildegrunnlaget til de andre stedene. En presis faglig lesning sammenligner derfor bygningen, utstillingen og de separate kulturminnene uten å gjøre dem til én og samme historiske arena.'
      ],
      subject_ids:['historie'],emne_ids:['em_his_museum_samling_kanon','em_his_spor_materialitet'],chapter_ids:['minne_kulturarv_historiebruk','kilder_arkiv_spor'],
      lenses:[
        {id:'ekeberg-museum-hus-som-kilde',title:'Villaen som historisk kilde',prompt:'Hvordan kan Lunds hus undersøkes som materialspor etter skiftende bruk uten å lese dagens museumsfunksjon bakover i tid?',subject_id:'historie',emne_id:'em_his_spor_materialitet',evidence:'Skill observerbar arkitektur fra daterte kilder om privatbolig, okkupasjonsbruk, kommunale leiligheter og museum.'},
        {id:'ekeberg-museum-kanon',title:'Museet velger og ordner',prompt:'Hvordan påvirker innsamling, utvalg og utstillingsdesign hvilke deler av Ekebergs historie som blir mest synlige?',subject_id:'historie',emne_id:'em_his_museum_samling_kanon',evidence:'Studer hva som er stilt ut, hvordan objektene grupperes og hvilke kildeopplysninger som følger dem.'},
        {id:'ekeberg-museum-stedsgrense',title:'Museum er ikke hele parken',prompt:'Hvorfor må museumsbygningen skilles fra Ekebergparken og helleristningsfeltet selv når utstillingen formidler dem?',subject_id:'historie',emne_id:'em_his_museum_samling_kanon',evidence:'Sammenlign de canonicale stedsgrensene og bruk museet som formidlingssted, ikke som erstatning for de andre stedene.'},
        {id:'ekeberg-museum-gjenstand',title:'Gjenstand og kontekst',prompt:'Hva mister en arkeologisk gjenstand dersom funnsted, datering og dokumentasjon ikke følger med i museumsmonteren?',subject_id:'historie',emne_id:'em_his_spor_materialitet',evidence:'Koble objektets synlige materiale til museets opplysninger om proveniens, datering og Ekeberg-kontekst.'}
      ],
      guiding_questions:['Hva ved Lunds hus kan observeres direkte som historisk materialspor i dag?','Hvordan skiller bygningens egne bruksfaser seg fra historiene museet formidler?','Hvorfor er en museumssamling et kuratert utvalg og ikke hele fortiden?','Hva må dokumenteres før en gjenstand kan brukes som kilde til Ekebergs historie?','Hvorfor må museet, skulpturparken og helleristningsfeltet holdes som separate steder?'],
      concepts:['museumskanon','kuratering','proveniens','materialspor','bruksskifte','utstilling','kildekontekst','stedseierskap'],
      observable_traces:[
        {title:'Lunds villa som museumsbygg',observation:'Den historiske villaformen er fortsatt lesbar i bygningen som i dag rommer museum og butikk.',interpretation_boundary:'Arkitekturen dokumenterer et eldre bygg, men ikke alene de daterte bruksfasene eller hvem som bodde og arbeidet der.',source_urls:['https://ekebergparken.com/en/visit-us/museum-and-shop']},
        {title:'Utstillingsmonter med Ekeberg-funn',observation:'Museet presenterer arkeologiske og kulturhistoriske objekter fra det større Ekebergområdet i kuraterte sammenstillinger.',interpretation_boundary:'Monteren viser et utvalg og må leses sammen med opplysninger om funnsted, datering og dokumentasjon.',source_urls:['https://ekebergparken.com/kulturminner']}
      ],
      source_urls:['https://ekebergparken.com/en/visit-us/museum-and-shop','https://www.visitnorway.com/listings//ekebergparken-museum/173210/','https://ekebergparken.com/kulturminner'],verified_at:VERIFIED_AT
    }
  },
  'data/places/historie/oslo/places_historie/ekeberg_helleristninger.json': {
    sources:[
      ['Riksantikvaren – objekt 41907-1','https://api.ra.no/LokaliteterEnkeltminnerOgSikringssoner/collections/lokaliteter/items/41907-1?f=json'],
      ['Kulturminnesøk – lokalitet 41907','https://kulturminnesok.no/ra/lokalitet/41907'],
      ['Ekebergparken – kulturminner','https://ekebergparken.com/kulturminner'],
      ['Lokalhistoriewiki – Familiedalen','https://lokalhistoriewiki.no/wiki/Helleristningene_i_Familiedalen']
    ],
    fagverk:{
      schema:'history_go_place_fagverk_v2',level:'standard',status:'curated',
      intro:'Helleristningene på Ekeberg er et sted der usikkerhet er en del av kunnskapen. Figurene kan registreres fysisk, men datering og betydning bygger på arkeologiske metoder, sammenligning og tolkning. Fagverket skal derfor lære forskjellen mellom det som faktisk er hogd i berget, det som er dokumentert av arkeologer, og forklaringer som fortsatt er hypoteser.',
      article:[
        'Det registrerte feltet i Familiedalen består av tretten figurer i bergflaten, blant annet dyrefigurer, en menneskefigur og en fuglefigur. Riksantikvarens geometri og registrering avgrenser kulturminnet tydelig fra resten av Ekeberg. Motivenes form kan beskrives, men linjer inne i dyrekropper eller artsbestemmelser kan ikke automatisk oversettes til sikre fortellinger om jakt, ritual eller samfunn.',
        'Dateringen illustrerer arkeologisk kronologi. Åpne formidlingskilder oppgir forskjellige aldersanslag, mens registeret holder identiteten på steinaldernivå. Strandlinje, stil og sammenligningsmateriale kan gi intervaller og relative dateringer, men ikke et signert kalenderår. Det tekniske årstallet i kartdata må derfor aldri behandles som eksakt tilblivelsesdato.',
        'Feltets oppdagelse i 1915 viser også hvordan arkeologisk kunnskap produseres over tid. Nye observasjoner, dokumentasjonstegninger og registreringer har gjort flere figurer lesbare. Samtidig påvirker lys, fuktighet, naturlige sprekker og moderne oppmerking hva øyet ser. En god feltlesning er skånsom og skiller bergflaten fra senere dokumentasjon og tolkning.'
      ],
      subject_ids:['historie'],emne_ids:['em_his_arkeologisk_datering_kronologi','em_his_arkeologisk_landskap_miljo','em_his_arkeologisk_kontekst_formation'],chapter_ids:['forhistorie_arkeologi','kilder_arkiv_spor'],
      lenses:[
        {id:'ekeberg-ristning-datering',title:'Datering som intervall',prompt:'Hvordan kan arkeologer datere helleristninger når feltet ikke har et sikkert skriftlig årstall?',subject_id:'historie',emne_id:'em_his_arkeologisk_datering_kronologi',evidence:'Sammenlign register, strandlinje, stil og formidlingskilder og behold sprikende dateringsanslag som del av resultatet.'},
        {id:'ekeberg-ristning-kontekst',title:'Figur uten fortelling',prompt:'Hva kan motivene dokumentere sikkert, og hvor begynner tolkningen av handling, ritual og mening?',subject_id:'historie',emne_id:'em_his_arkeologisk_kontekst_formation',evidence:'Start med registrert form, plassering og relasjon mellom linjer før mulige betydninger vurderes.'},
        {id:'ekeberg-ristning-landskap',title:'Bergkunst i landskapet',prompt:'Hvorfor er bergflate, høyde og tidligere strandlinjer relevante når helleristningsfeltet skal forstås historisk?',subject_id:'historie',emne_id:'em_his_arkeologisk_landskap_miljo',evidence:'Koble feltets lokalisering til landskaps- og dateringskilder uten å anta at dagens terreng er identisk med steinalderens.'},
        {id:'ekeberg-ristning-dokumentasjon',title:'Det øyet ser og registeret vet',prompt:'Hvordan påvirker lys, sprekker og moderne oppmerking forskjellen mellom feltobservasjon og arkeologisk dokumentasjon?',subject_id:'historie',emne_id:'em_his_arkeologisk_kontekst_formation',evidence:'Sammenlign egne skånsomme observasjoner med Riksantikvarens registrering og dokumenterte figurantall.'}
      ],
      guiding_questions:['Hvorfor bør dateringen uttrykkes som et anslag eller intervall i stedet for ett år?','Hva kan de tretten registrerte figurene fortelle sikkert om selve bergflaten?','Hvor går grensen mellom motivbeskrivelse og en tolkning av hva ristningene betydde?','Hvordan kan landskapet bidra til arkeologisk datering uten å bli et eksakt ur?','Hvorfor skal moderne oppmerking og lysforhold skilles fra de opprinnelige hogde linjene?'],
      concepts:['arkeologisk datering','relativ kronologi','bergkunst','kontekst','landskap','materialspor','tolkningsgrense','kulturminnevern'],
      observable_traces:[
        {title:'Registrerte figurer i bergflaten',observation:'Dyre-, menneske- og fuglefigurer er fysisk registrert i den avgrensede bergflaten.',interpretation_boundary:'Motivform kan dokumenteres, men symbolsk mening, ritual og konkrete hendelser kan ikke fastslås fra linjene alene.',source_urls:['https://api.ra.no/LokaliteterEnkeltminnerOgSikringssoner/collections/lokaliteter/items/41907-1?f=json','https://kulturminnesok.no/ra/lokalitet/41907']},
        {title:'Sprekker og moderne markering',observation:'Naturlige sprekker og nyere fargemarkeringer kan være synlige sammen med de hogde linjene.',interpretation_boundary:'Det som er lett synlig i dag er ikke nødvendigvis opprinnelig bergkunst; registreringen må brukes for å skille lagene.',source_urls:['https://ekebergparken.com/kulturminner']}
      ],
      source_urls:['https://api.ra.no/LokaliteterEnkeltminnerOgSikringssoner/collections/lokaliteter/items/41907-1?f=json','https://kulturminnesok.no/ra/lokalitet/41907','https://ekebergparken.com/kulturminner','https://lokalhistoriewiki.no/wiki/Helleristningene_i_Familiedalen'],verified_at:VERIFIED_AT
    }
  },
  'data/places/sport/europa/norway/oslo_sport/daelenenga_idrettspark.json': {
    sources:[
      ['Oslo kommune – Dælenenga idrettsplass','https://www.oslo.kommune.no/natur-kultur-og-fritid/idrett/idrettsanlegg/dalenenga-idrettsplass/'],
      ['Oslo byleksikon – Dælenenga idrettsplass','https://oslobyleksikon.no/side/D%C3%A6lenenga_idrettsplass'],
      ['Oslo kommune – Grünerhallen','https://www.oslo.kommune.no/natur-kultur-og-fritid/idrett/idrettsanlegg/grunerhallen/'],
      ['Grüner IL – klubbhistorie','https://fotball.gruner.no/next/p/97414/historien-om-gr%C3%BBner-il']
    ],
    fagverk:{
      schema:'history_go_place_fagverk_v2',level:'standard',status:'curated',
      intro:'Dælenenga idrettspark viser at en idrettsarena ikke er én uforanderlig bane. Fotball, friidrett, velodrom, speedway, isidretter og dagens hallbruk har fulgt hverandre i samme område. Faglig analyse må skille dagens anleggsdeler fra tidligere idretter som bare kan rekonstrueres gjennom kilder.',
      article:[
        'Dælenenga åpnet i 1916 som fotball- og friidrettsanlegg på et tidligere leireuttak. Senere kom velodrom, speedway og vinteridrett. Under vinter-OL i 1952 ble det spilt ishockey og oppvisningsbandy her. Samme område har dermed vært tilpasset ulike idretter gjennom tid, men det betyr ikke at alle anleggsformene er fysisk bevart samtidig.',
        'Klubbhistorien er like viktig som banen. Grüner ble dannet i 1952 gjennom sammenslåing av flere lokale lag, og kildene viser forbindelser til både ordinær konkurranseidrett og Arbeidernes Idrettsforbund. Breddeidrett skapes derfor gjennom organisasjoner, frivillighet og tilgang til anlegg, ikke bare gjennom selve spilleflaten.',
        'I dag kan hovedbanen, klubbhuset og Grünerhallen observeres som ulike komponenter. Velodromen og speedwaybanen er derimot historiske lag som krever bilder og dokumentasjon. Stedet trener dermed forskjellen mellom nåværende arena, organisasjonshistorie og tidligere konkurranseformat.'
      ],
      subject_ids:['sport'],emne_ids:['em_sport_arena_samling','em_sport_breddeidrett'],chapter_ids:['arenaer-steder-groundhopper','klubber-lag-frivillighet'],
      lenses:[
        {id:'daelenenga-arenaendring',title:'Arenaen skifter idrett',prompt:'Hvordan kan samme idrettspark gå fra velodrom og speedway til kunstgress og ishall uten å være samme anlegg i alle perioder?',subject_id:'sport',emne_id:'em_sport_arena_samling',evidence:'Følg daterte anleggsendringer og skill dagens komponenter fra historiske baner som ikke lenger finnes.'},
        {id:'daelenenga-bredde',title:'Breddeidrett som organisasjon',prompt:'Hva viser klubbsammenslåingene om hvordan lokal breddeidrett bygges av flere lag, frivillige og anlegg over tid?',subject_id:'sport',emne_id:'em_sport_breddeidrett',evidence:'Bruk Grüner ILs dokumenterte klubbhistorie og skill organisasjonen fra selve idrettsparken.'},
        {id:'daelenenga-ol',title:'Lokal arena og OL',prompt:'Hvordan kan en lokal østkantarena inngå i et internasjonalt mesterskap uten å bli definert bare av OL-sporet?',subject_id:'sport',emne_id:'em_sport_arena_samling',evidence:'Plasser 1952-kampene i den lengre tidslinjen for fotball, sykkel, speedway og hverdagsidrett.'},
        {id:'daelenenga-felt',title:'Synlige og forsvunne anlegg',prompt:'Hvilke deler av idrettshistorien kan observeres fysisk i dag, og hvilke krever historiske kilder for å bli synlige?',subject_id:'sport',emne_id:'em_sport_arena_samling',evidence:'Sammenlign hovedbanen og Grünerhallen med kilder om den tidligere velodromen og speedwaybanen.'}
      ],
      guiding_questions:['Hvordan har Dælenengas anleggsform endret seg når nye idretter har overtatt plassen?','Hva kan dagens kunstgress og ishall fortelle om tidligere velodrom og speedway?','Hvordan henger klubbsammenslåinger sammen med utviklingen av lokal breddeidrett?','Hvorfor er OL-kampene i 1952 bare ett lag i stedets lange idrettshistorie?','Hva må dokumenteres før et forsvunnet idrettsanlegg kan rekonstrueres historisk?'],
      concepts:['idrettsarena','breddeidrett','klubborganisering','flerbruk','anleggsendring','arbeideridrett','velodrom','speedway','olympisk spor'],
      observable_traces:[
        {title:'Hovedbanen og Grünerhallen',observation:'Kunstgressbanen og ishallen er to tydelige nåværende komponenter i samme idrettspark.',interpretation_boundary:'Dagens anlegg viser nåværende funksjoner, men kan ikke brukes som direkte bilde av velodrom- eller speedwayperiodene.',source_urls:['https://www.oslo.kommune.no/natur-kultur-og-fritid/idrett/idrettsanlegg/dalenenga-idrettsplass/','https://www.oslo.kommune.no/natur-kultur-og-fritid/idrett/idrettsanlegg/grunerhallen/']},
        {title:'Klubbhuset som eldre anleggsdel',observation:'Klubbhuset markerer en eldre fysisk del av idrettsanlegget ved siden av nyere hall- og baneinfrastruktur.',interpretation_boundary:'Bygningen kan observeres, men arkitekt, byggeår og historisk bruk må knyttes til dokumenterte kilder.',source_urls:['https://oslobyleksikon.no/side/D%C3%A6lenenga_idrettsplass']}
      ],
      source_urls:['https://www.oslo.kommune.no/natur-kultur-og-fritid/idrett/idrettsanlegg/dalenenga-idrettsplass/','https://oslobyleksikon.no/side/D%C3%A6lenenga_idrettsplass','https://www.oslo.kommune.no/natur-kultur-og-fritid/idrett/idrettsanlegg/grunerhallen/','https://fotball.gruner.no/next/p/97414/historien-om-gr%C3%BBner-il'],verified_at:VERIFIED_AT
    }
  },
  'data/places/naeringsliv/oslo/places_naeringsliv/myrens_verksted.json': {
    sources:[
      ['Store norske leksikon – Myrens Verksted','https://snl.no/Myrens_Verksted'],
      ['Oslo byleksikon – Myrens Verksted','https://oslobyleksikon.no/side/Myrens_Verksted'],
      ['Myren Eiendom – om Myrens Verksted','https://myreneiendom.no/om-myrens-verksted/'],
      ['Industrimuseum – Myrens Verksted A/S','https://industrimuseum.no/bedrifter/myrensverksteda_s']
    ],
    fagverk:{
      schema:'history_go_place_fagverk_v2',level:'full',status:'curated',
      intro:'Myrens Verksted gjør leverandørindustrien synlig: bedriften produserte maskiner som andre fabrikker brukte til å produsere sine varer. Stedet kan derfor analyseres gjennom arbeid, teknologi, verdikjeder, eierskap og omstilling. De bevarte fabrikkhallene viser samtidig at bygningskontinuitet ikke betyr at den industrielle virksomheten fortsatte.',
      article:[
        'Myrens ble grunnlagt av Jens Jacob og Andreas Jensen i 1848 og flyttet til Myraløkka ved Akerselva i 1854. Verkstedet utviklet turbiner, dampmaskiner, kjeler og maskiner for sagbruk og treforedling. Dette var kapitalutstyr: produksjonen fikk verdi fordi maskinene inngikk i andre bedrifters produksjonsprosesser.',
        'Verdikjeden er derfor avgjørende for å forstå stedet. En turbin kunne levere kraft, mens sag- og høvlemaskiner bearbeidet trevirke hos kunder. Senere utvidet Myrens markedet mot fiske- og celluloseindustrien. Produksjonsvolum, eksport og ansatte må leses sammen med hvilke markeder og kundebedrifter verkstedet faktisk betjente.',
        'Teknologisk kompetanse og arbeidsorganisering var stedbundne ressurser. Maskinene krevde tegning, støping, bearbeiding, montering og testing, men dagens teglhaller viser ikke hele denne arbeidsdelingen. Fysiske spor må derfor kombineres med maskinobjekter, bedriftskilder og dokumentasjon av ansatte og produktlinjer.',
        'Kværner kjøpte Myrens i 1928, og eksportandelen ble senere høy. Nedleggelsen i Oslo i 1988 var likevel mer enn et eierskifte: produksjon og arbeidsplasser ble flyttet eller avviklet, mens bygningene ble stående. Omstilling må derfor analyseres både fra bedriftens perspektiv og fra arbeidernes og områdets perspektiv.',
        'Etter industrinedleggelsen er anlegget ombrukt til kontorer, medier, trening, klatring, servering og andre tjenester. Dagens bruk dokumenterer eiendoms- og tjenesteøkonomi i de gamle hallene, men den beviser ikke at overgangen var økonomisk eller sosialt vellykket for alle berørte. Stedet lar oss skille materiell bevaring fra kontinuitet i virksomhet, kompetanse og arbeidsliv.'
      ],
      subject_ids:['naeringsliv'],emne_ids:['em_naering_arbeid_verdiskaping','em_naering_industri_og_mekanisering','em_naering_produksjon_produktivitet','em_naering_logistikk_verdikjeder','em_naering_omstilling_kriser_skift'],chapter_ids:['arbeid-produksjon-verdiskaping','logistikk-infrastruktur-okonomisk-rom'],
      lenses:[
        {id:'myrens-leverandorindustri',title:'Maskiner som muliggjør annen produksjon',prompt:'Hvordan skiller en maskinleverandør som Myrens seg fra fabrikker som produserer varer direkte for forbrukere?',subject_id:'naeringsliv',emne_id:'em_naering_logistikk_verdikjeder',evidence:'Følg turbiner og trebearbeidingsmaskiner videre til kundebedriftenes produksjonsprosesser.'},
        {id:'myrens-produktivitet',title:'Produksjon og produktivitet',prompt:'Hvilke data trengs for å si noe om produktivitet utover bare antall ansatte eller eksportandel?',subject_id:'naeringsliv',emne_id:'em_naering_produksjon_produktivitet',evidence:'Skill produksjonsvolum, arbeidsinnsats, verdi og salg fra hverandre før effektivitet vurderes.'},
        {id:'myrens-mekanisering',title:'Mekanisering som kompetanse',prompt:'Hvordan gjorde verkstedets tekniske kunnskap og maskinbygging mekanisering mulig i andre norske industribedrifter?',subject_id:'naeringsliv',emne_id:'em_naering_industri_og_mekanisering',evidence:'Bruk dokumenterte maskintyper og kundebehov fremfor generelle påstander om industrialisering.'},
        {id:'myrens-omstilling',title:'Nedleggelse og ombruk',prompt:'Hva er forskjellen mellom at industribygningene overlever og at den industrielle virksomheten og arbeidsplassene fortsetter?',subject_id:'naeringsliv',emne_id:'em_naering_omstilling_kriser_skift',evidence:'Sammenlign nedleggelsen i 1988 med senere eiendoms- og tjenestebruk av anlegget.'},
        {id:'myrens-arbeid',title:'Arbeidet bak maskinene',prompt:'Hvilke typer fagarbeid og organisering må ha vært til stede for å utvikle, bygge og levere komplekst kapitalutstyr?',subject_id:'naeringsliv',emne_id:'em_naering_arbeid_verdiskaping',evidence:'Koble maskinobjekter og produktlinjer til dokumentert bedrifts- og arbeidslivshistorie uten å dikte detaljer om enkeltarbeidere.'}
      ],
      guiding_questions:['Hvorfor bør Myrens forstås som leverandørindustri og ikke bare som en fabrikk ved Akerselva?','Hvordan inngikk turbiner og trebearbeidingsmaskiner i andre bedrifters verdikjeder?','Hvilke kilder trengs for å skille høy eksportandel fra faktisk produktivitet og lønnsomhet?','Hva gikk tapt da industriproduksjonen i Oslo ble lagt ned i 1988?','Hvordan kan dagens ombruk studeres uten å forveksle bygningsbevaring med kontinuitet i arbeidslivet?'],
      concepts:['leverandørindustri','kapitalutstyr','verdikjede','mekanisering','produktivitet','fagarbeid','eksport','omstilling','industrinedleggelse','ombruk'],
      observable_traces:[
        {title:'Teglhaller og industrivinduer',observation:'Bevarte teglfasader, store vindusfelt og hallvolumer gjør den tidligere industribyggingen fysisk lesbar.',interpretation_boundary:'Bygningsformen dokumenterer industriell materialitet, men ikke alene hvilke maskiner som sto hvor eller hvordan arbeidet var organisert.',source_urls:['https://oslobyleksikon.no/side/Myrens_Verksted','https://myreneiendom.no/om-myrens-verksted/']},
        {title:'Autentisk M-merke på fasaden',observation:'M-merket og årstallet i fasaden er bevart som et synlig identitetsspor fra industrimiljøet.',interpretation_boundary:'Merket dokumenterer virksomhetsidentitet og bygning, men er ikke mål på produksjonsomfang eller dagens selskapsstruktur.',source_urls:['https://snl.no/Myrens_Verksted','https://industrimuseum.no/bedrifter/myrensverksteda_s']}
      ],
      source_urls:['https://snl.no/Myrens_Verksted','https://oslobyleksikon.no/side/Myrens_Verksted','https://myreneiendom.no/om-myrens-verksted/','https://industrimuseum.no/bedrifter/myrensverksteda_s'],verified_at:VERIFIED_AT
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
write(REGISTRY_FILE,registry); console.log('Indexed four Ekeberg/Myrens Fagverk packages');
