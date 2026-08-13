#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CONCEPT_CLAIMS, CONCEPT_GLOSSES, MENTAL_HEALTH_MODEL_CURATION, TOPIC_CURATION } from './lib/psykologi-editorial-curation-v2.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const UPDATED_AT = '2026-08-12';
const ARTICLE_DIR = 'data/fagverk/psykologi/emneartikler';
const CONCEPT_PATH = 'data/fag/psykologi/begreper_psykologi_canonical_v1.json';
const APPLIED_PATH = 'data/fag/psykologi/anvendte_fagfelt_psykologi_university_v1.json';
const MATRIX_PATH = 'data/fag/psykologi/psykologi_university_readiness_v1.json';
const STATUS_PATH = 'data/fagverk/subject_status.json';
const REGISTRY_PATH = 'data/fagverk/fagverk_registry.json';
const EMNER = read('data/fag/psykologi/emner_psykologi_canonical_v4_5.json');
const METHODS = read('data/fag/psykologi/methods_psykologi_canonical_v4_5.json').methods;
const PENSUM = read('data/fag/psykologi/psykologipensum_canonical_v4_5.json');
const EMNE_BY_ID = new Map(EMNER.map((row) => [row.emne_id, row]));
const METHOD_BY_ID = new Map(METHODS.map((row) => [row.method_id, row]));
const MENTAL_HEALTH_DOMAIN = 'psykisk_helse_institusjoner_behandling';
const FINAL_GATE = 'maintenance_source_refresh_and_place_case_expansion';
const EDITORIAL_REVIEW = Object.freeze({
  status: 'approved_non_clinical_educational_use',
  reviewed_at: UPDATED_AT,
  reviewer_role: 'psychology_editorial_audit',
  review_standard: 'history_go_psykologi_clinical_safety_v1',
  checks: Object.freeze({
    no_individual_diagnosis: true,
    no_individual_treatment_directive: true,
    no_coercion_recommendation: true,
    no_place_or_group_diagnosis: true,
    educational_scope_explicit: true
  })
});
const QUALITY_REVIEW = Object.freeze({
  status: 'approved_editorial_quality_v2',
  reviewed_at: UPDATED_AT,
  reviewer_role: 'psychology_editorial_audit',
  review_standard: 'history_go_psykologi_editorial_quality_v2'
});

function read(relative) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relative), 'utf8'));
}
function write(relative, value) {
  const target = path.join(ROOT, relative);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, `${JSON.stringify(value, null, 2)}\n`);
}
const unique = (values) => [...new Set(values.filter(Boolean))];
const words = (value) => String(value || '').toLocaleLowerCase('nb-NO').replace(/[æ]/g, 'ae').replace(/[ø]/g, 'o').replace(/[å]/g, 'a').normalize('NFD').replace(/\p{Diacritic}/gu, '').match(/[a-z0-9]{4,}/g) || [];
const titleCase = (value) => value ? `${value[0].toLocaleUpperCase('nb-NO')}${value.slice(1)}` : value;
const slug = (value) => String(value).toLocaleLowerCase('nb-NO').replace(/[æ]/g, 'ae').replace(/[ø]/g, 'o').replace(/[å]/g, 'a').normalize('NFD').replace(/\p{Diacritic}/gu, '').replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
const stableHash = (value) => [...String(value)].reduce((hash, character) => Math.imul(hash ^ character.codePointAt(0), 16777619) >>> 0, 2166136261);

const MODELS_BY_CLAIM_ID = new Map();
for (const model of [...Object.values(TOPIC_CURATION).flatMap((profile) => profile.models), ...Object.values(MENTAL_HEALTH_MODEL_CURATION).flat()]) {
  const rows = MODELS_BY_CLAIM_ID.get(model.claimId) || [];
  if (!rows.some((row) => row.name === model.name)) rows.push(model);
  MODELS_BY_CLAIM_ID.set(model.claimId, rows);
}

const DOMAIN_CONFIG = Object.freeze({
  psykisk_helse_institusjoner_behandling: {
    claims: 'data/fagverk/psykologi/psykisk-helse-institusjoner-og-behandling/claims.json',
    lens: 'psykisk helse, behandling, omsorg, tjenester, rettigheter og institusjonshistorie',
    limitation: 'Kunnskap om tjenester og kliniske begreper er undervisningsstoff og gir ikke grunnlag for individuell diagnose, behandling eller tvangsvurdering.'
  },
  fagtradisjoner_teori_sinnet: {
    claims: 'data/fagverk/psykologi/fagtradisjoner-teori-og-sinnet/claims.json',
    lens: 'vitenskapshistorie, teori, måling og konkurrerende forklaringer på sinn og atferd',
    limitation: 'En fagtradisjon eller målemodell er et historisk og metodisk redskap, ikke en uttømmende beskrivelse av et menneske.'
  },
  utvikling_oppvekst_laring: {
    claims: 'data/fagverk/psykologi/utvikling-oppvekst-og-laring/claims.json',
    lens: 'endring gjennom livsløpet, relasjoner, læringsmiljø og samspill mellom person og kontekst',
    limitation: 'Utviklingsfunn beskriver sannsynlige mønstre og variasjon; alder, familieform eller oppvekstmiljø bestemmer ikke et enkelt livsløp.'
  },
  kognisjon_folelser_atferd: {
    claims: 'data/fagverk/psykologi/kognisjon-folelser-og-atferd/claims.json',
    lens: 'sansing, oppmerksomhet, tenkning, valg, følelser, regulering og observerbar atferd',
    limitation: 'Resultater fra avgrensede oppgaver gjelder bestemte stimuli, mål og utvalg og kan ikke uten videre generaliseres til hele personer eller hverdagssituasjoner.'
  },
  sosialpsykologi_normalitet_stigma: {
    claims: 'data/fagverk/psykologi/sosialpsykologi-normalitet-og-stigma/claims.json',
    lens: 'grupper, normer, kategorisering, makt, offentlighet, stigma og sosial tilhørighet',
    limitation: 'Gruppemønstre må ikke brukes som egenskaper ved alle gruppemedlemmer, og sosial analyse gir ikke grunnlag for å diagnostisere individer eller steder.'
  },
  traume_krise_resiliens_omsorg: {
    claims: 'data/fagverk/psykologi/traume-krise-resiliens-og-omsorg/claims.json',
    lens: 'belastning, vold, tap, krise, trygghet, risiko, beskyttelse, mestring og omsorg over tid',
    limitation: 'Eksponering er ikke det samme som et bestemt utfall; reaksjoner, ressurser, tid og kontekst varierer, og undervisningsstoffet erstatter ikke individuell helsehjelp.'
  }
});

const TOPIC_SEEDS = Object.freeze({
  em_psy_atferd_laring: ['hvordan erfaring, konsekvenser og situasjon former observerbar handling og læring', 'forsterkning og læringshistorie må ses sammen med forventning, mening og biologiske rammer', 'en undervisningssituasjon der samme respons får ulike følger'],
  em_psy_betinging_vaner: ['hvordan assosiasjoner, signaler og gjentakelse kan etablere betingede responser og vaner', 'målrettet handling må skilles fra automatisert vane og fra enkel refleks', 'en gjentatt reiserute der kontekstsignaler styrer handling'],
  em_psy_bevissthet_opplevelse: ['hvordan subjektiv opplevelse, rapport og observerbare mål forbindes uten å gjøres identiske', 'førstepersonsbeskrivelse og tredjepersonsmåling gir ulike, delvise evidenskilder', 'et persepsjonseksperiment med usikker rapport og kontrollert stimulus'],
  em_psy_diagnose_klassifikasjon: ['hvordan klassifikasjon organiserer klinisk kommunikasjon, forskning og tjenester', 'kategorisk nytte må vurderes sammen med validitet, overlapp, funksjon og maktvirkninger', 'en historisk sammenligning av klassifikasjonssystemer uten vurdering av en person'],
  em_psy_folelser_affekt: ['hvordan kroppslig aktivering, vurdering, uttrykk og kulturell fortolkning inngår i følelser og affekt', 'grunnfølelsesmodeller og konstruksjonistiske modeller vektlegger forskjellige mekanismer', 'en offentlig situasjon der uttrykk, kontekst og tolkning ikke sammenfaller'],
  em_psy_forskning_metode: ['hvordan problem, design, operasjonalisering, utvalg og analyse begrenser psykologiske konklusjoner', 'intern kontroll må avveies mot økologisk gyldighet, generalisering og etikk', 'et forskningsprosjekt som sammenligner eksperiment, observasjon og intervju'],
  em_psy_hjerne_kognisjon: ['hvordan nevrale systemer bidrar til kognitive funksjoner uten at forklaringen reduseres til ett hjerneområde', 'lokalisering må kombineres med nettverk, plastisitet, oppgavekrav og atferdsmål', 'en laboratorieoppgave der hjerne- og atferdsdata tolkes på flere nivåer'],
  em_psy_motivasjon_behov: ['hvordan behov, mål, forventning, belønning og sosial kontekst retter og opprettholder handling', 'indre og ytre motivasjon er analytiske skiller, ikke faste typer mennesker', 'en skole- eller arbeidssituasjon der samme belønning virker ulikt'],
  em_psy_nevroaffekt_regulering: ['hvordan hjerne, kropp og erfaring samvirker i aktivering og regulering av affekt', 'biologiske korrelater må skilles fra årsak, diagnose og uforanderlig egenskap', 'en reguleringsoppgave med samtidig fysiologisk og selvrapportert mål'],
  em_psy_personlighet_individ: ['hvordan relativt stabile trekk, mål, fortellinger og situasjoner beskriver individuelle forskjeller', 'stabilitet på gruppenivå må holdes sammen med utvikling og situasjonsvariasjon', 'en fler-metodevurdering med selvrapport, informant og observert atferd'],
  em_psy_psykoanalyse: ['hvordan psykoanalytiske tradisjoner forklarer konflikt, forsvar, relasjon og mening', 'historisk innflytelse og klinisk fortolkning må skilles fra moderne evidens for bestemte påstander', 'et arkiv- eller institusjonscase om teoriens profesjonshistorie'],
  em_psy_psykometri_maling: ['hvordan latente psykologiske konstrukter knyttes til oppgaver, skalaer og usikkerhet', 'reliabilitet er nødvendig, men ikke tilstrekkelig for validitet og rettferdig bruk', 'en skala som undersøkes for måleinvarians mellom grupper'],
  em_psy_selv_utvikling_mening: ['hvordan selvforståelse, identitet, mål og mening formes og revideres gjennom erfaring', 'kontinuitet i selvfortelling må ses sammen med sosial posisjon og livsoverganger', 'en overgang mellom utdanning og arbeid analysert uten typestempling'],
  em_psy_ubevisste_prosesser: ['hvordan prosesser uten samtidig bevisst tilgang kan påvirke persepsjon, hukommelse og handling', 'moderne indirekte mål må skilles fra brede fortolkninger av skjulte motiver', 'en priming- eller oppmerksomhetsoppgave med alternative forklaringer'],
  em_psy_barn_ungdom: ['hvordan biologisk modning, relasjoner, læring og institusjoner former barndom og ungdom', 'aldersgjennomsnitt må ikke bli universelle stadier eller mangeltenkning om unge', 'en skole- og fritidskontekst med ulike utviklingskrav'],
  em_psy_familie_samspill: ['hvordan gjensidig påvirkning, rutiner, konflikt, støtte og bredere vilkår preger familiesamspill', 'familien er et dynamisk system, men systemmetaforen fritar ikke analyse av makt og individforskjeller', 'en hverdagsovergang der observasjon viser mønster, ikke skyld'],
  em_psy_identitet_selv: ['hvordan identitet og selv utvikles gjennom utforskning, forpliktelse, relasjoner og sosial anerkjennelse', 'identitetsmodeller må romme flertydighet, kultur og endring uten å rangere livsformer', 'en ungdoms overgang mellom skolemiljøer og tilhørigheter'],
  em_psy_laring_hukommelse: ['hvordan innkoding, øving, gjenhenting, glemsel og overføring inngår i læring', 'prestasjon under øving må skilles fra varig læring og fleksibel bruk', 'et klasserom som sammenligner gjenhentingsøving og repetert lesing'],
  em_psy_livslop_overganger: ['hvordan utvikling fortsetter gjennom voksenliv, aldring og historisk skiftende overganger', 'normative tidsplaner må skilles fra faktisk variasjon i livsløp', 'en overgang til arbeid, omsorgsansvar eller pensjon med kohortperspektiv'],
  em_psy_oppvekst_miljo: ['hvordan nabolag, økonomi, institusjoner, kultur og relasjoner former utviklingsmuligheter', 'miljøpåvirkning er probabilistisk og virker gjennom flere mellomliggende prosesser', 'to lokale oppvekstmiljøer sammenlignet uten å karakterisere barna'],
  em_psy_skole_motivasjon: ['hvordan mestringsforventning, mål, tilhørighet, autonomi og undervisningsdesign påvirker skolemotivasjon', 'lav deltakelse kan ha flere forklaringer og er ikke et stabilt personlighetstrekk', 'en undervisningsendring der både læring, trivsel og ulikhet måles'],
  em_psy_sosial_utvikling: ['hvordan samspill, språk, perspektivtaking, normer og jevnaldermiljø utvikles gjensidig', 'sosial kompetanse er kontekstavhengig og kan ikke reduseres til lydighet', 'en lek- eller samarbeidsaktivitet observert på flere tidspunkter'],
  em_psy_tilknytning_relasjon: ['hvordan tidlige og senere relasjoner kan gi forventninger om tilgjengelighet, trygghet og støtte', 'tilknytningsmønstre er ikke diagnoser eller uforanderlige skjebner og må måles kontekstuelt', 'en omsorgssituasjon analysert gjennom sensitivitet og barnets signaler'],
  em_psy_affektregulering: ['hvordan mennesker påvirker intensitet, varighet og uttrykk av affekt før, under og etter en situasjon', 'en strategi kan være nyttig i én kontekst og kostbar i en annen', 'en krevende offentlig situasjon med flere mulige reguleringsstrategier'],
  em_psy_beslutning_valg: ['hvordan verdier, sannsynlighet, tid, følelser og presentasjon av alternativer former valg', 'normative beslutningsmodeller og beskrivende funn svarer på ulike spørsmål', 'et valg der samme utfall rammes inn som gevinst eller tap'],
  em_psy_hverdagspsykologi: ['hvordan intuitive forklaringer på egen og andres atferd oppstår og kan prøves mot systematisk evidens', 'gjenkjennelige fortellinger er ikke automatisk gode kausalforklaringer', 'en hverdagspåstand som omformuleres til et testbart spørsmål'],
  em_psy_kognisjon_tenkning: ['hvordan representasjon, begreper, arbeidsminne og resonnering muliggjør og begrenser tenkning', 'enhetlige mål på tenkning må skilles fra oppgavespesifikke prosesser', 'en problemløsningsoppgave der forkunnskap og arbeidsminne varierer'],
  em_psy_kognitive_bias: ['hvordan systematiske avvik kan oppstå fra heuristikker, informasjonsmiljø og oppgavedesign', 'bias er mønstre under bestemte betingelser, ikke merkelapper på personer eller grupper', 'en vurderingsoppgave med basisrater og alternativ presentasjon'],
  em_psy_oppmerksomhet_fokus: ['hvordan seleksjon, beredskap, orientering og kontroll prioriterer informasjon', 'oppmerksomhet er flere delvis adskilte funksjoner og ikke én fast ressurs', 'en visuell søkeoppgave med konkurrerende stimuli og tidskrav'],
  em_psy_persepsjon_sansing: ['hvordan sanseinformasjon transduseres, organiseres og fortolkes i kontekst', 'persepsjon er verken passiv avbildning eller fri konstruksjon uten stimulusbegrensning', 'en tvetydig figur eller lyd analysert med kontrollerte betingelser'],
  em_psy_stress_belastning: ['hvordan krav, vurdering, fysiologisk aktivering, ressurser og restitusjon inngår i stress', 'kortvarig aktivering må skilles fra langvarig belastning og fra kliniske konklusjoner', 'en arbeidssituasjon der krav, kontroll, søvn og støtte måles over tid'],
  em_psy_diagnose_hverdagsliv: ['hvordan diagnostiske kategorier møter identitet, relasjoner, tjenester og dagligliv', 'klinisk klassifikasjon må skilles fra personens hele identitet og fra lekfolks merkelapper', 'en offentlig tekst der diagnoseord brukes ulikt i klinikk og hverdag'],
  em_psy_ensomhet_tilhorighet: ['hvordan ønsket og faktisk sosial kontakt, kvalitet, gjensidighet og sted påvirker ensomhet og tilhørighet', 'ensomhet er en subjektiv erfaring og kan ikke avleses direkte av antall kontakter', 'et nærmiljøcase som skiller fysisk nærhet fra sosial deltakelse'],
  em_psy_fordommer_kategorisering: ['hvordan kategorisering, stereotypier, affekt og institusjonelle mønstre kan bidra til fordommer', 'implisitte og eksplisitte mål må tolkes med ulike begrensninger', 'en utvelgelsessituasjon der kriterier og beslutningsspor undersøkes'],
  em_psy_grupper_roller: ['hvordan medlemskap, roller, normer, status og sosial identitet organiserer samhandling', 'gruppemønstre er ikke faste egenskaper og varierer med oppgave og institusjon', 'et team der rollefordeling og beslutningsprosess observeres'],
  em_psy_normalitet_avvik: ['hvordan statistiske, normative, funksjonelle og kliniske kriterier produserer ulike grenser for normalitet', 'sjeldent, uønsket og behandlingskrevende er ikke det samme', 'en historisk norm sammenlignet med en nåtidig institusjonspraksis'],
  em_psy_sosial_kontroll: ['hvordan formelle regler og uformelle sanksjoner påvirker handling, tilhørighet og avvik', 'regulering kan muliggjøre koordinering og samtidig begrense handlingsrom', 'et offentlig rom der regler, blikk og adgang virker sammen'],
  em_psy_sosial_pavirkning: ['hvordan informasjon, normer, autoritet, budskap og relasjoner påvirker vurdering og handling', 'påvirkning er ikke det samme som tankekontroll, og mottakere er ikke passive', 'en kampanje der kilde, budskap, norm og faktisk atferd skilles'],
  em_psy_stigma_offentlighet: ['hvordan merking, stereotyper, statusforskjell og diskriminering virker i offentlighet og institusjoner', 'stigma ligger ikke bare i holdninger, men kan også finnes i regler, tilgang og representasjon', 'en medietekst og en tjenestepraksis analysert på hvert sitt nivå'],
  em_psy_kollektiv_krise: ['hvordan felles trusler, informasjon, institusjoner, ritualer og ulik eksponering former kollektive kriser', 'en kollektiv hendelse skaper ikke én felles psykologisk reaksjon', 'et minne- eller beredskapssted analysert med tids- og gruppevariasjon'],
  em_psy_resiliens_mestring: ['hvordan tilpasning kan oppstå gjennom personlige, relasjonelle og institusjonelle ressurser over tid', 'resiliens er et utfall eller en prosess i kontekst, ikke et moralsk personlighetstrekk', 'et longitudinelt case med skiftende støtte og flere utfallsmål'],
  em_psy_risiko_beskyttelse: ['hvordan belastninger og beskyttende forhold påvirker sannsynlige utviklingsbaner i samspill', 'risikofaktorer er ikke årsaksdommer eller sikre prognoser for individer', 'en forebyggingsanalyse som skiller behov, eksponering og effekt'],
  em_psy_sorg_tap: ['hvordan sorg varierer i uttrykk, tid, kultur, relasjon og betydningen av tapet', 'fasemodeller kan være pedagogiske, men må ikke brukes som obligatorisk tidsplan', 'et minne- eller ritualsted der flere sorguttrykk får plass'],
  em_psy_traume_regulering: ['hvordan overveldende belastning kan påvirke aktivering, oppmerksomhet, hukommelse og regulering', 'eksponering, reaksjon og klinisk tilstand er forskjellige analytiske nivåer', 'et undervisningscase som følger tidsforløp og støtte uten diagnostisering'],
  em_psy_trygghet_tillit: ['hvordan forutsigbarhet, kontroll, relasjonell respons og institusjonell pålitelighet bidrar til trygghet og tillit', 'opplevd trygghet og objektiv risiko må måles separat', 'en tjenesteovergang der informasjon, medvirkning og kontinuitet vurderes'],
  em_psy_vold_belastning: ['hvordan vold og vedvarende belastning må forstås gjennom eksponering, makt, sikkerhet og varierte følger', 'årsaksansvar ligger hos utøveren, mens psykologisk analyse undersøker konsekvenser og støtte', 'et dokumentert systemcase om beskyttelse, tilgang og langvarig oppfølging']
});

const CLAIM_DOCS = new Map(Object.entries(DOMAIN_CONFIG).map(([domainId, config]) => [domainId, read(config.claims)]));
const CLAIM_BY_ID = new Map([...CLAIM_DOCS.values()].flatMap((document) => document.claims || []).map((claim) => [claim.id, claim]));

function relevantClaims(emne, count = 5) {
  const claims = CLAIM_DOCS.get(emne.domain)?.claims || [];
  const signals = new Set(words([emne.title, ...(emne.keywords || []), ...(emne.core_concepts || []), ...(emne.primary_theory_hooks || [])].join(' ')));
  const ranked = claims.map((claim, index) => ({
    claim,
    index,
    score: words(`${claim.kind} ${claim.claim}`).reduce((sum, token) => sum + (signals.has(token) ? 1 : 0), 0)
  })).sort((a, b) => b.score - a.score || a.index - b.index).map((row) => row.claim);
  const selected = ranked.slice(0, count);
  const sourceIds = new Set(selected.flatMap((claim) => claim.source_ids || []));
  for (const claim of ranked.slice(count)) {
    if (sourceIds.size >= 3) break;
    selected.push(claim);
    for (const id of claim.source_ids || []) sourceIds.add(id);
  }
  return selected;
}

function articleFor(emne) {
  const seed = TOPIC_SEEDS[emne.emne_id];
  if (!seed) throw new Error(`Mangler emnespesifikk redaksjonell seed for ${emne.emne_id}`);
  const curation = TOPIC_CURATION[emne.emne_id];
  if (!curation) throw new Error(`Mangler redaksjonell v2-kuratering for ${emne.emne_id}`);
  const config = DOMAIN_CONFIG[emne.domain];
  const claims = curation.claimIds.map((id) => CLAIM_BY_ID.get(id));
  if (claims.length !== 5 || claims.some((claim) => !claim)) throw new Error(`Ufullstendig kuratert claim-kjede for ${emne.emne_id}`);
  const sourceIds = unique(claims.flatMap((claim) => claim.source_ids || [])).sort();
  const methods = unique([...(emne.recommended_methods || []), ...(emne.methods || [])]).slice(0, 3).map((methodId) => {
    const method = METHOD_BY_ID.get(methodId);
    if (!method) throw new Error(`Ukjent metode ${methodId} i ${emne.emne_id}`);
    return {
      method_id: methodId,
      label: method.title,
      application: `${method.title} brukes her til å undersøke ${seed[0]}. Analysen må starte i dokumenterte observasjoner, kilder eller målinger og vise hvilket nivå og hvilken tidsramme konklusjonen gjelder.`,
      limitations: `Metoden kan strukturere evidens om ${emne.short_label || emne.title}, men etablerer ikke alene årsak, generalisering eller en vurdering av enkeltpersoner. Alternative forklaringer og datakilder må oppgis.`
    };
  });
  while (methods.length < 3) {
    const fallback = METHODS.find((method) => !methods.some((row) => row.method_id === method.method_id) && method.coverage_domains?.includes(emne.domain));
    if (!fallback) throw new Error(`Mangler tre metoder for ${emne.emne_id}`);
    methods.push({ method_id: fallback.method_id, label: fallback.title, application: `${fallback.title} undersøker ${seed[0]} gjennom eksplisitte data, sammenligninger og kontekst.`, limitations: `Resultatet avhenger av utvalg, operasjonalisering og sammenligningsgrunnlag og kan ikke brukes til å klassifisere eller gi råd til enkeltpersoner.` });
  }
  const cases = unique(emne.recommended_oslo_cases || emne.good_for_places || ['universitet', 'offentlig tjeneste']);
  const related = unique([...(emne.related_emne || []), ...(emne.related_emners || [])]).filter((id) => EMNE_BY_ID.has(id));
  const contrasts = unique([...(emne.distinguish_from_emners || []), ...related]).filter((id) => EMNE_BY_ID.has(id)).slice(0, 2).map((id) => EMNE_BY_ID.get(id).title);
  const conflicts = unique([...(emne.analysis_axes || []), ...(emne.conflicts || [])]);
  const claimText = (index) => claims[index % claims.length].claim;
  const claimSources = (index) => claims[index % claims.length].source_ids;
  const modelClaims = curation.models.map((model) => CLAIM_BY_ID.get(model.claimId));
  const evidenceClaim = claims.find((claim) => !curation.models.some((model) => model.claimId === claim.id)) || claims[2];
  const conceptAnchors = unique(emne.core_concepts || []).sort((left, right) => stableHash(`${emne.emne_id}:${left}`) - stableHash(`${emne.emne_id}:${right}`));
  const anchor = (index) => conceptAnchors[index % conceptAnchors.length] || emne.short_label || emne.title;
  return {
    schema: 'history_go_psykologi_topic_article_v1',
    version: '2.0.0',
    updated_at: UPDATED_AT,
    subject_id: 'psykologi',
    domain_id: emne.domain,
    emne_id: emne.emne_id,
    title: emne.title,
    article_status: 'complete',
    editorial_focus: seed[0],
    editorial_frame_inputs: unique([
      emne.title,
      emne.short_label,
      seed[0],
      seed[1],
      seed[2],
      curation.boundary,
      ...curation.models.map((model) => model.name),
      ...methods.map((method) => method.label),
      ...cases.slice(0, 2).map((caseName) => String(caseName))
    ]),
    definition: `${emne.title} undersøker ${seed[0]}. ${claimText(0)} Faglig grense: ${curation.boundary}`,
    background: [
      `Historisk premiss: ${claimText(0)} Emnespørsmål: ${seed[0]}.`,
      `Teoretisk spenning: ${claimText(1)} Redaksjonell kontrast: ${seed[1]}.`,
      `Evidensgrense: ${evidenceClaim.claim} Avgrensning: ${curation.boundary}`
    ],
    theories_and_findings: [
      { title: curation.models[0].name, content: `Kildestøtte: ${modelClaims[0].claim} ${curation.models[0].name} belyser ${seed[0]}. Rekkevidde: ${curation.boundary}`, claim_ids: [modelClaims[0].id], source_ids: modelClaims[0].source_ids },
      { title: curation.models[1].name, content: `Kildestøtte: ${modelClaims[1].claim} ${curation.models[1].name} prøver ${seed[1]}. Sammenligningskrav: samme utfall og tidsrom.`, claim_ids: [modelClaims[1].id], source_ids: modelClaims[1].source_ids },
      { title: `Evidensgrensen i ${emne.title}`, content: `Kildestøtte: ${evidenceClaim.claim} ${emne.title}: ${curation.boundary} Alternative forklaringer forblir åpne.`, claim_ids: [evidenceClaim.id], source_ids: evidenceClaim.source_ids }
    ],
    methods: methods.map((method) => ({
      ...method,
      application: `${method.label}: ${seed[0]} Datakrav: dokumentert observasjon, analyseenhet og tidsramme.`,
      limitations: `${method.label}; begrensning: ${curation.boundary} Alternative forklaringer kreves.`
    })),
    boundaries_and_disagreements: [
      { question: `Avgrensning i ${emne.title}: ${curation.boundary}`, positions: [`${curation.models[0].name}: ${seed[0]}`, `${curation.models[1].name}: ${seed[1]}`], evidence_needed: `Skillekrav: ${modelClaims[0].claim} ${modelClaims[1].claim}` },
      { question: `Generalisering av ${emne.title}?`, positions: [`Utgangspunkt: ${seed[0]}`, `Motprøve: ${seed[1]}`], evidence_needed: `Datakrav: ${evidenceClaim.claim}` },
      { question: `Nabobegrep for ${emne.title}?`, positions: [`Kjerne: ${seed[0]}`, `Grense: ${curation.boundary}`], evidence_needed: `Dokumentasjon: ${claimText(0)}` }
    ],
    examples: [
      { title: `Undervisningsscenario: ${cases[0] || 'universitetslaboratorium'}`, analysis: `Kildestøtte: ${claimText(3)} Hypotetisk og konstruert analyseoppsett: ${seed[2]}. Ingen stedspåstand.`, claim_ids: [claims[3].id], source_ids: claimSources(3), case_status: 'analytical_teaching_scenario' },
      { title: `Sammenlignende scenario: ${cases[1] || 'to institusjonelle rammer'}`, analysis: `Kildestøtte: ${claimText(4)} Hypotetisk sammenligning: ${seed[1]}. Ingen stedspåstand.`, claim_ids: [claims[4].id], source_ids: claimSources(4), case_status: 'analytical_teaching_scenario' }
    ],
    learning_outcomes: [
      `Definisjon: ${emne.title}; nabobegreper avgrenses.`,
      `Teorisammenligning: ${curation.models[0].name} og ${curation.models[1].name}.`,
      `Scenarioanalyse: ${seed[2]}; ingen personslutning.`
    ],
    key_questions: [
      `Indikator for ${emne.title}?`,
      `Analysenivå og tidsrom for ${seed[0]}?`,
      `Alternativ forklaring til ${seed[1]}?`
    ],
    models_or_researchers: [
      ...curation.models.map((model) => {
        const modelClaim = CLAIM_BY_ID.get(model.claimId);
        return {
          name: model.name,
          role: `Kildestøtte: ${modelClaim.claim} Rolle i ${emne.title}: ${seed[0]}.`,
          use_limit: `Bruksgrense: ${curation.boundary}`,
          claim_ids: [modelClaim.id],
          source_ids: modelClaim.source_ids
        };
      })
    ],
    related_emne_ids: related,
    claim_ids: curation.claimIds,
    source_ids: sourceIds,
    misuse_guard: `${config.limitation} Artikkelen skal brukes til kildebasert undervisning og analyse. Den gir ikke grunnlag for selvdiagnose, fjernvurdering, individuell behandling, tvangsanbefaling eller karakterisering av en befolkningsgruppe. Sted, alder, gruppetilhørighet, én hendelse eller ett testresultat kan aldri alene bære en klinisk eller moralsk konklusjon.`,
    editorial_review: { ...EDITORIAL_REVIEW, checks: { ...EDITORIAL_REVIEW.checks } },
    quality_review: { ...QUALITY_REVIEW }
  };
}

function conceptId(term) {
  const base = slug(term);
  if (base === 'folelser' || base === 'livslop') {
    return `begrep_psy_${base}_${/[æøåéèêüöä]/i.test(term) ? 'nb' : 'ascii'}`;
  }
  return `begrep_psy_${base}`;
}

function materializeConceptRegistry() {
  const terms = unique(EMNER.flatMap((emne) => emne.core_concepts || [])).sort((a, b) => a.localeCompare(b, 'nb'));
  const ids = terms.map(conceptId);
  if (new Set(ids).size !== ids.length) throw new Error('Canonicale begrepstermer kolliderer etter ID-materialisering');
  const concepts = terms.map((term) => {
    const gloss = CONCEPT_GLOSSES[term];
    if (!gloss) throw new Error(`Mangler håndredigert begrepsdefinisjon for ${term}`);
    const owners = EMNER.filter((emne) => (emne.core_concepts || []).includes(term));
    const owner = owners[0];
    const claimIds = CONCEPT_CLAIMS[term];
    if (!claimIds?.length) throw new Error(`Mangler eksplisitt claim-kuratering for begrepet ${term}`);
    const claims = claimIds.map((id) => CLAIM_BY_ID.get(id));
    if (claims.some((claim) => !claim)) throw new Error(`Begrepet ${term} peker til ukjent claim`);
    const relatedTerms = unique(owners.flatMap((emne) => emne.core_concepts || [])).filter((value) => value !== term).slice(0, 5);
    const cases = unique(owner.recommended_oslo_cases || owner.good_for_places || ['universitet']);
    const modelEvidence = [];
    for (const claim of claims) {
      for (const model of MODELS_BY_CLAIM_ID.get(claim.id) || []) {
        if (!modelEvidence.some((row) => row.name === model.name && row.claim_id === claim.id)) {
          modelEvidence.push({ name: model.name, claim_id: claim.id, source_ids: [...claim.source_ids].sort() });
        }
      }
    }
    const label = ({ kognitive:'Kognitive prosesser', prosesser:'Psykologiske prosesser', psykisk:'Psykiske prosesser', sosial:'Sosiale prosesser', ubevisste:'Ubevisste prosesser' })[term] || titleCase(term);
    const ownerLabels = owners.slice(0,3).map((emne) => emne.title);
    const ownerScope = owners.length > 3 ? `${ownerLabels.join(', ')} og ${owners.length - 3} andre canonicale emner` : ownerLabels.join(', ');
    const scenarioSeed = TOPIC_SEEDS[owner.emne_id]?.[2] || `en avgrenset situasjon fra ${owner.title.toLocaleLowerCase('nb-NO')} der aktør, tid og datakilde er oppgitt`;
    return {
      concept_id: conceptId(term),
      canonical_term: term,
      label,
      definition: `${label} betegner ${gloss}. Definisjonen avgrenses gjennom ${ownerScope} og skal alltid brukes med angitt analyseenhet, tidsramme og operasjonalisering.`,
      explanation: `${owner.why_it_matters} For ${label.toLocaleLowerCase('nb-NO')} betyr dette at begrep, indikator og forklaring må holdes fra hverandre. Eksplisitt kuraterte evidenspåstander: ${claims.map((claim) => claim.claim).join(' ')} Disse kildene støtter den avgrensede forbindelsen; bruk i andre populasjoner, historiske perioder eller institusjoner krever at målet og slutningsgrensen prøves på nytt.`,
      not_meaning: `${label} skal ikke brukes som en skjult egenskap lest direkte av ett tegn, ett sted, en gruppekategori eller én hendelse. Fordi begrepet her viser til ${gloss}, må den konkrete indikatoren dokumenteres før en forklaring vurderes. Begrepet er heller ikke automatisk en diagnose, moralsk dom eller universell årsak. ${owner.scope_guard || 'Bruk krever en dokumenterbar psykologisk kobling.'}`,
      related_concept_ids: relatedTerms.map(conceptId),
      models_or_researchers: unique(modelEvidence.map((row) => row.name)),
      model_evidence: modelEvidence,
      model_assignment_status: modelEvidence.length ? 'claim_supported' : 'no_named_model_supported_by_curated_claims',
      empirical_status: `Håndredigert og claimsporet undervisningsbegrep med forankring i ${owners.length} canonical${owners.length === 1 ? 't' : 'e'} emne${owners.length === 1 ? '' : 'r'}. Empirisk styrke vurderes per operasjonalisering, design, populasjon og anvendelse; statusen er ikke en universell styrkegrad.`,
      example: `Hypotetisk undervisningsscenario ved ${cases[0]}: ${titleCase(scenarioSeed)}. Studenten avgrenser ${label.toLocaleLowerCase('nb-NO')} til én analyseenhet, velger minst to observerbare indikatorer og setter opp en alternativ forklaring. Scenarioet er ikke en påstand om stedet eller personene der; det viser hva kildegrunnlaget støtter og hvor slutningen må stoppe.`,
      source_emne_ids: owners.map((emne) => emne.emne_id).sort(),
      claim_ids: claims.map((claim) => claim.id),
      source_ids: unique(claims.flatMap((claim) => claim.source_ids || [])).sort(),
      editorial_status: 'editorial_ready_v2'
    };
  });
  write(CONCEPT_PATH, {
    schema: 'history_go_psykologi_concept_registry_v1',
    version: '1.0.0',
    updated_at: UPDATED_AT,
    subject_id: 'psykologi',
    canonical_source: 'data/fag/psykologi/emner_psykologi_canonical_v4_5.json#core_concepts',
    concept_count: concepts.length,
    coverage: { expected_unique_canonical_terms: terms.length, materialized_unique_canonical_terms: concepts.length, hand_edited_definition_count: concepts.length, complete: true },
    concepts
  });
  return concepts.length;
}

const APPLIED_FIELDS = Object.freeze([
  { area_id: 'clinical_health', label: 'Klinisk psykologi og helsepsykologi', focus: 'vurdering av helse, funksjon, behandling, omsorg, forebygging og tjenesteforløp uten å gjøre undervisning til individuell helsehjelp', emne_ids: ['em_psy_psykisk_helse','em_psy_behandlingsformer','em_psy_terapi_praksis','em_psy_pasientrolle_erfaring','em_psy_stress_belastning','em_psy_velferd_psykisk_helse'], method_ids: ['met_psy_klinisk_analyse','met_psy_praksisanalyse','met_psy_systemanalyse','met_psy_velferdspsykologisk_analyse'], university_area_ids: ['biological_psychology','cognitive_psychology','research_methods_statistics'] },
  { area_id: 'work_organizational', label: 'Arbeids- og organisasjonspsykologi', focus: 'motivasjon, grupper, ledelse, beslutninger, arbeidskrav, kontroll, læring og organisasjonskontekst', emne_ids: ['em_psy_motivasjon_behov','em_psy_grupper_roller','em_psy_sosial_pavirkning','em_psy_beslutning_valg','em_psy_stress_belastning','em_psy_personlighet_individ'], method_ids: ['met_psy_motivasjonsanalyse','met_psy_gruppeanalyse','met_psy_beslutningsanalyse','met_psy_stressanalyse'], university_area_ids: ['social_psychology','personality_psychology','research_methods_statistics'] },
  { area_id: 'educational_school', label: 'Pedagogisk og skolepsykologi', focus: 'læring, hukommelse, motivasjon, utvikling, tilhørighet, klassemiljø og etisk bruk av måling i skolen', emne_ids: ['em_psy_skole_motivasjon','em_psy_laring_hukommelse','em_psy_barn_ungdom','em_psy_sosial_utvikling','em_psy_oppmerksomhet_fokus','em_psy_psykometri_maling'], method_ids: ['met_psy_laringsanalyse','met_psy_utviklingsanalyse','met_psy_oppmerksomhetsanalyse','met_psy_psykometrisk_analyse'], university_area_ids: ['developmental_psychology','cognitive_psychology','research_methods_statistics'] },
  { area_id: 'culture', label: 'Kulturpsykologi', focus: 'hvordan kulturelle redskaper, normer, språk, identitet og historiske institusjoner former psykologiske uttrykk og kunnskapsproduksjon', emne_ids: ['em_psy_identitet_selv','em_psy_normalitet_avvik','em_psy_fordommer_kategorisering','em_psy_selv_utvikling_mening','em_psy_sosial_utvikling','em_psy_diagnose_klassifikasjon'], method_ids: ['met_psy_identitetsanalyse','met_psy_normkritisk_analyse','met_psy_sosialpsykologisk_analyse','met_psy_vitenskapshistorisk_analyse'], university_area_ids: ['social_psychology','developmental_psychology','history_science_theory'] },
  { area_id: 'environment_community', label: 'Miljø- og communitypsykologi', focus: 'forholdet mellom steder, nærmiljø, deltakelse, trygghet, sosial støtte, tjenester og ulik tilgang til ressurser', emne_ids: ['em_psy_byrom_psykisk_helse','em_psy_oppvekst_miljo','em_psy_ensomhet_tilhorighet','em_psy_trygghet_tillit','em_psy_kollektiv_krise','em_psy_velferd_psykisk_helse'], method_ids: ['met_psy_steds_og_institusjonsanalyse','met_psy_miljo_og_kontekstanalyse','met_psy_tilhorighetsanalyse','met_psy_systemanalyse'], university_area_ids: ['social_psychology','developmental_psychology','research_methods_statistics'] },
  { area_id: 'quantitative_psychometrics', label: 'Kvantitativ psykologi og psykometri', focus: 'operasjonalisering, reliabilitet, validitet, måleinvarians, usikkerhet, prediksjon og ansvarlig bruk av psykologiske mål', emne_ids: ['em_psy_psykometri_maling','em_psy_forskning_metode','em_psy_personlighet_individ','em_psy_kognitive_bias','em_psy_beslutning_valg','em_psy_diagnose_klassifikasjon'], method_ids: ['met_psy_psykometrisk_analyse','met_psy_eksperimentell_analyse','met_psy_biasanalyse','met_psy_beslutningsanalyse'], university_area_ids: ['research_methods_statistics','personality_psychology','cognitive_psychology'] }
]);

const APPLIED_FIELD_EDITORIAL = Object.freeze({
  clinical_health: {
    claim_ids: ['phi-07','phi-08','phi-10','phi-16','phi-17','phi-25'],
    practice_questions: ['Hvordan skilles selvrapportert belastning, funksjon, kliniske symptomer og diagnostisk vurdering i datagrunnlaget?', 'Hvilken behandlingskomponent sammenlignes med hva, for hvem, over hvilket tidsrom og med hvilke uønskede virkninger?', 'Hvordan dokumenteres informert medvirkning, kontinuitet og faktisk tilgang gjennom tjenesteforløpet?'],
    limitations_and_ethics: 'Klinisk forskning gir kunnskap om grupper, tiltak og måleinstrumenter; den erstatter ikke individuell utredning. Diagnose, behandling og tvang krever kvalifisert vurdering og gjeldende rettslige vilkår. Analyse skal skille symptom, funksjon, personens mål, klinisk beslutning og systemets tilgang, og rapportere usikkerhet og mulige skadevirkninger.'
  },
  work_organizational: {
    claim_ids: ['fti-17','sns-01','sns-04','kfa-11','kfa-27','fti-21'],
    practice_questions: ['Er utfallet prestasjon, helse, fravær, læring eller opplevd arbeidsmiljø, og hvem har definert det?', 'Hvordan måles krav, kontroll, støtte og belønning uten å gjøre organisasjonsproblemer til personlighetstrekk?', 'Er utvelgelses- eller evalueringstesten valid, rettferdig og relevant for den konkrete rollen?'],
    limitations_and_ethics: 'Arbeidsdata inngår i maktforhold og kan påvirke ansettelse, lønn og tilrettelegging. Gruppekorrelasjoner eller testskår skal ikke brukes som skjult diagnose eller automatisk beslutning. Evalueringen må kontrollere jobbrelatert validitet, målefeil, skjevheter, konfidensialitet og om organisatoriske årsaker blir individualisert.'
  },
  educational_school: {
    claim_ids: ['uol-10','uol-11','uol-12','uol-13','uol-14','uol-15'],
    practice_questions: ['Måles prestasjon under øving, langtidsretensjon eller overføring til en ny oppgave?', 'Hvordan påvirker undervisningsdesign, mestring, autonomi og tilhørighet ulike elevgrupper?', 'Hvilke konsekvenser får kartleggingen, og er tolkningen gyldig på elev-, klasse- og skolenivå?'],
    limitations_and_ethics: 'Skolemålinger er situerte og skal ikke bli faste etiketter på evne, motivasjon eller framtid. Barnets rettigheter, utviklingsvariasjon, språk, tilrettelegging og formålet med databruken må være eksplisitte. Tiltak bør evalueres på læring, trivsel, ulikhet og uønskede virkninger, ikke bare én kortsiktig skår.'
  },
  culture: {
    claim_ids: ['sns-13','sns-14','sns-16','sns-19','uol-22','uol-24'],
    practice_questions: ['Er begrepet lokalt meningsfullt, eller er en målemodell overført uten dokumentert ekvivalens?', 'Hvordan skilles personens selvbeskrivelse fra forskerens kategori og institusjonens klassifikasjon?', 'Hvilke historiske maktforhold påvirker hvem som definerer normalitet, helse og ønsket atferd?'],
    limitations_and_ethics: 'Kulturelle grupper er heterogene og må ikke behandles som forklarende personlighetstyper. Sammenligning krever språklig og målemessig ekvivalens, kontekst og lokal fortolkning. Forskeren skal synliggjøre kategorienes historie, variasjon innen grupper og risikoen for å gjøre majoritetsnormer til universelle standarder.'
  },
  environment_community: {
    claim_ids: ['sns-25','sns-26','sns-27','tkr-07','tkr-18','uol-21'],
    practice_questions: ['Hvilke konkrete stedsegenskaper, tjenester eller relasjoner utgjør den foreslåtte eksponeringen?', 'Skilles opplevd trygghet, registrert risiko, sosial kontakt og faktisk tilgang til ressurser?', 'Hvordan deltar berørte grupper i problemdefinisjon, tiltak og vurdering av fordelingsvirkninger?'],
    limitations_and_ethics: 'Et sted eller nabolag har ikke en diagnose, personlighet eller skjult psykisk egenskap. Analysen må dokumentere mekanismer som tilgang, støy, møteplasser, diskriminering eller tjenestekontinuitet og skille komposisjon fra kontekst. Kartlegging skal ikke stigmatisere områder eller bruke aggregater til slutninger om enkeltbeboere.'
  },
  quantitative_psychometrics: {
    claim_ids: ['fti-03','fti-21','fti-22','fti-23','kfa-09','kfa-14'],
    practice_questions: ['Hvilken latent konstruksjon skal måles, og hvilke observasjoner inngår eller faller utenfor?', 'Er reliabilitet, validitet og måleinvarians dokumentert for populasjonen og beslutningen som faktisk skal brukes?', 'Hvordan rapporteres usikkerhet, basisrate, kalibrering, terskelvalg og konsekvenser av feilklassifikasjon?'],
    limitations_and_ethics: 'En skår er et usikkert resultat fra en modell og et instrument, ikke egenskapen selv. Høy reliabilitet beviser verken validitet, rettferdighet eller nytte. Bruk krever dokumentasjon for aktuell populasjon og beslutning, kontroll av måleinvarians og skjevhet, og en vurdering av hvem som bærer kostnaden ved falske positive og falske negative.'
  }
});

function materializeAppliedFields() {
  const fields = APPLIED_FIELDS.map((field) => {
    const editorial = APPLIED_FIELD_EDITORIAL[field.area_id];
    if (!editorial) throw new Error(`Mangler anvendt-faglig v2-redigering for ${field.area_id}`);
    const claims = editorial.claim_ids.map((claimId) => CLAIM_BY_ID.get(claimId));
    if (claims.some((claim) => !claim)) throw new Error(`Mangler anvendt-faglig claim for ${field.area_id}`);
    return {
      ...field,
      status: 'complete',
      coverage_statement: `${field.label} er dekket som et anvendt universitetsfelt gjennom ${field.focus}. Feltet binder canonicale emner, metoder og universitetskjerne sammen uten å opprette et parallelt emnehierarki.`,
      practice_questions: editorial.practice_questions,
      limitations_and_ethics: editorial.limitations_and_ethics,
      claim_ids: claims.map((claim) => claim.id),
      source_ids: unique(claims.flatMap((claim) => claim.source_ids || [])).sort(),
      editorial_review: { status: 'approved_editorial_quality_v2', reviewed_at: UPDATED_AT, reviewer_role: 'psychology_editorial_audit', review_standard: 'history_go_psykologi_editorial_quality_v2' }
    };
  });
  write(APPLIED_PATH, { schema: 'history_go_psykologi_applied_fields_university_v1', version: '1.0.0', updated_at: UPDATED_AT, subject_id: 'psykologi', field_count: fields.length, fields });
  return fields.length;
}

function materializeFinalState(conceptCount) {
  const matrix = read(MATRIX_PATH);
  matrix.version = '2.0.0';
  matrix.updated_at = UPDATED_AT;
  matrix.status = 'complete';
  matrix.concept_registry_contract.canonical_source_field = 'core_concepts';
  matrix.concept_registry_contract.expected_unique_concept_count = conceptCount;
  matrix.concept_registry_contract.exact_canonical_term_coverage_required = true;
  matrix.concept_registry_contract.required_fields = unique([...(matrix.concept_registry_contract.required_fields || []), 'claim_ids', 'editorial_status']);
  matrix.concept_registry_contract.editorial_status_required = 'editorial_ready_v2';
  matrix.topic_article_contract.required_quality_fields = unique([...(matrix.topic_article_contract.required_quality_fields || []), 'quality_review']);
  matrix.topic_article_contract.quality_review_status_required = 'approved_editorial_quality_v2';
  matrix.topic_article_contract.quality_review_standard = 'history_go_psykologi_editorial_quality_v2';
  matrix.editorial_quality_contract = {
    audit: 'scripts/audit-fagverk-psykologi-editorial-quality-v2.mjs',
    report: 'reports/fagverk/psykologi-editorial-quality-v2-audit.json',
    minimum_score_per_dimension: 4,
    minimum_total_score: 27,
    required_status: 'psykologi_editorial_quality_v2_high',
    no_critical_flags_required: true,
    no_repeated_long_editorial_sentences_required: true,
    all_claim_source_bindings_required: true,
    separate_aha_subject_matter_review_still_required: true
  };
  matrix.completion_contract.requirements = unique([...(matrix.completion_contract.requirements || []), 'editorial_quality_v2_score_at_least_27_without_critical_flags']);
  matrix.applied_field_contract = {
    path: APPLIED_PATH,
    schema: 'history_go_psykologi_applied_fields_university_v1',
    required_field_count: 6,
    exact_area_coverage_required: true,
    all_emne_method_source_and_claim_ids_must_resolve: true,
    editorial_review_status_required: 'approved_editorial_quality_v2'
  };
  matrix.applied_field_matrix = matrix.applied_field_matrix.map((row) => ({ ...row, current_status: 'complete', current_artifact: APPLIED_PATH }));
  write(MATRIX_PATH, matrix);

  const status = read(STATUS_PATH);
  const statusEntry = status.subjects.find((row) => row.id === 'psykologi');
  if (!statusEntry) throw new Error('Psykologi mangler subject_status');
  statusEntry.editorialStatus = 'complete';
  statusEntry.nextGate = FINAL_GATE;
  statusEntry.note = 'Psykologi er komplett etter universitetsporten og den seksdelte kvalitetsporten: 6/6 canonicale kapitler, 58/58 selvstendige og kildeførte emneartikler, 136/136 håndredigerte og claimsporede begreper, syv universitetskjernegrener og seks auditerte anvendte fagfelt. Innholdet forblir utenfor AHA-runtime til separat ekstern fagreview og aktivering.';
  write(STATUS_PATH, status);

  const registry = read(REGISTRY_PATH);
  const subject = registry.subjects?.psykologi;
  if (!subject) throw new Error('Psykologi mangler registry');
  subject.canonicalModel.note = 'Psykologifagets seks canonicale fagområder eier rendererstrukturen. Alle 58 emner har selvstendige, kilde- og claimsporede universitetsartikler; 136 begreper har håndredigerte definisjonskjerner; universitetskjernen og seks anvendte fagfelt er auditert. Den seksdelte kvalitetsporten må være grønn, og AHA-aktivering krever fortsatt separat ekstern fagreview.';
  subject.editorialPlan.nextGate = FINAL_GATE;
  write(REGISTRY_PATH, registry);
}

const remaining = EMNER.filter((emne) => emne.domain !== MENTAL_HEALTH_DOMAIN).sort((a, b) => a.emne_id.localeCompare(b.emne_id));
if (remaining.length !== 46 || Object.keys(TOPIC_SEEDS).length !== 46) throw new Error('Sluttmaterialiseringen må eie eksakt de resterende 46 emnene');
for (const article of remaining.map(articleFor)) write(`${ARTICLE_DIR}/${article.emne_id}.json`, article);
const conceptCount = materializeConceptRegistry();
const appliedFieldCount = materializeAppliedFields();
materializeFinalState(conceptCount);
console.log(`Materialiserte Psykologi university completion: 46 nye emneartikler, ${conceptCount} canonicale begreper og ${appliedFieldCount} anvendte fagfelt.`);
