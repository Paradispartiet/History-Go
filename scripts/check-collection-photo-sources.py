#!/usr/bin/env python3
"""Check documentary photo candidates that have source evidence but NO staged bytes.

A source photograph is NOT a finished asset. A license on the photograph
does not automatically license sculptures or other third-party artworks
depicted in it.
"""
from __future__ import annotations

import json
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
SOURCE_MANIFEST = ROOT / "reports/collection-images/freiaparken-photo-2024-commons-candidate.json"


def verify_photo_source(manifest: dict, root: Path) -> None:
    if manifest.get("collection") != "structures" or manifest.get("asset") != "freiaparken":
        raise ValueError("unexpected photo candidate identity")
    if manifest.get("imageKind") != "photograph":
        raise ValueError("documentary photo must be marked photograph")
    if manifest.get("editorialApproval") is not False or manifest.get("publishable") is not False:
        raise ValueError("source-only photo cannot be editorially approved/published")
    if manifest.get("reviewStatus") != "SOURCE_AND_IMAGE_VISUALLY_VERIFIED_BINARY_NOT_STAGED":
        raise ValueError("source candidate must keep explicit un-staged status")
    if not re.fullmatch(r"[0-9a-f]{40}", str(manifest.get("sourceArchiveSha1", ""))):
        raise ValueError("Commons original SHA1 must be recorded")
    if manifest.get("candidateSha256") is not None:
        raise ValueError("cannot claim derivative checksum without generated binary")
    if manifest.get("sourceArchiveBytes", 0) <= 0 or manifest.get("sourceWidth", 0) <= 0 or manifest.get("sourceHeight", 0) <= 0:
        raise ValueError("original image dimensions/bytes missing")
    if not str(manifest.get("originalFileSource", "")).startswith("https://commons.wikimedia.org/wiki/File:"):
        raise ValueError("source must be exact Commons file description")
    if manifest.get("license") != "CC BY-SA 4.0" or manifest.get("licenseUrl") != "https://creativecommons.org/licenses/by-sa/4.0/":
        raise ValueError("photo license must be explicit and linked")
    if not manifest.get("photographer") or not manifest.get("proposedCredit"):
        raise ValueError("photographer attribution missing")
    if not any("artwork" in str(item).lower() for item in manifest.get("reuseConditions", [])):
        raise ValueError("independent artwork rights gate missing")
    filename = str(manifest.get("candidateFilename", ""))
    if not filename.endswith(".webp") or Path(filename).name != filename:
        raise ValueError("candidate filename must be a safe WebP basename")
    destination = root / "bilder/kort/structures/candidates/freiaparken" / filename
    if destination.exists():
        raise ValueError("photo source-only status cannot claim no bytes if staged WebP exists")


if __name__ == "__main__":
    payload = json.loads(SOURCE_MANIFEST.read_text(encoding="utf-8"))
    verify_photo_source(payload, ROOT)
    print("PHOTO_SOURCE_REVIEW_PASS_UNSTAGED: checked source, license, attribution, artwork-rights gate and no staged asset")
