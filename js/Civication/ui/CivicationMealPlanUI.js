// Weekly meal planner UI in the existing Civication "Kommers" section.
// No network calls, purchases, price claims or background notifications.
(function () {
  "use strict";
  let selectedMeal = "dinner";
  let weekOffset = 0;

  function create(tag, text, parent) {
    const node = document.createElement(tag);
    if (text != null) node.textContent = String(text);
    if (parent) parent.appendChild(node);
    return node;
  }
  function option(select, value, label, selected) {
    const opt = create("option", label, select);
    opt.value = String(value);
    opt.selected = selected === true;
  }
  function labeledSelect(parent, label, choices, value, onChange) {
    const wrap = create("label", label, parent);
    wrap.style.display = "inline-flex";
    wrap.style.flexDirection = "column";
    wrap.style.gap = "4px";
    const select = create("select", null, wrap);
    select.style.padding = "8px";
    for (const entry of choices) option(select, entry.id, entry.name, entry.id === value);
    select.addEventListener("change", () => onChange(select.value));
    return select;
  }
  function selectedWeekKey(plan) {
    const index = Number(window.CivicationCalendar?.getClock?.()?.dayIndex);
    const day = Number.isSafeInteger(index) && index > 0 ? index : 1;
    return plan.getWeekKey(day + weekOffset * 7);
  }
  function render() {
    const host = document.getElementById("civiWeeklyMealPlanPanel");
    const model = window.CivicationMealPlan;
    if (!host || !model) return;
    const key = selectedWeekKey(model);
    const saved = model.getWeek(key);
    const shopping = model.getShoppingList(key);
    host.replaceChildren();

    const heading = create("h3", "Min ukesmeny", host);
    heading.style.margin = "16px 0 6px";
    const intro = create("p", "Planlegg frokost, lunsj, middag og kveldsmat. Eksempelretter – ikke verifiserte butikkmenyer eller priser.", host);
    intro.className = "muted";

    const controls = create("div", null, host);
    controls.style.cssText = "display:flex;flex-wrap:wrap;align-items:end;gap:12px;margin:12px 0";
    labeledSelect(controls, "Uke", [
      { id: "0", name: "Denne spilluken" }, { id: "1", name: "Neste spilluke" },
      { id: "2", name: "Om to spilluker" }
    ], String(weekOffset), value => { weekOffset = Number(value); render(); });

    labeledSelect(controls, "Måltid",
      Object.entries(model.MEALS).map(([id, item]) => ({ id, name: item.label })),
      selectedMeal, value => { selectedMeal = value; render(); });

    const peopleLabel = create("label", "Antall personer", controls);
    peopleLabel.style.cssText = "display:inline-flex;flex-direction:column;gap:4px";
    const people = create("input", null, peopleLabel);
    people.type = "number";
    people.min = "1";
    people.max = "12";
    people.step = "1";
    people.value = String(saved.people);
    people.style.cssText = "width:90px;padding:8px";
    people.addEventListener("change", () => {
      const count = Number(people.value);
      if (!Number.isSafeInteger(count) || count < 1 || count > 12) {
        people.value = String(saved.people);
        return;
      }
      model.setPeople(count, key);
      render();
    });

    const templates = create("div", null, host);
    templates.style.cssText = "display:flex;flex-wrap:wrap;align-items:end;gap:8px;margin-bottom:12px";
    const template = labeledSelect(templates, "Velg ferdig ukesmeny",
      model.templates().map(item => ({ id: item.id, name: item.label })),
      model.templates()[0].id, () => {});
    const apply = create("button", "Bruk ukesmeny", templates);
    apply.type = "button";
    apply.className = "btn";
    apply.addEventListener("click", () => { model.applyTemplate(template.value, key); render(); });

    const days = create("div", null, host);
    days.style.cssText = "border:1px solid rgba(128,128,128,.25);border-radius:12px;padding:12px";
    const choices = [{ id: "", name: "Ikke valgt" }, ...model.getRecipes(selectedMeal)];
    for (let day = 0; day < 7; day++) {
      const row = create("div", null, days);
      row.style.cssText = "display:flex;align-items:center;gap:10px;margin:6px 0";
      const name = create("span", model.DAYS[day], row);
      name.style.minWidth = "82px";
      const select = create("select", null, row);
      select.setAttribute("aria-label", model.DAYS[day] + " – " + model.MEALS[selectedMeal].label);
      select.style.cssText = "min-width:0;flex:1;max-width:430px;padding:8px;border-radius:8px";
      const chosen = saved.meals[day]?.[selectedMeal] || "";
      for (const choice of choices) option(select, choice.id, choice.name, choice.id === chosen);
      select.addEventListener("change", () => {
        model.setMeal(day, selectedMeal, select.value || null, key);
        render();
      });
    }

    const details = create("details", null, host);
    details.style.marginTop = "14px";
    details.open = true;
    create("summary", "Handleliste for hele uken (" + shopping.length + " varer)", details);
    if (!shopping.length) {
      create("p", "Velg retter for å lage handleliste.", details).className = "muted";
    } else {
      const list = create("ul", null, details);
      list.style.cssText = "max-height:230px;overflow:auto;padding-left:22px";
      for (const item of shopping) create("li", item.name + ": " + item.quantity + " " + item.unit, list);
    }
    create("p", "Mengdene er veiledende. Ingen priser eller butikklager er verifisert, og varer du har hjemme er ikke trukket fra.", details).className = "muted";
    const routeInfo = create("details", null, host);
    routeInfo.style.marginTop = "14px";
    create("summary", "Mat langs min arbeidsrute", routeInfo);
    const statusText = {
      not_initialized: "Rutesystemet er ikke klart.",
      invalid_game_day: "Spillets dagsplan er ikke klar.",
      invalid_time: "Klokkeslett kunne ikke leses.",
      weekly_menu_not_selected: "Velg en ukesmeny for den aktuelle spilluken.",
      active_job_required: "Velg en jobb for å planlegge mat langs arbeidsruten.",
      verified_commute_required: "Registrer hjem og arbeidsadresse og beregn en veirute i Karriere.",
      verified_venues_required: "Ukesmeny og veirute er klare. Bekreftede Fysen-restauranter og butikker er ikke koblet til ennå.",
      no_verified_offers: "Ingen dokumenterte mattilbud passer denne ruten og måltidstiden.",
      opted_out: "Matforslag langs ruten er deaktivert."
    };
    let routeResult = { status: "not_initialized" };
    try {
      routeResult = window.CivicationMealRouteBridge?.build?.({ now: new Date(), places: [] }) || routeResult;
    } catch (_) { routeResult = { status: "not_initialized" }; }
    const status = create("p", statusText[routeResult.status] || "Ingen dokumenterte tilbud tilgjengelige.", routeInfo);
    status.className = "muted";
    status.setAttribute("role", "status");
    create("p", "Ingen posisjon spores eller sendes for å vise denne statusen. Restaurant- og butikktilbud må verifiseres før de kan vises.", routeInfo).className = "muted";

    // Deliberate city-only menu discovery: archive entries are NEVER shown
    // as real-time route deals, open-now claims or current menu prices.
    const finder = create("form", null, routeInfo);
    finder.style.cssText = "display:flex;flex-wrap:wrap;gap:8px;align-items:end;margin:12px 0";
    const searchLabel = create("label", "Søk i Fysens menyarkiv (Oslo)", finder);
    searchLabel.style.cssText = "display:flex;flex-direction:column;gap:4px;flex:1;min-width:150px";
    const query = create("input", null, searchLabel);
    query.type = "search";
    query.placeholder = "For eksempel pasta eller laks";
    query.setAttribute("autocomplete", "off");
    query.maxLength = 80;
    query.style.cssText = "width:100%;box-sizing:border-box;padding:8px";
    const searchButton = create("button", "Finn retter", finder);
    searchButton.type = "submit";
    searchButton.className = "btn";
    const finderStatus = create("p", "Søket sender bare rettens navn og Oslo til Fysen – aldri hjem eller arbeidsadresse.", routeInfo);
    finderStatus.className = "muted";
    finderStatus.setAttribute("role", "status");
    const found = create("ul", null, routeInfo);
    found.style.cssText = "list-style:none;padding:0;margin:0;display:grid;gap:8px";
    finder.addEventListener("submit", async event => {
      event.preventDefault();
      const api = window.CivicationFysenPublicMenus;
      if (!api) { finderStatus.textContent = "Fysen-søket er ikke tilgjengelig."; return; }
      searchButton.disabled = true;
      found.replaceChildren();
      finderStatus.textContent = "Søker i Fysens offentlige menyarkiv …";
      try {
        const data = await api.search(query.value);
        if (data.status !== "archive_results") {
          const reasons = {
            invalid_query: "Skriv minst to tegn.",
            unavailable: "Menyarkivet er utilgjengelig akkurat nå.",
            unverified_response: "Menyarkivets svar kunne ikke verifiseres.",
            no_archive_results: "Fant ingen dokumenterte arkivoppføringer for denne retten."
          };
          finderStatus.textContent = reasons[data.status] || "Ingen verifiserte arkivtreff.";
          return;
        }
        finderStatus.textContent = data.items.length +
          " arkivtreff. Dette er historiske menyer, ikke dokumentasjon på at restauranten er åpen eller ligger langs ruten.";
        for (const item of data.items) {
          const entry = create("li", null, found);
          entry.style.cssText = "border:1px solid rgba(128,128,128,.2);border-radius:8px;padding:8px";
          create("strong", item.name + " – " + item.restaurant, entry);
          create("div", item.address, entry).className = "muted";
          const link = create("a", "Se dokumentert menykilde (" +
            item.observedAt.slice(0, 10) + ")", entry);
          link.href = item.sourceUrl;
          link.target = "_blank";
          link.rel = "noopener noreferrer";
        }
      } catch (_) {
        finderStatus.textContent = "Søket kunne ikke gjennomføres.";
      } finally {
        searchButton.disabled = false;
      }
    });
    create("p", "Valgene og handlelisten lagres privat i denne nettleseren.", host).className = "muted";
  }
  window.CivicationMealPlanUI = Object.freeze({ render });
  // The calendar is initialized by the asynchronous Civication shell loader.
  window.addEventListener("civi:booted", render);
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", render);
  else render();
})();
