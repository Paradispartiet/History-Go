#!/usr/bin/env node
// Guardrail for Min dag / Life Story responsive CSS: choices must stay inside
// the scene card and stack below scene content in mini/iPad-width layouts.
const assert = require("assert");
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const civiCss = fs.readFileSync(path.join(ROOT, "css/civi.css"), "utf8");
const miniCss = fs.readFileSync(path.join(ROOT, "css/civi-mini.css"), "utf8");

function hasRule(css, selector, declarations) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\s+/g, "\\s*");
  const re = new RegExp(escaped + "\\s*\\{([\\s\\S]*?)\\}", "m");
  const match = css.match(re);
  assert.ok(match, `Missing CSS rule for ${selector}`);
  for (const declaration of declarations) {
    assert.ok(match[1].includes(declaration), `${selector} should include ${declaration}`);
  }
}

hasRule(civiCss, "#civiLifestoryPanel", [
  "min-width:0",
  "overflow-x:hidden"
]);

hasRule(civiCss, ".civi-lifestory-scene", [
  "display:flex",
  "flex-direction:column"
]);

hasRule(civiCss, ".civi-lifestory-choices", [
  "flex-direction:column",
  "width:100%",
  "min-width:0"
]);

hasRule(civiCss, ".civi-lifestory-choice", [
  "box-sizing:border-box",
  "max-width:100%",
  "white-space:normal",
  "overflow-wrap:anywhere"
]);

assert.ok(civiCss.includes("@media (max-width: 1100px)"), "Life Story should switch before iPad-width layouts become cramped");
assert.ok(civiCss.includes("grid-template-columns:repeat(2,minmax(0,1fr))"), "overview panels should use a 2-column intermediate layout");
assert.ok(civiCss.includes(".civi-lifestory-panels{ grid-template-columns:1fr; }"), "overview panels should stack on mobile");

assert.ok(
  miniCss.includes("body.civi-app.civi-mini-mode #civiLifestoryPanel .civi-lifestory-scene,") &&
  miniCss.includes("flex-direction: column") &&
  miniCss.includes("body.civi-app.civi-mini-mode #civiLifestoryPanel .civi-lifestory-choice") &&
  miniCss.includes("box-sizing: border-box"),
  "mini-mode must override its flex display reset so choices stack inside the scene card"
);

console.log("civication lifestory responsive layout css ok");
