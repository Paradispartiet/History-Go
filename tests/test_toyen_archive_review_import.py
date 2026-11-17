"""Offline tests: source-only Tøyen file review and fail-closed publication gates."""
import hashlib
import importlib.util
import io
import json
from pathlib import Path
import tempfile
import unittest

from PIL import Image

SCRIPT = Path(__file__).resolve().parents[1] / 'scripts' / 'stage_toyen_archive_for_review.py'
spec = importlib.util.spec_from_file_location('stage_toyen_archive_for_review', SCRIPT)
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)

SOURCES = [
    ('toyen_trafo_apparatpult_1916', 'A-20138/Ua/0004/054', 1916, 'Tøyen transformatorstasjon, Apparatpult', None),
    ('toyen_trafo_transformatorkjerne_1918', 'A-20138/Ua/0004/091', 1918,
     'Tøyen transformatorstasjon, kjerne for transformatormotor 6250 k.v.a.', 'person viser fram motoren'),
]


def manifest(asset, archive, year, title, motif):
    return {
        'asset': asset, 'archivalIdentifier': archive, 'recordedYear': year,
        'sourcePage': 'https://oslobilder.no/BAR/'+archive,
        'archivalCatalogTitle': title, 'archivalCatalogMotif': motif,
        'placeId': 'toyen_trafo', 'collection': 'objects',
        'publishable': False, 'editorialApproval': False,
        'sourceOriginalDownloaded': False, 'stagedAssetPath': None,
        'canonicalCurrentAsset': 'bilder/objects/'+asset+'_illustrasjon.svg',
    }


def jpeg_bytes():
    b=io.BytesIO()
    Image.new('RGB',(127,89),(180,160,130)).save(b,format='JPEG')
    return b.getvalue()


class ArchiveReviewImportTests(unittest.TestCase):
    def test_review_both_sources_only(self):
        for record in SOURCES:
            with self.subTest(asset=record[0]), tempfile.TemporaryDirectory() as t:
                root=Path(t)
                src=root/'local.jpg'
                payload=jpeg_bytes()
                src.write_bytes(payload)
                out=root/'artifacts'/'toyen-archive-review'/'review'
                result=module.stage_for_review(manifest(*record),record[1],src,out,root)
                self.assertEqual(result['sourceSha256'],hashlib.sha256(payload).hexdigest())
                self.assertEqual(result['sourceDimensions'],[127,89])
                self.assertFalse(result['sourceIsAuthenticated'])
                self.assertFalse(result['visualCatalogComparisonDone'])
                self.assertFalse(result['publishable'])
                self.assertTrue((out/'review_receipt.json').is_file())
                with Image.open(out/result['reviewWebpFile']) as img:
                    self.assertEqual(img.size,(900,600))
                self.assertEqual((out/result['sourceFile']).read_bytes(),payload)
                with self.assertRaises(FileExistsError):
                    module.stage_for_review(manifest(*record),record[1],src,out,root)

    def test_source_records_in_repository_match_script_contract(self):
        repository = Path(__file__).resolve().parents[1]
        for key, (filename, archive_id) in module.SOURCES.items():
            with self.subTest(asset=key):
                manifest_path = repository / 'reports/collection-images' / filename
                self.assertTrue(manifest_path.is_file(), f'missing manifest: {filename}')
                payload = json.loads(manifest_path.read_text(encoding='utf8'))
                with tempfile.TemporaryDirectory() as t:
                    root=Path(t)
                    src=root/'local.jpg'
                    src.write_bytes(jpeg_bytes())
                    result=module.stage_for_review(payload, archive_id, src,
                        root/'artifacts'/'toyen-archive-review'/'review', root)
                    self.assertFalse(result['sourceIsAuthenticated'])
                    self.assertEqual(result['claimedArchiveIdentifier'], archive_id)

    def test_untrusted_bytes_and_premature_publication_rejected(self):
        record=SOURCES[0]
        for field,bad in [('publishable',True),('editorialApproval',True),
                          ('sourcePage','https://oslobilder.no/BAR/A-20138/Ua/0004/055'),
                          ('archivalIdentifier','A-20138/Ua/0004/055'),
                          ('canonicalCurrentAsset','bilder/objects/other.jpg'),
                          ('sourceOriginalDownloaded',True),
                          ('asset','askim_apparatpult_1916'),
                          ('recordedYear',1918),
                          ('archivalCatalogTitle','Askim transformatorstasjon, apparatpult')]:
            with self.subTest(field=field), tempfile.TemporaryDirectory() as t:
                root=Path(t)
                src=root/'local.jpg'
                src.write_bytes(jpeg_bytes())
                changed=manifest(*record)
                changed[field]=bad
                with self.assertRaises(ValueError):
                    module.stage_for_review(changed,record[1],src,root/'artifacts'/'toyen-archive-review'/'review',root)
                self.assertFalse((root/'artifacts'/'toyen-archive-review'/'review').exists())
        with tempfile.TemporaryDirectory() as t:
            root=Path(t)
            src=root/'local.jpg'
            src.write_bytes(b'not a source image')
            with self.assertRaises(ValueError):
                module.stage_for_review(manifest(*record),record[1],src,root/'artifacts'/'toyen-archive-review'/'review',root)
            src.write_bytes(jpeg_bytes())
            with self.assertRaises(ValueError):
                module.stage_for_review(manifest(*record),record[1],src,root/'bilder'/'bad',root)
            with self.assertRaises(ValueError):
                module.stage_for_review(manifest(*record),record[1],src,root/'data'/'bad',root)
            # The generic artifacts/ folder is not git-ignored.
            with self.assertRaises(ValueError):
                module.stage_for_review(manifest(*record),record[1],src,root/'artifacts'/'unignored',root)
            with self.assertRaises(ValueError):
                module.stage_for_review(manifest(*record),record[1],src,root/'artifacts'/'toyen-archive-review',root)
            with tempfile.TemporaryDirectory() as external:
                # Even a valid-looking directory outside this repo is not review-safe.
                with self.assertRaises(ValueError):
                    module.stage_for_review(manifest(*record),record[1],src,Path(external)/'elsewhere',root)
            # Tighten the threshold for this test; avoid allocating an enormous image.
            original_limit = module.MAX_PIXELS
            try:
                module.MAX_PIXELS = 10_000  # 127 x 89 exceeds this threshold.
                with self.assertRaises(ValueError):
                    module.stage_for_review(
                        manifest(*record), record[1], src,
                        root/'artifacts'/'toyen-archive-review'/'pixel-limit', root)
                self.assertFalse((root/'artifacts'/'toyen-archive-review'/'pixel-limit').exists())
            finally:
                module.MAX_PIXELS = original_limit


if __name__=='__main__':
    unittest.main()
