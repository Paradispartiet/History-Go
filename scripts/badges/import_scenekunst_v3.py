#!/usr/bin/env python3
"""Safely import the three inactive Scenekunst v3 candidate patches from a ZIP.

Usage:
    python3 scripts/badges/import_scenekunst_v3.py /path/to/history-go-scenekunst-v3-uploadpakke.zip

This script verifies each file against the existing candidate register and refuses
to overwrite a different image. It does not activate any badge or change main.
"""
import hashlib
import json
import os
from pathlib import Path
import sys
import tempfile
import zipfile

ROOT = Path(__file__).resolve().parents[2]
REGISTER = ROOT / "data/badges/underbadge_batch01_production.json"
IDS = ("sceneproduksjon", "regi", "dramaturgi")
PREFIX = "bilder/merker/scenekunst/undermerker"


def main() -> int:
    if len(sys.argv) != 2:
        print("Usage: python3 scripts/badges/import_scenekunst_v3.py <zip-path>", file=sys.stderr)
        return 2
    archive = Path(sys.argv[1]).expanduser().resolve()
    manifest = json.loads(REGISTER.read_text(encoding="utf-8"))
    assets = {a["id"]: a for a in manifest["families"]["scenekunst"]["assets"]}
    pending = []

    with zipfile.ZipFile(archive) as bundle:
        for category_id in IDS:
            candidate = assets[category_id].get("replacementCandidate")
            if not candidate or candidate.get("version") != "v3":
                raise ValueError(f"{category_id}: expected registered v3 replacement candidate")
            name = f"{PREFIX}/{category_id}-brodert-v3.webp"
            if candidate.get("proposedImage") != name:
                raise ValueError(f"{category_id}: unexpected candidate file path")
            if candidate.get("visualApproved") or candidate.get("selectedImage"):
                raise ValueError(f"{category_id}: candidate unexpectedly activated")
            info = bundle.getinfo(name)
            if info.file_size != candidate["bytes"]:
                raise ValueError(f"{category_id}: ZIP file size differs from register")
            payload = bundle.read(info)
            if hashlib.sha256(payload).hexdigest() != candidate["sha256"]:
                raise ValueError(f"{category_id}: SHA-256 differs from register")
            if len(payload) < 16 or payload[:4] != b"RIFF" or payload[8:12] != b"WEBP":
                raise ValueError(f"{category_id}: invalid WebP header")
            target = ROOT / name
            if target.exists() and target.read_bytes() != payload:
                raise FileExistsError(f"Refusing to replace different existing file: {target}")
            pending.append((category_id, candidate, target, payload))

    # No files are written until all three candidates have passed verification.
    for category_id, candidate, target, payload in pending:
        target.parent.mkdir(parents=True, exist_ok=True)
        if not target.exists():
            fd, temp_name = tempfile.mkstemp(dir=target.parent, prefix=".scenekunst-", suffix=".webp")
            try:
                with os.fdopen(fd, "wb") as handle:
                    handle.write(payload)
                os.replace(temp_name, target)
            finally:
                if os.path.exists(temp_name):
                    os.unlink(temp_name)
        candidate["repositoryUploaded"] = True
        candidate["status"] = "repository_candidate_pending_visual_approval"
        candidate["visualApproved"] = False
        candidate["selectedImage"] = None
        print(f"Verified and staged: {target.relative_to(ROOT)}")

    REGISTER.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print("All three candidates verified; no badge activated.")
    print("Next: review git diff, run focused badge test, commit to PR branch.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
