import json

profile_path = "data/fag/naeringsliv/handelshogskolefordypning_internasjonal_operations_v1.json"
with open(profile_path, encoding="utf-8") as handle:
    document = json.load(handle)

patches = {
    ("mod_naering_multinasjonale_globale_verdikjeder", "introductory"): (
        "Sammenlign eksport, lisens, joint venture og heleid etablering for ett dokumentert marked. "
        "Beregn kapitalbehov, forventet margin, kontrollgrad og landrisiko for hvert alternativ, og bruk CAGE-rammen til å forklare hvordan institusjonell, kulturell, geografisk og økonomisk avstand påvirker gjennomførbarheten."
    ),
    ("mod_naering_operations_kapasitet", "introductory"): (
        "Kartlegg en avgrenset ende-til-ende-prosess med ankomster, aktivitetstider, kapasitet og kvalitetsutfall. "
        "Beregn kapasitetsutnyttelse, arbeid i prosess og gjennomløp med Little’s law, identifiser flaskehalsen og kontroller at enheter og tidsperioder er konsistente."
    ),
    ("mod_naering_innkjop_kvalitet_forsyningsrisiko", "introductory"): (
        "Sammenlign tre dokumenterte leverandørtilbud ved å beregne total eierkostnad, kvalitetsjustert leverandørscore og forventet leveringstid. "
        "Forklar hvordan pris, feilrate, transport, kapitalbinding og kontraktsvilkår påvirker rangeringen."
    ),
    ("mod_naering_innkjop_kvalitet_forsyningsrisiko", "intermediate"): (
        "Bygg en lager- og avbruddsmodell med etterspørselsvariasjon, ledetid, sikkerhetslager og forventet tap ved leveransestans. "
        "Sammenlign single- og dual-sourcing og stresstest resultatet mot leverandørsvikt, prisøkning og endret tjenestenivå."
    ),
    ("mod_naering_prosjektledelse_prosjektokonomi", "introductory"): (
        "Bygg en WBS, nettverksplan og kostnadsbaseline for et avgrenset prosjekt med dokumenterte aktiviteter, avhengigheter og ressurser. "
        "Finn kritisk linje, beregn planlagt varighet og kontroller at arbeidsomfang, milepæler og budsjett kan avstemmes."
    ),
}

seen = set()
for profile in document["profiles"]:
    for level in ("introductory", "intermediate", "advanced"):
        key = (profile["module_id"], level)
        if key in patches:
            profile["progression"][level]["activity"] = patches[key]
            seen.add(key)

missing = set(patches) - seen
if missing:
    raise SystemExit(f"Fant ikke profiler som skulle rettes: {sorted(missing)}")

with open(profile_path, "w", encoding="utf-8") as handle:
    json.dump(document, handle, ensure_ascii=False, indent=2)
    handle.write("\n")

audit_path = "scripts/audit-category-governance.mjs"
with open(audit_path, encoding="utf-8") as handle:
    audit_source = handle.read()
bad = r'const pattern = new RegExp(`const\s+${constantName}\s*=\s*\[([\s\S]*?)\]`, "m");'
good = r'const pattern = new RegExp(`const\\s+${constantName}\\s*=\\s*\\[([\\s\\S]*?)\\]`, "m");'
if bad not in audit_source:
    raise SystemExit("Fant ikke regulæruttrykket som skulle escapes")
audit_source = audit_source.replace(bad, good, 1)
with open(audit_path, "w", encoding="utf-8") as handle:
    handle.write(audit_source)
