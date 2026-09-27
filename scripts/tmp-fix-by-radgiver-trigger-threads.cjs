#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const ROOT = path.resolve(__dirname, '..');
const TARGET = path.join(ROOT, 'data/Civication/mailFamilies/by/people/by_radgiver_plan_people.json');
const data = JSON.parse(fs.readFileSync(TARGET, 'utf8'));
const family = (data.families || []).find((row) => row.id === 'aktorer_og_press');
assert(family, 'missing aktorer_og_press family');

const ACK = () => ({
  id: 'A',
  label: 'Lest',
  effect: 0,
  tags: ['consequence'],
  feedback: 'Konsekvensen er registrert i Lillebekk-sakens videre spor.'
});

const specs = [
  {
    sourceId: 'by_areal_people_plansjef_004',
    A: {
      id: 'by_areal_people_plansjef_004_presisjon',
      subject: 'Møteversjonen holder risikoen synlig',
      summary: 'Elin bruker den korte møteversjonen uten å miste grøntdraget og skoleveien av syne; forenklingen gjør saken mer lesbar uten å skjule faglig risiko.',
      situation: [
        'Elin har brukt møteversjonen i forberedelsen og sier at den var kort nok til å fungere, men presis nok til at grøntdraget og skoleveien fortsatt ble behandlet som reelle premisser.',
        'Det gjør at neste diskusjon kan handle om prioritering i stedet for å oppdage skjult risiko på nytt.'
      ]
    },
    B: {
      id: 'by_areal_people_plansjef_004_tempo_risiko',
      subject: 'Forbeholdene kommer tilbake som nye spørsmål',
      summary: 'Den raske møteversjonen kom fram i tide, men de utsatte faglige forbeholdene blir nå spørsmål ledelsen må rydde i før saken kan gå videre.',
      situation: [
        'Elin fikk et brukbart dokument raskt, men møtet avdekket at grøntdrag og skolevei var for svakt forklart til at ansvarsbildet ble klart.',
        'Det som ble spart i tid før møtet kommer tilbake som omarbeiding og behov for en ny faglig avklaring.'
      ]
    }
  },
  {
    sourceId: 'by_areal_people_skolevei_005',
    A: {
      id: 'by_areal_people_skolevei_005_presisjon',
      subject: 'Den faktiske skoleveien er nå en del av grunnlaget',
      summary: 'Barnas faktiske rute er lagt inn i kartgrunnlaget og saksnotatet, slik at trafikksikkerheten kan vurderes mot den veien som faktisk brukes.',
      situation: [
        'Tariq bekrefter at snarveien bak parkeringskjelleren nå er synlig i materialet som prosjektet og kommunen arbeider videre med.',
        'Avviket mellom plankartets antakelse og faktisk bruk kan dermed testes og dokumenteres før planvalget låses.'
      ]
    },
    B: {
      id: 'by_areal_people_skolevei_005_tempo_risiko',
      subject: 'Den midlertidige skoleveiavklaringen holder ikke alene',
      summary: 'Den praktiske avklaringen dempet trykket, men forskjellen mellom formelt kartgrunnlag og barnas faktiske rute dukker opp igjen før saken kan ferdigstilles.',
      situation: [
        'Tariq melder at den midlertidige løsningen fungerer i hverdagen, men at plankartet fortsatt beskriver en annen bevegelse enn den barn faktisk bruker.',
        'Uten en oppdatering av grunnlaget risikerer neste vurdering å bygge videre på samme feil premiss.'
      ]
    }
  },
  {
    sourceId: 'by_areal_people_juridisk_006',
    A: {
      id: 'by_areal_people_juridisk_006_presisjon',
      subject: 'Rekkefølgekravet kan faktisk håndheves',
      summary: 'Nora bekrefter at det strammere rekkefølgekravet gjør grøntdrag og skolevei til gjennomførbare plikter i stedet for bare gode intensjoner.',
      situation: [
        'Den nye formuleringen knytter gjennomføringstidspunkt og krav tydelig nok sammen til at forholdet kan følges opp når byggesaken kommer.',
        'Saken mister litt fleksibilitet nå, men vinner juridisk presisjon og et etterprøvbart ansvar senere.'
      ]
    },
    B: {
      id: 'by_areal_people_juridisk_006_tempo_risiko',
      subject: 'Intensjonen mangler fortsatt håndhevbarhet',
      summary: 'Nora varsler at teksten fortsatt uttrykker ønsket resultat uten å sikre når eller hvordan grøntdrag og skolevei faktisk må være løst.',
      situation: [
        'Framdriften ble beholdt, men den åpne formuleringen flytter risikoen til gjennomføringsfasen der kommunen har mindre rom til å korrigere.',
        'Et senere prosjekt kan derfor oppfylle ordlyden uten å levere den virkningen saksframstillingen lover.'
      ]
    }
  },
  {
    sourceId: 'by_areal_people_politisk_007',
    A: {
      id: 'by_areal_people_politisk_007_presisjon',
      subject: 'Utvalget ser hva som er fag og hva som er politikk',
      summary: 'Maja bekrefter at saksframlegget nå skiller dokumentert faglig risiko fra de prioriteringene politikerne faktisk skal eie.',
      situation: [
        'Utvalget får et kort beslutningsgrunnlag der usikkerhet og konsekvens er synlig uten at administrasjonen gjør den politiske avveiingen på forhånd.',
        'Ansvarsdelingen blir dermed lettere å etterprøve både under møtet og i den senere protokollen.'
      ]
    },
    B: {
      id: 'by_areal_people_politisk_007_tempo_risiko',
      subject: 'Forenklingen gjør ansvarslinjen uklar',
      summary: 'Den korte teksten er lett å lese, men Maja får nye spørsmål om hvilke konsekvenser som er faglige premisser og hvilke valg utvalget selv må stå for.',
      situation: [
        'Flere formuleringer kan leses som om administrasjonen allerede har valgt mellom politiske alternativer, selv om hensikten bare var å komprimere saken.',
        'Før behandling må ansvaret derfor skrives tydeligere fram for å unngå at risiko og prioritering blandes sammen.'
      ]
    }
  },
  {
    sourceId: 'by_areal_people_arkitekt_008',
    A: {
      id: 'by_areal_people_arkitekt_008_presisjon',
      subject: 'Høydeillustrasjonen tåler den faglige kontrollen',
      summary: 'Kontrollen mot grøntdrag, skolevei, støy og overvann viser hvilke forutsetninger illustrasjonen bygger på, slik at den kan brukes uten å framstå som et ferdig svar.',
      situation: [
        'Petter får tilbake en tydelig liste over hvilke deler av illustrasjonen som holder og hvilke premisser som må merkes før den deles videre.',
        'Bildet kan dermed brukes som kommunikasjon uten at det alene låser forventningen til planens endelige løsning.'
      ]
    },
    B: {
      id: 'by_areal_people_arkitekt_008_tempo_risiko',
      subject: 'Illustrasjonen har allerede begynt å låse forventninger',
      summary: 'Den raske delingen gjør høydebildet til et uformelt løfte før konsekvensene for grøntdrag, skolevei, støy og overvann er kontrollert.',
      situation: [
        'Petter melder at illustrasjonen allerede sirkulerer som om den viser den sannsynlige løsningen, selv om flere faglige avveininger fortsatt er åpne.',
        'Neste runde må derfor både korrigere forventninger og forklare hvilke premisser bildet ikke viste.'
      ]
    }
  }
];

const existingThreads = new Map((family.threads || []).map((thread) => [thread.id, thread]));
const expectedIds = new Set();

for (const spec of specs) {
  const mail = (family.mails || []).find((row) => row.id === spec.sourceId);
  assert(mail, `missing source mail ${spec.sourceId}`);
  assert(mail.triggers_on_choice && typeof mail.triggers_on_choice === 'object' && !Array.isArray(mail.triggers_on_choice), `${spec.sourceId}: missing trigger map`);
  const choices = new Map((mail.choices || []).map((choice) => [choice.id, choice]));

  for (const choiceId of ['A', 'B']) {
    const outcome = spec[choiceId];
    const mapped = mail.triggers_on_choice[choiceId];
    assert.deepEqual(mapped, [outcome.id], `${spec.sourceId}/${choiceId}: unexpected trigger map`);
    const choice = choices.get(choiceId);
    assert(choice, `${spec.sourceId}: missing choice ${choiceId}`);
    choice.triggers_on_choice = outcome.id;
    expectedIds.add(outcome.id);

    const inheritedChannel = mail.channel || mail.messageChannel || 'job';
    const thread = {
      id: outcome.id,
      mail_type: 'people',
      mail_family: 'aktorer_og_press',
      role_scope: 'by_radgiver_plan',
      phase: mail.phase || 'stable',
      priority: Math.max(1, Number(mail.priority || 60) - (choiceId === 'A' ? 1 : 2)),
      cooldown: 0,
      repeatable: false,
      stage: 'stable',
      from: mail.from,
      sender: mail.sender || mail.from,
      person_id: mail.person_id,
      place_id: mail.place_id,
      channel: inheritedChannel,
      messageChannel: inheritedChannel,
      mail_class: inheritedChannel === 'private' ? 'private_message' : 'job_message',
      subject: outcome.subject,
      summary: outcome.summary,
      situation: outcome.situation,
      choices: [ACK()]
    };

    const previous = existingThreads.get(outcome.id);
    if (previous) {
      assert.deepEqual(previous, thread, `${outcome.id}: conflicting existing thread`);
    } else {
      existingThreads.set(outcome.id, thread);
    }
  }
}

for (const id of expectedIds) assert(existingThreads.has(id), `failed to materialize ${id}`);
family.threads = [...existingThreads.values()];

fs.writeFileSync(TARGET, `${JSON.stringify(data, null, 2)}\n`);
console.log(`materialized ${expectedIds.size} By-rådgiver trigger threads`);
