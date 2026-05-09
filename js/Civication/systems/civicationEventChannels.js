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

  const ROLE_BOUND_SOURCE_TYPES = new Set([
    "planned",
    "thread",
    "role",
    "legacy_pack",
    "workday",
    "brand_progression",
    "role_outcome"
  ]);

  const ROLE_BOUND_MAIL_TYPES = new Set([
    "job",
    "job_micro",
    "followup",
    "knowledge",
    "consequence",
    "conflict",
    "event",
    "story",
    "people",
    "faction_choice",
    "job_outcome"
  ]);

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function includesPressure(value) {
    if (Array.isArray(value)) return value.some(function (v) { return WORKDAY_PRESSURE.has(normalize(v)); });
    return WORKDAY_PRESSURE.has(normalize(value));
  }

  function hasRoleBinding(event) {
    const ev = event || {};
    return !!(
      ev.role_content_meta ||
      ev.mail_plan_meta ||
      ev.career_outcome_meta ||
      normalize(ev.role_scope) ||
      normalize(ev.role_id) ||
      normalize(ev.role_key) ||
      normalize(ev.career_id) ||
      normalize(ev.tier_label) ||
      normalize(ev.brand_id) ||
      normalize(ev.brand_name)
    );
  }

  function isRoleBoundJobMail(event) {
    const ev = event || {};
    const sourceType = normalize(ev.source_type);
    const mailType = normalize(ev.mail_type || ev.type || ev.kind);
    const mailClass = normalize(ev.mail_class);
    const explicit = normalize(ev.channel || ev.messageChannel);

    if (explicit === "job" || explicit === "jobmail") return true;
    if (mailClass === "job_message" || mailClass === "opportunity_blocked" || mailClass === "career_outcome") return true;
    if (sourceType === "blocked_job" || sourceType === "workday" || sourceType === "brand_progression" || sourceType === "role_outcome") return true;
    if (ROLE_BOUND_SOURCE_TYPES.has(sourceType) && hasRoleBinding(ev)) return true;
    if (ROLE_BOUND_MAIL_TYPES.has(mailType) && hasRoleBinding(ev)) return true;

    return false;
  }

  function classifyEvent(event) {
    const ev = event || {};
    const sourceType = normalize(ev.source_type);
    const mailClass = normalize(ev.mail_class);
    const mailType = normalize(ev.mail_type);
    const taskDomain = normalize(ev.task_domain);
    const mailFamily = normalize(ev.mail_family);

    if (
      sourceType === "role_outcome" ||
      mailType === "job_outcome" ||
      mailClass === "career_outcome" ||
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

  function getMessageChannel(event) {
    const ev = event || {};
    const explicit = normalize(ev.channel || ev.messageChannel);
    if (explicit === "job" || explicit === "jobmail") return "job";
    if (explicit === "private" || explicit === "personal") return "private";

    const type = normalize(ev.type || ev.kind || ev.mail_type);
    const track = normalize(ev.track || ev.arc);
    const slot = normalize(ev.slot || ev.timeSlot || ev.time_slot || ev.phase_tag);
    const sourceType = normalize(ev.source_type);
    const mailClass = normalize(ev.mail_class);

    if (
      sourceType === "life" ||
      mailClass === "private_message" ||
      type === "private" ||
      type === "personal" ||
      slot === "evening" ||
      slot === "free_time" ||
      slot === "leisure" ||
      slot === "personal"
    ) {
      return "private";
    }

    if (
      isRoleBoundJobMail(ev) ||
      type === "job" ||
      type === "jobmail" ||
      track === "career" ||
      track === "job" ||
      slot === "work" ||
      slot === "workday" ||
      classifyEvent(ev) === "workday" ||
      classifyEvent(ev) === "milestone"
    ) {
      return "job";
    }

    return "private";
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

  function splitInboxByMessageChannel(inbox) {
    const list = Array.isArray(inbox) ? inbox : [];
    const buckets = { job: [], private: [], system: [], unknown: [] };

    list.forEach(function (item) {
      const ev = item && item.event ? item.event : item;
      const kind = classifyEvent(ev);

      if (kind === "system") {
        buckets.system.push(item);
        return;
      }

      const channel = getMessageChannel(ev);
      if (channel === "job") buckets.job.push(item);
      else if (channel === "private") buckets.private.push(item);
      else buckets.unknown.push(item);
    });

    return buckets;
  }

  function isMessage(event) { return classifyEvent(event) === "message"; }
  function isWorkdayEvent(event) { return classifyEvent(event) === "workday"; }
  function isMilestone(event) { return classifyEvent(event) === "milestone"; }
  function isJobMail(event) { return getMessageChannel(event) === "job"; }
  function isPrivateMessage(event) { return getMessageChannel(event) === "private"; }

  function inspect(inbox) {
    const buckets = splitInbox(inbox);
    const channels = splitInboxByMessageChannel(inbox);
    return {
      counts: {
        messages: buckets.messages.length,
        workday: buckets.workday.length,
        milestones: buckets.milestones.length,
        system: buckets.system.length,
        unknown: buckets.unknown.length,
        job: channels.job.length,
        private: channels.private.length
      },
      buckets: buckets,
      channels: channels
    };
  }

  window.CivicationEventChannels = {
    classifyEvent: classifyEvent,
    getMessageChannel: getMessageChannel,
    splitInbox: splitInbox,
    splitInboxByMessageChannel: splitInboxByMessageChannel,
    isMessage: isMessage,
    isWorkdayEvent: isWorkdayEvent,
    isMilestone: isMilestone,
    isJobMail: isJobMail,
    isPrivateMessage: isPrivateMessage,
    inspect: inspect
  };
})();
