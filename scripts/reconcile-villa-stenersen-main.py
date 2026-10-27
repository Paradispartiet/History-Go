#!/usr/bin/env python3
"""Keep latest main data while reconciling only Villa Stenersen's seven shared JSON files."""
import json, subprocess
from pathlib import Path
OVERLAP={
 "data/fag/fag_manifest.json",
 "data/fagverk/fagverk_registry.json",
 "data/fagverk/fagverk_release.json",
 "data/knowledge/knowledge_units.generated.json",
 "data/quiz/manifest.json",
 "data/quizcards/historie/manifest.json",
 "reports/knowledge-id-backfill.json",
}
GENERATED={
 "data/fagverk/fagverk_release.json",
 "data/knowledge/knowledge_units.generated.json",
 "reports/knowledge-id-backfill.json",
}
def git(*args):
 return subprocess.check_output(["git",*args])
def read(ref,path):
 return json.loads(git("show",f"{ref}:{path}").decode())
def save(path,obj):
 Path(path).write_text(json.dumps(obj,ensure_ascii=False,indent=2)+"\n",encoding="utf8")
def fail(message):
 raise SystemExit(message)
def main():
 base=git("merge-base","HEAD","origin/main").decode().strip()
 b=set(git("diff","--name-only",base,"HEAD").decode().splitlines())
 m=set(git("diff","--name-only",base,"origin/main").decode().splitlines())
 unexpected=(b & m) - OVERLAP
 if unexpected:fail(f"Refusing unexpected overlap {sorted(unexpected)}")
 target="villa_stenersen"
 # Preserve other subject domains, Grand Hotel, Oslo domkirke and the parallel Oslo batches.
 fmain=read("origin/main","data/fag/fag_manifest.json")
 fbranch=read("HEAD","data/fag/fag_manifest.json")
 conf=fbranch["historie"]["quizProduction"]["targets"][target]
 existing=fmain["historie"]["quizProduction"]["targets"].get(target)
 if existing not in (None,conf):fail("Competing Villa Stenersen fag target")
 fmain["historie"]["quizProduction"]["targets"][target]=conf
 save("data/fag/fag_manifest.json",fmain)

 regmain=read("origin/main","data/fagverk/fagverk_registry.json")
 regbranch=read("HEAD","data/fagverk/fagverk_registry.json")
 conf=regbranch["placeLinks"][target]
 if regmain["placeLinks"].get(target) not in (None,conf):fail("Competing Villa Stenersen Fagverk registration")
 regmain["placeLinks"][target]=conf
 save("data/fagverk/fagverk_registry.json",regmain)

 qmain=read("origin/main","data/quiz/manifest.json")
 qbranch=read("HEAD","data/quiz/manifest.json")
 entries=[x for x in qbranch["sets"] if x.get("targetId")==target]
 existing=[x for x in qmain["sets"] if x.get("targetId")==target]
 if len(entries)!=3:fail(f"Expected 3 quiz set registrations, got {len(entries)}")
 if existing and existing!=entries:fail("Conflicting Villa Stenersen quiz on main")
 qmain["sets"]=[x for x in qmain["sets"] if x.get("targetId")!=target]
 pos=next((i for i,x in enumerate(qmain["sets"]) if x.get("targetId","")>target),len(qmain["sets"]))
 qmain["sets"][pos:pos]=entries
 save("data/quiz/manifest.json",qmain)

 cmain=read("origin/main","data/quizcards/historie/manifest.json")
 cbranch=read("HEAD","data/quizcards/historie/manifest.json")
 filename="villa_stenersen_quizcard_v1.json"
 if filename not in cbranch["collections"]:fail("Villa Stenersen QuizCard registration absent")
 if filename not in cmain["collections"]:cmain["collections"].append(filename)
 save("data/quizcards/historie/manifest.json",cmain)

 for file in GENERATED:Path(file).write_bytes(git("show",f"origin/main:{file}"))
 unresolved=set(git("diff","--name-only","--diff-filter=U").decode().splitlines())
 if unresolved - OVERLAP:fail(f"Unknown conflicts: {sorted(unresolved-OVERLAP)}")
 subprocess.run(["git","add",*sorted(OVERLAP)],check=True)
 left=git("diff","--name-only","--diff-filter=U").decode().strip()
 if left:fail(f"Unresolved: {left}")
 print(f"Villa Stenersen: reconciled {len(b&m)} overlaps; preserved current main.")
if __name__=="__main__":main()
