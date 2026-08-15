from pathlib import Path
import runpy

# Midlertidig wrapper: behold hjelpefilene i worktree slik at Actions bare kan eksportere den validerte faglige patchen.
ORIGINAL_UNLINK = Path.unlink
ROOT = Path(__file__).resolve().parents[1]
PROTECTED = {
    (ROOT / ".github/workflows/agent-write-smoke.yml").resolve(),
    (ROOT / "scripts/agent_direct_tabs_patch.py").resolve(),
    (ROOT / "scripts/agent_direct_tabs_patch_keep_helpers.py").resolve(),
}


def guarded_unlink(self, *args, **kwargs):
    try:
        resolved = self.resolve()
    except Exception:
        resolved = self
    if resolved in PROTECTED:
        return None
    return ORIGINAL_UNLINK(self, *args, **kwargs)


Path.unlink = guarded_unlink
runpy.run_path(str(ROOT / "scripts/agent_direct_tabs_patch.py"), run_name="__main__")
