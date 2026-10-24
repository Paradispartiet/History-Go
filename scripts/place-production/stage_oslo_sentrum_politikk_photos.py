#!/usr/bin/env python3
"""Stage documented Commons photos for PR #6579 without publishing unreviewed assets.

Run on a machine with network access and Pillow:
  python -m pip install Pillow
  python scripts/place-production/stage_oslo_sentrum_politikk_photos.py --place hoyres_hus

Never copy staged outputs into canonical Place files until licenses, composition,
actual image bytes, credit and mobile/desktop rendering have been reviewed.
No cardImage is created: the current Place Production Checklist v2.6 forbids it.
Y-blokka can only be staged using the documented 2008 facade-only source with explicit --allow-architecture-only-yblokka. No Picasso/Nesjar artwork is authorized.
"""
import argparse
import hashlib
import io
import json
import time
from urllib.error import HTTPError
from pathlib import Path
from urllib.parse import quote
from urllib.request import Request, urlopen

try:
    from PIL import Image, ImageOps
except ImportError as exc:
    raise SystemExit("Pillow required. Install with: python -m pip install Pillow") from exc

# These are editorial candidates, not automatic legal or artistic approvals.
SOURCES = {
    "hoyesteretts_hus": {
        "filename": "Norges Høyesterett Supreme Court of Norway.jpg",
        "original_url": "https://upload.wikimedia.org/wikipedia/commons/0/0f/Norges_H%C3%B8yesterett_Supreme_Court_of_Norway.jpg",
        "size": (3557, 2276),
        "creator": "Helge Høifødt",
        "license": "CC BY-SA 4.0",
        "license_url": "https://creativecommons.org/licenses/by-sa/4.0/",
        "date": "2008-08-03",
    },
    "folkets_hus_oslo": {
        "filename": "Folkets Hus Youngstorget.JPG",
        "original_url": "https://upload.wikimedia.org/wikipedia/commons/1/1e/Folkets_Hus_Youngstorget.JPG",
        "size": (3072, 2304),
        "creator": "Kjetil Ree",
        "license": "CC BY-SA 2.5",
        "license_url": "https://creativecommons.org/licenses/by-sa/2.5/",
        "date": "2006-08-16",
    },
    "hoyres_hus": {
        "filename": "Høyres Hus Oslo.jpg",
        "size": (2304, 3072),
        "creator": "Kjetil Ree",
        "license": "CC BY-SA 2.5",
        "license_url": "https://creativecommons.org/licenses/by-sa/2.5/",
        "date": "2007-06-18",
    },
    "hoyblokka": {
        "filename": "Regjeringskvartalet H-blokk Johan Nygaardsvolds plass Oslo Norway (2008.07.01).jpg",
        "original_url": "https://upload.wikimedia.org/wikipedia/commons/0/0b/Regjeringskvartalet_H-blokk_Johan_Nygaardsvolds_plass_Oslo_Norway_%282008.07.01%29.jpg",
        "size": (3008, 2000),
        "creator": "Geir Hval",
        "license": "CC BY-SA 4.0",
        "license_url": "https://creativecommons.org/licenses/by-sa/4.0/",
        "date": "2008-07-01",
        "historical": True,
    },
    "y_blokka": {
        "filename": "Regjeringskvartalet Y-blokk R5 Johan Nygaardsvolds plass Oslo Norway (2008.07.01).jpg",
        "original_url": "https://upload.wikimedia.org/wikipedia/commons/5/54/Regjeringskvartalet_Y-blokk_R5_Johan_Nygaardsvolds_plass_Oslo_Norway_%282008.07.01%29.jpg",
        "size": (3008, 2000),
        "creator": "Geir Hval",
        "license": "CC BY-SA 4.0",
        "license_url": "https://creativecommons.org/licenses/by-sa/4.0/",
        "date": "2008-07-01",
        "historical": True,
        "architecture_only": True,
    },
    "victoria_terrasse": {
        "filename": "Victoria Terrasse in Oslo Norway.jpg",
        "size": (2000, 3008),
        "creator": "Leif Knutsen / Leifern",
        "license": "CC BY-SA 3.0",
        "license_url": "https://creativecommons.org/licenses/by-sa/3.0/",
        "date": "2008-08-22",
    },
}

ROLES = {
    "image": {"size": (1400, 900), "suffix": ".webp"},
    "frontImage": {"size": (900, 1350), "suffix": "_front_portrait.webp"},
}


def commons_page(filename):
    return "https://commons.wikimedia.org/wiki/File:" + quote(filename.replace(" ", "_"), safe="()")


def commons_download(filename):
    return "https://commons.wikimedia.org/wiki/Special:Redirect/file/" + quote(filename, safe="()")


def sha256(data):
    return hashlib.sha256(data).hexdigest()


def crop_to_ratio(img, target_size, focus_x, focus_y):
    """Retain the user-selected point of interest, with no upscaling."""
    w, h = img.size
    tw, th = target_size
    desired = tw / th
    if w / h > desired:
        crop_h = h
        crop_w = round(h * desired)
    else:
        crop_w = w
        crop_h = round(w / desired)
    if crop_w < tw or crop_h < th:
        raise ValueError("Source cannot make requested size without upscaling")
    left = round((w - crop_w) * focus_x)
    top = round((h - crop_h) * focus_y)
    return img.crop((left, top, left + crop_w, top + crop_h)).resize((tw, th), Image.Resampling.LANCZOS)


def load_original(place, record, source_dir):
    filename = record["filename"]
    if source_dir:
        candidate = source_dir / filename
        if not candidate.is_file():
            raise FileNotFoundError(f"Missing original: {candidate}")
        return candidate.read_bytes(), str(candidate)
    # Verified original URLs are documented at each Commons file page.
    # Direct origin requests avoid an extra Special:Redirect round-trip.
    url = record.get("original_url") or commons_download(filename)
    req = Request(url, headers={"User-Agent": "HistoryGoImageStaging/1.0 (editorial Commons credit in repo)"})
    for attempt in range(3):
        try:
            with urlopen(req, timeout=60) as response:
                final = response.geturl()
                if not final.startswith("https://upload.wikimedia.org/"):
                    raise ValueError(f"Unexpected image origin: {final}")
                data = response.read(30_000_001)
                if len(data) > 30_000_000:
                    raise ValueError("Original exceeds 30 MB")
                return data, final
        except HTTPError as exc:
            # Respect Wikimedia Retry-After without busy re-requesting.
            if exc.code not in (429, 503) or attempt == 2:
                raise
            retry_after = exc.headers.get("Retry-After")
            try:
                delay = max(30, min(180, int(retry_after))) if retry_after else 30 * (attempt + 1)
            except ValueError:
                delay = 30 * (attempt + 1)
            print(f"Temporarily limited (HTTP {exc.code}); pause {delay}s before attempt {attempt + 2}/3", flush=True)
            time.sleep(delay)
    raise RuntimeError("Unreachable")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--place", choices=sorted(SOURCES), action="append", required=True,
                        help="One or more scoped Place IDs; Y-blokka requires facade-only flag.")
    parser.add_argument("--source-dir", type=Path, help="Use downloaded Commons original files from this directory")
    parser.add_argument("--output-dir", type=Path, default=Path("reports/place-production/media-staging/oslo-sentrum-politikk"))
    parser.add_argument("--focus-x", type=float, default=0.5, help="Composition focus from 0.0 (left) to 1.0 (right)")
    parser.add_argument("--focus-y", type=float, default=0.5, help="Composition focus from 0.0 (top) to 1.0 (bottom)")
    parser.add_argument("--allow-historical-hoyblokka", action="store_true",
                        help="Stage a pre-2011 photo for historical illustration, NOT as current 2026 view")
    parser.add_argument("--allow-architecture-only-yblokka", action="store_true",
                        help="Stage reviewed 2008 building facade, no Picasso/Nesjar art; historical-only")
    parser.add_argument("--overwrite", action="store_true", help="Permit replacing staged files only")
    args = parser.parse_args()

    if not (0 <= args.focus_x <= 1 and 0 <= args.focus_y <= 1):
        parser.error("Composition focus must be between 0 and 1.")
    places = list(dict.fromkeys(args.place))
    if "hoyblokka" in places and not args.allow_historical_hoyblokka:
        parser.error("Høyblokka photo is from 2008; pass --allow-historical-hoyblokka for an explicitly historical asset.")
    if "y_blokka" in places and not args.allow_architecture_only_yblokka:
        parser.error("Y-blokka: only the architecturally focused 2008 photograph with no artwork visible is approved for staging.")

    entries = []
    for place in places:
        source = SOURCES[place]
        original, resolved_source = load_original(place, source, args.source_dir)
        if len(original) > 30_000_000:
            raise ValueError(f"Unexpectedly large original ({place})")
        with Image.open(io.BytesIO(original)) as loaded:
            if loaded.format != "JPEG":
                raise ValueError(f"Unexpected source format for {place}: {loaded.format}")
            image = ImageOps.exif_transpose(loaded).convert("RGB")
        if image.size != source["size"]:
            raise ValueError(f"Unexpected source dimensions for {place}: {image.size} != {source['size']}")
        folder = args.output_dir / place
        file_paths = [folder / source["filename"]] + [
            folder / (place + role["suffix"]) for role in ROLES.values()
        ] + [folder / "staging-metadata.json"]
        if not args.overwrite and any(file_path.exists() for file_path in file_paths):
            raise FileExistsError(f"Staging output already exists for {place}. Use --overwrite deliberately.")
        folder.mkdir(parents=True, exist_ok=True)
        (folder / source["filename"]).write_bytes(original)
        assets = {}
        for key, config in ROLES.items():
            output = crop_to_ratio(image, config["size"], args.focus_x, args.focus_y)
            filepath = folder / (place + config["suffix"])
            output.save(filepath, format="WEBP", quality=86, method=6)
            with Image.open(filepath) as verification:
                if verification.format != "WEBP" or verification.size != config["size"]:
                    raise ValueError(f"Output verification failed: {filepath}")
                if key == "frontImage" and verification.height <= verification.width:
                    raise ValueError("Invalid non-portrait frontImage")
            assets[key] = {
                "staged_file": str(filepath),
                "canonical_candidate_path": "bilder/places/" + filepath.name,
                "sha256": sha256(filepath.read_bytes()),
                "dimensions": list(config["size"]),
            }
        metadata = {
            "place_id": place,
            "status": "STAGED_NOT_PUBLISHED_REQUIRES_HUMAN_QA",
            "source_page": commons_page(source["filename"]),
            "resolved_download": resolved_source,
            "creator": source["creator"],
            "credit": source["creator"] + " / Wikimedia Commons",
            "license": source["license"],
            "license_url": source["license_url"],
            "license_needs_recheck": True,
            "photo_date": source["date"],
            "historical_only": bool(source.get("historical")),
            "architecture_only_no_artwork_visible": bool(source.get("architecture_only")),
            "original_sha256": sha256(original),
            "original_dimensions": list(image.size),
            "transformation": f"EXIF orientation, WebP conversion, composed crop focus ({args.focus_x}, {args.focus_y})",
            "needs_visual_review": ["Place identity and signage", "Both crop compositions", "Mobile and desktop rendering"],
            "needs_legal_review": ["Attribution displayed alongside image", "CC BY-SA license and derivative sharing"],
            "assets": assets,
        }
        (folder / "staging-metadata.json").write_text(json.dumps(metadata, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
        entries.append(metadata)
        print(f"STAGED {place}: {assets['image']['staged_file']} + {assets['frontImage']['staged_file']}")
    print(f"Prepared {len(entries)} place(s). NOT published; inspect staging metadata, binary files and image compositions.")


if __name__ == "__main__":
    main()
