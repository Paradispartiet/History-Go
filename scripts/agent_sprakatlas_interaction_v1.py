#!/usr/bin/env python3
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def replace_once(relative, old, new):
    path = ROOT / relative
    text = path.read_text(encoding="utf-8")
    if old not in text:
        raise SystemExit(f"Expected patch anchor not found in {relative}: {old[:80]!r}")
    path.write_text(text.replace(old, new, 1), encoding="utf-8")


def append_once(relative, marker, block):
    path = ROOT / relative
    text = path.read_text(encoding="utf-8")
    if marker in text:
        return
    path.write_text(text.rstrip() + "\n\n" + block.strip() + "\n", encoding="utf-8")


runtime = "js/ui/place-language-layer.js"

replace_once(
    runtime,
    '''  function renderAtlasMacroCard(macro, atlas, activeIds) {
    const regions = list(atlas?.dialect_regions).filter(region => text(region?.macro_region_id) === text(macro?.id));
    const activeMacro = activeIds.has(text(macro?.id)) || regions.some(region => activeIds.has(text(region?.id)));
    return `
      <article class="hg-language-atlas-macro${activeMacro ? " is-active" : ""}" data-atlas-macro="${esc(macro?.id)}">
        <header><strong>${esc(macro?.name)}</strong><span>${regions.length} soner</span></header>
        <p>${esc(macro?.summary)}</p>
        ${list(macro?.feature_labels).length ? `<div class="hg-language-atlas-features">${list(macro.feature_labels).map(label => `<span>${esc(label)}</span>`).join("")}</div>` : ""}
        <div class="hg-language-atlas-regions">${regions.map(region => `<span class="${activeIds.has(text(region?.id)) ? "is-active" : ""}">${esc(region?.name)}</span>`).join("")}</div>
        ${sourceLinks({ sources: macro?.sources })}
      </article>
    `;
  }
''',
    '''  function renderAtlasMacroCard(macro, atlas, activeIds) {
    const macroId = text(macro?.id);
    const regions = list(atlas?.dialect_regions).filter(region => text(region?.macro_region_id) === macroId);
    const activeMacro = activeIds.has(macroId) || regions.some(region => activeIds.has(text(region?.id)));
    return `
      <article class="hg-language-atlas-macro${activeMacro ? " is-active" : ""}" data-atlas-macro="${esc(macroId)}" id="hg-language-atlas-macro-${esc(slug(macroId))}">
        <header><strong>${esc(macro?.name)}</strong><span>${regions.length} soner</span></header>
        <p>${esc(macro?.summary)}</p>
        ${list(macro?.feature_labels).length ? `<div class="hg-language-atlas-features">${list(macro.feature_labels).map(label => `<span>${esc(label)}</span>`).join("")}</div>` : ""}
        <div class="hg-language-atlas-regions">${regions.map(region => `<button type="button" class="${activeIds.has(text(region?.id)) ? "is-active" : ""}" data-atlas-region="${esc(region?.id)}" data-atlas-macro-id="${esc(macroId)}" aria-pressed="false">${esc(region?.name)}</button>`).join("")}</div>
        ${sourceLinks({ sources: macro?.sources })}
      </article>
    `;
  }
'''
)

replace_once(
    runtime,
    '''    const mapBlock = (id, label, className) => `<div class="hg-language-atlas-map-region ${className}${isMacroActive(id) ? " is-active" : ""}" data-atlas-map-region="${esc(id)}"><strong>${esc(label)}</strong></div>`;''',
    '''    const mapBlock = (id, label, className) => `<button type="button" class="hg-language-atlas-map-region ${className}${isMacroActive(id) ? " is-active" : ""}" data-atlas-map-region="${esc(id)}" data-atlas-focus="${esc(id)}" aria-pressed="false" aria-label="Utforsk ${esc(label)}"><strong>${esc(label)}</strong></button>`;'''
)

replace_once(
    runtime,
    '''        <div class="hg-language-atlas-map" role="img" aria-label="Skjematisk språkkart over de fire norske hovedgruppene">''',
    '''        <div class="hg-language-atlas-map" role="group" aria-label="Utforsk de fire norske hovedgruppene">'''
)

replace_once(
    runtime,
    '''        ${activeNames.length ? `<p class="hg-language-atlas-current"><strong>Koblet til dette stedet:</strong> ${esc(unique(activeNames).join(" · "))}</p>` : ""}
        <details class="hg-language-atlas-details">''',
    '''        ${activeNames.length ? `<p class="hg-language-atlas-current"><strong>Koblet til dette stedet:</strong> ${esc(unique(activeNames).join(" · "))}</p>` : ""}
        <div class="hg-language-atlas-selection" data-atlas-selection hidden aria-live="polite">
          <span>Utforsker</span>
          <strong data-atlas-selection-title></strong>
          <p data-atlas-selection-summary></p>
          <div data-atlas-selection-features></div>
        </div>
        <details class="hg-language-atlas-details">'''
)

replace_once(
    runtime,
    '''  function bindLanguagePanel(panel, place, article, sourceFile) {''',
    '''  function activateAtlasSelection(panel, atlas, itemId, macroHint = "") {
    const id = text(itemId);
    if (!id || !atlas) return;

    const regions = list(atlas?.dialect_regions);
    const macros = list(atlas?.macro_regions);
    const region = regions.find(row => text(row?.id) === id) || null;
    const macroId = text(macroHint || region?.macro_region_id || id);
    const macro = macros.find(row => text(row?.id) === macroId) || null;
    const item = region || macro;
    if (!item || !macro) return;

    const details = panel.querySelector(".hg-language-atlas-details");
    if (details) details.open = true;

    panel.querySelectorAll("[data-atlas-focus],[data-atlas-region]").forEach(button => {
      const buttonId = text(button.getAttribute("data-atlas-region") || button.getAttribute("data-atlas-focus"));
      const macroButtonSelected = Boolean(region) && button.hasAttribute("data-atlas-focus") && buttonId === macroId;
      button.setAttribute("aria-pressed", buttonId === id || macroButtonSelected ? "true" : "false");
    });

    panel.querySelectorAll(".hg-language-atlas-macro.is-user-focused, [data-atlas-region].is-user-focused").forEach(node => node.classList.remove("is-user-focused"));
    const macroCard = panel.querySelector(`[data-atlas-macro="${CSS.escape(macroId)}"]`);
    macroCard?.classList.add("is-user-focused");
    if (region) panel.querySelector(`[data-atlas-region="${CSS.escape(id)}"]`)?.classList.add("is-user-focused");

    const selection = panel.querySelector("[data-atlas-selection]");
    if (selection instanceof HTMLElement) {
      const title = selection.querySelector("[data-atlas-selection-title]");
      const summary = selection.querySelector("[data-atlas-selection-summary]");
      const features = selection.querySelector("[data-atlas-selection-features]");
      if (title) title.textContent = text(item?.name || macro?.name);
      if (summary) summary.textContent = text(region?.area_summary || item?.summary || macro?.summary);
      if (features) features.innerHTML = list(item?.feature_labels).map(label => `<span>${esc(label)}</span>`).join("");
      selection.hidden = false;
    }

    macroCard?.scrollIntoView?.({ behavior: "smooth", block: "nearest" });
  }

  function bindLanguagePanel(panel, place, article, sourceFile, atlas = null) {'''
)

replace_once(
    runtime,
    '''      const target = event.target instanceof Element ? event.target : null;
      const filterButton = target?.closest("[data-language-filter]");''',
    '''      const target = event.target instanceof Element ? event.target : null;
      const atlasFocus = target?.closest("[data-atlas-focus]");
      if (atlasFocus && atlas) {
        activateAtlasSelection(panel, atlas, atlasFocus.getAttribute("data-atlas-focus"));
        return;
      }

      const atlasRegion = target?.closest("[data-atlas-region]");
      if (atlasRegion && atlas) {
        activateAtlasSelection(
          panel,
          atlas,
          atlasRegion.getAttribute("data-atlas-region"),
          atlasRegion.getAttribute("data-atlas-macro-id")
        );
        return;
      }

      const filterButton = target?.closest("[data-language-filter]");'''
)

replace_once(
    runtime,
    '''    bindLanguagePanel(panel, place, loaded.article, loaded.sourceFile);''',
    '''    bindLanguagePanel(panel, place, loaded.article, loaded.sourceFile, atlas);'''
)

append_once(
    "css/place-language-layer.css",
    "Språkatlas interaktiv navigasjon v1",
    r'''/* Språkatlas interaktiv navigasjon v1. */
body.hg-app .hg-place-popup-v2[data-hg-language-layer="1"] .hg-language-atlas-map-region{
  appearance:none;
  font:inherit;
  cursor:pointer;
}
body.hg-app .hg-place-popup-v2[data-hg-language-layer="1"] .hg-language-atlas-map-region:focus-visible,
body.hg-app .hg-place-popup-v2[data-hg-language-layer="1"] .hg-language-atlas-regions button:focus-visible{
  outline:2px solid rgba(255,225,104,.95);
  outline-offset:2px;
}
body.hg-app .hg-place-popup-v2[data-hg-language-layer="1"] .hg-language-atlas-map-region[aria-pressed="true"],
body.hg-app .hg-place-popup-v2[data-hg-language-layer="1"] .hg-language-atlas-macro.is-user-focused{
  border-color:rgba(246,200,0,.72);
  background:rgba(246,200,0,.12);
  box-shadow:0 0 0 1px rgba(246,200,0,.09) inset;
}
body.hg-app .hg-place-popup-v2[data-hg-language-layer="1"] .hg-language-atlas-regions button{
  appearance:none;
  padding:5px 7px;
  border:1px solid rgba(255,255,255,.075);
  border-radius:999px;
  background:transparent;
  color:rgba(255,255,255,.58);
  font:inherit;
  font-size:10px;
  cursor:pointer;
}
body.hg-app .hg-place-popup-v2[data-hg-language-layer="1"] .hg-language-atlas-regions button.is-active,
body.hg-app .hg-place-popup-v2[data-hg-language-layer="1"] .hg-language-atlas-regions button[aria-pressed="true"],
body.hg-app .hg-place-popup-v2[data-hg-language-layer="1"] .hg-language-atlas-regions button.is-user-focused{
  border-color:rgba(246,200,0,.46);
  background:rgba(246,200,0,.1);
  color:#ffe168;
}
body.hg-app .hg-place-popup-v2[data-hg-language-layer="1"] .hg-language-atlas-selection{
  display:grid;
  gap:5px;
  padding:10px 12px;
  border:1px solid rgba(246,200,0,.22);
  border-radius:14px;
  background:rgba(246,200,0,.055);
}
body.hg-app .hg-place-popup-v2[data-hg-language-layer="1"] .hg-language-atlas-selection[hidden]{display:none}
body.hg-app .hg-place-popup-v2[data-hg-language-layer="1"] .hg-language-atlas-selection>span{
  color:rgba(255,225,104,.72);
  font-size:9px;
  font-weight:900;
  letter-spacing:.06em;
  text-transform:uppercase;
}
body.hg-app .hg-place-popup-v2[data-hg-language-layer="1"] .hg-language-atlas-selection>strong{color:#fff;font-size:13px}
body.hg-app .hg-place-popup-v2[data-hg-language-layer="1"] .hg-language-atlas-selection>p{margin:0;color:rgba(255,255,255,.67);font-size:11px;line-height:1.5}
body.hg-app .hg-place-popup-v2[data-hg-language-layer="1"] .hg-language-atlas-selection>div{display:flex;flex-wrap:wrap;gap:6px}
body.hg-app .hg-place-popup-v2[data-hg-language-layer="1"] .hg-language-atlas-selection>div>span{padding:4px 6px;border:1px solid rgba(255,255,255,.08);border-radius:999px;color:rgba(255,255,255,.58);font-size:9px}'''
)

append_once(
    "docs/SPRAKLEKSIKON.md",
    "Interaktiv atlasnavigasjon",
    '''### Interaktiv atlasnavigasjon

Språkatlaset skal være en utforskbar kunnskapsflate, ikke bare en illustrasjon. De fire hovedgruppene i det skjematiske kartet er klikkbare og tastaturnavigerbare. Valg åpner «Utforsk hele Norge» og flytter brukeren til riktig makroregion. Underregionene er egne knapper; når en underregion velges, vises atlasets eksisterende `area_summary` og `feature_labels` som forklaring.

Interaksjonen oppretter ingen nye språkdata og endrer ikke canonical eierskap. Den navigerer bare i `norge_atlas_v1.json`; dialektoppføringer eies fortsatt utelukkende av `placeScope: "area"`.'''
)

append_once(
    "tests/place-language-dialect-scope.test.mjs",
    "Språkatlaset er klikkbart og tastaturnavigerbart",
    r'''test("Språkatlaset er klikkbart og tastaturnavigerbart uten å endre canonical eierskap", () => {
  const runtime = read("js/ui/place-language-layer.js");
  const css = read("css/place-language-layer.css");
  const contract = read("docs/SPRAKLEKSIKON.md");

  assert.match(runtime, /data-atlas-focus=/);
  assert.match(runtime, /data-atlas-region=/);
  assert.match(runtime, /role="group"/);
  assert.match(runtime, /function\s+activateAtlasSelection\s*\(/);
  assert.match(runtime, /details\.open\s*=\s*true/);
  assert.match(runtime, /scrollIntoView/);
  assert.match(runtime, /data-atlas-selection-summary/);
  assert.match(runtime, /aria-pressed/);
  assert.match(css, /hg-language-atlas-regions button/);
  assert.match(css, /focus-visible/);
  assert.match(contract, /Interaktiv atlasnavigasjon/);
  assert.match(contract, /oppretter ingen nye språkdata/i);
});'''
)
