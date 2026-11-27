"""Read-only R2 candidate reference audit. Never approves, uploads or excludes."""
import argparse
from collections import defaultdict
import hashlib
import json
from pathlib import Path
import re
import subprocess
from urllib.parse import unquote

ROOT = Path(__file__).resolve().parents[1]
MANIFEST = "tools/r2-migration-review-inventory-20261125.json"
SCRIPT = "tools/r2-migration-reference-audit.py"
WORKFLOW = ".github/workflows/r2-migration-reference-audit.yml"
TEXT_EXTENSIONS = {".html", ".htm", ".js", ".mjs", ".cjs", ".ts", ".tsx", ".jsx",
                   ".json", ".jsonl", ".css", ".md", ".txt", ".yaml", ".yml",
                   ".svg", ".xml", ".csv", ".py", ".sh", ".toml", ".webmanifest"}
DEV_ROOTS = {"tools", "scripts", "tests", "reports", "docs", ".github", ".cache", "tmp"}
PREFIXES = ("bilder/kort/people/", "bilder/kort/places/", "bilder/places/",
            "bilder/merker/by/locales/", "bilder/merker/scenekunst/locales/",
            "bilder/merker/historie/locales/", "bilder/merker/vitenskap/locales/",
            "bilder/QuizCards/")
END = re.compile(r"\.(?:png|jpe?g|webp)(?![\w])", re.I)

def git(*args):
    return subprocess.check_output(["git", *args], cwd=ROOT)

def make_index(paths):
    # Reversed basename trie permits names with spaces, Unicode and mixed case.
    trie = {}
    for path in paths:
        node = trie
        for char in reversed(Path(path).name):
            node = node.setdefault(char, {})
        node.setdefault(None, []).append(path)
    return trie

def normalized(text):
    # Recognize JSON slash escaping and percent-encoded URLs; not JS evaluation.
    return unquote(text.replace(r"\/", "/"))

def scan(text, trie):
    text = normalized(text)
    exact, hints = set(), set()
    for match in END.finditer(text):
        end = match.end()
        node = trie
        candidates = []
        for i in range(end - 1, -1, -1):
            node = node.get(text[i])
            if node is None:
                break
            if None in node:
                if i == 0 or not (text[i-1].isalnum() or text[i-1] in "_.-"):
                    candidates.extend(node[None])
        full = []
        for path in candidates:
            start = end - len(path)
            if start >= 0 and text[start:end] == path and (
                start == 0 or not (text[start-1].isalnum() or text[start-1] in "_.-")
            ):
                full.append(path)
        if full:
            exact.update(full)
        else:
            hints.update(candidates)
    return exact, hints

def self_test():
    a = "bilder/places/A B.PNG"
    b = "bilder/kort/places/A B.PNG"
    c = "bilder/places/Øya.webp"
    d = "bilder/places/Bar.jpg"
    trie = make_index([a, b, c, d])
    assert scan('src="../bilder/places/A%20B.PNG?v=1"', trie) == ({a}, set())
    assert scan(r'"bilder\/kort\/places\/A B.PNG"', trie) == ({b}, set())
    assert scan('"A B.PNG"', trie) == (set(), {a, b})
    assert scan('"bilder/places/%C3%98ya.webp"', trie) == ({c}, set())
    assert scan('"NotBar.jpg"', trie) == (set(), set())
    assert scan('"bilder/places/Bar.jpg2"', trie) == (set(), set())

def audit():
    source = json.loads((ROOT / MANIFEST).read_text(encoding="utf-8"))
    assert source["approved_for_upload"] is False
    assert source["approved_for_pages_exclusion"] is False
    rows = [dict(item, group=g["id"]) for g in source["groups"] for item in g["files"]]
    paths = [row["path"] for row in rows]
    assert len(paths) == len(set(paths)) == source["total_files"]
    assert sum(r["bytes"] for r in rows) == source["total_candidate_bytes"]
    trie = make_index(paths)
    for row in rows:
        p = ROOT / row["path"]
        assert p.is_file() and not p.is_symlink() and p.resolve().is_relative_to(ROOT)
        raw = p.read_bytes()
        assert len(raw) == row["bytes"], row["path"]
        blob = hashlib.sha1(("blob %d\0" % len(raw)).encode() + raw).hexdigest()
        assert blob == row["git_blob_sha"], row["path"]
        row["sha256"] = hashlib.sha256(raw).hexdigest()
        row["approval"] = "review_required"

    exact, hints = defaultdict(list), defaultdict(list)
    prefix_mentions = defaultdict(list)
    skipped = []
    scanned = 0
    tracked = git("ls-files", "-z").decode("utf-8").split("\0")
    for name in sorted(set(tracked) - {"", MANIFEST, SCRIPT, WORKFLOW}):
        p = ROOT / name
        if p.suffix.lower() not in TEXT_EXTENSIONS:
            continue
        if not p.is_file() or p.is_symlink():
            skipped.append({"path": name, "reason": "not_regular_file"})
            continue
        try:
            content = p.read_text(encoding="utf-8-sig")
        except UnicodeError:
            skipped.append({"path": name, "reason": "non_utf8"})
            continue
        scanned += 1
        kind = "development_or_review" if Path(name).parts[0] in DEV_ROOTS else "potential_runtime_or_public"
        ref = {"file": name, "kind": kind}
        found, weak = scan(content, trie)
        for key in found:
            exact[key].append(ref)
        for key in weak:
            hints[key].append(ref)
        normalized_content = normalized(content)
        for prefix in PREFIXES:
            if prefix in normalized_content:
                prefix_mentions[prefix].append(ref)

    summary = {}
    for row in rows:
        path = row["path"]
        row["literal_full_path_references"] = exact[path]
        row["basename_only_hints"] = hints[path]
        if any(r["kind"] == "potential_runtime_or_public" for r in exact[path]):
            status = "literal_public_or_runtime_reference"
        elif exact[path]:
            status = "literal_development_reference_only"
        elif hints[path]:
            status = "basename_hint_only"
        else:
            status = "no_literal_reference_found"
        row["reference_status"] = status
        group = summary.setdefault(row["group"], {})
        count = group.setdefault(status, {"files": 0, "bytes": 0})
        count["files"] += 1
        count["bytes"] += row["bytes"]
    return {
        "schema": "history-go-r2-reference-audit-v1",
        "source_commit": git("rev-parse", "HEAD").decode().strip(),
        "inventory_source_commit": source["source_commit"],
        "total_files": len(rows), "total_bytes": source["total_candidate_bytes"],
        "scanned_text_files": scanned, "skipped_text_files": skipped,
        "approved_for_upload": False, "approved_for_pages_exclusion": False,
        "limitations": [
            "Static case-sensitive literal search with URL decoding; dynamic paths, case variants, escaped Unicode, non-UTF8 and other file formats may be missed.",
            "A literal public/runtime reference is not proof that the file is active or rights-cleared; no match is not proof of non-use.",
            "Prefix mentions include literal and potentially dynamic references; inspect before runtime changes.",
            "All rows remain review_required; actual public mirror SHA-256, MIME, UI/cache and rights checks remain mandatory."
        ],
        "summary_by_group": summary, "prefix_mentions": dict(prefix_mentions), "files": rows
    }

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--report", type=Path, required=True)
    args = parser.parse_args()
    self_test()
    result = audit()
    args.report.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({k: result[k] for k in ("total_files", "total_bytes", "scanned_text_files", "summary_by_group")}, indent=2))

if __name__ == "__main__":
    main()
