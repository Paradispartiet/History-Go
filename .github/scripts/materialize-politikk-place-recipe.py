from pathlib import Path
import json
import re

TODAY = "2026-07-31"
recipe_path = Path("docs/PLACE_PRODUCTION_CHECKLIST.md")
text = recipe_path.read_text(encoding="utf-8")

old_date = "Sist kontrollert: **2026-07-28**"
new_date = f"Sist kontrollert: **{TODAY}**"
if old_date not in text:
    raise SystemExit(f"Fant ikke forventet kontroll-dato: {old_date}")
text = text.replace(old_date, new_date, 1)

authority_anchor = "| Fagverk / merke vs fag / navigasjon | `docs/FAGVERK_NAVIGATION.md` |\n"
authority_addition = (
    authority_anchor
    + "| Politikk — canonical fagmodell | `data/fag/politikk/politikk_runtime_manifest.json` |\n"
    + "| Politikk — faglig kvalitet og inferensgrenser | `scripts/audit-politikk-subject-quality.mjs` og `scripts/audit-politikk-thinker-integrity.mjs` |\n"
)
if authority_anchor not in text:
    raise SystemExit("Fant ikke autoritetsankeret for fagverk")
text = text.replace(authority_anchor, authority_addition, 1)

workcard_anchor = "EMNE_IDS:\nSTEDSTYPE:\n"
workcard_addition = (
    "EMNE_IDS:\n"
    "POLITIKK-HOVEDFUNKSJON (hvis relevant):\n"
    "POLITIKK-EMNE_IDS (kun em_pol_*):\n"
    "POLITIKK-EVIDENSKJEDE:\n"
    "POLITIKK-NÅTIDSKONTROLL:\n"
    "STEDSTYPE:\n"
)
if workcard_anchor not in text:
    raise SystemExit("Fant ikke arbeidskortankeret")
text = text.replace(workcard_anchor, workcard_addition, 1)

section_anchor = "---\n\n## 5. `desc` og `popupDesc`\n"
politics_section = r'''---

## 4A. Politikk-sted — obligatorisk faglig tillegg og sluttgate

Denne delen gjelder når stedet foreslås med **Politikk som primær fagidentitet**, eller når `emne_ids` skal inneholde canonicale Politikk-emner. Den erstatter ikke de generelle place-, fagverk-, quiz-, story- eller faktisitetskontraktene; den skjerper dem for Politikk.

**LES FØRST — obligatorisk:**

- `docs/FACTUALITY_CONTRACT.md`;
- `docs/FAGVERK_NAVIGATION.md`;
- `data/fag/politikk/politikk_runtime_manifest.json`;
- `data/quiz/regler/QUIZ_PRODUCTION_CANONICAL.md`;
- `docs/STORIES_DATA_GOVERNANCE.md` når fortellinger produseres.

### A. Politikk må være stedets dokumenterte hovedfunksjon

- [ ] stedet er primært en politisk institusjon, beslutningsarena, forvaltningsarena, retts-/myndighetsarena, offentlig tjeneste, demokratisk møteplass, organisasjonsarena, demonstrasjonssted eller et fysisk sted der styring, representasjon, rett, fordeling, konflikt, normer eller offentlighet faktisk er hovedpoenget;
- [ ] koblingen beskriver hva som politisk skjer eller har skjedd **på dette stedet**, ikke bare en generell samfunnsrelevans;
- [ ] bygg og institusjon, organisasjon og adresse, hendelse og hendelsessted samt historisk og nåværende funksjon er skilt eksplisitt;
- [ ] stedet er ikke gitt Politikk som primæridentitet bare fordi en politiker, offentlig etat eller politisk hendelse kan nevnes perifert.

### B. Bruk bare canonicale Politikk-emner som materialet bærer

- [ ] Politikk-koblinger bruker eksisterende `em_pol_*` fra den canonicale Politikk-modellen;
- [ ] hvert valgt emne har stedsspesifikk evidens og kan forklares uten å importere et annet fags hovedidentitet;
- [ ] Historie-, by-, næringslivs-, medie-, kunst-, musikk- eller andre fag-ID-er brukes ikke som erstatning for et manglende Politikk-emne;
- [ ] de 13 komplette Politikk-kapitlene behandles som et målregister, **ikke som en kvote per sted**;
- [ ] irrelevante emner utelates selv om de finnes i fagmodellen.

### C. Bygg en inspectable politisk evidenskjede

For hver vesentlig politisk læringspåstand skal de relevante leddene kunne følges:

```text
institusjon/aktør
  → formell kompetanse eller faktisk rolle
  → regel, kontrakt, prosedyre eller vedtak
  → ressurs, finansiering eller virkemiddel
  → faktisk gjennomføring
  → dokumentert output, outcome eller langsiktig effekt
```

- [ ] hvert påstått ledd har konkret ekstern kilde og `sourceLocation`;
- [ ] manglende ledd markeres som manglende og fylles ikke med antakelser;
- [ ] norsk forvaltning, flernivåstyring, EØS/EU, konstitusjonelle forhold og offentlig politikk får egen beslutningskjede når de brukes;
- [ ] kontraktstekst eller vedtak alene brukes ikke som bevis for faktisk gjennomføring eller målt resultat;
- [ ] output, outcome og langsiktig effekt holdes adskilt.

### D. Eksterne kilder dominerer og nåtid ferskverifiseres

- [ ] canonicale fagfiler velger emner og metoder, men brukes ikke som faktakilde for stedspåstander;
- [ ] lover, forskrifter, vedtak, budsjetter, stortings- og kommunedokumenter, domstolskilder, SSB, NOU-er, offentlige arkiv og relevant forskning prioriteres etter påstanden;
- [ ] dagens innehavere, organisering, kompetanse, lover, regler, budsjetter og pågående reformer kontrolleres mot ferske kilder;
- [ ] kontrolltidspunkt og temporal status registreres for nåtidsclaims;
- [ ] eldre kilder brukes bare for det tidsrommet de faktisk dokumenterer.

### E. Politikkfaglige skiller er bindende

Påstandsbank, tekst og quiz skal håndheve minst disse skillene når de er relevante:

- [ ] regel er ikke det samme som faktisk etterlevelse;
- [ ] vedtak/output er ikke det samme som outcome eller langsiktig effekt;
- [ ] formell kompetanse er ikke det samme som faktisk innflytelse;
- [ ] konsultasjon er ikke det samme som samtykke;
- [ ] rettighet er ikke det samme som håndheving eller faktisk tilgang;
- [ ] representasjon er ikke automatisk politisk gjennomslag;
- [ ] korrelasjon er ikke dokumentasjon på årsak.

### F. Quizåpningen skal være vanlig, konkret quiz

- [ ] sett 1 og 2 har sju direkte, stedsspesifikke og kildebelagte spørsmål hver;
- [ ] de første 14 spørsmålene drives ikke av synlige teorinavn, metodenavn, «hvilken mekanisme»-språk eller akademisk fagplansjargong;
- [ ] senere teori- og metodespørsmål introduseres bare når normalåpningen, påstandsbanken og evidensen bærer dem;
- [ ] `source_brief`, `required_inputs`, `production_context`, audits og Knowledge-synkronisering følger Quiz-kontrakten;
- [ ] spørsmål tester dokumentert kunnskap om stedet og politikken, ikke bare gjenkjenning av fagterminologi.

### G. Chronology og Stories holdes adskilt

- [ ] en politisk dato eller beslutning legges i chronology når verdien først og fremst er **hva som skjedde når**;
- [ ] en Story opprettes bare når det finnes en sammenhengende narrativ idé, aktører, handling, konflikt eller transformasjon og tydelig fysisk forankring;
- [ ] samme materiale dupliseres ikke mekanisk som chronology, Story, nyhet og quiz;
- [ ] Stories følger `docs/STORIES_DATA_GOVERNANCE.md` fullt ut.

### Politikk-stoppgate

Stedet kan ikke godkjennes som Politikk-sted dersom ett av disse forholdene består:

- Politikk er ikke den dokumenterte hovedfunksjonen;
- primære Politikk-koblinger mangler canonicale `em_pol_*` eller stedsspesifikk evidens;
- beslutningskjeden fylles med antatte ledd;
- nåtidsopplysninger er utdatert eller uten kontrolltidspunkt;
- tekst eller quiz blander regel og praksis, output og outcome eller korrelasjon og årsak;
- de første 14 quizspørsmålene bryter normalåpningen;
- en chronology-post er gjort til Story uten narrativ og fysisk forankring.

Alle delene A–G får status **PASS** eller **N/A med begrunnelse** i produksjonsrapporten. Politikk kan ikke settes til ferdig på stedet før alle relevante deler er PASS.

'''
if section_anchor not in text:
    raise SystemExit("Fant ikke innsettingsankeret før seksjon 5")
text = text.replace(section_anchor, politics_section + section_anchor, 1)
recipe_path.write_text(text, encoding="utf-8")

registry_path = Path("docs/documentation_registry.json")
registry_text = registry_path.read_text(encoding="utf-8")
registry_text, top_count = re.subn(
    r'("last_verified"\s*:\s*)"[^"]+"',
    rf'\1"{TODAY}"',
    registry_text,
    count=1,
)
if top_count != 1:
    raise SystemExit("Kunne ikke oppdatere registry.last_verified")
entry_pattern = re.compile(
    r'(\{\s*"path"\s*:\s*"docs/PLACE_PRODUCTION_CHECKLIST\.md".*?"last_verified"\s*:\s*)"[^"]+"',
    re.S,
)
registry_text, entry_count = entry_pattern.subn(rf'\1"{TODAY}"', registry_text, count=1)
if entry_count != 1:
    raise SystemExit("Kunne ikke oppdatere registerposten for stedoppskriften")
json.loads(registry_text)
registry_path.write_text(registry_text, encoding="utf-8")

required_markers = [
    "## 4A. Politikk-sted — obligatorisk faglig tillegg og sluttgate",
    "Politikk kan ikke settes til ferdig på stedet før alle relevante deler er PASS.",
    "POLITIKK-EVIDENSKJEDE:",
    "data/fag/politikk/politikk_runtime_manifest.json",
    "de første 14 quizspørsmålene bryter normalåpningen",
]
final_text = recipe_path.read_text(encoding="utf-8")
missing = [marker for marker in required_markers if marker not in final_text]
if missing:
    raise SystemExit(f"Manglende Politikk-markører: {missing}")
print("Politikk-tillegget er materialisert og registeret er synkronisert.")
