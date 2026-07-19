#!/usr/bin/env python3
"""Rebuild PR #2496 data onto the current v2 branch and publish one atomic Git commit."""

from __future__ import annotations

import base64
import json
import os
from pathlib import Path
import subprocess
import urllib.error
import urllib.parse
import urllib.request

SOURCE_REF = "refs/remotes/origin/elvepartiet-source-2496"
SOURCE_BRANCH = "refs/heads/agent/tmp-elvepartiet-source-2496"
DIRECT_FILES = [
    "data/places/natur/oslo/places_oslo_natur_akerselvarute/stilla_nydalen.json",
    "data/quiz/natur/stilla_nydalen_sets.json",
    "data/stories/stories_stilla_nydalen.json",
    "reports/elvepartiet-nydalsdammen-nature-rounds-batch1.md",
    "tests/elvepartiet-nydalsdammen-nature-rounds-batch1.test.js",
]
LEKSIKON_PATH = "data/leksikon/places/oslo/natur/leksikon_oslo_natur_batch1.json"
INDEX_PATH = "data/places/natur/oslo/places_oslo_natur_akerselvarute_index.json"
MANIFEST_PATH = "data/places/natur/oslo/places_oslo_natur_akerselvarute_manifest.json"


def run(*args: str) -> None:
    subprocess.run(args, check=True)


def git_show(path: str) -> bytes:
    return subprocess.check_output(["git", "show", f"{SOURCE_REF}:{path}"])


def read_json(path: str):
    return json.loads(Path(path).read_text(encoding="utf-8"))


def write_json(path: str, value) -> None:
    Path(path).write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def place_rows(document):
    if isinstance(document, list):
        return document
    if isinstance(document, dict) and isinstance(document.get("places"), list):
        return document["places"]
    raise TypeError("Expected a place list or an object with a places list")


def api(token: str, url: str, method: str = "GET", payload=None):
    data = None if payload is None else json.dumps(payload).encode("utf-8")
    request = urllib.request.Request(
        url,
        data=data,
        method=method,
        headers={
            "Authorization": f"Bearer {token}",
            "Accept": "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
            "User-Agent": "history-go-elvepartiet-v2-finalizer",
        },
    )
    try:
        with urllib.request.urlopen(request) as response:
            body = response.read().decode("utf-8")
            return json.loads(body) if body else {}
    except urllib.error.HTTPError as exc:
        body = exc.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"GitHub API {method} {url} failed: HTTP {exc.code}: {body}") from exc


def main() -> None:
    token = os.environ["GH_TOKEN"]
    repo = os.environ["REPO"]
    branch = os.environ["BRANCH"]

    print("Fetching restored PR #2496 source branch…")
    run("git", "fetch", "--quiet", "--depth=1", "origin", f"{SOURCE_BRANCH}:{SOURCE_REF}")

    for path in DIRECT_FILES:
        Path(path).parent.mkdir(parents=True, exist_ok=True)
        Path(path).write_bytes(git_show(path))

    source_leksikon = json.loads(git_show(LEKSIKON_PATH).decode("utf-8"))
    current_leksikon = read_json(LEKSIKON_PATH)
    source_article = next(row for row in source_leksikon if row.get("place_id") == "stilla_nydalen")
    article_index = next(i for i, row in enumerate(current_leksikon) if row.get("place_id") == "stilla_nydalen")
    current_leksikon[article_index] = source_article
    write_json(LEKSIKON_PATH, current_leksikon)

    for target in (INDEX_PATH, MANIFEST_PATH):
        source_document = json.loads(git_show(target).decode("utf-8"))
        current_document = read_json(target)
        source_rows = place_rows(source_document)
        current_rows = place_rows(current_document)
        source_row = next(row for row in source_rows if row.get("id") == "stilla_nydalen")
        current_index = next(i for i, row in enumerate(current_rows) if row.get("id") == "stilla_nydalen")
        current_rows[current_index] = source_row
        write_json(target, current_document)

    changed = subprocess.check_output(["git", "diff", "HEAD", "--name-only"], text=True).splitlines()
    changed = [path.strip() for path in changed if path.strip()]
    if not changed:
        raise RuntimeError("No rebuilt files differ from the v2 branch")
    print("Changed files:")
    for path in changed:
        print(f"  - {path}")

    api_root = f"https://api.github.com/repos/{repo}"
    ref_name = urllib.parse.quote(f"heads/{branch}", safe="")
    ref = api(token, f"{api_root}/git/ref/{ref_name}")
    parent_sha = ref["object"]["sha"]
    parent_commit = api(token, f"{api_root}/git/commits/{parent_sha}")
    base_tree_sha = parent_commit["tree"]["sha"]

    tree_entries = []
    for path in changed:
        blob = api(
            token,
            f"{api_root}/git/blobs",
            method="POST",
            payload={
                "content": base64.b64encode(Path(path).read_bytes()).decode("ascii"),
                "encoding": "base64",
            },
        )
        tree_entries.append({"path": path, "mode": "100644", "type": "blob", "sha": blob["sha"]})

    tree = api(
        token,
        f"{api_root}/git/trees",
        method="POST",
        payload={"base_tree": base_tree_sha, "tree": tree_entries},
    )
    commit = api(
        token,
        f"{api_root}/git/commits",
        method="POST",
        payload={
            "message": "Rebuild Elvepartiet below Nydalsdammen rounds on current main",
            "tree": tree["sha"],
            "parents": [parent_sha],
        },
    )
    updated = api(
        token,
        f"{api_root}/git/refs/{ref_name}",
        method="PATCH",
        payload={"sha": commit["sha"], "force": False},
    )
    print(f"Published atomic commit {commit['sha']}")
    print(f"Updated ref to {updated['object']['sha']}")


if __name__ == "__main__":
    main()
