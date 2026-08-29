#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MODEL_PATH = 'data/Civication/roleModels/naeringsliv/okonomi_og_administrasjonsmedarbeider.json';
const PEOPLE_PATH = 'data/Civication/mailFamilies/naeringsliv/people/administrasjonsmedarbeider_people.json';
const REPORT_PATH = 'reports/CIVICATION_NAERINGSLIV_ADMINISTRASJONSMEDARBEIDER_PREREQUISITES.md';
const FAMILY_ID = 'administrasjonsmedarbeider_profesjonelle_arbeidsrelasjoner';

const read = (rel) => JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));
const write = (rel, value) => fs.writeFileSync(path.join(ROOT, rel), `${JSON.stringify(value, null, 2)}\n`);

const actors = [
  {
    id: 'nora_administrasjonskoordinator',
    name: 'Nora',
    role: 'Administrasjonskoordinator',
    function: 'Fordeler og avklarer administrativt prosessarbeid, følger frister og krever synlige overleveringer uten å gjøre koordinering til økonomisk godkjenningsmyndighet.',
    authority_relation: 'Kan fordele og følge opp administrativt arbeid innen faktisk mandat; kan ikke gi spilleren godkjenningsfullmakt eller overta andre fagrollers beslutninger.',
    fictional_scenario_actor: true,
    canonical_person_ref: null
  },
  {
    id: 'marius_regnskapsmedarbeider_admin',
    name: 'Marius',
    role: 'Regnskapsmedarbeider',
    function: 'Eier regnskapsnære avklaringer og dokumentasjonskrav i sitt fagspor og gir spilleren grunnlag for korrekt registrering uten å overføre godkjenningsmyndighet.',
    authority_relation: 'Kan avklare regnskapsmessig dokumentasjonsbehov og be om sporbar oppfølging; kan ikke gjøre manglende underlag til godkjent fakta.',
    fictional_scenario_actor: true,
    canonical_person_ref: null
  },
  {
    id: 'lea_innkjopskoordinator_admin',
    name: 'Lea',
    role: 'Innkjøpskoordinator',
    function: 'Avklarer bestilling, leverandørspor og innkjøpsgrunnlag når administrative saker mangler referanse eller eier, men eier ikke spillerens registrering eller økonomisk godkjenning.',
    authority_relation: 'Kan dokumentere bestillingsgrunnlag og innkjøpsspor; kan ikke godkjenne utbetaling eller instruere spilleren til å skjule et avvik.',
    fictional_scenario_actor: true,
    canonical_person_ref: null
  },
  {
    id: 'eirik_driftskontakt_admin',
    name: 'Eirik',
    role: 'Driftskontakt',
    function: 'Leverer operativ kontekst, faktisk eier og tidskritiske avklaringer fra driften slik at administrasjonen ikke fyller hull med antakelser.',
    authority_relation: 'Kan bekrefte operative fakta og ansvar i driften; kan ikke bestemme regnskapsklassifisering eller gi spilleren formell godkjenningsmyndighet.',
    fictional_scenario_actor: true,
    canonical_person_ref: null
  }
];

const choice = (id, label, reply, feedback, stats, flags) => ({
  id,
  label,
  reply,
  effects: stats,
  next_bias: { set_flags: flags },
  triggers_on_choice: flags[0],
  feedback
});

const professionalMail = ({ id, actor, actorName, placeId, subject, summary, situation, choices }) => ({
  id,
  actor_id: actor,
  from: actorName,
  sender: actorName,
  person_id: actor,
  people_ref: actor,
  place_id: placeId,
  mail_type: 'people',
  mail_family: FAMILY_ID,
  role_scope: 'administrasjonsmedarbeider',
  channel: 'work',
  messageChannel: 'work',
  mail_class: 'professional_message',
  phase: 'mid',
  priority: 75,
  cooldown: 0,
  repeatable: false,
  stage: 'stable',
  subject,
  summary,
  situation,
  choices
});

const professionalMails = [
  professionalMail({
    id: 'administrasjonsmedarbeider_people_nora_handoff_001',
    actor: 'nora_administrasjonskoordinator',
    actorName: 'Nora',
    placeId: 'frist_og_oppfolgingsbord',
    subject: 'Nora vil ha et tydelig eierskap før fristen',
    summary: 'En åpen sak har frist i dag, men mangler fortsatt tydelig eier. Nora ber deg gjøre overleveringen sporbar uten å late som koordinering gir deg rett til å ta beslutningen selv.',
    situation: [
      'Nora sender status på en sak som har flyttet seg mellom innboks, drift og økonomi. Fristen er synlig, men det er fortsatt uklart hvem som eier den siste faglige avklaringen.',
      'Hun ber deg samle dokumentert grunnlag, navngi hvem dere venter på og skrive neste steg slik at saken ikke blir stående som «nesten ferdig» i systemet.',
      'Det raskeste ville være å fylle inn en sannsynlig eier og lukke din del. Det mest sporbare er å holde saken åpen til faktisk ansvar er bekreftet.'
    ],
    choices: [
      choice('A', 'Gjør manglende eier eksplisitt og send sporbar handoff.', 'Jeg markerer saken som åpen, skriver hvem vi venter på og hva som mangler før neste steg.', 'Du beskytter fristen uten å skjule usikkerheten. Nora kan følge opp prosessen, mens beslutningsansvaret blir liggende hos riktig eier.', { trust: 2, documentation_quality: 2, risk: -1, stress: 1 }, ['admin_people_nora_traceable_handoff']),
      choice('B', 'Sett en sannsynlig eier for å få saken ut av køen.', 'Jeg setter den mest sannsynlige eieren og lukker min del så lenge resten ser riktig ut.', 'Køen blir penere, men du har gjort en antakelse til systemfakta. Nora får mindre synlig støy og organisasjonen får svakere sporbarhet.', { control: 2, documentation_quality: -2, risk: 2, trust: -1 }, ['admin_people_nora_assumed_owner'])
    ]
  }),
  professionalMail({
    id: 'administrasjonsmedarbeider_people_marius_documentation_001',
    actor: 'marius_regnskapsmedarbeider_admin',
    actorName: 'Marius',
    placeId: 'registrerings_og_kontrollflate',
    subject: 'Marius mangler dokumentasjonen bak registreringen',
    summary: 'Marius finner en registrering som ser plausibel ut, men underlaget er ikke godt nok til å etterprøve den. Dere må skille mellom praktisk sannsynlighet og dokumentert økonomisk grunnlag.',
    situation: [
      'Marius peker på en post der beløp og kategori ser rimelige ut, men vedlegget som forklarer formålet mangler. Han kan ikke rekonstruere grunnlaget fra systemteksten alene.',
      'Du har en muntlig forklaring fra tidligere i dagen, men ingen kilde som gjør forklaringen etterprøvbar for den som kommer etter dere.',
      'Marius ber deg velge mellom å hente dokumentasjonen nå eller la posten stå åpen med tydelig mangel og ansvarlig oppfølging.'
    ],
    choices: [
      choice('A', 'Hold posten åpen og be om dokumentert grunnlag.', 'Jeg lar posten stå åpen og registrerer nøyaktig hvilket underlag som mangler og hvem som skal skaffe det.', 'Marius kan følge sporet uten å stole på hukommelse eller muntlig kontekst. Du gjør usikkerheten synlig i stedet for å kamuflere den som ferdig arbeid.', { documentation_quality: 3, trust: 2, risk: -2, control: -1 }, ['admin_people_marius_documented_basis']),
      choice('B', 'Bruk den muntlige forklaringen og gå videre.', 'Jeg registrerer ut fra forklaringen vi allerede har og rydder dokumentasjonen hvis noen spør senere.', 'Arbeidet går raskere, men dere mister skillet mellom det dere vet og det dere antar. Marius må senere revidere en beslutning som nå ser mer sikker ut enn den er.', { control: 2, documentation_quality: -3, risk: 2, trust: -1 }, ['admin_people_marius_oral_basis'])
    ]
  }),
  professionalMail({
    id: 'administrasjonsmedarbeider_people_lea_purchase_001',
    actor: 'lea_innkjopskoordinator_admin',
    actorName: 'Lea',
    placeId: 'arkiv_og_versjonsflate',
    subject: 'Lea finner bestillingen, men referansen er feil',
    summary: 'Lea kan dokumentere hvilken bestilling leverandørfakturaen gjelder, men systemreferansen peker på feil spor. Oppgaven er å korrigere koblingen uten å omskrive historikken eller late som feilen aldri fantes.',
    situation: [
      'Lea finner bestillingen i innkjøpssporet og bekrefter at varen faktisk er bestilt. Samtidig ser dere at referansen i administrasjonssystemet peker på et annet dokument.',
      'Du kan rette feltet raskt, men da må endringen fortsatt være sporbar slik at senere kontroll kan se hva som var feil og hvorfor koblingen ble endret.',
      'Lea eier bestillingsgrunnlaget. Du eier den administrative registreringen. Ingen av dere bør gjøre den andres ansvar usynlig.'
    ],
    choices: [
      choice('A', 'Korriger referansen med sporbar endringsforklaring.', 'Jeg kobler til riktig bestilling, beholder spor etter den gamle referansen og noterer Leas dokumenterte avklaring.', 'Du bruker Leas faglige grunnlag uten å overta hennes ansvar. Endringen blir forståelig for neste person og revisjonssporet forblir intakt.', { documentation_quality: 3, trust: 2, risk: -2, learning: 1 }, ['admin_people_lea_traceable_correction']),
      choice('B', 'Bytt referansen uten å dokumentere den gamle feilen.', 'Jeg retter feltet til riktig bestilling og lar systemet vise den ryddige sluttstatusen.', 'Sluttstatusen ser riktig ut, men organisasjonen mister kunnskap om hvordan feilen oppstod. Neste lignende avvik blir vanskeligere å forstå og kontrollere.', { control: 2, documentation_quality: -2, risk: 1, learning: -1 }, ['admin_people_lea_silent_correction'])
    ]
  }),
  professionalMail({
    id: 'administrasjonsmedarbeider_people_eirik_drift_001',
    actor: 'eirik_driftskontakt_admin',
    actorName: 'Eirik',
    placeId: 'innboks_og_mottaksflate',
    subject: 'Eirik kan forklare driften, men ikke godkjenne tallene',
    summary: 'Eirik gir den operative forklaringen på et avvik og vet hvem som faktisk eier neste handling. Du må bruke konteksten uten å gjøre driftsforklaringen til en økonomisk godkjenning den ikke er.',
    situation: [
      'Eirik forklarer at avviket kommer fra en utsatt leveranse og en midlertidig driftsløsning. Forklaringen gjør hendelsesforløpet forståelig, men han har ikke mandat til å godkjenne økonomisk klassifisering.',
      'Han gir deg navn på faktisk operativ eier og tidspunkt for neste bekreftelse. Det er nok til å gjøre oppfølgingen presis, men ikke nok til å lukke alle faglige spørsmål.',
      'Du må skille mellom nyttig kontekst, dokumentert fakta og den godkjenningen som fortsatt må komme fra riktig rolle.'
    ],
    choices: [
      choice('A', 'Registrer driftskonteksten og behold riktig godkjenningspunkt åpent.', 'Jeg dokumenterer Eiriks forklaring, setter faktisk eier og lar den formelle avklaringen stå åpen hos riktig rolle.', 'Du får bedre kontekst uten å gjøre Eirik til godkjenner. Arbeidet blir både raskere å følge og tydeligere på hvem som fortsatt må beslutte.', { trust: 2, documentation_quality: 2, risk: -2, autonomy: 1 }, ['admin_people_eirik_bounded_context']),
      choice('B', 'Bruk Eiriks forklaring som tilstrekkelig godkjenning.', 'Jeg lukker saken fordi driften har forklart hva som skjedde og neste steg virker opplagt.', 'Du forveksler forklaring med myndighet. Saken blir lukket raskt, men sporbarheten bryter akkurat der organisasjonen trenger å se hvem som faktisk kunne godkjenne.', { control: 2, risk: 3, trust: -2, documentation_quality: -2 }, ['admin_people_eirik_context_as_approval'])
    ]
  })
];

const model = read(MODEL_PATH);
model.related_people = actors;
write(MODEL_PATH, model);

const catalog = read(PEOPLE_PATH);
catalog.families = (catalog.families || []).filter((family) => family.id !== FAMILY_ID);
catalog.families.push({
  id: FAMILY_ID,
  description: 'Profesjonelle arbeidsrelasjoner for Administrasjonsmedarbeider: handoff, dokumentasjon, innkjøpsgrunnlag og driftskontekst med eksplisitte fag- og myndighetsgrenser.',
  learning_focus: ['sporbar handoff', 'dokumentasjonsgrunnlag', 'faggrense', 'ansvar og myndighet'],
  fictional_scenario_actors: actors.map((actor) => actor.id),
  mails: professionalMails
});
write(PEOPLE_PATH, catalog);

fs.writeFileSync(path.join(ROOT, REPORT_PATH), `# Administrasjonsmedarbeider readiness prerequisites\n\n- Scope: prerequisite only; no Role World completion.\n- Professional fictional scenario actors: ${actors.length}.\n- Professional People scenes: ${professionalMails.length}.\n- Existing 20-step practice plan: unchanged by materializer.\n- Actor linkage uses canonical People fields (person_id/people_ref) and existing role-owned workplace surfaces (place_id); persistent work_context is intentionally absent because these scenes do not create work objects.\n- Target after regeneration: career People complete, Places complete, runtime gate true, rollout_ready with situated_reputation as the only remaining authored rollout debt.\n- Cross-role runtime: not materialized.\n`);

console.log(`Materialized Administrasjonsmedarbeider prerequisites: ${actors.length} actors / ${professionalMails.length} professional people scenes`);
