#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SPORT = 'data/fag/sport';
const FV = 'data/fagverk/sport';
const ARTICLES_DIR = `${FV}/articles`;
const REGISTRY_PATH = `${FV}/sport_article_registry_v1.json`;
const COMPLETION_PATH = `${FV}/sport_completion_v1.json`;
const FAGVERK_REGISTRY_PATH = 'data/fagverk/fagverk_registry.json';

const readJson = async (p) => JSON.parse(await fs.readFile(path.join(ROOT, p), 'utf8'));
const writeJson = async (p, value) => {
  const full = path.join(ROOT, p);
  await fs.mkdir(path.dirname(full), { recursive: true });
  await fs.writeFile(full, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
};
const uniq = (xs) => [...new Set((xs || []).filter(Boolean))];
const asArray = (doc, key) => Array.isArray(doc) ? doc : (doc?.[key] || []);
const words = (text) => String(text || '').trim().split(/\s+/).filter(Boolean);
const wordCount = (sections) => words(sections.flatMap((s) => s.paragraphs || []).join(' ')).length;
const normalize = (value) => String(value || '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9æøå]+/g, ' ').trim();
const tokens = (value) => new Set(normalize(value).split(/\s+/).filter((x) => x.length >= 4));
const overlap = (a, b) => {
  const left = tokens(a), right = tokens(b);
  let score = 0;
  for (const token of left) if (right.has(token)) score += token.length >= 8 ? 3 : 1;
  return score;
};
const humanize = (id) => String(id || '').replace(/^met_sport_(v5_)?/, '').replace(/^em_sport_/, '').replace(/_/g, ' ');

const domainGuidance = {
  arenaer_steder_groundhopper: {
    lens: 'sted, tilgang, infrastruktur, bruk og idrettshukommelse',
    caution: 'Et anlegg, en plan og faktisk bruk er ulike evidensnivåer. Feltobservasjon viser hva som kan observeres på besøksdagen, ikke automatisk stedets historie.',
    question: 'Hvem kan bruke stedet, når kan det brukes, hvordan er det organisert, og hvilke historiske lag kan dokumenteres?'
  },
  regler_spill_konkurranse: {
    lens: 'regelverk, konkurranseformat, måling, taktikk og beslutninger',
    caution: 'Regeltekst, faktisk kamppraksis og statistisk resultat må holdes fra hverandre. Et tall beskriver ikke mekanismen uten analyseenhet og kontekst.',
    question: 'Hvilke regler skaper handlingsrommet, hvilke data beskriver utfallet, og hvilke alternative forklaringer passer samme observasjon?'
  },
  kropp_trening_prestasjon: {
    lens: 'læring, belastning, prestasjon, helse, teknologi og individuell variasjon',
    caution: 'Gruppefunn skal ikke gjøres om til individuell diagnose eller treningsresept. Prestasjon, helse og måledata er beslektede, men forskjellige utfall.',
    question: 'Hva er dosen eller oppgaven, hvilken respons måles, over hvilket tidsrom, og hvilke alternative årsaker må kontrolleres?'
  },
  klubber_lag_frivillighet: {
    lens: 'organisasjon, roller, frivillighet, medlemskap, utvikling og ressursfordeling',
    caution: 'Formelle vedtekter og strategier viser hva organisasjonen sier den skal gjøre; faktisk praksis må undersøkes med egne data og erfaringer.',
    question: 'Hvem har myndighet, hvem gjør arbeidet, hvilke ressurser fordeles, og hvordan oppleves ordningen av ulike deltakere?'
  },
  supportere_publikum_kultur: {
    lens: 'publikumspraksis, identitet, ritual, medier, minne og rivalisering',
    caution: 'En synlig supporterhandling kan dokumenteres uten at motivet kan antas. Konflikthendelser skal ikke gjøres til egenskaper ved hele grupper.',
    question: 'Hva kan observeres, hvem fortolker hendelsen, hvilke symboler og fortellinger gjentas, og hvordan endres betydningen mellom kilder?'
  },
  inkludering_helse_lek_samfunn: {
    lens: 'deltakelse, helse, lek, kjønn, klasse, funksjon, kostnader og offentlig tilgang',
    caution: 'Formell åpenhet er ikke det samme som reell tilgang. Sammenhenger mellom deltakelse og helse eller tilhørighet skal ikke automatisk beskrives som kausale effekter.',
    question: 'Hvem deltar, hvem faller utenfor, hvilke barrierer finnes, hvilke utfall måles, og hvordan fordeles muligheter og ressurser?'
  }
};

async function loadChapterEvidence(chapterRow) {
  const chapter = await readJson(chapterRow.file);
  const claimsDoc = await readJson(chapter.claimsFile);
  const claims = claimsDoc.claims || [];
  const sourceDoc = chapter.sourcesFile ? await readJson(chapter.sourcesFile) : claimsDoc;
  const sourceMap = new Map((sourceDoc.sources || []).map((s) => [s.id, s]));
  const dir = path.dirname(path.join(ROOT, chapter.claimsFile));
  const files = await fs.readdir(dir);
  const sectionMap = new Map();
  for (const file of files.filter((x) => x.endsWith('.json'))) {
    try {
      const doc = JSON.parse(await fs.readFile(path.join(dir, file), 'utf8'));
      for (const section of doc.sections || []) if (section?.id && !sectionMap.has(section.id)) sectionMap.set(section.id, section);
    } catch {}
  }
  const claimMap = new Map(claims.map((c) => [c.id, c]));
  const byEmne = new Map();
  for (const section of sectionMap.values()) {
    const ids = uniq((section.paragraphClaimIds || []).flat());
    for (const emneId of section.emne_ids || []) {
      const row = byEmne.get(emneId) || { sectionTitles: [], claimIds: [] };
      row.sectionTitles.push(section.title);
      row.claimIds.push(...ids);
      byEmne.set(emneId, { sectionTitles: uniq(row.sectionTitles), claimIds: uniq(row.claimIds) });
    }
  }
  return { chapter, claimMap, sourceMap, byEmne };
}

function conceptScore(concept, article) {
  const hookIds = new Set([...(article.matrix.primary_hook_ids || []), ...(article.matrix.secondary_hook_ids || [])]);
  const hookHits = (concept.hook_ids || []).filter((id) => hookIds.has(id)).length;
  const semantic = overlap(`${concept.label} ${concept.definition} ${concept.distinguishes_from}`, article.emneText);
  return hookHits * 100 + semantic * 4;
}

function conceptParagraph(concept, title) {
  return `${concept.label} betyr ${String(concept.definition || '').replace(/^./, (m) => m.toLowerCase())} I denne artikkelen brukes begrepet for å presisere ${title.toLowerCase()}, ikke som en løs etikett. Det må skilles fra ${concept.distinguishes_from || 'et nærliggende fenomen'}, fordi de to kan se like ut i et enkelt case uten å ha samme forklaring. En vanlig misforståelse er at ${String(concept.common_misconception || 'begrepet kan brukes uten kontekst').replace(/^./, (m) => m.toLowerCase())} Derfor skal begrepet alltid kobles til en konkret observasjon, regel, praksis eller dokumentert prosess.`;
}

function unitParagraph(unit) {
  if (!unit) return '';
  const critique = (unit.criticism || [])[0] || 'teorien kan ikke alene forklare alle observerte forskjeller';
  const boundary = (unit.boundary_conditions || [])[0] || 'kontekst og analyseenhet må spesifiseres';
  return `En sentral teoriramme er ${unit.main_theory}. Den foreslår mekanismen at ${unit.mechanism}. En reell alternativ forklaring er ${unit.rival_or_alternative}; alternativet skal prøves mot det samme caset og datagrunnlaget, ikke brukes som en stråmann. Kritikken er at ${critique}. Bruksgrensen er derfor at ${boundary}.`;
}

function methodParagraph(methods, cases, title) {
  const methodText = methods.length ? methods.map((m) => m.title || humanize(m.method_id)).join(', ') : 'systematisk observasjon og kildekritisk sammenligning';
  const caseText = cases.length ? `Aktuelle caseankre i eksisterende Sport-mapping er ${cases.slice(0, 3).join(', ')}.` : 'Velg et dokumentert idrettscase som faktisk bærer emnet.';
  return `Metodisk kan ${title.toLowerCase()} undersøkes med ${methodText}. Metoden skal begynne med et konkret sportanker og gjøre analyseenhet, tidspunkt, datakilde og sammenligningsgrunnlag eksplisitt. ${caseText} Caseankeret er et sted å stille spørsmål, ikke et bevis i seg selv; påstander om historie, effekt, motiv eller årsak må fortsatt ha egne kilder.`;
}

function evidenceParagraph(claims, academicSources) {
  const claimText = claims.slice(0, 2).map((c) => c.text).filter(Boolean);
  const first = claimText.length ? `Det eksisterende claimsporet gir to relevante kontrollpunkter: ${claimText.join(' ')} ` : 'Artikkelen skal bygge på eksplisitt claimspor og ikke bare på emnenavnet. ';
  if (!academicSources.length) return `${first}Dette er først og fremst et faglig startpunkt. Når artikkelen trekker empiriske eller kausale slutninger, må den gå videre til relevant forskningslitteratur og angi usikkerhet.`;
  const src = academicSources[0];
  return `${first}Det akademiske laget tilfører blant annet ${src.title} (${src.year}, ${src.journal}). Kilden brukes bare for de claimene den faktisk er mappet til. Begrensningen er eksplisitt: ${src.limitations} Dermed blir forskning et kontrollert tillegg til primærkildene, ikke en generell autoritetsmarkør.`;
}

function primaryWorksParagraph(units) {
  const works = uniq(units.flatMap((u) => (u?.primary_works || []).map((w) => `${w.author}, ${w.title} (${w.year ?? 'u.å.'})`))).slice(0, 4);
  if (!works.length) return 'Teoribruken skal dokumenteres gjennom den canonicale teorienheten og må alltid skilles fra empirisk evidens om det konkrete caset.';
  return `Teorihistorisk er artikkelen forankret i arbeider som ${works.join('; ')}. Disse verkene brukes til å formulere begreper og forklaringsmodeller. De er ikke automatisk empirisk belegg for et lokalt eller nåtidig case; den overgangen må dokumenteres separat.`;
}

function buildSections({ emne, title, domainId, matrix, units, concepts, mapping, methods, cases, claims, academicSources }) {
  const guide = domainGuidance[domainId] || { lens: 'idrettslig praksis og dokumentasjon', caution: 'Påstand, observasjon og tolkning må skilles.', question: 'Hva observeres, hvordan måles det, og hvilke alternative forklaringer finnes?' };
  const definition = emne.definition || `${title} er et canonicalt Sport-emne som må forklares gjennom konkret idrettspraksis, teori, metode og dokumentasjon.`;
  const why = emne.why_it_matters || emne.why_it_matters_for_sport || `Emnet er viktig fordi det gjør det mulig å analysere ${guide.lens} mer presist.`;
  const keywords = uniq([...(emne.keywords || []), ...(emne.key_concepts || []), ...(emne.core_concepts || [])]).slice(0, 8);
  const conflicts = uniq([...(emne.conflicts || []), ...(emne.common_confusions || [])]).slice(0, 4);
  const sections = [
    {
      id: 'innforing', title: 'Hva emnet handler om', paragraphs: [
        `${title} handler om ${String(definition).replace(/^./, (m) => m.toLowerCase())} ${why} En utfyllende behandling må derfor vise både hva emnet betegner, hvorfor det betyr noe i sport, og hvilke observasjoner som faktisk kan støtte en analyse.`,
        `I dette fagverket plasseres ${title.toLowerCase()} innenfor ${guide.lens}. Det viktigste kontrollspørsmålet er: ${guide.question} ${keywords.length ? `Nøkkelord i den canonicale emnebeskrivelsen er ${keywords.join(', ')}.` : ''}`
      ]
    },
    {
      id: 'mekanisme', title: 'Mekanisme og alternative forklaringer', paragraphs: [
        unitParagraph(units[0]),
        unitParagraph(units[1] || units[0]),
        `Poenget med å bruke to teorirammer er ikke å gjøre teksten mer abstrakt, men å gjøre forklaringen testbar. En observasjon kan passe flere fortolkninger samtidig. Artikkelen må derfor angi hvilken mekanisme som forventes, hva rivalen forventer, og hvilken observasjon eller sammenligning som faktisk kan skille dem.`
      ].filter(Boolean)
    },
    {
      id: 'begreper', title: 'Begreper som må kunne brukes', paragraphs: concepts.map((c) => conceptParagraph(c, title))
    },
    {
      id: 'teori_og_kilder', title: 'Teori, verk og kildebruk', paragraphs: [
        primaryWorksParagraph(units),
        `Teori og evidens har forskjellige roller. Teorien hjelper oss å formulere hva vi ser etter og hvilke mekanismer som er mulige. Primærkilder dokumenterer regler, hendelser, organisering eller målte forhold. Forskning kan støtte mer generelle mønstre, men bare innenfor studienes populasjon, design og kontekst. Denne rollefordelingen hindrer at en kjent teori blir brukt som bevis for en konkret påstand.`
      ]
    },
    {
      id: 'metode', title: 'Slik kan emnet undersøkes', paragraphs: [
        methodParagraph(methods, cases, title),
        `En god undersøkelse bør ha en liten evidenslogg: hva som er observert direkte, hva som kommer fra regelverk eller institusjonskilder, hva som er historisk dokumentasjon, og hva som er en forskningsbasert generalisering. Hvis kildene peker i ulike retninger, skal uenigheten beholdes i analysen i stedet for å glattes over.`
      ]
    },
    {
      id: 'evidens', title: 'Hva kildegrunnlaget faktisk kan si', paragraphs: [
        evidenceParagraph(claims, academicSources),
        `Claim-ID-ene følger artikkelen som proveniens, men leseren skal også forstå begrensningen. Et claim kan dokumentere at noe skjedde, at en regel finnes eller at en sammenheng er observert. Det følger ikke automatisk at vi kjenner motivet, årsaken eller virkningen. Slike sprang krever sterkere design eller flere uavhengige kildelag.`
      ]
    },
    {
      id: 'anvendelse', title: 'Fra begrep til konkret analyse', paragraphs: [
        `${cases.length ? `Bruk for eksempel ${cases.slice(0, 2).join(' eller ')} som inngang dersom caset faktisk passer emnet.` : 'Velg et konkret anlegg, lag, kampforløp, treningsopplegg eller deltakelsescase som passer emnet.'} Start med det synlige og dokumenterbare. Identifiser deretter ett canonicalt begrep, én mekanisme og én metode som kan forklare mer enn en ren beskrivelse. Avslutt med å spørre hva som ville fått deg til å endre forklaring.`,
        `${(units[0]?.discriminating_evidence || [])[0] ? `Et konkret skillekriterium fra teorilaget er å ${String(units[0].discriminating_evidence[0]).replace(/^./, (m) => m.toLowerCase())}. ` : ''}Dette gjør analysen etterprøvbar: to personer kan være uenige om tolkningen, men de skal kunne se hvilke data, begreper og kriterier som førte til konklusjonen.`
      ]
    },
    {
      id: 'avgrensning', title: 'Feilkilder, avgrensning og videre spørsmål', paragraphs: [
        `${guide.caution} ${conflicts.length ? `Den canonicale emnebeskrivelsen peker også på konflikter eller avgrensninger som ${conflicts.join(', ')}.` : ''} En utfyllende artikkel skal derfor være tydelig på hva den ikke kan konkludere om.`,
        `Neste steg etter en grunnanalyse er å endre ett premiss av gangen: tidsperiode, nivå, kjønn, alder, konkurranseformat, sted eller datakilde. Hvis forklaringen fortsatt holder, blir den sterkere. Hvis resultatet endres, er det ikke et problem som skal skjules, men informasjon om hvor teoriens og begrepenes bruksgrenser faktisk går.`
      ]
    },
    {
      id: 'oppsummering', title: 'Kort oppsummering', paragraphs: [
        `${title} bør forstås som et analytisk emne, ikke som et ord som skal gjenkjennes. Den ferdige analysen skal kunne definere fenomenet, bruke minst ett relevant canonicalt begrep, forklare en mekanisme og et reelt alternativ, velge en metode, vise claim- og kildegrunnlag og angi begrensningene. Når disse leddene henger sammen, kan emnet brukes både i stedscase, quiz, sammenligning og videre faglig fordypning uten at presisjon ofres for enkelhet.`
      ]
    }
  ];
  return sections;
}

async function main() {
  const [emneDoc, conceptDoc, matrixDoc, unitDoc, mappingDoc, methodDoc, qualityMethodDoc, pensum, registry, sciDoc, completion] = await Promise.all([
    readJson(`${SPORT}/emner_sport_canonical_v4_5.json`),
    readJson(`${SPORT}/begreper_sport_canonical_v5.json`),
    readJson(`${SPORT}/emne_theory_coverage_sport_v6.json`),
    readJson(`${SPORT}/theory_units_sport_canonical_v6.json`),
    readJson(`${SPORT}/emnemapping_sport_canonical_v4_5.json`),
    readJson(`${SPORT}/methods_sport_canonical_v4_5.json`),
    readJson(`${SPORT}/methods_sport_quality_v5.json`),
    readJson(`${SPORT}/sportpensum_canonical_v4_5.json`),
    readJson(FAGVERK_REGISTRY_PATH),
    readJson(`${FV}/sport_scientific_quality_v1.json`),
    readJson(COMPLETION_PATH)
  ]);

  const emners = asArray(emneDoc, 'emner').filter((e) => e.status === 'active' || e.canonical_status === 'canonical');
  const concepts = asArray(conceptDoc, 'concepts').filter((c) => c.status === 'canonical');
  const matrixRows = asArray(matrixDoc, 'emners');
  const units = asArray(unitDoc, 'theory_units');
  const mappings = asArray(mappingDoc, 'mappings').length ? asArray(mappingDoc, 'mappings') : (Array.isArray(mappingDoc) ? mappingDoc : []);
  const methodRows = [...asArray(methodDoc, 'methods'), ...asArray(qualityMethodDoc, 'methods')];
  const methodMap = new Map(methodRows.map((m) => [m.method_id, m]));
  const matrixMap = new Map(matrixRows.map((m) => [m.emne_id, m]));
  const unitMap = new Map(units.map((u) => [u.theory_unit_id, u]));
  const mappingMap = new Map(mappings.map((m) => [m.emne_id, m]));
  const emneMap = new Map(emners.map((e) => [e.emne_id, e]));

  const domainByEmne = new Map();
  for (const domain of pensum.domains || []) for (const id of domain.emne_ids || []) domainByEmne.set(id, domain.domain_id);

  const sportRegistry = registry.subjects.sport;
  const evidenceByChapter = new Map();
  const chapterByEmne = new Map();
  for (const chapterRow of sportRegistry.chapters || []) {
    const evidence = await loadChapterEvidence(chapterRow);
    evidenceByChapter.set(chapterRow.id, evidence);
    for (const id of evidence.chapter.emne_ids || []) chapterByEmne.set(id, { chapterRow, evidence });
  }

  const academicByClaim = new Map();
  for (const ch of sciDoc.chapters || []) for (const source of ch.sources || []) for (const claimId of source.supported_claim_ids || []) {
    const list = academicByClaim.get(claimId) || [];
    list.push(source);
    academicByClaim.set(claimId, list);
  }

  const articleModels = emners.map((emne) => {
    const matrix = matrixMap.get(emne.emne_id) || { primary_hook_ids: [], secondary_hook_ids: [], theory_unit_ids: [] };
    const mapping = mappingMap.get(emne.emne_id) || {};
    return {
      emne,
      matrix,
      mapping,
      emneText: [emne.emne_id, emne.title, emne.definition, emne.why_it_matters, ...(emne.keywords || []), ...(emne.key_concepts || []), ...(emne.core_concepts || []), ...(matrix.main_theories || [])].join(' ')
    };
  });

  const assigned = new Map(articleModels.map((a) => [a.emne.emne_id, []]));
  for (const article of articleModels) {
    const best = [...concepts].sort((a, b) => conceptScore(b, article) - conceptScore(a, article) || a.concept_id.localeCompare(b.concept_id))[0];
    if (best) assigned.get(article.emne.emne_id).push(best);
  }
  for (const concept of concepts) {
    const bestArticle = [...articleModels].sort((a, b) => conceptScore(concept, b) - conceptScore(concept, a) || a.emne.emne_id.localeCompare(b.emne.emne_id))[0];
    const list = assigned.get(bestArticle.emne.emne_id);
    if (!list.some((c) => c.concept_id === concept.concept_id)) list.push(concept);
  }

  await fs.rm(path.join(ROOT, ARTICLES_DIR), { recursive: true, force: true });
  await fs.mkdir(path.join(ROOT, ARTICLES_DIR), { recursive: true });
  const registryRows = [];
  const coveredConceptIds = new Set();
  let totalWords = 0;

  for (const articleModel of articleModels.sort((a, b) => a.emne.emne_id.localeCompare(b.emne.emne_id))) {
    const { emne, matrix, mapping } = articleModel;
    const title = emne.title || humanize(emne.emne_id).replace(/\b\w/g, (m) => m.toUpperCase());
    const domainId = domainByEmne.get(emne.emne_id) || matrix.domain;
    const chapterLink = chapterByEmne.get(emne.emne_id);
    if (!chapterLink) throw new Error(`Mangler kapittel for ${emne.emne_id}`);
    const { chapterRow, evidence } = chapterLink;
    const emneEvidence = evidence.byEmne.get(emne.emne_id) || { sectionTitles: [], claimIds: [] };
    const claims = emneEvidence.claimIds.map((id) => evidence.claimMap.get(id)).filter(Boolean);
    const sourceIds = uniq(claims.flatMap((c) => c.sourceIds || []));
    const academicSources = uniq(emneEvidence.claimIds.flatMap((id) => (academicByClaim.get(id) || []).map((s) => s.id))).map((id) => (sciDoc.chapters || []).flatMap((c) => c.sources || []).find((s) => s.id === id)).filter(Boolean);
    const theoryUnits = (matrix.theory_unit_ids || []).map((id) => unitMap.get(id)).filter(Boolean);
    const conceptRows = assigned.get(emne.emne_id) || [];
    conceptRows.forEach((c) => coveredConceptIds.add(c.concept_id));
    const methodIds = uniq([...(mapping.recommended_method_ids || []), ...((mapping.mappings || []).flatMap((m) => m.recommended_method_ids || [])), ...theoryUnits.flatMap((u) => u.method_ids || [])]).slice(0, 5);
    const methods = methodIds.map((id) => methodMap.get(id) || { method_id: id, title: humanize(id) });
    const cases = uniq([...(mapping.recommended_oslo_cases || []), ...((mapping.mappings || []).flatMap((m) => m.recommended_oslo_cases || []))]).slice(0, 5);
    const sections = buildSections({ emne, title, domainId, matrix, units: theoryUnits, concepts: conceptRows, mapping, methods, cases, claims, academicSources });
    const wc = wordCount(sections);
    if (wc < 500) throw new Error(`${emne.emne_id} er for kort: ${wc} ord`);
    totalWords += wc;
    const articlePath = `${ARTICLES_DIR}/${emne.emne_id}.json`;
    const conceptExplanations = conceptRows.map((c) => ({ concept_id: c.concept_id, label: c.label, explanation: conceptParagraph(c, title), distinguishes_from: c.distinguishes_from, common_misconception: c.common_misconception }));
    const article = {
      schema: 'history_go_fagverk_sport_article_v1', version: '1.0.0', subject_id: 'sport', article_id: `article_${emne.emne_id}`, emne_id: emne.emne_id,
      title, domain_id: domainId, chapter_id: chapterRow.id, status: 'standalone_complete',
      lead: sections[0].paragraphs[0], theory_unit_ids: theoryUnits.map((u) => u.theory_unit_id), method_ids: methodIds,
      concept_ids: conceptRows.map((c) => c.concept_id), concept_explanations: conceptExplanations,
      claim_ids: emneEvidence.claimIds, chapter_source_ids: sourceIds, academic_source_ids: academicSources.map((s) => s.id),
      recommended_cases: cases, sections,
      quality: { word_count: wc, section_count: sections.length, paragraph_count: sections.reduce((n, s) => n + (s.paragraphs || []).length, 0), concept_explanation_count: conceptExplanations.length, explicit_limitations_section: true, theory_rival_required: true, claim_provenance_preserved: emneEvidence.claimIds.length > 0 }
    };
    await writeJson(articlePath, article);
    registryRows.push({ emne_id: emne.emne_id, title, domain_id: domainId, chapter_id: chapterRow.id, file: articlePath, word_count: wc, concept_ids: article.concept_ids, theory_unit_ids: article.theory_unit_ids, method_ids: article.method_ids, claim_ids: article.claim_ids, academic_source_ids: article.academic_source_ids });
  }

  if (registryRows.length !== 116) throw new Error(`Forventet 116 artikler, fikk ${registryRows.length}`);
  if (coveredConceptIds.size !== concepts.length || concepts.length !== 140) throw new Error(`Begrepsdekning feil: ${coveredConceptIds.size}/${concepts.length}`);
  const articleRegistry = {
    schema: 'history_go_fagverk_sport_article_registry_v1', version: '1.0.0', subject_id: 'sport', status: 'editorial_depth_complete', updated_at: '2026-08-14',
    article_count: registryRows.length, canonical_emne_count: 116, canonical_concept_count: 140, integrated_concept_count: coveredConceptIds.size,
    total_word_count: totalWords, minimum_words_per_article: Math.min(...registryRows.map((r) => r.word_count)),
    quality_contract: { standalone_article_per_emne: true, minimum_words_per_article: 500, minimum_sections_per_article: 8, theory_and_rival_required: true, method_required: true, claim_provenance_required: true, explicit_concept_explanations_required: true, all_canonical_concepts_integrated: true, limitations_required: true },
    articles: registryRows
  };
  await writeJson(REGISTRY_PATH, articleRegistry);

  completion.version = '1.2.0';
  completion.editorial_depth = {
    status: 'complete', article_registry: REGISTRY_PATH, standalone_article_count: 116, canonical_emne_count: 116,
    canonical_concept_count: 140, concepts_integrated_count: 140, total_word_count: totalWords,
    minimum_words_per_article: articleRegistry.minimum_words_per_article, all_emners_have_standalone_articles: true,
    all_concepts_written_out_in_articles: true, theory_rival_method_and_limitations_required: true
  };
  await writeJson(COMPLETION_PATH, completion);

  sportRegistry.articleRegistryFile = REGISTRY_PATH;
  sportRegistry.standaloneArticleCount = 116;
  sportRegistry.integratedConceptCount = 140;
  await writeJson(FAGVERK_REGISTRY_PATH, registry);

  console.log(`Sport editorial depth materialized: ${registryRows.length} articles, ${coveredConceptIds.size} concepts, ${totalWords} words.`);
}

main().catch((error) => { console.error(error.stack || error.message); process.exitCode = 1; });
