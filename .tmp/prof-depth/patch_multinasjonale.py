import json

path = "data/fag/naeringsliv/handelshogskolefordypning_internasjonal_operations_v1.json"
with open(path, encoding="utf-8") as handle:
    document = json.load(handle)

for profile in document["profiles"]:
    if profile["module_id"] == "mod_naering_multinasjonale_globale_verdikjeder":
        profile["progression"]["introductory"]["activity"] = (
            "Sammenlign eksport, lisens, joint venture og heleid etablering for ett dokumentert marked. "
            "Beregn kapitalbehov, forventet margin, kontrollgrad og landrisiko for hvert alternativ, og bruk CAGE-rammen til å forklare hvordan institusjonell, kulturell, geografisk og økonomisk avstand påvirker gjennomførbarheten."
        )
        break
else:
    raise SystemExit("Fant ikke mod_naering_multinasjonale_globale_verdikjeder")

with open(path, "w", encoding="utf-8") as handle:
    json.dump(document, handle, ensure_ascii=False, indent=2)
    handle.write("\n")
