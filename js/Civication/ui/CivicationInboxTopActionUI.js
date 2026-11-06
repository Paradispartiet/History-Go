// ============================================================
// CIVICATION INBOX TOP ACTION UI
// Hensikt:
// - Toppkortet skal bare vise "Krever svar" når en hendelse faktisk
//   er pending OG har valg brukeren kan svare på.
// - Vanlige meldinger uten valg skal vises som melding/status, ikke som krav.
// - Innkommende vises med tydelig skille mellom jobbmail og personlige meldinger.
// - Dette er presentasjonslogikk, ikke motor/state-mutasjon.
// ============================================================

(function () {
  "use strict";
  let lastAnswerSummary = null;

  function getInbox() {
    const fromMailEngine = window.CivicationMailEngine?.getInbox?.();
    if (Array.isArray(fromMailEngine)) return fromMailEngine;

    const fromState = window.CivicationState?.getInbox?.();
    if (Array.isArray(fromState)) return fromState;

    try {
      const stored = JSON.parse(localStorage.getItem("hg_civi_inbox_v1") || "[]");
      return Array.isArray(stored) ? stored : [];
    } catch {
      return [];
    }
  }

  function splitInbox() {
    const inbox = getInbox();
    const splitter = window.CivicationEventChannels?.splitInbox;
    if (typeof splitter !== "function") {
      return { messages: inbox, workday: [], milestones: [], system: [], unknown: [] };
    }
    return splitter(inbox);
  }

  function splitInboxByMessageChannel() {
    const inbox = getInbox();
    const classify = window.classifyCiviInboxItem;

    if (typeof classify === "function") {
      return (Array.isArray(inbox) ? inbox : []).reduce(function (acc, item) {
        const group = classify(item);
        if (group === "job") acc.job.push(item);
        else if (group === "personal") acc.private.push(item);
        else acc.unknown.push(item);
        return acc;
      }, { job: [], private: [], system: [], unknown: [] });
    }

    const splitter = window.CivicationEventChannels?.splitInboxByMessageChannel;
    if (typeof splitter === "function") {
      return splitter(inbox);
    }

    return (Array.isArray(inbox) ? inbox : []).reduce(function (acc, item) {
      const ev = eventOf(item);
      const sourceType = normalize(ev?.source_type);
      const mailClass = normalize(ev?.mail_class);
      const mailType = normalize(ev?.mail_type || ev?.type || ev?.kind);
      const isPrivate = sourceType === "life" || mailClass === "private_message" || mailType === "private" || mailType === "personal";
      const isSystem = sourceType === "system" || mailClass === "system" || mailType === "status";

      if (isSystem) acc.system.push(item);
      else if (isPrivate) acc.private.push(item);
      else acc.job.push(item);
      return acc;
    }, { job: [], private: [], system: [], unknown: [] });
  }

  const inboxFilters = window.CivicationInboxItemFilters || (window.CivicationInboxItemFilters = {
    eventOf: function (item) { return item?.event || item || null; },
    normalize: function (value) { return String(value || "").trim().toLowerCase(); },
    isOpenInboxItem: function (item) {
      if (!item) return false;
      if (item.deleted === true || item.archived === true || item.resolved === true) return false;
      const status = String(item.status || "pending").trim().toLowerCase();
      return status === "pending" || status === "open";
    },
    hasChoices: function (item) {
      const ev = item?.event || item || null;
      return Array.isArray(ev?.choices) && ev.choices.length > 0;
    },
    isActionableInboxItem: function (item) {
      if (!this.isOpenInboxItem(item)) return false;
      const ev = item?.event || item || {};
      const choices = Array.isArray(ev?.choices) ? ev.choices : [];
      if (choices.length > 0) return true;
      const kindText = [ev.mail_type, ev.type, ev.kind, ev.slot, ev.task_id, ev.source_type]
        .map(String).join(" ").toLowerCase();
      if (kindText.includes("task_gate")) return true;
      if (ev.requiresAction === true) return true;
      if ((ev.required === true || ev.isRequired === true) && choices.length > 0) return true;
      return false;
    }
  });

  function eventOf(item) {
    return inboxFilters.eventOf(item);
  }

  function normalize(value) {
    return inboxFilters.normalize(value);
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // The live Lillebekk dossier is a read-only view of the player's existing
  // WorkWorld objects. It is not another mail, scene engine, or approval step.
  const LILLEBEKK_REVIEW_TOPICS = [
    {
      title: "Plankart og areal",
      id: "plankart",
      control_owner: "Planteamet og planjurist Nora",
      document: "Datert plankart, tegnforklaring og kartversjon",
      check: "Sammenhold byggegrenser, arealformål og registrerte kartavvik.",
      positive: ["map_conflict_written_for_review", "green_passage_recommendation_logged", "early_map_conflict_documented"],
      negative: ["map_conflict_not_verified", "area_compromise_unverified", "early_map_conflict_not_verified"],
      next: "Kontroller kartavvik, arealfordeling og hjemmel før faglig anbefaling."
    },
    {
      title: "Grøntdrag",
      id: "grontdrag",
      control_owner: "Byøkolog Signe og planjurist Nora",
      document: "Grøntfaglig vurdering og forslag til planbestemmelse",
      check: "Kontroller sammenheng, jorddybde, flomvei og hva bestemmelsen faktisk sikrer.",
      positive: ["green_corridor_draft_requirement_proposed", "early_green_corridor_requirement_proposed"],
      negative: ["green_corridor_maintenance_only_unverified", "early_green_corridor_unsecured"],
      next: "Avklar jorddybde, sammenheng, flomvei og forslag til bindende bestemmelse med fag og planjuss."
    },
    {
      title: "Skolevei",
      id: "skolevei",
      control_owner: "Trafikkfaglig ansvarlig og planleder Elin",
      document: "Trafikksikkerhetsvurdering og forslag til rekkefølgekrav",
      check: "Kontroller hvilken strekning som vurderes, hvem som utfører tiltak og når de må være gjennomført.",
      positive: ["school_route_pre_occupancy_condition_proposed", "school_route_explicit_assessment_proposed", "early_school_route_condition_proposed"],
      negative: ["school_route_timing_unverified", "school_route_deferred_unsecured", "early_school_route_timing_unverified", "skolevei_ikke_dokumentert"],
      next: "Dokumenter faktisk skolevei, vilkår og ansvar før innflytting, ikke bare før ferdigattest."
    },
    {
      title: "Medvirkning",
      id: "medvirkning",
      control_owner: "Ansvarlig for medvirkningsprotokollen",
      document: "Merknadsoversikt og faglige svar på innspill",
      check: "Sammenhold hvert registrerte innspill med vurdering og eventuell endring i forslaget.",
      positive: ["participation_comments_evaluated", "early_participation_evaluated"],
      negative: ["participation_record_missing", "early_participation_record_missing"],
      next: "Journalfør innspill, vurdering og hva som eventuelt endres i planforslaget."
    },
    {
      title: "Overvann",
      id: "overvann",
      control_owner: "Overvannsfaglig ansvarlig og planjurist Nora",
      document: "Overvannsnotat, flomveikart og forslag til sikring",
      check: "Kontroller avrenning, flomveier, nabovirkning og hva som er forankret i planen.",
      positive: ["stormwater_condition_proposed", "early_stormwater_condition_proposed"],
      negative: ["stormwater_unsecured_in_plan", "early_stormwater_unsecured"],
      next: "Be fagansvarlig kontrollere flomvei, nabokonsekvenser og rettslig sikring."
    },
    {
      title: "Utbyggerkontakt",
      id: "utbyggerkontakt",
      control_owner: "Planleder Elin og journalansvarlig",
      document: "Journalført møte- og korrespondanselogg",
      check: "Kontroller hva som er bedt om, hvem som svarte og at ingen har gitt forhåndstilsagn.",
      positive: ["developer_formal_request_pending", "developer_signal_written_clarification_requested", "early_developer_formal_request_pending"],
      negative: ["developer_informal_signal_to_correct", "developer_signal_unrecorded", "early_developer_signal_needs_correction", "early_developer_signal_unrecorded"],
      next: "Journalfør signalene og presiser at rådgiveren ikke kan gi bindende forhåndstilsagn."
    },
    {
      title: "Faglig risiko i saksframlegget",
      id: "risiko",
      control_owner: "Planjurist Nora og planleder Elin",
      document: "Saksframlegg med risikovurdering og politiske alternativer",
      check: "Skill rettslig krav, faglig usikkerhet, administrativ anbefaling og politisk valg.",
      positive: ["material_risks_stated_for_politics", "early_material_risks_visible"],
      negative: ["material_risks_not_explicit", "early_material_risks_hidden", "politisk_grense_ikke_eksplisitt"],
      next: "Skill lovkrav, administrasjonens faglige vurdering og politisk handlingsrom."
    }
  ];

  // Authored *fictional* case exhibits, grounded in the existing Lillebekk cast.
  // A document records an assertion by its sender, not an automatically proven fact.
  const LILLEBEKK_CASE_EXHIBITS = [
  {
    "id": "hanne-skolevei-01",
    "topic": "skolevei",
    "ref": "LBK-MERK-01",
    "date": "6. november 2026",
    "type": "Innspill til planarbeidet",
    "sender": "Hanne, beboer i Lillebekk",
    "recipient": "Kommunens planteam",
    "title": "Skolevei gjennom kvartalet",
    "paragraphs": [
      "«Barn bruker forbindelsen gjennom Lillebekk på vei til skolen. Gangarealet blir også brukt til adkomst og varelevering. Det er uklart for oss hvilken trygg forbindelse som skal være ferdig når boligene tas i bruk.»",
      "Innspillet beskriver hverdagsbruk, men er ikke en trafikktelling eller en faglig kontroll av sikt, bredder og kryssing. Plankartet alene dokumenterer heller ikke hvordan forbindelsen sikres før første innflytting."
    ],
    "question": "Hva er en forsvarlig faglig oppfølging av innspillet?",
    "choices": [
      {
        "id": "A",
        "label": "Registrer innspillet som et åpent skoleveisforhold og be trafikkfaglig ansvarlig kontrollere forbindelsen.",
        "consequence": "Innspillet føres inn i beslutningsgrunnlaget, men trygg skolevei er fortsatt ikke dokumentert. Trafikkfaglig kontroll trengs.",
        "outcome": "skolevei_fagkontroll_foreslatt_i_sak"
      },
      {
        "id": "B",
        "label": "Ta innspillet inn i merknadsoversikten og utsett den konkrete kontrollen til høringen.",
        "consequence": "Medvirkning blir sporbar, men risikoen for sent omarbeid øker; ingen skoleveisvurdering er ferdig.",
        "outcome": "skolevei_vurdering_utsatt"
      },
      {
        "id": "C",
        "label": "Send ordlyden i et mulig rekkefølgekrav til Nora for juridisk vurdering før du anbefaler oversendelse.",
        "consequence": "Juridisk avklaring forberedes, men det gir ennå ingen dokumentasjon på sikkerheten i selve strekningen.",
        "outcome": "skolevei_rekkefolgekrav_til_juss"
      }
    ]
  },
  {
    "id": "signe-grontdrag-01",
    "topic": "grontdrag",
    "ref": "LBK-FAG-02",
    "date": "6. november 2026",
    "type": "Internt fagnotat – utkast",
    "sender": "Signe, byøkolog",
    "recipient": "Planteamet og Nora, planjuss",
    "title": "Grøntdrag og mulig flomvei",
    "paragraphs": [
      "«Skissen viser et sammenhengende grøntdrag, men dokumentene jeg har fått viser ikke hvordan jorddybde, vegetasjon og flomvei skal sikres der gangforbindelsen og ny bebyggelse møter grøntarealet.»",
      "«Det er for tidlig å skrive at løsningen ivaretar overvann. Jeg anbefaler et koordinert snitt, overvannsfaglig avklaring og at eventuelle krav kan leses igjen i bestemmelsene.»",
      "Notatet er en faglig vurdering av mangler i planmaterialet, ikke en måling av kapasitet eller godkjent prosjektering."
    ],
    "question": "Hva skal rådgiveren gjøre før grøntdraget brukes som et sikkert premiss i saksframlegget?",
    "choices": [
      {
        "id": "A",
        "label": "Be om snitt og dokumentasjon på jorddybde og flomvei, og la avviket stå åpent til faglig kontroll.",
        "consequence": "Et presist dokumentasjonskrav blir synlig; grøntdrag og overvann er ikke erklært kontrollert.",
        "outcome": "grontdrag_dokumentasjonsbehov_registrert"
      },
      {
        "id": "B",
        "label": "Beskriv grøntdraget som et mål i anbefalingen, med forbehold om videre prosjektering.",
        "consequence": "Politisk intensjon blir synlig, men uavklarte faglige funksjoner må fortsatt stå på avvikslisten.",
        "outcome": "grontdrag_faglig_forbehold"
      },
      {
        "id": "C",
        "label": "Be Nora og overvannsfaglig ansvarlig utforme et mulig bestemmelseskrav før oversendelse.",
        "consequence": "En juridisk og teknisk avklaring forberedes, men ingen bindende bestemmelse er vedtatt.",
        "outcome": "grontdrag_fagkontroll_foreslatt"
      }
    ]
  },
  {
    "id": "ivar-rekkefolge-01",
    "topic": "utbyggerkontakt",
    "ref": "LBK-UTB-03",
    "date": "6. november 2026",
    "type": "E-post fra forslagsstiller",
    "sender": "Ivar, representant for utbygger",
    "recipient": "Planteamet",
    "title": "Tidspunkt for opparbeidelse av gangforbindelse",
    "paragraphs": [
      "«Vi ønsker forutsigbarhet om fremdriften. I vårt utkast er opparbeidelse av gangforbindelsen knyttet til ferdigattest. Vi ber om tilbakemelding på om dette kan legges til grunn i den videre prosjekteringen.»",
      "Spørsmålet er legitimt, men en administrativ tilbakemelding er ikke et politisk vedtak. Ferdigattest og faktisk første innflytting er heller ikke nødvendigvis samme tidspunkt.",
      "E-posten dokumenterer utbyggers forslag og ønske om avklaring – ikke at løsningen oppfyller skoleveibehovet."
    ],
    "question": "Hvordan svarer du uten å love et planutfall eller skjule tidskonflikten?",
    "choices": [
      {
        "id": "A",
        "label": "Bekreft mottak, journalfør forskjellen mellom ferdigattest og innflytting og be om avklaring med planjuss og trafikkfag.",
        "consequence": "Forslagsstiller får en sporbar avklaringsoppgave; ingen forhåndsgodkjenning blir gitt.",
        "outcome": "utbygger_behov_for_formell_avklaring"
      },
      {
        "id": "B",
        "label": "Svar at forslaget vurderes i planprosessen, og avstå fra å uttale deg om tidspunktet nå.",
        "consequence": "Myndighetsgrensen bevares, men en konkret tidskonflikt står fortsatt uløst i saksgrunnlaget.",
        "outcome": "utbygger_tidskonflikt_utsatt"
      },
      {
        "id": "C",
        "label": "Be Elin om å ta stilling til hvordan forslaget skal behandles før du gir et formelt prosessvar.",
        "consequence": "Du løfter prosessspørsmålet til plansjefen, ikke en beslutning om planens innhold.",
        "outcome": "utbygger_ledersporsmal"
      }
    ]
  }
];

  function lillebekkExhibitsFor(dossier) {
    if (!dossier?.canRevise) return [];
    const history = window.CivicationWorkWorld?.getWorkObject?.("by_radgiver_lillebekk_plan_case_001")?.history || [];
    return LILLEBEKK_CASE_EXHIBITS.map(function (exhibit) {
      const saved = history.find(function (event) {
        return event.id === `lillebekk_bilag_${exhibit.id}_valg_v1`;
      });
      return { ...exhibit, decided: !!saved, decisionNote: saved?.note || "",
        selectedOutcome: saved?.outcome || "" };
    });
  }

  function recordLillebekkExhibitDecision(documentId, choiceId) {
    const dossier = lillebekkReviewModel();
    if (!dossier?.canRevise) return { ok: false, reason: "Den formelle saken er ikke åpen." };
    const doc = LILLEBEKK_CASE_EXHIBITS.find(function (item) { return item.id === documentId; });
    const choice = doc?.choices?.find(function (item) { return item.id === choiceId; });
    if (!doc || !choice) return { ok: false, reason: "Ukjent dokument eller valg." };
    const world = window.CivicationWorkWorld;
    if (typeof world?.appendWorkObjectHistory !== "function") return { ok: false, reason: "Saksloggen er utilgjengelig." };
    const workId = "by_radgiver_lillebekk_plan_case_001";
    const live = world.getWorkObject(workId);
    if (!live || live.status === "closed" || live.closed_at) return { ok: false, reason: "Saken er avsluttet." };
    const eventId = `lillebekk_bilag_${doc.id}_valg_v1`;
    if ((live.history || []).some(function (event) { return event.id === eventId; })) {
      return { ok: false, reason: "Dette bilaget er allerede behandlet; tidligere vurdering bevares." };
    }
    try {
      world.appendWorkObjectHistory(workId, {
        event_id: eventId,
        at: new Date().toISOString(),
        scene_id: "lillebekk_dokumentgjennomgang",
        choice_id: choice.id,
        outcome: choice.outcome,
        note: `Fiktivt spillbilag ${doc.ref} (${doc.sender}). Valgt oppfølging: ${choice.label} Konsekvens: ${choice.consequence} Dette innebærer ikke ekstern utsendelse, verifisert dokumentasjon, lukking av avvik eller godkjent plan.`
      });
      return { ok: true, outcome: choice.outcome };
    } catch (error) {
      if (window.DEBUG) console.warn("[Civication] Kunne ikke journalføre bilagsvalg", error);
      return { ok: false, reason: "Bilagsvalget kunne ikke lagres." };
    }
  }

  function lillebekkExhibitHtml(doc) {
    const body = doc.paragraphs.map(function (paragraph) {
      return `<p>${escapeHtml(paragraph)}</p>`;
    }).join("");
    const options = doc.decided
      ? `<p><strong>Journalført faglig oppfølging:</strong> ${escapeHtml(doc.decisionNote)}</p>`
      : `<p><strong>Arbeidsspørsmål:</strong> ${escapeHtml(doc.question)}</p>` +
        doc.choices.map(function (choice) {
          return `<button class="civi-btn secondary" type="button" data-civi-lillebekk-exhibit="1" data-doc-id="${escapeHtml(doc.id)}" data-choice-id="${escapeHtml(choice.id)}">${escapeHtml(choice.label)}</button>`;
        }).join("");
    return `<details class="civi-inbox-history civi-lillebekk-exhibit" data-exhibit-id="${escapeHtml(doc.id)}">
      <summary>${escapeHtml(doc.ref)} · ${escapeHtml(doc.title)}${doc.decided ? " · Journalført" : ""}</summary>
      <p class="muted">Fiktivt spillbilag – ikke et ekte kommunalt dokument.</p>
      <p><strong>Type:</strong> ${escapeHtml(doc.type)} · <strong>Dato:</strong> ${escapeHtml(doc.date)}</p>
      <p><strong>Avsender:</strong> ${escapeHtml(doc.sender)}</p>
      <p><strong>Mottaker:</strong> ${escapeHtml(doc.recipient)}</p>
      ${body}
      <div class="civi-inbox-card-actions">${options}</div>
      <p class="muted" role="status" data-civi-lillebekk-exhibit-error></p>
    </details>`;
  }


  // Comparison tasks are about the limits of three fictional documents.
  // "Avklar" denotes a defensible recommendation, not completed verification.
  const LILLEBEKK_BILAG_CHECKS = [
    {
      id: "skolevei_tidskrav",
      title: "Skolevei: innflytting versus ferdigattest",
      refs: ["LBK-MERK-01", "LBK-UTB-03"],
      fact: "Hanne beskriver bruk av gangforbindelsen ved skolestart. Ivar ønsker opparbeidelse knyttet til ferdigattest. Dokumentene dokumenterer verken sikkerheten eller samsvar mellom fristene.",
      defensible: "Krev trafikkfaglig vurdering av strekningen og avklar et eventuelt rekkefølgekrav før anbefaling.",
      overclaim: "Skriv at gangforbindelsen allerede er trygg og tilstrekkelig sikret i planen.",
      consequence: "Uten trafikkfaglig vurdering og avklart tidspunkt må skolevei stå som åpent forhold i saksframlegget."
    },
    {
      id: "grontdrag_overvann",
      title: "Grøntdrag: fagnotat versus sikret funksjon",
      refs: ["LBK-FAG-02", "LBK-UTB-03"],
      fact: "Signe etterlyser dokumentasjon på jorddybde, vegetasjon og flomvei. Ivars henvendelse gjelder ferdigstillelse av gangforbindelse og dokumenterer ikke overvannskapasitet.",
      defensible: "Etterspør snitt og overvannsfaglig kontroll før grøntdraget omtales som teknisk sikret.",
      overclaim: "Omtal grøntdraget som dokumentert flomvei fordi det er tegnet inn på kartet.",
      consequence: "Fagnotatet er et grunnlag for nye undersøkelser, ikke en godkjent overvannsløsning."
    },
    {
      id: "utbygger_myndighet",
      title: "Utbyggerkontakt: faglig svar versus forhåndstilsagn",
      refs: ["LBK-UTB-03", "LBK-MERK-01", "LBK-FAG-02"],
      fact: "Ivar ber om prosessuell avklaring. Hannes skolevei og Signes flomvei er fortsatt faglig uavklarte. Kommunens rådgiver kan ikke love et planvedtak eller godkjenne utbyggers foreslåtte frist.",
      defensible: "Journalfør prosessvar og løft frist, trafikk og overvann til riktig fag- og ledernivå uten forhåndstilsagn.",
      overclaim: "Bekreft at utbyggers løsning kan legges til grunn som kommunalt godkjent.",
      consequence: "Svar til utbygger er ikke vedtak. Planleder, planjuss og fagansvarlige må kunne etterprøve vurderingen."
    }
  ];

  function lillebekkSaksframleggModel() {
    const dossier = lillebekkReviewModel();
    if (!dossier?.canRevise) return null;
    const world = window.CivicationWorkWorld;
    const formal = world?.getWorkObject?.("by_radgiver_lillebekk_plan_case_001");
    if (!formal || formal.status === "closed" || formal.closed_at) return null;
    const history = Array.isArray(formal.history) ? formal.history : [];
    const exhibits = lillebekkExhibitsFor(dossier);
    const exhibitsReviewed = exhibits.length === 3 && exhibits.every(function (doc) { return doc.decided; });
    const checks = LILLEBEKK_BILAG_CHECKS.map(function (definition) {
      const prefix = `lillebekk_kildeavstemming_${definition.id}_v`;
      const matches = history.filter(function (event) { return String(event.id || "").startsWith(prefix); });
      const latest = matches[matches.length - 1] || null;
      return {
        ...definition, latestId: latest?.id || "", latestNote: latest?.note || "",
        latestOutcome: latest?.outcome || "", revisionCount: matches.length,
        safe: latest?.outcome === "avklar_forst"
      };
    });
    const ready = exhibitsReviewed && checks.every(function (check) { return check.safe; });
    // A memo snapshots both source assessments and the case's registered issues.
    // New WorkWorld flags must make a saved draft stale even without changed exhibits.
    const early = world?.getWorkObject?.("by_radgiver_lillebekk_early_analysis_case_001");
    const flagSignature = [
      "early:" + [...(early?.flags || [])].sort().join(","),
      "formal:" + [...(formal.flags || [])].sort().join(",")
    ].join("|");
    // The draft also uses topic-level document assessments. Their history revisions
    // are part of the source signature, not only the three cross-document choices.
    const topicSignature = dossier.topics.map(function (topic) {
      const prefix = `lillebekk_dokument_${topic.id}_vurdering_`;
      const assessments = history.filter(function (event) {
        return String(event.id || "").startsWith(prefix);
      });
      return `${topic.id}:${assessments[assessments.length - 1]?.id || "ingen_vurdering"}`;
    }).join("|");
    const signature = checks.map(function (check) { return check.latestId; }).join("|") +
      "|flags=" + flagSignature + "|topic_reviews=" + topicSignature;
    const drafts = history.filter(function (event) {
      return String(event.id || "").startsWith("lillebekk_saksframlegg_utkast_v");
    });
    const latestDraft = drafts[drafts.length - 1] || null;
    const upToDate = !!latestDraft && ready &&
      String(latestDraft.note || "").endsWith(`Kildeversjoner: ${signature}`);
    return {
      dossier, exhibitsReviewed, exhibits, checks, ready, signature,
      latestDraft, draftCount: drafts.length, upToDate
    };
  }

  function recordLillebekkComparison(checkId, outcome, reasoning) {
    const model = lillebekkSaksframleggModel();
    const check = model?.checks.find(function (item) { return item.id === checkId; });
    const reason = String(reasoning || "").replace(/\s+/g, " ").trim().slice(0, 450);
    if (!model?.exhibitsReviewed || !check || !["avklar_forst", "anta_avklart"].includes(outcome)) {
      return { ok: false, reason: "Behandle alle tre bilag før du sammenstiller dem." };
    }
    if (reason.length < 35) {
      return { ok: false, reason: "Begrunn med minst 35 tegn hva kildene faktisk viser og ikke viser." };
    }
    const world = window.CivicationWorkWorld;
    if (typeof world?.appendWorkObjectHistory !== "function") {
      return { ok: false, reason: "Saksloggen er utilgjengelig." };
    }
    const label = outcome === "avklar_forst" ? check.defensible : check.overclaim;
    const note = `Faglig kildeavstemming (${check.refs.join(" + ")}): ${check.title}. Kildegrunnlag: ${check.fact} Valgt vurdering: ${label} Begrunnelse: ${reason}. Faglig følge: ${check.consequence} Dette er vurdering av fiktivt spillmateriale, ikke verifisering eller vedtak.`;
    if (check.latestOutcome === outcome && check.latestNote === note) {
      return { ok: true, alreadyLogged: true };
    }
    // A case must never be permanently stuck with an unsubstantiated conclusion.
    // Permit the final safe correction after the normal revision cap, but not new
    // speculative reversals once the record has been corrected.
    if (check.revisionCount >= 10 &&
        !(check.latestOutcome === "anta_avklart" && outcome === "avklar_forst")) {
      return { ok: false, reason: "Revisjonsgrensen er nådd. Kun korrigering av et udokumentert standpunkt er tillatt." };
    }
    const formal = world.getWorkObject("by_radgiver_lillebekk_plan_case_001");
    if (!formal || formal.status === "closed" || formal.closed_at) {
      return { ok: false, reason: "Saken er avsluttet." };
    }
    try {
      world.appendWorkObjectHistory(formal.work_object_id, {
        event_id: `lillebekk_kildeavstemming_${check.id}_v${check.revisionCount + 1}`,
        scene_id: "lillebekk_saksframlegg", choice_id: outcome,
        at: new Date().toISOString(), outcome, note
      });
      return { ok: true, alreadyLogged: false };
    } catch (error) {
      if (window.DEBUG) console.warn("[Civication] Kildeavstemming", error);
      return { ok: false, reason: "Vurderingen kunne ikke journalføres." };
    }
  }

  function lillebekkBuildSaksframlegg(model, recommendation) {
    const unresolved = model.dossier.topics.filter(function (topic) {
      return topic.issue || !topic.documented || topic.reviewNeedLogged ||
        topic.caveatLogged || ["mangelfull", "motstridende", "fagkontroll"].includes(topic.assessmentOutcome);
    });
    const lines = [
      "LILLEBEKK – INTERNT SAKSFRAMLEGG, UTKAST",
      "Ikke godkjent. Ikke sendt til politisk behandling. Fiktivt spillmateriale.",
      "",
      "1. Dokumentgrunnlag",
      "LBK-MERK-01: Hannes innspill om faktisk skolevei, uten trafikksikkerhetsmåling.",
      "LBK-FAG-02: Signes foreløpige fagnotat; flomvei, jorddybde og planforankring er ikke kontrollert.",
      "LBK-UTB-03: Ivars forslag om frist ved ferdigattest; dette er ikke et kommunalt tilsagn.",
      "",
      "2. Faglige avstemminger",
      ...model.checks.map(function (check) { return `- ${check.title}: ${check.latestNote}`; }),
      "",
      "3. Uavklarte temaer i registrert sak",
      ...(unresolved.length ? unresolved.map(function (topic) {
        const documentCaveat = topic.assessmentNote
          ? ` Siste dokumentvurdering: ${topic.assessmentNote}` : "";
        const journalCaveat = [
          topic.reviewNeedLogged ? "Kontrollbehov er journalført." : "",
          topic.caveatLogged ? "Faglig forbehold er journalført." : ""
        ].filter(Boolean).join(" ");
        return `- ${topic.title}: ${topic.status}. ${documentCaveat} ${journalCaveat} ${topic.next}`.replace(/\s+/g, " ").trim();
      }) : ["- Ingen åpne markører i dette uttrekket; originalbilag må likevel kontrolleres."]),
      "",
      "4. Administrativ anbefaling til planleder",
      recommendation,
      "",
      "5. Myndighet og status",
      "Rådgiverens faglige utkast er ikke et vedtak. Elin må gjennomgå videre saksbehandling; planjurist og fagansvarlige må kontrollere krav. Politiske organer tar eventuelle planbeslutninger.",
      `Kildeversjoner: ${model.signature}`
    ];
    return lines.join("\n");
  }

  function recordLillebekkSaksframlegg(recommendation) {
    const model = lillebekkSaksframleggModel();
    if (!model?.ready) {
      return { ok: false, reason: "Alle tre bilag og alle tre faglig holdbare kildeavstemminger må være registrert." };
    }
    // Once the simulated manager has returned a draft, the only permitted
    // follow-up is the traceable corrected-draft workflow below.
    if (lillebekkLeaderReviewModel()?.returnEvent) {
      return { ok: false, reason: "Utkastet er returnert av Elin i spillsimuleringen. Bruk ledermerknadene og før et korrigert utkast." };
    }
    const text = String(recommendation || "").replace(/\s+/g, " ").trim().slice(0, 750);
    if (text.length < 70) {
      return { ok: false, reason: "Skriv en konkret administrativ anbefaling på minst 70 tegn." };
    }
    const world = window.CivicationWorkWorld;
    if (typeof world?.appendWorkObjectHistory !== "function") {
      return { ok: false, reason: "Saksloggen er utilgjengelig." };
    }
    const note = lillebekkBuildSaksframlegg(model, text);
    if (model.latestDraft?.note === note) {
      return { ok: true, alreadyLogged: true };
    }
    if (model.draftCount >= 10) return { ok: false, reason: "Utkastloggen er full." };
    const formal = world.getWorkObject("by_radgiver_lillebekk_plan_case_001");
    if (!formal || formal.status === "closed" || formal.closed_at) {
      return { ok: false, reason: "Saken er avsluttet." };
    }
    try {
      world.appendWorkObjectHistory(formal.work_object_id, {
        event_id: `lillebekk_saksframlegg_utkast_v${model.draftCount + 1}`,
        scene_id: "lillebekk_saksframlegg",
        choice_id: "journalfor_internt_utkast",
        at: new Date().toISOString(), outcome: "internt_utkast_ikke_godkjent", note
      });
      return { ok: true, alreadyLogged: false };
    } catch (error) {
      if (window.DEBUG) console.warn("[Civication] Saksframlegg", error);
      return { ok: false, reason: "Utkastet kunne ikke journalføres." };
    }
  }

  // Authored, fictional manager return. No email is sent and no authority is granted.
  const LILLEBEKK_LEADER_CHECKS = [
    {
      id: "skolevei", title: "Skolevei og tidspunkt for trygg adkomst",
      refs: "LBK-MERK-01 + LBK-UTB-03",
      feedback: "Elin: Du har gjengitt innspillet og utbyggers forslag, men ikke vist hva som må kontrolleres før første innflytting. Skille opplevd skolevei fra trafikkfaglig sikkerhet. Angi strekning, ansvarlig fagmiljø og tidspunkt for mulig rekkefølgekrav.",
      needed: "trafikkfag",
      task: "Be trafikkfaglig ansvarlig vurdere forbindelsen før innflytting; la avviket stå åpent til vurderingen foreligger."
    },
    {
      id: "grontdrag", title: "Grøntdrag, flomvei og planbestemmelser",
      refs: "LBK-FAG-02",
      feedback: "Elin: Signes notat peker på manglende jorddybde, snitt og flomveikart. Vi kan ikke behandle et inntegnet grøntdrag som verifisert overvannskapasitet. Vis hvilken kontroll og hvilket eventuelt bestemmelsesforslag som må utarbeides.",
      needed: "overvannsfag",
      task: "Etterspør faglig snitt og vurdering av flomvei/jorddybde, og avklar mulig planbestemmelse med planjurist."
    },
    {
      id: "utbygger", title: "Utbyggerkontakt og myndighetsgrense",
      refs: "LBK-UTB-03",
      feedback: "Elin: Utbygger ber om tidspunkt og forutsigbarhet, men kommunen må ikke gi forhåndstilsagn om planløsningen. Skill prosessvar fra juridisk og politisk avklaring, og få dokumentert hvem som følger opp.",
      needed: "planjuss",
      task: "Utarbeid et nøytralt prosessvar til utbygger for intern kontroll hos planjuss; ingen utsendelse eller forhåndsgodkjenning skjer her."
    }
  ];
  const LILLEBEKK_LEADER_RESPONSES = [
    { id: "trafikkfag", label: "Legg til konkret trafikkfaglig kontrolloppgave" },
    { id: "overvannsfag", label: "Be om teknisk overvannsdokumentasjon" },
    { id: "planjuss", label: "Avklar svar og krav med planjurist" },
    { id: "antatt_avklart", label: "Behandle forholdet som allerede avklart" }
  ];

  function lillebekkLeaderReviewModel() {
    const memo = lillebekkSaksframleggModel();
    if (!memo) return null;
    const formal = window.CivicationWorkWorld?.getWorkObject?.("by_radgiver_lillebekk_plan_case_001");
    if (!formal || formal.status === "closed" || formal.closed_at) return null;
    const history = Array.isArray(formal.history) ? formal.history : [];
    const returnEvent = history.find(function (event) {
      return event.id === "lillebekk_leder_retur_v1";
    }) || null;
    const returnedDraftId = returnEvent?.choice_id || "";
    const points = LILLEBEKK_LEADER_CHECKS.map(function (p) {
      const prefix = `lillebekk_leder_svar_${p.id}_v`;
      const records = history.filter(function (event) {
        return String(event.id || "").startsWith(prefix);
      });
      const latest = records[records.length - 1] || null;
      return { ...p, recordsCount: records.length, lastOutcome: latest?.outcome || "",
        lastNote: latest?.note || "", safe: !!returnEvent && latest?.outcome === p.needed };
    });
    const corrected = !!returnEvent && !!memo.latestDraft &&
      memo.latestDraft.id !== returnedDraftId &&
      memo.latestDraft.outcome === "korrigert_internt_utkast_ikke_godkjent" &&
      String(memo.latestDraft.note || "").includes(`Lederretur: ${returnEvent.id}`);
    const canRevise = !!returnEvent && !corrected &&
      memo.latestDraft?.id === returnedDraftId && memo.ready &&
      points.every(function (point) { return point.safe; });
    return {
      memo, points, returnEvent, returnedDraftId, corrected, canRevise,
      answeredCount: points.filter(function (point) { return point.safe; }).length,
      canRequestReview: !returnEvent && memo.ready && memo.upToDate && !!memo.latestDraft
    };
  }

  function recordLillebekkLeaderReturn() {
    const review = lillebekkLeaderReviewModel();
    if (!review?.canRequestReview) {
      return { ok: false, reason: "Det kreves et gjeldende internt saksframlegg før simulert ledergjennomgang." };
    }
    const world = window.CivicationWorkWorld;
    if (typeof world?.appendWorkObjectHistory !== "function") {
      return { ok: false, reason: "Saksloggen er ikke tilgjengelig." };
    }
    const formal = world.getWorkObject("by_radgiver_lillebekk_plan_case_001");
    if (!formal || formal.status === "closed" || formal.closed_at) {
      return { ok: false, reason: "Saken er avsluttet." };
    }
    const draftId = review.memo.latestDraft.id;
    const note = "SIMULERT INTERN LEDERRETUR fra Elin, knyttet til " + draftId +
      ". Ikke en faktisk utsendelse, innhentet uttalelse eller godkjenning.\n" +
      review.points.map(function (point, index) {
        return `${index + 1}. ${point.title} (${point.refs}): ${point.feedback}`;
      }).join("\n") +
      "\nTre konkrete oppfølgingspunkter må dokumenteres i en ny versjon. Åpne avvik beholdes.";
    try {
      world.appendWorkObjectHistory(formal.work_object_id, {
        event_id: "lillebekk_leder_retur_v1",
        scene_id: "lillebekk_ledergjennomgang",
        choice_id: draftId,
        outcome: "simulert_leder_returnert_ikke_godkjent",
        at: new Date().toISOString(), note
      });
      return { ok: true, draftId };
    } catch (error) {
      if (window.DEBUG) console.warn("[Civication] Lederretur", error);
      return { ok: false, reason: "Lederreturen kunne ikke journalføres." };
    }
  }

  function recordLillebekkLeaderResponse(pointId, action, explanation) {
    const review = lillebekkLeaderReviewModel();
    const point = review?.points.find(function (row) { return row.id === pointId; });
    if (!review?.returnEvent || review.corrected ||
        review.memo.latestDraft?.id !== review.returnedDraftId ||
        !point || !LILLEBEKK_LEADER_RESPONSES.some(function (row) { return row.id === action; })) {
      return { ok: false, reason: "Denne ledermerknaden er ikke åpen for svar." };
    }
    const reason = String(explanation || "").replace(/\s+/g, " ").trim().slice(0, 700);
    if (reason.length < 65) {
      return { ok: false, reason: "Beskriv konkret hva som må kontrolleres, hvem som har ansvaret, og hva som fortsatt er uavklart (minst 65 tegn)." };
    }
    const label = LILLEBEKK_LEADER_RESPONSES.find(function (row) { return row.id === action; }).label;
    const note = `Svar til simulert ledermerknad om ${point.title}. Bilag: ${point.refs}. Planlagt oppfølging: ${label}. Konkret begrunnelse: ${reason}. Oppgaven er foreslått og ikke sendt, dokumentert som ferdig, vedtatt eller godkjent.`;
    if (point.lastOutcome === action && point.lastNote === note) return { ok: true, alreadyLogged: true };
    if (point.recordsCount >= 10 &&
        !(point.lastOutcome !== point.needed && action === point.needed)) {
      return { ok: false, reason: "Revisjonsgrensen er nådd. Kun en faglig korrekt sluttkorrigering kan journalføres." };
    }
    const world = window.CivicationWorkWorld;
    if (typeof world?.appendWorkObjectHistory !== "function") {
      return { ok: false, reason: "Saksloggen er ikke tilgjengelig." };
    }
    const formal = world.getWorkObject("by_radgiver_lillebekk_plan_case_001");
    if (!formal || formal.status === "closed" || formal.closed_at) {
      return { ok: false, reason: "Saken er avsluttet." };
    }
    try {
      world.appendWorkObjectHistory(formal.work_object_id, {
        event_id: `lillebekk_leder_svar_${point.id}_v${point.recordsCount + 1}`,
        scene_id: "lillebekk_ledergjennomgang",
        choice_id: action,
        at: new Date().toISOString(), outcome: action, note
      });
      return { ok: true, alreadyLogged: false };
    } catch (error) {
      if (window.DEBUG) console.warn("[Civication] Svar til ledermerknad", error);
      return { ok: false, reason: "Ledermerknaden kunne ikke journalføres." };
    }
  }

  function recordLillebekkCorrectedMemo(recommendation) {
    const review = lillebekkLeaderReviewModel();
    if (!review?.canRevise) {
      return { ok: false, reason: "Svar faglig forsvarlig på alle tre ledermerknader før du fører en ny utkastversjon." };
    }
    const text = String(recommendation || "").replace(/\s+/g, " ").trim().slice(0, 750);
    if (text.length < 80) {
      return { ok: false, reason: "Skriv en konkret administrativ anbefaling på minst 80 tegn." };
    }
    const world = window.CivicationWorkWorld;
    if (typeof world?.appendWorkObjectHistory !== "function") {
      return { ok: false, reason: "Saksloggen er ikke tilgjengelig." };
    }
    const memo = review.memo;
    // One additional version is reserved for the only permitted correction
    // after Elin's simulated return. Ten ordinary drafts must not deadlock rework.
    if (memo.draftCount >= 11) return { ok: false, reason: "Utkastloggen er full." };
    const base = lillebekkBuildSaksframlegg(memo, text);
    const signatureLine = `Kildeversjoner: ${memo.signature}`;
    if (!base.endsWith(signatureLine)) return { ok: false, reason: "Kildeversjonen kunne ikke kontrolleres." };
    const appendix = [
      "6. Oppfølging av simulert lederretur (ikke godkjenning)",
      `Lederretur: ${review.returnEvent.id}`,
      `Tidligere utkast: ${review.returnedDraftId}`,
      ...review.points.map(function (point) {
        return `- ${point.title}: ${point.lastNote}`;
      }),
      "Oppfølgingene er dokumenterte planlagte handlinger. Nye fagrapporter er ikke automatisk mottatt eller verifisert."
    ].join("\n");
    const note = base.slice(0, -signatureLine.length) + appendix + "\n" + signatureLine;
    const latest = memo.latestDraft;
    if (latest?.note === note) return { ok: true, alreadyLogged: true };
    const formal = world.getWorkObject("by_radgiver_lillebekk_plan_case_001");
    if (!formal || formal.status === "closed" || formal.closed_at) {
      return { ok: false, reason: "Saken er avsluttet." };
    }
    try {
      world.appendWorkObjectHistory(formal.work_object_id, {
        event_id: `lillebekk_saksframlegg_utkast_v${memo.draftCount + 1}`,
        scene_id: "lillebekk_ledergjennomgang",
        choice_id: "korrigert_utkast_etter_simulert_lederretur",
        at: new Date().toISOString(),
        outcome: "korrigert_internt_utkast_ikke_godkjent", note
      });
      return { ok: true, alreadyLogged: false };
    } catch (error) {
      if (window.DEBUG) console.warn("[Civication] Korrigert saksframlegg", error);
      return { ok: false, reason: "Korrigert utkast kunne ikke journalføres." };
    }
  }


  // Authored fictional replies: professional tasks, never completed expert reports.
  const LILLEBEKK_FAGSVAR = [
    {
      id: "trafikk", ref: "LBK-TRAF-04", title: "Foreløpig trafikksvar om skolevei",
      sender: "Kommunal trafikkrådgiver (fiktiv rolle)", date: "6. november 2026",
      content: "Innspillet om skolebarn, varelevering og atkomst må undersøkes på den aktuelle strekningen. Det foreligger ikke oppmålt gangbredde, siktvurdering, befaring eller trafikktelling. Ivars forslag om ferdigattest sier heller ikke når trygg forbindelse må være etablert før innflytting.",
      requirement: "Etterspør befaring, oppmåling, risikovurdering under anleggstid og tydelig tidspunkt og ansvar før innflytting.",
      safeId: "bestill_trafikkontroll", safeLabel: "Journalfør oppgave til trafikkfag og behold sikkerhetsforbehold",
      unsafeId: "fastsla_trygg_skolevei", unsafeLabel: "Konkluder med trygg skolevei uten kontroll"
    },
    {
      id: "overvann", ref: "LBK-OV-05", title: "Foreløpig overvannsfaglig svar",
      sender: "Overvannsfaglig rådgiver (fiktiv rolle)", date: "6. november 2026",
      content: "Signes grøntfaglige notat beskriver mulige løsninger, men er ikke en dimensjonerende overvannsberegning. Terrengsnitt, flomveikart, jorddybde, infiltrasjon og virkninger for naboer er ikke dokumentert. Et tegnet grøntdrag bekrefter ikke hydraulisk kapasitet.",
      requirement: "Etterspør etterprøvbare snitt og beregninger, flomveikart og planfaglig kontroll av bestemmelsesforslaget.",
      safeId: "bestill_overvannsgrunnlag", safeLabel: "Journalfør behov for beregninger og faglig kontroll",
      unsafeId: "fastsla_sikret_flomvei", unsafeLabel: "Registrer grøntdraget som godkjent flomvei"
    },
    {
      id: "planjuss", ref: "LBK-JUS-06", title: "Foreløpig planjuridisk svar",
      sender: "Planjurist (fiktiv rolle)", date: "6. november 2026",
      content: "Ferdigattest er utbyggers forslag, ikke et kommunalt tilsagn. Et eventuelt rekkefølgekrav må formuleres presist, med ansvar, tidspunkt og faktisk plankart som grunnlag. Ingen konkret bestemmelse er lovlighetskontrollert her; beslutningsmyndighet følger ordinær plansak.",
      requirement: "Utform et nøytralt prosessvar og send forslag til rekkefølgekrav til intern juridisk kontroll, uten forhåndstilsagn.",
      safeId: "bestill_juridisk_kontroll", safeLabel: "Journalfør juridisk kontroll og nøytralt prosessvar",
      unsafeId: "lov_utbygger_godkjenning", unsafeLabel: "Gi utbygger forhåndstilsagn om godkjenning"
    }
  ];

  function lillebekkFagsvarModel() {
    const leader = lillebekkLeaderReviewModel();
    if (!leader?.corrected) return null;
    const world = window.CivicationWorkWorld;
    const formal = world?.getWorkObject?.("by_radgiver_lillebekk_plan_case_001");
    if (!formal || formal.status === "closed" || formal.closed_at) return null;
    const history = Array.isArray(formal.history) ? formal.history : [];
    const intake = history.find(function (e) { return e.id === "lillebekk_fagsvar_spillmottak_v1"; }) || null;
    const docs = LILLEBEKK_FAGSVAR.map(function (doc) {
      const prefix = "lillebekk_fagsvar_" + doc.id + "_v";
      const entries = history.filter(function (e) { return String(e.id || "").startsWith(prefix); });
      const latest = entries[entries.length - 1] || null;
      return { ...doc, revisionCount: entries.length, lastId: latest?.id || "",
        lastOutcome: latest?.outcome || "", lastNote: latest?.note || "",
        safe: !!intake && latest?.outcome === doc.safeId };
    });
    const ready = !!intake && docs.every(function (doc) { return doc.safe; });
    const signature = [leader.memo.latestDraft?.id || "", leader.memo.signature]
      .concat(docs.map(function (doc) { return doc.lastId; })).join("|");
    const notes = history.filter(function (e) {
      return String(e.id || "").startsWith("lillebekk_fagsvar_oppfolging_v");
    });
    const latestNote = notes[notes.length - 1] || null;
    return { leader, intake, docs, ready, signature, notesCount: notes.length, latestNote,
      current: !!latestNote && ready &&
        String(latestNote.note || "").endsWith("Kildeversjoner: " + signature) };
  }

  function recordLillebekkFagsvarIntake() {
    const model = lillebekkFagsvarModel();
    if (!model || model.intake) return { ok: false, reason: "De fiktive fagsvarene er ikke åpne, eller allerede åpnet." };
    const world = window.CivicationWorkWorld;
    if (typeof world?.appendWorkObjectHistory !== "function") return { ok: false, reason: "Saksloggen mangler." };
    const formal = world.getWorkObject("by_radgiver_lillebekk_plan_case_001");
    if (!formal || formal.status === "closed" || formal.closed_at) return { ok: false, reason: "Saken er avsluttet." };
    try {
      world.appendWorkObjectHistory(formal.work_object_id, {
        event_id: "lillebekk_fagsvar_spillmottak_v1", scene_id: "lillebekk_fagoppfolging",
        choice_id: "apne_fiktive_interne_fagsvar", at: new Date().toISOString(),
        outcome: "fiktive_fagsvar_klargjort_for_gjennomgang",
        note: "Spilleren åpnet tre forhåndsskrevne og fiktive faglige svar: " +
          LILLEBEKK_FAGSVAR.map(function (doc) { return doc.ref + " (" + doc.sender + ")"; }).join("; ") +
          ". Ingen ekstern rapport er mottatt eller verifisert. Ingen godkjenning eller faktisk utsendelse."
      });
      return { ok: true };
    } catch (error) {
      if (window.DEBUG) console.warn("[Civication] Fiktivt fagsvarmottak", error);
      return { ok: false, reason: "Mottaket kunne ikke journalføres." };
    }
  }

  function recordLillebekkFagsvarAssessment(docId, choiceId, reasoning) {
    const model = lillebekkFagsvarModel();
    const doc = model?.docs.find(function (row) { return row.id === docId; });
    if (!model?.intake || !doc || ![doc.safeId, doc.unsafeId].includes(choiceId)) {
      return { ok: false, reason: "Åpne de tre fiktive faglige svarene og velg en gyldig vurdering." };
    }
    const reason = String(reasoning || "").replace(/\s+/g, " ").trim().slice(0, 650);
    if (reason.length < 65) {
      return { ok: false, reason: "Begrunn med minst 65 tegn hva som må kontrolleres, av hvem, og hva som fortsatt er uavklart." };
    }
    const label = choiceId === doc.safeId ? doc.safeLabel : doc.unsafeLabel;
    const note = "Vurdering av fiktivt faglig svar " + doc.ref + " fra " + doc.sender +
      ". Valg: " + label + ". Begrunnelse: " + reason + ". Kontrollbehov: " + doc.requirement +
      " Dette journalfører ikke ferdig fagkontroll, ekstern verifikasjon eller vedtak.";
    if (doc.lastOutcome === choiceId && doc.lastNote === note) return { ok: true, alreadyLogged: true };
    if (doc.revisionCount >= 10 && !(doc.lastOutcome !== doc.safeId && choiceId === doc.safeId)) {
      return { ok: false, reason: "Revisjonsgrensen er nådd. Bare faglig forsvarlig sluttkorrigering er tillatt." };
    }
    const world = window.CivicationWorkWorld;
    if (typeof world?.appendWorkObjectHistory !== "function") return { ok: false, reason: "Saksloggen mangler." };
    const formal = world.getWorkObject("by_radgiver_lillebekk_plan_case_001");
    if (!formal || formal.status === "closed" || formal.closed_at) return { ok: false, reason: "Saken er avsluttet." };
    try {
      world.appendWorkObjectHistory(formal.work_object_id, {
        event_id: "lillebekk_fagsvar_" + doc.id + "_v" + (doc.revisionCount + 1),
        scene_id: "lillebekk_fagoppfolging", choice_id: choiceId,
        at: new Date().toISOString(), outcome: choiceId, note
      });
      return { ok: true, alreadyLogged: false };
    } catch (error) {
      if (window.DEBUG) console.warn("[Civication] Fagsvarvurdering", error);
      return { ok: false, reason: "Vurderingen kunne ikke journalføres." };
    }
  }

  function recordLillebekkFagsvarFollowup(recommendation) {
    const model = lillebekkFagsvarModel();
    if (!model?.ready) return { ok: false, reason: "Alle tre fagsvar må få forsvarlig vurdering først." };
    const text = String(recommendation || "").replace(/\s+/g, " ").trim().slice(0, 850);
    if (text.length < 90) return { ok: false, reason: "Skriv minst 90 tegn om ansvar, dokumentbehov og uavklarte forhold." };
    const unresolved = model.leader.memo.dossier.topics.filter(function (topic) {
      return topic.issue || !topic.documented || topic.reviewNeedLogged || topic.caveatLogged ||
        ["mangelfull", "motstridende", "fagkontroll"].includes(topic.assessmentOutcome);
    });
    const note = [
      "LILLEBEKK – SUPPLERENDE INTERNT FAGNOTAT (IKKE GODKJENT)",
      "Korrigert saksframlegg: " + model.leader.memo.latestDraft.id,
      "Fiktive kollegasvar: faglige oppfølgingsbehov, ikke ferdige kontrollrapporter.",
      "",
      "1. Gjennomgåtte spillbilag",
      ...model.docs.map(function (doc) { return "- " + doc.ref + ": " + doc.lastNote; }),
      "",
      "2. Uavklarte fagtemaer",
      ...(unresolved.length ? unresolved.map(function (topic) {
        return "- " + topic.title + ": " + topic.status + ". " + (topic.assessmentNote || topic.next);
      }) : ["- Ingen åpne flagg i dette uttrekket; dokumentkontroll er fortsatt nødvendig."]),
      "",
      "3. Rådgiverens videre arbeidsfordeling",
      text,
      "",
      "4. Myndighetsgrense",
      "Fiktive svar er ikke verifiserte rapporter. Ingen saksflagg er lukket, ingen utbyggersvar er sendt og ingen leder- eller planvedtak er fattet.",
      "Kildeversjoner: " + model.signature
    ].join("\n");
    if (model.latestNote?.note === note) return { ok: true, alreadyLogged: true };
    if (model.notesCount >= 10) return { ok: false, reason: "Notatloggen er full." };
    const world = window.CivicationWorkWorld;
    if (typeof world?.appendWorkObjectHistory !== "function") return { ok: false, reason: "Saksloggen mangler." };
    const formal = world.getWorkObject("by_radgiver_lillebekk_plan_case_001");
    if (!formal || formal.status === "closed" || formal.closed_at) return { ok: false, reason: "Saken er avsluttet." };
    try {
      world.appendWorkObjectHistory(formal.work_object_id, {
        event_id: "lillebekk_fagsvar_oppfolging_v" + (model.notesCount + 1),
        scene_id: "lillebekk_fagoppfolging",
        choice_id: "journalfor_supplerende_internt_fagnotat",
        at: new Date().toISOString(), outcome: "supplerende_fagnotat_ikke_godkjent", note
      });
      return { ok: true, alreadyLogged: false };
    } catch (error) {
      if (window.DEBUG) console.warn("[Civication] Supplerende fagnotat", error);
      return { ok: false, reason: "Fagnotatet kunne ikke journalføres." };
    }
  }

  function lillebekkReviewModel() {
    const active = window.CivicationState?.getActivePosition?.();
    // MailPlan uses by_radgiver_plan, while accepted job offers store the
    // position as role_key/title "arealplanlegger" in CivicationState.
    const activeIds = [active?.role_scope, active?.role_id, active?.role_key, active?.title]
      .map(function (value) { return String(value || "").trim().toLowerCase(); });
    if (!activeIds.some(function (id) {
      return ["by_radgiver_plan", "by_arealplanlegger", "arealplanlegger"].includes(id);
    })) return null;
    const world = window.CivicationWorkWorld;
    if (typeof world?.getWorkObject !== "function") return null;
    const early = world.getWorkObject("by_radgiver_lillebekk_early_analysis_case_001");
    const formal = world.getWorkObject("by_radgiver_lillebekk_plan_case_001");
    if (!early && !formal) return null;
    const flags = new Set([...(early?.flags || []), ...(formal?.flags || [])]);
    const formalFlags = new Set(formal?.flags || []);
    const canRevise = !!formal && formal.status !== "closed" && !formal.closed_at;
    const formalHistory = Array.isArray(formal?.history) ? formal.history : [];
    const topics = LILLEBEKK_REVIEW_TOPICS.map(function (topic) {
      const documented = topic.positive.some(function (flag) { return flags.has(flag); });
      const issue = topic.negative.some(function (flag) { return flags.has(flag); });
      const receipt = formalHistory.find(function (event) {
        return event.id === `lillebekk_dokument_${topic.id}_oppgitt_mottak_v1`;
      });
      const reviews = formalHistory.filter(function (event) {
        return String(event.id || "").startsWith(`lillebekk_dokument_${topic.id}_vurdering_`);
      });
      const latestReview = reviews[reviews.length - 1];
      return {
        id: topic.id,
        title: topic.title,
        control_owner: topic.control_owner,
        receiptLogged: !!receipt,
        receiptNote: receipt?.note || "",
        assessmentNote: latestReview?.note || "",
        assessmentOutcome: latestReview?.outcome || "",
        reviewNeedLogged: formalFlags.has(`lillebekk_revisjon_${topic.id}_kontrollbehov`),
        caveatLogged: formalFlags.has(`lillebekk_revisjon_${topic.id}_forbehold`),
        status: documented && issue ? "Motstridende spor – avklar"
          : issue ? "Åpent avvik" : documented ? "Faglig spor registrert" : "Ingen registrert vurdering",
        documented,
        issue,
        next: topic.next,
        document: topic.document,
        check: topic.check,
        consequence: issue ? "Avviket må føres som uavklart i revisjonsgrunnlaget."
          : documented ? "Registrert faglig spor må kontrolleres mot bilag før det brukes som dokumentert premiss."
          : "Ingen registrert vurdering; ikke skriv at forholdet er avklart."
      };
    });
    return {
      phase: formal ? "Formell saksforberedelse" : "Tidlig saksarbeid",
      canRevise,
      topics,
      documented: topics.filter(function (topic) { return topic.documented; }).length,
      open: topics.filter(function (topic) { return topic.issue || !topic.documented; }).length,
      approved: false
    };
  }

  // A player action logs a concrete work note, not receipt of a document or an approval.
  // Use WorkWorld's existing idempotent flag/history mutation, never a parallel store.
  function recordLillebekkReviewAction(topicId, actionId) {
    const dossier = lillebekkReviewModel();
    const topic = dossier?.topics?.find(function (item) { return item.id === topicId; });
    if (!dossier?.canRevise || !topic || !["kontrollbehov", "forbehold"].includes(actionId)) {
      return { ok: false, reason: "Saksrevisjonen er ikke tilgjengelig for denne rollen eller saken." };
    }
    const world = window.CivicationWorkWorld;
    if (typeof world?.addFlag !== "function") return { ok: false, reason: "Saksloggen er ikke tilgjengelig." };
    const caseId = "by_radgiver_lillebekk_plan_case_001";
    const live = world.getWorkObject(caseId);
    if (!live || live.status === "closed" || live.closed_at) return { ok: false, reason: "Saken er avsluttet." };
    const flag = `lillebekk_revisjon_${topic.id}_${actionId}`;
    if ((live.flags || []).includes(flag)) return { ok: true, alreadyLogged: true };
    const note = actionId === "kontrollbehov"
      ? `Kontrollbehov registrert for ${topic.title}: etterspør eller les ${topic.document}. Faglig kontakt: ${topic.control_owner}. Dokumentet er ikke registrert mottatt eller verifisert.`
      : `Forbehold registrert for ${topic.title}: ${topic.check} Uavklarte forhold skal synliggjøres i saksframlegget. Ingen ferdig saksframlegg eller godkjenning er registrert.`;
    try {
      world.addFlag(caseId, flag, {
        event_id: `lillebekk_revisjon_${topic.id}_${actionId}_v1`,
        scene_id: "lillebekk_revisjon_innboks",
        choice_id: actionId,
        at: new Date().toISOString(),
        note
      });
      return { ok: true, alreadyLogged: false };
    } catch (error) {
      if (window.DEBUG) console.warn("[Civication] Lillebekk-revisjon", error);
      return { ok: false, reason: "Kontrollbehovet kunne ikke lagres." };
    }
  }


  // Player-supplied journal references are not evidence that a document was verified.
  // Both steps use the existing WorkWorld history and keep all unresolved flags.
  function recordLillebekkDocumentReceipt(topicId, journalRef, sender, description) {
    const dossier = lillebekkReviewModel();
    const topic = dossier?.topics?.find(function (item) { return item.id === topicId; });
    const world = window.CivicationWorkWorld;
    if (!dossier?.canRevise || !topic || typeof world?.appendWorkObjectHistory !== "function") {
      return { ok: false, reason: "Dokumentjournalen er ikke tilgjengelig." };
    }
    const clean = function (value, max) {
      return String(value || "").replace(/\s+/g, " ").trim().slice(0, max);
    };
    const reference = clean(journalRef, 100);
    const source = clean(sender, 120);
    const summary = clean(description, 500);
    if (reference.length < 5 || source.length < 4 || summary.length < 12) {
      return { ok: false, reason: "Oppgi journalreferanse, avsender og en konkret beskrivelse." };
    }
    const caseId = "by_radgiver_lillebekk_plan_case_001";
    const live = world.getWorkObject(caseId);
    if (!live || live.status === "closed" || live.closed_at) return { ok: false, reason: "Saken er avsluttet." };
    const eventId = `lillebekk_dokument_${topic.id}_oppgitt_mottak_v1`;
    if ((live.history || []).some(function (event) { return event.id === eventId; })) {
      return { ok: false, reason: "Det finnes allerede en registrering for dette fagområdet." };
    }
    try {
      world.appendWorkObjectHistory(caseId, {
        event_id: eventId, scene_id: "lillebekk_revisjon_innboks",
        choice_id: "registrer_spilleroppgitt_mottak", at: new Date().toISOString(),
        outcome: "spilleroppgitt_ikke_verifisert",
        note: `Spilleroppgitt dokumentmottak for ${topic.title}. Dokumenttype: ${topic.document}. Journalreferanse: ${reference}. Avsender: ${source}. Beskrivelse: ${summary}. Kilde og innhold er ikke verifisert av systemet; åpne avvik er uendret.`
      });
      return { ok: true };
    } catch (error) {
      if (window.DEBUG) console.warn("[Civication] Lillebekk-mottak", error);
      return { ok: false, reason: "Mottaket kunne ikke journalføres." };
    }
  }

  function recordLillebekkDocumentAssessment(topicId, outcome, reasoning) {
    const dossier = lillebekkReviewModel();
    const topic = dossier?.topics?.find(function (item) { return item.id === topicId; });
    const world = window.CivicationWorkWorld;
    const labels = {
      mangelfull: "Mangler nødvendig grunnlag",
      motstridende: "Motstridende opplysninger krever avklaring",
      fagkontroll: "Oversend til ansvarlig fagkontroll"
    };
    const reason = String(reasoning || "").replace(/\s+/g, " ").trim().slice(0, 500);
    if (!dossier?.canRevise || !topic?.receiptLogged ||
        !Object.prototype.hasOwnProperty.call(labels, outcome) ||
        typeof world?.appendWorkObjectHistory !== "function") {
      return { ok: false, reason: "Oppgitt mottak må journalføres før vurdering." };
    }
    if (reason.length < 20) return { ok: false, reason: "Skriv en faglig begrunnelse på minst 20 tegn." };
    const caseId = "by_radgiver_lillebekk_plan_case_001";
    const live = world.getWorkObject(caseId);
    if (!live || live.status === "closed" || live.closed_at) return { ok: false, reason: "Saken er avsluttet." };
    const prefix = `lillebekk_dokument_${topic.id}_vurdering_`;
    const note = `Foreløpig vurdering av spilleroppgitt bilag for ${topic.title}: ${labels[outcome]}. Begrunnelse: ${reason}. Kildehenvisningen står i mottaksnotatet. Dette bekrefter ikke dokumentet, lukker ikke fagavvik og gir ingen myndighetsgodkjenning.`;
    const revisions = (live.history || []).filter(function (item) {
      return String(item.id || "").startsWith(prefix);
    });
    const previous = revisions[revisions.length - 1];
    // Duplicate submits (including normalized whitespace) must not consume a revision.
    // A real change may still return to an earlier assessment after an intervening one.
    if (previous?.outcome === outcome && previous?.note === note) {
      return { ok: true, alreadyLogged: true };
    }
    if (revisions.length >= 20) return { ok: false, reason: "Vurderingsloggen er full." };
    try {
      world.appendWorkObjectHistory(caseId, {
        event_id: `${prefix}${revisions.length + 1}`, scene_id: "lillebekk_revisjon_innboks",
        choice_id: outcome, at: new Date().toISOString(), outcome, note
      });
      return { ok: true, alreadyLogged: false };
    } catch (error) {
      if (window.DEBUG) console.warn("[Civication] Lillebekk-vurdering", error);
      return { ok: false, reason: "Vurderingen kunne ikke journalføres." };
    }
  }


  function lillebekkDocumentHtml(topic) {
    const topicAttr = ' data-topic-id="' + escapeHtml(topic.id) + '"';
    let html = '<details class="civi-inbox-history"><summary>Dokumentmottak og faglig vurdering</summary>';
    if (!topic.receiptLogged) {
      html += '<p>Registrer bare bilag du har fått opplysninger om i spillet. Mottaket er spilleroppgitt, ikke verifisert.</p>';
      html += '<label>Journalreferanse <input type="text" maxlength="100" data-civi-document-ref placeholder="Journalpost eller dokumentnummer"></label>';
      html += '<label>Avsender <input type="text" maxlength="120" data-civi-document-sender placeholder="Fagavdeling eller avsender"></label>';
      html += '<label>Dokumentbeskrivelse <textarea rows="3" maxlength="500" data-civi-document-description placeholder="Hvilket grunnlag har du faktisk fått?"></textarea></label>';
      html += '<button class="civi-btn secondary" type="button" data-civi-lillebekk-receipt="1"' +
        topicAttr + '>Journalfør spilleroppgitt mottak</button>';
    } else {
      html += '<p><strong>Journalført mottak (spilleroppgitt):</strong> ' + escapeHtml(topic.receiptNote) + '</p>';
      if (topic.assessmentNote) html += '<p><strong>Siste foreløpige vurdering:</strong> ' + escapeHtml(topic.assessmentNote) + '</p>';
      html += '<label>Faglig resultat <select data-civi-assessment-outcome>' +
        '<option value="mangelfull">Mangler nødvendig grunnlag</option>' +
        '<option value="motstridende">Motstridende opplysninger – avklar</option>' +
        '<option value="fagkontroll">Oversend til fagkontroll</option></select></label>';
      html += '<label>Begrunnelse <textarea rows="3" maxlength="500" data-civi-assessment-reason placeholder="Beskriv konkret hva som må kontrolleres"></textarea></label>';
      html += '<button class="civi-btn secondary" type="button" data-civi-lillebekk-assess="1"' +
        topicAttr + '>Journalfør foreløpig vurdering</button>';
    }
    html += '<p class="muted" data-civi-lillebekk-error role="status"></p></details>';
    return html;
  }


  function lillebekkSaksframleggHtml() {
    const model = lillebekkSaksframleggModel();
    if (!model) return "";
    const safeCount = model.checks.filter(function (check) { return check.safe; }).length;
    let html = '<details class="civi-inbox-history" data-civi-lillebekk-saksframlegg="1">' +
      '<summary>Bilagsavstemming og internt saksframlegg</summary>' +
      '<p>Fiktiv plansak. Sammenlign dokumentenes påstander, vis usikkerhet og journalfør en begrunnet vurdering. Saksframlegget gir ikke myndighet til å godkjenne planen.</p>';
    if (!model.exhibitsReviewed) {
      html += '<p><strong>Første arbeidsoppgave:</strong> Behandle alle tre saksbilag i innboksen. Kildeavstemming krever at innspill, fagnotat og utbyggers henvendelse er gjennomgått.</p>';
    } else {
      html += '<p><strong>Faglig forsvarlige avstemminger:</strong> ' + safeCount + ' av 3. En overdrevet kildekonklusjon må korrigeres før saksframlegg kan journalføres.</p>';
      html += model.checks.map(function (check) {
        const references = check.refs.join(" + ");
        return '<section class="civi-inbox-body" data-civi-lillebekk-check-id="' + escapeHtml(check.id) + '">' +
          '<h4>' + escapeHtml(check.title) + '</h4>' +
          '<p><strong>Saksbilag:</strong> ' + escapeHtml(references) + '</p>' +
          '<p><strong>Hva kildene viser:</strong> ' + escapeHtml(check.fact) + '</p>' +
          '<p><strong>Faglig følge:</strong> ' + escapeHtml(check.consequence) + '</p>' +
          (check.latestNote ? '<p><strong>Sist journalført:</strong> ' + escapeHtml(check.latestNote) + '</p>' : '') +
          '<label>Kildekonklusjon <select data-civi-crosscheck-outcome>' +
            '<option value="avklar_forst"' + (check.latestOutcome === "avklar_forst" ? ' selected' : '') + '>' + escapeHtml(check.defensible) + '</option>' +
            '<option value="anta_avklart"' + (check.latestOutcome === "anta_avklart" ? ' selected' : '') + '>' + escapeHtml(check.overclaim) + '</option>' +
          '</select></label>' +
          '<label>Din begrunnelse <textarea rows="3" maxlength="450" data-civi-crosscheck-reason placeholder="Sammenhold kildene og forklar hva som ennå mangler"></textarea></label>' +
          '<button class="civi-btn secondary" type="button" data-civi-lillebekk-crosscheck="1" data-check-id="' + escapeHtml(check.id) + '">Journalfør kildeavstemming</button>' +
          '<p class="muted" role="status" data-civi-lillebekk-check-error></p>' +
        '</section>';
      }).join("");
    }
    if (model.latestDraft) {
      html += '<h4>Sist journalførte saksframlegg' + (model.upToDate ? ' – gjeldende kildeversjoner' : ' – gjennomgå kildeversjoner på nytt') + '</h4>' +
        '<pre class="civi-inbox-body" style="white-space:pre-wrap;overflow-wrap:anywhere">' +
        escapeHtml(model.latestDraft.note) + '</pre>';
    }
    const leaderPhase = lillebekkLeaderReviewModel();
    if (model.ready && !leaderPhase?.returnEvent) {
      html += '<section class="civi-inbox-body" data-civi-lillebekk-draft-editor="1">' +
        '<h4>Administrativ anbefaling til planleder Elin</h4>' +
        '<p>Beskriv hva som må innhentes, hvem som skal kontrollere det og hvilket prosessvalg du anbefaler. Utkastet skal fortsatt vise alle åpne avvik.</p>' +
        '<label>Anbefaling <textarea rows="4" maxlength="750" data-civi-draft-recommendation placeholder="Anbefal videre faglig kontroll før saksframlegget går til ledergjennomgang …"></textarea></label>' +
        '<button class="civi-btn secondary" type="button" data-civi-lillebekk-draft="1">Journalfør internt saksframlegg</button>' +
        '<p class="muted" role="status" data-civi-lillebekk-draft-error></p></section>';
    } else if (leaderPhase?.returnEvent) {
      html += '<p>Utkastet er returnert i den simulerte ledergjennomgangen. Fortsett under Elins ledermerknader; ordinær journalføring er sperret.</p>';
    } else if (model.exhibitsReviewed) {
      html += '<p>Det interne saksframlegget kan først utarbeides når alle tre kildeavstemminger er faglig holdbare. Et valg som påstår at uverifiserte forhold er godkjent, må revideres.</p>';
    }
    return html + '</details>';
  }

  function lillebekkLeaderReviewHtml() {
    const review = lillebekkLeaderReviewModel();
    if (!review) return "";
    let html = '<details class="civi-inbox-history" data-civi-lillebekk-leader-review="1">' +
      '<summary>Elins ledergjennomgang av saksframlegget</summary>' +
      '<p>Dette er en fiktiv, forhåndsskrevet ledergjennomgang i spillet, ikke en faktisk sendt sak eller kommunal godkjenning.</p>';
    if (!review.returnEvent) {
      if (!review.canRequestReview) {
        html += '<p>Journalfør et oppdatert, internt saksframlegg etter bilagsavstemmingen før ledergjennomgangen kan åpnes.</p>';
      } else {
        html += '<p>Elin skal gjennomgå kildegrunnlaget, uavklarte frister og myndighetsgrenser. Tilbakemeldingen gjelder utkast ' +
          escapeHtml(review.memo.latestDraft.id) + ' og gir ikke et vedtak.</p>' +
          '<button class="civi-btn secondary" type="button" data-civi-lillebekk-leader-return="1">Åpne simulert ledergjennomgang</button>' +
          '<p class="muted" role="status" data-civi-leader-error></p>';
      }
    } else {
      html += '<p><strong>Returnert utkast:</strong> ' + escapeHtml(review.returnedDraftId) +
        '. Elin ber om tre konkrete avklaringer. Det er ikke gitt noen godkjenning.</p>';
      if (review.corrected) {
        html += '<p><strong>Korrigert saksframlegg journalført.</strong> En ny ledervurdering er ikke foretatt; dokumentet er ikke godkjent eller sendt videre.</p>';
      } else {
        html += '<p><strong>Faglig forsvarlige svar:</strong> ' + review.answeredCount + ' av 3.</p>';
        html += review.points.map(function (point) {
          const choices = LILLEBEKK_LEADER_RESPONSES.map(function (row) {
            return '<option value="' + escapeHtml(row.id) + '"' +
              (row.id === point.lastOutcome ? ' selected' : '') + '>' +
              escapeHtml(row.label) + '</option>';
          }).join("");
          return '<section class="civi-inbox-body" data-civi-leader-point-id="' + escapeHtml(point.id) + '">' +
            '<h4>' + escapeHtml(point.title) + '</h4>' +
            '<p><strong>Elins merknad:</strong> ' + escapeHtml(point.feedback) + '</p>' +
            '<p><strong>Bilag som må brukes:</strong> ' + escapeHtml(point.refs) + '</p>' +
            '<p><strong>Kontrolloppgave:</strong> ' + escapeHtml(point.task) + '</p>' +
            (point.lastNote ? '<p><strong>Journalført svar:</strong> ' + escapeHtml(point.lastNote) + '</p>' : '') +
            '<label>Faglig oppfølging <select data-civi-leader-action>' + choices + '</select></label>' +
            '<label>Konkret svar til leder <textarea rows="3" maxlength="700" data-civi-leader-reason ' +
              'placeholder="Beskriv konkret oppgave, ansvarlig fagfunksjon og fortsatt uavklart forhold"></textarea></label>' +
            '<button class="civi-btn secondary" type="button" data-civi-lillebekk-leader-response="1" ' +
              'data-point-id="' + escapeHtml(point.id) + '">Journalfør svar på ledermerknad</button>' +
            '<p class="muted" role="status" data-civi-leader-point-error></p>' +
          '</section>';
        }).join("");
        if (review.canRevise) {
          html += '<section class="civi-inbox-body" data-civi-leader-revised-editor="1">' +
            '<h4>Korrigert saksframlegg etter lederretur</h4>' +
            '<p>Gi en ny anbefaling til planleder med åpne avvik. Svarene inngår som planlagt faglig oppfølging, ikke som bekreftede rapporter eller vedtak.</p>' +
            '<label>Korrigert administrativ anbefaling <textarea rows="4" maxlength="750" data-civi-leader-revised-recommendation ' +
              'placeholder="Anbefal hvem som må gjøre kontrollen før videre saksbehandling"></textarea></label>' +
            '<button class="civi-btn secondary" type="button" data-civi-lillebekk-revised-memo="1">Journalfør korrigert internt saksframlegg</button>' +
            '<p class="muted" role="status" data-civi-leader-revised-error></p></section>';
        } else {
          html += '<p>Et korrigert utkast kan først journalføres etter tre begrunnede, faglig forsvarlige svar. Ingen dokumenter er automatisk mottatt eller kontrollert.</p>';
        }
      }
    }
    return html + '</details>';
  }


  function lillebekkFagsvarHtml() {
    const model = lillebekkFagsvarModel();
    if (!model) return "";
    let html = '<details class="civi-inbox-history" data-civi-lillebekk-fagsvar="1">' +
      '<summary>Faglige svar fra trafikk, overvann og planjuss</summary>' +
      '<p>Alle dokumentene nedenfor er forhåndsskrevne, fiktive spillbilag. De er foreløpige faglige svar, ikke målinger, verifiserte kontrollrapporter, faktisk sendt post eller planvedtak.</p>';
    if (!model.intake) {
      html += '<p>Elins tre merknader er besvart og et korrigert internt saksframlegg er journalført. Neste arbeidsoppgave er å gjennomgå de fiktive kollegasvarene.</p>' +
        '<button class="civi-btn secondary" type="button" data-civi-fagsvar-intake="1">Åpne tre simulerte fagsvar</button>' +
        '<p class="muted" role="status" data-civi-fagsvar-intake-error></p>';
    } else {
      html += '<p><strong>Faglig forsvarlige vurderinger:</strong> ' +
        model.docs.filter(function (doc) { return doc.safe; }).length + ' av 3.</p>';
      html += model.docs.map(function (doc) {
        return '<section class="civi-inbox-body" data-civi-fagsvar-doc-id="' + escapeHtml(doc.id) + '">' +
          '<h4>' + escapeHtml(doc.ref) + ' – ' + escapeHtml(doc.title) + '</h4>' +
          '<p><strong>Avsender:</strong> ' + escapeHtml(doc.sender) +
          ' · <strong>Dato:</strong> ' + escapeHtml(doc.date) + '</p>' +
          '<p>' + escapeHtml(doc.content) + '</p>' +
          '<p><strong>Kontrollbehov:</strong> ' + escapeHtml(doc.requirement) + '</p>' +
          (doc.lastNote ? '<p><strong>Sist journalført:</strong> ' + escapeHtml(doc.lastNote) + '</p>' : '') +
          '<label>Faglig konklusjon <select data-civi-fagsvar-action>' +
            '<option value="' + escapeHtml(doc.safeId) + '"' +
              (doc.lastOutcome === doc.safeId ? ' selected' : '') + '>' +
              escapeHtml(doc.safeLabel) + '</option>' +
            '<option value="' + escapeHtml(doc.unsafeId) + '"' +
              (doc.lastOutcome === doc.unsafeId ? ' selected' : '') + '>' +
              escapeHtml(doc.unsafeLabel) + '</option></select></label>' +
          '<label>Begrunnelse og neste arbeidsoppgave <textarea rows="3" maxlength="650" data-civi-fagsvar-reason ' +
            'placeholder="Hva viser svaret, hva mangler og hvilken fagfunksjon må følge opp?"></textarea></label>' +
          '<button class="civi-btn secondary" type="button" data-civi-fagsvar-assess="1" data-doc-id="' +
            escapeHtml(doc.id) + '">Journalfør faglig vurdering</button>' +
          '<p class="muted" role="status" data-civi-fagsvar-assess-error></p>' +
        '</section>';
      }).join("");
      if (model.latestNote) {
        html += '<h4>Supplerende internt fagnotat' +
          (model.current ? ' – gjeldende kildeversjoner' : ' – utdatert grunnlag') + '</h4>' +
          '<pre class="civi-inbox-body" style="white-space:pre-wrap;overflow-wrap:anywhere">' +
            escapeHtml(model.latestNote.note) + '</pre>';
      }
      if (model.ready) {
        html += '<section class="civi-inbox-body" data-civi-fagsvar-followup-editor="1">' +
          '<h4>Arbeidsfordeling etter faglige svar</h4>' +
          '<p>Beskriv hvilke konkrete kontroller trafikkfag, overvann og planjuss må gjøre før en ny ledervurdering. Dette er et internt notat, ikke en utsendelse.</p>' +
          '<label>Rådgiverens videre anbefaling <textarea rows="4" maxlength="850" data-civi-fagsvar-recommendation ' +
            'placeholder="Angi ansvar, dokumentbehov og hva som fortsatt er uavklart"></textarea></label>' +
          '<button class="civi-btn secondary" type="button" data-civi-fagsvar-followup="1">Journalfør supplerende internt fagnotat</button>' +
          '<p class="muted" role="status" data-civi-fagsvar-followup-error></p>' +
        '</section>';
      } else {
        html += '<p>Et supplerende fagnotat krever tre faglig forsvarlige vurderinger. Å anta at en undersøkelse allerede er gjort, blir journalført som feilvurdering og må korrigeres.</p>';
      }
    }
    return html + '</details>';
  }

  function lillebekkReviewHtml() {
    const dossier = lillebekkReviewModel();
    if (!dossier) return "";
    const caseExhibits = lillebekkExhibitsFor(dossier);
    return `
      <section class="civi-inbox-channel-section civi-lillebekk-dossier" aria-label="Lillebekk saksoversikt">
        <div class="civi-inbox-channel-head">
          <div>
            <h3>Lillebekk · saksoversikt</h3>
            <p class="muted">${escapeHtml(dossier.phase)}. ${dossier.documented} av 7 temaer har et registrert faglig spor; ${dossier.open} trenger dokumentasjon eller avklaring.</p>
          </div>
        </div>
        ${caseExhibits.length ? `<details class="civi-inbox-history" data-civi-lillebekk-documents="1">
          <summary>Saksbilag til gjennomgang (${caseExhibits.length})</summary>
          ${caseExhibits.map(lillebekkExhibitHtml).join("")}
        </details>` : ""}
        ${lillebekkSaksframleggHtml()}
        ${lillebekkLeaderReviewHtml()}
        ${lillebekkFagsvarHtml()}
        <details class="civi-inbox-history">
          <summary>Se faglige vurderinger og åpne avvik</summary>
          <div class="civi-inbox-history-list">
            ${dossier.topics.map(function (topic) {
              return `<article class="civi-inbox-card">
                <div class="civi-inbox-card-head"><div class="civi-inbox-card-title-wrap">
                  <h4>${escapeHtml(topic.title)}</h4>
                  <p class="civi-inbox-sender">${escapeHtml(topic.status)}</p>
                </div></div>
                <div class="civi-inbox-body">
                  <p><strong>Kontrollgrunnlag som må etterspørres eller leses:</strong> ${escapeHtml(topic.document)}</p>
                  <p><strong>Faglig kontakt:</strong> ${escapeHtml(topic.control_owner)}</p>
                  <p><strong>Kontrollpunkt:</strong> ${escapeHtml(topic.check)}</p>
                  <p><strong>Neste arbeidsoppgave:</strong> ${escapeHtml(topic.next)}</p>
                  <p><strong>Faglig følge:</strong> ${escapeHtml(topic.consequence)}</p>
                  ${dossier.canRevise ? `<div class="civi-inbox-card-actions" role="group" aria-label="Revisjonsarbeid: ${escapeHtml(topic.title)}">
                    <button class="civi-btn secondary" type="button" data-civi-lillebekk-review="1" data-topic-id="${escapeHtml(topic.id)}" data-review-action="kontrollbehov" ${topic.reviewNeedLogged ? "disabled" : ""}>${topic.reviewNeedLogged ? "Kontrollbehov journalført" : "Journalfør kontrollbehov"}</button>
                    <button class="civi-btn secondary" type="button" data-civi-lillebekk-review="1" data-topic-id="${escapeHtml(topic.id)}" data-review-action="forbehold" ${topic.caveatLogged ? "disabled" : ""}>${topic.caveatLogged ? "Forbehold journalført" : "Journalfør faglig forbehold"}</button>
                  </div>` : ""}
                  ${dossier.canRevise ? lillebekkDocumentHtml(topic) : ""}
                </div>
              </article>`;
            }).join("")}
          </div>
        </details>
        <p class="muted">Dette er en kontrolliste over aktuelle dokumenttyper, ikke bekreftede bilag. Kontrollbehov, spilleroppgitt dokumentmottak og foreløpig vurdering journalføres uten automatisk dokumentverifikasjon, utsendelse eller lukking av fagavvik. Registrert faglig spor betyr ikke at et dokument er kontrollert, og gir ikke planvedtak eller ledergodkjenning.</p>
      </section>`;
  }

  function isPending(item) {
    return isOpenItem(item);
  }

  function isOpenItem(item) {
    if (!inboxFilters.isOpenInboxItem(item)) return false;
    return !window.CivicationDayProgression?.isPreviouslyAnsweredInboxItem?.(item);
  }

  function hasEmbeddedInboxActions() {
    return !!document.getElementById("civiInboxSection") &&
      typeof window.CivicationNextActionUI?.render === "function";
  }

  function hasChoices(item) {
    return inboxFilters.hasChoices(item);
  }

  function isActionableInboxItem(item) {
    return inboxFilters.isActionableInboxItem(item);
  }

  function titleOf(item) {
    const ev = eventOf(item);
    return String(ev?.subject || ev?.title || ev?.kind || ev?.mail_type || "Innkommende").trim();
  }

  function kindOf(item) {
    const ev = eventOf(item);
    return String(ev?.kind || ev?.mail_type || ev?.type || "Innkommende").trim();
  }

  function fromOf(item) {
    const ev = eventOf(item);
    return String(ev?.from || ev?.source || ev?.sender || "Civication").trim();
  }

  function mailIdOf(item) {
    const ev = eventOf(item);
    return String(item?.id || ev?.id || ev?.mail_key || "").trim();
  }

  function metaOf(item, channelLabel) {
    const ev = eventOf(item);
    const parts = [
      channelLabel,
      ev?.mail_type,
      ev?.source_type,
      ev?.phase || ev?.phase_tag,
      item?.enqueued_at ? new Date(item.enqueued_at).toLocaleString("no-NO") : null
    ];

    return parts
      .map(function (part) { return String(part || "").trim(); })
      .filter(Boolean)
      .join(" · ");
  }

  function bodyLinesOf(item) {
    const ev = eventOf(item);
    const raw = Array.isArray(ev?.situation)
      ? ev.situation
      : [ev?.summary || ev?.body || item?.body || ""];

    return raw
      .map(function (line) { return String(line || "").trim(); })
      .filter(Boolean)
      .slice(0, 4);
  }

  function pendingActionItems() {
    const split = splitInbox();
    return (split.messages || [])
      .concat(split.unknown || [], split.workday || [])
      .filter(isActionableInboxItem);
  }

  // Ids that are active answerable actions in the current day phase (or the single active
  // inbox fallback). The active id may render a direct answer surface here; all other
  // ids stay passive so archived/open threads never borrow choices from another mail.
  function getNextActionOwnedIds() {
    const ids = new Set();

    const current = window.CivicationNextActionSelector?.getCurrent?.();
    if (current && current.id) ids.add(String(current.id).trim());

    const inspection = window.CivicationDayProgression?.inspect?.();
    const bundle = inspection?.phaseBundle || null;
    if (bundle) {
      [bundle.pendingItems, bundle.queuedItems].forEach(function (pool) {
        if (!Array.isArray(pool)) return;
        pool.forEach(function (row) {
          const id = String(row?.id || "").trim();
          const hasChoices = Array.isArray(row?.choices) ? row.choices.length > 0 : !!row?.hasChoices;
          const taskGate = String(row?.mail_type || row?.type || row?.slot || "").toLowerCase().includes("task_gate");
          if (id && (hasChoices || taskGate)) ids.add(id);
        });
      });
    }

    return ids;
  }

  function buildNextActionLinkHtml() {
    return `
      <div class="civi-inbox-card-actions civi-inbox-card-next-action">
        <span class="civi-inbox-handled-note muted">Åpne meldingen for å svare.</span>
        <button class="civi-btn secondary" type="button" data-civi-open-next-action="1">Åpne innboksen</button>
      </div>
    `;
  }

  function isCurrentNextActionItem(item) {
    const mailId = mailIdOf(item);
    if (!mailId) return false;
    const current = window.CivicationNextActionSelector?.getCurrent?.();
    return !!current && String(current.id || "").trim() === mailId;
  }

  function renderDirectChoicesHtml(item) {
    const mailId = mailIdOf(item);
    const ev = eventOf(item);
    const choices = Array.isArray(ev?.choices) ? ev.choices : [];
    const buttons = choices.map(function (choice) {
      const choiceId = String(choice?.id || "").trim();
      if (!choiceId) return "";
      return `<button class="civi-btn" type="button" data-civi-inbox-answer="1" data-mail-id="${escapeHtml(mailId)}" data-choice-id="${escapeHtml(choiceId)}">${escapeHtml(choice?.label || choice?.text || choiceId)}</button>`;
    }).join("");

    if (!buttons) return "";
    return `
      <div class="civi-inbox-card-actions civi-inbox-card-choices" role="group" aria-label="Svaralternativer">
        ${buttons}
      </div>
    `;
  }

  function pendingMilestones() {
    const split = splitInbox();
    return (split.milestones || []).filter(isOpenItem);
  }

  function visibleMessages() {
    const split = splitInbox();
    return (split.messages || [])
      .concat(split.unknown || [], split.milestones || [], split.system || [])
      .filter(isOpenItem);
  }

  function openInboxPopup() {
    // One entry point for both delivered and queued day mail; no extra mail dialog.
    if (typeof window.CivicationNextActionUI?.open === "function") {
      window.CivicationNextActionUI.open();
      return;
    }
    const section = document.getElementById("civiInboxSection");
    if (!section || !window.CivicationMiniSectionsUI?.openPopup) return;

    window.CivicationMiniSectionsUI.openPopup(section, {
      label: "Innkommende",
      accent: "📨"
    });
  }

  function setTopCard(model) {
    const card = document.getElementById("civiTopActionCard");
    if (!card) return false;

    const title = card.querySelector(".civi-top-action-title");
    const summary = card.querySelector(".civi-top-action-summary");
    const chip = card.querySelector(".civi-top-action-chip");
    const btn = /** @type {HTMLElement} */ (card.querySelector("[data-civi-top-action]"));

    card.classList.toggle("is-urgent", model.mode === "urgent");
    card.classList.toggle("is-calm", model.mode !== "urgent");
    card.classList.toggle("is-milestone", model.tone === "milestone");

    if (title) title.textContent = model.title;
    if (summary) summary.textContent = model.summary;
    if (chip) chip.textContent = model.chip;
    if (btn) btn.textContent = model.action;

    const handler = function () {
      if (model.openInbox) openInboxPopup();
    };

    if (btn) btn.onclick = handler;
    card.onclick = function (event) {
      const target = /** @type {Element} */ (event.target);
      if (target && target.closest("button")) return;
      handler();
    };

    return true;
  }

  function buildTopModel() {
    const milestones = pendingMilestones();
    if (milestones.length) {
      const first = milestones[0];
      return {
        mode: "urgent",
        tone: "milestone",
        title: "Ny milepæl",
        summary: titleOf(first),
        chip: "Milepæl",
        action: "Se milepæl",
        openInbox: true
      };
    }

    // The phase selector identifies the active message. Its choices are shown
    // in the same inbox as ordinary personal/job mail, not a second dialog.
    const current = window.CivicationNextActionSelector?.getCurrent?.();
    if (current && current.id) {
      const metaKind = String(current.mail_type || current.phaseLabel || "Melding").trim();
      const isAdvance = current.canAdvancePhase === true || current.source === "day_phase_advance";
      return {
        mode: "urgent",
        title: isAdvance ? "Dagen er ferdig" : "Ubesvart melding",
        summary: metaKind ? `${current.subject} · ${metaKind}` : current.subject,
        chip: isAdvance ? "Fase klar" : "Krever svar",
        action: isAdvance ? "Se dagslutt" : "Åpne innboksen",
        openInbox: true
      };
    }

    const messages = visibleMessages();
    if (messages.length) {
      const first = messages[0];
      const actionable = isActionableInboxItem(first);
      return {
        mode: "info",
        title: actionable ? "Ny melding" : "Statusmelding i innboksen",
        summary: `${titleOf(first)} · ${kindOf(first)}`,
        chip: actionable ? "Melding" : "Status",
        action: "Åpne innkommende",
        openInbox: true
      };
    }

    return {
      mode: "calm",
      title: "Ingen handling krever svar nå",
      summary: "Innboksen er ajour. Du kan utforske valgt livsområde i roligere tempo.",
      chip: "Stabilt",
      action: "Åpne innboksen",
      openInbox: true
    };
  }

  function normalizeStabilityLabel(value) {
    const raw = String(value || "").trim();
    if (!raw) return "";
    const key = raw.toLowerCase();
    if (key === "stable") return "Stabil";
    if (key === "warning") return "Advarsel";
    if (key === "fired") return "Avsluttet";
    return raw;
  }

  function buildAnswerSummaryHtml() {
    if (!lastAnswerSummary) return "";
    const parts = [];
    if (lastAnswerSummary.choiceLabel) parts.push(`Valg: ${escapeHtml(lastAnswerSummary.choiceLabel)}`);
    if (lastAnswerSummary.effect !== "") parts.push(`Effekt: ${escapeHtml(lastAnswerSummary.effect)}`);
    if (lastAnswerSummary.stability) parts.push(`Stabilitet: ${escapeHtml(lastAnswerSummary.stability)}`);
    if (lastAnswerSummary.subject) parts.push(`Sak: ${escapeHtml(lastAnswerSummary.subject)}`);

    return `
      <section class="civi-inbox-answer-summary">
        <h3>Siste konsekvens</h3>
        ${lastAnswerSummary.feedback ? `<p>${escapeHtml(lastAnswerSummary.feedback)}</p>` : ""}
        <div class="civi-inbox-answer-meta">${parts.map(function (part) { return `<span>${part}</span>`; }).join("")}</div>
      </section>
    `;
  }

  function renderChoiceButtons(item, ownedIds) {
    // Choices belong to the one currently active action above the history.
    // Earlier/later pending messages are read-only until their turn arrives.
    if (hasEmbeddedInboxActions()) {
      return isOpenItem(item) && (hasChoices(item) || ownedIds?.has?.(mailIdOf(item)))
        ? '<p class="civi-inbox-handled-note muted">Venter på tur i dagsforløpet. Svar på den aktive meldingen øverst først.</p>'
        : "";
    }
    const mailId = mailIdOf(item);
    if (!isOpenItem(item) || !mailId) return "";

    if (hasChoices(item) && isCurrentNextActionItem(item)) {
      return renderDirectChoicesHtml(item);
    }

    if (ownedIds?.has?.(mailId)) return buildNextActionLinkHtml();

    return "";
  }

  function renderInboxCard(item, channelLabel, ownedIds) {
    const lines = bodyLinesOf(item);
    const pending = isOpenItem(item);
    const statusLabel = pending ? "Åpen" : "Avklart";
    const meta = metaOf(item, channelLabel);

    return `
      <article class="civi-inbox-card ${pending ? "is-pending" : "is-resolved"}">
        <div class="civi-inbox-card-head">
          <div class="civi-inbox-card-title-wrap">
            <div class="civi-inbox-card-kickers">
              <span class="civi-inbox-channel-chip">${escapeHtml(channelLabel)}</span>
              <span class="civi-inbox-status">${escapeHtml(statusLabel)}</span>
            </div>
            <h4>${escapeHtml(titleOf(item))}</h4>
            <p class="civi-inbox-sender">Fra: ${escapeHtml(fromOf(item))}</p>
          </div>
        </div>
        ${meta ? `<div class="civi-inbox-meta muted">${escapeHtml(meta)}</div>` : ""}
        ${lines.length ? `<div class="civi-inbox-body">${lines.map(function (line) {
          return `<p>${escapeHtml(line)}</p>`;
        }).join("")}</div>` : ""}
        ${renderChoiceButtons(item, ownedIds)}
      </article>
    `;
  }

  function isResolved(item) {
    const status = normalize(item?.status);
    return item?.resolved === true || status === "resolved" || status === "answered" || status === "closed";
  }

  function renderInboxSection(label, intro, items, emptyText, ownedIds) {
    const visible = (Array.isArray(items) ? items : [])
      .filter(function (item) { return item && item.deleted !== true && item.archived !== true; });

    const openItems = visible.filter(function (item) {
      return isOpenItem(item) && !(hasEmbeddedInboxActions() && isCurrentNextActionItem(item));
    });

    const resolvedItems = visible.filter(function (item) { return !isOpenItem(item) || isResolved(item); });
    // Exclude the active message from the archive rows, but still count it as
    // open in its channel. Otherwise the user sees "0 åpne" above a mail
    // that is waiting for their answer in the same inbox.
    const activeCount = hasEmbeddedInboxActions()
      ? visible.filter(function (item) { return isOpenItem(item) && isCurrentNextActionItem(item); }).length
      : 0;
    const pendingCount = openItems.length + activeCount;

    return `
      <section class="civi-inbox-channel-section">
        <div class="civi-inbox-channel-head">
          <div>
            <h3>${escapeHtml(label)}</h3>
            <p class="muted">${escapeHtml(intro)}</p>
          </div>
          <strong>${pendingCount} åpne</strong>
        </div>
        <div class="civi-inbox-channel-list">
          ${openItems.length
            ? openItems.map(function (item) { return renderInboxCard(item, label, ownedIds); }).join("")
            : `<div class="civi-inbox-empty muted">${activeCount
              ? "Den aktive meldingen vises øverst i innboksen."
              : escapeHtml(emptyText)}</div>`
          }
          ${resolvedItems.length
            ? `
              <details class="civi-inbox-history">
                <summary>Vis gamle meldinger (${resolvedItems.length})</summary>
                <div class="civi-inbox-history-list">
                  ${resolvedItems.map(function (item) { return renderInboxCard(item, label, ownedIds); }).join("")}
                </div>
              </details>
            `
            : ""
          }
        </div>
      </section>
    `;
  }

  function answerFromInbox(button) {
    const mailId = String(button?.getAttribute("data-mail-id") || "").trim();
    const rawChoiceId = button?.getAttribute("data-choice-id");
    const choiceId = rawChoiceId == null ? null : String(rawChoiceId).trim();
    if (!mailId) return;

    button.disabled = true;

    const result = window.CivicationMailEngine?.answerMail
      ? window.CivicationMailEngine.answerMail(mailId, choiceId)
      : window.HG_CiviEngine?.answer?.(mailId, choiceId);

    Promise.resolve(result)
      .then(function (answerResult) {
        if (answerResult?.ok === false) {
          lastAnswerSummary = {
            choiceLabel: "",
            feedback: answerResult?.reason ? "Kunne ikke svare på mail (" + answerResult.reason + ")." : "Kunne ikke svare på mail.",
            effect: "",
            stability: "",
            subject: ""
          };
          button.disabled = false;
          scheduleRefresh();
          return answerResult;
        }
        const inboxItem = getInbox().find(function (item) { return mailIdOf(item) === mailId; });
        const eventObj = eventOf(inboxItem) || {};
        const selectedChoice = Array.isArray(eventObj?.choices)
          ? eventObj.choices.find(function (row) { return String(row?.id || "").trim() === choiceId; }) || null
          : null;
        lastAnswerSummary = {
          choiceLabel: selectedChoice?.label || "",
          feedback: selectedChoice?.feedback || answerResult?.feedback || eventObj?.feedback || "",
          effect: answerResult?.effect ?? selectedChoice?.effect ?? "",
          stability: normalizeStabilityLabel(answerResult?.stability),
          subject: eventObj?.subject || eventObj?.title || ""
        };
        try { window.dispatchEvent(new Event("updateProfile")); } catch {}
        scheduleRefresh();
        scheduleInboxSectionsRefresh();
      })
      .catch(function (error) {
        button.disabled = false;
        lastAnswerSummary = { choiceLabel: "", feedback: "Kunne ikke svare på mail.", effect: "", stability: "", subject: "" };
        scheduleRefresh();
        if (window.DEBUG) console.warn("[CivicationInboxTopActionUI] Kunne ikke svare på mail", error);
      });
  }


  function wireInboxResponses(host) {
    host.querySelectorAll("[data-civi-fagsvar-intake]").forEach(function (button) {
      button.addEventListener("click", function () {
        const result = recordLillebekkFagsvarIntake();
        if (result.ok) renderInboxSections();
        else {
          const message = button.closest("[data-civi-lillebekk-fagsvar]")?.querySelector("[data-civi-fagsvar-intake-error]");
          if (message) message.textContent = result.reason;
        }
      });
    });
    host.querySelectorAll("[data-civi-fagsvar-assess]").forEach(function (button) {
      button.addEventListener("click", function () {
        const card = button.closest("[data-civi-fagsvar-doc-id]");
        const result = recordLillebekkFagsvarAssessment(
          String(button.getAttribute("data-doc-id") || ""),
          card?.querySelector("[data-civi-fagsvar-action]")?.value || "",
          card?.querySelector("[data-civi-fagsvar-reason]")?.value || "");
        if (result.ok) renderInboxSections();
        else {
          const message = card?.querySelector("[data-civi-fagsvar-assess-error]");
          if (message) message.textContent = result.reason;
        }
      });
    });
    host.querySelectorAll("[data-civi-fagsvar-followup]").forEach(function (button) {
      button.addEventListener("click", function () {
        const card = button.closest("[data-civi-fagsvar-followup-editor]");
        const result = recordLillebekkFagsvarFollowup(
          card?.querySelector("[data-civi-fagsvar-recommendation]")?.value || "");
        if (result.ok) renderInboxSections();
        else {
          const message = card?.querySelector("[data-civi-fagsvar-followup-error]");
          if (message) message.textContent = result.reason;
        }
      });
    });
    host.querySelectorAll("[data-civi-lillebekk-leader-return]").forEach(function (button) {
      button.addEventListener("click", function () {
        const result = recordLillebekkLeaderReturn();
        if (result.ok) renderInboxSections();
        else {
          const msg = button.closest("[data-civi-lillebekk-leader-review]")?.querySelector("[data-civi-leader-error]");
          if (msg) msg.textContent = result.reason;
        }
      });
    });
    host.querySelectorAll("[data-civi-lillebekk-leader-response]").forEach(function (button) {
      button.addEventListener("click", function () {
        const card = button.closest("[data-civi-leader-point-id]");
        const result = recordLillebekkLeaderResponse(
          String(button.getAttribute("data-point-id") || ""),
          card?.querySelector("[data-civi-leader-action]")?.value || "",
          card?.querySelector("[data-civi-leader-reason]")?.value || "");
        if (result.ok) renderInboxSections();
        else {
          const msg = card?.querySelector("[data-civi-leader-point-error]");
          if (msg) msg.textContent = result.reason;
        }
      });
    });
    host.querySelectorAll("[data-civi-lillebekk-revised-memo]").forEach(function (button) {
      button.addEventListener("click", function () {
        const card = button.closest("[data-civi-leader-revised-editor]");
        const result = recordLillebekkCorrectedMemo(
          card?.querySelector("[data-civi-leader-revised-recommendation]")?.value || "");
        if (result.ok) renderInboxSections();
        else {
          const msg = card?.querySelector("[data-civi-leader-revised-error]");
          if (msg) msg.textContent = result.reason;
        }
      });
    });
    host.querySelectorAll("[data-civi-lillebekk-crosscheck]").forEach(function (button) {
      button.addEventListener("click", function () {
        const card = button.closest("[data-civi-lillebekk-check-id]");
        const result = recordLillebekkComparison(
          String(button.getAttribute("data-check-id") || ""),
          card?.querySelector("[data-civi-crosscheck-outcome]")?.value || "",
          card?.querySelector("[data-civi-crosscheck-reason]")?.value || "");
        if (result.ok) renderInboxSections();
        else {
          const message = card?.querySelector("[data-civi-lillebekk-check-error]");
          if (message) message.textContent = result.reason;
        }
      });
    });
    host.querySelectorAll("[data-civi-lillebekk-draft]").forEach(function (button) {
      button.addEventListener("click", function () {
        const card = button.closest("[data-civi-lillebekk-draft-editor]");
        const result = recordLillebekkSaksframlegg(
          card?.querySelector("[data-civi-draft-recommendation]")?.value || "");
        if (result.ok) renderInboxSections();
        else {
          const message = card?.querySelector("[data-civi-lillebekk-draft-error]");
          if (message) message.textContent = result.reason;
        }
      });
    });
    host.querySelectorAll("[data-civi-lillebekk-exhibit]").forEach(function (button) {
      button.addEventListener("click", function () {
        const result = recordLillebekkExhibitDecision(
          String(button.getAttribute("data-doc-id") || ""),
          String(button.getAttribute("data-choice-id") || ""));
        if (result.ok) renderInboxSections();
        else {
          const message = button.closest(".civi-lillebekk-exhibit")?.querySelector("[data-civi-lillebekk-exhibit-error]");
          if (message) message.textContent = result.reason;
        }
      });
    });
    host.querySelectorAll("[data-civi-lillebekk-receipt]").forEach(function (button) {
      button.addEventListener("click", function () {
        const card = button.closest(".civi-inbox-card");
        const read = function (selector) { return card?.querySelector(selector)?.value || ""; };
        const result = recordLillebekkDocumentReceipt(
          String(button.getAttribute("data-topic-id") || ""),
          read("[data-civi-document-ref]"), read("[data-civi-document-sender]"),
          read("[data-civi-document-description]"));
        if (result.ok) renderInboxSections();
        else {
          const message = card?.querySelector("[data-civi-lillebekk-error]");
          if (message) message.textContent = result.reason;
        }
      });
    });
    host.querySelectorAll("[data-civi-lillebekk-assess]").forEach(function (button) {
      button.addEventListener("click", function () {
        const card = button.closest(".civi-inbox-card");
        const result = recordLillebekkDocumentAssessment(
          String(button.getAttribute("data-topic-id") || ""),
          card?.querySelector("[data-civi-assessment-outcome]")?.value || "",
          card?.querySelector("[data-civi-assessment-reason]")?.value || "");
        if (result.ok) renderInboxSections();
        else {
          const message = card?.querySelector("[data-civi-lillebekk-error]");
          if (message) message.textContent = result.reason;
        }
      });
    });
    host.querySelectorAll("[data-civi-lillebekk-review]").forEach(function (button) {
      button.addEventListener("click", function () {
        if (button.disabled) return;
        const result = recordLillebekkReviewAction(
          String(button.getAttribute("data-topic-id") || ""),
          String(button.getAttribute("data-review-action") || ""));
        if (result.ok) renderInboxSections();
      });
    });
    host.querySelectorAll("[data-civi-inbox-answer]").forEach(function (button) {
      button.addEventListener("click", function () {
        answerFromInbox(button);
      });
    });
    host.querySelectorAll("[data-civi-open-next-action]").forEach(function (button) {
      button.addEventListener("click", function () {
        if (typeof window.CivicationNextActionUI?.open === "function") {
          window.CivicationNextActionUI.open();
        }
      });
    });
  }

  function renderInboxSections() {
    const host = document.getElementById("civiInbox");
    if (!host) return false;

    const split = splitInboxByMessageChannel();
    const job = split.job || [];
    // Uklassifiserte meldinger hører fortsatt til samme underliggende store;
    // de vises med personlige meldinger slik at ingenting skjules ved usikker klassifisering.
    const privateMessages = (split.private || []).concat(split.unknown || []);
    const systemMessages = split.system || [];

    const ownedIds = getNextActionOwnedIds();

    const markup = `
      <div class="civi-inbox-sections" data-civi-inbox-sections="1">
        ${buildAnswerSummaryHtml()}
        ${lillebekkReviewHtml()}
        ${renderInboxSection(
          "Jobbmail",
          "Arbeid, stilling, rolleprogresjon, arbeidsdag, konflikter, forfremmelse, stagnasjon og oppsigelse.",
          job,
          "Ingen jobbmail akkurat nå.",
          ownedIds
        )}
        ${renderInboxSection(
          "Personlige meldinger",
          "Kveld, fritid, private relasjoner og livshendelser utenfor jobblogikken.",
          privateMessages,
          "Ingen personlige meldinger akkurat nå.",
          ownedIds
        )}
        ${systemMessages.length ? renderInboxSection(
          "System",
          "Statusmeldinger og tekniske beskjeder.",
          systemMessages,
          "Ingen systemmeldinger.",
          ownedIds
        ) : ""}
      </div>
    `;

    host.innerHTML = markup;
    // The current phase's action may be queued and not yet in MailEngine.getInbox.
    // Render that same action above the message history, in the existing inbox.
    window.CivicationNextActionUI?.render?.();

    wireInboxResponses(host);
    return true;
  }

  function refreshTopAction() {
    // The home/section controller also accounts for housing, workday,
    // relationships and debates. It is the sole owner of the top card.
    // InboxTopActionUI owns the inbox rows, not competing action priorities.
    if (window.CivicationMiniSectionsUI?.ownsTopAction) return false;
    return setTopCard(buildTopModel());
  }

  function scheduleRefresh() {
    window.setTimeout(refreshTopAction, 0);
    window.setTimeout(refreshTopAction, 80);
    window.setTimeout(refreshTopAction, 260);
  }

  function scheduleInboxSectionsRefresh() {
    window.setTimeout(renderInboxSections, 0);
    window.setTimeout(renderInboxSections, 80);
    window.setTimeout(renderInboxSections, 260);
  }

  function wrapMiniRefresh() {
    const api = window.CivicationMiniSectionsUI;
    if (!api || api.__civiInboxTopActionWrapped) return;

    const originalRefresh = api.refresh;
    api.refresh = function wrappedRefresh() {
      const result = typeof originalRefresh === "function"
        ? originalRefresh.apply(this, arguments)
        : undefined;
      scheduleRefresh();
      scheduleInboxSectionsRefresh();
      return result;
    };

    api.__civiInboxTopActionWrapped = true;
  }

  function wrapLegacyInboxRenderer() {
    const originalRender = /** @type {any} */ (window.renderCivicationInbox);
    if (typeof originalRender !== "function") return;
    if (originalRender.__civiInboxSectionsWrapped) return;

    const wrappedRender = function wrappedRenderCivicationInbox() {
      const result = originalRender.apply(this, arguments);
      scheduleInboxSectionsRefresh();
      return result;
    };

    wrappedRender.__civiInboxSectionsWrapped = true;
    wrappedRender.__civiOriginalRender = originalRender;
    window.renderCivicationInbox = wrappedRender;
  }

  function boot() {
    wrapMiniRefresh();
    wrapLegacyInboxRenderer();
    scheduleRefresh();
    scheduleInboxSectionsRefresh();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }

  [
    "civi:inboxChanged",
    "civi:dataReady",
    "civi:booted",
    "updateProfile",
    "civi:homeChanged"
  ].forEach(function (eventName) {
    window.addEventListener(eventName, function () {
      scheduleRefresh();
      scheduleInboxSectionsRefresh();
    });
  });

  window.CivicationInboxTopActionUI = {
    refresh: refreshTopAction,
    renderSections: renderInboxSections,
    getActionable: pendingActionItems,
    getMessages: visibleMessages,
    splitChannels: splitInboxByMessageChannel,
    getLillebekkReviewModel: lillebekkReviewModel,
    recordLillebekkReviewAction,
    recordLillebekkDocumentReceipt,
    recordLillebekkDocumentAssessment,
    getLillebekkCaseExhibits: lillebekkExhibitsFor,
    recordLillebekkExhibitDecision,
    getLillebekkSaksframleggModel: lillebekkSaksframleggModel,
    recordLillebekkComparison,
    recordLillebekkSaksframlegg,
    getLillebekkLeaderReviewModel: lillebekkLeaderReviewModel,
    recordLillebekkLeaderReturn,
    recordLillebekkLeaderResponse,
    recordLillebekkCorrectedMemo,
    getLillebekkFagsvarModel: lillebekkFagsvarModel,
    recordLillebekkFagsvarIntake,
    recordLillebekkFagsvarAssessment,
    recordLillebekkFagsvarFollowup
  };
})();
