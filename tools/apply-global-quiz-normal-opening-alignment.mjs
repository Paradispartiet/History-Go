import fs from 'node:fs';

const STANDARD_PATH = 'data/quiz/regler/QUIZ_PRODUCTION_CANONICAL.md';
const POLICY_PATH = 'data/quiz/regler/QUIZ_NORMAL_OPENING_POLICY_V1.json';
const REGISTRY_PATH = 'data/quiz/regler/QUIZ_TEMPLATE_REGISTRY_V2.json';
const PROGRESSION_AUDIT_PATH = 'scripts/audit-quiz-progression.mjs';
const TEMPLATE_AUDIT_PATH = 'scripts/audit-quiz-template-governance.mjs';
const DEICHMAN_PATH = 'data/quiz/by/deichman_bjorvika_sets.json';
const REPORT_PATH = 'reports/quiz-global-normal-opening-alignment.md';

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function writeJson(file, value) {
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function replaceOnce(text, before, after, label) {
  if (!text.includes(before)) throw new Error(`Mangler forventet tekst for ${label}`);
  return text.replace(before, after);
}

let standard = fs.readFileSync(STANDARD_PATH, 'utf8');
standard = replaceOnce(standard, '**Versjon:** 3.0', '**Versjon:** 3.1', 'standardversjon');
standard = replaceOnce(
  standard,
  `1. \`data/quiz/regler/QUIZ_PRODUCTION_CANONICAL.md\`\n2. \`data/fag/fag_manifest.json\`\n3. filene manifestet krever for valgt kategori\n4. \`data/quiz/regler/QUIZ_QUESTION_SCHEMA_V2.json\`\n5. \`data/quiz/regler/QUIZ_PACKAGE_SCHEMA_V1.json\`\n6. stedets dokumenterte kilder`,
  `1. \`data/quiz/regler/QUIZ_PRODUCTION_CANONICAL.md\`\n2. \`data/quiz/regler/QUIZ_NORMAL_OPENING_POLICY_V1.json\`\n3. \`data/fag/fag_manifest.json\`\n4. filene manifestet krever for valgt kategori\n5. \`data/quiz/regler/QUIZ_QUESTION_SCHEMA_V2.json\`\n6. \`data/quiz/regler/QUIZ_PACKAGE_SCHEMA_V1.json\`\n7. stedets dokumenterte kilder`,
  'autoritetsrekkefølge'
);
standard = replaceOnce(
  standard,
  `8. Velg adaptiv profil fra kategoriens \`supersetQUIZMAL\`.\n9. Lag relativ settplan.\n10. Skriv spørsmål fra dokumenterte påstander og observasjoner.\n11. Lagre \`production_context\` i quizpakken.\n12. Kjør innholds-, kontekst-, progresjons- og teorikontroll.\n13. Generer eller synkroniser Knowledge-koblinger.`,
  `8. Velg adaptiv profil fra kategoriens \`supersetQUIZMAL\`.\n9. Lås de to første settene til sju normale spørsmål hver etter \`QUIZ_NORMAL_OPENING_POLICY_V1.json\`.\n10. Lag relativ settplan for progresjonen fra sett 3 og videre.\n11. Skriv spørsmål fra dokumenterte påstander og observasjoner.\n12. Lagre \`production_context\` i quizpakken.\n13. Kjør innholds-, kontekst-, progresjons- og teorikontroll.\n14. Generer eller synkroniser Knowledge-koblinger.`,
  'produksjonsrekkefølge'
);
standard = replaceOnce(
  standard,
  `Profilen velges ut fra dokumentert stoffmengde og faglig bredde, ikke ut fra ønsket lengde. En quiz skal aldri fylles med svake spørsmål for å treffe en profil. Hvis kildematerialet ikke bærer planen, skal profilen reduseres.`,
  `Profilen velges ut fra dokumentert stoffmengde og faglig bredde, ikke ut fra ønsket lengde. En quiz skal aldri fylles med svake spørsmål for å treffe en profil. Hvis kildematerialet ikke bærer planen, skal profilen reduseres.\n\nAlle profiler med minst to sett følger den samme absolutte åpningen: sett 1 og sett 2 skal hver ha sju normale, direkte og kildebelagte quizspørsmål. Kategoriens profil kan skjerpe denne regelen, for eksempel ved å utsette teori til sett 4, men kan aldri redusere de fjorten normale åpningsspørsmålene.`
);
standard = standard.replace(
  /## 7\. Relativ settprogresjon[\s\S]*?## 8\. Innholdsbalanse/u,
  `## 7. Absolutt normalåpning og relativ videre progresjon\n\n\`QUIZ_NORMAL_OPENING_POLICY_V1.json\` er en global invariant for alle aktive quizmål med minst to sett:\n\n- **sett 1:** sju normale spørsmål om sted, person, institusjon, funksjon, verk, art, hendelse eller andre direkte fakta\n- **sett 2:** sju normale spørsmål om historie, personer, bruk, endring, årsak, sammenheng, observasjon eller konkret sammenligning\n- spørsmålene skal kunne forstås uten kjennskap til fagplan, metode, hook, teoretiker eller produksjonsmodell\n- eksplisitt metode-, begreps- og teoribinding kan ikke drive de første fjorten spørsmålene\n- faglige klassifikasjonsfelt som \`emne_id\`, \`core_concepts\` og \`concept_focus\` kan ligge bak et normalt spørsmål, men må ikke gjøre spørsmålsflaten akademisk\n\nFra sett 3 er progresjonen relativ til quizens totale lengde:\n\n- **brodel:** årsak, sammenheng, metode og første fagbegreper\n- **sluttdel:** emner, teori, teoretikere, verk, sammenligning og syntese\n\nEn quiz med tre sett kan nå fag- og teorilaget i sett 3. En kategori kan kreve senere teoristart, men aldri tidligere enn sett 3. Den globale 2 × 7-åpningen går foran kategoriens relative faseplan.\n\n## 8. Innholdsbalanse`
);
standard = replaceOnce(
  standard,
  `Dette er et kvalitetsområde, ikke en grunn til å dikte eller gjenta stoff. En liten eller svært konkret quiz kan avvike når \`production_context\` forklarer hvorfor.`,
  `Dette er et kvalitetsområde, ikke en grunn til å dikte eller gjenta stoff. En liten eller svært konkret quiz kan avvike når \`production_context\` forklarer hvorfor. Den globale 2 × 7-åpningen har alltid forrang: en quiz med tre sett vil nødvendigvis være mer faktatung enn normalområdet, og skal ikke presses inn i prosentmålet med oppkonstruerte spørsmål.`
);
standard = replaceOnce(
  standard,
  `God rekkefølge:\n\n> dokumentert detalj → faglig problem → teori som skjerper forståelsen`,
  `God rekkefølge:\n\n> dokumentert detalj → faglig problem → teori som skjerper forståelsen\n\nTeori kan tidligst introduseres i sett 3. Kategoriens profil kan utsette teoristarten ytterligere, men kan ikke flytte teori eller eksplisitt metode inn i de første fjorten spørsmålene.`
);
standard = replaceOnce(
  standard,
  `Bruk naturlige åpninger som «Hvem», «Når», «Hva», «Hvorfor» og «Hvordan» når stoffet krever det.`,
  `Bruk naturlige åpninger som «Hvem», «Når», «Hva», «Hvor», «Hvilken», «Hvorfor» og «Hvordan» når stoffet krever det.\n\nI sett 1 og sett 2 skal spørsmålene oppleves som vanlig quiz. Direkte observasjoner, konkrete sammenligninger og enkle hvorfor-/hvordan-spørsmål er tillatt når svaret følger av dokumenterte opplysninger. Formuleringer som «Hvordan kan stedet leses som …?», «Hva er den mest presise faglige lesningen …?», «Hvilket begrep beskriver best …?», «Hvilken mekanisme forklarer best …?» og «Hvilken teoretiker …?» er forbudt i åpningsblokken.`
);
standard = replaceOnce(
  standard,
  `1. at manifestet resolver hele fagpakken\n2. at lagrede ID-er finnes i de resolverte fagfilene\n3. at valgt profil og settprogresjon stemmer\n4. at teorispørsmål er bundet til påstand, emne, hook og teori\n5. at spørsmålene følger innholdsbalanse, språk- og kildereglene`,
  `1. at manifestet resolver hele fagpakken\n2. at lagrede ID-er finnes i de resolverte fagfilene\n3. at sett 1 og sett 2 har nøyaktig sju normale spørsmål hver\n4. at åpningsspørsmålene har kilder, gyldig svar og plausible svaralternativer\n5. at valgt profil og videre settprogresjon stemmer\n6. at teorispørsmål er bundet til påstand, emne, hook og teori\n7. at spørsmålene følger innholdsbalanse, språk- og kildereglene`
);
if (standard.includes('Teori er aldri låst til absolutte settnumre.')) {
  throw new Error('Gammel relativ teoriregel står fortsatt i standarden');
}
fs.writeFileSync(STANDARD_PATH, standard);

const policy = readJson(POLICY_PATH);
policy.version = '1.1';
policy.scope = 'Alle aktive quizproduksjonsmål med minst to sett, uten målspesifikke unntak';
policy.exceptions_allowed = false;
policy.opening_block.metadata_rule = 'Klassifikasjonsmetadata som emne_id, related_emner, core_concepts og concept_focus kan ligge bak et normalt spørsmål. Eksplisitte metode- og teoribindinger i forbidden_binding_fields er fortsatt blokkert i de første fjorten spørsmålene.';
policy.opening_block.surface_rule = 'Det synlige spørsmålet skal være direkte, konkret og forståelig uten kjennskap til fagplan, metode, hook, teoretiker eller produksjonsmodell.';
for (const ruleId of ['mechanism_pick', 'distinction_pick', 'illustrates_place', 'what_place_shows']) {
  if (!policy.opening_block.forbidden_surface_rule_ids.includes(ruleId)) {
    policy.opening_block.forbidden_surface_rule_ids.push(ruleId);
  }
}
policy.progression.category_tightening_rule = 'Kategoriens profil kan utsette metode eller teori til et senere sett, men aldri starte før den globale grensen og aldri redusere 2 × 7-åpningen.';
policy.grandfathered_targets = {};
writeJson(POLICY_PATH, policy);

const registry = readJson(REGISTRY_PATH);
registry.version = '3.2';
registry.authority_order = [
  'data/quiz/regler/QUIZ_PRODUCTION_CANONICAL.md',
  'data/quiz/regler/QUIZ_NORMAL_OPENING_POLICY_V1.json',
  'data/fag/fag_manifest.json',
  'data/quiz/regler/QUIZ_QUESTION_SCHEMA_V2.json',
  'data/quiz/regler/QUIZ_PACKAGE_SCHEMA_V1.json',
  'category_profile'
];
registry.global_invariants.normal_opening.rule = 'Alle aktive quizmål skal starte med to sett à sju normale, direkte og kildebelagte quizspørsmål. Kategori-profiler kan skjerpe, men ikke svekke regelen; målspesifikke unntak er ikke tillatt.';
writeJson(REGISTRY_PATH, registry);

let progressionAudit = fs.readFileSync(PROGRESSION_AUDIT_PATH, 'utf8');
progressionAudit = replaceOnce(
  progressionAudit,
  `  ["more_than_place", /\\bhva gjør\\b.{0,55}\\bmer enn\\b|\\bkva gjer\\b.{0,55}\\bmeir enn\\b/iu]\n];`,
  `  ["more_than_place", /\\bhva gjør\\b.{0,55}\\bmer enn\\b|\\bkva gjer\\b.{0,55}\\bmeir enn\\b/iu],\n  ["mechanism_pick", /\\b(?:hvilken|kva) mekanisme\\b.{0,45}\\b(?:forklarer|forklarar|passer|høver)\\b/iu],\n  ["distinction_pick", /\\b(?:hvilken|kva) distinksjon\\b|\\bhvilket skille\\b.{0,35}\\b(?:er|passer|forklarer)\\b/iu],\n  ["illustrates_place", /\\bhvordan illustrerer\\b.{0,55}\\b(?:stedet|staden|bygningen|personen)\\b/iu],\n  ["what_place_shows", /\\bhva viser\\b.{0,55}\\b(?:stedet|staden|bygningen|personen)\\b.{0,35}\\bom\\b/iu]\n];`,
  'nye overflateregler'
);
progressionAudit = progressionAudit.replace(
  `  const grandfathered = openingPolicy.grandfathered_targets?.[targetId] || null;\n  if (grandfathered) {\n    return {\n      status: "grandfathered",\n      reason: grandfathered.reason || null,\n      temporary: grandfathered.temporary === true\n    };\n  }\n\n`,
  ''
);
progressionAudit = replaceOnce(
  progressionAudit,
  `  const enabledSurfaceRules = new Set(asArray(opening.forbidden_surface_rule_ids));`,
  `  if (!String(question?.question ?? "").trim()) problems.push("missing_question");\n  if (!asArray(question?.source).length) problems.push("missing_source");\n  const options = asArray(question?.options);\n  if (options.length < 3) problems.push("too_few_options");\n  if (!String(question?.answer ?? "").trim()) {\n    problems.push("missing_answer");\n  } else if (options.length && !options.includes(question.answer)) {\n    problems.push("answer_not_in_options");\n  }\n\n  const enabledSurfaceRules = new Set(asArray(opening.forbidden_surface_rule_ids));`,
  'kilde- og svarkontroll'
);
fs.writeFileSync(PROGRESSION_AUDIT_PATH, progressionAudit);

let templateAudit = fs.readFileSync(TEMPLATE_AUDIT_PATH, 'utf8');
templateAudit = replaceOnce(
  templateAudit,
  `let normalOpeningPolicy = null;`,
  `let normalOpeningPolicy = null;\nlet canonicalStandardText = null;`
);
templateAudit = replaceOnce(
  templateAudit,
  `try {\n  normalOpeningPolicy = await readJson(normalOpeningPolicyPath);\n} catch (error) {\n  failures.push({ file: normalOpeningPolicyPath, reason: \`invalid JSON: \${error.message}\` });\n}\n`,
  `try {\n  normalOpeningPolicy = await readJson(normalOpeningPolicyPath);\n} catch (error) {\n  failures.push({ file: normalOpeningPolicyPath, reason: \`invalid JSON: \${error.message}\` });\n}\n\ntry {\n  canonicalStandardText = await readFile(abs(standardPath), "utf8");\n} catch (error) {\n  failures.push({ file: standardPath, reason: \`could not read canonical standard: \${error.message}\` });\n}\n`
);
templateAudit = replaceOnce(
  templateAudit,
  `  if (normalOpeningPolicy.opening_block?.total_questions !== 14) {\n    failures.push({ file: normalOpeningPolicyPath, reason: "normal opening policy must require fourteen opening questions" });\n  }\n}`,
  `  if (normalOpeningPolicy.opening_block?.total_questions !== 14) {\n    failures.push({ file: normalOpeningPolicyPath, reason: "normal opening policy must require fourteen opening questions" });\n  }\n  if (normalOpeningPolicy.exceptions_allowed !== false) {\n    failures.push({ file: normalOpeningPolicyPath, reason: "normal opening policy must forbid target-specific exceptions" });\n  }\n  if (Object.keys(normalOpeningPolicy.grandfathered_targets || {}).length !== 0) {\n    failures.push({ file: normalOpeningPolicyPath, reason: "grandfathered normal-opening targets remain" });\n  }\n  if (!normalOpeningPolicy.opening_block?.surface_rule) {\n    failures.push({ file: normalOpeningPolicyPath, reason: "normal opening policy lacks an explicit visible-surface rule" });\n  }\n  for (const ruleId of ["mechanism_pick", "distinction_pick", "illustrates_place", "what_place_shows"]) {\n    if (!normalOpeningPolicy.opening_block?.forbidden_surface_rule_ids?.includes(ruleId)) {\n      failures.push({ file: normalOpeningPolicyPath, reason: \`missing forbidden opening surface rule: \${ruleId}\` });\n    }\n  }\n}`
);
templateAudit = replaceOnce(
  templateAudit,
  `if (manifest && registry) {`,
  `if (canonicalStandardText) {\n  const requiredStandardFragments = [\n    normalOpeningPolicyPath,\n    "sett 1 og sett 2",\n    "sju normale",\n    "fjorten normale",\n    "Kategoriens profil kan skjerpe",\n    "tidligst introduseres i sett 3"\n  ];\n  for (const fragment of requiredStandardFragments) {\n    if (!canonicalStandardText.includes(fragment)) {\n      failures.push({ file: standardPath, reason: \`canonical standard is not aligned with normal opening policy: missing \${fragment}\` });\n    }\n  }\n  if (canonicalStandardText.includes("Teori er aldri låst til absolutte settnumre")) {\n    failures.push({ file: standardPath, reason: "canonical standard retains obsolete fully relative theory rule" });\n  }\n}\n\nif (manifest && registry) {`
);
templateAudit = replaceOnce(
  templateAudit,
  `if (registry) {\n  const expectedCanonicalFiles = {`,
  `if (registry) {\n  const expectedAuthorityOrder = [\n    standardPath,\n    normalOpeningPolicyPath,\n    manifestPath,\n    schemaPath,\n    packageSchemaPath,\n    "category_profile"\n  ];\n  if (JSON.stringify(registry.authority_order) !== JSON.stringify(expectedAuthorityOrder)) {\n    failures.push({ file: registryPath, reason: "authority_order does not place the global opening policy directly after the production standard", expected: expectedAuthorityOrder, actual: registry.authority_order });\n  }\n\n  const expectedCanonicalFiles = {`
);
fs.writeFileSync(TEMPLATE_AUDIT_PATH, templateAudit);

const deichman = readJson(DEICHMAN_PATH);
const firstSet = deichman.sets?.[0];
const conceptQuestion = firstSet?.questions?.find((question) => question.quiz_id === 'by_deichman_bjorvika_set_1_q5');
if (!conceptQuestion) throw new Error('Fant ikke Deichman-spørsmålet som skal normaliseres');
conceptQuestion.question = 'Hva tilbyr Deichman som gjør biblioteket til et møtested for mange grupper?';
conceptQuestion.question_type = 'context';
conceptQuestion.claim_basis = 'Oslo kommune beskriver biblioteket som et gratis møtested med fellesressurser, arbeidsplasser og aktiviteter for mange grupper.';
conceptQuestion.source_origin = 'external';
writeJson(DEICHMAN_PATH, deichman);

fs.writeFileSync(REPORT_PATH, `# Global 2 × 7-normalåpning – samsvarskontroll\n\nDen øverste quizproduksjonsprosedyren, den globale åpningspolicyen, registryet og progresjonsauditen er samkjørt.\n\n- to sett à sju normale spørsmål er absolutt for alle aktive mål med minst to sett\n- målspesifikke unntak er fjernet\n- Deichman-spørsmålet om sosial infrastruktur er omskrevet til et direkte kontekstspørsmål\n- klassifikasjonsmetadata kan ligge bak normale spørsmål, mens eksplisitt metode- og teoribinding fortsatt er blokkert i åpningen\n- kategori-profiler kan utsette analyse og teori, men aldri svekke 2 × 7-regelen\n- progresjonsauditen kontrollerer kilde, spørsmål, svar, alternativer og forbudte akademiske overflater i de første fjorten spørsmålene\n`);

console.log('Samkjørte global quizstandard, 2 × 7-policy, registry, audits og Deichman-piloten.');
