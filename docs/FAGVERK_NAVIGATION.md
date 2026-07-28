# Fagverket — canonical navigasjons- og siderollekontrakt

Status: **canonical og bindende navigasjonskontrakt v2**  
Eier: `fagverk_navigation_contract`  
Forside: `fagverk-forside.html`  
Register: `data/fagverk/fagverk_portal.json`  
Sist kontrollert: **2026-07-28**

Dette dokumentet eier bare navigasjon, adresser og sideroller.

Den samlede arkitekturen, produksjonsrekkefølgen, statusmodellen og ferdigkravene for alle fagsidene eies av:

- [`FAGVERK.md`](./FAGVERK.md)

Fagdataenes universelle struktur eies av:

- [`SUBJECT_FILE_CONTRACT.md`](./SUBJECT_FILE_CONTRACT.md)
- [`../data/fag/fag_manifest.json`](../data/fag/fag_manifest.json)

---

## 1. Hovedregel

Headerens **Fagverket** skal alltid åpne den felles fagverkforsiden:

```text
fagverk-forside.html
```

Headeren skal aldri sende brukeren direkte til politikk eller et annet enkeltfag.

---

## 2. To adskilte fagspesifikke mål

Hvert fagområde har to forskjellige produktroller:

1. **Merket** — badge, undermerker, poeng, nivå, quizprogresjon og steder.
2. **Faget** — fagstruktur, pensum, fagområder, emner, metoder og lærekapitler.

Merkesiden og fagsiden skal:

- ha forskjellige adresser;
- ha tydelige og forskjellige navigasjonsnavn;
- ikke omtales som samme side;
- kunne bruke de samme canonicale fag-ID-ene uten å kopiere hverandres produktansvar.

---

## 3. Fagverkforsiden

Fagverkforsiden leser:

- canonical fagrekkefølge og labels fra `data/categories/category_contract.json`;
- merke- og fagsidemål fra `data/fagverk/fagverk_portal.json`;
- merkeidentitet og nivådata fra eide badgekilder.

Hvert kort skal vise:

- **Åpne merket** når `badgePage` finnes;
- **Åpne faget** når `subjectStatus` er `materialized` og `subjectPage` finnes;
- en ikke-klikkbar, ærlig status når fagsiden fortsatt er `planned`.

Portalen skal aldri sende brukeren til en side som ender i «ukjent fag», politikkfallback eller en tom fagflate.

---

## 4. Canonical fagsideadresse

Alle teknisk materialiserte fag bruker:

```text
fagverk.html?subject=<subject_id>
```

Eksempler:

```text
fagverk.html?subject=politikk
fagverk.html?subject=natur
fagverk.html?subject=historie
```

`subject_id` skal komme fra kategorikontrakten og finnes i fagmanifestet. Runtime skal ikke godta implisitte fagaliaser.

---

## 5. Dypkoblinger

### Fagområde

```text
fagverk.html?subject=<subject_id>&domain=<domain_id>
```

### Emne

```text
fagverk.html?subject=<subject_id>&domain=<domain_id>&emne=<emne_id>
```

Dypkoblingen skal:

- bevare valgt fag;
- validere domain- og emne-ID mot den manifest-resolverte fagpakken;
- vise tydelig feil ved ugyldig ID;
- aldri falle tilbake til politikk eller første tilgjengelige emne.

---

## 6. Merkesidelenker

Fagsiden skal finne riktig merkeside gjennom portalregisteret eller en annen eksplisitt eid rute, ikke gjennom hardkodet politikklenke.

Politikk er dagens materialiserte eksempel:

```text
Merke: data/fag/politikk/merke_politikk.html
Fag:   fagverk.html?subject=politikk
```

Denne konkrete politikkruten er ikke en generell filmal for andre fag.

---

## 7. Stedssider

Alle canonicale steder bruker stabil adresse:

```text
fagverk-sted.html?place=<place_id>
```

Fagsiden kan lenke til relevante steder, men stedets tverrfaglige innhold skal forbli på stedssiden.

Stedssiden kan lenke tilbake til:

- fagverkforsiden;
- relevant merkeside;
- ett eller flere relevante fagområder og emner;
- kartet.

Kategoridesign og bildekontrakt eies av [`FAGVERK_PLACE_DESIGN.md`](./FAGVERK_PLACE_DESIGN.md).

---

## 8. Portalregisterets smale ansvar

`data/fagverk/fagverk_portal.json` eier bare:

- `id`;
- `badgePage`;
- `subjectPage`;
- `subjectStatus`.

Regler:

- `badgePage` skal peke til en eksisterende merkeside eller eksplisitt fallbackside;
- `subjectPage` skal bare settes når fagsiden er teknisk materialisert;
- `subjectStatus: "planned"` skal gi ikke-klikkbar status;
- `subjectStatus: "materialized"` krever fungerende side og grønn fagverkaudit;
- registeret skal følge canonical rekkefølge fra kategorikontrakten;
- registeret skal ikke kopiere pensum, emner, metoder, kapitler, badgeinnhold eller progresjon.

Redaksjonell ferdigstatus eies ikke av portalregisteret. Se [`FAGVERK.md`](./FAGVERK.md).

---

## 9. Navigasjon i fagsiden

En fagside skal minst ha tydelige mål til:

- Fagverkforsiden;
- riktig merkeside;
- Min progresjon;
- Kartet.

Fagsidens interne navigasjon skal kunne åpne:

- fagoversikt;
- canonicale fagområder;
- canonicale emner;
- materialiserte lærekapitler;
- relevante stedssider.

Ingen lenketekst skal bruke «Politikkmerket» eller annen fagspesifikk tekst på en annen fagside.

---

## 10. Link- og regresjonsgate

Permanent linkaudit skal kontrollere:

- header → `fagverk-forside.html`;
- fagverkforside → eksisterende merkesider;
- alle `materialized` subjectPage-mål;
- at `planned` fag ikke har aktiv fagsidelenke;
- at merkeside og fagside er forskjellige mål;
- at fagsiden løser riktig merkeside for valgt `subject`;
- domain- og emnedypkoblinger;
- stedssidelenker;
- fravær av politikkfallback og døde ruter.

Den samlede QA- og ferdigmodellen ligger i [`FAGVERK.md`](./FAGVERK.md).

---

## 11. Endringsregel

Endringer i adresser, sideroller eller portalregisterets navigasjonssemantikk skal gjøres her.

Endringer i:

- generell fagsidearkitektur;
- adaptere og normalisert modell;
- produksjonsrekkefølge;
- materialiserings- og ferdigkrav;
- fag-for-fag arbeidskort;
- samlet QA-program

skal gjøres i [`FAGVERK.md`](./FAGVERK.md), ikke dupliseres her.
