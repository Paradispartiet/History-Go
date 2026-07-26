from __future__ import annotations

import json
from pathlib import Path

relations_path = Path("data/relations.json")
relations = json.loads(relations_path.read_text(encoding="utf-8"))
matching = [
    relation for relation in relations
    if relation.get("person") == "haakon_vii" and relation.get("place") == "eidsvolls_plass"
]
if len(matching) != 1:
    raise SystemExit(f"Expected one Haakon VII–Eidsvolls plass relation, found {len(matching)}")
relation = matching[0]
if relation.get("source") or relation.get("why") != "Migrert fra people.placeId/people.places.":
    raise SystemExit("Haakon VII–Eidsvolls plass relation is no longer an unsupported migration and must be reviewed manually")
relations = [item for item in relations if item is not relation]
relations_path.write_text(json.dumps(relations, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

governance_path = Path("tests/oslo-politikk-remaining-people-expansion.test.js")
governance = governance_path.read_text(encoding="utf-8")
old = "  eidsvolls_plass: 13,"
new = "  eidsvolls_plass: 12,"
if governance.count(old) != 1:
    raise SystemExit("Expected one Eidsvolls plass minimum of 13")
governance_path.write_text(governance.replace(old, new, 1), encoding="utf-8")
