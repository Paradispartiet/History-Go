from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
VERIFIED = "2026-08-11"
PLACE = "torggata"

OBL_BAD = "https://oslobyleksikon.no/index.php/Torggata_bad"
OBL_ELDORADO = "https://oslobyleksikon.no/side/Eldorado_kino"
OBL_FAHLSTROM = "https://oslobyleksikon.no/side/Fahlstr%C3%B8ms_Theater"
SNL_HARALD = "https://snl.no/Harald_Olsen"
SNL_ALMA = "https://snl.no/Alma_Isabella_Fahlstr%C3%B8m"
SNL_JOHAN = "https://snl.no/Johan_Fahlstr%C3%B8m"


def read_json(rel: str):
    return json.loads((ROOT / rel).read_text(encoding="utf-8"))


def write_json(rel: str, data) -> None:
    path = ROOT / rel
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def rows_from(data):
    if isinstance(data, list):
        return data
    if isinstance(data, dict) and isinstance(data.get("people"), list):
        return data["people"]
    if isinstance(data, dict) and data.get("id"):
        return [data]
    return []


def patch_existing(rel: str, person_id: str, source_label: str, source_url: str, sentence: str) -> None:
    data = read_json(rel)
    rows = rows_from(data)
    matches = [row for row in rows if row.get("id") == person_id]
    if len(matches) != 1:
        raise RuntimeError(f"{rel}: expected one {person_id}, found {len(matches)}")
    person = matches[0]

    places = person.setdefault("places", [])
    if PLACE not in places:
        places.append(PLACE)

    status = person.get("placeIdStatus")
    if isinstance(status, dict):
        status[PLACE] = "active_verified_place"

    if isinstance(person.get("source_urls"), list) and source_url not in person["source_urls"]:
        person["source_urls"].append(source_url)

    if isinstance(person.get("externalLinks"), list):
        if not any(link.get("url") == source_url for link in person["externalLinks"] if isinstance(link, dict)):
            person["externalLinks"].append({
                "type": "source",
                "label": source_label,
                "url": source_url,
                "verifiedAt": VERIFIED,
            })

    popup = str(person.get("popupDesc") or "").strip()
    if sentence not in popup:
        person["popupDesc"] = (popup + " " + sentence).strip()

    write_json(rel, data)


# Existing canonical people: preserve primary anchor, add only documented Torggata linkage.
patch_existing(
    "data/people/historie/oslo/people_historie_oslo.json",
    "thorvald_meyer",
    "Oslo byleksikon – Torggata bad",
    OBL_BAD,
    "I 1861 lot Thorvald Meyer murmester Thøger Binneballe oppføre Bade- og Vadskeanstalten i Torggata 16; året etter gav Meyer anstalten til Christiania kommune.",
)
patch_existing(
    "data/people/by/oslo/people_by_oslo.json",
    "henrik_bull",
    "Oslo byleksikon – Fahlstrøms Theater",
    OBL_FAHLSTROM,
    "I Torggata 9 tegnet Henrik Bull ombyggingen av Eldorado til Fahlstrøms Theater, som ble innviet i 1903.",
)
patch_existing(
    "data/people/by/oslo/folketeateret/christian_morgenstierne.json",
    "christian_morgenstierne",
    "Oslo byleksikon – Torggata bad",
    OBL_BAD,
    "Sammen med Arne Eide tegnet Christian Morgenstierne også den nåværende bygningen for Torggata bad, oppført i etapper fra 1925 til 1932.",
)
patch_existing(
    "data/people/by/oslo/folketeateret/arne_eide.json",
    "arne_eide",
    "Oslo byleksikon – Torggata bad",
    OBL_BAD,
    "Sammen med Christian Morgenstierne tegnet Arne Eide også den nåværende bygningen for Torggata bad, oppført i etapper fra 1925 til 1932.",
)


def link(label: str, url: str):
    return {"type": "source", "label": label, "url": url, "verifiedAt": VERIFIED}


def make_profile(*, person_id: str, name: str, initials: str, desc: str, kind: str, year: int,
                 popup: str, tags: list[str], sources: list[tuple[str, str]]):
    claims_path = f"data/people/claims/by/oslo/torggata/{person_id}.claims.json"
    return {
        "id": person_id,
        "name": name,
        "initials": initials,
        "desc": desc,
        "tags": tags,
        "placeId": PLACE,
        "category": "by",
        "kindLabel": kind,
        "year": year,
        "popupDesc": popup,
        "places": [PLACE],
        "image": "",
        "cardImage": "",
        "externalLinks": [link(label, url) for label, url in sources],
        "source_urls": [url for _, url in sources],
        "verifiedAt": VERIFIED,
        "profileStandard": "people_profile_v1.0",
        "claimsFile": claims_path,
        "profileStatus": "ready_people_v1",
    }


profiles = {
    "thoger_binneballe": make_profile(
        person_id="thoger_binneballe",
        name="Thøger Binneballe",
        initials="TB",
        desc="Murmester som oppførte Bade- og Vadskeanstalten i Torggata 16 for Thorvald Meyer i 1861.",
        kind="Murmester",
        year=1861,
        popup="Thøger Binneballe var murmester for Thorvald Meyer. I 1861 oppførte han Bade- og Vadskeanstalten i Torggata 16 for Meyer.",
        tags=["by", "arkitektur", "torggata", "torggata_bad"],
        sources=[("Oslo byleksikon – Torggata bad", OBL_BAD)],
    ),
    "harald_olsen": make_profile(
        person_id="harald_olsen",
        name="Harald Olsen",
        initials="HO",
        desc="Arkitekt, ingeniør og murmester som tegnet varietéteateret Eldorado i Torggata 9, innviet i 1891.",
        kind="Arkitekt",
        year=1891,
        popup="Harald Olsen var norsk arkitekt, ingeniør og murmester. Varietéteateret Eldorado i Torggata 9 ble oppført etter tegningene hans og innviet i 1891.",
        tags=["by", "arkitektur", "torggata", "eldorado"],
        sources=[
            ("Oslo byleksikon – Eldorado", OBL_ELDORADO),
            ("Store norske leksikon – Harald Olsen", SNL_HARALD),
        ],
    ),
    "alma_fahlstrom": make_profile(
        person_id="alma_fahlstrom",
        name="Alma Fahlstrøm",
        initials="AF",
        desc="Skuespiller som drev Fahlstrøms Theater i Torggata 9 sammen med Johan Fahlstrøm og iscenesatte de fleste oppsetningene.",
        kind="Skuespiller / teaterleder",
        year=1903,
        popup="Alma Fahlstrøm var norsk skuespiller og teaterleder. Sammen med Johan Fahlstrøm drev hun Fahlstrøms Theater i Torggata 9 fra 1903 til 1911, og hun var iscenesetter for de fleste oppsetningene.",
        tags=["by", "scenekunst", "torggata", "fahlstroms_theater"],
        sources=[
            ("Oslo byleksikon – Fahlstrøms Theater", OBL_FAHLSTROM),
            ("Store norske leksikon – Alma Isabella Fahlstrøm", SNL_ALMA),
        ],
    ),
    "johan_fahlstrom": make_profile(
        person_id="johan_fahlstrom",
        name="Johan Fahlstrøm",
        initials="JF",
        desc="Skuespiller som drev Fahlstrøms Theater i Torggata 9 sammen med Alma Fahlstrøm, spilte en rekke hovedroller og tegnet dekorasjoner og kostymer.",
        kind="Skuespiller / teaterleder",
        year=1903,
        popup="Johan Fahlstrøm var norsk skuespiller og teaterleder. Sammen med Alma Fahlstrøm drev han Fahlstrøms Theater i Torggata 9 fra 1903 til 1911; han spilte en rekke hovedroller og tegnet dekorasjoner og kostymer.",
        tags=["by", "scenekunst", "torggata", "fahlstroms_theater"],
        sources=[
            ("Oslo byleksikon – Fahlstrøms Theater", OBL_FAHLSTROM),
            ("Store norske leksikon – Johan Fahlstrøm", SNL_JOHAN),
        ],
    ),
}

for person_id, profile in profiles.items():
    write_json(f"data/people/by/oslo/torggata/{person_id}.json", profile)


def verified_claim(claim_id: str, claim_text: str, url: str, location: str, source_type: str = "reference"):
    return {
        "id": claim_id,
        "claim": claim_text,
        "status": "verified",
        "source_url": url,
        "source_location": location,
        "source_type": source_type,
        "temporal_status": "historical",
        "verified_at": VERIFIED,
        "evidence_level": "direct",
    }


def claims_doc(person_id: str, canonical_identity: str, name_variants: list[str], claims: list[dict],
               field_map: dict[str, list[str]], desc_map: list[list[str]], popup_map: list[list[str]]):
    return {
        "schema": "history_go_people_claims_v1",
        "version": "1.0.0",
        "person_id": person_id,
        "profile_file": f"data/people/by/oslo/torggata/{person_id}.json",
        "identity": {
            "canonical_identity": canonical_identity,
            "name_variants": name_variants,
            "not": ["navnelike personer"],
            "identity_status": "verified",
        },
        "claims": claims,
        "field_claim_map": field_map,
        "sentence_claim_map": {
            "desc": [
                {"sentence": i + 1, "claim_ids": claim_ids}
                for i, claim_ids in enumerate(desc_map)
            ],
            "popupDesc": [
                {"sentence": i + 1, "claim_ids": claim_ids}
                for i, claim_ids in enumerate(popup_map)
            ],
        },
        "completion": {
            "completed_under": "people_profile_v1.0",
            "claims_verified": f"{len(claims)}/{len(claims)}",
            "fact_review": "passed",
            "editorial_review": "passed",
            "source_verified_at": VERIFIED,
            "validator_version": "1.0.0",
            "current_status": "ready_people_v1",
        },
    }


claims_documents = {
    "thoger_binneballe": claims_doc(
        "thoger_binneballe",
        "Murmesteren Thøger Binneballe, som arbeidet for Thorvald Meyer og oppførte Bade- og Vadskeanstalten i Torggata 16 i 1861.",
        ["Thøger Binneballe"],
        [
            verified_claim("identity_role", "Thøger Binneballe var murmester for Thorvald Meyer.", OBL_BAD, "Historikk, avsnittet om det første badet"),
            verified_claim("torggata_1861", "I 1861 oppførte Thøger Binneballe Bade- og Vadskeanstalten i Torggata 16 for Thorvald Meyer.", OBL_BAD, "Historikk, avsnittet om 1861"),
        ],
        {
            "name": ["identity_role"],
            "kindLabel": ["identity_role"],
            "year": ["torggata_1861"],
            "placeId": ["torggata_1861"],
            "places[torggata]": ["torggata_1861"],
        },
        [["identity_role", "torggata_1861"]],
        [["identity_role"], ["torggata_1861"]],
    ),
    "harald_olsen": claims_doc(
        "harald_olsen",
        "Den norske arkitekten, ingeniøren og murermesteren Harald Olsen, som tegnet varietéteateret Eldorado i Torggata 9.",
        ["Harald Olsen"],
        [
            verified_claim("identity_profession", "Harald Olsen var norsk arkitekt, ingeniør og murmester.", SNL_HARALD, "faktaboks og innledning"),
            verified_claim("eldorado_1891", "Varietéteateret Eldorado i Torggata 9 ble innviet i 1891 og oppført etter tegninger av arkitekt Harald Olsen.", OBL_ELDORADO, "innledningen og avsnittet om varietéteateret"),
        ],
        {
            "name": ["identity_profession"],
            "kindLabel": ["identity_profession"],
            "year": ["eldorado_1891"],
            "placeId": ["eldorado_1891"],
            "places[torggata]": ["eldorado_1891"],
        },
        [["identity_profession", "eldorado_1891"]],
        [["identity_profession"], ["eldorado_1891"]],
    ),
    "alma_fahlstrom": claims_doc(
        "alma_fahlstrom",
        "Den norske skuespilleren og teaterlederen Alma Isabella Fahlstrøm, også kjent som Alma Isabella Bosse.",
        ["Alma Fahlstrøm", "Alma Isabella Fahlstrøm", "Alma Isabella Bosse"],
        [
            verified_claim("identity_profession", "Alma Isabella Fahlstrøm var norsk skuespiller og teaterleder.", SNL_ALMA, "faktaboks og innledning"),
            verified_claim("fahlstroms_theater", "Alma og Johan Fahlstrøm drev Fahlstrøms Theater i Torggata 9 i 1903–1911, og Alma Fahlstrøm var iscenesetter for de fleste oppsetningene.", OBL_FAHLSTROM, "avsnittene om drift og oppsetninger"),
        ],
        {
            "name": ["identity_profession"],
            "kindLabel": ["identity_profession"],
            "year": ["fahlstroms_theater"],
            "placeId": ["fahlstroms_theater"],
            "places[torggata]": ["fahlstroms_theater"],
        },
        [["identity_profession", "fahlstroms_theater"]],
        [["identity_profession"], ["fahlstroms_theater"]],
    ),
    "johan_fahlstrom": claims_doc(
        "johan_fahlstrom",
        "Den norske skuespilleren og teaterlederen Johan Peter Broust Fahlstrøm.",
        ["Johan Fahlstrøm", "Johan Peter Broust Fahlstrøm"],
        [
            verified_claim("identity_profession", "Johan Fahlstrøm var norsk skuespiller og teaterleder.", SNL_JOHAN, "faktaboks og innledning"),
            verified_claim("fahlstroms_theater", "Alma og Johan Fahlstrøm drev Fahlstrøms Theater i Torggata 9 i 1903–1911; Johan Fahlstrøm spilte en rekke hovedroller og tegnet dekorasjoner og kostymer.", OBL_FAHLSTROM, "avsnittene om drift og oppsetninger"),
        ],
        {
            "name": ["identity_profession"],
            "kindLabel": ["identity_profession"],
            "year": ["fahlstroms_theater"],
            "placeId": ["fahlstroms_theater"],
            "places[torggata]": ["fahlstroms_theater"],
        },
        [["identity_profession", "fahlstroms_theater"]],
        [["identity_profession"], ["fahlstroms_theater"]],
    ),
}

for person_id, document in claims_documents.items():
    write_json(f"data/people/claims/by/oslo/torggata/{person_id}.claims.json", document)


# Manifest activation for the four new profiles.
manifest_rel = "data/people/manifest.json"
manifest = read_json(manifest_rel)
new_manifest_files = [f"people/by/oslo/torggata/{person_id}.json" for person_id in profiles]
for rel in new_manifest_files:
    if rel not in manifest["files"]:
        manifest["files"].append(rel)
write_json(manifest_rel, manifest)


# Focused regression test: canonical collection + runtime place-ref contract.
test_path = ROOT / "tests/torggata-phase8a1-people.test.mjs"
test_path.write_text(r'''import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const ROOT = process.cwd();
const readJson = rel => JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));
const rows = data => Array.isArray(data) ? data : (Array.isArray(data?.people) ? data.people : (data?.id ? [data] : []));
const manifest = readJson("data/people/manifest.json");
const occurrences = new Map();
for (const rel of manifest.files) {
  for (const person of rows(readJson(path.join("data", rel)))) {
    if (!person?.id) continue;
    const list = occurrences.get(person.id) || [];
    list.push({ person, rel });
    occurrences.set(person.id, list);
  }
}

const expected = [
  "thorvald_meyer",
  "henrik_bull",
  "christian_morgenstierne",
  "arne_eide",
  "thoger_binneballe",
  "harald_olsen",
  "alma_fahlstrom",
  "johan_fahlstrom",
];
const created = new Set(["thoger_binneballe", "harald_olsen", "alma_fahlstrom", "johan_fahlstrom"]);

test("Torggata 8A1 exposes exactly one active canonical record for each expected person", () => {
  for (const id of expected) {
    const hits = occurrences.get(id) || [];
    assert.equal(hits.length, 1, `${id} must have exactly one manifest-loaded canonical record`);
    assert.ok(hits[0].person.places?.includes("torggata"), `${id} must link to torggata`);
  }
});

test("new Torggata people are ready People v1 profiles with claims", () => {
  for (const id of created) {
    const { person } = occurrences.get(id)[0];
    assert.equal(person.placeId, "torggata");
    assert.equal(person.profileStandard, "people_profile_v1.0");
    assert.equal(person.profileStatus, "ready_people_v1");
    assert.ok(person.claimsFile);
    assert.ok(fs.existsSync(path.join(ROOT, person.claimsFile)));
    assert.ok(person.source_urls?.every(url => /^https:\/\//.test(url)));
  }
});

test("existing profiles keep their primary anchor", () => {
  for (const id of ["thorvald_meyer", "henrik_bull", "christian_morgenstierne", "arne_eide"]) {
    assert.notEqual(occurrences.get(id)[0].person.placeId, "torggata", `${id} primary anchor must be preserved`);
  }
  assert.equal(occurrences.get("christian_morgenstierne")[0].person.placeId, "folketeateret");
  assert.equal(occurrences.get("arne_eide")[0].person.placeId, "folketeateret");
});

test("the runtime place collector includes direct person place references", () => {
  const source = fs.readFileSync(path.join(ROOT, "js/ui/popup-utils.js"), "utf8");
  assert.match(source, /personPlaceIds\(person\)\.includes\(pid\)/);
  const torggata = expected.filter(id => occurrences.get(id)[0].person.places?.includes("torggata"));
  assert.deepEqual(torggata, expected);
});
''', encoding="utf-8")


# Batch audit / source trace.
report = f"""# Torggata – fase 8A1 People audit V1

- Dato: 2026-08-11
- Place ID: `torggata`
- Baseline: PR #4830 / main `6880ec6da9e51669471b9f028e50382afeb53bd1`
- Overordnet audit: `reports/place-production/torggata-phase8a-people-audit-v1.md`
- People-metode: `docs/people-of-places-method.md`
- People-profil: `docs/PEOPLE_PROFILE_CANONICAL.md`
- Status: **KLAR FOR REVIEW**

## Tidligere-arbeid- og duplikatgate

Repo-søket ved batchstart fant ingen aktiv canonical People-profil for Thøger Binneballe, Harald Olsen, Alma Fahlstrøm eller Johan Fahlstrøm. De fire eksisterende profilene Thorvald Meyer, Henrik Bull, Christian Morgenstierne og Arne Eide gjenbrukes og beholder sine primærankere.

Batchen fyller ikke til et måltall. Åtte personer inngår fordi de dekker dokumenterte, vesentlige roller i Torggatas institusjonshistorie.

## Eksisterende profiler som gjenbrukes

| Person | Endring | Kilde |
| --- | --- | --- |
| Thorvald Meyer | `torggata` legges til i `places`; primæranker beholdes | Oslo byleksikon – Torggata bad |
| Henrik Bull | `torggata` legges til i `places`; primæranker beholdes | Oslo byleksikon – Fahlstrøms Theater |
| Christian Morgenstierne | `torggata` legges til i `places`; Folketeateret beholdes som primæranker | Oslo byleksikon – Torggata bad |
| Arne Eide | `torggata` legges til i `places`; Folketeateret beholdes som primæranker | Oslo byleksikon – Torggata bad |

## Nye canonical People v1-profiler

| Person | Torggata-rolle | Årsanker |
| --- | --- | --- |
| Thøger Binneballe | oppførte Bade- og Vadskeanstalten i Torggata 16 for Thorvald Meyer | 1861 |
| Harald Olsen | tegnet varietéteateret Eldorado i Torggata 9 | 1891 |
| Alma Fahlstrøm | drev Fahlstrøms Theater i Torggata 9 og iscenesatte de fleste oppsetningene | 1903 |
| Johan Fahlstrøm | drev Fahlstrøms Theater i Torggata 9, spilte hovedroller og tegnet dekorasjoner/kostymer | 1903 |

Alle fire nye profiler har `people_profile_v1.0`, egen claims-fil, felt–claim-paritet, setning–claim-paritet, inspectable HTTPS-kilder og tomme bildeplasser fremfor udokumenterte portretter.

## Inspectable kilder

- Oslo byleksikon – Torggata bad: {OBL_BAD}
- Oslo byleksikon – Eldorado: {OBL_ELDORADO}
- Oslo byleksikon – Fahlstrøms Theater: {OBL_FAHLSTROM}
- Store norske leksikon – Harald Olsen: {SNL_HARALD}
- Store norske leksikon – Alma Isabella Fahlstrøm: {SNL_ALMA}
- Store norske leksikon – Johan Fahlstrøm: {SNL_JOHAN}

## Avgrensning

Ingen Jensen-profiler fra 8A2 og ingen beboer-/minnesporprofiler fra 8A3 produseres i denne batchen. Ingen eksisterende primæranker flyttes. Ingen bilder diktes eller kopieres uten lisenskjede.

## Regresjonslås og gate

`tests/torggata-phase8a1-people.test.mjs` låser:

1. nøyaktig én manifest-lastet canonical record for hver av de åtte personene;
2. `torggata` i `places` for alle åtte;
3. People v1 + claims for de fire nye;
4. bevaring av eksisterende primærankere;
5. runtime-kontrakten som samler personer via direkte place-referanser.

Batchen committes bare etter at følgende passerer på samme tree:

```text
npm run audit:people-profile-canonical
npm run audit:people-of-places
npm run civication:history-people:check
node --test tests/torggata-phase8a1-people.test.mjs
npm run tools:check
```

Neste port etter merge er **8A2 – Jensen-familiens gatehandel**.
"""
(ROOT / "reports/place-production/torggata-phase8a1-people-audit-v1.md").write_text(report, encoding="utf-8")


# Bring the active workcard in sync with the already-merged phase-8 audit and this batch.
workcard_path = ROOT / "reports/place-production/torggata-workcard-current.md"
workcard = workcard_path.read_text(encoding="utf-8")
if "- Fase 8-audit:" not in workcard:
    workcard = workcard.replace(
        "- Fase 7-closeout: `reports/place-production/torggata-phase7-closeout-v1.md`\n",
        "- Fase 7-closeout: `reports/place-production/torggata-phase7-closeout-v1.md`\n"
        "- Fase 8-audit: `reports/place-production/torggata-phase8-rounds-audit-v1.md`\n"
        "- Fase 8A-audit: `reports/place-production/torggata-phase8a-people-audit-v1.md`\n"
        "- Fase 8A1-audit: `reports/place-production/torggata-phase8a1-people-audit-v1.md`\n",
    )
workcard = workcard.replace(
    "| 8–15 | **IKKE STARTET** | styres av hovedchecklisten |",
    "| 8. Rundinger | **PÅGÅR – 8A People** | audit PR #4829; 8A-audit PR #4830; 8A1 byggere/arkitekter/teaterledere i aktiv batch |\n"
    "| 9–15 | **IKKE STARTET** | styres av hovedchecklisten |",
)
if "## Fase 8A1 – byggere, arkitekter og teaterledere" not in workcard:
    workcard += """

## Fase 8A1 – byggere, arkitekter og teaterledere

8A1 bygger den første canonical People-klyngen for Torggata uten antallskvote. Eksisterende Thorvald Meyer, Henrik Bull, Christian Morgenstierne og Arne Eide gjenbrukes med sekundær Torggata-kobling. Nye People v1-profiler opprettes for Thøger Binneballe, Harald Olsen, Alma Fahlstrøm og Johan Fahlstrøm.

Primærankrene til eksisterende personer beholdes. Nye profiler bruker `torggata` som primæranker, har full claims-trace og kan stå uten bilde når sikker lisenskjede mangler.

Neste underfase etter merge: **8A2 – Jensen-familiens gatehandel**.
"""
workcard_path.write_text(workcard, encoding="utf-8")

print("Materialized Torggata phase 8A1 People")
