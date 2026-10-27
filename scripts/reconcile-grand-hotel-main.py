#!/usr/bin/env python3
"""Resolve only the known shared History Go JSON files after merging main.

Keep main's unrelated registrations/Knowledge and add Grand Hotel's own fields.
Regenerate derived Knowledge, Fagverk and runtime in the invoking workflow.
Never modify Oslo domkirke or the separate Oslo-bolk 04.
"""
import json
import subprocess
from pathlib import Path

ALLOWED = {
    "data/fag/fag_manifest.json",
    "data/fagverk/fagverk_registry.json",
    "data/fagverk/fagverk_release.json",
    "data/knowledge/knowledge_units.generated.json",
    "data/quiz/manifest.json",
    "reports/knowledge-id-backfill.json",
}

def git(*args):
    return subprocess.check_output(["git", *args])

def read(ref, path):
    return json.loads(git("show", f"{ref}:{path}").decode("utf-8"))

def write(path, obj):
    Path(path).write_text(json.dumps(obj, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

def main():
    base = git("merge-base", "HEAD", "origin/main").decode().strip()
    changed_branch = set(git("diff", "--name-only", base, "HEAD").decode().splitlines())
    changed_main = set(git("diff", "--name-only", base, "origin/main").decode().splitlines())
    overlap = changed_branch & changed_main
    unexpected = overlap - ALLOWED
    if unexpected:
        raise SystemExit(f"Refusing to synchronize unexpected overlapping paths: {sorted(unexpected)}")
    if "data/fag/fag_manifest.json" not in changed_branch:
        raise SystemExit("Missing Grand Hotel production target on PR branch")
    # HEAD is the Grand Hotel branch, origin/main the newest base.
    branch_fag = read("HEAD", "data/fag/fag_manifest.json")
    main_fag = read("origin/main", "data/fag/fag_manifest.json")
    target = branch_fag["media"]["quizProduction"]["targets"]["grand_hotel"]
    if main_fag["media"]["quizProduction"]["targets"].get("grand_hotel") not in (None, target):
        raise SystemExit("Grand Hotel Fagverk target already differs on main")
    main_fag["media"]["quizProduction"]["targets"]["grand_hotel"] = target
    write("data/fag/fag_manifest.json", main_fag)

    branch_registry = read("HEAD", "data/fagverk/fagverk_registry.json")
    main_registry = read("origin/main", "data/fagverk/fagverk_registry.json")
    grand = branch_registry["placeLinks"]["grand_hotel"]
    if main_registry["placeLinks"].get("grand_hotel") not in (None, grand):
        raise SystemExit("Grand Hotel place Fagverk registry differs on main")
    main_registry["placeLinks"]["grand_hotel"] = grand
    write("data/fagverk/fagverk_registry.json", main_registry)

    branch_quiz = read("HEAD", "data/quiz/manifest.json")
    main_quiz = read("origin/main", "data/quiz/manifest.json")
    new_entries = [entry for entry in branch_quiz["sets"] if entry.get("targetId") == "grand_hotel"]
    if len(new_entries) != 3:
        raise SystemExit(f"Expected 3 Grand Hotel sets, got {len(new_entries)}")
    registered = [entry for entry in main_quiz["sets"] if entry.get("targetId") == "grand_hotel"]
    if registered and registered != new_entries:
        raise SystemExit("Grand Hotel quiz was independently changed on main")
    entries = [entry for entry in main_quiz["sets"] if entry.get("targetId") != "grand_hotel"]
    idx = next((i for i, entry in enumerate(entries)
                if entry.get("targetId", "") > "grand_hotel"), len(entries))
    entries[idx:idx] = new_entries
    main_quiz["sets"] = entries
    write("data/quiz/manifest.json", main_quiz)

    # These three files are derived global output; re-run canonical builders.
    # Starting with main protects additions from other parallel PRs.
    for path in (
        "data/fagverk/fagverk_release.json",
        "data/knowledge/knowledge_units.generated.json",
        "reports/knowledge-id-backfill.json",
    ):
        Path(path).write_bytes(git("show", f"origin/main:{path}"))

    unresolved = git("diff", "--name-only", "--diff-filter=U").decode().splitlines()
    unknown = set(unresolved) - ALLOWED
    if unknown:
        raise SystemExit(f"Unresolved conflicts outside the six approved shared files: {sorted(unknown)}")
    subprocess.run(["git", "add", *sorted(ALLOWED)], check=True)
    remaining = git("diff", "--name-only", "--diff-filter=U").decode().splitlines()
    if remaining:
        raise SystemExit(f"Cannot commit unresolved paths: {remaining}")
    print(f"Grand Hotel: reconciled {len(overlap)} overlapping files; kept main's other content.")

if __name__ == "__main__":
    main()
