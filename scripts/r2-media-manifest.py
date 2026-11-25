"""Build an inactive runtime mapping from a verified R2 pilot report.

Only explicit, verified public URLs for unchanged current Music badge files are
accepted. The output is a candidate, not a deployment or a runtime activation.
"""
import argparse
import importlib.util
import json
from pathlib import Path
import re
from urllib.parse import quote, urlsplit

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location("r2_pilot", ROOT / "scripts/r2-media-pilot.py")
pilot = importlib.util.module_from_spec(spec)
spec.loader.exec_module(pilot)


def build_mapping(report, current, public_base):
    base = public_base.rstrip("/")
    url = urlsplit(base)
    if (url.scheme != "https" or not url.hostname or url.username or url.password
            or url.path or url.query or url.fragment):
        raise ValueError("Expected explicit HTTPS public origin")
    if report.get("version") != 1 or report.get("mode") != "verified-mirror":
        raise ValueError("Verified mirror report required")
    commit = report.get("source_commit", "")
    if not re.fullmatch(r"[a-f0-9]{40}", commit):
        raise ValueError("Missing source commit")
    rows = report.get("images")
    if not isinstance(rows, list) or len(rows) != len(current) or not current:
        raise ValueError("Incomplete or unexpected report inventory")
    expected = {row["path"]: row for row in current}
    if len(expected) != len(current):
        raise ValueError("Duplicate source paths")
    mappings = {}
    for row in rows:
        name = row["path"]
        if name in mappings or name not in expected:
            raise ValueError("Unexpected or duplicate path")
        local = expected[name]
        for field in ("sha256", "bytes", "key", "content_type"):
            if row.get(field) != local[field]:
                raise ValueError(f"Source mismatch: {name}: {field}")
        remote = base + "/" + quote(local["key"], safe="/")
        if row.get("verified_url") != remote:
            raise ValueError(f"Unverified or unexpected URL: {name}")
        mappings[name] = {"url": remote, "sha256": local["sha256"],
                          "bytes": local["bytes"], "content_type": local["content_type"]}
    if set(mappings) != set(expected) or report.get("total_bytes") != sum(r["bytes"] for r in current):
        raise ValueError("Incomplete mapping or total byte mismatch")
    return {"version": 1, "enabled": False, "source_commit": commit,
            "public_origin": base, "images": dict(sorted(mappings.items()))}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--verified-report", type=Path, required=True)
    parser.add_argument("--public-base", required=True)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    report = json.loads(args.verified_report.read_text(encoding="utf-8"))
    if args.output.exists():
        raise FileExistsError("Refusing to overwrite an existing mapping")
    output = args.output.resolve()
    if output.is_relative_to(ROOT.resolve()):
        raise ValueError("Write candidate outside the repository; activation is a separate reviewed change")
    result = build_mapping(report, pilot.inventory(ROOT), args.public_base)
    with args.output.open("x", encoding="utf-8") as file:
        file.write(json.dumps(result, indent=2, ensure_ascii=False) + "\n")
    print(f"Inactive candidate: {len(result['images'])} mapped paths")


if __name__ == "__main__":
    main()
