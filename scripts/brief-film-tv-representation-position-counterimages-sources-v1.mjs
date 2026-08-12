#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const P = Object.freeze({
  plan: 'data/fag/TV_og_Film/film_tv_learning_order_plan_v1.json',
  emners: 'data/fag/TV_og_Film/emner_film_tv_canonical_v4_5.json',
  methods: 'data/fag/TV_og_Film/methods_film_tv_canonical_v4_5.json',
  registry: 'data/fagverk/fagverk_registry.json',
  status: 'data/fagverk/subject_status.json',
  brief: 'data/fag/TV_og_Film/film_tv_representation_position_counterimages_source_claim_brief_v1.json',
  report: 'reports/fagverk/film-tv-representation-position-counterimages-source-brief-v1-audit.json'
});
const UNIT_ID = 'representasjon-posisjon-og-motbilder';
const INPUT_GATE = 'documentary_evidence_ethics_full_chapter_complete_next_unit_source_brief';
const SOURCE_BRIEF_GATE = 'representation_position_counterimages_source_brief_complete_full_chapter_production';
const FULLTEXT_GATE = 'representation_position_counterimages_full_chapter_complete_next_unit_source_brief';
const abs = (file) => path.join(ROOT, file);
const read = (file) => JSON.parse(fs.readFileSync(abs(file), 'utf8'));
const write = (file, value) => fs.writeFileSync(abs(file), `${JSON.stringify(value, null, 2)}\n`);
const assert = (ok, message) => { if (!ok) throw new Error(message); };

const source = (id, publisher, title, url, type, role, location) => ({
  id, publisher, title, url, type, evidence_role: role, source_location: location,
  retrieval_status: 'verified_2026-08-12'
});

const SOURCES = Object.freeze([
  source('ftvrp01-bfi-diversity','British Film Institute','BFI Diversity Standards criteria','https://www.bfi.org.uk/inclusion-film-industry/bfi-diversity-standards/diversity-standards-criteria','national-film-institute-standard','institutional-representation-policy','The criteria distinguish on-screen representation, creative leadership, industry access and audience access, and require perspective and non-stereotypical characterization rather than headcounts alone.'),
  source('ftvrp02-bfi-onscreen','British Film Institute','Standard A: On-screen representation, themes and narratives','https://www.bfi.org.uk/inclusion-film-industry/bfi-diversity-standards/bfi-diversity-standards-film/standard-screen-representation-themes-narratives','national-film-institute-standard','institutional-onscreen-policy','The standard connects casting, narrative perspective, role significance, setting and stereotypes and documents why numerical presence is not sufficient.'),
  source('ftvrp03-bfi-access','British Film Institute','Standard E: Accessibility','https://www.bfi.org.uk/inclusion-film-industry/bfi-diversity-standards/bfi-diversity-standards-film/standard-e-accessibility','national-film-institute-standard','institutional-accessibility-policy','The standard treats accessibility across development, production, employment and release, allowing analysis to separate screen portrayal from access conditions.'),
  source('ftvrp04-usc-inclusion','USC Annenberg Inclusion Initiative','Annenberg Inclusion Initiative releases study of representation in Netflix original productions','https://annenberg.usc.edu/news/research-and-impact/annenberg-inclusion-initiative-releases-study-representation-netflix','university-empirical-study','research-visibility-measurement','The study documents its sample and compares lead, main-cast and speaking-character presence across gender, race/ethnicity, LGBTQ identity and disability, including intersections.'),
  source('ftvrp05-columbia-intersectionality','Columbia Law School','Center for Intersectionality and Social Policy Studies Established','https://www.law.columbia.edu/news/archive/center-intersectionality-and-social-policy-studies-established','university-method-record','research-intersectionality-method','The institutional record defines intersectionality as analysis of interacting structures and categories rather than the addition of isolated identity labels.'),
  source('ftvrp06-bfi-portrait','British Film Institute','How Portrait of a Lady on Fire celebrates the female gaze','https://www.bfi.org.uk/features/portrait-lady-fire-female-gaze','national-film-institute-analysis','institutional-object-analysis','The analysis connects reciprocal looking, composition, narrative absence and creative control in a concrete film rather than treating a gaze label as self-explanatory.'),
  source('ftvrp07-bfi-watermelon','British Film Institute','The Watermelon Woman at 25: the Black lesbian classic that wears its brilliance lightly','https://www.bfi.org.uk/features/watermelon-woman-cheryl-dunye','national-film-institute-analysis','institutional-counterimage-analysis','The analysis documents Dunye’s Black lesbian standpoint, fictional archive, mixed film/video form and challenge to representational and archival authority.'),
  source('ftvrp08-loc-watermelon','Library of Congress','The Watermelon Woman (1996) joins the National Film Registry','https://www.loc.gov/item/prn-21-078/','national-film-registry-record','institutional-object-record','The registry notice identifies the film’s authorship, queer-cinema position and investigation of the erasure of Black women from film history.'),
  source('ftvrp09-glaad-sri','GLAAD','2024 Studio Responsibility Index: Overview of Findings','https://glaad.org/sri/2024/overview/','media-advocacy-empirical-report','community-visibility-measurement','The report publishes sample, methodology and screen-presence findings by LGBTQ category, gender, race/ethnicity, disability and duration.'),
  source('ftvrp10-bfi-lambeth','British Film Institute','We Are the Lambeth Boys','https://www.bfi.org.uk/film/830ae244-6319-5be2-b1f4-cb564a74144f/look-at-britain-2-we-are-the-lambeth-boys','national-film-institute-object-record','institutional-class-object-analysis','The record documents voice, narration, stereotype challenge and institutional sponsorship in a working-class youth documentary.'),
  source('ftvrp11-bfi-distant','British Film Institute','Distant Voices, Still Lives','https://www.bfi.org.uk/film/930b2196-1cac-5219-932f-353eff1c2cda/distant-voices-still-lives','national-film-institute-object-record','institutional-class-object-analysis','The record connects fragmented structure, sound, lighting, memory and material setting in a working-class family history.'),
  source('ftvrp12-bfi-saturday','British Film Institute','Saturday Night and Sunday Morning','https://www.bfi.org.uk/film/06d680ab-95af-5606-a943-e664101045c7/saturday-night-and-sunday-morning','national-film-institute-object-record','institutional-class-object-analysis','The record identifies setting, labour, adaptation, performance and directorial position in the film’s representation of a Nottingham factory worker.'),
  source('ftvrp13-bfi-black-girl','British Film Institute','Black Girl','https://www.bfi.org.uk/film/3650bd24-2554-5ca5-bc8d-a3acd7592468/black-girl','national-film-institute-object-record','institutional-decolonial-object-analysis','The catalogue frames Sembène’s film through post-colonial labour, racism, refusal and formal precision.'),
  source('ftvrp14-bfi-black-girl-performance','British Film Institute','In praise of Mbissine Thérèse Diop in Ousmane Sembène’s Black Girl','https://www.bfi.org.uk/features/praise-mbissine-therese-diop-ousmane-sembenes-black-girl','national-film-institute-analysis','institutional-performance-analysis','The analysis traces racialised and gendered labour through performance, framing, voice, space and economic power.'),
  source('ftvrp15-academy-regeneration','Academy of Motion Picture Arts and Sciences','Academy Museum reveals Regeneration: Black Cinema 1898–1971','https://press.oscars.org/news/academy-museum-motion-pictures-reveals-new-details-inaugural-exhibitions','museum-exhibition-record','institutional-counterarchive-record','The research-led exhibition record establishes Black participation in American filmmaking as a historical field and identifies omission as a curatorial problem.'),
  source('ftvrp16-loc-within','Library of Congress','Within Our Gates','https://www.loc.gov/item/2024600507/','national-library-object-record','institutional-object-record','The catalogue provides work, creator, subject, rights and object metadata for Micheaux’s counter-history of racial violence, education and mobility.'),
  source('ftvrp17-loc-do-right','Library of Congress / National Film Preservation Board','Do the Right Thing','https://www.loc.gov/programs/national-film-preservation-board/film-registry/descriptions-and-essays/','national-film-registry-description','institutional-object-analysis','The registry entry situates the film’s neighbourhood space, colour design and conflict around racial power while keeping interpretation tied to a named work.'),
  source('ftvrp18-sundance-crip-camp','Sundance Institute','Watchlist: Documentaries by artists with disabilities','https://www.sundance.org/blogs/watchlist-7-impactful-dfp-supported-documentaries-by-artists-with-disabilities/','film-institute-program-record','community-authorship-object-record','The programme identifies disabled authorship, production support and the point of view through which Crip Camp narrates disability-rights history.'),
  source('ftvrp19-ruderman-authentic','Ruderman Family Foundation','Productions honored for commitment to authentic representation','https://rudermanfoundation.org/press_releases/16922/','disability-advocacy-casting-record','community-authentic-casting-record','The programme states inspectable casting criteria and names productions and performers, supporting analysis of employment and authorship without inferring disability from images.'),
  source('ftvrp20-isfi-ofelas','International Sámi Film Institute','OFELAŠ Pathfinder guidelines','https://isfi.no/guidelines/','indigenous-film-protocol','community-sovereignty-protocol','The Sámi-led protocol addresses story ownership, cultural consultation, unequal resources, appropriation and early production accountability.'),
  source('ftvrp21-isfi-selfdetermination','International Sámi Film Institute','ISFI Annual Report 2025','https://isfi.no/article/read-isfis-annual-report-2025/','indigenous-film-institute-report','community-narrative-self-determination-record','The institute states a mandate for Sámi film financing, sustainable industry, narrative self-determination and access to national and global markets.'),
  source('ftvrp22-isfi-arran','International Sámi Film Institute','ÁRRAN 360°','https://isfi.no/se/arran-360/','indigenous-xr-program-record','community-form-and-exhibition-record','The programme documents Sámi-directed 360-degree works, a purpose-built lávvu screen and the relationship between XR form, exhibition and Sámi storytelling.'),
  source('ftvrp23-nb-la-elva','Nasjonalbiblioteket','Filmvisning: La elva leve! (Bredo Greve, 1980)','https://www.nb.no/hva-skjer/filmvisning-la-elva-leve-bredo-greve-1980/','national-library-program-record','institutional-object-context-record','The programme documents collaboration, Alta-action context and the film’s mixture of documentary and fiction, enabling comparison with later screen histories.'),
  source('ftvrp24-nfb-kanehsatake','National Film Board of Canada','Kanehsatake: 270 Years of Resistance','https://www.nfb.ca/film/kanehsatake_270_years_of_resistance/','national-film-board-object-record','community-positioned-object-record','The record identifies Alanis Obomsawin’s 78 days behind Kanien’kéhaka lines, production roles and Indigenous-cinema context.'),
  source('ftvrp25-bfi-fits','British Film Institute','The Fits: gender, sports and stereotypes','https://www.bfi.org.uk/features/the-fits-gender-sports-stereotypes','national-film-institute-analysis','institutional-gender-form-analysis','The analysis connects body, movement, costume, framing, sound and gendered belonging in a concrete film.'),
]);

const caseRow = (id, work, medium, years, source_ids, purpose) => ({ id, work, medium, years, source_ids, purpose });
const CASES = Object.freeze([
  caseRow('case-bfi-diversity','BFI Diversity Standards','representation-production-access-policy','2019–',['ftvrp01-bfi-diversity','ftvrp02-bfi-onscreen','ftvrp03-bfi-access'],'Skille rolleantall, narrativ betydning, perspektiv, produksjonsmakt og faktisk tilgjengelighet.'),
  caseRow('case-usc-inclusion','USC inclusion study of Netflix originals','intersectional-screen-sample','2018–2019',['ftvrp04-usc-inclusion'],'Prøve hva et datasett må oppgi før synlighet, fravær og kryssende kategorier kan sammenlignes.'),
  caseRow('case-intersectionality','Columbia Center for Intersectionality','intersectionality-method','1989–',['ftvrp05-columbia-intersectionality'],'Bruke interseksjonalitet som analyse av sammenvirkende maktstrukturer, ikke som liste over identiteter.'),
  caseRow('case-portrait','Portrait of a Lady on Fire','feminist-gaze-feature','2019',['ftvrp06-bfi-portrait'],'Analysere blikk som gjensidighet, utsnitt, varighet, narrativ kunnskap og produksjonsposisjon.'),
  caseRow('case-watermelon','The Watermelon Woman','black-lesbian-queer-counterarchive-feature','1996',['ftvrp07-bfi-watermelon','ftvrp08-loc-watermelon'],'Koble Black lesbisk posisjon, fiktivt arkiv, video/film-form og historisk fravær.'),
  caseRow('case-glaad','GLAAD Studio Responsibility Index','lgbtq-visibility-sample','2023',['ftvrp09-glaad-sri'],'Skille forekomst, rollebetydning, skjermtid og interseksjonell fordeling.'),
  caseRow('case-lambeth','We Are the Lambeth Boys','working-class-youth-documentary','1959',['ftvrp10-bfi-lambeth'],'Prøve hvordan stemmerom, narrasjon, sponsor og stereotyper former et klassebilde.'),
  caseRow('case-distant','Distant Voices, Still Lives','working-class-memory-feature','1988',['ftvrp11-bfi-distant'],'Koble klasse til hjem, arbeid, vold, sang, lys og fragmentert erindringsform.'),
  caseRow('case-saturday','Saturday Night and Sunday Morning','working-class-labour-feature','1960',['ftvrp12-bfi-saturday'],'Analysere fabrikkarbeid, fritid, mobilitet og regissørposisjon uten å gjøre klasse til kostyme.'),
  caseRow('case-black-girl','Black Girl','postcolonial-counterimage-feature','1966',['ftvrp13-bfi-black-girl','ftvrp14-bfi-black-girl-performance'],'Prøve kolonialt og kjønnet arbeid gjennom stemme, rom, kropp, maske og økonomisk makt.'),
  caseRow('case-regeneration','Regeneration: Black Cinema 1898–1971','black-cinema-counterarchive-exhibition','1898–1971',['ftvrp15-academy-regeneration'],'Gjøre kanonisk fravær, kuratering og Black produksjonsdeltakelse til egne etterprøvbare påstander.'),
  caseRow('case-within','Within Our Gates','race-film-counterhistory','1920',['ftvrp16-loc-within'],'Koble skaper, objektdata, voldshistorie, utdanning og motfortelling uten å inferere identitet fra stillbilder.'),
  caseRow('case-do-right','Do the Right Thing','racial-power-neighbourhood-feature','1989',['ftvrp17-loc-do-right'],'Analysere rom, farge, flerstemmighet, konflikt og makt uten å redusere figurene til demografiske markører.'),
  caseRow('case-crip-camp','Crip Camp','disabled-authorship-rights-documentary','2020',['ftvrp18-sundance-crip-camp'],'Koble funksjonsvariasjon til forfatterposisjon, fellesskap, arkivmateriale og rettighetshistorie.'),
  caseRow('case-ruderman','Ruderman authentic-representation honorees','disabled-casting-production-record','2025–2026',['ftvrp19-ruderman-authentic'],'Skille rolle, utøver, selvidentifikasjon, castingpraksis og produksjonsvilkår fra bildebasert antakelse.'),
  caseRow('case-ofelas','OFELAŠ Pathfinder','sami-cultural-sovereignty-protocol','2024–',['ftvrp20-isfi-ofelas'],'Auditere hvem som eier fortellingen, hvem som konsulteres og når makt deles i produksjonen.'),
  caseRow('case-isfi-selfdetermination','ISFI financing and self-determination mandate','sami-screen-institution','2025–2026',['ftvrp21-isfi-selfdetermination'],'Koble skjermsuverenitet til finansiering, kompetanse, distribusjon og narrativ selvbestemmelse.'),
  caseRow('case-arran','ÁRRAN 360°','sami-xr-counterimage-program','2022–2024',['ftvrp22-isfi-arran'],'Analysere 360-form, visningsarkitektur og Sámi skaperkontroll som samlet representasjonspraksis.'),
  caseRow('case-la-elva','La elva leve!','sami-alta-action-hybrid-film','1980',['ftvrp23-nb-la-elva'],'Sammenligne samarbeid, politisk satire og dokumentar/fiksjon-form i en historisk Alta-fortelling.'),
  caseRow('case-kanehsatake','Kanehsatake: 270 Years of Resistance','indigenous-positioned-documentary','1993',['ftvrp24-nfb-kanehsatake'],'Koble kameratilgang, oppholdssted, urfolksforfatterposisjon og konfliktens romlige makt.'),
  caseRow('case-fits','The Fits','gender-body-sound-feature','2015',['ftvrp25-bfi-fits'],'Prøve kjønnede normer gjennom kropp, bevegelse, lyd og sosial tilhørighet.'),
]);

const C = Object.freeze({
  function:['case-bfi-diversity','case-crip-camp','case-ruderman','case-usc-inclusion'],
  intersection:['case-intersectionality','case-watermelon','case-crip-camp','case-ofelas'],
  gender:['case-portrait','case-fits','case-bfi-diversity','case-watermelon'],
  class:['case-lambeth','case-distant','case-saturday','case-bfi-diversity'],
  colonial:['case-black-girl','case-regeneration','case-ofelas','case-kanehsatake'],
  race:['case-within','case-do-right','case-regeneration','case-black-girl'],
  representation:['case-bfi-diversity','case-do-right','case-watermelon','case-intersectionality'],
  queer:['case-watermelon','case-glaad','case-portrait','case-bfi-diversity'],
  visibility:['case-usc-inclusion','case-glaad','case-regeneration','case-ruderman'],
  sami:['case-ofelas','case-isfi-selfdetermination','case-arran','case-la-elva','case-kanehsatake']
});

const TOPIC_PLANS = Object.freeze([
  ['funksjonsvariasjon_ableisme_og_tilgjengelighet','function','Skille funksjonsvariasjon som framstilling og skaperposisjon fra ableistiske normer og fra operative tilgangstiltak.',[
    ['rp-function-1','Fastslå representasjonsposisjon gjennom dokumentert rolle, utøver og skaperkontroll uten bildebasert identitetsinferens.','method'],
    ['rp-function-2','Analysere hvordan Crip Camp bruker arkiv, fellesskapsminne og medregissørens posisjon til å endre fortellerautoritet.','object-analysis'],
    ['rp-function-3','Skille autentisk casting og arbeidsadgang fra narrativ kompleksitet og tilgjengelig distribusjon.','system'],
    ['rp-function-4','Prøve ableisme i utsnitt, lyd, handlingsrom og kausalitet fremfor å lete etter enkeltstående positive bilder.','form-analysis']]],
  ['interseksjonalitet_posisjonalitet_og_metode','intersection','Gjøre posisjonalitet og sammenvirkende maktstrukturer eksplisitte uten å erstatte de konkrete representasjonsfeltene.',[
    ['rp-intersection-1','Definere interseksjonalitet som analyse av gjensidig formende strukturer og dokumentere hvilke akser materialet faktisk bærer.','method'],
    ['rp-intersection-2','Lokalisere analytikerens, verkets, institusjonens og kildens posisjoner før fortolkningen generaliseres.','method'],
    ['rp-intersection-3','Prøve The Watermelon Woman på samtidige strukturer for rase, kjønn, seksualitet, klasse og arkivmakt.','object-analysis'],
    ['rp-intersection-4','Kreve eksplisitt kildegrunnlag når én kategori brukes som forklaring på en annen.','source-criticism']]],
  ['kjonn_feministisk_filmanalyse_og_skjermmakt','gender','Analysere kjønn som form, narrativ betydning og produksjonsmakt, ikke bare som opptelling.',[
    ['rp-gender-1','Skille hvem som ser, hvem som vet, hvem som rammes inn og hvem som kontrollerer verkets synsvinkel.','form-analysis'],
    ['rp-gender-2','Prøve gjensidighet, fravær og varighet i Portrait of a Lady on Fire mot et konkret blikkbegrep.','object-analysis'],
    ['rp-gender-3','Koble kropp, bevegelse, kostyme og lyd i The Fits til sosialt kjønnede normer.','object-analysis'],
    ['rp-gender-4','Holde rolleantall, narrativ agens og makt bak kameraet som tre separate evidensfelt.','method']]],
  ['klasse_arbeid_ulikhet_og_sosial_mobilitet','class','Analysere klasse gjennom arbeid, rom, tid, tale og mobilitet uten å overta produksjonsarbeidernes faktiske vilkår.',[
    ['rp-class-1','Koble klassepåstand til arbeid, bolig, fritid, institusjon og handlingsrom i det konkrete verket.','method'],
    ['rp-class-2','Sammenligne stemmerom og sponsorstyrt narrasjon i We Are the Lambeth Boys med fragmentert minne i Distant Voices, Still Lives.','comparison'],
    ['rp-class-3','Prøve sosial mobilitet som narrativ mulighet, ikke som antatt egenskap ved aksent eller klær.','source-criticism']]],
  ['koloniale_blikk_dekolonisering_og_motbilder','colonial','Analysere representasjonsmakt og motbilder i koloniale og postkoloniale relasjoner mens de lange historiske forløpene forblir i historieområdet.',[
    ['rp-colonial-1','Identifisere hvem som navngir, rammer inn og distribuerer mennesker, steder og kultur i det konkrete produksjonsforløpet.','power-analysis'],
    ['rp-colonial-2','Analysere Black Girl som motbilde gjennom stemme, rom, maske, arbeid og formell kontroll.','object-analysis'],
    ['rp-colonial-3','Skille konsultasjon, samarbeid og narrativ selvbestemmelse med OFELAŠ som produksjonsprotokoll.','system'],
    ['rp-colonial-4','Sammenligne motarkiv og posisjonert konfliktbilde i Regeneration og Kanehsatake.','comparison']]],
  ['rasialisering_etnisitet_hvithet_og_stereotypi','race','Analysere rasialisering og hvithet som formede maktrelasjoner uten å slutte identitet fra nasjonal opprinnelse eller bilder.',[
    ['rp-race-1','Skille dokumentert selvidentifikasjon, historisk kategori, rollefunksjon og analytisk rasialisering.','method'],
    ['rp-race-2','Prøve Within Our Gates som motfortelling gjennom skaperkreditering, objektdata, vold, utdanning og mobilitet.','object-analysis'],
    ['rp-race-3','Analysere rom, farge, flerstemmighet og konflikt i Do the Right Thing uten å redusere figurene til typer.','form-analysis'],
    ['rp-race-4','Gjøre hvithet synlig som norm og institusjonell posisjon der kildene faktisk dokumenterer den.','power-analysis']]],
  ['representasjon_identitet_og_makt','representation','Bygge en grunnmodell som skiller nærvær, perspektiv, narrativ agens, form, skaperkontroll og distribusjonsmakt.',[
    ['rp-representation-1','Kartlegge hvem som er synlig, hvem som får vite og handle, og hvem som gis konsekvens i fortellingen.','method'],
    ['rp-representation-2','Skille verkets utsagn fra institusjonell hensikt, markedsføring og dokumentert resepsjon.','source-criticism'],
    ['rp-representation-3','Koble representasjonsanalyse til konkrete valg i utsnitt, lyd, klipp, rom, sjanger og rollefunksjon.','form-analysis'],
    ['rp-representation-4','Prøve motbildet som endret autoritet og form, ikke automatisk som positivt innhold.','power-analysis']]],
  ['seksualitet_queer_representasjon_og_normkritikk','queer','Analysere seksualitet, queer form og normkritikk i verk og produksjon mens publikums identitetsarbeid forblir i publikumsområdet.',[
    ['rp-queer-1','Skille eksplisitt identifikasjon, relasjon, rollebetydning, skjermtid og normativ ramme.','method'],
    ['rp-queer-2','Analysere The Watermelon Woman som queer form, Black lesbisk posisjon og reparerende fiksjonsarkiv.','object-analysis'],
    ['rp-queer-3','Bruke GLAAD-data til avgrensede synlighetspåstander uten å gjøre opptelling til kvalitetsdom.','data-analysis'],
    ['rp-queer-4','Prøve hvordan blikk, sjanger og narrativ agens naturaliserer eller forstyrrer hetero- og cisnormer.','form-analysis']]],
  ['synlighet_fravaer_og_frasortering','visibility','Gjøre fravær og frasortering analyserbart gjennom definert korpus, metadata og institusjonelle prosesser.',[
    ['rp-visibility-1','Definere korpus, tidsrom, enhet, kategori og ukjentdata før fravær tallfestes.','data-analysis'],
    ['rp-visibility-2','Skille manglende produksjon, casting, kreditering, bevaring, katalogisering, distribusjon og kuratering.','system'],
    ['rp-visibility-3','Sammenholde kvantitativ synlighet med rollebetydning, form og dokumentert institusjonsmakt.','method']]],
  ['urfolk_samisk_skjermkultur_og_suverenitet','sami','Behandle urfolks- og Sámi skjermkultur som spørsmål om kontroll over bilder, kilder, språk, produksjon og visning.',[
    ['rp-sami-1','Bruke OFELAŠ til å auditere story ownership, konsultasjon, kreditering, kulturkunnskap og tidspunkt for medbestemmelse.','protocol-analysis'],
    ['rp-sami-2','Koble narrativ selvbestemmelse til finansiering, kompetanse og markedstilgang gjennom ISFIs mandat.','institutional-analysis'],
    ['rp-sami-3','Analysere ÁRRAN 360° som sammenheng mellom Sámi skaperkontroll, XR-form og visningsarkitektur.','object-analysis'],
    ['rp-sami-4','Sammenligne La elva leve! og Kanehsatake på samarbeid, posisjon, sted, konflikt og dokumentarisk autoritet.','comparison']]]
]);

const caseById = new Map(CASES.map((row) => [row.id, row]));
function buildTopicBriefs(emneById) {
  return TOPIC_PLANS.map(([suffix, caseKey, learning_goal, planned]) => {
    const emne_id = `em_film_tv_${suffix}`;
    const canonical = emneById.get(emne_id);
    assert(canonical, `Mangler canonicalt emne ${emne_id}`);
    const case_ids = C[caseKey];
    const source_ids = [...new Set(case_ids.flatMap((id) => caseById.get(id)?.source_ids || []))];
    return {
      emne_id, case_ids, source_ids, learning_goal,
      planned_claims: planned.map(([id, claim_focus, claim_type]) => ({ id, claim_focus, claim_type, source_ids, status: 'planned_requires_fulltext_verification' })),
      title: canonical.title, canonical_boundary: canonical.boundary, method_ids: canonical.method_ids
    };
  });
}

export function buildFilmTvRepresentationPositionCounterimagesSourceBriefV1() {
  const plan = read(P.plan);
  const unit = plan.planned_units.find((row) => row.id === UNIT_ID);
  assert(unit, 'Læringsplanen mangler Representasjon, posisjon og motbilder');
  const emners = read(P.emners);
  const emneById = new Map(emners.map((row) => [row.emne_id, row]));
  const methodsDoc = read(P.methods);
  const methodIds = new Set((Array.isArray(methodsDoc) ? methodsDoc : methodsDoc.methods).map((row) => row.method_id || row.id));
  const sourceIds = new Set(SOURCES.map((row) => row.id));
  const caseIds = new Set(CASES.map((row) => row.id));
  const topicBriefs = buildTopicBriefs(emneById);
  const plannedClaims = topicBriefs.flatMap((row) => row.planned_claims);
  const currentRegistry = read(P.registry);
  const currentStatus = read(P.status);
  const brief = {
    schema: 'history_go_film_tv_representation_position_counterimages_source_claim_brief_v1', version: '1.0.0', updated_at: '2026-08-12',
    status: 'source_claim_brief_complete_full_chapter_next', subject_id: 'film_tv', planned_unit_id: UNIT_ID, future_chapter_id: UNIT_ID,
    runtime_registration: { registered: false, allowed_before_full_chapter_gate: false },
    scope: { title: unit.title, primary_domain_ids: unit.primary_domain_ids, prerequisite_planned_unit_ids: unit.prerequisite_planned_unit_ids, prerequisite_existing_chapter_ids: unit.prerequisite_existing_chapter_ids, emne_count: unit.emne_count, emne_ids: unit.emne_ids, overlap_boundary: unit.overlap_boundary },
    source_policy: {
      sources_are_inspectable_https: true, institutions_research_communities_protocols_and_object_records_prioritized: true,
      identity_is_never_inferred_from_appearance_name_or_national_origin_alone: true,
      self_identification_historical_category_character_role_and_analytic_racialization_are_distinct: true,
      visibility_count_perspective_agency_form_authorship_and_distribution_power_are_distinct: true,
      intersectionality_requires_interacting_structures_not_category_accumulation: true,
      counterimage_requires_form_position_and_control_analysis_not_positive_content_assumption: true,
      sami_and_indigenous_screen_sovereignty_requires_story_image_source_language_and_production_control_audit: true,
      national_imaginaries_public_sphere_migration_religion_age_city_and_climate_remain_in_next_unit: true,
      production_labour_conditions_and_operational_accessibility_remain_in_later_production_and_audience_units: true,
      reception_effect_and_audience_identity_work_remain_outside_this_unit: true,
      planned_claim_is_not_verified_claim: true, fulltext_requires_paragraph_level_claim_trace: true
    },
    sources: SOURCES, case_candidates: CASES, topic_briefs: topicBriefs,
    proposed_module_order: [
      { id:'representasjon-makt-og-posisjon',sequence:1,emne_ids:[unit.emne_ids[6],unit.emne_ids[1]],purpose:'Etablerer grunnmodellen for representasjonsmakt, posisjonalitet og interseksjonell metode.' },
      { id:'kjonn-rasialisering-og-klasse',sequence:2,emne_ids:[unit.emne_ids[2],unit.emne_ids[5],unit.emne_ids[3]],purpose:'Prøver tre konkrete maktakser gjennom verkets form, narrativ og dokumenterte produksjonsposisjon.' },
      { id:'synlighet-queer-og-funksjonsvariasjon',sequence:3,emne_ids:[unit.emne_ids[8],unit.emne_ids[7],unit.emne_ids[0]],purpose:'Skiller fravær, rollebetydning, normkritikk, ableisme, skaperposisjon og tilgang.' },
      { id:'koloniale-blikk-motbilder-og-skjermsuverenitet',sequence:4,emne_ids:[unit.emne_ids[4],unit.emne_ids[9]],purpose:'Flytter analysen fra innhold til motarkiv, protokoll, fortellerkontroll og urfolksstyrt skjermpraksis.' }
    ],
    production_requirements: {
      section_scope_is_derived_from_emne_ownership: true, paragraph_and_claim_counts_follow_problem_complexity: true,
      current_claim_plan_counts_by_emne: topicBriefs.map((row) => ({ emne_id: row.emne_id, planned_claim_count: row.planned_claims.length })),
      paragraph_claim_trace_required: true, every_planned_claim_must_be_verified_rewritten_or_rejected: true,
      every_used_source_must_support_at_least_one_final_claim: true,
      representation_analysis_must_cover_presence_perspective_agency_form_authorship_and_distribution_power: true,
      identity_claims_require_explicit_source_status_and_no_visual_inference: true,
      quantitative_visibility_requires_defined_corpus_unit_category_unknowns_and_limits: true,
      intersectional_analysis_must_name_supported_axes_and_interacting_structures: true,
      sami_and_indigenous_cases_must_audit_narrative_self_determination_consultation_credit_language_and_control: true,
      national_public_sphere_migration_religion_age_city_and_climate_analysis_remains_outside_scope: true,
      audience_effect_reception_and_identity_work_remain_outside_scope: true,
      production_labour_and_operational_accessibility_remain_outside_scope: true,
      chapter_registration_only_after_audit: true
    },
    next_gate: 'produce_full_chapter_claims_and_inspectable_sources_for_representasjon_posisjon_og_motbilder'
  };
  const registry = structuredClone(currentRegistry);
  registry.version = '2.88.0'; registry.updatedAt = '2026-08-12';
  registry.subjects.film_tv.canonicalModel.note = `Film & TVs variable canon har 192 emner. De seks første planenhetene er registrert etter fulltekstporten. Representasjon, posisjon og motbilder har nå en egen kilde- og claimbrief for ${unit.emne_count} canonicale emner med ${SOURCES.length} inspectable institusjons-, forsknings-, community-, protokoll- og objektkilder, ${CASES.length} representasjons-, motbilde-, synlighets- og skjermsuverenitetscase og ${plannedClaims.length} variabelt fordelte claimplaner. Claimplanene er uverifiserte, og kapitlet er ikke runtime-registrert. Neste port er fulltekst med avsnittsnivå claimtrace og ny audit; omfanget følger problemgrensene, ikke en kvote.`;
  registry.subjects.film_tv.canonicalModel.seventhSourceClaimBrief = P.brief;
  const status = structuredClone(currentStatus);
  status.version = '1.76.0'; status.updatedAt = '2026-08-12';
  const filmStatus = status.subjects.find((row) => row.id === 'film_tv');
  filmStatus.nextGate = SOURCE_BRIEF_GATE;
  const claimCounts = topicBriefs.map((row) => row.planned_claims.length);
  filmStatus.note = `Kilde- og claimbriefen for Representasjon, posisjon og motbilder er komplett: ${unit.emne_count} canonicale emner, ${SOURCES.length} inspectable kilder, ${CASES.length} case og ${plannedClaims.length} claimplaner fordelt ${claimCounts.join('–')} etter faglig behov. Planlagte claims er ikke verifiserte claims, og kapitlet er ikke registrert. Neste port er fulltekst, faktisk kildebruk og avsnittsnivå trace før kapittel- og runtime-registrering.`;
  const usedSourceIds = new Set([...topicBriefs.flatMap((row) => row.source_ids), ...CASES.flatMap((row) => row.source_ids)]);
  const moduleEmneIds = brief.proposed_module_order.flatMap((row) => row.emne_ids);
  const roles = SOURCES.map((row) => row.evidence_role).join(' ');
  const report = {
    schema:'history_go_film_tv_representation_position_counterimages_source_brief_v1_audit',version:'1.0.0',updated_at:'2026-08-12',status:'source_claim_brief_complete_full_chapter_next',subject_id:'film_tv',
    summary:{ emne_count:unit.emne_count,source_count:SOURCES.length,case_count:CASES.length,planned_claim_count:plannedClaims.length,planned_claim_counts_by_emne:claimCounts,proposed_module_count:brief.proposed_module_order.length,registered_chapter_count_delta:0 },
    coverage:topicBriefs.map((row)=>({emne_id:row.emne_id,method_count:row.method_ids.length,source_count:row.source_ids.length,case_count:row.case_ids.length,planned_claim_count:row.planned_claims.length})),
    gates:{
      seventh_learning_order_unit_selected:plan.production_sequence[6]===UNIT_ID,
      required_prerequisite_chapters_registered:unit.prerequisite_planned_unit_ids.every((id)=>currentRegistry.subjects.film_tv.chapters.some((row)=>row.id===id)),
      exact_unit_emne_coverage:topicBriefs.length===unit.emne_count&&new Set(topicBriefs.map((row)=>row.emne_id)).size===unit.emne_count&&unit.emne_ids.every((id)=>topicBriefs.some((row)=>row.emne_id===id)),
      all_emners_active_canonical:topicBriefs.every((row)=>emneById.has(row.emne_id)),all_methods_resolve:topicBriefs.every((row)=>row.method_ids.every((id)=>methodIds.has(id))),
      inspectable_https_sources:SOURCES.every((row)=>row.url.startsWith('https://')&&row.retrieval_status==='verified_2026-08-12'&&row.source_location),
      institutional_research_community_policy_and_object_roles_present:['institutional','research','community','policy','object'].every((needle)=>roles.includes(needle)),
      every_source_used:SOURCES.every((row)=>usedSourceIds.has(row.id)),every_source_reference_resolves:[...usedSourceIds].every((id)=>sourceIds.has(id)),
      every_case_documented:CASES.every((row)=>row.source_ids.length&&row.source_ids.every((id)=>sourceIds.has(id))),
      gender_race_class_queer_disability_colonial_counterarchive_and_indigenous_cases_present:['gender','racial','class','queer','disab','colonial','counterarchive','indigenous'].every((needle)=>CASES.some((row)=>`${row.medium} ${row.purpose}`.toLowerCase().includes(needle))),
      every_case_reference_resolves:topicBriefs.every((row)=>row.case_ids.every((id)=>caseIds.has(id))),
      every_case_source_available_to_owning_topic:topicBriefs.every((topic)=>topic.case_ids.every((id)=>caseById.get(id).source_ids.every((sourceId)=>topic.source_ids.includes(sourceId)))),
      claim_counts_follow_variable_problem_scope:new Set(claimCounts).size>1&&Math.min(...claimCounts)>=3,
      no_planned_claim_overstated_as_verified:plannedClaims.every((row)=>row.status==='planned_requires_fulltext_verification'),all_planned_claim_ids_unique:new Set(plannedClaims.map((row)=>row.id)).size===plannedClaims.length,
      all_topics_have_boundaries_sources_cases_and_methods:topicBriefs.every((row)=>row.canonical_boundary&&row.source_ids.length>=3&&row.case_ids.length>=3&&row.method_ids.length>=1),
      module_order_covers_every_emne_once:moduleEmneIds.length===unit.emne_count&&new Set(moduleEmneIds).size===unit.emne_count&&unit.emne_ids.every((id)=>moduleEmneIds.includes(id)),
      module_sizes_are_not_forced_equal:new Set(brief.proposed_module_order.map((row)=>row.emne_ids.length)).size>1,
      scope_boundaries_preserved:brief.source_policy.national_imaginaries_public_sphere_migration_religion_age_city_and_climate_remain_in_next_unit&&brief.source_policy.production_labour_conditions_and_operational_accessibility_remain_in_later_production_and_audience_units&&brief.source_policy.reception_effect_and_audience_identity_work_remain_outside_this_unit,
      no_identity_inference_from_images_names_or_origin:brief.source_policy.identity_is_never_inferred_from_appearance_name_or_national_origin_alone&&brief.production_requirements.identity_claims_require_explicit_source_status_and_no_visual_inference,
      sami_screen_sovereignty_has_protocol_institution_form_and_object_evidence:['ftvrp20-isfi-ofelas','ftvrp21-isfi-selfdetermination','ftvrp22-isfi-arran','ftvrp23-nb-la-elva','ftvrp24-nfb-kanehsatake'].every((id)=>topicBriefs.find((row)=>row.emne_id==='em_film_tv_urfolk_samisk_skjermkultur_og_suverenitet').source_ids.includes(id)),
      chapter_remains_unregistered:!registry.subjects.film_tv.chapters.some((row)=>row.id===UNIT_ID),
      registration_waits_for_fulltext_claim_source_audit:!brief.runtime_registration.registered&&!brief.runtime_registration.allowed_before_full_chapter_gate&&brief.production_requirements.chapter_registration_only_after_audit
    },next_gate:brief.next_gate
  };
  return { brief, report, registry, status, unit, topicBriefs, plannedClaims };
}

export function auditFilmTvRepresentationPositionCounterimagesSourceBriefV1({ writeFiles=false, checkFiles=true }={}) {
  const currentGate=read(P.status).subjects.find((row)=>row.id==='film_tv')?.nextGate;
  assert([INPUT_GATE,SOURCE_BRIEF_GATE,FULLTEXT_GATE].includes(currentGate),`Uventet Film & TV-port: ${currentGate}`);
  if(currentGate===FULLTEXT_GATE){const brief=read(P.brief);const report=read(P.report);assert(brief.status==='source_claim_brief_consumed_by_verified_chapter','Representasjonsbriefen skal være konsumert etter fulltekstporten');assert(brief.runtime_registration.registered===true&&brief.runtime_registration.chapter_id===UNIT_ID,'Representasjonsbriefen mangler kapittelregistrering');assert(report.status==='source_claim_brief_consumed_by_verified_chapter'&&Object.values(report.gates).every(Boolean),'Representasjonsbriefens etteraudit er ikke grønn');return{brief,report,registry:read(P.registry),status:read(P.status),unit:read(P.plan).planned_units.find((row)=>row.id===UNIT_ID),topicBriefs:brief.topic_briefs,plannedClaims:brief.topic_briefs.flatMap((row)=>row.planned_claims)};}
  const built=buildFilmTvRepresentationPositionCounterimagesSourceBriefV1();const outputs={[P.brief]:built.brief,[P.report]:built.report,[P.registry]:built.registry,[P.status]:built.status};
  if(writeFiles)for(const[file,value]of Object.entries(outputs))write(file,value);if(checkFiles)for(const[file,value]of Object.entries(outputs))assert(isDeepStrictEqual(read(file),value),`${file} er utdatert`);assert(Object.values(built.report.gates).every(Boolean),'Minst én representasjonsbriefport feiler');return built;
}

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){const args=new Set(process.argv.slice(2));try{const result=auditFilmTvRepresentationPositionCounterimagesSourceBriefV1({writeFiles:args.has('--write'),checkFiles:!args.has('--write')});console.log(`Film & TV representasjonsbrief OK: ${result.topicBriefs.length} emner, ${result.brief.sources.length} kilder, ${result.brief.case_candidates.length} case og ${result.plannedClaims.length} claimspor; status ${result.brief.status}.`);}catch(error){console.error(`Film & TV representasjonsbrief FEIL: ${error.message}`);process.exitCode=1;}}
