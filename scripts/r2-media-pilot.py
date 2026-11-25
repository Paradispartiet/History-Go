"""Create a byte-verified, content-addressed R2 mirror of active Music badges.
Default is a local inventory only. Never edits source files or app URLs.
"""
import argparse
import hashlib
import json
import os
from pathlib import Path, PurePosixPath
import re
import subprocess
from urllib.parse import quote, urlsplit
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]
CATEGORY = "data/badges/musikk.json"

def inventory(root):
    data = json.loads((root / CATEGORY).read_text(encoding="utf-8"))
    images = [data["image"], *data["subBadgeImages"].values()]
    if len(images) != len(set(images)) or set(data["sub"]) != set(data["subBadgeImages"]):
        raise ValueError("Unexpected badge image inventory")
    result = []
    for name in sorted(images):
        p = PurePosixPath(name)
        if (p.is_absolute() or ".." in p.parts or p.suffix != ".webp"
            or not (name == "bilder/merker/musikk-brodert-v1.webp"
                    or name.startswith("bilder/merker/musikk/undermerker/"))):
            raise ValueError(f"Path outside pilot scope: {name}")
        file = root / name
        if not file.is_file() or file.is_symlink() or not file.resolve().is_relative_to(root.resolve()):
            raise ValueError(f"Invalid source: {name}")
        raw = file.read_bytes()
        if raw[:4] != b"RIFF" or raw[8:12] != b"WEBP":
            raise ValueError(f"Invalid WebP header: {name}")
        digest = hashlib.sha256(raw).hexdigest()
        result.append({"path": name, "bytes": len(raw), "sha256": digest,
                       "key": f"media/v1/{digest}/{p.name}", "content_type": "image/webp"})
    return result

def config():
    endpoint = os.environ["R2_ENDPOINT"].rstrip("/")
    bucket = os.environ["R2_BUCKET"]
    public = os.environ["R2_PUBLIC_BASE"].rstrip("/")
    if not re.fullmatch(r"https://[a-f0-9]{32}\.r2\.cloudflarestorage\.com", endpoint):
        raise ValueError("Expected Cloudflare R2 S3 endpoint")
    if not re.fullmatch(r"[a-z0-9][a-z0-9-]{1,61}[a-z0-9]", bucket):
        raise ValueError("Invalid bucket name")
    u = urlsplit(public)
    if u.scheme != "https" or not u.hostname or u.username or u.password or u.query or u.fragment or u.path:
        raise ValueError("Expected HTTPS bucket public origin")
    for env in ("AWS_ACCESS_KEY_ID", "AWS_SECRET_ACCESS_KEY"):
        if not os.environ.get(env):
            raise ValueError(f"Missing {env}")
    return endpoint, bucket, public

def upload(root, rows):
    endpoint, bucket, public = config()
    for row in rows:
        file = root / row["path"]
        if hashlib.sha256(file.read_bytes()).hexdigest() != row["sha256"]:
            raise ValueError("Source changed during inventory")
        subprocess.run(["aws", "s3", "cp", str(file), f"s3://{bucket}/{row['key']}",
                        "--endpoint-url", endpoint, "--region", "auto",
                        "--content-type", row["content_type"], "--cache-control",
                        "public,max-age=31536000,immutable", "--only-show-errors",
                        "--no-progress"], check=True)
        url = public + "/" + quote(row["key"], safe="/")
        with urlopen(Request(url, headers={"Accept-Encoding": "identity"}), timeout=60) as res:
            if res.status != 200 or res.geturl() != url or res.headers.get_content_type() != row["content_type"]:
                raise ValueError(f"Unexpected public response for {row['path']}")
            raw = res.read(row["bytes"] + 1)
        if len(raw) != row["bytes"] or hashlib.sha256(raw).hexdigest() != row["sha256"]:
            raise ValueError(f"Public bytes differ for {row['path']}")
        row["verified_url"] = url
    return rows

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--upload", action="store_true")
    parser.add_argument("--report", type=Path, required=True)
    args = parser.parse_args()
    rows = inventory(ROOT)
    if args.upload:
        upload(ROOT, rows)
    report = {"version": 1, "mode": "verified-mirror" if args.upload else "inventory",
              "source_commit": subprocess.check_output(["git", "rev-parse", "HEAD"], cwd=ROOT, text=True).strip(),
              "total_bytes": sum(x["bytes"] for x in rows), "images": rows}
    args.report.write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"{report['mode']}: {len(rows)} images, {report['total_bytes']} bytes")

if __name__ == "__main__":
    main()
