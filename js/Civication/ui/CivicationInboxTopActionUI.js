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
    const revisionCount = (live.history || []).filter(function (item) {
      return String(item.id || "").startsWith(prefix);
    }).length;
    if (revisionCount >= 20) return { ok: false, reason: "Vurderingsloggen er full." };
    try {
      world.appendWorkObjectHistory(caseId, {
        event_id: `${prefix}${revisionCount + 1}`, scene_id: "lillebekk_revisjon_innboks",
        choice_id: outcome, at: new Date().toISOString(), outcome,
        note: `Foreløpig vurdering av spilleroppgitt bilag for ${topic.title}: ${labels[outcome]}. Begrunnelse: ${reason}. Kildehenvisningen står i mottaksnotatet. Dette bekrefter ikke dokumentet, lukker ikke fagavvik og gir ingen myndighetsgodkjenning.`
      });
      return { ok: true };
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
    recordLillebekkExhibitDecision
  };
})();
