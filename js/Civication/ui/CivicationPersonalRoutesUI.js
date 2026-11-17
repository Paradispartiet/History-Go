// Explicitly entered private locations for a Civication job. No GPS discovery.
(function () {
  "use strict";
  const W = /** @type {any} */ (window);
  function make(tag, text, parent) {
    const node = document.createElement(tag);
    if (text != null) node.textContent = String(text);
    if (parent) parent.appendChild(node);
    return node;
  }
  function input(parent, label, value, type) {
    const wrap = make("label", null, parent);
    wrap.style.cssText = "display:flex;flex-direction:column;gap:4px;min-width:0";
    make("span", label, wrap);
    const field = make("input", null, wrap);
    field.type = type || "text";
    field.value = value == null ? "" : String(value);
    field.style.cssText = "padding:8px;min-width:0;width:100%;box-sizing:border-box";
    if (type === "number") {
      field.step = "any";
      field.inputMode = "decimal";
    }
    return field;
  }
  function locationForm(host, heading, location, onSave, addressNeeded) {
    const block = make("div", null, host);
    block.style.cssText = "border:1px solid rgba(128,128,128,.3);border-radius:12px;padding:12px;min-width:0";
    make("h4", heading, block);
    const form = make("form", null, block);
    form.style.cssText = "display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:8px";
    const name = input(form, "Navn", location?.name || (addressNeeded ? "Arbeidssted" : "Hjem"));
    const address = input(form, addressNeeded ? "Arbeidsadresse (påkrevd)" : "Hjemadresse (valgfri)", location?.address || "");
    const lat = input(form, "Breddegrad (valgfri)", location?.latitude, "number");
    const lon = input(form, "Lengdegrad (valgfri)", location?.longitude, "number");
    const submit = make("button", "Lagre " + heading.toLowerCase(), form);
    submit.className = "btn"; submit.type = "submit";
    const status = make("div", null, block);
    status.setAttribute("role", "status");
    status.className = "muted";
    form.addEventListener("submit", event => {
      event.preventDefault();
      try {
        onSave({
          name: name.value, address: address.value, latitude: lat.value, longitude: lon.value,
          source: "player_entered"
        });
        status.textContent = lat.value && lon.value
          ? "Lagret med oppgitte koordinater. Veirute er ikke beregnet."
          : "Adresse lagret. Koordinater må legges til før ruten kan kartlegges.";
      } catch (error) { status.textContent = error.message || "Ugyldig adresse eller koordinater"; }
    });
  }
  function render() {
    const host = document.getElementById("civiPersonalRoutePanel");
    const api = W.CivicationPersonalRoutes;
    if (!host || !api) return;
    if (host.contains(document.activeElement)) return;
    host.replaceChildren();
    const heading = make("h3", "Arbeidssted og personlig rute", host);
    heading.style.margin = "16px 0 6px";
    make("p", "Registrer arbeidsstedets adresse. Personlige ruter er private og planlagte, ikke en logg over hvor du har vært.", host).className = "muted";
    const active = W.CivicationState?.getActivePosition?.() || null;
    if (!api.jobKey(active)) {
      make("p", "Velg en jobb før du registrerer arbeidssted og pendlerute.", host).className = "muted";
      return;
    }
    const forms = make("div", null, host);
    forms.style.cssText = "display:grid;grid-template-columns:repeat(auto-fit,minmax(245px,1fr));gap:10px;margin:10px 0";
    locationForm(forms, "Hjem", api.getHome(), raw => api.setHome(raw), false);
    locationForm(forms, "Arbeidssted", api.getWorkplace(active), raw => api.setWorkplace(raw, active), true);
    const trip = make("div", null, host);
    trip.style.cssText = "display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin:12px 0";
    const day = make("select", null, trip);
    day.setAttribute("aria-label", "Ukedag");
    ["Mandag", "Tirsdag", "Onsdag", "Torsdag", "Fredag", "Lørdag", "Søndag"].forEach((label, index) => {
      const option = make("option", label, day); option.value = String(index);
    });
    const mode = make("select", null, trip);
    mode.setAttribute("aria-label", "Transportmåte");
    [["walking","Til fots"],["cycling","Sykkel"],["driving","Bil"],["transit","Kollektiv"]].forEach(([value,label]) => {
      const option = make("option", label, mode); option.value = value;
    });
    const destination = make("select", null, trip);
    destination.setAttribute("aria-label", "Reiseretning");
    [["to_work","Til jobb"],["to_home","Hjem fra jobb"]].forEach(([value,label]) => {
      const option = make("option", label, destination); option.value = value;
    });
    const action = make("button", "Lagre planlagt pendling", trip);
    action.className = "btn"; action.type = "button";
    const feedback = make("div", null, host);
    feedback.setAttribute("role", "status");
    feedback.className = "muted";
    action.addEventListener("click", () => {
      const result = api.planCommute({
        active, travelMode: mode.value, direction: destination.value, weekDay: Number(day.value)
      });
      if (result.ok) {
        feedback.textContent = "Pendling lagret: " + result.route.waypoints.map(x => x.name).join(" → ") +
          ". Veigeometri og reisetid beregnes først etter en faktisk kart-rutetjeneste.";
      } else {
        const messages = {
          HOME_REQUIRED: "Registrer hjem først.",
          WORK_ADDRESS_REQUIRED: "Registrer arbeidsadresse først.",
          COORDINATES_REQUIRED: "Legg inn koordinater for begge stedene før ruten kan tegnes.",
          NO_ACTIVE_JOB: "Ingen aktiv jobb.",
          INVALID_WEEKDAY: "Ugyldig ukedag.",
          INVALID_TRAVEL_MODE: "Ugyldig transportmåte.",
          INVALID_DIRECTION: "Ugyldig reiseretning."
        };
        feedback.textContent = messages[result.reason] || "Ruten kunne ikke lagres.";
      }
    });
    const routeAction = make("button", "Beregn veirute med OpenRouteService", trip);
    routeAction.className = "btn";
    routeAction.type = "button";
    routeAction.addEventListener("click", async () => {
      const provider = W.CivicationRoadRouter;
      if (!provider) { feedback.textContent = "Rutetjenesten er ikke tilgjengelig."; return; }
      const planned = api.planCommute({
        active, travelMode: mode.value, direction: destination.value, weekDay: Number(day.value)
      });
      if (!planned.ok) {
        feedback.textContent = planned.reason === "COORDINATES_REQUIRED"
          ? "Legg inn koordinater for begge stedene."
          : planned.reason === "WORK_ADDRESS_REQUIRED" ? "Arbeidsadresse mangler."
          : "Lagre gyldig hjem og arbeidssted før du beregner ruten.";
        return;
      }
      routeAction.disabled = true;
      feedback.textContent = "Beregner veirute. Bare ved dette valget sendes hjem- og jobbkoordinater til OpenRouteService.";
      try {
        const result = await provider.calculate(planned.route, { consent: true });
        if (!result.ok) {
          const reasons = {
            ROUTER_NOT_CONFIGURED: "Rutetjenesten er ikke konfigurert.",
            UNSUPPORTED_TRAVEL_MODE: "Kollektivruter støttes ikke av denne rutetjenesten.",
            ROUTING_UNAVAILABLE: "Rutetjenesten kunne ikke beregne ruten.",
            INVALID_ROUTING_RESPONSE: "Ugyldig rutesvar. Ingen veirute ble lagret."
          };
          feedback.textContent = reasons[result.reason] || "Ruten ble ikke beregnet.";
        } else {
          const saved = api.saveResolvedRoute(planned.route.id, result);
          feedback.textContent = "Veirute beregnet: " +
            (saved.distanceMeters / 1000).toFixed(1) + " km · omtrent " +
            Math.round(saved.durationMinutes) + " min. Lagret privat som planlagt reise, ikke gjennomført besøk.";
        }
      } catch (_) {
        feedback.textContent = "Kunne ikke lagre den beregnede veiruten.";
      } finally {
        routeAction.disabled = false;
      }
    });
    make("p", "Adresse og koordinater er brukeroppgitt, ikke automatisk verifisert. Et klikk på «Beregn veirute» sender koordinatene til OpenRouteService. Ingen GPS-sporing, automatisk AHA-deling eller økonomiske handlinger.", host).className = "muted";
  }
  W.CivicationPersonalRoutesUI = Object.freeze({ render });
  W.addEventListener("civi:booted", render);
  W.addEventListener("updateProfile", render);
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", render);
  else render();
})();
