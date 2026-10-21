// Fagverk Politikk: a source-bound comparison workshop, not another quiz or mastery system.
(function installPolitikkEvidenceWorkshop(global) {
  'use strict';

  const PACKAGE_URL = 'data/quiz/politikk/politikk_subject_pathways_v1.json';
  const POLAND_SET = 'pathway_politikk_demokratisk_tilbakegang_polen_2023';
  const COMPARE_SET = 'pathway_politikk_valgintegritet_ungarn_2022_polen_2023';
  const STEPS = Object.freeze([
    {
      id: 'belegg', label: '1. Velg sammenlignbart belegg',
      prompt: 'Hvilket utsagn kan brukes som felles belegg fra de to valgene?',
      questionIndex: 3,
      options: [
        ['Begge valg hadde nøyaktig samme årsaker og institusjonelle problemer.', false, 'Observatørene beskrev ulike land og mandater. Likheter gir ikke identiske årsaksforklaringer.'],
        ['Begge valg hadde politisk konkurranse samtidig som konkurransevilkårene var skjeve.', true, 'Dette er den avgrensede likheten som er dokumentert i begge rapportene.'],
        ['Begge stemmeopptellingene er dokumentert manipulert.', false, 'Kildene gir ikke belegg for denne påstanden om opptellingen.']
      ]
    },
    {
      id: 'mekanisme', label: '2. Foreslå en mekanisme',
      prompt: 'Hva kan observasjonene av Ungarns valgkamp brukes til å forklare?',
      questionIndex: 1,
      options: [
        ['Nøyaktig hvor mange mandater regjeringskommunikasjonen avgjorde.', false, 'Ingen av de kontrollerte observasjonene beregner en slik årsakseffekt.'],
        ['Hvordan sammenblanding av stat og parti kan gi konkurransefordeler.', true, 'Dette er en mulig institusjonell mekanisme, ikke et tallfestet mål på stemmeeffekt.'],
        ['At alle mediene og velgerne støttet regjeringspartiet.', false, 'Partisk dekning er ikke bevis for universell mediestøtte eller velgerstøtte.']
      ]
    },
    {
      id: 'avgrensning', label: '3. Avgrens konklusjonen',
      prompt: 'Hva kan vi slutte fra ODIHRs reformanbefalinger?',
      questionIndex: 4,
      options: [
        ['Reformene ble innført og fikk dokumentert virkning i begge land.', false, 'Anbefalinger viser ikke at tiltak senere ble innført eller hadde effekt.'],
        ['Rapportene peker på tiltak som kan undersøkes videre mot de observerte problemene.', true, 'Dette skiller en begrunnet anbefaling fra dokumentasjon på etterfølgende endring.'],
        ['Begge land hadde ingen reelle alternative partier ved valgene.', false, 'Valgobservatørene beskrev konkurranse og reelle alternativer.']
      ]
    }
  ]);

  function element(tag, className, value) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (value != null) node.textContent = String(value);
    return node;
  }

  function sourceLinks(question) {
    const list = element('p', 'politikk-evidence-sources');
    list.append('Originalkilder: ');
    const used = new Set();
    for (const source of question.source || []) {
      if (!/^https:\/\/odihr\.osce\.org\//.test(source.url || '') || used.has(source.url)) continue;
      if (used.size) list.append(' · ');
      const a = element('a', '', source.publisher_or_author || source.title || 'OSSE/ODIHR');
      a.href = source.url;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      list.append(a);
      used.add(source.url);
    }
    return list;
  }

  function safeSet(pack, id) {
    return pack?.subject_id === 'politikk' && pack?.status === 'pilot_active'
      ? pack.sets?.find((set) => set.set_id === id && set.questions?.length === 5)
      : null;
  }

  function render(host, pack) {
    const comparison = safeSet(pack, COMPARE_SET);
    const poland = safeSet(pack, POLAND_SET);
    if (!comparison || !poland) throw new Error('Mangler kanoniske kildepakker for sammenligningen.');
    host.replaceChildren();

    const heading = element('h5', '', 'Bygg en sammenligning med kildebelegg');
    const intro = element('p', '', 'Les de to valgobservasjonene. Velg deretter belegg, mekanisme og grense for hva vi kan slutte. Forklar til slutt vurderingen med egne ord.');
    const matrix = element('div', 'politikk-evidence-matrix');
    [
      { country: 'Ungarn 2022', question: comparison.questions[0] },
      { country: 'Polen 2023', question: poland.questions[0] }
    ].forEach(({ country, question }) => {
      const card = element('article', 'politikk-evidence-case');
      card.append(
        element('h6', '', country),
        element('p', '', question.knowledge_payload.summary),
        sourceLinks(question)
      );
      matrix.append(card);
    });
    const progress = element('p', 'politikk-evidence-progress');
    progress.setAttribute('aria-live', 'polite');
    const answers = Array(STEPS.length).fill(null);
    const sections = [];

    const assembly = element('section', 'politikk-evidence-assembly');
    assembly.hidden = true;
    assembly.append(element('h6', '', 'Din kildebundne vurdering'));
    const instructions = element('p', '', 'Skriv minst én begrunnelse med egne ord: Hva er likt, hva er forskjellig, og hva kan ikke kildene bevise? Teksten vurderes ikke automatisk og lagres ikke som mestring.');
    const note = element('textarea', 'politikk-evidence-note');
    note.id = 'politikkEvidenceOwnReasoning';
    note.rows = 4;
    note.placeholder = 'Jeg sammenligner ... Kildene viser ... Men vi vet ikke ...';
    const label = element('label', 'politikk-evidence-note-label', 'Din egen kildevurdering');
    label.htmlFor = note.id;
    const show = element('button', '', 'Vis min argumentrekke');
    show.type = 'button';
    const response = element('p', 'politikk-evidence-compose-status');
    response.setAttribute('role', 'status');
    const report = element('div', 'politikk-evidence-report');
    report.id = 'politikkEvidenceReport';
    report.hidden = true;

    show.addEventListener('click', () => {
      const own = note.value.trim();
      if (own.length < 20) {
        response.textContent = 'Skriv en kort selvstendig begrunnelse før du viser argumentrekken.';
        report.hidden = true;
        note.focus();
        return;
      }
      response.textContent = 'Argumentrekken er samlet. Det er fortsatt din jobb å vurdere om begrunnelsen holder.';
      report.replaceChildren(element('h6', '', 'Påstand, belegg og forbehold'));
      STEPS.forEach((step, index) => {
        const q = comparison.questions[step.questionIndex];
        report.append(element('p', '', step.label + ': ' + step.options[answers[index]][0]));
        report.append(sourceLinks(q));
      });
      report.append(element('p', '', 'Din begrunnelse: ' + own));
      report.append(element('p', '', 'Metodegrense: Valgobservasjonene dokumenterer ikke en identisk årsakskjede, nøyaktig stemmeeffekt eller senere reformvirkning.'));
      report.hidden = false;
    });

    function refresh() {
      const correct = answers.filter((choice, index) => choice != null && STEPS[index].options[choice][1]).length;
      progress.textContent = correct + ' av ' + STEPS.length + ' kildebegrunnede valg. Dette er en øvelse, ikke automatisk faglig mestring.';
      assembly.hidden = correct !== STEPS.length;
      if (correct !== STEPS.length) report.hidden = true;
    }

    for (const [index, step] of STEPS.entries()) {
      const section = element('section', 'politikk-evidence-step');
      section.dataset.step = step.id;
      const q = comparison.questions[step.questionIndex];
      section.append(
        element('h6', '', step.label),
        element('p', '', step.prompt),
        element('p', 'politikk-evidence-excerpt', q.knowledge_payload.summary),
        sourceLinks(q)
      );
      const choices = element('div', 'politikk-evidence-options');
      const feedback = element('p', 'politikk-evidence-feedback');
      feedback.setAttribute('role', 'status');
      step.options.forEach(([text, supported, explanation], optionIndex) => {
        const button = element('button', '', text);
        button.type = 'button';
        button.dataset.option = String(optionIndex);
        button.setAttribute('aria-pressed', 'false');
        button.addEventListener('click', () => {
          answers[index] = optionIndex;
          choices.querySelectorAll('button').forEach((b) =>
            b.setAttribute('aria-pressed', String(b === button)));
          feedback.textContent = (supported ? 'Støttet av kildene: ' : 'Ikke tilstrekkelig belagt: ') + explanation;
          refresh();
        });
        choices.append(button);
      });
      section.append(choices, feedback);
      sections.push(section);
    }

    assembly.append(instructions, label, note, show, response, report);
    host.append(heading, intro, matrix, progress, ...sections, assembly);
    refresh();
  }

  async function start(host) {
    if (!host) return false;
    host.hidden = false;
    host.replaceChildren(element('p', '', 'Henter kildebelegg fra den eksisterende Politikk-pakken …'));
    try {
      const response = await global.fetch(PACKAGE_URL);
      if (!response.ok) throw new Error('Kildepakken er ikke tilgjengelig.');
      render(host, await response.json());
      return true;
    } catch (error) {
      host.replaceChildren(element('p', '', 'Kunne ikke åpne bevisverkstedet. Prøv igjen senere.'));
      global.console?.warn?.('Politikk evidence workshop', error);
      return false;
    }
  }

  global.HGPolitikkEvidenceWorkshop = Object.freeze({ start });
})(window);
