# Lesespor CSS loading hotfix

Root cause: Lesespor-specific styling was introduced in `css/lesespor.css`, but the stylesheet request only started from `initHeaderMenu()` at DOMContentLoaded. That made the visual/scroll fix unnecessarily dependent on runtime order and stale asset caching.

Hotfix:
- start the Lesespor stylesheet request immediately when `header-menu.js` evaluates
- resolve the stylesheet against `document.baseURI`
- add a version query to invalidate stale CSS cache
- avoid duplicate stylesheet insertion
- log a targeted warning if the stylesheet fails to load

No Lesespor data or filtering logic is changed.
