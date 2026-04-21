(function () {
  class CivicationMailPlanPatchRuntime {
    static apply() {
      const Engine = window.CivicationEventEngine;
      if (!Engine || !Engine.prototype) return false;
      const proto = Engine.prototype;
      if (proto.__mailPlanRuntimePatched) return true;

      const PHASE_ORDER = ["intro", "early", "mid", "climax"];

      function normalizePhase(value) {
        const phase = String(value || "").trim().toLowerCase();
        return PHASE_ORDER.includes(phase) ? phase : "intro";
      }

      function nextPhase(value) {
        const phase = normalizePhase(value);
        const idx = PHASE_ORDER.indexOf(phase);
        return PHASE_ORDER[Math.min(idx + 1, PHASE_ORDER.length - 1)] || "climax";
      }

      function getThreadPhase(binding, fallbackPhase) {
        return normalizePhase(
          binding?.conflict_phase ||
          binding?.people_phase ||
          binding?.story_phase ||
          binding?.event_phase ||
          fallbackPhase
        );
      }

      function uniqueStrings(values) {
        return [...new Set((Array.isArray(values) ? values : []).map((v) => String(v || "").trim()).filter(Boolean))];
      }

      const originalResetForNewJob = proto.resetForNewJob;
      proto.resetForNewJob = function (role_key) {
        const res = originalResetForNewJob.call(this, role_key);
        const state = this.getState?.() || {};
        const current = state.mail_system && typeof state.mail_system === "object"
          ? state.mail_system
          : null;

        if (!current) {
          this.setState({
            mail_system: {
              role_plan_id: null,
              step_index: 0,
              current_cycle: 1,
              last_mail_type: null,
              active_conflict_id: null,
              active_conflict_phase: "intro",
              active_people_threads: [],
              people_thread_phases: {},
              active_story_threads: [],
              story_thread_phases: {},
              active_event_queue: [],
              active_event_thread_id: null,
              active_event_phase: null,
              consumed_mail_ids: [],
              consumed_families: [],
              cooldowns: {},
              history: []
            }
          });
        }
        return res;
      };

      proto.loadJsonCached = async function (cacheKey, relPath) {
        if (!relPath) return null;
        const key = `${cacheKey}:${relPath}`;
        if (this.packsCache.has(key)) return this.packsCache.get(key);

        const url = `${this.packBasePath}/${relPath}`;
        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) return null;

        const json = await res.json();
        this.packsCache.set(key, json);
        return json;
      };

      proto.getMailPlanPath = function (active) {
        const category = String(active?.career_id || "").trim();
        const title = String(active?.title || "")
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-z0-9]+/g, "_")
          .replace(/^_+|_+$/g, "")
          .slice(0, 64);
        if (!category || !title) return null;
        return `mailPlans/${category}/${title}_plan.json`;
      };

      proto.getMailFamilyPaths = function (active) {
        const category = String(active?.career_id || "").trim();
        const title = String(active?.title || "")
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-z0-9]+/g, "_")
          .replace(/^_+|_+$/g, "")
          .slice(0, 64);
        if (!category || !title) return [];

        return [
          `mailFamilies/${category}/job/${title}_job.json`,
          `mailFamilies/${category}/conflict/${title}_conflict.json`,
          `mailFamilies/${category}/people/${title}_people.json`,
          `mailFamilies/${category}/story/${title}_story.json`,
          `mailFamilies/${category}/event/${title}_event.json`
        ];
      };

      proto.loadMailPlan = async function (active) {
        const relPath = this.getMailPlanPath(active);
        return await this.loadJsonCached("mailPlan", relPath);
      };

      proto.loadMailFamilyCatalogs = async function (active) {
        const paths = this.getMailFamilyPaths(active);
        const out = [];
        for (const relPath of paths) {
          const json = await this.loadJsonCached("mailFamily", relPath);
          if (json) out.push(json);
        }
        return out;
      };

      proto.flattenMailFamilyCatalogs = function (catalogs) {
        const mails = [];
        for (const catalog of (Array.isArray(catalogs) ? catalogs : [])) {
          const catalogType = String(catalog?.mail_type || "").trim() || null;
          const families = Array.isArray(catalog?.families) ? catalog.families : [];
          for (const family of families) {
            const familyId = String(family?.id || "").trim() || null;
            const familyBinding =
              family?.thread_binding && typeof family.thread_binding === "object"
                ? family.thread_binding
                : {};
            const familyMails = Array.isArray(family?.mails) ? family.mails : [];
            for (const m of familyMails) {
              mails.push({
                ...m,
                source_type: m?.source_type || "family",
                mail_type: m?.mail_type || catalogType || "job",
                mail_family: m?.mail_family || familyId,
                thread_binding: {
                  ...familyBinding,
                  ...(m?.thread_binding && typeof m.thread_binding === "object" ? m.thread_binding : {})
                }
              });
            }
          }
        }
        return mails;
      };

      proto.ensureMailSystemState = async function (active) {
        const state = this.getState();
        const current =
          state?.mail_system && typeof state.mail_system === "object"
            ? state.mail_system
            : null;

        const rolePlan = await this.loadMailPlan(active);
        const rolePlanId = String(rolePlan?.id || "").trim() || null;
        const activeConflictId = String(state?.conflict_state?.active_conflicts?.[0] || "").trim() || null;

        if (current && current.role_plan_id === rolePlanId) {
          if (!current.active_conflict_id && activeConflictId) {
            const next = { ...current, active_conflict_id: activeConflictId };
            this.setState({ mail_system: next });
            return next;
          }
          return current;
        }

        const next = {
          role_plan_id: rolePlanId,
          step_index: 0,
          current_cycle: 1,
          last_mail_type: null,
          active_conflict_id: activeConflictId,
          active_conflict_phase: "intro",
          active_people_threads: [],
          people_thread_phases: {},
          active_story_threads: [],
          story_thread_phases: {},
          active_event_queue: [],
          active_event_thread_id: null,
          active_event_phase: null,
          consumed_mail_ids: [],
          consumed_families: [],
          cooldowns: {},
          history: []
        };

        this.setState({ mail_system: next });
        return next;
      };

      proto.getCurrentPlanStep = function (plan, state) {
        const sequence = Array.isArray(plan?.sequence) ? plan.sequence : [];
        const stepIndex = Number(state?.mail_system?.step_index || 0);
        if (!sequence.length) return { stepIndex: 0, step: null };
        return {
          stepIndex,
          step: sequence[stepIndex % sequence.length] || null
        };
      };

      proto.filterPoolByMailType = function (pack, mailType) {
        const wanted = String(mailType || "").trim();
        if (!wanted || !Array.isArray(pack?.mails)) return pack;
        return {
          ...pack,
          mails: pack.mails.filter((m) => String(m?.mail_type || "").trim() === wanted)
        };
      };

      proto.filterPoolByFamilies = function (pack, allowedFamilies) {
        const wanted = new Set(
          (Array.isArray(allowedFamilies) ? allowedFamilies : [])
            .map((v) => String(v || "").trim())
            .filter(Boolean)
        );
        if (!wanted.size || !Array.isArray(pack?.mails)) return pack;
        return {
          ...pack,
          mails: pack.mails.filter((m) => wanted.has(String(m?.mail_family || "").trim()))
        };
      };

      proto.isMailAllowedByThreadState = function (mail, state) {
        const mailSystem = state?.mail_system && typeof state.mail_system === "object"
          ? state.mail_system
          : {};
        const binding = mail?.thread_binding && typeof mail.thread_binding === "object"
          ? mail.thread_binding
          : {};
        const phase = getThreadPhase(binding, mail?.phase);

        const conflictId = String(binding?.conflict_id || "").trim();
        if (conflictId) {
          const activeConflictId = String(mailSystem?.active_conflict_id || "").trim();
          const activeConflictPhase = normalizePhase(mailSystem?.active_conflict_phase || "intro");
          if (!activeConflictId) {
            return phase === "intro";
          }
          if (activeConflictId !== conflictId) {
            return phase === "intro";
          }
          return activeConflictPhase === phase;
        }

        const peopleThreadId = String(binding?.people_thread_id || "").trim();
        if (peopleThreadId) {
          const activeThreads = new Set(uniqueStrings(mailSystem?.active_people_threads));
          const threadPhases = mailSystem?.people_thread_phases && typeof mailSystem.people_thread_phases === "object"
            ? mailSystem.people_thread_phases
            : {};
          const currentPhase = normalizePhase(threadPhases[peopleThreadId] || "intro");
          if (!activeThreads.has(peopleThreadId)) {
            return phase === "intro" || phase === "early";
          }
          return currentPhase === phase;
        }

        const storyThreadId = String(binding?.story_thread_id || "").trim();
        if (storyThreadId) {
          const activeThreads = new Set(uniqueStrings(mailSystem?.active_story_threads));
          const threadPhases = mailSystem?.story_thread_phases && typeof mailSystem.story_thread_phases === "object"
            ? mailSystem.story_thread_phases
            : {};
          const currentPhase = normalizePhase(threadPhases[storyThreadId] || "intro");
          if (!activeThreads.has(storyThreadId)) {
            return phase === "intro" || phase === "mid";
          }
          return currentPhase === phase;
        }

        const eventThreadId = String(binding?.event_thread_id || "").trim();
        if (eventThreadId) {
          const activeEventThreadId = String(mailSystem?.active_event_thread_id || "").trim();
          const activeEventPhase = normalizePhase(mailSystem?.active_event_phase || "intro");
          if (!activeEventThreadId) {
            return phase === "climax" || phase === "intro";
          }
          if (activeEventThreadId !== eventThreadId) {
            return phase === "climax" || phase === "intro";
          }
          return activeEventPhase === phase;
        }

        return true;
      };

      proto.filterPoolByThreadState = function (pack, state) {
        if (!Array.isArray(pack?.mails)) return pack;
        return {
          ...pack,
          mails: pack.mails.filter((mail) => this.isMailAllowedByThreadState(mail, state))
        };
      };

      proto.selectPackByPlan = function (pack, state, active, plan) {
        const { step } = this.getCurrentPlanStep(plan, state);
        if (!step) return { plannedType: null, plannedStep: null, pack };

        const firstTypePack = this.filterPoolByMailType(pack, step.type);
        const firstThreadPack = this.filterPoolByThreadState(firstTypePack, state);
        const firstFamilyPack = this.filterPoolByFamilies(firstThreadPack, step.allowed_families);

        if (Array.isArray(firstFamilyPack?.mails) && firstFamilyPack.mails.length) {
          return { plannedType: step.type, plannedStep: step, pack: firstFamilyPack };
        }

        const fallbackTypes = Array.isArray(step?.fallback_types) ? step.fallback_types : [];
        for (const fallbackType of fallbackTypes) {
          const fallbackPack = this.filterPoolByThreadState(
            this.filterPoolByMailType(pack, fallbackType),
            state
          );
          if (Array.isArray(fallbackPack?.mails) && fallbackPack.mails.length) {
            return { plannedType: fallbackType, plannedStep: step, pack: fallbackPack };
          }
        }

        return { plannedType: step.type, plannedStep: step, pack: this.filterPoolByThreadState(pack, state) };
      };

      const originalBuildMailPool = proto.buildMailPool;
      proto.buildMailPool = async function (active, state, role_key) {
        const pack = await originalBuildMailPool.call(this, active, state, role_key);
        const catalogs = await this.loadMailFamilyCatalogs(active);
        const familyMails = this.flattenMailFamilyCatalogs(catalogs);

        return {
          ...pack,
          mails: [
            ...(Array.isArray(pack?.mails) ? pack.mails : []),
            ...familyMails
          ]
        };
      };

      const originalRegisterChosenMail = proto.registerChosenMail;
      proto.registerChosenMail = function (eventObj, active = null) {
        const res = originalRegisterChosenMail.call(this, eventObj, active);
        const state = this.getState();
        const currentMailSystem =
          state?.mail_system && typeof state.mail_system === "object"
            ? state.mail_system
            : {
                role_plan_id: null,
                step_index: 0,
                current_cycle: 1,
                last_mail_type: null,
                active_conflict_id: null,
                active_conflict_phase: "intro",
                active_people_threads: [],
                people_thread_phases: {},
                active_story_threads: [],
                story_thread_phases: {},
                active_event_queue: [],
                active_event_thread_id: null,
                active_event_phase: null,
                consumed_mail_ids: [],
                consumed_families: [],
                cooldowns: {},
                history: []
              };

        const mailType = String(eventObj?.mail_type || "").trim() || null;
        const mailFamily = String(eventObj?.mail_family || "").trim() || null;
        const binding = eventObj?.thread_binding && typeof eventObj.thread_binding === "object"
          ? eventObj.thread_binding
          : {};
        const phase = getThreadPhase(binding, eventObj?.phase);

        const consumedMailIds = Array.isArray(currentMailSystem.consumed_mail_ids)
          ? currentMailSystem.consumed_mail_ids.slice()
          : [];
        const consumedFamilies = Array.isArray(currentMailSystem.consumed_families)
          ? currentMailSystem.consumed_families.slice()
          : [];
        const history = Array.isArray(currentMailSystem.history)
          ? currentMailSystem.history.slice()
          : [];

        if (eventObj?.id && !consumedMailIds.includes(eventObj.id)) {
          consumedMailIds.push(eventObj.id);
        }
        if (mailFamily && !consumedFamilies.includes(mailFamily)) {
          consumedFamilies.push(mailFamily);
        }

        const nextPeopleThreads = uniqueStrings(currentMailSystem.active_people_threads);
        const nextPeoplePhases = {
          ...(currentMailSystem.people_thread_phases && typeof currentMailSystem.people_thread_phases === "object"
            ? currentMailSystem.people_thread_phases
            : {})
        };
        const nextStoryThreads = uniqueStrings(currentMailSystem.active_story_threads);
        const nextStoryPhases = {
          ...(currentMailSystem.story_thread_phases && typeof currentMailSystem.story_thread_phases === "object"
            ? currentMailSystem.story_thread_phases
            : {})
        };

        const nextMailSystem = {
          ...currentMailSystem,
          step_index: Number(currentMailSystem.step_index || 0) + 1,
          last_mail_type: mailType,
          consumed_mail_ids: consumedMailIds,
          consumed_families: consumedFamilies,
          history: history.slice(-50)
        };

        const conflictId = String(binding?.conflict_id || "").trim();
        if (conflictId) {
          nextMailSystem.active_conflict_id = conflictId;
          nextMailSystem.active_conflict_phase = nextPhase(phase);
        }

        const peopleThreadId = String(binding?.people_thread_id || "").trim();
        if (peopleThreadId) {
          if (!nextPeopleThreads.includes(peopleThreadId)) {
            nextPeopleThreads.push(peopleThreadId);
          }
          nextPeoplePhases[peopleThreadId] = nextPhase(phase);
          nextMailSystem.active_people_threads = nextPeopleThreads;
          nextMailSystem.people_thread_phases = nextPeoplePhases;
        }

        const storyThreadId = String(binding?.story_thread_id || "").trim();
        if (storyThreadId) {
          if (!nextStoryThreads.includes(storyThreadId)) {
            nextStoryThreads.push(storyThreadId);
          }
          nextStoryPhases[storyThreadId] = nextPhase(phase);
          nextMailSystem.active_story_threads = nextStoryThreads;
          nextMailSystem.story_thread_phases = nextStoryPhases;
        }

        const eventThreadId = String(binding?.event_thread_id || "").trim();
        if (eventThreadId) {
          nextMailSystem.active_event_thread_id = eventThreadId;
          nextMailSystem.active_event_phase = nextPhase(phase);
        }

        nextMailSystem.history = [
          ...history,
          {
            id: String(eventObj?.id || "").trim() || null,
            mail_type: mailType,
            mail_family: mailFamily,
            source_type: String(eventObj?.source_type || "").trim() || null,
            conflict_id: conflictId || null,
            people_thread_id: peopleThreadId || null,
            story_thread_id: storyThreadId || null,
            event_thread_id: eventThreadId || null,
            phase,
            at: new Date().toISOString()
          }
        ].slice(-50);

        this.setState({ mail_system: nextMailSystem });

        return res;
      };

      const originalOnAppOpen = proto.onAppOpen;
      proto.onAppOpen = async function (opts = {}) {
        const active = window.CivicationState?.getActivePosition?.() || null;
        if (active) {
          await this.ensureConflictState(active);
          await this.ensureMailSystemState(active);
          const rolePlan = await this.loadMailPlan(active);

          const originalBuild = this.buildMailPool.bind(this);
          const originalPick = this.pickEventFromPack.bind(this);

          this.buildMailPool = async (activeArg, stateArg, roleKeyArg) => {
            const pack = await originalBuild(activeArg, stateArg, roleKeyArg);
            const planned = this.selectPackByPlan(pack, this.getState(), activeArg, rolePlan);
            pack.__planned = planned;
            return pack;
          };

          this.pickEventFromPack = (pack, stateArg) => {
            const plannedPack = pack?.__planned?.pack || pack;
            return originalPick(plannedPack, stateArg);
          };

          try {
            return await originalOnAppOpen.call(this, opts);
          } finally {
            this.buildMailPool = originalBuild;
            this.pickEventFromPack = originalPick;
          }
        }

        return await originalOnAppOpen.call(this, opts);
      };

      const originalFollowup = proto.enqueueImmediateFollowupEvent;
      proto.enqueueImmediateFollowupEvent = async function () {
        const active = window.CivicationState?.getActivePosition?.() || null;
        if (active) {
          await this.ensureConflictState(active);
          await this.ensureMailSystemState(active);
          const rolePlan = await this.loadMailPlan(active);

          const originalBuild = this.buildMailPool.bind(this);
          const originalPick = this.pickEventFromPack.bind(this);

          this.buildMailPool = async (activeArg, stateArg, roleKeyArg) => {
            const pack = await originalBuild(activeArg, stateArg, roleKeyArg);
            const planned = this.selectPackByPlan(pack, this.getState(), activeArg, rolePlan);
            pack.__planned = planned;
            return pack;
          };

          this.pickEventFromPack = (pack, stateArg) => {
            const plannedPack = pack?.__planned?.pack || pack;
            return originalPick(plannedPack, stateArg);
          };

          try {
            return await originalFollowup.call(this);
          } finally {
            this.buildMailPool = originalBuild;
            this.pickEventFromPack = originalPick;
          }
        }

        return await originalFollowup.call(this);
      };

      proto.__mailPlanRuntimePatched = true;
      return true;
    }
  }

  window.CivicationMailPlanPatchRuntime = CivicationMailPlanPatchRuntime;
  CivicationMailPlanPatchRuntime.apply();
})();
