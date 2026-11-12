#!/usr/bin/env python3
"""Build a fixed-size Place photo WITHOUT cropping the original composition.

Designed for History Go image/frontImage production. The complete source photo
remains visible, and spare space is filled with a softly blurred/darkened copy
of that same photo. This is a layout adaptation, not image generation.

Usage: python scripts/render-place-overview.py source.jpg front.webp --size 900x1200
"""
from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path

from PIL import Image, ImageEnhance, ImageFilter, ImageOps


def compose_overview(source: Image.Image, size: tuple[int, int]) -> Image.Image:
    """Preserve every source pixel in the sharp foreground (object-fit: contain)."""
    if size[0] < 1 or size[1] < 1:
        raise ValueError("Expected positive output dimensions")
    original = ImageOps.exif_transpose(source).convert("RGB")
    sharp = ImageOps.contain(original, size, method=Image.Resampling.LANCZOS)
    background = ImageOps.fit(original, size, method=Image.Resampling.LANCZOS)
    background = background.filter(ImageFilter.GaussianBlur(radius=max(12, min(size) * 0.035)))
    background = ImageEnhance.Brightness(background).enhance(0.52)
    background = ImageEnhance.Color(background).enhance(0.72)
    background.paste(sharp, ((size[0] - sharp.width) // 2, (size[1] - sharp.height) // 2))
    return background


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("source", type=Path)
    parser.add_argument("destination", type=Path)
    parser.add_argument("--size", required=True, help="Required output size, e.g. 900x1200")
    parser.add_argument("--quality", type=int, default=92)
    args = parser.parse_args()
    try:
        width, height = [int(part) for part in args.size.lower().split("x", 1)]
    except (ValueError, IndexError) as exc:
        parser.error("--size must be WIDTHxHEIGHT with positive integers")
        raise exc  # unreachable
    args.destination.parent.mkdir(parents=True, exist_ok=True)
    with Image.open(args.source) as source:
        full = ImageOps.exif_transpose(source)
        original_size = full.size
        image = compose_overview(source, (width, height))
        image.save(args.destination, "WEBP", quality=args.quality, method=6)
    digest = lambda p: hashlib.sha256(p.read_bytes()).hexdigest()
    sharp_size = ImageOps.contain(Image.new("RGB", original_size), (width, height)).size
    print(json.dumps({
        "source": str(args.source),
        "source_dimensions": original_size,
        "source_sha256": digest(args.source),
        "output": str(args.destination),
        "output_dimensions": [width, height],
        "sharp_uncropped_dimensions": sharp_size,
        "output_sha256": digest(args.destination),
        "composition": "entire_original_visible_over_soft_photo_matte",
    }, ensure_ascii=False))


if __name__ == "__main__":
    main()
