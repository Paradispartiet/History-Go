(function () {
  "use strict";

  const MANIFEST_PATH = "data/Civication/roleModels/manifest.json";
  const MAIL_TYPES = ["job", "people", "conflict", "story", "event", "brand", "faction_choice"];
  const DAY_PHASES = ["morning", "forenoon", "workday", "lunch", "afternoon", "dinner", "evening", "day_end"];
  const cache = new Map();

  function norm(value) { return String(value || "").trim(); }
  function slugify(value) { return norm(value).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "").slice(0, 80); }
  function uniq(values) { return [...new Set((Array.isArray(values) ? values : []).map(norm).filter(Boolean))]; }
  function pick(obj, keys) { for (const k of keys) { const v = obj?.[k]; if (v !== undefined && v !== null && v !== "") return v; } return null; }
  async function loadJson(path) {
    const p = norm(path); if (!p) return null; if (cache.has(p)) return cache.get(p);
    try { const res = await fetch(p, { cache: "no-store" }); const json = res?.ok ? await res.json() : null; cache.set(p, json); return json; }
    catch (e) { cache.set(p, null); return null; }
  }

  /** @returns {Record<string, any>} */
  function state() { return window.CivicationState?.getState?.() || {}; }
  /** @returns {Record<string, any> | null} */
  function active() { return window.CivicationState?.getActivePosition?.() || null; }
  /** @returns {Record<string, any> | null} */
  function selected() { return window.CivicationTestMode?.inspect?.()?.selectedRole || null; }
  function resolveRoleScope(role) { return norm(window.CivicationCareerRoleResolver?.resolveCareerRoleScope?.(role)) || slugify(role?.role_scope || role?.role_key || role?.title); }
  function planPath(role) { return window.CivicationMailRuntime?.getPlanPath?.(role) || (role?.career_id && resolveRoleScope(role) ? `data/Civication/mailPlans/${role.career_id}/${resolveRoleScope(role)}_plan.json` : null); }
  function familyPaths(role) { return uniq([...(window.CivicationMailRuntime?.getFamilyPaths?.(role) || []), ...(window.CivicationDailyMailBuilder?.getFamilyPaths?.(role) || [])]); }

  /** @returns {Promise<Record<string, any> | null>} */
  async function roleFromKey(roleKey) {
    if (!roleKey) return active() || selected();
    const wanted = slugify(roleKey);
    const candidates = [active(), selected(), ...(window.CivicationTestMode?.listRoles?.() || [])].filter(Boolean);
    let found = candidates.find(r => [r.role_key, r.role_scope, r.role_id, r.title].some(v => slugify(v) === wanted));
    if (found) return found;
    const manifest = await loadJson(MANIFEST_PATH);
    for (const path of (manifest?.files || [])) {
      const model = await loadJson(path);
      if (!model) continue;
      if ([model.role_key, model.role_scope, model.role_id, model.title, path].some(v => slugify(v).includes(wanted) || slugify(v) === wanted)) {
        return { title: model.title, career_id: model.category || model.source?.badge_id, career_name: model.source?.badge_name || model.category, role_key: model.role_key || model.role_scope, role_id: model.role_id, role_scope: model.role_scope, path };
      }
    }
    return null;
  }

  async function roleModelPath(role) {
    if (role?.path) return role.path;
    const manifest = await loadJson(MANIFEST_PATH);
    const scope = slugify(role?.role_scope || role?.role_key || role?.title);
    const cat = slugify(role?.career_id || role?.category);
    for (const path of (manifest?.files || [])) {
      const parts = norm(path).split("/");
      const pathCategory = slugify(parts[3] || "");
      if (cat && pathCategory && pathCategory !== cat) continue;
      if (scope && slugify(path).includes(scope)) return path;
      const model = await loadJson(path);
      if (model && [model.role_key, model.role_scope, model.role_id, model.title].some(v => slugify(v) === scope || slugify(v).includes(scope))) return path;
    }
    return null;
  }

  function flattenFamilies(catalog, path) {
    const type = norm(catalog?.mail_type) || norm(path.split("/").slice(-2, -1)[0]) || "annet";
    return (Array.isArray(catalog?.families) ? catalog.families : []).map(f => ({
      id: norm(f.id), type, path, mails: Array.isArray(f.mails) ? f.mails : [], threads: Array.isArray(f.threads) ? f.threads : [], raw: f
    }));
  }

  function planSteps(plan, runtime) {
    const steps = Array.isArray(plan?.sequence) ? plan.sequence : [];
    const current = Number(runtime?.step_index ?? state().mail_plan_progress?.step_index ?? 0);
    return steps.map((s, i) => ({
      index: i, step: s.step || s.id || i, type: s.type || s.mail_type || null, phase: s.phase || s.phase_tag || null,
      allowed_families: s.allowed_families || s.families || [], fallback_types: s.fallback_types || [], package: s.package || null, week: s.week || null,
      status: i < current ? "done" : (i === current ? "current" : "upcoming")
    }));
  }

  function collectEntities(list, source, out, kind, link) {
    const arr = Array.isArray(list) ? list : (list ? [list] : []);
    for (const x of arr) {
      const id = norm(typeof x === "string" ? x : pick(x, kind === "people" ? ["id", "person_id", "name", "actor", "contact", "sender"] : ["id", "place_id", "name", "location", "institution", "workplace", "place", "placeRef"]));
      if (!id) continue;
      const row = out.get(id) || { id, name: typeof x === "object" ? norm(x.name || x.title || id) : id, role: typeof x === "object" ? norm(x.role || x.function || x.title) : "", type: typeof x === "object" ? norm(x.type || x.category) : "", sources: [], links: [] };
      row.sources.push(source); if (link) row.links.push(link); out.set(id, row);
    }
  }

  function inspectMail(mail, fam, people, places, tasks) {
    const link = mail?.id || fam.id;
    collectEntities([mail.sender, mail.source, mail.actor, mail.contact, mail.relation, mail.person, mail.person_id].filter(Boolean), `mailFamily:${fam.id}`, people, "people", link);
    collectEntities([mail.place_id, mail.location, mail.institution, mail.workplace, mail.place, mail.placeRef].filter(Boolean), `mailFamily:${fam.id}`, places, "places", link);
    if (mail.task_gate || mail.task_domain || mail.task_kind || mail.competency || mail.learning_focus || mail.purpose || mail.stakes || mail.pressure) {
      tasks.push({ id: mail.task_gate?.id || mail.task_kind || mail.id || fam.id, phase: mail.phase || null, mail: mail.id || null, step: null, task_domain: mail.task_domain || mail.task_gate?.task_domain || null, competency: mail.competency || null, pressure: mail.pressure || mail.stakes || null, status: mail.task_gate?.status || null });
    }
  }

  async function buildDebugMap(roleKey) {
    const role = await roleFromKey(roleKey);
    const selectedRole = selected(); const activeRole = active();
    const modelPath = await roleModelPath(role || selectedRole || activeRole); const model = await loadJson(modelPath);
    const pPath = planPath(role); const plan = await loadJson(pPath); const mailRuntime = state().mail_runtime_v1 || window.CivicationMailRuntime?.inspect?.()?.runtime || null;
    const families = [];
    for (const path of familyPaths(role)) families.push(...flattenFamilies(await loadJson(path), path));
    const used = new Set(planSteps(plan, mailRuntime).flatMap(s => s.allowed_families || []));
    const people = new Map(); const places = new Map(); const tasks = [];
    collectEntities(model?.related_people || model?.required_knowledge?.people_connections, "roleModel", people, "people");
    collectEntities(model?.related_places || model?.required_knowledge?.place_connections, "roleModel", places, "places");
    families.forEach(f => { f.mails.forEach(m => inspectMail(m, f, people, places, tasks)); f.threads.forEach(t => inspectMail(t, f, people, places, tasks)); });
    planSteps(plan, mailRuntime).forEach(s => tasks.push({ id: s.step, phase: s.phase, mail: null, step: s.step, task_domain: s.type, competency: null, pressure: null, status: s.status }));
    const daily = window.CivicationDailyMailBuilder?.inspect?.() || null; const incoming = window.CivicationIncomingFlow?.inspect?.() || null;
    const dailyItems = (daily?.runtime?.items || []).map((row, i) => ({ index: i, status: row.status, phase: row.phase || row.event?.phase_tag, slot: row.slot || row.event?.slot, id: row.id || row.event?.id, source_mail_id: row.source_mail_id || row.event?.source_mail_id, subject: row.subject || row.event?.subject, mail_type: row.mail_type || row.event?.mail_type, mail_class: row.mail_class || row.event?.mail_class, source_type: row.source_type || row.event?.source_type, channel: row.channel || row.event?.channel, planned: row.planned === true || row.event?.source_type === "planned", daily_extra: row.daily_extra === true, generated: row.generated === true, task_gate: row.task_gate || row.event?.task_gate || null, narrative: row.narrative || row.event?.narrative_stream_id || null }));
    const familyRows = families.map(f => ({ id: f.id, type: f.type || "annet", path: f.path, mail_count: f.mails.length, thread_count: f.threads.length, used_in_mailPlan: used.has(f.id), package: f.raw.package || null, week: f.raw.week || null }));
    const byType = familyRows.reduce((a, f) => ((a[f.type] ||= []).push(f), a), {});
    const familyPhases = families.flatMap(f => [
      ...f.mails.map(m => m?.phase || m?.phase_tag),
      ...f.threads.map(t => t?.phase || t?.phase_tag)
    ]).map(norm).filter(Boolean);
    const phases = new Set(Object.keys(daily?.by_phase || {}).concat(dailyItems.map(x => x.phase).filter(Boolean), familyPhases));
    const gaps = [];
    if (!model) gaps.push("roleModel mangler"); if (!plan) gaps.push("mailPlan mangler");
    [...used].filter(id => !families.some(f => f.id === id)).forEach(id => gaps.push(`mailPlan peker til missing family: ${id}`));
    familyRows.filter(f => f.mail_count === 0 && f.thread_count === 0).forEach(f => gaps.push(`family finnes men har 0 mails: ${f.id}`));
    if (!familyRows.some(f => f.type === "people" && f.mail_count + f.thread_count > 0)) gaps.push("rollen mangler people-mails");
    if (!["story", "conflict", "event"].some(t => familyRows.some(f => f.type === t))) gaps.push("rollen mangler story/conflict/event");
    if (!["lunch", "afternoon", "evening", "day_end"].some(p => phases.has(p))) gaps.push("rollen mangler lunsj-/kveldsegnet innhold");
    if (!daily?.runtime) gaps.push("DailyMailBuilder runtime finnes ikke");
    if (daily?.runtime && phases.has("morning") && DAY_PHASES.slice(1).some(p => !phases.has(p))) gaps.push("runtime har bare morning og mangler lunch/afternoon/evening/day_end");
    if (incoming?.pending?.length && !daily?.runtime) gaps.push("pending finnes uten dagruntime");
    if (activeRole && !plan && !families.length) gaps.push("aktiv rolle finnes uten plan/families");
    if (selectedRole && !role) gaps.push("valgt rolle finnes i testmodus men kan ikke startes");
    return {
      role: { title: role?.title, career_id: role?.career_id, career_name: role?.career_name, role_key: role?.role_key, role_id: role?.role_id, role_scope: role?.role_scope, selected_test_role: selectedRole, active_state_role: activeRole, selected_matches_active: !!(selectedRole && activeRole && slugify(selectedRole.role_key || selectedRole.role_scope) === slugify(activeRole.role_key || activeRole.role_scope)) },
      roleModel: { path: modelPath, exists: !!model, schema: model?.schema, version: model?.version, core_narrative: model?.core_narrative, work_life: model?.work_life, daily_work: model?.work_life?.daily_work, responsibilities: model?.work_life?.responsibilities, challenges: model?.challenges, dilemmas: model?.dilemmas, related_people: model?.related_people || model?.required_knowledge?.people_connections || [], related_places: model?.related_places || model?.required_knowledge?.place_connections || [], mail_integration: model?.mail_integration, recommended_mail_families: model?.mail_integration?.recommended_mail_families },
      mailPlan: { path: pPath, exists: !!plan, id: plan?.id, sequence_count: (plan?.sequence || []).length, current_step_index: mailRuntime?.step_index ?? state().mail_plan_progress?.step_index ?? null, steps: planSteps(plan, mailRuntime) },
      mailFamilies: byType, people: [...people.values()], places: [...places.values()], tasks,
      dailyRuntime: daily ? { date: daily.runtime?.date, role_scope: daily.runtime?.role_scope, role_id: daily.runtime?.role_id, plan_id: daily.runtime?.plan_id, item_count: daily.item_count, current_index: daily.runtime?.current_index, by_phase: daily.by_phase, by_status: daily.by_status, items: dailyItems } : null,
      inboxAndPending: { pending: incoming?.pending || daily?.pending || null, job_count: incoming?.job?.length || 0, private_count: incoming?.private?.length || 0, system_count: (incoming?.inbox || []).filter(x => x?.channel === "system" || x?.event?.channel === "system").length, activeWorkday: incoming?.activeWorkday || null, channels: incoming?.channels || null, pending_without_runtime: !!((incoming?.pending?.length || daily?.pending) && !daily?.runtime), runtime_without_pending: !!(daily?.runtime && !(incoming?.pending?.length || daily?.pending)) },
      gaps
    };
  }

  async function inspect() { return window.CivicationMailRuntime?.inspect?.() || null; }
  async function candidates() { return await window.CivicationMailRuntime?.debugCandidates?.() || []; }
  async function inspectRole(roleKey) { return buildDebugMap(roleKey); }
  async function inspectActive() { return buildDebugMap(); }
  function inspectDailyRuntime() { return window.CivicationDailyMailBuilder?.inspect?.() || null; }
  async function inspectGaps(roleKey) { return (await buildDebugMap(roleKey)).gaps; }

  // Read-only diagnose av de parallelle arbeidsdagssporene (se
  // docs/CIVICATION_WORKDAY_PHASE_INTEGRATION_AUDIT.md). Samler patch-flagg og de tre
  // stedene som tracker dagens fase (Calendar vs. DailyMailBuilder item-fase vs.
  // DayProgression) slik at fase-"ping-pong" mellom dayPatches.answer og DailyMailBuilder
  // er rask å se. Endrer ingenting.
  function inspectWorkdayPhaseIntegration() {
    const proto = window.CivicationEventEngine?.prototype || null;
    const daily = inspectDailyRuntime();
    const items = Array.isArray(daily?.runtime?.items) ? daily.runtime.items : [];
    const currentIndex = Math.max(0, Number(daily?.runtime?.current_index || 0));
    const currentItem = items[currentIndex] || null;
    const itemPhase = norm(currentItem?.phase || currentItem?.event?.phase_tag) || null;

    const dayProg = window.CivicationDayProgression?.inspect?.() || null;
    const calendarPhase = norm(window.CivicationCalendar?.getPhase?.()) || null;

    const patches = {
      dayPatches_onAppOpen_answer: proto?.__dayPhasePatched === true,
      mailRuntime: proto?.__civicationMailRuntimePatched === true,
      dailyMailBuilder: proto?.__civicationDailyMailBuilderPatched === true,
      dailyTaskGates: proto?.__civicationDailyTaskGatesPatched === true
    };

    const phaseTrackers = {
      calendar_phase: calendarPhase,
      dailymailbuilder_item_phase: itemPhase,
      dayprogression_phase: norm(dayProg?.phase) || null
    };
    const phaseValues = Object.values(phaseTrackers).filter(Boolean);
    const phaseAgreement = phaseValues.length > 0 && new Set(phaseValues).size === 1;

    return {
      patches,
      multiple_onappopen_owners: [patches.dayPatches_onAppOpen_answer, patches.dailyMailBuilder, patches.dailyTaskGates].filter(Boolean).length,
      phase_trackers: phaseTrackers,
      phase_agreement: phaseAgreement,
      phase_mismatch: !phaseAgreement,
      day_runtime_exists: !!daily?.runtime,
      by_phase: daily?.by_phase || null,
      by_status: daily?.by_status || null,
      open_items_in_phase: dayProg?.openItemsInPhase ?? null,
      can_advance: dayProg?.canAdvance ?? null,
      next_phase: dayProg?.nextPhase ?? null,
      task_gates: (window.CivicationDailyTaskGates?.inspect?.() || {})?.task_gates || []
    };
  }

  const api = { inspect, debugCandidates: candidates, simulate: candidates, inspectRole, inspectActive, inspectDailyRuntime, inspectGaps, buildDebugMap, inspectWorkdayPhaseIntegration };
  Object.assign(api, { simulateRepeated: candidates, simulateRepeatedAll: candidates, simulateArbeider: candidates, simulateFagarbeider: candidates, simulateMellomleder: candidates, simulateArbeiderRepeated: candidates, simulateFagarbeiderRepeated: candidates, simulateMellomlederRepeated: candidates });
  window.CiviMailPlanDebug = api;
  window.CivicationDebug = Object.assign(window.CivicationDebug || {}, api);
})();
