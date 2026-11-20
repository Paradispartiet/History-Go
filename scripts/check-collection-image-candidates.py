#!/usr/bin/env python3
"""Check staged History GO collection illustrations without publishing them.

Only validates binary integrity + safe staging metadata. Historical accuracy,
rights clearance and PlaceCard visual review remain separate editorial gates.
"""
from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
IMAGE_META = ROOT / "reports/collection-images"
MANIFESTS = (
    "toyen-trafo-apparatpult-1916-candidate.json",
    "toyen-trafo-transformatorkjerne-1918-candidate.json",
    "freiaparken-structure-candidate.json",
)
PREFIXES = (
    "bilder/kort/objects/candidates/",
    "bilder/kort/structures/candidates/",
)


def image_size(data: bytes) -> tuple[int, int]:
    """Read WebP dimensions; no dependency on Pillow."""
    if len(data) < 30 or data[:4] != b"RIFF" or data[8:12] != b"WEBP":
        raise ValueError("invalid WebP RIFF signature")
    if int.from_bytes(data[4:8], "little") + 8 != len(data):
        raise ValueError("invalid WebP RIFF length")
    chunk = data[12:16]
    if chunk == b"VP8 ":
        if data[23:26] != b"\x9d\x01\x2a":
            raise ValueError("invalid VP8 header")
        return (int.from_bytes(data[26:28], "little") & 0x3fff,
                int.from_bytes(data[28:30], "little") & 0x3fff)
    if chunk == b"VP8L":
        if data[20] != 0x2f:
            raise ValueError("invalid VP8L header")
        bits = int.from_bytes(data[21:25], "little")
        return ((bits & 0x3fff) + 1, ((bits >> 14) & 0x3fff) + 1)
    if chunk == b"VP8X":
        return (int.from_bytes(data[24:27], "little") + 1,
                int.from_bytes(data[27:30], "little") + 1)
    raise ValueError("unsupported WebP image encoding")


def verify(root: Path = ROOT) -> dict:
    checked = []
    root = root.resolve()
    for filename in MANIFESTS:
        path = root / "reports/collection-images" / filename
        metadata = json.loads(path.read_text(encoding="utf-8"))
        if metadata.get("publishable") is not False:
            raise ValueError(f"{filename}: candidate must not be publishable")
        if metadata.get("editorialApproval") is not False:
            raise ValueError(f"{filename}: candidate lacks explicit unapproved editorial status")
        if metadata.get("imageKind") != "illustration":
            raise ValueError(f"{filename}: imageKind must accurately disclose illustration")
        if not isinstance(metadata.get("rightsBasis"), str) or not metadata["rightsBasis"].strip():
            raise ValueError(f"{filename}: illustration provenance/rightsBasis missing")
        if metadata.get("sourcePhotoNotReproduced") is not True:
            raise ValueError(f"{filename}: must disclose no archival source photo was reproduced")
        if not metadata.get("sourcePage") and not metadata.get("visualReferences"):
            raise ValueError(f"{filename}: visual evidence/sourcePage missing")
        if "/candidates/" in str(metadata.get("canonicalCurrentAsset", "")):
            raise ValueError(f"{filename}: canonical image must never be a staged candidate")
        if metadata.get("stagingStatus") != "STAGED_BINARY_IN_GITHUB_NOT_PUBLISHED":
            raise ValueError(f"{filename}: staging status must be unpublished")
        relative = metadata.get("stagedAssetPath", "")
        if not isinstance(relative, str) or not relative.startswith(PREFIXES):
            raise ValueError(f"{filename}: candidate path outside allowed staging directories")
        if not relative.endswith("/" + metadata["candidateFilename"]):
            raise ValueError(f"{filename}: candidate filename mismatch")
        binary = (root / relative).resolve()
        if not binary.is_relative_to(root) or not binary.is_file():
            raise ValueError(f"{filename}: file missing or path escapes repository")
        data = binary.read_bytes()
        if len(data) != metadata.get("stagedBytes"):
            raise ValueError(f"{filename}: byte size mismatch")
        if hashlib.sha256(data).hexdigest() != metadata.get("candidateSha256"):
            raise ValueError(f"{filename}: SHA-256 mismatch")
        git_bytes = b"blob " + str(len(data)).encode() + b"\0" + data
        if hashlib.sha1(git_bytes).hexdigest() != metadata.get("gitBlobSha"):
            raise ValueError(f"{filename}: Git blob SHA mismatch")
        if image_size(data) != (metadata.get("candidateWidth"), metadata.get("candidateHeight")):
            raise ValueError(f"{filename}: image dimensions mismatch")
        checked.append({
            "asset": metadata["asset"],
            "path": relative,
            "bytes": len(data),
            "width": metadata["candidateWidth"],
            "height": metadata["candidateHeight"],
            "published": False
        })
    return {
        "status": "BINARY_INTEGRITY_PASS_EDITORIAL_REVIEW_PENDING",
        "files": checked,
        "count": len(checked),
        "published": False
    }


if __name__ == "__main__":
    try:
        result = verify()
        print(json.dumps(result, ensure_ascii=False, indent=2))
    except (OSError, KeyError, ValueError, TypeError) as exc:
        print(f"COLLECTION CANDIDATE CHECK FAILED: {exc}", file=sys.stderr)
        sys.exit(1)
