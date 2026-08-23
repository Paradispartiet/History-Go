import subprocess
from pathlib import Path

PATH = Path('data/Civication/sceneContractV1.schema.json')
base = subprocess.run(
    ['git', 'show', 'origin/main:data/Civication/sceneContractV1.schema.json'],
    check=True,
    capture_output=True,
    text=True,
).stdout

old_choice = '''        "feedback": { "type": "string", "minLength": 1 },
        "authority_action": { "$ref": "#/$defs/authorityAction" },
        "effects": { "$ref": "#/$defs/effects" }
'''
new_choice = '''        "feedback": { "type": "string", "minLength": 1 },
        "authority_action": { "$ref": "#/$defs/authorityAction" },
        "affordance": { "$ref": "#/$defs/choiceAffordance" },
        "effects": { "$ref": "#/$defs/effects" }
'''
if base.count(old_choice) != 1:
    raise SystemExit(f'choice insertion needle count={base.count(old_choice)}')
base = base.replace(old_choice, new_choice, 1)

marker = '''    "authorityAction": {
'''
defs = '''    "choiceAffordance": {
      "type": "object",
      "additionalProperties": false,
      "required": ["history_go"],
      "properties": {
        "history_go": { "$ref": "#/$defs/historyGoChoiceAffordance" }
      }
    },
    "historyGoChoiceAffordance": {
      "type": "object",
      "additionalProperties": false,
      "required": ["task_mail_ids"],
      "properties": {
        "task_mail_ids": {
          "type": "array",
          "items": { "$ref": "#/$defs/nonEmptyId" },
          "minItems": 1,
          "maxItems": 8,
          "uniqueItems": true
        },
        "require_task_completed": { "type": "boolean", "default": true },
        "require_history_go_correct": { "type": "boolean", "default": true },
        "min_effect": { "type": "number" }
      }
    },
'''
if base.count(marker) != 1:
    raise SystemExit(f'defs insertion marker count={base.count(marker)}')
base = base.replace(marker, defs + marker, 1)
PATH.write_text(base, encoding='utf-8')
