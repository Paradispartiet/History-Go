#!/usr/bin/env python3
"""Stage locally obtained Tøyen archive photos for review, never for publication.

A local image has NOT thereby been authenticated as the exact catalog image.
Only a human archive/source comparison can establish that. No network access.
"""
from __future__ import annotations

import argparse
import hashlib
import io
import json
from pathlib import Path

from PIL import Image, ImageOps, UnidentifiedImageError

ROOT = Path(__file__).resolve().parents[1]
SOURCES = {
    "1916-apparatpult": (
        "toyen-trafo-apparatpult-1916-photo-source.json",
        "A-20138/Ua/0004/054",
    ),
    "1918-transformatorkjerne": (
        "toyen-trafo-transformatorkjerne-1918-photo-source.json",
        "A-20138/Ua/0004/091",
    ),
}
SOURCE_CATALOG = {
    "A-20138/Ua/0004/054": (
        "Tøyen transformatorstasjon, Apparatpult", None
    ),
    "A-20138/Ua/0004/091": (
        "Tøyen transformatorstasjon, kjerne for transformatormotor 6250 k.v.a.",
        "person viser fram motoren",
    ),
}
MAX_BYTES = 25_000_000
MAX_PIXELS = 40_000_000
MAX_SIDE = 20_000
ARCHIVE_ASSETS = {
    "A-20138/Ua/0004/054": ("toyen_trafo_apparatpult_1916", 1916),
    "A-20138/Ua/0004/091": ("toyen_trafo_transformatorkjerne_1918", 1918),
}
ALLOWED_FORMATS = {"JPEG", "PNG", "TIFF"}


def stage_for_review(source: dict, archive_id: str, input_file: Path,
                     output_dir: Path, repo_root: Path = ROOT) -> dict:
    """Copy independently obtained input into a noncanonical review folder.

    Binary hashes/dimensions are measurements of the supplied *local* file,
    NOT proof that it came from Oslobilder or matches the catalog description.
    """
    if (source.get("archivalIdentifier") != archive_id
            or source.get("sourcePage") != "https://oslobilder.no/BAR/" + archive_id
            or source.get("placeId") != "toyen_trafo"
            or source.get("collection") != "objects"
            or source.get("publishable") is not False
            or source.get("editorialApproval") is not False):
        raise ValueError("unexpected source identity or publication state")
    if archive_id not in ARCHIVE_ASSETS:
        raise ValueError("unknown Tøyen archival identifier")
    expected_asset, expected_year = ARCHIVE_ASSETS[archive_id]
    if source.get("asset") != expected_asset or source.get("recordedYear") != expected_year:
        raise ValueError("asset identity and recorded year must match exact archive number")
    if (source.get("archivalCatalogTitle"), source.get("archivalCatalogMotif")) != SOURCE_CATALOG[archive_id]:
        raise ValueError("catalog title/motif mismatch for this archive item")
    expected_canonical = f'bilder/objects/{source["asset"]}_illustrasjon.svg'
    if source.get("canonicalCurrentAsset") != expected_canonical:
        raise ValueError("canonical image path is not unchanged")
    if source.get("sourceOriginalDownloaded") is not False or source.get("stagedAssetPath") is not None:
        raise ValueError("input manifest must still be source-only")
    if not input_file.is_file():
        raise ValueError("locally supplied archive image is missing")
    size = input_file.stat().st_size
    if size <= 0 or size > MAX_BYTES:
        raise ValueError("image file missing or too large")
    out = output_dir.resolve()
    repository = repo_root.resolve()
    permitted = (repository / "artifacts" / "toyen-archive-review").resolve()
    # Other artifacts/ directories might be tracked; only this review folder is git-ignored.
    # Reject paths outside the repository, symlink escapes and the review root itself.
    if (not permitted.is_relative_to(repository)
            or not out.is_relative_to(permitted) or out == permitted):
        raise ValueError("review output must be a subfolder of artifacts/toyen-archive-review/")
    if out.exists():
        raise FileExistsError("review output exists; refusing overwrite")
    payload = input_file.read_bytes()
    try:
        with Image.open(io.BytesIO(payload)) as im:
            im.verify()
        with Image.open(io.BytesIO(payload)) as im:
            if im.format not in ALLOWED_FORMATS:
                raise ValueError("not a supported unmodified archival image format")
            fmt = im.format
            original_dimensions = list(im.size)
            width, height = original_dimensions
            if width <= 0 or height <= 0:
                raise ValueError("invalid archive image dimensions")
            if width > MAX_SIDE or height > MAX_SIDE or width * height > MAX_PIXELS:
                raise ValueError("archive image exceeds safe pixel limits")
            display = ImageOps.exif_transpose(im).convert("RGB")
    except (UnidentifiedImageError, OSError, ValueError) as exc:
        raise ValueError("not a valid JPEG, PNG or TIFF source image") from exc
    target = (900, 600)
    scaled = ImageOps.contain(display, target, method=Image.Resampling.LANCZOS)
    matte = Image.new("RGB", target, (21, 33, 43))
    matte.paste(scaled, ((target[0] - scaled.width) // 2,
                         (target[1] - scaled.height) // 2))
    out.mkdir(parents=True, exist_ok=False)
    suffix = {"JPEG": ".jpg", "PNG": ".png", "TIFF": ".tif"}[fmt]
    basename = source["asset"]
    source_path = out / f"{basename}_source_UNVERIFIED{suffix}"
    preview_path = out / f"{basename}_review_UNAPPROVED.webp"
    source_path.write_bytes(payload)
    matte.save(preview_path, format="WEBP", quality=90, method=6)
    receipt = {
        "status": "LOCAL_BYTES_MEASURED_SOURCE_IDENTITY_AND_EDITORIAL_PENDING",
        "claimedArchiveIdentifier": archive_id,
        "claimedSourcePage": source["sourcePage"],
        "catalogTitle": source["archivalCatalogTitle"],
        "catalogMotif": source.get("archivalCatalogMotif"),
        "sourceIsAuthenticated": False,
        "sourceWasDownloadedByThisProgram": False,
        "visualCatalogComparisonDone": False,
        "rightsPolicyReviewedForTheseBytes": False,
        "photographerCreditVerifiedInPlaceCard": False,
        "sourceFile": source_path.name,
        "sourceFormat": fmt,
        "sourceBytes": len(payload),
        "sourceSha256": hashlib.sha256(payload).hexdigest(),
        "sourceDimensions": original_dimensions,
        "reviewWebpFile": preview_path.name,
        "reviewWebpSha256": hashlib.sha256(preview_path.read_bytes()).hexdigest(),
        "reviewWebpDimensions": list(target),
        "processing": "EXIF transpose, contain without crop on 900x600 matte",
        "productionAssetChanged": False,
        "editorialApproval": False,
        "publishable": False,
    }
    (out / "review_receipt.json").write_text(
        json.dumps(receipt, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    return receipt


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--asset", choices=SOURCES, required=True)
    parser.add_argument("--original", type=Path, required=True,
                        help="Local file supplied by reviewer; not fetched or authenticated here")
    parser.add_argument("--out", type=Path, required=True,
                        help="New, unused subfolder of artifacts/toyen-archive-review/ (git-ignored)")
    args = parser.parse_args()
    manifest_name, archive_id = SOURCES[args.asset]
    source = json.loads((ROOT / "reports/collection-images" / manifest_name).read_text(encoding="utf8"))
    print(json.dumps(stage_for_review(source, archive_id, args.original, args.out), ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
