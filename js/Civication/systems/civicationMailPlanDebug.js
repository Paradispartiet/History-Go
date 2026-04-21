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

      for (let idx = 0; idx < sequence.length; idx += 1) {
        const baseState = clone(engine.getState?.() || {});
        baseState.mail_system = {
          ...(baseState.mail_system || {}),
          step_index: idx,
          role_plan_id: String(plan?.id || "").trim() || null
        };

        const selected = engine.selectPackByPlan(pack, baseState, role, plan);
        const mails = Array.isArray(selected?.pack?.mails) ? selected.pack.mails : [];
        const chosen = mails[0] || null;

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
          fallbackUsed: !!(selected?.plannedStep?.type && selected?.plannedType && selected.plannedStep.type !== selected.plannedType)
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
          directHits: results.filter((r) => !r.fallbackUsed).length
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

  window.CiviMailPlanDebug = {
    simulate,
    simulateArbeider() {
      return simulate("Arbeider");
    },
    simulateFagarbeider() {
      return simulate("Fagarbeider");
    },
    simulateMellomleder() {
      return simulate("Mellomleder");
    }
  };
})();
