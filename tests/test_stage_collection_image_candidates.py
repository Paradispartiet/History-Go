#!/usr/bin/env python3
"""Regression tests for safe, hash-locked, unpublished image staging."""
import hashlib
import importlib.util
import json
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest
from zipfile import ZipFile

MODULE = Path(__file__).resolve().parents[1] / 'scripts/stage-collection-image-candidates.py'
spec = importlib.util.spec_from_file_location('candidate_stager', MODULE)
stager = importlib.util.module_from_spec(spec)
spec.loader.exec_module(stager)


class CandidateImportTests(unittest.TestCase):
    def create_inputs(self, root):
        manifest_dir = root / 'reports/collection-images'
        manifest_dir.mkdir(parents=True, exist_ok=True)
        pack = root / 'candidates.zip'
        images = {}
        for name in stager.CANDIDATES:
            filename = name.replace('-candidate.json', '') + '.webp'
            vp8 = b'\0\0\0\x9d\x01\x2a' + (900).to_bytes(2, 'little') + (520).to_bytes(2, 'little')
            payload = b'VP8 ' + len(vp8).to_bytes(4, 'little') + vp8
            blob = b'RIFF' + (len(payload) + 4).to_bytes(4, 'little') + b'WEBP' + payload
            images[filename] = blob
            (manifest_dir / name).write_text(json.dumps({
                'candidateFilename': filename, 'candidateWidth': 900, 'candidateHeight': 520,
                'candidateSha256': hashlib.sha256(blob).hexdigest(), 'publishable': False
            }), encoding='utf8')
        with ZipFile(pack, 'w') as archive:
            for filename, blob in images.items():
                archive.writestr(filename, blob)
            archive.writestr('source-originals/not-staged.png', b'ignore')
        return manifest_dir, pack, images

    def test_dimensions_and_hash_locked_stage(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            manifest_dir, pack, images = self.create_inputs(root)
            checked = stager.inspect_packages([pack], manifest_dir)
            self.assertEqual(len(checked), 3)
            self.assertEqual({x['file'] for x in checked}, set(images))
            self.assertTrue(all(x['size'] == [900, 520] for x in checked))
            completed = subprocess.run([
                sys.executable, str(MODULE), '--root', str(root),
                '--manifest-dir', str(manifest_dir), '--package', str(pack), '--stage'
            ], capture_output=True, text=True, check=True)
            self.assertEqual(json.loads(completed.stdout)['status'], 'STAGED_CANDIDATES')
            for item in checked:
                self.assertEqual((root / item['destination']).read_bytes(), images[item['file']])
            self.assertFalse((root / 'source-originals').exists())
            self.assertFalse((root / 'data').exists())

    def test_tamper_and_unsafe_zip_rejected(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            manifest_dir, pack, _ = self.create_inputs(root)
            with ZipFile(pack, 'a') as archive:
                archive.writestr('../escape.webp', b'evil')
            with self.assertRaisesRegex(ValueError, 'unsafe ZIP member'):
                stager.inspect_packages([pack], manifest_dir)
            pack.unlink()
            manifest_dir, pack, _ = self.create_inputs(root)
            first = next(iter(stager.CANDIDATES))
            manifest = json.loads((manifest_dir / first).read_text())
            manifest['candidateSha256'] = '0' * 64
            (manifest_dir / first).write_text(json.dumps(manifest))
            with self.assertRaisesRegex(ValueError, 'SHA256 mismatch'):
                stager.inspect_packages([pack], manifest_dir)

    def test_reject_existing_different_candidate(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            manifest_dir, pack, _ = self.create_inputs(root)
            dest = root / next(iter(stager.CANDIDATES.values())) / 'toyen-trafo-apparatpult-1916.webp'
            dest.parent.mkdir(parents=True, exist_ok=True)
            dest.write_bytes(b'existing')
            run = subprocess.run([
                sys.executable, str(MODULE), '--root', str(root),
                '--manifest-dir', str(manifest_dir), '--package', str(pack), '--stage'
            ], capture_output=True, text=True)
            self.assertNotEqual(run.returncode, 0)
            self.assertIn('existing candidate differs', run.stderr)
            self.assertEqual(dest.read_bytes(), b'existing')


if __name__ == '__main__':
    unittest.main()
