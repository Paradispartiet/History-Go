# Fagverk-sted v2 – arbeidskort

Status: **legacy-migrering fullført; integrert sted-for-sted-produksjon aktiv**  
Canonical siderolle: `docs/FAGVERK.md` og `docs/FAGVERK_NAVIGATION.md`  
Audit: `scripts/audit-fagverk-place-pages.mjs`  
Dekningsrapport: `reports/fagverk/fagverk-place-page-coverage-v2.json`

Den ordinære stedsproduksjonen eies av `docs/PLACE_PRODUCTION_CHECKLIST.md`. Nye steder og steder som fullproduseres eller vesentlig revideres får Fagverk-siden i samme source review, Place-fil, PR og closeout. Fagverk skal ikke skyves til en senere batch når stedet allerede er i ordinær produksjon.

Den opprinnelige eksplisitte legacy-listen over allerede ferdigproduserte steder er **lukket 44/44** via PR #5606. Det finnes derfor ikke en separat post-produksjonsbacklog for disse 44 stedene. Dette dokumentet er nå en historisk migreringsreferanse og en presisering av den aktive integrerte produksjonsregelen, ikke en åpen legacy-kø.

## Mål og aktiv regel

Alle canonicale steder skal over tid ha en stedsspesifikk fagverkside. En fungerende rute eller en kategoribasert standardtekst er ikke tilstrekkelig ferdigbevis.

Stedssiden skal alltid bruke samme manifest-resolverte fagmodell som `fagverk.html`. Stedlig læringsinnhold eies av Place-kildens `fagverk`-blokk; registryet inneholder bare sourcefil, felt, schema, nivå og status. Siden skal aldri opprette egne emner, kapitler, begrepsdefinisjoner, progresjonsdata eller kategori-fallbacktekster.

Når et sted ennå ikke er fullprodusert, kan coverage-auditen fortsatt klassifisere Fagverk-siden som `linked_unfinished` eller `category_only_unfinished`. Disse klassene beskriver **global canonical dekning**, ikke etterslep etter en allerede avsluttet stedsproduksjon. Stedet får Place-eid Fagverk v2 når det går gjennom den ordinære stedsproduksjonen.

## Produksjonsnivåer

- **Fullt sted:** redigert stedsartikkel, eksplisitte canonicale emnebindinger, stedsspesifikke linser med presise klikkmål, stedsspesifikke undersøkelsesspørsmål, relevante fagområder/kapitler, begreper og inspectable kilder.
- **Standardsted:** kort redigert fagartikkel, relevante canonicale emne- og kapittelbindinger, minst tre stedsspesifikke linser, fire undersøkelsesspørsmål, begreper, observerbart spor og kontrollerte kilder.
- **Mikrosted:** kort source-eid stedstekst og den smaleste dokumenterte fag- eller emnebindingen. Mikrostedet bruker samme datatype og renderer; det får ikke en parallell mikrosidemotor.

Renderer-genererte standardspørsmål og generiske kategori-linser er forbudt. Når source mangler, skal siden vise ærlig status og produksjonskø – ikke plausibelt fyllstoff.

## Operative lenker

Alle synlige handlingsflater skal være faktiske lenker:

- fagkort → `fagverk.html?subject=<subject>&place=<place>`;
- fagområde → validert `subject + domain + place`;
- emne/linse → validert `subject + domain + emne + place`;
- kapittel → validert `subject + chapter + place`;
- begrep → eieremnet når det finnes, ellers subject-roten med kontekst;
- undermerke → fagets integrerte Progresjon;
- kart → canonical place-rute;
- ekstern kilde → HTTPS/HTTP med `noopener noreferrer`.

Ikke-klikkbare chips, kort som ser interaktive ut uten `href`, og lenker til `fagverk-forside.html?subject=…` er blocker.

## Migreringshistorikk og coverage-semantikk

Den første repository-wide baselinen 31. august 2026 målte 1 532 canonicale steder og bare én kuratert referanseside. Deretter ble den eksplisitte listen over 44 steder som allerede var ferdigprodusert før den integrerte Fagverk-regelen migrert i egne legacy-batcher.

PR #5606 lukket denne avgrensede migreringen som **44/44**. De siste fire var Lilleborg Fabrikker, Øvre Foss–Hjula Veveri, Akershus slottskirke og Det kongelige mausoleum.

`reports/fagverk/fagverk-place-page-coverage-v2.json` eier alltid de ferske globale dekningstallene. Rapportens `linked_unfinished` og `category_only_unfinished` betyr at et canonical Place ennå ikke har Place-eid kuratert Fagverk v2. Tallene skal **ikke** omtales som antall Fagverk-sider som mangler etter fullført stedsproduksjon, og skal **ikke** brukes som en ny legacy-backlog.

Historiske nullmålinger som `existing_fagverk` i et workcard beskriver tilstanden før den aktuelle produksjonen. De er evidens og skal ikke leses som current status etter at canonical Place og registry er kuratert.

## Aktiv produksjonsregel

1. Ta aldri et sted ut av en aktiv ordinær stedsproduksjon for å behandle Fagverk senere; følg den integrerte gaten i `docs/PLACE_PRODUCTION_CHECKLIST.md`.
2. Lås Fagverk-nivå og læringsjobb i samme preflight som resten av stedet.
3. Kurer emnebindinger og linser mot canonical fagpakke; ikke kopier emneinnhold inn i Place.
4. Materialiser Place-eid `history_go_place_fagverk_v2` og den smale registry-indeksen i samme produksjon.
5. Kjør coverage-audit, lenketest og reell browserklikk-QA før closeout.
6. Merge først etter grønne relevante CI-porter og låst head-SHA.

Den separate 44-steders legacy-migreringen er ferdig. Videre økning i global Fagverk-dekning skjer gjennom ordinær stedsproduksjon eller gjennom en ny, eksplisitt avgrenset migrering som dokumenterer sitt eget scope; globale unfinished-tall alene oppretter ikke en slik backlog.
