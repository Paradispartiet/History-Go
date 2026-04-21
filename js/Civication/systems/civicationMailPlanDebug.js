(function () {
  function clone(obj) {
    return obj ? JSON.parse(JSON.stringify(obj)) : obj;
  }

  function normalizeRoleInput(role) {
    if (!role) return null;
    if (typeof role === "object") return role;

    const title = String(role || "").trim();
    if (!title) return null;

    const map = {
      Arbeider: {
        career_id: "naeringsliv",
        career_name: "Næringsliv & industri",
        title: "Arbeider",
        role_key: "arbeider",
        role_id: "naer_arbeider"
      },
      Fagarbeider: {
        career_id: "naeringsliv",
        career_name: "Næringsliv & industri",
        title: "Fagarbeider",
        role_key: "fagarbeider",
        role_id: "naer_fagarbeider"
      },
      Mellomleder: {
        career_id: "naeringsliv",
        career_name: "Næringsliv & industri",
        title: "Mellomleder",
        role_key: "mellomleder",
        role_id: "naer_mellomleder"
      }
    };

    return map[title] || null;
  }

  function summarizeMailSystem(mailSystem) {
    const ms = mailSystem && typeof mailSystem === "object" ? mailSystem : {};
    return {
      stepIndex: Number(ms.step_index || 0),
      activeConflictId: ms.active_conflict_id || null,
      activeConflictPhase: ms.active_conflict_phase || null,
      activePeopleThreads: Array.isArray(ms.active_people_threads)
        ? ms.active_people_threads.join(", ")
        : "",
      peopleThreadPhases: ms.people_thread_phases
        ? JSON.stringify(ms.people_thread_phases)
        : "{}",
      activeStoryThreads: Array.isArray(ms.active_story_threads)
        ? ms.active_story_threads.join(", ")
        : "",
      storyThreadPhases: ms.story_thread_phases
        ? JSON.stringify(ms.story_thread_phases)
        : "{}",
      activeEventThreadId: ms.active_event_thread_id || null,
      activeEventPhase: ms.active_event_phase || null,
      lastMailType: ms.last_mail_type || null
    };
  }

  async function simulate(roleInput) {
    const role = normalizeRoleInput(roleInput);
    if (!role) {
      throw new Error("Ukjent rolle. Bruk 'Arbeider', 'Fagarbeider' eller 'Mellomleder'.");
    }

    const engine = window.HG_CiviEngine;
    if (!engine) throw new Error("HG_CiviEngine finnes ikke.");
    if (typeof engine.loadMailPlan !== "function") {
      throw new Error("Mail plan debug krever at civicationMailPlanPatchRuntime er lastet.");
    }

    const previousRole = clone(window.CivicationState?.getActivePosition?.());
    const previousState = clone(engine.getState?.() || {});

    try {
      window.CivicationState?.setActivePosition?.(role);
      engine.packsCache?.clear?.();

      if (typeof engine.ensureRoleKeySynced === "function") {
        engine.ensureRoleKeySynced();
      }
      if (typeof engine.ensureConflictState === "function") {
        await engine.ensureConflictState(role);
      }
      await engine.ensureMailSystemState(role);

      const plan = await engine.loadMailPlan(role);
      const pack = await engine.buildMailPool(role, engine.getState(), role.role_key);
      const sequence = Array.isArray(plan?.sequence) ? plan.sequence : [];
      const results = [];
      let simState = clone(engine.getState?.() || {});

      for (let idx = 0; idx < sequence.length; idx += 1) {
        simState.mail_system = {
          ...(simState.mail_system || {}),
          step_index: idx,
          role_plan_id: String(plan?.id || "").trim() || null
        };

        const beforeMailSystem = summarizeMailSystem(simState.mail_system);
        const selected = engine.selectPackByPlan(pack, simState, role, plan);
        const mails = Array.isArray(selected?.pack?.mails) ? selected.pack.mails : [];
        const chosen = typeof engine.chooseMailFromPack === "function"
          ? engine.chooseMailFromPack(selected?.pack || { mails }, simState)
          : (mails[0] || null);

        let afterMailSystem = beforeMailSystem;
        if (chosen) {
          engine.setState(clone(simState));
          engine.registerChosenMail(chosen, role);
          simState = clone(engine.getState?.() || simState);
          afterMailSystem = summarizeMailSystem(simState.mail_system);
        }

        results.push({
          step: idx + 1,
          plannedType: selected?.plannedStep?.type || null,
          actualType: selected?.plannedType || null,
          allowedFamilies: Array.isArray(selected?.plannedStep?.allowed_families)
            ? selected.plannedStep.allowed_families.join(", ")
            : "",
          selectedCount: mails.length,
          selectedFamilies: [...new Set(mails.map((m) => String(m?.mail_family || "").trim()).filter(Boolean))].join(", "),
          chosenId: chosen?.id || null,
          chosenFamily: chosen?.mail_family || null,
          chosenSubject: chosen?.subject || null,
          fallbackUsed: !!(selected?.plannedStep?.type && selected?.plannedType && selected.plannedStep.type !== selected.plannedType),
          beforeConflict: `${beforeMailSystem.activeConflictId || "-"} (${beforeMailSystem.activeConflictPhase || "-"})`,
          afterConflict: `${afterMailSystem.activeConflictId || "-"} (${afterMailSystem.activeConflictPhase || "-"})`,
          beforePeople: beforeMailSystem.activePeopleThreads || "-",
          afterPeople: afterMailSystem.activePeopleThreads || "-",
          beforeStories: beforeMailSystem.activeStoryThreads || "-",
          afterStories: afterMailSystem.activeStoryThreads || "-",
          beforeEvent: `${beforeMailSystem.activeEventThreadId || "-"} (${beforeMailSystem.activeEventPhase || "-"})`,
          afterEvent: `${afterMailSystem.activeEventThreadId || "-"} (${afterMailSystem.activeEventPhase || "-"})`
        });
      }

      console.table(results);
      return {
        role,
        planId: plan?.id || null,
        steps: results,
        summary: {
          totalSteps: results.length,
          fallbackCount: results.filter((r) => r.fallbackUsed).length,
          directHits: results.filter((r) => !r.fallbackUsed).length,
          finalMailSystem: summarizeMailSystem(simState.mail_system)
        }
      };
    } finally {
      if (previousRole) {
        window.CivicationState?.setActivePosition?.(previousRole);
      }
      if (previousState && typeof engine.setState === "function") {
        engine.setState(previousState);
      }
    }
  }

  async function simulateRepeated(roleInput, runs = 5) {
    const role = normalizeRoleInput(roleInput);
    if (!role) {
      throw new Error("Ukjent rolle. Bruk 'Arbeider', 'Fagarbeider' eller 'Mellomleder'.");
    }

    const totalRuns = Math.max(1, Number(runs || 1));
    const runResults = [];
    const byStep = new Map();

    for (let i = 0; i < totalRuns; i += 1) {
      const result = await simulate(role);
      runResults.push(result);

      for (const step of (Array.isArray(result?.steps) ? result.steps : [])) {
        const stepKey = Number(step?.step || 0);
        if (!byStep.has(stepKey)) {
          byStep.set(stepKey, {
            step: stepKey,
            chosenIds: new Set(),
            chosenFamilies: new Set(),
            fallbackCount: 0,
            emptyCount: 0,
            selectedCounts: [],
            actualTypes: new Set()
          });
        }
        const slot = byStep.get(stepKey);
        if (step?.chosenId) slot.chosenIds.add(step.chosenId);
        if (step?.chosenFamily) slot.chosenFamilies.add(step.chosenFamily);
        if (step?.fallbackUsed) slot.fallbackCount += 1;
        if (!step?.chosenId) slot.emptyCount += 1;
        slot.selectedCounts.push(Number(step?.selectedCount || 0));
        if (step?.actualType) slot.actualTypes.add(step.actualType);
      }
    }

    const summaryRows = [...byStep.values()]
      .sort((a, b) => a.step - b.step)
      .map((slot) => {
        const avgSelectedCount = slot.selectedCounts.length
          ? Number((slot.selectedCounts.reduce((sum, n) => sum + n, 0) / slot.selectedCounts.length).toFixed(2))
          : 0;
        return {
          step: slot.step,
          uniqueChosenIds: slot.chosenIds.size,
          uniqueFamilies: slot.chosenFamilies.size,
          actualTypes: [...slot.actualTypes].join(", "),
          fallbackRuns: slot.fallbackCount,
          emptyRuns: slot.emptyCount,
          avgSelectedCount,
          chosenIds: [...slot.chosenIds].join(", "),
          families: [...slot.chosenFamilies].join(", ")
        };
      });

    const overview = {
      role: role.title,
      runs: totalRuns,
      totalFallbackRuns: summaryRows.reduce((sum, row) => sum + row.fallbackRuns, 0),
      totalEmptyRuns: summaryRows.reduce((sum, row) => sum + row.emptyRuns, 0),
      stepsWithLowVariation: summaryRows.filter((row) => row.uniqueChosenIds <= 1).map((row) => row.step),
      stepsWithThinPools: summaryRows.filter((row) => row.avgSelectedCount <= 1).map((row) => row.step)
    };

    console.table(summaryRows);
    console.log("CiviMailPlanDebug repeated summary", overview);

    return {
      overview,
      summaryRows,
      runs: runResults
    };
  }

  async function simulateRepeatedAll(runs = 5) {
    const roles = ["Arbeider", "Fagarbeider", "Mellomleder"];
    const out = [];
    for (const role of roles) {
      out.push(await simulateRepeated(role, runs));
    }
    return out;
  }

  window.CiviMailPlanDebug = {
    simulate,
    simulateRepeated,
    simulateRepeatedAll,
    simulateArbeider() {
      return simulate("Arbeider");
    },
    simulateFagarbeider() {
      return simulate("Fagarbeider");
    },
    simulateMellomleder() {
      return simulate("Mellomleder");
    },
    simulateArbeiderRepeated(runs = 5) {
      return simulateRepeated("Arbeider", runs);
    },
    simulateFagarbeiderRepeated(runs = 5) {
      return simulateRepeated("Fagarbeider", runs);
    },
    simulateMellomlederRepeated(runs = 5) {
      return simulateRepeated("Mellomleder", runs);
    }
  };
})();
