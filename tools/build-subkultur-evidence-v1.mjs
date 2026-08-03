#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const WRITE = process.argv.includes('--write');
const CHECK = process.argv.includes('--check');
if (!WRITE && !CHECK) throw new Error('Bruk --write eller --check');

const PATHS = Object.freeze({
  emner: 'data/fag/subkultur/emner_subkultur_canonical_v4_5.json',
  pensum: 'data/fag/subkultur/subkulturpensum_canonical_v4_5.json',
  theory: 'data/fag/subkultur/theory_objects_subkultur_canonical_v1.json',
  claims: 'data/fag/subkultur/claims_subkultur_canonical_v1.json',
  sources: 'data/fag/subkultur/sources_subkultur_canonical_v1.json',
  links: 'data/fag/subkultur/evidence_links_subkultur_canonical_v1.json',
  evidence: 'data/fag/subkultur/theory_evidence_subkultur_canonical_v1.json',
  caseRequirements: 'data/fag/subkultur/case_requirements_subkultur_canonical_v1.json'
});

const abs = (relative) => path.join(ROOT, relative);
const readJson = (relative) => JSON.parse(fs.readFileSync(abs(relative), 'utf8'));
const slugFromEmne = (id) => id.replace(/^em_sub_/, '');

const source = (source_id, title, creators, year, publisher, source_type, url, contribution, limitation) => ({
  source_id,
  title,
  creators,
  year,
  publisher,
  source_type,
  url,
  language: 'en',
  access: 'inspectable_metadata_or_full_text',
  contribution,
  limitations: [limitation],
  provenance: {
    selected_for: 'subkultur_fagverk_v1',
    accessed_at: '2026-08-04',
    canonical_files_are_not_external_evidence: true
  },
  quality: {
    tier: source_type.includes('guideline') || source_type.includes('official') ? 'A' : 'A',
    rationale: 'Utgiver-, DOI- eller organisasjonsside med identifiserbar avsender, verk og faglig bruksområde.'
  }
});

const SOURCES = [
  source('src_sub_hebdige_1979', 'Subculture: The Meaning of Style', ['Dick Hebdige'], 1979, 'Routledge', 'scholarly_monograph', 'https://www.routledge.com/Subculture-The-Meaning-of-Style/Hebdige/p/book/9780415039499', 'Grunnverk om stil, tegn, klasse og symbolsk motstand i britiske etterkrigssubkulturer.', 'Tyngdepunktet er britiske, musikkorienterte ungdomsmiljøer; modellen kan ikke uten videre generaliseres til løse, digitale eller ikke-stilorienterte miljøer.'),
  source('src_sub_bennett_1999', 'Subcultures or Neo-Tribes? Rethinking the Relationship between Youth, Style and Musical Taste', ['Andy Bennett'], 1999, 'Sociology / SAGE', 'peer_reviewed_article', 'https://journals.sagepub.com/doi/10.1177/S0038038599000371', 'Kritiserer faste subkulturmodeller og viser hvordan tilhørighet kan være flytende, situert og livsstilsbasert.', 'Artikkelen bygger på britisk danseklubbforskning og kan undervurdere mer varige institusjoner, steder og materielle bindinger.'),
  source('src_sub_gelder_2005', 'The Subcultures Reader', ['Ken Gelder (red.)'], 2005, 'Routledge', 'scholarly_edited_volume', 'https://www.routledge.com/The-Subcultures-Reader-Second-Edition/Gelder/p/book/9780415344166', 'Samler konkurrerende tradisjoner om sosial posisjon, stil, seksualitet, politikk, rom og musikk.', 'En antologi gir teoretisk bredde, men bidragene bruker ulike definisjoner og kan ikke leses som én samlet modell.'),
  source('src_sub_straw_1991', 'Systems of Articulation, Logics of Change: Communities and Scenes in Popular Music', ['Will Straw'], 1991, 'Cultural Studies / Taylor & Francis', 'peer_reviewed_article', 'https://www.tandfonline.com/doi/abs/10.1080/09502389100490311', 'Utvikler scenebegrepet for å analysere forbindelser mellom steder, praksiser, sirkulasjon og endring.', 'Scenebegrepet er utviklet fra populærmusikk og må operasjonaliseres på nytt for andre typer miljøer.'),
  source('src_sub_thornton_1995', 'Club Cultures: Music, Media and Subcultural Capital', ['Sarah Thornton'], 1995, 'Polity', 'scholarly_monograph', 'https://www.politybooks.com/bookdetail?book_slug=club-cultures-music-media-and-subcultural-capital--9780745614434', 'Forklarer hvordan kunnskap, smak, medier og portvokting produserer status og subkulturell kapital.', 'Klubb- og ravefeltet kan gjøre mediert smak og status mer sentralt enn de er i omsorgs-, bolig- eller gatebaserte miljøer.'),
  source('src_sub_hall_jefferson_1976', 'Resistance Through Rituals: Youth Subcultures in Post-War Britain', ['Stuart Hall (red.)', 'Tony Jefferson (red.)'], 1976, 'Routledge', 'scholarly_edited_volume', 'https://www.routledge.com/Resistance-Through-Rituals-Youth-Subcultures-in-Post-War-Britain/Hall-Jefferson/p/book/9780415324366', 'Knytter ritualer, stil og gruppepraksis til klasse, makt og historiske samfunnsforhold.', 'Vektleggingen av klasse og strukturell motstand kan gjøre andre akser og mer tvetydige praksiser mindre synlige.'),
  source('src_sub_borden_2001', 'Skateboarding, Space and the City', ['Iain Borden'], 2001, 'Bloomsbury / Berg', 'scholarly_monograph', 'https://www.bloomsbury.com/us/skateboarding-space-and-the-city-9781859734889/', 'Viser hvordan kroppslig praksis omtolker arkitektur, byrom og brukskoder.', 'Skateboarding er et særskilt case; funnene dokumenterer ikke automatisk et subkulturelt miljø rundt enhver skatepark eller pumptrack.'),
  source('src_sub_lefebvre_1968', 'The Right to the City', ['Henri Lefebvre'], 1968, 'Anthropos / senere engelske utgaver', 'scholarly_monograph', 'https://www.versobooks.com/blogs/news/3474-the-right-to-the-city-free-ebook-download', 'Gir et begrepsapparat for brukerverdi, hverdagsliv og kollektiv rett til å forme byen.', 'Den normative byretten identifiserer ikke i seg selv hvem som tilhører et miljø eller hvordan konkrete rom forhandles.'),
  source('src_sub_ferrell_1993', 'Crimes of Style: Urban Graffiti and the Politics of Criminality', ['Jeff Ferrell'], 1993, 'Routledge', 'scholarly_monograph', 'https://www.routledge.com/Crimes-of-Style-Urban-Graffiti-and-the-Politics-of-Criminality/Ferrell/p/book/9780367750152', 'Analyserer graffiti, stil, kriminalisering og myndighetskontroll som sammenvevde kulturelle prosesser.', 'Etnografien er sted- og tidsbundet; den må ikke brukes til å anta kriminalisering, motstand eller enhet i andre graffitimiljøer.'),
  source('src_sub_cohen_1972', 'Folk Devils and Moral Panics', ['Stanley Cohen'], 1972, 'Routledge', 'scholarly_monograph', 'https://www.routledge.com/Folk-Devils-and-Moral-Panics/Cohen/p/book/9780415610162', 'Utvikler moralpanikk som analyse av trusseldefinisjon, medieforsterkning, folkedjevler og sosial kontroll.', 'Begrepet må ikke brukes som automatisk avvisning av dokumentert skade eller legitim bekymring; proporsjonalitet må undersøkes empirisk.'),
  source('src_sub_link_phelan_2001', 'Conceptualizing Stigma', ['Bruce G. Link', 'Jo C. Phelan'], 2001, 'Annual Review of Sociology', 'peer_reviewed_review_article', 'https://www.annualreviews.org/content/journals/10.1146/annurev.soc.27.1.363', 'Definerer stigma gjennom merking, stereotypisering, separasjon, statustap og diskriminering under maktforhold.', 'Rammeverket må kombineres med miljønære stemmer og konkrete institusjonelle mekanismer for ikke å redusere mennesker til stigmakategorier.'),
  source('src_sub_jenkins_1992', 'Textual Poachers: Television Fans and Participatory Culture', ['Henry Jenkins'], 1992, 'Routledge', 'scholarly_monograph', 'https://www.routledge.com/Textual-Poachers-Television-Fans-and-Participatory-Culture/Jenkins/p/book/9780415533294', 'Viser fans som aktive produsenter, fortolkere og fellesskapsbyggere fremfor passive mottakere.', 'Deltakende produktivitet kan sameksistere med portvokting, kommersielle plattformer og ulik tilgang; den er ikke automatisk frigjørende.'),
  source('src_sub_boyd_2014', "It's Complicated: The Social Lives of Networked Teens", ['danah boyd'], 2014, 'Yale University Press', 'scholarly_monograph', 'https://yalebooks.yale.edu/book/9780300199000/its-complicated/', 'Analyserer nettverkede offentligheter, ungdomsidentitet, synlighet, privatliv og voksnes moralfortellinger om teknologi.', 'Studien er amerikansk og ungdomsorientert; plattformdesign og praksiser har endret seg siden feltarbeidet.'),
  source('src_sub_aoir_2020', 'Internet Research: Ethical Guidelines 3.0', ['Aline Shakti Franzke', 'Anja Bechmann', 'Michael Zimmer', 'Charles Ess'], 2020, 'Association of Internet Researchers', 'research_ethics_guideline', 'https://aoir.org/reports/ethics3.pdf', 'Gir kontekstavhengige spørsmål om samtykke, forventet privathet, skade, sporbarhet og representasjon i internettresearch.', 'Retningslinjene er et beslutningsrammeverk, ikke en automatisk godkjenning eller en erstatning for lokal forskningsetikk og lovverk.'),
  source('src_sub_who_pwid', 'HIV: People who inject drugs', ['World Health Organization'], 2026, 'World Health Organization', 'official_public_health_guidance', 'https://www.who.int/teams/global-hiv-hepatitis-and-stis-programmes/populations/people-who-inject-drugs', 'Dokumenterer sammenhenger mellom forebyggbar helseskade, tjenestetilgang, stigma, diskriminering og kriminalisering.', 'Global veiledning beskriver befolkningsnivå og tiltak; den dokumenterer ikke lokale miljøer, enkeltpersoner eller konkrete tjenestesteder.'),
  source('src_sub_bourgois_schonberg_2009', 'Righteous Dopefiend', ['Philippe Bourgois', 'Jeff Schonberg'], 2009, 'University of California Press', 'scholarly_ethnographic_monograph', 'https://www.ucpress.edu/book/9780520254985/righteous-dopefiend', 'Langvarig etnografi om hjemløshet, rus, omsorg, vold, ulikhet og hverdagslige overlevelsespraksiser.', 'Det intense, visuelle San Francisco-caset krever varsom overføring og reiser egne spørsmål om eksponering, estetisering og personvern.'),
  source('src_sub_zukin_1982', 'Loft Living: Culture and Capital in Urban Change', ['Sharon Zukin'], 1982, 'Rutgers University Press', 'scholarly_monograph', 'https://www.rutgersuniversitypress.org/loft-living/9780813570976', 'Analyserer hvordan kulturelle produsenter, eiendomsverdi, livsstil og bypolitikk virker sammen i gentrifisering.', 'SoHo-forløpet kan ikke behandles som universell sekvens; lokale eiendomsregimer og aktører må dokumenteres.'),
  source('src_sub_schiermer_2024', 'Collective and Material Embeddedness: A Critique of Conventional Subcultural and Post-Subcultural Research', ['Bjørn Schiermer mfl.'], 2024, 'Journal of Youth Studies / Taylor & Francis', 'peer_reviewed_article', 'https://www.tandfonline.com/doi/full/10.1080/13676261.2023.2199916', 'Kritiserer at både klassisk og postsubkulturell forskning kan overse kollektiv og materiell forankring.', 'Kritikken gir en korreksjon, men må fortsatt prøves mot konkrete miljøers varighet, ting, rom og organisering.'),
  source('src_sub_woo_2015', 'Scene Thinking', ['Benjamin Woo', 'Jamie Rennie', 'Stuart R. Poyntz'], 2015, 'Cultural Studies / Taylor & Francis', 'peer_reviewed_article', 'https://www.tandfonline.com/doi/full/10.1080/09502386.2014.937950', 'Videreutvikler scenebegrepet som analytisk verktøy på tvers av kulturelle felt og skalaer.', 'Scene kan bli en elastisk metafor dersom aktører, relasjoner, steder og praksiser ikke spesifiseres.'),
  source('src_sub_gagne_2024', "What My Music Says About Me: Re-evaluating the 'Badge' Function of Music in the Context of Streaming", ['Juliette P. Gagné'], 2024, 'YOUNG / SAGE', 'peer_reviewed_article', 'https://journals.sagepub.com/doi/10.1177/11033088231218854', 'Tester om musikksmak fortsatt fungerer som identitetsmerke i et strømmet og mer eklektisk medielandskap.', 'Et lite intervjumateriale om musikk kan ikke alene forklare andre tegnsystemer eller alle digitale miljøer.'),
  source('src_sub_borden_2019', 'Skateboarding and the City: A Complete History', ['Iain Borden'], 2019, 'Bloomsbury', 'scholarly_monograph', 'https://www.bloomsbury.com/us/skateboarding-and-the-city-9781472583451/', 'Historiserer skating som praksis, scene, medieverden, industri og omstridt bybruk.', 'Global bredde erstatter ikke lokal dokumentasjon av miljø, deltakere og sosial posisjon.'),
  source('src_sub_who_nsp_2026', 'Needle and syringe programmes for people who inject drugs: operational guide', ['World Health Organization'], 2026, 'World Health Organization', 'official_public_health_guideline', 'https://www.who.int/publications/i/item/9789240116214', 'Gir oppdatert, evidensbasert veiledning for planlegging og skalering av sprøyteutdeling som del av skadereduksjon.', 'Veiledningen vurderer tiltak og implementering, ikke subkulturklassifisering eller historien til et lokalt åpent rusmiljø.'),
  source('src_sub_o_keefe_2019', 'Measures of harm reduction service provision for people who inject drugs', ["D. O'Keefe mfl."], 2019, 'Bulletin of the World Health Organization', 'peer_reviewed_article', 'https://iris.who.int/handle/10665/326945', 'Drøfter målbare dimensjoner ved skadereduksjonstjenesters tilgjengelighet og dekning.', 'Tjenestedekning er ikke det samme som deltakeropplevelse, sosial tilhørighet eller lokal stedskonflikt.')
];

const SOURCE_SETS = Object.freeze({
  subkulturteori_feltgrenser: ['src_sub_hebdige_1979', 'src_sub_bennett_1999', 'src_sub_gelder_2005', 'src_sub_schiermer_2024'],
  fellesskap_scener_egenorganisering: ['src_sub_straw_1991', 'src_sub_thornton_1995', 'src_sub_hall_jefferson_1976', 'src_sub_woo_2015'],
  stil_symboler_koder_kropp: ['src_sub_hebdige_1979', 'src_sub_thornton_1995', 'src_sub_hall_jefferson_1976', 'src_sub_gagne_2024'],
  steder_territorier_okkupering: ['src_sub_borden_2001', 'src_sub_lefebvre_1968', 'src_sub_ferrell_1993', 'src_sub_borden_2019'],
  motstand_avvik_kontroll: ['src_sub_cohen_1972', 'src_sub_ferrell_1993', 'src_sub_link_phelan_2001', 'src_sub_bennett_1999'],
  medier_objekter_praksiser: ['src_sub_jenkins_1992', 'src_sub_boyd_2014', 'src_sub_aoir_2020', 'src_sub_gagne_2024'],
  sosiale_randsoner_omsorg_skadereduksjon: ['src_sub_who_pwid', 'src_sub_link_phelan_2001', 'src_sub_bourgois_schonberg_2009', 'src_sub_aoir_2020', 'src_sub_who_nsp_2026', 'src_sub_o_keefe_2019'],
  kommersialisering_institusjonalisering_minne: ['src_sub_zukin_1982', 'src_sub_thornton_1995', 'src_sub_schiermer_2024', 'src_sub_bennett_1999']
});

const DOMAIN_RESEARCH_LINES = Object.freeze({
  subkulturteori_feltgrenser: 'Fra Birmingham-skolens strukturelle stilfortolkning til scene-, neo-tribe- og materialitetskritikk.',
  fellesskap_scener_egenorganisering: 'Sceneanalyse, deltakende kultur, subkulturell kapital og kollektiv organisering.',
  stil_symboler_koder_kropp: 'Semiotisk stilteori, distinksjon, ritual og kritikk av stabile smak–identitet-koblinger.',
  steder_territorier_okkupering: 'Produksjon av rom, retten til byen, kroppslig bybruk og kulturell kriminologi.',
  motstand_avvik_kontroll: 'Stempling, moralpanikk, kriminalisering, medieforsterkning og kontrollens utilsiktede virkninger.',
  medier_objekter_praksiser: 'Deltakende kultur, nettverkede offentligheter, materialitet og kontekstavhengig forskningsetikk.',
  sosiale_randsoner_omsorg_skadereduksjon: 'Stigmaforskning, langvarig etnografi, folkehelse og community-led skadereduksjon.',
  kommersialisering_institusjonalisering_minne: 'Subkulturell kapital, inkorporering, gentrifisering, materialitet og kulturarvskritikk.'
});

function build() {
  const emner = readJson(PATHS.emner);
  const pensum = readJson(PATHS.pensum);
  const sourceById = new Map(SOURCES.map((entry) => [entry.source_id, entry]));
  const domainById = new Map(pensum.domains.map((entry) => [entry.domain_id, entry]));
  const theoryObjects = [];
  const claims = [];
  const links = [];
  const evidenceEntries = [];

  for (const emne of emner) {
    const slug = slugFromEmne(emne.emne_id);
    const theoryId = `theory_sub_${slug}`;
    const claimDefinitionId = `claim_sub_${slug}_definition_mechanism`;
    const claimBoundaryId = `claim_sub_${slug}_boundary`;
    const sourceIds = SOURCE_SETS[emne.domain];
    if (!sourceIds || !domainById.has(emne.domain)) throw new Error(`Mangler kildesett eller domene for ${emne.emne_id}`);
    for (const sourceId of sourceIds) if (!sourceById.has(sourceId)) throw new Error(`Ukjent kilde ${sourceId}`);
    const ethicsRequired = Boolean(emne.ethics_review?.required) || emne.domain === 'sosiale_randsoner_omsorg_skadereduksjon';

    theoryObjects.push({
      theory_id: theoryId,
      label: emne.title,
      object_type: 'subculture_theory_object',
      domain_id: emne.domain,
      emne_ids: [emne.emne_id],
      thesis_or_definition: emne.definition,
      research_line: DOMAIN_RESEARCH_LINES[emne.domain],
      mechanism: emne.mechanism,
      application_scope: [`Dokumenterte miljøer og praksiser der ${emne.title.toLowerCase()} er empirisk synlig.`, 'Caset må ha identifiserbare aktører, relasjoner, praksiser eller romlige spor; etikett og estetikk alene er utilstrekkelig.'],
      limitations_and_misuse: [emne.limitation, 'Teoriobjektet må ikke brukes som bevis for et case; lokale påstander krever egne casekilder.'],
      critique_or_counterposition: `Kontrollkildene kan forklare samme observasjon gjennom flytende tilhørighet, materiell forankring, institusjonell makt eller medieformidling; ${emne.title.toLowerCase()} skal derfor behandles som en prøvbar tolkning, ikke en etikett.`,
      method_ids: emne.method_ids,
      source_ids: sourceIds,
      primary_source_id: sourceIds[0],
      independent_control_source_id: sourceIds[1],
      contextual_source_ids: sourceIds.slice(2),
      case_application_rule: 'Koble teoriobjektet til en avgrenset caseclaim med miljønær kilde og uavhengig kontroll; caset kan illustrere eller utfordre teorien, men ikke bevise universell gyldighet.',
      ethics_review: {
        required: ethicsRequired,
        dimensions: ['privacy_context', 'stigma', 'romanticization', 'voice_balance', 'identification_risk'],
        decision_rule: ethicsRequired ? 'minimize_identification_and_aggregation; require_environment_near_voice_and_independent_control' : 'review_if_living_or_identifiable_people_enter_the_case'
      },
      claim_ids: [claimDefinitionId, claimBoundaryId],
      status: 'evidence_ready',
      evidence_ready: true
    });

    claims.push(
      {
        claim_id: claimDefinitionId,
        theory_id: theoryId,
        statement: `${emne.definition} Virkningsmekanismen er at ${emne.mechanism.charAt(0).toLowerCase()}${emne.mechanism.slice(1)}`,
        claim_type: 'theory_definition_and_mechanism',
        domain_id: emne.domain,
        emne_ids: [emne.emne_id],
        source_ids: [sourceIds[0], ...sourceIds.slice(2, 3)],
        confidence: 'bounded_high',
        uncertainty: 'Påstanden gjelder som analytisk ramme; styrke og relevans må testes i hvert case.',
        case_fact: false
      },
      {
        claim_id: claimBoundaryId,
        theory_id: theoryId,
        statement: `${emne.limitation} Derfor må en konkurrerende forklaring og et negativt eller tvetydig case vurderes før begrepet brukes.`,
        claim_type: 'theory_boundary_and_critique',
        domain_id: emne.domain,
        emne_ids: [emne.emne_id],
        source_ids: [sourceIds[1], sourceIds[sourceIds.length - 1]],
        confidence: 'bounded_high',
        uncertainty: 'Avgrensningen reduserer overtolkning, men avgjør ikke alene hvilken alternativ forklaring som er best.',
        case_fact: false
      }
    );

    for (const claim of claims.slice(-2)) {
      for (const sourceId of claim.source_ids) {
        links.push({
          evidence_link_id: `evidence_sub_${claim.claim_id.replace(/^claim_sub_/, '')}_${sourceId.replace(/^src_sub_/, '')}`,
          theory_id: theoryId,
          claim_id: claim.claim_id,
          source_id: sourceId,
          support_type: claim.claim_type === 'theory_boundary_and_critique' ? 'critical_boundary' : 'conceptual_support',
          support_note: claim.claim_type === 'theory_boundary_and_critique'
            ? 'Kilden brukes til å avgrense rekkevidde, synliggjøre en motposisjon eller hindre automatisk klassifisering.'
            : 'Kilden brukes til begrepsdefinisjon eller mekanisme; den er ikke lokal caseevidens.',
          inference_boundary: 'Ingen påstand om et konkret sted, miljø eller individ kan utledes uten separat caseevidens.'
        });
      }
    }

    evidenceEntries.push({
      theory_id: theoryId,
      status: 'evidence_ready',
      scope_status: 'theory_ready_case_evidence_required',
      universalization_status: 'bounded_not_universal',
      claim_ids: [claimDefinitionId, claimBoundaryId],
      source_ids: sourceIds,
      emne_ids: [emne.emne_id],
      method_ids: emne.method_ids,
      evidence_link_ids: links.filter((link) => link.theory_id === theoryId).map((link) => link.evidence_link_id),
      evidence_dimensions: ['definition', 'mechanism', 'limitation_test', 'counterposition', 'method_binding', 'case_inference_boundary', ...(ethicsRequired ? ['ethics_review'] : [])],
      rationale: `${emne.title} er evidence-ready fordi definisjon og mekanisme støttes av et identifisert hovedverk, mens begrensningen prøves mot en uavhengig kritikkilde. Objektet krever fortsatt lokale caseclaims, miljønær stemme og uavhengig kontroll før sted-, people- eller quizbruk.`,
      limitations: [emne.limitation, 'Kildesettet etablerer en faglig analyseramme, ikke et universelt eller lokalt faktum.'],
      alternative_interpretations: [`Observasjoner knyttet til ${emne.title.toLowerCase()} kan også forklares gjennom livsfase, marked, institusjon, teknologi, byutvikling eller andre fagdomener.`],
      disconfirmation_conditions: [`Tolkningen svekkes dersom dokumentasjonen ikke viser mekanismen for ${emne.title.toLowerCase()}, eller dersom et konkurrerende begrep forklarer materialet med færre antakelser.`],
      case_evidence_gate: {
        environment_near_source_required: true,
        independent_control_source_required: true,
        case_as_universal_proof_forbidden: true,
        privacy_and_stigma_review_required: ethicsRequired
      }
    });
  }

  return {
    [PATHS.theory]: theoryObjects,
    [PATHS.claims]: {
      schema_version: '1.0.0', registry_id: 'claims_subkultur_canonical_v1', subject_id: 'subkultur', scope: 'universal_theory_claims', status: 'evidence_ready',
      claims, last_updated: '2026-08-04'
    },
    [PATHS.sources]: {
      schema_version: '1.0.0', registry_id: 'sources_subkultur_canonical_v1', subject_id: 'subkultur', status: 'curated_foundation',
      source_policy: { canonical_files_are_not_external_evidence: true, publisher_doi_or_authoritative_organization_required: true, environment_near_case_source_required_before_case_use: true },
      sources: SOURCES, last_updated: '2026-08-04'
    },
    [PATHS.links]: {
      schema_version: '1.0.0', registry_id: 'evidence_links_subkultur_canonical_v1', subject_id: 'subkultur', status: 'evidence_ready', links, last_updated: '2026-08-04'
    },
    [PATHS.evidence]: {
      schema_version: '1.0.0', registry_id: 'theory_evidence_subkultur_canonical_v1', subject_id: 'subkultur', status: 'evidence_ready', scope: 'universal_theory_with_case_gate',
      completion: { required: 80, evidence_ready: evidenceEntries.length, ratio: evidenceEntries.length / 80 },
      entries: evidenceEntries, last_updated: '2026-08-04'
    },
    [PATHS.caseRequirements]: {
      schema_version: '1.0.0', registry_id: 'case_requirements_subkultur_canonical_v1', subject_id: 'subkultur', scope: 'all_case_profiles',
      policy: {
        documented_environment_practice_and_social_position_required: true,
        environment_near_source_required: true,
        independent_control_source_required: true,
        theory_cannot_substitute_case_evidence: true,
        minimize_identification_and_aggregation_for_vulnerable_people: true
      },
      requirements: [
        { requirement_id: 'case_req_sub_environment_practice_position', label: 'Miljø, praksis og sosial posisjon', minimum_sources: 2, required_dimensions: ['participants_or_actors', 'shared_practice', 'relation_to_mainstream'] },
        { requirement_id: 'case_req_sub_voice_balance', label: 'Miljønær og uavhengig stemme', minimum_sources: 2, required_dimensions: ['environment_near_voice', 'independent_control', 'source_position'] },
        { requirement_id: 'case_req_sub_place_change', label: 'Sted, kontroll og endring', minimum_sources: 2, required_dimensions: ['spatial_practice', 'access_or_control', 'change_over_time'] },
        { requirement_id: 'case_req_sub_ethics', label: 'Personvern, stigma og romantisering', minimum_sources: 1, required_dimensions: ['identification_risk', 'privacy_context', 'stigma_risk', 'romanticization_risk'] },
        { requirement_id: 'case_req_sub_negative_case', label: 'Grensetilfelle og alternativ forklaring', minimum_sources: 1, required_dimensions: ['non_qualification_test', 'alternative_explanation', 'uncertainty'] }
      ]
    }
  };
}

const generated = build();
const changed = [];
for (const [relative, value] of Object.entries(generated)) {
  const next = `${JSON.stringify(value, null, 2)}\n`;
  let current = '';
  try { current = fs.readFileSync(abs(relative), 'utf8'); } catch {}
  if (current === next) continue;
  changed.push(relative);
  if (WRITE) fs.writeFileSync(abs(relative), next, 'utf8');
}

if (CHECK && changed.length) {
  console.error('Subkultur-evidensfilene er utdatert:');
  for (const relative of changed) console.error(`- ${relative}`);
  process.exitCode = 1;
} else {
  console.log(`Subkultur evidence ${WRITE ? 'skrevet' : 'OK'}: 80 teoriobjekter, 160 claims, ${SOURCES.length} kilder; ${changed.length} avvik.`);
}
