#!/usr/bin/env python3
"""Ensure image candidates cannot bypass editorial provenance and hold gates."""
from __future__ import annotations

import hashlib
import importlib.util
import json
from pathlib import Path
import tempfile
import unittest

MODULE = Path(__file__).resolve().parents[1] / "scripts/check-collection-image-candidates.py"
spec = importlib.util.spec_from_file_location("candidate_checker", MODULE)
checker = importlib.util.module_from_spec(spec)
spec.loader.exec_module(checker)


class CandidateEditorialGateTests(unittest.TestCase):
    def create_fixture(self, root: Path) -> list[Path]:
        reports = root / "reports/collection-images"
        reports.mkdir(parents=True)
        manifests = []
        payload = b"VP8 " + (14).to_bytes(4, "little") + b"\x00\x00\x00\x9d\x01\x2a" + (900).to_bytes(2, "little") + (520).to_bytes(2, "little")
        binary = b"RIFF" + (len(payload) + 4).to_bytes(4, "little") + b"WEBP" + payload
        digest = hashlib.sha256(binary).hexdigest()
        blob_sha = hashlib.sha1(b"blob " + str(len(binary)).encode() + b"\0" + binary).hexdigest()
        for name in checker.MANIFESTS:
            group = "structures" if "freiaparken" in name else "objects"
            filename = name.replace("-candidate.json", "_candidate.webp")
            dest = f"bilder/kort/{group}/candidates/audit/{filename}"
            p = root / dest
            p.parent.mkdir(parents=True, exist_ok=True)
            p.write_bytes(binary)
            manifest = reports / name
            manifest.write_text(json.dumps({
                "asset": filename,
                "candidateFilename": filename,
                "canonicalCurrentAsset": f"bilder/legacy/{filename}",
                "stagedAssetPath": dest,
                "stagingStatus": "STAGED_BINARY_IN_GITHUB_NOT_PUBLISHED",
                "stagedBytes": len(binary),
                "candidateSha256": digest,
                "gitBlobSha": blob_sha,
                "candidateWidth": 900,
                "candidateHeight": 520,
                "publishable": False,
                "editorialApproval": False,
                "imageKind": "illustration",
                "rightsBasis": "Original independent illustration, not archive photo",
                "sourcePhotoNotReproduced": True,
                "sourcePage": "https://example.org/archive-id",
            }, ensure_ascii=False), encoding="utf-8")
            manifests.append(manifest)
        return manifests

    def test_integrity_does_not_mean_publication(self):
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            self.create_fixture(root)
            status = checker.verify(root)
            self.assertEqual(status["count"], 3)
            self.assertFalse(status["published"])
            self.assertEqual(status["status"], "BINARY_INTEGRITY_PASS_EDITORIAL_REVIEW_PENDING")

    def test_editorial_hold_must_be_explicit(self):
        for change in (True, None, "approved"):
            with self.subTest(change=change), tempfile.TemporaryDirectory() as folder:
                root = Path(folder)
                manifests = self.create_fixture(root)
                obj = json.loads(manifests[0].read_text())
                obj["editorialApproval"] = change
                manifests[0].write_text(json.dumps(obj))
                with self.assertRaisesRegex(ValueError, "editorial status"):
                    checker.verify(root)

    def test_provenance_and_canonical_path_required(self):
        for field, value, error in [
            ("imageKind", "photo", "imageKind"),
            ("rightsBasis", "", "rightsBasis"),
            ("sourcePhotoNotReproduced", False, "no archival source photo"),
            ("sourcePage", "", "sourcePage"),
            ("canonicalCurrentAsset", "bilder/kort/objects/candidates/sneaky.webp", "canonical image"),
        ]:
            with self.subTest(field=field), tempfile.TemporaryDirectory() as folder:
                root = Path(folder)
                manifests = self.create_fixture(root)
                obj = json.loads(manifests[0].read_text())
                obj[field] = value
                manifests[0].write_text(json.dumps(obj))
                with self.assertRaisesRegex(ValueError, error):
                    checker.verify(root)


if __name__ == "__main__":
    unittest.main()
