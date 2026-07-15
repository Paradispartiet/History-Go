#!/usr/bin/env python3
"""Build the broad curated Civication 3D model library from official Kenney CC0 packs.

This is a one-off branch builder. It downloads official pack ZIPs, extracts only
selected models, copies every external texture referenced by those GLBs, updates
the Civication manifest, writes library documentation, and validates every model
reference before allowing the generated commit.
"""

from __future__ import annotations

import json
import shutil
import struct
import tempfile
import time
import urllib.request
import zipfile
from pathlib import Path, PurePosixPath

ROOT = Path(__file__).resolve().parents[1]
ASSET_ROOT = ROOT / "assets" / "models"
MANIFEST_PATH = ASSET_ROOT / "manifest.json"
LIBRARY_PATH = ASSET_ROOT / "LIBRARY.md"

PACKS = {
    "urbanBuildings": {
        "dest": "modular",
        "url": "https://kenney.nl/media/pages/assets/modular-buildings/3253b4219a-1707397411/kenney_modular-buildings.zip",
        "models": [
            "building-sample-house-a.glb", "building-sample-house-b.glb",
            "building-sample-house-c.glb", "building-sample-tower-a.glb",
            "building-sample-tower-c.glb", "building-sample-tower-d.glb",
            "building-window-awnings.glb", "building-window-balcony.glb",
            "roof-flat-detail-a.glb", "roof-flat-detail-b.glb",
        ],
    },
    "urbanDetails": {
        "dest": "retro-urban",
        "url": "https://kenney.nl/media/pages/assets/retro-urban-kit/8314d4db22-1738147509/kenney_retro-urban-kit.zip",
        "models": [
            "truck-flat.glb", "truck-green-cargo.glb", "truck-green.glb",
            "truck-grey-cargo.glb", "detail-awning-wide.glb", "detail-bench.glb",
            "detail-dumpster-closed.glb", "detail-light-single.glb",
            "detail-light-traffic.glb", "scaffolding-structure.glb",
            "tree-park-large.glb", "tree-shrub.glb",
        ],
    },
    "roadInfrastructure": {
        "dest": "roads",
        "url": "https://kenney.nl/media/pages/assets/city-kit-roads/74288c9459-1741864740/kenney_city-kit-roads.zip",
        "models": [
            "bridge-pillar.glb", "construction-barrier.glb", "construction-cone.glb",
            "construction-light.glb", "light-curved.glb", "light-curved-double.glb",
            "light-curved-cross.glb", "sign-highway.glb",
        ],
    },
    "rail": {
        "dest": "train",
        "url": "https://kenney.nl/media/pages/assets/train-kit/cf8521d625-1727040883/kenney_train-kit.zip",
        "models": [
            "track-detailed.glb", "track-single.glb", "track.glb",
            "train-diesel-a.glb", "train-diesel-b.glb", "train-diesel-c.glb",
            "train-diesel-box-a.glb", "train-carriage-container-blue.glb",
            "train-carriage-container-green.glb", "train-carriage-tank.glb",
        ],
    },
    "skateparks": {
        "dest": "mini-skate",
        "url": "https://kenney.nl/media/pages/assets/mini-skate/00b0c2b304-1709221152/kenney_mini-skate.zip",
        "models": [
            "bowl-corner-inner.glb", "bowl-corner-outer.glb", "bowl-side.glb",
            "half-pipe.glb", "obstacle-box.glb", "rail-high.glb", "rail-low.glb",
            "rail-slope.glb", "steps.glb", "structure-platform.glb",
        ],
    },
    "natureAreas": {
        "dest": "mini-forest",
        "url": "https://kenney.nl/media/pages/assets/mini-forest/44a89aed7f-1784024079/kenney_mini-forest_1.0.zip",
        "models": [
            "bridge.glb", "building-platform.glb", "fence.glb", "plant.glb",
            "rocks-high.glb", "tent.glb", "tree-high.glb", "tree.glb",
        ],
    },
    "sportsVenues": {
        "dest": "racing",
        "url": "https://kenney.nl/media/pages/assets/racing-kit/933b8fd9fd-1677580949/kenney_racing-kit.zip",
        "models": [
            "grandStand.glb", "grandStandAwning.glb", "grandStandCovered.glb",
            "grandStandCoveredRound.glb", "grandStandRound.glb", "fenceStraight.glb",
            "lightPostModern.glb", "overheadLights.glb",
        ],
    },
    "heritageFortress": {
        "dest": "castle",
        "url": "https://kenney.nl/media/pages/assets/castle-kit/a395102d20-1711543616/kenney_castle-kit.zip",
        "models": [
            "bridge-draw.glb", "gate.glb", "tower-square.glb",
            "tower-hexagon-top.glb", "wall-corner-half-tower.glb", "wall.glb",
        ],
    },
    "amusementParks": {
        "dest": "coaster",
        "url": "https://kenney.nl/media/pages/assets/coaster-kit/546fdc554f-1731487890/kenney_coaster-kit.zip",
        "models": [
            "park-entrance.glb", "ride-entrance.glb", "station.glb",
            "coaster-steel-looping.glb", "stall-food.glb",
        ],
    },
    "architectureComponents": {
        "dest": "building-kit",
        "url": "https://kenney.nl/media/pages/assets/building-kit/0de7aaa492-1743244741/kenney_building-kit.zip",
        "models": ["column.glb", "roof-flat-center.glb", "wall-window-square-detailed.glb"],
    },
}

BUILDING_TYPES = {
    "default": [
        "suburban/building-type-a.glb", "suburban/building-type-c.glb",
        "modular/building-sample-house-a.glb", "modular/building-sample-house-b.glb",
        "modular/building-sample-house-c.glb",
    ],
    "apartment": [
        "suburban/building-type-h.glb", "suburban/building-type-b.glb",
        "suburban/building-type-m.glb", "modular/building-sample-tower-a.glb",
        "modular/building-sample-tower-b.glb", "modular/building-sample-tower-c.glb",
        "modular/building-sample-tower-d.glb",
    ],
    "commerce": [
        "commercial/building-a.glb", "commercial/building-b.glb",
        "commercial/building-c.glb", "modular/building-sample-tower-b.glb",
        "modular/building-sample-tower-c.glb",
    ],
    "civic": [
        "commercial/building-d.glb", "commercial/building-j.glb",
        "commercial/building-k.glb", "modular/building-sample-tower-a.glb",
    ],
    "subculture": [
        "commercial/building-m.glb", "commercial/building-n.glb",
        "mini-skate/half-pipe.glb", "mini-skate/structure-platform.glb",
    ],
    "industrial": [
        "industrial/building-a.glb", "industrial/building-c.glb",
        "industrial/building-e.glb", "industrial/building-g.glb",
        "factory/structure-tall.glb", "factory/structure-high.glb",
        "factory/structure-yellow-tall.glb", "retro-urban/scaffolding-structure.glb",
    ],
    "park": [
        "mini-forest/tree.glb", "mini-forest/tree-high.glb",
        "mini-forest/bridge.glb", "mini-forest/building-platform.glb",
    ],
    "playground": [
        "mini-skate/half-pipe.glb", "mini-skate/bowl-side.glb",
        "mini-skate/structure-platform.glb", "mini-skate/rail-low.glb",
    ],
    "sports_field": [
        "racing/grandStand.glb", "racing/grandStandAwning.glb",
        "racing/grandStandCovered.glb",
    ],
    "stadium": [
        "racing/grandStandCovered.glb", "racing/grandStandCoveredRound.glb",
        "racing/grandStandRound.glb",
    ],
    "ice_arena": ["racing/grandStandCoveredRound.glb", "racing/grandStandRound.glb"],
}

LANDMARKS = {
    "akershus": {"file": "castle/tower-square.glb", "scale": 1.15, "rotationY": 0.25},
    "ullevaal": {"file": "racing/grandStandCovered.glb", "scale": 1.15},
    "bislett": {"file": "racing/grandStandRound.glb", "scale": 1.2},
    "jordal": {"file": "racing/grandStandCoveredRound.glb", "scale": 1.15},
}

NEW_SCENERY = [
    {"file": "roads/construction-barrier.glb", "x": 0.446, "y": 0.606, "size": 0.18, "baseY": 0.12, "rotationY": 0.7},
    {"file": "roads/construction-cone.glb", "x": 0.454, "y": 0.610, "size": 0.07, "baseY": 0.12, "rotationY": 0.0},
    {"file": "roads/sign-highway.glb", "x": 0.632, "y": 0.646, "size": 0.24, "baseY": 0.12, "rotationY": 0.15},
    {"file": "train/train-diesel-a.glb", "x": 0.578, "y": 0.618, "size": 0.25, "baseY": 0.135, "rotationY": 1.15},
    {"file": "train/train-carriage-container-blue.glb", "x": 0.596, "y": 0.608, "size": 0.23, "baseY": 0.135, "rotationY": 1.15},
    {"file": "train/train-carriage-container-green.glb", "x": 0.613, "y": 0.598, "size": 0.23, "baseY": 0.135, "rotationY": 1.15},
    {"file": "retro-urban/truck-green-cargo.glb", "x": 0.684, "y": 0.512, "size": 0.28, "baseY": 0.12, "rotationY": -0.45},
    {"file": "retro-urban/truck-flat.glb", "x": 0.735, "y": 0.525, "size": 0.27, "baseY": 0.12, "rotationY": 2.1},
    {"file": "retro-urban/detail-dumpster-closed.glb", "x": 0.662, "y": 0.495, "size": 0.13, "baseY": 0.12, "rotationY": 0.2},
    {"file": "retro-urban/detail-light-traffic.glb", "x": 0.648, "y": 0.558, "size": 0.16, "baseY": 0.12, "rotationY": 0.1},
]


def download(url: str, destination: Path) -> None:
    last_error: Exception | None = None
    for attempt in range(1, 4):
        try:
            request = urllib.request.Request(
                url,
                headers={"User-Agent": "Mozilla/5.0 Civication-Model-Library-Builder/2.0"},
            )
            with urllib.request.urlopen(request, timeout=180) as response, destination.open("wb") as output:
                shutil.copyfileobj(response, output)
            if destination.stat().st_size < 1024:
                raise RuntimeError(f"Downloaded file is unexpectedly small: {destination}")
            return
        except Exception as exc:  # noqa: BLE001
            last_error = exc
            if attempt < 3:
                time.sleep(attempt * 2)
    raise RuntimeError(f"Failed to download {url}: {last_error}")


def safe_extract(zip_path: Path, destination: Path) -> None:
    with zipfile.ZipFile(zip_path) as archive:
        root = destination.resolve()
        for member in archive.infolist():
            target = (destination / member.filename).resolve()
            if root not in target.parents and target != root:
                raise RuntimeError(f"Unsafe ZIP member: {member.filename}")
        archive.extractall(destination)


def find_model(pack_root: Path, filename: str) -> Path:
    hits = [path for path in pack_root.rglob(filename) if path.is_file()]
    if not hits:
        raise FileNotFoundError(f"Could not find {filename} in {pack_root}")

    def score(path: Path) -> tuple[int, int, str]:
        text = path.as_posix().lower()
        if "glb format" in text:
            preference = 0
        elif "gltf format" in text:
            preference = 1
        else:
            preference = 2
        return preference, len(path.parts), text

    return sorted(hits, key=score)[0]


def glb_json(path: Path) -> dict:
    data = path.read_bytes()
    if len(data) < 20 or data[:4] != b"glTF":
        raise RuntimeError(f"Not a GLB container: {path}")
    version, declared_length = struct.unpack_from("<II", data, 4)
    if version != 2 or declared_length != len(data):
        raise RuntimeError(f"Invalid glTF 2.0 header: {path}")
    offset = 12
    while offset + 8 <= len(data):
        chunk_length, chunk_type = struct.unpack_from("<II", data, offset)
        offset += 8
        chunk = data[offset : offset + chunk_length]
        offset += chunk_length
        if chunk_type == 0x4E4F534A:
            return json.loads(chunk.decode("utf-8").rstrip("\x00 \t\r\n"))
    raise RuntimeError(f"GLB has no JSON chunk: {path}")


def external_uris(path: Path) -> set[str]:
    document = glb_json(path)
    uris: set[str] = set()
    for image in document.get("images", []):
        uri = image.get("uri")
        if uri and not uri.startswith("data:"):
            uris.add(uri)
    for buffer in document.get("buffers", []):
        uri = buffer.get("uri")
        if uri and not uri.startswith("data:"):
            uris.add(uri)
    return uris


def resolve_external(source_model: Path, pack_root: Path, uri: str) -> Path:
    relative = Path(*PurePosixPath(uri).parts)
    direct = source_model.parent / relative
    if direct.exists():
        return direct
    suffix = PurePosixPath(uri).as_posix().lower()
    exact_suffix = [
        path for path in pack_root.rglob(relative.name)
        if path.is_file() and path.as_posix().lower().endswith(suffix)
    ]
    if exact_suffix:
        return sorted(exact_suffix, key=lambda path: len(path.parts))[0]
    basename_hits = [path for path in pack_root.rglob(relative.name) if path.is_file()]
    if len(basename_hits) == 1:
        return basename_hits[0]
    raise FileNotFoundError(f"Could not resolve external GLB resource {uri} for {source_model}")


def copy_selected_models(work_root: Path) -> dict[str, list[str]]:
    library: dict[str, list[str]] = {}
    copied = 0
    for category, config in PACKS.items():
        zip_path = work_root / f"{category}.zip"
        extract_root = work_root / category
        print(f"Downloading {category}…")
        download(config["url"], zip_path)
        safe_extract(zip_path, extract_root)
        destination_root = ASSET_ROOT / config["dest"]
        destination_root.mkdir(parents=True, exist_ok=True)
        library[category] = []
        for filename in config["models"]:
            source = find_model(extract_root, filename)
            destination = destination_root / filename
            shutil.copy2(source, destination)
            for uri in external_uris(source):
                source_resource = resolve_external(source, extract_root, uri)
                relative = Path(*PurePosixPath(uri).parts)
                target_resource = destination_root / relative
                target_resource.parent.mkdir(parents=True, exist_ok=True)
                shutil.copy2(source_resource, target_resource)
            ref = f"{config['dest']}/{filename}"
            library[category].append(ref)
            copied += 1
    if copied != 80:
        raise RuntimeError(f"Expected exactly 80 selected models, copied {copied}")
    return library


def update_manifest(library: dict[str, list[str]]) -> dict:
    manifest = json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))
    manifest["_comment"] = (
        "Modell-register for Civication 3D-kartet (hybrid). buildingTypes og landmarks bruker "
        "kuraterte Kenney CC0-modeller med primitiv-fallback; scenery er kontrollert geografisk "
        "dekor/infrastruktur; assetLibrary eksponerer et bredere stedsspesifikt modellbibliotek uten "
        "å spre alt tilfeldig på Oslo-kartet. Veinettet forblir geografisk/prosedyralt."
    )
    manifest["buildingTypes"] = BUILDING_TYPES
    manifest["landmarks"] = LANDMARKS
    scenery = list(manifest.get("scenery", []))
    existing = {(item.get("file"), item.get("x"), item.get("y")) for item in scenery if isinstance(item, dict)}
    for item in NEW_SCENERY:
        key = (item["file"], item["x"], item["y"])
        if key not in existing:
            scenery.append(item)
            existing.add(key)
    manifest["scenery"] = scenery
    manifest["assetLibrary"] = library
    MANIFEST_PATH.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return manifest


def write_library_doc(library: dict[str, list[str]]) -> None:
    labels = {
        "urbanBuildings": "Modular Buildings – bygningsvariasjon",
        "urbanDetails": "Retro Urban – bydetaljer og industri",
        "roadInfrastructure": "City Kit Roads – infrastruktur",
        "rail": "Train Kit – jernbane",
        "skateparks": "Mini Skate – skateparker",
        "natureAreas": "Mini Forest – natur- og friluftsområder",
        "sportsVenues": "Racing Kit – tribuner og idrettsanlegg",
        "heritageFortress": "Castle Kit – festning og kulturarv",
        "amusementParks": "Coaster Kit – fornøyelsesparker",
        "architectureComponents": "Building Kit – arkitekturkomponenter",
    }
    lines = [
        "# Civication – kuratert 3D-modellbibliotek",
        "",
        "Dette er den brede modellkjernen for Civication-kartet. Biblioteket er kuratert fra Kenney CC0-pakker og er delt i tre brukslag:",
        "",
        "1. **buildingTypes** – modeller som fordeles deterministisk på faktiske History Go-steder etter stedstype.",
        "2. **landmarks/scenery** – modeller som bare brukes på kontrollerte, geografiske plasseringer.",
        "3. **assetLibrary** – modeller som er tilgjengelige for videre stedskobling uten å bli spredt tilfeldig i Oslo.",
        "",
        "Det geografiske/prosedyrale veinettet beholdes. Modellbiblioteket supplerer kartet; det erstatter ikke kartgeografien.",
        "",
        f"**Totalt nye kuraterte modeller: {sum(len(items) for items in library.values())}.**",
        "",
    ]
    for category, items in library.items():
        lines.extend([f"## {labels[category]}", "", f"{len(items)} modeller:", ""])
        lines.extend(f"- `{item}`" for item in items)
        lines.append("")
    LIBRARY_PATH.write_text("\n".join(lines), encoding="utf-8")


def iter_manifest_refs(manifest: dict):
    for definitions in (manifest.get("buildingTypes", {}), manifest.get("landmarks", {})):
        for value in definitions.values():
            values = value if isinstance(value, list) else [value]
            for item in values:
                if isinstance(item, str):
                    yield item
                elif isinstance(item, dict) and item.get("file"):
                    yield item["file"]
    for item in manifest.get("scenery", []):
        if isinstance(item, dict) and item.get("file"):
            yield item["file"]
    for values in manifest.get("assetLibrary", {}).values():
        for item in values:
            yield item


def validate(manifest: dict, library: dict[str, list[str]]) -> None:
    all_new = [ref for refs in library.values() for ref in refs]
    if len(all_new) != 80 or len(set(all_new)) != 80:
        raise RuntimeError("assetLibrary must contain exactly 80 unique new model refs")

    missing = sorted({ref for ref in iter_manifest_refs(manifest) if not (ASSET_ROOT / ref).exists()})
    if missing:
        raise RuntimeError("Manifest references missing model files:\n" + "\n".join(missing))

    for ref in all_new:
        model_path = ASSET_ROOT / ref
        for uri in external_uris(model_path):
            resource = model_path.parent / Path(*PurePosixPath(uri).parts)
            if not resource.exists():
                raise RuntimeError(f"Missing external resource for {ref}: {uri}")

    for item in manifest.get("scenery", []):
        if not isinstance(item, dict):
            continue
        x, y = item.get("x"), item.get("y")
        if x is not None and not 0 <= x <= 1:
            raise RuntimeError(f"Scenery x outside normalized map: {item}")
        if y is not None and not 0 <= y <= 1:
            raise RuntimeError(f"Scenery y outside normalized map: {item}")

    direct_refs = sum(
        len(value) if isinstance(value, list) else 1
        for value in manifest["buildingTypes"].values()
    )
    print("Validation OK")
    print(f"  library models: {len(all_new)}")
    print(f"  building type refs: {direct_refs}")
    print(f"  landmarks: {len(manifest['landmarks'])}")
    print(f"  scenery entries: {len(manifest['scenery'])}")
    print(f"  unique manifest model refs: {len(set(iter_manifest_refs(manifest)))}")


def main() -> None:
    if not MANIFEST_PATH.exists():
        raise FileNotFoundError(MANIFEST_PATH)
    with tempfile.TemporaryDirectory(prefix="civication-model-library-") as temp_dir:
        library = copy_selected_models(Path(temp_dir))
    manifest = update_manifest(library)
    write_library_doc(library)
    validate(manifest, library)


if __name__ == "__main__":
    main()
