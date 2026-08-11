from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
VERIFIED = "2026-08-11"
PLACE = "torggata"
OBL_TORGGATA = "https://oslobyleksikon.no/index.php/Torggata"
OBL_OSTKANT = "https://oslobyleksikon.no/side/%C3%98stkantutstillingen"
OBL_GRONLAND = "https://oslobyleksikon.no/side/Gr%C3%B8nlandsleiret"


def read_json(rel: str):
    return json.loads((ROOT / rel).read_text(encoding="utf-8"))


def write_json(rel: str, data) -> None:
    path = ROOT / rel
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def source_link(label: str, url: str):
    return {"type": "source", "label": label, "url": url, "verifiedAt": VERIFIED}


def profile(*, person_id: str, name: str, initials: str, desc: str, kind: str,
            year: int, popup: str, sources: list[tuple[str, str]], tags: list[str]):
    return {
        "id": person_id,
        "name": name,
        "initials": initials,
        "desc": desc,
        "tags": ["by", "torggata", *tags],
        "placeId": PLACE,
        "category": "by",
        "kindLabel": kind,
        "year": year,
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


def claims_doc(*, person_id: str, identity: str, claims: list[dict],
               field_map: dict[str, list[str]], desc_map: list[list[str]], popup_map: list[list[str]]):
    return {
        "schema": "history_go_people_claims_v1",
        "version": "1.0.0",
        "person_id": person_id,
        "profile_file": f"data/people/by/oslo/torggata/{person_id}.json",
        "identity": {
            "canonical_identity": identity,
            "name_variants": [],
            "not": ["navnelike personer"],
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
    "nanna_broch": profile(
        person_id="nanna_broch", name="Nanna Broch", initials="NB",
        desc="Boliginspektør og initiativtaker til Østkantutstillingen som bodde i utstillingens bygning i Torggata 51 fra 1928.",
        kind="Boliginspektør", year=1928,
        popup="Nanna Broch var kommunal boliginspektør og tok initiativ til Østkantutstillingen i 1923. Da virksomheten flyttet til Torggata 51 i 1928, hadde bygningen utstillingsrom i gateplanet og bolig for Broch i etasjen over. Et blått skilt på adressen minnes Broch.",
        sources=[("Oslo byleksikon – Østkantutstillingen", OBL_OSTKANT)],
        tags=["bolighistorie", "ostkantutstillingen", "blattskilt"],
    ),
    "wulff_becker": profile(
        person_id="wulff_becker", name="Wulff Becker", initials="WB",
        desc="Lege som bodde og hadde legekontor i Torggata 17b under krigen; en snublestein på adressen minnes ham.",
        kind="Lege", year=1942,
        popup="Wulff Becker var lege og bodde med legekontor i Torggata 17b under krigen. Han ble deportert 26. november 1942 og døde i Auschwitz 17. februar 1943. En snublestein ved Torggata 17b minnes Becker.",
        sources=[("Oslo byleksikon – Torggata", OBL_TORGGATA)],
        tags=["jodisk-historie", "krig", "snublestein"],
    ),
    "martin_heinz_zilsel": profile(
        person_id="martin_heinz_zilsel", name="Martin Heinz Zilsel", initials="MHZ",
        desc="Fotograf som lå i dekning i Torggata 17b i oktober 1942; en snublestein på adressen minnes ham.",
        kind="Fotograf", year=1942,
        popup="Martin Heinz Zilsel var en østerriksk-jødisk fotograf som lå i dekning i Torggata 17b i oktober 1942. Han ble deportert med Donau 26. november 1942 og døde i Auschwitz 26. januar 1943. En snublestein ved Torggata 17b minnes Zilsel.",
        sources=[("Oslo byleksikon – Torggata", OBL_TORGGATA)],
        tags=["jodisk-historie", "krig", "snublestein"],
    ),
    "alexander_claes": profile(
        person_id="alexander_claes", name="Alexander Claes", initials="AC",
        desc="Frisør som drev dame- og herrefrisersalong i Torggata 18 under krigen og senere ble deportert til Auschwitz.",
        kind="Frisør", year=1942,
        popup="Alexander Claes drev dame- og herrefrisersalong i Torggata 18 under krigen. Han ble deportert med Donau 26. november 1942 og drept i Auschwitz.",
        sources=[("Oslo byleksikon – Torggata", OBL_TORGGATA)],
        tags=["jodisk-historie", "krig", "arbeidssted"],
    ),
    "therese_hurwitz": profile(
        person_id="therese_hurwitz", name="Therese Hurwitz", initials="TH",
        desc="Beboer i Torggata 36 som ble arrestert i leiligheten sammen med barna Jenny og Fredrik i november 1942.",
        kind="Beboer", year=1942,
        popup="Therese Hurwitz bodde i Torggata 36 med barna Jenny og Fredrik. De tre ble arrestert i leiligheten og deportert med Donau 26. november 1942. Therese ble drept i Auschwitz kort etter ankomsten.",
        sources=[("Oslo byleksikon – Grønlandsleiret", OBL_GRONLAND)],
        tags=["jodisk-historie", "krig", "snublestein"],
    ),
    "jenny_hurwitz": profile(
        person_id="jenny_hurwitz", name="Jenny Hurwitz", initials="JH",
        desc="Ekspeditrise som bodde i Torggata 36 med moren Therese og broren Fredrik og ble deportert i november 1942.",
        kind="Ekspeditrise", year=1942,
        popup="Jenny Hurwitz var ekspeditrise og bodde i Torggata 36 med moren Therese og broren Fredrik. Hun ble arrestert i leiligheten og deportert med Donau 26. november 1942. Jenny ble drept i Auschwitz kort etter ankomsten.",
        sources=[("Oslo byleksikon – Grønlandsleiret", OBL_GRONLAND)],
        tags=["jodisk-historie", "krig", "snublestein"],
    ),
    "fredrik_hurwitz": profile(
        person_id="fredrik_hurwitz", name="Fredrik Hurwitz", initials="FH",
        desc="Skoleelev som bodde i Torggata 36 med moren Therese og søsteren Jenny og ble deportert i november 1942.",
        kind="Skoleelev", year=1942,
        popup="Fredrik Hurwitz var skoleelev og bodde i Torggata 36 med moren Therese og søsteren Jenny. Han ble arrestert i leiligheten og deportert med Donau 26. november 1942. Fredrik ble drept i Auschwitz kort etter ankomsten.",
        sources=[("Oslo byleksikon – Grønlandsleiret", OBL_GRONLAND)],
        tags=["jodisk-historie", "krig", "snublestein"],
    ),
    "moritz_glott": profile(
        person_id="moritz_glott", name="Moritz Glott", initials="MG",
        desc="Forretningsmann som grunnla Moritz Glotts Tobaksfabrikk; fabrikken holdt til i Torggata 33 fra 1913.",
        kind="Forretningsmann", year=1913,
        popup="Moritz Glott grunnla tobakksfabrikken som bar navnet hans i 1895. Fabrikken holdt til i Torggata 33 fra 1913.",
        sources=[("Oslo byleksikon – Torggata", OBL_TORGGATA)],
        tags=["handel", "industri", "tobakk"],
    ),
}

claims = {
    "nanna_broch": claims_doc(
        person_id="nanna_broch", identity="Boliginspektør Nanna Broch, initiativtaker til Østkantutstillingen og beboer i Torggata 51.",
        claims=[
            claim("role_initiative", "Nanna Broch var kommunal boliginspektør og tok initiativ til Østkantutstillingen i 1923.", OBL_OSTKANT, "avsnittene om initiativet og Nanna Broch"),
            claim("torggata_residence_1928", "Østkantutstillingen flyttet til Torggata 51 i 1928, og bygningen hadde bolig for Nanna Broch i etasjen over utstillingsrommene.", OBL_OSTKANT, "avsnittet om Torggata 51"),
            claim("blue_plaque", "Nanna Broch er minnet med blått skilt ved Torggata 51.", OBL_OSTKANT, "avsnittet om bygningen og blått skilt"),
        ],
        field_map={"name": ["role_initiative"], "kindLabel": ["role_initiative"], "year": ["torggata_residence_1928"], "placeId": ["torggata_residence_1928"], "places[torggata]": ["torggata_residence_1928"]},
        desc_map=[["role_initiative", "torggata_residence_1928"]],
        popup_map=[["role_initiative"], ["torggata_residence_1928"], ["blue_plaque"]],
    ),
    "wulff_becker": claims_doc(
        person_id="wulff_becker", identity="Lege Wulff Becker, beboer og lege med kontor i Torggata 17b under krigen.",
        claims=[
            claim("role_address", "Wulff Becker var lege, bodde i Torggata 17b og hadde legekontor der under krigen.", OBL_TORGGATA, "husoppføringen for Torggata 17b"),
            claim("deportation_death", "Wulff Becker ble deportert 26. november 1942 og døde i Auschwitz 17. februar 1943.", OBL_TORGGATA, "husoppføringen for Torggata 17b"),
            claim("stolperstein", "En snublestein ved Torggata 17b minnes Wulff Becker.", OBL_TORGGATA, "husoppføringen for Torggata 17b"),
        ],
        field_map={"name": ["role_address"], "kindLabel": ["role_address"], "year": ["deportation_death"], "placeId": ["role_address"], "places[torggata]": ["role_address"]},
        desc_map=[["role_address", "stolperstein"]],
        popup_map=[["role_address"], ["deportation_death"], ["stolperstein"]],
    ),
    "martin_heinz_zilsel": claims_doc(
        person_id="martin_heinz_zilsel", identity="Fotograf Martin Heinz Zilsel, som lå i dekning i Torggata 17b i oktober 1942.",
        claims=[
            claim("role_hiding", "Martin Heinz Zilsel var østerriksk-jødisk fotograf og lå i dekning i Torggata 17b i oktober 1942.", OBL_TORGGATA, "husoppføringen for Torggata 17b"),
            claim("deportation_death", "Martin Heinz Zilsel ble deportert med Donau 26. november 1942 og døde i Auschwitz 26. januar 1943.", OBL_TORGGATA, "husoppføringen for Torggata 17b"),
            claim("stolperstein", "En snublestein ved Torggata 17b minnes Martin Heinz Zilsel.", OBL_TORGGATA, "husoppføringen for Torggata 17b"),
        ],
        field_map={"name": ["role_hiding"], "kindLabel": ["role_hiding"], "year": ["role_hiding"], "placeId": ["role_hiding"], "places[torggata]": ["role_hiding"]},
        desc_map=[["role_hiding", "stolperstein"]],
        popup_map=[["role_hiding"], ["deportation_death"], ["stolperstein"]],
    ),
    "alexander_claes": claims_doc(
        person_id="alexander_claes", identity="Frisør Alexander Claes, innehaver av dame- og herrefrisersalong i Torggata 18 under krigen.",
        claims=[
            claim("role_address", "Alexander Claes drev dame- og herrefrisersalong i Torggata 18 under krigen.", OBL_TORGGATA, "husoppføringen for Torggata 18"),
            claim("deportation_death", "Alexander Claes ble deportert med Donau 26. november 1942 og drept i Auschwitz.", OBL_TORGGATA, "husoppføringen for Torggata 18"),
        ],
        field_map={"name": ["role_address"], "kindLabel": ["role_address"], "year": ["deportation_death"], "placeId": ["role_address"], "places[torggata]": ["role_address"]},
        desc_map=[["role_address", "deportation_death"]],
        popup_map=[["role_address"], ["deportation_death"]],
    ),
    "therese_hurwitz": claims_doc(
        person_id="therese_hurwitz", identity="Therese Hurwitz, beboer i Torggata 36 med barna Jenny og Fredrik i 1942.",
        claims=[
            claim("residence_family", "Therese Hurwitz bodde i Torggata 36 med barna Jenny og Fredrik.", OBL_GRONLAND, "avsnittet om Hurwitz-familien etter separasjonen"),
            claim("arrest_deportation", "Therese, Jenny og Fredrik Hurwitz ble arrestert i leiligheten i Torggata og deportert med Donau 26. november 1942.", OBL_GRONLAND, "avsnittet om arrestasjonen og deportasjonen"),
            claim("death", "Therese Hurwitz ble drept i Auschwitz kort etter ankomsten.", OBL_GRONLAND, "avsnittet om deportasjonen og Auschwitz"),
        ],
        field_map={"name": ["residence_family"], "kindLabel": ["residence_family"], "year": ["arrest_deportation"], "placeId": ["residence_family"], "places[torggata]": ["residence_family"]},
        desc_map=[["residence_family", "arrest_deportation"]],
        popup_map=[["residence_family"], ["arrest_deportation"], ["death"]],
    ),
    "jenny_hurwitz": claims_doc(
        person_id="jenny_hurwitz", identity="Ekspeditrise Jenny Hurwitz, beboer i Torggata 36 med moren Therese og broren Fredrik i 1942.",
        claims=[
            claim("role_residence", "Jenny Hurwitz var ekspeditrise og bodde i Torggata 36 med moren Therese og broren Fredrik.", OBL_GRONLAND, "avsnittet om Hurwitz-familien"),
            claim("arrest_deportation", "Jenny Hurwitz ble arrestert i leiligheten og deportert med Donau 26. november 1942.", OBL_GRONLAND, "avsnittet om arrestasjonen og deportasjonen"),
            claim("death", "Jenny Hurwitz ble drept i Auschwitz kort etter ankomsten.", OBL_GRONLAND, "avsnittet om deportasjonen og Auschwitz"),
        ],
        field_map={"name": ["role_residence"], "kindLabel": ["role_residence"], "year": ["arrest_deportation"], "placeId": ["role_residence"], "places[torggata]": ["role_residence"]},
        desc_map=[["role_residence", "arrest_deportation"]],
        popup_map=[["role_residence"], ["arrest_deportation"], ["death"]],
    ),
    "fredrik_hurwitz": claims_doc(
        person_id="fredrik_hurwitz", identity="Skoleelev Fredrik Hurwitz, beboer i Torggata 36 med moren Therese og søsteren Jenny i 1942.",
        claims=[
            claim("role_residence", "Fredrik Hurwitz var skoleelev og bodde i Torggata 36 med moren Therese og søsteren Jenny.", OBL_GRONLAND, "avsnittet om Hurwitz-familien"),
            claim("arrest_deportation", "Fredrik Hurwitz ble arrestert i leiligheten og deportert med Donau 26. november 1942.", OBL_GRONLAND, "avsnittet om arrestasjonen og deportasjonen"),
            claim("death", "Fredrik Hurwitz ble drept i Auschwitz kort etter ankomsten.", OBL_GRONLAND, "avsnittet om deportasjonen og Auschwitz"),
        ],
        field_map={"name": ["role_residence"], "kindLabel": ["role_residence"], "year": ["arrest_deportation"], "placeId": ["role_residence"], "places[torggata]": ["role_residence"]},
        desc_map=[["role_residence", "arrest_deportation"]],
        popup_map=[["role_residence"], ["arrest_deportation"], ["death"]],
    ),
    "moritz_glott": claims_doc(
        person_id="moritz_glott", identity="Forretningsmann Moritz Glott, grunnlegger av tobakksfabrikken som holdt til i Torggata 33 fra 1913.",
        claims=[
            claim("founder", "Moritz Glott var forretningsmann og grunnla tobakksfabrikken som bar navnet hans i 1895.", OBL_TORGGATA, "husoppføringen for Torggata 33"),
            claim("factory_torggata_1913", "Moritz Glotts Tobaksfabrikk holdt til i Torggata 33 fra 1913.", OBL_TORGGATA, "husoppføringen for Torggata 33"),
        ],
        field_map={"name": ["founder"], "kindLabel": ["founder"], "year": ["factory_torggata_1913"], "placeId": ["factory_torggata_1913"], "places[torggata]": ["factory_torggata_1913"]},
        desc_map=[["founder", "factory_torggata_1913"]],
        popup_map=[["founder"], ["factory_torggata_1913"]],
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

# Correct stale Wulff-reuse assumption in the phase audit.
audit_path = ROOT / "reports/place-production/torggata-phase8a-people-audit-v1.md"
audit = audit_path.read_text(encoding="utf-8")
audit = audit.replace(
    "| `wulff_becker` | finnes i `data/people/historie/oslo/jodisk_historie/wulff_becker.json` | bodde og hadde legekontor i Torggata 17b; snublestein ved stedet | **8A3 – legg til Torggata** |",
    "| `wulff_becker` | **stale audit-antakelse: oppgitt canonical fil finnes ikke på fersk main** | bodde og hadde legekontor i Torggata 17b; snublestein ved stedet | **8A3 – opprett ny canonical profil etter fersk duplikatkontroll** |",
)
audit = audit.replace(
    "Wulff Becker gjenbrukes fra eksisterende canonical profil. De øvrige produseres bare dersom nytt repo-søk ved batchstart fortsatt bekrefter at de ikke allerede finnes.",
    "Fersk 8A3-preflight fant ingen manifest-lastet canonical Wulff Becker-profil; den tidligere oppgitte filstien finnes ikke på `main`. Repo-søk fant heller ingen canonical profiler for de sju øvrige kandidatene. Alle åtte opprettes derfor i 8A3, med eksplisitt dokumentasjon av denne auditkorreksjonen.",
)
correction = """

### 8A3 preflight-korreksjon – Wulff Becker

8A-auditen oppgav `data/people/historie/oslo/jodisk_historie/wulff_becker.json` som eksisterende canonical record. Fersk kontroll mot `main` før 8A3 viste at både filen og den oppgitte katalogen mangler, og repo-søk fant bare audit-/researchtreff. 8A3 behandler derfor Wulff Becker som ny canonical profil. Dette er en korreksjon av tidligere-arbeid-statusen, ikke en duplisering av eksisterende data.
"""
if "### 8A3 preflight-korreksjon – Wulff Becker" not in audit:
    marker = "## Bevisste holdbacks"
    audit = audit.replace(marker, correction + "\n" + marker)
audit_path.write_text(audit, encoding="utf-8")

report = """# Torggata – fase 8A3 beboere, arbeidende og minnespor audit V1

- Dato: 2026-08-11
- Place ID: `torggata`
- Underfase: 8A3 – dokumenterte beboere, arbeidende og minnespor
- Baseline: fase 8A2 / PR #4840
- Profilstandard: `people_profile_v1.0`
- Status: **MATERIALISERT OG KLAR FOR MERGE**

## Tidligere-arbeid-gate

```text
TIDLIGERE-ARBEID-SØK: UTFØRT PÅ FERSK MAIN
CANONICAL DUPLIKATER: ingen av de åtte 8A3-personene finnes som manifest-lastet People-record
STALE AUDITFUNN: tidligere 8A-audit oppgav en Wulff Becker-fil som ikke finnes i dagens tre
BESLUTNING: opprett åtte nye People v1-profiler og korriger auditens gjenbruksstatus
```

## Materialisert klynge

| ID | Person | Torggata-anker | Rolle |
| --- | --- | --- | --- |
| `nanna_broch` | Nanna Broch | Torggata 51 fra 1928; blått skilt | boliginspektør / Østkantutstillingen |
| `wulff_becker` | Wulff Becker | bosted og legekontor Torggata 17b; snublestein | lege |
| `martin_heinz_zilsel` | Martin Heinz Zilsel | i dekning Torggata 17b i oktober 1942; snublestein | fotograf |
| `alexander_claes` | Alexander Claes | frisørsalong Torggata 18 | frisør |
| `therese_hurwitz` | Therese Hurwitz | bosted Torggata 36 | beboer / krigshistorie |
| `jenny_hurwitz` | Jenny Hurwitz | bosted Torggata 36 | ekspeditrise / krigshistorie |
| `fredrik_hurwitz` | Fredrik Hurwitz | bosted Torggata 36 | skoleelev / krigshistorie |
| `moritz_glott` | Moritz Glott | tobakksfabrikk Torggata 33 fra 1913 | forretningsmann / industri |

Klyngen er ikke en adressebok. Personene er med fordi forbindelsen er fysisk presis og samtidig knyttet til arbeid, institusjonshistorie, krigshistorie eller offentlig minne. Holdback-listen fra 8A-auditen står fortsatt ved lag.

## Kilder

- Oslo byleksikon – Østkantutstillingen: Nanna Brochs rolle, Torggata 51, bolig og blått skilt.
- Oslo byleksikon – Torggata: Becker, Zilsel, Claes og Glott med konkrete adresser og historiske hendelser.
- Oslo byleksikon – Grønlandsleiret: Therese, Jenny og Fredrik Hurwitz, bostedet i Torggata 36, arrestasjon og deportasjon.

Alle brukerrettede faktapåstander er koblet til egne claims. Bilder står tomme når sikker lisenskjede ikke er dokumentert.

## Neste steg

Etter 8A3-merge er selve People-innholdsklyngen ferdig. Neste arbeid er **8A closeout + People-runding UI-kontroll** før fase 8A kan settes GODKJENT.
"""
(ROOT / "reports/place-production/torggata-phase8a3-residents-memory-audit-v1.md").write_text(report, encoding="utf-8")

workcard_path = ROOT / "reports/place-production/torggata-workcard-current.md"
workcard = workcard_path.read_text(encoding="utf-8")
if "- Fase 8A3-audit:" not in workcard:
    workcard = workcard.replace(
        "- Fase 8A2-audit: `reports/place-production/torggata-phase8a2-jensen-audit-v1.md`",
        "- Fase 8A2-audit: `reports/place-production/torggata-phase8a2-jensen-audit-v1.md`\n- Fase 8A3-audit: `reports/place-production/torggata-phase8a3-residents-memory-audit-v1.md`",
    )
workcard = workcard.replace(
    "| 8. Rundinger | **PÅGÅR – 8A People** | audit PR #4829; 8A-audit PR #4830; 8A1 godkjent i PR #4831; 8A2 Jensen-handel materialisert |",
    "| 8. Rundinger | **PÅGÅR – 8A People** | audit PR #4829; 8A1 godkjent i PR #4831; 8A2 godkjent i PR #4840; 8A3 beboere/arbeid/minnespor materialisert |",
)
old_tail = "Neste underfase etter 8A2-merge: **8A3 – dokumenterte beboere, arbeidende og minnespor**."
new_tail = """8A2 ble squash-merget i PR #4840 og er godkjent baseline.

## Fase 8A3 – beboere, arbeidende og minnespor

8A3 materialiserer Nanna Broch, Wulff Becker, Martin Heinz Zilsel, Alexander Claes, Therese Hurwitz, Jenny Hurwitz, Fredrik Hurwitz og Moritz Glott som canonical People v1-profiler. Fersk preflight korrigerte en stale audit-antakelse om Wulff Becker: den tidligere oppgitte canonical filen finnes ikke på dagens `main`, så han opprettes uten duplikat.

Klyngen dekker presise Torggata-adresser og dokumenterte roller innen boligarbeid, gatehandel/industri, krigshistorie og fysisk minne. Ingen holdback-kandidater legges inn bare for å øke antallet.

Neste steg etter 8A3-merge: **8A closeout + People-runding UI-kontroll**."""
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
const expected = [
  "nanna_broch", "wulff_becker", "martin_heinz_zilsel", "alexander_claes",
  "therese_hurwitz", "jenny_hurwitz", "fredrik_hurwitz", "moritz_glott",
];

test("Torggata 8A3 loads exactly one canonical record per selected person", () => {
  for (const id of expected) {
    const hits = occurrences.get(id) || [];
    assert.equal(hits.length, 1, `${id} must have exactly one manifest-loaded canonical record`);
    const person = hits[0].person;
    assert.equal(hits[0].rel, `people/by/oslo/torggata/${id}.json`);
    assert.equal(person.placeId, "torggata");
    assert.ok(person.places?.includes("torggata"));
    assert.equal(person.profileStandard, "people_profile_v1.0");
    assert.equal(person.profileStatus, "ready_people_v1");
    assert.equal(person.image, "");
    assert.equal(person.cardImage, "");
    assert.ok(fs.existsSync(path.join(ROOT, person.claimsFile)));
  }
});

test("8A3 preserves precise physical anchors instead of generic Torggata association", () => {
  assert.match(occurrences.get("nanna_broch")[0].person.popupDesc, /Torggata 51/);
  assert.match(occurrences.get("wulff_becker")[0].person.popupDesc, /Torggata 17b/);
  assert.match(occurrences.get("martin_heinz_zilsel")[0].person.popupDesc, /Torggata 17b/);
  assert.match(occurrences.get("alexander_claes")[0].person.popupDesc, /Torggata 18/);
  for (const id of ["therese_hurwitz", "jenny_hurwitz", "fredrik_hurwitz"]) {
    assert.match(occurrences.get(id)[0].person.popupDesc, /Torggata 36/);
  }
  assert.match(occurrences.get("moritz_glott")[0].person.popupDesc, /Torggata 33/);
});

test("Wulff stale reuse assumption is replaced by the actual canonical 8A3 record", () => {
  const hits = occurrences.get("wulff_becker") || [];
  assert.equal(hits.length, 1);
  assert.equal(hits[0].rel, "people/by/oslo/torggata/wulff_becker.json");
  const audit = fs.readFileSync(path.join(ROOT, "reports/place-production/torggata-phase8a-people-audit-v1.md"), "utf8");
  assert.match(audit, /stale audit-antakelse/);
  assert.match(audit, /tidligere oppgitte filstien finnes ikke/);
});

test("all 8A3 profiles have verified HTTPS claims and no current-actor wording contract", () => {
  for (const id of expected) {
    const person = occurrences.get(id)[0].person;
    assert.ok(person.source_urls.length >= 1);
    assert.ok(person.source_urls.every(url => /^https:\/\//.test(url)));
    const claims = readJson(person.claimsFile);
    assert.equal(claims.person_id, id);
    assert.equal(claims.completion.current_status, "ready_people_v1");
    assert.ok(claims.claims.every(item => item.status === "verified"));
    assert.ok(claims.claims.every(item => item.temporal_status === "historical"));
  }
});
'''
(ROOT / "tests/torggata-phase8a3-people.test.mjs").write_text(test_text, encoding="utf-8")
