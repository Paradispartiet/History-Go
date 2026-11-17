#!/usr/bin/env python3
"""Fetch a source-verified Freiaparken photo for *review artifact only*.

Never edits canonical data, branches, or public image directories. Rights in
sculptures / third-party artworks remain unreviewed even when this check passes.
"""
from __future__ import annotations

import argparse
import hashlib
import io
import json
from pathlib import Path
import urllib.request

from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT / "reports/collection-images/freiaparken-photo-2024-commons-candidate.json"

def import_for_review(manifest: dict, directory: Path) -> dict:
    if manifest.get("publishable") is not False or manifest.get("editorialApproval") is not False:
        raise ValueError("photo must remain unapproved")
    if manifest.get("reviewStatus") != "SOURCE_AND_IMAGE_VISUALLY_VERIFIED_BINARY_NOT_STAGED":
        raise ValueError("expected source-only candidate, not production")
    url = manifest["originalFileUrl"]
    if not url.startswith("https://upload.wikimedia.org/wikipedia/commons/"):
        raise ValueError("source URL outside Wikimedia Commons original uploads")
    req = urllib.request.Request(url, headers={
        "User-Agent": "HistoryGo-CollectionImageReview/1.0 (source verification; GitHub Actions)",
        "Accept": "image/jpeg",
    })
    with urllib.request.urlopen(req, timeout=60) as response:
        if response.geturl() != url:
            raise ValueError("unexpected source redirect: "+response.geturl())
        payload = response.read(8_000_001)
    if len(payload) > 8_000_000:
        raise ValueError("source image exceeds review size limit")
    digest = hashlib.sha1(payload).hexdigest()
    if digest != manifest["sourceArchiveSha1"] or len(payload) != manifest["sourceArchiveBytes"]:
        raise ValueError(f"source original mismatch: sha1={digest}, bytes={len(payload)}")
    if not payload.startswith(b"\xff\xd8\xff"):
        raise ValueError("source is not JPEG")
    with Image.open(io.BytesIO(payload)) as image:
        if image.format != "JPEG":
            raise ValueError("image decoder reports non-JPEG source")
        original_dimensions = list(image.size)
        if original_dimensions != [manifest["sourceWidth"],manifest["sourceHeight"]]:
            raise ValueError(f"original dimension mismatch: {original_dimensions}")
        display = ImageOps.exif_transpose(image).convert("RGB")
        target=(900,600)
        thumb = ImageOps.contain(display,target,method=Image.Resampling.LANCZOS)
        canvas = Image.new("RGB",target,color=(21,33,43))
        canvas.paste(thumb,((target[0]-thumb.width)//2,(target[1]-thumb.height)//2))
    directory.mkdir(parents=True,exist_ok=True)
    original = directory/"freiaparken_original_helge_hoifodt_2024.jpg"
    derivative = directory/"freiaparken_basseng_foto_2024_UNAPPROVED_review.webp"
    if original.exists() or derivative.exists():
        raise ValueError("refusing overwrite of review output")
    original.write_bytes(payload)
    canvas.save(derivative,format="WEBP",quality=88,method=6)
    output={
        "status":"SOURCE_INTEGRITY_PASS_RIGHTS_AND_EDITORIAL_PENDING",
        "sourcePage":manifest["originalFileSource"],
        "photographer":manifest["photographer"],
        "license":manifest["license"],
        "licenseUrl":manifest["licenseUrl"],
        "sourceOriginalSha1":digest,
        "sourceOriginalSha256":hashlib.sha256(payload).hexdigest(),
        "derivativeSha256":hashlib.sha256(derivative.read_bytes()).hexdigest(),
        "sourcePixels":original_dimensions,
        "derivativePixels":list(canvas.size),
        "processing":"EXIF-transpose + ImageOps.contain into 900x600 matte; no crop",
        "imageKind":"photograph",
        "rightsForDepictedSculptures":"NOT_CLEARED",
        "publishable":False,
        "editorialApproval":False,
        "productionAssetChanged":False,
    }
    (directory/"review_provenance.json").write_text(json.dumps(output,ensure_ascii=False,indent=2)+"\n",encoding="utf8")
    return output

def main() -> None:
    parser=argparse.ArgumentParser()
    parser.add_argument("--out",type=Path,default=ROOT/"artifacts/freiaparken-photo-source-review")
    args=parser.parse_args()
    manifest=json.loads(MANIFEST.read_text(encoding="utf8"))
    print(json.dumps(import_for_review(manifest,args.out),ensure_ascii=False,indent=2))

if __name__=="__main__":
    main()
