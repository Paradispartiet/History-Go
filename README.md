# 🧭 History GO

History GO er et stedbasert kunnskaps- og samlespill der byen fungerer som spillbrett.

Spilleren oppdager steder, sjekker inn, tar quiz/oppgaver, låser opp kunnskap, personer, funn, badges og ruter, og bygger sin egen samling gjennom profil og Wonderkammer.

Dette repoet gjelder **History GO-spillet**. Civication behandles som eget prosjekt og skal ikke styre History GO-hoveddokumentasjonen.

---

## Start her

- [`README/README.md`](./README/README.md) — hoved-README for History GO
- [`docs/HISTORY_GO_PRODUCT_MAP.md`](./docs/HISTORY_GO_PRODUCT_MAP.md) — ferdigstillelseskart: hva som mangler, hva som fullføres først, og hva som bør videreutvikles
- [`README/README_DEV.md`](./README/README_DEV.md) — operativ utvikler-README: lokal kjøring, validering, debugging og trygg teamflyt
- [`README/README.pensum.md`](./README/README.pensum.md) — fagkart, emner, pensum og progresjonslogikk
- [`docs/HG_SOCIAL_README.md`](./docs/HG_SOCIAL_README.md) — HG Social-kontrakt og sosialt lag

---

## Produktkjerne

History GO skal fullføres som ett stort spillunivers, ikke som en samling løse moduler.

Kjerneløypen er:

```text
Kart → Sted / PlaceCard → Innsjekk → Quiz / oppgave → Belønning → Profil / Wonderkammer → Neste sted / rute
```

Steder er navet. Profilen er spillerkortet. Wonderkammer er samlingen. Ruter er kampanjer. Social og Spotmeeting skal kobles til steder, funn, ruter og trygg offentlig møtebruk.

---

## Lokal kjøring

Bruk lokal webserver, ikke `file://`:

```bash
python -m http.server
```

Åpne deretter `index.html`.

Service worker, fetch av data og cache fungerer best via lokal server.

---

## Places index er build-output

- `data/places/places_index.json` er generert hurtigindeks/cache.
- Filen skal ikke redigeres manuelt.
- Source-filene under `data/places/...` er sannhetskilden.
- Hvilke source-filer som inngår styres av `data/places/manifest.json`.

Ved endring av steder, koordinater, radius, navn, bilder eller lette kortfelt:

```bash
node tools/build_places_index.mjs
node tools/check_places_index_sync.mjs
```

Hvis `places_index.json` er ute av sync, skal den regenereres fra source, ikke håndrettes.

---

## README-regel

Rot-README er bare inngang. Den skal ikke være idébibel, historisk lager eller lang beslutningslogg.

Én sannhet per dokument:

- produktstatus og ferdigstillelse: `docs/HISTORY_GO_PRODUCT_MAP.md`
- daglig utvikling: `README/README_DEV.md`
- fag/pensum: `README/README.pensum.md`
- hovedoversikt: `README/README.md`

Gamle tekstblokker skal konsolideres inn i riktig dokument, ikke kopieres videre i nye README-filer.
