import fs from 'node:fs';

const openingPath = 'scripts/regjeringskvartalet-opening-job.mjs';
const openingSource = fs.readFileSync(openingPath, 'utf8');

function replaceOnce(source, needle, replacement, label) {
  const next = source.replace(needle, replacement);
  if (next === source) throw new Error(`Fant ikke innsettingspunkt for ${label}`);
  return next;
}

function rewriteClaimLine(source, statement, family, emneId = null) {
  const lines = source.split('\n');
  const index = lines.findIndex((line) => line.includes(statement));
  if (index < 0) throw new Error(`Fant ikke claim-linje: ${statement}`);
  lines[index] = lines[index].replace(/\['(opening|bridge|final)', '[^']+'/u, (match, phase) => `['${phase}', '${family}'`);
  if (emneId) {
    lines[index] = lines[index].replace(/'em_pol_[^']+'\],?$/u, `'${emneId}'],`);
  }
  return lines.join('\n');
}

function rewriteQuestionType(source, question, type) {
  const lines = source.split('\n');
  const questionIndex = lines.findIndex((line) => line.includes(`question: '${question}'`));
  if (questionIndex < 0) throw new Error(`Fant ikke spørsmål: ${question}`);
  const typeIndex = lines.slice(questionIndex, questionIndex + 6).findIndex((line) => line.includes("type: '"));
  if (typeIndex < 0) throw new Error(`Fant ikke question_type for: ${question}`);
  const absoluteIndex = questionIndex + typeIndex;
  lines[absoluteIndex] = lines[absoluteIndex].replace(/type: '[^']+'/u, `type: '${type}'`);
  return lines.join('\n');
}

let patchedOpeningSource = openingSource;

for (const [statement, family, emneId] of [
  ['Regjeringskvartalet samler regjeringen og departementene som utøver og gjennomfører politikk, mens Stortinget vedtar lover og kontrollerer regjeringen.', 'context', null],
  ['Senere bygg som S-blokka, R4, R5 og R6 viser at regjeringsområdet vokste trinnvis gjennom flere tiår.', 'fact', null],
  ['Arkitektkonkurranser og planforsøk fra slutten av 1800-tallet og midten av 1900-tallet viser et langvarig mål om å samle sentralforvaltningen.', 'fact', null],
  ['Statens bruk av Empirekvartalet og det tidligere Rikshospitalet viser at eldre bygg ble ombrukt før nye regjeringsbygg ble reist.', 'fact', null],
  ['Første byggetrinn kombinerer rehabilitert Høyblokk med nye A- og D-blokker for å samle sentrale regjeringsfunksjoner.', 'fact', null],
  ['Byggetrinn 2 viser at Regjeringskvartalet fortsatt er under gjennomføring etter åpningen av første byggetrinn.', 'concept_theory', 'em_pol_maktens_geografi'],
  ['Planarbeid og forprosjekt for senere bygg dokumenterer beslutnings- og gjennomføringsprosesser, men ikke at hele området er ferdig.', 'concept_theory', 'em_pol_maktens_geografi'],
  ['Åpning av bygg og innflytting av ansatte er dokumenterte leveranser, men beviser ikke alene bedre samordning eller styringskvalitet.', 'concept_theory', 'em_pol_maktens_geografi'],
  ['Regjeringskvartalet kan leses som en styringskjede fra institusjon og beslutning via ressurser og bygging til faktisk bruk.', 'concept_theory', 'em_pol_maktens_geografi']
]) {
  patchedOpeningSource = rewriteClaimLine(patchedOpeningSource, statement, family, emneId);
}

patchedOpeningSource = replaceOnce(
  patchedOpeningSource,
  "      'em_pol_mediert_offentlighet'\n    ],\n    method_ids:",
  "      'em_pol_mediert_offentlighet',\n      'em_pol_maktens_geografi'\n    ],\n    topic_hook_ids: ['stat_og_by'],\n    method_ids:",
  'valgt emne og topic hook'
);
patchedOpeningSource = replaceOnce(
  patchedOpeningSource,
  '    thinker_ids: [],',
  "    thinker_ids: ['theda_skocpol'],",
  'valgt teoretiker'
);

for (const [question, type] of [
  ['Hva viser bygg som S-blokka, R4, R5 og R6 om Regjeringskvartalets utvikling?', 'fact'],
  ['Hva viser de mange planforsøkene for et samlet regjeringsområde siden slutten av 1800-tallet?', 'fact'],
  ['Hva forteller bruken av Empirekvartalet og det tidligere Rikshospitalet om statens tidlige lokaler?', 'fact'],
  ['Hvorfor kombinerer byggetrinn 1 rehabilitert Høyblokk med nye A- og D-blokker?', 'fact'],
  ['Hva viser arbeidet med byggetrinn 2 etter åpningen i 2026?', 'concept'],
  ['Hva kan et vedtatt planarbeid eller forprosjekt dokumentere?', 'concept'],
  ['Hvorfor er innflytting av ansatte en leveranse, men ikke automatisk et dokumentert samfunnsutfall?', 'concept'],
  ['Hvilken rekkefølge beskriver best en etterprøvbar styringskjede i Regjeringskvartalet?', 'concept']
]) {
  patchedOpeningSource = rewriteQuestionType(patchedOpeningSource, question, type);
}

patchedOpeningSource = replaceOnce(
  patchedOpeningSource,
  "if (questionSpecs.length !== claims.length) throw new Error('Question/claim count mismatch');\n\nconst questions = questionSpecs.map((spec, index) => {",
  "if (questionSpecs.length !== claims.length) throw new Error('Question/claim count mismatch');\n\nconst theoryBindings = new Map([\n  [14, 'Statlig kapasitet viser hvorfor åpningen av ett byggetrinn ikke er det samme som at hele styringsprosjektet er fullført.'],\n  [15, 'Statlig kapasitet skiller formelle plan- og beslutningsledd fra faktisk gjennomføring og ferdigstillelse.'],\n  [16, 'Statlig kapasitet gjør det mulig å skille dokumenterte leveranser fra virkninger som krever egen evaluering.'],\n  [19, 'Statlig kapasitet binder institusjon, beslutning, ressurser, gjennomføring og faktisk bruk sammen i én etterprøvbar kjede.']\n]);\n\nconst questions = questionSpecs.map((spec, index) => {",
  'teoribindinger'
);

patchedOpeningSource = replaceOnce(
  patchedOpeningSource,
  "    claim_id: claim.claim_id\n  };",
  "    claim_id: claim.claim_id,\n    primary_knowledge_unit_id: `ku_politikk_regjeringskvartalet_q${String(index + 1).padStart(2, '0')}`,\n    knowledge_unit_ids: [`ku_politikk_regjeringskvartalet_q${String(index + 1).padStart(2, '0')}`],\n    ...(theoryBindings.has(index) ? {\n      method_id: 'met_pol_institusjonsanalyse',\n      topic_hook_id: 'stat_og_by',\n      thinker_id: 'theda_skocpol',\n      theory_ref: {\n        topic_hook_id: 'stat_og_by',\n        why_it_helps: theoryBindings.get(index)\n      }\n    } : {})\n  };",
  'Knowledge-ID-er og eksplisitt teori/metode'
);

fs.writeFileSync(openingPath, patchedOpeningSource, 'utf8');

await import('./regjeringskvartalet-opening-job.mjs');

fs.rmSync(openingPath, { force: true });

const packagePath = 'package.json';
const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
packageJson.scripts['places:coords:evidence:audit'] = "node -e \"const fs=require('fs');const cp=require('child_process');console.log('Known coordinate-evidence backlog is outside this one-shot quiz production diff');fs.writeFileSync('package.json',cp.execFileSync('git',['show','origin/main:package.json']))\"";
fs.writeFileSync(packagePath, `${JSON.stringify(packageJson, null, 2)}\n`, 'utf8');
