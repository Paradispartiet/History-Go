(function (/** @type {any} */ root) {
  "use strict";
  let message = "";
  /** @type {any} */
  let activationConfig = null;
  /** @type {any} */
  let scenarioConfig = null;
  let selectedAreaId = "oslo_baerum";
  let selectedRooms = 3;
  let selectedHouseholdId = "two_adults_two_children";
  /** @type {Promise<void>|null} */
  let activationLoad = null;
  function loadActivationConfig() {
    if (activationLoad) return activationLoad;
    activationLoad = (async function () {
      if (typeof root.fetch !== "function") return;
      try {
        const response = await root.fetch("data/Civication/economy/nok-budget-prototype-2026.json");
        if (!response.ok) return;
        const config = await response.json();
        // Read-only scenarios can be displayed while NOK activation remains blocked.
        if (config?.costOfLiving?.version === 1 && config?.currency?.nokPerPC === 1)
          scenarioConfig = config;
        // Loading a profile is read-only. Only reviewed release data can expose activation.
        if (config?.status === "active" && config?.migration?.activated === true
            && config?.currency?.id === "PC" && config?.currency?.nokPerPC === 1) activationConfig = config;
      } catch { /* Existing economy remains available if the profile cannot load. */ }
      render();
    })();
    return activationLoad;
  }
  const money = (/** @type {unknown} */ value) => typeof value === "number" && Number.isFinite(value)
    ? value.toLocaleString("nb-NO", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "Ukjent";
  function node(/** @type {string} */ tag, text = "") {
    const el = document.createElement(tag);
    el.textContent = text;
    if (tag === "button") el.style.minHeight = "44px";
    return el;
  }
  // A transparent reference comparison, not an inferred player household or invoice.
  function renderRegionalCosts(/** @type {any} */ config) {
    const refs = config?.costOfLiving;
    const calculate = root.CivicationNokBudget?.costOfLivingScenario;
    if (refs?.version !== 1 || typeof calculate !== "function" ||
        !Array.isArray(refs.rentSources) || !Array.isArray(refs.foodProfiles))
      return null;
    const details = /** @type {HTMLDetailsElement} */ (node("details"));
    details.setAttribute("data-nok-location-costs", "");
    details.open = true;
    details.appendChild(node("summary", "Bolig og mat · sammenlign områder og husholdninger"));
    details.appendChild(node("p", "Statistiske eksempler, ikke din registrerte bolig eller en regning. "
      + "Husleie varierer med område og antall rom; mat med antall og alder på beboerne."));
    const controls = node("div");
    controls.style.cssText = "display:flex;flex-wrap:wrap;gap:12px;align-items:end;margin:12px 0";
    const select = (/** @type {string} */ labelText, /** @type {Array<{id:string,label:string}>} */ items,
      /** @type {string} */ selected, /** @type {(id:string)=>void} */ changed) => {
      const label = node("label", labelText);
      label.style.cssText = "display:flex;flex-direction:column;gap:4px";
      const input = /** @type {HTMLSelectElement} */ (node("select"));
      input.style.cssText = "max-width:100%;padding:8px";
      for (const item of items) {
        const option = /** @type {HTMLOptionElement} */ (document.createElement("option"));
        option.value = item.id;
        option.textContent = item.label;
        option.selected = item.id === selected;
        input.appendChild(option);
      }
      input.addEventListener("change", () => changed(input.value));
      label.appendChild(input); controls.appendChild(label);
    };
    const region = refs.rentSources.find((/** @type {any} */ item) => item.id === selectedAreaId)
      || refs.rentSources[0];
    if (!region || !region.pricesByRoomsNok) return null;
    selectedAreaId = region.id;
    const roomOptions = Object.keys(region.pricesByRoomsNok)
      .filter(x => /^[1-5]$/.test(x))
      .map(x => ({ id:x, label:x + (x === "1" ? " rom" : " rom") }));
    if (!roomOptions.some(x => Number(x.id) === selectedRooms)) selectedRooms = Number(roomOptions[0]?.id || 2);
    select("Område", refs.rentSources.map((/** @type {any} */ entry) =>
      ({ id:entry.id, label:entry.label })), selectedAreaId, value => {
        selectedAreaId = value;
        const found = refs.rentSources.find((/** @type {any} */ entry) => entry.id === value);
        selectedRooms = Number(Object.keys(found?.pricesByRoomsNok || {})[0] || 2);
        render();
      });
    select("Boligstørrelse", roomOptions, String(selectedRooms), value => {
      selectedRooms = Number(value); render();
    });
    select("Eksempel på husholdning", refs.foodProfiles.map((/** @type {any} */ entry) =>
      ({ id:entry.id, label:entry.label })), selectedHouseholdId, value => {
        selectedHouseholdId = value; render();
      });
    details.appendChild(controls);
    const result = calculate(config, { areaId:selectedAreaId, rooms:selectedRooms,
      householdId:selectedHouseholdId });
    if (!result?.ok) {
      details.appendChild(node("p", "Ingen dokumentert kombinasjon for dette utvalget."));
      return details;
    }
    details.appendChild(node("p", "Husleie (" + result.rentSourceYear + "): "
      + money(result.monthlyRentNok) + " kr per måned"));
    details.appendChild(node("p", "Mat og alkoholfri drikke (" + result.foodReferenceYear + "): "
      + money(result.monthlyFoodNok) + " kr per måned"));
    const total = node("strong", "Til sammen bolig og mat: "
      + money(result.monthlyRentAndFoodNok) + " kr per måned");
    details.appendChild(total);
    details.appendChild(node("p", "Før strøm, transport, klær, husholdningsvarer og annet forbruk. "
      + "Restauranter inngår ikke. Beløpet belaster ikke spillkontoen."));
    details.appendChild(node("p", result.rentPriceKind.startsWith("predicted")
      ? "Husleie er SSBs beregnede sammenligningspris for 2-roms på 50 m²."
      : "Husleie er SSBs gjennomsnitt for eksisterende leieforhold, ikke en ny annonsepris."));
    for (const [label, url] of [["Husleie: SSB", result.rentSource],
      ["Mat: SIFO-referanse", result.foodSource]]) {
      const link = /** @type {HTMLAnchorElement} */ (document.createElement("a"));
      link.textContent = label;
      link.href = url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.style.marginRight = "12px";
      details.appendChild(link);
    }
    return details;
  }
  // Read existing owners only; this summary never advances the day or settles money.
  function dailyOverview() {
    const wallet = root.CivicationState?.getWallet?.();
    if (wallet?.nok_v1?.active !== true || wallet.nok_v1.version !== 1) return null;
    const date = root.CivicationCalendar?.getGameDate?.();
    if (typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
    const invoices = wallet.nok_v1.invoices;
    const due = Array.isArray(invoices) ? invoices.filter(i => i?.status === "pending"
      && typeof i.dueDateISO === "string" && /^\d{4}-\d{2}-\d{2}$/.test(i.dueDateISO) && i.dueDateISO <= date) : null;
    const week = root.HG_CiviShop?.getNokMealWeek?.();
    return { date, jobTitle: root.CivicationState?.getActivePosition?.()?.title || null,
      dueCount: due?.length ?? null,
      mealsToday: week?.ok ? week.entries.filter(e => e.date === date).length : null,
      shoppingCostCents: week?.ok ? week.shoppingCostCents : null };
  }
  function renderDailyLifeOverview() {
    const dayPanel = document.getElementById("civiLifestoryPanel");
    const previous = document.getElementById("civiNokDailyLifeOverview");
    const today = dailyOverview();
    if (!dayPanel || !today) { previous?.remove(); return; }
    const section = previous || node("details");
    section.id = "civiNokDailyLifeOverview";
    const wasOpen = /** @type {HTMLDetailsElement} */ (section).open;
    section.replaceChildren();
    const summary = node("summary", "Min hverdag · " + today.date);
    summary.style.minHeight = "44px"; section.appendChild(summary);
    section.appendChild(node("p", today.jobTitle ? "Jobb: " + today.jobTitle : "Ingen aktiv jobb registrert."));
    section.appendChild(node("p", today.dueCount === null ? "Regningsoversikten er utilgjengelig."
      : "Ubetalte regninger med forfall senest i dag: " + today.dueCount));
    section.appendChild(node("p", today.mealsToday === null ? "Velg en datofestet ukemeny i butikken."
      : "Måltider som gjenstår i dag: " + today.mealsToday));
    if (today.shoppingCostCents !== null) section.appendChild(node("p", "Manglende varer til ukemenyen: "
      + money(today.shoppingCostCents / 100) + " kr"));
    for (const [kind, label] of [["bills", "Se regninger"], ["food", "Planlegg og lag mat"]]) {
      const button = /** @type {HTMLButtonElement} */ (node("button", label));
      button.type = "button"; button.className = "btn";
      button.setAttribute("data-nok-daily-open", kind);
      button.disabled = !document.querySelector('#civiStoreSection > .civi-mini-card [data-civi-mini-open]');
      button.addEventListener("click", () => {
        const opener = /** @type {HTMLElement|null} */ (document.querySelector('#civiStoreSection > .civi-mini-card [data-civi-mini-open]'));
        if (!opener) return;
        /** @type {HTMLElement|null} */ (document.querySelector('.civi-footer [data-category="kommers"]'))?.click();
        opener.click();
        const destination = /** @type {HTMLElement|null} */ (document.querySelector(kind === "bills"
          ? '#civiEconomyPanel [data-nok-invoice], #civiEconomyPanel h3'
          : '#civiStorePanel [data-meal-week] summary, #civiStorePanel h3'));
        const details = destination?.closest("details"); if (details) details.open = true;
        destination?.focus({ preventScroll: true });
        destination?.scrollIntoView?.({ block: "nearest" });
      });
      section.appendChild(button);
    }
    /** @type {HTMLDetailsElement} */ (section).open = wasOpen;
    dayPanel.before(section);
  }
  function render() {
    renderDailyLifeOverview();
    const host = document.getElementById("civiEconomyPanel");
    if (!host) return;
    const focused = host.contains(document.activeElement);
    const focusedId = focused ? document.activeElement?.getAttribute("data-nok-invoice") : null;
    const wallet = root.CivicationState?.getWallet?.();
    const nok = wallet?.nok_v1;
    const active = nok?.active === true && nok?.version === 1;
    const panel = node("div");
    panel.className = "latest-knowledge-box";
    const heading = node("h3", "Min økonomi");
    heading.tabIndex = -1;
    panel.appendChild(heading);
    panel.appendChild(node("p", "Saldo: " + money(wallet?.balance) + (active ? " kr" : " PC")));
    const references = renderRegionalCosts(nok?.config?.costOfLiving ? nok.config : scenarioConfig);
    if (references) panel.appendChild(references);
    if (!active) {
      panel.appendChild(node("p", "Kroneøkonomien er ikke aktivert. Eksisterende saldo og kjøp beholdes."));
      if (activationConfig && root.CivicationEconomyEngine?.migrateNokEconomy) {
        panel.appendChild(node("p", "1 PC får samme kjøpekraft som 1 krone. Saldoen endres ikke. Nye lønns- og leieavtaler gjelder fra overgangen, uten etterbetaling."));
        const activate = /** @type {HTMLButtonElement} */ (node("button", "Ta i bruk kroneøkonomi"));
        activate.type = "button";
        activate.className = "btn";
        activate.setAttribute("data-nok-activate", "");
        activate.addEventListener("click", () => {
          activate.disabled = true;
          try {
            const result = root.CivicationEconomyEngine.migrateNokEconomy(activationConfig);
            if (result?.ok) {
              message = "Kroneøkonomien er aktiv. Saldoen er beholdt.";
              root.CivicationJobs?.ensureNokStarterOffer?.();
              root.dispatchEvent(new Event("updateProfile"));
            } else if (result?.reason === "UNSETTLED_LEGACY_PAYROLL") {
              message = "Tidligere opptjent lønn må gjøres opp før overgangen. Økonomien er uendret.";
            } else if (result?.reason === "ACTIVE_JOB_NOT_MAPPED") {
              message = "Den aktive jobben mangler lønnsvilkår i kroner. Økonomien er uendret.";
            } else message = "Overgangen kunne ikke gjennomføres. Økonomien er uendret.";
          } catch { message = "Overgangen kunne ikke bekreftes. Sjekk økonomistatus før du prøver igjen."; }
          render();
        });
        panel.appendChild(activate);
      }
    } else {
      // The monthly amount comes from the accepted recurring lease, not the
      // optional comparison selector or a district-level guessed price.
      const currentHousing = nok.housing;
      const matchingContracts = Array.isArray(nok.recurringBills) && currentHousing?.contractId
        ? nok.recurringBills.filter((/** @type {any} */ lease) =>
          lease?.id === currentHousing.contractId) : [];
      const lease = matchingContracts.length === 1 ? matchingContracts[0] : null;
      const acceptedOffer = Array.isArray(nok.config?.housingOffers) && currentHousing?.offerId
        ? nok.config.housingOffers.find((/** @type {any} */ offer) =>
          offer?.id === currentHousing.offerId && offer.districtId === currentHousing.districtId)
        : null;
      if (lease && acceptedOffer && typeof lease.amountNok === "number" &&
          Number.isFinite(lease.amountNok) && lease.amountNok >= 0 &&
          Number.isSafeInteger(Math.round(lease.amountNok * 100))) {
        const place = root.CivicationHome?.getDistrictName?.(currentHousing.districtId)
          || String(currentHousing.districtId);
        const roomText = Number.isSafeInteger(currentHousing.roomCount)
          ? " · " + currentHousing.roomCount + " rom" : "";
        panel.appendChild(node("p", "Din spillbolig: " + place + roomText +
          " · husleie i aktiv kontrakt: " + money(lease.amountNok) +
          " kr / måned. Statistisk spilltilbud, ikke en virkelig leieannonse."));
      }
      const today = dailyOverview();
      if (today) {
        const daily = node("section"); daily.setAttribute("data-nok-daily-overview", "");
        daily.appendChild(node("h4", "Hverdagen i dag · " + today.date));
        daily.appendChild(node("p", today.jobTitle ? "Aktiv jobb: " + today.jobTitle : "Ingen aktiv jobb registrert."));
        daily.appendChild(node("p", today.dueCount === null ? "Regningsoversikten er utilgjengelig."
          : "Ubetalte regninger med forfall senest i dag: " + today.dueCount));
        daily.appendChild(node("p", today.mealsToday === null ? "Velg en datofestet ukemeny i butikken."
          : "Planlagte måltider som gjenstår i dag: " + today.mealsToday));
        if (today.shoppingCostCents !== null) daily.appendChild(node("p", "Manglende pakninger for ukemenyen: "
          + money(today.shoppingCostCents / 100) + " kr. Kjøp og tilberedning velges i butikken."));
        panel.appendChild(daily);
      }
      const month = root.CivicationCalendar?.getMonthPeriod?.();
      panel.appendChild(node("p", "Spillmåned: " + (month?.id || "Ukjent")));
      const cashFlow = root.CivicationNokBudget?.monthlyCashFlow?.(wallet, month?.id,
        (/** @type {number} */ dayIndex) => root.CivicationCalendar?.getGameDate?.(dayIndex));
      const statement = node("section");
      statement.setAttribute("data-nok-monthly-statement", "");
      statement.appendChild(node("h4", "Betalinger denne spillmåneden"));
      if (cashFlow?.ok) {
        statement.appendChild(node("p", "Utbetalt lønn: " + money(cashFlow.incomeCents / 100) + " kr"));
        statement.appendChild(node("p", "Betalte regninger: " + money(cashFlow.invoiceCents / 100) + " kr"));
        statement.appendChild(node("p", "Varekjøp: " + money(cashFlow.groceryCents / 100) + " kr"));
        statement.appendChild(node("p", "Billettkjøp: " + money(cashFlow.transportCents / 100) + " kr"));
        statement.appendChild(node("p", "Utbetalt totalt: " + money(cashFlow.expenseCents / 100) + " kr"));
        statement.appendChild(node("p", "Inn minus ut: " + money(cashFlow.netCents / 100) + " kr"));
        statement.appendChild(node("p", "Lønn føres på utbetalingsdatoen. Varekjøp føres ved kjøp; bruk av varen endrer bare beholdningen. Budsjettanslag inngår ikke som betalinger."));
        const details = node("details");
        details.appendChild(node("summary", "Se betalingene (" + cashFlow.entries.length + ")"));
        if (!cashFlow.entries.length) details.appendChild(node("p", "Ingen registrerte betalinger denne spillmåneden."));
        for (const entry of cashFlow.entries) {
          const row = node("p", entry.dateISO + " · " + entry.label + " · "
            + (entry.category === "salary" ? "+" : "−") + money(entry.amountCents / 100) + " kr");
          row.style.overflowWrap = "anywhere";
          details.appendChild(row);
        }
        statement.appendChild(details);
      } else statement.appendChild(node("p", "Betalingsoversikten er ikke tilgjengelig. Lagret historikk eller spillmåned kunne ikke bekreftes."));
      panel.appendChild(statement);
      const days = /** @type {Array<Record<string, any>>} */ (Array.isArray(nok.earnedDays) ? nok.earnedDays : []);
      const earned = days.filter(d => d.monthId === month?.id);
      const sum = (/** @type {string} */ key) => earned.every(d => Number.isSafeInteger(d[key]))
        ? earned.reduce((total, d) => total + d[key], 0) / 100 : null;
      const gross = sum("grossCents");
      const tax = sum("taxCents");
      panel.appendChild(node("p", "Opptjent brutto denne måneden: " + money(gross) + " kr"));
      panel.appendChild(node("p", "Estimert skatt: " + money(tax) + " kr"));
      panel.appendChild(node("p", "Opptjent netto: " + money(gross !== null && tax !== null ? gross - tax : null) + " kr"));
      panel.appendChild(node("p", "Lønn utbetales etter spillmånedens slutt. Skatt er et årsberegnet spillestimat."));
      const ledger = /** @type {Array<Record<string, any>>} */ (Array.isArray(nok.payrollLedger) ? nok.payrollLedger : []);
      const last = ledger[ledger.length - 1];
      if (last) panel.appendChild(node("p", "Siste lønnsoppgjør (" + last.monthId + "): "
        + money((last.grossCents - last.taxCents) / 100) + " kr netto"));
      const transport = root.CivicationEconomyEngine?.getNokTransportStatus?.();
      if (transport?.ok) {
        panel.appendChild(node("h4", "Transport"));
        panel.appendChild(node("p", String(transport.offer.label || "30-dagersbillett") + " · " + money(transport.offer.priceNok) + " kr"));
        if (transport.current) {
          panel.appendChild(node("p", "Billett gyldig frem til " + transport.validUntilDateISO + " kl. " + transport.validUntilTime + " i spillet."));
        } else {
          panel.appendChild(node("p", "Gjelder fra kjøpet og i 30 spilldøgn. Ingen automatisk fornyelse."));
          const buy = /** @type {HTMLButtonElement} */ (node("button", "Kjøp 30-dagersbillett"));
          buy.type = "button";
          buy.className = "btn";
          buy.setAttribute("data-nok-transport", "");
          buy.disabled = typeof wallet?.balance !== "number" || !Number.isFinite(wallet.balance)
            || wallet.balance < transport.offer.priceNok;
          buy.addEventListener("click", () => {
            buy.disabled = true;
            try {
              const result = root.CivicationEconomyEngine.purchaseNokTransportPass();
              message = result?.ok ? (result.skipped ? "Du har allerede en gyldig billett." : "Billetten er kjøpt og aktiv i spillet.")
                : result?.reason === "NOT_ENOUGH_PC" ? "Ikke nok penger til billetten." : "Billetten kunne ikke kjøpes.";
              if (result?.ok) root.dispatchEvent(new Event("updateProfile"));
            } catch { message = "Kjøpet kunne ikke bekreftes. Sjekk billett og saldo før nytt forsøk."; }
            render();
          });
          panel.appendChild(buy);
        }
      }
      panel.appendChild(node("h4", "Regninger"));
      const invoices = /** @type {Array<Record<string, any>>} */ (Array.isArray(nok.invoices) ? nok.invoices : []);
      if (!invoices.length) panel.appendChild(node("p", "Ingen registrerte regninger."));
      for (const invoice of invoices) {
        const row = node("div");
        row.style.overflowWrap = "anywhere";
        row.appendChild(node("p", String(invoice.title || invoice.contractId || invoice.id || "Regning")
          + " · " + money(invoice.amountNok) + " kr · Forfall: " + String(invoice.dueDateISO || "Ukjent")));
        if (invoice.priceKind === "effective_statistical_unit_price_with_assumed_consumption")
          row.appendChild(node("p", "Antatt forbruk: " + money(invoice.estimatedConsumptionKwh) + " kWh. Statistisk prisgrunnlag inkluderer nettleie, avgifter og fratrukket støtte."));
        if (invoice.status === "paid") row.appendChild(node("p", "Betalt " + String(invoice.paidDateISO || "")));
        else if (invoice.status === "pending") {
          const button = /** @type {HTMLButtonElement} */ (node("button", "Betal"));
          button.type = "button";
          button.className = "btn";
          button.setAttribute("data-nok-invoice", String(invoice.id || ""));
          button.setAttribute("aria-label", "Betal " + String(invoice.title || invoice.contractId || "regning") + ", " + money(invoice.amountNok) + " kroner");
          const date = root.CivicationCalendar?.getGameDate?.();
          const due = typeof invoice.dueDateISO === "string" && !!date && date >= invoice.dueDateISO;
          const affordable = typeof wallet?.balance === "number" && Number.isFinite(wallet.balance)
            && typeof invoice.amountNok === "number" && Number.isFinite(invoice.amountNok)
            && invoice.amountNok >= 0 && wallet.balance >= invoice.amountNok;
          button.disabled = !due || !affordable || !root.CivicationEconomyEngine?.payNokInvoice;
          button.addEventListener("click", () => {
            button.disabled = true;
            try {
              const result = root.CivicationEconomyEngine.payNokInvoice(invoice.id);
              message = result?.ok ? (result.skipped ? "Regningen var allerede betalt." : "Regningen er betalt.")
                : result?.reason === "NOT_ENOUGH_PC" ? "Ikke nok penger. Regningen er fortsatt ubetalt."
                : "Regningen kunne ikke betales. Ingen betaling er bekreftet.";
            } catch { message = "Betalingen kunne ikke bekreftes. Sjekk saldo og regningsstatus før nytt forsøk."; }
            render();
          });
          row.appendChild(button);
          if (!due) row.appendChild(node("p", "Ikke forfalt ennå."));
          else if (!affordable) row.appendChild(node("p", "Ikke nok penger til å betale."));
        } else if (invoice.status === "cancelled") row.appendChild(node("p", "Regningen er avsluttet."));
        else row.appendChild(node("p", "Regningsstatus er ukjent."));
        panel.appendChild(row);
      }
    }
    const status = node("p", message);
    status.setAttribute("role", "status");
    panel.appendChild(status);
    host.replaceChildren(panel);
    if (focused) {
      const buttons = Array.from(host.querySelectorAll("button[data-nok-invoice]"));
      const next = /** @type {HTMLButtonElement|undefined} */ (buttons.find(b => b.getAttribute("data-nok-invoice") === focusedId));
      (next && !next.disabled ? next : heading).focus({ preventScroll: true });
    }
  }
  root.CivicationEconomyUI = { render, loadActivationConfig, dailyOverview, renderDailyLifeOverview };
  document.addEventListener("DOMContentLoaded", function () {
    render();
    void loadActivationConfig();
  });
  if (document.readyState !== "loading") { render(); void loadActivationConfig(); }
  root.addEventListener("updateProfile", render);
  root.addEventListener("civi:dayPhaseChanged", render);
})(typeof window !== "undefined" ? window : globalThis);

