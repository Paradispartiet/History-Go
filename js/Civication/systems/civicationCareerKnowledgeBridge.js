// Career Knowledge Bridge v1
// Knytter Civication-roller og jobbmailer til levende Fagverk-data.
// Broen kopierer ikke fagtekst og gir aldri jobb, myndighet eller forfremmelse.
(function (root) {
  "use strict";

  const BRIDGE_PATH = "data/Civication/careerKnowledgeBridge.json";
  const KNOWLEDGE_ENTRY_KEY = "hg_knowledge_entries_v2";
  const cache = new Map();

  function norm(value) {
    return String(value == null ? "" : value).trim();
  }

  function list(value) {
    return Array.isArray(value) ? value : [];
  }

  function object(value) {
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
  }

  function unique(values) {
    return [...new Set(list(values).map(norm).filter(Boolean))];
  }

  function normalizedTerms(values) {
    return new Set(unique(values).map((value) => value.toLocaleLowerCase("nb-NO")));
  }

  async function fetchJson(path) {
    const file = norm(path);
    if (!file) return null;
    if (cache.has(file)) return cache.get(file);

    let value = null;
    try {
      if (root.CivicationJsonStore?.fetchJson) {
        value = await root.CivicationJsonStore.fetchJson(file);
      } else if (typeof root.fetch === "function") {
        const response = await root.fetch(file, { cache: "no-store" });
        value = response?.ok ? await response.json() : null;
      }
    } catch (error) {
      if (root.DEBUG) console.warn("[CareerKnowledgeBridge] kunne ikke laste", file, error);
    }

    cache.set(file, value);
    return value;
  }

  async function loadBridge() {
    return await fetchJson(BRIDGE_PATH);
  }

  function resolveRoleScope(input) {
    const explicit = norm(input?.role_scope);
    if (explicit) return explicit;
    try {
      const resolved = norm(root.CivicationCareerRoleResolver?.resolveCareerRoleScope?.(input));
      return resolved && resolved !== "unknown" ? resolved : "";
    } catch {
      return "";
    }
  }

  function categoryOf(input) {
    return norm(input?.category || input?.career_id);
  }

  async function getRoleConfig(input) {
    const bridge = await loadBridge();
    const category = categoryOf(input);
    const roleScope = resolveRoleScope(input);
    const key = category && roleScope ? `${category}/${roleScope}` : "";
    return {
      bridge,
      key,
      config: key ? object(bridge?.roles)[key] || null : null
    };
  }

  async function loadMethods(source) {
    const doc = await fetchJson(source?.methods_file);
    return new Map(list(doc?.methods).map((method) => [norm(method?.method_id), method]));
  }

  async function hydrateRef(ref, source, methods) {
    const base = { ...ref, resolved: false, unresolved_reason: null };
    if (norm(ref?.kind) === "topic") {
      const article = await fetchJson(ref?.article_file);
      if (!article || norm(article.topic_id) !== norm(ref.topic_id)) {
        return { ...base, unresolved_reason: "topic_unavailable" };
      }
      return {
        ...base,
        resolved: true,
        current_title: norm(article.title),
        current_definition: norm(article.definition),
        current_status: norm(article.article_status),
        current_quality_score: Number(article?.quality_review?.total || 0),
        current_updated_at: norm(article.updated_at),
        claim_ids: unique(article.claim_ids),
        source_ids: unique(article.source_ids),
        subject_href: norm(source?.subject_href),
        knowledge_href: norm(source?.knowledge_href)
      };
    }

    if (norm(ref?.kind) === "method") {
      const method = methods.get(norm(ref?.method_id));
      if (!method) return { ...base, unresolved_reason: "method_unavailable" };
      return {
        ...base,
        resolved: true,
        current_title: norm(method.title),
        current_definition: norm(method.description),
        current_status: norm(method.university_matrix_status || method.canonical_status),
        current_quality_score: null,
        current_updated_at: null,
        claim_ids: [],
        source_ids: [],
        subject_href: norm(source?.subject_href),
        knowledge_href: norm(source?.knowledge_href)
      };
    }

    return { ...base, unresolved_reason: "unknown_reference_kind" };
  }

  async function resolveRoleKnowledge(input) {
    const { bridge, key, config } = await getRoleConfig(input);
    if (!config) return { key, config: null, refs: [], unresolved: true };
    const source = object(bridge?.source_registry)[norm(config.subject_id)] || {};
    const methods = await loadMethods(source);
    const refs = await Promise.all(list(config.knowledge_refs).map((ref) => hydrateRef(ref, source, methods)));
    return { key, config, source, refs, unresolved: refs.some((ref) => !ref.resolved) };
  }

  async function decorateMail(mail) {
    const requested = list(mail?.knowledge_refs);
    if (!requested.length) return mail;

    const role = await resolveRoleKnowledge(mail);
    const byId = new Map(role.refs.map((ref) => [norm(ref.ref_id), ref]));
    const resolved = requested.map((request) => {
      const requestObject = typeof request === "string" ? { ref_id: request } : object(request);
      const canonical = byId.get(norm(requestObject.ref_id));
      return canonical
        ? { ...canonical, ...requestObject, resolved: canonical.resolved }
        : { ...requestObject, resolved: false, unresolved_reason: "bridge_reference_missing" };
    });

    const historyGoLinks = [];
    for (const ref of resolved) {
      if (ref.subject_href) historyGoLinks.push({ label: `Åpne ${ref.current_title || "faget"} i Fagverket`, url: ref.subject_href });
      if (ref.knowledge_href) historyGoLinks.push({ label: "Se din Religion-kunnskap", url: ref.knowledge_href });
    }

    return {
      ...mail,
      knowledge_refs_resolved: resolved,
      history_go_learning_links: historyGoLinks.filter((link, index, all) => (
        all.findIndex((candidate) => candidate.label === link.label && candidate.url === link.url) === index
      )),
      knowledge_bridge: {
        schema: norm(role?.config ? "civication_career_knowledge_bridge_v1" : ""),
        role_key: norm(role.key),
        content_strategy: "pinned_gameplay_contract_with_live_fagverk_enrichment",
        gameplay_contract_id: norm(mail?.knowledge_contract?.contract_id),
        gameplay_contract_version: Number(mail?.knowledge_contract?.version || 0),
        authority_effect: "none",
        eligibility_effect: "soft_context_only"
      }
    };
  }

  function readKnowledgeEntries() {
    try {
      const parsed = JSON.parse(root.localStorage?.getItem(KNOWLEDGE_ENTRY_KEY) || "[]");
      return list(parsed);
    } catch {
      return [];
    }
  }

  function readSubjectMeritPoints(subjectId) {
    try {
      const parsed = JSON.parse(root.localStorage?.getItem("merits_by_category") || "{}");
      return Number(parsed?.[subjectId]?.points || 0);
    } catch {
      return 0;
    }
  }

  function entryMatchesRef(entry, ref, subjectId) {
    if (norm(entry?.subject_id) !== norm(subjectId)) return false;
    const emneIds = new Set(unique(entry?.emne_ids));
    if (unique(ref?.knowledge_signal_emne_ids).some((id) => emneIds.has(id))) return true;
    if (emneIds.has(norm(ref?.topic_id))) return true;

    const entryTerms = normalizedTerms([
      entry?.topic,
      ...list(entry?.concepts),
      ...list(entry?.terms),
      ...list(entry?.tags)
    ]);
    return unique(ref?.knowledge_signal_terms).some((term) => entryTerms.has(term.toLocaleLowerCase("nb-NO")));
  }

  function evaluateKnowledgeRefsSync(value, options) {
    const refs = list(value?.knowledge_refs_resolved || value);
    const resolvedRefs = refs.filter((ref) => ref?.resolved !== false);
    const subjectId = norm(options?.subject_id || value?.category || value?.career_id || "religion");
    const entries = list(options?.entries || readKnowledgeEntries());
    const subjectEntries = entries.filter((entry) => norm(entry?.subject_id) === subjectId);
    const matchedRefIds = resolvedRefs
      .filter((ref) => subjectEntries.some((entry) => entryMatchesRef(entry, ref, subjectId)))
      .map((ref) => norm(ref.ref_id));
    const minimum = Math.max(1, Number(options?.minimum_matches_for_qualified || 1));
    const meritPoints = Number.isFinite(Number(options?.merit_points))
      ? Number(options.merit_points)
      : readSubjectMeritPoints(subjectId);

    let knowledgeState = "missing";
    if (matchedRefIds.length >= minimum) knowledgeState = "qualified";
    else if (subjectEntries.length > 0 || meritPoints > 0) knowledgeState = "assisted";

    return {
      source: "career_knowledge_bridge",
      subject_id: subjectId,
      knowledge_state: knowledgeState,
      matched_ref_ids: matchedRefIds,
      unresolved_ref_ids: refs.filter((ref) => ref?.resolved === false).map((ref) => norm(ref.ref_id)),
      subject_entry_count: subjectEntries.length,
      merit_points: meritPoints,
      choice_policy: "advisory",
      authority_effect: "none",
      eligibility_effect: "soft_context_only"
    };
  }

  async function buildJobDescription(input) {
    const role = await resolveRoleKnowledge(input);
    if (!role.config) return null;
    const [model, grammar] = await Promise.all([
      fetchJson(role.config.role_model),
      fetchJson(role.config.work_grammar)
    ]);
    if (!model || !grammar) return null;

    const topics = role.refs.filter((ref) => ref.kind === "topic" && ref.resolved);
    const methods = role.refs.filter((ref) => ref.kind === "method" && ref.resolved);
    return {
      schema: "civication_generated_job_description_v1",
      generated_from_live_sources: true,
      role_key: role.key,
      title: norm(input?.title || model.title),
      shared_work_world_title: norm(model.title),
      badge_titles: unique(grammar?.badge_binding?.badge_titles),
      summary: norm(list(model.core_narrative)[0] || grammar.work_world),
      sections: {
        what_you_do: unique(model?.work_life?.daily_work || grammar.work_loops),
        what_you_must_understand: topics.map((ref) => ({
          ref_id: ref.ref_id,
          topic_id: ref.topic_id,
          title: ref.current_title,
          definition: ref.current_definition,
          level: ref.level,
          href: ref.subject_href
        })),
        methods_in_use: methods.map((ref) => ({
          ref_id: ref.ref_id,
          method_id: ref.method_id,
          title: ref.current_title,
          description: ref.current_definition,
          level: ref.level,
          href: ref.subject_href
        })),
        work_environment: unique(model?.work_life?.work_environment),
        authority: {
          can: unique(model?.authority_boundaries?.can || grammar?.authority_boundary?.can),
          cannot: unique(model?.authority_boundaries?.cannot || grammar?.authority_boundary?.cannot)
        },
        dilemmas: list(model.dilemmas).map((item) => ({ title: norm(item.title), setup: norm(item.setup) })),
        career_paths: {
          entry_from: unique(model?.career_path?.entry_from),
          progression_to: unique(model?.career_path?.progression_to),
          possible_exits: unique(model?.career_path?.possible_exits)
        }
      },
      learning_links: [
        { label: "Åpne Religion i Fagverket", url: norm(role.source?.subject_href) },
        { label: "Se din Religion-kunnskap", url: norm(role.source?.knowledge_href) }
      ].filter((item) => item.url),
      provenance: {
        bridge: BRIDGE_PATH,
        role_model: role.config.role_model,
        work_grammar: role.config.work_grammar,
        fagverk_files: unique(role.refs.filter((ref) => ref.resolved).map((ref) => ref.article_file || role.source?.methods_file)),
        unresolved_ref_ids: role.refs.filter((ref) => !ref.resolved).map((ref) => norm(ref.ref_id))
      },
      safeguards: {
        knowledge_grants_authority: false,
        knowledge_grants_job: false,
        knowledge_grants_promotion: false
      }
    };
  }

  async function getRolesForKnowledge(query) {
    const bridge = await loadBridge();
    const subjectId = norm(query?.subject_id);
    const topicId = norm(query?.topic_id);
    const methodId = norm(query?.method_id);
    const matches = [];
    for (const [roleKey, config] of Object.entries(object(bridge?.roles))) {
      if (subjectId && norm(config?.subject_id) !== subjectId) continue;
      const refs = list(config?.knowledge_refs).filter((ref) => (
        (!topicId || norm(ref?.topic_id) === topicId) &&
        (!methodId || norm(ref?.method_id) === methodId)
      ));
      if ((topicId || methodId) && !refs.length) continue;
      matches.push({
        role_key: roleKey,
        category: norm(config?.category),
        role_scope: norm(config?.role_scope),
        levels: unique(refs.map((ref) => ref.level)),
        applications: unique(refs.flatMap((ref) => list(ref.applications)))
      });
    }
    return matches;
  }

  function clearCache() {
    cache.clear();
  }

  root.CivicationCareerKnowledgeBridge = {
    BRIDGE_PATH,
    loadBridge,
    getRoleConfig,
    resolveRoleKnowledge,
    decorateMail,
    evaluateKnowledgeRefsSync,
    buildJobDescription,
    getRolesForKnowledge,
    clearCache
  };
})(typeof window !== "undefined" ? window : globalThis);
