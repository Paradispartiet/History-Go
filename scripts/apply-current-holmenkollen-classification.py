import json
from pathlib import Path

path = Path(__file__).resolve().parents[1] / "data/places/religion_candidate_review.json"
data = json.loads(path.read_text(encoding="utf-8"))
next_data = [row for row in data if row.get("id") != "holmenkollen_kapell"]
path.write_text(json.dumps(next_data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print("Holmenkollen kapell uses the current explicit Religion override; stale review removed")
