#!/usr/bin/env python3
"""Permanently archive the 16 checked science v6 visual candidates on review branch.
Never write active underbadges, v5 files, Norwegian originals, or map assets.
"""
import hashlib
import json
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "out/vitenskap-v6-typography"
DEST = ROOT / "bilder/merker/vitenskap/kandidater"
MANIFEST = ROOT / "data/badges/vitenskap_v6_typography_candidates_20261113.json"


def checksum(data):
    return {
        "bytes": len(data),
        "sha256": hashlib.sha256(data).hexdigest(),
        "gitBlobSha": hashlib.sha1(
            b"blob " + str(len(data)).encode("ascii") + b"\0" + data
        ).hexdigest(),
    }


def preserve_and_write(source, destination, expected):
    data = source.read_bytes()
    actual = checksum(data)
    for key in ("bytes", "sha256", "gitBlobSha"):
        assert actual[key] == expected[key], (source, key)
    if destination.exists():
        assert destination.read_bytes() == data, f"Refuse to overwrite {destination}"
    else:
        destination.parent.mkdir(parents=True, exist_ok=True)
        destination.write_bytes(data)
    return actual


def main():
    v6 = json.loads((SOURCE / "manifest.json").read_text(encoding="utf8"))
    active = json.loads((ROOT / "data/badges/vitenskap.json").read_text(encoding="utf8"))
    assert v6["status"] == "16_typography_v6_candidates_unapproved_nonactive"
    assert v6["oldBadgeFilesPreserved"] is True
    assert v6["activeRegisterUnchanged"] is True
    assert v6["norwegianV2OriginalsPreserved"] is True
    assert len(v6["items"]) == 16
    assert len(active["subBadgeImages"]) == 16
    assert not MANIFEST.exists(), "Refuse to replace an existing revision manifest"
    unique = set()
    rows = []
    for item in v6["items"]:
        key = (item["id"], item["locale"])
        assert key not in unique
        unique.add(key)
        assert item["status"] == "v6_unapproved_nonactive"
        assert item["locale"] in ("en", "es", "pt", "fr")
        assert item["alphaBeforeEncodingIdentical"] is True
        assert item["lowerArtBeforeEncodingIdentical"] is True
        assert " ".join(item["split"]) == item["title"]
        assert item["footer"]
        out_path = (DEST / "revisjoner" / item["locale"] /
                    f'{item["id"]}-v6-two-line.webp')
        assert str(out_path.relative_to(ROOT)) not in active["subBadgeImages"].values()
        raw = SOURCE / item["previewFile"]
        assert raw.resolve().is_relative_to(SOURCE.resolve())
        with Image.open(raw) as image:
            assert image.size == (1024, 1024) and image.mode == "RGBA"
        preserve_and_write(raw, out_path, item)
        rows.append({
            **item,
            "path": str(out_path.relative_to(ROOT)),
            "status": "stored_v6_candidate_unapproved_nonactive",
        })
    assert len(unique) == 16
    review_source = SOURCE / v6["sheet"]
    review_path = DEST / "contact-sheet-v6-larger-typography.jpg"
    sheet_checksum = checksum(review_source.read_bytes())
    preserve_and_write(review_source, review_path, sheet_checksum)
    report = {
        "schemaVersion": 1,
        "categoryId": "vitenskap",
        "status": "16_v6_typography_artworks_archived_unapproved_nonactive",
        "noActiveBadgeChanged": True,
        "visualSignoffRequired": True,
        "norwegianSourcesAndV5ArchivedOriginalsPreserved": True,
        "mapAndPlaceCardUnchanged": True,
        "completeParentCategoryNameInEachArtwork": True,
        "contactSheet": str(review_path.relative_to(ROOT)),
        "contactSheetIntegrity": sheet_checksum,
        "items": rows,
    }
    MANIFEST.parent.mkdir(parents=True, exist_ok=True)
    MANIFEST.write_text(json.dumps(report, ensure_ascii=False, indent=2)+"\n", encoding="utf8")
    print("Archived 16 complete-label v6 science candidates and contact sheet. Active badges unchanged.")


if __name__ == "__main__":
    main()
