"""Offline QA of safe, hash-locked photo import for review-only artifacts."""
from __future__ import annotations

from io import BytesIO
import hashlib
import importlib.util
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

from PIL import Image

SCRIPT = Path(__file__).resolve().parents[1] / "scripts/fetch-freiaparken-photo-for-review.py"
spec=importlib.util.spec_from_file_location("photo_review_import",SCRIPT)
module=importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)

class FakeResponse(BytesIO):
    def __init__(self,data,url):
        super().__init__(data)
        self.url=url
    def geturl(self):
        return self.url

class PhotoImportTests(unittest.TestCase):
    def setUp(self):
        source=BytesIO()
        Image.new("RGB",(300,200),(57,113,145)).save(source,"JPEG",quality=86)
        self.data=source.getvalue()
        self.url="https://upload.wikimedia.org/wikipedia/commons/a/ad/Freiaparken_bassenget_langs_Freias_bygning.jpg"
        self.manifest={
            "originalFileUrl":self.url,
            "sourceArchiveSha1":hashlib.sha1(self.data).hexdigest(),
            "sourceArchiveBytes":len(self.data),
            "sourceWidth":300,
            "sourceHeight":200,
            "publishable":False,
            "editorialApproval":False,
            "reviewStatus":"SOURCE_AND_IMAGE_VISUALLY_VERIFIED_BINARY_NOT_STAGED",
            "originalFileSource":"https://commons.wikimedia.org/wiki/File:Freiaparken_bassenget_langs_Freias_bygning.jpg",
            "photographer":"Test photographer",
            "license":"CC BY-SA 4.0",
            "licenseUrl":"https://creativecommons.org/licenses/by-sa/4.0/"
        }
    def fake_download(self,req,timeout):
        self.assertEqual(req.full_url,self.url)
        self.assertLessEqual(timeout,60)
        return FakeResponse(self.data,self.url)

    def test_stages_uncropped_photo_as_review_only(self):
        with tempfile.TemporaryDirectory() as temp, patch.object(module.urllib.request,"urlopen",self.fake_download):
            result=module.import_for_review(self.manifest,Path(temp)/"review")
            self.assertFalse(result["publishable"])
            self.assertEqual(result["rightsForDepictedSculptures"],"NOT_CLEARED")
            self.assertEqual(result["derivativePixels"],[900,600])
            self.assertEqual(result["sourcePixels"],[300,200])
            self.assertTrue((Path(temp)/"review/review_provenance.json").is_file())
            with Image.open(Path(temp)/"review/freiaparken_basseng_foto_2024_UNAPPROVED_review.webp") as image:
                self.assertEqual(image.size,(900,600))
            self.assertEqual(len(list((Path(temp)/"review").iterdir())),3)

    def test_offline_original_avoids_network_and_keeps_hash_lock(self):
        with tempfile.TemporaryDirectory() as temp:
            root=Path(temp)
            source=root/"original-from-commons.jpg"
            source.write_bytes(self.data)
            with patch.object(module.urllib.request,"urlopen",side_effect=AssertionError("no network allowed")):
                result=module.import_for_review(self.manifest,root/"review",source)
            self.assertEqual(result["sourceOriginalSha1"],hashlib.sha1(self.data).hexdigest())
            self.assertFalse(result["publishable"])
            source.write_bytes(self.data[:-2]+b"XX")
            with patch.object(module.urllib.request,"urlopen",side_effect=AssertionError("no network allowed")):
                with self.assertRaisesRegex(ValueError,"source original mismatch"):
                    module.import_for_review(self.manifest,root/"other",source)

    def test_blocks_changed_source_or_premature_approval(self):
        for key,value,expected in [
            ("sourceArchiveSha1","0"*40,"source original mismatch"),
            ("sourceArchiveBytes",10,"source original mismatch"),
            ("sourceWidth",500,"original dimension mismatch"),
            ("editorialApproval",True,"photo must remain unapproved"),
            ("publishable",True,"photo must remain unapproved"),
            ("originalFileUrl","https://example.org/bad.jpg","outside Wikimedia Commons")
        ]:
            with self.subTest(key=key),tempfile.TemporaryDirectory() as temp,patch.object(module.urllib.request,"urlopen",self.fake_download):
                altered=dict(self.manifest)
                altered[key]=value
                with self.assertRaisesRegex(ValueError,expected):
                    module.import_for_review(altered,Path(temp)/"review")
                self.assertFalse((Path(temp)/"review").exists())

    def test_never_overwrites_existing_review(self):
        with tempfile.TemporaryDirectory() as temp,patch.object(module.urllib.request,"urlopen",self.fake_download):
            output=Path(temp)/"review"
            module.import_for_review(self.manifest,output)
            with self.assertRaisesRegex(ValueError,"refusing overwrite"):
                module.import_for_review(self.manifest,output)

if __name__=="__main__":
    unittest.main()
