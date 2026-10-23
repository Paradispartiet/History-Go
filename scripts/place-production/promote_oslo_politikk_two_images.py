#!/usr/bin/env python3
"""Promote exactly two PR #6579 image pairs after pinned-byte verification.

Only run on branch research/oslo-sentrum-politikk-six-v1-20261023
after editorial inspection of the Commons originals and two crop roles.
Does not touch Oslo-bolk 04, cardImage, image manifests or publication status.
"""
import hashlib
import json
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
STAGE = ROOT / "reports/place-production/media-staging/oslo-sentrum-politikk"
DEST = ROOT / "bilder/places"
PLACES = ROOT / "data/places/politikk/oslo/places_politikk"
REVIEWED = {
    "hoyres_hus": {
        "original_sha256": "a1b00635df2aa336009c22ecc74b85ae7187694c64ee07db93a6b57857ebe72f",
        "image_sha256": "8984d5684af84471dbece7392c937e1443d3a92173444cfa0e1fa4ed35393bc5",
        "front_sha256": "b4dc4db14f9b9e638991069f3163f843d5c08f9a0f985a2767df69cd56960115",
        "source_page": "https://commons.wikimedia.org/wiki/File:H%C3%B8yres_Hus_Oslo.jpg",
        "creator": "Kjetil Ree",
        "license": "CC BY-SA 2.5",
        "license_url": "https://creativecommons.org/licenses/by-sa/2.5/",
        "date": "2007-06-18",
    },
    "victoria_terrasse": {
        "original_sha256": "6ac583b93e3098b5d41a6aa68b2f7382ed30ddf7042e86ef0eb3faf949540aba",
        "image_sha256": "dffa6b21e1aa318fe21f74b1acaf5d1c848fdce4dcc9b6eff797acafd7beab25",
        "front_sha256": "212c91d7ea491f6dd19643488a723432234008f3aa2fce8956bce7bc201328c9",
        "source_page": "https://commons.wikimedia.org/wiki/File:Victoria_Terrasse_in_Oslo_Norway.jpg",
        "creator": "Leif Knutsen / Leifern",
        "license": "CC BY-SA 3.0",
        "license_url": "https://creativecommons.org/licenses/by-sa/3.0/",
        "date": "2008-08-22",
    },
}


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def main():
    # Fail before writing anything if one or more assets do not match the visual review.
    for place, source in REVIEWED.items():
        meta_path = STAGE / place / "staging-metadata.json"
        metadata = json.loads(meta_path.read_text(encoding="utf-8"))
        assert metadata["place_id"] == place
        assert metadata["status"] == "STAGED_NOT_PUBLISHED_REQUIRES_HUMAN_QA"
        assert metadata["source_page"] == source["source_page"]
        assert metadata["creator"] == source["creator"]
        assert metadata["license"] == source["license"]
        assert metadata["license_url"] == source["license_url"]
        assert metadata["original_sha256"] == source["original_sha256"]
        for role, target in (
            ("image", source["image_sha256"]),
            ("frontImage", source["front_sha256"]),
        ):
            binary_path = STAGE / place / (place + (".webp" if role == "image" else "_front_portrait.webp"))
            expected_size = [1400, 900] if role == "image" else [900, 1350]
            assert digest(binary_path) == target, (place, role, "unreviewed bytes")
            assert metadata["assets"][role]["sha256"] == target
            assert metadata["assets"][role]["dimensions"] == expected_size
        current_path = PLACES / (place + ".json")
        current = json.loads(current_path.read_text(encoding="utf-8"))
        assert current["id"] == place
        assert not any(key in current for key in ("image", "frontImage", "cardImage")), (
            place, "existing media require manual reconciliation"
        )
        for role, suffix in (("image", ".webp"), ("frontImage", "_front_portrait.webp")):
            out = DEST / (place + suffix)
            assert not out.exists(), f"Refuse to overwrite: {out}"

    DEST.mkdir(parents=True, exist_ok=True)
    for place, source in REVIEWED.items():
        p = PLACES / (place + ".json")
        obj = json.loads(p.read_text(encoding="utf-8"))
        common = {
            "source": "wikimedia_commons",
            "sourcePage": source["source_page"],
            "creator": source["creator"],
            "credit": source["creator"] + " / Wikimedia Commons",
            "license": source["license"],
            "licenseUrl": source["license_url"],
            "assetType": "documentary_photo",
            "date": source["date"],
            "verifiedAt": "2026-10-23",
        }
        for role, suffix, dimensions, sha in (
            ("image", ".webp", "1400x900", source["image_sha256"]),
            ("frontImage", "_front_portrait.webp", "900x1350", source["front_sha256"]),
        ):
            fname = place + suffix
            src = STAGE / place / fname
            target = DEST / fname
            shutil.copyfile(src, target)
            assert digest(target) == sha
            obj[role] = "bilder/places/" + fname
            transform = "Auto-orientert, manuelt vurdert midtutsnitt og WebP-normalisert."
            meta = {**common, "transformation": transform, "outputDimensions": dimensions}
            if role == "frontImage":
                meta.update({"orientation": "portrait", "aspectRatio": "2:3"})
                obj["frontImageMeta"] = meta
            else:
                obj["imageMeta"] = meta
        assert "cardImage" not in obj
        p.write_text(json.dumps(obj, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        print(f"PROMOTED (DRAFT, QA PENDING): {place}")
    print("Four verified binary assets staged in canonical paths; PR still draft, browser/CI checks remain.")


if __name__ == "__main__":
    main()
