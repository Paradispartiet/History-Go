#!/usr/bin/env python3
"""Verify three manually reviewed Commons image pairs and promote to PR #6579 only.

Source is the reviewed recomposed artifact from the repository's dedicated staging
workflow. This is *not* a v1 or browser-QA certification. Y-blokka excluded.
Default: preflight only. Pass --apply to modify six canonical files.
"""
import argparse
import hashlib
import json
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
STAGE = ROOT / "reports/place-production/media-staging/oslo-sentrum-politikk"
DEST = ROOT / "bilder/places"
PLACES = ROOT / "data/places/politikk/oslo/places_politikk"

# SHA-256 are pinned to specific reviewed raw originals and *visual* output bytes.
# If a new crop is chosen, redo visual review and update the hashes deliberately.
REVIEWED = {
    "hoyesteretts_hus": {
        "original_sha256": "99555b4c0b347e497e34c7fbddebde8464a2d62bd5dc9728bdbaa8f3ee6d3148",
        "image_sha256": "96993f4ee9bc4b7f7d1dfc7c4c7bc06b08cb741a6acd48b392220723dc03eead",
        "front_sha256": "6c04698951ba73922df71268a56dbdbe044c54fdd380f8d043a47530b8acab3c",
        "source_page": "https://commons.wikimedia.org/wiki/File:Norges_H%C3%B8yesterett_Supreme_Court_of_Norway.jpg",
        "creator": "Helge Høifødt", "license": "CC BY-SA 4.0",
        "license_url": "https://creativecommons.org/licenses/by-sa/4.0/",
        "date": "2008-08-03", "focus_x": 0.5,
    },
    "folkets_hus_oslo": {
        "original_sha256": "a70ae0bea39d6142c94c2bc2ae3c1a91ed3d2c7a86bba836c4897f05993ab6d3",
        "image_sha256": "dc4ca30e43da41bf359102cf5e870e61ea0c74f4be9f03902c61183e008eb579",
        "front_sha256": "cb18ed97fe216fbbdf142bd5a104a36b21456c38623f5a82c735f84c1ffe8dcd",
        "source_page": "https://commons.wikimedia.org/wiki/File:Folkets_Hus_Youngstorget.JPG",
        "creator": "Kjetil Ree", "license": "CC BY-SA 2.5",
        "license_url": "https://creativecommons.org/licenses/by-sa/2.5/",
        "date": "2006-08-16", "focus_x": 0.92,
    },
    "hoyblokka": {
        "original_sha256": "1212b976563568ddc1198686e3dfb3d5d53a1a3a00436bdcc416b7f46e5d7eb9",
        "image_sha256": "74b263e3b1a791c380cf607b049319de45ec2b03e19c983332f84484fcd40a6b",
        "front_sha256": "4084f1d70442072e6e1634bb2f6a5e60c09430c0f207d532bad1b7df3277c957",
        "source_page": "https://commons.wikimedia.org/wiki/File:Regjeringskvartalet_H-blokk_Johan_Nygaardsvolds_plass_Oslo_Norway_(2008.07.01).jpg",
        "creator": "Geir Hval", "license": "CC BY-SA 4.0",
        "license_url": "https://creativecommons.org/licenses/by-sa/4.0/",
        "date": "2008-07-01", "focus_x": 0.93,
        "historical_caption": "Høyblokka i 2008, før terrorangrepet i 2011 og senere rehabilitering.",
    },
}


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def fail(message):
    raise SystemExit("Promotion refused: " + message)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--apply", action="store_true", help="After preflight, copy only the six reviewed image outputs and edit only the three owned Place JSON files.")
    args = parser.parse_args()

    expected = []
    for place, record in REVIEWED.items():
        folder = STAGE / place
        meta = folder / "staging-metadata.json"
        if not meta.is_file():
            fail(f"Missing staging metadata: {meta}")
        m = json.loads(meta.read_text(encoding="utf-8"))
        for key, value in [
            ("place_id", place), ("status", "STAGED_NOT_PUBLISHED_REQUIRES_HUMAN_QA"),
            ("source_page", record["source_page"]), ("creator", record["creator"]),
            ("license", record["license"]), ("license_url", record["license_url"]),
            ("photo_date", record["date"]), ("original_sha256", record["original_sha256"]),
        ]:
            if m.get(key) != value:
                fail(f"{place} metadata mismatch {key}: {m.get(key)!r} != {value!r}")
        if bool(m.get("historical_only")) != (place == "hoyblokka"):
            fail(f"{place} historical provenance mismatch")
        if set(m.get("assets", {})) != {"image", "frontImage"}:
            fail(f"{place} unexpected staged roles: {list(m.get('assets', {}))}")
        if str(record["focus_x"]) not in str(m.get("transformation", "")):
            fail(f"{place} crop focus not documented")
        for role, suffix, dimensions, sha in (
            ("image", ".webp", [1400, 900], record["image_sha256"]),
            ("frontImage", "_front_portrait.webp", [900, 1350], record["front_sha256"]),
        ):
            src = folder / (place + suffix)
            target = DEST / (place + suffix)
            if not src.is_file() or digest(src) != sha:
                fail(f"{place} {role} missing/modified compared to reviewed bytes")
            if m["assets"][role]["sha256"] != sha or m["assets"][role]["dimensions"] != dimensions:
                fail(f"{place} {role} staged metadata inconsistent")
            if target.exists():
                fail(f"Would overwrite an existing canonical image: {target}")
            expected.append((place, role, src, target, dimensions))
        p = PLACES / (place + ".json")
        obj = json.loads(p.read_text(encoding="utf-8"))
        if obj.get("id") != place or any(k in obj for k in ("image", "frontImage", "cardImage")):
            fail(f"{place} contains existing image fields or incorrect Place ID")

    print("PASS preflight: 3/3 originals, 6/6 exact image bytes; no pre-existing canonical targets.")
    if not args.apply:
        print("No files changed; --apply explicitly required.")
        return

    for place, record in REVIEWED.items():
        obj_path = PLACES / (place + ".json")
        obj = json.loads(obj_path.read_text(encoding="utf-8"))
        common = {
            "source": "wikimedia_commons",
            "sourcePage": record["source_page"],
            "creator": record["creator"],
            "credit": record["creator"] + " / Wikimedia Commons",
            "license": record["license"],
            "licenseUrl": record["license_url"],
            "assetType": "documentary_photo",
            "date": record["date"],
            "verifiedAt": "2026-10-23",
        }
        for role, suffix, dimensions in (
            ("image", ".webp", "1400x900"),
            ("frontImage", "_front_portrait.webp", "900x1350"),
        ):
            fname = place + suffix
            source = STAGE / place / fname
            target = DEST / fname
            target.parent.mkdir(parents=True, exist_ok=True)
            shutil.copyfile(source, target)
            obj[role] = "bilder/places/" + fname
            metadata = {
                **common,
                "transformation": f"Auto-orientert; redaksjonelt vurdert utsnitt (x={record['focus_x']}, y=0.5); WebP-normalisert.",
                "outputDimensions": dimensions,
            }
            if place == "hoyblokka":
                metadata["historicalCaption"] = record["historical_caption"]
                metadata["historicalOnly"] = True
            if role == "frontImage":
                metadata.update({"orientation": "portrait", "aspectRatio": "2:3"})
                obj["frontImageMeta"] = metadata
            else:
                obj["imageMeta"] = metadata
        obj_path.write_text(json.dumps(obj, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
        print(f"Promoted media + metadata for {place} (v1/browser QA still pending)")

    print("No cardImage, Y-blokka, other Oslo Place, quiz or publishing status modified.")


if __name__ == "__main__":
    main()
