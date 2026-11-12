#!/usr/bin/env python3
"""Three non-active History Go Research & Method v3 localization candidates.

Reuses the focused French v3 parchment-label cleanup method.  Only ten internal
text fields are revised; the outer textile, motifs and alpha remain unaltered.
Never writes under /brodert/, modifies active registry, or replaces any v2.
"""
import hashlib
import importlib.util
import json
from pathlib import Path
from PIL import Image

ROOT=Path(__file__).resolve().parents[1]
REFERENCE=ROOT/"scripts/revise-vitenskap-fr-research-v3.py"
s=importlib.util.spec_from_file_location("forskning_fr_v3",REFERENCE)
mod=importlib.util.module_from_spec(s)
s.loader.exec_module(mod)

BOXES=[(x0,y0,x1,y1,px,tilt,meaning)
       for _,x0,y0,x1,y1,px,tilt,_,meaning in mod.LABELS]
TRANSLATIONS={
 "en":[
  "HYPOTHESIS","TEST","RESULT","CONCLUSION","METHOD",
  "Sampling","Procedure","Measurement","Analysis","SAMPLE\nA-037"
 ],
 "es":[
  "HIPÓTESIS","PRUEBA","RESULTADO","CONCLUSIÓN","MÉTODO",
  "Muestreo","Procedimiento","Medición","Análisis","MUESTRA\nA-037"
 ],
 "pt":[
  "HIPÓTESE","TESTE","RESULTADO","CONCLUSÃO","MÉTODO",
  "Amostragem","Procedimento","Medição","Análise","AMOSTRA\nA-037"
 ]
}
assert len(BOXES)==10

def revise(lang):
    src=ROOT/f"bilder/merker/vitenskap/kandidater/locales/{lang}/forskning_og_metode-v2.webp"
    with Image.open(src) as im:
        original=im.convert("RGBA")
    assert original.size==(1024,1024)
    alpha=original.getchannel('A').tobytes()
    out=original.copy()
    edits=[]
    for text,(x0,y0,x1,y1,px,tilt,meaning) in zip(TRANSLATIONS[lang],BOXES):
        out,size=mod.amend_patch(out,text,(x0,y0,x1,y1),px,tilt)
        edits.append({"meaning":meaning,"localizedText":text,"bbox":[x0,y0,x1,y1],"fontPx":size})
    out.putalpha(original.getchannel("A"))
    assert out.getchannel("A").tobytes()==alpha
    dst=ROOT/f"bilder/merker/vitenskap/kandidater/revisjoner/{lang}/forskning_og_metode-v3.webp"
    dst.parent.mkdir(parents=True,exist_ok=True)
    out.save(dst,"WEBP",quality=96,method=6)
    data=dst.read_bytes()
    return {
        "locale":lang,
        "source":str(src.relative_to(ROOT)),
        "path":str(dst.relative_to(ROOT)),
        "edits":edits,"bytes":len(data),
        "sha256":hashlib.sha256(data).hexdigest(),
        "gitBlobSha":hashlib.sha1(b'blob '+str(len(data)).encode()+b'\0'+data).hexdigest(),
        "sameAlphaAsSource":True
    }

def main():
    revisions=[revise(lang) for lang in ("en","es","pt")]
    result={
        "schemaVersion":1,"categoryId":"vitenskap","id":"forskning_og_metode",
        "status":"three_separate_v3_candidates_not_active",
        "activeBadgeImagesUnchanged":True,
        "sourceNorwegianCandidate":"bilder/merker/vitenskap/kandidater/forskning_og_metode-v2.webp",
        "sourceFrenchV3":"bilder/merker/vitenskap/kandidater/revisjoner/fr/forskning_og_metode-v3.webp",
        "notes":"One-illustration-per-language non-active research v3; internal scientific labels localized; original outer ribbon typography still requires independent visual review.",
        "items":revisions
    }
    dst=ROOT/"data/badges/vitenskap_forskning_internal_locales_v3_20261112.json"
    dst.parent.mkdir(parents=True,exist_ok=True)
    dst.write_text(json.dumps(result,ensure_ascii=False,indent=2)+"\n",encoding="utf8")
    for r in revisions:print(r["locale"],r["bytes"],r["gitBlobSha"])
if __name__=="__main__":main()
