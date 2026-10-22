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

  // Pedagogiske vurderingskriterier, ikke en automatisk analyse av fritekst.
  const SELF_REVIEW = Object.freeze([
    {
      id: 'belegg',
      heading: 'Kildebelegg',
      question: 'Har jeg knyttet en konkret observasjon til begge land og oppgitt hvilken kilde som støtter den?',
      example: 'Et presist belegg skiller ODIHRs beskrivelse av konkurransevilkårene i Ungarn 2022 og Polen 2023 fra mine egne vurderinger.',
      questionIndex: 3,
      next: {
        improve: 'Finn én etterprøvbar observasjon i hver rapport. Skriv hvilket land og hvilken kilde hver observasjon gjelder.',
        uncertain: 'Sammenlign de to kildeutdragene og presiser hvilke setninger som er observasjoner, ikke egne konklusjoner.',
        clear: 'Kontroller at alle sentrale påstander fortsatt kan spores til den angitte rapporten.'
      }
    },
    {
      id: 'sammenligning',
      heading: 'Sammenlignbarhet',
      question: 'Har jeg forklart hva som kan sammenlignes, og at land, valgår og observatørmandater er forskjellige?',
      example: 'Begge rapporter omtaler skjeve konkurransevilkår, men det beviser ikke at årsakene og konsekvensene var identiske.',
      questionIndex: 3,
      next: {
        improve: 'Skriv én tydelig likhet og én relevant forskjell. Beskriv hvorfor sammenligningen er avgrenset.',
        uncertain: 'Skill liknende observasjoner fra påstanden om at de to valgene hadde samme årsaksforløp.',
        clear: 'Undersøk om forskjellene i mandat og institusjoner kan endre hvordan sammenligningen tolkes.'
      }
    },
    {
      id: 'mekanisme',
      heading: 'Mekanisme og årsak',
      question: 'Har jeg begrunnet hvordan statsressurser eller medier kan påvirke konkurransen uten å påstå en målt stemmeeffekt?',
      example: 'Sammenblanding av stat og partivalgkamp kan gi fordeler, men observasjonene oppgir ikke hvor mange stemmer dette eventuelt endret.',
      questionIndex: 1,
      next: {
        improve: 'Beskriv en mulig mekanisme fra observasjon til fordel og skill den fra et bevist valgresultat.',
        uncertain: 'Bruk ordene «kan bidra til» når du skisserer mekanismen, og oppgi hva som måtte undersøkes for å måle effekten.',
        clear: 'Kontroller at formuleringene dine ikke gjør en plausibel mekanisme til bevist stemme- eller mandateffekt.'
      }
    },
    {
      id: 'forbehold',
      heading: 'Usikkerhet og anbefalinger',
      question: 'Har jeg skrevet hva kildene ikke dokumenterer, og skilt en reformanbefaling fra en gjennomført reform?',
      example: 'ODIHRs anbefalinger angir mulige tiltak. De er ikke dokumentasjon på at tiltakene senere ble vedtatt eller virket.',
      questionIndex: 4,
      next: {
        improve: 'Legg til ett eksplisitt forbehold om årsak eller effekt og ett om hva reformanbefalinger ikke beviser.',
        uncertain: 'Marker forskjellen mellom hva ODIHR observerte, anbefalte og ikke har undersøkt videre.',
        clear: 'Sjekk at du ikke har skrevet at en anbefaling allerede er gjennomført eller har hatt effekt.'
      }
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

    const selfReview = element('section', 'politikk-evidence-rubric');
    selfReview.id = 'politikkEvidenceRubric';
    selfReview.hidden = true;
    selfReview.append(
      element('h6', '', 'Vurder din egen begrunnelse'),
      element('p', '', 'Les kriteriene og velg selv hvor godt du mener teksten din oppfyller hvert av dem. Dette er egenvurdering, ikke automatisk retting, karakter eller mestring.')
    );
    const reviewGrid = element('div', 'politikk-evidence-rubric-grid');
    const selectors = [];
    for (const criterion of SELF_REVIEW) {
      const card = element('article', 'politikk-evidence-rubric-item');
      card.dataset.criterion = criterion.id;
      const title = element('strong', '', criterion.heading);
      const prompt = element('p', '', criterion.question);
      const examples = element('details', 'politikk-evidence-rubric-example');
      examples.append(
        element('summary', '', 'Se faglig eksempel og kilde'),
        element('p', '', criterion.example),
        sourceLinks(comparison.questions[criterion.questionIndex])
      );
      const rating = element('select', 'politikk-evidence-self-rating');
      rating.id = 'politikkEvidenceRating-' + criterion.id;
      rating.dataset.criterion = criterion.id;
      for (const [value, title] of [
        ['', 'Velg egen vurdering'],
        ['improve', 'Dette må jeg forbedre'],
        ['uncertain', 'Jeg er usikker'],
        ['clear', 'Jeg mener dette er tydelig']
      ]) {
        const option = element('option', '', title);
        option.value = value;
        rating.append(option);
      }
      const label = element('label', '', 'Din vurdering av ' + criterion.heading.toLowerCase());
      label.htmlFor = rating.id;
      card.append(title, prompt, examples, label, rating);
      reviewGrid.append(card);
      selectors.push(rating);
    }
    const planButton = element('button', '', 'Lag min forbedringsplan');
    planButton.type = 'button';
    const planStatus = element('p', 'politikk-evidence-plan-status');
    planStatus.setAttribute('role', 'status');
    const plan = element('section', 'politikk-evidence-plan');
    plan.id = 'politikkEvidenceImprovementPlan';
    plan.hidden = true;

    planButton.addEventListener('click', () => {
      const unanswered = selectors.find(select => !select.value);
      if (unanswered) {
        planStatus.textContent = 'Velg din egen vurdering for alle fire kriterier først.';
        plan.hidden = true;
        unanswered.focus();
        return;
      }
      plan.replaceChildren(element('h6', '', 'Dine neste forbedringsgrep'));
      SELF_REVIEW.forEach((criterion, index) => {
        const item = element('p', '', criterion.heading + ': ' + criterion.next[selectors[index].value]);
        item.dataset.criterion = criterion.id;
        plan.append(item);
      });
      plan.append(element('p', '', 'Dette er forslag valgt ut fra dine egne avkrysninger. Ingen har kontrollert eller vurdert friteksten automatisk.'));
      planStatus.textContent = 'Forbedringsplanen er klar. Rediger gjerne teksten og gjør en ny egenvurdering.';
      plan.hidden = false;
    });

    note.addEventListener('input', () => {
      report.hidden = true;
      selfReview.hidden = true;
      plan.hidden = true;
      planStatus.textContent = '';
      response.textContent = 'Teksten er endret. Vis argumentrekken på nytt for å gjøre en ny egenvurdering.';
      selectors.forEach(select => { select.value = ''; });
    });
    selectors.forEach(select => select.addEventListener('change', () => {
      plan.hidden = true;
      planStatus.textContent = 'Egenvurderingen er endret. Lag en oppdatert forbedringsplan.';
    }));
    selfReview.append(reviewGrid, planButton, planStatus, plan);

    show.addEventListener('click', () => {
      const own = note.value.trim();
      if (own.length < 20) {
        response.textContent = 'Skriv en kort selvstendig begrunnelse før du viser argumentrekken.';
        report.hidden = true;
        selfReview.hidden = true;
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
      selfReview.hidden = false;
    });

    function refresh() {
      const correct = answers.filter((choice, index) => choice != null && STEPS[index].options[choice][1]).length;
      progress.textContent = correct + ' av ' + STEPS.length + ' kildebegrunnede valg. Dette er en øvelse, ikke automatisk faglig mestring.';
      assembly.hidden = correct !== STEPS.length;
      if (correct !== STEPS.length) {
        report.hidden = true;
        selfReview.hidden = true;
        plan.hidden = true;
      }
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

    assembly.append(instructions, label, note, show, response, report, selfReview);
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
