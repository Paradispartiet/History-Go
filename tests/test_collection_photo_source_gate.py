"""Regression for photo-source rights and no false staged/published claims."""
import copy
import importlib.util
import json
from pathlib import Path
import tempfile
import unittest

SCRIPT = Path(__file__).resolve().parents[1] / "scripts/check-collection-photo-sources.py"
spec = importlib.util.spec_from_file_location("photo_source_checker", SCRIPT)
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
MANIFEST = Path(__file__).resolve().parents[1] / "reports/collection-images/freiaparken-photo-2024-commons-candidate.json"


class PhotoSourceGateTests(unittest.TestCase):
    def setUp(self):
        self.original = json.loads(MANIFEST.read_text(encoding="utf8"))

    def test_real_photo_source_is_verified_but_unstaged(self):
        with tempfile.TemporaryDirectory() as temp:
            module.verify_photo_source(self.original, Path(temp))
        self.assertEqual(self.original["editorialApproval"], False)
        self.assertEqual(self.original["publishable"], False)

    def test_rejects_premature_publishing_and_invalid_license(self):
        cases = [
            ("publishable", True),
            ("editorialApproval", True),
            ("reviewStatus", "APPROVED"),
            ("license", "Public domain"),
            ("licenseUrl", "https://example.org/"),
            ("sourceArchiveSha1", "no-bytes"),
            ("candidateSha256", "0" * 64),
            ("photographer", ""),
            ("reuseConditions", []),
            ("candidateFilename", "../not-safe.webp"),
        ]
        for key, value in cases:
            with self.subTest(field=key), tempfile.TemporaryDirectory() as temp:
                malformed = copy.deepcopy(self.original)
                malformed[key] = value
                with self.assertRaises(ValueError):
                    module.verify_photo_source(malformed, Path(temp))

    def test_source_record_must_not_hide_existing_binary(self):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            p = root / "bilder/kort/structures/candidates/freiaparken" / self.original["candidateFilename"]
            p.parent.mkdir(parents=True)
            p.write_bytes(b"not-an-image")
            with self.assertRaisesRegex(ValueError, "staged WebP exists"):
                module.verify_photo_source(self.original, root)



class OsloByarkivSourceGateTests(unittest.TestCase):
    def test_both_real_archive_sources_are_unpublished(self):
        for filename, expected in module.ARCHIVE_SOURCES.items():
            with self.subTest(filename=filename), tempfile.TemporaryDirectory() as temp:
                payload=json.loads((MANIFEST.parent / filename).read_text(encoding="utf8"))
                module.verify_oslo_archive_source(payload, Path(temp), expected)
                self.assertIsNone(payload["sourceImageBytesSha256"])
                self.assertFalse(payload["publishable"])

    def test_cannot_forge_rights_photo_or_ready_status(self):
        filename="toyen-trafo-apparatpult-1916-photo-source.json"
        original=json.loads((MANIFEST.parent / filename).read_text(encoding="utf8"))
        expected=module.ARCHIVE_SOURCES[filename]
        for field,bad in [
            ("license", "CC BY 4.0"),
            ("rightsPolicyUrl", "https://example.org/"),
            ("archivalIdentifier","A-20138/Ua/0004/055"),
            ("sourceOriginalDownloaded",True),
            ("archivedPhotoPersonallyViewed",True),
            ("editorialApproval",True),
            ("publishable",True),
            ("sourceImageBytesSha256", "0"*64),
            ("stagedAssetPath","bilder/kort/objects/candidates/unsafe.webp"),
            ("reviewStatus","READY"),
        ]:
            with self.subTest(field=field),tempfile.TemporaryDirectory() as temp:
                modified=copy.deepcopy(original)
                modified[field]=bad
                with self.assertRaises(ValueError):
                    module.verify_oslo_archive_source(modified,Path(temp),expected)


if __name__ == "__main__":
    unittest.main()
