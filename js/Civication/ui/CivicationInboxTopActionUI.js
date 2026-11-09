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
    // A later unsafe change to the original document comparison must stop new
    // follow-up notes, even if all three fictional expert replies were reviewed.
    const ready = !!intake && leader.memo.ready &&
      docs.every(function (doc) { return doc.safe; });
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
    if (model && !model.leader.memo.ready) {
      return { ok: false, reason: "Den opprinnelige kildeavstemmingen er blitt uforsvarlig og må korrigeres før et nytt fagnotat." };
    }
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


  // A narrow document-control task following the three authored expert replies.
  // All extracts are fictional materials for this game, not surveyed real-world facts.
  const LILLEBEKK_KONTROLLBILAG = [
    {
      id: "ganglinje", ref: "LBK-KONT-07", title: "Skolevei – to planutdrag for samme ganglinje",
      evidence: [
        { ref: "LBK-SKISSE-07A", label: "Ganglinjeskisse, foreløpig", text: "Punkt B ved adkomst: inntegnet fri gangbredde 1,55 m i ordinær situasjon. Ingen befaring er dokumentert." },
        { ref: "LBK-DRIFT-07B", label: "Utbyggers logistikkplan, utkast", text: "Punkt B: skissen viser om lag 0,85 m fri passasje ved varelevering, med foreslått aktivitet kl. 07.45–08.15. Ingen godkjent trafikkavviklingsplan er vedlagt." }
      ],
      discrepancy: "De to utkastene beskriver ulike tilgjengelige gangarealer på samme punkt. Skolebarn kan passere under den foreslåtte leveringstiden; dette er ikke vurdert trafikkfaglig.",
      safeId: "krev_samordnet_skoleveikontroll", safeLabel: "Journalfør motstriden og bestill befaring, sikt- og leveringskontroll",
      unsafeId: "regn_ganglinje_som_sikret", unsafeLabel: "Bruk 1,55 m-skissen som dokumentasjon på trygg skolevei",
      next: "Trafikkfag må kontrollere punkt B, leveringsvinduet og midlertidig ganglinje før sikkerhet eller rekkefølgetidspunkt vurderes."
    },
    {
      id: "flomvei", ref: "LBK-KONT-08", title: "Overvann – flomveipil mot terrengsnitt",
      evidence: [
        { ref: "LBK-KART-08A", label: "Forslag til plankart", text: "Flomveipil gjennom grøntdraget er tegnet mot øst. Kartutsnittet viser ikke kotegrunnlag ved lavpunktet." },
        { ref: "LBK-SNITT-08B", label: "Foreløpig terrengsnitt A–A", text: "Ved de to endene står vest +6,20 og øst +6,80. Snittet oppgir ikke hindringer, kulvert eller hvordan vann ledes mot den høyere koteverdien i øst." }
      ],
      discrepancy: "Tegnet pil og oppgitt terrengsnitt støtter ikke hverandre uten ytterligere teknisk forklaring. Det er ikke grunnlag for å betegne flomveien som kontrollert.",
      safeId: "krev_koter_og_flomveikontroll", safeLabel: "Registrer kart-/snittavviket og krev høyder og hydraulisk vurdering",
      unsafeId: "godkjenn_føreslått_flomvei", unsafeLabel: "Anse flomveien sikret fordi pilen er tegnet inn",
      next: "Overvannsfag må dokumentere retning, høyder, nabovirkning og eventuelle tiltak før planbestemmelsen kan kvalitetssikres."
    },
    {
      id: "rekkefolge", ref: "LBK-KONT-09", title: "Planjuss – to ulike tidspunkt for gangforbindelsen",
      evidence: [
        { ref: "LBK-BEST-09A", label: "Utkast til planbestemmelse § 4.1", text: "Gangforbindelsen skal være opparbeidet før første bolig tas i bruk. Utkastet er ikke lovlighetskontrollert." },
        { ref: "LBK-UTB-09B", label: "Utbyggers forslag til endret ordlyd", text: "Gangforbindelsen skal være opparbeidet senest ved ferdigattest for hele prosjektet. Forslaget er ikke et akseptert vilkår." }
      ],
      discrepancy: "De to formuleringene viser forskjellige utløsningspunkter. Et ønske fra utbygger endrer ikke automatisk planbestemmelsen.",
      safeId: "krev_juridisk_versjonskontroll", safeLabel: "Sammenstill ordlyden og send rekkefølgeforslaget til intern juridisk kontroll",
      unsafeId: "innvilg_ferdigattestfrist", unsafeLabel: "Legg utbyggers ferdigattestfrist til grunn som godkjent",
      next: "Planjuss må kvalitetssikre konkret bestemmelsestekst opp mot faglige premisser og myndighetsnivå før eventuell behandling."
    }
  ];

  function lillebekkKontrollbilagModel() {
    const fag = lillebekkFagsvarModel();
    if (!fag?.latestNote) return null;
    const world = window.CivicationWorkWorld;
    const formal = world?.getWorkObject?.("by_radgiver_lillebekk_plan_case_001");
    if (!formal || formal.status === "closed" || formal.closed_at) return null;
    const history = Array.isArray(formal.history) ? formal.history : [];
    const docs = LILLEBEKK_KONTROLLBILAG.map(function (doc) {
      const prefix = "lillebekk_kontrollbilag_" + doc.id + "_v";
      const events = history.filter(function (e) { return String(e.id || "").startsWith(prefix); });
      const latest = events[events.length - 1] || null;
      return { ...doc, count: events.length, lastId: latest?.id || "",
        lastOutcome: latest?.outcome || "", lastNote: latest?.note || "",
        safe: latest?.outcome === doc.safeId };
    });
    const sourcesCurrent = !!fag.current && !!fag.ready;
    const ready = sourcesCurrent && docs.every(function (doc) { return doc.safe; });
    const signature = [fag.signature, fag.latestNote.id]
      .concat(docs.map(function (doc) { return doc.lastId; })).join("|");
    const reports = history.filter(function (e) {
      return String(e.id || "").startsWith("lillebekk_kontrollprotokoll_v");
    });
    const latestReport = reports[reports.length - 1] || null;
    return { fag, docs, sourcesCurrent, ready, signature, reportCount: reports.length,
      latestReport, current: !!latestReport && ready &&
        String(latestReport.note || "").endsWith("Kildeversjoner: " + signature) };
  }

  function recordLillebekkKontrollFunn(docId, choiceId, explanation) {
    const model = lillebekkKontrollbilagModel();
    const doc = model?.docs.find(function (item) { return item.id === docId; });
    if (!model?.sourcesCurrent || !doc || ![doc.safeId, doc.unsafeId].includes(choiceId)) {
      return { ok: false, reason: "Et gjeldende, supplerende fagnotat må foreligge før kontroll av disse bilagene." };
    }
    const reason = String(explanation || "").replace(/\s+/g, " ").trim().slice(0,650);
    if (reason.length < 65) {
      return { ok: false, reason: "Beskriv konkret forskjellen mellom bilagene, ansvarlig fagfunksjon og videre kontroll (minst 65 tegn)." };
    }
    const label = choiceId === doc.safeId ? doc.safeLabel : doc.unsafeLabel;
    const note = "FIKTIV KONTROLLAVSTEMMING " + doc.ref + ": " + doc.title +
      ". Bilag: " + doc.evidence.map(function (e) {
        return e.ref + " (" + e.text + ")";
      }).join(" mot ") + ". Motstrid eller dokumentmangel: " + doc.discrepancy +
      " Spillerens valg: " + label + ". Begrunnelse: " + reason +
      ". Neste reelle kontrollbehov: " + doc.next +
      " Ingen befaring, beregning, juridisk kontroll eller godkjenning er automatisk utført.";
    if (doc.lastOutcome === choiceId && doc.lastNote === note) return { ok: true, alreadyLogged: true };
    if (doc.count >= 10 && !(doc.lastOutcome !== doc.safeId && choiceId === doc.safeId)) {
      return { ok: false, reason: "Revisjonsgrensen er nådd. Bare en faglig korrekt sluttkorrigering tillates." };
    }
    const world = window.CivicationWorkWorld;
    if (typeof world?.appendWorkObjectHistory !== "function") return { ok: false, reason: "Saksloggen er utilgjengelig." };
    const formal = world.getWorkObject("by_radgiver_lillebekk_plan_case_001");
    if (!formal || formal.status === "closed" || formal.closed_at) return { ok: false, reason: "Saken er avsluttet." };
    try {
      world.appendWorkObjectHistory(formal.work_object_id, {
        event_id: "lillebekk_kontrollbilag_" + doc.id + "_v" + (doc.count+1),
        scene_id: "lillebekk_kontrollbilag", choice_id: choiceId,
        outcome: choiceId, note, at: new Date().toISOString()
      });
      return { ok: true, alreadyLogged: false };
    } catch (error) {
      if (window.DEBUG) console.warn("[Civication] Kontrollbilag", error);
      return { ok: false, reason: "Kontrollavstemmingen kunne ikke journalføres." };
    }
  }

  function recordLillebekkKontrollprotokoll(recommendation) {
    const model = lillebekkKontrollbilagModel();
    if (!model?.sourcesCurrent) {
      return { ok: false, reason: "Tidligere kildeavstemming og supplerende fagnotat må være gjeldende." };
    }
    if (!model.ready) {
      return { ok: false, reason: "Avklar først alle tre motstridene på faglig forsvarlig måte." };
    }
    const text = String(recommendation || "").replace(/\s+/g, " ").trim().slice(0,850);
    if (text.length < 90) {
      return { ok: false, reason: "Beskriv tre konkrete kontrolloppgaver og hvem som må utføre dem (minst 90 tegn)." };
    }
    const open = model.fag.leader.memo.dossier.topics.filter(function (topic) {
      return topic.issue || !topic.documented || topic.reviewNeedLogged || topic.caveatLogged ||
        ["mangelfull","motstridende","fagkontroll"].includes(topic.assessmentOutcome);
    });
    const note = [
      "LILLEBEKK – INTERN KONTROLLPROTOKOLL (FIKTIVE BILAG, IKKE GODKJENT)",
      "Grunnlag: " + model.fag.latestNote.id,
      "1. Dokumentavstemminger",
      ...model.docs.map(function (doc) {
        return "- " + doc.ref + ": " + doc.lastNote;
      }),
      "2. Åpne temaer fra den opprinnelige plansaken",
      ...(open.length ? open.map(function (topic) {
        return "- " + topic.title + ": " + topic.status + ". " + (topic.assessmentNote || topic.next);
      }) : ["- Ingen åpne markører i dette uttrekket; ny faglig verifikasjon må fremdeles skje."]),
      "3. Rådgiverens anbefaling til neste kontrollrunde",
      text,
      "4. Status",
      "Bare dokumentmotstrider i fiktivt materiale er sammenholdt. Ingen eksterne målinger er bekreftet, fagavvik lukket, plan godkjent eller svar sendt til utbygger.",
      "Kildeversjoner: " + model.signature
    ].join("\n");
    if (model.latestReport?.note === note) return { ok: true, alreadyLogged: true };
    // Limit discretionary rewrites of an unchanged source snapshot, not the
    // legally useful correction trail. A changed source must always be able
    // to produce a new numbered protocol while retaining prior history.
    if (model.reportCount >= 10 && model.current) {
      return { ok: false, reason: "Uendret kildegrunnlag har nådd revisjonsgrensen. Ny protokoll krever endret og kontrollert grunnlag." };
    }
    const world = window.CivicationWorkWorld;
    if (typeof world?.appendWorkObjectHistory !== "function") return { ok: false, reason: "Saksloggen er utilgjengelig." };
    const formal = world.getWorkObject("by_radgiver_lillebekk_plan_case_001");
    if (!formal || formal.status === "closed" || formal.closed_at) return { ok: false, reason: "Saken er avsluttet." };
    try {
      world.appendWorkObjectHistory(formal.work_object_id, {
        event_id: "lillebekk_kontrollprotokoll_v" + (model.reportCount+1),
        scene_id: "lillebekk_kontrollbilag", choice_id: "journalfor_intern_kontrollprotokoll",
        outcome: "intern_kontrollprotokoll_ikke_godkjent", at: new Date().toISOString(), note
      });
      return { ok: true, alreadyLogged: false };
    } catch (error) {
      if (window.DEBUG) console.warn("[Civication] Kontrollprotokoll", error);
      return { ok: false, reason: "Protokollen kunne ikke journalføres." };
    }
  }


  // Fictional check results generated for this game. These are not actual
  // field measurements, hydraulic models, signed reports, or legal decisions.
  const LILLEBEKK_RESULTATBILAG = [
    {
      id: "ganglinje", ref: "LBK-RES-10",
      title: "Observasjonsark – ganglinje ved punkt B",
      sender: "Trafikkfaglig rådgiver (fiktivt kontrollutdrag)",
      findings: [
        "Utkast til registreringsark: fri passasje ved varelevering kl. 07.55 er oppgitt til 0,90 m. Etter varelevering kl. 09.20 er fri passasje oppgitt til 1,50 m.",
        "Det tidligere skissegrunnlaget oppga om lag 0,85 m i leveringsvinduet og 1,55 m ellers. Registreringsarket gjelder kun to tidspunkter, uten dokumentert representativitet, siktmåling eller vurdering av sikkerhet for skolebarn."
      ],
      assessment: "Tallene underbygger at varelevering kan innsnevre passasjen, men to observasjoner kan ikke fastslå at skoleveien oppfyller krav til sikkerhet eller tilgjengelighet.",
      safeId: "registrer_kontrollbehov_for_ganglinje",
      safeLabel: "Registrer innsnevringen og krev revidert vareleverings- og ganglinjeløsning",
      unsafeId: "godkjenn_ganglinje_paa_to_maalinger",
      unsafeLabel: "Godkjenn skoleveien ut fra de to observasjonene",
      action: "Trafikkfag må undersøke ganglinje, sikt, leveringstidspunkt og tiltak før første innflytting."
    },
    {
      id: "overvann", ref: "LBK-RES-11",
      title: "Foreløpig regneark – avrenning og fordrøyning",
      sender: "Overvannsfaglig rådgiver (fiktivt regneutdrag)",
      findings: [
        "I et avgrenset, hypotetisk beregningsscenario står tilført vannvolum oppført som 42 m³ og tilgjengelig fordrøyningsvolum som 26 m³. Enkel differanse er 16 m³.",
        "Regnearket angir ikke infiltrasjon, kontrollert utløp, dimensjoneringsgrunnlag eller virkning for naboeiendommer. Flomveipilen fra tidligere plankartutkast er ikke kontrollert mot høydegrunnlaget."
      ],
      assessment: "Den foreløpige differansen på 16 m³ er ikke i seg selv en ferdig hydraulisk dimensjonering eller et bevis for en bestemt flomfare. Metodikk og resterende vannhåndtering mangler.",
      safeId: "krev_beregning_for_16m3_og_flomvei",
      safeLabel: "Registrer differansen 16 m³ og krev full beregning, utløp og høydekontroll",
      unsafeId: "godkjenn_magasin_paa_26m3",
      unsafeLabel: "Godkjenn overvannsløsningen med 26 m³ magasin",
      action: "Overvannsfag må dokumentere beregningspremisser, avrenningsvei, utløp og terreng før løsning eller planbestemmelse kan anses kontrollert."
    },
    {
      id: "planjuss", ref: "LBK-RES-12",
      title: "Juridisk merknadsark – tidspunkt for gangforbindelse",
      sender: "Planjurist (fiktivt merknadsutdrag)",
      findings: [
        "Merknad 1: Plankartutkastets gangforbindelse har fortsatt uavklart trasé og dokumentert leveringskonflikt ved punkt B.",
        "Merknad 2: Forslaget 'før første bolig tas i bruk' og utbyggers 'senest ved ferdigattest for hele prosjektet' er to forskjellige utløsningspunkter. Det foreligger ingen endelig vurdering av bestemmelsens ordlyd, hjemmel eller praktiske oppfølging."
      ],
      assessment: "Planjuss peker på et mulig behov for rekkefølgekrav, men har ikke godkjent noen formulering. Faglig begrunnelse, presist tidspunkt og myndighetsbehandling gjenstår.",
      safeId: "returner_ordlyd_for_juridisk_kontroll",
      safeLabel: "Send bestemmelsesutkast til intern kontroll sammen med trafikkpremissene",
      unsafeId: "godta_utbyggers_frist_som_vedtatt",
      unsafeLabel: "Behandle utbyggers ferdigattestfrist som vedtatt",
      action: "Planjurist og planleder må kvalitetssikre forslag til bestemmelse etter at trafikkfag har dokumentert hva som må være etablert før bruk."
    }
  ];

  function lillebekkKontrollresultatModel() {
    const kontroll = lillebekkKontrollbilagModel();
    if (!kontroll?.latestReport) return null;
    const world = window.CivicationWorkWorld;
    const formal = world?.getWorkObject?.("by_radgiver_lillebekk_plan_case_001");
    if (!formal || formal.status === "closed" || formal.closed_at) return null;
    const history = Array.isArray(formal.history) ? formal.history : [];
    const intake = history.find(function (event) {
      return event.id === "lillebekk_resultater_spillmottak_v1";
    }) || null;
    const docs = LILLEBEKK_RESULTATBILAG.map(function (doc) {
      const prefix = "lillebekk_resultatvurdering_" + doc.id + "_v";
      const matches = history.filter(function (event) {
        return String(event.id || "").startsWith(prefix);
      });
      const latest = matches[matches.length - 1] || null;
      return { ...doc, revisionCount: matches.length, lastId: latest?.id || "",
        lastOutcome: latest?.outcome || "", lastNote: latest?.note || "",
        safe: !!intake && latest?.outcome === doc.safeId };
    });
    const sourcesCurrent = !!kontroll.current && !!kontroll.ready;
    const ready = sourcesCurrent && !!intake && docs.every(function (doc) { return doc.safe; });
    const signature = [kontroll.signature, kontroll.latestReport.id]
      .concat(docs.map(function (doc) { return doc.lastId; })).join("|");
    const proposals = history.filter(function (event) {
      return String(event.id || "").startsWith("lillebekk_beslutningsgrunnlag_v");
    });
    const latestProposal = proposals[proposals.length - 1] || null;
    return { kontroll, intake, docs, sourcesCurrent, ready, signature,
      proposalCount: proposals.length, latestProposal, current: !!latestProposal && ready &&
        String(latestProposal.note || "").endsWith("Kildeversjoner: " + signature) };
  }

  function recordLillebekkResultatMottak() {
    const model = lillebekkKontrollresultatModel();
    if (!model?.sourcesCurrent || model.intake) {
      return { ok: false, reason: "Kontrollprotokollen må være gjeldende og resultatene ikke tidligere åpnet." };
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
        event_id: "lillebekk_resultater_spillmottak_v1",
        scene_id: "lillebekk_kontrollresultater", choice_id: "apne_fiktive_resultater",
        at: new Date().toISOString(), outcome: "fiktive_kontrollresultater_apnet",
        note: "Spilleren åpnet tre fiktive, forhåndsskrevne kontrollutdrag (" +
          LILLEBEKK_RESULTATBILAG.map(function (doc) { return doc.ref; }).join(", ") +
          "). Ingen faktisk oppmåling, befaring, ingeniørberegning, juridisk uttalelse, utsendelse eller vedtak er gjennomført."
      });
      return { ok: true };
    } catch (error) {
      if (window.DEBUG) console.warn("[Civication] Resultatmottak", error);
      return { ok: false, reason: "Mottaket kunne ikke journalføres." };
    }
  }

  function recordLillebekkResultatvurdering(docId, choiceId, justification) {
    const model = lillebekkKontrollresultatModel();
    const doc = model?.docs.find(function (item) { return item.id === docId; });
    if (!model?.sourcesCurrent || !model.intake || !doc ||
        ![doc.safeId, doc.unsafeId].includes(choiceId)) {
      return { ok: false, reason: "Åpne resultatutdragene med gjeldende kontrollprotokoll før vurdering." };
    }
    const reason = String(justification || "").replace(/\s+/g, " ").trim().slice(0, 650);
    if (reason.length < 45) {
      return { ok: false, reason: "Beskriv dokumentets begrensning, hva som faktisk er funnet og neste faglige kontroll." };
    }
    const label = choiceId === doc.safeId ? doc.safeLabel : doc.unsafeLabel;
    const note = "FIKTIV FAGLIG RESULTATVURDERING " + doc.ref + ": " + doc.title + ". " +
      doc.findings.join(" ") + " Begrensning: " + doc.assessment +
      " Spillerens konklusjon: " + label + ". Begrunnelse: " + reason +
      ". Åpen oppgave: " + doc.action +
      " Dette verifiserer ingen faktisk kontroll, gir intet vedtak og lukker ingen fagavvik.";
    if (doc.lastOutcome === choiceId && doc.lastNote === note) return { ok: true, alreadyLogged: true };
    if (doc.revisionCount >= 10 && !(doc.lastOutcome !== doc.safeId && choiceId === doc.safeId)) {
      return { ok: false, reason: "Revisjonsgrensen er nådd. Bare forsvarlig korrigering av siste feilvurdering tillates." };
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
        event_id: "lillebekk_resultatvurdering_" + doc.id + "_v" + (doc.revisionCount + 1),
        scene_id: "lillebekk_kontrollresultater", choice_id: choiceId, outcome: choiceId,
        at: new Date().toISOString(), note
      });
      return { ok: true, alreadyLogged: false };
    } catch (error) {
      if (window.DEBUG) console.warn("[Civication] Resultatvurdering", error);
      return { ok: false, reason: "Resultatvurderingen kunne ikke journalføres." };
    }
  }

  function recordLillebekkBeslutningsgrunnlag(recommendation) {
    const model = lillebekkKontrollresultatModel();
    if (!model?.sourcesCurrent) {
      return { ok: false, reason: "Dokumentgrunnlaget er utdatert. Korriger tidligere kontrollprotokoll først." };
    }
    if (!model.ready) {
      return { ok: false, reason: "Alle tre resultatbilag må vurderes forsvarlig før et oppdatert beslutningsgrunnlag." };
    }
    const text = String(recommendation || "").replace(/\s+/g, " ").trim().slice(0, 950);
    if (text.length < 70) {
      return { ok: false, reason: "Beskriv konkret oppfølging, ansvar og beslutningen du anbefaler planleder." };
    }
    const open = model.kontroll.fag.leader.memo.dossier.topics.filter(function (topic) {
      return topic.issue || !topic.documented || topic.reviewNeedLogged || topic.caveatLogged ||
        ["mangelfull", "motstridende", "fagkontroll"].includes(topic.assessmentOutcome);
    });
    const note = [
      "LILLEBEKK – OPPDATERT INTERNT BESLUTNINGSGRUNNLAG (IKKE VEDTAK)",
      "Forrige kontrollprotokoll: " + model.kontroll.latestReport.id,
      "Dokumenter: fiktive, metodisk begrensede spillutdrag – ikke faktisk verifiserte kontrollrapporter.",
      "",
      "1. Konkrete kontrollresultater og forbehold",
      ...model.docs.map(function (doc) {
        return "- " + doc.ref + " (" + doc.sender + "): " + doc.lastNote;
      }),
      "",
      "2. Åpne temaer i den formelle plansaken",
      ...(open.length ? open.map(function (topic) {
        return "- " + topic.title + ": " + topic.status + ". " + (topic.assessmentNote || topic.next);
      }) : ["- Ingen åpne markører i dette uttrekket. Ekstern verifikasjon er likevel ikke utført."]),
      "",
      "3. Rådgiverens anbefaling til planleder Elin",
      text,
      "",
      "4. Myndighet og neste beslutning",
      "Dette er et internt faglig arbeidsgrunnlag. Elin må avgjøre neste administrative steg etter dokumentkontroll. Ingen kontroller er erklært utført i virkeligheten, ingen avvik er lukket, og ingen politisk eller juridisk godkjenning er gitt.",
      "Kildeversjoner: " + model.signature
    ].join("\n");
    if (model.latestProposal?.note === note) return { ok: true, alreadyLogged: true };
    // Genuine changes to source evidence must remain amendable after the
    // discretionary rewrite cap. All previous editions remain journaled.
    if (model.proposalCount >= 10 && model.current) {
      return { ok: false, reason: "Maksimalt antall frie omskrivinger med uendret kildegrunnlag er nådd." };
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
        event_id: "lillebekk_beslutningsgrunnlag_v" + (model.proposalCount + 1),
        scene_id: "lillebekk_kontrollresultater",
        choice_id: "journalfor_internt_beslutningsgrunnlag",
        at: new Date().toISOString(), outcome: "internt_beslutningsgrunnlag_ikke_godkjent", note
      });
      return { ok: true, alreadyLogged: false };
    } catch (error) {
      if (window.DEBUG) console.warn("[Civication] Beslutningsgrunnlag", error);
      return { ok: false, reason: "Beslutningsgrunnlaget kunne ikke journalføres." };
    }
  }


  // An authored, fictional manager review of the existing decision basis.
  // The advisor records a recommendation; Elin's in-game response never exercises
  // actual municipal decision authority or confirms unverified field findings.
  const LILLEBEKK_LEDER_2_CHOICES = [
    { id: "returner_for_supplering", label: "Anbefal retur: innhent kontrollert skolevei-, overvanns- og juridisk grunnlag",
      outcome: "simulert_leder_retur_for_supplering" },
    { id: "forbered_intern_sakspakke", label: "Anbefal intern saksmappe med tydelig liste over uavklarte forhold",
      outcome: "simulert_leder_intern_forberedelse_med_forbehold" },
    { id: "send_til_planvedtak", label: "Anbefal direkte oversendelse til politisk planvedtak",
      outcome: "simulert_leder_avvist_uforsvarlig_oversendelse" }
  ];
  const LILLEBEKK_LEDER_2_TASKS = [
    {
      id: "trafikk", ref: "LBK-RES-10", title: "Trafikk: revidert ganglinje og leveringsrutine",
      managerNote: "Elin ber om en kontrollert plan for punkt B. Observasjonene 0,90 m og 1,50 m kan ikke erstatte vurdering av sikt, skolebarn, vareleveringsvindu og adkomst før innflytting.",
      safeId: "ettersporr_trafikkgrunnlag", safeLabel: "Opprett intern bestilling: befaring, sikkerhet og revidert leveringsplan",
      unsafeId: "lukk_skoleveiavvik", unsafeLabel: "Marker skoleveien som allerede trygg og ferdig kontrollert",
      action: "Innhent datert befaring, sikt- og risikoanalyse, driftsplan samt tidspunkt for trygg forbindelse før første bruk."
    },
    {
      id: "overvann", ref: "LBK-RES-11", title: "Overvann: forklaring av avrenning og flomvei",
      managerNote: "Elin ber om etterprøvbar dimensjonering. Tallene 42 m³ og 26 m³ gir differansen 16 m³, men sier ikke hvordan resten håndteres eller om flomveien faktisk fungerer.",
      safeId: "ettersporr_beregning_og_hoyder", safeLabel: "Opprett intern bestilling: beregning, utløp, høyder og nabovirkning",
      unsafeId: "lukk_overvannsavvik", unsafeLabel: "Marker overvannsløsningen som ferdig verifisert",
      action: "Etterspør premisser, infiltrasjon/utløp, flomveikart, kotesnitt, kapasitet og vurdering av naboer."
    },
    {
      id: "planjuss", ref: "LBK-RES-12", title: "Planjuss: rekkefølgekrav og ansvar",
      managerNote: "Elin ber om et presist, kontrollert bestemmelsesutkast. Ferdigattest for hele prosjektet er et innspill fra utbygger, ikke et kommunalt akseptert tidspunkt.",
      safeId: "ettersporr_juridisk_kontroll", safeLabel: "Opprett intern bestilling: kvalitetssikret ordlyd, premisser og prosessvar",
      unsafeId: "lov_utbygger_ferdigattest", unsafeLabel: "Gi utbygger tilsagn om frist og planvedtak",
      action: "Planjuss må kontrollere hjemmel, ordlyd, nødvendig trafikkfaglig premiss og myndighetsgrensen før prosessvar kan sendes."
    }
  ];

  function lillebekkNyLedervurderingModel() {
    const decision = lillebekkKontrollresultatModel();
    if (!decision?.latestProposal) return null;
    const world = window.CivicationWorkWorld;
    const formal = world?.getWorkObject?.("by_radgiver_lillebekk_plan_case_001");
    if (!formal || formal.status === "closed" || formal.closed_at) return null;
    const history = Array.isArray(formal.history) ? formal.history : [];
    const reviews = history.filter(function (event) {
      return String(event.id || "").startsWith("lillebekk_ny_ledervurdering_v");
    });
    const latestReview = reviews[reviews.length - 1] || null;
    const reviewSource = decision.signature + "|" + decision.latestProposal.id;
    const currentReview = !!decision.current && !!latestReview &&
      String(latestReview.note || "").endsWith("Kildeversjoner: " + reviewSource);
    const accepted = currentReview &&
      LILLEBEKK_LEDER_2_CHOICES.slice(0,2).some(function (choice) {
        return choice.outcome === latestReview.outcome;
      });
    const tasks = LILLEBEKK_LEDER_2_TASKS.map(function (task) {
      const prefix = "lillebekk_leder2_oppgave_" + task.id + "_v";
      const events = history.filter(function (event) {
        return String(event.id || "").startsWith(prefix);
      });
      const latest = events[events.length - 1] || null;
      const belongs = accepted && String(latest?.note || "").startsWith(
        "Lederhendelse: " + latestReview.id + ";");
      return { ...task, count: events.length, latestId: latest?.id || "",
        latestOutcome: latest?.outcome || "", latestNote: latest?.note || "",
        safe: !!belongs && latest?.outcome === task.safeId };
    });
    const ready = accepted && tasks.every(function (task) { return task.safe; });
    const signature = [reviewSource, latestReview?.id || ""]
      .concat(tasks.map(function (task) { return task.latestId; })).join("|");
    const reports = history.filter(function (event) {
      return String(event.id || "").startsWith("lillebekk_leder2_oppfolgingsnotat_v");
    });
    const latestReport = reports[reports.length - 1] || null;
    return { decision, reviewsCount: reviews.length, latestReview,
      currentReview, accepted, tasks, ready, signature, reportCount: reports.length,
      latestReport, current: !!latestReport && ready &&
        String(latestReport.note || "").endsWith("Kildeversjoner: " + signature) };
  }

  function recordLillebekkNyLedervurdering(choiceId, explanation) {
    const model = lillebekkNyLedervurderingModel();
    const choice = LILLEBEKK_LEDER_2_CHOICES.find(function (item) { return item.id === choiceId; });
    if (!model?.decision.current || !choice || model.accepted) {
      return { ok: false, reason: "Det kreves et gjeldende internt beslutningsgrunnlag uten allerede behandlet lederrespons." };
    }
    const reason = String(explanation || "").replace(/\s+/g, " ").trim().slice(0, 750);
    if (reason.length < 65) {
      return { ok: false, reason: "Begrunn anbefalingen med skolevei, overvann og myndighetsgrense (minst 65 tegn)." };
    }
    const reviewSource = model.decision.signature + "|" + model.decision.latestProposal.id;
    const intro = choice.id === "send_til_planvedtak"
      ? "SIMULERT ELIN-RESPONS: Anbefalingen avvises. Grunnlaget inneholder åpne sikkerhets-, overvanns- og planjuridiske kontrollbehov og kan ikke sendes til vedtak som ferdig utredet."
      : choice.id === "returner_for_supplering"
      ? "SIMULERT ELIN-RESPONS: Jeg returnerer saken for konkret faglig supplering. Dokumentlisten og de uavklarte funnene må følges opp før ny behandling."
      : "SIMULERT ELIN-RESPONS: Det er forsvarlig å utarbeide en intern oversikt over mangler og planlegge videre behandling. Det gir ikke klarsignal til formell oversendelse eller planvedtak.";
    const note = [
      "LILLEBEKK – SIMULERT NY LEDERVURDERING (IKKE PLANVEDTAK)",
      "Vurdert internt beslutningsgrunnlag: " + model.decision.latestProposal.id,
      "Rådgiverens forslag: " + choice.label,
      "Rådgiverens begrunnelse: " + reason,
      intro,
      "Åpne faglige leveranser (fiktive kildereferanser):",
      ...LILLEBEKK_LEDER_2_TASKS.map(function (task) {
        return "- " + task.ref + ": " + task.managerNote;
      }),
      "Ingen dokumentasjon er erklært faktisk verifisert. Ingen avvik er lukket eller dokumenter sendt ut.",
      "Kildeversjoner: " + reviewSource
    ].join("\n");
    if (model.latestReview?.note === note) return { ok: true, alreadyLogged: true };
    // An unsafe tenth recommendation must not permanently prevent its
    // correction; a new source version may always receive a new review.
    if (model.reviewsCount >= 10 && model.currentReview &&
        !(model.latestReview?.outcome === "simulert_leder_avvist_uforsvarlig_oversendelse" &&
          choice.id !== "send_til_planvedtak")) {
      return { ok: false, reason: "Gjeldende kildeversjon tillater ikke flere frie omskrivinger. Oppdater dokumentgrunnlaget." };
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
        event_id: "lillebekk_ny_ledervurdering_v" + (model.reviewsCount + 1),
        scene_id: "lillebekk_ny_ledervurdering",
        choice_id: choiceId, outcome: choice.outcome,
        at: new Date().toISOString(), note
      });
      return { ok: true, alreadyLogged: false };
    } catch (error) {
      if (window.DEBUG) console.warn("[Civication] Ny ledervurdering", error);
      return { ok: false, reason: "Lederresponsen kunne ikke journalføres." };
    }
  }

  function recordLillebekkLeder2Oppgave(taskId, actionId, explanation) {
    const model = lillebekkNyLedervurderingModel();
    const task = model?.tasks.find(function (item) { return item.id === taskId; });
    if (!model?.accepted || !task || ![task.safeId, task.unsafeId].includes(actionId)) {
      return { ok: false, reason: "En gjeldende, simulert ledervurdering må foreligge før oppfølging kan journalføres." };
    }
    const reason = String(explanation || "").replace(/\s+/g, " ").trim().slice(0, 700);
    if (reason.length < 60) {
      return { ok: false, reason: "Angi konkret dokumentleveranse, faglig ansvarlig og hva som ikke er kontrollert (minst 60 tegn)." };
    }
    const label = actionId === task.safeId ? task.safeLabel : task.unsafeLabel;
    const note = "Lederhendelse: " + model.latestReview.id + "; Fiktiv kontrolloppgave " +
      task.ref + " (" + task.title + "). Spillerens tiltak: " + label +
      ". Begrunnelse: " + reason + ". Dokumentkrav: " + task.action +
      " Ingen bestilling er faktisk sendt, ingen rapport er verifisert, og intet planvedtak er gitt.";
    if (task.latestOutcome === actionId && task.latestNote === note) {
      return { ok: true, alreadyLogged: true };
    }
    // A fresh leader review requires new source-bound task records even when
    // earlier reviews exhausted the discretionary revision limit.
    const belongsToCurrentReview = String(task.latestNote || "").startsWith(
      "Lederhendelse: " + model.latestReview.id + ";");
    if (task.count >= 10 && belongsToCurrentReview &&
        !(task.latestOutcome !== task.safeId && actionId === task.safeId)) {
      return { ok: false, reason: "Revisjonsgrensen er nådd. Bare faglig korrekt sluttkorrigering er tillatt." };
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
        event_id: "lillebekk_leder2_oppgave_" + task.id + "_v" + (task.count + 1),
        scene_id: "lillebekk_ny_ledervurdering", choice_id: actionId,
        outcome: actionId, at: new Date().toISOString(), note
      });
      return { ok: true, alreadyLogged: false };
    } catch (error) {
      if (window.DEBUG) console.warn("[Civication] Lederoppgave", error);
      return { ok: false, reason: "Oppgaven kunne ikke journalføres." };
    }
  }

  function recordLillebekkLeder2Oppfolgingsnotat(recommendation) {
    const model = lillebekkNyLedervurderingModel();
    if (!model?.ready) {
      return { ok: false, reason: "Gjeldende lederrespons og tre faglig forsvarlige oppfølgingsoppgaver kreves." };
    }
    const text = String(recommendation || "").replace(/\s+/g, " ").trim().slice(0, 900);
    if (text.length < 80) {
      return { ok: false, reason: "Beskriv hvem som skal levere hva og hvilke avvik som fortsatt må undersøkes (minst 80 tegn)." };
    }
    const open = model.decision.kontroll.fag.leader.memo.dossier.topics.filter(function (topic) {
      return topic.issue || !topic.documented || topic.reviewNeedLogged || topic.caveatLogged ||
        ["mangelfull", "motstridende", "fagkontroll"].includes(topic.assessmentOutcome);
    });
    const note = [
      "LILLEBEKK – INTERNT OPPFØLGINGSNOTAT ETTER LEDERVURDERING (IKKE GODKJENT)",
      "Simulert ledervurdering: " + model.latestReview.id +
        ". Vurdert beslutningsgrunnlag: " + model.decision.latestProposal.id,
      "1. Journalførte oppfølgingsoppgaver",
      ...model.tasks.map(function (task) {
        return "- " + task.ref + ": " + task.latestNote;
      }),
      "2. Fremdeles uavklarte forhold",
      ...(open.length ? open.map(function (topic) {
        return "- " + topic.title + ": " + topic.status + ". " + (topic.assessmentNote || topic.next);
      }) : ["- Ingen registrerte fagflagg i dette uttrekket; tekniske og juridiske kontroller er fortsatt ikke automatisk verifisert."]),
      "3. Rådgiverens plan for ny intern vurdering",
      text,
      "4. Status og myndighetsgrense",
      "Dette er planlagte interne oppgaver, ikke sendte bestillinger eller mottatte fagrapporter. Ingen avvik er lukket, saken er ikke oversendt til vedtak, og ingen myndighet har godkjent planen.",
      "Kildeversjoner: " + model.signature
    ].join("\n");
    if (model.latestReport?.note === note) return { ok: true, alreadyLogged: true };
    if (model.reportCount >= 10 && model.current) {
      return { ok: false, reason: "Grensen for frie omskrivinger av et gjeldende notat er nådd." };
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
        event_id: "lillebekk_leder2_oppfolgingsnotat_v" + (model.reportCount + 1),
        scene_id: "lillebekk_ny_ledervurdering",
        choice_id: "journalfor_intern_oppfolgingsplan",
        outcome: "intern_lederoppfolging_uten_godkjenning", at: new Date().toISOString(), note
      });
      return { ok: true, alreadyLogged: false };
    } catch (error) {
      if (window.DEBUG) console.warn("[Civication] Oppfølging av ny ledervurdering", error);
      return { ok: false, reason: "Oppfølgingsnotatet kunne ikke journalføres." };
    }
  }


  // Realistic-looking, authored case-exercise supplements, NOT actual incoming
  // municipal documents. A review records unresolved deficiencies, not approval.
  const LILLEBEKK_SUPPLERINGSBILAG = [
    {
      id: "trafikk", ref: "LBK-SUP-13", title: "Revidert rigg- og leveringsskisse – punkt B",
      sender: "Utbyggers prosjekteringsgruppe (fiktivt spillbilag)",
      document: [
        "Revisjon B flytter losseplassen 4 meter nord for punkt B. Skissen tegner en separat gangstripe og foreslår levering utenom 07.30–09.00.",
        "Tegningen mangler målsatt fri gangbredde mens av- og pålessing foregår. Den har ingen kontrollert siktanalyse, signert driftsplan eller beskrivelse av håndtering ved uforutsett levering."
      ],
      verified: "Skissen dokumenterer at utbygger har foreslått en annen plassering og et nytt leveringsvindu; den dokumenterer ikke sikker framkommelighet i anleggsperioden.",
      safeId: "returner_trafikk_med_konkret_mangelliste",
      safeLabel: "Returner skissen med krav om målsatt bredde, sikt og bindende driftsopplegg",
      unsafeId: "godkjenn_revidert_skolevei",
      unsafeLabel: "Legg trygg skolevei til grunn fordi leveringsplassen er flyttet",
      followup: "Trafikkfag: be om målsatt situasjonsplan ved normal og avvikende levering, trafikksikkerhetsvurdering samt drifts- og kontrollansvar. Skoleveiavviket står åpent."
    },
    {
      id: "overvann", ref: "LBK-SUP-14", title: "Nytt terrengsnitt og foreløpig overvannstabell",
      sender: "Utbyggers VA-rådgiver (fiktivt spillbilag)",
      document: [
        "Nytt snitt viser fall fra øst +6,80 mot vest +6,20 og markerer et foreslått avskjærende utløp i vest. Tidligere flomveipil mot øst er fjernet fra dette utkastet.",
        "Tabellen viser fortsatt 42 m³ tilrenning og 26 m³ fordrøyning i ett hypotetisk scenario. Utløpets kapasitet, forutsetninger for ekstremnedbør og konsekvenser for naboeiendommen i vest er ikke beregnet."
      ],
      verified: "Tegningsmotstriden er forsøkt rettet, men en pil og et snitt alene bekrefter ikke flomvei eller kapasitet. Differansen 16 m³ er fortsatt ikke en ferdig dimensjonering.",
      safeId: "registrer_delvis_retting_og_krev_hydraulikk",
      safeLabel: "Registrer revidert pil og snitt som delvis svar; krev beregning og nabovurdering",
      unsafeId: "godkjenn_revidert_fordroyning",
      unsafeLabel: "Lukk overvannsavviket fordi terrengsnittet er korrigert",
      followup: "Overvannsfag: krev datert beregningsgrunnlag, dokumentert utløpskapasitet, flomveisanalysen og virkning for vestre nabo. Overvannsavviket står åpent."
    },
    {
      id: "planjuss", ref: "LBK-SUP-15", title: "Merket bestemmelsesutkast – § 4.1",
      sender: "Kommunal planjurist (fiktivt internt spillutkast)",
      document: [
        "Utkast B: «Før første bolig tas i bruk skal gangforbindelse vist i plankart være opparbeidet og tilgjengelig». Utbyggers forslag om ferdigattest for hele prosjektet er markert som ikke innarbeidet.",
        "Planjuristen påpeker at gangforbindelsens endelige trasé, teknisk utforming og gjennomføringsansvar fortsatt må beskrives. Ordlyden er foreløpig og ikke ferdig juridisk kvalitetssikret eller godkjent."
      ],
      verified: "Versjonsforskjellen er synlig og kan journalføres internt. En formulering på utkaststadiet kan ikke erstatte faglig begrunnelse, juridisk sluttkontroll eller formelt vedtak.",
      safeId: "journalfor_utkast_med_juridiske_forbehold",
      safeLabel: "Legg utkast B til intern kontroll med tydelige premisser og restanser",
      unsafeId: "send_bestemmelse_som_vedtatt",
      unsafeLabel: "Send utkast B som vedtatt bestemmelse til utbygger",
      followup: "Planjuss: kontroller hjemmel, presist plankart, tidspunkt, ansvar og forholdet til trafikksikkerhetskontrollen før saken kan behandles videre."
    }
  ];

  function lillebekkSuppleringssvarModel() {
    const ledelse = lillebekkNyLedervurderingModel();
    if (!ledelse?.latestReport) return null;
    const world = window.CivicationWorkWorld;
    const formal = world?.getWorkObject?.("by_radgiver_lillebekk_plan_case_001");
    if (!formal || formal.status === "closed" || formal.closed_at) return null;
    const history = Array.isArray(formal.history) ? formal.history : [];
    const source = ledelse.signature + "|" + ledelse.latestReport.id;
    const docs = LILLEBEKK_SUPPLERINGSBILAG.map(function (doc) {
      const prefix = "lillebekk_suppleringsgjennomgang_" + doc.id + "_v";
      const matches = history.filter(function (event) {
        return String(event.id || "").startsWith(prefix);
      });
      const latest = matches[matches.length - 1] || null;
      const belongs = String(latest?.note || "").startsWith(
        "Oppfølgingsnotat: " + ledelse.latestReport.id + ";");
      return { ...doc, count: matches.length, latestId: latest?.id || "",
        latestNote: latest?.note || "", latestOutcome: latest?.outcome || "",
        safe: !!belongs && latest?.outcome === doc.safeId };
    });
    const sourceCurrent = !!ledelse.current && !!ledelse.ready;
    const ready = sourceCurrent && docs.every(function (doc) { return doc.safe; });
    const signature = [source].concat(docs.map(function (doc) { return doc.latestId; })).join("|");
    const matrices = history.filter(function (event) {
      return String(event.id || "").startsWith("lillebekk_suppleringsmatrise_v");
    });
    const latestMatrix = matrices[matrices.length - 1] || null;
    return { ledelse, docs, source, sourceCurrent, ready, signature,
      matrixCount: matrices.length, latestMatrix,
      current: !!latestMatrix && ready &&
        String(latestMatrix.note || "").endsWith("Kildeversjoner: " + signature) };
  }

  function recordLillebekkSuppleringsgjennomgang(docId, actionId, justification) {
    const model = lillebekkSuppleringssvarModel();
    const doc = model?.docs.find(function (item) { return item.id === docId; });
    if (!model?.sourceCurrent || !doc || ![doc.safeId, doc.unsafeId].includes(actionId)) {
      return { ok: false, reason: "Gjeldende oppfølgingsnotat etter Elins ledervurdering er nødvendig." };
    }
    const reason = String(justification || "").replace(/\s+/g, " ").trim().slice(0, 720);
    if (reason.length < 60) {
      return { ok: false, reason: "Begrunn hva bilaget faktisk svarer på og hva fagansvarlig fortsatt må dokumentere (minst 60 tegn)." };
    }
    const label = actionId === doc.safeId ? doc.safeLabel : doc.unsafeLabel;
    const note = "Oppfølgingsnotat: " + model.ledelse.latestReport.id +
      "; SIMULERT DOKUMENTKONTROLL " + doc.ref + " (" + doc.title + "). " +
      "Bilagets opplysninger: " + doc.document.join(" ") +
      " Dokumentgrense: " + doc.verified +
      " Rådgiverens valg: " + label + ". Begrunnelse: " + reason +
      ". Restanse: " + doc.followup +
      " Dette er kun journalført intern vurdering av fiktivt materiale; ingen faktisk mottakskontroll eller godkjenning.";
    if (doc.latestOutcome === actionId && doc.latestNote === note) {
      return { ok: true, alreadyLogged: true };
    }
    // A new, source-bound manager work order can be reviewed regardless of
    // older edits. Within the same work order permit a final safe correction.
    const sameSource = String(doc.latestNote || "").startsWith(
      "Oppfølgingsnotat: " + model.ledelse.latestReport.id + ";");
    if (doc.count >= 10 && sameSource &&
        !(doc.latestOutcome !== doc.safeId && actionId === doc.safeId)) {
      return { ok: false, reason: "Revisjonsgrensen er nådd. Kun sluttkorrigering av siste faglig uforsvarlige vurdering tillates." };
    }
    const world = window.CivicationWorkWorld;
    if (typeof world?.appendWorkObjectHistory !== "function") {
      return { ok: false, reason: "Saksloggen er utilgjengelig." };
    }
    const formal = world.getWorkObject("by_radgiver_lillebekk_plan_case_001");
    if (!formal || formal.status === "closed" || formal.closed_at) {
      return { ok: false, reason: "Saken er avsluttet." };
    }
    try {
      world.appendWorkObjectHistory(formal.work_object_id, {
        event_id: "lillebekk_suppleringsgjennomgang_" + doc.id + "_v" + (doc.count + 1),
        scene_id: "lillebekk_suppleringssvar", choice_id: actionId,
        outcome: actionId, at: new Date().toISOString(), note
      });
      return { ok: true, alreadyLogged: false };
    } catch (error) {
      if (window.DEBUG) console.warn("[Civication] Suppleringsgjennomgang", error);
      return { ok: false, reason: "Dokumentgjennomgangen kunne ikke journalføres." };
    }
  }

  function recordLillebekkSuppleringsmatrise(recommendation) {
    const model = lillebekkSuppleringssvarModel();
    if (!model?.sourceCurrent) {
      return { ok: false, reason: "Lederens gjeldende oppfølgingsnotat eller tidligere kildegrunnlag må korrigeres først." };
    }
    if (!model.ready) {
      return { ok: false, reason: "Alle tre suppleringsbilag må gjennomgås uten å godkjenne mangelfullt materiale." };
    }
    const reason = String(recommendation || "").replace(/\s+/g, " ").trim().slice(0, 950);
    if (reason.length < 80) {
      return { ok: false, reason: "Beskriv hvordan restansene fordeles og hvilke dokumenter som må tilbake før ny ledervurdering (minst 80 tegn)." };
    }
    const open = model.ledelse.decision.kontroll.fag.leader.memo.dossier.topics.filter(function (topic) {
      return topic.issue || !topic.documented || topic.reviewNeedLogged || topic.caveatLogged ||
        ["mangelfull", "motstridende", "fagkontroll"].includes(topic.assessmentOutcome);
    });
    const note = [
      "LILLEBEKK – INTERN RESTANSEMATRISE ETTER SUPPLERING (IKKE GODKJENT)",
      "Utgangspunkt: " + model.ledelse.latestReport.id,
      "Dokumentene er fiktive og forhåndsskrevne til undervisning – ikke reelt mottatt eller faglig verifisert.",
      "1. Kontrollert dokumentutdrag og restanse",
      ...model.docs.map(function (doc) {
        return "- " + doc.ref + ": " + doc.latestNote;
      }),
      "2. Fremdeles åpne forhold i plansaken",
      ...(open.length ? open.map(function (topic) {
        return "- " + topic.title + ": " + topic.status + ". " + (topic.assessmentNote || topic.next);
      }) : ["- Ingen åpne temaer i dette uttrekket; ingen teknisk dokumentverifikasjon er utført."]),
      "3. Konkret dokumentkrav og ansvar før ny ledervurdering",
      reason,
      "4. Avgrensning",
      "Skisser, foreløpige beregninger og utkast gir ikke planvedtak eller dokumentert sikkerhet. Ingen dokumenter er faktisk sendt eller innhentet; ingen saksflagg er lukket.",
      "Kildeversjoner: " + model.signature
    ].join("\n");
    if (model.latestMatrix?.note === note) return { ok: true, alreadyLogged: true };
    if (model.matrixCount >= 10 && model.current) {
      return { ok: false, reason: "Revisjonsgrense for uendret grunnlag. Oppdater et bilag før ytterligere utgave." };
    }
    const world = window.CivicationWorkWorld;
    if (typeof world?.appendWorkObjectHistory !== "function") {
      return { ok: false, reason: "Saksloggen er utilgjengelig." };
    }
    const formal = world.getWorkObject("by_radgiver_lillebekk_plan_case_001");
    if (!formal || formal.status === "closed" || formal.closed_at) {
      return { ok: false, reason: "Saken er avsluttet." };
    }
    try {
      world.appendWorkObjectHistory(formal.work_object_id, {
        event_id: "lillebekk_suppleringsmatrise_v" + (model.matrixCount + 1),
        scene_id: "lillebekk_suppleringssvar",
        choice_id: "journalfor_intern_restanseliste",
        outcome: "intern_restanseliste_ikke_godkjent", at: new Date().toISOString(), note
      });
      return { ok: true, alreadyLogged: false };
    } catch (error) {
      if (window.DEBUG) console.warn("[Civication] Restansematrise", error);
      return { ok: false, reason: "Restansematrisen kunne ikke journalføres." };
    }
  }


  // Distinguish external technical documentation requests from municipal legal review.
  // These are unsent drafts, tied to the latest source-verified restanse matrix.
  const LILLEBEKK_UTKAST = [
    { id: "utbygger", title: "Presiseringsbrev til utbygger – utkast",
      recipient: "Utbyggers prosjektleder (fiktiv)",
      refs: ["LBK-SUP-13", "LBK-SUP-14"],
      requirements: [
        "Trafikk: målsatt fri gangbredde ved normal og avvikende varelevering, dokumentert sikt, risiko og ansvarlig driftsplan før første innflytting.",
        "Overvann: daterte beregningspremisser, kapasitet for utløpet, analyse av 42 m³ tilrenning og 26 m³ fordrøyning, ekstremnedbør og virkning for nabo i vest."
      ],
      boundary: "Utbyggers tilleggsopplysninger er ikke kommunal teknisk verifikasjon eller planvedtak." },
    { id: "planjuss", title: "Intern bestilling til planjurist – utkast",
      recipient: "Kommunal planjurist (fiktiv)",
      refs: ["LBK-SUP-15", "LBK-SUP-13"],
      requirements: [
        "Kvalitetssikre § 4.1 mot plankart, presis gangtrasé, tidspunkt før innflytting, gjennomføringsansvar og dokumentasjon for trafikk.",
        "Vurder hjemmel og utbyggers forslag om ferdigattest for hele prosjektet uten å gi forhåndstilsagn om planvedtak."
      ],
      boundary: "Juridisk sluttkontroll er kommunens oppgave, ikke noe utbygger kan attestere eller godkjenne." }
  ];

  function lillebekkUtkastModel() {
    const sup = lillebekkSuppleringssvarModel();
    if (!sup?.latestMatrix) return null;
    const world = window.CivicationWorkWorld;
    const formal = world?.getWorkObject?.("by_radgiver_lillebekk_plan_case_001");
    if (!formal || formal.status === "closed" || formal.closed_at) return null;
    const history = Array.isArray(formal.history) ? formal.history : [];
    const source = sup.signature + "|" + sup.latestMatrix.id;
    const drafts = LILLEBEKK_UTKAST.map(function (draft) {
      const records = history.filter(function (event) {
        return String(event.id || "").startsWith("lillebekk_utkast_" + draft.id + "_v");
      });
      const latest = records[records.length - 1] || null;
      return { ...draft, count: records.length, latestId: latest?.id || "", latestNote: latest?.note || "",
        current: !!sup.current && !!latest &&
          String(latest.note || "").endsWith("Kildeversjoner: " + source) };
    });
    return { sup, source, ready: !!sup.current, drafts,
      complete: !!sup.current && drafts.every(function (draft) { return draft.current; }) };
  }

  function recordLillebekkUtkast(kind, justification) {
    const model = lillebekkUtkastModel();
    if (!model?.ready) return { ok: false, reason: "En gjeldende restansematrise må journalføres først." };
    const draft = model.drafts.find(function (row) { return row.id === kind; });
    if (!draft) return { ok: false, reason: "Ukjent mottaker. Utbygger og intern planjurist må holdes adskilt." };
    const reason = String(justification || "").replace(/\s+/g, " ").trim().slice(0, 850);
    if (reason.length < 70) return { ok: false, reason: "Skriv en konkret begrunnelse på minst 70 tegn." };
    const note = [
      "LILLEBEKK – " + draft.title.toUpperCase() + " (IKKE SENDT)",
      "Fiktivt internt utkast. Ingen faktisk utsendelse, dokumentmottak eller kontroll er gjennomført.",
      "Mottaker: " + draft.recipient,
      "Kilde: " + model.sup.latestMatrix.id + ", " + draft.refs.join(", "),
      "Dokumentkrav:",
      ...draft.requirements.map(function (requirement) { return "- " + requirement; }),
      "Rådgiverens begrunnelse: " + reason,
      "Myndighetsgrense: " + draft.boundary,
      "Alle åpne saksavvik beholdes; dette er ikke et vedtak.",
      "Kildeversjoner: " + model.source
    ].join("\n");
    if (draft.latestNote === note) return { ok: true, alreadyLogged: true };
    if (draft.count >= 10 && draft.current) return { ok: false, reason: "Revisjonsgrense for uendrede kilder. Oppdater grunnlaget først." };
    const world = window.CivicationWorkWorld;
    if (typeof world?.appendWorkObjectHistory !== "function") return { ok: false, reason: "Saksloggen er utilgjengelig." };
    const formal = world.getWorkObject("by_radgiver_lillebekk_plan_case_001");
    if (!formal || formal.status === "closed" || formal.closed_at) return { ok: false, reason: "Saken er avsluttet." };
    try {
      world.appendWorkObjectHistory(formal.work_object_id, {
        event_id: "lillebekk_utkast_" + draft.id + "_v" + (draft.count + 1),
        scene_id: "lillebekk_suppleringssvar", choice_id: "journalfor_" + draft.id + "_utkast",
        outcome: "intern_utkast_ikke_sendt", at: new Date().toISOString(), note
      });
      return { ok: true, alreadyLogged: false };
    } catch (error) {
      if (window.DEBUG) console.warn("[Civication] Lillebekk utkast", error);
      return { ok: false, reason: "Utkastet kunne ikke journalføres." };
    }
  }


  // A separate, explicitly fictional document exercise following the two unsent
  // drafts. Opening this exercise does not mean the drafts were dispatched.
  const LILLEBEKK_SVARBILAG = [
    {
      id: "utbygger", ref: "LBK-SVAR-16",
      title: "Svarutdrag fra prosjekteringsgruppen – gangareal og flomvei",
      sender: "Prosjekteringsgruppen (fiktivt øvingsdokument)",
      paragraphs: [
        "«Vi har tegnet inn 1,25 meter gangbredde ved punkt B. Under varelevering kan bredden bli 0,90 meter. Vi mener den nye løsningen kan aksepteres uten flere undersøkelser.»",
        "«Vi legger til grunn tabellen med 42 m³ tilrenning og 26 m³ fordrøyning. Kapasiteten i vestre utløp og påvirkning på naboeiendommen er ikke beregnet i denne revisjonen.»"
      ],
      evidence: "Tallene er opplysninger i en fiktiv skisse, ikke oppmålinger eller dokumentasjon av sikker skolevei. Sikt, leveringsrutiner, utløp, ekstremnedbør og nabovirkning er fortsatt åpne.",
      safeId: "returner_for_trafikk_og_va_kontroll",
      safeLabel: "Registrer delvis svar og returner konkrete mangler til trafikk og VA",
      unsafeId: "godkjenn_teknisk_grunnlag",
      unsafeLabel: "Godkjenn skolevei og flomvei på grunnlag av skissen",
      task: "Innhent kontrollert, målsatt plan for normal- og avvikslevering, faglig trafikksikkerhetsvurdering og beregnet overvannsløsning med nabokonsekvens."
    },
    {
      id: "planjuss", ref: "LBK-SVAR-17",
      title: "Internt notat fra planjurist – kontroll av § 4.1",
      sender: "Kommunal planjurist (fiktivt internt øvingsdokument)",
      paragraphs: [
        "«Bestemmelsen kan arbeides videre med som rekkefølgekrav før første innflytting, men gangforbindelsens plassering og tekniske opparbeidelse må være presist forankret i plankartet.»",
        "«Det er ikke grunnlag for å erstatte dette med utbyggers forslag om ferdigattest for hele prosjektet. Endelig hjemmelskontroll, gjennomføringsansvar og politisk behandling gjenstår.»"
      ],
      evidence: "Juristen beskriver et avgrenset utkast og åpne rettslige spørsmål, ikke et godkjent rekkefølgekrav eller kommunalt tilsagn.",
      safeId: "behold_utkast_og_krev_sluttkontroll",
      safeLabel: "Journalfør intern juristmerknad og krev kartavstemming og sluttkontroll",
      unsafeId: "erklaer_vedtatt_planbestemmelse",
      unsafeLabel: "Marker § 4.1 som vedtatt og informer utbygger",
      task: "Avklar kartkobling, tidspunkt, hjemmel og ansvar i intern planjuridisk kvalitetssikring før videre behandling."
    }
  ];

  function lillebekkSvarrundeModel() {
    const utkast = lillebekkUtkastModel();
    if (!utkast || !utkast.drafts.some(function (row) { return row.latestId; })) return null;
    const world = window.CivicationWorkWorld;
    const formal = world?.getWorkObject?.("by_radgiver_lillebekk_plan_case_001");
    if (!formal || formal.status === "closed" || formal.closed_at) return null;
    const history = Array.isArray(formal.history) ? formal.history : [];
    const source = [utkast.source].concat(utkast.drafts.map(function (row) { return row.latestId; })).join("|");
    const rounds = history.filter(function (event) {
      return String(event.id || "").startsWith("lillebekk_svarrunde_v");
    });
    const latestRound = rounds[rounds.length - 1] || null;
    const opened = !!utkast.complete && !!latestRound &&
      String(latestRound.note || "").endsWith("Kildeversjoner: " + source);
    const docs = LILLEBEKK_SVARBILAG.map(function (doc) {
      const records = history.filter(function (event) {
        return String(event.id || "").startsWith("lillebekk_svarvurdering_" + doc.id + "_v");
      });
      const latest = records[records.length - 1] || null;
      const belongs = opened && String(latest?.note || "").startsWith(
        "Øvingsrunde: " + latestRound.id + ";");
      return { ...doc, count: records.length, latestNote: latest?.note || "",
        latestOutcome: latest?.outcome || "", current: !!belongs,
        safe: !!belongs && latest?.outcome === doc.safeId };
    });
    return { utkast, source, rounds: rounds.length, latestRound,
      canOpen: !!utkast.complete, opened, docs,
      ready: !!opened && docs.every(function (doc) { return doc.safe; }) };
  }

  function recordLillebekkSvarrundeStart() {
    const model = lillebekkSvarrundeModel();
    if (!model?.canOpen) return { ok: false, reason: "Journalfør to gjeldende, separate dokumentutkast før neste øvingsrunde." };
    if (model.opened) return { ok: true, alreadyLogged: true };
    const world = window.CivicationWorkWorld;
    if (typeof world?.appendWorkObjectHistory !== "function") return { ok: false, reason: "Saksloggen er utilgjengelig." };
    const formal = world.getWorkObject("by_radgiver_lillebekk_plan_case_001");
    if (!formal || formal.status === "closed" || formal.closed_at) return { ok: false, reason: "Saken er avsluttet." };
    const note = [
      "FIKTIV LILLEBEKK-ØVELSE – NY DOKUMENTRUNDE",
      "Spilleren åpnet en ny, forhåndsskrevet saksøvelse. De to tidligere utkastene er IKKE SENDT.",
      "Dokumentene LBK-SVAR-16 og LBK-SVAR-17 er kun treningsmateriale, ikke faktisk mottatte svar.",
      "Ingen undersøkelser, avklaringer, offentlige vedtak eller godkjenninger er gjennomført.",
      "Kildeversjoner: " + model.source
    ].join("\n");
    try {
      world.appendWorkObjectHistory(formal.work_object_id, {
        event_id: "lillebekk_svarrunde_v" + (model.rounds + 1),
        scene_id: "lillebekk_svarrunde", choice_id: "apen_fiktiv_dokumentrunde",
        outcome: "fiktiv_ovingsrunde_apnet", at: new Date().toISOString(), note
      });
      return { ok: true, alreadyLogged: false };
    } catch (error) {
      if (window.DEBUG) console.warn("[Civication] Lillebekk svarrunde", error);
      return { ok: false, reason: "Øvingsrunden kunne ikke journalføres." };
    }
  }

  function recordLillebekkSvarvurdering(docId, actionId, explanation) {
    const model = lillebekkSvarrundeModel();
    const doc = model?.docs.find(function (row) { return row.id === docId; });
    if (!model?.opened || !doc || ![doc.safeId, doc.unsafeId].includes(actionId)) {
      return { ok: false, reason: "Åpne gjeldende fiktiv dokumentrunde, og velg en gyldig vurdering." };
    }
    const reason = String(explanation || "").replace(/\s+/g, " ").trim().slice(0, 700);
    if (reason.length < 55) return { ok: false, reason: "Begrunn hva dokumentet viser og hva fagansvarlig fortsatt må kontrollere (minst 55 tegn)." };
    const label = actionId === doc.safeId ? doc.safeLabel : doc.unsafeLabel;
    const note = [
      "Øvingsrunde: " + model.latestRound.id + "; FIKTIV DOKUMENTVURDERING " + doc.ref,
      "Påstander i øvingsbilaget: " + doc.paragraphs.join(" "),
      "Faglig avgrensning: " + doc.evidence,
      "Rådgiverens valg: " + label,
      "Begrunnelse: " + reason,
      "Åpent arbeidsbehov: " + doc.task,
      "Dette er ikke dokumentmottak, kontrollrapport, utsendelse eller godkjenning."
    ].join(" ");
    if (doc.latestOutcome === actionId && doc.latestNote === note) return { ok: true, alreadyLogged: true };
    const sameRound = String(doc.latestNote || "").startsWith("Øvingsrunde: " + model.latestRound.id + ";");
    if (doc.count >= 10 && sameRound &&
        !(doc.latestOutcome !== doc.safeId && actionId === doc.safeId)) {
      return { ok: false, reason: "Revisjonsgrensen er nådd; en siste faglig korrigering tillates." };
    }
    const world = window.CivicationWorkWorld;
    if (typeof world?.appendWorkObjectHistory !== "function") return { ok: false, reason: "Saksloggen er utilgjengelig." };
    const formal = world.getWorkObject("by_radgiver_lillebekk_plan_case_001");
    if (!formal || formal.status === "closed" || formal.closed_at) return { ok: false, reason: "Saken er avsluttet." };
    try {
      world.appendWorkObjectHistory(formal.work_object_id, {
        event_id: "lillebekk_svarvurdering_" + doc.id + "_v" + (doc.count + 1),
        scene_id: "lillebekk_svarrunde", choice_id: actionId, outcome: actionId,
        at: new Date().toISOString(), note
      });
      return { ok: true, alreadyLogged: false };
    } catch (error) {
      if (window.DEBUG) console.warn("[Civication] Vurdering av Lillebekk-svar", error);
      return { ok: false, reason: "Vurderingen kunne ikke journalføres." };
    }
  }


  // One source-bound internal assessment after the authored, fictional response
  // exercise. It is not a decision, a verified document or a manager approval.
  const LILLEBEKK_SVARNOTAT_CHOICES = [
    { id: "avvent_supplering_og_ny_ledervurdering",
      label: "Anbefal konkrete fagkontroller før ny intern ledervurdering",
      safe: true },
    { id: "foresla_vedtak_uten_dokumentkontroll",
      label: "Foreslå oversendelse til vedtak på det foreliggende materialet",
      safe: false }
  ];

  function lillebekkSvarnotatModel() {
    const svar = lillebekkSvarrundeModel();
    if (!svar?.latestRound) return null;
    const world = window.CivicationWorkWorld;
    const formal = world?.getWorkObject?.("by_radgiver_lillebekk_plan_case_001");
    if (!formal || formal.status === "closed" || formal.closed_at) return null;
    const history = Array.isArray(formal.history) ? formal.history : [];
    const signature = [svar.source, svar.latestRound.id].concat(
      svar.docs.map(function (doc) {
        const events = history.filter(function (event) {
          return String(event.id || "").startsWith("lillebekk_svarvurdering_" + doc.id + "_v");
        });
        return events[events.length - 1]?.id || "";
      })
    ).join("|");
    const reports = history.filter(function (event) {
      return String(event.id || "").startsWith("lillebekk_svarnotat_v");
    });
    const latestReport = reports[reports.length - 1] || null;
    const ready = !!svar.ready;
    const current = ready && !!latestReport &&
      latestReport.outcome === LILLEBEKK_SVARNOTAT_CHOICES[0].id &&
      String(latestReport.note || "").endsWith("Kildeversjoner: " + signature);
    return { svar, ready, signature, count: reports.length, latestReport,
      current, choices: LILLEBEKK_SVARNOTAT_CHOICES };
  }

  function recordLillebekkSvarnotat(choiceId, justification) {
    const model = lillebekkSvarnotatModel();
    const choice = LILLEBEKK_SVARNOTAT_CHOICES.find(function (item) { return item.id === choiceId; });
    if (!model?.ready || !choice) {
      return { ok: false, reason: "To gjeldende, forsvarlige vurderinger av øvingssvarene og et gyldig forslag kreves." };
    }
    const reason = String(justification || "").replace(/\s+/g, " ").trim().slice(0, 1050);
    if (reason.length < 100) {
      return { ok: false, reason: "Begrunn konkret skolevei, overvann og planjuss før journalføring (minst 100 tegn)." };
    }
    const dossier = lillebekkReviewModel();
    const openTopics = dossier?.topics || [];
    const note = [
      "LILLEBEKK – SAMLET FAGLIG OPPFØLGINGSNOTAT ETTER FIKTIV SVARRUNDE (INTERNT, IKKE VEDTAK)",
      "Saksgrunnlag: " + model.svar.latestRound.id + ", LBK-SVAR-16 og LBK-SVAR-17; begge svarbilag er fiktive treningsdokumenter. Tidligere presiseringsutkast er IKKE SENDT.",
      "1. Skolevei og drift (LBK-SVAR-16)",
      "Utbygger oppgir 1,25 meter i skissen, men 0,90 meter under varelevering. Dette er ikke verifisert fri gangbredde, sikt, trafikksikkerhet eller godkjent driftsplan.",
      "Restanse: Trafikkfag må innhente og kontrollere målsatt situasjonsplan under normal og avvikende levering, sikt og et forpliktende opplegg før første innflytting.",
      "2. Overvann og nabo i vest (LBK-SVAR-16)",
      "Den fiktive tabellen oppgir 42 m³ tilrenning og 26 m³ fordrøyning. Tallene dokumenterer ikke kontrollert kapasitet for vestre utløp eller virkning ved ekstremnedbør på naboeiendommen.",
      "Restanse: VA-fag må kontrollere beregningspremisser, utløpskapasitet, flomvei og nabovirkning. Ingen hydraulisk kontroll er gjennomført.",
      "3. Rekkefølgekrav og myndighet (LBK-SVAR-17, LBK-SUP-15)",
      "Fiktiv planjurist anbefaler videre kontroll av § 4.1 mot plankart, gangtrase, tidspunkt før første innflytting, gjennomføringsansvar og hjemmel. Ferdigattest for hele prosjektet er ikke godtatt som automatisk erstatning.",
      "Restanse: Intern planjuridisk sluttkontroll; eventuelt behov for justering av plankart og bestemmelsesordlyd. Ingen planbestemmelse er vedtatt.",
      "4. Andre registrerte temaer i samme plansak – kontrollstatus, ikke faglig friskmelding",
      ...openTopics.map(function (topic) {
        return "- " + topic.title + ": " + topic.status + ". Neste oppgave: " + topic.next;
      }),
      "5. Rådgiverens anbefaling: " + choice.label,
      choice.safe
        ? "Videre arbeid: Bestill fagkontroll internt og hent nødvendige presiseringer gjennom rett prosess. Legg bare kontrollert materiale fram for en ny, separat simulert ledervurdering."
        : "FAGLIG AVVIK: Oversendelse til vedtak er prematur. Denne spillbeslutningen gir ikke tillatelse eller videre saksoverføring; åpne kontrollbehov består.",
      "Rådgiverens begrunnelse: " + reason,
      "6. Status og myndighetsgrense",
      "Bare intern journalføring av en simulert vurdering. Ingen reell utsendelse, mottatt fagrapport, ferdig kontroll, ledergodkjenning, administrativ godkjenning eller politisk planvedtak. Ingen åpne avvik lukkes.",
      "Kildeversjoner: " + model.signature
    ].join("\n");
    if (model.latestReport?.note === note && model.latestReport?.outcome === choice.id) {
      return { ok: true, alreadyLogged: true };
    }
    const sameSource = String(model.latestReport?.note || "").endsWith("Kildeversjoner: " + model.signature);
    if (model.count >= 10 && sameSource &&
        !(model.latestReport?.outcome !== LILLEBEKK_SVARNOTAT_CHOICES[0].id && choice.safe)) {
      return { ok: false, reason: "Revisjonsgrensen for uendret grunnlag er nådd. Korriger faglig uforsvarlig anbefaling eller oppdater kildene." };
    }
    const world = window.CivicationWorkWorld;
    if (typeof world?.appendWorkObjectHistory !== "function") {
      return { ok: false, reason: "Saksloggen er utilgjengelig." };
    }
    const formal = world.getWorkObject("by_radgiver_lillebekk_plan_case_001");
    if (!formal || formal.status === "closed" || formal.closed_at) {
      return { ok: false, reason: "Saken er avsluttet." };
    }
    try {
      world.appendWorkObjectHistory(formal.work_object_id, {
        event_id: "lillebekk_svarnotat_v" + (model.count + 1),
        scene_id: "lillebekk_svarrunde", choice_id: choice.id,
        outcome: choice.id, at: new Date().toISOString(), note
      });
      return { ok: true, alreadyLogged: false };
    } catch (error) {
      if (window.DEBUG) console.warn("[Civication] Lillebekk faglig svarnotat", error);
      return { ok: false, reason: "Det faglige oppfølgingsnotatet kunne ikke journalføres." };
    }
  }


  // Simulated meeting with Elin following the internal response memo.
  // Questions challenge documented uncertainty and never supply real approvals.
  const LILLEBEKK_ELIN_SVARMOTE = [
    {
      id: "skolevei", title: "Elin: Hva kan du faktisk si om skoleveien?",
      question: "Skissen oppgir 1,25 meter fri bredde, men bare 0,90 meter ved varelevering. Kan jeg skrive at skoleveien er trygg før innflytting?",
      safeId: "krever_trafikkfaglig_dokumentasjon",
      safeLabel: "Nei – trafikkfag må kontrollere bredde, sikt og leveringsrutiner",
      unsafeId: "godkjenn_skolevei_ut_fra_skisse",
      unsafeLabel: "Ja – 1,25 meter i tegningen er tilstrekkelig",
      feedback: "Elin: Før vi kan gå videre, må trafikkfag avklare framkommelighet i faktisk drift, også ved uforutsett levering. Vi kan ikke likestille en skisse med en trafikksikkerhetskontroll.",
      task: "Trafikkfag: kontroller målsatt ganglinje, sikttrekanter, leveringsvindu, avvikshåndtering og ansvar før første innflytting.",
      ref: "LBK-SVAR-16"
    },
    {
      id: "overvann", title: "Elin: Hvor blir vannet av?",
      question: "Vi har fått tallene 42 m³ tilrenning og 26 m³ fordrøyning, men ingen kapasitet for vestre utløp. Kan tallene brukes som kontroll av overvannsrisiko?",
      safeId: "krever_va_kapasitet_og_nabovirkning",
      safeLabel: "Nei – VA må beregne utløp, flomvei og nabovirkning",
      unsafeId: "aksepter_tabell_som_hydraulisk_kontroll",
      unsafeLabel: "Ja – tallene er nok til å lukke overvannsspørsmålet",
      feedback: "Elin: En volumbalanse uten utløpsberegning og nabovurdering er ikke tilstrekkelig. Bestill en etterprøvbar VA-kontroll, og hold overvannspunktet åpent.",
      task: "VA: beregn vestre utløp, ekstremnedbør, terreng- og flomveier samt konsekvens for nabo i vest.",
      ref: "LBK-SVAR-16"
    },
    {
      id: "planjuss", title: "Elin: Hvem har myndighet til å avklare § 4.1?",
      question: "Planjuristen har skrevet et foreløpig internt notat. Utbygger foreslår ferdigattest for hele prosjektet. Er rekkefølgekravet nå ferdig juridisk kvalitetssikret?",
      safeId: "krever_intern_juridisk_sluttkontroll",
      safeLabel: "Nei – intern planjuss må avstemme plankart, hjemmel og ansvar",
      unsafeId: "utbygger_kan_godkjenne_rekkefolgekrav",
      unsafeLabel: "Ja – utbyggers forslag kan legges til grunn som vedtatt",
      feedback: "Elin: Kommunal planjuridisk sluttkontroll må avklare trasé, tidspunkt, hjemmel og gjennomføringsansvar. Utbygger kan ikke vedta bestemmelsen.",
      task: "Kommunal planjurist: kontroller § 4.1 mot plankart, tidspunkt før første innflytting, ansvar, hjemmel og videre myndighetsbehandling.",
      ref: "LBK-SVAR-17"
    }
  ];

  function lillebekkElinSvarmoteModel() {
    const memo = lillebekkSvarnotatModel();
    if (!memo?.latestReport) return null;
    const world = window.CivicationWorkWorld;
    const formal = world?.getWorkObject?.("by_radgiver_lillebekk_plan_case_001");
    if (!formal || formal.status === "closed" || formal.closed_at) return null;
    const history = Array.isArray(formal.history) ? formal.history : [];
    const source = memo.signature + "|" + memo.latestReport.id;
    const questions = LILLEBEKK_ELIN_SVARMOTE.map(function (question) {
      const events = history.filter(function (event) {
        return String(event.id || "").startsWith("lillebekk_elin3_svar_" + question.id + "_v");
      });
      const latest = events[events.length - 1] || null;
      const belongs = !!memo.current && String(latest?.note || "").startsWith(
        "Møtegrunnlag: " + memo.latestReport.id + ";");
      return { ...question, count: events.length, latestId: latest?.id || "",
        latestNote: latest?.note || "", latestOutcome: latest?.outcome || "",
        current: !!belongs, safe: !!belongs && latest?.outcome === question.safeId };
    });
    const complete = !!memo.current && questions.every(function (q) { return q.safe; });
    const signature = [source].concat(questions.map(function (q) { return q.latestId; })).join("|");
    const reports = history.filter(function (event) {
      return String(event.id || "").startsWith("lillebekk_elin3_motereferat_v");
    });
    const latestReport = reports[reports.length - 1] || null;
    const current = complete && !!latestReport &&
      String(latestReport.note || "").endsWith("Kildeversjoner: " + signature);
    return { memo, source, questions, complete, signature,
      reportsCount: reports.length, latestReport, current };
  }

  function recordLillebekkElinSvarmoteSvar(id, actionId, reasoning) {
    const model = lillebekkElinSvarmoteModel();
    const question = model?.questions.find(function (item) { return item.id === id; });
    if (!model?.memo.current || !question || ![question.safeId, question.unsafeId].includes(actionId)) {
      return { ok: false, reason: "Et gjeldende internt oppfølgingsnotat og et gyldig svar kreves." };
    }
    const reason = String(reasoning || "").replace(/\s+/g, " ").trim().slice(0, 700);
    if (reason.length < 55) {
      return { ok: false, reason: "Forklar hvilket bilag som finnes, hva som mangler, og hvem som må kontrollere (minst 55 tegn)." };
    }
    const safe = actionId === question.safeId;
    const note = [
      "Møtegrunnlag: " + model.memo.latestReport.id + "; SIMULERT LEDERSPØRSMÅL – " + question.title,
      "Elins spørsmål: " + question.question,
      "Rådgiverens svar: " + (safe ? question.safeLabel : question.unsafeLabel),
      "Rådgiverens begrunnelse: " + reason,
      "SIMULERT ELIN-RESPONS: " + (safe ? question.feedback :
        "Elin avviser den premature konklusjonen. " + question.feedback),
      "Konkrete gjenstående arbeidsoppgaver: " + question.task,
      "Ingen faktisk fagkontroll, utsendelse, saksgodkjenning eller planvedtak."
    ].join("\n");
    if (question.latestNote === note && question.latestOutcome === actionId) {
      return { ok: true, alreadyLogged: true };
    }
    const sameSource = String(question.latestNote || "").startsWith(
      "Møtegrunnlag: " + model.memo.latestReport.id + ";");
    if (question.count >= 10 && sameSource &&
        !(question.latestOutcome !== question.safeId && safe)) {
      return { ok: false, reason: "Revisjonsgrensen er nådd. En avsluttende faglig korrigering er tillatt." };
    }
    const world = window.CivicationWorkWorld;
    if (typeof world?.appendWorkObjectHistory !== "function") return { ok: false, reason: "Saksloggen er utilgjengelig." };
    const formal = world.getWorkObject("by_radgiver_lillebekk_plan_case_001");
    if (!formal || formal.status === "closed" || formal.closed_at) return { ok: false, reason: "Saken er avsluttet." };
    try {
      world.appendWorkObjectHistory(formal.work_object_id, {
        event_id: "lillebekk_elin3_svar_" + question.id + "_v" + (question.count + 1),
        scene_id: "lillebekk_elin3_svarmote", choice_id: actionId, outcome: actionId,
        at: new Date().toISOString(), note
      });
      return { ok: true, alreadyLogged: false };
    } catch (error) {
      if (window.DEBUG) console.warn("[Civication] Lillebekk Elin svarmøte", error);
      return { ok: false, reason: "Svaret kunne ikke journalføres." };
    }
  }

  function recordLillebekkElinSvarmoteReferat(recommendation) {
    const model = lillebekkElinSvarmoteModel();
    if (!model?.complete) return { ok: false, reason: "Alle tre lederutfordringene må besvares faglig forsvarlig først." };
    const reason = String(recommendation || "").replace(/\s+/g, " ").trim().slice(0, 1000);
    if (reason.length < 85) return { ok: false, reason: "Beskriv ansvar, dokumentkrav og forslag til neste internmøte (minst 85 tegn)." };
    const note = [
      "LILLEBEKK – SIMULERT REFERAT FRA ELINS OPPFØLGINGSMØTE (INGEN GODKJENNING)",
      "Gjennomgått internt oppfølgingsnotat: " + model.memo.latestReport.id,
      "Tre faglige spørsmål og konkret arbeidsfordeling:",
      ...model.questions.map(function (q) { return "- " + q.ref + " / " + q.title + ": " + q.question + " Elins svar: " + q.feedback + " " + q.task; }),
      "Rådgiverens oppfølgingsplan: " + reason,
      "Simulert lederbeskjed: Saken blir i intern bearbeiding. Fremskaff eller bestill kontrollert dokumentasjon før en ny vurdering av når saken eventuelt kan sendes til videre kommunal behandling.",
      "Uavklarte forhold gjelder skolevei, overvann, § 4.1 og tidligere registrerte fagtema. Ingen fagavvik er automatisk lukket.",
      "Dette er ikke en faktisk utsendelse, kontrollrapport, ledergodkjenning, administrativ godkjenning eller politisk planvedtak.",
      "Kildeversjoner: " + model.signature
    ].join("\n");
    if (model.latestReport?.note === note) return { ok: true, alreadyLogged: true };
    const sameSource = String(model.latestReport?.note || "").endsWith("Kildeversjoner: " + model.signature);
    if (model.reportsCount >= 10 && sameSource) return { ok: false, reason: "Revisjonsgrensen er nådd for uendret møtegrunnlag." };
    const world = window.CivicationWorkWorld;
    if (typeof world?.appendWorkObjectHistory !== "function") return { ok: false, reason: "Saksloggen er utilgjengelig." };
    const formal = world.getWorkObject("by_radgiver_lillebekk_plan_case_001");
    if (!formal || formal.status === "closed" || formal.closed_at) return { ok: false, reason: "Saken er avsluttet." };
    try {
      world.appendWorkObjectHistory(formal.work_object_id, {
        event_id: "lillebekk_elin3_motereferat_v" + (model.reportsCount + 1),
        scene_id: "lillebekk_elin3_svarmote",
        choice_id: "journalfor_intern_lederoppfolging", outcome: "intern_opparbeiding_ikke_godkjent",
        at: new Date().toISOString(), note
      });
      return { ok: true, alreadyLogged: false };
    } catch (error) {
      if (window.DEBUG) console.warn("[Civication] Lillebekk Elin referat", error);
      return { ok: false, reason: "Møtereferatet kunne ikke journalføres." };
    }
  }


  // The professional control plan follows Elin's simulated meeting. Work
  // packages are internal drafts, not issued requests or completed reports.
  const LILLEBEKK_KONTROLLPAKKER = [
    {
      id: "trafikk", ref: "LBK-KP-18", title: "Kontrolloppdrag: skolevei ved punkt B",
      owner: "Kommunens trafikkfaglige saksbehandler",
      issue: "Skissen oppgir 1,25 m normal gangbredde, men 0,90 m under varelevering.",
      required: "Målsatt ganglinje i normal og avvikende leveringssituasjon, sikt og risiko, signert driftsopplegg med ansvar, og kontroll før første innflytting.",
      dependency: "Må vurderes opp mot plankartets gangtrasé og rekkefølgekravet i § 4.1.",
      safeId: "be_om_trafikkfaglig_kontrollpakke",
      safeLabel: "Registrer intern trafikkfaglig kontrollbestilling som utkast",
      unsafeId: "marker_skolevei_som_kontrollert",
      unsafeLabel: "Lukk skoleveiavviket på grunnlag av skissetallene"
    },
    {
      id: "overvann", ref: "LBK-KP-19", title: "Kontrolloppdrag: vann til vestre naboeiendom",
      owner: "Kommunens VA-/overvannsfaglige saksbehandler",
      issue: "Oppgitte 42 m³ tilrenning og 26 m³ fordrøyning gir ikke dokumentert utløpskapasitet.",
      required: "Daterte beregningspremisser, kapasitet i vestre utløp, ekstremnedbørscenario, flomvei, terrengsnitt og dokumentert virkning for nabo i vest.",
      dependency: "Kontrollresultatene må legges til grunn før planvilkår og avbøtende tiltak utformes.",
      safeId: "be_om_hydraulisk_kontrollpakke",
      safeLabel: "Registrer intern VA-faglig kontrollbestilling som utkast",
      unsafeId: "marker_overvann_som_kontrollert",
      unsafeLabel: "Lukk overvannsavviket med de to volumtallene"
    },
    {
      id: "planjuss", ref: "LBK-KP-20", title: "Kontrolloppdrag: bestemmelse § 4.1",
      owner: "Kommunal planjurist",
      issue: "Fiktivt internt notat gir ingen endelig konklusjon om hjemmel, kartfesting og ansvar.",
      required: "Skriftlig kartavstemming av gangtrasé, hjemmel og formulering, tidspunkt før første innflytting og gjennomføringsansvar; vurder også hvorfor ferdigattest for hele prosjektet ikke kan erstatte kontrollen.",
      dependency: "Planjuss må bygge på oppdatert trafikkfaglig kontroll, ikke bare utbyggers løfter.",
      safeId: "be_om_planjuridisk_sluttkontroll",
      safeLabel: "Registrer intern juridisk sluttkontroll som utkast",
      unsafeId: "bekreft_bestemmelse_som_vedtatt",
      unsafeLabel: "Marker § 4.1 som allerede vedtatt"
    }
  ];

  function lillebekkKontrollplanModel() {
    const meeting = lillebekkElinSvarmoteModel();
    if (!meeting?.latestReport) return null;
    const world = window.CivicationWorkWorld;
    const formal = world?.getWorkObject?.("by_radgiver_lillebekk_plan_case_001");
    if (!formal || formal.status === "closed" || formal.closed_at) return null;
    const history = Array.isArray(formal.history) ? formal.history : [];
    const source = meeting.signature + "|" + meeting.latestReport.id;
    const packages = LILLEBEKK_KONTROLLPAKKER.map(function (item) {
      const events = history.filter(function (event) {
        return String(event.id || "").startsWith("lillebekk_kontrollpakke_" + item.id + "_v");
      });
      const latest = events[events.length - 1] || null;
      const belongs = !!meeting.current && String(latest?.note || "").startsWith(
        "Lederreferat: " + meeting.latestReport.id + ";");
      return { ...item, count: events.length, latestId: latest?.id || "",
        latestNote: latest?.note || "", latestOutcome: latest?.outcome || "",
        current: !!belongs, safe: !!belongs && latest?.outcome === item.safeId };
    });
    const ready = !!meeting.current && packages.every(function (item) { return item.safe; });
    const signature = [source].concat(packages.map(function (item) { return item.latestId; })).join("|");
    const reports = history.filter(function (event) {
      return String(event.id || "").startsWith("lillebekk_kontrollplan_v");
    });
    const latestPlan = reports[reports.length - 1] || null;
    const current = ready && !!latestPlan &&
      String(latestPlan.note || "").endsWith("Kildeversjoner: " + signature);
    return { meeting, packages, source, ready, signature,
      planCount: reports.length, latestPlan, current };
  }

  function recordLillebekkKontrollpakke(id, choiceId, justification) {
    const model = lillebekkKontrollplanModel();
    const item = model?.packages.find(function (row) { return row.id === id; });
    if (!model?.meeting.current || !item || ![item.safeId, item.unsafeId].includes(choiceId)) {
      return { ok: false, reason: "Et gjeldende internt lederreferat og en gyldig kontrolloppgave kreves." };
    }
    const text = String(justification || "").replace(/\s+/g, " ").trim().slice(0, 750);
    if (text.length < 65) {
      return { ok: false, reason: "Angi fagansvar, dokumentkrav og kontrollgrense (minst 65 tegn)." };
    }
    const safe = choiceId === item.safeId;
    const note = [
      "Lederreferat: " + model.meeting.latestReport.id + "; INTERN KONTROLLPAKKE " + item.ref,
      "Kontrolloppgave: " + item.title,
      "Fagansvarlig: " + item.owner,
      "Kildens mangel: " + item.issue,
      "Forventet leveranse: " + item.required,
      "Avhengighet: " + item.dependency,
      "Rådgiverens valg: " + (safe ? item.safeLabel : item.unsafeLabel),
      "Begrunnelse: " + text,
      safe ? "Utkast – IKKE SENDT. Ingen dokumentasjon mottatt eller faglig verifisert."
        : "FAGLIG FEIL: Ingen avvik lukkes. Utkastet kan ikke brukes som verifikasjon eller godkjenning.",
      "Ikke et planvedtak, en godkjent bestilling eller et mottatt kontrollresultat."
    ].join("\n");
    if (item.latestNote === note && item.latestOutcome === choiceId) return { ok: true, alreadyLogged: true };
    const sameSource = String(item.latestNote || "").startsWith("Lederreferat: " + model.meeting.latestReport.id + ";");
    if (item.count >= 10 && sameSource &&
        !(item.latestOutcome !== item.safeId && safe)) {
      return { ok: false, reason: "Grensen er nådd. Bare korrigering av en uforsvarlig konklusjon er tillatt." };
    }
    const world = window.CivicationWorkWorld;
    if (typeof world?.appendWorkObjectHistory !== "function") return { ok: false, reason: "Saksloggen er utilgjengelig." };
    const formal = world.getWorkObject("by_radgiver_lillebekk_plan_case_001");
    if (!formal || formal.status === "closed" || formal.closed_at) return { ok: false, reason: "Saken er avsluttet." };
    try {
      world.appendWorkObjectHistory(formal.work_object_id, {
        event_id: "lillebekk_kontrollpakke_" + item.id + "_v" + (item.count + 1),
        scene_id: "lillebekk_kontrollplan", choice_id: choiceId, outcome: choiceId,
        at: new Date().toISOString(), note
      });
      return { ok: true, alreadyLogged: false };
    } catch (error) {
      if (window.DEBUG) console.warn("[Civication] Lillebekk kontrollpakke", error);
      return { ok: false, reason: "Kontrolloppgaven kunne ikke journalføres." };
    }
  }

  function recordLillebekkKontrollplan(justification) {
    const model = lillebekkKontrollplanModel();
    if (!model?.ready) {
      return { ok: false, reason: "Tre faglig forsvarlige interne kontrolloppgaver må journalføres først." };
    }
    const text = String(justification || "").replace(/\s+/g, " ").trim().slice(0, 1050);
    if (text.length < 90) return { ok: false, reason: "Beskriv oppfølgingsrekkefølge og stoppunkter før vedtaksbehandling (minst 90 tegn)." };
    const note = [
      "LILLEBEKK – INTERN KONTROLLPLAN ETTER ELINS OPPFØLGINGSMØTE (IKKE SENDT)",
      "Fiktivt lederreferat: " + model.meeting.latestReport.id,
      "Krav per fagdisiplin:",
      ...model.packages.map(function (item) {
        return "- " + item.ref + " / " + item.owner + ": " + item.required + " Avhengighet: " + item.dependency;
      }),
      "Stoppunkt A: Før faglig vurdering – innhent daterte kontrollgrunnlag fra trafikkfag og VA; skissetall alene er utilstrekkelige.",
      "Stoppunkt B: Før bestemmelsesrevisjon – intern planjurist må avstemme § 4.1 mot kontrollerte trafikkpremisser og plankart.",
      "Stoppunkt C: Før eventuell ny ledergjennomgang – kontroller at rapportene faktisk er mottatt og vurdert; sjekk også øvrige åpne fagtema. Ingen automatisk klarsignal til planvedtak.",
      "Rådgiverens plan: " + text,
      "Status: Journalført intern plan med utkast til oppdrag. Ingen bestilling er sendt, ingen rapporter er mottatt, ingen tekniske forhold er erklært verifisert, og ingen avvik er lukket.",
      "Kildeversjoner: " + model.signature
    ].join("\n");
    if (model.latestPlan?.note === note) return { ok: true, alreadyLogged: true };
    if (model.planCount >= 10 && model.current) return { ok: false, reason: "Revisjonsgrensen for uendrede kilder er nådd." };
    const world = window.CivicationWorkWorld;
    if (typeof world?.appendWorkObjectHistory !== "function") return { ok: false, reason: "Saksloggen er utilgjengelig." };
    const formal = world.getWorkObject("by_radgiver_lillebekk_plan_case_001");
    if (!formal || formal.status === "closed" || formal.closed_at) return { ok: false, reason: "Saken er avsluttet." };
    try {
      world.appendWorkObjectHistory(formal.work_object_id, {
        event_id: "lillebekk_kontrollplan_v" + (model.planCount + 1),
        scene_id: "lillebekk_kontrollplan", choice_id: "journalfor_intern_kontrollplan",
        outcome: "intern_arbeidsplan_uten_utsendelse", at: new Date().toISOString(), note
      });
      return { ok: true, alreadyLogged: false };
    } catch (error) {
      if (window.DEBUG) console.warn("[Civication] Lillebekk kontrollplan", error);
      return { ok: false, reason: "Kontrollplanen kunne ikke journalføres." };
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
        html += model.docs.every(function (doc) { return doc.safe; }) && !model.leader.memo.ready
          ? '<p><strong>Stopp i grunnlaget:</strong> En tidligere kildeavstemming er blitt uforsvarlig. Korriger vurderingen i bilagsavstemmingen før et supplerende fagnotat kan journalføres.</p>'
          : '<p>Et supplerende fagnotat krever tre faglig forsvarlige vurderinger. Å anta at en undersøkelse allerede er gjort, blir journalført som feilvurdering og må korrigeres.</p>';
      }
    }
    return html + '</details>';
  }


  function lillebekkKontrollbilagHtml() {
    const model = lillebekkKontrollbilagModel();
    if (!model) return "";
    let html = '<details class="civi-inbox-history" data-civi-lillebekk-kontrollbilag="1">' +
      '<summary>Dokumentkontroll – skolevei, flomvei og rekkefølgekrav</summary>' +
      '<p>Tre avgrensede, fiktive kontrollbilag. Tall og utdrag er laget for spillet; de beskriver ikke faktiske oppmålinger, juridiske vedtak eller verifiserte rapporter.</p>';
    if (!model.sourcesCurrent) {
      html += '<p><strong>Arbeidet er sperret:</strong> Tidligere kildeavstemming eller supplerende fagnotat er utdatert. Rett grunnlaget før kontrollbilagene kan behandles videre.</p>';
    } else {
      html += '<p><strong>Forsvarlige dokumentavstemminger:</strong> ' +
        model.docs.filter(function (doc) { return doc.safe; }).length + ' av 3.</p>';
      html += model.docs.map(function (doc) {
        return '<section class="civi-inbox-body" data-civi-kontrollbilag-id="' + escapeHtml(doc.id) + '">' +
          '<h4>' + escapeHtml(doc.ref) + ' – ' + escapeHtml(doc.title) + '</h4>' +
          doc.evidence.map(function (item) {
            return '<p><strong>' + escapeHtml(item.ref) + ' · ' + escapeHtml(item.label) + '</strong>: ' +
              escapeHtml(item.text) + '</p>';
          }).join("") +
          '<p><strong>Hva må sammenholdes?</strong> ' + escapeHtml(doc.discrepancy) + '</p>' +
          (doc.lastNote ? '<p><strong>Siste vurdering:</strong> ' + escapeHtml(doc.lastNote) + '</p>' : '') +
          '<label>Rådgiverens konklusjon <select data-civi-kontrollbilag-action>' +
            '<option value="' + escapeHtml(doc.safeId) + '"' +
              (doc.lastOutcome === doc.safeId ? ' selected' : '') + '>' +
              escapeHtml(doc.safeLabel) + '</option>' +
            '<option value="' + escapeHtml(doc.unsafeId) + '"' +
              (doc.lastOutcome === doc.unsafeId ? ' selected' : '') + '>' +
              escapeHtml(doc.unsafeLabel) + '</option></select></label>' +
          '<label>Begrunnelse <textarea rows="3" maxlength="650" data-civi-kontrollbilag-reason ' +
            'placeholder="Beskriv hva de to dokumentene viser, motstriden og hvem som skal kontrollere"></textarea></label>' +
          '<button class="civi-btn secondary" type="button" data-civi-kontrollbilag-assess="1" ' +
            'data-doc-id="' + escapeHtml(doc.id) + '">Journalfør dokumentavstemming</button>' +
          '<p class="muted" role="status" data-civi-kontrollbilag-error></p>' +
        '</section>';
      }).join("");
    }
    if (model.latestReport) {
      html += '<h4>Intern kontrollprotokoll' + (model.current ? ' – gjeldende bilag' : ' – tidligere versjon') + '</h4>' +
        '<pre class="civi-inbox-body" style="white-space:pre-wrap;overflow-wrap:anywhere">' +
        escapeHtml(model.latestReport.note) + '</pre>';
    }
    if (model.ready) {
      html += '<section class="civi-inbox-body" data-civi-kontrollbilag-editor="1">' +
        '<h4>Kontrollprotokoll til neste arbeidsrunde</h4>' +
        '<p>Angi hvem som må kontrollere de tre avvikene og hva som skal leveres før en ny ledervurdering. Protokollen er ikke et vedtak.</p>' +
        '<label>Anbefaling <textarea rows="4" maxlength="850" data-civi-kontrollbilag-recommendation ' +
          'placeholder="Hvem skal måle gangareal, kontrollere flomvei og gjennomgå rekkefølgetekst?"></textarea></label>' +
        '<button class="civi-btn secondary" type="button" data-civi-kontrollbilag-report="1">Journalfør intern kontrollprotokoll</button>' +
        '<p class="muted" role="status" data-civi-kontrollbilag-report-error></p></section>';
    } else if (model.sourcesCurrent) {
      html += '<p>En kontrollprotokoll krever tre forsvarlige dokumentavstemminger. Feilaktige konklusjoner må korrigeres før videre journalføring.</p>';
    }
    return html + '</details>';
  }


  function lillebekkKontrollresultatHtml() {
    const model = lillebekkKontrollresultatModel();
    if (!model) return "";
    let html = '<details class="civi-inbox-history" data-civi-lillebekk-resultater="1">' +
      '<summary>Kontrollresultater – dokumentfunn og ny anbefaling</summary>' +
      '<p>Alle tre resultatarkene er laget for spilløvelsen. Oppgitte målinger, regneeksempler og juridiske merknader er ikke faktiske undersøkelser eller godkjenninger.</p>';
    if (!model.sourcesCurrent) {
      html += '<p><strong>Foreløpig sperret:</strong> Den tidligere kontrollprotokollen er utdatert. Oppdater kildeavstemming og protokoll før du vurderer nye resultatark.</p>';
    } else if (!model.intake) {
      html += '<p>Det interne dokumentgrunnlaget er kontrollert. Åpne de tre fiktive resultatarkene og undersøk hva opplysningene faktisk kan begrunne.</p>' +
        '<button class="civi-btn secondary" type="button" data-civi-resultater-intake="1">Åpne tre fiktive resultatark</button>' +
        '<p class="muted" role="status" data-civi-resultater-intake-error></p>';
    } else {
      html += '<p><strong>Faglig forsvarlige resultatvurderinger:</strong> ' +
        model.docs.filter(function (doc) { return doc.safe; }).length + ' av 3.</p>';
      html += model.docs.map(function (doc) {
        return '<section class="civi-inbox-body" data-civi-resultat-id="' + escapeHtml(doc.id) + '">' +
          '<h4>' + escapeHtml(doc.ref) + ' – ' + escapeHtml(doc.title) + '</h4>' +
          '<p><strong>Fiktiv avsender:</strong> ' + escapeHtml(doc.sender) + '</p>' +
          doc.findings.map(function (finding) {
            return '<p>' + escapeHtml(finding) + '</p>';
          }).join("") +
          '<p><strong>Hva resultatet ikke beviser:</strong> ' + escapeHtml(doc.assessment) + '</p>' +
          (doc.lastNote ? '<p><strong>Journalført vurdering:</strong> ' +
            escapeHtml(doc.lastNote) + '</p>' : '') +
          '<label>Faglig handling <select data-civi-resultat-choice>' +
            '<option value="' + escapeHtml(doc.safeId) + '"' +
              (doc.lastOutcome === doc.safeId ? ' selected' : '') + '>' +
              escapeHtml(doc.safeLabel) + '</option>' +
            '<option value="' + escapeHtml(doc.unsafeId) + '"' +
              (doc.lastOutcome === doc.unsafeId ? ' selected' : '') + '>' +
              escapeHtml(doc.unsafeLabel) + '</option></select></label>' +
          '<label>Begrunnelse <textarea rows="3" maxlength="650" data-civi-resultat-reason ' +
            'placeholder="Hvilke funn er dokumentert i spillet, hva er fortsatt usikkert, og hvem må følge opp?"></textarea></label>' +
          '<button class="civi-btn secondary" type="button" data-civi-resultat-assess="1" ' +
            'data-resultat-id="' + escapeHtml(doc.id) + '">Journalfør vurdering</button>' +
          '<p class="muted" role="status" data-civi-resultat-error></p>' +
        '</section>';
      }).join("");
    }
    if (model.latestProposal) {
      html += '<h4>Oppdatert beslutningsgrunnlag' +
        (model.current ? ' – gjeldende kildeversjoner' : ' – utdatert grunnlag') + '</h4>' +
        '<pre class="civi-inbox-body" style="white-space:pre-wrap;overflow-wrap:anywhere">' +
        escapeHtml(model.latestProposal.note) + '</pre>';
    }
    if (model.ready) {
      html += '<section class="civi-inbox-body" data-civi-beslutningsgrunnlag-editor="1">' +
        '<h4>Administrativ anbefaling til planleder Elin</h4>' +
        '<p>Sammenhold resultater, manglende faglig dokumentasjon og hvem som må gjøre videre kontroll. Dette lager bare et internt arbeidsgrunnlag.</p>' +
        '<label>Anbefaling <textarea rows="4" maxlength="950" data-civi-beslutningsgrunnlag-reason ' +
          'placeholder="Anbefal hvordan uavklarte ganglinje-, overvanns- og rekkefølgeforhold skal følges opp"></textarea></label>' +
        '<button class="civi-btn secondary" type="button" data-civi-beslutningsgrunnlag-save="1">Journalfør oppdatert internt beslutningsgrunnlag</button>' +
        '<p class="muted" role="status" data-civi-beslutningsgrunnlag-error></p></section>';
    } else if (model.intake && model.sourcesCurrent) {
      html += '<p>Et nytt beslutningsgrunnlag krever tre faglig forsvarlige resultatvurderinger. Feilkonklusjoner må korrigeres først.</p>';
    }
    return html + '</details>';
  }


  function lillebekkNyLedervurderingHtml() {
    const model = lillebekkNyLedervurderingModel();
    if (!model) return "";
    let html = '<details class="civi-inbox-history" data-civi-lillebekk-leder2="1">' +
      '<summary>Elin – ny ledervurdering etter kontrollresultatene</summary>' +
      '<p>Dette er en forhåndsskrevet, fiktiv kommunal lederrespons i spillet. Rådgiveren gir anbefaling, mens Elins simulerte respons avgrenser hva som kan forberedes. Ingen faktisk lederbeslutning eller planvedtak sendes.</p>';
    if (model.latestReview) {
      html += '<p><strong>Sist journalført lederrespons' +
        (model.currentReview ? ' – gjeldende' : ' – utdatert kildegrunnlag') +
        ':</strong></p><pre class="civi-inbox-body" style="white-space:pre-wrap;overflow-wrap:anywhere">' +
        escapeHtml(model.latestReview.note) + '</pre>';
    }
    if (!model.decision.current) {
      html += '<p><strong>Stopp:</strong> Oppdatert beslutningsgrunnlag er ikke gjeldende. Korriger kontrollresultater, kildevurderinger og beslutningsgrunnlag før ledergjennomgang.</p>';
    } else if (!model.accepted) {
      if (model.currentReview) {
        html += '<p><strong>Elin har avvist direkte oversendelse.</strong> Dokumentmanglene står åpne. Begrunn en ny forsvarlig administrativ anbefaling.</p>';
      }
      html += '<section class="civi-inbox-body" data-civi-leder2-editor="1">' +
        '<h4>Rådgiverens forslag til Elin</h4>' +
        '<p>Vurder de åpne kontrollbehovene. Intern saksforberedelse er noe annet enn formell oversendelse til politisk behandling.</p>' +
        '<label>Administrativ anbefaling <select data-civi-leder2-choice>' +
          LILLEBEKK_LEDER_2_CHOICES.map(function (choice) {
            return '<option value="' + escapeHtml(choice.id) + '">' + escapeHtml(choice.label) + '</option>';
          }).join("") + '</select></label>' +
        '<label>Begrunnelse <textarea rows="3" maxlength="750" data-civi-leder2-reason ' +
          'placeholder="Begrunn ut fra manglende sikkerhets-, overvanns- og juridisk dokumentasjon"></textarea></label>' +
        '<button class="civi-btn secondary" type="button" data-civi-leder2-review="1">Journalfør anbefaling og simulert lederrespons</button>' +
        '<p class="muted" role="status" data-civi-leder2-error></p></section>';
    } else {
      html += '<p><strong>Elins administrative oppfølging:</strong> ' +
        (model.latestReview.outcome === "simulert_leder_retur_for_supplering"
          ? 'Saken er returnert for konkret supplering.'
          : 'Bare intern dokumentforberedelse er tillatt; ikke oversendelse til vedtak.') +
        ' Ingen avvik er ferdig kontrollert eller lukket.</p>' +
        '<p><strong>Forsvarlige oppfølgingsoppgaver:</strong> ' +
        model.tasks.filter(function (task) { return task.safe; }).length + ' av 3.</p>';
      html += model.tasks.map(function (task) {
        return '<section class="civi-inbox-body" data-civi-leder2-task-id="' + escapeHtml(task.id) + '">' +
          '<h4>' + escapeHtml(task.ref) + ' – ' + escapeHtml(task.title) + '</h4>' +
          '<p><strong>Elins merknad:</strong> ' + escapeHtml(task.managerNote) + '</p>' +
          '<p><strong>Nødvendig leveranse:</strong> ' + escapeHtml(task.action) + '</p>' +
          (task.safe ? '<p><strong>Oppgave dokumentert i saksloggen.</strong> Ingen bestilling er sendt.</p>' : '') +
          '<label>Oppfølgingshandling <select data-civi-leder2-task-choice>' +
            '<option value="' + escapeHtml(task.safeId) + '"' +
              (task.latestOutcome === task.safeId ? ' selected' : '') + '>' +
              escapeHtml(task.safeLabel) + '</option>' +
            '<option value="' + escapeHtml(task.unsafeId) + '"' +
              (task.latestOutcome === task.unsafeId ? ' selected' : '') + '>' +
              escapeHtml(task.unsafeLabel) + '</option></select></label>' +
          '<label>Begrunnelse og fagansvar <textarea rows="3" maxlength="700" data-civi-leder2-task-reason ' +
            'placeholder="Hva må leveres og hvem skal kontrollere før videre behandling?"></textarea></label>' +
          '<button class="civi-btn secondary" type="button" data-civi-leder2-task-save="1" data-task-id="' +
            escapeHtml(task.id) + '">Journalfør intern oppfølgingsoppgave</button>' +
          '<p class="muted" role="status" data-civi-leder2-task-error></p>' +
        '</section>';
      }).join("");
      if (model.latestReport) {
        html += '<h4>Internt oppfølgingsnotat' +
          (model.current ? ' – gjeldende' : ' – eldre versjon') +
          '</h4><pre class="civi-inbox-body" style="white-space:pre-wrap;overflow-wrap:anywhere">' +
          escapeHtml(model.latestReport.note) + '</pre>';
      }
      if (model.ready) {
        html += '<section class="civi-inbox-body" data-civi-leder2-report-editor="1">' +
          '<h4>Samlet oppfølgingsplan</h4>' +
          '<p>Fordel faglige kontroller og dokumentleveranser. Notatet er internt, ikke en utsendelse eller et vedtak.</p>' +
          '<label>Rådgiverens plan <textarea rows="4" maxlength="900" data-civi-leder2-report-reason ' +
            'placeholder="Trafikkfag: ... Overvann: ... Planjuss: ..."></textarea></label>' +
          '<button class="civi-btn secondary" type="button" data-civi-leder2-report-save="1">Journalfør intern oppfølgingsplan</button>' +
          '<p class="muted" role="status" data-civi-leder2-report-error></p></section>';
      } else {
        html += '<p>Planen kan først journalføres når de tre faglige kontrolloppgavene er riktig formulert og begrunnet.</p>';
      }
    }
    return html + '</details>';
  }


  function lillebekkSuppleringssvarHtml() {
    const model = lillebekkSuppleringssvarModel();
    if (!model) return "";
    let html = '<details class="civi-inbox-history" data-civi-lillebekk-supplering="1">' +
      '<summary>Suppleringssvar – dokumentkontroll og åpne restanser</summary>' +
      '<p>Tre fiktive, forhåndsskrevne dokumentutdrag til spillet. Disse er ikke faktiske innkomne bilag eller bekreftede undersøkelser.</p>';
    if (!model.sourceCurrent) {
      html += '<p><strong>Sperret:</strong> Oppfølgingsnotatet etter Elins ledervurdering er ikke gjeldende. Oppdater det tidligere grunnlaget før suppleringen kan kontrolleres.</p>';
    } else {
      html += '<p><strong>Forsvarlig dokumentgjennomgang:</strong> ' +
        model.docs.filter(function (doc) { return doc.safe; }).length + ' av 3.</p>';
      html += model.docs.map(function (doc) {
        return '<section class="civi-inbox-body" data-civi-supplering-id="' + escapeHtml(doc.id) + '">' +
          '<h4>' + escapeHtml(doc.ref) + ' – ' + escapeHtml(doc.title) + '</h4>' +
          '<p><strong>Fiktiv avsender:</strong> ' + escapeHtml(doc.sender) + '</p>' +
          doc.document.map(function (text) { return '<p>' + escapeHtml(text) + '</p>'; }).join("") +
          '<p><strong>Dette kan konkluderes:</strong> ' + escapeHtml(doc.verified) + '</p>' +
          '<p><strong>Restanse:</strong> ' + escapeHtml(doc.followup) + '</p>' +
          (doc.latestNote ? '<p><strong>Gjeldende journalspor:</strong> ' + escapeHtml(doc.latestNote) + '</p>' : '') +
          '<label>Faglig dokumentbehandling <select data-civi-supplering-choice>' +
            '<option value="' + escapeHtml(doc.safeId) + '"' +
              (doc.latestOutcome === doc.safeId ? ' selected' : '') + '>' + escapeHtml(doc.safeLabel) + '</option>' +
            '<option value="' + escapeHtml(doc.unsafeId) + '"' +
              (doc.latestOutcome === doc.unsafeId ? ' selected' : '') + '>' + escapeHtml(doc.unsafeLabel) + '</option></select></label>' +
          '<label>Begrunnelse <textarea rows="3" maxlength="720" data-civi-supplering-reason ' +
            'placeholder="Hva har endret seg i bilaget, hva mangler fortsatt, og hvem skal kontrollere?"></textarea></label>' +
          '<button class="civi-btn secondary" type="button" data-civi-supplering-save="1" data-doc-id="' +
            escapeHtml(doc.id) + '">Journalfør intern dokumentvurdering</button>' +
          '<p class="muted" role="status" data-civi-supplering-error></p></section>';
      }).join("");
    }
    if (model.latestMatrix) {
      html += '<h4>Intern restansematrise' + (model.current ? ' – gjeldende' : ' – utdatert') + '</h4>' +
        '<pre class="civi-inbox-body" style="white-space:pre-wrap;overflow-wrap:anywhere">' +
        escapeHtml(model.latestMatrix.note) + '</pre>';
    }
    if (model.ready) {
      html += '<section class="civi-inbox-body" data-civi-supplering-matrix-editor="1">' +
        '<h4>Samlet restanseliste til videre saksarbeid</h4>' +
        '<p>Angi hvilke dokumenter som må rettes eller suppleres før ny intern ledervurdering. Listen lukker ingen fagavvik.</p>' +
        '<label>Oppgavefordeling og dokumentkrav <textarea rows="4" maxlength="950" data-civi-supplering-matrix-reason ' +
          'placeholder="Trafikk: ... Overvann: ... Planjuss: ..."></textarea></label>' +
        '<button class="civi-btn secondary" type="button" data-civi-supplering-matrix-save="1">Journalfør intern restansematrise</button>' +
        '<p class="muted" role="status" data-civi-supplering-matrix-error></p></section>';
    } else if (model.sourceCurrent) {
      html += '<p>En intern restansematrise krever forsvarlige vurderinger av alle tre dokumentutdragene. Feilaktige konklusjoner kan korrigeres.</p>';
    }
    return html + '</details>';
  }


  function lillebekkUtkastHtml() {
    const model = lillebekkUtkastModel();
    if (!model) return "";
    let html = '<details class="civi-inbox-history" data-civi-lillebekk-utkast="1">' +
      '<summary>Dokumentutkast – utbygger og intern planjuss</summary>' +
      '<p>Teknisk dokumentasjon etterspørres fra utbygger. Juridisk kvalitetssikring bestilles internt. Her journalføres bare fiktive, usendte utkast; ingen svar, rapporter eller godkjenninger oppstår.</p>';
    if (!model.ready) {
      html += '<p><strong>Sperret:</strong> Restansematrisen er utdatert og må oppdateres før nye utkast.</p>';
    } else {
      html += '<p><strong>Gjeldende utkast:</strong> ' +
        model.drafts.filter(function (draft) { return draft.current; }).length + ' av 2.</p>';
    }
    html += model.drafts.map(function (draft) {
      return '<section class="civi-inbox-body" data-civi-utkast-kind="' + escapeHtml(draft.id) + '">' +
        '<h4>' + escapeHtml(draft.title) + '</h4>' +
        '<p><strong>Fiktiv mottaker:</strong> ' + escapeHtml(draft.recipient) + '</p>' +
        '<p><strong>Bilag:</strong> ' + escapeHtml(draft.refs.join(", ")) + '</p>' +
        draft.requirements.map(function (requirement) { return '<p>' + escapeHtml(requirement) + '</p>'; }).join("") +
        '<p><strong>Myndighetsgrense:</strong> ' + escapeHtml(draft.boundary) + '</p>' +
        (draft.latestNote ? '<details><summary>' + (draft.current ? 'Gjeldende' : 'Tidligere, utdatert') +
          ' utkast</summary><pre class="civi-inbox-body" style="white-space:pre-wrap;overflow-wrap:anywhere">' +
          escapeHtml(draft.latestNote) + '</pre></details>' : '') +
        (model.ready ?
          '<label>Begrunn dokumentbehov <textarea rows="3" maxlength="850" data-civi-utkast-reason ' +
          'placeholder="Hva mangler, hvem skal levere eller kontrollere det, og hvorfor?"></textarea></label>' +
          '<button class="civi-btn secondary" type="button" data-civi-utkast-save="1" data-kind="' +
          escapeHtml(draft.id) + '">Journalfør utkast – ikke send</button>' +
          '<p class="muted" role="status" data-civi-utkast-error></p>'
          : '') +
        '</section>';
    }).join("");
    return html + '</details>';
  }


  function lillebekkSvarrundeHtml() {
    const model = lillebekkSvarrundeModel();
    if (!model) return "";
    let html = '<details class="civi-inbox-history" data-civi-lillebekk-svarrunde="1">' +
      '<summary>Ny dokumentrunde – faglige svar (fiktiv øvelse)</summary>' +
      '<p>Et avgrenset treningsforløp med to forhåndsskrevne dokumentutdrag, ikke svar på faktisk utsendte brev. De tidligere utkastene er ikke sendt. Tall og juridiske formuleringer er øvingsmateriale.</p>';
    if (!model.canOpen) {
      html += '<p><strong>Ikke klar:</strong> Begge utkastene til utbygger og intern planjurist må være gjeldende før øvelsen åpnes.</p>';
    } else if (!model.opened) {
      html += '<p>Åpne dokumentrunden som en egen fiktiv saksøvelse. Dette innebærer ikke at dokumentene er sendt, at noen har svart i virkeligheten, eller at rapporter er godkjent.</p>' +
        '<button class="civi-btn secondary" type="button" data-civi-svarrunde-open="1">Åpne fiktiv dokumentrunde</button>' +
        '<p class="muted" role="status" data-civi-svarrunde-open-error></p>';
    } else {
      html += '<p><strong>Faglig holdbare vurderinger:</strong> ' +
        model.docs.filter(function (doc) { return doc.safe; }).length + ' av 2.</p>';
      html += model.docs.map(function (doc) {
        return '<section class="civi-inbox-body" data-civi-svarrunde-doc="' + escapeHtml(doc.id) + '">' +
          '<h4>' + escapeHtml(doc.ref) + ' – ' + escapeHtml(doc.title) + '</h4>' +
          '<p><strong>Fiktiv avsender:</strong> ' + escapeHtml(doc.sender) + '</p>' +
          doc.paragraphs.map(function (paragraph) { return '<p>' + escapeHtml(paragraph) + '</p>'; }).join("") +
          '<p><strong>Hva svarutdraget faktisk dokumenterer:</strong> ' + escapeHtml(doc.evidence) + '</p>' +
          '<p><strong>Neste faglige arbeidsoppgave:</strong> ' + escapeHtml(doc.task) + '</p>' +
          (doc.latestNote ? '<p><strong>Sist journalført (' + (doc.current ? 'gjeldende' : 'tidligere') +
            '):</strong> ' + escapeHtml(doc.latestNote) + '</p>' : '') +
          '<label>Vurdering <select data-civi-svarrunde-choice>' +
            '<option value="' + escapeHtml(doc.safeId) + '"' +
              (doc.latestOutcome === doc.safeId ? ' selected' : '') + '>' + escapeHtml(doc.safeLabel) + '</option>' +
            '<option value="' + escapeHtml(doc.unsafeId) + '"' +
              (doc.latestOutcome === doc.unsafeId ? ' selected' : '') + '>' + escapeHtml(doc.unsafeLabel) + '</option>' +
          '</select></label>' +
          '<label>Faglig begrunnelse <textarea rows="3" maxlength="700" data-civi-svarrunde-reason ' +
            'placeholder="Hva kan du fastslå, hva mangler fortsatt, og hvem må kontrollere det?"></textarea></label>' +
          '<button class="civi-btn secondary" type="button" data-civi-svarrunde-save="1" data-doc-id="' +
            escapeHtml(doc.id) + '">Journalfør vurdering av øvingssvar</button>' +
          '<p class="muted" role="status" data-civi-svarrunde-error></p></section>';
      }).join("");
      if (model.ready) {
        html += '<p><strong>Dokumentrunden er faglig gjennomgått.</strong> Skolevei, flomvei og planjuridiske spørsmål står fortsatt åpne. Ingen utsendelse, teknisk kontroll eller godkjenning er gjennomført.</p>';
      }
    }
    return html + '</details>';
  }


  function lillebekkSvarnotatHtml() {
    const model = lillebekkSvarnotatModel();
    if (!model) return "";
    let html = '<details class="civi-inbox-history" data-civi-lillebekk-svarnotat="1">' +
      '<summary>Samlet faglig oppfølgingsnotat – etter svarrunden</summary>' +
      '<p>Forbered intern ledergjennomgang av fiktive saksbilag. Notatet er en intern vurdering og kan ikke sende brev, godkjenne rapporter, lukke avvik eller fremme saken til planvedtak.</p>';
    if (model.latestReport) {
      html += '<h4>' + (model.current ? 'Gjeldende faglig oppfølgingsnotat' : 'Tidligere eller ikke faglig holdbart notat') + '</h4>' +
        '<pre class="civi-inbox-body" style="white-space:pre-wrap;overflow-wrap:anywhere">' +
        escapeHtml(model.latestReport.note) + '</pre>';
    }
    if (!model.ready) {
      html += '<p><strong>Sperret:</strong> Begge svarbilag må være vurdert faglig forsvarlig i en gjeldende fiktiv dokumentrunde. Kontroller eventuelle endrede kildeversjoner.</p>';
    } else {
      html += '<section class="civi-inbox-body" data-civi-svarnotat-editor="1">' +
        '<h4>Tre konkrete restanser før ny intern vurdering</h4>' +
        '<p><strong>Skolevei:</strong> Fri bredde 1,25 meter i skisse, 0,90 meter ved varelevering; trafikkfag må kontrollere målsatt plan, sikt og driftsopplegg.</p>' +
        '<p><strong>Overvann:</strong> Oppgitt 42 m³ tilrenning og 26 m³ fordrøyning; VA må kontrollere vestre utløp, ekstremnedbør og nabovirkning.</p>' +
        '<p><strong>Planjuss:</strong> Intern kontroll av § 4.1, gangtrasé i plankart, tidspunkt, hjemmel og gjennomføringsansvar før videre saksbehandling.</p>' +
        '<label>Intern anbefaling <select data-civi-svarnotat-choice>' +
          model.choices.map(function (choice) {
            return '<option value="' + escapeHtml(choice.id) + '"' +
              (model.latestReport?.outcome === choice.id ? ' selected' : '') + '>' +
              escapeHtml(choice.label) + '</option>';
          }).join("") +
        '</select></label>' +
        '<label>Faglig begrunnelse <textarea rows="4" maxlength="1050" data-civi-svarnotat-reason ' +
          'placeholder="Hvem skal kontrollere skolevei, overvann og rekkefølgekrav? Hva er fortsatt uavklart og hvorfor?"></textarea></label>' +
        '<button class="civi-btn secondary" type="button" data-civi-svarnotat-save="1">Journalfør samlet internt notat – ikke vedtak</button>' +
        '<p class="muted" role="status" data-civi-svarnotat-error></p></section>';
      if (model.current) {
        html += '<p>Notatet er oppdatert mot siste øvingsbilag. Neste steg kan være en separat simulert ledergjennomgang når faktiske fagkontroller er dokumentert i spillforløpet.</p>';
      }
    }
    return html + '</details>';
  }


  function lillebekkElinSvarmoteHtml() {
    const model = lillebekkElinSvarmoteModel();
    if (!model) return "";
    let html = '<details class="civi-inbox-history" data-civi-elin3-mote="1">' +
      '<summary>Elins oppfølgingsmøte – prøv anbefalingen mot dokumentene</summary>' +
      '<p>Fiktivt internt arbeidsmøte. Elin utfordrer begrunnelsen for skolevei, overvann og § 4.1. En gjennomgang er ikke et vedtak eller en faktisk fagkontroll.</p>';
    if (!model.memo.current) {
      html += '<p><strong>Sperret:</strong> Du må først ha et gjeldende, faglig holdbart internt oppfølgingsnotat fra den fiktive svarrunden.</p>';
    } else {
      html += '<p><strong>Dokumentert faglig svar:</strong> ' +
        model.questions.filter(function (q) { return q.safe; }).length + ' av 3.</p>';
      html += model.questions.map(function (q) {
        return '<section class="civi-inbox-body" data-civi-elin3-question="' + escapeHtml(q.id) + '">' +
          '<h4>' + escapeHtml(q.title) + '</h4><p>' + escapeHtml(q.question) + '</p>' +
          '<p><strong>Grunnlag:</strong> ' + escapeHtml(q.ref) + '</p>' +
          (q.latestNote ? '<p><strong>Siste journalvurdering' +
            (q.current ? '' : ' (utdatert)') + ':</strong> ' + escapeHtml(q.latestNote) + '</p>' : '') +
          '<label>Hva svarer du Elin? <select data-civi-elin3-choice>' +
            '<option value="' + escapeHtml(q.safeId) + '"' + (q.latestOutcome === q.safeId ? ' selected' : '') +
              '>' + escapeHtml(q.safeLabel) + '</option>' +
            '<option value="' + escapeHtml(q.unsafeId) + '"' + (q.latestOutcome === q.unsafeId ? ' selected' : '') +
              '>' + escapeHtml(q.unsafeLabel) + '</option></select></label>' +
          '<label>Faglig begrunnelse <textarea rows="3" maxlength="700" data-civi-elin3-reason ' +
            'placeholder="Hva viser dokumentet, hva er usikkert, og hvem har ansvar for kontroll?"></textarea></label>' +
          '<button class="civi-btn secondary" type="button" data-civi-elin3-save="1" data-question-id="' +
            escapeHtml(q.id) + '">Journalfør svar i simulert ledermøte</button>' +
          '<p class="muted" role="status" data-civi-elin3-error></p></section>';
      }).join("");
      if (model.complete) {
        html += '<section class="civi-inbox-body" data-civi-elin3-report-editor="1">' +
          '<h4>Oppsummer Elins arbeidsbeskjed</h4>' +
          '<p>Elin returnerer saken til konkret trafikkfaglig, VA-faglig og intern planjuridisk kontroll. Ingen fagrapporter er mottatt, og saken er ikke klar til vedtak.</p>' +
          '<label>Plan for oppfølging <textarea rows="4" maxlength="1000" data-civi-elin3-report-reason ' +
          'placeholder="Fordel trafikk, VA og juridiske avklaringer; angi dokumentkrav før ny intern vurdering."></textarea></label>' +
          '<button class="civi-btn secondary" type="button" data-civi-elin3-report-save="1">Journalfør simulert internt møtereferat</button>' +
          '<p class="muted" role="status" data-civi-elin3-report-error></p></section>';
      }
    }
    if (model.latestReport) {
      html += '<h4>' + (model.current ? 'Gjeldende internt møtereferat' : 'Tidligere eller utdatert møtereferat') + '</h4>' +
        '<pre class="civi-inbox-body" style="white-space:pre-wrap;overflow-wrap:anywhere">' +
        escapeHtml(model.latestReport.note) + '</pre>';
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
        ${lillebekkKontrollbilagHtml()}
        ${lillebekkKontrollresultatHtml()}
        ${lillebekkNyLedervurderingHtml()}
        ${lillebekkSuppleringssvarHtml()}
        ${lillebekkUtkastHtml()}
        ${lillebekkSvarrundeHtml()}
        ${lillebekkSvarnotatHtml()}
        ${lillebekkElinSvarmoteHtml()}
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
    host.querySelectorAll("[data-civi-elin3-save]").forEach(function (button) {
      button.addEventListener("click", function () {
        const card = button.closest("[data-civi-elin3-question]");
        const result = recordLillebekkElinSvarmoteSvar(
          String(button.getAttribute("data-question-id") || ""),
          card?.querySelector("[data-civi-elin3-choice]")?.value || "",
          card?.querySelector("[data-civi-elin3-reason]")?.value || "");
        if (result.ok) renderInboxSections();
        else {
          const message = card?.querySelector("[data-civi-elin3-error]");
          if (message) message.textContent = result.reason;
        }
      });
    });
    host.querySelectorAll("[data-civi-elin3-report-save]").forEach(function (button) {
      button.addEventListener("click", function () {
        const card = button.closest("[data-civi-elin3-report-editor]");
        const result = recordLillebekkElinSvarmoteReferat(
          card?.querySelector("[data-civi-elin3-report-reason]")?.value || "");
        if (result.ok) renderInboxSections();
        else {
          const message = card?.querySelector("[data-civi-elin3-report-error]");
          if (message) message.textContent = result.reason;
        }
      });
    });
    host.querySelectorAll("[data-civi-svarnotat-save]").forEach(function (button) {
      button.addEventListener("click", function () {
        const card = button.closest("[data-civi-svarnotat-editor]");
        const result = recordLillebekkSvarnotat(
          card?.querySelector("[data-civi-svarnotat-choice]")?.value || "",
          card?.querySelector("[data-civi-svarnotat-reason]")?.value || "");
        if (result.ok) renderInboxSections();
        else {
          const message = card?.querySelector("[data-civi-svarnotat-error]");
          if (message) message.textContent = result.reason;
        }
      });
    });
    host.querySelectorAll("[data-civi-svarrunde-open]").forEach(function (button) {
      button.addEventListener("click", function () {
        const result = recordLillebekkSvarrundeStart();
        if (result.ok) renderInboxSections();
        else {
          const message = button.closest("[data-civi-lillebekk-svarrunde]")?.querySelector("[data-civi-svarrunde-open-error]");
          if (message) message.textContent = result.reason;
        }
      });
    });
    host.querySelectorAll("[data-civi-svarrunde-save]").forEach(function (button) {
      button.addEventListener("click", function () {
        const card = button.closest("[data-civi-svarrunde-doc]");
        const result = recordLillebekkSvarvurdering(
          String(button.getAttribute("data-doc-id") || ""),
          card?.querySelector("[data-civi-svarrunde-choice]")?.value || "",
          card?.querySelector("[data-civi-svarrunde-reason]")?.value || "");
        if (result.ok) renderInboxSections();
        else {
          const message = card?.querySelector("[data-civi-svarrunde-error]");
          if (message) message.textContent = result.reason;
        }
      });
    });
    host.querySelectorAll("[data-civi-utkast-save]").forEach(function (button) {
      button.addEventListener("click", function () {
        const card = button.closest("[data-civi-utkast-kind]");
        const result = recordLillebekkUtkast(
          String(button.getAttribute("data-kind") || ""),
          card?.querySelector("[data-civi-utkast-reason]")?.value || "");
        if (result.ok) renderInboxSections();
        else {
          const message = card?.querySelector("[data-civi-utkast-error]");
          if (message) message.textContent = result.reason;
        }
      });
    });
    host.querySelectorAll("[data-civi-supplering-save]").forEach(function (button) {
      button.addEventListener("click", function () {
        const card = button.closest("[data-civi-supplering-id]");
        const result = recordLillebekkSuppleringsgjennomgang(
          String(button.getAttribute("data-doc-id") || ""),
          card?.querySelector("[data-civi-supplering-choice]")?.value || "",
          card?.querySelector("[data-civi-supplering-reason]")?.value || "");
        if (result.ok) renderInboxSections();
        else {
          const message = card?.querySelector("[data-civi-supplering-error]");
          if (message) message.textContent = result.reason;
        }
      });
    });
    host.querySelectorAll("[data-civi-supplering-matrix-save]").forEach(function (button) {
      button.addEventListener("click", function () {
        const card = button.closest("[data-civi-supplering-matrix-editor]");
        const result = recordLillebekkSuppleringsmatrise(
          card?.querySelector("[data-civi-supplering-matrix-reason]")?.value || "");
        if (result.ok) renderInboxSections();
        else {
          const message = card?.querySelector("[data-civi-supplering-matrix-error]");
          if (message) message.textContent = result.reason;
        }
      });
    });
    host.querySelectorAll("[data-civi-leder2-review]").forEach(function (button) {
      button.addEventListener("click", function () {
        const card = button.closest("[data-civi-leder2-editor]");
        const result = recordLillebekkNyLedervurdering(
          card?.querySelector("[data-civi-leder2-choice]")?.value || "",
          card?.querySelector("[data-civi-leder2-reason]")?.value || "");
        if (result.ok) renderInboxSections();
        else {
          const message = card?.querySelector("[data-civi-leder2-error]");
          if (message) message.textContent = result.reason;
        }
      });
    });
    host.querySelectorAll("[data-civi-leder2-task-save]").forEach(function (button) {
      button.addEventListener("click", function () {
        const card = button.closest("[data-civi-leder2-task-id]");
        const result = recordLillebekkLeder2Oppgave(
          String(button.getAttribute("data-task-id") || ""),
          card?.querySelector("[data-civi-leder2-task-choice]")?.value || "",
          card?.querySelector("[data-civi-leder2-task-reason]")?.value || "");
        if (result.ok) renderInboxSections();
        else {
          const message = card?.querySelector("[data-civi-leder2-task-error]");
          if (message) message.textContent = result.reason;
        }
      });
    });
    host.querySelectorAll("[data-civi-leder2-report-save]").forEach(function (button) {
      button.addEventListener("click", function () {
        const card = button.closest("[data-civi-leder2-report-editor]");
        const result = recordLillebekkLeder2Oppfolgingsnotat(
          card?.querySelector("[data-civi-leder2-report-reason]")?.value || "");
        if (result.ok) renderInboxSections();
        else {
          const message = card?.querySelector("[data-civi-leder2-report-error]");
          if (message) message.textContent = result.reason;
        }
      });
    });
    host.querySelectorAll("[data-civi-resultater-intake]").forEach(function (button) {
      button.addEventListener("click", function () {
        const result = recordLillebekkResultatMottak();
        if (result.ok) renderInboxSections();
        else {
          const message = button.closest("[data-civi-lillebekk-resultater]")?.querySelector("[data-civi-resultater-intake-error]");
          if (message) message.textContent = result.reason;
        }
      });
    });
    host.querySelectorAll("[data-civi-resultat-assess]").forEach(function (button) {
      button.addEventListener("click", function () {
        const card = button.closest("[data-civi-resultat-id]");
        const result = recordLillebekkResultatvurdering(
          String(button.getAttribute("data-resultat-id") || ""),
          card?.querySelector("[data-civi-resultat-choice]")?.value || "",
          card?.querySelector("[data-civi-resultat-reason]")?.value || "");
        if (result.ok) renderInboxSections();
        else {
          const message = card?.querySelector("[data-civi-resultat-error]");
          if (message) message.textContent = result.reason;
        }
      });
    });
    host.querySelectorAll("[data-civi-beslutningsgrunnlag-save]").forEach(function (button) {
      button.addEventListener("click", function () {
        const card = button.closest("[data-civi-beslutningsgrunnlag-editor]");
        const result = recordLillebekkBeslutningsgrunnlag(
          card?.querySelector("[data-civi-beslutningsgrunnlag-reason]")?.value || "");
        if (result.ok) renderInboxSections();
        else {
          const message = card?.querySelector("[data-civi-beslutningsgrunnlag-error]");
          if (message) message.textContent = result.reason;
        }
      });
    });
    host.querySelectorAll("[data-civi-kontrollbilag-assess]").forEach(function (button) {
      button.addEventListener("click", function () {
        const card = button.closest("[data-civi-kontrollbilag-id]");
        const result = recordLillebekkKontrollFunn(
          String(button.getAttribute("data-doc-id") || ""),
          card?.querySelector("[data-civi-kontrollbilag-action]")?.value || "",
          card?.querySelector("[data-civi-kontrollbilag-reason]")?.value || "");
        if (result.ok) renderInboxSections();
        else {
          const message = card?.querySelector("[data-civi-kontrollbilag-error]");
          if (message) message.textContent = result.reason;
        }
      });
    });
    host.querySelectorAll("[data-civi-kontrollbilag-report]").forEach(function (button) {
      button.addEventListener("click", function () {
        const card = button.closest("[data-civi-kontrollbilag-editor]");
        const result = recordLillebekkKontrollprotokoll(
          card?.querySelector("[data-civi-kontrollbilag-recommendation]")?.value || "");
        if (result.ok) renderInboxSections();
        else {
          const message = card?.querySelector("[data-civi-kontrollbilag-report-error]");
          if (message) message.textContent = result.reason;
        }
      });
    });
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
    recordLillebekkFagsvarFollowup,
    getLillebekkKontrollbilagModel: lillebekkKontrollbilagModel,
    recordLillebekkKontrollFunn,
    recordLillebekkKontrollprotokoll,
    getLillebekkKontrollresultatModel: lillebekkKontrollresultatModel,
    recordLillebekkResultatMottak,
    recordLillebekkResultatvurdering,
    recordLillebekkBeslutningsgrunnlag,
    getLillebekkNyLedervurderingModel: lillebekkNyLedervurderingModel,
    recordLillebekkNyLedervurdering,
    recordLillebekkLeder2Oppgave,
    recordLillebekkLeder2Oppfolgingsnotat,
    getLillebekkSuppleringssvarModel: lillebekkSuppleringssvarModel,
    recordLillebekkSuppleringsgjennomgang,
    recordLillebekkSuppleringsmatrise,
    getLillebekkUtkastModel: lillebekkUtkastModel,
    recordLillebekkUtkast,
    getLillebekkSvarrundeModel: lillebekkSvarrundeModel,
    recordLillebekkSvarrundeStart,
    recordLillebekkSvarvurdering,
    getLillebekkSvarnotatModel: lillebekkSvarnotatModel,
    recordLillebekkSvarnotat,
    getLillebekkElinSvarmoteModel: lillebekkElinSvarmoteModel,
    recordLillebekkElinSvarmoteSvar,
    recordLillebekkElinSvarmoteReferat
  };
})();
