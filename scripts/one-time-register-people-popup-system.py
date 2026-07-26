from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def write_json(path: Path, data: object) -> None:
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


# package.json
package_path = ROOT / "package.json"
package = json.loads(package_path.read_text(encoding="utf-8"))
scripts = package.setdefault("scripts", {})
scripts["audit:people-popup-readiness"] = "npm run build:tools && node dist/tools/audit-people-popup-readiness.mjs"
scripts["audit:people-popup-readiness:check"] = "npm run build:tools && node dist/tools/audit-people-popup-readiness.mjs --check"

tools_check = scripts.get("tools:check", "")
anchor = "npm run audit:people-of-places"
addition = "node dist/tools/audit-people-popup-readiness.mjs --check"
if addition not in tools_check:
    if anchor not in tools_check:
        raise SystemExit("Could not find audit:people-of-places anchor in tools:check")
    tools_check = tools_check.replace(anchor, f"{anchor} && {addition}", 1)
    scripts["tools:check"] = tools_check
write_json(package_path, package)


# docs/README.md
docs_readme_path = ROOT / "docs/README.md"
docs_readme = docs_readme_path.read_text(encoding="utf-8")
product_anchor = "7. [`PLACE_POPUP_SYSTEM.md`](./PLACE_POPUP_SYSTEM.md) — canonical presentasjons- og stedstypekontrakt for den rike stedspopupen"
product_entry = "8. [`PEOPLE_POPUP_SYSTEM.md`](./PEOPLE_POPUP_SYSTEM.md) — canonical presentasjons-, felt- og persontypekontrakt for den rike people-popupen"
if product_entry not in docs_readme:
    if product_anchor not in docs_readme:
        raise SystemExit("Could not find place popup product anchor in docs/README.md")
    docs_readme = docs_readme.replace(product_anchor, f"{product_anchor}\n{product_entry}", 1)

people_anchor = "1. [`people-of-places-method.md`](./people-of-places-method.md) — canonical relevans-, kilde-, gjenbruks- og batchmetode for person–sted-koblinger"
people_block = """1. [`people-of-places-method.md`](./people-of-places-method.md) — canonical relevans-, kilde-, gjenbruks- og batchmetode for person–sted-koblinger
2. [`PEOPLE_POPUP_SYSTEM.md`](./PEOPLE_POPUP_SYSTEM.md) — canonical presentasjons-, felt-, fallback- og persontypekontrakt
3. [`../data/people/manifest.json`](../data/people/manifest.json) — aktive canonical people-source-filer
4. [`../tools/audit-people-popup-readiness.mts`](../tools/audit-people-popup-readiness.mts) — rangerer alle manifest-lastede profiler etter popup-readiness og skriver regenererbare rapporter
5. [`../reports/people-popup-readiness.md`](../reports/people-popup-readiness.md) — prioritert arbeidsliste etter kategori og stedsklynge
6. [`../tools/audit-people-of-places-status.mts`](../tools/audit-people-of-places-status.mts) — status-, schema-, referanse- og struktur-audit
7. [`../tools/check-people-of-places-gate.mts`](../tools/check-people-of-places-gate.mts) — blokkerer duplikater, ugyldige refs, manglende primæranker og tomme `places`
8. [`PEOPLE_IMAGES.md`](./PEOPLE_IMAGES.md) — canonical kilde-, lisens-, godkjennings- og attribusjonskontrakt for people-bilder
9. [`../tools/people-image-pipeline.mts`](../tools/people-image-pipeline.mts) — implementert kandidat-, review-, apply- og audit-pipeline
10. [`../tests/people-images.test.mjs`](../tests/people-images.test.mjs) — lisens-, identitets-, quality-, apply- og attribusjonsregresjoner"""

old_people_block = """1. [`people-of-places-method.md`](./people-of-places-method.md) — canonical relevans-, kilde-, gjenbruks- og batchmetode for person–sted-koblinger
2. [`../data/people/manifest.json`](../data/people/manifest.json) — aktive canonical people-source-filer
3. [`../tools/audit-people-of-places-status.mts`](../tools/audit-people-of-places-status.mts) — status-, schema-, referanse- og struktur-audit
4. [`../tools/check-people-of-places-gate.mts`](../tools/check-people-of-places-gate.mts) — blokkerer duplikater, ugyldige refs, manglende primæranker og tomme `places`
5. [`PEOPLE_IMAGES.md`](./PEOPLE_IMAGES.md) — canonical kilde-, lisens-, godkjennings- og attribusjonskontrakt for people-bilder
6. [`../tools/people-image-pipeline.mts`](../tools/people-image-pipeline.mts) — implementert kandidat-, review-, apply- og audit-pipeline
7. [`../tests/people-images.test.mjs`](../tests/people-images.test.mjs) — lisens-, identitets-, quality-, apply- og attribusjonsregresjoner"""

if people_block not in docs_readme:
    if old_people_block not in docs_readme:
        if people_anchor not in docs_readme:
            raise SystemExit("Could not find people production anchor in docs/README.md")
        raise SystemExit("People production list changed; update registration script deliberately")
    docs_readme = docs_readme.replace(old_people_block, people_block, 1)

docs_readme_path.write_text(docs_readme, encoding="utf-8")


# docs/documentation_registry.json
registry_path = ROOT / "docs/documentation_registry.json"
registry = json.loads(registry_path.read_text(encoding="utf-8"))
priority = registry.setdefault("priority_order", [])
people_doc = "docs/PEOPLE_POPUP_SYSTEM.md"
if people_doc not in priority:
    try:
        index = priority.index("docs/PLACE_POPUP_SYSTEM.md") + 1
    except ValueError as error:
        raise SystemExit("Could not find PLACE_POPUP_SYSTEM in priority_order") from error
    priority.insert(index, people_doc)

documents = registry.setdefault("documents", [])
entry = {
    "path": people_doc,
    "status": "canonical",
    "role": "Presentasjons-, felt-, handling-, fallback- og persontypekontrakt for people-popup V2",
    "owns": [
        "person_popup_presentation_contract",
        "person_popup_field_contract",
        "person_popup_type_profiles",
        "person_popup_readiness_model",
    ],
    "last_verified": "2026-07-26",
}
existing_index = next((i for i, item in enumerate(documents) if item.get("path") == people_doc), None)
if existing_index is None:
    place_index = next((i for i, item in enumerate(documents) if item.get("path") == "docs/PLACE_POPUP_SYSTEM.md"), None)
    if place_index is None:
        documents.append(entry)
    else:
        documents.insert(place_index + 1, entry)
else:
    documents[existing_index] = entry
write_json(registry_path, registry)

print("Registered PEOPLE_POPUP_SYSTEM, audit scripts and readiness check.")
