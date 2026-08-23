import json
from pathlib import Path

ROOT = Path.cwd()


def replace_once(path, old, new):
    p = ROOT / path
    text = p.read_text(encoding='utf-8')
    count = text.count(old)
    if count != 1:
        raise SystemExit(f'{path}: expected one needle, found {count}: {old[:120]!r}')
    p.write_text(text.replace(old, new, 1), encoding='utf-8')


# 1) Canonical scene schema: add strict per-choice History Go affordance.
schema_path = ROOT / 'data/Civication/sceneContractV1.schema.json'
schema = json.loads(schema_path.read_text(encoding='utf-8'))
choice_props = schema['$defs']['choice']['properties']
choice_props['affordance'] = {'$ref': '#/$defs/choiceAffordance'}
schema['$defs']['choiceAffordance'] = {
    'type': 'object',
    'additionalProperties': False,
    'required': ['history_go'],
    'properties': {
        'history_go': {'$ref': '#/$defs/historyGoChoiceAffordance'}
    }
}
schema['$defs']['historyGoChoiceAffordance'] = {
    'type': 'object',
    'additionalProperties': False,
    'required': ['task_mail_ids'],
    'properties': {
        'task_mail_ids': {
            'type': 'array',
            'items': {'$ref': '#/$defs/nonEmptyId'},
            'minItems': 1,
            'maxItems': 8,
            'uniqueItems': True
        },
        'require_task_completed': {'type': 'boolean', 'default': True},
        'require_history_go_correct': {'type': 'boolean', 'default': True},
        'min_effect': {'type': 'number'}
    }
}
schema_path.write_text(json.dumps(schema, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')


# 2) Scene compiler: normalize, preserve and validate affordances.
compiler = 'scripts/build-civication-scene-registry.mjs'
replace_once(
    compiler,
    'function normalizeCanonicalChoiceInputs(choices) {',
    '''function normalizeChoiceAffordance(value, label) {
  if (value == null) return null;
  const input = assertAllowedKeys(value, new Set(["history_go"]), label);
  if (!hasOwn(input, "history_go")) throw new Error(`${label}.history_go mangler`);
  const historyGo = assertAllowedKeys(
    input.history_go,
    new Set(["task_mail_ids", "require_task_completed", "require_history_go_correct", "min_effect"]),
    `${label}.history_go`
  );
  if (!hasOwn(historyGo, "task_mail_ids")) throw new Error(`${label}.history_go.task_mail_ids mangler`);
  const taskMailIds = strictUniqueStrings(
    historyGo.task_mail_ids,
    `${label}.history_go.task_mail_ids`,
    { ids: true, max: 8 }
  );
  if (!taskMailIds.length) throw new Error(`${label}.history_go.task_mail_ids må inneholde minst ett id`);
  const out = {
    history_go: {
      task_mail_ids: taskMailIds,
      require_task_completed: true,
      require_history_go_correct: true
    }
  };
  for (const key of ["require_task_completed", "require_history_go_correct"]) {
    if (!hasOwn(historyGo, key)) continue;
    if (typeof historyGo[key] !== "boolean") throw new Error(`${label}.history_go.${key} må være boolean`);
    out.history_go[key] = historyGo[key];
  }
  if (hasOwn(historyGo, "min_effect")) {
    const minEffect = Number(historyGo.min_effect);
    if (!Number.isFinite(minEffect)) throw new Error(`${label}.history_go.min_effect må være et endelig tall`);
    out.history_go.min_effect = minEffect;
  }
  return out;
}

function normalizeCanonicalChoiceInputs(choices) {'''
)
replace_once(
    compiler,
    '''    const feedback = norm(choice.feedback);
    if (feedback) out.feedback = feedback;
    const authorityAction = normalizeAuthorityAction(choice.authority_action, `${sourcePath} :: ${sceneId} choice[${index}].authority_action`);''',
    '''    const feedback = norm(choice.feedback);
    if (feedback) out.feedback = feedback;
    const affordance = normalizeChoiceAffordance(choice.affordance, `${sourcePath} :: ${sceneId} choice[${index}].affordance`);
    if (affordance) out.affordance = affordance;
    const authorityAction = normalizeAuthorityAction(choice.authority_action, `${sourcePath} :: ${sceneId} choice[${index}].authority_action`);'''
)
replace_once(
    compiler,
    '''    const normalizedOps = choices[index]?.effects?.work_object_ops;
    const normalizedAuthorityAction = choices[index]?.authority_action;
    if ((!Array.isArray(normalizedOps) || !normalizedOps.length) && !normalizedAuthorityAction) return choice;
    const out = { ...choice };
    if (normalizedAuthorityAction) out.authority_action = normalizedAuthorityAction;''',
    '''    const normalizedOps = choices[index]?.effects?.work_object_ops;
    const normalizedAuthorityAction = choices[index]?.authority_action;
    const normalizedAffordance = choices[index]?.affordance;
    if ((!Array.isArray(normalizedOps) || !normalizedOps.length) && !normalizedAuthorityAction && !normalizedAffordance) return choice;
    const out = { ...choice };
    if (normalizedAuthorityAction) out.authority_action = normalizedAuthorityAction;
    if (normalizedAffordance) out.affordance = normalizedAffordance;'''
)
replace_once(
    compiler,
    '''  if (interactionMode === "decision" && choices.length < 2) throw new Error(`${sourcePath} :: ${sceneId} decision mangler to reelle valg`);
  if (interactionMode === "task" && !taskContract) throw new Error(`${sourcePath} :: ${sceneId} task mangler gyldig task_contract`);''',
    '''  if (interactionMode === "decision" && choices.length < 2) throw new Error(`${sourcePath} :: ${sceneId} decision mangler to reelle valg`);
  if (interactionMode === "decision" && choices.some((choice) => choice.affordance)) {
    const baselineChoices = choices.filter((choice) => !choice.affordance);
    if (baselineChoices.length < 2) {
      throw new Error(`${sourcePath} :: ${sceneId} affordance-decision må beholde to ungated baseline-valg`);
    }
  }
  if (interactionMode === "task" && !taskContract) throw new Error(`${sourcePath} :: ${sceneId} task mangler gyldig task_contract`);'''
)
replace_once(
    compiler,
    'function assertRegistryEntry(entry) {',
    '''function validateChoiceAffordanceReferences(entries) {
  const byId = new Map(entries.map((entry) => [entry.id, entry]));
  for (const entry of entries) {
    for (const choice of Array.isArray(entry?.scene?.choices) ? entry.scene.choices : []) {
      const taskMailIds = choice?.affordance?.history_go?.task_mail_ids;
      if (!Array.isArray(taskMailIds)) continue;
      for (const taskMailId of taskMailIds) {
        const target = byId.get(taskMailId);
        if (!target) {
          throw new Error(`${entry.source_path} :: ${entry.id} choice ${choice.id} affordance peker på ukjent task mail ${taskMailId}`);
        }
        if (target.scene?.interaction_mode !== "task") {
          throw new Error(`${entry.source_path} :: ${entry.id} choice ${choice.id} affordance peker på ${taskMailId} som ikke er task-scene`);
        }
        if (target.scene?.task_contract?.completion_rule !== "history_go_payload_completed") {
          throw new Error(`${entry.source_path} :: ${entry.id} choice ${choice.id} affordance peker på ${taskMailId} uten History Go completion-kontrakt`);
        }
      }
    }
  }
}

function assertRegistryEntry(entry) {'''
)
replace_once(
    compiler,
    '''  // role_index is runtime-semantic: preserve source-rank, source-file and in-file mail order.
  // entries may still be canonically sorted for stable reviewable output after the index is captured.''',
    '''  validateChoiceAffordanceReferences(entries);

  // role_index is runtime-semantic: preserve source-rank, source-file and in-file mail order.
  // entries may still be canonically sorted for stable reviewable output after the index is captured.'''
)


# 3) EventEngine: dynamically project pending choices from canonical TaskEngine truth.
event_engine = 'js/Civication/core/civicationEventEngine.js'
replace_once(
    event_engine,
    '''  getPendingEvent() {
    /** @type {CiviEventEngineInboxItem[]} */
    const inbox = this.getInbox();
    if (!Array.isArray(inbox)) return null;

    return inbox.find(
      m => m && m.status === "pending"
    ) || null;
  }''',
    '''  getPendingEvent() {
    /** @type {CiviEventEngineInboxItem[]} */
    const inbox = this.getInbox();
    if (!Array.isArray(inbox)) return null;

    const pending = inbox.find(
      m => m && m.status === "pending"
    ) || null;
    if (!pending?.event || !Array.isArray(pending.event.choices)) return pending;
    if (!pending.event.choices.some((choice) => choice?.affordance != null)) return pending;

    const resolver = window.CivicationChoiceAffordance;
    if (resolver?.projectInboxItem) {
      try {
        return resolver.projectInboxItem(pending, {
          task_engine: window.CivicationTaskEngine
        });
      } catch (error) {
        console.warn("Choice affordance projection failed closed", error);
      }
    }

    // Gated choices are never exposed when the resolver is unavailable or fails.
    return {
      ...pending,
      event: {
        ...pending.event,
        choices: pending.event.choices.filter((choice) => choice?.affordance == null)
      }
    };
  }'''
)


# 4) Loader ownership: resolver is shell-level, immediately after TaskEngine.
loader = 'js/Civication/civicationShellLoader.js'
p = ROOT / loader
text = p.read_text(encoding='utf-8')
needle = '    "js/Civication/core/civicationTaskEngine.js",\n'
if text.count(needle) != 2:
    raise SystemExit(f'{loader}: expected two TaskEngine loader entries, found {text.count(needle)}')
text = text.replace(
    needle,
    needle + '    "js/Civication/core/civicationChoiceAffordance.js",\n'
)
p.write_text(text, encoding='utf-8')


# 5) Arkiv vertical proof: add one materially better learned choice to later persistent case.
consequence_path = ROOT / 'data/Civication/mailFamilies/historie/consequence/historie_arkiv_og_dokumentasjon_consequence.json'
consequence = json.loads(consequence_path.read_text(encoding='utf-8'))
mail = next(
    m
    for family in consequence.get('families', [])
    for m in family.get('mails', [])
    if m.get('id') == 'historie_arkiv_consequence_migrering_001'
)
if any(choice.get('id') == 'C' for choice in mail.get('choices', [])):
    raise SystemExit('Arkiv learned choice C already exists')
mail['choices'].append({
    'id': 'C',
    'label': 'Bruk History Go-øvelsen eksplisitt: skill verifisert teknisk proveniens, arkivmetadata og senere historisk fortolkning; migrer bare den verifiserte delen og merk det uløste autentisitetssporet',
    'reply': 'Jeg skiller hva integritetsloggen faktisk beviser fra hva vi bare kan tolke historisk. Den verifiserte delen migreres med fullt endringsspor; den uklare filen beholder begge kandidater og en eksplisitt usikkerhetsmarkør i stedet for en konstruert originalstatus.',
    'effect': 2,
    'affordance': {
        'history_go': {
            'task_mail_ids': ['historie_arkiv_knowledge_akershus_001'],
            'require_task_completed': True,
            'require_history_go_correct': True,
            'min_effect': 1
        }
    },
    'tags': [
        'learned_source_boundary',
        'technical_provenance',
        'metadata_separation',
        'authenticity_uncertainty'
    ],
    'feedback': 'Du bruker den lærte kildegrensen aktivt: teknisk evidens, arkivmetadata og senere fortolkning får separate statusnivåer, slik at migreringen blir både operativ og etterprøvbar.',
    'effects': {
        'stats': {
            'quality': 5,
            'trust': 4,
            'risk': -5,
            'energy': -2
        },
        'work_object_ops': [
            {
                'op': 'transition',
                'event_id': 'historie_arkiv_digital_001_lart_kildegrense',
                'work_object_id': 'historie_arkiv_sak_digital_bevaring_001',
                'to_status': 'partially_resolved',
                'to_phase': 'verifisert_migrering_med_eksplisitt_kildegrense',
                'note': 'Verifisert teknisk proveniens, arkivmetadata og senere fortolkning er skilt eksplisitt; den uløste autentisitetsusikkerheten er bevart.'
            },
            {
                'op': 'remove_flag',
                'event_id': 'historie_arkiv_digital_001_lart_to_avvik_redusert',
                'work_object_id': 'historie_arkiv_sak_digital_bevaring_001',
                'flag': 'to_hashavvik'
            },
            {
                'op': 'add_flag',
                'event_id': 'historie_arkiv_digital_001_lart_ett_ulost',
                'work_object_id': 'historie_arkiv_sak_digital_bevaring_001',
                'flag': 'ett_autentisitetsavvik_ulost'
            },
            {
                'op': 'add_flag',
                'event_id': 'historie_arkiv_digital_001_kildegrense_adskilt',
                'work_object_id': 'historie_arkiv_sak_digital_bevaring_001',
                'flag': 'kilde_metadata_fortolkning_adskilt'
            }
        ]
    }
})
consequence_path.write_text(json.dumps(consequence, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
