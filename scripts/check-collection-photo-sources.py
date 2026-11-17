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


ARCHIVE_SOURCES = {
    "toyen-trafo-apparatpult-1916-photo-source.json": ("toyen_trafo_apparatpult_1916", "A-20138/Ua/0004/054", 1916),
    "toyen-trafo-transformatorkjerne-1918-photo-source.json": ("toyen_trafo_transformatorkjerne_1918", "A-20138/Ua/0004/091", 1918),
}
OSLO_POLICY="https://www.oslo.kommune.no/natur-kultur-og-fritid/byarkivet/oslobilder/pris-og-vilkar-ved-fotobestilling/"


def verify_oslo_archive_source(manifest: dict, root: Path, expected: tuple[str, str, int]) -> None:
    asset, archive_id, year = expected
    if manifest.get("placeId") != "toyen_trafo" or manifest.get("collection") != "objects":
        raise ValueError("unexpected archive candidate place or collection")
    if manifest.get("asset") != asset or manifest.get("archivalIdentifier") != archive_id or manifest.get("recordedYear") != year:
        raise ValueError("wrong archive asset identity/year")
    if manifest.get("archiveInstitution") != "Oslo byarkiv" or manifest.get("imageKind") != "photograph":
        raise ValueError("archive owner or photograph type incorrect")
    if not str(manifest.get("sourcePage", "")).startswith("https://oslobilder.no/") and not str(manifest.get("sourcePage", "")).startswith("https://www.oslobilder.no/"):
        raise ValueError("archive source must be an Oslobilder page")
    if not str(manifest.get("sourcePage")).endswith("/"+archive_id):
        raise ValueError("source page is not the identified photograph")
    if manifest.get("rightsPolicyUrl") != OSLO_POLICY or manifest.get("licenseUrl") != OSLO_POLICY:
        raise ValueError("rights policy does not point to Oslo kommune's actual terms")
    if manifest.get("license") != "usage_terms_oslo_byarkiv_downloadable_resolution":
        raise ValueError("do not invent a CC license for this archive photo")
    if manifest.get("photographer") != "Ukjent" or manifest.get("proposedCredit") != f"Foto: Ukjent / Oslo byarkiv, {archive_id}":
        raise ValueError("archive photographer/institution credit must match exact archival identifier")
    if manifest.get("publishable") is not False or manifest.get("editorialApproval") is not False:
        raise ValueError("unviewed archive image cannot be approved for publication")
    if manifest.get("sourceOriginalDownloaded") is not False or manifest.get("archivedPhotoPersonallyViewed") is not False:
        raise ValueError("archive photo must remain explicitly uninspected")
    if (manifest.get("sourceImageBytesSha256") is not None or manifest.get("sourceImageDimensions") is not None
            or manifest.get("stagedAssetPath") is not None or manifest.get("exactDownloadURL") is not None):
        raise ValueError("cannot claim image bytes, dimensions, download URL or staging before inspection")
    if manifest.get("reviewStatus") != "CATALOG_AND_RIGHTS_POLICY_VERIFIED_PHOTO_BYTES_NOT_INSPECTED":
        raise ValueError("source-only archive status changed without QA")
    if "/candidates/" in str(manifest.get("canonicalCurrentAsset","")):
        raise ValueError("canonical path must never be a candidate")
    if not manifest.get("reviewNeeded"):
        raise ValueError("review checklist required")


if __name__ == "__main__":
    payload = json.loads(SOURCE_MANIFEST.read_text(encoding="utf-8"))
    verify_photo_source(payload, ROOT)
    for name, expected in ARCHIVE_SOURCES.items():
        candidate = json.loads((ROOT / "reports/collection-images" / name).read_text(encoding="utf-8"))
        verify_oslo_archive_source(candidate, ROOT, expected)
    print("PHOTO_SOURCES_REVIEW_PASS_UNSTAGED: Freiaparken and two Tøyen archive photo candidates have grounded usage rules and no staged bytes")
