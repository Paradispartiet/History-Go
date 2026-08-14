#!/usr/bin/env node
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { execFileSync } = require('node:child_process');

const ROOT = path.resolve(__dirname, '..');
const runtimePath = 'js/Civication/systems/civicationCareerKnowledgeBridge.js';
const mailPath = 'data/Civication/mailFamilies/religion/knowledge/religion_forskning_knowledge.json';

function json(file) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, file), 'utf8'));
}

function storage(seed = {}) {
  const values = new Map(Object.entries(seed).map(([key, value]) => [key, JSON.stringify(value)]));
  return {
    getItem(key) { return values.has(key) ? values.get(key) : null; },
    setItem(key, value) { values.set(key, String(value)); },
    removeItem(key) { values.delete(key); }
  };
}

function makeRuntime(overrides = new Map()) {
  const sandbox = {
    console,
    localStorage: storage(),
    DEBUG: false,
    getCiviContacts: () => [],
    fetch: async (file) => {
      if (overrides.has(file)) {
        const value = overrides.get(file);
        return value == null
          ? { ok: false, async json() { return null; } }
          : { ok: true, async json() { return structuredClone(value); } };
      }
      const absolute = path.join(ROOT, String(file));
      if (!fs.existsSync(absolute)) return { ok: false, async json() { return null; } };
      return { ok: true, async json() { return json(String(file)); } };
    }
  };
  sandbox.window = sandbox;
  sandbox.globalThis = sandbox;
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(path.join(ROOT, runtimePath), 'utf8'), sandbox, { filename: runtimePath });
  return sandbox;
}

async function run() {
  execFileSync(process.execPath, ['scripts/audit-civication-career-knowledge-bridge.mjs'], {
    cwd: ROOT,
    stdio: 'pipe'
  });

  const sandbox = makeRuntime();
  const bridge = sandbox.CivicationCareerKnowledgeBridge;
  assert(bridge, 'runtime eksponerer Career Knowledge Bridge');

  const role = { category: 'religion', career_id: 'religion', role_scope: 'religion_forskning', title: 'Forsker' };
  const description = await bridge.buildJobDescription(role);
  assert.equal(description.schema, 'civication_generated_job_description_v1');
  assert.equal(description.role_key, 'religion/religion_forskning');
  assert.equal(description.title, 'Forsker');
  assert(description.sections.what_you_do.length >= 4, 'stillingsbeskrivelsen bruker roleModel-oppgaver');
  assert(description.sections.what_you_must_understand.length === 6, 'seks levende artikkelreferanser hydreres');
  assert(description.sections.methods_in_use.length === 4, 'fire canonicale metoder hydreres');
  assert(description.sections.authority.cannot.length >= 3, 'myndighetsgrenser følger rollen');
  assert.equal(description.safeguards.knowledge_grants_job, false);
  assert.equal(description.safeguards.knowledge_grants_authority, false);
  assert.equal(description.safeguards.knowledge_grants_promotion, false);
  assert(description.provenance.fagverk_files.every((file) => fs.existsSync(path.join(ROOT, file))), 'proveniens peker til reelle filer');

  const reverse = await bridge.getRolesForKnowledge({
    subject_id: 'religion',
    topic_id: 'research_ethics_reflexivity_and_positionality'
  });
  assert.deepEqual(JSON.parse(JSON.stringify(reverse.map((row) => row.role_key))), ['religion/religion_forskning']);

  const catalog = json(mailPath);
  const mail = catalog.families[0].mails[0];
  const decorated = await bridge.decorateMail({ ...mail, category: 'religion' });
  assert.equal(decorated.knowledge_bridge.gameplay_contract_id, mail.knowledge_contract.contract_id);
  assert.equal(decorated.knowledge_bridge.gameplay_contract_version, 1);
  assert.equal(decorated.knowledge_bridge.content_strategy, 'pinned_gameplay_contract_with_live_fagverk_enrichment');
  assert.equal(decorated.knowledge_refs_resolved.length, 2);
  assert(decorated.knowledge_refs_resolved.every((ref) => ref.resolved), 'mailreferansene hydreres');
  assert.deepEqual(decorated.choices, mail.choices, 'levende Fagverk omskriver aldri valg eller konsekvenser');

  const missing = bridge.evaluateKnowledgeRefsSync(decorated, { subject_id: 'religion', entries: [], merit_points: 0 });
  assert.equal(missing.knowledge_state, 'missing');
  assert.equal(missing.choice_policy, 'advisory');
  assert.equal(missing.authority_effect, 'none');

  const qualified = bridge.evaluateKnowledgeRefsSync(decorated, {
    subject_id: 'religion',
    entries: [{ subject_id: 'religion', emne_ids: ['em_religion_religion_og_samfunn'], concepts: [] }],
    merit_points: 0
  });
  assert.equal(qualified.knowledge_state, 'qualified');
  assert(qualified.matched_ref_ids.length >= 1, 'canonical Knowledge-signal treffer mailens fagproblem');

  vm.runInContext(fs.readFileSync(path.join(ROOT, 'js/Civication/systems/day/dayKnowledge.js'), 'utf8'), sandbox, {
    filename: 'js/Civication/systems/day/dayKnowledge.js'
  });
  const gatedTask = sandbox.applyKnowledgeGateToTask({}, decorated, { career_id: 'religion' });
  assert.equal(gatedTask.knowledge_source, 'career_knowledge_bridge');
  assert.equal(gatedTask.solution_mode, 'supported_risk');
  assert.equal(gatedTask.knowledge_choice_policy, 'advisory');
  assert.deepEqual(Array.from(gatedTask.locked_choices), [], 'manglende kunnskap hardblokkerer ikke et mailvalg');
  const gatedMail = sandbox.applyKnowledgeGateToMailEvent(decorated, gatedTask);
  assert.equal(gatedMail.choices.length, mail.choices.length, 'advisory kunnskap beholder hele valgrommet');

  const articlePath = 'data/fagverk/religion/emneartikler/religion_as_analytical_category.json';
  const improved = json(articlePath);
  improved.title = 'Religion som forbedret analytisk kategori';
  improved.definition = 'En forbedret og mer presis definisjon fra en senere Fagverk-revisjon.';
  const overrideRuntime = makeRuntime(new Map([[articlePath, improved]]));
  const improvedDescription = await overrideRuntime.CivicationCareerKnowledgeBridge.buildJobDescription(role);
  assert(improvedDescription.sections.what_you_must_understand.some((topic) => topic.title === improved.title), 'senere Fagverk-forbedring vises i fordypningen');
  const improvedMail = await overrideRuntime.CivicationCareerKnowledgeBridge.decorateMail({ ...mail, category: 'religion' });
  assert.equal(improvedMail.knowledge_contract.contract_id, mail.knowledge_contract.contract_id, 'spikret gameplaykontrakt består');
  assert.deepEqual(improvedMail.choices, mail.choices, 'senere fagtekst endrer ikke gameplay');

  const uiSandbox = {
    console,
    window: null,
    document: { getElementById: () => null, querySelectorAll: () => [], addEventListener: () => {} },
    setTimeout: (fn) => { if (typeof fn === 'function') fn(); }
  };
  uiSandbox.window = uiSandbox;
  uiSandbox.addEventListener = () => {};
  uiSandbox.dispatchEvent = () => {};
  vm.createContext(uiSandbox);
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'js/Civication/ui/CivicationUI.js'), 'utf8'), uiSandbox, {
    filename: 'js/Civication/ui/CivicationUI.js'
  });
  const html = uiSandbox.CivicationUI.buildCareerKnowledgeDescriptionHtml(description);
  assert.match(html, /Om stillingen og fagkunnskapen/);
  assert.match(html, /Dette må du forstå/);
  assert.match(html, /gjeldende Fagverk/);
  assert(!html.includes('undefined'));

  const fagverkHtml = fs.readFileSync(path.join(ROOT, 'fagverk.html'), 'utf8');
  assert.match(fagverkHtml, /id="fagverkCareerUses"/);
  assert.match(fagverkHtml, /css\/fagverk-career-uses\.css/);
  assert.match(fagverkHtml, /js\/fagverk-career-uses\.js/);
  const careerUsesSource = fs.readFileSync(path.join(ROOT, 'js/fagverk-career-uses.js'), 'utf8');
  assert.match(careerUsesSource, /getRolesForKnowledge/);
  assert.match(careerUsesSource, /buildJobDescription/);
  const careerUsesSandbox = {
    window: null,
    document: { readyState: 'loading', addEventListener: () => {} },
    console,
    URLSearchParams
  };
  careerUsesSandbox.window = careerUsesSandbox;
  vm.createContext(careerUsesSandbox);
  vm.runInContext(careerUsesSource, careerUsesSandbox, { filename: 'js/fagverk-career-uses.js' });
  const careerCard = careerUsesSandbox.HGFagverkCareerUses.renderCard({
    ...description,
    title: '<script>ikke kjør</script>',
    shared_work_world_title: '',
    summary: 'Forskning & formidling'
  });
  assert.match(careerCard, /&lt;script&gt;ikke kjør&lt;\/script&gt;/, 'Fagverkets jobbkort escaper dynamisk innhold');
  assert(!careerCard.includes('<script>'), 'jobbkortet injiserer ikke HTML fra innholdet');

  console.log('PASS: Career Knowledge Bridge v1 holder gameplay fast og Fagverket levende.');
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
