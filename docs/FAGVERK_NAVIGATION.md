# Fagverket — canonical navigasjons- og siderollekontrakt

Status: **canonical og bindende navigasjonskontrakt v3**  
Eier: `fagverk_navigation_contract`  
Forside: `fagverk-forside.html`  
Register: `data/fagverk/fagverk_portal.json`  
Sist kontrollert: **2026-08-28**

Dette dokumentet eier bare navigasjon, adresser og sideroller.

Den samlede arkitekturen, produksjonsrekkefølgen, statusmodellen og ferdigkravene for alle fagsidene eies av:

- [`FAGVERK.md`](./FAGVERK.md)

Fagdataenes universelle struktur eies av:

- [`SUBJECT_FILE_CONTRACT.md`](./SUBJECT_FILE_CONTRACT.md)
- [`../data/fag/fag_manifest.json`](../data/fag/fag_manifest.json)

IA-v3-migreringen styres operativt av:

- [`FAGVERK_IA_V3_WORKCARD.md`](./FAGVERK_IA_V3_WORKCARD.md)

---

## 1. Hovedregel

Headerens **Fagverket** skal alltid åpne den felles fagverkforsiden:

```text
fagverk-forside.html
```

Headeren skal aldri sende brukeren direkte til politikk eller et annet enkeltfag.

Fagverkforsiden er den canonicale portalen til fagene. Når et fag er teknisk materialisert, skal den primære handlingen være å åpne faget.

---

## 2. Fag er den primære fagspesifikke produktflaten

Hvert canonicalt fag åpnes på fagsiden. Fagsiden eier den samlede brukerreisen mellom:

- fagoversikt;
- fagområder og emner;
- redigert lærestoff og eksplisitte curriculum-/pathway-strukturer;
- relevante stedskoblinger;
- beregnet fagprogresjon og badgeidentitet.

Badge-/merkesystemet beholdes som gameplay- og progresjonsidentitet med eide badgekilder, poeng, nivåer og undermerker der disse finnes.

En separat **merkeside** er derimot ikke lenger en likestilt canonical innholdsflate ved siden av fagsiden. Eksisterende `badgePage`-mål behandles under IA-v3-migreringen som compatibility-ruter fram til funksjons- og innholdsekvivalens er bevist og legacy-ruten kan redirectes trygt.

Det er forbudt å:

- slette badge-data bare fordi separat merkeside avvikles;
- flytte eller kopiere canonical fagstruktur inn i badgefiler;
- redirecte en rik legacy-merkeside før unik gyldig kunnskap og aktiv funksjonalitet er inventert;
- bygge nye faglige features bare på legacy-merkesiden.

---

## 3. Fagverkforsiden

Fagverkforsiden leser:

- canonical fagrekkefølge og labels fra `data/categories/category_contract.json`;
- fagsidemål og midlertidige compatibility-mål fra `data/fagverk/fagverk_portal.json`;
- badgeidentitet og nivådata fra eide badgekilder.

Når `subjectStatus` er `materialized` og `subjectPage` finnes, skal fagkortets primære navigasjonsmål være **Åpne faget**.

`badgePage` kan beholdes som sekundær compatibility-lenke under migreringen, men skal ikke presenteres som en konkurrerende likestilt hovedvei.

Når et fag fortsatt er `planned`, skal portalen vise en ikke-klikkbar og ærlig status.

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

IA-v3 skal **ikke** innføre en ny konkurrerende `view=`-semantikk. Subject-roten kan bruke hash-ankere eller klientintern presentasjonsstate for oversikt, emner, lærestoff, utforsk og progresjon, men canonical ressursidentitet eies fortsatt av query-parametrene nedenfor.

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

### Lærekapittel

```text
fagverk.html?subject=<subject_id>&chapter=<chapter_id>
```

Dypkoblingen skal:

- bevare valgt fag;
- validere domain-, emne- og chapter-ID mot den manifest-resolverte fagpakken og registryet;
- kontrollere at et emne faktisk tilhører valgt fagområde når begge ID-er finnes;
- vise tydelig feil ved ugyldig ID;
- aldri falle tilbake til politikk, første tilgjengelige emne eller et annet fag.

`place` og `concept` kan brukes som kontekstparametere der canonical runtime støtter dem uten å endre ressursens faglige identitet.

---

## 6. Emner og `emner.html`

Canonicale emner eies av fagets manifest-resolverte emnefil og presenteres på fagsiden.

Hovedregel:

> Alle aktive canonicale emner skal være navigerbare uavhengig av brukerens Knowledge, quizhistorikk eller beregnede progresjon.

Progresjon kan vises som metadata på et emne, men kan ikke styre om emnet finnes i katalogen.

`emner.html` er ikke canonical emnekatalog. Siden er en personlig, tverrfaglig progresjonsflate basert på brukerens læringsevidens og skal under IA-v3 forstås som **Min læring / samlet progresjon** eller compatibility-rute til denne rollen.

---

## 7. Lærestoff og curriculum

Redigert lærestoff åpnes gjennom materialiserte chapter-ruter fra `data/fagverk/fagverk_registry.json`.

Et fag kan i tillegg vise eksplisitt curriculum, studieløp eller pathway når den manifest-resolverte source faktisk eier en slik struktur.

Renderer skal ikke:

- finne på én universell læringsrekkefølge for fag som ikke har slik source;
- behandle teknisk fagregister som anbefalt læringsløp;
- kopiere hele emneobjekter inn i kapitler;
- behandle renderer-genererte emneoppsummeringer som redigert lærestoff.

---

## 8. Merkesider og compatibility-ruter

`data/fagverk/fagverk_portal.json` kan under migreringen fortsatt peke til eksisterende `badgePage` for hvert fag.

Disse rutene skal klassifiseres og migreres kontrollert, eksempelvis som:

- gammel statisk teori-/merkeside;
- rik runtime-merkeside;
- generisk badge-/nivåside.

Før redirect skal det dokumenteres at:

- unik gyldig faglig tekst enten allerede finnes canonicalt eller er migrert til riktig eier;
- undermerke- og progresjonsfunksjoner er bevart der de faktisk brukes;
- emne-/begrepssøk, quizhistorikk, stedslister eller andre aktive funksjoner ikke går tapt;
- alle interne lenker har nytt gyldig mål.

Når equivalence-gaten er bestått, kan compatibility-ruten redirecte til fagets relevante progresjons-/fagflate.

---

## 9. Stedssider

Alle canonicale steder bruker stabil adresse:

```text
fagverk-sted.html?place=<place_id>
```

Fagsiden kan lenke til relevante steder, men stedets tverrfaglige innhold skal forbli på stedssiden.

Stedssiden kan lenke tilbake til:

- fagverkforsiden;
- ett eller flere relevante fag;
- relevante fagområder og emner;
- eksisterende badge-/compatibility-rute så lenge den er aktiv;
- kartet.

Kategoridesign og bildekontrakt eies av [`FAGVERK_PLACE_DESIGN.md`](./FAGVERK_PLACE_DESIGN.md).

---

## 10. Portalregisterets smale ansvar

`data/fagverk/fagverk_portal.json` eier bare:

- `id`;
- `badgePage`;
- `subjectPage`;
- `subjectStatus`.

Regler:

- `badgePage` peker under IA-v3 til eksisterende compatibility-rute fram til den er kontrollert migrert;
- `subjectPage` skal bare settes når fagsiden er teknisk materialisert;
- `subjectStatus: "planned"` skal gi ikke-klikkbar status;
- `subjectStatus: "materialized"` krever fungerende side og grønn fagverkaudit;
- registeret skal følge canonical rekkefølge fra kategorikontrakten;
- registeret skal ikke kopiere pensum, emner, metoder, kapitler, badgeinnhold eller progresjon.

Når alle legacy-merkesider er trygt avviklet, skal portalregisterets videre behov for `badgePage` vurderes eksplisitt. Feltet skal ikke fjernes i en mellomtilstand som bryter eksisterende runtime eller audits.

Redaksjonell ferdigstatus eies ikke av portalregisteret. Se [`FAGVERK.md`](./FAGVERK.md).

---

## 11. Navigasjon i fagsiden

Subject-roten skal ha tydelig navigasjon mellom fem brukerroller:

1. **Oversikt** — rolig inngang til faget.
2. **Emner** — komplett canonical emnekatalog gruppert etter fagområder.
3. **Lærestoff** — redigerte kapitler og source-eide studieløp/pathways.
4. **Utforsk** — dokumenterte stedskoblinger og andre tverrkoblinger som den normaliserte modellen faktisk bærer.
5. **Progresjon** — badgeidentitet, poeng, nivå, emnedekning, fagområdedekning og relevante quiz-/læringssignaler fra eksisterende read-model.

Disse fem rollene skal ikke kreve fem nye canonicale query-ruter.

Fagsidens interne navigasjon skal fortsatt kunne åpne:

- canonicale fagområder;
- canonicale emner;
- materialiserte lærekapitler;
- relevante stedssider.

På subject-roten skal sidebar eller annen permanent navigasjon ikke duplisere hele fagområde-, kapittel- og progresjonsinventaret samtidig med hovedinnholdet.

Ingen lenketekst skal bruke «Politikkmerket» eller annen fagspesifikk tekst på en annen fagside.

---

## 12. Link- og regresjonsgate

Permanent link- og IA-audit skal kontrollere:

- header → `fagverk-forside.html`;
- fagverkforside → alle materialiserte `subjectPage`-mål som primær fagvei;
- at `planned` fag ikke har aktiv fagsidelenke;
- alle canonicale subject-, domain-, emne- og chapter-ruter;
- at alle aktive emner er navigerbare uten progresjonssignal;
- at ugyldige ID-er failer tydelig uten fallback;
- stedssidelenker;
- fravær av politikkfallback og døde ruter;
- at subject-roten ikke oppretter en ny progresjonsstorage;
- at source-eid curriculum ikke erstattes av renderer-oppfunnet læringsrekkefølge;
- at aktive `badgePage`-mål fortsatt fungerer så lenge de er registrert som compatibility-ruter;
- at redirect først innføres etter dokumentert equivalence-gate.

Den samlede QA- og ferdigmodellen ligger i [`FAGVERK.md`](./FAGVERK.md).

---

## 13. Endringsregel

Endringer i adresser, sideroller eller portalregisterets navigasjonssemantikk skal gjøres her.

Endringer i:

- generell fagsidearkitektur;
- adaptere og normalisert modell;
- produksjonsrekkefølge;
- materialiserings- og ferdigkrav;
- fag-for-fag arbeidskort;
- samlet QA-program

skal gjøres i [`FAGVERK.md`](./FAGVERK.md), ikke dupliseres her.

IA-v3-arbeidet skal samtidig holdes operativt synkronisert med [`FAGVERK_IA_V3_WORKCARD.md`](./FAGVERK_IA_V3_WORKCARD.md) fram til migreringen er lukket.
