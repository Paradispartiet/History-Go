#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const readJson = (p) => JSON.parse(fs.readFileSync(path.join(root, p), 'utf8'));
const writeJson = (p, value, pretty = true) => {
  const full = path.join(root, p);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, `${JSON.stringify(value, null, pretty ? 2 : 0)}\n`);
};
const readText = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const writeText = (p, value) => fs.writeFileSync(path.join(root, p), value);
const uniq = (values) => [...new Set(values)];

const PEOPLE_PATH = 'data/people/religion/vestland/etne/people_etne_religion_rounds_batch1.json';
const PEOPLE_MANIFEST_ENTRY = 'people/religion/vestland/etne/people_etne_religion_rounds_batch1.json';
const STORY_PATH = 'data/stories/stories_etne_religion_rounds_batch1.json';
const LEKSIKON_PATH = 'data/leksikon/places/vestland/etne/religion/leksikon_etne_religion_rounds_batch1.json';

const placeConfigs = {
  etne_kyrkje: {
    path: 'data/places/religion/vestland/etne/etne_kyrkje/etne_kyrkje.json',
    person: {
      id: 'etne_kyrkjelydsmiljoet', name: 'Kyrkjelydsmiljøet i Etne kyrkje', initials: 'EK',
      kind: 'kollektivt_trusmiljoanker', year: 2013,
      desc: 'Kollektivt trosmiljøanker for gudstenester, trusopplæring og kyrkjelydsarbeid i den moderne Etne kyrkje.',
      popupDesc: 'Dette kortet representerer kyrkjelyden og aktivitetane som kollektivt miljø ved Etne kyrkje. Det er ikkje ein biografi over namngitte prestar, tilsette, frivillige eller deltakarar. Ankret blir brukt fordi dei offisielle kjeldene dokumenterer eit aktivt tros- og opplæringsmiljø, medan personbesetninga kan skifte over tid.'
    },
    relationType: 'kollektivt_trusmiljo_ved_staden',
    works: [
      ['etne_kyrkje_teken_i_bruk_2013','Soknekyrkja teken i bruk i 2013','kyrkjebygg','modern_parish_church',2013,'Den moderne Etne kyrkje vart teken i bruk i 2013.','Årstalet skil dagens kyrkje frå eldre kyrkjestader og historiske kyrkjebygg i kommunen.'],
      ['etne_kyrkje_gudstenester','Gudstenester i den aktive soknekyrkja','rituell_praksis','parish_worship',null,'Kyrkja er i aktiv bruk til gudstenester.','Gudstenestene gjer bygget til eit levande trosrom, ikkje berre eit arkitektonisk objekt.'],
      ['etne_kyrkje_trusopplaering','Trusopplæring og konfirmantarbeid','opplaering','faith_education',null,'Offisiell informasjon knyter trusopplæring og konfirmantarbeid til kyrkjelyden.','Opplæringsarbeidet viser korleis kyrkja fungerer gjennom heile året og på tvers av aldersgrupper.'],
      ['etne_kyrkje_babysong_krik','Babysong og KRIK','kyrkjelydsaktivitet','children_and_youth_activity',null,'Born- og unge-tilbodet omfattar mellom anna babysong og KRIK.','Tilboda konkretiserer kyrkja som lokal møteplass for born, unge og familiar.']
    ],
    forNa: {
      before: 'Før 2013 fanst ikkje dagens moderne soknekyrkjebygg på Enge 5 som fysisk ramme for kyrkjelydsarbeidet.',
      now: 'Etne kyrkje er ei aktiv soknekyrkje for gudstenester, konfirmantarbeid, babysong, KRIK og anna kyrkjelydsarbeid.',
      change: 'Eit nytt kyrkjebygg frå 2013 gav det lokale troslivet ei moderne og samla fysisk ramme i Etne sentrum.'
    },
    nature: {
      type: 'tettstad / kyrkjegrunn / nærmiljø', title: 'Kyrkja i tettstaden',
      summary: 'Natur-rundinga les utearealet og plasseringa ved Enge 5 som del av eit tettstadsmiljø. Ho dokumenterer ikkje artar som kjeldene ikkje omtaler.',
      themes: ['kyrkjegrunn i Etne sentrum','overgang mellom kyrkjebygg og nærmiljø','uteareal rundt eit aktivt trossted','tettstad og lokal ferdsel'],
      nearby_place_ids: ['etnesjoen_tettstad','etne_tinghus','etne_prestebustad']
    },
    civication: [
      ['etne_kyrkje_2013_byggkort','Byggkortet 2013','kyrkjebyggkort','Eit fysisk samlarkort som skil den moderne soknekyrkja frå eldre kyrkjestader i Etne.','Året 2013 og funksjonen som aktiv soknekyrkje er den dokumenterte identiteten til Etne kyrkje.'],
      ['etne_kyrkje_aktivitetskalender','Aktivitetskalenderen for kyrkjelyden','ritual_og_opplaeringskort','Ein fysisk minikalender med gudsteneste, konfirmantarbeid, babysong og KRIK som fire dokumenterte aktivitetstypar.','Kombinasjonen av gudsteneste og trusopplæring viser korleis akkurat Etne kyrkje blir brukt som levande trossted.']
    ],
    brands: [
      ['etne_kyrkjelege_fellesrad','Etne kyrkjelege fellesråd','religious_governance','official_church_council'],
      ['etne_kyrkjelyd','Etne kyrkjelyd','parish_community','local_parish'],
      ['krik_etne','KRIK i Etne','children_and_youth_activity','documented_parish_activity']
    ],
    story: {
      id: 'st_etne_kyrkje_nytt_trosrom_2013', type: 'modern_parish_church_opening', title: 'Eit nytt trosrom i 2013', year: 2013,
      summary: 'Då Etne kyrkje vart teken i bruk i 2013, fekk gudstenester og trusopplæring ei ny fysisk ramme i sentrum.',
      story: 'Etne kyrkje er ikkje ei middelalderkyrkje og heller ikkje eit historisk kyrkjestadsanker. Ho er den moderne soknekyrkja på Enge 5, teken i bruk i 2013. Det året er den avgjerande episoden i staden si eiga historie: eit nytt bygg vart den fysiske ramma for eit allereie levande lokalt trosliv.\n\nDen offisielle kyrkjeinformasjonen viser at bygget blir brukt til gudstenester og kyrkjelydsarbeid. Born- og unge-tilbodet gjer bruken meir konkret gjennom konfirmantarbeid, babysong og KRIK. Staden er derfor både ritualrom, opplæringsarena og møteplass.\n\nI History Go blir kyrkjelyden representert som eit kollektivt miljø. Det hindrar at skiftande tilsette, frivillige eller deltakarar blir gjorde til permanente personankre utan eigne kjelder. Forteljinga handlar om den dokumenterte overgangen i 2013 og om funksjonane som framleis fyller bygget.'
    },
    article: {
      title: 'Etne kyrkje – moderne soknekyrkje og levande trosrom',
      popupDesc: 'Den moderne soknekyrkja på Enge 5 vart teken i bruk i 2013 og samlar gudstenester, trusopplæring og kyrkjelydsarbeid.',
      wikiText: [
        'Etne kyrkje ligg på Enge 5 i Etne sentrum og vart teken i bruk i 2013. Bygget skal derfor lesast som ei moderne soknekyrkje, ikkje som ei eldre middelalderkyrkje eller som eit generelt historisk kyrkjestadsanker.',
        'Offisiell informasjon frå Etne kyrkjelege fellesråd dokumenterer aktiv bruk til gudstenester og kyrkjelydsarbeid. Aktiviteten gjer bygget til eit levande heilagt rom der religiøs praksis skjer i notid.',
        'Born- og unge-arbeidet omfattar mellom anna konfirmantarbeid, babysong og KRIK. Desse aktivitetane viser korleis kyrkja kombinerer ritual, opplæring og sosialt fellesskap.',
        'People-rundinga bruker eit kollektivt kyrkjelydsmiljøanker. Det representerer den dokumenterte funksjonen utan å gjere skiftande eller ikkje-kjeldebelagde enkeltpersonar permanente.'
      ],
      facts: [['2013','Kyrkja vart teken i bruk i 2013.'],['Aktiv soknekyrkje','Staden blir brukt til gudstenester og kyrkjelydsarbeid.'],['Born og unge','Konfirmantarbeid, babysong og KRIK er dokumenterte aktivitetar.']],
      chronology: [[2013,'Kyrkja blir teken i bruk','Den moderne soknekyrkja på Enge 5 får sin noverande funksjon.'],[null,'Aktivt kyrkjelydsarbeid','Gudstenester, trusopplæring og aktivitetar held bygget i kontinuerleg bruk.']],
      related: ['etnesjoen_tettstad','etne_prestebustad']
    }
  },
  frette_kapell: {
    path: 'data/places/religion/vestland/etne/frette_kapell/frette_kapell.json',
    person: {
      id: 'frette_bedehus_og_kapellmiljoet', name: 'Bedehus- og kapellmiljøet på Frette', initials: 'FK',
      kind: 'kollektivt_trusmiljoanker', year: 1910,
      desc: 'Kollektivt trosmiljøanker for bygningen som vart reist som Betania bedehus i 1910 og vigsla som Frette kapell i 1959.',
      popupDesc: 'Kortet representerer det kollektive bedehus- og kapellmiljøet som har brukt bygningen på Frette. Det er ikkje ein biografi over namngitte forkynnarar, prestar eller deltakarar. Ankret held fast på den kjeldebelagde overgangen frå bedehus til kapell utan å konstruere enkeltpersonar.'
    },
    relationType: 'kollektivt_bedehus_og_kapellmiljo',
    works: [
      ['frette_betania_1910','Betania bedehus frå 1910','bedehus','prayer_house',1910,'Bygningen vart reist som Betania bedehus i 1910.','Dette er den første dokumenterte funksjonen og må haldast skild frå kapellfunksjonen.'],
      ['frette_eldre_stove_kjerne','Den eldre stova som bygningskjerne','bygningsspor','retained_building_core',null,'Den eldre bedehusstova vart bevart som kjerne i ombygginga.','Kjernen gjer kontinuiteten mellom 1910-bygget og dagens kapell fysisk lesbar.'],
      ['frette_ombygging_1959','Ombygginga til kyrkjeleg bruk','ombygging','chapel_conversion',1959,'Bygningen vart grundig ombygd til kyrkjeleg bruk i 1959.','Ombygginga endra funksjonen utan å slette den eldre bedehuskjernen.'],
      ['frette_vigsling_13_desember','Vigslinga 13. desember 1959','vigsling','chapel_consecration',1959,'Frette kapell vart vigsla 13. desember 1959.','Datoen markerer når kapellfunksjonen formelt tok til.']
    ],
    forNa: {
      before: 'Frå 1910 var bygningen Betania bedehus, med ei eldre stove som fysisk kjerne.',
      now: 'Bygningen er Frette kapell og blir lesen som eit kyrkjeleg bruksrom ved enden av Stordalsvatnet.',
      change: 'Den grundige ombygginga og vigslinga i 1959 endra funksjonen frå bedehus til kapell, men bevarte kontinuiteten i sjølve bygningen.'
    },
    nature: {
      type: 'bygdemiljø / innsjølandskap / kyrkjegrunn', title: 'Kapellet ved Stordalsvatnet',
      summary: 'Frette kapell ligg ved enden av Stordalsvatnet. Natur-rundinga avgrensar seg til dette dokumenterte landskapsforholdet og påstår ikkje ei artsinventering.',
      themes: ['enden av Stordalsvatnet','bygdemiljø på Frette','kyrkjebygg i innsjølandskap','overgang mellom tun og landskap'],
      nearby_place_ids: ['stordalsvatnet_etne','keisarhaugen_frette','driftevegen_stordalen_roldal']
    },
    civication: [
      ['frette_betania_1910_kort','Betania-kortet 1910','bedehuskort','Eit fysisk kort som viser bygningen sin første dokumenterte funksjon som bedehus.','Namnet Betania og året 1910 høyrer direkte til bygningshistoria på Frette.'],
      ['frette_vigslingskort_1959','Vigslingskortet 13. desember 1959','kapellkort','Eit fysisk datokort for vigslinga av Frette kapell.','Den presise vigslingsdatoen skil kapellfunksjonen frå bedehusperioden.']
    ],
    brands: [
      ['etne_kyrkjelege_fellesrad','Etne kyrkjelege fellesråd','religious_governance','official_church_council'],
      ['frette_kapellmiljo','Frette kapellmiljø','local_religious_community','chapel_community'],
      ['norges_kirker','Norges Kirker','heritage_reference','church_documentation']
    ],
    story: {
      id: 'st_frette_fra_betania_til_kapell_1959', type: 'prayer_house_to_chapel_conversion', title: 'Frå Betania til kapell', year: 1959,
      summary: 'Bygningen frå 1910 skifta funksjon då han vart ombygd og vigsla som Frette kapell 13. desember 1959.',
      story: 'Frette kapell begynte ikkje som kapell. Bygningen vart reist som Betania bedehus i 1910. Dette første tidslaget er avgjerande fordi det forklarer både den eldre bygningskjernen og den lokale bedehustradisjonen.\n\nI 1959 vart bygningen grundig ombygd til kyrkjeleg bruk. Den eldre stova vart ikkje berre erstatta; ho vart liggjande som kjerne i den nye løysinga. Dermed kan overgangen lesast som ombruk og funksjonsendring, ikkje som to heilt separate bygg.\n\nDen 13. desember 1959 vart kapellet vigsla. Denne dagen markerer episoden der Betania-bygget formelt fekk kapellfunksjon. History Go held derfor 1910 og 1959 tydeleg frå kvarandre: først bedehus, deretter ombygging og vigsling som kapell.'
    },
    article: {
      title: 'Frette kapell – frå Betania bedehus til kyrkjeleg bruksrom',
      popupDesc: 'Bygningen vart reist som Betania bedehus i 1910 og ombygd og vigsla som kapell i 1959.',
      wikiText: [
        'Frette kapell ligg ved enden av Stordalsvatnet. Bygningen vart reist som Betania bedehus i 1910, og denne opphavlege funksjonen er det første dokumenterte tidslaget.',
        'I 1959 vart bygningen grundig ombygd til kyrkjeleg bruk. Den eldre stova vart bevart som kjerne, slik at dagens kapell inneheld fysisk kontinuitet med bedehuset.',
        'Kapellet vart vigsla 13. desember 1959. Datoen markerer den formelle overgangen til kapellfunksjon og må ikkje flyttast tilbake til 1910.',
        'Staden viser korleis eit lokalt trosbygg kan skifte institusjonell funksjon gjennom ombygging, samtidig som delar av bygningen og miljøet held fram.'
      ],
      facts: [['1910','Betania bedehus vart reist i 1910.'],['1959','Bygningen vart ombygd til kyrkjeleg bruk.'],['13. desember','Kapellet vart vigsla 13. desember 1959.']],
      chronology: [[1910,'Betania bedehus blir reist','Bygningen får sin første dokumenterte funksjon.'],[1959,'Ombygging til kapell','Den eldre stova blir brukt som kjerne i ei grundig ombygging.'],[1959,'Vigsling 13. desember','Kapellfunksjonen blir formelt innvigd.']],
      related: ['stordalsvatnet_etne','keisarhaugen_frette']
    }
  },
  skanevik_kyrkje: {
    path: 'data/places/religion/vestland/etne/skanevik_kyrkje/skanevik_kyrkje.json',
    person: {
      id: 'skanevik_kyrkjelydsmiljoet', name: 'Kyrkjelydsmiljøet i Skånevik kyrkje', initials: 'SK',
      kind: 'kollektivt_trusmiljoanker', year: 1900,
      desc: 'Kollektivt trosmiljøanker for den aktive soknekyrkja i Skånevik, vigsla i 1900.',
      popupDesc: 'Dette kortet representerer kyrkjelyden og den aktive religiøse bruken av Skånevik kyrkje som kollektivt miljø. Det er ikkje ein biografi over namngitte prestar, tilsette eller deltakarar. Ankret held dagens kyrkje frå 1900 skild frå det eldre historiske kyrkjestadsankeret.'
    },
    relationType: 'kollektivt_trusmiljo_ved_staden',
    works: [
      ['skanevik_kyrkje_vigsla_1900','Kyrkja vigsla i 1900','kyrkjebygg','parish_church',1900,'Dagens Skånevik kyrkje vart vigsla i 1900.','Året identifiserer dagens bygg og skil det frå dei eldre kyrkjene på kyrkjestaden.'],
      ['skanevik_kyrkje_aktiv_soknekyrkje','Aktiv soknekyrkje','rituell_praksis','active_parish_use',null,'Bygget er den aktive soknekyrkja i Skånevik.','Den noverande bruken gjer staden til eit levande trosrom.'],
      ['skanevik_kyrkje_nord_for_eldre_stad','Nord for den eldre kyrkjestaden','stadskontinuitet','relocated_church_building',1900,'Dagens kyrkje står nord for området der eldre kyrkjer stod.','Plasseringa gjer skiljet mellom dagens bygg og det historiske kyrkjestadsankeret fysisk.'],
      ['skanevik_kyrkje_to_kartanker','To canonical kartanker','formidlingsspor','distinct_place_anchors',null,'History Go bruker eitt anker for dagens kyrkje og eitt for den eldre kyrkjestaden.','Skiljet hindrar at eit bygg frå 1900 blir framstilt som middelalderkyrkje.']
    ],
    forNa: {
      before: 'Før dagens kyrkje vart vigsla i 1900, låg dei eldre kyrkjene på det separate historiske kyrkjestadsområdet.',
      now: 'Skånevik kyrkje er den aktive soknekyrkja og står som eit eige bygg nord for den eldre kyrkjestaden.',
      change: 'Det religiøse stadsmiljøet heldt fram, men det noverande kyrkjebygget fekk ei ny fysisk plassering og ein eigen identitet frå 1900.'
    },
    nature: {
      type: 'bygdesentrum / kyrkjegrunn / fjordbygd', title: 'Kyrkja i Skånevik-miljøet',
      summary: 'Natur-rundinga les kyrkjegrunnen som del av Skånevik sitt bygde- og fjordmiljø. Ho avgrensar seg til dokumentert plassering og skaper ikkje udokumenterte artsfunn.',
      themes: ['kyrkjegrunn i Skånevik','plassering nord for eldre kyrkjestad','bygdesentrum og fjordmiljø','overgang mellom kyrkjebygg og nærmiljø'],
      nearby_place_ids: ['skanevik_kyrkjestad','skanevik_sentrum','skanevik_gjestgjevargarden']
    },
    civication: [
      ['skanevik_kyrkje_1900_byggkort','Byggkortet 1900','kyrkjebyggkort','Eit fysisk kort for dagens kyrkje med vigslingsåret 1900.','Året og dagens aktive funksjon skil dette objektet frå den eldre kyrkjestaden.'],
      ['skanevik_kyrkje_dobbeltanker_kart','Dobbeltankerkartet','stadskontinuitetskart','Eit fysisk foldekart som viser dagens kyrkje og den eldre kyrkjestaden som to separate punkt.','Kartet uttrykkjer det viktigaste kjeldekritiske skiljet i Skånevik sitt kyrkjemiljø.']
    ],
    brands: [
      ['etne_kyrkjelege_fellesrad','Etne kyrkjelege fellesråd','religious_governance','official_church_council'],
      ['skanevik_kyrkjelyd','Skånevik kyrkjelyd','parish_community','local_parish'],
      ['norges_kirker','Norges Kirker','heritage_reference','church_documentation']
    ],
    story: {
      id: 'st_skanevik_dagens_kyrkje_1900', type: 'parish_church_consecration_and_relocation', title: 'Dagens kyrkje frå 1900', year: 1900,
      summary: 'Vigslinga i 1900 etablerte dagens Skånevik kyrkje som eit eige bygg nord for den eldre kyrkjestaden.',
      story: 'Skånevik har både ei aktiv kyrkje og eit eldre kyrkjestadsanker. Dei to punkta fortel om same lokale troslandskap, men dei er ikkje same fysiske stad og skal ikkje blandast saman.\n\nDagens Skånevik kyrkje vart vigsla i 1900. Ho står nord for området der eldre kyrkjer hadde stått. Vigslinga markerer derfor både starten på det noverande bygget si bruk og ei fysisk forskyving innan det langvarige kyrkjemiljøet.\n\nHistory Go held dei to kartankera separate. Det gjer det mogleg å formidle kontinuitet utan å late som kyrkja frå 1900 er ei middelalderkyrkje. People-rundinga bruker eit kollektivt kyrkjelydsmiljø, fordi kjeldene dokumenterer den aktive funksjonen, ikkje ei stabil liste over enkeltpersonar.'
    },
    article: {
      title: 'Skånevik kyrkje – dagens soknekyrkje frå 1900',
      popupDesc: 'Dagens aktive kyrkje vart vigsla i 1900 og står fysisk skild frå den eldre kyrkjestaden.',
      wikiText: [
        'Skånevik kyrkje er dagens aktive soknekyrkje i bygda. Ho vart vigsla i 1900 og skal daterast og forståast ut frå dette byggestadiet.',
        'Kyrkja står nord for den eldre kyrkjestaden der tidlegare kyrkjer stod. Dagens bygg og det historiske kyrkjestadsankeret er derfor to separate fysiske punkt.',
        'Skiljet er kjeldekritisk viktig: lang religiøs kontinuitet i bygda betyr ikkje at dagens kyrkjebygg er frå mellomalderen.',
        'Som aktiv soknekyrkje er bygget framleis eit religiøst bruksrom. Det kollektive kyrkjelydsmiljøankeret representerer denne funksjonen utan å feste kortet til skiftande enkeltpersonar.'
      ],
      facts: [['1900','Dagens kyrkje vart vigsla i 1900.'],['Aktiv kyrkje','Bygget er den noverande soknekyrkja i Skånevik.'],['Separat stad','Kyrkja står nord for den eldre kyrkjestaden.']],
      chronology: [[null,'Eldre kyrkjer på kyrkjestaden','Tidlegare kyrkjer stod på det separate historiske kyrkjestadsområdet.'],[1900,'Dagens kyrkje blir vigsla','Det noverande kyrkjebygget tek til som aktiv soknekyrkje.'],[null,'Framleis aktiv bruk','Kyrkja fungerer som levande trosrom i Skånevik.']],
      related: ['skanevik_kyrkjestad','skanevik_sentrum']
    }
  }
};

function sourceObjects(place) {
  return (place.externalLinks || []).filter((x) => /^https?:\/\//.test(x.url || '')).map((x) => ({ title: x.label, url: x.url }));
}

function sourceUrls(place) { return sourceObjects(place).map((x) => x.url); }

const people = [];
const stories = [];
const articles = [];
const relationRows = [];

for (const [placeId, cfg] of Object.entries(placeConfigs)) {
  const place = readJson(cfg.path);
  const coordBefore = JSON.stringify([place.lat, place.lon, place.r, place.year, place.coordStatus, place.coordSource, place.coordType, place.coordNote]);
  const urls = sourceUrls(place);
  const sources = sourceObjects(place);

  place.underbadge_ids = ['trossteder_og_hellige_rom','ritualer_og_praksis','religionshistorie','kristendom'];
  place.works = cfg.works.map(([id,title,type,kind,year,desc,why_here]) => ({ id,title,type,kind,year,desc,why_here,source_urls:urls }));
  place.for_na = { title:'Før / nå', ...cfg.forNa, sources:urls };
  place.nature_profile = cfg.nature;
  place.civication_store = cfg.civication.map(([id,title,type,desc,placeSpecificReason], index) => ({
    id,title,type,kind:'physical_object',desc,placeSpecificReason,
    historicalFunction:index === 0 ? 'Gjer det viktigaste daterte stadslaget fysisk og samlebart.' : 'Gjer funksjonsskiftet eller stadsskiljet tydeleg utan å erstatte kjeldene.',
    physicalObject:true,placeSpecific:true,storePrice:index === 0 ? 30 : 25,currency:'PC',collection:placeId,collectable:true,source_urls:urls
  }));
  place.brands = cfg.brands.map(([id,name,brand_kind,brand_type]) => ({id,name,brand_kind,brand_type}));

  const coordAfter = JSON.stringify([place.lat, place.lon, place.r, place.year, place.coordStatus, place.coordSource, place.coordType, place.coordNote]);
  if (coordBefore !== coordAfter) throw new Error(`Coordinate contract changed for ${placeId}`);
  writeJson(cfg.path, place);

  people.push({
    id:cfg.person.id,name:cfg.person.name,initials:cfg.person.initials,kind:cfg.person.kind,desc:cfg.person.desc,
    tags:['religion','kristendom','etne','kollektivt_trusmiljoanker'],placeId,places:[placeId],category:'religion',year:cfg.person.year,
    period:'lokalt_kyrkjelyds_og_trusmiljo',popupDesc:cfg.person.popupDesc,image:'',cardImage:'',source_urls:urls,verifiedAt:'2026-07-27',
    visual:{designCode:'collective_local_faith_community_miniature'}
  });
  relationRows.push({
    id:`rel_${cfg.person.id}_${placeId}`,type:cfg.relationType,place:placeId,person:cfg.person.id,
    why:cfg.person.desc,source:urls[0]
  });

  stories.push({
    id:cfg.story.id,type:cfg.story.type,title:cfg.story.title,year:cfg.story.year,place_id:placeId,person_id:cfg.person.id,
    summary:cfg.story.summary,story:cfg.story.story,sources,tags:['religion','kristendom',placeId],related_people:[cfg.person.id],
    related_places:cfg.article.related,score:{narrative:4,historical:4,source:5,play_value:4,originality:4,total:21},
    arc:{start:cfg.story.summary,middle:'Bygget, funksjonen og tidslaga blir skilde med utgangspunkt i dei dokumenterte kjeldene.',end:'Staden blir lesen som eit levande trosrom med presis historisk avgrensing.'},
    next_scenes:cfg.article.related.slice(0,2).map((id) => ({place_id:id,reason:'Nærliggjande canonical stad som utdjupar landskapet eller det historiske skiljet.'}))
  });

  articles.push({
    place_id:placeId,title:cfg.article.title,version:1,visual:{designCode:'article_etne_religion_place_history'},popupDesc:cfg.article.popupDesc,
    wikiText:cfg.article.wikiText,summary:{one_liner:cfg.article.popupDesc,themes:['trosrom','lokal religionshistorie','ritual og praksis','stadskontinuitet'],tone:['fagleg','kjeldekritisk','stadsspesifikk']},
    facts:cfg.article.facts.map(([label,desc],index) => ({id:`fact_${placeId}_${String(index+1).padStart(2,'0')}`,label,desc,confidence:'high',sources:sources.map((x)=>x.title)})),
    chronology:cfg.article.chronology.map(([year,period,desc],index) => ({id:`chrono_${placeId}_${String(index+1).padStart(2,'0')}`,year,period,desc,confidence:'high',sources:sources.map((x)=>x.title)})),
    stories:[{id:`story_${placeId}_01`,entry_id:cfg.story.id,title:cfg.story.title,one_liner:cfg.story.summary,confidence:'high',sources:sources.map((x)=>x.title)}],
    interpretation:{what_to_notice:['skiljet mellom dokumenterte tidslag','den aktive religiøse bruken','korleis bygget står i lokalmiljøet'],why_it_matters:['Religiøse rom blir forma av både ritual, bygg og lokal organisering','Presis datering hindrar at ulike kyrkjestader blir blanda'],counterpoints:['Kollektivt People-anker representerer miljøet, ikkje namngitte enkeltpersonar','Natur-rundinga påstår ikkje ei artsinventering']},
    links:{entry_ids:[cfg.story.id],related_places:cfg.article.related,related_people:[cfg.person.id]},sources,
    ui:{mini_panel:{show:true,highlights:[`fact_${placeId}_01`,`fact_${placeId}_02`,`story_${placeId}_01`],max_items:6}}
  });
}

writeJson(PEOPLE_PATH, people);
writeJson(STORY_PATH, stories);
writeJson(LEKSIKON_PATH, articles);

const peopleManifest = readJson('data/people/manifest.json');
peopleManifest.files = uniq([...peopleManifest.files, PEOPLE_MANIFEST_ENTRY]);
writeJson('data/people/manifest.json', peopleManifest);

const storyManifest = readJson('data/stories/stories_manifest.json');
for (const placeId of Object.keys(placeConfigs)) {
  if (!storyManifest.files.some((x) => x.category === 'religion' && x.entity_id === placeId && x.path === STORY_PATH)) {
    storyManifest.files.push({category:'religion',entity_id:placeId,path:STORY_PATH});
  }
}
writeJson('data/stories/stories_manifest.json', storyManifest);

const leksikonManifest = readJson('data/leksikon/manifest.json');
leksikonManifest.files = uniq([...leksikonManifest.files, LEKSIKON_PATH]);
writeJson('data/leksikon/manifest.json', leksikonManifest, false);

const relations = readJson('data/relations.json');
for (const row of relationRows) {
  const index = relations.findIndex((x) => x.id === row.id);
  if (index >= 0) relations[index] = row; else relations.push(row);
}
writeJson('data/relations.json', relations);

const psychLeksikonPath = 'data/leksikon/places/vestland/etne/psykologi/leksikon_etne_psykologi_rounds_batch1.json';
const psychArticles = readJson(psychLeksikonPath);
let psychChanged = false;
const replaceInvalid = (value) => {
  if (Array.isArray(value)) return value.map(replaceInvalid);
  if (!value || typeof value !== 'object') return value === 'etne_senter' ? (psychChanged = true, 'etnesjoen_tettstad') : value;
  return Object.fromEntries(Object.entries(value).map(([k,v]) => [k,replaceInvalid(v)]));
};
writeJson(psychLeksikonPath, replaceInvalid(psychArticles));

function insertProfile(filePath, anchor, addition) {
  let source = readText(filePath);
  if (!source.includes(addition.trim())) {
    if (!source.includes(anchor)) throw new Error(`Profile anchor missing in ${filePath}`);
    source = source.replace(anchor, `${anchor}${addition}`);
    writeText(filePath, source);
  }
}
insertProfile('js/ui/place-card.js', '  media: ["people", "nature", "badges", "works", "civication", "brands", "før_nå", "fortellinger", "leksikon"],\n', '  psykologi: ["people", "nature", "badges", "works", "civication", "brands", "før_nå", "fortellinger", "leksikon"],\n  religion: ["people", "nature", "badges", "works", "civication", "brands", "før_nå", "fortellinger", "leksikon"],\n');
insertProfile('tools/audit-etne-non-nature-round-quality.mjs', "  media: ['people', 'nature', 'badges', 'works', 'civication', 'brands', 'før_nå', 'fortellinger', 'leksikon'],\n", "  psykologi: ['people', 'nature', 'badges', 'works', 'civication', 'brands', 'før_nå', 'fortellinger', 'leksikon'],\n  religion: ['people', 'nature', 'badges', 'works', 'civication', 'brands', 'før_nå', 'fortellinger', 'leksikon'],\n");

let docs = readText('data/places/README_place_rounds.md');
const docsAnchor = 'media:\npeople | nature | badges\nworks | civication | brands\nfør_nå | fortellinger | leksikon\n';
const docsAddition = '\npsykologi:\npeople | nature | badges\nworks | civication | brands\nfør_nå | fortellinger | leksikon\n\nreligion:\npeople | nature | badges\nworks | civication | brands\nfør_nå | fortellinger | leksikon\n';
if (!docs.includes('religion:\npeople | nature | badges')) {
  if (!docs.includes(docsAnchor)) throw new Error('Round documentation anchor missing');
  docs = docs.replace(docsAnchor, `${docsAnchor}${docsAddition}`);
  writeText('data/places/README_place_rounds.md', docs);
}

const test = `const assert=require('assert'),fs=require('fs'),path=require('path');
const repo=path.resolve(__dirname,'..'),read=p=>JSON.parse(fs.readFileSync(path.join(repo,p),'utf8'));
const runtime=fs.readFileSync(path.join(repo,'js/ui/place-card.js'),'utf8');
const match=runtime.match(/const CATEGORY_ROUND_PROFILES = Object\\.freeze\\((\\{[\\s\\S]*?\\})\\);/);assert(match);
const profiles=Function(\`return (\${match[1]});\`)();
const expected=['people','nature','badges','works','civication','brands','før_nå','fortellinger','leksikon'];
assert.deepStrictEqual(profiles.religion,expected);assert.deepStrictEqual(profiles.psykologi,expected);
const ids=['etne_kyrkje','frette_kapell','skanevik_kyrkje'];
const paths={etne_kyrkje:'data/places/religion/vestland/etne/etne_kyrkje/etne_kyrkje.json',frette_kapell:'data/places/religion/vestland/etne/frette_kapell/frette_kapell.json',skanevik_kyrkje:'data/places/religion/vestland/etne/skanevik_kyrkje/skanevik_kyrkje.json'};
const coords={etne_kyrkje:[59.66966917268966,5.944394800224875,180,2013],frette_kapell:[59.72606849036358,6.162044190674154,180,1959],skanevik_kyrkje:[59.731915140528194,5.939778902454844,180,1900]};
const people=read('${PEOPLE_PATH}'),relations=read('data/relations.json'),stories=read('${STORY_PATH}'),articles=read('${LEKSIKON_PATH}');
const peopleManifest=read('data/people/manifest.json'),storyManifest=read('data/stories/stories_manifest.json'),lexManifest=read('data/leksikon/manifest.json');
const badges=new Set(read('data/badges/religion.json').sub);
assert(peopleManifest.files.includes('${PEOPLE_MANIFEST_ENTRY}'));assert(lexManifest.files.includes('${LEKSIKON_PATH}'));
for(const id of ids){const place=read(paths[id]),rel=relations.filter(x=>x.place===id),story=stories.find(x=>x.place_id===id),article=articles.find(x=>x.place_id===id),person=people.find(x=>x.placeId===id);
 for(const forbidden of ['rounds','rundinger','training_profile','tasks_profile','play'])assert(!Object.hasOwn(place,forbidden),id+' har irrelevant '+forbidden);
 assert(person&&/kollektivt_trusmiljoanker/.test(person.kind));assert(rel.some(x=>x.person===person.id));assert(story&&story.person_id===person.id);assert(article&&article.links.entry_ids.includes(story.id));
 assert(storyManifest.files.some(x=>x.category==='religion'&&x.entity_id===id&&x.path==='${STORY_PATH}'));
 const rounds={people:rel,nature:place.nature_profile,badges:place.underbadge_ids,works:place.works,civication:place.civication_store,brands:place.brands,før_nå:place.for_na,fortellinger:[story],leksikon:[article]};assert.deepStrictEqual(Object.keys(rounds),expected);
 for(const [round,value] of Object.entries(rounds))assert(Array.isArray(value)?value.length>0:Boolean(value&&typeof value==='object'),id+' mangler '+round);
 assert(place.underbadge_ids.every(x=>badges.has(x)));assert(place.works.length>=4&&place.works.every(x=>x.source_urls.length>=2));assert(place.civication_store.length>=2&&place.civication_store.every(x=>x.physicalObject===true&&x.placeSpecific===true&&x.source_urls.length>=2));
 assert(place.for_na.before&&place.for_na.now&&place.for_na.change&&place.for_na.sources.length>=2);assert(story.sources.length>=2&&article.sources.length>=2&&article.wikiText.length>=3);assert.deepStrictEqual([place.lat,place.lon,place.r,place.year],coords[id]);}
assert(/1910/.test(stories.find(x=>x.place_id==='frette_kapell').story)&&/1959/.test(stories.find(x=>x.place_id==='frette_kapell').story));
assert(/skild|separate/.test(stories.find(x=>x.place_id==='skanevik_kyrkje').story)&&/1900/.test(stories.find(x=>x.place_id==='skanevik_kyrkje').story));
assert(/2013/.test(stories.find(x=>x.place_id==='etne_kyrkje').story)&&!/middelalderkyrkje[^.]*er/.test(stories.find(x=>x.place_id==='etne_kyrkje').story));
console.log('Etne religion round content OK');\n`;
writeText('tests/etne-religion-round-content.test.js', test);

console.log('Etne religion rounds materialized for 3 places.');
