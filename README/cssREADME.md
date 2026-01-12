# History GO – CSS oversikt

## Lasting (viktig)
Typisk rekkefølge (fra HTML):
1) css/theme.css
2) css/base.css
3) css/layout.css
4) css/components.css
5) css/sheets.css (feature)
6) css/placeCard.css (feature)
7) css/nearby.css (feature)

Regel:
- Mer spesifikke selektorer vinner (f.eks. `body.hg-app header` vinner over `header`)
- Senere filer kan overstyre tidligere ved lik spesifisitet.

---

## Fil for fil – hva den eier

### theme.css (APP-UI, scopes med `body.hg-app`)
Eier:
- CSS-variabler (`:root`): farger, radius, shadow, etc.
- App-header/topplinje (`body.hg-app header`, `.brand`, `.actions`)
- Search UI (`#globalSearch`, `#searchResults`)
- Toast, modals, quiz, badges m.m.

Viktig:
- Alt som gjelder app-sider skal helst ligge her og være scoped:
  `body.hg-app ...`
- Hvis noe “ikke reagerer”, sjekk at `<body class="hg-app">` finnes på den siden.

---

### base.css (reset + typografi)
Eier:
- Enkle resets (`box-sizing`, margin)
- Standard font/line-height for generelle sider (ikke nødvendigvis app-scope)

Hold denne ren og kort.

---

### layout.css (struktur: header/main/panel)
Eier:
- Generelle layout-regler for sider uten `hg-app` (global `header`, `main`, `.panel`)
- Enkle flex-/posisjon-regler

Viktig:
- Unngå å duplisere app-header her hvis appen bruker `theme.css`.
- Bruk layout.css primært til “ikke-app” sider.

---

### components.css (UI-komponenter)
Eier:
- Panel/kort/grid
- Buttons, chips/badges (generelle)
- Gallery/personkort (generelle)

Regel:
- Komponenter som brukes flere steder = her.
- Side/feature-spesifikt = IKKE her.

---

### sheets.css (bunnark)
Eier:
- `.sheet`, `.sheet-head`, `.sheet-body`, `.sheet-close`
Brukes av “Se flere i nærheten”/bottom sheets.

---

### placeCard.css (PlaceCard bottom sheet)
Eier:
- Hele `#placeCard`-komponenten
- `.pc-main`, `#pcPeople`, `.pc-actions`, miniProfile-inne-i-placecard
Mål:
- Ingen duplikater, én “source of truth” for placeCard.

---

### nearby.css (left panel: nearby/routes/badges)
Eier:
- `#nearbyListContainer` og alt inni
- Header-offset variabler (`--hg-header-h`) for å ligge under topplinja
- Horisontal “strip”-mode for nearbys

---

## Praktiske regler (for å holde det ryddig)
1) App = `body.hg-app ...` i theme.css når mulig.
2) Feature-filer (placeCard/nearby/sheets) skal eie sine egne komponenter fullt ut.
3) Unngå at samme selector finnes i 2–3 filer (klassisk kilde til “mystiske” bugs).
4) Når noe overlapper med header:
   - endre header i theme.css
   - oppdater `--hg-header-h` i nearby.css hvis paneler bruker den

---

## “Hvor legger jeg nye ting?”
- Topplinje/search/toast: theme.css
- Kun layout/rammeverk: layout.css
- Gjenbrukbare knapper/kort: components.css
- Bottom sheet: sheets.css
- Place card: placeCard.css
- Nearby-panel: nearby.css
