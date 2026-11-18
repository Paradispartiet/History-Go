// Weekly meal planner UI in the existing Civication "Kommers" section.
// Only explicit Fysen/ORS searches. Quoted NOK menu prices are advisory; no purchases or wallet charges.
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
  function todaysVerifiedCommute() {
    const routes = window.CivicationPersonalRoutes;
    const day = Number(window.CivicationCalendar?.getClock?.()?.dayIndex);
    if (!routes || !Number.isSafeInteger(day) || day < 1) return null;
    const activeJob = routes.jobKey?.();
    if (!activeJob) return null;
    const weekday = (day - 1) % 7;
    const now = Date.now();
    return routes.listRoutes().find(item => {
      const validUntil = Date.parse(item.routeEvidence?.validUntil || "");
      return item.kind === "commute" && item.visibility === "private" &&
        item.status === "planned" && item.routingStatus === "verified_route" &&
        item.jobKey === activeJob && item.weekDay === weekday &&
        Number.isFinite(validUntil) && validUntil > now &&
        item.roadGeometry?.type === "LineString";
    }) || null;
  }
  function isCurrentCommute(route) {
    if (!route || typeof route.id !== "string" || typeof route.geometryRevision !== "string") return false;
    const latest = todaysVerifiedCommute();
    return !!latest && latest.id === route.id &&
      latest.geometryRevision === route.geometryRevision &&
      latest.jobKey === route.jobKey &&
      latest.weekDay === route.weekDay &&
      latest.routingStatus === "verified_route";
  }
  function kr(minor) {
    return new Intl.NumberFormat("nb-NO", { maximumFractionDigits: 2 })
      .format(minor / 100) + " kr";
  }
  function menuPriceLabel(candidate) {
    const minor = candidate?.priceMinor;
    if (!Number.isSafeInteger(minor) || minor < 0) return "Pris ikke oppgitt";
    const prefix = candidate.priceKind === "from" ? "Fra " :
      candidate.priceKind === "multiple" ? "Menypris fra " : "Menypris ";
    return prefix + kr(minor) + " per porsjon (Fysen)";
  }
  function renderRestaurantBudget(host, model, key) {
    if (typeof model.getRestaurantSummary !== "function") return;
    const summary = model.getRestaurantSummary(key);
    const details = create("details", null, host);
    details.style.marginTop = "14px";
    details.open = true;
    create("summary", "Restaurantbudsjett · " + summary.meals.length + " planlagte måltider", details);
    const row = create("div", null, details);
    row.style.cssText = "display:flex;flex-wrap:wrap;align-items:end;gap:10px;margin:10px 0";
    const label = create("label", "Ukesbudsjett i kroner", row);
    label.style.cssText = "display:flex;flex-direction:column;gap:4px";
    const input = create("input", null, label);
    input.type = "number";
    input.min = "0";
    input.max = "100000";
    input.step = "1";
    input.placeholder = "Valgfritt";
    input.value = summary.budgetNok === null ? "" : String(summary.budgetNok);
    input.style.cssText = "width:140px;padding:8px";
    input.addEventListener("change", () => {
      const entered = input.value.trim();
      const nok = entered === "" ? null : Number(entered);
      if (nok !== null && (!Number.isSafeInteger(nok) || nok < 0 || nok > 100000)) {
        input.value = summary.budgetNok === null ? "" : String(summary.budgetNok);
        return;
      }
      model.setRestaurantBudgetNok(nok, key);
      render();
    });
    let line = "Planlagte restaurantmåltider med oppgitt pris: " + kr(summary.plannedMinor);
    if (summary.remainingMinor !== null) {
      line += summary.remainingMinor < 0
        ? " · " + kr(-summary.remainingMinor) + " over budsjett"
        : " · " + kr(summary.remainingMinor) + " igjen av budsjettet";
    }
    create("p", line, details);
    if (summary.unpricedMeals) {
      create("p", summary.unpricedMeals + " planlagte måltider uten oppgitt pris.", details).className = "muted";
    }
    if (summary.meals.length) {
      const list = create("ul", null, details);
      list.style.cssText = "list-style:none;padding:0;display:grid;gap:6px";
      for (const item of summary.meals) {
        const entry = create("li", null, list);
        entry.style.cssText = "display:flex;flex-wrap:wrap;align-items:center;gap:8px";
        const amount = item.priceMinor === null ? "pris ukjent" : kr(item.priceMinor * item.portions);
        create("span",
          model.DAYS[item.day] + " · " + model.MEALS[item.meal].label + ": " +
          item.dishName + " hos " + item.name + " · " + item.portions +
          (item.portions === 1 ? " porsjon · " : " porsjoner · ") + amount, entry);
        const remove = create("button", "Fjern", entry);
        remove.type = "button";
        remove.addEventListener("click", () => {
          model.setRestaurantMeal(item.day, item.meal, null, key);
          render();
        });
      }
    }
    create("p", "Dette er planlagte restaurantutgifter basert på Fysens oppgitte priser. " +
      "Hjemmelaget mat er ikke prisberegnet. Ingen penger trekkes fra PC-saldoen.", details).className = "muted";
  }

  function renderNearbyRestaurants(parent) {
    const details = create("details", null, parent);
    details.style.marginTop = "16px";
    create("summary", "Restauranter nær arbeidsruten", details);
    create("p",
      "Vi bruker restaurantopplysningene fra Fysen som veiledende. Søket sender bare rettens navn og Oslo til Fysen. Omvei beregnes først når du velger det; da sendes rutepunktene til OpenRouteService.",
      details).className = "muted";
    const form = create("form", null, details);
    form.style.cssText = "display:flex;flex-wrap:wrap;align-items:end;gap:8px;margin:12px 0";
    const label = create("label", "Rett å lete etter", form);
    label.style.cssText = "display:flex;flex-direction:column;gap:4px;flex:1;min-width:160px";
    const dish = create("input", null, label);
    dish.type = "search";
    dish.placeholder = "F.eks. pasta";
    dish.maxLength = 80;
    dish.style.cssText = "width:100%;padding:8px;box-sizing:border-box";
    const departureLabel = create("label", "Planlagt avreise (spilltid)", form);
    departureLabel.style.cssText = "display:flex;flex-direction:column;gap:4px";
    const departure = create("input", null, departureLabel);
    departure.type = "time";
    departure.style.padding = "8px";
    const find = create("button", "Finn nær ruten", form);
    find.type = "submit";
    find.className = "btn";
    const message = create("p", "Velg en rett og ha en beregnet arbeidsrute for dagens spilledag.", details);
    message.className = "muted";
    message.setAttribute("role", "status");
    const results = create("ul", null, details);
    results.style.cssText = "list-style:none;padding:0;display:grid;gap:8px";
    form.addEventListener("submit", async event => {
      event.preventDefault();
      const client = window.CivicationFysenLiveRestaurants;
      const corridor = window.CivicationFysenRouteCorridor;
      const route = todaysVerifiedCommute();
      if (!route) {
        message.textContent = "Beregn først en arbeidsrute i Karriere for dagens spilledag.";
        return;
      }
      if (!client || !corridor) {
        message.textContent = "Datakoblingen for restauranter nær ruten er ikke klar.";
        return;
      }
      find.disabled = true;
      results.replaceChildren();
      message.textContent = "Søker etter restauranter i Oslo …";
      try {
        const menuData = await client.lookup(dish.value, { consent: true, now: new Date() });
        const reasons = {
          INVALID_QUERY: "Skriv minst to tegn i navnet på en rett.",
          CONSENT_REQUIRED: "Søket må startes aktivt.",
          PUBLIC_API_UNAVAILABLE: "Fysens offentlige menysøk er utilgjengelig akkurat nå.",
          INVALID_RESPONSE: "Menydata kunne ikke leses.",
          NO_CURRENT_PUBLIC_MENUS: "Ingen ferske menykilder for denne retten. Du kan prøve arkivsøket ovenfor."
        };
        if (menuData.status !== "DOCUMENTED_PUBLIC_MENUS") {
          message.textContent = reasons[menuData.status] || "Ingen restauranttreff.";
          return;
        }
        // The player's home/workplace may have changed while Fysen responded.
        // Do not use a stale route object to produce geographic candidates.
        if (!isCurrentCommute(route)) {
          message.textContent = "Arbeidsruten er endret eller slettet. Start søket på nytt.";
          return;
        }
        const nearby = corridor.shortlist({
          route, response: menuData, nowMillis: Date.now()
        });
        if (nearby.status !== "geographic_candidates" || !nearby.candidates.length) {
          message.textContent = "Ingen restauranter fra Fysen ble funnet innenfor 500 meter fra ruten.";
          return;
        }
        message.textContent = nearby.candidates.length +
          " restauranter nær ruten. Beregn omvei dersom du ønsker det.";
        for (const candidate of nearby.candidates) {
          const item = create("li", null, results);
          item.style.cssText = "padding:10px;border:1px solid rgba(128,128,128,.25);border-radius:10px";
          create("strong", candidate.name + " – " + candidate.dishName, item);
          create("div", candidate.address + " · ca. " + candidate.approxCorridorMeters +
            " m fra rutelinjen (ikke kjøre-/gangomvei)", item).className = "muted";
          const source = create("a", "Menykilde", item);
          source.href = candidate.menuSourceUrl;
          source.target = "_blank";
          source.rel = "noopener noreferrer";
          create("div", menuPriceLabel(candidate), item).className = "muted";
          const mealBox = create("div", null, item);
          mealBox.style.cssText = "display:flex;align-items:end;flex-wrap:wrap;gap:8px;margin-top:8px";
          const model = window.CivicationMealPlan;
          const mealSelect = labeledSelect(mealBox, "Legg i ukesmeny som",
            Object.entries(model.MEALS).map(([id, entry]) => ({ id, name: entry.label })),
            selectedMeal, () => {});
          const portionsLabel = create("label", "Porsjoner", mealBox);
          portionsLabel.style.cssText = "display:flex;flex-direction:column;gap:4px";
          const portions = create("input", null, portionsLabel);
          portions.type = "number";
          portions.min = "1";
          portions.max = "12";
          portions.step = "1";
          portions.value = "1";
          portions.style.cssText = "width:76px;padding:8px";
          const planButton = create("button", "Planlegg måltid", mealBox);
          planButton.type = "button";
          planButton.className = "btn";
          planButton.addEventListener("click", () => {
            if (!isCurrentCommute(route)) {
              message.textContent = "Arbeidsruten er endret. Søk på nytt.";
              return;
            }
            const count = Number(portions.value);
            if (!Number.isSafeInteger(count) || count < 1 || count > 12) {
              portions.value = "1";
              return;
            }
            model.setRestaurantMeal(route.weekDay, mealSelect.value, {
              restaurantId: candidate.restaurantId,
              name: candidate.name,
              dishName: candidate.dishName,
              priceMinor: candidate.priceMinor,
              portions: count
            }, selectedWeekKey(model));
            render();
          });
          const action = create("button", "Beregn faktisk omvei med OpenRouteService", item);
          action.type = "button";
          action.className = "btn";
          action.style.cssText = "display:block;margin-top:8px";
          const info = create("p", "Opplysningene er hentet fra Fysen og kan ha endret seg.", item);
          info.className = "muted";
          action.addEventListener("click", async () => {
            const detours = window.CivicationRestaurantDetours;
            if (!detours) { info.textContent = "Omveiberegning er ikke tilgjengelig."; return; }
            if (!isCurrentCommute(route)) {
              info.textContent = "Arbeidsruten er endret eller slettet. Søk på nytt før omveiberegning.";
              return;
            }
            const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(departure.value);
            if (!match) { info.textContent = "Velg planlagt avreisetid først."; return; }
            const minute = Number(match[1]) * 60 + Number(match[2]);
            action.disabled = true;
            info.textContent = "Beregner omvei. Ruteendepunkter og restaurantkoordinater sendes til OpenRouteService etter dette valget.";
            try {
              const checked = await detours.calculate(route, candidate, {
                consent: true, departureMinute: minute, now: new Date()
              });
              if (!isCurrentCommute(route)) {
                info.textContent = "Arbeidsruten ble endret under beregningen. Resultatet er forkastet.";
                return;
              }
              if (!checked.ok) {
                info.textContent = "Omveien kunne ikke dokumenteres (" + checked.reason +
                  "). Prøv igjen om du vil.";
                return;
              }
              const pass = checked.routeProof.passMinutes;
              const hhmm = String(Math.floor(pass / 60)).padStart(2, "0") +
                ":" + String(pass % 60).padStart(2, "0");
              info.textContent = "Beregnet omvei: " + checked.routeProof.detourMinutes +
                " min. Passering ca. " + hhmm +
                ". Restaurantopplysningene er veiledende. Reisen registreres ikke som gjennomført.";
            } catch (_) {
              info.textContent = "Kunne ikke beregne omveien.";
            } finally { action.disabled = false; }
          });
        }
      } catch (_) {
        message.textContent = "Restaurantoppslaget kunne ikke gjennomføres.";
      } finally {
        find.disabled = false;
      }
    });
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
      const dining = saved.restaurantMeals?.[day]?.[selectedMeal];
      if (dining) {
        const note = create("span", "Restaurant: " + dining.dishName, row);
        note.style.cssText = "font-size:.85em;opacity:.7";
      }
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
    renderRestaurantBudget(host, model, key);
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
      verified_venues_required: "Ukesmeny og veirute er klare. Søk etter restauranter fra Fysen nedenfor.",
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
    create("p", "Ingen posisjon spores eller sendes for å vise denne statusen. Vi bruker Fysens restaurantopplysninger som veiledende.", routeInfo).className = "muted";

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
          " arkivtreff fra tidligere menyer. Bruk dem gjerne som inspirasjon.";
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
    renderNearbyRestaurants(routeInfo);
    create("p", "Valgene og handlelisten lagres privat i denne nettleseren.", host).className = "muted";
  }
  window.CivicationMealPlanUI = Object.freeze({ render });
  // The calendar is initialized by the asynchronous Civication shell loader.
  window.addEventListener("civi:booted", render);
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", render);
  else render();
})();
