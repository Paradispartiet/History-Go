from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
VERIFIED = "2026-08-11"
PLACE = "torggata"
OBL_TORGGATA = "https://oslobyleksikon.no/index.php/Torggata"
OBL_ADELSTEN = "https://oslobyleksikon.no/side/Adelsten_Jensen"
SNL_IRGENS_JENSEN = "https://snl.no/Ludvig_Irgens-Jensen"


def read_json(rel: str):
    return json.loads((ROOT / rel).read_text(encoding="utf-8"))


def write_json(rel: str, data) -> None:
    path = ROOT / rel
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def source_link(label: str, url: str):
    return {"type": "source", "label": label, "url": url, "verifiedAt": VERIFIED}


def profile(*, person_id: str, name: str, initials: str, desc: str, kind: str,
            popup: str, sources: list[tuple[str, str]], year: int | None = None):
    data = {
        "id": person_id,
        "name": name,
        "initials": initials,
        "desc": desc,
        "tags": ["by", "handel", "torggata", "jensen-familien"],
        "placeId": PLACE,
        "category": "by",
        "kindLabel": kind,
        "popupDesc": popup,
        "places": [PLACE],
        "image": "",
        "cardImage": "",
        "externalLinks": [source_link(label, url) for label, url in sources],
        "source_urls": list(dict.fromkeys(url for _, url in sources)),
        "verifiedAt": VERIFIED,
        "profileStandard": "people_profile_v1.0",
        "claimsFile": f"data/people/claims/by/oslo/torggata/{person_id}.claims.json",
        "profileStatus": "ready_people_v1",
    }
    if year is not None:
        data["year"] = year
    return data


def claim(claim_id: str, text: str, url: str, location: str, *, evidence: str = "direct"):
    return {
        "id": claim_id,
        "claim": text,
        "status": "verified",
        "source_url": url,
        "source_location": location,
        "source_type": "recognized_reference",
        "temporal_status": "historical",
        "verified_at": VERIFIED,
        "evidence_level": evidence,
    }


def claims_file(*, person_id: str, identity: str, name_variants: list[str], claims: list[dict],
                field_map: dict[str, list[str]], desc_map: list[list[str]], popup_map: list[list[str]]):
    return {
        "schema": "history_go_people_claims_v1",
        "version": "1.0.0",
        "person_id": person_id,
        "profile_file": f"data/people/by/oslo/torggata/{person_id}.json",
        "identity": {
            "canonical_identity": identity,
            "name_variants": name_variants,
            "not": ["navnelike personer", "firmaet som selvstendig person"],
            "identity_status": "verified",
        },
        "claims": claims,
        "field_claim_map": field_map,
        "sentence_claim_map": {
            "desc": [{"sentence": i + 1, "claim_ids": ids} for i, ids in enumerate(desc_map)],
            "popupDesc": [{"sentence": i + 1, "claim_ids": ids} for i, ids in enumerate(popup_map)],
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


people = {
    "ludvig_christian_jensen": profile(
        person_id="ludvig_christian_jensen",
        name="Ludvig Christian Jensen",
        initials="LCJ",
        desc="Delikatessehandler som drev Ludvig Jensen & Co. i Torggata 5a fra 1873 og bodde i nr. 5 fra 1873 til 1888.",
        kind="Delikatessehandler",
        year=1873,
        popup="Ludvig Christian Jensen (1834–1910) drev delikatesseforretningen Ludvig Jensen & Co. i Torggata 5a fra 1873. Han bodde også i Torggata 5 fra 1873 til 1888.",
        sources=[("Oslo byleksikon – Torggata", OBL_TORGGATA)],
    ),
    "adelsten_jensen": profile(
        person_id="adelsten_jensen",
        name="Adelsten Jensen",
        initials="AJ",
        desc="Forretningsdrivende som grunnla Adelsten Jensen i Torggata 2 i 1890; forretningen flyttet til Torggata 1 i 1901.",
        kind="Forretningsdrivende",
        year=1890,
        popup="Adelsten Jensen (1866–1918) grunnla herre- og barneekviperingsforretningen Adelsten Jensen i 1890. Forretningen startet i Torggata 2 og flyttet i 1901 til Hasselgården i Torggata 1. Han var en av Ludvig Christian Jensens fire sønner.",
        sources=[("Oslo byleksikon – Adelsten Jensen", OBL_ADELSTEN), ("Oslo byleksikon – Torggata", OBL_TORGGATA)],
    ),
    "peter_marinius_jensen": profile(
        person_id="peter_marinius_jensen",
        name="Peter Marinius Jensen",
        initials="PMJ",
        desc="Kjøpmann og sønn av Ludvig Christian Jensen som drev P. M. Jensen, kjøttvare- og delikatessebutikk i Torggata 5b fra 1896.",
        kind="Kjøpmann",
        year=1896,
        popup="Peter Marinius Jensen (1860–1939) var kjøpmann og en av Ludvig Christian Jensens fire sønner. Fra 1896 drev han kjøttvare- og delikatessebutikken P. M. Jensen i Torggata 5b, ved siden av farens forretning.",
        sources=[("Oslo byleksikon – Torggata", OBL_TORGGATA), ("Store norske leksikon – Ludvig Irgens-Jensen", SNL_IRGENS_JENSEN)],
    ),
    "karl_a_jensen": profile(
        person_id="karl_a_jensen",
        name="Karl A. Jensen",
        initials="KAJ",
        desc="Sønn av Ludvig Christian Jensen som drev vilt- og lakseforretning i Torggata 7 fra 1914.",
        kind="Forretningsdrivende",
        year=1914,
        popup="Karl A. Jensen (1861–1917) var en av Ludvig Christian Jensens fire sønner. Fra 1914 drev han vilt- og lakseforretning i Torggata 7.",
        sources=[("Oslo byleksikon – Torggata", OBL_TORGGATA)],
    ),
    "thorvald_jensen": profile(
        person_id="thorvald_jensen",
        name="Thorvald Jensen",
        initials="TJ",
        desc="Yngstesønn av Ludvig Christian Jensen og kompanjong i farens Ludvig Jensen & Co. i Torggata.",
        kind="Kompanjong",
        popup="Thorvald Jensen (1870–1916) var yngstesønn av Ludvig Christian Jensen. Oslo byleksikon oppgir at han ble kompanjong i farens firma, Ludvig Jensen & Co., som holdt til i Torggata 5a.",
        sources=[("Oslo byleksikon – Torggata", OBL_TORGGATA)],
    ),
}

claims = {
    "ludvig_christian_jensen": claims_file(
        person_id="ludvig_christian_jensen",
        identity="Ludvig Christian Jensen (1834–1910), delikatessehandleren bak Ludvig Jensen & Co. i Torggata 5a.",
        name_variants=["Ludvig Christian Jensen", "Ludvig Jensen"],
        claims=[
            claim("identity_lifespan", "Ludvig Christian Jensen levde 1834–1910.", OBL_TORGGATA, "avsnittet om Jensen-familiens fire forretninger"),
            claim("business_torggata_1873", "Ludvig Christian Jensen hadde delikatesseforretningen Ludvig Jensen & Co. i Torggata 5a fra 1873.", OBL_TORGGATA, "avsnittet om Jensen-familiens fire forretninger"),
            claim("residence_torggata_1873_1888", "Ludvig Christian Jensen bodde i Torggata 5 fra 1873 til 1888.", OBL_TORGGATA, "husoppføringen for Torggata 5"),
        ],
        field_map={"name": ["identity_lifespan"], "kindLabel": ["business_torggata_1873"], "year": ["business_torggata_1873"], "placeId": ["business_torggata_1873", "residence_torggata_1873_1888"], "places[torggata]": ["business_torggata_1873", "residence_torggata_1873_1888"]},
        desc_map=[["business_torggata_1873", "residence_torggata_1873_1888"]],
        popup_map=[["identity_lifespan", "business_torggata_1873"], ["residence_torggata_1873_1888"]],
    ),
    "adelsten_jensen": claims_file(
        person_id="adelsten_jensen",
        identity="Adelsten Jensen (1866–1918), grunnleggeren av herre- og barneekviperingsforretningen Adelsten Jensen.",
        name_variants=["Adelsten Jensen"],
        claims=[
            claim("identity_business_lifespan", "Adelsten Jensen (1866–1918) grunnla herre- og barneekviperingsforretningen Adelsten Jensen i 1890.", OBL_ADELSTEN, "innledningen"),
            claim("torggata_address_chronology", "Forretningen startet i Torggata 2 og flyttet i 1901 til Hasselgården i Torggata 1.", OBL_ADELSTEN, "innledningen og avsnittet om lokalene"),
            claim("jensen_family_relation", "Adelsten Jensen var en av Ludvig Christian Jensens fire sønner.", OBL_TORGGATA, "avsnittet om Jensen-familiens fire forretninger"),
        ],
        field_map={"name": ["identity_business_lifespan"], "kindLabel": ["identity_business_lifespan"], "year": ["identity_business_lifespan"], "placeId": ["torggata_address_chronology"], "places[torggata]": ["torggata_address_chronology"]},
        desc_map=[["identity_business_lifespan", "torggata_address_chronology"]],
        popup_map=[["identity_business_lifespan"], ["torggata_address_chronology"], ["jensen_family_relation"]],
    ),
    "peter_marinius_jensen": claims_file(
        person_id="peter_marinius_jensen",
        identity="Kjøpmann Peter Marinius Jensen (1860–1939), sønn av Ludvig Christian Jensen og innehaver av P. M. Jensen i Torggata 5b.",
        name_variants=["Peter Marinius Jensen", "P. M. Jensen"],
        claims=[
            claim("identity_profession_lifespan", "Peter Marinius Jensen var kjøpmann og levde 1860–1939.", SNL_IRGENS_JENSEN, "faktaboksens familieopplysninger om Ludvig Irgens-Jensens far"),
            claim("jensen_family_relation", "Peter Marinius Jensen var en av Ludvig Christian Jensens fire sønner.", OBL_TORGGATA, "avsnittet om Jensen-familiens fire forretninger"),
            claim("business_torggata_1896", "Peter Marinius Jensen drev kjøttvare- og delikatessebutikken P. M. Jensen i Torggata 5b fra 1896, ved siden av farens forretning.", OBL_TORGGATA, "avsnittet om Jensen-familiens fire forretninger"),
        ],
        field_map={"name": ["identity_profession_lifespan"], "kindLabel": ["identity_profession_lifespan"], "year": ["business_torggata_1896"], "placeId": ["business_torggata_1896"], "places[torggata]": ["business_torggata_1896"]},
        desc_map=[["identity_profession_lifespan", "jensen_family_relation", "business_torggata_1896"]],
        popup_map=[["identity_profession_lifespan", "jensen_family_relation"], ["business_torggata_1896"]],
    ),
    "karl_a_jensen": claims_file(
        person_id="karl_a_jensen",
        identity="Karl A. Jensen (1861–1917), sønn av Ludvig Christian Jensen og innehaver av vilt- og lakseforretning i Torggata 7.",
        name_variants=["Karl A. Jensen"],
        claims=[
            claim("identity_lifespan_family", "Karl A. Jensen levde 1861–1917 og var en av Ludvig Christian Jensens fire sønner.", OBL_TORGGATA, "avsnittet om Jensen-familiens fire forretninger"),
            claim("business_torggata_1914", "Karl A. Jensen drev vilt- og lakseforretning i Torggata 7 fra 1914.", OBL_TORGGATA, "avsnittet om Jensen-familiens fire forretninger"),
        ],
        field_map={"name": ["identity_lifespan_family"], "kindLabel": ["business_torggata_1914"], "year": ["business_torggata_1914"], "placeId": ["business_torggata_1914"], "places[torggata]": ["business_torggata_1914"]},
        desc_map=[["identity_lifespan_family", "business_torggata_1914"]],
        popup_map=[["identity_lifespan_family"], ["business_torggata_1914"]],
    ),
    "thorvald_jensen": claims_file(
        person_id="thorvald_jensen",
        identity="Thorvald Jensen (1870–1916), yngstesønn av Ludvig Christian Jensen og kompanjong i farens Ludvig Jensen & Co.",
        name_variants=["Thorvald Jensen"],
        claims=[
            claim("identity_lifespan_family", "Thorvald Jensen levde 1870–1916 og var yngstesønn av Ludvig Christian Jensen.", OBL_TORGGATA, "avsnittet om Jensen-familiens fire forretninger"),
            claim("partner_fathers_firm", "Thorvald Jensen ble kompanjong i farens firma, Ludvig Jensen & Co., som holdt til i Torggata 5a.", OBL_TORGGATA, "avsnittet om Jensen-familiens fire forretninger"),
        ],
        field_map={"name": ["identity_lifespan_family"], "kindLabel": ["partner_fathers_firm"], "placeId": ["partner_fathers_firm"], "places[torggata]": ["partner_fathers_firm"]},
        desc_map=[["identity_lifespan_family", "partner_fathers_firm"]],
        popup_map=[["identity_lifespan_family"], ["partner_fathers_firm"]],
    ),
}

for person_id, data in people.items():
    write_json(f"data/people/by/oslo/torggata/{person_id}.json", data)
    write_json(f"data/people/claims/by/oslo/torggata/{person_id}.claims.json", claims[person_id])

manifest = read_json("data/people/manifest.json")
for person_id in people:
    rel = f"people/by/oslo/torggata/{person_id}.json"
    if rel not in manifest["files"]:
        manifest["files"].append(rel)
write_json("data/people/manifest.json", manifest)

audit_path = ROOT / "reports/place-production/torggata-phase8a-people-audit-v1.md"
audit = audit_path.read_text(encoding="utf-8")
audit = audit.replace(
    "2. Adelsten Jensen (1866–1916) – herre- og barneekvipering i nr. 1 fra 1893.",
    "2. Adelsten Jensen (1866–1918) – grunnla herre- og barneekviperingsforretningen i Torggata 2 i 1890; flyttet til Torggata 1 i 1901.",
)
conflict_note = """

### 8A2 kildepresisering – Adelsten Jensen

Den generelle Torggata-artikkelen oppgir Adelsten Jensen som 1866–1916 og forenkler Torggata 1-koblingen til 1893. Oslo byleksikons egen Adelsten Jensen-artikkel oppgir 1866–1918, grunnleggelse i Torggata 2 i 1890 og flytting til Hasselgården i Torggata 1 i 1901. 8A2 bruker den dedikerte person-/firmaartikkelen for disse metadataene, mens Torggata-artikkelen fortsatt brukes for familieklyngen. Konflikten er dermed eksplisitt dokumentert og den eldre arbeidslisten skal ikke gjenbrukes ukritisk.
"""
if "### 8A2 kildepresisering – Adelsten Jensen" not in audit:
    marker = "### 8A3 – dokumenterte beboere, arbeidende og minnespor"
    audit = audit.replace(marker, conflict_note + "\n" + marker)
audit_path.write_text(audit, encoding="utf-8")

phase_report = """# Torggata – fase 8A2 Jensen-handel audit V1

- Dato: 2026-08-11
- Place ID: `torggata`
- Underfase: 8A2 – Jensen-familiens gatehandel
- Baseline: fase 8A1 / PR #4831
- Profilstandard: `people_profile_v1.0`
- Status: **MATERIALISERT OG KLAR FOR MERGE**

## Tidligere-arbeid-gate

```text
TIDLIGERE-ARBEID-SØK: UTFØRT PÅ FERSK MAIN
CANONICAL DUPLIKATER: ingen av de fem Jensen-personene finnes som manifest-lastet People-record
EKSISTERENDE TREFF: Torggata-place, kilde-/auditmateriale og eldre research – ikke People-profiler
BESLUTNING: REELT NYTT PEOPLE-ARBEID; opprett fem profiler samlet for konsistent familie- og adressekontroll
```

## Kilder og kildekonflikt

Hovedkilden er Oslo byleksikons Torggata-artikkel, som eksplisitt fremhever Jensen-familien fordi den tidligere hadde fire forretninger i gaten. For Adelsten Jensen brukes i tillegg den dedikerte Oslo byleksikon-artikkelen. Den oppgir 1866–1918, grunnleggelse i Torggata 2 i 1890 og flytting til Torggata 1 i 1901. Dette korrigerer 8A-preflightens eldre 1866–1916 / «nr. 1 fra 1893»-formulering. Peter Marinius Jensens identitet, levetid og yrkesbetegnelse som kjøpmann krysskontrolleres mot Store norske leksikons biografi om sønnen Ludvig Irgens-Jensen.

## Materialiserte profiler

| ID | Person | Torggata-rolle | Primærår |
| --- | --- | --- | --- |
| `ludvig_christian_jensen` | Ludvig Christian Jensen | Ludvig Jensen & Co., Torggata 5a; bosted i nr. 5 | 1873 |
| `adelsten_jensen` | Adelsten Jensen | startet i Torggata 2; Hasselgården nr. 1 fra 1901 | 1890 |
| `peter_marinius_jensen` | Peter Marinius Jensen | P. M. Jensen, Torggata 5b | 1896 |
| `karl_a_jensen` | Karl A. Jensen | vilt- og lakseforretning, Torggata 7 | 1914 |
| `thorvald_jensen` | Thorvald Jensen | kompanjong i farens Ludvig Jensen & Co. | ikke datert i kilden |

Alle fem har egen claims-fil, felt–claim-paritet, setning–claim-paritet, eksplisitt Torggata-kobling, sikre HTTPS-kilder og tomme bildefelt fremfor oppdiktede eller lisensielt uklare portretter.

## Avgrensning

8A2 lager ikke butikkatalog og utvider ikke til andre Jensen-navn bare fordi de har handelstilknytning i Oslo. Klyngen er begrenset til familien som Oslo byleksikon selv fremhever som særpreget for Torggata. Axel Jensen-bedriften i Torggata 13 er et annet familiefirma og inngår ikke i denne klyngen.

## Neste steg

Etter merge går 8A videre til **8A3 – dokumenterte beboere, arbeidende og minnespor**. 8A som helhet lukkes først etter 8A3 og People-rundingens UI-kontroll.
"""
(ROOT / "reports/place-production/torggata-phase8a2-jensen-audit-v1.md").write_text(phase_report, encoding="utf-8")

workcard_path = ROOT / "reports/place-production/torggata-workcard-current.md"
workcard = workcard_path.read_text(encoding="utf-8")
if "- Fase 8A2-audit:" not in workcard:
    workcard = workcard.replace(
        "- Fase 8A1-audit: `reports/place-production/torggata-phase8a1-people-audit-v1.md`",
        "- Fase 8A1-audit: `reports/place-production/torggata-phase8a1-people-audit-v1.md`\n- Fase 8A2-audit: `reports/place-production/torggata-phase8a2-jensen-audit-v1.md`",
    )
workcard = workcard.replace(
    "| 8. Rundinger | **PÅGÅR – 8A People** | audit PR #4829; 8A-audit PR #4830; 8A1 byggere/arkitekter/teaterledere i aktiv batch |",
    "| 8. Rundinger | **PÅGÅR – 8A People** | audit PR #4829; 8A-audit PR #4830; 8A1 godkjent i PR #4831; 8A2 Jensen-handel materialisert |",
)
old_tail = "Neste underfase etter merge: **8A2 – Jensen-familiens gatehandel**."
new_tail = """8A1 ble squash-merget i PR #4831 og er nå godkjent baseline for videre People-produksjon.

## Fase 8A2 – Jensen-familiens gatehandel

8A2 materialiserer fem nye canonical People v1-profiler: Ludvig Christian Jensen, Adelsten Jensen, Peter Marinius Jensen, Karl A. Jensen og Thorvald Jensen. Klyngen er stedshistorisk avgrenset av Oslo byleksikons eksplisitte observasjon om Jensen-familiens fire forretninger i Torggata, ikke av en antallskvote eller generell butikkatalog.

Adelsten-metadataene er korrigert mot den dedikerte Oslo byleksikon-artikkelen: 1866–1918, oppstart i Torggata 2 i 1890 og flytting til Torggata 1 i 1901. Alle fem profiler har egen claims-trace; Thorvalds `year` utelates fordi kilden ikke daterer når han ble kompanjong.

Neste underfase etter 8A2-merge: **8A3 – dokumenterte beboere, arbeidende og minnespor**."""
if old_tail in workcard:
    workcard = workcard.replace(old_tail, new_tail)
workcard_path.write_text(workcard, encoding="utf-8")

test_text = r'''import assert from "node:assert/strict";
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
const expected = ["ludvig_christian_jensen", "adelsten_jensen", "peter_marinius_jensen", "karl_a_jensen", "thorvald_jensen"];

test("Torggata 8A2 loads exactly one canonical Jensen record per person", () => {
  for (const id of expected) {
    const hits = occurrences.get(id) || [];
    assert.equal(hits.length, 1, `${id} must have exactly one manifest-loaded canonical record`);
    assert.equal(hits[0].person.placeId, "torggata");
    assert.ok(hits[0].person.places?.includes("torggata"));
    assert.equal(hits[0].person.profileStandard, "people_profile_v1.0");
    assert.equal(hits[0].person.profileStatus, "ready_people_v1");
    assert.ok(fs.existsSync(path.join(ROOT, hits[0].person.claimsFile)));
  }
});

test("Adelsten uses the dedicated source chronology instead of the older shorthand", () => {
  const { person } = occurrences.get("adelsten_jensen")[0];
  assert.match(person.popupDesc, /1866–1918/);
  assert.match(person.popupDesc, /Torggata 2/);
  assert.match(person.popupDesc, /1901/);
  assert.doesNotMatch(person.popupDesc, /1866–1916/);
  assert.ok(person.source_urls.includes("https://oslobyleksikon.no/side/Adelsten_Jensen"));
});

test("Thorvald does not invent a dated partnership year", () => {
  const { person } = occurrences.get("thorvald_jensen")[0];
  assert.equal(Object.hasOwn(person, "year"), false);
  assert.match(person.popupDesc, /kompanjong/);
  assert.match(person.popupDesc, /Torggata 5a/);
});

test("all Jensen profiles have HTTPS source chains and completed claims", () => {
  for (const id of expected) {
    const { person } = occurrences.get(id)[0];
    assert.ok(person.source_urls.length >= 1);
    assert.ok(person.source_urls.every(url => /^https:\/\//.test(url)));
    const claims = readJson(person.claimsFile);
    assert.equal(claims.person_id, id);
    assert.equal(claims.completion.current_status, "ready_people_v1");
    assert.ok(claims.claims.every(item => item.status === "verified"));
  }
});
'''
(ROOT / "tests/torggata-phase8a2-jensen.test.mjs").write_text(test_text, encoding="utf-8")
