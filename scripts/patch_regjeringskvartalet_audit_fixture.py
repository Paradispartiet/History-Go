from pathlib import Path

path = Path('tests/regjeringskvartalet-ui-production-audit.test.mjs')
text = path.read_text(encoding='utf-8')
old = '''  <script>
    window.showPlacePopup = () => {};
    window.HGLeksikon = { init: async () => {} };
    window.HGStories = { init: async () => {}, getByPlace: () => window.__stories || [] };
    window.DataHub = { loadLesespor: async () => window.LESESPOR || [] };
  </script>
  <script src="/js/ui/place-popup-tabs.js"></script>
  <script type="module">
    const [place, articles, stories, reading] = await Promise.all([
      fetch('/data/places/politikk/oslo/places_politikk/regjeringskvartalet.json').then(r => r.json()),
      fetch('/data/leksikon/places/oslo/politikk/leksikon_regjeringskvartalet.json').then(r => r.json()),
      fetch('/data/stories/stories_regjeringskvartalet.json').then(r => r.json()),
      fetch('/data/lesespor/oslo/lesespor_oslo_politikk.json').then(r => r.json())
    ]);
    window.PLACES = [place];
    window.LEKSIKON_BY_PLACE = { regjeringskvartalet: articles };
    window.__stories = stories;
    window.LESESPOR = Array.isArray(reading) ? reading : (reading.items || []);
    window.HGPlacePopupTabs.decoratePopup(place);
    window.__auditReady = true;
  </script>'''
new = '''  <script>
    window.showPlacePopup = () => {};
    window.PLACES = ${JSON.stringify([place])};
    window.LEKSIKON_BY_PLACE = { regjeringskvartalet: [] };
    window.__stories = [];
    window.LESESPOR = [];
    window.HGLeksikon = { init: async () => {} };
    window.HGStories = { init: async () => {}, getByPlace: () => window.__stories };
    window.DataHub = { loadLesespor: async () => window.LESESPOR };
  </script>
  <script src="/js/ui/place-popup-tabs.js"></script>
  <script>
    window.HGPlacePopupTabs.decoratePopup(window.PLACES[0]);
    window.__auditReady = true;
  </script>'''
if text.count(old) != 1:
    raise SystemExit(f'Expected one fixture block, found {text.count(old)}')
path.write_text(text.replace(old, new, 1), encoding='utf-8')
print('Regjeringskvartalet popup fixture patch: PASS')
