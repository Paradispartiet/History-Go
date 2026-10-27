#!/usr/bin/env python3
"""Safely resolve only known shared data files for Oslo domkirke PR #6679.

Run after "git merge --no-commit origin/main"; preserve all current main records,
adding only the cathedral's People, Fagverk, quiz, and QuizCard registrations.
Global generated files are reset to main and rebuilt by the workflow.
"""
import json
import subprocess
from pathlib import Path

OVERLAPPING = {
    "data/fagverk/fagverk_registry.json",
    "data/fagverk/fagverk_release.json",
    "data/knowledge/knowledge_units.generated.json",
    "data/people/historie/oslo/people_historie_oslo.json",
    "data/places/places_index.json",
    "data/quiz/manifest.json",
    "data/quizcards/historie/manifest.json",
    "data/runtime/people-all/part-001.json",
    "data/runtime/place-open/oslo_radhus.json",
}
GENERATED = {
    "data/fagverk/fagverk_release.json",
    "data/knowledge/knowledge_units.generated.json",
    "data/places/places_index.json",
    "data/runtime/people-all/part-001.json",
    "data/runtime/place-open/oslo_radhus.json",
}

def git(*args):
    return subprocess.check_output(["git", *args])

def read(revision, file):
    return json.loads(git("show", f"{revision}:{file}").decode("utf-8"))

def write(file, value):
    Path(file).write_text(json.dumps(value, ensure_ascii=False, indent=2)+"\n", encoding="utf-8")

def fail(message):
    raise SystemExit(message)

def merge_people(file, ids):
    previous = read("HEAD", file)
    current = read("origin/main", file)
    b = {p["id"]: p for p in previous}
    m = {p["id"]: p for p in current}
    for id_ in ids:
        if id_ not in b or id_ not in m:
            fail(f"{file}: canonical People id missing: {id_}")
        branch_person, main_person = b[id_], m[id_]
        if "oslo_domkirke" not in branch_person.get("places", []):
            fail(f"{file}: {id_} lacks documented cathedral connection")
        if "oslo_domkirke" not in main_person.get("places", []):
            main_person["places"] = [*main_person.get("places", []), "oslo_domkirke"]
        for url in branch_person.get("source_urls", []):
            if url not in main_person.get("source_urls", []):
                main_person.setdefault("source_urls", []).append(url)
        # Do not move primary anchoring or replace other source material.
        if main_person.get("placeId") != branch_person.get("placeId"):
            fail(f"{file}: {id_} primary People anchor changed")
    write(file, current)

def main():
    base = git("merge-base", "HEAD", "origin/main").decode().strip()
    main_paths = set(git("diff", "--name-only", base, "origin/main").decode().splitlines())
    branch_paths = set(git("diff", "--name-only", base, "HEAD").decode().splitlines())
    shared = branch_paths & main_paths
    unexpected = shared - OVERLAPPING
    if unexpected:
        fail(f"Stop: unknown shared-file edits: {sorted(unexpected)}")

    merge_people("data/people/historie/oslo/people_historie_oslo.json", ["alexis_de_chateauneuf"])

    branch_reg = read("HEAD", "data/fagverk/fagverk_registry.json")
    main_reg = read("origin/main", "data/fagverk/fagverk_registry.json")
    value = branch_reg["placeLinks"]["oslo_domkirke"]
    if main_reg["placeLinks"].get("oslo_domkirke") not in (None, value):
        fail("Main has a competing Oslo domkirke Fagverk registration")
    main_reg["placeLinks"]["oslo_domkirke"] = value
    write("data/fagverk/fagverk_registry.json", main_reg)

    branch_quiz = read("HEAD", "data/quiz/manifest.json")
    main_quiz = read("origin/main", "data/quiz/manifest.json")
    target = [x for x in branch_quiz["sets"] if x.get("targetId") == "oslo_domkirke"]
    if len(target) != 1:
        fail(f"Expected one cathedral quiz manifest registration, found {len(target)}")
    current = [x for x in main_quiz["sets"] if x.get("targetId") == "oslo_domkirke"]
    if current and current != target:
        fail("Main contains a conflicting Oslo domkirke quiz manifest registration")
    if not current:
        main_quiz["sets"].append(target[0])
    write("data/quiz/manifest.json", main_quiz)

    branch_cards = read("HEAD", "data/quizcards/historie/manifest.json")
    main_cards = read("origin/main", "data/quizcards/historie/manifest.json")
    filename = "oslo_domkirke_quizkort_v1.json"
    if filename not in branch_cards["collections"]:
        fail("PR branch is missing the canonical cathedral QuizCard collection")
    if filename not in main_cards["collections"]:
        main_cards["collections"].append(filename)
    write("data/quizcards/historie/manifest.json", main_cards)

    for file in GENERATED:
        Path(file).write_bytes(git("show", f"origin/main:{file}"))

    unresolved = git("diff", "--name-only", "--diff-filter=U").decode().splitlines()
    extra = set(unresolved) - OVERLAPPING
    if extra:
        fail(f"Non-approved merge conflict: {extra}")
    subprocess.run(["git", "add", *sorted(OVERLAPPING)], check=True)
    remaining = git("diff", "--name-only", "--diff-filter=U").decode().splitlines()
    if remaining:
        fail(f"Unresolved files: {remaining}")
    print(f"Oslo domkirke: resolved {len(shared)} common files; unrelated main changes preserved.")

if __name__ == "__main__":
    main()
