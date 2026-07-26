from pathlib import Path


def replace_once(text: str, old: str, new: str, label: str) -> str:
    count = text.count(old)
    if count != 1:
        raise SystemExit(f"{label}: expected one match, found {count}")
    return text.replace(old, new, 1)


js_path = Path("js/ui/place-popup-v2.js")
js = js_path.read_text(encoding="utf-8")

render_fact = '''  function renderFact(label, value) {
    const safeValue = text(value);
    if (!safeValue) return "";
    return `
      <div class="hg-place-fact">
        <span class="hg-place-fact-label">${escapeHtml(label)}</span>
        <strong class="hg-place-fact-value">${escapeHtml(safeValue)}</strong>
      </div>
    `;
  }

'''
if render_fact in js:
    js = js.replace(render_fact, "", 1)

js = replace_once(
    js,
    '    const linearExtent = numberValue(profile.linear_extent_m || profile.linearExtentM || routeLength);',
    '    const linearExtent = numberValue(profile.linear_extent_m || profile.linearExtentM);',
    "spatial ownership"
)

facts_block = '''    const headerMeta = uniqueStrings([category, year, placeType]).join(" · ");
    const spatial = spatialProfile(place);
    const temporal = temporalProfile(place);
    const highestPoint = objectValue(spatial.highest_point || spatial.highestPoint);
    const displayExtent = numberValue(spatial.linear_extent_m || spatial.linearExtentM) || routeLength;
    const factsHtml = [
      renderFact("År", year),
      renderFact("Stedstype", placeType),
      renderFact("Areal", formatArea(spatial.area_m2 || spatial.areaM2)),
      renderFact("Høyeste punkt", firstText(highestPoint.name, highestPoint.title)),
      renderFact("Høyde", formatElevation(highestPoint.elevation_masl || highestPoint.elevationMasl || spatial.elevation_masl || spatial.elevationMasl)),
      renderFact("Byggehøyde", formatHeight(spatial.height_m || spatial.heightM)),
      renderFact("Utstrekning", formatDistance(displayExtent)),
      renderFact("Ferdigstilt", firstText(temporal.completed_year, temporal.completedYear)),
      renderFact("Personer", people.length ? String(people.length) : ""),
      renderFact("Fortellinger", stories.length ? String(stories.length) : "")
    ].filter(Boolean).join("");'''
js = replace_once(
    js,
    facts_block,
    '    const headerMeta = uniqueStrings([category, year, placeType]).join(" · ");',
    "hero facts block"
)

js = replace_once(
    js,
    '              ${factsHtml ? `<div class="hg-place-facts">${factsHtml}</div>` : ""}\n',
    '',
    "hero facts markup"
)

js_path.write_text(js, encoding="utf-8")

css_path = Path("css/place-popup-v2.css")
css = css_path.read_text(encoding="utf-8")
css_block = '''body.hg-app .hg-place-popup-v2 .hg-place-facts{
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 9px;
}

body.hg-app .hg-place-popup-v2 .hg-place-fact{
  min-width: 0;
  padding: 11px 12px;
  border: 1px solid rgba(255,255,255,.08);
  border-radius: 15px;
  background: rgba(0,0,0,.18);
}

body.hg-app .hg-place-popup-v2 .hg-place-fact-label{
  display: block;
  margin-bottom: 5px;
  color: rgba(255,255,255,.5);
  font-size: 9px;
  line-height: 1;
  font-weight: 850;
  letter-spacing: .08em;
  text-transform: uppercase;
}

body.hg-app .hg-place-popup-v2 .hg-place-fact-value{
  display: block;
  overflow: hidden;
  color: #fff;
  font-size: 14px;
  line-height: 1.2;
  text-overflow: ellipsis;
}

'''
if css_block in css:
    css = css.replace(css_block, "", 1)
css = css.replace(
    '  body.hg-app .hg-place-popup-v2 .hg-place-facts,\n  body.hg-app .hg-place-popup-v2 .hg-place-route-summary{',
    '  body.hg-app .hg-place-popup-v2 .hg-place-route-summary{',
    1
)
css_path.write_text(css, encoding="utf-8")


test_path = Path("tests/place-popup-type-sections.test.js")
test_text = test_path.read_text(encoding="utf-8")
needle = '  assert.match(captured.html, /48 daa/);\n'
addition = '''  assert.match(captured.html, /48 daa/);
  assert.equal((captured.html.match(/48 daa/g) || []).length, 1);
  assert.equal((captured.html.match(/81 moh/g) || []).length, 1);
  assert.doesNotMatch(captured.html, /hg-place-facts/);
'''
if 'assert.doesNotMatch(captured.html, /hg-place-facts/);' not in test_text:
    test_text = replace_once(test_text, needle, addition, "deduplication assertions")
test_path.write_text(test_text, encoding="utf-8")


doc_path = Path("docs/PLACE_POPUP_SYSTEM.md")
doc = doc_path.read_text(encoding="utf-8")
old_order = '''1. **Header** — kategori, navn, år og stedstype.
2. **Hero** — hovedbilde med kontrollert fallback.
3. **Kort fortalt** — `desc` når den ikke er identisk med hovedartikkelen.
4. **Nøkkelfakta** — bare felter med faktiske verdier.
5. **Om stedet** — hele `popupDesc`, avsnittsbevart.
6. **Type-spesifikke seksjoner** — mål, delsteder, historiske lag, natur, arkitektur eller annen relevant struktur.
7. **Se etter på stedet** — observerbare særtrekk fra `quiz_profile`.
8. **Koblinger** — people, relations, Wonderkammer, knowledge, events og stories.
9. **Kilder** — kildeoversikt når `source_summary.safe_sources` finnes.
10. **Observasjoner** — bare når brukeren faktisk har observasjoner.'''
new_order = '''1. **Header** — kategori, navn, år og stedstype.
2. **Hero** — hovedbilde, kort ingress og primær handling; ikke et ekstra nøkkeltallpanel.
3. **Om stedet** — hele `popupDesc`, avsnittsbevart.
4. **Type-spesifikke seksjoner** — mål, delsteder, historiske lag, natur, arkitektur eller annen relevant struktur.
5. **Se etter på stedet** — observerbare særtrekk fra `quiz_profile`.
6. **Koblinger** — people, relations, Wonderkammer, knowledge, events og stories.
7. **Kilder** — kildeoversikt når `source_summary.safe_sources` finnes.
8. **Observasjoner** — bare når brukeren faktisk har observasjoner.'''
doc = replace_once(doc, old_order, new_order, "documentation order")

rule_anchor = 'Tom informasjon skal ikke erstattes av bokser med «ingen … ennå». Fravær av data skal gi en renere popup, ikke mer støy.'
rule_text = '''Tom informasjon skal ikke erstattes av bokser med «ingen … ennå». Fravær av data skal gi en renere popup, ikke mer støy.

### Én visuell eier per opplysning

Samme nøkkeltall skal ikke vises både i heroen og i en detaljseksjon. Headeren eier orientering (`kategori`, primært `år`, `stedstype`). Stedstypens detaljseksjon eier de konkrete målene:

- park/grøntområde: areal, høyeste punkt, høyde, terreng og fysisk utstrekning;
- gate/rute: fra, til, lengde og segmenter;
- bygning: høyde, etasjer, kapasitet, materiale og konstruksjon;
- badgeflaten: fagområde, epoke, underbadges og emner.

People- og story-antall skal normalt ikke gjentas som nøkkeltall når de samme elementene vises som egne seksjoner. Repetisjon er bare tillatt når en kort orienteringsverdi og en detaljert forklaring har klart ulike roller.'''
if '### Én visuell eier per opplysning' not in doc:
    doc = replace_once(doc, rule_anchor, rule_text, "single owner rule")
doc_path.write_text(doc, encoding="utf-8")

standard_path = Path("docs/PLACE_STANDARD.md")
standard = standard_path.read_text(encoding="utf-8")
anchor = 'Den rike stedspopupen følger den bindende type- og presentasjonskontrakten i `docs/PLACE_POPUP_SYSTEM.md`. PlaceCard skal forbli kompakt; popupen kan vise `popupDesc`, strukturerte mål, delsteder, historiske lag, naturprofil og kildeoversikt når place-dataene faktisk finnes.'
replacement = anchor + ' Heroen skal ikke gjenta nøkkeltall som allerede eies av en type-spesifikk detaljseksjon.'
if replacement not in standard:
    standard = replace_once(standard, anchor, replacement, "PLACE_STANDARD deduplication pointer")
standard_path.write_text(standard, encoding="utf-8")
