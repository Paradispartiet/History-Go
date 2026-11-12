"""Regression: an overview export may not cut off the original photo edges."""
from __future__ import annotations

import importlib.util
import unittest
from pathlib import Path

from PIL import Image

PATH = Path(__file__).resolve().parents[1] / "scripts" / "render-place-overview.py"
spec = importlib.util.spec_from_file_location("place_overview", PATH)
module = importlib.util.module_from_spec(spec)
assert spec.loader
spec.loader.exec_module(module)


class OverviewImageTests(unittest.TestCase):
    def test_landscape_source_into_portrait_keeps_both_sides(self):
        source = Image.new("RGB", (400, 200), "white")
        for x in range(0, 80):
            for y in range(200):
                source.putpixel((x, y), (240, 20, 20))
        for x in range(320, 400):
            for y in range(200):
                source.putpixel((x, y), (20, 50, 240))
        result = module.compose_overview(source, (300, 400))
        self.assertEqual(result.size, (300, 400))
        # With contain() the 2:1 photo occupies 300x150 at y=125..274.
        left = result.getpixel((15, 190))
        right = result.getpixel((285, 190))
        self.assertGreater(left[0], 170)
        self.assertLess(left[2], 65)
        self.assertGreater(right[2], 170)
        self.assertLess(right[0], 65)

    def test_portrait_source_into_landscape_keeps_top_and_bottom(self):
        source = Image.new("RGB", (200, 400), "white")
        for x in range(200):
            for y in range(90):
                source.putpixel((x, y), (20, 200, 30))
            for y in range(310, 400):
                source.putpixel((x, y), (230, 30, 40))
        result = module.compose_overview(source, (400, 200))
        self.assertEqual(result.size, (400, 200))
        top = result.getpixel((202, 10))
        bottom = result.getpixel((202, 190))
        self.assertGreater(top[1], 145)
        self.assertGreater(bottom[0], 160)


if __name__ == "__main__":
    unittest.main()
