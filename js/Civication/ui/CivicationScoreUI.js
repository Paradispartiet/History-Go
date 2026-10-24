// Civication score / 100. View-only: never rewrite historical saves or gameplay scales.
(function (root) {
  "use strict";

  const clamp100 = (value) => Math.round(Math.max(0, Math.min(100, Number(value))));
  const isScore = (value) => typeof value === "number" && Number.isFinite(value);
  const nice = (id) => String(id || "").replace(/[_:.-]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  function getModel(options = {}) {
    const canonical = /** @type {any} */ (root).CivicationState?.getState?.() || {};
    const life = options.state || root.CivicationLifestoryState?.load?.() || null;
    const groups = [];
    function add(name, rows) {
      if (rows.length) groups.push({ name, rows });
    }
    function row(name, value, note = "") {
      return { name, score: isScore(value) ? clamp100(value) : null, note };
    }
    if (life?.meters) {
      const labels = { psyke: "Psyke", energi: "Energi", integritet: "Integritet",
        synlighet: "Synlighet", handlingsrom: "Handlingsrom" };
      // Life Story meters except money are already clamped by its canonical state.
      add("Min dag", Object.entries(labels)
        .filter(([id]) => Object.prototype.hasOwnProperty.call(life.meters, id))
        .map(([id, label]) => row(label, life.meters[id])));
    }
    if (life?.relasjoner) {
      // Relationship gauges are clamped to 0–100 by Life Story applyEffects.
      add("Relasjoner", Object.entries(life.relasjoner)
        .filter(([,value]) => isScore(value))
        .map(([id,value]) => row(nice(id), value)));
    }
    const skillsModel = root.CivicationSkills?.getViewModel?.(canonical);
    if (skillsModel?.skills) {
      // "Not measured" is NOT an earned zero and must not lower the average.
      add("Skills", skillsModel.skills.map((item) =>
        row(item.label, item.measured ? item.score : null, item.measured ? "" : "Ikke målt")));
    }
    // Seven capital gauges belong to the player's actual capital store, not
    // to the monetary PC wallet. The identity engine uses 30/60/80 thresholds.
    // Keep raw capital (including values above 100) intact; cap HUD at 100.
    let capital = {};
    try { capital = JSON.parse(root.localStorage?.getItem("hg_capital_v1") || "{}") || {}; }
    catch { capital = {}; }
    const capitalNames = { economic: "Økonomisk kapital", cultural: "Kulturell kapital",
      social: "Sosial kapital", symbolic: "Symbolsk kapital",
      political: "Politisk kapital", institutional: "Institusjonell kapital",
      subculture: "Subkulturell kapital" };
    add("Kapital", Object.entries(capitalNames)
      .filter(([id]) => isScore(capital[id]))
      .map(([id,label]) => row(label, capital[id], capital[id] > 100
        ? "Råverdi over 100, vist som 100 / 100." : "")));

    const psyche = root.CivicationPsyche?.getSnapshot?.(/** @type {any} */ (root).CivicationState?.getActivePosition?.()?.career_id);
    if (psyche) {
      const specs = [
        ["Integritet", psyche.integrity], ["Synlighet", psyche.visibility],
        ["Økonomisk handlingsrom", psyche.economicRoom], ["Autonomi", psyche.autonomy],
        ["Psykologikompetanse", psyche.psychologyCompetence]
      ];
      if (psyche.trustSummary?.count > 0) specs.push(["Tillit i arbeidslivet", psyche.trustSummary.avgPercent]);
      add("Psyke og livsmestring", specs.map(([name, value]) => row(name, value)));
    }
    // Reputation is -100..100 in the real game model. Only the HUD converts it.
    const standings = canonical.social_standing?.by_audience || {};
    add("Omdømme", Object.entries(standings)
      .filter(([,value]) => isScore(value))
      .map(([id,value]) => row(nice(id), (Math.max(-100, Math.min(100,value)) + 100) / 2,
        "Visningsskala 0–100 (spillverdi −100 til +100)")));
    const scored = groups.flatMap((group) => group.rows).filter((item) => item.score !== null);
    const score = scored.length
      ? Math.round(scored.reduce((sum,item) => sum + item.score, 0) / scored.length)
      : null;
    return { score, count: scored.length, groups,
      // Money is unbounded and does not belong to an arithmetic mean of capabilities.
      excluded: ["PC-saldo", "Fortellingspenger"],
      currency: life?.meters && isScore(life.meters.penger) ? life.meters.penger : null };
  }

  let lastOptions = {};
  let trigger = null;
  let dialog = null;
  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = String(text);
    return node;
  }
  function ensureDialog() {
    if (dialog?.isConnected) return dialog;
    dialog = element("dialog", "civi-score-dialog");
    dialog.id = "civiScoreDialog";
    dialog.setAttribute("aria-labelledby", "civiScoreHeading");
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) closeDialog();
    });
    dialog.addEventListener("close", () => trigger?.focus?.());
    document.body.appendChild(dialog);
    return dialog;
  }
  function closeDialog() {
    if (!dialog) return;
    if (typeof dialog.close === "function" && dialog.open) dialog.close();
    else { dialog.removeAttribute("open"); trigger?.focus?.(); }
  }
  function fillDialog(model) {
    const panel = ensureDialog();
    panel.replaceChildren();
    const heading = element("h2", "", "Dine verdier");
    heading.id = "civiScoreHeading";
    panel.appendChild(heading);
    panel.appendChild(element("p", "civi-score-explain",
      "Nåværende score: " + (model.score === null ? "ikke beregnet" : model.score + " / 100")
      + ". Gjennomsnitt av " + model.count + " målte verdier, med lik vekt per verdi."));
    for (const group of model.groups) {
      const section = element("section", "civi-score-group");
      section.appendChild(element("h3", "", group.name));
      for (const item of group.rows) {
        const wrap = element("div", "civi-score-item");
        const meta = element("div", "civi-score-item-head");
        meta.appendChild(element("span", "", item.name));
        meta.appendChild(element("strong", "", item.score === null ? "Ikke målt" : item.score + " / 100"));
        wrap.appendChild(meta);
        const track = element("div", "civi-score-track" + (item.score === null ? " is-unmeasured" : ""));
        if (item.score !== null) {
          track.setAttribute("role", "progressbar");
          track.setAttribute("aria-label", group.name + ": " + item.name);
          track.setAttribute("aria-valuemin", "0");
          track.setAttribute("aria-valuemax", "100");
          track.setAttribute("aria-valuenow", String(item.score));
        }
        const fill = element("span", "civi-score-fill");
        fill.style.width = (item.score ?? 0) + "%";
        track.appendChild(fill);
        wrap.appendChild(track);
        if (item.note) wrap.appendChild(element("small", "civi-score-note", item.note));
        section.appendChild(wrap);
      }
      panel.appendChild(section);
    }
    if (!model.groups.length) panel.appendChild(element("p", "", "Ingen målte verdier ennå."));
    panel.appendChild(element("p", "civi-score-explain",
      "Penger er en saldo og ikke en 0–100-verdi. Ukjente Skills holdes utenfor snittet. Visningen endrer ikke spillprogresjonen."));
    if (model.currency !== null) panel.appendChild(element("p", "civi-score-explain",
      "Fortellingspenger: " + model.currency + " (ikke inkludert i score)."));
    const close = element("button", "civi-score-close", "Lukk");
    close.type = "button";
    close.addEventListener("click", closeDialog);
    panel.appendChild(close);
  }
  function renderHeader(host, options) {
    if (!host) return;
    if (options) lastOptions = options;
    const model = getModel(lastOptions);
    // Reuse the same focusable button through all profile/daily redraws.
    if (!trigger?.isConnected || trigger.parentElement !== host) {
      trigger = element("button", "civi-score-circle");
      trigger.id = "civiScoreTrigger";
      trigger.type = "button";
      trigger.addEventListener("click", () => {
        const snapshot = getModel(lastOptions);
        fillDialog(snapshot);
        if (typeof dialog.showModal === "function") dialog.showModal();
        else dialog.setAttribute("open", "");
      });
      host.appendChild(trigger);
    }
    trigger.textContent = model.score === null ? "–" : String(model.score);
    trigger.setAttribute("aria-label", "Din score " +
      (model.score === null ? "ikke beregnet" : model.score + " av 100") + ". Vis alle verdier");
    trigger.title = "Se alle verdier";
    if (dialog?.open) fillDialog(model);
  }
  root.CivicationScoreUI = { getModel, renderHeader, closeDialog };
})(typeof window !== "undefined" ? window : globalThis);
