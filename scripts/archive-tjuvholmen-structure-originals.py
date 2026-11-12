#!/usr/bin/env python3
"""One-shot, rate-limit-respecting Wikimedia originals audit for Tjuvholmen.

Only archives verifiably exact upstream JPEG originals. It NEVER replaces the
published WebP or its 960px-preview provenance, and NEVER clears vFerdig.
"""
from __future__ import annotations
from hashlib import md5, sha256
from io import BytesIO
import json
from pathlib import Path
from urllib.parse import quote
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT / "reports/place-production/tjuvholmen-structures-source-candidates-20261112.json"
REPORT = ROOT / "reports/place-production/tjuvholmen-structure-originals-retrieval-20261112.json"
DEST = ROOT / "bilder/kort/structures/source"
MAX_BYTES = 15_000_000
UA = "HistoryGo/1.0 (educational image provenance check; respects Wikimedia rate limits)"
def save_json(p, obj):
    p.write_text(json.dumps(obj, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

def main():
    manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
    if manifest.get("place_id") != "tjuvholmen" or len(manifest.get("candidates", [])) != 3:
        raise RuntimeError("Unexpected manifest; refuse to archive")
    DEST.mkdir(parents=True, exist_ok=True)
    findings = []
    changed = False
    for item in manifest["candidates"]:
        filename = item["photo_file"].replace(" ", "_")
        hash_ = md5(filename.encode("utf-8")).hexdigest()
        url = f"https://upload.wikimedia.org/wikipedia/commons/{hash_[0]}/{hash_[:2]}/{quote(filename)}"
        dest = DEST / f'{item["id"]}_full_original.jpg'
        result = {"id": item["id"], "commons_file": item["photo_file"], "source_url": url}
        try:
            if dest.exists():
                content = dest.read_bytes()
            else:
                req = Request(url, headers={"User-Agent": UA, "Accept": "image/jpeg"})
                with urlopen(req, timeout=30) as response:
                    content = response.read(MAX_BYTES + 1)
            if len(content) > MAX_BYTES or not content.startswith(bytes.fromhex("ffd8")):
                raise ValueError("Non-JPEG or unexpectedly large response")
            with Image.open(BytesIO(content)) as im:
                im.load()
                if im.format != "JPEG" or list(im.size) != item["photo_dimensions"]:
                    raise ValueError(f"Identity/dimension mismatch: {im.size}")
            digest = sha256(content).hexdigest()
            if not dest.exists():
                dest.write_bytes(content)
            item["original_archive"] = {
                "source_url": url, "source_page": item["photo_source_page"],
                "path": dest.relative_to(ROOT).as_posix(),
                "sha256": digest, "bytes": len(content),
                "dimensions": item["photo_dimensions"], "source_kind": "commons_full_original"
            }
            item["original_file_pending"] = False
            result.update(status="VERIFIED_ARCHIVED", size_bytes=len(content), sha256=digest)
            changed = True
        except HTTPError as exc:
            if item.get("original_archive") and not dest.exists():
                item.pop("original_archive", None)
                item["original_file_pending"] = True
                changed = True
            result.update(status="NOT_ARCHIVED", reason=f"HTTP {exc.code}")
            if exc.code == 429:
                result["policy"] = "Rate limited; no retry or alternate-host bypass"
        except (URLError, TimeoutError, ValueError, OSError) as exc:
            if item.get("original_archive") and not dest.exists():
                item.pop("original_archive", None)
                item["original_file_pending"] = True
                changed = True
            result.update(status="NOT_ARCHIVED", reason=str(exc)[:240])
        findings.append(result)
        print(json.dumps(result, ensure_ascii=False), flush=True)
    n = sum(bool(item.get("original_archive")) and (ROOT / item["original_archive"]["path"]).exists() for item in manifest["candidates"])
    if changed:
        save_json(MANIFEST, manifest)
    save_json(REPORT, {
        "schema": "history_go_tjuvholmen_structure_originals_archive_audit_v1",
        "place_id": "tjuvholmen", "date": "2026-11-12",
        "attempted": len(findings), "archived_full_originals": n,
        "note": "Preview/WebP assets unchanged; People and Objects rights unchanged; vFerdig remains BLOCKED.",
        "results": findings
    })
    print(f"ORIGINAL_ARCHIVE_RESULT {n}/3; no published media changed", flush=True)

if __name__ == "__main__":
    main()
