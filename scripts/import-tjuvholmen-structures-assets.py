#!/usr/bin/env python3
"""Import three source-verified Wikimedia Commons Tjuvholmen photos.

Produces immutable local source JPEGs and uncropped sharp WebP previews with
softly blurred letterbox backgrounds. Run only for PR #7269 in its own branch.
This does NOT publish Structures in the app or grant editorial approval.
"""
import hashlib
import io
import json
from pathlib import Path
import time
from urllib.error import HTTPError, URLError
from urllib.parse import quote
from urllib.request import Request, urlopen

from PIL import Image, ImageFilter, ImageOps

ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT / "reports/place-production/tjuvholmen-structures-source-candidates-20261112.json"
SOURCE_DIRECTORY = ROOT / "bilder/kort/structures/source"
OUTPUT_DIRECTORY = ROOT / "bilder/kort/structures"
SOURCES = {
    "tjuvtitten": ("tjuvtitten_2012_hoifodt.jpg", (900, 1200)),
    "tjuvholmen_bystrand": ("tjuvholmen_bystrand_2013_hoifodt.jpg", (900, 520)),
    "skulpturparken_skjaeret": ("skulpturparken_skjaeret_2012_hoifodt.jpg", (900, 520)),
}
USER_AGENT = "HistoryGo educational source-image import (Wikimedia Commons attribution retained; Python urllib)"


def sha256(data):
    return hashlib.sha256(data).hexdigest()


def fetch_source(title):
    filename = title.replace(" ", "_")
    md5 = hashlib.md5(filename.encode("utf-8")).hexdigest()
    folder = f"{md5[0]}/{md5[:2]}"
    quoted = quote(filename)
    original = f"https://upload.wikimedia.org/wikipedia/commons/{folder}/{quoted}"
    preview = f"https://thumb.wikimedia.org/wikipedia/commons/thumb/{folder}/{quoted}/960px-{quoted}"
    errors = []
    for kind, url, retries in (("original", original, 2), ("commons_960_preview", preview, 3)):
        for attempt in range(retries):
            try:
                request = Request(url, headers={
                    "User-Agent": "Mozilla/5.0 (compatible; HistoryGo educational image provenance archive)",
                    "Accept": "image/jpeg",
                })
                with urlopen(request, timeout=45) as response:
                    data = response.read(12_000_001)
                if len(data) > 12_000_000 or not data.startswith(b"\xff\xd8"):
                    raise RuntimeError(f"Not a bounded valid JPEG response for {title}")
                return url, data, kind
            except (HTTPError, URLError, TimeoutError) as exc:
                errors.append(f"{kind}/{attempt + 1}: {exc}")
                print(f"{title}: {errors[-1]}", flush=True)
                time.sleep(2 * (attempt + 1))
    raise RuntimeError(f"No Commons byte source downloaded for {title}: {'; '.join(errors)}")


def uncropped_webp(jpeg_data, size):
    with Image.open(io.BytesIO(jpeg_data)) as raw:
        raw.load()
        if raw.format != "JPEG":
            raise ValueError("Expected an actual source JPEG")
        src = ImageOps.exif_transpose(raw).convert("RGB")
    background = ImageOps.fit(src, size, method=Image.Resampling.LANCZOS).filter(
        ImageFilter.GaussianBlur(22)
    )
    foreground = ImageOps.contain(src, size, method=Image.Resampling.LANCZOS)
    left = (size[0] - foreground.width) // 2
    top = (size[1] - foreground.height) // 2
    background.paste(foreground, (left, top))
    output = io.BytesIO()
    background.save(output, format="WEBP", quality=88, method=6)
    return output.getvalue(), src.size


def main():
    SOURCE_DIRECTORY.mkdir(parents=True, exist_ok=True)
    OUTPUT_DIRECTORY.mkdir(parents=True, exist_ok=True)
    manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
    if manifest.get("place_id") != "tjuvholmen" or len(manifest.get("candidates", [])) != 3:
        raise ValueError("Unexpected candidate manifest shape")
    found = set()
    for candidate in manifest["candidates"]:
        id_ = candidate["id"]
        if id_ not in SOURCES or id_ in found:
            raise ValueError(f"Unknown/duplicate candidate: {id_}")
        found.add(id_)
        source_name, dimensions = SOURCES[id_]
        commons_title = candidate["photo_file"]
        source_url, source_bytes, source_kind = fetch_source(commons_title)
        webp_bytes, source_dimensions = uncropped_webp(source_bytes, dimensions)
        if source_kind == "original" and list(source_dimensions) != candidate["photo_dimensions"]:
            raise ValueError(
                f"Unexpected source dimensions for {id_}: {source_dimensions} "
                f"vs {candidate['photo_dimensions']}"
            )
        source_path = SOURCE_DIRECTORY / (source_name if source_kind == "original" else source_name.replace(".jpg", "_commons_960_preview.jpg"))
        webp_path = ROOT / candidate["planned_asset"]
        if source_path.exists() and source_path.read_bytes() != source_bytes:
            raise ValueError(f"Existing source drift: {source_path}")
        if webp_path.exists() and webp_path.read_bytes() != webp_bytes:
            raise ValueError(f"Existing output drift: {webp_path}")
        source_path.write_bytes(source_bytes)
        webp_path.write_bytes(webp_bytes)
        with Image.open(webp_path) as image:
            if image.format != "WEBP" or image.size != dimensions:
                raise ValueError(f"Bad WebP output for {id_}")
        candidate.update(
            source_asset=source_url,
            source_local_path=source_path.relative_to(ROOT).as_posix(),
            source_asset_kind=source_kind,
            source_is_full_original=(source_kind == "original"),
            source_dimensions_actual=list(source_dimensions),
            photo_sha256=sha256(source_bytes),
            webp_sha256=sha256(webp_bytes),
            webp_dimensions=list(dimensions),
            photo_review_status="SOURCE_AND_BINARY_VERIFIED_PENDING_VISUAL_AND_COLLECTION_REVIEW",
            original_file_pending=(source_kind != "original"),
            transformation="Original JPEG preserved byte-for-byte; EXIF orientation respected; complete sharp photo fitted without cropping over a blurred background plate.",
        )
        print(
            f"IMPORTED {id_} {source_kind}: JPEG={len(source_bytes)} SHA256={sha256(source_bytes)} "
            f"WebP={len(webp_bytes)} SHA256={sha256(webp_bytes)}; {dimensions}",
            flush=True,
        )
    if found != set(SOURCES):
        raise ValueError("Incomplete candidate import")
    manifest["status"] = "local_commons_source_bytes_and_webps_verified_originals_may_be_pending"
    MANIFEST.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
