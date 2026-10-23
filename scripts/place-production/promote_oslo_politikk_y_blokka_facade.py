#!/usr/bin/env python3
"""Promote only the reviewed 2008 Y-blokka facade photo, not Picasso/Nesjar art.

Use --apply after byte comparison and visual review. Never changes other Oslo
Place records, quizzes, publications, cardImage or unrelated images.
"""
import argparse
import hashlib
import json
import shutil
from pathlib import Path

ROOT=Path(__file__).resolve().parents[2]
STAGE=ROOT/"reports/place-production/media-staging/oslo-sentrum-politikk/y_blokka"
PLACE=ROOT/"data/places/politikk/oslo/places_politikk/y_blokka.json"
DEST=ROOT/"bilder/places"
SOURCE="https://commons.wikimedia.org/wiki/File:Regjeringskvartalet_Y-blokk_R5_Johan_Nygaardsvolds_plass_Oslo_Norway_(2008.07.01).jpg"
ORIGINAL_SHA="9ac9cec706e816053950c7cb66214f9414a702d7279f0d081dc3fb1b55d9a0b7"
WEBPS={
    "image":(".webp","0470ae18f9971dfe15b2f97cc0c87c8cd2b5a6ff28ef5570137a40a9bdfcfdad",[1400,900]),
    "frontImage":("_front_portrait.webp","91f5534b30b0bab866d435ef386897a24d1012fd2bb816978916752d82ad99b4",[900,1350]),
}


def fail(reason):
    raise SystemExit("Y-blokka facade import refused: "+reason)


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument("--apply",action="store_true",help="Actually write the three whitelisted canonical paths after preflight.")
    args=p.parse_args()
    info=STAGE/"staging-metadata.json"
    if not info.is_file():
        fail("missing review metadata")
    m=json.loads(info.read_text(encoding="utf-8"))
    expected={
        "place_id":"y_blokka","status":"STAGED_NOT_PUBLISHED_REQUIRES_HUMAN_QA",
        "source_page":SOURCE,"creator":"Geir Hval","license":"CC BY-SA 4.0",
        "license_url":"https://creativecommons.org/licenses/by-sa/4.0/",
        "photo_date":"2008-07-01","historical_only":True,
        "architecture_only_no_artwork_visible":True,"original_sha256":ORIGINAL_SHA,
    }
    for key,value in expected.items():
        if m.get(key)!=value:
            fail(f"unexpected {key}: {m.get(key)!r}")
    if "crop focus (0.7, 0.5)" not in m.get("transformation",""):
        fail("unreviewed crop composition")
    if set(m.get("assets",{})) != set(WEBPS):
        fail("unexpected image roles")
    source_name="Regjeringskvartalet Y-blokk R5 Johan Nygaardsvolds plass Oslo Norway (2008.07.01).jpg"
    raw=STAGE/source_name
    if not raw.is_file() or sha(raw)!=ORIGINAL_SHA:
        fail("original bytes mismatch")
    for role,(suffix,hashvalue,dimensions) in WEBPS.items():
        file=STAGE/("y_blokka"+suffix)
        if not file.is_file() or sha(file)!=hashvalue:
            fail(f"unreviewed bytes for {role}")
        if m["assets"][role]["sha256"]!=hashvalue or m["assets"][role]["dimensions"]!=dimensions:
            fail(f"incorrect staged metadata for {role}")
        if (DEST/("y_blokka"+suffix)).exists():
            fail(f"would overwrite an existing canonical {role}")
    obj=json.loads(PLACE.read_text(encoding="utf-8"))
    if obj.get("id")!="y_blokka" or any(k in obj for k in ("image","frontImage","cardImage")):
        fail("Place ID mismatch or existing image fields")
    print("PASS Y-blokka facade only: one original, two reviewed WebPs and legal-scope metadata")
    if not args.apply:
        print("No files changed. --apply required.")
        return
    base={
        "source":"wikimedia_commons","sourcePage":SOURCE,
        "creator":"Geir Hval","credit":"Geir Hval / Wikimedia Commons",
        "license":"CC BY-SA 4.0",
        "licenseUrl":"https://creativecommons.org/licenses/by-sa/4.0/",
        "assetType":"documentary_historical_photo","date":"2008-07-01",
        "verifiedAt":"2026-10-23",
        "historicalOnly":True,
        "historicalCaption":"Y-blokka sett fra Johan Nygaardsvolds plass i 2008, før rivingen i 2020.",
        "rightsScope":"Building facade, no Picasso/Nesjar art shown; not a license to reproduce the integrated artworks.",
        "transformation":"Auto-orientert; faglig gjennomgått fasadeutsnitt (x=0.7, y=0.5); WebP-normalisert.",
    }
    DEST.mkdir(parents=True,exist_ok=True)
    for role,(suffix,hashvalue,dimensions) in WEBPS.items():
        name="y_blokka"+suffix
        target=DEST/name
        shutil.copyfile(STAGE/name,target)
        if sha(target)!=hashvalue:
            fail("copied bytes changed")
        obj[role]="bilder/places/"+name
        md={**base,"outputDimensions":f"{dimensions[0]}x{dimensions[1]}"}
        if role=="frontImage":
            md["orientation"]="portrait"
            md["aspectRatio"]="2:3"
        obj[role+"Meta"]=md
    PLACE.write_text(json.dumps(obj,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
    print("Promoted Y-blokka building-only photo to draft PR. Quiz and browser QA still pending.")


if __name__=="__main__":
    main()
