from pathlib import Path

source_path = Path(".github/scripts/finalize_nearby_filters.py")
source = source_path.read_text()

for marker in (
    "window.HGNearbyFilters?.getBadgeOptions?.()",
    "window.HGNearbyFilters?.getActiveBadgeFilter?.()",
    "window.HGNearbyFilters?.isBadgeFilterActive?.()",
):
    needle = f"    '{marker}'\n)"
    replacement = f"    '{marker}',\n    re.S\n)"
    if needle not in source and replacement not in source:
        raise SystemExit(f"Could not patch multiline regex flag for {marker}")
    source = source.replace(needle, replacement, 1)

exec(compile(source, str(source_path), "exec"))
