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

  // Bølge 12: to selvstendige skriveoppgaver bruker samme rubrikk og kanoniske kilder.
  const CASE_TASKS = Object.freeze([
    {
      id: 'comparison', label: 'Sammenlign Ungarn og Polen',
      prompt: 'Hva er likt, hva er forskjellig, og hva kan ikke kildene bevise?',
      placeholder: 'Jeg sammenligner ... Kildene viser ... Men vi vet ikke ...',
      limit: 'Valgobservasjonene dokumenterer ikke en identisk årsakskjede, nøyaktig stemmeeffekt eller senere reformvirkning.',
      instructions: 'Skriv med egne ord en etterprøvbar likhet og en relevant forskjell mellom valgene. Forklar også hva kildene ikke kan bevise. Teksten vurderes ikke automatisk og lagres ikke som mestring.',
      revisionStarter: 'ODIHR observerte ... i begge land. En viktig forskjell er ... . Det gir grunnlag for å si ..., men ikke ... .'
    },
    {
      id: 'poland', label: 'Polen 2023: administrasjon og konkurranse',
      prompt: 'Forklar hvordan et konkurransepreget og effektivt administrert valg likevel kan ha skjeve konkurransevilkår. Bruk ODIHRs konkrete observasjoner, drøft en mulig mekanisme og avgrens slutningen.',
      placeholder: 'I Polen 2023 observerte ODIHR ... En mulig mekanisme er ... Rapporten beviser ikke ...',
      limit: 'ODIHRs vurderinger av valgkamp og administrasjon dokumenterer ikke manipulert opptelling i hele landet, en bestemt stemmeeffekt eller gjennomførte reformer.',
      instructions: 'Skriv med egne ord én dokumentert observasjon om valgadministrasjon og én om konkurransevilkår i Polen. Forklar forskjellen, en mulig mekanisme og en grense for slutningen. Teksten vurderes ikke automatisk og lagres ikke som mestring.',
      revisionStarter: 'I Polen beskrev ODIHR ... om administrasjonen, men ... om konkurransevilkårene. Dette kan gi en fordel ved at ...; rapporten måler ikke ... .',
      questionIndices: [0, 1, 3, 4]
    },
    {
      id: 'hungary', label: 'Ungarn 2022: statsressurser og mediedekning',
      prompt: 'Forklar hvordan sammenblanding av stat og regjeringsparti kan svekke lik konkurranse uten å påstå at valgets opptelling var manipulert eller at en bestemt stemmeeffekt er beregnet.',
      placeholder: 'I Ungarn 2022 observerte ODIHR ... Dette kan påvirke konkurransen ved ... Vi kan ikke slutte at ...',
      limit: 'ODIHRs observasjoner dokumenterer konkurransevilkår og mulige mekanismer, ikke nøyaktig stemme-/mandateffekt, manipulert opptelling eller senere reformvirkning.',
      instructions: 'Skriv med egne ord en observert skjevhet i Ungarns valgkamp, en mulig mekanisme og et presist forbehold om virkning. Ikke forveksle valgkampvilkår med påstander om manipulert opptelling. Teksten vurderes ikke automatisk og lagres ikke som mestring.',
      revisionStarter: 'I Ungarn observerte ODIHR ... . Det kan påvirke konkurransen fordi ... . Kilden viser ikke hvor mange stemmer eller mandater dette endret.',
      questionIndices: [0, 1, 2]
    }
  ]);

  // Samme fire metodekriterier som bølge 11, med oppgavespesifikk ordlyd.
  const CASE_REVIEW = Object.freeze({
    poland: {
      belegg: {
        heading: 'Kildebelegg', questionIndex: 0,
        question: 'Har jeg vist til en konkret ODIHR-observasjon om både valgadministrasjon og konkurransevilkår i Polen 2023?',
        example: 'ODIHR beskrev konkurranse og effektiv administrasjon, men pekte også på manglende åpenhet i valgkommisjonen.',
        next: {
          improve: 'Hent én observasjon om valgadministrasjon og én om konkurransevilkår fra Polen-rapportene.',
          uncertain: 'Marker hvilke setninger som er ODIHR-observasjoner og hvilke som er dine egne tolkninger.',
          clear: 'Kontroller at begge observasjonene kan spores til den oppgitte Polen-kilden.'
        }
      },
      sammenligning: {
        heading: 'Analytisk sammenlignbarhet', questionIndex: 2,
        question: 'Har jeg skilt mellom god valgadministrasjon og like konkurransevilkår, i stedet for å behandle dem som samme mål?',
        example: 'Et valg kan være effektivt administrert og samtidig preget av fordeler gjennom statlige ressurser.',
        next: {
          improve: 'Skriv en setning om valgadministrasjon og en annen om konkurransevilkår; forklar forskjellen.',
          uncertain: 'Undersøk om teksten din bruker «godt gjennomført» som et feilaktig synonym for «rettferdig konkurranse».',
          clear: 'Se om forskjellen mellom administrasjon og konkurranse er tydelig i konklusjonen.'
        }
      },
      mekanisme: {
        heading: 'Mekanisme og årsak', questionIndex: 1,
        question: 'Har jeg forklart hvordan statsressurser og offentlig mediedekning kan gi fordel uten å påstå en målt stemmeeffekt?',
        example: 'Statlige kampanjer kan forsterke regjeringspartiets budskap selv når velgere fritt kan avgi stemme.',
        next: {
          improve: 'Beskriv hvordan ett konkret virkemiddel kan påvirke konkurransevilkårene, uten tallfestet valgresultateffekt.',
          uncertain: 'Skill plausibel fordel fra dokumentasjon på hvor mange velgere som ble påvirket.',
          clear: 'Kontroller at en mulig mekanisme ikke omtales som et bevist antall stemmer eller mandater.'
        }
      },
      forbehold: {
        heading: 'Usikkerhet og anbefalinger', questionIndex: 4,
        question: 'Har jeg avgrenset hva ODIHR ikke beviser om opptelling, stemmeeffekt og senere gjennomføring av reformer?',
        example: 'En reformanbefaling viser hva observatørene foreslo, ikke at reformen senere ble gjennomført.',
        next: {
          improve: 'Legg til et forbehold om opptelling eller virkning og ett om anbefaling versus gjennomført reform.',
          uncertain: 'Sjekk om kilden beskriver en observasjon, en anbefaling eller en senere dokumentert endring.',
          clear: 'Kontroller at konklusjonen ikke går lenger enn kildens observasjonsmandat.'
        }
      }
    },
    hungary: {
      belegg: {
        heading: 'Kildebelegg', questionIndex: 0,
        question: 'Har jeg skilt ODIHRs observasjon av valgavviklingen fra rapporterte skjevheter i Ungarns valgkamp?',
        example: 'Valget var godt organisert og ga distinkte alternativer, samtidig som konkurransevilkårene var skjeve.',
        next: {
          improve: 'Hent en konkret observasjon om valgavviklingen og en om konkurransevilkårene i Ungarn 2022.',
          uncertain: 'Merk hvilken ODIHR-kilde som støtter hver påstand og hva som er egen tolkning.',
          clear: 'Etterprøv at sentrale påstander er forankret i kildene for Ungarn 2022.'
        }
      },
      sammenligning: {
        heading: 'Analytisk sammenlignbarhet', questionIndex: 0,
        question: 'Har jeg holdt valgavvikling, valgkamp og velgeratferd fra hverandre som ulike analyseenheter?',
        example: 'Velorganisert stemmegivning er ikke i seg selv bevis på at alle partier hadde like muligheter i valgkampen.',
        next: {
          improve: 'Skill valgets organisering, valgkampens konkurransevilkår og velgernes valg i tre egne påstander.',
          uncertain: 'Sjekk om du trekker slutninger om velgere fra observasjoner som gjelder mediedekning.',
          clear: 'Kontroller at du ikke blander sammen analyseenheter i konklusjonen.'
        }
      },
      mekanisme: {
        heading: 'Mekanisme og årsak', questionIndex: 1,
        question: 'Har jeg forklart hvordan statlig finansiert kommunikasjon kan gi partipolitisk fordel uten å beregne valgutfall?',
        example: 'Statsfinansierte annonser kan forsterke regjeringspartiets budskap, men ODIHR beregnet ingen presis mandatvirkning.',
        next: {
          improve: 'Beskriv en mulig årsakskjede fra statsfinansiert kommunikasjon til konkurransefordel.',
          uncertain: 'Skill observert kommunikasjon og plausibel mekanisme fra målt stemme- eller mandateffekt.',
          clear: 'Se etter formuleringer som feilaktig gjør en mulighet om til en påvist valgeffekt.'
        }
      },
      forbehold: {
        heading: 'Usikkerhet og anbefalinger', questionIndex: 2,
        question: 'Har jeg presisert hva ODIHR ikke dokumenterer om mandatendring, opptelling eller klageordningenes senere utvikling?',
        example: 'Rapportering om kampanjefinansiering og klagemuligheter er ikke en beregning av hvordan resultatet ville blitt uten svakhetene.',
        next: {
          improve: 'Skriv eksplisitt hva kildene ikke måler, og hva en videre undersøkelse måtte dokumentere.',
          uncertain: 'Skill observasjon av finansieringsregler fra konklusjoner om velgernes faktiske stemmer.',
          clear: 'Kontroller at forbeholdene dekker både effekt, opptelling og senere utvikling.'
        }
      }
    }
  });

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
    const caseLabel = element('label', 'politikk-evidence-note-label', 'Velg skriveoppgave');
    caseLabel.htmlFor = 'politikkEvidenceCaseTask';
    const caseSelect = element('select', 'politikk-evidence-case-select');
    caseSelect.id = 'politikkEvidenceCaseTask';
    for (const task of CASE_TASKS) {
      const option = element('option', '', task.label);
      option.value = task.id;
      caseSelect.append(option);
    }
    let activeTask = CASE_TASKS[0];
    const taskDescription = element('p', 'politikk-evidence-assignment', activeTask.prompt);
    const taskEvidence = element('div', 'politikk-evidence-task-sources');
    taskEvidence.hidden = true;
    const instructions = element('p', 'politikk-evidence-instructions', activeTask.instructions);
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
    const rubricFields = [];
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
      rubricFields.push({ criterion, title, prompt, examples });
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
      // Prioriter ett selvvalgt forbedringsbehov fremfor fire likeverdige råd.
      const priority = { improve: 0, uncertain: 1, clear: 2 };
      const rated = [];
      SELF_REVIEW.forEach((baseCriterion, index) => {
        const criterion = CASE_REVIEW[activeTask.id]?.[baseCriterion.id] || baseCriterion;
        const item = element('p', '', criterion.heading + ': ' + criterion.next[selectors[index].value]);
        item.dataset.criterion = baseCriterion.id;
        rated.push({ item, rating: selectors[index].value, index });
      });
      rated.sort((a, b) => priority[a.rating] - priority[b.rating] || a.index - b.index);
      rated.forEach(({ item }, index) => {
        const lead = index === 0;
        if (lead) item.classList.add('politikk-evidence-first-step');
        item.textContent = (lead ? 'Start her – ' : 'Deretter – ') + item.textContent;
        plan.append(item);
        if (lead) plan.append(element('p', '', 'Prøv denne setningsstrukturen med egne ord: ' + activeTask.revisionStarter));
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

    // Bytte av skriveoppgave opphever gammel analyse og vurdering; ingen data lagres.
    caseSelect.addEventListener('change', () => {
      activeTask = CASE_TASKS.find(task => task.id === caseSelect.value) || CASE_TASKS[0];
      taskDescription.textContent = activeTask.prompt;
      instructions.textContent = activeTask.instructions;
      note.value = '';
      note.placeholder = activeTask.placeholder;
      report.hidden = true;
      selfReview.hidden = true;
      plan.hidden = true;
      response.textContent = 'Ny skriveoppgave valgt. Skriv en ny begrunnelse for denne kilden.';
      planStatus.textContent = '';
      selectors.forEach(select => { select.value = ''; });

      taskEvidence.replaceChildren();
      taskEvidence.hidden = activeTask.id === 'comparison';
      if (!taskEvidence.hidden) {
        taskEvidence.append(element('h6', '', 'Kildeobservasjoner for denne oppgaven'));
        const taskSet = activeTask.id === 'poland' ? poland : comparison;
        for (const index of activeTask.questionIndices) {
          const q = taskSet.questions[index];
          const source = element('div', 'politikk-evidence-task-source');
          source.append(element('p', '', q.knowledge_payload.summary), sourceLinks(q));
          taskEvidence.append(source);
        }
      }
      rubricFields.forEach(({ criterion: base, title, prompt, examples }) => {
        const criterion = CASE_REVIEW[activeTask.id]?.[base.id] || base;
        const taskSet = activeTask.id === 'poland' ? poland : comparison;
        title.textContent = criterion.heading;
        prompt.textContent = criterion.question;
        examples.replaceChildren(
          element('summary', '', 'Se faglig eksempel og kilde'),
          element('p', '', criterion.example),
          sourceLinks(taskSet.questions[criterion.questionIndex])
        );
      });
    });

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
      if (activeTask.id === 'comparison') {
        STEPS.forEach((step, index) => {
          const q = comparison.questions[step.questionIndex];
          report.append(element('p', '', step.label + ': ' + step.options[answers[index]][0]));
          report.append(sourceLinks(q));
        });
      } else {
        report.append(element('p', '', 'Valgt oppgave: ' + activeTask.label));
        const taskSet = activeTask.id === 'poland' ? poland : comparison;
        for (const index of activeTask.questionIndices) report.append(sourceLinks(taskSet.questions[index]));
      }
      report.append(element('p', '', 'Din begrunnelse: ' + own));
      report.append(element('p', '', 'Metodegrense: ' + activeTask.limit));
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

    assembly.append(caseLabel, caseSelect, taskDescription, taskEvidence, instructions, label, note, show, response, report, selfReview);
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
