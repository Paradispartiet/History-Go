import test from "node:test";
import assert from "node:assert/strict";
import { phaseAllowsBinding } from "../scripts/audit-quiz-progression.mjs";

test("binding is rejected before its configured start phase and allowed from that point onward", () => {
  const phases = ["opening", "middle", "middle", "bridge", "bridge", "final"];
  assert.equal(phaseAllowsBinding(phases, 0, "bridge"), false);
  assert.equal(phaseAllowsBinding(phases, 2, "bridge"), false);
  assert.equal(phaseAllowsBinding(phases, 3, "bridge"), true);
  assert.equal(phaseAllowsBinding(phases, 4, "bridge"), true);
  assert.equal(phaseAllowsBinding(phases, 5, "bridge"), true);
  assert.equal(phaseAllowsBinding(phases, 5, "missing"), false);
});
