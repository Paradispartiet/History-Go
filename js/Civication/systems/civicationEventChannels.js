(function () {
  const WORKDAY_DOMAINS = new Set([
    "cash_desk",
    "customer_service",
    "frontline_operations",
    "sales_dialog",
    "product_guidance"
  ]);

  const WORKDAY_PRESSURE = new Set(["rush", "hoy_ko", "travelt_gulv"]);
  const WORKDAY_FAMILIES = new Set(["kasse_og_pris", "kundemote_og_service", "travelt_gulv"]);
  const MESSAGE_PLANNED_TYPES = new Set(["people", "story", "faction_choice"]);

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function includesPressure(value) {
    if (Array.isArray(value)) return value.some(function (v) { return WORKDAY_PRESSURE.has(normalize(v)); });
    return WORKDAY_PRESSURE.has(normalize(value));
  }

  function classifyEvent(event) {
    const ev = event || {};
    const sourceType = normalize(ev.source_type);
    const mailClass = normalize(ev.mail_class);
    const mailType = normalize(ev.mail_type);
    const taskDomain = normalize(ev.task_domain);
    const mailFamily = normalize(ev.mail_family);

    if (
      sourceType === "brand_progression" ||
      mailClass === "job_milestone" ||
      !!ev.brand_progression_meta
    ) {
      return "milestone";
    }

    if (
      sourceType === "workday" ||
      mailClass === "work_event" ||
      mailClass === "customer_event" ||
      mailClass === "shift_event" ||
      mailClass === "task_event" ||
      WORKDAY_DOMAINS.has(taskDomain) ||
      includesPressure(ev.pressure) ||
      WORKDAY_FAMILIES.has(mailFamily)
    ) {
      return "workday";
    }

    if (
      sourceType === "life" ||
      sourceType === "blocked_job" ||
      mailClass === "private_message" ||
      mailClass === "job_message" ||
      mailClass === "notification" ||
      mailClass === "opportunity_blocked" ||
      (sourceType === "planned" && MESSAGE_PLANNED_TYPES.has(mailType))
    ) {
      return "message";
    }

    if (
      sourceType === "system" ||
      sourceType === "debug" ||
      mailClass === "system" ||
      mailClass === "debug" ||
      mailType === "status"
    ) {
      return "system";
    }

    return "unknown";
  }

  function splitInbox(inbox) {
    const list = Array.isArray(inbox) ? inbox : [];
    const buckets = { messages: [], workday: [], milestones: [], system: [], unknown: [] };

    list.forEach(function (item) {
      const ev = item && item.event ? item.event : item;
      const kind = classifyEvent(ev);
      if (kind === "message") buckets.messages.push(item);
      else if (kind === "workday") buckets.workday.push(item);
      else if (kind === "milestone") buckets.milestones.push(item);
      else if (kind === "system") buckets.system.push(item);
      else buckets.unknown.push(item);
    });

    return buckets;
  }

  function isMessage(event) { return classifyEvent(event) === "message"; }
  function isWorkdayEvent(event) { return classifyEvent(event) === "workday"; }
  function isMilestone(event) { return classifyEvent(event) === "milestone"; }

  function inspect(inbox) {
    const buckets = splitInbox(inbox);
    return {
      counts: {
        messages: buckets.messages.length,
        workday: buckets.workday.length,
        milestones: buckets.milestones.length,
        system: buckets.system.length,
        unknown: buckets.unknown.length
      },
      buckets: buckets
    };
  }

  window.CivicationEventChannels = {
    classifyEvent: classifyEvent,
    splitInbox: splitInbox,
    isMessage: isMessage,
    isWorkdayEvent: isWorkdayEvent,
    isMilestone: isMilestone,
    inspect: inspect
  };
})();
