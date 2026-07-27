#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const historyDir = path.join(root, 'data/fag/historie');
const reportDir = path.join(root, 'reports/historie-theory-evidence');
const profilePath = path.join(root, 'data/fag/profiles/historie/oslo_akershus/profile.json');
const claimsPath = path.join(historyDir, 'claims_historie_canonical_v1.json');
const sourcesPath = path.join(historyDir, 'sources_historie_canonical_v1.json');
const evidencePath = path.join(historyDir, 'place_evidence_historie_v1.json');
const theoryRegistryPath = path.join(historyDir, 'theory_evidence_historie_canonical_v1.json');
const theoriesPath = path.join(historyDir, 'theory_objects_historie_canonical_v5_5.json');
const docsPath = path.join(root, 'docs/HISTORY_THEORY_EVIDENCE.md');
const phaseDocPath = path.join(root, 'docs/HISTORY_POLITICAL_CHRONOLOGY_EVIDENCE_V1.md');
const dossierPath = path.join(historyDir, 'source_dossiers/political_chronology_v1.json');
const gapV1Path = path.join(reportDir, 'history-theory-evidence-gap-inventory-v1.json');
const gapV2Path = path.join(reportDir, 'history-theory-evidence-gap-inventory-v2.json');
const gapV2MarkdownPath = path.join(reportDir, 'history-theory-evidence-gap-inventory-v2.md');

const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const writeJson = (file, value) => {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
};
const A = (value) => Array.isArray(value) ? value : [];
const sorted = (values) => [...new Set(values)].sort((a, b) => String(a).localeCompare(String(b), 'nb'));
const relative = (file) => path.relative(root, file).split(path.sep).join('/');
const sha256 = (file) => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');

const claimsFile = readJson(claimsPath);
const sourcesFile = readJson(sourcesPath);
const evidenceFile = readJson(evidencePath);
const theoryRegistry = readJson(theoryRegistryPath);
const theories = readJson(theoriesPath);
const profile = readJson(profilePath);
const gapV1 = readJson(gapV1Path);

if (theoryRegistry.completion?.qualifying_entries !== 32) {
  throw new Error(`Political chronology V1 requires a 32-entry theory baseline; found ${theoryRegistry.completion?.qualifying_entries}.`);
}

const theoryById = new Map(A(theories).map((item) => [item.theory_id, item]));
const existingSourceIds = new Set(A(sourcesFile.sources).map((item) => item.source_id));
const existingClaimIds = new Set(A(claimsFile.claims).map((item) => item.claim_id));
const existingEvidenceIds = new Set(A(evidenceFile.evidence_links).map((item) => item.evidence_id));
const existingTheoryEvidenceIds = new Set(A(theoryRegistry.entries).map((item) => item.theory_id));

const dossierRepositoryPath = relative(dossierPath);
const accessedAt = '2026-07-27';

const source = ({ source_id, title, publisher, source_type, url, from, to = null, limitations, tier, rationale }) => ({
  source_id,
  title,
  publisher,
  source_type,
  url,
  language: 'nb',
  geography_ids: ['geo_no_oslo_akershus'],
  temporal_scope: { from, to },
  provenance: {
    repository_source: dossierRepositoryPath,
    extracted_from: [`sources.${source_id}`],
    accessed_at: accessedAt,
  },
  dating: {
    published_at: null,
    updated_at: null,
    accessed_at: accessedAt,
  },
  limitations,
  quality: { tier, rationale },
});

const newSources = [
  source({
    source_id: 'src_his_storting_building_history',
    title: 'Stortingsbygningen 160 år',
    publisher: 'Stortinget',
    source_type: 'official_historical_web_page',
    url: 'https://www.stortinget.no/no/Stortinget-og-demokratiet/Historikk/stortingsbygningen/',
    from: 1866,
    limitations: [
      'Stortingets egen jubileums- og bygningshistorie er autoritativ for institusjonens dokumenterte tidslinje, men er ikke en uavhengig analyse av byggets politiske symbolikk.',
      'Nettpresentasjonen prioriterer hovedtrekk og utvalgte bilder og erstatter ikke byggearkiv, stortingsforhandlinger eller samtidspresse ved detaljert bygningshistorie.',
    ],
    tier: 'A',
    rationale: 'Offisiell institusjonskilde for stortingsbygningens ferdigstillelse, bruk og plassering i hovedstaden.',
  }),
  source({
    source_id: 'src_his_storting_parliamentarism_history',
    title: 'Parlamentarismens historie',
    publisher: 'Stortinget',
    source_type: 'official_historical_web_page',
    url: 'https://www.stortinget.no/no/Stortinget-og-demokratiet/Historikk/Parlamentarismen/Parlamentarismen-i-utvikling/',
    from: 1814,
    limitations: [
      'Stortingets framstilling beskriver institusjonens egen konstitusjonelle historie og kan legge hovedvekten på parlamentarisk utvikling sett fra nasjonalforsamlingen.',
      '1884 omtales som tradisjonelt gjennombruddsår, samtidig som kilden selv presiserer at parlamentarisk praksis var ustabil i årene etterpå.',
    ],
    tier: 'A',
    rationale: 'Offisiell og nyansert institusjonshistorie om riksretten, regjeringsskiftet og parlamentarismens gradvise etablering.',
  }),
  source({
    source_id: 'src_his_snl_parliamentarism',
    title: 'parlamentarisme',
    publisher: 'Store norske leksikon',
    source_type: 'reference_encyclopedia',
    url: 'https://snl.no/parlamentarisme',
    from: 1884,
    limitations: [
      'Leksikonartikkelen sammenfatter et komplekst konstitusjonelt forløp og kan ikke erstatte riksrettsakter eller samtidige stortingsforhandlinger.',
      'Begrepet gjennombrudd forenkler en praksis som ble konsolidert gradvis og ikke fungerte fullt ut etter dagens parlamentariske norm allerede i 1884.',
    ],
    tier: 'B',
    rationale: 'Fagredigert sekundærkilde som gir uavhengig støtte til hovedtrekkene i parlamentarismens etablering.',
  }),
  source({
    source_id: 'src_his_storting_democratic_milestones',
    title: 'Milepæler i Norges demokratiske historie',
    publisher: 'Stortinget',
    source_type: 'official_historical_overview',
    url: 'https://www.stortinget.no/no/Stortinget-og-demokratiet/Historikk/milepaler-i-norges-demokratiske-historie/',
    from: 1814,
    limitations: [
      'Milepælformatet prioriterer vedtaksår og institusjonelle brudd og gir mindre plass til langsomme sosiale prosesser, regionale forskjeller og grupper som fortsatt var ekskludert.',
      'Framstillingen er pedagogisk komprimert og bør suppleres med spesialiserte kilder ved analyse av aktører, motstand og virkningene av hvert vedtak.',
    ],
    tier: 'A',
    rationale: 'Offisiell kronologi for sentrale demokratiske vedtak og institusjonelle endringer.',
  }),
  source({
    source_id: 'src_his_storting_suffrage_history',
    title: 'Stemmerettskampen 1890–1913',
    publisher: 'Stortinget',
    source_type: 'official_archive_presentation',
    url: 'https://www.stortinget.no/no/Stortinget-og-demokratiet/Historikk/kvinnestemmerett/stemmerettskampen-18901913/',
    from: 1886,
    to: 1913,
    limitations: [
      'Nettpresentasjonen bygger på Stortingsarkivets materiale og dokumenterer behandlingen i Stortinget, men dekker ikke hele bredden av lokale organisasjoner og internasjonale påvirkninger.',
      'Kampen fremstilles gjennom utvalgte forslag, voteringer og dokumenter; uformell mobilisering og interne uenigheter krever supplerende organisasjonsarkiver og forskning.',
    ],
    tier: 'A',
    rationale: 'Arkivforankret kilde til vedtakene i 1898, 1907 og 1913 og den langvarige stemmerettskampen.',
  }),
  source({
    source_id: 'src_his_snl_stemmerett_history',
    title: 'stemmerettens historie i Norge',
    publisher: 'Store norske leksikon',
    source_type: 'reference_encyclopedia',
    url: 'https://snl.no/stemmerettens_historie_i_Norge',
    from: 1814,
    to: 1919,
    limitations: [
      'Leksikonartikkelen sammenfatter langvarige politiske og sosiale prosesser og gir ikke full dokumentasjon av alle forslag, voteringer eller organisasjoner.',
      'Kategorier som allmenn stemmerett må leses sammen med samtidige begrensninger, blant annet fattighjelpsbestemmelsen og alders- og bostedskrav.',
    ],
    tier: 'B',
    rationale: 'Fagredigert sekundærkilde som støtter stemmerettsordningen i 1814 og utvidelsene i 1898 og 1913.',
  }),
  source({
    source_id: 'src_his_storting_union_out',
    title: 'Ut av unionen',
    publisher: 'Stortinget',
    source_type: 'official_historical_web_page',
    url: 'https://www.stortinget.no/no/Stortinget-og-demokratiet/Historikk/stortinget-og-unionen-med-sverige/ut-av-unionen/',
    from: 1890,
    to: 1905,
    limitations: [
      'Stortingets egen framstilling konsentrerer seg om parlamentariske beslutninger og den norske politiske prosessen og gir mindre plass til svenske aktører og perspektiver.',
      'Konsulatsak, opprustning, fredsarbeid, folkeavstemninger og Karlstadforhandlinger komprimeres og krever særkilder for detaljert diplomatisk og militær analyse.',
    ],
    tier: 'A',
    rationale: 'Offisiell institusjonshistorie om konsulatsaken, 7. juni-beslutningen, folkeavstemningene og kongevalget.',
  }),
  source({
    source_id: 'src_his_snl_norway_1905_1939',
    title: 'Norges historie fra 1905 til 1939',
    publisher: 'Store norske leksikon',
    source_type: 'reference_encyclopedia',
    url: 'https://snl.no/Norges_historie_fra_1905_til_1939',
    from: 1905,
    to: 1939,
    limitations: [
      'Oversiktsartikkelen dekker en lang periode og kan bare støtte hovedtrekk ved unionsoppløsningen og oppbyggingen av en egen utenrikstjeneste.',
      'Den sammenfatter forskningslitteratur og må suppleres med diplomatiske dokumenter og forvaltningsarkiv ved analyse av konkrete utenrikspolitiske beslutninger.',
    ],
    tier: 'B',
    rationale: 'Fagredigert sekundærkilde som dokumenterer at selvstendigheten krevde eget utenriksdepartement og en norsk utenrikstjeneste.',
  }),
  source({
    source_id: 'src_his_storting_womens_petition_1905',
    title: 'Underskriftsaksjonen i 1905',
    publisher: 'Stortinget',
    source_type: 'official_archive_presentation',
    url: 'https://www.stortinget.no/no/Stortinget-og-demokratiet/Historikk/kvinnestemmerett/underskriftsaksjonen1905/',
    from: 1905,
    to: 1905,
    limitations: [
      'Aksjonsmaterialet dokumenterer mobilisering og underskrifter, men underskriftsantallet er ikke direkte sammenlignbart med et valgregistrert referendum.',
      'Listene hadde varierende praksis for alder, bosted og innføring av navn, og kilden advarer selv mot å bruke tallet som et entydig mål på hele kvinnebefolkningens standpunkt.',
    ],
    tier: 'A',
    rationale: 'Arkivforankret kilde til kvinnenes eksklusjon fra folkeavstemningen og den landsomfattende underskriftsaksjonen.',
  }),
  source({
    source_id: 'src_his_storting_republican_monarchy',
    title: 'Det republikanske monarkiet',
    publisher: 'Stortinget',
    source_type: 'official_historical_web_page',
    url: 'https://www.stortinget.no/no/Stortinget-og-demokratiet/Historikk/stortinget-og-unionen-med-sverige/ut-av-unionen/det-republikanske-monarkiet/',
    from: 1905,
    to: 1905,
    limitations: [
      'Framstillingen følger kongevalget og Stortingets seremonielle rolle, men gir begrenset plass til republikanske miljøer og regional variasjon i statsformdebatten.',
      'Fotografier og seremonibeskrivelser dokumenterer offentlig iscenesettelse, men ikke hva alle tilstedeværende mente eller hvordan hendelsen ble mottatt utenfor hovedstaden.',
    ],
    tier: 'A',
    rationale: 'Offisiell kilde til folkeavstemningen om statsform, Stortingets kongevalg og edsavleggelsen 27. november 1905.',
  }),
  source({
    source_id: 'src_his_storting_eidsvolls_plass',
    title: 'Eidsvolls plass',
    publisher: 'Stortinget',
    source_type: 'official_public_space_history',
    url: 'https://www.stortinget.no/no/Stortinget-og-demokratiet/sesjonsrapporter/stortingsaret-20162017/eidsvolls-plass/',
    from: 1950,
    to: null,
    limitations: [
      'Artikkelen dokumenterer etterkrigstidens og samtidens demonstrasjonsbruk, men fastslår ikke nøyaktig når plassen først ble en fast politisk demonstrasjonsarena.',
      'Stortinget forvalter plassen og beskriver dens demokratiske funksjon institusjonelt; konflikter om adgang, politi, overvåkning og ulik synlighet krever supplerende kilder.',
    ],
    tier: 'A',
    rationale: 'Offisiell kilde til Eidsvolls plass som arena for ytringsfrihet, markeringer og demonstrasjoner foran Stortinget.',
  }),
];

for (const item of newSources) {
  if (existingSourceIds.has(item.source_id)) throw new Error(`Source already exists: ${item.source_id}`);
  sourcesFile.sources.push(item);
  existingSourceIds.add(item.source_id);
}

const dossier = {
  schema_version: '1.0',
  dossier_id: 'history_political_chronology_source_dossier_v1',
  subject_id: 'historie',
  status: 'validated_repository_provenance',
  scope: 'stortinget_eidsvollsbygningen_eidsvolls_plass_1814_1913',
  accessed_at: accessedAt,
  canonical_place_files: [
    'data/places/politikk/akershus/eidsvollsbygningen/eidsvollsbygningen.json',
    'data/places/politikk/oslo/places_politikk/stortinget.json',
    'data/places/politikk/oslo/places_politikk/eidsvolls_plass.json',
  ],
  methodology: [
    'Kilder er valgt for eksplisitt støtte til daterte vedtak, institusjonelle brudd, stemmerettsgrenser, mobilisering og offentlig rom.',
    'Offisielle Stortingskilder brukes for arkiv- og institusjonsforløp og kombineres med fagredigerte SNL-kilder der uavhengig sekundærstøtte er nødvendig.',
    'Ingen kilde brukes til å gjøre én bygning eller én seremoni til universelt bevis for demokratisering eller utenrikspolitisk orientering.',
  ],
  sources: Object.fromEntries(newSources.map((item) => [item.source_id, {
    title: item.title,
    publisher: item.publisher,
    url: item.url,
    supported_scope: item.temporal_scope,
    limitations: item.limitations,
  }])),
};
writeJson(dossierPath, dossier);

const claim = ({ claim_id, statement, claim_type, place_id, case_id, from, to = null, emne_ids, source_ids, confidence = 'high', uncertainty_level = 'low', uncertainty_note, alternative }) => ({
  claim_id,
  statement,
  claim_type,
  scope: {
    geography_ids: ['geo_no_oslo_akershus'],
    place_ids: [place_id],
    case_ids: [case_id],
    temporal: { from, to },
  },
  emne_ids,
  source_ids,
  confidence,
  uncertainty: { level: uncertainty_level, note: uncertainty_note },
  alternative_interpretations: [alternative],
});

const stemmerettEmner = [
  'em_his_1814_grunnlov_statsdannelse',
  'em_his_1814_statsdannelse_stemmerett_partier_og_parlamentarisme',
  'em_his_embetsstat_demokratisering',
  'em_his_rettigheter_borgerskap_forvaltning',
  'em_his_statsborgerskap_status_rettigheter',
];
const unionEmner = [
  'em_his_1814_grunnlov_statsdannelse',
  'em_his_1814_statsdannelse_union_selvstendighet_og_1905',
  'em_his_nasjonal_identitet_fortellinger',
  'em_his_stat_institusjoner',
  'em_his_beslutningskjeder_kompetanse_ansvar',
];
const publicEmner = [
  'em_his_1814_statsdannelse_stemmerett_partier_og_parlamentarisme',
  'em_his_1814_statsdannelse_union_selvstendighet_og_1905',
  'em_his_offentlighet_mobilisering_arbeider_kvinne_og_avholdsbevegelser',
  'em_his_offentlighet_mobilisering_protest_kollektiv_handling_og_repertoarer',
  'em_his_nasjonal_identitet_fortellinger',
];

const newClaims = [
  claim({
    claim_id: 'claim_his_eidsvollsbygningen_limited_franchise_1814',
    statement: 'Stemmerettsordningen som fulgte Grunnloven i 1814 omfattet bare menn over 25 år i bestemte embets-, borger- og eiendomsgrupper; kvinner og mange menn stod uten stemmerett.',
    claim_type: 'political_rights_boundary',
    place_id: 'eidsvollsbygningen',
    case_id: 'case_his_eidsvollsbygningen',
    from: 1814,
    to: 1814,
    emne_ids: stemmerettEmner,
    source_ids: ['src_his_storting_democratic_milestones', 'src_his_snl_stemmerett_history'],
    uncertainty_note: 'Hovedgrensene er godt dokumentert; detaljerte beregninger av hvor stor del av befolkningen som var stemmeberettiget varierer etter definisjon og datagrunnlag.',
    alternative: 'Grunnloven var representativ og radikal i europeisk samtid, men dette opphever ikke at den institusjonaliserte betydelig kjønns- og statusbasert eksklusjon.',
  }),
  claim({
    claim_id: 'claim_his_stortinget_building_first_used_1866',
    statement: 'Stortinget tok sin egen bygning i bruk 5. mars 1866 etter mer enn femti år i lånte lokaler.',
    claim_type: 'institutional_infrastructure',
    place_id: 'stortinget',
    case_id: 'case_his_stortinget',
    from: '1866-03-05',
    to: '1866-03-05',
    emne_ids: ['em_his_stat_institusjoner', 'em_his_1814_grunnlov_statsdannelse', 'em_his_embetsstat_demokratisering'],
    source_ids: ['src_his_storting_building_history'],
    uncertainty_note: 'Datoen og institusjonsflyttingen er eksplisitt dokumentert; bygningens symbolske betydning er et eget fortolkningsspørsmål.',
    alternative: 'Et eget parlamentsbygg kan leses som demokratisk institusjonsbygging, men også som monumental makt og profesjonalisering av politikken.',
  }),
  claim({
    claim_id: 'claim_his_stortinget_parliamentarism_breakthrough_1884',
    statement: 'Riksrettsdommen mot regjeringen Selmer og utnevnelsen av Johan Sverdrup til statsminister i 1884 markerte parlamentarismens første gjennombrudd i Norge.',
    claim_type: 'constitutional_power_shift',
    place_id: 'stortinget',
    case_id: 'case_his_stortinget',
    from: 1884,
    to: 1884,
    emne_ids: stemmerettEmner,
    source_ids: ['src_his_storting_parliamentarism_history', 'src_his_snl_parliamentarism'],
    uncertainty_level: 'medium',
    uncertainty_note: '1884 er det tradisjonelle gjennombruddsåret, men parlamentarisk praksis ble konsolidert gradvis og var ikke fullt stabil umiddelbart etter regjeringsskiftet.',
    alternative: 'Forløpet kan tolkes både som et klart maktskifte fra konge til stortingsflertall og som første fase i en lengre konstitusjonell overgang.',
  }),
  claim({
    claim_id: 'claim_his_stortinget_universal_male_suffrage_1898',
    statement: 'Stortinget vedtok alminnelig stemmerett for menn ved stortingsvalg i 1898, samtidig som kvinner fortsatt var ekskludert fra statsborgerlig stemmerett.',
    claim_type: 'rights_expansion',
    place_id: 'stortinget',
    case_id: 'case_his_stortinget',
    from: 1898,
    to: 1898,
    emne_ids: stemmerettEmner,
    source_ids: ['src_his_storting_democratic_milestones', 'src_his_snl_stemmerett_history'],
    uncertainty_note: 'Vedtaket er sikkert datert; betegnelsen allmenn må leses sammen med fortsatt eksklusjon av kvinner og suspensjon ved mottatt fattighjelp.',
    alternative: '1898 var et stort demokratisk gjennombrudd for menn, men ikke full universell stemmerett i moderne forstand.',
  }),
  claim({
    claim_id: 'claim_his_stortinget_union_dissolved_1905_06_07',
    statement: 'Den 7. juni 1905 vedtok Stortinget enstemmig at foreningen med Sverige under én konge var oppløst fordi kongen ikke lenger fungerte som norsk konge og ikke kunne danne en ny regjering.',
    claim_type: 'constitutional_break',
    place_id: 'stortinget',
    case_id: 'case_his_stortinget',
    from: '1905-06-07',
    to: '1905-06-07',
    emne_ids: unionEmner,
    source_ids: ['src_his_storting_union_out', 'src_his_snl_norway_1905_1939'],
    uncertainty_note: 'Vedtakets dato og innhold er sikkert dokumentert; dets folkerettslige og konstitusjonelle legitimitet ble bestridt i samtid og ettertid.',
    alternative: '7. juni kan leses som en konstitusjonell konstatering av at kongemakten hadde opphørt å fungere eller som et ensidig norsk unionsbrudd som krevde senere forhandling og anerkjennelse.',
  }),
  claim({
    claim_id: 'claim_his_stortinget_union_referendum_1905_08_13',
    statement: 'Folkeavstemningen 13. august 1905 gav 368 208 stemmer for og 184 mot Stortingets 7. juni-beslutning, men bare stemmeberettigede menn kunne delta.',
    claim_type: 'referendum_and_legitimation',
    place_id: 'stortinget',
    case_id: 'case_his_stortinget',
    from: '1905-08-13',
    to: '1905-08-13',
    emne_ids: [...unionEmner, 'em_his_statsborgerskap_status_rettigheter'],
    source_ids: ['src_his_storting_union_out', 'src_his_storting_womens_petition_1905'],
    uncertainty_note: 'De offisielle stemmetallene er vel dokumentert; resultatet må tolkes sammen med at kvinner og enkelte menn var utestengt fra det politiske manntallet.',
    alternative: 'Avstemningen gav svært sterk støtte blant de stemmeberettigede, men representerte ikke et formelt uttrykk fra hele den voksne befolkningen.',
  }),
  claim({
    claim_id: 'claim_his_stortinget_womens_petition_1905',
    statement: 'Etter at kvinner ble avvist fra folkeavstemningen i 1905, samlet kvinneorganisasjoner inn nær 300 000 underskrifter til støtte for unionsoppløsningen og brukte aksjonen som argument for politiske rettigheter.',
    claim_type: 'extra_parliamentary_mobilization',
    place_id: 'stortinget',
    case_id: 'case_his_stortinget',
    from: '1905-08-05',
    to: '1905-08-31',
    emne_ids: [...stemmerettEmner, 'em_his_offentlighet_mobilisering_arbeider_kvinne_og_avholdsbevegelser'],
    source_ids: ['src_his_storting_womens_petition_1905', 'src_his_storting_suffrage_history'],
    uncertainty_level: 'medium',
    uncertainty_note: 'Kilden dokumenterer nær 300 000 navn, men listene hadde varierende alders- og registreringspraksis og er ikke direkte sammenlignbare med referendumets manntall.',
    alternative: 'Aksjonen kan leses som nasjonal enhetsmobilisering, strategisk stemmerettskamp eller begge deler samtidig.',
  }),
  claim({
    claim_id: 'claim_his_stortinget_haakon_elected_1905_11_18',
    statement: 'Etter folkeavstemningen om statsformen valgte Stortinget 18. november 1905 prins Carl av Danmark til norsk konge; han tok navnet Haakon 7.',
    claim_type: 'institutional_transition',
    place_id: 'stortinget',
    case_id: 'case_his_stortinget',
    from: '1905-11-18',
    to: '1905-11-18',
    emne_ids: unionEmner,
    source_ids: ['src_his_storting_republican_monarchy', 'src_his_storting_union_out'],
    uncertainty_note: 'Datoen og valget er eksplisitt dokumentert; spørsmålet om folkeavstemningen var et valg av konge eller et valg mellom monarki og republikk er et sentralt tolkningsspørsmål.',
    alternative: 'Kongevalget kan forstås som folkelig legitimert konstitusjonelt monarki eller som en politisk innramming som begrenset republikkanernes alternativ.',
  }),
  claim({
    claim_id: 'claim_his_stortinget_women_suffrage_1913_06_11',
    statement: 'Stortinget vedtok enstemmig alminnelig stemmerett for kvinner 11. juni 1913 ved å presisere at stemmeberettigede norske borgere omfattet både menn og kvinner.',
    claim_type: 'rights_expansion',
    place_id: 'stortinget',
    case_id: 'case_his_stortinget',
    from: '1913-06-11',
    to: '1913-06-11',
    emne_ids: stemmerettEmner,
    source_ids: ['src_his_storting_suffrage_history', 'src_his_snl_stemmerett_history'],
    uncertainty_note: 'Vedtaket og datoen er sikkert dokumentert; reell politisk likestilling fulgte ikke automatisk av den formelle stemmerettsendringen.',
    alternative: '1913 var et formelt likestillingsgjennombrudd, men må også analyseres som resultat av flere tiårs organisering og som startpunkt for videre kamp om representasjon og makt.',
  }),
  claim({
    claim_id: 'claim_his_eidsvolls_plass_haakon_oath_crowds_1905_11_27',
    statement: 'Da Haakon 7. kom til Stortinget for å avlegge ed 27. november 1905, samlet store folkemengder seg på Eidsvolls plass og langs Løvebakken som del av den offentlige iscenesettelsen av det nye monarkiet.',
    claim_type: 'public_ritual_and_participation',
    place_id: 'eidsvolls_plass',
    case_id: 'case_his_eidsvolls_plass',
    from: '1905-11-27',
    to: '1905-11-27',
    emne_ids: publicEmner,
    source_ids: ['src_his_storting_republican_monarchy'],
    uncertainty_note: 'Sted, dato og folkemengde er dokumentert gjennom institusjonell tekst og fotografi; kilden viser ikke at alle tilstedeværende delte samme syn på monarkiet.',
    alternative: 'Seremonien kan tolkes som bred offentlig legitimering, men også som statlig koreografert representasjon etter en omstridt statsformdebatt.',
  }),
  claim({
    claim_id: 'claim_his_eidsvolls_plass_demonstration_arena_postwar',
    statement: 'Eidsvolls plass foran Stortinget har gjennom store deler av etterkrigstiden vært en sentral arena for demonstrasjoner, markeringer og direkte offentlig henvendelse til nasjonale politikere.',
    claim_type: 'public_sphere_function',
    place_id: 'eidsvolls_plass',
    case_id: 'case_his_eidsvolls_plass',
    from: 1950,
    to: null,
    emne_ids: publicEmner,
    source_ids: ['src_his_storting_eidsvolls_plass'],
    uncertainty_level: 'medium',
    uncertainty_note: 'Kilden dokumenterer arkivbilder og omfattende bruk i etterkrigstiden, men fastsetter ikke et entydig startår for plassens demonstrasjonsfunksjon.',
    alternative: 'Plassen kan forstås som demokratisk talerstol, men adgangsregler, politi, overvåkning og ulik ressursstyrke påvirker hvem som faktisk blir synlig og hørt.',
  }),
  claim({
    claim_id: 'claim_his_stortinget_consular_conflict_foreign_service_1905',
    statement: 'Kravet om en egen norsk konsulattjeneste ble den utløsende unionskonflikten i 1905; da kong Oscar 2. nektet å sanksjonere konsulatloven, endte forløpet i Stortingets 7. juni-beslutning og behovet for en selvstendig norsk utenrikstjeneste.',
    claim_type: 'foreign_policy_conflict',
    place_id: 'stortinget',
    case_id: 'case_his_stortinget',
    from: 1905,
    to: 1905,
    emne_ids: unionEmner,
    source_ids: ['src_his_storting_union_out', 'src_his_snl_norway_1905_1939'],
    uncertainty_note: 'Konsulatsakens rolle og oppbyggingen av egen utenrikstjeneste er dokumentert; utenrikspolitisk orientering etter 1905 var bredere enn denne ene institusjonelle konflikten.',
    alternative: 'Konsulatsaken kan tolkes som en konkret administrativ strid, et strategisk middel for unionsoppløsning eller uttrykk for et mer langsiktig krav om utenrikspolitisk suverenitet.',
  }),
  claim({
    claim_id: 'claim_his_stortinget_interparliamentary_peace_conference_1899',
    statement: 'Stortinget deltok aktivt i Den interparlamentariske unions fredsarbeid fra 1890-årene og var møtested for organisasjonens konferanse i Kristiania i 1899.',
    claim_type: 'international_parliamentary_engagement',
    place_id: 'stortinget',
    case_id: 'case_his_stortinget',
    from: 1890,
    to: 1899,
    emne_ids: ['em_his_1814_statsdannelse_union_selvstendighet_og_1905', 'em_his_stat_institusjoner', 'em_his_nasjonal_identitet_fortellinger'],
    source_ids: ['src_his_storting_union_out'],
    uncertainty_note: 'Stortingets deltakelse og konferansen i 1899 er dokumentert; dette er ikke alene bevis for en samlet norsk freds- eller utenrikspolitisk linje.',
    alternative: 'Engasjementet kan leses som tidlig parlamentarisk internasjonalisme, men også som en av flere parallelle strategier i en periode som samtidig var preget av militær opprustning.',
  }),
];

for (const item of newClaims) {
  if (existingClaimIds.has(item.claim_id)) throw new Error(`Claim already exists: ${item.claim_id}`);
  claimsFile.claims.push(item);
  existingClaimIds.add(item.claim_id);
}

const evidence = ({ evidence_id, place_id, case_id, claim_id, source_ids, emne_ids }) => ({
  evidence_id,
  profile_id: 'profile_historie_no_oslo_akershus',
  geography_id: 'geo_no_oslo_akershus',
  place_id,
  case_id,
  emne_ids,
  claim_id,
  source_ids,
  support_type: source_ids.length > 1 ? 'corroborated' : 'direct_single_source',
  validation_status: 'validated_case',
  limitations_inherited: true,
  note: 'Politisk kronologi V1-kobling materialisert fra canonical steder og eksplisitt avgrensede Stortings- og fagkilder.',
});

const evidenceIds = [
  'evidence_his_eidsvollsbygningen_03',
  'evidence_his_stortinget_01',
  'evidence_his_stortinget_02',
  'evidence_his_stortinget_03',
  'evidence_his_stortinget_04',
  'evidence_his_stortinget_05',
  'evidence_his_stortinget_06',
  'evidence_his_stortinget_07',
  'evidence_his_stortinget_08',
  'evidence_his_eidsvolls_plass_01',
  'evidence_his_eidsvolls_plass_02',
  'evidence_his_stortinget_09',
  'evidence_his_stortinget_10',
];
const newEvidence = newClaims.map((item, index) => evidence({
  evidence_id: evidenceIds[index],
  place_id: item.scope.place_ids[0],
  case_id: item.scope.case_ids[0],
  claim_id: item.claim_id,
  source_ids: item.source_ids,
  emne_ids: item.emne_ids,
}));
for (const item of newEvidence) {
  if (existingEvidenceIds.has(item.evidence_id)) throw new Error(`Evidence already exists: ${item.evidence_id}`);
  evidenceFile.evidence_links.push(item);
  existingEvidenceIds.add(item.evidence_id);
}

const requirementIds = [
  'case_req_his_temporal_sequence',
  'case_req_his_actor_conflict',
  'case_req_his_source_comparison',
  'case_req_his_comparative_scale',
];
for (const [caseId, placeId] of [['case_his_stortinget', 'stortinget'], ['case_his_eidsvolls_plass', 'eidsvolls_plass']]) {
  const profileCase = A(profile.cases).find((item) => item.case_id === caseId);
  if (!profileCase) throw new Error(`Missing profile case: ${caseId}`);
  if (profileCase.evidence_status !== 'unverified') throw new Error(`${caseId} is no longer an unverified baseline candidate.`);
  profileCase.status = 'pilot_validated';
  profileCase.evidence_status = 'claim_source_linked';
  profileCase.place_ids = [placeId];
  profileCase.case_requirement_ids = requirementIds;
  profileCase.validation = {
    status: 'validated_case',
    batch_id: 'history_political_chronology_evidence_v1',
    validated_at: accessedAt,
    minimum_evidence_links: 2,
    source_policy: 'canonical_registry_with_explicit_limitations',
  };
}

const claimById = new Map(A(claimsFile.claims).map((item) => [item.claim_id, item]));
const evidenceByClaim = new Map(A(evidenceFile.evidence_links).map((item) => [item.claim_id, item]));

const theorySpecs = [
  {
    theory_id: 'theory_his_1814_statsdannelse_stemmerett_partier_og_parlamentarisme',
    claim_ids: [
      'claim_his_eidsvollsbygningen_constitution_1814',
      'claim_his_eidsvollsbygningen_limited_franchise_1814',
      'claim_his_stortinget_building_first_used_1866',
      'claim_his_stortinget_parliamentarism_breakthrough_1884',
      'claim_his_stortinget_universal_male_suffrage_1898',
      'claim_his_stortinget_womens_petition_1905',
      'claim_his_stortinget_women_suffrage_1913_06_11',
      'claim_his_eidsvolls_plass_demonstration_arena_postwar',
    ],
    rationale: 'Eidsvollsbygningen dokumenterer både grunnlovsbruddet i 1814 og den begrensede stemmerettsordningen. Stortinget viser deretter institusjonsbygging, parlamentarismens gradvise maktskifte og formelle stemmerettsutvidelser i 1898 og 1913, mens kvinnenes underskriftsaksjon og Eidsvolls plass viser at demokratisering også skjedde gjennom organisering og offentlig press utenfor selve voteringene.',
    limitations: [
      'Casene dokumenterer nasjonale vedtak og hovedstadens offentlige rom, men ikke lokale valgerfaringer, partiorganisasjonenes regionale utvikling eller alle sosiale grupper som fortsatt møtte barrierer.',
      'Formell stemmerett og parlamentariske regler dokumenterer ikke automatisk faktisk representasjon, valgdeltakelse, politisk innflytelse eller sosial likhet.',
    ],
    alternative_interpretations: [
      'Forløpet kan leses som gradvis demokratisk utvidelse, men også som konfliktfylt inkorporering der etablerte institusjoner åpnet seg sent og under press fra organiserte grupper.',
    ],
    disconfirmation_conditions: [
      'Anvendelsen svekkes dersom vedtaksdatoer behandles som fullførte demokratiske gjennombrudd uten kilder til fortsatt eksklusjon, organisering, praksis og representasjon.',
    ],
  },
  {
    theory_id: 'theory_his_1814_statsdannelse_union_selvstendighet_og_1905',
    claim_ids: [
      'claim_his_eidsvollsbygningen_constitution_1814',
      'claim_his_stortinget_union_dissolved_1905_06_07',
      'claim_his_stortinget_union_referendum_1905_08_13',
      'claim_his_stortinget_womens_petition_1905',
      'claim_his_stortinget_haakon_elected_1905_11_18',
      'claim_his_eidsvolls_plass_haakon_oath_crowds_1905_11_27',
    ],
    rationale: 'Eidsvollsbygningen gir den konstitusjonelle rammen fra 1814, mens Stortingets 7. juni-beslutning, folkeavstemning, kvinneaksjon og kongevalg følger hvordan selvstendighet ble vedtatt, legitimert, bestridt og institusjonalisert i 1905. Eidsvolls plass dokumenterer at den nye statsordningen også ble offentlig iscenesatt i møte mellom institusjon og folkemengde.',
    limitations: [
      'Materialet er norsk og hovedstadsorientert og gir begrenset innsyn i svenske politiske miljøer, Karlstadforhandlingenes detaljforløp, grenseområder og regionale mottakelser.',
      'Folkeavstemninger og seremonier viser legitimeringsformer, men kan ikke alene dokumentere en samlet folkevilje når kvinner og enkelte menn var formelt ekskludert.',
    ],
    alternative_interpretations: [
      '1905 kan forstås som fredelig nasjonal selvstendighet, men også som en konstitusjonell maktstrategi som først fikk endelig virkning gjennom svensk anerkjennelse, forhandling og ny statsordning.',
    ],
    disconfirmation_conditions: [
      'Anvendelsen svekkes dersom 7. juni behandles som en isolert og endelig hendelse uten konsulatsak, folkeavstemning, forhandling, anerkjennelse og statsformdebatt.',
    ],
  },
  {
    theory_id: 'theory_his_1814_statsdannelse_1905_unionsopplosning_og_ny_utenrikspolitisk_orientering',
    claim_ids: [
      'claim_his_stortinget_interparliamentary_peace_conference_1899',
      'claim_his_stortinget_consular_conflict_foreign_service_1905',
      'claim_his_stortinget_union_dissolved_1905_06_07',
      'claim_his_stortinget_haakon_elected_1905_11_18',
      'claim_his_eidsvolls_plass_haakon_oath_crowds_1905_11_27',
    ],
    rationale: 'Stortingets internasjonale fredsengasjement før 1905 viser at norske parlamentarikere allerede opererte i transnasjonale nettverk. Konsulatsaken og 7. juni-beslutningen dokumenterer kravet om egen utenrikspolitisk handleevne, mens kongevalget og edsavleggelsen viser hvordan den selvstendige staten etablerte ny representasjon og legitimitet etter unionsbruddet.',
    limitations: [
      'Casene dokumenterer den konstitusjonelle og symbolske starten på en selvstendig utenrikspolitikk, men ikke den løpende diplomatiske praksisen, utenriksdepartementets organisasjon eller konkrete bilaterale relasjoner etter 1905.',
      'Fredskonferansen i 1899 viser parlamentarisk internasjonalisme, men kan ikke alene brukes som bevis for en enhetlig norsk fredspolitisk orientering, særlig fordi perioden også var preget av opprustning.',
    ],
    alternative_interpretations: [
      'Den nye orienteringen kan leses som overgang fra svenskstyrt konsulat- og utenrikspolitikk til norsk suverenitet, men også som pragmatisk statsbygging innen eksisterende europeiske makt- og dynastinettverk.',
    ],
    disconfirmation_conditions: [
      'Anvendelsen svekkes dersom utenrikspolitisk orientering utledes bare fra kongevalg og seremoni uten dokumentasjon av konsulatsak, institusjonsbygging, diplomati og internasjonale forbindelser.',
    ],
  },
];

for (const spec of theorySpecs) {
  if (!theoryById.has(spec.theory_id)) throw new Error(`Unknown theory: ${spec.theory_id}`);
  if (existingTheoryEvidenceIds.has(spec.theory_id)) throw new Error(`Theory evidence already exists: ${spec.theory_id}`);
  const selectedClaims = spec.claim_ids.map((id) => {
    const item = claimById.get(id);
    if (!item) throw new Error(`Unknown claim for ${spec.theory_id}: ${id}`);
    if (!evidenceByClaim.has(id)) throw new Error(`Claim lacks evidence for ${spec.theory_id}: ${id}`);
    return item;
  });
  theoryRegistry.entries.push({
    theory_id: spec.theory_id,
    status: 'evidence_ready',
    scope_status: 'multi_case_geographic_pilot',
    universalization_status: 'provisional_not_universal',
    claim_ids: spec.claim_ids,
    source_ids: sorted(selectedClaims.flatMap((item) => A(item.source_ids))),
    case_ids: sorted(selectedClaims.flatMap((item) => A(item.scope?.case_ids))),
    place_ids: sorted(selectedClaims.flatMap((item) => A(item.scope?.place_ids))),
    emne_ids: sorted(selectedClaims.flatMap((item) => A(item.emne_ids))),
    evidence_link_ids: sorted(selectedClaims.map((item) => evidenceByClaim.get(item.claim_id)?.evidence_id).filter(Boolean)),
    evidence_dimensions: [
      'documented_application',
      'limitation_test',
      'alternative_interpretation',
      'multi_case_comparison',
      'new_claim_source_case_foundation',
    ],
    rationale: spec.rationale,
    limitations: spec.limitations,
    alternative_interpretations: spec.alternative_interpretations,
    disconfirmation_conditions: spec.disconfirmation_conditions,
    scope_note: 'Dette er et fler-case evidensgrunnlag i Oslo/Akershus og er ikke universelt bevis for teoriens gyldighet på tvers av alle perioder, geografier, aktørgrupper og kildetyper.',
  });
  existingTheoryEvidenceIds.add(spec.theory_id);
}

const totalTheories = theoryById.size;
const qualifyingEntries = theoryRegistry.entries.length;
theoryRegistry.completion = {
  total_theories: totalTheories,
  qualifying_entries: qualifyingEntries,
  ratio: Math.round((qualifyingEntries / totalTheories) * 1000) / 1000,
  pilot_target: 10,
  universal_target_ratio: 1,
  universal_status: qualifyingEntries === totalTheories ? 'COMPLETE' : 'INCOMPLETE',
};

const verifiedCases = A(profile.cases).filter((item) => item.evidence_status === 'claim_source_linked');
profile.migration_summary.validated_cases = verifiedCases.length;
profile.migration_summary.unverified_case_candidates = profile.cases.length - verifiedCases.length;
profile.production_coverage.cases_total = profile.cases.length;
profile.production_coverage.claims_total = claimsFile.claims.length;
profile.production_coverage.sources_total = sourcesFile.sources.length;
profile.production_coverage.evidence_links_total = evidenceFile.evidence_links.length;
profile.production_coverage.verified_cases_total = verifiedCases.length;
profile.production_coverage.status = 'COMPLETE';
profile.production_coverage.interpretation = 'Profilen har et representativt minimumsgrunnlag og er utvidet med nye claim-, source- og place-evidence-baner for Stortinget og Eidsvolls plass. Fullført profilstatus gjelder minimumsgrunnlaget; resterende kandidater og teoriavhengigheter er fortsatt eksplisitt produksjonskø.';

writeJson(sourcesPath, sourcesFile);
writeJson(claimsPath, claimsFile);
writeJson(evidencePath, evidenceFile);
writeJson(profilePath, profile);
writeJson(theoryRegistryPath, theoryRegistry);

const resolvedCategory = A(gapV1.categories).find((item) => item.category_id === 'national_political_chronology');
if (!resolvedCategory) throw new Error('Gap inventory V1 lacks national_political_chronology.');
const remainingCategories = A(gapV1.categories).filter((item) => item.category_id !== 'national_political_chronology');
const gapV2 = {
  schema_version: '2.0',
  report_id: 'history_theory_evidence_gap_inventory_v2',
  subject_id: 'historie',
  status: 'ACTIVE_PRODUCTION_DEPENDENCY_MAP',
  authority_note: 'Rapporten identifiserer dokumenterte produksjonsavhengigheter. Den kvalifiserer ingen teori og skal ikke brukes til å omgå teori-evidenskontrakten.',
  baseline: {
    total_theories: totalTheories,
    qualifying_after_political_chronology_v1: qualifyingEntries,
    remaining_theories: totalTheories - qualifyingEntries,
    ratio: theoryRegistry.completion.ratio,
    universal_status: theoryRegistry.completion.universal_status,
  },
  resolved_categories: [{
    ...resolvedCategory,
    status: 'resolved_v1_with_new_claim_source_case_foundation',
    resolution: {
      phase_id: 'history_political_chronology_evidence_v1',
      qualified_theory_ids: theorySpecs.map((item) => item.theory_id),
      new_claim_ids: newClaims.map((item) => item.claim_id),
      new_source_ids: newSources.map((item) => item.source_id),
      newly_verified_case_ids: ['case_his_stortinget', 'case_his_eidsvolls_plass'],
      note: 'Kategorien er løst på V1-nivå med eksplisitte begrensninger. Videre geografisk og sosial bredde er fortsatt nødvendig før universalisering.',
    },
  }],
  categories: remainingCategories,
  source_fingerprints: {
    [relative(theoriesPath)]: sha256(theoriesPath),
    [relative(theoryRegistryPath)]: sha256(theoryRegistryPath),
    [relative(claimsPath)]: sha256(claimsPath),
    [relative(sourcesPath)]: sha256(sourcesPath),
    [relative(evidencePath)]: sha256(evidencePath),
    [relative(profilePath)]: sha256(profilePath),
    [relative(dossierPath)]: sha256(dossierPath),
  },
  production_rule: 'Neste fase skal velges fra aktive kategorier og først produsere de nye claims, kildene, casene, aktørperspektivene og geografiene som kategorien krever. Gjenbruk alene kvalifiserer ikke et teoriobjekt.',
};
writeJson(gapV2Path, gapV2);
const gapMarkdown = [
  '# Historie — teori-evidens gap-inventar V2',
  '',
  `Status: **${gapV2.status}**`,
  '',
  gapV2.authority_note,
  '',
  '## Produksjonsstatus',
  '',
  `- Kvalifiserende teoriobjekter: **${qualifyingEntries} av ${totalTheories}**`,
  `- Gjenstående teoriobjekter: **${totalTheories - qualifyingEntries}**`,
  `- Andel: **${Math.round(theoryRegistry.completion.ratio * 1000) / 10} %**`,
  `- Universell status: **${theoryRegistry.completion.universal_status}**`,
  '',
  '## Løst siden V1',
  '',
  '- `national_political_chronology`: løst med 13 nye claims, 11 nye kildeposter, to nyvaliderte cases og tre kvalifiserte teoriobjekter.',
  '',
  '## Aktive produksjonsavhengigheter',
  '',
  '| Familie | Status | Teoriobjekter | Krav før produksjon |',
  '|---|---|---:|---|',
  ...remainingCategories.map((item) => `| ${item.category_id} | ${item.status} | ${item.theory_ids.length} | ${item.requirement} |`),
  '',
  '## Produksjonsregel',
  '',
  gapV2.production_rule,
  '',
].join('\n');
fs.writeFileSync(gapV2MarkdownPath, `${gapMarkdown}\n`);

const phaseDoc = `# Historie — politisk kronologi evidens V1\n\n## Scope\n\nFasen etablerer nye claim–source–case-baner for stemmerett, parlamentarisme, unionsoppløsningen i 1905 og begynnelsen på en selvstendig norsk utenrikspolitisk institusjon.\n\n## Produksjon\n\n- Nye canonical claims: **${newClaims.length}**\n- Nye canonical kilder: **${newSources.length}**\n- Nyvaliderte cases: **Stortinget** og **Eidsvolls plass**\n- Kvalifiserte teoriobjekter: **${theorySpecs.length}**\n- Samlet teori-evidensstatus: **${qualifyingEntries} av ${totalTheories}**\n\n## Kontraktsgrense\n\n- Eidsvollsbygningen, Stortinget og Eidsvolls plass er geografiske pilotcases, ikke universelt bevis.\n- 1884 behandles som første parlamentariske gjennombrudd, ikke som øyeblikkelig full konsolidering.\n- 1898 og 1913 behandles som formelle rettighetsutvidelser, ikke som full sosial eller politisk likhet.\n- 1905 behandles som et flertrinnsforløp med konsulatsak, 7. juni-beslutning, folkeavstemning, kvinneaksjon, forhandling, kongevalg og offentlig legitimering.\n- Utenrikspolitisk orientering er dokumentert på institusjonelt startnivå; senere diplomatisk praksis krever nye kilder og cases.\n\n## Proveniens\n\nCanonical source dossier: \`${dossierRepositoryPath}\`.\n`;
fs.writeFileSync(phaseDocPath, phaseDoc);

let docs = fs.readFileSync(docsPath, 'utf8');
const oldParagraph = 'Den universelle Historie-auditen måler andelen av de 230 teoriobjektene som har kvalifiserende entries i evidensregisteret. Batch 1 etablerte kontrakten med ti objekter, batch 2 tilføyde tolv, og batch 3 tilfører ti med egne claim-profiler. Produksjonen står dermed på 32 av 230. Universell produksjonsstatus forblir `INCOMPLETE` frem til 230 av 230 objekter har et validert evidensgrunnlag.';
const newParagraph = 'Den universelle Historie-auditen måler andelen av de 230 teoriobjektene som har kvalifiserende entries i evidensregisteret. De tre første batchene etablerte 32 objekter. Politisk kronologi evidens V1 tilfører tre objekter på grunnlag av 13 nye claims, 11 nye kildeposter og to nyvaliderte cases. Produksjonen står dermed på 35 av 230. Universell produksjonsstatus forblir `INCOMPLETE` frem til 230 av 230 objekter har et validert evidensgrunnlag.';
if (!docs.includes(oldParagraph)) throw new Error('Expected theory evidence completion paragraph was not found.');
docs = docs.replace(oldParagraph, newParagraph);
const oldStatus = '- Batch 1: **10** kvalifiserende teoriobjekter.\n- Batch 2: **12** nye kvalifiserende teoriobjekter.\n- Batch 3: **10** nye kvalifiserende teoriobjekter med egne claim-profiler.\n- Totalt: **32 av 230** teoriobjekter (**13,9 %**).\n- Universell status: **INCOMPLETE**.\n- Produksjonsavhengigheter: `reports/historie-theory-evidence/history-theory-evidence-gap-inventory-v1.md`.';
const newStatus = '- Batch 1: **10** kvalifiserende teoriobjekter.\n- Batch 2: **12** nye kvalifiserende teoriobjekter.\n- Batch 3: **10** nye kvalifiserende teoriobjekter med egne claim-profiler.\n- Politisk kronologi evidens V1: **3** nye kvalifiserende teoriobjekter, **13** nye claims og **2** nyvaliderte cases.\n- Totalt: **35 av 230** teoriobjekter (**15,2 %**).\n- Universell status: **INCOMPLETE**.\n- Produksjonsavhengigheter: `reports/historie-theory-evidence/history-theory-evidence-gap-inventory-v2.md`.';
if (!docs.includes(oldStatus)) throw new Error('Expected theory evidence production status block was not found.');
docs = docs.replace(oldStatus, newStatus);
fs.writeFileSync(docsPath, docs.endsWith('\n') ? docs : `${docs}\n`);

console.log(JSON.stringify({
  status: 'MATERIALIZED',
  new_sources: newSources.length,
  new_claims: newClaims.length,
  new_evidence_links: newEvidence.length,
  newly_verified_cases: 2,
  new_theory_entries: theorySpecs.length,
  theory_completion: `${qualifyingEntries}/${totalTheories}`,
  profile_verified_cases: verifiedCases.length,
  profile_claims: claimsFile.claims.length,
  profile_sources: sourcesFile.sources.length,
  profile_evidence_links: evidenceFile.evidence_links.length,
}, null, 2));
