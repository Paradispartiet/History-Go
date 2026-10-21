#!/usr/bin/env node
const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..");
const repoFile = file => fs.readFileSync(path.join(root, file), "utf8");

function element() {
  const el = {
    children: [],
    dataset: {},
    attributes: {},
    style: {},
    className: "",
    textContent: "",
    classes: new Set(),
    setAttribute(k, v) { this.attributes[k] = v; },
    appendChild(c) { this.children.push(c); },
    replaceChildren(...children) { this.children = children; },
  };
  el.classList = { add(name) { el.classes.add(name); } };
  return el;
}
const panel = element();
const summary = element();
let state = {};
global.window = global;
global.CivicationState = {
  getState: () => state,
  setState(patch) { state = { ...state, ...patch }; return state; }
};
global.document = {
  createElement: element,
  getElementById: id => id === "civiSkillsPanel" ? panel : id === "civiSkillsSummary" ? summary : null
};

vm.runInThisContext(repoFile("js/Civication/systems/civicationSkills.js"));
const skills = global.CivicationSkills;
assert(skills.render(), "Skills render with no prior state");
assert.strictEqual(panel.children.length, 6);
assert.strictEqual(summary.textContent, "0 av 6 Skills med dokumentert praksis");

const unknown = panel.children[0];
assert.strictEqual(unknown.children[0].children[1].textContent, "Ikke målt");
assert.strictEqual(unknown.children[1].attributes.role, "img", "unknown Skills are not numeric progress bars");
assert.strictEqual(unknown.children[1].children[0].style.width, "0%");
assert.strictEqual(unknown.classes.has("is-unmeasured"), true);

const applied = skills.applyPractice({
  source: "canonical_scene_choice",
  event_id: "ui-probe:1",
  choice_id: "explain",
  skill_id: "communication",
  activity_type: "explained_a_decision",
  delta: 3
});
assert.strictEqual(applied.applied, true);
assert.strictEqual(summary.textContent, "1 av 6 Skills med dokumentert praksis");
const communication = panel.children.find(e => e.dataset.skillId === "communication");
assert(communication, "communication Skill is present");
assert.strictEqual(communication.children[0].children[1].textContent, "3 / 100");
assert.strictEqual(communication.children[1].attributes.role, "progressbar");
assert.strictEqual(communication.children[1].attributes["aria-valuenow"], "3");
assert.strictEqual(communication.children[1].children[0].style.width, "3%");
assert.strictEqual(panel.children.find(e => e.dataset.skillId === "wisdom_judgement").children[1].attributes.role, "img");
assert.strictEqual(skills.render(), true, "refresh remains idempotent");

const html = repoFile("Civication.html");
const css = repoFile("css/civi-skills.css");
const mini = repoFile("js/Civication/ui/CivicationMiniSectionsUI.js");
const loader = repoFile("js/Civication/civicationShellLoader.js");
assert(html.includes('href="css/civi-skills.css"'), "graphical style loaded");
assert(html.includes('id="civiSkillsPanel"'), "panel exists");
assert(mini.includes('civiSkillsSection: {'), "Skills are navigable under Personal");
assert(html.includes('src="js/Civication/systems/civicationSkills.js"'), "Skills loads before Life Story UI");
assert(loader.includes("civicationSkillsPracticeBridge.js"), "Skills practice bridge loads");
assert(css.includes("@media (max-width: 560px)"), "mobile layout supplied");
assert(css.includes("prefers-reduced-motion"), "reduced motion supported");
console.log("civication graphical Skills panel ok");
