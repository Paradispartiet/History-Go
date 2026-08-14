#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const BRIDGE_PATH = 'data/Civication/careerKnowledgeBridge.json';
const KNOWLEDGE_REQUIREMENTS_PATH = 'data/Civication/jobKnowledgeRequirements.json';

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, file), 'utf8'));
}

function exists(file) {
  return Boolean(file) && fs.existsSync(path.join(ROOT, file));
}

function list(value) {
  return Array.isArray(value) ? value : [];
}

function object(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
}

function text(value) {
  return String(value == null ? '' : value).trim();
}

function assert(condition, message, errors) {
  if (!condition) errors.push(message);
}

function walkJson(dir) {
  const absolute = path.join(ROOT, dir);
  if (!fs.existsSync(absolute)) return [];
  return fs.readdirSync(absolute, { withFileTypes: true }).flatMap((entry) => {
    const relative = path.posix.join(dir, entry.name);
    return entry.isDirectory() ? walkJson(relative) : (/\.json$/.test(entry.name) ? [relative] : []);
  });
}

function maxDate(values) {
  return list(values).map(text).filter(Boolean).sort().at(-1) || '';
}

export function auditCareerKnowledgeBridge() {
  const errors = [];
  const warnings = [];
  assert(exists(BRIDGE_PATH), `Mangler ${BRIDGE_PATH}`, errors);
  if (errors.length) return { errors, warnings, summary: {} };

  const bridge = readJson(BRIDGE_PATH);
  assert(bridge.schema === 'civication_career_knowledge_bridge_v1', 'Feil bridge-schema', errors);
  assert(Number(bridge.version) === 1, 'Career Knowledge Bridge må være v1', errors);
  assert(bridge?.principles?.content_strategy === 'pinned_gameplay_contract_with_live_fagverk_enrichment', 'Broen må skille spikret gameplay fra levende fagverksfordypning', errors);
  assert(bridge?.principles?.copied_fagverk_prose_allowed === false, 'Fagverkprosa kan ikke kopieres inn i broen', errors);
  assert(bridge?.principles?.knowledge_is_authority === false, 'Kunnskap kan ikke gi myndighet', errors);
  assert(bridge?.principles?.knowledge_is_appointment === false, 'Kunnskap kan ikke gi utnevnelse', errors);
  assert(bridge?.compatibility?.gameplay_review, 'Mangler gameplay-review-policy', errors);

  const roles = object(bridge.roles);
  const sources = object(bridge.source_registry);
  const globalRefIds = new Set();
  const roleRefs = new Map();
  let topicRefCount = 0;
  let methodRefCount = 0;

  for (const [roleKey, config] of Object.entries(roles)) {
    const expectedKey = `${text(config.category)}/${text(config.role_scope)}`;
    assert(roleKey === expectedKey, `${roleKey}: nøkkel matcher ikke category/role_scope`, errors);
    assert(config.status === 'reference_pilot' || config.status === 'active', `${roleKey}: ugyldig status`, errors);
    assert(exists(config.role_model), `${roleKey}: mangler roleModel ${config.role_model}`, errors);
    assert(exists(config.work_grammar), `${roleKey}: mangler FWG ${config.work_grammar}`, errors);
    assert(config.knowledge_mode === 'soft_support', `${roleKey}: første broversjon skal være soft_support`, errors);
    assert(config?.gameplay_contract_policy?.required === true, `${roleKey}: knowledge_contract må være obligatorisk`, errors);

    const source = sources[text(config.subject_id)];
    assert(source, `${roleKey}: mangler source_registry for ${config.subject_id}`, errors);
    if (!source) continue;
    for (const file of ['completion_file', 'readiness_file', 'methods_file', 'emners_file']) {
      assert(exists(source[file]), `${roleKey}: mangler canonical kilde ${source[file]}`, errors);
    }

    const completion = exists(source.completion_file) ? readJson(source.completion_file) : {};
    assert(completion.status === 'complete' && completion.complete_ready === true, `${roleKey}: Fagverket er ikke complete_ready`, errors);
    assert(Number(completion.observed_quality_score || 0) >= 27, `${roleKey}: Fagverkets kvalitetsscore er under 27`, errors);

    const methodsDoc = exists(source.methods_file) ? readJson(source.methods_file) : {};
    const methods = new Map(list(methodsDoc.methods).map((method) => [text(method.method_id), method]));
    const refs = list(config.knowledge_refs);
    const byId = new Map();
    for (const ref of refs) {
      const refId = text(ref.ref_id);
      assert(refId, `${roleKey}: kunnskapsreferanse mangler ref_id`, errors);
      assert(!globalRefIds.has(refId), `${roleKey}: duplikat ref_id ${refId}`, errors);
      globalRefIds.add(refId);
      byId.set(refId, ref);
      assert(['required', 'recommended', 'deepening'].includes(text(ref.level)), `${refId}: ugyldig level`, errors);
      assert(list(ref.applications).length > 0, `${refId}: mangler jobbanvendelser`, errors);
      assert(list(ref.quality_impacts).length > 0, `${refId}: mangler quality_impacts`, errors);
      assert(list(ref.knowledge_signal_emne_ids).length > 0, `${refId}: mangler Knowledge-signaler`, errors);

      if (ref.kind === 'topic') {
        topicRefCount += 1;
        assert(exists(ref.article_file), `${refId}: død artikkelreferanse ${ref.article_file}`, errors);
        if (!exists(ref.article_file)) continue;
        const article = readJson(ref.article_file);
        assert(article.topic_id === ref.topic_id, `${refId}: topic_id matcher ikke artikkelen`, errors);
        assert(article.area_id === ref.area_id, `${refId}: area_id matcher ikke artikkelen`, errors);
        assert(article.subject_id === config.subject_id, `${refId}: subject_id matcher ikke rollen`, errors);
        assert(article.article_status === 'complete', `${refId}: artikkelen er ikke complete`, errors);
        assert(Number(article?.quality_review?.total || 0) >= 27, `${refId}: artikkelkvalitet under 27`, errors);
        assert(list(article.claim_ids).length > 0, `${refId}: artikkelen mangler claims`, errors);
        assert(list(article.source_ids).length > 0, `${refId}: artikkelen mangler kilder`, errors);
      } else if (ref.kind === 'method') {
        methodRefCount += 1;
        const method = methods.get(text(ref.method_id));
        assert(method, `${refId}: ukjent method_id ${ref.method_id}`, errors);
        if (method) assert(method.university_matrix_status === 'materialized', `${refId}: universitetsmetoden er ikke materialized`, errors);
      } else {
        assert(false, `${refId}: ukjent referansetype ${ref.kind}`, errors);
      }
    }
    roleRefs.set(roleKey, byId);
  }

  const mailFiles = walkJson('data/Civication/mailFamilies');
  let knowledgeMailCount = 0;
  let lockedContractCount = 0;
  for (const file of mailFiles) {
    const catalog = readJson(file);
    for (const family of list(catalog.families)) {
      for (const mail of list(family.mails)) {
        const refs = list(mail.knowledge_refs);
        if (!refs.length) continue;
        knowledgeMailCount += 1;
        const roleKey = `${text(catalog.category)}/${text(mail.role_scope || catalog.role_scope)}`;
        const known = roleRefs.get(roleKey);
        if (!known) continue;
        const contract = object(mail.knowledge_contract);
        const requiredFields = ['contract_id', 'learning_goal', 'decision_rule', 'common_error', 'help_path', 'choice_effect_contract', 'update_policy'];
        assert(Number(contract.version) >= 1, `${mail.id}: knowledge_contract mangler versjon`, errors);
        for (const field of requiredFields) assert(text(contract[field]), `${mail.id}: knowledge_contract mangler ${field}`, errors);
        assert(contract.update_policy === 'manual_review_and_version_bump', `${mail.id}: gameplay kan ikke oppdateres automatisk`, errors);
        assert(text(contract?.reviewed_against?.subject_id) === text(catalog.category), `${mail.id}: review subject_id er feil`, errors);
        assert(Number(contract?.reviewed_against?.quality_score || 0) >= 27, `${mail.id}: reviewet mot for svak fagverkstatus`, errors);
        lockedContractCount += 1;

        const articleDates = [];
        for (const request of refs) {
          const refId = text(typeof request === 'string' ? request : request.ref_id);
          const canonical = known.get(refId);
          assert(canonical, `${mail.id}: ukjent bridge-ref ${refId}`, errors);
          if (canonical?.kind === 'topic' && exists(canonical.article_file)) {
            articleDates.push(readJson(canonical.article_file).updated_at);
          }
        }
        const newestArticle = maxDate(articleDates);
        assert(!newestArticle || text(contract?.reviewed_against?.fagverk_updated_at) >= newestArticle, `${mail.id}: spikret kontrakt må reviewes mot oppdatert Fagverk (${newestArticle})`, errors);
        assert(list(mail.choices).length >= 2, `${mail.id}: trenger minst to valg`, errors);
        assert(list(mail.choices).some((choice) => /help/i.test(list(choice.tags).join(' '))), `${mail.id}: mangler legitimt hjelpespor`, errors);
      }
    }
  }

  const requirements = readJson(KNOWLEDGE_REQUIREMENTS_PATH);
  for (const [roleKey, config] of Object.entries(roles)) {
    const categoryConfig = object(requirements?.categories)[config.category];
    const roleConfig = object(requirements?.roles)[config.role_scope];
    assert(categoryConfig?.mode !== 'required', `${roleKey}: Career Knowledge kan ikke arve en hard kategorigate`, errors);
    assert(roleConfig?.mode !== 'required', `${roleKey}: Career Knowledge kan ikke arve en hard rollegate`, errors);
  }

  assert(knowledgeMailCount === lockedContractCount, 'Alle bridge-kunnskapsmailer må ha spikret kontrakt', errors);
  const fagverkHtml = fs.readFileSync(path.join(ROOT, 'fagverk.html'), 'utf8');
  assert(fagverkHtml.includes('id="fagverkCareerUses"'), 'Fagverket mangler synlig omvendt jobbkobling', errors);
  assert(fagverkHtml.includes('js/fagverk-career-uses.js'), 'Fagverket laster ikke career-uses-runtime', errors);
  assert(exists('js/fagverk-career-uses.js'), 'Mangler Fagverkets career-uses-runtime', errors);
  if (!Object.keys(roles).length) warnings.push('Ingen roller er registrert i broen');

  return {
    errors,
    warnings,
    summary: {
      roleCount: Object.keys(roles).length,
      topicRefCount,
      methodRefCount,
      knowledgeMailCount,
      lockedContractCount
    }
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const result = auditCareerKnowledgeBridge();
  for (const warning of result.warnings) console.warn(`Warning: ${warning}`);
  if (result.errors.length) {
    console.error('Career Knowledge Bridge audit failed:');
    for (const error of result.errors) console.error(`- ${error}`);
    process.exit(1);
  }
  const s = result.summary;
  console.log(`Career Knowledge Bridge audit passed: ${s.roleCount} role, ${s.topicRefCount} topics, ${s.methodRefCount} methods, ${s.lockedContractCount} pinned mail contracts.`);
}
